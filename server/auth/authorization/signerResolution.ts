/**
 * ADR-0002 Phase 5C — server-owned verified-signer resolution.
 *
 * Composes the Phase-1 verified identity (verifiedSignerIdentity) with the
 * Phase-5B authority resolver (signatureAuthority) to produce the VerifiedSigner
 * the eCIgn engine enforces against. This REPLACES the least-privilege
 * `signerFromVerifiedActor` stub at the signing seam.
 *
 * Authority NEVER comes from client input or security-group membership — only
 * from explicit SignatureAuthorityAssignments supplied by the injected provider.
 * The provider defaults to EMPTY, so until a durable assignment store is
 * provisioned the resolved signer stays least-privilege (fail-closed) and
 * signature mutations refuse — identical to today's behavior, but now on the
 * real resolver path rather than a hardcoded stub.
 */
import { productionTierForRole } from '@/policy/ecign/signerAuthority';
import type { Actor } from '../../identity/session.js';
import { signerFromVerifiedActor, type VerifiedSigner } from '../verifiedSignerIdentity.js';
import {
  resolveSignerAuthority, type ResolvedSignerAuthority, type SignatureAuthorityAssignment,
} from './signatureAuthority.js';

export type SignatureAssignmentProvider = (userId: string) => readonly SignatureAuthorityAssignment[];

/** Default: no assignments → fail-closed least-privilege. A durable store
 *  overrides this via setSignatureAssignmentProvider. */
const EMPTY_PROVIDER: SignatureAssignmentProvider = () => [];
let assignmentProvider: SignatureAssignmentProvider = EMPTY_PROVIDER;

export function setSignatureAssignmentProvider(p: SignatureAssignmentProvider): void {
  assignmentProvider = p;
}
export function resetSignatureAssignmentProvider(): void {
  assignmentProvider = EMPTY_PROVIDER;
}

/** The representative capacity for the single VerifiedSigner.role slot: the
 *  highest-tier held capacity (per-slot capacity selection is a later refinement). */
function primaryCapacity(authority: ResolvedSignerAuthority): string {
  let best = authority.capacities[0] ?? 'unknown';
  let bestTier = 0;
  for (const c of authority.capacities) {
    const t = productionTierForRole(c);
    if (t > bestTier) { bestTier = t; best = c; }
  }
  return best;
}

/**
 * Build a VerifiedSigner from the verified actor + server-resolved authority.
 * `nowIso` scopes assignment effective windows. With no active resolved
 * capacity the result is least-privilege (fail-closed).
 */
export function resolveVerifiedSigner(actor: Actor, nowIso: string): VerifiedSigner {
  const base = signerFromVerifiedActor(actor);
  const userId = actor.user_id as string;
  const authority = resolveSignerAuthority({
    userId,
    accountActive: true, // the actor is verified + active (requireApiAuth gate)
    assignments: [...(assignmentProvider(userId) ?? [])],
    nowIso,
  });
  if (authority.capacities.length === 0) return base; // fail-closed: no signing authority
  return {
    ...base,
    role: primaryCapacity(authority),
    tier: authority.tier,
    authorityDomains: authority.domains,
    mfaVerified: false, // real step-up is a separate signal (ADR MFA-honesty)
  };
}
