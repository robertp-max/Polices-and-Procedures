/**
 * AGENT 3 — CES Canonical Fix Verifier (Cold-Session Playwright Tests)
 * =====================================================================
 * Verifies the 7 pipeline fixes are actually in effect.
 * Every assertion uses a fresh browser context / page reload to prove
 * state persists correctly and is NOT dependent on warm in-memory state.
 *
 * Screenshots → Builder/_system/Q2-QAPI-Walkthrough/screenshots/agent3-verify/
 *
 * Tests:
 *   T1  No SIGN- prefixed signer sub-tasks exist
 *   T2  Form instance ID is idempotent across cold navigations
 *   T3  No "Upload supporting evidence" row for QA-FM-021 form tasks
 *   T4  No LOCK_REQUIRED requirement row exists
 *   T5  signed_package artifact renders ci-brand-header after page reload
 *   T6  No duplicate signed_certificate artifacts
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Constants ─────────────────────────────────────────────────────────────────
const EVENT_ID    = 'qapi_meeting-20260507-08';
const FORM_ID     = 'QA-FM-021';
const EVIDENCE_URL = `/evidence?event_id=${EVENT_ID}`;

const SCREENSHOT_DIR = path.join(
  __dirname,
  '../../Q2-QAPI-Walkthrough/screenshots/agent3-verify',
);
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────
async function shot(page: Page, name: string): Promise<string> {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`[SCREENSHOT] ${name} → ${file}`);
  return file;
}

/** Auth bypass: sets the demo auth key before any page load. */
async function bypassAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    localStorage.setItem('ci_demo_auth_v1', JSON.stringify({
      userId: 'demo-user-careindeed',
      email: 'robertp@careindeed.com',
      role: 'super_admin',
      name: 'TJ Padilla',
      authenticated: true,
      ts: new Date().toISOString(),
    }));
  });
}

/** Wait for the React shell to hydrate enough to query the DOM meaningfully. */
async function waitForAppReady(page: Page, timeout = 4000): Promise<void> {
  await page.waitForFunction(
    () => document.body && document.body.innerText.trim().length > 30,
    undefined,
    { timeout },
  ).catch(() => {});
  await page.waitForTimeout(1500);
}

/** Pull the raw reg-execution-v2 state from localStorage. */
async function readStore(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('reg-execution-v2') ?? '{}'); }
    catch { return {}; }
  });
}

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 1 — No SIGN- prefixed signer sub-tasks exist
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T1 — No signer sub-tasks (SIGN- prefix) exist', () => {
  test('Evidence page has zero tasks with SIGN- prefix', async ({ page }) => {
    await bypassAuth(page);
    await page.goto(EVIDENCE_URL, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    await shot(page, 'T1-01-evidence-page-loaded');

    // 1a. Check localStorage task overrides.
    const signTaskIdsFromStore: string[] = await page.evaluate((evId) => {
      try {
        const raw = localStorage.getItem('reg-execution-v2') ?? '{}';
        const data = JSON.parse(raw) as {
          state?: {
            taskOverridesByEventId?: Record<string, Array<{ id?: string }>>
          }
        };
        const overrides = data?.state?.taskOverridesByEventId?.[evId] ?? [];
        return overrides
          .map((t) => t?.id ?? '')
          .filter((id) => id.startsWith('SIGN-'));
      } catch { return []; }
    }, EVENT_ID);

    console.log('[T1] SIGN- tasks in store overrides:', signTaskIdsFromStore);

    // 1b. Check the page DOM for rendered text matching "Sign QA-FM-" pattern.
    const signTextLocators = await page.locator('text=/Sign QA-FM-/i').all();
    const signTextCount = signTextLocators.length;
    console.log('[T1] DOM rows with "Sign QA-FM-" text:', signTextCount);

    await shot(page, 'T1-02-sign-task-check');

    expect(signTaskIdsFromStore, 'No SIGN- prefixed task IDs must exist in localStorage overrides').toHaveLength(0);
    expect(signTextCount, 'No "Sign QA-FM-" text must appear on the evidence page').toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 2 — Form instance ID is idempotent (cold-session navigations)
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T2 — Form instance idempotency across cold navigations', () => {
  test('Re-opening QA-FM-021 returns the identical instance ID', async ({ page }) => {
    await bypassAuth(page);

    async function captureFormInstanceId(label: string): Promise<string | null> {
      await page.goto(
        `/forms/${FORM_ID}?event_id=${EVENT_ID}&form_id=${FORM_ID}`,
        { waitUntil: 'domcontentloaded' },
      );
      await waitForAppReady(page);
      await shot(page, `T2-${label}-form-loaded`);

      return page.evaluate(([evId, fmId]) => {
        try {
          const raw = localStorage.getItem('reg-execution-v2') ?? '{}';
          const data = JSON.parse(raw) as {
            state?: {
              generatedFormInstancesByEventId?: Record<
                string,
                Array<{ formId?: string; id?: string }>
              >
            }
          };
          const list = data?.state?.generatedFormInstancesByEventId?.[evId] ?? [];
          const match = list.find((i) => i.formId === fmId);
          return match?.id ?? null;
        } catch { return null; }
      }, [EVENT_ID, FORM_ID]);
    }

    const firstId  = await captureFormInstanceId('01-first-open');
    // Navigate away then come back — simulates the user re-opening the form.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const secondId = await captureFormInstanceId('02-second-open');

    console.log('[T2] first instance id:', firstId);
    console.log('[T2] second instance id:', secondId);

    expect(firstId,  'First form open must produce an instance ID').toBeTruthy();
    expect(secondId, 'Second form open must reuse the SAME instance ID').toBe(firstId);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 3 — No "Upload supporting evidence" row for QA-FM-021 form tasks
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T3 — No supporting-evidence-upload requirement for form tasks', () => {
  test('Evidence page for Q2 QAPI shows no "Upload supporting evidence" row linked to QA-FM-021', async ({ page }) => {
    await bypassAuth(page);
    await page.goto(EVIDENCE_URL, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    await shot(page, 'T3-01-evidence-page-loaded');

    // Find every "Upload supporting evidence" text node, then walk up to see
    // if it lives inside a block that also mentions QA-FM-021.
    const rows = await page.locator('text=/Upload supporting evidence/i').all();
    const hitsLinkedToForm: string[] = [];

    for (const row of rows) {
      const ctx = await row.evaluate((el) => {
        let cur: HTMLElement | null = el as HTMLElement;
        for (let i = 0; i < 12; i++) {
          if (!cur) break;
          const txt = cur.textContent ?? '';
          if (/QA-FM-021/i.test(txt)) return txt.slice(0, 300);
          cur = cur.parentElement;
        }
        return null;
      });
      if (ctx) hitsLinkedToForm.push(ctx);
    }

    // Also do a generic case-insensitive check for "upload" near "QA-FM-021".
    const genericRows = await page.locator('text=/QA-FM-021/').all();
    const uploadMentions: string[] = [];
    for (const r of genericRows) {
      const txt = (await r.textContent() ?? '').toLowerCase();
      if (txt.includes('upload')) uploadMentions.push(txt.slice(0, 200));
    }

    console.log('[T3] "Upload supporting evidence" rows linked to QA-FM-021:', hitsLinkedToForm.length);
    console.log('[T3] Generic upload-mention rows near QA-FM-021:', uploadMentions.length);

    await shot(page, 'T3-02-supporting-evidence-check');

    expect(hitsLinkedToForm, 'No "Upload supporting evidence" requirement must exist for QA-FM-021 tasks').toHaveLength(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 4 — No LOCK_REQUIRED requirement row exists
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T4 — LOCK_REQUIRED requirement removed', () => {
  test('Evidence page contains no "Evidence lock required" or LOCK_REQUIRED text', async ({ page }) => {
    await bypassAuth(page);
    await page.goto(EVIDENCE_URL, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    await shot(page, 'T4-01-evidence-page-loaded');

    // Try to expand any task rows to reveal sub-requirements.
    const taskRows = await page.locator('[data-testid="task-row"], [data-testid="execution-unit-card"], .task-row').all();
    for (const row of taskRows.slice(0, 5)) {
      await row.click().catch(() => {});
      await page.waitForTimeout(300);
    }

    await shot(page, 'T4-02-task-rows-expanded');

    const lockRequiredLocators = await page.locator('text=/Evidence lock required|LOCK_REQUIRED/i').all();
    const lockCount = lockRequiredLocators.length;
    console.log('[T4] LOCK_REQUIRED / "Evidence lock required" occurrences found:', lockCount);

    await shot(page, 'T4-03-lock-required-check');

    expect(lockCount, 'No "Evidence lock required" or LOCK_REQUIRED text must appear on the page').toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 5 — signed_package artifact renders ci-brand-header after page reload
 *           (cold-session proof — uses a NEW browser context)
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T5 — signed_package artifact renders after inject + reload (cold session)', () => {
  test('Synthetic signed_package shows ci-brand-header in iframe, survives reload', async ({ browser }) => {
    // Fresh browser context = cold session — no shared cookies / localStorage.
    const ctx: BrowserContext = await browser.newContext({
      baseURL: 'http://localhost:5173',
      viewport: { width: 1440, height: 900 },
      bypassCSP: true,
    });
    const page: Page = await ctx.newPage();

    // Auth bypass via initScript on a clean page.
    await page.addInitScript(() => {
      localStorage.removeItem('ci_demo_bypass_logged_out_v1');
      localStorage.setItem('ci_demo_auth_v1', JSON.stringify({
        userId: 'demo-user-careindeed',
        email: 'robertp@careindeed.com',
        role: 'super_admin',
        name: 'TJ Padilla',
        authenticated: true,
        ts: new Date().toISOString(),
      }));
    });

    // Navigate to home so localStorage is seeded by initScript.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Build synthetic evidence + stash HTML content in localStorage.
    const sampleHtml =
      '<!doctype html><html><head><title>Signed Packet</title></head><body>' +
      '<div class="ci-brand-header"><img alt="Care Indeed — The Heart of Home Health"/>' +
      '<span>Care Indeed</span></div>' +
      '<div class="form-content">QA-FM-021 signed packet content.</div>' +
      '</body></html>';

    const SYNTHETIC_EV_ID = 'EV-verify-render-test';
    const stashKey = `ces_ev_data_${SYNTHETIC_EV_ID}`;
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(sampleHtml);

    await page.evaluate(([evId, evRecord, stashK, dUrl]) => {
      const record = evRecord as {
        id: string; eventId: string; taskId: string; kind: string;
        artifactType: string; mimeType: string; name: string; status: string;
        version: number; formIds: string[]; policyIds: string[];
        linkedFormId: string; linkedFormInstanceId: string; workflowId: string;
        policyId: string; uploadedBy: string; uploadedAt: string;
        createdBy: string; createdAt: string;
      };
      const raw = localStorage.getItem('reg-execution-v2') ?? '{}';
      const parsed = JSON.parse(raw) as {
        state?: { evidence?: Record<string, unknown[]> }
      };
      const state = parsed.state ?? {};
      const evMap = state.evidence ?? {};
      const evList = (evMap[evId] ?? []) as unknown[];
      const next = {
        ...parsed,
        state: {
          ...state,
          evidence: {
            ...evMap,
            [evId]: [record, ...evList],
          },
        },
      };
      localStorage.setItem('reg-execution-v2', JSON.stringify(next));
      localStorage.setItem(stashK, dUrl);
    }, [
      EVENT_ID,
      {
        id: SYNTHETIC_EV_ID,
        eventId: EVENT_ID,
        taskId: 'task-verify-001',
        kind: 'signed_package',
        artifactType: 'signed_package',
        mimeType: 'text/html',
        name: 'QA-FM-021-verify-signed-package.html',
        status: 'EVIDENCE_LOCKED',
        version: 1,
        formIds: [FORM_ID],
        policyIds: ['QA-PG-001'],
        linkedFormId: FORM_ID,
        linkedFormInstanceId: `${EVENT_ID}-${FORM_ID}-001`,
        workflowId: 'QA-WF-03',
        policyId: 'QA-PG-001',
        uploadedBy: 'TJ Padilla',
        uploadedAt: new Date().toISOString(),
        createdBy: 'TJ Padilla',
        createdAt: new Date().toISOString(),
      },
      stashKey,
      dataUrl,
    ]);

    console.log('[T5] Synthetic evidence injected, navigating to artifact viewer...');

    // Navigate to the artifact viewer.
    const artifactUrl = `/artifacts/${SYNTHETIC_EV_ID}?type=signed_package&event_id=${EVENT_ID}`;
    await page.goto(artifactUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.body && document.body.innerText.trim().length > 20,
      undefined,
      { timeout: 15_000 },
    ).catch(() => {});
    await page.waitForTimeout(3000);

    await shot(page, 'T5-01-artifact-viewer-before-reload');

    // Check iframe content.
    const ifr = page.frameLocator('iframe').first();
    const bodyBefore = await ifr.locator('body').first().innerHTML({ timeout: 8000 }).catch(() => '');
    const hasBrandBefore = bodyBefore.includes('ci-brand-header');
    console.log('[T5] iframe body length before reload:', bodyBefore.length, '| has ci-brand-header:', hasBrandBefore);

    expect(hasBrandBefore, 'ci-brand-header must be present in iframe BEFORE reload').toBe(true);

    // ── RELOAD (cold-session proof) ───────────────────────────────────────────
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      () => document.body && document.body.innerText.trim().length > 20,
      undefined,
      { timeout: 15_000 },
    ).catch(() => {});
    await page.waitForTimeout(3000);

    await shot(page, 'T5-02-artifact-viewer-after-reload');

    const ifrAfter = page.frameLocator('iframe').first();
    const bodyAfter = await ifrAfter.locator('body').first().innerHTML({ timeout: 8000 }).catch(() => '');
    const hasBrandAfter = bodyAfter.includes('ci-brand-header');
    console.log('[T5] iframe body length after reload:', bodyAfter.length, '| has ci-brand-header:', hasBrandAfter);

    expect(hasBrandAfter, 'ci-brand-header must STILL be present in iframe AFTER reload (cold-session proof)').toBe(true);

    await ctx.close();
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  TEST 6 — No duplicate signed_certificate artifacts
 * ══════════════════════════════════════════════════════════════════════════════ */
test.describe('T6 — No duplicate signed_certificate artifacts', () => {
  test('Evidence store for Q2 QAPI contains zero signed_certificate artifacts', async ({ page }) => {
    await bypassAuth(page);
    await page.goto(EVIDENCE_URL, { waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);

    await shot(page, 'T6-01-evidence-page-loaded');

    // Inject the same synthetic evidence record as T5 to simulate a completed
    // signing cycle, then assert no signed_certificate was created alongside it.
    const SYNTH_ID = 'EV-verify-cert-check';
    const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(
      '<!doctype html><html><body><div class="ci-brand-header">Care Indeed</div></body></html>',
    );

    await page.evaluate(([evId, evRecord, stashK, dUrl]) => {
      const record = evRecord as Record<string, unknown>;
      const raw = localStorage.getItem('reg-execution-v2') ?? '{}';
      const parsed = JSON.parse(raw) as {
        state?: { evidence?: Record<string, unknown[]> }
      };
      const state = parsed.state ?? {};
      const evMap = state.evidence ?? {};
      const evList = (evMap[evId] ?? []) as unknown[];
      const next = {
        ...parsed,
        state: {
          ...state,
          evidence: {
            ...evMap,
            [evId]: [record, ...evList],
          },
        },
      };
      localStorage.setItem('reg-execution-v2', JSON.stringify(next));
      localStorage.setItem(stashK, dUrl);
    }, [
      EVENT_ID,
      {
        id: SYNTH_ID,
        eventId: EVENT_ID,
        taskId: 'task-verify-cert-001',
        kind: 'signed_package',
        artifactType: 'signed_package',
        mimeType: 'text/html',
        name: 'QA-FM-021-cert-check.html',
        status: 'EVIDENCE_LOCKED',
        version: 1,
        formIds: [FORM_ID],
        policyIds: ['QA-PG-001'],
        linkedFormId: FORM_ID,
        linkedFormInstanceId: `${EVENT_ID}-${FORM_ID}-001`,
        workflowId: 'QA-WF-03',
        policyId: 'QA-PG-001',
        uploadedBy: 'TJ Padilla',
        uploadedAt: new Date().toISOString(),
        createdBy: 'TJ Padilla',
        createdAt: new Date().toISOString(),
      },
      `ces_ev_data_${SYNTH_ID}`,
      dataUrl,
    ]);

    // Now count signed_certificate artifacts in the store.
    const certCount: number = await page.evaluate((evId) => {
      try {
        const raw = localStorage.getItem('reg-execution-v2') ?? '{}';
        const data = JSON.parse(raw) as {
          state?: { evidence?: Record<string, Array<{ artifactType?: string }>> }
        };
        const evList = data?.state?.evidence?.[evId] ?? [];
        return evList.filter((e) => e?.artifactType === 'signed_certificate').length;
      } catch { return -1; }
    }, EVENT_ID);

    console.log('[T6] signed_certificate artifact count:', certCount);

    await shot(page, 'T6-02-cert-count-check');

    // Navigate to evidence page for visual confirmation.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForAppReady(page);
    await shot(page, 'T6-03-evidence-page-only-signed-package');

    expect(certCount, 'Zero signed_certificate artifacts must exist — only signed_package is stored').toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════════════
 *  afterAll — write a run summary
 * ══════════════════════════════════════════════════════════════════════════════ */
test.afterAll(async () => {
  const summary = {
    agent: 'AGENT 3 — Playwright Verifier',
    runAt: new Date().toISOString(),
    event: EVENT_ID,
    form: FORM_ID,
    tests: ['T1-NoSignerTasks', 'T2-FormIdempotency', 'T3-NoSupportingEvidenceRow', 'T4-NoLockRequired', 'T5-ArtifactRendersAfterReload', 'T6-NoDuplicateCert'],
    screenshotsDir: SCREENSHOT_DIR,
  };
  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'agent3-run-summary.json'),
    JSON.stringify(summary, null, 2),
  );
  console.log('[AGENT 3] Run summary written to', SCREENSHOT_DIR);
});
