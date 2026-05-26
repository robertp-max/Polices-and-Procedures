// V3.2 Staging App — Base design refresh
// Route: /ui-staging/v32
// V3_SYNTHETIC_FALLBACK: this route is a labeled preview shell until
// Phase 3 content parity and Phase 4 workflow interiors are wired.
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, ShieldCheck,
  FileText, ShieldX,
  LayoutDashboard, Users, Calendar, FileSearch, HelpCircle,
  Menu, Search, X, User, Bell, Bot, Network, UserPlus, FolderOpen,
  ArrowUpCircle, Shield, CheckSquare, ChevronDown, ChevronRight
} from 'lucide-react';
import { PolicyLibraryDocumentView } from '@/policy/components/PolicyLibraryDocumentView';
import { FormBody } from '@/policy/components/FormViewer';
import { frameworkPolicies } from '@/policy/data/frameworkSeed.generated';
import { getPolicyBody, getPolicyContent } from '@/policy/data/policyContentMap';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import { printForm } from '@/policy/utils/printForm';
import { ALL_MODULES } from '@/policy/journey/data/modules';
import { V3_ExecutionUnitsSeed, V3_SprintContextSeed } from '@/policy/ces/data/V3_CES_SeedData';
import { V3_AUDIT_LOG, V3_FORMS } from '@/policy/ces/data/V3_AppSeedPrimitives';
import type { ExecutionUnit } from '@/policy/ces/types';
import { useCesDurableExecutionAdapter } from '@/ui-staging/ces/cesDurableExecutionAdapter';

// Safe alias for Search icon to prevent import mismatches
const SearchIcon = Search;

// ============================================================
// TYPES & CONTEXT SHIMS
// ============================================================
interface KpiCardData {
  label: string;
  value: string;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  alert?: boolean;
  onClick?: () => void;
}

type NavStatus =
  | 'LIVE_ROUTE_HANDOFF'
  | 'V3_RENDERER_ADAPTER'
  | 'V3_SYNTHETIC_FALLBACK'
  | 'BLOCKED_PENDING_PHASE_3'
  | 'BLOCKED_PENDING_PHASE_4';

interface NavItem {
  id: string;
  icon: any;
  label: string;
  status: NavStatus;
  route?: string;
  blocker?: string;
  submenu?: Array<Omit<NavItem, 'icon' | 'submenu'>>
}

interface LiveRouteHandoff {
  title: string;
  route: string;
  seedingLevel: 'registry seeded' | 'content seeded' | 'renderer seeded' | 'workflow wired' | 'V3_SYNTHETIC_FALLBACK';
  missing: string;
}

const LIVE_ROUTE_HANDOFFS: Record<string, LiveRouteHandoff> = {
  clinicians: {
    title: 'Clinician Profiles',
    route: '/clinicians',
    seedingLevel: 'registry seeded',
    missing: 'Profile list/detail rendering is not mounted as a V3 staging surface yet.',
  },
  patients: {
    title: 'Patient Profiles',
    route: '/patients',
    seedingLevel: 'registry seeded',
    missing: 'Patient profile list/detail rendering is not mounted as a V3 staging surface yet.',
  },
  calendar: {
    title: 'Scheduling & Visits',
    route: '/calendar',
    seedingLevel: 'registry seeded',
    missing: 'Calendar event intelligence and visit/task workflow interiors are not wired in V3 staging.',
  },
  ces: {
    title: 'Compliance Execution (CES)',
    route: '/calendar?view=sprint',
    seedingLevel: 'V3_SYNTHETIC_FALLBACK',
    missing: 'The in-shell CES board is preview-only. Task interiors, evidence mutation, signatures, approvals, and audit history remain outside this patch.',
  },
  taxonomy: {
    title: 'Taxonomy',
    route: '/taxonomy',
    seedingLevel: 'registry seeded',
    missing: 'Taxonomy hierarchy rendering is not mounted as a V3 staging surface yet.',
  },
  evidence: {
    title: 'Evidence Center',
    route: '/evidence',
    seedingLevel: 'V3_SYNTHETIC_FALLBACK',
    missing: 'Evidence/artifact viewer, chain-of-custody mutations, and approvals are not wired in V3 staging.',
  },
  hubstaff: {
    title: 'Hubstaff',
    route: '/hubstaff',
    seedingLevel: 'registry seeded',
    missing: 'Hubstaff operational surfaces are not mounted as V3 staging renderers yet.',
  },
  'help-center': {
    title: 'Help Center',
    route: '/help',
    seedingLevel: 'registry seeded',
    missing: 'Help-center content rendering is not mounted as a V3 staging surface yet.',
  },
  admin: {
    title: 'Admin',
    route: '/admin',
    seedingLevel: 'registry seeded',
    missing: 'Admin settings and permission workflows are not mounted as V3 staging surfaces yet.',
  },
};

// ============================================================
// V3 PREMIUM GLASS TOKENS & STYLES
// ============================================================
const V3 = {
  baseBg: '#05060A', 
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',
  
  glass1: 'transparent',
  glass2: 'rgba(255, 255, 255, 0.04)', 
  glass3: 'rgba(255, 255, 255, 0.015)',
  
  teal: '#007970',
  tealLight: '#00D1C1', 
  orange: '#E07B2C',
  orangeLight: '#FFA059', 
  
  textPrimary: '#FFFFFF', 
  textSecondary: '#94A3B8', 
  textTertiary: '#64748B', 
  
  borderDefault: 'rgba(255, 255, 255, 0.15)',
  borderHighlight: 'rgba(255, 255, 255, 0.33)', 
  glowSubtle: 'none',
} as const;

// ============================================================
// GLOBAL STYLESHEET INJECTOR
// ============================================================
const GlobalStylesheetInjector = () => (
  <style dangerouslySetInnerHTML={{__html: `
    /* Hide scrollbars globally but preserve functionality */
    .no-scrollbar::-webkit-scrollbar { display: none !important; }
    .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    
    *::-webkit-scrollbar { display: none !important; }
    * { -ms-overflow-style: none !important; scrollbar-width: none !important; }

    /* Fade-only preview animation: no transform/depth effects in V3 */
    @keyframes fadeInUp {
      from { opacity: 0; filter: blur(2px); }
      to { opacity: 1; filter: blur(0); }
    }
    .animate-butter-shift {
      animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideDownIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-slide-down {
      animation: slideDownIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* Glare hover animation effect */
    .v3-invisible-glare {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      transition: background 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
      will-change: background-color, border-color;
    }
    .v3-invisible-glare:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.005) 100%) !important;
      border-color: rgba(0, 242, 224, 0.3) !important; 
    }

    /* Generic UI button timings */
    .btn-smooth-hover {
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    .btn-smooth-hover:hover {
      background: rgba(0, 209, 193, 0.08) !important;
      border-color: rgba(0, 209, 193, 0.3) !important;
    }

    /* Command Center Neon Highlights */
    .v3-neon-orange {
      color: #FFA059 !important;
      text-shadow: 0 0 10px rgba(255, 160, 89, 0.45) !important;
    }
    .v3-neon-teal {
      color: #00D1C1 !important;
      text-shadow: 0 0 10px rgba(0, 209, 193, 0.45) !important;
    }

    /* Selection & Focus */
    ::selection { background: rgba(0,209,193,0.20); color: #fff; }
    :focus-visible { outline: 1px solid #00D1C1 !important; outline-offset: 2px !important; }
  `}} />
);


// ============================================================
// V3_SYNTHETIC_FALLBACK preview data. These records are intentionally not
// production parity and must not be used for completion claims.
// ============================================================
interface TaskItem {
  id: string; domain: string; code: string; title: string; dueDate: string; overdue: boolean; status: 'open' | 'overdue' | 'pending' | 'completed';
}

const INITIAL_PLANNED_TASKS: TaskItem[] = [
  { id: 't-1', domain: 'CLINICAL', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', dueDate: 'May 20', overdue: false, status: 'open' },
  { id: 't-2', domain: 'CLINICAL', code: 'CL-WP-25', title: 'Review aggregate quality trends from CL-WP-25, 27', dueDate: 'May 18', overdue: true, status: 'overdue' },
  { id: 't-3', domain: 'CLINICAL', code: 'CC-WP-22', title: 'Review compliance/billing audit results from CC-WP-22, 30', dueDate: 'May 19', overdue: true, status: 'overdue' },
  { id: 't-4', domain: 'CLINICAL', code: 'DM-WP-18', title: 'Review HO audit results from DM-WP-18, 21', dueDate: 'May 21', overdue: false, status: 'open' },
  { id: 't-5', domain: 'CLINICAL', code: 'DM-WP-15', title: 'Review data/safety audit results from DM-WP-15, 20', dueDate: 'May 22', overdue: false, status: 'open' },
  { id: 't-6', domain: 'CLINICAL', code: 'IT-WP-21', title: 'Review IT/security audit results from IT-WP-21, 25', dueDate: 'May 23', overdue: false, status: 'open' },
];

const INTRO_CHATS = [
  { sender: 'Brad', msg: 'V3_SYNTHETIC_FALLBACK: this copilot preview returns canned responses until the live grounded action layer is wired.' },
];


// ============================================================
// SHELL FRAME & NAVIGATION
// ============================================================
const ShellContentFrame = ({ children, className, isMobile, activeSection, setActiveSection, isNavOpen, setIsNavOpen, isPlannerView, setIsPlannerView }: any) => {
  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', status: 'V3_SYNTHETIC_FALLBACK' },
        { id: 'profiles', icon: Users, label: 'Profiles', status: 'LIVE_ROUTE_HANDOFF', submenu: [
          { id: 'clinicians', label: 'Clinician Profiles', status: 'LIVE_ROUTE_HANDOFF', route: '/clinicians' },
          { id: 'patients', label: 'Patient Profiles', status: 'LIVE_ROUTE_HANDOFF', route: '/patients' },
        ] },
        { id: 'calendar', icon: Calendar, label: 'Scheduling & Visits', status: 'LIVE_ROUTE_HANDOFF', route: '/calendar' },
        { id: 'brad', icon: Bot, label: 'Brad AI Copilot', status: 'V3_SYNTHETIC_FALLBACK' },
        { id: 'ces', icon: ShieldCheck, label: 'Compliance Execution (CES)', status: 'LIVE_ROUTE_HANDOFF', route: '/calendar?view=sprint' },
      ]
    },
    {
      title: 'COMPLIANCE EXECUTION',
      items: [
        { id: 'taxonomy', icon: Network, label: 'Taxonomy', status: 'LIVE_ROUTE_HANDOFF', route: '/taxonomy' },
        { id: 'onboarding', icon: UserPlus, label: 'Onboarding', status: 'V3_RENDERER_ADAPTER' },
        { id: 'policy', icon: FileText, label: 'Policy Lifecycle', status: 'V3_RENDERER_ADAPTER' },
        { id: 'forms', icon: FileSearch, label: 'Forms Library', status: 'V3_RENDERER_ADAPTER' },
        { id: 'evidence', icon: FolderOpen, label: 'Evidence Center', status: 'LIVE_ROUTE_HANDOFF', route: '/evidence' },
      ]
    },
    {
      title: 'ADMINISTRATION & KNOWLEDGE',
      items: [
        { id: 'hubstaff', icon: ArrowUpCircle, label: 'Hubstaff', status: 'LIVE_ROUTE_HANDOFF', route: '/hubstaff' },
        { id: 'help-center', icon: HelpCircle, label: 'Help Center', status: 'LIVE_ROUTE_HANDOFF', route: '/help' },
        { id: 'admin', icon: Shield, label: 'Admin', status: 'LIVE_ROUTE_HANDOFF', route: '/admin' },
      ]
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ profiles: true, evidence: true });
  const toggleSubmenu = (menuId: string) => setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));

  const handleNav = (item: NavItem | Omit<NavItem, 'icon' | 'submenu'>) => {
    setActiveSection(item.id);
    if (isMobile) {
      setIsNavOpen(false);
    }
  };

  const statusLabel = (status: NavStatus) => {
    switch (status) {
      case 'LIVE_ROUTE_HANDOFF': return 'LIVE ROUTE';
      case 'V3_RENDERER_ADAPTER': return 'RENDERER';
      case 'V3_SYNTHETIC_FALLBACK': return 'PREVIEW DATA';
      case 'BLOCKED_PENDING_PHASE_3': return 'PHASE 3';
      case 'BLOCKED_PENDING_PHASE_4': return 'PHASE 4';
    }
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', boxSizing: 'border-box',
      color: V3.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", padding: isMobile ? '0' : '20px', overflow: 'hidden', position: 'relative',
      backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)
      `,
      backgroundSize: '24px 24px, 24px 24px, 100% 100%', backgroundBlendMode: 'screen, screen, normal'
    }}>
      <GlobalStylesheetInjector />
      
      {/* Decorative Brand Accent Background glow */}
      <div style={{
        position: 'absolute', top: '10%', right: '15%', width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(0, 121, 112, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} />
      
      {/* Main Glass Card Frame */}
      <div style={{
        display: 'flex', flexDirection: 'column', width: isMobile ? '100%' : '90%', minWidth: isMobile ? '100%' : 'min(1200px, 95vw)', maxWidth: '100%',
        height: isMobile ? '100vh' : '90vh', margin: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: isMobile ? '0' : '20px', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(16, 22, 34, 0.95) 0%, rgba(8, 12, 19, 0.98) 100%)', 
        backdropFilter: 'blur(32px) saturate(120%)', WebkitBackdropFilter: 'blur(32px) saturate(120%)',
        boxShadow: 'none', position: 'relative', zIndex: 2 
      }}>
        
        {/* INTEGRATED APPLICATION TOP BAR */}
        <header style={{ 
          height: '64px', flexShrink: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255, 255, 255, 0.01)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 24px', zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)} className="btn-smooth-hover"
              style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.15)', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: V3.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '6px 14px', width: isMobile ? '140px' : '260px', transition: 'all 0.3s' }}>
              <Search size={14} color={V3.textTertiary} />
              <input readOnly aria-label="Search blocked outside Phase 3" title="BLOCKED_PENDING_PHASE_4 — global search is outside Phase 3 content renderer parity." placeholder="Search blocked outside Phase 3" style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '12px', cursor: 'default' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeSection === 'dashboard' && (
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button 
                  onClick={() => setIsPlannerView(false)}
                  style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', transition: '0.2s', background: !isPlannerView ? V3.tealLight : 'transparent', color: !isPlannerView ? '#020617' : V3.textSecondary }}
                >Agency View</button>
                <button 
                  onClick={() => setIsPlannerView(true)}
                  style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', transition: '0.2s', background: isPlannerView ? V3.tealLight : 'transparent', color: isPlannerView ? '#020617' : V3.textSecondary }}
                >My Planner</button>
              </div>
            )}
            {!isMobile && <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.3px', color: V3.textPrimary }}>CareIndeed</span>}
            <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: `linear-gradient(135deg, ${V3.teal}, #00b4a6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>CI</div>
          </div>
        </header>

        {/* SIDEBAR & DYNAMIC CONTAINER PANEL */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          
          <nav className="no-scrollbar" style={{
            width: isNavOpen ? '240px' : '0px', minWidth: isNavOpen ? (isMobile ? '100%' : '240px') : '0px', opacity: isNavOpen ? 1 : 0,
            transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
            background: 'rgba(10, 15, 26, 0.95)', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 50, display: 'flex', flexDirection: 'column', overflowY: 'auto',
            position: isMobile && isNavOpen ? 'absolute' : 'relative', top: 0, bottom: 0, left: 0, height: '100%', willChange: 'width, opacity',
          }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: V3.textTertiary }}>NAVIGATION</span>
              <button onClick={() => setIsNavOpen(false)} style={{ background: 'transparent', border: 'none', color: V3.textTertiary, cursor: 'pointer' }}><X size={16} /></button>
            </div>
            
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
              {navSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ padding: '0 12px', marginBottom: '6px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: V3.textTertiary }}>{section.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {section.items.map((item, i) => (
                      <div key={i}>
                        <button 
                          onClick={() => item.submenu ? toggleSubmenu(item.id) : handleNav(item)}
                          style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                            background: activeSection === item.id ? 'rgba(0, 209, 193, 0.08)' : 'transparent', 
                            color: activeSection === item.id ? V3.textPrimary : V3.textSecondary,
                            transition: '0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <item.icon size={16} color={activeSection === item.id ? V3.tealLight : V3.textTertiary} />
                            <span style={{ fontSize: '12.5px', fontWeight: activeSection === item.id ? 600 : 500 }}>{item.label}</span>
                            {!item.submenu && <span style={{ fontSize: '8px', color: V3.textTertiary, letterSpacing: '0.4px' }}>{statusLabel(item.status)}</span>}
                          </div>
                          {item.submenu && (expandedMenus[item.id] ? <ChevronDown size={12} color={V3.textTertiary} /> : <ChevronRight size={12} color={V3.textTertiary} />)}
                        </button>
                        {item.submenu && expandedMenus[item.id] && (
                          <div style={{ paddingLeft: '16px', marginTop: '2px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {item.submenu.map((sub, sIdx) => (
                              <button key={sIdx} onClick={() => handleNav(sub)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%', padding: '6px 12px', fontSize: '11.5px', color: activeSection === sub.id ? V3.textPrimary : V3.textSecondary, background: activeSection === sub.id ? 'rgba(0, 209, 193, 0.05)' : 'transparent', border: 'none', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' }}>
                                <span>{sub.label}</span>
                                <span style={{ fontSize: '8px', color: V3.textTertiary, letterSpacing: '0.4px' }}>{statusLabel(sub.status)}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={15} color={V3.textSecondary} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: V3.textPrimary }}>Manager User</span>
                  <span style={{ fontSize: '10px', color: V3.textTertiary }}>Active Session</span>
                </div>
              </div>
              <button disabled aria-label="Notifications blocked in Phase 2" title="BLOCKED_PENDING_PHASE_4 — notification actions are outside Phase 2." style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'not-allowed', opacity: 0.55 }}>
                <Bell size={16} color={V3.textSecondary} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', background: V3.tealLight, borderRadius: '50%' }} />
              </button>
            </div>
          </nav>

          {/* DYNAMIC CONTENT SPACE */}
          <div className={`no-scrollbar ${className}`} style={{ flex: 1, padding: isMobile ? '16px' : '24px 32px 32px 32px', overflowY: 'auto', overflowX: 'hidden', background: 'transparent' }}>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

// ============================================================
// CORE CARDS & COMPONENTS
// ============================================================
const ActionButton = ({ children, onClick, variant, ...rest }: any) => (
  <button {...rest} onClick={onClick} className="btn-smooth-hover" style={{ padding: '8px 16px', background: variant === 'danger' ? 'rgba(0, 209, 193, 0.1)' : 'transparent', color: variant === 'danger' ? V3.tealLight : V3.textSecondary, border: `1px solid rgba(0, 209, 193, 0.3)`, borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: '0.2s', ...(rest.style ?? {}) }}>{children}</button>
);

const OpenLiveRouteButton = ({ route }: { route: string }) => (
  <ActionButton onClick={() => window.open(route, '_blank', 'noopener,noreferrer')}>
    Open live route
  </ActionButton>
);

const HandoffStatusPanel = ({ handoff }: { handoff: LiveRouteHandoff }) => (
  <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
        <ShieldCheck size={16} color={V3.orangeLight} />
        <span style={{ fontSize: '10px', fontWeight: 700, color: V3.orangeLight, letterSpacing: '1px' }}>{handoff.seedingLevel}</span>
        <span style={{ fontSize: '10px', color: V3.textTertiary }}>LIVE_ROUTE_HANDOFF</span>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{handoff.title}</h1>
      <p style={{ fontSize: '12.5px', color: V3.textSecondary, margin: '6px 0 0' }}>
        Primary V3 navigation is contained inside staging. This surface is not fully V3-rendered yet.
      </p>
    </div>
    <EmptyState
      title="V3 staging surface not wired"
      description={handoff.missing}
      icon={<FileSearch size={28} color={V3.tealLight} />}
    />
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <OpenLiveRouteButton route={handoff.route} />
    </div>
  </div>
);

const PreviewLabel = ({ detail }: { detail: string }) => (
  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.7px', color: V3.tealLight }}>
    V3_SYNTHETIC_FALLBACK — {detail}
  </span>
);

const BlockedInline = ({ children }: { children: string }) => (
  <span style={{ fontSize: '10.5px', color: V3.textTertiary }}>{children}</span>
);

const MetadataLine = ({ items }: { items: Array<string | number | undefined | null> }) => (
  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px', color: V3.textSecondary }}>
    {items.filter(Boolean).map((item, index) => (
      <span key={`${item}-${index}`}>{item}</span>
    ))}
  </div>
);

const EmptyState = ({ title, description, icon }: any) => (
  <div style={{ padding: '40px', textAlign: 'center', color: V3.textTertiary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.01)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
    {icon}
    <div style={{ fontWeight: 500, color: V3.textPrimary, fontSize: '14px' }}>{title}</div>
    <div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div>
  </div>
);

function HeroStat({ label, value }: any) {
  return (
    <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', minWidth: '100px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: V3.tealLight, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}

function KpiCard({ label, value, trend, alert }: KpiCardData) {
  return (
    <div className="v3-invisible-glare" style={{ padding: '14px 16px', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px', minHeight: '92px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: V3.textTertiary }}>{label}</span>
        {alert && <AlertTriangle size={12} color={V3.orangeLight} className="v3-neon-orange" />}
      </div>
      <div>
        <span style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</span>
      </div>
      {trend && <div style={{ fontSize: '11px', fontWeight: 500, color: V3.tealLight }}>{trend}</div>}
    </div>
  );
}

// ============================================================
// WORKSPACE VIEWS
// ============================================================

// --- THE DASHBOARD VIEW ---
const DashboardWorkspace = ({ setIsPlannerView, isMobile }: any) => {
  const kpis: KpiCardData[] = [
    { label: 'Active Sprint', value: 'Sprint 9', trend: `2 due within 48h` },
    { label: 'Sprint %', value: `88%`, trend: `0 blockers` },
    { label: 'Audit Ready', value: `0/445`, trend: `92/100 Readiness` },
    { label: 'Action In Progress', value: `317`, trend: `0 ready to close` },
    { label: 'Missing Evidence', value: `0`, trend: `0 pending approval` },
    { label: 'Critical Actions', value: `121`, trend: `0 at risk`, alert: true },
    { label: 'Audit Open', value: `1041`, trend: `0 awaiting sig` },
  ];

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: 'transparent', border: 'none', borderRadius: '16px', boxShadow: 'none' }}>
        <section style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '280px', flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="v3-neon-orange" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Command Center</span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: V3.textSecondary }}>System Operations Monitoring</span>
              <PreviewLabel detail="dashboard metrics are preview-only until live dashboard parity is wired" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.2, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              System-Wide Readiness Status
            </h1>
            <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '8px', lineHeight: 1.5, maxWidth: '600px' }}>
              Executive operational narrative for compliance execution, evidence readiness, and escalation control. Prioritize critical controls and lock evidence-ready workflows.
            </p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '10px', flex: '1 1 auto' }}>
            <HeroStat label="Critical" value={121} />
            <HeroStat label="At Risk" value={0} />
            <HeroStat label="Audit Ready" value={0} />
            <HeroStat label="In Scope" value={445} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', borderLeft: isMobile ? 'none' : `1px solid ${V3.borderDefault}`, paddingLeft: isMobile ? '0' : '20px', width: isMobile ? '100%' : 'auto' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>Today</span>
            <span style={{ fontWeight: 500, color: V3.textSecondary, fontSize: '13px' }}>Wed, May 20, 2026</span>
            <div style={{ marginTop: '4px' }}><span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 8px', background: 'rgba(0, 209, 193, 0.1)', border: '1px solid rgba(0, 209, 193, 0.3)', borderRadius: '20px', color: V3.tealLight, letterSpacing: '0.5px' }}>AGENCY VIEW</span></div>
          </div>
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', marginTop: '12px' }}>
        <span style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 209, 193, 0.15)', border: '1px solid rgba(0,209,193,0.3)' }}><ShieldX size={18} color={V3.tealLight} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: V3.tealLight }}>Agency Readiness — Action Required</div>
          <p style={{ fontSize: '12.5px', color: V3.textSecondary, marginTop: '2px', margin: 0 }}>121 Overdue · 0 Blockers. Immediate signature or uploads needed.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <ActionButton variant="danger" onClick={() => setIsPlannerView(true)}>Go to My Planner</ActionButton>
        </div>
      </div>
    </div>
  );
};

// --- MY PLANNER VIEW ---
const PlannerWorkspace = ({ tasks, isMobile }: any) => {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <CheckSquare size={14} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.45))' }} />
          <span className="v3-neon-orange" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>My Personal Workspace</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: V3.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>My Planner</h1>
        <p style={{ fontSize: '12.5px', color: V3.textSecondary, marginTop: '4px' }}>Your personal workbook preview — CES task execution remains blocked until Phase 4.</p>
        <PreviewLabel detail="planner tasks are local preview rows" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
        <div className="v3-invisible-glare" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>MY OPEN CES</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: V3.textPrimary }}>9</span>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>OVERDUE</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: V3.tealLight }}>2</span>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>COMPLETED OBLIGATIONS</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: V3.tealLight }}>0</span>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>TOTAL TASKS</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: V3.textPrimary }}>9</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', 'open', 'overdue', 'this-week'].map(tab => (
            <button key={tab} disabled title="BLOCKED_PENDING_PHASE_4 — planner filters will use canonical task projection later." style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'not-allowed', opacity: tab === 'all' ? 1 : 0.55, background: tab === 'all' ? 'rgba(0, 209, 193, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${tab === 'all' ? V3.tealLight : 'rgba(255,255,255,0.1)'}`, color: tab === 'all' ? V3.textPrimary : V3.textSecondary, textTransform: 'capitalize' }}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 12px', width: isMobile ? '100%' : '240px' }}>
          <SearchIcon size={12} color={V3.textTertiary} />
          <input readOnly aria-label="Planner search blocked in Phase 2" title="BLOCKED_PENDING_PHASE_4 — planner search requires canonical task projection." placeholder="Search blocked in Phase 2" style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '11.5px', width: '100%', cursor: 'default' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px' }}>
        {tasks.slice(0, 6).map((task: any) => (
          <div key={task.id} className="v3-invisible-glare" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', border: task.overdue ? `1px solid rgba(0, 209, 193, 0.25)` : `1px solid rgba(255, 255, 255, 0.08)`, background: task.overdue ? 'rgba(0, 209, 193, 0.02)' : 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, color: V3.tealLight }}>{task.domain}</span>
              <span style={{ fontSize: '10.5px', color: V3.textTertiary, fontFamily: 'monospace' }}>{task.code}</span>
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 500, color: V3.textPrimary, margin: 0, minHeight: '36px', lineHeight: 1.4 }}>{task.title}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid rgba(255,255,255,0.08)`, paddingTop: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '11px', color: V3.textSecondary }}>Due {task.dueDate}</span>
              <button disabled title="BLOCKED_PENDING_PHASE_4 — CES task workflow interiors are not wired in Phase 2." style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(0, 209, 193, 0.06)', border: `1px solid rgba(0,209,193,0.18)`, color: V3.textTertiary, fontSize: '10.5px', fontWeight: 600, cursor: 'not-allowed' }}>Blocked</button>
            </div>
            <BlockedInline>BLOCKED_PENDING_PHASE_4 — task detail/actions will be wired later.</BlockedInline>
          </div>
        ))}
      </div>
    </div>
  );
};

type CesPreviewState = {
  viewed?: boolean;
  started?: boolean;
  note?: string;
  blocker?: string;
  evidenceViewed?: boolean;
  evidenceAttached?: boolean;
  evidenceReady?: boolean;
  evidenceBlocker?: string;
  signaturePrepared?: boolean;
  signatureAcknowledged?: boolean;
  approvalPrepared?: boolean;
  approvalAcknowledged?: boolean;
  signatureBlocker?: string;
  history?: string[];
};

const PHASE_4C_DURABLE_BLOCKER = 'BLOCKED_PENDING_PHASE_4C — Durable planner/task execution not wired in this phase.';
const PHASE_4C_B_EVIDENCE_BLOCKER = 'BLOCKED_PENDING_PHASE_4C_B — Backend evidence upload/validation/promote is not wired.';
const PHASE_4C_B_SIGNATURE_BLOCKER = 'BLOCKED_PENDING_PHASE_4C_B — Durable signature/approval persistence is not wired.';
const LOCAL_PREVIEW_ONLY = 'Local preview only — not durable.';

const formatList = (items: readonly string[] | undefined, fallback = 'Not available') => items && items.length ? items.join(', ') : fallback;

const getRelatedFormIds = (unit: ExecutionUnit) => {
  const ids = new Set<string>([...(unit.sourceFormIds ?? []), ...unit.evidenceStatus.missingFormIds]);
  return Array.from(ids);
};

const getRelatedPolicyIds = (unit: ExecutionUnit) => {
  const ids = new Set<string>(unit.sourcePolicyIds ?? []);
  getRelatedFormIds(unit).forEach(formId => {
    const seededForm = V3_FORMS.find(form => form.id === formId);
    if (seededForm?.requiredBy) ids.add(seededForm.requiredBy);
  });
  return Array.from(ids);
};

const getMissingFormIds = (unit: ExecutionUnit) => {
  if (unit.evidenceStatus.missingFormIds.length) return unit.evidenceStatus.missingFormIds;
  const formIds = getRelatedFormIds(unit);
  const missingCount = Math.max(0, unit.evidenceStatus.requiredFormsTotal - unit.evidenceStatus.requiredFormsComplete);
  return formIds.slice(0, missingCount);
};

const appendPreviewHistory = (preview: CesPreviewState, entry: string): CesPreviewState => ({
  ...preview,
  history: [...(preview.history ?? []), `${new Date().toISOString()} — ${entry}`],
});

const getReadinessMessages = (unit: ExecutionUnit, preview: CesPreviewState) => {
  const messages: string[] = [];
  const missingForms = getMissingFormIds(unit);
  const evidenceSeedIncomplete = unit.evidenceStatus.requiredFormsComplete < unit.evidenceStatus.requiredFormsTotal || missingForms.length > 0 || !unit.evidenceStatus.auditIndexCreated;
  const signaturesSeedIncomplete = unit.evidenceStatus.signaturesComplete < unit.evidenceStatus.signaturesRequired;

  if (unit.blockedReason) messages.push(`Seeded blocker: ${unit.blockedReason.label}`);
  if (preview.blocker) messages.push(`Local task blocker: ${preview.blocker}`);
  if (preview.evidenceBlocker) messages.push(`Evidence blocker: ${preview.evidenceBlocker}`);
  if (preview.signatureBlocker) messages.push(`Signature/approval blocker: ${preview.signatureBlocker}`);

  if (missingForms.length) messages.push(`Missing required forms: ${missingForms.join(', ')}`);
  if (evidenceSeedIncomplete && preview.evidenceAttached && preview.evidenceReady) {
    messages.push('Evidence ready in local preview; durable validation remains Phase 4C.');
  } else if (evidenceSeedIncomplete) {
    messages.push('Evidence not ready in local preview; attach and mark preview evidence ready.');
  } else {
    messages.push('Seeded evidence package is complete; durable validation remains Phase 4C.');
  }

  if (signaturesSeedIncomplete && preview.signatureAcknowledged) {
    messages.push('Signature acknowledged in local preview; durable signature collection remains Phase 4C.');
  } else if (signaturesSeedIncomplete) {
    messages.push('Missing signatures remain; acknowledge only in local preview for Phase 4B.');
  } else {
    messages.push('Seeded signatures complete; durable signature verification remains Phase 4C.');
  }

  if (preview.approvalAcknowledged) {
    messages.push('Approval acknowledged in local preview; durable approval mutation remains Phase 4C.');
  } else {
    messages.push('Approval readiness requires local preview acknowledgement; durable approval mutation remains Phase 4C.');
  }

  messages.push('Durable task completion remains BLOCKED_PENDING_PHASE_4C.');
  return messages;
};

const getTaskReadiness = (unit: ExecutionUnit, preview: CesPreviewState) => {
  return getReadinessMessages(unit, preview).join(' ');
};

const getNextBestAction = (unit: ExecutionUnit, preview: CesPreviewState) => {
  if (!preview.viewed) return 'Mark viewed to acknowledge this local preview detail.';
  if (!preview.started) return 'Mark started to create local-only preview progress.';
  if (preview.blocker) return 'Clear the local blocker when the preview issue is no longer relevant.';
  if (preview.evidenceBlocker) return 'Clear the local evidence blocker when the preview issue is no longer relevant.';
  if (!preview.evidenceAttached) return 'Attach local preview evidence; no file upload or durable evidence write occurs.';
  if (!preview.evidenceReady) return 'Mark local preview evidence ready for validation; durable validation remains Phase 4C.';
  if (preview.signatureBlocker) return 'Clear the local signature/approval blocker when the preview issue is no longer relevant.';
  if (!preview.signatureAcknowledged && unit.evidenceStatus.signaturesComplete < unit.evidenceStatus.signaturesRequired) return 'Acknowledge local preview signature; durable collection remains Phase 4C.';
  if (!preview.approvalAcknowledged) return 'Acknowledge local preview approval; durable approval mutation remains Phase 4C.';
  return 'Durable completion is blocked until Phase 4C task execution is wired.';
};

const getCompletionRule = (unit: ExecutionUnit) => {
  const evidence = unit.evidenceStatus;
  return [
    `${evidence.requiredFormsComplete}/${evidence.requiredFormsTotal} required forms complete`,
    `${evidence.signaturesComplete}/${evidence.signaturesRequired} signatures complete`,
    evidence.auditIndexCreated ? 'audit index exists' : 'audit index not created',
    unit.blockedReason ? `blocker unresolved: ${unit.blockedReason.label}` : 'no seeded blocker',
  ].join(' · ');
};

const DetailField = ({ label, children }: { label: string; children: any }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '118px minmax(0, 1fr)', gap: '10px', alignItems: 'baseline' }}>
    <span style={{ fontSize: '9px', color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: '12px', color: V3.textSecondary, lineHeight: 1.45, minWidth: 0 }}>{children}</span>
  </div>
);

const PhaseBlockedButton = ({ children, reason, dataQaAction }: { children: string; reason: string; dataQaAction?: string }) => (
  <button
    disabled
    title={reason}
    data-qa="blocked-production-action"
    {...(dataQaAction ? { 'data-qa-action': dataQaAction } : {})}
    style={{ padding: '7px 10px', borderRadius: '7px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', color: V3.textTertiary, fontSize: '11px', fontWeight: 700, cursor: 'not-allowed' }}
  >
    {children}
  </button>
);

const CesDurableAdapterPanel = ({
  adapter,
  draftNote,
  draftBlocker,
}: {
  adapter: ReturnType<typeof useCesDurableExecutionAdapter>;
  draftNote: string;
  draftBlocker: string;
}) => (
  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
    <div>
      <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>PHASE 4C-A DURABLE EXECUTION ADAPTER</div>
      <div style={{ fontSize: '11px', color: V3.tealLight, marginTop: '2px' }}>durable app-store adapter · local persisted store · backend persistence not implemented · not level 5</div>
    </div>
    <div
      data-qa="ces-durable-adapter-status"
      data-qa-persistence-mode={adapter.status.persistenceMode}
      style={{ display: 'grid', gap: '6px' }}
    >
      <DetailField label="Store">{adapter.status.storeName} · {adapter.status.durableLabel}</DetailField>
      <DetailField label="Backend">{adapter.status.backendLabel}</DetailField>
      <DetailField label="Adapter IDs">{adapter.status.adapterEventId ?? 'not materialized'} · {adapter.status.adapterTaskId ?? 'task not materialized'}</DetailField>
      <DetailField label="Persisted">{adapter.status.persistedTaskStatus ?? 'not started in app-store'} · evidence refs {adapter.status.persistedEvidenceCount} · approval requests {adapter.status.persistedApprovalCount}</DetailField>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <ActionButton data-qa="ces-durable-action" data-qa-action="persist-viewed" onClick={adapter.actions.persistViewed}>Persist viewed</ActionButton>
      <ActionButton data-qa="ces-durable-action" data-qa-action="persist-started" onClick={adapter.actions.persistStarted}>Persist started</ActionButton>
      <ActionButton data-qa="ces-durable-action" data-qa-action="persist-note" onClick={() => adapter.actions.persistNote(draftNote)}>Persist note</ActionButton>
      <ActionButton data-qa="ces-durable-action" data-qa-action="persist-blocker" onClick={() => adapter.actions.persistBlocker(draftBlocker)}>Persist blocker</ActionButton>
      <ActionButton data-qa="ces-durable-action" data-qa-action="clear-persisted-blocker" onClick={adapter.actions.clearPersistedBlocker}>Clear persisted blocker</ActionButton>
    </div>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <ActionButton data-qa="ces-durable-action" data-qa-action="persist-evidence-placeholder" onClick={adapter.actions.persistEvidencePlaceholder}>Persist evidence placeholder</ActionButton>
      <ActionButton data-qa="ces-durable-action" data-qa-action="request-approval" onClick={adapter.actions.requestApprovalInStore}>Request approval in app-store</ActionButton>
    </div>
    <div
      data-qa="ces-completion-gate"
      data-qa-completion-ready={adapter.completionGate.ready ? 'true' : 'false'}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
    >
      <DetailField label="Gate">{adapter.completionGate.message}</DetailField>
      {adapter.completionGate.blockers.length ? adapter.completionGate.blockers.map(blocker => (
        <div
          key={blocker.code}
          data-qa="ces-durable-blocker"
          data-qa-blocker-code={blocker.code}
          style={{ fontSize: '10.5px', color: V3.orangeLight, lineHeight: 1.4 }}
        >
          {blocker.label}
        </div>
      )) : (
        <div style={{ fontSize: '10.5px', color: V3.tealLight }}>Ready for durable app-state completion only; backend persistence not implemented.</div>
      )}
    </div>
    <div
      data-qa="ces-audit-history-status"
      data-qa-audit-mode={adapter.status.auditMode}
      style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
    >
      <DetailField label="Audit">{adapter.status.auditMode} · {adapter.status.auditEventCount} app-store audit/history rows</DetailField>
      <div style={{ fontSize: '10.5px', color: V3.textTertiary }}>Phase 4C-A writes app-store history only; hash-chain certification, WORM storage, and production certification are not claimed.</div>
    </div>
  </div>
);

const LinkageRow = ({ id, type }: { id: string; type: 'policy' | 'form' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div>
      <div style={{ fontSize: '11px', color: V3.textPrimary, fontFamily: 'monospace' }}>{id}</div>
      <div style={{ fontSize: '10px', color: V3.textTertiary }}>
        {type === 'form' ? 'V3 form renderer adapter available in Forms Content Renderer.' : 'V3 policy renderer adapter available in Policy Content Renderer.'}
      </div>
    </div>
    <OpenLiveRouteButton route={type === 'form' ? `/forms/${id}` : `/library/${id}`} />
  </div>
);

const CesEvidencePanel = ({
  unit,
  preview,
  onPreviewChange,
}: {
  unit: ExecutionUnit;
  preview: CesPreviewState;
  onPreviewChange: (next: CesPreviewState) => void;
}) => {
  const [draftEvidenceBlocker, setDraftEvidenceBlocker] = useState(preview.evidenceBlocker ?? '');
  const formIds = getRelatedFormIds(unit);
  const policyIds = getRelatedPolicyIds(unit);
  const missingFormIds = getMissingFormIds(unit);
  const evidenceStatus = preview.evidenceReady ? 'ready for validation in local preview' : preview.evidenceAttached ? 'attached in local preview' : preview.evidenceViewed ? 'viewed in local preview' : 'not viewed in local preview';

  useEffect(() => {
    setDraftEvidenceBlocker(preview.evidenceBlocker ?? '');
  }, [unit.id, preview.evidenceBlocker]);

  return (
    <div data-qa="ces-evidence-panel" data-qa-evidence-task-id={unit.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
      <div>
        <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>PHASE 4B EVIDENCE / ARTIFACT LOCAL PREVIEW</div>
        <div style={{ fontSize: '11px', color: V3.orangeLight, marginTop: '2px' }}>{LOCAL_PREVIEW_ONLY}</div>
      </div>
      <DetailField label="Forms">{unit.evidenceStatus.requiredFormsComplete}/{unit.evidenceStatus.requiredFormsTotal} complete</DetailField>
      <DetailField label="Missing">{formatList(missingFormIds, 'No missing form IDs seeded')}</DetailField>
      <DetailField label="Audit index">{unit.evidenceStatus.auditIndexCreated ? 'created in seed preview' : 'not created in seed preview'}</DetailField>
      <DetailField label="Policies">{formatList(policyIds)}</DetailField>
      <DetailField label="Forms linked">{formatList(formIds, 'No linked form IDs seeded')}</DetailField>
      <DetailField label="Seed status">{unit.auditReadiness} · {unit.evidenceStatus.auditIndexCreated ? 'audit indexed' : 'audit index pending'}</DetailField>
      <DetailField label="Local status">{evidenceStatus}</DetailField>
      <DetailField label="Readiness">{getReadinessMessages(unit, preview).filter(message => /Evidence|Missing required forms|Seeded blocker|Local task blocker|Evidence blocker|Durable task/.test(message)).join(' ')}</DetailField>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <ActionButton data-qa="ces-evidence-action" data-qa-action="view-evidence" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, evidenceViewed: true }, 'Evidence requirement viewed in local preview only'))}>Mark evidence requirement viewed</ActionButton>
        <ActionButton data-qa="ces-evidence-action" data-qa-action="attach-preview-evidence" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, evidenceViewed: true, evidenceAttached: true }, 'Local preview evidence attached; no upload API called'))}>Attach local preview evidence</ActionButton>
        <ActionButton data-qa="ces-evidence-action" data-qa-action="mark-preview-evidence-ready" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, evidenceViewed: true, evidenceAttached: true, evidenceReady: true }, 'Evidence marked ready in local preview; durable validation remains Phase 4C'))}>Mark preview evidence ready</ActionButton>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          value={draftEvidenceBlocker}
          onChange={e => setDraftEvidenceBlocker(e.target.value)}
          placeholder="Evidence blocker reason"
          style={{ flex: '1 1 170px', minWidth: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: V3.textPrimary, padding: '8px', fontSize: '12px', outline: 'none' }}
        />
        <ActionButton data-qa="ces-evidence-action" data-qa-action="add-evidence-blocker" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, evidenceBlocker: draftEvidenceBlocker.trim() || 'Local preview evidence blocker' }, 'Evidence blocker added in local preview only'))}>Add evidence blocker</ActionButton>
        <ActionButton data-qa="ces-evidence-action" data-qa-action="clear-evidence-blocker" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, evidenceBlocker: undefined }, 'Evidence blocker cleared in local preview only'))}>Clear evidence blocker</ActionButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {policyIds.slice(0, 3).map(policyId => <LinkageRow key={policyId} id={policyId} type="policy" />)}
        {formIds.slice(0, 3).map(formId => <LinkageRow key={formId} id={formId} type="form" />)}
      </div>
    </div>
  );
};

const CesSignatureApprovalPanel = ({
  unit,
  preview,
  onPreviewChange,
}: {
  unit: ExecutionUnit;
  preview: CesPreviewState;
  onPreviewChange: (next: CesPreviewState) => void;
}) => {
  const [draftSignatureBlocker, setDraftSignatureBlocker] = useState(preview.signatureBlocker ?? '');
  const localSignatureState = preview.signatureAcknowledged ? 'signature acknowledged in local preview' : preview.signaturePrepared ? 'signature request prepared in local preview' : 'not prepared in local preview';
  const localApprovalState = preview.approvalAcknowledged ? 'approval acknowledged in local preview' : preview.approvalPrepared ? 'approval request prepared in local preview' : 'not prepared in local preview';

  useEffect(() => {
    setDraftSignatureBlocker(preview.signatureBlocker ?? '');
  }, [unit.id, preview.signatureBlocker]);

  return (
    <div data-qa="ces-signature-approval-panel" data-qa-signature-task-id={unit.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
      <div>
        <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>PHASE 4B SIGNATURE / APPROVAL LOCAL PREVIEW</div>
        <div style={{ fontSize: '11px', color: V3.orangeLight, marginTop: '2px' }}>{LOCAL_PREVIEW_ONLY}</div>
      </div>
      <DetailField label="Required">{unit.evidenceStatus.signaturesComplete}/{unit.evidenceStatus.signaturesRequired} signatures complete</DetailField>
      <DetailField label="Owner">{unit.approver.name} · {unit.approverRole ?? unit.approver.role}</DetailField>
      <DetailField label="Seed state">{unit.complianceState} · {unit.workflowPhase}</DetailField>
      <DetailField label="Local sig">{localSignatureState}</DetailField>
      <DetailField label="Local appr">{localApprovalState}</DetailField>
      <DetailField label="Readiness">{getReadinessMessages(unit, preview).filter(message => /Signature|Approval|Seeded blocker|Local task blocker|signature\/approval blocker|Durable task/.test(message)).join(' ')}</DetailField>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {unit.requiredSigners.length ? unit.requiredSigners.map(signer => (
          <div key={signer.userId} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 80px', gap: '8px', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: V3.textPrimary }}>{signer.name}</div>
              <div style={{ fontSize: '10.5px', color: V3.textTertiary }}>{signer.role}</div>
            </div>
            <div style={{ fontSize: '10.5px', color: signer.status === 'signed' ? V3.tealLight : V3.orangeLight, textAlign: 'right' }}>{signer.status}</div>
          </div>
        )) : (
          <div style={{ fontSize: '11px', color: V3.textTertiary }}>No required signers seeded for this task.</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <ActionButton data-qa="ces-signature-action" data-qa-action="prepare-signature-request" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, signaturePrepared: true }, 'Signature request prepared in local preview only'))}>Prepare signature request</ActionButton>
        <ActionButton data-qa="ces-signature-action" data-qa-action="acknowledge-preview-signature" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, signaturePrepared: true, signatureAcknowledged: true }, 'Signature acknowledged in local preview; durable collection remains Phase 4C'))}>Acknowledge local preview signature</ActionButton>
        <ActionButton data-qa="ces-signature-action" data-qa-action="prepare-approval-request" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, approvalPrepared: true }, 'Approval request prepared in local preview only'))}>Prepare approval request</ActionButton>
        <ActionButton data-qa="ces-signature-action" data-qa-action="acknowledge-preview-approval" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, approvalPrepared: true, approvalAcknowledged: true }, 'Approval acknowledged in local preview; durable approval mutation remains Phase 4C'))}>Acknowledge local preview approval</ActionButton>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input
          value={draftSignatureBlocker}
          onChange={e => setDraftSignatureBlocker(e.target.value)}
          placeholder="Signature/approval blocker reason"
          style={{ flex: '1 1 170px', minWidth: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: V3.textPrimary, padding: '8px', fontSize: '12px', outline: 'none' }}
        />
        <ActionButton data-qa="ces-signature-action" data-qa-action="add-signature-blocker" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, signatureBlocker: draftSignatureBlocker.trim() || 'Local preview signature/approval blocker' }, 'Signature/approval blocker added in local preview only'))}>Add signature/approval blocker</ActionButton>
        <ActionButton data-qa="ces-signature-action" data-qa-action="clear-signature-blocker" onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, signatureBlocker: undefined }, 'Signature/approval blocker cleared in local preview only'))}>Clear signature/approval blocker</ActionButton>
      </div>
    </div>
  );
};

const CesEventWorkspace = ({ unit, eventUnits }: { unit: ExecutionUnit; eventUnits: ExecutionUnit[] }) => {
  const policyIds = getRelatedPolicyIds(unit);
  const formIds = getRelatedFormIds(unit);
  const formsComplete = unit.evidenceStatus.requiredFormsComplete;
  const formsTotal = unit.evidenceStatus.requiredFormsTotal;

  return (
    <div data-qa="ces-event-workspace" data-qa-event-id={unit.parentEventId} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <div style={{ fontSize: '9px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.8px' }}>EVENT WORKSPACE · workflow wired preview</div>
        <h2 style={{ fontSize: '16px', color: V3.textPrimary, margin: '4px 0 2px' }}>{unit.parentEventId}</h2>
        <p style={{ fontSize: '11.5px', color: V3.textSecondary, margin: 0 }}>
          In-shell Phase 4A event context derived from the selected CES seed execution unit. This is not durable production execution.
        </p>
      </div>
      <DetailField label="Why exists">{unit.sourceType ?? 'REGULATORY_EVENT'} · {unit.obligationKind ?? 'SPRINT_TASK'} · {unit.domain}</DetailField>
      <DetailField label="Workflow">{unit.workflowId} · {unit.workflowPhase}</DetailField>
      <DetailField label="Due timing">{unit.dueDate} · {unit.escalationTimer != null ? `${unit.escalationTimer} hour(s) to escalation` : 'no escalation timer'}</DetailField>
      <DetailField label="Related tasks">{eventUnits.length} seeded task(s) for this event in V3 preview</DetailField>
      <DetailField label="Policies">{formatList(policyIds)}</DetailField>
      <DetailField label="Forms">{formatList(formIds, `${formsComplete}/${formsTotal} forms complete; no form IDs available`)}</DetailField>
      <DetailField label="Audit preview">{V3_AUDIT_LOG.find(row => row.resource.includes(unit.id) || row.resource.toLowerCase().includes(unit.title.toLowerCase().slice(0, 16)))?.action ?? 'No deterministic audit row found for this seed unit.'}</DetailField>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <OpenLiveRouteButton route={`/calendar?view=sprint&event=${unit.parentEventId}`} />
      </div>
    </div>
  );
};

const CesTaskDetailPanel = ({
  unit,
  preview,
  onPreviewChange,
}: {
  unit: ExecutionUnit;
  preview: CesPreviewState;
  onPreviewChange: (next: CesPreviewState) => void;
}) => {
  const [draftNote, setDraftNote] = useState(preview.note ?? '');
  const [draftBlocker, setDraftBlocker] = useState(preview.blocker ?? '');
  const formIds = getRelatedFormIds(unit);
  const policyIds = getRelatedPolicyIds(unit);
  const readiness = getTaskReadiness(unit, preview);
  const durableAdapter = useCesDurableExecutionAdapter(unit);

  useEffect(() => {
    setDraftNote(preview.note ?? '');
    setDraftBlocker(preview.blocker ?? '');
  }, [unit.id, preview.note, preview.blocker]);

  return (
    <div data-qa="ces-task-detail-panel" data-qa-selected-task-id={unit.id} style={{ flex: '1 1 340px', minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '100%', overflow: 'hidden' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '9px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.8px' }}>TASK DETAIL · workflow wired preview</span>
          {preview.viewed && <span style={{ fontSize: '9px', color: V3.textTertiary }}>viewed</span>}
          {preview.started && <span style={{ fontSize: '9px', color: V3.textTertiary }}>started</span>}
        </div>
        <h2 style={{ fontSize: '17px', fontWeight: 600, color: V3.textPrimary, margin: '5px 0 2px' }}>{unit.title}</h2>
        <div style={{ fontSize: '11px', color: V3.textTertiary, fontFamily: 'monospace' }}>{unit.id}</div>
      </div>

      <div className="no-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        <DetailField label="Why exists">{unit.sourceType ?? 'REGULATORY_EVENT'} obligation for {unit.domain} compliance execution.</DetailField>
        <DetailField label="Source event">{unit.parentEventId}</DetailField>
        <DetailField label="Owner">{unit.owner.name} · {unit.owner.role}</DetailField>
        <DetailField label="Status">{unit.complianceState} · audit readiness {unit.auditReadiness}</DetailField>
        <DetailField label="Due">{unit.dueDate} · {unit.escalationTimer != null ? `${unit.escalationTimer} hour(s) to escalation` : 'no seeded escalation timing'}</DetailField>
        <DetailField label="Workflow">{unit.workflowId}</DetailField>
        <DetailField label="Policies">{formatList(policyIds)}</DetailField>
        <DetailField label="Forms">{formatList(formIds, 'No concrete form IDs available; see evidence totals.')}</DetailField>
        <DetailField label="Evidence">{unit.evidenceStatus.requiredFormsComplete}/{unit.evidenceStatus.requiredFormsTotal} forms complete · missing {unit.evidenceStatus.missingFormIds.length} · audit index {unit.evidenceStatus.auditIndexCreated ? 'created' : 'not created'}</DetailField>
        <DetailField label="Signatures">{unit.evidenceStatus.signaturesComplete}/{unit.evidenceStatus.signaturesRequired} complete · {unit.requiredSigners.map(s => `${s.name}: ${s.status}`).join(', ') || 'none seeded'}</DetailField>
        <DetailField label="Approvals">{unit.approver.name} · {unit.approverRole ?? unit.approver.role}</DetailField>
        <div data-qa="ces-readiness-state">
          <DetailField label="Readiness">{readiness}</DetailField>
        </div>
        <DetailField label="Completion">{getCompletionRule(unit)}</DetailField>
        <DetailField label="Next action">{getNextBestAction(unit, preview)}</DetailField>
        <DetailField label="Audit preview">{V3_AUDIT_LOG.filter(row => row.resource.includes(unit.id) || row.resource.toLowerCase().includes(unit.title.toLowerCase().slice(0, 16))).slice(0, 2).map(row => `${row.timestamp}: ${row.action}`).join(' · ') || 'No deterministic audit row found for this seed unit.'}</DetailField>

        <CesDurableAdapterPanel adapter={durableAdapter} draftNote={draftNote} draftBlocker={draftBlocker} />
        <CesEvidencePanel unit={unit} preview={preview} onPreviewChange={onPreviewChange} />
        <CesSignatureApprovalPanel unit={unit} preview={preview} onPreviewChange={onPreviewChange} />

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>SAFE LOCAL PREVIEW ACTIONS</div>
          <div style={{ fontSize: '11px', color: V3.orangeLight }}>{LOCAL_PREVIEW_ONLY}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ActionButton onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, viewed: true }, 'Task detail viewed in local preview only'))}>Mark viewed</ActionButton>
            <ActionButton onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, viewed: true, started: true }, 'Task started in local preview only'))}>Mark started</ActionButton>
            <ActionButton onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, blocker: draftBlocker.trim() || 'Local preview blocker' }, 'Task blocker added in local preview only'))}>Add local blocker</ActionButton>
            <ActionButton onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, blocker: undefined }, 'Task blocker cleared in local preview only'))}>Clear local blocker</ActionButton>
          </div>
          <textarea
            value={draftNote}
            onChange={e => setDraftNote(e.target.value)}
            placeholder="Local preview note"
            style={{ minHeight: '68px', resize: 'vertical', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: V3.textPrimary, padding: '8px', fontSize: '12px', outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ActionButton onClick={() => onPreviewChange(appendPreviewHistory({ ...preview, note: draftNote.trim() }, 'Task note saved in local preview only'))}>Add local note</ActionButton>
            <input
              value={draftBlocker}
              onChange={e => setDraftBlocker(e.target.value)}
              placeholder="Local blocker reason"
              style={{ flex: '1 1 170px', minWidth: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: V3.textPrimary, padding: '8px', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>BLOCKED PRODUCTION ACTIONS</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <PhaseBlockedButton reason={PHASE_4C_B_EVIDENCE_BLOCKER} dataQaAction="upload-evidence">Upload evidence</PhaseBlockedButton>
            <PhaseBlockedButton reason={PHASE_4C_B_SIGNATURE_BLOCKER} dataQaAction="request-signature">Request signature</PhaseBlockedButton>
            <PhaseBlockedButton reason={PHASE_4C_B_SIGNATURE_BLOCKER} dataQaAction="approve-task">Approve task</PhaseBlockedButton>
            {durableAdapter.completionGate.ready ? (
              <ActionButton data-qa="ces-durable-action" data-qa-action="complete-durable-app-state" onClick={durableAdapter.actions.attemptDurableCompletion}>Complete in durable app-state</ActionButton>
            ) : (
              <PhaseBlockedButton reason={PHASE_4C_DURABLE_BLOCKER} dataQaAction="complete-task">Complete task</PhaseBlockedButton>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '10.5px', color: V3.orangeLight }}>{PHASE_4C_B_EVIDENCE_BLOCKER}</div>
            <div style={{ fontSize: '10.5px', color: V3.orangeLight }}>{PHASE_4C_B_SIGNATURE_BLOCKER}</div>
          </div>
        </div>

        <div data-qa="ces-local-preview-history" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>LOCAL PREVIEW SESSION HISTORY — NOT DURABLE AUDIT RECORD</div>
          {(preview.history ?? []).length ? (
            (preview.history ?? []).slice(-6).map((entry, index) => (
              <div key={`${entry}-${index}`} style={{ fontSize: '10.5px', color: V3.textSecondary, lineHeight: 1.4 }}>{entry}</div>
            ))
          ) : (
            <div style={{ fontSize: '10.5px', color: V3.textTertiary }}>No local preview actions recorded for this task.</div>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 700, letterSpacing: '0.5px' }}>SECONDARY LIVE ROUTE HANDOFFS</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {policyIds.slice(0, 3).map(policyId => <OpenLiveRouteButton key={policyId} route={`/library/${policyId}`} />)}
            {formIds.slice(0, 3).map(formId => <OpenLiveRouteButton key={formId} route={`/forms/${formId}`} />)}
            <OpenLiveRouteButton route={`/calendar?view=sprint&task=${unit.id}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- KANBAN BOARD (SPRINT execution) ---
const SprintBoardWorkspace = () => {
  const activeSprintId = V3_SprintContextSeed.activeSprint.id;
  const seededUnits = useMemo(
    () => V3_ExecutionUnitsSeed.filter(unit => unit.sprintId === activeSprintId).slice(0, 18),
    [activeSprintId],
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(seededUnits[0]?.id ?? '');
  const [previewByTask, setPreviewByTask] = useState<Record<string, CesPreviewState>>({});
  const selectedUnit = seededUnits.find(unit => unit.id === selectedTaskId) ?? seededUnits[0];
  const selectedPreview = selectedUnit ? (previewByTask[selectedUnit.id] ?? {}) : {};
  const eventUnits = selectedUnit ? seededUnits.filter(unit => unit.parentEventId === selectedUnit.parentEventId) : [];
  const columns = [
    { id: 'blocked', title: 'BLOCKED', items: seededUnits.filter(unit => unit.complianceState === 'blocked') },
    { id: 'awaiting_signature', title: 'AWAITING SIG', items: seededUnits.filter(unit => unit.complianceState === 'awaiting_signature') },
    { id: 'in_progress', title: 'IN PROGRESS', items: seededUnits.filter(unit => unit.complianceState === 'in_progress') },
    { id: 'ready', title: 'READY / UPCOMING', items: seededUnits.filter(unit => unit.complianceState === 'ready' || unit.complianceState === 'upcoming') },
  ];

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, letterSpacing: '1px' }}>CES SPRINT WINDOW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>Sprint execution • Mon-Fri 2-week window</h1>
          <PreviewLabel detail="Phase 4A event/task interiors are in-shell local preview only" />
          <div style={{ display: 'flex', gap: '8px' }}>
            <OpenLiveRouteButton route="/calendar" />
            <OpenLiveRouteButton route="/calendar?view=sprint" />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden', minHeight: '400px', flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: '3 1 600px', overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
          {columns.map(col => (
            <div key={col.id} style={{ minWidth: '220px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.005)', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: V3.textSecondary, letterSpacing: '0.5px' }}>{col.title}</span>
                <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px', color: V3.textTertiary }}>{col.items.length}</span>
              </div>
              <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {col.items.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '30px 0', color: V3.textTertiary, fontSize: '11px', fontStyle: 'italic' }}>No active tasks</div>
                ) : (
                  col.items.map(unit => (
                    <button
                      key={unit.id}
                      data-qa="ces-task-card"
                      data-qa-task-id={unit.id}
                      data-qa-task-title={unit.title}
                      onClick={() => setSelectedTaskId(unit.id)}
                      style={{ 
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px', 
                        background: selectedUnit?.id === unit.id ? 'rgba(0, 209, 193, 0.05)' : 'rgba(255,255,255,0.01)', 
                        border: selectedUnit?.id === unit.id ? '1px solid rgba(0,209,193,0.4)' : '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <h4 style={{ fontSize: '12px', fontWeight: 500, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{unit.title}</h4>
                      <div style={{ fontSize: '10.5px', color: V3.tealLight, fontWeight: 500, marginTop: '4px' }}>{unit.workflowId}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: V3.textTertiary }}>{unit.owner.initials} · {unit.owner.role}</span>
                        <span style={{ fontSize: '10px', color: V3.textTertiary }}>{unit.dueDate}</span>
                      </div>
                      <div style={{ marginTop: '6px' }}><BlockedInline>Phase 4A — click opens in-shell task detail preview.</BlockedInline></div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedUnit && (
          <div style={{ flex: '1.4 1 420px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
            <CesEventWorkspace unit={selectedUnit} eventUnits={eventUnits} />
            <CesTaskDetailPanel
              unit={selectedUnit}
              preview={selectedPreview}
              onPreviewChange={next => setPreviewByTask(prev => ({ ...prev, [selectedUnit.id]: next }))}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- EVIDENCE CENTER ---
const EvidenceCenterWorkspace = () => {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={18} className="v3-neon-orange" />
            <h1 className="v3-neon-orange" style={{ fontSize: '22px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>Evidence Command Center</h1>
            <span style={{ padding: '3px 8px', background: 'rgba(0,209,193,0.1)', border: '1px solid rgba(0,209,193,0.3)', color: V3.tealLight, fontSize: '9px', fontWeight: 600, borderRadius: '4px' }}>V3_SYNTHETIC_FALLBACK</span>
          </div>
          <p style={{ fontSize: '12px', color: V3.textSecondary, margin: '4px 0 10px 0' }}>Every file is bound to a policy / workflow / event triplet and read through secure audit APIs.</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Secure Timeline', 'Audit Ready Ledger', 'Compliance Chain of Custody'].map((tag, i) => (
              <span key={i} style={{ fontSize: '10.5px', padding: '4px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: V3.textSecondary }}>{tag}</span>
            ))}
          </div>
        </div>
        <OpenLiveRouteButton route="/evidence" />
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, marginBottom: '2px' }}>CES Evidence Hierarchy</h3>
          <p style={{ fontSize: '11px', color: V3.textTertiary, marginBottom: '14px' }}>Year → Quarter → Month → Active Event Tasks → Execution Signature Logs.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {['YEAR', 'QUARTER', 'MONTH', 'TASK STATUS'].map((lbl, i) => (
              <div key={i}>
                <div style={{ fontSize: '9px', fontWeight: 600, color: V3.tealLight, marginBottom: '4px', letterSpacing: '0.5px' }}>{lbl}</div>
                <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', color: V3.textPrimary, fontSize: '11.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {i===0 ? '2026' : i===1 ? 'Q2' : i===2 ? 'May' : 'All'} <ChevronDown size={12} color={V3.textTertiary}/>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { title: 'Monthly OIG/SAM Exclusion Checks', id: 'hr_oig_sam_exclusion_check', forms: 2, pct: '100%' },
              { title: 'Q2 QAPI Review Audit Bundle', id: 'qapi_meeting_20260507-00', forms: 10, pct: '85%' },
              { title: 'Plan of Care (POC) Audit Report', id: 'plan_of_care_audit', forms: 6, pct: '40%' },
              { title: 'OASIS Quality Accuracy Auditing', id: 'oasis_accuracy_audit', forms: 8, pct: '0%' }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '12px 0', borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: V3.textPrimary, fontWeight: 500 }}>{item.title}</div>
                    <div style={{ fontSize: '10.5px', color: V3.textSecondary, fontFamily: 'monospace', marginTop: '2px' }}>ID: {item.id}</div>
                    <div style={{ fontSize: '11px', color: V3.textTertiary, marginTop: '2px' }}>Required documents: {item.forms} logs</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11.5px', color: V3.tealLight, fontWeight: 600 }}>{item.pct} Done</div>
                    <div style={{ fontSize: '10px', color: V3.textTertiary, marginTop: '2px' }}>Awaiting Sig: {Math.max(0, 10 - item.forms)}</div>
                  </div>
                </div>
                <BlockedInline>BLOCKED_PENDING_PHASE_4 — evidence/artifact viewer is not wired in this preview.</BlockedInline>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 200px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, marginBottom: '8px' }}>Contextual Ledger Guidance</h3>
          <p style={{ fontSize: '11.5px', color: V3.textSecondary, lineHeight: 1.5, marginBottom: '12px' }}>
            Under Medicare CoPs, all evidence files are stored cryptographically and stamped with clinician IDs. Direct database alteration is inhibited to retain strict compliance audits.
          </p>
          <div style={{ padding: '10px', background: 'rgba(0,209,193,0.05)', borderRadius: '6px', border: '1px solid rgba(0,209,193,0.2)', fontSize: '11px', color: V3.tealLight }}>
            Integrity Status: SECURE & VERIFIED
          </div>
        </div>
      </div>
    </div>
  );
};

// --- BRAD COPILOT ---
const BradCopilotWorkspace = ({ chatInput, setChatInput, chatLog, setChatLog }: any) => {
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Bot size={18} color={V3.tealLight} className="v3-neon-teal" />
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Brad Clinical Admin Advisor</h1>
          <PreviewLabel detail="canned copilot preview; no live grounded action layer in Phase 2" />
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 700, color: V3.textTertiary, letterSpacing: '0.5px' }}>
          <span>V3_SYNTHETIC_FALLBACK CORPUS PREVIEW</span>
          <span>•</span>
          <span>BLOCKED_PENDING_PHASE_4 LIVE ADVISORIES</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '14px', left: '14px' }}><Bot size={16} color={V3.textTertiary}/></div>
            <input 
              value={chatInput} 
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && chatInput.trim()) {
                  setChatLog((prev: any) => [...prev, { sender: 'You', msg: chatInput }]);
                  const currInput = chatInput; setChatInput('');
                  setTimeout(() => {
                    setChatLog((prev: any) => [...prev, { sender: 'Brad', msg: `V3_SYNTHETIC_FALLBACK: canned response for "${currInput}". Live grounded policy/action retrieval is blocked until a later phase.` }]);
                  }, 800);
                }
              }}
              placeholder="Ask Brad: Run pre-survey audit, list QAPI gaps, etc..."
              style={{ width: '100%', padding: '12px 14px 12px 40px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: V3.textPrimary, fontSize: '13px', outline: 'none' }}
            />
            <button 
              onClick={() => {
                if (chatInput.trim()) {
                  setChatLog((prev: any) => [...prev, { sender: 'You', msg: chatInput }]);
                  const currInput = chatInput; setChatInput('');
                  setTimeout(() => {
                    setChatLog((prev: any) => [...prev, { sender: 'Brad', msg: `V3_SYNTHETIC_FALLBACK: canned response for "${currInput}". No live policy logs were searched in Phase 2.` }]);
                  }, 800);
                }
              }}
              style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 12px', background: 'rgba(0,209,193,0.15)', border: '1px solid rgba(0,209,193,0.3)', color: V3.tealLight, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >PREVIEW</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {['Identify clinical gaps in QAPI', 'Show missing documents for Governing Body review', 'Check standard home health regulations'].map((p, i) => (
              <span 
                key={i} 
                onClick={() => setChatInput(p)}
                style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '11px', color: V3.textSecondary, cursor: 'pointer', transition: '0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = V3.tealLight}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >{p}</span>
            ))}
          </div>

          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '220px', maxHeight: '350px' }}>
            {chatLog.map((chat: any, idx: number) => (
              <div key={idx} className="animate-butter-shift" style={{ alignSelf: chat.sender === 'You' ? 'flex-end' : 'flex-start', background: chat.sender === 'You' ? 'rgba(0, 209, 193, 0.08)' : 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '12px', maxWidth: '85%', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, display: 'block', marginBottom: '2px' }}>{chat.sender}</span>
                <p style={{ fontSize: '12.5px', color: V3.textPrimary, margin: 0, lineHeight: 1.4 }}>{chat.msg}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '1 1 240px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: V3.textTertiary, letterSpacing: '0.5px' }}>REFERENCE PANELS</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: V3.textPrimary, marginTop: '2px' }}>CMS CoP Section 484.65</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: V3.textTertiary }}>
            <FileText size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p style={{ fontSize: '11.5px', lineHeight: 1.4, margin: 0 }}>
              BLOCKED_PENDING_PHASE_4 — live reference retrieval and action execution are not wired in this phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- POLICY CONTENT PARITY ---
const PolicyContentWorkspace = () => {
  const policies = useMemo(
    () => frameworkPolicies.filter(policy => Boolean(getPolicyContent(policy.id))).slice(0, 12),
    [],
  );
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id ?? 'GV-GB-001');
  const selectedPolicy = policies.find(policy => policy.id === selectedPolicyId) ?? policies[0];
  const content = selectedPolicy ? getPolicyContent(selectedPolicy.id) : null;
  const body = selectedPolicy ? getPolicyBody(selectedPolicy.id) : null;

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <FileText size={16} color={V3.orangeLight} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: V3.orangeLight, letterSpacing: '1px' }}>V3_RENDERER_ADAPTER</span>
          <span style={{ fontSize: '10px', color: V3.textTertiary }}>policyContentMap / getPolicyContent / getPolicyBody / PolicyLibraryDocumentView</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Policy Content Renderer</h1>
        <p style={{ fontSize: '12.5px', color: V3.textSecondary, margin: '6px 0 0' }}>
          Policy cards use registry metadata, and detail renders through the canonical policy document path.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(0, 1.7fr)', gap: '16px', minHeight: 0, flex: 1 }}>
        <div className="no-scrollbar" style={{ overflowY: 'auto', borderRight: `1px solid ${V3.borderDefault}`, paddingRight: '12px' }}>
          {policies.map(policy => (
            <button
              key={policy.id}
              onClick={() => setSelectedPolicyId(policy.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: selectedPolicyId === policy.id ? V3.textPrimary : V3.textSecondary,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, letterSpacing: '0.5px' }}>{policy.id}</div>
              <div style={{ fontSize: '12.5px', lineHeight: 1.35, marginTop: '3px' }}>{policy.title}</div>
              <MetadataLine items={[policy.domainCode, policy.subdomainCode, policy.tier]} />
            </button>
          ))}
        </div>

        <div className="no-scrollbar" style={{ overflowY: 'auto', minWidth: 0 }}>
          {selectedPolicy && content ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '10px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.6px' }}>{selectedPolicy.id}</div>
                  <h2 style={{ margin: '3px 0', fontSize: '19px', color: V3.textPrimary }}>{selectedPolicy.title}</h2>
                  <MetadataLine items={[
                    `${content.sections.length} real body sections`,
                    body ? `${body.length.toLocaleString()} body characters` : undefined,
                    `Owner: ${selectedPolicy.ownerSteward}`,
                  ]} />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <OpenLiveRouteButton route={`/library/${selectedPolicy.id}`} />
                  <OpenLiveRouteButton route={`/policies/${selectedPolicy.id}`} />
                </div>
              </div>
              <div style={{ background: '#FFFFFF', color: '#1F1C1B', borderRadius: '10px', overflow: 'hidden', maxHeight: '70vh' }}>
                <PolicyLibraryDocumentView policyId={selectedPolicy.id} embedded />
              </div>
            </div>
          ) : (
            <EmptyState title="Policy Content Missing" description="No canonical policy content resolved for this policy ID." icon={<FileSearch size={28} color={V3.tealLight} />} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- FORM CONTENT PARITY ---
const FormsContentWorkspace = () => {
  const forms = useMemo(() => FORMS_DATASET.slice(0, 14), []);
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id ?? 'EN-FM-001');
  const selectedForm = forms.find(form => form.id === selectedFormId) ?? forms[0];
  const content = useMemo(() => selectedForm ? buildFormContent(selectedForm as FormRecord) : null, [selectedForm]);

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <FileSearch size={16} color={V3.orangeLight} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: V3.orangeLight, letterSpacing: '1px' }}>V3_RENDERER_ADAPTER</span>
          <span style={{ fontSize: '10px', color: V3.textTertiary }}>FORMS_DATASET / buildFormContent / FormBody / FormPrintView</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Forms Content Renderer</h1>
        <p style={{ fontSize: '12.5px', color: V3.textSecondary, margin: '6px 0 0' }}>
          Form detail renders real sections, fields, orientation metadata, signatures, linked policies, and print/open handoffs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 0.8fr) minmax(0, 1.7fr)', gap: '16px', minHeight: 0, flex: 1 }}>
        <div className="no-scrollbar" style={{ overflowY: 'auto', borderRight: `1px solid ${V3.borderDefault}`, paddingRight: '12px' }}>
          {forms.map(form => (
            <button
              key={form.id}
              onClick={() => setSelectedFormId(form.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 0',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'transparent',
                color: selectedFormId === form.id ? V3.textPrimary : V3.textSecondary,
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, letterSpacing: '0.5px' }}>{form.id}</div>
              <div style={{ fontSize: '12.5px', lineHeight: 1.35, marginTop: '3px' }}>{form.name}</div>
              <MetadataLine items={[form.domainCode, form.type, form.usage]} />
            </button>
          ))}
        </div>

        <div className="no-scrollbar" style={{ overflowY: 'auto', minWidth: 0 }}>
          {selectedForm && content ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '10px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.6px' }}>{content.id}</div>
                  <h2 style={{ margin: '3px 0', fontSize: '19px', color: V3.textPrimary }}>{content.title}</h2>
                  <MetadataLine items={[
                    `${content.sections.length} sections`,
                    `${content.orientation} orientation`,
                    `${content.signatures?.length ?? 0} signature role(s)`,
                    `${content.policies.length} linked policy reference(s)`,
                  ]} />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <OpenLiveRouteButton route={`/forms/${content.id}`} />
                  <ActionButton onClick={() => printForm(content.id)}>Print Form</ActionButton>
                </div>
              </div>
              <div style={{ background: '#FFFFFF', color: '#1F1C1B', borderRadius: '10px', padding: '22px', maxHeight: '70vh', overflow: 'auto' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#007970', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Purpose</div>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, margin: '5px 0 10px' }}>{content.purpose}</p>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#C74601', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Instructions</div>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, margin: '5px 0 0' }}>{content.instructions}</p>
                </div>
                <FormBody content={content} isEmbedded />
              </div>
            </div>
          ) : (
            <EmptyState title="Form Content Missing" description="No canonical form content resolved for this form ID." icon={<FileSearch size={28} color={V3.tealLight} />} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- TRAINING / JOURNEY CONTENT PARITY ---
const TrainingContentWorkspace = () => {
  const [phase, setPhase] = useState('GAO');
  const modules = useMemo(() => ALL_MODULES.filter(module => module.group === phase).slice(0, 16), [phase]);
  const phaseCounts = useMemo(() => {
    return ALL_MODULES.reduce<Record<string, number>>((acc, module) => {
      acc[module.group] = (acc[module.group] ?? 0) + 1;
      return acc;
    }, {});
  }, []);

  const formatRoles = (roles: (typeof ALL_MODULES)[number]['roles']) => roles === 'ALL' ? 'ALL' : roles.join(', ');

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
          <UserPlus size={16} color={V3.orangeLight} />
          <span style={{ fontSize: '10px', fontWeight: 700, color: V3.orangeLight, letterSpacing: '1px' }}>content seeded</span>
          <span style={{ fontSize: '10px', color: V3.textTertiary }}>ALL_MODULES / JourneyHomePage / ModulePlayerPage</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Training & Journey Content</h1>
        <p style={{ fontSize: '12.5px', color: V3.textSecondary, margin: '6px 0 0' }}>
          V3 reads the canonical module catalog in-shell. Live journey surfaces remain secondary explicit handoffs.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['GAO', 'ROLE', 'ANN', 'DRILL', 'SUPERVISED'].map(group => (
          <button
            key={group}
            onClick={() => setPhase(group)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: `1px solid ${phase === group ? V3.tealLight : 'rgba(255,255,255,0.12)'}`,
              background: phase === group ? 'rgba(0,209,193,0.08)' : 'transparent',
              color: phase === group ? V3.textPrimary : V3.textSecondary,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {group} {phaseCounts[group] ?? 0}
          </button>
        ))}
        <OpenLiveRouteButton route="/journey" />
        <OpenLiveRouteButton route="/journey/supervisor" />
        <OpenLiveRouteButton route="/journey/admin" />
        <OpenLiveRouteButton route="/journey/guide" />
        <OpenLiveRouteButton route="/onboarding-v2" />
      </div>

      <div className="no-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
        {modules.map(module => (
          <div key={module.id} style={{ padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '12px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.6px' }}>{module.id}</div>
              <div style={{ fontSize: '14px', color: V3.textPrimary, marginTop: '2px' }}>{module.title}</div>
              <MetadataLine items={[
                `Roles: ${formatRoles(module.roles)}`,
                `Method: ${module.method}`,
                module.week ? `Week ${module.week}` : undefined,
                module.policyRefs.length ? `Policies: ${module.policyRefs.slice(0, 3).join(', ')}` : undefined,
              ]} />
            </div>
            <button
              onClick={() => window.open(`/journey/module/${module.id}`, '_blank', 'noopener,noreferrer')}
              style={{ padding: '7px 12px', background: 'rgba(0,209,193,0.08)', border: '1px solid rgba(0,209,193,0.24)', color: V3.tealLight, borderRadius: '7px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              Open live route
            </button>
          </div>
        ))}
      </div>

      <BlockedInline>BLOCKED_PENDING_PHASE_4 — gates, evidence, signatures, escalations, and deterministic progress state remain live-route/workflow concerns, not Phase 3 completion.</BlockedInline>
    </div>
  );
};


// ============================================================
// MAIN APPLICATION
// ============================================================
export default function V3_2StagingApp() {
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1200 : window.innerWidth);
  const isMobile = viewportWidth < 768;

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isPlannerView, setIsPlannerView] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState(INTRO_CHATS);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    
    // Automatically close nav on smaller viewports initially
    if (window.innerWidth < 1024) {
      setIsNavOpen(false);
    }
    
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const renderWorkspace = () => {
    const phase3Blockers: Record<string, string> = {
      policy: 'BLOCKED_PENDING_PHASE_3 — Full policy body rendering will be wired through policyContentMap/getPolicyContent/getPolicyBody.',
    };
    const phase4Blocker = 'BLOCKED_PENDING_PHASE_4 — Workflow interiors and action behavior are outside Phase 2.';

    switch (activeSection) {
      case 'dashboard':
        return isPlannerView 
          ? <PlannerWorkspace tasks={INITIAL_PLANNED_TASKS} isMobile={isMobile} />
          : <DashboardWorkspace setIsPlannerView={setIsPlannerView} isMobile={isMobile} />;
      case 'ces':
        return <SprintBoardWorkspace />;
      case 'evidence':
        return <EvidenceCenterWorkspace />;
      case 'brad':
        return <BradCopilotWorkspace chatInput={chatInput} setChatInput={setChatInput} chatLog={chatLog} setChatLog={setChatLog} />;
      case 'policy':
        return <PolicyContentWorkspace />;
      case 'forms':
        return <FormsContentWorkspace />;
      case 'onboarding':
        return <TrainingContentWorkspace />;
      default:
        if (LIVE_ROUTE_HANDOFFS[activeSection]) {
          return <HandoffStatusPanel handoff={LIVE_ROUTE_HANDOFFS[activeSection]} />;
        }
        return (
          <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{activeSection.toUpperCase()} Workspace</h1>
            </div>
            <EmptyState title="Explicit Phase Blocker" description={phase3Blockers[activeSection] ?? phase4Blocker} icon={<FileSearch size={28} color={V3.tealLight} />} />
          </div>
        );
    }
  };

  return (
    <ShellContentFrame 
      isMobile={isMobile} 
      activeSection={activeSection} 
      setActiveSection={setActiveSection} 
      isNavOpen={isNavOpen}
      setIsNavOpen={setIsNavOpen}
      isPlannerView={isPlannerView}
      setIsPlannerView={setIsPlannerView}
    >
      {renderWorkspace()}
    </ShellContentFrame>
  );
}
