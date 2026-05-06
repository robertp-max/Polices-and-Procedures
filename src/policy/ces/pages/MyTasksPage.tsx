/* ═══════════════════════════════════════════════════════════════
   MyTasksPage — execution-layer view of TASK obligations
   assigned to the current user, across onboarding + compliance.
   Single source of truth: the canonical Obligation store.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react';
import { useObligations } from '@/policy/ces/obligations';
import { CES_TOKENS } from '@/policy/ces/theme';
import {
  ComplianceStateBadge, AuditReadinessTag, EscalationTimer,
} from '@/policy/ces/components/primitives';
import type { ComplianceState } from '@/policy/ces/types';

type TaskFilter = 'all' | 'open' | 'awaiting_signature' | 'blocked' | 'overdue';

const FILTER_LABEL: Record<TaskFilter, string> = {
  all:                'All',
  open:               'Open',
  awaiting_signature: 'Awaiting Signature',
  blocked:            'Blocked',
  overdue:            'Overdue',
};

interface Props {
  /** Current user id. Defaults to a demo user for the initial route. */
  currentUserId?: string;
  currentUserName?: string;
}

export function MyTasksPage({
  currentUserId   = 'demo-user',
  currentUserName = 'You',
}: Props = {}) {
  const obligations = useObligations();
  const [filter, setFilter] = useState<TaskFilter>('open');

  const myTasks = useMemo(
    () => obligations.getMyTasks({ userId: currentUserId }),
    [obligations, currentUserId],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case 'all':                return myTasks;
      case 'open':               return myTasks.filter(t => t.complianceState !== 'completed');
      case 'awaiting_signature': return myTasks.filter(t => t.complianceState === 'awaiting_signature');
      case 'blocked':            return myTasks.filter(t => t.complianceState === 'blocked');
      case 'overdue':            return myTasks.filter(t => (t.escalationTimer ?? 0) < 0 && t.complianceState !== 'completed');
    }
  }, [myTasks, filter]);

  return (
    <div className="h-full flex flex-col" style={{ background: CES_TOKENS.canvas }}>
      <header
        className="px-6 py-4 flex items-baseline gap-4"
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
        <div className="ml-auto flex items-center gap-1">
          {(Object.keys(FILTER_LABEL) as TaskFilter[]).map(k => {
            const active = filter === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className="text-[11.5px] font-semibold px-3 py-1.5 rounded-md"
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
        {filtered.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center text-[13px]"
            style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}`, color: CES_TOKENS.muted }}
          >
            <p className="font-semibold text-[14px]" style={{ color: CES_TOKENS.ink }}>
              No tasks match this filter.
            </p>
            <p className="mt-2">
              Try All, Overdue, or Awaiting Signature.
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
            {filtered.map(t => (
              <li
                key={t.id}
                className="rounded-lg p-4 flex items-start gap-4"
                style={{ background: CES_TOKENS.white, border: `1px solid ${CES_TOKENS.border}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: CES_TOKENS.muted }}>
                    {t.sourceType ?? 'OBLIGATION'} · {t.domain}
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
                </div>
                {typeof t.escalationTimer === 'number' && (
                  <EscalationTimer hours={t.escalationTimer} />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
