import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.ROUND0_BASE_URL ?? 'http://127.0.0.1:5178';
const artifactDir =
  process.env.ROUND0_MATRIX_ARTIFACT_DIR ??
  path.resolve('test-results/round0-ux/viewport-matrix');

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'tablet-820', width: 820, height: 1180 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-320', width: 320, height: 700 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await fs.mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
    });

    try {
      await context.addInitScript(() => {
        localStorage.setItem('gb-portal-version', 'v3');
        Object.keys(localStorage)
          .filter((key) =>
            key.startsWith('care-indeed:gb:compliance:draft:gb:tabletop2026:'),
          )
          .forEach((key) => localStorage.removeItem(key));
      });

      const page = await context.newPage();
      const errors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      await page.goto(`${baseUrl}/governance`, { waitUntil: 'networkidle' });
      const openNavigation = page.getByRole('button', { name: 'Open navigation' });
      if (await openNavigation.isVisible()) {
        await openNavigation.click();
      }
      await page.getByRole('button', { name: 'Oversight', exact: true }).click();
      await page.getByRole('button', { name: /Launch simulation/ }).click();
      await page.locator('.bs-hub-shell').waitFor();
      await page.locator('.bs-pack-card').first().getByRole('button').first().click();
      await page.locator('.bs-readiness').waitFor({ timeout: 30_000 });

      const metrics = await page.evaluate(() => {
        const session = document.querySelector('.bs-session');
        const rect = session?.getBoundingClientRect();
        window.scrollTo(0, 500);
        return {
          session: rect
            ? {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              }
            : null,
          bodyLocked: document.body.classList.contains('gb-tabletop-viewport-lock'),
          bodyOverflow: document.body.style.overflow,
          htmlOverflow: document.documentElement.style.overflow,
          windowScrollY: window.scrollY,
          horizontalOverflow:
            document.documentElement.scrollWidth > window.innerWidth,
          visiblePanels: Array.from(
            document.querySelectorAll(
              '.bs-readiness-workspace > [role="tabpanel"]',
            ),
          ).filter((panel) => panel.getClientRects().length > 0).length,
          visibleTabs: Array.from(
            document.querySelectorAll('.bs-session-tabs [role="tab"]'),
          ).filter((tab) => tab.getClientRects().length > 0).length,
        };
      });

      assert(metrics.bodyLocked, `${viewport.name}: body lock is missing.`);
      assert(metrics.bodyOverflow === 'hidden', `${viewport.name}: body can scroll.`);
      assert(metrics.htmlOverflow === 'hidden', `${viewport.name}: HTML can scroll.`);
      assert(metrics.windowScrollY === 0, `${viewport.name}: document scroll moved.`);
      assert(!metrics.horizontalOverflow, `${viewport.name}: horizontal overflow detected.`);
      assert(metrics.session?.left === 0 && metrics.session?.top === 0, `${viewport.name}: session is offset.`);
      assert(metrics.session?.width === viewport.width, `${viewport.name}: session width mismatch.`);
      assert(metrics.session?.height === viewport.height, `${viewport.name}: session height mismatch.`);
      assert(errors.length === 0, `${viewport.name}: console errors: ${errors.join(' | ')}`);

      if (viewport.width <= 767) {
        assert(metrics.visibleTabs === 3, `${viewport.name}: mobile tabs are missing.`);
        assert(metrics.visiblePanels === 1, `${viewport.name}: more than one panel is visible.`);
      } else {
        assert(metrics.visibleTabs === 0, `${viewport.name}: mobile tabs are visible.`);
        assert(metrics.visiblePanels === 3, `${viewport.name}: desktop/tablet panels are missing.`);
      }

      await page.screenshot({
        path: path.join(artifactDir, `${viewport.name}.png`),
        fullPage: false,
      });

      results.push({ ...viewport, status: 'passed', ...metrics });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(artifactDir, 'results.json'),
  JSON.stringify(results, null, 2),
  'utf8',
);

console.log(JSON.stringify(results, null, 2));
