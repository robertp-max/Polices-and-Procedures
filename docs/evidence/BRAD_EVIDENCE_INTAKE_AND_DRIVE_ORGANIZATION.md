# Brad Evidence Intake & Drive Organization

Production-grade evidence intake workflow inside **Evidence Center**. Brad parses
uploaded source exports, resolves each record's source-system created date,
classifies and deduplicates evidence, files canonical evidence to Google Drive
by created-date, runs a full-population review, and prepares draft forms,
agendas, tasks, and a packet for **human approval**.

> Product name: **Brad Evidence Intake** (intake) → **Evidence Packet Studio**
> (assembly/export). The legacy names *PDF Studio* / *Meeting Packet Generator*
> are not used.

---

## Feature route & UI placement

- Route: **`/evidence/intake`** (hashId `evidence-intake`, group `CES`, template `evidence`).
- Lives **inside Evidence Center**, as a CES workspace subnav tab — **not** a new
  top-level navigation item. It is reached via the existing **Compliance**
  primary nav item, alongside *Evidence Center* and *Evidence Packet Studio*.
- Subnav source of truth: `src/v6/components/CESSubnav.tsx` and
  `src/v6/routing/navigationManifest.ts` (`workspaceSubnavItems.ces`,
  `WORKSPACE_SUBNAV.ces`). The `ces` primary item's `hashIds` includes
  `evidence-intake` so Compliance highlights on `/evidence/intake`.
- Mounted by the screen dispatcher `src/v6/screens/RepresentativeScreens.tsx`
  (`case 'evidence-intake'`), screen component
  `src/v6/screens/evidence/BradEvidenceIntake.tsx`.

## Supported source formats

| Format | Support | Notes |
|---|---|---|
| JSON | Full (client) | Record-per-object; pointer `$.path[i]` |
| CSV / TSV | Full (client) | RFC-4180-ish; pointer `row:N` (header = row 1) |
| Markdown / MD | Full (client) | pointer `heading:H,item:N` |
| TXT | Full (client) | pointer `page:1` |
| DOCX | Server extraction (mammoth) | parseStatus `needs_extraction` client-side |
| XLS / XLSX | **Accepted, extraction-gated** | No approved spreadsheet parser yet; `needs_extraction`. Export to CSV for full parsing, or wire a server XLSX extractor. |
| PDF | **Accepted, extraction-gated** | No approved text-extractor/OCR; `needs_extraction`. Scanned PDFs are **never silently OCR'd**. |

MIME is validated by magic bytes where possible (not extension alone), filenames
are sanitized (path-traversal stripped), and a configurable size limit
(`DEFAULT_MAX_FILE_BYTES`, 32 MB) is enforced. Parsers live in
`src/policy/evidence/intake/fileParsing.ts`.

## Intake-batch model

`src/policy/evidence/intake/intakeModel.ts` — `EvidenceIntakeBatch`
(`batchId`, `uploadedBy/At`, `sourceSystemHint`, `intendedPeriod`, `status`
[`waiting_for_upload`…`completed`/`failed`], `sourceFileIds`, `recordCount`,
`parsedCount`, `failedCount`, `unresolvedCount`, and CES binding `eventId` /
`workflowId` / `swimlaneId` / `packetId`).

## Source-record lineage

`EvidenceSourceRecord` retains: `sourceFileId/Name`, **`sourcePointer`**
(row/sheet:row/`$.path`/page/heading), `sourceSystem`, `sourceRecordId`,
`sourceSystemCreatedAt`, `occurrenceAt`, `reportedAt`, `receivedAt`,
`uploadedAt`, `resolvedCreatedAt`, `createdDateSource`,
`createdDateConfidence`, `filingPeriodKey`, `filingQuarterKey`,
`classification` (+confidence+rationale), `contentHash`, `status`.

## Created-date precedence (the filing invariant)

`src/policy/evidence/intake/createdDateResolver.ts` — one pure resolver,
profile-driven (`sourceProfiles.ts`). Precedence:

1. `sourceSystemCreatedAt` (high)
2. Care Indeed canonical `createdAt` (high)
3. `recordCreatedAt` (high)
4. Salesforce `CreatedDate` (high)
5. WellSky configured record-created column (high)
6. configured aliases — *Created Date, Date Created, Record Created, Record
   Creation Date, Date Entered, Entered On* (medium)
7. `reportedToAgencyAt` (medium)
8. `receivedAt` (low)
9. intake upload timestamp — **final fallback, low confidence, profile-gated**
   (enabled only for `manual` source; matches existing
   `server/ia/brad/uploads.ts` ingest-time semantics)

**Occurrence / service / visit / assessment / OASIS / POC dates are NEVER used
to derive the filing month.** Ambiguous or invalid dates → confidence
`unresolved` → status `needs_date_review` (the resolver never guesses).

### Occurrence date vs filing date

> Abuse occurred in **January**; reported and created in the source system in
> **March**. Result: filing month = **March**, filing quarter = **Q1**;
> occurrence (January) is retained separately and does **not** create a January
> evidence record. The March monthly QAPI packet and the Q1 quarterly QAPI
> packet may include it.

Filing period is derived in the agency timezone (default
`America/Los_Angeles`) via `filingPeriod.ts` using `Intl.DateTimeFormat`
(timezone-correct, no extra dependency).

## Source profiles

`sourceProfiles.ts` defines per-system configuration: `salesforce`, `wellsky`,
`care_indeed`, `manual`, `unknown`. Each carries created-date aliases (ordered),
occurrence/reported/received alias sets, an agency timezone, and
`allowUploadTimestampFallback`.

## Deduplication & idempotency

`src/policy/evidence/intake/dedup.ts`. Identity precedence:
`sourceSystem+sourceRecordId` → `+sourceSystemCreatedAt` → file content hash +
pointer → canonical content hash. `buildIdempotencyKey()` = sha256 over the
stable tuple (pure sha256 in `hash.ts`, deterministic in browser + tsx).

- Re-uploading the same export → **duplicate** → reuse the canonical record.
- A changed record (same identity scope, different content hash) → **new
  version** (`recordVersion` ++, `supersedesEvidenceId` set) — history is never
  silently overwritten.
- Packet memberships and packet tasks use **deterministic ids**, so re-running
  generation never creates duplicates.

## Canonical evidence

Persisted through the existing `useRegulatoryExecutionStore().uploadEvidence()`
path (`artifactVersion: 'evidence-intake-v1'`), which carries `driveFileId`,
`driveUploadStatus`, `version`, `supersedesEvidenceId`, `checksum`, and an
append-only audit chain. The intake projection (`CanonicalEvidence`) adds filing
period, classification, source lineage, and packet linkage. **Canonical
evidence binds to a real CES event** (event-instance invariant) — the store's
evidence guard requires a real event + policy + workflow + task binding, and the
service fails closed (returns no id) rather than fabricating a record.

## Packet memberships (one record → many packets)

`packetMembership.ts`. One canonical record fans out to:

- the **monthly** QAPI rollup (keyed to `filingPeriodKey`),
- the **quarterly** QAPI rollup (keyed to `filingQuarterKey`),
- its **classification-specific** packet (e.g. complaint → complaint/grievance
  investigation packet).

Memberships are `suggested` until a human approves. Packet ids are deterministic
(`EPS-{packetTypeId}-{periodKey}`). Memberships preserve `canonicalEvidenceId` —
they are **not** new "original" records.

## Drive folder behavior (created-date filing)

Real server-side Drive integration (`server/googleDrive.ts`,
`server/googleEvidence.ts`, service-account `googleapis` client). Intake
canonical evidence is filed by the resolved **created-date** filing period,
extending the existing `01_CES/Evidence` tree:

```
01_CES/Evidence/Intake/{filingYear}/{filingMonthName}/{classification}/{eventId?}
```

`buildIntakeEvidenceFolderSegments()` returns `null` for an unresolved period —
the route then **refuses** to upload (never files to a generic root after a
folder-resolution failure, never derives the month from occurrence date).

Routes (`server/routes/calendar.ts`):
- `POST /api/calendar/intake/evidence/upload` — gated on `pingDrive()`
  reachability; returns a **real** `driveFileId`.
- `POST /api/calendar/intake/evidence/copy` — physical packet copy.
- `GET /api/calendar/evidence/health` — Drive reachability (used by the UI to
  honestly enable/disable Drive actions).

Client wrapper: `src/policy/services/calendarApi.ts`
(`intakeUploadEvidence`, `intakeCopyEvidence`, `evidenceHealth`). The browser
never holds Drive credentials.

## Drive copy behavior

`copyEvidenceToPacketFolder()` uses the Drive **copy API** (`drive.files.copy`),
files into `01_CES/Evidence/Packets/{year}/{packetId}/…`, and the membership
record retains `canonicalEvidenceId` + `copiedFromDriveFileId`. The canonical
original is never overwritten.

## Drive failure / retry

A Drive upload is "uploaded" **only** when the real service returns a real file
id. On failure the evidence record is kept, marked `driveUploadStatus: 'failed'`
with the error, **not** locked, and is retryable (retry reuses the same evidence
identity). No `DEMO_LOCAL` / fake-id / placeholder success exists. When Drive is
unreachable the UI disables the upload action with a truthful tooltip.

## Full-population review

`bradReview.ts` — default mode `full_population`; every readable record is
reviewed (no 20% sample unless the user explicitly requests one). The run
reports `totalRecords / reviewedRecords / failedRecords / skippedRecords` and a
`coverageStatement`; any parse/review failure yields status `partial` (never
"full review complete"). Findings carry source pointer, finding type, factual
basis, rule/policy/form reference, severity, confidence, a **draft-only** label,
and `requiresLicensedClinicianReview` where professional judgment is needed.
Review types: OASIS/assessment, plan-of-care, complaints/grievances,
incident/adverse-event, infection control, HR/training, plus a general router.

## Draft form generation

`createDraftFormInstance()` resolves **real form ids** (from the packet registry
`requiredFormIds`, themselves backed by `FORMS_DATASET`) via the store's
`generateFormInstance()`. No form ids are invented. Instances are drafts pending
human review; signatures are never applied by Brad.

## Meeting-agenda generation

`agenda.ts` — agendas are built from **reviewed findings**, never a list of
filenames. Sections are prioritized (KPI → complaints → incidents → abuse →
infection → OASIS → POC → med-rec → chart → PIP/CAPA → gaps → escalation).
Approved findings present as reviewed; draft findings are labeled
`draft_pending_review`; the user may flag items `review_during_meeting`;
low-confidence items are explicitly not presented as established fact. The
agenda links the source review run + evidence.

## Task & signer logic

`signing.ts` — deterministic task identities (re-runs never duplicate). Exactly
**one** packet-signing task per QAPI event.

### Dual-role DON / Administrator rule

When the DON and Administrator are the **same** authorized user:
`requiredSignerRoles = ["Director of Nursing", "Administrator"]`,
`requiredSignatureCount = 1`, `allowSingleUserToSatisfyMultipleRoles = true`,
and a **dual-capacity attestation** is recorded:

> "I am signing this packet in my capacity as both Director of Nursing and
> Administrator, and I attest that I reviewed and approved the packet within
> both assigned responsibilities."

For other events the actual signer-role configuration is used.

## Packet Studio integration

The intake screen opens **Evidence Packet Studio** (`/evidence/packet-studio`)
with the selected event preselected. Studio remains the single packet
generator/exporter (no second PDF generator); export and final Drive upload run
there after human review + signature.

## Monthly manual-export workflow

There is no claim of direct WellSky/Salesforce integration — exports are
uploaded manually. The reusable monthly flow: create batch → upload exports →
parse → resolve created dates → classify → dedupe → upload canonical to Drive →
update monthly + quarterly memberships → make full-population review available →
draft forms/agenda → review/approval/signature tasks → open in Packet Studio.
The source-acquisition step is labeled **"Manual export upload required."**

## Security / PHI constraints

- Authenticated server path; Drive credentials never client-side.
- Server-side MIME + size validation; filename sanitization; path-traversal
  prevention; PHI-name heuristic guard on Drive names.
- No raw PHI to console/logs; no PHI to unapproved external services.
- Content hashes preserved; canonical store keeps **metadata/pointers only**
  (no file bytes — enforced by `FORBIDDEN_PERSIST_FIELDS`).
- Brad cannot bypass human approval, apply signatures, or lock a packet.

## Current production limitations

- **XLSX/XLS and PDF extraction** are accepted + lineage-tracked but
  extraction-gated (`needs_extraction`) — no approved spreadsheet/PDF-text/OCR
  parser exists yet. Export to CSV/JSON for full record parsing, or wire a
  server extractor.
- The canonical store and audit chain persist to the regulatory execution store
  (localStorage in local/demo mode; DynamoDB metadata in deployed mode). Audit
  hashes are djb2 chains (tamper-evident, not cryptographic).
- Drive uploads are unmetered for retry/backoff at the upload call (Calendar
  writes already use `withRetry`); add `withRetry` around `uploadFile` for
  production hardening.

## Future WellSky integration boundary

A real connector may later replace manual upload, but until one exists the
source-acquisition step stays **"Manual export upload required."** No scheduler
claims to pull WellSky data automatically.
