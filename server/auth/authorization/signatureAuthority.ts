/**
 * ADR-0002 Phase 5B — signature-authority assignment model + pure resolver.
 *
 * The four separated objects (ADR §B7): (1) signature-role catalog
 * [signatureCatalog.ts], (2) SignatureAuthorityAssignment [here], (3) versioned
 * workflow-instance SignatureRequirement [5C wiring], (4) the actual signature
 * record [eCIgn engine]. This module owns #2 and the server-owned derivation of a
 * signer's authority from their active assignments — the replacement for the
 * least-privilege `signerFromVerifiedActor` stub that 5C will wire into eCIgn.
 *
 * Pure + fail-closed: a non-active account yields NO capacities; expired /
 * revoked / out-of-window assignments are excluded; an assignment whose role
 * fails catalog reconciliation is dropped (never silently coerced). MFA is never
 * asserted here (ADR MFA-honesty) — real step-up is a separate signal.
 */
import {
  authorityDomainsForRole, productionTierForRole,
  type AuthorityDomain, type ProductionSignerTier,
} from '@/policy/ecign/signerAuthority';
import type { SignerRole } from '@/policy/ecign/types';
import { POLICY_VERSION } from './catalog.js';
import { resolveSignatureCapacity } from './signatureCatalog.js';

export type AuthorityBasis =
  | 'job_appointment' | 'organizational_assignment' | 'license'
  | 'competency' | 'governing_body_action' | 'delegation' | 'policy_assignment';

export interface SignatureAuthorityScope {
  organizationId: string;
  branchId?: string;
  formIds?: string[];
  workflowIds?: string[];
  policyDomains?: string[];
}

export interface SignatureAuthorityAssignment {
  assignmentId: string;
  userId: string;
  /** Resolves to a business capacity via the catalog (fail-closed). */
  signatureRoleId: string;
  authorityBasis: AuthorityBasis;
  scope: SignatureAuthorityScope;
  effectiveFrom: string;
  effectiveUntil?: string;
  delegatedFromUserId?: string;
  delegationId?: string;
  grantedBy: string;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  version: number;
}

export interface ResolvedSignerAuthority {
  userId: string;
  accountActive: boolean;
  capacities: SignerRole[];
  tier: ProductionSignerTier;
  domains: AuthorityDomain[];
  /** Always false here; a real verified step-up is a separate signal (ADR §B7). */
  mfaVerified: boolean;
  /** Provenance: assignments that contributed a resolved capacity. */
  assignmentIds: string[];
  /** Assignments dropped because their role failed catalog reconciliation. */
  unresolvedRoleIds: string[];
  evaluatedAt: string;
  policyVersion: string;
}

export interface ResolveSignerAuthorityInput {
  userId: string;
  accountActive: boolean;
  assignments: readonly SignatureAuthorityAssignment[];
  nowIso: string;
  policyVersion?: string;
}

function isActiveAt(a: SignatureAuthorityAssignment, nowIso: string): boolean {
  if (a.status !== 'active') return false;
  if (a.effectiveFrom && nowIso < a.effectiveFrom) return false;
  if (a.effectiveUntil && nowIso >= a.effectiveUntil) return false;
  return true;
}

/** Server-owned derivation of a signer's authority (capacities/tier/domains)
 *  from their active assignments. Fail-closed at every step. */
export function resolveSignerAuthority(input: ResolveSignerAuthorityInput): ResolvedSignerAuthority {
  const policyVersion = input.policyVersion ?? POLICY_VERSION;
  const base = {
    userId: input.userId, accountActive: input.accountActive, mfaVerified: false,
    evaluatedAt: input.nowIso, policyVersion,
  };
  if (!input.accountActive) {
    return { ...base, capacities: [], tier: 1, domains: [], assignmentIds: [], unresolvedRoleIds: [] };
  }
  const capacities = new Set<SignerRole>();
  const domains = new Set<AuthorityDomain>();
  const assignmentIds: string[] = [];
  const unresolvedRoleIds: string[] = [];
  let tier: ProductionSignerTier = 1;
  for (const a of input.assignments) {
    if (!isActiveAt(a, input.nowIso)) continue;
    const res = resolveSignatureCapacity(a.signatureRoleId);
    if (!res.matched || !res.capacity) { unresolvedRoleIds.push(a.signatureRoleId); continue; }
    capacities.add(res.capacity);
    assignmentIds.push(a.assignmentId);
    const t = productionTierForRole(res.capacity);
    if (t > tier) tier = t;
    for (const d of authorityDomainsForRole(res.capacity)) domains.add(d);
  }
  return { ...base, capacities: [...capacities], tier, domains: [...domains], assignmentIds, unresolvedRoleIds };
}

export interface SignatureCoverage {
  required: SignerRole[];
  satisfied: SignerRole[];
  missing: SignerRole[];
  covered: boolean;
}

/** Coverage of a required-capacity set by a resolved authority's capacities. */
export function signatureCoverage(
  required: readonly SignerRole[],
  resolvedCapacities: readonly SignerRole[],
): SignatureCoverage {
  const have = new Set(resolvedCapacities);
  const satisfied = required.filter((r) => have.has(r));
  const missing = required.filter((r) => !have.has(r));
  return { required: [...required], satisfied, missing, covered: missing.length === 0 };
}
