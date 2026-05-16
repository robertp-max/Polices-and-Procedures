/**
 * PM views — Kanban, Gantt, Sprint Board.
 *
 * Kanban / Gantt / Sprint board render sprint-scoped tasks from `useProjectedTasks()` (default).
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

import { useEffect, useMemo, useState, type ReactElement } from 'react';
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
import { usePmPersonalStore } from '@/policy/pm/personalStore';
import {
  isPersonalTask,
  type PmTaskStatus,
  type Task,
} from '@/policy/pm/types';
import { PmTaskCard } from './PmTaskCard';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { EntityLink } from './EntityLink';
import { useShellStore } from '@/policy/stores/uiStore';
import { EmptyState as UiEmptyState, SurfaceCard } from '@/policy/components/ui';

const EMPTY_MSG = 'No CES tasks available for this view.';
const STATUS_ORDER: PmTaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'done'];

/* MVP-P1-CALENDAR-001 (Wave 4) — task-selection helpers consolidated into
 * `canonicalEventTaskFilter.ts`. The previous inline `EXECUTION_EXCLUDE_RE`,
 * `isExecutionTask`, and `bySelectedEvent` definitions now live in the
 * canonical module so all PM call sites (PmViews, EventTaskList, future
 * migrations) read from a single source of truth. The regex literal was
 * lifted byte-identical; behavior is unchanged.
 *
 * NOTE: no re-export here — the canonical module is the public surface.
 * react-refresh requires component files to export only components. */
import { selectExecutionTasksForEvent as bySelectedEvent } from '@/policy/ces/services/canonicalEventTaskFilter';

/* ─── Drag-rules matrix (PM-Kanban-and-My-Tasks.md §3.3) ───────────── */
function isDropAllowed(
  task: Task,
  target: PmTaskStatus,
): { ok: true } | { ok: false; reason: string } {
  if (task.status === target) return { ok: true };
  if (isPersonalTask(task)) return { ok: true };
  if (target === 'in_progress' && task.status === 'todo') return { ok: true };
  if (target === 'todo' && task.status === 'in_progress') return { ok: true };
  if (target === 'done') {
    return {
      ok: false,
      reason: 'Complete this task in the workflow execution panel — CES completion requires the full eCIgn sign-off flow.',
    };
  }
  return {
    ok: false,
    reason: 'This status is managed by CES/eCIgn. Open the task to take the required action.',
  };
}

function EmptyState({ message = EMPTY_MSG }: { message?: string }) {
  return (
    <SurfaceCard className="flex-1 flex items-center justify-center" padding="md">
      <UiEmptyState title={message} description="No projected workflow tasks in the current scope." />
    </SurfaceCard>
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
      className="flex flex-col min-h-0 rounded-lg border transition-colors ci-card"
      style={{
        borderColor: isOver ? 'var(--ci-accent)' : 'var(--ci-border)',
        background: 'var(--ci-surface-2)',
      }}
    >
      <header className="flex items-center justify-between px-3 py-2 border-b ci-border">
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em] ci-text">
          {PM_TASK_STATUS_LABEL[status]}
        </span>
        <span className="text-[10px] font-mono ci-text-subtle">{items.length}</span>
      </header>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="text-[10px] ci-text-subtle font-outfit text-center py-4">—</div>
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
  selectedEventId,
}: {
  onSelect: (taskId: string) => void;
  selectedEventId?: string | null;
}): ReactElement {
  const projected = useProjectedTasks();
  const tasks = useMemo(() => bySelectedEvent(projected, selectedEventId), [projected, selectedEventId]);
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
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
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
   GANTT VIEW — Event Grouped Product Pipeline
   ═══════════════════════════════════════════════════════════════ */

const GANTT_DAY_PX = 22;
const GANTT_EVENT_LABEL_W = 300;

type GanttTaskBar = {
  task: Task;
  startOffset: number;
  endOffset: number;
  durationDays: number;
  progressPct: number;
  overdue: boolean;
  tone: 'teal' | 'orange' | 'red' | 'gray';
};

type GanttEventGroup = {
  eventId: string;
  eventLabel: string;
  risk: 'low' | 'medium' | 'high';
  completionPct: number;
  taskCount: number;
  bars: GanttTaskBar[];
};

const parseIsoDate = (iso: string): Date => new Date(`${iso.slice(0, 10)}T00:00:00`);

const computeProgressPct = (task: Task): number => {
  if (task.status === 'done') return 100;
  if (task.status === 'in_review') return 80;
  if (task.status === 'in_progress') return 55;
  if (task.status === 'blocked') return 20;
  return 5;
};

const computeTaskTone = (task: Task): 'teal' | 'orange' | 'red' | 'gray' => {
  const due = parseIsoDate(task.due_date).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due < today.getTime() && task.status !== 'done';
  if (overdue || task.status === 'blocked') return 'red';
  if (task.status === 'in_review' || task.status === 'todo') return 'orange';
  if (task.status === 'in_progress' || task.status === 'done') return 'teal';
  return 'gray';
};

export function GanttView({
  onSelect,
  selectedEventId,
}: {
  onSelect: (taskId: string) => void;
  selectedEventId?: string | null;
}): ReactElement {
  const projected = useProjectedTasks();
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1920 : window.innerWidth));
  const tasks = useMemo(() => bySelectedEvent(projected, selectedEventId), [projected, selectedEventId]);
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Keep all hooks before any early return (tasks may load async). */
  const ganttModel = useMemo(() => {
    if (tasks.length === 0) return null;
    const dayMs = 86400000;
    const sprintStart = parseIsoDate(sprintWindow.startDate).getTime() - dayMs;
    const sprintEnd = parseIsoDate(sprintWindow.endDate).getTime() + 2 * dayMs;
    const tasksInWin = tasks.filter(t => {
      const s = parseIsoDate(t.start_date).getTime();
      const e = parseIsoDate(t.due_date).getTime();
      return e >= sprintStart && s <= sprintEnd;
    });
    if (tasksInWin.length === 0) return null;
    let winStartMs = sprintStart;
    let winEndMs = sprintEnd;
    const maxSpanMs = 22 * dayMs;
    if (winEndMs - winStartMs > maxSpanMs) {
      winEndMs = winStartMs + maxSpanMs;
    }
    const totalDays = Math.max(1, Math.floor((winEndMs - winStartMs) / dayMs) + 1);

    const grouped = new Map<string, Task[]>();
    tasksInWin.forEach(task => {
      const key = task.event_id ?? task.workflow_id ?? 'unlinked';
      const list = grouped.get(key) ?? [];
      list.push(task);
      grouped.set(key, list);
    });

    const eventGroups: GanttEventGroup[] = Array.from(grouped.entries()).map(([eventId, groupTasks]) => {
      const bars = groupTasks.map(task => {
        const start = parseIsoDate(task.start_date).getTime();
        const end = parseIsoDate(task.due_date).getTime();
        const startOffset = Math.max(0, Math.floor((start - winStartMs) / dayMs));
        const endOffset = Math.max(startOffset, Math.floor((end - winStartMs) / dayMs));
        const durationDays = Math.max(1, endOffset - startOffset + 1);
        const progressPct = computeProgressPct(task);
        const tone = computeTaskTone(task);
        const overdue = tone === 'red';
        return { task, startOffset, endOffset, durationDays, progressPct, overdue, tone };
      });
      const completed = groupTasks.filter(t => t.status === 'done').length;
      const completionPct = Math.round((completed / Math.max(1, groupTasks.length)) * 100);
      const hasHigh = bars.some(b => b.tone === 'red');
      const hasMedium = bars.some(b => b.tone === 'orange');
      const risk: GanttEventGroup['risk'] = hasHigh ? 'high' : hasMedium ? 'medium' : 'low';
      const eventLabel = groupTasks[0]?.event_title ?? eventId;
      return { eventId, eventLabel, risk, completionPct, taskCount: groupTasks.length, bars };
    });

    return { eventGroups, totalDays, timelineWidth: totalDays * GANTT_DAY_PX };
  }, [tasks, sprintWindow.endDate, sprintWindow.startDate]);

  if (!ganttModel) {
    return (
      <EmptyState
        message={tasks.length === 0 ? EMPTY_MSG : 'No tasks overlap the selected sprint. Try another sprint or widen filters.'}
      />
    );
  }

  const { eventGroups, totalDays, timelineWidth } = ganttModel;
  const gridLines = Array.from({ length: totalDays });

  if (isMobile) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {eventGroups.map(group => (
          <section key={group.eventId} className="ci-card p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold ci-text truncate">{group.eventLabel}</h3>
              <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${group.risk === 'high' ? 'bg-red-100 text-red-700' : group.risk === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                {group.risk} risk
              </span>
            </div>
            <p className="text-[11px] ci-text-muted mt-1">{group.taskCount} tasks · {group.completionPct}% complete</p>
            <div className="mt-3 space-y-2">
              {group.bars.map(bar => (
                <button key={bar.task.task_id} type="button" onClick={() => onSelect(bar.task.task_id)} className="w-full text-left rounded-lg border border-slate-200 p-2.5 bg-white">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold ci-text truncate">{bar.task.title}</p>
                    <span className="text-[10px] ci-text-muted">{bar.durationDays}d</span>
                  </div>
                  <p className="text-[10px] ci-text-muted mt-1">{bar.task.assignee ?? bar.task.owner ?? 'Unassigned'} · {bar.task.due_date}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    {/* Wave 7 T3: untoned-tone fallback uses canonical --ci-border-strong instead of
                       the slate-pinned palette to clear the pm.slate-pin verifier warning. */}
                    <div className={`h-full ${bar.tone === 'red' ? 'bg-red-500' : bar.tone === 'orange' ? 'bg-orange-500' : bar.tone === 'teal' ? 'bg-teal-600' : 'bg-[var(--ci-border-strong)]'}`} style={{ width: `${bar.progressPct}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
        <div className="grid" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px` }}>
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-500">Event Pipeline</div>
          <div className="relative h-8">
            <div className="absolute inset-0 flex">
              {gridLines.map((_, idx) => (
                <div key={idx} className="border-l border-slate-200/70 text-[9px] text-slate-500 font-mono text-center" style={{ width: GANTT_DAY_PX, lineHeight: '32px' }}>
                  {idx % 7 === 0 ? idx + 1 : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        {eventGroups.map(group => (
          <section key={group.eventId} className="mb-3 rounded-lg border border-slate-200 overflow-hidden">
            <div className="grid items-center border-b border-slate-200 bg-slate-50" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px` }}>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{group.eventLabel}</h3>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full ${group.risk === 'high' ? 'bg-red-100 text-red-700' : group.risk === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {group.risk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{group.taskCount} tasks · {group.completionPct}% complete</p>
              </div>
              <div />
            </div>

            {group.bars.map(bar => (
              <div key={bar.task.task_id} className="grid border-b last:border-b-0 border-slate-100" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px` }}>
                <button type="button" onClick={() => onSelect(bar.task.task_id)} className="px-3 py-2 text-left hover:bg-slate-50">
                  <p className="text-[12px] font-medium text-slate-900 truncate">{bar.task.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {bar.task.assignee ?? bar.task.owner ?? 'Unassigned'} · {PM_TASK_STATUS_LABEL[bar.task.status]} · {bar.progressPct}%
                  </p>
                </button>
                <div className="relative h-11">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {gridLines.map((_, idx) => (
                      <div key={idx} className="border-l border-slate-200/60" style={{ width: GANTT_DAY_PX }} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelect(bar.task.task_id)}
                    className={`absolute top-2 h-7 rounded-md px-2 text-left overflow-hidden ${bar.tone === 'red' ? 'bg-red-500' : bar.tone === 'orange' ? 'bg-orange-500' : bar.tone === 'teal' ? 'bg-teal-600' : 'bg-slate-500'} text-white`}
                    style={{
                      left: bar.startOffset * GANTT_DAY_PX + 2,
                      width: Math.max(18, (bar.durationDays * GANTT_DAY_PX) - 4),
                      boxShadow: isLight ? '0 2px 7px rgba(15,23,42,0.22)' : undefined,
                    }}
                    title={`${bar.task.title} · ${bar.durationDays}d · ${bar.progressPct}%`}
                  >
                    <span className="text-[9px] font-semibold truncate block">{bar.task.title}</span>
                    <span className="text-[8px] opacity-90">{bar.progressPct}% · {bar.durationDays}d {bar.overdue ? '· SLA risk' : ''}</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
      {isTablet ? (
        <div className="px-3 pb-2 text-[10px] text-slate-500">Tablet mode: timeline scrolls horizontally inside this panel.</div>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPRINT BOARD VIEW — CES Execution Tasks Only
   ═══════════════════════════════════════════════════════════════ */

type SprintColumnKey = 'overdue' | 'at_risk' | 'in_progress' | 'awaiting' | 'completed';

const SPRINT_COLUMN_LABEL: Record<SprintColumnKey, string> = {
  overdue: 'Overdue',
  at_risk: 'At Risk',
  in_progress: 'In Progress',
  awaiting: 'Awaiting',
  completed: 'Completed',
};

const classifySprintColumn = (task: Task): SprintColumnKey => {
  const due = parseIsoDate(task.due_date).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (task.status === 'done') return 'completed';
  if (task.status === 'in_review') return 'awaiting';
  if (task.status === 'in_progress') return 'in_progress';
  if (task.status === 'blocked') return 'at_risk';
  if (due < today.getTime()) return 'overdue';
  return 'at_risk';
};

export function SprintBoardView({
  onSelect,
  selectedEventId,
}: {
  onSelect: (taskId: string) => void;
  selectedEventId?: string | null;
}): ReactElement {
  const projected = useProjectedTasks();
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const baseTasks = useMemo(() => bySelectedEvent(projected, selectedEventId), [projected, selectedEventId]);
  const sprintTasks = useMemo(
    () => baseTasks.filter(t => t.source !== 'personal' && t.sprint_id === sprintWindow.id),
    [baseTasks, sprintWindow.id],
  );

  const columns = useMemo(() => {
    const map: Record<SprintColumnKey, Task[]> = {
      overdue: [],
      at_risk: [],
      in_progress: [],
      awaiting: [],
      completed: [],
    };
    sprintTasks.forEach(task => map[classifySprintColumn(task)].push(task));
    return map;
  }, [sprintTasks]);

  if (sprintTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[12px] ci-text-muted">
        <div>{EMPTY_MSG}</div>
        <div className="text-[10px]">Sprint {sprintWindow.id} · {sprintWindow.startDate} to {sprintWindow.endDate}</div>
      </div>
    );
  }

  const blockers = columns.at_risk.length;
  const overdue = columns.overdue.length;
  const awaiting = columns.awaiting.length;
  const completed = columns.completed.length;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="ci-card p-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold ci-text-muted">Sprint {sprintWindow.id}</p>
            <h3 className="text-base font-semibold ci-text">Sprint {sprintWindow.number}</h3>
            <p className="text-[11px] ci-text-muted">{sprintWindow.startDate} to {sprintWindow.endDate}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            <StatChip label="Tasks" value={sprintTasks.length} tone="gray" />
            <StatChip label="Blockers" value={blockers} tone={blockers > 0 ? 'red' : 'gray'} />
            <StatChip label="Overdue" value={overdue} tone={overdue > 0 ? 'red' : 'gray'} />
            <StatChip label="Awaiting Signature" value={awaiting} tone={awaiting > 0 ? 'orange' : 'gray'} />
            <StatChip label="Completed" value={completed} tone="teal" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {(Object.keys(SPRINT_COLUMN_LABEL) as SprintColumnKey[]).map(col => (
            <section key={col} className="rounded-lg border border-slate-200 bg-white min-h-[220px] flex flex-col">
              <header className="px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-slate-600">{SPRINT_COLUMN_LABEL[col]}</span>
                <span className="text-[10px] font-mono text-slate-500">{columns[col].length}</span>
              </header>
              <div className="p-2 space-y-2 overflow-y-auto min-h-0">
                {columns[col].length === 0 ? <p className="text-[11px] text-slate-400 text-center py-6">No tasks</p> : null}
                {columns[col].map(task => (
                  <button key={task.task_id} type="button" onClick={() => onSelect(task.task_id)} className="w-full text-left rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 hover:bg-slate-100">
                    <p className="text-[12px] font-semibold text-slate-900 truncate">{task.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{task.event_id ? <EntityLink kind="event" id={task.event_id} label={task.event_title ?? task.event_id} /> : (task.event_title ?? 'No linked event')}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate">{task.assignee ?? task.owner ?? 'Unassigned'}</span>
                      <span>{task.due_date}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">{PM_TASK_STATUS_LABEL[task.status]}</div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone: 'gray' | 'teal' | 'orange' | 'red' }) {
  const cls = tone === 'teal'
    ? 'bg-teal-50 text-teal-700 border-teal-200'
    : tone === 'orange'
      ? 'bg-orange-50 text-orange-700 border-orange-200'
      : tone === 'red'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-slate-50 text-slate-700 border-slate-200';
  return <span className={`text-[10px] px-2 py-1 rounded-full border ${cls}`}>{label}: {value}</span>;
}
