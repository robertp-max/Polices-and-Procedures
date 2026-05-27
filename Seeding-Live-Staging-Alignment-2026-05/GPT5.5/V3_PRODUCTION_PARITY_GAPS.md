# V3 Production Parity Gaps

Phase 1 audit plus Phase 2 route stabilization tracking.

## Executive Finding

V3 is not production-shaped complete. Phase 2 fixed the broken `/ui-staging` entry and made route/navigation behavior honest, but V3 still does not preserve full content renderer parity, workflow interiors, deterministic action state, or evidence/form/signature/approval behavior.

No audited V3 surface is level 5.

Phase 4C-A adds CES durable app-store adapter wiring over the existing local persisted store. This is level 4 durable adapter wired only. Backend persistence, AWS persistence, real evidence upload/validation/promote, legal signature collection, approval decision mutation, certification, and production audit remain Phase 4C-B blockers.

Phase 5A-A adds Evidence Center read/view/detail parity over local app-store evidence metadata and CES seed evidence metadata. Phase 5A-B adds explicit artifact viewer/local download wiring only where existing local/demo artifact references or bytes already exist. Phase 5A-C adds deterministic non-PHI browser-local QA fixtures to prove the positive `real-local-artifact` and `real-route-only` branches while metadata-only and seeded-preview branches remain blocked. This remains level 3 Evidence Center parity only. Backend artifact upload/download, evidence validation/promote, backend evidence persistence, production audit immutability, legal signature, and evidence certification remain blocked.

## Phase 2 Stabilization Result

- `/ui-staging` no longer fails typecheck/build; it safely renders the current V3.2 staging shell through `src/ui-staging/V3StagingApp.tsx`.
- `/ui-staging` is the canonical staging entry. `/ui-staging/v32` remains the versioned V3.2 route. `/ui-staging/ces-seed` remains seed-preview only.
- Dead navigation is now either `LIVE_ROUTE_HANDOFF`, `V3_SYNTHETIC_FALLBACK`, `BLOCKED_PENDING_PHASE_3`, or `BLOCKED_PENDING_PHASE_4`.
- Synthetic seed/preview data is labeled in UI and source comments as `V3_SYNTHETIC_FALLBACK`.
- Required validation passes after Phase 2: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build`.
- No policy/form renderer parity, CES workflow interiors, evidence upload/download, signature, or approval workflows were implemented.

## Phase 3 Content Renderer Parity Result

- Policy V3 surface now renders full policy detail through canonical content/render paths: `frameworkPolicies`, `getPolicyContent`, `getPolicyBody`, and `PolicyLibraryDocumentView`.
- Forms V3 surface now exists and renders full form detail through canonical content/render paths: `FORMS_DATASET`, `buildFormContent`, and `FormBody`, with print handoff through `printForm` / `FormPrintView`.
- Training/Journey V3 surface now reads `ALL_MODULES` and provides live route handoffs to module player, Journey Home, Supervisor, Admin, Guide, and Onboarding V2.
- Required validation passes after Phase 3: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build`. A final `npx tsc -b --pretty false` also passed after the post-build search-label wording tweak.
- No CES task/workflow interiors, evidence workflows, signature/approval workflows, or deterministic workflow action state were implemented in Phase 3. Phase 4A later adds in-shell local-preview CES event/task interiors only.

## Phase 4A CES Event/Task Interior Result

- V3.2 CES task cards now use `V3_ExecutionUnitsSeed` instead of hardcoded local task rows.
- Clicking a CES task card opens an in-shell Event Workspace and Task Detail panel.
- Task detail includes context, owner/status, due/escalation timing, workflow, related policy/form IDs, evidence requirements, signature/approval requirements, blocker/readiness state, completion rule, next best action, and seeded audit preview where available.
- Safe local preview actions are limited to selected task, viewed/started, local note, local blocker, and clear local blocker.
- Evidence/artifact, signature/approval, durable completion, certification, and audit-history mutation remain blocked and labeled for Phase 4B/4C.
- Live route access remains secondary explicit `Open live route` only.
- No V3 surface is level 5 production-shaped complete.

## Phase 4B CES Evidence / Signature / Approval Result

- CES Task Detail now includes a Phase 4B Evidence / Artifact panel showing required form totals, complete counts, missing form IDs, audit-index state, related policy/form IDs, seeded evidence status, local preview evidence status, and readiness/blocker messages.
- CES Task Detail now includes a Phase 4B Signature / Approval panel showing required signers, signer names/roles/statuses, signatures complete vs required, approval owner/role, seeded workflow state, local preview state, and readiness/blocker messages.
- Local evidence actions update React state only: view evidence requirement, attach local preview evidence, mark preview evidence ready, add evidence blocker, and clear evidence blocker.
- Local signature/approval actions update React state only: prepare signature request, acknowledge preview signature, prepare approval request, acknowledge preview approval, add signature/approval blocker, and clear signature/approval blocker.
- Readiness now includes seeded blockers, local task blockers, evidence blockers, signature/approval blockers, missing forms, local preview evidence ready, missing signatures, local signature acknowledgement, approval acknowledgement, and the exact Phase 4C durable completion blocker.
- Local preview history is labeled as not a durable audit record.
- `Complete task` remains disabled with `BLOCKED_PENDING_PHASE_4C — Durable planner/task execution not wired in this phase.`
- Required validation passes locally after Phase 4B. Vercel commit statuses for 3376eeb were green. GitHub Actions CI and Deploy Frontend → S3 + CloudFront runs on main were failing before Phase 4B implementation.
- No V3 surface is level 5 production-shaped complete.

## Phase 4C-A CES Durable Execution Adapter Result

- V3 CES Task Detail now uses a staging-scoped durable app-store adapter backed by `useRegulatoryExecutionStore`, which persists through localStorage key `reg-execution-v2`.
- Persistence mode is labeled `local-store`; UI copy states `durable app-store adapter`, `local persisted store`, `backend persistence not implemented`, `AWS/backend persistence remains Phase 4C-B`, and `not level 5`.
- Safe task execution writes are wired for viewed audit row, started task state, note, blocker, and clear blocker.
- Evidence metadata placeholder and approval request can be written to the local persisted app store; backend evidence upload/validation/promote and legal signature/approval decision persistence remain blocked.
- Completion gate checks required forms/evidence, signatures, approval, blockers, and app-store audit/history references before enabling durable app-state completion. It does not claim production completion.
- Audit/history behavior is app-store history only. No immutable audit, WORM storage, hash-chain certification, or production certification is claimed.
- Required validation passes locally after Phase 4C-A: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA.
- No V3 surface is level 5 production-shaped complete.

## Phase 5A-A Evidence Center Read / Viewer Result

- V3 Evidence Center now opens an in-shell workspace with `data-qa="v3-evidence-center"` and a source mode label for local-store, seed, mixed, or synthetic data.
- Evidence rows are built from existing `useRegulatoryExecutionStore` evidence metadata first, then CES seed evidence metadata.
- Primary evidence row clicks stay inside `/ui-staging` and update an in-shell detail panel with selected evidence ID, event/task IDs, workflow ID, related policy/form IDs, status, artifact mode, audit/index status, blocker state, and persistence mode.
- Metadata placeholders and seeded preview rows are not presented as real artifacts. Missing artifact/viewer state is explicitly blocked.
- Upload, download, validate, promote, and certify actions remain blocked with Phase 5A-B / Phase 4C-B reasons.
- Unsupported secure-audit, cryptographic-storage, verified-integrity, production-audit, and evidence-certification wording was softened.
- Required validation passes locally after Phase 5A-A: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 5A-A Playwright QA, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA.
- No V3 surface is level 5 production-shaped complete.

## Phase 5A-B Evidence Center Artifact Viewer / Local Download Result

- V3 Evidence Detail now classifies artifact actions as `real-local-artifact`, `real-route-only`, `metadata-placeholder`, `seeded-preview`, or `missing`.
- `Open Artifact Viewer` is available only for records with existing local/demo artifact references and is built with `src/policy/artifacts/artifactRoute.ts`.
- `Download Local Artifact` is available only when existing local data/blob bytes are available through the current demo-local evidence cache.
- Route-only records disclose that local bytes may not survive refresh and keep local download blocked.
- Metadata-only and seeded-preview evidence remain blocked; no fake artifact, fake PDF, or metadata-to-file conversion was added.
- Local/demo artifact access is not backend persistence, and local/demo downloads are not production S3/download APIs.
- Required validation passes locally after Phase 5A-B: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 5A-B Playwright QA, Phase 5A-A Playwright QA, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA.
- No V3 surface is level 5 production-shaped complete.

## Phase 5A-C Positive Artifact Fixture QA Result

- Phase 5A-C adds a QA-only Playwright fixture that seeds non-PHI evidence metadata through browser-local `reg-execution-v2` state and local demo bytes through the existing `ces_ev_data_<evidenceId>` cache path.
- The browser QA now proves `real-local-artifact` has an explicit artifact viewer route and `Download Local Artifact` with `data-qa-download-mode="local-bytes"`.
- The browser QA now proves `real-route-only` has an explicit artifact viewer route, no local-bytes download, and blocker wording that local bytes may not survive refresh.
- Metadata-only and seeded-preview rows remain blocked; no fake viewer route, fake local-bytes download, fake PDF, or metadata-to-file conversion was added.
- Local/demo download is not production S3/download API. Artifact route handoff remains explicit and secondary.
- Backend upload/download, validation/promote, backend persistence, immutable audit, legal signature, evidence certification, and level 5 remain blocked.
- Full Phase 5A-C validation results are recorded in `V3_PHASE_5A_C_ARTIFACT_POSITIVE_FIXTURE_QA_REPORT.md`.
- No V3 surface is level 5 production-shaped complete.

## Production Parity Gate

A V3 surface is production-shaped complete only when all of these are true:

- Primary clicks resolve meaningfully.
- Detail views render real content.
- Live renderer parity is proven or a verified V3 adapter wraps the live renderer.
- Workflow actions mutate state or show a valid disabled/blocker reason.
- Evidence/form/signature/approval interactions are represented and interactive.
- Completion/status is deterministic.
- Synthetic fallbacks are removed or explicitly labeled `V3_SYNTHETIC_FALLBACK`.
- Build passes.
- Typecheck passes.

The current V3 implementation fails the gate.

## Gap Summary by Area

| Area | Current level | Truthful status | Main blocker | Proof files |
|---|---:|---|---|---|
| Build/typecheck | 1 | Route/build stabilized | No remaining V3 route/build blocker after Phase 2 | `src/ui-staging/V3StagingApp.tsx`, validation commands |
| V3 shell routing | 1 | Registry/list seeded shell only, now honest | Content/workflow parity remains later phase work | `src/ui-staging/V3_2StagingApp.tsx` |
| Policies | 3 | Renderer seeded through canonical policy content path | Lifecycle workflow/action parity remains Phase 4 | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/data/policyContentMap.ts`, `src/policy/components/PolicyLibraryDocumentView.tsx` |
| Forms | 3 | Renderer seeded through canonical form content path | Signature/approval workflow state remains Phase 4 | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/data/formsLibraryContent.ts` |
| CES board | 4 (durable adapter wired; not level 5) | Workflow wired with Phase 4C-A durable app-store adapter and Phase 4B local-preview evidence/signature/approval panels | Backend/AWS persistence, legal signature, approval decision, certification, and production audit remain blocked | `src/ui-staging/V3_2StagingApp.tsx`, `src/ui-staging/ces/cesDurableExecutionAdapter.ts` |
| CES seed adapter | 3 | Renderer seeded adapter only | Not mounted into V3.2 workflows; bypasses live stores | `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`, `src/policy/compliance-execution/seededMode.tsx` |
| Calendar/event workspace | 0 in V3.2 | Placeholder/missing | V3 does not reuse `MasterCalendarPage` or `WorkflowExecutionPanel` | `src/policy/pages/MasterCalendarPage.tsx` |
| Tasks / PM | 4 (durable adapter wired in V3 CES only; not level 5) | CES task cards open in-shell detail with local persisted app-store task writes for safe actions | Canonical PM drawer, backend task execution, certification, and production audit remain outside V3 Phase 4C-A | `src/ui-staging/V3_2StagingApp.tsx`, `src/ui-staging/ces/cesDurableExecutionAdapter.ts`, `src/policy/components/pm/TaskDetailRightPanel.tsx` |
| Evidence | 4 inside CES task detail; 3 in Evidence Center | CES task detail can persist an app-store evidence metadata placeholder; Evidence Center has Phase 5A-C read/detail parity plus browser-proven demo-local artifact route/download branch coverage | Backend artifact upload/download, validation/promote, backend persistence, production audit immutability, legal signature, and certification remain blocked | `src/ui-staging/V3_2StagingApp.tsx`, `src/ui-staging/ces/cesDurableExecutionAdapter.ts`, `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `Seeding-Live-Staging-Alignment-2026-05/QA_RUNTIME/ces-phase5c-artifact-positive-fixture-qa.cjs` |
| Training/Journey | 2 | Content seeded from `ALL_MODULES` with live route handoffs | Gates/evidence/signatures/escalations remain Phase 4 | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/journey/data/modules.ts`, `src/policy/journey/pages/JourneyHomePage.tsx` |
| Onboarding V2 | 1 | Represented as live route handoff | Activation/batch/audit/governance workflows are not embedded in V3 | `src/policy/onboarding-v2/pages/*` |
| Reports | 0 | Not represented in V3.2 | `/ces/reports` live route has no V3 path | `src/App.tsx` |
| Admin/security | 0 | Placeholder only | Identity routes not reused | `src/policy/security/identity/*` |
| Synthetic labeling | 1 | Labeled synthetic fallbacks | Labels added, but fallback data remains preview-only | V3 staging/seed files |

## Top 10 Production Blockers

1. Backend/AWS persistence remains Phase 4C-B.
2. Backend evidence upload/download/validation/promote and production artifact availability remain Phase 4C-B / later Evidence phases; Phase 5A-C only browser-proves local/demo artifact viewer/download branches with QA-only non-PHI fixtures.
3. Legal durable signature collection remains Phase 4C-B.
4. Durable approval decision mutation remains Phase 4C-B.
5. Production audit immutability/hash-chain certification and production certification remain Phase 4C-B.
6. Policy lifecycle workflow actions remain Phase 4 even though policy content renderer parity is now level 3.
7. Form signature/approval workflow state remains Phase 4 even though form content renderer parity is now level 3.
8. Training gates, evidence, signatures, escalations, and deterministic progress remain Phase 4 even though module content is now level 2.
9. Resolved in Phase 4B for local preview only: CES evidence/signature/approval interaction visibility and local readiness behavior.
10. Resolved in Phase 3/2: policy/form/training content parity blockers and `/ui-staging` route/build failure.

## Policy Parity Gaps

Required live parity:

- List can be registry-seeded, but full detail must render through `policyContentMap`, `getPolicyContent`, `getPolicyBody`, or a verified live-equivalent renderer.
- Policy detail must include real body sections, appendices, cross references, lifecycle/status, and print/open paths.

Current V3 status:

- V3.2 policy section now renders canonical policy content through `PolicyLibraryDocumentView`, `getPolicyContent`, and `getPolicyBody`.
- `V3_POLICIES` remains metadata only and is not used as proof of policy parity.
- Live policy parity exists outside V3 through `LibraryPage`, `PolicyDetailPage`, `PolicyLibraryDocumentView`, `SharedPolicyDetailView`, and `policyContentMap`.

Required fix files:

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/policy/pages/PolicyLifecyclePage.tsx`
- `src/policy/pages/LibraryPage.tsx`
- `src/policy/pages/PolicyDetailPage.tsx`
- `src/policy/components/PolicyLibraryDocumentView.tsx`
- `src/policy/components/SharedPolicyDetailView.tsx`
- `src/policy/data/policyContentMap.ts`

## Form Parity Gaps

Required live parity:

- Registry/list seeding from `FORMS_DATASET` is not enough.
- Full content must resolve through `buildFormContent`, `FormBody`, `FormViewer`, or `FormPrintView` compatible paths.
- Form sections, fields, signatures, orientation, print/open paths, and policy/workflow links must work.

Current V3 status:

- V3.2 now has a forms workspace.
- V3.2 renders form detail through `buildFormContent` and `FormBody`.
- `V3_FORMS` is only metadata and not consumed by the V3 UI.
- Live form parity exists outside V3 through `FormsPage`, `FormViewer`, `formsLibraryContent`, and `FormPrintView`.

Required fix files:

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/policy/pages/FormsPage.tsx`
- `src/policy/components/FormViewer.tsx`
- `src/policy/pages/FormPrintView.tsx`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/utils/printForm.ts`

## CES / Calendar / Tasks Parity Gaps

Required live parity:

- `REGULATORY_EVENTS` alone is event-definition/list seeding only.
- Completion requires event detail, task detail, workflow actions, evidence/form/signature/approval state, blocker logic, and audit/history behavior.

Current V3 gap:

- V3.2 CES board now uses `V3_ExecutionUnitsSeed` columns and opens in-shell event/task interiors.
- `/ui-staging/ces-seed` displays seed cards only.
- `V3_CES_SnapshotBuilder` adapts seed data to `ComplianceExecutionSnapshot`, but it is not mounted into the V3.2 board and does not wire mutation/action behavior.
- Live calendar/task paths exist outside V3 through `MasterCalendarPage`, `MobileIncidentExecutionPage`, `WorkflowExecutionPanel`, `MyTasksPage`, PM views, and `TaskDetailRightPanel`.

Required fix files:

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/ui-staging/ces/V3CESSeedPreview.tsx`
- `src/policy/ces/data/V3_CES_SeedData.ts`
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`
- `src/policy/compliance-execution/seededMode.tsx`
- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/pages/MobileIncidentExecutionPage.tsx`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/pm/taskProjection.ts`

## Training / Journey / Onboarding Gaps

Required live parity:

- `ALL_MODULES` can seed the module catalog, but completion requires module player, supervisor/admin flows, gates, evidence, signatures, escalations, and deterministic progress rules.

Current V3 status:

- V3.2 onboarding/training now reads `ALL_MODULES` and provides live route handoffs to module player, Journey Home, Supervisor, Admin, Guide, and Onboarding V2.
- It does not wire gates, evidence, signatures, escalations, or deterministic progress state in V3; those remain Phase 4.

Required fix files:

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/policy/journey/data/modules.ts`
- `src/policy/journey/pages/JourneyHomePage.tsx`
- `src/policy/journey/pages/ModulePlayerPage.tsx`
- `src/policy/journey/pages/SupervisorPage.tsx`
- `src/policy/journey/pages/AdminPage.tsx`
- `src/policy/onboarding-v2/pages/*`
- `src/policy/onboarding/onboardingExecutionEngine.ts`

## Reports / Planner / PM / Evidence / Audit Gaps

Current V3 gap:

- Planner uses static `INITIAL_PLANNED_TASKS`; live PM task projections are not used.
- Evidence center uses hardcoded hierarchy rows; live evidence APIs/artifact routes are not used.
- Audit log seed is static; live audit history is not generated from store/API actions.
- Reports are not represented in V3.2.

Required fix files:

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/policy/components/pm/MyTasksPmPage.tsx`
- `src/policy/components/pm/SprintPlanPage.tsx`
- `src/policy/components/pm/SprintReviewPage.tsx`
- `src/policy/components/pm/ApprovalsQueuePage.tsx`
- `src/policy/components/pm/PmDashboardPage.tsx`
- `src/policy/pm/taskProjection.ts`
- `src/policy/pm/pmOverlayStore.ts`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/ArtifactViewerPage.tsx`
- `src/policy/evidence/*`

## All Synthetic Fallback Locations

| File | Synthetic material | Label status | Risk |
|---|---|---|---|
| `src/ui-staging/V3_2StagingApp.tsx` | Dashboard KPIs, planner tasks, Brad responses, CES columns, checkpoints, evidence rows, construction placeholders | Labeled in Phase 2 where retained | Users may still mistake display data for live parity if labels are removed. |
| `src/policy/ces/data/V3_AppSeedPrimitives.ts` | Staff, patients, visits, physicians, audit log, policies, forms | Labeled in Phase 2 source comments | Registry seed primitives can be mistaken for full production data. |
| `src/policy/ces/data/V3_CES_SeedData.ts` | Sprint context, ACHC alignment, personas, execution units, statuses, signers, blockers | Labeled in Phase 2 source comments | Looks production-shaped but bypasses canonical event/store graphs. |
| `src/policy/ces/data/V3_CES_SnapshotBuilder.ts` | Local `V3_REGULATORY_EVENTS`, derived metrics, synthetic workflows | Labeled in Phase 2 source comments | Adapter can mask that data is not canonical live `REGULATORY_EVENTS`. |
| `src/ui-staging/ces/V3CESSeedPreview.tsx` | Preview cards and seed generated date | Labeled in Phase 2 UI/source comments | Preview can be mistaken for workflow parity. |

## Exact Files Recommended by Phase

### Phase 2: Stabilize V3 Route and Remove Dead Navigation

- `src/ui-staging/V3StagingApp.tsx`
- `src/ui-staging/UIStagingPage.tsx`
- `src/ui-staging/UIStagingV32Page.tsx`
- `src/ui-staging/V3_2StagingApp.tsx`
- `src/App.tsx`
- `src/policy/compliance-execution/seededMode.tsx`
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`

Expected Phase 2 outcome: build/typecheck restored; V3 nav surfaces either route to live equivalents, embed verified live renderers, or show explicit disabled/blocker reasons. Do not claim level 5 unless click paths and workflow behavior are proven.

### Phase 3: Full Content Rendering Parity

- `src/policy/data/policyContentMap.ts`
- `src/policy/pages/LibraryPage.tsx`
- `src/policy/pages/PolicyDetailPage.tsx`
- `src/policy/pages/PolicyLifecyclePage.tsx`
- `src/policy/components/PolicyLibraryDocumentView.tsx`
- `src/policy/components/SharedPolicyDetailView.tsx`
- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/components/FormViewer.tsx`
- `src/policy/pages/FormPrintView.tsx`
- `src/policy/utils/printForm.ts`

Expected Phase 3 outcome: policies and forms are renderer seeded through canonical live paths. Registry/list seeding remains level 1 unless full content and detail renderers are proven.

### Phase 4: Workflow Interior and Deterministic State Parity

- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/pages/MobileIncidentExecutionPage.tsx`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/compliance-execution/complianceExecutionStore.ts`
- `src/policy/pm/taskProjection.ts`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/components/pm/MyTasksPmPage.tsx`
- `src/policy/components/pm/SprintPlanPage.tsx`
- `src/policy/components/pm/ApprovalsQueuePage.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/ArtifactViewerPage.tsx`
- `src/policy/journey/pages/JourneyHomePage.tsx`
- `src/policy/journey/pages/ModulePlayerPage.tsx`
- `src/policy/onboarding-v2/pages/*`

Expected Phase 4 outcome: event detail, task detail, workflow actions, evidence/form/signature/approval state, blockers, and audit/history are workflow wired. Only after this, plus passing build/typecheck, can any surface approach level 5.

## Do Not Call Complete Yet

Current state is not complete. The most generous classifications are:

- `renderer seeded` for V3 policy and form content surfaces.
- `renderer seeded` for the CES seeded snapshot adapter only.
- `content seeded` for V3 training/journey module catalog plus live route handoffs.
- `registry/list seeded` for V3 dashboard/planner/CES/evidence displays and seed primitives.
- `visual/mock only` for remaining non-target V3.2 nav sections.

No V3 surface is production-shaped complete.
