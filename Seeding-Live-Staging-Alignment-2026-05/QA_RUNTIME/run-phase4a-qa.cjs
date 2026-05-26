/**
 * PHASE 4A CES RUNTIME QA - STANDALONE PLAYWRIGHT SCRIPT (QA-ONLY)
 * This file must not be imported by the application.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

async function run() {
  console.log('Starting Phase 4A Playwright Runtime QA...');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
    warnings: [],
    screenshots: []
  };

  try {
    // 1. Load staging
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '01-staging-loaded.png'), fullPage: true });
    results.passed.push('Staging shell loaded');

    const initialUrl = page.url();
    console.log('Initial URL:', initialUrl);

    if (!initialUrl.includes('/ui-staging')) {
      results.failed.push('Did not land on /ui-staging');
    }

    // 2. Test primary navigation containment (simplified)
    const navButtons = ['Dashboard', 'CES', 'Policy', 'Forms', 'Onboarding'];
    for (const label of navButtons) {
      const btn = page.getByRole('button', { name: new RegExp(label, 'i') }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
        const url = page.url();
        if (!url.includes('/ui-staging')) {
          results.failed.push(`Primary nav "${label}" left staging: ${url}`);
        } else {
          results.passed.push(`Primary nav "${label}" stayed in staging`);
        }
      }
    }

    // 3. Go to CES section
    const cesBtn = page.getByRole('button', { name: /CES|Sprint|Compliance/i }).first();
    if (await cesBtn.isVisible().catch(() => false)) {
      await cesBtn.click();
      await page.waitForTimeout(1200);
    }

    // 4. Click CES task cards (try to find 5)
    const cards = page.locator('button').filter({ hasText: /BLOCKED|AWAITING|IN PROGRESS|READY|workflow/i });
    const cardCount = await cards.count();
    console.log(`Found ${cardCount} potential task cards`);

    const clicks = Math.min(5, cardCount);
    for (let i = 0; i < clicks; i++) {
      try {
        await cards.nth(i).click();
        await page.waitForTimeout(700);

        const url = page.url();
        if (!url.includes('/ui-staging')) {
          results.failed.push(`CES card ${i} caused navigation out of staging`);
        }

        // Check for key UI elements
        const hasEvent = await page.getByText(/EVENT WORKSPACE|Event Workspace/i).isVisible().catch(() => false);
        const hasDetail = await page.getByText(/TASK DETAIL|Task Detail/i).isVisible().catch(() => false);

        if (hasEvent || hasDetail) {
          results.passed.push(`CES card ${i} updated Event Workspace / Task Detail`);
        }

        // Check blocked buttons
        const upload = page.getByRole('button', { name: /Upload evidence/i }).first();
        if (await upload.isVisible().catch(() => false)) {
          const disabled = await upload.isDisabled().catch(() => false);
          if (!disabled) results.failed.push('Upload evidence button was enabled');
          else results.passed.push('Upload evidence correctly disabled');
        }

        // Screenshot key state
        if (i === 0 || i === 2) {
          const shot = path.join(ARTIFACT_DIR, `ces-task-${i}.png`);
          await page.screenshot({ path: shot, fullPage: false });
          results.screenshots.push(shot);
        }
      } catch (e) {
        results.warnings.push(`CES card ${i} interaction issue: ${e.message}`);
      }
    }

    // 5. Test local actions if possible
    const markViewed = page.getByRole('button', { name: /Mark viewed/i }).first();
    if (await markViewed.isVisible().catch(() => false)) {
      await markViewed.click();
      results.passed.push('Mark viewed action executed');
    }

    const markStarted = page.getByRole('button', { name: /Mark started/i }).first();
    if (await markStarted.isVisible().catch(() => false)) {
      await markStarted.click();
      results.passed.push('Mark started action executed');
    }

    // 6. Final negative check for level 5 claims
    const bodyText = await page.textContent('body').catch(() => '');
    if (/level 5|production-shaped complete/i.test(bodyText)) {
      results.failed.push('Found level 5 / production-complete language in UI');
    } else {
      results.passed.push('No level 5 claims visible');
    }

  } catch (err) {
    results.failed.push(`Top level error: ${err.message}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'error-state.png'), fullPage: true });
  } finally {
    await context.close();
    await browser.close();
  }

  // Write summary
  const reportPath = path.join(ARTIFACT_DIR, 'runtime-qa-summary.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('QA Summary written to', reportPath);
  console.log('Passed:', results.passed.length, 'Failed:', results.failed.length);

  return results;
}

run().catch(console.error);