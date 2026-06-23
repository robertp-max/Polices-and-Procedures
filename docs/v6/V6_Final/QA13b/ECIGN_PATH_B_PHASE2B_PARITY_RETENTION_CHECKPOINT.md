# eCIgn Path B — Phase 2B Checkpoint: Replicas, Parity, Lock + Retention/Lifecycle

Date: 2026-06-22. Branch: `phase19/ecign-path-b-phase2b-parity-retention` (on top of `phase18` 2A → Phase 1).
Approved decisions baked in: **Drive timing = (A) eager per-version**; retention rule (complete=indefinite,
incomplete=90d inactivity expiry→archive, inactivity-reset, archive inert/audit-only, audit retained).

## Retention & lifecycle (contract) — `retentionLifecycle.ts`
- `classifyRetention(state)` — only `locked` → `complete_retained`; all else → `incomplete_expiring`.
- `isValidEvidence(state)` — **true only for `locked`** ("incomplete = as good as not signed").
- 90-day **inactivity** clock (default `DEFAULT_INCOMPLETE_EXPIRY_DAYS=90`, **policy-configurable**):
  `expiryFromActivity`, `isIncompleteExpired` (now injected → pure), `recordActivity` (a new signature **resets** the clock).
- `validateRetentionEligibility` — `locked` ⇒ indefinite, no expiry; non-`locked` ⇒ must carry a clock-consistent expiry and must NOT be flagged indefinite.
- `validateNotFalseEvidence` — an `expired`/`archived` incomplete chain may never be paired with valid-evidence (`locked`) state.
- Archive is **inert/audit-only** (`archiveIsInertAuditOnly`); no auto-disposition. (Append-only audit of partial signatures is retained — modeled by the Phase-1 `AuditEnvelope`, untouched here.)

## Replicas & parity (Phase 2B) — `replicas/`
- `replicaPublisher.ts` — `ReplicaPublisher` interface (publish/readBack/exists) + `ReplicaPublishError`. Replicas are **index-only**; no Google wiring (reference adapter).
- `fakeReplicaPublisher.ts` — in-memory reference adapter with injectable failure modes (`failPublish`, `permissionDenied`, `corruptOnStore`) + `recover()`; **TEST ONLY** (a live Google adapter is a separate, explicitly-authorized step).
- `parity.ts` — `publishAndVerify` (publish → **read back → recompute sha256** → `verified` iff replica sha == canonical sha; else `mismatch`/`failed`); `replicateSignedVersion` does **eager per-version** replication to Drive + Evidence.
- `lockAssembly.ts` — `assembleLockEligibility`/`canLock` reuse the Phase-1 `validateLockEligibilityMetadata` (lock requires canonical persist + Drive parity + Evidence parity + metadata + audit; `locked` terminal).

## Tests (all green)
- **62 green / 0 fail / 3 todo** across pathB (30 contracts + 11 storage/freeze + 11 retention + 10 parity/lock+lineage).
- Phase 2B coverage: Drive parity verified; Evidence parity verified; **link/id alone ≠ parity** (`parity_link_without_sha`); corruption → mismatch + recovery-required; publish failure → `failed`, then `recover()`+retry → verified (idempotent, same ref/version); permission denial surfaced; lock assembly lockable when complete / blocked when a parity isn't verified; **eager replication** of a freshly-frozen version verifies on both replicas; **A→B→C multi-signer lineage** keeps every prior signed version retrievable + hash-intact + a valid append-only chain.
- Run: `npx tsx --test src/policy/ecign/pathB/**/*.test.ts` (node:test via tsx).

## Remaining TODO (3) — need infra/work not yet authorized
- PDF signature **application** (producing signed bytes — deferred; 2A/2B store bytes handed to them).
- **restart/reconstruction** from durable (non-in-memory) records (needs the production canonical store).
- final **survey packet export**.

## Validation
- `verify:designless` PASS · `build` PASS · `tsc --noEmit` 0 · targeted lint 0 · `git diff --check` clean.
- Scans: no `fetch`/`axios`/server/Google/Evidence-runtime/UI imports; node builtins only in tests (`node:test`/`node:assert`) and `node:crypto` in `storage/hash.ts`; no PHI; no stale `.js`.

## Scope / guardrails
- Still **no real Google/Drive/Evidence calls**, no server routes, no UI, no network, no JSONL/filesystem I/O; reference adapters only.
- No new deps; no package/lockfile changes; reserved-lane only; old Mock 5 repo untouched.
- **Baseline untouched, nothing merged.** Phase 2C (reconciliation with pre-existing `server/ecign/` paths) and the **live Google adapter** remain unauthorized pending alignment.
