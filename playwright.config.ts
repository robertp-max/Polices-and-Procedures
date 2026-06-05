import { defineConfig, devices } from '@playwright/test';

/**
 * CES Q2 2026 Full UAT — Playwright configuration
 * Target: http://localhost:5173 (Vite dev server, already running)
 * Auth bypass: VITE_LOCAL_DEMO_AUTH_BYPASS=true (auto-authenticates demo user)
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
