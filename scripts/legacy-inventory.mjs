#!/usr/bin/env node
/**
 * legacy-inventory.mjs
 *
 * Scans src/policy/** for known visual-contract violations and legacy
 * component usage, and emits a machine-readable baseline + a Markdown
 * report at:
 *   _Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/Implementation/Phase0/PHASE0_BASELINE.md
 *
 * Usage:
 *   node scripts/legacy-inventory.mjs            # write report + baseline JSON
 *   node scripts/legacy-inventory.mjs --assert   # exit 1 if any count > baseline
 *
 * Deletion-only ratchet: once the baseline JSON exists, --assert blocks any
 * regression. Update the baseline only by lowering counts (PR-reviewed).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(REPO_ROOT, 'src', 'policy');
const OUT_DIR = path.join(
  REPO_ROOT,
  '_Heavy',
  'Fix-2026-05-14',
  'ForGrok',
  'UIUX_Audit',
  'mockup',
  'Implementation',
  'Phase0',
);
const REPORT_PATH = path.join(OUT_DIR, 'PHASE0_BASELINE.md');
const BASELINE_PATH = path.join(OUT_DIR, 'PHASE0_BASELINE.json');

const SCAN_EXT = new Set(['.ts', '.tsx', '.css', '.scss']);
const SKIP_DIR = new Set(['node_modules', '.git', 'dist', 'build', 'autogen']);

// --- Detectors ---------------------------------------------------------------

const LEGACY_IMPORT_PATTERNS = [
  { name: 'CesCard',                 re: /from\s+['"][^'"]*CesCard['"]/g },
  { name: 'CesLayout',               re: /from\s+['"][^'"]*CesLayout['"]/g },
  { name: 'SCard',                   re: /from\s+['"][^'"]*\/SCard['"]/g },
  { name: 'GenericSectionPanel',     re: /from\s+['"][^'"]*GenericSectionPanel['"]/g },
  { name: 'PmTaskCard',              re: /from\s+['"][^'"]*PmTaskCard['"]/g },
  { name: 'StatusBadge (legacy)',    re: /from\s+['"][^'"]*\/StatusBadge['"]/g },
  { name: 'CesEvidenceHierarchyPanel', re: /from\s+['"][^'"]*CesEvidenceHierarchyPanel['"]/g },
  { name: 'iAdministrator subtree',  re: /from\s+['"][^'"]*\/iAdministrator\//g },
];

const LEGACY_CLASS_PATTERNS = [
  { name: '.glass-interactive-lib',  re: /glass-interactive-lib/g },
  { name: '.glass-panel-lib',        re: /glass-panel-lib/g },
  { name: 'ci-premium-*',            re: /\bci-premium-[a-z0-9-]+/g },
];

const SHELL_FRAME_VIOLATIONS = [
  { name: 'h-full w-full at root',   re: /className\s*=\s*["'`][^"'`]*\bh-full\s+w-full\b/g },
  { name: '-mx-3 / -mx-4 / -mx-6',   re: /\b-mx-(?:3|4|6)\b/g },
  { name: 'bg-white container',      re: /className\s*=\s*["'`][^"'`]*\bbg-white\b/g },
  { name: 'bg-ci-bg fill',           re: /\bbg-ci-bg\b/g },
];

const RAW_VALUES = [
  { name: 'hex literal in code',     re: /#(?:[0-9a-fA-F]{3}){1,2}\b/g, fileFilter: f => f.endsWith('.ts') || f.endsWith('.tsx') },
  { name: 'arbitrary Tailwind value', re: /className\s*=\s*["'`][^"'`]*\[[^\]\s]+\]/g },
];

const BACKUP_FILES = {
  name: '.old files',
  match: f => /\.old\.(tsx?|jsx?|css)$/i.test(f) || /\.old$/i.test(f),
};

const DIALECT_TREES = [
  { name: 'ces/ tree files',          dir: 'ces' },
  { name: 'onboarding-v2/ tree files', dir: 'onboarding-v2' },
  { name: 'ecign/ tree files',        dir: 'ecign' },
];

// --- Walker ------------------------------------------------------------------

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function countMatches(text, re) {
  const m = text.match(re);
  return m ? m.length : 0;
}

// --- Scan --------------------------------------------------------------------

function scan() {
  const result = {
    scannedAt: new Date().toISOString(),
    root: path.relative(REPO_ROOT, SRC_ROOT).replace(/\\/g, '/'),
    files: 0,
    legacyImports: Object.fromEntries(LEGACY_IMPORT_PATTERNS.map(p => [p.name, { count: 0, files: new Set() }])),
    legacyClasses: Object.fromEntries(LEGACY_CLASS_PATTERNS.map(p => [p.name, { count: 0, files: new Set() }])),
    shellFrameViolations: Object.fromEntries(SHELL_FRAME_VIOLATIONS.map(p => [p.name, { count: 0, files: new Set() }])),
    rawValues: Object.fromEntries(RAW_VALUES.map(p => [p.name, { count: 0, files: new Set() }])),
    backupFiles: { count: 0, files: [] },
    dialectTrees: Object.fromEntries(DIALECT_TREES.map(d => [d.name, 0])),
  };

  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`Source root not found: ${SRC_ROOT}`);
    process.exit(2);
  }

  for (const file of walk(SRC_ROOT)) {
    const rel = path.relative(REPO_ROOT, file).replace(/\\/g, '/');
    const base = path.basename(file);
    const ext = path.extname(file).toLowerCase();

    // backup files
    if (BACKUP_FILES.match(base)) {
      result.backupFiles.count++;
      result.backupFiles.files.push(rel);
    }

    // dialect tree counts
    for (const d of DIALECT_TREES) {
      const marker = `${path.sep}${d.dir}${path.sep}`;
      if (file.includes(marker)) result.dialectTrees[d.name]++;
    }

    if (!SCAN_EXT.has(ext)) continue;
    result.files++;
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }

    for (const p of LEGACY_IMPORT_PATTERNS) {
      const n = countMatches(text, p.re);
      if (n) { result.legacyImports[p.name].count += n; result.legacyImports[p.name].files.add(rel); }
    }
    for (const p of LEGACY_CLASS_PATTERNS) {
      const n = countMatches(text, p.re);
      if (n) { result.legacyClasses[p.name].count += n; result.legacyClasses[p.name].files.add(rel); }
    }
    for (const p of SHELL_FRAME_VIOLATIONS) {
      const n = countMatches(text, p.re);
      if (n) { result.shellFrameViolations[p.name].count += n; result.shellFrameViolations[p.name].files.add(rel); }
    }
    for (const p of RAW_VALUES) {
      if (p.fileFilter && !p.fileFilter(file)) continue;
      const n = countMatches(text, p.re);
      if (n) { result.rawValues[p.name].count += n; result.rawValues[p.name].files.add(rel); }
    }
  }

  // serialize Sets
  const serializeBucket = (bucket) => Object.fromEntries(
    Object.entries(bucket).map(([k, v]) => [k, { count: v.count, fileCount: v.files.size }]),
  );

  return {
    meta: { scannedAt: result.scannedAt, root: result.root, filesScanned: result.files },
    legacyImports: serializeBucket(result.legacyImports),
    legacyClasses: serializeBucket(result.legacyClasses),
    shellFrameViolations: serializeBucket(result.shellFrameViolations),
    rawValues: serializeBucket(result.rawValues),
    backupFiles: { count: result.backupFiles.count, files: result.backupFiles.files },
    dialectTrees: result.dialectTrees,
  };
}

// --- Report ------------------------------------------------------------------

function renderTable(title, bucket) {
  const rows = Object.entries(bucket)
    .map(([k, v]) => `| ${k} | ${v.count} | ${v.fileCount} |`)
    .join('\n');
  return `### ${title}\n\n| Pattern | Occurrences | Files |\n|---|---:|---:|\n${rows}\n`;
}

function totalOf(bucket) {
  return Object.values(bucket).reduce((s, v) => s + (v.count || 0), 0);
}

function renderReport(data) {
  const totalLegacyImports = totalOf(data.legacyImports);
  const totalLegacyClasses = totalOf(data.legacyClasses);
  const totalShellViolations = totalOf(data.shellFrameViolations);
  const totalRawValues = totalOf(data.rawValues);
  const totalDialect = Object.values(data.dialectTrees).reduce((a, b) => a + b, 0);

  return `# Phase 0 Baseline — Legacy Inventory

**Scanned:** ${data.meta.scannedAt}
**Root:** \`${data.meta.root}\`
**Files scanned:** ${data.meta.filesScanned}

> Machine-generated by \`scripts/legacy-inventory.mjs\`. Do not edit by hand.
> Companion machine-readable file: \`PHASE0_BASELINE.json\`.

## Headline Numbers

| Bucket | Total occurrences |
|---|---:|
| Legacy component imports | **${totalLegacyImports}** |
| Legacy CSS classes | **${totalLegacyClasses}** |
| Shell-frame violations | **${totalShellViolations}** |
| Raw value usage | **${totalRawValues}** |
| Backup \`.old\` files | **${data.backupFiles.count}** |
| Dialect tree files (CES + Onboarding V2 + eCign) | **${totalDialect}** |

These numbers are the **non-falsifiable baseline** for the Phase 4 success metric
("≥35% reduction in legacy UI surface area").

${renderTable('Legacy Component Imports', data.legacyImports)}
${renderTable('Legacy CSS Classes', data.legacyClasses)}
${renderTable('Shell-Frame Violations', data.shellFrameViolations)}
${renderTable('Raw Values', data.rawValues)}

### Dialect Trees (file counts)

| Tree | Files |
|---|---:|
${Object.entries(data.dialectTrees).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

### Backup \`.old\` Files

Count: **${data.backupFiles.count}**

${data.backupFiles.files.length ? data.backupFiles.files.map(f => `- \`${f}\``).join('\n') : '_None._'}

## Ratchet

Once committed, \`PHASE0_BASELINE.json\` is the deletion-only ratchet.
Run \`node scripts/legacy-inventory.mjs --assert\` in CI; it exits 1 if any
count exceeds the baseline. Lowering the baseline requires a PR with
the new \`PHASE0_BASELINE.json\` and a corresponding deletion diff.
`;
}

// --- Main --------------------------------------------------------------------

function flattenForAssert(data) {
  const out = {};
  for (const bucket of ['legacyImports', 'legacyClasses', 'shellFrameViolations', 'rawValues']) {
    for (const [k, v] of Object.entries(data[bucket])) out[`${bucket}.${k}`] = v.count;
  }
  out['backupFiles'] = data.backupFiles.count;
  for (const [k, v] of Object.entries(data.dialectTrees)) out[`dialectTrees.${k}`] = v;
  return out;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const data = scan();

  if (args.has('--assert')) {
    if (!fs.existsSync(BASELINE_PATH)) {
      console.error(`Baseline missing: ${BASELINE_PATH}. Run without --assert first.`);
      process.exit(2);
    }
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    const current = flattenForAssert(data);
    const baseFlat = flattenForAssert(baseline);
    const regressions = [];
    for (const [k, v] of Object.entries(current)) {
      const b = baseFlat[k] ?? 0;
      if (v > b) regressions.push(`  ${k}: ${b} → ${v} (+${v - b})`);
    }
    if (regressions.length) {
      console.error('Legacy inventory regressed:\n' + regressions.join('\n'));
      process.exit(1);
    }
    console.log('Legacy inventory OK (no regressions vs baseline).');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(data, null, 2));
  fs.writeFileSync(REPORT_PATH, renderReport(data));
  console.log(`Wrote ${path.relative(REPO_ROOT, REPORT_PATH)}`);
  console.log(`Wrote ${path.relative(REPO_ROOT, BASELINE_PATH)}`);
  console.log(`Files scanned: ${data.meta.filesScanned}`);
}

main();
