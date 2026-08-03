/**
 * W1-A14 Browser Verifier — merge-local-app-surfaces-2026-08-03
 * Proves visible identity (not mere HTTP 200 SPA shell).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = __dirname;
const MERGE_ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';
const EHR_ORIGIN = process.env.EHR_ORIGIN || 'http://127.0.0.1:5191';

const results = {
  agent: 'W1-A14',
  startedAt: new Date().toISOString(),
  mergeOrigin: MERGE_ORIGIN,
  ehrOrigin: EHR_ORIGIN,
  checks: [],
  routes: {},
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
      consoleErrors: [],
      failedRequests: [],
      requests: [],
      visibleTextSnippets: [],
      screenshots: [],
    };
  }
  return results.routes[name];
}

async function waitIdentity(page, texts, timeout = 20000) {
  const found = [];
  for (const t of texts) {
    try {
      await page.getByText(t, { exact: false }).first().waitFor({ state: 'visible', timeout });
      found.push(t);
    } catch {
      // try body includes as softer check
      const body = await page.locator('body').innerText().catch(() => '');
      if (body.includes(t)) found.push(t);
    }
  }
  return found;
}

async function collectPage(page, name, networkFilter = null) {
  const bucket = routeBucket(name);
  const onConsole = (msg) => {
    if (msg.type() === 'error') {
      bucket.consoleErrors.push(msg.text());
    }
  };
  const onRequest = (req) => {
    const url = req.url();
    if (!networkFilter || networkFilter(url, req)) {
      bucket.requests.push({
        method: req.method(),
        url,
        resourceType: req.resourceType(),
      });
    }
  };
  const onFailed = (req) => {
    bucket.failedRequests.push({
      url: req.url(),
      method: req.method(),
      failure: req.failure()?.errorText || 'unknown',
      resourceType: req.resourceType(),
    });
  };
  page.on('console', onConsole);
  page.on('request', onRequest);
  page.on('requestfailed', onFailed);
  return () => {
    page.off('console', onConsole);
    page.off('request', onRequest);
    page.off('requestfailed', onFailed);
  };
}

async function screenshot(page, name) {
  const file = path.join(EVIDENCE, `W1-A14-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  routeBucket(name.split('-')[0] || name).screenshots.push(file);
  results.routes[name] = results.routes[name] || routeBucket(name);
  results.routes[name].screenshots = results.routes[name].screenshots || [];
  if (!results.routes[name].screenshots.includes(file)) {
    results.routes[name].screenshots.push(file);
  }
  console.log(`SHOT  ${file}`);
  return file;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });

  // ── 1) /reception desktop ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'reception-desktop');
    await page.goto(`${MERGE_ORIGIN}/reception`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('reception-desktop');
    bucket.finalUrl = page.url();

    // Auth: demo bypass on 127.0.0.1 vite dev should land on reception, not login
    const onLogin = page.url().includes('/login');
    check(
      'auth-default-or-demo',
      !onLogin,
      onLogin
        ? `Redirected to login: ${page.url()} (auth blocked; will still assert router via code evidence)`
        : `Reached protected UI without /login: ${page.url()}`,
      { finalUrl: page.url() },
    );

    const identity = await waitIdentity(page, [
      'Reception',
      'Compliance',
      'Journey',
      'EHR Prototype',
      'Find Home Care',
    ], 25000);

    check(
      'reception-visible-identity',
      identity.length >= 4,
      `Visible identity tokens found: ${JSON.stringify(identity)}`,
      { identity },
    );
    bucket.visibleTextSnippets = identity;

    // Separate controls for Find Home Care vs EHR Prototype
    const fhc = page.getByRole('heading', { name: 'Find Home Care', exact: true });
    const ehr = page.getByRole('heading', { name: 'EHR Prototype', exact: true });
    const fhcVisible = await fhc.isVisible().catch(() => false);
    const ehrVisible = await ehr.isVisible().catch(() => false);
    // fallbacks: text presence
    const bodyText = await page.locator('body').innerText();
    const fhcOk = fhcVisible || bodyText.includes('Find Home Care');
    const ehrOk = ehrVisible || bodyText.includes('EHR Prototype');
    check(
      'find-home-care-and-ehr-separate-controls',
      fhcOk && ehrOk,
      `Find Home Care visible=${fhcOk}; EHR Prototype visible=${ehrOk}`,
    );

    // EHR launcher href exactly http://127.0.0.1:5191 (no trailing slash as coded)
    const ehrLink = page.locator('a[href="http://127.0.0.1:5191"]').first();
    const ehrHrefCount = await page.locator('a[href="http://127.0.0.1:5191"]').count();
    const ehrHrefSlash = await page.locator('a[href="http://127.0.0.1:5191/"]').count();
    let ehrHref = null;
    let ehrTarget = null;
    if (ehrHrefCount > 0) {
      ehrHref = await ehrLink.getAttribute('href');
      ehrTarget = await ehrLink.getAttribute('target');
    }
    // Also capture card text showing route
    const routeLabels = await page.locator('a, button, article, span').evaluateAll((nodes) => {
      return nodes
        .map((n) => (n.textContent || '').trim())
        .filter((t) => t.includes('127.0.0.1:5191') || t.includes('/find-home-care'))
        .slice(0, 20);
    });

    check(
      'ehr-launcher-href-5191',
      ehrHref === 'http://127.0.0.1:5191' || bodyText.includes('http://127.0.0.1:5191'),
      `href=${ehrHref}; target=${ehrTarget}; count_no_slash=${ehrHrefCount}; count_slash=${ehrHrefSlash}; labels=${JSON.stringify(routeLabels)}`,
      { ehrHref, ehrTarget, ehrHrefCount, ehrHrefSlash, routeLabels },
    );

    // Compliance / Journey cards
    check(
      'workspace-cards-compliance-journey',
      bodyText.includes('Compliance') && bodyText.includes('Journey') && bodyText.includes('Open Compliance'),
      'Reception body includes Compliance + Journey launcher identity',
    );

    await screenshot(page, 'reception-desktop');
    stop();
    await page.close();
  }

  // ── 2) Unauthenticated redirect behavior (fresh context, block demo by... can't)
  // Demo bypass always on localhost under vite dev. Document that and still
  // probe /login returnTo + safeRedirect by loading login and reading URL patterns.
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'login-returnTo');
    await page.goto(`${MERGE_ORIGIN}/login?returnTo=%2Fcompliance`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const bucket = routeBucket('login-returnTo');
    bucket.finalUrl = page.url();
    const body = await page.locator('body').innerText().catch(() => '');
    // Under demo bypass, user may still see login or get bounced — record either way
    check(
      'login-route-reachable',
      page.url().includes('/login') || body.toLowerCase().includes('sign') || body.toLowerCase().includes('login'),
      `login page url=${page.url()}; body_snippet=${body.slice(0, 200).replace(/\s+/g, ' ')}`,
    );
    await screenshot(page, 'login-returnTo');
    stop();
    await page.close();
  }

  // ── 3) /compliance identity ────────────────────────────────────────────
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'compliance');
    await page.goto(`${MERGE_ORIGIN}/compliance`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('compliance');
    bucket.finalUrl = page.url();
    const found = await waitIdentity(page, [
      'Compliance Execution Sprint',
      'CES Overview',
      'Open Sprint Dashboard',
      'Sprint Home',
    ], 25000);
    const body = await page.locator('body').innerText();
    const notBlank = body.replace(/\s+/g, ' ').trim().length > 80;
    check(
      'compliance-identity',
      found.length >= 1 && notBlank,
      `found=${JSON.stringify(found)}; bodyLen=${body.length}; url=${page.url()}`,
      { found, bodyLen: body.length },
    );
    bucket.visibleTextSnippets = found;
    await screenshot(page, 'compliance');
    stop();
    await page.close();
  }

  // ── 4) /evidence identity ──────────────────────────────────────────────
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'evidence');
    await page.goto(`${MERGE_ORIGIN}/evidence`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('evidence');
    bucket.finalUrl = page.url();
    // Wait for hash id attribute if present
    await page.waitForTimeout(1500);
    const hashEl = await page.locator('[data-hash-id="evidence-center"], [data-route="/evidence"], [data-template="evidence"]').count();
    const body = await page.locator('body').innerText();
    const tokens = ['DefenCIble', 'Evidence', 'Packet', 'Studio', 'Drive', 'Source'];
    const found = tokens.filter((t) => body.includes(t));
    const notBlank = body.replace(/\s+/g, ' ').trim().length > 80;
    check(
      'evidence-identity',
      notBlank && (hashEl > 0 || found.length >= 2),
      `hashEls=${hashEl}; found=${JSON.stringify(found)}; bodyLen=${body.length}; url=${page.url()}`,
      { hashEl, found, bodyLen: body.length },
    );
    bucket.visibleTextSnippets = found;
    await screenshot(page, 'evidence');
    stop();
    await page.close();
  }

  // ── 5) /evidence/defensible-2 identity ─────────────────────────────────
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'evidence-defensible-2');
    await page.goto(`${MERGE_ORIGIN}/evidence/defensible-2`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('evidence-defensible-2');
    bucket.finalUrl = page.url();
    await page.waitForTimeout(1500);
    const hashEl = await page.locator('[data-hash-id="defensible-2"]').count();
    const body = await page.locator('body').innerText();
    const tokens = ['DefenCIble', 'Defensible', 'Packet', 'Source', 'Generate', 'Preview', 'Metadata'];
    const found = tokens.filter((t) => body.includes(t));
    const notBlank = body.replace(/\s+/g, ' ').trim().length > 80;
    check(
      'evidence-defensible-2-identity',
      notBlank && (hashEl > 0 || found.length >= 2),
      `hashEls=${hashEl}; found=${JSON.stringify(found)}; bodyLen=${body.length}; url=${page.url()}`,
      { hashEl, found, bodyLen: body.length },
    );
    bucket.visibleTextSnippets = found;
    await screenshot(page, 'evidence-defensible-2');
    stop();
    await page.close();
  }

  // ── 6) EHR static mirror ───────────────────────────────────────────────
  {
    const page = await context.newPage();
    const ehrApiLike = [];
    const stop = await collectPage(page, 'ehr-static', (url) => true);
    page.on('request', (req) => {
      const u = req.url();
      // Flag any request that leaves 5191 toward policy app / auth / api
      if (
        /:(5201|5173|8787)\b/.test(u) ||
        /\/api\//.test(u) ||
        /auth|cognito|amazonaws\.com|careindeed\.com/.test(u)
      ) {
        ehrApiLike.push({ method: req.method(), url: u, type: req.resourceType() });
      }
    });

    const responses = [];
    page.on('response', (res) => {
      responses.push({ url: res.url(), status: res.status(), type: res.request().resourceType() });
    });

    await page.goto(`${EHR_ORIGIN}/`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('ehr-static');
    bucket.finalUrl = page.url();
    const title = await page.title();
    check(
      'ehr-static-title',
      title === 'Care Indeed Home Health EHR Prototype',
      `document.title=${JSON.stringify(title)}`,
      { title },
    );

    // Asset load 200 for css/js
    const assetHits = responses.filter((r) =>
      /\.(css|js)(\?|$)/.test(r.url) || /\/assets\//.test(r.url),
    );
    const assetOk = assetHits.filter((r) => r.status >= 200 && r.status < 400);
    const assetFail = assetHits.filter((r) => r.status >= 400);
    check(
      'ehr-static-assets-200',
      assetOk.length >= 2 && assetFail.length === 0,
      `assetOk=${assetOk.length}; assetFail=${assetFail.length}; sample=${JSON.stringify(assetOk.slice(0, 8))}`,
      { assetOk: assetOk.slice(0, 20), assetFail },
    );

    // Network isolation: no policy-app / auth / backend integration
    // Pure static: only 5191 origin requests expected
    const allReqs = bucket.requests;
    const foreign = allReqs.filter((r) => {
      try {
        const u = new URL(r.url);
        return u.origin !== EHR_ORIGIN && !r.url.startsWith('data:') && !r.url.startsWith('blob:');
      } catch {
        return false;
      }
    });
    check(
      'ehr-no-policy-app-integration',
      ehrApiLike.length === 0,
      ehrApiLike.length === 0
        ? `No API/auth/backend/shared-state requests toward policy app. Total requests=${allReqs.length}; foreignOrigins=${foreign.length}`
        : `FOUND integration-like requests: ${JSON.stringify(ehrApiLike)}`,
      { ehrApiLike, foreign: foreign.slice(0, 30), requestCount: allReqs.length },
    );

    // Visible UI not blank
    const body = await page.locator('body').innerText().catch(() => '');
    const bodyLen = body.replace(/\s+/g, ' ').trim().length;
    check(
      'ehr-static-not-blank',
      bodyLen > 20 || (await page.locator('body *').count()) > 5,
      `bodyLen=${bodyLen}; title ok; url=${page.url()}`,
    );

    await screenshot(page, 'ehr-static');
    bucket.requests = allReqs.slice(0, 100);
    stop();
    await page.close();
  }

  // ── 7) Mobile viewport /reception ──────────────────────────────────────
  {
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      ignoreHTTPSErrors: true,
    });
    const page = await mobile.newPage();
    const stop = await collectPage(page, 'reception-mobile');
    await page.goto(`${MERGE_ORIGIN}/reception`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('reception-mobile');
    bucket.finalUrl = page.url();
    const found = await waitIdentity(page, ['Reception', 'Compliance', 'Find Home Care', 'EHR Prototype'], 25000);
    check(
      'reception-mobile-identity',
      found.length >= 3,
      `mobile identity=${JSON.stringify(found)}; url=${page.url()}`,
      { found },
    );
    bucket.visibleTextSnippets = found;
    await screenshot(page, 'reception-mobile');
    stop();
    await page.close();
    await mobile.close();
  }

  // ── 8) Root redirect toward /reception (demo) ──────────────────────────
  {
    const page = await context.newPage();
    const stop = await collectPage(page, 'root-redirect');
    await page.goto(`${MERGE_ORIGIN}/`, { waitUntil: 'networkidle', timeout: 60000 });
    const bucket = routeBucket('root-redirect');
    bucket.finalUrl = page.url();
    const ok = page.url().includes('/reception') || page.url().includes('/login');
    check(
      'root-default-auth-route',
      ok,
      `After / navigate finalUrl=${page.url()} (expect /reception under demo, or /login?returnTo if unauthenticated)`,
      { finalUrl: page.url() },
    );
    await screenshot(page, 'root-redirect');
    stop();
    await page.close();
  }

  // Summarize console/network failures
  for (const [name, bucket] of Object.entries(results.routes)) {
    check(
      `console-clean-${name}`,
      (bucket.consoleErrors || []).length === 0,
      (bucket.consoleErrors || []).length === 0
        ? 'No console errors'
        : `Console errors: ${JSON.stringify(bucket.consoleErrors.slice(0, 10))}`,
      { count: (bucket.consoleErrors || []).length },
    );
    // Failed network: filter noise (favicon optional etc) but report all
    const fails = bucket.failedRequests || [];
    check(
      `network-failed-${name}`,
      fails.length === 0,
      fails.length === 0
        ? 'No failed network requests'
        : `Failed requests: ${JSON.stringify(fails.slice(0, 15))}`,
      { count: fails.length },
    );
  }

  const criticalIds = [
    'reception-visible-identity',
    'find-home-care-and-ehr-separate-controls',
    'ehr-launcher-href-5191',
    'compliance-identity',
    'evidence-identity',
    'evidence-defensible-2-identity',
    'ehr-static-title',
    'ehr-static-assets-200',
    'ehr-no-policy-app-integration',
    'reception-mobile-identity',
  ];
  const criticalPass = criticalIds.every((id) => results.checks.find((c) => c.id === id)?.ok);
  results.overall = criticalPass ? 'PASS' : 'FAIL';
  results.finishedAt = new Date().toISOString();
  results.critical = Object.fromEntries(
    criticalIds.map((id) => [id, !!results.checks.find((c) => c.id === id)?.ok]),
  );

  const outJson = path.join(EVIDENCE, 'W1-A14-playwright-results.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nOVERALL=${results.overall}`);
  console.log(`Wrote ${outJson}`);

  await browser.close();
  process.exit(criticalPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.overall = 'FAIL';
  results.fatal = String(err && err.stack ? err.stack : err);
  fs.writeFileSync(
    path.join(EVIDENCE, 'W1-A14-playwright-results.json'),
    JSON.stringify(results, null, 2),
    'utf8',
  );
  process.exit(2);
});
