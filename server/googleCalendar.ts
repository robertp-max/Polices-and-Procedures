import { google, calendar_v3 } from 'googleapis';
import { env } from './env.js';
import { log } from './logger.js';
import { ApiError, fromGoogleError } from './errors.js';
import {
  fromGoogleEvent, toGoogleEvent, normalizeEventId, readEventId,
  type PlannerEventPayload, type PlannerEventResponse,
} from './mappers.js';
import {
  buildEnrichedPlannerPayload,
  CES_EXT_PROP_ALLOWLIST,
  getCesEnrichment,
} from './cesCalendarEventBuilder.js';
import { getRow, patchRow, reconcileFromGoogle } from './sync/eventStore.js';

/* ═══════════════════════════════════════════════════════════════
   Google Calendar service. Owns ALL googleapis interactions.
   The rest of the server talks to this module, never to googleapis.
   ═══════════════════════════════════════════════════════════════ */

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

let _client: calendar_v3.Calendar | null = null;

async function getClient(): Promise<calendar_v3.Calendar> {
  if (_client) return _client;
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: env.credentialsPath,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    _client = google.calendar({ version: 'v3', auth: authClient as never });
    log.info('google.calendar.auth.ready', { calendarId: env.calendarId });
    return _client;
  } catch (e) {
    log.error('google.calendar.auth.failed', { error: (e as Error).message });
    throw new ApiError('auth_error', 'Failed to initialize Google auth.', 500);
  }
}

/** Health check — verifies we can reach the target calendar. */
export async function pingCalendar(): Promise<{ reachable: boolean; summary?: string; error?: string }> {
  try {
    const c = await getClient();
    const res = await c.calendars.get({ calendarId: env.calendarId });
    return { reachable: true, summary: res.data.summary ?? undefined };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.ping.failed', { code: err.code, message: err.message });
    return { reachable: false, error: err.code };
  }
}

export async function listEvents(opts: {
  start?: string; // RFC3339 or YYYY-MM-DD
  end?: string;
  q?: string;
  maxResults?: number;
}): Promise<PlannerEventResponse[]> {
  const c = await getClient();
  try {
    const timeMin = opts.start ? toRfc3339(opts.start, false) : undefined;
    const timeMax = opts.end   ? toRfc3339(opts.end, true)    : undefined;
    const out: PlannerEventResponse[] = [];
    let pageToken: string | undefined;
    const cap = opts.maxResults ?? 500;
    do {
      const res = await c.events.list({
        calendarId: env.calendarId,
        timeMin, timeMax,
        q: opts.q,
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 250,
        pageToken,
      });
      for (const ev of res.data.items ?? []) out.push(fromGoogleEvent(ev));
      pageToken = res.data.nextPageToken ?? undefined;
      if (out.length >= cap) break;
    } while (pageToken);
    log.info('google.calendar.list.ok', { count: out.length, start: opts.start, end: opts.end });
    return out.slice(0, cap);
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.list.failed', { code: err.code, message: err.message });
    throw err;
  }
}

/**
 * STRICT ID-only lookup. Searches Google Calendar for an event whose
 * `extendedProperties.private.event_id` equals `eventId`. Title, time, and
 * description are NEVER used for matching. Legacy `appEventId` is checked as
 * a fallback solely to migrate events written by pre-rename builds.
 */
export async function findByEventId(eventId: string): Promise<PlannerEventResponse | null> {
  const c = await getClient();
  try {
    // Primary: new key.
    let res = await c.events.list({
      calendarId: env.calendarId,
      privateExtendedProperty: [`event_id=${eventId}`],
      singleEvents: true,
      maxResults: 2,
      showDeleted: false,
    });
    let item = res.data.items?.[0];

    if (!item) {
      // Legacy fallback — tolerated only until migration sweep completes.
      res = await c.events.list({
        calendarId: env.calendarId,
        privateExtendedProperty: [`appEventId=${eventId}`],
        singleEvents: true,
        maxResults: 2,
        showDeleted: false,
      });
      item = res.data.items?.[0];
      if (item) {
        log.info('google.calendar.find.legacy_hit', { eventId, googleEventId: item.id });
      }
    }

    return item ? fromGoogleEvent(item) : null;
  } catch (e) {
    const err = fromGoogleError(e);
    if (err.code === 'calendar_not_found') return null;
    throw err;
  }
}

/** @deprecated — use `findByEventId`. Kept for routes that still pass legacy names. */
export async function findByAppEventId(eventId: string): Promise<PlannerEventResponse | null> {
  return findByEventId(eventId);
}

/**
 * Direct fetch by Google's own event id. Cheaper than a list() when the
 * caller already has the google_event_id cached in the event store.
 */
export async function getEventByGoogleId(googleEventId: string): Promise<PlannerEventResponse | null> {
  const c = await getClient();
  try {
    const res = await c.events.get({ calendarId: env.calendarId, eventId: googleEventId });
    return res.data ? fromGoogleEvent(res.data) : null;
  } catch (e) {
    const err = fromGoogleError(e);
    if (err.code === 'calendar_not_found') return null;
    throw err;
  }
}

/**
 * Fallback lookup when extendedProperties search misses — matches by title
 * (case-insensitive, strips [Compliance] prefix) and start date.
 */
export async function findByTitleAndDate(
  title: string,
  date: string,
): Promise<PlannerEventResponse | null> {
  const c = await getClient();
  const normTitle = normalizeTitleForMatch(title);
  try {
    const res = await c.events.list({
      calendarId: env.calendarId,
      timeMin: `${date}T00:00:00Z`,
      timeMax: `${date}T23:59:59Z`,
      singleEvents: true,
      maxResults: 25,
      showDeleted: false,
      q: title.replace(/^\[Compliance\]\s*/i, '').slice(0, 60),
    });
    for (const item of res.data.items ?? []) {
      const itemTitle = normalizeTitleForMatch(item.summary ?? '');
      const itemDate = item.start?.date ?? (item.start?.dateTime?.slice(0, 10) ?? '');
      if (itemTitle === normTitle && itemDate === date) {
        return fromGoogleEvent(item);
      }
    }
    return null;
  } catch (e) {
    const err = fromGoogleError(e);
    if (err.code === 'calendar_not_found') return null;
    throw err;
  }
}

function normalizeTitleForMatch(title: string): string {
  return title.replace(/^\[Compliance\]\s*/i, '').trim().toLowerCase();
}

export type ResolveAction = 'found' | 'resynced' | 'recreated';

export interface ResolveCalendarResult {
  event: PlannerEventResponse;
  action: ResolveAction;
  healed: boolean;
  staleGoogleId?: string | null;
  duplicateAvoided: boolean;
}

/**
 * Resolve a CES event by app event_id with stale-mapping self-heal.
 *
 * 1. extendedProperties event_id / appEventId search
 * 2. clear stale cached google_event_id when Google returns 404
 * 3. title + date fallback
 * 4. create enriched no-PHI event when enrichment registry has the event
 */
export async function resolveCalendarEvent(
  eventId: string,
  payloadHint?: Partial<PlannerEventPayload>,
): Promise<ResolveCalendarResult | null> {
  const enrichment = getCesEnrichment(eventId);
  let staleGoogleId: string | null = null;
  let duplicateAvoided = false;

  // Primary: strict extendedProperties lookup.
  const direct = await findByEventId(eventId);
  if (direct?.googleEventId) {
    await healStoreMapping(eventId, direct);
    return { event: direct, action: 'found', healed: false, staleGoogleId: null, duplicateAvoided: true };
  }

  // Cached mapping may be stale — verify before trusting it.
  const row = getRow(eventId);
  if (row?.google_event_id) {
    const cached = await getEventByGoogleId(row.google_event_id);
    if (cached) {
      await healStoreMapping(eventId, cached);
      return { event: cached, action: 'found', healed: true, staleGoogleId: null, duplicateAvoided: true };
    }
    staleGoogleId = row.google_event_id;
    log.warn('google.calendar.resolve.stale_mapping', { eventId, staleGoogleId });
    patchRow(eventId, { google_event_id: null, status: 'pending' });
  }

  // Title + date fallback.
  const title = enrichment?.title ?? payloadHint?.title;
  const date = enrichment?.date ?? payloadHint?.date;
  if (title && date) {
    const fallback = await findByTitleAndDate(title, date);
    if (fallback?.googleEventId) {
      await healStoreMapping(eventId, fallback);
      return {
        event: fallback,
        action: 'resynced',
        healed: true,
        staleGoogleId,
        duplicateAvoided: true,
      };
    }
  }

  // Nothing live — create when we have enrichment or a usable payload hint.
  if (!enrichment && !(payloadHint?.title && payloadHint?.date)) return null;

  const payload = enrichment
    ? buildEnrichedPlannerPayload(enrichment, payloadHint as Partial<PlannerEventPayload>)
    : (payloadHint as PlannerEventPayload);

  // Idempotency guard — re-check before insert.
  const preInsert = await findByEventId(eventId);
  if (preInsert?.googleEventId) {
    duplicateAvoided = true;
    await healStoreMapping(eventId, preInsert);
    return { event: preInsert, action: 'found', healed: !!staleGoogleId, staleGoogleId, duplicateAvoided };
  }

  const created = await createEvent(payload);
  await healStoreMapping(eventId, created);
  return {
    event: created,
    action: 'recreated',
    healed: !!staleGoogleId,
    staleGoogleId,
    duplicateAvoided,
  };
}

async function healStoreMapping(eventId: string, event: PlannerEventResponse): Promise<void> {
  const row = getRow(eventId);
  if (!row || row.google_event_id !== event.googleEventId) {
    reconcileFromGoogle({
      event_id: eventId,
      google_event_id: event.googleEventId,
      title: event.title,
      hash: row?.hash ?? '',
      version: row?.version ?? 1,
      last_synced_at: new Date().toISOString(),
      env: event.env ?? row?.env ?? 'SANDBOX',
      status: 'synced',
      last_action: 'updated',
      failure_count: 0,
    });
  }
}

/** Raw list of events that carry a CI_ENGINE tag — used by cleanup. */
export async function listCiEvents(): Promise<calendar_v3.Schema$Event[]> {
  const c = await getClient();
  const out: calendar_v3.Schema$Event[] = [];
  for (const key of ['source=CI_CES', 'source=CI_ENGINE', 'source=ci-regulatory-planner'] as const) {
    let pageToken: string | undefined;
    do {
      const res = await c.events.list({
        calendarId: env.calendarId,
        privateExtendedProperty: [key],
        singleEvents: true,
        maxResults: 250,
        showDeleted: false,
        pageToken,
      });
      for (const ev of res.data.items ?? []) out.push(ev);
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  }
  // Deduplicate by Google id — an event carrying both legacy + new source tags
  // (only possible during migration) would otherwise appear twice.
  const seen = new Set<string>();
  return out.filter(e => {
    if (!e.id) return false;
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export async function createEvent(
  payload: PlannerEventPayload,
  extras: { hash?: string; version?: number } = {},
): Promise<PlannerEventResponse> {
  const c = await getClient();
  const eventId = normalizeEventId(payload);
  try {
    // Idempotency floor — even if a caller bypasses the sync engine, we MUST
    // never create a duplicate. We ALWAYS look up by event_id first.
    const existing = await findByEventId(eventId);
    if (existing) {
      log.info('google.calendar.create.idempotent_hit', {
        event_id: eventId,
        googleEventId: existing.googleEventId,
      });
      return updateEvent(existing.googleEventId, payload, extras);
    }
    const requestBody = toGoogleEvent(payload, env.timezone, extras);
    const res = await c.events.insert({
      calendarId: env.calendarId,
      requestBody,
    });
    log.info('google.calendar.create.ok', { event_id: eventId, googleEventId: res.data.id });
    return { ...fromGoogleEvent(res.data), action: 'created' };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.create.failed', { event_id: eventId, code: err.code, message: err.message });
    throw err;
  }
}

export async function updateEvent(
  googleEventId: string,
  payload: PlannerEventPayload,
  extras: { hash?: string; version?: number } = {},
): Promise<PlannerEventResponse> {
  const c = await getClient();
  const eventId = normalizeEventId(payload);
  try {
    const requestBody = toGoogleEvent(payload, env.timezone, extras);
    const res = await c.events.update({
      calendarId: env.calendarId,
      eventId: googleEventId,
      requestBody,
    });
    log.info('google.calendar.update.ok', { googleEventId, event_id: eventId });
    return { ...fromGoogleEvent(res.data), action: 'updated' };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.update.failed', { googleEventId, code: err.code, message: err.message });
    throw err;
  }
}

export interface DeleteOptions {
  cancelOnly?: boolean;
  /** Required for events tagged env=PROD in extendedProperties. */
  adminOverride?: boolean;
  /** Free-form reason; written to the audit record by the caller. */
  reason?: string;
}

/**
 * Delete (or cancel) a Google event. PROD events are deletion-protected —
 * the caller MUST set `adminOverride` and the caller SHOULD persist an audit
 * record. This is a hard guard, not advisory.
 */
export async function deleteEvent(googleEventId: string, opts: DeleteOptions = {}): Promise<void> {
  const c = await getClient();
  try {
    // Load once up front so we can check env tagging and reuse the body for
    // cancellation.
    const snap = await c.events.get({ calendarId: env.calendarId, eventId: googleEventId });
    const ev = snap.data;
    const envTag = (ev.extendedProperties?.private?.env === 'SANDBOX') ? 'SANDBOX' : 'PROD';
    if (envTag === 'PROD' && !opts.adminOverride && !opts.cancelOnly) {
      throw new ApiError(
        'permission_denied',
        'PROD event deletion requires adminOverride=true and an audit entry. Use cancelOnly=true to soft-cancel instead.',
        403,
        { googleEventId, event_id: readEventId(ev), env: 'PROD' },
      );
    }
    if (opts.cancelOnly) {
      // Soft-cancel: mark cancelled in extendedProperties and prefix the title
      // rather than hard-delete. Safe for PROD without admin override.
      const priv = ev.extendedProperties?.private ?? {};
      priv.completionState = 'cancelled';
      priv.status = 'cancelled';
      await c.events.update({
        calendarId: env.calendarId,
        eventId: googleEventId,
        requestBody: {
          ...ev,
          summary: ev.summary?.startsWith('[CANCELLED] ') ? ev.summary : `[CANCELLED] ${ev.summary ?? ''}`,
          extendedProperties: { ...ev.extendedProperties, private: priv },
        },
      });
      log.info('google.calendar.cancel.ok', { googleEventId, env: envTag });
      return;
    }
    await c.events.delete({ calendarId: env.calendarId, eventId: googleEventId });
    log.info('google.calendar.delete.ok', { googleEventId, env: envTag, adminOverride: !!opts.adminOverride });
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.delete.failed', { googleEventId, code: err.code, message: err.message });
    throw err;
  }
}

function toRfc3339(input: string, endOfDay: boolean): string {
  // Accepts YYYY-MM-DD or full RFC3339; returns RFC3339.
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return `${input}T${endOfDay ? '23:59:59' : '00:00:00'}Z`;
  }
  return input;
}

/* ═══════════════════════════════════════════════════════════════
   Drive evidence attachment bridge.

   Drive stores the file; Calendar only attaches/indexes it. These
   helpers patch the existing Calendar event's `attachments` array
   (supportsAttachments=true) and write a small set of lightweight,
   NON-PHI extendedProperties. They NEVER store file bytes, PHI,
   patient names, form answers, audit trails, or certificate text on
   the Calendar event.
   ═══════════════════════════════════════════════════════════════ */

export type CalendarAttachmentStatus = 'attached' | 'pending_attach' | 'attach_failed' | 'removed';

export interface DriveAttachmentInput {
  fileId: string;
  fileUrl: string;
  title: string;
  mimeType?: string;
  iconLink?: string;
}

export interface AttachResult {
  status: CalendarAttachmentStatus;
  attachmentCount: number;
  duplicate: boolean;
}

/** Hard ceiling so we never push dozens of low-level files onto one event. */
const MAX_CALENDAR_ATTACHMENTS = 25;

/**
 * Attach a Drive file to the existing Calendar event identified by event_id.
 * Idempotent: a file already attached (by fileId/fileUrl) is not duplicated.
 * Returns 'attach_failed' (non-throwing) so callers can persist honest status
 * while still recording the Drive upload.
 */
export async function attachDriveFileToEvent(
  eventId: string,
  attachment: DriveAttachmentInput,
): Promise<AttachResult> {
  const c = await getClient();
  try {
    const existing = await findByEventId(eventId);
    if (!existing?.googleEventId) {
      log.warn('google.calendar.attach.no_event', { eventId });
      return { status: 'attach_failed', attachmentCount: 0, duplicate: false };
    }
    const snap = await c.events.get({ calendarId: env.calendarId, eventId: existing.googleEventId });
    const current = snap.data.attachments ?? [];

    const already = current.some(a => a.fileId === attachment.fileId || a.fileUrl === attachment.fileUrl);
    if (already) {
      return { status: 'attached', attachmentCount: current.length, duplicate: true };
    }
    if (current.length >= MAX_CALENDAR_ATTACHMENTS) {
      // Honor the attachment ceiling — defer to the Drive folder/manifest.
      log.warn('google.calendar.attach.ceiling', { eventId, count: current.length });
      return { status: 'pending_attach', attachmentCount: current.length, duplicate: false };
    }

    const next = [
      ...current,
      {
        fileUrl: attachment.fileUrl,
        title: attachment.title,
        mimeType: attachment.mimeType,
        fileId: attachment.fileId,
        iconLink: attachment.iconLink,
      },
    ];
    await c.events.patch({
      calendarId: env.calendarId,
      eventId: existing.googleEventId,
      supportsAttachments: true,
      requestBody: { attachments: next },
    });
    log.info('google.calendar.attach.ok', { eventId, fileId: attachment.fileId, count: next.length });
    return { status: 'attached', attachmentCount: next.length, duplicate: false };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.attach.failed', { eventId, code: err.code, message: err.message });
    return { status: 'attach_failed', attachmentCount: 0, duplicate: false };
  }
}

/** Count current Drive attachments on the event (best-effort, non-throwing). */
export async function getEventAttachmentCount(eventId: string): Promise<number | null> {
  const c = await getClient();
  try {
    const existing = await findByEventId(eventId);
    if (!existing?.googleEventId) return null;
    const snap = await c.events.get({ calendarId: env.calendarId, eventId: existing.googleEventId });
    return (snap.data.attachments ?? []).length;
  } catch {
    return null;
  }
}

/**
 * Merge lightweight, NON-PHI evidence status keys into the event's
 * extendedProperties.private. Only an allowlisted set of keys is written.
 */
export async function setEvidenceExtendedProperties(
  eventId: string,
  props: Record<string, string | undefined>,
): Promise<boolean> {
  const c = await getClient();
  const ALLOWED = CES_EXT_PROP_ALLOWLIST;
  try {
    const existing = await findByEventId(eventId);
    if (!existing?.googleEventId) return false;
    const snap = await c.events.get({ calendarId: env.calendarId, eventId: existing.googleEventId });
    const priv = { ...(snap.data.extendedProperties?.private ?? {}) };
    for (const [k, v] of Object.entries(props)) {
      if (!ALLOWED.has(k)) continue; // refuse anything not on the allowlist
      if (v == null || v === '') continue;
      priv[k] = v;
    }
    await c.events.patch({
      calendarId: env.calendarId,
      eventId: existing.googleEventId,
      requestBody: { extendedProperties: { private: priv } },
    });
    return true;
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.ext_props.failed', { eventId, code: err.code, message: err.message });
    return false;
  }
}
