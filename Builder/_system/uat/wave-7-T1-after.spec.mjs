/**
 * wave-7-T1-after.spec.mjs — Wave 7 T1 AFTER screenshot capture
 *
 * T1 only touched scripts/verifyUiDesignSystem.ts (a build-time verifier),
 * so runtime visual output MUST be pixel-near identical to the baselines.
 * This spec captures a tight 6-screenshot smoke (3 surfaces × 2 viewports)
 * on the canonical dev-server port so a human can spot-check that nothing
 * regressed.
 *
 * Output: Builder/_system/screenshots/wave-7-after/T1/{desktop,mobile}/*.png
 */
import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', 'screenshots', 'wave-7-after', 'T1');
const BASE = 'http://localhost:5173';

const SURFACES = [
  { id: 'dashboard', path: '/dashboard' },
  { id: 'calendar',  path: '/calendar' },
  { id: 'evidence',  path: '/evidence' },
];

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { id: 'mobile',  width:  390, height: 844, deviceScaleFactor: 2 },
];

test.describe('Wave 7 T1 — AFTER screenshots', () => {
  test.beforeAll(() => {
    for (const v of VIEWPORTS) fs.mkdirSync(path.join(ROOT, v.id), { recursive: true });
  });

  for (const v of VIEWPORTS) {
    test(`T1 after @ ${v.id}`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: v.deviceScaleFactor,
        hasTouch: v.id === 'mobile',
        isMobile: v.id === 'mobile',
      });
      const page = await ctx.newPage();
      for (const s of SURFACES) {
        try {
          await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle', timeout: 20000 });
        } catch {
          await page.goto(`${BASE}${s.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        }
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(ROOT, v.id, `${s.id}.png`), fullPage: true });
      }
      await ctx.close();
    });
  }
});
