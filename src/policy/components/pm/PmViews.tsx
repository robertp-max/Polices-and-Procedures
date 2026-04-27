/**
 * PM views — Kanban, Gantt, Sprint Board.
 *
 * All views render the SAME canonical Task[] from `useProjectedTasks()`.
 * Clicking any task fires `onSelect(task_id)`.
 *
 * Implementation summary:
 *   - KanbanView      → @dnd-kit DnD with strict drag-rules matrix
 *                       (CES tasks: only Todo↔In Progress; Personal: free)
 *   - GanttView       → SVG timeline + dependency arrows + drag-to-link
 *                       + critical-path highlight
 *   - SprintBoardView → sprint-scoped Kanban with burndown widget
 *
 * No CES writes. Personal status writes go through pmPersonalStore;
 * dependency edits go through pmOverlayStore (with cycle protection).
 *
 * Spec refs:
 *   PM-Kanban-and-My-Tasks.md §3.3 (drag rules matrix)
 *   PM-Dependency-Graph.md §3 (critical path, cycles)
 *   PM-Sprint-Board-Design.md §3 (Plan/Execute/Review)
 */

import { useMemo, useRef, useState, type ReactElement } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PM_TASK_STATUS_LABEL } from '@/policy/pm/ecignStatusMap';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { usePmOverlayStore } from '@/policy/pm/pmOverlayStore';
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import {
  isCesTask,
  isPersonalTask,
  type PmTaskStatus,
  type Task,
} from '@/policy/pm/types';
import { useComplianceExecution } from '@/policy/compliance-execution';
import {
  criticalPath,
  CycleError,
  type PmEdge,
} from '@/policy/pm/scheduling/dependencyGraph';
import { PmTaskCard } from './PmTaskCard';

const EMPTY_MSG = 'No CES tasks available for this view.';
const STATUS_ORDER: PmTaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'done'];
const STATUS_COLOR: Record<PmTaskStatus, string> = {
  todo: 'rgba(148,163,184,0.85)',
  in_progress: 'rgba(56,189,248,0.85)',
  in_review: 'rgba(251,191,36,0.85)',
  blocked: 'rgba(244,114,182,0.9)',
  done: 'rgba(45,212,191,0.9)',
};

/* ─── Drag-rules matrix (PM-Kanban-and-My-Tasks.md §3.3) ───────────── */
function isDropAllowed(
  task: Task,
  target: PmTaskStatus,
): { ok: true } | { ok: false; reason: string } {
  if (task.status === target) return { ok: true };
  if (isPersonalTask(task)) return { ok: true };
  if (target === 'in_progress' && task.status === 'todo') return { ok: true };
  if (target === 'todo' && task.status === 'in_progress') return { ok: true };
  return {
    ok: false,
    reason: 'This status is managed by CES/eCIgn. Open the task to take the required action.',
  };
}

function EmptyState({ message = EMPTY_MSG }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-white/55 text-[12px] font-outfit">
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KANBAN VIEW (Phase 2)
   ═══════════════════════════════════════════════════════════════ */

function DraggableTaskCard({
  task,
  onSelect,
}: {
  task: Task;
  onSelect: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.task_id,
    data: { task },
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
    >
      <PmTaskCard
        task={task}
        onSelect={onSelect}
        compact
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function KanbanColumn({
  status,
  items,
  onSelect,
}: {
  status: PmTaskStatus;
  items: Task[];
  onSelect: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${status}` });
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-h-0 rounded-lg border bg-white/[0.02] transition-colors"
      style={{
        borderColor: isOver ? 'rgba(56,189,248,0.6)' : 'rgba(255,255,255,0.1)',
      }}
    >
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/85">
          {PM_TASK_STATUS_LABEL[status]}
        </span>
        <span className="text-[10px] font-mono text-white/55">{items.length}</span>
      </header>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="text-[10px] text-white/35 font-outfit text-center py-4">—</div>
        ) : (
          items.map(t => (
            <DraggableTaskCard key={t.task_id} task={t} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanView({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}): ReactElement {
  const tasks = useProjectedTasks();
  const personal = usePmPersonalStore();
  const [toast, setToast] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const columns = useMemo(() => {
    const map: Record<PmTaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      blocked: [],
      done: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return STATUS_ORDER.map(status => ({ status, items: map[status] }));
  }, [tasks]);

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id;
    if (!overId || typeof overId !== 'string' || !overId.startsWith('col:')) return;
    const target = overId.slice(4) as PmTaskStatus;
    const task = tasks.find(t => t.task_id === e.active.id);
    if (!task) return;
    const rule = isDropAllowed(task, target);
    if (!rule.ok) {
      setToast(rule.reason);
      window.setTimeout(() => setToast(null), 4000);
      return;
    }
    if (isPersonalTask(task)) {
      personal.setStatus(task.task_id, target, 'kanban-drag');
    }
    // CES status_hint write deferred until backend (PM-Kanban-and-My-Tasks §3.3 / §5).
  };

  if (tasks.length === 0) return <EmptyState />;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="flex-1 grid gap-3 min-h-0 overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}
        >
          {columns.map(col => (
            <KanbanColumn key={col.status} {...col} onSelect={onSelect} />
          ))}
        </div>
      </DndContext>
      {toast && (
        <div
          role="alert"
          className="self-end max-w-[420px] rounded-lg border border-pink-400/40 bg-pink-500/15 px-3 py-2 text-[11px] font-outfit text-pink-100"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GANTT VIEW (Phase 5)
   ═══════════════════════════════════════════════════════════════ */

const ROW_H = 32;
const NAME_W = 220;
const DAY_PX = 32;

export function GanttView({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}): ReactElement {
  const tasks = useProjectedTasks();
  const ces = useComplianceExecution();
  const overlay = usePmOverlayStore();
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sprintStart = new Date(ces.activeSprint.startDate + 'T00:00:00').getTime();
  const sprintEnd = new Date(ces.activeSprint.endDate + 'T23:59:59').getTime();
  const winStart = new Date(sprintStart - 7 * 86400000);
  const winEnd = new Date(sprintEnd + 7 * 86400000);
  const dayMs = 86400000;
  const totalDays = Math.max(
    1,
    Math.round((winEnd.getTime() - winStart.getTime()) / dayMs) + 1,
  );

  const taskBars = useMemo(() => {
    return tasks
      .map(t => {
        const dueIso = t.due_date;
        if (!dueIso) return null;
        const due = new Date(dueIso + (dueIso.length === 10 ? 'T00:00:00' : '')).getTime();
        if (Number.isNaN(due)) return null;
        const offsetDays = Math.round((due - winStart.getTime()) / dayMs);
        if (offsetDays < 0 || offsetDays > totalDays) return null;
        return { task: t, offsetDays };
      })
      .filter((x): x is { task: Task; offsetDays: number } => x !== null)
      .sort((a, b) => {
        const ea = (a.task as { event_id?: string }).event_id ?? '';
        const eb = (b.task as { event_id?: string }).event_id ?? '';
        if (ea !== eb) return ea.localeCompare(eb);
        return a.task.task_id.localeCompare(b.task.task_id);
      });
  }, [tasks, winStart, totalDays]);

  /* Build group header rows so the Gantt is grouped by event/workflow. */
  type GroupRow =
    | { kind: 'group'; key: string; eventId: string; workflowId?: string; count: number }
    | { kind: 'bar'; key: string; bar: { task: Task; offsetDays: number } };
  const rows: GroupRow[] = useMemo(() => {
    const out: GroupRow[] = [];
    let lastEvent: string | null = null;
    let groupAcc: typeof taskBars = [];
    const flush = () => {
      if (groupAcc.length === 0) return;
      const ev = (groupAcc[0].task as { event_id?: string; workflow_id?: string });
      out.push({
        kind: 'group',
        key: `g:${ev.event_id ?? 'orphan'}`,
        eventId: ev.event_id ?? 'orphan',
        workflowId: ev.workflow_id,
        count: groupAcc.length,
      });
      for (const b of groupAcc) {
        out.push({ kind: 'bar', key: b.task.task_id, bar: b });
      }
      groupAcc = [];
    };
    for (const b of taskBars) {
      const ev = (b.task as { event_id?: string }).event_id ?? 'orphan';
      if (ev !== lastEvent) {
        flush();
        lastEvent = ev;
      }
      groupAcc.push(b);
    }
    flush();
    return out;
  }, [taskBars]);

  const edges: PmEdge[] = useMemo(() => {
    const out: PmEdge[] = [];
    for (const t of tasks) {
      for (const dep of t.dependencies ?? []) {
        out.push({ from: dep, to: t.task_id });
      }
    }
    return out;
  }, [tasks]);

  const cp = useMemo(() => {
    try {
      return criticalPath(tasks.map(t => t.task_id), edges);
    } catch {
      return { nodes: new Set<string>(), length: 0 };
    }
  }, [tasks, edges]);

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    let idx = 0;
    for (const r of rows) {
      if (r.kind === 'bar') {
        m.set(r.bar.task.task_id, idx);
        idx++;
      } else {
        idx++; // group rows occupy a slot too
      }
    }
    return m;
  }, [rows]);

  if (tasks.length === 0) return <EmptyState />;
  if (taskBars.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-1 text-white/55 text-[12px] font-outfit">
        <div>{EMPTY_MSG}</div>
        <div className="text-[10px] text-white/40">
          (Projected tasks have no due dates inside the active sprint window.)
        </div>
      </div>
    );
  }

  const handleBarClick = (taskId: string) => {
    if (!linkMode) {
      onSelect(taskId);
      return;
    }
    if (!linkSource) {
      setLinkSource(taskId);
      return;
    }
    if (linkSource === taskId) {
      setLinkSource(null);
      return;
    }
    try {
      overlay.addDependency(taskId, linkSource, 'gantt-link');
      setToast(`Linked ${linkSource} → ${taskId}`);
    } catch (err) {
      const msg = err instanceof CycleError ? err.message : 'Failed to add dependency.';
      setToast(msg);
    } finally {
      setLinkSource(null);
      setLinkMode(false);
      window.setTimeout(() => setToast(null), 4000);
    }
  };

  const totalWidth = NAME_W + totalDays * DAY_PX;
  const totalHeight = (rows.length + 1) * ROW_H;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setLinkMode(m => !m);
            setLinkSource(null);
          }}
          className={`text-[10px] uppercase tracking-[0.22em] px-2 py-1 rounded-sm border transition-colors ${
            linkMode
              ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-100'
              : 'bg-white/5 border-white/15 text-white/65 hover:text-white'
          }`}
          title="Click to enter link mode, then click predecessor + successor."
        >
          {linkMode ? 'Cancel link mode' : '+ Link tasks'}
        </button>
        {linkMode && !linkSource && (
          <span className="text-[10px] font-mono text-cyan-200">
            Click the predecessor task first
          </span>
        )}
        {linkMode && linkSource && (
          <span className="text-[10px] font-mono text-cyan-200">
            From: {linkSource} → click successor task
          </span>
        )}
        {cp.nodes.size > 0 && (
          <span className="ml-auto text-[10px] font-mono text-amber-300">
            Critical path: {cp.nodes.size} task(s)
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto rounded-lg border border-white/10 bg-white/[0.02]"
      >
        <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
          <div
            className="grid border-b border-white/10 sticky top-0 bg-[#0d1117] z-10"
            style={{
              gridTemplateColumns: `${NAME_W}px repeat(${totalDays}, ${DAY_PX}px)`,
              height: ROW_H,
            }}
          >
            <div className="px-3 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/65">
              Task
            </div>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = new Date(winStart.getTime() + i * dayMs);
              const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
              return (
                <div
                  key={i}
                  className="text-[9px] font-mono text-center py-2 border-l border-white/[0.04]"
                  style={{
                    color: isWeekend ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
                    background: isWeekend ? 'rgba(255,255,255,0.02)' : undefined,
                  }}
                  title={d.toDateString()}
                >
                  {d.getUTCDate()}
                </div>
              );
            })}
          </div>

          {rows.map((row, rowIdx) => {
            const top = (rowIdx + 1) * ROW_H;
            if (row.kind === 'group') {
              return (
                <div
                  key={row.key}
                  className="absolute left-0 right-0 grid border-b border-white/10 bg-white/[0.04]"
                  style={{
                    top,
                    height: ROW_H,
                    gridTemplateColumns: `${NAME_W}px repeat(${totalDays}, ${DAY_PX}px)`,
                  }}
                >
                  <div className="px-3 flex items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.18em] text-white/70 truncate">
                    <span className="text-cyan-300/85">▸</span>
                    <span className="truncate" title={row.eventId}>{row.eventId}</span>
                    {row.workflowId && (
                      <span className="text-white/40 font-mono normal-case tracking-normal">
                        · {row.workflowId}
                      </span>
                    )}
                    <span className="text-white/40 font-mono normal-case tracking-normal">
                      · {row.count}
                    </span>
                  </div>
                  <div
                    style={{ gridColumn: `2 / span ${totalDays}` }}
                    className="border-l border-white/[0.04]"
                  />
                </div>
              );
            }
            const { task, offsetDays } = row.bar;
            const onCp = cp.nodes.has(task.task_id);
            const isLinkSrc = linkSource === task.task_id;
            return (
              <div
                key={task.task_id}
                className="absolute left-0 right-0 grid border-b border-white/[0.04] hover:bg-white/[0.03]"
                style={{
                  top,
                  height: ROW_H,
                  gridTemplateColumns: `${NAME_W}px repeat(${totalDays}, ${DAY_PX}px)`,
                }}
              >
                <button
                  type="button"
                  onClick={() => handleBarClick(task.task_id)}
                  className="px-3 text-left min-w-0"
                  title={task.task_id}
                >
                  <div className="text-[11px] font-outfit text-white truncate">
                    {task.title}
                  </div>
                  <div className="text-[9px] font-mono text-white/40 truncate">
                    {task.task_id}
                  </div>
                </button>
                {Array.from({ length: totalDays }).map((_, i) => (
                  <div key={i} className="border-l border-white/[0.03] relative">
                    {i === offsetDays && (
                      <button
                        type="button"
                        onClick={() => handleBarClick(task.task_id)}
                        className="absolute inset-y-1 left-0 right-0 rounded-sm hover:brightness-125"
                        style={{
                          background: STATUS_COLOR[task.status],
                          border: onCp ? '1px solid rgba(251,191,36,0.95)' : undefined,
                          boxShadow: isLinkSrc ? '0 0 0 2px rgba(56,189,248,0.7)' : undefined,
                        }}
                        aria-label={`${task.title} due ${task.due_date}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          <svg
            className="absolute inset-0 pointer-events-none"
            width={totalWidth}
            height={totalHeight}
          >
            <defs>
              <marker
                id="dep-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(251,191,36,0.85)" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const fromIdx = indexById.get(e.from);
              const toIdx = indexById.get(e.to);
              if (fromIdx === undefined || toIdx === undefined) return null;
              const fromRow = rows[fromIdx];
              const toRow = rows[toIdx];
              if (fromRow?.kind !== 'bar' || toRow?.kind !== 'bar') return null;
              const fromBar = fromRow.bar;
              const toBar = toRow.bar;
              const x1 = NAME_W + fromBar.offsetDays * DAY_PX + DAY_PX;
              const y1 = (fromIdx + 1) * ROW_H + ROW_H / 2;
              const x2 = NAME_W + toBar.offsetDays * DAY_PX;
              const y2 = (toIdx + 1) * ROW_H + ROW_H / 2;
              const onCpEdge = cp.nodes.has(e.from) && cp.nodes.has(e.to);
              return (
                <path
                  key={`${e.from}-${e.to}-${i}`}
                  d={`M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}`}
                  stroke={onCpEdge ? 'rgba(251,191,36,0.85)' : 'rgba(148,163,184,0.55)'}
                  strokeWidth={onCpEdge ? 2 : 1.25}
                  fill="none"
                  markerEnd="url(#dep-arrow)"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {toast && (
        <div
          role="alert"
          className="self-end max-w-[420px] rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-[11px] font-outfit text-cyan-100"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPRINT BOARD VIEW (Phase 3 partial: Execute tab + Burndown)
   ═══════════════════════════════════════════════════════════════ */

export function SprintBoardView({
  onSelect,
}: {
  onSelect: (taskId: string) => void;
}): ReactElement {
  const tasks = useProjectedTasks();
  const personal = usePmPersonalStore();
  const ces = useComplianceExecution();
  const [toast, setToast] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const sprintStart = new Date(ces.activeSprint.startDate + 'T00:00:00').getTime();
  const sprintEnd = new Date(ces.activeSprint.endDate + 'T23:59:59').getTime();
  const sprintId = ces.activeSprint.id;

  const sprintTasks = useMemo(() => {
    return tasks.filter(t => {
      if (t.sprint_id === sprintId) return true;
      if (!t.due_date) return false;
      const due = new Date(t.due_date + (t.due_date.length === 10 ? 'T00:00:00' : '')).getTime();
      return due >= sprintStart && due <= sprintEnd;
    });
  }, [tasks, sprintId, sprintStart, sprintEnd]);

  const columns = useMemo(() => {
    const map: Record<PmTaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      blocked: [],
      done: [],
    };
    for (const t of sprintTasks) map[t.status].push(t);
    return STATUS_ORDER.map(status => ({ status, items: map[status] }));
  }, [sprintTasks]);

  const burndown = useMemo(() => {
    const totalPoints = sprintTasks.reduce((s, t) => s + (t.story_points ?? 1), 0);
    const remainingPoints = sprintTasks
      .filter(t => t.status !== 'done')
      .reduce((s, t) => s + (t.story_points ?? 1), 0);
    const dayMs = 86400000;
    const days = Math.max(1, Math.round((sprintEnd - sprintStart) / dayMs) + 1);
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const elapsed = Math.max(0, Math.min(days, Math.round((todayMs - sprintStart) / dayMs)));
    const ideal = Math.max(0, totalPoints - (totalPoints / days) * elapsed);
    return { totalPoints, remainingPoints, days, elapsed, ideal };
  }, [sprintTasks, sprintStart, sprintEnd]);

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id;
    if (!overId || typeof overId !== 'string' || !overId.startsWith('col:')) return;
    const target = overId.slice(4) as PmTaskStatus;
    const task = sprintTasks.find(t => t.task_id === e.active.id);
    if (!task) return;
    const rule = isDropAllowed(task, target);
    if (!rule.ok) {
      setToast(rule.reason);
      window.setTimeout(() => setToast(null), 4000);
      return;
    }
    if (isPersonalTask(task)) personal.setStatus(task.task_id, target, 'sprint-drag');
  };

  if (sprintTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-1 text-white/55 text-[12px] font-outfit">
        <div>{EMPTY_MSG}</div>
        <div className="text-[10px] text-white/40">
          Active sprint: <span className="font-mono">{sprintId}</span> ·{' '}
          {ces.activeSprint.startDate} → {ces.activeSprint.endDate}
        </div>
      </div>
    );
  }

  const cesDone = sprintTasks.filter(t => isCesTask(t) && t.status === 'done').length;
  const cesTotal = sprintTasks.filter(t => isCesTask(t)).length;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] text-white/85">
          Sprint {sprintId}
        </span>
        <span className="text-[10px] font-mono text-white/55">
          {ces.activeSprint.startDate} → {ces.activeSprint.endDate}
        </span>
        <span className="text-[10px] font-mono text-white/55">
          · {sprintTasks.length} tasks
        </span>
        <span className="text-[10px] font-mono text-cyan-300 ml-auto">
          Compliance: {cesDone}/{cesTotal} done
        </span>
      </div>

      <Burndown {...burndown} />

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="flex-1 grid gap-3 min-h-0 overflow-hidden"
          style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}
        >
          {columns.map(col => (
            <KanbanColumn key={col.status} {...col} onSelect={onSelect} />
          ))}
        </div>
      </DndContext>

      {toast && (
        <div
          role="alert"
          className="self-end max-w-[420px] rounded-lg border border-pink-400/40 bg-pink-500/15 px-3 py-2 text-[11px] font-outfit text-pink-100"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Burndown({
  totalPoints,
  remainingPoints,
  days,
  elapsed,
  ideal,
}: {
  totalPoints: number;
  remainingPoints: number;
  days: number;
  elapsed: number;
  ideal: number;
}) {
  if (totalPoints === 0) return null;
  const pct = (remainingPoints / totalPoints) * 100;
  const idealPct = (ideal / totalPoints) * 100;
  const onTrack = remainingPoints <= ideal;
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="flex items-center justify-between text-[10px] font-mono text-white/55 mb-1.5">
        <span>
          Burndown · day {elapsed}/{days}
        </span>
        <span className={onTrack ? 'text-emerald-300' : 'text-pink-300'}>
          {remainingPoints} pt remaining (ideal {Math.round(ideal)})
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-cyan-400/80" style={{ width: `${pct}%` }} />
        <div
          className="absolute inset-y-0 w-px bg-amber-300"
          style={{ left: `${idealPct}%` }}
        />
      </div>
    </div>
  );
}
