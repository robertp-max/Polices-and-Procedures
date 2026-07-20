/**
 * Phase 2E — legacy-plane projections + audit sink.
 *
 * Projections mirror the durable lifecycle decision onto the registration
 * (login) and canonical (business-route) planes, idempotently, without business
 * policy. The audit sink maps lifecycle events onto the append-only stream with
 * only accountability metadata. All substrate is injected — no live AWS.
 */
import { describe, expect, it } from 'vitest';
import { createLifecycleProjections } from './projections.js';
import { createLifecycleAuditSink } from './auditSink.js';
import type { AppIdentityRegistry } from '../appIdentityPersistence.js';
import type { AuditEventInput } from '../../audit/store/eventModel.js';

const UID = 'usr-1';
const target = { canonicalUserId: UID, providerUsername: 'cognito-1', normalizedEmail: 'u@careindeed.com', correlationId: 'corr-1' };

function registry(status: 'active' | 'suspended' | 'pending'): AppIdentityRegistry {
  return { users: [{ id: UID, email: 'u@careindeed.com', name: 'U', status }], assignments: [], syncedCount: 1 };
}

describe('registration projection', () => {
  it('maps disabled/active to the registration access plane by email', async () => {
    const calls: Array<[string, string]> = [];
    const p = createLifecycleProjections({
      setRegistrationAccess: async (email, access) => { calls.push([email, access]); },
      getCanonicalRegistry: async () => registry('active'),
      putCanonicalRegistry: async (r) => r,
    });
    await p.projectRegistrationStatus({ ...target, disabled: true });
    await p.projectRegistrationStatus({ ...target, disabled: false });
    expect(calls).toEqual([['u@careindeed.com', 'disabled'], ['u@careindeed.com', 'active']]);
  });
});

describe('canonical projection', () => {
  it('suspends the canonical user and is idempotent', async () => {
    let stored = registry('active');
    const p = createLifecycleProjections({
      setRegistrationAccess: async () => {},
      getCanonicalRegistry: async () => stored,
      putCanonicalRegistry: async (r) => { stored = r as AppIdentityRegistry; return r; },
    });
    await p.projectCanonicalStatus({ ...target, denied: true });
    expect(stored.users[0].status).toBe('suspended');
    // Idempotent: projecting the same denied state again does not write.
    let writes = 0;
    const p2 = createLifecycleProjections({
      setRegistrationAccess: async () => {},
      getCanonicalRegistry: async () => stored,
      putCanonicalRegistry: async (r) => { writes += 1; return r; },
    });
    await p2.projectCanonicalStatus({ ...target, denied: true });
    expect(writes).toBe(0);
  });

  it('restores suspended → active but never resurrects a pending user', async () => {
    let stored = registry('suspended');
    const mk = () => createLifecycleProjections({
      setRegistrationAccess: async () => {},
      getCanonicalRegistry: async () => stored,
      putCanonicalRegistry: async (r) => { stored = r as AppIdentityRegistry; return r; },
    });
    await mk().projectCanonicalStatus({ ...target, denied: false });
    expect(stored.users[0].status).toBe('active');

    stored = registry('pending');
    let writes = 0;
    const p = createLifecycleProjections({
      setRegistrationAccess: async () => {},
      getCanonicalRegistry: async () => stored,
      putCanonicalRegistry: async (r) => { writes += 1; return r; },
    });
    await p.projectCanonicalStatus({ ...target, denied: false });
    expect(writes).toBe(0); // pending is not resurrected to active
    expect(stored.users[0].status).toBe('pending');
  });

  it('throws 404 when the canonical user is absent', async () => {
    const p = createLifecycleProjections({
      setRegistrationAccess: async () => {},
      getCanonicalRegistry: async () => ({ users: [], assignments: [], syncedCount: 0 }),
      putCanonicalRegistry: async (r) => r,
    });
    await expect(p.projectCanonicalStatus({ ...target, denied: true })).rejects.toMatchObject({ status: 404 });
  });
});

describe('audit sink', () => {
  it('emits accountability-only events, idempotency-keyed by operation+phase', async () => {
    const events: AuditEventInput[] = [];
    const sink = createLifecycleAuditSink(async (e) => { events.push(e); return e; });
    await sink.record({
      phase: 'transition_ready', action: 'suspend', canonicalUserId: UID, operationId: 'op-1',
      actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com', correlationId: 'corr-1', finalStatus: 'suspended',
    });
    expect(events).toHaveLength(1);
    const e = events[0];
    expect(e.event_type).toBe('account_lifecycle.suspend.transition_ready');
    expect(e.idempotency_key).toBe('lifecycle:op-1:transition_ready');
    expect(e.resource).toEqual({ type: 'user', id: UID });
    expect(e.decision).toBe('permit');
    // No PHI / tokens / reason — only accountability metadata.
    const serialized = JSON.stringify(e);
    expect(serialized).not.toContain('policy violation');
    expect(serialized).not.toContain('token');
  });
});
