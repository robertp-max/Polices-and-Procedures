/**
 * Phase 2B (hardened) — durable lifecycle store: CAS, idempotency, store-owned
 * completion invariants, reservation-gated journal, record validation, and
 * DynamoDB error classification. Behavioral proof via the in-memory adapter
 * (no live AWS, no JSONL, no .cache).
 */
import { describe, expect, it } from 'vitest';
import { InMemoryAccountLifecycleStore } from './inMemoryStore.js';
import { UnavailableAccountLifecycleStore } from './unavailableStore.js';
import {
  assertLifecycleMutationAvailable, initializeVerifiedActiveLifecycle, validateIdempotencyKey,
  computeRequestFingerprint, parseLifecycleRecord, parseOperationRecord, classifyDynamoError,
  DYNAMO_LIFECYCLE_CAPS, hashIdempotencyKey,
  type AccountLifecycleStore, type BeginLifecycleTransitionInput,
} from './store.js';
import type { AccountLifecycleRecord, LegacyLifecycleAssessment, LifecycleOperationRecord, LifecycleStep } from './types.js';

const deps = { nowIso: () => '2027-01-01T00:00:00.000Z' };
const UID = 'usr-1';
const store = () => new InMemoryAccountLifecycleStore(deps);

async function seedActive(s: AccountLifecycleStore, email = 'robertp+phase7uat@careindeed.com') {
  return s.initializeLifecycle({ canonicalUserId: UID, providerUsername: 'cognito-user-1', normalizedEmail: email, initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' });
}
const suspendInput = (over: Partial<BeginLifecycleTransitionInput> = {}): BeginLifecycleTransitionInput => ({
  canonicalUserId: UID, action: 'suspend', expectedFromStatus: 'active', transitionalStatus: 'suspending',
  desiredFinalStatus: 'suspended', expectedLifecycleVersion: 1, idempotencyKey: 'idem-key-1', operationId: 'op-1',
  actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', correlationId: 'corr-1', ...over,
});
const SUSPEND_ADVANCE: LifecycleStep[] = ['canonical_transition_projected', 'provider_disabled', 'provider_sessions_revoked', 'registration_projected', 'canonical_final_projected', 'completion_audited'];

/** Advance an op through all required suspend steps (except final). Returns last op version. */
async function advanceSuspend(s: AccountLifecycleStore, opId = 'op-1', lifeV = 2): Promise<number> {
  let opV = 1;
  for (const step of SUSPEND_ADVANCE) {
    await s.advanceOperation({ canonicalUserId: UID, operationId: opId, expectedOperationVersion: opV, expectedLifecycleVersion: lifeV, step });
    opV += 1;
  }
  return opV;
}

describe('capabilities + mutation gate', () => {
  it('in-memory advertises CAS + consistent reads but is not production eligible', () => {
    const c = store().capabilities();
    expect(c.compareAndSet).toBe(true);
    expect(c.readAfterWriteConsistent).toBe(true);
    expect(c.productionEligible).toBe(false);
  });
  it('gate: 503 for unavailable', () => {
    let caught: { status?: number; code?: string } | null = null;
    try { assertLifecycleMutationAvailable(new UnavailableAccountLifecycleStore()); } catch (e) { caught = e as never; }
    expect(caught).toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE' });
  });
  it('gate REQUIRES readAfterWriteConsistent', () => {
    const noConsistent = { capabilities: () => ({ ...DYNAMO_LIFECYCLE_CAPS, readAfterWriteConsistent: false }) } as AccountLifecycleStore;
    expect(() => assertLifecycleMutationAvailable(noConsistent)).toThrow();
    const capable = { capabilities: () => DYNAMO_LIFECYCLE_CAPS } as AccountLifecycleStore;
    expect(() => assertLifecycleMutationAvailable(capable)).not.toThrow();
  });
  it('unavailable adapter fails closed on mutation and reads null', async () => {
    const u = new UnavailableAccountLifecycleStore();
    await expect(u.beginTransition(suspendInput())).rejects.toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE' });
    await expect(u.getLifecycle(UID)).resolves.toBeNull();
  });
});

describe('initialization', () => {
  it('is keyed by canonical id, normalizes email internally, and preserves the plus-tag', async () => {
    const s = store();
    const rec = await s.initializeLifecycle({ canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: '  RobertP+Phase7UAT@CareIndeed.com ', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' });
    expect(rec.normalizedEmail).toBe('robertp+phase7uat@careindeed.com');
  });
  it('rejects an empty canonical id', async () => {
    await expect(store().initializeLifecycle({ canonicalUserId: '', providerUsername: 'c1', normalizedEmail: 'a@b.com', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' })).rejects.toMatchObject({ status: 400 });
  });
  it('is conditional — cannot overwrite', async () => {
    const s = store(); await seedActive(s);
    await expect(seedActive(s)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_ALREADY_EXISTS' });
  });
  it('verified-active helper: safe → ok; unsafe → 409', async () => {
    const s = store();
    const ok = await initializeVerifiedActiveLifecycle(s, { canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', actorUserId: 'admin-1', assessment: { primary: 'consistent', issues: [], safeToAutoInitialize: true } });
    expect(ok.initializationSource).toBe('verified_legacy_active');
    await expect(initializeVerifiedActiveLifecycle(store(), { canonicalUserId: 'usr-2', providerUsername: 'c1', normalizedEmail: 'b@careindeed.com', actorUserId: 'admin-1', assessment: { primary: 'provider_state_unknown', issues: ['provider_state_unknown'], safeToAutoInitialize: false } as LegacyLifecycleAssessment })).rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_INIT_NOT_SAFE' });
  });
});

describe('beginTransition', () => {
  it('reserves + transitions (global-deny) and records the hashed key + transitional status', async () => {
    const s = store(); await seedActive(s);
    const r = await s.beginTransition(suspendInput());
    expect(r.lifecycle.status).toBe('suspending');
    expect(r.lifecycle.currentOperationId).toBe('op-1');
    expect(r.operation.transitionalStatus).toBe('suspending');
    expect(r.operation.idempotencyKeyHash).toBe(hashIdempotencyKey('idem-key-1'));
  });
  it('same key/same request → replay; different request → 409', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());
    expect((await s.beginTransition(suspendInput())).idempotentReplay).toBe(true);
    await expect(s.beginTransition(suspendInput({ reason: 'totally different reason' }))).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_CONFLICT' });
  });
  it('stale version / in-progress / concurrent → exactly one active op', async () => {
    const s = store(); await seedActive(s);
    await expect(s.beginTransition(suspendInput({ expectedLifecycleVersion: 99 }))).rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_VERSION_CONFLICT' });
    await s.beginTransition(suspendInput());
    await expect(s.beginTransition(suspendInput({ idempotencyKey: 'k2', operationId: 'op-2', expectedLifecycleVersion: 2 }))).rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_OPERATION_IN_PROGRESS' });
  });
  it('suspend/reactivate race: only the valid transition from current state wins', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());
    await expect(s.beginTransition({ ...suspendInput(), action: 'reactivate', expectedFromStatus: 'suspended', transitionalStatus: 'reactivating', desiredFinalStatus: 'active', idempotencyKey: 'k3', operationId: 'op-3', expectedLifecycleVersion: 2 })).rejects.toMatchObject({ status: 409 });
  });
});

describe('journal advancement is store-owned + reservation-gated', () => {
  async function begun() { const s = store(); await seedActive(s); await s.beginTransition(suspendInput()); return s; }
  it.each(['intent_recorded', 'global_deny_committed', 'final_state_committed'] as LifecycleStep[])('rejects manually advancing boundary step %s', async (step) => {
    const s = await begun();
    await expect(s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step })).rejects.toMatchObject({ status: 400 });
  });
  it('rejects a step from the wrong action (provider_enabled during suspend)', async () => {
    const s = await begun();
    await expect(s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step: 'provider_enabled' })).rejects.toMatchObject({ status: 400 });
  });
  it('appends allowed steps (dedup no-op), keeps status running, and cannot advance a completed op', async () => {
    const s = await begun();
    const a1 = await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step: 'provider_disabled' });
    expect(a1.status).toBe('running');
    const dup = await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: a1.operationVersion, expectedLifecycleVersion: 2, step: 'provider_disabled' });
    expect(dup.operationVersion).toBe(a1.operationVersion); // idempotent, no bump
  });
  it('a detached/stale operation cannot advance (reservation lost)', async () => {
    const s = await begun();
    await advanceSuspend(s); await s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 7, expectedLifecycleVersion: 2, finalStatus: 'suspended' });
    // op-1 is no longer the current reservation → advance fails
    await expect(s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 8, expectedLifecycleVersion: 3, step: 'provider_disabled' })).rejects.toBeTruthy();
  });
});

describe('completion is store-owned', () => {
  async function begun() { const s = store(); await seedActive(s); await s.beginTransition(suspendInput()); return s; }
  it('cannot complete before every required step (provider disable, session revoke, projections, audit)', async () => {
    const s = await begun();
    // only some steps done
    await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step: 'provider_disabled' });
    await expect(s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended' })).rejects.toMatchObject({ status: 400 });
  });
  it('atomically appends final_state_committed, clears reservation, records lastCompletedOperationId', async () => {
    const s = await begun();
    const opV = await advanceSuspend(s);
    const done = await s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: opV, expectedLifecycleVersion: 2, finalStatus: 'suspended' });
    expect(done.operation.completedSteps).toContain('final_state_committed');
    expect(done.lifecycle.status).toBe('suspended');
    expect(done.lifecycle.currentOperationId).toBeUndefined();
    expect(done.lifecycle.lastCompletedOperationId).toBe('op-1');
  });
  it('rejects a finalStatus that does not match the operation desiredStatus', async () => {
    const s = await begun(); const opV = await advanceSuspend(s);
    await expect(s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: opV, expectedLifecycleVersion: 2, finalStatus: 'active' })).rejects.toMatchObject({ status: 400 });
  });
  it('reconciliation_required retains steps and keeps the account reserved+denied', async () => {
    const s = await begun();
    const r = await s.markReconciliationRequired({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, failedStep: 'provider_disabled', failureCode: 'COGNITO_DISABLE_FAILED' });
    expect(r.lifecycle.status).toBe('reconciliation_required');
    expect(r.lifecycle.currentOperationId).toBe('op-1');
    expect(r.operation.completedSteps).toContain('global_deny_committed');
  });
});

describe('record validation (fail-closed)', () => {
  const good: AccountLifecycleRecord = { canonicalUserId: UID, provider: 'cognito', providerUsername: 'c1', normalizedEmail: 'a@b.com', status: 'active', version: 1, initializationSource: 'verified_legacy_active', createdAt: 't', createdBy: 'x', updatedAt: 't', updatedBy: 'x' };
  it('parseLifecycleRecord accepts a valid record, rejects malformed → 503', () => {
    expect(parseLifecycleRecord(good, UID).status).toBe('active');
    expect(() => parseLifecycleRecord({ ...good, status: 'weird' }, UID)).toThrow(/RECORD_INVALID|malformed/i);
    expect(() => parseLifecycleRecord({ ...good, version: 0 }, UID)).toThrow();
    expect(() => parseLifecycleRecord(good, 'different-id')).toThrow(); // id mismatch
    expect(() => parseLifecycleRecord(null, UID)).toThrow();
  });
  it('parseOperationRecord rejects malformed op → 503', () => {
    const op = { operationId: 'op-1', targetUserId: UID, action: 'suspend', status: 'running', operationVersion: 1, completedSteps: ['intent_recorded'], transitionalStatus: 'suspending', desiredStatus: 'suspended', requestFingerprint: 'fp', idempotencyKeyHash: 'h' };
    expect(parseOperationRecord(op, UID, 'op-1').action).toBe('suspend');
    expect(() => parseOperationRecord({ ...op, completedSteps: ['bogus_step'] }, UID, 'op-1')).toThrow();
    expect(() => parseOperationRecord({ ...op }, UID, 'other-op')).toThrow(); // op id mismatch
    expect(() => parseOperationRecord({ ...op, targetUserId: 'other' }, UID, 'op-1')).toThrow();
  });
});

describe('classifyDynamoError', () => {
  const cancel = (codes: string[]) => Object.assign(new Error('tx'), { name: 'TransactionCanceledException', CancellationReasons: codes.map((c) => ({ Code: c })) });
  it('bare conditional check → 409 version conflict', () => {
    expect(classifyDynamoError(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' })).status).toBe(409);
  });
  it('throttling → 503', () => {
    expect(classifyDynamoError(Object.assign(new Error(), { name: 'ProvisionedThroughputExceededException' })).status).toBe(503);
  });
  it('transaction conflict (contention) is retryable, not a version conflict lie', () => {
    const e = classifyDynamoError(cancel(['None', 'None', 'TransactionConflict']), ['idempotency', 'operation', 'lifecycle']);
    expect(e.code).toBe('ACCOUNT_LIFECYCLE_CONTENDED');
  });
  it('slot attribution: idempotency-slot conditional → idempotency conflict; operation-slot → op version conflict; lifecycle-slot → version conflict', () => {
    expect(classifyDynamoError(cancel(['ConditionalCheckFailed', 'None', 'None']), ['idempotency', 'operation', 'lifecycle']).code).toBe('IDEMPOTENCY_KEY_CONFLICT');
    expect(classifyDynamoError(cancel(['ConditionalCheckFailed', 'None']), ['operation', 'lifecycle']).code).toBe('LIFECYCLE_OPERATION_VERSION_CONFLICT');
    expect(classifyDynamoError(cancel(['None', 'ConditionalCheckFailed']), ['operation', 'lifecycle']).code).toBe('ACCOUNT_LIFECYCLE_VERSION_CONFLICT');
  });
  it('unknown cancellation reason fails closed as store error (500), never a version conflict', () => {
    const e = classifyDynamoError(cancel(['SomethingWeird']), ['operation', 'lifecycle']);
    expect(e.status).toBe(500);
    expect(e.code).not.toBe('ACCOUNT_LIFECYCLE_VERSION_CONFLICT');
  });
});

describe('idempotency + secret hygiene', () => {
  it('validateIdempotencyKey rejects empty/too-long/control chars', () => {
    expect(() => validateIdempotencyKey('')).toThrow();
    expect(() => validateIdempotencyKey('x'.repeat(201))).toThrow();
    expect(() => validateIdempotencyKey('ab')).toThrow();
  });
  it('fingerprint stable for normalized reason, changes for material intent', () => {
    const base = { action: 'suspend' as const, targetUserId: UID, actorUserId: 'a', reason: 'Policy Violation', expectedFromStatus: 'active' as const, transitionalStatus: 'suspending' as const };
    expect(computeRequestFingerprint(base)).toBe(computeRequestFingerprint({ ...base, reason: ' policy   violation ' }));
    expect(computeRequestFingerprint(base)).not.toBe(computeRequestFingerprint({ ...base, targetUserId: 'other' }));
  });
  it('operation record stores the hash, never the raw key or a placeholder', async () => {
    const s = store(); await seedActive(s);
    const r = await s.beginTransition(suspendInput({ idempotencyKey: 'super-secret-key' }));
    const json = JSON.stringify(r.operation);
    expect(json).not.toContain('super-secret-key');
    expect(json).not.toContain('(stored as hash)');
    expect((r.operation as LifecycleOperationRecord).idempotencyKeyHash).toBe(hashIdempotencyKey('super-secret-key'));
    expect(json).not.toMatch(/token|password|authorization|cookie/i);
  });
});
