/**
 * ADR-0002 §B5 — the server AuthorizationDecision contract.
 *
 * Every server authorization check returns this object. The UI may RENDER a
 * decision (and its explanation) but must never independently reconstruct it —
 * the server is the sole authority. Three concepts stay distinct (ADR §B5):
 * permissions (business operations), capabilities (admin/product functions),
 * and page visibility (a non-authorizing projection, Phase 4).
 */
import type { PermissionId } from './catalog.js';

export type AuthorizationReasonCode =
  | 'ACCOUNT_NOT_ACTIVE'
  | 'POLICY_DENY'
  | 'SEPARATION_OF_DUTIES'
  | 'MISSING_PERMISSION'
  | 'SCOPE_MISMATCH'
  | 'ASSIGNMENT_EXPIRED'
  | 'ALLOWED_BY_GROUP'
  | 'ALLOWED_BY_DIRECT_GRANT';

export interface AuthorizationSource {
  type: 'account_status' | 'group' | 'direct_grant' | 'policy' | 'separation_of_duties';
  /** The group id, status value, or rule id responsible for this contribution. */
  id: string;
  /** Optional human-facing detail (e.g. the permission a group granted). */
  detail?: string;
}

export interface AuthorizationResourceRef {
  type: string;
  id?: string;
}

export interface AuthorizationScopeRef {
  organizationId?: string;
  branchId?: string;
}

export interface AuthorizationDecision {
  allowed: boolean;
  decisionId: string;
  principalUserId: string;
  action: PermissionId | string;
  resource: AuthorizationResourceRef;
  scope?: AuthorizationScopeRef;
  reasonCode: AuthorizationReasonCode;
  /** Everything that contributed to the decision, for explanation + audit. */
  sources: AuthorizationSource[];
  evaluatedAt: string;
  policyVersion: string;
}
