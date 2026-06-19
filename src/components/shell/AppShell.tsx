/**
 * Premium Full-Bleed AppShell + Sidebar + TopBar + CommandSearch
 * Healthcare Command Center aesthetic — reusable, expensive-looking React components.
 *
 * - Full-bleed: zero outer margins/frames on workspace
 * - Sidebar: collapsible 72px icon-only (localStorage 'ci-sidebar-collapsed'), tooltips + full ARIA
 * - Generated dynamically from COMPONENT_GROUPS + PAGE_REGISTRY (navigable pages only)
 * - Crisp active states: teal in dark, deep teal in light
 * - TopBar: dynamic page title/subtitle, real Date, Cmd+K trigger, bell, profile, theme CDN logos
 * - CommandSearch: Cmd/Ctrl+K, premium centered modal, fuzzy search, Arrow/Enter/Escape, dark/light
 * - Micro details: spotlight, 2px lifts, smooth cubic transitions, high-end polish
 *
 * Usage:
 *   <AppShell>
 *     <YourWorkspaceContent />
 *   </AppShell>
 *
 * Place at: src/components/shell/AppShell.tsx (or similar). Import PAGE_REGISTRY types from policy layer.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList, Calendar, FolderSearch,
  Shield, Users, Heart, HelpCircle, Settings, Search, Bell, User, X, ChevronLeft, ChevronRight,
  ArrowRight
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// EXACT CDN LOGO URLs (theme switching: light = gray, dark = white)
// ──────────────────────────────────────────────────────────────────────────────
const LOGO_CDN_LIGHT = 'https://cdn.careindeed.io/logos/ci-logo-gray.png';
const LOGO_CDN_DARK = 'https://cdn.careindeed.io/logos/ci-logo-white.png';

// Import real registry (sibling agent source of truth) + shared types
import {
  PAGE_REGISTRY,
  COMPONENT_GROUPS,
  getPagesForComponent,
  getOrderedComponentGroups,
} from '@/policy/security/identity/pageRegistry';
import type {
  PageRegistryEntry,
  ComponentGroupEntry,
} from '@/policy/security/identity/pageAccessTypes';

// ──────────────────────────────────────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────────────────────────────────────
export interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  to: string;
  collapsed: boolean;
  isActive: boolean;
  onNavigate?: (to: string) => void;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export interface TopBarProps {
  onCommandOpen: () => void;
  onNotificationsClick?: () => void;
  onProfileClick?: () => void;
  notificationCount?: number;
}

export interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface AppShellProps {
  children: React.ReactNode;
}

// ──────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────────────────────────────────────
const SIDEBAR_STORAGE_KEY = 'ci-sidebar-collapsed';
const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 260;

function isLightTheme(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  return theme === 'care-indeed-light';
}

function getCurrentPage(pathname: string): PageRegistryEntry | undefined {
  // Best match first (exact or prefix), then fallback
  let match = PAGE_REGISTRY.find((p) => {
    if (!p.routePattern) return false;
    const pattern = p.routePattern.replace(/:\w+/g, '[^/]+');
    try {
      const re = new RegExp(`^${pattern}(/|$)`);
      return re.test(pathname);
    } catch {
      return pathname.startsWith(p.routePattern.split(':')[0]);
    }
  });
  if (!match && pathname === '/') match = PAGE_REGISTRY.find(p => p.routePattern === '/dashboard');
  return match;
}

function getIconForPage(page: PageRegistryEntry): React.ComponentType<{ size?: number; className?: string }> {
  const g = page.componentGroup;
  const id = page.pageId;

  if (id.includes('dashboard')) return LayoutDashboard;
  if (g.includes('policy-library')) return BookOpen;
  if (g.includes('forms')) return FileText;
  if (g.includes('ces')) return ClipboardList;
  if (g.includes('calendar')) return Calendar;
  if (g.includes('evidence')) return FolderSearch;
  if (g.includes('audit')) return Shield;
  if (g.includes('journey')) return Users;
  if (g.includes('staffing')) return id.includes('patient') ? Heart : Users;
  if (g.includes('iadministrator')) return Settings;
  if (g.includes('user-management')) return Users;
  if (g.includes('system')) return HelpCircle;
  return BookOpen;
}

function fuzzyScore(text: string, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 0;

  if (t === q) return 1000;
  if (t.startsWith(q)) return 800;
  if (t.includes(q)) return 600 + (t.indexOf(q) === 0 ? 50 : 0);

  // Subsequence fuzzy
  let score = 200;
  let idx = 0;
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    const found = t.indexOf(ch, idx);
    if (found === -1) return 0;
    score += (found - idx < 3 ? 12 : 4);
    idx = found + 1;
  }
  return Math.max(10, score);
}

// Filter + rank PAGE_REGISTRY entries for command palette
function getFuzzyResults(query: string): PageRegistryEntry[] {
  if (!query.trim()) {
    // Default curated premium list (most-used primary surfaces)
    const priority = [
      'page.dashboard', 'page.library', 'page.forms', 'page.ces-board',
      'page.my-tasks', 'page.evidence', 'page.calendar', 'page.clinicians',
      'page.policy-lifecycle', 'page.framework', 'page.journey-home'
    ];
    const byPrio = PAGE_REGISTRY.filter(p => priority.includes(p.pageId));
    const rest = PAGE_REGISTRY.filter(p => !priority.includes(p.pageId) && !p.routePattern.includes(':'));
    return [...byPrio, ...rest.slice(0, 18)];
  }

  const scored = PAGE_REGISTRY
    .map((entry) => {
      const labelScore = fuzzyScore(entry.label, query);
      const idScore = fuzzyScore(entry.pageId, query);
      const routeScore = fuzzyScore(entry.routePattern, query);
      const groupLabel = COMPONENT_GROUPS.find(c => c.componentId === entry.componentGroup)?.label || '';
      const groupScore = fuzzyScore(groupLabel, query) * 0.6;
      return { entry, score: Math.max(labelScore, idScore, routeScore, groupScore) };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 22)
    .map(({ entry }) => entry);

  return scored;
}

// ──────────────────────────────────────────────────────────────────────────────
// SIDEBAR ITEM (reusable, premium micro details)
// ──────────────────────────────────────────────────────────────────────────────
export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  to,
  collapsed,
  isActive,
  onNavigate,
}) => {
  const isLight = isLightTheme();

  const handleClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(to);
    }
  };

  const base = `
    group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
    transition-all duration-200 ease-out will-change-transform
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500
  `;

  const activeClasses = isActive
    ? (isLight
        ? 'bg-teal-600/10 text-teal-700 shadow-sm'
        : 'bg-teal-500/15 text-teal-300')
    : (isLight
        ? 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
        : 'text-slate-300 hover:bg-white/5 hover:text-white');

  const lift = !isActive ? 'hover:-translate-y-px hover:shadow-md' : '';

  const content = (
    <>
      <Icon size={collapsed ? 20 : 18} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}

      {/* 2px premium lift indicator on hover */}
      {!collapsed && !isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current opacity-0 transition-opacity group-hover:opacity-40" />
      )}
    </>
  );

  const common = `w-full ${base} ${activeClasses} ${lift}`;

  const el = collapsed ? (
    <button
      type="button"
      onClick={handleClick}
      className={common + ' justify-center px-2'}
      aria-label={label}
      title={label}
    >
      <Icon size={20} className="shrink-0" />
    </button>
  ) : (
    <Link
      to={to}
      onClick={handleClick}
      className={common}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );

  // Premium tooltip on collapsed (ARIA + visual)
  if (collapsed) {
    return (
      <div className="relative">
        {el}
        <div
          role="tooltip"
          className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[60] hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900/95 px-3 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block"
        >
          {label}
          <div className="absolute left-[-5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-l border-t border-white/10 bg-zinc-900/95" />
        </div>
      </div>
    );
  }

  return el;
};

// ──────────────────────────────────────────────────────────────────────────────
// SIDEBAR (dynamic from COMPONENT_GROUPS + PAGE_REGISTRY)
// ──────────────────────────────────────────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLight = isLightTheme();

  const currentPath = location.pathname;

  const orderedGroups = useMemo(() => getOrderedComponentGroups(), []);

  // Generate items dynamically — only navigable (no dynamic params)
  const groupedItems = useMemo(() => {
    return orderedGroups.map((group: ComponentGroupEntry) => {
      const pages = getPagesForComponent(group.componentId)
        .filter((p) => !p.routePattern.includes(':')) // clean top-level routes
        .slice(0, 6); // keep premium concise

      const items = pages.map((page) => {
        const Icon = getIconForPage(page);
        const to = page.routePattern.replace(/:\w+/, ''); // safe first segment
        const isActive = currentPath === to || currentPath.startsWith(to + '/');
        return { page, Icon, to, isActive };
      });

      return { group, items };
    }).filter(g => g.items.length > 0);
  }, [currentPath, orderedGroups]);

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <aside
      className={`
        relative z-40 flex h-full flex-shrink-0 flex-col
        transition-[width] duration-300 ease-[cubic-bezier(0.23,1.0,0.32,1)]
        ${isLight ? 'bg-white' : 'bg-[#0B0E14]'}
      `}
      style={{ border: 'none', width: sidebarWidth }}
      aria-label="Primary navigation"
      aria-expanded={!collapsed}
      data-collapsed={collapsed}
    >
      {/* Premium top brand area */}
      <div className={`flex items-center justify-between px-4 py-4 ${isLight ? '' : ''}`} style={{ border: 'none' }}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-[13px] font-semibold text-white tracking-[-0.5px]">CI</span>
            </div>
            <div>
              <div className={`font-semibold tracking-tight text-[15px] ${isLight ? 'text-slate-900' : 'text-white'}`}>Care Indeed</div>
              <div className="text-[10px] text-teal-500/80 -mt-0.5 font-mono tracking-[1.5px]">COMMAND CENTER</div>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-7 w-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">CI</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className={`ml-auto flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10 ${isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Dynamic grouped navigation */}
      <div className="flex-1 overflow-y-auto py-3 custom-scroll">
        <div className="px-2.5 space-y-6">
          {groupedItems.map(({ group, items }) => (
            <div key={group.componentId}>
              {!collapsed && (
                <div className={`px-3 mb-1.5 text-[10px] font-semibold tracking-[1.25px] uppercase ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  {group.label.replace(/ \/ .*/, '')}
                </div>
              )}

              <div className="space-y-0.5">
                {items.map(({ page, Icon, to, isActive }) => (
                  <SidebarItem
                    key={page.pageId}
                    icon={Icon}
                    label={page.label}
                    to={to}
                    collapsed={collapsed}
                    isActive={isActive}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom subtle footer area */}
      {!collapsed && (
        <div className={`mx-3 mb-3 mt-auto rounded-xl px-3 py-2 text-[10px] ${isLight ? 'text-slate-400 bg-slate-100/70' : 'text-white/40 bg-white/5'}`}>
          v3.2 • Healthcare Command
        </div>
      )}
    </aside>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// TOPBAR (app-aware, premium, date + actions + CDN logo)
// ──────────────────────────────────────────────────────────────────────────────
export const TopBar: React.FC<TopBarProps> = ({
  onCommandOpen,
  onNotificationsClick,
  onProfileClick,
  notificationCount = 4,
}) => {
  const location = useLocation();
  const isLight = isLightTheme();

  const currentPage = getCurrentPage(location.pathname);

  // Real JS Date — premium formatting
  const [dateStr] = useState(() => {
    const d = new Date();
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  });

  const title = currentPage?.label || 'Dashboard';
  const subtitle = currentPage?.description || (currentPage ? 'Command surface' : 'Healthcare operations center');

  const logoSrc = isLight ? LOGO_CDN_LIGHT : LOGO_CDN_DARK;

  return (
    <header
      className={`
        h-16 flex-shrink-0 flex items-center justify-between px-5 md:px-6 z-30
        ${isLight
          ? 'bg-white/95 backdrop-blur-xl'
          : 'bg-[#0B0E14]/95 backdrop-blur-xl'}
      `}
      style={{ border: 'none' }}
      role="banner"
    >
      {/* Left: Logo (theme-aware CDN) + Dynamic Title */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Logo — switches exactly by theme via the two CDN URLs */}
        <div className="flex-shrink-0 pr-2 border-r border-white/10 hidden md:block">
          <img
            src={logoSrc}
            alt="Care Indeed"
            className="h-[26px] w-auto object-contain"
            onError={(e) => { /* graceful: hide or swap if CDN unavailable in demo */ (e.currentTarget.style.opacity = '0.6'); }}
          />
        </div>

        <div className="min-w-0">
          <div className={`font-semibold tracking-[-0.2px] text-[15px] leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {title}
          </div>
          <div className={`text-[11px] mt-px truncate ${isLight ? 'text-slate-500' : 'text-white/55'}`}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* Center: Date + Command trigger (premium) */}
      <div className="hidden md:flex items-center gap-3 text-sm">
        <div className={`font-mono text-[12px] px-3 py-1 rounded-full tracking-[0.5px] ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-white/70'}`}>
          {dateStr}
        </div>

        {/* Command Search Trigger — beautiful trigger */}
        <button
          onClick={onCommandOpen}
          className={`
            group flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-[0.985]
            ${isLight
              ? 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900'
              : 'border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'}
          `}
          aria-label="Open command search (⌘K)"
        >
          <Search size={15} className="opacity-70 group-hover:opacity-100 transition" />
          <span>Search</span>
          <span className="ml-1 hidden lg:inline rounded bg-white/10 px-1.5 py-px text-[10px] font-mono tracking-widest">⌘K</span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Command on mobile too */}
        <button
          onClick={onCommandOpen}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 active:bg-white/10 transition"
          aria-label="Command palette"
        >
          <Search size={17} />
        </button>

        {/* Notifications bell — premium micro */}
        <button
          onClick={onNotificationsClick}
          className={`
            relative flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-[0.96]
            ${isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-white/10 text-white/80 hover:text-white'}
          `}
          aria-label={`Notifications${notificationCount ? ` (${notificationCount})` : ''}`}
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[15px] items-center justify-center rounded-full bg-teal-500 px-1 text-[9px] font-semibold text-white ring-2 ring-offset-2 ring-offset-[#0B0E14] ring-[#0B0E14]">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className={`
            flex h-9 items-center gap-2.5 rounded-2xl pl-1.5 pr-4 text-sm font-medium transition active:scale-[0.985]
            ${isLight ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' : 'bg-white/5 text-white/90 hover:bg-white/10'}
          `}
          aria-label="Account profile"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center ring-1 ring-offset-1 ring-offset-[#0B0E14] ring-teal-500/30">
            <User size={15} className="text-white" />
          </div>
          <span className="hidden sm:block text-xs font-semibold tracking-tight">Operator</span>
        </button>
      </div>
    </header>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// COMMAND SEARCH — premium centered modal + full fuzzy + keyboard
// ──────────────────────────────────────────────────────────────────────────────
export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isLight = isLightTheme();

  const results = useMemo(() => getFuzzyResults(query), [query]);

  // Reset selection when results or query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  // Global hotkey listener (always active when mounted)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent controls open; we rely on external toggle for full integration
          // (AppShell passes controlled state)
          window.dispatchEvent(new CustomEvent('ci:open-command'));
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isOpen, onClose]);

  // Modal-specific keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        const route = selected.routePattern.replace(/:\w+/, '');
        navigate(route);
        onClose();
      }
      return;
    }
  };

  const handleItemClick = (page: PageRegistryEntry) => {
    const route = page.routePattern.replace(/:\w+/, '');
    navigate(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
    >
      {/* Backdrop with subtle premium spotlight gradient */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Card — expensive dark/light variants + spotlight */}
      <div
        className={`
          relative w-full max-w-[620px] overflow-hidden rounded-3xl border shadow-2xl
          ${isLight
            ? 'bg-white border-slate-200 shadow-xl'
            : 'bg-zinc-950/95 border-white/10'}
        `}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Spotlight / header gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(13,148,136,0.09),transparent)] pointer-events-none" />

        {/* Search input */}
        <div className={`flex items-center gap-3 border-b px-5 py-4 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <Search size={20} className={isLight ? 'text-slate-400' : 'text-white/50'} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tasks, policies, evidence..."
            className={`flex-1 bg-transparent text-[15px] placeholder:text-white/40 focus:outline-none tracking-[-0.1px] ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white'}`}
            aria-label="Search command"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 hover:text-white/80 transition"
            aria-label="Close command search"
          >
            <X size={18} />
          </button>
          <div className={`hidden sm:block text-[10px] px-2 py-px rounded border font-mono tracking-widest ${isLight ? 'border-slate-300 text-slate-500' : 'border-white/20 text-white/50'}`}>
            ESC
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[420px] overflow-y-auto py-2 custom-scroll">
          {results.length === 0 ? (
            <div className={`px-6 py-12 text-center text-sm ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              No matching pages
            </div>
          ) : (
            results.map((page, idx) => {
              const Icon = getIconForPage(page);
              const isSelected = idx === selectedIndex;
              const group = COMPONENT_GROUPS.find(c => c.componentId === page.componentGroup);

              return (
                <button
                  key={page.pageId}
                  onClick={() => handleItemClick(page)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    group flex w-full items-center gap-3.5 px-5 py-[11px] text-left transition-all duration-75
                    ${isSelected
                      ? (isLight ? 'bg-teal-800 text-white' : 'bg-teal-500/12 text-teal-300')
                      : (isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-white/5 text-white/90')}
                    ${isSelected ? 'shadow-sm' : 'hover:-translate-y-px'}
                  `}
                >
                  <div className={`rounded-xl p-1.5 ${isSelected ? 'bg-white/20' : isLight ? 'bg-slate-200 text-slate-600' : 'bg-white/10 text-white/70'}`}>
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-medium tracking-[-0.1px] text-[14.5px]">{page.label}</div>
                    {group && (
                      <div className={`text-[10px] mt-px tracking-[0.4px] uppercase font-medium ${isSelected ? 'text-white/70' : isLight ? 'text-slate-500' : 'text-white/45'}`}>
                        {group.label}
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1 text-[10px] font-mono tracking-[1px] opacity-60 ${isSelected ? 'opacity-90' : ''}`}>
                    {page.routePattern.replace(/:\w+/, '')}
                    <ArrowRight size={13} className="ml-px" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint bar */}
        <div className={`flex items-center justify-between border-t px-5 py-2.5 text-[10px] font-mono tracking-[1.2px] ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-white/10 bg-white/5 text-white/50'}`}>
          <div>↑↓ Navigate • ↵ Open • ⌘K / ESC Close</div>
          <div>{results.length} results</div>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// APP SHELL — Full-bleed premium composition
// ──────────────────────────────────────────────────────────────────────────────
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return stored === 'true';
  });

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Persist collapse
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    }
  }, [collapsed]);

  const toggleSidebar = useCallback(() => setCollapsed((c) => !c), []);

  // Controlled command open + global event bridge for hotkey from CommandSearch
  const openCommand = useCallback(() => setIsCommandOpen(true), []);
  const closeCommand = useCallback(() => setIsCommandOpen(false), []);

  // Bridge global hotkey request
  useEffect(() => {
    const handler = () => setIsCommandOpen(true);
    window.addEventListener('ci:open-command' as any, handler);
    return () => window.removeEventListener('ci:open-command' as any, handler);
  }, []);

  // Keyboard support: Cmd/Ctrl + \ to toggle sidebar (bonus premium)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [toggleSidebar]);

  const isLight = isLightTheme();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#05060A] text-[var(--v3-text-primary)]" data-shell-app>
      {/* Sidebar — left rail */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Main workspace — FULL BLEED, no margins */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <TopBar
          onCommandOpen={openCommand}
          onNotificationsClick={() => { /* implement or connect to notification store */ }}
          onProfileClick={() => { /* connect to account menu */ }}
          notificationCount={3}
        />

        {/* Workspace — zero outer chrome on content area */}
        <main
          className={`
            flex-1 overflow-auto relative
            ${isLight ? 'bg-[#F8F9FB]' : 'bg-[#05060A]'}
          `}
          data-main-workspace
        >
          {children}
        </main>
      </div>

      {/* Command Search (mounted once, always registers hotkeys) */}
      <CommandSearch isOpen={isCommandOpen} onClose={closeCommand} />
    </div>
  );
};

export default AppShell;
