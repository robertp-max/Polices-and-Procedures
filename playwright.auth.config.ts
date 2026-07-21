import { defineConfig, devices } from '@playwright/test';

/**
 * Authenticated E2E harness. Boots the combined Express server (serves the built
 * SPA from dist + /api on one origin) with the STRICT test-only auth flag, so the
 * specs can reach protected learner routes without a live Cognito pool. Loopback
 * only; the E2E auth path is production-inert (see server/auth/e2eTestAuth.ts).
 * Run with `npm run test:e2e:auth` (requires a prior `npm run build`).
 */
export default defineConfig({
  testDir: './e2e-auth',
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://localhost:5183',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx tsx server/index.ts',
    port: 5183,
    reuseExistingServer: false,
    timeout: 90_000,
    env: {
      E2E_TEST_AUTH: 'true',
      NODE_ENV: 'development',
      PORT: '5183',
      // No Cognito config on purpose — the strict e2e path handles auth locally.
    },
  },
});
