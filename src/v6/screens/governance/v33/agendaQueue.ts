// Draft agenda queue — PORTAL PREVIEW ONLY.
//
// This is an honest, clearly-labeled local draft store. The server agenda of
// record is CES; nothing in this module claims to be a CES record. Items are
// persisted to localStorage under a preview-scoped key so a Governing Body
// member can stage decisions onto a proposed agenda and carry them into the
// ad hoc scheduler request body.

import { useSyncExternalStore } from 'react';

export interface AgendaQueueItem {
  id: string;
  decisionId: string;
  title: string;
  addedAt: string; // ISO timestamp
  source: string; // where the item was added from (e.g. 'decision-drawer', 'workflows')
}

export const AGENDA_QUEUE_STORAGE_KEY = 'gb-v3-PREVIEW-draft-agenda-queue';
export const AGENDA_QUEUE_DISCLAIMER =
  'Draft agenda queue — portal preview; server agenda of record is CES.';

type Listener = () => void;
const listeners = new Set<Listener>();

function readStorage(): AgendaQueueItem[] {
  try {
    const raw = window.localStorage.getItem(AGENDA_QUEUE_STORAGE_KEY);
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

// Cache so useSyncExternalStore gets a stable snapshot between mutations.
let snapshot: AgendaQueueItem[] = typeof window !== 'undefined' ? readStorage() : [];

function writeStorage(items: AgendaQueueItem[]): void {
  snapshot = items;
  try {
    window.localStorage.setItem(AGENDA_QUEUE_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — the in-memory snapshot still drives the session.
  }
  listeners.forEach((listener) => listener());
}

export function listAgendaItems(): AgendaQueueItem[] {
  return snapshot;
}

export type AddAgendaResult =
  | { ok: true; item: AgendaQueueItem }
  | { ok: false; reason: 'duplicate'; existing: AgendaQueueItem };

export function addAgendaItem(input: { decisionId: string; title: string; source: string }): AddAgendaResult {
  const existing = snapshot.find((item) => item.decisionId === input.decisionId);
  if (existing) return { ok: false, reason: 'duplicate', existing };
  const item: AgendaQueueItem = {
    id: `agenda-${input.decisionId}-${Date.now()}`,
    decisionId: input.decisionId,
    title: input.title,
    addedAt: new Date().toISOString(),
    source: input.source,
  };
  writeStorage([...snapshot, item]);
  return { ok: true, item };
}

export function removeAgendaItem(id: string): void {
  writeStorage(snapshot.filter((item) => item.id !== id));
}

export function isQueued(decisionId: string): boolean {
  return snapshot.some((item) => item.decisionId === decisionId);
}

export function subscribeAgendaQueue(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook over the queue (external-store subscription). */
export function useAgendaQueue(): AgendaQueueItem[] {
  return useSyncExternalStore(subscribeAgendaQueue, listAgendaItems, listAgendaItems);
}

/** Test hook: clear the queue. */
export function clearAgendaQueue(): void {
  writeStorage([]);
}
