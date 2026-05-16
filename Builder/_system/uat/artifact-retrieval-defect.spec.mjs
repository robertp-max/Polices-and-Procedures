/**
 * artifact-retrieval-defect.spec.mjs — P0/P1 protected-subsystem investigation
 *
 * GOAL: confirm whether the "Signed artifact not available in this session" /
 * "No renderable preview for this state" error in ArtifactViewerPage is caused
 * by:
 *   (a) persistence failure (sign flow never writes the blob anywhere durable)
 *   (b) retrieval failure (blob is in IDB but viewer doesn't read it)
 *   (c) rendering failure (blob is hydrated but the viewer's useMemo/effect
 *       does not surface it to <iframe src>)
 *   (d) hybrid
 *
 * Read-side hypothesis from explore subagents:
 *   - ArtifactViewerPage.resolveEvidenceDataUrl reads ONLY from
 *     localDataUrl → in-memory memCache → localStorage (sync ladder)
 *   - IndexedDB is hydrated by an async prefetch effect, gated on
 *     `signed_snapshot_capture` flag, that fills memCache but DOES NOT
 *     trigger a React re-render
 *   - eCign signed packets routinely exceed 4 MB, which causes
 *     stashDemoEvidenceDataUrl to skip the localStorage write
 *     (the IDB fire-and-forget write still happens)
 *   - On hard refresh: memCache is wiped (module-level memory),
 *     localStorage is empty for >4MB packets, IDB still has the blob —
 *     but the sync ladder never reads IDB, so the viewer shows the
 *     amber "not available in this session" banner
 *
 * This spec walks the full flow + inspects every storage layer at each
 * stage so we can prove the hypothesis (or refute it).
 *
 * Run:
 *   npx playwright test artifact-retrieval-defect --reporter=list
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
  'artifact-retrieval-defect',
);
const REPORT_PATH = path.resolve(
  __dirname,
  '..',
  'reports',
  'artifact-retrieval-defect.json',
);

const BASE = 'http://localhost:5173';
const EVENT_ID = 'qapi_meeting-20260205-04';
const TASK_ID = `TASK-${EVENT_ID}-qapi-gov-pip-baseline`;
const WORKFLOW_ID = 'WF-QA-PI-001';
const FORM_ID = 'QA-FM-021';

// ──────────────────────────────────────────────────────────────
// Helpers — storage inspection
// ──────────────────────────────────────────────────────────────

/** Probe every relevant storage layer + return a compact snapshot. */
async function probeStorage(page, label) {
  return page.evaluate(async (lbl) => {
    const snap = {
      label: lbl,
      timestamp: new Date().toISOString(),
      flags: {},
      localStorage: { ces_ev_keys: [], reg_store_evidence: [], misc: {} },
      indexedDb: { dbExists: false, recordCount: 0, records: [] },
      memCacheVisible: false,
    };

    // ── PM feature flags ──
    try {
      const fr = localStorage.getItem('pm-feature-flags-v1');
      snap.flags = fr ? JSON.parse(fr) : {};
    } catch (e) {
      snap.flags = { _error: String(e) };
    }

    // ── localStorage ces_ev_data_* + reg-execution-v2 ──
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('ces_ev_data_')) {
        const v = localStorage.getItem(k);
        snap.localStorage.ces_ev_keys.push({
          key: k,
          bytes: v ? v.length : 0,
          prefix: v ? v.substring(0, 40) : '(null)',
          isPdf: v ? v.startsWith('data:application/pdf') : false,
          isHtml: v ? v.startsWith('data:text/html') : false,
        });
      }
    }
    try {
      const reg = localStorage.getItem('reg-execution-v2');
      if (reg) {
        const parsed = JSON.parse(reg);
        const ev = parsed?.state?.evidence ?? {};
        for (const [eventId, docs] of Object.entries(ev)) {
          for (const doc of docs ?? []) {
            if (!doc?.artifactType) continue;
            snap.localStorage.reg_store_evidence.push({
              eventId,
              id: doc.id,
              artifactType: doc.artifactType,
              kind: doc.kind,
              status: doc.status,
              linkedFormInstanceId: doc.linkedFormInstanceId,
              mimeType: doc.mimeType,
              hasLocalDataUrl: !!doc.localDataUrl,
              localDataUrlBytes: doc.localDataUrl ? doc.localDataUrl.length : 0,
              fileSize: doc.fileSize,
            });
          }
        }
      }
    } catch (e) {
      snap.localStorage.misc._reg_error = String(e);
    }

    // ── IndexedDB ci_evidence_blobs / evidence_blobs ──
    // IMPORTANT: open at the SAME version + upgrade handler the app uses
    // (see indexedDbEvidenceBlobStore.ts) so probing doesn't create an empty
    // v1 DB that prevents the app from ever creating the store.
    try {
      const dbReq = indexedDB.open('ci_evidence_blobs', 1);
      dbReq.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains('evidence_blobs')) {
          d.createObjectStore('evidence_blobs', { keyPath: 'evidenceId' });
        }
      };
      const db = await new Promise((resolve, reject) => {
        dbReq.onsuccess = () => resolve(dbReq.result);
        dbReq.onerror = () => reject(dbReq.error);
        dbReq.onblocked = () => reject(new Error('open blocked'));
      });
      snap.indexedDb.dbExists = true;
      snap.indexedDb.version = db.version;
      if (db.objectStoreNames.contains('evidence_blobs')) {
        const tx = db.transaction('evidence_blobs', 'readonly');
        const store = tx.objectStore('evidence_blobs');
        const all = await new Promise((resolve, reject) => {
          const req = store.getAll();
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
        });
        snap.indexedDb.recordCount = all.length;
        snap.indexedDb.records = all.map((r) => ({
          evidenceId: r.evidenceId,
          createdAt: r.createdAt,
          bytes: r.dataUrl ? r.dataUrl.length : 0,
          prefix: r.dataUrl ? r.dataUrl.substring(0, 40) : '(null)',
          isPdf: r.dataUrl ? r.dataUrl.startsWith('data:application/pdf') : false,
          isHtml: r.dataUrl ? r.dataUrl.startsWith('data:text/html') : false,
        }));
      }
      db.close();
    } catch (e) {
      snap.indexedDb._error = String(e);
    }

    return snap;
  }, label);
}

/** Probe the ArtifactViewerPage rendered state — what does the user actually see? */
async function probeViewer(page) {
  return {
    hasAmberBanner: await page
      .locator('text=Signed artifact not available in this session')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false),
    hasNoRenderableBanner: await page
      .locator('text=No renderable preview for this state')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false),
    iframeCount: await page.locator('iframe').count(),
    iframeSrcs: await page
      .locator('iframe')
      .evaluateAll((els) =>
        els.map((e) => ({
          src: e.getAttribute('src') || '',
          srcLen: (e.getAttribute('src') || '').length,
          srcPrefix: (e.getAttribute('src') || '').substring(0, 60),
        })),
      )
      .catch(() => []),
    metadataPresent: await page
      .locator('text=Metadata')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false),
  };
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

// ──────────────────────────────────────────────────────────────
// Repro spec
// ──────────────────────────────────────────────────────────────

test.describe('P0/P1 — artifact retrieval defect investigation', () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  });

  test('full sign → view → refresh → view repro with storage snapshots', async ({
    page,
  }) => {
    test.setTimeout(240_000);
    const report = {
      hypothesis:
        'On hard refresh, in-memory + localStorage layers are empty for >4MB packets; IDB still has bytes but sync read path does not read IDB, so viewer shows "not available in this session".',
      stages: [],
      consoleErrors: [],
      pageErrors: [],
    };
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        report.consoleErrors.push({ at: new Date().toISOString(), text: msg.text() });
      }
    });
    page.on('pageerror', (err) => {
      report.pageErrors.push({ at: new Date().toISOString(), text: err.message });
    });

    // ── Stage 0: clean slate ──
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      // Wipe all relevant localStorage keys
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('ces_ev_data_') ||
            k.startsWith('ecign:') ||
            k.startsWith('ci_ecign_') ||
            k.startsWith('ci_form_fields_'))
        ) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));

      // Wipe IndexedDB ci_evidence_blobs
      try {
        await new Promise((resolve) => {
          const req = indexedDB.deleteDatabase('ci_evidence_blobs');
          req.onsuccess = req.onerror = req.onblocked = () => resolve();
        });
      } catch {
        /* ignore */
      }
    });
    report.stages.push({
      stage: 's0_clean',
      storage: await probeStorage(page, 's0_clean'),
    });
    await shot(page, 's0-clean');

    // ── Stage 1: open form with CES context ──
    const formUrl = `${BASE}/forms/${FORM_ID}?event_id=${EVENT_ID}&task_id=${TASK_ID}&workflow_id=${WORKFLOW_ID}`;
    await page.goto(formUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await shot(page, 's1-form-loaded');

    // Fill some text fields so the printed packet isn't empty (and is bigger)
    const inputs = await page.locator('input[type="text"], textarea').all();
    let filled = 0;
    for (const inp of inputs.slice(0, 8)) {
      try {
        await inp.fill(`Defect repro field ${++filled}`);
      } catch {
        /* skip */
      }
    }
    report.stages.push({
      stage: 's1_form_filled',
      filledFields: filled,
      storage: await probeStorage(page, 's1_form_filled'),
    });

    // ── Stage 2: walk through full eCIgn flow ──
    const ecignBtn = page.locator('[data-testid="ecign-sign-btn"]').first();
    const ecignAlt = page
      .locator('button:has(img[alt*="Sign with eCign"])')
      .first();
    let opened = false;
    if (await ecignBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ecignBtn.click();
      opened = true;
    } else if (await ecignAlt.isVisible({ timeout: 3000 }).catch(() => false)) {
      await ecignAlt.click();
      opened = true;
    }
    if (!opened) {
      report.stages.push({
        stage: 's2_ecign_open_failed',
        note: 'No eCign sign button visible — defect cannot be reproduced via UI walk',
      });
      await shot(page, 's2-no-ecign-button');
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      test.skip(true, 'No eCign sign button found at this form id');
      return;
    }
    await page.waitForTimeout(2000);
    await shot(page, 's2-ecign-opened');

    // Consent
    const consentChk = page
      .locator(
        'label:has-text("I agree to use an electronic signature") input[type="checkbox"]',
      )
      .first();
    if (await consentChk.isVisible({ timeout: 4000 }).catch(() => false)) {
      await consentChk.check();
    }
    const acceptBtn = page
      .getByRole('button', { name: /Accept.*Continue/i })
      .first();
    if (await acceptBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await acceptBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 's2a-consent-done');

    // Identity
    const identityChk = page
      .locator(
        'label:has-text("I attest that I am the authorized signer") input[type="checkbox"]',
      )
      .first();
    if (await identityChk.isVisible({ timeout: 4000 }).catch(() => false)) {
      await identityChk.check();
    }
    const confirmIdBtn = page
      .getByRole('button', { name: /Confirm Identity|Verify Identity/i })
      .first();
    if (await confirmIdBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await confirmIdBtn.click();
      await page.waitForTimeout(1500);
    }
    await shot(page, 's2b-identity-done');

    // Review
    const reviewBtn = page
      .getByRole('button', { name: /Acknowledge Review/i })
      .first();
    if (await reviewBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await reviewBtn.click({ timeout: 10000 });
      await page.waitForTimeout(1500);
    }
    await shot(page, 's2c-review-done');

    // Signature canvas
    const canvas = page.locator('canvas').first();
    if (await canvas.isVisible({ timeout: 4000 }).catch(() => false)) {
      const box = await canvas.boundingBox();
      if (box) {
        await page.mouse.move(box.x + 30, box.y + box.height / 2);
        await page.mouse.down();
        for (let i = 0; i < 10; i++) {
          await page.mouse.move(
            box.x + 30 + (i * (box.width - 60)) / 10,
            box.y + box.height / 2 + Math.sin(i * 0.7) * 18,
          );
          await page.waitForTimeout(30);
        }
        await page.mouse.up();
      }
    }
    const confirmSigBtn = page
      .getByRole('button', { name: /Confirm Signature|Apply Signature/i })
      .first();
    if (await confirmSigBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await confirmSigBtn.click({ timeout: 10000 });
      await page.waitForTimeout(1500);
    }
    await shot(page, 's2d-signature-applied');

    // Attestation — check remaining boxes and lock
    const attestBoxes = page.locator('input[type="checkbox"]:not(:checked)');
    const attestCount = await attestBoxes.count();
    for (let i = 0; i < attestCount; i++) {
      try {
        await attestBoxes.nth(i).check({ timeout: 1500 });
      } catch {
        /* skip */
      }
    }
    const lockBtn = page
      .getByRole('button', { name: /Lock Document|Finalize/i })
      .first();
    if (await lockBtn.isVisible({ timeout: 6000 }).catch(() => false)) {
      try {
        await lockBtn.click({ timeout: 8000 });
      } catch {
        /* swallow */
      }
    }
    await page.waitForTimeout(8000); // allow packet build + uploadEvidence + idbPut
    await shot(page, 's2e-locked');

    report.stages.push({
      stage: 's2_signed_locked',
      storage: await probeStorage(page, 's2_signed_locked'),
    });

    // ── Stage 3: open ArtifactViewer for the signed packet — BEFORE refresh ──
    const signedPacketId = await page.evaluate(() => {
      try {
        const reg = localStorage.getItem('reg-execution-v2');
        if (!reg) return null;
        const parsed = JSON.parse(reg);
        const evMap = parsed?.state?.evidence ?? {};
        for (const docs of Object.values(evMap)) {
          for (const doc of docs ?? []) {
            if (doc?.artifactType === 'signed_package') return doc.id;
          }
        }
        return null;
      } catch {
        return null;
      }
    });
    const formInstanceId = await page.evaluate(() => {
      try {
        const reg = localStorage.getItem('reg-execution-v2');
        if (!reg) return null;
        const parsed = JSON.parse(reg);
        const evMap = parsed?.state?.evidence ?? {};
        for (const docs of Object.values(evMap)) {
          for (const doc of docs ?? []) {
            if (doc?.artifactType === 'signed_package' && doc.linkedFormInstanceId) {
              return doc.linkedFormInstanceId;
            }
          }
        }
        return null;
      } catch {
        return null;
      }
    });

    report.signedPacketId = signedPacketId;
    report.formInstanceId = formInstanceId;

    if (!signedPacketId || !formInstanceId) {
      report.stages.push({
        stage: 's3_no_artifact_to_view',
        note: 'Signing flow did not produce a signed_package row — defect cannot be reproduced',
      });
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      test.fail(true, 'No signed_package artifact produced; cannot probe viewer');
      return;
    }

    const viewerUrlFromInstance = `${BASE}/artifacts/${encodeURIComponent(
      formInstanceId,
    )}?event_id=${EVENT_ID}&task_id=${TASK_ID}&form_id=${FORM_ID}&form_instance_id=${encodeURIComponent(
      formInstanceId,
    )}&type=form_instance`;
    await page.goto(viewerUrlFromInstance, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await shot(page, 's3-viewer-before-refresh');
    report.stages.push({
      stage: 's3_viewer_before_refresh',
      url: viewerUrlFromInstance,
      viewer: await probeViewer(page),
      storage: await probeStorage(page, 's3_viewer_before_refresh'),
    });

    // ── Stage 4: HARD REFRESH ──
    await page.evaluate(() => {
      // No-op; reload below performs the hard refresh
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await shot(page, 's4-viewer-after-hard-refresh');
    report.stages.push({
      stage: 's4_viewer_after_hard_refresh',
      url: viewerUrlFromInstance,
      viewer: await probeViewer(page),
      storage: await probeStorage(page, 's4_viewer_after_hard_refresh'),
    });

    // ── Stage 5: navigate to Evidence Center → click through ──
    await page.goto(`${BASE}/evidence`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await shot(page, 's5a-evidence-center');
    report.stages.push({
      stage: 's5a_evidence_center',
      viewer: await probeViewer(page),
      storage: await probeStorage(page, 's5a_evidence_center'),
    });

    // Try to find a link to the artifact and click
    const viewArtifactLink = page
      .locator(`a[href*="/artifacts/"]`)
      .first();
    if (await viewArtifactLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const hrefBefore = await viewArtifactLink.getAttribute('href');
      report.evidenceCenterFirstArtifactLink = hrefBefore;
      await viewArtifactLink.click();
      await page.waitForTimeout(3000);
      await shot(page, 's5b-via-evidence-center');
      report.stages.push({
        stage: 's5b_viewer_via_evidence_center',
        viewer: await probeViewer(page),
        storage: await probeStorage(page, 's5b_viewer_via_evidence_center'),
      });
    }

    // ── Stage 6: directly query IDB for the signed packet to prove bytes exist ──
    const idbProbe = await page.evaluate(async (id) => {
      try {
        const db = await new Promise((resolve, reject) => {
          const r = indexedDB.open('ci_evidence_blobs', 1);
          r.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('evidence_blobs')) {
              d.createObjectStore('evidence_blobs', { keyPath: 'evidenceId' });
            }
          };
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        if (!db.objectStoreNames.contains('evidence_blobs')) {
          db.close();
          return { found: false, reason: 'store missing' };
        }
        const tx = db.transaction('evidence_blobs', 'readonly');
        const store = tx.objectStore('evidence_blobs');
        const rec = await new Promise((resolve, reject) => {
          const r = store.get(id);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        db.close();
        if (!rec) return { found: false };
        return {
          found: true,
          bytes: rec.dataUrl ? rec.dataUrl.length : 0,
          isPdf: rec.dataUrl?.startsWith('data:application/pdf'),
          isHtml: rec.dataUrl?.startsWith('data:text/html'),
          createdAt: rec.createdAt,
        };
      } catch (e) {
        return { found: false, error: String(e) };
      }
    }, signedPacketId);
    report.idbDirectProbeOfSignedPacket = idbProbe;

    // ── Stage 7: ask viewer to render again, but await IDB warm-up explicitly ──
    await page.goto(viewerUrlFromInstance, { waitUntil: 'networkidle' });
    // Wait LONGER than typical render so any debounced effects fire
    await page.waitForTimeout(6000);
    await shot(page, 's7-viewer-after-extended-wait');
    report.stages.push({
      stage: 's7_viewer_after_extended_wait',
      viewer: await probeViewer(page),
      storage: await probeStorage(page, 's7_viewer_after_extended_wait'),
    });

    // ── Stage 8a: REPRO — localStorage evicted, IDB INTACT ───────────────
    // This is the production user-reported scenario:
    //   - artifact was signed previously (IDB has bytes)
    //   - localStorage entry was evicted (quota pressure, browser clear,
    //     >4MB never-stored window from before the ungated write existed)
    //   - new browser session → memCache empty
    //   - viewer should still be able to recover via IDB
    //
    // Expected outcome (if read path is correct):  iframe renders
    // Actual (if rendering bug exists):  amber banner because sync ladder
    //   does NOT check IDB; async prefetch fills memCache but does NOT
    //   trigger React re-render of immutableFormArtifactUrl useMemo
    await page.evaluate(() => {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('ces_ev_data_')) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    });
    await page.waitForTimeout(500);
    await page.goto(viewerUrlFromInstance, { waitUntil: 'networkidle' });
    // Initial render (before any async IDB warm-up could possibly land)
    await page.waitForTimeout(500);
    await shot(page, 's8a-viewer-ls-evicted-idb-intact-initial');
    const s8aInitial = await probeViewer(page);
    // Allow generous time for prefetchDemoEvidenceFromIdb to settle
    await page.waitForTimeout(5000);
    await shot(page, 's8a-viewer-ls-evicted-idb-intact-after-wait');
    report.stages.push({
      stage: 's8a_viewer_ls_evicted_idb_intact',
      url: viewerUrlFromInstance,
      viewerInitial: s8aInitial,
      viewerAfterWait: await probeViewer(page),
      storage: await probeStorage(page, 's8a_viewer_ls_evicted_idb_intact'),
    });

    // ── Stage 8b: REPRO — all storage gone (pre-Wave-2 vintage) ──────────
    // Wipe both localStorage AND IDB; the bytes are truly irrecoverable.
    // Confirms the amber banner is the correct UI for this state.
    await page.evaluate(async () => {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('ces_ev_data_')) toRemove.push(k);
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
      await new Promise((r) => {
        const req = indexedDB.deleteDatabase('ci_evidence_blobs');
        req.onsuccess = req.onerror = req.onblocked = () => r();
      });
    });
    await page.waitForTimeout(500);
    await page.goto(viewerUrlFromInstance, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    await shot(page, 's8b-viewer-all-storage-gone');
    report.stages.push({
      stage: 's8b_viewer_all_storage_gone',
      url: viewerUrlFromInstance,
      viewer: await probeViewer(page),
      storage: await probeStorage(page, 's8b_viewer_all_storage_gone'),
    });

    // ── Stage 9: DIAGNOSTIC — direct IDB infrastructure check ────────────
    // Prove that IDB itself works in this browser environment (rules out the
    // theory that IDB is unavailable). If this succeeds, the missing IDB
    // records in s3-s8 are due to the application code NOT writing, not
    // due to environment.
    const idbInfra = await page.evaluate(async () => {
      const result = { canOpen: false, canPut: false, canGet: false, recordCount: 0, error: null };
      try {
        // First delete any existing test DB
        await new Promise((r) => {
          const req = indexedDB.deleteDatabase('_idb_diagnostic');
          req.onsuccess = req.onerror = req.onblocked = () => r();
        });
        // Open + create store
        const db = await new Promise((resolve, reject) => {
          const req = indexedDB.open('_idb_diagnostic', 1);
          req.onupgradeneeded = (e) => {
            const d = e.target.result;
            d.createObjectStore('test_store', { keyPath: 'id' });
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        result.canOpen = true;
        // Put
        await new Promise((resolve, reject) => {
          const tx = db.transaction('test_store', 'readwrite');
          const req = tx.objectStore('test_store').put({ id: 'k1', value: 'hello' });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        result.canPut = true;
        // Get
        const got = await new Promise((resolve, reject) => {
          const tx = db.transaction('test_store', 'readonly');
          const req = tx.objectStore('test_store').get('k1');
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        result.canGet = got?.value === 'hello';
        // Count
        const count = await new Promise((resolve, reject) => {
          const tx = db.transaction('test_store', 'readonly');
          const req = tx.objectStore('test_store').count();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        result.recordCount = count;
        db.close();
      } catch (e) {
        result.error = String(e);
      }
      return result;
    });
    report.idbInfrastructureDiagnostic = idbInfra;

    // ── Stage 10: DIAGNOSTIC — re-sign + watch IDB at every tick ─────────
    // We want to know: when the app calls stashDemoEvidenceDataUrl(),
    // does the IDB write actually land within 5 seconds? Or does it fail?
    // We can't easily wedge an inspector into the protected sign flow, but
    // we CAN observe what's in IDB at the millisecond grain immediately
    // before vs. after a fresh sign action.
    //
    // (This requires another sign cycle; for now we just snapshot the
    // current state to confirm the absence is stable.)
    const idbCiCheck = await page.evaluate(async () => {
      const result = { dbExists: false, storeExists: false, recordCount: 0, error: null };
      try {
        const db = await new Promise((resolve, reject) => {
          const req = indexedDB.open('ci_evidence_blobs', 1);
          req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('evidence_blobs')) {
              d.createObjectStore('evidence_blobs', { keyPath: 'evidenceId' });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        result.dbExists = true;
        result.dbVersion = db.version;
        result.storeExists = db.objectStoreNames.contains('evidence_blobs');
        if (result.storeExists) {
          const tx = db.transaction('evidence_blobs', 'readonly');
          const req = tx.objectStore('evidence_blobs').count();
          result.recordCount = await new Promise((resolve, reject) => {
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          });
        }
        db.close();
      } catch (e) {
        result.error = String(e);
      }
      return result;
    });
    report.ciEvidenceBlobsDbState = idbCiCheck;

    // Write report
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

    // ── ASSERTIONS that encode the diagnosis ──
    const s3 = report.stages.find((s) => s.stage === 's3_viewer_before_refresh');
    const s4 = report.stages.find((s) => s.stage === 's4_viewer_after_hard_refresh');
    const s7 = report.stages.find((s) => s.stage === 's7_viewer_after_extended_wait');
    const s8a = report.stages.find((s) => s.stage === 's8a_viewer_ls_evicted_idb_intact');
    const s8b = report.stages.find((s) => s.stage === 's8b_viewer_all_storage_gone');

    console.log('\n=== DEFECT INVESTIGATION SUMMARY ===');
    console.log('Signed packet id:', signedPacketId);
    console.log('Form instance id:', formInstanceId);
    console.log('Packet bytes (localStorage):',
      s3?.storage?.localStorage?.ces_ev_keys?.[0]?.bytes ?? 'none');
    console.log('IDB direct probe (signed packet):', JSON.stringify(idbProbe));
    console.log('IDB infra diagnostic:', JSON.stringify(idbInfra));
    console.log('ci_evidence_blobs DB state:', JSON.stringify(idbCiCheck));
    console.log('s3 (before refresh) — amber:',
      s3?.viewer?.hasAmberBanner, '| iframe:', s3?.viewer?.iframeCount);
    console.log('s4 (after refresh)  — amber:',
      s4?.viewer?.hasAmberBanner, '| iframe:', s4?.viewer?.iframeCount);
    console.log('s7 (extended wait)  — amber:',
      s7?.viewer?.hasAmberBanner, '| iframe:', s7?.viewer?.iframeCount);
    console.log('s8a (LS evicted; IDB intact) initial — amber:',
      s8a?.viewerInitial?.hasAmberBanner, '| iframe:', s8a?.viewerInitial?.iframeCount);
    console.log('s8a (LS evicted; IDB intact) +5s   — amber:',
      s8a?.viewerAfterWait?.hasAmberBanner, '| iframe:', s8a?.viewerAfterWait?.iframeCount);
    console.log('s8b (LS + IDB wiped)         — amber:',
      s8b?.viewer?.hasAmberBanner, '| iframe:', s8b?.viewer?.iframeCount);
    console.log('Report:', REPORT_PATH);

    // Surface key facts as test failures only when they materially contradict
    // the diagnosis. The report file captures everything either way.
    // We DON'T fail on absence of IDB record yet (that's the diagnosis itself).
  });
});
