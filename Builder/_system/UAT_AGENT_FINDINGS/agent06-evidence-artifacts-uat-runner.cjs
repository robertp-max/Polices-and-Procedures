const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const OUT_DIR = __dirname;
const PREFIX = 'agent06-evidence-artifacts';

const routes = {
  evidence: '/evidence?view=files&event_id=agent06-q1-event-2026&policy_id=AG06-POL-001&workflow_id=AG06-WF-001&task_id=AG06-TASK-001&requirement_id=AG06-REQ-001&form_id=AG06-FORM-001&form_instance_id=AG06-FI-001',
  evidenceHierarchy: '/evidence?event_id=agent06-q1-event-2026',
  audit: '/audit',
  artifact: id => `/artifacts/${encodeURIComponent(id)}?event_id=agent06-q1-event-2026&task_id=AG06-TASK-001&form_id=AG06-FORM-001&form_instance_id=AG06-FI-001&evidence_id=${encodeURIComponent(id)}&type=evidence`,
  package: '/artifacts/AG06-TASK-001%3Apackage?type=evidence_package&event_id=agent06-q1-event-2026&task_id=AG06-TASK-001&form_id=AG06-FORM-001&form_instance_id=AG06-FI-001',
};

const now = '2026-01-15T16:30:00.000Z';
const pdfDataUrl = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAzMDAgMTQ0XSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE5NQolJUVPRgo=';
const imageDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><rect width="100%" height="100%" fill="#063547"/><text x="40" y="90" fill="#b7fff4" font-size="32" font-family="Arial">Agent 06 UAT Image Evidence</text><text x="40" y="150" fill="#ffffff" font-size="20" font-family="Arial">policy_id AG06-POL-001 | workflow_id AG06-WF-001</text></svg>');
const docDataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Agent 06 UAT document fallback artifact. Non-PHI browser-local fixture.');
const signedHtmlDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent('<!doctype html><html><body style="font-family:Arial;padding:24px"><h1>Certified Signed Artifact</h1><p>Evidence ID: AG06-SIGNED-001</p><p>policy_id: AG06-POL-001</p><p>workflow_id: AG06-WF-001</p><p>event_id: agent06-q1-event-2026</p><p>task_id: AG06-TASK-001</p><p>form_instance_id: AG06-FI-001</p><p>Signer: Administrator / Compliance Officer</p><p>Finalized: 2026-01-15T16:30:00.000Z</p></body></html>');

function evidenceDoc(id, name, mimeType, kind, dataUrl, extra = {}) {
  return {
    id,
    version: 1,
    policyId: 'AG06-POL-001',
    policyIds: ['AG06-POL-001'],
    workflowId: 'AG06-WF-001',
    eventId: 'agent06-q1-event-2026',
    taskId: 'AG06-TASK-001',
    formIds: ['AG06-FORM-001'],
    linkedFormId: 'AG06-FORM-001',
    linkedFormInstanceId: 'AG06-FI-001',
    requirementId: 'AG06-REQ-001',
    folderPath: '2026/Q1/January/agent06-q1-event-2026/AG06-TASK-001',
    objectPath: dataUrl ? `uat/agent06/${id}` : (extra.objectPath || ''),
    createdAt: now,
    updatedAt: now,
    uploadedAt: now,
    createdBy: 'Agent 06 UAT',
    uploadedBy: 'Agent 06 UAT',
    status: 'EVIDENCE_LOCKED',
    checksum: `sha256-agent06-${id}`,
    fileSize: dataUrl ? dataUrl.length : null,
    sizeLabel: dataUrl ? `${Math.ceil(dataUrl.length / 1024)} KB` : 'metadata only',
    mimeType,
    name,
    kind,
    artifactType: kind,
    localDataUrl: dataUrl,
    note: 'requirement_id=AG06-REQ-001; ecign_session_id=AG06-ECIGN-SESSION-001; signed/certified UAT traceability fixture',
    auditFrozen: true,
    finalizedAt: kind.startsWith('signed_') ? now : undefined,
    ...extra,
  };
}

function buildState() {
  const evidence = [
    evidenceDoc('AG06-IMG-001', 'agent06-image-preview.svg', 'image/svg+xml', 'attachment', imageDataUrl),
    evidenceDoc('AG06-PDF-001', 'agent06-pdf-preview.pdf', 'application/pdf', 'attachment', pdfDataUrl),
    evidenceDoc('AG06-DOC-001', 'agent06-document-fallback.txt', 'text/plain', 'attachment', docDataUrl),
    evidenceDoc('AG06-SIGNED-001', 'agent06-certified-signed-package.html', 'text/html', 'signed_package', signedHtmlDataUrl, { artifactType: 'signed_package', signatureStatus: 'FINALIZED' }),
    evidenceDoc('AG06-ROUTEONLY-001', 'agent06-route-only-object.pdf', 'application/pdf', 'attachment', undefined, { objectPath: 's3://not-local/agent06-route-only-object.pdf' }),
    evidenceDoc('AG06-MISSING-001', 'agent06-missing-local-blob.pdf', 'application/pdf', 'attachment', undefined, { objectPath: 'uat/agent06/missing-local-blob.pdf' }),
  ];
  const audit = evidence.map(doc => ({
    auditId: `AG06-AUDIT-${doc.id}`,
    eventId: doc.eventId,
    entityId: doc.id,
    entityType: 'evidence',
    action: doc.id === 'AG06-SIGNED-001' ? 'SIGNATURE_FINALIZED' : 'EVIDENCE_LOCKED',
    actor: 'Agent 06 UAT',
    actorId: 'agent06-uat',
    timestamp: now,
    after: {
      evidence_id: doc.id,
      policy_id: doc.policyId,
      workflow_id: doc.workflowId,
      event_id: doc.eventId,
      task_id: doc.taskId,
      requirement_id: 'AG06-REQ-001',
      form_id: 'AG06-FORM-001',
      form_instance_id: 'AG06-FI-001',
      status: doc.status,
    },
  }));
  audit.push(
    { auditId: 'AG06-AUDIT-CREATED', eventId: 'agent06-q1-event-2026', entityId: 'AG06-FI-001', entityType: 'formInstance', action: 'SIGNATURE_SESSION_CREATED', actor: 'Agent 06 UAT', actorId: 'agent06-uat', timestamp: now, after: { evidence_id: 'AG06-SIGNED-001' } },
    { auditId: 'AG06-AUDIT-CERT', eventId: 'agent06-q1-event-2026', entityId: 'AG06-SIGNED-001', entityType: 'evidence', action: 'CERTIFICATE_CREATED', actor: 'Agent 06 UAT', actorId: 'agent06-uat', timestamp: now, after: { evidence_id: 'AG06-SIGNED-001' } },
  );
  return {
    state: {
      evidence: { 'agent06-q1-event-2026': evidence },
      taskAuditByEventId: { 'agent06-q1-event-2026': audit },
      generatedFormInstancesByEventId: {
        'agent06-q1-event-2026': [{
          id: 'AG06-FI-001',
          eventId: 'agent06-q1-event-2026',
          taskId: 'AG06-TASK-001',
          formId: 'AG06-FORM-001',
          workflowId: 'AG06-WF-001',
          policyIds: ['AG06-POL-001'],
          requirementId: 'AG06-REQ-001',
          status: 'SIGNED',
          sequence: 1,
          createdAt: now,
          updatedAt: now,
        }],
      },
      approvals: [{
        id: 'AG06-APPROVAL-001',
        eventId: 'agent06-q1-event-2026',
        targetKind: 'form',
        targetId: 'AG06-FI-001',
        targetLabel: 'Agent 06 signed artifact approval',
        status: 'approved',
        approver: 'Administrator',
        requestedBy: 'Compliance Officer',
        requestedAt: now,
        decidedAt: now,
        note: 'AG06-TASK-001 signed/certified package approved',
      }],
      signerTasksByFormInstanceId: {
        'AG06-FI-001': [
          { taskId: 'AG06-SIGNER-ADM', signerIndex: 1, assignedTo: 'ADM-06', assignedToName: 'ADM-06 Administrator', assignedToRole: 'Administrator', slotFieldId: 'administrator_signature', sequenceGroup: 1, status: 'signed' },
          { taskId: 'AG06-SIGNER-HCP', signerIndex: 2, assignedTo: 'HCP-02', assignedToName: 'HCP-02 Compliance Officer', assignedToRole: 'Compliance Officer', slotFieldId: 'compliance_signature', sequenceGroup: 2, status: 'signed' },
        ],
      },
    },
    version: 4,
  };
}

function recordDefect(results, defect) {
  results.defects.push({
    defect_id: `AG06-${String(results.defects.length + 1).padStart(3, '0')}`,
    ...defect,
  });
}

async function screenshot(page, name, results) {
  const file = `${PREFIX}-${name}.png`;
  const full = path.join(OUT_DIR, file);
  await page.screenshot({ path: full, fullPage: true });
  results.screenshots.push(full);
  return full;
}

async function seed(page) {
  await page.addInitScript(({ persisted, blobs }) => {
    localStorage.setItem('reg-execution-v2', JSON.stringify(persisted));
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    for (const [id, dataUrl] of Object.entries(blobs)) {
      localStorage.setItem(`ces_ev_data_${id}`, dataUrl);
    }
    localStorage.setItem('hhc_actor_id', 'agent06-uat');
    localStorage.setItem('hhc_actor_role', 'Compliance Officer');
  }, {
    persisted: buildState(),
    blobs: {
      'AG06-IMG-001': imageDataUrl,
      'AG06-PDF-001': pdfDataUrl,
      'AG06-DOC-001': docDataUrl,
      'AG06-SIGNED-001': signedHtmlDataUrl,
    },
  });
}

async function visibleText(page) {
  return await page.locator('body').innerText({ timeout: 10000 }).catch(() => '');
}

async function openRoute(page, route, label, results) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1300);
  const text = await visibleText(page);
  if (/login/i.test(page.url()) || /sign in|password/i.test(text)) {
    recordDefect(results, {
      severity: 'P0',
      surface: label,
      route,
      tester_id: 'ALL',
      professional_identity: 'Assigned UAT personas',
      personality: 'mixed',
      new_user_or_power_user: 'both',
      steps_to_reproduce: `Open ${route}`,
      expected_result: 'Route opens in authenticated local UAT session.',
      actual_result: `Route redirected to ${page.url()}`,
      artifact_or_task_ids: 'agent06-q1-event-2026 / AG06-TASK-001',
      console_error: '',
      screenshot_path: await screenshot(page, `${label.toLowerCase().replace(/\W+/g, '-')}-auth-block`, results),
      recommended_fix: 'Run UAT with local demo auth bypass or provide test credentials.',
      blocking_status: 'blocks browser UAT',
    });
    return { ok: false, text };
  }
  return { ok: true, text };
}

async function main() {
  const results = {
    baseUrl: BASE_URL,
    startedAt: new Date().toISOString(),
    assignedTesters: ['ADM-06', 'HCP-02', 'HCP-07', 'CM-01'],
    perspectives: ['new-user', 'power-user'],
    routes,
    observations: [],
    defects: [],
    screenshots: [],
    console: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true });
  const page = await context.newPage();
  page.on('console', msg => {
    if (['error', 'warning'].includes(msg.type())) results.console.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => results.console.push({ type: 'pageerror', text: err.message }));
  await seed(page);

  try {
    const hierarchy = await openRoute(page, routes.evidenceHierarchy, 'Evidence hierarchy', results);
    if (hierarchy.ok) {
      await screenshot(page, 'evidence-hierarchy', results);
      const text = hierarchy.text;
      results.observations.push({
        surface: 'Evidence Center hierarchy',
        route: routes.evidenceHierarchy,
        found: {
          year2026: /2026/.test(text),
          quarterQ1: /Q1|Quarter/i.test(text),
          monthJanuary: /January/i.test(text),
          eventTaskRequirementArtifactLanguage: /Year.*Month.*Event.*Task.*Requirement.*Artifact|Evidence Folder Tree/i.test(text.replace(/\n/g, ' ')),
        },
      });
      if (!/Q1/i.test(text)) {
        recordDefect(results, {
          severity: 'P2',
          surface: 'Evidence Center hierarchy',
          route: routes.evidenceHierarchy,
          tester_id: 'HCP-07',
          professional_identity: 'Surveyor/External Auditor Persona',
          personality: 'Frontline Workflow Realist',
          new_user_or_power_user: 'new-user',
          steps_to_reproduce: 'Open Evidence Center folder tree for Q1 2026 evidence.',
          expected_result: 'Hierarchy visibly includes Year -> Quarter -> Month -> Event -> Task -> Requirement -> Artifact.',
          actual_result: 'The live hierarchy copy and controls show Year and Month, but Q1 quarter is not clearly exposed as a selectable folder level.',
          artifact_or_task_ids: 'agent06-q1-event-2026 / AG06-TASK-001',
          console_error: '',
          screenshot_path: results.screenshots[results.screenshots.length - 1],
          recommended_fix: 'Expose Quarter as an explicit folder level/filter in the Evidence Center hierarchy.',
          blocking_status: 'survey usability risk',
        });
      }
    }

    const ledger = await openRoute(page, routes.evidence, 'Evidence ledger', results);
    if (ledger.ok) {
      await screenshot(page, 'evidence-ledger', results);
      const text = ledger.text;
      const expectedIds = ['AG06-IMG-001', 'AG06-PDF-001', 'AG06-DOC-001', 'AG06-SIGNED-001', 'AG06-ROUTEONLY-001', 'AG06-MISSING-001'];
      const missingIds = expectedIds.filter(id => !text.includes(id));
      results.observations.push({ surface: 'Evidence Center ledger', route: routes.evidence, missingIds });
      if (missingIds.length) {
        recordDefect(results, {
          severity: 'P1',
          surface: 'Evidence Center ledger',
          route: routes.evidence,
          tester_id: 'ADM-06',
          professional_identity: 'Administrator',
          personality: 'Detail-Oriented Perfectionist',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: 'Seed six evidence records and open File ledger with event/task/form filters.',
          expected_result: 'All evidence rows are listed with traceability metadata.',
          actual_result: `Missing rows: ${missingIds.join(', ')}`,
          artifact_or_task_ids: expectedIds.join(' | '),
          console_error: '',
          screenshot_path: results.screenshots[results.screenshots.length - 1],
          recommended_fix: 'Verify Evidence Center file loading and URL filter interaction against task-scoped event evidence.',
          blocking_status: 'audit traceability risk',
        });
      }
      const uploadBlocked = /Task-scoped upload only|Upload is blocked here/i.test(text);
      results.observations.push({ surface: 'Evidence upload', uploadBlockedInCenter: uploadBlocked });
    }

    for (const [id, expectation] of [
      ['AG06-IMG-001', 'image preview'],
      ['AG06-PDF-001', 'PDF preview'],
      ['AG06-DOC-001', 'document fallback'],
      ['AG06-SIGNED-001', 'signed/certified preview'],
      ['AG06-MISSING-001', 'missing local blob fallback'],
      ['AG06-ROUTEONLY-001', 'route-only metadata fallback'],
    ]) {
      const route = routes.artifact(id);
      const opened = await openRoute(page, route, `Artifact ${id}`, results);
      const shot = opened.ok ? await screenshot(page, `artifact-${id.toLowerCase()}`, results) : results.screenshots[results.screenshots.length - 1];
      if (!opened.ok) continue;
      const text = opened.text;
      const hasCoreMetadata = ['Artifact ID', 'Event ID', 'Task ID', 'Requirement ID', 'Form ID', 'Form Instance ID', 'Evidence ID', 'Policy ID', 'Workflow ID', 'Uploaded/Completed By', 'Uploaded/Completed Date', 'Status', 'Audit events']
        .every(label => text.includes(label));
      const resolvedAsFormInstance = /Completed form instance record/i.test(text);
      const evidencePreviewTerms = /Document preview is not supported inline|File data not found|Locked evidence|Audit-frozen evidence|Open document|Download PDF|Object path:/i.test(text);
      results.observations.push({
        surface: 'Artifact Viewer',
        artifactId: id,
        expectation,
        hasCoreMetadata,
        resolvedAsFormInstance,
        evidencePreviewTerms,
        textSample: text.slice(0, 700),
      });
      if (resolvedAsFormInstance) {
        recordDefect(results, {
          severity: 'P1',
          surface: 'Artifact Viewer route resolution',
          route,
          tester_id: 'HCP-02',
          professional_identity: 'Compliance Officer',
          personality: 'Tech-Savvy Early Adopter',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: `Open artifact ${id} from the Artifact Viewer route.`,
          expected_result: `${expectation} opens the evidence artifact branch, with preview/fallback and evidence-specific traceability.`,
          actual_result: `The evidence artifact route resolves as "Completed form instance record" because the URL carries form_instance_id=AG06-FI-001; the evidence-specific ${expectation} branch is masked.`,
          artifact_or_task_ids: `${id} / AG06-TASK-001 / AG06-FI-001`,
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Prefer evidence_id/artifactId resolution over form_instance_id when type=evidence, or require explicit type precedence in Artifact Viewer.',
          blocking_status: 'compliance evidence risk',
        });
      } else if (!hasCoreMetadata) {
        recordDefect(results, {
          severity: 'P1',
          surface: 'Artifact Viewer metadata',
          route,
          tester_id: 'HCP-02',
          professional_identity: 'Compliance Officer',
          personality: 'Tech-Savvy Early Adopter',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: `Open artifact ${id} from the Artifact Viewer route.`,
          expected_result: 'Viewer shows complete traceability fields and audit events.',
          actual_result: 'One or more required metadata labels are absent from the rendered viewer.',
          artifact_or_task_ids: `${id} / AG06-TASK-001 / AG06-FI-001`,
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Make Artifact Viewer metadata schema complete for every artifact type.',
          blocking_status: 'compliance evidence risk',
        });
      }
      if (id === 'AG06-MISSING-001' && !/File data not found|no file data found|unavailable/i.test(text)) {
        recordDefect(results, {
          severity: 'P1',
          surface: 'Artifact Viewer missing local blob',
          route,
          tester_id: 'CM-01',
          professional_identity: 'Clinical Manager',
          personality: 'Tech-Savvy Early Adopter',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: 'Open artifact metadata whose local blob is unavailable after refresh/session loss.',
          expected_result: 'Viewer clearly states file data is missing and recovery action is needed.',
          actual_result: 'Missing local blob state was not clearly labeled.',
          artifact_or_task_ids: id,
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Keep a prominent missing-blob fallback on all object-path-only artifacts.',
          blocking_status: 'artifact access risk',
        });
      }
      if (id === 'AG06-SIGNED-001' && !/SIGNED|FINALIZED|Certified Signed Artifact|Locked evidence/i.test(text)) {
        recordDefect(results, {
          severity: 'P0',
          surface: 'Signed/certified artifact',
          route,
          tester_id: 'ADM-06',
          professional_identity: 'Administrator',
          personality: 'Detail-Oriented Perfectionist',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: 'Open signed/certified artifact from Artifact Viewer route.',
          expected_result: 'Signed package opens with preview and certification/signature metadata.',
          actual_result: 'Signed artifact did not visibly render signed/certified content.',
          artifact_or_task_ids: id,
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Ensure signed package evidence resolves to previewable bytes from all entry points.',
          blocking_status: 'demo blocker',
        });
      }
    }

    const packageOpened = await openRoute(page, routes.package, 'Evidence package', results);
    if (packageOpened.ok) {
      const shot = await screenshot(page, 'artifact-evidence-package', results);
      const text = packageOpened.text;
      results.observations.push({ surface: 'Evidence package/bundle', route: routes.package, hasSummary: /Evidence package summary/i.test(text), hasLinkedEvidence: /Uploaded Evidence|Signed Documents/i.test(text) });
      if (!/Evidence package summary/i.test(text) || !/Uploaded Evidence|Signed Documents/i.test(text)) {
        recordDefect(results, {
          severity: 'P2',
          surface: 'Evidence package/bundle',
          route: routes.package,
          tester_id: 'HCP-07',
          professional_identity: 'Surveyor/External Auditor Persona',
          personality: 'Frontline Workflow Realist',
          new_user_or_power_user: 'power-user',
          steps_to_reproduce: 'Open task-level evidence package route.',
          expected_result: 'Package summarizes linked forms, evidence, signatures/certificates, and audit rows.',
          actual_result: 'Package summary or linked evidence sections were not visible.',
          artifact_or_task_ids: 'AG06-TASK-001:package',
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Strengthen evidence package route rendering and empty-state wording.',
          blocking_status: 'survey packet usability risk',
        });
      }
    }

    const auditOpened = await openRoute(page, `${routes.audit}?event_id=agent06-q1-event-2026`, 'Audit Mode', results);
    if (auditOpened.ok) {
      const shot = await screenshot(page, 'audit-mode-evidence-links', results);
      const text = auditOpened.text;
      const artifactLinks = await page.locator('[data-testid="view-artifact-link"], a[href*="/artifacts/"]').count().catch(() => 0);
      results.observations.push({ surface: 'Audit Mode evidence links', route: routes.audit, artifactLinks, mentionsSurveyPacket: /Survey packet|Bundle|Print|PDF/i.test(text) });
      if (artifactLinks === 0) {
        recordDefect(results, {
          severity: 'P1',
          surface: 'Audit Mode evidence links',
          route: `${routes.audit}?event_id=agent06-q1-event-2026`,
          tester_id: 'HCP-07',
          professional_identity: 'Surveyor/External Auditor Persona',
          personality: 'Frontline Workflow Realist',
          new_user_or_power_user: 'new-user',
          steps_to_reproduce: 'Open Audit Mode after evidence and signed package are present; look for artifact links.',
          expected_result: 'Audit Mode exposes signed/certified artifact links and survey packet evidence drill-down.',
          actual_result: 'No artifact links were detectable on the initial Audit Mode view for the seeded event.',
          artifact_or_task_ids: 'AG06-SIGNED-001 / AG06-TASK-001',
          console_error: '',
          screenshot_path: shot,
          recommended_fix: 'Make event-scoped evidence links visible and filterable from Audit Mode/survey packet entry points.',
          blocking_status: 'survey defensibility risk',
        });
      }
    }

    await page.goto(`${BASE_URL}${routes.evidence}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(800);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(1200);
    const refreshText = await visibleText(page);
    const refreshOk = ['AG06-IMG-001', 'AG06-SIGNED-001'].every(id => refreshText.includes(id));
    results.observations.push({ surface: 'Refresh behavior', route: routes.evidence, evidenceStillListedAfterReload: refreshOk });
    if (!refreshOk) {
      recordDefect(results, {
        severity: 'P1',
        surface: 'Evidence Center refresh',
        route: routes.evidence,
        tester_id: 'CM-01',
        professional_identity: 'Clinical Manager',
        personality: 'Tech-Savvy Early Adopter',
        new_user_or_power_user: 'power-user',
        steps_to_reproduce: 'Open Evidence Center ledger with evidence rows, hard refresh.',
        expected_result: 'Evidence metadata and signed artifact links remain visible after refresh.',
        actual_result: 'Seeded evidence rows were not all visible after reload.',
        artifact_or_task_ids: 'AG06-IMG-001 / AG06-SIGNED-001',
        console_error: '',
        screenshot_path: await screenshot(page, 'evidence-refresh', results),
        recommended_fix: 'Verify persisted local/demo evidence hydration and IDB/localStorage recovery on mount.',
        blocking_status: 'artifact persistence risk',
      });
    }
  } finally {
    await browser.close();
  }

  results.finishedAt = new Date().toISOString();
  const jsonPath = path.join(OUT_DIR, `${PREFIX}-results.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  const csvHeaders = ['defect_id','severity','surface','route','tester_id','professional_identity','personality','new_user_or_power_user','steps_to_reproduce','expected_result','actual_result','artifact_or_task_ids','console_error','screenshot_path','recommended_fix','blocking_status'];
  const csv = [csvHeaders.join(',')]
    .concat(results.defects.map(row => csvHeaders.map(key => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')))
    .join('\n');
  const csvPath = path.join(OUT_DIR, `${PREFIX}-defect-log.csv`);
  fs.writeFileSync(csvPath, csv);

  const mdPath = path.join(OUT_DIR, `${PREFIX}-report.md`);
  const severityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const sorted = [...results.defects].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  const verdict = sorted.some(d => d.severity === 'P0' || d.severity === 'P1') ? 'FAIL' : sorted.length ? 'PASS WITH NOTES' : 'PASS';
  const md = [
    `# Agent 06 Evidence Artifacts UAT`,
    ``,
    `Executive verdict: ${verdict}`,
    `Scope: Evidence Center and Artifact Viewer deep test for ADM-06, HCP-02, HCP-07, CM-01. New-user and power-user perspectives were simulated with browser-local non-PHI evidence fixtures.`,
    ``,
    `## Routes And IDs`,
    `- Evidence Center ledger: \`${routes.evidence}\``,
    `- Evidence Center hierarchy: \`${routes.evidenceHierarchy}\``,
    `- Audit Mode: \`${routes.audit}?event_id=agent06-q1-event-2026\``,
    `- Evidence package: \`${routes.package}\``,
    `- Core event/task/form IDs: \`agent06-q1-event-2026\`, \`AG06-TASK-001\`, \`AG06-REQ-001\`, \`AG06-FORM-001\`, \`AG06-FI-001\``,
    `- Evidence IDs: \`AG06-IMG-001\`, \`AG06-PDF-001\`, \`AG06-DOC-001\`, \`AG06-SIGNED-001\`, \`AG06-ROUTEONLY-001\`, \`AG06-MISSING-001\``,
    ``,
    `## Severity-Ranked Defects`,
    sorted.length ? sorted.map(d => `- ${d.severity} ${d.defect_id} [${d.surface}] ${d.actual_result} Route: \`${d.route}\`. Screenshot: \`${d.screenshot_path}\`.`).join('\n') : `No P0/P1/P2/P3 defects recorded by the browser runner.`,
    ``,
    `## Observations`,
    ...results.observations.map(o => `- ${o.surface}: ${JSON.stringify(o)}`),
    ``,
    `## Screenshots`,
    ...results.screenshots.map(s => `- \`${s}\``),
    ``,
    `## Console`,
    results.console.length ? results.console.map(c => `- ${c.type}: ${c.text}`).join('\n') : `No console warnings/errors captured by the runner.`,
    ``,
    `## Artifact Files`,
    `- \`${mdPath}\``,
    `- \`${csvPath}\``,
    `- \`${jsonPath}\``,
    ``,
  ].join('\n');
  fs.writeFileSync(mdPath, md);

  console.log(JSON.stringify({ verdict, defects: sorted.map(d => ({ id: d.defect_id, severity: d.severity, surface: d.surface })), report: mdPath, defectLog: csvPath, results: jsonPath, screenshots: results.screenshots }, null, 2));
  if (sorted.some(d => d.severity === 'P0')) process.exitCode = 2;
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
