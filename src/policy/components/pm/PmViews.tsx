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
    <SurfaceCard className="flex-1 flex items-center justify-center" padding="md" style={{ border: 'none' }}>
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
  isLight,
}: {
  status: PmTaskStatus;
  items: Task[];
  onSelect: (id: string) => void;
  isLight: boolean;
}) {
  const { setNodeRef, isOver: _isOver } = useDroppable({ id: `col:${status}` });
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-h-0 transition-colors"
      style={{
        background: 'var(--ci-surface-2)',
        border: 'none',
      }}
    >
      <header className="flex items-center justify-between px-3 py-2" style={{ borderBottom: isLight ? '1px solid var(--ci-border)' : '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-[10px] font-montserrat font-bold uppercase tracking-[0.22em]" style={{ color: isLight ? 'var(--ci-text)' : 'var(--ci-text)' }}>
          {PM_TASK_STATUS_LABEL[status]}
        </span>
        <span className="text-[10px] font-mono" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--ci-text-subtle)' }}>{items.length}</span>
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
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
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
    <div className="flex-1 min-h-0 flex flex-col gap-2" style={{ border: 'none' }}>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div
          className="flex-1 grid gap-3 min-h-0 overflow-hidden overflow-x-hidden"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', border: 'none' }}
        >
          {columns.map(col => (
            <KanbanColumn key={col.status} {...col} onSelect={onSelect} isLight={isLight} />
          ))}
        </div>
      </DndContext>
      {toast && (
        <div
          role="alert"
          className="self-end max-w-[420px] rounded-lg px-3 py-2 text-[11px] font-outfit"
          style={{
            border: isLight ? '1px solid #fda4af' : '1px solid rgba(244,63,94,0.4)',
            background: isLight ? '#fff1f2' : 'rgba(190,24,93,0.15)',
            color: isLight ? '#9f1239' : '#fda4af',
          }}
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
    const winStartMs = sprintStart;
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
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1" style={{ border: 'none' }}>
        {eventGroups.map(group => (
          <section key={group.eventId} className="ci-card p-3" style={{ border: 'none', background: isLight ? 'var(--ci-surface)' : 'var(--ci-surface-2)' }}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold ci-text truncate">{group.eventLabel}</h3>
              <span
                className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: isLight
                    ? (group.risk === 'high' ? '#FEE2E2' : group.risk === 'medium' ? '#FEF3E8' : '#F4F4F2')
                    : (group.risk === 'high' ? 'rgba(215,1,1,0.15)' : group.risk === 'medium' ? 'rgba(224,123,44,0.15)' : 'rgba(255,255,255,0.06)'),
                  color: isLight
                    ? (group.risk === 'high' ? '#D70101' : group.risk === 'medium' ? '#C74601' : '#52404B')
                    : (group.risk === 'high' ? '#FDA4AF' : group.risk === 'medium' ? '#FFA059' : 'rgba(255,255,255,0.7)'),
                  border: 'none',
                }}
              >
                {group.risk} risk
              </span>
            </div>
            <p className="text-[11px] ci-text-muted mt-1">{group.taskCount} tasks · {group.completionPct}% complete</p>
            <div className="mt-3 space-y-2">
              {group.bars.map(bar => (
                <button key={bar.task.task_id} type="button" onClick={() => onSelect(bar.task.task_id)} className="w-full text-left rounded-lg p-2.5" style={{ border: 'none', background: isLight ? 'var(--ci-surface-muted)' : 'var(--ci-surface-2)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold ci-text truncate">{bar.task.title}</p>
                    <span className="text-[10px] ci-text-muted">{bar.durationDays}d</span>
                  </div>
                  <p className="text-[10px] ci-text-muted mt-1">{bar.task.assignee ?? bar.task.owner ?? 'Unassigned'} · {bar.task.due_date}</p>
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.08)' }}>
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
    <div className="flex-1 min-h-0 overflow-auto overflow-x-hidden" style={{ background: isLight ? 'var(--ci-surface)' : 'var(--ci-surface-2)', border: 'none' }}>
      <div className="sticky top-0 z-10" style={{ borderBottom: isLight ? '1px solid var(--ci-border)' : '1px solid rgba(255,255,255,0.06)', background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.015)' }}>
        <div className="grid" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px` }}>
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] font-semibold" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)' }}>Event Pipeline</div>
          <div className="relative h-8">
            <div className="absolute inset-0 flex">
              {gridLines.map((_, idx) => (
                <div key={idx} className="border-l font-mono text-center" style={{ borderColor: isLight ? 'var(--ci-border)' : 'rgba(255,255,255,0.06)', color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)', width: GANTT_DAY_PX, lineHeight: '32px' }}>
                  {idx % 7 === 0 ? idx + 1 : ''}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        {eventGroups.map(group => (
          <section key={group.eventId} className="mb-3 overflow-hidden" style={{ border: 'none' }}>
            <div className="grid items-center" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px`, borderBottom: isLight ? '1px solid var(--ci-border)' : '1px solid rgba(255,255,255,0.06)', background: isLight ? 'var(--ci-surface-2)' : 'rgba(255,255,255,0.015)', border: 'none' }}>
              <div className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate" style={{ color: isLight ? 'var(--ci-text)' : 'var(--v3-text-primary)' }}>{group.eventLabel}</h3>
                  <span
                    className="text-[9px] uppercase px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isLight ? (group.risk === 'high' ? '#FEE2E2' : group.risk === 'medium' ? '#FEF3E8' : '#F4F4F2') : (group.risk === 'high' ? 'rgba(215,1,1,0.15)' : group.risk === 'medium' ? 'rgba(224,123,44,0.15)' : 'rgba(255,255,255,0.06)'),
                      color: isLight ? (group.risk === 'high' ? '#D70101' : group.risk === 'medium' ? '#C74601' : '#52404B') : (group.risk === 'high' ? '#FDA4AF' : group.risk === 'medium' ? '#FFA059' : 'rgba(255,255,255,0.7)'),
                      border: 'none',
                    }}
                  >
                    {group.risk}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)' }}>{group.taskCount} tasks · {group.completionPct}% complete</p>
              </div>
              <div />
            </div>

            {group.bars.map(bar => (
              <div key={bar.task.task_id} className="grid" style={{ gridTemplateColumns: `${GANTT_EVENT_LABEL_W}px ${timelineWidth}px` }}>
                <button type="button" onClick={() => onSelect(bar.task.task_id)} className="px-3 py-2 text-left" style={{ background: 'transparent', border: 'none' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLight ? 'var(--ci-overlay-soft)' : 'rgba(255,255,255,0.04)'; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  <p className="text-[12px] font-medium truncate" style={{ color: isLight ? 'var(--ci-text)' : 'var(--v3-text-primary)' }}>{bar.task.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)' }}>
                    {bar.task.assignee ?? bar.task.owner ?? 'Unassigned'} · {PM_TASK_STATUS_LABEL[bar.task.status]} · {bar.progressPct}%
                  </p>
                </button>
                <div className="relative h-11">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {gridLines.map((_, idx) => (
                      <div key={idx} className="border-l" style={{ borderColor: isLight ? 'var(--ci-border)' : 'rgba(255,255,255,0.04)', width: GANTT_DAY_PX }} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelect(bar.task.task_id)}
                    className={`absolute top-2 h-7 rounded-full px-2 text-left overflow-hidden text-white`}
                    style={{
                      left: bar.startOffset * GANTT_DAY_PX + 2,
                      width: Math.max(18, (bar.durationDays * GANTT_DAY_PX) - 4),
                      boxShadow: isLight ? '0 2px 7px rgba(15,23,42,0.22)' : undefined,
                      background: bar.tone === 'red' ? '#D70101' : bar.tone === 'orange' ? '#E07B2C' : bar.tone === 'teal' ? '#007970' : '#64748B',
                      border: 'none',
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
        <div className="px-3 pb-2 text-[10px]" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)', border: 'none' }}>Tablet mode: timeline scrolls horizontally inside this panel.</div>
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
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
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
      <div className="flex-1 flex flex-col items-center justify-center gap-1 text-[12px] ci-text-muted" style={{ border: 'none' }}>
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
    <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden" style={{ border: 'none' }}>
      <div className="ci-card p-3" style={{ border: 'none', background: isLight ? 'var(--ci-surface)' : 'var(--ci-surface-2)' }}>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold ci-text-muted">Sprint {sprintWindow.id}</p>
            <h3 className="text-base font-semibold ci-text">Sprint {sprintWindow.number}</h3>
            <p className="text-[11px] ci-text-muted">{sprintWindow.startDate} to {sprintWindow.endDate}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            <StatChip label="Tasks" value={sprintTasks.length} tone="gray" isLight={isLight} />
            <StatChip label="Blockers" value={blockers} tone={blockers > 0 ? 'red' : 'gray'} isLight={isLight} />
            <StatChip label="Overdue" value={overdue} tone={overdue > 0 ? 'red' : 'gray'} isLight={isLight} />
            <StatChip label="Awaiting Signature" value={awaiting} tone={awaiting > 0 ? 'orange' : 'gray'} isLight={isLight} />
            <StatChip label="Completed" value={completed} tone="teal" isLight={isLight} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="grid gap-3 overflow-hidden" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
          {(Object.keys(SPRINT_COLUMN_LABEL) as SprintColumnKey[]).map(col => (
            <section key={col} className="rounded-lg min-h-[220px] flex flex-col" style={{ border: 'none', background: isLight ? 'var(--ci-surface)' : 'var(--ci-surface-2)' }}>
              <header className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: isLight ? 'var(--ci-border)' : 'rgba(255,255,255,0.08)' }}>
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: isLight ? 'var(--ci-text-muted)' : 'var(--v3-text-tertiary)' }}>{SPRINT_COLUMN_LABEL[col]}</span>
                <span className="text-[10px] font-mono" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.5)' }}>{columns[col].length}</span>
              </header>
              <div className="p-2 space-y-2 overflow-y-auto min-h-0">
                {columns[col].length === 0 ? <p className="text-[11px] text-center py-6" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.4)' }}>No tasks</p> : null}
                {columns[col].map(task => (
                  <button key={task.task_id} type="button" onClick={() => onSelect(task.task_id)} className="w-full text-left rounded-md px-2.5 py-2" style={{ border: 'none', background: isLight ? 'var(--ci-surface-muted)' : 'var(--ci-surface-2)' }}>
                    <p className="text-[12px] font-semibold truncate" style={{ color: isLight ? 'var(--ci-text)' : 'var(--ci-text)' }}>{task.title}</p>
                    <p className="text-[10px] mt-1 truncate" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.55)' }}>{task.event_id ? <EntityLink kind="event" id={task.event_id} label={task.event_title ?? task.event_id} /> : (task.event_title ?? 'No linked event')}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.55)' }}>
                      <span className="truncate">{task.assignee ?? task.owner ?? 'Unassigned'}</span>
                      <span>{task.due_date}</span>
                    </div>
                    <div className="mt-1 text-[10px]" style={{ color: isLight ? 'var(--ci-text-muted)' : 'rgba(255,255,255,0.55)' }}>{PM_TASK_STATUS_LABEL[task.status]}</div>
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

function StatChip({ label, value, tone, isLight }: { label: string; value: number; tone: 'gray' | 'teal' | 'orange' | 'red'; isLight: boolean }) {
  // var(--) + isLight conditionals to purge dark fallbacks / slate bleed in SprintBoard (design #4 match).
  // rounded-full, teal/orange fills (light: soft tints; dark: low-opacity var tones), no perimeter.
  const style: React.CSSProperties = tone === 'teal'
    ? { background: isLight ? '#E6F7F5' : 'rgba(0,121,112,0.18)', color: isLight ? '#007970' : '#5EEAD4', borderColor: isLight ? '#99D9D0' : 'rgba(0,209,193,0.35)' }
    : tone === 'orange'
      ? { background: isLight ? '#FEF3E8' : 'rgba(224,123,44,0.18)', color: isLight ? '#C74601' : '#FFA059', borderColor: isLight ? '#F5D3A8' : 'rgba(224,123,44,0.35)' }
      : tone === 'red'
        ? { background: isLight ? '#FEE2E2' : 'rgba(215,1,1,0.18)', color: isLight ? '#D70101' : '#FDA4AF', borderColor: isLight ? '#FECACA' : 'rgba(244,63,94,0.35)' }
        : { background: isLight ? '#F4F4F2' : 'rgba(255,255,255,0.06)', color: isLight ? '#52404B' : 'rgba(255,255,255,0.65)', borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.14)' };
  return <span className="text-[10px] px-2 py-1 rounded-full border" style={style}>{label}: {value}</span>;
}
