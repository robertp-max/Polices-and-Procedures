# UAT Remediation Defect Register

Date: 2026-05-27

Scope: unified implementation register for the full-app UAT report and the V3 local-live QA action list. This file tracks the runtime blockers separately from the plan so fixes can be verified without editing the accepted plan.

## Release Gate

The app remains **NO-GO** until the same signed CES-required artifact can be created, refreshed, reopened, printed, downloaded, and found from task, Evidence Center, Artifact Viewer, Audit Mode, and surveyor-oriented paths.

## P0 Blocking Chain

| ID | Area | Failure | Primary Fix Target | Acceptance Gate |
|---|---|---|---|---|
| UAT-P0-001 | eCIgn | Signing flow did not finalize; signed package/certificate/artifact not created. | `FormSigningWorkspace`, eCIgn demo-local state, signed snapshot capture, evidence upload. | A signed `QA-FM-020` reaches locked state with certificate/package IDs and a reloadable artifact after hard refresh. |
| UAT-P0-002 | CES Q1 drill | 0 of 9 Q1 events completed through forms, evidence, signatures, approvals, and package lock. | Q1 form identity, eCIgn/evidence chain, approval task surfacing, certification gates. | All 9 Q1 events produce captured form instance IDs, evidence IDs, signed artifact IDs, and final event certification records. |
| UAT-P0-003 | Evidence Center | Metadata can survive while artifact bytes are unavailable after refresh. | Evidence runtime cache, IndexedDB blob store, regulatory execution persistence, Evidence Center restore path. | Evidence rows either reopen persisted bytes after refresh or show an explicit unavailable-artifact state with recovery guidance. |

## P1 Blocking Defects

| ID | Area | Failure | Primary Fix Target | Acceptance Gate |
|---|---|---|---|---|
| UAT-P1-001 | Required forms | `/forms/FRM-QAPI-019` returns Form Not Found. | CES V3 seed IDs and canonical form resolver. | `FRM-QAPI-019` resolves to the intended canonical QAPI form or is replaced by `QA-FM-020` everywhere it is required. |
| UAT-P1-002 | Required forms | `/forms/OP-FM-030` returns Form Not Found for Q1 EP plan review. | Q1 regulatory event required forms and template registry. | Every Q1 required form ID exists in `FORMS_DATASET` or resolves through an audited alias. |
| UAT-P1-003 | PM tasks | `/pm/my-tasks` calls live AWS from local UAT and emits CORS/fetch failures. | PM API client base URL, local server route parity, offline UI. | Local UAT calls `/api/pm/*` or a local fallback without AWS CORS errors. |
| UAT-P1-004 | CES calendar | `EventAnchorMarker` crashes when `DOMAIN_TONE[event.domain]` is undefined. | Calendar domain normalization and fallback tone. | Calendar renders all seeded/live event domains without reading `bg` from undefined. |
| UAT-P1-005 | Signed print/download | Signed output parity could not be verified and route drift remains possible. | Print/download actions use locked signed snapshot. | Signed print and download hash to the stored artifact bytes after hard refresh. |
| UAT-P1-006 | Artifact Viewer | Missing/signed artifacts do not have a clear, actionable preview state. | Artifact resolution order and missing-artifact UI. | `/artifacts/test-missing` clearly explains absence; signed artifacts open from every required entry point. |

## P2 Stabilization And Governance

| ID | Area | Failure | Primary Fix Target | Acceptance Gate |
|---|---|---|---|---|
| UAT-P2-001 | Command gates | Repo lint fails with 980 problems. | Release-path lint scope, generated/archive exclusions, then remaining source errors. | Release-path lint/build gates are passing or explicitly scoped with non-release waivers. |
| UAT-P2-002 | V3 UX | CES/Evidence/eCIgn remain mixed legacy/V3 with density and drawer drift. | Canonical V3 drawers, task/evidence panels, token governance. | CES board/calendar/tasks/evidence use canonical identity and V3 drawer primitives without legacy right-panel paths. |
| UAT-P2-003 | Accessibility | Missing focus traps, reduced-motion, contrast, and responsive proof. | Drawer/modal primitives, Travelight reduced-motion guard, forced-colors CSS, persona smoke tests. | Keyboard, reduced-motion, forced-colors, mobile, and role-based smoke tests pass on high-risk routes. |

## Dependency Order

1. Required form identity.
2. eCIgn signed artifact finalization.
3. Evidence blob durability.
4. Artifact Viewer retrieval and missing-artifact states.
5. Signed print/download parity.
6. Q1 completion gates and review tasks.
7. PM/CES runtime P1 fixes.
8. Canonical task identity and V3 drawer migration.
9. Accessibility, permissions, governance, lint, and full tester rerun.

## Local QA Addendum - 2026-05-27

Runner context:
- PowerShell, Git, and ripgrep were available in `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`.
- `rg` resolved to the Codex bundled binary under `codex-path`.
- Worktree was dirty before review; no unrelated files were reverted.

Commands run:
- `npm run verify:v3-pre-rollout` - PASS.
- `npm run verify:required-forms` - PASS: 254 events have required forms resolvable to Enterprise Forms Library records; 11 legacy aliases point to canonical records.
- `npm run verify:q1-ces-readiness` - PASS: 9 events, 56 required forms, 15 required approval tasks.
- `npm run check:ecign-demo-local` - OK: 9 audit markers plus fallback and artifact markers verified.
- `npm run build` - PASS.
- `npm run lint` - FAIL: 981 problems, 361 errors, 620 warnings.
- Targeted release-path eslint on `FormSigningWorkspace`, `captureSignedFormSnapshot`, `ArtifactViewerPage`, `SprintExecutionBoard`, V3 drawer files, and verifier scripts - FAIL: 60 problems, 48 errors, 12 warnings.

Findings:

1. `UAT-P0-001` remains functionally risky. In `src/policy/components/FormSigningWorkspace.tsx`, signed package creation, evidence upload, local snapshot stash, `registerArtifacts`, `SIGNED_PACKAGE_CREATED`, and `ARTIFACT_LOCKED` happen before the role mismatch and required-field lock gates run. A blocked lock can still leave an active `EVIDENCE_LOCKED` signed package.

2. `UAT-P1-005` is still not hash-verifiable. `src/policy/ecign/captureSignedFormSnapshot.ts` captures a stable HTML snapshot data URL and byte sizes, but does not compute SHA-256 over the exact stored snapshot bytes. `regulatoryExecutionStore` currently uses a metadata/time based checksum, not an artifact-byte hash. Artifact Viewer/print/download use stored data, but do not recompute/display stored-byte hash match or mismatch.

3. `UAT-P2-001` is not limited to legacy/archive lint. Touched release-path files have lint blockers. The largest is `eCIgnWorkspace` exported lowercase in `FormSigningWorkspace.tsx`, which makes React hook lint treat the component as a non-component function. `SprintExecutionBoard` and `ArtifactViewerPage` also have release-path lint errors.

4. `UAT-P2-002` V3 CES board cutover looks substantially complete. `SprintExecutionBoard` opens projected task IDs through `selectedTaskStore`, and `GlobalTaskDrawer` uses `V3StackedDrawerHost` plus `V3TaskDetailPanel`. `verify:v3-pre-rollout` passes. Remaining `WorkflowDrawer` references found by `rg` are outside the CES board path, primarily demo/regulatory legacy surfaces.

Remediation prompt:

```text
Continue in C:\AI\Git\training\HomeHealth\Policies_and_Procedures. Preserve unrelated dirty work.

Fix only the remaining release gaps:

1. eCIgn finalize ordering
- Move role mismatch and required-field completeness checks before any signed_package upload, localStorage/IDB stash, registerArtifacts call, ARTIFACT_LOCKED audit, approval request, or task completion attempt.
- If a lock gate fails, do not create or leave any active EVIDENCE_LOCKED signed_package. Emit only the FORM_LOCK_BLOCKED_* audit and keep the form SIGNED, not LOCKED.

2. Exact stored-byte hash
- Add SHA-256 over the exact stored signed snapshot bytes after final data URL encoding/decoding.
- Persist it on the EvidenceDoc metadata as snapshotSha256 or equivalent.
- Add it to the packet integrity manifest and Artifact Viewer metadata.
- Artifact Viewer must recompute hash from resolveEvidenceDataUrl(...) and show match/mismatch.
- Print/download must use the same stored snapshot source, never live DOM.

3. Snapshot cleanup
- Remove dead formSnapshotHtml capture unless implementing a real signed_form_instance artifact.
- If signed_package is the only canonical artifact, update acceptance/register language accordingly.

4. Release-path lint
- Rename eCIgnWorkspace to an uppercase React component and update imports.
- Fix lint in touched release-path files: FormSigningWorkspace, ArtifactViewerPage, SprintExecutionBoard, verifier scripts.
- Do not spend time on archive/global lint debt unless needed for release-path files.

5. Re-run and record:
- npm run verify:v3-pre-rollout
- npm run verify:required-forms
- npm run verify:q1-ces-readiness
- npm run check:ecign-demo-local
- npm run build
- targeted eslint on release-path files
- npm run lint, reported as global debt if still red

Acceptance:
- A blocked lock creates no active finalized artifact.
- A successful lock creates one durable signed_package with exact stored-byte SHA-256.
- Viewer, Evidence Center, print, and download all use that same stored snapshot after hard refresh.
- V3 CES board stays on selectedTaskStore + GlobalTaskDrawer + V3TaskDetailPanel.
```
