import type { calendar_v3 } from 'googleapis';

/* ═══════════════════════════════════════════════════════════════
   Mappers between the App's RegulatoryEvent-style payload and
   Google Calendar's Event resource. Keeps the Google shape out of
   the rest of the codebase.
   ═══════════════════════════════════════════════════════════════ */

/** Payload the frontend sends to create/update events. */
export interface PlannerEventPayload {
  /** Internal App event ID (stored in extendedProperties.private.appEventId). */
  appEventId: string;
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
}

/** What the frontend receives back for each event. */
export interface PlannerEventResponse extends PlannerEventPayload {
  googleEventId: string;
  htmlLink?: string;
  createdAt?: string;
  updatedAt?: string;
  source: 'google';
  /** Whether the upsert created a new Google event or updated an existing one. */
  action?: 'created' | 'updated';
}

function toRfc3339(date: string, time: string | undefined, fallbackSecondsEnd = false): string {
  // date = YYYY-MM-DD, time = HH:mm (optional)
  const t = time ?? (fallbackSecondsEnd ? '23:59' : '00:00');
  return `${date}T${t}:00`;
}

export function toGoogleEvent(
  p: PlannerEventPayload,
  defaultTz: string,
): calendar_v3.Schema$Event {
  const tz = p.timezone ?? defaultTz;
  const allDay = !!p.allDay || (!p.time && !p.timeEnd);

  const description = buildDescription(p);

  const base: calendar_v3.Schema$Event = {
    summary: p.title,
    description,
    location: p.location,
    extendedProperties: {
      private: pruneStrings({
        appEventId: p.appEventId,
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
        source: 'ci-regulatory-planner',
      }),
    },
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

  return {
    googleEventId: g.id ?? '',
    appEventId: ext.appEventId ?? '',
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
    source: 'google',
  };
}

function buildDescription(p: PlannerEventPayload): string {
  const parts: string[] = [];
  if (p.summary) parts.push(p.summary);
  if (p.description) parts.push(p.description);
  const meta: string[] = [];
  if (p.domain)            meta.push(`Domain: ${p.domain}`);
  if (p.category)          meta.push(`Category: ${p.category}`);
  if (p.policyRefs?.length) meta.push(`Policy: ${p.policyRefs.join(', ')}`);
  if (p.owner)             meta.push(`Owner: ${p.owner}${p.ownerRole ? ` (${p.ownerRole})` : ''}`);
  if (p.regulatoryDriver)  meta.push(`Driver: ${p.regulatoryDriver}`);
  if (p.auditRisk)         meta.push(`Audit risk: ${p.auditRisk}`);
  if (meta.length) parts.push('\n— Regulatory Planner —\n' + meta.join('\n'));
  parts.push(`\n(app event: ${p.appEventId})`);
  return parts.filter(Boolean).join('\n\n');
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
