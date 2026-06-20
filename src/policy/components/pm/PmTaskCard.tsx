/**
 * PmTaskCard — canonical PM card renderer.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Kanban-and-My-Tasks.md §3.2
 *
 * Used by Kanban, Sprint Board, My Tasks lists. Single source of card UI so
 * status / source / due / dep chips look identical everywhere.
 */

import type { ReactElement } from 'react';
import {
  ECIGN_PACKET_STATUS_LABEL,
  PM_TASK_STATUS_LABEL,
} from '@/policy/pm/ecignStatusMap';
import {
  isEcignSubmissionTask,
  isPersonalTask,
  type PmTaskStatus,
  type Task,
} from '@/policy/pm/types';
import { EntityLink } from './EntityLink';

const STATUS_COLOR: Record<PmTaskStatus, string> = {
  todo: 'rgba(148,163,184,0.85)',
  in_progress: 'rgba(56,189,248,0.85)',
  in_review: 'rgba(251,191,36,0.85)',
  blocked: 'rgba(244,114,182,0.9)',
  done: 'rgba(45,212,191,0.9)',
};

function dueChip(due?: string): { label: string; color: string } | null {
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(due + (due.length === 10 ? 'T00:00:00' : ''));
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'rgba(244,114,182,0.95)' };
  if (days === 0) return { label: 'Due today', color: 'rgba(244,114,182,0.85)' };
  if (days <= 3) return { label: `Due in ${days}d`, color: 'rgba(251,191,36,0.9)' };
  return { label: `Due ${due.slice(5)}`, color: 'rgba(148,163,184,0.85)' };
}

export interface PmTaskCardProps {
  task: Task;
  onSelect: (taskId: string) => void;
  /** Show source pill (CES / Personal). Default true. */
  showSource?: boolean;
  /** Compact layout for dense Kanban columns. */
  compact?: boolean;
  /** Highlight border color (for critical-path / search hits). */
  accent?: string;
  /** Pass-through props for DnD draggables. */
  dragHandleProps?: Record<string, unknown>;
}

export function PmTaskCard({
  task,
  onSelect,
  showSource = true,
  compact = false,
  accent,
  dragHandleProps,
}: PmTaskCardProps): ReactElement {
  const dot = STATUS_COLOR[task.status];
  const chip = dueChip(task.due_date);
  const depCount = (task.depends_on ?? task.dependencies ?? []).length;
  const ownerLabel = (task as any).assignee ?? (task as any).owner;

  const sourceLabel = isPersonalTask(task) ? 'Personal' : 'CES';
  const sourceColor = isPersonalTask(task)
    ? 'rgba(167,139,250,0.85)'
    : 'rgba(56,189,248,0.75)';
  const workflowLabel = task.workflow_title ?? task.workflow_id ?? 'Unlinked workflow';
  const eventLabel = task.event_title ?? task.event_id ?? 'No linked event';
  const taskWithForms = task as { form_refs?: string[]; form_ids?: string[] };
  const formRefs = taskWithForms.form_refs ?? taskWithForms.form_ids ?? (isEcignSubmissionTask(task) && task.form_id ? [task.form_id] : []);
  const policyRefs = task.policy_refs ?? task.policyRefs ?? (task.policy_id ? [task.policy_id] : []);

  return (
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
      className="w-full text-left rounded-md transition-colors px-3 py-2"
      style={{
        background: 'var(--ci-surface-muted)',
        border: 'none',
        borderColor: accent ?? undefined,
        boxShadow: accent ? `0 0 0 1px ${accent}` : undefined,
      }}
      data-task-id={task.task_id}
      {...dragHandleProps}
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 inline-block rounded-full shrink-0"
          style={{ width: 7, height: 7, background: dot }}
          aria-label={PM_TASK_STATUS_LABEL[task.status]}
        />
        <div className="flex-1 min-w-0">
          <div
            className={`font-outfit ci-text truncate ${
              compact ? 'text-[11px]' : 'text-[12px]'
            }`}
          >
            {task.title}
          </div>
          <div className="text-[10px] font-mono ci-text-subtle truncate flex items-center gap-1.5">
            <span className="ci-text-subtle">Task</span>
            <EntityLink kind="task" id={task.task_id} onSelectTask={onSelect} />
          </div>

          <div className="mt-1 text-[10px] ci-text-muted truncate">
            {task.workflow_id ? <EntityLink kind="workflow" id={task.workflow_id} label={workflowLabel} /> : workflowLabel}
          </div>
          <div className="text-[10px] ci-text-subtle truncate">
            {task.event_id ? <EntityLink kind="event" id={task.event_id} label={eventLabel} /> : eventLabel}
          </div>

          {formRefs.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {formRefs.slice(0, compact ? 2 : 3).map(fid => (
                <EntityLink
                  key={fid}
                  kind="form"
                  id={fid}
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                />
              ))}
            </div>
          )}

          {policyRefs.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {policyRefs.slice(0, compact ? 2 : 3).map(pid => (
                <EntityLink
                  key={pid}
                  kind="policy"
                  id={pid}
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                />
              ))}
            </div>
          )}

          {!compact && isEcignSubmissionTask(task) && (
            <div className="mt-1 text-[9px] uppercase tracking-wider ci-text-subtle">
              {ECIGN_PACKET_STATUS_LABEL[task.packet_status]}
            </div>
          )}

          {(chip || depCount > 0 || task.story_points || ownerLabel || showSource) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {chip && (
                <span
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${chip.color}22`, color: chip.color }}
                >
                  {chip.label}
                </span>
              )}
              {ownerLabel && (
                <span
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--ci-surface-2)', color: 'var(--ci-text-subtle)' }}
                  title="Owner"
                >
                  {ownerLabel}
                </span>
              )}
              {depCount > 0 && (
                <span
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--ci-surface-2)', color: 'var(--ci-text-subtle)' }}
                  title={`${depCount} dependency(ies)`}
                >
                  ⇆ {depCount}
                </span>
              )}
              {task.story_points && (
                <span className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--ci-surface-2)', color: 'var(--ci-text-subtle)' }}>
                  {task.story_points} pt
                </span>
              )}
              {showSource && (
                <span
                  className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${sourceColor}22`, color: sourceColor }}
                >
                  {sourceLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
