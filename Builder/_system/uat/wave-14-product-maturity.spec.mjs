/**
 * Wave 14 product maturity + refinement pass.
 *
 * Captures mature showcase across desktop/laptop/tablet/mobile,
 * dark-light comparisons, responsive harmony walkthrough,
 * executive walkthrough, and guided UAT overlays.
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'wave-14-product-maturity');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'wave-14-product-maturity.json');
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
  await page.waitForTimeout(1100);
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
    await page.waitForTimeout(650);
    return true;
  }
  return false;
}

test.describe('Wave 14 — product maturity', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('wave-14-product-maturity dark-light showcase', async ({ page }) => {
    const routes = ['/dashboard', '/evidence', '/calendar?view=sprint', '/audit', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const primaryTheme = await themeKey(page);
      const primary = await shot(page, `maturity-desktop-${primaryTheme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'wave-14-product-maturity', route, theme: primaryTheme, screenshot: primary, viewport: 'desktop' });

      const toggled = await flipThemeIfPossible(page);
      if (toggled) {
        const altTheme = await themeKey(page);
        const alternate = await shot(page, `maturity-desktop-${altTheme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'wave-14-product-maturity', route, theme: altTheme, screenshot: alternate, viewport: 'desktop', toggled: true });
        await flipThemeIfPossible(page);
      }
    }
    expect(report.entries.length).toBeGreaterThan(8);
  });

  test('responsive harmony walkthrough', async ({ page }) => {
    const breakpoints = [
      { id: 'desktop', width: 1536, height: 960 },
      { id: 'laptop', width: 1280, height: 800 },
      { id: 'tablet', width: 834, height: 1112 },
      { id: 'mobile', width: 390, height: 844 },
    ];
    const routes = ['/dashboard', '/evidence', '/audit', '/calendar?view=sprint', '/my-tasks'];
    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      for (const route of routes) {
        await gotoAndWait(page, route);
        const theme = await themeKey(page);
        const capture = await shot(page, `responsive-${bp.id}-${theme}-${route.replace(/[/?=&]/g, '_')}`);
        record({ scenario: 'responsive-harmony', route, viewport: `${bp.width}x${bp.height}`, viewportLabel: bp.id, theme, screenshot: capture });
      }
    }
  });

  test('desktop regression', async ({ page }) => {
    await page.setViewportSize({ width: 1536, height: 960 });
    const routes = ['/dashboard', '/evidence', '/audit', '/calendar?view=sprint', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const theme = await themeKey(page);
      const capture = await shot(page, `desktop-regression-${theme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'desktop-regression', route, theme, screenshot: capture, viewport: '1536x960' });
    }
  });

  test('mobile regression', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const routes = ['/dashboard', '/evidence', '/audit', '/calendar?view=sprint', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const theme = await themeKey(page);
      const capture = await shot(page, `mobile-regression-${theme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'mobile-regression', route, theme, screenshot: capture, viewport: '390x844' });
    }
  });

  test('executive walkthrough', async ({ page }) => {
    const routes = ['/dashboard', '/audit', '/evidence', '/calendar?view=sprint', '/my-tasks'];
    for (const route of routes) {
      await gotoAndWait(page, route);
      const theme = await themeKey(page);
      const capture = await shot(page, `executive-walkthrough-${theme}-${route.replace(/[/?=&]/g, '_')}`);
      record({ scenario: 'executive-walkthrough', route, theme, screenshot: capture });
    }
  });

  test('guided UAT walkthrough', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
    await page.evaluate(() => window.dispatchEvent(new Event('careindeed:tour:restart')));
    await page.waitForTimeout(900);
    const first = await shot(page, 'guided-uat-wave14-step-1');
    record({ scenario: 'guided-uat-walkthrough', step: 1, screenshot: first });

    const next = page.getByRole('button', { name: /Next/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await page.waitForTimeout(600);
      const second = await shot(page, 'guided-uat-wave14-step-2');
      record({ scenario: 'guided-uat-walkthrough', step: 2, screenshot: second });
    }
  });
});

