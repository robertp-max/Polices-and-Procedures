# eCIgn Path B — Phase 2A Checkpoint: Canonical Storage & Byte-Freeze

Scope: **A. Storage & freeze only.** Date: 2026-06-22.

## Provenance / base
- Built on **Phase 1 contracts** (`phase17/ecign-path-b-phase1-contracts-tests` @ `e12e0c6`, approved).
- Phase 2A branch: **`phase18/ecign-path-b-phase2a-storage-freeze`** (based on `e12e0c6`, i.e. it **includes** the Phase 1 contracts, since Phase 1 is not yet on baseline).
- Baseline `v2/designless-baseline` is unchanged (`f059780`); nothing merged.

## What 2A delivers (the §2 "canonical bytes created FIRST, immutable" foundation)
- `CanonicalArtifactStore` interface — **write-once** (`putOnce` throws `overwrite_forbidden`; no update/overwrite operation exists), `getBytes`/`getMeta`/`exists`/`recomputeSha256`. Vendor-agnostic (no backend chosen).
- `InMemoryWriteOnceStore` — **reference/test implementation** (content-integrity + write-once semantics). Stores private byte COPIES (external mutation can't tamper). **Not production** (no durability/object-lock).
- `byteFreeze` service — captures the **exact** presented/signed PDF bytes, computes sha256 (`node:crypto`, server-side), persists write-once, and emits the Phase-1 `PresentedArtifactVersion` / `SignedArtifactVersion` records with real `canonicalStorageLocator`/`sha256`/`byteLength`. **Idempotent** on identical re-freeze; rejects changed bytes for an existing id (`changed_bytes_same_version`).
- **PDF guard** (`looksLikePdf`): checks only the `%PDF-` magic header — a **defective-but-real** PDF (bad logo/layout) is preserved exactly; non-PDF bytes are rejected (`not_pdf`).
- **Ordering invariant**: `freezeSigned` requires the referenced presentation to already be frozen (`presented_not_frozen`).
- **Integrity**: `recomputeSha256` / `verifyStoredIntegrity` recompute over stored bytes and compare to the recorded hash (tamper-evident, server-side).

## Files created (under `src/policy/ecign/pathB/storage/`)
- `canonicalArtifactStore.ts` (interface + `CanonicalStoreError`)
- `inMemoryWriteOnceStore.ts` (reference write-once impl)
- `hash.ts` (`sha256Hex`, `node:crypto`)
- `byteFreeze.ts` (freeze service, PDF guard, integrity verify, `FreezeError`)
- `storageAndFreeze.test.ts` (green)
- (edited) `../runtimeSpecs.todo.test.ts` — 3 specs moved from `it.todo` to green (now in storage tests); 7 todos remain.

## Tests
- **Green: 41** (30 Phase-1 contract + 11 Phase-2A storage/freeze), **0 fail, 7 todo.**
- 2A storage/freeze tests cross-check freeze output against Phase-1 `validatePresentedArtifactVersion`/`validateSignedArtifactVersion` (the freeze service produces contract-valid records).
- Invariants covered: write-once enforcement; empty-bytes rejection; not_found; recompute-on-read == recorded; byte-copy isolation; PDF guard (defective preserved / non-PDF rejected); idempotent re-freeze; changed-bytes rejection; sign-requires-presented ordering; integrity true/false.
- Run: `npx tsx --test src/policy/ecign/pathB/contracts.test.ts src/policy/ecign/pathB/runtimeSpecs.todo.test.ts src/policy/ecign/pathB/storage/storageAndFreeze.test.ts`.

## Validation
- `npm run verify:designless`: PASS · `npm run build`: PASS · `npx tsc -p tsconfig.app.json --noEmit`: PASS (0) · targeted lint on new files: PASS (0) · `git diff --check`: clean.
- Scans: no `fetch`/`axios`/server/Drive/Evidence/UI imports; node builtins limited to `node:crypto` (hash) + `node:test`/`node:assert` (tests); no PHI; no stale `.js`.

## Explicitly OUT of 2A (deferred)
- Production storage vendor (WORM/object-lock/DB) — interface boundary only.
- **B. Replicas & parity:** Drive publish/parity, Evidence Center write/linkage.
- Multi-signer sequencing/state-machine orchestration, runtime role/permission checks.
- **PDF generation / signature application** (2A stores bytes handed to it; it does not produce signed PDFs).
- UI (`EcignWorkspaceScreen`), server routes/handlers, API/fetch, JSONL/filesystem/network I/O.
- **C. Reconciliation** with pre-existing `server/ecign/` paths.

## Notes / decisions
- Hashing uses `node:crypto` (server-side), consistent with §2 "recompute server-side"; reference store/freeze are intended for the Node/server context and are not imported by the client app graph.
- No new dependencies; no package/lockfile changes; old Mock 5 repo untouched; reserved-lane only (no app/CES/GPT files).
- Phase 2B/2C remain **unauthorized** pending scope alignment.
