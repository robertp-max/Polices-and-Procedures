/* ═══════════════════════════════════════════════════════════════
   CesLayout — internal CES module shell
   Sub-sidebar (Dashboard / Board / Calendar / Workloads / Reports)
   + Top context bar (Active Sprint, Search, Profile, Escalations).
   Renders inside the global CommandCenterLayout.
   ═══════════════════════════════════════════════════════════════ */

import { type PropsWithChildren, useMemo } from 'react';
import {
  Search, Bell, ChevronDown,
} from 'lucide-react';
import { useCesTokens } from '../theme';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { toDisplaySprintId, sprintDropdownLabel } from '@/policy/pm/sprintWindows';

const PROFILE = { initials: 'JV', name: 'JD Vance', role: 'Administrator Designee' };

function fmtRange(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sm = s.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const em = e.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${sm} – ${em}`;
}

export function CesLayout({ children }: PropsWithChildren) {
  const t = useCesTokens();
  const snap = useComplianceExecution();
  const pmSprint = usePmViewSprintStore(s => s.window);
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
      className="w-full h-full flex flex-col"
      style={{ background: t.canvas, color: t.ink }}
    >
      {/* ── CES top context bar + content (no sidebar) ─────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top context bar */}
        <header
          className="shrink-0 flex items-center gap-4 px-6 h-14"
          style={{
            background:    t.white,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          {/* Active sprint */}
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: t.orangeSoft, color: t.orange }}
            >
              Active Sprint
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-semibold" style={{ color: t.navy }}>
                  {ACTIVE_SPRINT.label}
                </span>
                <span className="text-[12px]" style={{ color: t.muted }}>
                  {fmtRange(ACTIVE_SPRINT.startDate, ACTIVE_SPRINT.endDate)}
                </span>
                <ChevronDown size={14} style={{ color: t.muted }} />
              </div>
              <div className="text-[10px] font-mono truncate" style={{ color: t.muted }} title={sprintDropdownLabel(pmSprint)}>
                PM scope: {toDisplaySprintId(pmSprint)} · {pmSprint.startDate}–{pmSprint.endDate}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-lg w-72"
            style={{ background: t.canvas, border: `1px solid ${t.border}` }}
          >
            <Search size={14} style={{ color: t.muted }} />
            <input
              type="text"
              placeholder="Search forms, policies, events…"
              className="flex-1 bg-transparent outline-none text-[12px]"
              style={{ color: t.ink }}
            />
          </div>

          {/* Escalations */}
          <button
            type="button"
            className="relative flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: escalations > 0 ? t.orangeSoft : t.canvas,
              color:      escalations > 0 ? t.orange     : t.muted,
              border:    `1px solid ${escalations > 0 ? t.orange + '40' : t.border}`,
            }}
            title={`${escalations} urgent escalation${escalations === 1 ? '' : 's'}`}
          >
            <Bell size={14} />
            <span>{escalations} urgent</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-3" style={{ borderLeft: `1px solid ${t.border}` }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: t.navy, color: t.paper }}
            >
              {PROFILE.initials}
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-semibold" style={{ color: t.ink }}>
                {PROFILE.name}
              </div>
              <div className="text-[10px]" style={{ color: t.muted }}>
                {PROFILE.role}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
