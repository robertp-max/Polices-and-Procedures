import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import {
  CalendarApi, toPlannerPayload,
  type CalendarApiError, type PlannerEventResponse,
  type EnforcementSyncContext,
} from '@/policy/services/calendarApi';
import { computeEnforcement } from '@/policy/enforcement/enforcementEngine';
import { computeRiskScore } from '@/policy/audit/riskScoring';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { isComplianceRequired, complianceCategory } from '@/policy/utils/complianceClassification';

/** Compose an EnforcementSyncContext for a given event by reading live store state. */
function enforcementContextFor(ev: RegulatoryEvent): EnforcementSyncContext {
  const exec = useRegulatoryExecutionStore.getState();
  const enf  = useEnforcementStore.getState();
  const report = computeEnforcement({
    event: ev,
    stepStatus:    id => exec.effectiveStepStatus(ev, id),
    formStatus:    id => exec.effectiveFormStatus(ev, id),
    minutesStatus: () => exec.effectiveMinutesStatus(ev),
    evidence:      exec.evidence[ev.id] ?? [],
    approvals:     exec.approvals.filter(a => a.eventId === ev.id),
    completion:    exec.completions[ev.id],
    lock:          enf.getLock(ev.id),
    isComplete:    id => exec.completions[id]?.status === 'complete',
  });
  const risk = computeRiskScore(ev, report);
  return {
    riskLevel: risk.band,
    riskScore: risk.score,
    isLocked: report.isLocked,
    canComplete: report.canComplete,
    blockerCount: report.blockers.length,
    approvalGapCount: report.approvalGaps.length,
    summary: report.summary,
  };
}

/* ═══════════════════════════════════════════════════════════════
   Calendar Sync Store
   ----------------------------------------------------------------
   Implements the MANUAL, CONTROLLED calendar-sync contract:
     • NO sync on mount, on save, or on edit.
     • Users sync individual events via "Push to Google Calendar"
       or the agency-wide "Sync All Compliance Events" button.
     • Every event carries its own syncStatus, googleEventId,
       lastSyncedAt, and lastSyncError so the UI can surface
       required-event failures without silent loss.
     • Persistence is intentionally isolated to localStorage so
       the entire contract can be repointed at a database table
       without changing UI or callers — swap `persist(...)` out
       for a network-backed store when the backend DB is ready.
   ═══════════════════════════════════════════════════════════════ */

/** Per-event sync lifecycle as seen by the UI (regulatory-grade labels). */
export type EventSyncStatus = 'NOT_SYNCED' | 'SYNCING' | 'SYNCED' | 'ERROR';

/** Per-event compliance classification used by the sync surface. */
export type ComplianceCategory =
  | 'QAPI'
  | 'GOVERNING_BODY'
  | 'RISK'
  | 'COMPLIANCE'
  | 'OPERATIONS';

/** Full per-event sync record. All calendar mutations flow through this. */
export interface EventSyncMeta {
  appEventId: string;
  syncStatus: EventSyncStatus;
  googleEventId: string | null;
  lastSyncedAt: number | null;
  lastSyncError: string | null;
  /** Whether the last successful push CREATE-d or UPDATE-d the Google event. */
  lastAction: 'created' | 'updated' | null;
  /** Compliance classification — drives required-event hard failure handling. */
  category: ComplianceCategory;
  /** Whether this event is regulatorily required (cannot fail silently). */
  required: boolean;
}

/** Single-event sync outcome returned to UI callers. */
export interface SyncOutcome {
  ok: boolean;
  action?: 'created' | 'updated';
  googleEventId?: string;
  error?: string;
  /** True when the failing event is marked required=true. */
  requiredFailure?: boolean;
}

/** Per-event item in a bulk sync result, mirrored from the backend. */
export interface BulkSyncResultItem {
  appEventId: string;
  ok: boolean;
  googleEventId?: string;
  action?: 'created' | 'updated';
  error?: string;
}

/** UI-facing bulk sync summary. */
export interface BulkSyncSummary {
  at: number;
  total: number;
  created: number;
  updated: number;
  failed: number;
  /** Required events whose push failed; surfaced loudly in the UI. */
  failedRequired: string[];
  results: BulkSyncResultItem[];
}

export type SyncStatus = 'idle' | 'syncing' | 'ok' | 'error' | 'unconfigured';

interface CalendarSyncState {
  /** Per-event meta keyed by appEventId. The idMap below is retained for
   *  backward-compat callers but this is the authoritative store. */
  eventMeta: Record<string, EventSyncMeta>;
  /** @deprecated Prefer eventMeta[id].googleEventId. Kept for existing callers. */
  idMap: Record<string, string>;
  /** Last successful health check (ms epoch). */
  lastHealthOk?: number;
  /** Last bulk sync summary. */
  lastSync?: BulkSyncSummary;
  /** Global UI status for the header badge. */
  status: SyncStatus;
  /** Last global error (e.g. backend unreachable). */
  lastError?: { code: string; message: string };

  /* ── Queries ───────────────────────────────────────── */
  getMeta: (ev: RegulatoryEvent | string) => EventSyncMeta;

  /* ── Health ────────────────────────────────────────── */
  checkHealth: () => Promise<boolean>;

  /* ── Manual sync actions (NO auto-sync) ────────────── */
  syncEvent: (ev: RegulatoryEvent) => Promise<SyncOutcome>;
  syncAll:   (events: RegulatoryEvent[]) => Promise<BulkSyncSummary>;
  deleteEvent: (appEventId: string, opts?: { cancelOnly?: boolean }) => Promise<boolean>;

  /* ── Admin ─────────────────────────────────────────── */
  setMapping:    (appEventId: string, googleEventId: string | undefined) => void;
  resetMappings: () => void;
  clearError:    (appEventId: string) => void;
}

/** Build a default meta record for an event we have not touched yet. */
function defaultMeta(ev: RegulatoryEvent): EventSyncMeta {
  return {
    appEventId: ev.id,
    syncStatus: 'NOT_SYNCED',
    googleEventId: null,
    lastSyncedAt: null,
    lastSyncError: null,
    lastAction: null,
    category: complianceCategory(ev),
    required: isComplianceRequired(ev),
  };
}

export const useCalendarSyncStore = create<CalendarSyncState>()(
  persist(
    (set, get) => ({
      eventMeta: {},
      idMap: {},
      status: 'idle',

      getMeta: (arg) => {
        if (typeof arg === 'string') {
          return (
            get().eventMeta[arg] ?? {
              appEventId: arg,
              syncStatus: 'NOT_SYNCED',
              googleEventId: get().idMap[arg] ?? null,
              lastSyncedAt: null,
              lastSyncError: null,
              lastAction: null,
              category: 'OPERATIONS',
              required: false,
            }
          );
        }
        const existing = get().eventMeta[arg.id];
        if (existing) return existing;
        return { ...defaultMeta(arg), googleEventId: get().idMap[arg.id] ?? null };
      },

      checkHealth: async () => {
        try {
          const r = await CalendarApi.health();
          const ok = !!r.ok && !!r.calendar.reachable;
          set({
            status: ok ? 'ok' : 'error',
            lastHealthOk: ok ? Date.now() : get().lastHealthOk,
            lastError: ok ? undefined : { code: r.calendar.error ?? 'unknown', message: 'Calendar unreachable' },
          });
          return ok;
        } catch (e) {
          const err = e as CalendarApiError;
          set({
            status: 'unconfigured',
            lastError: { code: err.code ?? 'network_error', message: err.message ?? 'Network error' },
          });
          return false;
        }
      },

      /* ─── Single-event manual push ─── */
      syncEvent: async (ev) => {
        // Start: flip this event to SYNCING, leave all others untouched.
        set((s) => ({
          status: 'syncing',
          eventMeta: {
            ...s.eventMeta,
            [ev.id]: {
              ...(s.eventMeta[ev.id] ?? defaultMeta(ev)),
              syncStatus: 'SYNCING',
              lastSyncError: null,
            },
          },
        }));

        const existingGoogleId = get().eventMeta[ev.id]?.googleEventId ?? get().idMap[ev.id];
        const payload = toPlannerPayload(ev, enforcementContextFor(ev));

        try {
          const saved: PlannerEventResponse = existingGoogleId
            ? await CalendarApi.update(existingGoogleId, payload)
            : await CalendarApi.create(payload);

          const action: 'created' | 'updated' = saved.action ?? (existingGoogleId ? 'updated' : 'created');
          const now = Date.now();

          set((s) => ({
            status: 'ok',
            lastError: undefined,
            idMap: { ...s.idMap, [ev.id]: saved.googleEventId },
            eventMeta: {
              ...s.eventMeta,
              [ev.id]: {
                ...(s.eventMeta[ev.id] ?? defaultMeta(ev)),
                syncStatus: 'SYNCED',
                googleEventId: saved.googleEventId,
                lastSyncedAt: now,
                lastSyncError: null,
                lastAction: action,
              },
            },
          }));
          return { ok: true, action, googleEventId: saved.googleEventId };
        } catch (e) {
          const err = e as CalendarApiError;
          const message = err.message ?? 'Sync failed. Please retry or contact system admin.';
          const isRequired = get().getMeta(ev).required;
          set((s) => ({
            status: 'error',
            lastError: { code: err.code ?? 'internal_error', message },
            eventMeta: {
              ...s.eventMeta,
              [ev.id]: {
                ...(s.eventMeta[ev.id] ?? defaultMeta(ev)),
                syncStatus: 'ERROR',
                lastSyncError: message,
              },
            },
          }));
          return { ok: false, error: message, requiredFailure: isRequired };
        }
      },

      /* ─── Bulk manual push ─── */
      syncAll: async (events) => {
        const real = events.filter((e) => !e.isContext);

        // Stage every event as SYNCING so the UI reflects the in-flight state.
        set((s) => {
          const nextMeta = { ...s.eventMeta };
          for (const ev of real) {
            nextMeta[ev.id] = {
              ...(nextMeta[ev.id] ?? defaultMeta(ev)),
              syncStatus: 'SYNCING',
              lastSyncError: null,
            };
          }
          return { status: 'syncing', eventMeta: nextMeta };
        });

        try {
          const payloads = real.map((e) => toPlannerPayload(e, enforcementContextFor(e)));
          const res = await CalendarApi.sync(payloads);

          const now = Date.now();
          const resultMap = new Map<string, (typeof res.results)[number]>();
          for (const r of res.results) resultMap.set(r.appEventId, r);

          set((s) => {
            const nextMeta = { ...s.eventMeta };
            const nextIdMap = { ...s.idMap };
            for (const ev of real) {
              const r = resultMap.get(ev.id);
              const current = nextMeta[ev.id] ?? defaultMeta(ev);
              if (r?.ok) {
                if (r.googleEventId) nextIdMap[ev.id] = r.googleEventId;
                nextMeta[ev.id] = {
                  ...current,
                  syncStatus: 'SYNCED',
                  googleEventId: r.googleEventId ?? current.googleEventId,
                  lastSyncedAt: now,
                  lastSyncError: null,
                  lastAction: r.action ?? current.lastAction ?? 'created',
                };
              } else {
                nextMeta[ev.id] = {
                  ...current,
                  syncStatus: 'ERROR',
                  lastSyncError: r?.error ?? 'Sync failed. Please retry or contact system admin.',
                };
              }
            }
            return { eventMeta: nextMeta, idMap: nextIdMap };
          });

          const failedRequired = real
            .filter((e) => {
              const r = resultMap.get(e.id);
              return r && !r.ok && isComplianceRequired(e);
            })
            .map((e) => e.id);

          const summary: BulkSyncSummary = {
            at: now,
            total: res.count,
            created: res.createdCount,
            updated: res.updatedCount,
            failed: res.failedCount,
            failedRequired,
            results: res.results,
          };

          set({
            status: res.failedCount === 0 ? 'ok' : 'error',
            lastError: res.failedCount === 0
              ? undefined
              : { code: 'partial_failure', message: `${res.failedCount} event(s) failed to sync.` },
            lastSync: summary,
          });
          return summary;
        } catch (e) {
          const err = e as CalendarApiError;
          const message = err.message ?? 'Bulk sync failed.';
          // Everything we staged as SYNCING should flip to ERROR on transport failure.
          set((s) => {
            const nextMeta = { ...s.eventMeta };
            for (const ev of real) {
              nextMeta[ev.id] = {
                ...(nextMeta[ev.id] ?? defaultMeta(ev)),
                syncStatus: 'ERROR',
                lastSyncError: message,
              };
            }
            return { status: 'error', eventMeta: nextMeta, lastError: { code: err.code ?? 'internal_error', message } };
          });
          return {
            at: Date.now(),
            total: real.length,
            created: 0,
            updated: 0,
            failed: real.length,
            failedRequired: real.filter(isComplianceRequired).map((e) => e.id),
            results: real.map((e) => ({ appEventId: e.id, ok: false, error: message })),
          };
        }
      },

      deleteEvent: async (appEventId, opts) => {
        const googleId = get().eventMeta[appEventId]?.googleEventId ?? get().idMap[appEventId];
        if (!googleId) return true;
        try {
          await CalendarApi.remove(googleId, opts);
          set((s) => {
            const nextMap = { ...s.idMap };
            const nextMeta = { ...s.eventMeta };
            if (!opts?.cancelOnly) {
              delete nextMap[appEventId];
              delete nextMeta[appEventId];
            } else if (nextMeta[appEventId]) {
              nextMeta[appEventId] = {
                ...nextMeta[appEventId],
                syncStatus: 'SYNCED',
                lastSyncedAt: Date.now(),
              };
            }
            return { idMap: nextMap, eventMeta: nextMeta, status: 'ok', lastError: undefined };
          });
          return true;
        } catch (e) {
          const err = e as CalendarApiError;
          set({ status: 'error', lastError: { code: err.code ?? 'internal_error', message: err.message ?? 'Delete failed' } });
          return false;
        }
      },

      setMapping: (appEventId, googleEventId) =>
        set((s) => {
          const next = { ...s.idMap };
          if (googleEventId) next[appEventId] = googleEventId;
          else delete next[appEventId];
          return { idMap: next };
        }),

      resetMappings: () => set({ idMap: {}, eventMeta: {}, lastSync: undefined }),

      clearError: (appEventId) =>
        set((s) => {
          const m = s.eventMeta[appEventId];
          if (!m) return {};
          return {
            eventMeta: {
              ...s.eventMeta,
              [appEventId]: { ...m, lastSyncError: null, syncStatus: m.googleEventId ? 'SYNCED' : 'NOT_SYNCED' },
            },
          };
        }),
    }),
    {
      name: 'calendar-sync-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        eventMeta: s.eventMeta,
        idMap: s.idMap,
        lastSync: s.lastSync,
        lastHealthOk: s.lastHealthOk,
      }),
      // Future: swap this whole persist() for a DB-backed adapter without
      // changing any callers — the store API is identical.
    },
  ),
);
