/**
 * Account-lifecycle audit sink (ADR-0002 Phase 2E).
 *
 * Bridges the orchestrator's lifecycle audit events onto the enterprise
 * append-only audit stream (hash-chained). The transition-ready event is written
 * BEFORE the final commit (gated); the completed event is written after. Each is
 * idempotency-keyed by operation+phase so a replay/retry never double-writes.
 *
 * Only accountability metadata is recorded — the acting admin's id + work-email
 * snapshot, the target canonical id, the action/phase, and the resulting status.
 * No PHI, tokens, provider subjects, or reason text.
 */
import { appendEvent } from '../../audit/writer.js';
import type { AuditEventInput } from '../../audit/store/eventModel.js';
import type { LifecycleAuditSink } from './service.js';

/** The append seam is injectable so the sink is unit-testable without a store. */
export function createLifecycleAuditSink(
  append: (input: AuditEventInput) => Promise<unknown> = appendEvent,
): LifecycleAuditSink {
  return {
    async record(e) {
      await append({
        event_type: `account_lifecycle.${e.action}.${e.phase}`,
        stream: 'user-access',
        idempotency_key: `lifecycle:${e.operationId}:${e.phase}`,
        actor: { type: 'user', user_id: e.actorUserId, display_name: e.actorEmailSnapshot },
        action: `account_lifecycle.${e.action}`,
        resource: { type: 'user', id: e.canonicalUserId },
        decision: 'permit',
        after: { lifecycleStatus: e.finalStatus, phase: e.phase },
        correlation_id: e.correlationId,
        severity: 'notice',
      });
    },
  };
}
