/**
 * COG-2 — authoritative route access matrix.
 *
 * Single source of truth for how each mounted /api router is protected. The
 * boundary (requireApiAuth) and a completeness test both consume this so no
 * mounted protected router can be silently omitted.
 */
export type AccessClass =
  | 'PUBLIC'            // reachable without a token (narrow, explicit)
  | 'AUTHENTICATED'     // any verified, active canonical user
  | 'ROLE_RESTRICTED'   // verified user holding one of `roles`
  | 'ADMIN'             // verified user holding a privileged admin role
  | 'SELF_GUARDED';     // router verifies the token/role itself (login + admin-user-access)

export interface RouteAccessEntry {
  /** Mount prefix under /api (without the leading /api). */
  mount: string;
  access: AccessClass;
  /** Allowed role-group ids for ROLE_RESTRICTED / ADMIN entries. */
  roles?: string[];
  /** Exact public sub-paths (full /api path) exempted from the auth boundary. */
  publicPaths?: string[];
  note: string;
}

/** Admin role groups (canonical ids — none invented). */
export const ADMIN_ROLE_GROUPS = ['grp-super-admin', 'grp-admin', 'grp-system', 'grp-user-access-admin'];
/** Audit administration/export + compliance read. */
export const AUDIT_ADMIN_ROLES = [
  'grp-super-admin', 'grp-admin', 'grp-user-access-admin',
  'grp-leadership-compliance-officer', 'grp-office-compliance',
];

export const ROUTE_ACCESS_MATRIX: RouteAccessEntry[] = [
  {
    mount: 'auth',
    access: 'SELF_GUARDED',
    publicPaths: [], // whole router mounted before the boundary
    note: 'Login/session lifecycle. Public login family + self-verified /me, /logout, /refresh, and /admin/* (assertAdminAccessToken). Mounted before the auth boundary.',
  },
  {
    mount: 'admin/user-access',
    access: 'SELF_GUARDED',
    roles: ADMIN_ROLE_GROUPS,
    note: 'COG-2 admin user access. Each endpoint resolves the verified actor and role-gates internally; also mounted behind requireRole at the mount for defense in depth.',
  },
  { mount: 'calendar', access: 'AUTHENTICATED', note: 'Regulatory-planner Google Calendar bridge. Verified user required; mutation-level role gates are follow-on.' },
  { mount: 'ces', access: 'AUTHENTICATED', publicPaths: ['/api/ces/health'], note: 'CES sprint/evidence ops. /health is public; everything else requires a verified user.' },
  { mount: 'hubstaff', access: 'AUTHENTICATED', note: 'Hubstaff integration. Verified user required.' },
  { mount: 'ecign', access: 'AUTHENTICATED', note: 'eCIgn signing workspace. Verified user required; eCIgn step-up (COG-1) unchanged.' },
  { mount: 'audit', access: 'ADMIN', roles: AUDIT_ADMIN_ROLES, note: 'Audit read/verify-chain — administration/export surface. Role-restricted.' },
  { mount: 'audit/v2', access: 'ADMIN', roles: AUDIT_ADMIN_ROLES, note: 'Audit v2 admin surface. Role-restricted.' },
  { mount: 'ceu', access: 'AUTHENTICATED', note: 'CEU records. Verified user required.' },
  { mount: 'compliance', access: 'AUTHENTICATED', note: 'Compliance surface. Verified user required; administration-level role gates are follow-on.' },
  { mount: 'pm', access: 'AUTHENTICATED', note: 'PM/tasks. Verified user required.' },
  { mount: 'ia', access: 'AUTHENTICATED', publicPaths: ['/api/ia/health'], note: 'Compliance Intelligence. /health is public; queries require a verified user.' },
  { mount: 'brad', access: 'AUTHENTICATED', note: 'Brad assistant. Verified user required; privileged /superadmin/* actions self-verify super-admin server-side (verifySuperAdmin) using the verified actor.' },
];

/** All exact public sub-paths the boundary must let through anonymously. */
export function publicApiPaths(): string[] {
  return ROUTE_ACCESS_MATRIX.flatMap((e) => e.publicPaths ?? []);
}

/** Mount prefixes that sit BEHIND the auth boundary (business routers). */
export function boundaryProtectedMounts(): string[] {
  return ROUTE_ACCESS_MATRIX.filter((e) => e.access !== 'SELF_GUARDED').map((e) => e.mount);
}
