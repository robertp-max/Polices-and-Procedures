/**
 * Wave 10 visual convergence + premium operational UX smoke.
 *
 * Captures desktop/mobile screenshot evidence with explicit runtime theme labels,
 * plus guided-UAT, evidence, signer-role, and calendar/task workflow views.
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'wave-10-uiux-premiumization');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'wave-10-uiux-premiumization.json');
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

async function themeKey(page) {
  return page.evaluate(() => {
    const html = document.documentElement;
    const theme = html.getAttribute('data-theme') ?? 'unknown-theme';
    const mode = html.getAttribute('data-ci-mode') ?? 'default-mode';
    return `${theme}-${mode}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  });
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

test.describe('Wave 10 — visual convergence + premium operational UX', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('wave-10-uiux-premiumization desktop surfaces', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/my-tasks',
      '/evidence',
      '/calendar?view=sprint',
      '/forms',
      '/audit',
      '/pm/dashboard',
    ];

    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `desktop-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'desktop', route, theme: primaryTheme, screenshot: primaryPath });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `desktop-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'desktop', route, theme: alternateTheme, screenshot: alternatePath, toggled: true });
        await flipThemeIfPossible(page);
      }
    }

    expect(report.entries.length).toBeGreaterThan(10);
  });

  test('mobile operational regression dark-light parity', async ({ page }) => {
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
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `mobile-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'mobile', route, theme: primaryTheme, screenshot: primaryPath, viewport: '390x844' });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `mobile-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'mobile', route, theme: alternateTheme, screenshot: alternatePath, viewport: '390x844', toggled: true });
        await flipThemeIfPossible(page);
      }
    }
  });

  test('guided UAT walkthrough captures', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await page.evaluate(() => window.dispatchEvent(new Event('careindeed:tour:restart')));
    await page.waitForTimeout(900);
    const first = await shot(page, 'guided-uat-wave10-step-1');
    record({ scenario: 'guided-uat', step: 1, screenshot: first });

    const next = page.getByRole('button', { name: /Next/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(600);
      const second = await shot(page, 'guided-uat-wave10-step-2');
      record({ scenario: 'guided-uat', step: 2, screenshot: second });
    }
  });

  test('evidence workflow captures', async ({ page }) => {
    await gotoAndWait(page, '/evidence');
    const fileLedgerToggle = page.getByRole('button', { name: /File ledger/i }).first();
    if (await fileLedgerToggle.isVisible().catch(() => false)) {
      await fileLedgerToggle.click();
      await page.waitForTimeout(500);
    }

    const fixturePath = path.join(__dirname, '..', 'reports', 'wave-10-upload-fixture.txt');
    fs.writeFileSync(fixturePath, `wave-10 fixture ${new Date().toISOString()}`);

    const input = page.locator('input[type="file"][aria-label="Upload evidence file"]').first();
    await input.setInputFiles(fixturePath);
    await page.waitForTimeout(1600);
    const afterUpload = await shot(page, 'evidence-wave10-after-upload');
    record({ scenario: 'evidence-workflow', step: 'after-upload', screenshot: afterUpload });

    const artifactBtn = page.getByRole('link', { name: /View Artifact/i }).first();
    if (await artifactBtn.isVisible().catch(() => false)) {
      await artifactBtn.click();
      await page.waitForTimeout(1200);
      const artifact = await shot(page, 'evidence-wave10-artifact-viewer');
      record({ scenario: 'evidence-workflow', step: 'artifact-viewer', screenshot: artifact });
    }
  });

  test('signer-role and calendar-task workflow captures', async ({ page }) => {
    await gotoAndWait(page, '/forms/QA-FM-021?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001');
    const signer = await shot(page, 'signer-role-wave10-form-surface');
    record({ scenario: 'signer-role', screenshot: signer });

    await gotoAndWait(page, '/calendar?view=sprint');
    const openDetails = page.getByRole('button', { name: /Open Details/i }).first();
    if (await openDetails.isVisible().catch(() => false)) {
      await openDetails.click();
      await page.waitForTimeout(1000);
    }
    const calendar = await shot(page, 'calendar-wave10-task-workflow');
    record({ scenario: 'calendar-task-workflow', screenshot: calendar });
  });
});

