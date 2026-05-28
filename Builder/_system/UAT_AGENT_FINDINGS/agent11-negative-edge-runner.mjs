import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const SHOT_DIR = path.join(OUT_DIR, 'agent11-negative-edge-screenshots');
const JSON_PATH = path.join(OUT_DIR, 'agent11-negative-edge-findings.json');
const MD_PATH = path.join(OUT_DIR, 'agent11-negative-edge-report.md');
const CSV_PATH = path.join(OUT_DIR, 'agent11-negative-edge-defect-log.csv');
const BASE = process.env.UAT_BASE_URL || 'http://localhost:5173';

fs.mkdirSync(SHOT_DIR, { recursive: true });

const testers = {
  'DON-07': ['Director of Nursing', 'Tech-Savvy Early Adopter'],
  'ADM-04': ['Administrator', 'Tech-Savvy Early Adopter'],
  'CM-05': ['Clinical Manager', 'Tech-Savvy Early Adopter'],
  'HCP-05': ['IT/Security Officer', 'Pragmatic Business Owner'],
  'HCP-02': ['Compliance Officer', 'Tech-Savvy Early Adopter'],
};

const seed = {
  eventId: 'qapi_meeting-20260205-04',
  taskId: 'TASK-qapi_meeting-20260205-04-qapi-gov-pip-baseline',
  workflowId: 'WF-QA-PI-001',
  formId: 'QA-FM-021',
  formInstanceId: 'qapi_meeting-20260205-04-QA-FM-021-001',
  artifactId: 'agent11-missing-artifact-after-refresh',
};

const defects = [];
const routeResults = [];
const consoleEvents = [];
let screenshotCounter = 0;

function authFor(role = 'super_admin') {
  return {
    session: {
      accessToken: `agent11-${role}-access`,
      idToken: `agent11-${role}-id`,
      refreshToken: `agent11-${role}-refresh`,
      expiresIn: 3600,
      tokenType: 'Bearer',
    },
    expiresAt: Date.now() + 3600_000,
    user: {
      id: `agent11-${role}`,
      email: `${role.replace(/_/g, '.')}@agent11.local`,
      name: `Agent 11 ${role}`,
      role,
      firstName: 'Agent',
      lastName: 'Eleven',
      emailVerified: true,
    },
  };
}

async function prep(page, role = 'super_admin') {
  page.on('console', msg => {
    const text = msg.text();
    if (/error|warning|duplicate|502|failed|exception|not found|missing/i.test(text)) {
      consoleEvents.push({ type: msg.type(), text, url: page.url() });
    }
  });
  page.on('pageerror', err => {
    consoleEvents.push({ type: 'pageerror', text: err.message, url: page.url() });
  });
  page.on('response', res => {
    if (res.status() >= 500) {
      consoleEvents.push({ type: 'http', text: `${res.status()} ${res.url()}`, url: page.url() });
    }
  });
  await page.addInitScript(({ storedAuth }) => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    localStorage.setItem('ci_demo_auth_v1', JSON.stringify(storedAuth));
  }, { storedAuth: authFor(role) });
}

async function waitApp(page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 20_000 }).catch(() => {});
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 20, null, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(900);
}

async function shot(page, label) {
  screenshotCounter += 1;
  const file = path.join(SHOT_DIR, `${String(screenshotCounter).padStart(2, '0')}-${label}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  return file.replace(/\\/g, '/');
}

async function goto(page, route, label) {
  const before = consoleEvents.length;
  let status = null;
  let ok = false;
  let err = '';
  try {
    const res = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    status = res?.status() ?? null;
    await waitApp(page);
    ok = true;
  } catch (e) {
    err = e.message;
  }
  const bodyText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '');
  const currentUrl = page.url().replace(BASE, '');
  const screenshot = await shot(page, label);
  const newConsole = consoleEvents.slice(before);
  routeResults.push({
    route,
    currentUrl,
    status,
    ok,
    err,
    bodyStart: bodyText.slice(0, 700),
    blank: bodyText.trim().length < 40,
    rawError: /HTTP 502|502 Bad Gateway|Cannot GET|404 Not Found|missing-route|Unhandled|TypeError|ReferenceError/i.test(bodyText),
    screenshot,
    console: newConsole,
  });
  return routeResults.at(-1);
}

function addDefect({ severity, surface, route, testerId, pass, steps, expected, actual, ids = '', consoleError = '', screenshot = '', fix = '', blocking = 'Open' }) {
  const [identity, personality] = testers[testerId] || ['', ''];
  defects.push({
    defect_id: `AGENT11-${String(defects.length + 1).padStart(3, '0')}`,
    severity,
    surface,
    route,
    tester_id: testerId,
    professional_identity: identity,
    personality,
    new_user_or_power_user: pass,
    steps_to_reproduce: steps,
    expected_result: expected,
    actual_result: actual,
    artifact_or_task_ids: ids,
    console_error: consoleError,
    screenshot_path: screenshot,
    recommended_fix: fix,
    blocking_status: blocking,
  });
}

async function testRoutes(page) {
  const routes = [
    ['/ces/calendar', 'route-ces-calendar'],
    ['/ces/board', 'route-ces-board'],
    ['/pm/my-tasks', 'route-pm-my-tasks'],
    ['/audit', 'route-audit'],
    ['/evidence', 'route-evidence'],
    [`/calendar/event/${seed.eventId}/task/${seed.taskId}`, 'route-direct-task'],
    [`/forms/${seed.formId}?source=task&event_id=${seed.eventId}&task_id=${seed.taskId}&workflow_id=${seed.workflowId}&form_instance_id=${seed.formInstanceId}`, 'route-direct-form-instance'],
    [`/artifacts/${seed.artifactId}?event_id=${seed.eventId}&task_id=${seed.taskId}&form_id=${seed.formId}&form_instance_id=${seed.formInstanceId}&evidence_id=${seed.artifactId}&type=form_instance`, 'route-direct-missing-artifact'],
    [`/events/${seed.eventId}`, 'route-direct-audit-event-alias'],
    ['/definitely-not-a-real-route-agent11', 'route-invalid'],
  ];
  for (const [route, label] of routes) {
    const result = await goto(page, route, label);
    if (result.blank || result.rawError || result.status >= 500) {
      addDefect({
        severity: result.status >= 500 || result.blank ? 'P0' : 'P2',
        surface: 'Routes',
        route,
        testerId: 'ADM-04',
        pass: 'power-user',
        steps: `Directly load ${route} and observe page after load.`,
        expected: 'Route should render a user-safe page, recovery message, or stable redirect without raw errors or blank state.',
        actual: `status=${result.status}; currentUrl=${result.currentUrl}; blank=${result.blank}; rawError=${result.rawError}`,
        ids: `${seed.eventId}; ${seed.taskId}; ${seed.formInstanceId}; ${seed.artifactId}`,
        consoleError: result.console.map(c => c.text).join(' | '),
        screenshot: result.screenshot,
        fix: 'Add explicit route-level empty/error states and preserve deep-link intent for live/demo users.',
      });
    }
    if (route.startsWith('/definitely') && result.currentUrl === '/dashboard') {
      addDefect({
        severity: 'P2',
        surface: 'Routes',
        route,
        testerId: 'HCP-02',
        pass: 'new-user',
        steps: `Load invalid route ${route}.`,
        expected: 'Invalid route should show a clear not-found/recovery state and not silently hide the route problem.',
        actual: 'The app silently redirects to /dashboard with no not-found context.',
        screenshot: result.screenshot,
        fix: 'Replace wildcard dashboard redirect with a branded 404/recovery route.',
      });
    }
  }
}

async function testMissingEvidenceGate(page) {
  const route = `/calendar/event/${seed.eventId}/task/${seed.taskId}`;
  await goto(page, route, 'task-before-complete');
  const before = await page.locator('body').innerText().catch(() => '');
  const complete = page.getByRole('button', { name: /Complete Task|Verify Signature/i }).first();
  if (await complete.isVisible({ timeout: 5000 }).catch(() => false)) {
    await complete.click().catch(() => {});
    await page.waitForTimeout(1200);
    const after = await page.locator('body').innerText().catch(() => '');
    const screenshot = await shot(page, 'blocked-completion-missing-evidence');
    if (/Task certified|complete/i.test(after) && !/Task blocked|Signature required|Cannot complete|required form|supporting evidence/i.test(after)) {
      addDefect({
        severity: 'P1',
        surface: 'CES completion gates',
        route,
        testerId: 'DON-07',
        pass: 'power-user',
        steps: 'Open CES task directly and click Complete Task before completing required form/evidence/signature.',
        expected: 'Task completion must be blocked until required form, supporting evidence, and eCIgn requirements are satisfied.',
        actual: 'The UI allowed or appeared to allow completion without a visible blocking message.',
        ids: `${seed.eventId}; ${seed.taskId}; ${seed.formId}`,
        screenshot,
        fix: 'Ensure attemptCompleteTask blocks all CES-controlled requirements and surfaces blocker text inline.',
      });
    } else if (!/Task blocked|Signature required|Cannot complete|required form|supporting evidence/i.test(after)) {
      addDefect({
        severity: 'P2',
        surface: 'CES completion gates',
        route,
        testerId: 'DON-07',
        pass: 'new-user',
        steps: 'Click Complete Task with missing evidence and signatures.',
        expected: 'The exact missing requirement should be visible after the blocked attempt.',
        actual: 'No clear inline blocker was visible after the attempt; user must infer state from dense task metadata.',
        ids: `${seed.eventId}; ${seed.taskId}; ${seed.formId}`,
        consoleError: consoleEvents.slice(-5).map(c => c.text).join(' | '),
        screenshot,
        fix: 'Render task-specific blocker reason persistently near the action button.',
      });
    }
  } else {
    addDefect({
      severity: 'P2',
      surface: 'CES completion gates',
      route,
      testerId: 'DON-07',
      pass: 'new-user',
      steps: 'Open direct task route and look for the task completion action.',
      expected: 'Task route should expose a clear next action or why completion is unavailable.',
      actual: `No Complete Task/Verify Signature action was visible. Initial text sample: ${before.slice(0, 240)}`,
      ids: `${seed.eventId}; ${seed.taskId}`,
      screenshot: await shot(page, 'no-complete-action-visible'),
      fix: 'Expose consistent task actions on direct task routes.',
    });
  }
}

async function testUploadUnsupported(page) {
  const route = `/calendar/event/${seed.eventId}`;
  await goto(page, route, 'event-before-upload');
  const upload = page.getByRole('button', { name: /^Upload$/i }).first();
  if (!(await upload.isVisible({ timeout: 5000 }).catch(() => false))) {
    addDefect({
      severity: 'P2',
      surface: 'Evidence upload',
      route,
      testerId: 'HCP-05',
      pass: 'new-user',
      steps: 'Open event workspace and look for upload control.',
      expected: 'Evidence upload should be discoverable and expose supported/unsupported file behavior.',
      actual: 'No upload control was visible from the direct event workspace during the test.',
      ids: seed.eventId,
      screenshot: await shot(page, 'upload-not-discoverable'),
      fix: 'Make evidence upload affordance visible in task/evidence context.',
    });
    return;
  }
  await upload.click().catch(() => {});
  await page.waitForTimeout(500);
  const modalShot = await shot(page, 'unsupported-upload-modal');
  const fileInputCount = await page.locator('input[type=file]').count();
  if (fileInputCount === 0) {
    addDefect({
      severity: 'P1',
      surface: 'Evidence upload',
      route,
      testerId: 'HCP-05',
      pass: 'power-user',
      steps: 'Open Upload Document for event evidence and attempt to upload an unsupported file type.',
      expected: 'The upload flow should use a real file input/drop target, reject unsupported MIME/extensions, and show a durable validation message.',
      actual: 'Upload is a filename simulator with no file input; unsupported files cannot be validated and any typed .exe-like name can be accepted as evidence metadata.',
      ids: seed.eventId,
      screenshot: modalShot,
      fix: 'Wire actual file selection plus MIME/extension validation before creating evidence rows.',
    });
  }
  const nameInput = page.getByPlaceholder(/QAPI_May_Agenda|e\.g\./i).first();
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('malware-test-agent11.exe');
    await page.getByRole('button', { name: /^Upload$/i }).last().click().catch(() => {});
    await page.waitForTimeout(900);
    const text = await page.locator('body').innerText().catch(() => '');
    if (/malware-test-agent11\.exe/i.test(text)) {
      addDefect({
        severity: 'P1',
        surface: 'Evidence upload',
        route,
        testerId: 'HCP-05',
        pass: 'power-user',
        steps: 'In Upload Document, type malware-test-agent11.exe as the document name and submit.',
        expected: 'Unsupported executable file names/types should be rejected before evidence creation.',
        actual: 'The .exe name was accepted into the evidence list as if it were valid evidence.',
        ids: seed.eventId,
        screenshot: await shot(page, 'unsupported-exe-accepted'),
        fix: 'Add validation for supported evidence content types and prevent metadata-only spoof uploads.',
      });
    }
  }
}

async function testEcignRefresh(page) {
  const route = `/forms/${seed.formId}?source=task&event_id=${seed.eventId}&task_id=${seed.taskId}&workflow_id=${seed.workflowId}&form_instance_id=${seed.formInstanceId}`;
  await goto(page, route, 'form-before-ecign');
  const signButton = page.locator('[data-testid="ecign-sign-btn"]').first();
  if (!(await signButton.isVisible({ timeout: 8000 }).catch(() => false))) {
    addDefect({
      severity: 'P1',
      surface: 'eCIgn',
      route,
      testerId: 'CM-05',
      pass: 'new-user',
      steps: 'Open task-linked form instance and find eCIgn signature action.',
      expected: 'Task-linked form should expose eCIgn signing when signature is required.',
      actual: 'No eCIgn Sign button was visible on the form instance.',
      ids: `${seed.formId}; ${seed.formInstanceId}; ${seed.taskId}`,
      screenshot: await shot(page, 'ecign-sign-button-missing'),
      fix: 'Ensure signature fields and eCIgn actions render for task-linked CES forms.',
    });
    return;
  }
  await signButton.click();
  await page.waitForTimeout(1500);
  const workspaceOpen = await page.getByLabel(/eCIgn Signing Workspace/i).isVisible({ timeout: 5000 }).catch(() => false);
  const beforeRefreshShot = await shot(page, 'ecign-before-hard-refresh');
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await waitApp(page);
  const afterText = await page.locator('body').innerText().catch(() => '');
  const afterRefreshShot = await shot(page, 'ecign-after-hard-refresh');
  if (workspaceOpen && !/Electronic signature consent|Verify your identity|Review the document|Draw your signature|Finalize|Document Signed/i.test(afterText)) {
    addDefect({
      severity: 'P1',
      surface: 'eCIgn',
      route,
      testerId: 'CM-05',
      pass: 'power-user',
      steps: 'Open task-linked form, click eCIgn Sign, then hard refresh before completing consent/signature.',
      expected: 'Refresh should restore the reloadable signing session or show an explicit recover/resume message.',
      actual: 'After refresh the signing workspace disappears and the user is returned to the form without a resume/recovery state.',
      ids: `${seed.formId}; ${seed.formInstanceId}; ${seed.taskId}`,
      consoleError: consoleEvents.slice(-8).map(c => c.text).join(' | '),
      screenshot: `${beforeRefreshShot}; ${afterRefreshShot}`,
      fix: 'Persist and restore in-progress eCIgn session state from the task-linked form context.',
    });
  }
}

async function testMissingArtifactAfterRefresh(page) {
  const route = `/artifacts/${seed.artifactId}?event_id=${seed.eventId}&task_id=${seed.taskId}&form_id=${seed.formId}&form_instance_id=${seed.formInstanceId}&evidence_id=${seed.artifactId}&type=form_instance`;
  await goto(page, route, 'missing-artifact-initial');
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
  await waitApp(page);
  const text = await page.locator('body').innerText().catch(() => '');
  const screenshot = await shot(page, 'missing-artifact-after-refresh');
  if (/not available|No renderable preview|metadata only|could not locate|missing/i.test(text) || !/Artifact|Evidence|Metadata|Form Instance/i.test(text)) {
    addDefect({
      severity: 'P1',
      surface: 'Artifact Viewer',
      route,
      testerId: 'HCP-02',
      pass: 'power-user',
      steps: 'Direct-load an artifact URL with event/task/form/form_instance IDs, hard refresh, and inspect preview availability.',
      expected: 'Artifact Viewer should either render the artifact content or provide a survey-safe recovery path tied to the exact IDs.',
      actual: 'The viewer exposes a missing/metadata-only state after refresh for a URL that looks like a canonical artifact deep link.',
      ids: `${seed.artifactId}; ${seed.eventId}; ${seed.taskId}; ${seed.formInstanceId}`,
      consoleError: consoleEvents.slice(-8).map(c => c.text).join(' | '),
      screenshot,
      fix: 'Resolve direct artifact URLs from durable evidence/form-instance stores and show a non-ambiguous missing-content recovery state.',
    });
  }
}

async function testBackendUnavailable(page, context) {
  await context.route('**/api/**', route => route.abort('failed')).catch(() => {});
  const route = `/forms/${seed.formId}?source=task&event_id=${seed.eventId}&task_id=${seed.taskId}&workflow_id=${seed.workflowId}&form_instance_id=${seed.formInstanceId}`;
  await goto(page, route, 'backend-unavailable-form');
  const signButton = page.locator('[data-testid="ecign-sign-btn"]').first();
  if (await signButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await signButton.click().catch(() => {});
    await page.waitForTimeout(3000);
  }
  const text = await page.locator('body').innerText().catch(() => '');
  const screenshot = await shot(page, 'backend-unavailable-ecign');
  if (/502|Bad Gateway|Failed to fetch|NetworkError|TypeError/i.test(text)) {
    addDefect({
      severity: 'P0',
      surface: 'Offline/backend unavailable',
      route,
      testerId: 'HCP-05',
      pass: 'power-user',
      steps: 'Block /api requests, open task-linked form, and start eCIgn.',
      expected: 'No raw backend/network error should be visible; local/demo fallback or a clean unavailable message should appear.',
      actual: 'Raw network/backend failure text is visible to the user.',
      ids: `${seed.formId}; ${seed.formInstanceId}`,
      screenshot,
      fix: 'Normalize fetch failures into branded recovery messages and ensure local demo mode is independent of backend availability.',
    });
  } else if (!/unavailable|demo|fallback|offline|Opening signature instance|Electronic signature consent/i.test(text)) {
    addDefect({
      severity: 'P2',
      surface: 'Offline/backend unavailable',
      route,
      testerId: 'HCP-05',
      pass: 'new-user',
      steps: 'Block backend requests and start eCIgn.',
      expected: 'User should receive explicit offline/backend-unavailable handling.',
      actual: 'No clear offline/backend-unavailable state was visible.',
      ids: `${seed.formId}; ${seed.formInstanceId}`,
      screenshot,
      fix: 'Add explicit offline/backend unavailable affordance for eCIgn and evidence operations.',
    });
  }
  await context.unroute('**/api/**').catch(() => {});
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await prep(page, 'super_admin');

  await testRoutes(page);
  await testMissingEvidenceGate(page);
  await testUploadUnsupported(page);
  await testEcignRefresh(page);
  await testMissingArtifactAfterRefresh(page);
  await testBackendUnavailable(page, context);

  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE,
    assignedTesters: testers,
    seed,
    routeResults,
    consoleEvents,
    defects,
  };
  fs.writeFileSync(JSON_PATH, JSON.stringify(summary, null, 2));

  const esc = value => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
  const headers = Object.keys(defects[0] || {
    defect_id: '', severity: '', surface: '', route: '', tester_id: '', professional_identity: '', personality: '', new_user_or_power_user: '', steps_to_reproduce: '', expected_result: '', actual_result: '', artifact_or_task_ids: '', console_error: '', screenshot_path: '', recommended_fix: '', blocking_status: '',
  });
  fs.writeFileSync(CSV_PATH, [headers.join(','), ...defects.map(d => headers.map(h => esc(d[h])).join(','))].join('\n'));

  const counts = defects.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1;
    return acc;
  }, {});
  const md = [
    '# Agent 11 Negative/Edge UAT Findings',
    '',
    `Generated: ${summary.generatedAt}`,
    `Base URL: ${BASE}`,
    `Assigned testers: ${Object.keys(testers).join(', ')}`,
    '',
    '## Executive Verdict',
    defects.some(d => d.severity === 'P0' || d.severity === 'P1')
      ? 'FAIL for negative/edge-case readiness. P1 defects affect audit trust, evidence integrity, eCIgn recovery, and unsupported evidence upload validation.'
      : 'PASS WITH NOTES for assigned negative/edge scope.',
    '',
    '## Severity Counts',
    `P0: ${counts.P0 || 0}`,
    `P1: ${counts.P1 || 0}`,
    `P2: ${counts.P2 || 0}`,
    `P3: ${counts.P3 || 0}`,
    '',
    '## Defects',
    ...defects.map(d => [
      `### ${d.defect_id} [${d.severity}] ${d.surface}`,
      `Route: ${d.route}`,
      `Tester: ${d.tester_id} (${d.new_user_or_power_user})`,
      `IDs: ${d.artifact_or_task_ids}`,
      `Steps: ${d.steps_to_reproduce}`,
      `Expected: ${d.expected_result}`,
      `Actual: ${d.actual_result}`,
      `Console: ${d.console_error || 'None captured for this defect.'}`,
      `Screenshot: ${d.screenshot_path}`,
      `Recommended fix: ${d.recommended_fix}`,
      '',
    ].join('\n')),
    '## Route Smoke Results',
    ...routeResults.map(r => `- ${r.route} -> status=${r.status}; current=${r.currentUrl}; blank=${r.blank}; rawError=${r.rawError}; screenshot=${r.screenshot}`),
    '',
    '## Console Events',
    ...consoleEvents.slice(0, 80).map(c => `- ${c.type}: ${c.text} (${c.url})`),
  ].join('\n');
  fs.writeFileSync(MD_PATH, md);

  console.log(JSON.stringify({
    verdict: defects.some(d => d.severity === 'P0' || d.severity === 'P1') ? 'FAIL' : 'PASS WITH NOTES',
    counts,
    report: MD_PATH,
    defectLog: CSV_PATH,
    json: JSON_PATH,
    screenshots: SHOT_DIR,
  }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
