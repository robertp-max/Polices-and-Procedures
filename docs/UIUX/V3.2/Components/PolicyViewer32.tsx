import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, LayoutDashboard, Users, Calendar, User, ShieldCheck, 
  Network, UserPlus, FileText, FileBox, Clock, BookOpen, 
  HelpCircle, PlayCircle, Settings, AlertTriangle, ShieldAlert,
  Activity, FolderKey, ChevronRight, Printer, Download, History,
  CheckCircle2, Info
} from 'lucide-react';

// ============================================================================
// COMPONENT: SpotlightCard (From Dashboard Architecture)
// ============================================================================
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.08)' }) => {
  const divRef = useRef(null);

  const handleMouseMove = e => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      <div className="spotlight-outer-glow"></div>
      <div className="spotlight-glow-wrapper">
        <div className="spotlight-inner-glow"></div>
      </div>
      {children}
    </div>
  );
};

// ============================================================================
// DATA STRUCTURES: SIDEBAR & NAVIGATION
// ============================================================================
const SIDEBAR_NAV = [
  {
    group: 'PRIMARY OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'clinicians', label: 'Clinician Profiles', icon: Users },
      { id: 'patients', label: 'Patient Profiles', icon: User },
      { id: 'calendar', label: 'Calendar', icon: Calendar },
      { id: 'brad', label: 'Brad', icon: Activity },
    ]
  },
  {
    group: 'COMPLIANCE EXECUTION',
    items: [
      { id: 'ces', label: 'Compliance Execution (CES)', icon: ShieldCheck },
      { id: 'taxonomy', label: 'Taxonomy', icon: Network },
      { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
      { id: 'policy', label: 'Policy Lifecycle', icon: FileText, active: true }, // Active Tab
      { id: 'evidence', label: 'Evidence', icon: FileBox },
    ]
  },
  {
    group: 'ADMINISTRATION / KNOWLEDGE',
    items: [
      { id: 'hubstaff', label: 'Hubstaff', icon: Clock },
      { id: 'sysdocs', label: 'System Documentation', icon: BookOpen },
      { id: 'help', label: 'Help Center', icon: HelpCircle },
      { id: 'demo', label: 'Demo', icon: PlayCircle },
      { id: 'admin', label: 'Admin', icon: Settings },
    ]
  }
];

const POLICY_TABS = [
  'Overview & Definitions', 
  'Policy Statements', 
  'Procedures', 
  'Documentation', 
  'Compliance & Audit', 
  'References & Admin', 
  'Appendices (Forms)'
];

// ============================================================================
// DATA STRUCTURES: POLICY CONTENT (GV-GB-001)
// ============================================================================
const POLICY_METADATA = {
  id: 'GV-GB-001',
  title: 'Governing Body Authority & Responsibilities',
  domain: 'GV - Governance & Administration',
  tier: 'REQUIRED',
  approvedBy: 'Governing Body Chair - Care Indeed Home Health Care, Inc.',
  supersedes: 'N/A (Initial Version)',
  effectiveDate: '2025-07-10',
  lastReviewed: '2025-07-10',
  nextReview: '2026-07-10',
  version: 'v6.0'
};

const DEFINITIONS = [
  { title: 'Governing Body', text: 'The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of Care Indeed Home Health Care, Inc., as defined by 42 CFR § 484.2 and § 484.105.' },
  { title: 'Administrator', text: 'The individual appointed by the Governing Body who is responsible for managing the agency\'s day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable California state law.' },
  { title: 'Clinical Manager', text: 'The registered nurse (or qualified individual per California state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON).' },
  { title: 'Fiduciary Duty', text: 'The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves.' },
  { title: 'Quorum', text: 'The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency\'s bylaws or operating agreement.' },
  { title: 'QAPI', text: 'Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement.' }
];

const STATEMENTS = [
  { id: '4.1', text: 'Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).' },
  { id: '4.2', text: 'The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.' },
  { id: '4.3', text: 'The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.' },
  { id: '4.4', text: 'The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).' },
  { id: '4.5', text: 'The Governing Body shall approve and oversee the agency\'s: Scope of services (GV-OG-003), Organizational structure and reporting lines (GV-OG-001), Annual strategic plan and operational goals (GV-OG-004), Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002), QAPI program (QA-PG-001, QA-PG-002), Corporate compliance program (CO-CP-001), Annual operating budget (FN-FP-005), Emergency preparedness plan (OP-FM-005).' },
  { id: '4.6', text: 'The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.' },
];

const PROCEDURES_6_1 = [
  { step: '6.1.1', party: 'Agency Owner / Corporate Entity', action: 'Formally establish the Governing Body through articles of incorporation, operating agreement, partnership agreement, or equivalent legal instrument for Care Indeed Home Health Care, Inc. The establishing document must identify: (a) the legal form of the Governing Body; (b) the minimum and maximum number of members; (c) the quorum requirement; (d) the terms of appointment or election.', time: 'Prior to initial Medicare certification and maintained continuously thereafter.' },
  { step: '6.1.2', party: 'Governing Body Chair', action: 'Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration date, voting status, and contact information.', time: 'Updated within 7 calendar days of any membership change.' },
  { step: '6.1.3', party: 'Governing Body', action: 'Ensure composition includes, at minimum, individuals with competency in: (a) healthcare operations or clinical services; (b) financial management; (c) regulatory compliance. If any competency area is not represented by a current member, the Governing Body shall retain qualified advisory counsel within 30 calendar days.', time: 'Ongoing; reviewed annually at the first quarterly meeting of each calendar year.' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function PolicyViewerApp() {
  const [activeTab, setActiveTab] = useState(POLICY_TABS[0]);
  const [procTab, setProcTab] = useState('6.1 Establishment');

  // Helper to render the content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview & Definitions':
        return (
          <div className="space-y-10">
            {/* Document Header Metadata Spotlight - MOVED HERE */}
            <SpotlightCard className="p-6" spotlightColor="rgba(0, 121, 112, 0.15)">
              <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                {POLICY_METADATA.title}
              </h1>
              <div className="text-[10px] font-mono text-[#007970] mb-8 uppercase tracking-widest flex items-center gap-2">
                POLICY ID: {POLICY_METADATA.id}
                <div className="h-1 w-1 rounded-full bg-[#007970]"></div>
                ACTIVE
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 pt-6 border-t border-[#1C2433]">
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Domain</div>
                  <div className="text-sm font-medium text-[#E2E8F0]">{POLICY_METADATA.domain}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Tier</div>
                  <div className="text-sm font-bold text-white tracking-wide">{POLICY_METADATA.tier}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Approved By</div>
                  <div className="text-sm font-medium text-[#E2E8F0]">{POLICY_METADATA.approvedBy}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Supersedes</div>
                  <div className="text-sm font-medium text-[#8A94A6]">{POLICY_METADATA.supersedes}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Effective Date</div>
                  <div className="text-sm font-mono text-white">{POLICY_METADATA.effectiveDate}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Last Reviewed</div>
                  <div className="text-sm font-mono text-[#8A94A6]">{POLICY_METADATA.lastReviewed}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Next Review</div>
                  <div className="text-sm font-mono text-[#8A94A6]">{POLICY_METADATA.nextReview}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-1">Version</div>
                  <div className="text-sm font-mono text-white">{POLICY_METADATA.version}</div>
                </div>
              </div>
            </SpotlightCard>

            {/* Purpose & Scope Grid */}
            <div className="grid grid-cols-2 gap-10">
              {/* Purpose */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">2</div>
                  <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Purpose</h3>
                </div>
                <p className="text-sm text-[#E2E8F0] leading-relaxed">
                  This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of Care Indeed Home Health Care, Inc. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in <span className="text-white font-medium">42 CFR § 484.105 — Condition of Participation: Organization and Administration of Services</span>, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency's overall operation and management.
                </p>
              </section>

              {/* Scope */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">3</div>
                  <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Scope</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-white">This policy applies to:</p>
                  <ul className="space-y-3">
                    {[
                      'All members of the Governing Body of Care Indeed Home Health Care, Inc. (including voting and non-voting members)',
                      'The Agency Administrator',
                      'The Director of Nursing / Clinical Manager',
                      'The Compliance Officer',
                      'All senior leadership personnel who report directly to the Governing Body or Administrator',
                      'All contracted management entities performing governing body functions on behalf of the agency'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#007970] mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#E2E8F0] leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Exclusion Warning Box */}
                  <div className="mt-6 p-4 rounded-lg bg-[#C74600]/10 border border-[#C74600]/30 flex gap-3">
                    <Info size={16} className="text-[#C74600] mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-[#C74600] leading-relaxed">
                      This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Definitions Grid */}
            <section className="pt-6 border-t border-[#1C2433]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">5</div>
                <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Definitions</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFINITIONS.map((def, i) => (
                  <SpotlightCard key={i} className="p-5 h-full flex flex-col" spotlightColor="rgba(0, 121, 112, 0.12)">
                    <h4 className="text-[13px] font-bold text-white mb-2 tracking-wide">{def.title}</h4>
                    <p className="text-xs text-[#8A94A6] leading-relaxed flex-1">{def.text}</p>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          </div>
        );

      case 'Policy Statements':
        return (
          <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">4</div>
              <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Policy Statements</h3>
            </div>
            
            <div className="space-y-3">
              {STATEMENTS.map((stmt) => (
                <SpotlightCard key={stmt.id} className="p-4" spotlightColor="rgba(255, 255, 255, 0.08)">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#007970]/10 border border-[#007970]/30 text-[#007970] flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {stmt.id}
                    </div>
                    <p className="text-sm text-[#E2E8F0] leading-relaxed pt-1">
                      {stmt.text}
                    </p>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        );

      case 'Procedures':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded border border-[#1C2433] bg-[#141A23] flex items-center justify-center text-[10px] font-mono text-[#007970]">6</div>
              <h3 className="text-sm font-bold text-[#8A94A6] uppercase tracking-widest">Procedures</h3>
            </div>

            {/* Procedure Sub-Tabs */}
            <div className="flex gap-6 border-b border-[#1C2433]">
              {['6.1 Establishment', '6.2 Core Responsibilities', '6.3 Meetings', '6.4 Conflict of Interest', '6.5 Escalation'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setProcTab(tab)}
                  className={`text-xs font-medium pb-3 transition-colors border-b-2 ${
                    procTab === tab ? 'border-[#C74600] text-[#C74600]' : 'border-transparent text-[#5E6A7F] hover:text-[#A0ABC0]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Procedure Data Table */}
            {procTab === '6.1 Establishment' && (
              <div className="animate-fadeInSlideUp">
                <h4 className="text-lg font-medium text-white mb-4">6.1 Establishment and Composition</h4>
                <div className="rounded-xl border border-[#1C2433] bg-[#0F131A] overflow-hidden shadow-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#141A23] border-b border-[#1C2433]">
                        <th className="py-3 px-4 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider w-[10%]">Step</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider w-[20%]">Responsible Party</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider w-[45%]">Action</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider w-[25%]">Timeframe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2433]">
                      {PROCEDURES_6_1.map((row) => (
                        <tr key={row.step} className="hover:bg-[#1C2433]/40 transition-colors group">
                          <td className="py-4 px-4 text-xs font-mono text-[#A0ABC0] align-top">{row.step}</td>
                          <td className="py-4 px-4 text-xs font-medium text-white align-top">{row.party}</td>
                          <td className="py-4 px-4 text-xs text-[#8A94A6] leading-relaxed align-top group-hover:text-[#E2E8F0] transition-colors">{row.action}</td>
                          <td className="py-4 px-4 text-xs text-[#8A94A6] leading-relaxed align-top">{row.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <FileText size={48} className="text-[#5E6A7F] mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Content under construction</h3>
            <p className="text-sm text-[#8A94A6]">The {activeTab} section is currently being updated to the new format.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0B0F15] text-slate-200 font-sans overflow-hidden selection:bg-[#007970]/30 selection:text-white">
      
      {/* GLOBAL CSS: Architecture & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A3441; }
        
        /* SpotlightCard Container */
        .card-spotlight {
          position: relative;
          border-radius: 0.75rem;
          border: 1px solid #1C2433;
          background-color: #141A23;
          --mouse-x: 50%;
          --mouse-y: 50%;
          --spotlight-color: rgba(255, 255, 255, 0.08);
          transition: border-color 0.3s ease;
        }
        .card-spotlight:hover { border-color: #2A3441; }

        .card-spotlight > :not(.spotlight-outer-glow):not(.spotlight-glow-wrapper) {
          position: relative;
          z-index: 10;
        }

        .spotlight-outer-glow {
          position: absolute;
          inset: -16px; 
          border-radius: 1.5rem; 
          background: radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 50%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: -1;
          filter: blur(20px);
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
          background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .card-spotlight:hover .spotlight-outer-glow,
        .card-spotlight:hover .spotlight-inner-glow {
          opacity: 1;
        }

        /* Beautiful React Transition Engine (Key-Remount) */
        @keyframes fadeInSlideUp {
          0% { opacity: 0; transform: translateY(12px) scale(0.995); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fadeInSlideUp {
          animation: fadeInSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }
      `}} />

      {/* =======================================================================
        SIDEBAR
        ======================================================================= */}
      <aside className="w-[260px] flex-shrink-0 border-r border-[#1C2433] bg-[#0F131A] flex flex-col h-full z-20">
        <div className="h-[72px] flex items-center px-6 border-b border-[#1C2433]">
          <div className="flex items-center gap-2 text-white font-semibold text-lg tracking-wide">
            <div className="w-8 h-8 bg-gradient-to-br from-[#007970] to-[#004142] rounded-lg flex items-center justify-center shadow-lg shadow-[#007970]/20">
              <Activity size={16} className="text-white" />
            </div>
            CareIndeed
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8">
          {SIDEBAR_NAV.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-[10px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3 px-2">
                {section.group}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        item.active 
                          ? 'bg-[#007970]/10 text-[#007970]' 
                          : 'text-[#A0ABC0] hover:bg-[#1C2433] hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={item.active ? "text-[#007970]" : "text-[#5E6A7F]"} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* =======================================================================
        MAIN CONTENT: POLICY VIEWER
        ======================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0F15] relative z-10">
        
        {/* TOP HEADER */}
        <header className="h-[72px] flex-shrink-0 border-b border-[#1C2433] bg-[#0F131A]/80 backdrop-blur-md flex items-center justify-between px-8 z-20 sticky top-0">
          <div className="flex-1 flex items-center max-w-2xl">
            <div className="relative w-full max-w-md group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6A7F] group-focus-within:text-[#007970] transition-colors" />
              <input 
                type="text" 
                placeholder="Search policies, tasks, evidence..." 
                className="w-full bg-[#141A23] border border-[#1C2433] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-[#5E6A7F] focus:outline-none focus:border-[#007970] focus:ring-1 focus:ring-[#007970]/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-medium text-[#8A94A6]">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-[10px] text-[#5E6A7F] uppercase tracking-wider">Today</span>
                <span className="text-white">Wednesday, May 27</span>
              </div>
            </div>
            <div className="h-6 w-px bg-[#1C2433]"></div>
            <button className="w-8 h-8 rounded-full bg-[#141A23] border border-[#1C2433] flex items-center justify-center hover:border-[#4A5568] transition-colors">
              <span className="text-xs font-bold text-[#007970]">TP</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE DOCUMENT BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
          
          <div className="px-8 pt-8 pb-12 max-w-7xl mx-auto w-full">
            
            {/* Breadcrumb & Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-[#5E6A7F] hover:text-white cursor-pointer transition-colors">Library</span>
                <ChevronRight size={14} className="text-[#5E6A7F]" />
                <span className="text-[#007970] font-mono tracking-wide">{POLICY_METADATA.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1C2433] bg-[#141A23] hover:bg-[#1C2433] text-[#A0ABC0] hover:text-white text-xs font-medium transition-colors">
                  <History size={14} /> Version History
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#1C2433] bg-[#141A23] hover:bg-[#1C2433] text-[#A0ABC0] hover:text-white text-xs font-medium transition-colors">
                  <Download size={14} /> Export PDF
                </button>
                <button className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-[#007970] hover:bg-[#009085] text-white text-xs font-semibold transition-colors shadow-lg shadow-[#007970]/20">
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>

            {/* Content Tabs Navigation */}
            <div className="flex overflow-x-auto custom-scrollbar border-b border-[#1C2433] mb-8 sticky top-0 bg-[#0B0F15] z-10 pt-2">
              {POLICY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-1 py-3 mr-8 text-[13px] font-medium transition-all relative ${
                    activeTab === tab ? 'text-[#007970]' : 'text-[#8A94A6] hover:text-white'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007970] shadow-[0_-2px_8px_rgba(0,121,112,0.6)] rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content Wrapper with Key-Remount Animation Engine */}
            {/* Changing the key forces React to re-mount the div, triggering the CSS slide-up animation perfectly every time. */}
            <div key={activeTab} className="animate-fadeInSlideUp">
              {renderTabContent()}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}