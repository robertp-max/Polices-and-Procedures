/**
 * Enterprise Audit Writer (generalized)
 * ─────────────────────────────────────────────────────────────────────────────
 * Implements the canonical AuditEvent envelope from
 * `Builder/Enterprise/03-Enterprise-Audit-Model.md`.
 *
 * Properties:
 *   - Append-only JSONL persistence (`server/audit/data/audit_events.jsonl`).
 *   - Per-stream hash chain: event[n].prev_hash = event[n-1].event_hash for
 *     events sharing the same `stream` value.
 *   - Canonical JSON serialization (key-sorted) for stable hashing.
 *   - Idempotency by (stream, idempotency_key) when supplied.
 *   - PHI guard: rejects events whose `payload`/`before`/`after` look like they
 *     contain a PHI marker. PHI is strictly metadata-only here.
 *
 * This writer is ADDITIVE. The existing eCIgn audit chain
 * (`server/ecign/store.ts` + `server/ecign/hashChain.ts`) continues to operate
 * unchanged; this writer is the single sink for new domains, the access PDP,
 * the activity tracker, and the CEU layer.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'audit_events.jsonl');

await fs.mkdir(DATA_DIR, { recursive: true });

// ── Types ──────────────────────────────────────────────────────────────────

export type Severity = 'info' | 'notice' | 'warning' | 'high' | 'critical';
export type RetentionClass = 'standard' | 'claims' | 'phi-access' | 'legal-hold';

export type ActorType = 'user' | 'service' | 'system';

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

export type Decision = 'permit' | 'deny' | 'indeterminate';

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

// ── Helpers ────────────────────────────────────────────────────────────────

function ulid(): string {
  return `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/** Canonical JSON: keys sorted recursively. */
export function canonical(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

// PHI guard: forbid raw PHI patterns in payload/before/after. Only opaque IDs
// (e.g., "patient_id": "pt_..") are allowed; raw names/SSNs/DOBs are rejected.
const PHI_FIELD_KEYS = new Set([
  'ssn', 'social_security_number', 'mrn', 'medical_record_number',
  'patient_name', 'patient_first_name', 'patient_last_name',
  'patient_address', 'patient_dob', 'date_of_birth',
  'diagnosis_text', 'note_text', 'clinical_note',
]);

function containsPhiKey(v: unknown, depth = 0): string | null {
  if (depth > 6 || v === null || typeof v !== 'object') return null;
  for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
    if (PHI_FIELD_KEYS.has(k.toLowerCase())) return k;
    const inner = containsPhiKey(child, depth + 1);
    if (inner) return inner;
  }
  return null;
}

// ── In-memory chain head cache (rebuilt lazily on first call) ──────────────

interface ChainHead { last_hash: string; sequence: number }
const chainHeads = new Map<string, ChainHead>();
const idempotencyIndex = new Set<string>(); // `${stream}::${idempotency_key}`
let cacheLoaded = false;

async function ensureCacheLoaded(): Promise<void> {
  if (cacheLoaded) return;
  try {
    const txt = await fs.readFile(EVENTS_FILE, 'utf8');
    for (const line of txt.split('\n')) {
      if (!line) continue;
      const evt = JSON.parse(line) as AuditEvent;
      chainHeads.set(evt.stream, { last_hash: evt.event_hash, sequence: evt.sequence });
      if (evt.idempotency_key) {
        idempotencyIndex.add(`${evt.stream}::${evt.idempotency_key}`);
      }
    }
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  cacheLoaded = true;
}

// ── Serialization writer (single-process safe; queues to avoid interleaving) ─
let writeQueue: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.catch(() => undefined);
  return next;
}

// ── Public API ─────────────────────────────────────────────────────────────

export class AuditWriteError extends Error {
  constructor(public code: string, msg: string) { super(msg); }
}

/**
 * Append a new AuditEvent to the global chain.
 * Returns the persisted event with `event_id`, `sequence`, `prev_hash`,
 * and `event_hash` populated.
 */
export async function appendEvent(input: AuditEventInput): Promise<AuditEvent> {
  // PHI guard (cheap structural check; not a full DLP scan)
  const phiHitPayload = input.payload ? containsPhiKey(input.payload) : null;
  const phiHitBefore = input.before ? containsPhiKey(input.before) : null;
  const phiHitAfter = input.after ? containsPhiKey(input.after) : null;
  const phiHit = phiHitPayload ?? phiHitBefore ?? phiHitAfter;
  if (phiHit) {
    throw new AuditWriteError(
      'phi_in_payload',
      `Audit event ${input.event_type} contains PHI-like field "${phiHit}" in payload/before/after; reject.`,
    );
  }

  return serialize(async () => {
    await ensureCacheLoaded();

    if (input.idempotency_key) {
      const key = `${input.stream}::${input.idempotency_key}`;
      if (idempotencyIndex.has(key)) {
        // Find and return the prior event (no duplicate write).
        const prior = await findByIdempotency(input.stream, input.idempotency_key);
        if (prior) return prior;
      }
    }

    const head = chainHeads.get(input.stream) ?? { last_hash: 'GENESIS', sequence: 0 };
    const event_id = ulid();
    const occurred_at_utc = new Date().toISOString();
    const sequence = head.sequence + 1;
    const prev_hash = head.last_hash;

    const candidate: Omit<AuditEvent, 'event_hash'> = {
      event_id,
      event_type: input.event_type,
      event_version: input.event_version ?? 1,
      occurred_at_utc,
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
      correlation_id: input.correlation_id ?? ulid(),
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
    const event: AuditEvent = { ...candidate, event_hash };

    await fs.appendFile(EVENTS_FILE, JSON.stringify(event) + '\n', 'utf8');
    chainHeads.set(input.stream, { last_hash: event_hash, sequence });
    if (input.idempotency_key) {
      idempotencyIndex.add(`${input.stream}::${input.idempotency_key}`);
    }
    return event;
  });
}

async function findByIdempotency(stream: string, key: string): Promise<AuditEvent | null> {
  const all = await readAll();
  for (let i = all.length - 1; i >= 0; i--) {
    const e = all[i];
    if (e.stream === stream && e.idempotency_key === key) return e;
  }
  return null;
}

/** Read all events (small-scale; pagination/index will replace this in Phase B). */
export async function readAll(): Promise<AuditEvent[]> {
  try {
    const txt = await fs.readFile(EVENTS_FILE, 'utf8');
    return txt.split('\n').filter(Boolean).map(l => JSON.parse(l) as AuditEvent);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw e;
  }
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

export async function queryEvents(f: QueryFilter): Promise<AuditEvent[]> {
  const all = await readAll();
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

export async function getEvent(event_id: string): Promise<AuditEvent | null> {
  const all = await readAll();
  return all.find(e => e.event_id === event_id) ?? null;
}

/** Verify hash chain across one stream or all streams. */
export async function verifyChains(stream?: string): Promise<{
  ok: boolean;
  streams_verified: number;
  events_verified: number;
  first_break?: { stream: string; event_id: string; reason: string };
}> {
  const all = await readAll();
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
      const recomputed = sha256(prev + '|' + canonical({ ...evt, event_hash: undefined }));
      // Strip event_hash by reconstructing candidate fields:
      const candidate: Record<string, unknown> = { ...evt };
      delete candidate.event_hash;
      const recomputed2 = sha256(prev + '|' + canonical(candidate));
      if (evt.event_hash !== recomputed && evt.event_hash !== recomputed2) {
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
