import { defineConfig, devices } from '@playwright/test';

/**
 * CES Q2 2026 Full UAT — Playwright configuration
 * Target: http://localhost:5173 (Vite dev server, already running)
 * Auth bypass: VITE_LOCAL_DEMO_AUTH_BYPASS=true (auto-authenticates demo user)
 */
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
    baseURL: 'http://localhost:5173',
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
  /* Dev server is already running — do NOT launch it here. */
});
