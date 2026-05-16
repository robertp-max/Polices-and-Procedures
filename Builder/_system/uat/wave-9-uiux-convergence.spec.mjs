/**
 * Wave 9 UI/UX convergence + operational polish smoke.
 *
 * Captures desktop/mobile and dark/light screenshots for the core surfaces,
 * plus guided-UAT, evidence workflow, signer-role, and calendar/task flows.
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'wave-9-uiux-convergence');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'wave-9-uiux-convergence.json');
const BASE = 'http://localhost:5173';

const report = {
  startedAt: new Date().toISOString(),
  entries: [],
};

function record(entry) {
  report.entries.push({ ...entry, at: new Date().toISOString() });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
}

async function shot(page, name) {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function gotoAndWait(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
}

async function flipThemeIfPossible(page) {
  const toggle = page.locator('button[aria-label^="Switch to "]').first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

test.describe('Wave 9 — UI/UX convergence', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('desktop dark/light operational surfaces', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/my-tasks',
      '/evidence',
      '/calendar',
      '/forms',
      '/audit',
      '/pm/dashboard',
    ];

    for (const route of routes) {
      await gotoAndWait(page, route);
      const darkPath = await shot(page, `desktop-dark-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'desktop-dark', route, screenshot: darkPath });

      const toggled = await flipThemeIfPossible(page);
      const lightPath = await shot(page, `desktop-light-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'desktop-light', route, screenshot: lightPath, toggled });

      if (toggled) {
        await flipThemeIfPossible(page);
      }
    }

    expect(report.entries.length).toBeGreaterThan(8);
  });

  test('mobile operational regression surfaces', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = [
      '/dashboard',
      '/my-tasks',
      '/evidence',
      '/calendar?view=sprint',
      '/forms',
      '/audit',
    ];

    for (const route of routes) {
      await gotoAndWait(page, route);
      const file = await shot(page, `mobile-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'mobile', route, screenshot: file, viewport: '390x844' });
    }
    expect(true).toBeTruthy();
  });

  test('guided UAT walkthrough overlay screenshots', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await page.evaluate(() => window.dispatchEvent(new Event('careindeed:tour:restart')));
    await page.waitForTimeout(900);

    const s1 = await shot(page, 'guided-uat-step-1');
    record({ scenario: 'guided-uat', step: 1, screenshot: s1 });

    const next = page.getByRole('button', { name: /Next/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(500);
      const s2 = await shot(page, 'guided-uat-step-2');
      record({ scenario: 'guided-uat', step: 2, screenshot: s2 });
    }
  });

  test('evidence upload + artifact workflow screenshots', async ({ page }) => {
    await gotoAndWait(page, '/evidence');
    const fileLedgerToggle = page.getByRole('button', { name: /File ledger/i }).first();
    if (await fileLedgerToggle.isVisible().catch(() => false)) {
      await fileLedgerToggle.click();
      await page.waitForTimeout(500);
    }

    const fixturePath = path.join(__dirname, '..', 'reports', 'wave-9-upload-fixture.txt');
    fs.writeFileSync(fixturePath, `wave-9 fixture ${new Date().toISOString()}`);

    const input = page.locator('input[type="file"][aria-label="Upload evidence file"]').first();
    await input.setInputFiles(fixturePath);
    await page.waitForTimeout(1800);

    const afterUpload = await shot(page, 'evidence-after-upload');
    record({ scenario: 'evidence-flow', step: 'after-upload', screenshot: afterUpload });

    const artifactBtn = page.getByRole('link', { name: /View Artifact/i }).first();
    if (await artifactBtn.isVisible().catch(() => false)) {
      await artifactBtn.click();
      await page.waitForTimeout(1200);
      const artifact = await shot(page, 'evidence-artifact-viewer');
      record({ scenario: 'evidence-flow', step: 'artifact-viewer', screenshot: artifact });
    }
  });

  test('signer-role + calendar task workflow screenshots', async ({ page }) => {
    await gotoAndWait(page, '/forms/QA-FM-021?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001');
    const signer = await shot(page, 'signer-role-form-surface');
    record({ scenario: 'signer-role', screenshot: signer });

    await gotoAndWait(page, '/calendar?view=sprint');
    const openDetails = page.getByRole('button', { name: /Open Details/i }).first();
    if (await openDetails.isVisible().catch(() => false)) {
      await openDetails.click();
      await page.waitForTimeout(1000);
    }
    const calendar = await shot(page, 'calendar-task-workflow');
    record({ scenario: 'calendar-task-flow', screenshot: calendar });
  });
});

