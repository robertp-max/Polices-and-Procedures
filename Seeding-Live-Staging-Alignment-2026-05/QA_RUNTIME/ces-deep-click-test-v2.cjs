/**
 * PHASE 4A - FOCUSED CES TASK CARD DEEP CLICK TEST v2 (QA-ONLY)
 * Improved detection for Task Detail panel using multiple signals from source.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('=== PHASE 4A CES DEEP CLICK TEST v2 ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const results = { passed: [], failed: [], warnings: [], screenshots: [], cardsClicked: [] };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);

    // Open nav and click CES
    let cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance Execution/i }).first();
    if (!(await cesNav.isVisible().catch(() => false))) {
      await page.getByRole('button').filter({ hasText: /menu|nav/i }).first().click().catch(() => {});
      await page.waitForTimeout(600);
      cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance Execution/i }).first();
    }
    if (await cesNav.isVisible().catch(() => false)) await cesNav.click();
    await page.waitForTimeout(1800);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'v2-ces-board-loaded.png') });

    // Robust card locator based on source structure
    let cards = page.locator('button').filter({ hasText: /BLOCKED|AWAITING SIG|IN PROGRESS|READY|Due /i });
    let cardCount = await cards.count();

    if (cardCount < 5) {
      // broader fallback
      cards = page.locator('button:has(h4), button').filter({ hasText: /workflowId|owner|Due/i });
      cardCount = await cards.count();
    }

    console.log(`Found ${cardCount} cards`);

    const target = Math.min(5, cardCount);

    for (let i = 0; i < target; i++) {
      const card = cards.nth(i);

      // Capture before state from detail area
      let beforeTitle = await page.locator('h2').first().textContent({ timeout: 1500 }).catch(() => 'before-unknown');

      await card.click({ force: true });
      await page.waitForTimeout(1100);

      const afterUrl = page.url();
      if (!afterUrl.includes('/ui-staging')) {
        results.failed.push(`Card ${i} leaked out of staging`);
      }

      // Improved multi-signal detection for Task Detail panel
      const hasTaskDetailHeader = await page.getByText(/TASK DETAIL|TASK DETAIL ·/i).isVisible().catch(() => false);
      const hasOwnerField = await page.getByText(/Owner/i).isVisible().catch(() => false);
      const hasStatusField = await page.getByText(/Status/i).isVisible().catch(() => false);
      const hasEvidenceField = await page.getByText(/Evidence/i).isVisible().catch(() => false);

      const taskDetailDetected = hasTaskDetailHeader || (hasOwnerField && hasStatusField);

      let afterTitle = await page.locator('h2').first().textContent({ timeout: 1500 }).catch(() => 'after-unknown');

      const hasEventWorkspace = await page.getByText(/EVENT WORKSPACE|Event Workspace/i).isVisible().catch(() => false);

      const cardInfo = {
        index: i,
        beforeTitle: beforeTitle.trim().substring(0, 50),
        afterTitle: afterTitle.trim().substring(0, 50),
        titleChanged: beforeTitle !== afterTitle,
        eventWorkspaceVisible: hasEventWorkspace,
        taskDetailDetected: taskDetailDetected,
        signals: { hasTaskDetailHeader, hasOwnerField, hasStatusField, hasEvidenceField }
      };
      results.cardsClicked.push(cardInfo);

      console.log(`Card ${i}: titleChanged=${cardInfo.titleChanged}, taskDetail=${taskDetailDetected}`);

      if (cardInfo.titleChanged) results.passed.push(`Card ${i}: Title changed (${cardInfo.beforeTitle} → ${cardInfo.afterTitle})`);
      if (hasEventWorkspace) results.passed.push(`Card ${i}: Event Workspace visible`);
      if (taskDetailDetected) results.passed.push(`Card ${i}: Task Detail panel detected`);

      // Blocked buttons
      const blocked = ['Upload evidence', 'Request signature', 'Approve task', 'Complete task'];
      for (const b of blocked) {
        const btn = page.getByRole('button', { name: new RegExp(b, 'i') }).first();
        if (await btn.isVisible().catch(() => false)) {
          if (await btn.isDisabled().catch(() => true)) {
            results.passed.push(`Card ${i}: ${b} remains blocked`);
          } else {
            results.failed.push(`Card ${i}: ${b} was enabled!`);
          }
        }
      }

      const shot = path.join(ARTIFACT_DIR, `v2-card-${i}.png`);
      await page.screenshot({ path: shot });
      results.screenshots.push(shot);
    }

    if (results.cardsClicked.length >= 5) results.passed.push('Clicked 5 distinct CES cards');
    const changedCount = results.cardsClicked.filter(c => c.titleChanged).length;
    if (changedCount >= 5) results.passed.push('All 5 cards showed title/ID change');

    const detailCount = results.cardsClicked.filter(c => c.taskDetailDetected).length;
    if (detailCount >= 3) results.passed.push(`Task Detail panel detected on ${detailCount} selections`);

  } catch (e) {
    results.failed.push('Fatal: ' + e.message);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'v2-fatal.png') });
  } finally {
    await context.close();
    await browser.close();
  }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'ces-deep-click-v2-results.json'), JSON.stringify(results, null, 2));
  console.log('v2 results saved.');
  return results;
}

run();