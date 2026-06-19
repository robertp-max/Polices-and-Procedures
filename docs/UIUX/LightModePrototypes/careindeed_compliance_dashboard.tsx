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
  Trash2
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
      className={cx('card-spotlight premium-glass-transition backdrop-blur-[33px] relative', className)}
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
            ? "nav-btn-active-glow text-[var(--teal-primary)] border-[var(--teal-primary)]/40 bg-white/250" 
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
  const [activeTab, setActiveTab] = useState('audit_mode'); // audit_mode, evidence, my_tasks, sprint_planner, sprint_review, approvals, dashboard_reports
  const [notifications, setNotifications] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(false);

  // Global Guided UAT state shared across views
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
    addToast('UAT checklist milestone updated', 'success');
  };

  const completedUatCount = uatCheckpoints.filter(c => c.completed).length;

  // ----------------------------------------------------
  // STATE MODULE FOR "08_audit.png" (Audit Mode)
  // ----------------------------------------------------
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [sealedItems, setSealedItems] = useState(new Set()); // Tracks e-signed items
  const [inspectTab, setInspectTab] = useState('SUMMARY'); // SUMMARY, MISSING ITEMS, EVIDENCE, APPROVALS, TIMELINE
  
  const [selectedAuditItem, setSelectedAuditItem] = useState({
    id: 'governance_packet_review-20260108-01',
    title: 'Annual Governance Packet Review',
    domain: 'GOVERNANCE',
    dueState: 'Due 159d past',
    citation: '42 CFR §484.105(b) - Governing Body Condition of Participation',
    owner: 'Administrator (Administrator)',
    checksPassed: '1 of 8 validation checks passed',
    status: 'NOT CERTIFIABLE',
    severity: 'OVERDUE',
    timestamp: 'Jan 8',
    evidence: ['RCA Summary', 'Incident Register Log']
  });

  const [auditInstances, setAuditInstances] = useState([
    { id: 'governance_packet_review-20260108-01', title: 'Annual Governance Packet Review', domain: 'GOVERNANCE', dueState: 'Due 159d past', citation: '42 CFR §484.105(b) - Governing Body Condition of Participation', owner: 'Administrator (Administrator)', checksPassed: '1 of 8 validation checks passed', status: 'NOT CERTIFIABLE', severity: 'OVERDUE', timestamp: 'Jan 8', evidence: ['RCA Summary', 'Incident Register Log'] },
    { id: 'qapi_meeting-20260205-04', title: 'Quarterly QAPI Governance Review & Annual Report', domain: 'QAPI', dueState: 'Due 131d past', citation: '42 CFR §484.65 - Quality Assessment Condition of Participation', owner: 'QAPI Coordinator', checksPassed: '3 of 8 checks', status: 'MISSING EVIDENCE', severity: 'OVERDUE', timestamp: 'Feb 5', evidence: ['PIP milestone spreadsheet'] },
    { id: 'infection_control_review-quarterly-20260325-01', title: 'Q1 Infection Control Review & Hygiene Cert', domain: 'CLINICAL', dueState: 'Due 83d past', citation: '42 CFR §484.70 - Infection Control Condition of Participation', owner: 'Director of Nursing', checksPassed: '6 of 8 checks', status: 'PENDING APPROVAL', severity: 'OVERDUE', timestamp: 'Mar 25', evidence: ['Sanitization log v2'] },
    { id: 'clinical_record_review-20260412-02', title: 'Standard Clinical Record & OASIS Consistency Check', domain: 'CLINICAL', dueState: 'Due tomorrow', citation: '42 CFR §484.110 - Clinical Records Condition of Participation', owner: 'Clinical Manager', checksPassed: '8 of 8 checks', status: 'AUDIT READY', severity: 'UPCOMING', timestamp: 'Apr 12', evidence: ['OASIS Data sheet'] }
  ]);

  // ----------------------------------------------------
  // STATE MODULE FOR "09_evidence.png" (Evidence Explorer)
  // ----------------------------------------------------
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState('All');

  const [evidenceCheckboxes, setEvidenceCheckboxes] = useState({
    missingOnly: false,
    lockedOnly: false,
    pendingSig: false,
    blockedOnly: false,
    orphanOnly: false
  });

  const [evidenceFolders, setEvidenceFolders] = useState([
    { name: 'January', auditCount: '0/256', percent: 0 },
    { name: 'February', auditCount: '0/250', percent: 0 },
    { name: 'March', auditCount: '0/326', percent: 0 },
    { name: 'April', auditCount: '0/240', percent: 0 },
    { name: 'May', auditCount: '15/190', percent: 7 },
    { name: 'June', auditCount: '185/310', percent: 59 },
    { name: 'July', auditCount: '0/150', percent: 0 }
  ]);

  // ----------------------------------------------------
  // STATE MODULE FOR "10_pm_my_tasks.png" (My Tasks)
  // ----------------------------------------------------
  const [taskSearchText, setTaskSearchText] = useState('');
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [myTasksList, setMyTasksList] = useState([
    { id: 'T-2026-101', title: 'Compile Medicare CoP documentation review packet', priority: 'High', status: 'todo', due: 'Today', storyPoints: 5, category: 'Compliance' },
    { id: 'T-2026-102', title: 'Verify credentials and licenses for Q2 clinician hires', priority: 'Medium', status: 'in progress', due: 'In 2 days', storyPoints: 3, category: 'Clinician Profiles' },
    { id: 'T-2026-103', title: 'Perform Title 22 clinical audit of active plan-of-care files', priority: 'Critical', status: 'in review', due: 'Overdue by 3 days', storyPoints: 8, category: 'Clinical Operations' },
    { id: 'T-2026-104', title: 'Configure secure hardware-token login paths for home-visit nurses', priority: 'High', status: 'blocked', due: 'In 5 days', storyPoints: 5, category: 'Information Security' },
    { id: 'T-2026-105', title: 'Draft minutes and log votes for Q1 advisory panel', priority: 'Low', status: 'done', due: 'Completed yesterday', storyPoints: 2, category: 'Governance' },
  ]);

  const cycleLocalTaskStatus = (id) => {
    setMyTasksList(prev => prev.map(t => {
      if (t.id === id) {
        const statuses = ['todo', 'in progress', 'in review', 'blocked', 'done'];
        const nextIdx = (statuses.indexOf(t.status) + 1) % statuses.length;
        addToast(`Updated task state to: ${statuses[nextIdx].toUpperCase()}`, 'success');
        return { ...t, status: statuses[nextIdx] };
      }
      return t;
    }));
  };

  // ----------------------------------------------------
  // STATE MODULE FOR "11_pm_sprint_plan.png" (Sprint Planner)
  // ----------------------------------------------------
  const [plannerCapacity, setPlannerCapacity] = useState(20);
  const [proposals, setProposals] = useState([]);

  const runCapacityAllocator = () => {
    addToast('Computing optimal task allocator algorithm...', 'info');
    setTimeout(() => {
      setProposals([
        { id: 'P-01', title: 'Conduct quarterly mock emergency drill assessment', storyPoints: 5, category: 'Compliance', assignedTo: 'Robert Patel' },
        { id: 'P-02', title: 'Approve clinician competency framework update v3', storyPoints: 3, category: 'Training Logs', assignedTo: 'Robert Patel' },
        { id: 'P-03', title: 'OASIS Transmission Integrity Lock-off Ledger Audit', storyPoints: 8, category: 'Information Security', assignedTo: 'Robert Patel' },
        { id: 'P-04', title: 'Compile Medicare CoP documentation review packet', storyPoints: 4, category: 'Clinical Operations', assignedTo: 'Robert Patel' }
      ]);
      addToast('Calculated 4 optimized allocations within 20 Story Points.', 'success');
    }, 600);
  };

  const commitAcceptedProposals = () => {
    if (proposals.length === 0) {
      addToast('No allocations calculated yet. Click Run Allocator.', 'error');
      return;
    }
    addToast('Successfully committed allocation stack to active sprint!', 'success');
    setProposals([]);
  };

  // ----------------------------------------------------
  // STATE MODULE FOR "12_pm_sprint_review.png" (Sprint Review)
  // ----------------------------------------------------
  const [retroSummary, setRetroSummary] = useState({
    committed: 214,
    delivered: 0,
    inFlight: 214,
    blocked: 0
  });

  const [carryOverCandidates, setCarryOverCandidates] = useState([
    { key: 'plan_of_care_audit-202606', name: 'Plan of Care Audit Q2 Checklist', gate: 'Approval Gate', points: 8, status: 'In Review' },
    { key: 'oasis_accuracy_audit-202606', name: 'OASIS Accuracy & Consistency Validation', gate: 'Approval Gate', points: 5, status: 'In Review' },
    { key: 'visit_documentation_audit-202606', name: 'Field Visit Clinician Documentation Check', gate: 'Approval Gate', points: 3, status: 'Todo' },
    { id: 'p2', key: 'clinical_record_completion-202606', name: 'Clinical Record Handover Completion Logs', gate: 'Approval Gate', points: 5, status: 'Blocked' },
    { key: 'medical_necessity_audit-202606', name: 'Medical Necessity Narrative Cross-Examination', gate: 'Approval Gate', points: 8, status: 'Todo' },
    { key: 'medication_management_audit-202606', name: 'High-Alert Medications Administration logs', gate: 'Approval Gate', points: 5, status: 'Todo' }
  ]);

  const resolveCarryOverCandidate = (key, points) => {
    setCarryOverCandidates(prev => prev.filter(c => c.key !== key));
    setRetroSummary(prev => ({
      ...prev,
      delivered: prev.delivered + points,
      inFlight: Math.max(0, prev.inFlight - points)
    }));
    addToast(`Approved carry-over validation checklist for ${key}`, 'success');
  };

  // ----------------------------------------------------
  // STATE MODULE FOR "13_pm_approvals.png" (Approvals Queue)
  // ----------------------------------------------------
  const [approvalsFilter, setApprovalsFilter] = useState('All');
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 'APP-101', title: 'Annual Governing Body Policy Cert - EN-FM-001', submittedBy: 'D. Alvarez', date: 'June 15, 2026', type: 'Attestation' },
    { id: 'APP-102', title: 'CMS Conditions of Participation Q2 Compliance Pack', submittedBy: 'Clinical Advisor', date: 'June 14, 2026', type: 'Compliance Bundle' },
    { id: 'APP-103', title: 'OASIS Transmission Integrity Lock-off Ledger', submittedBy: 'S. Ahmed', date: 'June 12, 2026', type: 'Data Register' },
  ]);

  const handleApproveTransaction = (id, title) => {
    setPendingApprovals(prev => prev.filter(app => app.id !== id));
    addToast(`Transaction ${id} certified & locked!`, 'success');
  };

  // ----------------------------------------------------
  // UTILITIES & HELPER LOGIC
  // ----------------------------------------------------
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
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Visual Design Core Tokens & Animations */}
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
          50% { transform: scale(1.04) translate(1%, -1%); }
          100% { transform: scale(1.08) translate(-1%, 2%); }
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
          background: rgba(255, 255, 255, 0.45);
          border-color: rgba(0, 121, 125, 0.25);
          box-shadow: 
            2px 8px 18px rgba(0, 121, 125, 0.06), 
            inset 0 1.5px 3px rgba(255, 255, 255, 1);
        }
        .nav-btn-active-glow {
          transform: rotateY(-6deg) rotateX(6deg) translateZ(6px);
          background: rgba(0, 121, 125, 0.06) !important;
          border-color: rgba(0, 121, 125, 0.4) !important;
          box-shadow: 
            0 0 16px rgba(0, 121, 125, 0.2), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.65),
            inset -1px -2px 3px rgba(0, 121, 125, 0.04) !important;
        }

        .premium-shadow {
          box-shadow: 
            0 12px 32px -8px rgba(0, 0, 0, 0.05),
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

        .border-none-structure {
          border: none !important;
          border-width: 0px !important;
        }

        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
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
          <div className="flex-1 space-y-7 overflow-y-auto px-4 py-2 select-none">
            
            {/* AUDIT & COMPLIANCE PIPELINES SEGMENT */}
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Pipelines
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={Shield} 
                  label="Audit Mode" 
                  active={activeTab === 'audit_mode'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('audit_mode'); addToast('Switched to Audit & Survey segment', 'info'); }} 
                />
                
                <InteractiveNavButton 
                  icon={FolderOpen} 
                  label="Evidence Explorer" 
                  active={activeTab === 'evidence'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('evidence'); addToast('Switched to Evidence Explorer folders', 'info'); }} 
                />
              </div>
            </div>

            {/* SPRINT PLANNING & REGISTRIES */}
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--orange-primary)]">
                  Sprint Execution
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={CheckSquare} 
                  label="My Tasks" 
                  active={activeTab === 'my_tasks'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('my_tasks'); addToast('Switched to My Tasks Backlog', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={Sliders} 
                  label="Sprint Planner" 
                  active={activeTab === 'sprint_planner'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('sprint_planner'); addToast('Switched to Capacity Planner', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={Layers} 
                  label="Sprint Review" 
                  active={activeTab === 'sprint_review'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('sprint_review'); addToast('Switched to Retrospective Session', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={UserCheck} 
                  label="Approvals Queue" 
                  active={activeTab === 'approvals'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('approvals'); addToast('Switched to pending approvals list', 'info'); }} 
                />

                <InteractiveNavButton 
                  icon={BarChart2} 
                  label="Sprint Dashboard" 
                  active={activeTab === 'dashboard_reports'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('dashboard_reports'); addToast('Switched to Performance Metrics Dashboard', 'info'); }} 
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
          
          {/* =================================-------------------
              VIEW 1: AUDIT MODE ("08_audit.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'audit_mode' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    Audit & Review Segment
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Compliance validation and survey readiness
                  </h1>
                </div>

                {/* Sub Action buttons matching mockup header */}
                <div className="flex gap-2">
                  <button onClick={() => addToast('Opening Audit Trail history logs...', 'info')} className="px-3.5 py-2 bg-white/40 border border-white hover:bg-white/60 transition-colors text-xs font-bold rounded-lg text-[var(--text-primary)] flex items-center gap-2">
                    <Activity size={13} className="text-[var(--teal-primary)]" /> Audit trail
                  </button>
                  <button onClick={() => addToast('E-signature chain of custody confirmed valid.', 'success')} className="px-3.5 py-2 bg-white/40 border border-white hover:bg-white/60 transition-colors text-xs font-bold rounded-lg text-[var(--text-primary)] flex items-center gap-2">
                    <ShieldCheck size={13} className="text-emerald-600" /> Verify chain
                  </button>
                  <button onClick={() => addToast('Downloading generated survey readiness packet...', 'success')} className="px-3.5 py-2 bg-white/40 border border-white hover:bg-white/60 transition-colors text-xs font-bold rounded-lg text-[var(--text-primary)] flex items-center gap-2">
                    <FileText size={13} className="text-[var(--orange-primary)]" /> Survey packet
                  </button>
                </div>
              </div>

              {/* Sub Search filters bar mapping layout */}
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/50 premium-shadow">
                <div className="flex flex-wrap gap-2 flex-1">
                  <div className="relative w-full md:w-64">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search ID, title, owner..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full bg-white/60 border border-white pl-9 pr-3 py-1.5 text-xs rounded-lg text-[var(--text-primary)] outline-none"
                    />
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/60 border border-white text-xs font-bold rounded-lg">
                    <Filter size={12} /> FILTERS
                  </button>

                  <button onClick={() => addToast('Aggregating survey compliance tags...', 'info')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/20 border border-[var(--teal-primary)]/20 text-xs font-bold rounded-lg">
                    <TrendingUp size={12} /> SURVEY ROLLUP
                  </button>

                  <button onClick={() => addToast('Compressing overall active compliance assets payload...', 'success')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/60 border border-white text-xs font-bold rounded-lg">
                    <Briefcase size={12} /> BUNDLE
                  </button>

                  <button onClick={() => addToast('Generated JSON schema copied to clipboard.', 'info')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 hover:bg-white/60 border border-white text-xs font-bold rounded-lg">
                    <QrCode size={12} /> JSON
                  </button>
                </div>

                {/* Sub status categories tabs row */}
                <div className="flex flex-wrap gap-1 bg-white/30 p-1 rounded-xl border border-white/40">
                  {['ALL', 'JULY READINESS', 'NOT CERTIFIABLE', 'MISSING EVIDENCE', 'PENDING APPROVAL', 'OVERDUE (141)', 'READY TO CERTIFY', 'CERTIFIED'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => { setAuditFilter(tab); addToast(`Selected Segment Category: ${tab}`, 'info'); }}
                      className={cx(
                        "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all whitespace-nowrap",
                        auditFilter === tab ? "bg-[var(--teal-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white/30"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprint Banner Status Row alerts matches */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/40 backdrop-blur-md border-l-4 border-[var(--orange-primary)] rounded-r-xl border border-white/50 gap-2 text-xs">
                <div className="flex flex-wrap gap-x-6 gap-y-1 font-semibold text-[var(--text-secondary)]">
                  <span className="text-[var(--orange-primary)] font-bold tracking-wider uppercase">Sprint Sprint 12 • CES Audit</span>
                  <span>Not Ready: <strong className="text-[var(--text-primary)]">1041</strong></span>
                  <span>Partial: <strong className="text-[var(--text-primary)]">0</strong></span>
                  <span>Ready: <strong className="text-[var(--text-primary)]">0</strong></span>
                  <span>Certified: <strong className="text-[var(--text-primary)]">0</strong></span>
                  <span>Critical Units: <strong className="text-[var(--orange-primary)]">0</strong></span>
                </div>
                <button 
                  onClick={() => { setActiveTab('sprint_review'); }}
                  className="text-xs font-bold text-[var(--teal-primary)] hover:underline whitespace-nowrap"
                >
                  Open Sprint View &rarr;
                </button>
              </div>

              {/* Status Ribbon Grid blocks */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                  { label: 'AUDIT READY', count: '0', sub: '0 instances', border: 'border-emerald-500/30 text-emerald-700 bg-emerald-50/20' },
                  { label: 'READY TO CERTIFY', count: '0', sub: 'Awaiting sign-off', border: 'border-amber-500/30 text-amber-700 bg-amber-50/20' },
                  { label: 'NOT CERTIFIABLE', count: '0', sub: 'Requires review', border: 'border-rose-500/30 text-rose-700 bg-rose-50/20' },
                  { label: 'MISSING EVIDENCE', count: '0', sub: 'Evidence gaps', border: 'border-amber-500/30 text-amber-700 bg-amber-50/20' },
                  { label: 'PENDING APPROVAL', count: '0', sub: 'Awaiting approver', border: 'border-blue-500/30 text-blue-700 bg-blue-50/20' },
                  { label: 'CERTIFIED & LOCKED', count: '0', sub: 'Final audit state', border: 'border-purple-500/30 text-purple-700 bg-purple-50/20' },
                ].map((ribbon, idx) => (
                  <div key={idx} className={cx("p-4 rounded-xl border flex flex-col justify-between h-24 premium-shadow", ribbon.border)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{ribbon.label}</span>
                    <div>
                      <div className="text-2xl font-extrabold text-[var(--text-primary)]">{ribbon.count}</div>
                      <span className="text-[9px] text-[var(--text-secondary)]">{ribbon.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Split double-columns lists with detail preview panels - Matching layout of image_d0dee7.jpg */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Side: Needs Immediate Review lists */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--orange-primary)] flex items-center gap-2">
                      <AlertTriangle size={14} className="animate-bounce" />
                      NEEDS IMMEDIATE REVIEW
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--orange-primary)]/15 text-[var(--orange-primary)] text-xs font-black">141</span>
                  </div>

                  <div className="space-y-3 pr-2">
                    {auditInstances
                      .filter(inst => {
                        const matchesSearch = inst.title.toLowerCase().includes(auditSearchQuery.toLowerCase()) || inst.id.toLowerCase().includes(auditSearchQuery.toLowerCase());
                        return matchesSearch;
                      })
                      .map((item, idx) => {
                        const isSealed = sealedItems.has(item.id);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedAuditItem(item);
                              addToast(`Inspecting: ${item.id}`, 'info');
                            }}
                            className={cx(
                              "relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border bg-white/45 backdrop-blur-md premium-shadow flex flex-col gap-2.5 mr-4",
                              selectedAuditItem.id === item.id 
                                ? "border-[var(--teal-primary)] bg-white/80 shadow-md translate-x-1" 
                                : "border-white/50 hover:border-[var(--teal-primary)]/30 hover:bg-white/60"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-[9px] font-bold bg-neutral-200/60 text-zinc-700 px-2 py-0.5 rounded tracking-wide uppercase">
                                {item.domain}
                              </span>
                              <span className="text-[10px] font-semibold text-[var(--orange-primary)]">{item.dueState}</span>
                            </div>
                            
                            <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                              {item.title}
                            </h4>
                            
                            <p className="text-[10.5px] font-mono text-[var(--text-tertiary)] truncate">
                              {item.id} &bull; {item.owner.split(' ')[0]}
                            </p>

                            {/* Sticky absolute badge exactly matching photo reference layout */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[45%] select-none z-20">
                              <span className={cx(
                                "text-[9px] font-black tracking-wider px-2 py-0.5 rounded border shadow-sm uppercase",
                                item.severity === 'OVERDUE' 
                                  ? "bg-rose-100 text-rose-700 border-rose-300" 
                                  : "bg-amber-100 text-amber-700 border-amber-300"
                              )}>
                                {item.severity}
                              </span>
                            </div>
                          </div>
                        );
                    })}
                  </div>
                </div>

                {/* Right Side: Active Inspector details panel (Annual Governance Packet Review) - Perfectly polished per image_d0dee7.jpg */}
                <div className="lg:col-span-7 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-3xl p-7 space-y-6 premium-shadow">
                  
                  {/* Metadata Tag Row */}
                  <div className="flex justify-between items-start border-none-structure">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2 py-0.5 rounded">
                        {selectedAuditItem.domain}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">
                        {selectedAuditItem.severity}
                      </span>
                    </div>
                    <button 
                      onClick={() => addToast('Opening governance timeline audit pass...', 'info')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800 tracking-widest font-mono flex items-center gap-1 uppercase"
                    >
                      TIMELINE &rarr;
                    </button>
                  </div>

                  {/* Title and ID Info */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-950 font-heading leading-tight">
                      {selectedAuditItem.title}
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                      {selectedAuditItem.id} &bull; {selectedAuditItem.owner}
                    </p>
                    <p className="text-xs font-bold text-[var(--orange-primary)] mt-2">
                      {selectedAuditItem.citation}
                    </p>
                  </div>

                  {/* Horizontal Tab Bar System */}
                  <div className="flex border-b border-zinc-200 text-xs font-black text-zinc-400 select-none tracking-widest pt-2">
                    {['SUMMARY', 'MISSING ITEMS', 'EVIDENCE', 'APPROVALS', 'TIMELINE'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => { setInspectTab(t); addToast(`Selected Inspector Focus: ${t}`); }}
                        className={cx(
                          "flex-1 pb-3 text-center transition-all border-b-2 border-transparent hover:text-zinc-800",
                          inspectTab === t ? "text-[var(--teal-primary)] border-[var(--teal-primary)] font-extrabold" : ""
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Inspector Panel Body Content */}
                  <div className="space-y-6 min-h-[160px] animate-fadeIn">
                    {inspectTab === 'SUMMARY' && (
                      <div className="space-y-6">
                        
                        {/* Status Report Callout precisely matches image_d0dee7.jpg */}
                        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-800 text-xs space-y-1.5 leading-relaxed">
                          <div className="font-extrabold uppercase tracking-widest text-[9.5px] text-rose-700">
                            STATUS REPORT: NOT CERTIFIABLE
                          </div>
                          <p className="font-medium">
                            {selectedAuditItem.checksPassed} &mdash; Remediation is currently locked. Additional signed evidence sheets are required.
                          </p>
                        </div>

                        {/* Assigned Evidence Segment header matches exactly */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                            ASSIGNED EVIDENCE DOCUMENTS
                          </h4>
                          <div className="flex flex-wrap gap-2.5">
                            {selectedAuditItem.evidence ? selectedAuditItem.evidence.map((ev, i) => (
                              <button 
                                key={i} 
                                onClick={() => addToast(`Opening credential preview: ${ev}`)}
                                className="px-3.5 py-1.5 bg-white border border-zinc-200/80 hover:bg-neutral-50 transition-colors text-xs font-bold rounded-lg text-zinc-700 shadow-sm"
                              >
                                {ev}
                              </button>
                            )) : <span className="text-xs text-zinc-400 italic">No evidence packages.</span>}
                          </div>
                        </div>

                      </div>
                    )}

                    {inspectTab === 'MISSING ITEMS' && (
                      <div className="p-5 bg-amber-50/80 border border-amber-200/60 text-amber-900 text-xs rounded-2xl space-y-3">
                        <div className="font-extrabold uppercase tracking-wider text-[10px]">Verification checklist gaps:</div>
                        <ul className="list-disc pl-5 space-y-1.5 font-medium leading-relaxed">
                          <li>Cryptographic compliance signature block v2 has not been sealed</li>
                          <li>Administrative Universal Policy Acknowledgment Form missing supervisor audit</li>
                        </ul>
                      </div>
                    )}

                    {inspectTab === 'EVIDENCE' && (
                      <div className="space-y-3 text-xs">
                        <h4 className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Active evidence payload validation logs:</h4>
                        <div className="p-4 bg-white/75 text-[var(--text-secondary)] rounded-xl font-mono text-[10.5px] leading-relaxed">
                          SYSTEM LOG STACK -- HASH CODES OK.<br />
                          Attestation sealed under: /Administrator/<br />
                          Ready for CA state surveyors audit window.
                        </div>
                      </div>
                    )}

                    {inspectTab === 'APPROVALS' && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-900 text-xs rounded-xl font-medium leading-relaxed">
                        <strong>Sealed Authority:</strong> Authorized Managers can seal and authorize this audit segment directly below using the signature tools.
                      </div>
                    )}

                    {inspectTab === 'TIMELINE' && (
                      <div className="space-y-2 text-xs font-mono text-zinc-500">
                        <div className="flex justify-between border-b pb-1">
                          <span>Jan 08, 2026</span>
                          <span>Initialized in Backlog</span>
                        </div>
                        <div className="flex justify-between">
                          <span>June 15, 2026</span>
                          <span>Remediation pass requested</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary & Secondary Action button elements polished per image_d0dee7.jpg */}
                  <div className="pt-6 border-t border-zinc-200/80 flex justify-end gap-3 select-none">
                    <button 
                      onClick={() => {
                        setSealedItems(prev => {
                          const copy = new Set(prev);
                          copy.add(selectedAuditItem.id);
                          return copy;
                        });
                        addToast(`Audit instance ${selectedAuditItem.id} certified & sealed!`, 'success');
                      }}
                      className="px-5 py-2.5 bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                      Authorize & Seal
                    </button>
                    <button 
                      onClick={() => {
                        setSealedItems(prev => {
                          const copy = new Set(prev);
                          copy.delete(selectedAuditItem.id);
                          return copy;
                        });
                        addToast(`Unsealed audit instance: ${selectedAuditItem.id}`, 'info');
                      }}
                      className="px-5 py-2.5 bg-white border border-zinc-200 hover:bg-neutral-50 text-zinc-700 font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-[0.98]"
                    >
                      Unseal / Reset
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* =================================-------------------
              VIEW 2: EVIDENCE EXPLORER ("09_evidence.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'evidence' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-bold text-[var(--teal-primary)] uppercase tracking-widest bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    Storage Registers
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5 flex items-center gap-2">
                    <FolderOpen /> Evidence Folder Explorer
                  </h1>
                </div>
                <button 
                  onClick={() => {
                    setEvidenceFolders(prev => prev.map(f => ({ ...f, percent: 0 })));
                    addToast('All local directory state metrics have been reset.', 'info');
                  }}
                  className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-700 rounded-lg transition-all whitespace-nowrap"
                >
                  Clear All Evidence
                </button>
              </div>

              <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed">
                Read-only folder view for Year &rarr; Quarter &rarr; Month &rarr; Event &rarr; Task evidence. Upload stays inside CES task drawers where the event, task, form, and requirement context is known.
              </p>

              <div className="flex gap-2 text-xs font-bold select-none">
                <button className="px-3 py-1.5 bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/20 rounded-lg">Folder tree</button>
                <button onClick={() => addToast('Displaying spreadsheet view logs...')} className="px-3 py-1.5 bg-white/40 hover:bg-white/60 border border-white/50 rounded-lg text-[var(--text-secondary)]">
                  File ledger
                </button>
              </div>

              {/* Banner Alert matching mockup */}
              <div className="p-3.5 bg-[var(--teal-primary)]/5 border border-[var(--teal-primary)]/15 text-[var(--teal-primary)] text-xs flex items-center gap-2 rounded-xl">
                <Info size={14} className="shrink-0" />
                <span>DEMO_LOCAL: Evidence metadata is stored locally for this demo environment.</span>
              </div>

              {/* Directory Filtering Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Filtering settings */}
                <div className="lg:col-span-4 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl p-5 space-y-4 premium-shadow">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Evidence Directory Setup</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block">YEAR</label>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full bg-white/60 border border-white px-3 py-2 rounded-lg text-[var(--text-primary)] outline-none cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block">MONTH</label>
                      <select 
                        value={selectedMonth}
                        onChange={(e) => { setSelectedMonth(e.target.value); addToast(`Selected month focus: ${e.target.value}`); }}
                        className="w-full bg-white/60 border border-white px-3 py-2 rounded-lg text-[var(--text-primary)] outline-none cursor-pointer"
                      >
                        <option value="All">All Months</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] block">TASK STATUS</label>
                      <select 
                        value={selectedTaskStatus}
                        onChange={(e) => setSelectedTaskStatus(e.target.value)}
                        className="w-full bg-white/60 border border-white px-3 py-2 rounded-lg text-[var(--text-primary)] outline-none cursor-pointer"
                      >
                        <option value="All">All Tasks</option>
                        <option value="completed">Completed only</option>
                        <option value="overdue">Overdue only</option>
                      </select>
                    </div>
                  </div>

                  {/* Directory filtering checkboxes */}
                  <div className="space-y-2 pt-2 border-t border-white/30 text-xs">
                    {Object.keys(evidenceCheckboxes).map((key) => (
                      <label key={key} className="flex items-center gap-2.5 cursor-pointer text-[var(--text-secondary)] select-none">
                        <input 
                          type="checkbox"
                          checked={evidenceCheckboxes[key]}
                          onChange={() => setEvidenceCheckboxes(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="rounded border-gray-300 text-[var(--teal-primary)] focus:ring-[var(--teal-primary)] h-4 w-4 cursor-pointer"
                        />
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} only</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Right grid files months mapping area */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Overview counters widgets */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/30 border border-white rounded-xl text-xs premium-shadow">
                    <div className="flex flex-wrap gap-4 text-[var(--text-secondary)] font-semibold font-mono">
                      <span>244 <strong className="text-[var(--text-primary)]">EVENTS</strong></span>
                      <span>5114 <strong className="text-[var(--text-primary)]">TASKS</strong></span>
                      <span>10716 <strong className="text-[var(--text-primary)]">REQS</strong></span>
                    </div>

                    <div className="flex gap-4 text-[var(--text-secondary)]">
                      <span>Completion: <strong className="text-[var(--teal-primary)]">12%</strong></span>
                      <span>Audit Ready: <strong className="text-emerald-700">9%</strong></span>
                    </div>
                  </div>

                  {/* Monthly cards grid list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {evidenceFolders
                      .filter(folder => selectedMonth === 'All' || folder.name === selectedMonth)
                      .map((m, idx) => (
                        <SpotlightCard
                          key={idx}
                          onClick={() => {
                            setSelectedMonth(m.name);
                            addToast(`Viewing folder contents: ${m.name}`);
                          }}
                          className="p-5 flex flex-col justify-between items-center text-center h-40 border border-white cursor-pointer premium-shadow"
                        >
                          <div className="relative h-14 w-14 rounded-full border border-white/60 flex items-center justify-center bg-white/250 text-[var(--teal-primary)] font-mono font-bold text-xs">
                            {m.percent}%
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-[var(--text-primary)] leading-tight">{m.name}</h4>
                            <p className="text-[10px] text-[var(--text-tertiary)] font-mono">audited: {m.auditCount}</p>
                          </div>
                        </SpotlightCard>
                    ))}
                  </div>

                  {/* Contextual guidance help block sidebar matching mock */}
                  <div className="p-4 bg-white/20 border border-white rounded-xl space-y-1.5 text-xs">
                    <h4 className="font-bold text-[var(--text-primary)]">Contextual Guidance Help</h4>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      Month selected: <strong className="text-[var(--text-primary)]">{selectedMonth}</strong>. Track outstanding compliance indices and signatures directly before the upcoming CA state review windows.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =================================-------------------
              VIEW 3: MY TASKS ("10_pm_my_tasks.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'my_tasks' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-bold text-[var(--orange-primary)] uppercase tracking-widest bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded">
                    My Tasks Backlog
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Sprint Scope backlog
                  </h1>
                </div>

                <div className="flex items-center gap-2 text-xs bg-white/40 border border-white p-2 rounded-xl premium-shadow">
                  <span className="text-[var(--text-tertiary)] font-bold">SPRINT SCOPE:</span>
                  <span className="text-[var(--teal-primary)] font-mono font-bold">2026:12 — Sprint 12</span>
                  <div className="flex items-center gap-1 ml-2 border-l border-white/60 pl-2">
                    <button onClick={() => addToast('Loading prior sprint archives...', 'info')} className="px-2 py-1 bg-white/60 hover:bg-white text-[10px] font-bold rounded border shadow-sm">PREV</button>
                    <button onClick={() => addToast('Loading future sprint roadmap forecasting...', 'info')} className="px-2 py-1 bg-white/60 hover:bg-white text-[10px] font-bold rounded border shadow-sm">NEXT</button>
                    <button onClick={() => addToast('Centering workspace logs on current active sprint...', 'success')} className="px-2 py-1 bg-[var(--teal-primary)] text-white text-[10px] font-bold rounded border border-transparent shadow-sm">CURRENT</button>
                  </div>
                </div>
              </div>

              {/* Horizontal subtabs elements selector list */}
              <div className="flex flex-wrap gap-1 bg-white/20 p-1 rounded-xl border border-white/40 text-xs font-bold">
                {['ASSIGNED TO ME', 'CREATED BY ME', 'WATCHING', 'CALENDAR', 'PERSONAL TASKS', 'BLOCKED', 'OVERDUE', 'COMPLETED'].map((item) => (
                  <button
                    key={item}
                    onClick={() => addToast(`Backlog focus: ${item}`, 'info')}
                    className={cx("px-3 py-1.5 rounded-lg transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]", item === 'ASSIGNED TO ME' ? "bg-white/70 text-[var(--teal-primary)] shadow-sm" : "")}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Search bar and filters sub-level items pills */}
              <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center p-4 bg-white/30 border border-white rounded-2xl premium-shadow">
                <div className="relative w-full lg:w-72">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearchText}
                    onChange={(e) => setTaskSearchText(e.target.value)}
                    className="w-full bg-white/60 border border-white pl-9 pr-3 py-1.5 text-xs rounded-lg text-[var(--text-primary)] outline-none"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-[var(--text-tertiary)] font-bold uppercase tracking-wider text-[10px]">Status:</span>
                  {['all', 'todo', 'in progress', 'in review', 'blocked', 'done'].map((st) => (
                    <button
                      key={st}
                      onClick={() => { setTaskFilterStatus(st); addToast(`Filters list: showing status ${st.toUpperCase()}`); }}
                      className={cx(
                        "px-2.5 py-1 rounded transition-all font-semibold uppercase text-[10px]",
                        taskFilterStatus === st ? "bg-[var(--teal-primary)] text-white" : "bg-white/60 text-[var(--text-secondary)] hover:bg-white"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Backlog items rows list with Guided UAT widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Tasks List */}
                <div className="lg:col-span-8 space-y-3">
                  {myTasksList
                    .filter(t => {
                      const matchesSearch = t.title.toLowerCase().includes(taskSearchText.toLowerCase()) || t.id.toLowerCase().includes(taskSearchText.toLowerCase());
                      const matchesStatus = taskFilterStatus === 'all' || t.status === taskFilterStatus;
                      return matchesSearch && matchesStatus;
                    })
                    .map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => cycleLocalTaskStatus(task.id)}
                        className="p-4 bg-white/30 hover:bg-white/60 border border-white rounded-xl transition-all flex items-center justify-between gap-4 cursor-pointer premium-shadow"
                        title="Click to cycle task status"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded border border-[var(--teal-primary)]/20 font-bold">
                              {task.id}
                            </span>
                            <span className="text-[10px] text-[var(--text-secondary)] font-bold">{task.category}</span>
                            <span className="text-[8px] bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[400px]">
                            {task.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-xs">
                          <span className="text-[10px] text-[var(--text-tertiary)] font-bold">SP: <strong className="text-[var(--text-primary)]">{task.storyPoints}</strong></span>
                          <span className="text-[9px] text-[var(--orange-primary)] font-black uppercase">{task.due}</span>
                          <span className={cx(
                            "text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                            task.status === 'done' ? "bg-emerald-100 border-emerald-300 text-emerald-800" :
                            task.status === 'blocked' ? "bg-rose-100 border-rose-300 text-rose-800" :
                            "bg-amber-100 border-amber-300 text-amber-800"
                          )}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                  ))}

                  {myTasksList.filter(t => taskFilterStatus === 'all' || t.status === taskFilterStatus).length === 0 && (
                    <div className="p-12 text-center text-xs text-[var(--text-secondary)] bg-white/10 border border-dashed rounded-xl">
                      No active tasks found in the selected status mix criteria.
                    </div>
                  )}
                </div>

                {/* Right Guided UAT Widget panel matching screenshots */}
                <div className="lg:col-span-4 bg-white/35 backdrop-blur-[33px] border border-white/50 rounded-2xl p-5 space-y-4 h-fit premium-shadow">
                  <div className="flex justify-between items-center text-xs border-b pb-2">
                    <span className="font-bold text-[var(--text-primary)]">GUIDED UAT STEPS</span>
                    <span className="text-[var(--teal-primary)] font-mono font-bold">{completedUatCount}/6 Complete</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {uatCheckpoints.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => toggleUatCheckpoint(item.id)}
                        className="p-3 bg-white/250 hover:bg-white/80 transition-all rounded-xl border border-white flex items-center justify-between cursor-pointer select-none premium-shadow"
                      >
                        <span className={cx(item.completed ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)] font-semibold")}>{item.label}</span>
                        <div className={cx(
                          "h-4 w-4 rounded border flex items-center justify-center transition-all",
                          item.completed ? "bg-emerald-100 border-emerald-500 text-emerald-800" : "border-gray-300 text-transparent"
                        )}>
                          <Check size={10} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* =================================-------------------
              VIEW 4: SPRINT PLANNER ("11_pm_sprint_plan.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'sprint_planner' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-bold text-[var(--orange-primary)] uppercase tracking-widest bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded">
                    Capacity Allocator
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Sprint Planner
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Capacity-aware allocator for 2026-12 (2026-06-07 &rarr; 2026-06-20)
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => addToast('Opening previous sprint capacity archives...', 'info')} className="px-3 py-1.5 bg-white border text-xs font-bold text-[var(--text-secondary)] hover:bg-white/60 rounded-lg shadow-sm">&larr; Prev</button>
                  <button onClick={() => addToast('Previewing forecasted sprint points requirements.', 'info')} className="px-3 py-1.5 bg-white border text-xs font-bold text-[var(--text-secondary)] hover:bg-white/60 rounded-lg shadow-sm">Next &rarr;</button>
                </div>
              </div>

              {/* Allocator Parameters container matching mockup */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-6 space-y-4 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">PER-ASSIGNEE CAPACITY (STORY POINTS)</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[var(--text-secondary)] font-bold">me</span>
                    <input 
                      type="number"
                      value={plannerCapacity}
                      onChange={(e) => setPlannerCapacity(parseInt(e.target.value) || 0)}
                      className="w-16 bg-white border border-white px-2 py-1 text-xs text-center rounded-lg text-[var(--text-primary)] outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={runCapacityAllocator}
                      className="px-4 py-2 bg-[var(--teal-primary)] text-white hover:bg-[var(--teal-primary)]/90 font-bold text-xs rounded-lg shadow-md transition-all"
                    >
                      Run Allocator
                    </button>
                    <button 
                      onClick={commitAcceptedProposals}
                      className="px-4 py-2 bg-white border text-[var(--text-secondary)] hover:bg-white/60 font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      Commit Accepted ({proposals.length})
                    </button>
                    <button 
                      onClick={() => addToast('Outstanding story points carryover rolled over.', 'success')}
                      className="px-4 py-2 bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] border border-[var(--orange-primary)]/20 font-bold text-xs rounded-lg transition-all"
                    >
                      Roll Over from 2026-11 (214)
                    </button>
                  </div>
                </div>
              </div>

              {/* Proposals Board listing generated values */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-6 space-y-4 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">PROPOSALS ({proposals.length})</h3>
                
                {proposals.length === 0 ? (
                  <div className="p-12 text-center text-xs text-[var(--text-tertiary)] bg-white/10 border border-dashed rounded-xl">
                    Click <strong className="text-[var(--teal-primary)]">Run Allocator</strong> to compute compliance project proposals within your assigned story points capacity bounds.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proposals.map((prop) => (
                      <div key={prop.id} className="p-4 bg-white/250 rounded-xl border border-white flex items-center justify-between gap-4 text-xs premium-shadow">
                        <div className="space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded border border-[var(--teal-primary)]/10">
                            {prop.category}
                          </span>
                          <h4 className="font-bold text-[var(--text-primary)] mt-1.5">{prop.title}</h4>
                        </div>
                        <div className="flex items-center gap-6 text-[var(--text-secondary)]">
                          <span>Required SP: <strong className="text-[var(--text-primary)]">{prop.storyPoints} SP</strong></span>
                          <span>Assignee: <strong className="text-[var(--text-primary)]">{prop.assignedTo}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =================================-------------------
              VIEW 5: SPRINT REVIEW ("12_pm_sprint_review.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'sprint_review' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[9px] font-bold text-[var(--orange-primary)] uppercase tracking-widest bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded">
                    Retrospective Review
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Sprint Review Retrospective
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Retrospective for 2026-11 (2026-05-24 &rarr; 2026-06-06)
                  </p>
                </div>

                <div className="flex gap-2 text-xs">
                  <button onClick={() => addToast('Opening previous sprint retrospective archives.', 'info')} className="px-3.5 py-1.5 bg-white border font-bold text-[var(--text-secondary)] hover:bg-white/60 rounded-lg shadow-sm">&larr; Prev</button>
                  <button onClick={() => addToast('Displaying subsequent scheduled audit releases.', 'info')} className="px-3.5 py-1.5 bg-white border font-bold text-[var(--text-secondary)] hover:bg-white/60 rounded-lg shadow-sm">Next &rarr;</button>
                </div>
              </div>

              {/* Retro summary widgets ribbon matches screenshots */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'COMMITTED', count: retroSummary.committed, color: 'text-indigo-700 border-indigo-200 bg-indigo-50/20' },
                  { label: 'DELIVERED', count: retroSummary.delivered, color: 'text-emerald-700 border-emerald-200 bg-emerald-50/20' },
                  { label: 'IN FLIGHT', count: retroSummary.inFlight, color: 'text-amber-700 border-amber-200 bg-amber-50/20' },
                  { label: 'BLOCKED', count: retroSummary.blocked, color: 'text-rose-700 border-rose-200 bg-rose-50/20' }
                ].map((kpi, idx) => (
                  <div key={idx} className={cx("p-5 border rounded-xl flex flex-col justify-between h-28 premium-shadow", kpi.color)}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{kpi.label}</span>
                    <div className="text-3xl font-black text-[var(--text-primary)]">{kpi.count}</div>
                  </div>
                ))}
              </div>

              {/* Deliveries by Assignee table layout matches mockup */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-5 space-y-3 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">Per-Assignee Delivery</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/50 text-[var(--text-tertiary)] font-bold uppercase text-[9px]">
                        <th className="pb-3">ASSIGNEE</th>
                        <th className="pb-3">COMMITTED</th>
                        <th className="pb-3">DELIVERED</th>
                        <th className="pb-3">IN FLIGHT</th>
                        <th className="pb-3">BLOCKED</th>
                        <th className="pb-3">POINTS (DONE/ALL)</th>
                        <th className="pb-3 text-right">DELIVERY %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 font-semibold text-[var(--text-secondary)]">
                      <tr>
                        <td className="py-3 text-[var(--text-primary)]">Unassigned (Robert Patel / Team)</td>
                        <td className="py-3">214</td>
                        <td className="py-3 text-emerald-700">{retroSummary.delivered}</td>
                        <td className="py-3 text-amber-700">{retroSummary.inFlight}</td>
                        <td className="py-3 text-rose-700">{retroSummary.blocked}</td>
                        <td className="py-3 font-mono">{retroSummary.delivered} / 317</td>
                        <td className="py-3 text-right text-[var(--teal-primary)] font-mono">
                          {((retroSummary.delivered / 214) * 100).toFixed(0)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Candidates for carryover listing table matches mockup */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-5 space-y-3 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Carry-Over Candidates (214 Story Points)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/50 text-[var(--text-tertiary)] font-bold uppercase text-[9px]">
                        <th className="pb-3">CANDIDATE KEY</th>
                        <th className="pb-3">REGULATORY REQUIREMENT</th>
                        <th className="pb-3">GATE SEGMENT</th>
                        <th className="pb-3 text-right">SP MEASURE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20 text-[var(--text-secondary)] font-medium">
                      {carryOverCandidates.map((c, idx) => (
                        <tr key={idx} className="hover:bg-white/40 transition-colors">
                          <td className="py-3 font-mono text-[var(--teal-primary)] font-bold">{c.key}</td>
                          <td className="py-3 text-[var(--text-primary)] font-bold">
                            <button 
                              onClick={() => resolveCarryOverCandidate(c.key, c.points)}
                              className="text-left hover:underline text-[var(--teal-primary)]"
                              title="Click to resolve and add points to retro metrics"
                            >
                              {c.name}
                            </button>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-[var(--orange-primary)]/10 text-[var(--orange-primary)] text-[9px] font-bold uppercase">
                              {c.gate}
                            </span>
                          </td>
                          <td className="py-3 text-right font-mono font-bold">{c.points} SP</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =================================-------------------
              VIEW 6: APPROVALS QUEUE ("13_pm_approvals.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'approvals' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div>
                <span className="text-[9px] font-bold text-[var(--orange-primary)] uppercase tracking-widest bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded">
                  Regulatory Sign-off
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                  Approvals Queue
                </h1>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Compliance and attestation review gates for secure regional home health licensing.
                </p>
              </div>

              {/* Table approvals parameters matches mockup sidebar dropdown filters */}
              <div className="flex flex-wrap items-center gap-4 bg-white/30 border border-white p-4 rounded-xl premium-shadow">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[10px]">Document Type:</span>
                <select 
                  value={approvalsFilter}
                  onChange={(e) => setApprovalsFilter(e.target.value)}
                  className="bg-white border border-white px-3 py-1.5 text-xs rounded-lg text-[var(--text-primary)] outline-none"
                >
                  <option value="All">All pending logs</option>
                  <option value="Attestation">Attestation Forms</option>
                  <option value="Compliance Bundle">Compliance Bundles</option>
                  <option value="Data Register">Data Registers</option>
                </select>
              </div>

              {/* Transactions grid */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-6 space-y-4 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">PENDING ITEMS</h3>
                
                {pendingApprovals
                  .filter(item => approvalsFilter === 'All' || item.type === approvalsFilter)
                  .map((app) => (
                    <div key={app.id} className="p-4 bg-white/250 border border-white rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 premium-shadow">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-1.5 py-0.5 rounded border border-[var(--teal-primary)]/10 font-bold">{app.id}</span>
                          <span className="text-[10px] text-[var(--orange-primary)] font-bold uppercase tracking-wider">{app.type}</span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight mt-1">{app.title}</h4>
                        <p className="text-[10px] text-[var(--text-tertiary)] font-mono">Submitted by: {app.submittedBy} • {app.date}</p>
                      </div>

                      <div className="flex gap-2 text-xs font-bold select-none shrink-0">
                        <button 
                          onClick={() => handleApproveTransaction(app.id, app.title)}
                          className="px-4 py-2 bg-[var(--teal-primary)] text-white hover:bg-[var(--teal-primary)]/90 rounded-lg shadow-sm"
                        >
                          Approve transaction
                        </button>
                        <button 
                          onClick={() => {
                            setPendingApprovals(prev => prev.filter(a => a.id !== app.id));
                            addToast(`Rejected transaction: ${app.id}`, 'error');
                          }}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg shadow-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                ))}

                {pendingApprovals.filter(item => approvalsFilter === 'All' || item.type === approvalsFilter).length === 0 && (
                  <div className="p-12 text-center text-xs text-[var(--text-tertiary)] bg-white/10 border border-dashed rounded-xl">
                    Nothing pending transaction review. Backlog completely audited.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =================================-------------------
              VIEW 7: SPRINT DASHBOARD ("14_pm_dashboard.png" Redesign)
              ----------------------------------================= */}
          {activeTab === 'dashboard_reports' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-[var(--teal-primary)] uppercase tracking-widest bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    PM Reporting
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1.5">
                    Sprint Dashboard
                  </h1>
                </div>

                <div className="flex items-center gap-1.5 text-xs bg-white/40 border border-white p-2 rounded-xl premium-shadow font-bold">
                  <button onClick={() => addToast('Opening previous reporting period...')} className="px-2 py-1 bg-white/60 hover:bg-white rounded">&larr;</button>
                  <span className="text-[var(--teal-primary)] font-mono">2026-12</span>
                  <button onClick={() => addToast('Opening projected future reports...')} className="px-2 py-1 bg-white/60 hover:bg-white rounded">&rarr;</button>
                </div>
              </div>

              {/* Burndown interactive SVG chart container matches mockup */}
              <div className="bg-white/30 backdrop-blur-md border border-white rounded-2xl p-6 space-y-4 premium-shadow">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">BURNDOWN • 595 PTS COMMITTED</h3>
                <div className="h-56 bg-white/60 rounded-xl border border-white relative p-4 flex flex-col justify-between premium-shadow">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-30">
                    <div className="border-b border-dashed border-gray-300 h-0" />
                    <div className="border-b border-dashed border-gray-300 h-0" />
                    <div className="border-b border-dashed border-gray-300 h-0" />
                  </div>

                  <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                    {/* Ideal Burndown path */}
                    <line x1="5%" y1="15%" x2="95%" y2="85%" stroke="rgba(199, 70, 1, 0.2)" strokeWidth="1.5" strokeDasharray="5,5" />
                    {/* Actual points Burndown trajectory curve */}
                    <path d="M 50,40 C 200,45 350,90 500,120 T 950,180" fill="none" stroke="var(--teal-primary)" strokeWidth="2.5" />
                  </svg>

                  <div className="flex justify-between items-start text-[10px] text-[var(--text-tertiary)] font-mono relative z-10 font-bold">
                    <span>595 pts</span>
                    <span>Target Date: 2026-06-20</span>
                  </div>

                  <div className="flex justify-between items-end text-[10px] text-[var(--text-tertiary)] font-mono relative z-10 font-bold">
                    <span>Sprint Start</span>
                    <span>Sprint End</span>
                  </div>
                </div>
              </div>

              {/* Throughput columns metrics & Status Mix grids */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Throughput Column charts */}
                <div className="lg:col-span-7 bg-white/30 backdrop-blur-md border border-white rounded-2xl p-5 space-y-4 premium-shadow">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Throughput • Last 6 Sprints</h3>
                  <div className="h-44 flex items-end justify-around pt-6 font-mono text-[10px] text-[var(--text-tertiary)] border-b border-white/50 pb-2">
                    {[
                      { s: '07', pts: '0', h: 'h-1.5' },
                      { s: '08', pts: '0', h: 'h-1.5' },
                      { s: '09', pts: '0', h: 'h-1.5' },
                      { s: '10', pts: '0', h: 'h-1.5' },
                      { s: '11', pts: '0', h: 'h-1.5' },
                      { s: '12', pts: '0', h: 'h-1.5' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[9px] text-[var(--teal-primary)] font-bold opacity-0 group-hover:opacity-100 transition-opacity">{item.pts}</span>
                        <div className={cx("w-8 bg-[var(--teal-primary)]/20 group-hover:bg-[var(--teal-primary)] transition-all rounded-t", item.h)} />
                        <span className="font-bold">{item.s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Mix indicators list matches mockup */}
                <div className="lg:col-span-5 bg-white/30 backdrop-blur-md border border-white rounded-2xl p-5 space-y-4 premium-shadow">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Status Mix • 2026-12</h3>
                  <div className="space-y-4 pt-2 text-xs">
                    
                    {/* Horizontal stats status mix bars */}
                    <div className="h-3 w-full rounded-full bg-neutral-200 overflow-hidden flex">
                      <div className="h-full bg-slate-400" style={{ width: '92.5%' }} />
                      <div className="h-full bg-[var(--teal-primary)]" style={{ width: '2.5%' }} />
                      <div className="h-full bg-amber-500" style={{ width: '2.5%' }} />
                      <div className="h-full bg-rose-500" style={{ width: '2.5%' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'To-Do', count: '371', color: 'bg-slate-400' },
                        { label: 'In Progress', count: '0', color: 'bg-[var(--teal-primary)]' },
                        { label: 'In Review', count: '0', color: 'bg-amber-500' },
                        { label: 'Blocked', count: '0', color: 'bg-rose-500' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={cx("h-2.5 w-2.5 rounded", item.color)} />
                          <span className="text-[var(--text-secondary)] font-medium">{item.label}: <strong className="text-[var(--text-primary)]">{item.count}</strong></span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

      {/* SYSTEM TOAST NOTIFICATIONS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-white/90 backdrop-blur-xl p-4 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/50 animate-fadeIn flex items-center gap-3 min-w-[300px] pointer-events-auto"
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