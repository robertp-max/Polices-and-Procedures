/**
 * PHASE 5A-C QA - POSITIVE ARTIFACT FIXTURE PROOF
 *
 * Seeds deterministic, non-PHI browser-local evidence records so V3 can prove:
 * - real-local-artifact actions when local demo bytes exist
 * - real-route-only actions when only an object path/route exists
 * - metadata-only / seeded-preview records remain blocked
 *
 * This script does not add backend persistence, AWS/S3/DynamoDB integration,
 * fake PDFs, production downloads, legal signatures, or Level 5 certification.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

const RESULT_PATH = path.join(ARTIFACT_DIR, 'phase5c-artifact-positive-fixture-results.json');
const SCREENSHOTS = {
  local: 'phase5c-real-local-artifact.png',
  route: 'phase5c-real-route-only.png',
  blocked: 'phase5c-blocked-artifact.png',
};

const FIXTURE = {
  eventId: 'phase5c-qa-event',
  taskId: 'phase5c-artifact-positive-qa-task',
  workflowId: 'phase5c-demo-local-workflow',
  policyId: 'phase5c-demo-policy',
  formId: 'phase5c-demo-form',
  localEvidenceId: 'phase5c-real-local-artifact',
  routeEvidenceId: 'phase5c-real-route-only',
  blockedEvidenceId: 'phase5c-metadata-placeholder',
  localDataUrl: 'data:text/plain;charset=utf-8,Phase%205A-C%20QA%20fixture%20only%20-%20non-PHI%20demo-local%20artifact%20bytes.',
};

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function clickEvidenceNav(page) {
  let evidenceNav = page.getByRole('button', { name: /Evidence Center/i }).first();
  if (!(await evidenceNav.isVisible().catch(() => false))) {
    await page.getByRole('button').filter({ hasText: /menu/i }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    evidenceNav = page.getByRole('button', { name: /Evidence Center/i }).first();
  }
  if (await evidenceNav.isVisible().catch(() => false)) {
    await evidenceNav.click();
    await page.waitForTimeout(900);
  }
}

function qaEvidenceDoc({ id, name, objectPath, note }) {
  const now = '2026-05-26T15:30:00.000Z';
  return {
    id,
    version: 1,
    policyId: FIXTURE.policyId,
    eventId: FIXTURE.eventId,
    taskId: FIXTURE.taskId,
    policyIds: [FIXTURE.policyId],
    workflowId: FIXTURE.workflowId,
    formIds: [FIXTURE.formId],
    folderPath: 'qa-fixtures/phase5c',
    objectPath,
    createdAt: now,
    createdBy: 'Phase 5A-C QA fixture',
    status: 'EVIDENCE_LOCKED',
    checksum: `qa-fixture-${id}`,
    fileSize: 88,
    mimeType: 'text/plain',
    name,
    kind: 'attachment',
    uploadedAt: now,
    uploadedBy: 'Phase 5A-C QA fixture',
    sizeLabel: '88 B',
    linkedFormId: FIXTURE.formId,
    note,
  };
}

function buildPersistedFixtureState() {
  const evidence = [
    qaEvidenceDoc({
      id: FIXTURE.localEvidenceId,
      name: 'Phase 5A-C QA real local artifact.txt',
      objectPath: `qa-fixtures/phase5c/${FIXTURE.localEvidenceId}.txt`,
      note: 'Phase 5A-C QA fixture only; non-PHI demo-local bytes stored in browser cache.',
    }),
    qaEvidenceDoc({
      id: FIXTURE.routeEvidenceId,
      name: 'Phase 5A-C QA route-only artifact.txt',
      objectPath: `qa-fixtures/phase5c/${FIXTURE.routeEvidenceId}.txt`,
      note: 'Phase 5A-C QA fixture only; metadata has an object path but no local bytes.',
    }),
    qaEvidenceDoc({
      id: FIXTURE.blockedEvidenceId,
      name: 'Phase 5A-C QA metadata placeholder.txt',
      objectPath: '',
      note: 'Phase 5A-C QA fixture only; metadata placeholder intentionally has no route and no local bytes.',
    }),
  ];

  return {
    state: {
      evidence: {
        [FIXTURE.eventId]: evidence,
      },
      taskAuditByEventId: {
        [FIXTURE.eventId]: evidence.map(doc => ({
          auditId: `audit-${doc.id}`,
          eventId: FIXTURE.eventId,
          entityId: doc.id,
          entityType: 'evidence',
          action: 'PHASE_5A_C_QA_FIXTURE_SEEDED',
          actor: 'Phase 5A-C QA fixture',
          timestamp: '2026-05-26T15:30:00.000Z',
          after: { evidenceId: doc.id, qaFixture: true },
        })),
      },
    },
    version: 4,
  };
}

async function seedPhase5cFixtures(page) {
  await page.addInitScript(({ persisted, localEvidenceId, localDataUrl }) => {
    localStorage.setItem('reg-execution-v2', JSON.stringify(persisted));
    localStorage.setItem(`ces_ev_data_${localEvidenceId}`, localDataUrl);
  }, {
    persisted: buildPersistedFixtureState(),
    localEvidenceId: FIXTURE.localEvidenceId,
    localDataUrl: FIXTURE.localDataUrl,
  });
}

function pushPass(results, message) {
  results.passed.push(message);
}

function pushFail(results, message) {
  results.failed.push(message);
}

async function assertVisible(locator, results, message) {
  if (await locator.isVisible().catch(() => false)) {
    pushPass(results, message);
    return true;
  }
  pushFail(results, `Missing: ${message}`);
  return false;
}

async function selectEvidence(page, results, evidenceId) {
  const row = page.locator(`[data-qa="v3-evidence-row"][data-qa-evidence-id="${evidenceId}"]`).first();
  if (!(await assertVisible(row, results, `Evidence row visible: ${evidenceId}`))) return null;

  const beforeUrl = page.url();
  const popupPromise = page.waitForEvent('popup', { timeout: 800 }).catch(() => null);
  await row.click();
  await page.waitForTimeout(400);
  const popup = await popupPromise;
  const afterUrl = page.url();

  if (popup) {
    pushFail(results, `Primary row click opened a popup for ${evidenceId}`);
    await popup.close().catch(() => {});
  } else {
    pushPass(results, `Primary row click did not open artifact viewer for ${evidenceId}`);
  }

  if (beforeUrl === afterUrl && afterUrl.includes('/ui-staging')) {
    pushPass(results, `Primary row click stayed inside /ui-staging for ${evidenceId}`);
  } else {
    pushFail(results, `Primary row click changed URL for ${evidenceId}: ${beforeUrl} -> ${afterUrl}`);
  }

  const detail = page.locator('[data-qa="v3-evidence-detail"]').first();
  const selectedId = await detail.getAttribute('data-qa-selected-evidence-id').catch(() => null);
  if (selectedId === evidenceId) pushPass(results, `Detail selected expected evidence: ${evidenceId}`);
  else pushFail(results, `Detail selected mismatch for ${evidenceId}: ${selectedId}`);

  return detail;
}

async function verifyExplicitArtifactOpen(page, results, expectedRoutePrefix, label) {
  const open = page.locator('[data-qa="v3-evidence-open-artifact"]').first();
  if (!(await assertVisible(open, results, `${label}: Open Artifact Viewer visible`))) return;

  const route = await open.getAttribute('data-qa-artifact-route');
  if (route && route.startsWith(expectedRoutePrefix)) {
    pushPass(results, `${label}: artifact route starts with ${expectedRoutePrefix}`);
  } else {
    pushFail(results, `${label}: artifact route did not start with ${expectedRoutePrefix}: ${route}`);
  }

  const popupPromise = page.waitForEvent('popup', { timeout: 4000 }).catch(() => null);
  await open.click();
  const popup = await popupPromise;
  if (!popup) {
    pushFail(results, `${label}: explicit Open Artifact Viewer did not open a popup`);
    return;
  }
  await popup.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  if (popup.url().includes('/artifacts/')) {
    pushPass(results, `${label}: explicit Open Artifact Viewer opened /artifacts route`);
  } else {
    pushFail(results, `${label}: popup did not open /artifacts route: ${popup.url()}`);
  }
  await popup.close().catch(() => {});
}

function forbiddenPositiveClaimRegex() {
  const parts = [
    'secure audit APIs',
    'stored cryptographically',
    'SECURE & VERIFIED',
    'immutable audit complete',
    'WORM complete',
    'certified complete',
    'production evidence complete',
    'production audit complete',
    'production-shaped complete',
    'level 5 complete',
    'legal signature complete',
    'production persisted',
    'S3 download API complete',
  ];
  return new RegExp(parts.join('|'), 'i');
}

async function run() {
  console.log('=== PHASE 5A-C ARTIFACT POSITIVE FIXTURE QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    fixtureMethod: 'QA-only browser localStorage seed: reg-execution-v2 metadata plus ces_ev_data_<evidenceId> local data URL bytes.',
    fixtureIds: {
      realLocalArtifact: FIXTURE.localEvidenceId,
      realRouteOnly: FIXTURE.routeEvidenceId,
      metadataPlaceholder: FIXTURE.blockedEvidenceId,
    },
    passed: [],
    failed: [],
    screenshots: [],
  };

  try {
    await seedPhase5cFixtures(page);
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    await clickEvidenceNav(page);

    const center = page.locator('[data-qa="v3-evidence-center"]');
    if (!(await assertVisible(center, results, 'V3 Evidence Center workspace visible'))) return results;
    if (page.url().includes('/ui-staging')) pushPass(results, 'Evidence Center navigation stayed under /ui-staging');
    else pushFail(results, `Evidence Center navigation escaped staging: ${page.url()}`);

    let detail = await selectEvidence(page, results, FIXTURE.localEvidenceId);
    if (detail) {
      const actionState = await detail.getAttribute('data-qa-artifact-action-state');
      if (actionState === 'real-local-artifact') pushPass(results, 'real-local-artifact action state is browser-proven');
      else pushFail(results, `Expected real-local-artifact, got ${actionState}`);

      await verifyExplicitArtifactOpen(page, results, '/artifacts/', 'real-local-artifact');

      const download = page.locator('[data-qa="v3-evidence-download-artifact"]').first();
      if (await assertVisible(download, results, 'real-local-artifact: Download Local Artifact visible')) {
        const mode = await download.getAttribute('data-qa-download-mode');
        if (mode === 'local-bytes') pushPass(results, 'real-local-artifact: data-qa-download-mode="local-bytes"');
        else pushFail(results, `real-local-artifact: expected local-bytes download mode, got ${mode}`);
      }

      await page.screenshot({ path: path.join(ARTIFACT_DIR, SCREENSHOTS.local), fullPage: true });
      results.screenshots.push(SCREENSHOTS.local);
    }

    detail = await selectEvidence(page, results, FIXTURE.routeEvidenceId);
    if (detail) {
      const actionState = await detail.getAttribute('data-qa-artifact-action-state');
      if (actionState === 'real-route-only') pushPass(results, 'real-route-only action state is browser-proven');
      else pushFail(results, `Expected real-route-only, got ${actionState}`);

      await verifyExplicitArtifactOpen(page, results, '/artifacts/', 'real-route-only');

      const download = page.locator('[data-qa="v3-evidence-download-artifact"]').first();
      const hasDownload = await download.isVisible().catch(() => false);
      const mode = hasDownload ? await download.getAttribute('data-qa-download-mode') : null;
      if (!hasDownload || mode !== 'local-bytes') pushPass(results, 'real-route-only: local-bytes download is absent');
      else pushFail(results, 'real-route-only: exposed local-bytes download without local bytes');

      const blocker = page.locator('[data-qa="v3-evidence-artifact-blocker"]').first();
      const blockerText = await blocker.innerText().catch(() => '');
      if (/local bytes may not survive refresh/i.test(blockerText)) {
        pushPass(results, 'real-route-only: blocker states local bytes may not survive refresh');
      } else {
        pushFail(results, `real-route-only: missing local bytes refresh blocker text: ${blockerText}`);
      }

      await page.screenshot({ path: path.join(ARTIFACT_DIR, SCREENSHOTS.route), fullPage: true });
      results.screenshots.push(SCREENSHOTS.route);
    }

    detail = await selectEvidence(page, results, FIXTURE.blockedEvidenceId);
    if (detail) {
      const actionState = await detail.getAttribute('data-qa-artifact-action-state');
      if (actionState === 'metadata-placeholder') pushPass(results, 'metadata-placeholder action state remains blocked');
      else pushFail(results, `Expected metadata-placeholder, got ${actionState}`);

      const open = page.locator('[data-qa="v3-evidence-open-artifact"]').first();
      if (!(await open.isVisible().catch(() => false))) pushPass(results, 'metadata-placeholder: no fake Open Artifact Viewer');
      else pushFail(results, 'metadata-placeholder: fake Open Artifact Viewer is visible');

      const download = page.locator('[data-qa="v3-evidence-download-artifact"]').first();
      const hasDownload = await download.isVisible().catch(() => false);
      const mode = hasDownload ? await download.getAttribute('data-qa-download-mode') : null;
      if (!hasDownload || mode !== 'local-bytes') pushPass(results, 'metadata-placeholder: no fake local-bytes download');
      else pushFail(results, 'metadata-placeholder: fake local-bytes download is visible');

      if (await page.locator('[data-qa="v3-evidence-artifact-blocker"]').first().isVisible().catch(() => false)) {
        pushPass(results, 'metadata-placeholder: blocker visible');
      } else {
        pushFail(results, 'metadata-placeholder: blocker missing');
      }

      await page.screenshot({ path: path.join(ARTIFACT_DIR, SCREENSHOTS.blocked), fullPage: true });
      results.screenshots.push(SCREENSHOTS.blocked);
    }

    const seedRow = page.locator('[data-qa="v3-evidence-row"][data-qa-evidence-id^="seed-"]').first();
    if (await seedRow.isVisible().catch(() => false)) {
      const seedId = await seedRow.getAttribute('data-qa-evidence-id');
      const seedDetail = await selectEvidence(page, results, seedId);
      if (seedDetail) {
        const seedState = await seedDetail.getAttribute('data-qa-artifact-action-state');
        if (seedState === 'seeded-preview') pushPass(results, 'seeded-preview fixture remains blocked');
        else pushFail(results, `Expected seeded-preview, got ${seedState}`);
        if (!(await page.locator('[data-qa="v3-evidence-open-artifact"]').first().isVisible().catch(() => false))) {
          pushPass(results, 'seeded-preview: no fake Open Artifact Viewer');
        } else {
          pushFail(results, 'seeded-preview: fake Open Artifact Viewer is visible');
        }
      }
    } else {
      pushFail(results, 'No seeded-preview row found for blocked branch coverage');
    }

    const pageText = await page.locator('body').innerText();
    if (!forbiddenPositiveClaimRegex().test(pageText)) {
      pushPass(results, 'No fake backend/API/AWS/production/Level 5 completion claims visible');
    } else {
      pushFail(results, 'Forbidden fake production/Level 5 completion claim appears');
    }
    if (/not backend persistence|Backend persistence not implemented|not production evidence certification/i.test(pageText)) {
      pushPass(results, 'Honest non-production/backend-blocked language remains visible');
    } else {
      pushFail(results, 'Required honest non-production/backend-blocked language missing');
    }

    if (page.url().includes('/ui-staging')) pushPass(results, 'Final URL remained under /ui-staging');
    else pushFail(results, `Final URL escaped staging: ${page.url()}`);
  } catch (e) {
    pushFail(results, `Fatal: ${e.message}`);
  } finally {
    await browser.close();
    fs.writeFileSync(RESULT_PATH, JSON.stringify(results, null, 2));
    console.log('Phase 5A-C QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
    if (results.failed.length) {
      console.log(results.failed.join('\n'));
      process.exitCode = 1;
    }
  }

  return results;
}

run();
