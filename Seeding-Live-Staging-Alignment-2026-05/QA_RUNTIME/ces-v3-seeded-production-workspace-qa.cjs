/**
 * PHASE IA-1 QA - V3 CES SEEDED PRODUCTION WORKSPACE
 *
 * Proves /ui-staging mounts real CES Calendar + Board components through
 * SeededModeProvider without introducing a second Dashboard concept.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING = `${BASE_URL}/ui-staging`;
const ARTIFACT_DIR = path.join(__dirname, 'artifacts');
const RESULT_PATH = path.join(ARTIFACT_DIR, 'ces-v3-seeded-production-workspace-results.json');

if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function pass(results, message) {
  results.passed.push(message);
}

function fail(results, message) {
  results.failed.push(message);
}

async function clickNav(page, labelRegex) {
  let nav = page.getByRole('button', { name: labelRegex }).first();
  if (!(await nav.isVisible().catch(() => false))) {
    await page.getByRole('button').filter({ hasText: /menu/i }).first().click().catch(() => {});
    await page.waitForTimeout(500);
    nav = page.getByRole('button', { name: labelRegex }).first();
  }
  if (await nav.isVisible().catch(() => false)) {
    await nav.click();
    await page.waitForTimeout(1200);
    return true;
  }
  return false;
}

async function expectVisible(locator, results, message) {
  if (await locator.isVisible().catch(() => false)) {
    pass(results, message);
    return true;
  }
  fail(results, `Missing: ${message}`);
  return false;
}

async function run() {
  console.log('=== PHASE IA-1 V3 CES SEEDED PRODUCTION WORKSPACE QA ===');
  console.log('Target:', STAGING);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1200 } });
  const page = await context.newPage();

  const results = {
    target: STAGING,
    passed: [],
    failed: [],
    screenshots: [],
  };

  try {
    await page.goto(STAGING, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1500);

    if (page.url().includes('/ui-staging')) pass(results, '/ui-staging loaded and remained in staging');
    else fail(results, `Unexpected initial URL: ${page.url()}`);

    const dashboardButtons = await page.getByRole('button', { name: /^Dashboard\b/i }).count();
    if (dashboardButtons === 1) pass(results, '/dashboard home remains the only visible Dashboard nav concept');
    else fail(results, `Expected exactly one Dashboard nav concept, found ${dashboardButtons}`);

    if (!(await clickNav(page, /Compliance Execution \(CES\)|CES/i))) {
      fail(results, 'CES section nav did not open');
      return results;
    }
    pass(results, 'CES section opens from primary V3 navigation');

    const workspace = page.locator('[data-qa="v3-ces-seeded-production-workspace"]').first();
    await expectVisible(workspace, results, 'V3 CES seeded production workspace visible');

    const activeView = await workspace.getAttribute('data-qa-active-view').catch(() => null);
    if (activeView === 'calendar') pass(results, 'Default CES inner view is Calendar');
    else fail(results, `Default CES inner view expected calendar, found ${activeView}`);

    await expectVisible(page.getByRole('heading', { name: /^Calendar$/ }).first(), results, 'CES inner heading is Calendar');

    const bodyText = await page.locator('body').innerText();
    if (!/CES Dashboard/i.test(bodyText)) pass(results, 'No "CES Dashboard" label is visible');
    else fail(results, '"CES Dashboard" label is visible');

    const handoffRoute = await page.locator('[data-qa="v3-ces-live-handoff"]').first().getAttribute('data-qa-route').catch(() => null);
    if (handoffRoute === '/ces/calendar') pass(results, 'V3 CES live handoff points to /ces/calendar');
    else fail(results, `V3 CES live handoff expected /ces/calendar, found ${handoffRoute}`);

    const calendarEvents = await page.locator('[data-testid="calendar-event"]').count();
    if (calendarEvents > 0) pass(results, `Seeded mode renders non-empty real CES Calendar content (${calendarEvents} events)`);
    else fail(results, 'Seeded real CES Calendar rendered zero calendar events');

    await page.locator('[data-qa="v3-ces-inner-tab"][data-qa-tab="board"]').click();
    await page.waitForTimeout(1200);

    const boardActiveView = await workspace.getAttribute('data-qa-active-view').catch(() => null);
    if (boardActiveView === 'board') pass(results, 'Board tab selected through local V3 sub-tabs');
    else fail(results, `Board active view expected board, found ${boardActiveView}`);

    await expectVisible(page.getByRole('heading', { name: /Sprint Execution Board/i }).first(), results, 'Real SprintExecutionBoard heading visible');
    const boardCards = await page.locator('[data-testid="execution-unit-card"]').count();
    if (boardCards > 0) pass(results, `Board tab renders real SprintExecutionBoard content (${boardCards} execution-unit cards)`);
    else fail(results, 'Board tab rendered zero real execution-unit cards');

    if (page.url().includes('/ui-staging')) pass(results, 'Primary V3 section navigation remains contained inside /ui-staging');
    else fail(results, `V3 section navigation escaped staging: ${page.url()}`);

    if (await clickNav(page, /Evidence Center/i)) {
      await expectVisible(page.locator('[data-qa="v3-evidence-center"]').first(), results, 'Evidence Center smoke check still opens after CES changes');
    } else {
      fail(results, 'Evidence Center smoke check nav did not open');
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ces-v3-seeded-production-workspace.png'), fullPage: true });
    results.screenshots.push('ces-v3-seeded-production-workspace.png');
  } catch (error) {
    fail(results, error && error.stack ? error.stack : String(error));
  } finally {
    await browser.close();
    fs.writeFileSync(RESULT_PATH, JSON.stringify(results, null, 2));
  }

  console.log(JSON.stringify(results, null, 2));
  return results;
}

run().then(results => {
  if (results.failed.length > 0) {
    console.error(`QA failed with ${results.failed.length} failure(s). Results: ${RESULT_PATH}`);
    process.exit(1);
  }
  console.log(`QA passed. Results: ${RESULT_PATH}`);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
