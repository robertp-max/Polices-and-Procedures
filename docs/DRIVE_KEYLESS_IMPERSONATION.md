# Drive Keyless Impersonation — Cross-Project Access for CIHHC

**Status:** code + tests landed; IAM and Cloud Run changes are **PROPOSED ONLY** and
require separate approval. Nothing in the cloud was changed by this work.

## Two-project layout (verified 2026-07-10)

| Concern | Project | Identity |
|---|---|---|
| App runtime (Cloud Run `care-indeed-hh-v2-dev`, us-central1) | `data-hangout-500409-j4` | `care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com` |
| Drive + Calendar integration (APIs enabled here) | `orbital-stage-443721-v1` | `careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com` |
| Canonical Shared Drive | Workspace | `0AMhwVb2RmU-fUk9PVA` — "Home Health CES Evidence Folder" (Drive SA is an organizer) |

The split is valid: cross-project impersonation is a standard GCP pattern. The Drive
identity, its Shared Drive membership, and the Drive/Calendar API enablement stay in
`orbital-stage`; the app runs in `data-hangout` and *borrows* the Drive identity via
short-lived tokens — no key ever exists in the runtime.

## How keyless impersonation works

```
Cloud Run (care-indeed-hh-v2-runner@data-hangout)      ← runtime identity via ADC
        │  iamcredentials.generateAccessToken (scoped, 1h)
        ▼
careindeed-drive-evidence@orbital-stage                ← the ONLY permitted target
        │  Drive API, existing narrow scopes
        ▼
Shared Drive 0AMhwVb2RmU-fUk9PVA (evidence files)
```

- Mode selection + fail-closed validation: [`server/googleDriveAuth.ts`](../server/googleDriveAuth.ts)
- Wiring: [`server/googleDrive.ts`](../server/googleDrive.ts) `getClient()` (Drive only)
- Lock extension: `assertDriveEvidenceLock()` in [`server/env.ts`](../server/env.ts) now also
  validates the impersonation target against `DRIVE_EVIDENCE_LOCK` and enforces
  fail-closed when `GOOGLE_DRIVE_AUTH_MODE=impersonation`.

**Calendar is untouched.** `server/googleCalendar.ts` still builds its own key-file
client; regression tests prove its construction and read path are unchanged
(`src/policy/evidence/driveFirst/serverDriveLockAndCalendar.test.ts`). Migrating
Calendar to impersonation is a separate future decision.

## Environment variables

| Variable | Values | Notes |
|---|---|---|
| `GOOGLE_DRIVE_AUTH_MODE` | `impersonation` (production) / `key_file` or unset (local dev) | New. Unset ⇒ existing local behavior. |
| `GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT` | must equal the locked Drive SA | New. Required in impersonation mode; any other value fails closed. |
| `GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID` | `0AMhwVb2RmU-fUk9PVA` | Existing; still lock-validated. |
| `GOOGLE_DRIVE_PACKET_FOLDER_ID` | `1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0` | Existing name; the previously hardcoded Event Packets id now resolves through `env.drivePacketFolderId` with this exact default — same value, same behavior. In **impersonation mode** any override away from the locked id **fails closed at boot**; the override remains a development-only convenience in `key_file` mode. |
| `GOOGLE_APPLICATION_CREDENTIALS` | external file path, **outside the repo** | LOCAL DEVELOPMENT ONLY. Ignored (with a warning) in impersonation mode. Calendar still uses it everywhere for now. |

Key rules: no JSON private key in the repo, images, client env, source, logs, or test
snapshots (test fixtures use fake placeholder strings). A Secret-Manager-mounted JSON
key is **not** the production design — impersonation is.

## Post-apply verification (for the future, separately approved rollout)

- **Verify the impersonated principal:** call the server's Drive health endpoint (or
  `pingDrive`) on the deployed revision and check the boot log line
  `google.drive.auth.ready` — it must show `mode: impersonation` and
  `targetPrincipal: careindeed-drive-evidence@…`. A controlled non-PHI dev upload
  (separately approved) should then show that file's Drive *creator* as the
  **Drive service account**, never `care-indeed-hh-v2-runner@…` — the runtime SA is
  only the token minter, not the Drive principal (regression-tested).
- **Verify no private key was deployed:**
  `gcloud run services describe care-indeed-hh-v2-dev --project data-hangout-500409-j4 --region us-central1 --format yaml` —
  confirm there is no `GOOGLE_APPLICATION_CREDENTIALS` env var, no secret volume with
  key material, and no `secretKeyRef` for any Google key. The impersonation env vars
  are non-secret identifiers only.
- **Confirm Calendar unchanged:** `google.calendar.auth.ready` still logs the
  key-file client; Calendar env vars, calendar id, and scopes are untouched by the
  proposed Cloud Run command (it adds Drive vars only).
- **Confirm Drive unchanged:** re-run the read-only probe used on 2026-07-10 —
  Shared Drive `0AMhwVb2RmU-fUk9PVA`, folders `01_CES`
  (`1h1UrHKPlwX37aAD6S9IrmA4bAiwuFlWK`) and `Event Packets`
  (`1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0`), and the membership list must be identical.

## Proposed minimal IAM (DO NOT RUN without approval)

**Role determination (not guessed):** the implementation uses
`google-auth-library`'s `Auth.Impersonated`, which calls
`iamcredentials.googleapis.com … :generateAccessToken` on the target service
account. The permission required is `iam.serviceAccounts.getAccessToken`, and the
smallest predefined role containing it is **`roles/iam.serviceAccountTokenCreator`**,
granted **on the target service account resource only** (not project-wide). No
narrower predefined role exists for `generateAccessToken`.

Grant the runtime SA permission to mint tokens **for the one Drive SA only**
(resource-scoped binding — not project-wide):

```bash
gcloud iam service-accounts add-iam-policy-binding \
  careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com \
  --project orbital-stage-443721-v1 \
  --member "serviceAccount:care-indeed-hh-v2-runner@data-hangout-500409-j4.iam.gserviceaccount.com" \
  --role "roles/iam.serviceAccountTokenCreator"
```

Required API (verified **not yet enabled** in orbital-stage as of 2026-07-10):

```bash
gcloud services enable iamcredentials.googleapis.com --project orbital-stage-443721-v1
```

No Owner/Editor, no project-wide Token Creator, no access to any other service account.

## Proposed Cloud Run configuration (DO NOT RUN without approval)

```bash
gcloud run services update care-indeed-hh-v2-dev \
  --project data-hangout-500409-j4 \
  --region us-central1 \
  --update-env-vars "GOOGLE_DRIVE_AUTH_MODE=impersonation,GOOGLE_DRIVE_IMPERSONATE_SERVICE_ACCOUNT=careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com,GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID=0AMhwVb2RmU-fUk9PVA,GOOGLE_DRIVE_PACKET_FOLDER_ID=1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0"
```

No secrets, no key file, no runtime-service-account change, no traffic change.

## Rollback

- **Code:** the new mode is opt-in. Unset `GOOGLE_DRIVE_AUTH_MODE` (or set `key_file`)
  and behavior is byte-for-byte the pre-change key-file path. Reverting the four
  touched server files restores the previous code exactly.
- **Cloud (after any future apply):** remove the env vars from the service and remove
  the single IAM binding. No data migration is involved either way.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Boot fails: "impersonation target … not set/approved" | Fail-closed validation working as designed — fix env vars. |
| `403` from `iamcredentials.generateAccessToken` | Missing Token Creator binding, or `iamcredentials.googleapis.com` not enabled in orbital-stage. |
| Drive `403/404` after auth succeeds | Drive API disabled, or the Drive SA lost Shared Drive membership. |
| Works locally, fails deployed | Local uses the key file; deployed uses impersonation — check the two proposed commands were applied. |
| Warning "JSON credential file is configured but IGNORED" | Expected if `GOOGLE_APPLICATION_CREDENTIALS` lingers in a production-shaped env; remove it there. |

## Unchanged / out of scope

- **No Drive file, folder, permission, membership, or role changed.** All folder IDs
  (`01_CES` = `1h1UrHKPlwX37aAD6S9IrmA4bAiwuFlWK`, Event Packets =
  `1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0`) are exactly as found.
- **Calendar completely unchanged** — configuration, IDs, events, recurrence,
  reminders, attendees, sync, and its auth path.
- **Browser access is a separate issue:** a valid `webViewLink` does **not** grant
  access — the browser user must independently be a Shared Drive member. Current
  membership is only 2 staff organizers, the service account, and one **external
  personal Gmail reader (`teejay1784@gmail.com`) — flagged for manual review; not
  modified.** Recommended future step: manage viewer access through a controlled
  Google Workspace group (do not create it as part of this change). Public /
  "anyone with the link" sharing remains prohibited, and **no domain-wide access**
  may be granted unless separately approved.
- **Future Drive role reduction** (e.g. trimming the service account from
  *organizer* to *content manager*) is documentation-only here and must be a
  separately approved task — the role was **not** changed in this work.

## Verification still required before calling this live

1. Approve + apply the IAM binding and API enablement.
2. Approve + apply the Cloud Run env update.
3. Controlled non-PHI dev test: ping Drive from the deployed service, upload one mock
   file to a mock folder, verify, then clean up — under change control.
