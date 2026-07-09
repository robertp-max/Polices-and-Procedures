/**
 * Centralized admin role helper for Community/Profile/Admin features.
 * Positive-only, role-based access.
 * Aligned with canViewCommunityProfile logic but extended for management.
 *
 * Demo-only until Phase 2F: `useAuth()` returns a hardcoded Administrator, so
 * these gates are soft scaffolding — not a real security boundary.
 * Prefer identity group membership via `isAdminUser` (featureAccess) when a
 * DemoUser-shaped auth object is available.
 */

export const ADMIN_ROLES = ['admin', 'owner', 'security', 'system_admin', 'super_admin'] as const;

/** Identity group names that grant admin UI (mirrors featureAccess INTERNAL_GROUPS). */
export const ADMIN_GROUP_NAMES = ['Super Admin', 'Admin', 'System'] as const;

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return ADMIN_ROLES.some(ar => r.includes(ar));
}

export function canManageCommunityProfiles(user?: { role?: string | null } | null): boolean {
  return isAdminRole(user?.role);
}

/** Admin Users / directory management (same string-role check as community profiles). */
export function canManageAdminUsers(user?: { role?: string | null } | null): boolean {
  return isAdminRole(user?.role);
}

/**
 * True when either the loose auth role string OR identity group membership
 * indicates admin. Use when you have both useAuth().user and group names.
 */
export function isDemoAdminAccess(opts: {
  role?: string | null;
  groupNames?: readonly string[] | null;
}): boolean {
  if (isAdminRole(opts.role)) return true;
  if (!opts.groupNames?.length) return false;
  return opts.groupNames.some(n =>
    (ADMIN_GROUP_NAMES as readonly string[]).includes(n),
  );
}
