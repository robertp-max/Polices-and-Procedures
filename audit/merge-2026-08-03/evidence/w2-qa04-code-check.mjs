/* W2-QA04 static code assertions — reception auth redirect */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '../../..');
// On Windows import.meta.url path can be awkward; use cwd (run from repo root)
const cwd = process.cwd();

const router = fs.readFileSync(path.join(cwd, 'src/v6/routing/router.tsx'), 'utf8');
const safe = fs.readFileSync(path.join(cwd, 'src/v6/utils/safeRedirect.ts'), 'utf8');
const login = fs.readFileSync(path.join(cwd, 'src/v6/screens/pageviews/LoginScreen.tsx'), 'utf8');
const requireAuth = fs.readFileSync(path.join(cwd, 'src/auth/RequireAuth.tsx'), 'utf8');
const registry = fs.readFileSync(path.join(cwd, 'src/v6/routing/routeRegistry.ts'), 'utf8');
const verify = fs.readFileSync(path.join(cwd, 'scripts/verifyBradDefaultHomeNav.ts'), 'utf8');

const checks = [];
function check(name, cond, detail = '') {
  checks.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

check(
  'router index Navigate to /reception',
  /index:\s*true,\s*element:\s*<Navigate\s+replace\s+to="\/reception"\s*\/>/.test(router),
);
check(
  'no /dashboard as index default',
  !/index:\s*true[\s\S]{0,100}to="\/dashboard"/.test(router),
);
check(
  'no /iadministrator as index default',
  !/index:\s*true[\s\S]{0,100}to="\/iadministrator"/.test(router),
);
check(
  "BRAD_DEFAULT_ROUTE = '/reception'",
  /export const BRAD_DEFAULT_ROUTE = '\/reception';/.test(safe),
);
check(
  'safeReturnTo default fallback is BRAD_DEFAULT_ROUTE',
  /fallback:\s*string\s*=\s*BRAD_DEFAULT_ROUTE/.test(safe),
);
check('LoginScreen imports safeReturnTo', /from ['"].*safeRedirect['"]/.test(login));
check('LoginScreen calls safeReturnTo for post-login dest', /safeReturnTo\(/.test(login));
check(
  'LoginScreen redirectAfterAuth uses returnTo/from then navigate',
  /redirectAfterAuth/.test(login) && /searchParams\.get\('returnTo'\)/.test(login),
);
check(
  'RequireAuth allows demo through shell (not only authenticated)',
  /'demo'/.test(requireAuth) && /unauthenticated/.test(requireAuth),
);
check(
  'routeRegistry includes /reception',
  /path:\s*'\/reception'/.test(registry),
);

// Stale helper script (informational — does not fail this QA alone)
const staleIadmin =
  /to="\/iadministrator"/.test(verify) ||
  /safeReturnTo\(null\) === '\/iadministrator'/.test(verify);
checks.push({
  name: 'NOTE scripts/verifyBradDefaultHomeNav.ts still expects /iadministrator (stale vs /reception)',
  pass: true,
  detail: staleIadmin ? 'STALE — expects /iadministrator' : 'updated',
  informational: true,
});
console.log(
  `NOTE  scripts/verifyBradDefaultHomeNav.ts ${staleIadmin ? 'STALE (still /iadministrator)' : 'OK'}`,
);

const fail = checks.filter((c) => !c.pass && !c.informational);
const out = {
  agent: 'W2-QA04',
  kind: 'code',
  timestamp: new Date().toISOString(),
  pass: fail.length === 0,
  checks,
};
const outPath = path.join(cwd, 'audit/merge-2026-08-03/evidence/W2-QA04-code-check-results.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nOVERALL=${out.pass ? 'PASS' : 'FAIL'}`);
console.log(`Wrote ${outPath}`);
process.exit(out.pass ? 0 : 1);
