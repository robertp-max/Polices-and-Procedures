# ADR-LEARNING-001 — Production storage decision

**Status:** Accepted (Wave 0)
**Date:** 2026-07-27
**Controlling spec:** `CARE_INDEED_LMS_BACKEND_ARCHITECTURE.md` §4, §20
**Supersedes AWS naming in the spec:** yes — see Decision.

## Context

The architecture document recommends an **AWS** physical stack (Cognito, DynamoDB,
S3, SQS, KMS, CloudWatch). The Care Indeed platform, however, actually runs on
**Google Cloud** (Cloud Run services, Firestore, existing authenticated identity),
and deploys via the project's Cloud Run pipeline. The spec also mandates
**provider-neutral domain interfaces** (§4 intro, §"Required branch safety") so the
physical provider is an implementation detail behind ports.

We must pick one Phase-1 system of record without contradicting the non-negotiable
domain principles (server authority, exact version binding, append-only history,
derived completion) in §3.

## Decision

1. **Domain layer is provider-neutral.** All persistence is expressed through
   repository/port interfaces (e.g. `LearningRecordStore`, `LearningEventStore`,
   `ArtifactStore`, `Signer`, `JobQueue`, `Clock`). No domain code imports a cloud SDK.

2. **Phase-1 production adapters target Google Cloud**, mapping the spec's AWS
   resources to their GCP equivalents:

   | Spec (AWS) | Phase-1 (GCP) | Purpose |
   |---|---|---|
   | DynamoDB `cihh-learning-records` | **Firestore** collection group `learning-records` | definitions, plans, assignments, attempts, grades, evidence metadata, signoffs, gates, certificates, cycles, read models |
   | DynamoDB `cihh-learning-events` | **Firestore** collection group `learning-events` (append-only) | domain/audit events |
   | S3 staging / artifacts | **Google Cloud Storage** buckets `cihh-learning-upload-staging-{env}`, `cihh-learning-artifacts-{env}` (versioning + retention lock) | uploads, certificate PDFs/manifests, transcripts |
   | SQS | **Cloud Tasks** (certificate/evidence/notification jobs) + **Pub/Sub** (projection fan-out) | async work |
   | KMS | **Cloud KMS** asymmetric signing keys | signed GateDecisions + certificate manifests |
   | Cognito | **existing Care Indeed authenticated identity** (the app's current auth) | authoritative subject |
   | CloudWatch | **Cloud Logging / Monitoring** | logs, metrics, alarms |

3. **Access patterns** from §20 are honored on Firestore using the documented
   PK/SK shape as `subjectId` document + typed subcollections
   (`roles/`, `plans/`, `assignments/`, `attempts/`, `grades/`, `evidence/`,
   `signoffs/`, `gates/`, `certificates/`, `cycles/`), and dedicated top-level
   collections for versioned definitions (`requirement-defs`, `certificate-defs`,
   `gate-defs`). Firestore composite indexes replace the DynamoDB GSIs
   (supervisor queue, due/overdue, certificate publicId, content→assignments, cycle/status).

4. **Transactional integrity:** Firestore transactions write the domain state
   change, the append-only event, and the outbox record atomically (ADR-LEARNING-002).

## Consequences

- No AWS account or credentials are required. This corrects the earlier mis-ask.
- Firestore's document/subcollection model fits the append-only, per-subject
  access pattern; hot-partition avoidance (§20.3) is handled by sharding the
  events collection by `subjectId + YYYYMM`.
- Firestore lacks S3 Object Lock; immutability of evidence/certificates is enforced
  by (a) GCS bucket **retention policy + object holds** for artifacts, and
  (b) application-level append-only invariants + never issuing a delete on
  attempt/grade/evidence/gate/certificate documents (enforced by the store adapter
  and property tests).
- A future move to a different provider only requires new adapter implementations;
  domain, gates, scoring, and certificate logic are untouched.

## Rejected alternatives

- **Adopt AWS as specified** — rejected: contradicts the platform's real GCP
  deployment and would require standing up a parallel cloud.
- **Keep browser/localStorage authority** — rejected by §3.1 (non-negotiable).
