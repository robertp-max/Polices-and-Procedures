/**
 * W2-QA06 DefenCIble Route QA — merge-local-app-surfaces-2026-08-03
 * Proves /evidence and /evidence/defensible-2 render DefenCIble/packet identity
 * content (not blank SPA shell). PASS only with content identity proof.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const EVIDENCE_DIR = path.join(__dirname, '..', 'evidence');
const MERGE_ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';

const results = {
  agent: 'W2-QA06',
  title: 'DefenCIble Route QA',
  startedAt: new Date().toISOString(),
  mergeOrigin: MERGE_ORIGIN,
  routes: {},
  checks: [],
  overall: 'FAIL',
};

function check(id, ok, detail, extra = {}) {
  const row = { id, ok: !!ok, detail, ...extra };
  results.checks.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}: ${detail}`);
  return !!ok;
}

function routeBucket(name) {
  if (!results.routes[name]) {
    results.routes[name] = {
      finalUrl: null,
      title: null,
      consoleErrors: [],
      consoleWarnings: [],
      failedRequests: [],
      responseStatuses: [],
      visibleTextSnippets: [],
      identityTokensFound: [],
      hashIdCount: 0,
      bodyLength: 0,
      bodyPreview: '',
      screenshots: [],
      selectors: {},
    };
  }
  return results.routes[name];
}

async function collectPage(page, name) {
  const bucket = routeBucket(name);
  const onConsole = (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') bucket.consoleErrors.push(text);
    if (msg.type() === 'warning') bucket.consoleWarnings.push(text);
  };
  const onFailed = (req) => {
    bucket.failedRequests.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || 'unknown',
      resourceType: req.resourceType(),
    });
  };
  const onResponse = (res) => {
    const status = res.status();
    if (status >= 400) {
      bucket.responseStatuses.push({
        url: res.url(),
        status,
        method: res.request().method(),
        resourceType: res.request().resourceType(),
      });
    }
  };
  page.on('console', onConsole);
  page.on('requestfailed', onFailed);
  page.on('response', onResponse);
  return () => {
    page.off('console', onConsole);
    page.off('requestfailed', onFailed);
    page.off('response', onResponse);
  };
}

async function screenshot(page, name) {
  const file = path.join(EVIDENCE_DIR, `W2-QA06-${name}.png`);
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: file, fullPage: true });
  const bucket = routeBucket(name);
  bucket.screenshots.push(file);
  console.log(`SHOT  ${file}`);
  return file;
}

/** Strong DefenCIble / packet studio identity markers from W1 + route registry */
const STRONG_IDENTITY = [
  'DEFENCIBLE',
  'DefenCIble',
  'Defensible',
  'SELECT A PACKET TEMPLATE',
  'Select a Packet Template',
  'PACKET 2.0',
  'Packet 2.0',
  'Patient Admission',
  'QAPI Quarterly',
  'Governing Body',
  'Patient Safety',
  'Custom Meeting',
  'DRIVE',
  'PACKETS',
  'EDIT PACKET',
  'ECIGN',
  'eCIgn',
];

async function probeDefensibleRoute(context, routePath, name) {
  const page = await context.newPage();
  const stop = await collectPage(page, name);
  const bucket = routeBucket(name);

  await page.goto(`${MERGE_ORIGIN}${routePath}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  // Allow SPA + any late client render
  await page.waitForTimeout(2000);

  bucket.finalUrl = page.url();
  bucket.title = await page.title();

  // Hash / route markers
  const hashDefensible = await page.locator('[data-hash-id="defensible-2"]').count();
  const hashEvidence = await page.locator('[data-hash-id="evidence-center"]').count();
  const dataRouteEvidence = await page.locator('[data-route="/evidence"], [data-route*="evidence"]').count();
  const dataTemplate = await page.locator('[data-template="evidence"]').count();
  bucket.hashIdCount = hashDefensible;
  bucket.selectors = {
    'data-hash-id=defensible-2': hashDefensible,
    'data-hash-id=evidence-center': hashEvidence,
    'data-route*evidence': dataRouteEvidence,
    'data-template=evidence': dataTemplate,
  };

  const body = await page.locator('body').innerText().catch(() => '');
  const bodyNorm = body.replace(/\s+/g, ' ').trim();
  bucket.bodyLength = bodyNorm.length;
  bucket.bodyPreview = bodyNorm.slice(0, 600);

  const identityFound = STRONG_IDENTITY.filter((t) => body.includes(t));
  bucket.identityTokensFound = identityFound;
  bucket.visibleTextSnippets = identityFound;

  // Not blank shell: substantial body + DefenCIble/packet markers
  const notBlank = bodyNorm.length > 120;
  const hasPacketIdentity =
    identityFound.length >= 3 ||
    (identityFound.length >= 2 && hashDefensible > 0) ||
    (hashDefensible > 0 && bodyNorm.toLowerCase().includes('packet'));

  // Nav group / studio chrome probes
  const hasDefensibleNav =
    body.includes('DEFENCIBLE') ||
    body.includes('DefenCIble') ||
    body.includes('Defensible') ||
    (await page.getByText(/DefenCIble|DEFENCIBLE|Defensible/i).count()) > 0;

  const hasTemplateChrome =
    /SELECT A PACKET TEMPLATE|Select a Packet Template|Patient Admission|PACKET 2\.0|Packet 2\.0|PACKETS|EDIT PACKET/i.test(
      body,
    );

  check(
    `${name}-not-blank-shell`,
    notBlank,
    `bodyLen=${bodyNorm.length}; url=${page.url()}`,
    { bodyLen: bodyNorm.length, finalUrl: page.url() },
  );

  check(
    `${name}-hash-or-identity`,
    hasPacketIdentity,
    `hashDefensible=${hashDefensible}; identityTokens=${JSON.stringify(identityFound)}; hasDefensibleNav=${hasDefensibleNav}; hasTemplateChrome=${hasTemplateChrome}`,
    {
      hashDefensible,
      identityFound,
      hasDefensibleNav,
      hasTemplateChrome,
      selectors: bucket.selectors,
    },
  );

  check(
    `${name}-defensible-packet-content`,
    hasDefensibleNav && (hasTemplateChrome || hashDefensible > 0 || identityFound.length >= 3),
    `DefenCIble/packet surface: nav=${hasDefensibleNav}; chrome=${hasTemplateChrome}; tokens=${identityFound.length}; hash=${hashDefensible}`,
    { hasDefensibleNav, hasTemplateChrome, identityFound, hashDefensible },
  );

  // Stay on expected path (or login would be fail for identity)
  const onExpected =
    page.url().includes(routePath) ||
    page.url().includes('/evidence') ||
    page.url().includes('defensible');
  const onLogin = page.url().includes('/login');
  check(
    `${name}-url-path`,
    onExpected && !onLogin,
    `finalUrl=${page.url()}; onLogin=${onLogin}`,
    { finalUrl: page.url(), onLogin },
  );

  await screenshot(page, name);
  stop();
  await page.close();

  return {
    name,
    routePath,
    ok:
      notBlank &&
      hasPacketIdentity &&
      hasDefensibleNav &&
      (hasTemplateChrome || hashDefensible > 0 || identityFound.length >= 3) &&
      onExpected &&
      !onLogin,
  };
}

async function main() {
  // Server fingerprint
  results.serverProbe = {
    origin: MERGE_ORIGIN,
    evidenceGet: null,
    defensibleGet: null,
  };
  try {
    const r1 = await fetch(`${MERGE_ORIGIN}/evidence`);
    results.serverProbe.evidenceGet = { status: r1.status, ok: r1.ok };
    const r2 = await fetch(`${MERGE_ORIGIN}/evidence/defensible-2`);
    results.serverProbe.defensibleGet = { status: r2.status, ok: r2.ok };
  } catch (e) {
    results.serverProbe.error = String(e);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  const rEvidence = await probeDefensibleRoute(context, '/evidence', 'evidence');
  const rDef2 = await probeDefensibleRoute(context, '/evidence/defensible-2', 'evidence-defensible-2');

  await browser.close();

  results.finishedAt = new Date().toISOString();
  const critical = results.checks.filter(
    (c) =>
      c.id.includes('not-blank') ||
      c.id.includes('hash-or-identity') ||
      c.id.includes('defensible-packet-content') ||
      c.id.includes('url-path'),
  );
  const allCriticalOk = critical.every((c) => c.ok) && rEvidence.ok && rDef2.ok;
  results.overall = allCriticalOk ? 'PASS' : 'FAIL';
  results.summary = {
    evidenceRouteOk: rEvidence.ok,
    defensible2RouteOk: rDef2.ok,
    criticalChecks: critical.length,
    criticalPassed: critical.filter((c) => c.ok).length,
    allChecks: results.checks.length,
    allPassed: results.checks.filter((c) => c.ok).length,
  };

  const outJson = path.join(OUT, 'W2-QA06-playwright-results.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nOVERALL: ${results.overall}`);
  console.log(`JSON: ${outJson}`);
  process.exit(allCriticalOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.error = String(err?.stack || err);
  results.finishedAt = new Date().toISOString();
  try {
    fs.writeFileSync(
      path.join(OUT, 'W2-QA06-playwright-results.json'),
      JSON.stringify(results, null, 2),
      'utf8',
    );
  } catch {
    /* ignore */
  }
  process.exit(2);
});
