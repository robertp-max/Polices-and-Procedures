/**
 * PHASE 4C-A QA - CES DURABLE EXECUTION ADAPTER
 *
 * Proves Phase 4A/4B selectors still work and Phase 4C-A writes only to the
 * existing local persisted app-store adapter. Backend/AWS persistence remains blocked.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function clickCesNav(page) {
  let cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
  if (!(await cesNav.isVisible().catch(() => false))) {
    await page.getByRole('button').filter({ hasText: /menu/i }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
  }
  if (await cesNav.isVisible().catch(() => false)) {
    await cesNav.click();
    await page.waitForTimeout(1000);
  }
}

async function clickIfVisible(page, selector, results, label) {
  const locator = page.locator(selector).first();
  if (!(await locator.isVisible().catch(() => false))) {
    results.failed.push(`Missing durable action: ${label}`);
    return false;
  }
  if (await locator.isDisabled().catch(() => false)) {
    results.passed.push(`Durable action remains disabled as expected: ${label}`);
    return false;
  }
  await locator.click();
  await page.waitForTimeout(400);
  results.durableActions.push(label);
  results.passed.push(`Durable action clicked: ${label}`);
  return true;
}

async function run() {
  console.log('=== PHASE 4C-A CES DURABLE ADAPTER QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    passed: [],
    failed: [],
    cardsClicked: [],
    durableActions: [],
    persistenceChecks: [],
    screenshots: [],
  };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate(() => localStorage.removeItem('reg-execution-v2')).catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    await clickCesNav(page);

    const cards = page.locator('[data-qa="ces-task-card"]');
    const cardCount = await cards.count();
    if (cardCount < 5) {
      results.failed.push(`Expected at least 5 CES task cards, found ${cardCount}`);
      return results;
    }

    for (let i = 0; i < 5; i++) {
      const card = cards.nth(i);
      const cardTaskId = await card.getAttribute('data-qa-task-id');
      const cardTaskTitle = await card.getAttribute('data-qa-task-title');
      await card.click();
      await page.waitForTimeout(500);

      const taskDetail = page.locator('[data-qa="ces-task-detail-panel"]');
      const selectedId = await taskDetail.getAttribute('data-qa-selected-task-id').catch(() => null);
      const evidencePanel = page.locator(`[data-qa="ces-evidence-panel"][data-qa-evidence-task-id="${cardTaskId}"]`);
      const signaturePanel = page.locator(`[data-qa="ces-signature-approval-panel"][data-qa-signature-task-id="${cardTaskId}"]`);
      const adapterStatus = page.locator('[data-qa="ces-durable-adapter-status"]');
      const completionGate = page.locator('[data-qa="ces-completion-gate"]');

      const mode = await adapterStatus.getAttribute('data-qa-persistence-mode').catch(() => null);
      const ready = await completionGate.getAttribute('data-qa-completion-ready').catch(() => null);
      const row = {
        index: i,
        clickedId: cardTaskId,
        clickedTitle: cardTaskTitle,
        selectedIdInDetail: selectedId,
        persistenceMode: mode,
        completionReady: ready,
        evidencePanelVisible: await evidencePanel.isVisible().catch(() => false),
        signaturePanelVisible: await signaturePanel.isVisible().catch(() => false),
        adapterStatusVisible: await adapterStatus.isVisible().catch(() => false),
      };
      results.cardsClicked.push(row);

      if (selectedId === cardTaskId) results.passed.push(`Card ${i}: selected task ID matched clicked card`);
      else results.failed.push(`Card ${i}: selected task mismatch clicked=${cardTaskId} selected=${selectedId}`);

      if (row.evidencePanelVisible) results.passed.push(`Card ${i}: Phase 4B evidence panel still exists`);
      else results.failed.push(`Card ${i}: Phase 4B evidence panel missing`);

      if (row.signaturePanelVisible) results.passed.push(`Card ${i}: Phase 4B signature/approval panel still exists`);
      else results.failed.push(`Card ${i}: Phase 4B signature/approval panel missing`);

      if (row.adapterStatusVisible && mode === 'local-store') results.passed.push(`Card ${i}: durable adapter status local-store visible`);
      else results.failed.push(`Card ${i}: durable adapter status missing or wrong mode: ${mode}`);

      if (ready === 'false' || ready === 'true') results.passed.push(`Card ${i}: deterministic completion gate exposed`);
      else results.failed.push(`Card ${i}: completion gate missing readiness attribute`);

      if (page.url().includes('/ui-staging')) results.passed.push(`Card ${i}: URL remained under /ui-staging`);
      else results.failed.push(`Card ${i}: URL escaped staging: ${page.url()}`);
    }

    await cards.nth(0).click();
    await page.waitForTimeout(500);
    const firstTaskId = await cards.nth(0).getAttribute('data-qa-task-id');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4c-durable-status.png'), fullPage: true });
    results.screenshots.push('phase4c-durable-status.png');

    const durableActions = [
      'persist-viewed',
      'persist-started',
      'persist-note',
      'persist-blocker',
      'clear-persisted-blocker',
      'persist-evidence-placeholder',
      'request-approval',
    ];
    for (const action of durableActions) {
      await clickIfVisible(page, `[data-qa="ces-durable-action"][data-qa-action="${action}"]`, results, action);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4c-durable-actions.png'), fullPage: true });
    results.screenshots.push('phase4c-durable-actions.png');

    const secondCard = cards.nth(1);
    await secondCard.click();
    await page.waitForTimeout(400);
    await cards.nth(0).click();
    await page.waitForTimeout(700);

    const returnedSelectedId = await page.locator('[data-qa="ces-task-detail-panel"]').getAttribute('data-qa-selected-task-id').catch(() => null);
    const returnedStatusText = await page.locator('[data-qa="ces-durable-adapter-status"]').innerText().catch(() => '');
    const returnedAuditMode = await page.locator('[data-qa="ces-audit-history-status"]').getAttribute('data-qa-audit-mode').catch(() => null);
    const persisted = /Adapter IDs.+TASK-|Persisted.+in_progress|evidence refs [1-9]|approval requests [1-9]/is.test(returnedStatusText);
    results.persistenceChecks.push({ firstTaskId, returnedSelectedId, returnedAuditMode, returnedStatusText });

    if (returnedSelectedId === firstTaskId && persisted) {
      results.passed.push('Persisted adapter state survived task switch and return');
    } else {
      results.failed.push('Persisted adapter state did not survive task switch and return');
    }

    if (returnedAuditMode === 'app-store') results.passed.push('Audit/history status reports app-store after durable action');
    else results.failed.push(`Audit/history mode expected app-store, found ${returnedAuditMode}`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4c-completion-gate.png'), fullPage: true });
    results.screenshots.push('phase4c-completion-gate.png');

    const blockerCount = await page.locator('[data-qa="ces-durable-blocker"]').count();
    const blockedUpload = page.locator('[data-qa="blocked-production-action"][data-qa-action="upload-evidence"]');
    const blockedSignature = page.locator('[data-qa="blocked-production-action"][data-qa-action="request-signature"]');
    const blockedApproval = page.locator('[data-qa="blocked-production-action"][data-qa-action="approve-task"]');
    const blockedComplete = page.locator('[data-qa="blocked-production-action"][data-qa-action="complete-task"]');

    if (blockerCount > 0) results.passed.push(`Durable blockers visible: ${blockerCount}`);
    else results.failed.push('No durable blockers visible');

    if (await blockedUpload.isDisabled().catch(() => false)) results.passed.push('Backend evidence upload remains blocked');
    else results.failed.push('Backend evidence upload was not blocked');

    if (await blockedSignature.isDisabled().catch(() => false)) results.passed.push('Durable/legal signature remains blocked');
    else results.failed.push('Durable/legal signature was not blocked');

    if (await blockedApproval.isDisabled().catch(() => false)) results.passed.push('Approval decision remains blocked');
    else results.failed.push('Approval decision was not blocked');

    if ((await blockedComplete.count()) === 0 || await blockedComplete.first().isDisabled().catch(() => false)) {
      results.passed.push('Completion remains blocked unless deterministic gate passes');
    } else {
      results.failed.push('Completion block/gate was not deterministic');
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4c-blockers.png'), fullPage: true });
    results.screenshots.push('phase4c-blockers.png');

    const pageText = await page.locator('body').innerText();
    if (/durable app-store adapter/i.test(pageText)
      && /local persisted store/i.test(pageText)
      && /backend persistence not implemented/i.test(pageText)
      && /AWS\/backend persistence remains Phase 4C-B/i.test(pageText)
      && /not level 5/i.test(pageText)) {
      results.passed.push('Honest adapter durability/backend/not-level-5 language visible');
    } else {
      results.failed.push('Required adapter durability/backend/not-level-5 language missing');
    }

    if (/BLOCKED_PENDING_PHASE_4C_B.+Backend evidence upload\/validation\/promote is not wired/i.test(pageText)) {
      results.passed.push('Backend evidence upload/validation/promote blocker visible');
    } else {
      results.failed.push('Backend evidence upload/validation/promote blocker missing');
    }

    if (/BLOCKED_PENDING_PHASE_4C_B.+Durable signature\/approval persistence is not wired/i.test(pageText)) {
      results.passed.push('Signature/approval persistence blocker visible');
    } else {
      results.failed.push('Signature/approval persistence blocker missing');
    }

    const forbiddenLanguage = /production-shaped complete|production complete|level\s*5 production|immutable audit is claimed|WORM evidence is claimed|certified complete/i;
    if (!forbiddenLanguage.test(pageText)) {
      results.passed.push('No level 5 / production completion / immutable audit claim appears');
    } else {
      results.failed.push('Forbidden completion/audit language appears');
    }

    if (page.url().includes('/ui-staging')) {
      results.passed.push('Final URL remained under /ui-staging');
    } else {
      results.failed.push(`Final URL escaped staging: ${page.url()}`);
    }
  } catch (e) {
    results.failed.push(`Fatal: ${e.message}`);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase4c-durable-adapter-results.json'), JSON.stringify(results, null, 2));
    console.log('Phase 4C-A QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
    if (results.failed.length) {
      console.log(results.failed.join('\n'));
      process.exitCode = 1;
    }
  }

  return results;
}

run();
