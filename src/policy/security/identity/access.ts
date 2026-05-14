import type { DemoUser as AuthDemoUser } from '@/auth/api';
import { resolveUserIdFromAuth } from './demoUsers';
import { getLiveActiveAssignments } from './userAssignmentsStore';
import { USER_GROUP_BY_ID } from './userGroups';

export interface AdminAccessResult {
  allowed: boolean;
  reason: string;
}

/**
 * Decide whether a user can see the Admin section of the UI
 * (`/admin/*` routes, sidebar Admin entry, permission/role/user-group
 * management).
 *
 * IMPORTANT: This is a **UI surface** gate, NOT a per-action permission
 * check. Action-level permissions (e.g. `user.provision`,
 * `user.suspend`, `policy.publish`) are still evaluated through
 * `authorize()` / `authorizeForAuthUser()` and remain the only thing
 * that can grant a destructive operation.
 *
 * Decoupling rationale:
 *   - `user.provision` was previously treated as the implicit signal
 *     for "Admin app access". That meant any group holding
 *     `user.provision` (e.g. Onboarding, which legitimately needs to
 *     provision new hires through scoped flows) automatically saw the
 *     full Admin section, security pages, and internal tooling.
 *   - We now gate the Admin UI by group membership in `Super Admin`
 *     or `Admin`, plus the legacy `super_admin` / `sys_admin`
 *     auth-role fallback for the demo bypass user.
 *   - Holding `user.provision` no longer grants Admin UI by itself.
 *     Trainers / Onboarding can still call provisioning APIs through
 *     the workflows they own, but they no longer see the Admin
 *     section in the sidebar or reach `/admin/*` routes.
 */
export function evaluateAdminAccess(authUser: AuthDemoUser | null): AdminAccessResult {
  const role = authUser?.role?.toLowerCase() ?? '';
  if (role === 'super_admin' || role === 'system_admin' || role === 'sys_admin') {
    return { allowed: true, reason: 'allow.system_admin_role' };
  }

  const userId = resolveUserIdFromAuth(authUser);
  const assignments = getLiveActiveAssignments(userId, new Date().toISOString());
  const groupNames = assignments
    .map(assignment => USER_GROUP_BY_ID[assignment.groupId]?.name)
    .filter((name): name is (typeof USER_GROUP_BY_ID)[keyof typeof USER_GROUP_BY_ID]['name'] => !!name);

  if (groupNames.includes('Super Admin') || groupNames.includes('Admin')) {
    return { allowed: true, reason: 'allow.admin_group' };
  }

  return {
    allowed: false,
    reason: 'User is not a member of the Super Admin or Admin group; provisioning permissions alone do not grant Admin UI access.',
  };
}
