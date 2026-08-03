// Draft agenda queue — PORTAL PREVIEW ONLY.
//
// This is an honest, clearly-labeled local draft store. The server agenda of
// record is CES; nothing in this module claims to be a CES record. Items are
// persisted to localStorage under a preview-scoped key so a Governing Body
// member can stage decisions onto a proposed agenda and carry them into the
// ad hoc scheduler request body.

import { useCallback, useSyncExternalStore } from 'react';

export interface AgendaQueueItem {
  id: string;
  decisionId: string;
  title: string;
  addedAt: string; // ISO timestamp
  source: string; // where the item was added from (e.g. 'decision-drawer', 'workflows')
}

/**
 * Agenda queue keys are LEARNER-SCOPED: `gb-v3:preview:agenda:{learnerId}`.
 * A shared browser must never show learner A's staged agenda items to
 * learner B. The pre-scoping global key is ignored (never adopted); it can
 * only be purged via `purgeLegacyAgendaQueue()`.
 */
export const LEGACY_AGENDA_QUEUE_STORAGE_KEY = 'gb-v3-PREVIEW-draft-agenda-queue';

export function agendaQueueStorageKey(learnerId: string): string {
  return `gb-v3:preview:agenda:${learnerId}`;
}

export const AGENDA_QUEUE_DISCLAIMER =
  'Draft agenda queue — portal preview; server agenda of record is CES.';

type Listener = () => void;
const listeners = new Set<Listener>();

function readStorage(learnerId: string): AgendaQueueItem[] {
  try {
    const raw = window.localStorage.getItem(agendaQueueStorageKey(learnerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AgendaQueueItem =>
        typeof item === 'object' && item !== null
        && typeof (item as AgendaQueueItem).id === 'string'
        && typeof (item as AgendaQueueItem).decisionId === 'string'
        && typeof (item as AgendaQueueItem).title === 'string',
    );
  } catch {
    return [];
  }
}

const EMPTY: AgendaQueueItem[] = [];

// Per-learner snapshot cache so useSyncExternalStore gets a stable reference
// between mutations, and so one learner's items can never leak into another's.
const snapshots = new Map<string, AgendaQueueItem[]>();

function snapshotFor(learnerId: string): AgendaQueueItem[] {
  if (!learnerId) return EMPTY;
  let cached = snapshots.get(learnerId);
  if (!cached) {
    cached = typeof window !== 'undefined' ? readStorage(learnerId) : [];
    snapshots.set(learnerId, cached);
  }
  return cached;
}

function writeStorage(learnerId: string, items: AgendaQueueItem[]): void {
  snapshots.set(learnerId, items);
  try {
    window.localStorage.setItem(agendaQueueStorageKey(learnerId), JSON.stringify(items));
  } catch {
    // Storage unavailable — the in-memory snapshot still drives the session.
  }
  listeners.forEach((listener) => listener());
}

export function listAgendaItems(learnerId: string): AgendaQueueItem[] {
  return snapshotFor(learnerId);
}

export type AddAgendaResult =
  | { ok: true; item: AgendaQueueItem }
  | { ok: false; reason: 'duplicate'; existing: AgendaQueueItem }
  | { ok: false; reason: 'no-learner' };

export function addAgendaItem(
  learnerId: string,
  input: { decisionId: string; title: string; source: string },
): AddAgendaResult {
  if (!learnerId) return { ok: false, reason: 'no-learner' };
  const current = snapshotFor(learnerId);
  const existing = current.find((item) => item.decisionId === input.decisionId);
  if (existing) return { ok: false, reason: 'duplicate', existing };
  const item: AgendaQueueItem = {
    id: `agenda-${input.decisionId}-${Date.now()}`,
    decisionId: input.decisionId,
    title: input.title,
    addedAt: new Date().toISOString(),
    source: input.source,
  };
  writeStorage(learnerId, [...current, item]);
  return { ok: true, item };
}

export function removeAgendaItem(learnerId: string, id: string): void {
  if (!learnerId) return;
  writeStorage(learnerId, snapshotFor(learnerId).filter((item) => item.id !== id));
}

export function isQueued(learnerId: string, decisionId: string): boolean {
  return snapshotFor(learnerId).some((item) => item.decisionId === decisionId);
}

export function subscribeAgendaQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook over the calling learner's queue (external-store subscription). */
export function useAgendaQueue(learnerId: string): AgendaQueueItem[] {
  const getSnapshot = useCallback(() => snapshotFor(learnerId), [learnerId]);
  return useSyncExternalStore(subscribeAgendaQueue, getSnapshot, getSnapshot);
}

/** Purge the pre-scoping global key. Never adopted into a learner namespace. */
export function purgeLegacyAgendaQueue(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_AGENDA_QUEUE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Test hook: clear one learner's queue. */
export function clearAgendaQueue(learnerId: string): void {
  if (!learnerId) return;
  writeStorage(learnerId, []);
}
