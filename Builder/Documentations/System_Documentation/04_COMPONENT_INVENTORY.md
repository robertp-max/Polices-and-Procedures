# 04 — Component Inventory

**Generated:** 2026-05-12

---

## Layout / Shell Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `CommandCenterLayout` | `src/policy/components/CommandCenterLayout.tsx` | Main app shell with sidebar, header, content area | Active |
| `AppShell` | `src/App.tsx` (inline) | Auth-aware outer wrapper | Active |
| `OnboardingV2Layout` | `src/policy/onboarding-v2/pages/OnboardingV2Layout.tsx` | Nested layout for onboarding-v2 | Active |
| `CesLayout` | `src/policy/ces/layouts/CesLayout.tsx` | CES sub-layout | Active |
| `TravelightBG` | `src/components/TravelightBG.tsx` | Background component | Active (unclear usage) |

---

## Page Components (Top-Level)

| Component | Route | File | Status | Notes |
|---|---|---|---|---|
| `DashboardPage` | `/dashboard` | `src/policy/pages/DashboardPage.tsx` | Active | |
| `LibraryPage` | `/library` | `src/policy/pages/LibraryPage.tsx` | Active | |
| `PolicyDetailPage` | `/library/:policyId` | `src/policy/pages/PolicyDetailPage.tsx` | Active | |
| `PolicyLifecyclePage` | `/policy-lifecycle` | `src/policy/pages/PolicyLifecyclePage.tsx` | Active | Unified lifecycle |
| `TaxonomyPage` | `/taxonomy` | `src/policy/pages/TaxonomyPage.tsx` | Active | |
| `TaxonomyPage.old.tsx` | (none) | `src/policy/pages/TaxonomyPage.old.tsx` | Deprecated | Old version |
| `GovernancePage` | `/governance` | `src/policy/pages/GovernancePage.tsx` | Active | |
| `MasterCalendarPage` | `/calendar` | `src/policy/pages/MasterCalendarPage.tsx` | Active | |
| `MobileIncidentExecutionPage` | `/calendar/event/:eventId` | `src/policy/pages/MobileIncidentExecutionPage.tsx` | Active | Multi-stage (event/workflow/task/evidence/approval) |
| `AuditModePage` | `/audit` | `src/policy/pages/AuditModePage.tsx` | Active | |
| `EvidenceCenterPage` | `/evidence` | `src/policy/pages/EvidenceCenterPage.tsx` | Active | |
| `FormsPage` | `/forms` | `src/policy/pages/FormsPage.tsx` | Active | |
| `FrameworkPage` | `/framework` | `src/policy/pages/FrameworkPage.tsx` | Active | |
| `AchcSurveyAlignmentPage` | `/framework/achc-survey` | `src/policy/pages/AchcSurveyAlignmentPage.tsx` | Active | |
| `ArtifactViewerPage` | `/artifacts/:artifactId` | `src/policy/pages/ArtifactViewerPage.tsx` | Active | |
| `GenericReferenceViewer` | `/viewer/:referenceId` | `src/policy/pages/GenericReferenceViewer.tsx` | Active | |
| `MasterControlInventoryPage` | `/compliance/master-controls` | `src/policy/pages/MasterControlInventoryPage.tsx` | Active | |
| `HubstaffStagingPage` | `/hubstaff` | `src/policy/pages/HubstaffStagingPage.tsx` | Staging | |
| `DemoPage` | `/demo` | `src/policy/pages/DemoPage.tsx` | Demo | |
| `DemoPhase2` | (unrouted) | `src/policy/pages/DemoPhase2.tsx` | Orphaned | Not in App.tsx routes |
| `DemoPhase3` | (unrouted) | `src/policy/pages/DemoPhase3.tsx` | Orphaned | Not in App.tsx routes |
| `DashboardPage.tsx.backup` | (none) | `src/policy/pages/DashboardPage.tsx.backup` | Deprecated | Orphaned backup |
| `MasterCalendarPage.tsx.backup` | (none) | `src/policy/pages/MasterCalendarPage.tsx.backup` | Deprecated | Orphaned backup |
| `SystemDocumentationPage` | `/system-documentation/:sectionId` | `src/policy/pages/SystemDocumentationPage.tsx` | Active | In-app docs |

---

## Print / Standalone Page Components

| Component | Route | File | Status |
|---|---|---|---|
| `PrintPage` | `/print/:policyId` | `src/policy/pages/PrintPage.tsx` | Active |
| `GVGBPrintDocument` | `/print/GV-GB-001` | `src/policy/pages/GVGBPrintDocument.tsx` | Active |
| `GVGBAppendixPrint` | `/print/GV-GB-001/appendix/:appendixId` | `src/policy/pages/GVGBAppendixPrint.tsx` | Active |
| `FormPrintView` | `/forms/:formId/print` | `src/policy/pages/FormPrintView.tsx` | Active |
| `SurveyorPolicyViewerPage` | `/surveyor/policy/:policyId` | `src/policy/pages/SurveyorPolicyViewerPage.tsx` | Active |

---

## Auth Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `AuthProvider` | `src/auth/AuthProvider.tsx` | Auth context, Cognito + demo bypass | Active |
| `ProtectedRoute` | `src/auth/ProtectedRoute.tsx` | Route auth guard | Active |
| `AuthCard` | `src/auth/components/AuthCard.tsx` | UI wrapper for auth forms | Active |
| `LoginPage` | `src/auth/pages/LoginPage.tsx` | Login form | Active |
| `RegisterPage` | `src/auth/pages/RegisterPage.tsx` | Registration form | Active |
| `CheckEmailPage` | `src/auth/pages/CheckEmailPage.tsx` | Post-register email check prompt | Active |
| `SetupAccountPage` | `src/auth/pages/SetupAccountPage.tsx` | Account setup after registration | Active |
| `ForgotPasswordPage` | `src/auth/pages/ForgotPasswordPage.tsx` | Password reset request | Active |
| `ResetPasswordPage` | `src/auth/pages/ResetPasswordPage.tsx` | Reset password landing | Active |
| `SetNewPasswordPage` | `src/auth/pages/SetNewPasswordPage.tsx` | Set new password (after Cognito challenge) | Active |

---

## CES Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `CesDashboardPage` | `src/policy/ces/pages/CesDashboardPage.tsx` | CES executive dashboard | Active |
| `CesBoardPage` | `src/policy/ces/pages/CesBoardPage.tsx` | Sprint kanban board | Active |
| `CesWorkloadsPage` | `src/policy/ces/pages/CesWorkloadsPage.tsx` | Workload distribution | Active |
| `CesReportsPage` | `src/policy/ces/pages/CesReportsPage.tsx` | Executive reports | Active |
| `MyTasksPage` | `src/policy/ces/pages/MyTasksPage.tsx` | Current user task list | Active |
| `CesCalendarPage` | `src/policy/ces/pages/CesCalendarPage.tsx` | (not routed — redirected to /calendar) | Referenced / not connected |
| `CesExecutiveDashboard` | `src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx` | Dashboard sub-component | Active |
| `SprintExecutionBoard` | `src/policy/ces/components/board/SprintExecutionBoard.tsx` | Sprint board view | Active |
| `ExecutionUnitCard` | `src/policy/ces/components/board/ExecutionUnitCard.tsx` | Sprint card | Active |
| `ComplianceCalendar` | `src/policy/ces/components/calendar/ComplianceCalendar.tsx` | Calendar sub-component | Active |
| `WorkflowDrawer` (CES) | `src/policy/ces/components/details/WorkflowDrawer.tsx` | Workflow detail drawer | Active |
| `SprintTaskPanel` | `src/policy/ces/components/details/SprintTaskPanel.tsx` | Task detail panel | Active |
| `ExecutiveReports` | `src/policy/ces/components/reports/ExecutiveReports.tsx` | Reports view | Active |
| `CesRoleReviewSwitcher` | `src/policy/ces/components/review/CesRoleReviewSwitcher.tsx` | Role-based review switcher | Active |
| `RobertCesReviewLayer` | `src/policy/ces/components/review/RobertCesReviewLayer.tsx` | Role-specific review layer | Active (persona-named) |
| `WorkloadDistribution` | `src/policy/ces/components/workloads/WorkloadDistribution.tsx` | Workload view | Active |

---

## PM Layer Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `MyTasksPmPage` | `src/policy/components/pm/MyTasksPmPage.tsx` | PM task list | Active |
| `SprintPlanPage` | `src/policy/components/pm/SprintPlanPage.tsx` | Sprint planning | Active |
| `SprintReviewPage` | `src/policy/components/pm/SprintReviewPage.tsx` | Sprint review | Active |
| `ApprovalsQueuePage` | `src/policy/components/pm/ApprovalsQueuePage.tsx` | Approvals queue | Active |
| `PmDashboardPage` | `src/policy/components/pm/PmDashboardPage.tsx` | PM dashboard | Active |
| `PmTaskCard` | `src/policy/components/pm/PmTaskCard.tsx` | Task card | Active |
| `PmFilterBar` | `src/policy/components/pm/PmFilterBar.tsx` | Filter controls | Active |
| `PmViews` | `src/policy/components/pm/PmViews.tsx` | View switcher | Active |
| `GlobalTaskDrawer` | `src/policy/components/pm/GlobalTaskDrawer.tsx` | Global right-panel task drawer | Active |
| `TaskDetailRightPanel` | `src/policy/components/pm/TaskDetailRightPanel.tsx` | Task detail panel | Active |
| `NotificationCenter` | `src/policy/components/pm/NotificationCenter.tsx` | Notification UI | Active |
| `EventTaskList` | `src/policy/components/pm/EventTaskList.tsx` | Event-based task list | Active |
| `EntityLink` | `src/policy/components/pm/EntityLink.tsx` | Entity navigation link | Active |
| `SprintScopeToolbar` | `src/policy/components/pm/SprintScopeToolbar.tsx` | Sprint scope controls | Active |

---

## iAdministrator (Brad AI) Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `IAdministratorPage` | `src/policy/pages/iAdministrator/index.tsx` | Main Brad AI page | Active |
| `ChatThread` | `src/policy/pages/iAdministrator/components/ChatThread.tsx` | Chat UI | Active |
| `CommandBar` | `src/policy/pages/iAdministrator/components/CommandBar.tsx` | Command input bar | Active |
| `StructuredAnswer` | `src/policy/pages/iAdministrator/components/StructuredAnswer.tsx` | AI response display | Active |
| `ScenarioResponse` | `src/policy/pages/iAdministrator/components/ScenarioResponse.tsx` | Scenario-specific response | Active |
| `ScenarioActionSections` | `src/policy/pages/iAdministrator/components/ScenarioActionSections.tsx` | Action item sections | Active |
| `CitationChips` | `src/policy/pages/iAdministrator/components/CitationChips.tsx` | Policy citation chips | Active |
| `ReferenceCards` | `src/policy/pages/iAdministrator/components/ReferenceCards.tsx` | Policy reference display | Active |
| `ReferenceLink` | `src/policy/pages/iAdministrator/components/ReferenceLink.tsx` | Policy link | Active |
| `ReferenceText` | `src/policy/pages/iAdministrator/components/ReferenceText.tsx` | Reference text display | Active |
| `BradHelpCenter` | `src/policy/pages/iAdministrator/components/BradHelpCenter.tsx` | Help content | Active |
| `ActiveCasePanel` | `src/policy/pages/iAdministrator/components/ActiveCasePanel.tsx` | Active case/event panel | Active |
| `AvailableActions` | `src/policy/pages/iAdministrator/components/AvailableActions.tsx` | Quick action buttons | Active |
| `RegulatoryAlerts` | `src/policy/pages/iAdministrator/components/RegulatoryAlerts.tsx` | Regulatory alert display | Active |
| `RequirementsSnapshot` | `src/policy/pages/iAdministrator/components/RequirementsSnapshot.tsx` | Requirements overview | Active |
| `RightPanelPreview` | `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` | Right panel preview | Active |
| `RiskBadge` | `src/policy/pages/iAdministrator/components/RiskBadge.tsx` | Risk indicator | Active |
| `StudioTabs` | `src/policy/pages/iAdministrator/components/StudioTabs.tsx` | Tab navigation | Active |
| `HealthStrip` | `src/policy/pages/iAdministrator/components/HealthStrip.tsx` | Compliance health indicators | Active |
| `EmergencyBanner` | `src/policy/pages/iAdministrator/components/EmergencyBanner.tsx` | Emergency alert banner | Active |
| `OperationalGaps` | `src/policy/pages/iAdministrator/components/OperationalGaps.tsx` | Gap analysis display | Active |
| `NoAnswer` | `src/policy/pages/iAdministrator/components/NoAnswer.tsx` | No-answer fallback UI | Active |
| `FormRenderer` | `src/policy/pages/iAdministrator/components/FormRenderer.tsx` | Form rendering within IA | Active |
| `DemoCriticalEmergencyResponse` | `src/policy/pages/iAdministrator/components/DemoCriticalEmergencyResponse.tsx` | Demo: critical emergency | Demo |
| `DemoCriticalOrchestrationPanel` | `src/policy/pages/iAdministrator/components/DemoCriticalOrchestrationPanel.tsx` | Demo: orchestration panel | Demo |

---

## Journey / LMS Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `JourneyHomePage` | `src/policy/journey/pages/JourneyHomePage.tsx` | Journey home/landing | Active |
| `ModulePlayerPage` | `src/policy/journey/pages/ModulePlayerPage.tsx` | Training module player | Active |
| `OnboardingV1JourneyPage` | `src/policy/journey/pages/OnboardingV1JourneyPage.tsx` | Legacy V1 journey | Partial/legacy |
| `StagingM01Page` | `src/policy/journey/pages/StagingM01Page.tsx` | M01 cinematic prototype | Staging |
| `AppendixFPage` | `src/policy/journey/pages/AppendixFPage.tsx` | Appendix F viewer | Active |
| `SupervisorPage` | `src/policy/journey/pages/SupervisorPage.tsx` | Supervisor dashboard | Active |
| `AdminPage` | `src/policy/journey/pages/AdminPage.tsx` | Journey admin | Active |
| `UserGuidePage` | `src/policy/journey/pages/UserGuidePage.tsx` | User guide | Active |
| `ScormPlayer` | `src/policy/journey/components/ScormPlayer.tsx` | SCORM content player | Active |
| `ModuleCard` | `src/policy/journey/components/ModuleCard.tsx` | Module listing card | Active |
| `SignaturePad` | `src/policy/journey/components/SignaturePad.tsx` | Signature capture | Active |
| `EvidenceCapture` | `src/policy/journey/components/EvidenceCapture.tsx` | Evidence capture | Active |
| `GateBanner` | `src/policy/journey/components/GateBanner.tsx` | Gate/prerequisite banner | Active |
| `PhaseRail` | `src/policy/journey/components/PhaseRail.tsx` | Phase progress rail | Active |
| `StatusChip` | `src/policy/journey/components/StatusChip.tsx` | Status chip display | Active |
| `EmployeePicker` | `src/policy/journey/components/EmployeePicker.tsx` | Employee selection | Active |

---

## Onboarding V2 Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `OnboardingV2Dashboard` | `src/policy/onboarding-v2/pages/DashboardPage.tsx` | Onboarding dashboard | Active |
| `ActivationPage` | `src/policy/onboarding-v2/pages/ActivationPage.tsx` | Activation flow | Active |
| `BatchListPage` | `src/policy/onboarding-v2/pages/BatchListPage.tsx` | Onboarding batch list | Active |
| `BatchViewPage` | `src/policy/onboarding-v2/pages/BatchViewPage.tsx` | Batch detail view | Active |
| `AuditReadinessPage` | `src/policy/onboarding-v2/pages/AuditReadinessPage.tsx` | Audit readiness dashboard | Active |
| `GovernancePage` (onboarding-v2) | `src/policy/onboarding-v2/pages/GovernancePage.tsx` | Governance view | Active |
| `UnitDrawer` | `src/policy/onboarding-v2/components/UnitDrawer.tsx` | Onboarding unit detail | Active |
| `GateTile` | `src/policy/onboarding-v2/components/GateTile.tsx` | Gate status tile | Active |
| `SignerStrip` | `src/policy/onboarding-v2/components/SignerStrip.tsx` | Signer status row | Active |
| `AuditTimeline` | `src/policy/onboarding-v2/components/AuditTimeline.tsx` | Audit timeline display | Active |

---

## Security / Identity Components

| Component | File | Purpose | Status |
|---|---|---|---|
| `AdminRouteGuard` | `src/policy/security/identity/AdminRouteGuard.tsx` | Admin-only route guard | Active |
| `AccessDeniedPage` | `src/policy/security/identity/AccessDeniedPage.tsx` | Access denied page | Active |
| `UserGroupsPage` | `src/policy/security/identity/UserGroupsPage.tsx` | User group management | Active |
| `AdminRolesPage` | `src/policy/security/identity/AdminRolesPage.tsx` | Role management | Active |
| `PermissionCatalogPage` | `src/policy/security/identity/PermissionCatalogPage.tsx` | Permission catalog | Active |
| `UserAssignmentsPage` | `src/policy/security/identity/UserAssignmentsPage.tsx` | User-role assignments | Active |

---

## Shared UI Primitives (`src/policy/components/ui/`)

| Component | Purpose |
|---|---|
| `ActionButton` | Primary action button |
| `CiStatusBadge` | Status badge |
| `DataGrid` | Data grid |
| `EmptyState` | Empty state display |
| `GlassPanel` | Glass-morphism card |
| `PageHeader` | Page title + actions header |
| `RightDrawer` | Slide-in right panel |
| `SearchField` | Search input |
| `SectionHeader` | Section heading |
| `SurfaceCard` | Card surface |
| `Tabs` | Tab group |
| `ThemeModeToggle` | Dark/light mode toggle |
| `UtilityButton` | Secondary/utility button |

---

## Regulatory Components (`src/policy/components/regulatory/`)

| Component | Purpose | Notes |
|---|---|---|
| `EventWorkspace` | Event execution workspace | |
| `ApprovalFlow` | Approval flow UI | |
| `BlockerPanel` | Blocker display | |
| `EvidencePanel` | Evidence display | ⚠️ Same name as `onboarding-v2/components/EvidencePanel.tsx` |
| `WorkflowDrawer` | Workflow detail | ⚠️ Same name as `ces/components/details/WorkflowDrawer.tsx` |
| `WorkflowExecutionPanel` | Workflow execution | |
| `MonthGrid` | Month calendar grid | |
| `TimelineMonth` | Timeline month view | |
| `KpiTile` | KPI metric tile | ⚠️ Same name as `onboarding-v2/components/KpiTile.tsx` |
| `Toast` | Toast notifications | |
| `ModalShell` | Modal wrapper | |
| `LockBadge` | Lock indicator | |
| `EventChip` | Event chip | |
| `EventSyncControl` | Sync controls | |
| `HelpArticleView` | Help article | |
| `Primitives` | Shared primitives | |

---

## Onboarding Tour Components

| Component | File | Purpose |
|---|---|---|
| `BradTourAvatar` | `src/policy/components/onboarding/BradTourAvatar.tsx` | Brad avatar for tour |
| `GuidedTourGate` | `src/policy/components/onboarding/GuidedTourGate.tsx` | Tour gate logic |
| `GuidedTourOverlay` | `src/policy/components/onboarding/GuidedTourOverlay.tsx` | Tour overlay UI |
| `MissionPromptOverlay` | `src/policy/components/onboarding/MissionPromptOverlay.tsx` | Mission prompt |

---

## Key Non-Page Components

| Component | File | Purpose | Notes |
|---|---|---|---|
| `FormViewer` | `src/policy/components/FormViewer.tsx` | Form viewer (inline + print) | Routed at `/forms/:formId` |
| `FormSigningWorkspace` | `src/policy/components/FormSigningWorkspace.tsx` | Form signing flow | |
| `FormSignatureFlow` | `src/policy/components/FormSignatureFlow.tsx` | Signature step flow | |
| `FormSignatureContext` | `src/policy/components/FormSignatureContext.tsx` | Signature React context | |
| `MasterControlInventory` | `src/policy/components/MasterControlInventory.tsx` | MCI table component | |
| `PolicyDetailModal` | `src/policy/components/PolicyDetailModal.tsx` | Policy detail modal | |
| `SharedPolicyDetailView` | `src/policy/components/SharedPolicyDetailView.tsx` | Shared policy detail view | |
| `PolicyLibraryDocumentView` | `src/policy/components/PolicyLibraryDocumentView.tsx` | Library document view | |
| `CesEvidenceHierarchyPanel` | `src/policy/components/evidence/CesEvidenceHierarchyPanel.tsx` | Evidence hierarchy | |
| `ContextualKnowledgeBulb` | `src/policy/components/help/ContextualKnowledgeBulb.tsx` | Contextual help bulb | |
| `FrameworkShowcase` | `src/policy/components/FrameworkShowcase.tsx` | Framework display | |
| `DraftBanner` | `src/policy/components/DraftBanner.tsx` | Draft status banner | |
| `StatusBadge` | `src/policy/components/StatusBadge.tsx` | General status badge | |
| `UniversalNavControls` | `src/policy/components/UniversalNavControls.tsx` | Navigation controls | |
| `WorkflowLibraryApp` | `src/policy/workflows/WorkflowLibraryApp.tsx` | Workflow library SPA | |
| `BradProposalPage` | `src/policy/pages/BradProposal/index.tsx` | Executive demo proposal | Hidden route |
