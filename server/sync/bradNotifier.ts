import fs from 'node:fs';
import path from 'node:path';
import { env } from '../env.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Brad (Administrator) — notification channel.

   Compliance policy: ALL calendar change notifications must originate
   from Brad, the Business Risk & Analytics Director. This module is
   the single fan-out point so no other code ever publishes directly.

   Persistence: append-only JSONL at `.cache/notifications/brad.jsonl`
   which the frontend polls or tails. Drop-in replacement with SSE /
   webhook is a one-line change.
   ═══════════════════════════════════════════════════════════════ */

export type NotificationChangeType =
  | 'event_created'
  | 'event_updated'
  | 'event_corrected'
  | 'event_deleted'
  | 'sync_failed'
  | 'duplicate_removed';

export type ComplianceImpact = 'critical' | 'high' | 'medium' | 'low';

export interface BradNotification {
  id: string;
  t: string;
  from: 'Brad (Administrator)';
  change_type: NotificationChangeType;
  event_id: string;
  event_name: string;
  compliance_impact: ComplianceImpact;
  summary: string;
  link?: string;
  env: 'SANDBOX' | 'PROD';
  google_event_id?: string | null;
}

const NOTIF_DIR  = path.join(env.repoRoot, '.cache', 'notifications');
const NOTIF_FILE = path.join(NOTIF_DIR, 'brad.jsonl');

function ensureDir() {
  if (!fs.existsSync(NOTIF_DIR)) fs.mkdirSync(NOTIF_DIR, { recursive: true });
}

function nid(): string {
  return `brad_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function notifyFromBrad(n: Omit<BradNotification, 'id' | 't' | 'from'>): BradNotification {
  const full: BradNotification = {
    id: nid(),
    t: new Date().toISOString(),
    from: 'Brad (Administrator)',
    ...n,
  };
  try {
    ensureDir();
    fs.appendFileSync(NOTIF_FILE, JSON.stringify(full) + '\n', 'utf8');
  } catch (e) {
    log.error('brad.notify.write.failed', { error: (e as Error).message });
  }
  log.info('brad.notify', {
    id: full.id,
    change_type: full.change_type,
    event_id: full.event_id,
    compliance_impact: full.compliance_impact,
  });
  return full;
}

/** Return the N most-recent Brad notifications. */
export function tailNotifications(n = 50): BradNotification[] {
  try {
    ensureDir();
    if (!fs.existsSync(NOTIF_FILE)) return [];
    const raw = fs.readFileSync(NOTIF_FILE, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const slice = lines.slice(Math.max(0, lines.length - n));
    const out: BradNotification[] = [];
    for (const line of slice) {
      try { out.push(JSON.parse(line) as BradNotification); } catch { /* skip */ }
    }
    return out.reverse();
  } catch (e) {
    log.warn('brad.notify.tail.failed', { error: (e as Error).message });
    return [];
  }
}

export const _internal = { NOTIF_FILE, NOTIF_DIR };
