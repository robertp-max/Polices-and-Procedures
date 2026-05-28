import React, { useState, useRef } from 'react';
import { 
  Search, LayoutDashboard, Users, Calendar, User, ShieldCheck, 
  Network, UserPlus, FileText, FileBox, Clock, BookOpen, 
  HelpCircle, PlayCircle, Settings, AlertTriangle, ShieldAlert,
  MoreHorizontal, ArrowRight, Activity, FolderKey, CheckCircle2,
  FileSignature
} from 'lucide-react';

// ============================================================================
// COMPONENT: SpotlightCard
// * UPDATED: Made spotlight 33% stronger via default alpha increases and
// * significantly larger radius (350px fixed instead of 80% container-relative)
// * The container strictly enforces boundaries with overflow-hidden.
// ============================================================================
const SpotlightCard = ({ children, className = '', spotlightColor = 'rgba(255, 255, 255, 0.12)' }) => {
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
      {/* Outer glow behind the card */}
      <div className="spotlight-outer-glow"></div>
      
      {/* Wrapper to strictly clip inner glow to border radius */}
      <div className="spotlight-glow-wrapper">
        <div className="spotlight-inner-glow"></div>
      </div>
      
      {/* Content directly rendered. Elevated via CSS. */}
      {children}
    </div>
  );
};

// ============================================================================
// DATA STRUCTURES 
// ============================================================================

const SIDEBAR_NAV = [
  {
    group: 'PRIMARY OPERATIONS',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
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
      { id: 'policy', label: 'Policy Lifecycle', icon: FileText },
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

const METRICS = [
  { title: 'ACTIVE SPRINT', main: 'Sprint 9', subText: '9 due within 48h', type: 'neutral' },
  { title: 'SPRINT %', main: '0%', subText: '112 blockers', type: 'alert', highlight: 'text-[#C74600]' },
  { title: 'AUDIT READY', main: '0/445', subText: '0/100', type: 'success', highlight: 'text-[#007970]' },
  { title: 'ACTION IN PROGRESS', main: '317', subText: '0 ready to close', type: 'neutral' },
  { title: 'MISSING EVIDENCE', main: '0', subText: '0 pending approval', type: 'neutral' },
  { title: 'CRITICAL ACTIONS', main: '121', subText: '7 at risk', type: 'success', highlight: 'text-[#007970]' },
  { title: 'AUDIT OPEN', main: '1040', subText: '33 awaiting sig', type: 'neutral' },
];

const EVENTS_COLUMNS = [
  {
    id: 'col_critical',
    title: 'Critical & Overdue',
    count: 121,
    icon: AlertTriangle,
    color: 'text-[#C74600]',
    spotlight: 'rgba(199, 70, 0, 0.16)', // UPDATED: 33% stronger
    cards: [
      { id: 'e1', category: 'QAPI', title: 'Incident / Adverse Event Review', role: 'CM', assignee: 'Clinical Manager', time: '121D PAST', status: 'critical' },
      { id: 'e2', category: 'COMPLIANCE', title: 'Complaint / Grievance Investigation', role: 'CO', assignee: 'Compliance Officer', time: '121D PAST', status: 'critical' },
      { id: 'e3', category: 'CLINICAL', title: 'Plan of Care Audit', role: 'QA', assignee: 'QA Reviewer (RN)', time: '121D PAST', status: 'critical' },
    ]
  },
  {
    id: 'col_risk',
    title: 'At Risk',
    count: 7,
    icon: Clock,
    color: 'text-yellow-500',
    spotlight: 'rgba(234, 179, 8, 0.14)', // UPDATED: 33% stronger
    cards: [
      { id: 'e5', category: 'GOVERNANCE', title: 'Governing Body Mtg (Prep - Owner Brief)', role: 'DA', assignee: 'D. Alvarez', time: 'TOMORROW', status: 'risk' },
      { id: 'e6', category: 'QAPI', title: 'QAPI Committee Meeting', role: 'MC', assignee: 'M. Chen', time: '3D', status: 'risk' },
    ]
  },
  {
    id: 'col_progress',
    title: 'In Progress',
    count: 317,
    icon: Activity,
    color: 'text-blue-400',
    spotlight: 'rgba(96, 165, 250, 0.14)', // UPDATED: 33% stronger
    cards: [
      { id: 'e9', category: 'COMPLIANCE', title: 'Compliance Report (Weekly Snapshot)', role: 'LW', assignee: 'L. Washington', time: 'TOMORROW', status: 'progress' },
      { id: 'e10', category: 'CLINICAL', title: '30-Day Episode Review', role: 'SA', assignee: 'S. Ahmed', time: '8D', status: 'progress' },
    ]
  },
  {
    id: 'col_awaiting',
    title: 'Awaiting Action / Evidence',
    count: 5,
    icon: FolderKey,
    color: 'text-[#A0ABC0]',
    spotlight: 'rgba(255, 255, 255, 0.11)', // UPDATED: 33% stronger
    cards: [
      { id: 'e13', category: 'QAPI', title: 'Q2 QAPI Review', role: 'CM', assignee: 'Clinical Manager', time: '3D PAST', status: 'awaiting' },
      { id: 'e14', category: 'CLINICAL', title: 'Q1 Infection Control Review', role: 'CM', assignee: 'Clinical Manager', time: '14D PAST', status: 'awaiting' },
    ]
  }
];

const PLANNER_TASKS = [
  { id: 'p1', title: 'Distribute agenda & pre-read packet', due: 'Due May 8', status: 'overdue' },
  { id: 'p2', title: 'Review risk/safety audit results from RM-WP-16..20', due: 'Due May 8', status: 'overdue' },
  { id: 'p3', title: 'Review adverse events & RCAs', due: 'Due May 8', status: 'overdue' },
  { id: 'p4', title: 'Decide on priority actions / new PIPs / CAPs', due: 'Due May 8', status: 'overdue' },
  { id: 'p5', title: 'Review compliance/billing audit results from CO-WP-25..30', due: 'Due May 10', status: 'upcoming' },
  { id: 'p6', title: 'Review IT/security audit results from IT-WP-21..25', due: 'Due May 10', status: 'upcoming' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DashboardApp() {
  // * UPDATED: State to manage the cohesive toggle between Agency View and My Planner
  const [activeView, setActiveView] = useState('agency');

  return (
    <div className="flex h-screen w-full bg-[#0B0F15] text-slate-200 font-sans overflow-hidden selection:bg-[#007970]/30 selection:text-white">
      
      {/* GLOBAL STYLES FOR SPOTLIGHT & SCROLLBAR */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A3441; }
        
        /* SpotlightCard Styles */
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
        .card-spotlight:hover {
          border-color: #2A3441;
        }

        /* Elevate all direct children above the glows */
        .card-spotlight > :not(.spotlight-outer-glow):not(.spotlight-glow-wrapper) {
          position: relative;
          z-index: 10;
        }

        /* Outer Glow (Behind the container) */
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

        /* Wrapper to strictly clip inner glow to the border radius */
        .spotlight-glow-wrapper {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        /* Inner Glow */
        .spotlight-inner-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .card-spotlight:hover .spotlight-outer-glow,
        .card-spotlight:focus-within .spotlight-outer-glow,
        .card-spotlight:hover .spotlight-inner-glow,
        .card-spotlight:focus-within .spotlight-inner-glow {
          opacity: 1;
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
        MAIN CONTENT
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
                <span className="text-white">Sunday, May 10</span>
              </div>
            </div>
            
            <div className="h-6 w-px bg-[#1C2433]"></div>
            
            <div className="flex items-center gap-4">
              
              {/* * UPDATED: Cohesive Toggle Component without ugly low-opacity orange glass. 
                  Uses clear/transparent backgrounds for inactive, and bold solid pills for active. */}
              <div className="flex bg-[#141A23] border border-[#1C2433] rounded-full p-1 shadow-inner">
                <button 
                  onClick={() => setActiveView('agency')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeView === 'agency' 
                      ? 'bg-[#C74600] text-white shadow-[0_2px_8px_rgba(199,70,0,0.4)]' 
                      : 'text-[#8A94A6] hover:text-white hover:bg-[#1C2433]'
                  }`}
                >
                  <ShieldAlert size={14} /> Agency View
                </button>
                <button 
                  onClick={() => setActiveView('planner')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    activeView === 'planner' 
                      ? 'bg-[#007970] text-white shadow-[0_2px_8px_rgba(0,121,112,0.4)]' 
                      : 'text-[#8A94A6] hover:text-white hover:bg-[#1C2433]'
                  }`}
                >
                  <Calendar size={14} /> My Planner
                </button>
              </div>

              <button className="w-8 h-8 rounded-full bg-[#141A23] border border-[#1C2433] flex items-center justify-center hover:border-[#4A5568] transition-colors">
                <span className="text-xs font-bold text-[#007970]">TP</span>
              </button>
            </div>
          </div>
        </header>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
          
          {/* DYNAMIC CONTENT BASED ON TOGGLE */}
          {activeView === 'agency' ? (
            <>
              {/* === AGENCY VIEW: HERO SECTION === */}
              <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-[#0F131A] to-[#0B0F15] border-b border-[#1C2433]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#007970] shadow-[0_0_8px_rgba(0,121,112,0.8)]"></div>
                  <span className="text-[10px] font-bold text-[#007970] uppercase tracking-widest">Command Center</span>
                  <span className="text-[#5E6A7F] mx-1">•</span>
                  <span className="text-[10px] font-bold text-[#5E6A7F] uppercase tracking-widest">What needs action now</span>
                </div>
                
                <h1 className="text-4xl font-semibold text-white tracking-tight mb-3">What needs action now</h1>
                <p className="text-sm text-[#8A94A6] max-w-3xl leading-relaxed">
                  Executive operational narrative for compliance execution, evidence readiness, and escalation control.<br/>
                  Prioritize critical controls, clear risk queues, and lock evidence-ready workflows.
                </p>
              </div>

              {/* === AGENCY VIEW: METRICS STRIP === */}
          <div className="px-8 py-6 border-b border-[#1C2433]">
            <div className="flex items-stretch gap-4 overflow-x-auto custom-scrollbar pb-2">
              {METRICS.map((metric, idx) => (
                <SpotlightCard 
                  key={idx} 
                  className="flex flex-col h-full flex-shrink-0 min-w-[160px] p-4 bg-[#141A23]"
                  spotlightColor={
                    metric.type === 'alert' ? 'rgba(199, 70, 0, 0.20)' : // UPDATED: 33% stronger alpha
                        metric.type === 'success' ? 'rgba(0, 121, 112, 0.20)' : 
                        'rgba(255, 255, 255, 0.12)'
                      }
                    >
                      <div className="text-[10px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-2 truncate">
                        {metric.title}
                      </div>
                      <div className={`text-2xl font-semibold mb-1 ${metric.highlight || 'text-white'}`}>
                        {metric.main}
                      </div>
                      <div className="text-[11px] font-medium text-[#8A94A6]">
                        {metric.subText}
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>

              {/* === AGENCY VIEW: READINESS BANNER === */}
              <div className="px-8 py-4">
                <SpotlightCard 
                  className="p-4 border-[#1C2433] bg-[#141A23] flex items-center justify-between"
                  spotlightColor="rgba(199, 70, 0, 0.25)" // Stronger spotlight
                >
                  <div className="flex items-center gap-4">
                    {/* * UPDATED: Removed ugly low opacity bg box. Now uses clear background with raw icon to match column headers. */}
                    <div className="flex items-center justify-center p-2">
                      <ShieldAlert size={28} className="text-[#C74600]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#C74600] uppercase tracking-wider mb-1">
                        Agency Readiness - Not Ready
                      </div>
                      <div className="text-sm text-[#E2E8F0]">
                        89 overdue • 32 blocked. Immediate action needed to avoid compliance risk.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B0F15] rounded-full border border-[#1C2433]">
                      <span className="text-[10px] text-[#8A94A6] uppercase tracking-wider">At Risk</span>
                      <span className="text-[#C74600] font-mono font-bold text-sm">7</span>
                    </div>
                    {/* * UPDATED: Bold Pill format requested by user. Solid orange background, rounded full. */}
                    <button className="text-xs font-bold text-white bg-[#C74600] hover:bg-[#A33900] px-5 py-2.5 rounded-full transition-colors shadow-[0_4px_12px_rgba(199,70,0,0.3)]">
                      View Readiness Report
                    </button>
                  </div>
                </SpotlightCard>
              </div>

              {/* === AGENCY VIEW: EVENTS BOARD === */}
              <div className="flex-1 flex flex-col min-h-0 px-8 pb-8 pt-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-1">Events</h2>
                    <p className="text-[#5E6A7F] text-xs">Project events and regulatory deadlines requiring action.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-[#8A94A6]">
                    Sort
                    <span className="text-[#5E6A7F] mx-1">|</span>
                    Filter by: <span className="text-white bg-[#141A23] border border-[#1C2433] px-3 py-1.5 rounded-full cursor-pointer hover:border-[#2A3441]">Priority</span>
                  </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-x-auto custom-scrollbar items-start pb-4">
                  {EVENTS_COLUMNS.map((col) => {
                    const ColIcon = col.icon;
                    return (
                      <div key={col.id} className="w-[320px] flex-shrink-0 flex flex-col gap-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {/* Clear background icon as requested */}
                            <ColIcon size={14} className={col.color} />
                            <span className="text-xs font-bold text-white tracking-wide">{col.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#5E6A7F] bg-[#141A23] border border-[#1C2433] px-2 py-0.5 rounded-md">
                            {col.count}
                          </span>
                        </div>

                        {col.cards.map((card) => (
                      <SpotlightCard 
                        key={card.id} 
                        className="flex flex-col h-full p-4 cursor-pointer group"
                        spotlightColor={col.spotlight}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[9px] font-bold text-[#8A94A6] tracking-widest uppercase">
                                {card.category}
                              </span>
                              <button className="text-[#5E6A7F] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                            
                            <h4 className="text-sm font-medium text-white leading-snug mb-5 group-hover:text-[#007970] transition-colors">
                              {card.title}
                            </h4>

                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-[#1C2433] border border-[#2A3441] flex items-center justify-center text-[9px] font-bold text-[#A0ABC0]">
                                  {card.role}
                                </div>
                                <span className="text-[11px] font-medium text-[#8A94A6] truncate max-w-[100px]">
                                  {card.assignee}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                                  card.status === 'critical' ? 'text-[#C74600]' : 
                                  card.status === 'progress' || card.status === 'risk' ? 'text-[#007970]' : 
                                  'text-[#5E6A7F]'
                                }`}>
                                  {card.time}
                                </span>
                                <ArrowRight size={12} className="text-[#5E6A7F] group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </SpotlightCard>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            /* === MY PLANNER VIEW === */
            /* Added conditionally based on the new view toggle */
            <div className="flex flex-col h-full animate-fadeIn">
              <div className="px-8 pt-8 pb-4 bg-[#0B0F15] border-b border-[#1C2433]">
                <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">My Planner</h1>
                <p className="text-sm text-[#8A94A6]">Your personal workload. CEO obligations assigned to you + your teams.</p>
                
                <div className="flex items-center gap-6 mt-6">
                  {['All My Work', 'Open', 'Overdue', 'This Week', 'Evidence Room'].map((tab, i) => (
                    <button key={i} className={`text-xs font-semibold pb-3 border-b-2 transition-colors ${
                      i === 0 ? 'border-[#007970] text-[#007970]' : 'border-transparent text-[#5E6A7F] hover:text-[#A0ABC0]'
                    }`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-8 py-6 bg-[#0B0F15] flex-1">
                <div className="flex gap-8">
                  {/* Left Column: Overdue Tasks */}
                  <div className="flex-1 max-w-xl space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={14} className="text-[#C74600]" />
                      <h3 className="text-sm font-bold text-white">My Critical & Overdue</h3>
                      <span className="text-xs text-[#5E6A7F] font-mono ml-auto">4</span>
                    </div>

                    {PLANNER_TASKS.filter(t => t.status === 'overdue').map((task) => (
                      <SpotlightCard key={task.id} className="p-4" spotlightColor="rgba(199, 70, 0, 0.12)">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="text-[10px] text-[#5E6A7F] uppercase tracking-wider mb-1">CLINICAL</div>
                            <div className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</div>
                            <div className="text-[10px] font-mono text-[#C74600] font-bold">{task.due}</div>
                          </div>
                          <button className="w-6 h-6 rounded-md border border-[#2A3441] flex items-center justify-center text-[#5E6A7F] hover:bg-[#1C2433] transition-colors">
                            <MoreHorizontal size={12} />
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>

                  {/* Right Column: Upcoming Tasks */}
                  <div className="flex-1 max-w-xl space-y-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar size={14} className="text-[#007970]" />
                      <h3 className="text-sm font-bold text-white">This Sprint & Upcoming</h3>
                      <span className="text-xs text-[#5E6A7F] font-mono ml-auto">28</span>
                    </div>

                    {PLANNER_TASKS.filter(t => t.status === 'upcoming').map((task) => (
                      <SpotlightCard key={task.id} className="p-4" spotlightColor="rgba(0, 121, 112, 0.12)">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="text-[10px] text-[#5E6A7F] uppercase tracking-wider mb-1">QAPI</div>
                            <div className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</div>
                            <div className="text-[10px] font-mono text-[#5E6A7F] font-bold">{task.due}</div>
                          </div>
                          <button className="w-6 h-6 rounded-md border border-[#2A3441] flex items-center justify-center text-[#5E6A7F] hover:bg-[#1C2433] transition-colors">
                            <MoreHorizontal size={12} />
                          </button>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      
      {/* Simple fade animation for switching views cleanly */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}