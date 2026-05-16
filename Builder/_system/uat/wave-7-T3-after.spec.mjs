/**
 * wave-7-T3-after.spec.mjs — Wave 7 T3 AFTER screenshot capture
 *
 * T3 migrated raw hex / rgb literals on 4 surfaces to canonical var(--ci-*) tokens:
 *   - PmViews.tsx           (slate-pin fallback → canonical border-strong)
 *   - MasterControlInventory.tsx (StatCard tones + surface background)
 *   - FormsPage.tsx         (light-theme style block colors)
 *   - SharedPolicyDetailView.tsx (documentation-only; light-pin intent preserved)
 *
 * Visual delta should be near-zero: tokens resolve to the same hex values in
 * light theme (verified via src/index.css canonical mappings).
 *
 * Output: Builder/_system/screenshots/wave-7-after/T3/{desktop,mobile}/*.png
 */
import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', 'screenshots', 'wave-7-after', 'T3');
const BASE = 'http://localhost:5173';

const SURFACES = [
  { id: 'pm-gantt',         path: '/pm/dashboard?view=gantt' },
  { id: 'pm-kanban',        path: '/pm/dashboard?view=kanban' },
  { id: 'master-controls',  path: '/master-controls' },
  { id: 'forms',            path: '/forms' },
  { id: 'policy-detail',    path: '/policies/GV-GB-001' },
];

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { id: 'mobile',  width:  390, height: 844, deviceScaleFactor: 2 },
];

test.describe('Wave 7 T3 — AFTER screenshots', () => {
  test.beforeAll(() => {
    for (const v of VIEWPORTS) fs.mkdirSync(path.join(ROOT, v.id), { recursive: true });
  });

  for (const v of VIEWPORTS) {
    test(`T3 after @ ${v.id}`, async ({ browser }) => {
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
