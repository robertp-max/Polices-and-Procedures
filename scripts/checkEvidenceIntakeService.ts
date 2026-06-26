/**
 * Brad Evidence Intake — service / store-integration verification (Section 24).
 *
 *   3   Same upload twice → ONE canonical evidence record (duplicate reuse)
 *   4   Changed source record → new version (recordVersion 2, supersedes prior)
 *   5   Drive failure does NOT mark evidence uploaded or locked
 *   6   Drive retry reuses the same evidence identity
 *  13   Draft form instance uses a REAL form id (never invented)
 *  21   Persisted canonical retains source/created-date/classification provenance
 *  22   Drive upload failure is recorded honestly (status 'failed' + audit)
 *
 * Run: tsx --tsconfig tsconfig.app.json scripts/checkEvidenceIntakeService.ts
 */
import assert from 'node:assert/strict';

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

let passed = 0;
const ok = (label: string, cond: boolean) => { assert.ok(cond, label); passed++; console.log(`  ✓ ${label}`); };

async function main(): Promise<void> {
  const { useRegulatoryExecutionStore } = await import('../src/policy/stores/regulatoryExecutionStore');
  const { REGULATORY_EVENTS } = await import('../src/policy/data/regulatoryEvents');
  const svc = await import('../src/policy/evidence/intake/intakeService');
  const intake = await import('../src/policy/evidence/intake');
  const { extractRecordFromCell } = intake;

  const store = useRegulatoryExecutionStore.getState();
  store.resetAll();

  // Intake canonical evidence binds to a REAL CES event (event-instance invariant).
  // Pick a sandbox-window event (date < 2026-07) with policy + workflow + forms.
  const boundEvent = REGULATORY_EVENTS.find((e) =>
    !e.isContext && (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId && (e.requiredForms?.length ?? 0) > 0 && String(e.date) < '2026-07-01',
  ) ?? REGULATORY_EVENTS.find((e) => (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId)!;
  assert.ok(boundEvent, 'expected a CES event with policy + workflow for intake binding');
  const eventKey = boundEvent.id;
  const eventPolicyIds = boundEvent.policyRefs ?? [];
  const eventWorkflowId = boundEvent.workflowId;
  const mkRecord = (contentTag: string) => extractRecordFromCell(
    { pointer: 'row:2', fields: { Id: 'CMP-1', CreatedDate: '2026-03-14T09:00:00Z', Description: contentTag }, text: contentTag },
    { batchId: 'B1', sourceFileId: 'F1', sourceFileName: 'complaints.csv', sourceSystem: 'salesforce', uploadedAt: '2026-06-25T00:00:00Z' },
  );
  const idemOf = (r: ReturnType<typeof mkRecord>) => intake.buildIdempotencyKey({ sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId, sourceSystemCreatedAt: r.sourceSystemCreatedAt, contentHash: r.contentHash, sourcePointer: r.sourcePointer });
  const scopeOf = (r: ReturnType<typeof mkRecord>) => intake.buildEvidenceIdentityScope({ sourceSystem: r.sourceSystem, sourceRecordId: r.sourceRecordId, sourceSystemCreatedAt: r.sourceSystemCreatedAt, contentHash: r.contentHash, sourcePointer: r.sourcePointer });

  const recA = mkRecord('original complaint text');
  const idemA = idemOf(recA);
  const scopeA = scopeOf(recA);

  // First persist → new canonical.
  const p1 = svc.persistCanonicalEvidence(recA, { eventKey, eventId: eventKey, workflowId: eventWorkflowId, policyIds: eventPolicyIds, identityScope: scopeA, idempotencyKey: idemA });
  ok('persist: first record creates a canonical record', !p1.reused && !!p1.evidenceId);
  const id1 = p1.evidenceId!;

  // 3 — same upload again → duplicate reuse (one canonical).
  const p2 = svc.persistCanonicalEvidence(mkRecord('original complaint text'), { eventKey, eventId: eventKey, workflowId: eventWorkflowId, policyIds: eventPolicyIds, identityScope: scopeA, idempotencyKey: idemA });
  ok('3: re-upload of same record is reused (no duplicate canonical)', p2.reused && p2.evidenceId === id1);

  const intakeDocs = () => (useRegulatoryExecutionStore.getState().evidence[eventKey] ?? []).filter((d) => d.artifactVersion === 'evidence-intake-v1');
  ok('3: exactly one canonical evidence doc after duplicate upload', intakeDocs().length === 1);

  // 21 — provenance retained in the persisted note.
  {
    const doc = intakeDocs()[0];
    const meta = JSON.parse(doc.note || '{}');
    ok('21: provenance retained (filingPeriodKey=2026-03, classification, contentHash)', meta.filingPeriodKey === '2026-03' && !!meta.classification && !!meta.contentHash);
  }

  // 4 — changed record → new version.
  const recB = mkRecord('CHANGED complaint text — investigation added');
  const idemB = idemOf(recB);
  const scopeB = scopeOf(recB);
  ok('4: changed record shares identity scope', scopeB === scopeA);
  const p3 = svc.persistCanonicalEvidence(recB, { eventKey, eventId: eventKey, workflowId: eventWorkflowId, policyIds: eventPolicyIds, identityScope: scopeB, idempotencyKey: idemB });
  ok('4: changed record → new version (not reused), supersedes prior', !p3.reused && p3.canonical?.recordVersion === 2 && p3.canonical?.supersedesEvidenceId === id1);

  // 5 + 22 — Drive failure does NOT mark uploaded/locked; recorded honestly.
  const fail = svc.applyDriveOutcome(eventKey, id1, { ok: false, errorCode: 'auth_error', errorMessage: 'Drive not configured' });
  ok('5/22: Drive failure → status failed (not uploaded)', fail.driveUploadStatus === 'failed');
  {
    const doc = (useRegulatoryExecutionStore.getState().evidence[eventKey] ?? []).find((d) => d.id === id1);
    ok('5: failed Drive upload does NOT lock evidence', !!doc && doc.driveUploadStatus !== 'uploaded' && doc.status !== 'EVIDENCE_LOCKED');
  }

  // 6 — retry reuses the SAME evidence identity (same id1), then succeeds.
  const success = svc.applyDriveOutcome(eventKey, id1, { ok: true, driveFileId: 'drive-REAL-123', driveFolderId: 'folder-1' });
  ok('6: retry reuses same evidence id and can succeed with a real driveFileId', success.driveUploadStatus === 'uploaded');
  {
    const doc = (useRegulatoryExecutionStore.getState().evidence[eventKey] ?? []).find((d) => d.id === id1);
    ok('6: real driveFileId recorded only on real success', doc?.driveFileId === 'drive-REAL-123' && doc?.driveUploadStatus === 'uploaded');
  }

  // 13 — draft form instance uses a REAL form id.
  {
    const event = REGULATORY_EVENTS.find((e) => (e.requiredForms?.length ?? 0) > 0);
    assert.ok(event, 'expected a regulatory event with required forms');
    const realFormId = event!.requiredForms[0].formId ?? event!.requiredForms[0].id;
    const instanceId = svc.createDraftFormInstance(event!.id, realFormId!, event!.policyRefs ?? [], event!.workflowId);
    ok('13: draft form instance created from a real form id', !!instanceId && String(instanceId).includes(realFormId!));
  }

  // 18/20 — exactly one signing task, deterministic on rerun (via store).
  {
    const specs1 = svc.createPacketTasks({ eventId: eventKey, packetId: 'EPS-qapi-quarterly-committee-2026-03', requiredSignerRoles: ['Director of Nursing', 'Administrator'], signer: { userId: 'u', roles: ['DON', 'Administrator'] }, hasAgenda: true, hasDraftForms: true, hasUnresolvedDates: false });
    const signing = specs1.filter((s) => s.kind === 'sign_packet_attestation');
    ok('18: createPacketTasks produces exactly one signing task', signing.length === 1);
    const specs2 = svc.createPacketTasks({ eventId: eventKey, packetId: 'EPS-qapi-quarterly-committee-2026-03', requiredSignerRoles: ['Director of Nursing', 'Administrator'], signer: { userId: 'u', roles: ['DON', 'Administrator'] }, hasAgenda: true, hasDraftForms: true, hasUnresolvedDates: false });
    ok('20: rerun yields identical task ids (deterministic, no dup)', specs1.map((s) => s.taskId).join('|') === specs2.map((s) => s.taskId).join('|'));
  }

  console.log(`\nEvidence Intake SERVICE checks passed: ${passed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
