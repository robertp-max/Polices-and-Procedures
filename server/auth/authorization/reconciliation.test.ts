/**
 * ADR-0002 §9 — reconciliation findings tests.
 */
import { describe, expect, it } from 'vitest';
import type { AppIdentityRegistry } from '../appIdentityPersistence.ts';
import { computeReconciliationFindings } from './reconciliation.ts';

const NOW = '2027-06-01T00:00:00.000Z';
const user = (id: string, email: string, status: 'active' | 'pending' | 'suspended' = 'active') => ({ id, email, name: id, status });
const assign = (id: string, userId: string, groupId: string) => ({ id, userId, groupId, scope: { organizationId: 'org-1' }, effectiveFrom: '2027-01-01T00:00:00.000Z' });

describe('computeReconciliationFindings', () => {
  it('detects duplicate normalized emails across users', () => {
    const reg: AppIdentityRegistry = { users: [user('u1', 'Robert@CareIndeed.com'), user('u2', 'robert@careindeed.com')], assignments: [assign('a1', 'u1', 'grp-admin'), assign('a2', 'u2', 'grp-admin')] };
    const f = computeReconciliationFindings(reg, NOW);
    expect(f.duplicateEmails).toHaveLength(1);
    expect(new Set(f.duplicateEmails[0].userIds)).toEqual(new Set(['u1', 'u2']));
  });

  it('detects orphan assignments (user missing)', () => {
    const reg: AppIdentityRegistry = { users: [user('u1', 'a@b.com')], assignments: [assign('a1', 'u1', 'grp-admin'), assign('a2', 'ghost', 'grp-admin')] };
    const f = computeReconciliationFindings(reg, NOW);
    expect(f.orphanAssignments).toEqual([{ assignmentId: 'a2', userId: 'ghost', groupId: 'grp-admin' }]);
  });

  it('detects active users with no active group', () => {
    const reg: AppIdentityRegistry = { users: [user('u1', 'a@b.com'), user('u2', 'c@d.com')], assignments: [assign('a1', 'u1', 'grp-admin')] };
    const f = computeReconciliationFindings(reg, NOW);
    expect(f.usersWithoutActiveGroup.map((x) => x.userId)).toEqual(['u2']);
  });

  it('detects excessive privilege (>1 privileged group)', () => {
    const reg: AppIdentityRegistry = { users: [user('u1', 'a@b.com')], assignments: [assign('a1', 'u1', 'grp-super-admin'), assign('a2', 'u1', 'grp-user-access-admin')] };
    const f = computeReconciliationFindings(reg, NOW);
    expect(f.excessivePrivilege).toHaveLength(1);
    expect(new Set(f.excessivePrivilege[0].privilegedGroups)).toEqual(new Set(['grp-super-admin', 'grp-user-access-admin']));
  });

  it('summarizes total findings + evaluatedAt; clean registry has none', () => {
    const reg: AppIdentityRegistry = { users: [user('u1', 'a@b.com')], assignments: [assign('a1', 'u1', 'grp-clinician-rn')] };
    const f = computeReconciliationFindings(reg, NOW);
    expect(f.summary.totalFindings).toBe(0);
    expect(f.evaluatedAt).toBe(NOW);
  });
});
