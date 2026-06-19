import type { calendar_v3 } from 'googleapis';
import {
  buildCesCalendarDescription,
  buildCesExtendedProperties,
  resolveEnrichment,
} from './cesCalendarEventBuilder.js';

/* ═══════════════════════════════════════════════════════════════
   Mappers between the App's RegulatoryEvent-style payload and
   Google Calendar's Event resource. Keeps the Google shape out of
   the rest of the codebase.
   ═══════════════════════════════════════════════════════════════ */

/** Payload the frontend sends to create/update events. */
export interface PlannerEventPayload {
  /**
   * STRICT — the stable system UUID for this event. Persisted to Google at
   * `extendedProperties.private.event_id`. Historical name `appEventId` is
   * preserved as an alias for backward compatibility; server code MUST
   * read `event_id` but SHOULD accept `appEventId` on ingress.
   */
  event_id: string;
  /** @deprecated legacy alias for `event_id` — kept for wire compatibility. */
  appEventId?: string;
  title: string;
  summary?: string;
  description?: string;
  /** YYYY-MM-DD */
  date: string;
  endDate?: string;
  /** HH:mm; omit for all-day. */
  time?: string;
  timeEnd?: string;
  allDay?: boolean;
  timezone?: string;

  /* Regulatory metadata — persisted to Google extendedProperties. */
  domain?: string;
  category?: string;
  cadence?: string;
  /** Mandate classification: federal-required | conditional-federal | policy-driven | state-required */
  mandateType?: string;
  policyRefs?: string[];
  owner?: string;
  ownerRole?: string;
  status?: string;
  evidenceStatus?: string;
  regulatoryDriver?: string;
  auditRisk?: string;
  completionState?: string;
  location?: string;

  /** SANDBOX test event (safe to delete) vs PROD (deletion-restricted). */
  env?: 'SANDBOX' | 'PROD';
  /** Monotonic client version — sync engine refuses stale overwrites. */
  version?: number;
  /** Attendees are included in the change-detection hash. */
  attendees?: string[];
}

/** What the frontend receives back for each event. */
export interface PlannerEventResponse extends PlannerEventPayload {
  googleEventId: string;
  htmlLink?: string;
  createdAt?: string;
  updatedAt?: string;
  source: 'google';
  /** Result of the last sync pass for this event. */
  action?: 'created' | 'updated' | 'skipped' | 'deleted' | 'failed';
  /** Hash of the fields that participate in change detection. */
  hash?: string;
  /** Monotonic server-tracked version. */
  version?: number;
  /** Last successful sync timestamp. */
  lastSyncedAt?: string;
  /** CES workflow template id from extendedProperties. */
  workflowId?: string;
  /** Completion percent from extendedProperties when enriched. */
  completionPercent?: number;
}

function toRfc3339(date: string, time: string | undefined, fallbackSecondsEnd = false): string {
  // date = YYYY-MM-DD, time = HH:mm (optional)
  const t = time ?? (fallbackSecondsEnd ? '23:59' : '00:00');
  return `${date}T${t}:00`;
}

export function toGoogleEvent(
  p: PlannerEventPayload,
  defaultTz: string,
  extras: { hash?: string; version?: number; snapshot?: import('./cesCalendarCompletion.js').CesExecutionSnapshot } = {},
): calendar_v3.Schema$Event {
  const tz = p.timezone ?? defaultTz;
  const allDay = !!p.allDay || (!p.time && !p.timeEnd);
  const eventId = p.event_id || p.appEventId || '';
  const envTag: 'SANDBOX' | 'PROD' = p.env ?? 'PROD';

  const enrichment = resolveEnrichment(eventId, { ...p, event_id: eventId, env: envTag });
  const description = enrichment
    ? (p.description || buildCesCalendarDescription(enrichment, extras.snapshot))
    : buildDescription({ ...p, event_id: eventId, env: envTag });

  const extPrivate = enrichment
    ? buildCesExtendedProperties({ ...enrichment, env: enrichment.env ?? envTag }, extras)
    : pruneStrings({
        event_id: eventId,
        env: envTag,
        appEventId: eventId,
        domain: p.domain,
        category: p.category,
        cadence: p.cadence,
        mandateType: p.mandateType,
        owner: p.owner,
        ownerRole: p.ownerRole,
        policyRefs: p.policyRefs ? p.policyRefs.join(',') : undefined,
        status: p.status,
        evidenceStatus: p.evidenceStatus,
        auditRisk: p.auditRisk,
        completionState: p.completionState,
        source: 'CI_ENGINE',
        hash: extras.hash,
        version: extras.version != null ? String(extras.version) : undefined,
      });

  const base: calendar_v3.Schema$Event = {
    summary: p.title,
    description,
    location: p.location,
    colorId: mapGoogleColorId(p),
    extendedProperties: { private: extPrivate },
  };

  if (allDay) {
    // Google treats end as exclusive for all-day events.
    const start = p.date;
    const endRaw = p.endDate ?? p.date;
    const endExclusive = addDaysISO(endRaw, 1);
    base.start = { date: start };
    base.end   = { date: endExclusive };
  } else {
    base.start = { dateTime: toRfc3339(p.date, p.time), timeZone: tz };
    base.end   = { dateTime: toRfc3339(p.endDate ?? p.date, p.timeEnd ?? p.time, true), timeZone: tz };
  }
  return base;
}

export function fromGoogleEvent(g: calendar_v3.Schema$Event): PlannerEventResponse {
  const ext = (g.extendedProperties?.private ?? {}) as Record<string, string>;
  const allDay = !!g.start?.date;
  const startIso = g.start?.dateTime ?? g.start?.date ?? '';
  const endIso   = g.end?.dateTime   ?? g.end?.date   ?? '';

  const { date: startDate, time: startTime } = splitIso(startIso, allDay);
  const endDateInclusive = allDay && g.end?.date ? addDaysISO(g.end.date, -1) : splitIso(endIso, allDay).date;
  const endTime = allDay ? undefined : splitIso(endIso, false).time;

  // Primary id key is event_id; fall back to the legacy appEventId only when
  // no new-shape key is present (migration path).
  const eventId = ext.event_id || ext.appEventId || '';
  const envTag = (ext.env === 'SANDBOX' ? 'SANDBOX' : 'PROD') as 'SANDBOX' | 'PROD';

  return {
    googleEventId: g.id ?? '',
    event_id: eventId,
    appEventId: eventId,
    title: g.summary ?? '',
    summary: undefined,
    description: g.description ?? '',
    date: startDate,
    endDate: endDateInclusive || undefined,
    time: startTime,
    timeEnd: endTime,
    allDay,
    timezone: (g.start?.timeZone ?? g.end?.timeZone) ?? undefined,
    domain: ext.domain,
    category: ext.category,
    cadence: ext.cadence,
    mandateType: ext.mandateType,
    owner: ext.owner,
    ownerRole: ext.ownerRole,
    policyRefs: ext.policyRefs ? ext.policyRefs.split(',').filter(Boolean) : [],
    status: ext.status,
    evidenceStatus: ext.evidenceStatus,
    auditRisk: ext.auditRisk,
    completionState: ext.completionState,
    location: g.location ?? undefined,
    htmlLink: g.htmlLink ?? undefined,
    createdAt: g.created ?? undefined,
    updatedAt: g.updated ?? undefined,
    env: envTag,
    hash: ext.hash,
    version: ext.version ? Number(ext.version) : undefined,
    workflowId: ext.workflowId,
    completionPercent: ext.completionPercent ? Number(ext.completionPercent) : undefined,
    source: 'google',
  };
}

/** Extract a normalized event_id from a Google event, preferring the new key. */
export function readEventId(g: calendar_v3.Schema$Event): string {
  const ext = (g.extendedProperties?.private ?? {}) as Record<string, string>;
  return ext.event_id || ext.appEventId || '';
}

/** Normalize incoming payloads: accept either event_id or legacy appEventId. */
export function normalizeEventId(p: PlannerEventPayload): string {
  return p.event_id || p.appEventId || '';
}

function buildDescription(p: PlannerEventPayload): string {
  const envTag = p.env ?? 'PROD';
  const eventId = p.event_id || p.appEventId || '';
  const appEventUrl = `https://dovdry3t4njek.cloudfront.net/calendar?event=${encodeURIComponent(eventId)}`;
  const workflowUrl = p.category || p.cadence
    ? `https://dovdry3t4njek.cloudfront.net/calendar?event=${encodeURIComponent(eventId)}&workflow=1`
    : '';

  const lines = [
    'Title:',
    p.title || '(untitled)',
    '',
    'Compliance Event ID:',
    eventId,
    '',
    'Category:',
    p.category || p.domain || 'Compliance',
    '',
    'Status:',
    p.status || p.completionState || 'scheduled',
    '',
    'Owner:',
    p.owner ? `${p.owner}${p.ownerRole ? ` (${p.ownerRole})` : ''}` : 'Unassigned',
    '',
    'Open in Compliance App:',
    appEventUrl,
    '',
    'Related Workflow:',
    workflowUrl || 'N/A',
    '',
    'Notes:',
    p.summary || p.description || 'No additional description provided.',
    'This calendar entry is synced from the Home Health Compliance Platform. The app remains the source of truth.',
    '',
    '[CI-EVENT]',
    `event_id=${eventId}`,
    `env=${envTag}`,
    'source=CI_ENGINE',
  ];

  return lines.join('\n');
}

function mapGoogleColorId(p: PlannerEventPayload): string | undefined {
  const key = `${p.category ?? ''} ${p.domain ?? ''}`.toLowerCase();
  if (key.includes('audit')) return '6';
  if (key.includes('training')) return '10';
  if (key.includes('policy')) return '3';
  if (key.includes('incident') || key.includes('safety')) return '11';
  if (key.includes('compliance')) return '9';
  return undefined;
}

function addDaysISO(dateISO: string, days: number): string {
  // dateISO: YYYY-MM-DD
  const d = new Date(dateISO + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function splitIso(iso: string, allDay: boolean): { date: string; time?: string } {
  if (!iso) return { date: '' };
  if (allDay) return { date: iso.slice(0, 10) };
  // Prefer local components in the returned string (not UTC shift) — Google returns
  // an RFC3339 with timezone offset; slicing the leading 16 chars is sufficient for
  // the frontend's YYYY-MM-DD / HH:mm fields.
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

function pruneStrings<T extends Record<string, string | undefined>>(obj: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v != null && v !== '') out[k] = v;
  }
  return out;
}
