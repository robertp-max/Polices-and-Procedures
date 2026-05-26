/**
 * PHASE 5A-B QA - V3 EVIDENCE CENTER ARTIFACT VIEWER / LOCAL DOWNLOAD
 *
 * Proves artifact actions are truth-based: primary evidence row clicks stay
 * inside V3, metadata/seeded records do not expose fake downloads, and real
 * artifact routes/local downloads appear only when the current store exposes
 * usable artifact references or local demo bytes.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

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

function forbiddenLanguageRegex() {
  return /production persisted|immutable audit complete|legal signature complete|level 5 complete|certified evidence complete/i;
}

async function run() {
  console.log('=== PHASE 5A-B ARTIFACT VIEWER / DOWNLOAD QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    passed: [],
    failed: [],
    rowsClicked: [],
    fixtureSummary: {
      realRouteAvailable: false,
      realLocalArtifactAvailable: false,
      noRealLocalArtifactFixture: false,
    },
    screenshots: [],
  };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    await clickEvidenceNav(page);

    if (page.url().includes('/ui-staging')) results.passed.push('Evidence Center navigation stayed under /ui-staging');
    else results.failed.push(`Evidence Center navigation escaped staging: ${page.url()}`);

    const center = page.locator('[data-qa="v3-evidence-center"]');
    if (await center.isVisible().catch(() => false)) results.passed.push('V3 Evidence Center workspace exists');
    else {
      results.failed.push('Missing data-qa="v3-evidence-center"');
      return results;
    }

    const detail = page.locator('[data-qa="v3-evidence-detail"]');
    if (await detail.isVisible().catch(() => false)) results.passed.push('Evidence detail panel exists');
    else results.failed.push('Missing data-qa="v3-evidence-detail"');

    const rows = page.locator('[data-qa="v3-evidence-row"]');
    const rowCount = await rows.count();
    if (rowCount > 0) results.passed.push(`Evidence rows available: ${rowCount}`);
    else results.failed.push('No evidence rows available for artifact action checks');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5b-artifact-detail.png'), fullPage: true });
    results.screenshots.push('phase5b-artifact-detail.png');

    const clickLimit = Math.min(rowCount, 8);
    let blockedStateSeen = false;
    let routeButtonSeen = false;
    let localDownloadSeen = false;

    for (let i = 0; i < clickLimit; i++) {
      const row = rows.nth(i);
      const evidenceId = await row.getAttribute('data-qa-evidence-id');
      const beforeUrl = page.url();
      await row.click();
      await page.waitForTimeout(400);
      const afterUrl = page.url();

      const selectedId = await detail.getAttribute('data-qa-selected-evidence-id').catch(() => null);
      const artifactMode = await detail.getAttribute('data-qa-artifact-mode').catch(() => null);
      const actionState = await detail.getAttribute('data-qa-artifact-action-state').catch(() => null);
      const openButton = page.locator('[data-qa="v3-evidence-open-artifact"]').first();
      const downloadButton = page.locator('[data-qa="v3-evidence-download-artifact"]').first();
      const blocker = page.locator('[data-qa="v3-evidence-artifact-blocker"]').first();
      const hasOpen = await openButton.isVisible().catch(() => false);
      const hasDownload = await downloadButton.isVisible().catch(() => false);
      const downloadMode = hasDownload ? await downloadButton.getAttribute('data-qa-download-mode') : null;
      const route = hasOpen ? await openButton.getAttribute('data-qa-artifact-route') : null;

      results.rowsClicked.push({ index: i, evidenceId, selectedId, artifactMode, actionState, route, downloadMode });

      if (selectedId === evidenceId) results.passed.push(`Row ${i}: detail selected evidence ID matched`);
      else results.failed.push(`Row ${i}: selected evidence mismatch clicked=${evidenceId} selected=${selectedId}`);

      if (afterUrl === beforeUrl && afterUrl.includes('/ui-staging')) results.passed.push(`Row ${i}: primary row click stayed inside V3`);
      else results.failed.push(`Row ${i}: primary row click changed URL from ${beforeUrl} to ${afterUrl}`);

      if (actionState === 'real-local-artifact' || actionState === 'real-route-only') {
        if (hasOpen && route && route.startsWith('/artifacts/')) {
          routeButtonSeen = true;
          results.fixtureSummary.realRouteAvailable = true;
          results.passed.push(`Row ${i}: explicit artifact viewer route is available`);
        } else {
          results.failed.push(`Row ${i}: real artifact state missing explicit artifact route`);
        }
      }

      if (actionState === 'real-local-artifact') {
        if (hasDownload && downloadMode === 'local-bytes') {
          localDownloadSeen = true;
          results.fixtureSummary.realLocalArtifactAvailable = true;
          results.passed.push(`Row ${i}: local download button is available only for local bytes`);
        } else {
          results.failed.push(`Row ${i}: real-local-artifact missing local-bytes download`);
        }
      }

      if (actionState === 'metadata-placeholder' || actionState === 'seeded-preview' || actionState === 'missing') {
        blockedStateSeen = true;
        if (await blocker.isVisible().catch(() => false)) results.passed.push(`Row ${i}: blocked artifact state is labeled`);
        else results.failed.push(`Row ${i}: blocked artifact state missing artifact blocker`);
        if (!hasOpen) results.passed.push(`Row ${i}: blocked artifact state does not expose viewer route`);
        else results.failed.push(`Row ${i}: blocked artifact state exposes fake viewer route`);
        if (!hasDownload || downloadMode !== 'local-bytes') results.passed.push(`Row ${i}: blocked artifact state does not expose fake local download`);
        else results.failed.push(`Row ${i}: blocked artifact state exposes local-bytes download`);
      }
    }

    if (!localDownloadSeen) {
      results.fixtureSummary.noRealLocalArtifactFixture = true;
      results.passed.push('no real-local-artifact fixture available');
    }
    if (!routeButtonSeen) results.passed.push('No real artifact route fixture available; blocked-state assertions still passed');
    if (blockedStateSeen) results.passed.push('At least one metadata-only/seeded/missing record remained blocked');
    else results.failed.push('No blocked metadata/seeded/missing artifact state was observed');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5b-artifact-blocked.png'), fullPage: true });
    results.screenshots.push('phase5b-artifact-blocked.png');

    if (routeButtonSeen) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5b-artifact-route.png'), fullPage: true });
      results.screenshots.push('phase5b-artifact-route.png');
    }
    if (localDownloadSeen) {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5b-artifact-download.png'), fullPage: true });
      results.screenshots.push('phase5b-artifact-download.png');
    }

    const pageText = await page.locator('body').innerText();
    if (!forbiddenLanguageRegex().test(pageText)) results.passed.push('Forbidden production/level-5 completion wording absent');
    else results.failed.push('Forbidden production/level-5 completion wording appears');

    if (/Metadata is available, but no artifact file is available|Seed evidence metadata only|Artifact route available; local bytes may not survive refresh|Demo-local artifact available/i.test(pageText)) {
      results.passed.push('Honest artifact action wording is visible');
    } else {
      results.failed.push('Expected honest artifact action wording missing');
    }

    if (await page.locator('[data-qa="v3-evidence-integrity-status"]').isVisible().catch(() => false)) {
      results.passed.push('Existing Phase 5A-A integrity selector still exists');
    } else {
      results.failed.push('Existing Phase 5A-A integrity selector missing');
    }

    if (page.url().includes('/ui-staging')) results.passed.push('Final URL remained under /ui-staging');
    else results.failed.push(`Final URL escaped staging: ${page.url()}`);
  } catch (e) {
    results.failed.push(`Fatal: ${e.message}`);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase5b-artifact-viewer-download-results.json'), JSON.stringify(results, null, 2));
    console.log('Phase 5A-B QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
    if (results.failed.length) {
      console.log(results.failed.join('\n'));
      process.exitCode = 1;
    }
  }

  return results;
}

run();
