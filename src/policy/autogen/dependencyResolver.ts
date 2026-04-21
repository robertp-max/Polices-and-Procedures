import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventTemplate } from './types';
import { addDays, toISO, parseISO } from './scheduler';

/* ═══════════════════════════════════════════════════════════════
   Dependency Resolver
   ----------------------------------------------------------------
   Given a generated batch of events, this:
     1. Detects dependsOn references that point to templates
        generating in the same period and re-orders the batch so
        upstream events precede downstream ones.
     2. Rewires `dependsOn` from template ids to concrete event ids
        for the nearest upstream occurrence prior to the event.
     3. Enforces a minimum "lead" gap: downstream events must land
        at least `minLeadDays` after their upstream.
   ═══════════════════════════════════════════════════════════════ */

export interface DependencyResolveOptions {
  minLeadDays?: number;
}

export function resolveDependencies(
  events: RegulatoryEvent[],
  templates: EventTemplate[],
  opts: DependencyResolveOptions = {},
): RegulatoryEvent[] {
  const minLead = opts.minLeadDays ?? 1;

  // Sort by date first so "nearest prior occurrence" lookups are simple.
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  // Template id → event ids produced by that template (chronological).
  const tplToEvents = new Map<string, RegulatoryEvent[]>();
  for (const ev of sorted) {
    const tplId = (ev as RegulatoryEvent & { _templateId?: string })._templateId;
    if (!tplId) continue;
    const arr = tplToEvents.get(tplId) ?? [];
    arr.push(ev);
    tplToEvents.set(tplId, arr);
  }
  const templateById = new Map(templates.map(t => [t.id, t]));

  // Pass 1: rewrite dependsOn from template refs → concrete event ids
  const rewired = sorted.map(ev => {
    if (!ev.dependencies?.dependsOn?.length) return ev;
    const newDeps = ev.dependencies.dependsOn.map(depRef => {
      // If it's already a concrete event id (starts with EVT- or is in the batch), keep.
      if (!templateById.has(depRef)) return depRef;
      const candidates = (tplToEvents.get(depRef) ?? []).filter(c => c.date < ev.date);
      if (candidates.length === 0) return depRef; // keep template id; no upstream exists yet
      return candidates[candidates.length - 1].id;
    });
    return { ...ev, dependencies: { ...ev.dependencies, dependsOn: newDeps } };
  });

  // Pass 2: enforce min-lead gap — if an event lands too close to its upstream, push it.
  const byId = new Map(rewired.map(e => [e.id, e]));
  for (const ev of rewired) {
    for (const depId of ev.dependencies?.dependsOn ?? []) {
      const upstream = byId.get(depId);
      if (!upstream) continue;
      const up = parseISO(upstream.date);
      const dn = parseISO(ev.date);
      const delta = Math.round((dn.getTime() - up.getTime()) / 86_400_000);
      if (delta < minLead) {
        ev.date = toISO(addDays(up, minLead));
      }
    }
  }

  return rewired.sort((a, b) => a.date.localeCompare(b.date));
}

/** Topological sort of templates by their dependsOn relationships. */
export function topoSortTemplates(templates: EventTemplate[]): EventTemplate[] {
  const byId = new Map(templates.map(t => [t.id, t]));
  const visited = new Set<string>();
  const temp = new Set<string>();
  const out: EventTemplate[] = [];

  const visit = (t: EventTemplate) => {
    if (visited.has(t.id)) return;
    if (temp.has(t.id)) throw new Error(`Cyclic template dependency at ${t.id}`);
    temp.add(t.id);
    for (const depId of t.dependencies?.dependsOn ?? []) {
      const dep = byId.get(depId);
      if (dep) visit(dep);
    }
    temp.delete(t.id);
    visited.add(t.id);
    out.push(t);
  };

  for (const t of templates) visit(t);
  return out;
}
