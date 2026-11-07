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

// 2. Bundle using Next's internal webpack
webpack(
  {
    mode: 'production',
    entry: tmpJs,
    optimization: {
      minimize: false,
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

