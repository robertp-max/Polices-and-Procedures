# W1-A08 — DefenCIble Drive Investigator

## Agent ID
W1-A08

## Role
DefenCIble Drive Investigator (Wave 1) — attribute the local working Google Drive / calendar-evidence health surface to the correct process + env stack; confirm whether any dirty-root **code** merge is required; ensure no credential leakage in this report.

## Checks performed
1. Enumerated TCP listeners on ports **5188**, **8790**, **5187**, **5173** via `Get-NetTCPConnection` + `Win32_Process` (PID, Name, CommandLine, parent chain).
2. Inferred workdirs from absolute `node_modules` / script paths in command lines (no destructive process changes; document-only).
3. Called `GET http://127.0.0.1:5188/api/calendar/evidence/health` and recorded status + JSON body (`ok`, `drive.reachable`).
4. Optionally probed **5187**, **5173** (and related backends **8787** / **8790**) for the same health route; documented non-working Drive surfaces.
5. Inspected merge-worktree Drive code: `server/googleDrive.ts`, `server/googleDriveAuth.ts`, `server/googleEvidence.ts`, `server/routes/calendar.ts`, `server/env.ts` — env-based auth + locked Shared Drive IDs.
6. Compared those files (SHA-256 / content) between **merge worktree** and **dirty root** `Policies_and_Procedures_V2`.
7. Confirmed `.env` presence only (gitignored); listed **key names only** from dirty-root `.env` matching Drive/Google/Calendar; **never printed secret values**.
8. Confirmed merge worktree has **no** `.env` / `.env.local`.

## Commands used
```text
# Port listeners + Win32_Process attribution (avoid $PID — reserved in pwsh)
Get-NetTCPConnection -LocalPort <5188|8790|5187|5173> -State Listen
Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"
netstat -ano | findstr "LISTENING" | findstr ":5188 :8790 :5187 :5173"

# Health probes
curl.exe -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:5188/api/calendar/evidence/health
curl.exe -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8790/api/calendar/evidence/health
curl.exe -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:5187/api/calendar/evidence/health
curl.exe -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8787/api/calendar/evidence/health
curl.exe -s --connect-timeout 3 http://127.0.0.1:5173/...   # IPv4 refused
curl.exe -s --connect-timeout 3 "http://[::1]:5173/api/calendar/evidence/health"

# .env presence / key names only (no values)
Test-Path <root|merge>\.env
Get-Content dirty-root\.env | parse KEY names matching GOOGLE|DRIVE|CREDENTIAL|CALENDAR|PORT|VITE_
Select-String merge\.gitignore -Pattern '^\.env'

# File compare (merge vs dirty root)
Get-FileHash server/googleDrive*.ts server/googleEvidence.ts server/routes/calendar.ts server/env.ts
fc.exe /b ...\googleDriveAuth.ts  # line-ending only (LF vs CRLF)
```

## Files inspected
| Path | Notes |
|------|--------|
| `server/googleDrive.ts` | Drive client; `pingDrive()`; env + `googleDriveAuth` |
| `server/googleDriveAuth.ts` | `key_file` (local) / `impersonation` (prod); pure `planDriveAuth` |
| `server/googleEvidence.ts` | Evidence helpers over Drive |
| `server/routes/calendar.ts` | `GET /api/calendar/evidence/health` |
| `server/env.ts` | Loads `.env` / `.env.local`; `DRIVE_EVIDENCE_LOCK`; env-driven IDs |
| Dirty root `vite.config.ts` | `/api` proxy → `VITE_API_PROXY_TARGET` or default `http://localhost:8787` |
| Dirty root `.env` | **Exists**; gitignored; keys listed only |
| Merge worktree `.env` | **Does not exist** |
| Merge worktree `.gitignore` | Contains `.env`, `.env.local`, `.env.*.local` |
| `MERGE_INVENTORY_2026-08-03.md` (dirty root) | Documents 5188 web + 8790 API as working Drive |

## Evidence

### Server table (live processes — document only; no kills)

| Port | Bind | PID | Process | Inferred workdir | Role | Drive health |
|------|------|-----|---------|------------------|------|--------------|
| **5188** | `127.0.0.1` | **40920** | `node` → `vite --host 127.0.0.1 --port 5188 --strictPort` (via `npm run dev:web`) | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` (**dirty root**, not merge worktree) | Vite web surface for DefenCIble / evidence | **`ok:true`**, `drive.reachable:true` (fronts working API) |
| **8790** | `0.0.0.0` + `[::]` | **37840** | `node` + `tsx` loader → `server/index.ts` (via `npm run dev:api`) | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` (**dirty root**) | Express API — **working Drive backend** | **`ok:true`**, `drive.reachable:true` |
| **5187** | `127.0.0.1` | **33068** | `node` → `vite --host 127.0.0.1 --port 5187 --strictPort` (npx vite) | `...\worktrees\qapi-uiux-discovery` | QAPI UI discovery web | **`ok:false`**, `drive.reachable:false`, `error:"internal_error"` (HTTP 503) |
| **5173** | **`[::1]` only** (not IPv4) | **26000** | `node` → `vite --port 5173 --strictPort` (`npm run dev:web`) | `...\worktrees\packet-platform-pixel-baseline` | Pixel-baseline web | IPv4 refused; via `[::1]` → **`ok:false`**, `internal_error` (HTTP 503) |

**Related (not in original port list, needed for attribution):**

| Port | PID | Workdir | Notes |
|------|-----|---------|--------|
| **8787** | **24128** | `...\worktrees\packet-platform-pixel-baseline` | `npm run dev:api` with `PORT=8787` + `ALLOWED_ORIGIN=http://localhost:5173`. Health: **`ok:false`**, `drive.reachable:false`, `internal_error`. Default Vite proxy target when `VITE_API_PROXY_TARGET` unset. **Not** the working Drive API. |

**Command-line excerpts (no secrets):**

```text
5188: node ...\Policies_and_Procedures_V2\node_modules\...\vite.js --host 127.0.0.1 --port 5188 --strictPort
8790: node ...\Policies_and_Procedures_V2\node_modules\tsx\... server/index.ts
5187: node ...\worktrees\qapi-uiux-discovery\node_modules\...\vite.js --host 127.0.0.1 --port 5187 --strictPort
5173: node ...\worktrees\packet-platform-pixel-baseline\node_modules\...\vite.js --port 5173 --strictPort
8787: node ...\worktrees\packet-platform-pixel-baseline\node_modules\tsx\... server/index.ts
      parent launch: set PORT=8787&& set ALLOWED_ORIGIN=http://localhost:5173&& npm run dev:api
```

**Merge worktree** `merge-local-app-surfaces-2026-08-03`: **no** listeners among 5188/8790/5187/5173.

### Health JSON

#### Working — `http://127.0.0.1:5188/api/calendar/evidence/health`
- HTTP **200**
```json
{
  "ok": true,
  "enabled": true,
  "provider": "google_drive_calendar",
  "sharedDriveId": "0AMhwVb2RmU-fUk9PVA",
  "rootFolderId": "0AMhwVb2RmU-fUk9PVA",
  "drive": {
    "reachable": true,
    "rootId": "0AMhwVb2RmU-fUk9PVA"
  }
}
```

#### Working API (direct) — `http://127.0.0.1:8790/api/calendar/evidence/health`
- HTTP **200** — **identical body** to 5188 (same Shared Drive root, `drive.reachable:true`).

#### Not working Drive — `http://127.0.0.1:5187/api/calendar/evidence/health`
- HTTP **503**
```json
{
  "ok": false,
  "enabled": true,
  "provider": "google_drive_calendar",
  "sharedDriveId": "0AMhwVb2RmU-fUk9PVA",
  "rootFolderId": "0AMhwVb2RmU-fUk9PVA",
  "drive": {
    "reachable": false,
    "error": "internal_error"
  }
}
```
- Port 5187 is **Vite UI only** (qapi-uiux-discovery); evidence route is proxied to a non-working (or default) API path. **Not** the working Drive stack.

#### Not working Drive — `http://[::1]:5173/api/calendar/evidence/health`
- HTTP **503**, same `ok:false` / `internal_error` shape as 5187/8787.
- IPv4 `127.0.0.1:5173` actively refused (listener is IPv6 localhost only).
- **Not** the working Drive stack (packet-platform-pixel-baseline web + its 8787 API both fail Drive ping).

#### Not working Drive — `http://127.0.0.1:8787/api/calendar/evidence/health`
- HTTP **503**, `drive.reachable:false`, `error:"internal_error"`.
- Explains default-proxy failures when Vite points at 8787 without dirty-root credentials.

### Env / credentials (no secret values)

| Location | `.env` | Notes |
|----------|--------|--------|
| Dirty root `Policies_and_Procedures_V2` | **Present** | Gitignored. Key names observed (values **not** printed): `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CALENDAR_ID`, `GOOGLE_EVIDENCE_STORAGE_PROVIDER`, `GOOGLE_CALENDAR_EVIDENCE_ENABLED`, `GOOGLE_DRIVE_EVIDENCE_SHARED_DRIVE_ID`, `GOOGLE_DRIVE_EVIDENCE_ROOT_FOLDER_ID`, `PORT`, `GOOGLE_DRIVE_PACKET_FOLDER_ID`, plus unrelated `VITE_*` keys. |
| Merge worktree | **Absent** | Also no `.env.local`. Has `.env.example` only. |
| Gitignore | `.env`, `.env.local`, `.env.*.local` | Confirmed on merge worktree. |

Drive auth is **env-based** (`server/env.ts` + `GOOGLE_APPLICATION_CREDENTIALS` key-file path for local `key_file` mode; Shared Drive IDs locked in `DRIVE_EVIDENCE_LOCK` / overridable by env). Local success depends on dirty-root process CWD + loaded `.env` + external credential file — **not** on copying server source from dirty root into the merge branch.

### Code merge assessment (dirty root → merge)

| File | Merge vs dirty-root | Action needed? |
|------|---------------------|----------------|
| `server/googleDrive.ts` | **Identical** (hash match) | No |
| `server/googleEvidence.ts` | **Identical** | No |
| `server/routes/calendar.ts` | **Identical** | No |
| `server/env.ts` | **Identical** | No |
| `server/googleDriveAuth.ts` | Binary hash differs; **line endings only** (LF vs CRLF per `fc /b`); line content compare count **0** | No functional code copy |

**Conclusion:** Expectation confirmed — **no dirty-root Drive code copy** is required for the merge. Working Drive is correctly attributed to **runtime env + dirty-root API process on 8790**, exposed through **Vite 5188**. To reproduce Drive in the merge worktree later: run API from a tree that has the same **env keys** (and external credentials path), not by copying secrets or dirty source files.

## Findings
1. **Working Drive surface:** `127.0.0.1:5188` (dirty-root Vite) + `8790` (dirty-root Express `server/index.ts`). Health: `ok:true`, `drive.reachable:true`, Shared Drive `0AMhwVb2RmU-fUk9PVA`.
2. **5187 and 5173 are not the working Drive stack** — both yield 503 / `drive.reachable:false` / `internal_error` (5173 only on `[::1]`).
3. **8787** (packet-platform-pixel-baseline API) is a second non-working Drive backend and matches the default Vite proxy target when `VITE_API_PROXY_TARGET` is unset.
4. **Merge worktree is not hosting** these ports; attribution is entirely to dirty root + other worktrees.
5. **Drive implementation is already present and env-driven** on the merge branch; dirty-root `.env` explains live success — do **not** commit or print secrets; do **not** treat dirty-root as a code source for Drive.
6. **No credential leakage** in this investigation: secret values from `.env` were not printed; only key names and public Shared Drive folder IDs returned by the health endpoint.

## Result
**PASS**

Criteria met:
- Working Drive correctly attributed to **5188 (web) + 8790 (API) + dirty-root env** (not 5187/5173).
- Health JSON recorded with `ok:true` and `drive.reachable:true` on the working surface.
- No dirty-root Drive **code** merge required (env-based).
- No credential / secret values leaked in the report.
)
