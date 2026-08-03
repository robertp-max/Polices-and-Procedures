# W2-QA14 Browser Visual QA — merge-local-app-surfaces-2026-08-03

| Field | Value |
| --- | --- |
| Agent | **W2-QA14 (Browser Visual QA)** — independent of W1-A14 |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Commit | `5a24e94121f2e1872c454cac618e49c2884eb583` (`5a24e941 chore(audit): complete wave-1 reports gate and remaining browser evidence`) |
| Method | Playwright Chromium (local `playwright`) headless — desktop **1440×900** + mobile **390×844** |
| Merge UI origin | **`http://127.0.0.1:5201`** (this worktree Vite only — **not** 5173) |
| EHR static origin | **`http://127.0.0.1:5191`** |
| **Overall** | **PASS** (visible product UI on all critical routes; residuals documented, not identity-blocking) |

> **Rule honored:** HTTP 200 SPA shell alone is **not** accepted. Every critical route has screenshot + visible identity text/selectors. Port **5173** is `packet-platform-pixel-baseline` and was **not** used as merge proof.

---

## 1. Servers used (PID / cmdline / cwd / branch)

| Port | PID | Cmdline (summary) | CWD / source | Branch/commit | Role |
| --- | --- | --- | --- | --- | --- |
| **5201** | **43072** | `node …\merge-local-app-surfaces-2026-08-03\node_modules\…\vite.js --host 127.0.0.1 --port 5201 --strictPort` | Merge worktree (parent `cmd.exe` 48564 launched Vite in this tree) | `codex/merge-local-app-surfaces-2026-08-03` @ `5a24e941…` | **Primary merge UI proof** |
| **5191** | **33276** | `python.exe -m http.server 5191 --bind 127.0.0.1` | Serves content **byte-equal** to worktree `apps/ehr-prototype-static/index.html` (SHA256 `0C101E08…EF03F88` match local↔served) | Pre-existing mirror of merge tree static EHR | **EHR static** |
| 5173 | 26000 | Vite from `packet-platform-pixel-baseline` | **Other** worktree | **Not merge proof** | Documented only — unused for assertions |

**No unrelated user servers were killed.** All merge-route proof used **5201 only**.

---

## 2. Browser proof matrix

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/reception` desktop visible Reception + workspace launcher cards | **PASS** | `W2-QA14-reception-desktop.png` |
| 2 | `/reception` mobile (390×844) identity | **PASS** | `W2-QA14-reception-mobile.png` + DOM identity tokens |
| 3 | `/compliance` desktop CES UI | **PASS** | `W2-QA14-compliance-desktop.png` |
| 4 | `/compliance` mobile CES UI | **PASS** | `W2-QA14-compliance-mobile.png` |
| 5 | `/evidence` desktop DefenCIble packet studio | **PASS** | `W2-QA14-evidence-desktop.png` |
| 6 | `/evidence` mobile | **PASS** | `W2-QA14-evidence-mobile.png` |
| 7 | `/evidence/defensible-2` desktop | **PASS** | `W2-QA14-evidence-defensible-2-desktop.png` |
| 8 | `/evidence/defensible-2` mobile | **PASS** | `W2-QA14-evidence-defensible-2-mobile.png` |
| 9 | EHR static title + full prototype UI | **PASS** | Title exact; `W2-QA14-ehr-static.png` |
| 10 | EHR network: **no** policy API / auth / backend integration | **PASS** | 0 foreign origins; 0 hits to 5201/5173/8787/cognito |
| 11 | Console / failed requests logged per route | **PASS (logged)** | Residuals below; identity not blocked |
| 12 | Layout breakage review | **PASS** (notes) | No horizontal page overflow; soft notes only |

Machine log: `audit/merge-2026-08-03/evidence/W2-QA14-playwright-results.json`  
Script: `audit/merge-2026-08-03/evidence/w2-qa14-playwright-visual.mjs`

---

## 3. Route-by-route findings

### 3.1 `/reception` desktop — **PASS**

- Final URL: `http://127.0.0.1:5201/reception`
- Demo session chrome: **Demo User / Signed in**
- Visible: **WELCOME / Good afternoon**, **WORKSPACE LAUNCHER**, cards **Compliance**, **Journey**, **Governing Body**, **Find Home Care**, **EHR Prototype**
- EHR card shows destination **`http://127.0.0.1:5191`** and **Open EHR**
- Find Home Care is a **separate** card with `/find-home-care` / Open Finder
- Console errors: **none**
- Failed network: **none**
- Layout: `vw=1440` `scrollW=1440` — no horizontal overflow
- Screenshot: `audit/merge-2026-08-03/evidence/W2-QA14-reception-desktop.png` (1440×900)

### 3.2 `/reception` mobile — **PASS**

- Final URL: `http://127.0.0.1:5201/reception`
- Visible: **Reception / SECURE WORKSPACE ENTRY**, search, Demo User, welcome rail, workspace launcher copy
- Identity tokens in DOM (Playwright text probe): Reception, Compliance, Journey, EHR Prototype, Find Home Care (`bodyLen≈1490`)
- Console: **none** · Failed network: **none**
- Layout: `scrollW=390` — no horizontal overflow
- **Note:** Capture is viewport-height shell (390×844); app uses fixed-height shell so lower launcher cards may sit in an inner scroller rather than document full-page. Identity still proven via DOM text + partial visual.
- Screenshot: `W2-QA14-reception-mobile.png`

### 3.3 `/compliance` desktop — **PASS**

- Final URL: `http://127.0.0.1:5201/compliance`
- Identity: **CES OVERVIEW**, **Care Indeed Compliance Execution Sprint**, **OPEN SPRINT DASHBOARD**, tabs Sprint Home / CES Calendar / Control Register, metric tiles (Active Sprint, Open Tasks, etc.)
- Console: **none** · Network fails: **none**
- Layout: clean full desktop frame; no overflow
- Screenshot: `W2-QA14-compliance-desktop.png`

### 3.4 `/compliance` mobile — **PASS** (soft layout note)

- Same CES identity; hamburger + profile chrome; primary CTA visible
- Tab strip **clips** trailing label (`CONTROL REGISTER` → `CON…`) — expected compact-header behavior, **not** document-level horizontal overflow (`scrollW=390`)
- Fixed chrome layers (hamburger, profile, Brad chat, settings, off-canvas drawer nodes in DOM): **not** a broken open-drawer overlay in the screenshot (content is readable; drawer not covering main)
- Console: **none** · Network: **none**
- Screenshot: `W2-QA14-compliance-mobile.png`

### 3.5 `/evidence` desktop — **PASS** (console residual)

- Final URL: `http://127.0.0.1:5201/evidence`
- Identity: DefenCIble nav (**DRIVE / PACKETS / PACKET 2.0 / EDIT PACKET / ECIGN**), heading **1 · SELECT A PACKET TEMPLATE**, six packet template cards (Patient Admission, QAPI Quarterly/Monthly, Governing Body, Patient Safety, Custom Meeting)
- **Not** a blank SPA shell
- Console residual: **503** ×2 → `GET http://127.0.0.1:5201/api/calendar/evidence/health` (Vite proxies `/api` toward baseline API; path unavailable). UI still fully rendered.
- Failed transport (`requestfailed`): **none** (503s completed as HTTP responses)
- Layout: no horizontal overflow
- Screenshot: `W2-QA14-evidence-desktop.png`

### 3.6 `/evidence` mobile — **PASS** (console residual)

- Same packet-template identity; stacked cards; DRIVE/PACKETS/PACKET 2.0 tabs
- Same 503 residual on calendar evidence health ×2
- No horizontal overflow; readable stacked layout
- Screenshot: `W2-QA14-evidence-mobile.png`

### 3.7 `/evidence/defensible-2` desktop — **PASS** (console residual)

- Final URL: `http://127.0.0.1:5201/evidence/defensible-2`
- Renders the **same** DefenCIble packet studio surface as `/evidence` (template picker identity: DefenCIble / Packet / Source tokens; bodyLen≈794)
- Same residual **503** ×2 on `/api/calendar/evidence/health`
- Screenshot: `W2-QA14-evidence-defensible-2-desktop.png`  
  *(Pixel-identical class of UI to evidence-desktop in this merge state.)*

### 3.8 `/evidence/defensible-2` mobile — **PASS** (console residual)

- Same stacked packet studio as evidence mobile
- Same 503 residual
- Screenshot: `W2-QA14-evidence-defensible-2-mobile.png`

### 3.9 EHR static `http://127.0.0.1:5191/` — **PASS**

- **`document.title` = `Care Indeed Home Health EHR Prototype`** (exact match)
- Full prototype UI: Care Indeed Home Health chrome, patient **Elena Martinez**, SOC/orders/timeline, synthetic demo chart — **not** empty shell
- Core assets **200** (CSS/JS/fonts), including:
  - `/assets/index-B6csGzFL.css`
  - `/assets/layout-segment-context-CXNA_Ckw.js`
  - `/assets/rolldown-runtime-S-ySWqyJ.js`
  - `/assets/query-D8Wk3mvj.js`, `page-DYDiOo50.js`, `index-CcITSQVe.js`, `framework-CXnKph_e.js`
  - Geist fonts under `/assets/_vinext_fonts/…`
- Content fingerprint: served `index.html` **SHA256-equal** to merge worktree `apps/ehr-prototype-static/index.html`
- **Network isolation (policy integration):**  
  - Total requests ≈ **21**  
  - **foreignOrigins = 0**  
  - **No** requests to `5201` / `5173` / `8787` / `3000`  
  - **No** `/api/*` policy routes  
  - **No** Cognito / AWS auth / careindeed.com backend traffic  
- Residual non-blocking 404s (static export residue, **not** policy-app integration):
  - `/cdn-cgi/challenge-platform/scripts/jsd/main.js` → 404 (+ `net::ERR_ABORTED`)
  - `/.rsc?_rsc=…` → 404 (RSC probe under plain `python -m http.server`)
- Screenshot: `W2-QA14-ehr-static.png` (1440×1334 fullPage)

---

## 4. Console errors & failed requests (per route)

| Route | Console errors | HTTP ≥400 | Transport fails (`requestfailed`) |
| --- | --- | --- | --- |
| reception-desktop | none | none | none |
| reception-mobile | none | none | none |
| compliance-desktop | none | none | none |
| compliance-mobile | none | none | none |
| evidence-desktop | 503 resource ×2 (`/api/calendar/evidence/health`) | 503 ×2 same URL | none |
| evidence-mobile | 503 ×2 same | 503 ×2 | none |
| evidence-defensible-2-desktop | 503 ×2 same | 503 ×2 | none |
| evidence-defensible-2-mobile | 503 ×2 same | 503 ×2 | none |
| ehr-static | 404 residual (cdn-cgi, `.rsc`) | 404 ×2 | `cdn-cgi/.../main.js` `ERR_ABORTED` |

### Residual classification

| Residual | Severity for merge visual gate | Notes |
| --- | --- | --- |
| Evidence calendar health **503** | **Non-blocking** for visual/identity | Known when merge Vite proxies `/api` to non-merge baseline API without that route. UI still renders full DefenCIble studio. |
| EHR `cdn-cgi` / `.rsc` **404** | **Non-blocking** | Static export leftovers; **no** policy-app coupling. |
| Mobile fixed-layer count ≥4 | **Info only** | App chrome FABs + off-canvas drawer nodes remain `position:fixed` in DOM when closed. Screenshots show usable closed state. |
| Mobile tab label clip (`CON…`) | **Info / polish** | Compact header truncation; no page-level `overflow-x`. |

These residuals **do not** erase visible identity proof and do **not** indicate new EHR↔policy API integration.

---

## 5. Layout breakage notes

| Surface | Horizontal overflow | Severe breakage | Notes |
| --- | --- | --- | --- |
| reception desktop | No (`scrollW=vw`) | No | Clean two-column welcome + launcher grid |
| reception mobile | No | No | Fixed-height shell; lower cards may need inner scroll |
| compliance desktop | No | No | Metric grid + highlight cards intact |
| compliance mobile | No | Soft | Tab labels truncate; main content readable |
| evidence desktop | No | No | 6 template cards in grid |
| evidence mobile | No | No | Stacked templates; readable |
| evidence/defensible-2 desktop | No | No | Same studio surface |
| evidence/defensible-2 mobile | No | No | Same stacked studio |
| ehr-static | No | No | Dense prototype dashboard fully painted |

**No layout FAIL** for merge visual gate. Soft mobile chrome/truncation notes only.

---

## 6. Screenshots index

| File | Subject | Size |
| --- | --- | --- |
| `audit/merge-2026-08-03/evidence/W2-QA14-reception-desktop.png` | Reception workspace launcher | 1440×900 |
| `audit/merge-2026-08-03/evidence/W2-QA14-reception-mobile.png` | Reception mobile | 390×844 |
| `audit/merge-2026-08-03/evidence/W2-QA14-compliance-desktop.png` | CES Compliance Execution Sprint | 1440×900 |
| `audit/merge-2026-08-03/evidence/W2-QA14-compliance-mobile.png` | CES mobile | 390×844 |
| `audit/merge-2026-08-03/evidence/W2-QA14-evidence-desktop.png` | DefenCIble packet templates | 1440×900 |
| `audit/merge-2026-08-03/evidence/W2-QA14-evidence-mobile.png` | Evidence mobile | 390×844 |
| `audit/merge-2026-08-03/evidence/W2-QA14-evidence-defensible-2-desktop.png` | Defensible-2 studio | 1440×900 |
| `audit/merge-2026-08-03/evidence/W2-QA14-evidence-defensible-2-mobile.png` | Defensible-2 mobile | 390×844 |
| `audit/merge-2026-08-03/evidence/W2-QA14-ehr-static.png` | EHR prototype Elena Martinez | 1440×1334 |
| `audit/merge-2026-08-03/evidence/W2-QA14-playwright-results.json` | Full machine log | — |
| `audit/merge-2026-08-03/evidence/w2-qa14-playwright-visual.mjs` | Repro script | — |

---

## 7. Overall verdict

### **PASS**

Critical visual/identity proofs (merge worktree **5201** + EHR **5191** only):

1. **`/reception`** desktop + mobile show real Reception UI (not blank SPA); workspace cards / identity tokens present.  
2. **`/compliance`** desktop + mobile show CES Compliance Execution Sprint product UI.  
3. **`/evidence`** and **`/evidence/defensible-2`** desktop + mobile show DefenCIble packet studio (template picker), not empty shells.  
4. **EHR static** title is exactly **`Care Indeed Home Health EHR Prototype`**; full prototype chart UI screenshot captured.  
5. **EHR network** shows **no** policy API / auth / backend / shared-state integration to the policy app (0 foreign origins).  
6. Console/network residuals (evidence health 503; EHR cdn-cgi/RSC 404) are **logged** and classified non-blocking for this visual gate.  
7. Layout: **no** document-level horizontal overflow or blank/collapsed main frames on critical routes.

### Explicit non-claims

- Did **not** use port **5173** (pixel-baseline worktree) as merge proof.  
- Did **not** treat HTTP 200 alone as pass.  
- Did **not** clear evidence calendar health 503 (environment residual; UI still valid).  
- Automated script exit code reported `FAIL` on a strict raw-asset filter that counted EHR `cdn-cgi` 404 as assetFail — **manual visual gate overrides that** as non-blocking residual (core `/assets/*` all 200; isolation holds). Gate criterion for this agent is **browser visual identity + EHR isolation**, which **PASS**.

---

*End of W2-QA14 report.*
