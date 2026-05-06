/**
 * SprintReviewPage — Phase 3 sprint retrospective UI.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Sprint-Board-Design.md §5
 *
 * Shows what was committed vs delivered for a chosen sprint, with per-assignee
 * delivery rates and a list of carry-over candidates.
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import {
  currentSprint,
  neighbourSprint,
  sprintWindowsForYear,
} from '@/policy/pm/sprintWindows';
import { isPersonalTask, type Task } from '@/policy/pm/types';

function ownerOf(t: Task): string | undefined {
  if (isPersonalTask(t)) return t.owner_user_id;
  return (t as { assigned_user_id?: string }).assigned_user_id;
}

interface AssigneeStat {
  user_id: string;
  committed: number;
  delivered: number;
  blocked: number;
  inFlight: number;
  pointsCommitted: number;
  pointsDelivered: number;
}

export function SprintReviewPage(): ReactElement {
  const allTasks = useProjectedTasks('full');
  // Default to the previous sprint (review the one that just ended).
  const today = useMemo(() => currentSprint(), []);
  const previousId = useMemo(() => neighbourSprint(today.id, -1).id, [today]);
  const [sprintId, setSprintId] = useState<string>(previousId);

  useEffect(() => {
    void usePmOverlayStore.getState().hydrateFromApi();
    void usePmPersonalStore.getState().hydrateFromApi();
  }, []);

  const year = Number(sprintId.slice(0, 4));
  const allSprints = useMemo(() => sprintWindowsForYear(year), [year]);
  const sprint = allSprints.find(s => s.id === sprintId);

  const sprintTasks = useMemo(
    () => allTasks.filter(t => t.sprint_id === sprintId),
    [allTasks, sprintId],
  );

  const stats: AssigneeStat[] = useMemo(() => {
    const m = new Map<string, AssigneeStat>();
    for (const t of sprintTasks) {
      const u = ownerOf(t) ?? '(unassigned)';
      if (!m.has(u)) {
        m.set(u, { user_id: u, committed: 0, delivered: 0, blocked: 0, inFlight: 0, pointsCommitted: 0, pointsDelivered: 0 });
      }
      const s = m.get(u)!;
      const pts = typeof t.story_points === 'number' ? t.story_points : 1;
      s.committed += 1;
      s.pointsCommitted += pts;
      if (t.status === 'done') {
        s.delivered += 1;
        s.pointsDelivered += pts;
      } else if (t.status === 'blocked') {
        s.blocked += 1;
      } else {
        s.inFlight += 1;
      }
    }
    return Array.from(m.values()).sort((a, b) => a.user_id.localeCompare(b.user_id));
  }, [sprintTasks]);

  const totals = useMemo(() => {
    const init = { committed: 0, delivered: 0, blocked: 0, inFlight: 0, pointsCommitted: 0, pointsDelivered: 0 };
    return stats.reduce((acc, s) => ({
      committed: acc.committed + s.committed,
      delivered: acc.delivered + s.delivered,
      blocked:   acc.blocked   + s.blocked,
      inFlight:  acc.inFlight  + s.inFlight,
      pointsCommitted: acc.pointsCommitted + s.pointsCommitted,
      pointsDelivered: acc.pointsDelivered + s.pointsDelivered,
    }), init);
  }, [stats]);

  const carryOver = useMemo(
    () => sprintTasks.filter(t => t.status !== 'done'),
    [sprintTasks],
  );

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sprint Review</h1>
          <p className="text-sm text-white/60">
            Retrospective for {sprint ? `${sprint.id} (${sprint.startDate} → ${sprint.endDate})` : sprintId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSprintId(neighbourSprint(sprintId, -1).id)} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm border border-white/10">← Prev</button>
          <select value={sprintId} onChange={e => setSprintId(e.target.value)} title="Choose sprint" className="px-3 py-1.5 rounded-md bg-[#1a1f2e] border border-white/10 text-sm">
            {allSprints.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
          <button type="button" onClick={() => setSprintId(neighbourSprint(sprintId, 1).id)} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm border border-white/10">Next →</button>
        </div>
      </header>

      {/* Totals */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Committed',  value: totals.committed,         tone: 'text-white' },
          { label: 'Delivered',  value: totals.delivered,         tone: 'text-emerald-200' },
          { label: 'In Flight',  value: totals.inFlight,          tone: 'text-cyan-200' },
          { label: 'Blocked',    value: totals.blocked,           tone: 'text-pink-200' },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-white/50">{card.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
          Per-Assignee Delivery
        </h2>
        {stats.length === 0 ? (
          <p className="text-sm text-white/40">No tasks pinned to this sprint.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="text-left py-1">Assignee</th>
                <th className="text-right">Committed</th>
                <th className="text-right">Delivered</th>
                <th className="text-right">In Flight</th>
                <th className="text-right">Blocked</th>
                <th className="text-right">Points (Done/All)</th>
                <th className="text-right">Delivery %</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => {
                const pct = s.committed === 0 ? 0 : Math.round((s.delivered / s.committed) * 100);
                return (
                  <tr key={s.user_id} className="border-t border-white/5">
                    <td className="py-1">{s.user_id}</td>
                    <td className="text-right">{s.committed}</td>
                    <td className="text-right text-emerald-200">{s.delivered}</td>
                    <td className="text-right text-cyan-200">{s.inFlight}</td>
                    <td className="text-right text-pink-200">{s.blocked}</td>
                    <td className="text-right">{s.pointsDelivered}/{s.pointsCommitted}</td>
                    <td className={`text-right ${pct >= 80 ? 'text-emerald-200' : pct >= 50 ? 'text-amber-200' : 'text-pink-200'}`}>
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Carry-over */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
          Carry-Over Candidates ({carryOver.length})
        </h2>
        {carryOver.length === 0 ? (
          <p className="text-sm text-emerald-200">All committed work delivered. ✨</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {carryOver.map(t => (
              <li key={t.task_id} className="py-2 flex items-center gap-3 text-sm">
                <span className="font-mono text-xs text-white/50 w-48 truncate">{t.task_id}</span>
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-xs text-white/60">{ownerOf(t) ?? '—'}</span>
                <span className={`text-xs ${t.status === 'blocked' ? 'text-pink-200' : 'text-cyan-200'}`}>
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
