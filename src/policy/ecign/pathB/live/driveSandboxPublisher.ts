/**
 * eCIgn Path B — Phase 2-live B: Drive SANDBOX publisher (behind the live gate).
 *
 * Implements an async replica publisher that uploads canonical bytes to a single
 * approved sandbox Drive folder, with TRAINING/SANDBOX labeling. The Google client
 * is INJECTED (`DriveClient`) so this module is googleapis-free and unit-testable
 * with a fake client — NO network, NO secrets, NO upload during normal tests.
 *
 * Hard rules enforced here: only the approved sandbox folder is written; every
 * file is TRAINING-labeled; NO public permissions; NO deletes; parity is proven by
 * recomputed sha256 (a link alone is never parity).
 */
import type { ReplicaParityRecord, ReplicaKind } from '../artifactContracts';
import type { ArtifactVersionId, DriveFileId, IsoTimestamp } from '../ids';
import { ReplicaPublishError, type ReplicaPublishResult } from '../replicas/replicaPublisher';
import type { VerifyParityInput } from '../replicas/parity';
import { sha256Hex } from '../storage/hash';

export const SANDBOX_FILE_PREFIX = 'TRAINING-' as const;
export const CANONICAL_MIME = 'application/pdf' as const;

export interface DriveSandboxUploadInput {
  readonly folderId: string;
  readonly name: string;
  readonly mimeType: string;
  readonly bytes: Uint8Array;
}
export interface DriveSandboxUploadResult {
  readonly fileId: string;
  readonly webViewLink?: string;
}

/** Minimal Drive transport boundary — the only thing a live adapter must provide. */
export interface DriveClient {
  uploadToFolder(input: DriveSandboxUploadInput): Promise<DriveSandboxUploadResult>;
  downloadBytes(fileId: string): Promise<Uint8Array>;
}

/** Async replica publisher (live I/O is async, unlike the sync fake reference adapter). */
export interface AsyncReplicaPublisher {
  readonly replicaKind: ReplicaKind;
  publish(versionId: ArtifactVersionId, bytes: Uint8Array): Promise<ReplicaPublishResult>;
  readBack(versionId: ArtifactVersionId): Promise<Uint8Array>;
  exists(versionId: ArtifactVersionId): boolean;
}

export interface DriveSandboxPublisherOptions {
  readonly client: DriveClient;
  /** The ONLY folder this publisher may write to (the approved sandbox folder). */
  readonly sandboxFolderId: string;
}

export class DriveSandboxPublisher implements AsyncReplicaPublisher {
  readonly replicaKind: ReplicaKind = 'drive';
  private readonly client: DriveClient;
  private readonly sandboxFolderId: string;
  private readonly uploaded = new Map<string, DriveSandboxUploadResult>();

  constructor(opts: DriveSandboxPublisherOptions) {
    if (!opts.sandboxFolderId || opts.sandboxFolderId.trim().length === 0) {
      throw new ReplicaPublishError('publish_failed', 'sandbox folder id is required');
    }
    this.client = opts.client;
    this.sandboxFolderId = opts.sandboxFolderId;
  }

  /** TRAINING-labeled file name for a version. */
  fileNameFor(versionId: ArtifactVersionId): string {
    return `${SANDBOX_FILE_PREFIX}${versionId}.pdf`;
  }

  async publish(versionId: ArtifactVersionId, bytes: Uint8Array): Promise<ReplicaPublishResult> {
    const existing = this.uploaded.get(versionId);
    if (existing) {
      return { replicaKind: this.replicaKind, versionId, ref: existing.fileId }; // idempotent
    }
    const res = await this.client.uploadToFolder({
      folderId: this.sandboxFolderId, // only the approved sandbox folder
      name: this.fileNameFor(versionId), // TRAINING-labeled
      mimeType: CANONICAL_MIME,
      bytes,
    });
    this.uploaded.set(versionId, res);
    return { replicaKind: this.replicaKind, versionId, ref: res.fileId };
  }

  async readBack(versionId: ArtifactVersionId): Promise<Uint8Array> {
    const r = this.uploaded.get(versionId);
    if (!r) throw new ReplicaPublishError('not_found');
    return this.client.downloadBytes(r.fileId);
  }

  exists(versionId: ArtifactVersionId): boolean {
    return this.uploaded.has(versionId);
  }

  getUpload(versionId: ArtifactVersionId): DriveSandboxUploadResult | undefined {
    return this.uploaded.get(versionId);
  }
}

/** Async parity: publish → read back → recompute sha256 → verified only on match. */
export async function publishAndVerifyAsync(
  publisher: AsyncReplicaPublisher,
  input: VerifyParityInput,
): Promise<ReplicaParityRecord> {
  const base = {
    replicaKind: publisher.replicaKind,
    artifactVersionId: input.versionId,
    canonicalSha256: input.canonicalSha256,
    verifiedAt: input.verifiedAt,
  } as const;
  try {
    const { ref } = await publisher.publish(input.versionId, input.bytes);
    const replicaSha256 = sha256Hex(await publisher.readBack(input.versionId));
    const refField =
      publisher.replicaKind === 'drive' ? { driveFileId: ref as DriveFileId } : {};
    if (replicaSha256 === input.canonicalSha256) {
      return { ...base, ...refField, replicaSha256, status: 'verified' };
    }
    return { ...base, ...refField, replicaSha256, status: 'mismatch', failureReason: 'sha_mismatch' };
  } catch (e) {
    const failureReason =
      e instanceof ReplicaPublishError && e.code === 'permission_denied' ? 'permission_denied' : 'replica_unreadable';
    return { ...base, status: 'failed', failureReason };
  }
}

export interface SandboxUploadResult {
  readonly artifactVersionId: ArtifactVersionId;
  readonly driveFileId: string;
  readonly webViewLink?: string;
  readonly sha256: string;
  readonly byteLength: number;
  readonly sandboxFolderId: string;
  readonly uploadedAt: IsoTimestamp;
  readonly label: 'TRAINING';
  readonly parityStatus: ReplicaParityRecord['status'];
}

/** Assemble the audit-friendly upload result (item #7) from a completed publish + parity. */
export function buildSandboxUploadResult(input: {
  publisher: DriveSandboxPublisher;
  versionId: ArtifactVersionId;
  bytes: Uint8Array;
  sandboxFolderId: string;
  uploadedAt: IsoTimestamp;
  parity: ReplicaParityRecord;
}): SandboxUploadResult {
  const up = input.publisher.getUpload(input.versionId);
  if (!up) throw new ReplicaPublishError('not_found', 'no upload recorded for version');
  return {
    artifactVersionId: input.versionId,
    driveFileId: up.fileId,
    webViewLink: up.webViewLink,
    sha256: sha256Hex(input.bytes),
    byteLength: input.bytes.byteLength,
    sandboxFolderId: input.sandboxFolderId,
    uploadedAt: input.uploadedAt,
    label: 'TRAINING',
    parityStatus: input.parity.status,
  };
}
