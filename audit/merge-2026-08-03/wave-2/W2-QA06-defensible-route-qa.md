# W2-QA06 DefenCIble Route QA — merge-local-app-surfaces-2026-08-03

| Field | Value |
| --- | --- |
| Agent | **W2-QA06 (DefenCIble Route QA)** — Wave 2, independent |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Commit | `5a24e94121f2e1872c454cac618e49c2884eb583` (`5a24e941`) |
| Method | Playwright Chromium 1.59.1 (local `node_modules/playwright`) + full-page screenshots + DOM/text identity |
| Merge UI origin | **`http://127.0.0.1:5201`** (Vite from **this** merge worktree — not 5173) |
| **Overall** | **PASS** (content identity proof on both DefenCIble routes) |

> **Rule honored:** HTTP 200 SPA shell alone is **not** accepted. PASS requires visible DefenCIble/packet identity content, `data-hash-id="defensible-2"`, screenshots, and logged console/network residuals. Port **5173** is `packet-platform-pixel-baseline` and was **not** used as merge proof.

---

## 1. Preview server identity (PID / cmdline / branch / commit)

| Port | PID | Parent / launcher | Cmdline | CWD / source | Branch @ commit | Role |
| --- | --- | --- | --- | --- | --- | --- |
| **5201** | **43072** | PPID 48564 (`cmd.exe`) ← 50204 (`npx vite`) | `node …\merge-local-app-surfaces-2026-08-03\node_modules\…\vite.js --host 127.0.0.1 --port 5201 --strictPort` | **Merge worktree** | `codex/merge-local-app-surfaces-2026-08-03` @ `5a24e941…` | **Primary merge UI proof** |
| 5201 (launcher) | 50204 | — | `npx-cli.js vite --host 127.0.0.1 --port 5201 --strictPort` | Spawns 43072 | Same | Wrapper only |
| 5173 | 26000 | — | Vite from `packet-platform-pixel-baseline` | Other worktree | **Not merge proof** | Documented only |
| 8787 | 24128 | — | `tsx` API from baseline | Other worktree API | Incidental `/api` proxy target | Explains 503 residual |

**Verified:** `netstat` shows `127.0.0.1:5201` LISTENING on PID **43072**.  
**HTTP probe:** `GET /evidence` → **200**; `GET /evidence/defensible-2` → **200**.  
**No unrelated user servers were killed.** Existing merge Vite on 5201 was reused.

---

## 2. Code map (route registry → DefenCIble studio)

Both paths register `hashId: 'defensible-2'` / evidence template:

```71:75:src/v6/routing/routeRegistry.ts
  { path: '/evidence', hashId: 'defensible-2', template: 'evidence', group: 'CES', title: 'DefenCIble', description: 'DefenCIble evidence packet studio for source selection, packet generation, preview, export, and Drive sync.' },
  ...
  { path: '/evidence/defensible-2', hashId: 'defensible-2', template: 'evidence', group: 'CES', title: 'Defensible 2.0', description: 'Live cloned DefenCIble view for side-by-side iteration.' },
```

Nav: DefenCIble dock → `/evidence` (`navigationManifest.ts` matchPaths include `/evidence` and `/evidence/defensible-2`).

---

## 3. Browser proof matrix

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/evidence` not blank SPA shell | **PASS** | bodyLen=794; full packet template grid |
| 2 | `/evidence` DefenCIble/packet identity | **PASS** | tokens + `data-hash-id="defensible-2"` ×1 |
| 3 | `/evidence/defensible-2` not blank SPA shell | **PASS** | bodyLen=794; same studio surface |
| 4 | `/evidence/defensible-2` DefenCIble/packet identity | **PASS** | same tokens + hash marker |
| 5 | Screenshots (visual identity) | **PASS** | `W2-QA06-evidence.png`, `W2-QA06-evidence-defensible-2.png` |
| 6 | Console / failed network logged | **PASS (logged)** | residual **503** on calendar health (UI still complete) |

Machine-readable run log:  
`audit/merge-2026-08-03/wave-2/W2-QA06-playwright-results.json`  

Script:  
`audit/merge-2026-08-03/wave-2/w2-qa06-playwright-defensible.mjs`  

Screenshots:  
- `audit/merge-2026-08-03/evidence/W2-QA06-evidence.png`  
- `audit/merge-2026-08-03/evidence/W2-QA06-evidence-defensible-2.png`

---

## 4. Route-by-route findings

### 4.1 `/evidence` — **PASS** (content identity)

| Field | Value |
| --- | --- |
| Final URL | `http://127.0.0.1:5201/evidence` |
| document.title | `Care Indeed Home Health` |
| `data-hash-id="defensible-2"` | **1** |
| `data-template="evidence"` | **1** |
| On `/login` | **false** (demo bypass on 127.0.0.1 Vite) |
| body length (normalized) | **794** |

**Visible identity tokens (DOM text):**

- `DEFENCIBLE`
- `SELECT A PACKET TEMPLATE`
- `PACKET 2.0`
- `DRIVE`
- `PACKETS`
- `EDIT PACKET`
- `ECIGN`

**Visible packet templates (screenshot + body preview):**

1. PATIENT ADMISSION PACKET  
2. QAPI QUARTERLY COMMITTEE MEETING  
3. QAPI MONTHLY COMMITTEE MEETING  
4. GOVERNING BODY / BOARD MEETING  
5. PATIENT SAFETY COMMITTEE  
6. CUSTOM MEETING PACKET  

**Chrome:** top tabs DRIVE / **PACKETS** (active) / PACKET 2.0 / EDIT PACKET / ECIGN; left dock with DefenCIble shield active.

**Not** a blank shell — full DefenCIble packet studio template-selection surface.

**Screenshot:** `audit/merge-2026-08-03/evidence/W2-QA06-evidence.png`

### 4.2 `/evidence/defensible-2` — **PASS** (content identity)

| Field | Value |
| --- | --- |
| Final URL | `http://127.0.0.1:5201/evidence/defensible-2` |
| document.title | `Care Indeed Home Health` |
| `data-hash-id="defensible-2"` | **1** |
| Identity tokens | Same 7 tokens as `/evidence` |
| body length | **794** (same studio surface) |

Consistent with route registry: both paths map to `hashId: 'defensible-2'` / evidence template. Visual screenshot matches `/evidence` packet studio (template grid + tabs).

**Screenshot:** `audit/merge-2026-08-03/evidence/W2-QA06-evidence-defensible-2.png`

---

## 5. Console errors / failed network

### Per route

| Route | Console errors | `requestfailed` | HTTP ≥400 responses |
| --- | --- | --- | --- |
| `/evidence` | 2 × “Failed to load resource: … 503” | **none** | `GET /api/calendar/evidence/health` → **503** ×2 |
| `/evidence/defensible-2` | same | **none** | same `503` ×2 |

### Residual analysis

- **Path:** `http://127.0.0.1:5201/api/calendar/evidence/health`
- **Status:** 503 Service Unavailable
- **Cause (same as W1-A14):** Vite on 5201 proxies `/api` to the pre-existing baseline API on **:8787** (`packet-platform-pixel-baseline` `server/index.ts`). That path is unavailable / not healthy on the proxied backend.
- **UI impact:** **None for identity.** Packet studio fully rendered with all templates and DefenCIble chrome.
- **Classification:** **Residual non-blocking** (logged, does not fail content-identity PASS).

No other failed document/script/stylesheet loads were recorded. No console warnings.

---

## 6. Identity proof summary (PASS criteria)

| Criterion | `/evidence` | `/evidence/defensible-2` |
| --- | --- | --- |
| Substantial body text (not empty root) | ✅ 794 chars | ✅ 794 chars |
| DefenCIble nav / brand token | ✅ `DEFENCIBLE` | ✅ `DEFENCIBLE` |
| Packet studio chrome (tabs) | ✅ DRIVE/PACKETS/PACKET 2.0/EDIT PACKET/ECIGN | ✅ same |
| Packet template selection UI | ✅ “1 · SELECT A PACKET TEMPLATE” + 6 templates | ✅ same |
| DOM hash marker | ✅ `data-hash-id="defensible-2"` | ✅ same |
| Screenshot visual proof | ✅ | ✅ |
| Not redirected to blank/`/login` | ✅ stayed on route | ✅ stayed on route |

**8/8 critical Playwright checks PASS.** Overall: **PASS**.

---

## 7. Artifacts checklist

| Artifact | Path |
| --- | --- |
| This report | `audit/merge-2026-08-03/wave-2/W2-QA06-defensible-route-qa.md` |
| Playwright results JSON | `audit/merge-2026-08-03/wave-2/W2-QA06-playwright-results.json` |
| Playwright script | `audit/merge-2026-08-03/wave-2/w2-qa06-playwright-defensible.mjs` |
| Screenshot `/evidence` | `audit/merge-2026-08-03/evidence/W2-QA06-evidence.png` |
| Screenshot `/evidence/defensible-2` | `audit/merge-2026-08-03/evidence/W2-QA06-evidence-defensible-2.png` |

---

## 8. Verdict

**PASS** — On merge worktree Vite **PID 43072 @ `127.0.0.1:5201`**, branch `codex/merge-local-app-surfaces-2026-08-03` @ `5a24e941…`, both **`/evidence`** and **`/evidence/defensible-2`** render live DefenCIble packet studio identity (not a blank SPA shell), proven by Playwright DOM/text tokens, `data-hash-id="defensible-2"`, and full-page screenshots. Residual **503** on `/api/calendar/evidence/health` is documented and non-blocking for route identity.
