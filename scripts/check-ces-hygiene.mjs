#!/usr/bin/env node
/**
 * CES hygiene verification (Section 5.3 of CES_PHASE_1_2_HARDENED_EXECUTION_SPEC.md)
 *
 * Runs 3 core checks + prints PASS/FAIL summaries.
 * Exits non-zero if any hard check fails.
 * - No .js under src/ (respecting gitignore, but flags sibling shadows)
 * - Reports @ts-nocheck count under src/policy/ces/** (Phase 1: WARN not FAIL)
 * - No live Google/Drive/Evidence write patterns (specific APIs only; no broad .update/.patch)
 *
 * Usage: node scripts/check-ces-hygiene.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const CES_DIR = path.join(SRC, 'policy', 'ces');

// CES screen files to scan (per allowed edit list; surgical)
const CES_SCREEN_FILES = [
  path.join(ROOT, 'src/v6/screens/RepresentativeScreens.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/EventsBoardScreen.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/MasterControlsScreen.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/MyTasksScreen.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/MobileIncidentScreen.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/WorkflowsScreen.tsx'),
  path.join(ROOT, 'src/v6/screens/pageviews/WorkflowDetailAndSwimlaneScreen.tsx'),
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

function isGitIgnored(filePath) {
  try {
    // -q = quiet; exit 0 if ignored, 1 if not
    execSync(`git check-ignore -q "${filePath.replace(/\\/g, '/')}"`, {
      cwd: ROOT,
      stdio: 'ignore',
      encoding: 'utf8',
    });
    return true;
  } catch {
    return false;
  }
}

function countTsNocheckInCes() {
  let count = 0;
  const files = walk(CES_DIR).filter(f => /\.(ts|tsx)$/.test(f));
  for (const f of files) {
    try {
      const txt = fs.readFileSync(f, 'utf8');
      const matches = txt.match(/@ts-nocheck/g);
      if (matches) count += matches.length;
    } catch {
      // ignore unreadable
    }
  }
  return count;
}

function scanForWritePatterns(targetFiles) {
  // Write patterns ONLY (exact per spec: specific drive./permissions./googleEvidence. calls)
  // NEVER match bare .update( or .patch( to avoid Zustand/array false positives.
  const WRITE_PATTERN = /drive\.files\.(create|update|patch)|drive\.permissions\.create|permissions\.create|googleEvidence\.(publish|upload|attach|write|create)/;
  const hits = [];
  for (const f of targetFiles) {
    if (!fs.existsSync(f)) continue;
    try {
      const txt = fs.readFileSync(f, 'utf8');
      if (WRITE_PATTERN.test(txt)) {
        hits.push(path.relative(ROOT, f));
      }
    } catch {
      // ignore
    }
  }
  return hits;
}

// --- CHECK 1: No .js under src/ (except gitignored) ---
const srcFiles = walk(SRC);
let jsViolations = [];
for (const f of srcFiles) {
  if (!f.endsWith('.js')) continue;
  const rel = path.relative(ROOT, f);
  const hasTsSibling = fs.existsSync(f.slice(0, -3) + '.ts') || fs.existsSync(f.slice(0, -3) + '.tsx');
  if (hasTsSibling) {
    // shadow case — always bad (predev should have cleaned)
    jsViolations.push(`${rel} (ts sibling shadow)`);
  } else if (!isGitIgnored(f)) {
    // non-ignored .js with no sibling = would be added to git — bad
    jsViolations.push(`${rel} (unignored .js)`);
  }
  // else: gitignored genuine .js (rare) — allowed per "excluding anything already gitignored"
}
const check1Pass = jsViolations.length === 0;
console.log(`CHECK1 no-.js-under-src: ${check1Pass ? 'PASS' : 'FAIL'}${jsViolations.length ? ' — ' + jsViolations.join(', ') : ''}`);

// --- CHECK 2: Report count of @ts-nocheck in src/policy/ces/** (Phase 1: report + WARN, do not fail) ---
const tsNocheckCount = countTsNocheckInCes();
const check2Status = tsNocheckCount === 0 ? 'PASS' : 'WARN';
console.log(`CHECK2 @ts-nocheck-in-ces: ${check2Status} (count=${tsNocheckCount})`);

// --- CHECK 3: No write-API patterns in CES code + CES screens ---
const cesTsFiles = walk(CES_DIR).filter(f => /\.(ts|tsx)$/.test(f));
const allCesScanFiles = [...cesTsFiles, ...CES_SCREEN_FILES];
const writeHits = scanForWritePatterns(allCesScanFiles);
const check3Pass = writeHits.length === 0;
console.log(`CHECK3 no-google-drive-writes: ${check3Pass ? 'PASS' : 'FAIL'}${writeHits.length ? ' — ' + writeHits.join(', ') : ''}`);

// Summary + exit
const hardFailures = [];
if (!check1Pass) hardFailures.push('CHECK1');
if (!check3Pass) hardFailures.push('CHECK3');
// CHECK2 is reported only in Phase 1

if (hardFailures.length > 0) {
  console.error(`CES hygiene FAILED: ${hardFailures.join(', ')}`);
  process.exit(1);
} else {
  console.log('CES hygiene: all critical checks PASS');
  process.exit(0);
}
