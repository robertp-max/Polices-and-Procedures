/* ═══════════════════════════════════════════════════════════════
   CesLayout — internal CES module shell
   Sub-sidebar (Dashboard / Board / Calendar / Workloads / Reports)
   + Top context bar (Active Sprint, Search, Profile, Escalations).
   Renders inside the global CommandCenterLayout.
   ═══════════════════════════════════════════════════════════════ */

import { type PropsWithChildren, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Columns3, CalendarRange, BarChart3, Workflow, SlidersHorizontal, ShieldCheck,
  Search, Bell, ChevronDown,
} from 'lucide-react';
import { CES_TOKENS } from '../theme';
import { useComplianceExecution } from '@/policy/compliance-execution';

/** Demo profile chip — replace with real auth identity. */
const PROFILE = { initials: 'JV', name: 'JD Vance', role: 'Administrator Designee' };

interface CesNavItem {
  to:    string;
  label: string;
  icon:  React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
}

const CES_NAV: CesNavItem[] = [
  { to: '/ces/dashboard',              label: 'Dashboard',              icon: LayoutDashboard },
  { to: '/calendar?view=sprint',       label: 'Calendar',               icon: CalendarRange },
  { to: '/ces/board',                  label: 'Sprint Board',           icon: Columns3 },
  { to: '/workflows',                  label: 'Workflows',              icon: Workflow },
  { to: '/compliance/master-controls', label: 'Master Controls',        icon: SlidersHorizontal },
  { to: '/audit',                      label: 'Audit Mode',             icon: ShieldCheck },
  { to: '/ces/reports',                label: 'Reports',                icon: BarChart3 },
];

function fmtRange(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sm = s.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const em = e.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${sm} – ${em}`;
}

export function CesLayout({ children }: PropsWithChildren) {
  const loc = useLocation();
  const snap = useComplianceExecution();
  const ACTIVE_SPRINT = snap.activeSprint;
  const EXECUTION_UNITS = snap.executionUnits;

  /* ── Urgent escalation count: overdue signatures + critical blockers ── */
  const escalations = useMemo(() => {
    const overdueSigs = EXECUTION_UNITS.filter(u =>
      u.complianceState === 'awaiting_signature' &&
      (u.escalationTimer ?? 0) < 0,
    ).length;
    const criticalBlockers = EXECUTION_UNITS.filter(u =>
      u.complianceState === 'blocked' && u.auditReadiness !== 'ready',
    ).length;
    return overdueSigs + criticalBlockers;
  }, [EXECUTION_UNITS]);

  return (
    <div
      className="w-full h-full flex"
      style={{ background: CES_TOKENS.canvas, color: CES_TOKENS.ink }}
    >
      {/* ── Sub-sidebar ──────────────────────────────────── */}
      <aside
        className="shrink-0 flex flex-col"
        style={{
          width:        232,
          background:   CES_TOKENS.white,
          borderRight: `1px solid ${CES_TOKENS.border}`,
        }}
      >
        <div className="px-5 pt-6 pb-4">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: CES_TOKENS.muted }}
          >
            Compliance Execution
          </div>
          <div
            className="text-[18px] font-bold mt-1"
            style={{ color: CES_TOKENS.navy }}
          >
            CES
          </div>
        </div>

        <nav className="flex-1 px-3 pb-4 space-y-1">
          {CES_NAV.map(item => {
            const active = loc.pathname === item.to || loc.pathname.startsWith(item.to + '/');
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                style={{
                  background: active ? CES_TOKENS.navySoft : 'transparent',
                  color:      active ? CES_TOKENS.navy     : CES_TOKENS.ink,
                  border:     active ? `1px solid ${CES_TOKENS.navy}22` : '1px solid transparent',
                }}
              >
                <Icon size={16} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div
          className="px-5 py-4 text-[11px]"
          style={{ borderTop: `1px solid ${CES_TOKENS.border}`, color: CES_TOKENS.muted }}
        >
          Calendar-driven. Sequential. Audit-defensible.
        </div>
      </aside>

      {/* ── Main column (top bar + content) ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top context bar */}
        <header
          className="shrink-0 flex items-center gap-4 px-6 h-14"
          style={{
            background:    CES_TOKENS.white,
            borderBottom: `1px solid ${CES_TOKENS.border}`,
          }}
        >
          {/* Active sprint */}
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: CES_TOKENS.orangeSoft, color: CES_TOKENS.orange }}
            >
              Active Sprint
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold" style={{ color: CES_TOKENS.navy }}>
                {ACTIVE_SPRINT.label}
              </span>
              <span className="text-[12px]" style={{ color: CES_TOKENS.muted }}>
                {fmtRange(ACTIVE_SPRINT.startDate, ACTIVE_SPRINT.endDate)}
              </span>
              <ChevronDown size={14} style={{ color: CES_TOKENS.muted }} />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-lg w-72"
            style={{ background: CES_TOKENS.canvas, border: `1px solid ${CES_TOKENS.border}` }}
          >
            <Search size={14} style={{ color: CES_TOKENS.muted }} />
            <input
              type="text"
              placeholder="Search forms, policies, events…"
              className="flex-1 bg-transparent outline-none text-[12px]"
              style={{ color: CES_TOKENS.ink }}
            />
          </div>

          {/* Escalations */}
          <button
            type="button"
            className="relative flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: escalations > 0 ? CES_TOKENS.orangeSoft : CES_TOKENS.canvas,
              color:      escalations > 0 ? CES_TOKENS.orange     : CES_TOKENS.muted,
              border:    `1px solid ${escalations > 0 ? CES_TOKENS.orange + '40' : CES_TOKENS.border}`,
            }}
            title={`${escalations} urgent escalation${escalations === 1 ? '' : 's'}`}
          >
            <Bell size={14} />
            <span>{escalations} urgent</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-3" style={{ borderLeft: `1px solid ${CES_TOKENS.border}` }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: CES_TOKENS.navy, color: 'white' }}
            >
              {PROFILE.initials}
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-semibold" style={{ color: CES_TOKENS.ink }}>
                {PROFILE.name}
              </div>
              <div className="text-[10px]" style={{ color: CES_TOKENS.muted }}>
                {PROFILE.role}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
