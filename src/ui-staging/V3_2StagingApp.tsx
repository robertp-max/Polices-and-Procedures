// V3.2 Staging App — Self-contained prototype shell
// Route: /ui-staging/v3.2
import React, { useLayoutEffect, useState } from 'react';
import {
  AlertTriangle, Activity, ShieldCheck, CheckCircle2,
  FileText, Filter, MoreHorizontal, ArrowRight, Clock, ShieldX,
  LayoutDashboard, Users, Calendar, Settings, FileSearch, HelpCircle,
  Menu, Search, X, User, Bell, Bot, Network, UserPlus, FolderOpen,
  ArrowUpCircle, Folder, PlayCircle, Shield, CheckSquare, SearchIcon, ChevronDown, ChevronRight, ArrowLeft, Info, LayoutList, Archive
} from 'lucide-react';

// ============================================================
// V3.2 PREMIUM GLASS TOKENS
// ============================================================
const V3 = {
  baseBg: '#05060A',
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',
  glass1: 'transparent',
  glass2: 'rgba(255, 255, 255, 0.04)',
  glass3: 'rgba(255, 255, 255, 0.015)',
  teal: '#007970',
  tealLight: '#00D1C1',
  orangeLight: '#FFA059',
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  borderDefault: 'rgba(255, 255, 255, 0.15)',
  borderHighlight: 'rgba(255, 255, 255, 0.33)',
} as const;

// ============================================================
// GLOBAL STYLESHEET INJECTOR (V3.2 PHYSICS & MPA TRANSITIONS)
// ============================================================
const GlobalStylesheetInjector = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @view-transition { navigation: auto; }

    .no-scrollbar::-webkit-scrollbar { width: 4px; display: none; }
    .no-scrollbar:hover::-webkit-scrollbar { display: block; }
    .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .no-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.10); border-radius: 4px; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    ::selection { background: rgba(0,209,193,0.20); color: #fff; }
    :focus-visible { outline: 1px solid #00D1C1 !important; outline-offset: 2px !important; }

    /* MPA Locks & Transitions Base */
    .v3-app-sidebar { view-transition-name: app-sidebar; animation: none; }
    .v3-app-header { view-transition-name: app-header; animation: none; }
    .v3-main-content { view-transition-name: main-content; }
    .v3-auth-screen { view-transition-name: auth-screen; }

    /* LINEAR / CLEAN / SMOOTH - View Transition Variables */
    :root {
      --duration-exit: 120ms;
      --duration-enter: 180ms;
      --duration-move: 300ms;
    }

    @keyframes vt-fade {
      from { opacity: 0; filter: blur(2px); }
      to { opacity: 1; filter: blur(0px); }
    }

    /* Pattern A: Main Content Drift */
    @keyframes drift-down { to { transform: translateY(12px); } }
    @keyframes drift-up { from { transform: translateY(12px); } to { transform: translateY(0); } }
    ::view-transition-old(main-content) {
      animation: var(--duration-exit) linear both vt-fade reverse, var(--duration-exit) linear both drift-down;
      height: 100%; object-fit: cover; object-position: top center; overflow: clip;
    }
    ::view-transition-new(main-content) {
      animation: var(--duration-enter) linear var(--duration-exit) both vt-fade, var(--duration-enter) linear var(--duration-exit) both drift-up;
      height: 100%; object-fit: cover; object-position: top center; overflow: clip;
    }

    /* Pattern B & C: Policy Detail Crossfade & Slides */
    ::view-transition-old(policy-content) {
      animation: var(--duration-exit) linear vt-fade reverse;
      height: 100%; object-fit: cover; object-position: top center; overflow: clip;
    }
    ::view-transition-new(policy-content) {
      animation: var(--duration-enter) linear var(--duration-exit) both vt-fade;
      height: 100%; object-fit: cover; object-position: top center; overflow: clip;
    }

    @keyframes vt-slide { from { translate: var(--slide-offset); } to { translate: 0; } }

    [data-vt-direction="forward"]::view-transition-old(main-content),
    [data-vt-direction="forward"]::view-transition-old(policy-content) {
      --slide-offset: -60px;
      animation: var(--duration-exit) linear both vt-fade reverse, var(--duration-move) linear both vt-slide reverse;
    }
    [data-vt-direction="forward"]::view-transition-new(main-content),
    [data-vt-direction="forward"]::view-transition-new(policy-content) {
      --slide-offset: 60px;
      animation: var(--duration-enter) linear var(--duration-exit) both vt-fade, var(--duration-move) linear both vt-slide;
    }
    [data-vt-direction="back"]::view-transition-old(main-content),
    [data-vt-direction="back"]::view-transition-old(policy-content) {
      --slide-offset: 60px;
      animation: var(--duration-exit) linear both vt-fade reverse, var(--duration-move) linear both vt-slide reverse;
    }
    [data-vt-direction="back"]::view-transition-new(main-content),
    [data-vt-direction="back"]::view-transition-new(policy-content) {
      --slide-offset: -60px;
      animation: var(--duration-enter) linear var(--duration-exit) both vt-fade, var(--duration-move) linear both vt-slide;
    }

    /* Sticky Nav Anchor for Details View */
    ::view-transition-group(policy-nav-header) { animation: none; z-index: 100; }
    ::view-transition-old(policy-nav-header) { display: none; }
    ::view-transition-new(policy-nav-header) { animation: none; }

    @media (prefers-reduced-motion: reduce) {
      ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
        animation-duration: 0s !important; animation-delay: 0s !important;
      }
    }

    /* Mount Animations */
    .animate-butter-shift { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }

    /* The Invisible Glare Component Pattern */
    .v3-invisible-glare {
      background: transparent; border: 1px solid transparent; border-radius: 12px;
      transition: background 0.777s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.777s cubic-bezier(0.16, 1, 0.3, 1), transform 0.777s cubic-bezier(0.16, 1, 0.3, 1) !important;
      will-change: transform, background-color, border-color;
    }
    .v3-invisible-glare:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.005) 100%) !important;
      border-color: rgba(255, 255, 255, 0.33) !important; transform: translateY(-2px);
      transition: background 0.33s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.33s cubic-bezier(0.16, 1, 0.3, 1), transform 0.33s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .btn-smooth-hover { transition: all 0.777s cubic-bezier(0.16, 1, 0.3, 1) !important; }
    .btn-smooth-hover:hover { transition: all 0.33s cubic-bezier(0.16, 1, 0.3, 1) !important; }

    /* Command Center Orange Neon */
    .v3-neon-orange {
      color: #FFA059 !important; text-shadow: 0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45) !important;
    }
  `}} />
);

// ============================================================
// DATA CONSTANTS (Including GV-GB-001 Policy Data)
// ============================================================
const POLICY_META = {
  id: 'GV-GB-001', title: 'Governing Body Authority & Responsibilities', domain: 'GV — Governance',
  tier: 'REQUIRED', version: '6.0', effective: '2025-07-10', approvedBy: 'Governing Body Chair',
  lastReviewed: '2025-07-10', nextReviewDate: '2026-07-10', supersedes: 'N/A (Initial Version)'
};
const DEFINITIONS = [
  { term: 'Governing Body', def: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
  { term: 'Administrator', def: 'The individual appointed by the Governing Body who is responsible for managing the agency\'s day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law.' },
  { term: 'Clinical Manager', def: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance.' },
  { term: 'Fiduciary Duty', def: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { term: 'QAPI', def: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' }
];
const PROCEDURES: Record<string, string[][]> = {
  '6.1': [
    ['6.1.1', 'Agency Owner', 'Formally establish the Governing Body through articles of incorporation, operating agreement, or equivalent legal instrument. Document legal form, minimum members, and quorum.', 'Prior to initial Medicare certification'],
    ['6.1.2', 'Governing Body Chair', 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, and voting status.', 'Updated within 7 calendar days of change'],
    ['6.1.3', 'Compliance Officer', 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) database.', 'At appointment and monthly thereafter'],
  ],
  '6.2': [
    ['6.2.1', 'Governing Body', 'Assume and maintain full legal authority for the overall operation, management, and fiscal viability of Care Indeed Home Health Care, Inc.', 'Continuous'],
    ['6.2.2', 'Governing Body', 'Appoint a qualified Administrator and document the appointment in Governing Body minutes. Conduct annual performance evaluations.', 'Prior to operation; annually thereafter'],
    ['6.2.3', 'Governing Body', 'Approve all REQUIRED-tier policies prior to implementation and ensure a defined policy review cycle exists per policies GV-PM-001 and GV-PM-002.', 'Prior to implementation of policy'],
  ],
  '6.3': [
    ['6.3.1', 'Governing Body Chair', 'Schedule and convene regular Governing Body meetings no fewer than 4 times per calendar year (quarterly). Schedule must be distributed by Dec 15.', 'Quarterly'],
    ['6.3.2', 'Designated Secretary', 'Prepare and distribute the meeting agenda to all members no fewer than 7 calendar days before meeting. Record formal minutes per GV-GB-002.', '7 days before each meeting'],
  ]
};
const COMPLIANCE_81 = [
  ['Governing Body is legally established and documented.', 'Review of establishing documents (articles, bylaws).', 'Current, complete, and on file at all times.'],
  ['Governing Body meets at least quarterly.', 'Review of meeting minutes with dates and attendance.', '4 or more meetings per year with quorum.'],
  ['Key personnel are appointed and documented.', 'Review of Governing Body minutes; personnel files.', 'Current appointments documented; no vacancies > 30 days.'],
  ['Conflict of Interest disclosures are current.', 'Review of Appendix B forms for each member.', '100% completion rate; no lapsed disclosures.'],
];
const COMPLIANCE_83 = [
  ['No documented evidence that a Governing Body exists or functions.', 'Condition-level deficiency under 42 CFR § 484.105. Potential termination.', 'Maintain establishing documents, current roster, and quarterly minutes.'],
  ['Governing Body "rubber stamps" reports without documented discussion.', 'Surveyors will cite passive governance as failure to exercise oversight.', 'Minutes must document specific discussion points, questions, and directives.'],
];
const POLICY_STATEMENTS = [
  'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.',
  'The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency.',
  'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services.',
  'The Governing Body shall approve and oversee the agency\'s: Scope of services, Organizational structure, Strategic plan, Policy framework, QAPI program, Corporate compliance program, and Annual budget.',
  'The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.'
];

// ============================================================
// STUB DATA & VIEWS (placeholder screens for non-policy routes)
// ============================================================
interface TaskItem {
  id: string; domain: string; code: string; title: string; dueDate: string; overdue: boolean; status: string;
}

const INITIAL_PLANNED_TASKS: TaskItem[] = [
  { id: 't-1', domain: 'CLINICAL', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', dueDate: 'May 20', overdue: false, status: 'open' },
  { id: 't-2', domain: 'CLINICAL', code: 'CL-WP-25', title: 'Review aggregate quality trends', dueDate: 'May 18', overdue: true, status: 'overdue' },
  { id: 't-3', domain: 'CLINICAL', code: 'CC-WP-22', title: 'Review compliance/billing audit results', dueDate: 'May 19', overdue: true, status: 'overdue' },
  { id: 't-4', domain: 'CLINICAL', code: 'DM-WP-18', title: 'Review HO audit results', dueDate: 'May 21', overdue: false, status: 'open' },
  { id: 't-5', domain: 'CLINICAL', code: 'DM-WP-15', title: 'Review data/safety audit results', dueDate: 'May 22', overdue: false, status: 'open' },
  { id: 't-6', domain: 'IT', code: 'IT-WP-21', title: 'Review IT/security audit results', dueDate: 'May 23', overdue: false, status: 'open' },
  { id: 't-7', domain: 'CLINICAL', code: 'QA-WP-12', title: 'Review OAPS-layer KPI indicators', dueDate: 'May 24', overdue: false, status: 'open' },
  { id: 't-8', domain: 'CLINICAL', code: 'QA-WP-04', title: 'Review PIP execution logs', dueDate: 'May 25', overdue: false, status: 'open' },
  { id: 't-9', domain: 'GOVERNANCE', code: 'GV-WP-01', title: 'Package report for Governing Body', dueDate: 'May 26', overdue: false, status: 'open' },
];

const StubView = ({ icon: Icon, label }: { icon: React.ComponentType<{size?: number; color?: string}>; label: string }) => (
  <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', color: V3.textTertiary }}>
    <Icon size={36} color={V3.textTertiary} />
    <span style={{ fontSize: '14px', fontWeight: 500 }}>{label} — under construction</span>
  </div>
);

const DashboardWorkspace = ({ setIsPlannerView, isMobile: _isMobile }: { setIsPlannerView: (v: boolean) => void; isMobile: boolean }) => (
  <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px', paddingBottom: '32px' }}>
    <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
      <span className="v3-neon-orange" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>AGENCY OPERATIONS</span>
      <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</h1>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
      {[
        { label: 'READINESS SCORE', value: '82%', color: V3.tealLight },
        { label: 'OPEN OBLIGATIONS', value: '47', color: V3.textPrimary },
        { label: 'THIS WEEK TASKS', value: `${INITIAL_PLANNED_TASKS.length}`, color: V3.textPrimary },
        { label: 'EVIDENCE LINK RATE', value: '91%', color: V3.tealLight },
      ].map(stat => (
        <div key={stat.label} className="v3-invisible-glare" style={{ padding: '16px 18px', border: `1px solid ${V3.borderDefault}` }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: V3.textTertiary }}>{stat.label}</div>
          <div style={{ fontSize: '26px', marginTop: '6px', fontWeight: 600, color: stat.color }}>{stat.value}</div>
        </div>
      ))}
    </div>
    <div className="v3-invisible-glare" style={{ border: `1px solid ${V3.borderDefault}`, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', color: V3.textPrimary }}>Priority Queue</h3>
        <button onClick={() => setIsPlannerView(true)} className="btn-smooth-hover" style={{ background: 'transparent', border: `1px solid ${V3.borderHighlight}`, borderRadius: '8px', color: V3.textSecondary, padding: '6px 10px', fontSize: '11px', cursor: 'pointer' }}>Open My Planner</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {INITIAL_PLANNED_TASKS.slice(0, 5).map(task => (
          <div key={task.id} className="v3-invisible-glare" style={{ border: task.overdue ? `1px solid rgba(0,209,193,0.33)` : `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', padding: '12px 14px', display: 'grid', gridTemplateColumns: '110px 1fr 80px', gap: '10px', alignItems: 'center' }}>
            <div><div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase' }}>{task.domain}</div><div style={{ fontSize: '12px', fontFamily: 'monospace', color: V3.textSecondary }}>{task.code}</div></div>
            <div style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: task.overdue ? V3.tealLight : V3.textTertiary }}>{task.dueDate}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PlannerWorkspace = ({ tasks, isMobile: _isMobile }: { tasks: TaskItem[]; isMobile: boolean }) => (
  <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px', paddingBottom: '32px' }}>
    <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
      <span className="v3-neon-orange" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>MY WORKSPACE</span>
      <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Planner</h1>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {tasks.map(task => (
        <div key={task.id} className="v3-invisible-glare" style={{ border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', padding: '14px 16px', display: 'grid', gridTemplateColumns: '110px 1fr 100px 80px', gap: '10px', alignItems: 'center' }}>
          <div><div style={{ fontSize: '10px', color: V3.textTertiary, textTransform: 'uppercase' }}>{task.domain}</div><div style={{ fontSize: '12px', fontFamily: 'monospace', color: V3.textSecondary }}>{task.code}</div></div>
          <div style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</div>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', borderRadius: '6px', background: task.overdue ? 'rgba(255,100,100,0.1)' : 'rgba(0,209,193,0.08)', color: task.overdue ? '#FF6464' : V3.tealLight }}>{task.status}</span>
          <div style={{ textAlign: 'right', fontSize: '11px', color: V3.textTertiary }}>{task.dueDate}</div>
        </div>
      ))}
    </div>
  </div>
);

const ClinicianProfilesView = () => <StubView icon={Users} label="Clinician Profiles" />;
const PatientProfilesView = () => <StubView icon={Activity} label="Patient Profiles" />;
const CalendarView = () => <StubView icon={Calendar} label="Calendar" />;

// ============================================================
// LOGIN SCREEN (OUTSIDE SHELL)
// ============================================================
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (document.startViewTransition) document.startViewTransition(() => onLogin());
    else onLogin();
  };

  return (
    <div className="v3-auth-screen" style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', zIndex: 10 }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'linear-gradient(135deg, rgba(32,41,56,0.88) 0%, rgba(16,20,28,0.45) 60%, rgba(8,10,13,0.98) 100%)', backdropFilter: 'blur(32px) saturate(140%)', borderRadius: '24px', border: 'none', boxShadow: '30px 10px 80px rgba(0,0,0,0.9)', padding: '48px 40px', display: 'flex', flexDirection: 'column', gap: '32px', zIndex: 2 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, #007970, #007970aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>CI</div>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: V3.textTertiary, marginBottom: '8px' }}>CARE INDEED COMPLIANCE</div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sign In</h1>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: V3.textSecondary, display: 'block', marginBottom: '8px' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="admin@careindeed.com" style={{ width: '100%', padding: '14px 16px', fontSize: '14px', background: V3.glass3, border: focused === 'email' ? `2px solid ${V3.tealLight}` : `1px solid ${V3.borderDefault}`, borderRadius: '12px', color: V3.textPrimary, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.33s' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: V3.textSecondary, display: 'block', marginBottom: '8px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="••••••••" style={{ width: '100%', padding: '14px 16px', fontSize: '14px', background: V3.glass3, border: focused === 'password' ? `2px solid ${V3.tealLight}` : `1px solid ${V3.borderDefault}`, borderRadius: '12px', color: V3.textPrimary, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.33s' }} />
          </div>
          <button type="submit" className="btn-smooth-hover" style={{ width: '100%', height: '48px', borderRadius: '12px', border: 'none', background: V3.tealLight, color: '#000000', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }}>Enter Workspace</button>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// SHELL FRAME & NAVIGATION
// ============================================================
const ShellContentFrame = ({ children, isMobile, activeSection, isNavOpen, setIsNavOpen, isPlannerView, setIsPlannerView, onLogout, handleNav }: {
  children: React.ReactNode;
  isMobile: boolean;
  activeSection: string;
  isNavOpen: boolean;
  setIsNavOpen: (v: boolean) => void;
  isPlannerView: boolean;
  setIsPlannerView: (v: boolean) => void;
  onLogout: () => void;
  handleNav: (id: string, direction?: 'forward' | 'back') => void;
}) => {
  const navSections = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'profiles', icon: Users, label: 'Profiles', submenu: [ { id: 'clinicians', label: 'Clinician Profiles' }, { id: 'patients', label: 'Patient Profiles' } ] },
      ]
    },
    {
      title: 'COMPLIANCE EXECUTION',
      items: [
        { id: 'policy', icon: FileText, label: 'Policy Library' },
        { id: 'forms', icon: FolderOpen, label: 'Forms & Evidence' },
      ]
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ profiles: true });
  const toggleSubmenu = (menuId: string) => setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', boxSizing: 'border-box', color: V3.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", padding: isMobile ? '0' : '20px', overflow: 'hidden', position: 'relative', backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px), radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)`, backgroundSize: '24px 24px, 24px 24px, 100% 100%', backgroundBlendMode: 'screen, screen, normal' }}>
      <GlobalStylesheetInjector />
      <div style={{ position: 'fixed', bottom: '-8vh', left: '-8vw', width: '55vmin', height: '55vmin', backgroundImage: `url('/ci-angel.webp')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom left', opacity: 0.33, pointerEvents: 'none', zIndex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : '77.7%', minWidth: isMobile ? '100%' : 'min(980px, 95vw)', maxWidth: '100%', height: isMobile ? '100vh' : '92vh', margin: 'auto', border: 'none', borderRadius: isMobile ? '0' : '24px', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(32, 41, 56, 0.88) 0%, rgba(16, 20, 28, 0.45) 60%, rgba(8, 10, 13, 0.98) 100%)', backdropFilter: 'blur(32px) saturate(140%)', WebkitBackdropFilter: 'blur(32px) saturate(140%)', boxShadow: isMobile ? 'none' : '30px 10px 80px rgba(0, 0, 0, 0.9)', position: 'relative', zIndex: 2 }}>

        <header className="v3-app-header" style={{ height: '72px', flexShrink: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', zIndex: 20, borderBottom: `1px solid ${V3.borderDefault}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <button onClick={() => setIsNavOpen(!isNavOpen)} className="btn-smooth-hover" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: V3.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', width: isMobile ? '100%' : '320px' }}>
              <Search size={16} color={V3.textTertiary} />
              <input placeholder="Search operations, policies..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeSection === 'dashboard' && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '20px', border: `1px solid rgba(255,255,255,0.08)` }}>
                <button onClick={() => setIsPlannerView(false)} className="btn-smooth-hover" style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', background: !isPlannerView ? V3.tealLight : 'transparent', color: !isPlannerView ? '#000000' : V3.textSecondary }}>Agency View</button>
                <button onClick={() => setIsPlannerView(true)} className="btn-smooth-hover" style={{ padding: '6px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', background: isPlannerView ? V3.tealLight : 'transparent', color: isPlannerView ? '#000000' : V3.textSecondary }}>My Planner</button>
              </div>
            )}
            {!isMobile && <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.3px', color: V3.textPrimary }}>CareIndeed</span>}
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg, ${V3.teal}, ${V3.tealLight}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>CI</div>
          </div>
        </header>

        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          <nav className="v3-app-sidebar no-scrollbar" style={{ width: isNavOpen ? '260px' : '0px', minWidth: isNavOpen ? (isMobile ? '100%' : '260px') : '0px', opacity: isNavOpen ? 1 : 0, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease', background: 'transparent', borderRight: `1px solid ${V3.borderDefault}`, zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto', position: isMobile && isNavOpen ? 'absolute' : 'relative', height: '100%', top: 0, left: 0 }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: V3.textTertiary }}>MENU</span>
              <button onClick={() => setIsNavOpen(false)} style={{ background: 'transparent', border: 'none', color: V3.textTertiary, cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
              {navSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: V3.textTertiary }}>{section.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {section.items.map((item, i) => (
                      <div key={i}>
                        <button onClick={() => item.submenu ? toggleSubmenu(item.id) : handleNav(item.id, 'crossfade' as any)} className="btn-smooth-hover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', background: activeSection === item.id ? 'rgba(0, 209, 193, 0.1)' : 'transparent', color: activeSection === item.id ? V3.textPrimary : V3.textSecondary }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><item.icon size={18} color={activeSection === item.id ? V3.tealLight : V3.textTertiary} /><span style={{ fontSize: '13px', fontWeight: activeSection === item.id ? 600 : 500 }}>{item.label}</span></div>
                          {item.submenu && (expandedMenus[item.id] ? <ChevronDown size={14} color={V3.textTertiary} /> : <ChevronRight size={14} color={V3.textTertiary} />)}
                        </button>
                        {item.submenu && expandedMenus[item.id] && (
                          <div style={{ paddingLeft: '24px', marginTop: '4px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '21px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {item.submenu.map((sub, sIdx) => (
                              <button key={sIdx} onClick={() => handleNav(sub.id, 'crossfade' as any)} className="btn-smooth-hover" style={{ display: 'block', width: '100%', padding: '8px 12px', fontSize: '12px', color: activeSection === sub.id ? V3.textPrimary : V3.textSecondary, background: activeSection === sub.id ? 'rgba(0, 209, 193, 0.08)' : 'transparent', border: 'none', textAlign: 'left', borderRadius: '6px', cursor: 'pointer' }}>{sub.label}</button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: V3.glass2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color={V3.textSecondary} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary }}>Admin</span><span onClick={() => { if(document.startViewTransition) document.startViewTransition(() => onLogout()); else onLogout(); }} style={{ fontSize: '11px', color: V3.textTertiary, cursor: 'pointer' }}>Logout</span></div>
            </div>
          </nav>

          {/* MAIN CONTENT WRAPPER - VIEW TRANSITION ANCHOR */}
          <div className="v3-main-content no-scrollbar" style={{ flex: 1, padding: isMobile ? '20px' : '0 40px', overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CORE WORKSPACE VIEWS
// ============================================================
const PolicyLibraryView = ({ navigate }: { navigate: (id: string, dir?: 'forward' | 'back') => void }) => (
  <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '24px', paddingBottom: '32px' }}>
    <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
      <span className="v3-neon-orange" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>COMPLIANCE EXECUTION</span>
      <h1 style={{ fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Policy Library</h1>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {[
        { id: 'GV-GB-001', title: 'Governing Body Authority & Responsibilities', domain: 'Governance', owner: 'Board Secretary' },
        { id: 'POL-CL-002', title: 'Plan of Care Development', domain: 'Clinical', owner: 'S. Caldwell' },
      ].map((policy) => (
        <div key={policy.id} onClick={() => navigate('policy-detail', 'forward')} className="v3-invisible-glare" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, fontFamily: 'monospace', color: V3.textTertiary }}>{policy.id}</span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '4px 10px', borderRadius: '6px', background: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight }}>APPROVED</span>
          </div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{policy.title}</h4>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.tealLight, letterSpacing: '0.4px' }}>{policy.domain}</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: V3.textTertiary }}>Owner: {policy.owner}</span>
            <ArrowRight size={14} color={V3.textTertiary} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================
// GVGB DETAIL VIEW
// ============================================================
const GVGBDetailView = ({ navigate }: { navigate: (id: string, dir?: 'forward' | 'back') => void }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigateToTab = (tabId: string) => {
    if (tabId === activeTab) return;
    if (document.startViewTransition) {
      document.startViewTransition(() => setActiveTab(tabId));
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sticky Header with view-transition-name locking */}
      <div style={{ viewTransitionName: 'policy-nav-header', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px', paddingTop: '24px' }}>
        <button onClick={() => navigate('policy', 'back')} className="btn-smooth-hover" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: V3.textSecondary, cursor: 'pointer', padding: 0, fontSize: '12px', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Back to Library
        </button>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.tealLight, letterSpacing: '0.6px', display: 'block', marginBottom: '8px' }}>{POLICY_META.domain}</span>
          <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{POLICY_META.title}</h1>
        </div>

        {/* Main Tabs */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderTop: `1px solid ${V3.glass2}`, paddingTop: '16px' }}>
          {[
            { id: 'overview', label: 'Overview & Definitions', icon: Info },
            { id: 'statements', label: 'Policy Statements', icon: Shield },
            { id: 'procedures', label: 'Procedures', icon: Settings },
            { id: 'documentation', label: 'Documentation', icon: FileText },
            { id: 'compliance', label: 'Compliance & Audit', icon: CheckSquare },
            { id: 'references', label: 'References & Admin', icon: Archive },
            { id: 'appendices', label: 'Appendices (Forms)', icon: LayoutList },
          ].map((tab) => (
            <button key={tab.id} onClick={() => navigateToTab(tab.id)} className="btn-smooth-hover" style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.04)' : 'transparent',
              border: activeTab === tab.id ? `1px solid rgba(255,255,255,0.15)` : '1px solid transparent',
              color: activeTab === tab.id ? V3.textPrimary : V3.textTertiary,
            }}>
              <tab.icon size={14} color={activeTab === tab.id ? V3.tealLight : V3.textTertiary} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content Area with Crossfade transition */}
      <div className="no-scrollbar" style={{ viewTransitionName: 'policy-content', flex: 1, overflowY: 'auto', paddingTop: '24px', paddingBottom: '32px' }}>

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="v3-invisible-glare" style={{ padding: '24px', border: `1px solid ${V3.borderDefault}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[ { l: 'Policy ID', v: POLICY_META.id }, { l: 'Tier', v: POLICY_META.tier }, { l: 'Version', v: POLICY_META.version }, { l: 'Effective', v: POLICY_META.effective }, { l: 'Last Reviewed', v: POLICY_META.lastReviewed }, { l: 'Next Review', v: POLICY_META.nextReviewDate } ].map(m => (
                <div key={m.l} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}><span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary }}>{m.l}</span><span style={{ fontSize: '13px', fontWeight: 500, color: V3.textPrimary }}>{m.v}</span></div>
              ))}
            </div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Shield size={18} /> Purpose <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} /></h2>
              <p style={{ fontSize: '14px', color: V3.textSecondary, lineHeight: 1.6, margin: 0 }}>This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in <strong>42 CFR § 484.105</strong>.</p>
            </div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Info size={18} /> Key Definitions <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} /></h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {DEFINITIONS.map((def) => (
                  <div key={def.term} className="v3-invisible-glare" style={{ padding: '16px', border: `1px solid rgba(255,255,255,0.08)` }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, display: 'block', marginBottom: '6px' }}>{def.term}</span>
                    <span style={{ fontSize: '13px', color: V3.textSecondary, lineHeight: 1.5 }}>{def.def}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {POLICY_STATEMENTS.map((stmt, idx) => (
              <div key={idx} style={{ padding: '20px 0', borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', gap: '20px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,209,193,0.1)', color: V3.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>4.{idx + 1}</div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: V3.textPrimary, lineHeight: 1.6 }}>{stmt.substring(4)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'procedures' && (
          <ProcedureSubTabs />
        )}

        {activeTab === 'compliance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><CheckSquare size={18} /> How Compliance Is Measured <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} /></h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', padding: '12px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  {['Compliance Indicator', 'Measurement Method', 'Acceptable Standard'].map(h => <span key={h} style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary }}>{h}</span>)}
                </div>
                {COMPLIANCE_81.map((row, i) => (
                  <div key={i} className="v3-invisible-glare" style={{ display: 'flex', padding: '14px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {row.map((c, j) => <span key={j} style={{ flex: 1, fontSize: '13px', color: j === 0 ? V3.textPrimary : V3.textSecondary }}>{c}</span>)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: V3.orangeLight, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><AlertTriangle size={18} /> Common Failure Points <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} /></h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {COMPLIANCE_83.map((item, i) => (
                  <div key={i} className="v3-invisible-glare" style={{ padding: '16px 20px', border: `1px solid rgba(255,160,89,0.2)` }}>
                    <p style={{ fontWeight: 600, color: V3.orangeLight, fontSize: '14px', margin: '0 0 8px 0' }}>{item[0]}</p>
                    <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '0 0 8px 0' }}><strong style={{color: V3.textPrimary}}>Risk:</strong> {item[1]}</p>
                    <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0 }}><strong style={{color: V3.textPrimary}}>Mitigation:</strong> {item[2]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'documentation' || activeTab === 'references' || activeTab === 'appendices') && (
          <StubView icon={FileText} label={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
        )}
      </div>
    </div>
  );
};

// Sub-component to manage Procedure Tab transitions cleanly
const ProcedureSubTabs = () => {
  const [activeSub, setActiveSub] = useState('6.1');
  const handleSubNav = (id: string) => {
    if (id === activeSub) return;
    if (document.startViewTransition) document.startViewTransition(() => setActiveSub(id));
    else setActiveSub(id);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {[ { id: '6.1', l: '6.1 Establishment' }, { id: '6.2', l: '6.2 Core Responsibilities' }, { id: '6.3', l: '6.3 Meetings' } ].map((tab) => (
          <button key={tab.id} onClick={() => handleSubNav(tab.id)} className="btn-smooth-hover" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', background: activeSub === tab.id ? 'rgba(0,209,193,0.1)' : 'transparent', border: activeSub === tab.id ? `1px solid ${V3.tealLight}` : '1px solid transparent', color: activeSub === tab.id ? V3.textPrimary : V3.textSecondary }}>{tab.l}</button>
        ))}
      </div>
      <div style={{ viewTransitionName: 'procedures-content' }}>
        {(activeSub === '6.1' || activeSub === '6.2') && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '12px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              {['Step', 'Responsible', 'Action', 'Timeframe'].map(h => <span key={h} style={{ flex: h === 'Action' ? 3 : 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary }}>{h}</span>)}
            </div>
            {PROCEDURES[activeSub].map((row, i) => (
              <div key={i} className="v3-invisible-glare" style={{ display: 'flex', padding: '14px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {row.map((c, j) => <span key={j} style={{ flex: j === 2 ? 3 : 1, fontSize: '13px', color: j === 0 ? V3.tealLight : V3.textSecondary, lineHeight: 1.4 }}>{c}</span>)}
              </div>
            ))}
          </div>
        )}
        {activeSub === '6.3' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', padding: '12px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              {['Step', 'Responsible', 'Action', 'Timeframe'].map(h => <span key={h} style={{ flex: h === 'Action' ? 3 : 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary }}>{h}</span>)}
            </div>
            {PROCEDURES['6.3'].map((row, i) => (
              <div key={i} className="v3-invisible-glare" style={{ display: 'flex', padding: '14px 16px', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {row.map((c, j) => <span key={j} style={{ flex: j === 2 ? 3 : 1, fontSize: '13px', color: j === 0 ? V3.tealLight : V3.textSecondary, lineHeight: 1.4 }}>{c}</span>)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// MAIN APPLICATION ENTRY POINT
// ============================================================
export default function V3_2StagingApp() {
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1920 : window.innerWidth);
  const isMobile = viewportWidth < 768;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isPlannerView, setIsPlannerView] = useState(false);

  useLayoutEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!isAuthenticated) return <><GlobalStylesheetInjector /><LoginScreen onLogin={() => setIsAuthenticated(true)} /></>;

  const navigate = (id: string, direction?: 'forward' | 'back') => {
    if (activeSection === id) return;
    const update = () => setActiveSection(id);
    if (document.startViewTransition) {
      if (direction) document.documentElement.dataset.vtDirection = direction;
      const transition = document.startViewTransition(update);
      transition.finished.then(() => { delete document.documentElement.dataset.vtDirection; });
    } else {
      update();
    }
    if (isMobile) setIsNavOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return isPlannerView
        ? <PlannerWorkspace tasks={INITIAL_PLANNED_TASKS} isMobile={isMobile} />
        : <DashboardWorkspace setIsPlannerView={setIsPlannerView} isMobile={isMobile} />;
      case 'clinicians': return <ClinicianProfilesView />;
      case 'patients': return <PatientProfilesView />;
      case 'calendar': return <CalendarView />;
      case 'policy': return <PolicyLibraryView navigate={navigate} />;
      case 'policy-detail': return <GVGBDetailView navigate={navigate} />;
      default: return (
        <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '20px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600 }}>{activeSection.toUpperCase()}</h1>
          <p style={{ color: V3.textSecondary }}>Route not found or under construction.</p>
        </div>
      );
    }
  };

  return (
    <ShellContentFrame
      isMobile={isMobile}
      activeSection={activeSection}
      isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen}
      isPlannerView={isPlannerView} setIsPlannerView={setIsPlannerView}
      onLogout={() => setIsAuthenticated(false)}
      handleNav={navigate}
    >
      {renderContent()}
    </ShellContentFrame>
  );
}
