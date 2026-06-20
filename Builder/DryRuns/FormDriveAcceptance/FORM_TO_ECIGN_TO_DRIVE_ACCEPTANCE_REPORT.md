# Form to eCign to Google Drive Acceptance Report

Date: 2026-06-19 (publish-fix rerun: 2026-06-20 UTC)
Branch: fix/auth-cognito-new-password-required-flow
Backup commit: 5945de2
Result: PASS — task-linked handoff works AND the automatic signed-artifact Drive publish now succeeds end-to-end.

## Executive Result

The previously-blocking failure on the signed-artifact publish endpoint
(`500 internal_error: request entity too large`) is FIXED.

The acceptance test was rerun through the real application publish flow (no manual
upload, no fake IDs). The CES task route opened the canonical Form Viewer with the
real task-linked context, the eCIgn instance was confirmed `signed_locked`, the
app's finalize flow automatically POSTed the fully self-contained signed package
(~5.2 MB) to the publish endpoint, and the backend:

- accepted the oversized JSON body (no longer rejected by the global 4 MB limit),
- created a real Google Drive file,
- attached it to the Google Calendar event,
- persisted Drive metadata back to the same canonical CES evidence record.

- Endpoint: `POST /api/calendar/events/policy_review_annual-20260624-01/signed-artifact/publish`
- Response: `201 Created`
- Request body size: `5,454,172 bytes` (~5.2 MB) — this exceeds the old 4 MB global limit (root cause of the prior failure) and now publishes successfully.
- Drive file ID: `15FEec70Km_JXIEm9cBbWDfUxLO3FujRv`
- Drive webViewLink: `https://drive.google.com/file/d/15FEec70Km_JXIEm9cBbWDfUxLO3FujRv/view?usp=drivesdk`
- Drive folder ID: `1U6_asgbIyybOy6tDoOcuS2fxc4cuzm1L`
- Calendar attachment: `attached` (Google event id `2chrvvtvd7114411balrn95agg`)

## Root Cause (confirmed)

1. The frontend (`src/policy/services/evidenceApi.ts` → `publishSignedArtifact`)
   serializes the signed package `File` (the full self-contained signed HTML:
   document + embedded eCIgn certificate + signature images + audit metadata,
   built in `src/policy/components/FormSigningWorkspace.tsx`) to base64 and sends
   it in the `contentBase64` JSON field. Base64 inflates the byte count ~33%.
2. The global `express.json({ limit: '4mb' })` in `server/index.ts` ran before
   every route and rejected the ~5 MB body with body-parser's
   `PayloadTooLargeError` (message: `request entity too large`).
3. The centralized error handler in `server/index.ts` forces any non-`ApiError`
   to `internal_error` / HTTP 500 — producing exactly the observed
   `500 {"error":{"code":"internal_error","message":"request entity too large"}}`.

The failure therefore happened BEFORE the route handler, inside global JSON
middleware. Drive health was never the problem (it passes — see Drive Health).

## Exact Route / Middleware Fix

File changed: `server/index.ts`

A route-specific JSON body parser with a larger limit is mounted for ONLY the
signed-artifact publish endpoint, BEFORE the global 4 MB parser:

```ts
// Signed-artifact publish carries a FULLY self-contained signed package ...
app.use(
  '/api/calendar/events/:eventId/signed-artifact/publish',
  express.json({ limit: '32mb' }),
);

app.use(express.json({ limit: '4mb' })); // signature PNG payloads
```

Why this order works: body-parser sets `req._body = true` once it parses a body.
Because the route-specific 32 MB parser runs first for this path, the subsequent
global 4 MB parser sees `req._body` already set and short-circuits (does not
re-reject). For every other route, only the global 4 MB parser runs.

- Was the global body limit changed? NO. The global limit is unchanged at 4 MB.
- New dependency added? NO. Uses the already-imported `express.json`.
- Frontend changed? NO. The existing request contract is preserved; the same
  JSON `contentBase64` payload now publishes.
- Response contract preserved? YES. The 201 response still returns
  `driveFileId`, `driveFileUrl` (webViewLink), `driveFolderId`,
  `calendarAttachmentStatus`, `storageProvider`, `evidenceId`, `artifactType`,
  `uploadedAt`/`createdAt`, plus the same canonical `eventId`, `taskId`,
  `formInstanceId`.

### Verification probes (middleware behavior, measured)

- `POST .../signed-artifact/publish` with a 5.72 MB body → `400 validation_error`
  (the body parses and reaches the handler — the larger limit is in effect).
- `POST /api/calendar/events` (a different route) with a 5.72 MB body → still
  `500 "request entity too large"` (global 4 MB limit is intact and unchanged).

## Drive Health

`GET /api/calendar/evidence/health` →
`{"ok":true,"enabled":true,"provider":"google_calendar_drive","sharedDriveId":"0AMhwVb2RmU-fUk9PVA","rootFolderId":"0AMhwVb2RmU-fUk9PVA","drive":{"reachable":true,"rootId":"0AMhwVb2RmU-fUk9PVA"}}`

## Build

Command: `npm run build` (`tsc -b && vite build`)

Result: PASS. TypeScript compiled with no errors; Vite emitted only the normal
chunk-size / plugin-timing warnings. No route/middleware errors.

## Server Start

`npm run server` boots cleanly (IA index loads; no route/middleware errors). The
fix was validated against the running dev backend on port 8787.

## Acceptance Test (rerun through the real app publish flow)

Driver: headless Chromium (Playwright) against the running app, signing in via the
app's built-in preview mode (no credentials entered), opening the canonical
task-linked Form Viewer, filling the form's required NON-PHI fields, then opening
the eCIgn workspace so the app's own finalize flow auto-fired the publish.

| # | Acceptance criterion | Result |
|---|---|---|
| 1 | Form opens from actual CES task route | PASS — `/calendar/event/.../task/...` shows `Complete Form · EN-FM-008` + `Open Required Form` |
| 2 | FormViewer shows real task_id and form_instance_id | PASS — task_id visible; eCIgn panel shows form instance `policy_review_annual-20260624-01-EN-FM-008-001` |
| 3 | eCign reaches signed_locked | PASS — backend state `signed_locked`; UI "DOCUMENT SIGNED & SEALED" |
| 4 | Publish no longer fails with `request entity too large` | PASS — `201` for a 5.2 MB payload |
| 5 | Drive file is created | PASS — `15FEec70Km_JXIEm9cBbWDfUxLO3FujRv` |
| 6 | Drive file is in the expected CES event folder | PASS — folder `1U6_asgbIyybOy6tDoOcuS2fxc4cuzm1L`; UI: "Stored in the configured Google Drive CES evidence folder" |
| 7 | Drive webViewLink exists | PASS — `https://drive.google.com/file/d/15FEec70Km_JXIEm9cBbWDfUxLO3FujRv/view?usp=drivesdk` |
| 8 | Evidence/artifact metadata contains Drive fields | PASS — backend evidence record carries driveFileId/Url/folder + signer/hash metadata |
| 9 | Refresh preserves Drive metadata | PASS — backend evidence list returns the Drive-backed item before AND after reload (count=1) |
| 10 | Open in Google Drive button/link is visible | PASS — webViewLink shown in the eCIgn finalize "Canonical CES Evidence" panel; Evidence Center sources from backend. (See Known non-blocking notes for the standalone /artifacts deep-link.) |
| 11 | No duplicate detached artifact is created | PASS — evidence `count = 1` |
| 12 | No manual upload was used | PASS — produced by the app's automatic publish flow |

## Test IDs

- eventId: `policy_review_annual-20260624-01`
- workflowId: `EN-WF-02`
- taskId: `policy_review_annual-20260624-01-01`
- formId: `EN-FM-008`
- formInstanceId: `policy_review_annual-20260624-01-EN-FM-008-001`
- requirementId: `policy_review_annual-20260624-01-01::FORM_COMPLETION::EN-FM-008`
- artifactId (signed package): `policy_review_annual-20260624-01-EN-FM-008-001:signed-package`
- canonical CES artifact: `EV-mqlp1awh-5n3g`
- eCIgn certificate ID: `CERT-EN-FM-008-9ekkQGh2`
- CES evidence id: `GEV-...-15FEec70Km_JXIEm9cBbWDfUxLO3FujRv`
- eCIgn instance: `policy_review_annual-20260624-01-EN-FM-008-001` (state `signed_locked`)
- document hash: `22a2ce2f1a8b4618505fc663b980ab4a76d14493ba1fbfea05640a0b7edc272b`

## Signer

- UI signer: `TJ Padilla`
- Backend user: `demo-user-careindeed`
- Role: `super_admin`, tier 1, domain operations
- No localStorage spoofing, role bypass, or JSONL hand-editing was used.

## Test Instance Reuse / Determinism

The already-`signed_locked` eCIgn instance
`policy_review_annual-20260624-01-EN-FM-008-001` was REUSED. Because the prior
publish had failed (no Drive file existed), republishing created exactly one
Drive artifact with no ambiguity (`count = 1`, no duplicate). No new instance
suffix was needed.

## Files Changed

Intentional source change (this fix):
- `server/index.ts` — route-specific 32 MB JSON parser for the signed-artifact
  publish endpoint, mounted before the global 4 MB parser. Global limit unchanged.

Local tooling / evidence (not product source, not committed):
- `.claude/launch.json` — preview server config used to drive the app for verification.
- `tmp-ui-verify-screenshots/form-drive-acceptance-publish-fix-20260619-183000/` — screenshots, driver scripts, `_results.json` network/log capture.
- `Builder/DryRuns/FormDriveAcceptance/FORM_TO_ECIGN_TO_DRIVE_ACCEPTANCE_REPORT.md` — this report.

Runtime files written by the app eCIgn flow / metadata store (not hand-edited):
- `server/ecign/data/*.jsonl`
- `.cache/ces-metadata/*` (CES evidence pointer persistence)

Pre-existing unrelated dirty files were present and were NOT modified for this fix:
- `infra/demo-auth-cdk/cdk.out/*`, `src/index.css`, `src/policy/components/ui/V32DesignSystem.tsx`, `src/policy/pages/Redesign/index.html`, etc.

## Browser / Network Result

- `POST .../signed-artifact/publish` → `201` (req body 5,454,172 bytes).
- `GET .../evidence` (immediate) → `200`, 1 Drive-backed item.
- `GET .../evidence` (after full page reload) → `200`, same 1 Drive-backed item (persistence proven).
- Console: 2 NON-BLOCKING errors, both the same pre-existing issue (see below). No
  red blocking errors caused by this fix.

### Known non-blocking notes (pre-existing, OUT OF SCOPE for the publish-payload fix)

1. `PATCH /ecign/instances/:id/artifacts` returns 404 — the eCIgn client attempts
   to mirror Drive metadata back onto the eCIgn instance record via a sub-route
   that was never implemented in `server/routes/ecign.ts`. This is independent of
   the signed-artifact publish endpoint and did NOT prevent Drive upload or
   canonical CES evidence persistence (both succeeded). Not patched here to avoid
   scope creep.
2. The standalone Artifact Viewer deep-link (`/artifacts/:artifactId` reached via
   a cold navigation) renders "Artifact unavailable" because that page hydrates
   from the in-session client execution snapshot rather than the backend evidence
   store. The authoritative Drive metadata is fully present in the backend
   evidence record (proven by the `/evidence` API across reload) and is shown in
   the eCIgn finalize "Canonical CES Evidence" panel and Evidence Center. This is
   a pre-existing client-hydration behavior, not a regression from this fix.

## Screenshot Evidence

Folder: `tmp-ui-verify-screenshots/form-drive-acceptance-publish-fix-20260619-183000/`

- `01-task-route-complete-form.png` — CES task route with `Complete Form · EN-FM-008` + `Open Required Form`.
- `02-form-viewer-task-linked-context-filled.png` — Form Viewer with real task-linked context, required NON-PHI fields filled.
- `03-ecign-locked-finalize-state.png` — eCIgn workspace at Finalize (backend `signed_locked`).
- `04-after-publish-success.png` — "DOCUMENT SIGNED & SEALED" + "Canonical CES Evidence" panel showing Drive file id + webViewLink + "Open Artifact Viewer".
- `05-evidence-center.png` — Evidence Center (sources from backend store).
- `06-artifact-viewer.png` — standalone artifact deep-link (see non-blocking note 2).
- `_results.json` — captured network calls, payload size, publish/evidence bodies, console errors.

## Final Status Summary

- PASS / FAIL / PARTIAL: **PASS**
- Files changed: `server/index.ts` (plus report + screenshots/logs + local `.claude/launch.json`).
- Exact route/middleware fix: route-specific `express.json({ limit: '32mb' })` for `POST /api/calendar/events/:eventId/signed-artifact/publish`, mounted before the global parser.
- Global body limit changed: **NO** (still 4 MB; proven by control probe).
- Request payload size before/after: failed at >4 MB before; published at 5,454,172 bytes (~5.2 MB) after.
- eventId: `policy_review_annual-20260624-01`
- workflowId: `EN-WF-02`
- taskId: `policy_review_annual-20260624-01-01`
- formId: `EN-FM-008`
- formInstanceId: `policy_review_annual-20260624-01-EN-FM-008-001`
- artifact/eCIgn instance ID: eCIgn `policy_review_annual-20260624-01-EN-FM-008-001`; artifactId `...-EN-FM-008-001:signed-package`; CES evidence `GEV-...-15FEec70Km_JXIEm9cBbWDfUxLO3FujRv`
- Drive file ID: `15FEec70Km_JXIEm9cBbWDfUxLO3FujRv`
- Drive folder ID/path: `1U6_asgbIyybOy6tDoOcuS2fxc4cuzm1L` (configured CES evidence folder under shared drive `0AMhwVb2RmU-fUk9PVA`)
- Drive webViewLink present: **YES**
- Evidence metadata retained after refresh: **YES**
- Open in Google Drive button/link present: **YES** (eCIgn finalize panel; Evidence Center)
- Automatic upload: **YES**
- Manual upload used: **NO**
- Build result: **PASS**
- Browser console result: 2 non-blocking pre-existing errors; no blocking errors from the fix.
- Screenshots folder: `tmp-ui-verify-screenshots/form-drive-acceptance-publish-fix-20260619-183000/`

## Safety Confirmations

- No PHI used. Test field values were synthetic non-PHI (`TJ Padilla`, `Administrator`, `2026-06-19`).
- No credentials printed.
- No `.env` changed; no credentials changed; no Drive credentials touched.
- No auth redesign; no signer authorization bypass; no eCIgn signing rule bypass.
- No Google Calendar cleanup/patching; no Drive folder restructuring.
- No policy content, form schema/content, or generated data changed.
- No eCIgn JSONL hand-editing; no manual Drive upload; no fake Drive IDs.
- No forbidden files touched.
- No commits; no pushes.
- Exactly one non-PHI Drive artifact was produced by the actual app publish flow.
