/**
 * Approval-policy registry — PRD §29 #7, FR-025.
 * Pure data + pure functions only. Zero runtime side effects.
 */

/**
 * FR-025 approval-readiness actions — EXACT PRD strings.
 * These are the only actions an approval policy may expose.
 */
export const FR025_APPROVAL_ACTIONS = [
  'Return for correction',
  'Approve content',
  'Approve with documented exception',
  'Reject',
  'Proceed to signer confirmation',
] as const;

export type ApprovalReadinessAction = (typeof FR025_APPROVAL_ACTIONS)[number];

/** Approval policy as data (PRD §29 #7). */
export interface ApprovalPolicy {
  policyId: string;
  /** Packet family this policy applies to (e.g. QAPI quarterly, generic default). */
  packetFamilyId: string;
  title: string;
  description: string;
  /** Required approver roles before eCIgn (FR-025). */
  requiredApproverRoles: readonly string[];
  /** FR-025's five actions — fixed vocabulary. */
  allowedActions: readonly ApprovalReadinessAction[];
  /** Whether "Approve with documented exception" is supported for this family. */
  supportsDocumentedException: boolean;
  prdRefs: readonly string[];
}

export const QAPI_QUARTERLY_APPROVAL_POLICY_ID = 'qapi-quarterly-approval';
export const DEFAULT_APPROVAL_POLICY_ID = 'default-approval-policy';

/**
 * FR-025 action set shared by all approval policies.
 * "Approve with documented exception" is always present in the vocabulary;
 * family-level `supportsDocumentedException` indicates whether it may be used.
 */
export const APPROVAL_READINESS_ACTIONS: readonly ApprovalReadinessAction[] =
  FR025_APPROVAL_ACTIONS;

export const QAPI_QUARTERLY_APPROVAL_POLICY: ApprovalPolicy = {
  policyId: QAPI_QUARTERLY_APPROVAL_POLICY_ID,
  packetFamilyId: 'QAPI-quarterly',
  title: 'Quarterly QAPI approval policy',
  description:
    'Approval readiness review before eCIgn for the Quarterly QAPI packet (FR-025, §24).',
  requiredApproverRoles: [
    'Administrator',
    'Clinical Manager',
    'QAPI Chair',
  ],
  allowedActions: APPROVAL_READINESS_ACTIONS,
  supportsDocumentedException: true,
  prdRefs: ['FR-025', '§24'],
};

export const DEFAULT_APPROVAL_POLICY: ApprovalPolicy = {
  policyId: DEFAULT_APPROVAL_POLICY_ID,
  packetFamilyId: 'default',
  title: 'Default approval policy',
  description:
    'Generic default approval policy for packet families without a specialized policy.',
  requiredApproverRoles: ['Authorized Approver'],
  allowedActions: APPROVAL_READINESS_ACTIONS,
  supportsDocumentedException: true,
  prdRefs: ['FR-025'],
};

/** Full approval-policy registry (PRD §29 #7). */
export const APPROVAL_POLICIES: readonly ApprovalPolicy[] = [
  QAPI_QUARTERLY_APPROVAL_POLICY,
  DEFAULT_APPROVAL_POLICY,
];

export function getApprovalPolicy(policyId: string): ApprovalPolicy | undefined {
  return APPROVAL_POLICIES.find((p) => p.policyId === policyId);
}

export function getApprovalPolicyByFamily(
  packetFamilyId: string,
): ApprovalPolicy | undefined {
  return APPROVAL_POLICIES.find((p) => p.packetFamilyId === packetFamilyId);
}

/**
 * Whether the policy permits "Approve with documented exception" (FR-025).
 * Requires both the action in `allowedActions` and the family flag.
 */
export function canApproveWithDocumentedException(policy: ApprovalPolicy): boolean {
  return (
    policy.supportsDocumentedException &&
    policy.allowedActions.includes('Approve with documented exception')
  );
}
