import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Required CI smoke suite.
 *
 * A fast, stable subset of the UAT specs that proves the app shell + key routes
 * boot and core CES / forms / eCIgn flows mount. This is what the required CI
 * job runs on every push/PR (see .github/workflows/ci.yml).
 *
 * The exhaustive visual-regression / role-walkthrough UAT suite (wave-9..14,
 * q2-qapi-complete-walkthrough, ces-q2-2026-complete-uat, ces-canonical-fix-verify,
 * etc.) runs separately and non-required via .github/workflows/uat-full.yml
 * (manual dispatch + nightly) so a slow or in-progress UAT defect never blocks
 * the merge gate.
 *
 * The base webServer + `use` config are inherited unchanged, so the server
 * lifecycle (Vite dev:web with demo auth bypass, reuseExistingServer locally)
 * is identical to the full suite.
 */
const SMOKE_SPECS = [
  // App shell + dashboard/CES/calendar/policy/evidence/audit/print route mounts,
  // deep-link hydration, and permissions surface.
  /wave-6-regression\.spec\.mjs$/,
  // Sprint board, compliance calendar, form-by-id + form_instance_id, eCIgn sign
  // button contract, form-field persistence, audit "view artifact" link.
  /ces-q2-2026-fix-verification\.spec\.ts$/,
  // eCIgn signed_package → Care Indeed branded HTML artifact pipeline + form
  // instance idempotency + evidence package taskId normalization.
  /ces-q2-fixes\.spec\.ts$/,
];

export default defineConfig({
  ...baseConfig,
  testMatch: SMOKE_SPECS,
  // Required smoke gate runs only the fast `chromium` project. The base config's
  // `v3-visual-5174` project (visual regression against a separate :5174 server)
  // belongs to the non-required uat-full.yml workflow, not the merge gate — without
  // this scope it leaks into the smoke run and fails on ERR_CONNECTION_REFUSED.
  projects: (baseConfig.projects ?? []).filter(p => p.name === 'chromium'),
});
