/**
 * Wave 12 visible UI delta pass.
 *
 * Captures high-impact desktop/mobile dark/light screenshots for:
 * Dashboard, Evidence, Calendar, Audit, My Tasks, shell framing,
 * executive walkthrough, and guided UAT overlays.
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'wave-12-visible-delta');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'wave-12-visible-delta.json');
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

test.describe('Wave 12 — visible delta', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('wave-12-visible-delta core shell + hero captures', async ({ page }) => {
    const routes = ['/dashboard', '/evidence', '/calendar?view=sprint', '/audit', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `delta-desktop-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'visible-delta-core', route, theme: primaryTheme, screenshot: primaryPath });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `delta-desktop-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'visible-delta-core', route, theme: alternateTheme, screenshot: alternatePath, toggled: true });
        await flipThemeIfPossible(page);
      }
    }
    expect(report.entries.length).toBeGreaterThan(8);
  });

  test('wave-12 mobile regression captures', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/dashboard', '/evidence', '/calendar?view=sprint', '/audit', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primaryPath = await shot(page, `delta-mobile-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'mobile-regression', route, theme: primaryTheme, screenshot: primaryPath, viewport: '390x844' });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const alternateTheme = await themeKey(page);
        const alternatePath = await shot(page, `delta-mobile-${alternateTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'mobile-regression', route, theme: alternateTheme, screenshot: alternatePath, viewport: '390x844', toggled: true });
        await flipThemeIfPossible(page);
      }
    }
  });

  test('wave-12 executive showcase walkthrough', async ({ page }) => {
    const routes = ['/dashboard', '/audit', '/evidence', '/calendar?view=sprint', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const theme = await themeKey(page);
      const capture = await shot(page, `executive-wave12-${theme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'executive-showcase', route, theme, screenshot: capture });
    }
  });

  test('wave-12 guided UAT walkthrough', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await page.evaluate(() => window.dispatchEvent(new Event('careindeed:tour:restart')));
    await page.waitForTimeout(900);
    const first = await shot(page, 'guided-uat-wave12-step-1');
    record({ scenario: 'guided-uat', step: 1, screenshot: first });

    const next = page.getByRole('button', { name: /Next/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(600);
      const second = await shot(page, 'guided-uat-wave12-step-2');
      record({ scenario: 'guided-uat', step: 2, screenshot: second });
    }
  });
});

