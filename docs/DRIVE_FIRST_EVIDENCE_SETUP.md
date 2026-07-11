# Drive-First Evidence Architecture — Setup & Operations Guide

> **North star:** Google Drive stores canonical evidence artifacts. Firestore stores
> evidence metadata and all normal operational state. Non-evidence records remain
> metadata only. Google Cloud Storage, when used, is temporary processing
> infrastructure and not a second evidence system of record.

This guide accompanies [`GC+Architecture.html`](../GC+Architecture.html) (the corrected
architecture baseline) and the contract/adapter slice in
[`src/policy/evidence/driveFirst/`](../src/policy/evidence/driveFirst/).

---

## 1. What exists today (code-verified)

| Concern | Where | Status |
|---|---|---|
| Live Google Drive adapter | `server/googleDrive.ts` | **Working.** Service-account auth, Shared-Drive aware, find-or-create folders, upload / upload-or-replace / copy / download / tree listing. |
| Evidence orchestration | `server/googleEvidence.ts` | **Working.** Non-PHI folder segments, PHI-name tripwire, Calendar attachment indexing, packet publishing + CSV manifest upsert, 01_CES write lock. |
| Drive identity lock | `server/env.ts` (`DRIVE_EVIDENCE_LOCK`, `assertDriveEvidenceLock`) | **Working.** Boot fails closed when the service account / project / Shared Drive drift from the locked values. |
| Pointer-only metadata contract | `src/policy/evidence/storageProviders/types.ts` | **Locked.** Drive = files, backend metadata = pointers, localStorage prohibited for CES. |
| eCign write-once artifacts | `src/policy/ecign/pathB/` | **Working contracts + tests.** `putOnce` (no overwrite), byte freeze, server-side SHA-256, journaled store, Drive sandbox publisher. |
| Drive-first hardening contracts | `src/policy/evidence/driveFirst/` | **New (this change).** Idempotent finalization, review/supersede, integrity checker, link resolver, packet flow, audit ledger — with deterministic mocks + tests. |

The Phase 2F work is a **thin adapter/hardening layer over these existing pieces** —
not a rebuild, not a parallel evidence store.

## 2. Prerequisites (target platform)

### Firebase project (per environment: dev / staging / prod)
- **Firebase Auth** enabled with the approved sign-in providers; custom claims for coarse roles (`admin`, `hr`, `supervisor`, `learner`).
- **Cloud Firestore** with baseline indexes (see §6 of the architecture HTML).
- **Cloud Functions v2** (TypeScript) — the only writer of compliance-affecting state.
- **App Check** enforced for the web app and callable functions (`APP_CHECK_ENFORCEMENT`).
- **Security Rules** — default-deny writes; Storage rules cover *temporary paths only* (§17 of the HTML).
- **Secret Manager** — holds the Drive service credentials (`GOOGLE_DRIVE_CREDENTIALS_SECRET`). **Never** commit a service-account key file to the repository; never expose credentials to the browser or Vite variables.

### Google Workspace / Drive
- An approved **Workspace Shared Drive** per environment. Evidence files are owned by the Shared Drive, not an individual's My Drive.
- A dedicated **service account** granted *Content manager* on the Shared Drive. The verified existing model (`careindeed-drive-evidence@…`) uses a key file locally; the Functions runtime should read it from Secret Manager instead. Domain-wide delegation is **not** required for the evidence write path and should not be enabled without a separate review.
- **Google Drive API** enabled in the GCP project.
- **No public / “anyone with the link” sharing** for evidence — ever. Browser users open evidence through their own Workspace permissions on the Shared Drive. If a legitimate app user cannot access the Shared Drive, that is a launch blocker to resolve with IT, not a reason to widen sharing.

### Temporary Cloud Storage
- One staging bucket per environment (`TEMP_UPLOAD_BUCKET`).
- Object lifecycle rule: delete objects older than 24–72 h (backstop; successful flows delete their objects at finalization).
- Approved prefixes only: `temporary-uploads/{uid}/{uploadSessionId}/…`, `quarantine/…`, `generated-pending/…`, `packet-build/{exportId}/…`.
- **There is no permanent evidence bucket.** Do not create `cihh-prod-evidence-*` or equivalents.

## 3. Environment variables

Server-side only; validated at startup (fail clearly when Drive configuration is absent — never silently fall back to another store).

```
FIREBASE_PROJECT_ID
GOOGLE_DRIVE_SHARED_DRIVE_ID
GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID
GOOGLE_DRIVE_SIGNED_FORMS_FOLDER_ID
GOOGLE_DRIVE_EXPORTS_FOLDER_ID
GOOGLE_WORKSPACE_DELEGATED_USER        # only if a delegation model is ever approved
GOOGLE_DRIVE_CREDENTIALS_SECRET        # Secret Manager reference
TEMP_UPLOAD_BUCKET
APP_CHECK_ENFORCEMENT
DRIVE_INTEGRITY_CHECK_SCHEDULE         # cron for the scheduled integrity sweep
```

Existing repo variables that remain in force during the transition:
`GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID`,
`GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID`, `GOOGLE_CALENDAR_EVIDENCE_ENABLED`,
`DRIVE_01_CES_READINESS_DATE` (01_CES stays locked until a readiness date is set).

Do not hardcode folder IDs. The one hardcoded packet folder id in
`server/googleEvidence.ts` (`DEFENSIBLE_PACKET_FOLDER_ID`) should migrate to an env
variable during Phase 2F.

## 4. Local development and mocks

- The deterministic adapters in `src/policy/evidence/driveFirst/`
  (`InMemoryDriveEvidenceRepository`, `InMemoryTempObjectStore`,
  `InMemoryEvidenceMetadataStore`, `InMemoryAuditLedger`) exercise the full
  finalize → review → supersede → integrity → packet pipeline with **no network and no
  cloud resources**. Use them in unit tests and emulator runs.
- Firebase Emulator Suite covers auth/firestore/functions/storage; Drive is exercised
  via the mock adapter locally.
- Run the targeted suite: `npx vitest run src/policy/evidence/driveFirst`.
- Mock or de-identified data only. No PHI in fixtures, filenames, paths, logs, or
  screenshots.

## 5. Key invariants the implementation enforces

1. **Idempotent finalization** — every finalization carries a stable `commandId`; a
   retry never creates a second Drive file (session state + Drive `appProperties`
   reconciliation).
2. **Partial-failure recovery** — Drive file created → metadata write fails → the
   session enters `reconciliation_required`, the failure is audited, and a retry with
   the same `commandId` reconciles the existing file.
3. **Accepted evidence is read-only** — in-place changes to the artifact identity
   (driveFileId, sha256, fileName, signer fields) are refused; corrections create a
   new version with `supersedesEvidenceId` and preserve the prior record.
4. **Honest links** — evidence links resolve the canonical Drive reference and open in
   a new tab (`target="_blank" rel="noopener noreferrer"`); trashed / missing /
   access-denied files surface a visible integrity error, never a “valid” link.
5. **Metadata-only domains** — assignments, attempts, tasks, approvals, audit events,
   export jobs, upload sessions, preferences: none of these ever create a Drive file.
6. **Temp hygiene** — successful flows delete their temporary objects; packet builds
   assemble in `packet-build/{exportId}/…` and clean up after Drive publication.
7. **Audit safety** — append-only, hash-chained, server-written only; PHI-like values
   and forbidden keys are rejected at append time.

## 6. Staging validation plan (before any production use)

1. Deploy Functions + rules to staging; verify environment validation fails when a
   Drive variable is removed.
2. Live Drive smoke test with **de-identified data**: upload → finalize → verify one
   file + one record; retry the same `commandId` → no duplicate.
3. Verify the browser user can open the returned `webViewLink` under their own
   Workspace identity (new tab, no public sharing).
4. Trash the staging file in Drive → confirm the integrity checker reports `trashed`
   and the UI shows an integrity error.
5. Run the scheduled integrity sweep and the orphan scan (both directions).
6. Generate a survey packet: confirm fail-closed behavior when a file is trashed, and
   confirm the final packet lands in Drive with a Firestore index record and zero
   remaining `packet-build/` objects.
7. eCign: execute a test signature flow; confirm the executed package is a Drive
   evidence artifact and a correction creates a superseding version.

## 7. Production approval gates

- Approved Google Workspace/Drive environment; contractual/legal posture (incl. BAA)
  verified for PHI before any real data.
- Access-control model reviewed (Shared Drive membership, service-account scope).
- Retention requirements mapped to `retentionClass` / `legalHold` metadata; if true
  WORM retention is legally required, that is a **separate archival decision** — do
  not reintroduce a permanent GCS evidence copy to fake immutability.
- Security review + incident-response and backup/recovery expectations documented.

## 8. Operations

- **Integrity monitoring:** `DRIVE_INTEGRITY_CHECK_SCHEDULE` drives the sweep; states
  are `current | pending | missing | trashed | access_denied | moved |
  revision_changed | hash_mismatch | orphaned_firestore_record | orphaned_drive_file |
  repair_required`.
- **Reconciliation / repair:** dry-run first; repairs require an authorized admin and
  an explicit reason; every repair/relink is audited. Destructive repair requires
  explicit authorization.
- **Rollback:** the adapter layer sits behind the existing evidence interfaces —
  rolling back means routing back to the current Express + Drive path (which stays
  intact during migration). Never roll back by deleting Drive files.
- **Incident handling:** integrity failures are visible, exports fail closed, and the
  audit ledger plus upload-session states provide the reconstruction trail. Logs are
  non-PHI by construction.
- **Manual permission checks:** quarterly review of Shared Drive membership and the
  service account's role; permission changes are audited.

## 9. Explicitly out of scope / prohibited

- No permanent GCS evidence bucket; no GCS Bucket Lock evidence retention.
- No public Drive sharing; no service-account key files in the repo.
- No irreversible retention/deletion/access policies applied as part of setup.
- No PHI in development/testing; no PHI to Nolan/Brad/LLMs/analytics without an
  explicitly approved PHI architecture.
- No parallel Evidence Center, workflow engine, LMS, or second Zustand evidence
  source of truth.

---

**Verification status (2026-07-10):** the contract slice is fully covered by
deterministic tests (`src/policy/evidence/driveFirst/driveFirst.test.ts`, 26 passing).
**Live Drive integration was not re-verified in this change** — no cloud writes were
performed; the live adapter (`server/googleDrive.ts`) is unchanged and remains the
production path.
