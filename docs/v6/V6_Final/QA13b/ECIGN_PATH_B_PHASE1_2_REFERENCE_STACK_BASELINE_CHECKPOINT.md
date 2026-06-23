# eCIgn Path B — Phase 1–2 Reference Stack: Baseline Checkpoint

Documentation/checkpoint only. Date: 2026-06-22. The full eCIgn Path B Phase 1–2 **contract +
reference** stack is now integrated on the V2 baseline. **No runtime/live work was started.**

## 1. Baseline branch and HEAD
- Branch: `v2/designless-baseline`
- HEAD: `a4eb78b` — *feat(ecign): Path B Phase 2 runtime reference (signature apply, reconstruction, survey export)*
- In sync with `origin/v2/designless-baseline`.

## 2. Backup tag
- `backup/phase20-ecign-path-b-reference-stack-20260622-195402` (at HEAD, pushed).

## 3. Integrated commits (cherry-picked onto baseline, in order)
- `015164e` define Path B artifact contracts and test gates
- `d0dfb5d` clarify Path B Phase 1 checkpoint (plan cross-refs, parity, grouping)
- `eba1f8e` Path B Phase 2A canonical write-once storage + byte-freeze
- `47f0e8c` Path B retention/lifecycle contract (complete=indefinite, incomplete=90d expiry+archive)
- `a19db7f` Path B Phase 2B eager replica parity + lock assembly
- `a4eb78b` Path B Phase 2 runtime reference (signature apply, reconstruction, survey export)

## 4. Files changed summary
31 files, additive: all under `src/policy/ecign/pathB/**` (contracts, validators, storage, replicas,
signing, export, fixtures, tests) plus 4 docs `docs/v6/V6_Final/QA13b/ECIGN_PATH_B_PHASE{1,2A,2B,2_COMPLETE}*CHECKPOINT*.md`.
No `src/v6/**`, no `EcignWorkspaceScreen.tsx`, no `server/**`, no stores/CES/workflow, no package/lock, no JSONL.

## 5. Contract/reference modules now on baseline
- `ids.ts`, `artifactContracts.ts`, `hierarchySnapshot.ts`, `stateMachine.ts`, `auditContracts.ts`, `validators.ts`, `index.ts` (Phase 1 contracts + 19 pure validators).
- `retentionLifecycle.ts` (complete=indefinite / incomplete=90d inactivity expiry→archive).
- `storage/canonicalArtifactStore.ts` (interface), `storage/inMemoryWriteOnceStore.ts` (reference), `storage/hash.ts` (`node:crypto` sha256), `storage/byteFreeze.ts`, `storage/journaledWriteOnceStore.ts` (reconstruction).
- `replicas/replicaPublisher.ts` (interface), `replicas/fakeReplicaPublisher.ts` (reference), `replicas/parity.ts` (eager per-version), `replicas/lockAssembly.ts`.
- `signing/signatureApplication.ts` (reference applicator), `export/surveyPacketExport.ts`.
- `__fixtures__/syntheticFixtures.ts` (synthetic non-PHI), plus test files.

## 6. Test result
**69 pass / 0 fail / 0 todo** (`npx tsx --test src/policy/ecign/pathB/**/*.test.ts`).
Gates: `verify:designless` PASS · `build` PASS · `tsc -p tsconfig.app.json --noEmit` 0 · `eslint src/policy/ecign/pathB` 0 · `git diff --check` clean.

## 7. What Phase 1 covers
Branded id types + canonical primitives; artifact-family contract; **presented-vs-signed** discriminated
union; canonical storage locator; replica parity record; signer-hierarchy snapshot; multi-signer
**state machine** + failure reason codes; **allowlist-shaped audit** envelope (no PHI); idempotency;
retention/disposition; and 19 pure invariant validators (canonical-only artifact, sequence rules,
chain linkage, tier/permission/self-approval, lock eligibility, parity, audit allowlist, etc.).

## 8. What Phase 2 reference covers
- **2A:** canonical **write-once** store interface + in-memory reference; **byte-freeze** (exact bytes
  captured, sha256 recorded, idempotent, PDF-magic guard, server-side recompute/integrity).
- **2B:** **eager per-version** replica parity to Drive + Evidence via **fake adapters** (parity by
  independent sha recompute — link/id alone is never parity); failure + idempotent recovery; lock
  assembly (canonical persist + both parities + metadata + audit; `locked` terminal).
- **Retention/lifecycle:** complete (`locked`) = retained indefinitely; incomplete = 90-day inactivity
  expiry (configurable, resets on signature) → archived (inert/audit-only); incomplete = not valid evidence.
- **Runtime reference:** signature application (new immutable version, source preserved as a byte-prefix,
  not re-rendered); restart/reconstruction from a durable journal; survey packet export of real signed
  artifacts + append-only audit (only complete/locked packets export).

## 9. What is still NOT implemented (deferred — "Phase 2-live")
- **Live Google Drive adapter** (real uploads).
- **Real Evidence Center writes** (real records).
- **Production WORM / object-lock canonical store** behind `CanonicalArtifactStore`.
- **Real PDF/crypto signature application** (pdf-lib/crypto or server PDF path).
- **`server/ecign/` signing/lock/bundle reconciliation** (Phase 2C).

## 10. Non-negotiable signed-PDF artifact rule
- The **actual PDF bytes** presented/signed are canonical (the source of truth), immutable, write-once.
- **Metadata is only an index/audit layer** — never the evidence of record.
- **Google Drive / Evidence Center are replicas/references** only; parity proven by recomputed sha.
- **No post-signature regeneration / re-render / replacement** of canonical bytes.
- **Multi-signer = append-only lineage** (A→B→C); every prior signed version retained and retrievable.

## 11. Known guardrails (held)
- No `server/ecign/data/*.jsonl` runtime drift committed.
- No package/dependency/lockfile change.
- No server/API/store/runtime wiring; reference adapters only.
- No Phase 2-live authorization; old Mock 5 repo untouched; reserved-lane only.

## 12. Recommended next phase
- Author a **Phase 2-live SANDBOX plan only** (live Google adapter + production canonical store +
  real signing + Phase 2C reconciliation) — **no live writes** until a sandbox is in place and there is
  **explicit approval**. Given the shared working tree caused branch churn during this stack, consider a
  dedicated git worktree for the eCIgn lane.
