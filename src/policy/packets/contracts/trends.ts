/**
 * QAPI trend snapshot, comparability, trend outputs, and sidecar payloads —
 * §14.5, §14.6, §14.8, §16.6. Pure types only. Zero runtime side effects.
 */

import type { Fr015DeterminationOption, WorkflowDecisionState } from './triggers';

/**
 * §14.6 Comparability states — EXACT PRD strings (em-dashes preserved).
 */
export const COMPARABILITY_STATES = [
  'COMPARABLE',
  'COMPARABLE WITH LIMITATION',
  'NOT COMPARABLE — DEFINITION CHANGED',
  'NOT COMPARABLE — COHORT CHANGED',
  'NOT COMPARABLE — UNIT CHANGED',
  'PRIOR DATA UNAVAILABLE',
  'PRIOR DATA CONFLICTED',
] as const;

export type ComparabilityState = (typeof COMPARABILITY_STATES)[number];

/**
 * Appendix D — Trend status vocabulary (title case, EXACT PRD text).
 */
export const APPENDIX_D_TREND_STATUS_VOCABULARY = [
  'Comparable',
  'Comparable with limitation',
  'Not comparable — definition changed',
  'Not comparable — cohort changed',
  'Not comparable — unit changed',
  'Prior data unavailable',
  'Prior data conflicted',
] as const;

export type AppendixDTrendStatus = (typeof APPENDIX_D_TREND_STATUS_VOCABULARY)[number];

/**
 * Appendix D — Data validation status vocabulary (EXACT PRD text).
 */
export const APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY = [
  'Validated',
  'Validated with limitation',
  'Provisional — human review required',
  'Conflicted — reconciliation required',
  'Unknown — not recovered',
  'Excluded',
] as const;

export type AppendixDDataValidationStatus =
  (typeof APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY)[number];

/** Banner when prior packet is missing (§14.7) — never substitute zero. */
export const PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER =
  'PRIOR-PERIOD PACKET NOT FOUND — Trend comparison unavailable.' as const;

/**
 * §14.8 Trend output dimensions.
 */
export const TREND_OUTPUT_DIMENSIONS = [
  'Current versus prior period',
  'Absolute change',
  'Percentage-point change',
  'Direction',
  'Target status',
  'Sustained performance',
  'Repeated deficiency',
  'Emerging decline',
  'Improvement',
  'PIP effectiveness',
  'CAP/RCA recurrence',
  'Reopened issues',
  'Carry-forward action status',
] as const;

export type TrendOutputDimension = (typeof TREND_OUTPUT_DIMENSIONS)[number];

export type TrendDirection =
  | 'improving'
  | 'worsening'
  | 'stable'
  | 'unknown'
  | 'not-comparable';

/**
 * One metric snapshot nested under QapiTrendSnapshot.metrics.
 * Nulls mean unknown/missing — never coerced to zero.
 */
export interface QapiMetricSnapshot {
  metricId: string;
  metricKey: string;
  label: string;
  definitionVersion: string;
  unit: string | null;
  numerator: number | null;
  denominator: number | null;
  rate: number | null;
  absoluteValue: number | string | null;
  target: number | string | null;
  priorValue: number | string | null;
  absoluteChange: number | null;
  percentagePointChange: number | null;
  direction: TrendDirection;
  comparability: ComparabilityState;
  comparabilityLimitation: string | null;
  targetStatus: string | null;
  sustainedPerformance: boolean | null;
  repeatedDeficiency: boolean | null;
  emergingDecline: boolean | null;
  improvement: boolean | null;
}

/** Nested finding snapshot (§16.6 findings). */
export interface QapiFindingSnapshot {
  findingId: string;
  category: string;
  description: string;
  severity: string | null;
  materiality: string | null;
  currentState: string | null;
  priorPeriodRelationship: string | null;
  recurrence: string | null;
  riskType: string | null;
  relatedWorkflowIds: string[];
  relatedMetricIds: string[];
  reopened: boolean | null;
}

/** Nested workflow snapshot (§16.6 workflows). */
export interface QapiWorkflowSnapshot {
  workflowId: string;
  workflowInstanceId: string | null;
  title: string | null;
  /** FR-012 decision state — closed vocabulary. */
  decisionState: WorkflowDecisionState;
  status: string | null;
  carryForward: boolean | null;
  dueDate: string | null;
  ownerRole: string | null;
}

/** Nested PIP snapshot (§16.6 pips). */
export interface QapiPipSnapshot {
  pipId: string;
  findingId: string | null;
  /** FR-015 determination — closed vocabulary. */
  determination: Fr015DeterminationOption | null;
  status: string | null;
  effectiveness: string | null;
  openedAt: string | null;
  closedAt: string | null;
  continuedFromPrior: boolean | null;
  relatedCapIds: string[];
  relatedRcaIds: string[];
}

/** Nested action-item snapshot (§16.6 actionItems). */
export interface QapiActionSnapshot {
  actionId: string;
  description: string;
  ownerRole: string | null;
  ownerUserId: string | null;
  dueDate: string | null;
  status: string | null;
  carryForwardStatus: string | null;
  relatedFindingIds: string[];
  relatedWorkflowIds: string[];
}

/** §16.6 QAPI trend snapshot — implement EXACTLY as specified. */
export interface QapiTrendSnapshot {
  packetInstanceId: string;
  packetVersion: number;
  packetHash: string;
  agencyId: string;
  eventFamilyId: string;
  eventInstanceId: string;
  workflowId: string;
  workflowInstanceId: string;
  cadence: 'monthly' | 'quarterly' | 'annual';
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  dataThroughDate: string;
  packetStatus: 'certified' | 'published' | 'locked';
  sourceClassification: 'production' | 'synthetic';
  kpiDefinitionVersion: string;
  metricSchemaVersion: string;
  metrics: QapiMetricSnapshot[];
  findings: QapiFindingSnapshot[];
  workflows: QapiWorkflowSnapshot[];
  pips: QapiPipSnapshot[];
  actionItems: QapiActionSnapshot[];
  publishedArtifactUrl: string;
  publishedFolderUrl: string;
  generatedAt: string;
}

/** Aggregate trend comparison output (§14.8). */
export interface TrendComparisonOutput {
  currentPacketInstanceId: string;
  priorPacketInstanceId: string | null;
  overallComparability: ComparabilityState;
  limitationDisclosure: string | null;
  /** When prior is missing, banner is set and metrics are not zero-filled. */
  missingPriorBanner: typeof PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER | null;
  metrics: QapiMetricSnapshot[];
  pipEffectiveness: string | null;
  capRcaRecurrence: string | null;
  reopenedIssues: string[];
  carryForwardActionStatuses: QapiActionSnapshot[];
  generatedAt: string;
}

/* ── §14.5 Sidecar JSON payload types ──────────────────────────────── */

export type SidecarArtifactKind =
  | 'analysis'
  | 'kpis'
  | 'workflows'
  | 'manifest'
  | 'audit';

/** Common header present on every sidecar payload. */
export interface SidecarPayloadHeader {
  packetInstanceId: string;
  packetVersion: number;
  packetHash: string;
  agencyId: string;
  generatedAt: string;
  sourceClassification: 'production' | 'synthetic';
}

/** `<packet>.analysis.json` sidecar. */
export interface AnalysisSidecarPayload extends SidecarPayloadHeader {
  kind: 'analysis';
  executiveAnalysis: string | null;
  findings: QapiFindingSnapshot[];
  riskSummary: string | null;
  comparabilityNotes: string | null;
}

/** `<packet>.kpis.json` sidecar. */
export interface KpisSidecarPayload extends SidecarPayloadHeader {
  kind: 'kpis';
  kpiDefinitionVersion: string;
  metricSchemaVersion: string;
  cadence: 'monthly' | 'quarterly' | 'annual';
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  metrics: QapiMetricSnapshot[];
}

/** `<packet>.workflows.json` sidecar. */
export interface WorkflowsSidecarPayload extends SidecarPayloadHeader {
  kind: 'workflows';
  workflows: QapiWorkflowSnapshot[];
  pips: QapiPipSnapshot[];
  actionItems: QapiActionSnapshot[];
}

/** One entry in the published artifact manifest. */
export interface ManifestSidecarEntry {
  artifactType: string;
  fileName: string;
  driveFileId: string | null;
  driveFileUrl: string | null;
  sha256: string;
  mimeType: string;
  sizeBytes: number | null;
  classification: string;
}

/** `<packet>.manifest.json` sidecar. */
export interface ManifestSidecarPayload extends SidecarPayloadHeader {
  kind: 'manifest';
  driveFolderId: string | null;
  driveFolderUrl: string | null;
  artifacts: ManifestSidecarEntry[];
}

/** One audit chronology row exported in the audit sidecar. */
export interface AuditSidecarEventRow {
  eventType: string;
  timestamp: string;
  actorId: string | null;
  actorRole: string | null;
  summary: string;
  resourceRef: string | null;
  previousHash: string | null;
  currentHash: string | null;
}

/** `<packet>.audit.json` sidecar. */
export interface AuditSidecarPayload extends SidecarPayloadHeader {
  kind: 'audit';
  chronologyId: string;
  events: AuditSidecarEventRow[];
}

/** Union of all five §14.5 sidecar payload types. */
export type PacketSidecarPayload =
  | AnalysisSidecarPayload
  | KpisSidecarPayload
  | WorkflowsSidecarPayload
  | ManifestSidecarPayload
  | AuditSidecarPayload;
