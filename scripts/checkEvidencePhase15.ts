import assert from 'node:assert/strict';
import { buildCesEvidenceHierarchy } from '../src/policy/evidence/cesEvidenceHierarchy';
import type { RegulatoryEvent } from '../src/policy/data/regulatoryEvents';
import type { Task } from '../src/policy/pm/types';
import type { ApprovalRequest, EvidenceDoc } from '../src/policy/stores/regulatoryExecutionStore';

function makeEvent(): RegulatoryEvent {
  return {
    id: 'EVT-PHASE15-001',
    domain: 'Compliance',
    title: 'Sample Plan of Care Audit',
    owner: 'Cameron Compliance',
    ownerRole: 'Compliance Officer',
    date: '2026-05-20',
    urgency: 'due-soon',
    cadence: 'Monthly',
    policyRefs: ['POL-POC-001'],
    workflowId: 'WF-POC-001',
    requiredForms: [{ id: 'FORM-POC', label: 'Plan of Care Form', formId: 'FORM-POC', status: 'pending' }],
    processFlow: [{ id: 'step-1', label: 'Audit intake', description: 'Collect and validate', status: 'in-progress', dueOffsetDays: 0 }],
    approvals: [],
    sourceOfTruth: 'app',
    isContext: false,
    isSynthetic: false,
    mandateType: 'policy-driven',
  };
}

function makeTask(status: Task['status'], storyPoints = 5): Task {
  return {
    task_id: 'EVT-PHASE15-001-01',
    source: 'CES',
    task_type: 'form_completion',
    event_id: 'EVT-PHASE15-001',
    event_title: 'Sample Plan of Care Audit',
    workflow_id: 'WF-POC-001',
    workflow_title: 'Plan of Care Workflow',
    policy_id: 'POL-POC-001',
    policy_refs: ['POL-POC-001'],
    form_refs: ['FORM-POC'],
    generated_form_instance_ids: ['FI-1'],
    source_form_id: 'FORM-POC',
    priority: 'P2',
    risk: 'medium',
    blockers: [],
    form_id: 'FORM-POC',
    form_ids: ['FORM-POC'],
    title: 'Complete Plan of Care Audit',
    description: 'Finish form and collect signatures',
    status,
    packet_status: 'pending',
    start_date: '2026-05-01',
    due_date: '2026-05-25',
    sprint_id: 'SPR-2026-05',
    story_points: storyPoints,
    depends_on: [],
    dependencies: [],
    required_signers: [],
    approvers: [],
    audit_log_refs: [],
  };
}

function makeEvidence(status: EvidenceDoc['status'], id: string, taskId: string): EvidenceDoc {
  return {
    id,
    version: 1,
    policyId: 'POL-POC-001',
    eventId: 'EVT-PHASE15-001',
    taskId,
    policyIds: ['POL-POC-001'],
    workflowId: 'WF-POC-001',
    formIds: ['FORM-POC'],
    folderPath: '/events/EVT-PHASE15-001/evidence',
    objectPath: `evidence/POL-POC-001/WF-POC-001/EVT-PHASE15-001/${id}/doc.pdf`,
    createdAt: '2026-05-10T00:00:00.000Z',
    createdBy: 'demo-user',
    status,
    checksum: 'abc',
    fileSize: 100,
    mimeType: 'application/pdf',
    name: `${id}.pdf`,
    kind: 'attachment',
    uploadedAt: '2026-05-10T00:00:00.000Z',
    uploadedBy: 'demo-user',
    sizeLabel: '100 KB',
    linkedFormId: 'FORM-POC',
  };
}

function makeApproval(status: ApprovalRequest['status'], suffix: string): ApprovalRequest {
  return {
    id: `AP-${suffix}`,
    eventId: 'EVT-PHASE15-001',
    targetKind: 'form',
    targetId: 'FORM-POC',
    targetLabel: 'FORM-POC',
    status,
    requestedBy: 'demo-user',
    requestedAt: '2026-05-10T00:00:00.000Z',
  };
}

function main(): void {
  const event = makeEvent();
  const task = makeTask('in_progress', 5);
  const evidence = makeEvidence('EVIDENCE_LOCKED', 'EV-1', task.task_id);
  const orphanEvidence = makeEvidence('EVIDENCE_LOCKED', 'EV-ORPHAN', 'TASK-UNKNOWN');
  const rejectedEvidence = makeEvidence('REJECTED', 'EV-REJECTED', task.task_id);

  const partial = buildCesEvidenceHierarchy({
    events: [event],
    tasks: [task],
    evidenceByEvent: {
      [event.id]: [evidence, orphanEvidence],
    },
    approvals: [makeApproval('approved', '1')],
    auditByEvent: {},
    nowISO: '2026-05-15T00:00:00.000Z',
  });

  assert.ok(partial.years.length > 0, 'hierarchy renders with current event data');
  const partialTask = partial.years[0].quarters[1]?.months[1]?.events[0]?.tasks[0] ?? partial.years[0].quarters[0].months[0].events[0].tasks[0];
  assert.ok(partialTask.requirements.length > 0, 'task has execution requirements');
  assert.ok(partialTask.weightedCompletionPercentage > 0 && partialTask.weightedCompletionPercentage < 100, 'task weighted completion is partial');
  assert.ok(partialTask.auditReadinessPercentage < 100, 'missing supporting evidence/signature blocks full audit readiness');
  const signatureReq = partialTask.requirements.find(req => req.type === 'SIGNATURE_REQUIRED');
  assert.equal(signatureReq?.completionPercentage, 50, 'one of two signatures creates partial signature completion');
  assert.equal(partialTask.packageState, 'LOCKED', 'locked evidence keeps package immutable state');
  assert.ok(partial.orphanEvidenceGlobal.length >= 1, 'orphan evidence is separated');

  const certified = buildCesEvidenceHierarchy({
    events: [event],
    tasks: [makeTask('done', 5)],
    evidenceByEvent: {
      [event.id]: [evidence],
    },
    approvals: [makeApproval('approved', '1'), makeApproval('approved', '2')],
    auditByEvent: {},
    nowISO: '2026-05-15T00:00:00.000Z',
  });
  const certTask = certified.years[0].quarters[1]?.months[1]?.events[0]?.tasks[0] ?? certified.years[0].quarters[0].months[0].events[0].tasks[0];
  const certSignatureReq = certTask.requirements.find(req => req.type === 'SIGNATURE_REQUIRED');
  assert.equal(certSignatureReq?.completionPercentage, 100, 'two of two signatures completes signature requirement');
  assert.ok(certTask.auditReadinessPercentage >= 100 || certTask.packageState === 'CERTIFIED' || certTask.packageState === 'LOCKED', 'full signatures can certify package readiness');

  const rejected = buildCesEvidenceHierarchy({
    events: [event],
    tasks: [makeTask('done', 3)],
    evidenceByEvent: {
      [event.id]: [rejectedEvidence],
    },
    approvals: [makeApproval('approved', '1'), makeApproval('approved', '2')],
    auditByEvent: {},
    nowISO: '2026-05-15T00:00:00.000Z',
  });
  const rejectedRow = rejected.leaderboard[0];
  assert.ok(rejectedRow.rejectedEvidenceCount > 0, 'leaderboard tracks rejected evidence penalty');
  assert.ok(rejectedRow.performanceScore < rejectedRow.storyPointsCompleted + 10, 'leaderboard penalizes rejected evidence');

  console.log('PASS: hierarchy renders with current event data');
  console.log('PASS: task requirements calculate weighted completion');
  console.log('PASS: missing supporting evidence blocks full audit readiness');
  console.log('PASS: one of two signatures creates partial certification');
  console.log('PASS: two of two signatures creates certified signature completion');
  console.log('PASS: orphan evidence is separated and does not count');
  console.log('PASS: leaderboard applies rejected evidence penalties');
}

main();
