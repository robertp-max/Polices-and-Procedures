import fs from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Event Store — single source of truth for the mapping between
   system events and Google Calendar events.

   File-backed JSON at `.cache/event-store/events.json`. One row per
   `event_id`. Never stores secrets. Safe to delete — the store is
   rebuilt on next sync from Google's extendedProperties.private.event_id.

   Guarantees:
     - event_id is the stable UUID from our system (mandatory).
     - google_event_id is the identifier returned by Google on insert.
     - hash is a deterministic digest of the payload; unchanged hash
       means the event does NOT need a Google update call.
     - version increments on every material change.
     - env ∈ {SANDBOX, PROD}; PROD rows are deletion-protected.
   ═══════════════════════════════════════════════════════════════ */

export type SyncEnv = 'SANDBOX' | 'PROD';
export type SyncStatus = 'synced' | 'pending' | 'sync_failed' | 'deleted';

export interface EventRow {
  event_id: string;
  google_event_id: string | null;
  title: string;
  hash: string;
  version: number;
  last_synced_at: string;
  env: SyncEnv;
  status: SyncStatus;
  last_error?: string;
  last_action?: 'created' | 'updated' | 'skipped' | 'deleted' | 'failed';
  /** Monotonic counter of consecutive sync failures for backoff/dashboard. */
  failure_count?: number;
}

interface StoreFile {
  version: 1;
  updated_at: string;
  rows: Record<string, EventRow>;
}

const STORE_DIR  = path.join(env.repoRoot, '.cache', 'event-store');
const STORE_FILE = path.join(STORE_DIR, 'events.json');

function emptyFile(): StoreFile {
  return { version: 1, updated_at: new Date().toISOString(), rows: {} };
}

function ensureDir() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

function readFile(): StoreFile {
  ensureDir();
  if (!fs.existsSync(STORE_FILE)) return emptyFile();
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoreFile;
    if (parsed?.version === 1 && parsed.rows && typeof parsed.rows === 'object') return parsed;
    log.warn('event_store.corrupt.reset', { file: STORE_FILE });
    return emptyFile();
  } catch (e) {
    log.warn('event_store.read.failed', { file: STORE_FILE, error: (e as Error).message });
    return emptyFile();
  }
}

function writeFile(s: StoreFile) {
  ensureDir();
  s.updated_at = new Date().toISOString();
  const tmp = STORE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2), 'utf8');
  fs.renameSync(tmp, STORE_FILE);
}

export function getRow(event_id: string): EventRow | null {
  const f = readFile();
  return f.rows[event_id] ?? null;
}

export function listRows(filter?: { env?: SyncEnv; status?: SyncStatus }): EventRow[] {
  const f = readFile();
  const all = Object.values(f.rows);
  if (!filter) return all;
  return all.filter(r =>
    (filter.env == null || r.env === filter.env) &&
    (filter.status == null || r.status === filter.status),
  );
}

export function upsertRow(row: EventRow): EventRow {
  const f = readFile();
  f.rows[row.event_id] = row;
  writeFile(f);
  return row;
}

export function patchRow(event_id: string, patch: Partial<EventRow>): EventRow | null {
  const f = readFile();
  const cur = f.rows[event_id];
  if (!cur) return null;
  const next: EventRow = { ...cur, ...patch };
  f.rows[event_id] = next;
  writeFile(f);
  return next;
}

export function removeRow(event_id: string): void {
  const f = readFile();
  if (!(event_id in f.rows)) return;
  delete f.rows[event_id];
  writeFile(f);
}

/** Rebuild a single row from a Google event resource (used by recovery paths). */
export function reconcileFromGoogle(row: EventRow): EventRow {
  return upsertRow(row);
}

export const _internal = { STORE_FILE, STORE_DIR };
