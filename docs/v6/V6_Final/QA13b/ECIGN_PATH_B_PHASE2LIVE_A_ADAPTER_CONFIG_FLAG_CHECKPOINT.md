# eCIgn Path B — Phase 2-live A Checkpoint: Adapter Config + Feature Flag

Date: 2026-06-22. Branch: `phase22/ecign-path-b-2live-a-adapter-config-flag` (from baseline `94a6dbb`),
worked in the isolated eCIgn worktree. **Gate A approved.** This subphase has **zero external effects**
(no Google, no network, no writes); the fake adapter remains the default.

## What this subphase delivers (`src/policy/ecign/pathB/live/`)
- **`sandboxConfig.ts`** — `ReplicaMode` (`fake` | `live-sandbox`), `SandboxConfig`, env var NAMES only
  (`ECIGN_LIVE_SANDBOX`, `ECIGN_SANDBOX_DRIVE_FOLDER_ID`, `GOOGLE_APPLICATION_CREDENTIALS`),
  `SANDBOX_LABEL='TRAINING'`. `resolveSandboxConfig(env)` is **pure** (env injected, not `process.env`),
  **defaults to disabled → fake**, and retains **no secret values** (credential = presence boolean only).
  `redactConfig` emits booleans/mode only.
- **`liveReadiness.ts`** — `assessLiveReadiness(cfg)` (Gate B): ready only when enabled + sandbox folder +
  credentials configured; else issues (`sandbox_disabled` / `missing_sandbox_folder` / `missing_credentials`).
- **`replicaSelector.ts`** — `selectReplicaPublisher(kind, cfg)`: `fake` → functional fake adapter (default);
  `live-sandbox` → requires Gate-B readiness (`LiveSandboxNotReadyError`); even when ready, throws
  **`LiveAdapterNotImplementedError`** — the live adapter is deliberately **not wired** in subphase A.

## Tests (all green)
- **9 green / 0 fail / 0 todo** (`live/adapterConfigFlag.test.ts`): default-off config, secret never retained
  (asserts the credential value never appears in config/redaction), readiness gate combinations, fake default
  is functional, live-not-ready throws with issues, live-ready throws not-implemented (drive + evidence).
- Whole Path B suite remains green (run via `tsx --test`).

## What is intentionally NOT done (gated)
- No live Google Drive adapter; no Evidence Center writes; no network/fetch; no `googleapis`/`pdf-lib` or any
  new dependency; no `process.env` reads in source; no `server/ecign/**` edits; no real signing.
- Live mode cannot perform any external action — it stops at `LiveAdapterNotImplementedError`.

## Gates / scope
- No live Drive writes · no Evidence writes · no server/API/store wiring · no package/dependency changes ·
  no JSONL committed · old Mock 5 repo untouched · worked in the isolated eCIgn worktree (not the shared
  main tree, which carries an unrelated Rest-of-App `LoginScreen.tsx` edit left untouched).
- Baseline **not** merged.

## Next subphase (per the sandbox plan)
- **2-live B:** Drive sandbox upload behind the fake/live switch — requires **Gate B** (sandbox Drive folder
  id + credential path confirmed) and an explicit go-ahead. The live `ReplicaPublisher` implementation slots
  in exactly where `LiveAdapterNotImplementedError` is thrown today.
