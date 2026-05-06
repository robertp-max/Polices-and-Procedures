/**
 * SprintPlanPage — Phase 3 capacity-aware sprint planning UI.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Sprint-Board-Design.md §4
 *
 * Lets a planner pick the active sprint, set per-assignee capacity, run the
 * allocator, review proposals, and commit them via overlay PUTs (which mirror
 * to the PM API). Also offers Roll-Over of incomplete tasks from the previous
 * sprint into the active sprint.
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import {
  currentSprint,
  neighbourSprint,
  sprintWindowsForYear,
  type SprintWindow,
} from '@/policy/pm/sprintWindows';
import {
  allocateSprint,
  rolloverSprint,
  type AllocatorAssignee,
  type AllocationProposal,
} from '@/policy/pm/scheduling/sprintAllocator';
import { isPersonalTask, type Task } from '@/policy/pm/types';

const DEFAULT_CAPACITY = 20;

function ownerOf(t: Task): string | undefined {
  if (isPersonalTask(t)) return t.owner_user_id;
  return (t as { assigned_user_id?: string }).assigned_user_id;
}

export function SprintPlanPage(): ReactElement {
  const allTasks = useProjectedTasks('full');
  const overlay = usePmOverlayStore();

  const today = useMemo(() => currentSprint(), []);
  const [sprintId, setSprintId] = useState<string>(today.id);

  const year = Number(sprintId.slice(0, 4));
  const allSprintsThisYear = useMemo(() => sprintWindowsForYear(year), [year]);
  const sprint: SprintWindow = allSprintsThisYear.find(s => s.id === sprintId) ?? today;

  // Hydrate stores once.
  useEffect(() => {
    void usePmOverlayStore.getState().hydrateFromApi();
    void usePmPersonalStore.getState().hydrateFromApi();
  }, []);

  // Build assignee list from tasks present in the workspace.
  const knownOwners = useMemo(() => {
    const s = new Set<string>();
    for (const t of allTasks) {
      const o = ownerOf(t);
      if (o) s.add(o);
    }
    if (s.size === 0) s.add('me');
    return Array.from(s).sort();
  }, [allTasks]);

  const [capacity, setCapacity] = useState<Record<string, number>>({});
  useEffect(() => {
    setCapacity(prev => {
      const next: Record<string, number> = { ...prev };
      for (const o of knownOwners) if (next[o] === undefined) next[o] = DEFAULT_CAPACITY;
      return next;
    });
  }, [knownOwners]);

  const assignees: AllocatorAssignee[] = useMemo(
    () => knownOwners.map(u => ({ user_id: u, capacity_points: capacity[u] ?? DEFAULT_CAPACITY })),
    [knownOwners, capacity],
  );

  // Existing pinned vs candidate pool.
  const pinned = useMemo(() => allTasks.filter(t => t.sprint_id === sprintId), [allTasks, sprintId]);
  const candidates = useMemo(
    () => allTasks.filter(t => t.sprint_id !== sprintId && t.status !== 'done'),
    [allTasks, sprintId],
  );

  const [proposals, setProposals] = useState<AllocationProposal[]>([]);
  const [unplaced, setUnplaced] = useState<Array<{ task_id: string; reason: string }>>([]);
  const [loads, setLoads] = useState<Record<string, { used: number; capacity: number; remaining: number }>>({});
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const runAllocator = () => {
    const r = allocateSprint({ sprint, assignees, candidates, existingPinned: pinned });
    setProposals(r.proposals);
    setUnplaced(r.unplaced);
    setLoads(r.loads);
    setAccepted(new Set(r.proposals.map(p => p.task_id)));
  };

  const commitAccepted = () => {
    let n = 0;
    for (const p of proposals) {
      if (!accepted.has(p.task_id)) continue;
      // Pin task to this sprint via overlay.
      overlay.pinToSprint(p.task_id, sprintId, 'sprint-plan');
      n++;
    }
    alert(`Committed ${n} proposals to ${sprintId}.`);
  };

  // Roll-over from previous sprint.
  const previous = useMemo(() => neighbourSprint(sprintId, -1), [sprintId]);
  const rolloverPlan = useMemo(
    () => rolloverSprint({ fromSprint: previous, toSprint: sprint, tasks: allTasks }),
    [previous, sprint, allTasks],
  );
  const commitRollover = () => {
    let n = 0;
    for (const r of rolloverPlan) {
      overlay.pinToSprint(r.task_id, r.to_sprint, 'rollover');
      n++;
    }
    alert(`Rolled ${n} task(s) from ${previous.id} → ${sprint.id}.`);
  };

  return (
    <div className="p-6 text-white max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sprint Planner</h1>
          <p className="text-sm text-white/60">
            Capacity-aware allocator for {sprint.id} ({sprint.startDate} → {sprint.endDate})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSprintId(neighbourSprint(sprintId, -1).id)}
            className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm border border-white/10"
          >
            ← Prev
          </button>
          <select
            value={sprintId}
            onChange={e => setSprintId(e.target.value)}
            title="Choose sprint"
            className="px-3 py-1.5 rounded-md bg-[#1a1f2e] border border-white/10 text-sm"
          >
            {allSprintsThisYear.map(s => (
              <option key={s.id} value={s.id}>
                {s.id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSprintId(neighbourSprint(sprintId, 1).id)}
            className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-sm border border-white/10"
          >
            Next →
          </button>
        </div>
      </header>

      {/* Capacity config */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
          Per-Assignee Capacity (story points)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {knownOwners.map(u => (
            <label key={u} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{u}</span>
              <input
                type="number"
                min={0}
                value={capacity[u] ?? DEFAULT_CAPACITY}
                onChange={e =>
                  setCapacity(c => ({ ...c, [u]: Number(e.target.value) || 0 }))
                }
                className="w-24 px-2 py-1 rounded-md bg-[#1a1f2e] border border-white/10 text-right"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={runAllocator}
            className="px-4 py-2 rounded-md bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/30 text-cyan-100 text-sm font-semibold"
          >
            Run Allocator
          </button>
          <button
            type="button"
            onClick={commitAccepted}
            disabled={proposals.length === 0}
            className="px-4 py-2 rounded-md bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30 text-emerald-100 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Commit Accepted ({accepted.size})
          </button>
          <button
            type="button"
            onClick={commitRollover}
            disabled={rolloverPlan.length === 0}
            className="px-4 py-2 rounded-md bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/30 text-amber-100 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Roll Over from {previous.id} ({rolloverPlan.length})
          </button>
        </div>
      </section>

      {/* Loads */}
      {Object.keys(loads).length > 0 && (
        <section className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
            Projected Loads (after applying accepted proposals)
          </h2>
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="text-left py-1">Assignee</th>
                <th className="text-right">Used</th>
                <th className="text-right">Capacity</th>
                <th className="text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(loads).map(([u, l]) => (
                <tr key={u} className="border-t border-white/5">
                  <td className="py-1">{u}</td>
                  <td className="text-right">{l.used}</td>
                  <td className="text-right">{l.capacity}</td>
                  <td className={`text-right ${l.remaining < 0 ? 'text-pink-300' : 'text-emerald-200'}`}>
                    {l.remaining}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Proposals */}
      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70 mb-3">
          Proposals ({proposals.length})
        </h2>
        {proposals.length === 0 ? (
          <p className="text-sm text-white/40">Click <em>Run Allocator</em> to compute proposals.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {proposals.map(p => {
              const t = allTasks.find(x => x.task_id === p.task_id);
              const isAccepted = accepted.has(p.task_id);
              return (
                <li key={p.task_id} className="py-2 flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={() => {
                      setAccepted(prev => {
                        const next = new Set(prev);
                        if (next.has(p.task_id)) next.delete(p.task_id);
                        else next.add(p.task_id);
                        return next;
                      });
                    }}
                    aria-label={`Accept proposal for ${p.task_id}`}
                  />
                  <span className="font-mono text-xs text-white/50 w-48 truncate">{p.task_id}</span>
                  <span className="flex-1 truncate">{t?.title ?? '(unknown)'}</span>
                  <span className="text-xs text-white/60">{p.user_id}</span>
                  <span className="text-xs text-cyan-200">{p.points}pt</span>
                  <span className="text-xs text-white/40">{p.reason}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Unplaced */}
      {unplaced.length > 0 && (
        <section className="rounded-lg border border-pink-500/30 bg-pink-500/10 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-pink-200 mb-3">
            Could Not Place ({unplaced.length})
          </h2>
          <ul className="space-y-1 text-sm">
            {unplaced.slice(0, 25).map(u => (
              <li key={u.task_id} className="flex gap-3">
                <span className="font-mono text-xs text-white/50 w-48 truncate">{u.task_id}</span>
                <span className="text-pink-200">{u.reason}</span>
              </li>
            ))}
            {unplaced.length > 25 && (
              <li className="text-white/40 text-xs">… {unplaced.length - 25} more</li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
