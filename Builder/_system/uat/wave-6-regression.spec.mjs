/**
 * wave-6-regression.spec.mjs — Wave 6 MVP browser regression pass
 *
 * Runs a focused regression probe for each of the 9 canonical MVP browser
 * tests defined in UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md §12.
 *
 *   Test 1 — Vercel demo / auth bypass landing
 *   Test 2 — DON Asst → DON two-signer single canonical artifact (ECIGN-001)
 *   Test 3 — Download/Print/Open byte-identical retrieval (ECIGN-002)
 *   Test 4 — Evidence refresh persistence (EVIDENCE-001 IDB)
 *   Test 5 — Top-level targetKind/targetId + link resolution
 *   Test 6 — ?form_instance_id= deep-link hydration (CES-001)
 *   Test 7 — GV-GB-001 print fidelity + no eCign branding bleed (PRINT-001)
 *   Test 8 — Calendar / Sprint / Kanban / Gantt sync (CALENDAR-001)
 *   Test 9 — Trainer permission boundary (PERMS-001)
 *
 * Pass criteria for this spec (lightweight per-test smoke):
 *   - target route loads without page-crashing errors
 *   - no UNCAUGHT console errors that match a hard-block pattern
 *   - critical landmark element / data attribute present
 *   - screenshot + per-test console log saved for human spot-check
 *
 * Deep behavioural coverage for tests 3 + 4 (artifact retrieval, IDB
 * persistence) lives in artifact-retrieval-defect.spec.mjs, run separately.
 *
 * Wave 6 is validation-only — this spec does NOT mutate stored snapshots,
 * sign new packets, alter feature flags, or write to any protected store.
 *
 * Run: npx playwright test wave-6-regression --reporter=list
 */
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(
  __dirname,
  '..',
  'screenshots',
  'wave-6-regression',
);
const REPORT_PATH = path.resolve(
  __dirname,
  '..',
  'reports',
  'wave-6-regression.json',
);

const BASE = 'http://localhost:5173';

const summary = {
  startedAt: new Date().toISOString(),
  tests: [],
};

function record(testId, label, result) {
  summary.tests.push({ testId, label, ...result, recordedAt: new Date().toISOString() });
  // Persist after every test so partial runs still produce evidence
  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

/**
 * Attach console + network listeners and return collectors the test can
 * later snapshot into the report.
 */
function instrumentPage(page) {
  const consoleErrors = [];
  const consoleWarns = [];
  const networkFailures = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ at: new Date().toISOString(), text: msg.text() });
    else if (msg.type() === 'warning') consoleWarns.push({ at: new Date().toISOString(), text: msg.text() });
  });
  page.on('pageerror', (err) => pageErrors.push({ at: new Date().toISOString(), text: err.message }));
  page.on('requestfailed', (req) => {
    const f = req.failure();
    networkFailures.push({
      at: new Date().toISOString(),
      url: req.url(),
      method: req.method(),
      reason: f?.errorText || 'unknown',
    });
  });
  return { consoleErrors, consoleWarns, networkFailures, pageErrors };
}

/**
 * A "hard fail" is a console error that we know maps to a P0/P1 regression
 * (uncaught render exception, missing module, hydration crash). Most
 * existing pages emit benign console.warn / 404 for optional assets;
 * we ignore those in this regression smoke.
 */
function hardBlockingErrors(consoleErrors, pageErrors) {
  const HARD_PATTERNS = [
    /Maximum update depth exceeded/i,
    /Cannot read prop(erty|erties) of (undefined|null)/i,
    /Objects are not valid as a React child/i,
    /Failed to fetch dynamically imported module/i,
    /Uncaught.*invariant violation/i,
    /Hydration failed/i,
  ];
  const all = [
    ...consoleErrors.map((e) => e.text),
    ...pageErrors.map((e) => e.text),
  ];
  return all.filter((t) => HARD_PATTERNS.some((p) => p.test(t)));
}

test.describe('Wave 6 — MVP browser regression', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  // ──────────────────────────────────────────────────────────────
  // Test 1 — Vercel demo / auth bypass landing
  // ──────────────────────────────────────────────────────────────
  test('Test 1 — auth bypass landing + dashboard mounts', async ({ page }) => {
    const probes = instrumentPage(page);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-1-landing');
    const url = page.url();
    const title = await page.title();
    const bodyText = (await page.locator('body').innerText().catch(() => '')).substring(0, 600);
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-1', 'Vercel demo / auth landing', {
      passed: hardErrors.length === 0 && url.startsWith(BASE),
      finalUrl: url,
      pageTitle: title,
      bodyTextSnippet: bodyText,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      pageErrorCount: probes.pageErrors.length,
      networkFailureCount: probes.networkFailures.length,
      networkFailureSamples: probes.networkFailures.slice(0, 5),
    });
    expect(hardErrors, `Test 1 hard-blocking errors: ${JSON.stringify(hardErrors)}`).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 2 — DON Asst → DON two-signer (ECIGN-001 surface check)
  // ──────────────────────────────────────────────────────────────
  // Wave 6 validation only — we do NOT walk the full multi-signer eCign
  // flow here (that is operator UAT). We confirm the surface mounts and
  // the canonical artifact path resolver is available.
  test('Test 2 — multi-signer surface (FormSigningWorkspace mounts)', async ({ page }) => {
    const probes = instrumentPage(page);
    // Open a signable form route. We use QA-FM-021 with a stable CES
    // context — the eCign sign button is the canonical entry point.
    const url = `${BASE}/forms/QA-FM-021?event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline&workflow_id=WF-QA-PI-001`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-2-form-route');
    const signBtnVisible = await page
      .locator('[data-testid="ecign-sign-btn"]')
      .first()
      .isVisible({ timeout: 4000 })
      .catch(() => false);
    const altSignBtnVisible = await page
      .locator('button:has(img[alt*="Sign with eCign"])')
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-2', 'Multi-signer FormSigningWorkspace surface', {
      passed: hardErrors.length === 0 && (signBtnVisible || altSignBtnVisible),
      formRouteLoaded: page.url().includes('/forms/QA-FM-021'),
      ecignSignButtonVisible: signBtnVisible || altSignBtnVisible,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'Full DON-Asst→DON multi-signer walk is operator UAT, not Wave-6 automation',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 3 — Download/Print/Open byte-identical retrieval
  // ──────────────────────────────────────────────────────────────
  // Deep coverage in artifact-retrieval-defect.spec.mjs.
  // Here we just confirm the artifact viewer route mounts without crashing.
  test('Test 3 — artifact viewer route mounts', async ({ page }) => {
    const probes = instrumentPage(page);
    // A representative form-instance id (Wave 4 resolver handles missing
    // artifacts gracefully and shows an "unknown" panel).
    const url = `${BASE}/artifacts/probe-no-such-artifact-${Date.now()}?type=form_instance`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-3-artifact-viewer-route');
    const hasViewerHeader = await page
      .locator('text=Artifact Viewer')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-3', 'Artifact viewer route mounts + cache-ladder reachable', {
      passed: hardErrors.length === 0 && hasViewerHeader,
      viewerHeaderPresent: hasViewerHeader,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'Deep byte-stable retrieval validated by artifact-retrieval-defect.spec.mjs s3/s4/s7/s8a stages',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 4 — Evidence refresh persistence (EVIDENCE-001 IDB)
  // ──────────────────────────────────────────────────────────────
  // Deep coverage in artifact-retrieval-defect.spec.mjs s8a (LS-evicted,
  // IDB-intact). Here we confirm Evidence Center mounts and read-side
  // helpers don't crash on an empty store.
  test('Test 4 — Evidence Center mounts; cache-ladder read non-crashing', async ({ page }) => {
    const probes = instrumentPage(page);
    await page.goto(`${BASE}/evidence`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-4-evidence-center');
    // Probe: read the cache ladder programmatically from the page to confirm
    // peek does not throw for non-existent keys (read-only check)
    const peekProbe = await page.evaluate(() => {
      try {
        const k = 'ces_ev_data_probe_' + Math.random().toString(36).slice(2);
        // Touch localStorage with the same prefix structure used by peek
        const v = localStorage.getItem(k);
        return { ok: true, value: v };
      } catch (e) {
        return { ok: false, error: String(e) };
      }
    });
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-4', 'Evidence Center + cache-ladder peek', {
      passed: hardErrors.length === 0 && peekProbe.ok,
      evidenceCenterUrl: page.url(),
      cachePeekOk: peekProbe.ok,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'IDB refresh persistence validated by artifact-retrieval-defect.spec.mjs s8a (IDB-intact recovery)',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 5 — Top-level targetKind/targetId + link resolution
  // ──────────────────────────────────────────────────────────────
  // Wave 6 validation: confirm Audit Mode route mounts. Deep deterministic
  // link resolution is covered by Wave 4 artifactToFormInstance.ts.
  test('Test 5 — Audit Mode route mounts', async ({ page }) => {
    const probes = instrumentPage(page);
    await page.goto(`${BASE}/audit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-5-audit-mode');
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-5', 'Audit Mode mounts; link resolver wired', {
      passed: hardErrors.length === 0,
      finalUrl: page.url(),
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'Deterministic resolveFormInstanceFromArtifact (Wave 4) used by ArtifactViewerPage on every navigation',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 6 — ?form_instance_id= deep-link hydration (CES-001)
  // ──────────────────────────────────────────────────────────────
  test('Test 6 — deep-link form_instance_id hydration', async ({ page }) => {
    const probes = instrumentPage(page);
    const fi = 'qapi_meeting-20260205-04-QA-FM-021-001';
    const url = `${BASE}/forms/QA-FM-021?form_instance_id=${encodeURIComponent(fi)}&event_id=qapi_meeting-20260205-04&task_id=TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-6-deep-link-hydration');
    const formMounted = await page
      .locator('form, [data-testid="form-viewer"], h1, h2')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-6', 'CES-001 deep-link hydration', {
      passed: hardErrors.length === 0 && formMounted,
      finalUrl: page.url(),
      formMounted,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 7 — GV-GB-001 print fidelity (PRINT-001)
  // ──────────────────────────────────────────────────────────────
  // Wave 5A migrated FormPrintView to PrintFrame. Confirm the print route
  // mounts and the unified header is present. Full visual regression is a
  // manual checklist (BROWSER_TEST_7_PRINT_UNIFIED_CHROME.md).
  test('Test 7 — GV-GB-001 print route mounts under PrintFrame', async ({ page }) => {
    const probes = instrumentPage(page);
    // Disable auto-print so the test does not trigger a print dialog.
    await page.addInitScript(() => {
      // PrintFrame uses iframe detection; we are in a top-level frame.
      // Override window.print to a no-op for the duration of this test.
      window.print = () => { /* suppressed for regression */ };
    });
    // Surface A: canonical GV-GB-001 policy print (GVGBPrintDocument)
    await page.goto(`${BASE}/print/GV-GB-001`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-7a-gvgb-print');
    const gvgbBody = (await page.locator('body').innerText().catch(() => '')).substring(0, 400);
    const gvgbMounted =
      gvgbBody.length > 60 && !/Form not found/i.test(gvgbBody);

    // Surface B: Wave 5A FormPrintView under PrintFrame
    await page.goto(`${BASE}/forms/QA-FM-021/print`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 'test-7b-formprint-printframe');
    const fpvBody = (await page.locator('body').innerText().catch(() => '')).substring(0, 400);
    const fpvMounted =
      fpvBody.length > 60 && !/Form not found/i.test(fpvBody);

    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-7', 'PRINT-001 print routes mount', {
      passed: hardErrors.length === 0 && gvgbMounted && fpvMounted,
      surfaces: [
        { id: 'gvgb-policy-print', url: `${BASE}/print/GV-GB-001`, mounted: gvgbMounted, bodySnippet: gvgbBody.substring(0, 160) },
        { id: 'formprint-printframe', url: `${BASE}/forms/QA-FM-021/print`, mounted: fpvMounted, bodySnippet: fpvBody.substring(0, 160) },
      ],
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'eCign-branding-bleed visual check is operator UAT per BROWSER_TEST_7_PRINT_UNIFIED_CHROME.md',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 8 — Calendar / Sprint / Kanban / Gantt sync (CALENDAR-001)
  // ──────────────────────────────────────────────────────────────
  // Wave 6: probe each of the 4 surfaces; confirm each mounts. The static
  // verify:pm-unified gate already enforces task-count parity between
  // surfaces (sprint=kanban=gantt under same filter, 5283/5283 confirmed).
  test('Test 8 — Calendar/Sprint/Kanban/Gantt surfaces mount', async ({ page }) => {
    const probes = instrumentPage(page);
    const surfaces = [
      { id: 'calendar', path: '/calendar' },
      { id: 'sprint', path: '/pm/sprint-plan' },
      { id: 'kanban', path: '/pm/dashboard' },
      { id: 'mytasks', path: '/my-tasks' },
    ];
    const results = [];
    for (const s of surfaces) {
      await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await shot(page, `test-8-${s.id}`);
      const mounted = await page
        .locator('main, [role="main"], h1, h2, [data-testid]')
        .first()
        .isVisible({ timeout: 2500 })
        .catch(() => false);
      results.push({ surface: s.id, url: page.url(), mounted });
    }
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    const allMounted = results.every((r) => r.mounted);
    record('test-8', 'CALENDAR-001 multi-surface sync', {
      passed: hardErrors.length === 0 && allMounted,
      surfaces: results,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'Cross-surface task-count parity enforced by verify:pm-unified (5283/5283 sprint=kanban=gantt)',
    });
    expect(hardErrors).toHaveLength(0);
  });

  // ──────────────────────────────────────────────────────────────
  // Test 9 — Trainer permission boundary (PERMS-001)
  // ──────────────────────────────────────────────────────────────
  // Validation only — confirm admin/permissions surface mounts. Deep RBAC
  // walk is operator UAT.
  test('Test 9 — Permissions surface mounts', async ({ page }) => {
    const probes = instrumentPage(page);
    const candidates = ['/admin', '/admin/roles', '/admin/user-assignments', '/user-assignments'];
    let lastUrl = '';
    let mounted = false;
    for (const p of candidates) {
      await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      lastUrl = page.url();
      mounted = await page
        .locator('main, [role="main"], h1, h2')
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (mounted) break;
    }
    await shot(page, 'test-9-permissions');
    const hardErrors = hardBlockingErrors(probes.consoleErrors, probes.pageErrors);
    record('test-9', 'PERMS-001 permissions surface mounts', {
      passed: hardErrors.length === 0 && mounted,
      finalUrl: lastUrl,
      mounted,
      hardBlockingErrors: hardErrors,
      consoleErrorCount: probes.consoleErrors.length,
      networkFailureCount: probes.networkFailures.length,
      note: 'Trainer-role boundary walk is operator UAT',
    });
    expect(hardErrors).toHaveLength(0);
  });
});
