# Component Registry

Scope: frontend (`src`), backend (`server`), build/tooling (`scripts`), and generated/static data modules that drive runtime behavior.

## Registry Format

- **Component Name**
- **File Path**
- **Type** (`Page` / `Component` / `Layout` / `Utility` / `Store` / `Service` / `Data` / `Backend Module` / `Script`)
- **Purpose**
- **Used By**
- **Depends On**
- **Data Sources**
- **Key Props / Inputs**
- **Outputs / Effects**
- **Notes**

---

## A) App Entry + Layout Shell

| Component Name | File Path | Type | Purpose | Used By | Depends On | Data Sources | Key Props / Inputs | Outputs / Effects | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `main` | `src/main.tsx` | Utility | React bootstrap + router mount | Browser entry | `BrowserRouter`, `App` | None | DOM root | Mounts app | Runtime entrypoint |
| `App` | `src/App.tsx` | Layout | Canonical route tree and lazy loading | `main` | React Router, pages, `CommandCenterLayout` | Route params | URL path, route params | Screen routing | Authoritative route map |
| `PolicyCommandCenterApp` | `src/policy/PolicyCommandCenterApp.tsx` | Layout | Alternate route shell (subset) | Needs confirmation | `CommandCenterLayout` + core pages | Route params | URL path | Alternate routing | Not imported by `main` |
| `CommandCenterLayout` | `src/policy/components/CommandCenterLayout.tsx` | Layout | Shared app chrome/header/nav shell | Most in-layout pages | `uiStore` + shell UI | UI store | `children` | Uniform shell UX | Core layout container |

---

## B) Routed Pages (Frontend)

| Component Name | File Path | Type | Purpose | Used By | Depends On | Data Sources | Key Props / Inputs | Outputs / Effects | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `DashboardPage` | `src/policy/pages/DashboardPage.tsx` | Page | Dashboard KPI + event state | `App` route `/dashboard` | Regulatory components, stores | `regulatoryEvents`, execution/autogen stores | None | Dashboard rendering | Includes audit state labels |
| `MasterCalendarPage` | `src/policy/pages/MasterCalendarPage.tsx` | Page | Calendar/timeline execution UI | `App` route `/calendar` | `TimelineMonth`, execution panel | `regulatoryEvents`, stores | None | Event timeline and execution actions | Mandated events surface |
| `AuditModePage` | `src/policy/pages/AuditModePage.tsx` | Page | Audit readiness/survey packet controls | `App` route `/audit` | Audit modules + enforcement | Execution state + audit modules | None | Audit scoring and export flows | Major operational page |
| `LibraryPage` | `src/policy/pages/LibraryPage.tsx` | Page | Policy library list/filter | `App` route `/library` | `SharedPolicyDetailView` | Framework/policy seed | None | Policy navigation | Library root |
| `PolicyDetailPage` | `src/policy/pages/PolicyDetailPage.tsx` | Page | Generic policy detail view router | `App` route `/library/:policyId` | Detail views + stores | `policyContentMap`, policy store | `policyId` route param | Detail render, lifecycle actions | Switches to GV/CL views by ID |
| `DraftsPage` | `src/policy/pages/DraftsPage.tsx` | Page | Draft policy list | `App` route `/drafts` | `StatusBadge`, stores | Policy versions | None | Draft workflow navigation | Lifecycle pipeline |
| `DraftPolicyPage` | `src/policy/pages/DraftPolicyPage.tsx` | Page | Single draft editor/review prep | `App` route `/drafts/:policyId` | Stores + content map | Policy content/version state | `policyId` | Draft state updates | Lifecycle guarded |
| `ReviewPage` | `src/policy/pages/ReviewPage.tsx` | Page | Review stage for draft lifecycle | `App` route `/review` | `reviewStore`, `policyStore` | Store state | None | Review decisions | Supports unresolved-comment guards |
| `PublishPage` | `src/policy/pages/PublishPage.tsx` | Page | Publish queue/actions | `App` route `/publish` | Policy/auditor stores | Policy lifecycle state | None | Publish job creation | Enforces approval preconditions |
| `TaxonomyPage` | `src/policy/pages/TaxonomyPage.tsx` | Page | Taxonomy visualization | `App` route `/taxonomy` | `FrameworkShowcase` | Framework seed | None | Taxonomy render | Active taxonomy page |
| `TaxonomyPage` (legacy) | `src/policy/pages/TaxonomyPage.old.tsx` | Page | Legacy taxonomy implementation | Not routed | Legacy deps | Legacy data | None | Legacy rendering | Needs confirmation (keep/remove) |
| `FrameworkPage` | `src/policy/pages/FrameworkPage.tsx` | Page | Framework management/presentation | `App` route `/framework` | Internal UI + navigation | Framework data | None | Framework UX | Large inline page component |
| `GovernancePage` | `src/policy/pages/GovernancePage.tsx` | Page | Governance metrics and status | `App` route `/governance` | Stores + metrics helpers | Framework/policy stores | None | Governance summary | Governance surface |
| `DemoPage` | `src/policy/pages/DemoPage.tsx` | Page | Demo entry | `App` route `/demo` | `ExecutivePresentation` | Static content | None | Demo render | Uses `DemoPhase2` |
| `ExecutivePresentation` | `src/policy/pages/DemoPhase2.tsx` | Page | Presentation component | `DemoPage` | Internal UI | Static content | None | Presentation render | Named export |
| `FormsPage` | `src/policy/pages/FormsPage.tsx` | Page | Forms library grid/search | `App` route `/forms` | form utilities | `FORMS_DATASET` | None | Open/print forms | Form catalog surface |
| `FormViewer` | `src/policy/components/FormViewer.tsx` | Component | Interactive form renderer | `App` route `/forms/:formId` + embed callers | `buildFormContent`, `printForm` | `FORMS_DATASET`, form content overrides | `formId?`, route `formId` | Renders form, triggers print/download | Also exports `FormBody` |
| `FormPrintView` | `src/policy/pages/FormPrintView.tsx` | Page | Dedicated form print route | `App` route `/forms/:formId/print` | `FormBody` | `FORMS_DATASET`, form content builder | `formId` route param | Auto-print + print CSS | Embedded print guard |
| `PrintPage` | `src/policy/pages/PrintPage.tsx` | Page | Generic policy print page | `App` route `/print/:policyId` | `policyStore`, content map | `policyContentMap` | `policyId` | Print-ready policy output | Fallback behavior for missing content |
| `GVGBPrintDocument` | `src/policy/pages/GVGBPrintDocument.tsx` | Page | GV-GB-001 full print document | `App` route `/print/GV-GB-001` | Internal sections | Embedded policy/form content | None | Full doc print | Specific route before generic print |
| `GVGBAppendixPrint` | `src/policy/pages/GVGBAppendixPrint.tsx` | Page | GV-GB appendix print | `App` route `/print/GV-GB-001/appendix/:appendixId` | Appendix renderer | Appendix content | `appendixId` | Appendix-only print | Route-specific |
| `GVPolicyDetailView` | `src/policy/pages/GVPolicyDetailView.tsx` | Page | Governance-specific policy detail | `App` route `/gv-policy/:policyId` | Internal detail UI | Policy store/content | `policyId` | Governance policy rendering | Specialized detail surface |
| `GVGBDetailView` | `src/policy/pages/GVGBDetailView.tsx` | Page | GV-GB-focused detail view | Used by `PolicyDetailPage` | Internal detail UI | Policy content | props from parent | Render policy sections | Specialized component page |
| `CLPolicyDetailView` | `src/policy/pages/CLPolicyDetailView.tsx` | Page | Clinical policy detail view | Used by `PolicyDetailPage` | Internal detail UI | Policy content | props from parent | Render clinical detail | Includes `CL_POLICY_IDS` |
| `HubstaffStagingPage` | `src/policy/pages/HubstaffStagingPage.tsx` | Page | Hubstaff integration staging UI | `App` route `/hubstaff` | hubstaff data/API | `hubstaffTasks`, `/api/hubstaff` | None | Task/project ops staging | Operational integration page |
| `MasterControlInventoryPage` | `src/policy/pages/MasterControlInventoryPage.tsx` | Page | Master control inventory page wrapper | `App` route `/compliance/master-controls` | `MasterControlInventory` | MCI JSON loader | None | Control table filtering/view | Compliance surface |
| `IAdministratorPage` | `src/policy/pages/iAdministrator/index.tsx` | Page | Brad iAdministrator UI shell | `App` route `/iadministrator` | iA hooks + iA components | `/api/ia` endpoints | User query, mode, session state | Query/chat interactions | Primary Brad UX |
| `BradProposalPage` | `src/policy/pages/BradProposal/index.tsx` | Page | Executive proposal hidden page | `App` route `/brad-proposal` | Internal UI | Static content | None | Proposal presentation | Accessed by hidden trigger |
| `WorkflowLibraryApp` | `src/policy/workflows/WorkflowLibraryApp.tsx` | Page | Workflow domain browser app | `App` route `/workflows/*` | Brand rail + nested routes | `workflows.generated` family | URL (`workflowId`) | Nested routing | Has child routes `index` and `:workflowId` |
| `JourneyHomePage` | `src/policy/journey/pages/JourneyHomePage.tsx` | Page | Onboarding journey home | `App` route `/journey` | Journey components | Journey store/data | None | Journey flow state | Separate product surface |
| `AppendixFPage` | `src/policy/journey/pages/AppendixFPage.tsx` | Page | Appendix F workflow page | `App` route `/journey/appendix-f` | Journey components | Journey store | None | Appendix workflow operations | Journey subsystem |
| `ModulePlayerPage` | `src/policy/journey/pages/ModulePlayerPage.tsx` | Page | Learning module player | `App` route `/journey/module/:moduleId` | `ScormPlayer`, evidence components | Journey module data | `moduleId` | Training module playback/completion | SCORM-linked |
| `SupervisorPage` | `src/policy/journey/pages/SupervisorPage.tsx` | Page | Supervisor journey workflow | `App` route `/journey/supervisor` | Journey components | Journey store | None | Supervisor actions | Journey subsystem |
| `AdminPage` | `src/policy/journey/pages/AdminPage.tsx` | Page | Journey admin controls | `App` route `/journey/admin` | Journey store/utils | Journey data | None | Admin tracking/escalation | Journey subsystem |
| `UserGuidePage` | `src/policy/journey/pages/UserGuidePage.tsx` | Page | Journey user guide | `App` route `/journey/guide` | Static UI | Static content | None | Guide rendering | Journey subsystem |

---

## C) Shared and Domain Components

| Component Name | File Path | Type | Purpose | Used By | Depends On | Data Sources | Key Props / Inputs | Outputs / Effects | Notes |
|---|---|---|---|---|---|---|---|---|---|
| `SharedPolicyDetailView` | `src/policy/components/SharedPolicyDetailView.tsx` | Component | Shared policy detail rendering | `LibraryPage` | Policy UI utilities | Policy content | policy identifiers | Detail rendering | Exports `SharedGlassTable` |
| `MasterControlInventory` | `src/policy/components/MasterControlInventory.tsx` | Component | MCI table/filtering | `MasterControlInventoryPage` | MCI loader/types | MCI JSON | none | inventory visualization | Compliance domain |
| `FrameworkShowcase` | `src/policy/components/FrameworkShowcase.tsx` | Component | Framework taxonomy display | `TaxonomyPage` | framework store | framework seed | none | visualization | Taxonomy-focused |
| `PolicyDetailModal` | `src/policy/components/PolicyDetailModal.tsx` | Component | Modal detail preview | Policy pages/components | policy content | store/content | policy selection | modal interactions | Supporting detail UI |
| `DraftBanner` | `src/policy/components/DraftBanner.tsx` | Component | Draft status banner | `PolicyDetailPage`, draft flows | policy lifecycle state | policy store | lifecycle status | status callouts | Draft lifecycle UI |
| `StatusBadge` | `src/policy/components/StatusBadge.tsx` | Component | Lifecycle status indicator | multiple policy pages | style tokens | policy status | status | visual status output | Shared badge |
| `TravelightBG` | `src/components/TravelightBG.tsx` | Component | shared visual background | Needs confirmation | UI primitives | none | visual props | decorative render | Outside policy subtree |

---

## D) Regulatory Execution Components

- `src/policy/components/regulatory/ApprovalFlow.tsx`
- `src/policy/components/regulatory/BlockerPanel.tsx`
- `src/policy/components/regulatory/EvidencePanel.tsx`
- `src/policy/components/regulatory/EventChip.tsx`
- `src/policy/components/regulatory/EventSyncControl.tsx`
- `src/policy/components/regulatory/EventWorkspace.tsx`
- `src/policy/components/regulatory/HelpArticleView.tsx`
- `src/policy/components/regulatory/KpiTile.tsx`
- `src/policy/components/regulatory/LockBadge.tsx`
- `src/policy/components/regulatory/ModalShell.tsx`
- `src/policy/components/regulatory/MonthGrid.tsx`
- `src/policy/components/regulatory/Primitives.tsx`
- `src/policy/components/regulatory/TimelineMonth.tsx`
- `src/policy/components/regulatory/Toast.tsx`
- `src/policy/components/regulatory/WorkflowDrawer.tsx`
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- `src/policy/components/regulatory/timelineState.ts`

All components above are `Component` or `Utility` type and are used primarily by `DashboardPage`, `MasterCalendarPage`, and `AuditModePage`.

Common dependencies:
- `regulatoryEvents` domain data
- `regulatoryExecutionStore`
- `autogenStore`
- `enforcementStore`
- `helpArticles`

Common outputs/effects:
- Workflow execution mutation
- Approval/evidence transitions
- Event urgency/status classification
- Toast notifications

---

## E) iAdministrator (Brad UI) Components + Hooks

### Components

- `src/policy/pages/iAdministrator/components/ActiveCasePanel.tsx`
- `src/policy/pages/iAdministrator/components/AvailableActions.tsx`
- `src/policy/pages/iAdministrator/components/BradHelpCenter.tsx`
- `src/policy/pages/iAdministrator/components/ChatThread.tsx`
- `src/policy/pages/iAdministrator/components/CitationChips.tsx`
- `src/policy/pages/iAdministrator/components/CommandBar.tsx`
- `src/policy/pages/iAdministrator/components/EmergencyBanner.tsx`
- `src/policy/pages/iAdministrator/components/FormRenderer.tsx`
- `src/policy/pages/iAdministrator/components/HealthStrip.tsx`
- `src/policy/pages/iAdministrator/components/NoAnswer.tsx`
- `src/policy/pages/iAdministrator/components/OperationalGaps.tsx`
- `src/policy/pages/iAdministrator/components/ReferenceCards.tsx`
- `src/policy/pages/iAdministrator/components/RegulatoryAlerts.tsx`
- `src/policy/pages/iAdministrator/components/RequirementsSnapshot.tsx`
- `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx`
- `src/policy/pages/iAdministrator/components/RiskBadge.tsx`
- `src/policy/pages/iAdministrator/components/ScenarioResponse.tsx`
- `src/policy/pages/iAdministrator/components/StructuredAnswer.tsx`
- `src/policy/pages/iAdministrator/components/StudioTabs.tsx`

### Hooks / clients / types

- `src/policy/pages/iAdministrator/lib/iaClient.ts`
- `src/policy/pages/iAdministrator/lib/useIa.ts`
- `src/policy/pages/iAdministrator/lib/responseTypes.ts`
- `src/policy/pages/iAdministrator/lib/sessionTypes.ts`

Primary data sources:
- `/api/ia/health`, `/api/ia/query`, `/api/ia/chat`
- `/api/ia/references/:id`, `/api/ia/operational/*`, `/api/ia/regulatory/*`

Primary outputs/effects:
- SSE-driven retrieval and completion events
- Chat session lifecycle and case status interactions
- Right-panel citation/reference loading

---

## F) Workflow Library Components

- `src/policy/workflows/components/BrandRail.tsx`
- `src/policy/workflows/components/LandingView.tsx`
- `src/policy/workflows/components/LinkedWorkflows.tsx`
- `src/policy/workflows/components/WorkflowCard.tsx`
- `src/policy/workflows/components/WorkflowDetailView.tsx`
- `src/policy/workflows/brand.ts`

Data dependencies:
- `src/policy/data/workflows.generated.ts`
- `src/policy/data/workflowGraph.generated.ts`
- `src/policy/data/formTitles.generated.ts`
- `src/policy/types/workflow.ts`

---

## G) Journey Components

### Pages
- `src/policy/journey/pages/JourneyHomePage.tsx`
- `src/policy/journey/pages/AppendixFPage.tsx`
- `src/policy/journey/pages/ModulePlayerPage.tsx`
- `src/policy/journey/pages/SupervisorPage.tsx`
- `src/policy/journey/pages/AdminPage.tsx`
- `src/policy/journey/pages/UserGuidePage.tsx`

### Components
- `src/policy/journey/components/EmployeePicker.tsx`
- `src/policy/journey/components/EvidenceCapture.tsx`
- `src/policy/journey/components/GateBanner.tsx`
- `src/policy/journey/components/ModuleCard.tsx`
- `src/policy/journey/components/PhaseRail.tsx`
- `src/policy/journey/components/ScormPlayer.tsx`
- `src/policy/journey/components/SignaturePad.tsx`
- `src/policy/journey/components/StatusChip.tsx`

### Supporting modules
- `src/policy/journey/stores/journeyStore.ts`
- `src/policy/journey/data/modules.ts`
- `src/policy/journey/data/employees.ts`
- `src/policy/journey/data/appendices.ts`
- `src/policy/journey/scorm/ScormRuntime.ts`
- `src/policy/journey/utils/gating.ts`
- `src/policy/journey/utils/escalation.ts`
- `src/policy/journey/types/journey.ts`

---

## H) State Stores and Core Utilities

### Stores

- `src/policy/stores/policyStore.ts`
- `src/policy/stores/frameworkStore.ts`
- `src/policy/stores/draftStore.ts`
- `src/policy/stores/reviewStore.ts`
- `src/policy/stores/auditorModeStore.ts`
- `src/policy/stores/dashboardStore.ts`
- `src/policy/stores/calendarStore.ts`
- `src/policy/stores/calendarSyncStore.ts`
- `src/policy/stores/uiStore.ts`
- `src/policy/stores/enforcementStore.ts`
- `src/policy/stores/autogenStore.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`

### Utilities / adapters / helpers

- `src/policy/utils/appInitializer.ts`
- `src/policy/utils/printForm.ts`
- `src/policy/utils/lifecycleGuards.ts`
- `src/policy/utils/selectors.ts`
- `src/policy/utils/reminderEngine.ts`
- `src/policy/utils/nextDueDateEngine.ts`
- `src/policy/utils/complianceClassification.ts`
- `src/policy/utils/lightColorRemap.ts`
- `src/policy/adapters/frameworkSeedAdapter.ts`

---

## I) Data Modules (Runtime + Generated)

### Runtime data modules

- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/data/formsLibraryContentHR_CL.ts`
- `src/policy/data/formsLibraryContentCO_More.ts`
- `src/policy/data/formsCatalog.ts`
- `src/policy/data/regulatoryEvents.ts`
- `src/policy/data/mandatedEventsExpanded.ts`
- `src/policy/data/helpArticles.ts`
- `src/policy/data/hubstaffTasks.ts`
- `src/policy/data/masterControlInventory.ts`
- `src/policy/data/policyContentMap.ts`

### Generated data modules

- `src/policy/data/frameworkSeed.generated.ts`
- `src/policy/data/specimenContent.generated.ts`
- `src/policy/data/workflows.generated.ts`
- `src/policy/data/workflowGraph.generated.ts`
- `src/policy/data/workflowTemplates.generated.ts`
- `src/policy/data/formTitles.generated.ts`

### Candidate legacy / low-reference modules

- `src/policy/data/frameworkSeedData.ts`
- `src/policy/data/extractedSeedArrays.ts`

Notes:
- `frameworkSeedData.ts` and `extractedSeedArrays.ts` appear not to be imported by live app paths.
- `workflowTemplates.generated.ts` currently appears to have limited/no direct frontend consumers.
- Marked `Needs confirmation` before removal.

---

## J) Brad Frontend Deterministic Workflow Modules

- `src/policy/brad/useBradWorkflow.ts`
- `src/policy/brad/workflowKnowledge.ts`
- `src/policy/brad/workflowRuntime.ts`
- `src/policy/brad/workflowSchedule.ts`

Purpose:
- Deterministic workflow/readiness answering over compiled workflow graph.

Used by:
- Needs confirmation (not currently imported by `iAdministrator` main page path).

---

## K) Backend Modules (`server`)

### App + infra
- `server/index.ts`
- `server/env.ts`
- `server/logger.ts`
- `server/errors.ts`
- `server/mappers.ts`

### Routers / integrations
- `server/routes/calendar.ts`
- `server/routes/hubstaff.ts`
- `server/googleCalendar.ts`
- `server/sync/eventSync.ts`
- `server/sync/eventStore.ts`
- `server/sync/auditLog.ts`
- `server/sync/bradNotifier.ts`

### IA (Brad) core
- `server/ia/routes.ts`
- `server/ia/service.ts`
- `server/ia/retrieval.ts`
- `server/ia/responder.ts`
- `server/ia/prompt.ts`
- `server/ia/scenarioClassifier.ts`
- `server/ia/ollama.ts`
- `server/ia/types.ts`

### IA index and ingest
- `server/ia/index/search.ts`
- `server/ia/index/store.ts`
- `server/ia/index/embeddings.ts`
- `server/ia/ingest/index.ts`
- `server/ia/ingest/chunker.ts`
- `server/ia/ingest/metadata.ts`
- `server/ia/ingest/normalize.ts`
- `server/ia/ingest/parsers.ts`
- `server/ia/ingest/sources.ts`
- `server/cli/build-index.ts`

### IA session/ops/regulatory
- `server/ia/session/manager.ts`
- `server/ia/session/store.ts`
- `server/ia/session/classifier.ts`
- `server/ia/session/envelope.ts`
- `server/ia/session/audit.ts`
- `server/ia/session/types.ts`
- `server/ia/operational/service.ts`
- `server/ia/operational/seed.ts`
- `server/ia/regulatory/matcher.ts`
- `server/ia/regulatory/feed.ts`

---

## L) Build and Operations Scripts

- `scripts/compileWorkflows.ts`
- `scripts/formsSystemBuild.ts`
- `scripts/verifyPolicyCoverage.ts`
- `scripts/simulateAuditEngine.ts`
- `scripts/pushAllEvents.ts`
- `scripts/pushToHubstaff.ts`
- `scripts/cleanupDuplicates.ts`
- `scripts/diagCalendar.ts`

---

## Needs Confirmation Flags

1. Path duplicates in git status (`src/...` vs `src\...`, `server/...` vs `server\...`) appear to be path-notation artifacts on Windows, not separate modules.
2. `src/policy/PolicyCommandCenterApp.tsx` appears unused by `src/main.tsx`.
3. `src/policy/brad/*` deterministic workflow path appears not currently wired into `src/policy/pages/iAdministrator/index.tsx`.
4. `TaxonomyPage.old.tsx` appears legacy and not routed.
5. Runtime fetch from `/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json` depends on static serving behavior; confirm deployment path guarantees.

