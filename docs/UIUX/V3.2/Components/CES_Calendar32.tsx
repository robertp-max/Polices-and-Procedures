import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, LayoutDashboard, Users, Calendar, User, ShieldCheck, 
  Network, UserPlus, FileText, FileBox, Clock, BookOpen, 
  HelpCircle, PlayCircle, Settings, Activity, ChevronRight, 
  ChevronLeft, RefreshCw, KanbanSquare, AlignLeft, Filter
} from 'lucide-react';

// ============================================================================
// COMPONENT: SpotlightCard (Dual-layer ambient glow architecture)
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
// DATA STRUCTURES
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
      { id: 'ces', label: 'Compliance Execution (CES)', icon: ShieldCheck, active: true },
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

const CES_TABS = ['CALENDAR', 'SPRINT BOARD', 'WORKFLOWS', 'MASTER CONTROLS', 'AUDIT MODE', 'EVIDENCE CENTER', 'REPORTS'];

// Roles extracted from img4 for filtering
const ROLES = [
  'QAPI LEAD / CHAIR',
  'DATA ANALYST / QUALITY SOURCE',
  'CLINICAL MANAGER',
  'COMPLIANCE OFFICER',
  'INFECTION PREVENTIONIST',
  'COMMITTEE / VOTING MEMBERS',
  'SCRIBE',
  'GOVERNING BODY'
];

const MOCK_EVENTS = [
  { id: 1, title: 'Monthly OIG/SAM Exclusion Check', date: 5, span: 2, status: 'block', kanban: 'done', role: 'COMPLIANCE OFFICER' },
  { id: 2, title: 'Q2 QAPI Review', date: 7, span: 3, status: 'block', kanban: 'review', role: 'QAPI LEAD / CHAIR' },
  { id: 3, title: 'Plan of Care Audit', date: 7, span: 1, status: 'block', kanban: 'todo', role: 'CLINICAL MANAGER' },
  { id: 4, title: 'Governing Body Mtg (Prep)', date: 11, span: 1, status: 'due', kanban: 'progress', role: 'GOVERNING BODY' },
  { id: 5, title: 'Compliance Report (Weekly)', date: 11, span: 1, status: 'due', kanban: 'todo', role: 'COMPLIANCE OFFICER' },
  { id: 6, title: 'QAPI Committee Meeting', date: 12, span: 1, status: 'due', kanban: 'progress', role: 'QAPI LEAD / CHAIR' },
  { id: 7, title: 'Claims Submission Cycle', date: 13, span: 2, status: 'due', kanban: 'todo', role: 'DATA ANALYST / QUALITY SOURCE' },
  { id: 8, title: 'Post-Bill Claims Audit', date: 14, span: 1, status: 'due', kanban: 'todo', role: 'COMPLIANCE OFFICER' },
  { id: 9, title: '30-Day Episode Review', date: 18, span: 1, status: 'track', kanban: 'progress', role: 'CLINICAL MANAGER' },
  { id: 10, title: 'Infection Control Review', date: 19, span: 1, status: 'track', kanban: 'todo', role: 'INFECTION PREVENTIONIST' },
  { id: 11, title: 'Security Incidents Review', date: 20, span: 1, status: 'track', kanban: 'todo', role: 'COMPLIANCE OFFICER' },
  { id: 12, title: 'Physician Signatures Due', date: 21, span: 1, status: 'track', kanban: 'blocked', role: 'CLINICAL MANAGER' },
  { id: 13, title: 'QAPI Data Dashboard Refresh', date: 22, span: 1, status: 'track', kanban: 'review', role: 'DATA ANALYST / QUALITY SOURCE' }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function ComplianceExecutionApp() {
  const [activeTab, setActiveTab] = useState('CALENDAR');
  const [viewType, setViewType] = useState('calendar'); // 'calendar' | 'kanban' | 'gantt'
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Filter events based on selected roles
  const filteredEvents = useMemo(() => {
    if (selectedRoles.length === 0) return MOCK_EVENTS;
    return MOCK_EVENTS.filter(event => selectedRoles.includes(event.role));
  }, [selectedRoles]);

  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  // Helper to render event styles based on status
  const getEventStyle = (status) => {
    switch (status) {
      case 'block': return 'bg-[#FFE4E6] text-[#BE123C] border-[#FDA4AF]'; // Light Pink/Red
      case 'due': return 'bg-[#854D0E] text-white border-[#A16207]'; // Brown/Orange
      case 'track': return 'bg-[#0F766E] text-white border-[#115E59]'; // Teal
      default: return 'bg-[#1C2433] text-[#A0ABC0] border-[#2A3441]';
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
        
        /* SpotlightCard Architecture */
        .card-spotlight {
          position: relative;
          border-radius: 0.5rem;
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
          border-radius: 1rem; 
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

        /* Beautiful React Transition Engine */
        @keyframes fadeInSlideUp {
          0% { opacity: 0; transform: translateY(12px) scale(0.995); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeInSlideUp {
          animation: fadeInSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        /* Grid specific utilities */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          grid-auto-rows: minmax(120px, auto);
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
        <header className="h-[72px] flex-shrink-0 border-b border-[#1C2433] bg-[#0F131A] flex items-center justify-between px-8 z-20">
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
          <button className="w-8 h-8 rounded-full bg-[#141A23] border border-[#1C2433] flex items-center justify-center hover:border-[#4A5568] transition-colors">
            <span className="text-xs font-bold text-[#007970]">TP</span>
          </button>
        </header>

        {/* CES HEADER & CONTROLS */}
        <div className="border-b border-[#1C2433] bg-[#0F131A] flex-shrink-0">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-8 px-8 pt-4">
            {CES_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] font-bold tracking-widest pb-3 border-b-2 transition-colors ${
                  activeTab === tab ? 'border-[#007970] text-[#007970]' : 'border-transparent text-[#5E6A7F] hover:text-[#A0ABC0]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* View Toggles & Actions */}
          <div className="px-8 py-4 flex items-center justify-between bg-[#0B0F15]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1 text-[10px] font-bold text-[#007970] uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-[#007970]"></div>
                {viewType === 'calendar' ? 'Event Calendar' : viewType === 'kanban' ? 'PM Kanban' : 'PM Gantt'}
              </div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                {viewType === 'calendar' ? 'Regulatory events · May 2026' : 'Project CES projected tasks'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Event Stats (Calendar Only) */}
              {viewType === 'calendar' && (
                <div className="flex gap-2 mr-4 text-[10px] font-bold tracking-wider">
                  <div className="px-2 py-1 rounded border border-[#FDA4AF]/30 bg-[#FFE4E6]/10 text-[#FDA4AF] flex gap-2"><span className="opacity-50">BLOCK</span> 16</div>
                  <div className="px-2 py-1 rounded border border-[#A16207]/30 bg-[#854D0E]/10 text-[#FCD34D] flex gap-2"><span className="opacity-50">DUE</span> 13</div>
                  <div className="px-2 py-1 rounded border border-[#115E59]/30 bg-[#0F766E]/10 text-[#5EEAD4] flex gap-2"><span className="opacity-50">TRACK</span> 8</div>
                </div>
              )}

              {/* Unified View Toggle */}
              <div className="flex bg-[#141A23] border border-[#1C2433] rounded-lg p-1">
                <button onClick={() => setViewType('calendar')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewType === 'calendar' ? 'bg-[#1C2433] text-white shadow-md' : 'text-[#8A94A6] hover:text-white'}`}>
                  <Calendar size={14} /> Calendar
                </button>
                <button onClick={() => setViewType('kanban')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewType === 'kanban' ? 'bg-[#1C2433] text-white shadow-md' : 'text-[#8A94A6] hover:text-white'}`}>
                  <KanbanSquare size={14} /> Kanban
                </button>
                <button onClick={() => setViewType('gantt')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewType === 'gantt' ? 'bg-[#1C2433] text-white shadow-md' : 'text-[#8A94A6] hover:text-white'}`}>
                  <AlignLeft size={14} /> Gantt
                </button>
              </div>

              {/* Date Controls */}
              <div className="flex items-center bg-[#141A23] border border-[#1C2433] rounded-lg p-1 text-[#E2E8F0]">
                <button className="p-1 hover:bg-[#1C2433] rounded"><ChevronLeft size={16} /></button>
                <span className="px-3 text-xs font-semibold">Today</span>
                <button className="p-1 hover:bg-[#1C2433] rounded"><ChevronRight size={16} /></button>
              </div>

              {/* Action */}
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#007970] hover:bg-[#009085] text-white text-[11px] font-bold tracking-wider uppercase transition-colors shadow-lg shadow-[#007970]/20">
                <RefreshCw size={12} /> Sync All Events
              </button>
            </div>
          </div>

          {/* ROLE FILTERS (New Addition based on img4) */}
          <div className="px-8 py-3 bg-[#0B0F15] border-t border-[#1C2433] flex items-center gap-3 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#5E6A7F] uppercase tracking-wider flex-shrink-0">
              <Filter size={12} /> Assignee:
            </div>
            {ROLES.map((role) => {
              const isActive = selectedRoles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all border ${
                    isActive 
                      ? 'bg-[#007970]/20 border-[#007970]/50 text-[#5EEAD4] shadow-[0_0_10px_rgba(0,121,112,0.2)]' 
                      : 'bg-[#141A23] border-[#1C2433] text-[#8A94A6] hover:border-[#4A5568] hover:text-[#E2E8F0]'
                  }`}
                >
                  {role}
                </button>
              );
            })}
            {selectedRoles.length > 0 && (
              <button onClick={() => setSelectedRoles([])} className="text-[10px] text-[#C74600] hover:text-[#FDA4AF] font-bold ml-2">Clear</button>
            )}
          </div>
        </div>

        {/* =====================================================================
          DYNAMIC VIEW ENGINE (Key-Remount triggers CSS animation)
          ===================================================================== */}
        <div key={viewType} className="flex-1 overflow-auto custom-scrollbar bg-[#0B0F15] animate-fadeInSlideUp">
          
          {/* --- CALENDAR VIEW --- */}
          {viewType === 'calendar' && (
            <div className="min-w-[1000px] h-full flex flex-col">
              <div className="grid grid-cols-7 border-b border-[#1C2433] sticky top-0 bg-[#0B0F15] z-10">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-bold text-[#5E6A7F] tracking-widest">{day}</div>
                ))}
              </div>
              <div className="calendar-grid flex-1 border-l border-[#1C2433]">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  // Filter events for this specific day
                  const dayEvents = filteredEvents.filter(e => e.date === day);
                  
                  return (
                    <div key={day} className="border-r border-b border-[#1C2433] p-2 min-h-[120px] bg-[#0F131A]/30 relative group hover:bg-[#141A23]/50 transition-colors">
                      <div className="text-xs font-medium text-[#5E6A7F] mb-2">{day}</div>
                      <div className="space-y-1.5 relative z-10">
                        {dayEvents.map(ev => (
                          <div 
                            key={ev.id} 
                            className={`px-2 py-1 rounded text-[10px] font-medium leading-tight truncate border shadow-sm cursor-pointer hover:brightness-110 transition-all ${getEventStyle(ev.status)}`}
                          >
                            <span className="font-bold opacity-75 mr-1">•</span>
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- KANBAN VIEW --- */}
          {viewType === 'kanban' && (
            <div className="flex h-full p-6 gap-6 overflow-x-auto min-w-max items-start">
              {[
                { id: 'todo', title: 'TO DO', count: filteredEvents.filter(e=>e.kanban==='todo').length },
                { id: 'progress', title: 'IN PROGRESS', count: filteredEvents.filter(e=>e.kanban==='progress').length },
                { id: 'review', title: 'IN REVIEW', count: filteredEvents.filter(e=>e.kanban==='review').length },
                { id: 'blocked', title: 'BLOCKED', count: filteredEvents.filter(e=>e.kanban==='blocked').length },
                { id: 'done', title: 'DONE', count: filteredEvents.filter(e=>e.kanban==='done').length }
              ].map(col => (
                <div key={col.id} className="w-[320px] flex-shrink-0 flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="text-[11px] font-bold text-white tracking-widest">{col.title}</h3>
                    <span className="text-[10px] font-mono text-[#5E6A7F]">{col.count}</span>
                  </div>
                  
                  {filteredEvents.filter(e => e.kanban === col.id).map(task => (
                    <SpotlightCard key={task.id} className="p-4 cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${task.status === 'block' ? 'bg-[#BE123C]' : task.status === 'due' ? 'bg-[#D97706]' : 'bg-[#0F766E]'}`}></div>
                        <span className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-wider line-clamp-1">{task.role}</span>
                      </div>
                      <h4 className="text-sm font-medium text-white leading-snug mb-3">{task.title}</h4>
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-[#007970] bg-[#007970]/10 px-2 py-0.5 rounded">CES</span>
                        <span className="text-[#5E6A7F]">MAY {task.date}</span>
                      </div>
                    </SpotlightCard>
                  ))}
                  
                  {/* Empty State Drop Zone */}
                  {filteredEvents.filter(e => e.kanban === col.id).length === 0 && (
                    <div className="h-24 border border-dashed border-[#1C2433] rounded-lg flex items-center justify-center text-xs text-[#5E6A7F]">
                      Drop tasks here
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* --- GANTT VIEW --- */}
          {viewType === 'gantt' && (
            <div className="flex h-full min-w-max p-6">
              <div className="w-full border border-[#1C2433] bg-[#0F131A] rounded-xl flex overflow-hidden shadow-2xl">
                
                {/* Left Pane: Task List */}
                <div className="w-[350px] flex-shrink-0 border-r border-[#1C2433] bg-[#141A23] flex flex-col">
                  <div className="h-[50px] border-b border-[#1C2433] flex items-center px-4 text-[10px] font-bold text-[#5E6A7F] tracking-widest uppercase bg-[#0B0F15]">
                    Event Pipeline
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredEvents.map(ev => (
                      <div key={ev.id} className="h-[60px] border-b border-[#1C2433] px-4 flex flex-col justify-center hover:bg-[#1C2433]/50 transition-colors">
                        <div className="text-xs font-medium text-white truncate">{ev.title}</div>
                        <div className="text-[10px] text-[#8A94A6] truncate mt-1">Assignee: {ev.role}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Pane: Timeline Grid */}
                <div className="flex-1 overflow-x-auto custom-scrollbar flex flex-col">
                  <div className="h-[50px] border-b border-[#1C2433] flex bg-[#0B0F15] min-w-max">
                    {Array.from({ length: 31 }).map((_, i) => (
                      <div key={i} className="w-[40px] flex-shrink-0 border-r border-[#1C2433]/50 flex items-center justify-center text-[10px] font-mono text-[#5E6A7F]">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar min-w-max relative bg-[#0F131A]">
                    {/* Background Grid Lines */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {Array.from({ length: 31 }).map((_, i) => (
                        <div key={i} className="w-[40px] flex-shrink-0 border-r border-[#1C2433]/30 h-full"></div>
                      ))}
                    </div>
                    {/* Gantt Rows */}
                    {filteredEvents.map(ev => (
                      <div key={ev.id} className="h-[60px] border-b border-[#1C2433] relative flex items-center">
                        <div 
                          className={`absolute h-[24px] rounded-md flex items-center px-2 text-[9px] font-bold shadow-md cursor-pointer hover:brightness-110 transition-all truncate ${getEventStyle(ev.status)}`}
                          style={{
                            left: `${(ev.date - 1) * 40 + 4}px`, // 40px per day + 4px offset
                            width: `${ev.span * 40 - 8}px`       // Span * 40px - 8px padding
                          }}
                        >
                          {ev.span > 1 && ev.title}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}