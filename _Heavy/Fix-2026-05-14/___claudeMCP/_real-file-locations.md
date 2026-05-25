# Real File Locations Mapping — Tier 1 Discovery Report

**Agent:** Discovery Agent (16-agent extraction team)  
**Date:** 2026-05-19  
**Scope:** Tier 1 — Pages, Stores, Core Logic, Config  
**Objective:** Map all "requested" files from manifests/plans (which reference outdated paths: `src/pages/`, `src/store/`, `src/lib/`, `src/app/`, `src/components/`) against the **actual** filesystem structure in this repository.

## Executive Summary of Structure

- **Outdated paths do not exist**: `src/pages/`, `src/store/`, `src/lib/`, `src/app/` — all return "does not exist".
- **Canonical location**: All application source code (pages, stores, logic, components) lives under **`src/policy/`** and its submodules:
  - `src/policy/pages/` — Top-level operational pages
  - `src/policy/stores/` — Primary Zustand/mobx-style stores
  - `src/policy/compliance/` + `src/policy/compliance-execution/` — Compliance engines & CES
  - `src/policy/components/`, `src/policy/ces/`, `src/policy/journey/`, `src/policy/staffing/`, `src/policy/onboarding-v2/`, `src/policy/pm/`, `src/policy/security/`, `src/policy/enforcement/`, `src/policy/lifecycle/`, `src/policy/autogen/`, `src/policy/utils/`
- Auth split: `src/auth/`
- UI primitives staging area: `src/ui-staging/` (currently empty/minimal)
- Additional page-like surfaces exist under `src/policy/components/pm/`, `src/policy/ces/pages/`, `src/policy/journey/pages/`, `src/policy/onboarding-v2/pages/`, `src/policy/staffing/pages/`, and `src/policy/security/identity/`

All mappings below were verified via `list_dir`, recursive `find`, and direct inspection. No files remain at legacy roots.

---

## 1. Pages (Tier 1)

| Requested Path (Manifest / Old)                  | Actual Found Path                                      | Brief Note |
|--------------------------------------------------|--------------------------------------------------------|------------|
| src/pages/DashboardPage.tsx                      | src/policy/pages/DashboardPage.tsx                     | Primary executive/operational dashboard (also has .backup). Note: secondary `src/policy/onboarding-v2/pages/DashboardPage.tsx` exists. |
| src/pages/MasterCalendarPage.tsx                 | src/policy/pages/MasterCalendarPage.tsx                | Master Gantt + calendar surface (also .backup). Core for scheduling + CES events. |
| src/pages/LibraryPage.tsx                        | src/policy/pages/LibraryPage.tsx                       | Policy library browser. |
| src/pages/PolicyDetailPage.tsx                   | src/policy/pages/PolicyDetailPage.tsx                  | Individual policy viewer. |
| src/pages/EvidenceCenterPage.tsx                 | src/policy/pages/EvidenceCenterPage.tsx                | Evidence hierarchy + file list. |
| src/pages/FormsPage.tsx                          | src/policy/pages/FormsPage.tsx                         | Forms library + instance management. |
| src/pages/ArtifactViewerPage.tsx                 | src/policy/pages/ArtifactViewerPage.tsx                | Universal artifact / signed form resolver. |
| src/pages/AuditModePage.tsx                      | src/policy/pages/AuditModePage.tsx                     | Audit trail viewer. |
| src/pages/MasterControlInventoryPage.tsx         | src/policy/pages/MasterControlInventoryPage.tsx        | Master control inventory surface. |
| src/pages/PolicyLifecyclePage.tsx                | src/policy/pages/PolicyLifecyclePage.tsx               | Policy lifecycle management. |
| src/pages/GovernancePage.tsx                     | src/policy/pages/GovernancePage.tsx                    | Governance / regulatory view. |
| src/pages/TaxonomyPage.tsx                       | src/policy/pages/TaxonomyPage.tsx                      | (TaxonomyPage.old.tsx also present — legacy). |
| src/pages/PrintPage.tsx                          | src/policy/pages/PrintPage.tsx                         | General print routing. |
| src/pages/FormPrintView.tsx                      | src/policy/pages/FormPrintView.tsx                     | eCign / form print view. |
| src/pages/FormsPage.tsx (and related)            | src/policy/pages/FormsPage.tsx                         | Confirmed. |
| src/pages/CesDashboardPage.tsx (CES)             | src/policy/ces/pages/CesDashboardPage.tsx              | CES-specific dashboard. |
| src/pages/CesBoardPage.tsx                       | src/policy/ces/pages/CesBoardPage.tsx                  | Sprint execution board. |
| src/pages/CesCalendarPage.tsx                    | src/policy/ces/pages/CesCalendarPage.tsx               | CES calendar surface. |
| src/pages/MyTasksPage.tsx                        | src/policy/ces/pages/MyTasksPage.tsx                   | CES My Tasks view. |
| src/pages/OnboardingV2* pages                    | src/policy/onboarding-v2/pages/*.tsx                   | Full onboarding-v2 suite (Activation, AuditReadiness, Batch*, Dashboard, Governance). |
| src/pages/Journey* pages                         | src/policy/journey/pages/*.tsx                         | Journey / training module pages (JourneyHomePage, ModulePlayerPage, etc.). |
| src/pages/Staffing* pages                        | src/policy/staffing/pages/*.tsx                        | ClinicianListPage, PatientListPage, StaffingCalendarPage, etc. |
| src/pages/iAdministrator/*                       | src/policy/pages/iAdministrator/index.tsx + components/ | Special iAdministrator scenario runner (has its own lib/ subfolder). |
| src/pages/LoginPage.tsx etc.                     | src/auth/pages/LoginPage.tsx, RegisterPage.tsx, ...    | Full auth flow pages (CheckEmail, Forgot, Reset, Setup, etc.). |
| src/components/pm/*Page.tsx (e.g. PmDashboardPage) | src/policy/components/pm/PmDashboardPage.tsx, MyTasksPmPage.tsx, SprintPlanPage.tsx, etc. | PM surfaces live under components/pm (not top-level pages/). |
| src/pages/HelpCenterPage.tsx                     | src/policy/help/HelpCenterPage.tsx                     | Help center (under help/). |
| (any) src/app/* or src/pages/* (legacy)          | NOT FOUND                                              | Entire legacy roots absent. All pages migrated into `src/policy/` substructure. |

**Additional Page-like Components (frequently referenced as "pages" in manifests):**  
- `src/policy/components/pm/ApprovalsQueuePage.tsx`, `SprintReviewPage.tsx`, `PmViews.tsx`  
- `src/policy/security/identity/*Page.tsx` (AdminRolesPage, PermissionCatalogPage, User*Pages, AccessDeniedPage)

---

## 2. Stores (Tier 1)

| Requested Path (Manifest / Old)                  | Actual Found Path                                              | Brief Note |
|--------------------------------------------------|----------------------------------------------------------------|------------|
| src/store/dashboardStore.ts                      | src/policy/stores/dashboardStore.ts                            | Primary dashboard state. |
| src/store/calendarStore.ts                       | src/policy/stores/calendarStore.ts                             | Core calendar events. |
| src/store/calendarSyncStore.ts                   | src/policy/stores/calendarSyncStore.ts                         | Google + PM sync. |
| src/store/policyStore.ts                         | src/policy/stores/policyStore.ts                               | Policy corpus / library state. |
| src/store/uiStore.ts                             | src/policy/stores/uiStore.ts                                   | Global UI / theme / nav state. |
| src/store/navStore.ts                            | src/policy/stores/navStore.ts                                  | Navigation / shell state. |
| src/store/frameworkStore.ts                      | src/policy/stores/frameworkStore.ts                            | Framework / seed data. |
| src/store/reviewStore.ts                         | src/policy/stores/reviewStore.ts                               | Review workflow state. |
| src/store/auditorModeStore.ts                    | src/policy/stores/auditorModeStore.ts                          | Auditor mode toggle. |
| src/store/enforcementStore.ts                    | src/policy/stores/enforcementStore.ts                          | Enforcement state. |
| src/store/autogenStore.ts                        | src/policy/stores/autogenStore.ts                              | Autogen / annual scheduler state. |
| src/store/ciModeStore.ts                         | src/policy/stores/ciModeStore.ts                               | CI / demo mode. |
| src/store/regulatoryExecutionStore.ts            | src/policy/stores/regulatoryExecutionStore.ts                  | **Critical** — CES events, tasks, form instances, signers, evidence. |
| (any) src/store/*                                | NOT FOUND (except above under policy/stores)                   | Legacy `src/store/` root absent. |
| src/stores/journeyStore.ts                       | src/policy/journey/stores/journeyStore.ts                      | Journey module store (sub-module). |
| src/stores/clinicianStore.ts etc.                | src/policy/staffing/stores/clinicianStore.ts, patientStore.ts, shiftStore.ts | Staffing domain stores. |
| src/store/lifecycleStore.ts                      | src/policy/lifecycle/lifecycleStore.ts                         | Policy lifecycle state machine store. |
| src/store/complianceExecutionStore.ts            | src/policy/compliance-execution/complianceExecutionStore.ts    | CES execution store (inside compliance-execution module). |
| src/store/onboardingV2Store.ts                   | src/policy/onboarding-v2/store/onboardingV2Store.ts            | Note singular "store/" dir (not stores/). |
| src/store/notificationStore.ts, personalStore.ts, pmOverlayStore.ts, pmViewSprintStore.ts, selectedTaskStore.ts | src/policy/pm/*.ts (multiple *Store files) | PM / sprint / notification stores live under `src/policy/pm/`. |
| src/store/ceuStore.ts                            | src/policy/security/ceuStore.ts                                | CEU / continuing education store. |
| src/store/userAssignmentsStore.ts                | src/policy/security/identity/userAssignmentsStore.ts           | Identity / RBAC store. |
| (any other legacy)                               | Various under `src/policy/*/stores/` or `src/policy/pm/` etc.  | Domain-specific stores are colocated with their feature modules. |

**Store Pattern Note:** Primary global stores centralized in `src/policy/stores/`. Domain stores (journey, staffing, pm, security, compliance-execution, lifecycle, onboarding-v2) are namespaced under their feature directories for better ownership.

---

## 3. Core Logic / Engines / Compliance (Tier 1)

| Requested Path (Manifest / Old)                          | Actual Found Path                                              | Brief Note |
|----------------------------------------------------------|----------------------------------------------------------------|------------|
| src/lib/complianceEngine.ts or src/compliance/complianceEngine.ts | src/policy/compliance/complianceEngine.ts                     | Core compliance evaluation engine. |
| src/compliance/evaluateEvent.ts, useComplianceMap.ts     | src/policy/compliance/evaluateEvent.ts, index.ts, useComplianceMap.ts | Supporting compliance utilities + hook. |
| src/compliance-execution/* (full module)                 | src/policy/compliance-execution/* (all 17 files)               | **Major Tier 1 subsystem** — stateMachine, complianceExecutionStore, eventStateEvaluator, taskIdentity, useEventExecutionDataflow, adapters, supersedeChain, etc. Full CES runtime. |
| src/lib/enforcementEngine.ts or src/enforcement/*        | src/policy/enforcement/enforcementEngine.ts, escalationEngine.ts, useEnforcement.ts, types.ts, roleHierarchy.ts | Enforcement + escalation logic. |
| src/autogen/* or src/lib/autogen/*                       | src/policy/autogen/* (annualGenerator, triggerEngine, scheduler, conflictResolver, dependencyResolver, templateRegistry, types.ts) | Annual policy / event autogen engine. |
| src/lifecycle/*                                          | src/policy/lifecycle/* (lifecycleStore, stateMachine, lifecycleSeed, types, index) | Policy lifecycle state machine. |
| src/utils/nextDueDateEngine.ts, reminderEngine.ts        | src/policy/utils/nextDueDateEngine.ts, reminderEngine.ts, complianceClassification.ts, lifecycleGuards.ts, selectors.ts | Core scheduling / due date / classification engines. |
| src/services/complianceExecutionApi.ts                   | src/policy/services/complianceExecutionApi.ts, calendarApi.ts, policyLinkService.ts | API / service layer for compliance & calendar. |
| src/brad/*                                               | src/policy/brad/* (useBradWorkflow, workflowRuntime, etc.)     | Brad workflow orchestration. |
| src/ecign/*                                              | src/policy/ecign/* (useEcignSession, captureSignedFormSnapshot, validateRequiredFields, signerIdentity, etc.) | eCign signing + hash chain + PDF logic. |
| src/audit/*                                              | src/policy/audit/* (auditAggregate, exportReport, riskScoring, surveyPacket, workflowInstance, dependencyCheck) | Audit packet & risk engines. |
| src/artifacts/*                                          | src/policy/artifacts/* (artifactRoute, artifactToFormInstance) | Artifact routing & conversion. |
| src/pm/* (core logic)                                    | src/policy/pm/* (formInstancesCore.ts, taskProjection*.ts, sprint*, personalStore, selectedTaskStore, notification*, scheduling/, currentUser.ts, etc.) | PM / sprint / task projection core logic. |
| src/data/* (many generated + seed)                       | src/policy/data/* (masterControlInventory, regulatoryEvents, workflow*, formsLibrary*, achc*, extractedSeedArrays, policyContentMap, etc.) | Data seeds, generated crosswalks, regulatory event definitions. |
| (any) src/lib/* or src/app/* engines                     | NOT FOUND                                                      | Legacy roots absent. Logic fully migrated under `src/policy/`. |

**Key Engine Entry Points:**  
- Compliance: `src/policy/compliance/complianceEngine.ts` + full `compliance-execution/` module  
- Enforcement: `src/policy/enforcement/enforcementEngine.ts`  
- Autogen: `src/policy/autogen/triggerEngine.ts` + scheduler  
- Due dates: `src/policy/utils/nextDueDateEngine.ts`

---

## 4. Config / Feature Flags / Permissions (Tier 1)

| Requested Path (Manifest / Old)                  | Actual Found Path                                              | Brief Note |
|--------------------------------------------------|----------------------------------------------------------------|------------|
| src/config/* or src/lib/config/*                 | NOT FOUND (no top-level src/config)                            | Config colocated in feature modules. |
| src/featureFlags.ts or src/store/featureFlags    | src/policy/pm/featureFlags.ts                                  | Primary feature flag + env config (VITE_*, demo bypasses, etc.). |
| src/permissions.ts or src/lib/permissions        | src/policy/auth/permissions.ts + src/policy/security/permissions.ts + src/policy/security/features/featureAccess.ts | Role/permission matrix + feature access catalog (`canViewFeature`, `canPerformAction`). |
| src/security/features/*                          | src/policy/security/features/ (catalog.ts, featureAccess.ts, types.ts) + 9 files under features/ | Complete RBAC + feature gating system. |
| src/pm/featureFlags.ts (correct)                 | src/policy/pm/featureFlags.ts                                  | Confirmed location. |
| Root build configs (frequently mis-referenced)   | vite.config.ts, tailwind.config.js, tsconfig*.json, eslint.config.js, postcss.config.js (all at repo root) | Build + styling + TS config. |
| package.json / vercel.json                       | package.json, vercel.json (root)                               | Scripts, dependencies, deploy config. Also duplicated in some `context/` snapshots. |
| Approved users / runtime config                  | config/approved-users.csv.example (root config/)               | Example config; runtime often uses localStorage or env. |
| CES theme / mode config                          | src/policy/ces/theme.ts, cesExecutionMode.ts, cesReviewMode.ts, cesRoles.ts | CES-specific theming and role config. |
| Onboarding / security identity config            | src/policy/onboarding-v2/catalog/*, src/policy/security/identity/* | Catalog + identity stores & pages. |

**Config Pattern:** No monolithic `src/config/` or `src/lib/`. Feature-specific configuration lives next to the code that consumes it (pm/, security/features/, ces/, onboarding-v2/).

---

## 5. Other Notable Tier 1 / Cross-Cutting Locations

- **Main App Shell / Router**: `src/App.tsx`, `src/policy/PolicyCommandCenterApp.tsx`, `src/policy/components/CommandCenterLayout.tsx`, `src/auth/ProtectedRoute.tsx`
- **UI Primitives**: `src/policy/components/ui/` (30+ files: GlassPanel, Shell*, Tabs, etc.) + `src/components/TravelightBG.tsx`
- **Regulatory / Event Components**: `src/policy/components/regulatory/` (WorkflowExecutionPanel, EventWorkspace, Timeline*, etc.)
- **Evidence**: `src/policy/evidence/` (model, hierarchy, storage adapters)
- **Staging / Prototypes**: `src/ui-staging/` (empty / reserved)
- **Generated / Heavy Data**: `src/policy/data/` (many `.generated.ts` files — ACHC crosswalks, survey tags, workflows, etc.)
- **Server / API (not client)**: `server/` (identity, audit, ecign, routes) — outside src/

---

## Verification Methodology Used

1. `list_dir` on `src/`, `src/policy/`, all subfolders (pages, stores, compliance*, ces, journey, staffing, pm, onboarding-v2, security, etc.).
2. Recursive `find` for `*Page*.tsx`, `*Store*.ts`, `*compliance*`, `*engine*`, `*flag*`.
3. Direct `list_dir` confirmation that legacy roots (`src/pages`, `src/store`, `src/lib`, `src/app`) return errors / do not exist.
4. Cross-reference against `QA_UAT_FILE_MAP.md`, `claude-context-summary.md`, `file-tree.txt`, and actual source reads.
5. All "requested" examples from prior agent prompts / manifests (DashboardPage, MasterCalendarPage, stores, compliance engines) successfully located under the `src/policy/` architecture.

## Recommendations for Future Manifests / Agents

- **Always prefix with `src/policy/`** for application code.
- Domain subfolders (`/ces/`, `/journey/`, `/staffing/`, `/pm/`, `/onboarding-v2/`, `/compliance-execution/`, `/security/`) contain their own pages/stores/logic.
- Use `grep` + `find` or `list_dir` before assuming any path.
- Primary stores = `src/policy/stores/`; secondary colocated.
- Compliance/CES heart = `src/policy/compliance/` + `src/policy/compliance-execution/`.

**End of Tier 1 Discovery Report.** All requested files successfully mapped. No critical items remain at legacy paths.

---
*Generated by Discovery Agent — 16-agent extraction team. Output written to: `_Heavy/Fix-2026-05-14/___claudeMCP/_real-file-locations.md`*