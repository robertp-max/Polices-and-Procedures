/**
 * Validation severity, findings, lock eligibility, and edit-impact contracts —
 * FR-022, FR-024. Pure types only. Zero runtime side effects.
 */

/**
 * FR-024 validation severity model.
 * - blocker: prevents final approval and lock
 * - warning: allows draft review but requires acknowledgment
 * - advisory: informational only
 */
export type ValidationSeverity = 'blocker' | 'warning' | 'advisory';

export const VALIDATION_SEVERITIES = ['blocker', 'warning', 'advisory'] as const;

/**
 * Material-edit classification (FR-022).
 * Material edits require an impact summary before apply.
 */
export type MaterialEditClassification =
  | 'material'
  | 'non-material'
  | 'unknown-needs-review';

/**
 * FR-022 edit impact dimensions.
 * Every material edit must determine impact on each dimension.
 * (PRD lists 17 discrete impact targets; all are represented.)
 */
export interface EditImpactDimensions {
  kpiCalculations: boolean;
  trends: boolean;
  findings: boolean;
  riskRatings: boolean;
  pipCapRcaDecisions: boolean;
  workflowTriggersAndInstances: boolean;
  requiredForms: boolean;
  actions: boolean;
  governingBodyRecommendations: boolean;
  approvals: boolean;
  signers: boolean;
  attachments: boolean;
  confidentiality: boolean;
  hashes: boolean;
  pagination: boolean;
  ecignEnvelopeValidity: boolean;
  lockEligibility: boolean;
}

/** Ordered FR-022 dimension keys for deterministic iteration. */
export const EDIT_IMPACT_DIMENSION_KEYS = [
  'kpiCalculations',
  'trends',
  'findings',
  'riskRatings',
  'pipCapRcaDecisions',
  'workflowTriggersAndInstances',
  'requiredForms',
  'actions',
  'governingBodyRecommendations',
  'approvals',
  'signers',
  'attachments',
  'confidentiality',
  'hashes',
  'pagination',
  'ecignEnvelopeValidity',
  'lockEligibility',
] as const satisfies readonly (keyof EditImpactDimensions)[];

/**
 * FR-022 Edit impact summary — human-readable + structured dimensions.
 */
export interface EditImpactSummary {
  editId: string;
  packetInstanceId: string;
  packetVersion: number;
  classification: MaterialEditClassification;
  humanReadableSummary: string;
  dimensions: EditImpactDimensions;
  affectedKpiIds: string[];
  affectedFindingIds: string[];
  affectedWorkflowIds: string[];
  affectedFormIds: string[];
  requiresReapproval: boolean;
  requiresResignature: boolean;
  invalidatesEnvelope: boolean;
  invalidatesLockEligibility: boolean;
  analyzedAt: string;
  analyzedBy: string | null;
}

/** One validation finding (FR-024). */
export interface PacketValidationFinding {
  findingId: string;
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
  remediation: string;
  /** Acknowledgment required for warnings before lock. */
  requiresAcknowledgment: boolean;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  relatedModuleId: string | null;
  relatedFormId: string | null;
  relatedWorkflowId: string | null;
}

/** Severity counts for the packet-control page (FR-024). */
export interface ValidationSeverityCounts {
  blocker: number;
  warning: number;
  advisory: number;
}

/**
 * Packet validation result — counts + lock eligibility (FR-024 / FR-025).
 */
export interface PacketValidationResult {
  packetInstanceId: string;
  packetVersion: number;
  validatedAt: string;
  findings: PacketValidationFinding[];
  counts: ValidationSeverityCounts;
  /** True only when zero unresolved blockers and required warnings acknowledged. */
  lockEligible: boolean;
  approvalEligible: boolean;
  unacknowledgedWarningIds: string[];
  unresolvedBlockerIds: string[];
}
