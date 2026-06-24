/* Verifies Brad default-home, nav order, quick-action ordering, safe redirect,
   the How Brad Works help article, and public-research / greeting cleanup.
   Run: tsx --tsconfig tsconfig.app.json scripts/verifyBradDefaultHomeNav.ts */
import { readFileSync } from 'node:fs';
import { primaryNavItems } from '../src/v6/routing/navigationManifest';
import { getQuickActions } from '../src/v6/screens/brad/quickActions';
import { safeReturnTo } from '../src/v6/utils/safeRedirect';
import { HELP_ARTICLES } from '../src/policy/data/helpArticles';

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) { passed += 1; console.log(`PASS  ${name}`); }
  else { failures.push(name); console.error(`FAIL  ${name}`); }
}

// ── Navigation: Brad first (#1, #2) ──────────────────────────────────────────
check('nav: Brad is the first primary nav item', primaryNavItems[0].id === 'brad' && primaryNavItems[0].to === '/iadministrator');
check('nav: Dashboard is no longer first', primaryNavItems[0].id !== 'dashboard');
const sidebar = readFileSync('src/v6/shell/Sidebar.tsx', 'utf8');
check('nav: Sidebar PRIMARY OPERATIONS lists brad first', /\['brad',\s*'dashboard'/.test(sidebar));

// ── Default home: authenticated root + login (#3, #4) ─────────────────────────
const router = readFileSync('src/v6/routing/router.tsx', 'utf8');
check('router: authenticated root redirects to /iadministrator', /index:\s*true[\s\S]{0,80}to="\/iadministrator"/.test(router));
check('router: no /dashboard default redirect remains', !/Navigate\s+replace\s+to="\/dashboard"/.test(router));
const login = readFileSync('src/v6/screens/pageviews/LoginScreen.tsx', 'utf8');
check('login: uses safeReturnTo for post-login redirect', /safeReturnTo\(/.test(login));
check('login: no hardcoded /dashboard assignment', !/location\.assign\('\/dashboard'\)/.test(login));

// ── safe redirect rules (#5, #6) ─────────────────────────────────────────────
check('safeReturnTo: empty → Brad default', safeReturnTo(null) === '/iadministrator');
check('safeReturnTo: valid deep link preserved', safeReturnTo('/evidence') === '/evidence');
check('safeReturnTo: deep link with query preserved', safeReturnTo('/library/p-01?tab=x') === '/library/p-01?tab=x');
check('safeReturnTo: external URL blocked', safeReturnTo('https://evil.example') === '/iadministrator');
check('safeReturnTo: protocol-relative blocked', safeReturnTo('//evil.example') === '/iadministrator');
check('safeReturnTo: login loop blocked', safeReturnTo('/login') === '/iadministrator');
check('safeReturnTo: backslash host blocked', safeReturnTo('/\\evil.example') === '/iadministrator');

// ── Quick actions (#7, #11, #12, #13, #14) ───────────────────────────────────
const EXPECTED_REGULAR = [
  'How Brad works', 'Trusted Public Research', 'Complete OASIS-E2', 'Generate Form 485',
  'Generate report', 'Generate event packet and meeting agenda', 'Check for policy and procedure updates',
  'Generate PIP', 'ACHC Standards', 'Cross-Walk Defensibility Report', 'Draft QAPI meeting minutes',
  'Analyze staff training gaps',
];
const regular = getQuickActions(false).map((a) => a.label);
check('quick actions: regular user has exactly 12', regular.length === 12);
check('quick actions: regular exact order', JSON.stringify(regular) === JSON.stringify(EXPECTED_REGULAR));
check('quick actions: How Brad works is first', regular[0] === 'How Brad works');
check('quick actions: Trusted Public Research is 2nd (regular)', regular[1] === 'Trusted Public Research');
check('quick actions: Complete OASIS-E2 is 3rd (regular)', regular[2] === 'Complete OASIS-E2');
check('quick actions: Generate Form 485 is 4th (regular)', regular[3] === 'Generate Form 485');
check('quick actions: regular user has NO Builder', !regular.includes('Builder'));

// ── Builder placement for Super Admin (#8) ───────────────────────────────────
const superAdmin = getQuickActions(true).map((a) => a.label);
check('quick actions: super admin has 13', superAdmin.length === 13);
check('quick actions: How Brad works first (SA)', superAdmin[0] === 'How Brad works');
check('quick actions: Builder is 2nd (SA only)', superAdmin[1] === 'Builder');
check('quick actions: Trusted Public Research 3rd (SA)', superAdmin[2] === 'Trusted Public Research');
check('quick actions: Complete OASIS-E2 4th (SA)', superAdmin[3] === 'Complete OASIS-E2');
check('quick actions: Generate Form 485 5th (SA)', superAdmin[4] === 'Generate Form 485');
const builder = getQuickActions(true).find((a) => a.id === 'builder');
check('quick actions: Builder navigates to /brad/builder', builder?.kind === 'navigate' && builder?.to === '/brad/builder');

// ── Help article (#18) ───────────────────────────────────────────────────────
const art = HELP_ARTICLES['BRAD-HOW-BRAD-WORKS'];
check('help: How Brad Works article registered (route /help/brad-how-brad-works)', !!art && art.title === 'How Brad Works');

// ── Cleanup (#19, #21, #22, #23) ─────────────────────────────────────────────
const bw = readFileSync('src/v6/screens/brad/BradWorkspace.tsx', 'utf8');
check('cleanup: no hardcoded "James" greeting', !/userName\s*=\s*["']James["']/.test(bw) && !/>\s*James\s*</.test(bw));
check('cleanup: no user-facing "Nolan" in BradWorkspace', !/Nolan/.test(bw));
const prc = readFileSync('src/v6/screens/brad/PublicResearchCard.tsx', 'utf8');
check('public research: safe empty state present', /No public research result has been attached yet/.test(prc));
check('public research: UNVERIFIED state present', /Unverified Public Research/i.test(prc));
check('public research: no internal agent name', !/Nolan/.test(prc));

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.error('FAILURES:', failures.join('; ')); process.exit(1); }
