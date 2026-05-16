# Approved User Registration via Salesforce Org ID — Implementation Report

**Date:** 2026-05-15 (rev 3)
**Status:** COMPLETE — stopped before commit/push/deploy

---

## 1. Allowlist Source

**Expected file:** CSV at path controlled by env var `APPROVED_USERS_CSV_PATH`
**Default path:** `./config/approved-users.csv`
**Implementation:** `server/auth/approvedUsers.ts`

No users are hardcoded. No sample, demo, or placeholder data exists anywhere in the source code. The allowlist is loaded from an external CSV file at server runtime only.

### Required CSV columns
```
email,fullName,sfOrgId,role,department,status,notes
```
- `email` — required; normalized to lowercase on load
- `sfOrgId` — required; normalized to uppercase, whitespace stripped on load
- `fullName`, `role`, `department` — optional; trimmed
- `status` — `active` or `inactive`; defaults to `active` if blank
- `notes` — optional

---

## 2. Actual Users Loaded

**Current count: 0**

The approved-user CSV has not been provided. No users are loaded. The system is fail-closed: all registration attempts will be rejected until a valid CSV is placed at the configured path and the server is started or `POST /api/auth/reload-allowlist` is called.

---

## 3. Fail-Closed Behavior — Confirmed

The system fails closed under all of the following conditions:

| Condition | Behavior |
|-----------|----------|
| CSV file not found | `available: false` → all registrations blocked |
| CSV file empty (< 2 lines) | `available: false` → all registrations blocked |
| CSV missing required columns (`email` or `sfOrgId`) | `available: false` → all registrations blocked |
| CSV has 0 valid rows after parsing | `available: false` → all registrations blocked |
| User not in allowlist | 403, generic message |
| User in allowlist but `status = inactive` | 403, generic message |
| Account already `active` in DynamoDB | 403, generic message (duplicate prevention) |

In all failure cases the user sees only:
> "Registration verification failed. Please contact your administrator."

When the page first loads and the allowlist is unavailable, the form is replaced with:
> "Registration is temporarily unavailable. Please contact your administrator."

Internal error details (CSV path, error message, counts) are never sent to the client.

---

## 4. Reload Support

Cache is never permanent. The allowlist can be refreshed without a server restart:

```
POST /api/auth/reload-allowlist
x-admin-secret: <ADMIN_RELOAD_SECRET env value>
```

Returns: `{ available, totalDataRows, malformedRows, activeRows, error }`

The `ADMIN_RELOAD_SECRET` env var must be set; if absent or mismatched the endpoint returns 403 and does nothing.

---

## 5. Startup / Reload Verification Log

On every load (startup, reload, or dry-run) the server emits a structured log entry:

```json
{
  "event": "auth.approved_users.startup",
  "available": false,
  "path": "./config/approved-users.csv",
  "totalDataRows": 0,
  "malformedRows": 0,
  "activeRows": 0,
  "error": "Approved user allowlist not loaded. File not found..."
}
```

When loaded successfully with e.g. 120 active users:
```json
{
  "event": "auth.approved_users.startup",
  "available": true,
  "path": "./config/approved-users.csv",
  "totalDataRows": 122,
  "malformedRows": 2,
  "activeRows": 120
}
```

---

## 6. Dry-Run Validation Mode

Validate a CSV file without affecting the live allowlist cache:

```
POST /api/auth/validate-allowlist-csv
x-admin-secret: <ADMIN_RELOAD_SECRET>
Content-Type: application/json

{ "path": "./config/approved-users-new.csv" }
```

Returns the same shape as reload: `{ available, path, totalDataRows, malformedRows, activeRows, error }`. Does not update `_cache` or `_status`. Safe to run against staging files before deploying.

---

## 7. CSV Parser Safeguards

- Emails: trimmed, lowercased
- SF Org IDs: trimmed, uppercased, internal whitespace removed
- Rows missing `email` (after normalization) or `sfOrgId`: skipped and counted as malformed
- Rows with email missing `@`: skipped and counted as malformed
- Malformed row count emitted in the startup log
- Raw CSV content is never logged
- Status field defaults to `active` if the column is blank

---

## 8. Logging Rules — Confirmed

Logged in registration flow:
- Normalized email
- Verification outcome (`approved`, `denied`, `already_registered`, `allowlist_unavailable`)
- Role (on success only)

Never logged:
- Salesforce Org ID (raw or normalized)
- Passwords
- Raw CSV contents

---

## 9. Duplicate Registration Prevention

In both `verifyRegistration` and `setupAccountDirect`:
- After allowlist match, DynamoDB is checked for existing registration
- If existing record has `status === 'active'` → blocked with generic 403
- This prevents double-creation even if the verify step is called again

---

## 10. Legacy Email-Invite Routes — Permanently Closed

The following endpoints now return `HTTP 410 Gone`:

| Endpoint | Previous behavior | Now |
|----------|-------------------|-----|
| `POST /api/auth/register-request` | Send SES invite email + setup token | 410 Gone |
| `POST /api/auth/resend-setup-link` | Regenerate + resend setup token email | 410 Gone |
| `POST /api/auth/setup-account` | Complete setup via token URL | 410 Gone |

Removed bypasses:
- `@careindeed.com` domain auto-approval (blocked at route level)
- `AUTO_APPROVED_EMAILS` env-based approval list (blocked at route level)
- Setup token generation
- SES invite email sending
- Magic links / one-time URLs

Preserved:
- `POST /api/auth/login` — unchanged
- `POST /api/auth/respond-challenge` — unchanged
- `POST /api/auth/refresh` — unchanged
- `POST /api/auth/logout` — unchanged
- `GET /api/auth/me` — unchanged
- Forgot/reset password flows — unchanged
- Existing active user sessions — unaffected

---

## 11. Registration Page — Unavailable State

On mount, `RegisterPage` calls `GET /api/auth/allowlist-status`.

- `{ available: false }` or fetch error → shows: "Registration is temporarily unavailable. Please contact your administrator." No form is rendered.
- `{ available: true }` → shows the email + SF Org ID verification form as normal.

The status endpoint returns only `{ available: boolean }`. Internal details never reach the browser.

---

## 12. Files Changed

| File | Action |
|------|--------|
| `server/auth/approvedUsers.ts` | **REWRITTEN** — reload support, structured status, malformed-row counting, startup log, dry-run, fail-closed |
| `server/auth/service.ts` | **MODIFIED** — duplicate-account guard, `isAllowlistAvailable()` check, SF Org ID never logged |
| `server/routes/auth.ts` | **REWRITTEN** — 410 legacy routes, `/allowlist-status`, `/reload-allowlist`, `/validate-allowlist-csv` |
| `src/auth/api.ts` | **MODIFIED** — `getAllowlistStatus()` added |
| `src/auth/pages/RegisterPage.tsx` | **MODIFIED** — availability check on mount, unavailable state |

---

## 13. Validation Results

| Check | Result |
|-------|--------|
| `npx tsc -b --noEmit` | PASS (exit 0) |
| `npm run build` | PASS (exit 0, 2156 modules) |
| `npx tsx scripts/verify-feature-access.mjs` | PASS (all acceptance checks green) |
| Linter | PASS (0 errors on all changed files) |

---

## 14. No Unrelated Systems Changed — Confirmed

Not touched:
- Policy views / LibraryPage / GVGBDetailView
- ACHC survey alignment
- CES / eCign / Evidence Center / Print / Export
- Builder/ / Bin-(thrash)/
- Calendar / Staffing / Journey / iAdministrator / Hubstaff / Demo page

---

## 15. Admin Action Required Before Registration Is Live

**ERROR: Approved user allowlist not loaded.**

Steps to enable registration:
1. Create `./config/approved-users.csv` (or set `APPROVED_USERS_CSV_PATH`)
2. Populate with the real approved users: `email,fullName,sfOrgId,role,department,status,notes`
3. (Optional) Run `POST /api/auth/validate-allowlist-csv` to verify without enabling
4. Start or reload the server (`POST /api/auth/reload-allowlist`)
5. Confirm server log shows: `auth.approved_users.startup { available: true, activeRows: N }`

Until this CSV is provided, the registration page will display the unavailable message and all API attempts will be rejected.

---

## End of Report
