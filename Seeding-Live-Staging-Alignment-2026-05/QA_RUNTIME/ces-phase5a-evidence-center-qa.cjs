/**
 * PHASE 5A-A QA - V3 EVIDENCE CENTER READ / VIEWER PARITY
 *
 * Proves Evidence Center primary clicks stay in V3, metadata details update,
 * unsupported artifact workflows stay blocked, and Phase 5A-A does not claim
 * backend evidence certification or level 5 completion.
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

function unsupportedLanguageRegex() {
  const parts = [
    ['secure audit', 'APIs'].join(' '),
    ['stored', 'cryptographically'].join(' '),
    ['SECURE', '&', 'VERIFIED'].join(' '),
    ['production evidence', 'certified'].join(' '),
    ['level 5', 'complete'].join(' '),
  ];
  return new RegExp(parts.join('|'), 'i');
}

async function run() {
  console.log('=== PHASE 5A-A V3 EVIDENCE CENTER QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    passed: [],
    failed: [],
    rowsClicked: [],
    screenshots: [],
  };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    await clickEvidenceNav(page);

    if (page.url().includes('/ui-staging')) results.passed.push('URL remained under /ui-staging after Evidence Center navigation');
    else results.failed.push(`URL escaped staging after navigation: ${page.url()}`);

    const center = page.locator('[data-qa="v3-evidence-center"]');
    if (await center.isVisible().catch(() => false)) {
      const sourceMode = await center.getAttribute('data-qa-evidence-source-mode');
      results.passed.push(`Evidence Center workspace visible with source mode ${sourceMode}`);
    } else {
      results.failed.push('Missing data-qa="v3-evidence-center" workspace');
      return results;
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5a-evidence-center.png'), fullPage: true });
    results.screenshots.push('phase5a-evidence-center.png');

    const rows = page.locator('[data-qa="v3-evidence-row"]');
    const rowCount = await rows.count();
    const emptyState = page.getByText(/No evidence metadata available/i);
    if (rowCount > 0) {
      results.passed.push(`Evidence rows available: ${rowCount}`);
    } else if (await emptyState.isVisible().catch(() => false)) {
      results.passed.push('Honest empty state visible when no evidence rows are available');
    } else {
      results.failed.push('No evidence rows and no honest empty state found');
      return results;
    }

    const clickTarget = Math.min(3, rowCount);
    for (let i = 0; i < clickTarget; i++) {
      const row = rows.nth(i);
      const evidenceId = await row.getAttribute('data-qa-evidence-id');
      const eventId = await row.getAttribute('data-qa-event-id');
      const taskId = await row.getAttribute('data-qa-task-id');
      const beforeUrl = page.url();
      await row.click();
      await page.waitForTimeout(400);
      const afterUrl = page.url();

      const detail = page.locator('[data-qa="v3-evidence-detail"]');
      const selectedId = await detail.getAttribute('data-qa-selected-evidence-id').catch(() => null);
      const artifactMode = await detail.getAttribute('data-qa-artifact-mode').catch(() => null);

      results.rowsClicked.push({ index: i, evidenceId, eventId, taskId, selectedId, artifactMode });

      if (selectedId === evidenceId) results.passed.push(`Row ${i}: detail selected evidence ID matched`);
      else results.failed.push(`Row ${i}: selected evidence mismatch clicked=${evidenceId} selected=${selectedId}`);

      if (['real-artifact', 'metadata-placeholder', 'seeded-preview', 'missing'].includes(artifactMode || '')) {
        results.passed.push(`Row ${i}: artifact mode is valid (${artifactMode})`);
      } else {
        results.failed.push(`Row ${i}: invalid artifact mode ${artifactMode}`);
      }

      if (afterUrl === beforeUrl && afterUrl.includes('/ui-staging')) {
        results.passed.push(`Row ${i}: primary click stayed in V3`);
      } else {
        results.failed.push(`Row ${i}: primary click changed URL from ${beforeUrl} to ${afterUrl}`);
      }
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5a-evidence-detail.png'), fullPage: true });
    results.screenshots.push('phase5a-evidence-detail.png');

    const blockedActions = ['upload-evidence', 'download-artifact', 'validate-evidence', 'promote-evidence', 'certify-evidence'];
    for (const action of blockedActions) {
      const blocked = page.locator(`[data-qa="v3-evidence-blocked-action"][data-qa-action="${action}"]`).first();
      if (await blocked.isVisible().catch(() => false)) {
        results.passed.push(`Blocked action visible: ${action}`);
      } else {
        results.failed.push(`Blocked action missing: ${action}`);
      }
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase5a-evidence-blockers.png'), fullPage: true });
    results.screenshots.push('phase5a-evidence-blockers.png');

    const integrityStatus = page.locator('[data-qa="v3-evidence-integrity-status"]');
    const integrityMode = await integrityStatus.getAttribute('data-qa-integrity-mode').catch(() => null);
    if (['not-verified', 'local-metadata', 'backend-verified', 'not-wired'].includes(integrityMode || '')) {
      results.passed.push(`Honest integrity status visible: ${integrityMode}`);
    } else {
      results.failed.push(`Missing or invalid integrity mode: ${integrityMode}`);
    }

    const pageText = await page.locator('body').innerText();
    if (!unsupportedLanguageRegex().test(pageText)) {
      results.passed.push('Unsupported evidence/security/level-5 wording absent from visible V3 surface');
    } else {
      results.failed.push('Unsupported evidence/security/level-5 wording appears in visible V3 surface');
    }

    if (/Backend persistence not implemented/i.test(pageText)
      && /Artifact integrity not verified in V3/i.test(pageText)
      && /not production evidence certification/i.test(pageText)) {
      results.passed.push('Honest backend/integrity/certification language visible');
    } else {
      results.failed.push('Required honest backend/integrity/certification wording missing');
    }

    const liveButtons = page.getByRole('button', { name: /Open live route/i });
    if ((await liveButtons.count()) > 0) results.passed.push('Live route access exists as explicit secondary button');
    else results.failed.push('No secondary Open live route access found');

    if (page.url().includes('/ui-staging')) results.passed.push('Final URL remained under /ui-staging');
    else results.failed.push(`Final URL escaped staging: ${page.url()}`);
  } catch (e) {
    results.failed.push(`Fatal: ${e.message}`);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase5a-evidence-center-results.json'), JSON.stringify(results, null, 2));
    console.log('Phase 5A-A QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
    if (results.failed.length) {
      console.log(results.failed.join('\n'));
      process.exitCode = 1;
    }
  }

  return results;
}

run();
