/**
 * eCIgn Path B — Phase 2B: REFERENCE/FAKE replica publisher (test only).
 *
 * Simulates a Drive/Evidence replica in-memory. NOT a production adapter — no
 * Google calls, no network. Supports injectable failure modes so parity/recovery
 * can be tested deterministically. A real Google adapter is deferred to a separate
 * explicitly-authorized step.
 */
import type { ReplicaKind } from '../artifactContracts';
import type { ArtifactVersionId } from '../ids';
import {
  ReplicaPublishError,
  type ReplicaPublisher,
  type ReplicaPublishResult,
} from './replicaPublisher';

export interface FakeReplicaFailureModes {
  /** publish() throws publish_failed. */
  failPublish: boolean;
  /** publish() throws permission_denied. */
  permissionDenied: boolean;
  /** stored bytes are altered → readBack yields different bytes → sha mismatch. */
  corruptOnStore: boolean;
}

export class FakeReplicaPublisher implements ReplicaPublisher {
  readonly replicaKind: ReplicaKind;
  /** Mutable so tests can simulate failure then recovery. */
  readonly failures: FakeReplicaFailureModes;
  private readonly store = new Map<string, Uint8Array>();
  private seq = 0;

  constructor(replicaKind: ReplicaKind, failures?: Partial<FakeReplicaFailureModes>) {
    this.replicaKind = replicaKind;
    this.failures = { failPublish: false, permissionDenied: false, corruptOnStore: false, ...failures };
  }

  publish(versionId: ArtifactVersionId, bytes: Uint8Array): ReplicaPublishResult {
    if (this.failures.permissionDenied) throw new ReplicaPublishError('permission_denied');
    if (this.failures.failPublish) throw new ReplicaPublishError('publish_failed');
    if (!this.store.has(versionId)) {
      const stored = Uint8Array.from(bytes);
      if (this.failures.corruptOnStore && stored.length > 0) stored[0] = stored[0] ^ 0xff;
      this.store.set(versionId, stored);
      this.seq += 1;
    }
    // idempotent: a stable ref per versionId
    return { replicaKind: this.replicaKind, versionId, ref: `${this.replicaKind}://fake/${versionId}` };
  }

  readBack(versionId: ArtifactVersionId): Uint8Array {
    const stored = this.store.get(versionId);
    if (!stored) throw new ReplicaPublishError('not_found');
    return Uint8Array.from(stored);
  }

  exists(versionId: ArtifactVersionId): boolean {
    return this.store.has(versionId);
  }

  /** Clear injected failures (simulate the external condition being resolved). */
  recover(): void {
    this.failures.failPublish = false;
    this.failures.permissionDenied = false;
  }
}
