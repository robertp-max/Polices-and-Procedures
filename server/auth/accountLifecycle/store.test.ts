/**
 * Phase 2B — durable lifecycle store: CAS, idempotency, one-active-operation,
 * capability gate, safe initialization. Behavioral proof via the in-memory
 * adapter (no live AWS, no JSONL, no .cache).
 */
import { describe, expect, it } from 'vitest';
import { InMemoryAccountLifecycleStore } from './inMemoryStore.js';
import { UnavailableAccountLifecycleStore } from './unavailableStore.js';
import {
  assertLifecycleMutationAvailable, initializeVerifiedActiveLifecycle,
  validateIdempotencyKey, computeRequestFingerprint, DYNAMO_LIFECYCLE_CAPS,
  type AccountLifecycleStore, type BeginLifecycleTransitionInput,
} from './store.js';
import type { LegacyLifecycleAssessment } from './types.js';

const deps = { nowIso: () => '2027-01-01T00:00:00.000Z' };
const UID = 'usr-1';
const store = () => new InMemoryAccountLifecycleStore(deps);

async function seedActive(s: AccountLifecycleStore, email = 'robertp+phase7uat@careindeed.com') {
  return s.initializeLifecycle({
    canonicalUserId: UID, providerUsername: 'cognito-user-1', normalizedEmail: email,
    initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1',
  });
}
const suspendInput = (over: Partial<BeginLifecycleTransitionInput> = {}): BeginLifecycleTransitionInput => ({
  canonicalUserId: UID, action: 'suspend', expectedFromStatus: 'active', transitionalStatus: 'suspending',
  desiredFinalStatus: 'suspended', expectedLifecycleVersion: 1, idempotencyKey: 'idem-key-1', operationId: 'op-1',
  actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', correlationId: 'corr-1', ...over,
});

describe('capabilities + mutation gate', () => {
  it('in-memory advertises CAS but is not production eligible', () => {
    const c = store().capabilities();
    expect(c.compareAndSet).toBe(true);
    expect(c.oneActiveOperationPerTarget).toBe(true);
    expect(c.productionEligible).toBe(false);
  });
  it('unavailable adapter fails closed on every mutation (503) and reads null', async () => {
    const u = new UnavailableAccountLifecycleStore();
    expect(u.capabilities().provider).toBe('unavailable');
    await expect(u.beginTransition(suspendInput())).rejects.toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE' });
    await expect(u.getLifecycle(UID)).resolves.toBeNull();
  });
  it('assertLifecycleMutationAvailable: 503 for unavailable, ok for a fully-capable store', () => {
    let caught: { status?: number; code?: string } | null = null;
    try { assertLifecycleMutationAvailable(new UnavailableAccountLifecycleStore()); } catch (e) { caught = e as { status?: number; code?: string }; }
    expect(caught).toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE' });
    const capable = { capabilities: () => DYNAMO_LIFECYCLE_CAPS } as AccountLifecycleStore;
    expect(() => assertLifecycleMutationAvailable(capable)).not.toThrow();
  });
});

describe('initialization', () => {
  it('is keyed by canonical user id and preserves a plus-tagged email unchanged', async () => {
    const s = store();
    const rec = await seedActive(s);
    expect(rec.canonicalUserId).toBe(UID);
    expect(rec.normalizedEmail).toBe('robertp+phase7uat@careindeed.com');
    expect(rec.version).toBe(1);
    expect((await s.getLifecycle(UID))?.canonicalUserId).toBe(UID);
  });
  it('is conditional — cannot overwrite an existing record', async () => {
    const s = store(); await seedActive(s);
    await expect(seedActive(s)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_ALREADY_EXISTS' });
  });
  it('verified-active helper initializes only for a safe assessment', async () => {
    const s = store();
    const safe: LegacyLifecycleAssessment = { primary: 'consistent', issues: [], safeToAutoInitialize: true };
    const rec = await initializeVerifiedActiveLifecycle(s, {
      canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', actorUserId: 'admin-1', assessment: safe,
    });
    expect(rec.initializationSource).toBe('verified_legacy_active');
  });
  it.each([
    ['provider unknown', { primary: 'provider_state_unknown', issues: ['provider_state_unknown'], safeToAutoInitialize: false }],
    ['consistent_deny', { primary: 'consistent_deny', issues: [], safeToAutoInitialize: false }],
    ['conflict', { primary: 'conflict_active_vs_suspended', issues: ['conflict_active_vs_suspended'], safeToAutoInitialize: false }],
  ])('verified-active helper refuses an unsafe assessment (%s)', async (_n, assessment) => {
    const s = store();
    await expect(initializeVerifiedActiveLifecycle(s, {
      canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', actorUserId: 'admin-1',
      assessment: assessment as LegacyLifecycleAssessment,
    })).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_INIT_NOT_SAFE' });
  });
});

describe('beginTransition — atomic intent + global-deny reservation', () => {
  it('claims idempotency, writes op intent, and reserves+transitions the lifecycle', async () => {
    const s = store(); await seedActive(s);
    const r = await s.beginTransition(suspendInput());
    expect(r.idempotentReplay).toBe(false);
    expect(r.lifecycle.status).toBe('suspending');      // immediate global-deny point
    expect(r.lifecycle.currentOperationId).toBe('op-1');
    expect(r.lifecycle.version).toBe(2);
    expect(r.operation.completedSteps).toEqual(['intent_recorded', 'global_deny_committed']);
    expect(r.operation.operationVersion).toBe(1);
  });
  it('same key + same request → idempotent replay (no new op, no version bump)', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());
    const again = await s.beginTransition(suspendInput());
    expect(again.idempotentReplay).toBe(true);
    expect(again.lifecycle.version).toBe(2);
  });
  it('same key + different request fingerprint → 409 IDEMPOTENCY_KEY_CONFLICT', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());
    await expect(s.beginTransition(suspendInput({ reason: 'a completely different reason' })))
      .rejects.toMatchObject({ status: 409, code: 'IDEMPOTENCY_KEY_CONFLICT' });
  });
  it('stale lifecycle version → 409 version conflict', async () => {
    const s = store(); await seedActive(s);
    await expect(s.beginTransition(suspendInput({ expectedLifecycleVersion: 99 })))
      .rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_VERSION_CONFLICT' });
  });
  it('a second different-key begin while one is in progress → 409 operation in progress (exactly one active op)', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());
    await expect(s.beginTransition(suspendInput({ idempotencyKey: 'idem-2', operationId: 'op-2', expectedLifecycleVersion: 2 })))
      .rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_OPERATION_IN_PROGRESS' });
  });
  it('concurrent different-key begins resolve to exactly one active operation', async () => {
    const s = store(); await seedActive(s);
    const results = await Promise.allSettled([
      s.beginTransition(suspendInput({ idempotencyKey: 'k1', operationId: 'opA' })),
      s.beginTransition(suspendInput({ idempotencyKey: 'k2', operationId: 'opB' })),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect((await s.getLifecycle(UID))?.currentOperationId).toBeTruthy();
  });
  it('suspend/reactivate race: only the transition valid from the current state wins', async () => {
    const s = store(); await seedActive(s);
    await s.beginTransition(suspendInput());   // → suspending v2
    // reactivate expects from 'suspended' but state is 'suspending' → conflict
    await expect(s.beginTransition({ ...suspendInput(), action: 'reactivate', expectedFromStatus: 'suspended', transitionalStatus: 'reactivating', desiredFinalStatus: 'active', idempotencyKey: 'k3', operationId: 'opC', expectedLifecycleVersion: 2 }))
      .rejects.toMatchObject({ status: 409 });
  });
});

describe('operation journal + completion', () => {
  async function begun() { const s = store(); await seedActive(s); await s.beginTransition(suspendInput()); return s; }

  it('advance appends typed steps (append-only, de-duplicated) with op-version CAS', async () => {
    const s = await begun();
    const a1 = await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, step: 'provider_disabled' });
    expect(a1.operationVersion).toBe(2);
    expect(a1.completedSteps).toContain('provider_disabled');
    const a2 = await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, step: 'provider_disabled' }); // dup
    expect(a2.completedSteps.filter((x) => x === 'provider_disabled')).toHaveLength(1);
    // stale op-version
    await expect(s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, step: 'provider_sessions_revoked' }))
      .rejects.toMatchObject({ code: 'LIFECYCLE_OPERATION_VERSION_CONFLICT' });
  });
  it('reconciliation_required retains completed steps and keeps the account reserved+denied', async () => {
    const s = await begun();
    const r = await s.markReconciliationRequired({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, failedStep: 'provider_disabled', failureCode: 'COGNITO_DISABLE_FAILED' });
    expect(r.operation.status).toBe('reconciliation_required');
    expect(r.operation.completedSteps).toContain('global_deny_committed');
    expect(r.lifecycle.status).toBe('reconciliation_required');
    expect(r.lifecycle.currentOperationId).toBe('op-1'); // still reserved for retry
  });
  it('complete clears the reservation, records lastCompletedOperationId, requires steps + matching final status', async () => {
    const s = await begun();
    await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, step: 'final_state_committed' });
    // wrong final status
    await expect(s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'active', requiredSteps: [] }))
      .rejects.toMatchObject({ status: 400 });
    const done = await s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended', requiredSteps: ['global_deny_committed', 'final_state_committed'] });
    expect(done.lifecycle.status).toBe('suspended');
    expect(done.lifecycle.currentOperationId).toBeUndefined();
    expect(done.lifecycle.lastCompletedOperationId).toBe('op-1');
    // a stale worker cannot re-complete / clear again
    await expect(s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended', requiredSteps: [] }))
      .rejects.toBeTruthy();
  });
  it('a full suspend then reactivate lifecycle completes', async () => {
    const s = await begun();
    await s.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, step: 'final_state_committed' });
    await s.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended', requiredSteps: [] });
    const react = await s.beginTransition({ ...suspendInput(), action: 'reactivate', expectedFromStatus: 'suspended', transitionalStatus: 'reactivating', desiredFinalStatus: 'active', idempotencyKey: 'react-1', operationId: 'op-2', expectedLifecycleVersion: 3 });
    expect(react.lifecycle.status).toBe('reactivating');
  });
});

describe('idempotency + fingerprint + secret hygiene', () => {
  it('validateIdempotencyKey rejects empty / too-long / control chars', () => {
    expect(() => validateIdempotencyKey('')).toThrow();
    expect(() => validateIdempotencyKey('x'.repeat(201))).toThrow();
    expect(() => validateIdempotencyKey('a b')).toThrow();
    expect(validateIdempotencyKey('ok-key')).toBe('ok-key');
  });
  it('fingerprint is stable for equivalent normalized reason, changes for material intent', () => {
    const base = { action: 'suspend' as const, targetUserId: UID, actorUserId: 'a', reason: 'Policy Violation', expectedFromStatus: 'active' as const, transitionalStatus: 'suspending' as const };
    expect(computeRequestFingerprint(base)).toBe(computeRequestFingerprint({ ...base, reason: '  policy   violation ' }));
    expect(computeRequestFingerprint(base)).not.toBe(computeRequestFingerprint({ ...base, action: 'reactivate', transitionalStatus: 'reactivating' }));
    expect(computeRequestFingerprint(base)).not.toBe(computeRequestFingerprint({ ...base, targetUserId: 'other' }));
  });
  it('operation record stores no secrets and never the raw idempotency key', async () => {
    const s = store(); await seedActive(s);
    const r = await s.beginTransition(suspendInput({ idempotencyKey: 'super-secret-key-value' }));
    const json = JSON.stringify(r.operation);
    expect(json).not.toContain('super-secret-key-value');
    expect(r.operation.idempotencyKey).toBe('(stored as hash)');
    expect(json).not.toMatch(/token|password|authorization|cookie|\bsub\b/i);
  });
});
