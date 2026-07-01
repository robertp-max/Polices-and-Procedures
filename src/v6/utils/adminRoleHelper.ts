/**
 * Centralized admin role helper for Community/Profile/Admin features.
 * Positive-only, role-based access.
 * Aligned with canViewCommunityProfile logic but extended for management.
 */

export const ADMIN_ROLES = ['admin', 'owner', 'security', 'system_admin', 'super_admin'] as const;

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return ADMIN_ROLES.some(ar => r.includes(ar));
}

export function canManageCommunityProfiles(user?: { role?: string | null } | null): boolean {
  return isAdminRole(user?.role);
}
