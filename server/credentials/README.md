# Service-Account Credentials

Place the Google Cloud service-account JSON key at:

```
server/credentials/service-account.json
```

## Important
- This file is **gitignored** and must never be committed.
- Only the backend process reads it. It is never shipped to the browser.
- In production, prefer loading the JSON out-of-repo and pointing
  `GOOGLE_APPLICATION_CREDENTIALS` to that absolute path (e.g.
  `/etc/ci-planner/service-account.json`) with strict `0400` perms.
- The service account must have been granted
  **Make changes to events** on the target Google Calendar
  (`GOOGLE_CALENDAR_ID`).
- To rotate the key: create a new key in Google Cloud Console, replace
  the file, restart the API. Revoke the old key immediately.

## Locked Drive evidence identity (protected from drift)

The Google Drive evidence pipeline is pinned to a **canonical identity** in
`server/env.ts → DRIVE_EVIDENCE_LOCK`:

| Setting | Locked value |
| --- | --- |
| Service account | `careindeed-drive-evidence@orbital-stage-443721-v1.iam.gserviceaccount.com` |
| Project | `orbital-stage-443721-v1` |
| Shared drive | `0AMhwVb2RmU-fUk9PVA` |
| Storage provider | `google_drive_calendar` (pinned in code — env typos cannot change it) |

`assertDriveEvidenceLock()` runs at server boot and **fails closed** (refuses to
start) if the loaded key's service account/project, or the configured shared
drive, do not match — so a wrong key or drive can never silently be used. It only
reads the credentials' non-secret identity fields (never the private key).

- The service account must remain a **Content manager** on the shared drive.
- To change any locked value, edit `DRIVE_EVIDENCE_LOCK` in a **reviewed code
  change** — not via an ad-hoc env var.
- Re-check anytime: `npm run verify:drive-lock`.

## Quick sanity check

```bash
# From the repo root
curl http://localhost:8787/api/healthz
```

A healthy response returns `{ "ok": true, "calendar": { "reachable": true } }`.
