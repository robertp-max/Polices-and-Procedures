/**
 * Drive-first evidence architecture — canonical metadata contract.
 *
 * Google Drive stores canonical evidence artifacts. Firestore (DynamoDB/file
 * today) stores evidence metadata and all normal operational state.
 * Non-evidence records remain metadata only. Google Cloud Storage, when used,
 * is temporary processing infrastructure and not a second evidence system of
 * record.
 *
 * This module is the pure, storage-agnostic contract behind the EXISTING
 * evidence workflow (Evidence Center / WorkflowDrawer / CES). It is an
 * adapter layer, not a rebuild: the live Drive implementation is
 * `server/googleDrive.ts` + `server/googleEvidence.ts`; the deterministic
 * in-memory adapters in this folder exist so the finalization, review,
 * supersede, integrity, and packet flows can be validated without any
 * network or cloud resource.
 */

/** User-facing evidence lifecycle — preserved from the existing workflow. */
export type EvidenceStatus =
  | 'staged'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'superseded';

/** Internal processing states — never replace the user-facing lifecycle. */
export type EvidenceProcessingState =
  | 'validating'
  | 'transferring'
  | 'repair_required'
  | 'integrity_error'
  | null;

export type EvidenceType =
  | 'supporting_documentation'
  | 'form_instance'
  | 'signed_artifact'
  | 'ecign_certificate'
  | 'final_package'
  | 'audit_export';

export type IntegrityStatus =
  | 'current'
  | 'pending'
  | 'missing'
  | 'trashed'
  | 'access_denied'
  | 'moved'
  | 'revision_changed'
  | 'hash_mismatch'
  | 'orphaned_firestore_record'
  | 'orphaned_drive_file'
  | 'repair_required';

export type ActorRole = 'learner' | 'supervisor' | 'admin' | 'compliance';

export interface Actor {
  userId: string;
  role: ActorRole;
}

/** Roles allowed to accept/reject evidence and finalize packets. */
export const REVIEWER_ROLES: readonly ActorRole[] = ['supervisor', 'admin', 'compliance'];

/**
 * Canonical evidence metadata record. Pointer-only: never file bytes, never
 * base64 bodies, never full signed PDFs, never PHI. The Drive fileId is the
 * stable identity; the webViewLink is refreshable presentation metadata.
 */
export interface DriveFirstEvidenceRecord {
  evidenceId: string;
  policyId?: string;
  workflowId?: string;
  eventId: string;
  taskId?: string;
  formId?: string;
  formInstanceId?: string;
  learnerId?: string;
  sourceSurface?: string;
  evidenceType: EvidenceType;
  documentVersion: number;

  driveFileId: string;
  driveFolderId?: string;
  driveSharedDriveId?: string;
  driveWebViewLink?: string;
  driveRevisionId?: string;
  driveModifiedTime?: string;

  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;

  status: EvidenceStatus;
  processingState?: EvidenceProcessingState;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  submittedBy?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  decision?: 'accepted' | 'rejected';
  rejectionReason?: string;

  signedBy?: string;
  signedAt?: string;
  lockedAt?: string;
  supersedesEvidenceId?: string;

  accessVerificationStatus?: 'verified' | 'unverified' | 'failed';
  lastAccessVerifiedAt?: string;
  integrityStatus?: IntegrityStatus;
  driveSyncStatus?: 'synced' | 'pending' | 'failed';
  driveSyncedAt?: string;

  retentionClass?: string;
  legalHold?: boolean;

  uploadSessionId?: string;
  commandId?: string;
  auditRef?: string;
}

/* ─── Non-PHI guards (mirrors server/googleEvidence.ts semantics) ────────── */

/**
 * Heuristic PHI tripwire for names — defensive backstop, not the primary
 * control. Builders always construct names from system IDs.
 */
export function looksLikePhiName(value: string): boolean {
  const s = String(value ?? '');
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(s)) return true;                 // SSN
  if (/\bmrn[-_ ]?\d{3,}\b/i.test(s)) return true;                  // MRN
  if (/\bdob\b/i.test(s)) return true;                              // date of birth label
  if (/\b\d{2}[/-]\d{2}[/-]\d{4}\b/.test(s)) return true;           // date-like (possible DOB)
  if (/\bpatient[-_ ]+[a-z]+[-_ ]+[a-z]+/i.test(s)) return true;    // "patient first last"
  return false;
}

/** Sanitize a filename while preserving a single extension (non-PHI, safe). */
export function sanitizeFileName(name: string): string {
  const raw = String(name ?? 'file');
  const dot = raw.lastIndexOf('.');
  const ext = dot > 0 ? raw.slice(dot + 1).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) : '';
  const stem = raw
    .slice(0, dot > 0 ? dot : undefined)
    .normalize('NFKD')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 120) || 'unspecified';
  return ext ? `${stem}.${ext.toLowerCase()}` : stem;
}

/** Validation problems for an evidence record (empty array = valid). */
export function validateEvidenceRecord(record: Partial<DriveFirstEvidenceRecord>): string[] {
  const problems: string[] = [];
  if (!record.evidenceId) problems.push('missing evidenceId.');
  if (!record.eventId) problems.push('missing eventId.');
  if (!record.driveFileId) problems.push('missing driveFileId (Drive is the canonical evidence store).');
  if (!record.sha256) problems.push('missing sha256.');
  if (!record.fileName) problems.push('missing fileName.');
  if (record.fileName && looksLikePhiName(record.fileName)) {
    problems.push('fileName appears to contain PHI/patient identifiers. Use system IDs only.');
  }
  if (record.formId && !record.formInstanceId) problems.push('form evidence is missing formInstanceId.');
  if (record.formInstanceId && !record.formId) problems.push('form evidence is missing formId.');
  if (record.evidenceType === 'signed_artifact' || record.evidenceType === 'ecign_certificate') {
    if (!record.signedBy) problems.push('signed artifact is missing signedBy.');
    if (!record.signedAt) problems.push('signed artifact is missing signedAt.');
  }
  const forbidden = ['contentBase64', 'bytes', 'fileContents', 'signatureImage'];
  for (const key of forbidden) {
    if (key in (record as Record<string, unknown>)) {
      problems.push(`metadata record must never carry file bytes ("${key}").`);
    }
  }
  return problems;
}
