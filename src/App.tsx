import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CommandCenterLayout } from '@/policy/components/CommandCenterLayout'
import { initializeApp } from '@/policy/utils/appInitializer'

// ── Lazy-loaded page routes (code-split per route) ──────────────
const DashboardPage     = lazy(() => import('@/policy/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LibraryPage       = lazy(() => import('@/policy/pages/LibraryPage').then(m => ({ default: m.LibraryPage })))
const PolicyDetailPage  = lazy(() => import('@/policy/pages/PolicyDetailPage').then(m => ({ default: m.PolicyDetailPage })))
const TaxonomyPage      = lazy(() => import('@/policy/pages/TaxonomyPage').then(m => ({ default: m.TaxonomyPage })))
const GovernancePage    = lazy(() => import('@/policy/pages/GovernancePage').then(m => ({ default: m.GovernancePage })))
const MasterCalendarPage = lazy(() => import('@/policy/pages/MasterCalendarPage').then(m => ({ default: m.MasterCalendarPage })))
const AuditModePage      = lazy(() => import('@/policy/pages/AuditModePage').then(m => ({ default: m.AuditModePage })))
const EvidenceCenterPage = lazy(() => import('@/policy/pages/EvidenceCenterPage').then(m => ({ default: m.EvidenceCenterPage })))
const DemoPage          = lazy(() => import('@/policy/pages/DemoPage').then(m => ({ default: m.DemoPage })))
const FrameworkPage     = lazy(() => import('@/policy/pages/FrameworkPage').then(m => ({ default: m.FrameworkPage })))
const FormsPage         = lazy(() => import('@/policy/pages/FormsPage').then(m => ({ default: m.FormsPage })))
const GVPolicyDetailView = lazy(() => import('@/policy/pages/GVPolicyDetailView').then(m => ({ default: m.GVPolicyDetailView })))
const PrintPage         = lazy(() => import('@/policy/pages/PrintPage').then(m => ({ default: m.PrintPage })))
const GVGBPrintDocument = lazy(() => import('@/policy/pages/GVGBPrintDocument').then(m => ({ default: m.GVGBPrintDocument })))
const GVGBAppendixPrint = lazy(() => import('@/policy/pages/GVGBAppendixPrint').then(m => ({ default: m.GVGBAppendixPrint })))
const FormViewer        = lazy(() => import('@/policy/components/FormViewer').then(m => ({ default: m.FormViewer })))
const IAdministratorPage = lazy(() => import('@/policy/pages/iAdministrator').then(m => ({ default: m.IAdministratorPage })))
const BradProposalPage  = lazy(() => import('@/policy/pages/BradProposal').then(m => ({ default: m.BradProposalPage })))
const WorkflowLibraryApp    = lazy(() => import('@/policy/workflows/WorkflowLibraryApp').then(m => ({ default: m.WorkflowLibraryApp })))
const HubstaffStagingPage  = lazy(() => import('@/policy/pages/HubstaffStagingPage').then(m => ({ default: m.HubstaffStagingPage })))
const PolicyLifecyclePage  = lazy(() => import('@/policy/pages/PolicyLifecyclePage').then(m => ({ default: m.PolicyLifecyclePage })))
const FormPrintView        = lazy(() => import('@/policy/pages/FormPrintView').then(m => ({ default: m.FormPrintView })))
const MasterControlInventoryPage = lazy(() => import('@/policy/pages/MasterControlInventoryPage').then(m => ({ default: m.MasterControlInventoryPage })))

// ── Onboarding & Competency Journey ─────────────────────────────
const JourneyHomePage    = lazy(() => import('@/policy/journey/pages/JourneyHomePage').then(m => ({ default: m.JourneyHomePage })))
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

// Minimal route-level loading fallback (transparent, no flash)
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-full">
    <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#FFC107] animate-spin" />
  </div>
)

function App() {
  useEffect(() => {
    initializeApp()
  }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Standalone per-appendix print pages — outside layout */}
        <Route path="/print/GV-GB-001/appendix/:appendixId" element={<GVGBAppendixPrint />} />

        {/* Standalone full-document print — outside layout */}
        <Route path="/print/GV-GB-001" element={<GVGBPrintDocument />} />

        {/* Generic print page */}
        <Route path="/print/:policyId" element={<PrintPage />} />

        {/* Standalone form print — outside layout shell for clean pagination */}
        <Route path="/forms/:formId/print" element={<FormPrintView />} />

        {/* Hidden executive proposal — accessed via Brad iAdministrator corner trigger */}
        <Route path="/brad-proposal" element={<BradProposalPage />} />

        {/* All other routes inside the Command Center shell */}
        <Route
          path="*"
          element={
            <CommandCenterLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/calendar" element={<MasterCalendarPage />} />
                  <Route path="/audit" element={<AuditModePage />} />
                  <Route path="/evidence" element={<EvidenceCenterPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/library/:policyId" element={<PolicyDetailPage />} />
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
                  <Route path="/forms" element={<FormsPage />} />
                  <Route path="/forms/:formId" element={<FormViewer />} />
                  <Route path="/governance" element={<GovernancePage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/iadministrator" element={<IAdministratorPage />} />
                  <Route path="/gv-policy/:policyId" element={<GVPolicyDetailView />} />
                  <Route path="/workflows/*" element={<WorkflowLibraryApp />} />
                  <Route path="/compliance/master-controls" element={<MasterControlInventoryPage />} />
                  <Route path="/hubstaff"   element={<HubstaffStagingPage />} />

                  {/* Onboarding & Competency Journey */}
                  <Route path="/journey"                    element={<JourneyHomePage />} />
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
            </CommandCenterLayout>
          }
        />
      </Routes>
    </Suspense>
  )
}

export default App