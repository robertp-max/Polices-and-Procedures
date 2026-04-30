import type { UserGroup } from './types';

export const USER_GROUPS: UserGroup[] = [
  {
    id: 'grp-super-admin',
    name: 'Super Admin',
    description: 'Demo bootstrap admin with full Phase A permissions.',
    permissions: [
      'policy.view', 'policy.draft', 'policy.approve', 'policy.publish',
      'form.view', 'form.sign',
      'ceu.view', 'ceu.assign', 'ceu.execute', 'ceu.complete', 'ceu.override',
      'audit.read', 'audit.export',
      'phi.read', 'phi.write',
      'user.provision', 'user.suspend',
      'system.replay',
    ],
  },
  {
    id: 'grp-admin',
    name: 'Admin',
    description: 'Operations administration and access lifecycle tasks.',
    permissions: ['policy.view', 'form.view', 'ceu.view', 'ceu.assign', 'user.provision', 'user.suspend'],
  },
  {
    id: 'grp-rn',
    name: 'RN',
    description: 'Clinical registered nurse role.',
    permissions: ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read', 'phi.write'],
  },
  {
    id: 'grp-lvn',
    name: 'LVN',
    description: 'Clinical licensed vocational nurse role.',
    permissions: ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read', 'phi.write'],
  },
  {
    id: 'grp-chha',
    name: 'CHHA',
    description: 'Clinical home health aide role.',
    permissions: ['policy.view', 'form.view', 'form.sign', 'ceu.view', 'ceu.execute', 'ceu.complete', 'phi.read'],
  },
  {
    id: 'grp-compliance',
    name: 'Compliance',
    description: 'Compliance and audit operations.',
    permissions: ['policy.view', 'policy.draft', 'policy.publish', 'form.view', 'ceu.view', 'ceu.assign', 'ceu.override', 'audit.read', 'audit.export', 'user.suspend'],
  },
  {
    id: 'grp-auditor',
    name: 'Auditor',
    description: 'Read-only evidence and audit review.',
    permissions: ['policy.view', 'form.view', 'ceu.view', 'audit.read', 'audit.export'],
  },
  {
    id: 'grp-onboarding',
    name: 'Onboarding',
    description: 'Onboarding specialist assignment role.',
    permissions: ['policy.view', 'form.view', 'ceu.view', 'ceu.assign', 'user.provision'],
  },
  {
    id: 'grp-billing',
    name: 'Billing',
    description: 'Billing workflow participant role.',
    permissions: ['policy.view', 'form.view', 'ceu.view', 'ceu.execute', 'ceu.complete'],
  },
  {
    id: 'grp-director',
    name: 'Director',
    description: 'Director-level approvals and escalations.',
    permissions: ['policy.view', 'policy.approve', 'form.view', 'ceu.view', 'ceu.assign', 'ceu.override'],
  },
  {
    id: 'grp-executive',
    name: 'Executive',
    description: 'Executive approval and publish authority.',
    permissions: ['policy.view', 'policy.approve', 'policy.publish', 'form.view', 'ceu.view', 'ceu.override', 'audit.read'],
  },
  {
    id: 'grp-system',
    name: 'System',
    description: 'System-level deterministic replay permissions.',
    permissions: ['system.replay'],
  },
];

export const USER_GROUP_BY_ID = Object.fromEntries(
  USER_GROUPS.map(group => [group.id, group]),
);
