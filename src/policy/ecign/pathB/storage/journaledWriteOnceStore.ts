/**
 * eCIgn Path B — Phase 2 (runtime reference): journaled write-once store.
 *
 * Demonstrates RESTART/RECONSTRUCTION: every `putOnce` is recorded in an
 * append-only journal, and a fresh store can be rebuilt by replaying it. This is
 * a REFERENCE for the durable-store invariant (rebuild state from durable records)
 * — still in-memory (no filesystem/vendor); the production WORM backend is deferred.
 */
import type { ArtifactVersionId } from '../ids';
import { InMemoryWriteOnceStore } from './inMemoryWriteOnceStore';
import type { CanonicalArtifactStore, StoredArtifactMeta } from './canonicalArtifactStore';

export interface JournalEntry {
  readonly versionId: ArtifactVersionId;
  readonly bytes: Uint8Array;
}

export class JournaledWriteOnceStore implements CanonicalArtifactStore {
  private readonly inner = new InMemoryWriteOnceStore();
  private readonly journal: JournalEntry[] = [];

  putOnce(versionId: ArtifactVersionId, bytes: Uint8Array): StoredArtifactMeta {
    const meta = this.inner.putOnce(versionId, bytes); // throws before journaling on overwrite/empty
    this.journal.push({ versionId, bytes: Uint8Array.from(bytes) });
    return meta;
  }

  exists(versionId: ArtifactVersionId): boolean {
    return this.inner.exists(versionId);
  }
  getBytes(versionId: ArtifactVersionId): Uint8Array {
    return this.inner.getBytes(versionId);
  }
  getMeta(versionId: ArtifactVersionId): StoredArtifactMeta {
    return this.inner.getMeta(versionId);
  }
  recomputeSha256(versionId: ArtifactVersionId): string {
    return this.inner.recomputeSha256(versionId);
  }

  /** The durable, append-only record (copies). */
  exportJournal(): JournalEntry[] {
    return this.journal.map((e) => ({ versionId: e.versionId, bytes: Uint8Array.from(e.bytes) }));
  }

  /** Rebuild a fresh store by replaying a journal (restart/reconstruction). */
  static fromJournal(journal: readonly JournalEntry[]): JournaledWriteOnceStore {
    const store = new JournaledWriteOnceStore();
    for (const entry of journal) store.putOnce(entry.versionId, entry.bytes);
    return store;
  }
}
