import { useEffect, useState, type CSSProperties, type ComponentType } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpCircle,
  BarChart2,
  Bell,
  Bot,
  Calendar,
  CheckCircle2,
  CheckSquare,
  FileSearch,
  FileText,
  Folder,
  FolderOpen,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Menu,
  Network,
  PlayCircle,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import ciLogoWhite from '../assets/ci-logo-white.png'
import { GVGBDetailView } from '@/policy/pages/GVGBDetailView'

const V3 = {
  baseBg: '#05060A',
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',
  glass1: 'transparent',
  glass2: 'rgba(255,255,255,0.04)',
  glass3: 'rgba(255,255,255,0.015)',
  teal: '#007970',
  tealLight: '#00D1C1',
  orange: '#E07B2C',
  orangeLight: '#FFA059',
  navySub: 'rgba(18, 23, 36, 0.6)',
  yellowHighlight: 'rgba(251, 191, 36, 0.15)',
  redHighlight: 'rgba(239, 68, 68, 0.08)',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255,255,255,0.15)',
  borderHighlight: 'rgba(255,255,255,0.33)',
} as const

type SectionId =
  | 'dashboard'
  | 'my-planner'
  | 'clinicians'
  | 'patients'
  | 'calendar'
  | 'visit-schedule'
  | 'missed-visits'
  | 'referring-physicians'
  | 'library'
  | 'policy-detail'
  | 'domain-library'
  | 'sop-library'
  | 'audit-trail'
  | 'forms'
  | 'evidence'
  | 'onboarding'
  | 'brad'
  | 'hubstaff'
  | 'user-guides'
  | 'training-materials'
  | 'help-center'
  | 'demo'
  | 'ces-dashboard'
  | 'ces-board'
  | 'reports'
  | 'artifact-viewer'
  | 'admin'

type IconType = ComponentType<{ size?: number; color?: string; style?: CSSProperties }>

type NavItem = {
  id: SectionId
  label: string
  icon: IconType
}

type NavGroup = {
  label: string
  items: NavItem[]
}

type TaskItem = {
  id: string
  domain: string
  code: string
  title: string
  due: string
  overdue: boolean
}

// CES Dashboard types
type CesRoleView = 'compliance-officer' | 'don' | 'administrator'
type CesVeilLayer = null | 'layer1' | 'layer2'
interface CesVeilState { layer: CesVeilLayer; eventId: string | null; taskId: string | null }
interface CesExecutionUnit {
  id: string; eventId: string; eventTitle: string; domain: string; owner: string
  complianceState: 'compliant' | 'at-risk' | 'non-compliant' | 'in-progress'
  tasksTotal: number; tasksDone: number; evidenceCount: number; signaturesPending: number
  certificationStatus: 'certified' | 'grace-eligible' | 'not-ready' | 'audit-ready'
  dueDate: string; isOverdue: boolean
}
// CES Board types
type PmTaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
interface CesBoardTask {
  task_id: string; code: string; title: string; event_title: string; event_id: string
  assigned_user_id: string; assignee_name: string; domain: string; due_date: string
  status: PmTaskStatus; is_overdue: boolean; evidence_count: number; signatures_pending: number
  has_form: boolean; completion_percentage: number; card_layer: 1 | 2 | 3
}
// Reports / Admin types
type CesReportTab = 'sprint' | 'evidence' | 'compliance' | 'audit-readiness'
type AdminTab = 'users' | 'roles' | 'system' | 'audit-log'

const TASKS: TaskItem[] = [
  { id: 't-1', domain: 'CLINICAL', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', due: 'May 20', overdue: false },
  { id: 't-2', domain: 'CLINICAL', code: 'CL-WP-25', title: 'Review aggregate quality trends', due: 'May 18', overdue: true },
  { id: 't-3', domain: 'CLINICAL', code: 'CC-WP-22', title: 'Review compliance/billing audit results', due: 'May 19', overdue: true },
  { id: 't-4', domain: 'CLINICAL', code: 'DM-WP-18', title: 'Review HO audit results', due: 'May 21', overdue: false },
  { id: 't-5', domain: 'CLINICAL', code: 'DM-WP-15', title: 'Review data/safety audit results', due: 'May 22', overdue: false },
  { id: 't-6', domain: 'IT', code: 'IT-WP-21', title: 'Review IT/security audit results', due: 'May 23', overdue: false },
  { id: 't-7', domain: 'CLINICAL', code: 'QA-WP-12', title: 'Review OAPS-layer KPI indicators', due: 'May 24', overdue: false },
  { id: 't-8', domain: 'CLINICAL', code: 'QA-WP-04', title: 'Review PIP execution logs', due: 'May 25', overdue: false },
  { id: 't-9', domain: 'GOVERNANCE', code: 'GV-WP-01', title: 'Package report for Governing Body', due: 'May 26', overdue: false },
]

const CLINICIANS = [
  { name: 'Dr. Evelyn Vance', role: 'Clinical Lead', status: 'Compliant', id: 'EV-82F', cases: 14, audit: 'Passed' },
  { name: 'Marcus Sterling', role: 'Registered Nurse', status: 'Pending Review', id: 'MS-104', cases: 9, audit: 'Under Review' },
  { name: 'Sophia Caldwell', role: 'Physical Therapist', status: 'Compliant', id: 'SC-302', cases: 11, audit: 'Passed' },
  { name: 'Sarah Jenkins', role: 'Occupational Therapist', status: 'Compliant', id: 'SJ-204', cases: 8, audit: 'Passed' },
  { name: 'David Cho', role: 'Clinical Informatics', status: 'Pending Review', id: 'DC-992', cases: 15, audit: 'Under Review' },
  { name: 'Maria Gonzales', role: 'QA Lead', status: 'Compliant', id: 'MG-441', cases: 0, audit: 'Passed' },
]

const PATIENTS = [
  { name: 'Margaret Wilson', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'A', accm: 'Dr. Vance', mrn: 'MRN-001' },
  { name: 'Robert Thompson', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', accm: 'S. Caldwell', mrn: 'MRN-002' },
  { name: 'Helen Garcia', acuity: 'Level 3 — High', setting: 'Home', zone: 'A', accm: 'S. Jenkins', mrn: 'MRN-003' },
  { name: 'James Lee', acuity: 'Level 2 — Moderate', setting: 'Facility', zone: 'C', accm: 'M. Sterling', mrn: 'MRN-004' },
  { name: 'Dorothy Adams', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'B', accm: 'Dr. Vance', mrn: 'MRN-005' },
  { name: 'William Brown', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'A', accm: 'S. Caldwell', mrn: 'MRN-006' },
]

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'my-planner', label: 'My Planner', icon: CheckSquare },
    ],
  },
  {
    label: 'CLINICAL',
    items: [
      { id: 'clinicians', label: 'Clinicians', icon: Users },
      { id: 'patients', label: 'Patients', icon: Activity },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'visit-schedule', label: 'Visit Schedule', icon: ArrowRight },
      { id: 'missed-visits', label: 'Missed Visits', icon: AlertTriangle },
      { id: 'referring-physicians', label: 'Referring Physicians', icon: User },
    ],
  },
  {
    label: 'COMPLIANCE',
    items: [
      { id: 'library', label: 'Policy Library', icon: Shield },
      { id: 'domain-library', label: 'Domain Library', icon: Network },
      { id: 'onboarding', label: 'Onboarding', icon: User },
      { id: 'sop-library', label: 'SOP Library', icon: FileText },
      { id: 'audit-trail', label: 'Audit Trail', icon: FileSearch },
    ],
  },
  {
    label: 'FORMS & EVIDENCE',
    items: [
      { id: 'forms', label: 'Forms Library', icon: CheckCircle2 },
      { id: 'evidence', label: 'Evidence Center', icon: FolderOpen },
      { id: 'artifact-viewer', label: 'Artifact Viewer', icon: FileText },
    ],
  },
  {
    label: 'CES',
    items: [
      { id: 'ces-dashboard', label: 'CES Dashboard', icon: ShieldCheck },
      { id: 'ces-board', label: 'CES Board', icon: Layers },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [{ id: 'brad', label: 'Brad AI Copilot', icon: Bot }],
  },
  {
    label: 'WORKFORCE',
    items: [{ id: 'hubstaff', label: 'Hubstaff', icon: ArrowUpCircle }],
  },
  {
    label: 'RESOURCES',
    items: [
      { id: 'user-guides', label: 'User Guides', icon: Folder },
      { id: 'training-materials', label: 'Training Materials', icon: PlayCircle },
      { id: 'help-center', label: 'Help Center', icon: HelpCircle },
      { id: 'demo', label: 'Demo Environment', icon: Settings },
      { id: 'admin', label: 'Administration', icon: Settings },
    ],
  },
]

function performRouteTransition(next: () => void) {
  const doc = document as Document & {
    startViewTransition?: (updateCallback: () => void) => void
  }

  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(next)
    return
  }

  next()
}

function HeaderBlock({
  icon: Icon,
  micro,
  title,
  subtitle,
}: {
  icon: IconType
  micro: string
  title: string
  subtitle: string
}) {
  return (
    <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Icon size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)',
          }}
        >
          {micro}
        </span>
      </div>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 600,
          margin: 0,
          letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>{subtitle}</p>
    </div>
  )
}

export default function V3StagingApp() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const isMobile = viewportWidth < 768
  const showPlannerToggle = activeSection === 'dashboard' || activeSection === 'my-planner'

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const navigate = (section: SectionId) => {
    performRouteTransition(() => setActiveSection(section))
  }

  return (
    <div
      className="v3-staging-shell"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        backgroundImage:
          'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%), linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
        backgroundSize: 'auto, 24px 24px, 24px 24px',
        fontFamily: "'Inter', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      <img
        className="v3-watermark-lock"
        src="/ci-angel.webp"
        alt=""
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-8vh',
          left: '-8vw',
          width: '55vmin',
          height: '55vmin',
          opacity: 0.33,
          zIndex: 1,
          pointerEvents: 'none',
          objectFit: 'contain',
        }}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 24px',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <div
          className="v3-main-content"
          style={{
            width: '77.7%',
            minWidth: isMobile ? '95vw' : 'min(980px, 95vw)',
            maxWidth: '100%',
            height: '92vh',
            background: 'linear-gradient(135deg, rgba(32, 41, 56, 0.88) 0%, rgba(16, 20, 28, 0.45) 60%, rgba(8, 10, 13, 0.98) 100%)',
            backdropFilter: 'blur(32px) saturate(140%)',
            boxShadow: '30px 10px 80px rgba(0,0,0,0.9)',
            borderRadius: isMobile ? 0 : 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header
            className="v3-app-header"
            style={{
              height: 64,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 14,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => setIsNavOpen(v => !v)}
              className="btn-smooth-hover"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: V3.textSecondary, padding: 4 }}
            >
              <Menu size={18} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: V3.glass3,
                border: `1px solid ${V3.borderDefault}`,
                borderRadius: 20,
                width: isMobile ? '42vw' : 330,
                minWidth: isMobile ? 140 : 220,
              }}
            >
              <Search size={14} color={V3.textTertiary} />
              <input
                placeholder="Search operations, policies..."
                style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: 13, width: '100%' }}
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
              {showPlannerToggle && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${V3.borderDefault}`,
                    borderRadius: 999,
                    padding: 3,
                  }}
                >
                  <button
                    type="button"
                    className="btn-smooth-hover"
                    onClick={() => navigate('dashboard')}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 999,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      background: activeSection === 'dashboard' ? 'rgba(0,209,193,0.95)' : 'transparent',
                      color: activeSection === 'dashboard' ? '#001713' : V3.textSecondary,
                    }}
                  >
                    Agency View
                  </button>
                  <button
                    type="button"
                    className="btn-smooth-hover"
                    onClick={() => navigate('my-planner')}
                    style={{
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 999,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      background: activeSection === 'my-planner' ? 'rgba(0,209,193,0.95)' : 'transparent',
                      color: activeSection === 'my-planner' ? '#001713' : V3.textSecondary,
                    }}
                  >
                    My Planner
                  </button>
                </div>
              )}

              <img
                src={ciLogoWhite}
                alt="CareIndeed"
                style={{
                  width: isMobile ? 96 : showPlannerToggle ? 132 : 146,
                  maxHeight: 44,
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  opacity: 0.95,
                  flexShrink: 0,
                }}
              />
            </div>
          </header>

          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <aside
              className="v3-app-sidebar"
              style={{
                width: isNavOpen ? 260 : 0,
                minWidth: isNavOpen ? 260 : 0,
                overflow: 'hidden',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1), min-width 0.6s cubic-bezier(0.16,1,0.3,1)',
                background: 'transparent',
                borderRight: isNavOpen ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              <div style={{ width: 260, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: V3.textTertiary, letterSpacing: '1px', textTransform: 'uppercase' }}>Menu</span>
                  <button
                    type="button"
                    onClick={() => setIsNavOpen(false)}
                    className="btn-smooth-hover"
                    style={{ border: 'none', background: 'transparent', color: V3.textSecondary, cursor: 'pointer', padding: 4 }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
                  {NAV_GROUPS.map(group => (
                    <div key={group.label} style={{ marginBottom: 22 }}>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: V3.textTertiary,
                          textTransform: 'uppercase',
                          letterSpacing: '1.2px',
                          padding: '0 8px',
                          marginBottom: 6,
                        }}
                      >
                        {group.label}
                      </div>
                      {group.items.map(item => {
                        const active = item.id === activeSection
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => navigate(item.id)}
                            className="btn-smooth-hover"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              width: '100%',
                              padding: '9px 10px',
                              background: active ? 'rgba(0,209,193,0.1)' : 'transparent',
                              border: 'none',
                              borderLeft: active ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                              borderRadius: 8,
                              cursor: 'pointer',
                              color: active ? V3.textPrimary : V3.textSecondary,
                              fontSize: 13,
                              fontWeight: active ? 600 : 500,
                              textAlign: 'left',
                              marginBottom: 2,
                            }}
                          >
                            <item.icon size={15} color={active ? V3.tealLight : V3.textTertiary} />
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </nav>

                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(0,209,193,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          color: V3.tealLight,
                          flexShrink: 0,
                        }}
                      >
                        AD
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: V3.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin User</div>
                        <div style={{ fontSize: 11, color: V3.textTertiary }}>View Profile</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-smooth-hover"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        border: `1px solid ${V3.borderDefault}`,
                        background: 'transparent',
                        color: V3.textSecondary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                <PageContent section={activeSection} isMobile={isMobile} navigate={navigate} />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CES DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function CesDashboardPage() {
  const [role, setRole] = useState<CesRoleView>('compliance-officer')
  const [veil, setVeil] = useState<CesVeilState>({ layer: null, eventId: null, taskId: null })

  const sprint = { label: 'Sprint 9', completionRatePct: 88, upcomingDeadlines48hCount: 2, activeBlockerCount: 0, auditReadinessScore: 92 }
  const executionUnits: CesExecutionUnit[] = [
    { id: 'EU-001', eventId: 'RE-001', eventTitle: 'QAPI Quarterly Meeting', domain: 'Clinical', owner: 'J. Smith', complianceState: 'in-progress', tasksTotal: 12, tasksDone: 9, evidenceCount: 7, signaturesPending: 2, certificationStatus: 'audit-ready', dueDate: 'May 26', isOverdue: false },
    { id: 'EU-002', eventId: 'RE-002', eventTitle: 'Fire Drill Log Upload', domain: 'Safety', owner: 'M. Doe', complianceState: 'compliant', tasksTotal: 6, tasksDone: 6, evidenceCount: 6, signaturesPending: 0, certificationStatus: 'certified', dueDate: 'May 16', isOverdue: false },
    { id: 'EU-003', eventId: 'RE-003', eventTitle: 'Annual Policy Review', domain: 'Compliance', owner: 'Admin', complianceState: 'at-risk', tasksTotal: 18, tasksDone: 10, evidenceCount: 5, signaturesPending: 4, certificationStatus: 'not-ready', dueDate: 'May 20', isOverdue: true },
    { id: 'EU-004', eventId: 'RE-004', eventTitle: 'Infection Control Update', domain: 'Clinical', owner: 'E. Vance', complianceState: 'in-progress', tasksTotal: 8, tasksDone: 6, evidenceCount: 4, signaturesPending: 1, certificationStatus: 'grace-eligible', dueDate: 'May 24', isOverdue: false },
    { id: 'EU-005', eventId: 'RE-005', eventTitle: 'HIPAA Annual Training', domain: 'Compliance', owner: 'T. Lee', complianceState: 'compliant', tasksTotal: 4, tasksDone: 4, evidenceCount: 4, signaturesPending: 0, certificationStatus: 'certified', dueDate: 'May 14', isOverdue: false },
    { id: 'EU-006', eventId: 'RE-006', eventTitle: 'Emergency Plan Review', domain: 'Safety', owner: 'R. Kim', complianceState: 'non-compliant', tasksTotal: 10, tasksDone: 3, evidenceCount: 1, signaturesPending: 3, certificationStatus: 'not-ready', dueDate: 'May 18', isOverdue: true },
  ]
  const veilTasks = [
    { id: 'vt-1', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', dueDate: 'May 20', status: 'open' as const },
    { id: 'vt-2', code: 'CL-WP-25', title: 'Review aggregate quality trends', dueDate: 'May 18', status: 'overdue' as const },
    { id: 'vt-3', code: 'CC-WP-22', title: 'Review compliance/billing audit results', dueDate: 'May 19', status: 'overdue' as const },
  ]

  const stateColor = (s: CesExecutionUnit['complianceState']) =>
    s === 'compliant' || s === 'in-progress' ? V3.tealLight : s === 'at-risk' ? V3.orangeLight : '#F87171'
  const certColor = (s: CesExecutionUnit['certificationStatus']) =>
    s === 'certified' ? V3.tealLight : s === 'audit-ready' ? '#4ADE80' : s === 'grace-eligible' ? V3.orangeLight : '#F87171'

  const openVeilLayer1 = (eventId: string) => {
    setVeil({ layer: null, eventId: null, taskId: null })
    setTimeout(() => setVeil({ layer: 'layer1', eventId, taskId: null }), 80)
  }
  const openVeilLayer2 = (taskId: string) =>
    setVeil(prev => ({ ...prev, layer: 'layer2' as CesVeilLayer, taskId }))
  const closeVeil = () => setVeil({ layer: null, eventId: null, taskId: null })

  const critical = executionUnits.filter(u => u.complianceState === 'non-compliant' || (u.isOverdue && u.complianceState === 'at-risk'))
  const atRisk = executionUnits.filter(u => u.complianceState === 'at-risk' && !u.isOverdue)
  const inProgress = executionUnits.filter(u => u.complianceState === 'in-progress')
  const compliant = executionUnits.filter(u => u.complianceState === 'compliant')

  // suppress unused warning on role until role-based filtering is wired
  void role

  return (
    <div className="v3-page-animate" style={{ position: 'relative', minHeight: '100%' }}>
      <div style={{ padding: 24, transition: 'margin-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)', marginRight: veil.layer ? 420 : 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: 0 }}>Compliance Execution System</h1>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 6, background: V3.navySub, color: V3.textSecondary, fontWeight: 500, letterSpacing: '0.06em' }}>CES</span>
            </div>
            <p style={{ color: V3.textTertiary, fontSize: 13, margin: '6px 0 0' }}>{sprint.label} · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 8, padding: 3 }}>
            {(['compliance-officer', 'don', 'administrator'] as CesRoleView[]).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: role === r ? 600 : 400, borderRadius: 6, background: role === r ? V3.teal : 'transparent', color: role === r ? '#FFF' : V3.textTertiary, border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', textTransform: 'capitalize' }}>{r.replace(/-/g, ' ')}</button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Active Sprint', value: sprint.label, sub: `${sprint.upcomingDeadlines48hCount} deadlines in 48h` },
            { label: 'Sprint %', value: `${sprint.completionRatePct}%`, sub: `${sprint.activeBlockerCount} blockers` },
            { label: 'Audit Readiness', value: `${sprint.auditReadinessScore}%`, sub: 'Composite score' },
            { label: 'Critical Actions', value: critical.length, sub: 'Require immediate attention' },
            { label: 'Missing Evidence', value: executionUnits.reduce((s, u) => s + (u.tasksTotal - u.tasksDone), 0), sub: 'Incomplete tasks' },
          ].map((kpi, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}` }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: V3.textPrimary, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</div>
              <div style={{ fontSize: 11, color: V3.textSecondary, marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', marginBottom: 24, borderTop: `1px solid ${V3.borderDefault}`, borderBottom: `1px solid ${V3.borderDefault}` }}>
          <span style={{ fontSize: 13, color: sprint.auditReadinessScore >= 90 ? V3.tealLight : V3.orangeLight, fontWeight: 600 }}>{sprint.auditReadinessScore >= 90 ? '● Audit Ready' : '⚠ Action Required'}</span>
          <span style={{ color: V3.textTertiary, fontSize: 12 }}>{sprint.auditReadinessScore >= 90 ? 'All workflows compliant or certification-ready.' : `${critical.length} critical events require immediate attention.`}</span>
        </div>

        {/* Board columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'CRITICAL', items: critical, accentColor: '#F87171' },
            { label: 'AT RISK', items: atRisk, accentColor: V3.orangeLight },
            { label: 'IN PROGRESS', items: inProgress, accentColor: V3.tealLight },
            { label: 'COMPLIANT', items: compliant, accentColor: '#4ADE80' },
          ].map(col => (
            <div key={col.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.accentColor }} />
                <span style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: '0.08em' }}>{col.label}</span>
                <span style={{ fontSize: 10, color: V3.textTertiary, padding: '1px 6px', borderRadius: 8, background: V3.glass2 }}>{col.items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.items.map(unit => (
                  <div key={unit.id} onClick={() => openVeilLayer1(unit.eventId)} className="v3-invisible-glare" style={{ padding: 16, cursor: 'pointer', background: V3.glass2, border: `1px solid ${V3.borderHighlight}`, borderRadius: 12, borderLeft: `3px solid ${unit.isOverdue && unit.complianceState === 'non-compliant' ? V3.orange : unit.isOverdue ? V3.tealLight : 'transparent'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{unit.eventTitle}</div>
                      {unit.isOverdue && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(248,113,113,0.12)', color: '#F87171', whiteSpace: 'nowrap', marginLeft: 8 }}>OVERDUE</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: V3.textTertiary, fontSize: 11 }}>{unit.domain} · {unit.owner}</span>
                      <span style={{ color: V3.textTertiary, fontSize: 11 }}>{unit.dueDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ height: 3, flex: 1, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', borderRadius: 2, width: `${(unit.tasksDone / unit.tasksTotal) * 100}%`, background: stateColor(unit.complianceState), transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ color: V3.textTertiary, fontSize: 10 }}>{unit.tasksDone}/{unit.tasksTotal}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: `${certColor(unit.certificationStatus)}18`, color: certColor(unit.certificationStatus) }}>{unit.certificationStatus.replace('-', ' ').toUpperCase()}</span>
                      {unit.signaturesPending > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>✍ {unit.signaturesPending}</span>}
                    </div>
                  </div>
                ))}
                {col.items.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: V3.textTertiary, fontSize: 12, background: V3.glass2, borderRadius: 12 }}>No events</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Veil drawer */}
      {veil.layer && (
        <>
          <div onClick={closeVeil} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 998 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, zIndex: 999, background: 'rgba(10,12,20,0.95)', borderLeft: `1px solid ${V3.borderHighlight}`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${V3.borderDefault}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{veil.layer === 'layer1' ? 'Event Tasks' : 'Task Detail'}</div>
                <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 500, marginTop: 4 }}>{executionUnits.find(u => u.eventId === veil.eventId)?.eventTitle}</div>
              </div>
              <button onClick={closeVeil} style={{ background: 'none', border: 'none', color: V3.textTertiary, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: 24, flex: 1 }}>
              {veil.layer === 'layer1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {veilTasks.map(task => (
                    <div key={task.id} onClick={() => openVeilLayer2(task.id)} style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: V3.yellowHighlight, border: `1px solid rgba(251,191,36,0.15)` }}>
                      <div><span style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600, marginRight: 8 }}>{task.code}</span><span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{task.title}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ color: task.status === 'overdue' ? '#F87171' : V3.textTertiary, fontSize: 11 }}>{task.status === 'overdue' ? `⚠ Overdue — ${task.dueDate}` : `Due ${task.dueDate}`}</span>
                        <span style={{ color: V3.textTertiary, fontSize: 11 }}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {veil.layer === 'layer2' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ padding: 14, borderRadius: 10, background: V3.redHighlight, border: '1px solid rgba(239,68,68,0.12)' }}>
                    <div style={{ fontSize: 10, color: '#F87171', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 6 }}>COMPLIANCE REQUIREMENT</div>
                    <p style={{ color: V3.textSecondary, fontSize: 13, lineHeight: 1.5, margin: 0 }}>All quarterly meeting minutes must include documented attendee list, agenda items reviewed, data analysis discussion, identified opportunities for improvement, and action items with assigned owners and deadlines.</p>
                  </div>
                  {[{ label: 'FORM', content: 'QA-FM-001 — QAPI Meeting Minutes Template', status: 'Ready to complete' }, { label: 'EVIDENCE', content: '2 of 3 required artifacts uploaded', status: 'Incomplete' }, { label: 'SIGNATURES', content: 'J. Smith (signed) · Dr. R. Patel (pending)', status: '1 of 3' }].map((s, i) => (
                    <div key={i} style={{ padding: 12, background: V3.glass2, borderRadius: 10, border: `1px solid ${V3.borderDefault}` }}>
                      <div style={{ fontSize: 10, color: V3.tealLight, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>{s.label}</div>
                      <div style={{ color: V3.textSecondary, fontSize: 13 }}>{s.content}</div>
                      <div style={{ color: V3.textTertiary, fontSize: 11, marginTop: 2 }}>{s.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CES BOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function CesBoardPage() {
  const [filterDomain, setFilterDomain] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const columnDefs: { id: PmTaskStatus; label: string; accentColor: string }[] = [
    { id: 'todo', label: 'To Do', accentColor: V3.textTertiary },
    { id: 'in_progress', label: 'In Progress', accentColor: V3.tealLight },
    { id: 'review', label: 'In Review', accentColor: V3.orangeLight },
    { id: 'done', label: 'Done', accentColor: '#4ADE80' },
    { id: 'blocked', label: 'Blocked', accentColor: '#F87171' },
  ]

  const boardTasks: CesBoardTask[] = [
    { task_id: 'T-001', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', event_title: 'QAPI Quarterly Meeting', event_id: 'RE-001', assigned_user_id: 'u1', assignee_name: 'J. Smith', domain: 'Clinical', due_date: 'May 20', status: 'in_progress', is_overdue: false, evidence_count: 2, signatures_pending: 0, has_form: true, completion_percentage: 60, card_layer: 1 },
    { task_id: 'T-002', code: 'CL-WP-25', title: 'Review aggregate quality trends', event_title: 'QAPI Quarterly Meeting', event_id: 'RE-001', assigned_user_id: 'u2', assignee_name: 'E. Vance', domain: 'Clinical', due_date: 'May 18', status: 'blocked', is_overdue: true, evidence_count: 0, signatures_pending: 1, has_form: false, completion_percentage: 25, card_layer: 3 },
    { task_id: 'T-003', code: 'CC-WP-22', title: 'Review compliance/billing audit results', event_title: 'QAPI Quarterly Meeting', event_id: 'RE-001', assigned_user_id: 'u1', assignee_name: 'J. Smith', domain: 'Compliance', due_date: 'May 19', status: 'review', is_overdue: true, evidence_count: 3, signatures_pending: 2, has_form: true, completion_percentage: 80, card_layer: 2 },
    { task_id: 'T-004', code: 'FD-WP-01', title: 'Upload drill photos & sign-in sheet', event_title: 'Fire Drill Log Upload', event_id: 'RE-002', assigned_user_id: 'u3', assignee_name: 'M. Doe', domain: 'Safety', due_date: 'May 16', status: 'done', is_overdue: false, evidence_count: 4, signatures_pending: 0, has_form: true, completion_percentage: 100, card_layer: 1 },
    { task_id: 'T-005', code: 'PR-WP-08', title: 'Annual policy document review', event_title: 'Annual Policy Review', event_id: 'RE-003', assigned_user_id: 'u4', assignee_name: 'Admin', domain: 'Compliance', due_date: 'May 20', status: 'todo', is_overdue: true, evidence_count: 0, signatures_pending: 0, has_form: false, completion_percentage: 0, card_layer: 1 },
    { task_id: 'T-006', code: 'IC-WP-14', title: 'Update PPE training materials', event_title: 'Infection Control Update', event_id: 'RE-004', assigned_user_id: 'u2', assignee_name: 'E. Vance', domain: 'Clinical', due_date: 'May 24', status: 'in_progress', is_overdue: false, evidence_count: 1, signatures_pending: 1, has_form: true, completion_percentage: 50, card_layer: 2 },
    { task_id: 'T-007', code: 'HP-WP-03', title: 'Complete HIPAA training module', event_title: 'HIPAA Annual Training', event_id: 'RE-005', assigned_user_id: 'u5', assignee_name: 'T. Lee', domain: 'Compliance', due_date: 'May 14', status: 'done', is_overdue: false, evidence_count: 2, signatures_pending: 0, has_form: true, completion_percentage: 100, card_layer: 1 },
    { task_id: 'T-008', code: 'EP-WP-02', title: 'Update emergency contact list', event_title: 'Emergency Plan Review', event_id: 'RE-006', assigned_user_id: 'u6', assignee_name: 'R. Kim', domain: 'Safety', due_date: 'May 18', status: 'blocked', is_overdue: true, evidence_count: 0, signatures_pending: 3, has_form: false, completion_percentage: 10, card_layer: 3 },
  ]

  const domains = [...new Set(boardTasks.map(t => t.domain))]
  const filtered = filterDomain ? boardTasks.filter(t => t.domain === filterDomain) : boardTasks
  const selectedTask = boardTasks.find(t => t.task_id === selectedTaskId) ?? null

  const cardBg = (layer: 1 | 2 | 3) =>
    layer === 3 ? `linear-gradient(135deg, rgba(239,68,68,0.08) 0%, ${V3.glass2} 100%)` :
    layer === 2 ? `linear-gradient(135deg, rgba(251,191,36,0.06) 0%, ${V3.glass2} 100%)` :
    V3.glass2

  return (
    <div className="v3-page-animate" style={{ position: 'relative' }}>
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: 0 }}>CES Board</h1>
            <p style={{ color: V3.textTertiary, fontSize: 13, margin: '4px 0 0' }}>Sprint 9 · Task execution tracker</p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: V3.textTertiary, marginRight: 4 }}>Domain:</span>
            {['All', ...domains].map(d => (
              <button key={d} onClick={() => setFilterDomain(d === 'All' ? null : d)} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 6, background: (d === 'All' ? filterDomain === null : filterDomain === d) ? V3.teal : V3.glass2, color: (d === 'All' ? filterDomain === null : filterDomain === d) ? '#FFF' : V3.textTertiary, border: `1px solid ${V3.borderDefault}`, cursor: 'pointer' }}>{d}</button>
            ))}
          </div>
        </div>

        {/* Kanban columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, transition: 'margin-right 0.4s ease', marginRight: selectedTask ? 380 : 0 }}>
          {columnDefs.map(col => {
            const colTasks = filtered.filter(t => t.status === col.id)
            return (
              <div key={col.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.accentColor }} />
                  <span style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: '0.08em' }}>{col.label.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: V3.textTertiary, padding: '1px 6px', borderRadius: 8, background: V3.glass2 }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colTasks.map(task => (
                    <div key={task.task_id} onClick={() => setSelectedTaskId(selectedTaskId === task.task_id ? null : task.task_id)} className="v3-invisible-glare" style={{ padding: 14, borderRadius: 10, cursor: 'pointer', background: cardBg(task.card_layer), border: `1px solid ${selectedTaskId === task.task_id ? V3.borderHighlight : V3.borderDefault}`, borderLeft: `3px solid ${task.card_layer === 3 ? '#F87171' : task.card_layer === 2 ? V3.orangeLight : 'transparent'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: V3.tealLight, fontWeight: 600 }}>{task.code}</span>
                        {task.is_overdue && <span style={{ fontSize: 9, color: '#F87171' }}>OVERDUE</span>}
                      </div>
                      <div style={{ color: V3.textPrimary, fontSize: 12, fontWeight: 500, lineHeight: 1.4, marginBottom: 8 }}>{task.title}</div>
                      <div style={{ fontSize: 11, color: V3.textTertiary, marginBottom: 8 }}>{task.event_title}</div>
                      <div style={{ height: 2, borderRadius: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }}>
                        <div style={{ height: '100%', borderRadius: 1, width: `${task.completion_percentage}%`, background: task.completion_percentage === 100 ? '#4ADE80' : V3.tealLight }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: V3.textTertiary }}>{task.assignee_name}</span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {task.has_form && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,209,193,0.1)', color: V3.tealLight }}>FORM</span>}
                          {task.signatures_pending > 0 && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(251,191,36,0.1)', color: '#FBBF24' }}>✍{task.signatures_pending}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div style={{ padding: 14, textAlign: 'center', color: V3.textTertiary, fontSize: 11, background: V3.glass2, borderRadius: 10, border: `1px solid ${V3.borderDefault}`, opacity: 0.5 }}>Empty</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <>
          <div onClick={() => setSelectedTaskId(null)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 999, background: 'rgba(10,12,20,0.95)', borderLeft: `1px solid ${V3.borderHighlight}`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${V3.borderDefault}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600, letterSpacing: '0.06em' }}>{selectedTask.code}</div>
                <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 600, marginTop: 4 }}>{selectedTask.title}</div>
              </div>
              <button onClick={() => setSelectedTaskId(null)} style={{ background: 'none', border: 'none', color: V3.textTertiary, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[{ label: 'Event', value: selectedTask.event_title }, { label: 'Assignee', value: selectedTask.assignee_name }, { label: 'Domain', value: selectedTask.domain }, { label: 'Due', value: selectedTask.due_date }, { label: 'Status', value: selectedTask.status.replace('_', ' ').toUpperCase() }].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: V3.textTertiary, fontSize: 12 }}>{row.label}</span>
                  <span style={{ color: V3.textPrimary, fontSize: 12, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: V3.textTertiary, fontSize: 12 }}>Progress</span>
                  <span style={{ color: V3.textPrimary, fontSize: 12 }}>{selectedTask.completion_percentage}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${selectedTask.completion_percentage}%`, background: selectedTask.completion_percentage === 100 ? '#4ADE80' : V3.tealLight }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {selectedTask.has_form && <div style={{ flex: 1, padding: 12, background: 'rgba(0,209,193,0.06)', borderRadius: 8, border: '1px solid rgba(0,209,193,0.12)', textAlign: 'center' }}><div style={{ fontSize: 11, color: V3.tealLight, fontWeight: 600 }}>FORM</div><div style={{ fontSize: 10, color: V3.textTertiary, marginTop: 2 }}>Ready to complete</div></div>}
                {selectedTask.signatures_pending > 0 && <div style={{ flex: 1, padding: 12, background: 'rgba(251,191,36,0.06)', borderRadius: 8, border: '1px solid rgba(251,191,36,0.12)', textAlign: 'center' }}><div style={{ fontSize: 11, color: '#FBBF24', fontWeight: 600 }}>SIGNATURES</div><div style={{ fontSize: 10, color: V3.textTertiary, marginTop: 2 }}>{selectedTask.signatures_pending} pending</div></div>}
                <div style={{ flex: 1, padding: 12, background: V3.glass2, borderRadius: 8, border: `1px solid ${V3.borderDefault}`, textAlign: 'center' }}><div style={{ fontSize: 11, color: V3.textSecondary, fontWeight: 600 }}>EVIDENCE</div><div style={{ fontSize: 10, color: V3.textTertiary, marginTop: 2 }}>{selectedTask.evidence_count} uploaded</div></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ReportsPage() {
  const [activeTab, setActiveTab] = useState<CesReportTab>('sprint')

  const sprints = [
    { id: 'S9', label: 'Sprint 9', start: 'May 1', end: 'May 31', completionPct: 88, auditReadiness: 92, eventsTotal: 8, eventsDone: 5, criticalCount: 1, evidenceGaps: 4 },
    { id: 'S8', label: 'Sprint 8', start: 'Apr 1', end: 'Apr 30', completionPct: 95, auditReadiness: 97, eventsTotal: 7, eventsDone: 7, criticalCount: 0, evidenceGaps: 0 },
    { id: 'S7', label: 'Sprint 7', start: 'Mar 1', end: 'Mar 31', completionPct: 79, auditReadiness: 82, eventsTotal: 9, eventsDone: 7, criticalCount: 2, evidenceGaps: 6 },
    { id: 'S6', label: 'Sprint 6', start: 'Feb 1', end: 'Feb 28', completionPct: 91, auditReadiness: 94, eventsTotal: 6, eventsDone: 6, criticalCount: 0, evidenceGaps: 1 },
  ]

  const evidenceByDomain = [
    { domain: 'Clinical', total: 48, uploaded: 43, gap: 5, pct: 90 },
    { domain: 'Compliance', total: 32, uploaded: 28, gap: 4, pct: 88 },
    { domain: 'Safety', total: 24, uploaded: 24, gap: 0, pct: 100 },
    { domain: 'Governance', total: 18, uploaded: 12, gap: 6, pct: 67 },
    { domain: 'IT', total: 10, uploaded: 9, gap: 1, pct: 90 },
  ]

  const tabs: { id: CesReportTab; label: string }[] = [
    { id: 'sprint', label: 'Sprint Report' },
    { id: 'evidence', label: 'Evidence Gaps' },
    { id: 'compliance', label: 'Compliance Trend' },
    { id: 'audit-readiness', label: 'Audit Readiness' },
  ]

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Reports & Analytics</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>Compliance performance trends and audit readiness metrics</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content', border: `1px solid ${V3.borderDefault}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '7px 18px', fontSize: 13, borderRadius: 7, background: activeTab === t.id ? V3.teal : 'transparent', color: activeTab === t.id ? '#FFF' : V3.textTertiary, border: 'none', cursor: 'pointer', fontWeight: activeTab === t.id ? 600 : 400, transition: 'all 0.25s ease' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'sprint' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sprints.map(sp => (
            <div key={sp.id} style={{ padding: 20, background: V3.glass2, borderRadius: 14, border: `1px solid ${V3.borderDefault}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ color: V3.textPrimary, fontSize: 16, fontWeight: 600 }}>{sp.label}</div>
                  <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 2 }}>{sp.start} – {sp.end}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: sp.auditReadiness >= 90 ? 'rgba(74,222,128,0.1)' : 'rgba(255,160,89,0.1)', color: sp.auditReadiness >= 90 ? '#4ADE80' : V3.orangeLight }}>Readiness {sp.auditReadiness}%</span>
                  {sp.criticalCount > 0 && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>{sp.criticalCount} critical</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
                {[
                  { label: 'Completion', value: `${sp.completionPct}%` },
                  { label: 'Events Done', value: `${sp.eventsDone}/${sp.eventsTotal}` },
                  { label: 'Evidence Gaps', value: sp.evidenceGaps },
                  { label: 'Critical Actions', value: sp.criticalCount },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 12, background: V3.glass3, borderRadius: 8, border: `1px solid ${V3.borderDefault}` }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: V3.textPrimary }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: V3.textTertiary, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${sp.completionPct}%`, background: sp.completionPct >= 90 ? '#4ADE80' : sp.completionPct >= 75 ? V3.tealLight : V3.orangeLight, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 8 }}>
            {[
              { label: 'Total Required', value: evidenceByDomain.reduce((s, d) => s + d.total, 0) },
              { label: 'Uploaded', value: evidenceByDomain.reduce((s, d) => s + d.uploaded, 0) },
              { label: 'Gaps', value: evidenceByDomain.reduce((s, d) => s + d.gap, 0) },
            ].map((m, i) => (
              <div key={i} style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}`, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: i === 2 ? (m.value > 0 ? V3.orangeLight : '#4ADE80') : V3.textPrimary }}>{m.value}</div>
                <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
              </div>
            ))}
          </div>
          {evidenceByDomain.map(d => (
            <div key={d.domain} style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{d.domain}</span>
                  {d.gap > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(255,160,89,0.1)', color: V3.orangeLight }}>{d.gap} gaps</span>}
                </div>
                <span style={{ color: d.pct === 100 ? '#4ADE80' : d.pct >= 85 ? V3.tealLight : V3.orangeLight, fontSize: 14, fontWeight: 600 }}>{d.pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${d.pct}%`, background: d.pct === 100 ? '#4ADE80' : d.pct >= 85 ? V3.tealLight : V3.orangeLight, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{d.uploaded} uploaded</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{d.total} required</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div style={{ padding: 20, background: V3.glass2, borderRadius: 14, border: `1px solid ${V3.borderDefault}` }}>
          <h3 style={{ color: V3.textPrimary, fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>6-Sprint Compliance Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 180 }}>
            {[...sprints].reverse().map((sp, i) => {
              const h = (sp.completionPct / 100) * 160
              return (
                <div key={sp.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: sp.completionPct >= 90 ? '#4ADE80' : V3.orangeLight, fontWeight: 600 }}>{sp.completionPct}%</span>
                  <div style={{ width: '100%', height: h, borderRadius: '6px 6px 0 0', background: sp.completionPct >= 90 ? 'rgba(74,222,128,0.3)' : sp.completionPct >= 75 ? `rgba(0,209,193,0.3)` : 'rgba(255,160,89,0.3)', border: `1px solid ${sp.completionPct >= 90 ? '#4ADE80' : sp.completionPct >= 75 ? V3.tealLight : V3.orangeLight}`, transition: 'height 0.6s ease', marginTop: 'auto' }} />
                  <span style={{ fontSize: 10, color: V3.textTertiary }}>{sp.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'audit-readiness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 24, background: V3.glass2, borderRadius: 14, border: `1px solid ${V3.borderDefault}`, textAlign: 'center' }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: '#4ADE80', lineHeight: 1 }}>92%</div>
            <div style={{ color: V3.textTertiary, fontSize: 14, marginTop: 8 }}>Current Sprint Audit Readiness Score</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, padding: '6px 16px', borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
              <span style={{ fontSize: 12, color: '#4ADE80', fontWeight: 600 }}>● AUDIT READY</span>
            </div>
          </div>
          {[
            { label: 'Evidence Completeness', score: 90, threshold: 85 },
            { label: 'Task Completion Rate', score: 88, threshold: 80 },
            { label: 'Signature Coverage', score: 95, threshold: 90 },
            { label: 'Policy Currency', score: 97, threshold: 95 },
            { label: 'Training Compliance', score: 100, threshold: 90 },
          ].map(m => (
            <div key={m.label} style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{m.label}</span>
                <span style={{ color: m.score >= m.threshold ? '#4ADE80' : V3.orangeLight, fontSize: 13, fontWeight: 600 }}>{m.score}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${m.score}%`, background: m.score >= m.threshold ? '#4ADE80' : V3.orangeLight, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 10, color: V3.textTertiary }}>Threshold: {m.threshold}%</span>
                <span style={{ fontSize: 10, color: m.score >= m.threshold ? '#4ADE80' : V3.orangeLight }}>{m.score >= m.threshold ? '✓ Met' : '✗ Below threshold'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT VIEWER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ArtifactViewerPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)

  const artifacts = [
    { id: 'ART-001', title: 'QAPI Meeting Minutes — Q2 2026', type: 'Meeting Minutes', event: 'QAPI Quarterly Meeting', domain: 'Clinical', uploadedBy: 'J. Smith', uploadDate: 'May 15, 2026', size: '284 KB', status: 'verified', isOverdue: false },
    { id: 'ART-002', title: 'Fire Drill Sign-In Sheet — May 2026', type: 'Sign-In Sheet', event: 'Fire Drill Log Upload', domain: 'Safety', uploadedBy: 'M. Doe', uploadDate: 'May 16, 2026', size: '120 KB', status: 'verified', isOverdue: false },
    { id: 'ART-003', title: 'HIPAA Training Completion Certificate', type: 'Certificate', event: 'HIPAA Annual Training', domain: 'Compliance', uploadedBy: 'T. Lee', uploadDate: 'May 14, 2026', size: '95 KB', status: 'verified', isOverdue: false },
    { id: 'ART-004', title: 'Annual Policy Review — Draft v2', type: 'Document', event: 'Annual Policy Review', domain: 'Compliance', uploadedBy: 'Admin', uploadDate: 'May 19, 2026', size: '1.2 MB', status: 'pending', isOverdue: true },
    { id: 'ART-005', title: 'PPE Training Slide Deck', type: 'Presentation', event: 'Infection Control Update', domain: 'Clinical', uploadedBy: 'E. Vance', uploadDate: 'May 22, 2026', size: '4.8 MB', status: 'pending', isOverdue: false },
    { id: 'ART-006', title: 'Q1 2026 Audit Trail Export', type: 'Export', event: 'Compliance Audit', domain: 'Governance', uploadedBy: 'Admin', uploadDate: 'May 10, 2026', size: '890 KB', status: 'verified', isOverdue: false },
    { id: 'ART-007', title: 'Emergency Contact List — Updated', type: 'Document', event: 'Emergency Plan Review', domain: 'Safety', uploadedBy: 'R. Kim', uploadDate: '', size: '—', status: 'missing', isOverdue: true },
  ]

  const types = [...new Set(artifacts.map(a => a.type))]
  const filtered = filterType ? artifacts.filter(a => a.type === filterType) : artifacts
  const selected = artifacts.find(a => a.id === selectedId) ?? null

  const statusColor = (s: string) => s === 'verified' ? '#4ADE80' : s === 'pending' ? V3.orangeLight : '#F87171'
  const statusLabel = (s: string) => s === 'verified' ? '✓ Verified' : s === 'pending' ? '⏳ Pending Review' : '✗ Missing'

  return (
    <div className="v3-page-animate" style={{ padding: 24, position: 'relative' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Artifact Viewer</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>Compliance evidence repository — view and validate uploaded artifacts</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Verified', value: artifacts.filter(a => a.status === 'verified').length, color: '#4ADE80' },
          { label: 'Pending Review', value: artifacts.filter(a => a.status === 'pending').length, color: V3.orangeLight },
          { label: 'Missing', value: artifacts.filter(a => a.status === 'missing').length, color: '#F87171' },
        ].map((m, i) => (
          <div key={i} style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color, lineHeight: 1 }}>{m.value}</div>
              <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 2 }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + list */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {['All', ...types].map(t => (
          <button key={t} onClick={() => setFilterType(t === 'All' ? null : t)} style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, background: (t === 'All' ? filterType === null : filterType === t) ? V3.teal : V3.glass2, color: (t === 'All' ? filterType === null : filterType === t) ? '#FFF' : V3.textTertiary, border: `1px solid ${V3.borderDefault}`, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, transition: 'margin-right 0.4s ease', marginRight: selected ? 380 : 0 }}>
        {filtered.map(art => (
          <div key={art.id} onClick={() => setSelectedId(selectedId === art.id ? null : art.id)} className="v3-invisible-glare" style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${selectedId === art.id ? V3.borderHighlight : V3.borderDefault}`, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ color: V3.textPrimary, fontSize: 13, fontWeight: 500 }}>{art.title}</span>
                {art.isOverdue && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>OVERDUE</span>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{art.type}</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>·</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{art.domain}</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>·</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{art.event}</span>
              </div>
            </div>
            <div style={{ display: 'flex', align: 'center', gap: 12, marginLeft: 16 }}>
              {art.uploadDate && <span style={{ color: V3.textTertiary, fontSize: 11 }}>{art.uploadDate}</span>}
              <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(art.status) }}>{statusLabel(art.status)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <>
          <div onClick={() => setSelectedId(null)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, zIndex: 999, background: 'rgba(10,12,20,0.95)', borderLeft: `1px solid ${V3.borderHighlight}`, backdropFilter: 'blur(24px)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${V3.borderDefault}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: V3.tealLight, fontWeight: 600, letterSpacing: '0.06em', marginBottom: 4 }}>{selected.id} · {selected.type}</div>
                <div style={{ fontSize: 14, color: V3.textPrimary, fontWeight: 600, lineHeight: 1.4 }}>{selected.title}</div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', color: V3.textTertiary, fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 10, background: `${statusColor(selected.status)}10`, border: `1px solid ${statusColor(selected.status)}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(selected.status) }} />
                <span style={{ color: statusColor(selected.status), fontSize: 12, fontWeight: 600 }}>{statusLabel(selected.status)}</span>
              </div>
              {[{ label: 'Event', value: selected.event }, { label: 'Domain', value: selected.domain }, { label: 'Uploaded by', value: selected.uploadedBy || '—' }, { label: 'Upload date', value: selected.uploadDate || 'Not uploaded' }, { label: 'File size', value: selected.size }].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
                  <span style={{ color: V3.textTertiary, fontSize: 12 }}>{row.label}</span>
                  <span style={{ color: V3.textPrimary, fontSize: 12, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              {selected.status !== 'missing' && (
                <button style={{ marginTop: 8, padding: '10px 0', width: '100%', borderRadius: 8, background: V3.teal, color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Preview Artifact</button>
              )}
              {selected.status === 'missing' && (
                <button style={{ marginTop: 8, padding: '10px 0', width: '100%', borderRadius: 8, background: 'rgba(248,113,113,0.15)', color: '#F87171', fontSize: 13, fontWeight: 600, border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>Upload Required Document</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('users')

  const adminUsers = [
    { id: 'u1', name: 'Jordan Smith', email: 'j.smith@agency.com', role: 'Compliance Officer', status: 'active' as const, lastLogin: '2 hours ago', mfaEnabled: true },
    { id: 'u2', name: 'Elena Vance', email: 'e.vance@agency.com', role: 'DON', status: 'active' as const, lastLogin: '5 hours ago', mfaEnabled: true },
    { id: 'u3', name: 'Marcus Doe', email: 'm.doe@agency.com', role: 'Staff Nurse', status: 'active' as const, lastLogin: '1 day ago', mfaEnabled: false },
    { id: 'u4', name: 'Administrator', email: 'admin@agency.com', role: 'System Admin', status: 'active' as const, lastLogin: '30 min ago', mfaEnabled: true },
    { id: 'u5', name: 'Tony Lee', email: 't.lee@agency.com', role: 'HR Director', status: 'inactive' as const, lastLogin: '7 days ago', mfaEnabled: false },
    { id: 'u6', name: 'Rachel Kim', email: 'r.kim@agency.com', role: 'Safety Officer', status: 'active' as const, lastLogin: '3 hours ago', mfaEnabled: true },
  ]

  const adminRoles = [
    { id: 'r1', name: 'System Admin', description: 'Full system access including user management and configuration', users: 1, permissions: ['All modules', 'User management', 'System config', 'Audit logs'] },
    { id: 'r2', name: 'Compliance Officer', description: 'Access to all compliance workflows, CES, and reports', users: 2, permissions: ['CES Dashboard', 'CES Board', 'Reports', 'Policy Library', 'Audit Trail'] },
    { id: 'r3', name: 'DON', description: 'Clinical operations and compliance oversight', users: 1, permissions: ['Clinical modules', 'CES Dashboard', 'Reports', 'Evidence Center'] },
    { id: 'r4', name: 'Staff Nurse', description: 'Patient care and task completion', users: 8, permissions: ['Patients', 'Visit Schedule', 'Forms', 'My Planner'] },
    { id: 'r5', name: 'HR Director', description: 'Workforce management and training compliance', users: 1, permissions: ['Workforce', 'Training', 'Onboarding', 'Reports'] },
  ]

  const systemConfig = [
    { section: 'Authentication', items: [{ key: 'MFA Enforcement', value: 'Required for Admin roles', status: 'active' }, { key: 'Session Timeout', value: '8 hours', status: 'active' }, { key: 'Password Policy', value: 'Min 12 chars, mixed case + special', status: 'active' }] },
    { section: 'Notifications', items: [{ key: 'Overdue Task Alerts', value: 'Daily at 8:00 AM', status: 'active' }, { key: 'Evidence Gap Reminders', value: '48h before deadline', status: 'active' }, { key: 'Audit Readiness Report', value: 'Weekly on Monday', status: 'inactive' }] },
    { section: 'Integrations', items: [{ key: 'EHR Connector', value: 'Connected — Kinnser', status: 'active' }, { key: 'Hubstaff', value: 'Connected', status: 'active' }, { key: 'ACHC Portal', value: 'Not configured', status: 'inactive' }] },
  ]

  const auditLog = [
    { id: 'AL-001', timestamp: 'May 22, 2026 10:14 AM', user: 'j.smith', action: 'Uploaded artifact', resource: 'ART-001 · QAPI Meeting Minutes', severity: 'info' as const },
    { id: 'AL-002', timestamp: 'May 22, 2026 09:55 AM', user: 'admin', action: 'Updated user role', resource: 'User: t.lee → HR Director', severity: 'warning' as const },
    { id: 'AL-003', timestamp: 'May 22, 2026 09:30 AM', user: 'e.vance', action: 'Completed task', resource: 'T-006 · IC-WP-14', severity: 'info' as const },
    { id: 'AL-004', timestamp: 'May 22, 2026 08:02 AM', user: 'admin', action: 'System config changed', resource: 'Session timeout: 4h → 8h', severity: 'critical' as const },
    { id: 'AL-005', timestamp: 'May 21, 2026 04:48 PM', user: 'm.doe', action: 'Login from new device', resource: 'IP: 192.168.1.44', severity: 'warning' as const },
    { id: 'AL-006', timestamp: 'May 21, 2026 03:12 PM', user: 'r.kim', action: 'Failed login attempt', resource: '3 failed attempts', severity: 'critical' as const },
  ]

  const tabs: { id: AdminTab; label: string }[] = [
    { id: 'users', label: 'Users' }, { id: 'roles', label: 'Roles & Permissions' }, { id: 'system', label: 'System Config' }, { id: 'audit-log', label: 'Audit Log' },
  ]

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Administration</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>User management, roles, system configuration, and audit logs</p>
      </div>

      <div style={{ display: 'flex', gap: 4, background: V3.glass2, borderRadius: 10, padding: 4, marginBottom: 28, width: 'fit-content', border: `1px solid ${V3.borderDefault}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 18px', fontSize: 13, borderRadius: 7, background: tab === t.id ? V3.teal : 'transparent', color: tab === t.id ? '#FFF' : V3.textTertiary, border: 'none', cursor: 'pointer', fontWeight: tab === t.id ? 600 : 400, transition: 'all 0.25s ease', whiteSpace: 'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adminUsers.map(u => (
            <div key={u.id} style={{ padding: 16, background: V3.glass2, borderRadius: 12, border: `1px solid ${V3.borderDefault}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: V3.navySub, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${V3.borderDefault}`, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: V3.textSecondary, fontWeight: 600 }}>{u.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <div style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                  <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 1 }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: V3.textSecondary, fontSize: 12 }}>{u.role}</span>
                <span style={{ color: V3.textTertiary, fontSize: 11 }}>{u.lastLogin}</span>
                {u.mfaEnabled && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(0,209,193,0.1)', color: V3.tealLight }}>MFA</span>}
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: u.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(100,116,139,0.2)', color: u.status === 'active' ? '#4ADE80' : V3.textTertiary }}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {adminRoles.map(r => (
            <div key={r.id} style={{ padding: 20, background: V3.glass2, borderRadius: 14, border: `1px solid ${V3.borderDefault}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ color: V3.textPrimary, fontSize: 15, fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 3 }}>{r.description}</div>
                </div>
                <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, background: V3.navySub, color: V3.textSecondary }}>{r.users} {r.users === 1 ? 'user' : 'users'}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.permissions.map(p => (
                  <span key={p} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(0,209,193,0.06)', color: V3.tealLight, border: '1px solid rgba(0,209,193,0.12)' }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {systemConfig.map(section => (
            <div key={section.section}>
              <h3 style={{ color: V3.textSecondary, fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>{section.section}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map(item => (
                  <div key={item.key} style={{ padding: '12px 16px', background: V3.glass2, borderRadius: 10, border: `1px solid ${V3.borderDefault}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: V3.textPrimary, fontSize: 13 }}>{item.key}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: V3.textSecondary, fontSize: 12 }}>{item.value}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 8, background: item.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(100,116,139,0.15)', color: item.status === 'active' ? '#4ADE80' : V3.textTertiary }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'audit-log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {auditLog.map(entry => (
            <div key={entry.id} style={{ padding: '12px 16px', background: V3.glass2, borderRadius: 10, border: `1px solid ${entry.severity === 'critical' ? 'rgba(248,113,113,0.2)' : entry.severity === 'warning' ? 'rgba(251,191,36,0.15)' : V3.borderDefault}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: entry.severity === 'critical' ? '#F87171' : entry.severity === 'warning' ? '#FBBF24' : V3.tealLight }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: V3.tealLight, fontSize: 11, fontWeight: 600 }}>{entry.user}</span>
                  <span style={{ color: V3.textPrimary, fontSize: 12 }}>{entry.action}</span>
                </div>
                <div style={{ color: V3.textTertiary, fontSize: 11, marginTop: 2 }}>{entry.resource}</div>
              </div>
              <span style={{ color: V3.textTertiary, fontSize: 11, whiteSpace: 'nowrap' }}>{entry.timestamp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PageContent({
  section,
  isMobile,
  navigate,
}: {
  section: SectionId
  isMobile: boolean
  navigate: (id: SectionId) => void
}) {
  switch (section) {
    case 'dashboard':
      return <DashboardPage navigate={navigate} />
    case 'my-planner':
      return <MyPlannerPage />
    case 'clinicians':
      return <CliniciansPage />
    case 'patients':
      return <PatientsPage />
    case 'calendar':
      return <CalendarPage />
    case 'brad':
      return <BradPage />
    case 'library':
      return <PolicyLibraryPage navigate={navigate} />
    case 'policy-detail':
      return <PolicyDetailPage navigate={navigate} />
    case 'forms':
      return <FormsLibraryPage />
    case 'evidence':
      return <EvidencePage />
    case 'onboarding':
      return <OnboardingPage isMobile={isMobile} />
    case 'domain-library':
      return <DomainLibraryPage />
    case 'referring-physicians':
      return <ReferringPhysiciansPage />
    case 'visit-schedule':
      return <VisitSchedulePage isMobile={isMobile} />
    case 'missed-visits':
      return <MissedVisitsPage isMobile={isMobile} />
    case 'hubstaff':
      return <HubstaffPage isMobile={isMobile} />
    case 'user-guides':
      return <UserGuidesPage isMobile={isMobile} />
    case 'sop-library':
      return <SopLibraryPage />
    case 'training-materials':
      return <TrainingMaterialsPage isMobile={isMobile} />
    case 'help-center':
      return <HelpCenterPage isMobile={isMobile} />
    case 'demo':
      return <DemoPage isMobile={isMobile} />
    case 'audit-trail':
      return <AuditTrailPage />
    case 'ces-dashboard':
      return <CesDashboardPage />
    case 'ces-board':
      return <CesBoardPage />
    case 'reports':
      return <ReportsPage />
    case 'artifact-viewer':
      return <ArtifactViewerPage />
    case 'admin':
      return <AdminPage />
    default:
      return <DashboardPage navigate={navigate} />
  }
}

function DashboardPage({ navigate }: { navigate: (id: SectionId) => void }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={LayoutDashboard}
        micro="AGENCY OPERATIONS"
        title="Dashboard"
        subtitle="Enterprise readiness, sprint pressure, and evidence momentum across the organization."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {[
          { label: 'READINESS SCORE', value: '82%', color: V3.tealLight },
          { label: 'OPEN OBLIGATIONS', value: '47' },
          { label: 'THIS WEEK TASKS', value: `${TASKS.length}` },
          { label: 'EVIDENCE LINK RATE', value: '91%', color: V3.tealLight },
        ].map(stat => (
          <div key={stat.label} className="v3-invisible-glare" style={{ padding: '16px 18px', border: `1px solid ${V3.borderDefault}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: V3.textTertiary }}>{stat.label}</div>
            <div style={{ fontSize: 26, marginTop: 6, fontWeight: 600, color: stat.color ?? V3.textPrimary }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: V3.textPrimary }}>Priority Queue</h3>
            <button
              type="button"
              onClick={() => navigate('my-planner')}
              className="btn-smooth-hover"
              style={{ background: 'transparent', border: `1px solid ${V3.borderHighlight}`, borderRadius: 8, color: V3.textSecondary, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}
            >
              Open My Planner
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TASKS.slice(0, 6).map(task => (
              <div
                key={task.id}
                className="v3-invisible-glare"
                style={{
                  border: task.overdue ? `1px solid rgba(255, 160, 89, 0.33)` : `1px solid rgba(255,255,255,0.08)`,
                  background: task.overdue ? 'rgba(255, 160, 89, 0.03)' : 'transparent',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '110px 1fr 80px',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: V3.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase' }}>{task.domain}</div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: V3.textSecondary }}>{task.code}</div>
                </div>
                <div style={{ fontSize: 13, color: V3.textPrimary }}>{task.title}</div>
                <div style={{ textAlign: 'right', fontSize: 11, color: task.overdue ? V3.orangeLight : V3.textTertiary }}>{task.due}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, padding: '20px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.textTertiary }}>Compliance Pulse</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: V3.textPrimary }}>Stable</div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', borderRadius: 999, background: V3.tealLight }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: V3.textSecondary }}>82% of controls verified in-cycle.</div>
          </div>

          <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, padding: '20px' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.textTertiary, marginBottom: 10 }}>Quick Jump</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              {[
                { label: 'Policy Library', id: 'library' as SectionId },
                { label: 'Evidence Center', id: 'evidence' as SectionId },
                { label: 'Audit Trail', id: 'audit-trail' as SectionId },
              ].map(link => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigate(link.id)}
                  className="btn-smooth-hover"
                  style={{
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: `1px solid rgba(255,255,255,0.08)`,
                    background: 'transparent',
                    color: V3.textSecondary,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MyPlannerPage() {
  const overdue = TASKS.filter(task => task.overdue)
  const active = TASKS.filter(task => !task.overdue).slice(0, 3)
  const queued = TASKS.filter(task => !task.overdue).slice(3)

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={CheckSquare}
        micro="MY PERSONAL WORKSPACE"
        title="My Planner"
        subtitle="Personal sprint cockpit for high-priority obligations and operational follow-through."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
        {[
          { label: 'OVERDUE', value: String(overdue.length), color: V3.orangeLight },
          { label: 'ACTIVE', value: String(active.length) },
          { label: 'QUEUED', value: String(queued.length) },
          { label: 'COMPLETION RATE', value: '73%', color: V3.tealLight },
        ].map(stat => (
          <div key={stat.label} className="v3-invisible-glare" style={{ padding: '14px 18px', border: `1px solid ${V3.borderDefault}` }}>
            <div style={{ fontSize: 10, letterSpacing: 0.5, color: V3.textTertiary, fontWeight: 700, textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600, color: stat.color ?? V3.textPrimary }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        {[
          { title: 'Overdue', items: overdue },
          { title: 'In Flight', items: active },
          { title: 'Queued', items: queued },
        ].map(column => (
          <div key={column.title} className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: V3.tealLight, textTransform: 'uppercase', marginBottom: 10 }}>{column.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {column.items.map(task => (
                <div
                  key={task.id}
                  className="v3-invisible-glare"
                  style={{
                    border: task.overdue ? `1px solid rgba(255,160,89,0.33)` : `1px solid rgba(255,255,255,0.08)`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    background: task.overdue ? 'rgba(255,160,89,0.02)' : 'transparent',
                  }}
                >
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: V3.textTertiary }}>{task.code}</div>
                  <div style={{ marginTop: 4, fontSize: 13, color: V3.textPrimary, lineHeight: 1.3 }}>{task.title}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: task.overdue ? V3.orangeLight : V3.textSecondary }}>Due {task.due}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CliniciansPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={Users}
        micro="PHASE 1 • READ-ONLY"
        title="Clinician Profiles"
        subtitle="Role-based roster with case load, audit status, and readiness flags."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '10px 16px', maxWidth: 380 }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search clinicians..." style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 13 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 16 }}>
          <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Name</span>
          <span style={{ flex: 1.4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Role</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Status</span>
          <span style={{ flex: 0.8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Cases</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Audit</span>
        </div>
        {CLINICIANS.map(person => (
          <div key={person.id} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 16, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: V3.textSecondary, fontWeight: 700 }}>
                {person.name
                  .split(' ')
                  .filter(chunk => chunk.length > 1)
                  .slice(0, 2)
                  .map(chunk => chunk[0])
                  .join('')}
              </span>
              <span style={{ fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{person.name}</span>
            </div>
            <span style={{ flex: 1.4, fontSize: 12, color: V3.textSecondary }}>{person.role}</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: person.status === 'Compliant' ? V3.tealLight : V3.textSecondary }}>{person.status}</span>
            <span style={{ flex: 0.8, fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{person.cases}</span>
            <span style={{ flex: 1, fontSize: 12, color: person.audit === 'Passed' ? V3.tealLight : V3.textSecondary }}>{person.audit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PatientsPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={Activity}
        micro="STEP 2 READ-ONLY"
        title="Patient Profiles"
        subtitle="Patient census with acuity posture, setting, and assigned accountability owner."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '10px 16px', maxWidth: 380 }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search patients..." style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 13 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 16 }}>
          <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Patient</span>
          <span style={{ flex: 1.3, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Acuity</span>
          <span style={{ flex: 0.8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Setting</span>
          <span style={{ flex: 0.6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Zone</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>ACCM</span>
          <span style={{ flex: 0.9, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>MRN</span>
        </div>
        {PATIENTS.map(patient => (
          <div key={patient.mrn} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 16, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <span style={{ flex: 2, fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{patient.name}</span>
            <span style={{ flex: 1.3, fontSize: 12, color: patient.acuity.includes('Level 1') ? V3.textSecondary : V3.tealLight }}>{patient.acuity}</span>
            <span style={{ flex: 0.8, fontSize: 12, color: V3.textSecondary }}>{patient.setting}</span>
            <span style={{ flex: 0.6, fontSize: 12, color: V3.textSecondary }}>{patient.zone}</span>
            <span style={{ flex: 1, fontSize: 12, color: V3.textPrimary }}>{patient.accm}</span>
            <span style={{ flex: 0.9, fontSize: 12, color: V3.textTertiary, fontFamily: 'monospace' }}>{patient.mrn}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarPage() {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells = Array.from({ length: 35 }, (_, idx) => idx - 3)
  const events: Record<number, string[]> = {
    4: ['2 visits'],
    5: ['1 admission'],
    8: ['3 visits'],
    12: ['2 visits'],
    17: ['QAPI'],
    20: ['6 visits'],
    21: ['4 visits'],
    26: ['Board prep'],
    28: ['Survey drill'],
  }

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={Calendar} micro="SCHEDULING & COVERAGE" title="Calendar" subtitle="Operational schedule for field visits, committee cycles, and deadline anchors." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: V3.textPrimary }}>May 2026</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Clinical', 'QAPI', 'Governance'].map((chip, index) => (
            <button
              key={chip}
              type="button"
              className="btn-smooth-hover"
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: index === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
                background: index === 0 ? 'rgba(0,209,193,0.1)' : 'transparent',
                color: index === 0 ? V3.textPrimary : V3.textSecondary,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {weekDays.map(day => (
          <div key={day} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: V3.textTertiary, padding: '4px 8px' }}>
            {day}
          </div>
        ))}
        {cells.map(day => {
          const valid = day > 0 && day <= 31
          const isToday = day === 20
          const items = valid ? events[day] ?? [] : []
          return (
            <div
              key={day}
              className="v3-invisible-glare"
              style={{
                minHeight: 96,
                borderRadius: 12,
                border: isToday ? `1px solid ${V3.tealLight}` : `1px solid rgba(255,255,255,0.08)`,
                background: isToday ? 'rgba(0,209,193,0.05)' : 'transparent',
                padding: 10,
                opacity: valid ? 1 : 0.35,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: valid ? V3.textPrimary : V3.textTertiary }}>{valid ? day : ''}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map(item => (
                  <span key={item} style={{ fontSize: 10, color: V3.tealLight, background: 'rgba(0,209,193,0.1)', borderRadius: 6, padding: '2px 6px', width: 'fit-content' }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BradPage() {
  const messages = [
    {
      from: 'Brad AI',
      body: 'I flagged 5 obligations with evidence age over 30 days. Would you like a remediation sprint draft?',
    },
    {
      from: 'Admin User',
      body: 'Yes, and prioritize CL-WP-25 and QA-WP-12 with owners and due windows.',
    },
    {
      from: 'Brad AI',
      body: 'Draft prepared. I assigned Dr. Vance and M. Gonzales with a 7-day completion lane and one governance checkpoint.',
    },
  ]

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={Bot} micro="AI INTELLIGENCE" title="Brad AI Copilot" subtitle="Run compliance queries, generate remediation drafts, and simulate board-ready summaries." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((message, index) => {
          const user = message.from === 'Admin User'
          return (
            <div
              key={index}
              className="v3-invisible-glare"
              style={{
                marginLeft: user ? 'auto' : 0,
                maxWidth: '82%',
                border: `1px solid ${user ? 'rgba(0,209,193,0.28)' : V3.borderDefault}`,
                background: user ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: user ? V3.tealLight : V3.tealLight, marginBottom: 6 }}>{message.from}</div>
              <div style={{ fontSize: 13, color: user ? V3.textPrimary : V3.textPrimary, lineHeight: 1.5 }}>{message.body}</div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', border: `1px solid ${V3.borderDefault}`, background: V3.glass3, borderRadius: 12, padding: 12 }}>
        <input
          placeholder="Ask Brad about CMS obligations, evidence gaps, or sprint planning..."
          style={{ flex: 1, background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: 14 }}
        />
        <button
          type="button"
          className="btn-smooth-hover"
          style={{ border: 'none', background: V3.tealLight, color: '#000', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

function PolicyLibraryPage({ navigate }: { navigate: (id: SectionId) => void }) {
  const policies = [
    {
      id: 'GV-GB-001',
      title: 'Governing Body Authority & Responsibilities',
      domain: 'Governance',
      lifecycle: 'Published',
      achc: 'Live Viewer',
      owner: 'Governing Body Chair',
      updated: 'Jul 2025',
    },
    {
      id: 'CL-POL-101',
      title: 'Comprehensive Assessment Protocol',
      domain: 'Clinical',
      lifecycle: 'Published',
      achc: 'Mapped',
      owner: 'Dr. Vance',
      updated: 'May 2026',
    },
    {
      id: 'QA-POL-065',
      title: 'QAPI Trend Escalation Standard',
      domain: 'QAPI',
      lifecycle: 'Review',
      achc: 'In Progress',
      owner: 'M. Gonzales',
      updated: 'Apr 2026',
    },
    {
      id: 'SA-POL-037',
      title: 'Emergency Preparedness Response',
      domain: 'Safety',
      lifecycle: 'Published',
      achc: 'Mapped',
      owner: 'D. Cho',
      updated: 'May 2026',
    },
    {
      id: 'HR-POL-042',
      title: 'Competency Verification Framework',
      domain: 'HR',
      lifecycle: 'Draft',
      achc: 'Pending',
      owner: 'Admin User',
      updated: 'Mar 2026',
    },
    {
      id: 'IT-POL-021',
      title: 'ePHI Access Control Matrix',
      domain: 'IT',
      lifecycle: 'Published',
      achc: 'Mapped',
      owner: 'D. Cho',
      updated: 'May 2026',
    },
    {
      id: 'GV-POL-010',
      title: 'Governing Body Reporting Cadence',
      domain: 'Governance',
      lifecycle: 'Review',
      achc: 'In Progress',
      owner: 'M. Gonzales',
      updated: 'Apr 2026',
    },
  ]

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={Shield} micro="COMPLIANCE EXECUTION" title="Policy Library" subtitle="Enterprise registry of policies with lifecycle state and ownership accountability." />

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '10px 14px', minWidth: 280 }}>
          <Search size={14} color={V3.textTertiary} />
          <input
            placeholder="Search policy title, owner, domain..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 12 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All Domains', 'Clinical', 'QAPI', 'Safety', 'HR', 'IT', 'Governance'].map((tab, index) => (
            <button
              key={tab}
              type="button"
              className="btn-smooth-hover"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: index === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
                background: index === 0 ? 'rgba(0,209,193,0.1)' : 'transparent',
                color: index === 0 ? V3.textPrimary : V3.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All Lifecycle', 'Draft', 'Review', 'Published', 'Archived', 'ACHC Mapped'].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className="btn-smooth-hover"
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: index === 0 ? `1px solid ${V3.borderHighlight}` : '1px solid transparent',
              background: index === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
              color: index === 0 ? V3.textPrimary : V3.textSecondary,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {policies.map(policy => (
          <button
            key={policy.id}
            type="button"
            className="v3-invisible-glare btn-smooth-hover"
            onClick={() => navigate('policy-detail')}
            style={{
              border: policy.id === 'GV-GB-001' ? `1px solid ${V3.tealLight}` : `1px solid rgba(255,255,255,0.15)`,
              background: 'transparent',
              borderRadius: 12,
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: V3.textTertiary, fontFamily: 'monospace' }}>{policy.id}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ fontSize: 10, color: V3.tealLight, background: 'rgba(0,209,193,0.1)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                  {policy.lifecycle}
                </span>
                <span style={{ fontSize: 10, color: V3.tealLight, background: 'rgba(0,209,193,0.08)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                  {policy.achc}
                </span>
                {policy.id === 'GV-GB-001' && (
                  <span style={{ fontSize: 10, color: V3.orangeLight, background: 'rgba(255,160,89,0.12)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                    Featured
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>{policy.title}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span style={{ fontSize: 12, color: V3.textSecondary }}>{policy.domain}</span>
              <span style={{ fontSize: 12, color: V3.textTertiary }}>{policy.updated}</span>
            </div>
            <div style={{ fontSize: 11, color: V3.textTertiary }}>Owner: {policy.owner}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PolicyDetailPage({ navigate }: { navigate: (id: SectionId) => void }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column' }}>
      <GVGBDetailView onBackToLibrary={() => navigate('library')} />
    </div>
  )
}

function FormsLibraryPage() {
  const forms = [
    {
      name: 'Patient Admission Consent',
      type: 'Mandatory',
      version: 'v2.1',
      status: 'Ready',
      signers: 2,
      updated: 'May 16',
      desc: 'Core admission packet with acknowledgement and consent signatures.',
    },
    {
      name: 'Missed Visit Documentation',
      type: 'Mandatory',
      version: 'v1.4',
      status: 'Ready',
      signers: 1,
      updated: 'May 14',
      desc: 'Required record for documenting reason and follow-up after missed visits.',
    },
    {
      name: 'Competency Verification Checklist',
      type: 'Operational',
      version: 'v3.0',
      status: 'Draft',
      signers: 2,
      updated: 'May 10',
      desc: 'Clinician competency validation with supervisor attestation.',
    },
    {
      name: 'Incident Response Intake',
      type: 'Safety',
      version: 'v1.9',
      status: 'Ready',
      signers: 3,
      updated: 'May 08',
      desc: 'Initial intake for safety incidents with escalation routing.',
    },
    {
      name: 'QAPI Action Worksheet',
      type: 'Quality',
      version: 'v2.6',
      status: 'Review',
      signers: 2,
      updated: 'May 11',
      desc: 'Structured worksheet for corrective actions and outcome tracking.',
    },
    {
      name: 'Board Packet Sign-Off',
      type: 'Governance',
      version: 'v1.2',
      status: 'Ready',
      signers: 4,
      updated: 'May 09',
      desc: 'Digital approval and attestation for governing body packet releases.',
    },
  ]

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={CheckCircle2} micro="eCIGN FORMS" title="Enterprise Forms Library" subtitle="Digital forms for compliance workflow execution and signing." />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '9px 14px', minWidth: 260 }}>
          <Search size={14} color={V3.textTertiary} />
          <input placeholder="Search forms..." style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 12 }} />
        </div>
        {['All', 'Ready', 'Draft', 'Review', 'Mandatory', 'Operational'].map((chip, index) => (
          <button
            key={chip}
            type="button"
            className="btn-smooth-hover"
            style={{
              padding: '7px 12px',
              borderRadius: 8,
              border: index === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
              background: index === 0 ? 'rgba(0,209,193,0.1)' : 'transparent',
              color: index === 0 ? V3.textPrimary : V3.textSecondary,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {forms.map(form => (
          <div key={form.name} className="v3-invisible-glare" style={{ border: `1px solid rgba(255,255,255,0.15)`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.tealLight, fontWeight: 700 }}>{form.type}</span>
              <span style={{ fontSize: 11, color: V3.textTertiary }}>{form.version}</span>
            </div>
            <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>{form.name}</div>
            <div style={{ fontSize: 13, color: V3.textSecondary, lineHeight: 1.4 }}>{form.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: V3.textTertiary }}>
              <span>{form.signers} signer(s)</span>
              <span>Updated {form.updated}</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.tealLight }}>{form.status}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <button type="button" className="btn-smooth-hover" style={{ border: 'none', background: V3.tealLight, color: '#000', fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                Start eCign
              </button>
              <button type="button" className="btn-smooth-hover" style={{ border: `1px solid ${V3.borderHighlight}`, background: 'transparent', color: V3.textSecondary, fontSize: 12, fontWeight: 600, borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EvidencePage() {
  const artifacts = [
    { title: 'Q1 QAPI Committee Minutes', source: 'QA-WP-01', status: 'Attached', date: 'May 20, 2026' },
    { title: 'Fire Drill Log — Zone A', source: 'SA-WP-06', status: 'Attached', date: 'May 19, 2026' },
    { title: 'HIPAA Risk Assessment', source: 'IT-WP-21', status: 'Pending Link', date: 'May 18, 2026' },
    { title: 'Clinician Competency Summary', source: 'HR-WP-12', status: 'Attached', date: 'May 18, 2026' },
    { title: 'Board Governance Packet', source: 'GV-WP-01', status: 'Attached', date: 'May 16, 2026' },
  ]

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={FolderOpen} micro="EVIDENCE MANAGEMENT" title="Evidence Center" subtitle="Centralized artifact vault with chain-of-custody context and route linkage." />

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: V3.tealLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Evidence Tree</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: V3.textSecondary }}>
            {[
              'Clinical Operations',
              'Quality Assurance',
              'Safety & Emergency',
              'Human Resources',
              'Governance',
              'IT Security',
            ].map((node, idx) => (
              <button key={node} type="button" className="btn-smooth-hover" style={{ border: 'none', background: idx === 0 ? 'rgba(0,209,193,0.08)' : 'transparent', textAlign: 'left', color: idx === 0 ? V3.textPrimary : V3.textSecondary, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
                {node}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', padding: '12px 16px', gap: 14 }}>
            <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Artifact</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Source</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Status</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Date</span>
          </div>
          {artifacts.map(entry => (
            <div key={entry.title} className="v3-invisible-glare" style={{ display: 'flex', padding: '14px 16px', gap: 14, borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
              <span style={{ flex: 2, fontSize: 13, color: V3.textPrimary, fontWeight: 600 }}>{entry.title}</span>
              <span style={{ flex: 1, fontSize: 12, color: V3.textSecondary }}>{entry.source}</span>
              <span style={{ flex: 1, fontSize: 11, color: entry.status === 'Attached' ? V3.tealLight : V3.textSecondary, textTransform: 'uppercase', fontWeight: 700 }}>{entry.status}</span>
              <span style={{ flex: 1, fontSize: 12, color: V3.textTertiary }}>{entry.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OnboardingPage({ isMobile }: { isMobile: boolean }) {
  const tracks = [
    { title: 'Gate 1: Intake & Identity', owner: 'Admin User', progress: 100, status: 'Complete' },
    { title: 'Gate 2: Clinical Competency', owner: 'Dr. Vance', progress: 76, status: 'In Progress' },
    { title: 'Gate 3: Compliance & Policy', owner: 'M. Gonzales', progress: 58, status: 'In Progress' },
    { title: 'Gate 4: Final Governance', owner: 'Board Coordinator', progress: 22, status: 'Pending' },
  ]

  const batches = [
    { name: 'Spring RN Cohort', members: 9, due: 'May 28', risk: 'On Track' },
    { name: 'PT/OT Fast Track', members: 6, due: 'May 25', risk: 'Attention' },
    { name: 'Per-Diem Onboarding', members: 12, due: 'Jun 02', risk: 'On Track' },
  ]

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={User}
        micro="WORKFORCE ENABLEMENT"
        title="Onboarding"
        subtitle="Pipeline view of clinician activation, competency validation, and governance sign-off."
      />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'ACTIVE COHORTS', value: '3' },
          { label: 'IN PROGRESS', value: '18', color: V3.tealLight },
          { label: 'COMPLETED THIS MONTH', value: '14' },
          { label: 'PENDING GOVERNANCE', value: '5', color: V3.tealLight },
        ].map(stat => (
          <div key={stat.label} className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: V3.textTertiary, textTransform: 'uppercase' }}>{stat.label}</div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 600, color: stat.color ?? V3.textPrimary }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 16 }}>
        <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: V3.tealLight, marginBottom: 12 }}>
            Gate Progress
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tracks.map(track => (
              <div key={track.title} className="v3-invisible-glare" style={{ border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 600 }}>{track.title}</div>
                    <div style={{ marginTop: 3, fontSize: 11, color: V3.textTertiary }}>Owner: {track.owner}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: track.status === 'Pending' ? V3.textSecondary : V3.tealLight }}>
                    {track.status}
                  </div>
                </div>
                <div style={{ marginTop: 10, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${track.progress}%`, height: '100%', background: V3.tealLight, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: V3.tealLight, marginBottom: 12 }}>
            Cohort Batches
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {batches.map(batch => (
              <div key={batch.name} className="v3-invisible-glare" style={{ border: `1px solid rgba(255,255,255,0.08)`, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 600 }}>{batch.name}</div>
                <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: V3.textSecondary }}>
                  <span>{batch.members} members</span>
                  <span>Due {batch.due}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, textTransform: 'uppercase', fontWeight: 700, color: batch.risk === 'Attention' ? V3.orangeLight : V3.textSecondary }}>
                  {batch.risk}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DomainLibraryPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock
        icon={Network}
        micro="REGULATORY FRAMEWORK"
        title="Domain Library"
        subtitle="Comprehensive registry of all compliance domains, sub-domains, and regulatory cross-references."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', maxWidth: '400px' }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search domains, sub-domains, CMS references..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          {
            code: 'CL',
            name: 'Clinical Operations',
            desc: 'Patient care delivery, assessments, plans of care, clinical documentation, and outcome tracking.',
            cmsRefs: ['§484.50', '§484.55', '§484.60', '§484.80'],
            controls: 89,
            compliant: 34,
            critical: 15,
            subdomains: ['Patient Rights', 'Plan of Care', 'Drug Regimen Review', 'Comprehensive Assessment', 'Clinical Records', 'Aide Services', 'Discharge Planning'],
          },
          {
            code: 'QA',
            name: 'Quality Assurance & QAPI',
            desc: 'Quality Assessment and Performance Improvement program governance, data aggregation, and PIP execution.',
            cmsRefs: ['§484.65'],
            controls: 72,
            compliant: 22,
            critical: 15,
            subdomains: ['QAPI Committee', 'KPI Monitoring', 'Performance Indicators', 'Trend Analysis', 'Plan for Improvement', 'Governing Body Reports'],
          },
          {
            code: 'SA',
            name: 'Safety & Emergency Preparedness',
            desc: 'Emergency response protocols, fire safety, disaster preparedness, and incident management.',
            cmsRefs: ['§484.102'],
            controls: 55,
            compliant: 18,
            critical: 12,
            subdomains: ['Emergency Plan', 'Fire Drills', 'Incident Reporting', 'Risk Assessment', 'Safety Training', 'Evacuation Procedures'],
          },
          {
            code: 'HR',
            name: 'Human Resources & Workforce',
            desc: 'Personnel qualifications, competency validation, training compliance, and workforce management.',
            cmsRefs: ['§484.115'],
            controls: 68,
            compliant: 15,
            critical: 23,
            subdomains: ['Personnel Records', 'Competency Evaluation', 'Background Checks', 'Continuing Education', 'Code of Conduct', 'Credentialing'],
          },
        ].map(domain => (
          <div key={domain.code} className="v3-invisible-glare" style={{ padding: '24px', border: `1px solid rgba(255,255,255,0.15)`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: V3.tealLight, padding: '6px 12px', background: 'rgba(0,209,193,0.08)', borderRadius: '6px', fontFamily: 'monospace' }}>
                  {domain.code}
                </span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{domain.name}</h3>
                  <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '4px 0 0 0', lineHeight: 1.4 }}>{domain.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.textPrimary }}>{domain.controls}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Controls</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.tealLight }}>{domain.compliant}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Compliant</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.orangeLight }}>{domain.critical}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Critical</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>CMS:</span>
              {domain.cmsRefs.map(ref => (
                <span key={ref} style={{ fontSize: '11px', fontFamily: 'monospace', color: V3.textSecondary, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                  {ref}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
              {domain.subdomains.map(sub => (
                <button key={sub} type="button" className="btn-smooth-hover" style={{ fontSize: '12px', fontWeight: 500, color: V3.textSecondary, padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', border: `1px solid rgba(255,255,255,0.08)`, background: 'transparent' }}>
                  {sub}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((domain.compliant / domain.controls) * 100)}%`, height: '100%', background: V3.tealLight, borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: V3.tealLight, minWidth: '40px' }}>{Math.round((domain.compliant / domain.controls) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReferringPhysiciansPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Users} micro="PHYSICIAN NETWORK" title="Referring Physicians" subtitle="Physician referral network registry with order tracking and credentialing status." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', width: '360px' }}>
          <Search size={16} color={V3.textTertiary} />
          <input placeholder="Search by name, NPI, or specialty..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
        </div>
        <button type="button" className="btn-smooth-hover" style={{ padding: '10px 20px', background: V3.tealLight, border: 'none', color: '#000', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
          + Add Physician
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Physician</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>NPI</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Specialty</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Active Orders</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Credential Status</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Referral</span>
        </div>
        {[
          { name: 'Dr. Michael Roberts, MD', npi: '1234567890', specialty: 'Internal Medicine', orders: 14, credential: 'Verified', lastRef: 'May 18, 2026' },
          { name: 'Dr. Patricia Chen, DO', npi: '2345678901', specialty: 'Family Medicine', orders: 9, credential: 'Verified', lastRef: 'May 15, 2026' },
          { name: 'Dr. James Williams, MD', npi: '3456789012', specialty: 'Cardiology', orders: 6, credential: 'Pending', lastRef: 'May 10, 2026' },
          { name: 'Dr. Angela Davis, MD', npi: '4567890123', specialty: 'Pulmonology', orders: 4, credential: 'Verified', lastRef: 'May 8, 2026' },
          { name: 'Dr. Robert Kim, DO', npi: '5678901234', specialty: 'Geriatrics', orders: 11, credential: 'Verified', lastRef: 'May 19, 2026' },
          { name: 'Dr. Susan Martinez, MD', npi: '6789012345', specialty: 'Neurology', orders: 3, credential: 'Expired', lastRef: 'Apr 22, 2026' },
          { name: 'Dr. David Johnson, MD', npi: '7890123456', specialty: 'Orthopedics', orders: 8, credential: 'Verified', lastRef: 'May 12, 2026' },
          { name: 'Dr. Emily Watson, DO', npi: '8901234567', specialty: 'Endocrinology', orders: 2, credential: 'Pending', lastRef: 'May 5, 2026' },
        ].map((doc, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.2)', color: V3.textSecondary, flexShrink: 0 }}>
                {doc.name
                  .split(' ')
                  .filter(w => w.length > 1 && !w.includes('.'))
                  .slice(0, 2)
                  .map(w => w[0])
                  .join('')}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>{doc.name}</span>
            </div>
            <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: V3.textTertiary }}>{doc.npi}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{doc.specialty}</span>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>{doc.orders}</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: doc.credential === 'Verified' ? V3.tealLight : doc.credential === 'Expired' ? V3.orangeLight : V3.textSecondary }}>
              {doc.credential}
            </span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textTertiary }}>{doc.lastRef}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisitSchedulePage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Calendar} micro="SCHEDULING & VISITS" title="Visit Schedule" subtitle="Daily and weekly home health visit assignments across all zones and disciplines." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Today', 'Tomorrow', 'This Week', 'Next Week'].map((tab, idx) => (
            <button
              key={tab}
              className="btn-smooth-hover"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All Zones', 'Zone A', 'Zone B', 'Zone C'].map((zone, idx) => (
            <button
              key={zone}
              className="btn-smooth-hover"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                background: idx === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${idx === 0 ? V3.borderHighlight : 'transparent'}`,
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL VISITS', value: '24' },
          { label: 'COMPLETED', value: '8', color: V3.tealLight },
          { label: 'IN PROGRESS', value: '3', color: V3.tealLight },
          { label: 'UPCOMING', value: '11' },
          { label: 'MISSED/CANCELLED', value: '2', color: V3.orangeLight },
        ].map(kpi => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {[
          { time: '7:00 AM', patient: 'Margaret Wilson', clinician: 'Dr. Vance', type: 'RN Assessment', zone: 'A', status: 'Completed', duration: '45 min' },
          { time: '8:30 AM', patient: 'Robert Thompson', clinician: 'S. Caldwell', type: 'PT Session', zone: 'B', status: 'Completed', duration: '60 min' },
          { time: '9:15 AM', patient: 'Helen Garcia', clinician: 'S. Jenkins', type: 'OT Evaluation', zone: 'A', status: 'Completed', duration: '50 min' },
          { time: '10:00 AM', patient: 'James Lee', clinician: 'M. Sterling', type: 'RN Follow-up', zone: 'C', status: 'In Progress', duration: '30 min' },
          { time: '11:00 AM', patient: 'Dorothy Adams', clinician: 'Dr. Vance', type: 'RN Assessment', zone: 'B', status: 'Upcoming', duration: '45 min' },
          { time: '12:30 PM', patient: 'William Brown', clinician: 'S. Caldwell', type: 'PT Session', zone: 'A', status: 'Upcoming', duration: '60 min' },
          { time: '1:00 PM', patient: 'Barbara Miller', clinician: 'D. Cho', type: 'Telehealth Check', zone: 'C', status: 'Upcoming', duration: '20 min' },
          { time: '2:00 PM', patient: 'Charles Davis', clinician: 'S. Jenkins', type: 'OT Session', zone: 'B', status: 'Upcoming', duration: '50 min' },
          { time: '3:00 PM', patient: 'Nancy Taylor', clinician: 'M. Sterling', type: 'Wound Care', zone: 'A', status: 'Cancelled', duration: '40 min' },
          { time: '3:30 PM', patient: 'Richard Anderson', clinician: 'Dr. Vance', type: 'RN Discharge', zone: 'C', status: 'Upcoming', duration: '45 min' },
        ].map((visit, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, opacity: visit.status === 'Cancelled' ? 0.5 : 1 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, minWidth: '72px', fontFamily: 'monospace' }}>{visit.time}</span>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                flexShrink: 0,
                background: visit.status === 'Completed' ? V3.tealLight : visit.status === 'In Progress' ? V3.orangeLight : visit.status === 'Cancelled' ? V3.textTertiary : 'rgba(255,255,255,0.15)',
                boxShadow: visit.status === 'In Progress' ? '0 0 8px rgba(255, 160, 89, 0.5)' : 'none',
              }}
            />
            <div style={{ flex: 2 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block', textDecoration: visit.status === 'Cancelled' ? 'line-through' : 'none' }}>{visit.patient}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>
                {visit.type} · {visit.duration}
              </span>
            </div>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{visit.clinician}</span>
            <span style={{ fontSize: '11px', color: V3.textSecondary, padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>Zone {visit.zone}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                minWidth: '80px',
                textAlign: 'center',
                padding: '4px 10px',
                borderRadius: '6px',
                background: visit.status === 'Completed' ? 'rgba(0,209,193,0.1)' : visit.status === 'In Progress' ? 'rgba(255,160,89,0.1)' : 'rgba(255,255,255,0.04)',
                color: visit.status === 'Completed' ? V3.tealLight : visit.status === 'In Progress' ? V3.orangeLight : visit.status === 'Cancelled' ? V3.textTertiary : V3.textSecondary,
              }}
            >
              {visit.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MissedVisitsPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={AlertTriangle} micro="VISIT COMPLIANCE" title="Missed Visits" subtitle="Missed and cancelled visit tracking with reason codes and follow-up documentation status." />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'THIS MONTH', value: '18' },
          { label: 'DOCUMENTED', value: '12', color: V3.tealLight },
          { label: 'PENDING DOC', value: '4', color: V3.orangeLight },
          { label: 'ESCALATED', value: '2', color: V3.orangeLight },
        ].map(kpi => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['All', 'Patient Refused', 'Clinician Unavailable', 'Weather/Safety', 'Hospitalization', 'Other'].map((reason, idx) => (
          <button
            key={reason}
            className="btn-smooth-hover"
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
              background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
              border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
              color: idx === 0 ? V3.textPrimary : V3.textSecondary,
            }}
          >
            {reason}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { date: 'May 19', time: '10:00 AM', patient: 'Nancy Taylor', clinician: 'M. Sterling', reason: 'Patient Refused', documented: true, followUp: 'Rescheduled May 21' },
          { date: 'May 18', time: '2:00 PM', patient: 'James Lee', clinician: 'Dr. Vance', reason: 'Clinician Unavailable', documented: true, followUp: 'Covered by S. Caldwell' },
          { date: 'May 17', time: '9:00 AM', patient: 'Helen Garcia', clinician: 'S. Jenkins', reason: 'Hospitalization', documented: true, followUp: 'Care plan on hold' },
          { date: 'May 16', time: '3:30 PM', patient: 'Dorothy Adams', clinician: 'M. Sterling', reason: 'Weather/Safety', documented: false, followUp: 'Pending reschedule' },
          { date: 'May 15', time: '11:00 AM', patient: 'William Brown', clinician: 'S. Caldwell', reason: 'Patient Refused', documented: false, followUp: 'Needs supervisor follow-up' },
        ].map((visit, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', border: !visit.documented ? `1px solid rgba(255, 160, 89, 0.33)` : `1px solid rgba(255,255,255,0.08)`, background: !visit.documented ? 'rgba(255, 160, 89, 0.02)' : 'transparent', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <div style={{ minWidth: '80px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{visit.date}</span>
              <span style={{ fontSize: '11px', color: V3.textTertiary }}>{visit.time}</span>
            </div>
            <div style={{ flex: 2, minWidth: '160px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{visit.patient}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>Clinician: {visit.clinician}</span>
            </div>
            <span style={{ flex: 1, fontSize: '11px', fontWeight: 600, color: V3.textSecondary, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>{visit.reason}</span>
            <span style={{ flex: 1.5, fontSize: '12px', color: V3.textSecondary }}>{visit.followUp}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px', minWidth: '90px', textAlign: 'center', background: visit.documented ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)', color: visit.documented ? V3.tealLight : V3.textTertiary }}>
              {visit.documented ? 'Documented' : 'Pending'}
            </span>
            {!visit.documented && (
              <button type="button" className="btn-smooth-hover" style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', background: 'rgba(255,160,89,0.1)', border: `1px solid ${V3.orangeLight}`, color: V3.orangeLight }}>
                Document
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HubstaffPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={ArrowUpCircle} micro="WORKFORCE ANALYTICS" title="Hubstaff Integration" subtitle="Time tracking, productivity metrics, and workforce utilization insights." />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL HOURS', value: '342.5' },
          { label: 'ACTIVE USERS', value: '12', color: V3.tealLight },
          { label: 'AVG PRODUCTIVITY', value: '87%', color: V3.tealLight },
          { label: 'FIELD HOURS', value: '280' },
          { label: 'ADMIN HOURS', value: '62.5' },
          { label: 'OVERTIME', value: '18.5', color: V3.tealLight },
        ].map(kpi => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>This Week — Staff Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '16px' }}>
            <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Staff Member</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Hours</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Productivity</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Visits</span>
            <span style={{ flex: 1.5, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Utilization</span>
          </div>
          {[
            { name: 'Dr. Evelyn Vance', role: 'Clinical Lead', hours: 42.0, productivity: 92, visits: 18 },
            { name: 'Marcus Sterling', role: 'RN', hours: 38.5, productivity: 88, visits: 15 },
            { name: 'Sophia Caldwell', role: 'PT', hours: 40.0, productivity: 91, visits: 16 },
            { name: 'Sarah Jenkins', role: 'OT', hours: 36.0, productivity: 85, visits: 14 },
            { name: 'David Cho', role: 'Clinical Informatics', hours: 44.5, productivity: 78, visits: 8 },
            { name: 'Maria Gonzales', role: 'QA Lead', hours: 40.0, productivity: 82, visits: 0 },
          ].map((staff, idx) => (
            <div key={idx} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
              <div style={{ flex: 2 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{staff.name}</span>
                <span style={{ fontSize: '11px', color: V3.textTertiary }}>{staff.role}</span>
              </div>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: staff.hours > 40 ? V3.tealLight : V3.textPrimary, textAlign: 'center' }}>{staff.hours}h</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: staff.productivity >= 85 ? V3.tealLight : V3.textSecondary, textAlign: 'center' }}>{staff.productivity}%</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: V3.textPrimary, textAlign: 'center' }}>{staff.visits}</span>
              <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${staff.productivity}%`, height: '100%', background: staff.productivity >= 85 ? V3.tealLight : 'rgba(255,255,255,0.2)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UserGuidesPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Folder} micro="SYSTEM DOCUMENTATION" title="User Guides" subtitle="Comprehensive system documentation and operational guides for all modules." />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', maxWidth: '400px' }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search documentation..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Getting Started Guide', desc: 'Initial setup, navigation overview, and first-time user walkthrough for the CareIndeed platform.', pages: 24, updated: 'May 10, 2026', category: 'Onboarding' },
          { title: 'Dashboard & Agency View', desc: 'Understanding KPIs, readiness status, kanban boards, and the agency-wide compliance overview.', pages: 18, updated: 'May 15, 2026', category: 'Operations' },
          { title: 'Policy Library Management', desc: 'Creating, reviewing, approving, and publishing enterprise policies through the full lifecycle.', pages: 28, updated: 'May 8, 2026', category: 'Policy' },
          { title: 'Evidence Center Guide', desc: 'Uploading, categorizing, and linking evidence artifacts to CES obligations and audit trails.', pages: 20, updated: 'May 11, 2026', category: 'Evidence' },
          { title: 'Brad AI Copilot Reference', desc: 'Using the AI assistant for compliance queries, taxonomy lookups, and operational guidance.', pages: 12, updated: 'May 16, 2026', category: 'AI' },
          { title: 'Administration & Settings', desc: 'User management, role configuration, permissions, audit logs, and system settings.', pages: 26, updated: 'May 7, 2026', category: 'Admin' },
        ].map(guide => (
          <div key={guide.title} className="v3-invisible-glare" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', padding: '4px 10px', borderRadius: '6px', background: 'rgba(0,209,193,0.1)', color: V3.tealLight }}>{guide.category}</span>
              <FileText size={16} color={V3.textTertiary} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{guide.title}</h4>
            <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4, flex: 1 }}>{guide.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', color: V3.textTertiary }}>{guide.pages} pages · Updated {guide.updated}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight }}>Read →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SopLibraryPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={FileText} micro="OPERATIONAL PROCEDURES" title="SOP Library" subtitle="Standard Operating Procedures for all clinical, administrative, and compliance workflows." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All SOPs', 'Clinical', 'Administrative', 'IT', 'Compliance'].map((tab, idx) => (
            <button
              key={tab}
              className="btn-smooth-hover"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '260px' }}>
          <Search size={14} color={V3.textTertiary} />
          <input placeholder="Search SOPs..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <span style={{ flex: 0.5, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>ID</span>
          <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Procedure Title</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Category</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Version</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Reviewed</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Owner</span>
        </div>
        {[
          { id: 'SOP-CL-001', title: 'New Patient Intake & Assessment Protocol', cat: 'Clinical', version: 'v3.1', reviewed: 'May 2026', owner: 'Dr. Vance' },
          { id: 'SOP-AD-001', title: 'Referral Processing & Authorization', cat: 'Administrative', version: 'v2.0', reviewed: 'May 2026', owner: 'Admin Team' },
          { id: 'SOP-IT-001', title: 'System Access Request & Provisioning', cat: 'IT', version: 'v2.2', reviewed: 'May 2026', owner: 'IT Security' },
          { id: 'SOP-CO-001', title: 'Evidence Collection & Chain of Custody', cat: 'Compliance', version: 'v2.1', reviewed: 'May 2026', owner: 'QA Lead' },
          { id: 'SOP-CL-004', title: 'Discharge Planning & Transition of Care', cat: 'Clinical', version: 'v2.0', reviewed: 'May 2026', owner: 'S. Jenkins' },
        ].map(sop => (
          <div key={sop.id} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}>
            <span style={{ flex: 0.5, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: V3.tealLight }}>{sop.id}</span>
            <span style={{ flex: 2, fontSize: '14px', fontWeight: 500, color: V3.textPrimary }}>{sop.title}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{sop.cat}</span>
            <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: V3.textTertiary }}>{sop.version}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textTertiary }}>{sop.reviewed}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{sop.owner}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrainingMaterialsPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={PlayCircle} micro="LEARNING & DEVELOPMENT" title="Training Materials" subtitle="Courses, modules, and certifications for clinical and administrative staff." />

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL COURSES', value: '18' },
          { label: 'COMPLETED', value: '6', color: V3.tealLight },
          { label: 'IN PROGRESS', value: '4' },
          { label: 'MANDATORY DUE', value: '3', color: V3.tealLight },
        ].map(kpi => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { title: 'HIPAA Privacy & Security Fundamentals', type: 'Mandatory', duration: '2h 30m', modules: 8, completed: 8, status: 'Complete' },
          { title: 'Infection Control in Home Health', type: 'Mandatory', duration: '1h 45m', modules: 6, completed: 6, status: 'Complete' },
          { title: 'Patient Rights & Informed Consent', type: 'Mandatory', duration: '1h 15m', modules: 5, completed: 3, status: 'In Progress' },
          { title: 'CES Board Operations Training', type: 'Recommended', duration: '2h 00m', modules: 7, completed: 4, status: 'In Progress' },
          { title: 'eCIgn Digital Signatures Workflow', type: 'Recommended', duration: '45m', modules: 4, completed: 0, status: 'Not Started' },
          { title: 'Emergency Preparedness Procedures', type: 'Mandatory', duration: '1h 30m', modules: 6, completed: 6, status: 'Complete' },
        ].map(course => (
          <div key={course.title} className="v3-invisible-glare" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', padding: '4px 10px', borderRadius: '6px', background: course.type === 'Mandatory' ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)', color: course.type === 'Mandatory' ? V3.tealLight : V3.textTertiary }}>{course.type}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: course.status === 'Complete' ? V3.tealLight : course.status === 'In Progress' ? V3.textSecondary : V3.textTertiary }}>{course.status}</span>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{course.title}</h4>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: V3.textTertiary }}>
              <span>{course.duration}</span>
              <span>{course.modules} modules</span>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: V3.textTertiary }}>
                  {course.completed}/{course.modules} modules
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight }}>{Math.round((course.completed / course.modules) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(course.completed / course.modules) * 100}%`, height: '100%', background: V3.tealLight, borderRadius: '2px' }} />
              </div>
            </div>
            <button
              className="btn-smooth-hover"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '8px',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                background: course.status === 'Complete' ? 'transparent' : 'rgba(0,209,193,0.1)',
                border: `1px solid ${course.status === 'Complete' ? V3.borderHighlight : V3.tealLight}`,
                color: course.status === 'Complete' ? V3.textSecondary : V3.tealLight,
              }}
            >
              {course.status === 'Complete' ? 'Review' : course.status === 'In Progress' ? 'Continue' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function HelpCenterPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={HelpCircle} micro="SUPPORT" title="Help Center" subtitle="Frequently asked questions, support resources, and contact information." />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '14px 20px', maxWidth: '500px' }}>
        <Search size={18} color={V3.textTertiary} />
        <input placeholder="How can we help you?" style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '14px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { icon: LayoutDashboard, title: 'Dashboard Guide', desc: 'Learn how to navigate the agency view and My Planner workspace.' },
          { icon: ShieldCheck, title: 'CES Operations', desc: 'Understanding sprint execution, task workflows, and evidence linking.' },
          { icon: FileText, title: 'Policy Management', desc: 'Creating, reviewing, and publishing enterprise compliance policies.' },
          { icon: FolderOpen, title: 'Evidence Locker', desc: 'Uploading artifacts, chain of custody, and audit trail management.' },
          { icon: Bot, title: 'Brad AI Assistant', desc: 'Getting the most out of your compliance AI copilot.' },
          { icon: Settings, title: 'System Settings', desc: 'Account configuration, roles, permissions, and integrations.' },
        ].map(item => (
          <div key={item.title} className="v3-invisible-glare" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer' }}>
            <item.icon size={24} color={V3.tealLight} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{item.title}</h4>
            <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight, marginTop: 'auto' }}>Learn More →</span>
          </div>
        ))}
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { q: 'How do I reset my password?', a: 'Navigate to the login page and click "Forgot Password". Enter your email address to receive a reset link.' },
            { q: 'How do I attach evidence to a CES task?', a: 'Open the task from the CES Board, click "Attach Evidence", and select files from your device or the Evidence Locker.' },
            { q: 'Can I export reports to PDF?', a: 'Yes. Most data views include an Export option in the top-right corner.' },
          ].map((faq, idx) => (
            <div key={idx} className="v3-invisible-glare" style={{ padding: '16px 20px', border: `1px solid rgba(255,255,255,0.08)`, cursor: 'pointer' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{faq.q}</h4>
              <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '8px 0 0 0', lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 24px', background: 'rgba(0, 209, 193, 0.08)', border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Need more help?</div>
          <div style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '2px' }}>Contact our support team for personalized assistance.</div>
        </div>
        <button className="btn-smooth-hover" style={{ padding: '10px 24px', background: V3.tealLight, border: 'none', color: '#000', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
          Contact Support
        </button>
      </div>
    </div>
  )
}

function DemoPage({ isMobile }: { isMobile: boolean }) {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={PlayCircle} micro="SANDBOX" title="Demo Environment" subtitle="Interactive sandbox with synthetic data. Explore all system features without affecting production." />

      <div style={{ padding: '20px 24px', background: 'rgba(0, 209, 193, 0.08)', border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={20} color={V3.tealLight} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Demo Mode Active</div>
          <div style={{ fontSize: '12px', color: V3.textSecondary }}>All data is synthetic. Changes will not persist between sessions. HIPAA-safe environment.</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Quick Launch Scenarios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { title: 'Full Compliance Audit', desc: 'Simulate a CMS survey preparation workflow with controls, evidence gaps, and remediation sprints.', duration: '~15 min', modules: ['Dashboard', 'My Planner', 'Evidence Center'] },
            { title: 'Policy Lifecycle Walk-Through', desc: 'Create a new policy, route through review, gain approval, publish, and link evidence.', duration: '~10 min', modules: ['Policy Library', 'Forms', 'Evidence Center'] },
            { title: 'Incident Response Drill', desc: 'Report a safety incident, document findings, attach evidence, and route through QAPI review.', duration: '~12 min', modules: ['Forms', 'Evidence Center', 'My Planner'] },
            { title: 'Sprint Execution Cycle', desc: 'Execute a full CES sprint: assign tasks, mark progress, attach evidence, close obligations.', duration: '~20 min', modules: ['My Planner', 'Dashboard', 'Audit Trail'] },
            { title: 'Brad AI Compliance Query', desc: 'Ask Brad about CMS regulations, taxonomy structures, and get AI-powered compliance guidance.', duration: '~5 min', modules: ['Brad AI Copilot'] },
            { title: 'Visit Recovery Protocol', desc: 'Run a missed-visit remediation scenario with follow-up documentation and escalation.', duration: '~8 min', modules: ['Visit Schedule', 'Missed Visits'] },
          ].map(scenario => (
            <div key={scenario.title} className="v3-invisible-glare" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{scenario.title}</h4>
              <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4, flex: 1 }}>{scenario.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {scenario.modules.map(mod => (
                  <span key={mod} style={{ fontSize: '10px', fontWeight: 600, color: V3.textSecondary, padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                    {mod}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: V3.textTertiary }}>{scenario.duration}</span>
                <button className="btn-smooth-hover" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', background: 'rgba(0,209,193,0.1)', border: `1px solid ${V3.tealLight}`, color: V3.tealLight }}>
                  Launch →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AuditTrailPage() {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={FileSearch} micro="CHAIN OF CUSTODY" title="Audit Trail" subtitle="Immutable chronological record of all evidence actions, access events, and chain-of-custody transfers." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All Events', 'Upload', 'Access', 'Modify', 'Delete', 'Transfer', 'Signature'].map((tab, idx) => (
            <button
              key={tab}
              className="btn-smooth-hover"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '220px' }}>
            <Search size={14} color={V3.textTertiary} />
            <input placeholder="Search audit log..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }} />
          </div>
          <button className="btn-smooth-hover" style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${V3.borderHighlight}`, color: V3.textSecondary, fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {[
          { timestamp: 'May 20, 2026 11:32 AM', action: 'Evidence Uploaded', user: 'Admin User', target: 'Fire Drill Log — Zone A (SA-WP-06)', type: 'Upload', hash: 'sha256:a1b2c3...f7e8' },
          { timestamp: 'May 20, 2026 11:15 AM', action: 'Document Signed', user: 'Dr. Evelyn Vance', target: 'Patient Admission Consent — M. Wilson', type: 'Signature', hash: 'sha256:d4e5f6...b9c0' },
          { timestamp: 'May 20, 2026 10:48 AM', action: 'Evidence Accessed', user: 'Maria Gonzales', target: 'Q1 QAPI Committee Minutes (QA-WP-01)', type: 'Access', hash: null },
          { timestamp: 'May 20, 2026 10:22 AM', action: 'Evidence Modified', user: 'David Cho', target: 'HIPAA Security Risk Assessment (IT-WP-21)', type: 'Modify', hash: 'sha256:g7h8i9...k1l2' },
          { timestamp: 'May 19, 2026 4:45 PM', action: 'Evidence Transferred', user: 'Admin User', target: 'Governing Body Minutes → Board Secretary', type: 'Transfer', hash: 'sha256:m3n4o5...p6q7' },
          { timestamp: 'May 18, 2026 5:00 PM', action: 'Evidence Deleted', user: 'Admin User', target: 'Duplicate Upload — Training Cert (HR-WP-15)', type: 'Delete', hash: 'sha256:b8c9d0...e1f2' },
        ].map((entry, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: V3.textTertiary, minWidth: '160px', flexShrink: 0 }}>{entry.timestamp}</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                minWidth: '72px',
                textAlign: 'center',
                flexShrink: 0,
                background: entry.type === 'Delete' ? 'rgba(0,209,193,0.05)' : entry.type === 'Signature' ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)',
                color: entry.type === 'Delete' || entry.type === 'Signature' ? V3.tealLight : V3.textSecondary,
              }}
            >
              {entry.type}
            </span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{entry.action}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary, display: 'block', marginTop: '2px' }}>{entry.target}</span>
              {entry.hash && <span style={{ fontSize: '10px', fontFamily: 'monospace', color: V3.textTertiary, display: 'block', marginTop: '4px' }}>{entry.hash}</span>}
            </div>
            <span style={{ fontSize: '12px', color: V3.textSecondary, minWidth: '120px', flexShrink: 0 }}>{entry.user}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
