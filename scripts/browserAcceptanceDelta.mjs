import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const root = process.cwd();
const shotsDir = path.resolve(root, 'Builder/_system/screenshots/browser-acceptance-delta');
const outJson = path.resolve(root, 'Builder/_system/browser_acceptance_delta_results.json');
mkdirSync(shotsDir, { recursive: true });

/** @type {Array<{item: string, status: 'PASS'|'FAIL', route: string, artifactId: string, screenshot: string, blocker: string, fileFixed: string}>} */
const results = [];

const pushResult = (item, status, route, artifactId, screenshot, blocker, fileFixed) => {
  results.push({ item, status, route, artifactId, screenshot, blocker, fileFixed });
  const msg = `${status.padEnd(4)} | ${item} | ${route} | ${artifactId}${blocker ? ` | ${blocker}` : ''}`;
  // eslint-disable-next-line no-console
  console.log(msg);
};

const safeName = (value) => value.replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 80);

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1540, height: 920 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/forms`, { waitUntil: 'domcontentloaded' });
  const seed = await page.evaluate(async () => {
    const { useRegulatoryExecutionStore } = await import('/src/policy/stores/regulatoryExecutionStore.ts');
    const { REGULATORY_EVENTS } = await import('/src/policy/data/regulatoryEvents.ts');
    const { projectTasks } = await import('/src/policy/pm/taskProjectionCore.ts');
    const formId = 'QA-FM-021';
    const targetEvent = REGULATORY_EVENTS.find((event) =>
      (event.requiredForms || []).some((rf) => rf.formId === formId || rf.id === formId),
    ) || REGULATORY_EVENTS[0];
    const eventId = targetEvent.id;
    const workflowId = targetEvent.workflowId || 'QA-WF-03';
    const policyId = targetEvent.policyRefs?.[0] || 'QA-PG-001';
    const store = useRegulatoryExecutionStore.getState();
    const projected = projectTasks({ events: [targetEvent], formStates: {}, overlays: {} });
    const linkedTask =
      projected.find((task) => task.form_id === formId || task.form_ids?.includes(formId))
      || projected[0];
    const taskId = linkedTask?.task_id || `${eventId}-01`;
    const requirementId = `${taskId}::FORM_COMPLETION::${formId}`;
    const formInstance = store.getOrCreateFormInstance({
      eventId,
      formId,
      taskId,
      requirementId,
      policyIds: [policyId],
      workflowId,
    });
    if (!formInstance) throw new Error('Failed to create form instance');
    store.setFormInstanceStatus(eventId, formInstance.id, 'COMPLETED');
    store.appendTaskAuditEvent(eventId, 'form_instance', formInstance.id, 'FORM_INSTANCE_CREATED', {
      after: { taskId, requirementId, formId },
    });
    store.appendTaskAuditEvent(eventId, 'form_instance', formInstance.id, 'FORM_COMPLETED', {
      after: { taskId, requirementId, formId, formInstanceId: formInstance.id },
    });

    const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6p7gUAAAAASUVORK5CYII=';
    const evidenceId = store.uploadEvidence(eventId, {
      taskId,
      policyIds: [policyId],
      workflowId,
      formIds: [formId],
      linkedFormId: formId,
      linkedFormInstanceId: formInstance.id,
      name: 'qapi-evidence-delta.png',
      kind: 'attachment',
      sizeLabel: '3 KB',
      localDataUrl: tinyPng,
      note: `requirement_id=${requirementId};form_instance_id=${formInstance.id}`,
    }, 'QA Delta Runner');
    store.appendTaskAuditEvent(eventId, 'evidence', evidenceId, 'FILE_UPLOADED', {
      after: { taskId, formId, formInstanceId: formInstance.id },
    });
    store.appendTaskAuditEvent(eventId, 'evidence', evidenceId, 'FILE_VALIDATED', {
      after: { taskId, formId, formInstanceId: formInstance.id },
    });
    store.appendTaskAuditEvent(eventId, 'evidence', evidenceId, 'EVIDENCE_PROMOTED', {
      after: { taskId, formId, formInstanceId: formInstance.id },
    });
    store.appendTaskAuditEvent(eventId, 'evidence', evidenceId, 'EVIDENCE_LOCKED', {
      after: { taskId, formId, formInstanceId: formInstance.id },
    });

    const certHtml = '<html><body><h1>eCIgn Certificate</h1><p>Demo-local certificate artifact.</p></body></html>';
    const certificateArtifactId = store.uploadEvidence(eventId, {
      taskId,
      policyIds: [policyId],
      workflowId,
      formIds: [formId],
      linkedFormId: formId,
      linkedFormInstanceId: formInstance.id,
      name: `${formInstance.id}-ecign-certificate.html`,
      kind: 'attachment',
      sizeLabel: '8 KB',
      note: `artifact_type=signed_certificate;form_instance_id=${formInstance.id}`,
      localDataUrl: `data:text/html;charset=utf-8,${encodeURIComponent(certHtml)}`,
    }, 'QA Delta Runner');
    store.appendTaskAuditEvent(eventId, 'approval', taskId, 'SIGNATURE_FINALIZED', {
      after: { taskId, formId, formInstanceId: formInstance.id, certificateArtifactId },
    });
    store.appendTaskAuditEvent(eventId, 'approval', taskId, 'CERTIFICATE_CREATED', {
      after: { taskId, formId, formInstanceId: formInstance.id, certificateArtifactId },
    });
    store.attemptCompleteTask(eventId, taskId);
    return { eventId, taskId, workflowId, policyId, formId, formInstanceId: formInstance.id, evidenceId, certificateArtifactId, requirementId };
  });

  const snap = async (name) => {
    const shotPath = path.resolve(shotsDir, `${safeName(name)}.png`);
    await page.screenshot({ path: shotPath, fullPage: true });
    return path.relative(root, shotPath).replace(/\\/g, '/');
  };

  const check = async ({ item, route, artifactId, fileFixed, verify }) => {
    let screenshot = '';
    try {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
      const maybeArtifactId = await verify();
      const testedArtifactId = typeof maybeArtifactId === 'string' && maybeArtifactId.trim() ? maybeArtifactId.trim() : artifactId;
      screenshot = await snap(item);
      pushResult(item, 'PASS', route, testedArtifactId, screenshot, '', fileFixed);
    } catch (error) {
      screenshot = await snap(`${item}-fail`);
      pushResult(item, 'FAIL', route, artifactId, screenshot, error instanceof Error ? error.message : String(error), fileFixed);
    }
  };

  await check({
    item: 'Completed form artifact review',
    route: `/artifacts/${encodeURIComponent(seed.formInstanceId)}?event_id=${encodeURIComponent(seed.eventId)}&task_id=${encodeURIComponent(seed.taskId)}&form_id=${encodeURIComponent(seed.formId)}&form_instance_id=${encodeURIComponent(seed.formInstanceId)}&type=form_instance`,
    artifactId: seed.formInstanceId,
    fileFixed: 'src/policy/pages/ArtifactViewerPage.tsx',
    verify: async () => {
      await page.waitForSelector('text=Completed form instance record', { timeout: 15000 });
      const iframeCount = await page.locator('iframe[title^="form-instance-"]').count();
      if (!iframeCount) throw new Error('Form instance iframe render not found in artifact viewer');
    },
  });

  await check({
    item: 'Uploaded evidence artifact review',
    route: `/artifacts/${encodeURIComponent(seed.evidenceId)}?event_id=${encodeURIComponent(seed.eventId)}&task_id=${encodeURIComponent(seed.taskId)}&form_id=${encodeURIComponent(seed.formId)}&form_instance_id=${encodeURIComponent(seed.formInstanceId)}&evidence_id=${encodeURIComponent(seed.evidenceId)}&type=evidence`,
    artifactId: seed.evidenceId,
    fileFixed: 'src/policy/pages/ArtifactViewerPage.tsx',
    verify: async () => {
      await page.waitForSelector('text=Canonical artifact link', { timeout: 15000 });
      const imageCount = await page.locator('img[alt="qapi-evidence-delta.png"]').count();
      if (!imageCount) throw new Error('Evidence image preview did not render');
    },
  });

  await check({
    item: 'Evidence package review',
    route: `/artifacts/${encodeURIComponent(seed.taskId)}?event_id=${encodeURIComponent(seed.eventId)}&task_id=${encodeURIComponent(seed.taskId)}&form_id=${encodeURIComponent(seed.formId)}&form_instance_id=${encodeURIComponent(seed.formInstanceId)}&type=evidence_package`,
    artifactId: seed.taskId,
    fileFixed: 'src/policy/pages/ArtifactViewerPage.tsx; src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx',
    verify: async () => {
      await page.waitForSelector('text=Evidence package summary', { timeout: 15000 });
      await page.waitForSelector('text=qapi-evidence-delta.png', { timeout: 15000 });
      await page.waitForSelector(`text=${seed.formInstanceId}`, { timeout: 15000 });
    },
  });

  await check({
    item: 'Evidence Center artifact link review',
    route: `/evidence?event_id=${encodeURIComponent(seed.eventId)}&task_id=${encodeURIComponent(seed.taskId)}&evidence_id=${encodeURIComponent(seed.evidenceId)}&form_id=${encodeURIComponent(seed.formId)}&form_instance_id=${encodeURIComponent(seed.formInstanceId)}`,
    artifactId: seed.evidenceId,
    fileFixed: 'src/policy/pages/EvidenceCenterPage.tsx',
    verify: async () => {
      await page.waitForSelector('text=View in Artifact Viewer', { timeout: 15000 });
    },
  });

  await check({
    item: 'Task row/details artifact link review',
    route: `/calendar/event/${encodeURIComponent(seed.eventId)}/task/${encodeURIComponent(seed.taskId)}`,
    artifactId: seed.evidenceId,
    fileFixed: 'src/policy/pages/MobileIncidentExecutionPage.tsx; src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
    verify: async () => {
      await page.waitForSelector('text=View Evidence Artifact', { timeout: 15000 });
    },
  });

  await check({
    item: 'Audit Mode artifact link review',
    route: `/audit?event=${encodeURIComponent(seed.eventId)}`,
    artifactId: seed.evidenceId,
    fileFixed: 'src/policy/pages/AuditModePage.tsx',
    verify: async () => {
      const queueRow = page.locator(`text=${seed.eventId}`).first();
      await queueRow.waitFor({ state: 'visible', timeout: 15000 });
      await queueRow.click();
      await page.getByText('Evidence', { exact: true }).first().click();
      await page.waitForSelector(`a[href*="/artifacts/${encodeURIComponent(seed.evidenceId)}"]`, { timeout: 15000 });
    },
  });

  await check({
    item: 'Audit trail lifecycle artifact review',
    route: `/audit?event=${encodeURIComponent(seed.eventId)}`,
    artifactId: seed.evidenceId,
    fileFixed: 'src/policy/pages/AuditModePage.tsx; src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
    verify: async () => {
      const queueRow = page.locator(`text=${seed.eventId}`).first();
      await queueRow.waitFor({ state: 'visible', timeout: 15000 });
      await queueRow.click();
      await page.getByText('Audit Trail', { exact: true }).first().click();
      await page.waitForSelector(`a[href*="/artifacts/${encodeURIComponent(seed.evidenceId)}"]`, { timeout: 15000 });
    },
  });

  await check({
    item: 'eCIgn browser flow',
    route: `/forms/${encodeURIComponent(seed.formId)}?event_id=${encodeURIComponent(seed.eventId)}&task_id=${encodeURIComponent(seed.taskId)}&form_id=${encodeURIComponent(seed.formId)}&form_instance_id=${encodeURIComponent(seed.formInstanceId)}&workflow_id=${encodeURIComponent(seed.workflowId)}&requirement_id=${encodeURIComponent(seed.requirementId)}`,
    artifactId: seed.certificateArtifactId,
    fileFixed: 'src/policy/components/FormSigningWorkspace.tsx; src/policy/ecign/api.ts',
    verify: async () => {
      const signBtn = page.locator('button:has(img[alt="Sign with eCign"])').first();
      await signBtn.waitFor({ state: 'visible', timeout: 15000 });
      await signBtn.click();

      await page.waitForSelector('text=Step 1 of 6', { timeout: 15000 });
      await page.locator('input[type="checkbox"]').first().check();
      await page.getByRole('button', { name: /Accept & Continue/i }).click();

      await page.waitForSelector('text=Step 2 of 6', { timeout: 15000 });
      await page.locator('input[type="checkbox"]').first().check();
      await page.getByRole('button', { name: /Verify Identity/i }).click();

      await page.waitForSelector('text=Step 3 of 6', { timeout: 15000 });
      await page.getByRole('button', { name: /Acknowledge Review/i }).click();

      await page.waitForSelector('text=Step 4 of 6', { timeout: 15000 });
      const canvas = page.locator('canvas').first();
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Signature canvas not available');
      await page.mouse.move(box.x + 80, box.y + 120);
      await page.mouse.down();
      await page.mouse.move(box.x + 260, box.y + 150, { steps: 10 });
      await page.mouse.move(box.x + 430, box.y + 110, { steps: 10 });
      await page.mouse.up();
      await page.getByRole('button', { name: /Apply Signature/i }).click();

      await page.waitForSelector('text=Step 5 of 6', { timeout: 15000 });
      await page.getByRole('button', { name: /Lock Document/i }).click();
      await page.waitForSelector('text=Document Signed & Sealed', { timeout: 25000 });

      const certAction = page.getByRole('button', { name: /Open Certificate Artifact/i });
      await certAction.waitFor({ state: 'visible', timeout: 15000 });
      const [popup] = await Promise.all([
        context.waitForEvent('page', { timeout: 15000 }),
        certAction.click(),
      ]);
      await popup.waitForLoadState('domcontentloaded');
      const popupUrl = popup.url();
      const certMatch = popupUrl.match(/\/artifacts\/([^?]+)/);
      if (!certMatch || !popupUrl.includes('type=signed_certificate')) {
        throw new Error(`Certificate artifact route mismatch: ${popupUrl}`);
      }
      const runtimeCertId = decodeURIComponent(certMatch[1] || '');
      await popup.close();
      return runtimeCertId;
    },
  });

  await browser.close();
  writeFileSync(outJson, JSON.stringify({ baseUrl: BASE_URL, seed, results }, null, 2));
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[browserAcceptanceDelta] FAILED:', error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});
