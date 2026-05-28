import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const SHOT_DIR = path.join(OUT_DIR, 'agent11-negative-edge-screenshots');
const JSON_PATH = path.join(OUT_DIR, 'agent11-negative-edge-supplemental.json');
const BASE = process.env.UAT_BASE_URL || 'http://localhost:5173';
const EVENT_ID = 'qapi_meeting-20260205-04';

fs.mkdirSync(SHOT_DIR, { recursive: true });

const auth = {
  session: {
    accessToken: 'agent11-supp-access',
    idToken: 'agent11-supp-id',
    refreshToken: 'agent11-supp-refresh',
    expiresIn: 3600,
    tokenType: 'Bearer',
  },
  expiresAt: Date.now() + 3600_000,
  user: {
    id: 'agent11-supp',
    email: 'agent11.supp@local',
    name: 'Agent 11 Supplemental',
    role: 'super_admin',
    firstName: 'Agent',
    lastName: 'Supplemental',
    emailVerified: true,
  },
};

const consoleEvents = [];
const results = [];
let n = 30;

async function shot(page, label) {
  n += 1;
  const file = path.join(SHOT_DIR, `${String(n).padStart(2, '0')}-${label}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  return file.replace(/\\/g, '/');
}

async function waitApp(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 20, null, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(900);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  page.on('console', msg => {
    const text = msg.text();
    if (/error|warning|duplicate|502|failed|exception|not found|missing/i.test(text)) consoleEvents.push({ type: msg.type(), text, url: page.url() });
  });
  page.on('pageerror', err => consoleEvents.push({ type: 'pageerror', text: err.message, url: page.url() }));
  await page.addInitScript(storedAuth => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    localStorage.setItem('ci_demo_auth_v1', JSON.stringify(storedAuth));
  }, auth);

  await page.goto(`${BASE}/calendar/event/${EVENT_ID}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await waitApp(page);
  results.push({ label: 'event', url: page.url(), text: (await page.locator('body').innerText()).slice(0, 1000), screenshot: await shot(page, 'supp-event') });

  await page.getByRole('button', { name: /Continue Workflow/i }).click().catch(() => {});
  await waitApp(page);
  const workflowText = await page.locator('body').innerText().catch(() => '');
  const buttons = await page.locator('button').evaluateAll(btns => btns.map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean));
  const links = await page.locator('a').evaluateAll(as => as.map(a => ({ text: (a.innerText || '').trim(), href: a.href })).filter(x => x.text || x.href));
  results.push({ label: 'after-continue-workflow', url: page.url(), text: workflowText.slice(0, 3000), buttons, links, screenshot: await shot(page, 'supp-after-continue-workflow') });

  const complete = page.getByRole('button', { name: /Complete Task|Verify Signature/i }).first();
  if (await complete.isVisible({ timeout: 5000 }).catch(() => false)) {
    await complete.click().catch(() => {});
    await page.waitForTimeout(1200);
    results.push({ label: 'completion-attempt', url: page.url(), text: (await page.locator('body').innerText()).slice(0, 2500), screenshot: await shot(page, 'supp-completion-attempt') });
  }

  const upload = page.getByRole('button', { name: /^Upload$/i }).first();
  if (await upload.isVisible({ timeout: 5000 }).catch(() => false)) {
    await upload.click().catch(() => {});
    await page.waitForTimeout(700);
    const fileInputs = await page.locator('input[type=file]').count();
    const modalText = await page.locator('body').innerText().catch(() => '');
    results.push({ label: 'upload-modal', fileInputs, url: page.url(), text: modalText.slice(0, 2500), screenshot: await shot(page, 'supp-upload-modal') });
    const nameInput = page.getByPlaceholder(/QAPI_May_Agenda|e\.g\./i).first();
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('malware-test-agent11.exe');
      await page.getByRole('button', { name: /^Upload$/i }).last().click().catch(() => {});
      await page.waitForTimeout(900);
      results.push({ label: 'unsupported-name-submit', url: page.url(), text: (await page.locator('body').innerText()).slice(0, 2500), screenshot: await shot(page, 'supp-unsupported-name-submit') });
    }
  }

  await browser.close();
  fs.writeFileSync(JSON_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), results, consoleEvents }, null, 2));
  console.log(JSON.stringify({ json: JSON_PATH, resultCount: results.length, consoleCount: consoleEvents.length }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
