import type { Decision, PermissionId, ResourceRef, UserGroup } from './types';

interface SodInput {
  actorUserId: string;
  groups: UserGroup[];
  permission: PermissionId;
  resource: ResourceRef;
}

const AUDITOR_ALLOWED: ReadonlySet<PermissionId> = new Set([
  'policy.view',
  'form.view',
  'ceu.view',
  'audit.read',
  'audit.export',
]);

function deny(reasonCode: string, reason: string): Decision {
  return { allow: false, reasonCode, reason, obligations: [] };
}

export function evaluateSeparationOfDuties(input: SodInput): Decision | null {
  const { actorUserId, groups, permission, resource } = input;
  const groupNames = new Set(groups.map(group => group.name));

  if (groupNames.has('Auditor') && !AUDITOR_ALLOWED.has(permission)) {
    return deny(
      'sod.auditor.read_only',
      'Auditor role is read-only and cannot perform write, sign, approve, or override actions.',
    );
  }

  if (permission === 'policy.approve') {
    const draftAuthorUserId = typeof resource.meta?.draftAuthorUserId === 'string'
      ? resource.meta.draftAuthorUserId
      : undefined;
    if (draftAuthorUserId && draftAuthorUserId === actorUserId) {
      return deny(
        'sod.policy.author_cannot_approve',
        'The policy draft author cannot approve the same policy version.',
      );
    }
  }

  if (permission === 'form.sign') {
    const assignedByUserId = typeof resource.meta?.assignedByUserId === 'string'
      ? resource.meta.assignedByUserId
      : undefined;
    const selfAttestationAllowed = resource.meta?.selfAttestationAllowed === true;
    if (assignedByUserId && assignedByUserId === actorUserId && !selfAttestationAllowed) {
      return deny(
        'sod.form.assign_sign_conflict',
        'The same user cannot assign and sign the same form instance unless self-attestation is explicitly allowed.',
      );
    }
  }

  if (permission === 'ceu.complete') {
    const executedByUserId = typeof resource.meta?.executedByUserId === 'string'
      ? resource.meta.executedByUserId
      : undefined;
    const requiresReviewer = resource.meta?.requiresReviewer === true;
    const reviewerUserId = typeof resource.meta?.reviewerUserId === 'string'
      ? resource.meta.reviewerUserId
      : undefined;

    if (requiresReviewer && executedByUserId === actorUserId && !reviewerUserId) {
      return deny(
        'sod.ceu.reviewer_required',
        'A CEU that requires reviewer oversight cannot be completed by the same executor without a distinct reviewer.',
      );
    }
  }

  if (permission === 'ceu.override') {
    const priorApproverIds = Array.isArray(resource.meta?.overrideApproverUserIds)
      ? resource.meta?.overrideApproverUserIds.filter((value): value is string => typeof value === 'string')
      : [];

    if (priorApproverIds.includes(actorUserId)) {
      return deny(
        'sod.override.distinct_approvers_required',
        'Override approvals must be completed by two distinct eligible users.',
      );
    }
  }

  return null;
}
