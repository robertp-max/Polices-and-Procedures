const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.UAT_BASE_URL || 'http://localhost:5176';
const OUT_DIR = __dirname;
const SHOT_DIR = path.join(OUT_DIR, 'agent09-print-download-screenshots');
const CAPTURE_PDFS = process.env.AGENT09_CAPTURE_PDFS === '1';
fs.mkdirSync(SHOT_DIR, { recursive: true });

const testers = [
  { id: 'ADM-06', role: 'Administrator', identity: 'Administrator', persona: 'Detail-Oriented Perfectionist' },
  { id: 'DON-05', role: 'Director of Nursing', identity: 'Director of Nursing', persona: 'Detail-Oriented Perfectionist' },
  { id: 'HCP-06', role: 'Finance/Revenue Cycle Leader', identity: 'Finance/Revenue Cycle Leader', persona: 'Tech-Savvy Early Adopter' },
  { id: 'HCP-07', role: 'Surveyor/External Auditor', identity: 'Surveyor/External Auditor Persona', persona: 'Frontline Workflow Realist' },
];

const routes = [
  { id: 'policy-library-gv', surface: 'Policy Library', route: '/library/GV-GB-001', expected: ['GV-GB-001', 'Governing Body'] },
  { id: 'policy-print-gv', surface: 'Policy Print', route: '/print/GV-GB-001', expected: ['GV-GB-001', 'Care Indeed'] },
  { id: 'policy-autoprint-gv', surface: 'Policy Auto Print', route: '/print/GV-GB-001?autoprint=1', expected: ['GV-GB-001'] },
  { id: 'surveyor-policy-gv', surface: 'Surveyor Policy', route: '/surveyor/policy/GV-GB-001', expected: ['GV-GB-001'] },
  { id: 'form-print-cl-011', surface: 'Form Print', route: '/forms/CL-FM-011/print', expected: ['CL-FM-011', 'Care Indeed'] },
  { id: 'form-print-gv-005', surface: 'Form Print', route: '/forms/GV-FM-005/print', expected: ['GV-FM-005', 'Care Indeed'] },
  { id: 'artifact-evidence-package', surface: 'Artifact Viewer', route: '/artifacts/EVT-DEMO-001::TASK-DEMO-001?event_id=EVT-DEMO-001&task_id=TASK-DEMO-001&type=evidence_package', expected: ['Artifact Viewer', 'Evidence ID', 'Workflow ID'] },
  { id: 'artifact-unknown-signed', surface: 'Signed Artifact', route: '/artifacts/agent09-signed-artifact-smoke?type=signature&evidence_id=agent09-signed-artifact-smoke&event_id=EVT-DEMO-001&task_id=TASK-DEMO-001&form_id=CL-FM-011', expected: ['Artifact Viewer', 'signature'] },
  { id: 'evidence-files', surface: 'Evidence Center', route: '/evidence?event_id=EVT-DEMO-001&view=files', expected: ['Evidence', 'Download'] },
  { id: 'audit-mode', surface: 'Audit Mode', route: '/audit', expected: ['Audit'] },
];

function slug(value) {
  return value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function visibleTextSample(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 1200);
}

async function runRoute(page, tester, perspective, routeSpec) {
  const consoleMessages = [];
  const pageErrors = [];
  const responses = [];
  const downloads = [];

  page.on('console', msg => {
    const type = msg.type();
    if (['error', 'warning'].includes(type)) consoleMessages.push(`${type}: ${msg.text()}`);
  });
  page.on('pageerror', err => pageErrors.push(err.message));
  page.on('response', res => {
    if (res.status() >= 400) responses.push(`${res.status()} ${res.url()}`);
  });
  page.on('download', async download => {
    const suggested = download.suggestedFilename();
    const saveAs = path.join(OUT_DIR, `agent09-print-download-${tester.id}-${perspective}-${routeSpec.id}-${slug(suggested)}`);
    try {
      await download.saveAs(saveAs);
      downloads.push(saveAs);
    } catch (err) {
      downloads.push(`FAILED:${suggested}:${err.message}`);
    }
  });

  const url = new URL(routeSpec.route, BASE_URL).toString();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 22000 });
  await page.waitForLoadState('networkidle', { timeout: 3500 }).catch(() => {});
  await page.waitForTimeout(350);

  const title = await page.title().catch(() => '');
  const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
  const html = await page.content().catch(() => '');
  const printCalls = await page.evaluate(() => window.__agent09PrintCalls || []).catch(() => []);
  const iframeCount = await page.locator('iframe').count().catch(() => 0);
  const visibleLogoCount = await page.locator('img[alt*="Care" i], img[src*="logo" i], img[src*="mark" i]').count().catch(() => 0);
  const blankish = visibleTextSample(text).length < 80;
  const expectedMissing = routeSpec.expected.filter(item => !text.toLowerCase().includes(item.toLowerCase()));
  const legacyGold = /#b8860b|#d4af37|mustard|gold|amber-700|bg-amber|text-amber/i.test(html);
  const screenshot = path.join(SHOT_DIR, `agent09-print-download-${tester.id}-${perspective}-${routeSpec.id}.png`);
  await page.screenshot({ path: screenshot, fullPage: false }).catch(() => {});

  let pdfPath = '';
  if (CAPTURE_PDFS && /print|policy|form|artifact/i.test(routeSpec.surface)) {
    pdfPath = path.join(OUT_DIR, `agent09-print-download-${tester.id}-${perspective}-${routeSpec.id}.pdf`);
    await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true }).catch(err => {
      pdfPath = `PDF_FAILED:${err.message}`;
    });
  }

  return {
    tester_id: tester.id,
    professional_identity: tester.identity,
    personality: tester.persona,
    perspective,
    surface: routeSpec.surface,
    route: routeSpec.route,
    url,
    title,
    expectedMissing,
    blankish,
    legacyGold,
    visibleLogoCount,
    iframeCount,
    printCalls: printCalls.length,
    consoleMessages,
    pageErrors,
    failedResponses: responses,
    downloads,
    screenshot,
    pdfPath,
    textSample: visibleTextSample(text),
  };
}

async function clickAuditExports(page) {
  const results = [];
  await page.goto(new URL('/audit', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 22000 });
  await page.waitForLoadState('networkidle', { timeout: 3500 }).catch(() => {});
  for (const name of ['Rollup', 'Bundle', 'JSON', 'Print / PDF', 'Markdown']) {
    const button = page.getByRole('button', { name: new RegExp(name, 'i') }).first();
    if (!(await button.count().catch(() => 0))) {
      results.push({ name, status: 'missing' });
      continue;
    }
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await button.click().catch(err => results.push({ name, status: `click_failed:${err.message}` }));
    const download = await downloadPromise;
    if (!download) {
      results.push({ name, status: 'no_download_event' });
      continue;
    }
    const filePath = path.join(OUT_DIR, `agent09-print-download-audit-export-${slug(name)}-${slug(download.suggestedFilename())}`);
    await download.saveAs(filePath).catch(err => results.push({ name, status: `save_failed:${err.message}` }));
    if (fs.existsSync(filePath)) results.push({ name, status: 'downloaded', filePath, size: fs.statSync(filePath).size });
  }
  return results;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    acceptDownloads: true,
    ignoreHTTPSErrors: true,
  });
  await context.addInitScript(() => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    window.__agent09PrintCalls = [];
    window.print = () => {
      window.__agent09PrintCalls.push({ at: Date.now(), href: location.href });
    };
  });

  const results = [];
  for (const tester of testers) {
    for (const perspective of ['new-user', 'power-user']) {
      await context.addInitScript(({ tester, perspective }) => {
        localStorage.setItem('hhc_actor_id', tester.id);
        localStorage.setItem('hhc_actor_role', `${tester.role} (${perspective})`);
      }, { tester, perspective });
      const page = await context.newPage();
      for (const routeSpec of routes) {
        results.push(await runRoute(page, tester, perspective, routeSpec));
      }
      await page.close();
    }
  }

  const auditPage = await context.newPage();
  const auditExports = await clickAuditExports(auditPage);
  const auditExportScreenshot = path.join(SHOT_DIR, 'agent09-print-download-audit-export-after-clicks.png');
  await auditPage.screenshot({ path: auditExportScreenshot, fullPage: false }).catch(() => {});
  await auditPage.close();

  await browser.close();

  const output = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    assignedTesters: testers,
    scope: 'Print/download parity for policies, forms, signed artifacts, evidence downloads/open, audit packet export.',
    results,
    auditExports,
    auditExportScreenshot,
  };
  fs.writeFileSync(path.join(OUT_DIR, 'agent09-print-download-playwright-results.json'), JSON.stringify(output, null, 2));
  console.log(JSON.stringify({
    resultPath: path.join(OUT_DIR, 'agent09-print-download-playwright-results.json'),
    routeRuns: results.length,
    auditExports,
  }, null, 2));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
