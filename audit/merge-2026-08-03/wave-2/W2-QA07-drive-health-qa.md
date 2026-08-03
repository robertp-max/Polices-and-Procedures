# W2-QA07 — Google Drive Health QA

## Agent ID
W2-QA07

## Role
Wave 2 independent QA: attribute live listeners on **5188** and **8790**, probe `GET /api/calendar/evidence/health` on the Vite surface (5188), require HTTP 200 with `ok:true` and `drive.reachable:true`, and confirm this report contains **no secret values** from `.env`.

## Verdict

**PASS**

| Gate | Result |
|------|--------|
| Port **5188** listener documented (PID, cmdline, cwd) | **PASS** |
| Port **8790** listener documented (PID, cmdline, cwd) | **PASS** |
| `GET http://127.0.0.1:5188/api/calendar/evidence/health` → HTTP **200** | **PASS** |
| Response `ok` === `true` | **PASS** |
| Response `drive.reachable` === `true` | **PASS** |
| No `.env` secret **values** written into this report | **PASS** |

## Timestamp
2026-08-03 ~13:42 local (America/Los_Angeles, UTC−07:00)

## Checks performed

1. Enumerated TCP listeners on ports **5188** and **8790** via `netstat -ano`.
2. Resolved PID → process name, command line, parent chain via `Get-CimInstance Win32_Process`.
3. Resolved process current working directory via PEB `CurrentDirectory` read (`NtQueryInformationProcess` + `ReadProcessMemory`).
4. `GET http://127.0.0.1:5188/api/calendar/evidence/health` (primary gate).
5. Cross-check: same path on **8790** (API origin) — not a fail gate, attribution only.
6. Secret hygiene: confirmed dirty-root `.env` **exists** and merge-worktree `.env` **does not**; listed matching **key names only** (never values).

## Commands used

```text
netstat -ano | findstr ":5188 :8790"
Get-CimInstance Win32_Process -Filter "ProcessId=40920 OR ProcessId=37840"
# PEB CurrentDirectory read for PIDs 40920, 37840
Invoke-WebRequest -Uri "http://127.0.0.1:5188/api/calendar/evidence/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://127.0.0.1:8790/api/calendar/evidence/health" -UseBasicParsing
Test-Path <dirty-root>\.env
Test-Path <merge-worktree>\.env
# Key names only from dirty-root .env (GOOGLE|DRIVE|CREDENTIAL|CALENDAR|PORT|VITE_*)
```

## Server attribution (live processes — document only)

| Port | Bind | PID | Process | Inferred / resolved cwd | Role |
|------|------|-----|---------|-------------------------|------|
| **5188** | `127.0.0.1` | **40920** | `node.exe` → Vite | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` (**dirty root**, not merge worktree) | Vite web surface (`dev:web`); proxies `/api` to backend |
| **8790** | `0.0.0.0` + `[::]` | **37840** | `node.exe` → `tsx` → `server/index.ts` | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` (**dirty root**) | Express API (`dev:api`); Google Drive / calendar-evidence backend |

### Command lines (no secrets)

**5188 / PID 40920**

```text
"node" "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\node_modules\.bin\\..\vite\bin\vite.js" --host 127.0.0.1 --port 5188 --strictPort
```

- Parent: `cmd.exe` (`C:\WINDOWS\system32\cmd.exe /d /s /c vite --host 127.0.0.1 --port 5188 --strictPort`)
- **Resolved cwd:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`
- Inferred from paths: dirty root `Policies_and_Procedures_V2` (not the merge worktree `...\merge-local-app-surfaces-2026-08-03`)

**8790 / PID 37840**

```text
"C:\Program Files\nodejs\node.exe" --require C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\node_modules\tsx\dist\preflight.cjs --import file:///C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/node_modules/tsx/dist/loader.mjs server/index.ts
```

- Parent: `node.exe` → `tsx` CLI watch:  
  `"node" "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\node_modules\.bin\\..\tsx\dist\cli.mjs" watch server/index.ts`
- **Resolved cwd:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`
- Inferred from paths: same dirty root stack as 5188

**Note:** Both listeners are the **dirty-root** DefenCIble stack (5188 web + 8790 API), not processes started from the merge worktree CWD.

## Health probe (required gate)

### Request

```http
GET http://127.0.0.1:5188/api/calendar/evidence/health
```

### Response

- **HTTP status:** `200`
- **Body (quoted verbatim):**

```json
{"ok":true,"enabled":true,"provider":"google_drive_calendar","sharedDriveId":"0AMhwVb2RmU-fUk9PVA","rootFolderId":"0AMhwVb2RmU-fUk9PVA","drive":{"reachable":true,"rootId":"0AMhwVb2RmU-fUk9PVA"}}
```

### Gate evaluation

| Field | Expected | Observed | Result |
|-------|----------|----------|--------|
| HTTP status | 200 | 200 | **PASS** |
| `ok` | `true` | `true` | **PASS** |
| `drive.reachable` | `true` | `true` | **PASS** |

### Cross-check (8790 API origin — informational)

Same body and HTTP 200 on `GET http://127.0.0.1:8790/api/calendar/evidence/health`, confirming Vite 5188 is fronting the working Drive-backed API on 8790.

## Secret hygiene

| Check | Result |
|-------|--------|
| Dirty-root `.env` present | Yes (gitignored; not opened for values in report) |
| Merge worktree `.env` present | **No** |
| Secret **values** from `.env` written into this report | **None** |
| Credential file paths / private keys / tokens printed | **None** |

**Env key names only** observed on dirty-root `.env` matching Drive/Google/calendar/port/Vite patterns (values deliberately omitted):

```text
GOOGLE_APPLICATION_CREDENTIALS
GOOGLE_CALENDAR_ID
GOOGLE_EVIDENCE_STORAGE_PROVIDER
GOOGLE_CALENDAR_EVIDENCE_ENABLED
GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID
GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID
PORT
VITE_AUTH_API_BASE_URL
VITE_EVIDENCE_STORAGE_MODE
VITE_AWS_API_BASE_URL
VITE_AWS_REGION
GOOGLE_DRIVE_PACKET_FOLDER_ID
```

Health JSON includes Shared Drive / root folder **resource IDs** returned by the public health endpoint; those are not private key material or credential file contents. No `.env` value was copied into this file.

## Summary

- **5188** = Vite (PID **40920**) in dirty root `Policies_and_Procedures_V2`.
- **8790** = Express/tsx API (PID **37840**) in the same dirty root cwd.
- Calendar evidence health on 5188 is **HTTP 200**, `ok:true`, `drive.reachable:true`.
- Report contains **no** `.env` secret values.

## Final status

**PASS**
