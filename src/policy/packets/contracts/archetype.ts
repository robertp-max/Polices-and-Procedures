/**
 * Universal packet archetype contracts — §9, §10, §13.1, §16.1.
 * Pure types only. Zero runtime side effects.
 */

/** The 12 reusable packet archetypes (§9). */
export type PacketArchetypeId =
  | 'meeting'
  | 'analytical-report'
  | 'pip-capa'
  | 'incident-investigation'
  | 'survey-response'
  | 'employee-competency'
  | 'policy-lifecycle'
  | 'privacy-breach'
  | 'emergency-drill'
  | 'program-surveillance'
  | 'audit'
  | 'contract-vendor';

/**
 * Module IDs covering the 19-section universal backbone (§10)
 * and the Quarterly QAPI Part I / Part II sections (§13.1).
 */
export type PacketModuleId =
  /* ── §10 Universal Packet Backbone (19) ─────────────────────────── */
  | 'branded-cover'
  | 'packet-identity-and-status'
  | 'validation-and-lock-readiness'
  | 'executive-summary-or-analysis'
  | 'trigger-and-originating-workflow'
  | 'scope-and-reporting-period'
  | 'source-and-required-form-completion-matrix'
  | 'analytical-findings'
  | 'risks-gaps-and-exceptions'
  | 'triggered-workflows-and-resulting-actions'
  | 'decisions-and-approvals'
  | 'action-items-owners-and-deadlines'
  | 'evidence-index'
  | 'missing-evidence-disclosure'
  | 'signature-and-attestation'
  | 'audit-chronology'
  | 'final-certification-and-lock-record'
  | 'attachment-manifest'
  | 'supporting-forms-and-evidence'
  /* ── §13.1 Part I — Governance and analytical report ────────────── */
  | 'qapi-cover-page'
  | 'qapi-packet-control-source-validation-readiness'
  | 'qapi-executive-analysis'
  | 'qapi-rich-kpi-dashboard'
  | 'qapi-source-feeder-workflow-form-utilization'
  | 'qapi-detailed-findings-and-trend-analysis'
  | 'qapi-pip-cap-rca-personnel-review-determinations'
  | 'qapi-triggered-workflow-and-dependency-register'
  | 'qapi-committee-and-governing-body-decisions'
  | 'qapi-action-item-workflow-accountability-register'
  | 'qapi-approvals-ecign-lock-readiness'
  /* ── §13.1 Part II — Supporting attachments ─────────────────────── */
  | 'qapi-attachment-manifest'
  | 'qapi-completed-source-forms'
  | 'qapi-generated-pip-cap-rca-forms'
  | 'qapi-triggered-workflow-execution-packages'
  | 'qapi-confidential-personnel-review-addendum-reference'
  | 'qapi-source-derivation-reconciliation-provenance'
  | 'qapi-superseded-or-excluded-source-register';

/** Ordered §10 backbone module IDs (exactly 19). */
export const UNIVERSAL_BACKBONE_MODULE_IDS = [
  'branded-cover',
  'packet-identity-and-status',
  'validation-and-lock-readiness',
  'executive-summary-or-analysis',
  'trigger-and-originating-workflow',
  'scope-and-reporting-period',
  'source-and-required-form-completion-matrix',
  'analytical-findings',
  'risks-gaps-and-exceptions',
  'triggered-workflows-and-resulting-actions',
  'decisions-and-approvals',
  'action-items-owners-and-deadlines',
  'evidence-index',
  'missing-evidence-disclosure',
  'signature-and-attestation',
  'audit-chronology',
  'final-certification-and-lock-record',
  'attachment-manifest',
  'supporting-forms-and-evidence',
] as const satisfies readonly PacketModuleId[];

/** Ordered §13.1 Part I module IDs (exactly 11). */
export const QAPI_PART_I_MODULE_IDS = [
  'qapi-cover-page',
  'qapi-packet-control-source-validation-readiness',
  'qapi-executive-analysis',
  'qapi-rich-kpi-dashboard',
  'qapi-source-feeder-workflow-form-utilization',
  'qapi-detailed-findings-and-trend-analysis',
  'qapi-pip-cap-rca-personnel-review-determinations',
  'qapi-triggered-workflow-and-dependency-register',
  'qapi-committee-and-governing-body-decisions',
  'qapi-action-item-workflow-accountability-register',
  'qapi-approvals-ecign-lock-readiness',
] as const satisfies readonly PacketModuleId[];

/** Ordered §13.1 Part II module IDs (exactly 7). */
export const QAPI_PART_II_MODULE_IDS = [
  'qapi-attachment-manifest',
  'qapi-completed-source-forms',
  'qapi-generated-pip-cap-rca-forms',
  'qapi-triggered-workflow-execution-packages',
  'qapi-confidential-personnel-review-addendum-reference',
  'qapi-source-derivation-reconciliation-provenance',
  'qapi-superseded-or-excluded-source-register',
] as const satisfies readonly PacketModuleId[];

/**
 * Attachment rule for an archetype (§16.1 attachmentRules).
 * Describes what may/must be attached and where it lands.
 */
export interface PacketAttachmentRule {
  /** Stable attachment-type identifier within the archetype. */
  attachmentTypeId: string;
  /** Human-readable label. */
  title: string;
  /** Whether at least one instance is required for completion. */
  required: boolean;
  /** Maximum allowed count; omit when unbounded. */
  maxCount: number | null;
  /** Allowed MIME types; empty means unrestricted by type. */
  allowedMimeTypes: string[];
  /** Where the attachment is placed in the rendered packet. */
  placement: 'body' | 'appendix' | 'confidential-addendum' | 'evidence-index';
  /** Confidentiality classification applied when attached. */
  defaultClassification: string;
  /** Optional canonical form IDs this attachment type binds to. */
  relatedFormIds: string[];
}

/** §16.1 Packet archetype definition — implement EXACTLY as specified. */
export interface PacketArchetypeDefinition {
  archetypeId: PacketArchetypeId;
  version: string;
  title: string;
  description: string;
  requiredModules: PacketModuleId[];
  optionalModules: PacketModuleId[];
  allowedSubtypes: string[];
  defaultClassification: string;
  defaultRetentionRule: string;
  signaturePolicyId: string;
  approvalPolicyId: string;
  lockPolicyId: string;
  attachmentRules: PacketAttachmentRule[];
  renderingProfileId: string;
}
