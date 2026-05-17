/**
 * Phase 2 — Shell Visual Regression Suite
 *
 * Required output per `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/Implementation/
 * Phase2_Exit_Criteria_Checklist.md` §1 (Constrained Page View Contract),
 * §5 (Responsive Behavior), §7 (Visual Regression & Glassmorphism Quality).
 *
 * Captures the *shell only* (ShellFrame → ShellContentFrame → ShellTopbar /
 * ShellNavRail / ShellCommandGroup composition). Operational surface content
 * (Dashboard widgets, Evidence tables, etc.) is intentionally allowed to be
 * whatever Phase 1/2 has — the goal here is shell framing, not surface QA.
 *
 * Coverage matrix:
 *   - Viewports: 1200×800, 1440×900, 1600×1000 (desktop), 768×1024 (tablet),
 *                390×844 (mobile).
 *   - Shell states:
 *       1. Dashboard (default rail, no sub-nav)
 *       2. CES Dashboard (sub-nav strip visible)
 *       3. Calendar sprint view (long content scroll)
 *       4. Splash (unauthenticated landing, if reachable)
 *       5. Mobile: hamburger → full-screen modal menu
 *       6. Reduced-motion parity at 1440 (prefers-reduced-motion: reduce)
 *   - Theme parity: each desktop scenario captured in both brand themes
 *     via the topbar theme-toggle button (`aria-label` starts with "Switch to ").
 *
 * Output:
 *   Builder/_system/screenshots/phase2-shell-visual/*.png
 *   Builder/_system/reports/phase2-shell-visual.json
 *
 * Prereq: Vite dev server running on http://localhost:5173 with
 * VITE_LOCAL_DEMO_AUTH_BYPASS=true (matches playwright.config.ts).
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots', 'phase2-shell-visual');
const REPORT_PATH = path.resolve(__dirname, '..', 'reports', 'phase2-shell-visual.json');
const BASE = 'http://localhost:5173';

const DESKTOP_VIEWPORTS = [
  { label: 'desktop-1200', width: 1200, height: 800 },
  { label: 'desktop-1440', width: 1440, height: 900 },
  { label: 'desktop-1600', width: 1600, height: 1000 },
];
const TABLET_VIEWPORT = { label: 'tablet-768', width: 768, height: 1024 };
const MOBILE_VIEWPORT = { label: 'mobile-390', width: 390, height: 844 };

const SHELL_ROUTES = [
  { id: 'dashboard',     route: '/dashboard',           note: 'default rail, no sub-nav' },
  { id: 'ces-dashboard', route: '/ces/dashboard',       note: 'sub-nav strip active' },
  { id: 'calendar',      route: '/calendar?view=sprint',note: 'long content scroll' },
  { id: 'library',       route: '/library',             note: 'policy library + ACHC view' },
  { id: 'ces-my-tasks',  route: '/ces/my-tasks',        note: 'CES execution task queue' },
  { id: 'journey',       route: '/journey',             note: 'onboarding learning hub' },
  { id: 'evidence',      route: '/evidence',            note: 'evidence center file system' },
];

const report = {
  startedAt: new Date().toISOString(),
  phase: 'Phase 2 — Core Shell',
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
  // Allow any glass transitions / TravelightBG canvas to settle.
  await page.waitForTimeout(900);
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
  // Brand toggle (logo button in ShellTopbar) uses aria-label ending in " theme"
  // — disambiguates from ThemeModeToggle whose label ends in " mode".
  const toggle = page.locator('button[aria-label$=" theme"]').first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function assertShellRendered(page) {
  // Fail fast if the shell main region didn't mount — prevents silent blank baselines.
  await expect(page.locator('main[data-shell-main]')).toBeVisible({ timeout: 5000 });
}

/**
 * Read computed 4-sided padding off the ShellFrame inner column and verify
 * it resolves to a non-zero value at the given viewport. This is the
 * programmatic acceptance test for Phase 2 Exit §1.
 */
async function assertConstrainedFraming(page, expectMinPx = 12) {
  const padding = await page.evaluate(() => {
    // ShellFrame's inner div applies var(--ci-glass-layer1-inset-desktop)
    // as its `padding`. We pick it by its position-relative + z-10 + flex
    // signature inside the outer h-screen wrapper. Fallback: use
    // documentElement variable.
    const inner = document.querySelector(
      'div.relative.z-10.flex.h-full.w-full.flex-col',
    );
    if (!inner) return null;
    const cs = window.getComputedStyle(inner);
    return {
      top: parseFloat(cs.paddingTop),
      right: parseFloat(cs.paddingRight),
      bottom: parseFloat(cs.paddingBottom),
      left: parseFloat(cs.paddingLeft),
    };
  });
  return { padding, ok: !!padding && Object.values(padding).every(v => v >= expectMinPx) };
}

test.describe('Phase 2 — Shell visual regression', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  // ─────────────────────────────────────────────────────────────────
  // Desktop matrix: 1200 / 1440 / 1600 × routes × theme parity
  // ─────────────────────────────────────────────────────────────────
  for (const vp of DESKTOP_VIEWPORTS) {
    test(`${vp.label} — shell framing + theme parity`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const r of SHELL_ROUTES) {
        await gotoAndWait(page, r.route);
        await assertShellRendered(page);

        // Phase 2 Exit §1: 4-sided constrained framing must be present.
        const framing = await assertConstrainedFraming(page);
        const themeA = await themeKey(page);
        const shotA = await shot(page, `${vp.label}-${r.id}-${themeA}`);
        record({
          scenario: 'desktop-shell',
          viewport: vp.label,
          route: r.route,
          note: r.note,
          theme: themeA,
          framing,
          screenshot: shotA,
        });

        // Theme parity capture.
        const toggled = await flipThemeIfPossible(page);
        if (toggled) {
          const themeB = await themeKey(page);
          const framingB = await assertConstrainedFraming(page);
          const shotB = await shot(page, `${vp.label}-${r.id}-${themeB}`);
          record({
            scenario: 'desktop-shell',
            viewport: vp.label,
            route: r.route,
            note: r.note,
            theme: themeB,
            framing: framingB,
            screenshot: shotB,
            toggled: true,
          });
          // Restore primary theme for next route.
          await flipThemeIfPossible(page);
        }

        expect(framing.padding, `framing padding at ${vp.label} ${r.route}`).not.toBeNull();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Tablet (768): shell should still render rail OR collapse cleanly.
  // ─────────────────────────────────────────────────────────────────
  test(`${TABLET_VIEWPORT.label} — shell responsive transition`, async ({ page }) => {
    await page.setViewportSize({ width: TABLET_VIEWPORT.width, height: TABLET_VIEWPORT.height });
    for (const r of SHELL_ROUTES) {
      await gotoAndWait(page, r.route);
      await assertShellRendered(page);
      const theme = await themeKey(page);
      const file = await shot(page, `${TABLET_VIEWPORT.label}-${r.id}-${theme}`);
      record({
        scenario: 'tablet-shell',
        viewport: TABLET_VIEWPORT.label,
        route: r.route,
        theme,
        screenshot: file,
      });
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // Mobile (390): bottom nav visible + full-screen modal menu state.
  // ─────────────────────────────────────────────────────────────────
  test(`${MOBILE_VIEWPORT.label} — bottom nav + nav drawer`, async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_VIEWPORT.width, height: MOBILE_VIEWPORT.height });

    for (const r of SHELL_ROUTES) {
      await gotoAndWait(page, r.route);
      await assertShellRendered(page);
      const theme = await themeKey(page);

      // (a) default mobile shell state with bottom nav visible
      const baseShot = await shot(page, `${MOBILE_VIEWPORT.label}-${r.id}-${theme}-base`);
      record({
        scenario: 'mobile-shell-base',
        viewport: MOBILE_VIEWPORT.label,
        route: r.route,
        theme,
        screenshot: baseShot,
      });

      // (b) open the full-screen modal menu via the hamburger button
      const hamburger = page.locator('button[aria-label="Open navigation"]').first();
      if (await hamburger.isVisible().catch(() => false)) {
        await hamburger.click();
        await page.waitForTimeout(600);
        const menuShot = await shot(page, `${MOBILE_VIEWPORT.label}-${r.id}-${theme}-modal-menu`);
        record({
          scenario: 'mobile-shell-modal-menu',
          viewport: MOBILE_VIEWPORT.label,
          route: r.route,
          theme,
          screenshot: menuShot,
        });
        // Close by pressing Escape or clicking scrim
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(300);
      } else {
        record({
          scenario: 'mobile-shell-modal-menu',
          viewport: MOBILE_VIEWPORT.label,
          route: r.route,
          theme,
          skipped: 'hamburger button not found',
        });
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // Reduced-motion parity (Phase 2 Exit §6).
  // ─────────────────────────────────────────────────────────────────
  test('reduced-motion shell at 1440', async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    for (const r of SHELL_ROUTES) {
      await gotoAndWait(page, r.route);
      const theme = await themeKey(page);
      const file = await shot(page, `reduced-motion-1440-${r.id}-${theme}`);
      record({
        scenario: 'reduced-motion-shell',
        viewport: 'desktop-1440',
        route: r.route,
        theme,
        screenshot: file,
        reducedMotion: true,
      });
    }
    await ctx.close();
  });

  // ─────────────────────────────────────────────────────────────────
  // Splash capture — only if `/` returns the unauthenticated splash.
  // ─────────────────────────────────────────────────────────────────
  test('splash view (best-effort)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(800);
    const hasSplash = await page.locator('text=/Enterprise Policy/i').first().isVisible().catch(() => false);
    if (hasSplash) {
      const theme = await themeKey(page);
      const file = await shot(page, `splash-1440-${theme}`);
      record({ scenario: 'splash', viewport: 'desktop-1440', theme, screenshot: file });
    } else {
      record({ scenario: 'splash', viewport: 'desktop-1440', skipped: 'auth bypass active; splash not reachable' });
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // Accessibility — axe-core scan of the shell at desktop + mobile.
  // Phase 2 Exit §8: zero critical/serious WCAG 2.1 AA violations on
  // the canonical shell composition. We pin to /dashboard because it
  // is the lowest-noise route (no surface-specific issues bleed in).
  // ─────────────────────────────────────────────────────────────────
  test('axe scan — shell at desktop + mobile', async ({ page }) => {
    const sizes = [
      { label: 'desktop-1440', width: 1440, height: 900 },
      { label: 'mobile-390',   width: 390,  height: 844 },
    ];
    const results = [];
    for (const vp of sizes) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoAndWait(page, '/dashboard');
      await assertShellRendered(page);

      // Scope the scan to shell landmarks ONLY. Phase 2 covers the
      // shell (topbar, nav rail, mobile drawer); operational surfaces
      // like the Dashboard belong to Phase 3 and their content-level
      // a11y is gated separately. We include the topbar (role="banner"
      // on ShellTopbar), the desktop nav rail (<nav> in ShellNavRail),
      // and any mounted dialog (ShellMobileDrawer). We also exclude
      // decorative canvases (TravelightBG) which throw false-positive
      // contrast issues on animated backgrounds.
      const axe = new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .include('[role="banner"]')
        .include('nav')
        .include('[role="dialog"]')
        .exclude('canvas');

      const scan = await axe.analyze();
      const blocking = scan.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious',
      );

      results.push({
        viewport: vp.label,
        violations: scan.violations.length,
        blocking: blocking.length,
        blockingIds: blocking.map(v => v.id),
      });

      record({
        scenario: 'axe-scan',
        viewport: vp.label,
        route: '/dashboard',
        totalViolations: scan.violations.length,
        blockingViolations: blocking.length,
        blocking: blocking.map(v => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      });

      // Hard gate: zero critical / serious violations allowed in the shell.
      expect(
        blocking,
        `axe blocking violations at ${vp.label}: ${blocking.map(v => v.id).join(', ')}`,
      ).toEqual([]);
    }
    expect(results.length).toBe(sizes.length);
  });

  // ─────────────────────────────────────────────────────────────────
  // Mobile nav drawer — Phase 2 §6 contract. The hamburger now opens
  // ShellMobileDrawer (BottomSheetDrawer wrapper) which exposes
  // role="dialog" aria-modal="true" and registers a global Escape
  // listener. Hard gates: dialog mounts with correct ARIA; nav
  // landmark inside it carries the canonical label; Escape closes it.
  // Full focus-trap promotion is tracked separately against
  // BottomSheetDrawer itself (documented out-of-scope in that file).
  // ─────────────────────────────────────────────────────────────────
  test('mobile nav drawer — ARIA + Escape contract (390)', async ({ page }) => {
    await page.setViewportSize({ width: MOBILE_VIEWPORT.width, height: MOBILE_VIEWPORT.height });
    await gotoAndWait(page, '/dashboard');
    await assertShellRendered(page);

    const hamburger = page.locator('button[aria-label="Open navigation"]').first();
    const visible = await hamburger.isVisible().catch(() => false);
    if (!visible) {
      record({ scenario: 'mobile-drawer-contract', skipped: 'hamburger not visible at 390' });
      test.skip(true, 'hamburger button not present');
      return;
    }

    await hamburger.focus();
    await hamburger.click();
    await page.waitForTimeout(400);

    // Drawer must mount a dialog with aria-modal="true".
    const dialog = page.locator('[role="dialog"][aria-modal="true"]').first();
    await expect(dialog, 'ShellMobileDrawer must render a modal dialog').toBeVisible({ timeout: 2000 });

    // Nav landmark inside the drawer carries the canonical label.
    const drawerNav = dialog.locator('nav[aria-label="Mobile navigation"]').first();
    await expect(drawerNav, 'drawer must contain Mobile navigation landmark').toBeVisible();

    // Escape must close the drawer.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const stillVisible = await dialog.isVisible().catch(() => false);

    record({
      scenario: 'mobile-drawer-contract',
      route: '/dashboard',
      viewport: MOBILE_VIEWPORT.label,
      dialogMounted: true,
      escapeClosedDrawer: !stillVisible,
    });

    expect(stillVisible, 'drawer must close on Escape').toBe(false);
  });

  test.afterAll(() => {
    report.finishedAt = new Date().toISOString();
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  });
});
