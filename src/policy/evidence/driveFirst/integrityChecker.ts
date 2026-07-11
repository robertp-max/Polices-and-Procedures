/**
 * Drive-first evidence architecture — Drive synchronization and integrity.
 *
 * Google Drive is canonical but NOT automatically WORM. This checker proves
 * the metadata and the artifacts still agree, and resolves evidence links
 * honestly: a trashed, missing, or access-denied file is never presented as
 * valid evidence.
 */
import type { DriveFirstEvidenceRecord, IntegrityStatus } from './contracts';
import type { DriveEvidenceRepository } from './driveEvidenceRepository';
import { DriveRepositoryError } from './driveEvidenceRepository';
import type { EvidenceMetadataStore } from './metadataStore';
import { sha256HexBytes } from './finalizeEvidence';

export interface IntegrityReport {
  evidenceId: string;
  driveFileId: string;
  status: IntegrityStatus;
  detail?: string;
}

export interface IntegrityCheckOptions {
  /**
   * Recompute the SHA-256 over the Drive bytes. Off by default — contents are
   * downloaded only when an integrity calculation requires it.
   */
  recomputeHash?: boolean;
}

/** Check a single evidence record against the canonical Drive file. */
export async function checkEvidenceIntegrity(
  record: DriveFirstEvidenceRecord,
  drive: DriveEvidenceRepository,
  options: IntegrityCheckOptions = {},
): Promise<IntegrityReport> {
  const base = { evidenceId: record.evidenceId, driveFileId: record.driveFileId };
  if (!record.driveFileId) {
    return { ...base, status: 'orphaned_firestore_record', detail: 'metadata record has no Drive file id.' };
  }
  let meta;
  try {
    meta = await drive.getFileMetadata(record.driveFileId);
  } catch (e) {
    if (e instanceof DriveRepositoryError && e.code === 'not_found') {
      return { ...base, status: 'missing', detail: 'canonical Drive file not found.' };
    }
    if (e instanceof DriveRepositoryError && e.code === 'access_denied') {
      return { ...base, status: 'access_denied', detail: 'expected access to the Drive file was lost.' };
    }
    throw e;
  }
  if (meta.trashed) return { ...base, status: 'trashed', detail: 'Drive file is in the trash.' };
  if (record.driveFolderId && meta.parentFolderId !== record.driveFolderId) {
    return { ...base, status: 'moved', detail: `file moved to folder ${meta.parentFolderId}.` };
  }
  if (record.driveRevisionId && meta.revisionId !== record.driveRevisionId) {
    return { ...base, status: 'revision_changed', detail: `revision ${meta.revisionId} != recorded ${record.driveRevisionId}.` };
  }
  if (options.recomputeHash) {
    const bytes = await drive.getFileBytes(record.driveFileId);
    const actual = sha256HexBytes(bytes);
    if (actual !== record.sha256) {
      return { ...base, status: 'hash_mismatch', detail: 'recomputed SHA-256 differs from the recorded hash.' };
    }
  }
  return { ...base, status: 'current' };
}

export interface OrphanScanResult {
  /** Metadata records whose canonical Drive file no longer exists. */
  orphanedFirestoreRecords: string[];
  /** Drive files with no metadata record pointing at them. */
  orphanedDriveFiles: string[];
}

/** Bidirectional orphan scan (scheduled integrity sweep). */
export async function scanForOrphans(
  metadata: EvidenceMetadataStore,
  drive: DriveEvidenceRepository,
): Promise<OrphanScanResult> {
  const records = await metadata.listAll();
  const driveIds = new Set(await drive.listAllFileIds());
  const referenced = new Set<string>();
  const orphanedFirestoreRecords: string[] = [];
  for (const record of records) {
    referenced.add(record.driveFileId);
    if (!driveIds.has(record.driveFileId)) orphanedFirestoreRecords.push(record.evidenceId);
  }
  const orphanedDriveFiles = [...driveIds].filter((id) => !referenced.has(id));
  return { orphanedFirestoreRecords, orphanedDriveFiles };
}

export interface ResolvedEvidenceLink {
  ok: true;
  href: string;
  target: '_blank';
  rel: 'noopener noreferrer';
  driveFileId: string;
}

export interface UnresolvedEvidenceLink {
  ok: false;
  integrityStatus: IntegrityStatus;
  detail?: string;
}

/**
 * Resolve the canonical Drive link for display. Always the Drive reference —
 * never a locally constructed fake URL and never a GCS fallback. Trashed,
 * missing, or access-denied files resolve to a visible integrity error.
 */
export async function resolveEvidenceLink(
  record: DriveFirstEvidenceRecord,
  drive: DriveEvidenceRepository,
): Promise<ResolvedEvidenceLink | UnresolvedEvidenceLink> {
  const report = await checkEvidenceIntegrity(record, drive);
  if (report.status !== 'current' && report.status !== 'revision_changed' && report.status !== 'moved') {
    return { ok: false, integrityStatus: report.status, detail: report.detail };
  }
  const meta = await drive.getFileMetadata(record.driveFileId);
  return {
    ok: true,
    href: meta.webViewLink || drive.fileUrl(record.driveFileId),
    target: '_blank',
    rel: 'noopener noreferrer',
    driveFileId: record.driveFileId,
  };
}
