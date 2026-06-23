import { DEMO_USERS, resolveUserIdFromAuth } from '../src/policy/security/identity/demoUsers';
import {
  DEFAULT_AUTHENTICATED_GROUP_ID,
  isIdentityRoleUpdateExempt,
} from '../src/policy/security/identity/identityNormalization';
import { getIdentityRegistrySnapshot, useUserAssignmentsStore } from '../src/policy/security/identity/userAssignmentsStore';
import { USER_GROUP_BY_ID } from '../src/policy/security/identity/userGroups';
import { canViewFeature, isOnboardingRestrictedUser } from '../src/policy/security/features/featureAccess';
import type { RoleAssignment, User } from '../src/policy/security/identity/types';

type Check = { label: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function check(label: string, ok: boolean, detail?: string): void {
  checks.push({ label, ok, detail });
  const prefix = ok ? 'PASS' : 'FAIL';
  const suffix = detail ? ` :: ${detail}` : '';
  console.log(`${prefix}  ${label}${suffix}`);
}

function usersByEmail(email: string): User[] {
  return getIdentityRegistrySnapshot().users.filter(user => user.email.toLowerCase() === email.toLowerCase());
}

function activeAssignment(userId: string): RoleAssignment | undefined {
  return getIdentityRegistrySnapshot().assignments.find(assignment => assignment.userId === userId && !assignment.revokedAt);
}

const store = useUserAssignmentsStore.getState();

check(
  'seeded bootstrap admin remains present',
  !!store.getUserById('demo-user-careindeed'),
);

const expectedExemptGroups = new Map([
  ['demo-user-careindeed', 'grp-super-admin'],
  ['usr-marites', 'grp-super-admin'],
  ['usr-deeb-admin', 'grp-admin'],
]);
const seedAssignmentsOk = DEMO_USERS.every(user => {
  const assignment = activeAssignment(user.id);
  const expected = isIdentityRoleUpdateExempt(user)
    ? expectedExemptGroups.get(user.id)
    : DEFAULT_AUTHENTICATED_GROUP_ID;
  return assignment?.groupId === expected;
});
check('seeded non-exempt users are assigned to onboarding', seedAssignmentsOk);
check('TJ, Marites, and Deeb remain exempt from onboarding reassignment', [...expectedExemptGroups].every(([userId, groupId]) => activeAssignment(userId)?.groupId === groupId));

const realUser = {
  authSubject: 'Cognito-Sub-ABC',
  provider: 'cognito',
  email: 'Real.User@CareIndeed.com',
  firstName: 'Real',
  lastName: 'User',
  emailVerified: true,
};
store.upsertAuthenticatedUser(realUser);
const realUserId = resolveUserIdFromAuth(realUser);
const realAppUser = store.getUserById(realUserId);
const realAssignment = activeAssignment(realUserId);

check('real authenticated user appears by stable subject id', !!realAppUser, realUserId);
check('real authenticated user email is normalized lowercase', realAppUser?.email === 'real.user@careindeed.com');
check('real authenticated user receives onboarding role', realAssignment?.groupId === DEFAULT_AUTHENTICATED_GROUP_ID);

const onboardingPermissions = USER_GROUP_BY_ID[DEFAULT_AUTHENTICATED_GROUP_ID]?.permissions ?? [];
check('onboarding default grants no PHI permissions', !onboardingPermissions.includes('phi.read') && !onboardingPermissions.includes('phi.write'));
check('onboarding default grants no admin permissions', !onboardingPermissions.includes('user.provision') && !onboardingPermissions.includes('user.suspend'));
check('real authenticated user is onboarding-restricted', isOnboardingRestrictedUser(realUser));
check('onboarding user can view taxonomy feature', canViewFeature(realUser, 'frameworkTaxonomy.view').allow);
check('onboarding user can view workflows feature', canViewFeature(realUser, 'workflows.view').allow);
check('onboarding user cannot view dashboard feature', !canViewFeature(realUser, 'dashboard.view').allow);
check('onboarding user cannot view onboarding-v2 feature', !canViewFeature(realUser, 'onboardingV2.view').allow);

store.upsertAuthenticatedUser({ ...realUser, email: 'REAL.USER@careindeed.com' });
check('same email with different casing does not duplicate user', usersByEmail('real.user@careindeed.com').length === 1);

store.hydrateRegistry({
  users: [{
    id: 'email:reconcile.case@careindeed.com',
    email: 'reconcile.case@careindeed.com',
    name: 'Reconcile Case',
    status: 'active',
    source: 'manual-provisioned',
  }],
  assignments: [{
    id: 'asn-reconcile-case',
    userId: 'email:reconcile.case@careindeed.com',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: '2026-01-01T00:00:00.000Z',
  }],
});
const reconciledAuth = {
  authSubject: 'reconcile-subject',
  provider: 'cognito',
  email: 'Reconcile.Case@CareIndeed.com',
  name: 'Reconcile Case',
  emailVerified: true,
};
store.upsertAuthenticatedUser(reconciledAuth);
const reconciledUserId = resolveUserIdFromAuth(reconciledAuth);
const reconciledUsers = usersByEmail('reconcile.case@careindeed.com');
check('email assignment reconciles into auth subject user', reconciledUsers.length === 1 && reconciledUsers[0]?.id === reconciledUserId);
check('reconciled assignment is keyed by stable user id', activeAssignment(reconciledUserId)?.groupId === DEFAULT_AUTHENTICATED_GROUP_ID);

store.hydrateRegistry({
  users: [{
    id: 'email:inactive.case@careindeed.com',
    email: 'inactive.case@careindeed.com',
    name: 'Inactive Case',
    status: 'suspended',
    source: 'manual-provisioned',
  }],
  assignments: [],
});
const inactiveAuth = {
  authSubject: 'inactive-subject',
  provider: 'cognito',
  email: 'Inactive.Case@CareIndeed.com',
  name: 'Inactive Case',
  emailVerified: true,
};
store.upsertAuthenticatedUser(inactiveAuth);
const inactiveUser = store.getUserById(resolveUserIdFromAuth(inactiveAuth));
check('re-login does not reactivate suspended app user', inactiveUser?.status === 'suspended');

const failed = checks.filter(result => !result.ok);
console.log(failed.length === 0 ? '\nverify:identity-sync OK' : `\nverify:identity-sync FAILED (${failed.length})`);
process.exit(failed.length === 0 ? 0 : 1);
