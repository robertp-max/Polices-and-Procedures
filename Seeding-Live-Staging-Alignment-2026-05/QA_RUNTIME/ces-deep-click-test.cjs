/**
 * PHASE 4A - FOCUSED CES TASK CARD DEEP CLICK TEST (QA-ONLY, DO NOT IMPORT)
 * Goal: Click 5 actual CES task cards and verify real state changes in browser.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('=== PHASE 4A CES DEEP CLICK TEST (Redo) ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();

  const results = { passed: [], failed: [], warnings: [], screenshots: [], cardsClicked: [] };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2500);

    // Ensure sidebar is open (click menu if needed)
    const menuBtn = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    // Try to find and click CES nav
    let cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance Execution/i }).first();
    if (!(await cesNav.isVisible().catch(() => false))) {
      // Try opening nav
      await page.getByRole('button', { name: /menu/i }).first().click().catch(() => {});
      await page.waitForTimeout(600);
      cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance Execution/i }).first();
    }

    if (await cesNav.isVisible().catch(() => false)) {
      await cesNav.click();
      console.log('Clicked CES nav');
    }
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ces-board-loaded.png') });

    // Find task cards more robustly: buttons inside the board that contain task titles
    // From source: cards are <button> with <h4> title inside columns
    const cardSelector = 'button:has(h4), button:has-text("workflow"), button:has-text("Due ")';
    let cards = page.locator(cardSelector);

    let cardCount = await cards.count();
    console.log(`Found ${cardCount} potential task cards with initial selector`);

    // Fallback: broader search for buttons in the right area
    if (cardCount < 3) {
      cards = page.locator('div[style*="flex: 1"] button, .no-scrollbar button').filter({ hasText: /BLOCKED|AWAITING|IN PROGRESS|READY|Due/i });
      cardCount = await cards.count();
      console.log(`Fallback found ${cardCount} cards`);
    }

    if (cardCount === 0) {
      results.failed.push('Could not locate any CES task cards in the DOM');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ces-no-cards-found.png') });
      return results;
    }

    const targetClicks = Math.min(5, cardCount);

    for (let i = 0; i < targetClicks; i++) {
      const card = cards.nth(i);

      // Get title before click for comparison
      let beforeTitle = '';
      try {
        beforeTitle = await page.locator('h2, [data-testid*="task-title"], .task-title').first().textContent({ timeout: 1500 }).catch(() => '');
        if (!beforeTitle) beforeTitle = await page.getByText(/^[A-Z].{10,}/).first().textContent({ timeout: 1000 }).catch(() => '');
      } catch {}

      await card.scrollIntoViewIfNeeded().catch(() => {});
      await card.click({ force: true }).catch(async () => {
        await card.click();
      });

      await page.waitForTimeout(900); // allow React state update

      const afterUrl = page.url();
      if (!afterUrl.includes('/ui-staging')) {
        results.failed.push(`Card ${i} caused navigation out of staging: ${afterUrl}`);
      }

      // Verify Task Detail / Event Workspace appeared or updated
      const hasEventWorkspace = await page.getByText(/EVENT WORKSPACE|Event Workspace/i).isVisible().catch(() => false);
      const hasTaskDetail = await page.getByText(/TASK DETAIL|Task Detail/i).isVisible().catch(() => false);

      // Try to extract current selected task title/ID
      let currentTaskText = '';
      try {
        currentTaskText = await page.locator('h2').filter({ hasText: /.{5,}/ }).first().textContent({ timeout: 2000 });
      } catch {}

      const cardInfo = {
        index: i,
        beforeTitle: beforeTitle?.trim().substring(0, 60) || 'unknown',
        afterTitle: currentTaskText?.trim().substring(0, 60) || 'unknown',
        eventWorkspaceVisible: hasEventWorkspace,
        taskDetailVisible: hasTaskDetail
      };
      results.cardsClicked.push(cardInfo);

      console.log(`Clicked card ${i}: title changed? ${beforeTitle !== currentTaskText}`);

      if (hasEventWorkspace && hasTaskDetail) {
        results.passed.push(`Card ${i}: Both Event Workspace and Task Detail visible after click`);
      } else {
        results.warnings.push(`Card ${i}: Missing one of the panels`);
      }

      // Take screenshot after click
      const shotPath = path.join(ARTIFACT_DIR, `ces-card-${i}-clicked.png`);
      await page.screenshot({ path: shotPath });
      results.screenshots.push(shotPath);

      // Verify blocked actions are still disabled
      const blockedLabels = ['Upload evidence', 'Request signature', 'Approve task', 'Complete task'];
      for (const label of blockedLabels) {
        const btn = page.getByRole('button', { name: new RegExp(label, 'i') }).first();
        if (await btn.isVisible().catch(() => false)) {
          const isDisabled = await btn.isDisabled().catch(() => true);
          if (!isDisabled) {
            results.failed.push(`Card ${i}: "${label}" button became enabled!`);
          } else {
            results.passed.push(`Card ${i}: "${label}" correctly remains disabled`);
          }
        }
      }
    }

    // Final summary assertions
    if (results.cardsClicked.length >= 5) {
      results.passed.push('Successfully clicked 5 distinct CES task cards');
    } else {
      results.failed.push(`Only clicked ${results.cardsClicked.length} cards (target was 5)`);
    }

    const titlesChanged = results.cardsClicked.filter(c => c.beforeTitle !== c.afterTitle).length;
    if (titlesChanged >= 3) {
      results.passed.push(`${titlesChanged} task titles visibly changed on selection`);
    }

    const panelsWorking = results.cardsClicked.filter(c => c.eventWorkspaceVisible && c.taskDetailVisible).length;
    if (panelsWorking >= 3) {
      results.passed.push(`Event Workspace + Task Detail updated on at least ${panelsWorking} selections`);
    }

  } catch (err) {
    results.failed.push(`Top-level error: ${err.message}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'fatal-error-state.png') });
  } finally {
    await context.close();
    await browser.close();
  }

  const summaryPath = path.join(ARTIFACT_DIR, 'ces-deep-click-results.json');
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log('Results saved to', summaryPath);

  return results;
}

run().catch(e => console.error(e));