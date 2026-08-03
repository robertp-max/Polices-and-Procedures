/* W2-QA04 runtime: prove / → /reception on merge worktree server (5201 preferred). */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';
const cwd = process.cwd();
const EVIDENCE = path.join(cwd, 'audit/merge-2026-08-03/evidence');
fs.mkdirSync(EVIDENCE, { recursive: true });

const results = {
  agent: 'W2-QA04',
  kind: 'runtime',
  origin: ORIGIN,
  timestamp: new Date().toISOString(),
  checks: [],
  pass: true,
  screenshots: [],
  limitations: [],
};

function check(name, cond, detail = '') {
  results.checks.push({ name, pass: !!cond, detail });
  if (!cond) results.pass = false;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  // Preflight: server reachable
  try {
    const res = await fetch(ORIGIN + '/');
    check('server reachable', res.ok || res.status === 200, `HTTP ${res.status} ${ORIGIN}`);
  } catch (err) {
    check('server reachable', false, String(err));
    results.limitations.push('Merge origin not reachable; runtime proof aborted.');
    writeAndExit();
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Root → reception (demo/local auth expected on 127.0.0.1 dev)
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  const finalUrl = page.url();
  const pathname = new URL(finalUrl).pathname;
  const search = new URL(finalUrl).search;

  const landedReception = pathname === '/reception';
  const landedLogin = pathname === '/login';
  check(
    'navigate / final URL is /reception (demo/local auth path)',
    landedReception,
    finalUrl,
  );

  if (landedLogin) {
    results.limitations.push(
      'Root redirected to /login (no demo session). Cognito full-auth path not exercised with real credentials in this run. Code path still requires safeReturnTo → BRAD_DEFAULT_ROUTE=/reception after login.',
    );
    check(
      'unauthenticated fallback carries returnTo=/',
      /returnTo=/.test(search) || search.includes('returnTo'),
      search,
    );
  }

  const dataRouteCount = await page.locator('[data-route="/reception"]').count();
  let bodySnippet = '';
  try {
    bodySnippet = (await page.locator('body').innerText({ timeout: 8000 })).slice(0, 400);
  } catch {
    bodySnippet = '';
  }
  const hasReceptionMarker =
    dataRouteCount > 0 ||
    /Reception|workspace launcher|Care Indeed products|Find Home Care|EHR/i.test(bodySnippet);

  if (landedReception) {
    check(
      'reception surface identity (data-route or visible copy)',
      hasReceptionMarker,
      dataRouteCount > 0 ? 'data-route=/reception' : `body: ${bodySnippet.slice(0, 120)}…`,
    );
  }

  const shotRoot = path.join(EVIDENCE, 'W2-QA04-root-to-reception.png');
  await page.screenshot({ path: shotRoot, fullPage: true });
  results.screenshots.push(shotRoot);
  console.log(`SCREENSHOT ${shotRoot}`);

  // Direct /reception
  await page.goto(`${ORIGIN}/reception`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(800);
  const recUrl = page.url();
  check('direct /reception pathname', new URL(recUrl).pathname === '/reception', recUrl);
  const shotRec = path.join(EVIDENCE, 'W2-QA04-reception-direct.png');
  await page.screenshot({ path: shotRec, fullPage: true });
  results.screenshots.push(shotRec);

  results.authProbe = await page.evaluate(() => ({
    href: location.href,
    pathname: location.pathname,
    dataRoute: document.querySelector('[data-route]')?.getAttribute('data-route') || null,
    title: document.title,
  }));
  console.log('authProbe', JSON.stringify(results.authProbe));

  // soft: page title / probe when on reception
  if (new URL(recUrl).pathname === '/reception') {
    check(
      'direct reception data-route',
      results.authProbe.dataRoute === '/reception',
      JSON.stringify(results.authProbe),
    );
  }

  await browser.close();
  writeAndExit();
}

function writeAndExit() {
  const outJson = path.join(EVIDENCE, 'W2-QA04-playwright-results.json');
  results.finishedAt = new Date().toISOString();
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2));
  console.log(`\nOVERALL=${results.pass ? 'PASS' : 'FAIL'}`);
  console.log(`Wrote ${outJson}`);
  process.exit(results.pass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.pass = false;
  results.limitations.push(String(err));
  writeAndExit();
});
