/**
 * UI feature-gating types.
 *
 * This is a thin metadata layer ON TOP of the existing Phase A
 * permission system in `@/policy/security/identity` (PermissionId,
 * UserGroup, RoleAssignment, authorize). It does NOT introduce a
 * second permission system — every gate ultimately resolves through
 * the existing `authorizeForAuthUser` evaluator and the live user /
 * assignment store.
 *
 * Use FeatureDefinition entries to declare which UI surfaces (nav
 * items, routes, page sections, action buttons) are visible to which
 * roles, with which permissions, and at which rollout phase.
 */

import type { PermissionId, UserGroup } from '../identity/types';

/** Rollout phase — gates beta / internal modules from non-internal users. */
export type RolloutPhase =
  | 'internal'
  | 'pilot'
  | 'trainer'
  | 'office'
  | 'clinical'
  | 'full'
  | 'demo';

/** Stable identifier for a UI surface that can be gated. */
export type FeatureId = string;

/**
 * A gateable UI surface. Examples:
 * - whole modules ('staffing.view')
 * - specific routes ('admin.permissions.view')
 * - page sections ('clinician.detail.feha-accommodations')
 * - action buttons ('ces.sandbox.reset', 'evidence.upload')
 */
export interface FeatureDefinition {
  /** Stable id used by FeatureGate / canViewFeature. */
  featureId: FeatureId;

  /** Short human-readable label shown in admin diagnostics / phase badge. */
  label: string;

  /**
   * Phase A permissions that grant this feature. ANY (OR semantics):
   * if the user has any of these permissions through their role
   * assignments, the feature is allowed.
   *
   * Leave empty to skip the permission check (then `allowedGroupNames`
   * or open-by-default semantics apply).
   */
  requiredPermissions?: PermissionId[];

  /**
   * Optional fallback: allow access if the user belongs to any of
   * these UserGroup names. Used for surfaces that don't map cleanly
   * to a Phase A permission (e.g., a "Trainer can see Journey
   * dashboard" rule that isn't expressed as a single permission).
   *
   * Super Admin and Admin always pass (admin sees everything that is
   * `enabled !== false`).
   */
  allowedGroupNames?: UserGroup['name'][];

  /** Rollout phase. Non-internal users do not see internal-phase items. */
  rolloutPhase?: RolloutPhase;

  /** Hide entirely from non-Super-Admin / non-internal users. */
  internalOnly?: boolean;

  /**
   * Default true. Controls nav/list inclusion. If false, the feature
   * may still be reachable by direct URL but won't appear in nav.
   */
  visibleInNav?: boolean;

  /**
   * Default true. Master kill switch — if false, NO ONE sees the
   * feature (route, nav, action). Use sparingly: prefer permission /
   * rollout gating over disabling outright.
   */
  enabled?: boolean;

  /** Optional human-readable note for admin diagnostics. */
  note?: string;
}

/** Reason a feature is currently visible or hidden. */
export type FeatureDecisionReasonCode =
  | 'allow.admin'
  | 'allow.permission_granted'
  | 'allow.group_match'
  | 'allow.open'
  | 'deny.unknown_feature'
  | 'deny.feature_disabled'
  | 'deny.internal_only'
  | 'deny.onboarding_scope'
  | 'deny.rollout_phase'
  | 'deny.permission_not_granted'
  | 'deny.no_assignment';

export interface FeatureDecision {
  allow: boolean;
  reasonCode: FeatureDecisionReasonCode;
  reason: string;
  /** The matching feature definition, when known. */
  feature?: FeatureDefinition;
}
