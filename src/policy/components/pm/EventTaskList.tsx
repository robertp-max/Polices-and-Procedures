/**
 * EventTaskList — renders all canonical PM tasks linked to an event.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Unified-Task-Model.md §5
 *
 * Used inside WorkflowExecutionPanel (Event view) to confirm the principle
 * that tasks shown on Calendar / Gantt / Kanban / Sprint are the SAME
 * canonical Task objects (same task_id) projected by `useProjectedTasks('full')` (per-event list, not sprint-scoped).
 *
 * Clicking a row opens the global TaskDetailRightPanel via selectedTaskStore.
 */

import { useMemo, type ReactElement } from 'react';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { PM_TASK_STATUS_LABEL } from '@/policy/pm/ecignStatusMap';
import { EntityLink } from './EntityLink';

interface Props {
  eventId: string;
  onSelectTask?: (taskId: string) => void;
}

export function EventTaskList({ eventId, onSelectTask }: Props): ReactElement {
  const tasks = useProjectedTasks('full');
  const openTask = useSelectedTaskStore(s => s.openTask);
  const handleSelect = onSelectTask ?? ((taskId: string) => openTask(taskId, 'event'));
  const formRefsOf = (t: (typeof tasks)[number]): string[] => {
    const anyTask = t as { form_refs?: string[]; form_ids?: string[] };
    return anyTask.form_refs ?? anyTask.form_ids ?? [];
  };

  const linked = useMemo(
    () => tasks.filter(t => (t as { event_id?: string }).event_id === eventId),
    [tasks, eventId],
  );

  if (linked.length === 0) {
    return (
      <div className="ci-card p-3 text-[11px] ci-text-muted" style={{ borderStyle: 'dashed' }}>
        No PM tasks linked to this event.
      </div>
    );
  }

  return (
    <div className="ci-card overflow-hidden" style={{ padding: 0 }}>
      <div className="px-3 py-1.5 text-[10px] font-montserrat uppercase tracking-[0.22em] ci-text-subtle border-b ci-border">
        PM Tasks · {linked.length}
      </div>
      <ul className="divide-y" style={{ borderColor: 'var(--ci-border)' }}>
        {linked.map(t => (
          <li key={t.task_id}>
            <button
              type="button"
              onClick={() => handleSelect(t.task_id)}
              className="w-full text-left px-3 py-2"
              style={{ background: 'transparent' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] ci-text truncate">{t.title}</div>
                  <div className="text-[10px] font-mono ci-text-subtle truncate">{t.task_id}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider ci-text-muted shrink-0">
                  {PM_TASK_STATUS_LABEL[t.status]}
                </span>
              </div>

              <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                <span className="ci-text-muted truncate" title={t.due_date}>Due/SLA: <span className="ci-text">{t.due_date}</span></span>
                <span className="ci-text-muted truncate" title={t.assignee ?? t.owner ?? 'Unassigned'}>Assignee: <span className="ci-text">{t.assignee ?? t.owner ?? 'Unassigned'}</span></span>
                <span className="ci-text-muted truncate">Story points: <span className="ci-text">{t.story_points ?? '—'}</span></span>
                <span className="ci-text-muted truncate" title={t.workflow_title ?? t.workflow_id ?? 'Unlinked workflow'}>
                  Workflow:{' '}
                  {t.workflow_id ? (
                    <EntityLink kind="workflow" id={t.workflow_id} label={t.workflow_title ?? t.workflow_id} />
                  ) : (
                    <span className="ci-text">{t.workflow_title ?? 'Unlinked workflow'}</span>
                  )}
                </span>
              </div>

              {formRefsOf(t).length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] ci-text-muted">Forms:</span>
                  {formRefsOf(t).slice(0, 2).map(fid => (
                    <EntityLink
                      key={fid}
                      kind="form"
                      id={fid}
                      className="text-[10px] px-1.5 py-0.5 rounded-sm"
                    />
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
