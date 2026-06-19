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
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRightLeft,
  Tag,
  CheckSquare,
  Shield,
  FileSpreadsheet,
  AlertCircle
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
          "transition-all duration-300 group-hover:scale-110",
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

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, board, controls, workloads, reports, tasks, workflows, swimlane
  const [notifications, setNotifications] = useState([]);
  
  // Sidebar responsive collapse states (mutual-collapse safeguard active)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); 
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(true);

  // May 5 Popover Card visible triggers
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);

  // Filter conditions across multiple sheets
  const [selectedAssignee, setSelectedAssignee] = useState('COMPLIANCE OFFICER');
  const [selectedControlRisk, setSelectedControlRisk] = useState('ALL');
  const [selectedTaskFilter, setSelectedTypeFilter] = useState('Open');
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');

  // Guided UAT checkboxes directly linked to live status registers
  const [uatCheckpoints, setUatCheckpoints] = useState([
    { id: 'u1', label: 'Review operational posture', checked: true },
    { id: 'u2', label: 'Open and execute tasks', checked: true },
    { id: 'u3', label: 'Validate workflow timeline', checked: true },
    { id: 'u4', label: 'Complete required forms', checked: false },
    { id: 'u5', label: 'Upload and verify evidence', checked: false },
    { id: 'u6', label: 'Run audit readiness pass', checked: false }
  ]);

  const assigneeRoles = [
    'ADMINISTRATOR',
    'BILLING AUDITOR',
    'CLINICAL MANAGER',
    'COMPLIANCE OFFICER',
    'DIRECTOR OF NURSING',
    'HR DIRECTOR',
    'HR TRAINING COORDINATOR',
    'INFECTION PREVENTIONIST',
    'INFORMATION SECURITY OFFICER',
    'INTAKE SPECIALIST'
  ];

  const calendarEvents = [
    { 
      day: 5, 
      title: 'Monthly OIG/SAM Exclusion Check', 
      type: 'block', 
      code: 'OIG_SAM_EXCLUSION_CHECK-20260505-01',
      category: 'COMPLIANCE', 
      playground: 'SANDBOX / TRAINING PLAYGROUND',
      description: 'Monthly screening of all employees, contractors, and vendors against OIG LEIE and SAM exclusion lists.',
      steps: '9 STEPS',
      sla: '5d past',
      risk: 'High',
      auditReady: '50% AUDIT READY',
      auditState: 'Overdue',
      workflow: 'CO-WF-15',
      date: '2026-05-05',
      time: 'All day',
      owner: 'Compliance Officer',
      cadence: 'Monthly',
      driver: 'OIG guidance recommends monthly exclusion screening. Excluded Individual payment recovery and CMP exposure per 42 CFR \u00A7 1001.1901.',
      attendee: 'L. Washington'
    },
    { day: 11, title: 'Governing Body Mtg (Prep - Owner Brief)', type: 'due', owner: 'Compliance Officer' },
    { day: 11, title: 'Compliance Report (Weekly Snapshot)', type: 'due', owner: 'Compliance Officer' },
    { day: 12, title: 'QAPI Committee Meeting', type: 'block', owner: 'Clinical Manager' },
    { day: 15, title: 'Sentinel Event Root Cause Analysis (Tri...)', type: 'block', owner: 'Director of Nursing' },
    { day: 18, title: '30-Day Episode Review', type: 'track', owner: 'Compliance Officer' },
    { day: 19, title: 'Infection Control Review', type: 'track', owner: 'Compliance Officer' },
    { day: 22, title: 'QAPI Data Dashboard Refresh', type: 'track', owner: 'Clinical Manager' },
    { day: 26, title: 'Monthly Clinical Record Audit', type: 'track', owner: 'Compliance Officer' },
    { day: 29, title: 'Quarterly Vulnerability Scan', type: 'track', owner: 'Information Security Officer' },
    { day: 29, title: 'Quarterly Competency Validation Cycle', type: 'track', owner: 'Director of Nursing' }
  ];

  const swimlaneOfficerNodes = [
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-01', title: 'Generate Master Roster', owner: 'Compliance Officer', status: 'pending' },
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-02', title: 'Run Oig Leie Screen', owner: 'Compliance Officer', status: 'review' },
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-03', title: 'Run SAM.gov Screen', owner: 'Compliance Officer', status: 'req' },
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-04', title: 'Annual Documented Attestation Of Monthly Screening', owner: 'Compliance Officer', status: 'review' },
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-05', title: 'Investigate Potential Matches (Name + Dob + Ssn)', owner: 'Compliance Officer', status: 'pending' },
    { id: 'TASK-OIG-SAM-EXCLUSION-CO-06', title: 'Pre-Hire Screening', owner: 'Compliance Officer', status: 'req' }
  ];

  const swimlaneSystemNodes = [
    { id: 'TASK-OIG-SAM-EXCLUSION-SYS-01', title: 'Final Evidence Package Locked', owner: 'Evidence / eSign System', status: 'blocked' }
  ];

  const masterControlsInventory = [
    { id: 'CTRL-104', name: 'HHCAHPS Submission or PER Maintenance', category: 'QAPI Program', domain: 'QA / FN', owner: 'HHCAHPS Coordinator', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-103', name: 'Quality Indicator Dashboard (Monthly Production)', category: 'QAPI Program', domain: 'QA', owner: 'QAPI Data Analyst', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-102', name: 'At-Least-One Active PIP (Continuous)', category: 'QAPI Program', domain: 'QA', owner: 'QAPI Lead', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-101', name: 'QAPI Program (Ongoing, Agency-Wide, Data-Driven)', category: 'QAPI Program', domain: 'QA', owner: 'QAPI Lead / Clinical Manager', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-099', name: 'Enterprise Mandated-Events Calendar', category: 'Enterprise Policy & Records', domain: 'EN / CO', owner: 'Compliance Officer', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-098', name: 'Records Retention & Destruction Schedule', category: 'Enterprise Policy & Records', domain: 'EN / IT / CL', owner: 'Records Officer', risk: 'HIGH', status: 'UNKNOWN' },
    { id: 'CTRL-096', name: 'Policy Lifecycle Control (Draft\u2192Approve\u2192Publish\u2192Retire)', category: 'Enterprise Policy & Records', domain: 'EN', owner: 'Policy Owner / Compliance Officer', risk: 'HIGH', status: 'UNKNOWN' }
  ];

  const workloadRoster = [
    { name: 'Maria Santos, RN', role: 'RN', allocated: 46, status: 'OVERLOADED', color: 'bg-emerald-500' },
    { name: 'Grace Abella, HHA', role: 'HHA', allocated: 43, status: 'OVERLOADED', color: 'bg-emerald-500' },
    { name: 'Jonathan Park, LVN', role: 'LVN', allocated: 44, status: 'OVERLOADED', color: 'bg-emerald-500' },
    { name: 'Dr. Elena Navarro, RN DON', role: 'DON', allocated: 69, status: 'OVERLOADED', color: 'bg-emerald-500' },
    { name: 'Robert Cruz, Administrator', role: 'ADM', allocated: 59, status: 'OVERLOADED', color: 'bg-emerald-500' }
  ];

  const workflowsCollection = [
    { id: 'CL-WF-26', title: 'Plan Of Care Audit', category: 'CL \u2022 CLINICAL', risk: 'Immediate jeopardy', riskColor: 'text-red-600', desc: 'Monthly stratified-sample audit of active Plans of Care to verify physician signature timeliness, goal/intervention parameters.' },
    { id: 'CL-WF-27', title: 'Oasis Accuracy Audit', category: 'CL \u2022 CLINICAL', risk: 'Moderate risk', riskColor: 'text-amber-600', desc: 'Monthly stratified audit of OASIS submissions for accuracy (M-item logic, ICD-10 alignment, response validation).' },
    { id: 'CL-WF-28', title: 'Visit Documentation Audit', category: 'CL \u2022 CLINICAL', risk: 'High risk', riskColor: 'text-red-500', desc: 'Monthly audit of skilled visit notes for timeliness (\u226424h), POC alignment, skilled need narrative, and supervisor validation.' },
    { id: 'CL-WF-29', title: 'Clinical Record Completeness Audit', category: 'CL \u2022 CLINICAL', risk: 'High risk', riskColor: 'text-red-500', desc: 'Quarterly audit of closed and active clinical records for completeness against the 22-element record checklist.' }
  ];

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleCalendarDayClick = (e, event) => {
    e.stopPropagation();
    setSelectedCalendarEvent(event);
    addToast(`Inspecting calendar checkpoint: ${event.title}`, 'success');
  };

  const toggleCheckpoint = (id) => {
    setUatCheckpoints(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  // Safe Mode mutual collapse handlers
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

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Visual Design Core Tokens & Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-atm: transparent;
          --border-card: rgba(255, 255, 255, 0.45);
          --border-card-hover: rgba(0, 121, 125, 0.35);
          --bg-card: rgba(255, 255, 255, 0.22);
          
          --text-primary: #1F1C1B;
          --text-secondary: #524D4B;
          --text-tertiary: #74706F;
          
          --teal-primary: #00797D;
          --orange-primary: #C74601;
          --spotlight-fallback: rgba(0, 121, 125, 0.05);
          --drawer-bg: rgba(255, 255, 255, 0.96);
        }

        .light-shell {
          font-family: 'Inter', sans-serif;
          background-color: #F8F3F0;
          color: var(--text-primary);
        }
        
        /* Floating background gradients matching original warm design */
        .light-shell::before {
          content: "";
          position: fixed;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background: 
            radial-gradient(circle at 15% 15%, rgba(199, 70, 1, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(0, 121, 125, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 218, 198, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 95% 10%, rgba(229, 254, 255, 0.6) 0%, transparent 45%);
          filter: blur(95px);
          animation: ambientFlow 28s ease-in-out infinite alternate;
        }

        @keyframes ambientFlow {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.08) translate(-1%, 2.5%); }
        }

        .font-heading {
          font-family: 'Montserrat', sans-serif;
        }

        /* 3D Glass Layer and Bevel Effects for side menu button labels */
        .nav-btn-3d {
          perspective: 600px;
          transform-style: preserve-3d;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.03), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.95),
            inset 0 -1.5px 2px rgba(0, 0, 0, 0.03);
        }
        .nav-btn-3d:hover {
          transform: rotateY(-8deg) rotateX(8deg) translateZ(4px);
          background: rgba(255, 255, 255, 0.45);
          border-color: rgba(0, 121, 125, 0.25);
          box-shadow: 
            2px 8px 18px rgba(0, 121, 125, 0.08), 
            inset 0 1.5px 3px rgba(255, 255, 255, 1);
        }
        .nav-btn-active-glow {
          transform: rotateY(-6deg) rotateX(6deg) translateZ(6px);
          background: rgba(0, 121, 125, 0.06) !important;
          border-color: rgba(0, 121, 125, 0.4) !important;
          box-shadow: 
            0 0 16px rgba(0, 121, 125, 0.32), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.65),
            inset -1px -2px 3px rgba(0, 121, 125, 0.08) !important;
        }

        /* Deep visual drop shadow profiles for cards */
        .premium-shadow {
          box-shadow: 
            0 12px 32px -8px rgba(0, 0, 0, 0.06),
            0 4px 12px -3px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
        }
        .hover\\:shadow-depth {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover\\:shadow-depth:hover {
          box-shadow: 
            0 28px 54px -12px rgba(199, 70, 1, 0.07),
            0 10px 24px -5px rgba(0, 121, 125, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
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
                      box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1);
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
          background-color: rgba(255, 255, 255, 0.3);
        }

        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
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

      {/* FIXED LOGO TOP BAR HEADER */}
      <header className="flex h-[76px] w-full flex-shrink-0 items-center justify-between px-9 bg-white/20 backdrop-blur-[33px] relative z-30 border-b border-white/25 select-none shadow-sm">
        
        {/* Brand Container completely separated from sidebars */}
        <div className="flex items-center gap-3 w-[265px] shrink-0 pr-4">
          <img 
            src="https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png" 
            alt="CareIndeed Brand Logo" 
            className="h-7 w-auto object-contain select-none pointer-events-none"
          />
        </div>

        {/* Global Search Module */}
        <div className="flex flex-1 items-center max-w-md ml-4">
          <div className="group relative w-full cursor-pointer">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <div className="w-full rounded-full bg-white/45 pl-10 pr-12 py-2 text-xs text-[var(--text-secondary)] select-none flex items-center justify-between h-[36px] group-hover:bg-white/60 transition-all border border-white/60 premium-shadow">
              <span>Search active policies, compliance keys, tasks...</span>
              <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono text-[var(--text-secondary)] shadow-sm shrink-0 ml-2">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Right System Indicators */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => {
              addToast('System status check: 100% compliant. Secure tunnels are encrypted.', 'success');
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--teal-primary)] transition-all border border-white/55 premium-shadow"
            title="Safe Tunnel Metrics"
          >
            <Lock size={14} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button 
            onClick={() => {
              const nextState = !isPersonalOpsOpen;
              handleSetPersonalOpsOpen(nextState);
              addToast(nextState ? 'Personal Operations Drawer opened (Nav Sidebar closed)' : 'Personal Operations Drawer closed', 'info');
            }}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md ml-2 relative border-2 border-white/70",
              isPersonalOpsOpen ? "bg-[var(--orange-primary)] scale-105" : "bg-[var(--teal-primary)]"
            )}
            title="Toggle Personal Operations Drawer"
          >
            RP
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
          </button>
        </div>
      </header>

      {/* LOWER DIVISION */}
      <div className="flex-1 flex overflow-hidden w-full relative z-10">
        
        {/* LEFT COMPLIANCE SIDEBAR */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-r border-white/20 shrink-0",
            isSidebarCollapsed ? "w-[78px]" : "w-[265px]"
          )}
        >
          <div className="p-4 flex justify-end select-none">
            <button
              onClick={() => handleSetSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          <div className="flex-1 space-y-7 overflow-y-auto px-4 py-2 select-none">
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Operations
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={Calendar} 
                  label="Compliance Calendar" 
                  active={activeTab === 'calendar'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('calendar'); setSelectedCalendarEvent(null); }} 
                />

                <InteractiveNavButton 
                  icon={Layers} 
                  label="Sprint Board" 
                  active={activeTab === 'board'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('board'); }} 
                />

                <InteractiveNavButton 
                  icon={Shield} 
                  label="Master Controls" 
                  active={activeTab === 'controls'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('controls'); }} 
                />

                <InteractiveNavButton 
                  icon={Users} 
                  label="Workload Distribution" 
                  active={activeTab === 'workloads'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('workloads'); }} 
                />

                <InteractiveNavButton 
                  icon={FileSpreadsheet} 
                  label="Executive Reports" 
                  active={activeTab === 'reports'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('reports'); }} 
                />

                <InteractiveNavButton 
                  icon={CheckSquare} 
                  label="Task Command View" 
                  active={activeTab === 'tasks'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('tasks'); }} 
                />

                <InteractiveNavButton 
                  icon={TrendingUp} 
                  label="Core Workflows" 
                  active={activeTab === 'workflows'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('workflows'); }} 
                />

                <InteractiveNavButton 
                  icon={Layers} 
                  label="CO-WF-15 Swimlane" 
                  active={activeTab === 'swimlane'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('swimlane'); }} 
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/25 select-none text-[11px] font-bold text-[var(--text-primary)] border-t border-white/20">
            <span className="flex items-center gap-1.5 justify-center">
              <Lock size={12} className="text-[var(--teal-primary)]" />
              {!isSidebarCollapsed && <span>Safe Mode Verified</span>}
            </span>
          </div>
        </aside>

        {/* COMPLIANCE WORKSPACE CONTAINER */}
        <div className="flex-1 flex overflow-hidden">
          
          <main className="flex-1 overflow-y-auto bg-transparent p-6 md:p-9 relative">
            
            {/* VIEW 1: REGULATORY EVENTS CALENDAR (01_ces_calendar_4.png) */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fadeIn select-none relative">
                
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    EVENT CALENDAR
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] flex items-center gap-2">
                    Regulatory events • May 2026
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                    A single CES control surface for mandated calendar execution, drill-in workflow review, and polished role-based scanning. Click an event inside Day 5 to launch its interactive popover.
                  </p>
                </div>

                {/* Sub controls bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/25 p-4 rounded-2xl border border-white/50 premium-shadow">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">SLA CATEGORIES:</span>
                    <div className="flex gap-2">
                      <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2.5 py-0.5 rounded border border-red-200">BLOCK 19</span>
                      <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded border border-amber-200">DUE 13</span>
                      <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200">TRACK 2</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-mono">MAY 2026</span>
                    <button 
                      onClick={() => addToast('Synchronizing structural calendar logs with CA state registers...', 'success')}
                      className="px-4 py-1.5 bg-[var(--teal-primary)] text-white font-bold text-[10px] uppercase rounded-full shadow hover:bg-[var(--teal-primary)]/90 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles size={11} /> Sync All Events
                    </button>
                  </div>
                </div>

                {/* Role Assignee Slide Filter */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block px-1">Filter by Assignee Role Scope</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-hide px-1">
                    {assigneeRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedAssignee(role);
                          addToast(`Filtering calendar events for role: ${role}`);
                        }}
                        className={cx(
                          "px-4 py-1.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                          selectedAssignee === role 
                            ? "bg-[var(--teal-primary)] text-white border-[var(--teal-primary)] shadow-sm" 
                            : "bg-white/45 text-[var(--text-secondary)] border-white/60 hover:bg-white/70"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calendar Grid representation (May 2026 begins on a Friday) */}
                <div className="grid grid-cols-7 gap-3 bg-white/10 p-5 rounded-3xl border border-white/30 shadow-lg relative">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((wDay) => (
                    <div key={wDay} className="text-center font-bold text-[10px] text-[var(--teal-primary)] tracking-widest pb-3 border-b border-white/15">
                      {wDay}
                    </div>
                  ))}
                  
                  {/* Padding Days for May 2026 start on Friday */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-28 bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30" />
                  ))}

                  {/* 31 active days of May 2026 */}
                  {Array.from({ length: 31 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const dayEvents = calendarEvents.filter(e => e.day === dayNum);

                    return (
                      <div 
                        key={dayNum} 
                        className={cx(
                          "h-28 p-2.5 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden",
                          dayEvents.length > 0 
                            ? "bg-white/255 border-teal-500/35 hover:bg-white/75 shadow-sm" 
                            : "bg-white/20 border-white/20 opacity-90"
                        )}
                      >
                        <span className="text-[11px] font-extrabold text-[var(--text-secondary)]">{dayNum}</span>
                        
                        <div className="space-y-1 mt-1 overflow-y-auto max-h-[70px]">
                          {dayEvents.map((ev, eIdx) => (
                            <div 
                              key={eIdx}
                              onClick={(e) => handleCalendarDayClick(e, ev)}
                              className={cx(
                                "text-[8.5px] font-extrabold p-1.5 rounded-lg leading-tight truncate cursor-pointer hover:scale-95 transition-all shadow-sm",
                                ev.type === 'block' && "bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] border border-[var(--orange-primary)]/20 shadow-sm",
                                ev.type === 'due' && "bg-amber-100 text-amber-800 border border-amber-200 shadow-sm",
                                ev.type === 'track' && "bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/20 shadow-sm"
                              )}
                              title={ev.title}
                            >
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* May 5 Exclusion Check Popover Card - REDESIGNED BEAUTIFULLY IN LIGHT MODE (image_d0bd37.png / image_d14119.png) */}
                {selectedCalendarEvent && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-md" onClick={() => setSelectedCalendarEvent(null)}>
                    <div 
                      className="w-full max-w-[540px] bg-white/95 backdrop-blur-2xl text-stone-800 rounded-3xl p-7 shadow-[0_18px_45px_rgba(82,77,75,0.14)] animate-fadeIn space-y-6 border border-white premium-shadow text-xs text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Popover Header */}
                      <div className="flex justify-between items-start border-b border-stone-200 pb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-2.5 py-0.5 rounded border border-red-200 uppercase tracking-widest font-mono">
                              {selectedCalendarEvent.auditState || 'OVERDUE'}
                            </span>
                            <span className="font-mono text-[10px] text-stone-500 tracking-wider">{selectedCalendarEvent.code || 'CO-WF-15'}</span>
                          </div>
                          
                          <h3 className="font-heading text-xl font-extrabold text-[var(--teal-primary)] leading-tight tracking-tight">
                            {selectedCalendarEvent.title}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[8.5px] font-extrabold bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 tracking-wider font-mono">
                              COMPLIANCE
                            </span>
                            <span className="text-[8.5px] font-extrabold bg-stone-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200 tracking-wider font-mono">
                              {selectedCalendarEvent.playground}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedCalendarEvent(null)}
                          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Six Badges Grid in Light Mode */}
                      <div className="grid grid-cols-3 gap-3 select-none font-mono">
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">Steps</div>
                          <div className="text-xs font-extrabold text-[var(--teal-primary)] mt-1">{selectedCalendarEvent.steps}</div>
                        </div>
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">SLA Limit</div>
                          <div className="text-xs font-extrabold text-red-600 mt-1">{selectedCalendarEvent.sla}</div>
                        </div>
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">Risk Vector</div>
                          <div className="text-xs font-extrabold text-amber-600 mt-1">{selectedCalendarEvent.risk}</div>
                        </div>
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">Ready Level</div>
                          <div className="text-xs font-extrabold text-emerald-600 mt-1">{selectedCalendarEvent.auditReady}</div>
                        </div>
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">Audit State</div>
                          <div className="text-xs font-extrabold text-red-600 mt-1">{selectedCalendarEvent.auditState}</div>
                        </div>
                        <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200 text-center shadow-sm">
                          <div className="text-[8px] text-stone-500 uppercase font-bold tracking-widest">Workflow Map</div>
                          <div className="text-xs font-extrabold text-[var(--teal-primary)] mt-1">{selectedCalendarEvent.workflow}</div>
                        </div>
                      </div>

                      {/* Text detail registers */}
                      <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-200/80 text-[11px] leading-relaxed max-h-[190px] overflow-y-auto space-y-3 shadow-inner">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-stone-200 pb-3">
                          <div><span className="text-stone-500">Date:</span> <span className="text-stone-800 font-semibold">{selectedCalendarEvent.date}</span></div>
                          <div><span className="text-stone-500">Time:</span> <span className="text-stone-800 font-semibold">{selectedCalendarEvent.time}</span></div>
                          <div><span className="text-stone-500">Owner role:</span> <span className="text-stone-800 font-semibold">{selectedCalendarEvent.owner}</span></div>
                          <div><span className="text-stone-500">Cadence:</span> <span className="text-stone-800 font-semibold">{selectedCalendarEvent.cadence}</span></div>
                          <div><span className="text-stone-500">Workflow ID:</span> <span className="text-stone-800 font-semibold font-mono">{selectedCalendarEvent.workflow}</span></div>
                          <div><span className="text-stone-500">Audit state:</span> <span className="text-stone-800 font-semibold text-red-600">{selectedCalendarEvent.auditState}</span></div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="space-y-1">
                            <span className="text-stone-500 font-semibold block text-[10px] uppercase tracking-wider">Regulatory driver</span>
                            <span className="text-stone-700 leading-normal block">{selectedCalendarEvent.driver}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-stone-500 font-semibold block text-[10px] uppercase tracking-wider">Short description</span>
                            <span className="text-stone-700 leading-normal block">{selectedCalendarEvent.description}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 pt-2 border-t border-stone-200 text-[10px]">
                          <div><span className="text-stone-500 block">Required signer roles:</span> <span className="text-stone-400">No signer roles configured.</span></div>
                          <div><span className="text-zinc-500 block">Agenda owners:</span> <span className="text-zinc-400">No agenda owners configured.</span></div>
                        </div>
                      </div>

                      {/* Participant detail */}
                      <div className="border-t border-stone-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-stone-100 text-teal-700 flex items-center justify-center font-bold text-xs border border-stone-200 shadow-sm shrink-0">
                            LW
                          </div>
                          <div>
                            <div className="font-bold text-stone-800">{selectedCalendarEvent.attendee}</div>
                            <div className="text-[9.5px] text-stone-500">Compliance Officer</div>
                          </div>
                          <span className="text-[7.5px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded tracking-widest shrink-0 ml-1">
                            ORGANIZER
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab('swimlane');
                            setSelectedCalendarEvent(null);
                            addToast('Loading CO-WF-15 Exclusion Check Swimlane...', 'success');
                          }}
                          className="px-5 py-2.5 bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white font-extrabold text-[9.5px] tracking-widest uppercase rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/10 border border-teal-600/30 self-stretch sm:self-auto justify-center"
                        >
                          Open Event Swimlane <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW 2: SPRINT BOARD (02_ces_board_4.png) */}
            {activeTab === 'board' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    SPRINT BOARD
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    Sprint Execution Board
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Event \u2192 Workflow \u2192 Execution Unit. Drag enforces state-machine rules; invalid moves snap back.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Column Upcoming */}
                  <div className="bg-white/30 p-4 rounded-2xl border border-white/50 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] border-b pb-2">
                      <span>UPCOMING</span>
                      <span className="bg-white/250 px-2 py-0.5 rounded">0</span>
                    </div>
                    <div className="h-48 flex items-center justify-center text-xs text-[var(--text-tertiary)] italic">
                      No execution units in Upcoming
                    </div>
                  </div>

                  {/* Column Ready */}
                  <div className="bg-white/30 p-4 rounded-2xl border border-white/50 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] border-b pb-2">
                      <span>READY</span>
                      <span className="bg-white/250 px-2 py-0.5 rounded">0</span>
                    </div>
                    <div className="h-48 flex items-center justify-center text-xs text-[var(--text-tertiary)] italic">
                      No execution units in Ready
                    </div>
                  </div>

                  {/* Column In Progress */}
                  <div className="bg-white/30 p-4 rounded-2xl border border-white/50 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--teal-primary)] border-b pb-2">
                      <span>IN PROGRESS</span>
                      <span className="bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2 py-0.5 rounded">127</span>
                    </div>
                    
                    <div className="space-y-3">
                      <SpotlightCard className="p-4 space-y-3 cursor-pointer" onClick={() => addToast('Inspecting Plan of Care Audit...')}>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-extrabold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-1.5 py-0.5 rounded">CLINICAL</span>
                          <span className="text-[9px] text-[var(--text-tertiary)]">Audit 28%</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">Pull active episode list and apply stratified sampling</h4>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-2 border-t">
                          <span>TJ Padilla (DON)</span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Not Ready</span>
                        </div>
                      </SpotlightCard>

                      <SpotlightCard className="p-4 space-y-3 cursor-pointer" onClick={() => addToast('Inspecting OASIS Verification...')}>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-extrabold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-1.5 py-0.5 rounded">CLINICAL</span>
                          <span className="text-[9px] text-[var(--text-tertiary)]">Audit 28%</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)]">Score each POC against checklist goals (SMART criteria)</h4>
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] pt-2 border-t">
                          <span>TJ Padilla (DON)</span>
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Not Ready</span>
                        </div>
                      </SpotlightCard>
                    </div>
                  </div>

                  {/* Column Awaiting Signature */}
                  <div className="bg-white/30 p-4 rounded-2xl border border-white/50 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] border-b pb-2">
                      <span>AWAITING SIGNATURE</span>
                      <span className="bg-white/250 px-2 py-0.5 rounded">0</span>
                    </div>
                    <div className="h-48 flex items-center justify-center text-xs text-[var(--text-tertiary)] italic">
                      No execution units in Awaiting
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 3: MASTER CONTROLS (07_master_controls_4.png) */}
            {activeTab === 'controls' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    COMPLIANCE COMMAND CENTER
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    Master control inventory
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Structured, auditable registry of required-at-all-times controls.</p>
                </div>

                {/* Badges Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div className="bg-white/40 p-3 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">TOTAL CONTROLS</div>
                    <div className="text-lg font-bold text-[var(--teal-primary)]">104</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center border-red-200">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">HIGH RISK</div>
                    <div className="text-lg font-bold text-red-600">81</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center border-amber-200">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">MATERIAL RISK</div>
                    <div className="text-lg font-bold text-amber-600">22</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">LOW RISK</div>
                    <div className="text-lg font-bold text-emerald-600">1</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">ACTIVE</div>
                    <div className="text-lg font-bold text-neutral-800">0</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">DEFICIENT</div>
                    <div className="text-lg font-bold text-neutral-800">0</div>
                  </div>
                  <div className="bg-white/40 p-3 rounded-xl border text-center col-span-2">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">UNKNOWN / BLOCKED UNITS</div>
                    <div className="text-lg font-bold text-neutral-800">104 / 1904</div>
                  </div>
                </div>

                {/* Table list */}
                <div className="bg-white/20 backdrop-blur-[33px] rounded-2xl overflow-hidden border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4">ID</th>
                          <th className="p-4">Control Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Domain</th>
                          <th className="p-4">Required Owner</th>
                          <th className="p-4">Risk</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {masterControlsInventory.map((ctrl, i) => (
                          <tr key={i} className="hover:bg-white/30 transition-colors">
                            <td className="p-4 font-mono font-bold text-[var(--teal-primary)]">{ctrl.id}</td>
                            <td className="p-4 font-bold text-[var(--text-primary)]">{ctrl.name}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{ctrl.category}</td>
                            <td className="p-4 text-[var(--text-tertiary)] font-mono">{ctrl.domain}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{ctrl.owner}</td>
                            <td className="p-4 text-red-600 font-extrabold text-[10px]">{ctrl.risk}</td>
                            <td className="p-4 text-blue-600 font-bold">{ctrl.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 4: WORKLOAD DISTRIBUTION (03_ces_workloads_4.png) */}
            {activeTab === 'workloads' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    WORKLOADS
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    Workload Distribution
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Owner-level accountability. Capacity risk reflects load, overdue items, and pending signatures.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold uppercase text-[var(--text-tertiary)]">TOTAL OWNERS</div>
                    <div className="text-2xl font-bold text-[var(--teal-primary)] mt-1">5</div>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border text-center border-red-200">
                    <div className="text-[8px] font-bold uppercase text-[var(--text-tertiary)]">OWNERS OVERLOADED</div>
                    <div className="text-2xl font-bold text-red-600 mt-1">5</div>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold uppercase text-[var(--text-tertiary)] font-mono">OWNERS ON WATCH</div>
                    <div className="text-2xl font-bold text-neutral-800 mt-1">0</div>
                  </div>
                </div>

                {/* Owner list */}
                <div className="bg-white/20 rounded-2xl border p-6 space-y-4">
                  <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">Owner Assignments</h3>
                  
                  <div className="space-y-3.5">
                    {workloadRoster.map((rosterItem, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white/45 rounded-xl border">
                        <div className="flex items-center gap-3 w-64">
                          <div className="h-8 w-8 rounded-full bg-[var(--teal-primary)] text-white font-bold flex items-center justify-center text-xs">
                            {rosterItem.name.split(' ')[0][0]}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)] text-xs">{rosterItem.name}</div>
                            <div className="text-[9.5px] text-[var(--text-tertiary)]">{rosterItem.role}</div>
                          </div>
                        </div>

                        {/* Progress Meter Bar */}
                        <div className="flex-1 max-w-md">
                          <div className="flex justify-between items-center text-[9px] font-bold text-[var(--text-tertiary)] mb-1">
                            <span>ALLOCATED CAPACITY</span>
                            <span>{rosterItem.allocated}%</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden border">
                            <div className="h-full bg-[var(--teal-primary)]" style={{ width: `${rosterItem.allocated}%` }} />
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-3 py-1 rounded border border-red-200 uppercase tracking-widest">
                            {rosterItem.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 5: EXECUTIVE REPORTS (04_ces_reports_4.png) */}
            {activeTab === 'reports' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    EXECUTIVE SUMMARY REPORTS
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    Executive Reports Dashboard
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Sprint-over-sprint compliance trends. Each chart isolates a regulatory KPI.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Chart 1: Compliance Completion Rate */}
                  <div className="bg-white/40 p-5 rounded-2xl border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">Compliance Completion Rate (%)</h3>
                      <span className="text-[10px] font-bold text-[var(--teal-primary)]">Target: 85%</span>
                    </div>
                    <div className="h-32 flex items-center justify-center text-3xl font-extrabold text-[var(--teal-primary)] border border-dashed rounded-xl bg-white/20">
                      0% <span className="text-xs text-[var(--text-secondary)] ml-2">+0% vs prior</span>
                    </div>
                  </div>

                  {/* Chart 2: On-Time Completion */}
                  <div className="bg-white/40 p-5 rounded-2xl border space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">On-Time Completion (%)</h3>
                      <span className="text-[10px] font-bold text-[var(--teal-primary)]">Target: 80%</span>
                    </div>
                    <div className="h-32 flex items-center justify-center text-3xl font-extrabold text-[var(--teal-primary)] border border-dashed rounded-xl bg-white/20">
                      0% <span className="text-xs text-[var(--text-secondary)] ml-2">+0% vs prior</span>
                    </div>
                  </div>

                  {/* Chart 3: Audit Readiness Score */}
                  <div className="bg-white/40 p-5 rounded-2xl border space-y-4">
                    <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">Audit Readiness Score (0-100)</h3>
                    <div className="h-32 flex items-center justify-center text-3xl font-extrabold text-neutral-700 border border-dashed rounded-xl bg-white/20">
                      0 <span className="text-xs text-[var(--text-secondary)] ml-2">+0 vs prior</span>
                    </div>
                  </div>

                  {/* Chart 4: Signature SLA Compliance */}
                  <div className="bg-white/40 p-5 rounded-2xl border space-y-4">
                    <h3 className="text-xs font-bold text-[var(--teal-primary)] uppercase tracking-wider">Signature SLA Compliance (%)</h3>
                    <div className="h-32 flex items-center justify-center text-3xl font-extrabold text-neutral-700 border border-dashed rounded-xl bg-white/20">
                      0 <span className="text-xs text-[var(--text-secondary)] ml-2">+0 vs prior</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 6: TASK COMMAND VIEW (05_my_tasks_4.png) */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    MY TASKS
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    Task Command View
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)]">Clear execution path from triage to completion with role-aware queue confidence.</p>
                </div>

                {/* Sub filter tabs */}
                <div className="flex gap-2 border-b pb-3">
                  {['All', 'Open', 'Awaiting Signature', 'Blocked', 'Overdue'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setSelectedTypeFilter(tab);
                        addToast(`Showing task group: ${tab}`);
                      }}
                      className={cx(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all border",
                        selectedTaskFilter === tab 
                          ? "bg-[var(--teal-primary)] text-white border-[var(--teal-primary)]" 
                          : "bg-white text-[var(--text-secondary)] hover:bg-neutral-50"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="bg-white/35 backdrop-blur-[33px] p-12 rounded-2xl border border-white/50 text-center space-y-4 premium-shadow">
                  <div className="text-xs text-[var(--text-secondary)] font-medium">
                    No tasks match this filter. Try checking all items or upcoming schedules.
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedTypeFilter('All');
                      addToast('Reset filters to show all operational tasks.');
                    }}
                    className="px-5 py-2 bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white font-bold text-xs uppercase rounded-lg transition-colors shadow"
                  >
                    View all tasks
                  </button>
                </div>

              </div>
            )}

            {/* VIEW 7: CORE WORKFLOWS DIRECTORY (06_workflows_4.png) */}
            {activeTab === 'workflows' && (
              <div className="space-y-6 animate-fadeIn select-none">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    Visual Process Roadmaps
                  </span>
                  <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                    206 operational workflows • 10 domains
                  </h1>
                </div>

                {/* KPI metrics row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">TOTAL WORKFLOWS</div>
                    <div className="text-xl font-bold text-neutral-800 mt-1">206</div>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">MANDATED / RECURRING</div>
                    <div className="text-xl font-bold text-neutral-800 mt-1">112</div>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">HIGH-RISK OPEN</div>
                    <div className="text-xl font-bold text-neutral-800 mt-1">63</div>
                  </div>
                  <div className="bg-white/40 p-4 rounded-xl border text-center">
                    <div className="text-[8px] font-bold text-[var(--text-tertiary)] uppercase">GB APPROVALS PENDING</div>
                    <div className="text-xl font-bold text-neutral-800 mt-1">62</div>
                  </div>
                </div>

                {/* Live workflows filters */}
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={workflowSearchQuery}
                    onChange={(e) => setWorkflowSearchQuery(e.target.value)}
                    placeholder="Search workflows by ID, title, process..."
                    className="w-full bg-white/40 border border-white/50 pl-10 pr-4 py-2.5 text-xs rounded-xl outline-none focus:bg-white/60 transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)] shadow-inner"
                  />
                </div>

                {/* Workflow Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflowsCollection.filter(w => w.title.toLowerCase().includes(workflowSearchQuery.toLowerCase())).map((w, idx) => (
                    <SpotlightCard key={idx} className="p-5 space-y-3 cursor-pointer" onClick={() => addToast(`Opening workflow tracking sheet: ${w.title}`)}>
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[var(--teal-primary)]">{w.category}</span>
                        <span className={w.riskColor}>{w.risk}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{w.title}</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{w.desc}</p>
                    </SpotlightCard>
                  ))}
                </div>

              </div>
            )}

            {/* VIEW 8: CO-WF-15 SWIMLANE VIEW (Screenshot 2026-06-16 124701.png) */}
            {activeTab === 'swimlane' && (
              <div className="space-y-6 animate-fadeIn select-none">
                
                {/* Swimlane header block from Screenshot 2026-06-16 124701.png */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b">
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                      EVENT EXECUTION • Event-owned visual execution surface
                    </span>
                    <h1 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)]">
                      Monthly Oig/Sam Exclusion Check
                    </h1>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-2">
                      <div><strong className="text-[var(--teal-primary)]">5</strong> LINKED FORMS</div>
                      <div><strong className="text-[var(--teal-primary)] font-mono">10</strong> EVIDENCE REQUIREMENTS</div>
                      <div><strong className="text-[var(--teal-primary)] font-mono">2</strong> SIGNER/REVIEWER PATHS</div>
                    </div>

                    <button 
                      onClick={() => {
                        setActiveTab('calendar');
                        setSelectedCalendarEvent(null);
                      }}
                      className="px-4 py-1.5 bg-white border border-neutral-300 text-[var(--text-primary)] font-bold text-[10px] uppercase rounded hover:bg-neutral-50 transition-colors shadow-sm"
                    >
                      Back to Calendar
                    </button>
                  </div>
                </div>

                {/* Swimlane Column Matrix Grid */}
                <div className="bg-white/10 backdrop-blur-[33px] rounded-3xl p-6 overflow-x-auto border shadow-lg relative">
                  <div className="min-w-[1200px] space-y-6 relative">
                    
                    {/* SVG Connector Lines Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" style={{ minWidth: '1200px' }}>
                      {/* Connection from Task 5 (Investigate matches) to eSign final package */}
                      <path d="M 830 110 L 830 190 L 980 190" fill="none" stroke="var(--orange-primary)" strokeWidth="1.5" strokeDasharray="4 3" />
                      {/* Connection from Task 6 (Pre-Hire) to eSign final package */}
                      <path d="M 1010 110 L 1010 145" fill="none" stroke="var(--orange-primary)" strokeWidth="1.5" />
                    </svg>

                    {/* Horizontal Headers Row */}
                    <div className="grid grid-cols-7 gap-4 text-center">
                      <div className="text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider pb-2">CO-WF-15 ROLES</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">REGULATORY TRIGGER</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">DOCUMENT REVIEW</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">RISK REVIEW</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">FINDINGS / DECISION</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">APPROVAL</div>
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 border-b border-white/20">EVIDENCE LOCK</div>
                    </div>

                    {/* Row 1: COMPLIANCE OFFICER */}
                    <div className="grid grid-cols-7 gap-4 items-stretch relative z-10">
                      
                      {/* Vertical Side label cell */}
                      <div className="bg-white/40 p-4 rounded-2xl flex flex-col justify-center border text-center">
                        <span className="text-[10px] font-extrabold text-[var(--teal-primary)] tracking-wider">COMPLIANCE OFFICER</span>
                      </div>

                      {/* Node 1 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border uppercase">PENDING</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Generate Master Roster</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                      {/* Node 2 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border uppercase font-bold">REVIEW</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Run Oig Leie Screen</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                      {/* Node 3 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border uppercase font-bold">REQ</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Run Sam.Gov Screen</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                      {/* Node 4 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border uppercase font-bold">REVIEW</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Annual Documented Attestation</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                      {/* Node 5 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border uppercase">PENDING</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Investigate Potential Matches (Name + Dob + Ssn)</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                      {/* Node 6 */}
                      <div className="p-4 bg-white/250 hover:bg-white/70 rounded-2xl border transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-[var(--text-tertiary)]">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border uppercase font-bold">REQ</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug mt-2">Pre-Hire Screening</h4>
                        <p className="text-[9px] text-[var(--text-secondary)] mt-1">Compliance Officer</p>
                      </div>

                    </div>

                    {/* Row 2: EVIDENCE / ECIGN SYSTEM */}
                    <div className="grid grid-cols-7 gap-4 items-stretch relative z-10">
                      
                      {/* Vertical Side label cell */}
                      <div className="bg-white/40 p-4 rounded-2xl flex flex-col justify-center border text-center">
                        <span className="text-[10px] font-extrabold text-[var(--orange-primary)] tracking-wider">EVIDENCE / ECIGN SYSTEM</span>
                      </div>

                      {/* Column 2, 3, 4, 5, 6: Empty cells styled beautifully */}
                      <div className="bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30 flex items-center justify-center text-[9px] italic text-[var(--text-tertiary)]">System automation log</div>
                      <div className="bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30 flex items-center justify-center text-[9px] italic text-[var(--text-tertiary)]">System automation log</div>
                      <div className="bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30 flex items-center justify-center text-[9px] italic text-[var(--text-tertiary)]">System automation log</div>
                      <div className="bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30 flex items-center justify-center text-[9px] italic text-[var(--text-tertiary)]">System automation log</div>
                      <div className="bg-white/25 rounded-2xl border border-dashed border-neutral-200/70 opacity-30 flex items-center justify-center text-[9px] italic text-[var(--text-tertiary)]">System automation log</div>

                      {/* Locked Evidence Node */}
                      <div className="p-4 bg-orange-50/70 hover:bg-orange-50 rounded-2xl border border-orange-200 transition-all flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-mono text-orange-700">TASK-OIG-SAM...</span>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border uppercase font-bold">BLOCKED</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-orange-950 leading-snug mt-2">Final Evidence Package Locked</h4>
                        <p className="text-[9px] text-orange-800 mt-1">Evidence / eSign System</p>
                      </div>

                    </div>

                  </div>
                </div>

              </div>
            )}

          </main>

          {/* RIGHT SIDEBAR (UAT CHECKPOINTS AND SUMMARY) */}
          <aside className={cx(
            "w-[320px] shrink-0 border-l border-white/20 bg-white/10 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto transition-all duration-300",
            isPersonalOpsOpen ? "w-[320px] opacity-100 animate-slideInRight" : "w-0 opacity-0 pointer-events-none"
          )}>
            <div className="space-y-6">
              
              {/* Profile Card Block */}
              <div className="bg-white/45 p-4 rounded-2xl flex items-center gap-3 border shadow-sm premium-shadow">
                <div className="h-10 w-10 rounded-full bg-[var(--teal-primary)] text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                  RP
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 justify-between">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">Robert P.</h3>
                    <span className="text-[8px] font-extrabold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2 py-0.5 rounded uppercase shrink-0">DON</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] truncate">Clinical Director</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Safe Session
                  </p>
                </div>
              </div>

              {/* GUIDED UAT CHECKS GRID */}
              <div className="bg-white/45 p-4.5 rounded-2xl border border-white/40 shadow-sm space-y-4 premium-shadow">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[var(--teal-primary)]" />
                    <span className="text-[10px] font-extrabold uppercase text-[var(--teal-primary)]">GUIDED UAT CHECKS</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] px-2 py-0.5 rounded">
                    {uatCheckpoints.filter(u => u.checked).length}/6
                  </span>
                </div>

                <div className="space-y-2.5">
                  {uatCheckpoints.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => toggleCheckpoint(c.id)}
                      className="flex items-center gap-3 cursor-pointer p-1 hover:bg-white/40 rounded transition-colors"
                    >
                      <button className={cx(
                        "h-4 w-4 rounded flex items-center justify-center border transition-all shrink-0",
                        c.checked ? "bg-[var(--teal-primary)] text-white border-[var(--teal-primary)]" : "bg-white/250 border-neutral-300"
                      )}>
                        {c.checked && <Check size={11} />}
                      </button>
                      <span className={cx(
                        "text-[11px] font-medium leading-none select-none",
                        c.checked ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"
                      )}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status statistics panel */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider block px-1">Compliance Status Summary</span>
                <div className="space-y-1.5">
                  <div className="p-3 bg-white/25 rounded-xl border flex justify-between items-center premium-shadow">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">Overdue Tasks</span>
                    <span className="text-xs font-mono font-bold text-red-600">3</span>
                  </div>
                  <div className="p-3 bg-white/25 rounded-xl border flex justify-between items-center premium-shadow">
                    <span className="text-xs font-medium text-[var(--text-secondary)]">SLA At Risk</span>
                    <span className="text-xs font-mono font-bold text-amber-600">2</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Security Context Info */}
            <div className="pt-4 border-t border-white/20 space-y-1.5 text-[9px] text-[var(--text-tertiary)] leading-tight">
              <div className="flex items-center gap-1.5 text-[var(--teal-primary)] font-bold">
                <Lock size={12} /> Secure audit sandbox verified.
              </div>
              <p>Biometric signature loops are locked inside active state-machine instances.</p>
            </div>
          </aside>

        </div>

      </div>

      {/* SYSTEM TOAST DISPLAY GRID */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div key={toast.id} className="rounded-xl bg-white/90 backdrop-blur-xl p-4 shadow-xl text-xs font-semibold border border-white/60 flex items-center gap-3 min-w-[300px] pointer-events-auto animate-fadeIn">
            <div className={cx("h-2 w-2 rounded-full", toast.type === 'success' ? 'bg-emerald-500' : 'bg-[var(--teal-primary)]')} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}