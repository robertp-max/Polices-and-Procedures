export type PermissionId =
  | 'policy.view'
  | 'policy.draft'
  | 'policy.approve'
  | 'policy.publish'
  | 'form.view'
  | 'form.sign'
  | 'ceu.view'
  | 'ceu.assign'
  | 'ceu.execute'
  | 'ceu.complete'
  | 'ceu.override'
  | 'audit.read'
  | 'audit.export'
  | 'phi.read'
  | 'phi.write'
  | 'user.provision'
  | 'user.suspend'
  | 'system.replay';

export type ResourceKind =
  | 'policy'
  | 'form'
  | 'ceu'
  | 'audit'
  | 'phi'
  | 'user'
  | 'system';

export interface Permission {
  id: PermissionId;
  resource: ResourceKind;
  action: string;
  phi: boolean;
  description: string;
}

export interface Scope {
  organizationId: string;
  branchId?: string;
  programId?: string;
  patientId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'pending' | 'suspended';
  /** How the user was provisioned — 'manual' for CRUD-created users */
  source?: 'manual-provisioned' | 'seed';
}

export interface UserGroup {
  id: string;
  name:
    | 'Super Admin'
    | 'Admin'
    | 'RN'
    | 'LVN'
    | 'CHHA'
    | 'Compliance'
    | 'Auditor'
    | 'Onboarding'
    | 'Billing'
    | 'Director'
    | 'Executive'
    | 'System';
  description: string;
  permissions: PermissionId[];
}

export interface RoleAssignment {
  id: string;
  userId: string;
  groupId: string;
  scope: Scope;
  effectiveFrom: string;
  effectiveTo?: string;
  revokedAt?: string;
}

export interface ResourceRef {
  kind: ResourceKind;
  id: string;
  scope?: Scope;
  containsPhi?: boolean;
  meta?: Record<string, unknown>;
}

export interface Obligation {
  code: 'log_phi_access' | 'require_reason' | 'require_dual_approval';
  detail?: string;
}

export interface Decision {
  allow: boolean;
  reasonCode: string;
  reason: string;
  obligations: Obligation[];
}

export interface AccessDecisionEvent {
  timestamp: string;
  actorUserId: string;
  permission: PermissionId;
  resourceKind: ResourceKind;
  resourceId: string;
  allow: boolean;
  reasonCode: string;
}
