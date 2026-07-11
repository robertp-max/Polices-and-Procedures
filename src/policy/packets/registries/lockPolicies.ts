/**
 * Lock-policy registry — PRD §29 #8, FR-032, §28 #7.
 * Pure data + pure functions only. Zero runtime side effects.
 *
 * FR-032 verification checklist and post-lock effects are expressed AS DATA.
 * Retention periods by archetype (§28 #7) remain unresolved placeholders.
 */

import type { PacketArchetypeId } from '@/policy/packets/contracts';
import type { ProductApprovalStatus } from './signaturePolicies';

/**
 * FR-032 certifier verification checklist items — EXACT PRD phrases.
 * "The certifier must verify packet identity, reporting period, workflow,
 * version, forms, evidence, approvals, signatures, authority, confidentiality,
 * hashes, Drive publication, retention, and zero unresolved blockers."
 */
export const FR032_VERIFICATION_CHECKLIST_ITEMS = [
  'packet identity',
  'reporting period',
  'workflow',
  'version',
  'forms',
  'evidence',
  'approvals',
  'signatures',
  'authority',
  'confidentiality',
  'hashes',
  'Drive publication',
  'retention',
  'zero unresolved blockers',
] as const;

export type Fr032ChecklistItemLabel =
  (typeof FR032_VERIFICATION_CHECKLIST_ITEMS)[number];

/**
 * Stable FR-032 checklist item ids — explicit, not derived ad hoc at call sites.
 * Tests assert this exact id list so broken registry data fails.
 */
export const FR032_VERIFICATION_CHECKLIST_ITEM_IDS = [
  'fr032-packet-identity',
  'fr032-reporting-period',
  'fr032-workflow',
  'fr032-version',
  'fr032-forms',
  'fr032-evidence',
  'fr032-approvals',
  'fr032-signatures',
  'fr032-authority',
  'fr032-confidentiality',
  'fr032-hashes',
  'fr032-drive-publication',
  'fr032-retention',
  'fr032-zero-unresolved-blockers',
] as const;

export type Fr032ChecklistItemId =
  (typeof FR032_VERIFICATION_CHECKLIST_ITEM_IDS)[number];

/**
 * FR-032 post-certification / post-lock effects — EXACT PRD bullet text.
 */
export const FR032_POST_LOCK_EFFECTS = [
  'Lock packet.',
  'Lock final form instances.',
  'Lock evidence manifest.',
  'Lock signature record.',
  'Prevent silent changes.',
  'Permit only amendment or supersession.',
] as const;

export type Fr032PostLockEffect = (typeof FR032_POST_LOCK_EFFECTS)[number];

/** One FR-032 checklist row as data. */
export interface LockVerificationChecklistItem {
  itemId: Fr032ChecklistItemId;
  /** Exact PRD phrase. */
  label: Fr032ChecklistItemLabel;
  required: true;
}

/**
 * Retention rule placeholder (PRD §28 #7).
 * Unresolved — must not be silently guessed as a concrete retention period.
 */
export interface RetentionRulePlaceholder {
  archetypeId: PacketArchetypeId | 'default';
  /** Null until product/compliance approves a concrete retention rule. */
  retentionRule: null;
  approvalStatus: Extract<ProductApprovalStatus, 'needs-product-approval'>;
  /** Open decision reference — PRD §28 #7. */
  openDecisionRef: '§28 #7';
  openDecisionText: 'Retention periods by packet archetype.';
}

/** Lock policy as data (PRD §29 #8). */
export interface LockPolicy {
  policyId: string;
  title: string;
  description: string;
  /** FR-032 verification checklist AS DATA. */
  verificationChecklist: readonly LockVerificationChecklistItem[];
  /** FR-032 post-lock effects AS DATA. */
  postLockEffects: readonly Fr032PostLockEffect[];
  /**
   * Retention placeholders flagged needs-product-approval (§28 #7).
   * Missing retention data must never become a concrete period or OK.
   */
  retentionRulePlaceholders: readonly RetentionRulePlaceholder[];
  requiresZeroUnresolvedBlockers: true;
  prdRefs: readonly string[];
}

export const DEFAULT_LOCK_POLICY_ID = 'default-lock-policy';
export const QAPI_QUARTERLY_LOCK_POLICY_ID = 'qapi-quarterly-lock';

/**
 * FR-032 checklist rows — explicit id/label pairs (order matches PRD sentence).
 */
export const FR032_VERIFICATION_CHECKLIST: readonly LockVerificationChecklistItem[] =
  [
    {
      itemId: 'fr032-packet-identity',
      label: 'packet identity',
      required: true,
    },
    {
      itemId: 'fr032-reporting-period',
      label: 'reporting period',
      required: true,
    },
    { itemId: 'fr032-workflow', label: 'workflow', required: true },
    { itemId: 'fr032-version', label: 'version', required: true },
    { itemId: 'fr032-forms', label: 'forms', required: true },
    { itemId: 'fr032-evidence', label: 'evidence', required: true },
    { itemId: 'fr032-approvals', label: 'approvals', required: true },
    { itemId: 'fr032-signatures', label: 'signatures', required: true },
    { itemId: 'fr032-authority', label: 'authority', required: true },
    {
      itemId: 'fr032-confidentiality',
      label: 'confidentiality',
      required: true,
    },
    { itemId: 'fr032-hashes', label: 'hashes', required: true },
    {
      itemId: 'fr032-drive-publication',
      label: 'Drive publication',
      required: true,
    },
    { itemId: 'fr032-retention', label: 'retention', required: true },
    {
      itemId: 'fr032-zero-unresolved-blockers',
      label: 'zero unresolved blockers',
      required: true,
    },
  ];

/**
 * §28 #7 retention placeholders — one per packet archetype plus default.
 * All carry `needs-product-approval`; retentionRule remains null.
 */
export const RETENTION_RULE_PLACEHOLDERS: readonly RetentionRulePlaceholder[] = (
  [
    'meeting',
    'analytical-report',
    'pip-capa',
    'incident-investigation',
    'survey-response',
    'employee-competency',
    'policy-lifecycle',
    'privacy-breach',
    'emergency-drill',
    'program-surveillance',
    'audit',
    'contract-vendor',
    'default',
  ] as const
).map((archetypeId) => ({
  archetypeId,
  retentionRule: null,
  approvalStatus: 'needs-product-approval' as const,
  openDecisionRef: '§28 #7' as const,
  openDecisionText: 'Retention periods by packet archetype.' as const,
}));

export const DEFAULT_LOCK_POLICY: LockPolicy = {
  policyId: DEFAULT_LOCK_POLICY_ID,
  title: 'Default lock policy',
  description:
    'FR-032 certification and lock gates for mandated-event packets. Retention periods remain open (PRD §28 #7).',
  verificationChecklist: FR032_VERIFICATION_CHECKLIST,
  postLockEffects: FR032_POST_LOCK_EFFECTS,
  retentionRulePlaceholders: RETENTION_RULE_PLACEHOLDERS,
  requiresZeroUnresolvedBlockers: true,
  prdRefs: ['FR-032', '§28 #7'],
};

export const QAPI_QUARTERLY_LOCK_POLICY: LockPolicy = {
  policyId: QAPI_QUARTERLY_LOCK_POLICY_ID,
  title: 'Quarterly QAPI lock policy',
  description:
    'FR-032 certification and lock gates for the Quarterly QAPI analytical-report packet.',
  verificationChecklist: FR032_VERIFICATION_CHECKLIST,
  postLockEffects: FR032_POST_LOCK_EFFECTS,
  retentionRulePlaceholders: RETENTION_RULE_PLACEHOLDERS.filter(
    (r) => r.archetypeId === 'analytical-report' || r.archetypeId === 'default',
  ),
  requiresZeroUnresolvedBlockers: true,
  prdRefs: ['FR-032', '§24', '§28 #7'],
};

/** Full lock-policy registry (PRD §29 #8). */
export const LOCK_POLICIES: readonly LockPolicy[] = [
  QAPI_QUARTERLY_LOCK_POLICY,
  DEFAULT_LOCK_POLICY,
];

export function getLockPolicy(policyId: string): LockPolicy | undefined {
  return LOCK_POLICIES.find((p) => p.policyId === policyId);
}

/** Checklist labels present on a lock policy (order-preserving). */
export function listLockChecklistLabels(
  policy: LockPolicy,
): readonly Fr032ChecklistItemLabel[] {
  return policy.verificationChecklist.map((item) => item.label);
}

/** Checklist item ids present on a lock policy (order-preserving). */
export function listLockChecklistItemIds(
  policy: LockPolicy,
): readonly Fr032ChecklistItemId[] {
  return policy.verificationChecklist.map((item) => item.itemId);
}
