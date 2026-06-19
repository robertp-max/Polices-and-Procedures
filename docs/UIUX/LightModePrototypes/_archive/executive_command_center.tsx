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
  QrCode
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

// Spotlight glow cards
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

// Interactive 3D Side Nav Buttons
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
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, forms, workflows, survey, knowledge
  const [activeView, setActiveView] = useState('agency'); // agency, planner
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); 
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(true);

  // Compliance taxonomy filters
  const [filterSeverity, setFilterSeverity] = useState('ALL'); 
  const [filterType, setFilterType] = useState('ALL');

  // Command palette state
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(0);

  // Inspector and Modal triggers
  const [inspectItem, setInspectItem] = useState(null); 
  const [inspectTab, setInspectTab] = useState('overview'); // overview, evidence, biometric
  const [sigText, setSigText] = useState(''); // Live type eSign
  const [hasAgreedCheck, setHasAgreedCheck] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedMockDoc, setSelectedMockDoc] = useState(null); // Simulated Document Viewer

  // Track sealed/authorized items to update metrics dynamically!
  const [sealedItems, setSealedItems] = useState(new Set());

  // Dynamic Planner task builder states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState('Due tomorrow');
  const [newTaskStatus, setNewTaskStatus] = useState('upcoming');
  const [newTaskCategory, setNewTaskCategory] = useState('Clinical');
  const [newTaskOwner, setNewTaskOwner] = useState('Clinical Manager');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Knowledge manual states
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [plannerTasks, setPlannerTasks] = useState([
    { id: 'p1', title: 'Conduct quarterly mock emergency drill assessment', due: 'Overdue by 1 day', status: 'overdue', category: 'Compliance', owner: 'Compliance Officer', notes: 'Requires full review of emergency muster points and clinician alert schedules.', evidence: ['E-Sign Log', 'Staff Attendance List'] },
    { id: 'p2', title: 'Approve clinician competency framework update v3', due: 'Overdue by 4 hours', status: 'overdue', category: 'Training Logs', owner: 'Director of Nursing', notes: 'Review skills verification checklists submitted by clinical supervisors.', evidence: ['v3 Outline PDF', 'Supervisor Sign-off'] },
    { id: 'p3', title: 'Sign-off on CareIndeed operations budget adjustments', due: 'Due Friday, June 19', status: 'upcoming', category: 'Governance', owner: 'CEO', notes: 'Corporate financial reconciliation following regional territory expansions.', evidence: ['Budget excel report'] },
    { id: 'p4', title: 'Meet with clinical advisors for QAPI milestone review', due: 'Due next Tuesday', status: 'upcoming', category: 'Quality Assurance', owner: 'QAPI Lead / Chair', notes: 'Address Q1 clinical exceptions ahead of CA state audit windows.', evidence: ['Milestone report v1'] },
  ]);

  const [activePipelines, setActivePipelines] = useState([
    {
      id: 'critical',
      title: 'Critical & Overdue',
      color: 'text-[var(--orange-primary)] border-[var(--orange-primary)]/20 bg-[var(--orange-primary)]/5',
      accentColor: 'var(--orange-primary)',
      badge: '3',
      cards: [
        { id: 'c1', category: 'QAPI', title: 'Incident / Adverse Event Review', role: 'CM', assignee: 'Clinical Manager', time: '129D PAST', status: 'critical', description: 'Review critical patient clinical report deviations, safety index thresholds, and remediation guidelines.', evidence: ['RCA Summary', 'Incident Register Log'] },
        { id: 'c2', category: 'COMPLIANCE', title: 'Complaint / Grievance Investigation', role: 'CO', assignee: 'Compliance Officer', time: '129D PAST', status: 'critical', description: 'Formal assessment and processing of customer and nursing staff incident logs.', evidence: ['Staff interview transcripts', 'Resolution packet'] },
        { id: 'c3', category: 'CLINICAL', title: 'Plan of Care Audit', role: 'QA', assignee: 'QA Reviewer (RN)', time: '123D PAST', status: 'critical', description: 'Mandatory clinical review cycle matching clinician logs against primary medical assessments.', evidence: ['OASIS Data sheet', 'Care plan signed cert'] },
      ]
    },
    {
      id: 'risk',
      title: 'At Risk',
      color: 'text-amber-600 border-amber-600/20 bg-amber-600/5',
      accentColor: '#D97706',
      badge: '3',
      cards: [
        { id: 'c4', category: 'GOVERNANCE', title: 'Governing Body Mtg (Prep - Owner Brief)', role: 'DA', assignee: 'D. Alvarez', time: 'TOMORROW', status: 'risk', description: 'Preparation and materials distribution ahead of executive quarterly assessment panels.', evidence: ['Operational slide deck draft'] },
        { id: 'c5', category: 'QAPI', title: 'QAPI Committee Meeting', role: 'MC', assignee: 'M. Chen', time: '2D', status: 'risk', description: 'Quarterly assembly to check regional quality benchmarks and sign compliance certificates.', evidence: ['Trend tracking worksheet v2'] },
        { id: 'c6', category: 'FINANCE', title: 'Claims Submission Cycle', role: 'RP', assignee: 'R. Patel', time: '3D', status: 'risk', description: 'Medicare review audits mapping medical logs to fiscal code claims vectors.', evidence: ['Claims list spreadsheet', 'Code matrix'] },
      ]
    },
    {
      id: 'progress',
      title: 'In Progress',
      color: 'text-[var(--teal-primary)] border-[var(--teal-primary)]/20 bg-[var(--teal-primary)]/5',
      accentColor: 'var(--teal-primary)',
      badge: '3',
      cards: [
        { id: 'c7', category: 'COMPLIANCE', title: 'Compliance Report (Weekly Snapshot)', role: 'LW', assignee: 'L. Washington', time: 'TOMORROW', status: 'progress', description: 'Detailed visual breakdown of outstanding clinical and business team attestation metrics.', evidence: ['Survey checklist validation'] },
        { id: 'c8', category: 'CLINICAL', title: '30-Day Episode Review', role: 'SA', assignee: 'S. Ahmed', time: '8D', status: 'progress', description: 'Interim patient performance tracking mapping clinical benchmarks against recovery goals.', evidence: ['Clinical progression workbook'] },
        { id: 'c9', category: 'CLINICAL', title: 'Infection Control Review', role: 'SA', assignee: 'S. Ahmed', time: '9D', status: 'progress', description: 'Standard sanitization control audits within clinician home care assignments.', evidence: ['Field visit logs', 'PPE supply verification'] },
      ]
    }
  ]);

  const [formsData, setFormsData] = useState([
    { id: 'EN-FM-001', title: 'Universal Policy Acknowledgment Form', type: 'Attestation', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Requires signed baseline certification from all personnel acknowledging the current home health operational mandates.', accountability: 'Administrator', purpose: 'Standardized worksheet of annual policy compliance.', evidence: ['Signature packet', 'Version receipt log'] },
    { id: 'EN-FM-032', title: 'Master Policy Index / Taxonomy Register', type: 'Tracking Tool', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Consolidated reference ledger matching administrative policies with corresponding state and federal tags.', accountability: 'Director of Quality Assurance', purpose: 'Maintains an auditable log of document versions and cross-references.', evidence: ['Taxonomy sheet', 'Review log'] },
    { id: 'EN-FM-033', title: 'Policy Classification Tier Matrix', type: 'Matrix', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Categorizes operational procedures by threat vector levels, safety impacts, and clinical impact indexes.', accountability: 'Clinical Manager', purpose: 'Determines document review schedules and executive sign-off hierarchy.', evidence: ['Tier index', 'Procedural guide'] },
    { id: 'EN-FM-034', title: 'Domain Owner Assignment Roster', type: 'Tracking Tool', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Assigns operational accountability for specific federal COP rules to key clinical staff leaders.', accountability: 'Compliance Officer', purpose: 'Enforces department-level accountability for evidence packages.', evidence: ['Roster mapping', 'CoP ledger'] },
    { id: 'EN-FM-035', title: 'Regulatory Crosswalk Template', type: 'Template', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Custom mapping tool detailing how standard clinical tasks align with ACHC guidelines and California Title 22.', accountability: 'QAPI Lead / Chair', purpose: 'Generates evidence matrices for regulatory surveyors.', evidence: ['Crosswalk mapping', 'Title 22 matrix'] },
    { id: 'EN-FM-036', title: 'Compliance Gap Analysis Worksheet', type: 'Worksheet', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Analytical ledger to cross-examine current documentation states against mandated performance benchmarks.', accountability: 'Director of Nursing', purpose: 'Documents internal remediation plans for missing elements.', evidence: ['Remediation plan', 'Gap review log'] },
  ]);

  const alignmentMatrix = [
    { policyId: 'CL-CA-001', name: 'Patient Assessment - Comprehensive', evidence: 'D, P', title22: '22 CCR §74695; 22 CCR §74697', achc: 'HHI-2A.01; HHI-2B; HHI-2C', cop: '42 CFR §484.100; 42 CFR §484.105', domain: 'Clinical Operations', description: 'Mandated initial evaluations of patient safety and environmental care metrics completed by clinical supervisors.' },
    { policyId: 'CL-OA-002', name: 'OASIS Data Collection & Accuracy', evidence: 'D, P', title22: '22 CCR §74695; 22 CCR §74697', achc: 'HHI-2A.01; HHI-2B', cop: '42 CFR §484.55', domain: 'Clinical Operations', description: 'Standardized assessment system validating diagnostic accuracy metrics before Medicare submittal.' },
    { policyId: 'CL-OA-003', name: 'OASIS Transmission & Correction', evidence: 'D, I, P', title22: '22 CCR §74697', achc: 'HHI-4A; HHI-4B', cop: '42 CFR §484.45', domain: 'Information Security', description: 'Detailed technical standard outlining secure data transmission parameters.' },
    { policyId: 'CL-CA-004', name: 'Recertification Assessment & Process', evidence: 'D', title22: '22 CCR §74695', achc: 'HHI-2A.01', cop: '42 CFR §484.55(d)', domain: 'Clinical Operations', description: 'Process governing clinical status reassessments for persistent home care candidates.' },
    { policyId: 'CL-CA-005', name: 'Homebound Status Determination', evidence: 'D, P', title22: '22 CCR §74695', achc: 'HHI-2A.01', cop: '42 CFR §484.55', domain: 'Compliance', description: 'Clinical guidelines proving home care eligibility standards match federal guidelines.' }
  ];

  const swimlaneWorkflows = [
    {
      stage: 'PRE-MEETING PREPARATION',
      nodes: [
        { id: 'TASK-QA-101', title: 'Agenda and pre-read distributed', owner: 'QAPI Lead / Chair', status: 'completed', desc: 'Verify pre-meeting packet containing quality matrices is dispatched to all active voting members.', evidence: ['Agenda email logs', 'PDF pre-read receipt'] },
      ]
    },
    {
      stage: 'DATA VALIDATION',
      nodes: [
        { id: 'TASK-QA-102', title: 'Quarterly data package confirmed', owner: 'Data Analyst / Quality Source', status: 'completed', desc: 'Cross-reference electronic nursing records with manual exception sheets to consolidate baseline metrics.', evidence: ['CSV export of baseline metrics', 'e-signature logs'] },
      ]
    },
    {
      stage: 'COMMITTEE REVIEW',
      nodes: [
        { id: 'TASK-QA-105', title: 'Active PIPs reviewed', owner: 'QAPI Lead / Chair', status: 'completed', desc: 'Assess ongoing Performance Improvement Projects (PIPs) against state timelines and clinician milestones.', evidence: ['PIP milestone spreadsheet'] },
        { id: 'TASK-QA-103', title: 'Aggregate quality trends reviewed', owner: 'Data Analyst / Quality Source', status: 'in-progress', desc: 'Examine incident-to-episode trends and flag any outlying clinical domains.', evidence: ['Trend analysis charts'] },
        { id: 'TASK-QA-104', title: 'Adverse events and RCAs reviewed', owner: 'Clinical Manager', status: 'pending', desc: 'Examine Root Cause Analyses (RCAs) conducted during the current quarter.', evidence: ['RCA submission document packet'] },
      ]
    },
    {
      stage: 'VOTE & ACTIONS',
      nodes: [
        { id: 'TASK-QA-108', title: 'Committee vote & action decisions', owner: 'Committee / Voting Members', status: 'pending', desc: 'Convene voting members to confirm remediation priorities.', evidence: ['Vote ledger, action item assignment roster'] }
      ]
    },
    {
      stage: 'MINUTES & SIGNATURES',
      nodes: [
        { id: 'TASK-QA-109', title: 'Minutes drafted in QA-FM-001', owner: 'Scribe', status: 'pending', desc: 'Generate official meeting narrative for state records.', evidence: ['QA-FM-001 Form Draft'] }
      ]
    },
    {
      stage: 'LOCKED PACKAGE',
      nodes: [
        { id: 'TASK-QA-115', title: 'Evidence package locked', owner: 'Evidence / eSign System', status: 'pending', desc: 'Final regulatory archive lock to defend agency licensing.', evidence: ['Cryptographic hash lock signature'] }
      ]
    }
  ];

  const knowledgeArticles = [
    { id: 'k1', category: 'Platform Guide', title: 'Identity Verification & E-Signature Setup', body: 'This manual describes standard identity verification procedures within the CareIndeed enterprise layout. All personnel must complete their facial or hardware token verification before signing CA Title 22 compliance sheets.', tags: ['E-Sign', 'Safe Mode', 'Onboarding'] },
    { id: 'k2', category: 'State Mandates', title: 'CA Title 22 General Home Health Compliance', body: 'A thorough reference blueprint focusing on California Title 22 compliance protocols. Highlights necessary documentation pipelines for incident reports, clinician verification sheets, and QAPI aggregates.', tags: ['Title 22', 'Audits', 'California'] },
    { id: 'k3', category: 'CoP Guidelines', title: 'CMS Conditions of Participation (CoPs) Roadmap', body: 'Full framework for meeting federal Medicare operational standards. Details necessary rules for nursing services, plan of care updates, OASIS submittals, and patient rights documentation checklists.', tags: ['Medicare', 'CoP', 'CMS'] },
    { id: 'k4', category: 'Quality Metrics', title: 'Formulating Quality Improvement Plans (PIPs)', body: 'Guidance on building proactive Performance Improvement Projects (PIPs). Outlines step-by-step procedures for capturing incident baselines, evaluating nursing milestones, and locking down evidence registers.', tags: ['QAPI', 'PIPs', 'Remediation'] },
  ];

  // Dynamic calculations based on user actions (e.g., locking compliance items)
  const totalItemsToVerify = 253;
  const initialBaseVerified = 232;
  const closedTasksCount = 4 - plannerTasks.length; 
  const sealedCount = sealedItems.size;
  
  // Dynamic metrics state updates
  const currentVerificationScore = Math.min(100, Math.floor(91 + (closedTasksCount * 2.2) + (sealedCount * 1.5)));
  const dynamicAuditReadyRatio = `${initialBaseVerified + closedTasksCount + sealedCount}/${totalItemsToVerify}`;
  const dynamicMissingEvidence = Math.max(0, 1 - sealedCount);

  const metrics = [
    { id: 'm1', title: 'ACTIVE SPRINT', main: 'Sprint 10', subText: `${plannerTasks.length} tasks in planner`, type: 'normal' },
    { id: 'm2', title: 'COMPLIANCE RATIO', main: `${(95.8 + sealedCount * 0.4).toFixed(1)}%`, subText: `${dynamicMissingEvidence + 5} items in queue`, type: 'success' },
    { id: 'm3', title: 'AUDIT READY', main: dynamicAuditReadyRatio, subText: `${currentVerificationScore}% readiness score`, type: 'success' },
    { id: 'm4', title: 'ACTIONS OPEN', main: `${plannerTasks.length + 9 - sealedCount}`, subText: '2 self-assigned', type: 'normal' },
    { id: 'm5', title: 'MISSING EVIDENCE', main: `${dynamicMissingEvidence}`, subText: dynamicMissingEvidence > 0 ? 'Upload pending review' : 'All clear!', type: dynamicMissingEvidence > 0 ? 'alert' : 'success' },
    { id: 'm6', title: 'CRITICAL WARNINGS', main: `${Math.max(0, 2 - sealedCount)}`, subText: 'Action required soon', type: 'alert' },
    { id: 'm7', title: 'AUDIT COOLDOWN', main: '104D', subText: 'Days to state review', type: 'normal' },
  ];

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

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle) {
      addToast('Please enter an action item title', 'error');
      return;
    }
    
    const newTask = {
      id: `p${Date.now()}`,
      title: newTaskTitle,
      due: newTaskDue,
      status: newTaskStatus,
      category: newTaskCategory,
      owner: newTaskOwner,
      notes: newTaskNotes || 'Self-assigned compliance item.',
      evidence: []
    };
    
    setPlannerTasks(prev => [newTask, ...prev]);
    addToast(`Action item created: "${newTaskTitle}"`, 'success');
    setShowAddTaskModal(false);
    
    // Reset Form
    setNewTaskTitle('');
    setNewTaskDue('Due tomorrow');
    setNewTaskStatus('upcoming');
    setNewTaskCategory('Clinical');
    setNewTaskOwner('Clinical Manager');
    setNewTaskNotes('');
  };

  const resolveTask = (taskId, taskTitle) => {
    addToast(`Resolved action: ${taskTitle}`, 'success');
    setPlannerTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const shiftPipelineCard = (cardId, direction) => {
    let cardToMove = null;
    let originalIdx = -1;
    let targetIdx = -1;

    const updatedPipelines = activePipelines.map((pipeline, pIdx) => {
      const targetCard = pipeline.cards.find(c => c.id === cardId);
      if (targetCard) {
        cardToMove = targetCard;
        originalIdx = pIdx;
        return {
          ...pipeline,
          cards: pipeline.cards.filter(c => c.id !== cardId)
        };
      }
      return pipeline;
    });

    if (cardToMove && originalIdx !== -1) {
      if (direction === 'forward') {
        targetIdx = (originalIdx + 1) % activePipelines.length;
      } else {
        targetIdx = (originalIdx - 1 + activePipelines.length) % activePipelines.length;
      }

      updatedPipelines[targetIdx].cards.push(cardToMove);
      setActivePipelines(updatedPipelines);
      addToast(`Moved "${cardToMove.title}" to ${updatedPipelines[targetIdx].title}`, 'success');
    }
  };

  // Safe Mock Documents Database
  const mockDocViewerData = {
    'RCA Summary': {
      title: 'Root Cause Analysis Summary Report',
      date: 'June 10, 2026',
      author: 'Compliance Lead',
      content: `CAREINDEED HOME HEALTH SERVICES - RCA-2026-039\n-----------------------------------------------\nEVENT TYPE: Adverse Event Deviation\nLOCATION: Santa Clara Territory\n\nEXECUTIVE SUMMARY:\nAnalysis of clinical report deviations on Q1-Q2 crosswalk indices shows a timing delay in supervisor sign-offs for home sanitization checks. Remediation guidelines have been successfully mapped to California Title 22, section 74695.\n\nRECOMMENDED REMEDIATION ACTION MATRIX:\n1. Re-educate clinicians on immediate documentation submission requirements.\n2. Introduce real-time SMS alerts to clinical managers for plan-of-care updates.\n\nCryptographic Token: HASH-771B8X-CA-T22`
    },
    'Incident Register Log': {
      title: 'Adverse Event Master Index Register',
      date: 'June 14, 2026',
      author: 'Clinical Supervisor',
      content: `RECORD ID | SEVERITY | INCIDENT DESCRIPTION | OUTCOME ACTION\nINC-098   | High     | Sanitizer threshold missing | Rectified\nINC-099   | Medium   | OASIS transmit lag (12 hrs) | Supervisor updated\nINC-100   | Critical | Plan-of-care verification mismatch | Retraining sched\n\nAll variables successfully processed & resolved under federal CoP standards.`
    },
    'v3 Outline PDF': {
      title: 'Clinician Competency Framework Update v3',
      date: 'May 22, 2026',
      author: 'Director of Nursing',
      content: `CAREINDEED NURSING TRAINING LOG REORGANIZATION\n-----------------------------------------------\nThis matrix aligns supervisory checklists for home visits with standard ACHC HHI-2A guidelines.\n\nSection A: Biometric Checklists & Hardware Tokens\nSection B: Title 22 Sanitization Logs\nSection C: Patient Health Information Protection Protocol`
    },
    'Supervisor Sign-off': {
      title: 'Regional Supervisor Sign-off Ledger',
      date: 'June 15, 2026',
      author: 'S. Ahmed, Supervisor (RN)',
      content: `COMPLIANCE ATTESTATION RECEIPT\n\nI hereby certify that clinical skillsets for all regional nursing assistants have been audited and logged within standard Safe Mode systems.\n\nSigned: /S. Ahmed/ RN, Clinical Lead\nDate: 06/15/2026`
    },
    'Budget excel report': {
      title: 'CareIndeed Operations Budget Allocation Sheet',
      date: 'June 01, 2026',
      author: 'Chief Financial Officer',
      content: `Q2 CORPORATE BUDGET SHEET (REGIONAL EXPANSION VALUE MATRIX)\n-----------------------------------------------\nClinical Training Unit:  $145,000\nSoftware Security Keys:  $35,000\nAudit & Title 22 Maps:  $80,000\nTotal Audited Balance:  $260,000\n\nStatus: Reconciled & ready for Medicare claim submission.`
    },
    'Milestone report v1': {
      title: 'QAPI Q1 Program Performance Milestone Report',
      date: 'April 30, 2026',
      author: 'QAPI Lead Chair',
      content: `BENCHMARK METRICS SUMMARY:\n- Patient satisfaction score: 98.4%\n- Audit readiness accuracy ratio: 94.8%\n- OASIS submission error threshold: 0.12% (Target <1.0%)\n- Clinical incident escalation lag: 1.1 hours (Target <4.0 hours)\n\nAll performance vectors represent successful compliance states.`
    }
  };

  const commandSearchResults = [
    ...formsData.map(f => ({ type: 'COMPLIANCE FORM', id: f.id, title: f.title, action: () => { setActiveTab('forms'); setInspectItem(f); } })),
    ...alignmentMatrix.map(a => ({ type: 'REGULATORY CROSSWALK', id: a.policyId, title: a.name, action: () => { setActiveTab('survey'); setInspectItem(a); } })),
    ...knowledgeArticles.map(k => ({ type: 'HELP MANUAL', id: k.id, title: k.title, action: () => { setActiveTab('knowledge'); setSelectedArticle(k); } })),
    ...plannerTasks.map(t => ({ type: 'PLANNER TASK', id: t.id, title: t.title, action: () => { setActiveTab('dashboard'); setActiveView('planner'); setInspectItem(t); } }))
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

  const filteredArticles = knowledgeArticles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
                          art.body.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
                          art.category.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
                          art.tags.some(t => t.toLowerCase().includes(knowledgeSearch.toLowerCase()));
    return matchesSearch;
  });

  const cycleNodeStatus = (stageIndex, nodeIndex) => {
    const stagesCopy = [...swimlaneWorkflows];
    const node = stagesCopy[stageIndex].nodes[nodeIndex];
    let nextStatus = 'pending';
    if (node.status === 'pending') nextStatus = 'in-progress';
    else if (node.status === 'in-progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    node.status = nextStatus;
    addToast(`Workflow task updated: "${node.title}" is now ${nextStatus.toUpperCase()}`, 'success');
  };

  const handleInspectLauncher = (item) => {
    setInspectItem(item);
    setInspectTab('overview');
    setSigText('');
    setHasAgreedCheck(false);
    setSelectedMockDoc(null);
  };

  const handleSealAndAuthorize = () => {
    if (inspectTab === 'biometric') {
      if (!hasAgreedCheck || !sigText) {
        addToast('Please complete the attestation check and type your signature before sealing.', 'error');
        return;
      }
    }
    
    // Add item ID/unique key to sealed list to dynamically trigger states & metric calculations
    const uniqueKey = inspectItem.id || inspectItem.policyId || inspectItem.title;
    setSealedItems(prev => {
      const copy = new Set(prev);
      copy.add(uniqueKey);
      return copy;
    });

    addToast(`Compliance package signed, cryptographically locked, and sealed under signature: "${sigText || 'E-Sign system'}"`, 'success');
    handleInspectLauncher(null);
  };

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
        
        /* Premium multi-colored flowing blurred wallpaper base */
        .light-shell::before {
          content: "";
          position: fixed;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background: 
            radial-gradient(circle at 12% 15%, rgba(199, 70, 1, 0.14) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(0, 121, 125, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 218, 198, 0.48) 0%, transparent 60%),
            radial-gradient(circle at 90% 10%, rgba(229, 254, 255, 0.68) 0%, transparent 45%);
          filter: blur(95px);
          animation: ambientFlow 28s ease-in-out infinite alternate;
        }

        @keyframes ambientFlow {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.05) translate(1.5%, -1%); }
          100% { transform: scale(1.1) translate(-1%, 2.5%); }
        }

        .font-heading {
          font-family: 'Montserrat', sans-serif;
        }

        .font-signature {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }

        /* 3D Glass Layer and Bevel Effects for integrated Nav Buttons */
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

        /* Deep Visual-Grade Shadows on Cards and Panels */
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

        /* Spotlight Glass System Card Architecture */
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
          background-color: rgba(255, 255, 255, 0.32);
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

      {/* DEDICATED TOP HEADER */}
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

        {/* TOP BAR SEARCH */}
        <div className="flex flex-1 items-center max-w-md ml-4">
          <div 
            onClick={() => setIsCommandSearchOpen(true)}
            className="group relative w-full cursor-pointer"
          >
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
              addToast('System integrity status: 100% Secure. All cryptographic compliance signatures match.', 'success');
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--teal-primary)] transition-all border border-white/55 premium-shadow"
            title="System Integrity Status"
          >
            <Lock size={14} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button 
            onClick={() => {
              const nextState = !isPersonalOpsOpen;
              handleSetPersonalOpsOpen(nextState);
              addToast(nextState ? 'Personal Operations expanded (Sidebar collapsed)' : 'Personal Operations collapsed', 'info');
            }}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md ml-2 relative border-2 border-white/70",
              isPersonalOpsOpen ? "bg-[var(--orange-primary)] scale-105" : "bg-[var(--teal-primary)]"
            )}
            title="Toggle Personal Operations Center"
          >
            RP
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
          </button>
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
              onClick={() => handleSetSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Sidebar Navigation Links with Integrated 3D Glass Containers and Teal Glows */}
          <div className="flex-1 space-y-7 overflow-y-auto px-4 py-2 select-none">
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Operations
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={LayoutDashboard} 
                  label="Dashboard" 
                  active={activeTab === 'dashboard' && activeView !== 'planner'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('dashboard'); setActiveView('agency'); }} 
                />
                
                <InteractiveNavButton 
                  icon={Users} 
                  label="Clinicians" 
                  active={false} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { addToast('Clinician Profile Directories are safely managed in Identity Core.'); }} 
                />

                <InteractiveNavButton 
                  icon={CheckSquare} 
                  label="Patients" 
                  active={false} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { addToast('Secure Patient Portals are sealed under active encryption.'); }} 
                />

                <InteractiveNavButton 
                  icon={Calendar} 
                  label="My Planner" 
                  active={activeTab === 'dashboard' && activeView === 'planner'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('dashboard'); setActiveView('planner'); }} 
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Compliance Execution
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={FileCheck} 
                  label="Compliance Library" 
                  active={activeTab === 'forms'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('forms'); }} 
                />

                <InteractiveNavButton 
                  icon={TrendingUp} 
                  label="QAPI Workflows" 
                  active={activeTab === 'workflows'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('workflows'); }} 
                />

                <InteractiveNavButton 
                  icon={Sliders} 
                  label="Survey Alignment" 
                  active={activeTab === 'survey'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('survey'); }} 
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Knowledge Base
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={HelpCircle} 
                  label="Help & Guides" 
                  active={activeTab === 'knowledge'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { setActiveTab('knowledge'); setSelectedArticle(null); }} 
                />
              </div>
            </div>
          </div>

          {/* Bottom Security Clearance panel */}
          <div className="p-4 bg-white/25 select-none text-[11px] font-bold text-[var(--text-primary)] border-t border-white/20">
            <span className="flex items-center gap-1.5 justify-center">
              <Lock size={12} className="text-[var(--teal-primary)]" />
              {!isSidebarCollapsed && <span>Safe Mode Active</span>}
            </span>
          </div>
        </aside>

        {/* CENTER VIEW PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent relative z-10 p-6 md:p-9">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Header Module */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-none-structure">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                    Executive Command Center
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[var(--teal-primary)]">
                    {activeView === 'agency' ? 'What needs action now' : 'My Work Planner'}
                  </h1>
                  <p className="max-w-2xl text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                    {activeView === 'agency' 
                      ? 'Executive operational log for active compliance execution, regulatory evidence readiness, and state auditor defense.' 
                      : 'Your private, scheduled clinician compliance tasks. Upload required evidence matrices and authorize state reports.'}
                  </p>
                </div>

                {/* View Switchers */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
                  <div className="text-left lg:text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">VERIFIED COMPLIANCE STATUS</div>
                    <div className="text-sm font-bold text-[var(--teal-primary)] flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" /> Active • Safe Mode
                    </div>
                  </div>

                  <div className="flex rounded-full bg-white/30 p-1 border border-white/50 backdrop-blur-md premium-shadow">
                    <button
                      onClick={() => { setActiveView('agency'); addToast('Viewing Agency-wide critical pipelines'); }}
                      className={cx('flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200', activeView === 'agency' ? 'bg-[var(--teal-primary)] text-white shadow-sm' : 'text-[var(--text-primary)] hover:bg-white/20')}
                    >
                      <BookOpen size={14} /> Agency View
                    </button>

                    <button
                      onClick={() => { setActiveView('planner'); addToast('Viewing personal action logs'); }}
                      className={cx('flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all duration-200', activeView === 'planner' ? 'bg-[var(--teal-primary)] text-white shadow-sm' : 'text-[var(--text-primary)] hover:bg-white/20')}
                    >
                      <Calendar size={14} /> My Planner ({plannerTasks.length})
                    </button>
                  </div>
                </div>
              </div>
              
              {/* AGENCY VIEW MODE */}
              {activeView === 'agency' ? (
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Metrics Ribbon Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                    {metrics.map((metric) => (
                      <SpotlightCard
                        key={metric.id}
                        spotlightColor={metric.type === 'alert' ? 'rgba(199,70,1,0.08)' : 'rgba(0,121,125,0.08)'}
                        className="p-4 flex flex-col justify-between h-32 cursor-pointer premium-shadow hover:shadow-depth"
                        onClick={() => {
                          addToast(`Detailed analysis of ${metric.title} is verified and locked in-memory.`, 'info');
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5" title={metric.title}>
                            {metric.title} 
                            {metric.type === 'alert' && <AlertTriangle size={12} className="text-[var(--orange-primary)]" />}
                          </span>
                        </div>
                        <div className="mt-auto space-y-1">
                          <div 
                            className="text-2xl font-extrabold tracking-tight mb-0.5"
                            style={{ color: metric.type === 'alert' ? 'var(--orange-primary)' : 'var(--teal-primary)' }}
                          >
                            {metric.main}
                          </div>
                          <span className="text-[10px] font-medium text-[var(--text-secondary)] block truncate" title={metric.subText}>{metric.subText}</span>
                        </div>
                      </SpotlightCard>
                    ))}
                  </div>

                  {/* Warning Banner / Audit Progress Indicator */}
                  <div className="rounded-2xl bg-white/35 backdrop-blur-[33px] p-5 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border border-white/50 relative overflow-hidden premium-shadow">
                    <div className="flex gap-4 items-center relative z-10">
                      <div className="text-[var(--orange-primary)] shrink-0 bg-white/250 p-2.5 rounded-xl border border-white/40 shadow-sm">
                        <ShieldAlert size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--teal-primary)]">
                          AGENCY READINESS PROGRESS INDEX
                        </h4>
                        <div className="flex items-center gap-3">
                          <div className="w-48 h-2.5 bg-neutral-200/60 rounded-full overflow-hidden border border-white">
                            <div 
                              className="h-full bg-gradient-to-r from-[var(--teal-primary)] to-emerald-500 transition-all duration-500" 
                              style={{ width: `${currentVerificationScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-[var(--teal-primary)]">{currentVerificationScore}% Ready</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10 w-full xl:w-auto shrink-0">
                      <button 
                        onClick={() => {
                          setActiveTab('survey');
                          addToast('Navigating to CMS & Title 22 Crosswalk to align evidence.');
                        }} 
                        className="px-4 py-2 rounded-lg border border-[var(--orange-primary)]/40 text-[var(--orange-primary)] bg-white/250 text-[10px] font-bold tracking-widest uppercase hover:bg-white/80 transition-colors whitespace-nowrap"
                      >
                        CROSSWALK MAP
                      </button>
                      <button 
                        onClick={() => {
                          addToast('Generating Regulatory Readiness Report... Perfect Score Projected.', 'success');
                        }}
                        className="px-5 py-2 rounded-lg bg-[var(--orange-primary)] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--orange-primary)]/90 transition-colors whitespace-nowrap"
                      >
                        RUN READINESS AUDIT
                      </button>
                    </div>
                  </div>

                  {/* Visual Pipelines */}
                  <div className="space-y-6 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-none-structure pb-2">
                      <div className="space-y-1">
                        <h2 className="font-heading text-xl font-extrabold tracking-tight text-[var(--teal-primary)]">
                          State Auditing & Compliance Pipelines
                        </h2>
                        <p className="text-xs text-[var(--text-secondary)]">Interact with tasks to advance their state or inspect audit artifacts.</p>
                      </div>
                    </div>

                    {/* Columns Grid with Deeper Shadows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                      {activePipelines.map((pipeline) => (
                        <div key={pipeline.id} className="space-y-4">
                          <div className="flex items-center justify-between pb-2 px-1">
                            <div className={cx("flex items-center gap-2 font-bold text-xs uppercase tracking-wider", pipeline.color.split(' ')[0])}>
                              <Activity size={14} />
                              <span>{pipeline.title}</span>
                            </div>
                            <span className={cx("text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/60 shadow-sm", pipeline.color.split(' ').slice(1).join(' '))}>
                              {pipeline.cards.length}
                            </span>
                          </div>

                          <div className="space-y-3 min-h-[300px] rounded-2xl bg-white/10 p-2.5 border border-white/15">
                            {pipeline.cards.length === 0 ? (
                              <div className="h-48 flex items-center justify-center text-xs text-[var(--text-tertiary)] italic">
                                Column empty. Move items here.
                              </div>
                            ) : (
                              pipeline.cards.map((card) => {
                                const isItemSealed = sealedItems.has(card.id);
                                return (
                                  <SpotlightCard
                                    key={card.id}
                                    spotlightColor={pipeline.id === 'critical' ? 'rgba(199,70,1,0.06)' : 'rgba(0,121,125,0.06)'}
                                    onClick={() => handleInspectLauncher(card)}
                                    className={cx(
                                      "p-5 cursor-pointer hover:border-[var(--teal-primary)]/40 transition-all space-y-4 premium-shadow hover:shadow-depth",
                                      isItemSealed ? "opacity-75 border-emerald-500/30 bg-emerald-500/5" : ""
                                    )}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] bg-white/40 px-2 py-0.5 rounded border border-white/20">
                                        {card.category}
                                      </span>
                                      
                                      {isItemSealed ? (
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                                          <Lock size={10} className="text-emerald-600" /> SEALED
                                        </span>
                                      ) : (
                                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                          <button 
                                            onClick={() => shiftPipelineCard(card.id, 'backward')}
                                            className="text-[var(--text-tertiary)] hover:text-[var(--teal-primary)] p-1 rounded hover:bg-white/40"
                                            title="Move state back"
                                          >
                                            <ChevronLeft size={14} />
                                          </button>
                                          <button 
                                            onClick={() => shiftPipelineCard(card.id, 'forward')}
                                            className="text-[var(--text-tertiary)] hover:text-[var(--teal-primary)] p-1 rounded hover:bg-white/40"
                                            title="Move state forward"
                                          >
                                            <ChevronRight size={14} />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <h4 className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                                      {card.title}
                                    </h4>

                                    <div className="flex items-center justify-between pt-2 border-none-structure">
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded bg-white/250 flex items-center justify-center text-[9px] font-bold text-[var(--text-secondary)] shadow-inner">
                                          {card.role}
                                        </div>
                                        <span className="text-[11px] text-[var(--text-secondary)] font-medium truncate max-w-[120px]">
                                          {card.assignee}
                                        </span>
                                      </div>
                                      <span className={cx("text-[9px] font-bold px-2 py-1 rounded tracking-wider uppercase border border-white/30 bg-white/250 shadow-sm shrink-0", pipeline.color.split(' ')[0])}>
                                        {card.time}
                                      </span>
                                    </div>
                                  </SpotlightCard>
                                );
                              })
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                
                /* MY PLANNER MODE */
                <div className="space-y-6 animate-fadeIn">
                  <div className="rounded-2xl bg-white/35 backdrop-blur-[33px] p-7 shadow-sm border border-white/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 premium-shadow">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--orange-primary)]/20">
                          Personal Safe Mode Active
                        </span>
                      </div>
                      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-[var(--teal-primary)] mt-2">Active Planner Registry</h1>
                      <p className="text-xs text-[var(--text-secondary)]">Manage your clinical compliance obligations and add verification documents directly to safety workflows.</p>
                    </div>
                    <button
                      onClick={() => setShowAddTaskModal(true)}
                      className="rounded-full bg-[var(--teal-primary)] text-white px-5 py-2.5 text-xs font-bold flex items-center gap-2 hover:bg-[var(--teal-primary)]/90 transition-colors shadow-md shrink-0"
                    >
                      <Plus size={14} /> Add Action Item
                    </button>
                  </div>

                  {/* Columns representing Overdue and Upcoming tasks */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Column 1: Overdue & Critical */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <AlertTriangle size={15} className="text-[var(--orange-primary)] animate-bounce" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">Overdue Actions Requiring Sign-off</h3>
                      </div>
                      
                      {plannerTasks.filter(t => t.status === 'overdue').length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white/10 text-center text-xs text-[var(--text-secondary)] border border-white/20">
                          No overdue action items! You are fully safe.
                        </div>
                      ) : (
                        plannerTasks.filter(t => t.status === 'overdue').map(task => {
                          const isItemSealed = sealedItems.has(task.id);
                          return (
                            <SpotlightCard 
                              key={task.id} 
                              spotlightColor="rgba(199,70,1,0.06)" 
                              className={cx(
                                "p-5 cursor-pointer relative premium-shadow hover:shadow-depth",
                                isItemSealed ? "opacity-75 border-emerald-500/30 bg-emerald-500/5" : ""
                              )} 
                              onClick={() => handleInspectLauncher(task)}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--orange-primary)] bg-[var(--orange-primary)]/10 px-2.5 py-0.5 rounded border border-[var(--orange-primary)]/20">
                                      {task.category}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">ID: {task.id}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-[var(--text-primary)] leading-snug">{task.title}</h4>
                                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{task.notes}</p>
                                  <span className="block text-[10px] font-semibold text-[var(--text-tertiary)]">
                                    Timeline State: <strong className="text-[var(--orange-primary)]">{task.due}</strong>
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 items-end">
                                  {isItemSealed ? (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-300">
                                      <Lock size={10} className="text-emerald-600" /> LOCKED
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        resolveTask(task.id, task.title); 
                                      }} 
                                      className="rounded-full bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white px-4 py-1.5 text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                                    >
                                      <Check size={11} /> Resolve
                                    </button>
                                  )}
                                </div>
                              </div>
                            </SpotlightCard>
                          );
                        })
                      )}
                    </div>

                    {/* Column 2: Upcoming Actions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <CheckCircle size={15} className="text-[var(--teal-primary)]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">Upcoming Operational Timelines</h3>
                      </div>

                      {plannerTasks.filter(t => t.status === 'upcoming').length === 0 ? (
                        <div className="p-8 rounded-2xl bg-white/10 text-center text-xs text-[var(--text-secondary)] border border-white/20">
                          No upcoming scheduled items.
                        </div>
                      ) : (
                        plannerTasks.filter(t => t.status === 'upcoming').map(task => {
                          const isItemSealed = sealedItems.has(task.id);
                          return (
                            <SpotlightCard 
                              key={task.id} 
                              spotlightColor="rgba(0,121,125,0.06)" 
                              className={cx(
                                "p-5 cursor-pointer premium-shadow hover:shadow-depth",
                                isItemSealed ? "opacity-75 border-emerald-500/30 bg-emerald-500/5" : ""
                              )} 
                              onClick={() => handleInspectLauncher(task)}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-0.5 rounded border border-[var(--teal-primary)]/20">
                                      {task.category}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono">ID: {task.id}</span>
                                  </div>
                                  <h4 className="text-xs font-bold text-[var(--text-primary)] leading-snug">{task.title}</h4>
                                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{task.notes}</p>
                                  <span className="block text-[10px] font-semibold text-[var(--text-tertiary)]">
                                    Expected Limit: <strong className="text-[var(--teal-primary)]">{task.due}</strong>
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0 items-end">
                                  {isItemSealed ? (
                                    <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2.5 py-1 rounded border border-emerald-300">
                                      <Lock size={10} className="text-emerald-600" /> LOCKED
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        resolveTask(task.id, task.title); 
                                      }} 
                                      className="rounded-full bg-[var(--teal-primary)] hover:bg-[var(--teal-primary)]/90 text-white px-4 py-1.5 text-[10px] font-bold transition-all shadow-sm flex items-center gap-1"
                                    >
                                      <Check size={11} /> Resolve
                                    </button>
                                  )}
                                </div>
                              </div>
                            </SpotlightCard>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENTERPRISE COMPLIANCE LIBRARY */}
          {activeTab === 'forms' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-none-structure">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/20">
                    Standardized Operations Worksheets
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                    Enterprise Forms Library
                  </h1>
                  <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                    Access official attestation logs, taxonomic registers, and evidence worksheets mapping directly to state Title 22 guidelines.
                  </p>
                </div>

                {/* Dynamic Form Text Search */}
                <div className="relative w-full md:w-80 shrink-0">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forms index..."
                    className="w-full bg-white/30 backdrop-blur-md border border-white/50 pl-10 pr-4 py-2 text-xs rounded-full outline-none focus:bg-white/60 transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)] premium-shadow"
                  />
                </div>
              </div>

              {/* Filter Matrix Controls */}
              <div className="flex flex-wrap items-center gap-4 bg-white/25 backdrop-blur-[33px] p-4 rounded-2xl border border-white/40 premium-shadow">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--teal-primary)] flex items-center gap-1">
                  <Filter size={12} /> Filter Matrices:
                </span>
                
                {/* Severity Category Filter */}
                <div className="flex flex-wrap rounded-full bg-white/40 p-0.5 border border-white/50">
                  {['ALL', 'AUDIT CRITICAL', 'SHARED ENTERPRISE', 'MASTER TEMPLATE'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => { setFilterSeverity(sev); addToast(`Filtering by classification: ${sev}`); }}
                      className={cx(
                        "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                        filterSeverity === sev ? "bg-[var(--teal-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white/30"
                      )}
                    >
                      {sev}
                    </button>
                  ))}
                </div>

                {/* Form Type Filter */}
                <div className="flex flex-wrap rounded-full bg-white/40 p-0.5 border border-white/50">
                  {['ALL', 'Attestation', 'Tracking Tool', 'Matrix', 'Template'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setFilterType(t); addToast(`Filtering by form type: ${t}`); }}
                      className={cx(
                        "px-3 py-1 text-[10px] font-bold rounded-full transition-all",
                        filterType === t ? "bg-[var(--teal-primary)] text-white" : "text-[var(--text-secondary)] hover:bg-white/30"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forms grid representation */}
              {filteredForms.length === 0 ? (
                <div className="p-16 text-center text-xs text-[var(--text-secondary)] bg-white/10 rounded-2xl border border-white/20">
                  No compliance documents match your selected filters. Reset search parameters above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredForms.map((form) => {
                    const isItemSealed = sealedItems.has(form.id);
                    return (
                      <SpotlightCard 
                        key={form.id} 
                        onClick={() => handleInspectLauncher(form)} 
                        className={cx(
                          "p-5 flex flex-col justify-between min-h-[220px] cursor-pointer premium-shadow hover:shadow-depth",
                          isItemSealed ? "opacity-75 border-emerald-500/30 bg-emerald-500/5" : ""
                        )}
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-extrabold font-mono text-[var(--teal-primary)] bg-white/250 px-2 py-0.5 rounded border border-white/30">
                              {form.id}
                            </span>
                            {isItemSealed ? (
                              <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                SEALED
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/40 text-[var(--text-secondary)] border border-neutral-200/70 shadow-sm">
                                {form.severity}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                            {form.title}
                          </h3>
                          
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                            {form.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-white/20 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
                          <span>Owner: <strong className="text-[var(--text-secondary)] truncate max-w-[150px] inline-block align-bottom">{form.accountability}</strong></span>
                          <span className="text-[var(--teal-primary)] flex items-center gap-1 font-bold shrink-0">
                            Inspect <ArrowRight size={12} />
                          </span>
                        </div>
                      </SpotlightCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGULATORY WORKFLOW SWIMLANES */}
          {activeTab === 'workflows' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Header Section */}
              <div className="space-y-2 pb-6 border-none-structure">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/20">
                  Visual Process Mapping
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-2">
                  Quarterly QAPI Review Workflows
                </h1>
                <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                  Click each node below to step-by-step advance the review status. Consolidate and compile verifiable audit artifacts.
                </p>
              </div>

              {/* Swimlane scrollable platform area */}
              <div className="bg-white/10 backdrop-blur-[33px] rounded-2xl p-6 overflow-x-auto border border-white/20 premium-shadow">
                <div className="flex gap-6 min-w-[1200px] items-stretch">
                  {swimlaneWorkflows.map((stage, stageIdx) => (
                    <div key={stageIdx} className="w-[190px] flex-shrink-0 flex flex-col gap-4">
                      
                      {/* Column Header */}
                      <div className="text-[10px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider pb-2 text-center border-b border-white/20">
                        {stage.stage}
                      </div>

                      {/* List of nodes */}
                      <div className="flex-1 flex flex-col gap-4 justify-start">
                        {stage.nodes.map((node, nodeIdx) => {
                          const isItemSealed = sealedItems.has(node.id);
                          return (
                            <div 
                              key={nodeIdx} 
                              onClick={() => handleInspectLauncher(node)}
                              className={cx(
                                "group p-4 rounded-xl bg-white/45 shadow-sm hover:bg-white/60 transition-all border border-white/50 cursor-pointer relative space-y-3 premium-shadow",
                                isItemSealed ? "border-emerald-500 bg-emerald-50/60" : ""
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-[var(--text-tertiary)]">{node.id}</span>
                                
                                {isItemSealed ? (
                                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    LOCKED
                                  </span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cycleNodeStatus(stageIdx, nodeIdx);
                                    }}
                                    className={cx(
                                      "text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                      node.status === 'completed' && "bg-emerald-100 text-emerald-800 border border-emerald-300",
                                      node.status === 'in-progress' && "bg-amber-100 text-amber-800 border border-amber-300",
                                      node.status === 'pending' && "bg-rose-100 text-rose-800 border border-rose-300"
                                    )}
                                    title="Click to advance status"
                                  >
                                    {node.status}
                                  </button>
                                )}
                              </div>

                              <h4 className="text-[11px] font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--teal-primary)] transition-colors">
                                {node.title}
                              </h4>
                              
                              <p className="text-[9px] text-[var(--text-tertiary)] italic leading-relaxed line-clamp-2">
                                {node.desc}
                              </p>

                              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[8.5px] text-[var(--text-secondary)]">
                                <span className="truncate">Owner: <strong>{node.owner.split(' / ')[0]}</strong></span>
                                <span className="text-[var(--teal-primary)] font-bold shrink-0">Inspect</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Helpful Alert */}
              <div className="p-4 rounded-xl bg-[var(--teal-primary)]/5 border border-[var(--teal-primary)]/20 text-xs text-[var(--text-secondary)] flex items-center gap-3 premium-shadow">
                <Activity size={16} className="text-[var(--teal-primary)] shrink-0 animate-pulse" />
                <span>
                  <strong>System Hint:</strong> Keep all tasks updated to <strong>COMPLETED</strong> or authorize/seal them to automatically sign and freeze the comprehensive QAPI package in Safe Mode registers.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: SURVEY ALIGNMENT matrix */}
          {activeTab === 'survey' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Header Module */}
              <div className="space-y-2 pb-6 border-none-structure">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/20">
                  CMS Federal Tags Mapping Matrix
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-2">
                  ACHC & CMS CoP Crosswalk
                </h1>
                <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                  Comprehensive crosswalk ledger matching standard administrative policies, CA Title 22 tags, and federal Medicare Conditions of Participation (CoPs).
                </p>
              </div>

              {/* Main Table Interface */}
              <div className="bg-white/20 backdrop-blur-[33px] rounded-2xl overflow-hidden border border-white/40 shadow-sm premium-shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4.5 border-b border-white/20">Standard Tag</th>
                        <th className="p-4.5 border-b border-white/20">Core Clinical Policy</th>
                        <th className="p-4.5 border-b border-white/20">Domain Scope</th>
                        <th className="p-4.5 border-b border-white/20">California Title 22</th>
                        <th className="p-4.5 border-b border-white/20">Medicare CoP</th>
                        <th className="p-4.5 border-b border-white/20 text-center">Detail View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {alignmentMatrix.map((item, index) => {
                        const isItemSealed = sealedItems.has(item.policyId);
                        return (
                          <tr 
                            key={index} 
                            onClick={() => handleInspectLauncher(item)}
                            className={cx(
                              "hover:bg-white/30 transition-colors cursor-pointer group",
                              isItemSealed ? "bg-emerald-500/5 hover:bg-emerald-500/10" : ""
                            )}
                          >
                            <td className="p-4.5 font-mono text-[var(--teal-primary)] font-bold flex items-center gap-1.5">
                              {isItemSealed && <Lock size={12} className="text-emerald-600 inline-block" />}
                              {item.policyId}
                            </td>
                            <td className="p-4.5">
                              <div className="font-bold text-[var(--text-primary)]">{item.name}</div>
                              <div className="text-[9.5px] text-[var(--text-tertiary)] leading-tight mt-0.5">{item.description}</div>
                            </td>
                            <td className="p-4.5 text-[var(--text-secondary)]">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/40 text-[var(--text-secondary)] border border-white/15 shadow-sm">
                                {item.domain}
                              </span>
                            </td>
                            <td className="p-4.5 text-[var(--text-secondary)] font-medium font-mono">{item.title22}</td>
                            <td className="p-4.5 text-[var(--orange-primary)] font-bold font-mono text-[11px]">{item.cop}</td>
                            <td className="p-4.5 text-center">
                              <button 
                                className="text-[var(--teal-primary)] font-bold hover:underline text-[10px] group-hover:translate-x-1 inline-block transition-transform"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleInspectLauncher(item);
                                }}
                              >
                                {isItemSealed ? 'Review Safe Seal →' : 'Review Key →'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HELP & KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Visual Search Jumbotron */}
              <div className="text-center space-y-4 max-w-xl mx-auto pt-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-white/40 px-3 py-1 rounded-full border border-white/50 shadow-sm premium-shadow">
                  CareIndeed Reference Support
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  How can we assist you today?
                </h1>
                
                {/* Article Search Box */}
                <div className="relative mt-8">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={knowledgeSearch}
                    onChange={(e) => {
                      setKnowledgeSearch(e.target.value);
                      setSelectedArticle(null);
                    }}
                    placeholder="Search clinical guidelines, state codes..."
                    className="w-full rounded-full bg-white/40 border border-white/60 backdrop-blur-md px-12 py-3.5 text-xs text-[var(--text-primary)] outline-none transition-all focus:bg-white/60 shadow-inner premium-shadow"
                  />
                  {knowledgeSearch && (
                    <button 
                      onClick={() => setKnowledgeSearch('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-white/80 px-2 py-1 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Articles Matrix layout */}
              {selectedArticle ? (
                <div className="max-w-2xl mx-auto bg-white/35 backdrop-blur-[33px] p-8 rounded-2xl border border-white/50 animate-fadeIn space-y-6 premium-shadow">
                  <button 
                    onClick={() => setSelectedArticle(null)} 
                    className="text-xs text-[var(--teal-primary)] font-bold flex items-center gap-1 hover:underline"
                  >
                    ← Back to Support List
                  </button>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded border border-[var(--teal-primary)]/15">
                      {selectedArticle.category}
                    </span>
                    <h2 className="font-heading text-2xl font-extrabold text-[var(--teal-primary)] pt-2">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-white/40 p-5 rounded-xl border border-white shadow-inner">
                    {selectedArticle.body}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedArticle.tags.map(t => (
                      <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/250 text-[var(--text-tertiary)] border border-neutral-200/70 shadow-sm">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
                  {filteredArticles.length === 0 ? (
                    <div className="p-10 text-center text-xs text-[var(--text-secondary)] bg-white/20 rounded-2xl col-span-2">
                      No articles match your query. Try searching for "Title 22", "E-Sign", or "CMS".
                    </div>
                  ) : (
                    filteredArticles.map(article => (
                      <SpotlightCard
                        key={article.id}
                        spotlightColor="rgba(0,121,125,0.06)"
                        onClick={() => {
                          setSelectedArticle(article);
                          addToast(`Opened article: "${article.title}"`);
                        }}
                        className="p-6 cursor-pointer flex flex-col justify-between h-48 hover:border-[var(--teal-primary)]/40 transition-colors premium-shadow hover:shadow-depth"
                      >
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                            {article.category}
                          </span>
                          <h3 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--teal-primary)] leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-2 leading-relaxed">
                            {article.body}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-bold text-[var(--teal-primary)] pt-4 border-t border-white/15 mt-auto">
                          <span>Read Manual</span>
                          <ChevronRight size={14} />
                        </div>
                      </SpotlightCard>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT SIDE PANEL (PERSONAL OPERATIONS DRAWER) */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-l border-white/25 select-none overflow-hidden shrink-0",
            isPersonalOpsOpen ? "w-[340px] px-6 py-6 bg-white/10" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-6">
            
            <div className="space-y-6">
              {/* Drawer Close Trigger Row */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                  Personal Center
                </span>
                <button
                  onClick={() => {
                    handleSetPersonalOpsOpen(false);
                    addToast('Personal Operations Center hidden.');
                  }}
                  className="p-1.5 rounded-full hover:bg-white/30 text-[var(--text-tertiary)] border border-white/30 bg-white/10 transition-colors premium-shadow"
                  title="Hide Panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Clinician Account Profile Summary */}
              <div className="bg-white/45 p-4 rounded-2xl flex items-center gap-3 border border-white/50 shadow-sm premium-shadow">
                <div className="h-11 w-11 rounded-full shrink-0 bg-[var(--teal-primary)] flex items-center justify-center font-bold text-white text-base shadow-sm">
                  RP
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">Robert P.</h3>
                    <span className="text-[8px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/15 shrink-0">
                      Manager
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)]">CareIndeed Clinical Division</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9.5px] text-emerald-600 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Session Verified
                  </div>
                </div>
              </div>

              {/* Dynamic Focus Metrics Panel */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                  Outstanding Controls
                </h4>
                <div className="space-y-1.5">
                  {[
                    { count: `${plannerTasks.filter(t => t.status === 'overdue').length}`, label: 'Action Items Overdue', color: 'text-[var(--orange-primary)]' },
                    { count: `${Math.max(0, 3 - sealedCount)}`, label: 'Unsigned state forms logs', color: 'text-[var(--orange-primary)]' },
                    { count: `${plannerTasks.filter(t => t.status === 'upcoming').length}`, label: 'Upcoming operational tasks', color: 'text-[var(--teal-primary)]' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActiveTab('dashboard');
                        setActiveView('planner');
                        addToast(`Navigating to personal planner focus: ${item.label}`);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/25 hover:bg-white/45 transition-colors cursor-pointer border border-white/20 premium-shadow"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cx("text-xs font-extrabold font-mono shrink-0", item.color)}>{item.count}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] truncate">{item.label}</span>
                      </div>
                      <ChevronRight size={13} className="text-[var(--text-tertiary)] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Schedule Module */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                    My Calendar
                  </h4>
                  <button 
                    onClick={() => addToast('Full Scheduler module is active.')}
                    className="text-[9px] text-[var(--teal-primary)] hover:underline font-bold"
                  >
                    Open Scheduler
                  </button>
                </div>
                <div className="space-y-1.5">
                  {[
                    { title: 'QAPI Committee Assembly', time: 'Today • 10:00 AM', tag: 'Governance' },
                    { title: 'Title 22 Plan of Care Review', time: 'Today • 1:30 PM', tag: 'Audit' },
                    { title: 'Supervisor competency sign-off', time: 'Tomorrow • 9:00 AM', tag: 'Nursing' }
                  ].map((event, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => addToast(`Calendar details: "${event.title}"`)}
                      className="p-3 rounded-xl bg-white/25 hover:bg-white/45 transition-colors cursor-pointer border border-white/20 space-y-1"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h5 className="text-[11px] font-bold text-[var(--text-primary)] leading-tight truncate">{event.title}</h5>
                        <span className="text-[7.5px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/60 text-[var(--text-tertiary)] border border-neutral-200/70 shrink-0">{event.tag}</span>
                      </div>
                      <p className="text-[9.5px] text-[var(--text-tertiary)] font-semibold">{event.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unified Quick Actions Matrix */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-semibold text-[var(--text-primary)]">
                  {[
                    { label: 'Create Task', icon: Plus, action: () => setShowAddTaskModal(true) },
                    { label: 'Audit cross', icon: Sliders, action: () => setActiveTab('survey') },
                    { label: 'Guides', icon: HelpCircle, action: () => setActiveTab('knowledge') },
                    { label: 'Forms lib', icon: FileCheck, action: () => setActiveTab('forms') },
                    { label: 'Workflows', icon: TrendingUp, action: () => setActiveTab('workflows') }
                  ].map((act, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => {
                        act.action();
                        addToast(`Launched Action: ${act.label}`);
                      }}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/30 hover:bg-white/250 border border-white/30 transition-colors premium-shadow"
                    >
                      <act.icon size={15} className="text-[var(--teal-primary)] shrink-0" />
                      <span className="leading-tight break-words text-[8px] font-extrabold uppercase tracking-wide">{act.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Security Context Panel */}
            <div className="pt-4 border-t border-white/20">
              <div className="bg-white/30 p-3.5 rounded-2xl space-y-1.5 text-[9.5px] text-[var(--text-secondary)] border border-white/30 premium-shadow">
                <div className="flex items-center gap-1 text-[var(--teal-primary)] font-bold mb-1">
                  <Lock size={11} />
                  <span>Cryptographic Security logs</span>
                </div>
                <div>Security clearance: <strong>Authorized Manager</strong></div>
                <div>Active verification: <strong className="text-emerald-700">Perfect Handshake</strong></div>
                <div className="text-[8.5px] text-[var(--text-tertiary)] italic leading-tight">Biometric Safe Mode verified. Patient health information (PHI) is hidden in collapsed view states.</div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* DETAILED INSPECTION DRAWER (MODAL OVERLAY) */}
      {inspectItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex justify-end"
          onClick={() => handleInspectLauncher(null)}
        >
          <div 
            className="w-full max-w-lg h-full bg-[var(--drawer-bg)] p-8 shadow-[0_18px_45px_rgba(82,77,75,0.14)] flex flex-col justify-between overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded">
                    Artifact Inspector
                  </span>
                  <h3 className="font-heading text-xl font-extrabold text-[var(--teal-primary)] pt-1">
                    {inspectItem.title || inspectItem.name}
                  </h3>
                </div>
                <button 
                  onClick={() => handleInspectLauncher(null)}
                  className="p-1.5 rounded-full hover:bg-white/35 text-[var(--text-tertiary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Inspector Tab Selector */}
              <div className="flex rounded-lg bg-neutral-200/50 p-1 border border-white">
                {['overview', 'evidence', 'biometric'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInspectTab(tab)}
                    className={cx(
                      "flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider",
                      inspectTab === tab ? "bg-[var(--teal-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {inspectTab === 'overview' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Inspector Metadata Rows */}
                  <div className="space-y-4 bg-white/250 p-5 rounded-2xl border border-white premium-shadow">
                    
                    {(inspectItem.id || inspectItem.policyId) && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Standard Identifier:</span>
                        <span className="font-mono font-bold text-[var(--teal-primary)] bg-white/80 px-2 py-0.5 rounded border shadow-sm">
                          {inspectItem.id || inspectItem.policyId}
                        </span>
                      </div>
                    )}

                    {inspectItem.severity && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Classification:</span>
                        <span className="font-bold text-[var(--text-secondary)]">{inspectItem.severity}</span>
                      </div>
                    )}

                    {inspectItem.accountability && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Responsible Role:</span>
                        <span className="font-bold text-[var(--text-secondary)]">{inspectItem.accountability}</span>
                      </div>
                    )}

                    {inspectItem.owner && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Assigned Owner:</span>
                        <span className="font-bold text-[var(--text-secondary)]">{inspectItem.owner}</span>
                      </div>
                    )}

                    {inspectItem.title22 && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">CA Title 22 Index:</span>
                        <span className="font-mono text-[var(--orange-primary)] font-bold">{inspectItem.title22}</span>
                      </div>
                    )}

                    {inspectItem.cop && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">CMS CoP Tag:</span>
                        <span className="font-mono text-[var(--orange-primary)] font-bold">{inspectItem.cop}</span>
                      </div>
                    )}

                    {inspectItem.due && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Due Schedule:</span>
                        <span className="font-bold text-[var(--orange-primary)]">{inspectItem.due}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs border-t pt-3 mt-1">
                      <span className="text-[var(--text-tertiary)] font-bold">Safe Lock Status:</span>
                      {sealedItems.has(inspectItem.id || inspectItem.policyId || inspectItem.title) ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                          <Lock size={12} className="text-emerald-600 animate-pulse" /> Cryptographically Sealed
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                          Pending Authentication
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inspector Narrative / Purpose */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                      Procedural Description & Scope
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-white/40 p-4 rounded-xl border border-white shadow-inner">
                      {inspectItem.description || inspectItem.desc || inspectItem.notes || 'Full legal scope verified under Medicare statutory provisions.'}
                    </p>
                  </div>
                </div>
              )}

              {inspectTab === 'evidence' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                      Verifiable Compliance Evidence Pack
                    </h4>
                    
                    {inspectItem.evidence && inspectItem.evidence.length > 0 ? (
                      <div className="space-y-2">
                        {inspectItem.evidence.map((ev, index) => (
                          <div 
                            key={index} 
                            onClick={() => {
                              setSelectedMockDoc(ev);
                              addToast(`Decompressing secure ledger document preview: "${ev}"`);
                            }}
                            className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] bg-white/60 p-3 rounded-xl border border-white premium-shadow hover:bg-[var(--teal-primary)]/5 cursor-pointer transition-colors"
                          >
                            <FileText size={14} className="text-[var(--teal-primary)] shrink-0" />
                            <span className="font-semibold underline text-[var(--text-primary)]">{ev}</span>
                            <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shadow-sm border border-emerald-200">
                              Verified Upload
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-[var(--text-tertiary)] bg-white/20 rounded-xl border border-dashed border-neutral-300">
                        No explicit evidence files attached yet. Add a document in the biometric signature tab.
                      </div>
                    )}
                  </div>

                  {/* Interactive mock spreadsheet / document viewer inside side panel */}
                  {selectedMockDoc && mockDocViewerData[selectedMockDoc] && (
                    <div className="p-5 rounded-2xl bg-white/80 text-[var(--text-primary)] border border-neutral-200 space-y-3 shadow-[0_18px_45px_rgba(82,77,75,0.14)] animate-fadeIn relative font-mono text-[11px] leading-relaxed select-text">
                      <button 
                        onClick={() => setSelectedMockDoc(null)}
                        className="absolute right-3 top-3 text-[var(--text-tertiary)] hover:text-[var(--teal-primary)] p-1"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2 text-[var(--teal-primary)] font-bold">
                        <FileSpreadsheet size={13} />
                        <span>PREVIEW: {mockDocViewerData[selectedMockDoc].title}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Uploaded: {mockDocViewerData[selectedMockDoc].date} | Author: {mockDocViewerData[selectedMockDoc].author}
                      </div>
                      <pre className="whitespace-pre-wrap bg-white/75 p-3 rounded border border-neutral-200 max-h-[180px] overflow-y-auto">
                        {mockDocViewerData[selectedMockDoc].content}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {inspectTab === 'biometric' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-white/40 p-5 rounded-2xl border border-white space-y-4 premium-shadow">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                      Biometric Authorization Matrix
                    </h4>
                    
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      To lock this compliance block, Robert P. must authenticate this transaction with their signature and seal.
                    </p>

                    {/* Attestation check */}
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasAgreedCheck} 
                        onChange={() => setHasAgreedCheck(!hasAgreedCheck)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[var(--teal-primary)] focus:ring-[var(--teal-primary)]"
                      />
                      <span className="text-[11px] text-[var(--text-secondary)] leading-normal font-medium">
                        I declare under penalty of perjury that this evidence satisfies all applicable California Title 22 state directives and Conditions of Participation rules.
                      </span>
                    </label>

                    {/* Typed signature field */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider block">Type Your Full Name to Sign</label>
                      <input 
                        type="text" 
                        value={sigText}
                        onChange={(e) => setSigText(e.target.value)} // FIXED BUG: previously settingnewTaskTitle instead of sigText!
                        placeholder="Robert Patel"
                        className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--teal-primary)]"
                      />
                    </div>

                    {/* Styled signature preview */}
                    {sigText && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200 text-center relative overflow-hidden">
                        <div className="absolute top-1 left-2 text-[8px] font-bold uppercase text-[var(--text-tertiary)] font-mono">Simulated Attestation Sign-off</div>
                        <div className="font-signature text-xl text-[var(--teal-primary)] py-2 select-none">
                          {sigText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-black/5 flex gap-3">
              <button 
                onClick={handleSealAndAuthorize}
                className="flex-1 bg-[var(--teal-primary)] text-white text-xs font-bold py-2.5 rounded-lg hover:bg-[var(--teal-primary)]/90 transition-all flex items-center justify-center gap-1 shadow-md"
              >
                <Check size={14} /> Authorize & Seal
              </button>
              
              <button 
                onClick={() => {
                  addToast('Flagged internally for quality advisor review.', 'info');
                  handleInspectLauncher(null);
                }}
                className="px-4 py-2.5 border border-black/10 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-white/35 transition-colors whitespace-nowrap"
              >
                Flag Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PLANNER TASK (ACTION ITEM) MODAL */}
      {showAddTaskModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/18 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setShowAddTaskModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[var(--drawer-bg)] rounded-3xl p-7 space-y-6 shadow-[0_18px_45px_rgba(82,77,75,0.14)] animate-fadeIn border border-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[var(--teal-primary)]" />
                <h3 className="font-heading text-lg font-extrabold text-[var(--teal-primary)]">
                  Add Private Action Item
                </h3>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-full hover:bg-white/35 text-[var(--text-tertiary)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              
              {/* Action Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Action Item Title</label>
                <input 
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Audit patient OASIS records for Q1 deviations"
                  className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)]"
                />
              </div>

              {/* Task Due Date Context */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Timeline / Limit</label>
                  <select 
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Overdue by 1 day">Overdue by 1 day</option>
                    <option value="Due tomorrow">Due tomorrow</option>
                    <option value="Due Friday, June 19">Due Friday, June 19</option>
                    <option value="Due next Tuesday">Due next Tuesday</option>
                    <option value="No firm target">No firm target</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">State Category</label>
                  <select 
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Compliance">Compliance</option>
                    <option value="Clinical">Clinical</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Governance">Governance</option>
                    <option value="Training Logs">Training Logs</option>
                  </select>
                </div>
              </div>

              {/* Assignee & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Status</label>
                  <select 
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value)}
                    className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="overdue">Critical & Overdue</option>
                    <option value="upcoming">Upcoming Schedule</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Owner Role</label>
                  <select 
                    value={newTaskOwner}
                    onChange={(e) => setNewTaskOwner(e.target.value)}
                    className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none"
                  >
                    <option value="Clinical Manager">Clinical Manager</option>
                    <option value="Compliance Officer">Compliance Officer</option>
                    <option value="Director of Nursing">Director of Nursing</option>
                    <option value="CEO">CEO</option>
                  </select>
                </div>
              </div>

              {/* Task Notes / Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Operational Notes</label>
                <textarea 
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Notes, required signature files, or evidence checklists..."
                  className="w-full bg-white/70 border px-3 py-2.5 rounded-xl outline-none h-20 resize-none shadow-inner"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-[var(--teal-primary)] text-white py-2.5 rounded-xl font-bold hover:bg-[var(--teal-primary)]/90 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check size={14} /> Add to Workspace Planner
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-[var(--text-secondary)] font-bold hover:bg-white/35"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* COMMAND PALETTE MODAL PANEL (⌘K) */}
      {isCommandSearchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex items-start justify-center p-4 pt-[12vh]"
          onKeyDown={handleCommandSearchKey}
          onClick={() => setIsCommandSearchOpen(false)}
        >
          <div 
            className="w-full max-w-xl rounded-2xl bg-white/80 backdrop-blur-2xl p-5 space-y-4 animate-fadeIn border border-white shadow-[0_18px_45px_rgba(82,77,75,0.14)]"
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

            {/* Results stack list */}
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

      {/* FIXED SYSTEM NOTIFICATIONS TOASTS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-white/85 backdrop-blur-xl p-4.5 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/50 animate-fadeIn flex items-center gap-3 min-w-[300px] pointer-events-auto"
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