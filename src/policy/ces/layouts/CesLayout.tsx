/* ═══════════════════════════════════════════════════════════════
   CesLayout — internal CES module shell
   Top context bar (Active Sprint, Search, Profile, Escalations).
   Renders inside the global CommandCenterLayout.
   ═══════════════════════════════════════════════════════════════ */

import { type PropsWithChildren, useMemo } from 'react';
import {
  Search, Bell, ChevronDown,
} from 'lucide-react';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { toDisplaySprintId, sprintDropdownLabel } from '@/policy/pm/sprintWindows';
import { useAuth } from '@/auth/AuthProvider';
import { resolveCesRole } from '@/policy/ces/cesRoles';

function fmtRange(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sm = s.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const em = e.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${sm} – ${em}`;
}

export function CesLayout({ children }: PropsWithChildren) {
  const { user } = useAuth();
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
  const profile = useMemo(() => {
    const name = user?.name || user?.email || 'Current User';
    const initials = name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'CU';
    return {
      initials,
      name,
      role: resolveCesRole(user?.role || 'Administrator'),
    };
  }, [user?.email, user?.name, user?.role]);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: 'transparent', color: 'var(--v3-text-primary)' }}
    >
      {/* ── CES top context bar + content (no sidebar) ─────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top context bar */}
        <header
          className="shrink-0 flex items-center gap-4 px-6 h-14"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid var(--v3-border-subtle)',
          }}
        >
          {/* Active sprint */}
          <div className="flex items-center gap-2">
            <div
              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ background: 'rgba(0, 209, 193, 0.08)', color: 'var(--v3-teal-light)' }}
            >
              Active Sprint
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--v3-text-primary)' }}>
                  {ACTIVE_SPRINT.label}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--v3-text-secondary)' }}>
                  {fmtRange(ACTIVE_SPRINT.startDate, ACTIVE_SPRINT.endDate)}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--v3-text-tertiary)' }} />
              </div>
              <div className="text-[10px] font-mono truncate" style={{ color: 'var(--v3-text-tertiary)' }} title={sprintDropdownLabel(pmSprint)}>
                PM scope: {toDisplaySprintId(pmSprint)} · {pmSprint.startDate}–{pmSprint.endDate}
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 h-9 rounded-lg w-72"
            style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--v3-border-subtle)' }}
          >
            <Search size={14} style={{ color: 'var(--v3-text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search forms, policies, events…"
              className="flex-1 bg-transparent outline-none text-[12px]"
              style={{ color: 'var(--v3-text-primary)' }}
            />
          </div>

          {/* Escalations */}
          <button
            type="button"
            className="relative flex items-center gap-2 h-9 px-3 rounded-lg text-[12px] font-medium transition-colors"
            style={{
              background: escalations > 0 ? 'rgba(0, 209, 193, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              color: escalations > 0 ? 'var(--v3-teal-light)' : 'var(--v3-text-secondary)',
              border: escalations > 0 ? '1px solid rgba(0, 209, 193, 0.22)' : '1px solid var(--v3-border-subtle)',
            }}
            title={`${escalations} urgent escalation${escalations === 1 ? '' : 's'}`}
          >
            <Bell size={14} />
            <span>{escalations} urgent</span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid var(--v3-border-subtle)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
              style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--v3-text-primary)' }}
            >
              {profile.initials}
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-semibold" style={{ color: 'var(--v3-text-primary)' }}>
                {profile.name}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--v3-text-secondary)' }}>
                {profile.role}
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
