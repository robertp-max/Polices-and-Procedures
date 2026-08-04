# R02 — ReceptionScreen URL constant drift

| Field | Value |
| --- | --- |
| Agent | **R02** (Reception URL drift) |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| File | `src/v6/screens/pageviews/ReceptionScreen.tsx` |
| HEAD | `dae8e24b` — `feat(compliance): Vendor + Contractor management UI under Registry & Contracts (UI only)` |
| Scope | Review only — no product edits |
| Overall | **PARTIAL** |

---

## 1. Mission

1. Compare **HEAD vs working tree** ReceptionScreen launcher constants for:
   - EHR (**5194** vs original **5191**)
   - Journey
   - Connect
   - Find A Home Care / FAHC Cloud Run
2. List **uncommitted vs committed**.
3. Note divergence from the **original 32-agent merge contract**.
4. Verdict: **PASS / PARTIAL / FAIL**.

---

## 2. Working-tree status (this file)

| Item | Value |
| --- | --- |
| Git status | `M src/v6/screens/pageviews/ReceptionScreen.tsx` (modified, unstaged vs HEAD) |
| Diffstat vs HEAD | `35 insertions(+), 30 deletions(-)` |
| URL-constant lines changed in dirty tree? | **Yes — Journey + Connect only** |
| EHR / FAHC / Governing Body constants dirty? | **No** (same as HEAD) |

---

## 3. Constant matrix (authoritative)

### 3.1 Top-level URL / route constants

| Constant | Original 32-agent contract (merge QA era) | HEAD `dae8e24b` (committed) | Working tree (uncommitted) | HEAD vs WT |
| --- | --- | --- | --- | --- |
| `EHR_PROTOTYPE_URL` | `http://127.0.0.1:5191` (inline `route`, `external: true`) — **static mirror** | `'http://127.0.0.1:5194'` | `'http://127.0.0.1:5194'` | **SAME** |
| `JOURNEY_URL` | In-app SPA: `'/journey?tab=home'` (no external host) | `'http://127.0.0.1:5193/journey/training?persona=taylor-rn'` | `'http://127.0.0.1:5193/journey?persona=taylor-rn'` | **DRIFT** (path) |
| `CONNECT_URL` | **Absent** (no Connect workspace card) | `'http://127.0.0.1:5192/'` | `'http://127.0.0.1:5192/?view=home'` | **DRIFT** (query) |
| `FIND_HOME_CARE_PROVIDER_PORTAL_URL` | In-app prototype: `'/find-home-care'` | `'https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login'` | same as HEAD | **SAME** |
| `GOVERNING_BODY_PORTAL_ROUTE` | `'/governance'` (later fixed from alternate GB path) | `'/governance'` | `'/governance'` | **SAME** |

### 3.2 Workspace `route` wiring (worktree)

| Workspace id | `name` | Bound route constant / value | Status field |
| --- | --- | --- | --- |
| `compliance` | Compliance | `'/compliance'` (internal) | available |
| `journey` | Journey | `JOURNEY_URL` → `http://127.0.0.1:5193/journey?persona=taylor-rn` | available |
| `connect` | Connect | `CONNECT_URL` → `http://127.0.0.1:5192/?view=home` | available |
| `governing-body` | Governing Body | `GOVERNING_BODY_PORTAL_ROUTE` → `/governance` | restricted |
| `find-home-care` | Find A Home Care | FAHC Cloud Run provider login | prototype |
| `ehr-prototype` | EHR Prototype | `EHR_PROTOTYPE_URL` → `http://127.0.0.1:5194` | prototype |

Source (worktree lines 37–41, 59–132):

```37:41:src/v6/screens/pageviews/ReceptionScreen.tsx
const EHR_PROTOTYPE_URL = 'http://127.0.0.1:5194';
const FIND_HOME_CARE_PROVIDER_PORTAL_URL = 'https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login';
const GOVERNING_BODY_PORTAL_ROUTE = '/governance';
const JOURNEY_URL = 'http://127.0.0.1:5193/journey?persona=taylor-rn';
const CONNECT_URL = 'http://127.0.0.1:5192/?view=home';
```

---

## 4. Uncommitted vs committed (detail)

### 4.1 Committed at HEAD (not dirty for these four families)

| Constant | Committed value |
| --- | --- |
| EHR | `http://127.0.0.1:5194` |
| FAHC / Find A Home Care | `https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login` |
| Journey | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` |
| Connect | `http://127.0.0.1:5192/` |

Blame on HEAD constants:

| Line | Commit | Summary |
| --- | --- | --- |
| EHR `5194` | `efc9b1ca` | `feat: finish EHR reception integration` |
| FAHC Cloud Run | `76838548` | `fix reception external launcher targets` |
| Governing Body `/governance` | `c6be5bb0` | `fix governing body reception launcher` |
| Journey `…/journey/training?persona=taylor-rn` | `affbb058` | `fix reception workspace launch destinations` |
| Connect `http://127.0.0.1:5192/` | `76838548` | `fix reception external launcher targets` |

### 4.2 Uncommitted URL-constant delta only

| Constant | HEAD | Working tree | Semantic note |
| --- | --- | --- | --- |
| `JOURNEY_URL` | `…/journey/training?persona=taylor-rn` | `…/journey?persona=taylor-rn` | Drops `/training` path segment; keeps persona query |
| `CONNECT_URL` | `http://127.0.0.1:5192/` | `http://127.0.0.1:5192/?view=home` | Adds home-view query |
| `EHR_PROTOTYPE_URL` | `…5194` | `…5194` | No uncommitted change |
| FAHC Cloud Run | Cloud Run provider login | same | No uncommitted change |

### 4.3 Uncommitted non-constant launcher behavior (context only)

Dirty tree also changes command-palette / a11y launch mechanics (not URL string values, but how URLs open):

| Area | HEAD | Working tree |
| --- | --- | --- |
| Palette open | `button` + `window.open(…, '_blank', …)` | real `<a href target="_blank" rel="noopener noreferrer">` |
| Palette list | `div role="listbox"` / `role="option"` | semantic `<ul>` / `<li>` |
| Workspace card | external `<a>` | adds `aria-label` including “opens in a new tab” |
| Prototype shell CTA | `rel="noreferrer"` | `rel="noopener noreferrer"` |

These do **not** alter the four host/path constants under audit, but they affect how Journey/Connect/EHR/FAHC destinations are launched from the palette.

---

## 5. Divergence from original 32-agent contract

### 5.1 Original contract (wave-1 / wave-2 QA package)

As locked by merge-era agents (e.g. W1-A05, W1-A11, W1-A14, W2-QA03, W2-QA05, W2-QA11) on the reception merge surface:

| Surface | Original 32-agent expectation |
| --- | --- |
| **EHR Prototype** | External handoff **exactly** `http://127.0.0.1:5191` (optional trailing `/` only); static mirror `apps/ehr-prototype-static`; port **5194 was Fable** and **not** merge proof |
| **Journey** | **In-app** SPA route `/journey?tab=home` — **not** a vendored Journey app, **not** external 5193 |
| **Connect** | **Not** a Reception workspace; Connect source must stay out of this repo (separation QA) |
| **Find A Home Care** | **Internal** prototype `/find-home-care`, **separate** from EHR; not Cloud Run |
| **Static EHR only** | Vendored under `apps/ehr-prototype-static`; no interactive `apps/ehr-prototype` as Reception target |

Illustrative original EHR block (from W1-A05 evidence of then-current code):

```text
route: 'http://127.0.0.1:5191',
external: true,
```

### 5.2 Evolution path (committed history on this file)

| Commit | Change relevant to URL contract |
| --- | --- |
| `79f25bd4` | Reception launcher lands; EHR → **5191**; Journey in-app; FHC in-app; **no Connect** |
| `efc9b1ca` | EHR → **5194** (`EHR_PROTOTYPE_URL`); leaves static 5191 as non-launcher artifact |
| `affbb058` | Journey externalized to **5193** `…/journey/training?persona=taylor-rn`; FHC briefly pointed at Vercel FAHC URL |
| `76838548` | FHC → **Cloud Run** FAHC provider login; **Connect** added → **5192/** |
| `c6be5bb0` | Governing Body → `/governance` |
| `dae8e24b` (HEAD) | Vendor/contractor UI; **does not** change Reception URL constants |
| **Working tree (uncommitted)** | Journey path **−`/training`**; Connect **+`?view=home`** |

### 5.3 Contract-vs-current summary

| Contract item | Status vs HEAD | Status vs worktree |
| --- | --- | --- |
| EHR launcher = **5191** static | **BROKEN / SUPERSEDED** → **5194** | same (still 5194) |
| Port 5194 not used as merge EHR | **BROKEN / SUPERSEDED** (now canonical interactive app in-tree) | same |
| Journey in-app `/journey?tab=home` | **BROKEN / SUPERSEDED** → external 5193 training URL | further path drift (drop `/training`) |
| No Connect on Reception | **BROKEN / SUPERSEDED** → external 5192 | query refined `?view=home` |
| FHC = `/find-home-care` only | **BROKEN / SUPERSEDED** → FAHC Cloud Run | same |
| Connect/Journey **source** not merged into this repo | **STILL HOLDS** (links out only) | same |
| Static mirror still vendored on 5191 | **STILL PRESENT** as fallback, but **not** Reception target | same |

**Net:** HEAD and worktree both implement a **post-32-agent product evolution**. The original 32-agent QA package is **stale** for Reception launcher URLs. Later inventory (`MERGE_INVENTORY_2026-08-03.md`) already documents the **HEAD** URL set (5194, FAHC Cloud Run, Journey training path, Connect `/`), but **does not** yet reflect the **uncommitted** Journey/Connect string tweaks.

### 5.4 Dual-EHR residual (still live in recon)

| Port | Role today | Reception launcher? |
| --- | --- | --- |
| **5194** | Interactive `apps/ehr-prototype` (Vite) | **Yes** (`EHR_PROTOTYPE_URL`) |
| **5191** | Static `apps/ehr-prototype-static` fallback | **No** (contract originally required **yes**) |

This is the core **5194 vs 5191** drift the recon is tracking.

---

## 6. Alignment with later inventory (not original contract)

`MERGE_INVENTORY_2026-08-03.md` “Expected behavior” (post-evolution) lists:

| Inventory expectation | HEAD | Worktree |
| --- | --- | --- |
| EHR → `http://127.0.0.1:5194/` | **Match** (no trailing slash in const; host/port match) | **Match** |
| FAHC Cloud Run provider login | **Match** | **Match** |
| Journey → `…/journey/training?persona=taylor-rn` | **Match** | **Mismatch** (`…/journey?persona=taylor-rn`) |
| Connect → `http://127.0.0.1:5192/` | **Match** | **Mismatch** (`…/?view=home`) |
| Governing Body → `/governance` | **Match** | **Match** |

So: **committed HEAD matches the rewritten inventory**; **dirty worktree diverges on Journey path + Connect query**.

---

## 7. Pass criteria applied

| Criterion | Result | Notes |
| --- | --- | --- |
| EHR constant is documented and consistent HEAD ↔ WT | **PASS** | Both `5194`; intentional break from 32-agent `5191` |
| Journey constant documented; HEAD ↔ WT identical | **FAIL** | Uncommitted path change |
| Connect constant documented; HEAD ↔ WT identical | **FAIL** | Uncommitted `?view=home` |
| FAHC Cloud Run constant documented; HEAD ↔ WT identical | **PASS** | Identical Cloud Run URL |
| No silent reversion of EHR back to 5191 in dirty tree | **PASS** | Dirty tree keeps 5194 |
| Original 32-agent contract still holds for Reception URLs | **FAIL** | EHR, Journey, Connect, FHC all evolved |
| Inventory still accurate for dirty worktree | **PARTIAL** | Accurate for HEAD; stale for WT Journey/Connect |

### Overall verdict: **PARTIAL**

- **Not PASS:** dirty Journey/Connect URL drift vs committed HEAD **and** vs current inventory; original 32-agent launcher contract is no longer satisfied.
- **Not FAIL for recon completeness:** constants are clear, history is attributable, EHR did not regress to 5191, FAHC is stable, Connect/Journey remain **external links** (source separation preserved).
- **PARTIAL** because:
  1. Post-contract evolution is **intentional and largely committed**, but
  2. Uncommitted Journey/Connect string tweaks create **HEAD ≠ worktree** launcher drift that inventory/QA have not re-locked, and
  3. Dual-EHR (5191 static still live, 5194 canonical) remains a documentation/canonicality residual.

---

## 8. Evidence commands (reproducible)

```text
git rev-parse HEAD
git status --short -- src/v6/screens/pageviews/ReceptionScreen.tsx
git diff HEAD -- src/v6/screens/pageviews/ReceptionScreen.tsx
git blame -L 37,41 HEAD -- src/v6/screens/pageviews/ReceptionScreen.tsx
git log -S "5194" --oneline -- src/v6/screens/pageviews/ReceptionScreen.tsx
git log -S "5191" --oneline -- src/v6/screens/pageviews/ReceptionScreen.tsx
git show 79f25bd4:src/v6/screens/pageviews/ReceptionScreen.tsx   # original contract era
```

Cross-refs:

- `audit/recon-2026-08-03/RECONCILIATION_REPORT.md` §4 Critical drift
- `audit/merge-2026-08-03/wave-2/W2-QA05-ehr-launcher-qa.md` (original **5191** exact-string gate)
- `audit/merge-2026-08-03/wave-1/W1-A11-journey-link-verifier.md` (original in-app Journey)
- `MERGE_INVENTORY_2026-08-03.md` expected launcher URLs (post-evolution / HEAD-shaped)

---

## 9. Residual risks / follow-ups (no product edits in this agent)

1. **Commit or discard** dirty `JOURNEY_URL` / `CONNECT_URL` changes so HEAD ↔ worktree match before release QA.
2. If dirty strings are intended, **refresh inventory + browser QA** (W2-QA03/05/11 style) for exact hrefs.
3. Keep documenting **canonical EHR = 5194** vs **fallback static = 5191** so stale 32-agent reports are not re-applied as fail gates without an explicit contract amendment.
4. Confirm live Journey app still serves the shorter `/journey?persona=…` path (or the training path) before locking either string.

---

## 10. One-line summary

**PARTIAL** — HEAD committed EHR **5194** + FAHC Cloud Run + external Journey **5193** + Connect **5192**; worktree only further drifts Journey (`/training` dropped) and Connect (`?view=home`); all of that diverges from the original 32-agent Reception contract (EHR **5191**, in-app Journey, no Connect, FHC `/find-home-care`).
