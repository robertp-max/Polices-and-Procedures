// Governing Body ↔ Calendar/CES + Google Drive integration client.
//
// The agency DOES have a real server-side integration: `server/routes/calendar.ts`
// mounts `/api/calendar/*`, backed by `server/googleCalendar.ts` (Google Calendar)
// and `server/googleDrive.ts` (Shared Drive evidence). Vite proxies `/api` to that
// Express server in dev, and production terminates `/api` on the same origin.
//
// This module is the ONLY place the V3 portal talks to those endpoints. It exists
// because the portal previously posted an invented body shape (`{title, startsAt,
// attendees, agenda}`) to `/api/calendar/events` and then reported every failure as
// "the calendar service is not connected in this build" — which was wrong on both
// counts. The server expects a `PlannerEventPayload` (server/mappers.ts) and answers
// with a `SyncResult` (server/sync/eventSync.ts).
//
// Honesty rules enforced here:
//   * Success requires `ok === true`, `action !== 'failed'`, AND a real
//     `google_event_id`. A 2xx that carries `ok:false` is a failure.
//   * Failures surface the SERVER'S reason, never an invented one.
//   * Reachability is PROBED (`/healthz`, `/evidence/health`), never assumed.

/* ── Health ────────────────────────────────────────────────────────────── */

export interface CalendarHealth {
  reachable: boolean;
  /** Server-provided reason when unreachable (e.g. 'internal_error'). */
  error?: string;
  /** True when the probe itself could not complete (server down / network). */
  probeFailed?: boolean;
}

export interface DriveHealth extends CalendarHealth {
  /** False when evidence storage is switched off by configuration. */
  enabled: boolean;
  provider?: string;
  sharedDriveId?: string;
  rootFolderId?: string;
}

/** GET /api/calendar/healthz — real Google Calendar reachability. */
export async function probeCalendarHealth(signal?: AbortSignal): Promise<CalendarHealth> {
  try {
    const res = await fetch('/api/calendar/healthz', { signal });
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; calendar?: { reachable?: boolean; error?: string } }
      | null;
    return {
      reachable: Boolean(body?.calendar?.reachable ?? body?.ok),
      error: body?.calendar?.error,
    };
  } catch {
    return { reachable: false, probeFailed: true, error: 'probe_failed' };
  }
}

/** GET /api/calendar/evidence/health — Shared Drive reachability + configuration. */
export async function probeDriveHealth(signal?: AbortSignal): Promise<DriveHealth> {
  try {
    const res = await fetch('/api/calendar/evidence/health', { signal });
    const body = (await res.json().catch(() => null)) as
      | {
          ok?: boolean;
          enabled?: boolean;
          provider?: string;
          sharedDriveId?: string;
          rootFolderId?: string;
          drive?: { reachable?: boolean; error?: string };
        }
      | null;
    return {
      enabled: Boolean(body?.enabled),
      reachable: Boolean(body?.drive?.reachable ?? body?.ok),
      error: body?.drive?.error,
      provider: body?.provider,
      sharedDriveId: body?.sharedDriveId,
      rootFolderId: body?.rootFolderId,
    };
  } catch {
    return { enabled: false, reachable: false, probeFailed: true, error: 'probe_failed' };
  }
}

/* ── Calendar event creation ───────────────────────────────────────────── */

/** Mirrors the server's SyncResult (server/sync/eventSync.ts). */
interface SyncResultWire {
  ok?: boolean;
  event_id?: string;
  google_event_id?: string | null;
  action?: 'created' | 'updated' | 'skipped' | 'failed';
  version?: number;
  error?: string;
  skipped_reason?: string;
}

export interface AdHocMeetingInput {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  attendees: string[];
  /** Draft agenda lines rendered into the event description. */
  agenda: Array<{ decisionId: string; title: string }>;
  owner?: string;
  /** SANDBOX keeps ad hoc portal events deletable; PROD is deletion-restricted. */
  env?: 'SANDBOX' | 'PROD';
}

export type CalendarCreateResult =
  | { ok: true; eventId: string; googleEventId: string; action: string; htmlLink?: string }
  | { ok: false; reason: string };

function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `gb-v3-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Builds the real PlannerEventPayload the sync engine validates. */
export function buildPlannerPayload(input: AdHocMeetingInput, eventId = newEventId()) {
  const agendaLines = input.agenda.length
    ? input.agenda.map((item, i) => `${i + 1}. [${item.decisionId}] ${item.title}`).join('\n')
    : 'No agenda items were queued at scheduling time.';
  return {
    event_id: eventId,
    title: input.title.trim(),
    date: input.date, // YYYY-MM-DD
    time: input.time, // HH:mm
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    description: [
      'Governing Body ad hoc readiness meeting (created from the Executive Readiness portal).',
      '',
      'Proposed agenda:',
      agendaLines,
    ].join('\n'),
    domain: 'Governance',
    category: 'Governing Body meeting',
    owner: input.owner,
    ownerRole: 'Governing Body',
    status: 'scheduled',
    attendees: input.attendees,
    env: input.env ?? 'SANDBOX',
  };
}

/**
 * POST /api/calendar/events (create/upsert through the deterministic sync engine),
 * then resolve the event to obtain the server's real Google `htmlLink`.
 */
export async function createAdHocMeeting(input: AdHocMeetingInput): Promise<CalendarCreateResult> {
  const eventId = newEventId();
  const payload = buildPlannerPayload(input, eventId);

  let res: Response;
  try {
    res = await fetch('/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': eventId,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, reason: 'The Calendar/CES API could not be reached from this browser (network or proxy error). No event was created.' };
  }

  const body = (await res.json().catch(() => null)) as (SyncResultWire & { error?: { message?: string; code?: string } }) | null;

  if (!res.ok) {
    const serverMessage =
      typeof body?.error === 'string'
        ? body.error
        : (body?.error as { message?: string } | undefined)?.message;
    return {
      ok: false,
      reason: `Calendar/CES rejected the request (HTTP ${res.status})${serverMessage ? `: ${serverMessage}` : ''}. No event was created.`,
    };
  }

  // A 2xx is not automatically a created event: the sync engine reports its own
  // ok/action/error, and Google may be unreachable behind a healthy HTTP layer.
  const wire = body ?? {};
  const googleEventId = wire.google_event_id ?? undefined;
  if (wire.ok === false || wire.action === 'failed' || !googleEventId) {
    const detail = typeof wire.error === 'string' ? wire.error : undefined;
    return {
      ok: false,
      reason: detail
        ? `Calendar/CES could not create the Google event: ${detail}. No event was created.`
        : 'Calendar/CES accepted the request but returned no Google event id, so no event exists. Nothing was created.',
    };
  }

  return {
    ok: true,
    eventId: wire.event_id ?? eventId,
    googleEventId,
    action: wire.action ?? 'created',
    htmlLink: await resolveEventHtmlLink(wire.event_id ?? eventId),
  };
}

/** GET /api/calendar/events/by-app/:eventId — used only for the real Google link. */
async function resolveEventHtmlLink(eventId: string): Promise<string | undefined> {
  try {
    const res = await fetch(`/api/calendar/events/by-app/${encodeURIComponent(eventId)}`);
    if (!res.ok) return undefined;
    const body = (await res.json().catch(() => null)) as { htmlLink?: string } | null;
    return body?.htmlLink;
  } catch {
    return undefined;
  }
}

/* ── Drive reference documents ─────────────────────────────────────────── */

export interface DriveFolderRef {
  id: string;
  name: string;
}

export interface DriveFileRef {
  id: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
}

export type DriveListing =
  | {
      ok: true;
      enabled: boolean;
      rootId: string | null;
      folderId: string | null;
      folderUrl: string | null;
      folders: DriveFolderRef[];
      files: DriveFileRef[];
    }
  | { ok: false; reason: string };

/**
 * GET /api/calendar/intake/drive-folder — lists the Shared Drive reference
 * material the Board may review or save against a decision. Returns the
 * server's own folder URL so the UI never constructs a Drive link itself.
 */
export async function listDriveFolder(folderId?: string, signal?: AbortSignal): Promise<DriveListing> {
  try {
    const qs = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
    const res = await fetch(`/api/calendar/intake/drive-folder${qs}`, { signal });
    if (!res.ok) {
      return { ok: false, reason: `Drive listing failed (HTTP ${res.status}).` };
    }
    const body = (await res.json().catch(() => null)) as
      | {
          enabled?: boolean;
          rootId?: string | null;
          folderId?: string | null;
          folderUrl?: string | null;
          folders?: DriveFolderRef[];
          files?: DriveFileRef[];
        }
      | null;
    if (!body) return { ok: false, reason: 'Drive listing returned no body.' };
    return {
      ok: true,
      enabled: Boolean(body.enabled),
      rootId: body.rootId ?? null,
      folderId: body.folderId ?? null,
      folderUrl: body.folderUrl ?? null,
      folders: body.folders ?? [],
      files: body.files ?? [],
    };
  } catch {
    return { ok: false, reason: 'The Drive API could not be reached from this browser.' };
  }
}

/** Human-readable posture line for a probed integration. */
export function postureLabel(health: CalendarHealth | DriveHealth): string {
  if ('enabled' in health && !health.enabled) return 'Disabled by configuration';
  if (health.reachable) return 'Connected';
  if (health.probeFailed) return 'API unreachable from this browser';
  return health.error ? `Unavailable (${health.error})` : 'Unavailable';
}
