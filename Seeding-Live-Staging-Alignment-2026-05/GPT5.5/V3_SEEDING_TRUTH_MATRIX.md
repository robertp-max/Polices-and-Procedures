# V3 Seeding Truth Matrix

Phase 1 audit plus Phase 2 route stabilization tracking.

Audit date: 2026-05-25  
Scope: V3 staging routes and V3-named seed surfaces currently present in the repo. The app contains live canonical routes outside V3, but V3 itself is currently limited to `/ui-staging`, `/ui-staging/v32`, `/ui-staging/ces-seed`, and V3 seed modules.

## Phase 4A CES Event/Task Interiors Addendum

Phase 4A wires the V3.2 CES sprint board to seeded CES execution units and opens an in-shell Event Workspace plus Task Detail panel when a CES event/task card is clicked.

- CES board primary task clicks stay inside `/ui-staging` / `/ui-staging/v32`.
- CES task detail is `workflow wired` for local preview only: selected task, viewed/started, local note, local blocker, and clear local blocker.
- CES task detail shows task context, why it exists, source event, owner, status, due/escalation timing, workflow ID, related policy IDs, related form IDs, required evidence, required signatures/approvals, blocker/readiness state, completion rule, next best action, and audit-history preview where seeded data can be matched.
- Policy/form links from CES remain secondary explicit `Open live route` handoffs; policy/forms renderer parity in their own V3 sections remains level 3.
- Evidence/artifact workflow, signature/approval workflow, durable planner/task execution, certification, and audit-history mutation remain blocked for Phase 4B/4C.
- No V3 surface is level 5 production-shaped complete.

## Phase 4B CES Evidence / Signature / Approval Addendum

Phase 4B keeps the Phase 4A CES Event Workspace / Task Detail shell and adds local-preview-only evidence/artifact plus signature/approval interactions.

- CES Task Detail now shows a Phase 4B Evidence / Artifact panel with required form totals, completed form count, missing form IDs, audit-index state, related policy IDs, related form IDs, seeded evidence status, local preview evidence status, and readiness/blocker messages.
- CES Task Detail now shows a Phase 4B Signature / Approval panel with required signers, signer role/status, signatures complete vs required, approval owner/role, seeded workflow state, local preview state, and readiness/blocker messages.
- New evidence actions are local React preview state only: mark evidence viewed, attach local preview evidence, mark preview evidence ready, add evidence blocker, and clear evidence blocker.
- New signature/approval actions are local React preview state only: prepare signature request, acknowledge local preview signature, prepare approval request, acknowledge local preview approval, add signature/approval blocker, and clear signature/approval blocker.
- Readiness now accounts for seeded blockers, local task blockers, evidence blockers, signature/approval blockers, missing forms, local preview evidence attached/readied, missing signatures, local preview signature acknowledgement, approval readiness, local preview approval acknowledgement, and the durable Phase 4C completion blocker.
- Policy/form references from CES remain linked to V3 renderer-adapter availability where present, with live access only through secondary explicit `Open live route` handoffs.
- Local preview session history is labeled `Local preview session history — not durable audit record`; no real audit-history mutation, backend persistence, evidence upload, signature write, approval write, certification, or completion mutation was implemented.
- Durable task completion remains disabled with `BLOCKED_PENDING_PHASE_4C — Durable planner/task execution not wired in this phase.`
- No V3 surface is level 5 production-shaped complete.

## Phase 4C-A CES Durable Execution Adapter Addendum

Phase 4C-A adds the smallest defensible durable execution bridge available in the repo: a V3 CES durable app-store adapter over the existing `useRegulatoryExecutionStore` local persisted store (`reg-execution-v2`).

- CES Task Detail now shows `ces-durable-adapter-status` with `data-qa-persistence-mode="local-store"` and honest labels: `durable app-store adapter`, `local persisted store`, `backend persistence not implemented`, `AWS/backend persistence remains Phase 4C-B`, and `not level 5`.
- Safe durable task actions persist to the existing app store: viewed audit row, started task state, note, blocker, clear blocker, evidence metadata placeholder, and approval request.
- Phase 4B evidence/artifact and signature/approval local-preview panels remain intact and continue to use local React preview state for their preview-only actions.
- Backend evidence upload/download/validation/promote remains blocked with `BLOCKED_PENDING_PHASE_4C_B — Backend evidence upload/validation/promote is not wired.`
- Durable legal signature and approval decision persistence remain blocked with `BLOCKED_PENDING_PHASE_4C_B — Durable signature/approval persistence is not wired.`
- Completion gate is deterministic and remains blocked unless required forms/evidence, signatures, approval, blockers, and app-store audit/history references are satisfied in durable or verified adapter state. No production completion is claimed.
- Audit/history is app-store history only when adapter actions are written; no immutable audit, WORM storage, hash-chain certification, or production certification is claimed.
- CES event/task interiors may be counted as level 4 durable adapter wired. No V3 surface is level 5 production-shaped complete.

## Phase 5A-A Evidence Center Read / Viewer Parity Addendum

Phase 5A-A upgrades the V3 Evidence Center from display-only hardcoded copy to an in-shell read/detail workspace.

- Evidence Center now exposes `data-qa="v3-evidence-center"` and reports `data-qa-evidence-source-mode` as `local-store`, `seed`, `mixed`, or `synthetic`.
- Data source priority is existing `useRegulatoryExecutionStore` evidence metadata first, then CES seed evidence metadata. Metadata placeholders and seeded preview rows are explicitly labeled.
- Primary evidence row clicks stay inside `/ui-staging` and update an in-shell `v3-evidence-detail` panel with selected evidence ID, event/task IDs, workflow ID, related policy/form IDs, status, artifact mode, audit/index status, blocker state, and persistence mode.
- Artifact metadata is not presented as an artifact. Missing artifact/viewer state is labeled `BLOCKED_PENDING_PHASE_5A_B — Artifact file/viewer is not available for this evidence record.`
- Unsupported upload/download/validate/promote/certify actions remain blocked with Phase 5A-B / Phase 4C-B blockers.
- Unsupported secure-audit / cryptographic-storage / verified-integrity wording was softened to local app-store metadata, pending backend verification, artifact integrity not verified in V3, and not production evidence certification.
- Evidence Center may be counted as level 3 read/view/detail parity only. Backend evidence persistence, upload/download, validation/promote, production audit immutability, and certification remain blocked. No V3 surface is level 5 production-shaped complete.

## Phase 5A-B Evidence Center Artifact Viewer / Local Download Addendum

Phase 5A-B adds explicit artifact viewer/download wiring only where existing local/demo artifact references already exist.

- Evidence Detail now classifies artifact actions as `real-local-artifact`, `real-route-only`, `metadata-placeholder`, `seeded-preview`, or `missing`.
- Real local/demo evidence with data URL/blob bytes shows `Demo-local artifact available`, an explicit `Open Artifact Viewer` button built through `buildArtifactRoute`, and `Download Local Artifact` only when actual local bytes are available.
- Route-only records with `objectPath` show `Artifact route available; local bytes may not survive refresh`, allow the explicit artifact viewer route, and keep local download blocked.
- Metadata-only and seeded-preview evidence remain blocked with honest wording; metadata is not converted into a fake artifact or fake PDF.
- Local/demo artifact access is not backend persistence, and local/demo downloads are not production S3/download APIs.
- Backend upload/download, validate/promote, certification, immutable audit, legal signature, and level 5 remain future blockers.

## Validation Result

- Phase 1 before Phase 2: `npx tsc -b --pretty false` and `npm run build` failed because `src/ui-staging/UIStagingPage.tsx` imported a default export from empty `src/ui-staging/V3StagingApp.tsx`. `npx tsc --noEmit --skipLibCheck` passed.
- Phase 2 after stabilization: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build` all pass.
- Phase 3 after content parity: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, and `npm run build` pass. A final `npx tsc -b --pretty false` also passed after the post-build search-label wording tweak.
- Phase 4B after CES evidence/signature local-preview wiring: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally. Vercel commit statuses for 3376eeb were green. GitHub Actions CI and Deploy Frontend → S3 + CloudFront runs on main were failing before Phase 4B implementation.
- Phase 4C-A after durable app-store adapter wiring: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally.
- Phase 5A-A after Evidence Center read/detail parity: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 5A-A Playwright QA, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally.
- Phase 5A-B after artifact viewer/local download wiring: `npx tsc -b --pretty false`, `npx tsc --noEmit --skipLibCheck`, `npm run build`, Phase 5A-B Playwright QA, Phase 5A-A Playwright QA, Phase 4C-A Playwright QA, Phase 4B Playwright QA, and Phase 4A hardened selector QA all pass locally.
- Authoritative TypeScript command for build readiness is `npx tsc -b --pretty false` because `npm run build` invokes `tsc -b` before Vite.
- No V3 surface is production-shaped complete; Phase 4C-A upgrades CES to level 4 durable adapter wired only.

## Phase 3 Full Content Renderer Parity Addendum

| Surface | Phase 2 level | Phase 3 level | Phase 3 status | Proof |
|---|---:|---:|---|---|
| Policy Lifecycle / Policy Content Renderer | 0 | 3 | `V3_RENDERER_ADAPTER` | V3 policy surface now lists policies from `frameworkPolicies`, resolves body/content through `getPolicyContent` and `getPolicyBody`, renders detail through `PolicyLibraryDocumentView`, and hands off to `/library/:policyId` and `/policies/:policyId`. |
| Forms Library / Forms Content Renderer | 0 | 3 | `V3_RENDERER_ADAPTER` | V3 forms surface now lists `FORMS_DATASET`, resolves full form content through `buildFormContent`, renders sections/fields through `FormBody`, and supports `/forms/:formId` plus `printForm` handoffs to `FormPrintView`. |
| Training / Journey / Onboarding Content | 0 | 2 | Content seeded plus `LIVE_ROUTE_HANDOFF` | V3 onboarding surface now reads `ALL_MODULES`, exposes module catalog content, routes module clicks to `/journey/module/:moduleId`, and provides handoffs to `/journey`, `/journey/supervisor`, `/journey/admin`, `/journey/guide`, and `/onboarding-v2`. |

Phase 3 does not upgrade CES task detail, evidence/artifact workflows, signatures, approvals, deterministic workflow state, or any surface to level 4/5.

## Phase 2 Route Stabilization Addendum

| Surface | Phase 1 level | Phase 2 level | Phase 2 status | Proof |
|---|---:|---:|---|---|
| Legacy V3 Visual Lab `/ui-staging` | 0 | 1 | `V3_SYNTHETIC_FALLBACK`; route now safely renders the canonical V3.2 staging shell. | `src/ui-staging/V3StagingApp.tsx` now exports a safe wrapper around `V3_2StagingApp`. |
| V3.2 Shell / Navigation | 1 | 1 | Navigation stabilized; dead items now route to live equivalents, show explicit blockers, or stay labeled preview. | `src/ui-staging/V3_2StagingApp.tsx` nav statuses: `LIVE_ROUTE_HANDOFF`, `V3_SYNTHETIC_FALLBACK`, `BLOCKED_PENDING_PHASE_3`, `BLOCKED_PENDING_PHASE_4`. |
| My Planner | 1 | 1 | Registry/list seeded preview only; `Execute`, filters, and search are blocked with Phase 4 reasons. | `INITIAL_PLANNED_TASKS` remains preview-only and labeled `V3_SYNTHETIC_FALLBACK`. |
| CES Sprint Board Preview | 1 | 1 | Registry/list seeded preview only; task cards no longer pretend to open task detail, and live CES handoff buttons route to `/calendar` and `/calendar?view=sprint`. | Task detail remains `BLOCKED_PENDING_PHASE_4`. |
| Policy Lifecycle nav | 0 | 0 | Explicit `BLOCKED_PENDING_PHASE_3` blocker instead of construction placeholder. | No policy renderer parity implemented in Phase 2. |
| Evidence nav | 1 | 1 | Primary nav hands off to live `/evidence`; preview rows are labeled and non-actionable. | No evidence workflow implemented in Phase 2. |
| CES Seed Preview | 1 | 1 | Explicit `V3_SYNTHETIC_FALLBACK`; cards show Phase 4 blocker text. | `src/ui-staging/ces/V3CESSeedPreview.tsx`. |

Phase 2 does not upgrade content seeding, live renderer parity, workflow wiring, or production completion levels. It only resolves route/build safety and removes silent dead-click behavior.

## Completion Scale

- 0 = visual/mock only
- 1 = registry/list seeded
- 2 = full content seeded
- 3 = live renderer reused/adapted
- 4 = workflow interactions wired
- 5 = production-shaped complete

## Surface Counts

| Level | Count | Summary |
|---:|---:|---|
| 0 | 16 | Remaining V3 placeholders/unrouted seed primitives excluding policy/forms/training content targets upgraded in Phase 3. |
| 1 | 4 | V3 preview/dashboard/planner displays and stabilized staging entry remain registry/list seeded or preview-only. |
| 2 | 1 | Training/Journey content is seeded from `ALL_MODULES` with live route handoffs. |
| 3 | 4 | Policy and form V3 surfaces now reuse/adapt canonical render paths; Evidence Center now has read/view/detail parity plus explicit local/demo artifact viewer/download wiring where real references exist; CES snapshot adapter remains renderer seeded concept only. |
| 4 | 1 | CES event/task interiors have Phase 4C-A durable app-store adapter wiring over the local persisted store plus Phase 4B local workflow preview panels; durable backend persistence, legal signature, approval decision, certification, and production audit remain blocked. |
| 5 | 0 | Build/typecheck pass after Phase 2, but no V3 surface satisfies final completion validation. |

## Truth Matrix

| Surface | V3 route | Live equivalent route | Current V3 source file(s) | Current V3 data source(s) | Canonical live source file(s) | Registry/list seeded? | Full content seeded? | Live renderer reused/adapted? | Primary clicks wired? | Secondary clicks wired? | Workflow actions wired? | Synthetic fallback present? | Current completion level | Blocking gap | Required fix files | Notes / proof |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|
| Legacy V3 Visual Lab | `/ui-staging` | N/A staging shell | `src/ui-staging/UIStagingPage.tsx`, `src/ui-staging/V3StagingApp.tsx` | `V3_2StagingApp` preview shell | N/A | Yes | No | No | Yes, route opens | Partial, inherited V3.2 nav | No | Yes, labeled | 1 | Resolved in Phase 2: route/build blocker fixed. Still preview-only and not content/workflow parity. | `src/ui-staging/V3StagingApp.tsx`, `src/ui-staging/UIStagingPage.tsx`, `src/App.tsx` | Historical Phase 1 blocker no longer active. |
| V3.2 Shell / Navigation | `/ui-staging/v32` | Main app shell routes under `src/App.tsx` | `src/ui-staging/UIStagingV32Page.tsx`, `src/ui-staging/V3_2StagingApp.tsx` | Local state: `activeSection`, `isPlannerView`, hardcoded preview data | `src/App.tsx`, `src/policy/components/CommandCenterLayout.tsx` | Yes | No | No | Partial, handoffs/blockers added in Phase 2 | Partial, submenu handoffs added in Phase 2 | No | Yes, labeled | 1 | Route/nav safety stabilized, but content renderer parity remains Phase 3 and workflow interiors remain Phase 4. | `src/ui-staging/V3_2StagingApp.tsx`, `src/App.tsx` | Displaying panels is not route/content/workflow parity. |
| Dashboard Agency View | `/ui-staging/v32` section `dashboard` | `/dashboard` | `src/ui-staging/V3_2StagingApp.tsx` | Hardcoded `kpis`, `HeroStat` values | `src/policy/pages/DashboardPage.tsx` | Yes | No | No | Partial, only "Go to My Planner" toggles local state | No | No | Yes, not labeled | 1 | KPI values are synthetic counts and no KPI opens source detail. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/DashboardPage.tsx` | Counts are not evidence of production parity. |
| My Planner | `/ui-staging/v32` dashboard planner mode | `/my-tasks`, `/pm/my-tasks` | `src/ui-staging/V3_2StagingApp.tsx` | `INITIAL_PLANNED_TASKS` local array | `src/policy/ces/pages/MyTasksPage.tsx`, `src/policy/components/pm/MyTasksPmPage.tsx`, `src/policy/pm/taskProjection.ts`, `src/policy/components/pm/TaskDetailRightPanel.tsx` | Yes | No | No | No, "Execute" buttons have no handler | Filter buttons display active style only for all | No | Yes, not labeled | 1 | Task cards do not open task detail and actions do not execute or show blockers. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/components/pm/TaskDetailRightPanel.tsx` | Hard failure: task list without task detail is incomplete. |
| Profiles Parent | `/ui-staging/v32` nav `profiles` | `/clinicians`, `/patients` | `src/ui-staging/V3_2StagingApp.tsx` | Nav submenu only | `src/policy/staffing/pages/ClinicianListPage.tsx`, `src/policy/staffing/pages/PatientListPage.tsx` | No | No | No | Partial, expands submenu | No | No | Yes, not labeled | 0 | Parent is only a nav container with no routed workspace. | `src/ui-staging/V3_2StagingApp.tsx` | Not a production surface. |
| Clinician Profiles | `/ui-staging/v32` section `clinicians` | `/clinicians`, `/clinicians/:clinicianId` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state; `V3_STAFF` exists but unused | `src/policy/staffing/pages/ClinicianListPage.tsx`, `src/policy/staffing/pages/ClinicianDetailPage.tsx` | No | No | No | No | No | No | Yes, seed exists in `V3_AppSeedPrimitives` but unused/unlabeled | 0 | No clinician list, detail, credentials, assignment, or compliance click path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/ces/data/V3_AppSeedPrimitives.ts` | V3 has only placeholder output. |
| Patient Profiles | `/ui-staging/v32` section `patients` | `/patients`, `/patients/:patientId` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state; `V3_PATIENTS` exists but unused | `src/policy/staffing/pages/PatientListPage.tsx`, `src/policy/staffing/pages/PatientDetailPage.tsx` | No | No | No | No | No | No | Yes, seed exists in `V3_AppSeedPrimitives` but unused/unlabeled | 0 | No patient list, detail, cert period, discipline, visit, or clinician path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/ces/data/V3_AppSeedPrimitives.ts` | V3 has only placeholder output. |
| Scheduling & Visits | `/ui-staging/v32` section `calendar` | `/calendar`, `/staffing-calendar` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state; `V3_VISITS` exists but unused | `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/staffing/pages/StaffingCalendarPage.tsx` | No | No | No | No | No | No | Yes, seed exists in `V3_AppSeedPrimitives` but unused/unlabeled | 0 | No calendar grid, event detail, visit detail, or mobile execution path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/MasterCalendarPage.tsx` | Live calendar exists, V3 does not reuse it. |
| Brad AI Copilot | `/ui-staging/v32` section `brad` | `/iadministrator`, `/brad-proposal`, help/reference surfaces | `src/ui-staging/V3_2StagingApp.tsx` | `INTRO_CHATS`, canned timeout responses | `src/policy/pages/iAdministrator.tsx`, `src/policy/pages/BradProposal.tsx`, `src/policy/help/HelpCenterPage.tsx` | No | No | No | Partial, prompt chips fill input and RUN appends canned answer | No | No | Yes, not labeled | 0 | No grounded policy/search/action layer; canned responses can imply false execution. | `src/ui-staging/V3_2StagingApp.tsx` | Synthetic completion claims risk. |
| CES Sprint Board | `/ui-staging/v32` section `ces` | `/ces/board`, `/calendar?view=sprint`, `/pm/*` | `src/ui-staging/V3_2StagingApp.tsx` | `V3_ExecutionUnitsSeed`, Phase 4B local preview state, Phase 4C-A durable app-store adapter over `reg-execution-v2` | `src/policy/ces/pages/CesBoardPage.tsx`, `src/policy/ces/components/board/SprintExecutionBoard.tsx`, `src/policy/pages/MasterCalendarPage.tsx`, `src/policy/components/pm/TaskDetailRightPanel.tsx` | Yes | Partial event/task content | No canonical PM drawer; V3 in-shell adapter | Yes, task card opens in-shell event/task detail | Yes, explicit `Open live route` only | Safe task actions persist through local app-store adapter; evidence/signature/approval panels remain local preview except metadata placeholder/approval request adapter actions | Yes, labeled | 4 (durable app-store adapter wired; not level 5) | Backend evidence persistence, durable legal signature collection, approval decision mutation, certification, and production audit-history mutation remain Phase 4C-B blockers. | `src/ui-staging/V3_2StagingApp.tsx`, `src/ui-staging/ces/cesDurableExecutionAdapter.ts`, `src/policy/ces/data/V3_CES_SeedData.ts` | Phase 4C-A is not level 5 production-shaped completion. |
| Taxonomy | `/ui-staging/v32` section `taxonomy` | `/taxonomy`, `/framework` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state | `src/policy/pages/TaxonomyPage.tsx`, `src/policy/pages/FrameworkPage.tsx`, `src/policy/pages/AchcSurveyAlignmentPage.tsx` | No | No | No | No | No | No | Placeholder text | 0 | No taxonomy tree, policy crosswalk, or ACHC detail path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/TaxonomyPage.tsx` | Dead nav surface. |
| Onboarding / Journey | `/ui-staging/v32` section `onboarding` | `/journey`, `/journey/module/:moduleId`, `/onboarding-v2/*` | `src/ui-staging/V3_2StagingApp.tsx` | `ALL_MODULES` | `src/policy/journey/pages/JourneyHomePage.tsx`, `src/policy/journey/data/modules.ts`, `src/policy/journey/pages/ModulePlayerPage.tsx`, `src/policy/onboarding-v2/pages/*`, `src/policy/onboarding/onboardingExecutionEngine.ts` | Yes | Yes, module catalog content | No embedded renderer; live route handoff | Yes, module clicks route to live player | Yes, journey/supervisor/admin/guide/onboarding-v2 handoffs | No | No new synthetic data | 2 | Gates, evidence, signatures, escalations, and deterministic progress remain Phase 4 workflow state. | `src/ui-staging/V3_2StagingApp.tsx`, journey/onboarding live files | `ALL_MODULES` content is now visible and clicks route to canonical live surfaces. |
| Policy Lifecycle | `/ui-staging/v32` section `policy` | `/policy-lifecycle`, `/library`, `/library/:policyId`, `/policies/:policyId` | `src/ui-staging/V3_2StagingApp.tsx` | `frameworkPolicies`, `getPolicyContent`, `getPolicyBody` | `src/policy/pages/PolicyLifecyclePage.tsx`, `src/policy/pages/LibraryPage.tsx`, `src/policy/pages/PolicyDetailPage.tsx`, `src/policy/components/PolicyLibraryDocumentView.tsx`, `src/policy/data/policyContentMap.ts` | Yes | Yes | Yes, `PolicyLibraryDocumentView` embedded | Yes, list click renders full detail content | Yes, live route handoffs to `/library/:policyId` and `/policies/:policyId` | No | No new synthetic data | 3 | Lifecycle workflow/actions remain Phase 4; not production-shaped complete. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/components/PolicyLibraryDocumentView.tsx`, `src/policy/data/policyContentMap.ts` | Full policy body path now resolves through canonical content accessors/renderer. |
| Forms Library | `/ui-staging/v32` section `forms` | `/forms`, `/forms/:formId`, `/forms/:formId/print` | `src/ui-staging/V3_2StagingApp.tsx` | `FORMS_DATASET`, `buildFormContent` | `src/policy/pages/FormsPage.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/pages/FormPrintView.tsx`, `src/policy/data/formsLibraryContent.ts`, `src/policy/data/formsLibraryDataset.ts` | Yes | Yes | Yes, `FormBody` embedded | Yes, list click renders full form content | Yes, live open and print handoffs | No signature workflow; content signatures render as fields | No new synthetic data | 3 | Signature/approval workflow state remains Phase 4; not production-shaped complete. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/components/FormViewer.tsx`, `src/policy/data/formsLibraryContent.ts` | Full form sections/fields/orientation/signature metadata render from canonical builder. |
| Evidence Center | `/ui-staging/v32` section `evidence` | `/evidence`, `/artifacts/:artifactId` | `src/ui-staging/V3_2StagingApp.tsx` | `useRegulatoryExecutionStore` evidence metadata first, then CES seed evidence metadata | `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/ArtifactViewerPage.tsx`, `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx`, `src/policy/evidence/*` | Yes | Partial metadata/detail content | Read/detail adapter over local app-store and seed metadata | Yes, evidence rows open in-shell detail | Yes, explicit artifact viewer/live route handoffs only | Local/demo artifact viewer/download wiring is available only where real local/demo references or bytes already exist; upload/validate/promote/certify remain blocked | Mixed: local-store plus seed metadata, labeled | 3 | Backend artifact upload/download, validation/promote, backend evidence persistence, production audit immutability, legal signature, and certification remain blocked. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/pages/ArtifactViewerPage.tsx` | Phase 5A-B is artifact viewer/local download wiring only; not backend evidence persistence, not production S3/download APIs, not production evidence certification, and not level 5. |
| Hubstaff | `/ui-staging/v32` section `hubstaff` | `/hubstaff` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state | `src/policy/pages/HubstaffStagingPage.tsx` | No | No | No | No | No | No | Placeholder text | 0 | No live component reuse or detail/action paths. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/pages/HubstaffStagingPage.tsx` | Dead nav surface. |
| Help Center | `/ui-staging/v32` section `help-center` | `/help/*`, `/system-documentation/:sectionId` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state | `src/policy/help/HelpCenterPage.tsx`, `src/policy/pages/SystemDocumentationPage.tsx` | No | No | No | No | No | No | Placeholder text | 0 | No article/category/search path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/help/HelpCenterPage.tsx` | Dead nav surface. |
| Admin | `/ui-staging/v32` section `admin` | `/admin/user-groups`, `/admin/roles`, `/admin/permissions`, `/admin/users` | `src/ui-staging/V3_2StagingApp.tsx` | Empty construction state | `src/policy/security/identity/*` | No | No | No | No | No | No | Placeholder text | 0 | No identity pages, page access matrix, permissions, role, or user assignment path in V3. | `src/ui-staging/V3_2StagingApp.tsx`, `src/policy/security/identity/*` | Dead nav surface. |
| V3 CES Seed Preview | `/ui-staging/ces-seed` | `/ces/board`, `/ces/reports`, `/calendar`, `/my-tasks`, `/pm/*` | `src/ui-staging/ces/V3CESSeedPreview.tsx` | `V3_CES_SeedData.ts` | `src/policy/data/regulatoryEvents.ts`, `src/policy/stores/regulatoryExecutionStore.ts`, `src/policy/compliance-execution/complianceExecutionStore.ts`, PM task/evidence stores | Yes | No | No | Partial, toggles view/filter only | Partial, select filter only | No | Yes, not labeled | 1 | Preview cards do not open event/task/workflow/evidence/form/signature/approval details. | `src/ui-staging/ces/V3CESSeedPreview.tsx`, `src/policy/ces/data/V3_CES_SeedData.ts`, `src/policy/ces/data/V3_CES_SnapshotBuilder.ts` | Explicitly says "first drop"; not production parity. |
| V3 CES Snapshot Adapter | Not routed directly | `useComplianceExecution` consumers | `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`, `src/policy/compliance-execution/seededMode.tsx` | `V3_ExecutionUnitsSeed`, local `V3_REGULATORY_EVENTS` | `src/policy/compliance-execution/complianceExecutionStore.ts`, `src/policy/data/regulatoryEvents.ts`, `src/policy/stores/regulatoryExecutionStore.ts` | Yes | Partial for event/unit metadata only | Yes, adapter exists | No route click path | No | No | Yes, not labeled | 3 | Adapter is not mounted into V3.2, bypasses real stores, and has no action mutation/audit loop. | `src/policy/compliance-execution/seededMode.tsx`, `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`, V3 host route files | Renderer seeded, not workflow wired. |
| V3 Staff Seed Primitive | Not routed | `/clinicians`, `/admin/users`, `/journey/*` | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_STAFF` | Staffing, journey, identity stores/pages | Yes | No | No | No | No | No | Yes, not labeled | 1 | Data exists but no V3 renderer/detail/workflow route consumes it. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, `src/ui-staging/V3_2StagingApp.tsx` | Registry/list seeded only. |
| V3 Patient Seed Primitive | Not routed | `/patients`, `/staffing-calendar` | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_PATIENTS` | Patient/staffing pages | Yes | No | No | No | No | No | Yes, not labeled | 1 | Data exists but no V3 patient detail or visit workflow consumes it. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, `src/ui-staging/V3_2StagingApp.tsx` | Registry/list seeded only. |
| V3 Visit Seed Primitive | Not routed | `/staffing-calendar`, `/calendar` | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_VISITS` | Staffing calendar, master calendar | Yes | No | No | No | No | No | Yes, not labeled | 1 | Data exists but no V3 calendar/scheduling route consumes it. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, `src/ui-staging/V3_2StagingApp.tsx` | Registry/list seeded only. |
| V3 Policy Seed Primitive | Not routed | `/library`, `/policy-lifecycle` | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_POLICIES` | `policyContentMap`, `PolicyLibraryDocumentView`, `PolicyLifecyclePage` | Yes | No | No | No | No | No | Yes, not labeled | 1 | Policy metadata exists but does not resolve full policy bodies, appendices, lifecycle actions, print/open paths. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, `src/ui-staging/V3_2StagingApp.tsx`, canonical policy renderers | Must not be mistaken for full policy seeding. |
| V3 Form Seed Primitive | Not routed | `/forms`, `/forms/:formId`, `/forms/:formId/print` | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_FORMS` | `FORMS_DATASET`, `buildFormContent`, `FormViewer`, `FormPrintView` | Yes | No | No | No | No | No | Yes, not labeled | 1 | Form metadata exists but does not resolve sections, fields, signatures, print/open paths, or policy links. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, `src/policy/components/FormViewer.tsx`, `src/policy/pages/FormPrintView.tsx` | Must not be mistaken for full form rendering. |
| V3 Physician Seed Primitive | Not routed | No confirmed live V3 equivalent; likely clinical/referral surfaces | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_PHYSICIANS` | TBD live physician/referral source | Yes | No | No | No | No | No | Yes, not labeled | 1 | Seed exists without a routed V3 surface or canonical source mapping. | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | Registry only. |
| V3 Audit Log Seed Primitive | Not routed | `/audit`, task/evidence audit views | `src/policy/ces/data/V3_AppSeedPrimitives.ts` | `V3_AUDIT_LOG` | `regulatoryExecutionStore`, PM overlay audit, evidence audit APIs | Yes | No | No | No | No | No | Yes, not labeled | 1 | Static audit rows are not deterministic audit history. | `src/policy/ces/data/V3_AppSeedPrimitives.ts`, audit/evidence/task stores | Completion status without deterministic rule is incomplete. |

## Special Focus Findings

### Policies

- V3.2 policy surface is level 3 after Phase 3: it consumes `frameworkPolicies`, `getPolicyContent`, `getPolicyBody`, and `PolicyLibraryDocumentView`.
- Live `/library` list uses `frameworkPolicies` for registry/list projection, then `/library/:policyId` uses `PolicyLibraryDocumentView` and `getPolicyContent` for full generated sections.
- V3 now proves policy detail rendering through canonical policy content accessors and live detail route handoffs. Lifecycle workflow actions remain Phase 4.

### Forms

- V3.2 now has a Forms Library nav item and form renderer adapter.
- V3 form seed primitive `V3_FORMS` is registry/list seeded only.
- Live `/forms` uses `FORMS_DATASET`; live `/forms/:formId` and `/forms/:formId/print` resolve full content through `buildFormContent`, `FormBody`, `FormViewer`, and `FormPrintView`.
- V3 now proves form sections, fields, signature field metadata, orientation, and print/open handoffs through canonical form builders/renderers. Signature/approval workflow state remains Phase 4.

### CES / Calendar / Tasks

- V3.2 CES board is Phase 4A: seeded columns now open an in-shell Event Workspace and Task Detail panel with safe local preview actions.
- `/ui-staging/ces-seed` is level 1: static cards and filters only.
- `V3_CES_SnapshotBuilder` is level 3 as a renderer adapter concept, but it is not mounted into the V3.2 click paths and uses local `V3_REGULATORY_EVENTS`.
- V3.2 does not open canonical `TaskDetailRightPanel`; it opens a V3-local in-shell task detail adapter so containment is preserved.
- Evidence/artifact, signature/approval, durable completion, certification, and audit-history mutation remain blocked and must not be counted as level 5 completion.

### Training / Journey / Onboarding

- V3.2 onboarding/training is level 2 after Phase 3. It uses `ALL_MODULES` and routes module/player/supervisor/admin/guide/onboarding-v2 handoffs. Gates, evidence, signatures, escalations, and deterministic progress remain Phase 4.

### Reports / Planner / PM / Evidence / Audit

- V3.2 My Planner is level 1 because cards exist but task detail/action behavior is dead.
- V3.2 Evidence Center is level 3 after Phase 5A-A because primary rows open an in-shell detail panel backed by local app-store/seed metadata. Upload/download/validation/promotion, backend evidence persistence, artifact verification, production audit immutability, and certification remain blocked.
- Reports are not present as a V3.2 route. `/ces/reports` exists live, but no V3 surface points to it.
- Audit seed exists as static `V3_AUDIT_LOG`, not deterministic live audit history.

## Synthetic Fallback Locations

- `src/ui-staging/V3_2StagingApp.tsx`: `INITIAL_PLANNED_TASKS`, `INTRO_CHATS`, hardcoded KPI values, CES seed metadata fallback for Evidence Center when no app-store evidence exists, construction placeholders, canned Brad responses.
- `src/policy/ces/data/V3_AppSeedPrimitives.ts`: `V3_STAFF`, `V3_PATIENTS`, `V3_VISITS`, `V3_PHYSICIANS`, `V3_AUDIT_LOG`, `V3_POLICIES`, `V3_FORMS`.
- `src/policy/ces/data/V3_CES_SeedData.ts`: `V3_SprintContextSeed`, `V3_AchcSurveyorAlignmentSeed`, `V3_Personas`, `V3_ExecutionUnitsSeed`, `V3_ViewModeSeed`.
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`: local `V3_REGULATORY_EVENTS` and snapshot-derived metrics.
- `src/ui-staging/ces/V3CESSeedPreview.tsx`: preview filters/cards from seed data and generated date display.

Phase 2 labeled these fallback locations in UI/source comments. They remain preview-only unless replaced by verified live renderer/content paths.

## Top 10 Production Blockers

1. Backend/AWS persistence remains Phase 4C-B.
2. Backend evidence upload/download/validation/promote remains Phase 5A-B / Phase 4C-B.
3. Evidence Center artifact file/viewer availability remains Phase 5A-B where no real artifact reference exists.
4. Audit-history mutation and certification remain later Phase 4 work.
5. Static completion/status indicators are not backed by deterministic live rules.
6. Policy lifecycle workflow actions remain Phase 4 even though policy content renderer parity is now level 3.
7. Form signature/approval workflow state remains Phase 4 even though form content renderer parity is now level 3.
8. Training gates, evidence, signatures, escalations, and deterministic progress remain Phase 4 even though module content is now level 2.
9. Resolved in Phase 3: policy/form/training content parity blockers for full content/detail access.
10. Resolved in Phase 2: missing `V3StagingApp.tsx` export, broken `/ui-staging`, build/typecheck failure, and silent dead nav where touched.

## Phase Recommendations

### Phase 2 Files

- `src/ui-staging/V3StagingApp.tsx`
- `src/ui-staging/UIStagingPage.tsx`
- `src/ui-staging/V3_2StagingApp.tsx`
- `src/App.tsx`
- `src/policy/compliance-execution/seededMode.tsx`
- `src/policy/ces/data/V3_CES_SnapshotBuilder.ts`

Phase 2 should first restore build/typecheck and replace dead V3 navigation with canonical route/renderer adapters.

### Phase 3 Files

- `src/ui-staging/V3_2StagingApp.tsx`
- `src/policy/components/PolicyLibraryDocumentView.tsx`
- `src/policy/components/SharedPolicyDetailView.tsx`
- `src/policy/data/policyContentMap.ts`
- `src/policy/components/FormViewer.tsx`
- `src/policy/pages/FormPrintView.tsx`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/data/formsLibraryDataset.ts`

Phase 3 should seed full content rendering for policies and forms through canonical render paths.

### Phase 4 Files

- `src/policy/pages/MasterCalendarPage.tsx`
- `src/policy/ces/components/board/SprintExecutionBoard.tsx`
- `src/policy/components/pm/TaskDetailRightPanel.tsx`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/pm/taskProjection.ts`
- `src/policy/pages/EvidenceCenterPage.tsx`
- `src/policy/pages/ArtifactViewerPage.tsx`
- `src/policy/journey/pages/JourneyHomePage.tsx`
- `src/policy/onboarding-v2/pages/*`

Phase 4 should wire workflow interiors, state mutations, blockers, evidence, forms, signatures, approvals, and audit/history behavior.
