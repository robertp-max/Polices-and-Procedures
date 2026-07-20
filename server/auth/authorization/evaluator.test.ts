/**
 * ADR-0002 Phase 3B — effective-access evaluator tests.
 * Behavioral proof of the §B5 precedence and group→permission expansion. Uses
 * real catalog groups (grp-user-access-admin grants user.provision/user.suspend;
 * grp-pending-user grants nothing) so a catalog change that breaks expansion fails here.
 */
import { describe, expect, it } from 'vitest';
import { authorizeAction, computeEffectiveAccess, type EffectiveAccessInput } from './evaluator.ts';

const NOW = '2027-01-01T00:00:00.000Z';
const ORG = 'org-careindeed';
let counter = 0;
const newDecisionId = () => `dec-${++counter}`;

const input = (over: Partial<EffectiveAccessInput> = {}): EffectiveAccessInput => ({
  principalUserId: 'usr-1',
  accountStatus: 'active',
  assignments: [{ groupId: 'grp-user-access-admin', scope: { organizationId: ORG } }],
  nowIso: NOW,
  ...over,
});

describe('computeEffectiveAccess', () => {
  it('expands active user groups into permissions with group provenance', () => {
    const ea = computeEffectiveAccess(input());
    expect(ea.accountActive).toBe(true);
    expect(ea.permissions).toEqual(['user.provision', 'user.suspend']);
    expect(ea.privileged).toBe(true);
    expect(ea.sources.every((s) => s.type === 'group' && s.id === 'grp-user-access-admin')).toBe(true);
  });

  it('withholds ALL permissions when the account is not active (fail-closed)', () => {
    const ea = computeEffectiveAccess(input({ accountStatus: 'suspended' }));
    expect(ea.accountActive).toBe(false);
    expect(ea.permissions).toEqual([]);
    expect(ea.privileged).toBe(false);
    expect(ea.sources[0]).toMatchObject({ type: 'account_status', id: 'suspended' });
  });

  it('treats unknown group ids as granting nothing (fail-closed)', () => {
    const ea = computeEffectiveAccess(input({ assignments: [{ groupId: 'grp-does-not-exist', scope: { organizationId: ORG } }] }));
    expect(ea.permissions).toEqual([]);
    expect(ea.privileged).toBe(false);
  });

  it('non-privileged group is not privileged', () => {
    const ea = computeEffectiveAccess(input({ assignments: [{ groupId: 'grp-pending-user', scope: { organizationId: ORG } }] }));
    expect(ea.privileged).toBe(false);
    expect(ea.permissions).toEqual([]);
  });

  it('stamps evaluatedAt + policyVersion', () => {
    const ea = computeEffectiveAccess(input());
    expect(ea.evaluatedAt).toBe(NOW);
    expect(ea.policyVersion).toBe('authz.v1');
  });
});

describe('authorizeAction precedence (ADR §B5)', () => {
  it('account-status deny wins over everything, even a granting group', () => {
    const d = authorizeAction(input({ accountStatus: 'suspended' }), { action: 'user.suspend', resource: { type: 'user', id: 'usr-2' } }, newDecisionId);
    expect(d.allowed).toBe(false);
    expect(d.reasonCode).toBe('ACCOUNT_NOT_ACTIVE');
  });

  it('separation-of-duties deny beats permission grant', () => {
    const d = authorizeAction(input(), { action: 'user.suspend', resource: { type: 'user', id: 'usr-2' }, separationOfDutiesConflict: { rule: 'no_self_action', conflictingActorId: 'usr-1' } }, newDecisionId);
    expect(d.allowed).toBe(false);
    expect(d.reasonCode).toBe('SEPARATION_OF_DUTIES');
  });

  it('missing permission is denied', () => {
    const d = authorizeAction(input(), { action: 'policy.publish', resource: { type: 'policy', id: 'p-1' } }, newDecisionId);
    expect(d.allowed).toBe(false);
    expect(d.reasonCode).toBe('MISSING_PERMISSION');
  });

  it('granted permission with no scope requested is allowed by group', () => {
    const d = authorizeAction(input(), { action: 'user.suspend', resource: { type: 'user', id: 'usr-2' } }, newDecisionId);
    expect(d.allowed).toBe(true);
    expect(d.reasonCode).toBe('ALLOWED_BY_GROUP');
    expect(d.sources[0]).toMatchObject({ type: 'group', id: 'grp-user-access-admin' });
  });

  it('scope mismatch is denied even when the permission is granted', () => {
    const d = authorizeAction(input(), { action: 'user.suspend', resource: { type: 'user' }, scope: { organizationId: 'other-org' } }, newDecisionId);
    expect(d.allowed).toBe(false);
    expect(d.reasonCode).toBe('SCOPE_MISMATCH');
  });

  it('matching scope is allowed', () => {
    const d = authorizeAction(input(), { action: 'user.suspend', resource: { type: 'user' }, scope: { organizationId: ORG } }, newDecisionId);
    expect(d.allowed).toBe(true);
    expect(d.reasonCode).toBe('ALLOWED_BY_GROUP');
  });

  it('every decision carries id, policyVersion, and evaluatedAt', () => {
    const d = authorizeAction(input(), { action: 'user.suspend', resource: { type: 'user' } }, newDecisionId);
    expect(d.decisionId).toMatch(/^dec-/);
    expect(d.policyVersion).toBe('authz.v1');
    expect(d.evaluatedAt).toBe(NOW);
  });
});
