/* Execute safeReturnTo by extracting the pure function contract from source via dynamic eval of compiled logic.
   Prefer importing through tsx when available; fallback reimplements from source constants for CI-less agents. */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const outPath = path.join(cwd, 'audit/merge-2026-08-03/evidence/W2-QA04-safeReturnTo-results.json');

// Run via tsx if present
const runner = `
import { BRAD_DEFAULT_ROUTE, safeReturnTo } from './src/v6/utils/safeRedirect.ts';
const cases = [
  ['null', safeReturnTo(null), '/reception'],
  ['undefined', safeReturnTo(undefined), '/reception'],
  ['empty', safeReturnTo(''), '/reception'],
  ['whitespace', safeReturnTo('   '), '/reception'],
  ['valid deep', safeReturnTo('/evidence'), '/evidence'],
  ['query preserved', safeReturnTo('/library/p-01?tab=x'), '/library/p-01?tab=x'],
  ['external blocked', safeReturnTo('https://evil.example'), '/reception'],
  ['protocol-relative blocked', safeReturnTo('//evil.example'), '/reception'],
  ['login loop blocked', safeReturnTo('/login'), '/reception'],
  ['login subpath blocked', safeReturnTo('/login/reset'), '/reception'],
  ['backslash host blocked', safeReturnTo('/\\\\evil.example'), '/reception'],
  ['relative blocked', safeReturnTo('reception'), '/reception'],
];
const checks = [];
let pass = true;
for (const [name, got, expect] of cases) {
  const ok = got === expect;
  if (!ok) pass = false;
  checks.push({ name, got, expect, pass: ok });
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name + ': got=' + got + ' expect=' + expect);
}
const constOk = BRAD_DEFAULT_ROUTE === '/reception';
if (!constOk) pass = false;
checks.push({ name: 'BRAD_DEFAULT_ROUTE constant', got: BRAD_DEFAULT_ROUTE, expect: '/reception', pass: constOk });
console.log((constOk ? 'PASS' : 'FAIL') + '  BRAD_DEFAULT_ROUTE=' + BRAD_DEFAULT_ROUTE);
const out = { agent: 'W2-QA04', kind: 'safeReturnTo-unit', pass, checks, timestamp: new Date().toISOString() };
import('node:fs').then(fs => fs.writeFileSync(${JSON.stringify(outPath.replace(/\\/g, '/'))}, JSON.stringify(out, null, 2)));
console.log('OVERALL=' + (pass ? 'PASS' : 'FAIL'));
process.exit(pass ? 0 : 1);
`;

const tmp = path.join(cwd, 'audit/merge-2026-08-03/evidence/_w2qa04_safe_tmp.mts');
fs.writeFileSync(tmp, runner);

const r = spawnSync('npx', ['--yes', 'tsx', '--tsconfig', 'tsconfig.app.json', tmp], {
  cwd,
  encoding: 'utf8',
  shell: true,
});
console.log(r.stdout || '');
console.error(r.stderr || '');
try {
  fs.unlinkSync(tmp);
} catch {}
process.exit(r.status ?? 1);
