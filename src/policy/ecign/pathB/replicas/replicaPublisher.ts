/**
 * eCIgn Path B — Phase 2B: replica publisher INTERFACE + typed errors.
 *
 * A replica (Google Drive / Evidence Center) is an INDEX/REPLICA of the canonical
 * artifact — never the source of truth. The publisher copies canonical bytes to a
 * replica and can read them back for INDEPENDENT sha verification. No real Google
 * wiring here (2B uses a reference/fake adapter); a live adapter is a separate,
 * explicitly-authorized step.
 */
import type { ReplicaKind } from '../artifactContracts';
import type { ArtifactVersionId } from '../ids';

export type ReplicaPublishErrorCode = 'publish_failed' | 'permission_denied' | 'not_found';

export class ReplicaPublishError extends Error {
  readonly code: ReplicaPublishErrorCode;
  constructor(code: ReplicaPublishErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'ReplicaPublishError';
  }
}

export interface ReplicaPublishResult {
  readonly replicaKind: ReplicaKind;
  readonly versionId: ArtifactVersionId;
  /** Replica-side reference (Drive file id / Evidence record id) — index only. */
  readonly ref: string;
}

export interface ReplicaPublisher {
  readonly replicaKind: ReplicaKind;
  /** Publish canonical bytes to the replica. Idempotent by versionId. */
  publish(versionId: ArtifactVersionId, bytes: Uint8Array): ReplicaPublishResult;
  /** Read the replica's stored bytes back for INDEPENDENT verification. Throws not_found. */
  readBack(versionId: ArtifactVersionId): Uint8Array;
  exists(versionId: ArtifactVersionId): boolean;
}
