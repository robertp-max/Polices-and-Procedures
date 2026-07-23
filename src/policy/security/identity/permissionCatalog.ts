import type { Permission } from './types';

export const PERMISSION_CATALOG: Permission[] = [
  { id: 'policy.view', resource: 'policy', action: 'view', phi: false, description: 'Read policy content.' },
  { id: 'policy.draft', resource: 'policy', action: 'draft', phi: false, description: 'Edit policy draft content.' },
  { id: 'policy.approve', resource: 'policy', action: 'approve', phi: false, description: 'Approve policy version.' },
  { id: 'policy.publish', resource: 'policy', action: 'publish', phi: false, description: 'Publish approved policy version.' },

  { id: 'form.view', resource: 'form', action: 'view', phi: false, description: 'Read form structure and status.' },
  { id: 'form.sign', resource: 'form', action: 'sign', phi: false, description: 'Apply signature action on forms.' },

  { id: 'ceu.view', resource: 'ceu', action: 'view', phi: false, description: 'Read CEU/workflow state.' },
  { id: 'ceu.assign', resource: 'ceu', action: 'assign', phi: false, description: 'Assign CEU/workflow work.' },
  { id: 'ceu.execute', resource: 'ceu', action: 'execute', phi: false, description: 'Execute CEU/workflow tasks.' },
  { id: 'ceu.complete', resource: 'ceu', action: 'complete', phi: false, description: 'Complete CEU/workflow unit.' },
  { id: 'ceu.override', resource: 'ceu', action: 'override', phi: false, description: 'Perform override flow with dual approval.' },

  { id: 'audit.read', resource: 'audit', action: 'read', phi: false, description: 'Read audit trail and integrity state.' },
  { id: 'audit.export', resource: 'audit', action: 'export', phi: false, description: 'Export audit artifacts.' },

  { id: 'phi.read', resource: 'phi', action: 'read', phi: true, description: 'Read PHI payloads.' },
  { id: 'phi.write', resource: 'phi', action: 'write', phi: true, description: 'Write PHI payloads.' },

  { id: 'user.provision', resource: 'user', action: 'provision', phi: false, description: 'Create or provision user access.' },
  { id: 'user.suspend', resource: 'user', action: 'suspend', phi: false, description: 'Suspend user access.' },

  { id: 'system.replay', resource: 'system', action: 'replay', phi: false, description: 'Replay deterministic event streams.' },

  { id: 'governance.portal.access', resource: 'governance', action: 'portal.access', phi: false, description: 'Enter the Governing Body Portal. Portal entry only — not voting or Board authority, which is resolved separately against active appointment, term, charter, delegation, and conflict state.' },
];

export const PERMISSION_BY_ID = Object.fromEntries(
  PERMISSION_CATALOG.map(permission => [permission.id, permission]),
);
