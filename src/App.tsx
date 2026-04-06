import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { CommandCenterLayout } from '@/policy/components/CommandCenterLayout'
import { initializeApp } from '@/policy/utils/appInitializer'

// ── Lazy-loaded page routes (code-split per route) ──────────────
const DashboardPage     = lazy(() => import('@/policy/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LibraryPage       = lazy(() => import('@/policy/pages/LibraryPage').then(m => ({ default: m.LibraryPage })))
const PolicyDetailPage  = lazy(() => import('@/policy/pages/PolicyDetailPage').then(m => ({ default: m.PolicyDetailPage })))
const DraftsPage        = lazy(() => import('@/policy/pages/DraftsPage').then(m => ({ default: m.DraftsPage })))
const DraftPolicyPage   = lazy(() => import('@/policy/pages/DraftPolicyPage').then(m => ({ default: m.DraftPolicyPage })))
const ReviewPage        = lazy(() => import('@/policy/pages/ReviewPage').then(m => ({ default: m.ReviewPage })))
const PublishPage       = lazy(() => import('@/policy/pages/PublishPage').then(m => ({ default: m.PublishPage })))
const TaxonomyPage      = lazy(() => import('@/policy/pages/TaxonomyPage').then(m => ({ default: m.TaxonomyPage })))
const GovernancePage    = lazy(() => import('@/policy/pages/GovernancePage').then(m => ({ default: m.GovernancePage })))
const MasterCalendarPage = lazy(() => import('@/policy/pages/MasterCalendarPage').then(m => ({ default: m.MasterCalendarPage })))
const DemoPage          = lazy(() => import('@/policy/pages/DemoPage').then(m => ({ default: m.DemoPage })))
const FrameworkPage     = lazy(() => import('@/policy/pages/FrameworkPage').then(m => ({ default: m.FrameworkPage })))
const FormsPage         = lazy(() => import('@/policy/pages/FormsPage').then(m => ({ default: m.FormsPage })))
const GVPolicyDetailView = lazy(() => import('@/policy/pages/GVPolicyDetailView').then(m => ({ default: m.GVPolicyDetailView })))
const PrintPage         = lazy(() => import('@/policy/pages/PrintPage').then(m => ({ default: m.PrintPage })))
const GVGBPrintDocument = lazy(() => import('@/policy/pages/GVGBPrintDocument').then(m => ({ default: m.GVGBPrintDocument })))
const GVGBAppendixPrint = lazy(() => import('@/policy/pages/GVGBAppendixPrint').then(m => ({ default: m.GVGBAppendixPrint })))

// Minimal route-level loading fallback (transparent, no flash)
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center h-full">
    <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#00c2b4] animate-spin" />
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
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/library/:policyId" element={<PolicyDetailPage />} />
                  <Route path="/drafts" element={<DraftsPage />} />
                  <Route path="/drafts/:policyId" element={<DraftPolicyPage />} />
                  <Route path="/review" element={<ReviewPage />} />
                  <Route path="/publish" element={<PublishPage />} />
                  <Route path="/taxonomy" element={<TaxonomyPage />} />
                  <Route path="/framework" element={<FrameworkPage />} />
                  <Route path="/forms" element={<FormsPage />} />
                  <Route path="/governance" element={<GovernancePage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/gv-policy/:policyId" element={<GVPolicyDetailView />} />
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