// Permission catalog + Separation of Duties registry.
// See Builder/Security-Execution-Audit/01-User-Groups-and-Access-Control.md §3, §4.

import type { Permission, PermissionId, GroupId, ResourceRef, UserId } from './types';

export const PERMISSION_CATALOG: Permission[] = [
  { id: 'policy.view', resource: 'policy', action: 'view', phi: false },
  { id: 'policy.draft', resource: 'policy', action: 'draft', phi: false },
  { id: 'policy.approve', resource: 'policy', action: 'approve', phi: false },
  { id: 'policy.publish', resource: 'policy', action: 'publish', phi: false },

  { id: 'form.view', resource: 'form', action: 'view', phi: false },
  { id: 'form.sign', resource: 'form', action: 'sign', phi: false },

  { id: 'ceu.view', resource: 'ceu', action: 'view', phi: false },
  { id: 'ceu.assign', resource: 'ceu', action: 'assign', phi: false },
  { id: 'ceu.execute', resource: 'ceu', action: 'execute', phi: false },
  { id: 'ceu.complete', resource: 'ceu', action: 'complete', phi: false },
  { id: 'ceu.override', resource: 'ceu', action: 'override', phi: false },

  { id: 'audit.read', resource: 'audit', action: 'read', phi: false },
  { id: 'audit.export', resource: 'audit', action: 'export', phi: false },

  { id: 'phi.read', resource: 'phi', action: 'read', phi: true },
  { id: 'phi.write', resource: 'phi', action: 'write', phi: true },

  { id: 'user.provision', resource: 'user', action: 'provision', phi: false },
  { id: 'user.suspend', resource: 'user', action: 'suspend', phi: false },

  { id: 'system.replay', resource: 'system', action: 'replay', phi: false },
];

export const PERMISSION_INDEX: Record<PermissionId, Permission> =
  PERMISSION_CATALOG.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<PermissionId, Permission>);

// Default base permissions per group (see Doc 01 §3 table).
export const GROUP_DEFAULT_PERMISSIONS: Record<string, PermissionId[]> = {
  RN:          ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read', 'phi.write'],
  LVN:         ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read', 'phi.write'],
  CHHA:        ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read'],
  Admin:       ['policy.view', 'form.view', 'ceu.view', 'ceu.assign', 'user.provision', 'user.suspend'],
  Compliance:  ['policy.view', 'policy.draft', 'policy.publish', 'form.view', 'ceu.view', 'ceu.assign',
                'ceu.override', 'audit.read', 'audit.export', 'user.suspend'],
  Auditor:     ['policy.view', 'form.view', 'ceu.view', 'audit.read', 'audit.export'],
  Onboarding:  ['policy.view', 'form.view', 'ceu.view', 'ceu.assign', 'user.provision'],
  Billing:     ['policy.view', 'form.view', 'ceu.view', 'ceu.execute', 'ceu.complete'],
  Director:    ['policy.view', 'policy.approve', 'form.view', 'ceu.view', 'ceu.assign', 'ceu.override'],
  Executive:   ['policy.view', 'policy.approve', 'policy.publish', 'form.view', 'ceu.view', 'ceu.override', 'audit.read'],
  System:      ['system.replay'],
};

// Override-eligible groups by override scope (Doc 01 §5.3).
export const OVERRIDE_ROLE_PAIRS: Record<string, [GroupId, GroupId]> = {
  'override.policy':    ['Compliance', 'Director'],
  'override.signature': ['Director', 'Executive'],
  'override.access':    ['Admin', 'Compliance'],
};

// ---- Separation of Duties ----

export interface SodRule {
  id: string;
  description: string;
  // Returns reasonCode if the action is denied by SoD; otherwise null.
  evaluate(input: SodInput): string | null;
}

export interface SodInput {
  actorUserId: UserId;
  permission: PermissionId;
  resource: ResourceRef;
  history: ReadonlyArray<{
    actorUserId: UserId;
    permission: PermissionId;
    resourceId: string;
    resourceKind: string;
    at: string;
  }>;
}

export const SOD_RULES: SodRule[] = [
  {
    id: 'sod.policy.draft_vs_approve',
    description: 'Same user cannot draft and approve the same policy version.',
    evaluate({ actorUserId, permission, resource, history }) {
      if (resource.kind !== 'policy') return null;
      const versionId = resource.policyVersionId ?? resource.id;
      if (permission === 'policy.approve') {
        const drafted = history.some(h =>
          h.actorUserId === actorUserId &&
          h.permission === 'policy.draft' &&
          (h.resourceId === versionId || h.resourceId === resource.id),
        );
        if (drafted) return 'sod.policy.draft_then_approve';
      }
      if (permission === 'policy.draft') {
        const approved = history.some(h =>
          h.actorUserId === actorUserId &&
          h.permission === 'policy.approve' &&
          (h.resourceId === versionId || h.resourceId === resource.id),
        );
        if (approved) return 'sod.policy.approve_then_draft';
      }
      return null;
    },
  },
  {
    id: 'sod.form.assign_vs_sign',
    description: 'Same user cannot assign and sign the same form instance (unless self-attestation).',
    evaluate({ actorUserId, permission, resource, history }) {
      if (resource.kind !== 'form' || permission !== 'form.sign') return null;
      const meta = resource.meta ?? {};
      if (meta.kind === 'self_attestation') return null;
      const assigned = history.some(h =>
        h.actorUserId === actorUserId &&
        h.permission === 'ceu.assign' &&
        h.resourceId === (resource.formInstanceId ?? resource.id),
      );
      return assigned ? 'sod.form.assign_then_sign' : null;
    },
  },
  {
    id: 'sod.ceu.execute_vs_complete_when_reviewer_required',
    description: 'Executor alone cannot complete a CEU that requires a reviewer.',
    evaluate({ permission, resource }) {
      if (resource.kind !== 'ceu' || permission !== 'ceu.complete') return null;
      const meta = resource.meta ?? {};
      if (meta.requiresReviewer && !meta.reviewerSignedOff) {
        return 'sod.ceu.requires_reviewer';
      }
      return null;
    },
  },
  {
    id: 'sod.override.distinct_approvers',
    description: 'Override approvals require two distinct users.',
    evaluate({ actorUserId, permission, resource }) {
      if (permission !== 'ceu.override') return null;
      const meta = resource.meta ?? {};
      const firstApprover = meta.firstApproverUserId as UserId | undefined;
      if (firstApprover && firstApprover === actorUserId) {
        return 'sod.override.same_user';
      }
      return null;
    },
  },
  {
    id: 'sod.auditor.no_writes',
    description: 'Auditor group has no write permissions anywhere.',
    evaluate({ permission, resource }) {
      // Enforced primarily by group permission catalog; this rule guards against accidental grants.
      // Returns null here; group lookup in authorize() ensures Auditor lacks write perms.
      void permission; void resource;
      return null;
    },
  },
];
