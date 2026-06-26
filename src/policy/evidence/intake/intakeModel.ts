/**
 * Brad Evidence Intake — canonical conceptual model (Sections 5, 8, 10, 11, 22).
 *
 * These contracts extend (do not compete with) the existing evidence model:
 *   - canonical evidence is persisted through the regulatory execution store's
 *     `EvidenceDoc` (carrying driveFileId/version/supersedesEvidenceId);
 *   - CanonicalEvidence here is the intake-side projection that also tracks
 *     filing period, source lineage, classification, and packet linkage.
 */

import type { SourceSystem } from './sourceProfiles';

/* ─── Batch ─────────────────────────────────────────────────────── */

export type EvidenceIntakeBatchStatus =
  | 'waiting_for_upload'
  | 'parsing'
  | 'needs_date_review'
  | 'classified'
  | 'uploading_to_drive'
  | 'organized'
  | 'review_available'
  | 'drafts_ready'
  | 'packet_ready'
  | 'user_approval_required'
  | 'completed'
  | 'failed';

export interface EvidenceIntakeBatch {
  batchId: string;
  uploadedBy: string;
  uploadedAt: string;
  sourceSystemHint?: SourceSystem;
  intendedPeriod?: { year: number; month?: number };
  status: EvidenceIntakeBatchStatus;
  sourceFileIds: string[];
  recordCount: number;
  parsedCount: number;
  failedCount: number;
  unresolvedCount: number;
  /** Bound CES context when launched from a calendar event (Section 11). */
  eventId?: string;
  workflowId?: string;
  swimlaneId?: string;
  packetId?: string;
}

/* ─── Source record ─────────────────────────────────────────────── */

export type CreatedDateConfidence = 'high' | 'medium' | 'low' | 'unresolved';

export type EvidenceSourceRecordStatus =
  | 'parsed'
  | 'needs_date_review'
  | 'needs_classification_review'
  | 'ready'
  | 'failed';

export interface EvidenceSourceRecord {
  sourceRecordKey: string;
  batchId: string;
  sourceFileId: string;
  sourceFileName: string;
  /** JSON path / row / sheet:row / page / heading pointer (Section 4). */
  sourcePointer: string;
  sourceSystem: string | null;
  sourceRecordId: string | null;

  sourceSystemCreatedAt: string | null;
  occurrenceAt: string | null;
  reportedAt: string | null;
  receivedAt: string | null;
  uploadedAt: string;

  resolvedCreatedAt: string | null;
  createdDateSource: string | null;
  createdDateConfidence: CreatedDateConfidence;

  /** Derived filing keys (null until a created date resolves). */
  filingPeriodKey: string | null;
  filingQuarterKey: string | null;

  classification: EvidenceClassification;
  classificationConfidence: number;
  classificationRationale: string[];

  contentHash: string;
  canonicalEvidenceId?: string;
  status: EvidenceSourceRecordStatus;
}

/* ─── Canonical evidence (intake projection) ────────────────────── */

export type DriveUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed';

export interface CanonicalEvidence {
  evidenceId: string;
  batchId: string;
  sourceFileName: string;
  sourceFileId: string;
  sourcePointer: string;

  sourceSystem: string | null;
  sourceRecordId: string | null;
  sourceSystemCreatedAt: string | null;
  occurrenceAt: string | null;
  reportedAt: string | null;

  filingPeriodKey: string;
  filingQuarterKey: string;

  classification: EvidenceClassification;
  contentHash: string;
  recordVersion: number;
  supersedesEvidenceId?: string;

  driveFileId: string | null;
  driveFolderId: string | null;
  driveFolderPath: string | null;
  driveWebViewLink?: string | null;
  driveUploadStatus: DriveUploadStatus;
  driveErrorCode?: string | null;
  driveErrorMessage?: string | null;

  linkedEventIds: string[];
  linkedWorkflowIds: string[];
  linkedSwimlaneIds: string[];
  linkedPacketIds: string[];

  createdAt: string;
  createdBy: string;
}

/* ─── Packet membership & binding (Sections 10, 11) ─────────────── */

export type PacketInclusionStatus = 'suggested' | 'approved' | 'included' | 'excluded';

export interface EvidencePacketMembership {
  membershipId: string;
  canonicalEvidenceId: string;
  packetId: string;
  eventId: string;
  workflowId?: string;
  swimlaneId?: string;
  packetSectionId: string;
  inclusionReason: string;
  inclusionStatus: PacketInclusionStatus;
  /** Set when a physical Drive copy backs this membership (Section 10). */
  driveCopyFileId?: string;
  copiedFromDriveFileId?: string;
  createdBy: string;
  createdAt: string;
}

export interface EvidencePacketBinding {
  packetId: string;
  packetTypeId: string;
  eventId: string;
  workflowId: string | null;
  swimlaneId: string | null;
  filingPeriodKey: string;
  filingQuarterKey: string;
  /** ready when event + workflow + forms resolve; needs_mapping when not. */
  mappingStatus: 'ready' | 'partial' | 'needs_mapping';
}

/* ─── Classification taxonomy (Section 8) ───────────────────────── */

export const EVIDENCE_CLASSIFICATIONS = [
  'complaints_grievances',
  'incident_adverse_event',
  'abuse_neglect_exploitation',
  'infection_control',
  'infection_surveillance',
  'qapi_metrics',
  'qapi_minutes',
  'qapi_agenda',
  'qapi_action_items',
  'active_pip',
  'chart_audit',
  'poc_audit',
  'oasis_accuracy',
  'medication_reconciliation',
  'physician_orders',
  'personnel_file',
  'competency_validation',
  'training_attestation',
  'hipaa_training',
  'tb_screening',
  'employee_health',
  'emergency_preparedness',
  'governing_body',
  'policy_review',
  'oig_sam_exclusion',
  'billing_claims',
  'vulnerability_scan',
  'audit_export',
  'unknown_needs_review',
] as const;

export type EvidenceClassification = (typeof EVIDENCE_CLASSIFICATIONS)[number];

/* ─── Audit events (Section 22) ─────────────────────────────────── */

export const INTAKE_AUDIT_EVENTS = [
  'INTAKE_BATCH_CREATED',
  'SOURCE_FILE_RECEIVED',
  'SOURCE_FILE_PARSED',
  'SOURCE_RECORD_EXTRACTED',
  'CREATED_DATE_RESOLVED',
  'CREATED_DATE_REVIEW_REQUIRED',
  'EVIDENCE_CLASSIFIED',
  'CLASSIFICATION_OVERRIDDEN',
  'DUPLICATE_DETECTED',
  'EVIDENCE_VERSION_CREATED',
  'DRIVE_UPLOAD_STARTED',
  'DRIVE_UPLOAD_COMPLETED',
  'DRIVE_UPLOAD_FAILED',
  'PACKET_MEMBERSHIP_SUGGESTED',
  'PACKET_MEMBERSHIP_APPROVED',
  'DRIVE_COPY_CREATED',
  'BRAD_REVIEW_STARTED',
  'BRAD_REVIEW_COMPLETED',
  'BRAD_REVIEW_PARTIAL',
  'DRAFT_FORM_CREATED',
  'DRAFT_FORM_REVIEWED',
  'AGENDA_DRAFT_CREATED',
  'REVIEW_TASK_CREATED',
  'SIGNATURE_TASK_CREATED',
  'PACKET_DRAFT_CREATED',
  'PACKET_EXPORTED',
  'PACKET_UPLOADED_TO_DRIVE',
  'PACKET_SIGNED',
  'PACKET_LOCKED',
] as const;

export type IntakeAuditEvent = (typeof INTAKE_AUDIT_EVENTS)[number];

/* ─── Helpers ───────────────────────────────────────────────────── */

let _counter = 0;
/** Deterministic-ish unique id for runtime objects (not used in hashes). */
export function intakeId(prefix: string, seed?: string): string {
  _counter += 1;
  const base = seed ? seed.replace(/[^A-Za-z0-9]+/g, '-').slice(0, 32) : `${_counter}`;
  return `${prefix}-${base}-${_counter}`;
}
