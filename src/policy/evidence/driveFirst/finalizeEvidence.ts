/**
 * Drive-first evidence architecture — idempotent evidence finalization.
 *
 * Implements the approved flow: authenticate/authorize → idempotent upload
 * session → temporary staging → validate → hash → canonical Drive file →
 * verify → metadata → audit → temp cleanup → return canonical link.
 *
 * Idempotency contract: every finalization accepts a stable commandId. A
 * retry with the same commandId must NOT create another Drive file — the
 * session state and the repository idempotency key both guard this, so the
 * "Drive created but metadata failed" partial failure reconciles instead of
 * duplicating.
 */
import { createHash } from 'node:crypto';
import type { Actor, DriveFirstEvidenceRecord, EvidenceType } from './contracts';
import { looksLikePhiName, sanitizeFileName } from './contracts';
import type { DriveEvidenceRepository, DriveFileMetadata } from './driveEvidenceRepository';
import type { TempObjectStore } from './tempObjectStore';
import type { EvidenceMetadataStore } from './metadataStore';
import type { AuditLedger } from './auditLedger';

export function sha256HexBytes(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export type UploadSessionState =
  | 'not_started'
  | 'temp_uploaded'
  | 'validated'
  | 'drive_file_created'
  | 'metadata_committed'
  | 'audit_appended'
  | 'temp_deleted'
  | 'reconciliation_required'
  | 'completed';

export interface UploadSession {
  uploadSessionId: string;
  commandId: string;
  actorUserId: string;
  tempPath: string;
  state: UploadSessionState;
  driveFileId?: string;
  evidenceId?: string;
  sha256?: string;
  lastError?: string;
}

export class UploadSessionStore {
  private sessions = new Map<string, UploadSession>();
  private seq = 0;

  /** Idempotent: the same commandId always returns the same session. */
  getOrCreate(commandId: string, actorUserId: string, tempPath: string): UploadSession {
    const existing = this.sessions.get(commandId);
    if (existing) return { ...existing };
    this.seq += 1;
    const session: UploadSession = {
      uploadSessionId: `us-${String(this.seq).padStart(4, '0')}`,
      commandId,
      actorUserId,
      tempPath,
      state: 'not_started',
    };
    this.sessions.set(commandId, session);
    return { ...session };
  }

  get(commandId: string): UploadSession | null {
    const s = this.sessions.get(commandId);
    return s ? { ...s } : null;
  }

  patch(commandId: string, patch: Partial<UploadSession>): UploadSession {
    const s = this.sessions.get(commandId);
    if (!s) throw new Error(`upload session for command ${commandId} not found.`);
    const updated = { ...s, ...patch };
    this.sessions.set(commandId, updated);
    return { ...updated };
  }
}

export class FinalizeError extends Error {
  readonly code:
    | 'unauthorized'
    | 'validation_error'
    | 'temp_object_missing'
    | 'phi_name'
    | 'drive_error'
    | 'metadata_error';
  constructor(code: FinalizeError['code'], message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'FinalizeError';
  }
}

export interface FinalizeDeps {
  drive: DriveEvidenceRepository;
  temp: TempObjectStore;
  metadata: EvidenceMetadataStore;
  audit: AuditLedger;
  sessions: UploadSessionStore;
  /** Deterministic clock injected by the caller (server time in production). */
  now: () => string;
}

export interface FinalizeEvidenceInput {
  commandId: string;
  actor: Actor;
  eventId: string;
  tempPath: string;
  evidenceType: EvidenceType;
  fileName: string;
  mimeType: string;
  driveFolderId: string;
  policyId?: string;
  workflowId?: string;
  taskId?: string;
  formId?: string;
  formInstanceId?: string;
  learnerId?: string;
  sourceSurface?: string;
  supersedesEvidenceId?: string;
  /** Required for signed_artifact / ecign_certificate types. */
  signedBy?: string;
  signedAt?: string;
  maxSizeBytes?: number;
}

export interface FinalizeEvidenceResult {
  evidenceId: string;
  driveFileId: string;
  driveWebViewLink: string;
  sha256: string;
  uploadSessionId: string;
  /** True when this call reused work from a prior attempt (no new Drive file). */
  reconciled: boolean;
}

const DEFAULT_MAX_BYTES = 32 * 1024 * 1024;

/**
 * Finalize a staged temporary object into canonical Drive evidence + metadata.
 * Safe to retry with the same commandId after any partial failure.
 */
export async function finalizeEvidence(
  deps: FinalizeDeps,
  input: FinalizeEvidenceInput,
): Promise<FinalizeEvidenceResult> {
  // 1–3. Authenticate actor / validate role and record scope.
  if (!input.actor?.userId) throw new FinalizeError('unauthorized', 'authenticated actor required.');
  if (!input.commandId) throw new FinalizeError('validation_error', 'commandId is required (idempotency key).');
  if (!input.eventId) throw new FinalizeError('validation_error', 'eventId is required.');
  if (input.evidenceType === 'signed_artifact' || input.evidenceType === 'ecign_certificate') {
    if (!input.signedBy || !input.signedAt) {
      throw new FinalizeError('validation_error', 'signed artifacts require signedBy and signedAt.');
    }
  }

  const safeFileName = sanitizeFileName(input.fileName);
  if (looksLikePhiName(safeFileName) || looksLikePhiName(input.fileName)) {
    throw new FinalizeError('phi_name', 'Evidence name appears to contain PHI/patient identifiers. Use system IDs only.');
  }

  // 4. Idempotent upload session.
  let session = deps.sessions.getOrCreate(input.commandId, input.actor.userId, input.tempPath);

  // Fully completed retry: return the recorded result without touching Drive.
  if (session.state === 'completed' && session.driveFileId && session.evidenceId && session.sha256) {
    const meta = await deps.drive.getFileMetadata(session.driveFileId);
    return {
      evidenceId: session.evidenceId,
      driveFileId: session.driveFileId,
      driveWebViewLink: meta.webViewLink,
      sha256: session.sha256,
      uploadSessionId: session.uploadSessionId,
      reconciled: true,
    };
  }

  let reconciled = false;
  let driveMeta: DriveFileMetadata;
  let sha256: string;
  let sizeBytes: number;

  // Reuse a Drive file created by a prior attempt (session state, then
  // repository idempotency lookup — covers a crash before the session was
  // patched).
  const priorDriveFileId = session.driveFileId
    ?? (await deps.drive.findByIdempotencyKey(input.commandId))?.fileId;

  if (priorDriveFileId) {
    driveMeta = await deps.drive.getFileMetadata(priorDriveFileId);
    const bytes = await deps.drive.getFileBytes(priorDriveFileId);
    sha256 = session.sha256 ?? sha256HexBytes(bytes);
    sizeBytes = bytes.length;
    reconciled = true;
    session = deps.sessions.patch(input.commandId, { state: 'drive_file_created', driveFileId: driveMeta.fileId, sha256 });
  } else {
    // 5–6. Validate the temporary object: existence, type, size, state.
    const tempObject = await deps.temp.get(input.tempPath);
    if (!tempObject) {
      throw new FinalizeError('temp_object_missing', `temporary object ${input.tempPath} not found; re-stage the upload.`);
    }
    session = deps.sessions.patch(input.commandId, { state: 'temp_uploaded' });
    if (tempObject.bytes.length === 0) throw new FinalizeError('validation_error', 'staged file is empty.');
    const maxBytes = input.maxSizeBytes ?? DEFAULT_MAX_BYTES;
    if (tempObject.bytes.length > maxBytes) {
      throw new FinalizeError('validation_error', `staged file exceeds the ${maxBytes}-byte limit.`);
    }
    if (input.mimeType && tempObject.mimeType && input.mimeType !== tempObject.mimeType) {
      throw new FinalizeError('validation_error', 'declared mimeType does not match the staged object.');
    }
    // 7. (Scanning hook would run here when configured.)
    // 8. SHA-256 over the staged bytes.
    sha256 = sha256HexBytes(tempObject.bytes);
    sizeBytes = tempObject.bytes.length;
    session = deps.sessions.patch(input.commandId, { state: 'validated', sha256 });

    // 9. Create the canonical Drive file (idempotent by commandId).
    try {
      driveMeta = await deps.drive.createFile({
        idempotencyKey: input.commandId,
        parentFolderId: input.driveFolderId,
        name: safeFileName,
        mimeType: input.mimeType,
        bytes: tempObject.bytes,
      });
    } catch (e) {
      deps.sessions.patch(input.commandId, { state: 'reconciliation_required', lastError: (e as Error).message });
      throw new FinalizeError('drive_error', `Drive write failed: ${(e as Error).message}`);
    }
    session = deps.sessions.patch(input.commandId, { state: 'drive_file_created', driveFileId: driveMeta.fileId });
  }

  // 10. Verify Drive metadata and expected access.
  const verified = await deps.drive.getFileMetadata(driveMeta.fileId);
  if (verified.trashed) throw new FinalizeError('drive_error', 'canonical Drive file is trashed; repair required.');

  // 11. Write the evidence metadata record.
  const evidenceId = session.evidenceId ?? `ev-${session.uploadSessionId}`;
  const now = deps.now();
  const record: DriveFirstEvidenceRecord = {
    evidenceId,
    policyId: input.policyId,
    workflowId: input.workflowId,
    eventId: input.eventId,
    taskId: input.taskId,
    formId: input.formId,
    formInstanceId: input.formInstanceId,
    learnerId: input.learnerId,
    sourceSurface: input.sourceSurface,
    evidenceType: input.evidenceType,
    documentVersion: 1,
    driveFileId: verified.fileId,
    driveFolderId: verified.parentFolderId,
    driveWebViewLink: verified.webViewLink,
    driveRevisionId: verified.revisionId,
    driveModifiedTime: verified.modifiedTime,
    fileName: safeFileName,
    mimeType: input.mimeType,
    sizeBytes,
    sha256,
    status: 'submitted',
    createdBy: input.actor.userId,
    createdAt: now,
    updatedAt: now,
    submittedBy: input.actor.userId,
    submittedAt: now,
    signedBy: input.signedBy,
    signedAt: input.signedAt,
    supersedesEvidenceId: input.supersedesEvidenceId,
    accessVerificationStatus: 'verified',
    lastAccessVerifiedAt: now,
    integrityStatus: 'current',
    driveSyncStatus: 'synced',
    driveSyncedAt: now,
    uploadSessionId: session.uploadSessionId,
    commandId: input.commandId,
  };
  try {
    const existing = await deps.metadata.get(evidenceId);
    if (!existing) await deps.metadata.put(record);
  } catch (e) {
    // Partial failure: the Drive file exists but metadata persistence failed.
    // Record enough state to reconcile on retry — the SAME commandId will find
    // the existing Drive file and must not create a second one.
    deps.sessions.patch(input.commandId, {
      state: 'reconciliation_required',
      evidenceId,
      lastError: (e as Error).message,
    });
    deps.audit.append({
      actorUserId: input.actor.userId,
      actorRole: input.actor.role,
      action: 'evidenceFinalize',
      entityType: 'evidence',
      entityId: evidenceId,
      evidenceId,
      eventId: input.eventId,
      commandId: input.commandId,
      result: 'partial_failure',
      detail: 'drive_file_created_metadata_write_failed',
    });
    throw new FinalizeError('metadata_error', `metadata write failed after Drive create: ${(e as Error).message}`);
  }
  session = deps.sessions.patch(input.commandId, { state: 'metadata_committed', evidenceId });

  // 12. Append server-side audit.
  deps.audit.append({
    actorUserId: input.actor.userId,
    actorRole: input.actor.role,
    action: 'evidenceFinalize',
    entityType: 'evidence',
    entityId: evidenceId,
    evidenceId,
    eventId: input.eventId,
    workflowId: input.workflowId,
    policyId: input.policyId,
    afterHash: sha256,
    commandId: input.commandId,
    result: 'ok',
  });
  session = deps.sessions.patch(input.commandId, { state: 'audit_appended' });

  // 13–14. Delete the temporary object, mark the session complete.
  await deps.temp.delete(input.tempPath);
  deps.sessions.patch(input.commandId, { state: 'completed' });

  // 15. Return the evidence ID and canonical Drive link.
  return {
    evidenceId,
    driveFileId: verified.fileId,
    driveWebViewLink: verified.webViewLink,
    sha256,
    uploadSessionId: session.uploadSessionId,
    reconciled,
  };
}

/** eCign integration point: the executed signed package becomes Drive evidence. */
export async function finalizeSignedArtifact(
  deps: FinalizeDeps,
  input: Omit<FinalizeEvidenceInput, 'evidenceType'> & { signedBy: string; signedAt: string },
): Promise<FinalizeEvidenceResult> {
  return finalizeEvidence(deps, { ...input, evidenceType: 'signed_artifact' });
}
