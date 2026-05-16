/**
 * wave-7-baselines.spec.mjs — Wave 7 "before" screenshot capture
 *
 * Captures baseline visuals across the Wave 7 in-scope surfaces at
 * desktop (1440×900) and mobile (390×844 — iPhone 14) viewports so we
 * can produce true before/after diffs when each Wave 7 tranche lands.
 *
 * Read-only spec: NEVER mutates application state. Just navigates,
 * waits for paint, screenshots full-page.
 *
 * Output: Builder/_system/screenshots/wave-7-baselines/{desktop,mobile}/*.png
 */
import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..', 'screenshots', 'wave-7-baselines');
const BASE = 'http://localhost:5174';

// Wave 7 surface inventory — the canonical pages we visually consolidate.
// Each entry: { id, path, settle? }
const SURFACES = [
  { id: 'dashboard',                path: '/dashboard' },
  { id: 'calendar',                 path: '/calendar' },
  { id: 'audit',                    path: '/audit' },
  { id: 'evidence',                 path: '/evidence' },
  { id: 'library',                  path: '/library' },                  // FROZEN — visual reference only, no Wave 7 edits
  { id: 'forms-list',               path: '/forms' },
  { id: 'my-tasks',                 path: '/my-tasks' },
  { id: 'pm-my-tasks',              path: '/pm/my-tasks' },
  { id: 'pm-sprint-plan',           path: '/pm/sprint-plan' },
  { id: 'pm-sprint-review',         path: '/pm/sprint-review' },
  { id: 'pm-approvals',             path: '/pm/approvals' },
  { id: 'pm-dashboard',             path: '/pm/dashboard' },
  { id: 'master-control-inventory', path: '/inventory' },
  { id: 'admin-user-groups',        path: '/admin/user-groups' },
  // Form + artifact surfaces (read-only navigation; do not sign)
  { id: 'form-qa-fm-021',           path: '/forms/QA-FM-021' },
  { id: 'form-print-qa-fm-021',     path: '/forms/QA-FM-021/print' },
  { id: 'gvgb-policy-print',        path: '/print/GV-GB-001' },
  // Onboarding (non-FormSigning surfaces)
  { id: 'journey-home',             path: '/journey' },
];

const VIEWPORTS = [
  { id: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
  { id: 'mobile',  width:  390, height: 844, deviceScaleFactor: 2 },
];

test.describe('Wave 7 — baseline screenshots', () => {
  test.beforeAll(() => {
    for (const v of VIEWPORTS) fs.mkdirSync(path.join(ROOT, v.id), { recursive: true });
  });

  for (const v of VIEWPORTS) {
    test(`baselines @ ${v.id} (${v.width}x${v.height})`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: v.deviceScaleFactor,
        // simulate touch on mobile viewport
        hasTouch: v.id === 'mobile',
        isMobile: v.id === 'mobile',
      });
      const page = await ctx.newPage();
      // Suppress print dialog on print routes
      await page.addInitScript(() => { window.print = () => {}; });

      for (const s of SURFACES) {
        try {
          await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle', timeout: 20000 });
        } catch {
          // Slow surface — fall back to domcontentloaded
          await page.goto(`${BASE}${s.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        }
        await page.waitForTimeout(1800);
        await page.screenshot({
          path: path.join(ROOT, v.id, `${s.id}.png`),
          fullPage: true,
        });
      }
      await ctx.close();
    });
  }
});
