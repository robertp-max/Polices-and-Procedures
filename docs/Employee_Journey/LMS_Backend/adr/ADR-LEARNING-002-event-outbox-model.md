# ADR-LEARNING-002 — Event and outbox model

**Status:** Accepted (Wave 0)
**Date:** 2026-07-27
**Controlling spec:** architecture §7, §17, §18

## Context

Every accepted command must, in one transaction, write: the domain state change,
an append-only domain event, a transactional outbox record, and audit metadata
(§17). Projections (notifications, CES tasks, calendar, certificate jobs,
compliance dashboards) are downstream and must never be the completion/deadline
authority (§18). Consumers deduplicate on `idempotencyKey` and event payloads
must not carry PHI or large documents (§17).

## Decision

1. **Single-transaction write.** On each mutation the service performs one
   Firestore transaction that writes: (a) the changed aggregate document,
   (b) an immutable event document in `learning-events` (sharded `SUBJECT#{id}#{YYYYMM}`),
   and (c) an `outbox` document with `status: PENDING`. If any part fails, the
   whole command fails; no partial state.

2. **Event envelope** = the spec's `LearningActivityEvent` fields
   (`id, tenantId, subjectId, actorSubjectId, assignmentId, sessionId?, eventType,
   eventVersion, sequence?, occurredAt, receivedAt, idempotencyKey, correlationId,
   causationId?, contentRef?, payload, payloadSha256`). `payloadSha256` is computed
   over a canonicalized payload; the raw payload excludes PHI and large blobs
   (those live in `ArtifactStore` and are referenced by locator+sha256).

3. **Outbox relay.** A relay worker claims `PENDING` outbox rows, dispatches to
   Cloud Tasks / Pub/Sub, and marks `SENT`. Delivery is at-least-once; every
   consumer is idempotent on `idempotencyKey`. Relay is the *only* path from state
   change to side effect — services never call notification/cert APIs inline.

4. **Idempotency key** is required on every mutation request (`Idempotency-Key`
   header) and is stored on the aggregate's last-write marker; a replay with the
   same key returns the prior result without a second state change or event.

5. **Optional high-assurance chain.** Events may carry `prevEventHash` +
   `streamId` + `sequence` (§17) to form a per-subject hash chain; enabled per
   environment via config, verified by an audit job.

6. **Sequencing.** Activity heartbeats/events carry a monotonic `sequence`;
   out-of-order or duplicate sequences are idempotently ignored (§7.2).

## Consequences

- Exactly-once *effect* is achieved via at-least-once delivery + idempotent
  consumers, not distributed transactions.
- Projections can be rebuilt by replaying `learning-events`; read models are
  disposable.
- No side effect can occur without a durable event + outbox row, satisfying the
  §22 release gate "a mutation emits no event/outbox record → fail".

## Rejected alternatives

- **Dual-write (state then publish) without outbox** — rejected: risks lost
  events on crash between writes.
- **Event payload carries documents/PHI** — rejected by §17/§3.8.
