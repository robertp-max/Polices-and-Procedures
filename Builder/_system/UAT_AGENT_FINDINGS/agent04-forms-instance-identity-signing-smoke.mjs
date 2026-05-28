import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const baseURL = process.env.UAT_BASE_URL || 'http://localhost:5173';
const scenario = {
  testerId: 'DON-05',
  formId: 'EN-FM-001',
  eventId: 'agent04-don05-signing-smoke-20260527',
  taskId: 'TASK-agent04-don05-signing-smoke',
  requirementId: 'REQ-agent04-don05-signing-smoke',
  policyId: 'GV-GB-001',
  workflowId: 'WF-agent04-signing-smoke',
};

function route() {
  const q = new URLSearchParams({
    event_id: scenario.eventId,
    task_id: scenario.taskId,
    requirement_id: scenario.requirementId,
    form_id: scenario.formId,
    policy_id: scenario.policyId,
    workflow_id: scenario.workflowId,
  });
  return `${baseURL}/forms/${scenario.formId}?${q.toString()}`;
}

async function shot(page, suffix) {
  const file = path.join(outDir, `agent04-forms-instance-identity-signing-${suffix}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file.replaceAll('\\', '/');
}

async function readStore(page) {
  return await page.evaluate(() => {
    const raw = localStorage.getItem('reg-execution-v2');
    return raw ? JSON.parse(raw) : null;
  });
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => localStorage.removeItem('ci_demo_bypass_logged_out_v1'));
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  const steps = [];
  await page.goto(route(), { waitUntil: 'networkidle' });
  const bradSkip = page.getByRole('button', { name: /Skip For Now/i });
  if (await bradSkip.count()) {
    await bradSkip.first().click().catch(() => {});
  }
  steps.push({ step: 'opened task-linked form', screenshot: await shot(page, '01-open') });

  const signButtons = page.locator('button[aria-label="Sign with eCIgn"]');
  const count = await signButtons.count();
  steps.push({ step: 'signature buttons found', count });
  if (count === 0) throw new Error('No visible eCIgn Sign button found on task-linked form.');

  await signButtons.first().scrollIntoViewIfNeeded();
  await signButtons.first().click({ force: true });
  await page.waitForTimeout(1000);
  steps.push({ step: 'opened signing workspace', screenshot: await shot(page, '02-workspace') });

  await page.getByLabel(/I agree to use an electronic signature/i).check({ timeout: 10_000 });
  await page.getByRole('button', { name: /Accept & Continue/i }).click();
  await page.getByLabel(/I attest that I am the authorized signer/i).check({ timeout: 10_000 });
  await page.getByRole('button', { name: /Verify Identity/i }).click();
  await page.getByRole('button', { name: /Acknowledge Review/i }).click({ timeout: 10_000 });
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ timeout: 10_000 });
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Signature canvas has no bounding box.');
  await page.mouse.move(box.x + 120, box.y + 160);
  await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 130, { steps: 8 });
  await page.mouse.move(box.x + 390, box.y + 180, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('button', { name: /Apply Signature/i }).click();
  await page.getByRole('button', { name: /Lock Document/i }).click({ timeout: 15_000 });
  await page.getByText(/Document Signed & Sealed/i).waitFor({ timeout: 30_000 });
  steps.push({ step: 'locked signed document', screenshot: await shot(page, '03-locked') });

  const body = await page.locator('body').innerText();
  const store = await readStore(page);
  const result = { baseURL, scenario, route: route(), steps, bodyExcerpt: body.slice(0, 4000), store, consoleMessages };
  const resultPath = path.join(outDir, 'agent04-forms-instance-identity-signing-smoke-results.json');
  await fs.writeFile(resultPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ resultPath, ok: true }, null, 2));
  await browser.close();
}

main().catch(async err => {
  const failurePath = path.join(outDir, 'agent04-forms-instance-identity-signing-smoke-failure.json');
  await fs.writeFile(failurePath, JSON.stringify({ error: err.message, stack: err.stack }, null, 2));
  console.error(err);
  process.exit(1);
});
