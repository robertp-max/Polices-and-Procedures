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
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ArrowRightLeft,
  SearchCode,
  Tag,
  CheckSquare,
  Shield,
  FileSpreadsheet,
  AlertCircle,
  UserCheck,
  Database,
  Fingerprint,
  Compass,
  MessageSquare,
  Key,
  ShieldX,
  RefreshCw,
  SlidersHorizontal,
  Bookmark
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
            : "text-[var(--text-secondary)] bg-white/15 border-white/20 hover:bg-white/35 hover:text-[var(--text-primary)] hover:border-white/40",
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
  const [activeTab, setActiveTab] = useState('user-management'); // user-groups, roles, permissions, user-management
  const [userManagementSubTab, setUserManagementSubTab] = useState('user-assignments'); // user-assignments, page-access
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 
  const [isPersonalOpsOpen, setIsPersonalOpsOpen] = useState(false);

  // Selected drill-down state for Roles (matches admin-roles__dark-full.png layout)
  const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);

  // UAT Guided checklist progress states (matches nav-context-from-dashboard__dark-full.png)
  const [isUatOpen, setIsUatOpen] = useState(true);
  const [uatCheckpoints, setUatCheckpoints] = useState([
    { id: 'u1', label: 'Review operational posture', checked: true },
    { id: 'u2', label: 'Open and execute tasks', checked: false },
    { id: 'u3', label: 'Validate workflow timeline', checked: false },
    { id: 'u4', label: 'Complete required forms', checked: false },
    { id: 'u5', label: 'Upload and verify evidence', checked: false },
    { id: 'u6', label: 'Run audit readiness pass', checked: false }
  ]);

  // Brad chatbot assistant overlay states (matches admin-user-groups__dark-full.png)
  const [isBradOpen, setIsBradOpen] = useState(false);
  const [bradChatQuery, setBradChatQuery] = useState('');
  const [bradLogs, setBradLogs] = useState([
    { sender: 'brad', text: 'Hello, TJ, I am Brad! I am your AI compliance & identity coordinator. How can I help secure your home health audit targets today?' }
  ]);

  // Real-time permission authorization engine states (matches admin-users__dark-full.png)
  const [authTestPermission, setAuthTestPermission] = useState('policy.approve');
  const [authTestResource, setAuthTestResource] = useState('demo-resource');
  const [authResult, setAuthResult] = useState('ALLOW — allow.granted — Permission granted by deterministic Phase A authorize evaluation.');

  // Live query states for Role filtering (matches admin-roles__dark-full.png)
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [permissionSearchQuery, setPermissionSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  // Modals & User lists states
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('RN');
  const [newUserScope, setNewUserScope] = useState('org:careindeed-clinical');

  // Custom User Security Details Modal State
  const [selectedAuditUser, setSelectedAuditUser] = useState(null);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);

  const [identityUsers, setIdentityUsers] = useState([
    { id: 'usr-1', name: 'TJ Padilla', email: 'robertp@careindeed.com', role: 'Super Admin', status: 'ACTIVE', scope: 'org:careindeed-demo', effective: '2026-01-01' },
    { id: 'usr-2', name: 'Robert Patel', email: 'robert.patel@careindeed.com', role: 'Compliance', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-03-12' },
    { id: 'usr-3', name: 'Sarah Ahmed', email: 's.ahmed@careindeed.com', role: 'RN', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-02-15' },
    { id: 'usr-4', name: 'Monica Chen', email: 'm.chen@careindeed.com', role: 'Compliance', status: 'ACTIVE', scope: 'org:careindeed-admin', effective: '2026-04-01' },
    { id: 'usr-5', name: 'Devon Alvarez', email: 'd.alvarez@careindeed.com', role: 'Admin', status: 'ACTIVE', scope: 'org:careindeed-admin', effective: '2026-04-10' },
    { id: 'usr-6', name: 'Linda Washington', email: 'l.washington@careindeed.com', role: 'Auditor', status: 'ACTIVE', scope: 'org:careindeed-external', effective: '2026-05-02' },
    { id: 'usr-7', name: 'James Carter', email: 'j.carter@careindeed.com', role: 'LVN', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-05-10' },
    { id: 'usr-8', name: 'Alina Vance', email: 'a.vance@careindeed.com', role: 'Director', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-05-14' },
    { id: 'usr-9', name: 'Marcus Brody', email: 'm.brody@careindeed.com', role: 'Billing', status: 'ACTIVE', scope: 'org:careindeed-admin', effective: '2026-05-18' },
    { id: 'usr-10', name: 'Sonia Gupta', email: 's.gupta@careindeed.com', role: 'RN', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-05-22' },
    { id: 'usr-11', name: 'Fiona Gallagher', email: 'f.gallagher@careindeed.com', role: 'CHHA', status: 'ACTIVE', scope: 'org:careindeed-clinical', effective: '2026-05-28' },
    { id: 'usr-12', name: 'Bruce Wayne', email: 'b.wayne@careindeed.com', role: 'Super Admin', status: 'ACTIVE', scope: 'org:careindeed-demo', effective: '2026-06-01' }
  ]);

  const identityRoles = [
    { role: 'Super Admin', desc: 'Demo bootstrap admin with full Phase A permissions and overriding system credentials.', permissionsCount: 18, riskLevel: 'Low', allowedScope: 'org:careindeed-*' },
    { role: 'Admin', desc: 'Operations administration and access lifecycle configuration tasks.', permissionsCount: 6, riskLevel: 'Low', allowedScope: 'org:careindeed-admin' },
    { role: 'RN', desc: 'Clinical registered nurse role with medication execution credentials.', permissionsCount: 8, riskLevel: 'Medium', allowedScope: 'org:careindeed-clinical' },
    { role: 'LVN', desc: 'Clinical licensed vocational nurse role under supervisory review.', permissionsCount: 8, riskLevel: 'Medium', allowedScope: 'org:careindeed-clinical' },
    { role: 'CHHA', desc: 'Clinical home health aide role with physical visit logs validation.', permissionsCount: 7, riskLevel: 'Medium', allowedScope: 'org:careindeed-clinical' },
    { role: 'Compliance', desc: 'Compliance and internal audit preparation operations.', permissionsCount: 10, riskLevel: 'Low', allowedScope: 'org:careindeed-*' },
    { role: 'Auditor', desc: 'Read-only evidence and audit trace package review.', permissionsCount: 5, riskLevel: 'Low', allowedScope: 'org:careindeed-external' },
    { role: 'Onboarding', desc: 'Onboarding specialist assignment role for new clinician credentials.', permissionsCount: 5, riskLevel: 'Medium', allowedScope: 'org:careindeed-clinical' },
    { role: 'Billing', desc: 'Billing workflow participant role with Medicare code tracking.', permissionsCount: 5, riskLevel: 'Low', allowedScope: 'org:careindeed-admin' },
    { role: 'Director', desc: 'Director-level approvals, escalation overrides, and medical director logs.', permissionsCount: 6, riskLevel: 'High', allowedScope: 'org:careindeed-*' }
  ];

  const identityGroups = [
    { group: 'Super Admin', desc: 'Demo bootstrap admin with full Phase A permissions.', permissions: ['policy.view', 'policy.draft', 'policy.approve', 'ceu.view', 'ceu.assign', 'ceu.execute', 'phi.read', 'phi.write', 'user.prov'] },
    { group: 'Admin', desc: 'Operations administration and access lifecycle tasks.', permissions: ['policy.view', 'form.view', 'ceu.view'] },
    { group: 'RN', desc: 'Clinical registered nurse role.', permissions: ['policy.view', 'form.view', 'form.sign', 'phi.write'] },
    { group: 'LVN', desc: 'Clinical licensed vocational nurse role.', permissions: ['policy.view', 'form.view', 'form.sign', 'phi.write'] },
    { group: 'CHHA', desc: 'Clinical home health aide role.', permissions: ['policy.view', 'form.view', 'form.sign'] }
  ];

  const identityPermissions = [
    { name: 'policy.view', resource: 'policy', action: 'view', phi: 'no', desc: 'Read policy content and metadata catalog.' },
    { name: 'policy.draft', resource: 'policy', action: 'draft', phi: 'no', desc: 'Edit policy draft content before supervisory signoff.' },
    { name: 'policy.approve', resource: 'policy', action: 'approve', phi: 'no', desc: 'Approve policy version for Title 22 compliance.' },
    { name: 'policy.publish', resource: 'policy', action: 'publish', phi: 'no', desc: 'Publish approved policy version to active directory.' },
    { name: 'form.view', resource: 'form', action: 'view', phi: 'no', desc: 'Read form structure, requirements, and status.' },
    { name: 'form.sign', resource: 'form', action: 'sign', phi: 'no', desc: 'Apply digital signature action on standardized forms.' },
    { name: 'ceu.view', resource: 'ceu', action: 'view', phi: 'no', desc: 'Read CEU/clinical workflow training state.' },
    { name: 'ceu.assign', resource: 'ceu', action: 'assign', phi: 'no', desc: 'Assign CEU/clinical workflow work to staff members.' },
    { name: 'ceu.execute', resource: 'ceu', action: 'execute', phi: 'no', desc: 'Execute CEU/workflow training tasks.' },
    { name: 'ceu.complete', resource: 'ceu', action: 'complete', phi: 'no', desc: 'Complete and lock CEU/workflow unit.' },
    { name: 'ceu.override', resource: 'ceu', action: 'override', phi: 'no', desc: 'Perform override flow with dual clinical director signoffs.' }
  ];

  const [pageViewRules, setPageViewAccessMatrix] = useState([
    { page: 'Dashboard', superAdmin: true, admin: true, compliance: true, auditor: true, rn: true, lvn: true, chha: true },
    { page: 'Clinician Profiles', superAdmin: true, admin: true, compliance: true, auditor: true, rn: false, lvn: false, chha: false },
    { page: 'Patient Profiles (HIPAA)', superAdmin: true, admin: false, compliance: true, auditor: false, rn: true, lvn: true, chha: false },
    { page: 'Calendar & Rosters', superAdmin: true, admin: true, compliance: true, auditor: false, rn: true, lvn: true, chha: true },
    { page: 'Compliance Execution (CES)', superAdmin: true, admin: false, compliance: true, auditor: true, rn: false, lvn: false, chha: false },
    { page: 'Taxonomy & Mappings', superAdmin: true, admin: false, compliance: true, auditor: true, rn: false, lvn: false, chha: false },
    { page: 'Evidence Locker', superAdmin: true, admin: false, compliance: true, auditor: true, rn: false, lvn: false, chha: false }
  ]);

  const togglePageAccessRule = (pageIndex, roleKey) => {
    const updated = [...pageViewRules];
    updated[pageIndex][roleKey] = !updated[pageIndex][roleKey];
    setPageViewAccessMatrix(updated);
    addToast(`Updated access rule: ${updated[pageIndex].page} for ${roleKey.toUpperCase()}`, 'success');
  };

  useEffect(() => {
    evaluateAuth(authTestPermission, authTestResource);
  }, [authTestPermission, authTestResource]);

  const evaluateAuth = (permission, resource) => {
    if (permission === 'policy.approve' && resource.trim().length > 0) {
      setAuthResult('ALLOW — allow.granted — Permission granted by deterministic Phase A authorize evaluation.');
    } else if (permission === 'ceu.override' && resource.includes('external')) {
      setAuthResult('DENY — deny.rejected — External scope overrides require double clinical director signature blocks.');
    } else {
      setAuthResult(`ALLOW — active.scoped — Evaluation passes for ${permission} against resource target: ${resource || 'unspecified'}.`);
    }
  };

  useEffect(() => {
    // Select the first role detail dynamically
    if (identityRoles.length > 0 && !selectedRoleDetail) {
      setSelectedRoleDetail(identityRoles[0]);
    }
  }, []);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      addToast('Please input username and email address.', 'error');
      return;
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'ACTIVE',
      scope: newUserScope,
      effective: '2026-06-16'
    };
    setIdentityUsers(prev => [newUser, ...prev]);
    addToast(`User ${newUserName} successfully provisioned!`, 'success');
    setShowAddTaskModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const deleteUser = (id, name) => {
    setIdentityUsers(prev => prev.filter(u => u.id !== id));
    addToast(`Revoked permissions and deleted profile for ${name}`, 'info');
  };

  // Filter lists based on user search queries
  const filteredRoles = identityRoles.filter(r => {
    return r.role.toLowerCase().includes(roleSearchQuery.toLowerCase()) ||
           r.desc.toLowerCase().includes(roleSearchQuery.toLowerCase());
  });

  const filteredPermissions = identityPermissions.filter(p => {
    return p.name.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
           p.desc.toLowerCase().includes(permissionSearchQuery.toLowerCase()) ||
           p.resource.toLowerCase().includes(permissionSearchQuery.toLowerCase());
  });

  const filteredGroups = identityGroups.filter(g => {
    return g.group.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
           g.desc.toLowerCase().includes(groupSearchQuery.toLowerCase());
  });

  const handleSendBradMessage = (text) => {
    const messageToSend = text || bradChatQuery;
    if (!messageToSend.trim()) return;

    const userMsg = { sender: 'user', text: messageToSend };
    setBradLogs(prev => [...prev, userMsg]);
    setBradChatQuery('');

    setTimeout(() => {
      let responseText = `I have scanned your Home Health databases for "${messageToSend}". Your security posture looks green!`;
      if (messageToSend.toLowerCase().includes('audit') || messageToSend.toLowerCase().includes('survey')) {
        responseText = "Understood. Launching clinical compliance diagnostics. I have prepared your CMS crosswalk guidelines and isolated 3 missing governance forms.";
      } else if (messageToSend.toLowerCase().includes('gap') || messageToSend.toLowerCase().includes('qapi')) {
        responseText = "QAPI Gaps Isolated: Clinician framework update v3 is currently overdue by 4 hours. Recommend immediate digital seal.";
      } else if (messageToSend.toLowerCase().includes('missing')) {
        responseText = "Identified 1 missing Form: EN-FM-035 (Regulatory Crosswalk). Recommended Action: Add to workspace planner.";
      }
      setBradLogs(prev => [...prev, { sender: 'brad', text: responseText }]);
    }, 700);
  };

  const handleSetPersonalOpsOpen = (open) => {
    setIsPersonalOpsOpen(open);
    if (open) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full overflow-hidden antialiased light-shell selection:bg-[var(--teal-primary)]/15">
      
      {/* Design System Style Injection - Polished text, layout and high fidelity glassmorphism */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --border-card: rgba(255, 255, 255, 0.45);
          --border-card-hover: rgba(0, 121, 125, 0.35);
          --bg-card: rgba(255, 255, 255, 0.22);
          --text-primary: #2D2522; /* Polished deep espresso charcoal, strictly avoiding raw black text */
          --text-secondary: #5C524F; /* Softened secondary subtext */
          --text-tertiary: #857A76; /* Sophisticated tertiary metadata text */
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

        /* Glassmorphism Redesign pass modeled from image_d0db84.png */
        .glass-panel {
          background: rgba(255, 255, 255, 0.42) !important;
          backdrop-filter: blur(28px) saturate(125%) !important;
          -webkit-backdrop-filter: blur(28px) saturate(125%) !important;
          border: 1px solid rgba(255, 255, 255, 0.65) !important;
          box-shadow: 
            0 24px 50px -12px rgba(45, 37, 35, 0.08),
            0 8px 24px -8px rgba(45, 37, 35, 0.04),
            inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
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

      {/* DEDICATED APP TOP HEADER */}
      <header className="flex h-[76px] w-full flex-shrink-0 items-center justify-between px-9 bg-white/20 backdrop-blur-[33px] relative z-30 border-b border-white/25 select-none shadow-sm">
        
        {/* Left branding container */}
        <div className="flex items-center gap-3 w-[265px] shrink-0 pr-4">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png" 
              alt="CareIndeed Brand Logo" 
              className="h-7 w-auto object-contain select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Top bar search accessor widget */}
        <div className="flex flex-1 items-center max-w-md ml-4">
          <div className="group relative w-full cursor-pointer">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <div className="w-full rounded-full bg-white/45 pl-10 pr-12 py-2 text-xs text-[var(--text-secondary)] select-none flex items-center justify-between h-[36px] group-hover:bg-white/60 transition-all border border-white/60 premium-shadow">
              <span>Search policies, credentials, catalog items...</span>
              <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded font-mono text-[var(--text-secondary)] shadow-sm shrink-0 ml-2">
                ⌘K
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions Control Row */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => {
              addToast(`Identity integrity active: Phase A verified. Safe mode enabled.`, 'success');
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[var(--text-secondary)] hover:text-[var(--teal-primary)] transition-all border border-white/55 premium-shadow"
            title="System Clearance Badge"
          >
            <Lock size={14} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button 
            onClick={() => {
              const nextState = !isPersonalOpsOpen;
              handleSetPersonalOpsOpen(nextState);
              addToast(nextState ? 'Operations details expanded' : 'Operations details collapsed', 'info');
            }}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold transition-all shadow-md ml-2 relative border-2 border-white/70",
              isPersonalOpsOpen ? "bg-[var(--orange-primary)] scale-105" : "bg-[var(--teal-primary)]"
            )}
            title="Robert Patel Profile Portal"
          >
            TP
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
          </button>
        </div>
      </header>

      {/* LOWER SCREEN WORKSPACE LAYOUT */}
      <div className="flex-1 flex overflow-hidden w-full relative z-10">
        
        {/* SIDEBAR NAVIGATION DOCK */}
        <aside 
          className={cx(
            "relative z-20 flex h-full flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-r border-white/20 shrink-0",
            isSidebarCollapsed ? "w-[78px]" : "w-[265px]"
          )}
        >
          <div className="p-4 flex justify-end select-none">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-white/20 transition-all flex items-center justify-center border border-white/50 bg-white/10 premium-shadow"
              title={isSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
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
                  icon={Fingerprint} 
                  label="Identity Admin" 
                  active={true} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { addToast('Displaying active Phase A identity admin consoles.'); }} 
                />

                <InteractiveNavButton 
                  icon={MessageSquare} 
                  label="Brad Assistant" 
                  active={isBradOpen} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => { 
                    setIsBradOpen(!isBradOpen);
                    addToast(isBradOpen ? 'Brad interface collapsed.' : 'Brad assistant interface active!');
                  }} 
                />

                <InteractiveNavButton 
                  icon={Compass} 
                  label="Guided Tour" 
                  active={isUatOpen} 
                  isCollapsed={isSidebarCollapsed}
                  onClick={() => {
                    setIsUatOpen(!isUatOpen);
                    addToast(isUatOpen ? 'Tour checklists collapsed.' : 'Tour checklist active.');
                  }} 
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/25 select-none text-[11px] font-bold text-[var(--text-primary)] border-t border-white/20">
            <span className="flex items-center gap-1.5 justify-center">
              <Lock size={12} className="text-[var(--teal-primary)]" />
              {!isSidebarCollapsed && <span className="text-[var(--text-secondary)]">Safe Mode Active</span>}
            </span>
          </div>
        </aside>

        {/* CENTER SCROLLABLE OPERATIONS PANEL */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent relative z-10 p-6 md:p-9">
          
          <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto select-none">
            
            {/* Header Module aligned with mockup directories */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-white/30">
              <div className="space-y-2">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[var(--teal-primary)] bg-[var(--teal-primary)]/10 px-2.5 py-1 rounded-full border border-[var(--teal-primary)]/20">
                  Phase A Identity Admin
                </span>
                <h1 className="font-heading text-3xl font-extrabold text-[var(--teal-primary)]">
                  Identity & Credentials Control
                </h1>
                <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                  Redesigned page views displaying deterministic user catalogs, roles directories, state mapping tags, and active simulation tools.
                </p>
              </div>

              {/* Sub tab selectors modeled after admin-permissions__dark-full.png */}
              <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-white/10 border border-white/50 shadow-md">
                {[
                  { id: 'user-groups', label: 'User Groups' },
                  { id: 'roles', label: 'Roles' },
                  { id: 'permissions', label: 'Permissions' },
                  { id: 'user-management', label: 'User Assignments / Management' }
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => {
                      setActiveTab(subTab.id);
                      addToast(`Switched view to identity ${subTab.label}`);
                    }}
                    className={cx(
                      "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                      activeTab === subTab.id 
                        ? "bg-[var(--teal-primary)] text-white shadow" 
                        : "text-[var(--text-secondary)] hover:bg-white/30 hover:text-[var(--text-primary)]"
                    )}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB VIEW 1: USER GROUPS (admin-user-groups__dark-full.png) */}
            {activeTab === 'user-groups' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-white/20 border border-white/50 space-y-3 premium-shadow">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--teal-primary)]">
                        Deterministic User Groups
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Catalogs are constrained to Phase A foundation mappings and are intentionally decoupled from HIPAA-restricted databases.
                      </p>
                    </div>
                    {/* Live Search for groups */}
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                      <input 
                        type="text" 
                        placeholder="Search groups catalog..."
                        value={groupSearchQuery}
                        onChange={(e) => setGroupSearchQuery(e.target.value)}
                        className="w-full bg-white/70 border border-white pl-9 pr-4 py-2 text-xs rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-xl premium-shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4.5 border-b border-white/20">Group Name</th>
                          <th className="p-4.5 border-b border-white/20">Description</th>
                          <th className="p-4.5 border-b border-white/20">Mapped Permissions Keys</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredGroups.map((g, idx) => (
                          <tr key={idx} className="hover:bg-white/30 transition-all">
                            <td className="p-4.5 font-bold text-[var(--text-primary)] whitespace-nowrap">
                              <span className="flex items-center gap-2">
                                <Users size={14} className="text-[var(--teal-primary)]" />
                                {g.group}
                              </span>
                            </td>
                            <td className="p-4.5 text-[var(--text-secondary)] max-w-sm leading-relaxed">{g.desc}</td>
                            <td className="p-4.5">
                              <div className="flex flex-wrap gap-1.5 max-w-xl">
                                {g.permissions.map((p, pIdx) => (
                                  <span key={pIdx} className="font-mono text-[9px] font-medium bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/15 px-2.5 py-0.5 rounded shadow-sm">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: ROLES DIRECTORY (admin-roles__dark-full.png) */}
            {activeTab === 'roles' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search query block from mockup */}
                <div className="p-5 rounded-2xl bg-white/20 border border-white/50 space-y-3 premium-shadow">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--teal-primary)]">
                    Filter Clinical & Operations Roles
                  </h3>
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input
                      type="text"
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      placeholder="Search role name or operational description..."
                      className="w-full bg-white/45 border border-white/60 pl-10 pr-4 py-2.5 text-xs rounded-xl outline-none focus:border-[var(--teal-primary)] transition-all text-[var(--text-primary)] shadow-sm placeholder-[var(--text-tertiary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Role Catalog List */}
                  <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-xl premium-shadow">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                            <th className="p-4.5 border-b border-white/20">Role</th>
                            <th className="p-4.5 border-b border-white/20">Description</th>
                            <th className="p-4.5 border-b border-white/20 text-center">Permission Count</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredRoles.map((r, idx) => (
                            <tr 
                              key={idx} 
                              onClick={() => {
                                setSelectedRoleDetail(r);
                                addToast(`Detailed access map loaded for: ${r.role}`);
                              }}
                              className={cx(
                                "hover:bg-white/30 transition-all cursor-pointer",
                                selectedRoleDetail?.role === r.role ? "bg-[var(--teal-primary)]/5 border-l-4 border-l-[var(--teal-primary)]" : ""
                              )}
                            >
                              <td className="p-4.5 font-bold text-[var(--text-primary)] whitespace-nowrap">
                                <span className="flex items-center gap-1.5">
                                  <UserCheck size={14} className="text-[var(--teal-primary)]" />
                                  {r.role}
                                </span>
                              </td>
                              <td className="p-4.5 text-[var(--text-secondary)] leading-relaxed">{r.desc}</td>
                              <td className="p-4.5 text-center font-mono font-bold text-[var(--orange-primary)] text-sm">{r.permissionsCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Drill-Down Detail */}
                  <div className="p-6 rounded-2xl bg-white/25 border border-white/50 space-y-4 shadow-xl premium-shadow">
                    <div className="flex items-center gap-2 text-[var(--teal-primary)] font-bold border-b border-white/20 pb-3">
                      <SlidersHorizontal size={16} />
                      <h4 className="text-xs uppercase tracking-wider">Role Access Integrity Drill-Down</h4>
                    </div>

                    {selectedRoleDetail ? (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Active Catalog Name</label>
                          <span className="text-base font-extrabold text-[var(--teal-primary)]">{selectedRoleDetail.role}</span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Scope Access Key</label>
                          <span className="font-mono text-xs bg-white/60 px-2 py-0.5 rounded border border-white inline-block mt-1 text-[var(--text-primary)]">
                            {selectedRoleDetail.allowedScope}
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Security Risk Parameter</label>
                          <span className={cx(
                            "px-2.5 py-0.5 rounded text-[10px] font-bold border inline-block mt-1",
                            selectedRoleDetail.riskLevel === 'High' ? 'bg-rose-100 text-rose-800 border-rose-200' : 
                            selectedRoleDetail.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          )}>
                            {selectedRoleDetail.riskLevel} Risk Profile
                          </span>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Operational Guideline</label>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1 italic">
                            {selectedRoleDetail.desc}
                          </p>
                        </div>

                        <div className="pt-2">
                          <button 
                            onClick={() => addToast(`Credential keys verified for ${selectedRoleDetail.role}. System logs marked clean.`, 'success')}
                            className="w-full bg-[var(--teal-primary)]/10 hover:bg-[var(--teal-primary)]/20 text-[var(--teal-primary)] font-bold py-2 rounded-xl text-xs transition-colors border border-[var(--teal-primary)]/20"
                          >
                            Verify Compliance Tokens
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-xs text-[var(--text-tertiary)] italic">
                        Select a role row from the catalog table to inspect compliance scope credentials.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 3: PERMISSIONS LISTING (admin-permissions__dark-full.png) */}
            {activeTab === 'permissions' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-white/20 border border-white/50 space-y-3 premium-shadow">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--teal-primary)]">
                        Phase A Identity Admin - Permission Catalog
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Catalog is constrained to Phase A foundation permissions and is intentionally separate from HIPAA-only controls.
                      </p>
                    </div>
                    {/* Permission filter box */}
                    <div className="relative w-full sm:w-72">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                      <input 
                        type="text" 
                        placeholder="Search standard permissions..."
                        value={permissionSearchQuery}
                        onChange={(e) => setPermissionSearchQuery(e.target.value)}
                        className="w-full bg-white/70 border border-white pl-9 pr-4 py-2 text-xs rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-xl premium-shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4.5 border-b border-white/20">Permission</th>
                          <th className="p-4.5 border-b border-white/20">Resource</th>
                          <th className="p-4.5 border-b border-white/20">Action</th>
                          <th className="p-4.5 border-b border-white/20 text-center">PHI Access</th>
                          <th className="p-4.5 border-b border-white/20">Operational Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredPermissions.map((perm, idx) => (
                          <tr key={idx} className="hover:bg-white/30 transition-all">
                            <td className="p-4.5 font-mono font-bold text-[var(--teal-primary)] whitespace-nowrap">{perm.name}</td>
                            <td className="p-4.5 text-[var(--text-secondary)] font-medium">{perm.resource}</td>
                            <td className="p-4.5 font-mono text-[var(--orange-primary)] font-bold uppercase">{perm.action}</td>
                            <td className="p-4.5 text-center">
                              <span className={cx(
                                "px-2.5 py-0.5 rounded text-[10px] font-bold border shadow-sm",
                                perm.phi === 'yes' ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-neutral-100 text-[var(--text-secondary)] border-neutral-200'
                              )}>
                                {perm.phi.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4.5 text-[var(--text-secondary)] leading-relaxed">{perm.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 4: USER ASSIGNMENTS & PRIVILEGES ACCESS (admin-users__dark-full.png) */}
            {activeTab === 'user-management' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Secondary Subtab layout for assignments / page view access */}
                <div className="flex gap-4 border-b border-white/30 pb-1">
                  <button 
                    onClick={() => {
                      setUserManagementSubTab('user-assignments');
                      addToast('Viewing User Profile Assignments');
                    }}
                    className={cx(
                      "pb-3 text-xs font-bold transition-all relative",
                      userManagementSubTab === 'user-assignments' 
                        ? "text-[var(--teal-primary)] font-extrabold" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    User Assignments
                    {userManagementSubTab === 'user-assignments' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--teal-primary)] rounded-full animate-fadeIn" />
                    )}
                  </button>

                  <button 
                    onClick={() => {
                      setUserManagementSubTab('page-access');
                      addToast('Viewing Page View Access Matrix');
                    }}
                    className={cx(
                      "pb-3 text-xs font-bold transition-all relative",
                      userManagementSubTab === 'page-access' 
                        ? "text-[var(--teal-primary)] font-extrabold" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    Page View Access Matrix
                    {userManagementSubTab === 'page-access' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--teal-primary)] rounded-full animate-fadeIn" />
                    )}
                  </button>
                </div>

                {userManagementSubTab === 'user-assignments' ? (
                  <div className="space-y-6">
                    {/* Session Card & Authorization preview simulator widgets */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Active user details card */}
                      <div className="p-6 rounded-2xl bg-white/25 border border-white/50 space-y-4 shadow premium-shadow flex flex-col justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-[var(--teal-primary)] text-white font-extrabold flex items-center justify-center shadow-lg text-lg">
                            TP
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[var(--text-primary)]">TJ Padilla</h4>
                            <span className="text-[10px] font-mono text-[var(--text-tertiary)]">robertp@careindeed.com</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 rounded uppercase tracking-wider">
                            ACTIVE SESSION
                          </span>
                          <span className="px-2.5 py-1 text-[9px] font-extrabold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/20 rounded uppercase tracking-wider">
                            UM WRITE ACCESS
                          </span>
                          <span className="px-2.5 py-1 text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 rounded uppercase tracking-wider">
                            PAGE-ACCESS MANAGER
                          </span>
                        </div>
                      </div>

                      {/* Deterministic Authorization preview module */}
                      <div className="p-6 rounded-2xl bg-white/25 border border-white/50 space-y-4 shadow premium-shadow">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                          Authorization Preview Evaluator
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Permission Target</label>
                            <select 
                              value={authTestPermission}
                              onChange={(e) => setAuthTestPermission(e.target.value)}
                              className="w-full bg-white px-3 py-2 border border-neutral-200 text-[var(--text-primary)] rounded-lg outline-none font-semibold"
                            >
                              <option value="policy.approve">policy.approve</option>
                              <option value="ceu.override">ceu.override</option>
                              <option value="policy.draft">policy.draft</option>
                              <option value="phi.write">phi.write</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-[var(--text-secondary)]">Resource Scope ID</label>
                            <input 
                              type="text"
                              value={authTestResource}
                              onChange={(e) => setAuthTestResource(e.target.value)}
                              placeholder="e.g. demo-resource"
                              className="w-full bg-white px-3 py-2 border border-neutral-200 text-[var(--text-primary)] rounded-lg outline-none font-semibold"
                            />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 font-mono text-[10px] leading-relaxed">
                          {authResult}
                        </div>
                      </div>
                    </div>

                    {/* Users Directory List (Polished text colors, strictly matching image_d0dae4.jpg) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--teal-primary)]">
                          Assigned Organization Staff Members ({identityUsers.length})
                        </h3>
                        <button 
                          onClick={() => setShowAddTaskModal(true)}
                          className="rounded-full bg-[var(--teal-primary)] text-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Plus size={14} /> Add User
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-xl premium-shadow">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                                <th className="p-4.5 border-b border-white/20">User Details</th>
                                <th className="p-4.5 border-b border-white/20">Group / Role</th>
                                <th className="p-4.5 border-b border-white/20">Status</th>
                                <th className="p-4.5 border-b border-white/20">Scope Registry</th>
                                <th className="p-4.5 border-b border-white/20">Effective Date</th>
                                <th className="p-4.5 border-b border-white/20 text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                              {identityUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-white/30 transition-all">
                                  <td className="p-4.5">
                                    <div className="font-bold text-[var(--text-primary)]">{u.name}</div>
                                    <div className="text-[10px] text-[var(--text-tertiary)] font-mono">{u.email}</div>
                                  </td>
                                  <td className="p-4.5 whitespace-nowrap">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[var(--teal-primary)]/10 text-[var(--teal-primary)] border border-[var(--teal-primary)]/15">
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="p-4.5">
                                    <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      {u.status}
                                    </span>
                                  </td>
                                  <td className="p-4.5 text-[var(--text-secondary)] font-mono whitespace-nowrap">{u.scope}</td>
                                  <td className="p-4.5 text-[var(--text-tertiary)] whitespace-nowrap">{u.effective}</td>
                                  <td className="p-4.5">
                                    <div className="flex gap-1.5 justify-center">
                                      <button 
                                        onClick={() => addToast(`Editing profiles for ${u.name}`)}
                                        className="px-2.5 py-1 rounded bg-white/40 text-[10px] font-bold text-[var(--text-secondary)] border border-white/20 shadow-sm hover:bg-white/70"
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        onClick={() => deleteUser(u.id, u.name)}
                                        className="px-2.5 py-1 rounded bg-rose-500 text-white text-[10px] font-bold border border-rose-600 shadow-sm hover:bg-rose-600"
                                      >
                                        Delete
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setSelectedAuditUser(u);
                                          setShowAuditLogsModal(true);
                                          addToast(`Access & logs pulled for ${u.name}`);
                                        }}
                                        className="px-2.5 py-1 rounded bg-white/40 text-[10px] font-bold text-[var(--text-secondary)] border border-white/20 shadow-sm hover:bg-white/70"
                                      >
                                        Access
                                      </button>
                                      <button 
                                        onClick={() => addToast(`Triggered dynamic credential keys reset for ${u.name}`, 'info')}
                                        className="px-2.5 py-1 rounded bg-white/40 text-[10px] font-bold text-[var(--text-secondary)] border border-white/20 shadow-sm hover:bg-white/70"
                                      >
                                        Password
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-5 rounded-2xl bg-white/20 border border-white/50 space-y-2 premium-shadow">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--teal-primary)]">
                        Compliance Control - Page View Access Matrix
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Customize visual visibility privileges for each layout section. Intended to enforce HIPAA Patient Health Information (PHI) locks and audit requirements.
                      </p>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/40 bg-white/10 shadow-xl premium-shadow">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-white/35 text-[var(--teal-primary)] font-bold uppercase tracking-wider text-[10px]">
                              <th className="p-4.5 border-b border-white/20">Layout Page / Directory</th>
                              <th className="p-4.5 border-b border-white/20 text-center">Super Admin</th>
                              <th className="p-4.5 border-b border-white/20 text-center">Admin</th>
                              <th className="p-4.5 border-b border-white/20 text-center">Compliance</th>
                              <th className="p-4.5 border-b border-white/20 text-center">Auditor</th>
                              <th className="p-4.5 border-b border-white/20 text-center">RN</th>
                              <th className="p-4.5 border-b border-white/20 text-center">LVN</th>
                              <th className="p-4.5 border-b border-white/20 text-center">CHHA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {pageViewRules.map((rule, ruleIdx) => (
                              <tr key={ruleIdx} className="hover:bg-white/30 transition-all">
                                <td className="p-4.5 font-bold text-[var(--text-primary)]">
                                  {rule.page}
                                </td>
                                {[
                                  { key: 'superAdmin', label: 'Super Admin' },
                                  { key: 'admin', label: 'Admin' },
                                  { key: 'compliance', label: 'Compliance' },
                                  { key: 'auditor', label: 'Auditor' },
                                  { key: 'rn', label: 'RN' },
                                  { key: 'lvn', label: 'LVN' },
                                  { key: 'chha', label: 'CHHA' }
                                ].map((roleMap) => (
                                  <td key={roleMap.key} className="p-4.5 text-center">
                                    <button 
                                      onClick={() => togglePageAccessRule(ruleIdx, roleMap.key)}
                                      className={cx(
                                        "px-2.5 py-1 rounded-full text-[9px] font-extrabold border transition-all shadow-sm",
                                        rule[roleMap.key] 
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200" 
                                          : "bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200"
                                      )}
                                    >
                                      {rule[roleMap.key] ? 'ALLOWED' : 'LOCKED'}
                                    </button>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT SIDE PANEL (PERSONAL OPERATIONS DRAWER) */}
        <aside 
          className={cx(
            "relative z-20 h-full flex flex-col bg-transparent backdrop-blur-[33px] transition-all duration-300 ease-in-out border-l border-white/25 select-none overflow-hidden shrink-0",
            isPersonalOpsOpen ? "w-[340px] px-6 py-6 bg-white/10" : "w-0 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar space-y-6">
            
            <div className="space-y-6">
              
              <div className="flex justify-end items-center">
                <button
                  onClick={() => {
                    handleSetPersonalOpsOpen(false);
                    addToast('Personal panel minimized.');
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
                  Active Metadata Logs
                </h4>
                <div className="space-y-1.5">
                  {[
                    { count: `${identityUsers.length}`, label: 'Assigned Core Members', color: 'text-[var(--teal-primary)]' },
                    { count: '10', label: 'Primary Roles Configured', color: 'text-[var(--teal-primary)]' },
                    { count: '11', label: 'System Permissions Catalogs', color: 'text-[var(--teal-primary)]' }
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        addToast(`Identity focus details: ${item.label}`);
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

            </div>

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

      {/* FLOATING ACTION CONTROL DOCK (From vertical accessory dock in image_d0db84.png) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3 select-none">
        
        {/* Dock Pill */}
        <div className="flex flex-col gap-2 p-2 rounded-full bg-white/80 text-[var(--text-secondary)] border border-white/70 shadow-[0_18px_45px_rgba(82,77,75,0.14)] backdrop-blur-xl animate-fadeIn">
          {/* Drag Handle Indicator */}
          <div className="flex flex-col items-center gap-1 py-1 cursor-grab" title="Hold Dock Widget">
            <span className="h-1 w-4 bg-slate-500 rounded" />
            <span className="h-1 w-4 bg-slate-500 rounded" />
          </div>

          {/* Sparkle AI Assist Toggle */}
          <button 
            onClick={() => {
              setIsBradOpen(!isBradOpen);
              addToast(isBradOpen ? "Minimized Brad Assist Overlay" : "Launched Brad Assistant Dock", 'info');
            }}
            className={cx(
              "p-2.5 rounded-full transition-all duration-300",
              isBradOpen ? "bg-[var(--teal-primary)] text-white scale-110" : "bg-transparent text-[var(--text-secondary)] hover:bg-white/60"
            )}
            title="Toggle Brad AI Assistant"
          >
            <Sparkles size={16} />
          </button>

          {/* Checklist expand toggle */}
          <button 
            onClick={() => {
              setIsUatOpen(!isUatOpen);
              addToast(isUatOpen ? "Docked checklist panel" : "Expanded Guided checklist", 'info');
            }}
            className={cx(
              "p-2.5 rounded-full transition-all duration-300",
              isUatOpen ? "bg-[var(--orange-primary)] text-white scale-110" : "bg-transparent text-[var(--text-secondary)] hover:bg-white/60"
            )}
            title="Toggle Guided UAT Panel"
          >
            <Compass size={16} />
          </button>
        </div>

      </div>

      {/* 1. GUIDED UAT CHECKLIST (Glassmorphism layout modeled directly from image_d0db84.png) */}
      {isUatOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 rounded-2xl text-[var(--text-primary)] glass-panel animate-fadeIn">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/40 pb-3">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[var(--teal-primary)]" />
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] font-heading">GUIDED UAT</h4>
                  <p className="text-[9px] text-[var(--text-tertiary)] font-mono">
                    {uatCheckpoints.filter(c => c.checked).length}/6 operational checkpoints
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsUatOpen(false);
                  addToast('Guided UAT checklist closed. Use the floating accessory panel to reopen.');
                }}
                className="p-1 rounded-full hover:bg-white/35 text-[var(--text-tertiary)]"
                title="Hide Panel"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {uatCheckpoints.map((cp) => (
                <div 
                  key={cp.id}
                  onClick={() => {
                    setUatCheckpoints(prev => prev.map(item => {
                      if (item.id === cp.id) {
                        const nextState = !item.checked;
                        addToast(`${nextState ? 'Completed' : 'Reset'} checkpoint: ${item.label}`, 'info');
                        return { ...item, checked: nextState };
                      }
                      return item;
                    }));
                  }}
                  className={cx(
                    "p-2 rounded-xl flex items-center gap-2.5 cursor-pointer border transition-all text-xs font-semibold",
                    cp.checked 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800" 
                      : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-white/45"
                  )}
                >
                  <div className={cx(
                    "h-4 w-4 rounded-full border flex items-center justify-center shrink-0",
                    cp.checked ? "bg-emerald-500 border-emerald-600 text-white" : "border-slate-300 bg-white"
                  )}>
                    {cp.checked && <Check size={11} />}
                  </div>
                  <span className="truncate">{cp.label}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/40 text-[10px] text-center">
              <button 
                onClick={() => {
                  setUatCheckpoints(prev => prev.map(item => ({ ...item, checked: true })));
                  addToast('All operational checkpoints cleared!', 'success');
                }}
                className="text-[var(--teal-primary)] hover:underline font-bold"
              >
                Mark all completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. BRAD AI ASSISTANT OVERLAY (Glassmorphism layout modeled directly from image_d0db84.png) */}
      {isBradOpen && (
        <div className="fixed bottom-24 right-6 lg:right-96 z-50 w-full max-w-sm rounded-2xl text-[var(--text-primary)] glass-panel animate-fadeIn">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-[var(--teal-primary)] text-white flex items-center justify-center font-bold relative shrink-0">
                  Brad
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)] font-heading">BRAD I ADMINISTRATOR</h4>
                  <p className="text-[8px] text-[var(--text-tertiary)] uppercase font-extrabold tracking-wider">Identity Core Coordinator</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBradOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/35 text-[var(--text-tertiary)]"
                title="Hide Assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Suggested Missions list */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Suggested Missions</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSendBradMessage('Run pre-survey audit')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-white/250 hover:bg-white/80 text-[var(--text-secondary)] rounded-full transition-colors border border-white/60 shadow-sm"
                >
                  Run pre-survey audit
                </button>
                <button 
                  onClick={() => handleSendBradMessage('Identify QAPI gaps')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-white/250 hover:bg-white/80 text-[var(--text-secondary)] rounded-full transition-colors border border-white/60 shadow-sm"
                >
                  Identify QAPI gaps
                </button>
                <button 
                  onClick={() => handleSendBradMessage('Show missing forms')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-white/250 hover:bg-white/80 text-[var(--text-secondary)] rounded-full transition-colors border border-white/60 shadow-sm"
                >
                  Show missing forms
                </button>
              </div>
            </div>

            {/* Chat message box log stack */}
            <div className="h-40 overflow-y-auto border border-white/40 rounded-xl p-3 bg-white/20 space-y-3 custom-scrollbar text-xs">
              {bradLogs.map((log, lIdx) => (
                <div 
                  key={lIdx} 
                  className={cx(
                    "p-2.5 rounded-xl max-w-[85%] leading-relaxed font-medium shadow-sm",
                    log.sender === 'brad' 
                      ? "bg-white/60 text-[var(--text-primary)] self-start border border-white/40" 
                      : "bg-[var(--orange-primary)] text-white ml-auto"
                  )}
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Interactive chat controls and text field */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={bradChatQuery}
                onChange={(e) => setBradChatQuery(e.target.value)}
                placeholder="Ask Brad what you need..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendBradMessage(); }}
                className="flex-1 bg-white/60 border border-white/50 px-3 py-2 text-xs rounded-xl text-[var(--text-primary)] outline-none placeholder-[var(--text-tertiary)]"
              />
              <button 
                onClick={() => handleSendBradMessage()}
                className="px-3.5 py-2 rounded-xl bg-[var(--orange-primary)] hover:bg-[var(--orange-primary)]/90 text-white text-xs font-bold transition-all shadow-sm"
              >
                Run
              </button>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/40">
              <button 
                onClick={() => {
                  setUatCheckpoints(prev => prev.map(item => ({ ...item, checked: true })));
                  addToast('UAT checkpoints completed via Brad assistant guidance!', 'success');
                }}
                className="flex-1 text-center bg-white/40 hover:bg-white/60 text-[var(--teal-primary)] py-1.5 rounded-xl text-[10px] font-bold transition-all border border-white/30"
              >
                Start Guided Tour
              </button>
              <button 
                onClick={() => {
                  setIsBradOpen(false);
                  addToast('UAT preparation paused.');
                }}
                className="flex-1 text-center bg-white/20 hover:bg-white/40 text-[var(--text-secondary)] py-1.5 rounded-xl text-[10px] font-bold transition-all"
              >
                Skip For Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PROVISION ADMIN MEMBER MODAL OVERLAY */}
      {showAddTaskModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
          onClick={() => setShowAddTaskModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[var(--drawer-bg)] rounded-3xl p-7 space-y-6 shadow-[0_18px_45px_rgba(82,77,75,0.14)] border border-white text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[var(--teal-primary)]" />
                <h3 className="font-heading text-lg font-extrabold text-[var(--teal-primary)]">
                  Provision Admin Member Account
                </h3>
              </div>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-full hover:bg-white/35 text-[var(--text-tertiary)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Full Username</label>
                <input 
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Primary Email Address</label>
                <input 
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. marcus@careindeed.com"
                  className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Functional Role</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl outline-none text-[var(--text-primary)] font-semibold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="RN">RN</option>
                    <option value="LVN">LVN</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[var(--teal-primary)] uppercase tracking-wider">Scope Key</label>
                  <input 
                    type="text"
                    value={newUserScope}
                    onChange={(e) => setNewUserScope(e.target.value)}
                    placeholder="org:careindeed-clinical"
                    className="w-full bg-white border border-neutral-200 px-3 py-2.5 rounded-xl outline-none focus:border-[var(--teal-primary)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-[var(--teal-primary)] text-white py-2.5 rounded-xl font-bold hover:bg-[var(--teal-primary)]/90 transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check size={14} /> Provision Member
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2.5 border rounded-xl text-[var(--text-secondary)] font-bold hover:bg-neutral-100 border-neutral-200"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. CLINICIAN ACCESS & INTEGRITY LOGS OVERLAY */}
      {showAuditLogsModal && selectedAuditUser && (
        <div 
          className="fixed inset-0 z-50 bg-[#6B5A50]/14 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn"
          onClick={() => setShowAuditLogsModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-[var(--drawer-bg)] rounded-3xl p-7 space-y-5 shadow-[0_18px_45px_rgba(82,77,75,0.14)] border border-white text-[var(--text-primary)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-[var(--orange-primary)]" />
                <h3 className="font-heading text-base font-extrabold text-[var(--teal-primary)]">
                  Access & Security Trace: {selectedAuditUser.name}
                </h3>
              </div>
              <button 
                onClick={() => setShowAuditLogsModal(false)}
                className="p-1.5 rounded-full hover:bg-white/35 text-[var(--text-tertiary)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-white/40 p-3 rounded-xl border border-white">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Scope Key</span>
                  <span className="font-mono font-bold text-[var(--teal-primary)]">{selectedAuditUser.scope}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Verification Status</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Cleared Safe Mode
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-[var(--teal-primary)] uppercase tracking-wider">Dynamic Security Events Log</h4>
                <div className="bg-neutral-100 p-3.5 rounded-xl border border-neutral-200 font-mono text-[9px] space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex gap-2">
                    <span className="text-[var(--orange-primary)] shrink-0">[12:44:21 PDT]</span>
                    <span className="text-neutral-600">Active session initiated under scope: {selectedAuditUser.scope}. Handshake success.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--orange-primary)] shrink-0">[11:15:02 PDT]</span>
                    <span className="text-neutral-600">Biometric Safe Mode validation completed. No clinical patient violations detected.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--orange-primary)] shrink-0">[10:02:44 PDT]</span>
                    <span className="text-neutral-600">Phase A identity access mappings downloaded. 10 primary rules active.</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => {
                    addToast(`Security tokens rotated for ${selectedAuditUser.name}.`, 'success');
                    setShowAuditLogsModal(false);
                  }}
                  className="flex-1 bg-[var(--teal-primary)] text-white py-2 rounded-xl font-bold hover:bg-[var(--teal-primary)]/90 transition-colors shadow-sm"
                >
                  Rotate Security Key
                </button>
                <button 
                  onClick={() => setShowAuditLogsModal(false)}
                  className="px-4 py-2 border rounded-xl text-neutral-600 font-bold hover:bg-neutral-100 border-neutral-200"
                >
                  Close Trace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM TOAST ALERTS */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-white/90 p-4.5 shadow-xl text-xs font-semibold text-[var(--text-primary)] border border-white/50 animate-fadeIn flex items-center gap-3 min-w-[300px] pointer-events-auto"
          >
            <div className={cx(
              "h-2 w-2 rounded-full shrink-0", 
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