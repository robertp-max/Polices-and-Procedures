/**
 * ADR-0002 §B10 — impact-preview tests. Uses real catalog groups
 * (grp-user-access-admin grants user.provision/user.suspend).
 */
import { describe, expect, it } from 'vitest';
import { computeAccessChangeImpact, type AccessChangeProposal } from './impactPreview.ts';

const NOW = '2027-01-01T00:00:00.000Z';
const ORG = 'org-1';
const g = (groupId: string) => ({ groupId, scope: { organizationId: ORG } });

const proposal = (over: Partial<AccessChangeProposal> = {}): AccessChangeProposal => ({
  principalUserId: 'usr-1',
  accountStatus: 'active',
  currentAssignments: [],
  proposedAssignments: [],
  nowIso: NOW,
  ...over,
});

describe('computeAccessChangeImpact', () => {
  it('reports permissions + group + privilege gained when adding a privileged group', () => {
    const impact = computeAccessChangeImpact(proposal({ proposedAssignments: [g('grp-user-access-admin')] }));
    expect(impact.groupsAdded).toEqual(['grp-user-access-admin']);
    expect(impact.permissionsGained).toEqual(['user.provision', 'user.suspend']);
    expect(impact.permissionsLost).toEqual([]);
    expect(impact.privilegeChange).toBe('gained');
    expect(impact.noop).toBe(false);
  });

  it('reports loss when removing a group', () => {
    const impact = computeAccessChangeImpact(proposal({ currentAssignments: [g('grp-user-access-admin')], proposedAssignments: [] }));
    expect(impact.groupsRemoved).toEqual(['grp-user-access-admin']);
    expect(impact.permissionsLost).toEqual(['user.provision', 'user.suspend']);
    expect(impact.privilegeChange).toBe('lost');
  });

  it('flags a no-op change', () => {
    const impact = computeAccessChangeImpact(proposal({ currentAssignments: [g('grp-user-access-admin')], proposedAssignments: [g('grp-user-access-admin')] }));
    expect(impact.noop).toBe(true);
    expect(impact.privilegeChange).toBe('none');
  });

  it('a suspended account gains NO permissions/privilege even when adding a privileged group (fail-closed)', () => {
    const impact = computeAccessChangeImpact(proposal({ accountStatus: 'suspended', proposedAssignments: [g('grp-user-access-admin')] }));
    expect(impact.before.permissions).toEqual([]);
    expect(impact.after.permissions).toEqual([]);
    expect(impact.permissionsGained).toEqual([]);
    expect(impact.privilegeChange).toBe('none');
    // group membership is recorded as added, but it grants nothing while suspended
    expect(impact.groupsAdded).toEqual(['grp-user-access-admin']);
  });

  it('stamps evaluatedAt + policyVersion', () => {
    const impact = computeAccessChangeImpact(proposal());
    expect(impact.evaluatedAt).toBe(NOW);
    expect(impact.policyVersion).toBe('authz.v1');
  });
});
