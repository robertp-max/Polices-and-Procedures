import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
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
      return p === '/ces/calendar' || p.startsWith('/ces/calendar') || p === '/audit' || p.startsWith('/audit') || p === '/evidence' || p.startsWith('/evidence');
    }
    if (to === '/staffing-calendar') {
      return p === '/staffing-calendar' || p.startsWith('/staffing-calendar');
    }
    // ADMINISTRATION parent active for all /admin/* subs (permissions/roles/groups/users) for correct sidebar highlight on 04-admin-permissions etc.
    // Matches ref sidebar behavior for grouped admin views without mutating nav data.
    if (to === '/admin/user-groups' || to === '/admin') {
      return p.startsWith('/admin/') || p === '/admin';
    }
    return p === to || p.startsWith(to + '/');
  };
  const workflowLinkClass = (active: boolean) =>
    `ml-8 mt-1 flex items-center gap-3 rounded-lg px-3 py-2 font-roboto text-[11px] font-light transition-colors ${
      active
        ? 'bg-brand-teal/10 text-brand-teal'
        : 'text-[var(--v3-text-secondary)] hover:bg-[var(--v3-glass2)] hover:text-[var(--v3-text-primary)]'
    }`;

  // Filter is purely presentational shell filter (V6 §3 + prototype). Does not mutate passed items or gates.
  const filteredItems = query.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  // Exact 4 groups per task (V6_Final §3 Sidebar/Nav/Shell + prototype VIEW_GROUPS + screenshot):
  // PRIMARY OPERATIONS/COMPLIANCE EXECUTION/ADMINISTRATION/KNOWLEDGE (uppercase tracking)
  // Id sets chosen to cover all passed items without adding/removing semantics or items.
  // Grouping robust by id (preserves after any parent gate changes).
  const GROUP_DEFS: Array<{ title: string; ids: string[] }> = [
    { title: 'PRIMARY OPERATIONS', ids: ['dashboard', 'clinician-profiles', 'patient-profiles', 'staffing-calendar'] },
    { title: 'COMPLIANCE EXECUTION', ids: ['ces', 'taxonomy', 'onboarding', 'onboarding-v2', 'lifecycle', 'evidence'] },
    { title: 'ADMINISTRATION', ids: ['admin', 'hubstaff', 'iadmin'] },
    { title: 'KNOWLEDGE', ids: ['system-documentation', 'help'] },
  ]; /* fixed group coverage so all items (incl. onboarding-v2) appear under the 4 uppercase groups matching ref spec (PRIMARY OPERATIONS / COMPLIANCE EXECUTION / ADMINISTRATION / KNOWLEDGE) + X VIEWS count; iadmin (Brad) under ADMIN per 14-iadmin-brad.md + 10-brad.png */

  const grouped = GROUP_DEFS
    .map((g) => ({
      title: g.title,
      items: filteredItems.filter((i) => g.ids.includes(i.id)),
    }))
    .filter((g) => g.items.length > 0);

  // Active: bg-[#004142] text-white exact per target + screenshot.
  // Non-active + hovers matched to ref visual. All nav items use font-medium (Roboto Medium) per typography spec (main header/nav = Medium).
  // Hover states: no shift/scale for stable pixel match.
  const linkClass = (active: boolean) =>
    `flex items-center rounded-xl text-xs font-roboto font-medium transition-colors touch-manipulation ${active
      ? 'bg-[#004142] text-white shadow-sm'
      : 'text-slate-600 hover:bg-[#E6F4F2] hover:text-[#00797D]'
    }`;

  const railWidth = collapsed ? '88px' : '292px'; /* explicit 292px / 88px per V6 sidebar contract + task spec (css var still defined for other uses) */

  const toggleCollapse = () => {
    if (!collapsed) setQuery('');
    setCollapsed(!collapsed);
  };

  return (
    <nav
      data-shell-navrail
      data-collapsed={collapsed ? 'true' : 'false'}
      data-bleed="full"
      data-border="none"
      data-active-state="data-attr"
      className="custom-scrollbar h-full flex flex-shrink-0 flex-col overflow-y-auto transition-[width] duration-300 bg-white border-r border-[#004142]/10"
      style={{ width: railWidth, padding: '0' }}
      aria-label="Primary navigation"
    >
      {/* Header: logo (full/mark) + collapse. Matches ref 01-main-shell.md + 10-brad.png sidebar top exactly (CareIndeed logo left, toggle right). Widths 292/88px contract. */}
      <div className={`flex items-center gap-3 pb-4 pt-5 ${collapsed ? 'flex-col px-3' : 'justify-between px-6'}`}>
        {!collapsed && (
          <img
            src={ciLogoGray}
            alt="Care Indeed"
            className="h-8 w-auto object-contain"
          />
        )}
        {collapsed && (
          <img
            src={ciLogoGray}
            alt="Care Indeed"
            className="h-6 w-6 rounded object-contain"
          />
        )}
        <button
          type="button"
          onClick={toggleCollapse}
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#004142]/10 bg-white hover-lift text-[#004142] shadow-sm transition"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* "X VIEWS" badge — only when expanded (per prototype + plan); outside inner pad to match exact px-6.
          Pixel-matched to ref 16-dashboard.png sidebar: clean stacked count + "VIEWS", no decorative icon inside badge. */}
      {!collapsed && (
        <div className="border-b border-transparent px-6 pb-4">
          <div className="rounded-2xl border border-[#004142]/10 bg-white/80 p-4 shadow-sm">
            <div className="text-2xl font-roboto font-medium text-[#004142]">54</div>
            <div className="text-[10px] font-roboto font-light uppercase tracking-[0.18em] text-[#527679]">VIEWS</div>
          </div>
        </div>
      )}

      {/* padding:0 on ShellNavRail root for perimeter contract; internal spacing conditional on collapse */}
      <div className={collapsed ? 'px-3 pb-4 pt-2' : 'px-3 py-3'}>
        {/* Filter input "Filter views..." — only when expanded */}
        {!collapsed && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter views..."
              className="w-full rounded-xl border border-[#004142]/10 bg-white/80 py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-[#004142] focus:bg-white transition-all duration-300 hover:shadow-md"
              aria-label="Filter views"
            />
          </div>
        )}

        <nav className={collapsed ? 'space-y-4' : 'space-y-5'} aria-label="Nav groups">
          {grouped.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <div className="mb-1.5 px-2 text-[10px] font-roboto font-light uppercase tracking-[0.18em] text-[#527679]">
                  {group.title}
                </div>
              )}
              <div className={collapsed ? 'flex flex-col items-center gap-2' : 'space-y-0.5'}>
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
                        className={`${linkClass(active)} font-roboto ${collapsed ? 'h-11 w-11 justify-center px-0 py-0 min-h-[44px] min-w-[44px]' : 'w-full gap-3 px-3 py-2.5 text-left min-h-[40px]'}`}
                        title={collapsed ? item.label : undefined}
                        style={active ? { backgroundColor: '#004142', color: '#fff' } : undefined}
                      >
                        <item.icon size={16} className="shrink-0" />
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
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
