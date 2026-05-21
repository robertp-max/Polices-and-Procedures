// DashboardPage.tsx – V3 Veil Glass Dashboard (Source of Truth: Dashboard.html)
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle, Activity, ShieldCheck, CheckCircle2, FileText, MoreHorizontal,
  Clock, ShieldX, LayoutDashboard, Users, Calendar, HelpCircle, Menu, Search,
  X, Bot, Network, UserPlus, FolderOpen, ArrowUpCircle, Folder, PlayCircle,
  Shield, CheckSquare, ChevronDown, ChevronRight, FileSearch, Settings,
} from 'lucide-react';
const SearchIcon = Search;

// ============================================================
// TYPES
// ============================================================
interface RegulatoryEvent {
  id: string;
  title: string;
  domain: string;
  owner: string;
  date: Date;
}

type BoardTone = 'critical' | 'warning' | 'progress' | 'pending';

interface KpiCardData {
  label: string;
  value: string | number;
  trend?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  alert?: boolean;
  onClick?: () => void;
}

interface TaskItem {
  id: string;
  domain: string;
  code: string;
  title: string;
  dueDate: string;
  overdue: boolean;
  status: 'open' | 'overdue' | 'pending' | 'completed';
}

// ============================================================
// DATA
// ============================================================
const TODAY_ANCHOR = new Date();

const daysUntil = (d: Date, from: Date) =>
  Math.round((d.getTime() - from.getTime()) / 86400000);

const relativeLabel = () => {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(TODAY_ANCHOR.getTime() + 30 * 86400000).toLocaleDateString('en-US', opts);
};

const REGULATORY_EVENTS: RegulatoryEvent[] = [
  {
    id: '1',
    title: 'QAPI Committee Meeting — Q2 Agenda Distribution',
    domain: 'Quality Assurance',
    owner: 'J. Ramirez',
    date: new Date(TODAY_ANCHOR.getTime() + 2 * 86400000),
  },
  {
    id: '2',
    title: 'Missed Visit Documentation Form — Physician Signature Required',
    domain: 'Clinical Documentation',
    owner: 'Clinical Manager',
    date: new Date(TODAY_ANCHOR.getTime() - 3 * 86400000),
  },
  {
    id: '3',
    title: 'OASIS-E Accuracy Review — Data Lock in 72h',
    domain: 'Data Integrity',
    owner: 'HIM Director',
    date: new Date(TODAY_ANCHOR.getTime() + 1 * 86400000),
  },
];

const INITIAL_PLANNED_TASKS: TaskItem[] = [
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
  { name: 'Sarah Jenkins', role: 'Occupational Therapist', status: 'Compliant', id: 'SJ-204', cases: 8, audit: 'Passed' },
  { name: 'David Cho', role: 'Clinical Informatics', status: 'Pending Review', id: 'DC-992', cases: 15, audit: 'Under Review' },
];

const INTRO_CHATS = [
  { sender: 'Brad', msg: 'Hello! I am Brad, your CareIndeed Clinical Copilot. Ask me anything about home health guidelines, taxonomy, or current CES protocols.' },
];

const MASONRY_DOCS = [
  { id: 'm-1', title: 'eSigned Admissions Form', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600', url: '#', height: 420 },
  { id: 'm-2', title: 'CMS Guideline Package', img: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600', url: '#', height: 350 },
  { id: 'm-3', title: 'QAPI System Documentation', img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600', url: '#', height: 500 },
  { id: 'm-4', title: 'Clinician Compliance Log', img: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600', url: '#', height: 380 },
  { id: 'm-5', title: 'Patient Consent Form v2', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600', url: '#', height: 450 },
  { id: 'm-6', title: 'Physician Order Archive', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', url: '#', height: 400 },
];

// ============================================================
// V3 TOKENS
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
} as const;

function v3(_isLight: boolean) {
  return {
    pageBg: V3.bgGradient,
    cardBg: V3.glass1,
    cardBorder: V3.borderDefault,
    surfaceHover: V3.glass2,
    textH1: V3.textPrimary,
    textBody: V3.textSecondary,
    textMuted: V3.textTertiary,
    textSecondary: V3.textSecondary,
    toneDefault: V3.textPrimary,
    tonePositive: V3.tealLight,
    trendDefault: V3.textTertiary,
    trendPositive: V3.tealLight,
    colCritical: 'transparent',
    colWarning: 'transparent',
    colProgress: 'transparent',
    colPending: 'transparent',
    accentCritical: V3.tealLight,
    accentWarning: V3.tealLight,
    accentProgress: V3.tealLight,
    accentPending: V3.textTertiary,
    badgeBg: 'rgba(255, 255, 255, 0.04)',
    badgeText: V3.textSecondary,
  };
}

// ============================================================
// GLOBAL STYLESHEET INJECTOR
// ============================================================
const GlobalStylesheetInjector = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .no-scrollbar::-webkit-scrollbar { display: none !important; }
    .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); filter: blur(2px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    .animate-butter-shift { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes slideDownIn {
      from { opacity: 0; transform: translateY(-12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down { animation: slideDownIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    .v3-invisible-glare {
      background: transparent;
      border: 1px solid transparent;
      border-radius: 12px;
      transition: background 0.777s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.777s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.777s cubic-bezier(0.16, 1, 0.3, 1) !important;
      will-change: transform, background-color, border-color;
    }
    .v3-invisible-glare:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.005) 100%) !important;
      border-color: rgba(255, 255, 255, 0.33) !important;
      transform: translateY(-2px);
      transition: background 0.33s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.33s cubic-bezier(0.16, 1, 0.3, 1),
                  transform 0.33s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .btn-smooth-hover { transition: all 0.777s cubic-bezier(0.16, 1, 0.3, 1) !important; }
    .btn-smooth-hover:hover { transition: all 0.33s cubic-bezier(0.16, 1, 0.3, 1) !important; }

    .list { position: relative; width: 100%; height: 100%; min-height: 520px; }
    .item-wrapper { will-change: transform, width, height, opacity; padding: 6px; cursor: pointer; }
    .item-wrapper > .item-img { box-shadow: 0px 10px 50px -10px rgba(0, 0, 0, 0.4); }
  ` }} />
);

// ============================================================
// MASONRY HELPERS (GSAP)
// ============================================================
const useMedia = (queries: string[], values: number[], defaultValue: number) => {
  const get = () => {
    if (typeof window === 'undefined') return defaultValue;
    return values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  };
  const [value, setValue] = useState(get);
  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  });
  return value;
};

const useMeasure = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

const preloadImages = async (urls: string[]) => {
  await Promise.all(
    urls.map(src => new Promise<void>(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => resolve();
    }))
  );
};

interface MasonryProps {
  items: Array<{ id: string; img: string; url: string; height: number; title?: string }>;
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
}

// ============================================================
// MASONRY COMPONENT
// ============================================================
const Masonry = ({
  items,
  ease = 'expo.out',
  duration = 0.8,
  stagger = 0.04,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.96,
  blurToFocus = true,
  colorShiftOnHover = false,
}: MasonryProps) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );
  const [containerRef, { width }] = useMeasure();
  const [imagesReady, setImagesReady] = useState(false);
  const [gsapReady, setGsapReady] = useState(false);

  useEffect(() => {
    const checkGsap = () => {
      if ((window as any).gsap) { setGsapReady(true); }
      else { setTimeout(checkGsap, 100); }
    };
    checkGsap();
  }, []);

  const getInitialPosition = (item: any) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };
    let direction: string = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'] as const;
      direction = dirs[Math.floor(Math.random() * dirs.length)];
    }
    switch (direction) {
      case 'top': return { x: item.x, y: -200 };
      case 'bottom': return { x: item.x, y: window.innerHeight + 200 };
      case 'left': return { x: -200, y: item.y };
      case 'right': return { x: window.innerWidth + 200, y: item.y };
      case 'center': return { x: containerRect.width / 2 - item.w / 2, y: containerRect.height / 2 - item.h / 2 };
      default: return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    preloadImages(items.map(i => i.img)).then(() => setImagesReady(true));
  }, [items]);

  const grid = useMemo(() => {
    if (!width) return [];
    const colHeights = new Array(columns).fill(0);
    const columnWidth = width / columns;
    return items.map(child => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const x = columnWidth * col;
      const height = child.height / 1.5;
      const y = colHeights[col];
      colHeights[col] += height;
      return { ...child, x, y, w: columnWidth, h: height };
    });
  }, [columns, items, width]);

  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!imagesReady || !gsapReady) return;
    const gsapInstance = (window as any).gsap;
    if (!gsapInstance) return;
    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`;
      const animationProps = { x: item.x, y: item.y, width: item.w, height: item.h };
      if (!hasMounted.current) {
        const initialPos = getInitialPosition(item);
        gsapInstance.fromTo(selector,
          { opacity: 0, x: initialPos.x, y: initialPos.y, width: item.w, height: item.h, ...(blurToFocus && { filter: 'blur(10px)' }) },
          { opacity: 1, ...animationProps, ...(blurToFocus && { filter: 'blur(0px)' }), duration, ease, delay: index * stagger }
        );
      } else {
        gsapInstance.to(selector, { ...animationProps, duration, ease, overwrite: 'auto' });
      }
    });
    hasMounted.current = true;
  }, [grid, imagesReady, gsapReady]);

  const handleMouseEnter = (e: React.MouseEvent, item: any) => {
    const gsapInstance = (window as any).gsap;
    if (!gsapInstance) return;
    if (scaleOnHover) gsapInstance.to(`[data-key="${item.id}"]`, { scale: hoverScale, duration: 0.33, ease: 'power4.out' });
    if (colorShiftOnHover) {
      const overlay = (e.currentTarget as HTMLElement).querySelector('.color-overlay');
      if (overlay) gsapInstance.to(overlay, { opacity: 0.3, duration: 0.33, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent, item: any) => {
    const gsapInstance = (window as any).gsap;
    if (!gsapInstance) return;
    if (scaleOnHover) gsapInstance.to(`[data-key="${item.id}"]`, { scale: 1, duration: 0.777, ease: 'power3.out' });
    if (colorShiftOnHover) {
      const overlay = (e.currentTarget as HTMLElement).querySelector('.color-overlay');
      if (overlay) gsapInstance.to(overlay, { opacity: 0, duration: 0.777, ease: 'power3.out' });
    }
  };

  return (
    <div ref={containerRef} className="list">
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="item-wrapper"
          onMouseEnter={e => handleMouseEnter(e, item)}
          onMouseLeave={e => handleMouseLeave(e, item)}
          style={{ position: 'absolute', transform: `translate(${item.x}px, ${item.y}px)`, width: item.w, height: item.h }}
        >
          <div className="item-img" style={{ backgroundImage: `url(${item.img})`, position: 'relative', backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            {colorShiftOnHover && (
              <div className="color-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, rgba(0,209,193,0.3), rgba(0,121,112,0.3))', opacity: 0, pointerEvents: 'none', borderRadius: '12px' }} />
            )}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px', background: 'rgba(5,6,10,0.85)', backdropFilter: 'blur(8px)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#00D1C1', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '2px' }}>METRIC ACTIVE</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title || 'Clinical Resource Archive'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// SHELL CONTENT FRAME (sidebar + 77.7% glass card + header)
// ============================================================
const ShellContentFrame = ({ children, isMobile, activeSection, setActiveSection, isNavOpen, setIsNavOpen, isPlannerView, setIsPlannerView }: any) => {
  const navSections = [
    {
      title: 'PRIMARY OPERATIONS',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'profiles', icon: Users, label: 'Profiles', submenu: [
          { id: 'clinicians', label: 'Clinician Profiles' },
          { id: 'patients', label: 'Patient Profiles' },
          { id: 'referring-physicians', label: 'Referring Physicians' },
        ]},
        { id: 'scheduling', icon: Calendar, label: 'Scheduling & Visits', submenu: [
          { id: 'calendar', label: 'Master Calendar' },
          { id: 'visit-schedule', label: 'Visit Schedule' },
          { id: 'missed-visits', label: 'Missed Visits' },
        ]},
        { id: 'brad', icon: Bot, label: 'Brad AI Copilot' },
        { id: 'ces', icon: ShieldCheck, label: 'Compliance Execution (CES)' },
      ],
    },
    {
      title: 'COMPLIANCE EXECUTION',
      items: [
        { id: 'taxonomy', icon: Network, label: 'Taxonomy', submenu: [
          { id: 'taxonomy-map', label: 'Taxonomy Map' },
          { id: 'domain-library', label: 'Domain Library' },
        ]},
        { id: 'onboarding', icon: UserPlus, label: 'Onboarding', submenu: [
          { id: 'clinician-onboarding', label: 'Clinician Onboarding' },
          { id: 'patient-admission', label: 'Patient Admissions' },
        ]},
        { id: 'policy', icon: FileText, label: 'Policy Lifecycle', submenu: [
          { id: 'policy-library', label: 'Policy Library' },
          { id: 'policy-revisions', label: 'Revisions in Progress' },
          { id: 'policy-approvals', label: 'Pending Approvals' },
        ]},
        { id: 'evidence', icon: FolderOpen, label: 'Evidence Locker', submenu: [
          { id: 'evidence-queue', label: 'Evidence Queue' },
          { id: 'evidence-archive', label: 'Archive' },
          { id: 'audit-trail', label: 'Audit Trail' },
        ]},
      ],
    },
    {
      title: 'ADMINISTRATION & KNOWLEDGE',
      items: [
        { id: 'hubstaff', icon: ArrowUpCircle, label: 'Hubstaff' },
        { id: 'documentation', icon: Folder, label: 'System Documentation', submenu: [
          { id: 'user-guides', label: 'User Guides' },
          { id: 'sop-library', label: 'SOP Library' },
          { id: 'training-materials', label: 'Training Materials' },
        ]},
        { id: 'help-center', icon: HelpCircle, label: 'Help Center' },
        { id: 'demo', icon: PlayCircle, label: 'Demo Environment' },
        { id: 'admin', icon: Shield, label: 'Admin', submenu: [
          { id: 'user-management', label: 'User Management' },
          { id: 'roles-permissions', label: 'Roles & Permissions' },
          { id: 'audit-logs', label: 'Audit Logs' },
          { id: 'system-settings', label: 'System Settings' },
        ]},
      ],
    },
  ];

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    profiles: true, scheduling: false, taxonomy: false, onboarding: false,
    policy: false, evidence: true, documentation: false, admin: false,
  });

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const isActive = (id: string) => activeSection === id;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%',
      boxSizing: 'border-box', color: V3.textPrimary, fontFamily: "'Inter', system-ui, sans-serif",
      padding: isMobile ? '0' : '20px', overflow: 'hidden', position: 'relative',
      backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.012) 1px, transparent 1px),
        radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)
      `,
      backgroundSize: '24px 24px, 24px 24px, 100% 100%',
      backgroundBlendMode: 'screen, screen, normal',
    }}>
      <GlobalStylesheetInjector />

      {/* Q3 Watermark */}
      <div style={{
        position: 'fixed', bottom: '-8vh', left: '-8vw', width: '55vmin', height: '55vmin',
        backgroundImage: `url('ci-angel.webp')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom left', opacity: 0.33, pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Main 77.7% Glass Card */}
      <div style={{
        display: 'flex', flexDirection: 'row',
        width: isMobile ? '100%' : '77.7%',
        minWidth: isMobile ? '100%' : 'min(980px, 95vw)',
        maxWidth: '100%',
        height: isMobile ? '100vh' : '92vh',
        margin: 'auto',
        border: 'none',
        borderRadius: isMobile ? '0' : '24px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(32, 41, 56, 0.88) 0%, rgba(16, 20, 28, 0.45) 60%, rgba(8, 10, 13, 0.98) 100%)',
        backdropFilter: 'blur(32px) saturate(140%)',
        WebkitBackdropFilter: 'blur(32px) saturate(140%)',
        boxShadow: isMobile ? 'none' : '30px 10px 80px rgba(0, 0, 0, 0.9)',
        position: 'relative', zIndex: 2,
      }}>

        {/* Sidebar */}
        {(!isMobile || isNavOpen) && (
          <nav style={{
            width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column',
            background: 'rgba(5, 6, 10, 0.6)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            overflowY: 'auto', padding: '20px 0',
            position: isMobile ? 'absolute' : 'relative',
            top: isMobile ? 0 : undefined,
            left: isMobile ? 0 : undefined,
            bottom: isMobile ? 0 : undefined,
            zIndex: isMobile ? 50 : undefined,
          }} className="no-scrollbar">
            {/* Logo */}
            <div style={{ padding: '8px 16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `linear-gradient(135deg, ${V3.teal}, ${V3.tealLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#000', flexShrink: 0 }}>CI</div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, letterSpacing: '-0.2px' }}>CareIndeed</span>
              </div>
            </div>

            {navSections.map(section => (
              <div key={section.title} style={{ marginBottom: '16px', padding: '0 8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: V3.textTertiary, letterSpacing: '1px', padding: '6px 8px 4px', textTransform: 'uppercase' }}>{section.title}</div>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const hasSubmenu = !!(item as any).submenu;
                  const isExpanded = hasSubmenu && expandedMenus[item.id];
                  const isItemActive = isActive(item.id);

                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (hasSubmenu) {
                            toggleSubmenu(item.id);
                          } else {
                            setActiveSection(item.id);
                            if (isMobile) setIsNavOpen(false);
                          }
                        }}
                        className="btn-smooth-hover"
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: isItemActive ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
                          color: isItemActive ? V3.tealLight : V3.textSecondary,
                          fontSize: '13px', fontWeight: isItemActive ? 600 : 400,
                          textAlign: 'left', marginBottom: '2px',
                        }}
                      >
                        <Icon size={15} style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {hasSubmenu && (
                          isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />
                        )}
                      </button>
                      {hasSubmenu && isExpanded && (
                        <div style={{ paddingLeft: '25px', marginBottom: '4px' }}>
                          {(item as any).submenu.map((sub: any) => (
                            <button
                              key={sub.id}
                              onClick={() => { setActiveSection(sub.id); if (isMobile) setIsNavOpen(false); }}
                              className="btn-smooth-hover"
                              style={{
                                width: '100%', display: 'block', padding: '6px 8px', borderRadius: '6px', border: 'none',
                                cursor: 'pointer', background: isActive(sub.id) ? 'rgba(0, 209, 193, 0.08)' : 'transparent',
                                color: isActive(sub.id) ? V3.tealLight : V3.textTertiary,
                                fontSize: '12px', textAlign: 'left', marginBottom: '1px',
                              }}
                            >{sub.label}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        )}

        {/* Right panel: header + content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* Header */}
          <header style={{ height: '56px', flexShrink: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className="btn-smooth-hover"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', color: V3.textSecondary, display: 'flex', alignItems: 'center' }}
              >
                <Menu size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '7px 14px', width: isMobile ? '100%' : '260px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Search size={14} color={V3.textTertiary} />
                <input placeholder="Search operations, policies..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {activeSection === 'dashboard' && (
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    onClick={() => setIsPlannerView(false)}
                    className="btn-smooth-hover"
                    style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', background: !isPlannerView ? V3.tealLight : 'transparent', color: !isPlannerView ? '#000000' : V3.textSecondary }}
                  >Agency View</button>
                  <button
                    onClick={() => setIsPlannerView(true)}
                    className="btn-smooth-hover"
                    style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '16px', border: 'none', cursor: 'pointer', background: isPlannerView ? V3.tealLight : 'transparent', color: isPlannerView ? '#000000' : V3.textSecondary }}
                  >My Planner</button>
                </div>
              )}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${V3.teal}, ${V3.tealLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#000', cursor: 'pointer' }}>JR</div>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', minHeight: 0, position: 'relative' }}>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

// ============================================================
// ACTION BUTTON + EMPTY STATE
// ============================================================
const ActionButton = ({ children, onClick, variant = 'default' }: any) => (
  <button
    type="button"
    onClick={onClick}
    className="btn-smooth-hover"
    style={{
      padding: '9px 18px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
      background: variant === 'danger' ? 'rgba(0, 209, 193, 0.1)' : V3.tealLight,
      color: variant === 'danger' ? V3.tealLight : '#000000',
      ...(variant === 'danger' ? { border: `1px solid ${V3.tealLight}` } : {}),
    }}
  >{children}</button>
);

const EmptyState = ({ title, description, action, icon }: any) => (
  <div style={{ padding: '32px', textAlign: 'center', color: V3.textTertiary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'transparent', borderRadius: '8px' }}>
    {icon}
    <div style={{ fontWeight: 500, color: V3.textPrimary, fontSize: '14px' }}>{title}</div>
    <div style={{ fontSize: '12px', opacity: 0.8 }}>{description}</div>
    <div style={{ marginTop: '8px' }}>{action}</div>
  </div>
);

// ============================================================
// MAIN DASHBOARD PAGE (source of truth port from Dashboard.html)
// ============================================================
export default function DashboardPage() {
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === 'undefined' ? 1920 : window.innerWidth);
  const isMobile = viewportWidth < 768;

  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isPlannerView, setIsPlannerView] = useState(false);

  const [plannerSearch, setPlannerSearch] = useState('');
  const [activePlannerSubtab, setActivePlannerSubtab] = useState<'all' | 'open' | 'overdue' | 'this-week' | 'evidence'>('all');
  const [isEvidenceQueueOpen, setIsEvidenceQueueOpen] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_PLANNED_TASKS);
  const [executedTaskMessage, setExecutedTaskMessage] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState(INTRO_CHATS);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const existingScript = document.getElementById('gsap-cdn-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'gsap-cdn-script';
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const filteredPlannerTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(plannerSearch.toLowerCase()) || task.code.toLowerCase().includes(plannerSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (activePlannerSubtab === 'open') return task.status === 'open' || task.status === 'overdue';
      if (activePlannerSubtab === 'overdue') return task.overdue;
      if (activePlannerSubtab === 'this-week') return task.dueDate.includes('May');
      if (activePlannerSubtab === 'evidence') return task.code.includes('WP');
      return true;
    });
  }, [plannerSearch, activePlannerSubtab, tasks]);

  const handleExecuteTask = (taskId: string, title: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const, overdue: false } : t));
    setExecutedTaskMessage(`Obligation executed & locked in Evidence Vault: "${title}"`);
    setTimeout(() => setExecutedTaskMessage(null), 4000);
  };

  const renderWorkspace = () => {
    if (activeSection === 'dashboard') {
      if (isPlannerView) return <div className="animate-butter-shift">{renderPlannerWorkspace()}</div>;
      return <div className="animate-butter-shift">{renderDashboardWorkspace()}</div>;
    }
    return <div className="animate-butter-shift">{renderReferencePage()}</div>;
  };

  // ── Agency Dashboard ──
  const renderDashboardWorkspace = () => {
    const criticalAndOverdue = REGULATORY_EVENTS.filter(e => e.id === '2');
    const atRisk = REGULATORY_EVENTS.filter(e => e.id === '3');
    const inProgress = REGULATORY_EVENTS.filter(e => e.id === '1');
    const awaitingBoardItems: RegulatoryEvent[] = [
      { id: 'a1', title: 'Missed Visit Documentation Form awaiting signature', domain: 'Clinical', owner: 'Clinical Manager', date: new Date() },
      { id: 'a2', title: 'Physician Orders pending signature', domain: 'Clinical', owner: 'Clinical Manager', date: new Date() },
    ];

    const kpis: KpiCardData[] = [
      { label: 'Active Sprint', value: 'Sprint 9', trend: '2 due within 48h' },
      { label: 'Sprint %', value: '88%', trend: '0 blockers', tone: 'positive' },
      { label: 'Audit Ready', value: '0/445', trend: '92/100 Readiness', tone: 'positive' },
      { label: 'Action In Progress', value: '317', trend: '0 ready to close' },
      { label: 'Missing Evidence', value: '0', trend: '0 pending approval' },
      { label: 'Critical Actions', value: '121', trend: '0 at risk', alert: true },
      { label: 'Audit Open', value: '1041', trend: '0 awaiting sig' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {executedTaskMessage && (
          <div className="animate-slide-down" style={{ background: 'rgba(0, 209, 193, 0.15)', border: `1px solid ${V3.tealLight}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color={V3.tealLight} />
              <span style={{ fontSize: '13px', color: V3.textPrimary, fontWeight: 500 }}>{executedTaskMessage}</span>
            </div>
            <button onClick={() => setExecutedTaskMessage(null)} style={{ background: 'transparent', border: 'none', color: V3.tealLight, cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {/* Hero Section */}
        <section style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '280px', flex: '1 1 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: V3.orangeLight, textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)' }}>
                Command Center
              </span>
              <span style={{ fontSize: '12px', fontWeight: 500, color: V3.textSecondary }}>What needs action now</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 600, lineHeight: 1.2, margin: 0, letterSpacing: '-0.5px', background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              System-Wide Readiness Status
            </h1>
            <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '8px', lineHeight: 1.5 }}>
              Executive operational narrative for compliance execution, evidence readiness, and escalation control.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '8px' }}>
            <HeroStat label="Critical" value={121} tone="danger" />
            <HeroStat label="At Risk" value={0} tone="warning" />
            <HeroStat label="Audit Ready" value={0} tone="success" />
            <HeroStat label="In Scope" value={445} tone="default" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', borderLeft: isMobile ? 'none' : `1px solid ${V3.borderDefault}`, paddingLeft: isMobile ? '0' : '20px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>Today</span>
            <span style={{ fontWeight: 500, color: V3.textSecondary, fontSize: '13px' }}>{TODAY_ANCHOR.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 10px', background: V3.glass3, borderRadius: '20px', color: V3.textSecondary, letterSpacing: '0.5px', marginTop: '4px' }}>AGENCY VIEW</span>
          </div>
        </section>

        {/* KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        {/* Agency Readiness Banner */}
        <AgencyReadinessBanner
          ready={false}
          reasons={['121 Overdue', '0 Blockers']}
          atRisk={0}
          graceWindow={0}
          certifiedWithException={0}
          onClickNotReady={() => setIsPlannerView(true)}
        />

        {/* Kanban Board */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px', marginTop: '8px' }}>
          <BoardColumn title="Critical & Overdue" count={criticalAndOverdue.length} tone="critical" items={criticalAndOverdue} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="At Risk" count={atRisk.length} tone="warning" items={atRisk} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="In Progress" count={inProgress.length} tone="progress" items={inProgress} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
          <BoardColumn title="Awaiting Action" count={awaitingBoardItems.length} tone="pending" items={awaitingBoardItems} today={TODAY_ANCHOR} onOpen={() => {}} onFallback={() => {}} />
        </div>
      </div>
    );
  };

  // ── My Planner ──
  const renderPlannerWorkspace = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <CheckSquare size={15} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: V3.orangeLight, textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)' }}>
            My Personal Workspace
          </span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 600, color: V3.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>My Planner</h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Your personal workbook — CES obligations assigned to you & private tasks.</p>
      </div>

      {executedTaskMessage && (
        <div className="animate-slide-down" style={{ background: 'rgba(0, 209, 193, 0.15)', border: `1px solid ${V3.tealLight}`, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} color={V3.tealLight} />
            <span style={{ fontSize: '13px', color: V3.textPrimary, fontWeight: 500 }}>{executedTaskMessage}</span>
          </div>
          <button onClick={() => setExecutedTaskMessage(null)} style={{ background: 'transparent', border: 'none', color: V3.tealLight, cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '14px' }}>
        <div className="v3-invisible-glare" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase', marginBottom: '4px' }}>MY OPEN CES</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary }}>{tasks.filter(t => t.status === 'open' || t.status === 'overdue').length}</div>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase', marginBottom: '4px' }}>OVERDUE</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: V3.tealLight }}>{tasks.filter(t => t.overdue).length}</div>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase', marginBottom: '4px' }}>COMPLETED OBLIGATIONS</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: V3.tealLight }}>{tasks.filter(t => t.status === 'completed').length}</div>
        </div>
        <div className="v3-invisible-glare" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: V3.textTertiary, textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL TASKS</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: V3.textPrimary }}>{tasks.length}</div>
        </div>
      </div>

      {/* Filters + search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(['all', 'open', 'overdue', 'this-week', 'evidence'] as const).map(tab => (
            <button key={tab} onClick={() => setActivePlannerSubtab(tab)} className="btn-smooth-hover" style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', background: activePlannerSubtab === tab ? 'rgba(0, 209, 193, 0.1)' : 'transparent', border: `1px solid ${activePlannerSubtab === tab ? V3.tealLight : 'transparent'}`, color: activePlannerSubtab === tab ? V3.textPrimary : V3.textSecondary, textTransform: 'capitalize' }}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '240px' }}>
          <SearchIcon size={13} color={V3.textTertiary} />
          <input value={plannerSearch} onChange={(e) => setPlannerSearch(e.target.value)} placeholder="Search planner..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }} />
        </div>
      </div>

      {/* Task cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
        {filteredPlannerTasks.map(task => (
          <div key={task.id} className="v3-invisible-glare" style={{ padding: '18px', border: task.overdue ? `1px solid rgba(0, 209, 193, 0.33)` : `1px solid rgba(255, 255, 255, 0.1)`, background: task.overdue ? 'rgba(0, 209, 193, 0.02)' : 'transparent', opacity: task.status === 'completed' ? 0.6 : 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight }}>{task.domain}</span>
              <span style={{ fontSize: '11px', color: V3.textTertiary, fontFamily: 'monospace' }}>{task.code}</span>
            </div>
            <h4 style={{ fontSize: '13px', fontWeight: 500, color: V3.textPrimary, margin: 0, lineHeight: 1.4, minHeight: '36px', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
              {task.title}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '10px' }}>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>Due {task.dueDate}</span>
              {task.status === 'completed' ? (
                <span style={{ fontSize: '12px', color: V3.tealLight, fontWeight: 600 }}>Executed ✓</span>
              ) : (
                <button onClick={() => handleExecuteTask(task.id, task.title)} className="btn-smooth-hover" style={{ padding: '5px 10px', borderRadius: '6px', background: 'rgba(0, 209, 193, 0.1)', border: `1px solid ${V3.tealLight}`, color: V3.tealLight, fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>Execute</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom split */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', marginTop: '8px' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: V3.tealLight, margin: '0 0 12px', textTransform: 'uppercase' }}>My Critical & Overdue</h3>
          {tasks.filter(t => t.overdue).map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
              <span style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</span>
              <span style={{ fontSize: '10px', color: V3.tealLight, fontWeight: 700 }}>OVERDUE</span>
            </div>
          ))}
          {tasks.filter(t => t.overdue).length === 0 && (
            <div style={{ fontSize: '13px', color: V3.textTertiary, padding: '10px 0' }}>No overdue items remaining.</div>
          )}
        </div>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: V3.tealLight, margin: '0 0 12px', textTransform: 'uppercase' }}>This Sprint & Upcoming</h3>
          {tasks.filter(t => !t.overdue && t.status !== 'completed').slice(0, 3).map(task => (
            <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
              <span style={{ fontSize: '13px', color: V3.textPrimary }}>{task.title}</span>
              <span style={{ fontSize: '11px', color: V3.textSecondary }}>Due {task.dueDate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Queue bar */}
      <div style={{ padding: '14px 20px', background: 'rgba(0, 209, 193, 0.08)', border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FolderOpen size={18} color={V3.tealLight} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary }}>Evidence Queue</div>
            <div style={{ fontSize: '11px', color: V3.textSecondary }}>9001 items await your upload or approval.</div>
          </div>
        </div>
        <ActionButton onClick={() => setIsEvidenceQueueOpen(true)}>Open Evidence Queue</ActionButton>
      </div>

      {/* Evidence drawer */}
      {isEvidenceQueueOpen && (
        <div className="animate-butter-shift" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: '#0F1116', borderTop: `1px solid ${V3.borderHighlight}`, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>Active Evidence Locker Items</h3>
              <button onClick={() => setIsEvidenceQueueOpen(false)} style={{ background: 'transparent', border: 'none', color: V3.textSecondary, cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
                <span style={{ color: V3.textSecondary, fontSize: '13px' }}>eSIGNED Forms queue</span>
                <span style={{ color: V3.tealLight, fontWeight: 600, fontSize: '13px' }}>35% Loaded</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${V3.borderDefault}` }}>
                <span style={{ color: V3.textSecondary, fontSize: '13px' }}>Meeting minutes archives</span>
                <span style={{ color: V3.tealLight, fontWeight: 600, fontSize: '13px' }}>60% Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Reference Pages ──
  const renderReferencePage = () => {
    switch (activeSection) {
      case 'evidence-archive':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.tealLight, letterSpacing: '0.6px', display: 'block', marginBottom: '4px' }}>INTEGRATED COMPONENT</span>
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Evidence Archive</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Interactive Masonry grid powered by GSAP animation.</p>
            </div>
            <div className="no-scrollbar" style={{ flex: 1, minHeight: '520px', overflowY: 'auto' }}>
              <Masonry items={MASONRY_DOCS} ease="expo.out" duration={0.8} stagger={0.05} animateFrom="bottom" scaleOnHover blurToFocus colorShiftOnHover />
            </div>
          </div>
        );
      case 'clinicians':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Clinician Profiles</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Active medical and administrative practitioners compliance registers.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
              {CLINICIAN_RECORDS.map((c, i) => (
                <div key={i} className="v3-invisible-glare animate-butter-shift" style={{ padding: '18px', border: `1px solid rgba(255,255,255,0.1)` }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{c.name}</h3>
                  <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '3px' }}>{c.role}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: `1px solid ${V3.borderDefault}` }}>
                    <span style={{ fontSize: '12px', color: V3.textTertiary }}>{c.cases} Active Cases</span>
                    <span style={{ fontSize: '11px', color: V3.tealLight, fontWeight: 600 }}>{c.status}</span>
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
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Patient Profiles</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Clinical registers for assigned home health treatment programs.</p>
            </div>
            <div style={{ padding: '32px', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: '12px', textAlign: 'center', color: V3.textSecondary }}>
              No current patient access logs loaded. All HIPAA pipelines fully encrypted.
            </div>
          </div>
        );
      case 'brad':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Brad AI Copilot</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Query CMS guidelines and system-wide operational frameworks.</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '280px', maxHeight: '360px' }}>
                {chatLog.map((chat, idx) => (
                  <div key={idx} className="animate-butter-shift" style={{ alignSelf: chat.sender === 'You' ? 'flex-end' : 'flex-start', background: chat.sender === 'You' ? 'rgba(0, 209, 193, 0.1)' : 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', maxWidth: '80%' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: V3.tealLight, display: 'block', marginBottom: '4px' }}>{chat.sender}</span>
                    <p style={{ fontSize: '13px', color: V3.textPrimary, margin: 0, lineHeight: 1.5 }}>{chat.msg}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    const msg = chatInput; setChatInput('');
                    setChatLog(prev => [...prev, { sender: 'You', msg }]);
                    setTimeout(() => setChatLog(prev => [...prev, { sender: 'Brad', msg: `Aligning vectors for "${msg}" under CMS standard protocol taxonomy... All guidelines in line.` }]), 800);
                  }
                }} placeholder="Ask Brad a compliance question... (Press Enter)" style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: '10px', color: V3.textPrimary, outline: 'none', fontSize: '13px' }} />
                <button onClick={() => {
                  if (!chatInput.trim()) return;
                  const msg = chatInput; setChatInput('');
                  setChatLog(prev => [...prev, { sender: 'You', msg }]);
                  setTimeout(() => setChatLog(prev => [...prev, { sender: 'Brad', msg: `Analyzing: "${msg}" — 100% vector match.` }]), 800);
                }} style={{ padding: '0 20px', background: V3.tealLight, border: 'none', color: '#000000', fontWeight: 600, borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>Send</button>
              </div>
            </div>
          </div>
        );
      case 'taxonomy-map':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Compliance Taxonomy Map</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Structured classifications for home care regulatory frameworks.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { title: 'Clinical Integrity (CI)', desc: 'Formulations, medication records, and clinical logs.' },
                { title: 'Safety Audits (SA)', desc: 'Emergency response metrics and safety audits.' },
                { title: 'Governance Standards (GV)', desc: 'Strategic management protocols and boards.' },
              ].map((item, i) => (
                <div key={i} className="v3-invisible-glare" style={{ padding: '18px', border: `1px solid rgba(255,255,255,0.1)` }}>
                  <h3 style={{ fontSize: '14px', color: V3.textPrimary, margin: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '6px' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>{activeSection.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</h1>
              <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>Real-time compliance ledger data and structured metadata views.</p>
            </div>
            <div style={{ padding: '40px', border: `1px solid rgba(255, 255, 255, 0.1)`, borderRadius: '12px', textAlign: 'center', color: V3.textSecondary }}>
              View synchronized with V3 Veil Glass. Select "Archive" under Evidence Locker to test the live Masonry grid.
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
// SUBCOMPONENTS (V3 compliant)
// ============================================================
function HeroStat({ label, value, tone }: any) {
  const colorMap: Record<string, string> = { default: V3.textPrimary, success: V3.tealLight, warning: V3.tealLight, danger: V3.tealLight };
  const color = colorMap[tone ?? 'default'] ?? V3.textPrimary;
  return (
    <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
    </div>
  );
}

function KpiCard({ label, value, trend, tone = 'default', alert, onClick }: KpiCardData) {
  const theme = v3(false);
  const valueColor = ({ default: theme.toneDefault, positive: theme.tonePositive, warning: theme.tonePositive, danger: theme.tonePositive } as Record<string, string>)[tone];
  const trendColor = ({ default: theme.trendDefault, positive: theme.trendPositive, warning: theme.trendPositive, danger: theme.trendPositive } as Record<string, string>)[tone];
  const Wrapper: any = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="v3-invisible-glare"
      style={{ background: 'transparent', borderRadius: '12px', padding: '12px 14px', cursor: onClick ? 'pointer' : 'default', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px', ...(onClick ? { outline: 'none' } : {}) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: theme.textMuted }}>{label}</span>
        {alert && <AlertTriangle size={12} color={V3.tealLight} />}
      </div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: valueColor, lineHeight: 1, letterSpacing: '-0.5px' }}>{value}</div>
      {trend && <div style={{ fontSize: '11px', fontWeight: 500, color: trendColor }}>{trend}</div>}
    </Wrapper>
  );
}

function AgencyReadinessBanner({ ready, reasons, atRisk, graceWindow, certifiedWithException, onClickNotReady }: any) {
  const theme = v3(false);
  const Icon = ready ? ShieldCheck : ShieldX;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <span style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 209, 193, 0.15)', flexShrink: 0 }}>
        <Icon size={18} color={V3.tealLight} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: V3.tealLight }}>
          {ready ? 'Agency Readiness — Ready' : 'Agency Readiness — Action Required'}
        </div>
        <p style={{ fontSize: '13px', color: theme.textBody, marginTop: '4px', lineHeight: 1.4 }}>
          {ready ? 'All workflows compliant or certification-ready.' : `${(reasons as string[]).join(' · ')}. Immediate action needed.`}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {atRisk > 0 && <V3Chip label="At Risk" value={atRisk} />}
        {graceWindow > 0 && <V3Chip label="Grace" value={graceWindow} />}
        {certifiedWithException > 0 && <V3Chip label="Cert w/ Exc" value={certifiedWithException} />}
        {!ready && <ActionButton variant="danger" onClick={onClickNotReady}>Go to My Planner</ActionButton>}
      </div>
    </div>
  );
}

function BoardColumn({ title, count, tone, items, today, onOpen, onFallback }: any) {
  const theme = v3(false);
  const toneConfig = ({
    critical: { icon: AlertTriangle, accent: theme.accentCritical },
    warning: { icon: Clock, accent: theme.accentWarning },
    progress: { icon: Activity, accent: theme.accentProgress },
    pending: { icon: FileText, accent: theme.accentPending },
  } as Record<BoardTone, { icon: any; accent: string }>)[tone as BoardTone];

  return (
    <section style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <toneConfig.icon size={14} color={toneConfig.accent} />
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: theme.textH1, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
        </div>
        <span style={{ minWidth: '24px', height: '22px', padding: '0 7px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, background: theme.badgeBg, color: theme.badgeText }}>{count}</span>
      </header>
      <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', minHeight: 0 }}>
        {(items as RegulatoryEvent[]).length > 0 ? (items as RegulatoryEvent[]).map(event => (
          <TaskCard key={event.id} event={event} today={today} onClick={() => onOpen(event.id)} onFallback={onFallback} tone={tone} />
        )) : (
          <EmptyState icon={<CheckCircle2 size={22} color={V3.tealLight} style={{ opacity: 0.5 }} />} title="All clear" description={`No ${title.toLowerCase()} items.`} />
        )}
      </div>
    </section>
  );
}

function TaskCard({ event, today, onClick, onFallback, tone }: any) {
  const theme = v3(false);
  const [hovered, setHovered] = useState(false);
  const dueLabel = getDueLabel(event, today);

  const dueBadgeStyle = ({
    critical: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight },
    warning: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight },
    progress: { bg: 'rgba(0, 209, 193, 0.1)', color: V3.tealLight },
    pending: { bg: theme.badgeBg, color: theme.badgeText },
  } as Record<BoardTone, { bg: string; color: string }>)[tone as BoardTone];

  return (
    <button
      type="button"
      onClick={() => { if (!event.id) { onFallback(); return; } onClick(); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', borderRadius: '10px',
        border: `1px solid ${hovered ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)'}`,
        padding: '14px', textAlign: 'left', cursor: 'pointer',
        background: hovered ? V3.glass2 : 'rgba(255, 255, 255, 0.015)',
        transition: hovered ? 'all 0.33s cubic-bezier(0.16, 1, 0.3, 1)' : 'all 0.777s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: theme.textMuted, letterSpacing: '0.5px', marginBottom: '5px' }}>{event.domain}</div>
          <h4 style={{ fontSize: '12px', fontWeight: 500, lineHeight: 1.4, color: theme.textH1, margin: 0 }}>{event.title}</h4>
        </div>
        <MoreHorizontal size={14} color={theme.textMuted} style={{ flexShrink: 0, opacity: hovered ? 1 : 0.4, transition: 'opacity 0.2s' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, background: 'rgba(0,0,0,0.25)', color: theme.textSecondary, flexShrink: 0 }}>
            {getInitials(event.owner)}
          </span>
          <span style={{ fontSize: '11px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.owner}</span>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 7px', borderRadius: '5px', background: dueBadgeStyle.bg, color: dueBadgeStyle.color, flexShrink: 0 }}>
          {dueLabel}
        </span>
      </div>
    </button>
  );
}

// ============================================================
// UTILITIES
// ============================================================
function V3Chip({ label, value }: any) {
  return (
    <span style={{ fontSize: '11px', fontWeight: 500, padding: '4px 10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: V3.textSecondary, border: '1px solid rgba(255, 255, 255, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ opacity: 0.4 }}>|</span>
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
