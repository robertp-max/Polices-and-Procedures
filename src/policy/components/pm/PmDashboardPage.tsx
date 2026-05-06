/**
 * PmDashboardPage — Phase 7
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Reporting.md (demo cut)
 *
 * Three lightweight charts rendered with inline SVG (no chart lib):
 *   1. Sprint burndown — daily remaining points across the active sprint.
 *   2. Throughput      — points completed per sprint, last 6 sprints.
 *   3. Status mix      — current distribution by PmTaskStatus.
 *
 * Pure read of the projection + overlay; no writes.
 */

import { useMemo, useState, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { currentSprint, neighbourSprint, sprintForDate } from '@/policy/pm/sprintWindows';
import type { PmTaskStatus, Task } from '@/policy/pm/types';

const STATUS_COLOR: Record<PmTaskStatus, string> = {
  todo: '#94a3b8',
  in_progress: '#38bdf8',
  in_review: '#fbbf24',
  blocked: '#ec4899',
  done: '#34d399',
};

const STATUS_LABEL: Record<PmTaskStatus, string> = {
  todo: 'To-Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
};

interface DayPoint { date: string; remaining: number; ideal: number; }

function isoDays(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const s = new Date(startISO + 'T00:00:00Z');
  const e = new Date(endISO + 'T00:00:00Z');
  for (let d = s.getTime(); d <= e.getTime(); d += 86_400_000) {
    out.push(new Date(d).toISOString().slice(0, 10));
  }
  return out;
}

function pts(t: Task): number {
  return typeof t.story_points === 'number' && t.story_points > 0 ? t.story_points : 1;
}

function buildBurndown(tasks: Task[], sprintId: string, startDate: string, endDate: string): DayPoint[] {
  const sprintTasks = tasks.filter(t => t.sprint_id === sprintId);
  const totalPts = sprintTasks.reduce((acc, t) => acc + pts(t), 0);
  const days = isoDays(startDate, endDate);
  const today = new Date().toISOString().slice(0, 10);

  // Approximate "completed by day": use t.updated_at if status==done, else null.
  // For tasks without updated_at, count as completed at endDate if done.
  const completedOnDay = new Map<string, number>();
  for (const t of sprintTasks) {
    if (t.status !== 'done') continue;
    const day = (((t as { updated_at?: string }).updated_at) || endDate).slice(0, 10);
    completedOnDay.set(day, (completedOnDay.get(day) || 0) + pts(t));
  }

  let cum = 0;
  return days.map((day, i) => {
    cum += completedOnDay.get(day) || 0;
    const remaining = day <= today ? Math.max(0, totalPts - cum) : Math.max(0, totalPts - cum);
    const idealStep = totalPts / Math.max(1, days.length - 1);
    const ideal = Math.max(0, totalPts - idealStep * i);
    return { date: day, remaining, ideal };
  });
}

interface ThroughputBar { sprintId: string; completed: number; }

function buildThroughput(tasks: Task[], anchorSprintId: string, count = 6): ThroughputBar[] {
  const ids: string[] = [];
  let id = anchorSprintId;
  for (let i = 0; i < count; i++) {
    ids.unshift(id);
    id = neighbourSprint(id, -1).id;
  }
  return ids.map(sid => ({
    sprintId: sid,
    completed: tasks
      .filter(t => t.sprint_id === sid && t.status === 'done')
      .reduce((acc, t) => acc + pts(t), 0),
  }));
}

export function PmDashboardPage(): ReactElement {
  const tasks = useProjectedTasks('full');
  const today = currentSprint();
  const [sprintId, setSprintId] = useState<string>(today.id);

  const sprint = useMemo(() => sprintForDate(`${sprintId.split('-')[0]}-01-15`), [sprintId]);
  // sprintForDate expects an ISO date; cheap re-derive from id by walking neighbours.
  const sprintWindow = useMemo(() => {
    let cur = today;
    if (sprintId === today.id) return cur;
    // Walk forward/back up to 26 steps.
    for (let i = 0; i < 26; i++) {
      if (cur.id === sprintId) return cur;
      cur = neighbourSprint(cur.id, cur.id < sprintId ? 1 : -1);
    }
    return today;
  }, [sprintId, today]);
  void sprint;

  const burndown = useMemo(
    () => buildBurndown(tasks, sprintWindow.id, sprintWindow.startDate, sprintWindow.endDate),
    [tasks, sprintWindow],
  );
  const throughput = useMemo(() => buildThroughput(tasks, sprintWindow.id, 6), [tasks, sprintWindow]);

  const statusMix = useMemo(() => {
    const counts: Record<PmTaskStatus, number> = {
      todo: 0, in_progress: 0, in_review: 0, blocked: 0, done: 0,
    };
    for (const t of tasks.filter(t => t.sprint_id === sprintWindow.id)) {
      counts[t.status]++;
    }
    return counts;
  }, [tasks, sprintWindow]);

  const totalForBurndown = burndown[0]?.ideal ?? 0;
  const maxThroughput = Math.max(1, ...throughput.map(b => b.completed));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/55">
            PM Reporting
          </div>
          <h1 className="text-2xl font-outfit text-white mt-1">Sprint Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSprintId(neighbourSprint(sprintId, -1).id)}
            className="px-2 py-1 rounded border border-white/10 text-sm hover:bg-white/5"
          >
            ←
          </button>
          <span className="font-mono text-sm text-white/85">{sprintWindow.id}</span>
          <button
            type="button"
            onClick={() => setSprintId(neighbourSprint(sprintId, 1).id)}
            className="px-2 py-1 rounded border border-white/10 text-sm hover:bg-white/5"
          >
            →
          </button>
        </div>
      </header>

      {/* Burndown */}
      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-montserrat font-bold uppercase tracking-[0.22em] text-white/65 mb-2">
          Burndown · {totalForBurndown.toFixed(0)} pts committed
        </h2>
        <Burndown points={burndown} />
      </section>

      {/* Throughput */}
      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-montserrat font-bold uppercase tracking-[0.22em] text-white/65 mb-2">
          Throughput · last {throughput.length} sprints
        </h2>
        <div className="flex items-end gap-3 h-40">
          {throughput.map(b => (
            <div key={b.sprintId} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-cyan-400/70"
                style={{ height: `${(b.completed / maxThroughput) * 100}%`, minHeight: 2 }}
                title={`${b.sprintId}: ${b.completed} pts`}
              />
              <div className="text-[10px] font-mono text-white/55">{b.sprintId.split('-')[1]}</div>
              <div className="text-[10px] text-white/75">{b.completed}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Status mix */}
      <section className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-sm font-montserrat font-bold uppercase tracking-[0.22em] text-white/65 mb-3">
          Status Mix · {sprintWindow.id}
        </h2>
        <StatusMix counts={statusMix} />
      </section>
    </div>
  );
}

function Burndown({ points }: { points: DayPoint[] }): ReactElement {
  if (points.length === 0) return <div className="text-white/55 text-sm">No data.</div>;
  const W = 720, H = 200, PAD = 28;
  const max = Math.max(1, ...points.map(p => Math.max(p.ideal, p.remaining)));
  const x = (i: number) => PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const ideal = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.ideal).toFixed(1)}`).join(' ');
  const actual = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.remaining).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-48">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" />
      <path d={ideal} fill="none" stroke="rgba(255,255,255,0.35)" strokeDasharray="4 4" strokeWidth="1.5" />
      <path d={actual} fill="none" stroke="#38bdf8" strokeWidth="2" />
      <text x={PAD} y={PAD - 6} fill="rgba(255,255,255,0.5)" fontSize="10">{max.toFixed(0)} pts</text>
      <text x={W - PAD - 60} y={H - PAD + 14} fill="rgba(255,255,255,0.5)" fontSize="10">
        {points[points.length - 1]?.date}
      </text>
    </svg>
  );
}

function StatusMix({ counts }: { counts: Record<PmTaskStatus, number> }): ReactElement {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return <div className="text-white/55 text-sm">No tasks in sprint.</div>;
  return (
    <div>
      <div className="flex h-3 rounded overflow-hidden">
        {(Object.keys(counts) as PmTaskStatus[]).map(k => (
          <div
            key={k}
            style={{ width: `${(counts[k] / total) * 100}%`, background: STATUS_COLOR[k] }}
            title={`${STATUS_LABEL[k]}: ${counts[k]}`}
          />
        ))}
      </div>
      <ul className="mt-3 grid grid-cols-5 gap-2 text-[11px]">
        {(Object.keys(counts) as PmTaskStatus[]).map(k => (
          <li key={k} className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded" style={{ background: STATUS_COLOR[k] }} />
            <span className="text-white/65">{STATUS_LABEL[k]}</span>
            <span className="ml-auto font-mono text-white/85">{counts[k]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
