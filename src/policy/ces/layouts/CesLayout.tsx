/* ═══════════════════════════════════════════════════════════════
   CesLayout — internal CES module shell
   Top context bar (Active Sprint, Search, Profile, Escalations).
   Renders inside the global CommandCenterLayout.
   ═══════════════════════════════════════════════════════════════ */

import { type PropsWithChildren, useMemo } from 'react';
import { Search, Bell } from 'lucide-react';
import { useComplianceExecution } from '@/policy/compliance-execution';
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
    <div className="w-full h-full flex flex-col" style={{ background: 'transparent', color: 'var(--v3-text-primary)' }}>
      {/* ── CES top context bar — clean corporate, token-driven ─────────── */}
      <header
        className="shrink-0 flex items-center gap-4 px-6 h-12 border-b"
        style={{ borderColor: 'var(--v3-border-subtle)', background: 'rgba(255,255,255,0.015)' }}
      >
        {/* Active sprint pill */}
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-[0.18em]" style={{ background: 'rgba(0, 209, 193, 0.1)', color: 'var(--v3-teal-light)' }}>
            ACTIVE SPRINT
          </div>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[13px] font-semibold tracking-tight">{ACTIVE_SPRINT.label}</span>
            <span className="text-[11px] text-[var(--v3-text-secondary)]">{fmtRange(ACTIVE_SPRINT.startDate, ACTIVE_SPRINT.endDate)}</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Compact search */}
        <div className="hidden md:flex items-center gap-2 px-3 h-8 rounded-full border text-[12px]" style={{ borderColor: 'var(--v3-border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
          <Search size={13} className="text-[var(--v3-text-tertiary)]" />
          <input type="text" placeholder="Search CES…" className="bg-transparent outline-none w-44 text-[var(--v3-text-primary)] placeholder:text-[var(--v3-text-tertiary)]" />
        </div>

        {/* Escalations pill */}
        <button
          type="button"
          className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-semibold border"
          style={{
            background: escalations > 0 ? 'rgba(224,123,44,0.1)' : 'rgba(255,255,255,0.02)',
            color: escalations > 0 ? 'var(--v3-orange-light)' : 'var(--v3-text-secondary)',
            borderColor: escalations > 0 ? 'rgba(224,123,44,0.3)' : 'var(--v3-border-subtle)',
          }}
          title={`${escalations} urgent escalation${escalations === 1 ? '' : 's'}`}
        >
          <Bell size={13} />
          <span>{escalations} urgent</span>
        </button>

        {/* Profile minimal */}
        <div className="flex items-center gap-2 pl-3 border-l" style={{ borderColor: 'var(--v3-border-subtle)' }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'rgba(0,209,193,0.15)', color: 'var(--v3-teal-light)' }}>
            {profile.initials}
          </div>
          <div className="text-[11px] leading-none">
            <div className="font-semibold">{profile.name.split(' ').slice(0,1)}</div>
          </div>
        </div>
      </header>

      {/* Content — clean generous spacing per designs */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1480px] px-6 md:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
