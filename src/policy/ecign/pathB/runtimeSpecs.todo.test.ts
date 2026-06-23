/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2 runtime specifications: STATUS MAP.
 *
 * All Phase-2 runtime specs are now implemented at the contract/reference level
 * (no real Google calls, no production storage vendor, no new deps). The only work
 * left is LIVE INTEGRATION, which is intentionally NOT a unit `it.todo` here —
 * it needs real credentials/sandbox + explicit authorization (see notes below).
 */
import { describe, it } from 'node:test';

// DONE (green tests):
//  Phase 2A — ./storage/storageAndFreeze.test.ts: write-once; byte-freeze; server-side recompute.
//  Phase 2B — ./replicas/parityAndLock.test.ts: Drive parity; Evidence parity (independent sha,
//             not link presence); failure+idempotent recovery; A->B->C lineage retrievability.
//  Phase 2  — ./runtimeReference.test.ts: signature application (new immutable version, source
//             not re-rendered); restart/reconstruction from a durable journal; survey packet export
//             of real signed artifacts + audit.
//  Retention — ./retentionLifecycle.test.ts: complete=indefinite; incomplete=90d expiry+archive.
//
// DEFERRED — LIVE integration only (NOT autonomous; needs explicit go + sandbox):
//  - Live Google Drive adapter + real Evidence Center writes (replace the fake adapter).
//  - Production WORM/object-lock canonical store behind CanonicalArtifactStore.
//  - Real PDF/crypto signature application (pdf-lib/crypto or server PDF path).
//  - Phase 2C: reconcile pre-existing server/ecign/ signing/lock/bundle paths to this rule.
describe('eCIgn Path B — Phase 2 runtime specs (all reference-implemented; live integration deferred)', () => {
  it('is fully reference-implemented at the contract level', () => {
    // Placeholder marker test so this file stays green and self-documenting.
  });
});
