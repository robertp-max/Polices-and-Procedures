#!/usr/bin/env node
/**
 * verify-design.mjs — design-system guardrail for the CI Home Health EHR prototype.
 *
 * Zero dependencies (Node built-ins only, Windows-safe). Checks src/ for the
 * rules in AGENTS.md / docs/UIUX-FRAMEWORK.md and exits 1 on any error.
 *
 *   node scripts/verify-design.mjs [--json] [--quiet]
 *
 * Rules:
 *   R1  no raw hex colours outside tokens.css (small audited allowlist)
 *   R2  no blue (blue-dominant hex or blue CSS keywords; teal is brand, not blue)
 *   R3  no smooth scrolling (silently no-ops on this app's scrollers)
 *   R4  per-screen stylesheet class-prefix discipline
 *   R5  no compiled .js in src/ (shadows .tsx under Vite)
 *   R6  type-only imports from data/types must use `import type`
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')

const args = new Set(process.argv.slice(2))
const JSON_OUT = args.has('--json')
const QUIET = args.has('--quiet')

/** Screen stylesheet → required class prefixes. Register new screens here. */
const PREFIX_REGISTRY = {
  'bill.css': ['bill'],
  'bp.css': ['bp'],
  'chart.css': ['chart'],
  'clin.css': ['clin'],
  'domain.css': ['dom'],
  'ds.css': ['ds'],
  'intake.css': ['intake'],
  'mvp-policy.css': ['mvp'],
  'ord.css': ['ord'],
  'pts.css': ['pts'],
  'qual.css': ['qual'],
  'rep.css': ['rep'],
  // req.css also styles .doc-content: it opts out of DocShell's centered column.
  'req.css': ['req', 'doc'],
  'sched.css': ['sched'],
  // Legacy: today.css predates the prefix convention.
  'today.css': ['slice', 'queue', 'brad', 'today', 'visit'],
}

/**
 * Audited allowlist for raw colour values outside tokens.css.
 * Every entry needs a reason — do not grow this casually.
 */
const HEX_ALLOWLIST = new Set([
  '#fff', '#ffffff', // pure white on filled/dark surfaces; identical to --surface
  '#ffd9c7', // req.css: on-dark chip ink for the rail gate chip (deliberate pairing)
])

const BLUE_KEYWORDS = /\b(?:blue|navy|dodgerblue|royalblue|steelblue|cornflowerblue|lightblue|skyblue|midnightblue|slateblue|cadetblue|deepskyblue)\b/i

const findings = [] // {rule, file, line, text, fix, level}

function add(rule, level, file, line, text, fix) {
  findings.push({ rule, level, file: path.relative(ROOT, file).replaceAll('\\', '/'), line, text: text.trim().slice(0, 120), fix })
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else yield full
  }
}

const files = [...walk(SRC)]
const cssFiles = files.filter(f => f.endsWith('.css'))
const tsxFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))

/* ---------- R1 + R2: raw hex / blue in CSS (tokens.css exempt from R1) ---------- */

const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g

function isBlueDominant(hex) {
  let h = hex.slice(1)
  if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  // Blue clearly dominating both channels reads as "blue" — teal has g≈b so it passes.
  return b > r + 24 && b > g + 24
}

for (const file of cssFiles) {
  const isTokens = file.replaceAll('\\', '/').endsWith('styles/tokens.css')
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((lineText, i) => {
    for (const m of lineText.matchAll(HEX_RE)) {
      const hex = m[0].toLowerCase()
      if (!isTokens && !HEX_ALLOWLIST.has(hex)) {
        add('R1 raw-hex', 'error', file, i + 1, lineText,
          `Use a var(--token) from tokens.css instead of ${hex} (or add an audited allowlist entry with a reason).`)
      }
      if (isBlueDominant(hex)) {
        add('R2 no-blue', 'error', file, i + 1, lineText,
          `${hex} is blue-dominant — the CI brand defines no blue. Use teal or orange ramps.`)
      }
    }
    if (BLUE_KEYWORDS.test(lineText)) {
      add('R2 no-blue', 'error', file, i + 1, lineText,
        'Blue CSS colour keyword — the CI brand defines no blue.')
    }
  })
}

/* ---------- R3: smooth scrolling ---------- */

const SMOOTH_RE = /behavior:\s*['"]smooth['"]|scroll-behavior:\s*smooth/
for (const file of [...cssFiles, ...tsxFiles]) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((lineText, i) => {
    if (SMOOTH_RE.test(lineText)) {
      add('R3 no-smooth-scroll', 'error', file, i + 1, lineText,
        "Smooth scrolling silently no-ops on this app's nested scrollers — scroll instantly (no behavior option).")
    }
  })
}

/* ---------- R4: class-prefix discipline in screen stylesheets ---------- */

const screensDir = path.join(SRC, 'screens')
if (fs.existsSync(screensDir)) {
  for (const file of fs.readdirSync(screensDir).filter(f => f.endsWith('.css'))) {
    const prefixes = PREFIX_REGISTRY[file]
    const full = path.join(screensDir, file)
    if (!prefixes) {
      add('R4 prefix-registry', 'error', full, 1, file,
        `Screen stylesheet ${file} is not in PREFIX_REGISTRY — register its class prefix in scripts/verify-design.mjs.`)
      continue
    }
    const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/)
    lines.forEach((lineText, i) => {
      // Only top-level class definitions at line start (selector position).
      const m = /^\s*\.([a-z][a-z0-9]*)-/.exec(lineText)
      if (!m) return
      if (!prefixes.includes(m[1])) {
        add('R4 class-prefix', 'error', full, i + 1, lineText,
          `Class .${m[1]}-… defined in ${file} must use its registered prefix (${prefixes.map(p => '.' + p + '-').join(', ')}).`)
      }
    })
  }
}

/* ---------- R5: compiled .js inside src/ ---------- */

for (const file of files.filter(f => f.endsWith('.js'))) {
  add('R5 shadow-js', 'error', file, 1, path.basename(file),
    'Compiled .js inside src/ shadows the .tsx under Vite — delete it; never run raw `tsc <file>`.')
}

/* ---------- R6: type-only imports ---------- */

const TYPE_IMPORT_RE = /^\s*import\s*\{[^}]*\}\s*from\s*['"](\.{1,2}\/)*data\/types['"]/
for (const file of tsxFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
  lines.forEach((lineText, i) => {
    if (TYPE_IMPORT_RE.test(lineText) && !/^\s*import\s+type\b/.test(lineText)) {
      add('R6 import-type', 'error', file, i + 1, lineText,
        'data/types exports types only — use `import type { … }` (verbatimModuleSyntax fails otherwise).')
    }
  })
}

/* ---------- Report ---------- */

const errors = findings.filter(f => f.level === 'error')
const warnings = findings.filter(f => f.level === 'warn')

if (JSON_OUT) {
  console.log(JSON.stringify({ errors: errors.length, warnings: warnings.length, findings }, null, 2))
} else {
  const byRule = new Map()
  for (const f of findings) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, [])
    byRule.get(f.rule).push(f)
  }
  for (const [rule, list] of byRule) {
    console.log(`\n${rule} — ${list.length} finding(s)`)
    if (!QUIET) {
      for (const f of list) {
        console.log(`  ${f.file}:${f.line}  ${f.text}`)
        console.log(`    fix: ${f.fix}`)
      }
    }
  }
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s) across ${files.length} files`)
  if (errors.length === 0) console.log('Design guardrail: PASS')
}

process.exit(errors.length > 0 ? 1 : 0)
