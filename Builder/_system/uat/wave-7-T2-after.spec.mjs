/**
 * wave-7-T2-after.spec.mjs — Wave 7 T2 AFTER screenshot capture
 *
 * T2 migrated 3 surfaces to canonical LoadingState / EmptyState primitives:
 *   - EvidenceCenterPage (loader + empty-state)
 *   - EvidencePanel (event regulatory evidence empty)
 *   - SprintReviewPage (per-assignee delivery empty)
 *
 * Captures the relevant surfaces at desktop + mobile so a human can spot-check
 * the new primitive rendering vs the baselines.
 *
 * Output: Builder/_system/screenshots/wave-7-after/T2/{desktop,mobile}/*.png
 */
import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', 'screenshots', 'wave-7-after', 'T2');
const BASE = 'http://localhost:5173';

const SURFACES = [
  { id: 'evidence',         path: '/evidence' },
  { id: 'pm-sprint-review', path: '/pm/sprint-review' },
  { id: 'calendar',         path: '/calendar' },          // EvidencePanel renders inside selected event
  { id: 'dashboard',        path: '/dashboard' },         // sanity check — shell unchanged
];

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { id: 'mobile',  width:  390, height: 844, deviceScaleFactor: 2 },
];

test.describe('Wave 7 T2 — AFTER screenshots', () => {
  test.beforeAll(() => {
    for (const v of VIEWPORTS) fs.mkdirSync(path.join(ROOT, v.id), { recursive: true });
  });

  for (const v of VIEWPORTS) {
    test(`T2 after @ ${v.id}`, async ({ browser }) => {
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
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(ROOT, v.id, `${s.id}.png`), fullPage: true });
      }
      await ctx.close();
    });
  }
});
