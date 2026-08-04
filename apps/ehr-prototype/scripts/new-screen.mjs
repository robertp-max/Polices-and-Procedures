#!/usr/bin/env node
/**
 * new-screen.mjs — scaffold a new screen that follows this app's conventions.
 *
 *   node scripts/new-screen.mjs <Name> [--prefix xyz] [--dry-run]
 *
 * Writes src/screens/<Name>Screen.tsx + src/screens/<prefix>.css from
 * idiomatic templates, then prints the follow-up steps it deliberately
 * does NOT do (route registration, prefix registry, verification gate).
 * Never overwrites existing files.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS = path.join(ROOT, 'src', 'screens')

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const prefixFlag = argv.indexOf('--prefix')
const explicitPrefix = prefixFlag !== -1 ? argv[prefixFlag + 1] : null
const name = argv.find(a => !a.startsWith('--') && a !== explicitPrefix)

function die(msg) {
  console.error(`error: ${msg}`)
  process.exit(1)
}

if (!name) die('usage: node scripts/new-screen.mjs <Name> [--prefix xyz] [--dry-run]')
if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) die(`name must be PascalCase (got "${name}")`)

const prefix = (explicitPrefix ?? name.toLowerCase().replace(/screen$/, '').slice(0, 6))
if (!/^[a-z][a-z0-9]{1,11}$/.test(prefix)) die(`prefix must be short lowercase (got "${prefix}")`)

// Collision checks against existing stylesheets and the guardrail registry.
const existingCss = fs.existsSync(SCREENS) ? fs.readdirSync(SCREENS).filter(f => f.endsWith('.css')) : []
if (existingCss.includes(`${prefix}.css`)) die(`prefix "${prefix}" collides with existing ${prefix}.css — pass --prefix`)

const tsxPath = path.join(SCREENS, `${name}Screen.tsx`)
const cssPath = path.join(SCREENS, `${prefix}.css`)
if (fs.existsSync(tsxPath)) die(`${path.relative(ROOT, tsxPath)} already exists — refusing to overwrite`)
if (fs.existsSync(cssPath)) die(`${path.relative(ROOT, cssPath)} already exists — refusing to overwrite`)

const tsx = `import { useState } from 'react'
import { ClipboardList, Inbox } from 'lucide-react'
import { EmptyState, StatCard, StatusChip } from '../ui'
import './${prefix}.css'

// TODO: read docs/UIUX-FRAMEWORK.md and the live gallery at /#/design-system
// before styling. Reuse the src/ui kit and base.css utilities first;
// only add .${prefix}- classes for what genuinely doesn't exist yet.

export default function ${name}Screen() {
  const [items] = useState<string[]>([])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1 className="screen-title">${name}</h1>
          <div className="screen-sub">One-line description of this workspace.</div>
        </div>
        <div className="screen-actions">
          <button className="btn btn-secondary">Secondary action</button>
          <button className="btn btn-primary">Primary action</button>
        </div>
      </div>

      <div className="${prefix}-stats">
        <StatCard
          icon={<ClipboardList size={16} strokeWidth={1.75} />}
          kicker="Kicker"
          value="0"
          sub="Supporting sentence"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="${name} list">
        {items.length === 0 ? (
          <EmptyState
            icon={<Inbox size={26} strokeWidth={1.5} />}
            title="Nothing here yet"
            sub="Wire real synthetic data from src/data before shipping."
          />
        ) : (
          <div className="${prefix}-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Item</th><th>Status</th></tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item}>
                    <td>{item}</td>
                    <td><StatusChip tone="neutral">Draft</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
`

const css = `/* ${name} screen — all classes prefixed .${prefix}- (registered in scripts/verify-design.mjs) */

.${prefix}-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 1280px) { .${prefix}-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

/* Wide tables scroll inside the card — the page body never scrolls sideways. */
.${prefix}-table-wrap { overflow-x: auto; }
`

if (dryRun) {
  console.log(`[dry-run] would write ${path.relative(ROOT, tsxPath)} (${tsx.length} bytes)`)
  console.log(`[dry-run] would write ${path.relative(ROOT, cssPath)} (${css.length} bytes)`)
} else {
  fs.writeFileSync(tsxPath, tsx)
  fs.writeFileSync(cssPath, css)
  console.log(`wrote ${path.relative(ROOT, tsxPath)}`)
  console.log(`wrote ${path.relative(ROOT, cssPath)}`)
}

console.log(`
NOT done for you — finish these:
1. Register the route in src/App.tsx (inside the AppShell group):
     import ${name}Screen from './screens/${name}Screen'
     <Route path="/${prefix}" element={<${name}Screen />} />
2. Register the prefix in scripts/verify-design.mjs PREFIX_REGISTRY:
     '${prefix}.css': ['${prefix}'],
3. Add a navigation item in src/data/navigation.ts (status 'built').
4. Run the gate: npx tsc --noEmit -p . && node scripts/verify-design.mjs
   then load the route in the browser and check the console.`)
