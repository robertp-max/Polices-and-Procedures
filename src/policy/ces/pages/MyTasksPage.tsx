/* ═══════════════════════════════════════════════════════════════
   MyTasksPage — execution-layer view of TASK obligations
   assigned to the current user, across onboarding + compliance.
   Single source of truth: the canonical Obligation store.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useObligations } from '@/policy/ces/obligations';
import { CES_ROLES, buildCesRoleAssignment } from '@/policy/ces/cesRoles';
import {
  ComplianceStateBadge, AuditReadinessTag, EscalationTimer,
} from '@/policy/ces/components/primitives';
import type { ComplianceState } from '@/policy/ces/types';
import type { CesRole } from '@/policy/ces/cesRoles';
import { CES_TOKENS } from '@/policy/ces/theme';
import { useCesReviewMode, isRobertUser } from '@/policy/ces/cesReviewMode';
import { useAuth } from '@/auth/AuthProvider';
import type { MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';
import { useDataFreshness } from '@/policy/utils/useDataFreshness';
import { StalenessBanner } from '@/policy/components/ui/StalenessBanner';
import { ActionButton, CiStatusBadge, EmptyState, PageHeader, SurfaceCard } from '@/policy/components/ui';
// Note: SurfaceCard here used for compact status (legacy children); dashboard+board CES cards standardized to exact prototype structure (ref 16-dashboard, 11-ces).
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { useShellStore } from '@/policy/stores/uiStore';

type TaskFilter = 'all' | 'open' | 'awaiting_signature' | 'blocked' | 'overdue';

const FILTER_LABEL: Record<TaskFilter, string> = {
  all:                'All',
  open:               'Open',
  awaiting_signature: 'Awaiting Signature',
  blocked:            'Blocked',
  overdue:            'Overdue',
};

function applyTaskFilter(tasks: readonly MergedExecutionUnit[], filter: TaskFilter): MergedExecutionUnit[] {
  switch (filter) {
    case 'all':                return [...tasks];
    case 'open':               return tasks.filter(t => t.complianceState !== 'completed');
    case 'awaiting_signature': return tasks.filter(t => t.complianceState === 'awaiting_signature');
    case 'blocked':            return tasks.filter(t => t.complianceState === 'blocked');
    case 'overdue':            return tasks.filter(t => (t.escalationTimer ?? 0) < 0 && t.complianceState !== 'completed');
  }
}

/* ─── Role-backfill helper ────────────────────────────────────
   Ensures assignedRole / accountableRole are never undefined
   at render time. Applied to the final rendered array.         */
type UnitWithRoles = MergedExecutionUnit & {
  assignedRole?:   string;
  accountableRole?: string;
};

function backfillRoles(u: MergedExecutionUnit): UnitWithRoles {
  const ext = u as UnitWithRoles;
  if (ext.assignedRole && ext.accountableRole) return ext;
  // Build a lightweight assignment from domain + owner.role
  const ra = buildCesRoleAssignment({
    domain:    u.domain,
    ownerRole: (u as UnitWithRoles).assignedRole ?? u.owner?.role,
  });
  return {
    ...ext,
    assignedRole:    ext.assignedRole    ?? ra.assignedRole,
    accountableRole: ext.accountableRole ?? ra.accountableRole,
  };
}

/* ─── Robert-only diagnostics panel ──────────────────────────
   Shows counts before/after filter so role routing bugs are
   visible without reading source code.
   Renders null for all non-Robert users.                       */

interface DiagnosticsProps {
  allTasks:    readonly MergedExecutionUnit[];
  backfilled:  UnitWithRoles[];
  filtered:    UnitWithRoles[];
  reviewRole:  CesRole | null;
  isOpen:      boolean;
  onToggle:    () => void;
}

function RoleDiagnosticsPanel({ allTasks, backfilled, filtered, reviewRole, isOpen, onToggle }: DiagnosticsProps) {
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const assignedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of backfilled) {
      const role = (u as UnitWithRoles).assignedRole ?? '(none → DON)';
      counts[role] = (counts[role] ?? 0) + 1;
    }
    return counts;
  }, [backfilled]);

  const accountableCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of backfilled) {
      const role = (u as UnitWithRoles).accountableRole ?? '(none)';
      counts[role] = (counts[role] ?? 0) + 1;
    }
    return counts;
  }, [backfilled]);

  const missingAssigned = backfilled.filter(u => !(u as UnitWithRoles).assignedRole).length;

  const row = (label: string, value: string | number, accent?: boolean) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, padding: '2px 0' }}>
      <span style={{ color: isLight ? '#5F5855' : '#94A3B8' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? '#C74601' : (isLight ? '#1F1C1B' : '#F1F5F9'), fontFamily: 'monospace' }}>{value}</span>
    </div>
  );

  return (
    <div
      data-robert-diagnostics=""
      style={{
        position: 'fixed',
        bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 92 : 16,
        left: 16,
        zIndex: 9998,
        width: isOpen ? 340 : 'auto',
        borderRadius: 10,
        border: isLight ? '1px solid #E9E5E3' : '1px solid #1E3A5F',
        background: isLight ? '#FFFFFF' : '#0F172A',
        color: isLight ? '#1F1C1B' : '#F1F5F9',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '7px 12px',
          background: isLight ? '#F3F0EF' : '#1E3A5F',
          border: 'none',
          color: isLight ? '#1F1C1B' : '#F1F5F9',
          cursor: 'pointer',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC107', display: 'inline-block' }} />
        CES Role Diagnostics
        {reviewRole && (
          <span style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 4, background: '#FFC107', color: '#1F1C1B', fontSize: 9, fontWeight: 800 }}>
            {reviewRole}
          </span>
        )}
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 9 }}>{isOpen ? '▼' : '▲'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: 12 }}>
          {/* Pipeline counts */}
          <div style={{ fontSize: 9, color: isLight ? '#524D4B' : '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            Pipeline
          </div>
          {row('Source tasks (all obligations)', allTasks.length)}
          {row('After role backfill', backfilled.length)}
          {row('After role filter', filtered.length, filtered.length > 0)}
          {row('Missing assignedRole (pre-backfill)', missingAssigned, missingAssigned > 0)}
          {row('Selected review role', reviewRole ?? '— (real user)' )}

          {/* assignedRole distribution */}
          <div style={{ fontSize: 9, color: isLight ? '#524D4B' : '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>
            By assignedRole (post-backfill)
          </div>
          {Object.entries(assignedCounts).sort((a, b) => b[1] - a[1]).map(([role, n]) =>
            row(role, n, reviewRole === role),
          )}
          {Object.keys(assignedCounts).length === 0 && (
            <div style={{ fontSize: 11, color: '#EF4444' }}>No tasks — store may be empty</div>
          )}

          {/* accountableRole distribution */}
          <div style={{ fontSize: 9, color: isLight ? '#524D4B' : '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>
            By accountableRole
          </div>
          {Object.entries(accountableCounts).sort((a, b) => b[1] - a[1]).map(([role, n]) =>
            row(role, n),
          )}

          <div style={{ marginTop: 10, fontSize: 9, color: isLight ? '#524D4B' : '#475569', textAlign: 'center', letterSpacing: '0.1em' }}>
            ROBERT_REVIEW_MODE · diagnostics only
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */

interface Props {
  currentUserId?: string;
  currentUserName?: string;
}

export function MyTasksPage({
  currentUserId   = 'current-user',
  currentUserName = 'You',
}: Props = {}) {
  const navigate = useNavigate();
  const openTask = useSelectedTaskStore(s => s.openTask);
  const obligations = useObligations();

  // Stabilization N-07 / Fix 1: URL-back the filter so /my-tasks?filter=overdue
  // (and any of the 5 valid filter ids) is a working deep link. Falls back to
  // 'open' for missing or unrecognized values. The setter also writes the URL
  // (replace:true) so in-app filter clicks stay shareable/bookmarkable.
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = useMemo<TaskFilter>(() => {
    const raw = searchParams.get('filter');
    return raw && raw in FILTER_LABEL ? (raw as TaskFilter) : 'open';
  // Intentional: read once on mount; subsequent URL changes flow through setFilter.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [filter, setFilterState] = useState<TaskFilter>(initialFilter);
  const setFilter = useCallback((next: TaskFilter) => {
    setFilterState(next);
    setSearchParams(prev => {
      const merged = new URLSearchParams(prev);
      if (next === 'open') merged.delete('filter');
      else merged.set('filter', next);
      return merged;
    }, { replace: true });
  }, [setSearchParams]);

  const [diagOpen, setDiagOpen] = useState(false);

  // Stabilization R-05: client-side staleness detection. Threshold 5 min
  // matches the cadence at which task state most plausibly drifts (a
  // teammate signs, an evidence upload completes elsewhere). No fetch
  // logic is added — the obligations store is in-process and reading from
  // it is already live; the notice exists to prompt the user to consider
  // whether they want to reload the page if they think they've been away.
  const freshness = useDataFreshness({ stalenessThresholdMs: 5 * 60 * 1000 });

  /* ── Auth context for Robert review mode check ── */
  const { user } = useAuth();
  const isRobert = isRobertUser(user?.email, user?.id);

  /* ── Robert review mode: when active, filter by simulated role ── */
  const {
    isEnabled: reviewEnabled,
    reviewRole,
    setReviewRole,
  } = useCesReviewMode(user?.email, user?.id);

  /* ── All tasks from the store ── */
  const allTasks = useMemo(() => obligations.tasks, [obligations]);

  /* ── Apply role backfill to every task before any filtering ──
     This ensures assignedRole is never undefined at render time.
     For review mode: getTasksByRole() already uses DON backfill
     internally via obligationVisibleToRole(), but we also
     backfill here so the diagnostic counts are accurate.         */
  const backfilled = useMemo(
    () => allTasks.map(backfillRoles),
    [allTasks],
  );

  /* ── Select tasks for current user or review role ── */
  const myTasks = useMemo(() => {
    if (reviewEnabled && reviewRole) {
      return obligations.getTasksByRole(reviewRole);
    }
    return obligations.getMyTasks({ userId: currentUserId });
  }, [obligations, currentUserId, reviewEnabled, reviewRole]);

  const filtered = useMemo(() => {
    return applyTaskFilter(myTasks, filter);
  }, [myTasks, filter]);

  const handleRoleChipClick = useCallback((role: CesRole) => {
    if (!isRobert || !reviewEnabled) return;

    const roleTasks = obligations.getTasksByRole(role);
    const visibleAfterCurrentFilter = applyTaskFilter(roleTasks, filter);
    // Temporary Robert-only diagnostics requested for role validation.
    // eslint-disable-next-line no-console
    console.log('[CES ROLE SWITCH]', {
      previousRole: reviewRole ?? '',
      nextRole: role,
      sourceTaskCount: allTasks.length,
      filteredTaskCount: visibleAfterCurrentFilter.length,
    });

    setReviewRole(role);
  }, [allTasks.length, filter, isRobert, obligations, reviewEnabled, reviewRole, setReviewRole]);

  /* ── assignedRole to show on each task row ── */
  const taskWithRoles = useMemo(
    () => filtered.map(backfillRoles),
    [filtered],
  );
  const taskStats = useMemo(() => ({
    all: myTasks.length,
    open: myTasks.filter(t => t.complianceState !== 'completed').length,
    overdue: myTasks.filter(t => (t.escalationTimer ?? 0) < 0 && t.complianceState !== 'completed').length,
  }), [myTasks]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-5">
        <PageHeader
          eyebrow="MY EXECUTION QUEUE"
          title="My Tasks"
          description={`Personal obligations across CES and compliance. ${currentUserName} — ${myTasks.length} assigned.`}
          actions={
            reviewEnabled && reviewRole ? (
              <CiStatusBadge tone="warning">Reviewing as {reviewRole}</CiStatusBadge>
            ) : null
          }
        />
      </div>

      {/* Filter pills and role switchers — clean corporate */}
      <div className="px-6 pb-2 flex flex-wrap items-center gap-2">
        {(Object.keys(FILTER_LABEL) as TaskFilter[]).map(k => {
          const active = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.12em] border transition"
              style={{
                borderColor: active ? 'var(--v3-teal)' : 'var(--v3-border-subtle)',
                background: active ? 'rgba(0,209,193,0.12)' : 'transparent',
                color: active ? 'var(--v3-teal-light)' : 'var(--v3-text-secondary)',
              }}
            >
              {FILTER_LABEL[k]}
            </button>
          );
        })}

        {/* Robert role chips */}
        {isRobert && reviewEnabled && (
          <div className="flex gap-1.5 flex-wrap ml-3 pl-3 border-l border-[var(--v3-border-subtle)]">
            {CES_ROLES.map(role => {
              const count = obligations.getTasksByRole(role).length;
              const active = reviewRole === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChipClick(role)}
                  className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] rounded border"
                  style={{
                    background: active ? 'rgba(122,222,223,0.2)' : 'transparent',
                    borderColor: active ? 'var(--v3-teal)' : 'var(--v3-border-subtle)',
                    color: active ? 'var(--v3-teal-light)' : 'var(--v3-text-secondary)',
                  }}
                  title={`${count} tasks`}
                >
                  {role} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {/* Stats row premium */}
        <div className="flex items-center gap-2 mb-4">
          <SurfaceCard padding="sm" className="inline-flex"><CiStatusBadge tone="neutral">Total {taskStats.all}</CiStatusBadge></SurfaceCard>
          <SurfaceCard padding="sm" className="inline-flex"><CiStatusBadge tone="info">Open {taskStats.open}</CiStatusBadge></SurfaceCard>
          <SurfaceCard padding="sm" className="inline-flex"><CiStatusBadge tone="danger">Overdue {taskStats.overdue}</CiStatusBadge></SurfaceCard>
        </div>
        {freshness.isPotentiallyStale && (
          <div className="mb-4">
            <StalenessBanner
              lastVisibleAt={freshness.lastVisibleAt}
              onRefresh={() => {
                freshness.acknowledge();
                window.location.reload();
              }}
              onDismiss={freshness.acknowledge}
              message="Tasks may have been signed, escalated, or completed by teammates while you were away."
            />
          </div>
        )}
        {taskWithRoles.length === 0 ? (
          <EmptyState
            title="No tasks match this filter."
            description={
              reviewEnabled && reviewRole
                ? `No tasks are visible to "${reviewRole}" with the "${filter}" filter. Try switching to "All".`
                : 'Try All, Overdue, or Awaiting Signature.'
            }
            action={
              <ActionButton variant="cta" size="sm" onClick={() => setFilter('all')}>
                View all tasks
              </ActionButton>
            }
          />
        ) : (
          <ul key={filter} className="space-y-2.5">
            {taskWithRoles.map(t => {
              const assigned = (t as UnitWithRoles).assignedRole;
              return (
                <li
                  key={t.id}
                  className="rounded-xl p-4 flex items-start gap-4 border transition hover:bg-white/3"
                  style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'var(--v3-border-subtle)' }}
                >
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E3A5F]"
                    onClick={() => {
                      // Mobile-ops convergence: My Tasks rows are now actionable.
                      // We open the canonical PM task drawer and route users to
                      // calendar workspace context where execution detail is visible.
                      openTask(t.id, 'sprint');
                      navigate('/calendar?view=sprint');
                    }}
                    aria-label={`Open task details for ${t.title}`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] flex items-center gap-2 text-[var(--v3-text-tertiary)]">
                      {t.sourceType ?? 'OBLIGATION'} · {t.domain}
                      {assigned && (
                        <span className="px-1.5 py-px rounded text-[9px] font-bold tracking-[0.06em]" style={{ background: 'rgba(0, 121, 112, 0.1)', color: 'var(--v3-teal-light)' }}>
                          {assigned}
                        </span>
                      )}
                    </div>
                    <div className="text-[14px] font-semibold mt-0.5 text-[var(--v3-text-primary)]">
                      {t.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <ComplianceStateBadge state={t.complianceState as ComplianceState} />
                      <AuditReadinessTag readiness={t.auditReadiness} />
                      <span className="text-[11px]" style={{ color: CES_TOKENS.muted }}>
                        Due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                  {typeof t.escalationTimer === 'number' && (
                    <EscalationTimer hours={t.escalationTimer} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Robert-only diagnostics overlay */}
      {isRobert && reviewEnabled && (
        <RoleDiagnosticsPanel
          allTasks={allTasks}
          backfilled={backfilled}
          filtered={taskWithRoles}
          reviewRole={reviewRole}
          isOpen={diagOpen}
          onToggle={() => setDiagOpen(v => !v)}
        />
      )}
    </div>
  );
}
