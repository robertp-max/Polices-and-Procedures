import type {
  SuperAdminConfigEntry, SuperAdminIdentity, SuperAdminPermission,
} from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Super Admin authorization policy (config-driven, reviewable).
   ----------------------------------------------------------------------------
   This is an AUTHORIZATION + APPROVAL layer inside Brad — NOT a separate agent,
   model, harness, or service.

   Rules enforced here:
   • Identity is verified SERVER-SIDE against this allowlist, keyed by stable
     app auth user id / email — never by client-supplied role claims.
   • A regular user can never self-promote: roles in the request are ignored for
     the grant decision.
   • Brad/Nolan/model output can never grant Super Admin permissions (this module
     takes only the authenticated actor identity as input — never model text).
   • Fail closed: if identity/auth is unclear, isSuperAdmin=false.

   Stable IDs were sourced from the app identity layer
   (server/auth/appIdentityPersistence.ts: IDENTITY_ROLE_UPDATE_EXEMPT_USER_IDS /
   _EMAILS). Edit this config to change who may approve what.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Dee may approve cloud DEPLOYMENT changes only when explicitly enabled. */
function deeCloudDeployEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.BRAD_ALLOW_DEE_CLOUD_DEPLOY === 'true';
}

export function getSuperAdminConfig(env: NodeJS.ProcessEnv = process.env): SuperAdminConfigEntry[] {
  const dee: SuperAdminConfigEntry = {
    userId: 'usr-deeb-admin',
    emails: ['deeb@careindeed.com', 'dee@careindeed.com'],
    displayName: 'Dee',
    stableIdVerified: true,
    permissions: [
      'approve.report.executive',     // executive/admin reports
      'approve.qapi_packet',          // governance/QAPI packets
      ...(deeCloudDeployEnabled(env) ? (['approve.cloud_change.deploy'] as SuperAdminPermission[]) : []),
    ],
    notes: deeCloudDeployEnabled(env)
      ? 'Cloud deploy approval ENABLED via BRAD_ALLOW_DEE_CLOUD_DEPLOY=true.'
      : 'Cloud deploy approval disabled by default (set BRAD_ALLOW_DEE_CLOUD_DEPLOY=true to enable).',
  };

  return [
    {
      userId: 'demo-user-careindeed',
      emails: ['robertp@careindeed.com'],
      displayName: 'Robert Padilla',
      stableIdVerified: true,
      permissions: [
        'approve.event_packet',
        'approve.qapi_minutes',
        'approve.cloud_change.low_risk',
        'approve.brad_object',
        'approve.test_data_cleanup',
      ],
      notes: 'Primary Super Admin / app owner.',
    },
    {
      userId: 'usr-marites',
      emails: ['maritesa@careindeed.com', 'marites@careindeed.com'],
      displayName: 'Marites',
      stableIdVerified: true,
      permissions: [
        'approve.event_packet',         // operational/event packet generation
        'approve.meeting_packet',       // meeting packet generation
        'approve.evidence_checklist',   // evidence checklist creation
        'approve.report.non_cloud',     // non-cloud report generation
      ],
      notes: 'Operational approver.',
    },
    dee,
  ];
}

export interface ActorIdentityInput {
  userId?: string;
  email?: string;
  authenticated: boolean;
  actorType: 'user' | 'service' | 'system';
}

/** Verify Super Admin status from the AUTHENTICATED actor identity only.
    Fail-closed: anything unclear → not a Super Admin. */
export function verifySuperAdmin(
  input: ActorIdentityInput,
  env: NodeJS.ProcessEnv = process.env,
): SuperAdminIdentity {
  if (!input.authenticated || input.actorType !== 'user' || !input.userId) {
    return { isSuperAdmin: false, permissions: [], reason: 'not an authenticated user actor' };
  }
  const config = getSuperAdminConfig(env);
  const normEmail = input.email?.trim().toLowerCase();

  const match = config.find(
    (c) =>
      c.userId === input.userId ||
      (!!normEmail && c.emails.map((e) => e.toLowerCase()).includes(normEmail)),
  );

  if (!match) {
    return { isSuperAdmin: false, permissions: [], reason: 'user not in Super Admin allowlist' };
  }
  if (!match.stableIdVerified) {
    return {
      isSuperAdmin: false,
      permissions: [],
      reason: `Super Admin entry for ${match.displayName} lacks a verified stable id (config placeholder)`,
    };
  }
  return {
    isSuperAdmin: true,
    userId: match.userId,
    displayName: match.displayName,
    permissions: match.permissions,
  };
}

export function hasPermission(identity: SuperAdminIdentity, permission: SuperAdminPermission): boolean {
  return identity.isSuperAdmin && identity.permissions.includes(permission);
}
