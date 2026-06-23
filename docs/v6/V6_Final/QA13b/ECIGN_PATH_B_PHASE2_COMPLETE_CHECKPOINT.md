# eCIgn Path B — Phase 2 COMPLETE (reference level)

Date: 2026-06-22. Branch: `phase20/ecign-path-b-phase2-runtime-reference` (on phase19 → 18 → 17).
This closes Phase 2 at the **contract + reference-implementation** level: all runtime specs are
implemented and green with **no new dependencies, no real Google calls, no production storage
vendor, no server/UI edits**. Remaining work is **live integration only** (explicitly deferred).

## Phase 2 — full picture (branch stack)
- **Phase 1** (`phase17`): contracts + pure validators (30 tests).
- **Phase 2A** (`phase18`): canonical write-once store + byte-freeze.
- **Retention + 2B** (`phase19`): retention/lifecycle (complete=indefinite, incomplete=90d inactivity
  expiry→archive); eager per-version replica parity (Drive + Evidence) + lock assembly.
- **Phase 2 runtime reference** (`phase20`, this checkpoint):
  - **Signature application** (`signing/signatureApplication.ts`) — `applySignature` reads the EXACT
    presented bytes, applies a signature (reference applicator appends a block; source preserved as a
    prefix, **not re-rendered**), and freezes a NEW immutable signed version. Real PDF/crypto signing
    deferred (no new dep).
  - **Restart/reconstruction** (`storage/journaledWriteOnceStore.ts`) — append-only journal +
    `fromJournal` rebuild; proves state can be reconstructed from durable records (still in-memory;
    production WORM backend deferred). Write-once enforced after rebuild.
  - **Survey packet export** (`export/surveyPacketExport.ts`) — assembles REAL signed artifacts
    (sha/locator pulled from the store) + the append-only audit chain; **only a complete/locked
    packet exports artifacts** (incomplete → `complete:false`, none).

## Tests
- **69 green / 0 fail / 0 todo** across all pathB suites.
- New this phase (`runtimeReference.test.ts`): signature application creates a new version with the
  presented source untouched (sha unchanged) and a byte-prefix relationship (no re-render); multi-signer
  chain keeps every prior version intact; journal reconstruction restores bytes/hashes and keeps
  write-once; survey export emits real artifact shas + audit for locked packets and refuses incomplete.
- Run: `npx tsx --test src/policy/ecign/pathB/**/*.test.ts`.

## Validation
- `verify:designless` PASS · `build` PASS · `tsc --noEmit` 0 · targeted lint 0 · `diff --check` clean.
- Scans: no `fetch`/`axios`/server/Google/Evidence-runtime/UI imports; node builtins only in tests +
  `node:crypto` (server-side hash); no PHI; no stale `.js`. No new deps; no package/lockfile changes.

## What "Phase 2 complete" does NOT include (LIVE — needs explicit go + sandbox)
1. **Live Google Drive adapter + real Evidence Center writes** (replace the fake adapter) — real
   external uploads/records.
2. **Production canonical store** (WORM/object-lock/DB) behind `CanonicalArtifactStore`.
3. **Real PDF/crypto signature application** (pdf-lib/crypto or the existing server PDF path) — needs a
   dependency and/or the reserved `server/ecign/` lane.
4. **Phase 2C** — reconcile pre-existing `server/ecign/` signing/lock/bundle paths to this artifact rule.

These were intentionally not done autonomously: they have irreversible external effects and/or touch
the reserved server lane / require new dependencies.

## State
- **Baseline `v2/designless-baseline` untouched; nothing merged.** All Phase-1→2 work lives on the
  `phase17 → phase18 → phase19 → phase20` branch stack. Old Mock 5 repo untouched; reserved-lane only.
- Integration path when authorized: rebase the stack and ff-merge to baseline (+ backup tag), or land
  per-phase. Then scope "Phase 2-live" (Google + production store + real signing) with sandbox + sign-off.
