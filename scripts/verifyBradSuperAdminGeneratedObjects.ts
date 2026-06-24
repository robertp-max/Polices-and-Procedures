/* ═══════════════════════════════════════════════════════════════════════════
   Verification harness for the Brad Super Admin + append-only generated-object
   layer. 18 required proofs. Exits non-zero on any failure.

   Run: npx tsx scripts/verifyBradSuperAdminGeneratedObjects.ts
   ═══════════════════════════════════════════════════════════════════════════ */

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Configure a fresh, isolated object store + a meaningful runtime BEFORE imports
// that resolve the store singleton / harness config.
const TMP_DIR = path.join(os.tmpdir(), `brad-test-${Date.now()}`);
process.env.BRAD_OBJECT_STORE_DIR = TMP_DIR;
process.env.BRAD_RUNTIME_MODE = 'cli-nonphi';
process.env.BRAD_PROVIDER = 'claude';
process.env.BRAD_MODEL_ID = 'sonnet';

const { BradActionService } = await import('../server/ia/brad/bradActionService.js');
const { verifySuperAdmin } = await import('../server/ia/brad/superadminPolicy.js');
const { approvalRegistry } = await import('../server/ia/brad/superadminApprovals.js');
const { getGeneratedObjectStore, hasRequiredMetadata } = await import('../server/ia/brad/generatedObjects.js');
const { classifyById } = await import('../server/ia/brad/protectedCore.js');
const { planCloudChangeSet, applyCloudChangeSet } = await import('../server/ia/brad/cloudChangeSets.js');
const { DRAFT_BANNER } = await import('../server/ia/brad/eventPackets.js');
const snap = await import('../server/ia/brad/sourceSnapshot.js');
type BradSourceSnapshot = import('../server/ia/brad/sourceSnapshot.js').BradSourceSnapshot;
type SuperAdminIdentity = import('../server/ia/brad/types.js').SuperAdminIdentity;
type CloudChangeOp = import('../server/ia/brad/types.js').CloudChangeOp;

let passed = 0;
let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg);
}
function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`PASS  ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ${name} :: ${(e as Error).message}`);
  }
}

// ── Fixtures ────────────────────────────────────────────────────────────────
const SNAPSHOT: BradSourceSnapshot = {
  eventId: 'evt-qapi-2026-q2',
  eventTitle: 'Q2 2026 QAPI Committee Meeting',
  eventType: 'qapi',
  workflowId: 'wf-qapi-quarterly',
  meetingDateTime: '2026-06-25T15:00:00Z',
  attendees: ['Robert Padilla', 'Marites', 'Dee'],
  requiredRoles: ['Administrator', 'Clinical Director', 'QAPI Coordinator'],
  agenda: ['Review prior minutes', 'Metrics', 'Open PIPs', 'Incidents'],
  requiredFormIds: ['form-qapi-attendance', 'form-qapi-minutes'],
  policyIds: ['pol-qapi-001', 'pol-qapi-002'],
  tasks: [
    { id: 't1', title: 'Compile metrics', status: 'complete' },
    { id: 't2', title: 'Summarize incidents', status: 'open' },
  ],
  evidenceItemIds: ['evid-1'],
  signatures: [
    { role: 'Administrator', signed: false },
    { role: 'Clinical Director', signed: false },
  ],
  followUps: ['Distribute minutes within 7 days'],
  metrics: [{ name: 'Hospitalization rate', value: '12%', target: '<15%' }],
  pips: [{ id: 'pip-1', title: 'Reduce falls', status: 'open' }],
  incidents: [{ id: 'inc-1', type: 'fall', severity: 'moderate', summary: 'Patient fall, no injury' }],
  infectionSafetyTrends: ['No infection outbreaks'],
  priorMinutesCarryover: ['Follow up on medication reconciliation'],
  nextMeetingDate: '2026-09-24',
  capturedAt: '2026-06-24T12:00:00Z',
};

const svc = new BradActionService();
const store = getGeneratedObjectStore();

const REGULAR = { userId: 'usr-regular-999' };
const robert: SuperAdminIdentity = verifySuperAdmin({ userId: 'demo-user-careindeed', authenticated: true, actorType: 'user' });
const marites: SuperAdminIdentity = verifySuperAdmin({ userId: 'usr-marites', authenticated: true, actorType: 'user' });
const dee: SuperAdminIdentity = verifySuperAdmin({ userId: 'usr-deeb-admin', authenticated: true, actorType: 'user' });
const regularIdentity: SuperAdminIdentity = verifySuperAdmin({ userId: 'usr-regular-999', authenticated: true, actorType: 'user' });

console.log('── Brad Super Admin + Generated-Object verification ──');
console.log(`Super Admins resolved: Robert=${robert.isSuperAdmin}, Marites=${marites.isSuperAdmin}, Dee=${dee.isSuperAdmin}; regular=${regularIdentity.isSuperAdmin}\n`);

const SAFE_CLOUD_OPS: CloudChangeOp[] = [
  { type: 'cloudrun.scaling.update', resource: 'care-indeed-hh-v2-dev', description: 'set min instances to 0, max to 2', params: { min: 0, max: 2 } },
  { type: 'cloudrun.env.update', resource: 'care-indeed-hh-v2-dev', description: 'set BRAD_RUNTIME_MODE via Secret Manager ref', secretRefs: ['projects/p/secrets/brad-mode/versions/latest'] },
];
const OWNER_GRANT_OPS: CloudChangeOp[] = [
  { type: 'cloudrun.service_account.update', resource: 'care-indeed-hh-v2-dev', description: 'grant roles/owner to runtime SA' },
];

// 1 — Regular user cannot approve a Super Admin action.
test('1. Regular user cannot approve Super Admin action', () => {
  const { object } = svc.proposeChangeSet({
    actor: REGULAR, snapshot: SNAPSHOT, target: { id: 'pol-qapi-001', type: 'policy' },
    before: { title: 'old' }, after: { title: 'new' }, summary: 'rename policy',
    requiredPermission: 'approve.brad_object',
  });
  const approvals = approvalRegistry.listPending().filter((a) => a.objectId === object.metadata.object_id);
  const { allowedWrite, decision } = approvalRegistry.decide(approvals[0].approvalId, regularIdentity, 'approved');
  assert(allowedWrite === false, 'regular user must not be able to approve');
  assert(decision.decision === 'denied', 'decision must be coerced to denied');
  assert(store.get(object.metadata.object_id)!.metadata.write_status === 'denied', 'object must stay blocked');
});

// 2 — Regular user cannot apply a Google Cloud change set.
test('2. Regular user cannot apply Google Cloud change set', () => {
  const { object, plan } = svc.proposeCloudChangeSet({
    actor: REGULAR, snapshot: SNAPSHOT, ops: SAFE_CLOUD_OPS, requiredPermission: 'approve.cloud_change.low_risk',
  });
  const res = svc.applyApprovedCloudChangeSet(object.metadata.object_id, regularIdentity, plan);
  assert(res.applied === false, 'regular user must not apply cloud change set');
});

// 3 — Regular user can run a read-only report if allowed.
test('3. Regular user can run read-only report', () => {
  const obj = svc.runEventReadinessReport(SNAPSHOT, REGULAR);
  assert(obj.metadata.write_status === 'committed', 'read-only report should commit without approval');
  assert((obj.content as { reportKind: string }).reportKind === 'event-readiness', 'wrong report kind');
});

// 4 — Brad can create a BradGeneratedReport.
let reportId = '';
test('4. Brad can create BradGeneratedReport', () => {
  const obj = svc.runQapiPacketReport(SNAPSHOT, REGULAR);
  reportId = obj.metadata.object_id;
  assert(obj.metadata.object_type === 'BradGeneratedReport', 'wrong object type');
  assert(store.verifyIntegrity(reportId), 'integrity hash must verify');
});

// 5 — Brad can create a BradGeneratedEventPacket.
test('5. Brad can create BradGeneratedEventPacket', () => {
  const { object } = svc.generateEventPacket(SNAPSHOT, REGULAR, 'general');
  assert(object.metadata.object_type === 'BradGeneratedEventPacket', 'wrong object type');
});

// 6 — Brad can create a BradGeneratedQapiMinutes draft.
test('6. Brad can create BradGeneratedQapiMinutes draft', () => {
  const { object } = svc.generateQapiMinutesDraft(SNAPSHOT, REGULAR);
  assert(object.metadata.object_type === 'BradGeneratedQapiMinutes', 'wrong object type');
  const c = object.content as { finalized: boolean; draftBanner: string };
  assert(c.finalized === false, 'minutes must not be finalized');
  assert(c.draftBanner === DRAFT_BANNER, 'draft banner missing');
});

// 7 — Brad cannot overwrite canonical policy/form/workflow/event template.
test('7. Brad cannot overwrite canonical objects', () => {
  for (const t of ['policy', 'form', 'workflow', 'event-template'] as const) {
    const r = svc.attemptDirectCoreMutation({ id: `core-${t}-1`, type: t });
    assert(r.blocked === true && r.requiresChangeSet === true, `${t} mutation must be blocked + require changeset`);
  }
});

// 8 — Brad cannot modify objects created outside Brad's generated-object layer.
test('8. Brad cannot modify externally-created objects (unknown=protected)', () => {
  assert(classifyById('external-system-xyz') === 'unknown', 'non-brad id must classify unknown');
  const r = svc.attemptDirectCoreMutation({ id: 'external-system-xyz', type: 'unknown' });
  assert(r.blocked === true && r.requiresChangeSet === true, 'external object mutation must be blocked');
});

// 9 — Brad can append ONLY allowed event metadata.
test('9. Brad appends only allowed event metadata', () => {
  const ok = svc.appendEventMetadata(SNAPSHOT.eventId, { pending_review: true, packet_generation_status: 'generated' });
  assert(ok.ok === true && ok.rejectedFields.length === 0, 'allowed-only patch should succeed');
  const mixed = svc.appendEventMetadata(SNAPSHOT.eventId, { pending_review: true, event_title: 'HACK', event_date: '2030-01-01' });
  assert(mixed.appliedFields.includes('pending_review'), 'allowed field should apply');
  assert(mixed.rejectedFields.includes('event_title') && mixed.rejectedFields.includes('event_date'), 'protected fields must be rejected');
  assert(mixed.requiresChangeSet === true, 'protected field change must require changeset');
});

// 10 — Brad cannot mark minutes signed/finalized.
test('10. Brad cannot mark minutes signed/finalized', () => {
  const { object } = svc.generateQapiMinutesDraft(SNAPSHOT, REGULAR);
  assert((object.content as { finalized: boolean }).finalized === false, 'finalized must be false');
  const r = svc.appendEventMetadata(SNAPSHOT.eventId, { ['signed' as string]: true, ['finalized' as string]: true });
  assert(r.rejectedFields.includes('signed') && r.rejectedFields.includes('finalized'), 'signed/finalized must be rejected');
});

// 11 — Super Admin approval allows an allowed write.
test('11. Super Admin approval allows allowed write', () => {
  const { object } = svc.proposeChangeSet({
    actor: REGULAR, snapshot: SNAPSHOT, target: { id: 'pol-qapi-002', type: 'policy' },
    before: { x: 1 }, after: { x: 2 }, summary: 'update threshold', requiredPermission: 'approve.brad_object',
  });
  const appr = approvalRegistry.listPending().find((a) => a.objectId === object.metadata.object_id)!;
  const { allowedWrite } = approvalRegistry.decide(appr.approvalId, robert, 'approved');
  assert(allowedWrite === true, 'Robert (approve.brad_object) must approve');
  assert(store.get(object.metadata.object_id)!.metadata.write_status === 'approved', 'object must be approved');
});

// 12 — Super Admin denial blocks the write.
test('12. Super Admin denial blocks write', () => {
  const { object } = svc.proposeChangeSet({
    actor: REGULAR, snapshot: SNAPSHOT, target: { id: 'pol-qapi-003', type: 'policy' },
    before: { x: 1 }, after: { x: 9 }, summary: 'risky change', requiredPermission: 'approve.brad_object',
  });
  const appr = approvalRegistry.listPending().find((a) => a.objectId === object.metadata.object_id)!;
  const { allowedWrite } = approvalRegistry.decide(appr.approvalId, robert, 'denied', 'not justified');
  assert(allowedWrite === false, 'denial must block');
  assert(store.get(object.metadata.object_id)!.metadata.write_status === 'denied', 'object must be denied');
});

// 13 — Cloud change-set dry-run does not mutate cloud.
test('13. Cloud change set dry-run does not mutate cloud', () => {
  const plan = planCloudChangeSet(SAFE_CLOUD_OPS);
  assert(plan.allowlistValid === true, 'safe ops should be allowlist-valid');
  assert(plan.dryRunSummary.length === SAFE_CLOUD_OPS.length, 'dry-run should summarize each op');
  assert(plan.ops === SAFE_CLOUD_OPS, 'plan is pure — no mutation/cloning of intent');
});

// 14 — Cloud change-set apply requires Super Admin approval.
test('14. Cloud change set apply requires Super Admin approval', () => {
  const plan = planCloudChangeSet(SAFE_CLOUD_OPS);
  const noApproval = applyCloudChangeSet(plan, { approved: false });
  assert(noApproval.applied === false && /approval required/i.test(noApproval.reason), 'must refuse without approval');
  const approved = applyCloudChangeSet(plan, { approved: true, approverId: 'demo-user-careindeed' });
  assert(/not wired in MVP/i.test(approved.reason), 'approved path recognized (MVP no live mutation)');
});

// 15 — Cloud change set cannot grant Owner/Editor.
test('15. Cloud change set cannot grant Owner/Editor', () => {
  const plan = planCloudChangeSet(OWNER_GRANT_OPS);
  assert(plan.allowlistValid === false, 'owner grant must invalidate the plan');
  assert(plan.disallowedReasons.some((r) => /owner\/editor/i.test(r)), 'must cite Owner/Editor');
  const res = applyCloudChangeSet(plan, { approved: true, approverId: 'demo-user-careindeed' });
  assert(res.applied === false, 'invalid plan must never apply even if approved');
});

// 16 — Generated objects include all required metadata.
test('16. Generated objects include required metadata', () => {
  const obj = store.get(reportId)!;
  assert(hasRequiredMetadata(obj.metadata), 'required metadata incomplete');
  assert(obj.metadata.runtime_mode === 'cli-nonphi', 'runtime_mode provenance wrong');
  assert(obj.metadata.model_provider === 'claude' && obj.metadata.model_id === 'sonnet', 'model provenance wrong');
  assert(!!obj.metadata.immutable_audit_hash && !!obj.metadata.source_snapshot_hash, 'hashes missing');
});

// 17 — Generated objects are linked to source event/workflow/policies/forms.
test('17. Generated objects linked to source refs', () => {
  const obj = store.get(reportId)!;
  assert(obj.metadata.source_event_id === SNAPSHOT.eventId, 'event link missing');
  assert(obj.metadata.source_workflow_id === SNAPSHOT.workflowId, 'workflow link missing');
  assert(JSON.stringify(obj.metadata.source_policy_ids) === JSON.stringify(SNAPSHOT.policyIds), 'policy links missing');
  assert(JSON.stringify(obj.metadata.source_form_ids) === JSON.stringify(SNAPSHOT.requiredFormIds), 'form links missing');
  assert(obj.metadata.source_snapshot_hash === snap.snapshotHash(SNAPSHOT), 'snapshot hash mismatch');
});

// 18 — Brad Action Report records every created/updated object.
test('18. Brad Action Report records created/updated objects', () => {
  const created = [reportId, 'brad-x-1', 'brad-x-2'];
  const obj = svc.writeActionReport(REGULAR, SNAPSHOT, {
    inspected: ['evt-qapi-2026-q2'], generated: created, updated: ['evt-qapi-2026-q2'],
    refusedToUpdate: ['pol-qapi-001'], blockedWriteReasons: ['direct core mutation blocked'],
    objectIdsCreated: created, eventIdsAffected: ['evt-qapi-2026-q2'],
  });
  const c = obj.content as { objectIdsCreated: string[]; eventIdsAffected: string[]; refusedToUpdate: string[] };
  assert(JSON.stringify(c.objectIdsCreated) === JSON.stringify(created), 'created ids not recorded');
  assert(c.eventIdsAffected.includes('evt-qapi-2026-q2'), 'affected events not recorded');
  assert(c.refusedToUpdate.includes('pol-qapi-001'), 'refusals not recorded');
});

// ── summary ───────────────────────────────────────────────────────────────
console.log(`\n=== ${passed}/${passed + failed} passed ===`);
try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch { /* best effort */ }
if (failed > 0) {
  console.log('SUPER ADMIN / GENERATED-OBJECT TESTS FAILED');
  process.exit(1);
}
console.log('ALL SUPER ADMIN / GENERATED-OBJECT TESTS PASSED');
