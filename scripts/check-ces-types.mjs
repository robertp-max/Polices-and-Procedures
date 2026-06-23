#!/usr/bin/env node
/**
 * Honest CES type gate (replaces the rigged `tsc ... || (echo ... && exit 0)`).
 *
 * Runs `tsc -p tsconfig.ces.json --noEmit` and FAILS (exit 1) only when an error
 * is reported in a `src/policy/ces/` file — the CES mandate. Errors in transitive
 * non-CES files (outside CES scope per SPEC §5.1) are printed as informational
 * context but never silently pass-or-fail the gate. A fully clean run prints PASS.
 *
 * Unlike the previous version, this CAN fail — a real type error introduced in any
 * src/policy/ces file will break the gate.
 */
import { execSync } from 'node:child_process';

function runTsc() {
  try {
    execSync('npx tsc -p tsconfig.ces.json --noEmit', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { clean: true, output: '' };
  } catch (e) {
    return { clean: false, output: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

const { clean, output } = runTsc();

if (clean) {
  console.log('check:ces-types: PASS — no type errors.');
  process.exit(0);
}

const errorLines = output.split(/\r?\n/).filter((l) => /error TS\d+/.test(l));
const CES_RE = /src[\\/]policy[\\/]ces[\\/]/;
const cesErrors = errorLines.filter((l) => CES_RE.test(l));
const otherErrors = errorLines.filter((l) => !CES_RE.test(l));

if (otherErrors.length) {
  console.log(
    `check:ces-types: ${otherErrors.length} transitive error(s) OUTSIDE src/policy/ces ` +
      `(out of CES mandate, see SPEC §5.1 — intentionally not fixed here):`,
  );
  for (const l of otherErrors) console.log('  · ' + l);
  console.log('');
}

if (cesErrors.length) {
  console.error(`check:ces-types: FAIL — ${cesErrors.length} error(s) inside src/policy/ces:`);
  for (const l of cesErrors) console.error('  x ' + l);
  process.exit(1);
}

console.log('check:ces-types: PASS — CES files clean (only out-of-mandate transitive errors above).');
process.exit(0);
