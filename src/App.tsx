import { lazy, Suspense, useEffect, type PropsWithChildren, type ReactElement } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CommandCenterLayout } from '@/policy/components/CommandCenterLayout'
import { initializeApp } from '@/policy/utils/appInitializer'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { useAuth } from '@/auth/AuthProvider'

// ── Lazy-loaded page routes (code-split per route) ──────────────
const DashboardPage     = lazy(() => import('@/policy/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LibraryPage       = lazy(() => import('@/policy/pages/LibraryPage').then(m => ({ default: m.LibraryPage })))
const PolicyDetailPage  = lazy(() => import('@/policy/pages/PolicyDetailPage').then(m => ({ default: m.PolicyDetailPage })))
const TaxonomyPage      = lazy(() => import('@/policy/pages/TaxonomyPage').then(m => ({ default: m.TaxonomyPage })))
const GovernancePage    = lazy(() => import('@/policy/pages/GovernancePage').then(m => ({ default: m.GovernancePage })))
const MasterCalendarPage = lazy(() => import('@/policy/pages/MasterCalendarPage').then(m => ({ default: m.MasterCalendarPage })))
const MobileIncidentExecutionPage = lazy(() => import('@/policy/pages/MobileIncidentExecutionPage').then(m => ({ default: m.MobileIncidentExecutionPage })))
const AuditModePage      = lazy(() => import('@/policy/pages/AuditModePage').then(m => ({ default: m.AuditModePage })))
const EvidenceCenterPage = lazy(() => import('@/policy/pages/EvidenceCenterPage').then(m => ({ default: m.EvidenceCenterPage })))
const DemoPage          = lazy(() => import('@/policy/pages/DemoPage').then(m => ({ default: m.DemoPage })))
const FrameworkPage     = lazy(() => import('@/policy/pages/FrameworkPage').then(m => ({ default: m.FrameworkPage })))
const AchcSurveyAlignmentPage = lazy(() => import('@/policy/pages/AchcSurveyAlignmentPage').then(m => ({ default: m.AchcSurveyAlignmentPage })))
const FormsPage         = lazy(() => import('@/policy/pages/FormsPage').then(m => ({ default: m.FormsPage })))
const PrintPage         = lazy(() => import('@/policy/pages/PrintPage').then(m => ({ default: m.PrintPage })))
const SurveyorPolicyViewerPage = lazy(() => import('@/policy/pages/SurveyorPolicyViewerPage').then(m => ({ default: m.SurveyorPolicyViewerPage })))
const GVGBPrintDocument = lazy(() => import('@/policy/pages/GVGBPrintDocument').then(m => ({ default: m.GVGBPrintDocument })))
const GVGBAppendixPrint = lazy(() => import('@/policy/pages/GVGBAppendixPrint').then(m => ({ default: m.GVGBAppendixPrint })))
const FormViewer        = lazy(() => import('@/policy/components/FormViewer').then(m => ({ default: m.FormViewer })))
const IAdministratorPage = lazy(() => import('@/policy/pages/iAdministrator').then(m => ({ default: m.IAdministratorPage })))
const GenericReferenceViewer = lazy(() => import('@/policy/pages/GenericReferenceViewer').then(m => ({ default: m.GenericReferenceViewer })))
const BradProposalPage  = lazy(() => import('@/policy/pages/BradProposal').then(m => ({ default: m.BradProposalPage })))
const WorkflowLibraryApp    = lazy(() => import('@/policy/workflows/WorkflowLibraryApp').then(m => ({ default: m.WorkflowLibraryApp })))
const HubstaffStagingPage  = lazy(() => import('@/policy/pages/HubstaffStagingPage').then(m => ({ default: m.HubstaffStagingPage })))
const PolicyLifecyclePage  = lazy(() => import('@/policy/pages/PolicyLifecyclePage').then(m => ({ default: m.PolicyLifecyclePage })))
const FormPrintView        = lazy(() => import('@/policy/pages/FormPrintView').then(m => ({ default: m.FormPrintView })))
const MasterControlInventoryPage = lazy(() => import('@/policy/pages/MasterControlInventoryPage').then(m => ({ default: m.MasterControlInventoryPage })))
const LoginPage = lazy(() => import('@/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const CheckEmailPage = lazy(() => import('@/auth/pages/CheckEmailPage').then(m => ({ default: m.CheckEmailPage })))
const SetupAccountPage = lazy(() => import('@/auth/pages/SetupAccountPage').then(m => ({ default: m.SetupAccountPage })))
const ForgotPasswordPage = lazy(() => import('@/auth/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/auth/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const SetNewPasswordPage = lazy(() => import('@/auth/pages/SetNewPasswordPage').then(m => ({ default: m.SetNewPasswordPage })))
const UserGroupsPage = lazy(() => import('@/policy/security/identity/UserGroupsPage').then(m => ({ default: m.UserGroupsPage })))
const PermissionCatalogPage = lazy(() => import('@/policy/security/identity/PermissionCatalogPage').then(m => ({ default: m.PermissionCatalogPage })))
const UserAssignmentsPage = lazy(() => import('@/policy/security/identity/UserAssignmentsPage').then(m => ({ default: m.UserAssignmentsPage })))
const AdminRolesPage = lazy(() => import('@/policy/security/identity/AdminRolesPage').then(m => ({ default: m.AdminRolesPage })))
const AdminRouteGuard = lazy(() => import('@/policy/security/identity/AdminRouteGuard').then(m => ({ default: m.AdminRouteGuard })))

// ── Onboarding & Competency Journey ─────────────────────────────
const JourneyHomePage    = lazy(() => import('@/policy/journey/pages/JourneyHomePage').then(m => ({ default: m.JourneyHomePage })))
const OnboardingV1JourneyPage = lazy(() => import('@/policy/journey/pages/OnboardingV1JourneyPage').then(m => ({ default: m.OnboardingV1JourneyPage })))
const AppendixFPage      = lazy(() => import('@/policy/journey/pages/AppendixFPage').then(m => ({ default: m.AppendixFPage })))
const ModulePlayerPage   = lazy(() => import('@/policy/journey/pages/ModulePlayerPage').then(m => ({ default: m.ModulePlayerPage })))
const SupervisorPage     = lazy(() => import('@/policy/journey/pages/SupervisorPage').then(m => ({ default: m.SupervisorPage })))
const AdminPage          = lazy(() => import('@/policy/journey/pages/AdminPage').then(m => ({ default: m.AdminPage })))
const UserGuidePage      = lazy(() => import('@/policy/journey/pages/UserGuidePage').then(m => ({ default: m.UserGuidePage })))

// ── Onboarding V2 (audit-grade activation engine) ───────────────
const OnboardingV2Layout      = lazy(() => import('@/policy/onboarding-v2/pages/OnboardingV2Layout').then(m => ({ default: m.OnboardingV2Layout })))
const OnboardingV2Dashboard   = lazy(() => import('@/policy/onboarding-v2/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const OnboardingV2Activation  = lazy(() => import('@/policy/onboarding-v2/pages/ActivationPage').then(m => ({ default: m.ActivationPage })))
const OnboardingV2BatchList   = lazy(() => import('@/policy/onboarding-v2/pages/BatchListPage').then(m => ({ default: m.BatchListPage })))
const OnboardingV2BatchView   = lazy(() => import('@/policy/onboarding-v2/pages/BatchViewPage').then(m => ({ default: m.BatchViewPage })))
const OnboardingV2Audit       = lazy(() => import('@/policy/onboarding-v2/pages/AuditReadinessPage').then(m => ({ default: m.AuditReadinessPage })))
const OnboardingV2Governance  = lazy(() => import('@/policy/onboarding-v2/pages/GovernancePage').then(m => ({ default: m.GovernancePage })))

// ── Help Center (eCIgn knowledge base) ───────────────────────────
const HelpCenterPage     = lazy(() => import('@/policy/help/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })))
const SystemDocumentationPage = lazy(() => import('@/policy/pages/SystemDocumentationPage').then(m => ({ default: m.SystemDocumentationPage })))

// ── CES (Compliance Execution Sprint System) ─────────────────────
const CesDashboardPage = lazy(() => import('@/policy/ces/pages/CesDashboardPage').then(m => ({ default: m.CesDashboardPage })))
const CesBoardPage     = lazy(() => import('@/policy/ces/pages/CesBoardPage').then(m => ({ default: m.CesBoardPage })))
const CesWorkloadsPage = lazy(() => import('@/policy/ces/pages/CesWorkloadsPage').then(m => ({ default: m.CesWorkloadsPage })))
const CesReportsPage   = lazy(() => import('@/policy/ces/pages/CesReportsPage').then(m => ({ default: m.CesReportsPage })))
const MyTasksPage      = lazy(() => import('@/policy/ces/pages/MyTasksPage').then(m => ({ default: m.MyTasksPage })))
const MyTasksPmPage    = lazy(() => import('@/policy/components/pm/MyTasksPmPage').then(m => ({ default: m.MyTasksPmPage })))
const SprintPlanPage   = lazy(() => import('@/policy/components/pm/SprintPlanPage').then(m => ({ default: m.SprintPlanPage })))
const SprintReviewPage = lazy(() => import('@/policy/components/pm/SprintReviewPage').then(m => ({ default: m.SprintReviewPage })))
const ApprovalsQueuePage = lazy(() => import('@/policy/components/pm/ApprovalsQueuePage').then(m => ({ default: m.ApprovalsQueuePage })))
const PmDashboardPage  = lazy(() => import('@/policy/components/pm/PmDashboardPage').then(m => ({ default: m.PmDashboardPage })))

function AppLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc] text-slate-500">
      <div className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-[#C74601] animate-spin" />
    </div>
  )
}

// Transparent fallback for the inner Suspense (lazy-loaded page chunks).
// Prevents the white "flash" inside the shell card during route transitions
// — the shell + sidebar + header stay mounted; only the content area shows
// a small spinner over the existing surface.
function InlineLoader() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center bg-transparent text-slate-400">
      <div className="h-5 w-5 rounded-full border-2 border-slate-200 border-t-[#C74601] animate-spin" />
    </div>
  )
}

function AppShell({ children }: PropsWithChildren) {
  const { loading } = useAuth()

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="min-h-screen">
        {loading ? <AppLoader /> : children}
      </div>
    </div>
  )
}

function PublicAuthRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <AppLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function EntryRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <AppLoader />
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        {/* Standalone per-appendix print pages — outside layout */}
        <Route path="/print/GV-GB-001/appendix/:appendixId" element={<GVGBAppendixPrint />} />

        {/* Standalone full-document print — outside layout */}
        <Route path="/print/GV-GB-001" element={<GVGBPrintDocument />} />

        {/* Generic print page */}
        <Route path="/print/:policyId" element={<PrintPage />} />
        <Route path="/surveyor/policy/:policyId" element={<ProtectedRoute><SurveyorPolicyViewerPage /></ProtectedRoute>} />

        {/* Standalone form print — outside layout shell for clean pagination */}
        <Route path="/forms/:formId/print" element={<FormPrintView />} />

        {/* Public auth routes */}
        <Route path="/" element={<EntryRoute />} />
        <Route path="/login" element={<PublicAuthRoute><LoginPage /></PublicAuthRoute>} />
        <Route path="/register" element={<PublicAuthRoute><RegisterPage /></PublicAuthRoute>} />
        <Route path="/check-email" element={<PublicAuthRoute><CheckEmailPage /></PublicAuthRoute>} />
        <Route path="/setup-account" element={<PublicAuthRoute><SetupAccountPage /></PublicAuthRoute>} />
        <Route path="/forgot-password" element={<PublicAuthRoute><ForgotPasswordPage /></PublicAuthRoute>} />
        <Route path="/reset-password" element={<PublicAuthRoute><ResetPasswordPage /></PublicAuthRoute>} />
        <Route path="/set-new-password" element={<PublicAuthRoute><SetNewPasswordPage /></PublicAuthRoute>} />

        {/* Hidden executive proposal — accessed via Brad iAdministrator corner trigger */}
        <Route path="/brad-proposal" element={<ProtectedRoute><BradProposalPage /></ProtectedRoute>} />

        {/* All other routes inside the Command Center shell */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <CommandCenterLayout>
                <div className="min-h-full w-full opacity-100">
                  <Suspense fallback={<InlineLoader />}>
                    <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/calendar" element={<MasterCalendarPage />} />
                    <Route path="/calendar/event/:eventId" element={<MobileIncidentExecutionPage stage="event" />} />
                    <Route path="/calendar/event/:eventId/workflow" element={<MobileIncidentExecutionPage stage="workflow" />} />
                    <Route path="/calendar/event/:eventId/task/:taskId" element={<MobileIncidentExecutionPage stage="task" />} />
                    <Route path="/calendar/event/:eventId/evidence/:taskId" element={<MobileIncidentExecutionPage stage="evidence" />} />
                    <Route path="/calendar/event/:eventId/approval" element={<MobileIncidentExecutionPage stage="approval" />} />
                    <Route path="/audit" element={<AuditModePage />} />
                    <Route path="/evidence" element={<EvidenceCenterPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/library/:policyId" element={<PolicyDetailPage />} />
                    <Route path="/policies/:policyId" element={<PolicyDetailPage />} />
                    {/* Unified Policy Lifecycle Workspace (replaces /drafts /review /publish) */}
                    <Route path="/policy-lifecycle" element={<PolicyLifecyclePage />} />
                    <Route path="/policy-lifecycle/:policyId" element={<PolicyLifecyclePage />} />
                    {/* Old route redirects (one release cycle) */}
                    <Route path="/drafts"  element={<Navigate to="/policy-lifecycle?stage=DRAFT" replace />} />
                    <Route path="/drafts/:policyId" element={<Navigate to="/policy-lifecycle" replace />} />
                    <Route path="/review"  element={<Navigate to="/policy-lifecycle?stage=REVIEW" replace />} />
                    <Route path="/publish" element={<Navigate to="/policy-lifecycle?stage=APPROVED" replace />} />
                    <Route path="/taxonomy" element={<TaxonomyPage />} />
                    <Route path="/framework" element={<FrameworkPage />} />
                    <Route path="/framework/achc-survey" element={<AchcSurveyAlignmentPage />} />
                    <Route path="/forms" element={<FormsPage />} />
                    <Route path="/forms/:formId" element={<FormViewer />} />
                    <Route path="/viewer/:referenceId" element={<GenericReferenceViewer />} />
                    <Route path="/events/:referenceId" element={<GenericReferenceViewer />} />
                    <Route path="/tasks/:referenceId" element={<GenericReferenceViewer />} />
                    <Route path="/governance" element={<GovernancePage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/iadministrator" element={<IAdministratorPage />} />
                    <Route path="/admin" element={<Navigate to="/admin/user-groups" replace />} />
                    <Route path="/admin/user-groups" element={<AdminRouteGuard><UserGroupsPage /></AdminRouteGuard>} />
                    <Route path="/admin/roles" element={<AdminRouteGuard><AdminRolesPage /></AdminRouteGuard>} />
                    <Route path="/admin/permissions" element={<AdminRouteGuard><PermissionCatalogPage /></AdminRouteGuard>} />
                    <Route path="/admin/users" element={<AdminRouteGuard><UserAssignmentsPage /></AdminRouteGuard>} />
                    <Route path="/security/identity" element={<Navigate to="/security/identity/user-groups" replace />} />
                    <Route path="/security/identity/user-groups" element={<Navigate to="/admin/user-groups" replace />} />
                    <Route path="/security/identity/permission-catalog" element={<Navigate to="/admin/permissions" replace />} />
                    <Route path="/security/identity/user-assignments" element={<Navigate to="/admin/users" replace />} />
                    <Route path="/workflows/*" element={<WorkflowLibraryApp />} />
                    <Route path="/compliance/master-controls" element={<MasterControlInventoryPage />} />
                    <Route path="/hubstaff"   element={<HubstaffStagingPage />} />

                    {/* Onboarding & Competency Journey */}
                    <Route path="/journey"                    element={<JourneyHomePage />} />
                    <Route path="/journey/v1-journey"         element={<OnboardingV1JourneyPage />} />
                    <Route path="/journey/appendix-f"         element={<AppendixFPage />} />
                    <Route path="/journey/module/:moduleId"   element={<ModulePlayerPage />} />
                    <Route path="/journey/supervisor"         element={<SupervisorPage />} />
                    <Route path="/journey/admin"              element={<AdminPage />} />
                    <Route path="/journey/guide"              element={<UserGuidePage />} />

                    {/* Onboarding V2 — audit-grade activation engine */}
                    <Route path="/onboarding-v2" element={<OnboardingV2Layout />}>
                      <Route index                       element={<Navigate to="/onboarding-v2/dashboard" replace />} />
                      <Route path="dashboard"            element={<OnboardingV2Dashboard />} />
                      <Route path="activate"             element={<OnboardingV2Activation />} />
                      <Route path="batches"              element={<OnboardingV2BatchList />} />
                      <Route path="batches/:batchId"     element={<OnboardingV2BatchView />} />
                      <Route path="audit"                element={<OnboardingV2Audit />} />
                      <Route path="governance"           element={<OnboardingV2Governance />} />
                    </Route>
                    {/* Help Center (knowledge base) */}
                    <Route path="/help/*" element={<HelpCenterPage />} />
                    <Route path="/system-documentation" element={<Navigate to="/system-documentation/executive-overview" replace />} />
                    <Route path="/system-documentation/:sectionId" element={<SystemDocumentationPage />} />

                    {/* Compliance Execution Sprint System */}
                    <Route path="/ces"           element={<Navigate to="/ces/dashboard" replace />} />
                    <Route path="/ces/dashboard" element={<CesDashboardPage />} />
                    <Route path="/ces/board"     element={<CesBoardPage />} />
                    {/* Sprint calendar is merged into the unified Master Calendar (toggle: view=sprint). */}
                    <Route path="/ces/calendar"  element={<Navigate to="/calendar?view=sprint" replace />} />
                    <Route path="/ces/workloads" element={<CesWorkloadsPage />} />
                    <Route path="/ces/reports"   element={<CesReportsPage />} />
                    {/* My Tasks — execution-layer view of TASK obligations for current user. */}
                    <Route path="/my-tasks"      element={<MyTasksPage />} />
                    <Route path="/ces/my-tasks"  element={<Navigate to="/my-tasks" replace />} />

                    {/* PM Layer (overlay over CES + eCIgn) */}
                    <Route path="/pm"            element={<Navigate to="/pm/my-tasks" replace />} />
                    <Route path="/pm/my-tasks"   element={<MyTasksPmPage />} />
                    <Route path="/pm/sprint-plan"   element={<SprintPlanPage />} />
                    <Route path="/pm/sprint-review" element={<SprintReviewPage />} />
                    <Route path="/pm/approvals"     element={<ApprovalsQueuePage />} />
                    <Route path="/pm/dashboard"     element={<PmDashboardPage />} />

                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </div>
              </CommandCenterLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}

function App() {
  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <AppShell>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppShell>
  )
}

export default App