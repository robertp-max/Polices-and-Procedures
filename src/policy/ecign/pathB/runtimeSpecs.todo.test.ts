/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2+ RUNTIME specifications (EXPECTED-RED / TODO).
 *
 * These describe behaviors that require runtime infrastructure NOT authorized in
 * Phase 1 (write-once storage, PDF signing, server-side hashing, Drive/Evidence
 * parity, recovery, export). They are declared with `it.todo` so they are tracked
 * and reported as pending — never as passing, and never breaking the test command.
 *
 * Phase 2 is NOT authorized. Do not implement these in Phase 1.
 */
import { describe, it } from 'node:test';

describe('eCIgn Path B Phase 2+ — runtime specifications (TODO / expected-red)', () => {
  it.todo('write-once infrastructure enforcement (object-lock/WORM/DB constraint) rejects any overwrite of canonical bytes');
  it.todo('exact presentation-to-storage byte freeze: presented bytes == persisted canonical bytes (server-recomputed sha256)');
  it.todo('PDF signature application produces a new immutable signed version without re-rendering the source');
  it.todo('multi-signer byte lineage A->B->C preserves every prior signed version retrievably');
  it.todo('server-side hash recompute over canonical store bytes matches recorded sha256 on every read');
  it.todo('Drive byte parity: replica bytes verified equal to canonical bytes (not link presence)');
  it.todo('Evidence Center parity: record resolves to the real canonical artifact bytes');
  it.todo('recovery after partial external failure (Drive/metadata) is idempotent and preserves artifactVersionId');
  it.todo('restart/reconstruction rebuilds artifact/version state from durable records');
  it.todo('final survey packet export emits the real signed artifacts plus append-only audit');
});
