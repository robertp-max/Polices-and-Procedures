import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Canonical in-app calendar dedup.
   Merges regulatory + autogen sources without deleting records.
   ═══════════════════════════════════════════════════════════════ */

export type CalendarEventSource = 'regulatory' | 'generated' | 'triggered';

export interface TaggedRegulatoryEvent extends RegulatoryEvent {
  _source?: CalendarEventSource;
  _suppressed?: boolean;
  _duplicateOf?: string;
  _dedupReason?: string;
}

export interface CanonicalDedupReport {
  events: TaggedRegulatoryEvent[];
  suppressed: Array<{
    duplicateId: string;
    canonicalId: string;
    source: CalendarEventSource;
    title: string;
    date: string;
    reason: string;
    confidence: 'exact' | 'high' | 'medium';
  }>;
}

function normalizeTitle(title: string): string {
  return title
    .replace(/^\[(Compliance|Audit|Training|Policy|Incident\/Safety)\]\s*/i, '')
    .replace(/\s*\(june\)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const SOURCE_RANK: Record<CalendarEventSource, number> = {
  regulatory: 3,
  generated: 2,
  triggered: 1,
};

function scoreEvent(event: RegulatoryEvent, source: CalendarEventSource): number {
  let score = SOURCE_RANK[source] * 100;
  if (event.workflowId) score += 25;
  if ((event.processFlow?.length ?? 0) > 0) score += 15;
  if ((event.policyRefs?.length ?? 0) > 0) score += 10;
  if ((event.requiredForms?.length ?? 0) > 0) score += 5;
  if (event.regulatoryDriver) score += 3;
  return score;
}

function dedupKey(event: RegulatoryEvent): string | null {
  if (event.id) return `id:${event.id}`;
  return null;
}

function fallbackKey(event: RegulatoryEvent): string {
  const wf = event.workflowId;
  if (wf) return `wf:${wf}|${event.date}`;
  return `title:${normalizeTitle(event.title)}|${event.date}`;
}

/**
 * Deduplicate calendar instances for display.
 * Priority: app event id → workflow+date → normalized title+date.
 */
export function dedupeCanonicalCalendarEvents(
  regulatory: RegulatoryEvent[],
  generated: RegulatoryEvent[] = [],
  triggered: RegulatoryEvent[] = [],
): CanonicalDedupReport {
  const tagged: TaggedRegulatoryEvent[] = [
    ...regulatory.map(e => ({ ...e, _source: 'regulatory' as const })),
    ...generated.map(e => ({ ...e, _source: 'generated' as const })),
    ...triggered.map(e => ({ ...e, _source: 'triggered' as const })),
  ].filter(e => !e.isContext);

  const byExactId = new Map<string, TaggedRegulatoryEvent>();
  const suppressed: CanonicalDedupReport['suppressed'] = [];

  for (const event of tagged) {
    const key = dedupKey(event);
    if (!key) continue;
    const existing = byExactId.get(event.id);
    if (!existing) {
      byExactId.set(event.id, event);
      continue;
    }
    const keep = scoreEvent(existing, existing._source ?? 'regulatory')
      >= scoreEvent(event, event._source ?? 'regulatory')
      ? existing
      : event;
    const drop = keep === existing ? event : existing;
    byExactId.set(event.id, keep);
    suppressed.push({
      duplicateId: drop.id,
      canonicalId: keep.id,
      source: drop._source ?? 'generated',
      title: drop.title,
      date: drop.date,
      reason: 'duplicate appEventId — autogen/regulatory overlap',
      confidence: 'exact',
    });
  }

  const groups = new Map<string, TaggedRegulatoryEvent[]>();
  for (const event of byExactId.values()) {
    const key = fallbackKey(event);
    const bucket = groups.get(key) ?? [];
    bucket.push(event);
    groups.set(key, bucket);
  }

  const result: TaggedRegulatoryEvent[] = [];
  for (const [, bucket] of groups) {
    if (bucket.length === 1) {
      result.push(bucket[0]);
      continue;
    }
    const ranked = [...bucket].sort((a, b) =>
      scoreEvent(b, b._source ?? 'regulatory') - scoreEvent(a, a._source ?? 'regulatory'),
    );
    const winner = ranked[0];
    result.push(winner);
    for (const dup of ranked.slice(1)) {
      suppressed.push({
        duplicateId: dup.id,
        canonicalId: winner.id,
        source: dup._source ?? 'generated',
        title: dup.title,
        date: dup.date,
        reason: dup.workflowId && winner.workflowId && dup.workflowId === winner.workflowId
          ? 'same workflow + date — suppressed secondary source'
          : 'same normalized title + date — suppressed near-duplicate',
        confidence: normalizeTitle(dup.title) === normalizeTitle(winner.title) ? 'high' : 'medium',
      });
    }
  }

  return { events: result, suppressed };
}