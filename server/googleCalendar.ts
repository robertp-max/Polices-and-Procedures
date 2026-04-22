import { google, calendar_v3 } from 'googleapis';
import { env } from './env.js';
import { log } from './logger.js';
import { ApiError, fromGoogleError } from './errors.js';
import {
  fromGoogleEvent, toGoogleEvent, normalizeEventId, readEventId,
  type PlannerEventPayload, type PlannerEventResponse,
} from './mappers.js';

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
    throw fromGoogleError(e);
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

/** Raw list of events that carry a CI_ENGINE tag — used by cleanup. */
export async function listCiEvents(): Promise<calendar_v3.Schema$Event[]> {
  const c = await getClient();
  const out: calendar_v3.Schema$Event[] = [];
  for (const key of ['source=CI_ENGINE', 'source=ci-regulatory-planner'] as const) {
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
