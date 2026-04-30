import type { DemoUser as AuthDemoUser } from '@/auth/api';
import { authorizeForAuthUser } from './authorize';
import { resolveUserIdFromAuth } from './demoUsers';
import { getActiveAssignments } from './roleAssignments';
import { USER_GROUP_BY_ID } from './userGroups';

export interface AdminAccessResult {
  allowed: boolean;
  reason: string;
}

export function evaluateAdminAccess(authUser: AuthDemoUser | null): AdminAccessResult {
  const permissionDecision = authorizeForAuthUser(authUser, 'user.provision', {
    kind: 'user',
    id: 'admin-nav-check',
    scope: { organizationId: 'careindeed-demo' },
  });

  if (permissionDecision.allow) {
    return { allowed: true, reason: 'allow.user_provision' };
  }

  const role = authUser?.role?.toLowerCase() ?? '';
  if (role === 'system_admin' || role === 'sys_admin') {
    return { allowed: true, reason: 'allow.system_admin_role' };
  }

  const userId = resolveUserIdFromAuth(authUser);
  const assignments = getActiveAssignments(userId, new Date().toISOString());
  const groupNames = assignments
    .map(assignment => USER_GROUP_BY_ID[assignment.groupId]?.name)
    .filter((name): name is (typeof USER_GROUP_BY_ID)[keyof typeof USER_GROUP_BY_ID]['name'] => !!name);

  if (groupNames.includes('Super Admin') || groupNames.includes('Admin')) {
    return { allowed: true, reason: 'allow.admin_group' };
  }

  return {
    allowed: false,
    reason: permissionDecision.reason || 'User lacks Admin access permission.',
  };
}
