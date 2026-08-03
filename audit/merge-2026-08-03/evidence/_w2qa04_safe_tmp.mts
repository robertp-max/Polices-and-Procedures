import { BRAD_DEFAULT_ROUTE, safeReturnTo } from '../../../src/v6/utils/safeRedirect.ts';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cases: Array<[string, string, string]> = [
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
  ['backslash host blocked', safeReturnTo('/\\evil.example'), '/reception'],
  ['relative blocked', safeReturnTo('reception'), '/reception'],
];

const checks: Array<{ name: string; got: string; expect: string; pass: boolean }> = [];
let pass = true;
for (const [name, got, expect] of cases) {
  const ok = got === expect;
  if (!ok) pass = false;
  checks.push({ name, got, expect, pass: ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: got=${got} expect=${expect}`);
}
const constOk = BRAD_DEFAULT_ROUTE === '/reception';
if (!constOk) pass = false;
checks.push({
  name: 'BRAD_DEFAULT_ROUTE constant',
  got: BRAD_DEFAULT_ROUTE,
  expect: '/reception',
  pass: constOk,
});
console.log(`${constOk ? 'PASS' : 'FAIL'}  BRAD_DEFAULT_ROUTE=${BRAD_DEFAULT_ROUTE}`);

const outPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'W2-QA04-safeReturnTo-results.json');
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      agent: 'W2-QA04',
      kind: 'safeReturnTo-unit',
      pass,
      checks,
      timestamp: new Date().toISOString(),
    },
    null,
    2,
  ),
);
console.log(`OVERALL=${pass ? 'PASS' : 'FAIL'}`);
console.log(`Wrote ${outPath}`);
process.exit(pass ? 0 : 1);
