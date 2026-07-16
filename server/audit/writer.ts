/**
 * Enterprise Audit Writer — COMPATIBILITY FACADE.
 * ─────────────────────────────────────────────────────────────────────────────
 * The audit event model, hashing, PHI guard, chain verification, and the
 * pluggable backends now live under `server/audit/store/`. This module preserves
 * the original public surface (`appendEvent`, `readAll`, `queryEvents`,
 * `getEvent`, `verifyChains`, `canonical`, the types, `AuditWriteError`) so every
 * existing caller is unchanged, and delegates to the configured
 * `AuditEventStore`.
 *
 * Default backend: JSONL (`server/audit/data/audit_events.jsonl`) — identical
 * behavior to before. Select the transactional Firestore backend with
 * `AUDIT_STORE_BACKEND=firestore` (see store/factory.ts and ADR-0001). Durable
 * multi-instance audit is NOT yet the runtime default; JSONL remains active.
 */
import { getAuditEventStore } from './store/factory.js';
import type {
  AuditEvent, AuditEventInput, ChainVerifyResult, QueryFilter,
} from './store/eventModel.js';

// Re-export the model surface so `import { ... } from '../audit/writer.js'`
// keeps working for every existing caller.
export {
  canonical, containsPhiKey, constructEvent, verifyChainList, AuditWriteError,
} from './store/eventModel.js';
export type {
  Severity, RetentionClass, ActorType, Actor, ResourceRef, Environment, Decision,
  AuditEventInput, AuditEvent, QueryFilter,
} from './store/eventModel.js';

/** Append a new AuditEvent through the configured backend. */
export async function appendEvent(input: AuditEventInput): Promise<AuditEvent> {
  return getAuditEventStore().append(input);
}

export async function readAll(): Promise<AuditEvent[]> {
  return getAuditEventStore().readAll();
}

export async function queryEvents(f: QueryFilter): Promise<AuditEvent[]> {
  return getAuditEventStore().queryEvents(f);
}

export async function getEvent(event_id: string): Promise<AuditEvent | null> {
  return getAuditEventStore().getEvent(event_id);
}

export async function verifyChains(stream?: string): Promise<ChainVerifyResult> {
  return getAuditEventStore().verifyChains(stream);
}
