/**
 * Versioned, allowlisted lifecycle record codecs (ADR-0002 Phase 2B closure,
 * commit 2). Ledger B2B-03/04/08/13.
 *
 * Decoders accept `unknown`, validate the COMPLETE schema-V1 shape (including
 * cross-field + step-sequence invariants), reject credential-shaped keys, and
 * return a FRESH allowlisted object — never the raw persisted object, never
 * `raw as T`, never unknown properties. Encoders stamp schemaVersion:1 and
 * validate through the same invariant helpers so encode/decode cannot drift.
 *
 * Codec-owned V1 types keep this commit from cascading into adapters/types.ts.
 * The persisted step vocabulary is the frozen semantic-core one (incl.
 * transition_ready_audited); the legacy completion_audited / failed_without_mutation
 * values are NOT valid in schema V1.
 */
import { ApiError } from '../../errors.js';
import { normalizeIdentityEmail } from './identityEmail.js';
import { stepOrderForAction, type SemanticLifecycleStep } from './semantics.js';
import type { AccountLifecycleStatus, LifecycleAction, LifecycleInitializationSource } from './types.js';

/* ── codec-owned V1 shapes ────────────────────────────────────────────────── */

export interface LifecycleRecordV1 {
  schemaVersion: 1;
  canonicalUserId: string;
  provider: 'cognito';
  providerUsername: string;
  normalizedEmail: string;
  status: AccountLifecycleStatus;
  version: number;
  currentOperationId?: string;
  lastCompletedOperationId?: string;
  reasonCode?: string;
  initializationSource: LifecycleInitializationSource;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export type LifecycleOperationStatusV1 = 'intent_recorded' | 'running' | 'reconciliation_required' | 'completed';

export interface LifecycleOperationV1 {
  schemaVersion: 1;
  operationId: string;
  idempotencyKeyHash: string;
  requestFingerprint: string;
  action: LifecycleAction;
  targetUserId: string;
  actorUserId: string;
  actorEmailSnapshot: string;
  reason: string;
  status: LifecycleOperationStatusV1;
  operationVersion: number;
  expectedLifecycleVersion: number;
  beforeStatus: AccountLifecycleStatus;
  transitionalStatus: AccountLifecycleStatus;
  desiredStatus: AccountLifecycleStatus;
  completedSteps: SemanticLifecycleStep[];
  failedStep?: SemanticLifecycleStep;
  failureCode?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleIdempotencyClaimV1 {
  schemaVersion: 1;
  operationId: string;
  requestFingerprint: string;
}

/* ── errors (fail closed; never leak payload/keys) ────────────────────────── */

const ERR = {
  lifecycle: () => new ApiError('ACCOUNT_LIFECYCLE_RECORD_INVALID', 'Persisted account lifecycle record is malformed.', 503),
  operation: () => new ApiError('LIFECYCLE_OPERATION_RECORD_INVALID', 'Persisted lifecycle operation record is malformed.', 503),
  claim: () => new ApiError('LIFECYCLE_IDEMPOTENCY_RECORD_INVALID', 'Persisted lifecycle idempotency claim is malformed.', 503),
};
type Fail = () => ApiError;

/* ── prohibited credential-shaped keys (recursive, key-only) ──────────────── */

const PROHIBITED = new Set([
  'accesstoken', 'refreshtoken', 'idtoken', 'password', 'cookie', 'authorization',
  'setuptoken', 'authsubject', 'cognitosubject', 'clientsecret', 'secretaccesskey', 'sessiontoken',
]);
const normKey = (k: string) => k.toLowerCase().replace(/[_-]/g, '');
function assertNoProhibitedKeys(value: unknown, fail: Fail, depth = 0): void {
  if (depth > 8 || value === null || typeof value !== 'object') return;
  if (Array.isArray(value)) { for (const el of value) assertNoProhibitedKeys(el, fail, depth + 1); return; }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (PROHIBITED.has(normKey(k))) throw fail();
    assertNoProhibitedKeys(v, fail, depth + 1);
  }
}

/* ── primitive validators ─────────────────────────────────────────────────── */

const ID_MAX_BYTES = 256;
const EMAIL_MAX_BYTES = 320;
const REASON_MAX_BYTES = 1000;
const CODE_MAX_BYTES = 200;
// eslint-disable-next-line no-control-regex
const CONTROL = new RegExp('[\\u0000-\\u001f\\u007f]');
const bytes = (s: string) => Buffer.byteLength(s, 'utf8');
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function id(v: unknown, fail: Fail, maxBytes = ID_MAX_BYTES): string {
  if (typeof v !== 'string' || v.length === 0) throw fail();
  if (v !== v.trim()) throw fail();
  if (CONTROL.test(v)) throw fail();
  if (bytes(v) > maxBytes) throw fail();
  return v;
}
function optId(v: unknown, fail: Fail): string | undefined {
  if (v === undefined) return undefined;
  return id(v, fail);
}
function boundedText(v: unknown, fail: Fail, maxBytes: number): string {
  if (typeof v !== 'string' || v.length === 0) throw fail();
  if (CONTROL.test(v.replace(/[\r\n\t]/g, ''))) throw fail();
  if (bytes(v) > maxBytes) throw fail();
  return v;
}
function posInt(v: unknown, fail: Fail): number {
  if (typeof v !== 'number' || !Number.isSafeInteger(v) || v <= 0) throw fail();
  return v;
}
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
function isoUtc(v: unknown, fail: Fail): string {
  if (typeof v !== 'string' || !ISO_UTC.test(v) || Number.isNaN(Date.parse(v))) throw fail();
  return v;
}
const SHA256_HEX = /^[0-9a-f]{64}$/;
function sha256Hex(v: unknown, fail: Fail): string {
  if (typeof v !== 'string' || !SHA256_HEX.test(v)) throw fail();
  return v;
}
function email(v: unknown, fail: Fail): string {
  if (typeof v !== 'string' || v.length === 0) throw fail();
  if (CONTROL.test(v)) throw fail();
  if (bytes(v) > EMAIL_MAX_BYTES) throw fail();
  if (v !== normalizeIdentityEmail(v)) throw fail(); // already normalized; plus-tag preserved
  return v;
}
function inSet<T extends string>(v: unknown, set: ReadonlySet<string>, fail: Fail): T {
  if (typeof v !== 'string' || !set.has(v)) throw fail();
  return v as T;
}

const LIFECYCLE_STATUSES = new Set<AccountLifecycleStatus>(['pending', 'activating', 'active', 'suspending', 'suspended', 'reactivating', 'disabled', 'reconciliation_required']);
const INIT_SOURCES = new Set<LifecycleInitializationSource>(['verified_legacy_active', 'manual_reconciliation', 'account_provisioning']);
const OP_STATUSES = new Set<LifecycleOperationStatusV1>(['intent_recorded', 'running', 'reconciliation_required', 'completed']);
const ACTIONS = new Set<LifecycleAction>(['suspend', 'reactivate']);

/* ── lifecycle record codec ───────────────────────────────────────────────── */

function assertLifecycleCrossFields(r: LifecycleRecordV1, fail: Fail): void {
  const hasOp = r.currentOperationId !== undefined;
  if (r.status === 'active' && hasOp) throw fail();
  if ((r.status === 'suspending' || r.status === 'reactivating') && !hasOp) throw fail();
  if (hasOp && !(r.status === 'suspending' || r.status === 'reactivating' || r.status === 'reconciliation_required')) throw fail();
  if (r.status === 'reconciliation_required' && !hasOp && r.initializationSource !== 'manual_reconciliation') throw fail();
}

export function decodeLifecycleRecord(raw: unknown, expectedCanonicalUserId: string): LifecycleRecordV1 {
  const fail = ERR.lifecycle;
  if (!isRecord(raw)) throw fail();
  if (raw.schemaVersion !== 1) throw fail();
  assertNoProhibitedKeys(raw, fail);
  const rec: LifecycleRecordV1 = {
    schemaVersion: 1,
    canonicalUserId: id(raw.canonicalUserId, fail),
    provider: raw.provider === 'cognito' ? 'cognito' : (() => { throw fail(); })(),
    providerUsername: id(raw.providerUsername, fail),
    normalizedEmail: email(raw.normalizedEmail, fail),
    status: inSet<AccountLifecycleStatus>(raw.status, LIFECYCLE_STATUSES, fail),
    version: posInt(raw.version, fail),
    initializationSource: inSet<LifecycleInitializationSource>(raw.initializationSource, INIT_SOURCES, fail),
    createdAt: isoUtc(raw.createdAt, fail),
    createdBy: id(raw.createdBy, fail),
    updatedAt: isoUtc(raw.updatedAt, fail),
    updatedBy: id(raw.updatedBy, fail),
  };
  const currentOperationId = optId(raw.currentOperationId, fail);
  if (currentOperationId !== undefined) rec.currentOperationId = currentOperationId;
  const lastCompletedOperationId = optId(raw.lastCompletedOperationId, fail);
  if (lastCompletedOperationId !== undefined) rec.lastCompletedOperationId = lastCompletedOperationId;
  if (raw.reasonCode !== undefined) rec.reasonCode = boundedText(raw.reasonCode, fail, CODE_MAX_BYTES);
  if (rec.canonicalUserId !== expectedCanonicalUserId) throw fail();
  if (Date.parse(rec.createdAt) > Date.parse(rec.updatedAt)) throw fail();
  assertLifecycleCrossFields(rec, fail);
  return rec;
}

export function encodeLifecycleRecord(input: Omit<LifecycleRecordV1, 'schemaVersion'>): LifecycleRecordV1 {
  // Round-trip through the decoder so encode/decode invariants cannot drift.
  return decodeLifecycleRecord({ ...input, schemaVersion: 1 }, input.canonicalUserId);
}

/* ── operation record codec ───────────────────────────────────────────────── */

function assertActionShape(r: LifecycleOperationV1, fail: Fail): void {
  if (r.action === 'suspend') {
    if (!(r.beforeStatus === 'active' && r.transitionalStatus === 'suspending' && r.desiredStatus === 'suspended')) throw fail();
  } else {
    if (!((r.beforeStatus === 'suspended' || r.beforeStatus === 'reconciliation_required') && r.transitionalStatus === 'reactivating' && r.desiredStatus === 'active')) throw fail();
  }
}

/** completedSteps must be a contiguous, in-order, unique prefix of the action order. */
function decodeCompletedSteps(raw: unknown, action: LifecycleAction, fail: Fail): SemanticLifecycleStep[] {
  if (!Array.isArray(raw)) throw fail();
  const order = stepOrderForAction(action);
  if (raw.length > order.length) throw fail();
  const out: SemanticLifecycleStep[] = [];
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] !== order[i]) throw fail(); // enforces membership, order, no-skip, no-dup, no-reorder
    out.push(order[i]);
  }
  return out;
}

function assertOperationStatusRules(r: LifecycleOperationV1, fail: Fail): void {
  const order = stepOrderForAction(r.action);
  const hasFinal = r.completedSteps.includes('final_state_committed');
  switch (r.status) {
    case 'intent_recorded':
    case 'running':
      if (hasFinal || r.failedStep !== undefined || r.failureCode !== undefined) throw fail();
      break;
    case 'reconciliation_required': {
      if (hasFinal || r.failedStep === undefined || r.failureCode === undefined) throw fail();
      // failedStep must be the next uncompleted step (completedSteps is a prefix).
      const next = order[r.completedSteps.length];
      if (r.failedStep !== next) throw fail();
      if (r.completedSteps.includes(r.failedStep)) throw fail();
      break;
    }
    case 'completed': {
      if (r.failedStep !== undefined || r.failureCode !== undefined) throw fail();
      if (r.completedSteps.length !== order.length) throw fail(); // full sequence
      if (r.completedSteps.filter((s) => s === 'final_state_committed').length !== 1) throw fail();
      break;
    }
    default: throw fail();
  }
}

export function decodeLifecycleOperation(raw: unknown, expectedCanonicalUserId: string, expectedOperationId: string): LifecycleOperationV1 {
  const fail = ERR.operation;
  if (!isRecord(raw)) throw fail();
  if (raw.schemaVersion !== 1) throw fail();
  assertNoProhibitedKeys(raw, fail);
  const action = inSet<LifecycleAction>(raw.action, ACTIONS, fail);
  const rec: LifecycleOperationV1 = {
    schemaVersion: 1,
    operationId: id(raw.operationId, fail),
    idempotencyKeyHash: sha256Hex(raw.idempotencyKeyHash, fail),
    requestFingerprint: sha256Hex(raw.requestFingerprint, fail),
    action,
    targetUserId: id(raw.targetUserId, fail),
    actorUserId: id(raw.actorUserId, fail),
    actorEmailSnapshot: email(raw.actorEmailSnapshot, fail),
    reason: boundedText(raw.reason, fail, REASON_MAX_BYTES),
    status: inSet<LifecycleOperationStatusV1>(raw.status, OP_STATUSES, fail),
    operationVersion: posInt(raw.operationVersion, fail),
    expectedLifecycleVersion: posInt(raw.expectedLifecycleVersion, fail),
    beforeStatus: inSet<AccountLifecycleStatus>(raw.beforeStatus, LIFECYCLE_STATUSES, fail),
    transitionalStatus: inSet<AccountLifecycleStatus>(raw.transitionalStatus, LIFECYCLE_STATUSES, fail),
    desiredStatus: inSet<AccountLifecycleStatus>(raw.desiredStatus, LIFECYCLE_STATUSES, fail),
    completedSteps: decodeCompletedSteps(raw.completedSteps, action, fail),
    correlationId: id(raw.correlationId, fail),
    createdAt: isoUtc(raw.createdAt, fail),
    updatedAt: isoUtc(raw.updatedAt, fail),
  };
  if (raw.failedStep !== undefined) {
    if (!stepOrderForAction(action).includes(raw.failedStep as SemanticLifecycleStep)) throw fail();
    rec.failedStep = raw.failedStep as SemanticLifecycleStep;
  }
  if (raw.failureCode !== undefined) rec.failureCode = boundedText(raw.failureCode, fail, CODE_MAX_BYTES);
  if (rec.operationId !== expectedOperationId) throw fail();
  if (rec.targetUserId !== expectedCanonicalUserId) throw fail();
  if (Date.parse(rec.createdAt) > Date.parse(rec.updatedAt)) throw fail();
  assertActionShape(rec, fail);
  assertOperationStatusRules(rec, fail);
  return rec;
}

export function encodeLifecycleOperation(input: Omit<LifecycleOperationV1, 'schemaVersion'>): LifecycleOperationV1 {
  return decodeLifecycleOperation({ ...input, schemaVersion: 1 }, input.targetUserId, input.operationId);
}

/* ── idempotency claim codec ──────────────────────────────────────────────── */

export function decodeLifecycleIdempotencyClaim(raw: unknown): LifecycleIdempotencyClaimV1 {
  const fail = ERR.claim;
  if (!isRecord(raw)) throw fail();
  if (raw.schemaVersion !== 1) throw fail();
  assertNoProhibitedKeys(raw, fail);
  return {
    schemaVersion: 1,
    operationId: id(raw.operationId, fail),
    requestFingerprint: sha256Hex(raw.requestFingerprint, fail),
  };
}

export function encodeLifecycleIdempotencyClaim(input: Omit<LifecycleIdempotencyClaimV1, 'schemaVersion'>): LifecycleIdempotencyClaimV1 {
  return decodeLifecycleIdempotencyClaim({ ...input, schemaVersion: 1 });
}
