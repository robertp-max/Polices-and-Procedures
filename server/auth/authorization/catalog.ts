/**
 * ADR-0002 Phase 3A — server-authoritative security-group + permission catalog.
 *
 * The permission catalog and group→permission table are shared domain DATA
 * (src/policy/security/identity). Phase 3 makes their EVALUATION server-
 * authoritative: this module is the single server home for expanding a user's
 * group assignments into effective permissions. It imports the shared catalog
 * (no re-typing, no drift) and adds the server evaluation primitives.
 *
 * Drift note (inventory §4.1): before this, group→permission expansion existed
 * ONLY client-side (authorize.ts). The server resolved group ids but never
 * expanded them. This module closes that gap.
 */
import { PERMISSION_CATALOG, PERMISSION_BY_ID } from '@/policy/security/identity/permissionCatalog';
import { USER_GROUPS, USER_GROUP_BY_ID } from '@/policy/security/identity/userGroups';
import type { Permission, PermissionId, Scope, UserGroup } from '@/policy/security/identity/types';

export { PERMISSION_CATALOG, PERMISSION_BY_ID, USER_GROUPS, USER_GROUP_BY_ID };
export type { Permission, PermissionId, Scope, UserGroup };

/** Bump when the evaluation rules change; stamped onto every AuthorizationDecision. */
export const POLICY_VERSION = 'authz.v1';

/** Single server-authoritative set of privileged group ids (unifies the three
 *  duplicated copies found in the inventory: appIdentityPersistence, actorResolver,
 *  and the client store). */
export const PRIVILEGED_GROUP_IDS: ReadonlySet<string> = new Set([
  'grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin',
]);

export const SUPER_ADMIN_GROUP_ID = 'grp-super-admin';

/** Expand a set of group ids to the union of permissions they grant. Unknown
 *  group ids are ignored (fail-closed: they contribute nothing). */
export function permissionsForGroups(groupIds: readonly string[]): Set<PermissionId> {
  const out = new Set<PermissionId>();
  for (const gid of groupIds) {
    const group = USER_GROUP_BY_ID[gid];
    if (!group) continue;
    for (const perm of group.permissions) out.add(perm);
  }
  return out;
}

/** Which of the supplied groups grant a given permission — used to explain a
 *  decision's provenance (AuthorizationSource). */
export function groupsGranting(permission: PermissionId, groupIds: readonly string[]): string[] {
  return groupIds.filter((gid) => USER_GROUP_BY_ID[gid]?.permissions.includes(permission));
}

/** True if any supplied group is privileged. */
export function hasPrivilegedGroup(groupIds: readonly string[]): boolean {
  return groupIds.some((gid) => PRIVILEGED_GROUP_IDS.has(gid));
}
