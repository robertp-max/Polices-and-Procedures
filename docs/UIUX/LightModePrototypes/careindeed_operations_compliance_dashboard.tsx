// Light-mode design reference only. Not production app source.
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Calendar, 
  Search, 
  MoreHorizontal, 
  ArrowRight, 
  AlertTriangle, 
  LayoutDashboard,
  Users,
  FileCheck,
  TrendingUp,
  Sliders,
  HelpCircle,
  X,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Plus,
  Check,
  FileText,
  Filter,
  Sparkles,
  Info,
  Clock,
  Printer,
  Download,
  History,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  Layers,
  ArrowUpRight,
  Send
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');


// ==========================================
// COMPANION NAV & INTERACTIVE CARD COMPONENTS
// ==========================================
const SpotlightCard = ({ children, className = '', spotlightColor, onClick }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    divRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={cx('card-spotlight premium-glass-transition backdrop-blur-[33px]', className)}
      style={{ '--spotlight-color': spotlightColor || 'var(--spotlight-fallback)' }}
    >
      <div className="spotlight-glow-wrapper">
        <div className="spotlight-inner-glow" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const InteractiveNavButton = ({ icon: Icon, label, active, onClick, isCollapsed }) => {
  return (
    <div className="nav-btn-3d-wrapper w-full">
      <button
        onClick={onClick}
        className={cx(
          "nav-btn-3d group w-full flex items-center rounded-xl p-3 text-xs font-semibold transition-all duration-300 transform-gpu cursor-pointer relative border",
          active 
            ? "nav-btn-active-glow text-[var(--teal-primary)] border-[var(--teal-primary)]/40" 
            : "text-[var(--text-secondary)] bg-white/10 border-white/20 hover:bg-white/30 hover:text-[var(--text-primary)] hover:border-white/40",
          isCollapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3.5 px-4 py-3"
        )}
        title={label}
      >
        {active && (
          <div className="absolute inset-0 rounded-xl bg-[var(--teal-primary)]/5 pointer-events-none animate-pulse" />
        )}
        
        <Icon size={16} className={cx(
          "transition-all duration-300 group-hover:scale-110 shrink-0",
          active ? "text-[var(--teal-primary)] drop-shadow-[0_2px_4px_rgba(0,121,125,0.25)]" : "text-[var(--text-secondary)]"
        )} />
        
        {!isCollapsed && (
          <span className={cx(
            "font-semibold transition-all duration-300 truncate",
            active ? "text-[var(--teal-primary)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
          )}>
            {label}
          </span>
        )}
      </button>
    </div>
  );
};


// ==========================================
// CORE POLICY & FORMS DATA STRUCTURES
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
  
  scopeClarification: 'This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.',
  
  definitions: [
    { term: 'Governing Body', definition: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
    { term: 'Administrator', definition: 'The individual appointed by the Governing Body who is responsible for managing the agency\'s day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law.' },
    { term: 'Clinical Manager', definition: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
    { term: 'Fiduciary Duty', definition: 'The obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and patients.' },
    { term: 'Quorum', definition: 'The minimum number of Governing Body members required to be present to conduct official business, as defined in the agency\'s bylaws.' },
    { term: 'QAPI', definition: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring.' }
  ],

  statements: [
    { num: '4.1', text: 'Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).' },
    { num: '4.2', text: 'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.' },
    { num: '4.3', text: 'The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.' },
    { num: '4.4', text: 'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).' },
    { num: '4.5', text: 'The Governing Body shall approve and oversee the agency\'s: ', list: [
      'Scope of services (GV-OG-003)',
      'Organizational structure and reporting lines (GV-OG-001)',
      'Annual strategic plan and operational goals (GV-OG-004)',
      'Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)',
      'QAPI program (QA-PG-001, QA-PG-002)',
      'Corporate compliance program (CO-CP-001)',
      'Annual operating budget (FN-FP-005)',
      'Emergency preparedness plan (OP-FM-005)'
    ]},
    { num: '4.6', text: 'The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.' },
    { num: '4.7', text: 'The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity. Delegation of specific authority shall comply with policy GV-OG-005.' },
    { num: '4.8', text: 'All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.' },
    { num: '4.9', text: 'Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose. Any revision to this policy requires re-acknowledgment by all Governing Body members and senior leadership within 14 calendar days of the revised effective date.' }
  ],

  procedures: [
    { step: '6.1.1', party: 'Agency Owner / Corporate Entity', action: 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', timeframe: 'Prior to initial Medicare certification and maintained continuously thereafter.' },
    { step: '6.1.2', party: 'Governing Body Chair', action: 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', timeframe: 'Updated within 7 calendar days of any membership change.' },
    { step: '6.1.3', party: 'Governing Body', action: 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented by a current member, the Governing Body shall retain qualified advisory counsel within 30 calendar days of identifying the gap.', timeframe: 'Ongoing; reviewed annually at the first quarterly meeting of each calendar year.' },
    { step: '6.1.4', party: 'Compliance Officer', action: 'Verify that no Governing Body member appears on the OIG List of Excluded Individuals/Entities (LEIE) or the System for Award Management (SAM) exclusion database at the time of appointment and monthly thereafter, per policy HR-TA-003.', timeframe: 'At appointment and monthly thereafter.' }
  ],

  documentation: [
    { req: 'Governing Body establishment', document: 'Articles of incorporation, operating agreement, bylaws, or equivalent legal instrument establishing the Governing Body of Care Indeed Home Health Care, Inc.', party: 'Agency Owner / Corporate Entity', location: 'Corporate records repository (physical or electronic).', timeframe: 'Maintained permanently; updated within 14 calendar days of any amendment.' },
    { req: 'Governing Body membership roster', document: 'Current roster including member name, role, appointment date, term, voting status, and contact information (Appendix A).', party: 'Governing Body Chair', location: 'Agency governance file; copy maintained by Administrator.', timeframe: 'Updated within 7 calendar days of any change.' },
    { req: 'Meeting minutes', document: 'Formal minutes for all regular and special meetings, per policy GV-GB-002 (Appendix D template).', party: 'Designated Secretary', location: 'Agency governance file; copy provided to each member.', timeframe: 'Draft within 14 calendar days of meeting; approved at next regular meeting. Retained for minimum 7 years.' },
    { req: 'Meeting agendas', document: 'Agenda for each regular and special meeting.', party: 'Administrator / Designated Secretary', location: 'Agency governance file.', timeframe: 'Distributed 7 calendar days before each meeting; retained for minimum 7 years.' },
    { req: 'Conflict of Interest disclosures', document: 'Completed Conflict of Interest Disclosure Forms (Appendix B) for each Governing Body member.', party: 'Compliance Officer (collection); each member (completion)', location: 'Compliance file; copy in governance file.', timeframe: 'At appointment; annually; within 7 days of change. Retained for minimum 7 years.' }
  ],

  linkedForms: [
    { id: 'EN-FM-034', title: 'Enterprise KPI Dashboard', code: 'EN-FM-034' },
    { id: 'EN-FM-035', title: 'Quarterly Management Review Minutes', code: 'EN-FM-035' },
    { id: 'EN-FM-037', title: 'Enterprise Management Certification (Administrator + CFO)', code: 'EN-FM-037' },
    { id: 'GV-FM-003', title: 'Official Agency Organizational Chart', code: 'GV-FM-003' },
    { id: 'GV-FM-004', title: 'Governing Body Meeting Agenda Template', code: 'GV-FM-004' },
    { id: 'GV-FM-005', title: 'Governing Body Meeting Minutes Template', code: 'GV-FM-005' },
    { id: 'GV-FM-006', title: 'Conflict of Interest Disclosure Form', code: 'GV-FM-006', interactive: true },
    { id: 'GV-FM-007', title: 'Administrator Delegation of Authority Agreement', code: 'GV-FM-007' },
    { id: 'GV-FM-008', title: 'Governing Body Annual Self-Assessment Tool', code: 'GV-FM-008', interactive: true }
  ]
};

const MAIN_DOMAINS = [
  { id: 'GV', label: 'Governance', color: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30' },
  { id: 'CL', label: 'Clinical Ops', color: 'bg-indigo-500/10 text-indigo-800 border-indigo-500/30' },
  { id: 'QA', label: 'QAPI', color: 'bg-pink-500/10 text-pink-800 border-pink-500/30' },
  { id: 'HR', label: 'Human Res.', color: 'bg-orange-500/10 text-orange-800 border-orange-500/30' },
  { id: 'CO', label: 'Compliance', color: 'bg-teal-500/10 text-teal-800 border-teal-500/30' },
  { id: 'FN', label: 'Finance', color: 'bg-amber-500/10 text-amber-800 border-amber-500/30' },
  { id: 'OP', label: 'Operations', color: 'bg-blue-500/10 text-blue-800 border-blue-500/30' },
  { id: 'IT', label: 'IT & Security', color: 'bg-violet-500/10 text-violet-800 border-violet-500/30' }
];

const formsData = [
  { id: 'EN-FM-001', title: 'Universal Policy Acknowledgment Form', type: 'Attestation', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Requires signed baseline certification from all personnel acknowledging the current home health operational mandates.', accountability: 'Administrator' },
  { id: 'EN-FM-002', title: 'Master Policy Index / Taxonomy Register', type: 'Tracking Tool', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Consolidated reference ledger matching administrative policies with corresponding state and federal tags.', accountability: 'Director of Quality Assurance' },
  { id: 'EN-FM-003', title: 'Policy Classification Tier Matrix', type: 'Matrix', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Categorizes operational procedures by threat vector levels, safety impacts, and clinical impact indexes.', accountability: 'Clinical Manager' },
  { id: 'EN-FM-004', title: 'Domain Owner Assignment Roster', type: 'Tracking Tool', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Assigns operational accountability for specific federal COP rules to key clinical staff leaders.', accountability: 'Compliance Officer' },
  { id: 'EN-FM-005', title: 'Regulatory Crosswalk Template', type: 'Template', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Custom mapping tool detailing how standard clinical tasks align with ACHC guidelines and California Title 22.', accountability: 'QAPI Lead / Chair' },
  { id: 'EN-FM-006', title: 'Compliance Gap Analysis Worksheet', type: 'Worksheet', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Analytical ledger to cross-examine current documentation states against mandated performance benchmarks.', accountability: 'Director of Nursing' }
];

const alignmentMatrix = [
  { policyId: 'CL-CA-001', name: 'Patient Assessment - Comprehensive' },
  { policyId: 'CL-OA-002', name: 'OASIS Data Collection & Accuracy' }
];

const knowledgeArticles = [
  { id: 'k1', title: 'Identity Verification & E-Signature Setup' },
  { id: 'k2', title: 'CA Title 22 General Home Health Compliance' }
];

const plannerTasks = [
  { id: 'p1', title: 'Conduct quarterly mock emergency drill assessment' },
  { id: 'p2', title: 'Approve clinician competency framework update v3' }
];


export default function App() {
  const [activePage, setActivePage] = useState('architecture'); // architecture, library, forms, lifecycle, taxonomy, document-viewer
  const [activePolicyTab, setActivePolicyTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(true);

  // Compliance filter states for Library & Forms view
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedDomain, setSelectedDomain] = useState('GLOBAL REPOSITORY');

  // Command palette state
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(0);

  // Lifecycle workspace states
  const [activeLifecycleStage, setActiveLifecycleStage] = useState('DRAFT');
  const [selectedLifecyclePolicy, setSelectedLifecyclePolicy] = useState('GV-EA-001');

  // State to hold the actively viewed policy in document player
  const [selectedPolicy, setSelectedPolicy] = useState(PRIMARY_POLICY);

  // Interactive Form Overlay state
  const [activeFormModal, setActiveFormModal] = useState(null); // 'conflict', 'assessment' or null
  const [conflictForm, setConflictForm] = useState({
    fullName: 'Robert Patel',
    role: 'Clinical Manager',
    hasConflicts: 'no',
    conflictDescription: '',
    agreed: false,
    signature: ''
  });

  const [assessmentForm, setAssessmentForm] = useState({
    meetingsCount: '4',
    oversightRating: '5',
    strategicRating: '4',
    biggestChallenge: 'Maintaining seamless evidence packets for state auditors during clinical rotations.',
    agreed: false,
    signature: ''
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.head.removeChild(link);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleConflictSubmit = (e) => {
    e.preventDefault();
    if (!conflictForm.agreed || !conflictForm.signature) {
      addToast('Please complete the attestation check and signature before sealing.', 'error');
      return;
    }
    addToast('Conflict of Interest Form signed, cryptographically sealed, and logged successfully!', 'success');
    setActiveFormModal(null);
  };

  const handleAssessmentSubmit = (e) => {
    e.preventDefault();
    if (!assessmentForm.agreed || !assessmentForm.signature) {
      addToast('Please complete the attestation check and signature before submitting.', 'error');
      return;
    }
    addToast('Governing Body Self-Assessment successfully logged into agency records!', 'success');
    setActiveFormModal(null);
  };

  const handleSetSidebarCollapsed = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
    if (!collapsed) {
      setIsPersonalOpsOpen(false);
    }
  };

  const handleSetPersonalOpsOpen = (open) => {
    setIsPersonalOpsOpen(open);
    if (open) {
      setIsSidebarCollapsed(true);
    }
  };

  const commandSearchResults = [
    ...formsData.map(f => ({ 
      type: 'COMPLIANCE FORM', 
      id: f.id, 
      title: f.title, 
      action: () => { setActivePage('forms'); } 
    })),
    ...alignmentMatrix.map(a => ({ 
      type: 'REGULATORY CROSSWALK', 
      id: a.policyId, 
      title: a.name, 
      action: () => { setActivePage('taxonomy'); } 
    })),
    ...knowledgeArticles.map(k => ({ 
      type: 'HELP MANUAL', 
      id: k.id, 
      title: k.title, 
      action: () => { setActivePage('taxonomy'); } 
    })),
    ...plannerTasks.map(t => ({ 
      type: 'PLANNER TASK', 
      id: t.id, 
      title: t.title, 
      action: () => { setActivePage('lifecycle'); } 
    }))
  ].filter(item => {
    if (!commandSearchQuery) return true;
    return item.title.toLowerCase().includes(commandSearchQuery.toLowerCase()) || 
           item.id.toLowerCase().includes(commandSearchQuery.toLowerCase()) || 
           item.type.toLowerCase().includes(commandSearchQuery.toLowerCase());
  });

  const handleCommandSearchKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSearchIndex(prev => (prev + 1) % Math.max(1, commandSearchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSearchIndex(prev => (prev - 1 + commandSearchResults.length) % Math.max(1, commandSearchResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = commandSearchResults[focusedSearchIndex];
      if (target) {
        target.action();
        setIsCommandSearchOpen(false);
        setCommandSearchQuery('');
        addToast(`Redirected to: ${target.title}`, 'success');
      }
    } else if (e.key === 'Escape') {
      setIsCommandSearchOpen(false);
    }
  };

  const filteredForms = formsData.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || form.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || form.type === filterType;
    return matchesSearch && matchesSeverity && matchesType;
  });


  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Design System & Custom Tokens */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --border-card: rgba(255, 255, 255, 0.55);
          --border-card-hover: rgba(0, 121, 125, 0.4);
          --bg-card: rgba(255, 255, 255, 0.32);
          --text-primary: #111827;
          --text-secondary: #374151;
          --text-tertiary: #6B7280;
          --teal-primary: #00797D;
          --orange-primary: #C74601;
          --spotlight-fallback: rgba(0, 121, 125, 0.04);
          --drawer-bg: rgba(255, 255, 255, 0.96);
        }

        .light-shell {
          font-family: 'Inter', sans-serif;
          background-color: #F8F4F0;
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* Flowing Ambient Light Background */
        .light-shell::before {
          content: "";
          position: fixed;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background: 
            radial-gradient(circle at 15% 15%, rgba(199, 70, 1, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(0, 121, 125, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 230, 210, 0.45) 0%, transparent 60%),
            radial-gradient(circle at 90% 10%, rgba(225, 253, 255, 0.7) 0%, transparent 45%);
          filter: blur(95px);
          animation: ambientFlow 30s ease-in-out infinite alternate;
        }

        @keyframes ambientFlow {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(1%, -1%); }
          100% { transform: scale(1.1) translate(-1%, 1.5%); }
        }

        .font-heading {
          font-family: 'Montserrat', sans-serif;
        }

        .font-signature {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        .premium-shadow {
          box-shadow: 
            0 12px 36px -8px rgba(0, 0, 0, 0.04),
            0 4px 12px -3px rgba(0, 0, 0, 0.01),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
        }

        .card-spotlight {
          position: relative;
          isolation: isolate;
          background: var(--bg-card);
          backdrop-filter: blur(33px);
          -webkit-backdrop-filter: blur(33px);
          border-radius: 1.25rem;
          border: 1px solid var(--border-card);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.28s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .spotlight-glow-wrapper {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .spotlight-inner-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(280px circle at var(--mouse-x, 0) var(--mouse-y, 0), var(--spotlight-color), transparent 75%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }

        .card-spotlight:hover .spotlight-inner-glow {
          opacity: 1;
        }

        .card-spotlight:hover {
          transform: translateY(-3px);
          border-color: var(--border-card-hover);
          background-color: rgba(255, 255, 255, 0.4);
          box-shadow: 0 20px 40px -12px rgba(0, 121, 125, 0.08);
        }

        .border-none-structure {
          border: none !important;
          border-width: 0px !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 121, 125, 0.15);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 121, 125, 0.3);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* GLOBAL BRAND HEADER */}
      <header className="flex h-[76px] w-full flex-shrink-0 items-center justify-between px-6 md:px-9 bg-white/20 backdrop-blur-[33px] relative z-30 border-b border-white/25 select-none shadow-sm">
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src="https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png" 
            alt="CareIndeed Brand Logo" 
            className="h-7 w-auto object-contain select-none pointer-events-none"
          />
        </div>

        {/* Global Workspace Search Bar */}
        <div className="flex flex-1 items-center max-w-md ml-4">
          <div 
            onClick={() => setIsCommandSearchOpen(true)}
            className="group relative w-full cursor-pointer"
          >
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <div className="w-full rounded-full bg-white/45 pl-10 pr-12 py-2 text-xs text-[var(--text-secondary)] select-none flex items-center justify-between h-[36px] group-hover:bg-white/60 transition-all border border-white/60 premium-shadow">
              <span className="truncate">Search policies, taxonomies, forms...</span>
              <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono text-[var(--text-secondary)] shadow-sm shrink-0 ml-2">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Profile Summary Panel Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => {
              addToast('Clearance Verified: authorized cryptographically for California state audits.', 'success');
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--teal-primary)] transition-all border border-white/55 premium-shadow cursor-pointer"
            title="Safe Mode State"
          >
            <Lock size={14} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button 
            onClick={() => {
              const nextState = !isPersonalOpsOpen;
              handleSetPersonalOpsOpen(nextState);
              addToast(nextState ? 'Personal Operations Expanded' : 'Personal Operations Collapsed', 'info');
            }}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md ml-2 relative border-2 border-white/70 cursor-pointer",
              isPersonalOpsOpen ? "bg-[var(--orange-primary)] scale-105" : "bg-[var(--teal-primary)]"
            )}
            title="Toggle Personal operations dashboard Drawer"
          >
            RP
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
          </button>
        </div>
      </header>

      {/* LOWER SCREEN WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden w-full relative z-10">
        
        {/* LEFT COMPLIANCE SIDEBAR */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-r border-white/20 shrink-0",
            isSidebarCollapsed ? "w-[78px]" : "w-[265px]"
          )}
        >
          {/* Collapse sidebar toggles */}
          <div className="p-4 flex justify-end select-none">
            <button
              onClick={() => handleSetSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation link panels */}
          <div className="flex-1 space-y-7 overflow-y-auto px-4 py-2 select-none">
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Architecture
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={Layers} 
                  label="Policy Architecture" 
                  active={activePage === 'architecture'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => setActivePage('architecture')} 
                />
                
                <InteractiveNavButton 
                  icon={FileCheck} 
                  label="Policy Library" 
                  active={activePage === 'library' || activePage === 'document-viewer'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => setActivePage('library')} 
                />

                <InteractiveNavButton 
                  icon={FileText} 
                  label="Forms Library" 
                  active={activePage === 'forms'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => setActivePage('forms')} 
                />

                <InteractiveNavButton 
                  icon={Sliders} 
                  label="Policy Lifecycle" 
                  active={activePage === 'lifecycle'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => setActivePage('lifecycle')} 
                />

                <InteractiveNavButton 
                  icon={TrendingUp} 
                  label="Taxonomy Overview" 
                  active={activePage === 'taxonomy'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => setActivePage('taxonomy')} 
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/25 select-none text-[11px] font-bold text-[var(--text-primary)] border-t border-white/20">
            <span className="flex items-center gap-1.5 justify-center">
              <Lock size={12} className="text-[var(--teal-primary)]" />
              {!isSidebarCollapsed && <span>Safe Mode Enabled</span>}
            </span>
          </div>
        </aside>

        {/* WORKSPACE CENTRAL PANELS */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-9 relative">
          
          {/* ========================================================= */}
          {/* VIEW 1: ENTERPRISE POLICY ARCHITECTURE */}
          {/* ========================================================= */}
          {activePage === 'architecture' && (
            <div className="space-y-8 animate-fadeIn max-w-[1400px] mx-auto select-none">
              
              {/* Architecture Intro */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/10">
                  v7.0 | HHA FRAMEWORK - REGULATORY ALIGNMENT
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-2">
                  Enterprise Policy Architecture
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Structural hierarchy mapping administrative and clinical policies to state Title 22, CMS Conditions of Participation (CoPs), and ACHC standards.
                </p>
              </div>

              {/* Taxonomy Summary Ribbon metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { title: 'TAXONOMY DOMAINS', value: '10', desc: 'Top-Level Categories' },
                  { title: 'SUBDOMAINS', value: '46', desc: 'Structural Pillars' },
                  { title: 'TOTAL POLICIES', value: '269', desc: 'Managed Artifacts' },
                  { title: 'GOVERNANCE Alignment', value: '100%', desc: 'Framework Aligned' }
                ].map((item, idx) => (
                  <SpotlightCard key={idx} className="p-5 border border-white/60 premium-shadow">
                    <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">{item.title}</span>
                    <span className="text-3xl font-black text-[var(--teal-primary)] block mt-1.5">{item.value}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] font-medium block mt-1">{item.desc}</span>
                  </SpotlightCard>
                ))}
              </div>

              {/* Layer 1: Regulatory Board */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--orange-primary)] uppercase tracking-wider flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--orange-primary)]" />
                  ARCHITECTURE LAYER 1 — REGULATORY BOARD
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {['TITLE 22', '42 CFR §484', 'CMS STATE OPS', 'HIPAA', 'OSHA', 'OIG', 'FCA'].map((board) => (
                    <span key={board} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/45 border border-white/70 text-[var(--text-secondary)] premium-shadow font-mono">
                      {board}
                    </span>
                  ))}
                </div>
              </div>

              {/* Layer 2: Strategic Domains */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal-primary)]" />
                  ARCHITECTURE LAYER 2 — 10 STRATEGIC DOMAINS
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-3.5">
                  {MAIN_DOMAINS.map((dom) => (
                    <div key={dom.id} className="p-4 rounded-xl border border-white/60 bg-white/30 premium-shadow text-center flex flex-col justify-center items-center">
                      <span className={cx("text-xs font-black font-mono px-2 py-0.5 rounded-md border", dom.color)}>{dom.id}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] mt-2">{dom.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 3 & Layer 4 Quick Access Callout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="p-5 rounded-2xl border border-white/60 bg-white/30 premium-shadow space-y-2">
                  <h4 className="text-xs font-bold text-[var(--orange-primary)] uppercase">Layer 3: 46 Pillar Subdomains</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Granular structural clusters mapped to individual department duties. Subdomains enforce governance control boundaries.
                  </p>
                  <button 
                    onClick={() => setActivePage('taxonomy')}
                    className="text-xs text-[var(--teal-primary)] font-bold flex items-center gap-1 hover:underline pt-2 cursor-pointer"
                  >
                    Launch Taxonomy Map <ChevronRight size={14} />
                  </button>
                </div>

                <div className="p-5 rounded-2xl border border-white/60 bg-white/30 premium-shadow space-y-2">
                  <h4 className="text-xs font-bold text-[var(--teal-primary)] uppercase">Layer 4: 269 Managed Policies</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Comprehensive statutory regulations covering comprehensive patient assessments, infection control matrices, and IT transmission structures.
                  </p>
                  <button 
                    onClick={() => setActivePage('library')}
                    className="text-xs text-[var(--teal-primary)] font-bold flex items-center gap-1 hover:underline pt-2 cursor-pointer"
                  >
                    Browse Policy Library <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: ENTERPRISE POLICY LIBRARY */}
          {/* ========================================================= */}
          {activePage === 'library' && (
            <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto select-none">
              
              {/* Library header panel */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                    GLOBAL REPOSITORY
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--teal-primary)]">
                    Enterprise Policy Library
                  </h1>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--teal-primary)] bg-white/70 px-3 py-1.5 rounded-lg font-mono">269 POLICIES</span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-200 px-3 py-1.5 rounded-lg font-mono">361 FORMS</span>
                </div>
              </div>

              {/* Layout split: Left Regulatory Filters & Strategic Domains | Right Policies Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* Left Side: Regulatory Filter sidebar panel */}
                <div className="space-y-6 lg:col-span-1">
                  <div className="p-5 rounded-2xl border border-white/60 bg-white/30 premium-shadow space-y-4">
                    
                    {/* Search Field */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search policies..."
                        className="w-full bg-white/70 border border-neutral-300 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--teal-primary)]"
                      />
                    </div>

                    {/* Regulatory Tags Filter */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Regulatory Filters</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['ALL', 'TITLE 22', '42 CFR §484', 'CMS STATE OPS', 'HIPAA', 'OSHA', 'OIG', 'FCA'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => { setFilterSeverity(tag); addToast(`Selected Filter: ${tag}`); }}
                            className={cx(
                              "px-2 py-1 rounded text-[9px] font-bold border transition-all cursor-pointer",
                              filterSeverity === tag
                                ? "bg-[var(--teal-primary)] text-white border-transparent"
                                : "bg-white/40 border-neutral-300 text-[var(--text-secondary)] hover:bg-white"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Strategic Domain selector list */}
                    <div className="space-y-2 pt-2 border-t border-neutral-200">
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">Strategic Domains</span>
                      <div className="space-y-1">
                        {['GLOBAL REPOSITORY', 'GOVERNANCE', 'CLINICAL OPS', 'QAPI', 'HUMAN RES.', 'COMPLIANCE', 'FINANCE', 'OPERATIONS'].map((dom) => (
                          <button
                            key={dom}
                            onClick={() => { setSelectedDomain(dom); addToast(`Scope Filtered: ${dom}`); }}
                            className={cx(
                              "w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                              selectedDomain === dom
                                ? "bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/20"
                                : "text-[var(--text-secondary)] hover:bg-white/250"
                            )}
                          >
                            <span>{dom}</span>
                            <ChevronRight size={12} className="opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Side: Cards Grid */}
                <div className="lg:col-span-3 space-y-4">
                  
                  {/* Category description banner */}
                  <div className="p-4 rounded-xl bg-white/75 text-[var(--text-primary)] flex items-center justify-between text-xs border border-neutral-200 shadow-md">
                    <span className="font-semibold uppercase tracking-wider font-mono">ALL DOMAINS — GLOBAL REPOSITORY</span>
                    <span className="text-slate-400 font-medium">Showing active policy tags</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary policy document viewer portal card */}
                    <SpotlightCard 
                      onClick={() => { setSelectedPolicy(PRIMARY_POLICY); setActivePage('document-viewer'); }}
                      className="p-6 cursor-pointer border border-white/60 bg-white/40 premium-shadow hover:border-[var(--teal-primary)] transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            GV-GB-001
                          </span>
                          <span className="text-[9px] font-extrabold text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-0.5 rounded-full">REQUIRED</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-[var(--text-primary)] leading-snug">
                          {PRIMARY_POLICY.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {PRIMARY_POLICY.purpose}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-200/50 flex items-center justify-between text-[10px] text-[var(--text-tertiary)] mt-3">
                        <span className="font-semibold">Oversight: Governing Body Chair</span>
                        <span className="text-[var(--teal-primary)] font-bold flex items-center gap-0.5 hover:underline">
                          Open Player <ArrowUpRight size={11} />
                        </span>
                      </div>
                    </SpotlightCard>

                    {/* Secondary placeholder card */}
                    <SpotlightCard 
                      onClick={() => addToast('Open Policy GV-GB-001 to view full document layout.', 'info')}
                      className="p-6 border border-white/60 bg-white/40 premium-shadow space-y-4 flex flex-col justify-between opacity-80 cursor-pointer"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            GV-GB-002
                          </span>
                          <span className="text-[9px] font-extrabold text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2 py-0.5 rounded-full">REQUIRED</span>
                        </div>
                        <h3 className="text-sm font-extrabold text-neutral-500 leading-snug">
                          Board Meeting & Minutes Requirements
                        </h3>
                        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                          Establishes protocols for holding meetings, establishing board rosters, and archiving official meeting packages.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-neutral-200/50 flex items-center justify-between text-[10px] text-neutral-400 mt-3">
                        <span className="font-semibold">Oversight: Secretary of Board</span>
                        <span className="font-bold flex items-center gap-0.5">Template Locked</span>
                      </div>
                    </SpotlightCard>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: COMPLIANCE FORMS LIBRARY */}
          {/* ========================================================= */}
          {activePage === 'forms' && (
            <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto select-none">
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                    ENTERPRISE WORKSHEETS
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--teal-primary)]">
                    Enterprise Forms Library
                  </h1>
                </div>
              </div>

              {/* Interactive grid of form cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Conflict of Interest Form Card */}
                <SpotlightCard className="p-6 border border-white/60 bg-white/35 premium-shadow space-y-4 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-0.5 rounded border border-[var(--teal-primary)]/20">
                        GV-FM-006
                      </span>
                      <span className="text-[9px] font-bold text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2 py-0.5 rounded border border-[var(--orange-primary)]/20">
                        SHARED ENTERPRISE
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      Conflict of Interest Disclosure Form
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Mandatory annual attestation required by all active voting members of the Governing Body and directors mapping relationship ties.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Attestation</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Interactive</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200/50 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">Owner: Compliance Officer</span>
                    <button 
                      onClick={() => setActiveFormModal('conflict')}
                      className="px-4 py-2 bg-[var(--teal-primary)] text-white font-bold text-xs rounded-xl hover:bg-[var(--teal-primary)]/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      Fill Form <Sparkles size={13} className="animate-pulse" />
                    </button>
                  </div>
                </SpotlightCard>

                {/* Self-Assessment Form Card */}
                <SpotlightCard className="p-6 border border-white/60 bg-white/35 premium-shadow space-y-4 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-0.5 rounded border border-[var(--teal-primary)]/20">
                        GV-FM-008
                      </span>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        MASTER TEMPLATE
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                      Governing Body Annual Self-Assessment Tool
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Comprehensive board assessment detailing meeting frequencies, compliance ratios, and administrative oversight quality standards.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border">Evaluation</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Interactive</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200/50 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">Owner: Governing Body Chair</span>
                    <button 
                      onClick={() => setActiveFormModal('assessment')}
                      className="px-4 py-2 bg-[var(--teal-primary)] text-white font-bold text-xs rounded-xl hover:bg-[var(--teal-primary)]/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      Fill Form <Sparkles size={13} className="animate-pulse" />
                    </button>
                  </div>
                </SpotlightCard>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: POLICY LIFECYCLE WORKSPACE */}
          {/* ========================================================= */}
          {activePage === 'lifecycle' && (
            <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto select-none">
              
              {/* Workspace Header panel */}
              <div className="bg-white/40 p-5 rounded-2xl border border-white/60 premium-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">POLICY LIFECYCLE WORKSPACE</span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--text-primary)]">
                    Drafting • Review • Approval • Publish • Archive
                  </h1>
                </div>

                <div className="flex gap-2">
                  {['DRAFT - 279', 'REVIEW - 0', 'APPROVED - 0', 'PUBLISHED - 0'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => { setActiveLifecycleStage(stage.split(' ')[0]); addToast(`Viewing Stage: ${stage}`); }}
                      className={cx(
                        "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer",
                        activeLifecycleStage === stage.split(' ')[0]
                          ? "bg-[var(--teal-primary)] text-white border-transparent"
                          : "bg-white/40 border-neutral-200 text-[var(--text-secondary)] hover:bg-white"
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Three Column Lifecycle Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Column 1: Draft Policy list (4/12 cols) */}
                <div className="lg:col-span-4 p-5 rounded-2xl border border-white/60 bg-white/30 premium-shadow space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[var(--teal-primary)]">Source: Real Policy Corpus</span>
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">279 Policies</span>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input 
                      type="text" 
                      placeholder="Search ID, title, owner..."
                      className="w-full bg-white border border-neutral-200 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-[var(--teal-primary)]"
                    />
                  </div>

                  {/* List of drafts */}
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {[
                      { id: 'GV-EA-001', title: 'Interagency Agreements & Contracts' },
                      { id: 'GV-EA-002', title: 'Community Liaison & Public Relations' },
                      { id: 'GV-EA-003', title: 'Legal Counsel Engagement & Oversight' },
                      { id: 'GV-EA-004', title: 'Agency Licensure & Certification' },
                      { id: 'GV-EA-005', title: 'Agency Closure or Change of Ownership' }
                    ].map((draft) => (
                      <div 
                        key={draft.id}
                        onClick={() => setSelectedLifecyclePolicy(draft.id)}
                        className={cx(
                          "p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-1",
                          selectedLifecyclePolicy === draft.id
                            ? "bg-white border-[var(--teal-primary)] shadow-sm"
                            : "bg-white/40 border-transparent hover:bg-white"
                        )}
                      >
                        <span className="text-[9px] font-mono font-bold text-[var(--teal-primary)]">{draft.id}</span>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">{draft.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Document Preview Workspace (5/12 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/60 bg-white/40 premium-shadow space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-0.5 rounded">
                      POLICY PREVIEW
                    </span>
                    <span className="text-[11px] font-mono font-black text-[var(--teal-primary)]">{selectedLifecyclePolicy}</span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-heading text-lg font-extrabold text-[var(--text-primary)]">
                      {selectedLifecyclePolicy === 'GV-EA-001' ? 'Interagency Agreements & Contracts' : 'Community Liaison & Public Relations'}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      This statutory guideline establishes standard parameters for drafting, reviewing, approving, and archiving all interagency agreements and clinical service contracts.
                    </p>
                    <div className="p-3 bg-neutral-100 rounded-lg border text-[11px] text-[var(--text-tertiary)] italic">
                      "All clinical operations contracted with external providers must satisfy HIPAA regulations and federal privacy laws."
                    </div>
                  </div>
                </div>

                {/* Column 3: Guided UAT Checkpoints & Actions (3/12 cols) */}
                <div className="lg:col-span-3 p-5 rounded-2xl border border-white/60 bg-white/30 premium-shadow flex flex-col justify-between">
                  <div className="space-y-4 text-left">
                    <h4 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">GUIDED ACTIONS</h4>
                    
                    <div className="space-y-2">
                      {[
                        'Review operational posture',
                        'Open and execute tasks',
                        'Validate workflow timeline',
                        'Complete required forms',
                        'Upload and verify evidence',
                        'Run audit readiness pass'
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-semibold p-2 bg-white/40 border border-white/60 rounded-xl">
                          <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-neutral-200/50 space-y-2">
                    <button 
                      onClick={() => addToast('Approval process initiated successfully.', 'success')}
                      className="w-full py-2 bg-[var(--teal-primary)] text-white text-xs font-bold rounded-xl hover:bg-[var(--teal-primary)]/90 transition-all cursor-pointer"
                    >
                      Route for Approval
                    </button>
                    <button 
                      onClick={() => addToast('Document flagged for administrative edit.', 'info')}
                      className="w-full py-2 border text-[var(--text-secondary)] text-xs font-bold rounded-xl hover:bg-white transition-all cursor-pointer"
                    >
                      Flag for Edit
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: TAXONOMY LAYER MAP */}
          {/* ========================================================= */}
          {activePage === 'taxonomy' && (
            <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto select-none">
              
              <div className="flex justify-between items-end pb-4 border-b border-white/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">
                    LAYERED STRUCTURE MAPPING
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                    Enterprise Framework Layers
                  </h1>
                </div>
              </div>

              {/* Visual layer cards stack */}
              <div className="space-y-4">
                {[
                  { layer: 'Layer 1: Regulatory Board', desc: 'Title 22 • Medicare CoPs • CMS State Ops • HIPAA privacy • OSHA guidelines • OIG guidelines', accent: 'bg-[var(--orange-primary)]' },
                  { layer: 'Layer 2: Strategic Domains', desc: 'Oversight governance • Clinical Ops • QAPI framework • Human Resources • Compliance framework • Finance systems • IT Security', accent: 'bg-[var(--teal-primary)]' },
                  { layer: 'Layer 3: 46 Pillar Subdomains', desc: 'Granular clusters tracking individual operational targets and clinical stewardship.', accent: 'bg-amber-600' },
                  { layer: 'Layer 4: 269 Managed Policies', desc: 'Official compliance documents mapped to legislative state rules and audit points.', accent: 'bg-emerald-600' }
                ].map((l, index) => (
                  <div key={index} className="p-5 rounded-2xl bg-white/40 border border-white/60 premium-shadow flex items-start gap-4">
                    <span className={cx("h-8 w-1 px-1 rounded shrink-0", l.accent)} />
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{l.layer}</h4>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{l.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* REANCHORED: POLICY COMPLIANCE PLAYER / VIEW */}
          {/* ========================================================= */}
          {activePage === 'document-viewer' && (
            <div className="space-y-6 animate-fadeIn max-w-[1400px] mx-auto select-none text-left">
              
              {/* Back to Library breadcrumb header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActivePage('library')}
                    className="p-1.5 rounded-lg border border-neutral-300 bg-white/40 text-[var(--text-secondary)] hover:bg-white transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1.5">
                    <span>Library</span>
                    <ChevronRight size={12} />
                    <span className="font-mono text-[var(--teal-primary)] font-bold">{selectedPolicy.id}</span>
                  </div>
                </div>

                {/* Top Action buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => addToast('Reviewing Version History... Initial Version v1.0, current v6.0', 'info')}
                    className="px-3 py-1.5 rounded-lg border bg-white/40 hover:bg-white text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <History size={14} /> Version History
                  </button>
                  <button 
                    onClick={() => addToast('Exporting current policy to PDF format...', 'success')}
                    className="px-3 py-1.5 rounded-lg border bg-white/40 hover:bg-white text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download size={14} /> Export PDF
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-[var(--teal-primary)] text-white hover:bg-[var(--teal-primary)]/90 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>

              {/* Unified Policy Metadata Frame Container with subtle radial warm-sand and soft-teal gradient blur */}
              <div className="relative text-[var(--text-primary)] rounded-3xl p-6 md:p-8 overflow-hidden border border-white/60 bg-white/40 premium-shadow">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-amber-500/5 pointer-events-none" />
                
                <div className="relative z-10 space-y-5">
                  <div className="flex flex-wrap gap-1.5">
                    {['Overview & Definitions', 'Policy Statements', 'Procedures', 'Documentation', 'Appendices'].map((subtab) => (
                      <button 
                        key={subtab}
                        onClick={() => {
                          if (subtab === 'Overview & Definitions') setActivePolicyTab('overview');
                          else if (subtab === 'Policy Statements') setActivePolicyTab('statements');
                          else if (subtab === 'Procedures') setActivePolicyTab('procedures');
                          else if (subtab === 'Documentation') setActivePolicyTab('documentation');
                          else if (subtab === 'Appendices') setActivePolicyTab('linked');
                        }}
                        className={cx(
                          "px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all tracking-wider cursor-pointer",
                          (subtab === 'Overview & Definitions' && activePolicyTab === 'overview') ||
                          (subtab === 'Policy Statements' && activePolicyTab === 'statements') ||
                          (subtab === 'Procedures' && activePolicyTab === 'procedures') ||
                          (subtab === 'Documentation' && activePolicyTab === 'documentation') ||
                          (subtab === 'Appendices' && activePolicyTab === 'linked')
                            ? "border-b-2 border-[var(--teal-primary)] text-[var(--teal-primary)] font-extrabold bg-[var(--teal-primary)]/5" 
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {subtab}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--teal-primary)] leading-tight">
                      {selectedPolicy.title}
                    </h1>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--teal-primary)] block mt-1 font-mono">
                      POLICY ID: {selectedPolicy.id} • ACTIVE
                    </span>
                  </div>

                  {/* Metadata fields in Light Mode Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-neutral-200/50 text-xs mt-4">
                    <div>
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Domain Scope</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.domain}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Tier Classification</span>
                      <span className="font-bold text-amber-600">{selectedPolicy.tier}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Approved By</span>
                      <span className="font-bold text-[var(--text-secondary)] leading-tight block">{selectedPolicy.approvedBy}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Supersedes</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.supersedes}</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Effective Date</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.effectiveDate}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Last Reviewed</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.lastReviewed}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Next Review Limit</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.nextReview}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[var(--text-tertiary)] block uppercase text-[9px] tracking-wider font-bold">Version Tag</span>
                      <span className="font-bold text-[var(--text-secondary)]">{selectedPolicy.version}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive subcontent matching screenshots */}
              <div className="bg-white/40 border border-white/60 backdrop-blur-md rounded-3xl p-6 md:p-8 premium-shadow">
                
                {/* 1. OVERVIEW & DEFINITIONS */}
                {activePolicyTab === 'overview' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Purpose section */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2">
                          <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">2</span>
                          PURPOSE
                        </h3>
                        <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
                          {selectedPolicy.purpose}
                        </p>
                      </div>

                      {/* Scope section */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2">
                          <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">3</span>
                          SCOPE
                        </h3>
                        <div className="space-y-1.5">
                          {selectedPolicy.scope.map((item, index) => (
                            <div key={index} className="text-xs font-semibold text-[var(--text-secondary)] bg-white/40 p-3 rounded-xl border border-white/60">
                              {item}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] italic pt-1">{selectedPolicy.scopeClarification}</p>
                      </div>
                    </div>

                    {/* Definitions section */}
                    <div className="pt-6 border-t border-neutral-200/50 space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2">
                        <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">5</span>
                        DEFINITIONS
                      </h3>

                      <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/20">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-white/40 text-[var(--teal-primary)] uppercase tracking-wider text-[10px] font-bold">
                              <th className="p-4 border-b border-white/60">Term</th>
                              <th className="p-4 border-b border-white/60">Definition</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {selectedPolicy.definitions.map((def, index) => (
                              <tr key={index} className="hover:bg-white/25">
                                <td className="p-4 font-extrabold text-[var(--text-primary)] w-40 shrink-0">{def.term}</td>
                                <td className="p-4 text-[var(--text-secondary)] leading-relaxed font-medium">{def.definition}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. POLICY STATEMENTS */}
                {activePolicyTab === 'statements' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2 pb-2">
                      <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">4</span>
                      POLICY STATEMENTS
                    </h3>

                    <div className="space-y-3">
                      {selectedPolicy.statements.map((stmt) => (
                        <div key={stmt.num} className="bg-white/40 border border-white/60 p-4.5 rounded-2xl flex items-start gap-4">
                          <span className="h-6 w-6 rounded-full bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] flex items-center justify-center text-[10px] font-black font-mono shrink-0">
                            {stmt.num}
                          </span>
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">{stmt.text}</p>
                            {stmt.list && (
                              <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-secondary)] font-medium">
                                {stmt.list.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. PROCEDURES */}
                {activePolicyTab === 'procedures' && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2">
                      <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">6</span>
                      PROCEDURES
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-white/40 text-[var(--teal-primary)] uppercase tracking-wider text-[10px] font-bold">
                            <th className="p-4 border-b border-white/60">Step</th>
                            <th className="p-4 border-b border-white/60">Responsible Party</th>
                            <th className="p-4 border-b border-white/60">Action Steps</th>
                            <th className="p-4 border-b border-white/60">Timeframe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 font-medium">
                          {selectedPolicy.procedures.map((p, index) => (
                            <tr key={index} className="hover:bg-white/25">
                              <td className="p-4 font-mono font-bold text-[var(--teal-primary)]">{p.step}</td>
                              <td className="p-4 font-extrabold text-[var(--text-primary)] w-48">{p.party}</td>
                              <td className="p-4 text-[var(--text-secondary)] leading-relaxed">{p.action}</td>
                              <td className="p-4 text-[var(--text-tertiary)] italic w-44">{p.timeframe}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. DOCUMENTATION */}
                {activePolicyTab === 'documentation' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)]">
                      DOCUMENTATION REQUIREMENTS
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/20">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-white/40 text-[var(--teal-primary)] uppercase tracking-wider text-[10px] font-bold">
                            <th className="p-4 border-b border-white/60">Requirement</th>
                            <th className="p-4 border-b border-white/60">Document / Record</th>
                            <th className="p-4 border-b border-white/60">Responsible Party</th>
                            <th className="p-4 border-b border-white/60">Location</th>
                            <th className="p-4 border-b border-white/60">Timeframe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 font-medium">
                          {selectedPolicy.documentation.map((d, index) => (
                            <tr key={index} className="hover:bg-white/25">
                              <td className="p-4 font-extrabold text-[var(--text-primary)]">{d.req}</td>
                              <td className="p-4 text-[var(--text-secondary)] leading-relaxed">{d.document}</td>
                              <td className="p-4 text-[var(--text-secondary)]">{d.party}</td>
                              <td className="p-4 text-[var(--text-tertiary)]">{d.location}</td>
                              <td className="p-4 text-[var(--text-tertiary)] italic">{d.timeframe}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 5. APPENDICES & FORMS COMPLIANCE */}
                {activePolicyTab === 'linked' && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-2">
                      <span className="text-[10px] bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2.5 py-0.5 rounded">F</span>
                      LINKED COMPLIANCE FORMS
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedPolicy.linkedForms.map((form) => (
                        <div key={form.id} className="p-5 rounded-2xl border border-white/60 bg-white/30 flex flex-col justify-between min-h-[140px] premium-shadow hover:shadow-depth transition-all">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-[var(--teal-primary)] bg-white/250 px-2 py-0.5 rounded border border-white/20">{form.code}</span>
                            <h4 className="text-xs font-black text-[var(--text-primary)] pt-2 leading-tight">{form.title}</h4>
                          </div>
                          
                          {form.interactive ? (
                            <button 
                              onClick={() => {
                                if (form.code === 'GV-FM-006') setActiveFormModal('conflict');
                                else if (form.code === 'GV-FM-008') setActiveFormModal('assessment');
                              }}
                              className="text-[10px] font-extrabold uppercase text-[var(--teal-primary)] hover:underline flex items-center gap-1 mt-4 cursor-pointer"
                            >
                              Open form <Sparkles size={11} className="text-[var(--orange-primary)] animate-pulse" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => addToast(`Download template checklist initiated: ${form.code}`, 'info')}
                              className="text-[10px] font-extrabold uppercase text-slate-500 hover:underline mt-4 cursor-pointer text-left"
                            >
                              Download template
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

        </main>

        {/* RIGHT SIDE COMPLIANCE SUMMARY BAR */}
        <aside 
          className={cx(
            "relative z-20 h-full flex flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-l border-white/25 select-none overflow-hidden shrink-0",
            isPersonalOpsOpen ? "w-[340px] px-6 py-6 bg-white/10" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-6 text-left">
            <div className="space-y-6">
              
              {/* Drawer Close trigger */}
              <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold tracking-widest text-[var(--teal-primary)] uppercase">Personal operations</span>
                <button
                  onClick={() => {
                    handleSetPersonalOpsOpen(false);
                    addToast('Personal Operations Drawer hidden.');
                  }}
                  className="p-1.5 rounded-full hover:bg-white/30 text-[var(--text-tertiary)] border border-white/30 bg-white/10 transition-colors premium-shadow cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Active Clinician Profile */}
              <div className="bg-white/45 p-4 rounded-2xl flex items-center gap-3 border border-white/50 shadow-sm premium-shadow">
                <div className="h-11 w-11 rounded-full shrink-0 bg-[var(--teal-primary)] flex items-center justify-center font-bold text-white text-base shadow-sm">
                  RP
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">Robert Patel</h3>
                  <p className="text-[10px] text-[var(--text-secondary)]">CareIndeed Clinical Division</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9.5px] text-emerald-600 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Session Active
                  </div>
                </div>
              </div>

              {/* Guided check elements */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">Outstanding Controls</h4>
                <div className="space-y-1.5">
                  <div className="p-3 bg-white/30 border border-white/50 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">OVERDUE</span>
                    <h5 className="text-xs font-black text-[var(--text-primary)] leading-snug">Establish Governing Body roster</h5>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Complete the annual roster mapping checklist by this Friday.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Cryptographic signature footer */}
            <div className="pt-4 border-t border-white/20">
              <div className="bg-white/30 p-3.5 rounded-2xl space-y-1.5 text-[9.5px] text-[var(--text-secondary)] border border-white/30 premium-shadow">
                <div className="flex items-center gap-1 text-[var(--teal-primary)] font-bold mb-1">
                  <Lock size={11} />
                  <span>Secure Cryptographic Logs</span>
                </div>
                <div>Clearance: <strong>Authorized Clinical Manager</strong></div>
                <div>Status: <strong className="text-emerald-700">Perfect Handshake</strong></div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* ========================================================= */}
      {/* DIALOG 1: INTERACTIVE CONFLICT OF INTEREST FORM MODAL */}
      {/* ========================================================= */}
      {activeFormModal === 'conflict' && (
        <div className="fixed inset-0 z-50 bg-[#6B5A50]/16 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_18px_45px_rgba(82,77,75,0.14)] p-6 md:p-8 space-y-6 border border-white animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            
            {/* Form Header */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded border border-[var(--orange-primary)]/20">
                  Form Tool: GV-FM-006
                </span>
                <h3 className="font-heading text-lg md:text-xl font-extrabold text-[var(--teal-primary)] pt-1">
                  Conflict of Interest Disclosure
                </h3>
              </div>
              <button 
                onClick={() => setActiveFormModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[var(--text-tertiary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleConflictSubmit} className="space-y-5 text-xs text-[var(--text-secondary)] font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase">Full Legal Name</label>
                  <input 
                    type="text" 
                    required 
                    value={conflictForm.fullName}
                    onChange={(e) => setConflictForm({...conflictForm, fullName: e.target.value})}
                    className="w-full border border-neutral-200 px-3 py-2 rounded-xl outline-none focus:border-[var(--teal-primary)] text-xs font-semibold bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase">Organization Role</label>
                  <input 
                    type="text" 
                    required 
                    value={conflictForm.role}
                    onChange={(e) => setConflictForm({...conflictForm, role: e.target.value})}
                    className="w-full border border-neutral-200 px-3 py-2 rounded-xl outline-none focus:border-[var(--teal-primary)] text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Yes/No actual conflicts toggle */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase block">
                  Do you have any actual, potential, or perceived conflicts of interest to disclose?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="conflict-status" 
                      checked={conflictForm.hasConflicts === 'no'}
                      onChange={() => setConflictForm({...conflictForm, hasConflicts: 'no', conflictDescription: ''})}
                    />
                    <span>No conflicts to disclose</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="conflict-status" 
                      checked={conflictForm.hasConflicts === 'yes'}
                      onChange={() => setConflictForm({...conflictForm, hasConflicts: 'yes'})}
                    />
                    <span>Yes, I have items to disclose</span>
                  </label>
                </div>
              </div>

              {conflictForm.hasConflicts === 'yes' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase block">
                    Describe relationships, business interests, or external ownership values:
                  </label>
                  <textarea
                    required
                    value={conflictForm.conflictDescription}
                    onChange={(e) => setConflictForm({...conflictForm, conflictDescription: e.target.value})}
                    placeholder="Provide entity details, relations, or assets..."
                    className="w-full border border-neutral-200 px-3 py-2 rounded-xl outline-none h-20 resize-none font-semibold text-xs bg-white"
                  />
                </div>
              )}

              {/* Perjury attestation check */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={conflictForm.agreed} 
                    onChange={() => setConflictForm({...conflictForm, agreed: !conflictForm.agreed})}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--teal-primary)] focus:ring-[var(--teal-primary)] shrink-0"
                  />
                  <span className="text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    I declare under penalty of perjury that this conflict index is complete, true, and fully represents my current external relationships and administrative ties.
                  </span>
                </label>
              </div>

              {/* Typing signature field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider block">
                  Seal with Digital Signature (Type Full Name)
                </label>
                <input 
                  type="text" 
                  value={conflictForm.signature}
                  onChange={(e) => setConflictForm({...conflictForm, signature: e.target.value})}
                  placeholder="Type signature..."
                  className="w-full border border-neutral-200 px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)] text-xs font-semibold bg-white"
                />

                {conflictForm.signature && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 border text-center relative overflow-hidden">
                    <div className="absolute top-1 left-2 text-[8px] font-bold uppercase text-[var(--text-tertiary)] font-mono">Simulated Attestation Sign-off</div>
                    <div className="font-signature text-2xl text-[var(--teal-primary)] py-2 select-none">
                      {conflictForm.signature}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-[var(--teal-primary)] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[var(--teal-primary)]/90 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  <Check size={14} className="shrink-0" /> Seal & Submit Form
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveFormModal(null)}
                  className="px-4 py-2.5 border rounded-xl text-[var(--text-secondary)] font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DIALOG 2: INTERACTIVE SELF-ASSESSMENT FORM MODAL */}
      {/* ========================================================= */}
      {activeFormModal === 'assessment' && (
        <div className="fixed inset-0 z-50 bg-[#6B5A50]/16 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_18px_45px_rgba(82,77,75,0.14)] p-6 md:p-8 space-y-6 border border-white animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar text-left">
            
            {/* Form Header */}
            <div className="flex justify-between items-start pb-4 border-b border-neutral-100">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded border border-[var(--orange-primary)]/20">
                  Form Tool: GV-FM-008
                </span>
                <h3 className="font-heading text-lg md:text-xl font-extrabold text-[var(--teal-primary)] pt-1">
                  Governing Body Annual Self-Assessment
                </h3>
              </div>
              <button 
                onClick={() => setActiveFormModal(null)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-[var(--text-tertiary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAssessmentSubmit} className="space-y-5 text-xs text-[var(--text-secondary)] font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase">Meetings Attended this Fiscal Cycle</label>
                  <select 
                    value={assessmentForm.meetingsCount}
                    onChange={(e) => setAssessmentForm({...assessmentForm, meetingsCount: e.target.value})}
                    className="w-full border border-neutral-200 px-3 py-2.5 rounded-xl outline-none text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="4">4 Meetings (Fully Compliant)</option>
                    <option value="3">3 Meetings</option>
                    <option value="2">2 Meetings (Incomplete)</option>
                    <option value="1">1 Meeting</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase">Oversight Rating (1-5)</label>
                  <select 
                    value={assessmentForm.oversightRating}
                    onChange={(e) => setAssessmentForm({...assessmentForm, oversightRating: e.target.value})}
                    className="w-full border border-neutral-200 px-3 py-2.5 rounded-xl outline-none text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="5">5 — Exceptional Oversight</option>
                    <option value="4">4 — Good Compliance</option>
                    <option value="3">3 — Satisfactory</option>
                    <option value="2">2 — Needs Structural Revision</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase block">
                  Identify the greatest compliance challenge facing Care Indeed Home Health operations:
                </label>
                <textarea
                  required
                  value={assessmentForm.biggestChallenge}
                  onChange={(e) => setAssessmentForm({...assessmentForm, biggestChallenge: e.target.value})}
                  className="w-full border border-neutral-200 px-3 py-2 rounded-xl outline-none h-20 resize-none font-semibold text-xs bg-white"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={assessmentForm.agreed} 
                    onChange={() => setAssessmentForm({...assessmentForm, agreed: !assessmentForm.agreed})}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--teal-primary)] focus:ring-[var(--teal-primary)] shrink-0"
                  />
                  <span className="text-[11px] leading-relaxed text-[var(--text-secondary)] font-medium">
                    I attest that this evaluation accurately represents the strategic decisions and oversight outcomes of the board meetings.
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider block">
                  Seal with Digital Signature (Type Full Name)
                </label>
                <input 
                  type="text" 
                  value={assessmentForm.signature}
                  onChange={(e) => setAssessmentForm({...assessmentForm, signature: e.target.value})}
                  placeholder="Type signature..."
                  className="w-full border border-neutral-200 px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)] text-xs font-semibold bg-white"
                />

                {assessmentForm.signature && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 border text-center relative overflow-hidden">
                    <div className="absolute top-1 left-2 text-[8px] font-bold uppercase text-[var(--text-tertiary)] font-mono">Simulated Attestation Sign-off</div>
                    <div className="font-signature text-2xl text-[var(--teal-primary)] py-2 select-none">
                      {assessmentForm.signature}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-[var(--teal-primary)] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[var(--teal-primary)]/90 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  <Check size={14} className="shrink-0" /> Submit Self-Assessment
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveFormModal(null)}
                  className="px-4 py-2.5 border rounded-xl text-[var(--text-secondary)] font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE PANEL (⌘K) */}
      {isCommandSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex items-start justify-center p-4 pt-[12vh]"
          onKeyDown={handleCommandSearchKey}
          onClick={() => setIsCommandSearchOpen(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-white/80 backdrop-blur-2xl p-5 space-y-4 animate-fadeIn border border-white shadow-[0_18px_45px_rgba(82,77,75,0.14)] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input 
                type="text"
                autoFocus
                value={commandSearchQuery}
                onChange={(e) => {
                  setCommandSearchQuery(e.target.value);
                  setFocusedSearchIndex(0);
                }}
                placeholder="Type tag index, policy name, or system shortcut to navigate..."
                className="w-full bg-white/60 rounded-full pl-10 pr-12 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] border outline-none focus:bg-white/80"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-tertiary)]">ESC</span>
            </div>

            <div className="space-y-1 max-h-[290px] overflow-y-auto custom-scrollbar">
              {commandSearchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-tertiary)]">
                  No matches found for "{commandSearchQuery}"
                </div>
              ) : (
                commandSearchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      result.action();
                      setIsCommandSearchOpen(false);
                      setCommandSearchQuery('');
                      addToast(`Selected: ${result.title}`, 'success');
                    }}
                    className={cx(
                      "p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all border",
                      idx === focusedSearchIndex 
                        ? "bg-[var(--teal-primary)]/10 border-[var(--teal-primary)]/40 text-[var(--text-primary)]" 
                        : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-white/30"
                    )}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[8.5px] font-bold font-mono tracking-wider text-[var(--teal-primary)] uppercase">
                        {result.type} • {result.id}
                      </span>
                      <span className="text-xs font-semibold mt-0.5">{result.title}</span>
                    </div>
                    <ChevronRight size={13} className="text-[var(--text-tertiary)] shrink-0" />
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2 text-[9px] text-[var(--text-tertiary)] border-t">
              <span>Use arrow keys <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">↑</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">↓</span> to select</span>
              <span>Press <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm">Enter</span> to execute</span>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION STACK */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-white/85 backdrop-blur-xl p-4 md:p-4.5 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/50 animate-fadeIn flex items-center gap-3 min-w-[300px] pointer-events-auto text-left"
          >
            <div className={cx(
              "h-2 w-2 rounded-full", 
              toast.type === 'success' && 'bg-emerald-500', 
              toast.type === 'error' && 'bg-rose-500', 
              toast.type === 'info' && 'bg-[var(--teal-primary)]'
            )} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}