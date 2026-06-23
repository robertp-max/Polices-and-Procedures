/**
 * eCIgn Path B — Phase 2A: REFERENCE in-memory write-once store.
 *
 * TEST/REFERENCE IMPLEMENTATION ONLY — proves the write-once + content-integrity
 * semantics of `CanonicalArtifactStore`. NOT a production backend (no durability,
 * no object-lock). A real adapter (WORM bucket / object-lock / DB constraint) is
 * deferred. Stores private byte COPIES so external mutation cannot tamper.
 */
import type { ArtifactVersionId } from '../ids';
import type { CanonicalStorageLocator } from '../artifactContracts';
import {
  CanonicalStoreError,
  type CanonicalArtifactStore,
  type StoredArtifactMeta,
} from './canonicalArtifactStore';
import { sha256Hex } from './hash';

interface Entry {
  readonly bytes: Uint8Array;
  readonly meta: StoredArtifactMeta;
}

export class InMemoryWriteOnceStore implements CanonicalArtifactStore {
  private readonly entries = new Map<string, Entry>();

  putOnce(versionId: ArtifactVersionId, bytes: Uint8Array): StoredArtifactMeta {
    if (this.entries.has(versionId)) {
      throw new CanonicalStoreError('overwrite_forbidden', `canonical bytes already exist for ${versionId}`);
    }
    if (bytes.length === 0) {
      throw new CanonicalStoreError('empty_bytes', `refusing to store empty bytes for ${versionId}`);
    }
    const copy = Uint8Array.from(bytes);
    const locator: CanonicalStorageLocator = { store: 'canonical', ref: `canonical://mem/${versionId}` };
    const meta: StoredArtifactMeta = {
      versionId,
      sha256: sha256Hex(copy),
      byteLength: copy.length,
      locator,
    };
    this.entries.set(versionId, { bytes: copy, meta });
    return meta;
  }

  exists(versionId: ArtifactVersionId): boolean {
    return this.entries.has(versionId);
  }

  getBytes(versionId: ArtifactVersionId): Uint8Array {
    const entry = this.require(versionId);
    return Uint8Array.from(entry.bytes);
  }

  getMeta(versionId: ArtifactVersionId): StoredArtifactMeta {
    return this.require(versionId).meta;
  }

  recomputeSha256(versionId: ArtifactVersionId): string {
    return sha256Hex(this.require(versionId).bytes);
  }

  private require(versionId: ArtifactVersionId): Entry {
    const entry = this.entries.get(versionId);
    if (!entry) throw new CanonicalStoreError('not_found', `no canonical bytes for ${versionId}`);
    return entry;
  }
}
