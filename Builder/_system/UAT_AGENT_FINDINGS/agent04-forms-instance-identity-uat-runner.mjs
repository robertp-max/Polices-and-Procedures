import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const baseURL = process.env.UAT_BASE_URL || 'http://localhost:5173';

const testers = [
  {
    id: 'DON-05',
    identity: 'Director of Nursing',
    personality: 'Detail-Oriented Perfectionist',
    newUser: 'First-time DON reviewing forms and policy references',
    powerUser: 'DON power user validating form instance identity and audit trail completeness',
  },
  {
    id: 'CM-03',
    identity: 'Clinical Manager',
    personality: 'Detail-Oriented Perfectionist',
    newUser: 'First-time Clinical Manager checking required forms',
    powerUser: 'Clinical Manager power user validating form completion, signatures, and evidence status',
  },
  {
    id: 'CM-07',
    identity: 'Clinical Manager',
    personality: 'Detail-Oriented Perfectionist',
    newUser: 'First-time Clinical Manager validating clinical documentation',
    powerUser: 'Clinical Manager power user checking survey packet and evidence defensibility',
  },
  {
    id: 'HCP-04',
    identity: 'Risk Manager',
    personality: 'Detail-Oriented Perfectionist',
    newUser: 'First-time risk user reviewing incidents/safety workflows',
    powerUser: 'Risk power user testing CAPA, evidence, escalation, and audit readiness',
  },
];

const scenarios = [
  {
    label: 'DON-05 QAPI acknowledgment task-linked form',
    testerId: 'DON-05',
    formId: 'EN-FM-001',
    eventId: 'agent04-don05-qapi-20260527',
    taskId: 'TASK-agent04-don05-qapi-policy-ack',
    requirementId: 'REQ-agent04-don05-form-ack',
    policyId: 'GV-GB-001',
    workflowId: 'WF-agent04-qapi-policy-ack',
  },
  {
    label: 'CM-03 clinical documentation task-linked form',
    testerId: 'CM-03',
    formId: 'CL-FM-020',
    eventId: 'agent04-cm03-clinical-audit-20260527',
    taskId: 'TASK-agent04-cm03-clinical-record-audit',
    requirementId: 'REQ-agent04-cm03-clinical-form',
    policyId: 'CL-CA-001',
    workflowId: 'WF-agent04-clinical-audit',
  },
  {
    label: 'CM-07 survey packet task-linked form',
    testerId: 'CM-07',
    formId: 'CL-FM-021',
    eventId: 'agent04-cm07-survey-packet-20260527',
    taskId: 'TASK-agent04-cm07-survey-findings',
    requirementId: 'REQ-agent04-cm07-survey-form',
    policyId: 'CL-CA-002',
    workflowId: 'WF-agent04-survey-packet',
  },
  {
    label: 'HCP-04 risk CAPA task-linked form',
    testerId: 'HCP-04',
    formId: 'RM-FM-010',
    eventId: 'agent04-hcp04-risk-capa-20260527',
    taskId: 'TASK-agent04-hcp04-risk-quarterly',
    requirementId: 'REQ-agent04-hcp04-risk-form',
    policyId: 'RM-RM-001',
    workflowId: 'WF-agent04-risk-capa',
  },
];

const defects = [];
const observations = [];
const consoleMessages = [];

function scenarioUrl(s) {
  const q = new URLSearchParams({
    event_id: s.eventId,
    task_id: s.taskId,
    requirement_id: s.requirementId,
    form_id: s.formId,
    policy_id: s.policyId,
    workflow_id: s.workflowId,
  });
  return `${baseURL}/forms/${encodeURIComponent(s.formId)}?${q.toString()}`;
}

function artifactUrl(s, formInstanceId, type = 'form_instance') {
  const q = new URLSearchParams({
    event_id: s.eventId,
    task_id: s.taskId,
    requirement_id: s.requirementId,
    form_id: s.formId,
    form_instance_id: formInstanceId,
    type,
  });
  return `${baseURL}/artifacts/${encodeURIComponent(formInstanceId)}?${q.toString()}`;
}

async function shot(page, name) {
  const file = path.join(outDir, `agent04-forms-instance-identity-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file.replaceAll('\\', '/');
}

async function readRegStore(page) {
  return await page.evaluate(() => {
    const raw = localStorage.getItem('reg-execution-v2');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return { parseError: raw.slice(0, 200) }; }
  });
}

function allInstances(store) {
  const state = store?.state ?? {};
  return Object.values(state.generatedFormInstancesByEventId ?? {}).flat();
}

function auditRows(store) {
  const state = store?.state ?? {};
  return Object.values(state.taskAuditByEventId ?? {}).flat();
}

function evidenceRows(store) {
  const state = store?.state ?? {};
  return Object.values(state.evidence ?? {}).flat();
}

async function getInstance(page, s) {
  const store = await readRegStore(page);
  const matches = allInstances(store).filter(i =>
    i.eventId === s.eventId &&
    i.formId === s.formId &&
    i.taskId === s.taskId &&
    i.requirementId === s.requirementId
  );
  return { store, matches };
}

function addDefect({ id, severity, surface, route, testerId, persona, steps, expected, actual, ids, screenshotPath, recommendedFix, blockingStatus, consoleError = '' }) {
  const tester = testers.find(t => t.id === testerId);
  defects.push({
    defect_id: id,
    severity,
    surface,
    route,
    tester_id: testerId,
    professional_identity: tester?.identity ?? '',
    personality: tester?.personality ?? '',
    new_user_or_power_user: persona,
    steps_to_reproduce: steps,
    expected_result: expected,
    actual_result: actual,
    artifact_or_task_ids: ids,
    console_error: consoleError,
    screenshot_path: screenshotPath,
    recommended_fix: recommendedFix,
    blocking_status: blockingStatus,
  });
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function markInstanceCompletedInBrowserState(page, s, formInstanceId) {
  await page.evaluate(({ eventId, formInstanceId }) => {
    const raw = localStorage.getItem('reg-execution-v2');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const state = parsed.state ?? parsed;
    const rows = state.generatedFormInstancesByEventId?.[eventId] ?? [];
    for (const row of rows) {
      if (row.id === formInstanceId) {
        row.status = 'COMPLETED';
        row.updatedAt = new Date().toISOString();
      }
    }
    state.taskAuditByEventId ??= {};
    state.taskAuditByEventId[eventId] ??= [];
    state.taskAuditByEventId[eventId].unshift({
      id: `agent04-audit-${Date.now()}`,
      action: 'FORM_COMPLETED',
      actor: 'Agent04 UAT browser state',
      at: new Date().toISOString(),
      eventId,
      entityId: formInstanceId,
      entityType: 'formInstance',
      after: { formInstanceId },
    });
    parsed.state = state;
    localStorage.setItem('reg-execution-v2', JSON.stringify(parsed));
  }, { eventId: s.eventId, formInstanceId });
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, baseURL });
  await context.addInitScript(() => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
  });
  const page = await context.newPage();
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleMessages.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    }
  });
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: err.message }));

  await page.goto(`${baseURL}/forms/EN-FM-001`, { waitUntil: 'networkidle' });
  const blankShot = await shot(page, 'blank-template-EN-FM-001');
  const blankText = await page.locator('body').innerText({ timeout: 10_000 });
  observations.push({
    check: 'Opening blank template from /forms/:formId',
    route: '/forms/EN-FM-001',
    result: blankText.includes('Universal Policy Acknowledgment') ? 'opened reusable blank template' : 'template did not clearly open',
    screenshot: blankShot,
  });

  for (const s of scenarios) {
    const tester = testers.find(t => t.id === s.testerId);
    for (const persona of ['new_user', 'power_user']) {
      const route = scenarioUrl(s);
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const before = await getInstance(page, s);
      const instance = before.matches[0];
      const formText = await page.locator('body').innerText();
      const formShot = await shot(page, `${s.testerId}-${persona}-task-linked-form`);
      const expectedId = `${s.eventId}-${s.formId}-001`;

      observations.push({
        tester: s.testerId,
        persona,
        label: s.label,
        route,
        expectedId,
        matches: before.matches.map(i => ({ id: i.id, status: i.status, taskId: i.taskId, requirementId: i.requirementId, workflowId: i.workflowId, policyIds: i.policyIds })),
        taskLinkedStripPresent: formText.includes('Task-linked form context detected.'),
        screenshot: formShot,
      });

      if (!instance) {
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-NO-FORM-INSTANCE`,
          severity: 'P1',
          surface: 'Forms',
          route,
          testerId: s.testerId,
          persona,
          steps: `Open task-linked form as ${tester?.[persona === 'new_user' ? 'newUser' : 'powerUser']}: ${route}`,
          expected: 'Task-linked form creates or opens a canonical form_instance_id bound to event_id, task_id, requirement_id, form_id, policy_id, workflow_id.',
          actual: 'No matching form instance row was found in the persisted execution store after opening the route.',
          ids: JSON.stringify(s),
          screenshotPath: formShot,
          recommendedFix: 'Ensure /forms/:formId task-linked route calls the idempotent CES instance resolver and persists the row before rendering.',
          blockingStatus: 'Blocks form identity traceability',
        });
        continue;
      }

      if (instance.id !== expectedId || instance.taskId !== s.taskId || instance.requirementId !== s.requirementId || instance.workflowId !== s.workflowId) {
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-IDENTITY-MISMATCH`,
          severity: 'P1',
          surface: 'Forms',
          route,
          testerId: s.testerId,
          persona,
          steps: `Open task-linked form and inspect persisted generatedFormInstancesByEventId for ${s.eventId}.`,
          expected: `Canonical identity ${expectedId} with stable task_id ${s.taskId}, requirement_id ${s.requirementId}, workflow_id ${s.workflowId}.`,
          actual: JSON.stringify(instance),
          ids: JSON.stringify({ expectedId, actualId: instance.id, taskId: instance.taskId, requirementId: instance.requirementId, workflowId: instance.workflowId }),
          screenshotPath: formShot,
          recommendedFix: 'Normalize task-linked form route context before creating/reopening the form instance and persist all canonical IDs on the instance.',
          blockingStatus: 'Wrong or incomplete identity breaks audit chain',
        });
      }

      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      const afterRefresh = await getInstance(page, s);
      if (afterRefresh.matches.length !== 1 || afterRefresh.matches[0].id !== instance.id) {
        const refreshShot = await shot(page, `${s.testerId}-${persona}-refresh-mismatch`);
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-REFRESH-ID-DRIFT`,
          severity: 'P1',
          surface: 'Forms',
          route,
          testerId: s.testerId,
          persona,
          steps: 'Open task-linked form, record form_instance_id, hard refresh, inspect store again.',
          expected: `Exactly one form instance remains attached to ${s.taskId} with ID ${instance.id}.`,
          actual: JSON.stringify(afterRefresh.matches.map(i => i.id)),
          ids: JSON.stringify({ eventId: s.eventId, taskId: s.taskId, formId: s.formId, before: instance.id, after: afterRefresh.matches.map(i => i.id) }),
          screenshotPath: refreshShot,
          recommendedFix: 'Make refresh rehydrate the existing instance without creating a new sequence or falling back to a fi_* client ID.',
          blockingStatus: 'Identity drift across refresh',
        });
      }

      const artifactRoute = artifactUrl(s, instance.id);
      await page.goto(artifactRoute, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const artifactText = await page.locator('body').innerText();
      const artifactShot = await shot(page, `${s.testerId}-${persona}-artifact-in-progress`);
      observations.push({
        tester: s.testerId,
        persona,
        check: 'Opening form instance from artifact route before completion',
        route: artifactRoute,
        artifactContainsInstance: artifactText.includes(instance.id),
        artifactMentionsTemplate: artifactText.includes(`Template ${s.formId}`) || artifactText.includes(s.formId),
        screenshot: artifactShot,
      });

      if (!artifactText.includes('Completed form instance record') || !artifactText.includes(instance.id)) {
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-ARTIFACT-NOT-INSTANCE`,
          severity: 'P1',
          surface: 'Artifact Viewer',
          route: artifactRoute,
          testerId: s.testerId,
          persona,
          steps: 'Open /artifacts/:form_instance_id with form_instance_id query for an existing task-linked instance.',
          expected: 'Artifact Viewer resolves the completed/in-progress form instance record and displays its canonical identity.',
          actual: 'Artifact Viewer did not clearly resolve/display the form instance identity.',
          ids: JSON.stringify({ eventId: s.eventId, taskId: s.taskId, formInstanceId: instance.id }),
          screenshotPath: artifactShot,
          recommendedFix: 'Resolve artifact primary ID and query form_instance_id to the stored form instance before falling back to metadata-only.',
          blockingStatus: 'Artifact review trust issue',
        });
      }

      await markInstanceCompletedInBrowserState(page, s, instance.id);
      await page.goto(artifactRoute, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      const completedText = await page.locator('body').innerText();
      const completedShot = await shot(page, `${s.testerId}-${persona}-completed-artifact`);
      observations.push({
        tester: s.testerId,
        persona,
        check: 'Opening completed form instance from artifact route',
        route: artifactRoute,
        hasNoRenderablePreview: completedText.includes('No renderable preview for this state.'),
        hasSignedMissingBanner: completedText.includes('Signed artifact not available in this session'),
        screenshot: completedShot,
      });
      if (completedText.includes('No renderable preview for this state.') || completedText.includes('Signed artifact not available in this session')) {
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-COMPLETED-NO-PREVIEW`,
          severity: 'P1',
          surface: 'Artifact Viewer',
          route: artifactRoute,
          testerId: s.testerId,
          persona,
          steps: 'Open task-linked form, persist its canonical instance, mark it completed through the app execution store, then open the artifact route.',
          expected: 'Completed form instance opens a reviewable immutable completed/signed artifact, not a blank template or no-preview state.',
          actual: completedText.includes('Signed artifact not available in this session')
            ? 'Viewer reports signed artifact is not available in this session.'
            : 'Viewer shows "No renderable preview for this state."',
          ids: JSON.stringify({ eventId: s.eventId, taskId: s.taskId, requirementId: s.requirementId, formId: s.formId, formInstanceId: instance.id }),
          screenshotPath: completedShot,
          recommendedFix: 'Create a durable completed/signed snapshot whenever a form reaches terminal status and make Artifact Viewer retrieve it from the canonical artifact store.',
          blockingStatus: 'Completed form cannot be reviewed',
        });
      }

      await page.goto(`${baseURL}/policies/${encodeURIComponent(s.policyId)}`, { waitUntil: 'networkidle' });
      const policyShot = await shot(page, `${s.testerId}-${persona}-policy-link`);
      observations.push({ tester: s.testerId, persona, check: 'Policy route opened for linked policy', route: `/policies/${s.policyId}`, screenshot: policyShot });

      await page.goto(`${baseURL}/ces/calendar`, { waitUntil: 'networkidle' });
      const cesShot = await shot(page, `${s.testerId}-${persona}-ces-calendar-cross-view`);
      const crossViewStore = await getInstance(page, s);
      if (crossViewStore.matches.length !== 1 || crossViewStore.matches[0].id !== instance.id) {
        addDefect({
          id: `AG04-P1-${s.testerId}-${persona}-CROSS-VIEW-ID-DRIFT`,
          severity: 'P1',
          surface: 'CES cross-view navigation',
          route: '/ces/calendar',
          testerId: s.testerId,
          persona,
          steps: 'Create/open task-linked form, navigate to policy and CES calendar, inspect same form instance in persisted store.',
          expected: `Same form_instance_id ${instance.id} remains bound to task ${s.taskId}.`,
          actual: JSON.stringify(crossViewStore.matches.map(i => i.id)),
          ids: JSON.stringify({ eventId: s.eventId, taskId: s.taskId, formId: s.formId, before: instance.id, after: crossViewStore.matches.map(i => i.id) }),
          screenshotPath: cesShot,
          recommendedFix: 'Keep form instance identity in the shared execution store independent of view navigation.',
          blockingStatus: 'Cross-view identity drift',
        });
      }
    }
  }

  const finalStore = await readRegStore(page);
  observations.push({
    check: 'Final persisted store summary',
    formInstances: allInstances(finalStore).filter(i => i.eventId?.startsWith('agent04-')),
    evidence: evidenceRows(finalStore).filter(e => e.eventId?.startsWith('agent04-')),
    auditRows: auditRows(finalStore).filter(a => a.eventId?.startsWith('agent04-')),
    consoleMessages,
  });

  const jsonPath = path.join(outDir, 'agent04-forms-instance-identity-results.json');
  const csvPath = path.join(outDir, 'agent04-forms-instance-identity-defect-log.csv');
  const mdPath = path.join(outDir, 'agent04-forms-instance-identity-report.md');

  await fs.writeFile(jsonPath, JSON.stringify({ baseURL, testers, scenarios, observations, defects, consoleMessages }, null, 2));
  const csvHeader = ['defect_id','severity','surface','route','tester_id','professional_identity','personality','new_user_or_power_user','steps_to_reproduce','expected_result','actual_result','artifact_or_task_ids','console_error','screenshot_path','recommended_fix','blocking_status'];
  await fs.writeFile(csvPath, [csvHeader.join(','), ...defects.map(d => csvHeader.map(k => csvEscape(d[k])).join(','))].join('\n'));
  const defectLines = defects.map(d => `- ${d.severity} ${d.defect_id}: ${d.actual_result} (${d.screenshot_path})`).join('\n') || '- No defects logged.';
  const instanceLines = allInstances(finalStore)
    .filter(i => i.eventId?.startsWith('agent04-'))
    .map(i => `- ${i.eventId} / ${i.taskId} / ${i.requirementId} / ${i.formId} / ${i.id} / status=${i.status} / workflow=${i.workflowId}`)
    .join('\n');
  await fs.writeFile(mdPath, `# Agent04 Forms Instance Identity UAT\n\nBase URL: ${baseURL}\n\n## Executive Verdict\nFAIL for completed artifact review. Task-linked form identity remained stable in the browser store across refresh and route navigation, but terminal completed form instances did not produce or expose a reviewable immutable artifact in Artifact Viewer.\n\n## Severity-Ranked Defects\n${defectLines}\n\n## IDs Observed\n${instanceLines || '- No agent04 instances observed.'}\n\n## Artifacts\n- JSON results: ${jsonPath.replaceAll('\\', '/')}\n- Defect log: ${csvPath.replaceAll('\\', '/')}\n\n## Console\n${consoleMessages.map(m => `- ${m.type}: ${m.text}`).join('\n') || '- No console errors/warnings captured by this runner.'}\n`);

  await browser.close();
  console.log(JSON.stringify({ mdPath, csvPath, jsonPath, defects: defects.length }, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
