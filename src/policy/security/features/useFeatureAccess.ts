/**
 * React hook wrappers around the pure featureAccess helpers. They
 * read the current auth user via useAuth() and re-subscribe to the
 * userAssignmentsStore so role edits in the admin pages immediately
 * propagate to all gates.
 */

import { useMemo } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useUserAssignmentsStore } from '../identity/userAssignmentsStore';
import type { PermissionId, ResourceRef } from '../identity/types';
import {
  canAccessRoute,
  canPerformAction,
  canViewFeature,
  canViewNavItem,
  getRolloutPhasesForUser,
  getUserGroupNames,
  getVisibleFeatures,
  getVisibleNavItems,
  isAdminUser,
  isInternalUser,
} from './featureAccess';
import type { FeatureDecision, FeatureId, RolloutPhase } from './types';

interface FeatureAccessApi {
  canViewFeature: (featureId: FeatureId, resource?: ResourceRef) => FeatureDecision;
  canViewNavItem: (featureId: FeatureId) => boolean;
  canAccessRoute: (featureId: FeatureId, resource?: ResourceRef) => FeatureDecision;
  canPerformAction: (permissionId: PermissionId, resource?: ResourceRef) => boolean;
  getVisibleFeatures: () => ReturnType<typeof getVisibleFeatures>;
  getVisibleNavItems: () => FeatureId[];
  getUserGroupNames: () => ReturnType<typeof getUserGroupNames>;
  getRolloutPhasesForUser: () => RolloutPhase[];
  isAdmin: boolean;
  isInternal: boolean;
}

/**
 * Hook returning a stable bag of access helpers bound to the current
 * auth user. Subscribes to user/assignment store edits so admin
 * changes in the user-groups page propagate immediately.
 */
export function useFeatureAccess(): FeatureAccessApi {
  const { user } = useAuth();
  // Subscribe to assignments mutations so gates re-render when the
  // admin pages add/edit/remove a user-group assignment.
  const assignmentsRev = useUserAssignmentsStore(s => s.assignments);
  const usersRev = useUserAssignmentsStore(s => s.users);

  return useMemo(() => ({
    canViewFeature: (id, resource) => canViewFeature(user, id, resource),
    canViewNavItem: id => canViewNavItem(user, id),
    canAccessRoute: (id, resource) => canAccessRoute(user, id, resource),
    canPerformAction: (perm, resource) => canPerformAction(user, perm, resource),
    getVisibleFeatures: () => getVisibleFeatures(user),
    getVisibleNavItems: () => getVisibleNavItems(user),
    getUserGroupNames: () => getUserGroupNames(user),
    getRolloutPhasesForUser: () => getRolloutPhasesForUser(user),
    isAdmin: isAdminUser(user),
    isInternal: isInternalUser(user),
  }), [user, assignmentsRev, usersRev]);
}
