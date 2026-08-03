# W2-QA05 — EHR Launcher QA

| Field | Value |
|-------|-------|
| **Agent** | W2-QA05 (EHR Launcher QA) — Wave 2, independent |
| **Worktree** | `merge-local-app-surfaces-2026-08-03` |
| **Date** | 2026-08-03 |
| **Merge origin (runtime)** | `http://127.0.0.1:5201` |
| **EHR static origin** | `http://127.0.0.1:5191` |
| **Overall** | **PASS** |

---

## 1. Scope

1. **Code:** ReceptionScreen EHR workspace `route` must be exactly `http://127.0.0.1:5191` or `http://127.0.0.1:5191/`.
2. **Playwright:** On `/reception`, locate **EHR Prototype** control; capture `href` / `target`; must open 5191.
3. **Separation:** **Find Home Care** is a separate control with a different route.
4. **Evidence:** Screenshots under `audit/merge-2026-08-03/evidence/`.

---

## 2. Code assertion — ReceptionScreen EHR workspace route

**File:** `src/v6/screens/pageviews/ReceptionScreen.tsx`

### 2.1 Exact EHR route string

```101:112:src/v6/screens/pageviews/ReceptionScreen.tsx
  {
    id: 'ehr-prototype',
    name: 'EHR Prototype',
    description: 'A standalone clinical record concept for chart navigation, documentation, scheduling, and secure tasks.',
    route: 'http://127.0.0.1:5191',
    external: true,
    status: 'prototype',
    requiredRoles: ['Administrator', 'Product', 'Clinician', 'RN', 'LVN', 'PT', 'OT'],
    capabilities: ['Charts', 'Visits', 'Orders', 'Messages'],
    accent: 'clinical',
    icon: Activity,
    cta: 'Open EHR',
  },
```

| Check | Result |
|-------|--------|
| Documented exact string | **`http://127.0.0.1:5191`** |
| Trailing slash variant | **Not used** in source (`route` has **no** trailing `/`) |
| Allowed set | `{ http://127.0.0.1:5191 , http://127.0.0.1:5191/ }` |
| Match | **PASS** — exact allowed value (no trailing slash) |
| `external: true` | **Yes** → renders as `<a target="_blank" rel="noreferrer">` (lines 379–390) |

### 2.2 External anchor rendering

```379:390:src/v6/screens/pageviews/ReceptionScreen.tsx
  if (workspace.external) {
    return (
      <a
        href={lastRoute}
        onClick={() => writeRecentRoute(workspace.id, lastRoute)}
        className="group min-h-[260px] rounded-lg bg-white p-5 ..."
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }
```

`lastRoute` defaults to `workspace.route` when no localStorage override exists (`recentRoutes[workspace.id] ?? workspace.route`), so default href is the coded EHR URL.

### 2.3 Find Home Care — separate workspace entry

```89:99:src/v6/screens/pageviews/ReceptionScreen.tsx
  {
    id: 'find-home-care',
    name: 'Find Home Care',
    description: 'A separate consumer-facing service finder concept for care needs, location, and intake routing.',
    route: '/find-home-care',
    status: 'prototype',
    ...
    cta: 'Open Finder',
  },
```

| Field | Find Home Care | EHR Prototype |
|-------|----------------|---------------|
| `id` | `find-home-care` | `ehr-prototype` |
| `name` | Find Home Care | EHR Prototype |
| `route` | **`/find-home-care`** | **`http://127.0.0.1:5191`** |
| `external` | absent (internal `<Link>`) | **`true`** (external `<a>`) |
| CTA | Open Finder | Open EHR |

**Code verdict:** Find Home Care and EHR Prototype are distinct WORKSPACES entries with different routes and different link types. **PASS**

---

## 3. Playwright verification

**Script:** `audit/merge-2026-08-03/evidence/w2-qa05-ehr-launcher-verify.mjs`  
**Results JSON:** `audit/merge-2026-08-03/evidence/W2-QA05-playwright-results.json`  
**Runtime:** merge Vite on **5201**; EHR static already responding on **5191** (HTTP 200).

### 3.1 Check matrix

| ID | Result | Detail |
|----|--------|--------|
| `reception-reachable` | **PASS** | `http://127.0.0.1:5201/reception` (not redirected to `/login`) |
| `ehr-prototype-control-visible` | **PASS** | Heading **EHR Prototype** visible |
| `find-home-care-control-visible` | **PASS** | Heading **Find Home Care** visible |
| `ehr-launcher-href-5191` | **PASS** | `href="http://127.0.0.1:5191"`; `target="_blank"` |
| `ehr-launcher-target-blank` | **PASS** | `target="_blank"` |
| `ehr-href-dom-count` | **PASS** | `a[href="http://127.0.0.1:5191"]` count=**1**; slash variant count=**0** |
| `find-home-care-separate-route` | **PASS** | `fhcHref="/find-home-care"`; not 5191 |
| `controls-are-distinct` | **PASS** | 1 EHR anchor + 1 FHC anchor; hrefs differ |

### 3.2 Captured anchor attributes (DOM)

**EHR Prototype** (external):

```json
{
  "href": "http://127.0.0.1:5191",
  "target": "_blank",
  "rel": "noreferrer",
  "text": "...EHR Prototype...http://127.0.0.1:5191Open EHR"
}
```

**Find Home Care** (internal SPA):

```json
{
  "href": "/find-home-care",
  "target": null,
  "rel": null,
  "text": "...Find Home Care.../find-home-careOpen Finder"
}
```

### 3.3 Requirement mapping

| Requirement | Observed | Verdict |
|-------------|----------|---------|
| EHR route exactly `http://127.0.0.1:5191` or `...5191/` | Exact: **`http://127.0.0.1:5191`** (no trailing slash) | **PASS** |
| Playwright: EHR Prototype control href/target open 5191 | href 5191, target `_blank` | **PASS** |
| Find Home Care separate + different route | Own card; route `/find-home-care` | **PASS** |

---

## 4. Screenshot evidence

| File | Description |
|------|-------------|
| `audit/merge-2026-08-03/evidence/W2-QA05-reception-ehr-launcher.png` | Full `/reception` desktop — workspace launcher cards |
| `audit/merge-2026-08-03/evidence/W2-QA05-ehr-card-href.png` | Viewport with EHR card scrolled into view (`http://127.0.0.1:5191` label + Open EHR) |
| `audit/merge-2026-08-03/evidence/W2-QA05-find-home-care-card.png` | Viewport with Find Home Care card (`/find-home-care` + Open Finder) |

Visual confirmation from full-page shot:

- **Find Home Care** card shows route label **`/find-home-care`** and CTA **Open Finder**.
- **EHR Prototype** card shows route label **`http://127.0.0.1:5191`** and CTA **Open EHR**.
- Cards are separate UI controls in the workspace grid.

---

## 5. Notes / non-blockers

1. **Trailing slash:** Source and live DOM use **no** trailing slash. Spec allows either form; both code and runtime match the no-slash form.
2. **`lastRoute` / localStorage:** If a user previously overwrote `ci.reception.lastRoutes.v1` for `ehr-prototype`, the card could show a different href until cleared. Fresh/default session uses coded route (as verified in this run).
3. **Internal prototype shells:** `FindHomeCareScreen` / `EhrPrototypeScreen` also exist as in-app prototypes at `/find-home-care` and `/ehr-prototype`, but the Reception **launcher** for EHR is the **external** 5191 handoff, not the in-app `/ehr-prototype` shell. This QA validates the launcher handoff only.
4. Port **5173** was not used (down; merge proof is **5201**). Port **5194** (Fable) was not used.

---

## 6. Final verdict

| Gate | Status |
|------|--------|
| Code EHR route exact string | **PASS** — `http://127.0.0.1:5191` |
| Playwright EHR Prototype href → 5191 | **PASS** — `href=http://127.0.0.1:5191`, `target=_blank` |
| Find Home Care separate control/route | **PASS** — `/find-home-care`, internal Link |
| Screenshot evidence filed | **PASS** — 3 PNGs under `evidence/` |

# **OVERALL: PASS**
