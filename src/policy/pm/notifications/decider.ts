/**
 * NotificationDecider — pure function.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Notifications-and-Reminders.md §2, §4
 *
 * Translates a PM event + Task state + user preferences into 0..N
 * notification rows. Idempotency is enforced upstream by keying on
 * (user_id, task_id, kind, window_token).
 */

import type { Task } from '../types';

export type NotificationKind =
  | 'assigned'
  | 'unassigned'
  | 'mention'
  | 'due_soon'
  | 'overdue'
  | 'blocked'
  | 'unblocked'
  | 'approval_required'
  | 'evidence_added'
  | 'sprint_starting'
  | 'sprint_ending'
  | 'weekend_scheduled';

export interface PmNotification {
  id: string;
  user_id: string;
  task_id: string;
  kind: NotificationKind;
  payload?: Record<string, unknown>;
  /** Idempotency window token, e.g. `due_soon:T-72h:2026-04-30` */
  window_token: string;
  created_at: string;
}

export interface NotificationPrefs {
  user_id: string;
  channels: { in_app: boolean; email_digest: 'instant' | 'hourly' | 'daily' | 'off' };
  quiet_hours?: { start_hour: number; end_hour: number; tz?: string };
  mute_kinds?: NotificationKind[];
  mute_task_ids?: string[];
  digest_includes_personal: boolean;
}

export interface NotificationContext {
  now: Date;
  task: Task;
  prefs: NotificationPrefs;
  /** Optional: prior assignee for `assigned`/`unassigned` decisions. */
  prevAssigneeId?: string;
}

const HOUR_MS = 60 * 60 * 1000;

const newId = () =>
  `notif-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const inWindow = (target: Date, now: Date, hours: number, slack: number): boolean => {
  const delta = target.getTime() - now.getTime();
  const lower = hours * HOUR_MS - slack * HOUR_MS;
  const upper = hours * HOUR_MS + slack * HOUR_MS;
  return delta >= lower && delta <= upper;
};

const allowed = (prefs: NotificationPrefs, kind: NotificationKind, task_id: string): boolean => {
  if (prefs.mute_kinds?.includes(kind)) return false;
  if (prefs.mute_task_ids?.includes(task_id)) return false;
  return true;
};

/**
 * Decide which notifications to emit on a given trigger.
 *
 * `triggerKinds` controls which subset of detection branches run; this lets
 * the queue dispatcher cover both periodic ticker and event-driven triggers
 * with the same pure function.
 */
export function decideNotifications(
  ctx: NotificationContext,
  triggerKinds: ReadonlySet<NotificationKind> = new Set([
    'due_soon',
    'overdue',
    'sprint_starting',
    'sprint_ending',
  ]),
): PmNotification[] {
  const out: PmNotification[] = [];
  const { task, now, prefs } = ctx;

  // Skip personal tasks if pref says so for digest contexts (the dispatcher
  // is responsible for honoring `digest_includes_personal`; we preserve here
  // by filtering out from emissions when applicable).
  if (task.source === 'personal' && !prefs.digest_includes_personal) {
    return out;
  }

  if (task.status === 'done') return out;

  const due = task.due_date ? new Date(task.due_date) : null;

  // due_soon at T-72h, T-24h, T-2h
  if (triggerKinds.has('due_soon') && due) {
    for (const window of [72, 24, 2] as const) {
      if (inWindow(due, now, window, 0.25)) {
        if (!allowed(prefs, 'due_soon', task.task_id)) continue;
        out.push({
          id: newId(),
          user_id: prefs.user_id,
          task_id: task.task_id,
          kind: 'due_soon',
          window_token: `due_soon:T-${window}h:${task.task_id}`,
          payload: { hours_until_due: window },
          created_at: now.toISOString(),
        });
      }
    }
  }

  if (triggerKinds.has('overdue') && due) {
    if (due.getTime() < now.getTime()) {
      if (allowed(prefs, 'overdue', task.task_id)) {
        // Bucket by day so we don't notify hourly forever.
        const dayKey = now.toISOString().slice(0, 10);
        out.push({
          id: newId(),
          user_id: prefs.user_id,
          task_id: task.task_id,
          kind: 'overdue',
          window_token: `overdue:${dayKey}:${task.task_id}`,
          created_at: now.toISOString(),
        });
      }
    }
  }

  if (triggerKinds.has('blocked') && task.status === 'blocked') {
    if (allowed(prefs, 'blocked', task.task_id)) {
      out.push({
        id: newId(),
        user_id: prefs.user_id,
        task_id: task.task_id,
        kind: 'blocked',
        window_token: `blocked:${task.task_id}`,
        created_at: now.toISOString(),
      });
    }
  }

  return out;
}
