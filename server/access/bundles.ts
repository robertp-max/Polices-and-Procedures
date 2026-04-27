/**
 * Permission bundles
 * ─────────────────────────────────────────────────────────────────────────────
 * Initial permission bundles per `Builder/Enterprise/01-Enterprise-Access-Control.md` §7.
 * These are deliberately data, not code: in production they should be loaded
 * from a versioned, dual-signed configuration store. For now they live as
 * a typed constant so the PDP has something concrete to evaluate.
 */

export interface PermissionBundle {
  role_id: string;
  permissions: string[]; // "<resource_type>:<action>"
  description: string;
}

/** Wildcard token: a permission of `"*"` action means any verb on that resource. */
export const ROLE_BUNDLES: PermissionBundle[] = [
  {
    role_id: 'compliance_officer',
    description: 'Day-to-day compliance operator.',
    permissions: [
      'audit:view', 'audit:list', 'audit:search', 'audit:export', 'audit:replay',
      'dossier:view', 'dossier:export',
      'execution_unit:view', 'execution_unit:list', 'execution_unit:reassign', 'execution_unit:withdraw',
      'execution_batch:view', 'execution_batch:list', 'execution_batch:withdraw', 'execution_batch:attest',
      'evidence:view', 'evidence:reject',
      'signature:view', 'signature:request',
      'gate:view', 'gate:evaluate',
      'override:request', 'override:approve',
      'policy:view', 'policy:author', 'policy:publish',
      'role_assignment:grant',
      'workflow:view', 'form:view',
      'vendor:view', 'appointment:view',
      'phi:view',
      'incident:view', 'incident:create',
      'qapi:view', 'qapi:create',
    ],
  },
  {
    role_id: 'administrator',
    description: 'Administrator: governance + dual-sig partner.',
    permissions: [
      'role_assignment:grant', 'role_assignment:revoke',
      'override:approve', 'override:revoke',
      'appointment:sign',
      'vendor:engage', 'baa:execute',
      'audit:view', 'audit:export',
      'delegation_matrix:author', 'delegation_matrix:publish',
      'execution_batch:view', 'execution_batch:attest',
      'execution_unit:view',
      'access_policy:view', 'access_policy:approve',
    ],
  },
  {
    role_id: 'privacy_officer',
    description: 'HIPAA Privacy oversight.',
    permissions: [
      'audit:view', 'audit:export',
      'phi:view', 'phi:export',
      'incident:view', 'incident:create', 'incident:approve',
      'policy:view',
      'execution_unit:view', 'execution_batch:view',
    ],
  },
  {
    role_id: 'security_officer',
    description: 'HIPAA Security oversight + chain integrity.',
    permissions: [
      'audit:view', 'audit:export', 'audit:replay',
      'access_policy:view',
      'execution_unit:view', 'execution_batch:view',
      'incident:view',
      'system_config:view', 'system_config:approve',
    ],
  },
  {
    role_id: 'clinical_manager',
    description: 'Branch / team supervisor.',
    permissions: [
      'execution_unit:view', 'execution_unit:list',
      'execution_batch:view', 'execution_batch:list',
      'evidence:view', 'evidence:create',
      'signature:request', 'signature:view',
      'competency:finalize',
      'workflow:view', 'form:view',
      'gate:view',
    ],
  },
  {
    role_id: 'rn_clinician',
    description: 'Field clinician.',
    permissions: [
      'execution_unit:view',
      'evidence:create', 'evidence:view',
      'signature:request', 'signature:view',
      'workflow:view', 'form:view',
    ],
  },
  {
    role_id: 'auditor_internal',
    description: 'Read-only audit role.',
    permissions: [
      'audit:view', 'audit:list', 'audit:search', 'audit:replay', 'audit:export',
      'dossier:view', 'dossier:export',
      'execution_unit:view', 'execution_batch:view',
      'gate:view',
      'policy:view', 'workflow:view', 'form:view',
      'signature:view', 'evidence:view',
    ],
  },
  {
    role_id: 'auditor_external',
    description: 'Read-only external auditor; no PHI by default.',
    permissions: [
      'audit:view', 'audit:list', 'audit:search', 'audit:replay',
      'dossier:view',
      'execution_unit:view', 'execution_batch:view',
      'gate:view',
      'policy:view',
      'signature:view', 'evidence:view',
    ],
  },
  {
    role_id: 'system_service',
    description: 'Internal service principal.',
    permissions: [
      // services act on behalf of the engine; specific scopes are checked by SoD + ABAC
      'execution_unit:create', 'execution_unit:update',
      'execution_batch:create', 'execution_batch:update',
      'evidence:create',
      'signature:request',
      'gate:evaluate',
      'audit:write_internal',
    ],
  },
];

const BY_ROLE = new Map<string, PermissionBundle>(ROLE_BUNDLES.map(b => [b.role_id, b]));

/** Effective permissions for a set of role IDs (union). */
export function effectivePermissions(roles: string[]): Set<string> {
  const out = new Set<string>();
  for (const r of roles) {
    const b = BY_ROLE.get(r);
    if (!b) continue;
    for (const p of b.permissions) out.add(p);
  }
  return out;
}

export const ACCESS_POLICY_VERSION = 1;
