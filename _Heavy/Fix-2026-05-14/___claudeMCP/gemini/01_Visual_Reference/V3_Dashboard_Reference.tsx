// DashboardPage.tsx — V3 Veil Glass Reskin (Seamless Matte Slate-Carbon Theme)
// Redundant minimal sidebar removed. Top bar integrated directly into the main glass card.
// Background updated to premium matte slate-navy from reference.
// 
// VISUAL UPDATES APPLIED:
// - Navigation drawer containers made completely transparent/invisible (background: transparent, border: none)
// - Side navigation bar open state pushes content to the left dynamically, seamless slate-grey look
// - Added interrupted vertical divider line with very low opacity that does not connect to the top and bottom edges
// - Matched the precise matte slate-carbon glass and background aesthetic from reference image_a18341.png / Screenshot
// - Specular gradient updated: bright navy-grey top-left, blending bottom-left, deep black-charcoal bottom-right
// - Color palette streamlined to only Teal brand color & minimal Orange (Red completely eliminated)
// - Changed all orange highlights to teal except for the "Command Center" tag (which features active neon glow effect)
// - ADDED: Custom 2x2 pixel square grid pattern to the background container
// - REMOVED: Traveling radiating light nodes in the background for a cleaner static grid
// - INCREASED: Opacity of the locked Quadrant 3 (bottom-left) watermark of ci-angel.webp to 33% (0.33)
// - ADDED: "My Personal Workspace" styled with glowing radiant orange neon light-tube text shadow
// - ADDED: All task cards, overdue status labels, and borders converted to clean brand Teal
// - Set main card border to 'none' and added a realistic cast shadow on the right side
// - Removed background and border container boxes from KPI cards, banners, and planner (Only Kanban board & interactive cards retain borders)
// - Added full "My Planner" view matching reference image_ac8959.jpg, fully interactive with subtabs and search
// - All sidebar drawer links wired to live Reference Pages showing premium, non-wireframe data mocks
// - All scrollbars hidden while keeping scrolling functional

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Activity, ShieldCheck, CheckCircle2,
  FileText, Filter, MoreHorizontal, ArrowRight, Clock, ShieldX,
  LayoutDashboard, Users, Calendar, Settings, FileSearch, HelpCircle,
  Menu, Search, X, User, Bell, Bot, Network, UserPlus, FolderOpen, 
  ArrowUpCircle, Folder, PlayCircle, Shield, CheckSquare, SearchIcon
} from 'lucide-react';

// ============================================================
// MOCKS FOR PREVIEW ENVIRONMENT
// ============================================================
const useNavigate = () => () => {};
const useShellStore = (selector: any) => selector({ theme: 'care-indeed-dark' });
const useAutogenStore = (selector: any) => selector({ generatedEvents: [], triggeredEvents: [] });

const TODAY_ANCHOR = new Date();
const daysUntil = (d: Date, t: Date) => Math.floor((d.getTime() - t.getTime()) / 86400000);
const relativeLabel = () => 'Soon';
const FORM_TITLES: any = {};
const AUDIT_STATE_LABEL: any = {};

type RegulatoryEvent = { id: string; title: string; date: Date; domain: string; owner: string; isContext?: boolean; complianceFlags?: any };
type ViewMode = 'agency' | 'personal';
type AuditState = string;
type AuditEvaluation = { primary: string; eligibleForGraceCertification: boolean };

const REGULATORY_EVENTS: RegulatoryEvent[] = [
  { id: '1', title: 'QAPI Quarterly Meeting', date: new Date(), domain: 'Clinical', owner: 'J. Smith' },
  { id: '2', title: 'Fire Drill Log Upload', date: new Date(Date.now() - 86400000 * 2), domain: 'Safety', owner: 'M. Doe' },
  { id: '3', title: 'Annual Policy Review', date: new Date(Date.now() + 86400000 * 5), domain: 'Compliance', owner: 'Admin' }
];

const useRegulatoryExecutionStore = () => ({
  completions: {}, certifications: {}, stepStates: {}, formStates: {}, approvals: {}, minutesStates: {},
  isCertified: () => false, isEventComplete: () => false, getCertification: () => null
});

// RESTORED: Mock implementation of useComplianceExecution for preview compatibility
const useComplianceExecution = () => ({
  activeSprint: { label: 'Sprint 9' },
  sprintMetrics: { upcomingDeadlines48hCount: 2, completionRatePct: 88, activeBlockerCount: 0, auditReadinessScore: 92 },
  executionUnits: []
});

const evaluateAudit = (e: RegulatoryEvent): AuditEvaluation => {
  if (e.id === '1') return { primary: 'audit-ready', eligibleForGraceCertification: false };
  if (e.id === '2') return { primary: 'overdue', eligibleForGraceCertification: false };
  return { primary: 'in-progress', eligibleForGraceCertification: true };
};
const isReadyToClose = () => false;
const selectAuditReadinessRollup = () => ({ notReady: 1, partial: 2 });
const selectAwaitingSignatureUnits = () => ([]);

// ============================================================
// V3 PREMIUM GLASS TOKENS & STYLES (STREAMLINED PALETTE)
// ============================================================
const V3 = {
  // USER REQUEST: Premium warm matte slate-navy gradient from the uploaded screenshot
  baseBg: '#05060A', 
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',
  
  // Custom matte slate glassmorphism inspired by image_a18341.png
  glass1: 'transparent', // Cards & Panels (made fully transparent by default)
  glass2: 'rgba(255, 255, 255, 0.04)', // Cool sheen hover states
  glass3: 'rgba(255, 255, 255, 0.015)', // Subtle fills
  
  // Accents (STREAMLINED: Teal Brand & Minimal Orange only)
  teal: '#007970',
  tealLight: '#00D1C1', // Vibrant modern brand teal
  orange: '#E07B2C',
  orangeLight: '#FFA059', // Sharp minimal warning accent (Command Center exclusive)
  
  // Typography
  textPrimary: '#FFFFFF', // Clean high-contrast white
  textSecondary: '#94A3B8', // Refined slate grey
  textTertiary: '#64748B', // Elegant muted slate
  
  // USER REQUEST: All active internal border lines opacity increased to 33%
  borderDefault: 'rgba(255, 255, 255, 0.33)',
  borderHighlight: 'rgba(255, 255, 255, 0.33)', // Outer card border catch-light
  
  // USER REQUEST: Remove shadows and 3D elements
  glowSubtle: 'none',
} as const;

// RESTORED: The helper function v3 to calculate theme tokens based on selected state
function v3(isLight: boolean) {
  return {
    pageBg: V3.bgGradient,
    cardBg: V3.glass1,
    cardBorder: V3.borderDefault,
    surfaceHover: V3.glass2,
    textH1: V3.textPrimary,
    textBody: V3.textSecondary,
    textMuted: V3.textTertiary,
    
    colCritical: 'transparent',
    colWarning: 'transparent',
    colProgress: 'transparent',
    colPending: 'transparent',
    
    // STREAMLINED TONE MAPPINGS: Mapped strictly to Teal
    accentCritical: V3.tealLight,
    accentWarning: V3.tealLight,
    accentProgress: V3.tealLight,
    accentPending: V3.textTertiary,
    
    badgeBg: 'rgba(255, 255, 255, 0.04)',
    badgeText: V3.textSecondary,
  };
}

// ============================================================
// GLOBAL SCROLLBAR HIDER & HOVER GLARES
// ============================================================
const GlobalStylesheetInjector = () => (
  <style dangerouslySetInnerHTML={{__html: `
    /* Hide scrollbars globally */
    .no-scrollbar::-webkit-scrollbar {
      display: none !important;
    }
    .no-scrollbar {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    /* Ensure child scrolling elements also inherit hidden scrollbar styling */
    *::-webkit-scrollbar {
      display: none !important;
    }
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }

    /* USER REQUEST: Glare hover animation effect on all invisible containers (0.33s ease) */
    .v3-invisible-glare {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 12px;
      transition: background 0.33s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.33s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    
    .v3-invisible-glare:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.005) 100%) !important;
      border-color: rgba(255, 255, 255, 0.33) !important; /* Visible borders catch-light 33% */
    }
  `}} />
);

// ============================================================
// REAL MOCK DATA (MAPPED FROM IMAGES & LOGIC EXECUTIONS)
// ============================================================
interface TaskItem {
  id: string;
  domain: string;
  code: string;
  title: string;
  dueDate: string;
  overdue: boolean;
  status: 'open' | 'overdue' | 'pending' | 'completed';
}

const PLANNED_TASKS: TaskItem[] = [
  { id: 't-1', domain: 'CLINICAL', code: 'QA-WP-11', title: 'Distribute agenda & pre-read packet', dueDate: 'May 20', overdue: false, status: 'open' },
  { id: 't-2', domain: 'CLINICAL', code: 'CL-WP-25', title: 'Review aggregate quality trends from CL-WP-25, 27', dueDate: 'May 18', overdue: true, status: 'overdue' },
  { id: 't-3', domain: 'CLINICAL', code: 'CC-WP-22', title: 'Review compliance/billing audit results from CC-WP-22, 30', dueDate: 'May 19', overdue: true, status: 'overdue' },
  { id: 't-4', domain: 'CLINICAL', code: 'DM-WP-18', title: 'Review HO audit results from DM-WP-18, 21', dueDate: 'May 21', overdue: false, status: 'open' },
  { id: 't-5', domain: 'CLINICAL', code: 'DM-WP-15', title: 'Review data/safety audit results from DM-WP-15, 20', dueDate: 'May 22', overdue: false, status: 'open' },
  { id: 't-6', domain: 'CLINICAL', code: 'IT-WP-21', title: 'Review IT/security audit results from IT-WP-21, 25', dueDate: 'May 23', overdue: false, status: 'open' },
  { id: 't-7', domain: 'CLINICAL', code: 'QA-WP-12', title: 'Review OAPS-layer results: KPI (QA-WP-12), indicators (QA-WP-14), trends (QA-WP-15)', dueDate: 'May 24', overdue: false, status: 'open' },
  { id: 't-8', domain: 'CLINICAL', code: 'QA-WP-04', title: 'Review PIP (Plan-for-Improvement) execution logs', dueDate: 'May 25', overdue: false, status: 'open' },
  { id: 't-9', domain: 'CLINICAL', code: 'GV-WP-01', title: 'Package report for Governing Body [GV-WP-01]', dueDate: 'May 26', overdue: false, status: 'open' },
];

const CLINICIAN_RECORDS = [
  { name: 'Dr. Evelyn Vance', role: 'Clinical Lead', status: 'Compliant', id: 'EV-82F', cases: 14, audit: 'Passed' },
  { name: 'Marcus Sterling', role: 'Registered Nurse', status: 'Pending Review', id: 'MS-104', cases: 9, audit: 'Under Review' },
  { name: 'Sophia Caldwell', role: 'Physical Therapist', status: 'Compliant', id: 'SC-302', cases: 11, audit: 'Passed' },
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
        { id: 'clinicians', icon: Users, label: 'Clinician Profiles' },
        { id: 'patients', icon: Users, label: 'Patient Profiles' }, 
        { id: 'calendar', icon: Calendar, label: 'Calendar' },
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
        { id: 'evidence', icon: FolderOpen, label: 'Evidence Locker' },
      ]
    }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      color: V3.textPrimary, 
      fontFamily: "'Inter', system-ui, sans-serif", 
      padding: isMobile ? '0' : '20px', 
      overflow: 'hidden', 
      position: 'relative',
      // USER REQUEST: Background with subtle 2x2 pixel square grid pattern integrated with premium radial glow
      backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)
      `,
      backgroundSize: '24px 24px, 24px 24px, 100% 100%',
      backgroundBlendMode: 'screen, screen, normal'
    }}>
      <GlobalStylesheetInjector />
      
      {/* USER REQUEST: Watermark with image axis locked in Quadrant 3 (bottom-left) - Opacity increased to 33% (0.33) */}
      <div style={{
        position: 'fixed',
        bottom: '-8vh',
        left: '-8vw',
        width: '55vmin',
        height: '55vmin',
        backgroundImage: `url('ci-angel.webp')`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom left',
        opacity: 0.33, 
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      
      {/* The 77.7% Framed Main Card (Translucent Matte Carbon Glass Treatment) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column', 
        width: isMobile ? '100%' : '77.7%',
        minWidth: isMobile ? '100%' : '980px',
        height: isMobile ? '100vh' : '92vh',
        border: 'none',
        borderRadius: isMobile ? '0' : '24px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(32, 41, 56, 0.88) 0%, rgba(16, 20, 28, 0.45) 60%, rgba(8, 10, 13, 0.98) 100%)', 
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        boxShadow: isMobile ? 'none' : '30px 10px 80px rgba(0, 0, 0, 0.9)',
        position: 'relative',
        zIndex: 2 
      }}>
        
        {/* ── TOP HEADER BAR ── */}
        <header style={{ 
          height: '72px', flexShrink: 0, 
          borderBottom: 'none', 
          background: 'transparent', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0 40px', zIndex: 20
        }}>
          {/* Left: Burger + Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
            <button 
              onClick={() => setIsNavOpen(!isNavOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', color: V3.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = V3.glass3; e.currentTarget.style.color = V3.textPrimary; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = V3.textSecondary; }}
            >
              <Menu size={24} />
            </button>
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: V3.glass3, border: 'none',
              borderRadius: '20px', padding: '10px 16px', width: isMobile ? '100%' : '320px',
              transition: 'all 0.2s',
            }}>
              <Search size={16} color={V3.textTertiary} />
              <input 
                placeholder="Search operations, policies..." 
                style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} 
              />
            </div>
          </div>

          {/* Right: Workspace Toggle & Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeSection === 'dashboard' && (
              <div style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.03)',
                padding: '4px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <button 
                  onClick={() => setIsPlannerView(false)}
                  style={{
                    padding: '6px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer',
                    background: !isPlannerView ? V3.tealLight : 'transparent',
                    color: !isPlannerView ? '#000000' : V3.textSecondary,
                    transition: 'all 0.2s'
                  }}
                >
                  Agency View
                </button>
                <button 
                  onClick={() => setIsPlannerView(true)}
                  style={{
                    padding: '6px 14px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer',
                    background: isPlannerView ? V3.tealLight : 'transparent',
                    color: isPlannerView ? '#000000' : V3.textSecondary,
                    transition: 'all 0.2s'
                  }}
                >
                  My Planner
                </button>
              </div>
            )}

            {!isMobile && <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.3px', color: V3.textPrimary }}>CareIndeed</span>}
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg, ${V3.teal}, ${V3.teal}80)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
              CI
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          
          {/* USER REQUEST: Fully transparent navigation container (0.7s sliding transition) */}
          <nav className="no-scrollbar" style={{
            width: isNavOpen ? '260px' : '0px',
            minWidth: isNavOpen ? (isMobile ? '100%' : '260px') : '0px',
            opacity: isNavOpen ? 1 : 0,
            transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'transparent', 
            borderRight: 'none',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: isMobile && isNavOpen ? 'absolute' : 'relative',
            top: 0, bottom: 0, left: 0,
            height: '100%',
          }}>
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 'none', background: 'transparent' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: V3.textTertiary }}>MENU</span>
              <button onClick={() => setIsNavOpen(false)} style={{ background: 'transparent', border: 'none', color: V3.textTertiary, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
              {navSections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '24px' }}>
                  <div style={{ padding: '0 12px', marginBottom: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: V3.textTertiary }}>
                    {section.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {section.items.map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsNavOpen(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                          padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: activeSection === item.id ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                          color: activeSection === item.id ? V3.textPrimary : V3.textSecondary,
                          transition: 'all 0.2s', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => { if(activeSection !== item.id) { e.currentTarget.style.background = V3.glass3; e.currentTarget.style.color = V3.textPrimary; } }}
                        onMouseLeave={(e) => { if(activeSection !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = V3.textSecondary; } }}
                      >
                        <item.icon size={18} color={activeSection === item.id ? V3.tealLight : V3.textTertiary} />
                        <span style={{ fontSize: '13px', fontWeight: activeSection === item.id ? 600 : 500 }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '20px 24px', borderTop: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: V3.glass2, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} color={V3.textSecondary} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary }}>Admin User</span>
                  <span style={{ fontSize: '11px', color: V3.textTertiary }}>View Profile</span>
                </div>
              </div>
              <button style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <Bell size={20} color={V3.textSecondary} />
                <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: V3.tealLight, borderRadius: '50%', border: `2px solid #161A22` }} />
              </button>
            </div>
          </nav>

          {/* USER REQUEST: Single vertical divider catching light, sliding smoothly with 0.7s duration */}
          <div style={{
            width: isNavOpen && !isMobile ? '1px' : '0px',
            opacity: isNavOpen && !isMobile ? 1 : 0,
            transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s ease-in-out',
            alignSelf: 'stretch',
            marginTop: '24px',
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.12)', 
            zIndex: 10
          }} />

          {/* Actual Dashboard Content */}
          <div className={`no-scrollbar ${className}`} style={{ flex: 1, padding: isMobile ? '20px' : '10px 40px 32px 40px', overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

// USER REQUEST: All non-kanban containers made completely transparent/invisible with no borders
const ActionButton = ({ children, onClick, variant }: any) => (
  <button onClick={onClick} style={{ padding: '8px 16px', background: variant === 'danger' ? 'rgba(0, 209, 193, 0.1)' : 'transparent', color: variant === 'danger' ? V3.tealLight : V3.textSecondary, border: variant === 'ghost' ? 'none' : `1px solid rgba(255, 255, 255, 0.33)`, borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.33s cubic-bezier(0.25, 1, 0.5, 1)', backdropFilter: 'blur(8px)' }}>{children}</button>
);

const EmptyState = ({ title, description, action, icon }: any) => (
  <div style={{ padding: '32px', textAlign: 'center', color: V3.textTertiary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'transparent', borderRadius: '8px', border: 'none' }}>{icon}<div style={{ fontWeight: 500, color: V3.textPrimary, fontSize: '14px' }}>{title}</div><div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div><div style={{ marginTop: '8px' }}>{action}</div></div>
);

const PlannerViewToggle = () => (
  <div style={{ fontSize: '11px', fontWeight: 600, padding: '6px 12px', background: V3.glass3, border: 'none', borderRadius: '20px', color: V3.textSecondary, letterSpacing: '0.5px' }}>AGENCY VIEW</div>
);

// USER REQUEST: All container boxes removed except Kanban (Border set to none/transparent)
const MyPlannerView = () => (
  <div className="v3-invisible-glare" style={{ padding: '40px 0', background: 'transparent', color: V3.textTertiary, textAlign: 'center', fontSize: '13px' }}>Planner items appear here</div>
);
const ToastHost = () => null;

// ============================================================
// COMPONENT MAIN ENGINE
// ============================================================
export default function App() {
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1920 : window.innerWidth);
  const isMobile = viewportWidth < 768;
  const isLight = false; 
  const theme = v3(isLight);

  // Shell State Management
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPlannerView, setIsPlannerView] = useState(false);

  // My Planner States
  const [plannerSearch, setPlannerSearch] = useState('');
  const [activePlannerSubtab, setActivePlannerSubtab] = useState<'all' | 'open' | 'overdue' | 'this-week' | 'evidence'>('all');
  const [isEvidenceQueueOpen, setIsEvidenceQueueOpen] = useState(false);

  // Brad Chatbot state
  const [chatLog, setChatLog] = useState(INTRO_CHATS);
  const [chatInput, setChatInput] = useState('');

  const snap = useComplianceExecution();

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Filter planner tasks based on Tab selection & Search query
  const filteredPlannerTasks = useMemo(() => {
    return PLANNED_TASKS.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(plannerSearch.toLowerCase()) || task.code.toLowerCase().includes(plannerSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (activePlannerSubtab === 'open') return task.status === 'open' || task.status === 'overdue';
      if (activePlannerSubtab === 'overdue') return task.overdue;
      if (activePlannerSubtab === 'this-week') return task.dueDate.includes('May');
      if (activePlannerSubtab === 'evidence') return task.code.includes('WP');
      return true;
    });
  }, [plannerSearch, activePlannerSubtab]);

  // View router selection mapping
  const renderWorkspace = () => {
    if (activeSection === 'dashboard') {
      if (isPlannerView) {
        return renderPlannerWorkspace();
      }
      return renderDashboardWorkspace();
    }
    return renderReferencePage();
  };

  // ──────── 1. AGENCY DASHBOARD VIEW (Original Dashboard reskin) ────────
  const renderDashboardWorkspace = () => {
    const criticalAndOverdue = REGULATORY_EVENTS.filter(e => e.id === '2');
    const atRisk = REGULATORY_EVENTS.filter(e => e.id === '3');
    const inProgress = REGULATORY_EVENTS.filter(e => e.id === '1');
    const awaitingBoardItems = [
      { id: 'a1', title: 'Missed Visit Documentation Form awaiting signature', domain: 'Clinical', owner: 'Clinical Manager', date: new Date() },
      { id: 'a2', title: 'Physician Orders pending signature', domain: 'Clinical', owner: 'Clinical Manager', date: new Date() },
    ];

    const kpis: KpiCardData[] = [
      { label: 'Active Sprint', value: 'Sprint 9', trend: `2 due within 48h` },
      { label: 'Sprint %', value: `${snap.sprintMetrics.completionRatePct}%`, trend: `${snap.sprintMetrics.activeBlockerCount} blockers`, tone: 'positive' },
      { label: 'Audit Ready', value: `0/445`, trend: `${snap.sprintMetrics.auditReadinessScore}/100`, tone: 'positive' },
      { label: 'Action In Progress', value: `317`, trend: `0 ready to close` },
      { label: 'Missing Evidence', value: `0`, trend: `0 pending approval` },
      { label: 'Critical Actions', value: `121`, trend: `0 at risk`, alert: true },
      { label: 'Audit Open', value: `1041`, trend: `0 awaiting sig` },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Dashboard Hero */}
        <div style={{ background: 'transparent', border: 'none', borderRadius: '16px', boxShadow: 'none' }}>
          <section style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '300px', flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: V3.orangeLight, textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)' }}>
                  Command Center
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: theme.textMuted, letterSpacing: '0.2px' }}>
                  What needs action now
                </span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 600, lineHeight: 1.2, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                What needs action now
              </h1>
              <p style={{ fontSize: '14px', color: theme.textMuted, marginTop: '8px', lineHeight: 1.5, maxWidth: '600px' }}>
                Executive operational narrative for compliance execution, evidence readiness, and escalation control. Prioritize critical controls and lock evidence-ready workflows.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px', flex: '1 1 auto' }}>
              <HeroStat label="Critical" value={121} tone="danger" />
              <HeroStat label="At Risk" value={0} tone="warning" />
              <HeroStat label="Audit Ready" value={0} tone="success" />
              <HeroStat label="In Scope" value={445} tone="default" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', borderLeft: isMobile ? 'none' : `1px solid ${V3.borderDefault}`, paddingLeft: isMobile ? '0' : '24px', width: isMobile ? '100%' : 'auto' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: theme.textMuted, letterSpacing: '0.4px' }}>Today</span>
              <span style={{ fontWeight: 500, color: theme.textBody, fontSize: '14px' }}>{TODAY_ANCHOR.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              <div style={{ marginTop: '8px' }}><PlannerViewToggle /></div>
            </div>
          </section>
        </div>

        {/* KPIs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px' }}>
          {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        {/* Agency Readiness Banner */}
        <AgencyReadinessBanner ready={false} reasons={['121 Overdue', '0 Blockers']} atRisk={0} graceWindow={0} certifiedWithException={0} onClickNotReady={() => {}} />

        {/* Kanban Board Container */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px', marginTop: '16px' }}>
          <BoardColumn title="Critical & Overdue" count={criticalAndOverdue.length} tone="critical" items={criticalAndOverdue} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="At Risk" count={atRisk.length} tone="warning" items={atRisk} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="In Progress" count={inProgress.length} tone="progress" items={inProgress} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="Awaiting Action" count={awaitingBoardItems.length} tone="pending" items={awaitingBoardItems.map(item => ({ id: item.id, title: item.title, domain: item.domain, owner: item.owner, date: item.date } as RegulatoryEvent))} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
        </div>
      </div>
    );
  };

  // ──────── 2. MY PLANNER WORKSPACE VIEW (Matching image_ac8959.jpg / image_acf9d0.jpg) ────────
  const renderPlannerWorkspace = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Planner Header Title Block */}
        <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {/* USER REQUEST: "My Personal Workspace" styled with CheckSquare icon in Orange with neon glow text effect (no box background) */}
            <CheckSquare size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
            <span style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              color: V3.orangeLight,
              textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)' // Radiant light neon effect
            }}>
              My Personal Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: V3.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>My Planner</h1>
          <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Your personal workbook — CES obligations assigned to you & private tasks.</p>
        </div>

        {/* Tab Cards / Status counters */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
          <div className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>MY OPEN CES</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary }}>3001</span>
          </div>
          <div className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>OVERDUE</span>
            {/* USER REQUEST: Overdue status value modified to clean brand Teal */}
            <span style={{ fontSize: '22px', fontWeight: 600, color: V3.tealLight }}>0</span>
          </div>
          <div className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>EVIDENCE PENDING</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: V3.tealLight }}>3001</span>
          </div>
          <div className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase' }}>PERSONAL TASKS</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary }}>0</span>
          </div>
        </div>

        {/* Task Filtering Options */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['all', 'open', 'overdue', 'this-week', 'evidence'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActivePlannerSubtab(tab)}
                style={{
                  padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                  background: activePlannerSubtab === tab ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                  border: `1px solid ${activePlannerSubtab === tab ? V3.tealLight : 'transparent'}`,
                  color: activePlannerSubtab === tab ? V3.textPrimary : V3.textSecondary,
                  transition: 'all 0.2s', textTransform: 'capitalize'
                }}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '280px' }}>
            <SearchIcon size={14} color={V3.textTertiary} />
            <input 
              value={plannerSearch}
              onChange={(e) => setPlannerSearch(e.target.value)}
              placeholder="Search planner..."
              style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }}
            />
          </div>
        </div>

        {/* Task Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {filteredPlannerTasks.map(task => (
            <div 
              key={task.id} 
              className="v3-invisible-glare"
              style={{
                padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
                // USER REQUEST: Overdue cards (circled in yellow in image_acf9d0.jpg) converted from orange to brand Teal
                border: task.overdue ? `1px solid rgba(0, 209, 193, 0.33)` : `1px solid rgba(255, 255, 255, 0.33)`,
                background: task.overdue ? 'rgba(0, 209, 193, 0.02)' : 'transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* USER REQUEST: Domain label text color modified from orange to brand Teal */}
                <span style={{ fontSize: '10px', fontWeight: 700, color: task.overdue ? V3.tealLight : V3.tealLight }}>{task.domain}</span>
                <span style={{ fontSize: '11px', color: V3.textTertiary, fontFamily: 'monospace' }}>{task.code}</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: V3.textPrimary, margin: 0, minHeight: '40px', lineHeight: 1.4 }}>{task.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: V3.textSecondary }}>Due {task.dueDate}</span>
                <ActionButton variant="ghost">Execute</ActionButton>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Split: Critical & This Sprint */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* USER REQUEST: Overdue title label text color modified from orange to brand Teal */}
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: 0, textTransform: 'uppercase' }}>My Critical & Overdue</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PLANNED_TASKS.filter(t => t.overdue).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: `1px solid ${V3.borderDefault}` }}>
                  <span style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</span>
                  {/* USER REQUEST: Overdue warning badge (circled in yellow in image_acf9d0.jpg) text color modified to brand Teal */}
                  <span style={{ fontSize: '11px', color: V3.tealLight, fontWeight: 600 }}>OVERDUE</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: 0, textTransform: 'uppercase' }}>This Sprint & Upcoming</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PLANNED_TASKS.filter(t => !t.overdue).slice(0, 3).map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: `1px solid ${V3.borderDefault}` }}>
                  <span style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</span>
                  <span style={{ fontSize: '11px', color: V3.textSecondary }}>Due {task.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Evidence Queue Sticky Footer Bar */}
        <div style={{
          padding: '16px 24px', background: 'rgba(0, 209, 193, 0.08)',
          border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderOpen size={20} color={V3.tealLight} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Evidence Queue</div>
              <div style={{ fontSize: '12px', color: V3.textSecondary }}>9001 items await your upload or approval.</div>
            </div>
          </div>
          <ActionButton onClick={() => setIsEvidenceQueueOpen(true)}>Open Evidence Queue</ActionButton>
        </div>

        {/* Bottom Drawer Overlay for Evidence Queue */}
        {isEvidenceQueueOpen && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%', background: '#0F1116', borderTop: `1px solid ${V3.borderHighlight}`, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Active Evidence Locker Items</h3>
                <button onClick={() => setIsEvidenceQueueOpen(false)} style={{ background: 'transparent', border: 'none', color: V3.textSecondary, cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
                  <span style={{ color: V3.textSecondary }}>eSIGNED Forms queue</span>
                  <span style={{ color: V3.tealLight, fontWeight: 600 }}>35% Loaded</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
                  <span style={{ color: V3.textSecondary }}>Meeting minutes archives</span>
                  <span style={{ color: V3.tealLight, fontWeight: 600 }}>60% Compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // ──────── 3. DIRECT REFERENCE PAGES PORT (Active Sidebar Mocks) ────────
  const renderReferencePage = () => {
    switch (activeSection) {
      case 'clinicians':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Clinician Profiles</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Active medical and administrative practitioners compliance registers.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {CLINICIAN_RECORDS.map((clinician, idx) => (
                <div key={idx} className="v3-invisible-glare" style={{ padding: '20px', border: `1px solid rgba(255,255,255,0.33)` }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{clinician.name}</h3>
                  <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '4px' }}>{clinician.role}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${V3.borderDefault}` }}>
                    <span style={{ fontSize: '12px', color: V3.textTertiary }}>{clinician.cases} Active Cases</span>
                    <span style={{ fontSize: '11px', color: V3.tealLight, fontWeight: 600 }}>{clinician.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'patients':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Patient Profiles</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Clinical registers for assigned home health treatment programs.</p>
            </div>
            <div style={{ padding: '32px', background: 'transparent', border: `1px solid rgba(255,255,255,0.33)`, borderRadius: '12px', textAlign: 'center', color: V3.textSecondary }}>
              No current patient access logs locked. All HIPAA pipelines fully encrypted.
            </div>
          </div>
        );

      case 'brad':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Brad AI Copilot</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Query CMS guidelines and system-wide operational frameworks.</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '300px' }}>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatLog.map((chat, idx) => (
                  <div key={idx} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', maxWidth: '80%' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: V3.tealLight, display: 'block', marginBottom: '4px' }}>{chat.sender}</span>
                    <p style={{ fontSize: '13px', color: V3.textPrimary, margin: 0 }}>{chat.msg}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Brad a compliance question..." 
                  style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.33)`, borderRadius: '12px', color: V3.textPrimary, outline: 'none' }}
                />
                <button 
                  onClick={() => {
                    if(!chatInput.trim()) return;
                    setChatLog([...chatLog, { sender: 'You', msg: chatInput }, { sender: 'Brad', msg: `Querying local training data regarding "${chatInput}"... All vectors aligned.` }]);
                    setChatInput('');
                  }}
                  style={{ padding: '0 24px', background: V3.tealLight, border: 'none', color: '#000000', fontWeight: 600, borderRadius: '12px', cursor: 'pointer' }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        );

      case 'taxonomy':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>Compliance Taxonomy Map</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Structured classifications for home care regulatory frameworks.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="v3-invisible-glare" style={{ padding: '20px', border: `1px solid rgba(255,255,255,0.33)` }}>
                <h3 style={{ fontSize: '15px', color: V3.textPrimary, margin: 0 }}>Clinical Integrity (CI)</h3>
                <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '6px' }}>Formulations, medication records, and clinical logs.</p>
              </div>
              <div className="v3-invisible-glare" style={{ padding: '20px', border: `1px solid rgba(255,255,255,0.33)` }}>
                <h3 style={{ fontSize: '15px', color: V3.textPrimary, margin: 0 }}>Safety Audits (SA)</h3>
                <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '6px' }}>Emergency response metrics and safety audits.</p>
              </div>
              <div className="v3-invisible-glare" style={{ padding: '20px', border: `1px solid rgba(255,255,255,0.33)` }}>
                <h3 style={{ fontSize: '15px', color: V3.textPrimary, margin: 0 }}>Governance Standards (GV)</h3>
                <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '6px' }}>Strategic management protocols and boards.</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{activeSection.toUpperCase()} Page Reference</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Real-time compliance ledger data and structured metadata.</p>
            </div>
            <div style={{ padding: '40px', background: 'transparent', border: `1px solid rgba(255, 255, 255, 0.33)`, borderRadius: '12px', textAlign: 'center', color: V3.textSecondary }}>
              No current errors. View is fully synchronized with V3 Veil Glass configurations.
            </div>
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

// ============================================================
// INDIVIDUAL RESKINKED REUSABLE ELEMENTS (V3 COMPLIANT)
// ============================================================
function HeroStat({ label, value, tone }: any) {
  const toneMap = {
    default: { bg: 'transparent', border: 'none', color: V3.textPrimary },
    success: { bg: 'transparent', border: 'none', color: V3.tealLight },
    warning: { bg: 'transparent', border: 'none', color: V3.tealLight },
    danger: { bg: 'transparent', border: 'none', color: V3.tealLight },
  }[tone as 'default' | 'success' | 'warning' | 'danger'];

  return (
    <div style={{
      border: toneMap.border,
      padding: '12px 18px', background: toneMap.bg, minWidth: '100px',
      display: 'flex', flexDirection: 'column', gap: '4px'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 600, color: toneMap.color, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}

function KpiCard({ label, value, trend, tone = 'default', alert, onClick }: KpiCardData) {
  const theme = v3(false);
  const [hovered, setHovered] = useState(false);

  const valueColor = { default: theme.toneDefault, positive: theme.tonePositive, warning: theme.tonePositive, danger: theme.tonePositive }[tone];
  const trendColor = { default: theme.trendDefault, positive: theme.trendPositive, warning: theme.trendPositive, danger: theme.trendPositive }[tone];
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="v3-invisible-glare" // Glare hover 0.33s
      style={{
        background: 'transparent',
        borderRadius: '12px', 
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transform: 'none',
        boxShadow: 'none',
        textAlign: 'left' as any,
        display: 'flex', flexDirection: 'column' as any, gap: '8px',
        ...(onClick ? { outline: 'none' } : {}),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: theme.textMuted }}>{label}</span>
        {/* USER REQUEST: Alert icon updated to Teal */}
        {alert && <AlertTriangle size={14} color={V3.tealLight} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto' }}>
        <span style={{ fontSize: '24px', fontWeight: 600, color: valueColor, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</span>
      </div>
      {trend && <div style={{ fontSize: '12px', fontWeight: 500, color: trendColor }}>{trend}</div>}
    </Wrapper>
  );
}

function AgencyReadinessBanner({ ready, reasons, atRisk, graceWindow, certifiedWithException, onClickNotReady }: any) {
  const theme = v3(false);
  const Icon = ready ? ShieldCheck : ShieldX;
  const accentColor = ready ? V3.tealLight : V3.tealLight;

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '20px', flexWrap: 'wrap', 
      background: 'transparent',
      border: 'none',
      padding: '0' 
    }}>
      <span style={{
        width: '40px', height: '40px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: ready ? 'rgba(0, 209, 193, 0.15)' : 'rgba(0, 209, 193, 0.15)',
        boxShadow: 'none',
        flexShrink: 0,
      }}>
        <Icon size={20} color={accentColor} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: accentColor }}>
          {ready ? 'Agency Readiness — Ready' : 'Agency Readiness — Action Required'}
        </div>
        <p style={{ fontSize: '14px', color: theme.textBody, marginTop: '6px', lineHeight: 1.4 }}>
          {ready ? 'All workflows compliant or certification-ready.' : `${reasons.join(' · ')}. Immediate action needed.`}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', flexWrap: 'wrap' }}>
        {atRisk > 0 && <V3Chip label="At Risk" value={atRisk} />}
        {graceWindow > 0 && <V3Chip label="Grace" value={graceWindow} />}
        {certifiedWithException > 0 && <V3Chip label="Cert w/ Exc" value={certifiedWithException} />}
        {!ready && (
          <ActionButton variant="danger" size="sm" onClick={onClickNotReady}>View Readiness Report</ActionButton>
        )}
      </div>
    </div>
  );
}

function BoardColumn({ title, count, tone, items, today, onOpen, onFallback }: any) {
  const theme = v3(false);
  const toneConfig = {
    critical: { icon: AlertTriangle, accent: theme.accentCritical },
    warning: { icon: Clock, accent: theme.accentWarning },
    progress: { icon: Activity, accent: theme.accentProgress },
    pending: { icon: FileText, accent: theme.accentPending },
  }[tone as BoardTone];

  return (
    <section style={{
      background: 'transparent',
      border: 'none',
      padding: '0', 
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <toneConfig.icon size={16} color={toneConfig.accent} />
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: theme.textH1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>{title}</h3>
        </div>
        <span style={{ minWidth: '26px', height: '26px', padding: '0 8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, background: theme.badgeBg, color: theme.badgeText }}>{count}</span>
      </header>

      <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', minHeight: 0 }}>
        {items.length > 0 ? items.map((event: any) => (
          <TaskCard key={event.id} event={event} today={today} onClick={() => onOpen(event.id)} onFallback={onFallback} tone={tone} />
        )) : (
          <EmptyState icon={<CheckCircle2 size={24} color={V3.tealLight} opacity={0.5} />} title="All clear" description={`No ${title.toLowerCase()} items.`} />
        )}
      </div>
    </section>
  );
}

function TaskCard({ event, today, onClick, onFallback, tone }: any) {
  const theme = v3(false);
  const [hovered, setHovered] = useState(false);
  const dueLabel = getDueLabel(event, today);
  
  const dueBadgeStyle = {
    critical: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight, border: 'none' },
    warning: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight, border: 'none' },
    progress: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight, border: 'none' },
    pending: { bg: theme.badgeBg, color: theme.badgeText, border: 'none' },
  }[tone as BoardTone];

  return (
    <button
      type="button"
      onClick={() => { if (!event.id) { onFallback(); return; } onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', borderRadius: '10px',
        border: `1px solid ${hovered ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.33)'}`,
        padding: '16px', textAlign: 'left', cursor: 'pointer',
        background: hovered ? V3.glass2 : 'rgba(255, 255, 255, 0.015)',
        transition: 'all 0.2s ease',
        transform: 'none',
        boxShadow: 'none',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: theme.textMuted, letterSpacing: '0.6px', marginBottom: '6px' }}>{event.domain}</div>
          <h4 style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, color: theme.textH1, margin: 0 }}>{event.title}</h4>
        </div>
        <MoreHorizontal size={16} color={theme.textMuted} style={{ flexShrink: 0, opacity: hovered ? 1 : 0.5, transition: 'opacity 0.2s' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, background: 'rgba(0,0,0,0.2)', color: theme.textSecondary, border: 'none', flexShrink: 0 }}>
            {getInitials(event.owner)}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 500, color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.owner}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', padding: '4px 8px', borderRadius: '6px', background: dueBadgeStyle.bg, color: dueBadgeStyle.color, border: 'none' }}>
            {dueLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================
// CHIP & UTILITIES HELPERS
// ============================================================
function V3UtilityBtn({ icon, label }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.33)', background: hovered ? V3.glass2 : V3.glass1, color: V3.textSecondary, transition: 'all 0.33s cubic-bezier(0.25, 1, 0.5, 1)', outline: 'none', backdropFilter: 'blur(8px)' }}>
      {icon}{label}
    </button>
  );
}

function V3Chip({ label, value }: any) {
  return (
    <span style={{ fontSize: '11px', fontWeight: 500, padding: '4px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: V3.textSecondary, border: '1px solid rgba(255, 255, 255, 0.33)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ fontWeight: 600, color: V3.textPrimary }}>{value}</span>
    </span>
  );
}

function getDueLabel(event: RegulatoryEvent, today: Date) {
  const delta = daysUntil(event.date, today);
  if (delta < 0) return `${Math.abs(delta)}D PAST`;
  if (delta === 0) return 'TODAY';
  if (delta === 1) return 'TOMORROW';
  if (delta <= 14) return `${delta}D`;
  return relativeLabel().toUpperCase();
}

function getInitials(owner: string) {
  return owner.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || 'CI';
}