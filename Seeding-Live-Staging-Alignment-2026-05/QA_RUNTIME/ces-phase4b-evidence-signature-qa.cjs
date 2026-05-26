/**
 * PHASE 4B QA - CES EVIDENCE / SIGNATURE / APPROVAL LOCAL PREVIEW
 *
 * Proves Phase 4A data-qa selectors remain usable and Phase 4B interactions
 * are local preview only with durable completion still blocked.
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

async function run() {
  console.log('=== PHASE 4B CES EVIDENCE / SIGNATURE / APPROVAL QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    passed: [],
    failed: [],
    cardsClicked: [],
    localActions: [],
    screenshots: [],
  };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);
    await clickCesNav(page);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4b-ces-board.png'), fullPage: true });
    results.screenshots.push('phase4b-ces-board.png');

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

      const url = page.url();
      if (url.includes('/ui-staging')) {
        results.passed.push(`Card ${i}: URL remained under /ui-staging`);
      } else {
        results.failed.push(`Card ${i}: URL escaped staging: ${url}`);
      }

      const taskDetail = page.locator('[data-qa="ces-task-detail-panel"]');
      const selectedId = await taskDetail.getAttribute('data-qa-selected-task-id').catch(() => null);
      const evidencePanel = page.locator(`[data-qa="ces-evidence-panel"][data-qa-evidence-task-id="${cardTaskId}"]`);
      const signaturePanel = page.locator(`[data-qa="ces-signature-approval-panel"][data-qa-signature-task-id="${cardTaskId}"]`);
      const completeTask = page.locator('[data-qa="blocked-production-action"][data-qa-action="complete-task"]');

      const cardInfo = {
        index: i,
        clickedId: cardTaskId,
        clickedTitle: cardTaskTitle,
        selectedIdInDetail: selectedId,
        evidencePanelVisible: await evidencePanel.isVisible().catch(() => false),
        signaturePanelVisible: await signaturePanel.isVisible().catch(() => false),
        completeTaskDisabled: await completeTask.isDisabled().catch(() => false),
      };
      results.cardsClicked.push(cardInfo);

      if (selectedId === cardTaskId) results.passed.push(`Card ${i}: selected task ID matched clicked card`);
      else results.failed.push(`Card ${i}: selected task mismatch clicked=${cardTaskId} selected=${selectedId}`);

      if (cardInfo.evidencePanelVisible) results.passed.push(`Card ${i}: Evidence panel visible`);
      else results.failed.push(`Card ${i}: Evidence panel missing`);

      if (cardInfo.signaturePanelVisible) results.passed.push(`Card ${i}: Signature/approval panel visible`);
      else results.failed.push(`Card ${i}: Signature/approval panel missing`);

      if (cardInfo.completeTaskDisabled) results.passed.push(`Card ${i}: Complete task remains disabled`);
      else results.failed.push(`Card ${i}: Complete task is not disabled`);
    }

    const firstCard = cards.nth(0);
    await firstCard.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4b-evidence-panel.png'), fullPage: true });
    results.screenshots.push('phase4b-evidence-panel.png');

    const evidenceActions = [
      'view-evidence',
      'attach-preview-evidence',
      'mark-preview-evidence-ready',
      'add-evidence-blocker',
      'clear-evidence-blocker',
    ];
    for (const action of evidenceActions) {
      const locator = page.locator(`[data-qa="ces-evidence-action"][data-qa-action="${action}"]`).first();
      if (!(await locator.isVisible().catch(() => false))) {
        results.failed.push(`Evidence action missing: ${action}`);
        continue;
      }
      await locator.click();
      await page.waitForTimeout(250);
      results.localActions.push(action);
      results.passed.push(`Evidence action clicked: ${action}`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4b-signature-panel.png'), fullPage: true });
    results.screenshots.push('phase4b-signature-panel.png');

    const signatureActions = [
      'prepare-signature-request',
      'acknowledge-preview-signature',
      'prepare-approval-request',
      'acknowledge-preview-approval',
      'add-signature-blocker',
      'clear-signature-blocker',
    ];
    for (const action of signatureActions) {
      const locator = page.locator(`[data-qa="ces-signature-action"][data-qa-action="${action}"]`).first();
      if (!(await locator.isVisible().catch(() => false))) {
        results.failed.push(`Signature/approval action missing: ${action}`);
        continue;
      }
      await locator.click();
      await page.waitForTimeout(250);
      results.localActions.push(action);
      results.passed.push(`Signature/approval action clicked: ${action}`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'phase4b-local-actions.png'), fullPage: true });
    results.screenshots.push('phase4b-local-actions.png');

    const pageText = await page.locator('body').innerText();
    const readinessText = await page.locator('[data-qa="ces-readiness-state"]').innerText().catch(() => '');
    const historyText = await page.locator('[data-qa="ces-local-preview-history"]').innerText().catch(() => '');

    if (/Local preview only|not durable|durable .* remains Phase 4C/i.test(pageText)) {
      results.passed.push('Local preview / not durable language is visible');
    } else {
      results.failed.push('Local preview / not durable language was not visible');
    }

    if (/Evidence ready in local preview; durable validation remains Phase 4C/i.test(readinessText)) {
      results.passed.push('Evidence readiness language present');
    } else {
      results.failed.push('Evidence readiness language missing after local evidence actions');
    }

    if (/Signature acknowledged in local preview; durable signature collection remains Phase 4C/i.test(readinessText)) {
      results.passed.push('Signature readiness language present');
    } else {
      results.failed.push('Signature readiness language missing after local signature action');
    }

    if (/Approval acknowledged in local preview; durable approval mutation remains Phase 4C/i.test(readinessText)) {
      results.passed.push('Approval readiness language present');
    } else {
      results.failed.push('Approval readiness language missing after local approval action');
    }

    if (/Local preview session history/i.test(historyText) && /not durable audit record/i.test(historyText)) {
      results.passed.push('Local preview history is clearly labeled non-durable');
    } else {
      results.failed.push('Local preview history label missing');
    }

    const completeTask = page.locator('[data-qa="blocked-production-action"][data-qa-action="complete-task"]');
    if ((await completeTask.count()) > 0 && await completeTask.first().isDisabled()) {
      results.passed.push('Durable completion remains blocked');
    } else {
      results.failed.push('Durable completion was not blocked');
    }

    const level5Allowlist = /not level\s*5|no v3 surface is level\s*5|no level\s*5 claim/gi;
    const overclaimText = pageText.replace(level5Allowlist, '');
    const forbiddenLanguage = /level\s*5\s+(?:complete|production|production-shaped complete)|production-shaped complete|production complete|durable completion enabled|certified complete/i;
    if (!forbiddenLanguage.test(overclaimText)) {
      results.passed.push('No level 5 / production-shaped complete language appears');
    } else {
      results.failed.push('Forbidden level 5 / production completion language appears');
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
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'phase4b-evidence-signature-results.json'), JSON.stringify(results, null, 2));
    console.log('Phase 4B QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
  }

  return results;
}

run();
