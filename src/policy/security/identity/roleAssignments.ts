import type { RoleAssignment } from './types';

const START = '2026-01-01T00:00:00.000Z';

export const ROLE_ASSIGNMENTS: RoleAssignment[] = [
  {
    id: 'asn-super-admin',
    userId: 'demo-user-careindeed',
    groupId: 'grp-super-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-admin',
    userId: 'usr-admin',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-deeb-admin',
    userId: 'usr-deeb-admin',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-rn',
    userId: 'usr-rn',
    groupId: 'grp-rn',
    scope: { organizationId: 'careindeed-demo', branchId: 'branch-west' },
    effectiveFrom: START,
  },
  {
    id: 'asn-lvn',
    userId: 'usr-lvn',
    groupId: 'grp-lvn',
    scope: { organizationId: 'careindeed-demo', branchId: 'branch-west' },
    effectiveFrom: START,
  },
  {
    id: 'asn-chha',
    userId: 'usr-chha',
    groupId: 'grp-chha',
    scope: { organizationId: 'careindeed-demo', branchId: 'branch-west' },
    effectiveFrom: START,
  },
  {
    id: 'asn-compliance',
    userId: 'usr-compliance',
    groupId: 'grp-compliance',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-auditor',
    userId: 'usr-auditor',
    groupId: 'grp-auditor',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-onboarding',
    userId: 'usr-onboarding',
    groupId: 'grp-onboarding',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-billing',
    userId: 'usr-billing',
    groupId: 'grp-billing',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-director',
    userId: 'usr-director',
    groupId: 'grp-director',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-executive',
    userId: 'usr-executive',
    groupId: 'grp-executive',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-suspended',
    userId: 'usr-suspended',
    groupId: 'grp-rn',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-dagny',
    userId: 'usr-dagny',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-janine',
    userId: 'usr-janine',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-reden',
    userId: 'usr-reden',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
  {
    id: 'asn-monserat',
    userId: 'usr-monserat',
    groupId: 'grp-admin',
    scope: { organizationId: 'careindeed-demo' },
    effectiveFrom: START,
  },
];

export function getActiveAssignments(userId: string, atIso: string): RoleAssignment[] {
  const at = Date.parse(atIso);
  return ROLE_ASSIGNMENTS.filter((assignment) => {
    if (assignment.userId !== userId) return false;
    if (assignment.revokedAt) return false;

    const from = Date.parse(assignment.effectiveFrom);
    if (Number.isNaN(from) || from > at) return false;

    if (!assignment.effectiveTo) return true;

    const to = Date.parse(assignment.effectiveTo);
    if (Number.isNaN(to)) return false;
    return at <= to;
  });
}
