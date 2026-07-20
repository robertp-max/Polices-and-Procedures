/**
 * Phase 2C — account-lifecycle orchestration service.
 *
 * Proves the safety-critical sequencing that makes suspension a real global deny:
 * durable deny BEFORE Cognito, gated side effects, partial-failure →
 * reconciliation (never false success), idempotent + crash-resumable, and the
 * fail-closed capability gate. Runs against a behaviorally-correct durable store
 * (the in-memory adapter — its CAS/idempotency/reservation semantics are proven
 * in store.test.ts — advertising durable capabilities so the gate passes) with
 * injected provider/projection/audit fakes. No live AWS, no JSONL, no .cache.
 */
import { describe, expect, it } from 'vitest';
import { InMemoryAccountLifecycleStore } from './inMemoryStore.js';
import { UnavailableAccountLifecycleStore } from './unavailableStore.js';
import { DYNAMO_LIFECYCLE_CAPS, type AccountLifecycleStore, type AccountLifecycleStoreCapabilities } from './store.js';
import {
  AccountLifecycleService,
  type LifecycleProviderClient, type LifecycleProjections, type LifecycleAuditSink,
  type LifecycleTransitionRequest,
} from './service.js';

const UID = 'usr-1';
const NOW = { nowIso: () => '2027-01-01T00:00:00.000Z' };

/** In-memory store that advertises durable capabilities so the service gate
 *  admits it. Behavior (CAS, idempotency, reservation) is the real in-memory
 *  adapter's, proven in store.test.ts. */
class DurableInMemoryStore extends InMemoryAccountLifecycleStore {
  capabilities(): AccountLifecycleStoreCapabilities { return DYNAMO_LIFECYCLE_CAPS; }
}

type FailMap = Partial<Record<string, () => Error>>;
function makeFakes(fail: FailMap = {}) {
  const calls: string[] = [];
  const hit = (label: string) => { calls.push(label); const f = fail[label]; if (f) throw f(); };
  const provider: LifecycleProviderClient = {
    async disableUser() { hit('provider.disableUser'); },
    async enableUser() { hit('provider.enableUser'); },
    async globalSignOut() { hit('provider.globalSignOut'); },
  };
  const projections: LifecycleProjections = {
    async projectCanonicalStatus(i) { hit(`canonical.denied=${i.denied}`); },
    async projectRegistrationStatus(i) { hit(`registration.disabled=${i.disabled}`); },
  };
  const audit: LifecycleAuditSink = {
    async record(e) { hit(`audit.${e.phase}`); },
  };
  return { calls, provider, projections, audit };
}

function build(opts: { fail?: FailMap; store?: AccountLifecycleStore } = {}) {
  const store = opts.store ?? new DurableInMemoryStore(NOW);
  const fakes = makeFakes(opts.fail);
  let n = 0;
  const svc = new AccountLifecycleService({
    store, provider: fakes.provider, projections: fakes.projections, audit: fakes.audit,
    newOperationId: () => `op-${(n += 1)}`, newCorrelationId: () => `corr-${n}`,
  });
  return { store, svc, ...fakes };
}

async function seedActive(store: AccountLifecycleStore) {
  await store.initializeLifecycle({
    canonicalUserId: UID, providerUsername: 'cognito-1', normalizedEmail: 'u@careindeed.com',
    initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1',
  });
}
const REQ: LifecycleTransitionRequest = {
  canonicalUserId: UID, actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com',
  reason: 'policy violation', idempotencyKey: 'idem-1',
};

const before = (calls: string[], a: string, b: string) => calls.indexOf(a) < calls.indexOf(b);

describe('suspend — happy path', () => {
  it('durably denies, disables + signs out Cognito, projects both planes, completes suspended', async () => {
    const { store, svc, calls } = build();
    await seedActive(store);
    const res = await svc.suspend(REQ);

    expect(res).toMatchObject({ action: 'suspend', finalStatus: 'suspended', resumed: false, postCommitAudit: 'completed' });
    const life = await store.getLifecycle(UID);
    expect(life?.status).toBe('suspended');
    expect(life?.currentOperationId).toBeUndefined(); // reservation cleared
    const op = await store.getOperation(UID, res.operationId);
    expect(op?.status).toBe('completed');
    expect(op?.completedSteps).toContain('final_state_committed');

    // All required side effects ran, in dependency order.
    expect(calls).toEqual([
      'canonical.denied=true', 'provider.disableUser', 'provider.globalSignOut',
      'registration.disabled=true', 'canonical.denied=true', 'audit.transition_ready', 'audit.completed',
    ]);
  });

  it('commits the durable deny BEFORE any Cognito call', async () => {
    // If beginTransition (deny) did not precede the provider call, a provider
    // failure could leave the account active — the exact defect Phase 2 fixes.
    const { store, svc } = build({ fail: { 'provider.disableUser': () => Object.assign(new Error('x'), { name: 'CognitoDisableFailed' }) } });
    await seedActive(store);
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED' });
    // The record is denied (reconciliation_required), never left active.
    const life = await store.getLifecycle(UID);
    expect(life?.status).toBe('reconciliation_required');
    expect(life?.currentOperationId).toBeDefined(); // still reserved
  });
});

describe('reactivate — happy path', () => {
  it('enables Cognito and restores both planes to active', async () => {
    const { store, svc, calls } = build();
    await seedActive(store);
    await svc.suspend(REQ);
    calls.length = 0;
    const res = await svc.reactivate({ ...REQ, idempotencyKey: 'idem-react', reason: 'appeal upheld' });

    expect(res).toMatchObject({ action: 'reactivate', finalStatus: 'active', postCommitAudit: 'completed' });
    expect((await store.getLifecycle(UID))?.status).toBe('active');
    expect(calls).toEqual([
      'canonical.denied=true', 'provider.enableUser', 'registration.disabled=false',
      'canonical.denied=false', 'audit.transition_ready', 'audit.completed',
    ]);
  });
});

describe('idempotency + resume', () => {
  it('a second suspend of an already-suspended user is an idempotent success', async () => {
    const { store, svc, calls } = build();
    await seedActive(store);
    await svc.suspend(REQ);
    calls.length = 0;
    const again = await svc.suspend({ ...REQ, idempotencyKey: 'different-key' });
    expect(again).toMatchObject({ finalStatus: 'suspended', resumed: true });
    expect(calls).toEqual([]); // nothing re-run
  });

  it('resumes an in-flight operation, skipping already-completed steps', async () => {
    const { store, svc, calls } = build();
    await seedActive(store);
    // Simulate a crash after the deny + first two side effects by driving the
    // store directly, leaving the operation reserved and in-flight.
    const begin = await store.beginTransition({
      canonicalUserId: UID, action: 'suspend', expectedFromStatus: 'active',
      transitionalStatus: 'suspending', desiredFinalStatus: 'suspended', expectedLifecycleVersion: 1,
      idempotencyKey: 'idem-crash', operationId: 'op-crash', actorUserId: 'admin-1',
      actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', correlationId: 'c-crash',
    });
    const lv = begin.lifecycle.version;
    const op1 = await store.advanceOperation({ canonicalUserId: UID, operationId: 'op-crash', expectedOperationVersion: begin.operation.operationVersion, expectedLifecycleVersion: lv, step: 'canonical_transition_projected' });
    await store.advanceOperation({ canonicalUserId: UID, operationId: 'op-crash', expectedOperationVersion: op1.operationVersion, expectedLifecycleVersion: lv, step: 'provider_disabled' });

    const res = await svc.suspend(REQ); // resumes op-crash
    expect(res).toMatchObject({ finalStatus: 'suspended', resumed: true, operationId: 'op-crash' });
    expect((await store.getLifecycle(UID))?.status).toBe('suspended');
    // Already-done steps are NOT re-run; only the remaining ones fire.
    expect(calls).not.toContain('provider.disableUser');
    expect(calls).toContain('provider.globalSignOut');
    expect(calls).toContain('registration.disabled=true');
  });
});

describe('partial failure → reconciliation (never false success)', () => {
  it('a Cognito sign-out failure marks the op reconciliation_required at the failed step', async () => {
    const { store, svc } = build({ fail: { 'provider.globalSignOut': () => Object.assign(new Error('x'), { name: 'SignOutFailed' }) } });
    await seedActive(store);
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED' });
    const life = await store.getLifecycle(UID);
    expect(life?.status).toBe('reconciliation_required');
    const op = await store.getOperation(UID, life!.currentOperationId!);
    expect(op?.status).toBe('reconciliation_required');
    expect(op?.failedStep).toBe('provider_sessions_revoked');
    expect(op?.failureCode).toContain('provider_sessions_revoked');
    // provider_disabled succeeded and is retained; registration was never reached.
    expect(op?.completedSteps).toContain('provider_disabled');
    expect(op?.completedSteps).not.toContain('registration_projected');
  });

  it('a failing transition-ready audit halts BEFORE commit (gated, not best-effort)', async () => {
    const { store, svc } = build({ fail: { 'audit.transition_ready': () => new Error('audit down') } });
    await seedActive(store);
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED' });
    expect((await store.getLifecycle(UID))?.status).toBe('reconciliation_required');
  });

  it('reactivate on a reconciliation-reserved suspend op is refused (in progress)', async () => {
    const { store, svc } = build({ fail: { 'provider.disableUser': () => new Error('boom') } });
    await seedActive(store);
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED' });
    // Recovery is Phase 2D; a cross-action attempt must not silently proceed.
    await expect(svc.reactivate({ ...REQ, idempotencyKey: 'r' })).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_OPERATION_IN_PROGRESS' });
  });
});

describe('post-commit audit is best-effort', () => {
  it('a failed post-commit audit does not reopen or falsify the committed suspension', async () => {
    const { store, svc } = build({ fail: { 'audit.completed': () => new Error('audit down') } });
    await seedActive(store);
    const res = await svc.suspend(REQ);
    expect(res).toMatchObject({ finalStatus: 'suspended', postCommitAudit: 'failed' });
    expect((await store.getLifecycle(UID))?.status).toBe('suspended'); // still committed
  });
});

describe('fail-closed gate + validation', () => {
  it('rejects a non-production store with 503 (before any side effect)', async () => {
    const inMem = new InMemoryAccountLifecycleStore(NOW); // productionEligible: false
    await seedActive(inMem);
    const { svc, calls } = build({ store: inMem });
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE' });
    expect(calls).toEqual([]);
  });

  it('rejects an unavailable store with 503', async () => {
    const { svc } = build({ store: new UnavailableAccountLifecycleStore() });
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 503 });
  });

  it('409s when no durable lifecycle record exists', async () => {
    const { svc } = build(); // not seeded
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_NOT_FOUND' });
  });

  it('validates reason, idempotency key, and canonical id', async () => {
    const { store, svc } = build();
    await seedActive(store);
    await expect(svc.suspend({ ...REQ, reason: '  ' })).rejects.toMatchObject({ status: 400 });
    await expect(svc.suspend({ ...REQ, idempotencyKey: '' })).rejects.toMatchObject({ status: 400 });
    await expect(svc.suspend({ ...REQ, canonicalUserId: '' })).rejects.toMatchObject({ status: 400 });
  });

  it('never embeds a raw provider error message in the durable failure code', async () => {
    const secret = 'user u@x.com token=abc123 PHI';
    const { store, svc } = build({ fail: { 'provider.disableUser': () => Object.assign(new Error(secret), { name: 'CognitoDisableFailed' }) } });
    await seedActive(store);
    await expect(svc.suspend(REQ)).rejects.toMatchObject({ code: 'ACCOUNT_LIFECYCLE_RECONCILIATION_REQUIRED' });
    const op = await store.getOperation(UID, (await store.getLifecycle(UID))!.currentOperationId!);
    expect(op?.failureCode).not.toContain('token=abc123');
    expect(op?.failureCode).not.toContain('PHI');
    expect(op?.failureCode).toBe('provider_disabled:CognitoDisableFailed');
  });
});

describe('side-effect ordering invariants', () => {
  it('denies both planes and revokes sessions in the safety order', async () => {
    const { store, svc, calls } = build();
    await seedActive(store);
    await svc.suspend(REQ);
    expect(before(calls, 'canonical.denied=true', 'provider.disableUser')).toBe(true); // deny business plane first
    expect(before(calls, 'provider.disableUser', 'provider.globalSignOut')).toBe(true); // disable before revoke
    expect(before(calls, 'provider.globalSignOut', 'registration.disabled=true')).toBe(true); // revoke before login-plane deny
    expect(before(calls, 'registration.disabled=true', 'audit.transition_ready')).toBe(true); // audit last, pre-commit
  });
});
