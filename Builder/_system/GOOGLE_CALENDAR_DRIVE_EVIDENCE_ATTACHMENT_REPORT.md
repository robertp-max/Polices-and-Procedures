# Google Calendar + Drive Evidence Attachment — Implementation Report

**Mode:** Add Google Drive event-evidence integration to the existing Google Calendar system.
**Repo:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
**Branch:** `checkpoint/full-app-vercel-deploy-2026-05-27`
**Architecture:** Calendar event = CES event shell + attachment index · Drive = file storage · App = task/form/evidence/signature/audit logic.

---

## 1. Files inspected

- `server/googleCalendar.ts` — existing Calendar service (auth + events CRUD).
- `server/env.ts` — server config loader.
- `server/routes/calendar.ts` — `/api/calendar/*` HTTP layer.
- `server/mappers.ts` — Calendar ⇄ app payload mappers + `extendedProperties` shape.
- `server/index.ts` — Express wiring, body parser, route mounts.
- `server/sync/eventStore.ts` — file-backed `event_id → google_event_id` store.
- `server/errors.ts`, `server/logger.ts` — error/log conventions.
- `.env.example` — existing Google Calendar env section.
- `src/policy/services/calendarApi.ts` — frontend Calendar client.
- `src/policy/evidence/storageMode.ts` — local-demo + future AWS storage seam.
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx` + `types.ts` — swimlane modal/workspace.
- `src/policy/pages/EvidenceCenterPage.tsx` — Evidence Center.

## 2. Files changed

**Created**
- `server/googleDrive.ts` — Drive client + folder/upload helpers (Shared-Drive aware).
- `server/googleEvidence.ts` — evidence orchestration + pure helpers (folder path, sanitize, PHI guard, ref builder, dedupe, validators).
- `src/policy/components/regulatory/GoogleEvidencePanel.tsx` — reusable upload/status panel (provider badge, Drive link, attach status).
- `src/policy/components/regulatory/GoogleEvidenceProviderCard.tsx` — Evidence Center provider/health card.
- `Builder/_system/audit-google-calendar-drive-evidence-sync.ts` — validator.
- `Builder/_system/GOOGLE_CALENDAR_DRIVE_EVIDENCE_ATTACHMENT_REPORT.md` — this report.

**Modified**
- `.env.example` — Drive evidence env section.
- `server/env.ts` — Drive evidence config fields.
- `server/googleCalendar.ts` — `attachDriveFileToEvent`, `getEventAttachmentCount`, `setEvidenceExtendedProperties`.
- `server/routes/calendar.ts` — `POST /events/:eventId/evidence/upload`, `GET /evidence/health`.
- `src/policy/services/calendarApi.ts` — evidence types + `uploadEvidence` + `evidenceHealth`.
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx` — `EvidenceArtifactWorkspace` wiring the panel into the evidence/artifact level-two workspace.
- `src/policy/pages/EvidenceCenterPage.tsx` — provider/health card in the sidebar.
- `package.json` — `validate:google-drive-evidence` script.

> `src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` was **not** touched.

## 3. Existing Calendar integration found

A complete **backend-mediated** Google Calendar integration already exists. The frontend never talks to Google directly; all traffic flows through `/api/calendar/*`. Events are matched strictly by `extendedProperties.private.event_id`, upserted idempotently through `server/sync/eventSync.ts`, and mapped in `server/mappers.ts`. A file-backed `eventStore` caches `event_id → google_event_id`.

## 4. Auth method detected

**Google service account** (`google.auth.GoogleAuth({ keyFile: env.credentialsPath, scopes })`). The key path comes from `GOOGLE_APPLICATION_CREDENTIALS` (default `./server/credentials/service-account.json`). Calendar scope: `calendar.events`.

**Drive reuses the same service-account key** — no second auth path, no OAuth, no `VITE_GOOGLE_CLIENT_ID`. The validator statically asserts `keyFile: env.credentialsPath` is reused and that no `OAuth2`/`getToken`/`VITE_GOOGLE_CLIENT_ID` appears in the Drive client.

> **Action required for live use:** the service account must be added to Shared Drive `0AMhwVb2RmU-fUk9PVA` as **Content manager** (or equivalent) so it can create folders and upload files.

## 5. Drive API integration added

`server/googleDrive.ts` adds a Drive v3 client beside the Calendar client:
- `findFolder`, `createFolder`, `findOrCreateFolder` (cached, idempotent — no duplicates).
- `ensureFolderPath(segments)` — walks/creates the event-derived path.
- `uploadFile({ parentId, name, mimeType, buffer })` — streams a Buffer to Drive.
- `pingDrive()` — Shared Drive reachability.
- Shared-Drive aware on every call: `supportsAllDrives: true`, `includeItemsFromAllDrives: true`, `corpora: 'drive'`, `driveId`.

**Scopes (narrowest-first):** `drive.file` + `drive.metadata.readonly`. If Shared-Drive folder find/create fails with insufficient scope under a strict service-account configuration, broaden to `https://www.googleapis.com/auth/drive` (single-line change to `SCOPES`). This is documented in the file header.

## 6. Env names added/used

```env
GOOGLE_EVIDENCE_STORAGE_PROVIDER=google_calendar_drive
GOOGLE_CALENDAR_EVIDENCE_ENABLED=true
GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID=0AMhwVb2RmU-fUk9PVA
GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID=0AMhwVb2RmU-fUk9PVA
```

Exposed on `env` as `evidenceStorageProvider`, `calendarEvidenceEnabled`, `driveEvidenceSharedDriveId`, `driveEvidenceRootFolderId`. Existing local-auth keys (`VITE_AUTH_API_BASE_URL`, `VITE_LOCAL_DEMO_AUTH_BYPASS`) and `GOOGLE_CALENDAR_ID` / `GOOGLE_APPLICATION_CREDENTIALS` are preserved unchanged.

## 7. Shared Drive / root ID used

`0AMhwVb2RmU-fUk9PVA` for both the Shared Drive ID and the evidence root folder ID (per current CES evidence configuration). `driveEvidenceRootFolderId` falls back to the Shared Drive ID when unset.

## 8. Event-driven folder creation behavior

Folders are auto-created from event metadata — users never create year/quarter/event folders manually. Path (`buildEvidenceFolderSegments`):

```
{year}/{quarter}/{domain}/{eventId}/{category}/[{taskId}/{formId}/{formInstanceId}/{evidenceRequirementId|supportTaskId}]
```

- year/quarter derived from event date; domain from event domain; the rest from system IDs.
- categories: `00-event-overview`, `01-form-instances`, `02-supporting-documentation`, `03-signed-artifacts`, `04-ecign-certificates`, `05-final-evidence-package`.
- every segment is sanitized (`sanitizeName`) — unsafe filesystem characters stripped; never PHI/patient names.
- folder IDs cached; `findOrCreateFolder` never creates duplicates.

## 9. Calendar attachment behavior

`attachDriveFileToEvent(eventId, attachment)`:
- resolves the existing `google_event_id`, reads current `attachments`, and **dedupes** by `fileId`/`fileUrl`.
- patches with `supportsAttachments: true`, preserving existing attachments.
- honors a `MAX_CALENDAR_ATTACHMENTS = 25` ceiling → returns `pending_attach` and defers to the Drive folder/manifest rather than piling on low-level files.
- non-throwing: returns `attach_failed` so the Drive upload is still recorded honestly.
- statuses: `attached` | `pending_attach` | `attach_failed` | `removed`.

## 10. eventId / workflowId / taskId / formId / formInstanceId mapping

`GoogleCalendarDriveEvidenceRef` (server + mirrored in `calendarApi.ts`) carries: `eventId`, `workflowId?`, `taskId`, `formId?`, `formInstanceId?`, `evidenceRequirementId?`, `supportTaskId?`, `calendarEventId`, `driveFileId`, `driveFileUrl`, `driveFolderId?`, `mimeType?`, `title`, `uploadedAt`, `uploadedBy?`, `attachmentStatus`, `contentStatus`. `buildEvidenceId(...)` produces a deterministic `GEV-...` id for dedupe. The upload response returns the full mapping plus `evidenceId`.

## 11. Supporting documentation behavior

The swimlane evidence workspace builds an upload target per `node.supportingDocumentationTasks` (carrying `supportTaskId`, `evidenceRequirementId`, `formId`, `formInstanceId`) and per form instance. Status reflects the **actual** upload/attach result — nothing is marked complete on failure. No targets are created from the panel; required evidence comes from the event task model. Signature-only forms do not get fabricated supporting-doc targets.

## 12. eCIgn signed artifact / certificate behavior

The artifact level-two workspace exposes upload targets for `03-signed-artifacts` (signed form PDF), `04-ecign-certificates` (eCIgn certificate PDF), and `05-final-evidence-package`. These upload to the event's Drive folder and attach to the Calendar event with full ID mapping. No fake artifacts are generated and metadata-only items are labeled honestly (`contentStatus`), never attached as if they were PDFs.

## 13. Evidence Center behavior

`GoogleEvidenceProviderCard` is added to the Evidence Center sidebar (scoped, non-invasive — the page's protected fetch/identity logic is untouched). It shows the provider badge, live `evidence/health` reachability, the configured provider, and an **Open Drive evidence root** link. Per-event Google-backed evidence rows render in the swimlane/task workspace where the upload occurs; a full server-side ref listing in the Evidence Center file ledger is noted as a follow-up (see §18).

## 14. Security assumptions and non-PHI demo warning

The account/demo is confirmed PHI-free; safe defaults are still enforced:
- **No public sharing** — no `permissions.create`, no `anyone` grant (validator-enforced).
- **No PHI in Calendar `extendedProperties`** — `setEvidenceExtendedProperties` writes only an allowlist (`event_id`, `workflowId`, `evidencePackageId`, route hints, `eventStatus`, `auditReadyPct`, `lastEvidenceSyncAt`, `evidenceDriveFolderId`, `evidenceAttachmentCount`). `extendedPropertiesHavePhi` flags PHI-like keys/values.
- **No PHI in Drive filenames/folders** — names derive from IDs; `looksLikePhiName` rejects SSN/MRN/DOB/"patient name" patterns at the upload boundary.
- Drive stores files; Calendar indexes/attaches; the app keeps evidence/task/signature logic. No form answers, audit trails, certificate text, or signed-PDF bytes are placed in Calendar metadata.

## 15. Validator result

`npm run validate:google-drive-evidence` → **PASS**. Covers all 12 checks: required IDs (event/calendar/drive/task), form binding, supporting-doc binding, deterministic + de-duplicated ids, no public sharing, no PHI in extendedProperties, no PHI in filenames/folders, honest attachment/content status, and the QA-WF-03 empty-diff guard. Also cross-checks that Drive reuses the service-account key and introduces no second auth path.

## 16. Build result

`npm run build` → **PASS** (`tsc -b && vite build`, 2239 modules). Companion validators also pass: `validate:event-dataflow`, `verify:task-identity`, `check:ecign-routes`.

## 17. QA-WF-03 diff result

`git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` → **empty**. The file was never modified.

## 18. Remaining limitations / follow-ups

- **Live Drive calls untested in CI** (no service-account key / network in this environment). Logic is exercised through pure helpers + static source checks; a live smoke test requires the service account added to the Shared Drive.
- **Scope**: ships with `drive.file` + `drive.metadata.readonly`. Strict service-account setups may need `https://www.googleapis.com/auth/drive` for Shared-Drive folder listing/creation — one-line change, documented in `googleDrive.ts`.
- **Upload transport**: files are sent as base64 over the existing `express.json({ limit: '4mb' })` body parser (no new dependency). Large files (>~3 MB pre-base64) would need a raised limit or a streaming multipart handler.
- **Evidence ref persistence**: refs are returned to the caller and surfaced in-session in the workspace. A server-side evidence-ref store + `GET /api/calendar/events/:eventId/evidence` list endpoint would let the Evidence Center file ledger render Google-backed rows directly; deferred as a scoped follow-up.
- **AWS target preserved**: `storageMode.ts` (`local-demo` / `aws-staging`) is untouched; the Drive provider sits beside it.
- No commit, no deploy were performed.
```
