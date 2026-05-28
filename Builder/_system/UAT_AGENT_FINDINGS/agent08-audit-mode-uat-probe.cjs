const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const outDir = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const prefix = 'agent08-audit-mode';
const baseURL = process.env.UAT_BASE_URL || 'http://localhost:5175';
const routes = [
  { id: 'dashboard', path: '/dashboard' },
  { id: 'audit', path: '/audit' },
  { id: 'evidence', path: '/evidence' },
  { id: 'ces-calendar', path: '/ces/calendar' },
  { id: 'v3-staging', path: '/ui-staging/v32' },
];

function safeName(s) { return s.replace(/[^a-z0-9-]+/gi, '-').toLowerCase(); }
async function getText(page) {
  return await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
}
async function visibleCount(page, selector) {
  return await page.locator(selector).count().catch(() => 0);
}
async function texts(page, selector, limit = 30) {
  return await page.locator(selector).evaluateAll((els, n) => els.slice(0, n).map(e => (e.innerText || e.textContent || '').trim()).filter(Boolean), limit).catch(() => []);
}
async function attrs(page, selector, attr, limit = 50) {
  return await page.locator(selector).evaluateAll((els, data) => els.slice(0, data.limit).map(e => e.getAttribute(data.attr)).filter(Boolean), { attr, limit }).catch(() => []);
}
async function clickByRegex(page, regex, label, routeId, results) {
  const beforeUrl = page.url();
  const loc = page.getByRole('button', { name: regex }).first();
  const found = await loc.count().catch(() => 0);
  if (!found) return { label, found: false };
  try {
    await loc.click({ timeout: 3000 });
    await page.waitForTimeout(900);
    const shot = path.join(outDir, `${prefix}-${safeName(routeId)}-${safeName(label)}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const text = await getText(page);
    results.screenshots.push(shot);
    return { label, found: true, clicked: true, urlBefore: beforeUrl, urlAfter: page.url(), textSample: text.slice(0, 1200), screenshot: shot };
  } catch (e) {
    return { label, found: true, clicked: false, error: String(e.message || e) };
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  const results = { baseURL, startedAt: new Date().toISOString(), routes: [], console: [], pageErrors: [], screenshots: [], downloads: [], popups: [], printCalls: [] };
  page.on('console', msg => results.console.push({ type: msg.type(), text: msg.text(), url: page.url() }));
  page.on('pageerror', err => results.pageErrors.push({ message: err.message, stack: err.stack, url: page.url() }));
  page.on('popup', async popup => {
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    results.popups.push({ url: popup.url(), title: await popup.title().catch(() => '') });
    await popup.close().catch(() => {});
  });
  await page.addInitScript(() => {
    window.__uatPrintCalls = [];
    const originalPrint = window.print;
    window.print = function() { window.__uatPrintCalls.push({ href: location.href, at: new Date().toISOString() }); return undefined; };
  });

  for (const route of routes) {
    const rec = { id: route.id, path: route.path, url: `${baseURL}${route.path}`, ok: false, status: null, title: '', bodySample: '', metrics: {}, buttons: [], links: [], artifactLinks: [], interactions: [], screenshot: '' };
    try {
      const response = await page.goto(rec.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      rec.status = response ? response.status() : null;
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1200);
      rec.title = await page.title().catch(() => '');
      const text = await getText(page);
      rec.bodySample = text.slice(0, 5000);
      rec.ok = !!text && !/404|not found|missing route|application error/i.test(text.slice(0, 1000));
      rec.metrics = {
        totalTextLength: text.length,
        hasSurveyPacket: /survey packet|packet/i.test(text),
        hasEvidenceRollup: /evidence rollup|rollup/i.test(text),
        hasPolicyTrace: /policy[_ -]?to[_ -]?evidence|policy.*evidence|policy_id/i.test(text),
        hasEventTrace: /event[_ -]?to[_ -]?evidence|event.*evidence|event_id/i.test(text),
        hasSignedArtifact: /signed artifact|signed pdf|certificate|signed package|signed_form_instance/i.test(text),
        hasMissingEvidence: /missing evidence|missing required|missing forms|not ready|blocker/i.test(text),
        hasReadinessScore: /readiness|audit ready|score|%/.test(text),
        hasQ1Locked: /Q1|Quarter 1|locked package|locked/i.test(text),
        buttons: await visibleCount(page, 'button'),
        links: await visibleCount(page, 'a[href]'),
        inputs: await visibleCount(page, 'input, textarea, select'),
      };
      rec.buttons = await texts(page, 'button', 80);
      rec.links = await attrs(page, 'a[href]', 'href', 80);
      rec.artifactLinks = rec.links.filter(h => /artifact|evidence|audit|download|print/i.test(h));
      const shot = path.join(outDir, `${prefix}-${safeName(route.id)}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      rec.screenshot = shot;
      results.screenshots.push(shot);

      if (route.id === 'audit') {
        for (const [regex, label] of [
          [/readiness|audit ready|score/i, 'readiness-drilldown'],
          [/survey|packet|generate/i, 'survey-packet'],
          [/export|download/i, 'export-download'],
          [/print/i, 'print'],
          [/evidence/i, 'evidence-drilldown'],
        ]) rec.interactions.push(await clickByRegex(page, regex, label, route.id, results));
      }
      if (route.id === 'evidence') {
        for (const [regex, label] of [
          [/open artifact|view artifact|artifact viewer/i, 'open-artifact'],
          [/download|export/i, 'download-export'],
          [/print/i, 'print'],
          [/2026|Q1|Quarter/i, 'q1-filter'],
        ]) rec.interactions.push(await clickByRegex(page, regex, label, route.id, results));
      }
      if (route.id === 'dashboard') {
        for (const [regex, label] of [
          [/audit|readiness/i, 'dashboard-audit-link'],
          [/evidence/i, 'dashboard-evidence-link'],
        ]) rec.interactions.push(await clickByRegex(page, regex, label, route.id, results));
      }
      if (route.id === 'ces-calendar') {
        rec.interactions.push(await clickByRegex(page, /evidence|artifact|audit|open|details/i, 'ces-detail-open', route.id, results));
      }
      rec.printCalls = await page.evaluate(() => window.__uatPrintCalls || []).catch(() => []);
    } catch (e) {
      rec.error = String(e.message || e);
      try {
        const shot = path.join(outDir, `${prefix}-${safeName(route.id)}-error.png`);
        await page.screenshot({ path: shot, fullPage: true });
        rec.screenshot = shot;
        results.screenshots.push(shot);
      } catch {}
    }
    results.routes.push(rec);
  }

  // Try opening first artifact-ish link from evidence/audit route if present.
  const artifactCandidates = [...new Set(results.routes.flatMap(r => r.artifactLinks || []))].filter(Boolean);
  for (const candidate of artifactCandidates.slice(0, 5)) {
    const url = candidate.startsWith('http') ? candidate : new URL(candidate, baseURL).toString();
    const rec = { candidate, url };
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(800);
      const text = await getText(page);
      rec.status = response ? response.status() : null;
      rec.textSample = text.slice(0, 2000);
      rec.hasPreview = /preview|artifact|certificate|signed|download|metadata|policy_id|event_id|task_id/i.test(text);
      const shot = path.join(outDir, `${prefix}-artifact-candidate-${safeName(candidate).slice(0,60)}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      rec.screenshot = shot;
      results.screenshots.push(shot);
    } catch (e) { rec.error = String(e.message || e); }
    results.routes.push({ id: 'artifact-candidate', path: candidate, ...rec });
  }

  results.printCalls = await page.evaluate(() => window.__uatPrintCalls || []).catch(() => []);
  results.finishedAt = new Date().toISOString();
  const jsonPath = path.join(outDir, `${prefix}-playwright-results.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(jsonPath);
  await browser.close();
})();
