# V3 Production Parity Gaps

Phase 1 audit plus Phase 2 route stabilization tracking.

## Executive Finding

V3 is not production-shaped complete. Phase 2 fixed the broken `/ui-staging` entry and made route/navigation behavior honest, but V3 still does not preserve full content renderer parity, workflow interiors, deterministic action state, or evidence/form/signature/approval behavior.

No audited V3 surface is level 5.

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
- No CES task/workflow interiors, evidence workflows, signature/approval workflows, or deterministic workflow action state were implemented.

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
| CES board | 1 | Registry/list seeded | Local task selection only | `src/ui-staging/V3_2StagingApp.tsx` |
| CES seed adapter | 3 | Renderer seeded adapter only | Not mounted into V3.2 workflows; bypasses live stores | `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`, `src/policy/compliance-execution/seededMode.tsx` |
| Calendar/event workspace | 0 in V3.2 | Placeholder/missing | V3 does not reuse `MasterCalendarPage` or `WorkflowExecutionPanel` | `src/policy/pages/MasterCalendarPage.tsx` |
| Tasks / PM | 1 | Task cards only | No canonical task detail/action behavior | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/components/pm/TaskDetailRightPanel.tsx` |
| Evidence | 1 | Display-only hierarchy | No artifact viewer/upload/download/audit path | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/EvidenceCenterPage.tsx` |
| Training/Journey | 2 | Content seeded from `ALL_MODULES` with live route handoffs | Gates/evidence/signatures/escalations remain Phase 4 | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/journey/data/modules.ts`, `src/policy/journey/pages/JourneyHomePage.tsx` |
| Onboarding V2 | 1 | Represented as live route handoff | Activation/batch/audit/governance workflows are not embedded in V3 | `src/policy/onboarding-v2/pages/*` |
| Reports | 0 | Not represented in V3.2 | `/ces/reports` live route has no V3 path | `src/App.tsx` |
| Admin/security | 0 | Placeholder only | Identity routes not reused | `src/policy/security/identity/*` |
| Synthetic labeling | 1 | Labeled synthetic fallbacks | Labels added, but fallback data remains preview-only | V3 staging/seed files |

## Top 10 Production Blockers

1. CES tasks do not open canonical task details.
2. CES event/workflow interiors are not mounted in V3.2.
3. Evidence rows do not open artifacts and do not support upload/download/validate/promote workflows.
4. Signatures and approvals are static metadata in seeds/previews, not interactive state.
5. Completion/status indicators are not proven deterministic in V3.
6. Policy lifecycle workflow actions remain Phase 4 even though policy content renderer parity is now level 3.
7. Form signature/approval workflow state remains Phase 4 even though form content renderer parity is now level 3.
8. Training gates, evidence, signatures, escalations, and deterministic progress remain Phase 4 even though module content is now level 2.
9. Resolved in Phase 3: policy/form/training content parity blockers.
10. Resolved in Phase 2: `src/ui-staging/V3StagingApp.tsx` missing export, `/ui-staging` route/build failure, silent dead navigation where touched, and unlabeled synthetic fallbacks where touched.

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

- V3.2 CES board uses hardcoded columns and local task selection.
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
