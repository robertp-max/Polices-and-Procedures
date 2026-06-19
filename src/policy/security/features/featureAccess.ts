/**
 * Feature-access helpers.
 *
 * Pure (non-React) functions that decide whether a given auth user
 * can see a feature, can navigate to a route, or can perform an
 * action. All decisions ultimately resolve through the existing
 * Phase A authorize engine — this module never invents a new
 * permission system.
 */

import type { DemoUser as AuthDemoUser } from '@/auth/api';
// Import from specific files (not the identity barrel) so this module
// stays tree-shakeable AND can be used from non-Vite contexts (e.g.
// a verification script under tsx) without dragging in React/JSX modules.
import { authorizeForAuthUser } from '../identity/authorize';
import { resolveUserIdFromAuth } from '../identity/demoUsers';
import { useUserAssignmentsStore } from '../identity/userAssignmentsStore';
import { USER_GROUP_BY_ID } from '../identity/userGroups';
import type { PermissionId, ResourceRef, UserGroup } from '../identity/types';
import { FEATURE_BY_ID, FEATURE_CATALOG } from './catalog';
import type { FeatureDecision, FeatureDefinition, FeatureId, RolloutPhase } from './types';

const INTERNAL_GROUPS: UserGroup['name'][] = ['Super Admin', 'Admin', 'System'];
const LIMITED_ACCESS_GROUPS: UserGroup['name'][] = ['Onboarding', 'Pending User'];
const ONBOARDING_VISIBLE_FEATURES = new Set<FeatureId>([
  'frameworkTaxonomy.view',
  'workflows.view',
]);

/** Default scope used when a feature gate doesn't supply one. */
function defaultScope(): ResourceRef['scope'] {
  return { organizationId: 'careindeed-demo' };
}

/** Resolve the live group names a user currently belongs to. */
export function getUserGroupNames(authUser: AuthDemoUser | null): UserGroup['name'][] {
  const userId = resolveUserIdFromAuth(authUser);
  const assignments = useUserAssignmentsStore.getState().getActiveAssignmentsForUser(userId);
  const names: UserGroup['name'][] = [];
  for (const a of assignments) {
    const g = USER_GROUP_BY_ID[a.groupId];
    if (g && !names.includes(g.name)) names.push(g.name);
  }
  return names;
}

/** True if the user belongs to Super Admin, Admin, or System. */
export function isAdminUser(authUser: AuthDemoUser | null): boolean {
  // Fast path: the local-demo bypass user has role === 'super_admin'.
  const role = authUser?.role?.toLowerCase();
  if (role === 'super_admin' || role === 'sys_admin' || role === 'admin') {
    return true;
  }
  return getUserGroupNames(authUser).some(n => INTERNAL_GROUPS.includes(n));
}

/** True if the user is internal (treated identically to admin for rollout phase gating). */
export function isInternalUser(authUser: AuthDemoUser | null): boolean {
  return isAdminUser(authUser);
}

export function isOnboardingRestrictedUser(authUser: AuthDemoUser | null): boolean {
  if (!authUser || isAdminUser(authUser)) return false;
  return getUserGroupNames(authUser).some(name => LIMITED_ACCESS_GROUPS.includes(name));
}

/**
 * Check ANY (OR semantics) of a list of Phase A permissions for the
 * given resource. Mirrors how a feature would be granted when the
 * user has at least one of the listed permissions.
 */
export function hasAnyPermission(
  authUser: AuthDemoUser | null,
  permissions: PermissionId[],
  resource?: ResourceRef,
): boolean {
  if (permissions.length === 0) return true;
  const ref: ResourceRef = resource ?? {
    kind: inferResourceKind(permissions[0]),
    id: 'feature-gate',
    scope: defaultScope(),
  };
  for (const p of permissions) {
    const decision = authorizeForAuthUser(authUser, p, {
      ...ref,
      kind: inferResourceKind(p),
    });
    if (decision.allow) return true;
  }
  return false;
}

/**
 * Decide whether the user can VIEW the given feature. Encodes the
 * rule precedence:
 *   1. unknown id           → deny
 *   2. enabled === false    → deny (kill switch)
 *   3. internalOnly && !admin → deny
 *   4. admin / super-admin  → allow (always)
 *   5. any requiredPermission satisfied → allow
 *   6. any allowedGroupName matched     → allow
 *   7. no perms + no groups (open feature) → allow
 *   8. otherwise            → deny
 */
export function canViewFeature(
  authUser: AuthDemoUser | null,
  featureId: FeatureId,
  resource?: ResourceRef,
): FeatureDecision {
  const feature = FEATURE_BY_ID[featureId];
  if (!feature) {
    return {
      allow: false,
      reasonCode: 'deny.unknown_feature',
      reason: `Feature "${featureId}" is not registered in the catalog.`,
    };
  }

  if (feature.enabled === false) {
    return {
      allow: false,
      reasonCode: 'deny.feature_disabled',
      reason: `Feature "${feature.label}" is disabled (kill switch).`,
      feature,
    };
  }

  const userIsAdmin = isAdminUser(authUser);
  const userGroups = userIsAdmin ? [] : getUserGroupNames(authUser);

  if (feature.internalOnly && !userIsAdmin) {
    return {
      allow: false,
      reasonCode: 'deny.internal_only',
      reason: `"${feature.label}" is internal-only and not available for your role.`,
      feature,
    };
  }

  if (userIsAdmin) {
    return {
      allow: true,
      reasonCode: 'allow.admin',
      reason: 'Super Admin / Admin sees all enabled features.',
      feature,
    };
  }

  const isLimitedAccessUser = userGroups.some(name => LIMITED_ACCESS_GROUPS.includes(name));
  if (isLimitedAccessUser && !ONBOARDING_VISIBLE_FEATURES.has(featureId)) {
    return {
      allow: false,
      reasonCode: 'deny.onboarding_scope',
      reason: 'Onboarding users are limited to Taxonomy and Workflows.',
      feature,
    };
  }

  if (isLimitedAccessUser) {
    return {
      allow: true,
      reasonCode: 'allow.group_match',
      reason: 'Limited-access user can view Taxonomy and Workflows only.',
      feature,
    };
  }

  // Non-admin internal-phase guard (admins already short-circuited above)
  if (feature.rolloutPhase === 'internal') {
    return {
      allow: false,
      reasonCode: 'deny.rollout_phase',
      reason: `"${feature.label}" is in internal rollout phase.`,
      feature,
    };
  }

  const hasPerms = (feature.requiredPermissions?.length ?? 0) > 0;
  const hasGroups = (feature.allowedGroupNames?.length ?? 0) > 0;

  if (hasPerms && hasAnyPermission(authUser, feature.requiredPermissions!, resource)) {
    return {
      allow: true,
      reasonCode: 'allow.permission_granted',
      reason: 'User has at least one required permission.',
      feature,
    };
  }

  if (hasGroups) {
    if (userGroups.some(g => feature.allowedGroupNames!.includes(g))) {
      return {
        allow: true,
        reasonCode: 'allow.group_match',
        reason: 'User group is on the allow list.',
        feature,
      };
    }
  }

  if (!hasPerms && !hasGroups) {
    // Open feature — visible to any authenticated user.
    return {
      allow: true,
      reasonCode: 'allow.open',
      reason: 'Feature has no permission or group restriction.',
      feature,
    };
  }

  return {
    allow: false,
    reasonCode: 'deny.permission_not_granted',
    reason: `"${feature.label}" is not available for your role or rollout phase.`,
    feature,
  };
}

/** Convenience wrapper for nav-item visibility — same rules as canViewFeature. */
export function canViewNavItem(
  authUser: AuthDemoUser | null,
  featureId: FeatureId,
): boolean {
  const feature = FEATURE_BY_ID[featureId];
  if (!feature) return false;
  if (feature.visibleInNav === false) return false;
  return canViewFeature(authUser, featureId).allow;
}

/** Convenience wrapper for route access — same rules as canViewFeature. */
export function canAccessRoute(
  authUser: AuthDemoUser | null,
  featureId: FeatureId,
  resource?: ResourceRef,
): FeatureDecision {
  return canViewFeature(authUser, featureId, resource);
}

/**
 * Check a single Phase A permission for an action (button click,
 * form submit, etc.). Always delegates to the existing authorize
 * engine. A missing resource is filled with the default org scope.
 */
export function canPerformAction(
  authUser: AuthDemoUser | null,
  permissionId: PermissionId,
  resource?: ResourceRef,
): boolean {
  const ref: ResourceRef = resource ?? {
    kind: inferResourceKind(permissionId),
    id: 'action-gate',
    scope: defaultScope(),
  };
  return authorizeForAuthUser(authUser, permissionId, {
    ...ref,
    kind: inferResourceKind(permissionId),
  }).allow;
}

/** Get the full list of features the user can currently view. */
export function getVisibleFeatures(authUser: AuthDemoUser | null): FeatureDefinition[] {
  return FEATURE_CATALOG.filter(f => canViewFeature(authUser, f.featureId).allow);
}

/** Get the subset of catalog feature ids that should appear in nav. */
export function getVisibleNavItems(authUser: AuthDemoUser | null): FeatureId[] {
  return FEATURE_CATALOG.filter(f => canViewNavItem(authUser, f.featureId)).map(f => f.featureId);
}

/** Get the rollout phases the user can see content from. */
export function getRolloutPhasesForUser(authUser: AuthDemoUser | null): RolloutPhase[] {
  const all: RolloutPhase[] = ['demo', 'full', 'clinical', 'office', 'trainer', 'pilot'];
  if (isInternalUser(authUser)) return [...all, 'internal'];
  return all;
}

/* ─── helpers ─────────────────────────────────────────────────── */

function inferResourceKind(permission: PermissionId): ResourceRef['kind'] {
  const prefix = permission.split('.')[0];
  switch (prefix) {
    case 'policy': return 'policy';
    case 'form':   return 'form';
    case 'ceu':    return 'ceu';
    case 'audit':  return 'audit';
    case 'phi':    return 'phi';
    case 'user':   return 'user';
    case 'system': return 'system';
    default:       return 'system';
  }
}
