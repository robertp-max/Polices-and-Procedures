import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright harness scoped to the direct-setup accessibility/responsive specs.
 * Starts the Vite dev server from THIS worktree so the specs exercise the real
 * `/setup-account-direct` screen. Run with `npm run test:e2e`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5182',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx vite --port 5182 --strictPort',
    port: 5182,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
