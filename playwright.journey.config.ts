import { defineConfig, devices } from '@playwright/test';

/**
 * Employee Journey portal E2E suite (apps/employee-journey — the vinext preview
 * portal with the `?persona=` mechanism and no auth gate). Starts that app's own
 * Vite dev server on a dedicated port so the specs exercise the real portal.
 *
 * Run with: npm run test:e2e:journey
 */
const PORT = 5186;

export default defineConfig({
  testDir: './e2e-journey',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'e2e-journey/.results/journey-results.json' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    cwd: 'apps/employee-journey',
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { WRANGLER_LOG_PATH: '.wrangler/wrangler.log' },
  },
});
