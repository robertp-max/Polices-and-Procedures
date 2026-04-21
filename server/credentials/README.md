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

## Quick sanity check

```bash
# From the repo root
curl http://localhost:8787/api/healthz
```

A healthy response returns `{ "ok": true, "calendar": { "reachable": true } }`.
