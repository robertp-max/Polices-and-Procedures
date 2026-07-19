/**
 * Security containment — server-verified identity for signing, evidence, and
 * workflow actor attribution.
 *
 * Replaces trust in client-supplied `x-user-*` / `x-actor` headers. In a
 * non-demo runtime the VERIFIED canonical actor (`req.actor`, populated by the
 * `requireApiAuth` boundary) is the ONLY identity source; client headers are
 * ignored. An explicitly opted-in local demo runtime may still fall back to
 * headers for testing, clearly labeled as demo.
 *
 * Governed by ADR-0002 (Phase 1 — security containment). Full server-side
 * signer-tier / authority-domain derivation lands in the signature-authority
 * phase (Phase 5); until then a verified signer is least-privilege (fail-closed),
 * never defaulted to a privileged tier.
 */
import type { Actor } from '../identity/session.js';

export interface VerifiedSigner {
  user_id: string;
  name: string;
  role: string;
  email: string;
  tier: number;
  authorityDomains: string[];
  mfaVerified: boolean;
}

/**
 * True only in an explicitly opted-in local demo runtime — never in production.
 * Mirrors the local-demo gate used by the API auth boundary: requires the exact
 * opt-in flag AND a non-production NODE_ENV.
 */
export function isDemoIdentityRuntime(): boolean {
  return process.env.ENABLE_LOCAL_DEMO_AUTH === 'true' && process.env.NODE_ENV !== 'production';
}

/** The verified canonical actor, or null when the request has no authenticated user. */
export function verifiedActor(req: { actor?: Actor }): Actor | null {
  const a = req.actor;
  return a && a.user_id ? a : null;
}

/**
 * Derive a signer identity from the VERIFIED canonical actor.
 * - identity (user_id/name/email/role) comes only from the verified actor;
 * - tier is NEVER taken from client input and NEVER defaulted to a privileged
 *   value — it starts least-privilege (1) until Phase 5 server-side derivation;
 * - MFA is truthful: verified only if the provider actually enrolled/verified it.
 */
export function signerFromVerifiedActor(actor: Actor): VerifiedSigner {
  const userId = actor.user_id as string;
  return {
    user_id: userId,
    name: actor.display_name || actor.email || userId,
    role: actor.roles?.[0] ?? 'unknown',
    email: actor.email ?? '',
    tier: 1,
    authorityDomains: ['operations'],
    mfaVerified: actor.mfa_enrolled === true,
  };
}

/**
 * Fail-closed guard: a signature is being applied but the instance defines no
 * required signers. Returns true when signing must be refused.
 */
export function requiredSignersMissing(requirementCount: number): boolean {
  return !Number.isFinite(requirementCount) || requirementCount <= 0;
}
