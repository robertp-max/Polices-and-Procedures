/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2+ RUNTIME specifications (EXPECTED-RED / TODO).
 *
 * These describe behaviors that require runtime infrastructure. Declared with
 * `it.todo` so they are tracked and reported as pending — never as passing, and
 * never breaking the test command.
 *
 * Phase 2A (storage & freeze) and 2B (parity, lock, eager replication, lineage)
 * are implemented; the remaining specs need infra/work not yet authorized.
 */
import { describe, it } from 'node:test';

// Phase 2A (DONE) — ./storage/storageAndFreeze.test.ts:
//   - write-once enforcement; exact presentation->storage byte freeze; server-side hash recompute.
// Phase 2B (DONE) — ./replicas/parityAndLock.test.ts:
//   - Drive byte parity; Evidence Center parity (independent sha, not link presence);
//   - recovery after partial external failure (idempotent, same artifactVersionId);
//   - multi-signer byte lineage A->B->C preserves every prior signed version retrievably.
describe('eCIgn Path B Phase 2+ — runtime specifications (TODO / expected-red)', () => {
  it.todo('PDF signature application produces a new immutable signed version without re-rendering the source');
  it.todo('restart/reconstruction rebuilds artifact/version state from durable (non-in-memory) records');
  it.todo('final survey packet export emits the real signed artifacts plus append-only audit');
});
