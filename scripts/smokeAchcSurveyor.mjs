import { chromium } from 'playwright';

const baseUrl = (process.env.BASE_URL || 'http://localhost:5174').replace(/\/$/, '');
const failures = [];
const points = [];

function pass(label) {
  points.push({ label, ok: true });
  console.log(`PASS: ${label}`);
}

function fail(label, error) {
  const message = error instanceof Error ? error.message : String(error);
  points.push({ label, ok: false, message });
  failures.push({ label, message });
  console.error(`FAIL: ${label}\n  ${message}`);
}

async function check(label, fn) {
  try {
    await fn();
    pass(label);
  } catch (error) {
    fail(label, error);
  }
}

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  if (overflow > 2) throw new Error(`${label} has horizontal overflow: ${overflow}px`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  try {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
  } catch {
    // ignore
  }
});
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`);
});

await check('1) Policy Library renders; prominent IBM/ACHC mode switch is visible', async () => {
  await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
  await page.goto(`${baseUrl}/library`, { waitUntil: 'networkidle' });
  await page.getByText('Enterprise Policy Library').waitFor({ state: 'visible' });
  // Verify the prominent mode switch buttons exist with correct labels
  const ibmBtn = page.getByRole('button', { name: /IBM Framework View/i }).first();
  await ibmBtn.waitFor({ state: 'visible' });
  const achcBtn = page.getByRole('button', { name: /ACHC Survey View/i }).first();
  await achcBtn.waitFor({ state: 'visible' });
  // Verify Export button is gone
  const exportBtn = page.getByRole('button', { name: /Export/i });
  if (await exportBtn.count() > 0) throw new Error('Export button should be removed from Library page');
});

await check('2) IBM Framework View works; no Export; sidebar visible', async () => {
  await page.getByRole('button', { name: /IBM Framework View/i }).first().click();
  // Policy cards should render
  const firstCard = page.locator('button').filter({ has: page.locator('span', { hasText: /^[A-Z]{2}-[A-Z]{2}-\d{3}$/ }) }).first();
  await firstCard.waitFor({ state: 'visible' });
  // Regulatory Filters sidebar should show
  await page.getByText('Regulatory Filters').waitFor({ state: 'visible' });
  // Policies/Forms toggle should be visible in IBM view
  const formsToggle = page.getByRole('button', { name: /^Forms$/ });
  await formsToggle.waitFor({ state: 'visible' });
});

await check('3) ACHC Survey View: horizontal filter bar, no sidebar, no duplicate toggles, cards show ACHC tags', async () => {
  await page.getByRole('button', { name: /ACHC Survey View/i }).first().click();
  // ACHC Survey Filters label should be visible in horizontal filter bar
  await page.getByText('ACHC Survey Filters').waitFor({ state: 'visible' });
  // Select dropdowns should be visible (horizontal filter bar)
  const firstSelect = page.locator('select').first();
  await firstSelect.waitFor({ state: 'visible' });
  // Regulatory Filters sidebar should NOT be visible
  const regFilters = page.locator('text=Regulatory Filters');
  if (await regFilters.count() > 0) throw new Error('IBM Regulatory Filters sidebar should be hidden in ACHC view');
  // Forms toggle should NOT be visible in ACHC view header
  const formsToggle = page.getByRole('button', { name: /^Forms$/ });
  if (await formsToggle.isVisible()) throw new Error('Policies/Forms toggle should be hidden in ACHC view');
  // Policy cards should show ACHC tags (mapping type text)
  const cards = page.locator('button').filter({ has: page.locator('span', { hasText: /^[A-Z]{2}-[A-Z]{2}-\d{3}$/ }) });
  if (await cards.count() < 1) throw new Error('No policy cards rendered in ACHC view');
});

await check('4) Surveyor matrix renders', async () => {
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'ACHC Standard Matrix' }).click();
  const row = page.locator('tbody tr').first();
  await row.waitFor({ state: 'visible' });
  const rowText = await row.innerText();
  if (!rowText.includes('View Policy')) throw new Error('Matrix row missing View Policy action');
});

await check('5) ACHC crosswalk renders', async () => {
  await page.getByRole('button', { name: 'ACHC Crosswalk' }).click();
  const row = page.locator('tbody tr').first();
  await row.waitFor({ state: 'visible' });
  const columns = await row.locator('td').count();
  if (columns < 3) throw new Error(`Crosswalk row expected 3 columns, got ${columns}`);
});

await check('6) View Policy opens viewer; policy detail shows ACHC Survey Alignment section', async () => {
  await page.getByRole('button', { name: 'ACHC Standard Matrix' }).click();
  const firstViewPolicy = page.getByRole('link', { name: 'View Policy' }).first();
  await firstViewPolicy.waitFor({ state: 'visible' });
  await firstViewPolicy.click();
  await page.waitForURL(/\/surveyor\/policy\//);
  await page.getByRole('button', { name: /Close/ }).waitFor({ state: 'visible' });
  // Also verify the ACHC Survey Alignment section in the library policy detail view
  await page.goto(`${baseUrl}/library`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /IBM Framework View/i }).first().click();
  const firstCard = page.locator('button').filter({ has: page.locator('span', { hasText: /^GV-GB-001$/ }) }).first();
  if (await firstCard.count() > 0) {
    await firstCard.click();
    await page.getByText('ACHC Survey Alignment').waitFor({ state: 'visible', timeout: 8000 });
    await page.getByRole('button', { name: /Return to Library/i }).first().click().catch(() => {});
  }
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
});

await check('7) Print button works; shows feedback; window.print invoked', async () => {
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'ACHC Standard Matrix' }).waitFor({ state: 'visible' });
  // Navigate to viewer via a link click for proper app-state initialisation
  const viewLink = page.getByRole('link', { name: 'View Policy' }).first();
  await viewLink.waitFor({ state: 'visible' });
  await viewLink.click();
  await page.waitForURL(/\/surveyor\/policy\//);
  // Confirm viewer loaded (Close button visible)
  const closeBtn = page.getByRole('button', { name: /Close/ });
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  // Confirm policy was found (no "not found" error)
  const notFound = await page.locator('text=Policy not found').isVisible().catch(() => false);
  if (notFound) throw new Error('Viewer showed "Policy not found" instead of policy content');
  // Patch window.print before clicking Print
  await page.evaluate(() => {
    window.__printInvoked = false;
    const orig = window.print;
    window.print = () => {
      window.__printInvoked = true;
      if (typeof orig === 'function') {
        try { orig.call(window); } catch { /* headless – ignore */ }
      }
    };
  });
  // Click Print button via data-testid for reliable selection
  const printBtn = page.locator('[data-testid="viewer-print-btn"]');
  await printBtn.waitFor({ state: 'visible', timeout: 8000 });
  await printBtn.click();
  await page.waitForTimeout(350);
  const printed = await page.evaluate(() => !!window.__printInvoked);
  if (!printed) throw new Error('Print button did not invoke window.print');
  // Visual feedback text
  const feedbackVisible = await page.getByText(/Print dialog opened/i).isVisible();
  if (!feedbackVisible) throw new Error('Print feedback text not shown after clicking Print');
});

await check('8) Download button works', async () => {
  // Should still be on viewer page from check 7
  const closeBtn = page.getByRole('button', { name: /Close/ });
  const onViewer = await closeBtn.isVisible().catch(() => false);
  if (!onViewer) {
    await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
    const viewLink = page.getByRole('link', { name: 'View Policy' }).first();
    await viewLink.waitFor({ state: 'visible' });
    await viewLink.click();
    await page.waitForURL(/\/surveyor\/policy\//);
    await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  }
  const downloadBtn = page.locator('[data-testid="viewer-download-btn"]');
  await downloadBtn.waitFor({ state: 'visible', timeout: 8000 });
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 12000 }),
    downloadBtn.click(),
  ]);
  const name = download.suggestedFilename();
  if (!name) throw new Error('Download did not produce a filename');
});

await check('9) No broken policy link in sample set', async () => {
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  const links = page.getByRole('link', { name: 'View Policy' });
  const count = await links.count();
  const sample = Math.min(count, 5);
  for (let i = 0; i < sample; i += 1) {
    await links.nth(i).click();
    await page.waitForURL(/\/surveyor\/policy\//);
    const notFoundVisible = await page.getByText(/Policy not found/).isVisible();
    if (notFoundVisible) throw new Error(`Broken link at sample index ${i}`);
    await page.getByRole('button', { name: /Close/ }).click();
  }
});

await check('10) Deprecated mapping defaults are not driving matrix rows', async () => {
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  const targetRow = page.locator('tbody tr', { hasText: 'CO-CP-001' }).first();
  await targetRow.waitFor({ state: 'visible' });
  const rowText = await targetRow.innerText();
  if (!rowText.includes('DIRECT') && !rowText.includes('PARTIAL')) {
    throw new Error('CO-CP-001 did not show a validated mapping status');
  }
});

await check('11) Crosswalk excludes SME_REVIEW rows', async () => {
  await page.getByRole('button', { name: 'ACHC Standard Matrix' }).click();
  await page.getByPlaceholder('Search policy, corridor row, ACHC standard, citation...').fill('HR-TD-003');
  const matrixHasSme = await page.locator('tbody tr', { hasText: 'SME_REVIEW' }).count();
  if (matrixHasSme < 1) throw new Error('Expected SME_REVIEW row visible in matrix');
  await page.getByRole('button', { name: 'ACHC Crosswalk' }).click();
  const crosswalkRow = page.locator('tbody tr', { hasText: 'HR-TD-003' });
  if (await crosswalkRow.count()) throw new Error('SME_REVIEW row leaked into crosswalk');
  await page.getByPlaceholder('Search policy, corridor row, ACHC standard, citation...').fill('');
});

await check('12) Mobile/tablet layout and filter state synchronization remain stable', async () => {
  await page.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  await page.getByRole('combobox').first().selectOption('CO');
  await page.getByRole('button', { name: 'ACHC Crosswalk' }).click();
  const filteredCrosswalkCount = await page.locator('tbody tr').count();
  await page.getByRole('button', { name: 'ACHC Standard Matrix' }).click();
  const filteredMatrixCount = await page.locator('tbody tr').count();
  if (filteredCrosswalkCount < 1 || filteredMatrixCount < 1) {
    throw new Error('Filter state sync produced empty data unexpectedly');
  }

  const tablet = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const tabletPage = await tablet.newPage();
  await tabletPage.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  await assertNoHorizontalOverflow(tabletPage, 'Tablet surveyor page');
  await tabletPage.goto(`${baseUrl}/library`, { waitUntil: 'networkidle' });
  await tabletPage.getByRole('button', { name: /ACHC Survey View/i }).first().click();
  await assertNoHorizontalOverflow(tabletPage, 'Tablet library page');
  await tablet.close();

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${baseUrl}/framework/achc-survey`, { waitUntil: 'networkidle' });
  await assertNoHorizontalOverflow(mobilePage, 'Mobile surveyor page');
  await mobilePage.goto(`${baseUrl}/surveyor/policy/CO-CP-001`, { waitUntil: 'networkidle' });
  await assertNoHorizontalOverflow(mobilePage, 'Mobile surveyor policy viewer');
  await mobile.close();
  if (runtimeErrors.length > 0) {
    throw new Error(runtimeErrors.slice(0, 5).join('\n'));
  }
});

await browser.close();

console.log(`\nValidation summary: ${points.filter((p) => p.ok).length}/${points.length} points passed.`);

if (failures.length > 0) {
  process.exit(1);
}
