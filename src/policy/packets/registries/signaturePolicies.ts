/**
 * Signature-policy registry — PRD §29 #6, FR-026, §24, §28 #4.
 * Pure data + pure functions only. Zero runtime side effects.
 */

import type { DualCapacityRule } from '@/policy/packets/contracts';

/** Dual-capacity default decision — FR-026: DENY unless an explicit approved rule permits. */
export type DualCapacityDefaultDecision = 'deny';

/**
 * Product/compliance approval flag for open decisions (PRD §28).
 * Unresolved items must remain visible and must not be silently enabled.
 */
export type ProductApprovalStatus = 'approved' | 'needs-product-approval';

/**
 * Dual-capacity rule modeled on contracts' DualCapacityRule, extended with
 * product-approval status so unresolved §28 #4 items cannot silently enable.
 */
export interface SignatureDualCapacityRule extends DualCapacityRule {
  approvalStatus: ProductApprovalStatus;
}

/** One required signing capacity row (FR-026 confirmation table). */
export interface SignatureCapacityRequirement {
  /** Capacity id/label — must match PRD vocabulary exactly for the policy family. */
  capacity: string;
  required: true;
  /** 1-based signing order. */
  order: number;
}

/** Signature policy as data (PRD §29 #6). */
export interface SignaturePolicy {
  policyId: string;
  title: string;
  description: string;
  /** Required signing capacities in order. */
  requiredCapacities: readonly SignatureCapacityRequirement[];
  /**
   * Dual-capacity default — always DENY.
   * One signer may satisfy two capacities only when an explicit dual-capacity
   * rule permits it and the record shows both capacities (FR-026).
   */
  dualCapacityDefault: DualCapacityDefaultDecision;
  /** Candidate dual-capacity rules; only `approvalStatus: 'approved'` may enable. */
  allowedDualCapacitySignatures: readonly SignatureDualCapacityRule[];
  prdRefs: readonly string[];
}

/**
 * FR-026 dual-capacity attestation record.
 * Allow is impossible without both capacities on the record and attestation evidence
 * when the matching rule requires it.
 */
export interface DualCapacityAttestationRecord {
  /** Both capacities the signer is claimed to satisfy (FR-026). */
  dualCapacities: readonly [string, string];
  /** Explicit dual-capacity attestation evidence is present on the record. */
  attestationEvidencePresent: boolean;
  /** Optional link to the dual-capacity rule id on the signer task. */
  dualCapacityRuleId?: string | null;
}

/** Canonical dual-capacity default — never silently allow. */
export const DUAL_CAPACITY_DEFAULT: DualCapacityDefaultDecision = 'deny';

export const QAPI_QUARTERLY_SIGNATURE_POLICY_ID = 'qapi-quarterly-signatures';
export const DEFAULT_SIGNATURE_POLICY_ID = 'default-signature-policy';

/**
 * PRD §24 QAPI sign-off capacities — EXACT wording:
 * Administrator, Clinical Manager, and QAPI Chair.
 */
export const QAPI_QUARTERLY_REQUIRED_CAPACITIES = [
  'Administrator',
  'Clinical Manager',
  'QAPI Chair',
] as const;

/**
 * §28 #4 example dual-capacity rule for Administrator/DON roles.
 * Secondary capacity uses the §24 capacity label "Clinical Manager"
 * (DON is the Clinical Manager role in this domain).
 * Carries `needs-product-approval` — do NOT treat as enabled.
 */
export const ADMINISTRATOR_DON_DUAL_CAPACITY_RULE: SignatureDualCapacityRule = {
  ruleId: 'dual-capacity-administrator-don-§28-4',
  primaryCapacity: 'Administrator',
  secondaryCapacity: 'Clinical Manager',
  allowedWhen:
    'One individual formally holds both Administrator and DON (Clinical Manager) capacities and an authorized dual-capacity attestation is recorded. Final dual-capacity signer policy for Administrator/DON roles remains an open product decision (PRD §28 #4).',
  requiresExplicitAttestation: true,
  authorizingRoles: ['Governing Body', 'Compliance Officer'],
  approvalStatus: 'needs-product-approval',
};

export const QAPI_QUARTERLY_SIGNATURE_POLICY: SignaturePolicy = {
  policyId: QAPI_QUARTERLY_SIGNATURE_POLICY_ID,
  title: 'Quarterly QAPI signature policy',
  description:
    'Required eCIgn capacities for the Quarterly QAPI analytical-report packet (PRD §24).',
  requiredCapacities: [
    { capacity: 'Administrator', required: true, order: 1 },
    { capacity: 'Clinical Manager', required: true, order: 2 },
    { capacity: 'QAPI Chair', required: true, order: 3 },
  ],
  dualCapacityDefault: DUAL_CAPACITY_DEFAULT,
  allowedDualCapacitySignatures: [ADMINISTRATOR_DON_DUAL_CAPACITY_RULE],
  prdRefs: ['FR-026', '§24', '§28 #4'],
};

/**
 * Generic default signature policy — single required capacity placeholder family.
 * Dual-capacity remains DENY with no candidate rules.
 */
export const DEFAULT_SIGNATURE_POLICY: SignaturePolicy = {
  policyId: DEFAULT_SIGNATURE_POLICY_ID,
  title: 'Default signature policy',
  description:
    'Generic default signature policy for packet families without a specialized policy. Dual-capacity defaults to deny.',
  requiredCapacities: [
    { capacity: 'Authorized Approver', required: true, order: 1 },
  ],
  dualCapacityDefault: DUAL_CAPACITY_DEFAULT,
  allowedDualCapacitySignatures: [],
  prdRefs: ['FR-026'],
};

/** Full signature-policy registry (PRD §29 #6). */
export const SIGNATURE_POLICIES: readonly SignaturePolicy[] = [
  QAPI_QUARTERLY_SIGNATURE_POLICY,
  DEFAULT_SIGNATURE_POLICY,
];

export function getSignaturePolicy(policyId: string): SignaturePolicy | undefined {
  return SIGNATURE_POLICIES.find((p) => p.policyId === policyId);
}

/**
 * Whether a dual-capacity rule is product-enabled for use.
 * Rules flagged `needs-product-approval` are never enabled (PRD §28 #4).
 */
export function isDualCapacityRuleEnabled(rule: SignatureDualCapacityRule): boolean {
  return rule.approvalStatus === 'approved';
}

function capacitiesMatchPair(
  a: string,
  b: string,
  primary: string,
  secondary: string,
): boolean {
  return (
    (primary === a && secondary === b) || (primary === b && secondary === a)
  );
}

function recordShowsBothCapacities(
  record: DualCapacityAttestationRecord,
  primaryCapacity: string,
  secondaryCapacity: string,
): boolean {
  const [c0, c1] = record.dualCapacities;
  if (!c0 || !c1 || c0.trim().length === 0 || c1.trim().length === 0) {
    return false;
  }
  return capacitiesMatchPair(c0, c1, primaryCapacity, secondaryCapacity);
}

/**
 * Resolve dual-capacity decision for a policy + capacity pair + attestation record.
 *
 * FR-026 / §28 #4 gates (all required for 'allow'):
 * 1. Policy dual-capacity default is deny (registry invariant).
 * 2. An explicit matching dual-capacity rule exists.
 * 3. Rule is product-approved (`approvalStatus === 'approved'`).
 *    `needs-product-approval` always yields deny — never silently enable.
 * 4. The record shows both capacities.
 * 5. When the rule requires explicit attestation, attestation evidence is present.
 *
 * Missing/partial record → deny. Never invents allow.
 */
export function resolveDualCapacityDecision(
  policy: SignaturePolicy,
  primaryCapacity: string,
  secondaryCapacity: string,
  record?: DualCapacityAttestationRecord | null,
): DualCapacityDefaultDecision | 'allow' {
  // Default DENY path — policy must not opt into silent allow.
  if (policy.dualCapacityDefault !== 'deny') {
    return 'deny';
  }

  if (
    !primaryCapacity ||
    !secondaryCapacity ||
    primaryCapacity.trim().length === 0 ||
    secondaryCapacity.trim().length === 0
  ) {
    return 'deny';
  }

  const match = policy.allowedDualCapacitySignatures.find((rule) =>
    capacitiesMatchPair(
      primaryCapacity,
      secondaryCapacity,
      rule.primaryCapacity,
      rule.secondaryCapacity,
    ),
  );

  // No explicit rule → deny.
  if (!match) {
    return 'deny';
  }

  // §28 #4 / product gate: needs-product-approval is never enabled.
  if (match.approvalStatus !== 'approved' || !isDualCapacityRuleEnabled(match)) {
    return 'deny';
  }

  // FR-026: record must show both capacities.
  if (!record || !recordShowsBothCapacities(record, primaryCapacity, secondaryCapacity)) {
    return 'deny';
  }

  // Attestation evidence required when the rule says so (and always safe to require).
  if (match.requiresExplicitAttestation && !record.attestationEvidencePresent) {
    return 'deny';
  }

  if (!record.attestationEvidencePresent) {
    return 'deny';
  }

  if (
    record.dualCapacityRuleId != null &&
    record.dualCapacityRuleId !== match.ruleId
  ) {
    return 'deny';
  }

  return 'allow';
}
