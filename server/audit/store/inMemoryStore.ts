/**
 * InMemoryAuditEventStore — deterministic backend for unit + concurrency tests.
 * Same event model/hashing/PHI guard/idempotency as JSONL; a single internal
 * queue serializes appends so simultaneous callers cannot break the chain.
 */
import type { AuditEventStore } from './auditEventStore.js';
import {
  assertNoPhi, constructEvent, defaultGenerators, filterEvents, verifyChainList,
  GENESIS_HEAD,
  type AuditEvent, type AuditEventInput, type ChainHead, type ChainVerifyResult,
  type EventGenerators, type QueryFilter,
} from './eventModel.js';

export class InMemoryAuditEventStore implements AuditEventStore {
  private readonly gen: EventGenerators;
  private readonly events: AuditEvent[] = [];
  private readonly chainHeads = new Map<string, ChainHead>();
  private readonly idempotency = new Map<string, string>(); // key → event_id
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(opts: { generators?: EventGenerators } = {}) {
    this.gen = opts.generators ?? defaultGenerators();
  }

  private serialize<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.writeQueue.then(fn, fn);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  async append(input: AuditEventInput): Promise<AuditEvent> {
    assertNoPhi(input);
    return this.serialize(async () => {
      if (input.idempotency_key) {
        const priorId = this.idempotency.get(`${input.stream}::${input.idempotency_key}`);
        if (priorId) {
          const prior = this.events.find(e => e.event_id === priorId);
          if (prior) return prior;
        }
      }
      const head = this.chainHeads.get(input.stream) ?? GENESIS_HEAD;
      const event = constructEvent(input, head, this.gen);
      this.events.push(event);
      this.chainHeads.set(input.stream, { last_hash: event.event_hash, sequence: event.sequence });
      if (input.idempotency_key) {
        this.idempotency.set(`${input.stream}::${input.idempotency_key}`, event.event_id);
      }
      return event;
    });
  }

  async readAll(): Promise<AuditEvent[]> {
    return this.events.map(e => ({ ...e }));
  }

  async queryEvents(filter: QueryFilter): Promise<AuditEvent[]> {
    return filterEvents(await this.readAll(), filter);
  }

  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return this.events.find(e => e.event_id === eventId) ?? null;
  }

  async verifyChains(stream?: string): Promise<ChainVerifyResult> {
    return verifyChainList(await this.readAll(), stream);
  }
}
