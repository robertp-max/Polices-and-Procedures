# ADR-0001 — Target Architecture: Cognito + Cloud Run/Express + Firestore + Drive

- **Status:** ACCEPTED (locked 2026-07-12)
- **Applies to branch:** `User_Access_and_Cloud_Architecture`
- **Supersedes:** the Firebase-Auth/Cloud-Functions north star described in `GC+Architecture.html` §3–§5 (that document is now an aspirational baseline, not the binding runtime target).

## Decision

The binding target architecture is:

```
Identity provider:              AWS Cognito (COG-1 login + COG-2 server-authoritative access)
Runtime / command authority:    Cloud Run + Express (single requireApiAuth boundary)
Canonical operational metadata:  Firestore (server-only via Firebase Admin SDK)
Durable audit ledger:            Firestore (append-only, hash-chained)
Canonical evidence files:        Google Drive (Shared Drive; keyless impersonation target)
Temporary processing objects:    lifecycle-cleaned GCS only (never a system of record)
```

This preserves the working identity/access implementation and the working Google Drive
evidence client while consolidating the **data plane** (operational metadata + audit +
temporary processing + evidence) on Google Cloud. It rejects both a split AWS/GCP data
plane (Option 2) and a full GCP-native rebuild that discards Cognito/Express (Option 3).

## Context

Verified current state on this branch (`452b3a7f`):

- **Identity/access — implemented, not deployed.** Cognito auth + lifecycle, DynamoDB-backed
  registration/setup-token, SES email, one centralized `requireApiAuth` boundary, a
  route-access matrix over all business routers, and role gates on admin/audit routes.
  Tests green (server auth 45, app auth 35, packet 102). **No dev deployment; live user
  lifecycle unproven.**
- **Runtime.** React/Vite → Express API → Cognito/DynamoDB/SES → Google Drive → Cloud Run.
  No Firebase Admin, Firestore, App Check, or GCS SDK in root dependencies today.
- **Google Drive — code-integrated.** `googleDrive.ts` → `planDriveAuth()` →
  `createDriveAuthClient()` (ADC impersonation *or* local key file). Keyless IAM not
  applied; live keyless access unproven; local dev still uses a JSON key file.
- **Corrected overstatements (do not repeat):**
  - Drive finalization is **not** immutable — `uploadOrReplaceFile` replaces bytes in place
    on filename match. Acceptable for drafts; wrong for signed/canonical artifacts.
  - The hardened `driveFirst` finalize/integrity/reconciliation workflow is **contracts +
    in-memory mocks + tests only** — not the live upload path.
  - The audit ledger format is strong (append-only, per-stream hash chain, canonical
    hashing, idempotency, PHI guard) but persists to container-local
    `server/audit/data/audit_events.jsonl` → **not durable and not multi-instance safe on
    Cloud Run.**
  - `requireApiAuth` re-introduced a localhost demo-actor fallback (`demo-user-careindeed`
    on localhost, disabled only by `NODE_ENV==='production'`). Must become **explicit
    opt-in**, not config-absence-triggered.

## Guardrails (binding)

1. **Do not migrate Cognito.** Identity stays on Cognito.
2. **Do not perform a broad datastore rewrite.** Migrate one domain at a time behind
   repository interfaces with dual-read/dual-write + backfill + reconciliation.
3. **Firestore is server-only** through the Admin SDK. **No** direct browser→Firestore
   access, **no** Security Rules, and **no** App Check unless a real client-to-Firestore
   use case is separately approved.
4. **DynamoDB stays** for the existing Cognito registration/setup-token store until ALL of
   the carve-out conditions below are met. No DynamoDB decommissioning without approval.
5. **No deployment, IAM changes, data deletion, or decommissioning** without separate
   explicit approval.

## DynamoDB carve-out (exit conditions before any decommission)

DynamoDB may be retired for the user/registration domain only after:

1. `UserRepository` is abstracted (interface + adapter);
2. Firestore dual-write is implemented for that domain;
3. existing records are backfilled;
4. reconciliation reports show zero mismatches;
5. the live non-PHI login lifecycle passes on a deployed environment;
6. rollback is proven.

## Migration sequence

Ordered; each step gated on the prior. No step assumes deployment unless it says so.

- **P0-a — Demo-fallback hardening.** Make the `requireApiAuth` localhost demo actor an
  explicit opt-in env flag (e.g. `AUTH_ALLOW_LOCAL_DEMO=1`), never enabled by missing
  Cognito config. Tests for prod-off + opt-in-on. (Small; independent of Firestore.)
- **P0-b — Prove one deployed vertical slice (approval-gated).** Deploy to dev Cloud Run
  and prove with non-PHI data: invite → setup → login → refresh → protected API request →
  role denial → logout → reset → suspend → suspended-token denial → keyless Drive artifact
  creation → audit record persistence.
- **P1-a — Durable Firestore `AuditEventStore` (FIRST implementation domain).** Replace
  container-local JSONL with a Firestore-backed, concurrency-safe audit repository:
  `AuditEventStore` interface, Firestore transaction implementation, per-stream sequence
  allocation, hash-chain validation, idempotency index, retention metadata, export +
  verification. Keep the existing event model + hash chain; swap only persistence.
- **P1-b — Operational-metadata repository interfaces.** Introduce, without rewriting
  features: `UserRepository`, `EventRepository`, `WorkflowRepository`, `EvidenceRepository`,
  `PacketRepository`, `AuditRepository`, `UploadSessionRepository`. Migrate one domain at a
  time (dual-read/dual-write + reconciliation reports).
- **P1-c — Live temporary-GCS pipeline.** Resumable upload sessions → temporary GCS →
  content-type/size validation → malware/DLP integration point → SHA-256 → quarantine →
  finalization idempotency → retry-safe Drive publication → lifecycle deletion →
  abandoned-upload cleanup.
- **P1-d — Immutable evidence finalization.** Separate lifecycle: DRAFT (may replace) →
  FINAL (new immutable Drive file) → SIGNED/LOCKED (immutable; superseded only by a new
  version; prior retained). Signed/canonical artifacts never use update-in-place.
- **P1-e — Activate keyless Drive (approval-gated).** IAM Credentials API + token-creator
  binding scoped to the approved target SA; Cloud Run runtime identity;
  `GOOGLE_DRIVE_AUTH_MODE=impersonation`; remove production JSON-key config; verify Shared
  Drive role/folder access; fail-closed startup validation.
- **P2 — Remaining controls (after durable storage exists).** Scheduled integrity +
  reconciliation jobs; upload-session cleanup; monitoring/alerting; structured traces +
  correlation IDs; backup/recovery testing; Security Rules / App Check *only if* direct
  client-to-Firebase access is approved; Workspace-group-based Drive access; review/approve
  or remove the external Gmail Drive reader; server TypeScript debt cleanup; CI gate for the
  standalone server tsconfig project.

## Consequences

- **Positive:** one cloud data plane (GCP) for metadata/audit/evidence/processing; working
  identity and Drive code preserved; audit becomes durable and multi-instance safe;
  migration is incremental and reversible per domain.
- **Cost/risk:** a transitional period where DynamoDB (registration) and Firestore
  (metadata/audit) coexist — bounded by the carve-out conditions and dual-write
  reconciliation; new Firebase Admin SDK dependency; requires GCP project + Firestore
  provisioning and (later, approval-gated) IAM + Cloud Run changes.

## Required approvals still outstanding

- Dev Cloud Run deployment of the current code (P0-b).
- GCP Firestore provisioning for dev (P1-a).
- Keyless Drive IAM binding + Cloud Run env change (P1-e).
- Any DynamoDB decommission (post carve-out).
