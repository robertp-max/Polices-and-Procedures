# Care Indeed LMS Backend — Performance QA

Scope: architecture §20.3 (events access pattern / hot-partition avoidance) and §23
(runtime health). Platform is **Google Cloud / Firestore** (per `ports.ts` and
ADR-LEARNING-001/002); the DynamoDB key shapes in §20 are read as the logical access-pattern
model and mapped onto Firestore collections/composite indexes.

The domain layer is pure and in-memory, so most performance controls are **design-level
contracts** here; the numbers (lag, backlog, job age) can only be *measured* by the running
service. Each item below is tagged **[Design]** (guaranteed by the code/data model) or
**[Live]** (must be measured/enforced by the deployed service).

## 1. Firestore hot-partition avoidance — event stream

- **[Design]** Events are partitioned by **subject + calendar month** so no single document
  path grows unbounded and writes fan out across shards. Logical key (§20.3):
  - `PK = SUBJECT#<subjectId>#<YYYYMM>` / `SK = TS#<occurredAt>#EVENT#<eventId>`
  - Secondary read path by stream: `GSI1PK = ASSIGNMENT#<assignmentId>`.
- The domain already emits **deterministic, monotonic cycle/period keys** that this sharding
  reuses: `computeCycleKey` (`YYYY`/`YYYYMM`-style anchors) and `cycleUniqueKey` in
  `recurrence.ts`, and `issuanceKey` in `certificates.ts` for idempotent write dedup.
- **[Live]** Confirm the Firestore document ID actually embeds `<subjectId>#<YYYYMM>` (not a
  single per-subject or per-day doc), and that high-write onboarding cohorts do not converge
  on one monthly shard; add append-only write batching in the outbox relay.

## 2. Read-model projections (avoid live aggregation on the hot path)

- **[Design]** Reporting queries read **precomputed projections**, never recompute from the
  event log at request time. The projection shapes are already defined in the domain:
  - `buildTranscript` / `TranscriptRow` / `TranscriptInput` · `recurrence.ts` (learner
    transcript, §19.1).
  - `deriveCycleStatus` → `SCHEDULED/OPEN/DUE/OVERDUE/SATISFIED/CLOSED` · `recurrence.ts`
    (feeds the supervisor due/overdue projection, §19.2).
  - `deriveInitialStatus`/`buildAssignment` · `planning.ts` (assignment status projection).
  - `hhaInserviceHours` / `sumAcceptedCredit` · `recurrence.ts` (rolling-hours projection).
- **[Live]** Outbox consumers must materialize these into Firestore read-model collections so
  supervisor/HR dashboards are single indexed reads; projections are non-authoritative
  (§18) and rebuildable from the event log.

## 3. Index coverage for the expensive queries

Logical GSIs (§20.2) mapped to Firestore composite indexes — **[Live]** must be declared in
`firestore.indexes.json`; the domain defines the exact fields each must cover:

| Query (report §) | Driven by (domain) | Required composite index (fields) |
|------------------|--------------------|-----------------------------------|
| Supervisor / reviewer queue (§19.2) | `requiredSignoffsPresent`, pending signoffs | branch/supervisor + status + dueAt |
| Due / overdue assignments (§19.2) | `deriveCycleStatus`, `deriveInitialStatus` | subject/branch + cycleStatus + dueAt |
| Certificate public ID lookup (§12.3) | `publicVerificationView` | publicId (single-field, unique) |
| Content revision → assignments (§21) | `buildAssignment` (pinned `ContentRevisionRef`) | contentId + version |
| Cycle / status reporting (§19.3) | `deriveCycleStatus`, `computeCycleKey` | requirementRef + cycleKey + status |

Without these, due/overdue and supervisor-queue reads degrade to collection scans — this is
the primary live-layer performance risk to verify.

## 4. Runtime health metrics (§23) — sanitized

The domain models the quantities; the **[Live]** service must sample and expose them. Per §23
the health surface must **exclude learner PII, tokens, answer keys, and artifact paths**.

| Metric | Kind | Domain hook / source |
|--------|------|----------------------|
| Content adapter availability | [Live] | `ContentRegistry.isAvailable` · `ports.ts` |
| Unresolved content count | [Design→Live] | `deriveInitialStatus` → `PENDING_CONTENT`/`BLOCKED_CONTENT` · `planning.ts` |
| **Event projection lag** | [Live] | append vs. last-projected offset on `LearningEventStore` |
| **Outbox backlog** | [Live] | undelivered outbox rows (relay queue depth) |
| **Oldest certificate job age** | [Live] | age of the oldest `JobQueue.enqueue` cert-render task · `ports.ts` |
| Evidence rejection rate | [Design→Live] | `rejectEvidence`/`validateEvidence` outcomes · `evidence.ts` |
| Signature backlog | [Design→Live] | pending `SIGNOFF_PRESENT` slots via `requiredSignoffsPresent` · `evidence.ts` |
| Overdue recurrence cycles | [Design→Live] | `deriveCycleStatus === 'OVERDUE'` · `recurrence.ts` |
| Gate evaluation errors | [Design→Live] | `evaluateGate` FAIL/unknown-rule reason codes · `gates.ts` |
| Audit-chain status | [Live] | event-hash/prev-hash chain integrity (§17) |
| Migration conflicts | [Design→Live] | `classifyBatch` → `AMBIGUOUS`/`QUARANTINED`/`REJECTED` · `migration.ts` |

**Sanitization confirmed at the domain boundary:** the only outward-facing view,
`publicVerificationView` (`certificates.ts`), already returns non-sensitive fields only, and
`GateEvaluation`/manifest carry IDs + fingerprints (`stateVectorFingerprint`,
`manifestFingerprint`) rather than PII — so the health/metrics surface can be built from these
without leaking PII, tokens, keys, or artifact paths.

## Net assessment

The **data model and projection contracts** needed to stay fast at scale are already fixed in
the domain: subject+month event sharding, deterministic cycle/issuance keys for dedup, and
pure projection builders (`buildTranscript`, `deriveCycleStatus`, `hhaInserviceHours`,
`deriveInitialStatus`) that let every report be a single indexed read instead of a live
aggregation. What remains is entirely **live-service work**: declaring the Firestore composite
indexes above, running the outbox relay + projection consumers, and instrumenting the §23
health metrics (projection lag, outbox backlog, oldest cert-job age) — none of which the
in-memory domain can measure on its own.
