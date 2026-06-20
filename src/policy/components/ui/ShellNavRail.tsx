import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
// ShellCommandGroup retained for possible future reuse; current impl uses direct
// group rendering to support collapse + filter + exact 4-group V6 prototype contract.

export interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  featureId?: string;
  subItems?: Array<{ to: string; label: string }>;
}

interface ShellNavRailProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
}

/**
 * ShellNavRail
 *
 * Desktop/laptop vertical navigation rail.
 * Groups navigation into logical command clusters using ShellCommandGroup.
 *
 * Surface colors flow through `--ci-color-shell-navrail-bg` /
 * `--ci-color-border-subtle` declared per (data-theme, data-ci-mode) in
 * src/index.css — no JS-side theme branching.
 *
 * Must only be rendered on >=1024px (controlled by parent).
 */
export const ShellNavRail: React.FC<ShellNavRailProps> = ({ items, onItemClick }) => {
  const location = useLocation();

  // Local UI state for Phase 1 shell/sidebar (does not touch gates, NAV_ITEMS, or pageAccess)
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  const isActive = (to: string) => {
    const p = location.pathname;
    // Side nav active state for Calendar per #4 (design ref): separate activation for primary /calendar vs CES /ces/calendar.
    // Use clean exact-prefix without cross-activation between main Calendar and CES Calendar.
    // Data attrs used for active state (data-active) per spec.
    if (to === '/calendar') {
      // Primary Calendar: only its own paths (exclude ces/*)
      return (p === '/calendar' || p.startsWith('/calendar/')) && !p.startsWith('/ces');
    }
    if (to === '/ces/calendar') {
      return p === '/ces/calendar' || p.startsWith('/ces/calendar');
    }
    if (to === '/staffing-calendar') {
      return p === '/staffing-calendar' || p.startsWith('/staffing-calendar');
    }
    return p === to || p.startsWith(to + '/');
  };
  const workflowLinkClass = (active: boolean) =>
    `ml-8 mt-1 flex items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-[11px] font-semibold transition-colors ${
      active
        ? 'bg-brand-teal/10 text-brand-teal'
        : 'text-[var(--v3-text-secondary)] hover:bg-[var(--v3-glass2)] hover:text-[var(--v3-text-primary)]'
    }`;

  // Filter is purely presentational shell filter (V6 §3 + prototype). Does not mutate passed items or gates.
  const filteredItems = query.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  // Exact 4 groups per task (V6_Final §3 Sidebar/Nav/Shell + prototype VIEW_GROUPS + screenshot):
  // PRIMARY OPERATIONS, COMPLIANCE EXECUTION, ADMINISTRATION, KNOWLEDGE (uppercase tracking)
  // Id sets chosen to cover all passed items without adding/removing semantics or items.
  // Grouping robust by id (preserves after any parent gate changes).
  const GROUP_DEFS: Array<{ title: string; ids: string[] }> = [
    { title: 'PRIMARY OPERATIONS', ids: ['dashboard', 'clinician-profiles', 'patient-profiles', 'staffing-calendar', 'iadmin'] },
    { title: 'COMPLIANCE EXECUTION', ids: ['ces', 'taxonomy', 'onboarding', 'lifecycle', 'evidence'] },
    { title: 'ADMINISTRATION', ids: ['admin', 'hubstaff'] },
    { title: 'KNOWLEDGE', ids: ['system-documentation', 'help'] },
  ];

  const grouped = GROUP_DEFS
    .map((g) => ({
      title: g.title,
      items: filteredItems.filter((i) => g.ids.includes(i.id)),
    }))
    .filter((g) => g.items.length > 0);

  // Active: bg-[#004142] text-white exact per target + screenshot.
  // Non-active kept close to prior for light mode.
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-xs font-semibold transition-colors ${
      active
        ? 'bg-[#004142] text-white'
        : 'text-[#1F1C1B] hover:bg-[#F7FEFF] hover:text-[#00797D]'
    }`;

  const railWidth = collapsed ? '88px' : 'var(--ci-shell-navrail-width)';

  const toggleCollapse = () => {
    if (!collapsed) setQuery('');
    setCollapsed(!collapsed);
  };

  return (
    <nav
      data-shell-navrail
      data-bleed="full"
      data-border="none"
      data-active-state="data-attr"
      className="custom-scrollbar h-full flex-shrink-0 flex-col overflow-y-auto"
      style={{ width: railWidth, background: 'var(--ci-color-shell-navrail-bg)', border: 'none', padding: '0', boxShadow: 'none' }}
      aria-label="Primary navigation"
    >
      {/* Header: collapse affordance (icon-only rail support). Matches prototype collapse + widths contract. */}
      <div className={`flex items-center pt-4 pb-2 ${collapsed ? 'px-2 justify-center' : 'px-4 justify-end'}`}>
        <button
          type="button"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#004142]/10 bg-white/80 text-[#004142] hover:bg-white transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* padding:0 on ShellNavRail root for perimeter contract; internal spacing conditional on collapse */}
      <div className={collapsed ? 'px-2 py-2' : 'px-4 py-2'}>
        {/* "X Views" badge — only when expanded (per prototype + plan) */}
        {!collapsed && (
          <div className="mb-4 rounded-2xl border border-[#004142]/10 bg-white/80 p-3 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-2xl font-heading font-extrabold text-[#004142]">{items.length}</div>
              <div className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-slate-500">Views</div>
            </div>
            <Search size={20} className="text-[#004142]/40" />
          </div>
        )}

        {/* Filter input "Filter views..." — only when expanded */}
        {!collapsed && (
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter views..."
              className="w-full rounded-xl border border-[#004142]/10 bg-white/80 py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-[#004142] focus:bg-white transition-all"
              aria-label="Filter views"
            />
          </div>
        )}

        <nav className={collapsed ? 'space-y-4' : 'space-y-6'} aria-label="Nav groups">
          {grouped.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="mb-2 px-2 text-[10px] font-heading font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  {group.title}
                </div>
              )}
              <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-1'}>
                {group.items.map((item) => {
                  const active = isActive(item.to);
                  // Preserve subnav special case only for ces workflows (keep logic)
                  const workflowSubItem = !collapsed && item.id === 'ces'
                    ? item.subItems?.find((sub) => sub.to === '/workflows')
                    : undefined;

                  return (
                    <div key={item.id}>
                      <Link
                        to={item.to}
                        onClick={() => onItemClick?.(item)}
                        data-active={active ? 'true' : 'false'}
                        className={`${linkClass(active)} ${collapsed ? 'h-9 w-9 justify-center px-0 py-0 min-h-[36px] min-w-[36px]' : ''}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon size={collapsed ? 16 : 18} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>

                      {/* Preserve existing ces workflow sub item rendering (subnav contract) */}
                      {workflowSubItem && (
                        <Link
                          to={workflowSubItem.to}
                          onClick={() => onItemClick?.({ ...item, to: workflowSubItem.to, label: workflowSubItem.label })}
                          data-active={isActive(workflowSubItem.to) ? 'true' : 'false'}
                          className={workflowLinkClass(isActive(workflowSubItem.to))}
                          title={workflowSubItem.label}
                        >
                          <span>{workflowSubItem.label}</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </nav>
  );
};

export default ShellNavRail;
