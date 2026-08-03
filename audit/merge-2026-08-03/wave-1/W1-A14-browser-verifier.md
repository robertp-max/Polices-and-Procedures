# W1-A14 Browser Verifier — merge-local-app-surfaces-2026-08-03

| Field | Value |
| --- | --- |
| Agent | **W1-A14 (Browser Verifier)** |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Commit | `f99106df6f76733d73b079b51e65d1d38432c6dc` |
| Method | Playwright Chromium (`npx`/local `playwright` 1.59.1) + code inspection |
| Merge UI origin | **`http://127.0.0.1:5201`** (dedicated Vite from **this** worktree — **not** 5173) |
| EHR static origin | **`http://127.0.0.1:5191`** |
| **Overall** | **PASS** (visible identity proof on all critical routes; residuals documented) |

> **Rule honored:** HTTP 200 SPA shell alone is **not** accepted. Every critical route has screenshot + visible text/selectors. Port **5173** is packet-platform-pixel-baseline and was **not** used as merge proof. Port **5194** is Fable EHR_Prototype and was **not** used as merge proof.

---

## 1. Servers used (PID / cmdline / purpose)

| Port | PID | Cmdline (summary) | CWD / source | Branch/commit relevance | Role in this proof |
| --- | --- | --- | --- | --- | --- |
| **5201** | **43072** | `node …\merge-local-app-surfaces-2026-08-03\node_modules\…\vite.js --host 127.0.0.1 --port 5201 --strictPort` | Merge worktree | Same branch `codex/merge-local-app-surfaces-2026-08-03` @ `f99106df…` | **Primary merge UI proof** (started by this agent) |
| **5191** | **33276** | `python.exe -m http.server 5191 --bind 127.0.0.1` | Serves content **byte-equal** to worktree `apps/ehr-prototype-static/index.html` (40405 bytes, title + CSS hash match) | Pre-existing; fingerprint matched merge tree mirror | **EHR static mirror** |
| 5173 | 26000 | Vite from `packet-platform-pixel-baseline` | Other worktree | **Not merge proof** | Documented only — unused for assertions |
| 5194 | 46512 | Vite from `EHR_Prototype\apps\ehr-prototype` | Fable prototype | **Not merge proof** | Documented only — unused |
| 8787 | 24128 | `tsx` API from **packet-platform-pixel-baseline** `server/index.ts` | Other worktree API | Incidental proxy target for Vite `/api` | Explains evidence 503 residual |

**No unrelated user servers were killed.** Vite on 5201 was started fresh for this run.

---

## 2. Code assertions (auth default + EHR launcher)

### 2.1 Default authenticated route is `/reception`

Router index redirect:

```38:38:src/v6/routing/router.tsx
      { index: true, element: <Navigate replace to="/reception" /> },
```

Safe post-login fallback:

```9:9:src/v6/utils/safeRedirect.ts
export const BRAD_DEFAULT_ROUTE = '/reception';
```

`RequireAuth` unauthenticated path:

```28:30:src/auth/RequireAuth.tsx
  if (status === 'unauthenticated') {
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate replace to={`/login?returnTo=${returnTo}`} />;
```

Local **demo bypass** (`src/auth/bypass.ts`): under Vite `DEV` on `127.0.0.1` / `localhost`, session status becomes `demo`, so protected routes render without real Cognito.

### 2.2 EHR launcher target (exact)

```101:106:src/v6/screens/pageviews/ReceptionScreen.tsx
    id: 'ehr-prototype',
    name: 'EHR Prototype',
    ...
    route: 'http://127.0.0.1:5191',
    external: true,
```

External cards render as `<a href={lastRoute} target="_blank" rel="noreferrer">` — **no trailing slash** in the coded URL.

Find Home Care is a **separate** internal route `/find-home-care` (not external 5191).

---

## 3. Browser proof matrix

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | `/reception` visible Reception UI + workspace launcher cards (Compliance, Journey, EHR Prototype, Find Home Care) | **PASS** | `evidence/W1-A14-reception-desktop.png` |
| 2 | Default auth route `/reception` (code + runtime) | **PASS** | `/` → `http://127.0.0.1:5201/reception` under demo; code `Navigate` + `BRAD_DEFAULT_ROUTE` |
| 3 | Find Home Care **vs** EHR Prototype **separate controls** | **PASS** | Two distinct cards/CTAs; FHC → `/find-home-care`; EHR → external 5191 |
| 4 | EHR launcher href **exactly** `http://127.0.0.1:5191` | **PASS** | Playwright: `href=http://127.0.0.1:5191`, `target=_blank`, count_no_slash=1, count_slash=0; card label shows `http://127.0.0.1:5191` |
| 5 | EHR static title + assets | **PASS** | Title `Care Indeed Home Health EHR Prototype`; core `/assets/*` css/js **all 200** |
| 6 | EHR mirror has **no** new API/auth/backend/shared-state integration to policy app | **PASS** | 0 foreign-origin requests; 0 hits to 5201/5173/8787/auth/cognito |
| 7 | `/compliance`, `/evidence`, `/evidence/defensible-2` identity (not blank SPA) | **PASS** | Screenshots + text/hash selectors |
| 8 | Desktop + mobile `/reception` | **PASS** | Desktop 1440×900 + mobile 390×844 screenshots |
| 9 | Console / failed network logged per route | **PASS (logged)** | JSON results; residuals below |

Machine-readable run log:  
`audit/merge-2026-08-03/evidence/W1-A14-playwright-results.json`  
Script:  
`audit/merge-2026-08-03/evidence/w1-a14-playwright-verify.mjs`

---

## 4. Route-by-route findings

### 4.1 `/reception` (desktop) — **PASS**

- Final URL: `http://127.0.0.1:5201/reception`
- Demo session: **Demo User / Signed in** (local bypass)
- Visible cards: **Compliance**, **Journey**, **Governing Body**, **Find Home Care**, **EHR Prototype**
- CTAs: Open Compliance, Open Journey, Open Finder, Open EHR
- EHR card shows destination text **`http://127.0.0.1:5191`** and is an external `<a target="_blank">`
- Console errors: **none**
- Failed network: **none**
- Screenshot: `audit/merge-2026-08-03/evidence/W1-A14-reception-desktop.png`

### 4.2 Auth / login / safeRedirect — **PASS (documented)**

Under local Vite dev on 127.0.0.1, demo bypass means protected routes do **not** force login. Additional probe:

- `GET /login?returnTo=%2Fcompliance` → login UI visible (“Welcome to Care Indeed”, SIGN IN SECURELY)
- Screenshot: `W1-A14-login-returnTo.png`
- Code: unauthenticated → `/login?returnTo=…`; post-login safe path via `safeReturnTo()` → default **`/reception`**
- Runtime root: `/` → **`/reception`** (`W1-A14-root-redirect.png`)

True production-shaped unauthenticated redirect was **not** force-tested (would require production build or non-bypass host); code path is verified.

### 4.3 `/compliance` — **PASS**

- Final URL: `http://127.0.0.1:5201/compliance`
- Identity text: **CES Overview**, **Care Indeed Compliance Execution Sprint**, **Open Sprint Dashboard**, **Sprint Home**, sprint metrics
- Console errors: **none**
- Screenshot: `W1-A14-compliance.png`

### 4.4 `/evidence` — **PASS** (identity, residual console)

- Final URL: `http://127.0.0.1:5201/evidence`
- DOM: `data-hash-id="defensible-2"`
- Visible identity: **DEFENCIBLE** nav group, **DRIVE / PACKETS / PACKET 2.0 / EDIT PACKET / ECIGN**, heading **1 · SELECT A PACKET TEMPLATE**, templates (Patient Admission, QAPI Quarterly/Monthly, Governing Body, Patient Safety, Custom Meeting)
- **Not** a blank shell
- Console residual: **503** ×2 on `GET /api/calendar/evidence/health` (Vite proxies `/api` → existing :8787 baseline API; path unavailable). UI still fully rendered.
- Screenshot: `W1-A14-evidence.png`

### 4.5 `/evidence/defensible-2` — **PASS** (identity, residual console)

- Final URL: `http://127.0.0.1:5201/evidence/defensible-2`
- Same DefenCIble packet studio surface (`data-hash-id="defensible-2"`) — consistent with route registry mapping both paths to defensible studio template
- Same residual 503 on calendar evidence health
- Screenshot: `W1-A14-evidence-defensible-2.png`

### 4.6 EHR static `http://127.0.0.1:5191/` — **PASS**

- `document.title` = **`Care Indeed Home Health EHR Prototype`**
- Full EHR prototype UI: Care Indeed Home Health chrome, patient **Elena Martinez**, SOC/orders/timeline — synthetic demo chart
- **Core assets (all 200):**
  - `/assets/index-B6csGzFL.css`
  - `/assets/layout-segment-context-CXNA_Ckw.js`
  - `/assets/rolldown-runtime-S-ySWqyJ.js`
  - `/assets/query-D8Wk3mvj.js`
  - `/assets/page-DYDiOo50.js`
  - `/assets/index-CcITSQVe.js`
  - `/assets/framework-CXnKph_e.js`
  - Geist font woff2 under `/assets/_vinext_fonts/…` (200)
- Content fingerprint: live HTML **byte-equal** to merge worktree `apps/ehr-prototype-static/index.html`
- **Network isolation:** total requests ~21, **foreignOrigins=0**, **no** requests to policy app ports 5201/5173, **no** `/api/*`, **no** auth/cognito/careindeed.com backends
- Residual non-blocking 404s:
  - `/cdn-cgi/challenge-platform/scripts/jsd/main.js` (Cloudflare challenge residue baked into static export)
  - occasional `/.rsc?…` RSC probe 404 under plain `python -m http.server`
- Screenshot: `W1-A14-ehr-static.png`

### 4.7 `/reception` mobile (390×844) — **PASS**

- Header **Reception / SECURE WORKSPACE ENTRY**
- Demo User signed in; workspace launcher copy present
- Identity tokens found: Reception, Compliance, Find Home Care, EHR Prototype
- Screenshot: `W1-A14-reception-mobile.png`

---

## 5. Network request inventory (EHR mirror)

Policy-app integration scan on EHR load: **none found**.

Representative request classes observed on 5191 only:

| Class | Example | Status |
| --- | --- | --- |
| Document | `/` | 200 |
| CSS | `/assets/index-B6csGzFL.css` | 200 |
| JS modules | `/assets/index-CcITSQVe.js`, `framework-…`, `page-…`, `query-…`, etc. | 200 |
| Fonts | `/assets/_vinext_fonts/geist-…woff2` | 200 |
| Residual (not integration) | `/cdn-cgi/challenge-platform/scripts/jsd/main.js` | 404 |
| Residual (not integration) | `/.rsc?_rsc=…` | 404 |

**Conclusion:** EHR static mirror remains a **standalone** static prototype surface with **no new** API/auth/backend/shared-state wiring into the policy/compliance app.

---

## 6. Console / failed network summary

| Route | Console errors | Failed network |
| --- | --- | --- |
| reception-desktop | none | none |
| reception-mobile | none | none |
| root → reception | none | none |
| login?returnTo | none | none |
| compliance | none | none |
| evidence | 503 resource (health API) ×2 | none (HTTP 503 completed, not transport fail) |
| evidence/defensible-2 | 503 resource (health API) ×2 | none |
| ehr-static | 404 residual cdn-cgi / rsc | `cdn-cgi/.../main.js` net::ERR_ABORTED |

These residuals **do not** erase visible identity proof.

---

## 7. Screenshots index

| File | Subject |
| --- | --- |
| `audit/merge-2026-08-03/evidence/W1-A14-reception-desktop.png` | Reception workspace launcher (desktop) |
| `audit/merge-2026-08-03/evidence/W1-A14-reception-mobile.png` | Reception (mobile 390×844) |
| `audit/merge-2026-08-03/evidence/W1-A14-login-returnTo.png` | Login + returnTo query |
| `audit/merge-2026-08-03/evidence/W1-A14-root-redirect.png` | `/` → `/reception` |
| `audit/merge-2026-08-03/evidence/W1-A14-compliance.png` | CES Compliance Execution Sprint |
| `audit/merge-2026-08-03/evidence/W1-A14-evidence.png` | DefenCIble packet template UI |
| `audit/merge-2026-08-03/evidence/W1-A14-evidence-defensible-2.png` | Defensible-2 packet studio UI |
| `audit/merge-2026-08-03/evidence/W1-A14-ehr-static.png` | EHR static prototype (Elena Martinez chart) |
| `audit/merge-2026-08-03/evidence/W1-A14-playwright-results.json` | Full machine log |
| `audit/merge-2026-08-03/evidence/w1-a14-playwright-verify.mjs` | Repro script |

---

## 8. Overall verdict

### **PASS**

Critical identity proofs:

1. Merge Vite on **5201** (this worktree) serves real Reception UI with Compliance / Journey / Find Home Care / EHR Prototype cards.  
2. EHR external launcher is **`http://127.0.0.1:5191`** (no trailing slash), `target=_blank`.  
3. Find Home Care and EHR Prototype are **separate** controls.  
4. Default auth landing is **`/reception`** (router + `BRAD_DEFAULT_ROUTE` + runtime `/` redirect under demo).  
5. EHR static title and core assets load; UI is a full prototype, not empty shell.  
6. EHR static has **no** policy-app API/auth/shared-state integration.  
7. `/compliance`, `/evidence`, `/evidence/defensible-2` render identifiable product UI (screenshots).  
8. Desktop + mobile Reception screenshots captured.

### Residuals (non-blocking)

- Evidence routes call `/api/calendar/evidence/health` → **503** via incidental :8787 baseline API (not merge-specific; UI still works).  
- EHR static export still references Cloudflare `cdn-cgi` challenge script → local **404**.  
- Optional RSC `/.rsc` probe **404** under plain Python static server.

### Explicit non-claims

- Did **not** use port 5173 as merge proof.  
- Did **not** use port 5194 (Fable) as merge proof.  
- Did **not** kill unrelated user processes.  
- Real Cognito login success path not exercised (demo bypass on local Vite).

---

*End of W1-A14 report.*
