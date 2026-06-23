/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2+ RUNTIME specifications (EXPECTED-RED / TODO).
 *
 * These describe behaviors that require runtime infrastructure. Declared with
 * `it.todo` so they are tracked and reported as pending — never as passing, and
 * never breaking the test command.
 *
 * Phase 2A (storage & freeze) is implemented; later phases remain unauthorized.
 */
import { describe, it } from 'node:test';

// Phase 2A (DONE) — now covered by green tests in ./storage/storageAndFreeze.test.ts:
//   - write-once enforcement (overwrite rejected at the canonical store layer)
//   - exact presentation->storage byte freeze (presented bytes == persisted; sha recorded)
//   - server-side hash recompute over canonical store bytes matches recorded sha256 on read
describe('eCIgn Path B Phase 2+ — runtime specifications (TODO / expected-red)', () => {
  it.todo('PDF signature application produces a new immutable signed version without re-rendering the source');
  it.todo('multi-signer byte lineage A->B->C preserves every prior signed version retrievably');
  it.todo('Drive byte parity: replica bytes verified equal to canonical bytes (not link presence)');
  it.todo('Evidence Center parity: record resolves to the real canonical artifact bytes');
  it.todo('recovery after partial external failure (Drive/metadata) is idempotent and preserves artifactVersionId');
  it.todo('restart/reconstruction rebuilds artifact/version state from durable records');
  it.todo('final survey packet export emits the real signed artifacts plus append-only audit');
});
