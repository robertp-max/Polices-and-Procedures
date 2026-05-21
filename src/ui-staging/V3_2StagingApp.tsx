// V3.2 Staging App — Base design refresh
// Route: /ui-staging/v32
import { useEffect, useState } from 'react';
import {
  AlertTriangle, ShieldCheck,
  FileText, ShieldX,
  LayoutDashboard, Users, Calendar, FileSearch, HelpCircle,
  Menu, Search, X, User, Bell, Bot, Network, UserPlus, FolderOpen,
  ArrowUpCircle, Shield, CheckSquare, ChevronDown, ChevronRight
} from 'lucide-react';

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

    /* Hardware accelerated fade in animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    .animate-butter-shift {
      animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes slideDownIn {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
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
                  border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
      will-change: transform, background-color, border-color;
    }
    .v3-invisible-glare:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.005) 100%) !important;
      border-color: rgba(0, 242, 224, 0.3) !important; 
      transform: translateY(-2px);
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
// REAL MOCK DATA 
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
  { sender: 'Brad', msg: 'Hello! I am Brad, your CareIndeed Clinical Copilot. Ask me anything about home health guidelines, taxonomy, or current CES protocols.' },
];


// ============================================================
// SHELL FRAME & NAVIGATION
// ============================================================
const ShellContentFrame = ({ children, className, isMobile, activeSection, setActiveSection, isNavOpen, setIsNavOpen, isPlannerView, setIsPlannerView }: any) => {

  const navSections = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'profiles', icon: Users, label: 'Profiles', submenu: [ { id: 'clinicians', label: 'Clinician Profiles' }, { id: 'patients', label: 'Patient Profiles' } ] },
        { id: 'calendar', icon: Calendar, label: 'Scheduling & Visits' },
        { id: 'brad', icon: Bot, label: 'Brad AI Copilot' },
        { id: 'ces', icon: ShieldCheck, label: 'Compliance Execution (CES)' },
      ]
    },
    {
      title: 'COMPLIANCE EXECUTION',
      items: [
        { id: 'taxonomy', icon: Network, label: 'Taxonomy' },
        { id: 'onboarding', icon: UserPlus, label: 'Onboarding' },
        { id: 'policy', icon: FileText, label: 'Policy Lifecycle' },
        { id: 'evidence', icon: FolderOpen, label: 'Evidence Center' },
      ]
    },
    {
      title: 'ADMINISTRATION & KNOWLEDGE',
      items: [
        { id: 'hubstaff', icon: ArrowUpCircle, label: 'Hubstaff' },
        { id: 'help-center', icon: HelpCircle, label: 'Help Center' },
        { id: 'admin', icon: Shield, label: 'Admin' },
      ]
    }
  ];

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ profiles: true, evidence: true });
  const toggleSubmenu = (menuId: string) => setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));

  const handleNav = (id: string) => {
    setActiveSection(id);
    if (isMobile) {
      setIsNavOpen(false);
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
        boxShadow: isMobile ? 'none' : '0 30px 60px rgba(0, 0, 0, 0.8)', position: 'relative', zIndex: 2 
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
              <input placeholder="Search policies..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '12px' }} />
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
                          onClick={() => item.submenu ? toggleSubmenu(item.id) : handleNav(item.id)}
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
                          </div>
                          {item.submenu && (expandedMenus[item.id] ? <ChevronDown size={12} color={V3.textTertiary} /> : <ChevronRight size={12} color={V3.textTertiary} />)}
                        </button>
                        {item.submenu && expandedMenus[item.id] && (
                          <div style={{ paddingLeft: '16px', marginTop: '2px', borderLeft: '1px solid rgba(255,255,255,0.06)', marginLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {item.submenu.map((sub, sIdx) => (
                              <button key={sIdx} onClick={() => handleNav(sub.id)} style={{ display: 'block', width: '100%', padding: '6px 12px', fontSize: '11.5px', color: activeSection === sub.id ? V3.textPrimary : V3.textSecondary, background: activeSection === sub.id ? 'rgba(0, 209, 193, 0.05)' : 'transparent', border: 'none', textAlign: 'left', borderRadius: '4px', cursor: 'pointer', transition: '0.2s' }}>
                                {sub.label}
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
              <button style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}>
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
const ActionButton = ({ children, onClick, variant }: any) => (
  <button onClick={onClick} className="btn-smooth-hover" style={{ padding: '8px 16px', background: variant === 'danger' ? 'rgba(0, 209, 193, 0.1)' : 'transparent', color: variant === 'danger' ? V3.tealLight : V3.textSecondary, border: `1px solid rgba(0, 209, 193, 0.3)`, borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)', transition: '0.2s' }}>{children}</button>
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
        <p style={{ fontSize: '12.5px', color: V3.textSecondary, marginTop: '4px' }}>Your personal workbook — CES obligations assigned to you & private tasks.</p>
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
            <button key={tab} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', background: tab === 'all' ? 'rgba(0, 209, 193, 0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${tab === 'all' ? V3.tealLight : 'rgba(255,255,255,0.1)'}`, color: tab === 'all' ? V3.textPrimary : V3.textSecondary, textTransform: 'capitalize' }}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 12px', width: isMobile ? '100%' : '240px' }}>
          <SearchIcon size={12} color={V3.textTertiary} />
          <input placeholder="Search planner..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '11.5px', width: '100%' }} />
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
              <button style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(0, 209, 193, 0.1)', border: `1px solid ${V3.tealLight}`, color: V3.tealLight, fontSize: '10.5px', fontWeight: 600, cursor: 'pointer' }}>Execute</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- KANBAN BOARD (SPRINT execution) ---
const SprintBoardWorkspace = () => {
  const [activeTask, setActiveTask] = useState<string>('Distribute agenda & pre-read packet');

  const columns = [
    { id: 'overdue', title: 'OVERDUE (18)', count: 18, items: [
      { id: '1', title: 'Verify pre-input completeness across all 4 sectors', policy: 'C2 QAPI Review', date: '2026-05-18' },
      { id: '2', title: 'Evidence for QAPI completeness review verification', policy: 'C2 QAPI Review', date: '2026-05-18' },
      { id: '3', title: 'Distribute agenda & pre-read packet', policy: 'C2 QAPI Review', date: '2026-05-20' },
      { id: '4', title: 'Review aggregate quality trends from CL-WP-25', policy: 'C2 QAPI Review', date: '2026-05-19' },
    ]},
    { id: 'at_risk', title: 'AT RISK (0)', count: 0, items: [] },
    { id: 'in_progress', title: 'IN PROGRESS (4)', count: 4, items: [
      { id: '5', title: 'Audit Plan of Care documentation', policy: 'POC Standard Audit', date: '2026-05-22' },
      { id: '6', title: 'Safety review & upload drill log to hubstaff', policy: 'Safety drill execution', date: '2026-05-24' }
    ]},
    { id: 'awaiting', title: 'AWAITING SIG (1)', count: 1, items: [
      { id: '7', title: 'Quarterly compliance board report signature', policy: 'Governance Board Exec', date: '2026-05-21' }
    ]},
  ];

  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, letterSpacing: '1px' }}>CES SPRINT WINDOW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>Sprint execution • Mon-Fri 2-week window</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: V3.textSecondary, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={12}/> Calendar</button>
            <button style={{ padding: '6px 12px', background: 'rgba(0,209,193,0.1)', border: '1px solid rgba(0,209,193,0.3)', borderRadius: '6px', color: V3.textPrimary, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={12}/> Sprint Board</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flex: 1, overflow: 'hidden', minHeight: '400px', flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Kanban Board */}
        <div style={{ display: 'flex', gap: '12px', flex: '3 1 600px', overflowX: 'auto', paddingBottom: '8px' }} className="no-scrollbar">
          {columns.map(col => (
            <div key={col.id} style={{ minWidth: '220px', flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.005)', borderRadius: '12px', padding: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: V3.textSecondary, letterSpacing: '0.5px' }}>{col.title}</span>
                <span style={{ fontSize: '10.5px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px', color: V3.textTertiary }}>{col.count}</span>
              </div>
              <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                {col.items.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '30px 0', color: V3.textTertiary, fontSize: '11px', fontStyle: 'italic' }}>No active tasks</div>
                ) : (
                  col.items.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setActiveTask(task.title)}
                      className="v3-invisible-glare" 
                      style={{ 
                        padding: '12px', 
                        background: activeTask === task.title ? 'rgba(0, 209, 193, 0.05)' : 'rgba(255,255,255,0.01)', 
                        border: activeTask === task.title ? '1px solid rgba(0,209,193,0.4)' : '1px solid rgba(255,255,255,0.08)', 
                        cursor: 'pointer' 
                      }}
                    >
                      <h4 style={{ fontSize: '12px', fontWeight: 500, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{task.title}</h4>
                      <div style={{ fontSize: '10.5px', color: V3.tealLight, fontWeight: 500, marginTop: '4px' }}>{task.policy}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '10px', color: V3.textTertiary }}>Assigned</span>
                        <span style={{ fontSize: '10px', color: V3.textTertiary }}>{task.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Task Detail Sidebar */}
        <div style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '9px', color: V3.tealLight, fontWeight: 700, letterSpacing: '0.5px', marginBottom: '4px' }}>SELECTED EXECUTIONS</div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: '0 0 2px 0' }}>{activeTask}</h2>
              <div style={{ fontSize: '11px', color: V3.textSecondary }}>Standard compliance schedule · May 2026</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', color: V3.textSecondary }}>FORMS <span style={{ color: V3.textPrimary, fontWeight: 600 }}>4 / 12</span></span>
            <span style={{ fontSize: '11px', color: V3.textSecondary }}>AWAITING SIG <span style={{ color: V3.tealLight, fontWeight: 600 }}>2</span></span>
          </div>

          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '10px', color: V3.textTertiary, fontWeight: 600, letterSpacing: '0.5px' }}>TASK CHECKPOINTS</div>
            {[
              { label: 'Submit pre-audit roster log', complete: true },
              { label: 'Generate clinician schedule match map', complete: true },
              { label: 'Distribute agenda & pre-read packet', complete: false },
              { label: 'Document quality review committee decisions', complete: false },
            ].map((t, i) => (
              <div key={i} style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.005)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: t.complete ? 'none' : '1px solid rgba(255,255,255,0.3)', background: t.complete ? V3.tealLight : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.complete && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#020617' }} />}
                  </div>
                  <span style={{ fontSize: '12px', color: t.complete ? V3.textSecondary : V3.textPrimary }}>{t.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
            <span style={{ padding: '3px 8px', background: 'rgba(0,209,193,0.1)', border: '1px solid rgba(0,209,193,0.3)', color: V3.tealLight, fontSize: '9px', fontWeight: 600, borderRadius: '4px' }}>LIVE_SECURE</span>
          </div>
          <p style={{ fontSize: '12px', color: V3.textSecondary, margin: '4px 0 10px 0' }}>Every file is bound to a policy / workflow / event triplet and read through secure audit APIs.</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Secure Timeline', 'Audit Ready Ledger', 'Compliance Chain of Custody'].map((tag, i) => (
              <span key={i} style={{ fontSize: '10.5px', padding: '4px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: V3.textSecondary }}>{tag}</span>
            ))}
          </div>
        </div>
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
              <div key={idx} className="v3-invisible-glare" style={{ padding: '12px', borderLeft: `3px solid ${item.pct === '100%' ? V3.tealLight : V3.orangeLight}` }}>
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
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 700, color: V3.textTertiary, letterSpacing: '0.5px' }}>
          <span>CMS COMPLIANCE TAXONOMY INTERNAL CORPUS</span>
          <span>•</span>
          <span>GROUNDED CLINICAL ADVISORIES</span>
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
                    setChatLog((prev: any) => [...prev, { sender: 'Brad', msg: `Aligning vectors for "${currInput}" under CMS standard clinical policy protocol... I recommend reviewing Section QAPI-9.2 for home hazard evaluations and verifying that all clinician credentials have been updated this quarter.` }]);
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
                    setChatLog((prev: any) => [...prev, { sender: 'Brad', msg: `Searching policy logs for "${currInput}"... 1 actionable hazard rule discovered. Please ensure all clinicians execute standard patient checklists prior to initial home evaluation visit.` }]);
                  }, 800);
                }
              }}
              style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 12px', background: 'rgba(0,209,193,0.15)', border: '1px solid rgba(0,209,193,0.3)', color: V3.tealLight, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >RUN</button>
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
              Brad dynamically displays the specific state or federal regulation matched to your query. Type a command to fetch relevant logs.
            </p>
          </div>
        </div>
      </div>
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
      default:
        return (
          <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '12px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{activeSection.toUpperCase()} Workspace</h1>
            </div>
            <EmptyState title="Under Active Sprint Construction" description={`The workspace panel for "${activeSection}" is currently being indexed into the system schedule.`} icon={<FileSearch size={28} color={V3.tealLight} />} />
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
