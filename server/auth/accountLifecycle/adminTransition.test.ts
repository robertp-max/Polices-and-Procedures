/**
 * Phase 2E — admin lifecycle transition core.
 *
 * Proves the route-to-service seam: policy guards (self-suspension,
 * last-super-admin) run against the canonical registry BEFORE any durable work,
 * and a permitted transition delegates to the orchestration service with the
 * correctly-mapped request. Uses a fake service — no store, no AWS.
 */
import { describe, expect, it } from 'vitest';
import { performAdminLifecycleTransition } from './adminTransition.js';
import type { AccountLifecycleService, LifecycleTransitionResult } from './service.js';
import type { AppIdentityRegistry } from '../appIdentityPersistence.js';

const NOW = '2027-01-01T00:00:00.000Z';

function reg(): AppIdentityRegistry {
  return {
    users: [
      { id: 'usr-admin', email: 'admin@careindeed.com', name: 'Admin', status: 'active' },
      { id: 'usr-nurse', email: 'nurse@careindeed.com', name: 'Nurse', status: 'active' },
      { id: 'usr-susp', email: 'susp@careindeed.com', name: 'Suspended', status: 'suspended' },
    ],
    assignments: [
      { id: 'a1', userId: 'usr-admin', groupId: 'grp-super-admin', scope: { organizationId: 'careindeed-demo' }, effectiveFrom: '2020-01-01T00:00:00.000Z' },
    ],
    syncedCount: 3,
  };
}

function fakeService() {
  const calls: Array<{ method: string; req: { canonicalUserId: string; actorUserId: string; actorEmailSnapshot: string; reason: string; idempotencyKey: string } }> = [];
  const base: LifecycleTransitionResult = { action: 'suspend', canonicalUserId: '', finalStatus: 'suspended', operationId: 'op-x', resumed: false, postCommitAudit: 'completed' };
  const svc = {
    async suspend(req: typeof calls[number]['req']) { calls.push({ method: 'suspend', req }); return { ...base, canonicalUserId: req.canonicalUserId }; },
    async reactivate(req: typeof calls[number]['req']) { calls.push({ method: 'reactivate', req }); return { ...base, action: 'reactivate' as const, finalStatus: 'active' as const, canonicalUserId: req.canonicalUserId }; },
  } as unknown as AccountLifecycleService;
  return { svc, calls };
}

const baseInput = (over: Partial<Parameters<typeof performAdminLifecycleTransition>[0]> = {}) => ({
  registry: reg(), action: 'suspend' as const, actorUserId: 'usr-admin', actorEmail: 'admin@careindeed.com',
  targetUserId: 'usr-nurse', reason: 'policy violation', idempotencyKey: 'idem-1', nowIso: NOW, ...over,
});

describe('performAdminLifecycleTransition', () => {
  it('delegates a permitted suspend to the service with a mapped request', async () => {
    const { svc, calls } = fakeService();
    const res = await performAdminLifecycleTransition({ ...baseInput(), service: svc });
    expect(res.finalStatus).toBe('suspended');
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({ method: 'suspend', req: { canonicalUserId: 'usr-nurse', actorUserId: 'usr-admin', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', idempotencyKey: 'idem-1' } });
  });

  it('delegates a permitted reactivate to the service', async () => {
    const { svc, calls } = fakeService();
    const res = await performAdminLifecycleTransition({ ...baseInput(), service: svc, action: 'reactivate', targetUserId: 'usr-susp' });
    expect(res.finalStatus).toBe('active');
    expect(calls[0].method).toBe('reactivate');
  });

  it('blocks self-suspension before touching the service', async () => {
    const { svc, calls } = fakeService();
    await expect(performAdminLifecycleTransition({ ...baseInput(), service: svc, targetUserId: 'usr-admin' }))
      .rejects.toMatchObject({ status: 400 });
    expect(calls).toHaveLength(0);
  });

  it('blocks suspending the last active super-admin', async () => {
    const { svc, calls } = fakeService();
    await expect(performAdminLifecycleTransition({ ...baseInput(), service: svc, actorUserId: 'usr-other', targetUserId: 'usr-admin' }))
      .rejects.toMatchObject({ status: 400 });
    expect(calls).toHaveLength(0);
  });

  it('401s without a verified administrator id', async () => {
    const { svc } = fakeService();
    await expect(performAdminLifecycleTransition({ ...baseInput(), service: svc, actorUserId: undefined }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('404s a transition against a nonexistent target', async () => {
    const { svc } = fakeService();
    await expect(performAdminLifecycleTransition({ ...baseInput(), service: svc, action: 'reactivate', targetUserId: 'ghost' }))
      .rejects.toMatchObject({ status: 404 });
  });
});
