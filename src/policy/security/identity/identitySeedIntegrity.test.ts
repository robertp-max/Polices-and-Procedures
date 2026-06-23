/// <reference types="node" />
/**
 * Seed integrity — identity / RBAC (admin-rbac foundation).
 *
 * Pure, read-only assertions so later waves can wire the admin screens against an
 * internally consistent RBAC seed:
 *   - deterministic, unique ids for users / groups / permissions / assignments
 *   - role assignments reference real users + groups
 *   - group permissions reference real catalog permission ids
 *
 * No screen/store wiring. Run via `npm run test:seed`.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEMO_USERS } from '@/policy/security/identity/demoUsers';
import { USER_GROUPS } from '@/policy/security/identity/userGroups';
import { PERMISSION_CATALOG } from '@/policy/security/identity/permissionCatalog';
import { ROLE_ASSIGNMENTS } from '@/policy/security/identity/roleAssignments';

const userIds = new Set(DEMO_USERS.map((u) => u.id));
const groupIds = new Set(USER_GROUPS.map((g) => g.id));
const permIds = new Set(PERMISSION_CATALOG.map((p) => p.id));

describe('identity / RBAC seed integrity', () => {
  it('ids are unique across users, groups, permissions, and assignments', () => {
    assert.equal(userIds.size, DEMO_USERS.length, 'user ids unique');
    assert.equal(groupIds.size, USER_GROUPS.length, 'group ids unique');
    assert.equal(permIds.size, PERMISSION_CATALOG.length, 'permission ids unique');
    const asnIds = new Set(ROLE_ASSIGNMENTS.map((a) => a.id));
    assert.equal(asnIds.size, ROLE_ASSIGNMENTS.length, 'assignment ids unique');
  });

  it('role assignments reference existing users and groups', () => {
    const unresolved: string[] = [];
    for (const a of ROLE_ASSIGNMENTS) {
      if (!userIds.has(a.userId)) unresolved.push(`${a.id}.userId -> ${a.userId}`);
      if (!groupIds.has(a.groupId)) unresolved.push(`${a.id}.groupId -> ${a.groupId}`);
    }
    assert.deepEqual(unresolved, [], `unresolved assignment references: ${unresolved.join('; ')}`);
  });

  it('group permissions reference catalog permission ids', () => {
    const unresolved: string[] = [];
    for (const g of USER_GROUPS) {
      for (const perm of g.permissions ?? []) {
        if (!permIds.has(perm)) unresolved.push(`${g.id} -> ${perm}`);
      }
    }
    assert.deepEqual(unresolved, [], `group permissions not in catalog: ${unresolved.join('; ')}`);
  });
});
