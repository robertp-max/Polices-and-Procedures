/**
 * COG-2 — the SINGLE authority algorithm for managing user status.
 *
 * Used by BOTH the capability projection (/api/auth/capabilities) and the
 * enforcement middleware (/api/admin/user-access), so the UI capability and the
 * server boundary can never disagree. Pure and side-effect free: callers supply
 * the already-verified identity, the approved-admin-email verdict, and the
 * canonical record — this function only decides.
 *
 * Rule (order matters):
 *   1. Global status deny FIRST — a canonical record that is suspended/disabled/
 *      revoked is ALWAYS denied. Suspension must never be overridden by the
 *      admin-email allowlist. (Break-glass access, if ever needed, is a separate
 *      lane: explicit activation, MFA, expiry, narrow scope, immutable audit.)
 *   2. Approved-admin-email path — an exact approved administrator email, on a
 *      verified identity whose canonical record is absent / pending / active,
 *      is authorized. (The caller has already enforced the COG-1 registration/
 *      session-active gate before calling this.)
 *   3. Canonical admin-group path — otherwise the canonical record must be
 *      active AND hold an approved administrator group.
 *
 * The approved-admin-email verdict is injected (never recomputed here) so the
 * administrator-email algorithm is not duplicated.
 */
import { PRIVILEGED_GROUP_IDS } from './actorResolver.js';

export type UserStatusAuthoritySource = 'approved_admin_email' | 'canonical_admin_group';

/** Canonical AppIdentityRegistry statuses plus 'missing' (no bound record). */
export type CanonicalStatus = 'missing' | 'pending' | 'active' | 'suspended' | 'disabled';

/** Canonical statuses that terminally deny authority regardless of any allowlist. */
const TERMINAL_DENY_STATUSES = new Set<string>(['suspended', 'disabled', 'revoked']);

export interface UserStatusAuthorityInput {
  /** Email from the VERIFIED Cognito identity (never body/header/storage). */
  verifiedEmail: string;
  /** Whether verifiedEmail is on the approved administrator allowlist. */
  isApprovedAdminEmail: boolean;
  /** The canonical AppIdentityRegistry record for this identity, or null. */
  canonicalUser: { id: string; email: string; status: string } | null;
  /** Active role-group ids for the canonical user (empty when none/missing). */
  canonicalRoles: string[];
}

export interface UserStatusAuthorityResult {
  allowed: boolean;
  source?: UserStatusAuthoritySource;
  actorUserId?: string;
  actorEmail?: string;
  canonicalStatus: CanonicalStatus;
  /** Set only when allowed=false — a safe, non-leaking denial reason. */
  denyReason?: string;
}

export function evaluateUserStatusAuthority(input: UserStatusAuthorityInput): UserStatusAuthorityResult {
  const { verifiedEmail, isApprovedAdminEmail, canonicalUser, canonicalRoles } = input;
  const status = (canonicalUser?.status ?? 'missing') as CanonicalStatus;

  // (1) Global status deny FIRST — suspension/disable always wins.
  if (TERMINAL_DENY_STATUSES.has(status)) {
    return { allowed: false, canonicalStatus: status, denyReason: `Account is ${status}.` };
  }

  // (2) Approved-admin-email path — canonical may be missing / pending / active.
  if (isApprovedAdminEmail) {
    return {
      allowed: true,
      source: 'approved_admin_email',
      actorUserId: canonicalUser?.id ?? `email:${verifiedEmail.trim().toLowerCase()}`,
      actorEmail: verifiedEmail,
      canonicalStatus: status,
    };
  }

  // (3) Canonical admin-group path — requires an ACTIVE canonical record.
  if (status === 'active' && canonicalRoles.some((r) => PRIVILEGED_GROUP_IDS.has(r))) {
    return {
      allowed: true,
      source: 'canonical_admin_group',
      actorUserId: canonicalUser!.id,
      actorEmail: canonicalUser!.email,
      canonicalStatus: 'active',
    };
  }

  return {
    allowed: false,
    canonicalStatus: status,
    denyReason: 'You do not have permission to manage user status.',
  };
}
