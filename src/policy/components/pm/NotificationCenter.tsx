/**
 * NotificationCenter — bell + dropdown panel.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Notifications-and-Reminders.md §6
 *
 * Reads from `usePmNotificationStore`. Caller is responsible for mounting the
 * ticker (e.g., via `usePmNotificationTicker` near the app root or PM page).
 */

import { useMemo, useState, type ReactElement } from 'react';
import { usePmNotificationStore } from '@/policy/pm/notificationStore';
import type { NotificationKind, PmNotification } from '@/policy/pm/notifications/decider';

const KIND_LABEL: Record<NotificationKind, string> = {
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  mention: 'Mentioned',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
  blocked: 'Blocked',
  unblocked: 'Unblocked',
  approval_required: 'Approval Required',
  evidence_added: 'Evidence Added',
  sprint_starting: 'Sprint Starting',
  sprint_ending: 'Sprint Ending',
  weekend_scheduled: 'Weekend Scheduled',
};

const KIND_TONE: Record<NotificationKind, string> = {
  assigned: 'text-cyan-200',
  unassigned: 'text-white/60',
  mention: 'text-cyan-200',
  due_soon: 'text-amber-200',
  overdue: 'text-pink-300',
  blocked: 'text-pink-300',
  unblocked: 'text-emerald-200',
  approval_required: 'text-amber-200',
  evidence_added: 'text-emerald-200',
  sprint_starting: 'text-cyan-200',
  sprint_ending: 'text-amber-200',
  weekend_scheduled: 'text-amber-200',
};

export interface NotificationCenterProps {
  userId?: string;
  onOpenTask?: (taskId: string) => void;
}

export function NotificationCenter({
  userId = 'me',
  onOpenTask,
}: NotificationCenterProps): ReactElement {
  const [open, setOpen] = useState(false);
  const all = usePmNotificationStore(s => s.notifications);
  const readIds = usePmNotificationStore(s => s.readIds);
  const markRead = usePmNotificationStore(s => s.markRead);
  const markAllRead = usePmNotificationStore(s => s.markAllRead);

  const visible = useMemo(
    () =>
      [...all]
        .filter(n => n.user_id === userId)
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .slice(0, 50),
    [all, userId],
  );

  const unread = useMemo(
    () => visible.filter(n => !readIds[n.id]).length,
    [visible, readIds],
  );

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={`Notifications (${unread} unread)`}
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-md hover:bg-white/10 text-white/80"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto rounded-lg border border-white/10 bg-[#0f1420] shadow-xl z-50">
          <header className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => markAllRead(userId)}
                className="text-xs text-cyan-300 hover:text-cyan-200"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
          </header>
          {visible.length === 0 ? (
            <div className="p-6 text-center text-sm text-white/40">No notifications.</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {visible.map(n => {
                const isRead = !!readIds[n.id];
                return (
                  <li
                    key={n.id}
                    className={`p-3 hover:bg-white/5 cursor-pointer ${isRead ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (!isRead) markRead(n.id);
                      onOpenTask?.(n.task_id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className={`font-semibold ${KIND_TONE[n.kind]}`}>
                        {KIND_LABEL[n.kind] ?? n.kind}
                      </span>
                      <span className="text-white/40">{relTime(n.created_at)}</span>
                    </div>
                    <div className="text-sm text-white/80 truncate">{summarize(n)}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5 truncate">{n.task_id}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function summarize(n: PmNotification): string {
  if (n.kind === 'due_soon' && n.payload && typeof n.payload['hours_until_due'] === 'number') {
    return `Due in ${n.payload['hours_until_due']}h`;
  }
  if (n.kind === 'overdue') return 'This task is past its due date.';
  if (n.kind === 'blocked') return 'Marked blocked.';
  return KIND_LABEL[n.kind] ?? n.kind;
}

function relTime(iso: string): string {
  const dt = Date.now() - new Date(iso).getTime();
  const m = Math.floor(dt / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
