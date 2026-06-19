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
  Bell,
  CheckCircle,
  Plus,
  X,
  Lock,
  ChevronRight,
  ChevronLeft,
  Menu,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  CornerDownRight,
  ArrowUpRight,
  Check,
  FileText,
  Filter,
  Sun,
  Moon,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Tag,
  CheckSquare,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  QrCode,
  FolderOpen,
  UserCheck,
  Info,
  BarChart2,
  Trash2,
  RefreshCw,
  KanbanSquare,
  GitBranch
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

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
      className={cx('card-spotlight premium-glass-transition backdrop-blur-[33px] relative border border-white/50 rounded-2xl bg-white/20 transition-all duration-300', className)}
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
    <div className="nav-btn-3d-wrapper w-full select-none">
      <button
        onClick={onClick}
        className={cx(
          "nav-btn-3d group w-full flex items-center rounded-xl p-3 text-xs font-semibold transition-all duration-300 transform-gpu cursor-pointer border",
          active 
            ? "nav-btn-active-glow text-[var(--teal-primary)] border-[var(--teal-primary)]/40 bg-white/60 shadow-md" 
            : "text-[var(--text-secondary)] bg-white/10 border-white/25 hover:bg-white/30 hover:text-[var(--text-primary)] hover:border-white/40",
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
            "font-semibold transition-all duration-300 truncate text-left",
            active ? "text-[var(--teal-primary)] font-bold" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
          )}>
            {label}
          </span>
        )}
      </button>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, sprint_board, workloads, reports, my_tasks, workflows, master_controls, swimlanes
  const [notifications, setNotifications] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // FIXING REFERENCE ERROR: Declare the missing UAT collapse hook state
  const [isUatPanelCollapsed, setIsUatPanelCollapsed] = useState(false);

  // Simulated Modal / Detail popup state for the calendar events
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);

  // Guided UAT checklist state
  const [uatCheckpoints, setUatCheckpoints] = useState([
    { id: 1, label: 'Review operational posture', completed: true },
    { id: 2, label: 'Open and execute tasks', completed: true },
    { id: 3, label: 'Validate workflow timeline', completed: false },
    { id: 4, label: 'Complete required forms', completed: false },
    { id: 5, label: 'Upload and verify evidence', completed: false },
    { id: 6, label: 'Run audit readiness pass', completed: false },
  ]);

  const toggleUatCheckpoint = (id) => {
    setUatCheckpoints(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    addToast('UAT checkpoint status updated', 'success');
  };

  const completedUatCount = uatCheckpoints.filter(c => c.completed).length;

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3500);
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,500;1,700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Design tokens, Custom styles and Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-atm: transparent;
          --bg-workspace: transparent;
          --bg-sidebar: transparent;
          --bg-header: transparent;
          
          --border-main: transparent;
          --border-card: rgba(255, 255, 255, 0.45);
          --border-card-hover: rgba(0, 121, 125, 0.35);
          
          --bg-card: rgba(255, 255, 255, 0.22);
          --text-primary: #1F1C1B;
          --text-secondary: #524D4B;
          --text-tertiary: #74706F;
          
          --bg-tab-pill: rgba(255, 255, 255, 0.35);
          --teal-primary: #00797D;
          --orange-primary: #C74601;
          --spotlight-fallback: rgba(0, 121, 125, 0.05);
          --drawer-bg: rgba(255, 255, 255, 0.96);
        }

        .light-shell {
          font-family: 'Inter', sans-serif;
          background-color: #F8F3F0;
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        .light-shell::before {
          content: "";
          position: fixed;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background: 
            radial-gradient(circle at 12% 15%, rgba(199, 70, 1, 0.11) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(0, 121, 125, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 218, 198, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 90% 10%, rgba(229, 254, 255, 0.6) 0%, transparent 45%);
          filter: blur(95px);
          animation: ambientFlow 28s ease-in-out infinite alternate;
        }

        @keyframes ambientFlow {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.03) translate(1%, -0.5%); }
          100% { transform: scale(1.06) translate(-1%, 1.5%); }
        }

        .font-heading {
          font-family: 'Montserrat', sans-serif;
        }

        .font-signature {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        .nav-btn-3d {
          perspective: 600px;
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.02), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.95),
            inset 0 -1.5px 2px rgba(0, 0, 0, 0.02);
        }
        .nav-btn-3d:hover {
          transform: rotateY(-8deg) rotateX(8deg) translateZ(4px);
          background: rgba(255, 255, 255, 0.55);
          border-color: rgba(0, 121, 125, 0.25);
          box-shadow: 
            2px 8px 18px rgba(0, 121, 125, 0.06), 
            inset 0 1.5px 3px rgba(255, 255, 255, 1);
        }
        .nav-btn-active-glow {
          transform: rotateY(-6deg) rotateX(6deg) translateZ(6px);
          background: rgba(0, 121, 125, 0.08) !important;
          border-color: rgba(0, 121, 125, 0.4) !important;
          box-shadow: 
            0 0 16px rgba(0, 121, 125, 0.15), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.65),
            inset -1px -2px 3px rgba(0, 121, 125, 0.04) !important;
        }

        .premium-shadow {
          box-shadow: 
            0 12px 32px -8px rgba(0, 0, 0, 0.04),
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
          transform: translateY(-2px);
          border-color: var(--border-card-hover);
          background-color: rgba(255, 255, 255, 0.35);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {}
      {/* TOP HEADER */}
      <header className="flex h-[76px] w-full flex-shrink-0 items-center justify-between px-9 bg-white/20 backdrop-blur-[33px] relative z-30 border-b border-white/25 select-none shadow-sm">
        
        {/* Brand Logo Container */}
        <div className="flex items-center gap-3 w-[265px] shrink-0 pr-4">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png" 
              alt="CareIndeed Brand Logo" 
              className="h-7 w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {/* TOP SEARCH BAR */}
        <div className="flex flex-1 items-center max-w-md ml-4">
          <div className="group relative w-full cursor-pointer">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <div className="w-full rounded-full bg-white/45 pl-10 pr-12 py-2 text-xs text-[var(--text-secondary)] select-none flex items-center justify-between h-[36px] group-hover:bg-white/60 transition-all border border-white/60 premium-shadow">
              <span>Search policies, compliance keys, tasks...</span>
              <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono text-[var(--text-secondary)] shadow-sm shrink-0 ml-2">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT PROFILE ACTIONS */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => {
              addToast('System integrity status: 100% Secure. Cryptographic compliance match verified.', 'success');
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--teal-primary)] transition-all border border-white/55 premium-shadow"
            title="System Integrity Status"
          >
            <Lock size={14} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md bg-[var(--teal-primary)] border-2 border-white/70 relative">
            TP
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
          </div>
        </div>
      </header>

      {/* LOWER SCREEN WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden w-full relative z-10">
        
        {}
        {/* LEFT NAVIGATION SIDEBAR */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-r border-white/20 shrink-0",
            isSidebarCollapsed ? "w-[78px]" : "w-[265px]"
          )}
        >
          {/* Collapse trigger controls inside sidebar */}
          <div className="p-4 flex justify-end select-none">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Sidebar Navigation Links with 3D glass containers */}
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-2 select-none">
            
            {/* PRIMARY OPERATIONS SEGMENT */}
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Operations
                </h3>
              )}
              <div className="space-y-2">
                <InteractiveNavButton 
                  icon={Calendar} 
                  label="Calendar" 
                  active={activeTab === 'calendar'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('calendar'); addToast('Showing regulatory events calendar', 'info'); }} 
                />
                
                <InteractiveNavButton 
                  icon={KanbanSquare} 
                  label="Sprint Board" 
                  active={activeTab === 'sprint_board'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('sprint_board'); addToast('Opening sprint execution board', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={Users} 
                  label="Workload Dist" 
                  active={activeTab === 'workloads'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('workloads'); addToast('Opening workload distribution', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={BarChart2} 
                  label="Reports Panel" 
                  active={activeTab === 'reports'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('reports'); addToast('Opening executive reports dashboard', 'info'); }} 
                />
              </div>
            </div>

            {/* COMPLIANCE EXECUTION */}
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--orange-primary)]">
                  Compliance Execution
                </h3>
              )}
              <div className="space-y-2">
                <InteractiveNavButton 
                  icon={CheckSquare} 
                  label="My Tasks" 
                  active={activeTab === 'my_tasks'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('my_tasks'); addToast('Opening clinical tasks backlog', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={GitBranch} 
                  label="Workflows" 
                  active={activeTab === 'workflows'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('workflows'); addToast('Opening operational workflows list', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={Sliders} 
                  label="Master Controls" 
                  active={activeTab === 'master_controls'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('master_controls'); addToast('Opening master controls registry', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={ArrowRightLeft} 
                  label="Execution Flow" 
                  active={activeTab === 'swimlanes'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('swimlanes'); addToast('Opening visual swimlanes workspace', 'info'); }} 
                />
              </div>
            </div>
          </div>

          {/* Bottom Security clearance label */}
          <div className="p-4 bg-white/25 select-none text-[11px] font-bold text-[var(--text-primary)] border-t border-white/20">
            <span className="flex items-center gap-1.5 justify-center">
              <Lock size={12} className="text-[var(--teal-primary)]" />
              {!isSidebarCollapsed && <span>Safe Mode Active</span>}
            </span>
          </div>
        </aside>

        {/* CENTER VIEW PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent relative z-10 p-6 md:p-9">
          
          {}
          {/* =================================-------------------
              VIEW 1: REGULATORY CALENDAR ("01_ces_calendar.png" & "Screenshot 2026-06-16 132618.jpg")
              ----------------------------------================= */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto">
              
              {/* Header Title segment */}
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-none-structure">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    Event Calendar
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                    Regulatory events • June 2026
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">
                    A single CES control surface for mandated calendar execution, drill-in workflow review, and polished role-based scanning.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  {/* Status Pills */}
                  <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                    • BLOCK 19
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    • DUE 3
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    • TRACK 2
                  </span>

                  {/* Right layout buttons */}
                  <div className="bg-white/40 p-1 rounded-xl border border-white flex gap-1 ml-2">
                    <button className="px-3 py-1 rounded bg-[var(--teal-primary)] text-white font-bold">CALENDAR</button>
                    <button onClick={() => { setActiveTab('sprint_board'); }} className="px-3 py-1 rounded hover:bg-white/250 text-[var(--text-secondary)] font-bold">KANBAN</button>
                    <button onClick={() => { addToast('Gantt view is only active during CA state audit window.', 'info'); }} className="px-3 py-1 rounded hover:bg-white/250 text-[var(--text-secondary)] font-bold">GANTT</button>
                  </div>
                </div>
              </div>

              {/* Toolbar Section */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 premium-shadow">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] self-center mr-2">ASSIGNEE:</span>
                  {['ADMINISTRATOR', 'BILLING AUDITOR', 'CLINICAL MANAGER', 'COMPLIANCE AUDITOR', 'COMPLIANCE OFFICER', 'HR DIRECTOR'].map((role) => (
                    <button 
                      key={role} 
                      onClick={() => addToast(`Filtering calendar events by assignee role: ${role}`, 'info')}
                      className="px-3 py-1 bg-white/250 hover:bg-white border text-[10px] font-bold text-[var(--text-secondary)] rounded-full transition-all"
                    >
                      {role}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 shrink-0">
                  <div className="bg-white/40 border border-white p-1 rounded-xl flex gap-1 items-center text-xs">
                    <button className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900">&larr;</button>
                    <span className="font-bold text-[var(--text-secondary)] px-1">Today &bull; JUNE 2026</span>
                    <button className="px-2.5 py-1 text-zinc-500 hover:text-zinc-900">&rarr;</button>
                  </div>

                  <button 
                    onClick={() => addToast('Successfully synchronized event schedules with state server.', 'success')}
                    className="px-3 py-1.5 bg-[var(--teal-primary)] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={13} /> SYNC ALL EVENTS
                  </button>
                </div>
              </div>

              {/* Monthly Calendar Grid Layout */}
              <div className="bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl p-5 premium-shadow">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--teal-primary)] border-b border-white pb-3">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <span key={d}>{d}</span>)}
                </div>

                {/* Calendar grid slots representing June 2026 */}
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {/* Empty offsets for starting month */}
                  <div className="min-h-[110px] bg-white/25 border border-dashed rounded-xl" />
                  
                  {/* Day 1 */}
                  <div className="min-h-[110px] bg-white/30 border p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-zinc-500">1</span>
                    <div className="space-y-1">
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">Annual Compliance...</div>
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">Annual Conflict of...</div>
                    </div>
                  </div>

                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">2</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">3</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">4</div>
                  
                  {/* Day 5 */}
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">5</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">6</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">7</div>

                  {/* Day 8 */}
                  <div className="min-h-[110px] bg-white/30 border p-2 rounded-xl flex flex-col justify-between cursor-pointer" onClick={() => setSelectedCalendarEvent({ title: 'Plan of Care Audit', owner: 'Compliance Officer', date: '2026-06-08', status: '5d past SLA', workflow: 'CO-WF-15' })}>
                    <span className="text-xs font-bold text-zinc-500">8</span>
                    <div className="space-y-1">
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">Plan of Care Audit</div>
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">OASIS Accuracy A...</div>
                      <span className="text-[8px] text-rose-800 font-bold block">+ 11 more</span>
                    </div>
                  </div>

                  {/* Day 9 */}
                  <div className="min-h-[110px] bg-white/30 border p-2 rounded-xl flex flex-col justify-between cursor-pointer" onClick={() => setSelectedCalendarEvent({ title: 'QAPI Committee Meeting', owner: 'QAPI Lead/Chair', date: '2026-06-09', status: 'On track', workflow: 'QA-WF-09' })}>
                    <span className="text-xs font-bold text-zinc-500">9</span>
                    <div>
                      <div className="p-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded truncate">QAPI Committee ...</div>
                    </div>
                  </div>

                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">10</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">11</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">12</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">13</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">14</div>

                  {/* Day 15 */}
                  <div className="min-h-[110px] bg-white/30 border p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-xs font-bold text-zinc-500">15</span>
                    <div className="space-y-1">
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">Internal Complian...</div>
                      <div className="p-1 bg-rose-50 border border-rose-200 text-rose-700 text-[9px] font-bold rounded truncate">Post-Bill Claims A...</div>
                      <span className="text-[8px] text-rose-800 font-bold block">+ 1 more</span>
                    </div>
                  </div>

                  {/* Day 16 (Today indicator) */}
                  <div className="min-h-[110px] bg-white border border-[var(--teal-primary)] p-2 rounded-xl flex flex-col justify-between ring-2 ring-[var(--teal-primary)]/20 shadow-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-1.5 py-0.5 rounded-full">16</span>
                      <span className="text-[8px] text-[var(--teal-primary)] font-bold">TODAY</span>
                    </div>
                    <span className="text-[8px] text-zinc-400 italic">No scheduled audits</span>
                  </div>

                  {/* Day 17 */}
                  <div className="min-h-[110px] bg-white/30 border p-2 rounded-xl flex flex-col justify-between cursor-pointer" onClick={() => setSelectedCalendarEvent({ title: 'Risk Management Update', owner: 'Risk Director', date: '2026-06-17', status: 'Due Tomorrow', workflow: 'RK-WF-22' })}>
                    <span className="text-xs font-bold text-zinc-500">17</span>
                    <div>
                      <div className="p-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded truncate">Risk Management ...</div>
                    </div>
                  </div>

                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">18</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">19</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">20</div>
                  <div className="min-h-[110px] bg-white/10 rounded-xl p-2 text-zinc-500 text-xs">21</div>
                </div>
              </div>

              {/* Event detail modal matches layout popover from Screenshot 2026-06-16 132618.jpg */}
              {selectedCalendarEvent && (
                <div className="p-5 bg-white/75 text-[var(--text-primary)] rounded-3xl space-y-4 max-w-md border border-neutral-200 shadow-[0_18px_45px_rgba(82,77,75,0.14)] relative animate-fadeIn mx-auto font-mono text-xs">
                  <button 
                    onClick={() => setSelectedCalendarEvent(null)}
                    className="absolute right-4 top-4 text-[var(--text-tertiary)] hover:text-[var(--teal-primary)]"
                  >
                    <X size={15} />
                  </button>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">
                      COMPLIANCE WORKFLOW
                    </span>
                    <h3 className="text-sm font-bold text-white pt-1">{selectedCalendarEvent.title}</h3>
                  </div>

                  <div className="space-y-1.5 border-t border-neutral-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Date:</span>
                      <span className="text-white font-bold">{selectedCalendarEvent.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Owner Role:</span>
                      <span className="text-white font-bold">{selectedCalendarEvent.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">SLA Status:</span>
                      <span className="text-rose-400 font-bold">{selectedCalendarEvent.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Workflow ID:</span>
                      <span className="text-[var(--teal-primary)] font-bold">{selectedCalendarEvent.workflow}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      addToast(`Routing directly to ${selectedCalendarEvent.workflow} flow.`, 'success');
                      setActiveTab('swimlanes');
                      setSelectedCalendarEvent(null);
                    }}
                    className="w-full mt-2 py-2 bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                  >
                    OPEN EVENT SWIMLANE &rarr;
                  </button>
                </div>
              )}

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 2: SPRINT EXECUTION BOARD ("02_ces_board.png")
              ----------------------------------================= */}
          {activeTab === 'sprint_board' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-none-structure">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-white bg-[var(--teal-primary)] px-2 py-0.5 rounded-full">ACTIVE SPRINT</span>
                    <span className="text-xs text-[var(--text-secondary)] font-bold">Sprint 12 • Jun 7 - Jun 18, 2026</span>
                  </div>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                    Sprint Execution Board
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Event &rarr; Workflow &rarr; Execution Unit. Drag enforces state-machine rules; invalid moves snap back.
                  </p>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] text-xs font-black">
                  127 OPEN &bull; 0 CLOSED
                </span>
              </div>

              {/* Scope Bar */}
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 flex flex-wrap gap-4 items-center justify-between premium-shadow text-xs font-bold text-[var(--text-secondary)]">
                <div className="flex flex-wrap items-center gap-4">
                  <span>SPRINT SCOPE:</span>
                  <div className="flex items-center gap-1.5">
                    <span>YEAR</span>
                    <select className="bg-white border rounded px-2 py-1 outline-none text-[var(--text-primary)]">
                      <option>2026</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>SPRINT</span>
                    <select className="bg-white border rounded px-2 py-1 outline-none text-[var(--text-primary)]">
                      <option>2026:12 — Sprint 12</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button onClick={() => addToast('Loading previous sprint execution card statuses.', 'info')} className="px-3 py-1.5 bg-white border rounded-lg hover:bg-neutral-50 shadow-sm">&larr; PREV</button>
                  <button onClick={() => addToast('Previewing subsequent active sprint backlog cards.', 'info')} className="px-3 py-1.5 bg-white border rounded-lg hover:bg-neutral-50 shadow-sm">NEXT &rarr;</button>
                  <button onClick={() => addToast('Filtered viewport to current cycle.', 'success')} className="px-3 py-1.5 bg-[var(--teal-primary)] text-white rounded-lg shadow-sm">CURRENT</button>
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                
                {/* Upcoming */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1 font-bold text-xs uppercase text-[var(--text-tertiary)]">
                    <span>UPCOMING</span>
                    <span className="px-2 py-0.5 bg-white border rounded-full">0</span>
                  </div>
                  <div className="min-h-[300px] border border-dashed rounded-2xl flex items-center justify-center text-xs text-[var(--text-tertiary)] italic p-4 text-center">
                    No execution units in Upcoming
                  </div>
                </div>

                {/* Ready */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1 font-bold text-xs uppercase text-[var(--text-tertiary)]">
                    <span>READY</span>
                    <span className="px-2 py-0.5 bg-white border rounded-full">0</span>
                  </div>
                  <div className="min-h-[300px] border border-dashed rounded-2xl flex items-center justify-center text-xs text-[var(--text-tertiary)] italic p-4 text-center">
                    No execution units in Ready
                  </div>
                </div>

                {/* In Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1 font-bold text-xs uppercase text-[var(--teal-primary)]">
                    <span>IN PROGRESS</span>
                    <span className="px-2 py-0.5 bg-white border rounded-full">127</span>
                  </div>

                  <div className="space-y-3">
                    <SpotlightCard className="p-5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[var(--teal-primary)] uppercase bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">PLAN OF CARE AUDIT</span>
                        <span className="text-zinc-500 font-mono">Audit 28%</span>
                      </div>

                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
                        Pull active episode list and apply stratified sampling (cert/recert/ROC strata)
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t">
                        <span className="font-bold text-[var(--teal-primary)]">TJ Padilla (DON)</span>
                        <span className="font-mono text-rose-600 font-bold uppercase">Jun 8 &bull; NOT READY</span>
                      </div>
                    </SpotlightCard>

                    <SpotlightCard className="p-5 space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[var(--teal-primary)] uppercase bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">DOCUMENTATION</span>
                        <span className="text-zinc-500 font-mono">Audit 28%</span>
                      </div>

                      <h4 className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
                        Score each POC against checklist (signature &le;30 days, goals SMART, interventions discipline-specific)
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t">
                        <span className="font-bold text-[var(--teal-primary)]">TJ Padilla (DON)</span>
                        <span className="font-mono text-rose-600 font-bold uppercase">Jun 8 &bull; NOT READY</span>
                      </div>
                    </SpotlightCard>
                  </div>
                </div>

                {/* Awaiting Signature */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1 font-bold text-xs uppercase text-amber-600">
                    <span>AWAITING SIGNATURE</span>
                    <span className="px-2 py-0.5 bg-white border rounded-full">0</span>
                  </div>
                  <div className="min-h-[300px] border border-dashed rounded-2xl flex items-center justify-center text-xs text-[var(--text-tertiary)] italic p-4 text-center">
                    No execution units in Awaiting Signature
                  </div>
                </div>

              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 3: WORKLOAD DISTRIBUTION ("03_ces_workloads.png")
              ----------------------------------================= */}
          {activeTab === 'workloads' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                  Distribution Core
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Workload Distribution
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Owner-level accountability. Capacity risk reflects load, overdue items, and pending signatures.
                </p>
              </div>

              {/* KPI metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border rounded-2xl bg-white/40 flex flex-col justify-between h-24 premium-shadow">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">TOTAL OWNERS</span>
                  <span className="text-2xl font-black text-[var(--teal-primary)]">5</span>
                </div>

                <div className="p-5 border rounded-2xl bg-rose-50 border-rose-200 flex flex-col justify-between h-24 premium-shadow">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">OWNERS OVERLOADED</span>
                  <span className="text-2xl font-black text-rose-800">5</span>
                </div>

                <div className="p-5 border rounded-2xl bg-white/40 flex flex-col justify-between h-24 premium-shadow">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">OWNERS ON WATCH</span>
                  <span className="text-2xl font-black text-zinc-500">0</span>
                </div>
              </div>

              {/* Table ledger representing workload details */}
              <div className="bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-3xl overflow-hidden premium-shadow">
                <div className="p-5 border-b border-white bg-white/40 font-heading font-bold text-xs text-[var(--teal-primary)] uppercase tracking-wider">
                  Owner Assignments Registry
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white text-[var(--text-tertiary)] font-bold uppercase text-[9px] bg-white/20">
                        <th className="p-4.5">OWNER</th>
                        <th className="p-4.5">ROLE</th>
                        <th className="p-4.5">ALLOCATED CAPACITY</th>
                        <th className="p-4.5">IN FLIGHT</th>
                        <th className="p-4.5">AWAITING SIGNATURE</th>
                        <th className="p-4.5">BLOCKED</th>
                        <th className="p-4.5">OVERDUE</th>
                        <th className="p-4.5">CAPACITY RISK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 text-[var(--text-secondary)] font-medium">
                      <tr>
                        <td className="p-4.5 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] font-bold text-[10px] flex items-center justify-center shrink-0">MS</div>
                          <span className="font-bold text-[var(--text-primary)]">Maria Santos, RN</span>
                        </td>
                        <td className="p-4.5 font-mono">RN</td>
                        <td className="p-4.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: '85%' }} />
                            </div>
                            <span className="font-mono font-bold">46</span>
                          </div>
                        </td>
                        <td className="p-4.5 font-mono">0</td>
                        <td className="p-4.5 font-mono">0</td>
                        <td className="p-4.5 font-mono text-zinc-400">0</td>
                        <td className="p-4.5 font-mono text-rose-600 font-bold">45</td>
                        <td className="p-4.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[9px]">OVERLOADED</span>
                        </td>
                      </tr>

                      <tr>
                        <td className="p-4.5 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] font-bold text-[10px] flex items-center justify-center shrink-0">GA</div>
                          <span className="font-bold text-[var(--text-primary)]">Grace Abella, HHA</span>
                        </td>
                        <td className="p-4.5 font-mono">HHA</td>
                        <td className="p-4.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-500" style={{ width: '80%' }} />
                            </div>
                            <span className="font-mono font-bold">43</span>
                          </div>
                        </td>
                        <td className="p-4.5 font-mono">0</td>
                        <td className="p-4.5 font-mono font-bold text-amber-600">27</td>
                        <td className="p-4.5 font-mono text-zinc-400">0</td>
                        <td className="p-4.5 font-mono text-rose-600 font-bold">15</td>
                        <td className="p-4.5">
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[9px]">OVERLOADED</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 4: EXECUTIVE REPORTS ("04_ces_reports.png")
              ----------------------------------================= */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto">
              
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                  Compliance Analytics
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Executive Reports
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Sprint-over-sprint compliance trends. Each chart isolates a regulatory KPI.
                </p>
              </div>

              {/* Blank Trend graphs list representing metric variables exactly mapping Screenshot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card 1 */}
                <div className="p-6 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl premium-shadow space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">COMPLIANCE COMPLETION RATE (%)</span>
                    <span className="text-[9px] font-bold text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">Target: 85%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-[var(--teal-primary)]">0%</div>
                    <span className="text-[10px] text-zinc-500 font-semibold">+0% vs prior sprint</span>
                  </div>
                  <div className="h-32 border-b border-dashed border-zinc-200 relative flex items-end justify-between font-mono text-[9px] text-zinc-400">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-dashed" />
                      <div className="border-b border-dashed" />
                    </div>
                    <span>S10</span>
                    <span>S11</span>
                    <span>S12</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-6 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl premium-shadow space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">ON-TIME COMPLETION (%)</span>
                    <span className="text-[9px] font-bold text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">Target: 80%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-[var(--teal-primary)]">0%</div>
                    <span className="text-[10px] text-zinc-500 font-semibold">+0% vs prior sprint</span>
                  </div>
                  <div className="h-32 border-b border-dashed border-zinc-200 relative flex items-end justify-between font-mono text-[9px] text-zinc-400">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-dashed" />
                      <div className="border-b border-dashed" />
                    </div>
                    <span>S10</span>
                    <span>S11</span>
                    <span>S12</span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-6 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl premium-shadow space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">AUDIT READINESS SCORE (0-100)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-[var(--teal-primary)]">0</div>
                    <span className="text-[10px] text-zinc-500 font-semibold">+0 vs prior</span>
                  </div>
                  <div className="h-32 border-b border-dashed border-zinc-200 relative flex items-end justify-between font-mono text-[9px] text-zinc-400">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-dashed" />
                      <div className="border-b border-dashed" />
                    </div>
                    <span>S10</span>
                    <span>S11</span>
                    <span>S12</span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-6 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl premium-shadow space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase text-[var(--text-tertiary)] tracking-widest">SIGNATURE SLA COMPLIANCE (%)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-[var(--teal-primary)]">0</div>
                    <span className="text-[10px] text-zinc-500 font-semibold">+0 vs prior</span>
                  </div>
                  <div className="h-32 border-b border-dashed border-zinc-200 relative flex items-end justify-between font-mono text-[9px] text-zinc-400">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="border-b border-dashed" />
                      <div className="border-b border-dashed" />
                    </div>
                    <span>S10</span>
                    <span>S11</span>
                    <span>S12</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 5: MY TASKS ("05_my_tasks.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'my_tasks' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="pb-4 border-b border-zinc-200">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-zinc-400">EXECUTION</span>
                <div className="flex flex-wrap items-center gap-4 mt-2 justify-between">
                  <h1 className="font-heading text-2xl font-black text-[var(--teal-primary)]">My Tasks</h1>
                  <span className="text-xs text-zinc-500 font-semibold">You &bull; 0 total &bull; Governing Body: 1906 &bull; Administrator: 1904 &bull; DON: 1405</span>
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex flex-wrap gap-2 text-xs font-bold select-none">
                {['All', 'Open', 'Awaiting Signature', 'Blocked', 'Overdue'].map((filterItem) => (
                  <button
                    key={filterItem}
                    onClick={() => addToast(`Toggled filter state to ${filterItem}`)}
                    className={cx(
                      "px-3 py-1.5 rounded-full border transition-all",
                      filterItem === 'Open' 
                        ? "bg-[var(--teal-primary)] text-white border-transparent" 
                        : "bg-white/40 text-[var(--text-secondary)] border-white hover:bg-white"
                    )}
                  >
                    {filterItem}
                  </button>
                ))}
              </div>

              {/* Empty placeholder workspace mimicking Screenshot 05_my_tasks.png */}
              <div className="bg-white/20 border border-white rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto premium-shadow">
                <div className="font-heading text-lg font-black text-[var(--teal-primary)]">Task Command View</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Clear execution path from triage to completion with role-aware queue confidence.
                </p>
                
                <div className="p-6 bg-white/60 rounded-2xl border text-xs text-[var(--text-tertiary)] italic">
                  No tasks match this filter. Try All, Overdue, or Awaiting Signature.
                </div>

                <button 
                  onClick={() => addToast('Displaying overall comprehensive audit task pool...')}
                  className="px-6 py-2.5 bg-[var(--orange-primary)] text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider"
                >
                  View all tasks
                </button>
              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 6: WORKFLOWS LIBRARY ("06_workflows.png")
              ----------------------------------================= */}
          {activeTab === 'workflows' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                  Operational Blueprints
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Workflows
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  206 operational workflows • 10 domains
                </p>
              </div>

              {/* KPI cards layout mapping screenshot */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'TOTAL WORKFLOWS', count: '206' },
                  { title: 'MANDATED / RECURRING', count: '112' },
                  { title: 'HIGH-RISK OPEN', count: '63' },
                  { title: 'GB APPROVALS PENDING', count: '62' }
                ].map((k, idx) => (
                  <div key={idx} className="p-4 border rounded-2xl bg-white/35 flex flex-col justify-between h-24 premium-shadow">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{k.title}</span>
                    <span className="text-2xl font-black text-[var(--teal-primary)]">{k.count}</span>
                  </div>
                ))}
              </div>

              {/* Categories Navigation Filter strip */}
              <div className="flex flex-wrap gap-1 bg-white/20 p-1 rounded-xl border border-white/40 text-[10px] font-bold select-none uppercase tracking-wider">
                {['ALL WORKFLOWS', 'GOVERNANCE', 'CLINICAL', 'QAPI', 'HR', 'COMPLIANCE', 'FINANCE', 'OPERATIONS'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => addToast(`Switched active library filter to ${cat}`)}
                    className={cx("px-3 py-1.5 rounded-lg transition-all text-[var(--text-secondary)] hover:text-zinc-950", cat === 'ALL WORKFLOWS' ? "bg-white/70 text-[var(--teal-primary)] shadow-sm" : "")}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Minimal workflows list rendering 2 items (As per instruction "dont add all the records just 1 or 2 is enoough") */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Card 1 */}
                <SpotlightCard className="p-5 flex flex-col justify-between h-[230px] cursor-pointer" onClick={() => { setActiveTab('swimlanes'); addToast('Selected Plan of Care Audit workflow. Opening Swimlanes view.'); }}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">CL • CLINICAL</span>
                      <span className="text-rose-600 font-bold uppercase">Immediate jeopardy</span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Plan Of Care Audit</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      Monthly stratified-sample audit of active Plans of Care to verify physician signature timeliness, goal/intervention alignment, and nurse care checklist logs.
                    </p>
                  </div>

                  <div className="pt-3 border-t text-[10px] text-zinc-400 font-semibold flex justify-between">
                    <span>Monthly &bull; 6 steps &bull; 6 forms &bull; 6 policies</span>
                    <span className="text-[var(--teal-primary)] font-bold">Configure &rarr;</span>
                  </div>
                </SpotlightCard>

                {/* Card 2 */}
                <SpotlightCard className="p-5 flex flex-col justify-between h-[230px] cursor-pointer" onClick={() => { addToast('Opening Oasis Accuracy Audit parameters.'); }}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">CL • CLINICAL</span>
                      <span className="text-amber-600 font-bold uppercase">Moderate risk</span>
                    </div>

                    <h3 className="text-sm font-bold text-[var(--text-primary)]">Oasis Accuracy Audit</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      Monthly stratified audit of OASIS submissions for accuracy (M-item logic, ICD-10 alignment, response validation benchmarks, and patient recovery outcome indexes).
                    </p>
                  </div>

                  <div className="pt-3 border-t text-[10px] text-zinc-400 font-semibold flex justify-between">
                    <span>Monthly &bull; 6 steps &bull; 8 forms &bull; 11 policies</span>
                    <span className="text-[var(--teal-primary)] font-bold">Configure &rarr;</span>
                  </div>
                </SpotlightCard>

              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 7: MASTER CONTROLS ("07_master_controls.png")
              ----------------------------------================= */}
          {activeTab === 'master_controls' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto">
              
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                  Structured Auditing
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Master control inventory
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Structured, auditable registry of required-at-all-times controls.
                </p>
              </div>

              {/* Status KPI badges list mapping screenshot 07 */}
              <div className="flex flex-wrap gap-2.5 select-none bg-white/20 p-4 rounded-2xl border">
                {[
                  { l: 'TOTAL CONTROLS', c: '104' },
                  { l: 'HIGH RISK', c: '81' },
                  { l: 'MATERIAL RISK', c: '22' },
                  { l: 'LOW RISK', c: '1' },
                  { l: 'ACTIVE', c: '0' },
                  { l: 'DEFICIENT', c: '0' },
                  { l: 'UNKNOWN', c: '104' },
                  { l: 'BLOCKED BY CONTROLS', c: '0' }
                ].map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border rounded-xl text-[10px] font-bold text-zinc-600 shadow-sm">
                    {item.l}: <strong className="text-[var(--teal-primary)]">{item.c}</strong>
                  </span>
                ))}
              </div>

              {/* List grid showing 2 key control items (As per instruction "dont add all the records just 1 or 2 is enoough") */}
              <div className="bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl overflow-hidden premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white text-[var(--text-tertiary)] font-bold uppercase text-[9px] bg-white/20">
                        <th className="p-4">ID</th>
                        <th className="p-4">CONTROL NAME</th>
                        <th className="p-4">CATEGORY</th>
                        <th className="p-4">DOMAIN</th>
                        <th className="p-4">REQUIRED OWNER</th>
                        <th className="p-4">RISK VALUE</th>
                        <th className="p-4">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 text-[var(--text-secondary)] font-medium">
                      <tr className="hover:bg-white/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--teal-primary)]">CTRL-104</td>
                        <td className="p-4 font-bold text-[var(--text-primary)]">HHCAHPS Submission or PER Maintenance &bull; <span className="text-[8px] text-zinc-400">HIGH IMPACT</span></td>
                        <td className="p-4">QAPI Program</td>
                        <td className="p-4 font-mono">QA / FN</td>
                        <td className="p-4">HHCAHPS Coordinator</td>
                        <td className="p-4 text-rose-600 font-extrabold font-mono">HIGH</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[9px] font-bold">UNKNOWN</span></td>
                      </tr>

                      <tr className="hover:bg-white/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-[var(--teal-primary)]">CTRL-103</td>
                        <td className="p-4 font-bold text-[var(--text-primary)]">Quality Indicator Dashboard (Monthly Production) &bull; <span className="text-[8px] text-zinc-400">HIGH IMPACT</span></td>
                        <td className="p-4">QAPI Program</td>
                        <td className="p-4 font-mono">QA</td>
                        <td className="p-4">QAPI Data Analyst</td>
                        <td className="p-4 text-rose-600 font-extrabold font-mono">HIGH</td>
                        <td className="p-4"><span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[9px] font-bold">UNKNOWN</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {}
          {/* =================================-------------------
              VIEW 8: SWIMLANES EXECUTION FLOW ("Screenshot 2026-06-16 124701.png")
              ----------------------------------================= */}
          {activeTab === 'swimlanes' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none text-xs">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-white bg-[var(--teal-primary)] px-2.5 py-0.5 rounded">
                    EVENT EXECUTION SURFACE
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Monthly Oig/Sam Exclusion Check
                  </h1>
                </div>

                <div className="flex gap-2 font-mono text-[10px] text-zinc-500 bg-white/40 p-2 rounded-xl border border-white">
                  <span>5 LINKED FORMS</span>
                  <span>&bull;</span>
                  <span>10 EVIDENCE REQS</span>
                  <span>&bull;</span>
                  <span>2 SIGNER PATHS</span>
                </div>
              </div>

              {/* Visual Swimlane grid matching Screenshot 2026-06-16 124701.png */}
              <div className="overflow-x-auto bg-white/20 backdrop-blur-[33px] p-6 border rounded-3xl premium-shadow">
                
                {/* Swimlanes structure container */}
                <div className="min-w-[1300px] grid grid-cols-12 gap-4 items-stretch">
                  
                  {/* Left Column: CO-WF-15 Roles indicators */}
                  <div className="col-span-2 border-r pr-4 border-white/50 space-y-20 pt-8 font-bold text-[var(--text-secondary)]">
                    <div className="p-3 bg-white/60 rounded-xl text-center shadow-sm">
                      COMPLIANCE OFFICER
                    </div>

                    <div className="p-3 bg-white/40 rounded-xl text-center shadow-sm border border-dashed text-[10px]">
                      EVIDENCE / ECIGN SYSTEM
                    </div>
                  </div>

                  {/* Right Column: Execution steps sequence columns */}
                  <div className="col-span-10 grid grid-cols-7 gap-4">
                    
                    {/* Step 1 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">REGULATORY TRIGGER</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono font-bold">PENDING</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Generate Master Roster</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">DOCUMENT REVIEW</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">REVIEW</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Run Oig Leie Screen</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">RISK REVIEW</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">REQ</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Run Sam.Gov Screen</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">FINDINGS / DECISION</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">REVIEW</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Annual Documented Attestation</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">APPROVAL</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono font-bold">PENDING</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Investigate Potential Matches</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-[var(--teal-primary)] tracking-widest text-center">EVIDENCE LOCK</div>
                      <div className="p-4 bg-white border rounded-2xl shadow-sm text-center space-y-3">
                        <span className="text-[8px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">REQ</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Pre-Hire Screening</h4>
                        <p className="text-[9px] text-zinc-500">Compliance Officer</p>
                      </div>
                    </div>

                    {/* Step 7 (Evidence Lock bottom route from Step 5) */}
                    <div className="space-y-3 pt-6">
                      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3 mt-12">
                        <span className="text-[8px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">BLOCKED</span>
                        <h4 className="font-bold text-[var(--text-primary)]">Final Evidence Package Locked</h4>
                        <p className="text-[9px] text-zinc-500">Evidence / eSign System</p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

        {}
        {/* BOTTOM RIGHT FLOATING CHECKLIST MODAL */}
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
          {/* Toggle checklist visibility */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 p-4 shadow-[0_18px_45px_rgba(82,77,75,0.14)] max-w-sm pointer-events-auto text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b select-none">
              <span className="font-bold text-[var(--teal-primary)] flex items-center gap-1.5 uppercase">
                <CheckSquare size={14} /> Guided UAT Milestones
              </span>
              <button 
                onClick={() => setIsUatPanelCollapsed(!isUatPanelCollapsed)}
                className="text-[10px] text-zinc-400 hover:text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded"
              >
                {isUatPanelCollapsed ? 'Expand' : 'Hide'}
              </button>
            </div>

            {!isUatPanelCollapsed && (
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500">Click checkboxes to simulate pipeline milestones:</div>
                <div className="space-y-1.5">
                  {uatCheckpoints.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleUatCheckpoint(item.id)}
                      className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors border select-none"
                    >
                      <span className={cx(item.completed ? "text-zinc-400 line-through" : "text-zinc-800 font-medium")}>
                        {item.label}
                      </span>
                      <div className={cx(
                        "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                        item.completed ? "bg-emerald-100 border-emerald-500 text-emerald-800" : "border-zinc-300"
                      )}>
                        {item.completed && <Check size={10} />}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-[10px] text-zinc-400 border-t flex justify-between font-mono">
                  <span>Score: {completedUatCount}/6 Done</span>
                  <span className="text-[var(--teal-primary)] font-bold">100% Client-Safe</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SYSTEM TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 left-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-white/90 backdrop-blur-xl p-4 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/50 animate-fadeIn flex items-center gap-3 min-w-[280px] pointer-events-auto"
          >
            <div className={cx(
              "h-2.5 w-2.5 rounded-full shrink-0", 
              toast.type === 'success' && 'bg-emerald-500 animate-pulse', 
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