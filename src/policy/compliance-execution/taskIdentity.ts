import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventTask } from './types';
import { buildDeterministicTaskId, deriveDefaultEventTasks } from './eventTaskAdapter';

const LEGACY_SOURCE_PREFIX = 'legacy-no-source:';

const SOURCE_PREFIXES = ['processflow:', 'form:', 'approval:', 'minutes:', 'manual:', 'generated:'] as const;

/** Align persisted / hand-edited source keys with deriveDefaultEventTasks (`processFlow:` casing). */
export function canonicalizeTaskSourceId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  for (const p of SOURCE_PREFIXES) {
    if (lower.startsWith(p)) {
      const canonicalPrefix = p === 'processflow:' ? 'processFlow:' : p;
      return canonicalPrefix + trimmed.slice(p.length);
    }
  }
  return trimmed;
}

/** Matches final segment of `buildDeterministicTaskId` (6-char base36 hash). */
export function taskIdHasDeterministicHashSuffix(id: string): boolean {
  if (!id.startsWith('TASK-')) return false;
  const last = id.split('-').pop() ?? '';
  return /^[0-9A-Z]{6}$/.test(last);
}

/** Legacy `createTask` id algorithm (pre-unification). Used only for migration remaps. */
export function legacyStableAlternateTaskId(eventId: string, taskSourceId: string): string {
  const cleanForId = (value: string) => value.replace(/[^A-Za-z0-9-]/g, '-');
  let hash = 5381;
  for (let i = 0; i < taskSourceId.length; i += 1) {
    hash = ((hash << 5) + hash) ^ taskSourceId.charCodeAt(i);
  }
  const h = (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  const sourceSlug = cleanForId(taskSourceId).toUpperCase().slice(0, 58);
  return `TASK-${cleanForId(eventId)}-${sourceSlug}-${h}`;
}

function stableLegacySourceFromRawId(rawId: string): string {
  const slug = rawId.replace(/[^A-Za-z0-9:.-]/g, '-').slice(0, 120);
  return `${LEGACY_SOURCE_PREFIX}${slug}`;
}

/**
 * Single normalization entry for EventTask identity entering UI or persistence repair.
 * - canonical id = buildDeterministicTaskId(eventId, taskSourceId)
 * - never trust persisted id when taskSourceId is present
 */
export function normalizeEventTaskIdentity(canonicalEventId: string, task: EventTask): EventTask {
  // Signer tasks (SIGN-...) have their own deterministic ID scheme — skip re-ID
  if (task.isSignerTask && task.id.startsWith('SIGN-')) {
    return { ...task, eventId: canonicalEventId };
  }
  let taskSourceId = task.taskSourceId?.trim()
    ? canonicalizeTaskSourceId(task.taskSourceId)
    : '';
  if (!taskSourceId) {
    taskSourceId = stableLegacySourceFromRawId(task.id || `anon-${task.title?.slice(0, 24) ?? 'task'}`);
  }
  const canonicalId = buildDeterministicTaskId(canonicalEventId, taskSourceId);
  const legacyId = task.id && task.id !== canonicalId ? task.id : task.legacyId;
  const next: EventTask = {
    ...task,
    id: canonicalId,
    eventId: canonicalEventId,
    taskSourceId,
  };
  if (legacyId && legacyId !== canonicalId) {
    next.legacyId = legacyId;
  }
  return next;
}

function taskUpdatedAtMs(task: EventTask): number {
  const raw = task.updatedAt || task.createdAt || '';
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}

/** Dedupe by canonical id; on collision keep the most recently updated row. */
export function dedupeEventTasksByCanonicalId(tasks: EventTask[], context: string): EventTask[] {
  const byId = new Map<string, EventTask>();
  const dupLog: string[] = [];
  for (const task of tasks) {
    const prev = byId.get(task.id);
    if (!prev) {
      byId.set(task.id, task);
      continue;
    }
    dupLog.push(task.id);
    byId.set(task.id, taskUpdatedAtMs(task) >= taskUpdatedAtMs(prev) ? task : prev);
  }
  const isViteDev = typeof import.meta !== 'undefined' && !!(import.meta as ImportMeta).env?.DEV;
  if (isViteDev && dupLog.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[taskIdentity] dedupeEventTasksByCanonicalId (${context}): merged duplicate ids`, dupLog);
  }
  return Array.from(byId.values());
}

function stableHash36(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

/**
 * Final render-safety: canonicalize ids and dedupe. If duplicate canonical ids remain
 * after dedupe (should not), repair with a deterministic suffix and log (dev only).
 */
export function normalizeAndDedupeTasksForRender(eventId: string, tasks: EventTask[], context: string): EventTask[] {
  const pass1 = tasks.map(t =>
    normalizeEventTaskIdentity(eventId, {
      ...t,
      taskSourceId: t.taskSourceId ? canonicalizeTaskSourceId(t.taskSourceId) : t.taskSourceId,
    }),
  );
  const preIds = pass1.map(t => t.id);
  const isViteDev = typeof import.meta !== 'undefined' && !!(import.meta as ImportMeta).env?.DEV;
  if (isViteDev && new Set(preIds).size !== preIds.length) {
    const counts = new Map<string, number>();
    for (const id of preIds) counts.set(id, (counts.get(id) ?? 0) + 1);
    const dupes = [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id);
    // eslint-disable-next-line no-console
    console.warn(`[taskIdentity] pre-dedupe duplicate ids (${context} / ${eventId})`, dupes);
  }
  let list = dedupeEventTasksByCanonicalId(pass1, `renderDedupe:${context}:${eventId}`);
  const seen = new Set<string>();
  const out: EventTask[] = [];
  const dupDetails: string[] = [];
  for (let i = 0; i < list.length; i += 1) {
    const task = list[i]!;
    if (!seen.has(task.id)) {
      seen.add(task.id);
      out.push(task);
      continue;
    }
    const basis = `${task.taskSourceId}|${task.title}|${i}`;
    const dis = stableHash36(basis);
    const nextId = `${task.id}-R${dis}`;
    dupDetails.push(`${task.id} -> ${nextId}`);
    out.push({ ...task, id: nextId, legacyId: task.legacyId ?? task.id });
  }
  if (isViteDev && dupDetails.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(`[taskIdentity] normalizeAndDedupeTasksForRender collision repair (${context} / ${eventId})`, dupDetails);
  }
  return out;
}

/**
 * Merge derived regulatory tasks with persisted overrides without letting override.id
 * replace canonical deterministic ids.
 */
export function mergeDerivedEventTasksWithOverrides(
  eventId: string,
  derived: EventTask[],
  overrides: EventTask[],
): EventTask[] {
  const mergedBySource = new Map<string, EventTask>();
  const mergedById = new Map<string, EventTask>();

  for (const task of derived) {
    const src = canonicalizeTaskSourceId(task.taskSourceId);
    const row = src === task.taskSourceId ? task : { ...task, taskSourceId: src };
    mergedBySource.set(src, row);
    mergedById.set(row.id, row);
  }

  for (const rawOverride of overrides) {
    const rawSourceKey = rawOverride.taskSourceId?.trim()
      ? canonicalizeTaskSourceId(rawOverride.taskSourceId.trim())
      : '';
    const normalizedOverride = normalizeEventTaskIdentity(eventId, { ...rawOverride, eventId });

    if (rawSourceKey && mergedBySource.has(rawSourceKey)) {
      const base = mergedBySource.get(rawSourceKey)!;
      const legacyOverrideId = rawOverride.id && rawOverride.id !== base.id ? rawOverride.id : undefined;
      const merged: EventTask = {
        ...base,
        ...normalizedOverride,
        id: base.id,
        taskSourceId: base.taskSourceId,
        eventId: base.eventId,
        legacyId: legacyOverrideId ?? base.legacyId,
      };
      mergedBySource.set(rawSourceKey, merged);
      mergedById.set(merged.id, merged);
      continue;
    }

    if (mergedById.has(normalizedOverride.id)) {
      const base = mergedById.get(normalizedOverride.id)!;
      const merged: EventTask = {
        ...base,
        ...normalizedOverride,
        id: base.id,
        taskSourceId: base.taskSourceId,
        eventId: base.eventId,
        legacyId:
          (rawOverride.id && rawOverride.id !== base.id ? rawOverride.id : undefined)
          ?? base.legacyId
          ?? normalizedOverride.legacyId,
      };
      mergedById.set(normalizedOverride.id, merged);
      if (merged.taskSourceId) mergedBySource.set(merged.taskSourceId, merged);
      continue;
    }

    if (rawSourceKey) {
      const canonicalId = buildDeterministicTaskId(eventId, rawSourceKey);
      const normalized: EventTask = {
        ...normalizedOverride,
        id: canonicalId,
        taskSourceId: rawSourceKey,
        eventId,
        legacyId: rawOverride.id && rawOverride.id !== canonicalId ? rawOverride.id : normalizedOverride.legacyId,
      };
      mergedBySource.set(rawSourceKey, normalized);
      mergedById.set(canonicalId, normalized);
    } else {
      mergedById.set(normalizedOverride.id, normalizedOverride);
    }
  }

  const combined: EventTask[] = [...mergedBySource.values()];
  const seen = new Set(combined.map(t => t.id));
  for (const t of mergedById.values()) {
    if (!seen.has(t.id)) {
      combined.push(t);
      seen.add(t.id);
    }
  }
  const normalizedList = combined.map(t => normalizeEventTaskIdentity(eventId, t));
  const deduped = dedupeEventTasksByCanonicalId(normalizedList, `merge:${eventId}`);
  return normalizeAndDedupeTasksForRender(eventId, deduped, 'postMerge');
}

export function evidenceTaskIdMatchesTask(task: EventTask, evidenceTaskId: string): boolean {
  if (!evidenceTaskId) return false;
  if (evidenceTaskId === task.id) return true;
  if (task.legacyId && evidenceTaskId === task.legacyId) return true;
  // Signer tasks match evidence from their parent form task
  if (task.isSignerTask && task.parentFormTaskId && evidenceTaskId === task.parentFormTaskId) return true;
  return false;
}

/** Build remap from any legacy task id variant to canonical id for one regulatory event instance. */
export function buildTaskIdRemapForEventInstance(
  eventId: string,
  sourceEvent: RegulatoryEvent | undefined,
  overrideRows: EventTask[],
): Map<string, string> {
  const remap = new Map<string, string>();
  if (sourceEvent) {
    const derived = deriveDefaultEventTasks(sourceEvent, eventId, {});
    for (const d of derived) {
      remap.set(d.id, d.id);
      const alt = legacyStableAlternateTaskId(eventId, d.taskSourceId);
      if (alt !== d.id) remap.set(alt, d.id);
    }
  }
  for (const row of overrideRows) {
    const normalized = normalizeEventTaskIdentity(eventId, {
      ...row,
      eventId,
      taskSourceId: row.taskSourceId ? canonicalizeTaskSourceId(row.taskSourceId) : row.taskSourceId,
    });
    if (row.id && row.id !== normalized.id) {
      remap.set(row.id, normalized.id);
    }
    remap.set(normalized.id, normalized.id);
    if (row.taskSourceId) {
      const alt = legacyStableAlternateTaskId(eventId, row.taskSourceId);
      remap.set(alt, normalized.id);
    }
  }
  return remap;
}
