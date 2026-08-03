/**
 * W2-QA05 EHR Launcher QA — merge-local-app-surfaces-2026-08-03
 * Asserts Reception EHR Prototype opens 5191; Find Home Care is separate.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = __dirname;
const MERGE_ORIGIN = process.env.MERGE_ORIGIN || 'http://127.0.0.1:5201';
const ALLOWED_EHR = new Set(['http://127.0.0.1:5191', 'http://127.0.0.1:5191/']);

const results = {
  agent: 'W2-QA05',
  startedAt: new Date().toISOString(),
  mergeOrigin: MERGE_ORIGIN,
  checks: [],
  overall: 'FAIL',
};

function check(id, ok, detail, extra = {}) {
  const row = { id, ok: !!ok, detail, ...extra };
  results.checks.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}: ${detail}`);
  return !!ok;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  await page.goto(`${MERGE_ORIGIN}/reception`, { waitUntil: 'networkidle', timeout: 60000 });
  results.finalUrl = page.url();

  const onLogin = page.url().includes('/login');
  check(
    'reception-reachable',
    !onLogin,
    onLogin ? `Redirected to login: ${page.url()}` : `On reception: ${page.url()}`,
  );

  const bodyText = await page.locator('body').innerText();
  const ehrHeadingVisible = await page
    .getByRole('heading', { name: 'EHR Prototype', exact: true })
    .isVisible()
    .catch(() => false);
  const fhcHeadingVisible = await page
    .getByRole('heading', { name: 'Find Home Care', exact: true })
    .isVisible()
    .catch(() => false);

  check(
    'ehr-prototype-control-visible',
    ehrHeadingVisible || bodyText.includes('EHR Prototype'),
    `headingVisible=${ehrHeadingVisible}; bodyHasLabel=${bodyText.includes('EHR Prototype')}`,
  );
  check(
    'find-home-care-control-visible',
    fhcHeadingVisible || bodyText.includes('Find Home Care'),
    `headingVisible=${fhcHeadingVisible}; bodyHasLabel=${bodyText.includes('Find Home Care')}`,
  );

  // Capture all workspace anchors and their href/target
  const anchors = await page.locator('a[href]').evaluateAll((nodes) =>
    nodes.map((n) => ({
      href: n.getAttribute('href'),
      target: n.getAttribute('target'),
      rel: n.getAttribute('rel'),
      text: (n.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    })),
  );

  const ehrAnchors = anchors.filter(
    (a) =>
      a.href === 'http://127.0.0.1:5191' ||
      a.href === 'http://127.0.0.1:5191/' ||
      (a.text && a.text.includes('EHR Prototype')),
  );
  const fhcAnchors = anchors.filter(
    (a) =>
      a.href === '/find-home-care' ||
      (a.href && a.href.includes('/find-home-care')) ||
      (a.text && a.text.includes('Find Home Care')),
  );

  results.ehrAnchors = ehrAnchors;
  results.fhcAnchors = fhcAnchors;

  const ehrExact = ehrAnchors.find((a) => ALLOWED_EHR.has(a.href));
  const ehrHref = ehrExact?.href ?? ehrAnchors[0]?.href ?? null;
  const ehrTarget = ehrExact?.target ?? ehrAnchors[0]?.target ?? null;

  check(
    'ehr-launcher-href-5191',
    ALLOWED_EHR.has(ehrHref),
    `href=${JSON.stringify(ehrHref)}; target=${JSON.stringify(ehrTarget)}; allowed=${[...ALLOWED_EHR].join(' | ')}`,
    { ehrHref, ehrTarget, ehrAnchorCount: ehrAnchors.length },
  );

  check(
    'ehr-launcher-target-blank',
    ehrTarget === '_blank',
    `target=${JSON.stringify(ehrTarget)} (expected _blank for external 5191 handoff)`,
    { ehrTarget },
  );

  // Count exact href variants in DOM
  const countNoSlash = await page.locator('a[href="http://127.0.0.1:5191"]').count();
  const countSlash = await page.locator('a[href="http://127.0.0.1:5191/"]').count();
  results.hrefCounts = { noSlash: countNoSlash, withSlash: countSlash };
  check(
    'ehr-href-dom-count',
    countNoSlash + countSlash >= 1,
    `a[href=5191]=${countNoSlash}; a[href=5191/]=${countSlash}`,
  );

  const fhcHref = fhcAnchors[0]?.href ?? null;
  const fhcTarget = fhcAnchors[0]?.target ?? null;
  check(
    'find-home-care-separate-route',
    !!fhcHref &&
      fhcHref !== ehrHref &&
      !String(fhcHref).includes('5191') &&
      (fhcHref === '/find-home-care' || String(fhcHref).includes('find-home-care')),
    `fhcHref=${JSON.stringify(fhcHref)}; fhcTarget=${JSON.stringify(fhcTarget)}; ehrHref=${JSON.stringify(ehrHref)}`,
    { fhcHref, fhcTarget },
  );

  check(
    'controls-are-distinct',
    ehrAnchors.length >= 1 && fhcAnchors.length >= 1 && ehrHref !== fhcHref,
    `ehrAnchors=${ehrAnchors.length}; fhcAnchors=${fhcAnchors.length}; distinct=${ehrHref !== fhcHref}`,
  );

  // Full-page reception screenshot
  const shotReception = path.join(EVIDENCE, 'W2-QA05-reception-ehr-launcher.png');
  await page.screenshot({ path: shotReception, fullPage: true });
  results.screenshots = [shotReception];
  console.log(`SHOT  ${shotReception}`);

  // Crop/focus: scroll EHR card into view and screenshot viewport around cards
  const ehrCard = page.locator('a[href="http://127.0.0.1:5191"], a[href="http://127.0.0.1:5191/"]').first();
  if ((await ehrCard.count()) > 0) {
    await ehrCard.scrollIntoViewIfNeeded();
    const shotEhr = path.join(EVIDENCE, 'W2-QA05-ehr-card-href.png');
    await page.screenshot({ path: shotEhr, fullPage: false });
    results.screenshots.push(shotEhr);
    console.log(`SHOT  ${shotEhr}`);
  }

  const fhcCard = page.locator('a[href="/find-home-care"]').first();
  if ((await fhcCard.count()) > 0) {
    await fhcCard.scrollIntoViewIfNeeded();
    const shotFhc = path.join(EVIDENCE, 'W2-QA05-find-home-care-card.png');
    await page.screenshot({ path: shotFhc, fullPage: false });
    results.screenshots.push(shotFhc);
    console.log(`SHOT  ${shotFhc}`);
  }

  results.finishedAt = new Date().toISOString();
  results.overall = results.checks.every((c) => c.ok) ? 'PASS' : 'FAIL';
  console.log(`OVERALL ${results.overall}`);

  const outJson = path.join(EVIDENCE, 'W2-QA05-playwright-results.json');
  fs.writeFileSync(outJson, JSON.stringify(results, null, 2), 'utf8');
  console.log(`JSON  ${outJson}`);

  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.error = String(err?.stack || err);
  results.finishedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(EVIDENCE, 'W2-QA05-playwright-results.json'),
    JSON.stringify(results, null, 2),
    'utf8',
  );
  process.exit(1);
});
