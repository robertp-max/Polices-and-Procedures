/* ═══════════════════════════════════════════════════════════════
   MyTasksPage — execution-layer view of TASK obligations
   assigned to the current user, across onboarding + compliance.
   Single source of truth: the canonical Obligation store.
   ═══════════════════════════════════════════════════════════════ */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useObligations } from '@/policy/ces/obligations';
import { CES_TOKENS } from '@/policy/ces/theme';
import {
  ComplianceStateBadge, AuditReadinessTag, EscalationTimer,
} from '@/policy/ces/components/primitives';
import type { ComplianceState } from '@/policy/ces/types';
import { CES_ROLES, buildCesRoleAssignment } from '@/policy/ces/cesRoles';
import type { CesRole } from '@/policy/ces/cesRoles';
import { useCesReviewMode, isRobertUser } from '@/policy/ces/cesReviewMode';
import { useAuth } from '@/auth/AuthProvider';
import type { MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';
import { useDataFreshness } from '@/policy/utils/useDataFreshness';
import { StalenessBanner } from '@/policy/components/ui/StalenessBanner';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';

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
      <span style={{ color: '#94A3B8' }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? '#FFC107' : '#F1F5F9', fontFamily: 'monospace' }}>{value}</span>
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
        border: '1px solid #1E3A5F',
        background: '#0F172A',
        color: '#F1F5F9',
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
          background: '#1E3A5F',
          border: 'none',
          color: '#F1F5F9',
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
          <span style={{ marginLeft: 4, padding: '1px 6px', borderRadius: 4, background: '#FFC107', color: '#0F172A', fontSize: 9, fontWeight: 800 }}>
            {reviewRole}
          </span>
        )}
        <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: 9 }}>{isOpen ? '▼' : '▲'}</span>
      </button>

      {isOpen && (
        <div style={{ padding: 12 }}>
          {/* Pipeline counts */}
          <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
            Pipeline
          </div>
          {row('Source tasks (all obligations)', allTasks.length)}
          {row('After role backfill', backfilled.length)}
          {row('After role filter', filtered.length, filtered.length > 0)}
          {row('Missing assignedRole (pre-backfill)', missingAssigned, missingAssigned > 0)}
          {row('Selected review role', reviewRole ?? '— (real user)' )}

          {/* assignedRole distribution */}
          <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>
            By assignedRole (post-backfill)
          </div>
          {Object.entries(assignedCounts).sort((a, b) => b[1] - a[1]).map(([role, n]) =>
            row(role, n, reviewRole === role),
          )}
          {Object.keys(assignedCounts).length === 0 && (
            <div style={{ fontSize: 11, color: '#EF4444' }}>No tasks — store may be empty</div>
          )}

          {/* accountableRole distribution */}
          <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 10, marginBottom: 6 }}>
            By accountableRole
          </div>
          {Object.entries(accountableCounts).sort((a, b) => b[1] - a[1]).map(([role, n]) =>
            row(role, n),
          )}

          <div style={{ marginTop: 10, fontSize: 9, color: '#475569', textAlign: 'center', letterSpacing: '0.1em' }}>
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
  currentUserId   = 'demo-user',
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

  return (
    <div className="h-full flex flex-col" style={{ background: CES_TOKENS.canvas }}>
      <header
        className="px-3 sm:px-6 py-4 flex items-baseline gap-4 flex-wrap ci-sticky-operational border-b ci-shell-command-group mx-3 sm:mx-6 mt-2 rounded-xl"
        style={{ background: CES_TOKENS.white, borderBottom: `1px solid ${CES_TOKENS.border}` }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: CES_TOKENS.muted }}>
            Execution
          </div>
          <h1 className="text-[18px] font-bold" style={{ color: CES_TOKENS.navy }}>
            My Tasks
          </h1>
        </div>
        <span className="text-[12px]" style={{ color: CES_TOKENS.muted }}>
          {currentUserName} · {myTasks.length} total
        </span>
        {reviewEnabled && reviewRole && (
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ background: '#1E3A5F', color: '#FFC107' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFC107', display: 'inline-block' }} />
            Reviewing as: {reviewRole}
          </span>
        )}
        {/* Robert-only: quick role summary chips */}
        {isRobert && reviewEnabled && (
          <div className="flex gap-1.5 flex-wrap">
            {CES_ROLES.map(role => {
              const count = obligations.getTasksByRole(role).length;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChipClick(role)}
                  title={`${count} tasks visible to ${role}`}
                  aria-pressed={reviewRole === role}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: reviewRole === role ? '#1E3A5F' : '#F1F5F9',
                    color:      reviewRole === role ? '#FFC107'  : '#374151',
                    border:     `1px solid ${reviewRole === role ? '#1E3A5F' : '#E2E8F0'}`,
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    transition: 'background-color 120ms ease, color 120ms ease, border-color 120ms ease',
                  }}
                >
                  {role}: {count}
                </button>
              );
            })}
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(Object.keys(FILTER_LABEL) as TaskFilter[]).map(k => {
            const active = filter === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className="text-[11.5px] font-semibold px-3 py-1.5 min-h-[44px] rounded-md ci-subtle-hover"
                style={{
                  background: active ? CES_TOKENS.navy : CES_TOKENS.canvas,
                  color:      active ? 'white'         : CES_TOKENS.ink,
                  border:     `1px solid ${active ? CES_TOKENS.navy : CES_TOKENS.border}`,
                }}
                aria-pressed={active}
              >
                {FILTER_LABEL[k]}
              </button>
            );
          })}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
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
          <div
            className="rounded-lg p-8 text-center text-[13px]"
            style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}`, color: CES_TOKENS.muted }}
          >
            <p className="font-semibold text-[14px]" style={{ color: CES_TOKENS.ink }}>
              No tasks match this filter.
            </p>
            <p className="mt-2">
              {reviewEnabled && reviewRole
                ? `No tasks are visible to "${reviewRole}" with the "${filter}" filter. Try switching to "All".`
                : 'Try All, Overdue, or Awaiting Signature.'}
            </p>
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-4 px-4 py-2 rounded-md text-[12px] font-semibold"
              style={{
                background: CES_TOKENS.navy,
                color: '#fff',
                border: `1px solid ${CES_TOKENS.navy}`,
              }}
            >
              View all tasks
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {taskWithRoles.map(t => {
              const assigned = (t as UnitWithRoles).assignedRole;
              return (
                <li
                  key={t.id}
                  className="rounded-lg p-4 flex items-start gap-4 ci-subtle-hover hover:bg-[var(--ci-surface-2)]"
                  style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
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
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] flex items-center gap-2" style={{ color: CES_TOKENS.muted }}>
                      {t.sourceType ?? 'OBLIGATION'} · {t.domain}
                      {assigned && (
                        <span
                          style={{
                            padding: '1px 5px',
                            borderRadius: 3,
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                          }}
                        >
                          {assigned}
                        </span>
                      )}
                    </div>
                    <div className="text-[14px] font-semibold mt-0.5" style={{ color: CES_TOKENS.ink }}>
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
