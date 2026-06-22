# V2 Baseline Checkpoint — 2026-06-22

Checkpoint-only record of the `v2/designless-baseline` state after the Phase-15 Policy/Forms
Stage-B real-data reconnection merge. No code was edited, staged, committed, pushed, or tagged
to produce this document.

## Baseline state (verified)

| Field | Value |
|---|---|
| Repo | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` |
| Branch | `v2/designless-baseline` |
| HEAD commit | `18ec67b` — *feat(v6): reconnect policy detail to real policy content* |
| HEAD ≥ expected `18ec67b` | YES (exact match) |
| Local vs `origin/v2/designless-baseline` | in sync (0 ahead / 0 behind) |
| Backup tag at HEAD | `backup/phase15-policy-forms-reconnect-20260622-133129` ✅ (points at HEAD) |
| Tracked working tree | CLEAN (no modified/staged tracked files) |

## Completed V6 milestones (on baseline)

- V6 final integration merged (light design system; tokens/shell/components/primitives).
- CES / QAPI canonical swimlane routing preserved.
- Workflow Library / workflow swimlane parity merged.
- Admin / Journey / Onboarding V2 rhythm cleanup merged.
- `npm run verify:designless` gate active (build + `scripts/check-designless.mjs`): blocks legacy
  components/colors/CDNs/banned fonts (Inter/Montserrat)/weights (600–900); reused public route
  paths (`/library`, `/forms`, `/print`, `/appendix`) intentionally allowed with V6-native components.

## Completed Stage-B milestones (real-data reconnection on baseline)

| Screen | Real source | Result |
|---|---|---|
| Forms Library | `@/policy/data/formsLibraryDataset` (`FORMS_DATASET`) | 410 real forms |
| Policy Library | `@/policy/data/policyCorpus` (`POLICY_CORPUS`) | 279 real policies |
| Policy Lifecycle + detail | `POLICY_CORPUS` + `LIFECYCLE_DOMAIN_ORDER` / `DOMAIN_LABEL` | real policy corpus, domain-grouped |
| Form Viewer | `FORMS_DATASET` (`Map` lookup by `formId`) | real form data, graceful not-found |
| Policy Detail | `getPolicyContent(id)` + `getCorpusPolicy(id)` (dep-free markdown renderer) | real content/sections; fabricated lifecycle/evidence/readiness panels replaced with source-unavailable |

All Stage-B reconnections used **keep + derive conservatively** — no fabricated status, signer,
version, ACHC, or lifecycle fields; missing sources are shown as *source-unavailable*, never invented.

## Known deferred item

- **eCIgn Workspace** (`src/v6/screens/pageviews/EcignWorkspaceScreen.tsx`) is still **mock/static**;
  not yet Stage-B reconnected. See `ECIGN_STAGE_B_READINESS_PLAN.md` (this folder) for the read-only
  readiness analysis and phased plan. **Status: NEEDS CONFIRMATION** before implementation.

## Known untracked files to preserve / ignore (do NOT commit)

These exist in the working tree as untracked artifacts and are intentionally **not** part of the
baseline. None were created/committed by this checkpoint.

- `.vscode/settings.json` — local editor config.
- `lint-output.txt`, `npm-dev.log`, `preview-smoke.log` — local run logs.
- `tmp-ui-verify-screenshots/` — local UI verification screenshots.
- `docs/v6/V6_Final/QA13/V1_TO_V2_FUNCTIONAL_MIGRATION_QA.md` — untracked QA doc (other lane).
- `docs/v6/V6_Final/QA13b/` — untracked QA findings docs from another lane
  (e.g. `ECIGN-SIGNATURE-FINDINGS.md`, `EVIDENCE-DRIVE-FINDINGS.md`, `SAFETY-REPO-*`,
  `JOURNEY-*`, `WORKFLOW-SWIMLANE-FINDINGS.md`, `VALIDATION-FINDINGS.md`, etc.).
  **This checkpoint adds two new files alongside them** (`V2_BASELINE_CHECKPOINT_20260622.md`
  and `ECIGN_STAGE_B_READINESS_PLAN.md`); no existing file was overwritten.

## Current branch hygiene

- On `v2/designless-baseline`, tracked tree clean, in sync with origin.
- Safe for future branch creation: **YES** — branch off `18ec67b` (or the backup tag) for the next
  phase. Untracked artifacts above do not block branching and should not be added.

## Next recommended phase

Proceed to **eCIgn Stage-B readiness confirmation** (not implementation). The real per-instance
eCIgn data is server-side (`server/ecign/data/*.jsonl` via `server/ecign/store.ts` + `api.ts`),
not a client-importable static dataset like Forms/Policy — so the next step is a **scope decision**
(static-honest de-fabrication vs live read-only API adapter), documented in the readiness plan.
