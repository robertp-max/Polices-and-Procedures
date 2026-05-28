# Master Prompt - One-Run Production Remediation (UAT + V3 + eCIgn)
Date Created: 2026-05-27

Copy/paste everything inside the code block into the coding agent. This is written for a full-repo workspace run (shell + file write access).

```text
You are a senior engineer working in:
  C:\AI\Git\training\HomeHealth\Policies_and_Procedures

Session/bootstrap reality (treat these as environmental, not repo bugs):
- This workspace is Windows + PowerShell.
- Sometimes the tool runner may report "windows sandbox: spawn setup refresh". If that happens, treat it as a transient shell bootstrap problem:
  - Re-run the command once.
  - If it persists, restart the shell session (do not change repo code to "fix" it).
- ripgrep may or may not be callable as `rg` depending on PATH. Always confirm:
  - where.exe rg
  - rg --version
  If `rg` is not recognized but `where.exe rg` returns a path, invoke `& <that_path> ...`.
  If no `rg` exists, use PowerShell equivalents:
  - file listing: Get-ChildItem -Recurse -File
  - search text: Get-ChildItem -Recurse -File | Select-String -Pattern "..." -CaseSensitive:$false

Objective:
In ONE continuous run, make the repo "production ready" for the CES/Q1/eCIgn release path:
- All required verifiers pass.
- Build passes.
- Lint passes for production-relevant code (and npm run lint must be green).
- Signed artifact chain is durable, hash-verifiable, and consistent across hard refresh + viewer + print/download.
- V3 CES board is fully on the canonical task/drawer path.

Hard constraints:
- Do not revert or delete unrelated dirty work; do not reset the repo.
- Keep changes scoped to release path + lint gating; no cosmetic refactors.
- Always read before editing.
- Always finish by writing a QA log file with exact command output (verbatim).

Deliverables (must exist by the end):
1) A QA run log file:
   Builder/_system/UAT_AGENT_FINDINGS/MASTER_RUN_<YYYY-MM-DD_HHMM_LOCAL>.md
   Include: git status, commands, outputs, and pass/fail summary.
2) An appended addendum in:
   docs/UIUX/UAT_REMEDIATION_DEFECT_REGISTER_2026-05-27.md
   Include: what changed + which acceptance gates are now closed.

Phase 0 - Environment + Baseline (log everything)
0.1 Run and record (verbatim stdout/stderr) in the MASTER_RUN log:
  - Get-Location
  - git status --short
  - where.exe rg
  - rg --version (or the fallback described above)
  - node -v, npm -v

0.2 Dependency sanity (only if needed):
- If build/lint fails due to missing deps (module not found, etc.), run npm ci (or npm install if the repo does not use a lockfile). Record which you ran.

0.3 Run and record baseline gates (even if they fail right now):
  - npm run verify:v3-pre-rollout
  - npm run verify:required-forms
  - npm run verify:q1-ces-readiness
  - npm run check:ecign-demo-local
  - npm run check:ecign-routes
  - npm run validate:event-dataflow
  - npm run build
  - npm run lint

If any of the above already fail, keep going. The goal is all of them green by the end of the run.

Phase 1 - Close Remaining Release Gaps
This repo already contains substantial remediation work (aliases, DON assistant signing blocks, V3 beachhead wiring, accessibility hardening, verifiers).
Your job now is to close the remaining acceptance gates end-to-end.

1.1 V3 CES Board Canonical Drawer (no bespoke CES drawer)
Required behavior:
- SprintExecutionBoard MUST open tasks via the canonical selectedTaskStore/openTask path and MUST NOT render/import the bespoke CES WorkflowDrawer in any runtime path.
- GlobalTaskDrawer must be mounted in the root shell and render V3TaskDetailPanel via V3StackedDrawerHost.
- verify:v3-pre-rollout must PASS with no weakening of checks.

Implementation guidance:
- Remove imports/usages of src/policy/ces/components/details/WorkflowDrawer.tsx from any path reachable from CES board runtime.
- Replace drawer open/close with selectedTaskStore state and the shared GlobalTaskDrawer surface.
- Ensure keyboard focus return/trap remains correct when switching to the canonical drawer.

1.2 Signed Artifact Durability After Hard Refresh (browser-verifiable)
Problem statement:
The code path must ensure that a locked signed_package is only created when lock gates pass, and that the stored snapshot bytes used for the package are the same bytes used by:
- Artifact Viewer
- Evidence Center surfaces
- Print
- Download
And it must remain valid after a hard refresh.

Required behavior:
- If lock gate FAILS: no locked signed_package artifact remains active and the UI does not imply a locked state.
- If lock gate PASSES: create exactly one canonical signed_package artifact and register it AFTER snapshot isolation and artifact write succeed.
- After hard refresh: the artifact must still load from the stored evidence bytes (IDB/local fallback) with no silent blank states.

Implementation guidance (do not hand-wave):
- Ensure ordering is: gate checks -> snapshot isolate -> evidence write -> artifact registration -> lock state/audits -> approvals/task completion.
- Add a deterministic "supersede" behavior if the UI ever created an artifact and later discovers a gate fail (should not happen, but must be safe).

1.3 Stored Snapshot Hash (exact stored bytes)
Problem statement:
We need an explicit SHA-256 over the EXACT stored snapshot bytes that the artifact viewer/print/download uses.

Required behavior:
- Compute SHA-256 over the exact decoded bytes of the final stored snapshot (after encode/decode normalization).
- Persist that hash on the EvidenceDoc metadata (e.g. snapshotSha256).
- Display it in Artifact Viewer metadata and in the packet Integrity Manifest section.
- Artifact Viewer must recompute SHA-256 from the resolved stored artifact bytes and show MATCH/MISMATCH.
- Print and Download flows must source from the stored snapshot bytes, not live DOM regeneration.

Implementation hints:
- There is sha256Hex() in src/policy/ecign/api.ts.
- Use resolveEvidenceDataUrl() to retrieve the stored snapshot and decode it deterministically.
- Do NOT reuse the existing EvidenceDoc checksum (it is metadata/time based).

1.4 Artifact Viewer + Evidence Center Missing/Blocked States + Print/Download Parity
Required behavior:
- After hard refresh, signed_package artifacts must be retrievable via IDB/localStorage warm path.
- Missing-artifact states must be explicit, actionable, and not blank.
- Download/Print parity: both must use the same stored snapshot bytes.

Phase 2 - Make npm run lint Green (production-ready gate)
Requirement:
- npm run lint MUST PASS at the end of this run.

Allowed strategies (choose the minimum-risk approach):
1) Fix lint in release-path files you touched (preferred), including:
   - Component naming (uppercase) so hooks lint is correct.
   - react-refresh/only-export-components: avoid exporting non-component types from TSX modules.
   - react-hooks/set-state-in-effect: either refactor to a pattern the rule accepts, or narrowly disable with an explanation on the exact line(s) where it is required for blob URL lifecycle management.
2) Add safe global ignores in eslint.config.js for non-production directories:
   - Bin-(thrash)/**
   - _Heavy/**
   - Seeding-Live-Staging-Alignment-2026-05/**
   - src/ui-staging/_archive/**
   - Builder/** (only if Builder is confirmed non-runtime)
   Only ignore what is clearly not part of the shipped runtime bundle.

Do NOT "solve" lint by turning off major safety rules globally unless there is no other viable route.

Phase 3 - Final Verification + Write Evidence
- Re-run and record (verbatim output) in the MASTER_RUN log:
  - npm run verify:v3-pre-rollout
  - npm run verify:required-forms
  - npm run verify:q1-ces-readiness
  - npm run check:ecign-demo-local
  - npm run check:ecign-routes
  - npm run validate:event-dataflow
  - npm run build
  - npm run lint

- Append a short "Post-fix status" section to:
  docs/UIUX/UAT_REMEDIATION_DEFECT_REGISTER_2026-05-27.md
  Include: which UAT IDs are now closed, which remain, and which commands prove closure.

Acceptance criteria (non-negotiable):
- npm run build PASS.
- npm run lint PASS.
- verify:v3-pre-rollout PASS.
- The signed_package created after lock gate PASS is durable after hard refresh and has an exact stored-byte SHA-256 that MATCHES when recomputed in Artifact Viewer.
- If lock gate FAILS, there is no active locked signed_package artifact.
```
