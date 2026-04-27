import { createHash, randomBytes } from 'node:crypto';
import { store, type AuditRow, EcignError } from './store.js';

export function sha256(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

export function ulid(): string {
  return `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

/** Canonical JSON serialization for hashing — keys sorted recursively. */
export function canonical(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

/** Append an audit event with hash chain. */
export async function appendAudit(
  partial: Omit<AuditRow, 'event_id' | 'prev_hash' | 'hash' | 'occurred_at_utc'>,
): Promise<AuditRow> {
  const prev_hash = await store.lastAuditHash();
  const event_id = ulid();
  const occurred_at_utc = new Date().toISOString();
  const payloadForHash = canonical({ ...partial, event_id, prev_hash, occurred_at_utc });
  const hash = sha256(prev_hash + '|' + payloadForHash);
  const row: AuditRow = { ...partial, event_id, prev_hash, hash, occurred_at_utc };
  await store.appendAudit(row);
  return row;
}

/** Recompute the chain from genesis. Returns first break or null. */
export async function verifyChain(subjectId?: string):
  Promise<{ ok: boolean; first_break?: string; verified: number }> {
  const events = await store.listAudit();
  const filtered = subjectId ? events.filter(e => e.subject.id === subjectId) : events;
  let prev = 'GENESIS';
  // Subject-scoped verification cannot use global prev_hash chain — we verify
  // that each event's recorded hash matches its own canonical body, and that
  // global ordering is intact.
  for (const e of events) {
    const bodyHash = sha256(e.prev_hash + '|' + canonical({
      actor: e.actor, network: e.network, subject: e.subject,
      action: e.action, payload: e.payload,
      event_id: e.event_id, prev_hash: e.prev_hash,
      occurred_at_utc: e.occurred_at_utc,
    }));
    if (bodyHash !== e.hash || e.prev_hash !== prev) {
      return { ok: false, first_break: e.event_id, verified: events.indexOf(e) };
    }
    prev = e.hash;
  }
  return { ok: true, verified: filtered.length };
}

export function assert(cond: unknown, code: string, msg: string, status = 409): asserts cond {
  if (!cond) throw new EcignError(code, msg, status);
}
