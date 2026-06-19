import crypto from 'node:crypto';
import {
  findByEventId, findByTitleAndDate, getEventByGoogleId, createEvent, updateEvent, deleteEvent,
  listCiEvents,
} from '../googleCalendar.js';
import { getCesEnrichment } from '../cesCalendarEventBuilder.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import {
  normalizeEventId, readEventId,
  type PlannerEventPayload, type PlannerEventResponse,
} from '../mappers.js';
import { getRow, upsertRow, patchRow, listRows, type EventRow, type SyncEnv } from './eventStore.js';
import { appendAudit } from './auditLog.js';
import { notifyFromBrad, type ComplianceImpact } from './bradNotifier.js';

/* ═══════════════════════════════════════════════════════════════
   eventSync — deterministic, idempotent, audit-safe sync engine.

   Invariants (enforced here):
     1. Every event is uniquely identified by its `event_id` UUID.
     2. Google-event matching is STRICT event_id only — never by
        title, time, description, or attendee set.
     3. A hash of the material payload is stored; an unchanged hash
        SKIPS the Google API call entirely (change detection).
     4. The local event store caches google_event_id so future
        updates go straight to events.update() without a list().
     5. Version numbers are monotonic. A stale version refuses to
        overwrite a newer stored version.
     6. Every action — create, update, skip, delete, failure, retry —
        writes an audit record. Notifications to Brad fire on
        material state changes.
     7. Sync failures retry up to 3 times with exponential backoff
        and then the row is tagged `sync_failed` for the dashboard.
   ═══════════════════════════════════════════════════════════════ */

export type SyncAction = 'created' | 'updated' | 'skipped' | 'failed';

export interface SyncResult {
  ok: boolean;
  event_id: string;
  google_event_id?: string | null;
  action: SyncAction;
  version: number;
  hash: string;
  error?: string;
  attempts: number;
  skipped_reason?: 'hash_unchanged' | 'stale_version';
}

export interface SyncOptions {
  trigger?: string;              // e.g. "api:/sync", "script:pushAllEvents"
  actor?: string;                // service-account email / user id
  env?: SyncEnv;                 // overrides payload.env when set
  /** Max retry attempts on transient failure (default 3). */
  maxAttempts?: number;
  /** Notify Brad on material changes (default true). */
  notify?: boolean;
}

/** Fields that participate in change detection. Order is stable. */
function canonicalForHash(p: PlannerEventPayload): string {
  const canonical = {
    title:        p.title ?? '',
    description:  p.description ?? '',
    summary:      p.summary ?? '',
    date:         p.date ?? '',
    endDate:      p.endDate ?? '',
    time:         p.time ?? '',
    timeEnd:      p.timeEnd ?? '',
    allDay:       !!p.allDay,
    timezone:     p.timezone ?? '',
    location:     p.location ?? '',
    attendees:    [...(p.attendees ?? [])].sort(),
    // Regulatory metadata — treated as material; a change here is a real
    // compliance-impacting change and must propagate to Google.
    domain:       p.domain ?? '',
    category:     p.category ?? '',
    cadence:      p.cadence ?? '',
    mandateType:  p.mandateType ?? '',
    policyRefs:   [...(p.policyRefs ?? [])].sort(),
    owner:        p.owner ?? '',
    ownerRole:    p.ownerRole ?? '',
    status:       p.status ?? '',
    evidenceStatus:  p.evidenceStatus ?? '',
    auditRisk:    p.auditRisk ?? '',
    regulatoryDriver: p.regulatoryDriver ?? '',
    completionState: p.completionState ?? '',
  };
  return JSON.stringify(canonical);
}

export function computeHash(p: PlannerEventPayload): string {
  return crypto.createHash('sha256').update(canonicalForHash(p)).digest('hex').slice(0, 32);
}

/* ── retry helper ──────────────────────────────────────────────── */

function isTransient(err: ApiError): boolean {
  return err.code === 'rate_limited'
      || err.code === 'upstream_error'
      || err.code === 'network_error';
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  onRetry: (attempt: number, err: ApiError) => void,
): Promise<{ value: T; attempts: number }> {
  let attempt = 0;
  let lastErr: ApiError | null = null;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const value = await fn();
      return { value, attempts: attempt };
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
      lastErr = err;
      if (!isTransient(err) || attempt >= maxAttempts) break;
      onRetry(attempt, err);
      const backoffMs = 250 * Math.pow(2, attempt - 1);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  throw lastErr ?? new ApiError('internal_error', 'retry exhausted', 500);
}

/* ── notification helpers ──────────────────────────────────────── */

function impactFor(p: PlannerEventPayload): ComplianceImpact {
  const risk = (p.auditRisk ?? '').toLowerCase();
  if (risk === 'critical') return 'critical';
  if (risk === 'high')     return 'high';
  if (risk === 'medium')   return 'medium';
  return 'low';
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC API
   ═══════════════════════════════════════════════════════════════ */

/**
 * Idempotently sync a single event to Google Calendar.
 *
 * Decision tree:
 *   1. Compute hash.
 *   2. Load local row by event_id.
 *   3. If incoming version < stored version → refuse (stale).
 *   4. If stored hash == incoming hash AND google_event_id is known
 *      AND google event still exists → SKIP (no API call).
 *   5. If google_event_id known → events.update() directly.
 *   6. Else → findByEventId() against Google to recover lost mapping.
 *   7. Else → events.insert().
 */
export async function syncEvent(
  payload: PlannerEventPayload,
  opts: SyncOptions = {},
): Promise<SyncResult> {
  const event_id = normalizeEventId(payload);
  if (!event_id) throw new ApiError('validation_error', 'event_id is required for sync.', 400);

  const trigger = opts.trigger ?? 'api:/sync';
  const actor   = opts.actor ?? 'service-account';
  const envTag: SyncEnv = opts.env ?? payload.env ?? 'PROD';
  const maxAttempts = opts.maxAttempts ?? 3;
  const notify = opts.notify ?? true;

  const incomingHash = computeHash(payload);
  const existingRow = getRow(event_id);
  const incomingVersion = payload.version ?? (existingRow ? existingRow.version + 1 : 1);

  // ── stale-overwrite guard ────────────────────────────────────
  if (existingRow && payload.version != null && payload.version < existingRow.version) {
    appendAudit({
      event_id, google_event_id: existingRow.google_event_id,
      action: 'skipped', env: envTag, trigger, actor,
      version_before: existingRow.version, version_after: existingRow.version,
      hash_before: existingRow.hash, hash_after: incomingHash,
      details: { reason: 'stale_version', incoming_version: payload.version },
    });
    return {
      ok: true, event_id, google_event_id: existingRow.google_event_id,
      action: 'skipped', version: existingRow.version, hash: existingRow.hash,
      skipped_reason: 'stale_version', attempts: 0,
    };
  }

  // ── hash-unchanged fast path ─────────────────────────────────
  if (existingRow
      && existingRow.hash === incomingHash
      && existingRow.google_event_id
      && existingRow.status === 'synced') {
    // Confirm the google event still exists; if it's been deleted out-of-band,
    // fall through to a repair create/update so we stay consistent.
    const snap = await getEventByGoogleId(existingRow.google_event_id).catch(() => null);
    if (snap) {
      appendAudit({
        event_id, google_event_id: existingRow.google_event_id,
        action: 'skipped', env: envTag, trigger, actor,
        version_before: existingRow.version, version_after: existingRow.version,
        hash_before: existingRow.hash, hash_after: incomingHash,
        details: { reason: 'hash_unchanged' },
      });
      return {
        ok: true, event_id, google_event_id: existingRow.google_event_id,
        action: 'skipped', version: existingRow.version, hash: existingRow.hash,
        skipped_reason: 'hash_unchanged', attempts: 0,
      };
    }
    log.warn('sync.repair.google_event_missing', {
      event_id, google_event_id: existingRow.google_event_id,
    });
  }

  // ── perform create or update (with retry) ────────────────────
  try {
    const { value: resp, attempts } = await withRetry(
      () => performWrite(payload, existingRow, incomingHash, incomingVersion),
      maxAttempts,
      (attempt, err) => {
        appendAudit({
          event_id, action: 'sync_retry', env: envTag, trigger, actor,
          details: { attempt, code: err.code, message: err.message },
        });
      },
    );

    const action: SyncAction = resp.action === 'created' ? 'created' : 'updated';

    const nextRow: EventRow = {
      event_id,
      google_event_id: resp.googleEventId,
      title: resp.title,
      hash: incomingHash,
      version: incomingVersion,
      last_synced_at: new Date().toISOString(),
      env: envTag,
      status: 'synced',
      last_action: action,
      failure_count: 0,
    };
    upsertRow(nextRow);

    appendAudit({
      event_id, google_event_id: resp.googleEventId,
      action, env: envTag, trigger, actor,
      version_before: existingRow?.version, version_after: incomingVersion,
      hash_before: existingRow?.hash, hash_after: incomingHash,
      details: { attempts, title: resp.title, htmlLink: resp.htmlLink },
    });

    if (notify) {
      notifyFromBrad({
        change_type: action === 'created' ? 'event_created' : 'event_updated',
        event_id,
        event_name: resp.title,
        compliance_impact: impactFor(payload),
        summary: action === 'created'
          ? `New mandated event scheduled: ${resp.title}.`
          : `Mandated event updated: ${resp.title} (v${incomingVersion}).`,
        link: resp.htmlLink,
        env: envTag,
        google_event_id: resp.googleEventId,
      });
    }

    return {
      ok: true, event_id, google_event_id: resp.googleEventId,
      action, version: incomingVersion, hash: incomingHash, attempts,
    };
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
    const failureCount = (existingRow?.failure_count ?? 0) + 1;
    const failedRow: EventRow = {
      event_id,
      google_event_id: existingRow?.google_event_id ?? null,
      title: payload.title,
      hash: existingRow?.hash ?? incomingHash,
      version: existingRow?.version ?? 0,
      last_synced_at: existingRow?.last_synced_at ?? new Date(0).toISOString(),
      env: envTag,
      status: 'sync_failed',
      last_error: err.message,
      last_action: 'failed',
      failure_count: failureCount,
    };
    upsertRow(failedRow);

    appendAudit({
      event_id, google_event_id: existingRow?.google_event_id ?? null,
      action: 'failed', env: envTag, trigger, actor,
      version_before: existingRow?.version, version_after: existingRow?.version,
      hash_before: existingRow?.hash, hash_after: incomingHash,
      error: `${err.code}: ${err.message}`,
      details: { failure_count: failureCount },
    });

    if (notify) {
      notifyFromBrad({
        change_type: 'sync_failed',
        event_id,
        event_name: payload.title,
        compliance_impact: impactFor(payload),
        summary: `Sync FAILED after retries for ${payload.title}. Dashboard flagged.`,
        env: envTag,
        google_event_id: existingRow?.google_event_id ?? null,
      });
    }

    return {
      ok: false, event_id, google_event_id: existingRow?.google_event_id ?? null,
      action: 'failed', version: existingRow?.version ?? 0, hash: incomingHash,
      error: err.message, attempts: maxAttempts,
    };
  }
}

/**
 * Inner write — uses cached google_event_id when available, otherwise falls
 * back to a strict event_id search. `events.insert()` is only called when
 * both of those misses confirm the event does NOT exist in Google.
 */
async function performWrite(
  payload: PlannerEventPayload,
  existingRow: EventRow | null,
  hash: string,
  version: number,
): Promise<PlannerEventResponse> {
  const event_id = normalizeEventId(payload);

  if (existingRow?.google_event_id) {
    const snap = await getEventByGoogleId(existingRow.google_event_id);
    if (snap) {
      return updateEvent(existingRow.google_event_id, payload, { hash, version });
    }
    log.warn('sync.cache_miss.google_event', {
      event_id,
      google_event_id: existingRow.google_event_id,
    });
    patchRow(event_id, { google_event_id: null, status: 'pending' });
  }

  // Authoritative Google-side lookup by event_id.
  const remote = await findByEventId(event_id);
  if (remote?.googleEventId) {
    return updateEvent(remote.googleEventId, payload, { hash, version });
  }

  // Title + date fallback before creating a duplicate.
  const enrichment = getCesEnrichment(event_id);
  const title = payload.title ?? enrichment?.title;
  const date = payload.date ?? enrichment?.date;
  if (title && date) {
    const fallback = await findByTitleAndDate(title, date);
    if (fallback?.googleEventId) {
      log.info('sync.heal.title_date_fallback', { event_id, googleEventId: fallback.googleEventId });
      return updateEvent(fallback.googleEventId, payload, { hash, version });
    }
  }

  return createEvent(payload, { hash, version });
}

/* ═══════════════════════════════════════════════════════════════
   Sync orchestration — batch + delete
   ═══════════════════════════════════════════════════════════════ */

export interface BatchSyncReport {
  count: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  results: SyncResult[];
}

export async function syncEvents(
  payloads: PlannerEventPayload[],
  opts: SyncOptions = {},
): Promise<BatchSyncReport> {
  const results: SyncResult[] = [];
  for (const p of payloads) {
    try {
      results.push(await syncEvent(p, opts));
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
      results.push({
        ok: false, event_id: normalizeEventId(p),
        action: 'failed', version: p.version ?? 0, hash: computeHash(p),
        error: err.message, attempts: 0,
      });
    }
  }
  return {
    count:   results.length,
    created: results.filter(r => r.ok && r.action === 'created').length,
    updated: results.filter(r => r.ok && r.action === 'updated').length,
    skipped: results.filter(r => r.ok && r.action === 'skipped').length,
    failed:  results.filter(r => !r.ok).length,
    results,
  };
}

export interface DeleteRequest {
  event_id: string;
  adminOverride?: boolean;
  reason?: string;
  actor?: string;
  trigger?: string;
}

export async function deleteSyncedEvent(req: DeleteRequest): Promise<{ ok: boolean; deleted: boolean; reason?: string }> {
  const row = getRow(req.event_id);
  const envTag: SyncEnv = row?.env ?? 'PROD';
  if (envTag === 'PROD' && !req.adminOverride) {
    appendAudit({
      event_id: req.event_id, google_event_id: row?.google_event_id ?? null,
      action: 'failed', env: envTag,
      trigger: req.trigger ?? 'api:/delete', actor: req.actor,
      error: 'PROD deletion refused — adminOverride required',
      details: { reason: req.reason },
    });
    throw new ApiError(
      'permission_denied',
      'PROD events cannot be deleted without adminOverride=true.',
      403,
    );
  }
  if (!row?.google_event_id) {
    return { ok: true, deleted: false, reason: 'not_in_store' };
  }
  await deleteEvent(row.google_event_id, { adminOverride: req.adminOverride });
  patchRow(req.event_id, { status: 'deleted', last_action: 'deleted' });
  appendAudit({
    event_id: req.event_id, google_event_id: row.google_event_id,
    action: 'admin_override', env: envTag,
    trigger: req.trigger ?? 'api:/delete', actor: req.actor,
    details: { reason: req.reason, hardDelete: true },
  });
  appendAudit({
    event_id: req.event_id, google_event_id: row.google_event_id,
    action: 'deleted', env: envTag,
    trigger: req.trigger ?? 'api:/delete', actor: req.actor,
  });
  notifyFromBrad({
    change_type: 'event_deleted',
    event_id: req.event_id,
    event_name: row.title,
    compliance_impact: envTag === 'PROD' ? 'high' : 'low',
    summary: `Event deleted from ${envTag}${req.reason ? `: ${req.reason}` : ''}.`,
    env: envTag,
    google_event_id: row.google_event_id,
  });
  return { ok: true, deleted: true };
}

/* ═══════════════════════════════════════════════════════════════
   Duplicate cleanup — one-time remediation pass.

   Rules:
     - Group CI-tagged events by (title, start, end).
     - Within each duplicate group:
         • KEEP: the event whose extendedProperties.private.event_id
           matches a row in the local store (preferred), else the
           event with the oldest created-at that carries any event_id.
         • DELETE: all others — except PROD events without
           `adminOverride`, which are reported as "needs_review".
   ═══════════════════════════════════════════════════════════════ */

export interface CleanupReport {
  groups: number;
  duplicates_found: number;
  deleted: number;
  needs_review: Array<{ group_key: string; google_event_id: string; reason: string }>;
  kept: Array<{ event_id: string; google_event_id: string }>;
  dry_run: boolean;
}

export interface CleanupOptions {
  dryRun?: boolean;
  adminOverride?: boolean;
  trigger?: string;
  actor?: string;
}

export async function cleanupDuplicates(opts: CleanupOptions = {}): Promise<CleanupReport> {
  const dryRun = opts.dryRun ?? true;
  const trigger = opts.trigger ?? 'cleanup:auto';
  const actor   = opts.actor   ?? 'system';

  const events = await listCiEvents();
  const groups = new Map<string, typeof events>();
  for (const ev of events) {
    const title = (ev.summary ?? '').trim();
    const start = ev.start?.dateTime ?? ev.start?.date ?? '';
    const end   = ev.end?.dateTime   ?? ev.end?.date   ?? '';
    const key = `${title}|${start}|${end}`;
    const bucket = groups.get(key) ?? [];
    bucket.push(ev);
    groups.set(key, bucket);
  }

  const storeIds = new Set(listRows().map(r => r.event_id));

  const report: CleanupReport = {
    groups: groups.size,
    duplicates_found: 0,
    deleted: 0,
    needs_review: [],
    kept: [],
    dry_run: dryRun,
  };

  for (const [key, bucket] of groups) {
    if (bucket.length <= 1) {
      const only = bucket[0];
      if (only && readEventId(only)) {
        report.kept.push({ event_id: readEventId(only), google_event_id: only.id ?? '' });
      }
      continue;
    }
    report.duplicates_found += bucket.length - 1;

    // Ranking: prefer event whose event_id is in our store, then any with an
    // event_id, then oldest created.
    const ranked = [...bucket].sort((a, b) => {
      const aId = readEventId(a);
      const bId = readEventId(b);
      const aIn = aId && storeIds.has(aId) ? 1 : 0;
      const bIn = bId && storeIds.has(bId) ? 1 : 0;
      if (aIn !== bIn) return bIn - aIn;
      const aHas = aId ? 1 : 0;
      const bHas = bId ? 1 : 0;
      if (aHas !== bHas) return bHas - aHas;
      const aCreated = a.created ? Date.parse(a.created) : Number.MAX_SAFE_INTEGER;
      const bCreated = b.created ? Date.parse(b.created) : Number.MAX_SAFE_INTEGER;
      return aCreated - bCreated;
    });

    const keeper = ranked[0];
    const keptId = readEventId(keeper);
    if (keptId) report.kept.push({ event_id: keptId, google_event_id: keeper.id ?? '' });

    for (const dup of ranked.slice(1)) {
      const dupGid = dup.id ?? '';
      const dupEid = readEventId(dup);
      const dupEnv = (dup.extendedProperties?.private?.env === 'SANDBOX') ? 'SANDBOX' : 'PROD';

      if (dupEnv === 'PROD' && !opts.adminOverride) {
        report.needs_review.push({
          group_key: key, google_event_id: dupGid,
          reason: 'PROD duplicate — requires adminOverride',
        });
        appendAudit({
          event_id: dupEid || '(unknown)', google_event_id: dupGid,
          action: 'failed', env: 'PROD', trigger, actor,
          error: 'PROD duplicate needs admin override',
          details: { group_key: key, keeper_google_event_id: keeper.id },
        });
        continue;
      }

      if (dryRun) {
        appendAudit({
          event_id: dupEid || '(unknown)', google_event_id: dupGid,
          action: 'deleted_duplicate', env: dupEnv, trigger: trigger + ':dry', actor,
          details: { group_key: key, keeper_google_event_id: keeper.id, dry_run: true },
        });
        continue;
      }

      try {
        await deleteEvent(dupGid, { adminOverride: opts.adminOverride });
        report.deleted++;
        appendAudit({
          event_id: dupEid || '(unknown)', google_event_id: dupGid,
          action: 'deleted_duplicate', env: dupEnv, trigger, actor,
          details: { group_key: key, keeper_google_event_id: keeper.id },
        });
        notifyFromBrad({
          change_type: 'duplicate_removed',
          event_id: dupEid || keptId || '(unknown)',
          event_name: dup.summary ?? '(no title)',
          compliance_impact: 'medium',
          summary: `Duplicate calendar entry removed. Kept ${keeper.id}, deleted ${dupGid}.`,
          env: dupEnv,
          google_event_id: dupGid,
        });
      } catch (e) {
        const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
        report.needs_review.push({
          group_key: key, google_event_id: dupGid,
          reason: err.message,
        });
      }
    }
  }
  return report;
}
