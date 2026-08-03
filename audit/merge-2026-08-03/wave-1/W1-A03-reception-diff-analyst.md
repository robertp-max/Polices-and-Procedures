# W1-A03 — Reception Diff Analyst

| Field | Value |
| --- | --- |
| **Agent ID** | W1-A03 |
| **Role** | Reception Diff Analyst |
| **Merge worktree** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| **Source (read-only)** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\reception_area` |
| **Base** | `7b0b6ae6` (`onboarding_specialized`) |
| **Merge tip (at analysis)** | `60f17bb5` |
| **Reception commit** | `79f25bd4` — `feat(reception): add post-login reception launcher and EHR handoff` |
| **Result** | **PASS** |

---

## Checks

| # | Check | Result |
| --- | --- | --- |
| 1 | Diff merge-worktree reception set vs base `7b0b6ae6` | **PASS** — expected deltas only |
| 2 | Diff merge-worktree vs `reception_area` working copies | **PASS** — all 8 files SHA256-identical |
| 3 | Exact 8 approved files present and only those in reception commit | **PASS** |
| 4 | `/reception` route registered | **PASS** |
| 5 | Index redirect → `/reception` | **PASS** (was `/compliance` at base) |
| 6 | `safeRedirect` / `BRAD_DEFAULT_ROUTE` → `/reception` | **PASS** (was `/compliance` at base) |
| 7 | Find Home Care vs EHR Prototype separation | **PASS** — separate routes, screens, workspace cards |
| 8 | EHR launcher URL `http://127.0.0.1:5191` | **PASS** — external workspace + `window.open` / `<a target=_blank>` |
| 9 | No Fable `EHR_Prototype` files in reception set | **PASS** — zero hits |
| 10 | `apiClient.ts` is reception minimal (not dirty-main larger) | **PASS** — 17 lines / 538 B vs dirty-main 45 lines / 1964 B |

---

## Commands

```text
# Merge vs base (numstat / full diff)
git diff --stat 7b0b6ae6 -- <8 approved paths>
git diff --numstat 7b0b6ae6 -- <8 approved paths>
git diff 7b0b6ae6 -- <paths except full ReceptionScreen dump>
git show --name-status 79f25bd4
git rev-parse HEAD
git log -5 --oneline

# Merge vs reception_area (byte-identical)
Get-FileHash -Algorithm SHA256 <merge path> vs <reception_area path>  # all 8 IDENTICAL

# Fable / EHR_Prototype scan on reception set
Select-String -Pattern "Fable|EHR_Prototype|..." on each of 8 files  # all clean

# apiClient size compare
merge:      17 lines / 538 bytes
dirty-main: 45 lines / 1964 bytes  (C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\src\auth\apiClient.ts)

# Base evidence
git show 7b0b6ae6:src/v6/utils/safeRedirect.ts   # BRAD_DEFAULT_ROUTE = '/compliance'
git show 7b0b6ae6:src/v6/routing/router.tsx       # Navigate to="/compliance"
git cat-file -e 7b0b6ae6:src/v6/screens/pageviews/ReceptionScreen.tsx  # missing at base
git cat-file -e 7b0b6ae6:src/auth/apiClient.ts                        # missing at base
```

---

## Files examined

### Exact 8 approved reception files

| # | Path | vs base `7b0b6ae6` | vs `reception_area` | Notes |
| --- | --- | --- | --- | --- |
| 1 | `src/v6/routing/routeRegistry.ts` | +6 / −1 | IDENTICAL | Adds reception + prototype routes/templates |
| 2 | `src/v6/routing/router.tsx` | +1 / −1 | IDENTICAL | Index → `/reception` |
| 3 | `src/v6/screens/RepresentativeScreens.tsx` | +13 / −1 | IDENTICAL | Cases + `isRepresentativeRoute` entries |
| 4 | `src/v6/screens/pageviews/index.ts` | +1 / −0 | IDENTICAL | Re-exports screens from ReceptionScreen |
| 5 | `src/v6/shell/V6Shell.tsx` | +3 / −2 | IDENTICAL | Chrome-free / no-padding for `/reception` |
| 6 | `src/v6/utils/safeRedirect.ts` | +2 / −2 | IDENTICAL | Default landing → `/reception` |
| 7 | `src/auth/apiClient.ts` | **new** +17 | IDENTICAL | Minimal reception copy |
| 8 | `src/v6/screens/pageviews/ReceptionScreen.tsx` | **new** +732 | IDENTICAL | Launcher + FindHomeCare + EhrPrototype screens |

### Supporting inventory / context

- `MERGE_INVENTORY_2026-08-03.md` — documents the same 8-file approved set and intent
- Dirty-main (read-only size compare): `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\src\auth\apiClient.ts`
- Commit `79f25bd4` file list matches the 8 approved paths exactly (A×2 + M×6)

---

## Evidence

### Commit `79f25bd4` (approved set boundary)

```text
feat(reception): add post-login reception launcher and EHR handoff

Copy approved reception surfaces from codex/reception_area: /reception default landing,
separate Find Home Care vs EHR Prototype routes, and local EHR launcher at http://127.0.0.1:5191/.

A  src/auth/apiClient.ts
M  src/v6/routing/routeRegistry.ts
M  src/v6/routing/router.tsx
M  src/v6/screens/RepresentativeScreens.tsx
A  src/v6/screens/pageviews/ReceptionScreen.tsx
M  src/v6/screens/pageviews/index.ts
M  src/v6/shell/V6Shell.tsx
M  src/v6/utils/safeRedirect.ts
```

### Merge ≡ reception_area (SHA256)

All 8 approved files: **IDENTICAL (SHA256 match)** between merge worktree and `reception_area` working copies. Byte sizes match pairwise (e.g. ReceptionScreen 29468, apiClient 538).

Note: on `reception_area`, `apiClient.ts` and `ReceptionScreen.tsx` are untracked (`??`) relative to its HEAD (`7b0b6ae6`); working-tree content still matches the merge copy exactly (pure file-copy source).

### Behavior deltas vs base

#### 1. `/reception` route

`routeRegistry.ts` (added):

```ts
| 'reception'
| 'prototype'
// ...
{ path: '/reception', hashId: 'reception', template: 'reception', group: 'System',
  title: 'Reception', description: 'Secure post-login workspace launcher for Care Indeed products.' },
{ path: '/find-home-care', hashId: 'find-home-care', template: 'prototype', group: 'System',
  title: 'Find Home Care', description: 'Standalone Find Home Care prototype, separate from the EHR prototype.' },
{ path: '/ehr-prototype', hashId: 'ehr-prototype', template: 'prototype', group: 'System',
  title: 'EHR Prototype', description: 'Local EHR prototype handoff route; primary launcher opens the live prototype service.' },
```

#### 2. Index redirect to `/reception`

Base:

```ts
{ index: true, element: <Navigate replace to="/compliance" /> },
```

Merge / reception_area:

```ts
{ index: true, element: <Navigate replace to="/reception" /> },
```

#### 3. `safeRedirect` default `/reception`

Base:

```ts
// Everything else falls back to Brad (the authenticated default landing page).
export const BRAD_DEFAULT_ROUTE = '/compliance';
```

Merge / reception_area:

```ts
// Everything else falls back to Reception (the authenticated default landing page).
export const BRAD_DEFAULT_ROUTE = '/reception';
```

#### 4. Find Home Care vs EHR Prototype separation

| Surface | Route / target | Implementation |
| --- | --- | --- |
| Find Home Care | internal `/find-home-care` | `FindHomeCareScreen` — consumer/intake concept |
| EHR Prototype (in-app stub) | internal `/ehr-prototype` | `EhrPrototypeScreen` — clinical concept stub |
| EHR live launcher (Reception card) | **external** `http://127.0.0.1:5191` | workspace `external: true` |

`ReceptionScreen.tsx` workspaces (key lines):

```ts
{
  id: 'find-home-care',
  name: 'Find Home Care',
  route: '/find-home-care',
  // ...
},
{
  id: 'ehr-prototype',
  name: 'EHR Prototype',
  route: 'http://127.0.0.1:5191',
  external: true,
  // ...
},
```

In-app screens explicitly document the brand boundary:

```text
FindHomeCareScreen: "Find Home Care is separate from the EHR prototype..."
  Brand boundary: 'Separate from EHR Prototype'
EhrPrototypeScreen: "...intentionally split from Find Home Care..."
  Prototype safeguards: 'Separated from Find Home Care'
```

`RepresentativeScreens.tsx` wires distinct cases:

```ts
case 'reception':      child = <ReceptionScreen />;
case 'find-home-care': child = <FindHomeCareScreen />;
case 'ehr-prototype':  child = <EhrPrototypeScreen />;
```

#### 5. EHR launcher URL `http://127.0.0.1:5191`

- Workspace route: `route: 'http://127.0.0.1:5191'`, `external: true`
- Card: `<a href={lastRoute} target="_blank" rel="noreferrer">` when `workspace.external`
- Command palette: `window.open(workspace.lastRoute, '_blank', 'noopener,noreferrer')` when external

#### Shell treatment

`V6Shell.tsx` treats `/reception` as chrome-free and suppresses shell padding (full-bleed launcher).

#### `apiClient.ts` — reception minimal

| Variant | Path | Lines | Bytes | Exports |
| --- | --- | --- | --- | --- |
| **Reception (approved)** | merge + reception_area `src/auth/apiClient.ts` | **17** | **538** | `apiRoot`, `bearerAuthHeader` only |
| Dirty-main (excluded) | `...\Policies_and_Procedures_V2\src\auth\apiClient.ts` | **45** | **1964** | same two exports + large JSDoc header/body |

Reception file is the minimal implementation (no extended commentary). Inventory explicitly excludes “Main dirty `src/auth/apiClient.ts` (larger) / tests”.

### No Fable `EHR_Prototype` in reception set

Scan of all 8 approved files for `Fable`, `EHR_Prototype`, and related path markers: **all clean**.

Reception commit paths are only under `src/auth/` and `src/v6/` — no Fable worktree paths, no `EHR_Prototype` tree. Static EHR mirror under `apps/ehr-prototype-static/` is a **separate** merge item (commit `e0c678ed`, Temp source), not part of the reception 8-file set and not Fable-sourced.

---

## Findings

1. **Approved set integrity:** Commit `79f25bd4` touches exactly the 8 inventory-approved reception files; no extra reception-scope leakage into that commit.
2. **Source fidelity:** Merge worktree bytes match `reception_area` working copies for all 8 files (pure copy preserved).
3. **Landing behavior:** Authenticated index and post-login safe default both moved from `/compliance` → `/reception` as intended.
4. **Product separation:** Find Home Care (`/find-home-care`) and EHR Prototype (in-app `/ehr-prototype` + external `http://127.0.0.1:5191`) are separate workspaces, routes, and screens with explicit brand-boundary copy.
5. **EHR handoff:** Primary Reception launcher for EHR is external URL `http://127.0.0.1:5191` (new tab / `window.open`), matching inventory.
6. **apiClient:** Present as reception-minimal (17-line) helper; not the larger dirty-main documented variant.
7. **Hard ban respected:** No Fable `EHR_Prototype` content in the reception file set.

No defects found relative to approved reception intent.

---

## Result

**PASS** — Diffs match approved reception intent:

- Exact 8-file set
- `/reception` route + index redirect + safeRedirect default
- Find Home Care ≠ EHR Prototype
- EHR launcher `http://127.0.0.1:5191`
- No Fable `EHR_Prototype`
- Minimal `apiClient.ts`
)
