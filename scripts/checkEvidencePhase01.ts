import assert from 'node:assert/strict';
import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';

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
  const { getComplianceExecutionApi } = await import('../src/policy/services/complianceExecutionApi');
  const { EvidenceCenterEmptyState } = await import('../src/policy/pages/EvidenceCenterPage');
  const { validateEvidenceUploadInput } = await import('../src/policy/evidence/evidenceModel');

  const store = useRegulatoryExecutionStore.getState();
  store.resetAll();
  const event = REGULATORY_EVENTS[0];
  assert.ok(event, 'Expected at least one regulatory event');
  const eventId = event.id;
  const taskId = store.generateTaskFromWorkflowStep(eventId, 'evidence', { adminOverride: true });
  const policyId = event.policyRefs[0] || 'POL-DEMO-CHECK';
  const workflowId = event.workflowId || 'WF-DEMO-CHECK';
  const baselineAuditCount = (store.taskAuditByEventId[eventId] ?? []).length;

  const validUploadId = store.uploadEvidence(eventId, {
    taskId,
    policyIds: [policyId],
    workflowId,
    formIds: [],
    name: 'phase01-valid-upload.pdf',
    kind: 'attachment',
    sizeLabel: '512 KB',
  });
  assert.ok(validUploadId, 'valid triplet upload should succeed');

  const missingPolicyId = store.uploadEvidence(eventId, {
    taskId,
    policyIds: [],
    workflowId,
    formIds: [],
    name: 'missing-policy.pdf',
    kind: 'attachment',
    sizeLabel: '512 KB',
  });
  assert.equal(missingPolicyId, '', 'missing policy_id should be rejected');

  const invalidEventIdUpload = store.uploadEvidence('EVT-NOT-REAL', {
    taskId,
    policyIds: [policyId],
    workflowId,
    formIds: [],
    name: 'invalid-event.pdf',
    kind: 'attachment',
    sizeLabel: '128 KB',
  });
  assert.equal(invalidEventIdUpload, '', 'invalid event_id should be rejected');

  const formBindingCheck = validateEvidenceUploadInput({
    policyId,
    workflowId,
    eventId,
    eventExists: true,
    requiredFormBinding: true,
    formId: '',
    requiredTaskBinding: false,
    taskId: '',
  });
  assert.equal(formBindingCheck.ok, false, 'required form binding check should fail when form_id is missing');

  store.removeEvidence(eventId, validUploadId);
  const afterDeleteAttempt = useRegulatoryExecutionStore.getState().evidence[eventId]?.find(item => item.id === validUploadId);
  assert.ok(afterDeleteAttempt, 'locked evidence should remain visible after delete attempt');
  assert.equal(afterDeleteAttempt?.status, 'EVIDENCE_LOCKED', 'locked evidence cannot be deleted');

  const supersededId = store.supersedeEvidence(eventId, validUploadId, {
    name: 'phase01-valid-upload-v2.pdf',
    kind: 'attachment',
    sizeLabel: '700 KB',
  });
  assert.ok(supersededId, 'supersede should create a new version');
  const snapshot = useRegulatoryExecutionStore.getState().evidence[eventId] ?? [];
  const v1 = snapshot.find(item => item.id === validUploadId);
  const v2 = snapshot.find(item => item.id === supersededId);
  assert.equal(v1?.status, 'SUPERSEDED', 'superseded evidence should be marked SUPERSEDED');
  assert.equal(v2?.version, 2, 'new superseding evidence should increment version');

  const auditCount = (useRegulatoryExecutionStore.getState().taskAuditByEventId[eventId] ?? []).length;
  assert.ok(auditCount > baselineAuditCount, 'audit log should increment after status transitions');

  const remoteApi = getComplianceExecutionApi('awsRemote');
  await remoteApi.listEvents();

  const emptyStateElement = EvidenceCenterEmptyState({ eventId: 'EVT-CHECK-EMPTY', onUpload: () => undefined });
  assert.ok(emptyStateElement, 'Evidence Center empty state should render');

  console.log('PASS: valid triplet upload');
  console.log('PASS: missing policy_id rejected');
  console.log('PASS: invalid event_id rejected');
  console.log('PASS: required form binding validation');
  console.log('PASS: locked evidence cannot be edited/deleted');
  console.log('PASS: supersede creates new version');
  console.log('PASS: audit log increments on status transition');
  console.log('PASS: backend-disabled mode does not crash');
  console.log('PASS: Evidence Center empty state renders');
}

void main();
