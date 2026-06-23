import React, { useState, useEffect } from 'react';
import BorderGlow from '../../../src/policy/pages/Redesign/__components__/BorderGlow.jsx';
import {
  LayoutDashboard,
  Users,
  Heart,
  CalendarDays,
  Sparkles,
  ClipboardCheck,
  Network,
  UserCheck,
  FileEdit,
  FolderOpen,
  ArrowUpCircle,
  HelpCircle,
  PlayCircle,
  ShieldAlert,
  Search,
  Settings,
  MoreHorizontal,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Plus,
  Check,
  FileText,
  Filter,
  Info,
  Clock,
  Printer,
  Download,
  History,
  Lock,
  ChevronDown,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

// ==========================================
// STATIC SEED DATA
// ==========================================
const PRIMARY_POLICY = {
  id: 'GV-GB-001',
  title: 'Governing Body Authority & Responsibilities',
  activeDot: '#C74601',
  tier: 'REQUIRED',
  domain: 'GV — Governance & Administration',
  approvedBy: 'Governing Body Chair — Care Indeed Home Health Care, Inc.',
  supersedes: 'N/A (Initial Version)',
  effectiveDate: '2025-07-10',
  lastReviewed: '2025-07-10',
  nextReview: '2026-07-10',
  version: 'v6.0',
  purpose: 'This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in 42 CFR § 484.105 — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency\'s overall operation and management.',
  scope: [
    'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
    'The Agency Administrator',
    'The Director of Nursing / Clinical Manager',
    'The Compliance Officer',
    'All senior leadership personnel who report directly to the Governing Body or Administrator',
    'All contracted management entities performing governing body functions on behalf of the agency'
  ],
  definitions: [
    { term: 'Governing Body', definition: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
    { term: 'Administrator', definition: 'The individual appointed by the Governing Body who is responsible for managing the agency\'s day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law.' },
    { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance.' },
    { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring.' }
  ],
  statements: [
    { num: '4.1', text: 'Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).' },
    { num: '4.2', text: 'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.' },
    { num: '4.3', text: 'The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002.' },
    { num: '4.4', text: 'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).' }
  ],
  procedures: [
    { step: '6.1.1', party: 'Agency Owner / Corporate Entity', action: 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument.', timeframe: 'Prior to initial Medicare certification and maintained continuously thereafter.' },
    { step: '6.1.2', party: 'Governing Body Chair', action: 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status.', timeframe: 'Updated within 7 calendar days of any membership change.' }
  ],
  documentation: [
    { req: 'Governing Body establishment', document: 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument.', party: 'Agency Owner', location: 'Corporate records repository.', timeframe: 'Maintained permanently; updated within 14 days of change.' },
    { req: 'Governing Body membership roster', document: 'Current roster including member name, role, appointment date, term, voting status.', party: 'Governing Body Chair', location: 'Agency governance file.', timeframe: 'Updated within 7 days of change.' }
  ],
  linkedForms: [
    { id: 'GV-FM-004', title: 'Governing Body Meeting Agenda Template' },
    { id: 'GV-FM-005', title: 'Governing Body Meeting Minutes Template' },
    { id: 'GV-FM-006', title: 'Conflict of Interest Disclosure Form', interactive: true },
    { id: 'GV-FM-008', title: 'Governing Body Annual Self-Assessment Tool', interactive: true }
  ]
};

const DOMAINS = [
  { id: 'GV', label: 'Governance', desc: 'Agency administration, governing body directives, and legal structures.' },
  { id: 'CL', label: 'Clinical Ops', desc: 'Clinical policies, care delivery standards, and nurse regulations.' },
  { id: 'QA', label: 'QAPI', desc: 'Quality assurance and performance improvement programs.' },
  { id: 'HR', label: 'Human Res.', desc: 'Credentialing, staff training, and competency checklists.' },
  { id: 'CO', label: 'Compliance', desc: 'Corporate compliance, HIPAA rules, and audit readiness.' },
  { id: 'FN', label: 'Finance', desc: 'Billing rules, budgets, and financial controls.' }
];

const POLICIES_LIST = [
  { id: 'GV-GB-001', title: 'Governing Body Authority & Responsibilities', domain: 'Governance', status: 'Approved', version: 'v6.0', tier: 'REQUIRED' },
  { id: 'GV-GB-002', title: 'Governing Body Meetings & Minutes', domain: 'Governance', status: 'Approved', version: 'v2.1', tier: 'REQUIRED' },
  { id: 'CL-CA-001', title: 'Patient Assessment - Comprehensive', domain: 'Clinical Ops', status: 'Approved', version: 'v4.0', tier: 'REQUIRED' },
  { id: 'CL-OA-002', title: 'OASIS Data Collection & Accuracy', domain: 'Clinical Ops', status: 'In Review', version: 'v3.2', tier: 'CRITICAL' },
  { id: 'QA-PG-001', title: 'QAPI Program Framework', domain: 'QAPI', status: 'Approved', version: 'v5.0', tier: 'REQUIRED' },
  { id: 'HR-TA-003', title: 'Exclusion Check Verification Protocol', domain: 'Human Res.', status: 'Approved', version: 'v3.0', tier: 'REQUIRED' },
  { id: 'CO-CP-001', title: 'Corporate Compliance Program Plan', domain: 'Compliance', status: 'Draft', version: 'v1.0', tier: 'CRITICAL' }
];

const FORMS_LIST = [
  { id: 'EN-FM-001', title: 'Universal Policy Acknowledgment Form', type: 'Attestation', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', accountability: 'Administrator' },
  { id: 'EN-FM-002', title: 'Master Policy Index / Taxonomy Register', type: 'Tracking Tool', severity: 'MASTER TEMPLATE', status: 'REQUIRED', accountability: 'Director of QA' },
  { id: 'EN-FM-003', title: 'Policy Classification Tier Matrix', type: 'Matrix', severity: 'MASTER TEMPLATE', status: 'REQUIRED', accountability: 'Clinical Manager' },
  { id: 'EN-FM-004', title: 'Domain Owner Assignment Roster', type: 'Tracking Tool', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', accountability: 'Compliance Officer' },
  { id: 'GV-FM-006', title: 'Conflict of Interest Disclosure Form', type: 'Interactive Signature', severity: 'AUDIT CRITICAL', status: 'REQUIRED', accountability: 'Compliance Officer' },
  { id: 'GV-FM-008', title: 'Governing Body Annual Self-Assessment Tool', type: 'Assessment', severity: 'AUDIT CRITICAL', status: 'REQUIRED', accountability: 'Governing Body Chair' }
];

const BOARD_ITEMS = {
  critical: [
    { id: 'CE-T-210', title: 'Update GV-GB-004 annual budget attestation', domain: 'Governance', owner: 'Finance Lead', due: '1 day overdue' },
    { id: 'CE-T-155', title: 'Q2 clinical record audit files', domain: 'Clinical Ops', owner: 'QAPI Nurse', due: 'Overdue' }
  ],
  risk: [
    { id: 'RS-481', title: 'Credential expiration warnings for OT', domain: 'Human Res.', owner: 'HR Coordinator', due: 'Expires in 3 days' }
  ],
  progress: [
    { id: 'WF-CE-15', title: 'Medication reconciliation logs review', domain: 'Clinical Ops', owner: 'Maria Delgado', due: 'In progress' }
  ],
  pending: [
    { id: 'EV-4491', title: 'Governing Body meeting signature seal', domain: 'Governance', owner: 'Administrator', due: 'Awaiting signature' }
  ]
};

// ==========================================
// CORE LAYOUT COMPONENTS
// ==========================================
export default function V5LightReferenceApp() {
  const [currentPage, setCurrentPage] = useState('login'); // login | forgot-password | dashboard | calendar | journey | workloads | policies | forms | viewer | designs-gallery
  const [deviceMode, setDeviceMode] = useState('desktop'); // desktop | mobile for web/mobile previews
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [activePolicyTab, setActivePolicyTab] = useState('overview');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Keep HTML class in sync
  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'v3-veil' : 'care-indeed-light';
  }, [isDarkMode]);

  const handleLogin = (e) => {
    e.preventDefault();
    showToast('Logged in successfully!');
    setCurrentPage('dashboard');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your email!', 'info');
    setCurrentPage('login');
  };

  // Styles computed based on theme
  const themeClasses = isDarkMode ? {
    bg: 'bg-[#0B0F15]',
    text: 'text-slate-200',
    textMuted: 'text-[#8A94A6]',
    textPrimary: 'text-white',
    cardBg: 'bg-[#141A23]',
    cardBorder: 'border-[#1C2433]',
    sidebarBg: 'bg-[#141A23]',
    sidebarBorder: 'border-[#1C2433]',
    headerBg: 'bg-[#141A23]/80',
    headerBorder: 'border-[#1C2433]',
    inputBg: 'bg-[#141A23]',
    inputBorder: 'border-[#1C2433]',
    pillBg: 'bg-[#1C2433] text-slate-300',
    btnPrimary: 'bg-[#00797D] text-white hover:bg-[#009085]',
    accentColor: 'text-[#007970]',
    badgeBg: 'bg-[#1C2433] border-[#1C2433]',
    spotlightGlow: 'rgba(0, 121, 112, 0.15)'
  } : {
    bg: 'bg-[#F4F8F7]',
    text: 'text-[#356D70]',
    textMuted: 'text-[#527679]',
    textPrimary: 'text-[#063F43]',
    cardBg: 'bg-white/75 backdrop-blur-md',
    cardBorder: 'border-white/90 shadow-[0_8px_32px_0_rgba(0,121,125,0.03)]',
    sidebarBg: 'bg-white',
    sidebarBorder: 'border-slate-100',
    headerBg: 'bg-white/80',
    headerBorder: 'border-slate-100',
    inputBg: 'bg-white',
    inputBorder: 'border-slate-200',
    pillBg: 'bg-[#FAFBF8] text-[#356D70] border border-slate-100',
    btnPrimary: 'bg-[#00797D] text-white hover:bg-[#005B5E]',
    accentColor: 'text-[#00797D]',
    badgeBg: 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20',
    spotlightGlow: 'rgba(0, 121, 125, 0.08)'
  };

  const currentTheme = isDarkMode ? 'dark' : 'light';

  // Filters
  const filteredPolicies = POLICIES_LIST.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'ALL' || p.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const filteredForms = FORMS_LIST.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Render Login view
  if (currentPage === 'login') {
    return (
      <div className={cx("min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300", themeClasses.bg)}>
        {/* Toggle dark/light mode on login page */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={cx("absolute top-6 right-6 p-2 rounded-full border transition-all", themeClasses.cardBg, themeClasses.cardBorder)}
          title="Toggle Day/Dark mode"
        >
          {isDarkMode ? <Sun className="text-amber-400" size={20} /> : <Moon className="text-slate-700" size={20} />}
        </button>

        <div className={cx("w-full max-w-md p-8 rounded-3xl border transition-all duration-300", themeClasses.cardBg, themeClasses.cardBorder)}>
          <div className="flex flex-col items-center mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E56E2E]">HomeHealth Command</span>
            <h2 className="text-3xl font-black mt-2 font-montserrat tracking-tight text-center" style={{ color: isDarkMode ? '#white' : '#063F43' }}>
              Care Indeed
            </h2>
            <p className={cx("text-xs mt-2 text-center", themeClasses.textMuted)}>
              Policies & Procedures Portal. Turn day-mode layout into live prototype.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className={cx("block text-xs font-bold uppercase mb-2", themeClasses.textMuted)}>Email Address</label>
              <input
                type="email"
                defaultValue="dee.bustos@careindeed.com"
                required
                className={cx("w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00797D]/50 transition-all", themeClasses.inputBg, themeClasses.inputBorder, themeClasses.textPrimary)}
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className={cx("text-xs font-bold uppercase", themeClasses.textMuted)}>Password</label>
                <button
                  type="button"
                  onClick={() => setCurrentPage('forgot-password')}
                  className="text-xs font-semibold text-[#E56E2E] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                defaultValue="••••••••••••"
                required
                className={cx("w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00797D]/50 transition-all", themeClasses.inputBg, themeClasses.inputBorder, themeClasses.textPrimary)}
              />
            </div>

            <button
              type="submit"
              className={cx("w-full py-3.5 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5", themeClasses.btnPrimary)}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Forgot Password view
  if (currentPage === 'forgot-password') {
    return (
      <div className={cx("min-h-screen flex items-center justify-center p-4 transition-colors duration-300", themeClasses.bg)}>
        <div className={cx("w-full max-w-md p-8 rounded-3xl border transition-all duration-300", themeClasses.cardBg, themeClasses.cardBorder)}>
          <div className="flex flex-col items-center mb-8">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#E56E2E]">Recovery System</span>
            <h2 className="text-3xl font-black mt-2 font-montserrat tracking-tight text-center" style={{ color: isDarkMode ? '#white' : '#063F43' }}>
              Reset Password
            </h2>
            <p className={cx("text-xs mt-2 text-center", themeClasses.textMuted)}>
              Provide your registered email to receive a secure recovery code.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className={cx("block text-xs font-bold uppercase mb-2", themeClasses.textMuted)}>Email Address</label>
              <input
                type="email"
                placeholder="dee.bustos@careindeed.com"
                required
                className={cx("w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#00797D]/50 transition-all", themeClasses.inputBg, themeClasses.inputBorder, themeClasses.textPrimary)}
              />
            </div>

            <button
              type="submit"
              className={cx("w-full py-3.5 rounded-xl font-bold transition-all shadow-md transform hover:-translate-y-0.5", themeClasses.btnPrimary)}
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('login')}
              className="w-full text-center text-xs font-bold uppercase tracking-wider text-[#356D70] hover:underline block pt-2"
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // APP SHELL (for Dashboard, Framework, Policies, Forms, Policy Viewer)
  return (
    <div className={cx("min-h-screen flex flex-col transition-colors duration-300", themeClasses.bg)}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border animate-bounce bg-white border-slate-100">
          <Info size={16} className="text-[#00797D]" />
          <span className="text-xs font-bold text-[#0f172a]">{toast.message}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <header className={cx("sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b transition-colors duration-300", themeClasses.headerBg, themeClasses.headerBorder)}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2"
          >
            <span className="text-sm font-black uppercase tracking-wider text-[#f97316] font-montserrat logo-orange">CareIndeed</span>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#0d9488] bg-[#f0fdfa] px-2 py-0.5 rounded border border-[#0d9488]/20">V5 Light</span>
          </button>
          <button onClick={() => setCurrentPage('designs-gallery')} className="ml-3 text-[10px] px-2 py-0.5 rounded border text-[#64748b] hover:text-[#0f172a] border-[#e2e8f0]">Designs</button>
        </div>

        {/* Global Navigation (Tabs) - matched to light mode designs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/60 p-1 rounded-full border border-slate-200/50">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'calendar', label: 'Calendar', icon: CalendarDays },
            { id: 'journey', label: 'Journey', icon: Users },
            { id: 'workloads', label: 'Workloads', icon: ClipboardCheck },
            { id: 'policies', label: 'Policies', icon: FolderOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentPage(tab.id)}
              className={cx(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                currentPage === tab.id
                  ? "bg-white text-[#0d9488] shadow-[0_4px_12px_rgba(0,121,125,0.08)]"
                  : "text-[#475569] hover:text-[#0f172a]"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Day/Night Theme Switcher + Web/Mobile device preview */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200/50">
            <button
              onClick={() => setIsDarkMode(false)}
              className={cx("p-1.5 rounded-full transition-all", !isDarkMode ? "bg-white text-[#0d9488] shadow-sm" : "text-[#475569]")}
              title="Day Mode"
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => setIsDarkMode(true)}
              className={cx("p-1.5 rounded-full transition-all", isDarkMode ? "bg-white text-[#0d9488] shadow-sm" : "text-[#475569]")}
              title="Dark Mode"
            >
              <Moon size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-full border border-slate-200/50 ml-2 text-xs">
            <button onClick={() => setDeviceMode('desktop')} className={cx("px-3 py-1 rounded-full", deviceMode === 'desktop' ? 'bg-white shadow text-[#0f172a]' : 'text-[#64748b]')}>Web</button>
            <button onClick={() => setDeviceMode('mobile')} className={cx("px-3 py-1 rounded-full", deviceMode === 'mobile' ? 'bg-white shadow text-[#0f172a]' : 'text-[#64748b]')}>Mobile</button>
          </div>

          {/* User Profile Trigger */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="w-8 h-8 rounded-full bg-[#E56E2E] text-white flex items-center justify-center font-bold text-xs">
              RP
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-[#063F43]">Robert Patel</span>
              <span className="block text-[9px] font-semibold text-[#527679]">Clinical Manager</span>
            </div>
            <button
              onClick={() => setCurrentPage('login')}
              className={cx("p-2 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all", themeClasses.textMuted)}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* VIEW CONTAINER - supports web/mobile device preview */}
      <main className={cx(
        "flex-1 px-6 py-8 mx-auto w-full",
        deviceMode === 'mobile' ? "max-w-[380px] px-2" : "max-w-7xl"
      )}>
        {deviceMode === 'mobile' && (
          <div className="text-center text-[10px] text-[#64748b] mb-2 font-mono tracking-widest">MOBILE PREVIEW (from designs)</div>
        )}
        {/* DASHBOARD VIEW - Polished to match light mode designs (web + mobile) */}
        {currentPage === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-[1.5px] text-[#f97316]">CareIndeed</span>
                <h1 className="text-3xl font-black mt-1 tracking-tighter" style={{ color: isDarkMode ? 'white' : '#0f172a' }}>
                  Dashboard
                </h1>
                <p className={cx("text-xs mt-1", themeClasses.textMuted)}>
                  Command surface for compliance, evidence, and execution.
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="text-[#64748b]">Today</div>
                <div className="font-semibold" style={{ color: isDarkMode ? '#fff' : '#0f172a' }}>June 17, 2026</div>
              </div>
            </div>

            {/* Metrics from designs (light mode) */}
            <div className={cx("grid gap-4", deviceMode === 'mobile' ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
              {[
                { label: 'Compliance Rate', value: '98.7%', sub: '↑ 2.1% this week', color: '#0d9488' },
                { label: 'Active Cases', value: '245', sub: '18 overdue', color: '#0f172a' },
                { label: 'Audit Readiness', value: '94%', sub: '3 items pending', color: '#0d9488' },
                { label: 'Evidence Locked', value: '87', sub: 'This sprint', color: '#f97316' }
              ].map((m, idx) => (
                <div key={idx} className="v5-light-card p-5 border">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">{m.label}</div>
                  <div className="text-4xl font-black mt-1 tracking-tighter" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-2 text-[#64748b]">{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Task Overview + Quick Actions - matching designs */}
            <div className={cx("grid gap-4", deviceMode === 'mobile' ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
              <div className="lg:col-span-2 v5-light-card border p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">Task Overview</div>
                  <button onClick={() => setCurrentPage('workloads')} className="text-xs text-[#0d9488] hover:underline">View all →</button>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { title: 'QAPI milestone review', due: 'Due next Tuesday', owner: 'QAPI Lead' },
                    { title: 'Incident / Adverse Event Review', due: 'Overdue by 1 day', owner: 'Clinical Manager' },
                    { title: 'Approve clinician competency framework', due: 'Overdue by 4 hours', owner: 'Director of Nursing' }
                  ].map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-[#f8fafc] text-xs">
                      <div>
                        <span className="font-medium">{t.title}</span>
                        <span className="ml-2 text-[#f97316]">{t.due}</span>
                      </div>
                      <div className="text-[#64748b]">{t.owner}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="v5-light-card border p-5">
                <div className="font-semibold text-sm mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <button onClick={() => setCurrentPage('calendar')} className="btn-orange w-full text-xs py-2">Open Calendar</button>
                  <button onClick={() => setCurrentPage('journey')} className="w-full text-xs py-2 border rounded hover:bg-[#f1f5f9]">Continue Journey Modules</button>
                  <button onClick={() => setCurrentPage('designs-gallery')} className="w-full text-xs py-2 border rounded hover:bg-[#f1f5f9]">View All Design Files</button>
                </div>
              </div>
            </div>

            {/* Brad assistant teaser - light version */}
            <div className="v5-light-card border p-4 flex gap-3">
              <div className="w-8 h-8 rounded bg-[#f97316] text-white flex items-center justify-center text-sm shrink-0">B</div>
              <div className="text-xs flex-1">
                <div className="font-semibold">Brad — Command Assistant</div>
                <div className="text-[#475569] mt-0.5">“98.7% compliance rate this period. 2 signatures pending for GV-GB-001.”</div>
                <button onClick={() => showToast('Brad panel would open here')} className="text-[#0d9488] text-xs font-semibold hover:underline mt-1">Ask Brad</button>
              </div>
            </div>

            {deviceMode === 'mobile' && (
              <div className="text-center text-[10px] text-[#94a3b8]">Mobile layout uses stacked cards (see designs)</div>
            )}
          </div>
        )}

        {/* FRAMEWORK VIEW */}
        {currentPage === 'framework' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E56E2E]">Strategic Architecture</span>
              <h1 className="text-3xl font-black mt-1 font-montserrat tracking-tight" style={{ color: isDarkMode ? 'white' : '#063F43' }}>
                Taxonomy Framework
              </h1>
              <p className={cx("text-xs mt-1", themeClasses.textMuted)}>
                Comprehensive mapping of clinical, governance, and operational rules in Home Health Care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DOMAINS.map((d, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDomain(d.label);
                    setCurrentPage('policies');
                  }}
                  className={cx("p-6 rounded-2xl border hover:border-[#00797D]/40 transition-all cursor-pointer", themeClasses.cardBg, themeClasses.cardBorder)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-[#00797D]/10 text-[#00797D] flex items-center justify-center font-bold font-mono">
                      {d.id}
                    </span>
                    <h3 className="text-base font-black text-[#063F43] font-montserrat">{d.label}</h3>
                  </div>
                  <p className="text-xs text-[#527679] mt-3 leading-relaxed">{d.desc}</p>
                  <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-xs font-bold text-[#00797D]">
                    <span>View associated policies</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POLICIES LIBRARY VIEW */}
        {currentPage === 'policies' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E56E2E]">Regulatory Library</span>
                <h1 className="text-3xl font-black mt-1 font-montserrat tracking-tight" style={{ color: isDarkMode ? 'white' : '#063F43' }}>
                  Policy Library Register
                </h1>
                <p className={cx("text-xs mt-1", themeClasses.textMuted)}>
                  All approved and draft policies mapped to ACHC and state regulatory standards.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-[#063F43] focus:outline-none"
                >
                  <option value="ALL">All Domains</option>
                  <option value="Governance">Governance</option>
                  <option value="Clinical Ops">Clinical Ops</option>
                  <option value="QAPI">QAPI</option>
                  <option value="Human Res.">Human Res.</option>
                  <option value="Compliance">Compliance</option>
                </select>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search policies..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00797D]/50"
                  />
                </div>
              </div>
            </div>

            {/* List */}
            <div className={cx("rounded-2xl border overflow-hidden", themeClasses.cardBg, themeClasses.cardBorder)}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-[#527679] uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Domain</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Version</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPolicies.map((p, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          if (p.id === 'GV-GB-001') {
                            setCurrentPage('viewer');
                          } else {
                            showToast(`Navigating to viewer for ${p.id}`, 'info');
                          }
                        }}
                        className="hover:bg-[#FAFBF8] transition-colors cursor-pointer text-xs"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-[#00797D]">{p.id}</td>
                        <td className="px-6 py-4 font-bold text-[#063F43]">{p.title}</td>
                        <td className="px-6 py-4 font-semibold text-[#527679]">{p.domain}</td>
                        <td className="px-6 py-4">
                          <span className={cx("px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide", p.tier === 'REQUIRED' ? 'bg-orange-50 text-[#E56E2E] border border-orange-100' : 'bg-slate-100 text-slate-600')}>
                            {p.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cx("px-2 py-0.5 rounded-full text-[9px] font-bold", p.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : p.status === 'In Review' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600')}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#6D8B8D] font-medium">{p.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FORMS REGISTER VIEW */}
        {currentPage === 'forms' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E56E2E]">Operational Assets</span>
                <h1 className="text-3xl font-black mt-1 font-montserrat tracking-tight" style={{ color: isDarkMode ? 'white' : '#063F43' }}>
                  Forms Library Register
                </h1>
                <p className={cx("text-xs mt-1", themeClasses.textMuted)}>
                  Standard attestation, tracking, and clinical sheets with digital signature sealing.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search forms..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#00797D]/50"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map((f, idx) => (
                <div
                  key={idx}
                  className={cx("p-5 rounded-2xl border flex flex-col justify-between transition-all relative group", themeClasses.cardBg, themeClasses.cardBorder)}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[9px] font-mono text-[#00797D] font-bold">{f.id}</span>
                      <span className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold">
                        {f.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#063F43] mt-3 group-hover:text-[#00797D] transition-colors leading-snug">
                      {f.title}
                    </h3>
                    <p className="text-[10px] text-[#527679] mt-2 font-medium">Type: {f.type} | Severity: {f.severity}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 mt-5 pt-3">
                    <span className="text-[10px] text-[#6D8B8D]">Accountability: <span className="font-bold text-[#063F43]">{f.accountability}</span></span>
                    <button
                      onClick={() => {
                        showToast(`Opened interactive form signature flow for ${f.id}`, 'info');
                        setCurrentPage('viewer');
                        setActivePolicyTab('appendices');
                      }}
                      className="text-xs font-bold text-[#E56E2E] hover:underline flex items-center gap-1"
                    >
                      Fill Form <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CALENDAR - matches designs (web + mobile) */}
        {currentPage === 'calendar' && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f97316]">CES</span>
              <h1 className="text-3xl font-black mt-1 tracking-tight" style={{ color: isDarkMode ? 'white' : '#0f172a' }}>Calendar</h1>
            </div>

            <div className={cx("grid gap-6", deviceMode === 'mobile' ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3")}>
              {/* Calendar grid */}
              <div className={cx("col-span-2 rounded-2xl border p-6 bg-white", themeClasses.cardBorder)}>
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold">January 2026</div>
                  <div className="flex gap-2 text-xs">
                    <button className="px-2 py-1 rounded bg-[#f1f5f9]">Day</button>
                    <button className="px-2 py-1 rounded bg-[#0d9488] text-white">Month</button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#64748b] mb-2">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {Array.from({length: 35}).map((_, i) => {
                    const day = i - 3;
                    const hasEvent = [2,3,9,10,16,17,23,24].includes(day);
                    return (
                      <div key={i} className={cx("h-12 p-1 border rounded text-left", day > 0 && day < 32 ? "bg-white" : "opacity-30", hasEvent && "bg-[#ccfbf1]")}>
                        {day > 0 && day < 32 && <div>{day}</div>}
                        {hasEvent && <div className="text-[9px] mt-1 text-[#0d9488]">• Event</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Events sidebar */}
              <div className={cx("rounded-2xl border p-4 bg-white", themeClasses.cardBorder)}>
                <div className="font-bold mb-3">Upcoming Events</div>
                {[
                  { staff: 'Nurse Sarah M.', event: 'Wound Care Policy Review', time: '122 compliance ago' },
                  { staff: 'Mary K.', event: 'Staff Signature', time: '13 compliance ago' }
                ].map((e, idx) => (
                  <div key={idx} className="p-3 mb-2 rounded-xl border text-xs bg-[#f8fafc]">
                    <div className="font-semibold">{e.staff}</div>
                    <div>{e.event}</div>
                    <div className="text-[#f97316] text-[10px]">{e.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#64748b]">Mobile version collapses to list + detail card (see designs in /designs folder)</div>
          </div>
        )}

        {/* JOURNEY / MODULE LIST - matches the designs */}
        {currentPage === 'journey' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight">Journey Home / Module List</h1>
                <div className="text-sm text-[#475569] mt-1">Your Journey Progress • Advanced (#007970)</div>
              </div>
              <div className="text-right text-xs">
                Modules Completed: 18/25<br />
                Avg. Assessment Score: 94%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Patient Data Privacy', progress: 80, img: '🔒', status: 'Continue' },
                { title: 'HIPAA Refresher 2026', progress: 60, img: '📋', status: 'Continue' },
                { title: 'Infection Protocols', progress: 100, img: '🧪', status: 'Review' },
                { title: 'Emergency Response', progress: 45, img: '🚨', status: 'Start' }
              ].map((m, i) => (
                <div key={i} className="v5-light-card p-4 border">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-[#f1f5f9] flex items-center justify-center text-xl">{m.img}</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{m.title}</div>
                      <div className="text-[10px] text-[#64748b] mt-1">Progress</div>
                      <div className="progress-bar h-1.5 mt-1"><div style={{width: m.progress + '%'}} /></div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { setCurrentPage('viewer'); showToast('Opened module player'); }} className="btn-orange flex-1 text-xs">{m.status}</button>
                    <button className="px-3 py-1 text-xs border rounded">Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WORKLOADS - from designs */}
        {currentPage === 'workloads' && (
          <div>
            <h1 className="text-3xl font-black mb-4">CES Workloads</h1>
            <div className="space-y-3">
              {['Nurse Sarah M.', 'Therapist John D.'].map((name, i) => (
                <div key={i} className="v5-light-card p-4 flex items-center justify-between border">
                  <div>
                    <div className="font-bold">{name}</div>
                    <div className="text-xs">Compliance Score <span className="font-mono text-[#0d9488]">#00797{ i ? '0' : 'C' }</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#f97316]">Overdue Items: {i + 2}</div>
                    <button className="btn-orange text-xs mt-1">Reassign Tasks</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DESIGNS GALLERY - shows the source files from /designs (web + mobile + any collages) */}
        {currentPage === 'designs-gallery' && (
          <div>
            <h1 className="text-2xl font-black mb-2">Design References (from /designs)</h1>
            <p className="text-xs text-[#64748b] mb-4">These are the light mode web + mobile mockups and any collage-style references you placed here. The prototype above aims to match them.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Gemini_Generated_Image_zgyfqzgyfqzgyfqz.png',
                'Gemini_Generated_Image_zgyfqzgyfqzgyfqz (1).png',
                'Gemini_Generated_Image_zgyfqzgyfqzgyfqz (2).png',
                'Gemini_Generated_Image_zgyfqzgyfqzgyfqz (3).png',
                'Gemini_Generated_Image_zgyfqzgyfqzgyfqz (4).png',
                '56Nkc.jpg', 'h1kN5.jpg', 'm9CX2.jpg', 'R4nFz.jpg'
              ].map((fname, idx) => (
                <div key={idx} className="border rounded-xl overflow-hidden bg-white">
                  <img src={`./designs/${fname}`} alt={fname} className="w-full h-auto" onError={(e) => e.target.style.display='none'} />
                  <div className="p-2 text-[10px] font-mono truncate text-[#64748b]">{fname}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POLICY DETAIL VIEWER (GV-GB-001) */}
        {currentPage === 'viewer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top breadcrumb & Actions bar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold">
                <button onClick={() => setCurrentPage('policies')} className="text-[#527679] hover:underline">
                  Policy Register
                </button>
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-[#00797D] font-mono">{PRIMARY_POLICY.id}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => showToast('PDF Export started', 'info')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                >
                  <Download size={14} /> Export PDF
                </button>
                <button
                  onClick={() => showToast('Printing policy document', 'info')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all bg-[#00797D] hover:bg-[#005B5E]"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* Document display */}
            <div className={cx("p-8 rounded-3xl border transition-all duration-300", themeClasses.cardBg, themeClasses.cardBorder)}>
              <div className="mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E56E2E]">{PRIMARY_POLICY.domain}</span>
                <h1 className="text-3xl font-black mt-1 font-montserrat tracking-tight text-[#063F43]">
                  {PRIMARY_POLICY.title}
                </h1>
                <div className="text-[10px] font-mono text-[#00797D] mt-2 uppercase tracking-widest flex items-center gap-2">
                  POLICY ID: {PRIMARY_POLICY.id}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {PRIMARY_POLICY.version}
                </div>
              </div>

              {/* Viewer tabs */}
              <div className="flex border-b border-slate-100 overflow-x-auto gap-6 mb-8">
                {[
                  { id: 'overview', label: 'Overview & Definitions' },
                  { id: 'statements', label: 'Policy Statements' },
                  { id: 'procedures', label: 'Procedures' },
                  { id: 'documentation', label: 'Documentation' },
                  { id: 'appendices', label: 'Linked Forms / Appendices' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePolicyTab(tab.id)}
                    className={cx(
                      "pb-3 text-xs font-bold tracking-wide transition-all border-b-2 relative whitespace-nowrap",
                      activePolicyTab === tab.id
                        ? "border-[#00797D] text-[#00797D]"
                        : "border-transparent text-[#527679] hover:text-[#063F43]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="text-left">
                {activePolicyTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#00797D]/5 border border-[#00797D]/10">
                      <h3 className="text-sm font-extrabold text-[#063F43] uppercase tracking-wider mb-2">Purpose</h3>
                      <p className="text-xs leading-relaxed text-[#356D70]">{PRIMARY_POLICY.purpose}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#063F43] uppercase tracking-wider mb-3">Scope</h3>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#356D70]">
                          {PRIMARY_POLICY.scope.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-[#063F43] uppercase tracking-wider mb-3">Metadata Info</h3>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block text-[10px] text-[#527679] uppercase font-bold">Approved By</span>
                            <span className="font-bold text-[#063F43]">{PRIMARY_POLICY.approvedBy}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#527679] uppercase font-bold">Effective Date</span>
                            <span className="font-bold text-[#063F43]">{PRIMARY_POLICY.effectiveDate}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#527679] uppercase font-bold">Version Status</span>
                            <span className="font-bold text-[#063F43]">{PRIMARY_POLICY.version}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-[#527679] uppercase font-bold">Next Review</span>
                            <span className="font-bold text-[#063F43]">{PRIMARY_POLICY.nextReview}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePolicyTab === 'statements' && (
                  <div className="space-y-4">
                    {PRIMARY_POLICY.statements.map((s, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-[#FAFBF8] flex gap-4">
                        <span className="w-8 h-8 rounded-full bg-[#E56E2E]/10 text-[#E56E2E] flex items-center justify-center font-bold font-mono text-xs shrink-0">
                          {s.num}
                        </span>
                        <p className="text-xs leading-relaxed text-[#063F43] font-medium pt-1">{s.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activePolicyTab === 'procedures' && (
                  <div className="space-y-4">
                    {PRIMARY_POLICY.procedures.map((p, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-white">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <span className="text-[10px] font-mono text-[#00797D] font-bold">{p.step}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.timeframe}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[#063F43] mb-1">Party: {p.party}</h4>
                        <p className="text-xs text-[#356D70] leading-relaxed">{p.action}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activePolicyTab === 'documentation' && (
                  <div className="space-y-4">
                    {PRIMARY_POLICY.documentation.map((d, idx) => (
                      <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-white">
                        <h4 className="text-xs font-bold text-[#063F43] mb-1">{d.req}</h4>
                        <p className="text-xs text-[#356D70] leading-relaxed"><strong>Document:</strong> {d.document}</p>
                        <p className="text-[10px] text-[#527679] mt-2">Location: {d.location} | Timeframe: {d.timeframe}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activePolicyTab === 'appendices' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-extrabold text-[#063F43] uppercase tracking-wider mb-2">Linked Forms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PRIMARY_POLICY.linkedForms.map((form, idx) => (
                        <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-white flex justify-between items-center shadow-sm">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-[#00797D]">{form.id}</span>
                            <h4 className="text-xs font-bold text-[#063F43] mt-1">{form.title}</h4>
                          </div>
                          <button
                            onClick={() => showToast(`Opening signature workflow for form ${form.id}`)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#00797D]/10 text-[#00797D] hover:bg-[#00797D] hover:text-white transition-all text-xs font-bold shrink-0"
                          >
                            Fill Form
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
