/**
 * Confidentiality-policy registry — PRD §29 #9, §13.4, §20.1, §20.2, FR-019.
 * Pure data + pure functions only. Zero runtime side effects.
 */

import type { PacketConfidentialityRule } from '@/policy/packets/contracts';

/**
 * Classification levels used by packet chrome / handling (§20.1 / packet model).
 * Aligned with contracts' PacketClassification core vocabulary.
 */
export const PACKET_CLASSIFICATION_LEVELS = [
  'public',
  'internal',
  'confidential',
  'restricted-personnel',
  'legal-privileged',
  'synthetic-uat',
] as const;

export type PacketClassificationLevel =
  (typeof PACKET_CLASSIFICATION_LEVELS)[number];

/**
 * §20.2 — EXACT fields the general packet may carry for a confidential
 * personnel addendum reference. Permit only this allowlist; reject everything else.
 *
 * PRD §20.2 (main packet stores only):
 * - Addendum ID
 * - SHA-256
 * - Classification
 * - Custodian
 * - Authorized reviewer
 * - Review status
 * - Related finding IDs
 * - Restricted workflow-instance IDs
 *
 * Canonical field ids are the lowercase PRD phrases used by validation callers.
 */
export const PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS = [
  'addendum id',
  'sha256',
  'classification',
  'custodian',
  'authorized reviewer',
  'review status',
  'related finding ids',
  'restricted workflow-instance ids',
] as const;

export type PersonnelAddendumAllowedField =
  (typeof PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS)[number];

/** PRD §20.2 display labels paired with canonical field ids. */
export const PERSONNEL_ADDENDUM_FIELD_LABELS: Readonly<
  Record<PersonnelAddendumAllowedField, string>
> = {
  'addendum id': 'Addendum ID',
  sha256: 'SHA-256',
  classification: 'Classification',
  custodian: 'Custodian',
  'authorized reviewer': 'Authorized reviewer',
  'review status': 'Review status',
  'related finding ids': 'Related finding IDs',
  'restricted workflow-instance ids': 'Restricted workflow-instance IDs',
};

/**
 * §13.4 aggregated personnel-review columns allowed on the general QAPI report
 * (counts/status only — never employee names, allegations, investigation facts,
 * sanctions, or confidential HR details).
 */
export const PERSONNEL_AGGREGATE_GENERAL_REPORT_FIELDS = [
  'trigger category',
  'count',
  'policy/rule',
  'reason for review',
  'status',
  'required reviewer',
] as const;

/** Confidentiality policy as data (PRD §29 #9). */
export interface ConfidentialityPolicy {
  policyId: string;
  title: string;
  description: string;
  classificationLevels: readonly PacketClassificationLevel[];
  /** PacketConfidentialityRule entries from contracts. */
  confidentialityRules: readonly PacketConfidentialityRule[];
  /**
   * Field ids the general packet may expose for a personnel addendum
   * reference (§20.2). Anything else is a confidential leak.
   */
  personnelAddendumAllowedGeneralPacketFields: readonly PersonnelAddendumAllowedField[];
  prdRefs: readonly string[];
}

export const PERSONNEL_CONFIDENTIALITY_POLICY_ID = 'personnel-confidentiality';
export const DEFAULT_CONFIDENTIALITY_POLICY_ID = 'default-confidentiality-policy';

/**
 * Personnel-addendum confidentiality rule per §13.4 / §20.2.
 * Content lives in a restricted addendum; general packet is reference-only.
 */
export const PERSONNEL_ADDENDUM_CONFIDENTIALITY_RULE: PacketConfidentialityRule = {
  ruleId: 'personnel-addendum-§13.4-§20.2',
  classification: 'restricted-personnel',
  restrictedToRoles: [
    'Administrator',
    'Clinical Manager',
    'Compliance Officer',
    'HR Director',
    'Governing Body Chair',
    'Legal Counsel',
  ],
  watermarkText: 'CONFIDENTIAL — PERSONNEL ADDENDUM — RESTRICTED ACCESS',
  separateAddendum: true,
  redactFromGeneralPacket: true,
  aggregateOnlyInGeneralPacket: true,
};

export const PERSONNEL_CONFIDENTIALITY_POLICY: ConfidentialityPolicy = {
  policyId: PERSONNEL_CONFIDENTIALITY_POLICY_ID,
  title: 'Personnel confidentiality policy',
  description:
    'Personnel-review details remain in a restricted addendum. The general packet may carry only §20.2 reference fields and §13.4 aggregates.',
  classificationLevels: PACKET_CLASSIFICATION_LEVELS,
  confidentialityRules: [PERSONNEL_ADDENDUM_CONFIDENTIALITY_RULE],
  personnelAddendumAllowedGeneralPacketFields:
    PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS,
  prdRefs: ['§13.4', '§20.1', '§20.2', 'FR-019', 'FR-024'],
};

export const DEFAULT_CONFIDENTIALITY_POLICY: ConfidentialityPolicy = {
  policyId: DEFAULT_CONFIDENTIALITY_POLICY_ID,
  title: 'Default confidentiality policy',
  description:
    'Default classification handling for mandated-event packets without specialized personnel rules.',
  classificationLevels: PACKET_CLASSIFICATION_LEVELS,
  confidentialityRules: [],
  personnelAddendumAllowedGeneralPacketFields:
    PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS,
  prdRefs: ['§20.1'],
};

/** Full confidentiality-policy registry (PRD §29 #9). */
export const CONFIDENTIALITY_POLICIES: readonly ConfidentialityPolicy[] = [
  PERSONNEL_CONFIDENTIALITY_POLICY,
  DEFAULT_CONFIDENTIALITY_POLICY,
];

export function getConfidentialityPolicy(
  policyId: string,
): ConfidentialityPolicy | undefined {
  return CONFIDENTIALITY_POLICIES.find((p) => p.policyId === policyId);
}

/** Typed error thrown when general-packet fields would leak confidential data. */
export class ConfidentialLeakError extends Error {
  readonly code = 'CONFIDENTIAL_LEAK' as const;
  readonly leakedFields: readonly string[];

  constructor(leakedFields: readonly string[]) {
    const list = leakedFields.join(', ');
    super(
      `Confidential personnel fields are not permitted on the general packet (§20.2): ${list}`,
    );
    this.name = 'ConfidentialLeakError';
    this.leakedFields = leakedFields;
  }
}

const ALLOWED_FIELD_SET: ReadonlySet<string> = new Set(
  PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS,
);

/**
 * Normalize a field name for §20.2 allowlist comparison.
 *
 * Accepts ONLY:
 * - canonical PRD §20.2 field ids (see PERSONNEL_ADDENDUM_ALLOWED_GENERAL_PACKET_FIELDS)
 * - exact PRD display labels (case-insensitive match to the §20.2 bullet text)
 *
 * No singular, no-hyphen, camelCase, or other invented aliases.
 */
function normalizeSection202FieldName(fieldName: string): string {
  const trimmed = fieldName.trim();
  const lower = trimmed.toLowerCase();

  // Canonical ids and PRD display labels only (display labels lower-case to the same tokens).
  // "SHA-256" is the sole PRD display form that differs from the canonical id "sha256".
  if (lower === 'addendum id') return 'addendum id';
  if (lower === 'sha-256') return 'sha256'; // PRD display label "SHA-256"
  if (lower === 'sha256') return 'sha256'; // canonical id
  if (lower === 'classification') return 'classification';
  if (lower === 'custodian') return 'custodian';
  if (lower === 'authorized reviewer') return 'authorized reviewer';
  if (lower === 'review status') return 'review status';
  if (lower === 'related finding ids') return 'related finding ids';
  if (lower === 'restricted workflow-instance ids') {
    return 'restricted workflow-instance ids';
  }

  // Unknown / non-canonical → return as-is (lower) so allowlist check rejects it.
  return lower;
}

/**
 * Assert that `fieldNames` contains only §20.2-permitted general-packet fields
 * for a confidential personnel-addendum reference.
 *
 * Permits exactly the PRD §20.2 allowlist (canonical ids and PRD display labels).
 * Throws ConfidentialLeakError on any disallowed field — never silently drops.
 */
export function assertNoConfidentialLeak(fieldNames: readonly string[]): void {
  const leaked: string[] = [];
  for (const name of fieldNames) {
    const normalized = normalizeSection202FieldName(name);
    if (!ALLOWED_FIELD_SET.has(normalized)) {
      leaked.push(name);
    }
  }
  if (leaked.length > 0) {
    throw new ConfidentialLeakError(leaked);
  }
}
