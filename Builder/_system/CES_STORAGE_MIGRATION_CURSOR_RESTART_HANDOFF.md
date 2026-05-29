# CES Storage Migration — Cursor Restart Handoff

**Status:** PAUSED — awaiting user Cursor restart to complete AWS login. Do **not** resume deploy work until the user returns.
**Repo:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
**Branch:** `checkpoint/full-app-vercel-deploy-2026-05-27`
**Date paused:** 2026-05-29

---

## 1. Exact current objective

Implement the **FINAL CES storage architecture** (Option B — build AND deploy the real backend), staging only:

- **Google Drive** = actual files / uploaded evidence / PHI-bearing documents / final signed form PDFs / eCIgn certificate PDFs / final evidence packages.
- **DynamoDB / CES backend** = live non-PHI operational metadata (event execution state, task status, form-instance status + in-progress state, signature status, evidence/artifact pointers, completion/certification state, audit-readiness).
- **Google Calendar** = event shell + Drive attachment/folder/file index + event-facing access point.
- **S3** = only non-PHI metadata snapshots / audit exports / manifests (NEVER CES artifact files, charts, signed PDFs, certificates, or evidence binaries).
- **Browser localStorage** = PROHIBITED for CES/evidence/form/eCIgn/artifact/event-execution persistence. No fallback. A one-time cleanup of obsolete keys is allowed, but localStorage must not be a state source.

Build sequencing chosen by user: **backend CES metadata API + provider layer FIRST** (runs against local Express `:8787` so it is testable without AWS), infra/deploy after.

Deploy target: **staging only** → `https://d14dlrdifuuet5.cloudfront.net`.
Production (`https://dovdry3t4njek.cloudfront.net`) and all production infra: **DO NOT TOUCH**.

---

## 2. Files already changed (current uncommitted work — all from the PRIOR Google-Drive-evidence task; KEEP)

Modified:
- `.env.example` — added Drive evidence env block (`GOOGLE_EVIDENCE_STORAGE_PROVIDER`, `GOOGLE_CALENDAR_EVIDENCE_ENABLED`, `GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID`, `GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID`).
- `server/env.ts` — Drive evidence config fields.
- `server/googleCalendar.ts` — `attachDriveFileToEvent`, `getEventAttachmentCount`, `setEvidenceExtendedProperties` (allowlist, non-PHI).
- `server/routes/calendar.ts` — `POST /events/:eventId/evidence/upload`, `GET /evidence/health`.
- `src/policy/services/calendarApi.ts` — evidence types + `uploadEvidence` + `evidenceHealth`.
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx` — `EvidenceArtifactWorkspace` wiring `GoogleEvidencePanel`.
- `src/policy/pages/EvidenceCenterPage.tsx` — `GoogleEvidenceProviderCard` in sidebar.
- `package.json` — `validate:google-drive-evidence` script.

Untracked (new, KEEP):
- `server/googleDrive.ts` — Drive v3 client + folder/upload helpers (reuses service-account key; NO second auth path).
- `server/googleEvidence.ts` — evidence orchestration + pure helpers (folder path, sanitize, PHI guard, ref builder, dedupe, `validateEvidenceRef`, `extendedPropertiesHavePhi`).
- `src/policy/components/regulatory/GoogleEvidencePanel.tsx`
- `src/policy/components/regulatory/GoogleEvidenceProviderCard.tsx`
- `Builder/_system/GOOGLE_CALENDAR_DRIVE_EVIDENCE_ATTACHMENT_REPORT.md`
- `Builder/_system/audit-google-calendar-drive-evidence-sync.ts`

> No source changes were made for THIS storage-migration task yet (only this handoff file was written).

### Stashed (unrelated, parked — do NOT lose)
`stash@{0}` = `unrelated: mandated-event-form-field-inventory + eCIgn_Wizard docs (parked for CES storage migration)`.
Contains only: `Builder/_system/MANDATED_EVENT_FORM_FIELD_INVENTORY_REPORT.md`, `Builder/_system/generate-mandated-event-form-field-inventory.ts`, `Builder/_system/mandated-event-form-field-inventory*` (CSVs + `.xlsx.manifest.json`), `docs/UIUX/V3.2/Components/eCIgn_Wizard/`.
Restore later with: `git stash pop stash@{0}` (or `git stash apply`).
> NOTE: `stash@{1}` ("On main: quarantine unrelated pre-existing dirty files after Phase 5A-C") is pre-existing and NOT ours — leave it.

---

## 3. Files intentionally NOT touched

- `src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` — QA-WF-03 custom file. **Diff confirmed empty.**
- Sign-in / login (`src/auth/*`, demo-auth).
- Protected print/PDF engines (`FormPrintView`, `PrintPage`, `GVGBPrintDocument`, pdf-lib/html2pdf paths).
- Production CloudFront distribution, production bucket, production env, production URL.
- `infra/frontend-cdk/lib/frontend-stack.ts` (shared staging/prod stack) — not yet modified.

---

## 4. Current blocker

**User is restarting Cursor to complete AWS login.** This environment currently has **no AWS credentials**:
- `aws sts get-caller-identity` → `NoCredentials`
- `AWS_ACCESS_KEY_ID` not set, `AWS_PROFILE` not set
- CDK CLI present (2.1122.0). Repo deploy role is a **GitHub Actions OIDC role** (assumed by pushes to `staging` branch), not a local-credential path.

Because of this, deploying DynamoDB / Lambda / API Gateway / CloudFront `/api` behavior and running `cdk:frontend:deploy:staging` is currently impossible. The backend API + provider layer can still be BUILT and tested locally against Express `:8787` without AWS.

---

## 5. Exact next steps after restart

1. **Validate AWS identity** (see §6). Do not print secret values.
2. If creds are valid and scoped to the **staging/non-prod** account, proceed; otherwise stop and report.
3. Build in the user-chosen order — **backend API + provider layer first**:
   a. `src/policy/evidence/storageProviders/types.ts` — provider enum + `GoogleDriveEvidenceRef` (per Part 7) + CES metadata DTOs.
   b. `server/cesMetadataStore.ts` — CES metadata store. Local/dev: file-backed (mirror `server/sync/eventStore.ts` pattern, no AWS needed). Deployed: DynamoDB via `@aws-sdk/lib-dynamodb` (already a dependency). Single seam, env-selected.
   c. `server/routes/evidence.ts` (or extend `server/routes/calendar.ts`) — CES metadata GET/PUT + evidence endpoints from Part 9:
      `POST /api/calendar/events/:eventId/evidence/upload`, `.../evidence/attach-existing`, `GET .../evidence`, `GET .../drive-folder`, `POST .../signed-artifact/publish`.
   d. `src/policy/services/evidenceApi.ts` — frontend client for the CES metadata + evidence API.
   e. Migrate `src/policy/stores/regulatoryExecutionStore.ts` OFF localStorage:
      - Remove `persist`/`createJSONStorage(localStorage)` source-of-truth (`reg-execution-v2`, line ~3083) and the `ces_ev_data_*` / `ci_form_fields_*` byte paths.
      - Load/save via `evidenceApi` (backend). Allowed temp state: in-memory/session DURING active request only; purge after successful backend/Drive write.
      - On backend unavailable: render honest state — "CES backend storage unavailable. Evidence/form/signature state cannot be loaded." NEVER silently fall back to localStorage.
      - One-time cleanup of obsolete keys is allowed (remove, never read as source).
   f. Form lifecycle (Part 5): draft/in-progress/pending/partially-signed forms stay in CES backend metadata ONLY. Only fully completed + signed → generate artifact/cert → push to Drive → attach to Calendar → CES keeps non-PHI pointers.
   g. eCIgn artifacts (Part 6): on completion, push signed PDF + certificate to Drive, attach to Calendar, CES keeps metadata/pointers only (no PDF bodies).
   h. Frontend behavior (Part 8): Evidence Center = metadata/hierarchy + Drive links + Calendar attach state (no file body). Artifact Viewer = metadata/status + "Open in Google Drive" new tab, honest missing-file warning, no blank screen, no embedded Drive preview. Swimlane modal in-progress vs completed messaging per spec.
4. **Validators** — create/update:
   - `Builder/_system/audit-ces-no-localstorage.ts` (Part 11 — 8 checks; QA-WF-03 empty diff check #8).
   - `Builder/_system/audit-google-drive-ces-evidence-storage.ts` (Part 12 — 12 checks; QA-WF-03 empty diff check #12).
   - Add npm scripts following existing `validate:`/`check:` convention.
5. **Report** — create `Builder/_system/CES_GOOGLE_DRIVE_STORAGE_LOCK_AND_STAGING_DEPLOY_REPORT.md` (Part 13 — 19 sections).
6. **Testing** (Part 14): `npm run build`, `validate:event-dataflow`, `verify:task-identity`, `check:ecign-routes`, new validators; browser routes listed in Part 14.
7. **Infra-as-code** (after API/provider proven locally): extend `infra/frontend-cdk` (or a new `infra/ces-api-cdk`) with DynamoDB + Lambda + API Gateway, and add a CloudFront `/api/*` behavior to the staging distribution ONLY. Keep prod stack code path unchanged in behavior; only run the staging deploy.
8. **Staging deploy** (Part 15) — ONLY after build + validators pass and QA-WF-03 diff empty:
   - Use existing staging path: `npm run cdk:frontend:deploy:staging` (and the CES API stack's staging deploy once authored).
   - Invalidate **staging** CloudFront cache only. Do NOT guess distribution IDs — read from CDK stack outputs (`ci-policy-frontend-staging-distribution-id`).
   - Do NOT deploy prod. Do NOT commit `.env.local` or credentials JSON.
9. **Restore** the parked stash when appropriate: `git stash pop stash@{0}`.

---

## 6. Commands to validate AWS identity after restart

```
aws sts get-caller-identity
aws configure list
```
- Confirm the `Account`/`Arn` belong to the **staging/non-production** account.
- Confirm region is the intended staging region (frontend stack region is us-west-2; data resources CA/West per CDK outputs).
- If `get-caller-identity` still returns `NoCredentials` or points at production, STOP and report.

---

## 7. Standing rules (unchanged)

- **Staging-only deployment:** update `https://d14dlrdifuuet5.cloudfront.net` only.
- **Production untouched:** never modify production CloudFront distribution, production API, production bucket, production env, or `https://dovdry3t4njek.cloudfront.net`.
- Do not create a second Google OAuth/frontend auth path — reuse the existing service-account backend Calendar/Drive auth.
- Do not touch QA-WF-03, sign-in/login, or protected print/PDF engines.
- Do not print or store AWS secrets/tokens. Do not commit `.env.local` or `service-account.json`.
- No commit/deploy to production.

---

## 8. Architecture decision (locked)

- Google Drive stores files/artifacts (incl. PHI-bearing files, final signed PDFs, eCIgn certificate PDFs, final evidence packages).
- DynamoDB / CES backend stores non-PHI metadata, status, and pointers only.
- Google Calendar indexes/attaches Drive references (lightweight non-PHI `extendedProperties` allowlist only).
- No localStorage for CES (no fallback).
- No S3 for CES artifact files (S3 only for non-PHI snapshots/audit/exports if already in architecture).
- In-progress / draft / pending / partially-signed forms remain in CES backend until fully completed + signed.
- Only completed signed artifacts/certificates go to Google Drive evidence.

---

## 9. Git state at pause

- Branch: `checkpoint/full-app-vercel-deploy-2026-05-27`
- QA-WF-03 diff: **EMPTY** ✅
- Modified (8): `.env.example`, `package.json`, `server/env.ts`, `server/googleCalendar.ts`, `server/routes/calendar.ts`, `src/policy/pages/EvidenceCenterPage.tsx`, `src/policy/services/calendarApi.ts`, `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- Untracked (6): the Drive-evidence files listed in §2.
- Stash: `stash@{0}` = parked unrelated files (§2).

**STOP HERE. Wait for the user to restart Cursor and confirm AWS login before resuming.**
