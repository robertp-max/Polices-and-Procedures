import type { PlannerEventResponse } from './mappers.js';
import { readEventId } from './mappers.js';
import type { calendar_v3 } from 'googleapis';

/* ═══════════════════════════════════════════════════════════════
   Safe canonical dedup for Google Calendar event lists.
   Suppresses non-canonical duplicates; never deletes automatically.
   ═══════════════════════════════════════════════════════════════ */

export type DedupConfidence = 'exact' | 'high' | 'medium' | 'low';

export interface SuppressedDuplicate {
  googleEventId: string;
  appEventId?: string;
  title: string;
  date: string;
  canonicalGoogleEventId: string;
  canonicalAppEventId?: string;
  reason: string;
  confidence: DedupConfidence;
}

export interface GoogleCalendarDedupResult {
  items: PlannerEventResponse[];
  suppressed: SuppressedDuplicate[];
}

function normalizeTitle(title: string): string {
  return title
    .replace(/^\[(Compliance|Audit|Training|Policy|Incident\/Safety)\]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function eventDate(ev: PlannerEventResponse): string {
  return ev.date ?? '';
}

function rankPlannerEvent(ev: PlannerEventResponse): number {
  let score = 0;
  if (ev.event_id) score += 100;
  if (ev.event_id && /\d{8}/.test(ev.event_id) && !ev.event_id.startsWith('EVT-')) score += 25;
  if (ev.description?.includes('CES EVENT')) score += 40;
  if (ev.workflowId) score += 20;
  if ((ev.policyRefs?.length ?? 0) > 0) score += 10;
  if (!/^\[Compliance\]/i.test(ev.title)) score += 5;
  if (ev.source === 'google') score += 5;
  return score;
}

/**
 * Deduplicate planner responses for API list views.
 * Priority: appEventId/event_id → workflowId+date → title+date.
 */
export function dedupePlannerEvents(items: PlannerEventResponse[]): GoogleCalendarDedupResult {
  const suppressed: SuppressedDuplicate[] = [];
  const byId = new Map<string, PlannerEventResponse>();

  for (const item of items) {
    const id = item.event_id || item.appEventId;
    if (!id) continue;
    const existing = byId.get(id);
    if (!existing || rankPlannerEvent(item) > rankPlannerEvent(existing)) {
      if (existing) {
        suppressed.push({
          googleEventId: existing.googleEventId,
          appEventId: id,
          title: existing.title,
          date: eventDate(existing),
          canonicalGoogleEventId: item.googleEventId,
          canonicalAppEventId: id,
          reason: 'duplicate appEventId — kept higher-ranked canonical metadata',
          confidence: 'exact',
        });
      }
      byId.set(id, item);
    } else {
      suppressed.push({
        googleEventId: item.googleEventId,
        appEventId: id,
        title: item.title,
        date: eventDate(item),
        canonicalGoogleEventId: existing.googleEventId,
        canonicalAppEventId: id,
        reason: 'duplicate appEventId — lower-ranked record suppressed',
        confidence: 'exact',
      });
    }
  }

  const unmapped = items.filter(i => !(i.event_id || i.appEventId));
  const canonical = [...byId.values()];
  const groups = new Map<string, PlannerEventResponse[]>();

  for (const item of [...canonical, ...unmapped]) {
    const wf = (item as PlannerEventResponse & { workflowId?: string }).workflowId;
    const key = wf
      ? `wf:${wf}|${eventDate(item)}`
      : `title:${normalizeTitle(item.title)}|${eventDate(item)}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  const kept = new Set<string>();
  const result: PlannerEventResponse[] = [];

  for (const [, bucket] of groups) {
    if (bucket.length === 1) {
      result.push(bucket[0]);
      kept.add(bucket[0].googleEventId);
      continue;
    }
    const ranked = [...bucket].sort((a, b) => rankPlannerEvent(b) - rankPlannerEvent(a));
    const winner = ranked[0];
    result.push(winner);
    kept.add(winner.googleEventId);
    for (const dup of ranked.slice(1)) {
      if (kept.has(dup.googleEventId)) continue;
      suppressed.push({
        googleEventId: dup.googleEventId,
        appEventId: dup.event_id || dup.appEventId,
        title: dup.title,
        date: eventDate(dup),
        canonicalGoogleEventId: winner.googleEventId,
        canonicalAppEventId: winner.event_id || winner.appEventId,
        reason: winner.event_id === dup.event_id
          ? 'same canonical key — suppressed duplicate Google row'
          : 'same date + workflow/title — suppressed near-duplicate',
        confidence: winner.event_id && dup.event_id && winner.event_id === dup.event_id ? 'exact' : 'high',
      });
    }
  }

  return { items: result, suppressed };
}

function rankGoogleRawEvent(ev: calendar_v3.Schema$Event): number {
  let score = 0;
  const appId = readEventId(ev);
  const ext = (ev.extendedProperties?.private ?? {}) as Record<string, string>;
  if (appId) score += 50;
  if (appId && /\d{8}/.test(appId) && !appId.startsWith('EVT-')) score += 25;
  if ((ev.description ?? '').includes('CES EVENT')) score += 40;
  if (ext.source === 'CI_CES') score += 30;
  if (ext.workflowId) score += 20;
  if (!/^\[Compliance\]/i.test(ev.summary ?? '')) score += 10;
  return score;
}

/** Report raw Google Calendar duplicate groups without deleting. */
export function reportGoogleRawDuplicates(
  events: calendar_v3.Schema$Event[],
): SuppressedDuplicate[] {
  const groups = new Map<string, calendar_v3.Schema$Event[]>();
  for (const ev of events) {
    const title = normalizeTitle(ev.summary ?? '');
    const start = ev.start?.date ?? ev.start?.dateTime?.slice(0, 10) ?? '';
    const wf = (ev.extendedProperties?.private as Record<string, string> | undefined)?.workflowId;
    const appId = readEventId(ev);
    const key = appId ? `id:${appId}` : wf ? `wf:${wf}|${start}` : `title:${title}|${start}`;
    const nearKey = `title:${title}|${start}`;
    for (const k of new Set([key, nearKey])) {
      const bucket = groups.get(k) ?? [];
      if (!bucket.includes(ev)) bucket.push(ev);
      groups.set(k, bucket);
    }
  }

  const out: SuppressedDuplicate[] = [];
  const reported = new Set<string>();
  for (const [, bucket] of groups) {
    if (bucket.length <= 1) continue;
    const ranked = [...bucket].sort((a, b) => rankGoogleRawEvent(b) - rankGoogleRawEvent(a));
    const keeper = ranked[0];
    for (const dup of ranked.slice(1)) {
      const sig = `${dup.id ?? ''}->${keeper.id ?? ''}`;
      if (reported.has(sig)) continue;
      reported.add(sig);
      out.push({
        googleEventId: dup.id ?? '',
        appEventId: readEventId(dup) || undefined,
        title: dup.summary ?? '',
        date: dup.start?.date ?? dup.start?.dateTime?.slice(0, 10) ?? '',
        canonicalGoogleEventId: keeper.id ?? '',
        canonicalAppEventId: readEventId(keeper) || undefined,
        reason: 'live Google Calendar duplicate — reported, not auto-deleted',
        confidence: readEventId(dup) && readEventId(keeper) && readEventId(dup) === readEventId(keeper) ? 'exact' : 'high',
      });
    }
  }
  return out;
}