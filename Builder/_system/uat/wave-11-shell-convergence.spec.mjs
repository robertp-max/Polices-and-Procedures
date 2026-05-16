/**
 * Wave 11 shell convergence + premium command-center polish.
 *
 * Captures shell cohesion, desktop/mobile parity, executive showcase flow,
 * evidence workflow, and guided UAT walkthrough.
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'wave-11-shell-convergence');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'wave-11-shell-convergence.json');
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

test.describe('Wave 11 — shell convergence', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('wave-11-shell-convergence', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    const theme = await themeKey(page);
    const shellDashboard = await shot(page, `shell-${theme}-dashboard`);
    record({ scenario: 'shell-convergence', route: '/dashboard', theme, screenshot: shellDashboard });

    const shellCalendarRoute = '/calendar?view=sprint';
    await gotoAndWait(page, shellCalendarRoute);
    const shellCalendar = await shot(page, `shell-${theme}-calendar-sprint`);
    record({ scenario: 'shell-convergence', route: shellCalendarRoute, theme, screenshot: shellCalendar });
  });

  test('desktop regression dark-light parity', async ({ page }) => {
    const routes = ['/dashboard', '/my-tasks', '/evidence', '/audit', '/calendar?view=sprint', '/pm/dashboard', '/forms'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `desktop-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'desktop-regression', route, theme: primaryTheme, screenshot: primaryPath });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `desktop-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'desktop-regression', route, theme: alternateTheme, screenshot: alternatePath, toggled: true });
        await flipThemeIfPossible(page);
      }
    }
    expect(report.entries.length).toBeGreaterThan(10);
  });

  test('mobile operational regression dark-light parity', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/dashboard', '/my-tasks', '/evidence', '/audit', '/calendar?view=sprint', '/forms'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `mobile-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'mobile-regression', route, theme: primaryTheme, screenshot: primaryPath, viewport: '390x844' });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `mobile-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'mobile-regression', route, theme: alternateTheme, screenshot: alternatePath, viewport: '390x844', toggled: true });
        await flipThemeIfPossible(page);
      }
    }
  });

  test('executive showcase walkthrough', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/audit',
      '/evidence',
      '/calendar?view=sprint',
      '/pm/dashboard',
    ];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const theme = await themeKey(page);
      const capture = await shot(page, `executive-${theme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'executive-showcase', route, theme, screenshot: capture });
    }
  });

  test('evidence workflow walkthrough', async ({ page }) => {
    await gotoAndWait(page, '/evidence');
    const fileLedgerToggle = page.getByRole('button', { name: /File ledger/i }).first();
    if (await fileLedgerToggle.isVisible().catch(() => false)) {
      await fileLedgerToggle.click();
      await page.waitForTimeout(500);
    }

    const fixturePath = path.join(__dirname, '..', 'reports', 'wave-11-upload-fixture.txt');
    fs.writeFileSync(fixturePath, `wave-11 fixture ${new Date().toISOString()}`);

    const input = page.locator('input[type="file"][aria-label="Upload evidence file"]').first();
    await input.setInputFiles(fixturePath);
    await page.waitForTimeout(1600);
    const afterUpload = await shot(page, 'evidence-wave11-after-upload');
    record({ scenario: 'evidence-workflow', step: 'after-upload', screenshot: afterUpload });
  });

  test('guided UAT walkthrough', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await page.evaluate(() => window.dispatchEvent(new Event('careindeed:tour:restart')));
    await page.waitForTimeout(900);
    const first = await shot(page, 'guided-uat-wave11-step-1');
    record({ scenario: 'guided-uat', step: 1, screenshot: first });

    const next = page.getByRole('button', { name: /Next/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(600);
      const second = await shot(page, 'guided-uat-wave11-step-2');
      record({ scenario: 'guided-uat', step: 2, screenshot: second });
    }
  });
});

