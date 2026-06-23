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
  Trash2,
  Settings,
  UserCheck,
  MessageSquare,
  Send,
  Sparkle
} from 'lucide-react';

const cx = (...classes) => classes.filter(Boolean).join(' ');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-[#F8F3F0] text-[#1F1C1B] rounded-xl m-6 border border-[#C74601]/30">
          <h2 className="text-lg font-bold text-[#C74601] mb-2">Something went wrong</h2>
          <pre className="text-xs bg-white/60 p-4 rounded-lg overflow-auto max-w-full text-[#524D4B] whitespace-pre-wrap">
            {String(this.state.error?.message || this.state.error || "Unknown error")}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-[#00797D] text-white font-bold rounded-lg text-xs hover:bg-[#00797D]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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

const InteractiveNavButton = ({ icon: Icon, label, active, onClick, isCollapsed, badge }) => {
  return (
    <div className="nav-btn-3d-wrapper w-full select-none">
      <button
        onClick={onClick}
        className={cx(
          "nav-btn-3d group w-full flex items-center justify-between rounded-xl p-3 text-xs font-semibold transition-all duration-300 transform-gpu cursor-pointer relative border",
          active 
            ? "nav-btn-active-glow text-[#00797D] border-[#00797D]/40 bg-[#00797D]/5" 
            : "text-[#524D4B] bg-white/10 border-white/20 hover:bg-white/30 hover:text-[#1F1C1B] hover:border-white/40",
          isCollapsed ? "justify-center h-11 w-11 mx-auto px-0" : "gap-3.5 px-4 py-3"
        )}
        title={label}
      >
        <div className="flex items-center gap-3 truncate">
          <Icon size={16} className={cx(
            "transition-all duration-300 group-hover:scale-110",
            active ? "text-[#00797D] drop-shadow-[0_2px_4px_rgba(0,121,125,0.25)]" : "text-[#524D4B]"
          )} />
          
          {!isCollapsed && (
            <span className={cx(
              "font-semibold transition-all duration-300 truncate tracking-wide text-[11px]",
              active ? "text-[#00797D] font-bold" : "text-[#524D4B] group-hover:text-[#1F1C1B]"
            )}>
              {label}
            </span>
          )}
        </div>

        {!isCollapsed && badge && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#C74601] text-white font-mono scale-90 font-bold shrink-0">
            {badge}
          </span>
        )}
      </button>
    </div>
  );
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('forms'); // Default view to Forms & Library
  const [adminSubTab, setAdminSubTab] = useState('user-groups'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(true);

  // Restoring the missing sidebar/ops control handlers
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

  // Compliance taxonomy filters
  const [filterSeverity, setFilterSeverity] = useState('ALL'); 
  const [filterType, setFilterType] = useState('ALL');
  const [filterDomain, setFilterDomain] = useState('ALL');

  // Command palette search states
  const [isCommandSearchOpen, setIsCommandSearchOpen] = useState(false);
  const [commandSearchQuery, setCommandSearchQuery] = useState('');
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(0);

  // Inspector attributes
  const [inspectItem, setInspectItem] = useState(null); 
  const [inspectTab, setInspectTab] = useState('overview'); 
  const [sigText, setSigText] = useState(''); 
  const [hasAgreedCheck, setHasAgreedCheck] = useState(false);

  // Brad AI Assistant (matching verbatim to image_dbb507.png & image_dbb48c.png)
  const [bradQuery, setBradQuery] = useState('');
  const [isBradTyping, setIsBradTyping] = useState(false);
  const [bradChatLog, setBradChatLog] = useState([
    { role: 'assistant', text: 'Hello, TJ! I am Brad, your Compliance Intelligence Copilot. Pick a suggested mission or query any federal/state code index.', type: 'welcome' }
  ]);
  const [activeBradWorkspaceDoc, setActiveBradWorkspaceDoc] = useState(null);
  const [bradActiveOutputTab, setBradActiveOutputTab] = useState('ANSWER'); 
  const [showBradPopupOverlay, setShowBradPopupOverlay] = useState(true);

  // Sandbox Identity Authorization State (matching admin-users__dark-full.png)
  const [sandboxPermission, setSandboxPermission] = useState('policy.approve');
  const [sandboxResource, setSandboxResource] = useState('demo-resource');

  // Help Center Manual search & reader states
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [activeManualArticle, setActiveManualArticle] = useState(null);

  // Users list from admin-users__dark-full.png
  const [usersList] = useState([
    { name: 'TJ Padilla', email: 'robertp@careindeed.com', role: 'Super Admin', status: 'ACTIVE', scope: 'org:careindeed-demo', date: '2026-01-01' },
    { name: 'Director Alvarez', email: 'dalvarez@careindeed.com', role: 'Admin', status: 'ACTIVE', scope: 'org:careindeed-clinical', date: '2025-05-12' },
    { name: 'Marie Chen, RN', email: 'mchen@careindeed.com', role: 'RN', status: 'ACTIVE', scope: 'org:careindeed-qapi', date: '2025-11-20' },
    { name: 'Robert Patel', email: 'rpatel@careindeed.com', role: 'LVN', status: 'ACTIVE', scope: 'org:careindeed-field', date: '2024-08-15' },
    { name: 'Sarah Ahmed', email: 'sahmed@careindeed.com', role: 'CHHA', status: 'ACTIVE', scope: 'org:careindeed-field', date: '2026-03-01' }
  ]);

  // Roles list from admin-roles__dark-full.png
  const [rolesList] = useState([
    { name: 'Super Admin', desc: 'Demo bootstrap admin with full Phase A permissions.', count: 18 },
    { name: 'Admin', desc: 'Operations administration and access lifecycle tasks.', count: 6 },
    { name: 'RN', desc: 'Clinical registered nurse role.', count: 8 },
    { name: 'LVN', desc: 'Clinical licensed vocational nurse role.', count: 8 },
    { name: 'CHHA', desc: 'Clinical home health aide role.', count: 7 },
    { name: 'Compliance', desc: 'Compliance and audit operations.', count: 10 },
    { name: 'Auditor', desc: 'Read-only evidence and audit review.', count: 5 },
    { name: 'Onboarding', desc: 'Onboarding specialist assignment role.', count: 5 },
    { name: 'Billing', desc: 'Billing workflow participant role.', count: 5 },
    { name: 'Director', desc: 'Director-level approvals and escalations.', count: 6 }
  ]);
  const [roleSearchTerm, setRolesSearchTerm] = useState('');

  // Permissions catalog from admin-permissions__dark-full.png
  const [permissionsCatalog] = useState([
    { name: 'policy.view', resource: 'policy', action: 'view', phi: 'no', desc: 'Read policy content.' },
    { name: 'policy.draft', resource: 'policy', action: 'draft', phi: 'no', desc: 'Edit policy draft content.' },
    { name: 'policy.approve', resource: 'policy', action: 'approve', phi: 'no', desc: 'Approve policy version.' },
    { name: 'policy.publish', resource: 'policy', action: 'publish', phi: 'no', desc: 'Publish approved policy version.' },
    { name: 'form.view', resource: 'form', action: 'view', phi: 'no', desc: 'Read form structure and status.' },
    { name: 'form.sign', resource: 'form', action: 'sign', phi: 'no', desc: 'Apply signature action on forms.' },
    { name: 'ceu.view', resource: 'ceu', action: 'view', phi: 'no', desc: 'Read CEU/workflow state.' },
    { name: 'ceu.assign', resource: 'ceu', action: 'assign', phi: 'no', desc: 'Assign CEU/workflow work.' },
    { name: 'ceu.execute', resource: 'ceu', action: 'execute', phi: 'no', desc: 'Execute CEU/workflow tasks.' },
    { name: 'ceu.complete', resource: 'ceu', action: 'complete', phi: 'no', desc: 'Complete CEU/workflow unit.' },
    { name: 'ceu.override', resource: 'ceu', action: 'override', phi: 'no', desc: 'Perform override flow with dual approval.' }
  ]);

  // User Groups seeds from admin-user-groups__dark-full.png
  const [userGroupsList] = useState([
    { group: 'Super Admin', desc: 'Demo bootstrap admin with full Phase A permissions.', permissions: ['policy.view', 'policy.draft', 'policy.approve', 'ceu.view', 'ceu.assign', 'ceu.execute', 'phi.read', 'phi.write', 'user.provision'] },
    { group: 'Admin', desc: 'Operations administration and access lifecycle tasks.', permissions: ['policy.view', 'form.view', 'ceu.view'] },
    { group: 'RN', desc: 'Clinical registered nurse role.', permissions: ['policy.view', 'form.view', 'form.sign', 'phi.write'] },
    { group: 'LVN', desc: 'Clinical licensed vocational nurse role.', permissions: ['policy.view', 'form.view', 'form.sign', 'phi.write'] },
    { group: 'CHHA', desc: 'Clinical home health aide role.', permissions: ['policy.view', 'form.view', 'form.sign'] }
  ]);

  // Forms catalog from forms__dark-full.png with light mode tag mappings
  const [formsData] = useState([
    { id: 'EN-FM-001', title: 'Universal Policy Acknowledgment Form', type: 'Attestation', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Requires signed baseline certification from all personnel acknowledging the current home health operational mandates.', accountability: 'Administrator', purpose: 'Standardized worksheet of annual policy compliance.', evidence: ['Signature packet', 'Version receipt log'], domain: 'Governance', tags: ['MASTER TEMPLATE', 'SHARED ENTERPRISE', 'DIGITAL CANDIDATE', 'ATTESTATION'], mapTarget: 'ALL (278 Policies)' },
    { id: 'EN-FM-002', title: 'Master Policy Index / Taxonomy Register', type: 'Tracking Tool', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Consolidated reference ledger matching administrative policies with corresponding state and federal tags.', accountability: 'Director of Quality Assurance', purpose: 'Maintains an auditable log of document versions and cross-references.', evidence: ['Taxonomy sheet', 'Review log'], domain: 'Compliance', tags: ['MASTER TEMPLATE', 'SHARED ENTERPRISE', 'TRACKING TOOL'], mapTarget: 'EN-TG-001' },
    { id: 'EN-FM-003', title: 'Policy Classification Tier Matrix', type: 'Matrix', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Categorizes operational procedures by threat vector levels, safety impacts, and clinical impact indexes.', accountability: 'Clinical Manager', purpose: 'Determines document review schedules and executive sign-off hierarchy.', evidence: ['Tier index', 'Procedural guide'], domain: 'Compliance', tags: ['MATRIX', 'REQUIRED', 'ANNUAL'], mapTarget: 'EN-TG-001' },
    { id: 'EN-FM-004', title: 'Domain Owner Assignment Roster', type: 'Tracking Tool', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Assigns operational accountability for specific federal COP rules to key clinical staff leaders.', accountability: 'Compliance Officer', purpose: 'Enforces department-level accountability for evidence packages.', evidence: ['Roster mapping', 'CoP ledger'], domain: 'Human Resources', tags: ['SHARED ENTERPRISE', 'TRACKING TOOL', 'REQUIRED'], mapTarget: 'EN-TG-001' },
    { id: 'EN-FM-005', title: 'Regulatory Crosswalk Template', type: 'Template', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Custom mapping tool detailing how standard clinical tasks align with ACHC guidelines and California Title 22.', accountability: 'QAPI Lead / Chair', purpose: 'Generates evidence matrices for regulatory surveyors.', evidence: ['Crosswalk mapping', 'Title 22 matrix'], domain: 'Clinical Ops', tags: ['AUDIT CRITICAL', 'MASTER TEMPLATE', 'TEMPLATE'], mapTarget: 'EN-TG-002' },
    { id: 'EN-FM-006', title: 'Compliance Gap Analysis Worksheet', type: 'Worksheet', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Analytical ledger to cross-examine current documentation states against mandated performance benchmarks.', accountability: 'Director of Nursing', purpose: 'Documents internal remediation plans for missing elements.', evidence: ['Remediation plan', 'Gap review log'], domain: 'Clinical Ops', tags: ['AUDIT CRITICAL', 'WORKSHEET', 'REQUIRED', 'ANNUAL'], mapTarget: 'EN-TG-002' },
    { id: 'EN-FM-007', title: 'Policy Development & Revision Template', type: 'Template', severity: 'MASTER TEMPLATE', status: 'REQUIRED', description: 'Outlines standard structure and header formats for policy documents.', accountability: 'Director of Quality Assurance', purpose: 'Provides standardized template for draft creations.', evidence: ['Template PDF'], domain: 'Governance', tags: ['MASTER TEMPLATE', 'TEMPLATE', 'REQUIRED'], mapTarget: 'EN-LC-001' },
    { id: 'EN-FM-008', title: 'Policy Approval Routing Form', type: 'Form', severity: 'DIGITAL CANDIDATE', status: 'REQUIRED', description: 'Routes draft policies through sequence of clinical, operational, and board approvals.', accountability: 'Compliance Officer', purpose: 'Logs all intermediate sign-offs.', evidence: ['Routing signature stack'], domain: 'Governance', tags: ['DIGITAL CANDIDATE', 'REQUIRED', 'FORM'], mapTarget: 'EN-LC-001' },
    { id: 'EN-FM-009', title: 'Version Control Change Log', type: 'Log', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Consolidated reference ledger matching standard administrative policies with corresponding version updates.', accountability: 'Director of Nursing', purpose: 'Audit trace of updates.', evidence: ['CSV change records'], domain: 'Compliance', tags: ['AUDIT CRITICAL', 'LOG', 'REQUIRED'], mapTarget: 'EN-TG-002' },
    { id: 'EN-FM-010', title: 'Annual Policy Review Schedule', type: 'Tracking Tool', severity: 'SHARED ENTERPRISE', status: 'REQUIRED', description: 'Outlines review calendars across clinical domains over next fiscal calendar.', accountability: 'Administrator', purpose: 'Validates proactive reviews.', evidence: ['Calendar schema'], domain: 'Operations', tags: ['SHARED ENTERPRISE', 'TRACKING TOOL', 'REQUIRED', 'ANNUAL'], mapTarget: 'EN-TG-001' },
    { id: 'EN-FM-011', title: 'Policy Exception / Waiver Request Form', type: 'Form', severity: 'DIGITAL CANDIDATE', status: 'HIGH RISK', description: 'Application form to request temporary deviations from standardized core policies.', accountability: 'Compliance Officer', purpose: 'Evaluates variance hazards.', evidence: ['Exception files'], domain: 'Finance', tags: ['DIGITAL CANDIDATE', 'HIGH RISK', 'REQUIRED'], mapTarget: 'EN-LC-001' },
    { id: 'EN-FM-012', title: 'Exception & Waiver Tracking Log', type: 'Tracking Tool', severity: 'AUDIT CRITICAL', status: 'REQUIRED', description: 'Consolidated reference tracking log of all active waivers and exception permits.', accountability: 'QAPI Lead / Chair', purpose: 'State regulatory reporting.', evidence: ['Waiver logs'], domain: 'Finance', tags: ['AUDIT CRITICAL', 'TRACKING TOOL', 'REQUIRED'], mapTarget: 'EN-TG-002' }
  ]);

  // Detailed content matching help-center__main-view__dark-fullpage.png titles
  const manualArticlesData = [
    { title: "First Login: Set Your Permanent Password", text: "To establish safe-mode access, navigate to Identity Admin -> User Management. Select your clinician account profile, choose Edit, and input your primary authentication sequence. Session security rules enforce automatic token expiration cycles every 12 hours.", category: "Getting Started" },
    { title: "Welcome to CI-App eSign", text: "CareIndeed's safe-mode compliance engine uses dual attestation check gates. When opening any standardized compliance template in the Forms Library, you must declare and sign under penalty of perjury.", category: "Getting Started" },
    { title: "Roles, Tiers & Permissions", text: "Our authorization catalog restricts sensitive clinical operations to authorized roles. Tiers range from clinical home health aides (CHHA) up to Super Admin (unlimited credential override & publishing logs).", category: "Getting Started" },
    { title: "Navigation & Workspace Layout", text: "Configure sidebar states to toggle panel views quickly. Expand Personal Operations (top right RP icon) to detail outstanding audits, active scheduler, and immediate quick-actions.", category: "Getting Started" },
    { title: "Policy Lifecycle Workspace - Overview", text: "This reference details draft, review, authorization, and publish states governed by California Title 22 state mandates and CMS federal guidelines.", category: "Policy Lifecycle" },
    { title: "Tier & Taxonomy Definitions", text: "Policies are scoped inside strict classification tiers (Critical, High Risk, Standard). Each document is dynamically cross-coded against federal Medicare tags.", category: "Policy Lifecycle" },
    { title: "Required Read/Acknowledgment", text: "Standard operational worksheets enforce annual read-receipt logs from all active nurses to satisfy state quality assurance audits.", category: "Policy Lifecycle" },
    { title: "Version History & Archiving a Policy", text: "Audit trails track historical revisions. Deleted policies are frozen inside immutable legal archive directories.", category: "Policy Lifecycle" },
    { title: "Step 1: The Disclosure Gateway", text: "The compliance process initiates with mandatory disclosure notices outlining Title 22 rules.", category: "Signing Documents" },
    { title: "Step 2: Identity Verification", text: "Authenticate your clinical clearance using local biometric checks or authorized login keys.", category: "Signing Documents" },
    { title: "Step 3: The Document Review", text: "Examine detailed policy scope, mapped statutory guidelines, and required attestation statements.", category: "Signing Documents" },
    { title: "Step 4: Signature & Lock", text: "Type your full legal name to generate cursive signatures and seal the evidence bundle.", category: "Signing Documents" }
  ];

  const [uatCheckpoints, setUatCheckpoints] = useState([
    { id: 1, label: 'Review operational posture', completed: true, tabHint: 'forms', desc: 'Visited the Forms Index Registry to analyze template alignments.' },
    { id: 2, label: 'Open and execute tasks with Brad', completed: false, tabHint: 'brad', desc: 'Fired an AI compliance query or clicked an active suggestions mission.' },
    { id: 3, label: 'Validate sandbox permissions', completed: false, tabHint: 'admin', desc: 'Ran evaluation testing inside the Authorization Preview sandbox.' },
    { id: 4, label: 'Complete required forms', completed: false, tabHint: 'forms', desc: 'Opened any standardized form from the Enterprise Forms Library.' },
    { id: 5, label: 'Search Help Center articles', completed: false, tabHint: 'helpcenter', desc: 'Discovered step-by-step instructions in Help manuals.' },
    { id: 6, label: 'Upload and verify evidence', completed: false, tabHint: 'forms', desc: 'Authorized or sealed a verification evidence package.' }
  ]);
  const [isUatChecklistExpanded, setIsUatChecklistExpanded] = useState(true);
  const [keepChecklistVisible, setKeepChecklistVisible] = useState(true);

  // Dynamic sandbox evaluator rules
  const evaluateSandboxAccess = () => {
    const isSensitive = sandboxPermission.startsWith('phi') || sandboxPermission.includes('override') || sandboxResource.toLowerCase().includes('phi') || sandboxResource.toLowerCase().includes('patient');
    
    if (isSensitive) {
      return {
        allowed: false,
        code: 'DENY — security.phi_block',
        desc: 'PHI parameters are strictly protected. Demo environment clearance rejected. Access permitted only on audited, isolated production nodes.'
      };
    }
    
    if (sandboxResource.toLowerCase().includes('restricted') || sandboxResource.toLowerCase().includes('board')) {
      return {
        allowed: false,
        code: 'DENY — policy.approval_override_required',
        desc: 'Evaluator requires dual-party clinical director signatures to execute tasks inside restricted namespaces.'
      };
    }

    return {
      allowed: true,
      code: 'ALLOW — allow.granted',
      desc: 'Permission granted by deterministic Phase A authorize evaluation.'
    };
  };

  const sandboxOutcome = evaluateSandboxAccess();

  // Guided checklist progress updating function
  const updateUatProgress = (checkpointId) => {
    setUatCheckpoints(prev => prev.map(checkpoint => {
      if (checkpoint.id === checkpointId && !checkpoint.completed) {
        addToast(`UAT Checkpoint Completed: "${checkpoint.label}"`, 'success');
        return { ...checkpoint, completed: true };
      }
      return checkpoint;
    }));
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    
    // Check if matching checkpoint is satisfied
    if (tabName === 'forms') {
      updateUatProgress(1); // Review posture
    } else if (tabName === 'brad') {
      updateUatProgress(2); // Brad execute
    } else if (tabName === 'admin') {
      updateUatProgress(3); // Permissions validate
    } else if (tabName === 'helpcenter') {
      updateUatProgress(5); // Search Help articles
    }
  };

  const handleRolesSearch = (e) => {
    setRolesSearchTerm(e.target.value);
  };

  const filteredRoles = rolesList.filter(role => {
    return role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
           role.desc.toLowerCase().includes(roleSearchTerm.toLowerCase());
  });

  const runBradCommand = (queryText) => {
    updateUatProgress(2); // satisfies "Open and execute tasks with Brad"
    setBradQuery(queryText);
    
    const userLog = [...bradChatLog, { role: 'user', text: queryText }];
    setBradChatLog(userLog);
    setIsBradTyping(true);

    addToast(`Executing query on Brad: "${queryText}"`, 'info');

    // Simulated Response matching image_dbb507.png expectations in Light mode
    setTimeout(() => {
      let bradReply = "";
      let loadedDoc = null;

      if (queryText.includes("Run pre-survey audit")) {
        bradReply = "Pre-survey audit completed successfully! Identified 2 QAPI clinical record outliers under Medicare 42 CFR §484.55. Mapped Title 22 reference guidelines CCR §74695.";
        loadedDoc = {
          title: "Pre-Survey Audit Diagnostics Package",
          id: "AUD-SURV-2026",
          body: "CMS Home Health Survey Criteria Assessment.\nOutliers detected: 2 (OASIS validation error, mock disaster sign-off missing).\nStatus: Remediation Recommended."
        };
      } else if (queryText.includes("Identify QAPI gaps") || queryText.includes("Identify compliance gaps") || queryText.includes("Identify compliance gaps in QAPI")) {
        bradReply = "QAPI gap detection analyzed: Infection Control reviews (CL-CA-005) are lacking verified supervisory signatures. Recommending immediate mock audit execution.";
        loadedDoc = {
          title: "Infection Control QAPI Gap Analysis",
          id: "QAPI-GAP-IC",
          body: "Reviewing 30-day episode guidelines under ACHC criteria HHI-2A.01.\nDiscovered 8% deviation in hand hygiene log attestation consistency."
        };
      } else if (queryText.includes("governing body forms") || queryText.includes("Show missing governing body forms")) {
        bradReply = "Retrieving corporate governance templates: Found EN-FM-003 and EN-FM-004. EN-FM-008 Policy Approval Routing Form is set to 'Digital Candidate' and is ready for committee draft completion.";
        loadedDoc = {
          title: "Missing Governing Body Assessment Matrix",
          id: "GOV-MATRIX-Q2",
          body: "Consolidated reference ledger matching standard board administrative policies with CA Title 22 requirements."
        };
      } else {
        bradReply = `Search executed in internal CareIndeed corpus. Matches found in section 22 CCR §74695 (Comprehensive Assessment). Proposing update to clinician policy guides.`;
        loadedDoc = {
          title: `Brad Custom Search: ${queryText}`,
          id: "SEARCH-RESULT",
          body: `Direct response mapped to query: "${queryText}". Mapped to organizational security catalog under HIPAA rules.`
        };
      }

      setBradChatLog(prev => [...prev, { role: 'assistant', text: bradReply, type: 'result' }]);
      if (loadedDoc) {
        setActiveBradWorkspaceDoc(loadedDoc);
      }
      setIsBradTyping(false);
    }, 800);
  };

  const commandSearchResults = [
    ...formsData.map(f => ({ type: 'COMPLIANCE FORM', id: f.id, title: f.title, action: () => { setActiveTab('forms'); setInspectItem(f); } })),
    ...permissionsCatalog.map(p => ({ type: 'SECURITY PERMISSION', id: p.name, title: p.desc, action: () => { setActiveTab('admin'); setAdminSubTab('permissions'); } }))
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
    const matchesDomain = filterDomain === 'ALL' || form.domain === filterDomain;
    return matchesSearch && matchesSeverity && matchesType && matchesDomain;
  });

  // Filter manuals for Help center
  const filteredArticles = manualArticlesData.filter(article => {
    return article.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) ||
           article.text.toLowerCase().includes(knowledgeSearch.toLowerCase());
  });

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleInspectLauncher = (item) => {
    updateUatProgress(4); // Satisfy check: Complete required forms
    setInspectItem(item);
    setInspectTab('overview');
    setSigText('');
    setHasAgreedCheck(false);
  };

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Visual Design Core Tokens & Animations (Clean Light Peach Glass Theme Verbatim) */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-atm: transparent;
          --bg-workspace: transparent;
          --bg-sidebar: transparent;
          --bg-header: transparent;
          
          --border-main: transparent;
          --border-card: rgba(255, 255, 255, 0.55);
          --border-card-hover: rgba(0, 121, 125, 0.35);
          
          --bg-card: rgba(255, 255, 255, 0.42);
          --text-primary: #1F1C1B;
          --text-secondary: #524D4B;
          --text-tertiary: #74706F;
          
          --bg-tab-pill: rgba(255, 255, 255, 0.45);
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
            radial-gradient(circle at 12% 15%, rgba(199, 70, 1, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 85% 75%, rgba(0, 121, 125, 0.14) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255, 218, 198, 0.42) 0%, transparent 60%),
            radial-gradient(circle at 90% 10%, rgba(229, 254, 255, 0.6) 0%, transparent 45%);
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
          background: rgba(255, 255, 255, 0.55);
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
            0 0 16px rgba(0, 121, 125, 0.25), 
            inset 0 1.5px 3px rgba(255, 255, 255, 0.65),
            inset -1px -2px 3px rgba(0, 121, 125, 0.08) !important;
        }

        /* Deep Visual-Grade Shadows on Cards and Panels */
        .premium-shadow {
          box-shadow: 
            0 12px 32px -8px rgba(0, 0, 0, 0.05),
            0 4px 12px -3px rgba(0, 0, 0, 0.02),
            inset 0 1px 0 rgba(255, 255, 255, 0.95);
        }
        .hover\\:shadow-depth {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hover\\:shadow-depth:hover {
          box-shadow: 
            0 28px 54px -12px rgba(199, 70, 1, 0.05),
            0 10px 24px -5px rgba(0, 121, 125, 0.04),
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
          background-color: rgba(255, 255, 255, 0.48);
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
      <header className="flex h-[76px] w-full flex-shrink-0 items-center justify-between px-6 md:px-9 bg-white/20 backdrop-blur-[33px] relative z-30 border-b border-white/25 select-none shadow-sm animate-fadeIn">
        
        {/* Brand logo container */}
        <div className="flex items-center gap-3 w-auto md:w-[265px] shrink-0 pr-4">
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
              <span className="truncate">Search policies, compliance keys, tasks...</span>
              <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono text-[var(--text-secondary)] shadow-sm shrink-0 ml-2">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* TOP RIGHT PROFILE ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={() => {
              addToast('System integrity status: 100% Correct. All cryptographic compliance signatures match.', 'success');
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
              "flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md ml-2 relative border-2 border-white/70 cursor-pointer",
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
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Sidebar Navigation Links focusing strictly on provided Pageviews */}
          <div className="flex-1 space-y-7 overflow-y-auto px-4 py-2 select-none">
            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Primary Operations
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={FileCheck} 
                  label="Forms & Library" 
                  active={activeTab === 'forms'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => handleTabChange('forms')} 
                />

                <InteractiveNavButton 
                  icon={MessageSquare} 
                  label="Brad (AI Assistant)" 
                  active={activeTab === 'brad'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => handleTabChange('brad')} 
                  badge="AI"
                />
              </div>
            </div>

            <div>
              {!isSidebarCollapsed && (
                <h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                  Administration
                </h3>
              )}
              <div className="space-y-3">
                <InteractiveNavButton 
                  icon={Settings} 
                  label="Identity Admin" 
                  active={activeTab === 'admin'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => handleTabChange('admin')} 
                  badge="Ph-A"
                />

                <InteractiveNavButton 
                  icon={HelpCircle} 
                  label="Help Center" 
                  active={activeTab === 'helpcenter'} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => handleTabChange('helpcenter')} 
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
          
          {/* TAB 1: ENTERPRISE COMPLIANCE LIBRARY (Matching forms__dark-full.png in Light Mode) */}
          {activeTab === 'forms' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-none-structure">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/20">
                    Standardized Operations Worksheets
                  </span>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                    Enterprise Forms Library
                  </h1>
                </div>

                {/* Counters and Export */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/40 p-1 rounded-full border border-white/50 text-[11px] font-extrabold text-[var(--teal-primary)] premium-shadow">
                    <button 
                      onClick={() => addToast('Viewing policy index matrices...')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--teal-primary)] text-white shadow-sm cursor-pointer font-semibold"
                    >
                      <FileCheck size={13} /> 269 POLICIES
                    </button>
                    <button 
                      onClick={() => addToast('Viewing forms index worksheets...')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/30 text-[var(--text-secondary)] cursor-pointer font-semibold"
                    >
                      <Layers size={13} /> 361 FORMS
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      updateUatProgress(6); // Satisfies checklist item 6
                      addToast('Filing local export package to regulatory secure folders...', 'success');
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--orange-primary)] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[var(--orange-primary)]/90 transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={13} /> EXPORT
                  </button>
                </div>
              </div>

              {/* Filter Matrix Controls */}
              <div className="bg-white/25 backdrop-blur-[33px] p-5 rounded-2xl border border-white/40 space-y-4 premium-shadow">
                
                {/* Domain filters row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] w-28 shrink-0">ALL DOMAINS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'Governance', 'Clinical Ops', 'QAPI', 'Human Resources', 'Compliance', 'Finance', 'Operations'].map(domain => (
                      <button
                        key={domain}
                        onClick={() => {
                          setFilterDomain(domain);
                          addToast(`Filtering by domain: ${domain}`);
                        }}
                        className={cx(
                          "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                          filterDomain === domain 
                            ? "bg-[var(--teal-primary)] text-white font-bold" 
                            : "bg-white/45 text-[var(--text-secondary)] hover:bg-white/80"
                        )}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level / Classification tags row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] w-28 shrink-0">ALL TIER PERMITS:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'MASTER TEMPLATE', 'AUDIT CRITICAL', 'SHARED ENTERPRISE', 'HIGH RISK', 'DIGITAL CANDIDATE'].map(sev => (
                      <button
                        key={sev}
                        onClick={() => {
                          setFilterSeverity(sev);
                          addToast(`Filtering classification: ${sev}`);
                        }}
                        className={cx(
                          "px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer",
                          filterSeverity === sev 
                            ? "bg-[var(--teal-primary)] text-white font-bold" 
                            : "bg-white/45 text-[var(--text-secondary)] hover:bg-white/80"
                        )}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text search field */}
                <div className="relative max-w-md pt-2 border-t border-white/20">
                  <Search size={14} className="absolute left-3.5 top-[58%] -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forms by index, tag, or responsibility..."
                    className="w-full bg-white/30 backdrop-blur-md border border-white/50 pl-10 pr-4 py-2.5 text-xs rounded-full outline-none focus:bg-white/60 transition-all text-[var(--text-primary)] placeholder-[var(--text-tertiary)] premium-shadow"
                  />
                </div>
              </div>

              {/* Forms grid representation */}
              {filteredForms.length === 0 ? (
                <div className="p-16 text-center text-xs text-[var(--text-secondary)] bg-white/10 rounded-2xl border border-white/20">
                  No compliance documents match your selected filters. Reset search parameters above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredForms.map((form) => (
                    <SpotlightCard 
                      key={form.id} 
                      onClick={() => handleInspectLauncher(form)} 
                      className="p-5 flex flex-col justify-between h-[280px] cursor-pointer premium-shadow hover:shadow-depth"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold font-mono text-[var(--teal-primary)] bg-white/250 px-2 py-0.5 rounded border border-white/30">
                            {form.id}
                          </span>
                          <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/40 text-[var(--text-secondary)] border border-neutral-200/70 shadow-sm">
                            {form.severity}
                          </span>
                        </div>
                        
                        <h3 className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                          {form.title}
                        </h3>
                        
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                          {form.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {form.tags.slice(0, 3).map((tg, i) => (
                            <span key={i} className="text-[8px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/60 text-[var(--teal-primary)] border border-white/30">
                              {tg}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/20 flex flex-col gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                        <div className="flex justify-between">
                          <span>Mapped Policies:</span>
                          <span className="font-extrabold text-[var(--teal-primary)] truncate max-w-[130px]">{form.mapTarget}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Owner:</span>
                          <span className="font-extrabold text-[var(--text-secondary)] truncate max-w-[130px]">{form.accountability}</span>
                        </div>
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BRAD THE COMPLIANCE AI ASSISTANT (Matching verbatim to image_dbb507.png & image_dbb48c.png in Light Mode) */}
          {activeTab === 'brad' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--teal-primary)]">
                      COMPLIANCE INTELLIGENCE
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-[var(--text-tertiary)]">BRAD INTERNAL CORPUS • GROUNDED ANSWERS ONLY</span>
                  </div>
                  <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)] mt-1">
                    Brad iAdministrator
                  </h1>
                </div>
              </div>

              {/* Layout matching parameters in image_dbb507.png */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                
                {/* Brad Prompt Interface Panel */}
                <div className="xl:col-span-2 flex flex-col justify-between bg-white/25 p-6 rounded-2xl border border-white/40 space-y-6 premium-shadow">
                  
                  {/* Assistant Header Intro Card */}
                  <div className="flex items-center gap-3.5 bg-white/250 p-4 rounded-xl border border-white/60 shadow-sm">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-[var(--teal-primary)]/10 border border-[var(--teal-primary)]/20 flex items-center justify-center shrink-0">
                      <Sparkles size={22} className="text-[var(--teal-primary)] animate-spin-slow" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Hello, TJ, I am Brad!</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium">Ask me any clinical policy details, Title 22, CMS Conditions of Participation, or QAPI audit guidelines.</p>
                    </div>
                  </div>

                  {/* Suggestion Missions Chips */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider block">SUGGESTED MISSIONS</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Run pre-survey audit',
                        'Identify compliance gaps in QAPI',
                        'governing body forms',
                        'Open plan of care policy',
                        'Create governing body brief for CMIA risk',
                        'What is required before billing a Medicare claim?'
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => runBradCommand(item)}
                          className="px-3.5 py-1.5 rounded-full bg-white/45 hover:bg-[var(--teal-primary)]/10 text-[10px] font-semibold text-[var(--text-secondary)] hover:text-[var(--teal-primary)] border border-white/60 hover:border-[var(--teal-primary)]/30 transition-all select-none cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Output Navigation Tab Bar */}
                  <div className="flex flex-wrap gap-1.5 border-b border-white/20 pb-2.5">
                    {['ANSWER', 'PRE-SURVEY AUDIT', 'ACTION PLAN', 'GOVERNING BODY', 'QAPI DIGEST', 'KNOWLEDGE ARTICLE'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => {
                          setBradActiveOutputTab(tab);
                          addToast(`Viewing output category: ${tab}`);
                        }}
                        className={cx(
                          "px-3 py-1.5 rounded text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer",
                          bradActiveOutputTab === tab 
                            ? "bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/30 font-extrabold" 
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Log Viewport */}
                  <div className="bg-white/20 p-4 rounded-xl border border-neutral-200/70 min-h-[160px] max-h-[250px] overflow-y-auto space-y-4">
                    {bradChatLog.map((chat, idx) => (
                      <div key={idx} className={cx("flex flex-col text-xs", chat.role === 'user' ? "items-end" : "items-start")}>
                        <span className="text-[9px] font-extrabold uppercase text-[var(--text-tertiary)] mb-1">
                          {chat.role === 'user' ? 'TJ Padilla' : 'Brad Compliance Engine'}
                        </span>
                        <div className={cx(
                          "p-3 rounded-xl max-w-[85%] leading-relaxed shadow-sm border",
                          chat.role === 'user' 
                            ? "bg-[var(--teal-primary)]/10 text-[var(--text-primary)] border-[var(--teal-primary)]/20" 
                            : "bg-white/60 text-[var(--text-secondary)] border-white/80"
                        )}>
                          {chat.text}
                        </div>
                      </div>
                    ))}
                    {isBradTyping && (
                      <div className="flex flex-col items-start text-xs">
                        <span className="text-[9px] font-extrabold uppercase text-[var(--text-tertiary)] mb-1">
                          Brad Compliance Engine
                        </span>
                        <div className="p-3 rounded-xl bg-white/60 text-[var(--text-secondary)] border-white/80 border flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Query Bar */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (bradQuery.trim()) {
                        runBradCommand(bradQuery);
                      }
                    }}
                    className="relative"
                  >
                    <input 
                      type="text"
                      value={bradQuery}
                      onChange={(e) => setBradQuery(e.target.value)}
                      placeholder="Issue a compliance command or reference a policy/form ID..."
                      className="w-full bg-white/45 border border-white/80 pl-4 pr-12 py-3.5 text-xs rounded-xl text-[var(--text-primary)] outline-none focus:border-[var(--teal-primary)] shadow-inner placeholder-[var(--text-tertiary)]"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-[var(--orange-primary)] hover:bg-[var(--orange-primary)]/90 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>

                {/* Brad Right Workspace Panel */}
                <div className="bg-white/25 p-6 rounded-2xl border border-white/40 flex flex-col justify-between space-y-4 premium-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/25">
                      <span className="text-[10px] font-extrabold tracking-wider text-[var(--teal-primary)] uppercase">
                        Brad Workspace Reference
                      </span>
                      <FileText size={14} className="text-[var(--text-tertiary)]" />
                    </div>

                    {activeBradWorkspaceDoc ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <span className="text-[9px] font-mono text-[var(--text-tertiary)] uppercase block">DOC ID: {activeBradWorkspaceDoc.id}</span>
                          <h4 className="text-xs font-bold text-[var(--text-primary)] leading-snug">{activeBradWorkspaceDoc.title}</h4>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line bg-white/40 p-4 rounded-xl border border-white">
                          {activeBradWorkspaceDoc.body}
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-[11px] text-[var(--text-tertiary)] italic space-y-2">
                        <span>No reference loaded. Ask Brad a question or click a suggestions chip to populate references.</span>
                        <p className="text-[9px]">Grounded against standard corporate policies cataloged in Help Manuals.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/20 flex gap-2">
                    <button 
                      onClick={() => {
                        if (activeBradWorkspaceDoc) {
                          addToast(`Exported "${activeBradWorkspaceDoc.title}" to local audit workspace.`, 'success');
                        } else {
                          addToast('No document loaded to export.', 'error');
                        }
                      }}
                      className="flex-1 py-2 rounded bg-white/40 hover:bg-white/60 text-[10px] font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all cursor-pointer border border-white/50"
                    >
                      Export File
                    </button>
                    <button 
                      onClick={() => setActiveBradWorkspaceDoc(null)}
                      className="px-3 py-2 rounded bg-white/30 hover:bg-rose-500/10 text-[10px] font-bold text-[#C74601] border border-white/50 cursor-pointer"
                      title="Clear Workspace"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: IDENTITY ADMIN PORTAL (Matching all four admin-*.png views in Light Mode) */}
          {activeTab === 'admin' && (
            <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none text-[var(--text-primary)]">
              
              {/* Header Context */}
              <div className="space-y-2 pb-4 border-b border-white/20">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)]">
                  IDENTITY COMPLIANCE SYSTEM
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Phase A Identity Admin
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">
                  Deterministic Access management constrained to Phase A foundation criteria. Intentionally isolated from direct patient clinical identifiers.
                </p>
              </div>

              {/* Tab selector mirroring picture controls */}
              <div className="flex gap-2.5 pb-2 border-b border-neutral-200/70">
                {[
                  { id: 'user-groups', label: 'User Groups' },
                  { id: 'roles', label: 'Roles' },
                  { id: 'permissions', label: 'Permissions Catalog' },
                  { id: 'user-management', label: 'User Management' }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    onClick={() => {
                      setAdminSubTab(subTab.id);
                      addToast(`Tab aligned: ${subTab.label}`);
                    }}
                    className={cx(
                      "px-4 py-2 rounded-lg text-xs font-bold transition-all relative border cursor-pointer",
                      adminSubTab === subTab.id 
                        ? "bg-[var(--teal-primary)]/10 border-[var(--teal-primary)]/35 text-[var(--teal-primary)] font-extrabold" 
                        : "bg-white/30 hover:bg-white/60 border-white/50 text-[var(--text-secondary)]"
                    )}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* VIEW 1: USER GROUPS SUBTAB (Matching admin-user-groups__dark-full.png in Light Mode) */}
              {adminSubTab === 'user-groups' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="p-4 bg-[var(--teal-primary)]/5 rounded-xl border border-[var(--teal-primary)]/20 text-xs">
                    <p className="text-[var(--text-secondary)] font-medium">
                      <strong>Deterministic Seeds</strong> for platform safe execution. Select any index mapping item to audit corresponding catalog permissions.
                    </p>
                  </div>

                  <div className="bg-white/25 rounded-2xl border border-white/40 overflow-hidden premium-shadow">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/250 text-[var(--text-secondary)] uppercase tracking-widest text-[10px] border-b border-white/40 font-extrabold">
                          <th className="p-4 w-40">Group</th>
                          <th className="p-4 w-72">Description</th>
                          <th className="p-4">Permissions Seeds Catalog</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {userGroupsList.map((g, idx) => (
                          <tr key={idx} className="hover:bg-white/40 transition-colors">
                            <td className="p-4 font-extrabold text-[var(--text-primary)]">{g.group}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{g.desc}</td>
                            <td className="p-4 flex flex-wrap gap-1.5">
                              {g.permissions.map((p, i) => (
                                <span key={i} className="font-mono text-[9px] px-2 py-0.5 rounded bg-white/60 text-[var(--teal-primary)] border border-white/80 font-semibold">
                                  {p}
                                </span>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* VIEW 2: ROLES SUBTAB (Matching admin-roles__dark-full.png in Light Mode) */}
              {adminSubTab === 'roles' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Filtration row */}
                  <div className="bg-white/25 p-4 rounded-xl border border-white/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 premium-shadow">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase block tracking-wider">Search active roles catalog</label>
                      <input 
                        type="text"
                        value={roleSearchTerm}
                        onChange={handleRolesSearch}
                        placeholder="Search role name or clinical scope..."
                        className="bg-white/250 border border-white/80 px-4 py-2 text-xs rounded-lg text-[var(--text-primary)] outline-none w-72 focus:border-[var(--teal-primary)]"
                      />
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] self-end font-semibold">Matches: {filteredRoles.length}</span>
                  </div>

                  <div className="bg-white/25 rounded-2xl border border-white/40 overflow-hidden premium-shadow">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/250 text-[var(--text-secondary)] uppercase tracking-widest text-[10px] border-b border-white/40 font-extrabold">
                          <th className="p-4">Role</th>
                          <th className="p-4">Description</th>
                          <th className="p-4 text-center">Permission Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {filteredRoles.map((role, idx) => (
                          <tr key={idx} className="hover:bg-white/40 transition-colors">
                            <td className="p-4 font-extrabold text-[var(--text-primary)]">{role.name}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{role.desc}</td>
                            <td className="p-4 font-mono font-bold text-center text-[var(--teal-primary)] text-sm">{role.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* VIEW 3: PERMISSIONS SUBTAB (Matching admin-permissions__dark-full.png in Light Mode) */}
              {adminSubTab === 'permissions' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  <div className="bg-white/25 rounded-2xl border border-white/40 overflow-hidden premium-shadow">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/250 text-[var(--text-secondary)] uppercase tracking-widest text-[10px] border-b border-white/40 font-extrabold">
                          <th className="p-4">Permission Name</th>
                          <th className="p-4">Resource Target</th>
                          <th className="p-4">Action Method</th>
                          <th className="p-4">PHI Exposed</th>
                          <th className="p-4">Scope Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20 font-mono">
                        {permissionsCatalog.map((perm, idx) => (
                          <tr key={idx} className="hover:bg-white/40 transition-colors">
                            <td className="p-4 font-extrabold text-[var(--teal-primary)]">{perm.name}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{perm.resource}</td>
                            <td className="p-4 text-[var(--text-secondary)]">{perm.action}</td>
                            <td className="p-4 text-[var(--text-secondary)] uppercase font-extrabold">{perm.phi}</td>
                            <td className="p-4 font-sans text-slate-500">{perm.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* VIEW 4: USER ASSIGNMENT SUBTAB (Matching admin-users__dark-full.png in Light Mode with dynamic evaluation rules) */}
              {adminSubTab === 'user-management' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Interactive Sandbox Authorization Preview Panel */}
                  <div className="bg-white/25 p-6 rounded-2xl border border-white/40 space-y-4 premium-shadow">
                    <div className="flex justify-between items-center pb-2 border-b border-white/20">
                      <span className="text-[10px] font-extrabold tracking-wider text-[var(--teal-primary)] uppercase flex items-center gap-1.5">
                        <Lock size={12} /> Authorization Preview Sandbox
                      </span>
                      <span className="text-[9px] font-mono text-[var(--text-tertiary)]">DETERMINISTIC EVALUATION ENGINE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Permission Selection Dropdown */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Evaluate Permission</label>
                        <select
                          value={sandboxPermission}
                          onChange={(e) => {
                            setSandboxPermission(e.target.value);
                            updateUatProgress(3); // satisfy: Validate sandbox permissions
                          }}
                          className="w-full bg-white/40 border border-white/80 px-3 py-2 text-xs rounded-lg text-[var(--text-primary)] cursor-pointer"
                        >
                          {permissionsCatalog.map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Resource Id Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Resource Identifier Scope</label>
                        <input
                          type="text"
                          value={sandboxResource}
                          onChange={(e) => setSandboxResource(e.target.value)}
                          className="w-full bg-white/40 border border-white/80 px-3 py-2 text-xs rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--teal-primary)]"
                          placeholder="e.g. demo-resource"
                        />
                      </div>
                    </div>

                    {/* Evaluated Outcome Panel - DYNAMICALLY RESOLVED TO PREVENT RUNTIME BUGS */}
                    <div className={cx(
                      "p-3.5 rounded-lg text-xs font-mono flex items-center gap-2 border",
                      sandboxOutcome.allowed 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-800"
                    )}>
                      <ShieldCheck size={14} className="shrink-0" />
                      <div>
                        <strong className="block">{sandboxOutcome.code}</strong>
                        <span className="opacity-90">{sandboxOutcome.desc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="bg-white/25 rounded-2xl border border-white/40 overflow-hidden premium-shadow">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/250 text-[var(--text-secondary)] uppercase tracking-widest text-[10px] border-b border-white/40 font-extrabold">
                          <th className="p-4">User</th>
                          <th className="p-4">Group/Role</th>
                          <th className="p-4 text-center">Status</th>
                          <th className="p-4 font-mono">Scope Context</th>
                          <th className="p-4 font-mono">Effective Date</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {usersList.map((user, idx) => (
                          <tr key={idx} className="hover:bg-white/40 transition-colors">
                            <td className="p-4">
                              <div className="font-extrabold text-[var(--text-primary)]">{user.name}</div>
                              <div className="text-[10px] text-[var(--text-tertiary)]">{user.email}</div>
                            </td>
                            <td className="p-4 font-bold text-[var(--text-secondary)]">{user.role}</td>
                            <td className="p-4 text-center">
                              <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-[var(--text-secondary)]">{user.scope}</td>
                            <td className="p-4 font-mono text-[var(--text-tertiary)]">{user.date}</td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => addToast(`Editing clinician profile: ${user.name}`)}
                                  className="px-2.5 py-1 bg-white/40 hover:bg-white/80 text-[var(--text-secondary)] text-[10px] font-bold rounded border border-white/60 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => addToast(`Access log requested for ${user.email}`)}
                                  className="px-2.5 py-1 bg-white/40 hover:bg-white/80 text-[var(--text-secondary)] text-[10px] font-bold rounded border border-white/60 cursor-pointer"
                                >
                                  Access
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: HELP CENTER (Matching help-center__main-view__dark-fullpage.png in Light Mode) */}
          {activeTab === 'helpcenter' && (
            <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto select-none">
              
              {/* Jumbotron Title */}
              <div className="text-center space-y-4 max-w-xl mx-auto pt-8">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-3 py-1 rounded-full border border-[var(--teal-primary)]/20 shadow-sm">
                  CareIndeed Reference Manual
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  How can we help you today?
                </h1>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Search across compliance documentation for the CI-App platform - referencing agency policy, workflows, and tools.</p>
                
                {/* Help Center Search Field */}
                <div className="relative mt-8 max-w-md mx-auto">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={knowledgeSearch}
                    onChange={(e) => {
                      setKnowledgeSearch(e.target.value);
                      updateUatProgress(5); // satisfies "Search Help Center articles"
                    }}
                    placeholder="Search for articles, guides or policies..."
                    className="w-full rounded-full bg-white/40 border border-white/80 px-12 py-3.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--teal-primary)] shadow-inner"
                  />
                </div>
              </div>

              {/* Category Grid Catalog verbatim styled in Light Theme */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                
                {/* Card 1: Getting Started */}
                <div className="bg-white/25 border border-white/40 p-6 rounded-2xl space-y-4 premium-shadow">
                  <div className="flex items-center gap-2 text-[var(--teal-primary)]">
                    <FileText size={16} />
                    <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">Getting Started</h3>
                  </div>
                  <span className="text-[9.5px] text-[var(--text-tertiary)] block">4 Articles</span>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {manualArticlesData.slice(0, 4).map((art, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => {
                          setActiveManualArticle(art);
                          addToast(`Reading manual: "${art.title}"`);
                        }}
                        className="hover:text-[var(--teal-primary)] cursor-pointer flex items-center gap-1.5 transition-colors font-medium"
                      >
                        <FileText size={12} className="text-[var(--text-tertiary)]" /> {art.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 2: Policy Lifecycle */}
                <div className="bg-white/25 border border-white/40 p-6 rounded-2xl space-y-4 premium-shadow">
                  <div className="flex items-center gap-2 text-[var(--teal-primary)]">
                    <Sliders size={16} />
                    <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">Policy Lifecycle</h3>
                  </div>
                  <span className="text-[9.5px] text-[var(--text-tertiary)] block">4 Articles</span>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {manualArticlesData.slice(4, 8).map((art, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => {
                          setActiveManualArticle(art);
                          addToast(`Reading manual: "${art.title}"`);
                        }}
                        className="hover:text-[var(--teal-primary)] cursor-pointer flex items-center gap-1.5 transition-colors font-medium"
                      >
                        <FileText size={12} className="text-[var(--text-tertiary)]" /> {art.title}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card 3: Signing Documents */}
                <div className="bg-white/25 border border-white/40 p-6 rounded-2xl space-y-4 premium-shadow">
                  <div className="flex items-center gap-2 text-[var(--teal-primary)]">
                    <UserCheck size={16} />
                    <h3 className="font-heading text-sm font-bold text-[var(--text-primary)]">Signing Documents</h3>
                  </div>
                  <span className="text-[9.5px] text-[var(--text-tertiary)] block">4 Articles</span>
                  <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                    {manualArticlesData.slice(8, 12).map((art, idx) => (
                      <li 
                        key={idx} 
                        onClick={() => {
                          setActiveManualArticle(art);
                          addToast(`Reading manual: "${art.title}"`);
                        }}
                        className="hover:text-[var(--teal-primary)] cursor-pointer flex items-center gap-1.5 transition-colors font-medium"
                      >
                        <FileText size={12} className="text-[var(--text-tertiary)]" /> {art.title}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Dynamic search listings when user types in the Help Center search field */}
              {knowledgeSearch && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">Search Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((art, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveManualArticle(art)}
                        className="bg-white/40 p-5 rounded-2xl border border-white/60 cursor-pointer hover:border-teal-500 transition-all premium-shadow"
                      >
                        <span className="text-[8px] font-extrabold text-[var(--teal-primary)] uppercase tracking-wider block mb-1">{art.category}</span>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{art.title}</h4>
                        <p className="text-[11.5px] text-slate-500 line-clamp-2 mt-1.5">{art.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT SIDE PANEL (PERSONAL OPERATIONS DRAWER) */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-l border-white/25 select-none overflow-hidden shrink-0",
            isPersonalOpsOpen ? "w-[340px] px-6 py-6 bg-white/25" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-6">
            
            <div className="space-y-6">
              {/* Drawer Close Trigger Row */}
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-[10px] font-bold tracking-widest text-[var(--teal-primary)] uppercase font-heading">Personal Ops</span>
                <button
                  onClick={() => {
                    handleSetPersonalOpsOpen(false);
                    addToast('Personal Operations Center hidden.');
                    setIsSidebarCollapsed(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/30 text-[var(--text-tertiary)] border border-white/30 bg-white/10 transition-colors premium-shadow cursor-pointer"
                  title="Hide Panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Clinician Account Profile Summary */}
              <div className="bg-white/45 p-4 rounded-2xl flex items-center gap-3 border border-white/50 shadow-sm premium-shadow">
                <div className="h-11 w-11 rounded-full shrink-0 bg-[var(--teal-primary)] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  TJ
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-[var(--text-primary)] truncate">TJ Padilla</h3>
                    <span className="text-[8px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/15 shrink-0">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium">robertp@careindeed.com</p>
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9.5px] text-emerald-600 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Token Verified
                  </div>
                </div>
              </div>

              {/* Brad Prompt Overlay Assistant Floating Trigger Card (Matching Overlay popup in image_dbb48c.png) */}
              {showBradPopupOverlay && (
                <div className="bg-white/45 p-4.5 rounded-xl border border-white/80 shadow-xl space-y-3.5 relative animate-fadeIn">
                  <button 
                    onClick={() => setShowBradPopupOverlay(false)}
                    className="absolute top-2 right-2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                  <div className="flex gap-3 items-center">
                    <div className="h-9 w-9 rounded-full bg-[var(--teal-primary)]/10 border border-[var(--teal-primary)]/30 flex items-center justify-center shrink-0">
                      <Sparkles size={16} className="text-[var(--teal-primary)] animate-spin-slow" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block font-mono">BRAD IADMINISTRATOR</h4>
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Hello, TJ, I am Brad!</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    Select a suggestion or click to launch the Compliance Intelligence query engine.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTabChange('brad')}
                      className="flex-1 py-1.5 rounded-lg bg-[var(--orange-primary)] text-white text-[10px] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Run with Brad <ArrowRight size={10} />
                    </button>
                    <button 
                      onClick={() => {
                        setShowBradPopupOverlay(false);
                        addToast('Brad overlay minimized. You can access Brad via the sidebar.');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white/25 hover:bg-white/45 text-[var(--text-secondary)] text-[10px] font-bold border border-neutral-200/70 cursor-pointer"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Focus Metrics Panel */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                  Outstanding Controls
                </h4>
                <div className="space-y-1.5">
                  {[
                    { count: '3', label: 'Unsigned state forms logs', color: 'text-[var(--orange-primary)]' },
                    { count: '12', label: 'Mandated Core Policies', color: 'text-[var(--teal-primary)]' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        handleTabChange('forms');
                        addToast(`Navigating to personal planner focus: ${item.label}`);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/25 hover:bg-white/45 transition-colors cursor-pointer border border-white/20 premium-shadow"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cx("text-xs font-extrabold font-mono shrink-0", item.color)}>{item.count}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] truncate font-semibold">{item.label}</span>
                      </div>
                      <ChevronRight size={13} className="text-[var(--text-tertiary)] shrink-0" />
                    </div>
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
                <div>Security clearance: <strong>Super Admin</strong></div>
                <div>Active verification: <strong className="text-emerald-700">Perfect Handshake</strong></div>
                <div className="text-[8.5px] text-[var(--text-tertiary)] italic leading-tight">Biometric Safe Mode verified. Patient health information (PHI) is hidden in collapsed view states.</div>
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* FLOAT CHECKLIST DRAWER (GUIDED UAT WIDGET) */}
      <div className="fixed bottom-6 left-6 z-40">
        <div className="w-80 rounded-2xl border transition-all duration-300 shadow-[0_18px_45px_rgba(82,77,75,0.14)] relative overflow-hidden bg-white/95 border-white shadow-xl">
          {/* Header Row */}
          <div 
            onClick={() => setIsUatChecklistExpanded(!isUatChecklistExpanded)}
            className="p-4 flex items-center justify-between cursor-pointer border-b border-white/25 bg-[var(--teal-primary)]/5 select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkle size={15} className="text-[var(--teal-primary)] animate-spin-slow" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">GUIDED UAT</h4>
                <span className="text-[10px] font-bold text-[var(--teal-primary)] font-mono">
                  {uatCheckpoints.filter(c => c.completed).length}/6 operational checkpoints
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToast('Resetting Guided UAT steps... Ready to audit.', 'info');
                  setUatCheckpoints(prev => prev.map(c => c.id === 1 ? c : { ...c, completed: false }));
                }}
                className="text-[9px] hover:underline text-[var(--text-tertiary)] cursor-pointer"
              >
                Reset
              </button>
              {isUatChecklistExpanded ? <X size={14} className="text-[var(--text-tertiary)] cursor-pointer" /> : <ChevronRight size={14} className="text-[var(--text-tertiary)] cursor-pointer" />}
            </div>
          </div>

          {/* Collapsible List Body */}
          {isUatChecklistExpanded && (
            <div className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto">
              {uatCheckpoints.map((step) => (
                <div 
                  key={step.id} 
                  onClick={() => {
                    handleTabChange(step.tabHint);
                    addToast(`Checklist Guide: Navigate to ${step.tabHint.toUpperCase()} to perform "${step.label}"`);
                  }}
                  className={cx(
                    "flex items-start gap-2.5 cursor-pointer text-xs transition-colors p-2 rounded-lg",
                    step.completed ? "hover:bg-emerald-500/5 text-slate-500" : "hover:bg-white/25 text-[var(--text-secondary)]"
                  )}
                >
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle size={14} className="text-emerald-500" />
                    ) : (
                      <div className="h-3.5 w-3.5 rounded border border-teal-500/30 flex items-center justify-center shrink-0" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <span className={cx(
                      "font-semibold block leading-tight",
                      step.completed && "line-through text-slate-400"
                    )}>
                      {step.label}
                    </span>
                    <p className="text-[9.5px] text-slate-400 leading-tight">{step.completed ? step.desc : `Click to jump to tab: ${step.tabHint}`}</p>
                  </div>
                </div>
              ))}

              <div className="pt-2.5 border-t border-white/20 flex items-center justify-between text-[9px] text-[var(--text-tertiary)]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={keepChecklistVisible} 
                    onChange={() => setKeepChecklistVisible(!keepChecklistVisible)} 
                    className="rounded border-gray-300 text-[var(--teal-primary)] focus:ring-[var(--teal-primary)] shrink-0 cursor-pointer"
                  />
                  <span>Keep checklist visible</span>
                </label>
                <span className="font-mono bg-white/25 px-1.5 py-0.5 rounded text-[8px]">UAT 1.0</span>
              </div>
            </div>
          )}
        </div>
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
                  <h3 className="font-heading text-xl font-extrabold text-[var(--text-primary)] pt-1">
                    {inspectItem.title || inspectItem.name}
                  </h3>
                </div>
                <button 
                  onClick={() => handleInspectLauncher(null)}
                  className="p-1.5 rounded-full hover:bg-white/35 text-[var(--text-tertiary)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Inspector Tab Selector */}
              <div className="flex rounded-lg bg-white/35 p-1 border border-white/20">
                {['overview', 'evidence', 'biometric'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInspectTab(tab)}
                    className={cx(
                      "flex-1 py-1.5 text-xs font-bold rounded-md transition-all uppercase tracking-wider cursor-pointer",
                      inspectTab === tab ? "bg-[var(--teal-primary)] text-white shadow-sm font-extrabold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {inspectTab === 'overview' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-4 bg-white/60 p-5 rounded-2xl border border-white premium-shadow">
                    {inspectItem.id && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-tertiary)] font-bold">Standard Identifier:</span>
                        <span className="font-mono font-bold text-[var(--teal-primary)] bg-white/40 px-2 py-0.5 rounded border border-white shadow-sm">
                          {inspectItem.id}
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
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                      Procedural Description & Scope
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-white/60 p-4 rounded-xl border border-white shadow-inner">
                      {inspectItem.description || 'Full legal scope verified under Medicare statutory provisions.'}
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
                          <div key={index} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)] bg-white/40 p-3 rounded-xl border border-white premium-shadow">
                            <FileText size={14} className="text-[var(--teal-primary)] shrink-0" />
                            <span className="font-medium">{ev}</span>
                            <span className="ml-auto text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded shadow-sm border border-emerald-200">
                              Validated Lock
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-[var(--text-tertiary)] bg-white/20 rounded-xl border border-dashed border-white/20">
                        No explicit evidence uploaded. Please upload a PDF signature packet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {inspectTab === 'biometric' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-white/40 p-5 rounded-2xl border border-white space-y-4 premium-shadow">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                      Biometric Authorization Matrix
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                      To lock this compliance block, Robert P. must authenticate this transaction with their signature and seal.
                    </p>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={hasAgreedCheck} 
                        onChange={() => setHasAgreedCheck(!hasAgreedCheck)}
                        className="mt-0.5 h-4 w-4 rounded border-teal-500 text-teal-600 bg-white cursor-pointer"
                      />
                      <span className="text-[11px] text-[var(--text-secondary)] leading-normal font-medium">
                        I declare under penalty of perjury that this evidence satisfies all applicable California Title 22 state directives and Conditions of Participation rules.
                      </span>
                    </label>

                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider block">Type Your Full Name to Sign</label>
                      <input 
                        type="text" 
                        value={sigText}
                        onChange={(e) => setSigText(e.target.value)}
                        placeholder="TJ Padilla"
                        className="w-full bg-white border border-neutral-200 px-3 py-2 text-xs rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)] font-semibold shadow-inner"
                      />
                    </div>

                    {sigText && (
                      <div className="p-4 rounded-xl bg-white/80 border border-white text-center relative overflow-hidden">
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

            <div className="pt-6 border-t border-white/20 flex gap-3">
              <button 
                onClick={() => {
                  if (inspectTab === 'biometric') {
                    if (!hasAgreedCheck || !sigText) {
                      addToast('Please complete the attestation and signature before sealing.', 'error');
                      return;
                    }
                  }
                  updateUatProgress(6); // satisfies "Upload and verify evidence"
                  addToast(`Compliance package signed and sealed for ${inspectItem.title || inspectItem.name}`, 'success');
                  handleInspectLauncher(null);
                }}
                className="flex-1 bg-[var(--teal-primary)] text-white text-xs font-bold py-2.5 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                <Check size={14} /> Authorize & Seal
              </button>
              
              <button 
                onClick={() => {
                  addToast('Flagged internally for quality advisor review.', 'info');
                  handleInspectLauncher(null);
                }}
                className="px-4 py-2.5 border border-neutral-200/70 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-white/30 transition-colors whitespace-nowrap cursor-pointer"
              >
                Flag Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ARTICLE READER MODAL (POLISHED) */}
      {activeManualArticle && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveManualArticle(null)}
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-white/95 border border-white p-6 md:p-8 space-y-6 shadow-[0_18px_45px_rgba(82,77,75,0.14)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2 py-0.5 rounded">
                  {activeManualArticle.category}
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-800 mt-2">{activeManualArticle.title}</h3>
              </div>
              <button 
                onClick={() => setActiveManualArticle(null)}
                className="p-1.5 rounded-full hover:bg-white/35 text-[var(--text-tertiary)] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-4 rounded-xl shadow-inner border border-neutral-100">
              {activeManualArticle.text}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  addToast(`Copied handbook reference content to clipboard.`, 'success');
                  setActiveManualArticle(null);
                }}
                className="px-4 py-2 rounded-lg bg-[var(--teal-primary)] text-white text-xs font-bold cursor-pointer"
              >
                Copy Reference Code
              </button>
              <button 
                onClick={() => setActiveManualArticle(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-neutral-200 cursor-pointer"
              >
                Close
              </button>
            </div>
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
            className="w-full max-w-xl rounded-2xl bg-[#F8F3F0]/95 p-5 space-y-4 animate-fadeIn border border-white shadow-[0_18px_45px_rgba(82,77,75,0.14)]"
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
                className="w-full bg-white border border-neutral-300 rounded-full pl-10 pr-12 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-[var(--teal-primary)]"
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
                        : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-white/45"
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
            
            <div className="flex items-center justify-between pt-2 text-[9px] text-[var(--text-tertiary)] border-t border-white/20">
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
            className="rounded-xl bg-white/95 backdrop-blur-xl p-4.5 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/80 animate-fadeIn flex items-center gap-3 min-w-[300px] pointer-events-auto premium-shadow"
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

// Wrapper default export to ensure safe rendering in the Google Gemini Canvas sandbox
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}