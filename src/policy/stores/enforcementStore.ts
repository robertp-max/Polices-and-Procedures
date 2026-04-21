import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ActorContext, AuditAction, AuditEntry, Escalation, LockState,
} from '@/policy/enforcement/types';
import { canUnlock } from '@/policy/enforcement/roleHierarchy';

/* ═══════════════════════════════════════════════════════════════
   Enforcement Store
   ----------------------------------------------------------------
   Owns the audit trail, the per-event lock state, the escalation
   queue, and the current actor context used to stamp every action.

   Persisted to localStorage. The audit log is append-only — there
   is no clear-entry API exposed to UI. resetAll() is only used by
   demo/reset affordances and is itself audit-logged.
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_ACTOR: ActorContext = {
  userId: 'demo-user',
  displayName: 'Current User',
  role: 'Administrator', // demo default — real deploys fetch from auth
};

interface EnforcementState {
  actor: ActorContext;
  auditLog: AuditEntry[];
  locks:    Record<string, LockState>;
  escalations: Escalation[];

  /* ── actor ── */
  setActor: (a: ActorContext) => void;

  /* ── audit ── */
  log: (entry: Omit<AuditEntry, 'id' | 'ts' | 'actor' | 'actorRole'> & { actorOverride?: string }) => string;
  queryByEvent: (eventId: string) => AuditEntry[];
  recentActions: (limit?: number) => AuditEntry[];

  /* ── locks ── */
  getLock: (eventId: string) => LockState | undefined;
  isLocked: (eventId: string) => boolean;
  lock:   (eventId: string, reason?: string, unlockRole?: string) => void;
  unlock: (eventId: string, reason?: string) => { ok: boolean; message: string };

  /* ── escalations ── */
  raiseEscalation: (e: Omit<Escalation, 'id'>) => string;
  acknowledge:     (id: string, note?: string) => void;
  resolve:         (id: string, note?: string) => void;
  clearEventEscalations: (eventId: string) => void;
  escalationsForEvent:   (eventId: string) => Escalation[];
  openEscalationCount:   () => number;

  /* ── reset (demo only — audit-logged) ── */
  resetAll: () => void;
}

const nowIso = () => new Date().toISOString();
const id = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const useEnforcementStore = create<EnforcementState>()(
  persist(
    (set, get) => ({
      actor: DEFAULT_ACTOR,
      auditLog: [],
      locks: {},
      escalations: [],

      setActor: (a) => set({ actor: a }),

      /* ── audit ── */
      log: (entry) => {
        const actor = get().actor;
        const e: AuditEntry = {
          id: id('A'),
          ts: nowIso(),
          actor: entry.actorOverride ?? actor.displayName,
          actorRole: actor.role,
          action: entry.action,
          eventId: entry.eventId,
          targetKind: entry.targetKind,
          targetId: entry.targetId,
          before: entry.before,
          after: entry.after,
          reason: entry.reason,
          riskLevel: entry.riskLevel,
        };
        set((s) => ({ auditLog: [e, ...s.auditLog].slice(0, 5000) }));
        return e.id;
      },

      queryByEvent: (eventId) =>
        get().auditLog.filter((e) => e.eventId === eventId),

      recentActions: (limit = 50) => get().auditLog.slice(0, limit),

      /* ── locks ── */
      getLock: (eventId) => get().locks[eventId],
      isLocked: (eventId) => !!get().locks[eventId]?.locked,

      lock: (eventId, reason, unlockRole = 'Administrator') => {
        const actor = get().actor;
        const prev = get().locks[eventId];
        const next: LockState = {
          eventId,
          locked: true,
          lockedAt: nowIso(),
          lockedBy: actor.displayName,
          reason,
          unlockRole,
        };
        set((s) => ({ locks: { ...s.locks, [eventId]: next } }));
        get().log({
          action: 'event.locked' as AuditAction,
          eventId,
          before: prev,
          after: next,
          reason,
        });
      },

      unlock: (eventId, reason) => {
        const actor = get().actor;
        const prev = get().locks[eventId];
        if (!prev?.locked) return { ok: true, message: 'Event was not locked.' };
        if (!canUnlock(actor.role, prev.unlockRole)) {
          get().log({
            action: 'mutation.blocked' as AuditAction,
            eventId,
            reason: `Unlock refused: actor role "${actor.role}" lacks authority for "${prev.unlockRole}"`,
          });
          return { ok: false, message: `Your role (${actor.role}) cannot unlock this event. Required: ${prev.unlockRole}.` };
        }
        const next: LockState = { ...prev, locked: false };
        set((s) => ({ locks: { ...s.locks, [eventId]: next } }));
        get().log({
          action: 'event.unlocked' as AuditAction,
          eventId,
          before: prev,
          after: next,
          reason,
        });
        return { ok: true, message: 'Event unlocked.' };
      },

      /* ── escalations ── */
      raiseEscalation: (e) => {
        const full: Escalation = { ...e, id: id('E') };
        set((s) => ({ escalations: [full, ...s.escalations] }));
        get().log({
          action: 'escalation.raised' as AuditAction,
          eventId: e.eventId,
          targetKind: 'escalation',
          targetId: full.id,
          after: full,
          reason: e.reason,
        });
        return full.id;
      },

      acknowledge: (escId, note) => {
        const prev = get().escalations.find((e) => e.id === escId);
        if (!prev) return;
        set((s) => ({
          escalations: s.escalations.map((e) =>
            e.id === escId ? { ...e, status: 'acknowledged' } : e,
          ),
        }));
        get().log({
          action: 'escalation.raised' as AuditAction,
          eventId: prev.eventId,
          targetId: escId,
          reason: note ?? 'Escalation acknowledged',
        });
      },

      resolve: (escId, note) => {
        const prev = get().escalations.find((e) => e.id === escId);
        if (!prev) return;
        const next: Escalation = { ...prev, status: 'resolved', resolvedAt: nowIso(), resolvedBy: get().actor.displayName };
        set((s) => ({ escalations: s.escalations.map((e) => (e.id === escId ? next : e)) }));
        get().log({
          action: 'escalation.resolved' as AuditAction,
          eventId: prev.eventId,
          targetId: escId,
          before: prev,
          after: next,
          reason: note,
        });
      },

      clearEventEscalations: (eventId) =>
        set((s) => ({ escalations: s.escalations.filter((e) => e.eventId !== eventId) })),

      escalationsForEvent: (eventId) =>
        get().escalations.filter((e) => e.eventId === eventId),

      openEscalationCount: () =>
        get().escalations.filter((e) => e.status === 'open').length,

      resetAll: () => {
        get().log({
          action: 'mutation.blocked' as AuditAction,
          eventId: '__system__',
          reason: 'resetAll() called — enforcement state cleared.',
        });
        set({ auditLog: [], locks: {}, escalations: [] });
      },
    }),
    {
      name: 'enforcement-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        actor: s.actor,
        auditLog: s.auditLog,
        locks: s.locks,
        escalations: s.escalations,
      }),
    },
  ),
);

/* ─── Hook helpers with stable memoized slices ──────────── */

export function useEventAuditLog(eventId: string): AuditEntry[] {
  const log = useEnforcementStore((s) => s.auditLog);
  return useMemo(() => log.filter((e) => e.eventId === eventId), [log, eventId]);
}

export function useEventEscalations(eventId: string): Escalation[] {
  const all = useEnforcementStore((s) => s.escalations);
  return useMemo(() => all.filter((e) => e.eventId === eventId), [all, eventId]);
}

export function useOpenEscalationCount(): number {
  const all = useEnforcementStore((s) => s.escalations);
  return useMemo(() => all.filter((e) => e.status === 'open').length, [all]);
}
