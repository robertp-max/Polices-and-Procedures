/**
 * ADR-0002 §B10 — server-generated impact preview for high-risk access changes.
 *
 * Before a role/group change is saved, the server derives the before/after
 * effective access so the admin sees exactly what a change does (permissions
 * gained/lost, groups added/removed, privilege change) — safer and more
 * explainable than a generic confirmation dialog. Pure + mutation-free: this
 * NEVER persists anything; it only projects.
 */
import { computeEffectiveAccess, type EffectiveAccessAssignment } from './evaluator.js';
import { POLICY_VERSION, type PermissionId } from './catalog.js';

export interface AccessChangeProposal {
  principalUserId: string;
  accountStatus: string;
  currentAssignments: readonly EffectiveAccessAssignment[];
  proposedAssignments: readonly EffectiveAccessAssignment[];
  nowIso: string;
  policyVersion?: string;
}

interface AccessSnapshot {
  permissions: PermissionId[];
  groupIds: string[];
  privileged: boolean;
}

export interface AccessChangeImpact {
  principalUserId: string;
  before: AccessSnapshot;
  after: AccessSnapshot;
  permissionsGained: PermissionId[];
  permissionsLost: PermissionId[];
  groupsAdded: string[];
  groupsRemoved: string[];
  privilegeChange: 'none' | 'gained' | 'lost';
  /** True when the change is a no-op on effective access. */
  noop: boolean;
  evaluatedAt: string;
  policyVersion: string;
}

const diff = <T>(from: readonly T[], to: readonly T[]): T[] => {
  const fromSet = new Set(from);
  return to.filter((x) => !fromSet.has(x));
};

export function computeAccessChangeImpact(proposal: AccessChangeProposal): AccessChangeImpact {
  const policyVersion = proposal.policyVersion ?? POLICY_VERSION;
  const before = computeEffectiveAccess({
    principalUserId: proposal.principalUserId,
    accountStatus: proposal.accountStatus,
    assignments: proposal.currentAssignments,
    nowIso: proposal.nowIso,
    policyVersion,
  });
  const after = computeEffectiveAccess({
    principalUserId: proposal.principalUserId,
    accountStatus: proposal.accountStatus,
    assignments: proposal.proposedAssignments,
    nowIso: proposal.nowIso,
    policyVersion,
  });

  const permissionsGained = diff(before.permissions, after.permissions);
  const permissionsLost = diff(after.permissions, before.permissions);
  const groupsAdded = diff(before.groupIds, after.groupIds);
  const groupsRemoved = diff(after.groupIds, before.groupIds);
  const privilegeChange: AccessChangeImpact['privilegeChange'] =
    before.privileged === after.privileged ? 'none' : after.privileged ? 'gained' : 'lost';

  return {
    principalUserId: proposal.principalUserId,
    before: { permissions: before.permissions, groupIds: before.groupIds, privileged: before.privileged },
    after: { permissions: after.permissions, groupIds: after.groupIds, privileged: after.privileged },
    permissionsGained,
    permissionsLost,
    groupsAdded,
    groupsRemoved,
    privilegeChange,
    noop: permissionsGained.length === 0 && permissionsLost.length === 0 && groupsAdded.length === 0 && groupsRemoved.length === 0,
    evaluatedAt: proposal.nowIso,
    policyVersion,
  };
}
