const fs = require('fs')
const path = require('path')

const serverFiles = [
  'components/setup/setupActions.ts',
  'components/widgets/entryActions.ts',
  'components/widgets/widgetActions.ts',
]

function resolveImport(fromFile, importPath) {
  let target = importPath
  if (target.startsWith('@/')) {
    target = target.replace('@/', './')
  } else if (target.startsWith('.')) {
    target = path.join(path.dirname(fromFile), target)
  } else {
    return null // External package
  }
  target = path.normalize(target).replace(/\\/g, '/')
  const candidates = [
    target + '.ts',
    target + '.tsx',
    target + '/index.ts',
    target + '/index.tsx',
    target,
  ]
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) {
      return c
    }
  }
  return null
}

const visited = new Set()
const violations = []

function walk(file, chain = []) {
  if (visited.has(file)) return
  visited.add(file)

  const content = fs.readFileSync(file, 'utf-8')
  if (content.includes("'use client'") || content.includes('"use client"')) {
    violations.push({ file, chain })
    return
  }

  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/)
    if (match) {
      const imp = match[1]
      const resolved = resolveImport(file, imp)
      if (resolved) {
        walk(resolved, [...chain, file])
      }
    }
  }
}

for (const sf of serverFiles) {
  const content = fs.readFileSync(sf, 'utf-8')
  const lines = content.split('\n')
  for (const line of lines) {
    const match = line.match(/from\s+['"]([^'"]+)['"]/)
    if (match) {
      const imp = match[1]
      const resolved = resolveImport(sf, imp)
      if (resolved) {
        walk(resolved, [sf])
      }
    }
  }
}

console.log('Transitive violations found:', JSON.stringify(violations, null, 2))
