# 03 — App Routes and Navigation

**Generated:** 2026-05-12
**Source file:** `src/App.tsx`

---

## Architecture Overview

The app uses **React Router DOM v7** with `BrowserRouter`. Routes are defined in a single file (`App.tsx`). All page components are **lazy-loaded** via `React.lazy()` + `Suspense` for code splitting.

**Two layout tiers:**
1. **Outside layout shell** — print pages, standalone viewers, auth pages
2. **Inside `CommandCenterLayout`** — all authenticated main app pages (sidebar + header)

**Auth guard:** `ProtectedRoute` wraps all authenticated routes. If not authenticated, redirects to `/login`.

```mermaid
graph TD
    A[BrowserRouter] --> B{Route}
    B --> C[Public print routes - no auth]
    B --> D[Auth pages - PublicAuthRoute]
    B --> E[ProtectedRoute + CommandCenterLayout]
    E --> F[Main App Routes]
    C --> G[/print/:policyId]
    C --> H[/print/GV-GB-001]
    C --> I[/forms/:formId/print]
    D --> J[/login /register /check-email]
    D --> K[/forgot-password /reset-password]
```

---

## Entry Point

| File | Purpose |
|---|---|
| `src/main.tsx` | React DOM `createRoot` + `AuthProvider` wrapper |
| `src/App.tsx` | `BrowserRouter` + all route definitions |
| `src/auth/AuthProvider.tsx` | Auth context (wraps entire tree) |

**App initialization:** `useEffect(() => initializeApp(), [])` runs on mount from `src/policy/utils/appInitializer.ts`.

---

## Route-to-Component Map

### Public Routes (No Auth Required)

| Route | Component | File | Notes |
|---|---|---|---|
| `/` | `EntryRoute` | inline | Redirects to `/dashboard` if auth, `/login` if not |
| `/login` | `LoginPage` | `src/auth/pages/LoginPage.tsx` | Redirects to `/dashboard` if already auth |
| `/register` | `RegisterPage` | `src/auth/pages/RegisterPage.tsx` | |
| `/check-email` | `CheckEmailPage` | `src/auth/pages/CheckEmailPage.tsx` | |
| `/setup-account` | `SetupAccountPage` | `src/auth/pages/SetupAccountPage.tsx` | |
| `/forgot-password` | `ForgotPasswordPage` | `src/auth/pages/ForgotPasswordPage.tsx` | |
| `/reset-password` | `ResetPasswordPage` | `src/auth/pages/ResetPasswordPage.tsx` | |
| `/set-new-password` | `SetNewPasswordPage` | `src/auth/pages/SetNewPasswordPage.tsx` | |

### Print Routes (Outside Layout Shell, Auth Optional)

| Route | Component | File | Notes |
|---|---|---|---|
| `/print/GV-GB-001/appendix/:appendixId` | `GVGBAppendixPrint` | `src/policy/pages/GVGBAppendixPrint.tsx` | Standalone print |
| `/print/GV-GB-001` | `GVGBPrintDocument` | `src/policy/pages/GVGBPrintDocument.tsx` | Full document print |
| `/print/:policyId` | `PrintPage` | `src/policy/pages/PrintPage.tsx` | Generic policy print |
| `/forms/:formId/print` | `FormPrintView` | `src/policy/pages/FormPrintView.tsx` | Form print view |
| `/surveyor/policy/:policyId` | `SurveyorPolicyViewerPage` | `src/policy/pages/SurveyorPolicyViewerPage.tsx` | Protected |

### Hidden Executive Route (No Layout)

| Route | Component | File | Notes |
|---|---|---|---|
| `/brad-proposal` | `BradProposalPage` | `src/policy/pages/BradProposal/index.tsx` | Hidden, accessed via Brad corner trigger |

---

### Authenticated Routes (Inside `CommandCenterLayout`)

#### Dashboard

| Route | Component | File |
|---|---|---|
| `/dashboard` | `DashboardPage` | `src/policy/pages/DashboardPage.tsx` |

#### Calendar & Event Execution

| Route | Component | File | Notes |
|---|---|---|---|
| `/calendar` | `MasterCalendarPage` | `src/policy/pages/MasterCalendarPage.tsx` | |
| `/calendar/event/:eventId` | `MobileIncidentExecutionPage` | `src/policy/pages/MobileIncidentExecutionPage.tsx` | stage="event" |
| `/calendar/event/:eventId/workflow` | `MobileIncidentExecutionPage` | same | stage="workflow" |
| `/calendar/event/:eventId/task/:taskId` | `MobileIncidentExecutionPage` | same | stage="task" |
| `/calendar/event/:eventId/evidence/:taskId` | `MobileIncidentExecutionPage` | same | stage="evidence" |
| `/calendar/event/:eventId/approval` | `MobileIncidentExecutionPage` | same | stage="approval" |

#### Audit & Evidence

| Route | Component | File |
|---|---|---|
| `/audit` | `AuditModePage` | `src/policy/pages/AuditModePage.tsx` |
| `/evidence` | `EvidenceCenterPage` | `src/policy/pages/EvidenceCenterPage.tsx` |

#### Policy Library

| Route | Component | File | Notes |
|---|---|---|---|
| `/library` | `LibraryPage` | `src/policy/pages/LibraryPage.tsx` | |
| `/library/:policyId` | `PolicyDetailPage` | `src/policy/pages/PolicyDetailPage.tsx` | |
| `/policies/:policyId` | `PolicyDetailPage` | same | Alternate path |

#### Policy Lifecycle

| Route | Component | File | Notes |
|---|---|---|---|
| `/policy-lifecycle` | `PolicyLifecyclePage` | `src/policy/pages/PolicyLifecyclePage.tsx` | Unified draft/review/approve |
| `/policy-lifecycle/:policyId` | `PolicyLifecyclePage` | same | |
| `/drafts` | redirect | → `/policy-lifecycle?stage=DRAFT` | legacy redirect |
| `/drafts/:policyId` | redirect | → `/policy-lifecycle` | legacy redirect |
| `/review` | redirect | → `/policy-lifecycle?stage=REVIEW` | legacy redirect |
| `/publish` | redirect | → `/policy-lifecycle?stage=APPROVED` | legacy redirect |

#### Framework, Taxonomy, Governance

| Route | Component | File |
|---|---|---|
| `/taxonomy` | `TaxonomyPage` | `src/policy/pages/TaxonomyPage.tsx` |
| `/framework` | `FrameworkPage` | `src/policy/pages/FrameworkPage.tsx` |
| `/framework/achc-survey` | `AchcSurveyAlignmentPage` | `src/policy/pages/AchcSurveyAlignmentPage.tsx` |
| `/governance` | `GovernancePage` | `src/policy/pages/GovernancePage.tsx` |

#### Forms

| Route | Component | File |
|---|---|---|
| `/forms` | `FormsPage` | `src/policy/pages/FormsPage.tsx` |
| `/forms/:formId` | `FormViewer` | `src/policy/components/FormViewer.tsx` |

#### Artifacts & Reference Viewer

| Route | Component | File |
|---|---|---|
| `/artifacts/:artifactId` | `ArtifactViewerPage` | `src/policy/pages/ArtifactViewerPage.tsx` |
| `/viewer/:referenceId` | `GenericReferenceViewer` | `src/policy/pages/GenericReferenceViewer.tsx` |
| `/events/:referenceId` | `GenericReferenceViewer` | same |
| `/tasks/:referenceId` | `GenericReferenceViewer` | same |

#### iAdministrator (Brad AI)

| Route | Component | File |
|---|---|---|
| `/iadministrator` | `IAdministratorPage` | `src/policy/pages/iAdministrator/index.tsx` |

#### Admin (Role-Gated via `AdminRouteGuard`)

| Route | Component | File | Notes |
|---|---|---|---|
| `/admin` | redirect | → `/admin/user-groups` | |
| `/admin/user-groups` | `UserGroupsPage` | `src/policy/security/identity/UserGroupsPage.tsx` | AdminRouteGuard |
| `/admin/roles` | `AdminRolesPage` | `src/policy/security/identity/AdminRolesPage.tsx` | AdminRouteGuard |
| `/admin/permissions` | `PermissionCatalogPage` | `src/policy/security/identity/PermissionCatalogPage.tsx` | AdminRouteGuard |
| `/admin/users` | `UserAssignmentsPage` | `src/policy/security/identity/UserAssignmentsPage.tsx` | AdminRouteGuard |
| `/security/identity` | redirect | → `/security/identity/user-groups` | legacy |
| `/security/identity/user-groups` | redirect | → `/admin/user-groups` | legacy |
| `/security/identity/permission-catalog` | redirect | → `/admin/permissions` | legacy |
| `/security/identity/user-assignments` | redirect | → `/admin/users` | legacy |

#### Workflows

| Route | Component | File | Notes |
|---|---|---|---|
| `/workflows/*` | `WorkflowLibraryApp` | `src/policy/workflows/WorkflowLibraryApp.tsx` | Nested routing inside |

#### Compliance / Master Controls

| Route | Component | File |
|---|---|---|
| `/compliance/master-controls` | `MasterControlInventoryPage` | `src/policy/pages/MasterControlInventoryPage.tsx` |

#### Hubstaff (Staging)

| Route | Component | File |
|---|---|---|
| `/hubstaff` | `HubstaffStagingPage` | `src/policy/pages/HubstaffStagingPage.tsx` |

#### Journey / LMS

| Route | Component | File |
|---|---|---|
| `/journey` | `JourneyHomePage` | `src/policy/journey/pages/JourneyHomePage.tsx` |
| `/journey/v1-journey` | `OnboardingV1JourneyPage` | `src/policy/journey/pages/OnboardingV1JourneyPage.tsx` |
| `/journey/appendix-f` | `AppendixFPage` | `src/policy/journey/pages/AppendixFPage.tsx` |
| `/journey/module/:moduleId` | `ModulePlayerPage` | `src/policy/journey/pages/ModulePlayerPage.tsx` |
| `/journey/supervisor` | `SupervisorPage` | `src/policy/journey/pages/SupervisorPage.tsx` |
| `/journey/admin` | `AdminPage` | `src/policy/journey/pages/AdminPage.tsx` |
| `/journey/guide` | `UserGuidePage` | `src/policy/journey/pages/UserGuidePage.tsx` |
| `/journey/staging/m01` | `StagingM01Page` | `src/policy/journey/pages/StagingM01Page.tsx` |

#### Onboarding V2

| Route | Component | File | Notes |
|---|---|---|---|
| `/onboarding-v2` | redirect | → `/onboarding-v2/dashboard` | nested layout |
| `/onboarding-v2/dashboard` | `OnboardingV2Dashboard` | `src/policy/onboarding-v2/pages/DashboardPage.tsx` | |
| `/onboarding-v2/activate` | `OnboardingV2Activation` | `src/policy/onboarding-v2/pages/ActivationPage.tsx` | |
| `/onboarding-v2/batches` | `OnboardingV2BatchList` | `src/policy/onboarding-v2/pages/BatchListPage.tsx` | |
| `/onboarding-v2/batches/:batchId` | `OnboardingV2BatchView` | `src/policy/onboarding-v2/pages/BatchViewPage.tsx` | |
| `/onboarding-v2/audit` | `OnboardingV2Audit` | `src/policy/onboarding-v2/pages/AuditReadinessPage.tsx` | |
| `/onboarding-v2/governance` | `OnboardingV2Governance` | `src/policy/onboarding-v2/pages/GovernancePage.tsx` | |

#### Help Center

| Route | Component | File |
|---|---|---|
| `/help/*` | `HelpCenterPage` | `src/policy/help/HelpCenterPage.tsx` |

#### System Documentation

| Route | Component | File | Notes |
|---|---|---|---|
| `/system-documentation` | redirect | → `/system-documentation/executive-overview` | |
| `/system-documentation/:sectionId` | `SystemDocumentationPage` | `src/policy/pages/SystemDocumentationPage.tsx` | In-app system docs |

#### CES (Compliance Execution Sprints)

| Route | Component | File | Notes |
|---|---|---|---|
| `/ces` | redirect | → `/ces/dashboard` | |
| `/ces/dashboard` | `CesDashboardPage` | `src/policy/ces/pages/CesDashboardPage.tsx` | |
| `/ces/board` | `CesBoardPage` | `src/policy/ces/pages/CesBoardPage.tsx` | |
| `/ces/calendar` | redirect | → `/calendar?view=sprint` | Sprint calendar merged into Master Calendar |
| `/ces/workloads` | `CesWorkloadsPage` | `src/policy/ces/pages/CesWorkloadsPage.tsx` | |
| `/ces/reports` | `CesReportsPage` | `src/policy/ces/pages/CesReportsPage.tsx` | |
| `/my-tasks` | `MyTasksPage` | `src/policy/ces/pages/MyTasksPage.tsx` | |
| `/ces/my-tasks` | redirect | → `/my-tasks` | |

#### PM Layer

| Route | Component | File |
|---|---|---|
| `/pm` | redirect | → `/pm/my-tasks` | |
| `/pm/my-tasks` | `MyTasksPmPage` | `src/policy/components/pm/MyTasksPmPage.tsx` |
| `/pm/sprint-plan` | `SprintPlanPage` | `src/policy/components/pm/SprintPlanPage.tsx` |
| `/pm/sprint-review` | `SprintReviewPage` | `src/policy/components/pm/SprintReviewPage.tsx` |
| `/pm/approvals` | `ApprovalsQueuePage` | `src/policy/components/pm/ApprovalsQueuePage.tsx` |
| `/pm/dashboard` | `PmDashboardPage` | `src/policy/components/pm/PmDashboardPage.tsx` |

#### Demo

| Route | Component | File |
|---|---|---|
| `/demo` | `DemoPage` | `src/policy/pages/DemoPage.tsx` |

#### Catch-All

| Route | Behavior |
|---|---|
| `*` (unmatched) | Redirects to `/dashboard` |

---

## Layout Components

| Component | File | Role |
|---|---|---|
| `CommandCenterLayout` | `src/policy/components/CommandCenterLayout.tsx` | Main shell: sidebar + header + content area |
| `AppShell` | Inline in `App.tsx` | Outer wrapper; shows `AppLoader` while auth loading |
| `OnboardingV2Layout` | `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` | Nested layout for `/onboarding-v2/*` |
| `CesLayout` | `src/policy/ces/layouts/CesLayout.tsx` | Optional CES sub-layout |

---

## Navigation Notes

- Sidebar nav is controlled by `CommandCenterLayout` — actual nav items not inspected but likely driven by `navStore.ts`
- `UniversalNavControls.tsx` provides navigation controls (possibly breadcrumbs or top controls)
- Route `navExclusions.ts` utility exists to exclude certain routes from nav rendering

---

## Route Health Issues

| Issue | Detail |
|---|---|
| `/ces/calendar` is merged | Redirect to `/calendar?view=sprint` — CES calendar no longer standalone |
| Legacy `/drafts`, `/review`, `/publish` | Redirects in place for one release cycle — should be removed eventually |
| Legacy `/security/identity/*` | Redirects to `/admin/*` — should be removed eventually |
| `DemoPhase2` and `DemoPhase3` pages exist in `src/policy/pages/` | Not routed in App.tsx — orphaned page components |
| `CLPolicyDetailView.tsx`, `GVGBDetailView.tsx`, `GVPolicyDetailView.tsx` | Exist in pages/ but not directly routed — likely opened as modals |
| No `404 page` | Unmatched routes silently redirect to `/dashboard` |
