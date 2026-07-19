/**
 * COG-2 hotfix — unified user-status authority.
 *
 * Regression target: an approved-administrator EMAIL that carries no canonical
 * admin *group* must still be authorized to suspend/reactivate, and a canonical
 * admin-group actor that is not on the email allowlist must also be authorized.
 * Either source grants; neither present denies. The predicate is pure and the
 * admin-email check is injected, so the allowlist algorithm is not duplicated.
 */
import { describe, expect, it } from 'vitest';
import { resolveServerActor } from './actorResolver.js';
import { actorMayManageUserStatus } from './userStatusAuthority.js';
import type { AppIdentityRegistry } from './appIdentityPersistence.js';

const NOW_ISO = '2027-01-15T00:00:00.000Z';

function registry(): AppIdentityRegistry {
  return {
    users: [
      // Approved-admin EMAIL but only a non-privileged clinical group.
      { id: 'usr-boss', email: 'boss@careindeed.com', name: 'Belinda Boss', status: 'active', authSubject: 'sub-boss' },
      // Canonical admin GROUP but NOT on the email allowlist.
      { id: 'usr-grpadmin', email: 'grpadmin@careindeed.com', name: 'Gene GroupAdmin', status: 'active', authSubject: 'sub-grp' },
      // Ordinary user — neither source.
      { id: 'usr-nurse', email: 'nurse@careindeed.com', name: 'Nora Nurse', status: 'active', authSubject: 'sub-nurse' },
    ],
    assignments: [
      { id: 'a1', userId: 'usr-boss', groupId: 'grp-rn', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
      { id: 'a2', userId: 'usr-grpadmin', groupId: 'grp-user-access-admin', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
      { id: 'a3', userId: 'usr-nurse', groupId: 'grp-rn', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
    ],
  };
}

const actor = (sub: string, email: string) =>
  resolveServerActor({ sub, email }, registry(), NOW_ISO);

const onlyBossIsAdmin = (email?: string | null) => (email ?? '').toLowerCase() === 'boss@careindeed.com';
const noAdminEmails = () => false;

describe('actorMayManageUserStatus', () => {
  it('authorizes an approved-admin email even with NO canonical admin group (the regression)', () => {
    const boss = actor('sub-boss', 'boss@careindeed.com');
    expect(boss.roles).toEqual(['grp-rn']); // no privileged group
    expect(actorMayManageUserStatus(boss, onlyBossIsAdmin)).toBe(true);
  });

  it('denies that same actor if the email is NOT on the allowlist and it has no admin group', () => {
    const boss = actor('sub-boss', 'boss@careindeed.com');
    expect(actorMayManageUserStatus(boss, noAdminEmails)).toBe(false);
  });

  it('authorizes a canonical admin-group actor even when not on the email allowlist', () => {
    const grpAdmin = actor('sub-grp', 'grpadmin@careindeed.com');
    expect(actorMayManageUserStatus(grpAdmin, noAdminEmails)).toBe(true);
  });

  it('denies an ordinary user from neither source', () => {
    const nurse = actor('sub-nurse', 'nurse@careindeed.com');
    expect(actorMayManageUserStatus(nurse, noAdminEmails)).toBe(false);
    expect(actorMayManageUserStatus(nurse, onlyBossIsAdmin)).toBe(false);
  });

  it('never trusts a blank/undefined actor email as admin', () => {
    const nurse = { ...actor('sub-nurse', 'nurse@careindeed.com'), email: undefined } as never;
    expect(actorMayManageUserStatus(nurse, onlyBossIsAdmin)).toBe(false);
  });
});
