/**
 * W2-QA03 Reception Route QA — visible identity proof (HTTP 200 alone is FAIL).
 * Target: merge Vite http://127.0.0.1:5201/reception
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = __dirname;
const ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';
const SHOT = path.join(EVIDENCE, 'W2-QA03-reception.png');
const OUT = path.join(EVIDENCE, 'W2-QA03-reception-playwright-results.json');

const results = {
  agent: 'W2-QA03',
  startedAt: new Date().toISOString(),
  origin: ORIGIN,
  finalUrl: null,
  httpStatus: null,
  consoleErrors: [],
  checks: [],
  bodySnippet: null,
  screenshot: SHOT,
  overall: 'FAIL',
};

function check(id, ok, detail, extra = {}) {
  const row = { id, ok: !!ok, detail, ...extra };
  results.checks.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}: ${detail}`);
  return !!ok;
}

async function main() {
  // Document bare HTTP (must not alone pass)
  try {
    const res = await fetch(`${ORIGIN}/reception`);
    results.httpStatus = res.status;
    check(
      'http-status',
      res.status === 200,
      `GET /reception → HTTP ${res.status} (informational; identity required separately)`,
    );
  } catch (err) {
    check('http-status', false, `HTTP probe failed: ${err.message}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text());
  });

  await page.goto(`${ORIGIN}/reception`, { waitUntil: 'networkidle', timeout: 60000 });
  results.finalUrl = page.url();

  const onLogin = page.url().includes('/login');
  check(
    'auth-demo-or-session',
    !onLogin,
    onLogin
      ? `Redirected to login: ${page.url()}`
      : `Protected UI reachable without /login: ${page.url()}`,
  );

  // Wait for Reception shell identity
  await page.locator('[data-route="/reception"]').first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => {});

  const identityTargets = [
    'Reception',
    'Workspace launcher',
    'Compliance',
    'Journey',
    'Find Home Care',
    'EHR Prototype',
  ];
  const found = [];
  for (const t of identityTargets) {
    try {
      await page.getByText(t, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
      found.push(t);
    } catch {
      const body = await page.locator('body').innerText().catch(() => '');
      if (body.includes(t)) found.push(t);
    }
  }

  check(
    'reception-visible-identity',
    found.length === identityTargets.length,
    `Visible tokens (${found.length}/${identityTargets.length}): ${JSON.stringify(found)}`,
    { found, expected: identityTargets },
  );

  const bodyText = await page.locator('body').innerText();
  results.bodySnippet = bodyText.slice(0, 1200);

  // Required launcher cards
  for (const name of ['Compliance', 'Journey', 'Find Home Care', 'EHR Prototype']) {
    const heading = page.getByRole('heading', { name, exact: true });
    const headingVisible = await heading.isVisible().catch(() => false);
    const textOk = bodyText.includes(name);
    check(
      `launcher-card-${name.toLowerCase().replace(/\s+/g, '-')}`,
      headingVisible || textOk,
      headingVisible
        ? `Heading visible: ${name}`
        : textOk
          ? `Body text includes ${name} (heading role not found)`
          : `Missing launcher identity: ${name}`,
    );
  }

  check(
    'workspace-launcher-label',
    bodyText.includes('Workspace launcher') || bodyText.includes('Choose where you are working today'),
    bodyText.includes('Workspace launcher')
      ? 'Workspace launcher label visible'
      : bodyText.includes('Choose where you are working today')
        ? 'Launcher H2 visible'
        : 'Missing workspace launcher copy',
  );

  // data-route / data-template identity attributes
  const dataRoute = await page.locator('[data-route="/reception"]').count();
  const dataTemplate = await page.locator('[data-template="reception"]').count();
  const dataHash = await page.locator('[data-hash-id="reception"]').count();
  check(
    'dom-route-markers',
    dataRoute > 0 && dataTemplate > 0,
    `data-route=/reception count=${dataRoute}; data-template=reception count=${dataTemplate}; data-hash-id=reception count=${dataHash}`,
  );

  // EHR external href (workspace card)
  const ehrHrefCount = await page.locator('a[href="http://127.0.0.1:5191"]').count();
  check(
    'ehr-external-href-5191',
    ehrHrefCount > 0 || bodyText.includes('http://127.0.0.1:5191'),
    ehrHrefCount > 0
      ? `EHR launcher anchor href=http://127.0.0.1:5191 (count=${ehrHrefCount})`
      : bodyText.includes('http://127.0.0.1:5191')
        ? 'EHR URL present in body text'
        : 'EHR external href not found',
  );

  await page.screenshot({ path: SHOT, fullPage: true });
  console.log(`SHOT  ${SHOT}`);
  check('screenshot-written', fs.existsSync(SHOT), `Screenshot path: ${SHOT}`);

  const allOk = results.checks.every((c) => c.ok);
  // Hard rule: identity required beyond HTTP
  const identityOk = results.checks.find((c) => c.id === 'reception-visible-identity')?.ok;
  results.overall = allOk && identityOk ? 'PASS' : 'FAIL';
  results.finishedAt = new Date().toISOString();

  fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  console.log(`RESULT  overall=${results.overall}`);
  console.log(`JSON    ${OUT}`);

  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.checks.push({ id: 'fatal', ok: false, detail: String(err?.stack || err) });
  results.finishedAt = new Date().toISOString();
  try {
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2), 'utf8');
  } catch {
    /* ignore */
  }
  process.exit(2);
});
