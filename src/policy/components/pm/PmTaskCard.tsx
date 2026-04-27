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

const STATUS_COLOR: Record<PmTaskStatus, string> = {
  todo: 'rgba(148,163,184,0.85)',
  in_progress: 'rgba(56,189,248,0.85)',
  in_review: 'rgba(251,191,36,0.85)',
  blocked: 'rgba(244,114,182,0.9)',
  done: 'rgba(45,212,191,0.9)',
};

/** Shorten an event id like "qapi_meeting-20260507-08" → "QAPI · 05/07". */
function shortEventLabel(eventId?: string): string | null {
  if (!eventId) return null;
  const m = eventId.match(/^([a-z_]+)-(\d{4})(\d{2})(\d{2})/);
  if (!m) return eventId.slice(0, 24);
  const [, kind, , mm, dd] = m;
  const tag = kind.split('_').map(p => p[0]?.toUpperCase() ?? '').join('');
  return `${tag} · ${mm}/${dd}`;
}

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
  const depCount = task.dependencies?.length ?? 0;
  const formCount = isEcignSubmissionTask(task)
    ? (task.form_ids?.length ?? (task.form_id ? 1 : 0))
    : 0;
  const eventShort = !isPersonalTask(task) ? shortEventLabel(task.event_id) : null;

  const sourceLabel = isPersonalTask(task) ? 'Personal' : 'CES';
  const sourceColor = isPersonalTask(task)
    ? 'rgba(167,139,250,0.85)'
    : 'rgba(56,189,248,0.75)';

  return (
    <button
      type="button"
      onClick={() => onSelect(task.task_id)}
      className="w-full text-left rounded-md border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors px-3 py-2"
      style={{
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
            className={`font-outfit text-white truncate ${
              compact ? 'text-[11px]' : 'text-[12px]'
            }`}
          >
            {task.title}
          </div>
          <div className="text-[10px] font-mono text-white/45 truncate">
            {task.task_id}
          </div>

          {!compact && isEcignSubmissionTask(task) && (
            <div className="mt-1 text-[9px] uppercase tracking-wider text-white/55">
              {ECIGN_PACKET_STATUS_LABEL[task.packet_status]}
            </div>
          )}

          {(chip || depCount > 0 || task.story_points || eventShort || formCount > 0) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {eventShort && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white/[0.06] text-white/70"
                  title={(task as { event_id?: string }).event_id}
                >
                  {eventShort}
                </span>
              )}
              {formCount > 0 && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                  style={{ background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' }}
                  title={`${formCount} attached form(s)`}
                >
                  ⎙ {formCount}
                </span>
              )}
              {chip && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                  style={{ background: `${chip.color}22`, color: chip.color }}
                >
                  {chip.label}
                </span>
              )}
              {depCount > 0 && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white/5 text-white/55"
                  title={`${depCount} dependency(ies)`}
                >
                  ⇆ {depCount}
                </span>
              )}
              {task.story_points && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-white/5 text-white/55">
                  {task.story_points} pt
                </span>
              )}
              {showSource && (
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                  style={{ background: `${sourceColor}22`, color: sourceColor }}
                >
                  {sourceLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
