/**
 * Phase 4 closure (2026-05-18) — one-shot, idempotent token migration.
 * --------------------------------------------------------------------
 * Migrates the 40+ identical-string raw-color / Tailwind-arbitrary-opacity
 * patterns in src/policy/components/regulatory/WorkflowExecutionPanel.tsx
 * to the canonical Phase 3 design-system tokens. Each pattern below was
 * verified by ESLint `no-restricted-syntax` against the Phase 4 guardrails
 * declared in eslint.config.js.
 *
 * Runtime alpha-composition patterns (`${stateColor}55`, `${accent}1a`,
 * `${accent}22`, `${auditStateColor}18`) are LEFT UNCHANGED — they encode
 * legitimate dynamic design intent and are exempted as scoped exceptions
 * per Phase4_Current_Reality_Report.md §3.
 *
 * Usage:   node scripts/phase4-migrate-workflow-execution-panel.cjs
 * Idempotent: re-running on an already-migrated file is a no-op.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(
  __dirname,
  '..',
  'src',
  'policy',
  'components',
  'regulatory',
  'WorkflowExecutionPanel.tsx',
);

// Each entry: [exact match pattern (literal), canonical replacement, expected count, label]
// Counts are sanity-bounds from the 2026-05-18 baseline; mismatch aborts the run.
const REPLACEMENTS = [
  // Inline-style borderColor — overlay-border family
  [
    "borderColor: 'rgba(255,255,255,0.06)'",
    "borderColor: 'var(--ci-overlay-border)'",
    2,
    'borderColor 0.06',
  ],
  [
    "borderColor: 'rgba(255,255,255,0.08)'",
    "borderColor: 'var(--ci-overlay-border)'",
    17,
    'borderColor 0.08',
  ],
  [
    "borderColor: 'rgba(255,255,255,0.10)'",
    "borderColor: 'var(--ci-overlay-border-strong)'",
    null,
    'borderColor 0.10',
  ],
  [
    "borderColor: 'rgba(255,255,255,0.1)'",
    "borderColor: 'var(--ci-overlay-border-strong)'",
    null,
    'borderColor 0.1',
  ],
  // Inline-style background — overlay tint family
  [
    "background: 'rgba(255,255,255,0.015)'",
    "background: 'var(--ci-overlay-faint)'",
    1,
    'background 0.015',
  ],
  [
    "background: 'rgba(255,255,255,0.02)'",
    "background: 'var(--ci-overlay-faint)'",
    4,
    'background 0.02',
  ],
  [
    "background: 'rgba(255,255,255,0.05)'",
    "background: 'var(--ci-overlay-soft)'",
    1,
    'background 0.05',
  ],
  // Arbitrary Tailwind opacity utilities — canonical ci-bg-overlay-* utilities
  ['bg-white/[0.02]', 'ci-bg-overlay-faint', 1, 'bg-white/[0.02]'],
  ['bg-white/[0.03]', 'ci-bg-overlay-faint', 5, 'bg-white/[0.03]'],
  ['bg-white/[0.05]', 'ci-bg-overlay-soft', 3, 'bg-white/[0.05]'],
  ['hover:bg-white/[0.05]', 'ci-bg-overlay-soft-hover', 3, 'hover:bg-white/[0.05]'],
  ['hover:bg-white/[0.06]', 'ci-bg-overlay-soft-hover', 1, 'hover:bg-white/[0.06]'],
];

function countOccurrences(haystack, needle) {
  if (needle.length === 0) return 0;
  let count = 0;
  let idx = 0;
  while ((idx = haystack.indexOf(needle, idx)) !== -1) {
    count += 1;
    idx += needle.length;
  }
  return count;
}

function replaceAll(haystack, needle, replacement) {
  return haystack.split(needle).join(replacement);
}

function main() {
  if (!fs.existsSync(FILE)) {
    console.error('FATAL: target file does not exist:', FILE);
    process.exit(1);
  }
  const original = fs.readFileSync(FILE, 'utf8');
  let next = original;
  let totalReplaced = 0;
  const report = [];

  for (const [needle, replacement, expected, label] of REPLACEMENTS) {
    const found = countOccurrences(next, needle);
    if (expected !== null && found !== expected && found !== 0) {
      console.error(
        `ABORT: ${label} expected ${expected} matches, found ${found}. Aborting to avoid silent drift.`,
      );
      process.exit(2);
    }
    if (found === 0) {
      report.push(`  - ${label}: 0 (already migrated or absent)`);
      continue;
    }
    next = replaceAll(next, needle, replacement);
    totalReplaced += found;
    report.push(`  - ${label}: ${found} replaced`);
  }

  if (next === original) {
    console.log('No changes — file already at target token state. (idempotent run)');
    return;
  }

  fs.writeFileSync(FILE, next, 'utf8');
  console.log(`Phase 4 migration complete — ${totalReplaced} substitutions applied to:`);
  console.log(' ', FILE);
  console.log('Per-pattern report:');
  console.log(report.join('\n'));
}

main();
