import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'screens')
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.tsx'))) {
  const p = path.join(dir, f)
  let c = fs.readFileSync(p, 'utf8')
  const n = c
    .replaceAll('accent="progress"', 'accent="teal"')
    .replaceAll("accent='progress'", "accent='teal'")
    .replaceAll('accent="neutral"', 'accent="teal"')
    .replaceAll("accent='neutral'", "accent='teal'")
  if (n !== c) {
    fs.writeFileSync(p, n)
    console.log('fixed', f)
  }
}
