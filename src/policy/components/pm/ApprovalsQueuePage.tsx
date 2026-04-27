/**
 * ApprovalsQueuePage — manager surface for tasks awaiting review.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Approvals.md (demo cut)
 *
 * Read-only over the projection: lists every task whose derived PM status is
 * `in_review` (mapped from CES `requires-review` / eCIgn `awaiting_approval`).
 * Approve/Reject record the manager's decision via overlay labels + an
 * `evidence_added` (approve) or `blocked` (reject) notification to the
 * assignee. The authoritative approval-state flip still happens in the
 * regulatory/eCIgn flow; this is the PM-overlay overlay on top.
 */

import { useMemo, useState, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { usePmNotificationStore } from '@/policy/pm/notificationStore';
import { isPersonalTask } from '@/policy/pm/types';
import type { Task } from '@/policy/pm/types';

export function ApprovalsQueuePage(): ReactElement {
  const tasks = useProjectedTasks();
  const overlay = usePmOverlayStore();
  const ingest = usePmNotificationStore(s => s.ingest);
  const [actor] = useState(() => localStorage.getItem('hhc_actor_id') || 'me');
  const [filterAssignee, setFilterAssignee] = useState<string>('');

  const queue = useMemo(() => {
    return tasks
      .filter(t => t.status === 'in_review' && !isPersonalTask(t))
      .filter(t => {
        if (!filterAssignee) return true;
        const a = (t as { assigned_user_id?: string }).assigned_user_id;
        return a === filterAssignee;
      })
      .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
  }, [tasks, filterAssignee]);

  const assignees = useMemo(() => {
    const s = new Set<string>();
    for (const t of tasks) {
      const a = (t as { assigned_user_id?: string }).assigned_user_id;
      if (a) s.add(a);
    }
    return Array.from(s).sort();
  }, [tasks]);

  function emitNotif(t: Task, kind: 'evidence_added' | 'blocked', payload: Record<string, unknown>) {
    const assignee = (t as { assigned_user_id?: string }).assigned_user_id;
    if (!assignee) return;
    ingest([
      {
        id: `notif-approval-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: assignee,
        task_id: t.task_id,
        kind,
        window_token: `${kind}:approval:${t.task_id}:${Date.now()}`,
        payload,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function approve(t: Task) {
    overlay.addLabel(t.task_id, 'approval:approved', actor);
    emitNotif(t, 'evidence_added', { decided_by: actor, decision: 'approved' });
  }

  function reject(t: Task) {
    overlay.addLabel(t.task_id, 'approval:rejected', actor);
    emitNotif(t, 'blocked', { decided_by: actor, decision: 'rejected' });
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/55">
          PM Approvals
        </div>
        <h1 className="text-2xl font-outfit text-white mt-1">Approvals Queue</h1>
        <p className="text-sm text-white/55 mt-1">
          {queue.length} task{queue.length === 1 ? '' : 's'} awaiting review.
        </p>
      </header>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-xs text-white/55" htmlFor="approvals-assignee">Assignee:</label>
        <select
          id="approvals-assignee"
          title="Filter by assignee"
          value={filterAssignee}
          onChange={e => setFilterAssignee(e.target.value)}
          className="px-3 py-1.5 rounded-md bg-[#1a1f2e] border border-white/10 text-sm"
        >
          <option value="">All</option>
          {assignees.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-white/55">
          Nothing pending review.
        </div>
      ) : (
        <ul className="space-y-2">
          {queue.map(t => {
            const labels = ((t as { labels?: string[] }).labels) || [];
            const decided = labels.find(l => l.startsWith('approval:'));
            const assignee = (t as { assigned_user_id?: string }).assigned_user_id || '—';
            return (
              <li
                key={t.task_id}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/45">{t.task_id}</span>
                    {decided && (
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        decided.endsWith('approved')
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-pink-500/15 text-pink-300 border border-pink-500/30'
                      }`}>
                        {decided.replace('approval:', '')}
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] font-outfit text-white truncate">{t.title}</div>
                  <div className="mt-1 text-[11px] text-white/55 flex gap-4">
                    <span>Assignee: <span className="text-white/75">{assignee}</span></span>
                    {t.due_date && <span>Due: {t.due_date}</span>}
                    {t.story_points != null && <span>{t.story_points}pt</span>}
                  </div>
                </div>
                {!decided && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => approve(t)}
                      className="px-3 py-1.5 rounded-md text-[11px] uppercase tracking-[0.16em] font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(t)}
                      className="px-3 py-1.5 rounded-md text-[11px] uppercase tracking-[0.16em] font-bold border border-pink-500/40 bg-pink-500/10 text-pink-200 hover:bg-pink-500/20"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
