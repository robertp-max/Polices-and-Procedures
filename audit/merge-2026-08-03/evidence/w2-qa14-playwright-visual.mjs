/**
 * W2-QA14 Browser Visual QA — merge-local-app-surfaces-2026-08-03
 * Desktop + mobile screenshots, console/network, EHR isolation.
 * HTTP 200 SPA shell alone is NOT accepted.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = __dirname;
const MERGE_ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';
const EHR_ORIGIN = process.env.EHR_ORIGIN || 'http://127.0.0.1:5191';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const ROUTES = [
  {
    key: 'reception',
    path: '/reception',
    identity: ['Reception', 'Compliance', 'Journey', 'EHR Prototype', 'Find Home Care'],
    minIdentity: 4,
  },
  {
    key: 'compliance',
    path: '/compliance',
    identity: [
      'Compliance Execution Sprint',
      'CES Overview',
      'Open Sprint Dashboard',
      'Sprint Home',
      'Compliance',
    ],
    minIdentity: 1,
  },
  {
    key: 'evidence',
    path: '/evidence',
    identity: ['DefenCIble', 'Evidence', 'Packet', 'Studio', 'Drive', 'Source'],
    minIdentity: 2,
  },
  {
    key: 'evidence-defensible-2',
    path: '/evidence/defensible-2',
    identity: ['DefenCIble', 'Defensible', 'Packet', 'Source', 'Generate', 'Preview', 'Metadata'],
    minIdentity: 2,
  },
];

const results = {
  agent: 'W2-QA14',
  role: 'Browser Visual QA',
  startedAt: new Date().toISOString(),
  mergeOrigin: MERGE_ORIGIN,
  ehrOrigin: EHR_ORIGIN,
  viewports: { desktop: DESKTOP, mobile: MOBILE },
  checks: [],
  routes: {},
  layoutNotes: [],
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
      viewport: null,
      consoleErrors: [],
      pageErrors: [],
      failedRequests: [],
      responseStatuses: [],
      requests: [],
      visibleTextSnippets: [],
      bodyLen: 0,
      layout: null,
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
      const body = await page.locator('body').innerText().catch(() => '');
      if (body.includes(t)) found.push(t);
    }
  }
  return found;
}

function attachCollectors(page, name) {
  const bucket = routeBucket(name);
  const onConsole = (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(msg.text());
  };
  const onPageError = (err) => {
    bucket.pageErrors.push(String(err && err.message ? err.message : err));
  };
  const onRequest = (req) => {
    bucket.requests.push({
      method: req.method(),
      url: req.url(),
      resourceType: req.resourceType(),
    });
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
        resourceType: res.request().resourceType(),
      });
    }
  };
  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('request', onRequest);
  page.on('requestfailed', onFailed);
  page.on('response', onResponse);
  return () => {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
    page.off('request', onRequest);
    page.off('requestfailed', onFailed);
    page.off('response', onResponse);
  };
}

async function screenshot(page, name) {
  const file = path.join(EVIDENCE, `W2-QA14-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  const bucket = routeBucket(name);
  if (!bucket.screenshots.includes(file)) bucket.screenshots.push(file);
  console.log(`SHOT  ${file}`);
  return file;
}

async function measureLayout(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollW = Math.max(doc.scrollWidth, body?.scrollWidth || 0);
    const scrollH = Math.max(doc.scrollHeight, body?.scrollHeight || 0);
    const overflowX = scrollW > vw + 2;
    const overflowY = scrollH > vh + 2;

    // Elements that extend past the viewport horizontally (sample)
    const overflowEls = [];
    const nodes = Array.from(document.querySelectorAll('body *')).slice(0, 800);
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right > vw + 4 || r.left < -4) {
        const tag = el.tagName.toLowerCase();
        const cls = (el.className && typeof el.className === 'string'
          ? el.className
          : ''
        ).slice(0, 80);
        overflowEls.push({
          tag,
          cls,
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
        if (overflowEls.length >= 12) break;
      }
    }

    // Zero-size main content risk
    const main =
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.querySelector('#root') ||
      body;
    const mainBox = main ? main.getBoundingClientRect() : null;

    // Overlapping fixed/sticky navs (simple height check)
    const fixed = Array.from(document.querySelectorAll('*')).filter((el) => {
      const s = getComputedStyle(el);
      return (s.position === 'fixed' || s.position === 'sticky') && el.getBoundingClientRect().height > 0;
    }).slice(0, 8).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
        top: Math.round(r.top),
        height: Math.round(r.height),
        width: Math.round(r.width),
      };
    });

    return {
      vw,
      vh,
      scrollW,
      scrollH,
      overflowX,
      overflowY,
      overflowEls,
      mainBox: mainBox
        ? {
            w: Math.round(mainBox.width),
            h: Math.round(mainBox.height),
            top: Math.round(mainBox.top),
          }
        : null,
      fixedSticky: fixed,
      childCount: body ? body.querySelectorAll('*').length : 0,
    };
  });
}

async function probeRoute(browser, route, viewportName, viewport, isMobile) {
  const name = `${route.key}-${viewportName}`;
  const context = await browser.newContext({
    viewport,
    isMobile: !!isMobile,
    hasTouch: !!isMobile,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const stop = attachCollectors(page, name);
  const bucket = routeBucket(name);
  bucket.viewport = viewport;

  let navError = null;
  try {
    await page.goto(`${MERGE_ORIGIN}${route.path}`, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });
  } catch (e) {
    navError = String(e && e.message ? e.message : e);
    // fallback softer wait
    try {
      await page.goto(`${MERGE_ORIGIN}${route.path}`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await page.waitForTimeout(2500);
    } catch (e2) {
      navError = String(e2 && e2.message ? e2.message : e2);
    }
  }

  bucket.finalUrl = page.url();
  await page.waitForTimeout(800);

  const found = await waitIdentity(page, route.identity, 20000);
  const body = await page.locator('body').innerText().catch(() => '');
  const bodyLen = body.replace(/\s+/g, ' ').trim().length;
  bucket.visibleTextSnippets = found;
  bucket.bodyLen = bodyLen;

  let layout = null;
  try {
    layout = await measureLayout(page);
    bucket.layout = layout;
  } catch (e) {
    bucket.layout = { error: String(e) };
  }

  const identityOk = found.length >= route.minIdentity && bodyLen > 80;
  check(
    `${name}-identity`,
    identityOk,
    `found=${JSON.stringify(found)}; bodyLen=${bodyLen}; url=${page.url()}${navError ? `; navNote=${navError.slice(0, 120)}` : ''}`,
    { found, bodyLen, finalUrl: page.url() },
  );

  // Layout checks
  const layoutBreaks = [];
  if (layout?.overflowX) {
    layoutBreaks.push(
      `horizontal overflow: scrollW=${layout.scrollW} > vw=${layout.vw}`,
    );
  }
  if (layout?.mainBox && (layout.mainBox.w < 50 || layout.mainBox.h < 40) && bodyLen > 80) {
    layoutBreaks.push(
      `main/root box very small: ${JSON.stringify(layout.mainBox)}`,
    );
  }
  if (layout?.overflowEls?.length && layout.overflowX) {
    layoutBreaks.push(
      `sample overflowing els: ${JSON.stringify(layout.overflowEls.slice(0, 5))}`,
    );
  }
  // Mobile: excessive fixed chrome stacking
  if (isMobile && layout?.fixedSticky?.length >= 4) {
    layoutBreaks.push(
      `many fixed/sticky layers on mobile (${layout.fixedSticky.length})`,
    );
  }

  const layoutOk = layoutBreaks.length === 0;
  check(
    `${name}-layout`,
    layoutOk,
    layoutOk
      ? `No severe layout breakage (vw=${layout?.vw} scrollW=${layout?.scrollW} main=${JSON.stringify(layout?.mainBox)})`
      : layoutBreaks.join(' | '),
    { layoutBreaks, layout },
  );

  if (!layoutOk) {
    results.layoutNotes.push({ route: name, notes: layoutBreaks, layout });
  } else if (layout?.overflowY) {
    results.layoutNotes.push({
      route: name,
      notes: [
        `Expected vertical scroll OK: scrollH=${layout.scrollH} vh=${layout.vh}`,
      ],
      severity: 'info',
    });
  }

  await screenshot(page, name);

  // Console / network summary checks (informational + fail on critical)
  const consoleErrs = bucket.consoleErrors || [];
  const pageErrs = bucket.pageErrors || [];
  const fails = bucket.failedRequests || [];
  const http4xx = (bucket.responseStatuses || []).filter((r) => r.status >= 400);

  check(
    `${name}-console`,
    consoleErrs.length === 0 && pageErrs.length === 0,
    consoleErrs.length === 0 && pageErrs.length === 0
      ? 'No console/page errors'
      : `console=${JSON.stringify(consoleErrs.slice(0, 8))}; pageErrors=${JSON.stringify(pageErrs.slice(0, 5))}`,
    { consoleErrs, pageErrs },
  );

  // Network failed: allow benign favicon/source-map; fail if app assets fail
  const criticalFails = fails.filter((f) => {
    const u = f.url || '';
    if (/\.map(\?|$)/.test(u)) return false;
    if (/favicon/i.test(u)) return false;
    return true;
  });
  check(
    `${name}-network`,
    criticalFails.length === 0,
    criticalFails.length === 0
      ? `No critical failed requests (rawFails=${fails.length}; http>=400=${http4xx.length})`
      : `Critical fails: ${JSON.stringify(criticalFails.slice(0, 12))}`,
    { fails, criticalFails, http4xx: http4xx.slice(0, 20) },
  );

  stop();
  await page.close();
  await context.close();
  return { name, identityOk, layoutOk };
}

async function probeEhr(browser) {
  const name = 'ehr-static';
  const context = await browser.newContext({
    viewport: DESKTOP,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  const stop = attachCollectors(page, name);
  const bucket = routeBucket(name);
  bucket.viewport = DESKTOP;

  const integrationLike = [];
  page.on('request', (req) => {
    const u = req.url();
    if (
      /:(5201|5173|5176|8787|3000)\b/.test(u) ||
      /\/api\//i.test(u) ||
      /cognito|amazonaws\.com|auth\.|oauth|openid/i.test(u) ||
      (/careindeed\.com/i.test(u) && !/5191/.test(u))
    ) {
      integrationLike.push({
        method: req.method(),
        url: u,
        type: req.resourceType(),
      });
    }
  });

  const responses = [];
  page.on('response', (res) => {
    responses.push({
      url: res.url(),
      status: res.status(),
      type: res.request().resourceType(),
    });
  });

  await page.goto(`${EHR_ORIGIN}/`, { waitUntil: 'networkidle', timeout: 60000 });
  bucket.finalUrl = page.url();
  const title = await page.title();
  check(
    'ehr-static-title',
    title === 'Care Indeed Home Health EHR Prototype',
    `document.title=${JSON.stringify(title)}`,
    { title },
  );

  const assets = responses.filter(
    (r) => /\.(css|js)(\?|$)/.test(r.url) || /\/assets\//.test(r.url),
  );
  const assetOk = assets.filter((r) => r.status >= 200 && r.status < 400);
  const assetFail = assets.filter((r) => r.status >= 400);
  check(
    'ehr-static-assets',
    assetOk.length >= 2 && assetFail.length === 0,
    `assetOk=${assetOk.length}; assetFail=${assetFail.length}`,
    { assetOk: assetOk.slice(0, 15), assetFail },
  );

  const allReqs = bucket.requests;
  const foreign = allReqs.filter((r) => {
    try {
      const u = new URL(r.url);
      return (
        u.origin !== EHR_ORIGIN &&
        !r.url.startsWith('data:') &&
        !r.url.startsWith('blob:')
      );
    } catch {
      return false;
    }
  });

  check(
    'ehr-no-policy-api-integration',
    integrationLike.length === 0,
    integrationLike.length === 0
      ? `No policy API/auth/backend integration traffic. requests=${allReqs.length}; foreignOrigins=${foreign.length}`
      : `FOUND integration-like: ${JSON.stringify(integrationLike)}`,
    {
      integrationLike,
      foreign: foreign.slice(0, 30),
      requestCount: allReqs.length,
      sampleRequests: allReqs.slice(0, 40),
    },
  );

  const body = await page.locator('body').innerText().catch(() => '');
  const bodyLen = body.replace(/\s+/g, ' ').trim().length;
  bucket.bodyLen = bodyLen;
  bucket.visibleTextSnippets = body.slice(0, 300).split(/\s+/).slice(0, 40);

  let layout = null;
  try {
    layout = await measureLayout(page);
    bucket.layout = layout;
  } catch (e) {
    bucket.layout = { error: String(e) };
  }

  check(
    'ehr-static-not-blank',
    bodyLen > 20 || (await page.locator('body *').count()) > 5,
    `bodyLen=${bodyLen}; title=${title}`,
  );

  await screenshot(page, name);

  check(
    `${name}-console`,
    (bucket.consoleErrors || []).length === 0 && (bucket.pageErrors || []).length === 0,
    (bucket.consoleErrors || []).length === 0
      ? 'No console/page errors'
      : `console=${JSON.stringify(bucket.consoleErrors.slice(0, 8))}`,
  );

  stop();
  await page.close();
  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    await probeRoute(browser, route, 'desktop', DESKTOP, false);
    await probeRoute(browser, route, 'mobile', MOBILE, true);
  }

  await probeEhr(browser);

  // Critical identity + EHR isolation must pass
  const criticalIds = [
    ...ROUTES.flatMap((r) => [
      `${r.key}-desktop-identity`,
      `${r.key}-mobile-identity`,
    ]),
    'ehr-static-title',
    'ehr-static-assets',
    'ehr-no-policy-api-integration',
    'ehr-static-not-blank',
  ];

  // Layout is critical for desktop; mobile overflow may be softer but still tracked
  const layoutCritical = ROUTES.map((r) => `${r.key}-desktop-layout`);

  const criticalPass = criticalIds.every((id) => results.checks.find((c) => c.id === id)?.ok);
  const layoutPass = layoutCritical.every((id) => results.checks.find((c) => c.id === id)?.ok);

  // Network/console residuals: note but do not auto-fail overall unless identity fails
  // Exception: EHR isolation already in critical
  results.overall = criticalPass && layoutPass ? 'PASS' : 'FAIL';
  results.finishedAt = new Date().toISOString();
  results.critical = Object.fromEntries(
    [...criticalIds, ...layoutCritical].map((id) => [
      id,
      !!results.checks.find((c) => c.id === id)?.ok,
    ]),
  );

  // Summarize residuals
  results.residuals = results.checks
    .filter((c) => !c.ok)
    .map((c) => ({ id: c.id, detail: c.detail }));

  const outJson = path.join(EVIDENCE, 'W2-QA14-playwright-results.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nOVERALL=${results.overall}`);
  console.log(`Wrote ${outJson}`);
  console.log(`Fails: ${results.residuals.length}`);
  for (const r of results.residuals) console.log(`  - ${r.id}: ${r.detail.slice(0, 200)}`);

  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.overall = 'FAIL';
  results.fatal = String(err && err.stack ? err.stack : err);
  fs.writeFileSync(
    path.join(EVIDENCE, 'W2-QA14-playwright-results.json'),
    JSON.stringify(results, null, 2),
    'utf8',
  );
  process.exit(2);
});
