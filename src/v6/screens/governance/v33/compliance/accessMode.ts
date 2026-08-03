// Governing Body tabletop ACCESS TIER resolution.
//
// ─────────────────────────────────────────────────────────────────────────────
// THREAT MODEL — read before changing anything in this file.
//
// The access tier decides who may open a tabletop exercise BEFORE readiness
// prerequisites are complete. It is therefore resolved from IMMUTABLE
// AUTHENTICATED IDENTITY ONLY:
//
//   * the server-provided `appRole` on the authenticated session, and
//   * a fixed allowlist keyed on stable identity (userId / cognitoSub / the
//     verified account email).
//
// It is NEVER resolved from:
//   * a URL / query / hash parameter,
//   * a localStorage or sessionStorage flag,
//   * an editable frontend role string held in component state,
//   * anything typed into a console or a dev panel,
//   * a DISPLAY NAME comparison. Display names are user-editable profile text
//     and are trivially spoofable; two accounts may legitimately share one.
//     Matching "Dee Bustos" by name would hand reviewer access to anyone who
//     renamed themselves. We match the account, not the label on it.
//
// PRIVILEGED ACCESS IS PREVIEW ACCESS. Both `superadmin` and `uat_reviewer`
// sessions:
//   * are visibly labeled in the UI,
//   * DO NOT satisfy training, policy, assessment, or tabletop requirements,
//   * DO NOT create official completion evidence (rejected in
//     complianceStore.commitEvidence — see PRIVILEGED_EVIDENCE_REJECTION),
//   * DO NOT advance the 30-day readiness calculation,
//   * DO NOT appear as an official participant attempt,
//   * ARE recorded in the privileged-access audit log below.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { toCanonicalRoleKey } from '@/policy/ecign/roleKey';

/** Access tiers for opening a Governing Body tabletop exercise. */
export type TabletopAccessMode = 'official' | 'superadmin' | 'uat_reviewer' | 'blocked';

/** The two tiers that bypass readiness prerequisites. Always preview-only. */
export type PrivilegedAccessMode = 'superadmin' | 'uat_reviewer';

/** Canonical role key that grants full Super Admin access. */
export const SUPER_ADMIN_ROLE_KEY = 'super_admin';

/**
 * Precedence, highest first. Exported so the UI and the tests assert against
 * the same ordering rather than restating it.
 */
export const TABLETOP_ACCESS_MODE_PRECEDENCE: readonly TabletopAccessMode[] = [
  'uat_reviewer',
  'superadmin',
  'official',
  'blocked',
] as const;

export function isPrivilegedAccessMode(mode: TabletopAccessMode | null | undefined): mode is PrivilegedAccessMode {
  return mode === 'superadmin' || mode === 'uat_reviewer';
}

/**
 * UAT reviewer allowlist — resolved by IMMUTABLE AUTHENTICATED IDENTITY.
 *
 * Dee Bustos reviews tabletop exercises before her own readiness prerequisites
 * are complete. She is identified by the stable identifiers her IdP issues
 * (`userId` / `cognitoSub`) or by her verified account email — NOT by
 * `displayName`, which is editable profile text an impostor could copy.
 *
 * `emails` is a fallback stable identifier for accounts whose Cognito sub is
 * not yet recorded here; it is compared case-insensitively after trimming, and
 * ONLY against the email on the authenticated session (never a typed value).
 * When the reviewer's subject id is known, add it to `subjectIds` and the email
 * entry becomes redundant.
 */
export const UAT_REVIEWER_ALLOWLIST: {
  readonly subjectIds: readonly string[];
  readonly emails: readonly string[];
} = {
  subjectIds: ['usr-deeb-admin'],
  emails: ['deeb@careindeed.com'],
};

/**
 * The subset of the authenticated session this module is allowed to read.
 * Deliberately EXCLUDES `displayName` so no future edit can accidentally
 * introduce a name-based check.
 */
export interface TabletopAccessIdentity {
  userId?: string | null;
  cognitoSub?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  /** Server-provided, authoritative role. */
  appRole?: string | null;
  /** True only for the local-development demo bypass identity. */
  isDemo?: boolean | null;
  /** True when a real session exists. */
  authenticated: boolean;
}

function normalizedEmail(email: string | null | undefined): string {
  return String(email ?? '').trim().toLowerCase();
}

function normalizedId(id: string | null | undefined): string {
  return String(id ?? '').trim();
}

/**
 * True when the authenticated session carries the authoritative Super Admin
 * role. The local demo-bypass identity is explicitly excluded: it is a
 * client-side convenience whose `appRole` is hard-coded, so honoring it would
 * make every logged-out local visitor a super admin.
 */
export function isSuperAdminIdentity(identity: TabletopAccessIdentity | null | undefined): boolean {
  if (!identity?.authenticated) return false;
  if (identity.isDemo) return false;
  return toCanonicalRoleKey(identity.appRole) === SUPER_ADMIN_ROLE_KEY;
}

/**
 * True when the authenticated session matches the UAT reviewer allowlist by a
 * stable identifier. Display name is never consulted.
 */
export function isUatReviewerIdentity(identity: TabletopAccessIdentity | null | undefined): boolean {
  if (!identity?.authenticated) return false;
  if (identity.isDemo) return false;

  const subjects = new Set(UAT_REVIEWER_ALLOWLIST.subjectIds.map(normalizedId).filter(Boolean));
  const userId = normalizedId(identity.userId);
  const cognitoSub = normalizedId(identity.cognitoSub);
  if (userId && subjects.has(userId)) return true;
  if (cognitoSub && subjects.has(cognitoSub)) return true;

  if (identity.emailVerified !== true) return false;
  const emails = new Set(UAT_REVIEWER_ALLOWLIST.emails.map(normalizedEmail).filter(Boolean));
  const email = normalizedEmail(identity.email);
  return Boolean(email) && emails.has(email);
}

/** The privileged tier for this identity, or null when it holds none. */
export function resolvePrivilegedAccessMode(
  identity: TabletopAccessIdentity | null | undefined,
): PrivilegedAccessMode | null {
  // Dee's immutable reviewer identity is intentionally narrower than her
  // administrative role: tabletop sessions must be labeled UAT/reviewer.
  if (isUatReviewerIdentity(identity)) return 'uat_reviewer';
  if (isSuperAdminIdentity(identity)) return 'superadmin';
  return null;
}

/**
 * Full tier resolution. Precedence: uat_reviewer > superadmin > official > blocked.
 * `prerequisitesMet` is the launch gate's verdict for a NON-privileged learner.
 */
export function resolveTabletopAccessMode(
  identity: TabletopAccessIdentity | null | undefined,
  prerequisitesMet: boolean,
): TabletopAccessMode {
  const privileged = resolvePrivilegedAccessMode(identity);
  if (privileged) return privileged;
  // Fail closed: an unauthenticated session is never 'official', whatever a
  // prerequisite calculation says — official access is identity-bound.
  if (!identity?.authenticated) return 'blocked';
  return prerequisitesMet ? 'official' : 'blocked';
}

/** Narrows the auth user to the identity fields this module may read. */
export function toTabletopAccessIdentity(
  user:
    | {
        userId?: string | null;
        cognitoSub?: string | null;
        email?: string | null;
        emailVerified?: boolean | null;
        appRole?: string | null;
        isDemo?: boolean | null;
      }
    | null
    | undefined,
): TabletopAccessIdentity {
  if (!user) return { authenticated: false };
  return {
    userId: user.userId ?? null,
    cognitoSub: user.cognitoSub ?? null,
    email: user.email ?? null,
    emailVerified: user.emailVerified ?? false,
    // Only the SERVER-PROVIDED appRole is authoritative. The legacy `role`
    // alias is intentionally not read here.
    appRole: user.appRole ?? null,
    isDemo: user.isDemo ?? false,
    authenticated: true,
  };
}

/** The authenticated identity, narrowed for access decisions. */
export function useTabletopAccessIdentity(): TabletopAccessIdentity {
  const { user } = useAuth();
  const userId = user?.userId ?? null;
  const cognitoSub = user?.cognitoSub ?? null;
  const email = user?.email ?? null;
  const emailVerified = user?.emailVerified ?? false;
  const appRole = user?.appRole ?? null;
  const isDemo = user?.isDemo ?? false;
  return useMemo(
    () => (user ? { userId, cognitoSub, email, emailVerified, appRole, isDemo, authenticated: true } : { authenticated: false }),
    [user, userId, cognitoSub, email, emailVerified, appRole, isDemo],
  );
}

/**
 * The one hook every tabletop surface uses for its access tier.
 * Pass the launch gate's prerequisite verdict; omit it and a non-privileged
 * user resolves to `blocked` (fail closed).
 */
export function useTabletopAccessMode(prerequisitesMet = false): TabletopAccessMode {
  const identity = useTabletopAccessIdentity();
  return useMemo(() => resolveTabletopAccessMode(identity, prerequisitesMet), [identity, prerequisitesMet]);
}

// ---------------------------------------------------------------------------
// Privileged-session labeling
// ---------------------------------------------------------------------------

export interface PrivilegedAccessBannerCopy {
  label: string;
  body: string;
}

/**
 * Exact banner copy for a privileged session. The UAT reviewer strings are
 * contractual — asserted verbatim in tests; do not reword.
 */
export const PRIVILEGED_ACCESS_BANNERS: Record<PrivilegedAccessMode, PrivilegedAccessBannerCopy> = {
  superadmin: {
    label: 'Super Admin Full Access',
    body:
      'This account has Super Admin full access to every tabletop exercise, including scenarios whose readiness prerequisites are not complete. Super Admin attempts do not create official completion evidence and do not satisfy official Governing Body readiness or compliance requirements.',
  },
  uat_reviewer: {
    label: 'UAT Reviewer Access',
    body:
      'This account may review tabletop exercises before readiness prerequisites are complete. Reviewer attempts do not satisfy official Governing Body readiness or compliance requirements.',
  },
};

// ---------------------------------------------------------------------------
// Privileged-session audit trail
// ---------------------------------------------------------------------------

export interface PrivilegedAccessAuditEntry {
  accessMode: PrivilegedAccessMode;
  /** Stable subject identifier of the privileged actor. */
  subjectId: string;
  caseId: string;
  mode: 'solo' | 'group';
  at: string;
  /** Always false — a privileged attempt is never official. */
  official: false;
}

const privilegedAccessLog: PrivilegedAccessAuditEntry[] = [];

/**
 * Record that a privileged actor opened a tabletop. Auditability is a
 * requirement of the privileged tiers; this log is the client-side half (a
 * connected evidence service records the authoritative half server-side).
 */
export function logPrivilegedTabletopAccess(
  entry: Omit<PrivilegedAccessAuditEntry, 'official' | 'at'> & { at?: string },
): PrivilegedAccessAuditEntry {
  const record: PrivilegedAccessAuditEntry = {
    accessMode: entry.accessMode,
    subjectId: entry.subjectId,
    caseId: entry.caseId,
    mode: entry.mode,
    at: entry.at ?? new Date().toISOString(),
    official: false,
  };
  privilegedAccessLog.push(record);
  return record;
}

export function getPrivilegedTabletopAccessLog(): readonly PrivilegedAccessAuditEntry[] {
  return privilegedAccessLog;
}

/** Test hook only. */
export function clearPrivilegedTabletopAccessLog(): void {
  privilegedAccessLog.length = 0;
}

/**
 * Rejection reason used by complianceStore.commitEvidence when a privileged
 * (superadmin / UAT reviewer) attempt tries to write official evidence.
 */
export const PRIVILEGED_EVIDENCE_REJECTION =
  'Privileged preview access (Super Admin or UAT Reviewer) cannot record official completion evidence. Reviewer and Super Admin attempts never satisfy Governing Body readiness requirements.';
