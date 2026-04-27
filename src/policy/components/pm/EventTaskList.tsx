/**
 * EventTaskList — renders all canonical PM tasks linked to an event.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Unified-Task-Model.md §5
 *
 * Used inside WorkflowExecutionPanel (Event view) to confirm the principle
 * that tasks shown on Calendar / Gantt / Kanban / Sprint are the SAME
 * canonical Task objects (same task_id) projected by `useProjectedTasks()`.
 *
 * Clicking a row opens the global TaskDetailRightPanel via selectedTaskStore.
 */

import { useMemo, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { PM_TASK_STATUS_LABEL } from '@/policy/pm/ecignStatusMap';

interface Props {
  eventId: string;
}

export function EventTaskList({ eventId }: Props): ReactElement {
  const tasks = useProjectedTasks();
  const openTask = useSelectedTaskStore(s => s.openTask);

  const linked = useMemo(
    () => tasks.filter(t => (t as { event_id?: string }).event_id === eventId),
    [tasks, eventId],
  );

  if (linked.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-white/10 bg-white/[0.02] p-3 text-[11px] text-white/45">
        No PM tasks linked to this event.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02]">
      <div className="px-3 py-1.5 text-[10px] font-montserrat uppercase tracking-[0.22em] text-white/55 border-b border-white/10">
        PM Tasks · {linked.length}
      </div>
      <ul className="divide-y divide-white/5">
        {linked.map(t => (
          <li key={t.task_id}>
            <button
              type="button"
              onClick={() => openTask(t.task_id, 'event')}
              className="w-full text-left px-3 py-2 hover:bg-white/[0.04] flex items-center gap-3"
            >
              <span className="font-mono text-[10px] text-white/45 truncate w-28 shrink-0">
                {t.task_id}
              </span>
              <span className="flex-1 text-[12px] text-white/85 truncate">{t.title}</span>
              <span className="text-[10px] uppercase tracking-wider text-white/55 shrink-0">
                {PM_TASK_STATUS_LABEL[t.status]}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
