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
  type TaskSource,
  type Task,
} from '@/policy/pm/types';
import { useComplianceExecution } from '@/policy/compliance-execution';
import {
  criticalPath,
  CycleError,
  type PmEdge,
} from '@/policy/pm/scheduling/dependencyGraph';
import { PmTaskCard } from './PmTaskCard';
import { EntityLink } from './EntityLink';
import { useShellStore } from '@/policy/stores/uiStore';
import { EmptyState as UiEmptyState, SurfaceCard } from '@/policy/components/ui';

const EMPTY_MSG = 'No CES tasks available for this view.';
const STATUS_ORDER: PmTaskStatus[] = ['todo', 'in_progress', 'in_review', 'blocked', 'done'];
const STATUS_COLOR: Record<PmTaskStatus, string> = {
  todo: 'rgba(148,163,184,0.85)',
  in_progress: 'rgba(56,189,248,0.85)',
  in_review: 'rgba(251,191,36,0.85)',
  blocked: 'rgba(244,114,182,0.9)',
  done: 'rgba(45,212,191,0.9)',
};

const taskDepends = (task: Task): string[] => task.depends_on ?? task.dependencies ?? [];

const bySelectedEvent = (tasks: Task[], selectedEventId?: string | null): Task[] => {
  if (!selectedEventId) return tasks;
  return tasks.filter(t => t.source !== 'personal' && t.event_id === selectedEventId);
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

const ROW_H = 44;
const NAME_W = 640;
const DAY_PX = 26;

export function GanttView({
  onSelect,
  selectedEventId,
}: {
  onSelect: (taskId: string) => void;
  selectedEventId?: string | null;
}): ReactElement {
  const projected = useProjectedTasks();
  const overlay = usePmOverlayStore();
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PmTaskStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | TaskSource>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const tasks = useMemo(() => bySelectedEvent(projected, selectedEventId), [projected, selectedEventId]);

  const dayMs = 86400000;

  const toDate = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  const monthKey = (iso: string) => iso.slice(0, 7);
  const quarterKey = (iso: string) => {
    const d = toDate(iso);
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    return `${d.getUTCFullYear()}-Q${q}`;
  };
  const yearKey = (iso: string) => iso.slice(0, 4);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskEvent = t.source === 'personal' ? (t.event_id ?? t.linked_event_id) : t.event_id;
      const eventPass = eventFilter === 'all' || taskEvent === eventFilter;
      const monthPass = monthFilter === 'all' || monthKey(t.due_date) === monthFilter;
      const quarterPass = quarterFilter === 'all' || quarterKey(t.due_date) === quarterFilter;
      const yearPass = yearFilter === 'all' || yearKey(t.due_date) === yearFilter;
      const owner = t.assignee ?? t.owner ?? (t.source === 'personal' ? t.owner_user_id : t.assigned_user_id) ?? 'Unassigned';
      const assigneePass = assigneeFilter === 'all' || owner === assigneeFilter;
      const statusPass = statusFilter === 'all' || t.status === statusFilter;
      const sourcePass = sourceFilter === 'all' || t.source === sourceFilter;
      return eventPass && monthPass && quarterPass && yearPass && assigneePass && statusPass && sourcePass;
    });
  }, [tasks, eventFilter, monthFilter, quarterFilter, yearFilter, assigneeFilter, statusFilter, sourceFilter]);

  const allEvents = useMemo(
    () => Array.from(new Set(tasks.map(t => (t.source === 'personal' ? (t.event_id ?? t.linked_event_id) : t.event_id)).filter(Boolean))) as string[],
    [tasks],
  );
  const allMonths = useMemo(() => Array.from(new Set(tasks.map(t => monthKey(t.due_date)))).sort(), [tasks]);
  const allQuarters = useMemo(() => Array.from(new Set(tasks.map(t => quarterKey(t.due_date)))).sort(), [tasks]);
  const allYears = useMemo(() => Array.from(new Set(tasks.map(t => yearKey(t.due_date)))).sort(), [tasks]);
  const allAssignees = useMemo(() => Array.from(new Set(tasks.map(t => t.assignee ?? t.owner ?? (t.source === 'personal' ? t.owner_user_id : t.assigned_user_id) ?? 'Unassigned'))).sort(), [tasks]);

  const startDates = filteredTasks.map(t => toDate(t.start_date).getTime());
  const dueDates = filteredTasks.map(t => toDate(t.due_date).getTime());
  const minStart = startDates.length > 0 ? Math.min(...startDates) : Date.now();
  const maxDue = dueDates.length > 0 ? Math.max(...dueDates) : Date.now();
  const winStart = new Date(minStart - 2 * dayMs);
  const winEnd = new Date(maxDue + 2 * dayMs);
  const totalDays = Math.max(
    1,
    Math.round((winEnd.getTime() - winStart.getTime()) / dayMs) + 1,
  );

  const taskBars = useMemo(() => {
    return filteredTasks
      .map(t => {
        const start = toDate(t.start_date).getTime();
        const due = toDate(t.due_date).getTime();
        if (Number.isNaN(start) || Number.isNaN(due)) return null;
        const startOffsetDays = Math.round((start - winStart.getTime()) / dayMs);
        const endOffsetDays = Math.round((due - winStart.getTime()) / dayMs);
        if (endOffsetDays < 0 || startOffsetDays > totalDays) return null;
        return { task: t, startOffsetDays, endOffsetDays };
      })
      .filter((x): x is { task: Task; startOffsetDays: number; endOffsetDays: number } => x !== null);
  }, [filteredTasks, winStart, totalDays]);

  const edges: PmEdge[] = useMemo(() => {
    const out: PmEdge[] = [];
    for (const t of filteredTasks) {
      for (const dep of taskDepends(t)) {
        out.push({ from: dep, to: t.task_id });
      }
    }
    return out;
  }, [filteredTasks]);

  const cp = useMemo(() => {
    try {
      return criticalPath(filteredTasks.map(t => t.task_id), edges);
    } catch {
      return { nodes: new Set<string>(), length: 0 };
    }
  }, [filteredTasks, edges]);

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    taskBars.forEach((b, i) => m.set(b.task.task_id, i));
    return m;
  }, [taskBars]);

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
  const totalHeight = Math.max(ROW_H, taskBars.length * ROW_H);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        <select aria-label="Filter by event" title="Filter by event" value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="ci-field text-[11px]">
          <option value="all">Event: all</option>
          {allEvents.map(id => <option key={id} value={id}>{id}</option>)}
        </select>
        <select aria-label="Filter by month" title="Filter by month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="ci-field text-[11px]">
          <option value="all">Month: all</option>
          {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select aria-label="Filter by quarter" title="Filter by quarter" value={quarterFilter} onChange={e => setQuarterFilter(e.target.value)} className="ci-field text-[11px]">
          <option value="all">Quarter: all</option>
          {allQuarters.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
        <select aria-label="Filter by year" title="Filter by year" value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="ci-field text-[11px]">
          <option value="all">Year: all</option>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select aria-label="Filter by assignee" title="Filter by assignee" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="ci-field text-[11px]">
          <option value="all">Assignee: all</option>
          {allAssignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select aria-label="Filter by status" title="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | PmTaskStatus)} className="ci-field text-[11px]">
          <option value="all">Status: all</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{PM_TASK_STATUS_LABEL[s]}</option>)}
        </select>
        <select aria-label="Filter by source" title="Filter by source" value={sourceFilter} onChange={e => setSourceFilter(e.target.value as 'all' | TaskSource)} className="ci-field text-[11px]">
          <option value="all">Source: all</option>
          <option value="CES">CES</option>
          <option value="manual">manual</option>
          <option value="personal">personal</option>
        </select>
      </div>

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
            Filtered: {filteredTasks.length} task(s) · Critical path: {cp.nodes.size}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto rounded-lg border"
        style={{
          borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)',
          background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="sticky top-0 z-10 grid" style={{ gridTemplateColumns: `${NAME_W}px 1fr` }}>
          <div
            className="grid items-center border-b"
            style={{
              height: ROW_H,
              gridTemplateColumns: '2fr 1.2fr 1.1fr 1fr 0.8fr 0.8fr',
              borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)',
              background: isLight ? '#e2e8f0' : '#0b1220',
            }}
          >
            {['Task', 'Workflow', 'Event', 'Assignee', 'Status', 'Due'].map(col => (
              <div key={col} className="px-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.16em]" style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.75)' }}>
                {col}
              </div>
            ))}
          </div>
          <div className="flex border-b" style={{ borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)', background: isLight ? '#e2e8f0' : '#0b1220' }}>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = new Date(winStart.getTime() + i * dayMs);
              const isWeekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
              return (
                <div
                  key={i}
                  className="text-center border-l text-[9px] font-mono"
                  style={{
                    width: DAY_PX,
                    lineHeight: `${ROW_H}px`,
                    borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
                    color: isWeekend ? (isLight ? '#94a3b8' : 'rgba(255,255,255,0.32)') : (isLight ? '#334155' : 'rgba(255,255,255,0.68)'),
                    background: isWeekend ? (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.03)') : 'transparent',
                  }}
                  title={d.toDateString()}
                >
                  {d.getUTCDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative" style={{ width: totalWidth, height: totalHeight }}>
          {taskBars.map(({ task, startOffsetDays, endOffsetDays }, rowIdx) => {
            const onCp = cp.nodes.has(task.task_id);
            const isLinkSrc = linkSource === task.task_id;
            const spanCells = Math.max(1, endOffsetDays - startOffsetDays + 1);
            const top = rowIdx * ROW_H;
            const owner = task.assignee ?? task.owner ?? (task.source === 'personal' ? task.owner_user_id : task.assigned_user_id) ?? 'Unassigned';
            const isMilestone = task.task_type === 'approval' || task.task_type === 'certification';
            const isFormTask = task.task_type === 'form_completion' || task.task_type === 'form_review';
            const overdue = toDate(task.due_date).getTime() < new Date().setHours(0, 0, 0, 0) && task.status !== 'done';
            const workflowLabel = task.workflow_title ?? task.workflow_id ?? 'Unlinked';
            const eventLabel = task.event_title ?? task.event_id ?? 'No event';

            return (
              <div
                key={task.task_id}
                className="absolute left-0 right-0 grid border-b"
                style={{
                  top,
                  height: ROW_H,
                  gridTemplateColumns: `${NAME_W}px 1fr`,
                  borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
                  background: rowIdx % 2 === 0 ? (isLight ? '#ffffff' : 'rgba(255,255,255,0.01)') : (isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)'),
                }}
              >
                <div
                  onClick={() => onSelect(task.task_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelect(task.task_id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="grid items-center text-left px-2 gap-2"
                  style={{ gridTemplateColumns: '2fr 1.2fr 1.1fr 1fr 0.8fr 0.8fr' }}
                  title={task.title}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-outfit" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>{task.title}</div>
                    <div className="truncate text-[9px] font-mono" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.45)' }}>
                      <EntityLink kind="task" id={task.task_id} onSelectTask={onSelect} />
                    </div>
                  </div>
                  <div className="truncate text-[10px]" title={workflowLabel}>
                    {task.workflow_id ? <EntityLink kind="workflow" id={task.workflow_id} label={workflowLabel} /> : workflowLabel}
                  </div>
                  <div className="truncate text-[10px]" title={eventLabel}>
                    {task.event_id ? <EntityLink kind="event" id={task.event_id} label={eventLabel} /> : eventLabel}
                  </div>
                  <div className="truncate text-[10px]" style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.72)' }} title={owner}>{owner}</div>
                  <div className="truncate text-[10px]" style={{ color: isLight ? '#334155' : 'rgba(255,255,255,0.72)' }}>{PM_TASK_STATUS_LABEL[task.status]}</div>
                  <div className="truncate text-[10px]" style={{ color: overdue ? '#ef4444' : (isLight ? '#334155' : 'rgba(255,255,255,0.72)') }}>{task.due_date}</div>
                </div>

                <div className="relative" style={{ width: totalDays * DAY_PX }}>
                  {Array.from({ length: totalDays }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l"
                      style={{
                        left: i * DAY_PX,
                        borderColor: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.05)',
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleBarClick(task.task_id)}
                    className="absolute top-[9px] h-[26px] rounded-md hover:brightness-110"
                    style={{
                      left: `${startOffsetDays * DAY_PX + 1}px`,
                      width: isMilestone ? '16px' : `${Math.max(14, spanCells * DAY_PX - 2)}px`,
                      transform: isMilestone ? 'rotate(45deg)' : undefined,
                      transformOrigin: 'center',
                      background: isMilestone
                        ? '#f59e0b'
                        : isFormTask
                          ? 'rgba(14,165,233,0.85)'
                          : STATUS_COLOR[task.status],
                      border: onCp ? '1px solid rgba(251,191,36,0.95)' : undefined,
                      boxShadow: isLinkSrc ? '0 0 0 2px rgba(56,189,248,0.7)' : undefined,
                      outline: overdue ? '2px solid rgba(239,68,68,0.8)' : undefined,
                    }}
                    aria-label={`${task.title} ${task.start_date} to ${task.due_date}`}
                    title={`${task.title} (${task.start_date} → ${task.due_date})`}
                  />
                </div>
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill={isLight ? 'rgba(51,65,85,0.75)' : 'rgba(251,191,36,0.85)'} />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const fromIdx = indexById.get(e.from);
              const toIdx = indexById.get(e.to);
              if (fromIdx === undefined || toIdx === undefined) return null;
              const fromBar = taskBars[fromIdx];
              const toBar = taskBars[toIdx];
              const x1 = NAME_W + fromBar.endOffsetDays * DAY_PX + DAY_PX;
              const y1 = fromIdx * ROW_H + ROW_H / 2;
              const x2 = NAME_W + toBar.startOffsetDays * DAY_PX;
              const y2 = toIdx * ROW_H + ROW_H / 2;
              const onCpEdge = cp.nodes.has(e.from) && cp.nodes.has(e.to);
              return (
                <path
                  key={`${e.from}-${e.to}-${i}`}
                  d={`M ${x1} ${y1} C ${x1 + 24} ${y1}, ${x2 - 24} ${y2}, ${x2} ${y2}`}
                  stroke={onCpEdge ? 'rgba(251,191,36,0.85)' : (isLight ? 'rgba(51,65,85,0.45)' : 'rgba(148,163,184,0.55)')}
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
  selectedEventId,
}: {
  onSelect: (taskId: string) => void;
  selectedEventId?: string | null;
}): ReactElement {
  const projected = useProjectedTasks();
  const personal = usePmPersonalStore();
  const ces = useComplianceExecution();
  const [toast, setToast] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const sprintId = ces.activeSprint.id;
  const tasks = useMemo(() => bySelectedEvent(projected, selectedEventId), [projected, selectedEventId]);

  const sprintTasks = useMemo(() => {
    return tasks.filter(t => t.sprint_id === sprintId);
  }, [tasks, sprintId]);

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
    const sprintStart = new Date(ces.activeSprint.startDate + 'T00:00:00').getTime();
    const sprintEnd = new Date(ces.activeSprint.endDate + 'T23:59:59').getTime();
    const days = Math.max(1, Math.round((sprintEnd - sprintStart) / dayMs) + 1);
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const elapsed = Math.max(0, Math.min(days, Math.round((todayMs - sprintStart) / dayMs)));
    const ideal = Math.max(0, totalPoints - (totalPoints / days) * elapsed);
    return { totalPoints, remainingPoints, days, elapsed, ideal };
  }, [sprintTasks, ces.activeSprint.startDate, ces.activeSprint.endDate]);

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
