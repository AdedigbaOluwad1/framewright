import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { getIcons } from '@iconify/utils'

const require = createRequire(import.meta.url)
const collection = require('@iconify-json/hugeicons/icons.json')
const PREFIX = 'hugeicons'
const OUTPUT = 'src/shared/icons/hugeicons.generated.ts'

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return walk(path)
    return /\.(tsx?|jsx?)$/.test(name) && !path.endsWith('.generated.ts')
      ? [path]
      : []
  })
}

const used = new Set()
for (const file of walk('src')) {
  for (const match of readFileSync(file, 'utf8').matchAll(
    /hugeicons:([a-z0-9-]+)/g,
  )) {
    used.add(match[1])
  }
}

const missing = [...used].filter(
  (name) =>
    !(name in collection.icons) && !(name in (collection.aliases ?? {})),
)
if (missing.length > 0) {
  console.error(`Unknown hugeicons: ${missing.join(', ')}`)
  process.exit(1)
}

const subset = getIcons(collection, [...used].sort())
const body = `import { addCollection } from '@iconify/react'\n\naddCollection(${JSON.stringify(subset)})\n`
writeFileSync(OUTPUT, body)
console.log(`Bundled ${used.size} hugeicons into ${OUTPUT}`)
