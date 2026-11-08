const path = require('path')
const fs = require('fs')
const ts = require('typescript')
const webpack = require('next/dist/compiled/webpack/webpack.js').webpack

const srcPath = path.resolve(__dirname, '../app/sw.ts')
const outDir = path.resolve(__dirname, '../public')
const tmpJs = path.resolve(__dirname, '../app/sw.tmp.js')

// 1. Transpile TS -> JS using TypeScript
const tsCode = fs.readFileSync(srcPath, 'utf8')
const jsCode = ts.transpileModule(tsCode, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
}).outputText

fs.writeFileSync(tmpJs, jsCode, 'utf8')

const terser = require('next/dist/compiled/terser')

class TerserPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('TerserPlugin', (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: 'TerserPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,
        },
        async (assets) => {
          for (const [name, asset] of Object.entries(assets)) {
            if (name.endsWith('.js')) {
              const res = await terser.minify(asset.source().toString(), {
                compress: true,
                mangle: true,
              })
              compilation.updateAsset(
                name,
                new compiler.webpack.sources.RawSource(res.code)
              )
            }
          }
        }
      )
    })
  }
}

// 2. Bundle using Next's internal webpack
webpack(
  {
    mode: 'production',
    entry: tmpJs,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
    output: {
      path: outDir,
      filename: 'sw.js',
    },
    resolve: {
      extensions: ['.js', '.mjs'],
    },
    target: 'webworker',
  },
  (err, stats) => {
    fs.unlinkSync(tmpJs)
    if (err || stats.hasErrors()) {
      console.error(err || stats.toJson().errors)
      process.exit(1)
    }
    console.log(
      'sw.js built successfully! File size:',
      fs.statSync(path.join(outDir, 'sw.js')).size,
      'bytes',
    )
  },
)

