# eCIgn Path B — Phase 2-live B Checkpoint: Drive Sandbox Upload (behind live gate)

Date: 2026-06-22. Branch: `phase23/ecign-path-b-2live-b-drive-sandbox-upload` (from baseline `31cd0ff`),
in the isolated eCIgn worktree. **Gate B approved.** Fake remains default; live upload is sandbox-only,
explicit, and gated.

## What this subphase delivers (`src/policy/ecign/pathB/live/`)
- **`driveSandboxPublisher.ts`** (googleapis-free, dependency-injected):
  - `DriveClient` transport boundary (`uploadToFolder` / `downloadBytes`).
  - `DriveSandboxPublisher implements AsyncReplicaPublisher` — uploads ONLY to the approved
    `sandboxFolderId`, names files `TRAINING-<versionId>.pdf`, idempotent per version, **no public
    permissions, no deletes**.
  - `publishAndVerifyAsync` — publish → read back → **recompute sha256** → `verified` only on match
    (mismatch/failure never claims success); a link alone is never parity.
  - `buildSandboxUploadResult` — captures Drive file id, webViewLink, sha256, byteLength, sandbox
    folder id, timestamp, artifactVersionId, TRAINING label, parity status.
- **`liveDriveClient.ts`** — the ISOLATED googleapis boundary (`createLiveDriveClient`): least-privilege
  `drive.file` scope, writes only to the supplied sandbox folder, no public perms, no deletes; credentials
  read by GoogleAuth (keyFile / `GOOGLE_APPLICATION_CREDENTIALS`) and never logged/returned/stored. Excluded
  from the app build (`src/policy` not in `tsconfig.app`) and imported only by the manual proof — not by tests/app.
- **`driveSandboxProof.ts`** — MANUAL, gated proof (not a `*.test.ts`): uploads exactly ONE synthetic TRAINING
  PDF and verifies sha256 parity. Refuses unless `ECIGN_LIVE_SANDBOX=1` + `ECIGN_RUN_LIVE_PROOF=1` +
  sandbox folder + credentials are all set. No delete, no Evidence record, no public link, no committed output.
- **`replicaSelector.ts`** — added `selectLiveDrivePublisher(cfg, { client })` (Gate-B gated, async); the sync
  `selectReplicaPublisher` is unchanged → **fake stays the default**.

## Tests (all green, fake client only — no network/upload)
- **10 new green** (`driveSandboxPublisher.test.ts`): sandbox-folder-only upload + TRAINING name, sha parity
  verified, corruption→mismatch+recovery, upload/permission failure→failed, idempotent (no duplicate upload),
  empty-folder rejected, audit-result capture (no `anyone` link), live selector gating (not-ready/fake throws;
  ready+client returns publisher, selection performs no upload).
- **Full Path B suite: 88 pass / 0 fail / 0 todo.**

## Live sandbox proof
- Configured out-of-band (sandbox Drive folder id + `GOOGLE_APPLICATION_CREDENTIALS`); values are NOT printed,
  copied, or committed. The proof is run manually: `npx tsx src/policy/ecign/pathB/live/driveSandboxProof.ts`
  with the gate env set. It uploads one synthetic TRAINING artifact and verifies sha256 parity. See the final
  report for whether it was executed this run.

## Hard rules honored
- Fake remains default · live activates only on explicit `live-sandbox` config + readiness · only the approved
  sandbox folder is written · all files TRAINING-labeled · no upload in normal tests · parity by recomputed
  sha256 (mismatch blocks success) · **no deletes** · **no public links** · **no Evidence Center writes** ·
  no server/API/store wiring · **no new dependencies** (`googleapis` already present) · no `.env`/secret/JSONL
  commits · old Mock 5 repo + GPT Rest-of-App lane untouched.

## Next subphase
- **2-live C — Evidence Center sandbox attach** (still gated): record references to the canonical artifact
  version + parity, no PHI, survey export stays blocked unless `locked`. Evidence live adapter currently still
  throws `LiveAdapterNotImplementedError`.
