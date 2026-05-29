import { chromium } from 'playwright';

const baseUrl = process.env.SWIMLANE_BASE_URL || 'http://127.0.0.1:4176';

const routes = [
  '/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15',
  '/events/qapi_meeting-20260507-08/swimlane',
  '/events/cost_report_filing-20260531-01/swimlane',
  '/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01',
  '/events/bbp_training-20260527-01/swimlane',
  '/events/nonexistent-fallback-event/swimlane',
];

function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

async function waitForSwimlane(page) {
  const cards = page.locator('button.swimlane-card');
  await cards.first().waitFor({ state: 'visible', timeout: 20000 });
  return cards;
}

function activeDialog(page) {
  return page.locator('[role="dialog"]').last();
}

async function openModal(page, button) {
  await button.click();
  await page.waitForFunction(() => document.querySelectorAll('[role="dialog"]').length > 0, { timeout: 10000 });
  await page.waitForTimeout(1200);
  const dialog = activeDialog(page);
  await dialog.locator('text=Task Instructions').waitFor({ state: 'visible', timeout: 10000 });
}

async function closeModal(page) {
  const close = activeDialog(page).getByRole('button', { name: 'Close' }).last();
  if (await close.isVisible()) {
    await close.click();
    await activeDialog(page).waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}

async function checkWorkspaceAction(page, name, expectedTexts) {
  const button = activeDialog(page).getByRole('button', { name }).first();
  if (!await button.isVisible()) return { name, checked: true, reason: 'action not applicable' };
  if (await button.isDisabled()) return { name, checked: true, reason: 'disabled with reason' };
  await button.click();
  let matched = false;
  for (const text of expectedTexts) {
    const locator = activeDialog(page).locator(`text=${text}`).first();
    if (await locator.isVisible({ timeout: 5000 }).catch(() => false)) {
      matched = true;
      break;
    }
  }
  const back = activeDialog(page).getByRole('button', { name: 'Back' }).first();
  if (await back.isVisible().catch(() => false)) await back.click();
  return { name, checked: matched, reason: matched ? 'workspace rendered' : 'expected workspace text not found' };
}

async function checkFormAction(page) {
  const missingButton = activeDialog(page).getByRole('button', { name: 'Form Instance Missing — Sync Required' }).first();
  if (await missingButton.isVisible().catch(() => false)) {
    await missingButton.click();
    const ok = await activeDialog(page).locator('text=Form Instance Missing — Sync Required').first().isVisible({ timeout: 5000 }).catch(() => false);
    const back = activeDialog(page).getByRole('button', { name: 'Back' }).first();
    if (await back.isVisible().catch(() => false)) await back.click();
    return { checked: ok, reason: ok ? 'missing instance placeholder rendered' : 'missing instance placeholder missing', navigated: false };
  }

  const formLink = activeDialog(page).getByRole('link', { name: /Open Form (Instance|Template)/ }).first();
  if (!await formLink.isVisible().catch(() => false)) return { checked: true, reason: 'no form action on task', navigated: false };
  const previousUrl = page.url();
  await Promise.all([
    page.waitForURL(url => url.toString().includes('/forms/'), { timeout: 10000 }),
    formLink.click(),
  ]);
  const formOk = await page.locator('text=event_id=').first().isVisible({ timeout: 10000 }).catch(() => false)
    || await page.locator('text=workflow_id=').first().isVisible({ timeout: 10000 }).catch(() => false);
  await page.goto(previousUrl, { waitUntil: 'networkidle' });
  await waitForSwimlane(page);
  return { checked: formOk, reason: formOk ? 'form workspace rendered' : 'form workspace content missing', navigated: true };
}

async function inspectRoute(page, route) {
  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: 'networkidle' });

  const authBlocked = await page.locator('text=Sign in').first().isVisible().catch(() => false);
  if (authBlocked) {
    return { route, ok: false, reason: 'auth gate rendered instead of swimlane' };
  }

  const cards = await waitForSwimlane(page);
  const cardCount = await cards.count();
  const clicked = [];
  for (let i = 0; i < Math.min(3, cardCount); i += 1) {
    const button = cards.nth(i);
    const label = clean(await button.textContent());
    await openModal(page, button);
    const dialogText = clean(await activeDialog(page).textContent());
    const evidenceActions = [];
    evidenceActions.push(await checkWorkspaceAction(page, 'Open Evidence Workspace', ['Workspace Not Yet Available', 'Evidence Workspace']));
    evidenceActions.push(await checkWorkspaceAction(page, 'Show Signature Path', ['Workspace Not Yet Available', 'Signature Workspace']));
    evidenceActions.push(await checkWorkspaceAction(page, 'Open Artifact Workspace', ['Workspace Not Yet Available', 'Artifact Workspace']));
    const formAction = await checkFormAction(page);
    evidenceActions.push(formAction);
    clicked.push({
      label,
      taskIdVisible: dialogText.includes('Task ID'),
      instructionsPresent: dialogText.includes('Task Instructions'),
      formsPresent: dialogText.includes('Form Instances') || dialogText.includes('Form Templates'),
      multipleFormsSeparate: !(dialogText.includes('HR-FM-005, CO-FM-025, FN-FM-006, CO-FM-001, CO-FM-030')),
      supportDocsPresentOrExplained: dialogText.includes('Supporting Documentation'),
      actions: evidenceActions,
    });
    if (!formAction.navigated) {
      await closeModal(page);
    }
  }

  const finalLockButton = page.locator('button.swimlane-card').filter({ hasText: /lock|package/i }).last();
  let finalLockInstructions = false;
  if (await finalLockButton.isVisible().catch(() => false)) {
    await openModal(page, finalLockButton);
    finalLockInstructions = await activeDialog(page).locator('text=Verify all required form instances exist.').first().isVisible({ timeout: 5000 }).catch(() => false);
    await closeModal(page);
  }

  return {
    route,
    ok: clicked.length > 0 && clicked.every(item =>
      item.taskIdVisible
      && item.instructionsPresent
      && item.formsPresent
      && item.multipleFormsSeparate
      && item.supportDocsPresentOrExplained
      && item.actions.every(action => action.checked)),
    clicked,
    finalLockInstructions,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
const results = [];

for (const route of routes) {
  try {
    results.push(await inspectRoute(page, route));
  } catch (error) {
    results.push({
      route,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

await browser.close();

for (const result of results) {
  console.log(JSON.stringify(result));
}

if (results.some(result => !result.ok || !result.finalLockInstructions)) {
  process.exit(1);
}
