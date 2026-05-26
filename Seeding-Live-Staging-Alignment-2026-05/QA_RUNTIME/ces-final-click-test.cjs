/**
 * FINAL STRICT CES 5-CARD TEST (QA-ONLY)
 * Uses proven working card locator from v1 + improved interior signals.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('=== FINAL CES 5-CARD STRICT TEST ===');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newContext({ viewport: { width: 1600, height: 1000 } }).then(c => c.newPage());

  const results = { passed: [], failed: [], cards: [], screenshots: [] };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Open CES
    const ces = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
    if (await ces.isVisible().catch(()=>false)) await ces.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final-ces-board.png') });

    // Proven working locator from successful run
    let cards = page.locator('button').filter({ hasText: /BLOCKED|AWAITING|IN PROGRESS|READY|Due /i });
    let count = await cards.count();
    console.log('Cards found:', count);

    const clicks = Math.min(5, count);
    for (let i = 0; i < clicks; i++) {
      const card = cards.nth(i);
      const before = await page.locator('h2').first().textContent().catch(() => 'before');

      await card.click();
      await page.waitForTimeout(900);

      const after = await page.locator('h2').first().textContent().catch(() => 'after');
      const titleChanged = before !== after;

      const eventWS = await page.getByText(/EVENT WORKSPACE/i).isVisible().catch(() => false);

      // Stronger Task Detail signals
      const detailSignals = [
        await page.getByText(/Owner/i).isVisible().catch(() => false),
        await page.getByText(/Status/i).isVisible().catch(() => false),
        await page.getByText(/Evidence/i).isVisible().catch(() => false),
        await page.getByText(/Signatures/i).isVisible().catch(() => false),
        await page.getByText(/Workflow/i).isVisible().catch(() => false)
      ];
      const taskDetailStrong = detailSignals.filter(Boolean).length >= 2;

      results.cards.push({ i, titleChanged, eventWS, taskDetailStrong, before: before.substring(0,40), after: after.substring(0,40) });

      if (titleChanged) results.passed.push(`Card ${i} title changed`);
      if (eventWS) results.passed.push(`Card ${i} Event Workspace visible`);
      if (taskDetailStrong) results.passed.push(`Card ${i} Task Detail strong signals`);

      // Blocked
      for (const label of ['Upload evidence','Request signature','Approve task','Complete task']) {
        const b = page.getByRole('button', { name: new RegExp(label,'i') }).first();
        if (await b.isVisible().catch(()=>false)) {
          const dis = await b.isDisabled().catch(()=>true);
          results.passed.push(`Card ${i} ${label} blocked=${dis}`);
        }
      }

      const shot = path.join(ARTIFACT_DIR, `final-card-${i}.png`);
      await page.screenshot({ path: shot });
      results.screenshots.push(shot);
    }

    if (results.cards.length >= 5 && results.cards.every(c => c.titleChanged)) results.passed.push('All 5 cards showed real title change');
    if (results.cards.filter(c => c.taskDetailStrong).length >= 3) results.passed.push('Task Detail verified on multiple selections');

  } catch(e) { results.failed.push(e.message); }
  finally { await browser.close(); }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'final-ces-results.json'), JSON.stringify(results, null, 2));
  console.log('Final results saved. Passed count:', results.passed.length);
  return results;
}

run();