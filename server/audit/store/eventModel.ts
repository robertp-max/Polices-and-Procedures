/**
 * Audit event model — pure, storage-agnostic core shared by every
 * AuditEventStore adapter (JSONL, in-memory, Firestore). Extracted verbatim
 * from the original writer so all backends produce byte-identical events,
 * hashes, canonical serialization, PHI rejection, and chain verification.
 *
 * No I/O here. Deterministic given an injected clock + id generator.
 */
import { createHash, randomBytes } from 'node:crypto';

export type Severity = 'info' | 'notice' | 'warning' | 'high' | 'critical';
export type RetentionClass = 'standard' | 'claims' | 'phi-access' | 'legal-hold';
export type ActorType = 'user' | 'service' | 'system';
export type Decision = 'permit' | 'deny' | 'indeterminate';

export interface Actor {
  type: ActorType;
  user_id?: string;
  service_id?: string;
  on_behalf_of?: string;
  display_name?: string;
}

export interface ResourceRef {
  type: string;
  id: string;
  parent_ref?: { type: string; id: string };
}

export interface Environment {
  ip?: string;
  user_agent?: string;
  device_id?: string;
  tls_version?: string;
}

export interface AuditEventInput {
  event_type: string;
  event_version?: number;
  stream: string;
  idempotency_key?: string;
  actor: Actor;
  action: string;
  resource: ResourceRef;
  decision?: Decision;
  decision_reason?: string;
  authz_policy_ver?: number;
  before?: unknown;
  after?: unknown;
  correlation_id?: string;
  causation_id?: string;
  session_id?: string;
  request_id?: string;
  trace_id?: string;
  span_id?: string;
  environment?: Environment;
  severity?: Severity;
  phi_flag?: boolean;
  pii_flag?: boolean;
  retention_class?: RetentionClass;
  signature_ref?: string;
  evidence_refs?: string[];
  policy_refs?: Array<{ policy_id: string; version: number; content_hash: string }>;
  payload?: Record<string, unknown>;
  schema_version?: number;
}

export interface AuditEvent {
  event_id: string;
  event_type: string;
  event_version: number;
  occurred_at_utc: string;
  stream: string;
  sequence: number;
  prev_hash: string;
  event_hash: string;
  actor: Actor;
  action: string;
  resource: ResourceRef;
  decision?: Decision;
  decision_reason?: string;
  authz_policy_ver?: number;
  before?: unknown;
  after?: unknown;
  correlation_id: string;
  causation_id?: string;
  session_id?: string;
  request_id?: string;
  trace_id?: string;
  span_id?: string;
  environment: Environment;
  severity: Severity;
  phi_flag: boolean;
  pii_flag: boolean;
  retention_class: RetentionClass;
  signature_ref?: string;
  evidence_refs?: string[];
  policy_refs?: Array<{ policy_id: string; version: number; content_hash: string }>;
  payload: Record<string, unknown>;
  schema_version: number;
  idempotency_key?: string;
}

export interface ChainHead { last_hash: string; sequence: number }
export const GENESIS_HEAD: ChainHead = { last_hash: 'GENESIS', sequence: 0 };

export class AuditWriteError extends Error {
  constructor(public code: string, msg: string) { super(msg); this.name = 'AuditWriteError'; }
}

export interface EventGenerators {
  now: () => string;
  id: () => string;
}

export function defaultGenerators(): EventGenerators {
  return {
    now: () => new Date().toISOString(),
    id: () => `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`,
  };
}

export function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * Canonical JSON: keys sorted recursively for stable hashing. Keys whose value
 * is `undefined` are OMITTED — matching JSON.stringify semantics — so a hash is
 * identical whether the event is held in memory or round-tripped through JSON
 * (JSONL/Firestore). Without this, undefined-valued optional fields dropped by
 * JSON.stringify would break chain verification after a file round-trip.
 */
export function canonical(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

const PHI_FIELD_KEYS = new Set([
  'ssn', 'social_security_number', 'mrn', 'medical_record_number',
  'patient_name', 'patient_first_name', 'patient_last_name',
  'patient_address', 'patient_dob', 'date_of_birth',
  'diagnosis_text', 'note_text', 'clinical_note',
]);

export function containsPhiKey(v: unknown, depth = 0): string | null {
  if (depth > 6 || v === null || typeof v !== 'object') return null;
  for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
    if (PHI_FIELD_KEYS.has(k.toLowerCase())) return k;
    const inner = containsPhiKey(child, depth + 1);
    if (inner) return inner;
  }
  return null;
}

/** Structural PHI guard — throws if payload/before/after carries a PHI marker. */
export function assertNoPhi(input: AuditEventInput): void {
  const hit = (input.payload ? containsPhiKey(input.payload) : null)
    ?? (input.before ? containsPhiKey(input.before) : null)
    ?? (input.after ? containsPhiKey(input.after) : null);
  if (hit) {
    throw new AuditWriteError(
      'phi_in_payload',
      `Audit event ${input.event_type} contains PHI-like field "${hit}" in payload/before/after; reject.`,
    );
  }
}

/** Deterministically construct the next event for a stream head. */
export function constructEvent(input: AuditEventInput, head: ChainHead, gen: EventGenerators): AuditEvent {
  const sequence = head.sequence + 1;
  const prev_hash = head.last_hash;
  const candidate: Omit<AuditEvent, 'event_hash'> = {
    event_id: gen.id(),
    event_type: input.event_type,
    event_version: input.event_version ?? 1,
    occurred_at_utc: gen.now(),
    stream: input.stream,
    sequence,
    prev_hash,
    actor: input.actor,
    action: input.action,
    resource: input.resource,
    decision: input.decision,
    decision_reason: input.decision_reason,
    authz_policy_ver: input.authz_policy_ver,
    before: input.before,
    after: input.after,
    correlation_id: input.correlation_id ?? gen.id(),
    causation_id: input.causation_id,
    session_id: input.session_id,
    request_id: input.request_id,
    trace_id: input.trace_id,
    span_id: input.span_id,
    environment: input.environment ?? {},
    severity: input.severity ?? 'info',
    phi_flag: !!input.phi_flag,
    pii_flag: !!input.pii_flag,
    retention_class: input.retention_class ?? 'standard',
    signature_ref: input.signature_ref,
    evidence_refs: input.evidence_refs,
    policy_refs: input.policy_refs,
    payload: input.payload ?? {},
    schema_version: input.schema_version ?? 1,
    idempotency_key: input.idempotency_key,
  };
  const event_hash = sha256(prev_hash + '|' + canonical(candidate));
  return { ...candidate, event_hash };
}

export interface QueryFilter {
  stream?: string;
  actor_user_id?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  event_type?: string;
  severity?: Severity;
  phi_flag?: boolean;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export function filterEvents(all: AuditEvent[], f: QueryFilter): AuditEvent[] {
  const filtered = all.filter(e => {
    if (f.stream && e.stream !== f.stream) return false;
    if (f.actor_user_id && e.actor.user_id !== f.actor_user_id) return false;
    if (f.resource_type && e.resource.type !== f.resource_type) return false;
    if (f.resource_id && e.resource.id !== f.resource_id) return false;
    if (f.action && e.action !== f.action) return false;
    if (f.event_type && e.event_type !== f.event_type) return false;
    if (f.severity && e.severity !== f.severity) return false;
    if (f.phi_flag !== undefined && e.phi_flag !== f.phi_flag) return false;
    if (f.since && e.occurred_at_utc < f.since) return false;
    if (f.until && e.occurred_at_utc > f.until) return false;
    return true;
  });
  const offset = f.offset ?? 0;
  const limit = f.limit ?? 200;
  return filtered.slice(offset, offset + limit);
}

export interface ChainVerifyResult {
  ok: boolean;
  streams_verified: number;
  events_verified: number;
  first_break?: { stream: string; event_id: string; reason: string };
}

/** Verify per-stream sequence + hash chain over an event list. */
export function verifyChainList(all: AuditEvent[], stream?: string): ChainVerifyResult {
  const byStream = new Map<string, AuditEvent[]>();
  for (const e of all) {
    if (stream && e.stream !== stream) continue;
    const arr = byStream.get(e.stream) ?? [];
    arr.push(e);
    byStream.set(e.stream, arr);
  }
  let events_verified = 0;
  for (const [s, events] of byStream) {
    events.sort((a, b) => a.sequence - b.sequence);
    let prev = 'GENESIS';
    let expected_seq = 1;
    for (const evt of events) {
      if (evt.sequence !== expected_seq) {
        return { ok: false, streams_verified: 0, events_verified, first_break: {
          stream: s, event_id: evt.event_id, reason: `sequence_gap: expected ${expected_seq}, got ${evt.sequence}`,
        } };
      }
      if (evt.prev_hash !== prev) {
        return { ok: false, streams_verified: 0, events_verified, first_break: {
          stream: s, event_id: evt.event_id, reason: 'prev_hash_mismatch',
        } };
      }
      const candidate: Record<string, unknown> = { ...evt };
      delete candidate.event_hash;
      const recomputed = sha256(prev + '|' + canonical(candidate));
      if (evt.event_hash !== recomputed) {
        return { ok: false, streams_verified: 0, events_verified, first_break: {
          stream: s, event_id: evt.event_id, reason: 'event_hash_mismatch',
        } };
      }
      prev = evt.event_hash;
      expected_seq += 1;
      events_verified += 1;
    }
  }
  return { ok: true, streams_verified: byStream.size, events_verified };
}
