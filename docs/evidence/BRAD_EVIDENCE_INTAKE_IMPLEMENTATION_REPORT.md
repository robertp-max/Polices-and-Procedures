# Brad Evidence Intake — Implementation Report

Production-hardening pass for the Brad Evidence Intake → Google Drive →
full-population review → Evidence Packet Studio workflow.

- **Branch:** `feature/global-time-of-day-themes` (worked in place; no branch switch).
- **Scope rule honored:** no top-level nav item added; auth/login untouched; CES
  calendar / swimlanes / Audit Mode / eCign / Packet Studio not regressed; the
  four time-of-day themes inherited via existing CSS-variable tokens.

---

## Canonical files inspected (Phase 1 reconnaissance)

- Routing/UI: `src/v6/routing/{routeRegistry,navigationManifest,router}.ts`,
  `src/v6/components/CESSubnav.tsx`, `src/v6/screens/RepresentativeScreens.tsx`,
  `src/v6/shell/{V6Shell,Sidebar}.tsx`.
- Evidence model + storage: `src/policy/evidence/{evidenceModel,storageMode,
  cesEvidenceHierarchy}.ts`, `storage/*`, `storageProviders/types.ts`
  (`GoogleDriveEvidenceRef`, locked Drive/DynamoDB architecture).
- Store: `src/policy/stores/regulatoryExecutionStore.ts` (`EvidenceDoc`,
  `uploadEvidence`, `attachDriveMetadata`, `supersedeEvidence`,
  `generateFormInstance`, `createTask`, `appendTaskAuditEvent`).
- Real Drive integration: `server/googleDrive.ts`, `server/googleEvidence.ts`,
  `server/routes/calendar.ts`, `server/env.ts`, `src/policy/services/calendarApi.ts`.
- Brad path: `server/routes/brad.ts`, `server/ia/brad/{bradActionService,uploads,
  eventPackets}.ts`, `server/ia/harness/BradRuntime.ts`.
- Packet Studio: `src/policy/evidence/packetStudio/*` (30-type registry,
  resolvers, UI).
- CES/forms/audit/tasks: `src/policy/ces/*`, `src/policy/data/formsLibraryDataset.ts`,
  `src/policy/compliance-execution/{eventTaskAdapter,cesFormInstanceId}.ts`,
  `src/policy/ces/signerTaskFactory.ts`, audit writer (`appendTaskAuditEvent`).
- Themes: `src/v6/theme/timeOfDayTheme.ts` + `src/index.css` (`[data-tod]`).
- Test convention: `scripts/checkEvidencePhase*.ts` (tsx + `node:assert` +
  `MemoryStorage` localStorage polyfill).

## Files added

Pure domain (`src/policy/evidence/intake/`):
`hash.ts`, `filingPeriod.ts`, `sourceProfiles.ts`, `intakeModel.ts`,
`createdDateResolver.ts`, `classification.ts`, `dedup.ts`, `fileParsing.ts`,
`recordExtraction.ts`, `packetMembership.ts`, `bradReview.ts`, `agenda.ts`,
`signing.ts`, `index.ts` (barrel), and the store/Drive orchestrator
`intakeService.ts`.

UI: `src/v6/screens/evidence/BradEvidenceIntake.tsx`.

Tests: `scripts/checkEvidenceIntakeDomain.ts`,
`scripts/checkEvidenceIntakeService.ts`, `scripts/checkEvidenceIntakeNav.ts`.

Docs: `docs/evidence/BRAD_EVIDENCE_INTAKE_AND_DRIVE_ORGANIZATION.md` + this report.

## Files changed (surgical)

- `server/googleDrive.ts` — added `copyFile()` (`drive.files.copy`); added an
  `eslint-disable` for the pre-existing `no-control-regex` in `sanitizeName`
  (behavior unchanged).  *(error was pre-existing in HEAD)*
- `server/googleEvidence.ts` — added created-date intake folder builder
  (`buildIntakeEvidenceFolderSegments`), `uploadIntakeEvidence`,
  `copyEvidenceToPacketFolder`.
- `server/routes/calendar.ts` — added `POST /intake/evidence/upload` and
  `POST /intake/evidence/copy`; removed a pre-existing unused import.
- `src/policy/services/calendarApi.ts` — `intakeUploadEvidence`,
  `intakeCopyEvidence` + types.
- `src/v6/routing/routeRegistry.ts` — `/evidence/intake` route.
- `src/v6/routing/navigationManifest.ts` — `evidence-intake` in `ces` hashIds +
  both CES subnav lists.
- `src/v6/components/CESSubnav.tsx` — Brad Evidence Intake subnav tab.
- `src/v6/screens/RepresentativeScreens.tsx` — import + `case 'evidence-intake'`
  + `cesHashIds` + `isRepresentativeRoute`.
- `package.json` — `check:evidence-intake`, `check:evidence-intake-service`,
  `check:evidence-intake-nav`, `test:evidence`.

## Models added / extended

- Added intake contracts (`EvidenceIntakeBatch`, `EvidenceSourceRecord`,
  `CanonicalEvidence`, `EvidencePacketMembership`, `EvidencePacketBinding`,
  classification taxonomy, intake audit-event names) — extend, not duplicate,
  the existing evidence model.
- Reused the store's `EvidenceDoc` (Drive fields, `version`,
  `supersedesEvidenceId`, audit chain) as the canonical persistence layer.
- Reused `GoogleDriveEvidenceRef` semantics + the real Drive client.

## Created-date precedence implemented

`sourceSystemCreatedAt` → CI `createdAt` → `recordCreatedAt` → Salesforce
`CreatedDate` → WellSky record-created column → generic aliases →
`reportedToAgencyAt` → `receivedAt` → intake upload timestamp (final, low,
profile-gated). Occurrence/service/visit/OASIS/POC dates are never used for
filing. Ambiguous/invalid → `needs_date_review`. Filing period derived in the
agency timezone (`America/Los_Angeles`).

## Dedup / idempotency

`buildIdempotencyKey()` = sha256 over `(sourceSystem, sourceRecordId,
sourceSystemCreatedAt, contentHash, sourcePointer)`; identity precedence in
`buildEvidenceIdentityScope()`. `decideDedup()` → `duplicate` (reuse) /
`new_version` (supersede) / `new`. Memberships + tasks use deterministic ids.

## Google Drive service actually used

The existing **real** server-side `googleapis` Drive v3 client
(`server/googleDrive.ts`, service-account auth via `env.credentialsPath`,
Shared-Drive aware). Intake files via `uploadIntakeEvidence` →
`ensureFolderPath` + `uploadFile`; copies via `copyFile`. Health via
`pingDrive()`.

## Truthful Drive failure behavior

`uploaded` requires a real `driveFileId`. On failure: record kept,
`driveUploadStatus: 'failed'`, error retained, retryable (same identity), not
locked. No `DEMO_LOCAL`/fake-id success. UI disables Drive actions with a
truthful tooltip when `evidence/health` reports unreachable; the server route
fails closed (503) when `pingDrive()` is unreachable.

## Canonical vs packet-membership behavior

One canonical evidence record per unique source item (idempotent). Additional
packet contexts are `EvidencePacketMembership` records (suggested → approved),
keyed by deterministic packet id, preserving `canonicalEvidenceId`.

## Physical-copy behavior

`copyEvidenceToPacketFolder` uses the Drive copy API into
`01_CES/Evidence/Packets/{year}/{packetId}/…`, recording
`copiedFromDriveFileId` + `canonicalEvidenceId`; the canonical original is never
overwritten.

## Brad full-population review + coverage accounting

Default `full_population`; deterministic rule engine
(`brad-review-rules-2026.06.25.1`). Reports `total/parsed/reviewed/failed/
skipped` + `coverageStatement`; `partial` when any record fails/skips; findings
are draft-only with source pointers and `requiresLicensedClinicianReview`.

## Draft forms / agenda / tasks / dual-role

- Draft forms from real form ids (`generateFormInstance`); never invented.
- Agenda from reviewed findings (prioritized, draft-labeled, low-confidence
  guarded, `review_during_meeting` supported).
- Deterministic packet tasks; exactly one signing task.
- **Dual-role DON/Administrator** → one dual-capacity signature
  (`requiredSignatureCount = 1`, dual-capacity attestation).

## Evidence Packet Studio integration

Intake opens `/evidence/packet-studio?eventId=…`; Studio stays the sole
generator/exporter. Export + final Drive upload remain disabled in the intake UI
with truthful tooltips (run in Studio after human review/signature).

## Packet families

- **Mapped (`ready`/`partial`)**: QAPI Quarterly (ready), Governing Body,
  Clinical Record Review, Infection Control, Patient Safety, Staff Training,
  HIPAA Training, OIG/SAM, Policy Annual Review, Physician Signature Tracking,
  Plan of Care Audit, Incident/Adverse Event, Infection Surveillance Monthly,
  Vulnerability Scan, Monthly Compliance, Claims/Billing, Competency, Audit
  Survey, Annual QAPI Evaluation.
- **`needs_mapping`**: CAG/PAC, Emergency Preparedness Drill, TB/Employee Health,
  Personnel File Audit, OASIS Accuracy Audit, Medication Reconciliation Audit,
  Complaint/Grievance Investigation, Compliance Validation Checklist, Wound/
  Clinical Protocol Update, Monthly Evidence Readiness, Custom Event Packet.
  These are visible in the registry/UI but never fabricated as ready.

Classification → packet routing is centralized in `packetMembership.ts`.

## Tests added & results

| Script | Checks | Result |
|---|---|---|
| `check:evidence-intake` (domain) | created-date precedence, tz boundary, dedup, membership monthly+quarterly, classification, full-population review, partial, pointers, draft-only, agenda, dual-role signing, deterministic tasks | **34 passed** |
| `check:evidence-intake-service` (store) | duplicate reuse (1 canonical), new version/supersede, Drive failure not uploaded/locked, retry reuses identity, provenance retained, real form-id draft, one signing task, deterministic rerun | **13 passed** |
| `check:evidence-intake-nav` | no new top-level nav item; intake is a CES subnav; route registered; siblings intact | **8 passed** |

`npm run test:evidence` runs all three. (The brief's `test:drive`/`test:packet`/
`test:brad` script names did not pre-exist; intake Drive/packet/review behavior
is covered by the three scripts above + the existing
`validate:google-drive-*` audit scripts.)

## Verification (Phase 8)

- **Feature TypeScript: clean.** `tsc -p tsconfig.app.json --noEmit` reports
  zero errors in any intake/UI/service/route/client file. (Whole-project errors:
  23, all in the 3 pre-existing theme-WIP files above.)
- **Feature lint: clean.** `eslint` on all added/changed files: zero
  errors/warnings.
- Domain + service + nav tests: **55/55 passing** (`npm run test:evidence`).
- `npm run verify:calendar-keys`: **PASS** (no CES calendar regression).
- **`npm run build` / `tsc -b` are blocked** at the build gate by the
  pre-existing/concurrent theme-WIP syntax errors in `Dock.tsx` /
  `BradWorkspace.tsx` / `ModulePlayerScreen.tsx` — not by this feature. Once
  those WIP files are completed/reverted, the build passes (the feature itself
  is type- and lint-clean).
- **Visual theme verification (Morning/Noon/Afternoon/Night):** not performed
  live — the dev bundle is blocked by the same pre-existing broken shell files
  (`RepresentativeScreens` statically imports them). Theme correctness is
  structurally guaranteed: `BradEvidenceIntake.tsx` uses **only**
  `[data-tod]`-driven CSS-variable token classes (`bg-surface`,
  `bg-surface-glass`, `border-hairline`, `text-ink`, tone tokens) with **no
  hardcoded colors**, so it inherits all four palettes (Night = the restrained
  `rgba(35,31,71,0.777)` glass) exactly as the existing Packet Studio does.

## Files deliberately NOT touched

Authentication/login, CES calendar/swimlane builders, Audit Mode, eCign signing,
Packet Studio internals, the time-of-day theme system, and the broken theme-WIP
files below.

## Pre-existing dirty-tree conditions (NOT introduced here)

The branch was already mid-edit on a global-time-of-day-theme migration. Two
files contain **pre-existing, half-finished, syntactically broken** edits
(confirmed vs HEAD; 148 / 171 lines changed) that fail `tsc -b` / `vite build` /
`eslint .` **independently of this work**:

- `src/v6/screens/brad/BradWorkspace.tsx` (broken JSX)
- `src/v6/screens/pageviews/ModulePlayerScreen.tsx` (broken JSX)
- `src/v6/shell/Dock.tsx` (untracked theme-WIP; `TS1128` syntax error at line 77)

These were left untouched (out of scope; completing another author's WIP risks
clobbering it). They were being edited concurrently during this session and none
import any intake module. The stale `check:evidence-phase2` script also fails
with `ENOENT` for `WorkflowExecutionPanel.tsx`, a file absent in both the
working tree and HEAD — a pre-existing broken script, not introduced here. The server `tsconfig` also has ~30 pre-existing type issues in
unrelated files; the server runs via `tsx` (not compiled in the build), so they
do not affect the build. Numerous other files (theme CSS, screens, deleted
`tmp-capture-*.mjs`) are unrelated dirty-tree changes.

## Remaining production risks / missing dependencies

1. **XLSX/XLS and PDF text extraction** — no approved parser/OCR exists; accepted
   + lineage-tracked but `needs_extraction` (fail-closed). Wire a server XLSX
   extractor + a sanctioned PDF text-extraction/OCR service to complete them.
2. **Build/lint are blocked at the repo level** by the two pre-existing broken
   theme-WIP files above. The feature itself is type- and lint-clean; the repo
   build will pass once those WIP files are completed/reverted by their author.
3. **Drive upload retry/backoff** — add `withRetry` around `uploadFile` for the
   intake path (Calendar writes already retry).
4. **WellSky/Salesforce** remain **manual export upload**; no automatic
   connector is claimed.
