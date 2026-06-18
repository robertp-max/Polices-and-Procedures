/**
 * CES storage provider contract — the single canonical description of WHERE
 * each kind of CES data lives. This file is the source of truth referenced by
 * the no-localStorage and Google-Drive-evidence validators.
 *
 * LOCKED ARCHITECTURE
 * ───────────────────
 *   google_drive_calendar  → actual files / artifacts (PHI-bearing files,
 *                             final signed form PDFs, eCIgn certificate PDFs,
 *                             final evidence packages). Drive stores bytes;
 *                             Calendar indexes/attaches references.
 *   dynamodb_metadata      → live non-PHI operational metadata (event
 *                             execution state, task/form/signature status,
 *                             evidence + artifact POINTERS, completion /
 *                             certification state, audit readiness). No bytes.
 *   s3_metadata_snapshot   → OPTIONAL, non-PHI only (audit JSONL, manifest
 *                             snapshots, survey-packet index, metadata exports).
 *                             NEVER CES artifact files / signed PDFs / charts.
 *
 * PROHIBITED
 * ──────────
 *   - No `localStorage` provider for CES/evidence/form/eCIgn/artifact/event
 *     execution persistence. No localStorage fallback. Ever.
 *   - No file/binary bodies in CES metadata, DynamoDB, S3, or localStorage.
 */

import type {
  EvidenceDoc,
  ApprovalRequest,
  CompletionState,
  InstanceNote,
  CertificationRecord,
  FormState,
  StepState,
  MinutesState,
} from '@/policy/stores/regulatoryExecutionStore';

/** CES storage providers. There is intentionally NO `localStorage` member. */
export type CesStorageProvider =
  | 'google_drive_calendar'
  | 'dynamodb_metadata'
  | 's3_metadata_snapshot';

export type CalendarAttachmentStatus =
  | 'attached'
  | 'pending_attach'
  | 'attach_failed'
  | 'not_attached'
  | 'removed';

export type EvidenceContentStatus = 'available' | 'metadata_only' | 'missing';

/**
 * Canonical reference to a CES file stored in Google Drive and indexed on the
 * matching Google Calendar event. Pointer-only — never carries file bytes.
 */
export interface GoogleDriveEvidenceRef {
  storageProvider: 'google_drive_calendar';
  eventId: string;
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  calendarEventId?: string;
  driveFileId: string;
  driveFileUrl: string;
  driveFolderId?: string;
  mimeType?: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string;
  attachmentStatus: CalendarAttachmentStatus;
  contentStatus: EvidenceContentStatus;
  hash?: string;
  artifactId?: string;
  pdfVersion?: number;
  status?: string;
  signerSlotOrder?: number;
  signerUserId?: string;
  signerRole?: string;
  signerTier?: number;
  signerDomain?: string;
  signedAt?: string;
  priorDocumentHash?: string;
  finalDocumentHash?: string;
  auditEventIds?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * The non-PHI CES operational metadata snapshot persisted to the backend
 * (DynamoDB in production, file-backed locally). This mirrors the metadata the
 * regulatory execution store previously kept in the `reg-execution-v2`
 * localStorage key — but it now lives ONLY in the backend.
 *
 * Hard rule: this snapshot must never carry file bytes (no `localDataUrl`,
 * base64, PDF/certificate blobs) or PHI. Pointers/status/IDs only.
 */
export interface CesMetadataSnapshot {
  schemaVersion: number;
  /** Logical owner of this CES state (org/workspace/demo account scope). */
  workspaceId: string;
  updatedAt: string;

  formStates: Record<string, FormState>;
  stepStates: Record<string, StepState>;
  minutesStates: Record<string, MinutesState>;
  /** Evidence POINTERS by eventId — never file bytes. */
  evidence: Record<string, EvidenceDoc[]>;
  approvals: ApprovalRequest[];
  completions: Record<string, CompletionState>;
  notes: Record<string, InstanceNote[]>;
  certifications: Record<string, CertificationRecord>;
  eventInstancesById: Record<string, unknown>;
  eventInstanceIdsBySourceEventId: Record<string, string[]>;
  taskOverridesByEventId: Record<string, unknown[]>;
  taskAuditByEventId: Record<string, unknown[]>;
  generatedFormInstancesByEventId: Record<string, unknown>;
  evidenceErrorsByEventId: Record<string, string>;
}

/** Result envelope for a backend metadata load — drives honest UI states. */
export type CesMetadataLoad =
  | { status: 'ok'; snapshot: CesMetadataSnapshot }
  | { status: 'empty' }
  | { status: 'unavailable'; message: string };

/** The single honest copy shown when the CES backend cannot be reached. */
export const CES_BACKEND_UNAVAILABLE_MESSAGE =
  'CES backend storage unavailable. Evidence/form/signature state cannot be loaded.';

/**
 * Fields that must NEVER appear in a CES metadata snapshot (file bytes / blobs).
 * Used by the no-localStorage validator and the backend write guard.
 */
export const CES_FORBIDDEN_METADATA_FIELDS = [
  'localDataUrl',
  'base64',
  'rawBytes',
  'pdfBlob',
  'signedPacketBlob',
  'certificateHtml',
  'htmlSnapshot',
] as const;
