import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const outDir = path.resolve(process.cwd(), 'Builder/_system/UAT_AGENT_FINDINGS');
const shotDir = path.join(outDir, 'agent01-command-recon-screenshots');
mkdirSync(shotDir, { recursive: true });

const routes = [
  ['Dashboard', '/dashboard'],
  ['Calendar', '/calendar'],
  ['Calendar Sprint View', '/calendar?view=sprint'],
  ['Calendar Kanban View', '/calendar?view=kanban'],
  ['Calendar Gantt View', '/calendar?view=gantt'],
  ['CES Calendar', '/ces/calendar'],
  ['Sprint Board', '/ces/board'],
  ['CES Workloads', '/ces/workloads'],
  ['CES Reports', '/ces/reports'],
  ['My Tasks', '/my-tasks'],
  ['PM My Tasks', '/pm/my-tasks'],
  ['PM Dashboard', '/pm/dashboard'],
  ['Event Workspace', '/calendar/event/qapi_meeting-20260512-09'],
  ['Event Task Detail', '/calendar/event/qapi_meeting-20260512-09/task/qapi_meeting-20260512-09-29'],
  ['Evidence Center', '/evidence?event_id=qapi_meeting-20260512-09'],
  ['Audit Mode', '/audit?event=qapi_meeting-20260512-09'],
  ['Policy Library', '/library'],
  ['Policy Detail', '/library/GV-GB-001'],
  ['ACHC Survey View', '/framework/achc-survey'],
  ['Surveyor Policy Viewer', '/surveyor/policy/GV-GB-001'],
  ['Forms', '/forms'],
  ['Form Viewer / eCIgn Entry', '/forms/QA-FM-021?event_id=qapi_meeting-20260512-09&task_id=qapi_meeting-20260512-09-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260512-09-QA-FM-021-001&workflow_id=QA-WF-03'],
  ['Artifact Viewer', '/artifacts/qapi_meeting-20260512-09-QA-FM-021-001?event_id=qapi_meeting-20260512-09&task_id=qapi_meeting-20260512-09-29&form_id=QA-FM-021&form_instance_id=qapi_meeting-20260512-09-QA-FM-021-001&type=form_instance'],
  ['Generic Reference Viewer', '/viewer/GV-GB-001'],
  ['Policy Print', '/print/GV-GB-001'],
  ['Form Print', '/forms/QA-FM-021/print'],
  ['Invalid Route Recovery', '/uat-agent01-missing-route-check'],
];

const badTextPatterns = [
  /502|bad gateway/i,
  /route not found|not found|missing route/i,
  /cannot read properties|uncaught|runtime error/i,
  /failed to fetch/i,
  /form not found/i,
  /artifact not available|metadata is available/i,
];
const duplicateKeyPattern = /duplicate key|Encountered two children with the same key/i;

function safeName(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const results = [];

for (const [label, route] of routes) {
  const page = await context.newPage();
  const consoleMessages = [];
  const failedResponses = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || duplicateKeyPattern.test(text) || /502|failed|missing/i.test(text)) {
      consoleMessages.push({ type: msg.type(), text });
    }
  });
  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      failedResponses.push({ status, url: response.url() });
    }
  });

  const url = `${baseUrl.replace(/\/$/, '')}${route}`;
  let navigationError = null;
  let status = null;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    status = response?.status() ?? null;
    await page.waitForTimeout(2200);
  } catch (err) {
    navigationError = err instanceof Error ? err.message : String(err);
  }

  const finalUrl = page.url();
  const title = await page.title().catch(() => '');
  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  const textSample = bodyText.replace(/\s+/g, ' ').trim().slice(0, 600);
  const textFlags = badTextPatterns
    .filter(pattern => pattern.test(bodyText))
    .map(pattern => pattern.source);
  const duplicateKeyMessages = consoleMessages.filter(msg => duplicateKeyPattern.test(msg.text));
  const redirectedToLogin = /\/login(?:$|\?)/.test(finalUrl);
  const blankish = !bodyText.trim() || bodyText.trim().length < 20;
  const hasIssue = Boolean(
    navigationError ||
    redirectedToLogin ||
    blankish ||
    textFlags.length ||
    duplicateKeyMessages.length ||
    failedResponses.some(item => item.status === 502 || item.status === 404),
  );

  let screenshot = null;
  if (hasIssue || ['Dashboard', 'Calendar', 'Evidence Center', 'Artifact Viewer', 'Invalid Route Recovery'].includes(label)) {
    screenshot = path.join(shotDir, `${safeName(label)}.png`);
    await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {
      screenshot = null;
    });
  }

  results.push({
    label,
    route,
    status,
    finalUrl,
    title,
    redirectedToLogin,
    blankish,
    textFlags,
    duplicateKeyCount: duplicateKeyMessages.length,
    consoleMessages: consoleMessages.slice(0, 12),
    failedResponses: failedResponses.slice(0, 20),
    navigationError,
    screenshot,
    textSample,
    hasIssue,
  });
  await page.close();
}

await context.close();
await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  totalRoutes: results.length,
  issueCount: results.filter(row => row.hasIssue).length,
  duplicateKeyCount: results.reduce((sum, row) => sum + row.duplicateKeyCount, 0),
  routes: results,
};

const outPath = path.join(outDir, 'agent01-command-recon-route-smoke-results.json');
writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  outPath,
  totalRoutes: summary.totalRoutes,
  issueCount: summary.issueCount,
  duplicateKeyCount: summary.duplicateKeyCount,
}, null, 2));
