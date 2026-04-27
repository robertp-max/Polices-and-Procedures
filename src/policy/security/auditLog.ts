// Append-only, hash-chained audit event store.
// See Builder/Security-Execution-Audit/04-Audit-Trail-Architecture.md.

import type {
  AuditEvent, AuditEventInput, EventId,
} from './types';
import { canonicalJSON, sha256Hex, uuidv7, GENESIS_HASH } from './hash';

export interface AuditStore {
  append(input: AuditEventInput): Promise<AuditEvent>;
  list(filter?: AuditQuery): Promise<AuditEvent[]>;
  get(id: EventId): Promise<AuditEvent | undefined>;
  verifyChain(): Promise<ChainVerificationResult>;
  size(): number;
}

export interface AuditQuery {
  category?: string;
  action?: string;
  actorUserId?: string;
  targetKind?: string;
  targetId?: string;
  correlationId?: string;
  fromSequence?: number;
  toSequence?: number;
  since?: string;
  until?: string;
  limit?: number;
}

export interface ChainVerificationResult {
  ok: boolean;
  verifiedCount: number;
  brokenAt?: { sequence: number; eventId: EventId; expected: string; actual: string };
}

// Sync-write contract: certain critical events MUST be persisted before returning.
const CRITICAL_ACTIONS = new Set<string>([
  'ACCESS_DECISION',
  'SOD_VIOLATION',
  'SIGNATURE_COLLECTED',
  'SIGNATURE_BYPASS_ATTEMPT',
  'PHI_VIEWED',
  'PHI_EXPORTED',
  'PHI_WRITE',
  'OVERRIDE_REQUESTED',
  'OVERRIDE_APPROVED',
  'OVERRIDE_DENIED',
  'OVERRIDE_EXPIRED',
  'CEU_OVERRIDDEN',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'CHAIN_BROKEN_DETECTED',
]);

export function isCriticalAction(action: string): boolean {
  return CRITICAL_ACTIONS.has(action);
}

// In-memory implementation (default for client/dev). Persistence adapters
// must enforce append-only at storage level (see Doc 04 §5).
export class InMemoryAuditStore implements AuditStore {
  private events: AuditEvent[] = [];
  private lastChainHash: string = GENESIS_HASH;

  async append(input: AuditEventInput): Promise<AuditEvent> {
    const sequence = this.events.length + 1;
    const id = uuidv7();
    const timestamp = new Date().toISOString();

    const partial: Omit<AuditEvent, 'integrity'> = {
      id, sequence, timestamp,
      actor: input.actor,
      action: input.action,
      category: input.category,
      target: input.target,
      before: input.before,
      after: input.after,
      diff: input.diff,
      context: input.context,
    };

    const payloadHash = await sha256Hex(canonicalJSON(partial));
    const previousHash = this.lastChainHash;
    const chainHash = await sha256Hex(previousHash + payloadHash);

    const event: AuditEvent = {
      ...partial,
      integrity: { payloadHash, previousHash, chainHash },
    };

    // Append-only — push and freeze.
    Object.freeze(event.integrity);
    Object.freeze(event);
    this.events.push(event);
    this.lastChainHash = chainHash;
    return event;
  }

  async get(id: EventId): Promise<AuditEvent | undefined> {
    return this.events.find(e => e.id === id);
  }

  async list(q: AuditQuery = {}): Promise<AuditEvent[]> {
    let out = this.events;
    if (q.category) out = out.filter(e => e.category === q.category);
    if (q.action) out = out.filter(e => e.action === q.action);
    if (q.actorUserId) out = out.filter(e => e.actor.userId === q.actorUserId);
    if (q.targetKind) out = out.filter(e => e.target.kind === q.targetKind);
    if (q.targetId) out = out.filter(e => e.target.id === q.targetId);
    if (q.correlationId) out = out.filter(e => e.context.correlationId === q.correlationId);
    if (q.fromSequence != null) out = out.filter(e => e.sequence >= q.fromSequence!);
    if (q.toSequence != null) out = out.filter(e => e.sequence <= q.toSequence!);
    if (q.since) out = out.filter(e => e.timestamp >= q.since!);
    if (q.until) out = out.filter(e => e.timestamp <= q.until!);
    if (q.limit) out = out.slice(0, q.limit);
    return out;
  }

  async verifyChain(): Promise<ChainVerificationResult> {
    let prev = GENESIS_HASH;
    let verified = 0;
    for (const e of this.events) {
      const { integrity, ...rest } = e;
      const recomputedPayload = await sha256Hex(canonicalJSON(rest));
      const recomputedChain = await sha256Hex(prev + recomputedPayload);
      if (
        recomputedPayload !== integrity.payloadHash ||
        recomputedChain !== integrity.chainHash ||
        prev !== integrity.previousHash
      ) {
        return {
          ok: false,
          verifiedCount: verified,
          brokenAt: {
            sequence: e.sequence,
            eventId: e.id,
            expected: recomputedChain,
            actual: integrity.chainHash,
          },
        };
      }
      prev = integrity.chainHash;
      verified++;
    }
    return { ok: true, verifiedCount: verified };
  }

  size(): number { return this.events.length; }
}

// Process-wide singleton (replace with persistent store via setAuditStore() in server bootstrap).
let _store: AuditStore = new InMemoryAuditStore();
export function getAuditStore(): AuditStore { return _store; }
export function setAuditStore(s: AuditStore): void { _store = s; }

// Convenience emitter that the rest of the system uses.
export async function emit(input: AuditEventInput): Promise<AuditEvent> {
  return getAuditStore().append(input);
}
