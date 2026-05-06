/**
 * notificationTicker — periodic scan that feeds the decider.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Notifications-and-Reminders.md §4
 *
 * Runs `decideNotifications()` for every active task in the projector, then
 * ingests resulting rows into the local notification store. Idempotency is
 * handled by the store via window_token.
 */

import { useEffect } from 'react';
import { useProjectedTasks } from './taskProjection';
import { usePmNotificationStore } from './notificationStore';
import { decideNotifications, type NotificationPrefs } from './notifications/decider';
import type { Task } from './types';

const DEFAULT_PREFS: NotificationPrefs = {
  user_id: 'me',
  channels: { in_app: true, email_digest: 'off' },
  digest_includes_personal: true,
};

const TICK_MS = 60 * 1000; // every minute

export function tickOnce(now: Date, tasks: Task[], prefs: NotificationPrefs): number {
  const store = usePmNotificationStore.getState();
  const all = [];
  for (const t of tasks) {
    const rows = decideNotifications({ now, task: t, prefs });
    for (const r of rows) all.push(r);
  }
  return store.ingest(all);
}

/**
 * React hook: starts the ticker on mount, cleans up on unmount.
 * Pass userId to scope user-specific prefs / hydration.
 */
export function usePmNotificationTicker(userId: string = 'me'): void {
  const tasks = useProjectedTasks('full');

  useEffect(() => {
    const prefs: NotificationPrefs = { ...DEFAULT_PREFS, user_id: userId };
    // Initial server hydrate + first tick.
    void usePmNotificationStore.getState().hydrateFromApi(userId);
    tickOnce(new Date(), tasks, prefs);

    const handle = window.setInterval(() => {
      tickOnce(new Date(), tasks, prefs);
    }, TICK_MS);
    return () => window.clearInterval(handle);
  }, [userId, tasks]);
}
