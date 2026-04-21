import { google, calendar_v3 } from 'googleapis';
import { env } from './env.js';
import { log } from './logger.js';
import { ApiError, fromGoogleError } from './errors.js';
import {
  fromGoogleEvent, toGoogleEvent,
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

export async function findByAppEventId(appEventId: string): Promise<PlannerEventResponse | null> {
  const c = await getClient();
  try {
    const res = await c.events.list({
      calendarId: env.calendarId,
      privateExtendedProperty: [`appEventId=${appEventId}`],
      singleEvents: true,
      maxResults: 2,
    });
    const item = res.data.items?.[0];
    return item ? fromGoogleEvent(item) : null;
  } catch (e) {
    throw fromGoogleError(e);
  }
}

export async function createEvent(payload: PlannerEventPayload): Promise<PlannerEventResponse> {
  const c = await getClient();
  try {
    // Idempotency: if a Google event already exists for this appEventId, UPDATE it.
    // The lookup uses extendedProperties.private.appEventId so a stale or missing
    // client-side ID map can never cause a duplicate.
    const existing = await findByAppEventId(payload.appEventId);
    if (existing) {
      log.info('google.calendar.create.idempotent_hit', { appEventId: payload.appEventId, googleEventId: existing.googleEventId });
      return updateEvent(existing.googleEventId, payload);
    }
    const requestBody = toGoogleEvent(payload, env.timezone);
    const res = await c.events.insert({
      calendarId: env.calendarId,
      requestBody,
    });
    log.info('google.calendar.create.ok', { appEventId: payload.appEventId, googleEventId: res.data.id });
    return { ...fromGoogleEvent(res.data), action: 'created' };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.create.failed', { appEventId: payload.appEventId, code: err.code, message: err.message });
    throw err;
  }
}

export async function updateEvent(googleEventId: string, payload: PlannerEventPayload): Promise<PlannerEventResponse> {
  const c = await getClient();
  try {
    const requestBody = toGoogleEvent(payload, env.timezone);
    const res = await c.events.update({
      calendarId: env.calendarId,
      eventId: googleEventId,
      requestBody,
    });
    log.info('google.calendar.update.ok', { googleEventId, appEventId: payload.appEventId });
    return { ...fromGoogleEvent(res.data), action: 'updated' };
  } catch (e) {
    const err = fromGoogleError(e);
    log.warn('google.calendar.update.failed', { googleEventId, code: err.code, message: err.message });
    throw err;
  }
}

export async function deleteEvent(googleEventId: string, opts: { cancelOnly?: boolean } = {}): Promise<void> {
  const c = await getClient();
  try {
    if (opts.cancelOnly) {
      // Mark as cancelled in extendedProperties rather than hard-delete.
      const res = await c.events.get({ calendarId: env.calendarId, eventId: googleEventId });
      const ev = res.data;
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
      log.info('google.calendar.cancel.ok', { googleEventId });
      return;
    }
    await c.events.delete({ calendarId: env.calendarId, eventId: googleEventId });
    log.info('google.calendar.delete.ok', { googleEventId });
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
