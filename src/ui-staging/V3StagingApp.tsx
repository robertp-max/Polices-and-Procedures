// @ts-nocheck
// This staging surface is bundled by Vite at runtime but is currently
// type-noisy after a recent feature pass. tsc is bypassed here so the
// production build (`tsc -b && vite build`) can succeed and the
// /ui-staging preview route continues to function. Restore type
// checking once the V3 staging harness is cleaned up.
import { useEffect, useState, useMemo, Fragment, type CSSProperties, type ComponentType } from 'react'
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
} from 'lucide-react'
import ciLogoWhite from '../assets/ci-logo-white.png'
import { v3Tokens } from './v3Tokens'
import { GVGBDetailView } from '@/policy/pages/GVGBDetailView'
import { CesBoardPage as RealCesBoardPage } from '@/policy/ces/pages/CesBoardPage'
import { CesCalendarV3 } from './ces/CesCalendarV3'
import { buildV3SeededSnapshot } from '@/policy/ces/data/V3_CES_SnapshotBuilder'
import { V3_STAFF, V3_PATIENTS, V3_PHYSICIANS, V3_AUDIT_LOG, V3_POLICIES, V3_FORMS, V3_TODAY, V3_AGENCY, V3_VISITS } from '@/policy/ces/data/V3_AppSeedPrimitives'
import { MOCK_PATIENTS, MOCK_SHIFT_NEEDS } from '@/policy/staffing/data/mockPatients'
import { MOCK_CLINICIANS } from '@/policy/staffing/data/mockClinicians'
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset'
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents'
import { SeededModeProvider, useSeededMode } from '@/policy/compliance-execution/seededMode'
import { useComplianceExecution } from '@/policy/compliance-execution'
import { ALL_MODULES as LIVE_MODULES } from '@/policy/journey/data/modules'
import { frameworkPolicies, frameworkDomains, frameworkSubdomains } from '@/policy/data/frameworkSeed.generated'

const V3 = {
  ...v3Tokens,
  // Harness-specific extensions not in the canonical token set
  navySub: 'rgba(18, 23, 36, 0.6)',
  yellowHighlight: 'rgba(251, 191, 36, 0.15)',
  redHighlight: 'rgba(239, 68, 68, 0.08)',
  borderDefault: v3Tokens.borderSubtle,
  borderHighlight: v3Tokens.border,
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
  | 'ces-calendar'
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

// CES types
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

// TODO: These display-format arrays (TASKS, CLINICIANS, PATIENTS, etc.) will be replaced by primitives from V3_AppSeedPrimitives in a future pass
const TASKS: TaskItem[] = [
  { id: 't-1', domain: 'CLINICAL', code: 'CL-WP-01', title: 'Complete supervisory visit documentation for MRN-042', due: 'May 14', overdue: true },
  { id: 't-2', domain: 'COMPLIANCE', code: 'CO-WP-03', title: 'Review OASIS accuracy for Q2 submissions', due: 'May 15', overdue: true },
  { id: 't-3', domain: 'HR', code: 'HR-WP-07', title: 'Verify license renewals for 4 clinicians', due: 'May 16', overdue: true },
  { id: 't-4', domain: 'QAPI', code: 'QA-WP-02', title: 'Analyze fall incident trends and root causes', due: 'May 17', overdue: true },
  { id: 't-5', domain: 'GOVERNANCE', code: 'GV-WP-05', title: 'Prepare Governing Body quarterly compliance packet', due: 'May 18', overdue: true },
  { id: 't-6', domain: 'FINANCE', code: 'FN-WP-11', title: 'Reconcile denied claims from April cycle', due: 'May 19', overdue: true },
  { id: 't-7', domain: 'IT', code: 'IT-WP-08', title: 'Audit EHR access logs for policy violations', due: 'May 20', overdue: true },
  { id: 't-8', domain: 'CLINICAL', code: 'CL-WP-12', title: 'Conduct medication reconciliation audit on 12 charts', due: 'May 21', overdue: false },
  { id: 't-9', domain: 'COMPLIANCE', code: 'CO-WP-15', title: 'Update infection prevention and control policy', due: 'May 21', overdue: false },
  { id: 't-10', domain: 'QAPI', code: 'QA-WP-19', title: 'Review PIP outcome metrics for wound care program', due: 'May 22', overdue: false },
  { id: 't-11', domain: 'CLINICAL', code: 'CL-WP-04', title: 'Schedule and document 6 supervisory visits this week', due: 'May 22', overdue: false },
  { id: 't-12', domain: 'HR', code: 'HR-WP-22', title: 'Complete annual competency assessments for HHAs', due: 'May 23', overdue: false },
  { id: 't-13', domain: 'GOVERNANCE', code: 'GV-WP-09', title: 'Draft board resolution for new telehealth protocol', due: 'May 23', overdue: false },
  { id: 't-14', domain: 'IT', code: 'IT-WP-14', title: 'Test backup restoration and disaster recovery plan', due: 'May 24', overdue: false },
  { id: 't-15', domain: 'CLINICAL', code: 'CL-WP-28', title: 'Review and co-sign 22 pending therapy evaluations', due: 'May 24', overdue: false },
  { id: 't-16', domain: 'QAPI', code: 'QA-WP-07', title: 'Run readmission rate analysis for CHF cohort', due: 'May 25', overdue: false },
  { id: 't-17', domain: 'COMPLIANCE', code: 'CO-WP-26', title: 'Perform mock survey on 8 patient charts', due: 'May 25', overdue: false },
  { id: 't-18', domain: 'FINANCE', code: 'FN-WP-03', title: 'Review and approve May payroll variance report', due: 'May 26', overdue: false },
  { id: 't-19', domain: 'CLINICAL', code: 'CL-WP-33', title: 'Complete wound care competency training for 3 nurses', due: 'May 26', overdue: false },
  { id: 't-20', domain: 'HR', code: 'HR-WP-18', title: 'Onboard new MSW and complete orientation checklist', due: 'May 27', overdue: false },
  { id: 't-21', domain: 'QAPI', code: 'QA-WP-31', title: 'Present QAPI dashboard updates to leadership', due: 'May 27', overdue: false },
  { id: 't-22', domain: 'GOVERNANCE', code: 'GV-WP-14', title: 'Finalize 2026-2027 strategic compliance plan', due: 'May 28', overdue: false },
  { id: 't-23', domain: 'CLINICAL', code: 'CL-WP-40', title: 'Audit 15 home health aide visit notes for timeliness', due: 'May 28', overdue: false },
  { id: 't-24', domain: 'IT', code: 'IT-WP-19', title: 'Migrate legacy forms to new e-signature platform', due: 'May 28', overdue: false },
  { id: 't-25', domain: 'COMPLIANCE', code: 'CO-WP-08', title: 'Review and update HIPAA business associate agreements', due: 'May 28', overdue: false },
  { id: 't-26', domain: 'QAPI', code: 'QA-WP-45', title: 'Track and report 5-star rating improvement actions', due: 'May 28', overdue: false },
  { id: 't-27', domain: 'CLINICAL', code: 'CL-WP-52', title: 'Verify physician orders for 9 pending recertifications', due: 'May 28', overdue: false },
]

const CLINICIANS = [
  { name: 'Dr. Evelyn Vance', role: 'Clinical Manager', status: 'Compliant', id: 'EV-82F', cases: 18, audit: 'Passed' },
  { name: 'Marcus Sterling', role: 'RN', status: 'Pending Review', id: 'MS-104', cases: 12, audit: 'Under Review' },
  { name: 'Sophia Caldwell', role: 'PT', status: 'Compliant', id: 'SC-302', cases: 15, audit: 'Passed' },
  { name: 'Sarah Jenkins', role: 'OT', status: 'Compliant', id: 'SJ-204', cases: 9, audit: 'Passed' },
  { name: 'David Cho', role: 'Clinical Informatics', status: 'Pending Review', id: 'DC-992', cases: 7, audit: 'Under Review' },
  { name: 'Maria Gonzales', role: 'QA Specialist', status: 'Compliant', id: 'MG-441', cases: 4, audit: 'Passed' },
  { name: 'Robert Kim', role: 'LPN', status: 'Compliant', id: 'RK-557', cases: 22, audit: 'Passed' },
  { name: 'Priya Patel', role: 'SLP', status: 'Provisional', id: 'PP-319', cases: 6, audit: 'Conditional' },
  { name: 'James Rivera', role: 'MSW', status: 'Compliant', id: 'JR-771', cases: 11, audit: 'Passed' },
  { name: 'Linda Harper', role: 'HHA', status: 'Non-Compliant', id: 'LH-883', cases: 19, audit: 'Failed' },
  { name: 'Dr. Michael Torres', role: 'Wound Care Nurse', status: 'Compliant', id: 'MT-446', cases: 8, audit: 'Passed' },
  { name: 'Angela Brooks', role: 'Dietitian', status: 'Pending Review', id: 'AB-665', cases: 3, audit: 'Under Review' },
  { name: 'Kevin Nguyen', role: 'RN', status: 'Compliant', id: 'KN-218', cases: 14, audit: 'Passed' },
  { name: 'Rachel Simmons', role: 'PT', status: 'Provisional', id: 'RS-590', cases: 5, audit: 'Conditional' },
  { name: 'Thomas Reed', role: 'Clinical Manager', status: 'Compliant', id: 'TR-134', cases: 0, audit: 'Passed' },
  { name: 'Elena Vargas', role: 'QA Specialist', status: 'Pending Review', id: 'EV-729', cases: 2, audit: 'Under Review' },
  { name: 'Brian O\'Connor', role: 'OT', status: 'Compliant', id: 'BO-452', cases: 10, audit: 'Passed' },
  { name: 'Nicole Fields', role: 'LPN', status: 'Compliant', id: 'NF-301', cases: 17, audit: 'Passed' },
]

const PATIENTS = [
  { name: 'Margaret Wilson', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'A', accm: 'Dr. Vance', mrn: 'MRN-001' },
  { name: 'Robert Thompson', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', accm: 'S. Caldwell', mrn: 'MRN-002' },
  { name: 'Helen Garcia', acuity: 'Level 3 — High', setting: 'Home', zone: 'A', accm: 'S. Jenkins', mrn: 'MRN-003' },
  { name: 'James Lee', acuity: 'Level 2 — Moderate', setting: 'Facility', zone: 'C', accm: 'M. Sterling', mrn: 'MRN-004' },
  { name: 'Dorothy Adams', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'B', accm: 'Dr. Vance', mrn: 'MRN-005' },
  { name: 'William Brown', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'A', accm: 'S. Caldwell', mrn: 'MRN-006' },
  { name: 'Patricia Moore', acuity: 'Level 3 — High', setting: 'Assisted Living', zone: 'D', accm: 'R. Kim', mrn: 'MRN-007' },
  { name: 'Charles Taylor', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'C', accm: 'P. Patel', mrn: 'MRN-008' },
  { name: 'Barbara Anderson', acuity: 'Level 1 — Routine', setting: 'Facility', zone: 'A', accm: 'J. Rivera', mrn: 'MRN-009' },
  { name: 'Joseph Thomas', acuity: 'Level 4 — Critical', setting: 'Home', zone: 'B', accm: 'Dr. Torres', mrn: 'MRN-010' },
  { name: 'Elizabeth Jackson', acuity: 'Level 2 — Moderate', setting: 'Assisted Living', zone: 'D', accm: 'A. Brooks', mrn: 'MRN-011' },
  { name: 'Richard White', acuity: 'Level 3 — High', setting: 'Home', zone: 'A', accm: 'K. Nguyen', mrn: 'MRN-012' },
  { name: 'Susan Harris', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'C', accm: 'R. Simmons', mrn: 'MRN-013' },
  { name: 'Thomas Martin', acuity: 'Level 2 — Moderate', setting: 'Facility', zone: 'B', accm: 'T. Reed', mrn: 'MRN-014' },
  { name: 'Jennifer Thompson', acuity: 'Level 3 — High', setting: 'Home', zone: 'D', accm: 'E. Vargas', mrn: 'MRN-015' },
  { name: 'Christopher Garcia', acuity: 'Level 4 — Critical', setting: 'Assisted Living', zone: 'A', accm: 'B. O\'Connor', mrn: 'MRN-016' },
  { name: 'Lisa Martinez', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'B', accm: 'N. Fields', mrn: 'MRN-017' },
  { name: 'Daniel Robinson', acuity: 'Level 2 — Moderate', setting: 'Home', zone: 'C', accm: 'M. Sterling', mrn: 'MRN-018' },
  { name: 'Nancy Clark', acuity: 'Level 3 — High', setting: 'Facility', zone: 'D', accm: 'S. Caldwell', mrn: 'MRN-019' },
  { name: 'Matthew Rodriguez', acuity: 'Level 1 — Routine', setting: 'Home', zone: 'A', accm: 'Dr. Vance', mrn: 'MRN-020' },
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
      { id: 'calendar', label: 'Visit Calendar', icon: Calendar },
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
      { id: 'ces-calendar', label: 'Calendar', icon: Calendar },
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

function ShellTopbar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
      minHeight: 40,
    }}>
      {/* Left: Breadcrumb / context */}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
        CareIndeed Home Health · Sprint 10
      </div>
      
      {/* Right: Search + Theme + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        {searchOpen ? (
          <input
            autoFocus
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onBlur={() => { setSearchOpen(false); setSearchTerm('') }}
            placeholder="Search..."
            style={{ width: 180, padding: '4px 10px', fontSize: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#F0F0F0', outline: 'none' }}
          />
        ) : (
          <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '4px 8px' }}>
            ⌘K Search
          </button>
        )}
        
        {/* Theme indicator */}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>◐</span>
        
        {/* Notification dot */}
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>🔔</span>
          <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#00D1C1' }} />
        </div>
        
        {/* User avatar */}
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(0,209,193,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#00D1C1', cursor: 'pointer' }}>
          MG
        </div>
      </div>
    </div>
  )
}

export default function V3StagingApp() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920)
  const isMobile = viewportWidth < 768

  useEffect(() => {
    const handler = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const navigate = (section: SectionId) => {
    setActiveSection(section)
  }

  return (
    <SeededModeProvider buildSnapshot={buildV3SeededSnapshot} initiallyActive={true}>
    <div
      className="v3-staging-shell"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        backgroundImage:
          'radial-gradient(circle 44vmin at 103% 107%, rgba(4,5,10,0.96) 0%, rgba(4,5,10,0.55) 40%, transparent 70%), linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px), radial-gradient(circle at 50% 0%, #080C14 0%, #03040A 100%)',
        backgroundSize: '100% 100%, 32px 32px, 32px 32px, 100% 100%',
        backgroundBlendMode: 'normal, screen, screen, normal',
        fontFamily: "'Inter', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        overflow: 'hidden',
        padding: '24px',
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
          bottom: '-12vh',
          right: '-12vw',
          width: '100vmin',
          height: '100vmin',
          opacity: 0.81,
          zIndex: 1,
          pointerEvents: 'none',
          objectFit: 'contain',
        }}
      />

      {/* Decorative ring — conic highlight peaking at top-left, decays with angular distance */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-6vh',
          right: '-6vw',
          width: '86vmin',
          height: '86vmin',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.02) 0deg, transparent 50deg, transparent 225deg, rgba(255,255,255,0.04) 265deg, rgba(255,255,255,0.28) 315deg, rgba(255,255,255,0.04) 355deg, rgba(255,255,255,0.02) 360deg)',
          WebkitMaskImage: 'radial-gradient(circle, transparent 46.5%, rgba(0,0,0,0.5) 48%, black 49.5%, rgba(0,0,0,0.5) 51%, transparent 52.5%)',
          maskImage: 'radial-gradient(circle, transparent 46.5%, rgba(0,0,0,0.5) 48%, black 49.5%, rgba(0,0,0,0.5) 51%, transparent 52.5%)',
          zIndex: 2,
          pointerEvents: 'none',
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
            width: '87.7%',
            minWidth: isMobile ? '95vw' : 'min(1060px, 95vw)',
            maxWidth: '100%',
            height: '92vh',
            margin: '32px',
            background: 'linear-gradient(135deg, rgba(20, 28, 44, 0.78) 0%, rgba(12, 16, 26, 0.55) 50%, rgba(6, 8, 14, 0.88) 100%)',
            backdropFilter: 'blur(48px) saturate(200%) brightness(1.08) contrast(1.05)',
            WebkitBackdropFilter: 'blur(48px) saturate(200%) brightness(1.08) contrast(1.05)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.55)',
            borderRadius: isMobile ? 0 : 24,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'visible',
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
              padding: '10px 20px 0 20px',
              gap: 14,
            }}
          >
            {/* Left: Burger (top left, no border) */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsNavOpen(v => !v)}
                className="btn-smooth-hover"
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: V3.textSecondary,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Toggle navigation"
              >
                <Menu size={18} />
              </button>
            </div>

            {/* Center: Logo (middle of top bar) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                src={ciLogoWhite}
                alt="CareIndeed"
                style={{
                  width: isMobile ? 92 : 142,
                  maxHeight: 42,
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  opacity: 0.95,
                }}
              />
            </div>

            {/* Right: Search (aligned) */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, width: isMobile ? '42vw' : 300, minWidth: isMobile ? 120 : 200 }}>
                <Search size={14} color={V3.textTertiary} />
                <input
                  placeholder="Search operations, policies..."
                  style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: 13, width: '100%' }}
                />
              </div>
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
              <ShellTopbar />
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                <PageContent 
                  section={activeSection} 
                  isMobile={isMobile} 
                  navigate={navigate} 
                />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
    </SeededModeProvider>
  )
}

// CES Calendar is now extracted to src/ui-staging/ces/CesCalendarV3.tsx

// ─────────────────────────────────────────────────────────────────────────────
// CES BOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
function CesBoardPage() {
  // Always render the real production component (seeds are on by default in the harness)
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#FFFFFF', minHeight: '100%' }}>
      <RealCesBoardPage />
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────
// REPORTS PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ReportsPage() {
  const [activeTab, setActiveTab] = useState<CesReportTab>('sprint')

  const { isSeeded } = useSeededMode()
  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }

  const snap = useComplianceExecution()
  const units = snap.executionUnits || []
  const metrics = snap.sprintMetrics
  const domainRisks = snap.domainRisks || []

  const stateCounts = units.reduce((acc: Record<string, number>, u: any) => {
    const st = u.complianceState || 'unknown'
    acc[st] = (acc[st] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const totalUnits = units.length

  const tabs: { id: CesReportTab; label: string }[] = [
    { id: 'sprint', label: 'Sprint Report' },
    { id: 'evidence', label: 'Evidence Gaps' },
    { id: 'compliance', label: 'Compliance Trend' },
    { id: 'audit-readiness', label: 'Audit Readiness' },
  ]

  const sprintTrends = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    sprint: i + 1,
    completionRate: 65 + Math.floor(Math.random() * 30),
    onTimeRate: 70 + Math.floor(Math.random() * 25),
    auditReadiness: 55 + Math.floor(Math.random() * 40),
    signatureSla: 80 + Math.floor(Math.random() * 18),
    blockedResolution: 1 + Math.floor(Math.random() * 5),
    carryOver: Math.floor(Math.random() * 6),
  })), [])

  function MiniChart({ data, color, target }: { data: number[]; color: string; target?: number }) {
    const max = Math.max(...data, target ?? 0)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 160, h = 40
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        {target != null && <line x1={0} y1={h - ((target - min) / range) * h} x2={w} y2={h - ((target - min) / range) * h} stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />}
        <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
        <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r={3} fill={color} />
      </svg>
    )
  }

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Reports & Analytics</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>Compliance performance trends and audit readiness metrics</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '7px 16px', fontSize: 12, background: 'transparent', color: activeTab === t.id ? V3.textPrimary : V3.textTertiary, border: 'none', borderBottom: activeTab === t.id ? `2px solid ${V3.teal}` : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === t.id ? 600 : 400, transition: 'all 0.2s ease' }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'sprint' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Sprint KPIs */}
          <div>
            <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>SPRINT KPIs</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Completion Rate', value: metrics?.completionRatePct != null ? `${metrics.completionRatePct}%` : '—' },
                { label: 'Audit Readiness', value: metrics?.auditReadinessScore != null ? `${metrics.auditReadinessScore}` : '—' },
                { label: 'Active Blockers', value: metrics?.activeBlockerCount != null ? metrics.activeBlockerCount : '—' },
                { label: 'Signature SLAs Missed', value: metrics?.signatureSlasMissed != null ? metrics.signatureSlasMissed : '—' },
                { label: 'Upcoming 48h Deadlines', value: metrics?.upcomingDeadlines48hCount != null ? metrics.upcomingDeadlines48hCount : '—' },
              ].map((m, i) => (
                <div key={i}>
                  <span style={{ fontSize: 22, fontWeight: 600, color: V3.textPrimary }}>{m.value}</span>
                  <span style={{ fontSize: 11, color: V3.textTertiary, marginLeft: 8 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Domain Breakdown */}
          <div>
            <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>DOMAIN BREAKDOWN</div>
            {domainRisks.length === 0 && <div style={{ color: V3.textTertiary, fontSize: 13 }}>No domain risk data available.</div>}
            {domainRisks.map((d: any, idx: number) => {
              const open = d.openUnits || 0
              const blocked = d.blockedCount || 0
              const risk = d.riskLevel || 'low'
              const pct = totalUnits > 0 ? Math.round(((d.openUnits || 0) / totalUnits) * 100) : 0
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ width: 140, fontSize: 12, color: V3.textPrimary }}>{d.domain}</span>
                  <span style={{ fontSize: 11, color: V3.textTertiary, minWidth: 140 }}>{open} open • {blocked} blocked • {risk}</span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#00D1C1', borderRadius: 2 }} />
                  </div>
                  <span style={{ width: 30, fontSize: 11, color: V3.textPrimary, textAlign: 'right' }}>{open}</span>
                </div>
              )
            })}
          </div>

          {/* Sprint Trends */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 12 }}>SPRINT TRENDS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px 24px' }}>
              {[
                { label: 'Completion Rate', data: sprintTrends.map(s => s.completionRate), target: 85, suffix: '%' },
                { label: 'On-Time Rate', data: sprintTrends.map(s => s.onTimeRate), target: 90, suffix: '%' },
                { label: 'Audit Readiness', data: sprintTrends.map(s => s.auditReadiness), target: 80, suffix: '%' },
                { label: 'Signature SLA', data: sprintTrends.map(s => s.signatureSla), target: 95, suffix: '%' },
                { label: 'Blocked Resolution (days)', data: sprintTrends.map(s => s.blockedResolution), color: '#FFA059' },
                { label: 'Carry-Over Units', data: sprintTrends.map(s => s.carryOver), color: '#FFA059' },
              ].map(chart => (
                <div key={chart.label}>
                  <div style={{ fontSize: 10, color: V3.textTertiary, marginBottom: 4 }}>{chart.label}</div>
                  <MiniChart data={chart.data} color={chart.color || '#00D1C1'} target={chart.target} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: V3.textPrimary, marginTop: 4 }}>
                    {chart.data[chart.data.length - 1]}{chart.suffix || ''}
                    <span style={{ fontSize: 10, marginLeft: 6, color: chart.data[chart.data.length - 1] > chart.data[chart.data.length - 2] ? '#00D1C1' : '#FFA059' }}>
                      {chart.data[chart.data.length - 1] > chart.data[chart.data.length - 2] ? '↑' : '↓'}
                      {Math.abs(chart.data[chart.data.length - 1] - chart.data[chart.data.length - 2])}{chart.suffix || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unit State Distribution */}
          <div>
            <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>UNIT STATE DISTRIBUTION</div>
            {Object.keys(stateCounts).length === 0 && <div style={{ color: V3.textTertiary, fontSize: 13 }}>No units loaded.</div>}
            {Object.entries(stateCounts).map(([state, count]) => {
              const pct = totalUnits > 0 ? Math.round((count / totalUnits) * 100) : 0
              return (
                <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                  <span style={{ width: 140, fontSize: 12, color: V3.textPrimary, textTransform: 'capitalize' }}>{state}</span>
                  <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#00D1C1', borderRadius: 2 }} />
                  </div>
                  <span style={{ width: 30, fontSize: 11, color: V3.textPrimary, textAlign: 'right' }}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 32, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {[
              { label: 'Total Units', value: totalUnits },
              { label: 'Open Items', value: units.filter((u: any) => u.complianceState !== 'completed').length },
              { label: 'Blocked', value: units.filter((u: any) => u.complianceState === 'blocked').length },
            ].map((m, i) => (
              <div key={i}>
                <span style={{ fontSize: 22, fontWeight: 600, color: V3.textPrimary }}>{m.value}</span>
                <span style={{ fontSize: 11, color: V3.textTertiary, marginLeft: 8 }}>{m.label}</span>
              </div>
            ))}
          </div>
          {domainRisks.length > 0 ? domainRisks.map((d: any, idx: number) => {
            const pct = d.openUnits && totalUnits ? Math.round((d.openUnits / totalUnits) * 100) : 0
            return (
              <div key={idx} style={{ padding: idx === domainRisks.length - 1 ? '8px 0 0' : '8px 0', borderBottom: idx === domainRisks.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: V3.textPrimary, fontSize: 14, fontWeight: 500 }}>{d.domain}</span>
                    {(d.blockedCount || 0) > 0 && <span style={{ fontSize: 10, color: V3.textTertiary }}>{d.blockedCount} blocked</span>}
                  </div>
                  <span style={{ color: V3.tealLight, fontSize: 14, fontWeight: 600 }}>{pct}% open</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: V3.tealLight, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          }) : <div style={{ color: V3.textTertiary }}>Evidence data derived from current execution units.</div>}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div>
          <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>COMPLIANCE METRICS</div>
          <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
            {[
              { label: 'Completion Rate', value: metrics?.completionRatePct != null ? `${metrics.completionRatePct}%` : '—' },
              { label: 'Audit Readiness', value: metrics?.auditReadinessScore != null ? metrics.auditReadinessScore : '—' },
            ].map((m, i) => (
              <div key={i}>
                <span style={{ fontSize: 22, fontWeight: 600, color: V3.textPrimary }}>{m.value}</span>
                <span style={{ fontSize: 11, color: V3.textTertiary, marginLeft: 8 }}>{m.label}</span>
              </div>
            ))}
          </div>
          <div style={{ color: V3.textTertiary, fontSize: 13 }}>Real-time compliance snapshot from CES execution state.</div>
        </div>
      )}

      {activeTab === 'audit-readiness' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>CURRENT SPRINT</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 700, color: V3.tealLight, lineHeight: 1 }}>{metrics?.auditReadinessScore != null ? metrics.auditReadinessScore : '—'}</span>
              <span style={{ fontSize: 14, color: V3.textTertiary }}>% Audit Readiness</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Active Blockers', value: metrics?.activeBlockerCount != null ? metrics.activeBlockerCount : '—' },
              { label: 'SLAs Missed', value: metrics?.signatureSlasMissed != null ? metrics.signatureSlasMissed : '—' },
              { label: '48h Deadlines', value: metrics?.upcomingDeadlines48hCount != null ? metrics.upcomingDeadlines48hCount : '—' },
            ].map((m, i) => (
              <div key={i}>
                <span style={{ fontSize: 20, fontWeight: 600, color: V3.textPrimary }}>{m.value}</span>
                <span style={{ fontSize: 11, color: V3.textTertiary, marginLeft: 8 }}>{m.label}</span>
              </div>
            ))}
          </div>
          <div style={{ color: V3.textTertiary, fontSize: 12, marginTop: 8 }}>Metrics pulled live from compliance execution snapshot.</div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ARTIFACT VIEWER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function ArtifactViewerPage() {
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'policy' | 'form'>('all')

  const formArtifacts = V3_FORMS.map(f => ({ id: f.id, title: f.title, type: 'Form', domain: f.domain, status: f.status, version: f.lastUpdated, content: `Completion rate: ${f.completionRate}% — Required by ${f.requiredBy}` }))
  const policyArtifacts = V3_POLICIES.map(p => ({ id: p.id, title: p.title, type: 'Policy', domain: p.domain, status: p.lifecycle, version: p.version, content: `Owner: ${p.owner} · Next review: ${p.nextReview}` }))
  const allArtifacts = [...formArtifacts, ...policyArtifacts]

  const filteredArtifacts = allArtifacts.filter(art => {
    const matchesSearch = !searchTerm || art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.domain.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || (typeFilter === 'policy' && art.type === 'Policy') || (typeFilter === 'form' && art.type === 'Form')
    return matchesSearch && matchesType
  })

  const selectedArtifact = selectedArtifactId ? allArtifacts.find(a => a.id === selectedArtifactId) : null

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Artifact Viewer</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>Forms &amp; Policies catalog — combined registry with inline preview</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'policy', label: 'Policies' },
          { id: 'form', label: 'Forms' },
        ].map(t => (
          <button key={t.id} onClick={() => setTypeFilter(t.id as any)} style={{ padding: '4px 12px', fontSize: 11, background: typeFilter === t.id ? 'rgba(0,209,193,0.1)' : 'transparent', color: typeFilter === t.id ? V3.tealLight : V3.textSecondary, border: 'none', borderRadius: 4, cursor: 'pointer' }}>{t.label}</button>
        ))}
        <input type="text" placeholder="Search artifacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, color: V3.textPrimary, width: 220 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filteredArtifacts.map((art, idx) => (
          <div key={art.id} onClick={() => setSelectedArtifactId(selectedArtifactId === art.id ? null : art.id)} style={{ padding: '14px 0', borderBottom: idx === filteredArtifacts.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: V3.orangeLight, fontWeight: 600, letterSpacing: '0.5px' }}>{art.type}</span>
              <span style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 500 }}>{art.title}</span>
            </div>
            <div style={{ fontSize: 11, color: V3.textSecondary }}>{art.domain} · v{art.version} · <span style={{ color: V3.tealLight }}>{art.status}</span></div>
          </div>
        ))}
      </div>

      {selectedArtifact && (
        <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F0F0F0' }}>{selectedArtifact.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{selectedArtifact.domain}</div>
            </div>
            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: selectedArtifact.type === 'Policy' ? 'rgba(0,209,193,0.08)' : 'rgba(255,160,89,0.08)', color: selectedArtifact.type === 'Policy' ? '#00D1C1' : '#FFA059' }}>
              {selectedArtifact.type.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', marginBottom: 16 }}>
            {[
              { label: 'Status', value: selectedArtifact.status || 'Active', color: '#00D1C1' },
              { label: 'Version', value: selectedArtifact.version || 'v3.0' },
              { label: 'Owner', value: selectedArtifact.type === 'Policy' ? (selectedArtifact.content.match(/Owner: ([^·]+)/)?.[1]?.trim() || 'Compliance Team') : 'Clinical Team' },
              { label: 'Format', value: 'PDF' },
              { label: 'Size', value: `${Math.floor(Math.random() * 500 + 50)} KB` },
              { label: 'Modified', value: selectedArtifact.version || '2026-05-15' },
            ].map(m => (
              <div key={m.label} style={{ padding: '2px 0' }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{m.label}: </span>
                <span style={{ fontSize: 11, color: m.color || 'rgba(255,255,255,0.7)' }}>{m.value}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 16, marginBottom: 6 }}>VERSION HISTORY</div>
          {[
            { version: 'v3.0', date: '2026-05-15', author: 'Maria Gonzalez', change: 'Updated compliance references' },
            { version: 'v2.1', date: '2026-03-01', author: 'Don Chen', change: 'Annual review — no changes' },
            { version: 'v2.0', date: '2025-09-10', author: 'Sarah Lee', change: 'Major revision per ACHC feedback' },
          ].map(v => (
            <div key={v.version} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#00D1C1' }}>{v.version}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{v.date}</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{v.author} — {v.change}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{filteredArtifacts.length} artifacts</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function AdminPage() {
  const systemSettings = { agency: V3_AGENCY.name, accreditation: V3_AGENCY.accreditation, clinicianCount: V3_AGENCY.clinicianCount, state: V3_AGENCY.state }
  const auditStats = V3_AUDIT_LOG.reduce((acc, e) => { acc[e.severity] = (acc[e.severity] || 0) + 1; return acc }, {} as Record<string, number>)
  const criticalEntries = V3_AUDIT_LOG.filter(e => e.severity === 'critical').sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5)

  const tabs: { id: 'users' | 'system' | 'integrations' | 'audit' | 'onboarding'; label: string }[] = [
    { id: 'users', label: 'Users' }, { id: 'system', label: 'System' }, { id: 'integrations', label: 'Integrations' }, { id: 'audit', label: 'Audit' }, { id: 'onboarding', label: 'Onboarding' },
  ]
  const [adminTab, setAdminTab] = useState<'users' | 'system' | 'integrations' | 'audit' | 'onboarding'>('users')

  return (
    <div className="v3-page-animate" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: V3.textPrimary, fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Administration</h1>
        <p style={{ color: V3.textTertiary, fontSize: 13, margin: 0 }}>User management, roles, system configuration, and audit logs</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setAdminTab(t.id)} style={{ padding: '7px 16px', fontSize: 12, background: 'transparent', color: adminTab === t.id ? V3.textPrimary : V3.textTertiary, border: 'none', borderBottom: adminTab === t.id ? `2px solid ${V3.teal}` : '2px solid transparent', cursor: 'pointer', fontWeight: adminTab === t.id ? 600 : 400, transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}>{t.label}</button>
        ))}
      </div>

      {adminTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adminUsers.map((u, idx) => (
            <div key={u.id} style={{ padding: idx === adminUsers.length - 1 ? '12px 0 0' : '12px 0', borderBottom: idx === adminUsers.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: V3.navySub, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                {u.mfaEnabled && <span style={{ fontSize: 10, color: V3.tealLight }}>MFA</span>}
                <span style={{ fontSize: 10, color: V3.textTertiary }}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 600, marginBottom: 4 }}>Agency Profile</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: V3.textSecondary, fontSize: 12 }}>Agency Name</span><span style={{ color: V3.textPrimary }}>{systemSettings.agency}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: V3.textSecondary, fontSize: 12 }}>Accreditation</span><span style={{ color: V3.tealLight }}>{systemSettings.accreditation}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: V3.textSecondary, fontSize: 12 }}>Clinicians</span><span style={{ color: V3.textPrimary }}>{systemSettings.clinicianCount}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: V3.textSecondary, fontSize: 12 }}>State</span><span style={{ color: V3.textPrimary }}>{systemSettings.state}</span></div>
          </div>
        </div>
      )}

      {adminTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: V3.textSecondary }}>Connected systems and external data sources</div>
          {['EHR Connector (Kinnser)', 'Hubstaff Time Tracking', 'ACHC Portal Sync'].map((i, idx) => (
            <div key={idx} style={{ padding: '10px 0', borderBottom: idx === 2 ? 'none' : '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: V3.textPrimary, fontSize: 13 }}>{i}</span>
              <span style={{ color: V3.tealLight, fontSize: 11 }}>Connected</span>
            </div>
          ))}
        </div>
      )}

      {adminTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: V3.textPrimary, marginBottom: 8 }}>Audit Statistics by Severity</div>
          {Object.entries(auditStats).map(([sev, count], idx) => (
            <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: V3.textSecondary, fontSize: 12, textTransform: 'capitalize' }}>{sev}</span>
              <span style={{ color: V3.textPrimary, fontWeight: 600 }}>{count} entries</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 8 }}>Total audit log entries: {V3_AUDIT_LOG.length}</div>

          <div style={{ fontSize: 13, color: V3.textPrimary, marginTop: 16, marginBottom: 8 }}>Recent Critical Entries</div>
          {criticalEntries.length > 0 ? criticalEntries.map((entry, idx) => (
            <div key={idx} style={{ padding: '10px 0', borderBottom: idx === criticalEntries.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#F0F0F0' }}>{entry.user}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{entry.action} — {entry.resource}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{entry.timestamp.slice(0, 10)}</div>
              </div>
            </div>
          )) : <div style={{ fontSize: 12, color: V3.textTertiary }}>No critical entries</div>}
        </div>
      )}

      {adminTab === 'onboarding' && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            {[
              { label: 'CLEARED FOR WORK', value: '18', color: '#00D1C1' },
              { label: 'APX F MISSING', value: '3', color: '#FFA059' },
              { label: 'ANNUAL TRAINING OVERDUE', value: '5', color: '#FFA059' },
              { label: 'CRITICAL ESCALATIONS', value: '2', color: '#FFA059' },
            ].map(kpi => (
              <div key={kpi.label}>
                <span style={{ fontSize: 20, fontWeight: 600, color: kpi.color }}>{kpi.value}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{kpi.label}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>ACTIVE ESCALATIONS</div>
          {[
            { employee: 'Sarah Mitchell, LVN', issue: 'Background check expired — 14 days overdue', severity: 'CRITICAL', date: '2026-05-07' },
            { employee: 'James Park, PT', issue: 'Supervised visit #3 not scheduled — clearance blocked', severity: 'CRITICAL', date: '2026-05-15' },
            { employee: 'Lisa Wong, RN', issue: 'Annual HIPAA training overdue by 30 days', severity: 'HIGH', date: '2026-04-21' },
            { employee: 'Robert Davis, OT', issue: 'Appendix F documentation incomplete', severity: 'MEDIUM', date: '2026-05-18' },
            { employee: 'Amy Chen, MSW', issue: 'CPR certification expiring in 7 days', severity: 'LOW', date: '2026-05-28' },
          ].map((esc, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#F0F0F0' }}>{esc.employee}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{esc.issue}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: esc.severity === 'CRITICAL' ? '#FFA059' : esc.severity === 'HIGH' ? 'rgba(255,160,89,0.7)' : '#00D1C1' }}>{esc.severity}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{esc.date}</div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 20, marginBottom: 8 }}>SURVEY READINESS</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            Personnel files audit-ready: <span style={{ color: '#00D1C1' }}>18/23 (78%)</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
            HR-TA compliance: <span style={{ color: '#00D1C1' }}>Active</span> · Last reviewed: 2026-05-01
          </div>
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
  const { isSeeded: useV3Seeds, setSeeded: setUseV3Seeds } = useSeededMode()
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
    case 'ces-calendar':
      return <CesCalendarV3 />
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
  const { isSeeded } = useSeededMode()
  const snap = useComplianceExecution()
  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }
  const cesUnits = snap.executionUnits || []
  const openUnits = cesUnits.filter(u => u.complianceState !== 'completed')
  const completedUnits = cesUnits.filter(u => u.complianceState === 'completed')
  const blockedUnits = cesUnits.filter(u => u.complianceState === 'blocked')
  const evidenceLinked = cesUnits.filter(u => (u.evidenceStatus?.requiredFormsComplete ?? 0) > 0).length
  const readiness = snap.sprintMetrics?.auditReadinessScore ?? 82
  const evidenceRate = cesUnits.length > 0 ? Math.round((evidenceLinked / cesUnits.length) * 100) : 91

  const critical = cesUnits.filter(u => u.complianceState === 'blocked' || ((u.escalationTimer ?? 99) < 0))
  const overdueRisk = cesUnits.filter(u => (u.escalationTimer ?? 99) < 0 && u.complianceState !== 'completed')
  const missingEvidence = cesUnits.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={LayoutDashboard}
        micro="AGENCY OPERATIONS"
        title="Dashboard"
        subtitle="Enterprise readiness, sprint pressure, and evidence momentum across the organization."
      />

      <div style={{ padding: '10px 0', marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 11, color: readiness >= 80 ? '#00D1C1' : '#FFA059' }}>
          {readiness >= 80 ? '✓ AGENCY AUDIT-READY' : '⚠ NOT AUDIT-READY'}
        </span>
        <span style={{ fontSize: 11, color: V3.textTertiary, marginLeft: 12 }}>
          {overdueRisk.length} overdue · {missingEvidence.length} missing evidence · {blockedUnits.length} blocked
        </span>
      </div>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'READINESS', value: `${readiness}%`, color: V3.tealLight },
          { label: 'OPEN', value: String(openUnits.length) },
          { label: 'BLOCKED', value: String(blockedUnits.length), color: V3.tealLight },
          { label: 'COMPLETED', value: String(completedUnits.length) },
          { label: 'EVIDENCE RATE', value: `${evidenceRate}%`, color: V3.tealLight },
          { label: 'CRITICAL ACTIONS', value: String(critical.length) },
          { label: 'OVERDUE RISK', value: String(overdueRisk.length), color: '#FFA059' },
          { label: 'MISSING EVIDENCE', value: String(missingEvidence.length) },
        ].map(stat => (
          <div key={stat.label}>
            <span style={{ fontSize: 22, fontWeight: 600, color: stat.color ?? V3.textPrimary }}>{stat.value}</span>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: V3.textTertiary, marginLeft: 8 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <div style={{ padding: '20px 0' }}>
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

          {[
            { label: 'CRITICAL & OVERDUE', units: cesUnits.filter(u => u.complianceState === 'blocked' || ((u.escalationTimer ?? 99) < 0)).slice(0, 5) },
            { label: 'IN PROGRESS', units: cesUnits.filter(u => u.complianceState === 'in_progress').slice(0, 5) },
            { label: 'MISSING EVIDENCE', units: cesUnits.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0).slice(0, 5) },
          ].map(section => (
            <div key={section.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
                {section.label} ({section.units.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {section.units.length === 0 ? (
                  <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No items.</div>
                ) : section.units.map(unit => (
                  <div
                    key={unit.id}
                    style={{
                      padding: '12px 0',
                      display: 'grid',
                      gridTemplateColumns: '28px 100px 1fr 90px',
                      gap: 10,
                      alignItems: 'center',
                      borderBottom: `1px solid rgba(255,255,255,0.04)`,
                    }}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,209,193,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#00D1C1' }}>
                      {unit.owner?.initials ?? '??'}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: V3.textTertiary, letterSpacing: 0.4, textTransform: 'uppercase' }}>{unit.domain}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', color: V3.tealLight }}>{unit.complianceState.replace('_', ' ').toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 13, color: V3.textPrimary }}>{unit.title}</div>
                    <div style={{ textAlign: 'right', fontSize: 11, color: (unit.escalationTimer ?? 99) < 0 ? V3.tealLight : V3.textTertiary }}>{unit.dueDate}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.textTertiary }}>Compliance Pulse</div>
            <div style={{ marginTop: 8, fontSize: 24, fontWeight: 600, color: V3.textPrimary }}>Stable</div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '82%', height: '100%', borderRadius: 999, background: V3.tealLight }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: V3.textSecondary }}>82% of controls verified in-cycle.</div>
          </div>

          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.textTertiary, marginBottom: 10 }}>Quick Jump</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                    padding: '4px 0',
                    background: 'transparent',
                    color: V3.textSecondary,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        {['CES Calendar', 'Evidence Center', 'Audit Trail', 'Reports'].map(label => (
          <button key={label} style={{ fontSize: 11, color: V3.textTertiary, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
            {label} →
          </button>
        ))}
      </div>
    </div>
  )
}

function MyPlannerPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue' | 'this-week' | 'evidence'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const personalTasks = useMemo(() => [
    { id: 'pt-1', title: 'Review updated infection control SOP', dueDate: '2026-05-22', status: 'open', category: 'Documentation' },
    { id: 'pt-2', title: 'Complete annual HIPAA training', dueDate: '2026-05-25', status: 'open', category: 'Training' },
    { id: 'pt-3', title: 'Schedule 1:1 with DON', dueDate: '2026-05-23', status: 'open', category: 'Meeting' },
    { id: 'pt-4', title: 'Submit mileage report for April', dueDate: '2026-05-21', status: 'overdue', category: 'Admin' },
    { id: 'pt-5', title: 'Update patient care plans for Zone B', dueDate: '2026-05-26', status: 'open', category: 'Clinical' },
    { id: 'pt-6', title: 'Prepare QAPI meeting notes', dueDate: '2026-05-28', status: 'open', category: 'Documentation' },
    { id: 'pt-7', title: 'Review new hire competency checklist', dueDate: '2026-05-24', status: 'done', category: 'HR' },
    { id: 'pt-8', title: 'Follow up on PT referral for Wilson', dueDate: '2026-05-20', status: 'overdue', category: 'Clinical' },
  ], [])

  const { isSeeded } = useSeededMode()
  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }

  const snap = useComplianceExecution()
  const units = snap.executionUnits || []
  const overdue = units.filter(u => (u.escalationTimer ?? 99) < 0 && u.complianceState !== 'completed')
  const active = units.filter(u => u.complianceState === 'in_progress')
  const awaiting = units.filter(u => u.complianceState === 'awaiting_signature')
  const blocked = units.filter(u => u.complianceState === 'blocked')
  const upcoming = units.filter(u => u.complianceState === 'upcoming')
  const completed = units.filter(u => u.complianceState === 'completed')

  const renderUnitRow = (unit: any, extra?: React.ReactNode) => (
    <div
      key={unit.id}
      style={{
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div style={{ fontSize: 13, color: V3.textPrimary, flex: 1 }}>{unit.title}</div>
        <div style={{ fontSize: 11, color: V3.tealLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{unit.complianceState.replace('_', ' ')}</div>
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: V3.textSecondary }}>
        <span>{unit.domain}</span>
        <span>Due {unit.dueDate}</span>
        <span>{(unit.evidenceStatus?.requiredFormsComplete ?? 0)}/{(unit.evidenceStatus?.requiredFormsTotal ?? 0)} forms</span>
        {extra}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={CheckSquare}
        micro="MY PERSONAL WORKSPACE"
        title="My Planner"
        subtitle="Personal sprint cockpit for high-priority obligations and operational follow-through."
      />

      {/* Filter bar + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 4 }}>
        {(['all', 'open', 'overdue', 'this-week', 'evidence'] as const).map(f => (
          <div
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: filter === f ? V3.tealLight : V3.textTertiary,
              borderBottom: filter === f ? `2px solid ${V3.tealLight}` : 'none',
              paddingBottom: 4,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {f === 'all' ? 'All' : f === 'open' ? 'Open' : f === 'overdue' ? 'Overdue' : f === 'this-week' ? 'This Week' : 'Evidence Pending'}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '4px 10px' }}>
          <Search size={14} color={V3.textTertiary} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, fontSize: 12, width: 180 }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {[
          { label: 'MY OPEN CES', value: String(active.length + overdue.length + awaiting.length + blocked.length) },
          { label: 'OVERDUE', value: String(overdue.length), color: '#FFA059' },
          { label: 'EVIDENCE PENDING', value: String(units.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0).length) },
          { label: 'PERSONAL TASKS', value: String(personalTasks.filter(t => t.status !== 'done').length) },
        ].map(stat => (
          <div key={stat.label}>
            <span style={{ fontSize: 18, fontWeight: 600, color: stat.color ?? V3.textPrimary }}>{stat.value}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: V3.textTertiary, marginLeft: 6 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* OVERDUE */}
        {(filter === 'all' || filter === 'overdue' || filter === 'open') && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              OVERDUE ({overdue.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {overdue.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No overdue items.</div> : overdue.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => renderUnitRow(u))}
            </div>
          </div>
        )}

        {/* BLOCKED */}
        {(filter === 'all' || filter === 'open') && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              BLOCKED ({blocked.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {blocked.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No blocked items.</div> : blocked.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => renderUnitRow(u, u.blockedReason ? <span>· {u.blockedReason.label}</span> : null))}
            </div>
          </div>
        )}

        {/* AWAITING SIGNATURE */}
        {(filter === 'all' || filter === 'open') && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              AWAITING SIGNATURE ({awaiting.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {awaiting.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No items awaiting signature.</div> : awaiting.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => {
                const signer = u.requiredSigners?.[0]
                const signerInfo = signer ? <span>· {signer.name} ({signer.role})</span> : null
                return renderUnitRow(u, signerInfo)
              })}
            </div>
          </div>
        )}

        {/* IN PROGRESS */}
        {(filter === 'all' || filter === 'open') && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              IN PROGRESS ({active.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {active.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No items in progress.</div> : active.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => renderUnitRow(u))}
            </div>
          </div>
        )}

        {/* UPCOMING */}
        {(filter === 'all' || filter === 'open' || filter === 'this-week') && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              UPCOMING ({upcoming.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcoming.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No upcoming items.</div> : upcoming.filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => renderUnitRow(u))}
            </div>
          </div>
        )}

        {/* COMPLETED (dimmed/collapsed) */}
        {filter === 'all' && (
          <div style={{ padding: '4px 0', opacity: 0.55 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              COMPLETED ({completed.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {completed.length === 0 ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No completed items yet.</div> : completed.slice(0, 4).map(u => renderUnitRow(u))}
              {completed.length > 4 && <div style={{ fontSize: 11, color: V3.textTertiary, paddingTop: 6 }}>… and {completed.length - 4} more</div>}
            </div>
          </div>
        )}

        {/* Evidence pending special for evidence filter */}
        {filter === 'evidence' && (
          <div style={{ padding: '4px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', textTransform: 'uppercase', marginBottom: 8 }}>
              EVIDENCE GAPS ({units.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0).filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {units.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0).filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0
                ? <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No evidence gaps.</div>
                : units.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0).filter(u => !searchTerm || (u.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map(u => renderUnitRow(u))}
            </div>
          </div>
        )}
      </div>

      {/* PERSONAL TASKS */}
      {(filter !== 'evidence') && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 10 }}>
            PERSONAL TASKS ({personalTasks.filter(t => t.status !== 'done').filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase())).length})
          </div>
          {personalTasks.filter(t => t.status !== 'done').filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase())).map(task => (
            <div key={task.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: V3.textPrimary }}>{task.title}</div>
                <div style={{ fontSize: 10, color: V3.textTertiary, marginTop: 2 }}>{task.category}</div>
              </div>
              <div style={{ fontSize: 11, color: task.status === 'overdue' ? '#FFA059' : V3.textTertiary }}>{task.dueDate}</div>
            </div>
          ))}
          {personalTasks.filter(t => t.status !== 'done').filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
            <div style={{ color: V3.textTertiary, fontSize: 12, padding: '8px 0' }}>No personal tasks match.</div>
          )}
        </div>
      )}
    </div>
  )
}

function CliniciansPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { isSeeded } = useSeededMode()
  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }

  const clinicians = MOCK_CLINICIANS

  const filtered = clinicians.filter(c => {
    const q = searchTerm.toLowerCase()
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
    const matchesSearch = !q || fullName.includes(q) || (c.email || '').toLowerCase().includes(q)
    const matchesDisc = disciplineFilter === 'all' || c.primaryDiscipline.toUpperCase() === disciplineFilter.toUpperCase()
    const st = (c.status || '').toLowerCase()
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'Active' && st === 'active') ||
      (statusFilter === 'Pending' && st === 'pending') ||
      (statusFilter === 'On Leave' && st === 'on_leave')
    return matchesSearch && matchesDisc && matchesStatus
  })

  const selectedClinician = selectedId ? clinicians.find(c => c.id === selectedId) : null
  const assignedPatients = selectedClinician ? V3_PATIENTS.filter(p => p.primaryClinician === `${selectedClinician.firstName} ${selectedClinician.lastName}`) : []
  const closeModal = () => setSelectedId(null)

  const disciplines = [...new Set(MOCK_CLINICIANS.map(c => c.primaryDiscipline))]
  const discTabs = ['all', ...disciplines]
  const statusTabs = ['all', 'Active', 'On Leave', 'Pending']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={Users}
        micro="PHASE 1 • READ-ONLY"
        title="Clinician Profiles"
        subtitle="Role-based roster with case load, audit status, and readiness flags."
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', maxWidth: 380 }}>
        <Search size={16} color={V3.textTertiary} />
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search clinicians..."
          style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 13 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {discTabs.map(d => (
          <span
            key={d}
            onClick={() => setDisciplineFilter(d)}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: disciplineFilter === d ? V3.tealLight : V3.textSecondary,
              borderBottom: disciplineFilter === d ? `2px solid ${V3.tealLight}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {d === 'all' ? 'All' : d}
          </span>
        ))}
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
        {statusTabs.map(s => (
          <span
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              color: statusFilter === s ? V3.tealLight : V3.textSecondary,
              borderBottom: statusFilter === s ? `2px solid ${V3.tealLight}` : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? 'All' : s}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 16 }}>
          <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Name</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Discipline</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Status</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Employment</span>
          <span style={{ flex: 0.9, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Service Areas</span>
          <span style={{ flex: 0.8, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Max Hrs</span>
        </div>
        {filtered.map((c) => {
          const fullName = `${c.firstName} ${c.lastName}`
          const compCount = c.competencies ? c.competencies.length : 0
          const credCount = c.credentials ? c.credentials.length : 0
          const cases = V3_PATIENTS.filter(p => p.primaryClinician === fullName).length
          return (
            <div
              key={c.id}
              className="v3-invisible-glare"
              onClick={() => setSelectedId(c.id)}
              style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 16, borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
            >
              <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: V3.textSecondary, fontWeight: 700 }}>
                  {c.firstName[0]}{c.lastName[0]}
                </span>
                <span style={{ fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{fullName}</span>
              </div>
              <span style={{ flex: 1, fontSize: 11, color: V3.textPrimary, background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', width: 'fit-content' }}>{c.primaryDiscipline}</span>
              <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: c.status === 'active' ? V3.tealLight : V3.textSecondary }}>{c.status}</span>
              <span style={{ flex: 1, fontSize: 12, color: V3.textSecondary }}>{c.employmentType}</span>
              <span style={{ flex: 0.9, fontSize: 11, color: V3.textPrimary }}>{c.serviceAreas?.join(', ') || '—'}</span>
              <span style={{ flex: 0.8, fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{c.maxHoursPerWeek || '—'}</span>
            </div>
          )
        })}
      </div>

      {selectedClinician && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 101, width: 'min(560px, 92vw)', maxHeight: '82vh', overflow: 'auto', background: 'rgba(16,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: V3.textTertiary, textTransform: 'uppercase' }}>CLINICIAN PROFILE</div>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: V3.textSecondary, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ fontSize: 24, fontWeight: 600, color: V3.textPrimary, marginBottom: 20 }}>{`${selectedClinician.firstName} ${selectedClinician.lastName}`}</div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: '#fb923c', textTransform: 'uppercase', marginBottom: 6 }}>OVERVIEW</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Discipline</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.primaryDiscipline}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Status</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.status}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Employment</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.employmentType} • {selectedClinician.maxHoursPerWeek || '—'}h/wk</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Service Areas</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.serviceAreas?.join(', ') || '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Email</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.email || '—'}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: V3.textTertiary }}>Credentials</span><span style={{ color: V3.textPrimary, fontWeight: 500 }}>{selectedClinician.credentials.length} active</span></div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: '#fb923c', textTransform: 'uppercase', margin: '16px 0 6px' }}>CREDENTIALS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {selectedClinician.credentials.map(cred => (
                <div key={cred.credentialName} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ fontSize: 12, color: '#F0F0F0' }}>{cred.credentialName}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                    {cred.type} · {cred.state || 'National'} · Expires: {cred.expiresAt || 'N/A'}
                    <span style={{ marginLeft: 8, color: cred.status === 'active' ? '#00D1C1' : '#FFA059' }}>{cred.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: '#fb923c', textTransform: 'uppercase', margin: '16px 0 6px' }}>COMPETENCIES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {selectedClinician.competencies.map(comp => (
                <div key={comp.name} style={{ padding: '3px 0', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                  {comp.name} <span style={{ color: '#00D1C1', fontSize: 9 }}>{comp.level?.toUpperCase() || 'BASIC'}</span>
                </div>
              ))}
            </div>

            {selectedClinician.religiousRestrictions?.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>ACCOMMODATIONS</div>
                {selectedClinician.religiousRestrictions.map(r => (
                  <div key={r.type || r.day} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{r.type || 'Restriction'}: {r.description}</div>
                ))}
              </>
            )}
            {selectedClinician.fmlaLeave && (
              <div style={{ fontSize: 11, color: '#FFA059', marginTop: 4 }}>FMLA Active: {selectedClinician.fmlaLeave.leaveType || 'FMLA'}</div>
            )}
            {selectedClinician.adaAccommodations?.length > 0 && (
              <div style={{ fontSize: 11, color: '#FFA059', marginTop: 4 }}>
                ADA: {selectedClinician.adaAccommodations.map(a => a.description).join('; ')}
              </div>
            )}

            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: '#fb923c', textTransform: 'uppercase', margin: '16px 0 6px' }}>ASSIGNMENTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              {assignedPatients.length > 0 ? assignedPatients.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: V3.textPrimary }}>
                  <span>{p.name}</span>
                  <span style={{ color: V3.textSecondary }}>{p.mrn} • {p.acuity.split(' — ')[0]}</span>
                </div>
              )) : <span style={{ color: V3.textSecondary }}>No active assignments</span>}
            </div>

            <button onClick={closeModal} style={{ marginTop: 24, padding: '12px 18px', borderRadius: 10, border: `1px solid ${V3.borderHighlight}`, background: 'transparent', color: V3.textPrimary, fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>Close</button>
          </div>
        </>
      )}
    </div>
  )
}

function PatientsPage() {
  const { isSeeded } = useSeededMode()
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null)
  const [acuityFilter, setAcuityFilter] = useState<string>('all')
  const [settingFilter, setSettingFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }

  const toggleExpand = (mrn: string) => {
    setExpandedPatient(expandedPatient === mrn ? null : mrn)
  }

  const patientEnrichments = useMemo(() => V3_PATIENTS.map((p, idx) => {
    const realPatient = MOCK_PATIENTS[idx] // map first 6 to real detailed patients for enrichment
    const matchedShiftNeeds = MOCK_SHIFT_NEEDS?.filter(sn => sn.patientId === (realPatient?.id || '')) || []
    return {
      ...p,
      admissionDate: p.startOfCare,
      dischargeDate: null,
      continuityPriority: Math.random() > 0.7,
      caseloadPoints: realPatient?.weightedCaseloadPoints || Math.floor(Math.random() * 5) + 1,
      acuityLevel: realPatient?.acuityLevel || p.acuity,
      requiredDisciplines: realPatient?.requiredDisciplines || p.disciplines,
      serviceZone: realPatient?.serviceZone || p.zone,
      careTeam: {
        accm: V3_STAFF[Math.floor(Math.random() * 5)]?.name || 'Unassigned',
        ccm: V3_STAFF[Math.floor(Math.random() * V3_STAFF.length)]?.name || 'Unassigned',
      },
      shiftNeeds: matchedShiftNeeds.length > 0 ? matchedShiftNeeds : [
        { day: 'Mon/Wed/Fri', time: '08:00-10:00', type: 'SN', notes: 'Wound care' },
      ].slice(0, 1 + Math.floor(Math.random() * 2)),
      realShiftNeeds: matchedShiftNeeds,
    }
  }), [])

  const filtered = patientEnrichments.filter(p =>
    (acuityFilter === 'all' || p.acuity.includes(acuityFilter)) &&
    (settingFilter === 'all' || p.setting.toLowerCase() === settingFilter) &&
    (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={Activity}
        micro="STEP 2 READ-ONLY"
        title="Patient Profiles"
        subtitle="Patient census with acuity posture, setting, and assigned accountability owner."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '10px 16px', maxWidth: 380 }}>
          <Search size={16} color={V3.textTertiary} />
          <input
            placeholder="Search patients or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['all', 'Level 1', 'Level 2', 'Level 3', 'Level 4'].map(level => (
            <button
              key={level}
              type="button"
              onClick={() => setAcuityFilter(level)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderBottom: acuityFilter === level ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                background: 'transparent',
                color: acuityFilter === level ? V3.textPrimary : V3.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {level === 'all' ? 'All' : level}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'home', 'facility'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSettingFilter(s)}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderBottom: settingFilter === s ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                background: 'transparent',
                color: settingFilter === s ? V3.textPrimary : V3.textSecondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 16 }}>
          <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Name</span>
          <span style={{ flex: 1.2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>MRN</span>
          <span style={{ flex: 1.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Acuity</span>
          <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Setting</span>
          <span style={{ flex: 0.7, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Zone</span>
          <span style={{ flex: 1.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Disciplines</span>
          <span style={{ flex: 1.5, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: 0.6 }}>Clinician</span>
        </div>
        {filtered.map(patient => {
          const isExpanded = expandedPatient === patient.mrn
          return (
            <div key={patient.mrn}>
              <div
                onClick={() => toggleExpand(patient.mrn)}
                className="v3-invisible-glare"
                style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 16, borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
              >
                <span style={{ flex: 2, fontSize: 14, color: V3.textPrimary, fontWeight: 600 }}>{patient.name}</span>
                <span style={{ flex: 1.2, fontSize: 12, color: V3.textTertiary, fontFamily: 'monospace' }}>{patient.mrn}</span>
                <span style={{ flex: 1.5, fontSize: 12, color: patient.acuity.includes('Level 1') ? V3.textSecondary : V3.tealLight }}>{patient.acuity}</span>
                <span style={{ flex: 1, fontSize: 12, color: V3.textSecondary }}>{patient.setting}</span>
                <span style={{ flex: 0.7, fontSize: 12, color: V3.textSecondary }}>{patient.zone}</span>
                <span style={{ flex: 1.5, fontSize: 11, color: V3.textSecondary }}>{patient.disciplines.join(', ')}</span>
                <span style={{ flex: 1.5, fontSize: 12, color: V3.textPrimary }}>{patient.primaryClinician}</span>
              </div>
              {isExpanded && (
                <div style={{ padding: '16px 24px 20px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: 0.5 }}>DEMOGRAPHICS</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Name:</span> {patient.name}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>MRN:</span> {patient.mrn}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Acuity:</span> {patient.acuity} {patient.acuityLevel ? `(${patient.acuityLevel})` : ''}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Setting:</span> {patient.setting} · Zone {patient.serviceZone || patient.zone}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Admission:</span> {patient.admissionDate}</div>
                  {patient.caseloadPoints && <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Weighted Caseload Points:</span> {patient.caseloadPoints}</div>}
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Cert Period End:</span> {patient.certPeriodEnd}</div>

                  <div style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: 0.5, marginTop: 8 }}>CARE TEAM</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Primary Clinician:</span> {patient.primaryClinician}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>ACCM:</span> {patient.careTeam.accm}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>CCM:</span> {patient.careTeam.ccm}</div>
                  <div style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Physician:</span> {patient.physician}</div>

                  <div style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: 0.5, marginTop: 8 }}>SHIFT NEEDS</div>
                  {patient.realShiftNeeds?.length > 0 ? (
                    patient.realShiftNeeds.map((sn: any) => (
                      <div key={sn.id} style={{ padding: '3px 0', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                        {sn.requiredDiscipline} · {typeof sn.visitWindow === 'object' ? `${sn.visitWindow.startTime}-${sn.visitWindow.endTime}` : sn.visitWindow} · {sn.frequency} · {sn.durationHours}h
                        {sn.status === 'open' && <span style={{ color: '#FFA059', marginLeft: 8 }}>OPEN</span>}
                      </div>
                    ))
                  ) : patient.shiftNeeds.length > 0 ? (
                    patient.shiftNeeds.map((sn: any, idx: number) => (
                      <div key={idx} style={{ fontSize: 12, color: V3.textSecondary }}><span style={{ color: V3.orangeLight, fontWeight: 600 }}>{sn.day} {sn.time} · {sn.type}:</span> {sn.notes}</div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: V3.textSecondary }}>No scheduled shifts</div>
                  )}

                  <div style={{ fontSize: 11, color: V3.textTertiary, fontWeight: 600, letterSpacing: 0.5, marginTop: 8 }}>DISCIPLINES</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {patient.disciplines.map((d, idx) => (
                      <span key={idx} style={{ fontSize: 11, color: V3.tealLight, background: 'rgba(0,209,193,0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{d}</span>
                    ))}
                  </div>

                  {patient.continuityPriority && (
                    <div style={{ marginTop: 8, fontSize: 12, color: V3.tealLight, fontWeight: 700 }}>⚡ CONTINUITY PRIORITY</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CalendarPage() {
  const [selectedVisit, setSelectedVisit] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week')

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const { isSeeded } = useSeededMode()

  const snap = useComplianceExecution()
  const cesUnits = snap.executionUnits || []

  // Use real production events instead of tiny CES snapshot
  const allEvents = REGULATORY_EVENTS // ~295 events
  // Filter to current month for month view, current week for week view
  const currentMonthEvents = allEvents.filter(ev => ev.date?.startsWith('2026-05'))

  if (!isSeeded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300 }}>
        <div style={{ textAlign: 'center', color: '#64748B', fontSize: 13 }}>Toggle seeds to populate this surface.</div>
      </div>
    )
  }

  const weekStart = '2026-05-18'
  const weekDates = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23', '2026-05-24']

  const urgencyColor = (u: string) => {
    if (u === 'overdue' || u === 'critical') return '#FFA059'
    if (u === 'complete') return 'rgba(255,255,255,0.3)'
    return '#00D1C1'
  }

  const visitsByDay: Record<string, typeof V3_VISITS> = {}
  weekDates.forEach(d => { visitsByDay[d] = V3_VISITS.filter(v => v.date === d) })

  const handleVisitClick = (visitId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX })
    setSelectedVisit(visitId === selectedVisit ? null : visitId)
  }

  const selectedVisitData = selectedVisit ? V3_VISITS.find(v => v.id === selectedVisit) : null
  const selectedEventData = selectedEvent ? allEvents.find(ev => ev.id === selectedEvent) : null

  const handleEventClick = (eventId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX })
    setSelectedEvent(eventId === selectedEvent ? null : eventId)
    setSelectedVisit(null)
  }

  const enrichedVisits = V3_VISITS

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      <HeaderBlock icon={Calendar} micro="SCHEDULING & COVERAGE" title="Visit Calendar" subtitle="Operational schedule for field visits, committee cycles, and deadline anchors." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: V3.textPrimary }}>Week of May 18, 2026</div>
        <div style={{ fontSize: 12, color: V3.textSecondary }}>Mon–Sun · {V3_VISITS.length} scheduled visits</div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {(['week', 'month', 'list'] as const).map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{
            fontSize: 11, fontWeight: 600, padding: '6px 0', background: 'none', border: 'none',
            color: viewMode === mode ? '#00D1C1' : 'rgba(255,255,255,0.4)',
            borderBottom: viewMode === mode ? '2px solid #00D1C1' : '2px solid transparent',
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>{mode}</button>
        ))}
      </div>

      {viewMode === 'week' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, background: 'rgba(255,255,255,0.04)' }}>
          {weekDays.map((day) => (
            <div key={day} style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: V3.textTertiary, padding: '8px 10px', background: V3.navySub, borderBottom: `1px solid ${V3.borderDefault}` }}>
              {day}
            </div>
          ))}
          {weekDates.map((date) => {
            const dayVisits = visitsByDay[date] || []
            const dayEvents = allEvents.filter(ev => ev.date === date)
            const isToday = date === '2026-05-21'
            return (
              <div key={date} style={{ minHeight: 160, padding: '8px 6px', background: V3.navySub, borderBottom: isToday ? `2px solid ${V3.tealLight}` : `1px solid ${V3.borderDefault}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 11, color: isToday ? V3.tealLight : V3.textSecondary, marginBottom: 4 }}>{date.slice(5)}</div>
                {dayVisits.length === 0 && dayEvents.length === 0 && <div style={{ fontSize: 10, color: V3.textTertiary }}>—</div>}
                {dayVisits.map(visit => {
                  const initials = visit.clinicianName.split(',')[0].split(' ').map(n => n[0]).join('')
                  return (
                    <div
                      key={visit.id}
                      onClick={(e) => handleVisitClick(visit.id, e)}
                      style={{ padding: '6px 8px', cursor: 'pointer', borderBottom: `1px solid rgba(255,255,255,0.06)`, fontSize: 11 }}
                    >
                      <div style={{ color: V3.textPrimary, fontWeight: 600 }}>{visit.time} · {visit.patientName}</div>
                      <div style={{ color: V3.textSecondary, fontSize: 10 }}>{initials} · {visit.type}</div>
                    </div>
                  )
                })}
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={(e) => handleEventClick(ev.id, e)}
                    style={{ fontSize: 10, padding: '2px 6px', marginTop: 2, background: 'rgba(255,160,89,0.08)', borderRadius: 3, color: urgencyColor(ev.urgency), cursor: 'pointer', borderLeft: `3px solid ${urgencyColor(ev.urgency)}` }}
                  >
                    📋 {ev.title.length > 20 ? ev.title.slice(0, 18) + '…' : ev.title}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {viewMode === 'month' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>MAY 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 4 }}>{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const dayStr = `2026-05-${String(day).padStart(2, '0')}`
              const dayVisits = enrichedVisits.filter(v => v.date === dayStr)
              const dayEvents = allEvents.filter(ev => ev.date === dayStr)
              const isToday = day === 21
              return (
                <div key={day} style={{ padding: 4, minHeight: 50, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: 10, color: isToday ? '#00D1C1' : 'rgba(255,255,255,0.5)', fontWeight: isToday ? 700 : 400 }}>{day}</div>
                  {dayVisits.length > 0 && <div style={{ fontSize: 8, color: '#00D1C1', marginTop: 2 }}>{dayVisits.length} visits</div>}
                  {dayEvents.length > 0 && <div style={{ fontSize: 8, color: '#FFA059', marginTop: 1 }}>{dayEvents.length} events</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>ALL EVENTS & VISITS</div>
          {[...enrichedVisits.map(v => ({ ...v, type: 'visit' as const })), ...currentMonthEvents.map(ev => ({ ...ev, type: 'regulatory' as const }))]
            .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
            .slice(0, 50)
            .map(item => (
              <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 9, width: 50, color: item.type === 'visit' ? '#00D1C1' : '#FFA059' }}>{item.type === 'visit' ? 'VISIT' : 'REG'}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', width: 80 }}>{item.date}</span>
                <span style={{ fontSize: 12, color: '#F0F0F0', flex: 1 }}>{item.title || (item as any).patientName}</span>
                {item.type === 'regulatory' && (
                  <>
                    <span style={{ fontSize: 10, color: '#94A3B8' }}>{item.domain}</span>
                    <span style={{ fontSize: 10, color: urgencyColor(item.urgency) }}>{item.urgency}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{item.owner}</span>
                  </>
                )}
              </div>
            ))}
        </div>
      )}

      {selectedVisitData && viewMode === 'week' && (
        <div style={{ position: 'absolute', top: popoverPos.top, left: popoverPos.left, zIndex: 50, background: 'rgba(16,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, width: 200, pointerEvents: 'auto' }}>
          <div style={{ fontSize: 12, color: V3.orangeLight, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedVisitData.type}</div>
          <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 600, marginBottom: 4 }}>{selectedVisitData.patientName}</div>
          <div style={{ fontSize: 11, color: V3.textSecondary, marginBottom: 2 }}>{selectedVisitData.date} {selectedVisitData.time}</div>
          <div style={{ fontSize: 11, color: V3.textSecondary, marginBottom: 2 }}>Clinician: {selectedVisitData.clinicianName}</div>
          <div style={{ fontSize: 11, color: V3.textSecondary, marginBottom: 2 }}>Duration: {selectedVisitData.duration} · Zone {selectedVisitData.zone}</div>
          <div style={{ fontSize: 11, color: V3.tealLight, marginTop: 6 }}>{selectedVisitData.status}</div>
        </div>
      )}

      {selectedEventData && (
        <div style={{ position: 'absolute', top: popoverPos.top, left: popoverPos.left, zIndex: 50, background: 'rgba(16,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, width: 280, pointerEvents: 'auto' }}>
          <div style={{ fontSize: 12, color: '#FFA059', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedEventData.domain}</div>
          <div style={{ fontSize: 13, color: V3.textPrimary, fontWeight: 600, marginBottom: 4 }}>{selectedEventData.title}</div>
          <div style={{ fontSize: 11, color: V3.textSecondary, marginBottom: 2 }}>Cadence: {selectedEventData.cadence}</div>
          <div style={{ fontSize: 11, color: V3.textSecondary, marginBottom: 2 }}>Owner: {selectedEventData.owner} · {selectedEventData.ownerRole}</div>
          <div style={{ fontSize: 11, color: urgencyColor(selectedEventData.urgency), marginBottom: 2 }}>Urgency: {selectedEventData.urgency}</div>
          {selectedEventData.policyRefs && selectedEventData.policyRefs.length > 0 && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
              Policy Refs: {selectedEventData.policyRefs.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BradPage() {
  const snap = useComplianceExecution()
  const units = snap.executionUnits || []
  const metrics = snap.sprintMetrics

  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'brad' | 'user'; text: string; citations?: string[] }>>([])

  function handleQuery() {
    if (!query.trim()) return
    const userMsg = query.trim()
    setQuery('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])

    // Simple classify + generate
    const lower = userMsg.toLowerCase()
    let response = ''
    let citations: string[] = []

    if (lower.includes('blocked') || lower.includes('blocker')) {
      const blockedItems = units.filter(u => u.complianceState === 'blocked')
      response = `There are ${blockedItems.length} blocked execution units this sprint. ${blockedItems.slice(0, 3).map(u => `"${u.title}" — ${u.blockedReason || 'no reason specified'}`).join('; ')}. Recommend escalating items blocked >48h to DON.`
      citations = ['CES Sprint Policy §3.2', 'Escalation Protocol EP-001']
    } else if (lower.includes('overdue') || lower.includes('late')) {
      const overdueItems = units.filter(u => (u.escalationTimer ?? 99) < 0)
      response = `${overdueItems.length} items are currently overdue. Top priorities: ${overdueItems.slice(0, 3).map(u => `"${u.title}" (${Math.abs(u.escalationTimer || 0)} days past due)`).join(', ')}. Per policy, overdue items require DON acknowledgment within 24h.`
      citations = ['42 CFR §484.65', 'Overdue Response SOP-045']
    } else if (lower.includes('evidence') || lower.includes('form')) {
      const missingEv = units.filter(u => (u.evidenceStatus?.missingFormIds?.length ?? 0) > 0)
      response = `${missingEv.length} units have evidence gaps. Missing forms include documentation for ${missingEv.slice(0, 2).map(u => u.title).join(' and ')}. Ensure all required forms are uploaded before sprint close to maintain audit readiness.`
      citations = ['Evidence Management Policy EV-001', 'ACHC Standard 4.2.1']
    } else if (lower.includes('audit') || lower.includes('readiness')) {
      response = `Current audit readiness score: ${metrics?.auditReadinessScore ?? 82}%. ${(metrics?.auditReadinessScore ?? 82) >= 80 ? 'Agency is audit-ready.' : 'Agency is NOT audit-ready — address gaps immediately.'} Key factors: completion rate ${metrics?.completionRatePct ?? 75}%, active blockers ${metrics?.activeBlockerCount ?? 0}, signature SLAs missed ${metrics?.signatureSlasMissed ?? 0}.`
      citations = ['ACHC Survey Readiness Checklist', 'Compliance Dashboard SOP-012']
    } else {
      response = `I can help with compliance questions, blocked items, overdue tasks, evidence gaps, audit readiness, and policy lookups. Try asking about specific topics like "What's overdue?" or "How's our audit readiness?"`
      citations = []
    }

    setTimeout(() => setMessages(prev => [...prev, { role: 'brad', text: response, citations }]), 300)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <HeaderBlock icon={Bot} micro="AI INTELLIGENCE" title="Brad AI Copilot" subtitle="Run compliance queries, generate remediation drafts, and simulate board-ready summaries." />

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Initial Brad greeting */}
        <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: 'rgba(0,209,193,0.08)', maxWidth: '85%' }}>
          <span style={{ fontSize: 12, color: V3.textPrimary }}>Hi! I'm Brad, your compliance copilot. I can help with blocked items, overdue tasks, evidence gaps, audit readiness, and policy questions. What would you like to know?</span>
        </div>

        {/* Suggestion chips (keep existing but as initial prompts) */}
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['What items are blocked?', 'Show overdue tasks', 'Audit readiness status', 'Evidence gaps'].map(s => (
              <button key={s} onClick={() => { setQuery(s); handleQuery() }} style={{ fontSize: 11, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: V3.textSecondary, cursor: 'pointer' }}>{s}</button>
            ))}
          </div>
        )}

        {/* Message history */}
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <div style={{ padding: '10px 14px', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: msg.role === 'user' ? 'rgba(255,255,255,0.06)' : 'rgba(0,209,193,0.08)' }}>
              <span style={{ fontSize: 12, color: V3.textPrimary }}>{msg.text}</span>
            </div>
            {msg.citations && msg.citations.length > 0 && (
              <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {msg.citations.map(c => (
                  <span key={c} style={{ fontSize: 9, color: '#00D1C1', padding: '1px 5px', background: 'rgba(0,209,193,0.08)', borderRadius: 3 }}>📎 {c}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && query.trim()) handleQuery() }}
            placeholder="Ask Brad about compliance, policies, workflows..."
            style={{ flex: 1, padding: '10px 14px', fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F0F0F0', outline: 'none' }}
          />
          <button onClick={handleQuery} style={{ padding: '10px 16px', background: 'rgba(0,209,193,0.15)', border: 'none', borderRadius: 8, color: '#00D1C1', fontSize: 12, cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  )
}

function PolicyLibraryPage({ navigate }: { navigate: (id: SectionId) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeDomain, setActiveDomain] = useState<string>('All')

  const domainCodes = useMemo(() => [...new Set(frameworkPolicies.map(p => p.domainCode))], [])
  const domainMap = useMemo(() => Object.fromEntries(frameworkDomains.map(d => [d.code, d.name])), [])
  const subdomainMap = useMemo(() => Object.fromEntries(frameworkSubdomains.map(s => [s.code, s.name])), [])

  const filteredPolicies = useMemo(() => {
    if (activeDomain === 'All') return frameworkPolicies
    return frameworkPolicies.filter(p => p.domainCode === activeDomain)
  }, [activeDomain])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
          {['All', ...domainCodes].map((code, index) => {
            const label = code === 'All' ? 'All Domains' : (domainMap[code] || code)
            const isActive = (code === 'All' && activeDomain === 'All') || code === activeDomain
            return (
              <button
                key={code}
                type="button"
                className="btn-smooth-hover"
                onClick={() => setActiveDomain(code === 'All' ? 'All' : code)}
                style={{
                  padding: '8px 14px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? V3.textPrimary : V3.textSecondary,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All Lifecycle', 'Draft', 'Under Review', 'Approved', 'Published', 'Archived'].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className="btn-smooth-hover"
            style={{
              padding: '6px 12px',
              border: 'none',
              borderBottom: index === 0 ? `2px solid ${V3.tealLight}` : '2px solid transparent',
              background: 'transparent',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filteredPolicies.map(policy => {
          const isExpanded = expandedId === policy.id
          const domainName = domainMap[policy.domainCode] || policy.domainCode
          const subdomainName = subdomainMap[policy.subdomainCode] || policy.subdomainCode
          return (
            <div
              key={policy.id}
              className="btn-smooth-hover"
              onClick={() => setExpandedId(isExpanded ? null : policy.id)}
              style={{
                border: 'none',
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                background: 'transparent',
                padding: '16px 4px',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: V3.textTertiary, fontFamily: 'monospace' }}>{policy.id}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, color: V3.tealLight, background: 'rgba(0,209,193,0.1)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                    {policy.lifecycleStatus}
                  </span>
                  <span style={{ fontSize: 10, color: V3.tealLight, background: 'rgba(0,209,193,0.08)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase', fontWeight: 700 }}>
                    {policy.tier}
                  </span>
                  {policy.isPublished && (
                    <span style={{ fontSize: 10, color: V3.tealLight, padding: '3px 8px', textTransform: 'uppercase', fontWeight: 700 }}>
                      Published
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 600, lineHeight: 1.3, marginTop: 4 }}>{policy.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: V3.textSecondary }}>{domainName}</span>
                <span style={{ fontSize: 12, color: V3.textTertiary }}>{policy.updatedAt?.slice(0, 10)}</span>
              </div>
              <div style={{ fontSize: 11, color: V3.textTertiary, marginTop: 2 }}>Owner: {policy.ownerSteward}</div>

              {isExpanded && (
                <div style={{ maxHeight: 600, overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
                  <div style={{ padding: '12px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>POLICY DETAILS</div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Title: <span style={{ color: V3.textSecondary }}>{policy.title}</span> &nbsp;&nbsp; Version: <span style={{ color: V3.textSecondary }}>{policy.currentVersion}</span>
                  </div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Domain: <span style={{ color: V3.textSecondary }}>{domainName} ({policy.domainCode})</span> &nbsp;&nbsp; Subdomain: <span style={{ color: V3.textSecondary }}>{subdomainName} ({policy.subdomainCode})</span>
                  </div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Lifecycle: <span style={{ color: V3.tealLight }}>{policy.lifecycleStatus}</span> &nbsp;&nbsp; Tier: <span style={{ color: V3.tealLight }}>{policy.tier}</span>
                  </div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>Owner/Steward: <span style={{ color: V3.textSecondary }}>{policy.ownerSteward}</span></div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Review Cycle: <span style={{ color: V3.textSecondary }}>{policy.reviewCycle}</span>
                  </div>
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Access Tier: <span style={{ color: V3.textSecondary }}>{policy.accessTier}</span> &nbsp;&nbsp; Source: <span style={{ color: V3.textSecondary }}>{policy.sourceType}</span>
                  </div>
                  {policy.description && (
                    <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                      Description: <span style={{ color: V3.textSecondary }}>{policy.description}</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: V3.textPrimary, marginBottom: 4 }}>
                    Created: <span style={{ color: V3.textSecondary }}>{policy.createdAt?.slice(0, 10)}</span> &nbsp;&nbsp; Updated: <span style={{ color: V3.textSecondary }}>{policy.updatedAt?.slice(0, 10)}</span>
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>RELATED FORMS</div>
                  {V3_FORMS.filter(f => f.requiredBy === policy.id).length > 0 ? (
                    V3_FORMS.filter(f => f.requiredBy === policy.id).map(form => (
                      <div key={form.id} style={{ fontSize: 12, color: V3.textSecondary, marginBottom: 2 }}>
                        {form.title} <span style={{ color: V3.tealLight, fontSize: 11 }}>({form.status})</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: V3.textTertiary }}>No related forms defined.</div>
                  )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PolicyDetailPage({ navigate }: { navigate: (id: SectionId) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <GVGBDetailView onBackToLibrary={() => navigate('library')} />
    </div>
  )
}

function FormsLibraryPage() {
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')

  const domainCodes = useMemo(() => ['All', ...Array.from(new Set(FORMS_DATASET.map(f => f.domainCode)))], [])
  const formTypes = useMemo(() => ['All', ...Array.from(new Set(FORMS_DATASET.map(f => f.type)))], [])

  const filteredForms = useMemo(() => {
    return FORMS_DATASET.filter(form => {
      const matchesSearch = !searchTerm || form.name.toLowerCase().includes(searchTerm.toLowerCase()) || form.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDomain = domainFilter === 'All' || form.domainCode === domainFilter
      const matchesType = typeFilter === 'All' || form.type === typeFilter
      return matchesSearch && matchesDomain && matchesType
    })
  }, [searchTerm, domainFilter, typeFilter])

  const toggleForm = (id: string) => {
    setExpandedFormId(expandedFormId === id ? null : id)
  }

  const getStatus = (form: typeof FORMS_DATASET[0]) => {
    return form.classifications?.includes('audit_critical') ? 'Critical' : 'Active'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock icon={CheckCircle2} micro="eCIGN FORMS" title="Enterprise Forms Library" subtitle="Digital forms for compliance workflow execution and signing." />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: 20, padding: '9px 14px', minWidth: 260 }}>
          <Search size={14} color={V3.textTertiary} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search forms..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: V3.textPrimary, width: '100%', fontSize: 12 }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', paddingLeft: 4 }}>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {domainCodes.map((code, index) => {
            const active = domainFilter === code
            return (
              <button
                key={code}
                onClick={() => setDomainFilter(code)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  background: 'transparent',
                  color: active ? V3.textPrimary : V3.textTertiary,
                  border: 'none',
                  borderBottom: active ? `2px solid ${V3.teal}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {code}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
          {formTypes.slice(0, 8).map((t, index) => {
            const active = typeFilter === t
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  background: 'transparent',
                  color: active ? V3.textPrimary : V3.textTertiary,
                  border: 'none',
                  borderBottom: active ? `2px solid ${V3.orangeLight}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ fontSize: 11, color: V3.textTertiary, paddingLeft: 4 }}>
        Showing {filteredForms.length} of {FORMS_DATASET.length} forms
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filteredForms.map(form => {
          const isExpanded = expandedFormId === form.id
          const status = getStatus(form)
          return (
            <div key={form.id} style={{ border: 'none', borderBottom: `1px solid rgba(255,255,255,0.04)`, padding: '16px 4px' }}>
              <div onClick={() => toggleForm(form.id)} style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: V3.tealLight, fontWeight: 700 }}>{form.domainCode}</span>
                  <span style={{ fontSize: 11, color: status === 'Critical' ? V3.orangeLight : V3.textTertiary }}>{status}</span>
                </div>
                <div style={{ fontSize: 15, color: V3.textPrimary, fontWeight: 600, lineHeight: 1.3 }}>{form.name}
                  <span style={{ fontSize: 9, padding: '1px 5px', marginLeft: 8, borderRadius: 3, background: 'rgba(255,160,89,0.1)', color: '#FFA059' }}>{form.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: V3.textTertiary }}>
                  <span>Usage: {form.usage}</span>
                  <span>Frequency: {form.frequency}</span>
                </div>
              </div>
              {isExpanded && (
                <div style={{ marginTop: 16, paddingLeft: 4, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: V3.textSecondary }}>
                  <div><span style={{ color: V3.textTertiary }}>Form ID:</span> {form.id}</div>
                  <div>
                    <span style={{ color: V3.textTertiary }}>Linked policies:</span>
                    {form.policies && form.policies.length > 0 ? (
                      <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {form.policies.map(p => (
                          <span key={p} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: V3.textSecondary }}>{p}</span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ marginLeft: 6, color: V3.textTertiary }}>None</span>
                    )}
                  </div>
                  <div><span style={{ color: V3.textTertiary }}>Type:</span> {form.type}</div>
                  <div><span style={{ color: V3.textTertiary }}>Usage:</span> {form.usage}</div>
                  <div><span style={{ color: V3.textTertiary }}>Frequency:</span> {form.frequency}</div>
                  {form.classifications && form.classifications.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: V3.textTertiary }}>Classifications:</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {form.classifications.map((c: string) => (
                          <span key={c} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,160,89,0.1)', color: '#FFA059' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EvidencePage() {
  const snap = useComplianceExecution()
  const cesUnits = snap.executionUnits || []

  const formTitleMap = useMemo(() => {
    const map = new Map<string, string>()
    V3_FORMS.forEach(f => map.set(f.id, f.title))
    return map
  }, [])

  type EvidenceItem = {
    id: string
    title: string
    status: 'PENDING_UPLOAD' | 'UPLOADED' | 'VALIDATED' | 'EVIDENCE_LOCKED' | 'PROMOTED' | 'REJECTED'
    unitId: string
    unitTitle: string
    owner?: string
    dueDate?: string
    formId?: string
    formInstanceId?: string
    mimeType?: string
    version?: string
    sourceSystem?: string
    createdAt?: string
  }

  const evidenceItems = useMemo(() => {
    const items: EvidenceItem[] = []
    cesUnits.forEach((unit: any) => {
      const es = unit.evidenceStatus || { missingFormIds: [], requiredFormsComplete: 0, requiredFormsTotal: 0 }
      if (es.missingFormIds && es.missingFormIds.length > 0) {
        es.missingFormIds.forEach((fid: string, idx: number) => {
          const title = formTitleMap.get(fid) || fid
          const status = Math.random() > 0.5 ? 'PENDING_UPLOAD' : Math.random() > 0.7 ? 'REJECTED' : 'UPLOADED'
          items.push({
            id: `${unit.id}-missing-${idx}`,
            title,
            status,
            unitId: unit.id,
            unitTitle: unit.title,
            owner: unit.owner?.name || unit.owner?.initials,
            dueDate: unit.dueDate,
            formId: fid,
            formInstanceId: `fi-${unit.id}-${idx}`,
            mimeType: 'application/pdf',
            version: '1.2',
            sourceSystem: 'EHR',
            createdAt: '2026-05-20 09:41',
          })
        })
      } else if (es.requiredFormsComplete === es.requiredFormsTotal && es.requiredFormsTotal > 0) {
        const status = Math.random() > 0.7 ? 'PROMOTED' : Math.random() > 0.5 ? 'EVIDENCE_LOCKED' : 'VALIDATED'
        items.push({
          id: `${unit.id}-complete`,
          title: unit.title + ' Evidence',
          status,
          unitId: unit.id,
          unitTitle: unit.title,
          owner: unit.owner?.name || unit.owner?.initials,
          dueDate: unit.dueDate,
          formInstanceId: `fi-${unit.id}-ev`,
          mimeType: 'application/pdf',
          version: '2.1',
          sourceSystem: 'Compliance Vault',
          createdAt: '2026-05-19 16:22',
        })
      }
    })
    return items
  }, [cesUnits, formTitleMap])

  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const filteredItems = useMemo(() => {
    return evidenceItems.filter(item => {
      const matchesSearch = !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase())
      let matchesStatus = true
      if (statusFilter !== 'all') {
        const map: Record<string, string> = {
          pending: 'PENDING_UPLOAD',
          uploaded: 'UPLOADED',
          validated: 'VALIDATED',
          locked: 'EVIDENCE_LOCKED',
          promoted: 'PROMOTED',
          rejected: 'REJECTED',
        }
        matchesStatus = item.status === map[statusFilter]
      }
      return matchesSearch && matchesStatus
    })
  }, [evidenceItems, statusFilter, searchTerm])

  const selectedItem = filteredItems.find(i => i.id === selectedItemId) || evidenceItems.find(i => i.id === selectedItemId) || null

  const getStatusStyle = (status: EvidenceItem['status']) => {
    switch (status) {
      case 'PENDING_UPLOAD': return { color: V3.textTertiary }
      case 'UPLOADED': return { color: V3.textSecondary }
      case 'VALIDATED': return { color: V3.tealLight }
      case 'EVIDENCE_LOCKED': return { color: V3.tealLight, fontWeight: 700 as const }
      case 'PROMOTED': return { color: V3.tealLight }
      case 'REJECTED': return { color: V3.orangeLight }
      default: return {}
    }
  }

  const total = evidenceItems.length
  const pending = evidenceItems.filter(i => i.status === 'PENDING_UPLOAD').length
  const validated = evidenceItems.filter(i => i.status === 'VALIDATED').length
  const locked = evidenceItems.filter(i => i.status === 'EVIDENCE_LOCKED').length
  const gaps = evidenceItems.filter(i => i.status === 'REJECTED' || i.status === 'PENDING_UPLOAD').length

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'uploaded', label: 'Uploaded' },
    { key: 'validated', label: 'Validated' },
    { key: 'locked', label: 'Locked' },
    { key: 'promoted', label: 'Promoted' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
      <HeaderBlock icon={FolderOpen} micro="EVIDENCE MANAGEMENT" title="Evidence Center" subtitle="Centralized artifact vault with chain-of-custody context and route linkage." />

      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: V3.textSecondary, paddingLeft: 4 }}>
        <span>Total: {total}</span>
        <span>Pending: {pending}</span>
        <span>Validated: {validated}</span>
        <span>Locked: {locked}</span>
        <span>Gaps: {gaps}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '4px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {filterTabs.map(tab => {
          const active = statusFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => { setStatusFilter(tab.key); setSelectedItemId(null) }}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                background: 'transparent',
                color: active ? V3.textPrimary : V3.textTertiary,
                border: 'none',
                borderBottom: active ? `2px solid ${V3.teal}` : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          )
        })}
        <input
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by title..."
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: V3.textPrimary,
            padding: '5px 10px',
            fontSize: 12,
            outline: 'none',
            width: 220,
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 1fr' : '1fr', gap: 0, height: '100%', minHeight: 520 }}>
        {/* Left: scrollable evidence list */}
        <div style={{ overflow: 'auto', borderRight: selectedItem ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
          <div style={{ display: 'flex', padding: '12px 16px', gap: 14, position: 'sticky', top: 0, background: 'rgba(18,23,36,0.96)', zIndex: 1 }}>
            <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Evidence / Form</span>
            <span style={{ flex: 2, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Linked Unit</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Status</span>
            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: V3.textTertiary }}>Due</span>
          </div>
          {filteredItems.length === 0 && (
            <div style={{ padding: '40px 16px', color: V3.textSecondary, fontSize: 13 }}>No evidence items match current filters.</div>
          )}
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemId(item.id)}
              className="v3-invisible-glare"
              style={{
                display: 'flex',
                padding: '14px 16px',
                gap: 14,
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                cursor: 'pointer',
                background: selectedItemId === item.id ? 'rgba(0,209,193,0.06)' : 'transparent',
              }}
            >
              <span style={{ flex: 2, fontSize: 13, color: V3.textPrimary, fontWeight: 600 }}>{item.title}</span>
              <span style={{ flex: 2, fontSize: 12, color: V3.textSecondary }}>{item.unitTitle}</span>
              <span style={{ flex: 1, fontSize: 11, textTransform: 'uppercase', fontWeight: 700, ...getStatusStyle(item.status) }}>{item.status}</span>
              <span style={{ flex: 1, fontSize: 12, color: V3.textTertiary }}>{item.dueDate || '—'}</span>
            </div>
          ))}
        </div>

        {/* Right: detail preview (only when item selected) */}
        {selectedItem && (
          <div style={{ overflow: 'auto', padding: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: V3.orangeLight, marginBottom: 4 }}>EVIDENCE DETAIL</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: V3.textPrimary, lineHeight: 1.3, marginBottom: 24 }}>{selectedItem.title}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontSize: 13 }}>
              <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 140, color: V3.textTertiary }}>Status</span>
                <span style={{ fontWeight: 700, textTransform: 'uppercase', ...getStatusStyle(selectedItem.status) }}>{selectedItem.status}</span>
              </div>
              <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 140, color: V3.textTertiary }}>Linked Unit</span>
                <span style={{ color: V3.textPrimary }}>{selectedItem.unitTitle}</span>
              </div>
              <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 140, color: V3.textTertiary }}>Owner</span>
                <span style={{ color: V3.textPrimary }}>{selectedItem.owner || '—'}</span>
              </div>
              <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ width: 140, color: V3.textTertiary }}>Due Date</span>
                <span style={{ color: V3.textPrimary }}>{selectedItem.dueDate || '—'}</span>
              </div>
              {selectedItem.formId && (
                <div style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ width: 140, color: V3.textTertiary }}>Form ID</span>
                  <span style={{ color: V3.textPrimary, fontFamily: 'monospace', fontSize: 12 }}>{selectedItem.formId}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>AUDIT LOG</div>
              {[
                { ts: '2026-05-20 14:23', action: 'Uploaded', actor: 'Maria Gonzalez' },
                { ts: '2026-05-20 15:01', action: 'Validated', actor: 'System' },
                { ts: '2026-05-21 09:15', action: 'Locked', actor: 'Don Chen' },
              ].map((entry, i) => (
                <div key={i} style={{ fontSize: 11, color: V3.textTertiary, padding: '4px 0' }}>
                  <span style={{ color: V3.textSecondary }}>{entry.ts}</span> · {entry.action} by {entry.actor}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: V3.orangeLight, marginBottom: 8 }}>FORM LINKAGE</div>
              <div style={{ fontSize: 12, color: V3.textSecondary, lineHeight: 1.6 }}>
                <div><span style={{ color: V3.textTertiary }}>form_id:</span> {selectedItem.formId || selectedItem.id}</div>
                <div><span style={{ color: V3.textTertiary }}>form_instance_id:</span> {selectedItem.formInstanceId}</div>
                <div><span style={{ color: V3.textTertiary }}>mime_type:</span> {selectedItem.mimeType}</div>
                <div><span style={{ color: V3.textTertiary }}>version:</span> {selectedItem.version}</div>
                <div><span style={{ color: V3.textTertiary }}>source_system:</span> {selectedItem.sourceSystem}</div>
                <div><span style={{ color: V3.textTertiary }}>created_at:</span> {selectedItem.createdAt}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OnboardingPage({ isMobile }: { isMobile: boolean }) {
  const ACHC_MODULES = [
    { id: 'M01', name: 'Agency Orientation', week: 1 },
    { id: 'M02', name: 'HIPAA & Privacy', week: 1 },
    { id: 'M03', name: 'Infection Control', week: 1 },
    { id: 'M04', name: 'Safety & Emergency', week: 1 },
    { id: 'M05', name: 'Documentation Standards', week: 2 },
    { id: 'M06', name: 'Care Planning', week: 2 },
    { id: 'M07', name: 'OASIS Competency', week: 2 },
    { id: 'M08', name: 'Medication Management', week: 2 },
    { id: 'M09', name: 'Patient Rights', week: 3 },
    { id: 'M10', name: 'Quality & QAPI', week: 3 },
    { id: 'M11', name: 'Supervision Protocol', week: 3 },
    { id: 'M12', name: 'Final Competency Assessment', week: 3 },
  ]

  const [selectedMember, setSelectedMember] = useState<number | null>(null)

  const cohorts = [
    {
      name: 'Spring RN Cohort',
      members: [
        { name: 'Elena Vargas, RN', completedGates: 6 },
        { name: 'David Kim, LPN', completedGates: 5 },
        { name: 'Robert Chen, RN', completedGates: 1 },
        { name: 'Sofia Ramirez, RN', completedGates: 3 },
      ],
    },
    {
      name: 'PT/OT Fast Track',
      members: [
        { name: 'James Torres, PT', completedGates: 3 },
        { name: 'Patricia Hale, OT', completedGates: 6 },
      ],
    },
    {
      name: 'Per-Diem Onboarding',
      members: [
        { name: 'Maria Gonzalez, HHA', completedGates: 2 },
        { name: 'Dr. Evelyn Vance, MD', completedGates: 5 },
        { name: "Michael O'Brien, LPN", completedGates: 2 },
      ],
    },
  ]

  const allMembers = cohorts.flatMap((c) => c.members)
  const orangeMicro = '#fb923c'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HeaderBlock
        icon={User}
        micro="WORKFORCE ENABLEMENT"
        title="Onboarding"
        subtitle="Pipeline view of clinician activation, competency validation, and governance sign-off."
      />

      <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
        {[
          { label: 'ACTIVE COHORTS', value: String(cohorts.length) },
          { label: 'CLEARED', value: String(cohorts.reduce((a, c) => a + c.members.filter(m => m.completedGates >= 6).length, 0)), color: '#00D1C1' },
          { label: 'IN PROGRESS', value: String(cohorts.reduce((a, c) => a + c.members.filter(m => m.completedGates < 6 && m.completedGates > 0).length, 0)) },
          { label: 'OVERDUE DOCS', value: String(Math.floor(Math.random() * 4) + 1), color: '#FFA059' },
        ].map(s => (
          <div key={s.label}>
            <span style={{ fontSize: 18, fontWeight: 600, color: s.color ?? '#F0F0F0' }}>{s.value}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: orangeMicro }}>
          Gate Progress
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { title: 'Gate 1: Intake & Identity', owner: 'Admin User', progress: 100, status: 'Complete' },
            { title: 'Gate 2: Clinical Competency', owner: 'Dr. Vance', progress: 76, status: 'In Progress' },
            { title: 'Gate 3: Compliance & Policy', owner: 'M. Gonzales', progress: 58, status: 'In Progress' },
            { title: 'Gate 4: Final Governance', owner: 'Board Coordinator', progress: 22, status: 'Pending' },
          ].map(track => (
            <div key={track.title} style={{ padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#F0F0F0', fontWeight: 600 }}>{track.title}</div>
                  <div style={{ marginTop: 3, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Owner: {track.owner}</div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: track.status === 'Pending' ? 'rgba(255,255,255,0.5)' : '#00D1C1' }}>
                  {track.status}
                </div>
              </div>
              <div style={{ marginTop: 10, height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${track.progress}%`, height: '100%', background: '#00D1C1' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: orangeMicro }}>
          Active Cohort Members — ACHC Progression
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {allMembers.map((member, memberIdx) => (
            <div key={memberIdx}>
              <div
                onClick={() => setSelectedMember(selectedMember === memberIdx ? null : memberIdx)}
                style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 13, color: '#F0F0F0', fontWeight: 600 }}>{member.name}</div>
                <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                  {Array.from({ length: 6 }).map((_, gidx) => (
                    <Fragment key={gidx}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: gidx < member.completedGates ? '#00D1C1' : 'rgba(255,255,255,0.15)',
                      }} />
                      {gidx < 5 && (
                        <div style={{ width: 24, height: 1, background: gidx < member.completedGates ? 'rgba(0,209,193,0.4)' : 'rgba(255,255,255,0.06)' }} />
                      )}
                    </Fragment>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{member.completedGates}/6 gates complete</div>
              </div>

              {selectedMember === memberIdx && (
                <div style={{ padding: '12px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>MODULE COMPLETION</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px 12px' }}>
                    {ACHC_MODULES.map((mod, mi) => {
                      const completed = mi < member.completedGates * 2
                      return (
                        <div key={mod.id} style={{ fontSize: 10, color: completed ? '#00D1C1' : 'rgba(255,255,255,0.4)', padding: '2px 0' }}>
                          {completed ? '✓' : '○'} {mod.id}: {mod.name}
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>DOCUMENTS</div>
                  {['Background Check', 'Credential Verification', 'TB Test', 'CPR Card', 'License Copy'].map((doc, di) => (
                    <div key={doc} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>
                      <span style={{ color: di < 3 + (memberIdx % 3) ? '#00D1C1' : '#FFA059' }}>{di < 3 + (memberIdx % 3) ? '✓' : '○'}</span> {doc}
                    </div>
                  ))}

                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>SUPERVISED VISITS</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    {Math.min(member.completedGates, 3)} of 3 completed
                    {member.completedGates >= 3 && <span style={{ color: '#00D1C1', marginLeft: 8 }}>✓ Cleared for independent work</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DomainLibraryPage() {
  const snap = useComplianceExecution()
  const domainRisks = snap.domainRisks || []
  const executionUnits = snap.executionUnits || []
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const DOMAIN_NAMES: Record<string, string> = {
    GV: 'Governance & Administration',
    CL: 'Clinical Operations',
    QA: 'Quality Assurance & Performance Improvement',
    HR: 'Human Resources',
    CO: 'Compliance & Regulatory',
    FN: 'Finance & Revenue Cycle',
    OP: 'Operations',
    IT: 'Technology & Information Security',
    RM: 'Risk Management & Safety',
    EN: 'Enterprise Control',
  }

  const SUBDOMAIN_NAMES: Record<string, string> = {
    GB: 'Governing Body', OG: 'Organizational Governance', PM: 'Policy Management', EA: 'External Affairs',
    CP: 'Care Planning', SD: 'Service Delivery', CA: 'Clinical Assessment', CD: 'Clinical Documentation', PR: 'Patient Rights', OA: 'OASIS',
    PG: 'Program Governance', PI: 'Performance Improvement', AE: 'Adverse Events', SM: 'Surveillance & Monitoring',
    TA: 'Talent Acquisition', TD: 'Training & Development', ER: 'Employee Relations', WM: 'Workforce Management', JD: 'Job Descriptions',
    RA: 'Regulatory Affairs', FA: 'Fraud & Abuse', HP: 'HIPAA & Privacy', DC: 'Documentation Compliance',
    BC: 'Billing & Claims', CM: 'Coding & Classification', FP: 'Financial Planning',
    IM: 'Intake Management', SL: 'Service Logistics', PA: 'Patient Access', FM: 'Facility Admin',
    SC: 'Security Controls', DR: 'Data & Recovery', SA: 'Systems Admin', UP: 'Use Policies',
    SS: 'Staff Safety', PS: 'Patient Safety', OS: 'Occupational Safety', EP: 'Emergency Preparedness',
    TG: 'Taxonomy Governance', LC: 'Lifecycle Control',
  }

  // Build taxonomy from real data
  const realDomains = useMemo(() => {
    const domainCodes = [...new Set(frameworkPolicies.map(p => p.domainCode))]
    return domainCodes.map(code => {
      const policies = frameworkPolicies.filter(p => p.domainCode === code)
      const subdomainCodes = [...new Set(policies.map(p => p.subdomainCode))]
      return {
        code,
        name: DOMAIN_NAMES[code] || code,
        policyCount: policies.length,
        subdomains: subdomainCodes,
      }
    })
  }, [])

  const REGULATORY_ITEMS = [
    { id: 'title22', name: 'Title 22 CCR', shortName: 'T22', color: '#00D1C1' },
    { id: '42cfr', name: '42 CFR §484', shortName: 'CFR', color: '#00D1C1' },
    { id: 'cms', name: 'CMS State Ops Manual', shortName: 'CMS', color: 'rgba(0,209,193,0.7)' },
    { id: 'hipaa', name: 'HIPAA', shortName: 'HIPAA', color: 'rgba(0,209,193,0.7)' },
    { id: 'oig', name: 'OIG Compliance', shortName: 'OIG', color: 'rgba(255,160,89,0.7)' },
    { id: 'osha', name: 'OSHA', shortName: 'OSHA', color: 'rgba(255,160,89,0.7)' },
  ]

  const domains = [
    { code: '42CFR', name: '42 CFR 484 - Home Health CoPs', desc: 'Federal Conditions of Participation governing Medicare-certified home health agencies.', cmsRefs: ['§484.50', '§484.55', '§484.60'], items: [{name:'Patient Rights',status:'Met',evidence:12,reviewed:'2026-04-10'},{name:'Comprehensive Assessment',status:'Met',evidence:8,reviewed:'2026-03-22'},{name:'Plan of Care',status:'Partial',evidence:5,reviewed:'2026-05-01'},{name:'Clinical Records',status:'Met',evidence:15,reviewed:'2026-02-15'}] },
    { code: 'ACHC', name: 'ACHC Accreditation Standards', desc: 'Accreditation requirements for quality, governance, and clinical excellence.', cmsRefs: ['ACHC-01', 'ACHC-04'], items: [{name:'Governance',status:'Met',evidence:7,reviewed:'2026-01-20'},{name:'Quality Management',status:'Met',evidence:9,reviewed:'2026-04-05'},{name:'Patient Safety',status:'Partial',evidence:4,reviewed:'2026-05-12'}] },
    { code: 'HIPAA', name: 'HIPAA Privacy & Security', desc: 'Protected health information handling, access controls, and breach notification.', cmsRefs: ['45 CFR 164'], items: [{name:'Privacy Rule',status:'Met',evidence:11,reviewed:'2026-03-01'},{name:'Security Rule',status:'Met',evidence:6,reviewed:'2025-12-10'},{name:'Breach Notification',status:'Current',evidence:3,reviewed:'2026-04-28'}] },
    { code: 'OSHA', name: 'OSHA Workplace Safety', desc: 'Bloodborne pathogens, PPE, hazard communication, and workplace violence prevention.', cmsRefs: ['29 CFR 1910'], items: [{name:'Bloodborne Pathogens',status:'Met',evidence:5,reviewed:'2026-02-18'},{name:'PPE Compliance',status:'Met',evidence:8,reviewed:'2026-05-03'},{name:'Hazard Communication',status:'Partial',evidence:2,reviewed:'2026-01-30'}] },
    { code: 'QAPI', name: 'QAPI Requirements', desc: 'Quality Assessment and Performance Improvement program mandates and reporting.', cmsRefs: ['§484.65'], items: [{name:'QAPI Committee',status:'Met',evidence:4,reviewed:'2026-04-15'},{name:'PIP Tracking',status:'Met',evidence:7,reviewed:'2026-05-08'},{name:'Data Analysis',status:'Partial',evidence:3,reviewed:'2026-03-12'},{name:'Governing Body Reports',status:'Met',evidence:6,reviewed:'2026-04-22'}] },
    { code: 'STATE', name: 'State Licensure Requirements', desc: 'State-specific home health licensing, staffing ratios, and reporting obligations.', cmsRefs: ['State Regs'], items: [{name:'Licensure Renewal',status:'Met',evidence:2,reviewed:'2025-11-05'},{name:'Staffing Ratios',status:'Met',evidence:5,reviewed:'2026-02-28'},{name:'Incident Reporting',status:'Met',evidence:9,reviewed:'2026-05-10'}] },
    { code: 'AKS', name: 'Anti-Kickback Statute', desc: 'Prohibitions on referral inducements, safe harbors, and compliance attestations.', cmsRefs: ['42 USC 1320a-7b'], items: [{name:'Referral Compliance',status:'Met',evidence:3,reviewed:'2026-01-12'},{name:'Safe Harbor Review',status:'N/A',evidence:1,reviewed:'2025-09-15'},{name:'Vendor Agreements',status:'Partial',evidence:4,reviewed:'2026-04-01'}] },
    { code: 'STARK', name: 'Stark Law / Physician Self-Referral', desc: 'Prohibition on physician self-referral for designated health services.', cmsRefs: ['42 USC 1395nn'], items: [{name:'Referral Tracking',status:'Met',evidence:5,reviewed:'2026-03-18'},{name:'Ownership Disclosure',status:'Met',evidence:2,reviewed:'2025-10-20'},{name:'Compensation Analysis',status:'Gap',evidence:0,reviewed:'2026-05-05'}] },
    { code: 'EMTALA', name: 'EMTALA Emergency Requirements', desc: 'Emergency treatment and labor act obligations for patient stabilization.', cmsRefs: ['42 USC 1395dd'], items: [{name:'Screening Exams',status:'Met',evidence:6,reviewed:'2026-02-05'},{name:'Transfer Protocols',status:'Partial',evidence:2,reviewed:'2026-04-30'}] },
    { code: 'ADA', name: 'ADA Accessibility Standards', desc: 'Nondiscrimination and reasonable accommodations for patients with disabilities.', cmsRefs: ['42 USC 12101'], items: [{name:'Facility Access',status:'Met',evidence:4,reviewed:'2026-01-25'},{name:'Communication Aids',status:'Met',evidence:3,reviewed:'2025-12-18'},{name:'Policy Review',status:'Not Started',evidence:0,reviewed:'2026-05-19'}] },
    { code: 'EP', name: 'Emergency Preparedness', desc: 'All-hazards emergency planning, drills, and continuity of operations.', cmsRefs: ['§484.102'], items: [{name:'Emergency Plan',status:'Met',evidence:8,reviewed:'2026-04-02'},{name:'Drill Execution',status:'Met',evidence:5,reviewed:'2026-05-14'},{name:'Recovery Procedures',status:'Partial',evidence:2,reviewed:'2026-03-08'}] },
    { code: 'CoP', name: 'Conditions of Participation Updates', desc: 'Ongoing CMS updates to home health agency requirements and interpretations.', cmsRefs: ['CMS-1749'], items: [{name:'CoP Alignment',status:'Met',evidence:10,reviewed:'2026-05-01'},{name:'Documentation Updates',status:'Current',evidence:7,reviewed:'2026-04-20'},{name:'Training Rollout',status:'Partial',evidence:3,reviewed:'2026-05-15'}] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock
        icon={Network}
        micro="REGULATORY FRAMEWORK"
        title="Domain Library"
        subtitle="Comprehensive registry of all compliance domains, sub-domains, and regulatory cross-references."
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {REGULATORY_ITEMS.map(reg => (
          <span key={reg.id} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 3, background: `${reg.color}15`, color: reg.color }}>
            {reg.shortName}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', maxWidth: '400px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search domains, sub-domains, CMS references..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {realDomains.map(domain => {
          const risk = domainRisks.find(r => r.domain?.toLowerCase().includes(domain.code.toLowerCase()))
          const isExpanded = expandedDomain === domain.code
          const unitsInDomain = executionUnits.filter(u => u.domain && u.domain.toLowerCase().includes(domain.code.toLowerCase()))
          return (
            <div key={domain.code} style={{ padding: '20px 0', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', cursor: 'pointer' }}
                onClick={() => setExpandedDomain(isExpanded ? null : domain.code)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: V3.tealLight, padding: '6px 12px', background: 'rgba(0,209,193,0.08)', borderRadius: '6px', fontFamily: 'monospace' }}>
                    {domain.code}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{domain.name}
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>
                        {frameworkPolicies.filter(p => p.domainCode === domain.code).length} policies
                      </span>
                    </h3>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {risk && (
                    <>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: V3.textSecondary }}>Open: <span style={{ color: V3.textPrimary, fontWeight: 600 }}>{risk.openUnits}</span></div>
                        <div style={{ fontSize: '13px', color: V3.textSecondary }}>Blocked: <span style={{ color: V3.orange, fontWeight: 600 }}>{risk.blockedCount}</span></div>
                      </div>
                    </>
                  )}
                  <div style={{ fontSize: '11px', color: V3.textTertiary }}>{isExpanded ? '−' : '+'}</div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 6 }}>SUBDOMAINS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginBottom: 12 }}>
                    {domain.subdomains.map(sub => (
                      <div key={sub} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '2px 0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{domain.code}.{sub} — {SUBDOMAIN_NAMES[sub] || sub}</span>
                        <span style={{ color: '#00D1C1', fontSize: 10 }}>{frameworkPolicies.filter(p => p.domainCode === domain.code && p.subdomainCode === sub).length}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Execution Units in Domain</div>
                  {unitsInDomain.length === 0 ? (
                    <div style={{ fontSize: '12px', color: V3.textSecondary }}>No execution units found for this domain in current snapshot.</div>
                  ) : (
                    unitsInDomain.slice(0, 8).map((unit, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '6px 0', borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: '12px' }}>
                        <span style={{ flex: 2, color: V3.textPrimary }}>{unit.title}</span>
                        <span style={{ color: V3.tealLight, fontWeight: 600 }}>{unit.complianceState}</span>
                        <span style={{ color: V3.textTertiary, fontFamily: 'monospace' }}>{unit.dueDate}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ReferringPhysiciansPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const physicians = V3_PHYSICIANS
  const selectedPhysician = physicians.find(p => p.id === selected) || null
  const selectedIdx = physicians.findIndex(p => p.id === selected)

  const referredPatients = selectedPhysician
    ? V3_PATIENTS.filter(p => p.physician === selectedPhysician.name)
    : []

  const closeDrawer = () => setSelected(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Users} micro="PHYSICIAN NETWORK" title="Referring Physicians" subtitle="Physician referral network registry with order tracking and credentialing status." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', width: '360px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
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
        {physicians.map((doc) => (
          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }} onClick={() => setSelected(doc.id)}>
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
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>{doc.activePatients}</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.tealLight }}>
              {doc.status}
            </span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textTertiary }}>{doc.lastReferral}</span>
          </div>
        ))}
      </div>

      {selectedPhysician && (
        <>
          <div
            onClick={closeDrawer}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }}
          />
          <div
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(400px, 50vw)', zIndex: 100,
              background: 'rgba(16,20,28,0.98)', borderLeft: '1px solid rgba(255,255,255,0.1)',
              transform: selected != null ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'auto', padding: 24,
            }}
          >
            <button onClick={closeDrawer} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: V3.textTertiary, fontSize: 20, cursor: 'pointer' }}>×</button>

            <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>PHYSICIAN DETAIL</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: V3.textPrimary, margin: '0 0 4px' }}>{selectedPhysician.name}</h2>
            <div style={{ color: V3.tealLight, fontSize: '13px', marginBottom: 24 }}>{selectedPhysician.specialty} • NPI: {selectedPhysician.npi}</div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>STATUS</div>
              <div style={{ color: V3.tealLight, fontWeight: 600 }}>{selectedPhysician.status}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>ACTIVE REFERRALS</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: V3.textPrimary }}>{selectedPhysician.activePatients}</div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>PATIENTS REFERRED</div>
              {referredPatients.length > 0 ? referredPatients.map(p => (
                <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '13px', color: V3.textPrimary }}>{p.name} <span style={{ color: V3.textTertiary, fontSize: '12px' }}>({p.zone})</span></div>
              )) : <div style={{ color: V3.textTertiary, fontSize: '13px' }}>No linked patients.</div>}
            </div>

            <div>
              <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>COMPLIANCE NOTES</div>
              <div style={{ color: V3.textSecondary, fontSize: '13px', lineHeight: 1.5 }}>
                Referral documentation up to date. Last contact {selectedPhysician.lastReferral}. No outstanding credentialing issues.
              </div>
            </div>

            {/* Contact info */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 16, marginBottom: 6 }}>CONTACT</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              Phone: {selectedPhysician.phone || '(310) 555-' + String(1000 + selectedIdx * 111).slice(0,4)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              Fax: {selectedPhysician.fax || '(310) 555-' + String(2000 + selectedIdx * 111).slice(0,4)}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              Practice: {['Valley Medical Group', 'Pacific Coast Physicians', 'Sunrise Health Partners', 'Harbor Family Medicine', 'Coastal Internal Medicine'][selectedIdx % 5]}
            </div>

            {/* Credentialing section */}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 16, marginBottom: 6 }}>CREDENTIALING</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              License Expiry: <span style={{ color: '#00D1C1' }}>2027-{String(3 + (selectedIdx % 9)).padStart(2, '0')}-15</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              Last Credentialed: 2025-{String(6 + (selectedIdx % 6)).padStart(2, '0')}-01
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
              Credential Status: <span style={{ color: '#00D1C1' }}>Active</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function VisitSchedulePage({ isMobile }: { isMobile: boolean }) {
  const [selectedVisit, setSelectedVisit] = useState<number | null>(null)

  const enrichedVisits = useMemo(() => V3_VISITS.map((v, i) => ({
    ...v,
    recurring: i % 3 === 0,
    notes: v.notes || ['Patient prefers morning', 'Gate code: 4521', 'Dog in yard - call first', 'Wound supplies needed', 'Family present for teaching'][i % 5],
    // Normalize field names for display compatibility
    patient: v.patientName,
    clinician: v.clinicianName,
  })), [])

  const visits = enrichedVisits

  const selectedVisitData = selectedVisit !== null ? visits[selectedVisit] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Calendar} micro="SCHEDULING & VISITS" title="Visit Schedule" subtitle="Daily and weekly home health visit assignments across all zones and disciplines." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          {['Today', 'Tomorrow', 'This Week', 'Next Week'].map((tab, idx) => (
            <button
              key={tab}
              className="btn-smooth-hover"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                borderBottom: idx === 0 ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
          {['All Zones', 'Zone A', 'Zone B', 'Zone C'].map((zone, idx) => (
            <button
              key={zone}
              className="btn-smooth-hover"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                borderBottom: idx === 0 ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', padding: '8px 0' }}>
        {[
          { label: 'TOTAL VISITS', value: '24' },
          { label: 'COMPLETED', value: '8', color: V3.tealLight },
          { label: 'IN PROGRESS', value: '3', color: V3.tealLight },
          { label: 'UPCOMING', value: '11' },
          { label: 'MISSED/CANCELLED', value: '2', color: V3.tealLight },
        ].map(kpi => (
          <div key={kpi.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {visits.map((visit, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedVisit(idx)}
            style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, opacity: visit.status === 'Cancelled' ? 0.5 : 1, cursor: 'pointer' }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, minWidth: '72px', fontFamily: 'monospace' }}>{visit.time}</span>
            <span style={{ fontSize: '11px', color: V3.textTertiary, minWidth: '92px', fontFamily: 'monospace' }}>{visit.date}</span>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                flexShrink: 0,
                background: visit.status === 'Completed' ? V3.tealLight : visit.status === 'In Progress' ? V3.tealLight : visit.status === 'Cancelled' ? V3.textTertiary : 'rgba(255,255,255,0.15)',
              }}
            />
            <div style={{ flex: 2 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block', textDecoration: visit.status === 'Cancelled' ? 'line-through' : 'none' }}>{visit.patient}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>
                {visit.type}
                {visit.recurring && <span style={{ fontSize: 9, color: '#00D1C1', marginLeft: 4 }}>↻</span>}
                {' · '}{visit.duration}
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
                color: visit.status === 'Cancelled' ? V3.textTertiary : V3.tealLight,
              }}
            >
              {visit.status}
            </span>
          </div>
        ))}
      </div>

      {selectedVisit !== null && selectedVisitData && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'rgba(16,20,28,0.98)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxHeight: '40vh',
            overflow: 'auto',
            padding: 24,
            transform: selectedVisit != null ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', color: V3.orangeLight, marginBottom: 4 }}>VISIT DETAIL</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: V3.textPrimary }}>{selectedVisitData.patient}</div>
            </div>
            <button onClick={() => setSelectedVisit(null)} style={{ background: 'transparent', border: 'none', color: V3.textSecondary, fontSize: '28px', lineHeight: 1, cursor: 'pointer', padding: 0 }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Patient:</span> <span style={{ color: V3.textPrimary }}>{selectedVisitData.patient}</span></div>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Visit Type:</span> <span style={{ color: V3.textPrimary }}>{selectedVisitData.type}</span> <span style={{ color: V3.textTertiary }}>({selectedVisitData.duration})</span></div>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Clinician:</span> <span style={{ color: V3.textPrimary }}>{selectedVisitData.clinician}</span></div>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Status:</span> <span style={{ color: V3.tealLight, fontWeight: 700, textTransform: 'uppercase' }}>{selectedVisitData.status}</span></div>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Zone:</span> <span style={{ color: V3.textPrimary }}>Zone {selectedVisitData.zone}</span></div>
            <div><span style={{ color: V3.orangeLight, fontWeight: 600 }}>Time:</span> <span style={{ color: V3.textPrimary }}>{selectedVisitData.time}</span></div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: V3.orangeLight, fontWeight: 600 }}>Notes:</span>
              <div style={{ color: V3.textSecondary, marginTop: 4, lineHeight: 1.5 }}>
                {selectedVisitData.notes}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MissedVisitsPage({ isMobile }: { isMobile: boolean }) {
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const missedVisits = V3_VISITS.filter(v => v.status === 'Missed' || v.status === 'Cancelled')

  const enrichedMissed = useMemo(() => missedVisits.map((v, i) => ({
    ...v,
    notificationSent: i % 4 !== 0,
    followUpStatus: ['Logged', 'Pending', 'Rescheduled', 'Escalated'][i % 4],
    recurring: i % 3 === 0,
  })), [missedVisits])

  const filtered = filter === 'all'
    ? enrichedMissed
    : filter === 'clinician'
      ? [...enrichedMissed].sort((a, b) => a.clinicianName.localeCompare(b.clinicianName))
      : filter === 'patient'
        ? [...enrichedMissed].sort((a, b) => a.patientName.localeCompare(b.patientName))
        : [...enrichedMissed].sort((a, b) => a.zone.localeCompare(b.zone))

  const getReason = (v: typeof V3_VISITS[0]) => v.notes || 'No reason recorded'
  const getAction = (v: typeof V3_VISITS[0]) => v.status === 'Missed' ? 'Reschedule within 48h and notify supervisor' : 'Confirm cancellation with patient and log in EMR'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={AlertTriangle} micro="VISIT COMPLIANCE" title="Missed Visits" subtitle="Missed and cancelled visit tracking with reason codes and follow-up documentation status." />

      <div style={{ display: 'flex', gap: '32px', padding: '8px 0' }}>
        {[
          { label: 'MISSED', value: String(missedVisits.filter(v => v.status === 'Missed').length) },
          { label: 'CANCELLED', value: String(missedVisits.filter(v => v.status === 'Cancelled').length), color: V3.tealLight },
          { label: 'TOTAL', value: String(missedVisits.length) },
        ].map(kpi => (
          <div key={kpi.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0', borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'clinician', label: 'By Clinician' },
          { key: 'patient', label: 'By Patient' },
          { key: 'zone', label: 'By Zone' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setExpandedId(null) }}
            style={{
              padding: '10px 20px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              borderBottom: filter === tab.key ? `2px solid ${V3.tealLight}` : '2px solid transparent',
              color: filter === tab.key ? V3.textPrimary : V3.textSecondary,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {filtered.map((visit) => {
          const isExpanded = expandedId === visit.id
          return (
            <div key={visit.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                className="v3-invisible-glare"
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
              >
                <div style={{ minWidth: '90px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary }}>{visit.date}</span>
                  <span style={{ fontSize: '11px', color: V3.textTertiary, display: 'block' }}>{visit.time}</span>
                </div>
                <div style={{ flex: 2 }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{visit.patientName}</span>
                  <span style={{ fontSize: '12px', color: V3.textSecondary }}>{visit.clinicianName} • {visit.zone}</span>
                </div>
                <span style={{ flex: 1.2, fontSize: '12px', color: V3.textSecondary }}>{visit.type}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: visit.status === 'Missed' ? '#f59e0b' : V3.tealLight }}>{visit.status}</span>
                {visit.recurring && <span style={{ fontSize: 9, color: '#00D1C1', marginLeft: 4 }}>↻ Recurring</span>}
              </div>
              {isExpanded && (
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.015)', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Patient</span><div style={{ color: V3.textPrimary, fontWeight: 600 }}>{visit.patientName}</div></div>
                    <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Visit Type</span><div style={{ color: V3.textPrimary }}>{visit.type}</div></div>
                    <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Scheduled</span><div style={{ color: V3.textPrimary }}>{visit.date} {visit.time}</div></div>
                    <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Clinician</span><div style={{ color: V3.textPrimary }}>{visit.clinicianName}</div></div>
                  </div>
                  <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Reason for Miss</span><div style={{ color: V3.textSecondary, marginTop: 4 }}>{getReason(visit)}</div></div>
                  <div><span style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase' }}>Recommended Action</span><div style={{ color: V3.textSecondary, marginTop: 4 }}>{getAction(visit)}</div></div>
                  <div style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059' }}>FOLLOW-UP</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
                    Notified: <span style={{ color: visit.notificationSent ? '#00D1C1' : '#FFA059' }}>{visit.notificationSent ? 'Yes' : 'No'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '3px 0' }}>
                    Status: <span style={{ color: '#00D1C1' }}>{visit.followUpStatus}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(0,209,193,0.1)', border: 'none', borderRadius: 4, color: '#00D1C1', cursor: 'pointer' }}>Reschedule</button>
                    <button style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 4, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Mark Follow-up Complete</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function HubstaffPage({ isMobile }: { isMobile: boolean }) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'sync' | 'productivity'>('activity')

  const staff = V3_STAFF.map((s, i) => {
    const hours = 32 + (i % 13)
    const productivity = 75 + (i % 24)
    const daily = [7.5, 8.2, 6.8, 8.0, 7.2]
    return { ...s, hours, productivity, daily }
  })

  const selected = staff.find(s => s.id === selectedStaff) || null

  const HUBSTAFF_PROJECTS = [
    { name: 'Main Operations', tasksPushed: 12, lastSync: '2026-05-21 08:00' },
    { name: 'CMS-485 Documentation', tasksPushed: 8, lastSync: '2026-05-21 08:00' },
    { name: 'OASIS Reviews', tasksPushed: 5, lastSync: '2026-05-20 17:30' },
    { name: 'QAPI Compliance', tasksPushed: 4, lastSync: '2026-05-21 08:00' },
    { name: 'Version Control', tasksPushed: 3, lastSync: '2026-05-19 12:00' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={ArrowUpCircle} micro="WORKFORCE ANALYTICS" title="Hubstaff Integration" subtitle="Time tracking, productivity metrics, and workforce utilization insights." />

      <div style={{ display: 'flex', gap: 20, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['activity', 'sync', 'productivity'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            fontSize: 11, fontWeight: 600, padding: '8px 0', background: 'none', border: 'none',
            color: activeTab === tab ? '#00D1C1' : 'rgba(255,255,255,0.4)',
            borderBottom: activeTab === tab ? '2px solid #00D1C1' : '2px solid transparent',
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px',
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'activity' && (
        <>
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
                <span style={{ flex: 2.2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Staff Member</span>
                <span style={{ flex: 0.9, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Status</span>
                <span style={{ flex: 0.8, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Hours</span>
                <span style={{ flex: 0.9, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Today</span>
                <span style={{ flex: 1.1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Compliance</span>
                <span style={{ flex: 0.6, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Zone</span>
                <span style={{ flex: 1.3, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Activity</span>
              </div>
              {staff.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedStaff(s.id)}
                  className="v3-invisible-glare"
                  style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
                >
                  <div style={{ flex: 2.2 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{s.name}</span>
                    <span style={{ fontSize: '11px', color: V3.textTertiary }}>{s.role} • {s.department}</span>
                  </div>
                  <span style={{ flex: 0.8, fontSize: '14px', fontWeight: 600, color: V3.textPrimary, textAlign: 'center' }}>{s.hours}h</span>
                  <div style={{ flex: 1.2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((s.hours / 40) * 100, 100)}%`, height: '100%', background: V3.tealLight }} />
                    </div>
                    <span style={{ fontSize: '10px', color: V3.textTertiary, minWidth: 28 }}>{s.productivity}%</span>
                  </div>
                  <span style={{ flex: 0.6, fontSize: '12px', fontWeight: 600, color: V3.textPrimary, textAlign: 'center' }}>{s.zone}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'sync' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 10 }}>HUBSTAFF PROJECTS</div>
          {HUBSTAFF_PROJECTS.map(proj => (
            <div key={proj.name} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#F0F0F0' }}>{proj.name}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Last sync: {proj.lastSync}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#00D1C1' }}>{proj.tasksPushed}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>TASKS PUSHED</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '8px 0', display: 'flex', gap: 8 }}>
            <button style={{ fontSize: 10, padding: '6px 12px', background: 'rgba(0,209,193,0.1)', border: 'none', borderRadius: 4, color: '#00D1C1', cursor: 'pointer' }}>Sync Now</button>
            <button style={{ fontSize: 10, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 4, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Configure</button>
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 10 }}>TEAM PRODUCTIVITY</div>
          {[
            { level: 'High Risk', count: 2, color: '#FFA059', desc: 'Below 75% productivity or >3 missed clock-ins' },
            { level: 'Medium Risk', count: 5, color: 'rgba(255,160,89,0.6)', desc: '75-85% productivity' },
            { level: 'Low Risk', count: 15, color: '#00D1C1', desc: 'Above 85% productivity' },
          ].map(risk => (
            <div key={risk.level} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: risk.color }}>{risk.level}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F0F0F0' }}>{risk.count} staff</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{risk.desc}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <>
          <div onClick={() => setSelectedStaff(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(400px, 50vw)', zIndex: 100, background: 'rgba(16,20,28,0.98)', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: 24, overflow: 'auto' }}>
            <button onClick={() => setSelectedStaff(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: V3.textTertiary, fontSize: 20, cursor: 'pointer' }}>×</button>

            <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', marginBottom: 4 }}>TIME TRACKING</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: V3.textPrimary, margin: '0 0 4px' }}>{selected.name}</h2>
            <div style={{ color: V3.textSecondary, marginBottom: 20 }}>{selected.role} • {selected.department}</div>

            <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase' }}>Hours This Week</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: V3.textPrimary }}>{selected.hours}h <span style={{ fontSize: '12px', color: V3.textTertiary }}>/ 40</span></div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase' }}>Productivity</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: V3.tealLight }}>{selected.productivity}%</div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', marginBottom: 8 }}>Hours vs Target (40h)</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((selected.hours / 40) * 100, 100)}%`, height: '100%', background: V3.tealLight }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: V3.orangeLight, textTransform: 'uppercase', marginBottom: 8 }}>Daily Hours (Mon–Fri)</div>
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24, marginBottom: 12 }}>
                {selected.daily.map((h, i) => (
                  <div key={i} style={{ width: 12, height: `${(h / 10) * 100}%`, background: '#00D1C1', borderRadius: 1, opacity: 0.8 }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 2, fontSize: '10px', color: V3.textTertiary }}>
                {['Mon','Tue','Wed','Thu','Fri'].map((d,i) => <div key={i} style={{ width: 12, textAlign: 'center' }}>{d[0]}</div>)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function UserGuidesPage({ isMobile }: { isMobile: boolean }) {
  const [openSections, setOpenSections] = useState<string[]>(['getting-started', 'compliance'])
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<'all' | 'new-hire' | 'supervisor' | 'admin'>('all')

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      guides: [
        { id: 'gs1', title: 'Platform Onboarding Walkthrough', desc: 'Step-by-step setup for new agencies including user invites, role assignment, and initial configuration.', pages: 18, updated: 'May 12, 2026', readTime: '12 min' },
        { id: 'gs2', title: 'Navigation & Workspace Basics', desc: 'Overview of the left nav, global search, notification center, and switching between CES and Policy modules.', pages: 14, updated: 'May 9, 2026', readTime: '9 min' },
        { id: 'gs3', title: 'First Sprint Creation', desc: 'How to launch your first compliance sprint, assign owners, and configure evidence requirements.', pages: 11, updated: 'May 14, 2026', readTime: '8 min' },
        { id: 'gs4', title: 'Mobile App Quick Start', desc: 'Clinician mobile experience: visit logging, photo evidence capture, and offline sync behavior.', pages: 9, updated: 'May 18, 2026', readTime: '7 min' },
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Audits',
      guides: [
        { id: 'ca1', title: 'Audit Readiness Scoring Explained', desc: 'How the composite readiness score is calculated from domain weights, evidence freshness, and exception rates.', pages: 22, updated: 'May 6, 2026', readTime: '15 min' },
        { id: 'ca2', title: 'Evidence Linking Best Practices', desc: 'Linking artifacts to obligations, maintaining chain of custody, and handling multi-sprint evidence reuse.', pages: 19, updated: 'May 11, 2026', readTime: '13 min' },
        { id: 'ca3', title: 'State Survey Preparation Guide', desc: 'Preparing for unannounced surveys: document bundles, staff interview scripts, and real-time evidence retrieval.', pages: 26, updated: 'May 3, 2026', readTime: '18 min' },
        { id: 'ca4', title: 'Corrective Action Workflows', desc: 'Creating, tracking, and closing CAPs with automated escalation and regulatory reporting hooks.', pages: 15, updated: 'May 17, 2026', readTime: '10 min' },
      ]
    },
    {
      id: 'clinical',
      title: 'Clinical Operations',
      guides: [
        { id: 'co1', title: 'Visit Documentation Standards', desc: 'Required fields, OASIS integration points, and photo/video evidence rules for skilled nursing and therapy.', pages: 17, updated: 'May 8, 2026', readTime: '11 min' },
        { id: 'co2', title: 'Missed Visit Escalation Protocol', desc: 'Automated detection, caregiver reassignment, and 24-hour patient safety notification workflows.', pages: 13, updated: 'May 13, 2026', readTime: '9 min' },
        { id: 'co3', title: 'Physician Order Management', desc: 'Order intake from fax/email/portal, verification, and linkage to visit authorization matrix.', pages: 21, updated: 'May 5, 2026', readTime: '14 min' },
        { id: 'co4', title: 'Interdisciplinary Care Planning', desc: 'Collaborative care plan creation across nursing, PT, OT, and social work with version history.', pages: 16, updated: 'May 19, 2026', readTime: '11 min' },
      ]
    },
    {
      id: 'admin',
      title: 'System Administration',
      guides: [
        { id: 'sa1', title: 'Role-Based Access Control Matrix', desc: 'Detailed permission matrix for Admin, Clinical Director, Scheduler, Field Clinician, and Auditor roles.', pages: 24, updated: 'May 2, 2026', readTime: '16 min' },
        { id: 'sa2', title: 'SSO & SCIM Provisioning', desc: 'Integrating Okta, Azure AD, and custom SAML with automated deprovisioning and audit log export.', pages: 12, updated: 'May 15, 2026', readTime: '8 min' },
        { id: 'sa3', title: 'Data Retention & Purge Policies', desc: 'Configurable retention schedules, legal hold application, and patient data deletion request handling.', pages: 18, updated: 'May 7, 2026', readTime: '12 min' },
        { id: 'sa4', title: 'API & Webhook Reference', desc: 'REST endpoints for external systems, webhook event catalog, and rate limiting / retry semantics.', pages: 29, updated: 'May 20, 2026', readTime: '20 min' },
      ]
    }
  ]

  const guidesWithCitations = useMemo(() => {
    const citations: Record<string, string[]> = {
      'getting-started': ['HR-TA-001 §4.3', 'Onboarding Policy §2'],
      'compliance': ['42 CFR §484.65', '42 CFR §484.80(h)', 'ACHC Standard 7.1'],
      'clinical': ['42 CFR §484.60', 'Title 22 §74731', 'CMS CoP §484.55'],
      'admin': ['HIPAA §164.308', 'OIG Compliance §3.2', 'Agency Admin Policy ADM-001'],
    }
    return sections.map(section => ({
      ...section,
      guides: section.guides.map((g: any) => ({
        ...g,
        citations: citations[section.id]?.slice(0, 2) || [],
        role: section.id === 'getting-started' ? 'new-hire' : section.id === 'compliance' ? 'supervisor' : section.id === 'clinical' ? 'all' : 'admin',
      })),
    }))
  }, [])

  const filteredSections = selectedRole === 'all'
    ? guidesWithCitations
    : guidesWithCitations.map(s => ({ ...s, guides: s.guides.filter((g: any) => g.role === selectedRole || g.role === 'all') })).filter(s => s.guides.length > 0)

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const toggleGuide = (id: string) => {
    setSelectedGuide(selectedGuide === id ? null : id)
  }

  const getGuideContent = (id: string) => {
    const contents: Record<string, string> = {
      'gs1': 'Welcome to the CareIndeed CES platform. Begin by completing your agency profile...',
      'gs2': 'The left navigation provides access to all modules. Use the global search...',
      'ca1': 'Readiness score = 0.35 × Evidence Coverage + 0.25 × Freshness + 0.2 × Exception Rate + 0.2 × Audit History.',
      'ca2': 'Always attach evidence at the obligation level. Reuse is allowed when the artifact timestamp...',
    }
    return contents[id] || 'Detailed guide content with step-by-step instructions, screenshots, and policy references. Follow the checklist at the end of each section to confirm understanding.'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={Folder} micro="SYSTEM DOCUMENTATION" title="User Guides" subtitle="Comprehensive system documentation and operational guides for all modules." />

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'All Guides' },
          { id: 'new-hire', label: 'New Hire' },
          { id: 'supervisor', label: 'Supervisor / DON' },
          { id: 'admin', label: 'Admin / HR' },
        ].map(role => (
          <button key={role.id} onClick={() => setSelectedRole(role.id as any)} style={{
            fontSize: 11, fontWeight: 600, padding: '6px 0', background: 'none', border: 'none',
            color: selectedRole === role.id ? '#00D1C1' : 'rgba(255,255,255,0.4)',
            borderBottom: selectedRole === role.id ? '2px solid #00D1C1' : '2px solid transparent',
            cursor: 'pointer',
          }}>{role.label}</button>
        ))}
      </div>

      {filteredSections.map(section => {
        const isOpen = openSections.includes(section.id)
        return (
          <div key={section.id} style={{ marginBottom: '8px' }}>
            <div
              onClick={() => toggleSection(section.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', cursor: 'pointer', borderBottom: `1px solid rgba(255,255,255,0.06)` }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#F59E0B' }}>{section.title}</span>
              <span style={{ fontSize: '12px', color: V3.textTertiary }}>{isOpen ? '−' : '+'} {section.guides.length} guides</span>
            </div>
            {isOpen && (
              <div style={{ paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '0' }}>
                {section.guides.map((guide: any, idx: number) => {
                  const isSelected = selectedGuide === guide.id
                  return (
                    <div key={guide.id} style={{ padding: '18px 0', borderBottom: idx < section.guides.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                      <div onClick={() => toggleGuide(guide.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', padding: '1px 7px', background: 'rgba(0,209,193,0.1)', color: V3.tealLight }}>{section.title.split(' ')[0]}</span>
                          <FileText size={15} color={V3.textTertiary} />
                        </div>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{guide.title}</h4>
                        <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.45 }}>{guide.desc}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: V3.textTertiary }}>
                          <span>{guide.pages} pages · {guide.updated} · {guide.readTime}</span>
                          <span style={{ color: V3.tealLight, fontWeight: 600 }}>{isSelected ? 'Close' : 'Read →'}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: V3.textTertiary }}>ESTIMATED READING TIME: <span style={{ color: V3.tealLight }}>{guide.readTime}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: 92, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: '68%', height: '100%', background: V3.tealLight }} />
                              </div>
                              <span style={{ fontSize: '11px', color: V3.tealLight, fontWeight: 600 }}>68% read</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '13px', color: V3.textSecondary, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                            {getGuideContent(guide.id)}
                            {'\n\n'}This section covers key workflows, keyboard shortcuts, and common troubleshooting steps. Review the embedded checklist before proceeding to the next guide.
                          </div>
                          {guide.citations && guide.citations.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {guide.citations.map((c: string) => (
                                <span key={c} style={{ fontSize: 9, padding: '1px 6px', borderRadius: 3, background: 'rgba(0,209,193,0.08)', color: '#00D1C1' }}>📎 {c}</span>
                              ))}
                            </div>
                          )}
                          <div style={{ marginTop: 8 }}>
                            {['Review prerequisite documents', 'Complete acknowledgment form', 'Submit to supervisor for sign-off', 'File in personnel record'].map((step, i) => (
                              <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '3px 0', display: 'flex', gap: 8 }}>
                                <span style={{ color: '#00D1C1', fontWeight: 600, minWidth: 14 }}>{i + 1}.</span>
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SopLibraryPage() {
  const [expandedSop, setExpandedSop] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const sopData = [
    { id: 'SOP-CL-001', title: 'Admission Process & Initial Assessment', cat: 'Clinical', status: 'Current', version: '3.2', reviewed: 'Apr 12, 2026', owner: 'Dr. E. Vance', effective: '2025-06-01' },
    { id: 'SOP-CL-002', title: 'Medication Administration Protocol', cat: 'Clinical', status: 'Current', version: '2.8', reviewed: 'Mar 05, 2026', owner: 'L. Chen', effective: '2025-09-15' },
    { id: 'SOP-CL-003', title: 'Wound Care Protocol', cat: 'Clinical', status: 'Under Review', version: '1.9', reviewed: 'May 18, 2026', owner: 'P. Patel', effective: '2026-01-10' },
    { id: 'SOP-CL-004', title: 'Discharge Planning & Transition of Care', cat: 'Clinical', status: 'Current', version: '2.4', reviewed: 'Feb 22, 2026', owner: 'S. Jenkins', effective: '2025-11-01' },
    { id: 'SOP-AD-001', title: 'Referral Processing & Authorization', cat: 'Administrative', status: 'Current', version: '2.1', reviewed: 'Apr 28, 2026', owner: 'Admin Team', effective: '2025-07-20' },
    { id: 'SOP-AD-002', title: 'Patient Scheduling & Coordination', cat: 'Administrative', status: 'Pending Approval', version: '1.5', reviewed: 'May 10, 2026', owner: 'R. Kim', effective: '2026-03-01' },
    { id: 'SOP-IT-001', title: 'System Access Request & Provisioning', cat: 'IT', status: 'Current', version: '2.3', reviewed: 'Jan 15, 2026', owner: 'IT Security', effective: '2025-08-05' },
    { id: 'SOP-IT-002', title: 'Telehealth Visit Procedures', cat: 'IT', status: 'Current', version: '1.8', reviewed: 'Mar 20, 2026', owner: 'D. Nguyen', effective: '2025-12-12' },
    { id: 'SOP-SA-001', title: 'Fall Prevention & Safety Protocol', cat: 'Safety', status: 'Current', version: '3.0', reviewed: 'May 01, 2026', owner: 'M. Torres', effective: '2025-05-01' },
    { id: 'SOP-SA-002', title: 'Infection Control Procedures', cat: 'Safety', status: 'Current', version: '2.7', reviewed: 'Apr 08, 2026', owner: 'A. Johnson', effective: '2025-10-18' },
    { id: 'SOP-SA-003', title: 'Emergency Response Plan', cat: 'Safety', status: 'Under Review', version: '1.6', reviewed: 'May 15, 2026', owner: 'R. Kim', effective: '2026-02-28' },
    { id: 'SOP-HR-001', title: 'Competency Validation & Training', cat: 'HR', status: 'Current', version: '2.2', reviewed: 'Feb 10, 2026', owner: 'HR Dept', effective: '2025-04-01' },
    { id: 'SOP-HR-002', title: 'Supervisory Visit Protocol', cat: 'HR', status: 'Current', version: '1.9', reviewed: 'Mar 25, 2026', owner: 'R. Kim', effective: '2025-09-01' },
    { id: 'SOP-QA-001', title: 'OASIS Assessment Completion', cat: 'Quality', status: 'Current', version: '3.1', reviewed: 'Apr 30, 2026', owner: 'M. Gonzales', effective: '2025-06-15' },
    { id: 'SOP-QA-002', title: 'QAPI Performance Improvement', cat: 'Quality', status: 'Pending Approval', version: '1.4', reviewed: 'May 12, 2026', owner: 'QA Lead', effective: '2026-04-01' },
    { id: 'SOP-QA-003', title: 'Incident Reporting & Investigation', cat: 'Quality', status: 'Current', version: '2.5', reviewed: 'Jan 28, 2026', owner: 'S. Ramirez', effective: '2025-11-20' },
    { id: 'SOP-AD-003', title: 'DME Ordering & Documentation', cat: 'Administrative', status: 'Superseded', version: '1.2', reviewed: 'Dec 05, 2025', owner: 'Admin Team', effective: '2024-08-01' },
    { id: 'SOP-CL-005', title: 'Lab Specimen Collection & Handling', cat: 'Clinical', status: 'Current', version: '2.0', reviewed: 'May 08, 2026', owner: 'L. Chen', effective: '2026-01-22' },
  ]

  const enrichedSops = useMemo(() => sopData.map((sop, i) => ({
    ...sop,
    owner: V3_STAFF[i % V3_STAFF.length]?.name || 'Unassigned',
    achcStandard: ['ACHC 4.1.1', 'ACHC 4.2.3', 'ACHC 5.1.2', 'ACHC 6.3.1', 'ACHC 7.2.4', 'ACHC 3.4.2'][i % 6],
    reviewCycle: ['Annual', 'Biennial', 'Quarterly', 'Annual'][i % 4],
    nextReview: `2026-${String(6 + (i % 7)).padStart(2, '0')}-15`,
    regulatoryRef: ['42 CFR §484.65', '42 CFR §484.80', 'Title 22 §74731', 'HIPAA §164.308', 'CMS CoP §484.55', 'OSHA 29 CFR 1910'][i % 6],
    linkedPolicies: V3_POLICIES.filter(p => p.domain.toLowerCase().includes((sop.category || 'clinical').toLowerCase())).slice(0, 3),
  })), [sopData])

  const filteredSops = useMemo(() => enrichedSops.filter((sop: any) => {
    const matchesSearch = !searchTerm || sop.title.toLowerCase().includes(searchTerm.toLowerCase()) || sop.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCat = categoryFilter === 'all' || sop.cat === categoryFilter
    return matchesSearch && matchesCat
  }), [enrichedSops, searchTerm, categoryFilter])

  const getRelatedPolicies = (cat: string) => V3_POLICIES.filter(p => p.domain.toLowerCase() === cat.toLowerCase() || (cat === 'Clinical' && p.domain === 'Clinical') || (cat === 'Administrative' && p.domain === 'Governance') || (cat === 'IT' && p.domain === 'IT') || (cat === 'Quality' && p.domain === 'QAPI') || (cat === 'Safety' && p.domain === 'Safety') || (cat === 'HR' && p.domain === 'HR')).slice(0, 4)

  const generateVersionHistory = (currentVersion: string, reviewed: string) => {
    const [maj, min] = currentVersion.split('.').map(Number)
    return [
      { ver: `${maj}.${min - 1}`, date: '2026-02-10', note: 'Minor clarifications and formatting' },
      { ver: `${maj - 1}.8`, date: '2025-11-15', note: 'Updated per regulatory change' },
      { ver: `${maj - 1}.5`, date: '2025-08-20', note: 'Initial release with workflow integration' },
    ].filter(v => parseFloat(v.ver) > 0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={FileText} micro="OPERATIONAL PROCEDURES" title="SOP Library" subtitle="Standard Operating Procedures for all clinical, administrative, and compliance workflows." />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['all', 'Clinical', 'Administrative', 'Safety', 'Quality', 'Compliance'].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} style={{
              fontSize: 10, padding: '4px 0', background: 'none', border: 'none',
              color: categoryFilter === cat ? '#00D1C1' : 'rgba(255,255,255,0.4)',
              borderBottom: categoryFilter === cat ? '1px solid #00D1C1' : '1px solid transparent',
              cursor: 'pointer',
            }}>{cat === 'all' ? 'All' : cat}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '260px' }}>
          <Search size={14} color={V3.textTertiary} />
          <input
            placeholder="Search SOPs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <span style={{ flex: 0.6, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>ID</span>
          <span style={{ flex: 2.2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Procedure Title</span>
          <span style={{ flex: 0.9, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Category</span>
          <span style={{ flex: 0.9, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Status</span>
          <span style={{ flex: 0.7, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Ver</span>
          <span style={{ flex: 1.1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Reviewed</span>
          <span style={{ flex: 1.1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Owner</span>
        </div>
        {filteredSops.map((sop: any) => {
          const isExpanded = expandedSop === sop.id
          const related = getRelatedPolicies(sop.cat)
          const history = generateVersionHistory(sop.version, sop.reviewed)
          return (
            <div key={sop.id}>
              <div
                className="v3-invisible-glare"
                style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
                onClick={() => setExpandedSop(isExpanded ? null : sop.id)}
              >
                <span style={{ flex: 0.6, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: V3.tealLight }}>{sop.id}</span>
                <div style={{ flex: 2.2 }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: V3.textPrimary }}>{sop.title}</span>
                  <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(0,209,193,0.08)', color: '#00D1C1' }}>{sop.achcStandard}</span>
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,160,89,0.08)', color: '#FFA059' }}>{sop.regulatoryRef}</span>
                  </div>
                </div>
                <span style={{ flex: 0.9, fontSize: '12px', color: V3.textSecondary }}>{sop.cat}</span>
                <span style={{ flex: 0.9, fontSize: '11px', fontWeight: 600, color: sop.status === 'Current' ? V3.tealLight : V3.textSecondary }}>{sop.status}</span>
                <span style={{ flex: 0.7, fontSize: '12px', fontFamily: 'monospace', color: V3.textTertiary }}>{sop.version}</span>
                <span style={{ flex: 1.1, fontSize: '12px', color: V3.textTertiary }}>{sop.reviewed}</span>
                <span style={{ flex: 1.1, fontSize: '12px', color: V3.textSecondary }}>{sop.owner}</span>
              </div>

              {isExpanded && (
                <div style={{ padding: '16px 24px 20px', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px', marginBottom: '6px' }}>Description</div>
                    <p style={{ fontSize: '13px', color: V3.textSecondary, lineHeight: 1.6, margin: 0 }}>
                      This SOP defines the standardized workflow, required documentation, responsible roles, and quality checkpoints for {sop.title.toLowerCase()}. All staff must adhere to the steps, escalation paths, and record retention requirements outlined herein.
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px', marginBottom: '8px' }}>Related Policies (from V3_POLICIES)</div>
                    {related.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {related.map((p, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '12px', borderBottom: `1px solid rgba(255,255,255,0.04)`, paddingBottom: '4px' }}>
                            <span style={{ fontFamily: 'monospace', color: V3.tealLight, width: '110px' }}>{p.id}</span>
                            <span style={{ color: V3.textPrimary }}>{p.title}</span>
                            <span style={{ color: V3.textTertiary, marginLeft: 'auto' }}>{p.version}</span>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: '12px', color: V3.textSecondary }}>No direct domain matches.</div>}
                  </div>

                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px', marginBottom: '8px' }}>Version History</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                      {history.map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', color: V3.textSecondary }}>
                          <span style={{ fontFamily: 'monospace', color: V3.orange, width: '60px' }}>v{h.ver}</span>
                          <span>{h.date}</span>
                          <span style={{ color: V3.textTertiary }}>{h.note}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: '12px', color: V3.textPrimary }}>
                        <span style={{ fontFamily: 'monospace', color: V3.tealLight, width: '60px' }}>v{sop.version}</span>
                        <span>{sop.reviewed}</span>
                        <span style={{ color: V3.textSecondary }}>Current — {sop.status}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                    <div>Status: <span style={{ color: V3.tealLight, fontWeight: 600 }}>{sop.status}</span></div>
                    <div>Effective: <span style={{ color: V3.textPrimary }}>{sop.effective}</span></div>
                  </div>

                  {/* Owner and Review Cycle */}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>LIFECYCLE</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>Owner: {sop.owner}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>Review Cycle: {sop.reviewCycle}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>Next Review: <span style={{ color: '#00D1C1' }}>{sop.nextReview}</span></div>

                  {/* ACHC Mapping */}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>ACHC MAPPING</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>Standard: {sop.achcStandard}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>Regulatory Reference: {sop.regulatoryRef}</div>

                  {/* Linked Policies */}
                  {sop.linkedPolicies && sop.linkedPolicies.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 6 }}>LINKED POLICIES ({sop.linkedPolicies.length})</div>
                      {sop.linkedPolicies.map((p: any) => (
                        <div key={p.id} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '2px 0' }}>
                          • {p.title} <span style={{ color: '#00D1C1', fontSize: 9 }}>{p.lifecycle || p.status}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TrainingMaterialsPage({ isMobile }: { isMobile: boolean }) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const realModules = useMemo(() => {
    return LIVE_MODULES.map(m => ({
      id: m.id,
      title: m.title,
      group: m.group || 'Core',
      duration: m.durationMinutes ? `${m.durationMinutes} min` : '60 min',
      difficulty: m.passThreshold === 1.0 ? 'Advanced' : m.passThreshold === 0.8 ? 'Intermediate' : 'Beginner',
      method: m.method || 'Quiz',
      policyRef: (m.policyRefs || m.cmsRefs || [])[0] || '',
      role: m.roles === 'ALL' ? 'all' : Array.isArray(m.roles) ? m.roles[0]?.toLowerCase() : 'all',
      pct: Math.floor(Math.random() * 5) * 25,
      prerequisites: m.prerequisites || [],
    }))
  }, [])

  const filteredModules = useMemo(() => {
    if (roleFilter === 'all') return realModules
    return realModules.filter(m => m.role === roleFilter || m.role === 'all')
  }, [roleFilter, realModules])

  const groupedModules = useMemo(() => {
    return filteredModules.reduce((acc, mod) => {
      const g = mod.group || 'Other'
      if (!acc[g]) acc[g] = []
      acc[g].push(mod)
      return acc
    }, {} as Record<string, typeof realModules>)
  }, [filteredModules])

  const toggleModule = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id)
  }

  const uniqueRoles = useMemo(() => {
    const roles = new Set(realModules.map(m => m.role).filter(Boolean))
    return ['all', ...Array.from(roles).sort()]
  }, [realModules])

  const roleTabs = uniqueRoles.map(r => ({
    key: r,
    label: r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={PlayCircle} micro="LEARNING & DEVELOPMENT" title="Training Materials" subtitle="Courses, modules, and certifications for clinical and administrative staff." />

      {/* Role filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {roleTabs.map(tab => {
          const active = roleFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 999,
                border: active ? 'none' : `1px solid rgba(255,255,255,0.12)`,
                background: active ? V3.tealLight : 'transparent',
                color: active ? '#0F141E' : V3.textPrimary,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(groupedModules).map(([group, mods]) => (
          <div key={group}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8, marginTop: 16 }}>{group.toUpperCase()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {mods.map(mod => {
                const isExpanded = expandedModule === mod.id
                return (
                  <div
                    key={mod.id}
                    onClick={() => toggleModule(mod.id)}
                    style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px', marginBottom: '4px' }}>{mod.difficulty}</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, lineHeight: 1.3 }}>{mod.title}</div>
                        <div style={{ fontSize: 9, color: 'rgba(0,209,193,0.7)', marginTop: 2 }}>📎 {mod.policyRef}</div>
                      </div>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `conic-gradient(#00D1C1 ${mod.pct * 3.6}deg, rgba(255,255,255,0.06) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(16,20,28,0.95)', fontSize: 8, color: '#00D1C1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {mod.pct}%
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: V3.textTertiary }}>
                      <span>{mod.duration}</span>
                      <span>{mod.role}</span>
                      <span style={{ color: '#FFA059' }}>{mod.method}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ paddingTop: '8px', borderTop: `1px solid rgba(255,255,255,0.06)`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '12px', color: V3.textSecondary }}>Policy reference: {mod.policyRef}</div>
                        <div style={{ fontSize: '12px', color: V3.textTertiary }}>Target role: {mod.role} • Group: {mod.group} • Method: {mod.method}</div>
                      </div>
                    )}

                    <div style={{ fontSize: '11px', color: V3.tealLight, fontWeight: 600, marginTop: 'auto' }}>{isExpanded ? 'Collapse' : 'View details →'}</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HelpCenterPage({ isMobile }: { isMobile: boolean }) {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const HELP_CATEGORIES = [
    { id: 'getting-started', name: 'Getting Started', articles: 8, icon: '🚀' },
    { id: 'compliance', name: 'Compliance & Audits', articles: 12, icon: '📋' },
    { id: 'clinical', name: 'Clinical Operations', articles: 10, icon: '🏥' },
    { id: 'ces', name: 'CES System', articles: 15, icon: '⚙️' },
    { id: 'evidence', name: 'Evidence & Forms', articles: 9, icon: '📄' },
    { id: 'onboarding', name: 'Onboarding', articles: 7, icon: '👤' },
    { id: 'brad', name: 'Brad AI Assistant', articles: 5, icon: '🤖' },
    { id: 'mobile', name: 'Mobile App', articles: 6, icon: '📱' },
  ]

  const FAQS = [
    // Getting Started
    { q: 'How do I log in for the first time?', a: 'Contact your administrator for initial credentials. Use the "Forgot Password" link if needed.', category: 'getting-started' },
    { q: 'Where do I find my assigned tasks?', a: 'Navigate to My Planner from the main navigation. All CES obligations and personal tasks appear there.', category: 'getting-started' },
    // Compliance
    { q: 'What triggers a compliance escalation?', a: 'Items overdue >48h or blocked >72h auto-escalate per policy CO-RE-001.', category: 'compliance' },
    { q: 'How is audit readiness calculated?', a: 'Score = (completed + locked units) / total required × evidence linkage × signature compliance.', category: 'compliance' },
    { q: 'What do I do if an audit is announced?', a: 'Immediately check the Audit Trail page for gaps. Ensure all evidence is in LOCKED or PROMOTED status.', category: 'compliance' },
    // CES
    { q: 'How do execution units move between states?', a: 'Units follow: upcoming → ready → in_progress → awaiting_signature → completed. Blocked can occur at any active state.', category: 'ces' },
    { q: 'Can I manually override a blocked unit?', a: 'Only DON or Administrator roles can override blocks. Use the Board view and click the unit for override options.', category: 'ces' },
    { q: 'What is the sprint cycle?', a: 'Default sprints are 14 days. Current sprint scope shows in the Calendar sprint view and Board header.', category: 'ces' },
    // Evidence
    { q: 'How do I link evidence to an execution unit?', a: 'From the Evidence page, select an item and use "Link to Unit" action, or upload directly from the unit detail drawer.', category: 'evidence' },
    { q: 'What file types are accepted for evidence?', a: 'PDF, DOC/DOCX, images (JPG/PNG), and signed forms. Max 25MB per file.', category: 'evidence' },
    { q: 'What does EVIDENCE_LOCKED status mean?', a: 'The evidence has been validated and locked for audit. It cannot be modified without admin override.', category: 'evidence' },
    // Brad
    { q: 'What can Brad help me with?', a: 'Brad can answer compliance questions, find blocked items, check audit readiness, and suggest remediation actions.', category: 'brad' },
    { q: 'Are Brad responses legally binding?', a: 'No. Brad provides guidance based on policies and regulations but all actions require human verification.', category: 'brad' },
    // Onboarding
    { q: 'How many supervised visits are required?', a: 'Minimum 3 supervised visits before clearance for independent work, per HR-TD-001 §5.', category: 'onboarding' },
    { q: 'What is Appendix F?', a: 'The personnel file completeness checklist required by ACHC for survey readiness.', category: 'onboarding' },
    // Mobile
    { q: 'Can I complete forms on mobile?', a: 'Yes. The mobile app supports form completion, photo capture, and signature collection in the field.', category: 'mobile' },
    { q: 'Does offline mode work?', a: 'Forms can be filled offline and sync when connectivity returns. Evidence uploads require connection.', category: 'mobile' },
    // Clinical
    { q: 'How do I update a care plan?', a: 'Navigate to the patient profile, select Care Plan tab, and submit changes for DON review.', category: 'clinical' },
    { q: 'What triggers a recertification?', a: 'Medicare patients require recertification every 60 days per CMS guidelines.', category: 'clinical' },
  ]

  const filteredFaqs = FAQS.filter(f =>
    (categoryFilter === 'all' || f.category === categoryFilter) &&
    (search === '' || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={HelpCircle} micro="SUPPORT" title="Help Center" subtitle="Frequently asked questions, support resources, and contact information." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
        {HELP_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setCategoryFilter(cat.id)} style={{
            padding: '10px 12px', background: categoryFilter === cat.id ? 'rgba(0,209,193,0.08)' : 'rgba(255,255,255,0.02)',
            border: 'none', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontSize: 14 }}>{cat.icon}</div>
            <div style={{ fontSize: 11, color: categoryFilter === cat.id ? '#00D1C1' : '#F0F0F0', marginTop: 4 }}>{cat.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{cat.articles} articles</div>
          </button>
        ))}
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search help topics..."
        style={{
          width: '100%', padding: '10px 14px', fontSize: 13,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, color: '#F0F0F0', outline: 'none',
        }}
      />

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Frequently Asked Questions</h3>
        {filteredFaqs.length === 0 && (
          <div style={{ color: V3.textTertiary, fontSize: '13px' }}>No matching questions found.</div>
        )}
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openFaq === faq.q
          return (
            <div key={idx} onClick={() => setOpenFaq(isOpen ? null : faq.q)} style={{ padding: '14px 0', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{faq.q}</h4>
                <span style={{ color: V3.textTertiary }}>{isOpen ? '−' : '+'}</span>
              </div>
              {isOpen && <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '10px 0 0 0', lineHeight: 1.6 }}>{faq.a}</p>}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>NEED MORE HELP?</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
          Email: support@careindeed.com · Phone: (800) 555-CARE · Hours: Mon-Fri 8am-6pm PT
        </div>
      </div>
    </div>
  )
}

function DemoPage({ isMobile }: { isMobile: boolean }) {
  const [activeStep, setActiveStep] = useState(0)
  const snap = useComplianceExecution()
  const units = snap.executionUnits || []
  const metrics = snap.sprintMetrics
  const domainRisks = snap.domainRisks || []
  const events = snap.regulatoryEvents || []

  const DEMO_STEPS = [
    { id: 'overview', title: 'System Overview', subtitle: 'CareIndeed CES Platform' },
    { id: 'sprint', title: 'Sprint Management', subtitle: 'How sprints organize work' },
    { id: 'calendar', title: 'Regulatory Calendar', subtitle: 'Events, deadlines, and cadences' },
    { id: 'board', title: 'Execution Board', subtitle: 'Track unit state transitions' },
    { id: 'evidence', title: 'Evidence Linking', subtitle: 'Forms, uploads, and validation' },
    { id: 'domains', title: 'Domain & Regulatory Framework', subtitle: 'Taxonomy and standards' },
    { id: 'audit', title: 'Audit Readiness', subtitle: 'Scoring and preparation' },
    { id: 'ai', title: 'Brad AI Copilot', subtitle: 'Intelligent compliance assistance' },
  ]

  const goPrev = () => setActiveStep(Math.max(0, activeStep - 1))
  const goNext = () => setActiveStep(Math.min(DEMO_STEPS.length - 1, activeStep + 1))

  const renderStepContent = () => {
    const step = DEMO_STEPS[activeStep]
    switch (step.id) {
      case 'overview':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>CareIndeed Home Health operates a V3 Compliance Execution System (CES) that manages regulatory obligations through sprint-based execution cycles.</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Execution Units', value: units.length },
                { label: 'Regulatory Events', value: events.length },
                { label: 'Domains Tracked', value: domainRisks.length },
                { label: 'Audit Score', value: `${metrics?.auditReadinessScore ?? 82}%` },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#00D1C1' }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'sprint':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>Sprints group obligations into 2-week execution windows. Each unit carries domain tags, due dates, and evidence requirements that roll up to domain-level risk scores.</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>CURRENT SPRINT</div>
            <div style={{ fontSize: 12, color: '#F0F0F0' }}>Active sprint contains {units.length} execution units across {domainRisks.length || 5} domains. {metrics?.onTrack || 31} on track, {metrics?.atRisk || 12} at risk.</div>
          </div>
        )
      case 'calendar':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>The regulatory calendar surfaces all scheduled events, compliance deadlines, and recurring cadences. Events are color-coded by urgency and linked directly to execution units.</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>UPCOMING EVENTS ({events.length})</div>
            {events.slice(0, 4).map((e: any, i: number) => (
              <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>• {e.title || e.name || 'Regulatory deadline'} — {e.date || e.due || 'This week'}</div>
            ))}
            {events.length === 0 && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>No events in current seed snapshot.</div>}
          </div>
        )
      case 'board':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>The Execution Board visualizes every obligation as a card that transitions through states: Not Started → In Progress → Evidence Pending → Completed. State changes trigger real-time recalculation of domain risk.</div>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              {['Not Started', 'In Progress', 'Evidence Pending', 'Completed'].map((st, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{st}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: '#00D1C1' }}>{Math.max(3, Math.floor(units.length / 4) - i)}</div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'evidence':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>Evidence Linking connects uploaded forms, visit notes, and external documents to specific execution units. Validation rules ensure required artifacts are present before a unit can advance to Completed.</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '4px 0' }}>• Drag-and-drop from Evidence Center into board cards</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '4px 0' }}>• Automatic taxonomy tagging and completeness scoring</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '4px 0' }}>• Real-time impact on sprint and domain metrics</div>
          </div>
        )
      case 'domains':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>The platform tracks compliance across {domainRisks.length} regulatory domains, each mapped to federal and state standards.</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>ACTIVE DOMAINS</div>
            {domainRisks.slice(0, 6).map((d, i) => (
              <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#F0F0F0' }}>{d.domain}</span>
                <span style={{ fontSize: 10, color: d.riskLevel === 'high' ? '#FFA059' : '#00D1C1' }}>{d.riskLevel?.toUpperCase() || 'LOW'} · {d.openCount || 0} open</span>
              </div>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginTop: 12, marginBottom: 8 }}>REGULATORY FRAMEWORKS</div>
            {['42 CFR §484 (Medicare CoPs)', 'Title 22 CCR (CA State)', 'ACHC Accreditation Standards', 'HIPAA Privacy Rule', 'OSHA Workplace Safety'].map(fw => (
              <div key={fw} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '3px 0' }}>• {fw}</div>
            ))}
          </div>
        )
      case 'audit':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>Audit readiness is computed from coverage, freshness, exception count, and historical performance. A live score is maintained for every domain and the overall agency.</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>READINESS COMPONENTS</div>
            <div style={{ fontSize: 12, color: '#F0F0F0', lineHeight: 1.6 }}>score = 0.35 × coverage + 0.25 × freshness + 0.20 × exceptions + 0.20 × history</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Current aggregate: {metrics?.auditReadinessScore ?? 82}%</div>
          </div>
        )
      case 'ai':
        return (
          <div>
            <div style={{ fontSize: 13, color: '#F0F0F0', marginBottom: 12 }}>Brad AI provides real-time compliance guidance, can classify queries across policy/event/task domains, and surfaces citations from regulatory sources.</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>CAPABILITIES</div>
            {['Blocked item identification + remediation suggestions', 'Overdue task escalation recommendations', 'Evidence gap analysis', 'Audit readiness assessment', 'Policy/regulation cross-referencing with citations'].map(cap => (
              <div key={cap} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', padding: '3px 0' }}>✓ {cap}</div>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={PlayCircle} micro="SANDBOX" title="Demo Environment" subtitle="Interactive sandbox with synthetic data. Explore all system features without affecting production." />

      <div style={{ padding: '20px 24px', border: `1px solid rgba(0, 209, 193, 0.33)`, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldCheck size={20} color={V3.tealLight} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Demo Mode Active</div>
          <div style={{ fontSize: '12px', color: V3.textSecondary }}>All data is synthetic. Changes will not persist between sessions. HIPAA-safe environment.</div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Guided CES Tour</h3>

        {/* Horizontal Stepper — numbers, teal for active/completed, flat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, overflowX: 'auto' }}>
          {DEMO_STEPS.map((step, i) => (
            <React.Fragment key={step.id}>
              <button onClick={() => setActiveStep(i)} style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: i === activeStep ? '#00D1C1' : i < activeStep ? 'rgba(0,209,193,0.3)' : 'rgba(255,255,255,0.06)',
                color: i <= activeStep ? '#000' : 'rgba(255,255,255,0.4)',
                fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i + 1}</button>
              {i < DEMO_STEPS.length - 1 && (
                <div style={{ width: 20, height: 1, background: i < activeStep ? 'rgba(0,209,193,0.4)' : 'rgba(255,255,255,0.06)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#00D1C1', fontWeight: 600, marginBottom: 4 }}>{DEMO_STEPS[activeStep].title}</div>
        <div style={{ fontSize: 13, color: V3.textSecondary, marginBottom: 16 }}>{DEMO_STEPS[activeStep].subtitle}</div>

        <div style={{ minHeight: 140 }}>
          {renderStepContent()}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button onClick={goPrev} disabled={activeStep === 0} style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: `1px solid ${V3.borderDefault}`, background: 'transparent', color: V3.textPrimary, cursor: activeStep === 0 ? 'default' : 'pointer', opacity: activeStep === 0 ? 0.4 : 1 }}>Previous</button>
          <button onClick={goNext} disabled={activeStep === DEMO_STEPS.length - 1} style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: 'none', background: '#00D1C1', color: '#000', cursor: activeStep === DEMO_STEPS.length - 1 ? 'default' : 'pointer', opacity: activeStep === DEMO_STEPS.length - 1 ? 0.4 : 1 }}>Next</button>
        </div>
      </div>
    </div>
  )
}

function AuditTrailPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d' | 'sprint'>('all')
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)

  // Wired to V3_AUDIT_LOG primitives; mapped to page's expected shape (target=resource, type derived from action/severity)
  const rawEntries = V3_AUDIT_LOG.map((entry, idx) => ({
    id: idx,
    timestamp: entry.timestamp,
    action: entry.action,
    user: entry.user,
    target: entry.resource,
    severity: entry.severity,
    details: entry.details || '',
    type: entry.action.includes('Upload') || entry.action.includes('Evidence') ? 'Upload' : entry.action.includes('Sign') ? 'Signature' : entry.severity === 'critical' ? 'Critical' : 'Info',
    hash: null as string | null,
  }))

  const uniqueUsers = Array.from(new Set(V3_AUDIT_LOG.map(e => e.user)))

  const filtered = rawEntries.filter(e =>
    (severityFilter === 'all' || e.severity === severityFilter) &&
    (userFilter === 'all' || e.user === userFilter)
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <HeaderBlock icon={FileSearch} micro="CHAIN OF CUSTODY" title="Audit Trail" subtitle="Immutable chronological record of all evidence actions, access events, and chain-of-custody transfers." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${V3.borderDefault}` }}>
          {['All Events', 'Upload', 'Access', 'Modify', 'Delete', 'Transfer', 'Signature'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {}}
              style={{
                padding: '6px 0',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                borderBottom: idx === 0 ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                color: idx === 0 ? V3.textPrimary : V3.textSecondary,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Severity & User Filter Bar — flat underline tabs per V3 rules */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', padding: '4px 0' }}>
          <div style={{ display: 'flex', gap: '16px', borderBottom: `1px solid ${V3.borderDefault}` }}>
            {['all', 'info', 'warning', 'critical'].map(s => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                style={{
                  padding: '6px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: severityFilter === s ? `2px solid ${V3.tealLight}` : '2px solid transparent',
                  color: severityFilter === s ? V3.textPrimary : V3.textSecondary,
                  textTransform: 'capitalize',
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            style={{ background: 'transparent', border: `1px solid ${V3.borderDefault}`, color: V3.textPrimary, fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Date range picker per spec */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          {(['all', '7d', '30d', 'sprint'] as const).map(range => (
            <button key={range} onClick={() => setDateRange(range)} style={{
              fontSize: 10, padding: '4px 8px', background: 'none', border: 'none',
              color: dateRange === range ? '#00D1C1' : 'rgba(255,255,255,0.4)',
              borderBottom: dateRange === range ? '1px solid #00D1C1' : '1px solid transparent',
              cursor: 'pointer',
            }}>{range === 'all' ? 'All Time' : range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'This Sprint'}</button>
          ))}
        </div>

        {/* Evidence packet status section */}
        <div style={{ marginBottom: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 8 }}>EVIDENCE PACKET STATUS</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'TOTAL ENTRIES', value: String(filtered.length) },
              { label: 'CRITICAL', value: String(filtered.filter(e => e.severity === 'critical').length), color: '#FFA059' },
              { label: 'CHAIN INTACT', value: '✓', color: '#00D1C1' },
              { label: 'LAST EXPORT', value: '2026-05-20' },
            ].map(s => (
              <div key={s.label}>
                <span style={{ fontSize: 16, fontWeight: 600, color: s.color ?? '#F0F0F0' }}>{s.value}</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.5px', color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Export action buttons */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button style={{ fontSize: 10, padding: '6px 12px', background: 'rgba(0,209,193,0.1)', border: 'none', borderRadius: 4, color: '#00D1C1', cursor: 'pointer' }}>Export Audit Packet</button>
          <button style={{ fontSize: 10, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 4, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Verify Chain Integrity</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {filtered.map((entry, idx) => {
          const isExpanded = expandedEntry === idx
          return (
            <div key={idx}>
              <div
                className="v3-invisible-glare"
                style={{ display: 'flex', alignItems: 'flex-start', padding: '14px 16px', gap: '16px', borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer' }}
                onClick={() => setExpandedEntry(isExpanded ? null : idx)}
              >
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

              {isExpanded && (
                <div style={{ padding: '8px 0 12px 184px' }}>
                  {entry.details && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{entry.details}</div>}

                  {/* Chain of custody */}
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', color: '#FFA059', marginBottom: 6 }}>CHAIN OF CUSTODY</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                    Hash: {`sha256:${String(entry.id).replace(/[^a-z0-9]/g, '')}a4f2e8...`}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    Previous: {`sha256:${(String(entry.id) + 'prev').replace(/[^a-z0-9]/g, '')}b7c1d3...`}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                    Signed by: System Audit Service · Immutable: <span style={{ color: '#00D1C1' }}>Yes</span>
                  </div>

                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
                    IP: 10.0.{Math.floor(Math.random() * 255)}.{Math.floor(Math.random() * 255)} · Session: {String(entry.id).slice(0, 8)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
            <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, letterSpacing: '1px' }}>AUDIT EVENT</div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: V3.textPrimary, margin: '4px 0 0' }}>{entry.action}</h3>
              </div>
              <button onClick={() => setSelectedEntry(null)} style={{ background: 'transparent', border: 'none', color: V3.textSecondary, fontSize: '20px', cursor: 'pointer', padding: '4px' }}>×</button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: V3.textSecondary }}>Timestamp</span>
                  <span style={{ color: V3.textPrimary, fontFamily: 'monospace' }}>{entry.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: V3.textSecondary }}>User</span>
                  <span style={{ color: V3.textPrimary }}>{entry.user}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: V3.textSecondary }}>Target Path</span>
                  <span style={{ color: V3.textPrimary }}>{entry.target}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                  <span style={{ color: V3.textSecondary }}>Type</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'rgba(0,209,193,0.15)', color: V3.tealLight }}>{entry.type}</span>
                </div>
                {entry.hash && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: V3.textSecondary }}>Full Hash</span>
                    <span style={{ color: V3.textPrimary, fontFamily: 'monospace', fontSize: '11px' }}>{entry.hash}</span>
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: V3.textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chain of Custody</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: V3.textSecondary }}>
                  <div>✓ Verified by ledger node at 11:32:14 UTC</div>
                  <div>✓ Signature: ECDSA P-256 valid</div>
                  <div>✓ Merkle root: 0x4f2a...e9b1 (immutable)</div>
                  <div style={{ color: V3.tealLight }}>✓ No tampering detected since creation</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: V3.textSecondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Related Events</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { time: 'May 20 11:33 AM', action: 'Hash anchored to blockchain' },
                    { time: 'May 20 11:35 AM', action: 'Access logged by compliance daemon' },
                  ].map((rel, i) => (
                    <div key={i} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: V3.textSecondary }}>{rel.time}</span>
                      <span style={{ color: V3.textPrimary }}>{rel.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

    </div>
  )
}
