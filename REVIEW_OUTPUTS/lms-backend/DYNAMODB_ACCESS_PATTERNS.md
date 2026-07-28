# Firestore Access Patterns — Care Indeed LMS Backend

> **Platform note.** Care Indeed runs on **Google Cloud**, not AWS. This file keeps the
> historical filename `DYNAMODB_ACCESS_PATTERNS.md` for traceability, but it documents the
> **Cloud Firestore** data model. The source architecture
> (`CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §20) was written against DynamoDB and uses
> DynamoDB names (PK/SK single-table design, GSI1–GSI5). This document **translates** that
> §20 design into Firestore collections, subcollections, and composite indexes. Where §20
> says "table", read "root collection"; where it says "PK/SK item", read "document"; where it
> says "GSI", read "composite index / collection-group query". The persistence port that
> backs all of this is `LearningRecordStore` / `LearningEventStore` in
> `src/learning/domain/ports.ts` — the domain never imports a cloud SDK, so the same ports
> could target DynamoDB again without touching domain logic.

---

## 1. GCP service mapping

| Architecture §4.2 (AWS)          | Care Indeed Phase-1 (GCP)                  | Port (`ports.ts`)        |
| -------------------------------- | ------------------------------------------ | ------------------------ |
| DynamoDB `cihh-learning-records` | Firestore database `learning-records`      | `LearningRecordStore`    |
| DynamoDB `cihh-learning-events`  | Firestore root collection `events` (sharded) | `LearningEventStore`   |
| DynamoDB GSI1–GSI5               | Firestore composite indexes + collection-group queries | (query methods) |
| S3 staging / artifacts           | Cloud Storage (GCS) buckets                | `ArtifactStore`          |
| SQS                              | Cloud Tasks / Pub-Sub                      | `JobQueue`               |
| KMS signatures                   | Cloud KMS asymmetric sign                  | `Signer`                 |
| Transactional outbox            | Firestore transaction + `events`/outbox doc | `LearningEventStore`   |

Physical adapter decisions are governed by **ADR-LEARNING-001** (Firestore/GCS/Cloud
KMS/Cloud Tasks), referenced in `types.ts` and `ports.ts`.

---

## 2. From DynamoDB single-table to Firestore collections

DynamoDB §20 modeled everything under one partition key `SUBJECT#<subjectId>` with a sort
key discriminator (`PROFILE`, `ROLE#…`, `ASSIGNMENT#…`). Firestore's document/subcollection
tree expresses the same locality-of-reference more naturally: **one document per subject**,
with a **typed subcollection per record kind**. A "get everything for a subject" is a set of
subcollection reads under a single parent path — the Firestore equivalent of a DynamoDB
`Query` on one partition.

### 2.1 Per-subject document + typed subcollections

Parent document: `subjects/{subjectId}` (holds the `LearningSubject` profile — the old
`SK = PROFILE` item).

| §20 sort-key item (`SK = …`)                | Firestore path                                                | Domain type          |
| ------------------------------------------- | ------------------------------------------------------------- | -------------------- |
| `PROFILE`                                   | `subjects/{subjectId}` (the doc itself)                       | `LearningSubject`    |
| `ROLE#<roleAssignmentId>`                   | `subjects/{subjectId}/roles/{roleAssignmentId}`               | `RoleAssignment`     |
| `PLAN#<planId>`                             | `subjects/{subjectId}/plans/{planId}`                         | `JourneyPlan`        |
| `ASSIGNMENT#<assignmentId>`                 | `subjects/{subjectId}/assignments/{assignmentId}`             | `LearningAssignment` |
| `ATTEMPT#<assignmentId>#<attemptNumber>`    | `subjects/{subjectId}/attempts/{assignmentId}_{attemptNumber}` | `AssessmentAttempt`  |
| `GRADE#<assignmentId>`                       | `subjects/{subjectId}/grades/{assignmentId}`                   | `GradeResult`        |
| `EVIDENCE#<evidenceId>`                     | `subjects/{subjectId}/evidence/{evidenceId}`                  | `CompletionEvidence` |
| `SIGNOFF#<signoffId>`                       | `subjects/{subjectId}/signoffs/{signoffId}`                  | `SignoffRecord`      |
| `GATE#<gateId>#<evaluatedAt>`               | `subjects/{subjectId}/gates/{gateId}_{evaluatedAt}`          | `GateDecision`       |
| `CERTIFICATE#<certificateId>`               | `subjects/{subjectId}/certificates/{certificateId}`          | `CertificateRecord`  |
| `CYCLE#<cycleId>`                           | `subjects/{subjectId}/cycles/{cycleId}`                       | `RecurrenceCycle`    |

Append-only kinds (attempts, evidence, signoffs, gates, certificates, cycles) are **never
overwritten** — corrections add a new document and supersede via status, matching
architecture §3.3. `AssessmentAttempt` document IDs embed the immutable attempt number so a
number can never be reused or decremented (property-test invariant, §24.2).

```
subjects (collection)
└── {subjectId} (document = LearningSubject profile)
    ├── roles/{roleAssignmentId}
    ├── plans/{planId}
    ├── assignments/{assignmentId}
    ├── attempts/{assignmentId}_{attemptNumber}
    ├── grades/{assignmentId}
    ├── evidence/{evidenceId}
    ├── signoffs/{signoffId}
    ├── gates/{gateId}_{evaluatedAt}
    ├── certificates/{certificateId}
    └── cycles/{cycleId}
```

### 2.2 Versioned-definition collections

§20 defined separate partitions (`REQUIREMENT#…`, `CERTIFICATE_DEF#…`, `GATE_DEF#…`) with
`SK = VERSION#<version>`. In Firestore these become **root collections keyed by definition
id, with a `versions` subcollection** so every published version is retained immutably (§2.2
exact version binding). `listPublishedRequirements()` on `LearningRecordStore` is a
collection-group query over `versions` filtered to `status == 'PUBLISHED'`.

| §20 partition                          | Firestore path                                  | Domain type              |
| -------------------------------------- | ----------------------------------------------- | ------------------------ |
| `REQUIREMENT#<id>` / `VERSION#<v>`     | `requirement-defs/{id}/versions/{version}`      | `RequirementDefinition`  |
| `CERTIFICATE_DEF#<id>` / `VERSION#<v>` | `certificate-defs/{id}/versions/{version}`      | `CertificateDefinition`  |
| `GATE_DEF#<id>` / `VERSION#<v>`        | `gate-defs/{id}/versions/{version}`             | `GateDefinition`         |

Recurrence-rule and grade-policy definitions follow the same `{id}/versions/{version}`
shape. A `VersionRef` (`{ id, version, sha256? }` in `types.ts`) resolves directly to one of
these document paths — a "pointer to current content" is explicitly not enough (§2.2).

### 2.3 Append-only events collection, sharded by subject + YYYYMM

§20.3 partitioned events by `SUBJECT#<subjectId>#<YYYYMM>` to avoid hot partitions.
Firestore has no hot-partition penalty for reads, but the **month shard is preserved** as a
document layer so per-subject/per-month event streams stay bounded and cheap to page, and so
retention/export runs per shard.

```
events (collection)
└── {subjectId}_{YYYYMM} (shard document)
    └── entries/{eventId}  (LearningActivityEvent, ordered by occurredAt)
```

- Document id inside `entries` is the event `id`; ordering field is `occurredAt` (mirrors
  §20.3 `SK = TS#<occurredAt>#EVENT#<eventId>`).
- Writes go through `LearningEventStore.append`; deduplication uses `idempotencyKey`
  (`LearningEventStore.seen`), satisfying §17 "consumers deduplicate on idempotencyKey".
- The event write and the domain-state write happen in **one Firestore transaction** (or a
  transaction + outbox doc), which is the GCP equivalent of the §17 transactional-outbox
  requirement.

---

## 3. Composite indexes replacing GSI1–GSI5

DynamoDB GSIs re-partition a table by an alternate key. In Firestore the equivalents are
**composite indexes** plus **collection-group queries** (a single query across every
`assignments`/`certificates`/etc. subcollection regardless of parent subject). The table
below maps each §20.2 / §20.3 GSI to its Firestore query.

| §20 GSI  | Purpose                        | Firestore realization                                                                                   |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| GSI1     | Supervisor / reviewer queue    | Collection-group index on `assignments`: `(supervisorSubjectId ASC, status ASC, dueAt ASC)`             |
| GSI2     | Due / overdue assignments      | Collection-group index on `assignments`: `(status ASC, dueAt ASC)` — filter `status in [READY,IN_PROGRESS,PENDING_*,OVERDUE]` |
| GSI3     | Certificate public ID lookup   | Root mirror collection `certificates-by-public-id/{publicId}` (single-doc get) **or** collection-group index on `certificates`: `(publicId ASC)` |
| GSI4     | Content revision → assignments | Collection-group index on `assignments`: `(pinnedContentRef.id ASC, pinnedContentRef.version ASC)`      |
| GSI5     | Cycle / status reporting       | Collection-group index on `cycles`: `(status ASC, dueAt ASC)` and on `assignments`: `(cycleId ASC, status ASC)` |
| Events GSI1 | Assignment event stream     | Collection-group index on `entries`: `(assignmentId ASC, occurredAt ASC)`                               |

### 3.1 Index notes

- **Supervisor queue (GSI1).** The reviewer's subject id lives on the assignment (denormalized
  from the role assignment's `supervisorSubjectId`) so the queue is one indexed
  collection-group query, scoped further by branch in application code per §16
  branch/location scope.
- **Certificate public ID (GSI3).** Public verification (`GET /api/public/certificates/:publicId`,
  §15.4) must be O(1) and must **not** scan learner partitions, so the recommended form is a
  dedicated `certificates-by-public-id` mirror document holding only the minimal public fields
  (§12.3 data minimization) — never employee id, scores, or evidence.
- **Content → assignments (GSI4).** Used when a content revision is superseded and every
  pinned assignment must be found (§9 `BLOCKED_CONTENT` / `SUPERSEDED`).
- **Cycle/status (GSI5).** Backs the supervisor "expiring annual requirements" and HR
  "current annual readiness" reports (§19.2, §19.3) and the overdue-cycle health metric
  (§23). Cycle documents are produced by the recurrence logic in
  `src/learning/domain/recurrence.ts` (`deriveCycleStatus`).

### 3.2 `firestore.indexes.json` sketch

```json
{
  "indexes": [
    { "collectionGroup": "assignments", "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "supervisorSubjectId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueAt", "order": "ASCENDING" } ] },
    { "collectionGroup": "assignments", "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueAt", "order": "ASCENDING" } ] },
    { "collectionGroup": "assignments", "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "pinnedContentRef.id", "order": "ASCENDING" },
        { "fieldPath": "pinnedContentRef.version", "order": "ASCENDING" } ] },
    { "collectionGroup": "cycles", "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "dueAt", "order": "ASCENDING" } ] },
    { "collectionGroup": "entries", "queryScope": "COLLECTION_GROUP",
      "fields": [
        { "fieldPath": "assignmentId", "order": "ASCENDING" },
        { "fieldPath": "occurredAt", "order": "ASCENDING" } ] }
  ]
}
```

---

## 4. Consistency, transactions, and immutability

- **Strong consistency.** Firestore document reads/queries are strongly consistent, so a
  `GateDecision` never reads a stale assignment; the state-vector hash (`stateVectorSha256`)
  still guards against evaluating over a moved target (§10.2).
- **Transactions.** Every accepted command writes domain state + event + outbox in one
  Firestore transaction (§17). Idempotency keys on both the command and the event prevent
  double-submit / double-issue (§12.5, §24.4).
- **Immutability at rest.** GCS bucket **object versioning + retention lock** replaces S3
  Object Lock for certificate PDFs, manifests, and validated evidence (§4.2, §12). Firestore
  append-only kinds enforce immutability at the application layer via security rules that
  deny update/delete on `attempts`, `gates`, `certificates`, and `entries`.
- **No PHI / no secrets** in any document or event payload (§3.8, §17, §23).
