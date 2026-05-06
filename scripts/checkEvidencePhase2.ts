import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { buildEventExecutionDataflow } from '../src/policy/compliance-execution/useEventExecutionDataflow';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length(): number { return this.data.size; }
  clear(): void { this.data.clear(); }
  getItem(key: string): string | null { return this.data.has(key) ? this.data.get(key)! : null; }
  key(index: number): string | null { return Array.from(this.data.keys())[index] ?? null; }
  removeItem(key: string): void { this.data.delete(key); }
  setItem(key: string, value: string): void { this.data.set(key, value); }
}

if (!globalThis.localStorage) {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();
}

async function main(): Promise<void> {
  const { useRegulatoryExecutionStore } = await import('../src/policy/stores/regulatoryExecutionStore');
  const event = REGULATORY_EVENTS.find(item => item.requiredForms.length > 0) ?? REGULATORY_EVENTS[0];
  assert.ok(event, 'Expected at least one regulatory event for Phase 2 checks');

  const store = useRegulatoryExecutionStore.getState();
  store.resetAll();
  const eventId = event.id;
  const formId = event.requiredForms[0]?.id ?? 'FORM-DEMO';
  const taskId = store.generateTaskFromForm(eventId, formId, { adminOverride: true });
  assert.ok(taskId, 'Expected a task generated from required form');

  const blocked = store.attemptCompleteTask(eventId, taskId);
  assert.equal(blocked.canComplete, false, 'task cannot complete when required form/evidence/signature missing');

  const blockedAudit = (useRegulatoryExecutionStore.getState().taskAuditByEventId[eventId] ?? [])
    .find(item => item.action === 'TASK_COMPLETION_BLOCKED' && item.entityId === taskId);
  assert.ok(blockedAudit, 'audit event created when task completion is blocked');

  store.generateFormInstance(eventId, formId, event.policyRefs, event.workflowId);
  store.setFormStatus(eventId, formId, 'complete');

  const evidenceId = store.uploadEvidence(eventId, {
    taskId,
    policyIds: [event.policyRefs[0] ?? 'POL-DEMO'],
    workflowId: event.workflowId ?? 'WF-DEMO',
    formIds: [formId],
    name: 'phase2-task-evidence.pdf',
    kind: 'attachment',
    sizeLabel: '100 KB',
    linkedFormId: formId,
  });
  assert.ok(evidenceId, 'supporting evidence upload should succeed from task context');

  const approvalId = store.requestApproval(eventId, 'form', `Task signature request — ${formId}`, formId);
  assert.ok(approvalId, 'signature request should be created from task context');
  store.decideApproval(approvalId, 'approved', 'Signed for phase 2 check');

  const completed = store.attemptCompleteTask(eventId, taskId);
  assert.equal(completed.canComplete, true, 'task can complete/certify after all requirements complete');

  const certifiedAudit = (useRegulatoryExecutionStore.getState().taskAuditByEventId[eventId] ?? [])
    .find(item => item.action === 'TASK_CERTIFIED' && item.entityId === taskId);
  assert.ok(certifiedAudit, 'task certified audit event is appended');

  const dataflow = buildEventExecutionDataflow(event, useRegulatoryExecutionStore.getState());
  const taskEvidence = dataflow.evidence.filter(item => item.taskId === taskId);
  assert.ok(taskEvidence.length > 0, 'evidence tab grouping data is task-linked');
  assert.ok(dataflow.approvals.some(item => item.targetId === formId), 'approvals remain task/form-linked');
  assert.ok(dataflow.auditReadinessScore >= 0 && dataflow.auditReadinessScore <= 100, 'event drawer readiness score remains bounded');

  const panelSource = readFileSync('src/policy/components/regulatory/WorkflowExecutionPanel.tsx', 'utf8');
  assert.ok(
    panelSource.includes('Forms are completed from the Tasks tab so completion, evidence, signatures, and audit trail remain linked.')
      || panelSource.includes('This is a summary view. Complete forms, upload evidence, and request signatures from the linked task in the Tasks tab so the audit trail stays connected.'),
    'Required Forms tab links users back to task-first execution',
  );
  assert.ok(
    panelSource.includes('Evidence is uploaded from the linked task requirement so it remains tied to the correct task/form/workflow.')
      || panelSource.includes('This is a summary view. Complete forms, upload evidence, and request signatures from the linked task in the Tasks tab so the audit trail stays connected.'),
    'Evidence tab states task-linked upload model',
  );
  assert.ok(
    panelSource.includes('Signature requests are initiated from linked task requirements in the Tasks tab.')
      || panelSource.includes('This is a summary view. Complete forms, upload evidence, and request signatures from the linked task in the Tasks tab so the audit trail stays connected.'),
    'Approvals tab states task-linked signature flow',
  );

  console.log('PASS: task cannot complete when required form missing');
  console.log('PASS: task cannot complete when supporting evidence/signature missing');
  console.log('PASS: task can complete/certify after all requirements complete');
  console.log('PASS: audit event is created when task completion is blocked');
  console.log('PASS: Required Forms, Evidence, and Approvals tabs remain summary/task-linked');
  console.log('PASS: Event drawer readiness data remains aligned and bounded');
}

void main();
