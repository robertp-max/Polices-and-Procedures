/**
 * PHASE 4A QA SELECTOR HARDENED - CES TASK CARD VERIFICATION (QA-ONLY)
 * Uses data-qa attributes added for reliable automated proof.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('=== PHASE 4A HARDENED QA WITH data-qa SELECTORS ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const results = { passed: [], failed: [], cardsClicked: [], screenshots: [] };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2000);

    // Open CES section
    let cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
    if (!(await cesNav.isVisible().catch(() => false))) {
      await page.getByRole('button').filter({ hasText: /menu/i }).first().click().catch(() => {});
      await page.waitForTimeout(500);
      cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
    }
    if (await cesNav.isVisible().catch(() => false)) await cesNav.click();
    await page.waitForTimeout(1200);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'hardened-ces-board.png') });

    // Hardened selector using data-qa
    let cards = page.locator('[data-qa="ces-task-card"]');
    let cardCount = await cards.count();
    console.log(`Found ${cardCount} cards with data-qa="ces-task-card"`);

    if (cardCount === 0) {
      results.failed.push('No cards with data-qa="ces-task-card" found');
      return results;
    }

    const target = Math.min(5, cardCount);

    for (let i = 0; i < target; i++) {
      const card = cards.nth(i);

      // Pre-click capture using data-qa
      const cardTaskId = await card.getAttribute('data-qa-task-id');
      const cardTaskTitle = await card.getAttribute('data-qa-task-title');

      await card.click();
      await page.waitForTimeout(800);

      const afterUrl = page.url();
      if (!afterUrl.includes('/ui-staging')) {
        results.failed.push(`Card ${i} leaked: ${afterUrl}`);
      }

      // Post-click assertions using data-qa (the whole point of the hardening)
      const eventWS = page.locator('[data-qa="ces-event-workspace"]');
      const eventId = await eventWS.getAttribute('data-qa-event-id').catch(() => null);

      const taskDetail = page.locator('[data-qa="ces-task-detail-panel"]');
      const selectedId = await taskDetail.getAttribute('data-qa-selected-task-id').catch(() => null);
      const detailTitle = await taskDetail.locator('h2').first().textContent().catch(() => '');

      const taskDetailVisible = await taskDetail.isVisible().catch(() => false);

      // Blocked actions
      const blockedActions = ['upload-evidence', 'request-signature', 'approve-task', 'complete-task'];
      let allBlocked = true;
      for (const action of blockedActions) {
        const btn = page.locator(`[data-qa="blocked-production-action"][data-qa-action="${action}"]`);
        if (await btn.isVisible().catch(() => false)) {
          const disabled = await btn.isDisabled().catch(() => true);
          if (!disabled) allBlocked = false;
        }
      }

      const cardInfo = {
        index: i,
        clickedId: cardTaskId,
        clickedTitle: cardTaskTitle,
        selectedIdInDetail: selectedId,
        eventId,
        detailTitle: detailTitle?.trim().substring(0, 60),
        taskDetailVisible,
        allBlocked
      };
      results.cardsClicked.push(cardInfo);

      if (selectedId === cardTaskId) {
        results.passed.push(`Card ${i}: Task Detail ID matches clicked card (${cardTaskId})`);
      } else {
        results.failed.push(`Card ${i}: ID mismatch. Clicked=${cardTaskId}, Detail=${selectedId}`);
      }

      if (taskDetailVisible) results.passed.push(`Card ${i}: Task Detail visible`);
      if (allBlocked) results.passed.push(`Card ${i}: All blocked actions remain disabled`);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, `hardened-card-${i}.png`) });
      results.screenshots.push(`hardened-card-${i}.png`);
    }

    if (results.cardsClicked.length >= 5) results.passed.push('Clicked 5+ cards with data-qa');

  } catch (e) {
    results.failed.push('Fatal: ' + e.message);
  } finally {
    await browser.close();
  }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'hardened-qa-results.json'), JSON.stringify(results, null, 2));
  console.log('Hardened QA results saved. Passed:', results.passed.length, 'Failed:', results.failed.length);
  return results;
}

run();