# V3 Click Path Audit

Phase 1 audit plus Phase 2 route stabilization tracking.

## Validation Status

- Phase 1 before Phase 2: `npx tsc -b --pretty false` and `npm run build` failed on missing default export from `src/ui-staging/V3StagingApp.tsx`; `npx tsc --noEmit --skipLibCheck` passed.
- Phase 2 after stabilization: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build` pass.
- Phase 3 after content parity: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build` pass. A final `npx tsc -b --pretty false` also passed after the post-build search-label wording tweak.
- Phase 4B after CES evidence/signature local-preview wiring: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally. Vercel commit statuses for 3376eeb were green. GitHub Actions CI and Deploy Frontend → S3 + CloudFront runs on main were failing before Phase 4B implementation.
- Phase 4C-A after durable app-store adapter wiring: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally.
- Phase 5A-A after Evidence Center read/detail parity: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 5A-A Playwright QA, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally.
- Policy/forms/training click paths below reflect Phase 3 content parity. CES event/task interiors now have Phase 4C-A durable app-store adapter wiring for safe task execution state using a local persisted store; Evidence Center now has Phase 5A-A in-shell read/detail parity over local app-store and seed metadata. Backend persistence, legal signature, approval decision, certification, and production audit remain Phase 4C-B blockers.

## Phase 5A-A Evidence Center Read / Viewer Click-Path Status

| Click path | Phase 5A-A disposition | Status |
|---|---|---|
| Evidence Center nav | Opens contained V3 Evidence Center workspace with `data-qa="v3-evidence-center"`. | Contained primary V3 surface |
| Evidence source summary | Shows evidence count, local-store count, seed metadata count, placeholder count, real artifact reference count, audit/history row count, and source mode. | Read/detail parity |
| Evidence row click | Primary row click stays inside `/ui-staging` and updates `v3-evidence-detail` with selected evidence ID. | In-shell detail |
| Evidence detail | Shows event/task/source IDs, workflow ID, related policies/forms, status, artifact mode, audit/index status, blocker state, and persistence mode. | Metadata detail |
| Artifact handling | Metadata placeholders and seeded preview rows are not presented as real artifacts; missing artifact/viewer state is blocked. | Honest artifact mode |
| Related policy/form/task access | Uses explicit secondary `Open live route` buttons only. | Secondary handoff |
| Upload/download/validate/promote/certify | All remain blocked with Phase 5A-B / Phase 4C-B reasons. | Blocked, no fake mutation |
| Integrity wording | States artifact integrity is not verified in V3 and this is not production evidence certification. | No level 5 claim |

Phase 5A-A does not implement backend evidence persistence, AWS persistence, artifact upload/download, evidence validation/promote, production audit immutability, evidence certification, or level 5 production-shaped completion.

## Phase 4C-A CES Durable Adapter Click-Path Status

| Click path | Phase 4C-A disposition | Status |
|---|---|---|
| Durable adapter status | Task Detail shows store name, persistence mode, adapter event/task IDs, app-store evidence/approval counts, and backend blocker language. | `durable app-store adapter` / `local persisted store` |
| Durable task actions | Persist viewed, started, note, blocker, and clear blocker write to `useRegulatoryExecutionStore` / `reg-execution-v2`. | Local persisted app store |
| Evidence adapter action | Persist evidence placeholder writes metadata through the existing app-store evidence path only. Real upload/download/validation/promote remains blocked. | Local persisted store plus Phase 4C-B backend blocker |
| Signature/approval adapter action | Request approval writes an app-store approval request. Legal signature and approval/rejection decisions remain blocked. | Local persisted request only |
| Completion gate | Reports deterministic blockers and exposes `data-qa-completion-ready`; completion remains disabled unless durable/verified adapter conditions pass. | Deterministic, not production completion |
| Audit/history status | Adapter actions append app-store audit/history rows; no immutable audit, WORM storage, hash-chain certification, or production certification is claimed. | App-store history only |
| Phase 4B panels | Evidence and signature/approval local-preview panels remain visible and unchanged for preview-only actions. | Regression intact |

Phase 4C-A does not implement backend persistence, AWS persistence, real evidence upload/download/validation/promote, legal signature capture, approval/rejection decision persistence, certification, or level 5 production-shaped completion.

## Phase 4B CES Click-Path Status

| Click path | Phase 4B disposition | Status |
|---|---|---|
| CES task card click | Still selects a seeded CES execution unit and opens in-shell Event Workspace plus Task Detail; Phase 4A data-qa selectors remain intact. | `workflow wired` local preview |
| Evidence panel | Shows required forms total/complete, missing form IDs, audit index state, related policy/form IDs, seeded status, local preview status, and readiness messages. | Local preview only |
| Evidence actions | Mark evidence viewed, attach local preview evidence, mark preview evidence ready, add evidence blocker, and clear evidence blocker update React state only. | Local preview state only |
| Signature/approval panel | Shows required signers, signer role/status, signatures complete vs required, approval owner/role, seeded state, local preview state, and readiness messages. | Local preview only |
| Signature/approval actions | Prepare signature request, acknowledge preview signature, prepare approval request, acknowledge preview approval, add signature/approval blocker, and clear blocker update React state only. | Local preview state only |
| Readiness output | Reports seeded/local blockers, missing forms, evidence readiness, signature acknowledgement, approval acknowledgement, and durable Phase 4C completion blocker. | Deterministic local preview |
| Local preview history | Records session actions in React state and labels them `Local preview session history — not durable audit record`. | Not durable audit |
| Complete task | Remains disabled with `BLOCKED_PENDING_PHASE_4C — Durable planner/task execution not wired in this phase.` | Blocked |
| Policy/form references | Use V3 renderer-adapter availability where present and keep live access secondary via explicit `Open live route`. | Contained primary / secondary handoff |

Phase 4B does not implement durable evidence upload/download/validation, signature collection, approval/rejection mutation, durable task execution, certification, backend persistence, or audit-history mutation.

## Phase 4A CES Click-Path Status

| Click path | Phase 4A disposition | Status |
|---|---|---|
| CES sidebar primary nav | Still opens the contained V3 CES staging workspace; no live route navigation. | Contained |
| CES task card click | Selects a seeded CES execution unit and opens an in-shell Event Workspace plus Task Detail panel. | `workflow wired` local preview |
| CES Event Workspace | Shows source event, workflow, due timing, related seeded tasks, related policy/form IDs, and seeded audit preview where available. | `workflow wired` local preview |
| CES Task Detail | Shows required task context, owner/status, due/escalation timing, workflow, evidence, signatures, approvals, readiness, completion rule, next best action, and audit preview. | `workflow wired` local preview |
| Safe local actions | Mark viewed, mark started, add local note, add local blocker, clear local blocker. | Local preview state only |
| Evidence/signature/approval/complete actions | Superseded by Phase 4B local-preview panels for evidence/signature/approval; durable completion remains disabled with Phase 4C blocker reason. | Local preview plus blocked durable completion |
| Policy/form links from CES | Explicit secondary `Open live route` buttons only. | `LIVE_ROUTE_HANDOFF` |
| Calendar/CES live access | Explicit secondary `Open live route` buttons only. | `LIVE_ROUTE_HANDOFF` |

Phase 4A does not implement evidence upload/download/validation, signature collection, approval/rejection, durable task execution, certification, or audit-history mutation.

## Phase 3 Click-Path Status

| Click path | Phase 3 disposition | Status |
|---|---|---|
| Policy nav item | Opens V3 policy content renderer workspace. | `V3_RENDERER_ADAPTER` |
| Policy item click | Selects policy and renders real detail through `PolicyLibraryDocumentView`. | `V3_RENDERER_ADAPTER` |
| Policy full detail/open | Routes to `/library/:policyId` and `/policies/:policyId`. | `LIVE_ROUTE_HANDOFF` |
| Policy body resolution | Uses `getPolicyContent` and `getPolicyBody` from `policyContentMap`. | `V3_RENDERER_ADAPTER` |
| Forms nav item | Opens V3 forms content renderer workspace. | `V3_RENDERER_ADAPTER` |
| Form item click | Selects form and renders real sections/fields through `buildFormContent` + `FormBody`. | `V3_RENDERER_ADAPTER` |
| Form open/full detail | Routes to `/forms/:formId`. | `LIVE_ROUTE_HANDOFF` |
| Form print | Calls `printForm(formId)`, which hands off to `/forms/:formId/print` / `FormPrintView`. | `LIVE_ROUTE_HANDOFF` |
| Onboarding nav item | Opens V3 training content catalog from `ALL_MODULES`. | Content seeded |
| Training module click | Routes to `/journey/module/:moduleId`. | `LIVE_ROUTE_HANDOFF` |
| Journey/supervisor/admin/guide handoffs | Route to `/journey`, `/journey/supervisor`, `/journey/admin`, `/journey/guide`. | `LIVE_ROUTE_HANDOFF` |
| Onboarding V2 handoff | Routes to `/onboarding-v2`. | `LIVE_ROUTE_HANDOFF` |

## Phase 2 Click-Path Status

| Previous dead/shallow path | Phase 2 disposition | Status |
|---|---|---|
| `/ui-staging` route open | Safe wrapper now renders current V3.2 staging shell. | `V3_SYNTHETIC_FALLBACK` |
| My Planner `Execute` | Disabled with `BLOCKED_PENDING_PHASE_4` reason. | Blocked, no dead click |
| My Planner filters/search | Disabled/read-only with `BLOCKED_PENDING_PHASE_4` reason. | Blocked, no dead click |
| CES task cards | No longer clickable as task detail; show `BLOCKED_PENDING_PHASE_4` explanation. | Blocked, no dead click |
| CES Calendar button | Routes to `/calendar`. | `LIVE_ROUTE_HANDOFF` |
| CES Sprint Board button | Routes to `/calendar?view=sprint`. | `LIVE_ROUTE_HANDOFF` |
| Evidence nav | Superseded in Phase 5A-A by contained V3 Evidence Center workspace. | Contained primary V3 surface |
| Evidence preview rows | Superseded in Phase 5A-A by clickable V3 evidence rows that update in-shell detail. | Read/detail parity |
| Policy Lifecycle nav | Shows explicit `BLOCKED_PENDING_PHASE_3` blocker. | Blocked pending content parity |
| Clinician/Patient submenu | Routes to `/clinicians` and `/patients`. | `LIVE_ROUTE_HANDOFF` |
| Scheduling & Visits nav | Routes to `/calendar`. | `LIVE_ROUTE_HANDOFF` |
| Taxonomy nav | Routes to `/taxonomy`. | `LIVE_ROUTE_HANDOFF` |
| Onboarding nav | Routes to `/journey`. | `LIVE_ROUTE_HANDOFF` |
| Help/Admin/Hubstaff nav | Routes to canonical live routes. | `LIVE_ROUTE_HANDOFF` |
| Notification bell | Disabled with Phase 4 blocker title. | Blocked, no dead click |
| Top search | Read-only with Phase 3 blocker title. | Blocked, no dead click |
| CES Seed Preview execution unit cards | Remain preview cards with explicit `BLOCKED_PENDING_PHASE_4` text. | `V3_SYNTHETIC_FALLBACK` |

## V3 Routes Present

| V3 route | Entry file | Status |
|---|---|---|
| `/ui-staging` | `src/ui-staging/UIStagingPage.tsx` | Resolved in Phase 2. Canonical staging entry safely renders `V3StagingApp` -> `V3_2StagingApp`; still preview-only. |
| `/ui-staging/v32` | `src/ui-staging/UIStagingV32Page.tsx`, `src/ui-staging/V3_2StagingApp.tsx` | Loads versioned V3.2 shell. Phase 3 adds policy/forms content renderer adapters and training module handoffs. |
| `/ui-staging/ces-seed` | `src/ui-staging/ces/V3CESSeedPreview.tsx` | Seed preview only. Cards do not open detail/workflow interiors. |

## Top 10 Dead-Click Paths

| Rank | Surface | Click path | Expected production behavior | Actual V3 behavior | Blocking source |
|---:|---|---|---|---|---|
| 1 | CES Sprint Board | Task card click | Open task detail with evidence/forms/signatures/approvals/audit | Resolved in Phase 2 to non-clickable blocker; workflow still Phase 4 | `src/ui-staging/V3_2StagingApp.tsx` |
| 2 | My Planner | `Execute` on task card | Open canonical task detail or valid disabled/blocker reason | Resolved in Phase 2 to disabled `BLOCKED_PENDING_PHASE_4`; workflow still Phase 4 | `src/ui-staging/V3_2StagingApp.tsx` |
| 3 | Evidence Center | Evidence row click | Open artifact/evidence viewer with audit metadata | Resolved in Phase 5A-A to in-shell metadata detail; artifact file/viewer and backend workflows remain blocked | `src/ui-staging/V3_2StagingApp.tsx` |
| 4 | CES Seed Preview | Execution unit card | Open event/task/workflow detail | Explicit seed preview with Phase 4 blocker | `src/ui-staging/ces/V3CESSeedPreview.tsx` |
| 5 | Policy Lifecycle | Nav/detail path | Open policy lifecycle or library/detail renderer | Resolved in Phase 3 with `PolicyLibraryDocumentView` and live route handoffs | `src/ui-staging/V3_2StagingApp.tsx` |
| 6 | Forms | Nav/detail path | Open form list and full form body renderer | Resolved in Phase 3 with `buildFormContent` + `FormBody` and live route handoffs | `src/ui-staging/V3_2StagingApp.tsx` |
| 7 | Training/Journey | Module click | Open actual module player or verified adapter | Resolved in Phase 3 with `ALL_MODULES` catalog and live route handoffs | `src/ui-staging/V3_2StagingApp.tsx` |
| 8 | `/ui-staging` | Open route | Render V3 staging app | Resolved in Phase 2; no longer a dead route | `src/ui-staging/V3StagingApp.tsx`, `src/ui-staging/UIStagingPage.tsx` |
| 9 | CES Sprint Board | `Calendar` button | Navigate to calendar | Resolved in Phase 2 to `/calendar` handoff | `src/ui-staging/V3_2StagingApp.tsx` |
| 10 | Clinician / Patient Profiles | Submenu item | Open live list/detail surface | Resolved in Phase 2 to live route handoff | `src/ui-staging/V3_2StagingApp.tsx` |

## Click Path Inventory

| Surface | Primary clicks | Resolution | Secondary clicks | Resolution | Completion implication |
|---|---|---|---|---|---|
| Legacy V3 Visual Lab | Route open | Resolved in Phase 2; opens V3.2 preview shell | None | None | Level 1 preview entry, not content/workflow parity. |
| V3.2 shell menu toggle | Menu button | Toggles local nav open/closed | Close button | Toggles local nav open/closed | Cosmetic shell behavior only. |
| V3.2 top search | Input | Accepts text | None | No search action | Dead search workflow. |
| Dashboard view toggle | Agency/My Planner buttons | Switches local `isPlannerView` | None | None | Local display behavior only. |
| Dashboard CTA | Go to My Planner | Switches local planner mode | KPI cards | Not clickable | Level 1 max. |
| My Planner filters | `all`, `open`, `overdue`, `this-week` | Static buttons; only `all` appears active | Search input | Accepts text but does not filter | Display-only filtering. |
| My Planner task cards | `Execute` | No handler | Card body | No handler | Hard failure for task workflow. |
| Profiles parent | Sidebar item | Expands/collapses submenu | Clinicians/Patients | Opens placeholder sections | No detail/list path. |
| Clinician Profiles | Nav submenu | Placeholder only | None | None | Level 0. |
| Patient Profiles | Nav submenu | Placeholder only | None | None | Level 0. |
| Scheduling & Visits | Nav item | Placeholder only | None | None | Level 0. |
| Brad AI | RUN | Appends canned response after timeout | Prompt chips | Fill input text | Synthetic fallback; no grounded action. |
| CES Sprint Board | Task card | Local selected title only | Calendar/Sprint Board buttons | No handler | No event/task/workflow interior. |
| CES selected task sidebar | Checkpoint rows | Non-clickable | Completion dots | Static | Pre-marked completion risk. |
| Evidence Center | Evidence row/card | Opens in-shell V3 evidence detail and keeps URL under `/ui-staging` | Open live route buttons | Secondary handoffs to live evidence/artifact/policy/form/task routes | Level 3 read/detail parity only; upload/download/validate/promote/certify remain blocked. |
| Taxonomy | Nav item | Placeholder only | None | None | Level 0. |
| Onboarding | Nav item | Placeholder only | None | None | Level 0. |
| Policy Lifecycle | Nav item | Placeholder only | None | None | Level 0. |
| Hubstaff | Nav item | Placeholder only | None | None | Level 0. |
| Help Center | Nav item | Placeholder only | None | None | Level 0. |
| Admin | Nav item | Placeholder only | Notification bell | No handler | Level 0. |
| CES Seed Preview view toggle | Internal/Surveyor | Filters seed list | State select | Filters card list | Registry/list only. |
| CES Seed Preview execution unit cards | Card body | Non-clickable | Blocker text | Static | No task/event detail. |

## Canonical Live Paths V3 Should Reuse

| Domain | Live click path | Canonical files proving live path exists | V3 gap |
|---|---|---|---|
| Policies list -> detail | `/library` -> `/library/:policyId` | `src/policy/pages/LibraryPage.tsx`, `src/policy/pages/PolicyDetailPage.tsx`, `src/policy/components/PolicyLibraryDocumentView.tsx`, `src/policy/data/policyContentMap.ts` | V3 policy section is placeholder; `V3_POLICIES` not consumed. |
| Policy detail -> full body | `PolicyLibraryDocumentView` -> `SharedPolicyDetailView` | `src/policy/components/SharedPolicyDetailView.tsx`, `src/policy/data/policyContentMap.ts` | V3 does not call `getPolicyContent`/`getPolicyBody`. |
| Forms list -> form viewer | `/forms` -> `/forms/:formId` | `src/policy/pages/FormsPage.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/data/formsLibraryContent.ts` | V3 has no form route/panel. |
| Form print | `/forms/:formId/print` | `src/policy/pages/FormPrintView.tsx`, `src/policy/components/FormViewer.tsx` | V3 has no print/open path. |
| Calendar event -> workflow | `/calendar?event=...` and mobile `/calendar/event/:eventId/*` | `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/pages/MobileIncidentExecutionPage.tsx`, `src/policy/components/regulatory/WorkflowExecutionPanel.tsx` | V3.2 CES uses local rows only. |
| My task -> detail drawer | `/my-tasks` or `/pm/my-tasks` -> `TaskDetailRightPanel` | `src/policy/ces/pages/MyTasksPage.tsx`, `src/policy/components/pm/MyTasksPmPage.tsx`, `src/policy/components/pm/TaskDetailRightPanel.tsx` | V3.2 task buttons do not open canonical drawer. |
| PM planner actions | `/pm/sprint-plan` | `src/policy/components/pm/SprintPlanPage.tsx`, `src/policy/pm/pmOverlayStore.ts` | V3.2 planner does not mutate or show valid blockers. |
| Evidence -> artifact | `/evidence` -> `/artifacts/:artifactId` | `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/artifacts/artifactRoute.ts` | V3 evidence rows are display-only. |
| Onboarding module | `/journey` -> `/journey/module/:moduleId` | `src/policy/journey/pages/JourneyHomePage.tsx`, `src/policy/journey/pages/ModulePlayerPage.tsx`, `src/policy/journey/data/modules.ts` | V3 onboarding is placeholder only. |
| Onboarding V2 activation/batches/audit | `/onboarding-v2/*` | `src/policy/onboarding-v2/pages/*` | V3 onboarding does not surface audit-grade flows. |

## Hard Failure Findings

- A row/card/list that cannot open detail is incomplete: present in V3 My Planner, V3 CES, V3 Evidence, and CES Seed Preview.
- A task that cannot open task detail is incomplete: present in V3 My Planner and V3 CES.
- A policy that cannot open full policy body is incomplete: present in V3 Policy Lifecycle.
- A form that cannot open full form body is incomplete: V3 has no form surface.
- Evidence without artifact/evidence viewer path is incomplete: present in V3 Evidence Center and V3 CES.
- Completion status without deterministic rule is incomplete: present in V3 CES checkpoints and seeded execution unit status summaries.
- Synthetic data not labeled `V3_SYNTHETIC_FALLBACK` is incomplete: present across V3 staging and seed files.

## Phase 2 Click-Path Files

- `src/ui-staging/V3StagingApp.tsx`
- `src/ui-staging/UIStagingPage.tsx`
- `src/ui-staging/V3_2StagingApp.tsx`
- `src/App.tsx`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/components/ui/RightDrawer.tsx`

## Phase 3 Click-Path Files

- `src/policy/pages/LibraryPage.tsx`
- `src/policy/pages/PolicyDetailPage.tsx`
- `src/policy/components/PolicyLibraryDocumentView.tsx`
- `src/policy/components/SharedPolicyDetailView.tsx`
- `src/policy/components/FormViewer.tsx`
- `src/policy/pages/FormPrintView.tsx`
- `src/policy/utils/printForm.ts`

## Phase 4 Click-Path Files

- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/pages/MobileIncidentExecutionPage.tsx`
- `src/policy/ces/components/board/SprintExecutionBoard.tsx`
- `src/policy/components/pm/MyTasksPmPage.tsx`
- `src/policy/components/pm/SprintPlanPage.tsx`
- `src/policy/components/pm/ApprovalsQueuePage.tsx`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/ArtifactViewerPage.tsx`
- `src/policy/journey/pages/JourneyHomePage.tsx`
- `src/policy/onboarding-v2/pages/*`
