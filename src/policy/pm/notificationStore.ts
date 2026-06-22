/**
 * notificationStore — in-memory + persisted PM notification queue.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Notifications-and-Reminders.md §5
 *
 * The Decider (pure) emits candidate PmNotification rows. This store is the
 * queue/dispatch surface: it deduplicates by `window_token`, persists locally
 * for offline use, and (when wired) mirrors reads/acks to the PM API
 * `/pm/notifications` endpoints.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { pmApi, mirror } from './api/pmApiClient';
import type { PmNotification } from './notifications/decider';

const STORAGE_KEY = 'pm-notifications-v1';

interface NotificationState {
  notifications: PmNotification[];
  /** window_tokens seen so the decider's idempotency holds across runs. */
  tokens: Record<string, string>; // token -> notification id
  readIds: Record<string, string>; // notif id -> ISO timestamp

  /** Idempotent ingest. Drops anything whose window_token already exists. */
  ingest: (rows: PmNotification[]) => number;
  list: (userId?: string) => PmNotification[];
  unreadCount: (userId?: string) => number;
  markRead: (notifId: string) => void;
  markAllRead: (userId?: string) => void;
  clearAll: () => void;
  /** Hydrate from API for a user. */
  hydrateFromApi: (userId: string) => Promise<void>;
}

export const usePmNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      tokens: {},
      readIds: {},

      ingest: (rows) => {
        const cur = get();
        let added = 0;
        const next = [...cur.notifications];
        const tokens = { ...cur.tokens };
        const fresh: PmNotification[] = [];
        for (const r of rows) {
          if (tokens[r.window_token]) continue;
          tokens[r.window_token] = r.id;
          next.push(r);
          fresh.push(r);
          added++;
        }
        if (added > 0) {
          set({ notifications: next.slice(-500), tokens });
          // Fan out fresh rows to backend; server-side dedupe by window_token.
          for (const r of fresh) {
            mirror(pmApi.createNotification({
              id: r.id,
              user_id: r.user_id,
              task_id: r.task_id,
              kind: r.kind,
              window_token: r.window_token,
              payload: r.payload,
            }));
          }
        }
        return added;
      },

      list: (userId) => {
        const all = get().notifications;
        return userId ? all.filter(n => n.user_id === userId) : all;
      },

      unreadCount: (userId) => {
        const { notifications, readIds } = get();
        return notifications.filter(n =>
          (!userId || n.user_id === userId) && !readIds[n.id],
        ).length;
      },

      markRead: (notifId) => {
        set(s => ({ readIds: { ...s.readIds, [notifId]: new Date().toISOString() } }));
        const n = get().notifications.find(x => x.id === notifId);
        if (n) {
          // mirror ack — sk shape comes from server; we send a synthetic best-effort.
          mirror(pmApi.ackNotification(n.user_id, `client-ack#${n.id}`, n.id));
        }
      },

      markAllRead: (userId) => {
        const ts = new Date().toISOString();
        set(s => {
          const next = { ...s.readIds };
          for (const n of s.notifications) {
            if (userId && n.user_id !== userId) continue;
            if (!next[n.id]) next[n.id] = ts;
          }
          return { readIds: next };
        });
      },

      clearAll: () => set({ notifications: [], tokens: {}, readIds: {} }),

      hydrateFromApi: async (userId) => {
        try {
          const { notifications } = await pmApi.listNotifications(userId);
          // Server rows may not match PmNotification exactly; coerce best-effort.
          const rows: PmNotification[] = notifications.map(n => ({
            id: String(n.id ?? n.notification_id ?? `srv-${Date.now()}`),
            user_id: String(n.user_id ?? userId),
            task_id: String(n.task_id ?? ''),
            kind: (n.kind as PmNotification['kind']) ?? 'due_soon',
            window_token: String(n.window_token ?? `srv:${n.id}`),
            payload: (n.payload as Record<string, unknown>) ?? {},
            created_at: String(n.created_at ?? n.ts ?? new Date().toISOString()),
          }));
          get().ingest(rows);
        } catch (err) {
          console.warn('[notificationStore.hydrateFromApi] failed; offline mode', err);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? ({
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            } as unknown as Storage)
          : window.localStorage,
      ),
    },
  ),
);
