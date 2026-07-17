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
  /** Set by constructEvent; callers should not supply it. */
  canon_version?: number;
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
  /**
   * Canonicalization version whose rules were used to compute event_hash.
   * Present (>=2) on all events created from P1-B onward; absent on legacy
   * (v1) events created before versioning existed.
   */
  canon_version?: number;
}

export interface ChainHead { last_hash: string; sequence: number }
export const GENESIS_HEAD: ChainHead = { last_hash: 'GENESIS', sequence: 0 };

/**
 * Current canonicalization version stamped on every new event and included in
 * its hashed content.
 *   v1 (pre-P1-B, unstamped): undefined-valued object properties counted as
 *      null in the hash, but JSON.stringify dropped them on write — so v1
 *      events with unset optional fields are not always reconstructable.
 *   v2 (this and later): undefined-valued object properties are OMITTED, making
 *      the canonical form stable across JSON write/read round trips.
 */
export const CANON_VERSION = 2 as const;

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

/**
 * Legacy (v1) canonicalization: undefined-valued object properties are INCLUDED
 * as null. Retained ONLY to attempt verification of pre-P1-B events. It is not
 * round-trip stable (JSON.stringify drops undefined keys), so v1 events with
 * unset optional fields cannot always be reproduced from disk.
 */
export function canonicalV1(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonicalV1).join(',') + ']';
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalV1(obj[k])).join(',') + '}';
}

/** Canonicalizer for a given version (v2 = current/omit-undefined; v1 = legacy). */
export function canonicalForVersion(version: number, v: unknown): string {
  return version <= 1 ? canonicalV1(v) : canonical(v);
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
    // Stamped and included in the hash so verification is version-aware. Never
    // inferred at read time.
    canon_version: CANON_VERSION,
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

/** Distinct integrity outcomes for a single audit event. */
export type IntegrityState =
  | 'VERIFIED'                   // hash + chain reproduce under the event's canon version
  | 'HASH_MISMATCH'             // VERSIONED event whose recompute fails — definitive tamper/corruption
  | 'CHAIN_BREAK'               // sequence gap or prev_hash link mismatch
  | 'UNSUPPORTED_CANON_VERSION' // canon_version newer than this verifier understands
  | 'LEGACY_UNVERIFIABLE'       // pre-versioning event whose stored hash cannot be reproduced; cause indeterminate
  | 'MALFORMED_EVENT';          // missing required fields / not a well-formed event

/**
 * Non-binding diagnostic hint for a LEGACY_UNVERIFIABLE event. It is NEVER an
 * integrity conclusion — the event remains unverified regardless of the hint.
 *   JSON_DROP           — the event matches the expected audit shape, so its
 *                         failure is CONSISTENT WITH (not proof of) the known
 *                         undefined/JSON.stringify drop defect.
 *   UNKNOWN_LEGACY_SHAPE — the event does not match the expected audit shape.
 */
export type LegacySuspectedReason = 'JSON_DROP' | 'UNKNOWN_LEGACY_SHAPE';

export interface EventIntegrity {
  stream: string;
  event_id: string;
  sequence: number;
  canon_version: number | null;
  state: IntegrityState;
  /** True only when the stored event_hash was reproduced from persisted bytes. */
  hash_verified: boolean;
  /** True when prev_hash links to the prior stored event_hash and sequence is contiguous. */
  chain_link_verified: boolean;
  /** Always true — verification never rewrites or replaces the stored hash. */
  stored_hash_preserved: true;
  /** Diagnostic only; present for LEGACY_UNVERIFIABLE. Never an integrity verdict. */
  suspected_reason?: LegacySuspectedReason;
  detail?: string;
}

export interface ChainIntegrityReport {
  ok: boolean;                       // true only if EVERY event is VERIFIED
  streams: number;
  results: EventIntegrity[];
  counts: Record<IntegrityState, number>;
  first_problem?: EventIntegrity;    // first non-VERIFIED event, if any
}

const HIGHEST_SUPPORTED_CANON = CANON_VERSION;

function emptyCounts(): Record<IntegrityState, number> {
  return {
    VERIFIED: 0, HASH_MISMATCH: 0, CHAIN_BREAK: 0,
    UNSUPPORTED_CANON_VERSION: 0, LEGACY_UNVERIFIABLE: 0, MALFORMED_EVENT: 0,
  };
}

function isMalformed(evt: AuditEvent): boolean {
  return !evt || typeof evt !== 'object'
    || typeof evt.event_id !== 'string'
    || typeof evt.event_hash !== 'string'
    || typeof evt.prev_hash !== 'string'
    || typeof evt.sequence !== 'number'
    || typeof evt.stream !== 'string';
}

/**
 * True when a legacy (unversioned) event carries the structural fields of a
 * genuine audit event. Used ONLY to pick a non-binding suspected_reason hint —
 * it never upgrades an unverifiable event to verified.
 */
function hasExpectedAuditShape(evt: AuditEvent): boolean {
  return typeof evt.event_type === 'string'
    && typeof evt.occurred_at_utc === 'string'
    && typeof evt.action === 'string'
    && !!evt.actor && typeof evt.actor === 'object'
    && !!evt.resource && typeof evt.resource === 'object';
}

/**
 * Version-aware integrity report. Never rewrites events, never recalculates or
 * replaces a stored hash, and never guesses which absent fields were originally
 * undefined. The prev_hash link is always checked against the prior event's
 * STORED hash, so a valid event that follows a legacy-unverifiable one is still
 * reported as link-consistent while the earlier segment stays unverifiable.
 */
export function verifyChainDetailed(all: AuditEvent[], stream?: string): ChainIntegrityReport {
  const byStream = new Map<string, AuditEvent[]>();
  for (const e of all) {
    if (stream && e.stream !== stream) continue;
    const arr = byStream.get(e.stream) ?? [];
    arr.push(e);
    byStream.set(e.stream, arr);
  }
  const results: EventIntegrity[] = [];
  const counts = emptyCounts();

  for (const [s, events] of byStream) {
    events.sort((a, b) => a.sequence - b.sequence);
    let prev = 'GENESIS';
    let expected_seq = 1;
    for (const evt of events) {
      const cv = typeof evt.canon_version === 'number' ? evt.canon_version : null;
      const record = (
        state: IntegrityState,
        opts: { hash_verified: boolean; chain_link_verified: boolean; suspected_reason?: LegacySuspectedReason; detail?: string },
      ): void => {
        results.push({
          stream: s, event_id: evt?.event_id ?? '(unknown)', sequence: evt?.sequence ?? -1, canon_version: cv, state,
          hash_verified: opts.hash_verified, chain_link_verified: opts.chain_link_verified,
          stored_hash_preserved: true, suspected_reason: opts.suspected_reason, detail: opts.detail,
        });
        counts[state] += 1;
      };

      if (isMalformed(evt)) {
        record('MALFORMED_EVENT', { hash_verified: false, chain_link_verified: false, detail: 'missing required event fields' });
        continue;
      }

      // Chain position (uses stored prev hashes only).
      if (evt.sequence !== expected_seq) {
        record('CHAIN_BREAK', { hash_verified: false, chain_link_verified: false, detail: `sequence gap: expected ${expected_seq}, got ${evt.sequence}` });
      } else if (evt.prev_hash !== prev) {
        record('CHAIN_BREAK', { hash_verified: false, chain_link_verified: false, detail: 'prev_hash does not match prior stored event_hash' });
      } else {
        const candidate: Record<string, unknown> = { ...evt };
        delete candidate.event_hash;
        if (cv === null) {
          // Legacy (pre-versioning). Reproduce the stored hash if possible; if
          // not, we CANNOT distinguish the known JSON-drop defect from
          // corruption or tampering, so we stay conservative: never VERIFIED,
          // never benign. suspected_reason is a diagnostic hint only.
          const okV1 = evt.event_hash === sha256(prev + '|' + canonicalV1(candidate));
          const okV2 = evt.event_hash === sha256(prev + '|' + canonical(candidate));
          if (okV1 || okV2) {
            record('VERIFIED', { hash_verified: true, chain_link_verified: true, detail: 'legacy event reproduced from persisted bytes' });
          } else {
            record('LEGACY_UNVERIFIABLE', {
              hash_verified: false, chain_link_verified: true,
              suspected_reason: hasExpectedAuditShape(evt) ? 'JSON_DROP' : 'UNKNOWN_LEGACY_SHAPE',
              detail: 'stored hash not reproducible from persisted bytes; cause indeterminate (JSON-drop vs tamper) — treated as unverifiable',
            });
          }
        } else if (cv > HIGHEST_SUPPORTED_CANON) {
          record('UNSUPPORTED_CANON_VERSION', { hash_verified: false, chain_link_verified: true, detail: `canon_version ${cv} > supported ${HIGHEST_SUPPORTED_CANON}` });
        } else {
          const recomputed = sha256(prev + '|' + canonicalForVersion(cv, candidate));
          const ok = evt.event_hash === recomputed;
          record(ok ? 'VERIFIED' : 'HASH_MISMATCH', { hash_verified: ok, chain_link_verified: true, detail: cv === 1 ? 'v1 recompute' : undefined });
        }
      }
      // Advance the chain by the STORED hash regardless of content verifiability,
      // so later events' links can still be checked.
      prev = evt.event_hash;
      expected_seq += 1;
    }
  }

  const first_problem = results.find(r => r.state !== 'VERIFIED');
  return { ok: !first_problem, streams: byStream.size, results, counts, first_problem };
}

export interface ChainVerifyResult {
  ok: boolean;
  streams_verified: number;
  events_verified: number;
  first_break?: { stream: string; event_id: string; reason: string };
}

/**
 * Backward-compatible chain verification (original shape). Derived from the
 * version-aware report; `ok` is true only when every event is VERIFIED, and
 * first_break.reason carries the precise integrity state.
 */
export function verifyChainList(all: AuditEvent[], stream?: string): ChainVerifyResult {
  const report = verifyChainDetailed(all, stream);
  return {
    ok: report.ok,
    streams_verified: report.ok ? report.streams : 0,
    events_verified: report.counts.VERIFIED,
    first_break: report.first_problem
      ? { stream: report.first_problem.stream, event_id: report.first_problem.event_id, reason: report.first_problem.state }
      : undefined,
  };
}
