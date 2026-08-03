# W2-QA08 — Wrong URL Regression QA

| Field | Value |
| --- | --- |
| Agent | **W2-QA08** (Wrong URL Regression QA) |
| Wave | 2 (independent) |
| Date | 2026-08-03 |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Scope | Claims that ports **5187** or **5173** are working Drive URLs; inventory exclusivity of **5188**; optional live health probes |
| Result | **PASS** |

## Mission

1. Search `MERGE_INVENTORY_2026-08-03.md` and audit reports for claims that **5187** or **5173** are working Drive URLs.
2. Confirm inventory marks **only 5188** as working Drive.
3. Optionally probe 5187/5173 health and show they are **not** working Drive.

**PASS criterion:** docs correct (no false “working Drive” attribution to 5187/5173; only 5188 documented as working Drive).

---

## 1. Inventory review — `MERGE_INVENTORY_2026-08-03.md`

### Canonical Drive wording (lines 83–94)

Inventory states explicitly:

> **Canonical working Drive surface is only port 5188** (with local env + API **8790**).  
> **Ports 5187 and 5173 are not working Drive URLs** — do not treat them as the verified Drive stack.

| Surface | URL | Drive status in inventory |
| --- | --- | --- |
| **Working Drive (only)** | `http://127.0.0.1:5188/evidence` (+ `/evidence/defensible-2`) | Verified when main has `.env` + API **8790**: `ok: true`, `drive.reachable: true` |
| qapi preview | `http://127.0.0.1:5187/compliance` | UI may load; **NOT working Drive** |
| Older baseline | `http://localhost:5173/evidence/defensible-2` | **NOT working Drive** |

### Local app URL table (lines 99–109)

| Surface | URL | Notes |
| --- | --- | --- |
| DefenCIble + Drive | `http://127.0.0.1:5188/evidence` | Main + API 8790; env-backed |
| DefenCIble direct | `http://127.0.0.1:5188/evidence/defensible-2` | (Drive surface under 5188 only) |
| qapi preview | `http://127.0.0.1:5187/compliance` | **Not** working Drive |

### Build / QA snapshot (line 32)

Drive health claim is scoped only to:

- `http://127.0.0.1:5188/api/calendar/evidence/health` → HTTP 200, `ok: true`, `drive.reachable: true` (env on main)

No 5187/5173 health success is claimed in the snapshot.

### Wave-1 inventory verification table (lines 132–134)

| Claim | Status | Evidence |
| --- | --- | --- |
| Working Drive URL | **OK** | **Only** `http://127.0.0.1:5188/evidence` (+ defensible-2) with API 8790 / env |
| 5187 is not working Drive | **OK** | Inventory labels qapi preview **Not** / **NOT working Drive** |
| 5173 is not working Drive | **OK** | Inventory labels older baseline **Not** / **NOT working Drive** |

### Inventory conclusion

| Check | Result |
| --- | --- |
| Only **5188** marked as working Drive | **YES** |
| **5187** claimed as working Drive | **NO** (explicitly **NOT working Drive**) |
| **5173** claimed as working Drive | **NO** (explicitly **NOT working Drive**) |
| False working-Drive claim for 5187/5173 | **NONE found** |

---

## 2. Audit report scan (merge audit tree)

Searched `audit/merge-2026-08-03/**` for `5187`, `5173`, `5188`, `working Drive`, `drive.reachable`.

### Reports that discuss Drive ports

| Report | 5188 | 5187 | 5173 | Claims 5187/5173 as working Drive? |
| --- | --- | --- | --- | --- |
| `wave-1/W1-A08-drive-investigator.md` | Working (`ok:true`, `drive.reachable:true`) | **Not working** (503, `drive.reachable:false`) | **Not working** (IPv4 refuse; `[::1]` 503) | **No** |
| `wave-1/W1-A15-inventory-writer.md` | Working Drive (only) | Explicitly **NOT** working Drive | Explicitly **NOT** working Drive | **No** — states “No false claim that 5187 or 5173 is working Drive was present” |
| `wave-1/W1-A14-browser-verifier.md` | N/A (merge UI used **5201**) | N/A | **Not merge proof** (pixel-baseline worktree) | **No** |
| `wave-1/WAVE1-GATE.md` | — | — | — | No Drive URL claims |
| Other W1-A01…A16 (except above) | No Drive URL working-claim language for 5187/5173 | | | **No** |

### Key audit quotes (correct attribution)

**W1-A08 findings:**

1. Working Drive surface: `127.0.0.1:5188` + `8790` — `ok:true`, `drive.reachable:true`.
2. **5187 and 5173 are not the working Drive stack** — 503 / `drive.reachable:false` / `internal_error`.

**W1-A15:**

- Drive URLs: 5188 working; 5187/5173 **not** working Drive.
- Checklist: 5188 working; 5187 **NOT**; 5173 **NOT**.
- Result **PASS** on Drive exclusivity.

**W1-A14:**

- Merge UI origin **`http://127.0.0.1:5201`** — **not** 5173.
- Port **5173** is packet-platform-pixel-baseline and was **not** used as merge proof.

### Out-of-scope historical docs (not merge inventory / not merge audit)

Repo docs under `docs/v6/**`, old QA reports, and tooling notes often mention `localhost:5173` as a **generic Vite/dev shell** URL (policy redesign, V6 smoke). Those are **not** claims that 5173 is the **verified Google Drive / DefenCIble evidence** stack for this merge. Merge inventory and wave-1 audit docs do **not** promote 5173 as working Drive.

### Audit conclusion

| Check | Result |
| --- | --- |
| False claim “5187 is working Drive” in merge inventory/audit | **NONE** |
| False claim “5173 is working Drive” in merge inventory/audit | **NONE** |
| Consistent “only 5188 + 8790” attribution | **YES** (inventory + W1-A08 + W1-A15) |

---

## 3. Optional live health probes (2026-08-03 re-check)

Independent re-probe of the same health route used by W1-A08:

`GET /api/calendar/evidence/health`

### TCP listeners

| Port | Local address | PID | Process (command line summary) |
| --- | --- | --- | --- |
| **5188** | `127.0.0.1` | 40920 | Vite from **dirty root** `Policies_and_Procedures_V2` (`--port 5188 --strictPort`) |
| **5187** | `127.0.0.1` | 33068 | Vite from **`qapi-uiux-discovery`** worktree (`--port 5187 --strictPort`) |
| **5173** | `::1` only | 26000 | Vite from **`packet-platform-pixel-baseline`** (`--port 5173 --strictPort`) |
| **8790** | `::` | 37840 | Express `server/index.ts` via tsx from **dirty root** |

### Health results

| URL | HTTP | `ok` | `drive.reachable` | Verdict |
| --- | --- | --- | --- | --- |
| `http://127.0.0.1:5188/api/calendar/evidence/health` | **200** | `true` | **`true`** | **Working Drive** (matches inventory) |
| `http://127.0.0.1:8790/api/calendar/evidence/health` | **200** | `true` | **`true`** | Working Drive **API** |
| `http://127.0.0.1:5187/api/calendar/evidence/health` | **503** | `false` | **`false`** (`error: "internal_error"`) | **NOT working Drive** |
| `http://127.0.0.1:5173/api/calendar/evidence/health` | **000** (connect fail) | — | — | IPv4 **refused** — not working Drive |
| `http://[::1]:5173/api/calendar/evidence/health` | **503** | `false` | **`false`** (`error: "internal_error"`) | **NOT working Drive** |

### Working body (5188 / 8790) — truncated shape

```json
{
  "ok": true,
  "enabled": true,
  "provider": "google_drive_calendar",
  "sharedDriveId": "0AMhwVb2RmU-fUk9PVA",
  "rootFolderId": "0AMhwVb2RmU-fUk9PVA",
  "drive": { "reachable": true, "rootId": "0AMhwVb2RmU-fUk9PVA" }
}
```

### Non-working body (5187 and `[::1]:5173`)

```json
{
  "ok": false,
  "enabled": true,
  "provider": "google_drive_calendar",
  "sharedDriveId": "0AMhwVb2RmU-fUk9PVA",
  "rootFolderId": "0AMhwVb2RmU-fUk9PVA",
  "drive": { "reachable": false, "error": "internal_error" }
}
```

### Probe conclusion

Live state **matches** inventory and W1-A08:

- **Only** 5188 (fronting 8790) is the working Drive web surface.
- **5187** and **5173** are **not** working Drive URLs (503 / refused / `drive.reachable:false`).

---

## 4. Regression matrix

| Risk | Doc claim | Live probe | Status |
| --- | --- | --- | --- |
| Agents/users treat **5173** as working Drive | Inventory: **NOT working Drive**; W1-A14: not merge proof | 503 / IPv4 refuse | **No regression** |
| Agents/users treat **5187** as working Drive | Inventory: **NOT working Drive** | 503, `drive.reachable:false` | **No regression** |
| Inventory implies multiple working Drive ports | Explicit “**only** port 5188” | Only 5188+8790 healthy | **No regression** |
| Inventory wrong about 5188 | Claims working with env + 8790 | HTTP 200, `ok:true`, `drive.reachable:true` | **Confirmed correct** |

---

## 5. Findings

1. **No wrong-URL documentation regression** in merge inventory or wave-1 audit reports: nothing presents **5187** or **5173** as a working Drive URL.
2. Inventory correctly designates **only `http://127.0.0.1:5188/evidence`** (+ defensible-2, API **8790**, env-backed) as working Drive.
3. Independent health re-probe (this agent) confirms 5188/8790 healthy and 5187/5173 **not** healthy for Drive.
4. Residual risk is **operator habit** (default Vite 5173, qapi UI on 5187), not inventory wording — inventory already warns against treating those ports as Drive.

## 6. Result

**PASS**

Criteria met:

- [x] Searched inventory + audit reports for “5187/5173 = working Drive” claims — **none found** (all correct **NOT working Drive**).
- [x] Inventory marks **only 5188** as working Drive.
- [x] Optional probes show 5187/5173 are **not** working Drive (503 / connect fail / `drive.reachable:false`).

## 7. Evidence paths

| Artifact | Path |
| --- | --- |
| Inventory | `MERGE_INVENTORY_2026-08-03.md` |
| Drive investigation (Wave 1) | `audit/merge-2026-08-03/wave-1/W1-A08-drive-investigator.md` |
| Inventory writer (Wave 1) | `audit/merge-2026-08-03/wave-1/W1-A15-inventory-writer.md` |
| Browser verifier (5173 not merge proof) | `audit/merge-2026-08-03/wave-1/W1-A14-browser-verifier.md` |
| This report | `audit/merge-2026-08-03/wave-2/W2-QA08-wrong-url-regression-qa.md` |
