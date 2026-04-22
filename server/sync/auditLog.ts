import fs from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Calendar sync audit log.

   Append-only JSONL. One record per sync action. Never mutated,
   never overwritten. Rotated externally. This is the source of
   truth for compliance traceability.
   ═══════════════════════════════════════════════════════════════ */

export type AuditAction =
  | 'created'
  | 'updated'
  | 'skipped'            // hash identical — no Google call made
  | 'deleted'            // explicit delete
  | 'deleted_duplicate'  // removed by cleanup script
  | 'failed'
  | 'sync_retry'
  | 'admin_override';

export interface AuditRecord {
  t: string;
  event_id: string;
  google_event_id?: string | null;
  action: AuditAction;
  env: 'SANDBOX' | 'PROD';
  version_before?: number;
  version_after?: number;
  hash_before?: string;
  hash_after?: string;
  trigger: string;                // e.g. "api:/sync", "script:pushAllEvents", "cleanup"
  actor?: string;                 // service-account email or user id
  error?: string;
  details?: Record<string, unknown>;
}

const AUDIT_DIR  = path.join(env.repoRoot, '.cache', 'audit');
const AUDIT_FILE = path.join(AUDIT_DIR, 'calendar-sync.jsonl');

function ensureDir() {
  if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true });
}

export function appendAudit(rec: Omit<AuditRecord, 't'>): AuditRecord {
  const full: AuditRecord = { t: new Date().toISOString(), ...rec };
  try {
    ensureDir();
    fs.appendFileSync(AUDIT_FILE, JSON.stringify(full) + '\n', 'utf8');
  } catch (e) {
    // Audit writes must NEVER break a sync flow, but should be shouted about.
    log.error('audit.write.failed', { error: (e as Error).message, file: AUDIT_FILE });
  }
  log.info('audit.event', {
    event_id: full.event_id,
    action: full.action,
    env: full.env,
    google_event_id: full.google_event_id,
    trigger: full.trigger,
  });
  return full;
}

/** Tail N most recent audit records for a dashboard / API. */
export function tailAudit(n = 100): AuditRecord[] {
  try {
    ensureDir();
    if (!fs.existsSync(AUDIT_FILE)) return [];
    const raw = fs.readFileSync(AUDIT_FILE, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const slice = lines.slice(Math.max(0, lines.length - n));
    const out: AuditRecord[] = [];
    for (const line of slice) {
      try { out.push(JSON.parse(line) as AuditRecord); } catch { /* skip malformed */ }
    }
    return out.reverse(); // newest first
  } catch (e) {
    log.warn('audit.tail.failed', { error: (e as Error).message });
    return [];
  }
}

export const _internal = { AUDIT_FILE, AUDIT_DIR };
