/**
 * eCIgn Path B — Phase 2A: canonical artifact store INTERFACE + typed errors.
 *
 * The canonical store holds the EXACT immutable signed/presented PDF bytes — the
 * source of truth. It is WRITE-ONCE by contract: there is no update/overwrite
 * operation at all. No storage VENDOR is chosen in 2A; this is the boundary a
 * future WORM/object-lock/DB-constraint adapter must satisfy. Drive/Evidence are
 * replicas only and live elsewhere.
 */
import type { ArtifactVersionId } from '../ids';
import type { CanonicalStorageLocator } from '../artifactContracts';

export type CanonicalStoreErrorCode = 'overwrite_forbidden' | 'not_found' | 'empty_bytes';

export class CanonicalStoreError extends Error {
  readonly code: CanonicalStoreErrorCode;
  constructor(code: CanonicalStoreErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'CanonicalStoreError';
  }
}

export interface StoredArtifactMeta {
  readonly versionId: ArtifactVersionId;
  readonly sha256: string;
  readonly byteLength: number;
  readonly locator: CanonicalStorageLocator;
}

export interface CanonicalArtifactStore {
  /**
   * Persist bytes immutably for `versionId`. Throws `overwrite_forbidden` if a
   * value already exists for that id (no silent rewrite), `empty_bytes` if empty.
   */
  putOnce(versionId: ArtifactVersionId, bytes: Uint8Array): StoredArtifactMeta;
  exists(versionId: ArtifactVersionId): boolean;
  /** Returns a COPY of the stored bytes. Throws `not_found`. */
  getBytes(versionId: ArtifactVersionId): Uint8Array;
  /** Throws `not_found`. */
  getMeta(versionId: ArtifactVersionId): StoredArtifactMeta;
  /** Recompute sha256 over the CURRENTLY stored bytes (integrity check). Throws `not_found`. */
  recomputeSha256(versionId: ArtifactVersionId): string;
}
