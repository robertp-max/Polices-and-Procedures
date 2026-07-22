/**
 * ADR-0002 Phase 5B (persistence) — assignment store policy + capability tests.
 * Pure helpers only (no disk I/O). Fail-closed grant, idempotent revoke.
 */
import { describe, expect, it } from 'vitest';
import {
  __resetSignatureAssignmentStoreForTests, assignmentsForUser, getSignatureAssignmentStore,
  grantAssignment, revokeAssignment, type GrantAssignmentInput,
} from './signatureAssignmentStore.ts';

const grantInput = (over: Partial<GrantAssignmentInput> = {}): GrantAssignmentInput => ({
  userId: 'usr-1',
  signatureRoleId: 'Director of Nursing',
  authorityBasis: 'job_appointment',
  scope: { organizationId: 'org-1' },
  effectiveFrom: '2027-01-01T00:00:00.000Z',
  grantedBy: 'admin-1',
  reason: 'appointment',
  ...over,
});

describe('grantAssignment (fail-closed)', () => {
  it('creates an active assignment', () => {
    const { list, assignment } = grantAssignment([], grantInput(), 'sa-1');
    expect(list).toHaveLength(1);
    expect(assignment).toMatchObject({ assignmentId: 'sa-1', userId: 'usr-1', signatureRoleId: 'Director of Nursing', status: 'active', version: 1 });
  });

  it('stores the canonical capacity even when granted via an alias', () => {
    const { assignment } = grantAssignment([], grantInput({ signatureRoleId: 'don' }), 'sa-2');
    expect(assignment.signatureRoleId).toBe('Director of Nursing');
  });

  it('throws on an unknown capacity (never coerced)', () => {
    expect(() => grantAssignment([], grantInput({ signatureRoleId: 'Supreme Wizard' }), 'sa-3')).toThrow();
  });
});

describe('revokeAssignment', () => {
  it('marks an assignment revoked and bumps version', () => {
    const { list } = grantAssignment([], grantInput(), 'sa-1');
    const revoked = revokeAssignment(list, 'sa-1');
    expect(revoked[0]).toMatchObject({ status: 'revoked', version: 2 });
  });

  it('throws when the assignment id is not found', () => {
    expect(() => revokeAssignment([], 'nope')).toThrow();
  });
});

describe('assignmentsForUser', () => {
  it('filters by user id', () => {
    const a = grantAssignment([], grantInput({ userId: 'usr-1' }), 'sa-1').list;
    const b = grantAssignment(a, grantInput({ userId: 'usr-2' }), 'sa-2').list;
    expect(assignmentsForUser(b, 'usr-1').map((x) => x.assignmentId)).toEqual(['sa-1']);
  });
});

describe('store capability metadata (§B9)', () => {
  it('the dev file store is single-instance only (not production-eligible)', () => {
    __resetSignatureAssignmentStoreForTests();
    const store = getSignatureAssignmentStore();
    expect(store.provider).toBe('file_local');
    expect(store.capabilities.multiInstanceShared).toBe(false);
    expect(store.capabilities.productionAuditEligible).toBe(false);
  });
});
