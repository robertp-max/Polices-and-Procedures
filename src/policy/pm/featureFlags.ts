/**
 * PM Feature Flags.
 *
 * Spec: Builder/Compliance-Execution-Sprints/PM-Implementation-Plan.md §2
 *
 * Each PM phase ships behind a flag. Flags persist in localStorage so a
 * developer can toggle them at runtime via window.__pm.setFlag(name, true)
 * without a rebuild.
 *
 *   pm_layer_v1 → Phase 0/1 surfaces (My Tasks, Drawer, Filter, Card)
 *   pm_kanban   → Phase 2 (DnD Kanban)
 *   pm_gantt    → Phase 5 (Gantt + dependencies)
 */

import { useSyncExternalStore } from 'react';

export type PmFeatureFlag = 'pm_layer_v1' | 'pm_kanban' | 'pm_gantt';

const STORAGE_KEY = 'pm-feature-flags-v1';

/** All flags default ON in dev, ON in prod once architecture is stable. */
const DEFAULTS: Record<PmFeatureFlag, boolean> = {
  pm_layer_v1: true,
  pm_kanban: true,
  pm_gantt: true,
};

const subscribers = new Set<() => void>();
let cache: Record<PmFeatureFlag, boolean> | null = null;

function read(): Record<PmFeatureFlag, boolean> {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    cache = { ...DEFAULTS };
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Record<PmFeatureFlag, boolean>) } : { ...DEFAULTS };
  } catch {
    cache = { ...DEFAULTS };
  }
  return cache;
}

function write(next: Record<PmFeatureFlag, boolean>): void {
  cache = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  subscribers.forEach(fn => fn());
}

export function getFlag(flag: PmFeatureFlag): boolean {
  return read()[flag];
}

export function setFlag(flag: PmFeatureFlag, value: boolean): void {
  const next = { ...read(), [flag]: value };
  write(next);
}

export function getAllFlags(): Record<PmFeatureFlag, boolean> {
  return { ...read() };
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** React hook: returns the live boolean for the flag. */
export function usePmFlag(flag: PmFeatureFlag): boolean {
  return useSyncExternalStore(
    subscribe,
    () => read()[flag],
    () => DEFAULTS[flag],
  );
}

/* Expose a tiny dev console hook. */
if (typeof window !== 'undefined') {
  (window as unknown as { __pm?: { getFlag: typeof getFlag; setFlag: typeof setFlag; getAllFlags: typeof getAllFlags } }).__pm = {
    getFlag,
    setFlag,
    getAllFlags,
  };
}
