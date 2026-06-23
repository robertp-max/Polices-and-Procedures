import { defineConfig, devices } from '@playwright/test';

/**
 * CES Q2 2026 Full UAT + V3 Pre-Rollout Visual Regression — Playwright configuration
 * Primary Target: http://localhost:5173 (Vite dev server, already running)
 * V3 VISUAL TESTS (Agent 21 mandate): Dedicated run against http://localhost:5174
 *   (start with `npm run dev -- --port 5174` or V3_STAGING=1 vite preview variant).
 * Auth bypass: VITE_LOCAL_DEMO_AUTH_BYPASS=true (auto-authenticates demo user)
 *
 * V3 Visual Regression Protocol (pre any prod scale rollout):
 * - Use `expect(page).toHaveScreenshot()` for key V3 surfaces:
 *   ShellContentFrame (desktop 4-sided), v3-veil RightDrawer/BottomSheet on CES,
 *   CesBoard / MasterCalendar with integrated drawers, Evidence hierarchy V3.
 * - Baselines committed under tests/v3-visual-baselines/ (or Builder/_system/v3-baselines).
 * - Run on 5174 for isolated V3 token + glass + motion fidelity (no legacy bleed).
 * - Must pass before merge for files in V3_PRE_ROLLOUT_ATTESTED (see eslint.config.js).
 * - CI integration + `npm run verify:v3-visual` (proposed) required for scale rollout.
 *
 * See:
 *   - docs/UIUX/V3_UIUX_RECONSTRUCTION_32_AGENT_DEEP_DIVE_PLAN.md (Agent 21)
 *   - .github/PULL_REQUEST_TEMPLATE.md (Visual Regression + V3 Pre-Rollout sections)
 *   - src/policy/components/ui/ShellContentFrame.tsx (data-shell-content-frame contract)
 */
/*
 * Base URL is overridable via PLAYWRIGHT_BASE_URL so the suite can run against
 * a free port locally (e.g. when 5173 is taken by another project) while
 * defaulting to the canonical 5173 in CI.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const DEV_PORT = new URL(BASE_URL).port || '5173';

export default defineConfig({
  testDir: './Builder/_system/uat',
  outputDir: './Builder/_system/uat-results',
  fullyParallel: false,
  forbidOnly: false,
  retries: 1,
  workers: 1,
  timeout: 120_000,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'Builder/_system/uat-html-report', open: 'never' }],
    ['json', { outputFile: 'Builder/_system/reports/ces-q2-2026-uat-playwright-results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    headless: true,
    viewport: { width: 1440, height: 900 },
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    /* Capture console errors and uncaught exceptions. */
    bypassCSP: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // V3 Pre-Rollout Visual Regression project (Agent 21)
    // Run explicitly: npx playwright test --project=v3-visual-5174
    // Requires separate dev server on 5174 with V3 tokens active (full veil glass).
    {
      name: 'v3-visual-5174',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5174',
        // Stricter for visual: full page screenshots, higher threshold control in specs
        screenshot: 'only-on-failure',
      },
      testMatch: /.*v3-visual.*\.spec\.(ts|tsx|mjs)/,
    },
  ],
  /*
   * Web server lifecycle.
   * Locally: a dev server is typically already running on 5173, so reuse it.
   * CI (process.env.CI truthy): no server exists, so Playwright boots the Vite
   * dev server itself with the demo auth bypass + local-demo evidence mode that
   * the suite assumes. Without this, every navigating spec fails with
   * net::ERR_CONNECTION_REFUSED at http://localhost:5173.
   */
  webServer: {
    command: `npm run dev:web -- --port ${DEV_PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      VITE_LOCAL_DEMO_AUTH_BYPASS: 'true',
      VITE_EVIDENCE_STORAGE_MODE: 'local-demo',
    },
  },
});
