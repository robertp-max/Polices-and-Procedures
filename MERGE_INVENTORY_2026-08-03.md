# Merge Inventory - 2026-08-03

## Merge branch result

| Field | Value |
| --- | --- |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Base | `onboarding_specialized` @ `7b0b6ae6` |
| Safety branch | `safety/onboarding_specialized-2026-08-03` @ `7b0b6ae6` |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Method | Pure file COPY into isolated worktree (no dirty-root merge, no Fable EHR_Prototype) |

### Commits on merge branch

| Commit | Message |
| --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `60f17bb5` | docs: add build/QA results to merge inventory |

### Build / QA snapshot (merge worktree)

| Check | Result |
| --- | --- |
| `npm run build` (`tsc -b && vite build`) | **PASS** |
| Sibling `src/**/*.js` shadows | None |
| Secrets in `apps/ehr-prototype-static` | None found |
| Fable `EHR_Prototype` in diff | **Not included** |
| Connect / Journey sources in diff | **Not included** |
| Drive health `http://127.0.0.1:5188/api/calendar/evidence/health` | HTTP 200, `ok: true`, `drive.reachable: true` (env on main) |
| EHR static `http://127.0.0.1:5191/` | HTTP 200, title Care Indeed Home Health EHR Prototype |
| Reception preview `http://127.0.0.1:5179/reception` | HTTP 200 |
| Branch tip (pre–wave-1 inventory refresh) | `60f17bb5` |

## What was merged (copy sources)

### Reception (from `reception_area` / `codex/reception_area`)

- `src/v6/routing/routeRegistry.ts`
- `src/v6/routing/router.tsx`
- `src/v6/screens/RepresentativeScreens.tsx`
- `src/v6/screens/pageviews/index.ts`
- `src/v6/shell/V6Shell.tsx`
- `src/v6/utils/safeRedirect.ts`
- `src/auth/apiClient.ts` (minimal reception copy)
- `src/v6/screens/pageviews/ReceptionScreen.tsx`

Expected behavior:

- `/reception` route
- Authenticated default + safeRedirect → `/reception`
- Find Home Care separate from EHR Prototype
- EHR launcher → `http://127.0.0.1:5191/`

### qapi docs (from `qapi-uiux-discovery` / `qapi`)

- `docs/ehr-development-inventory.md` (from commit `c207655b`)
- `docs/ehr-uiux-discovery-plan.md` (was untracked on qapi worktree)

No full `git merge qapi` (branch history diverges from base).

### Static EHR prototype mirror (from Temp — not Fable)

- Source: `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local`
- Destination: `apps/ehr-prototype-static/`
- Title: Care Indeed Home Health EHR Prototype
- Isolated static assets only; no auth/API/shared-state wiring
- Serve: `npx --yes serve apps/ehr-prototype-static -l 5191`

## Intentionally excluded

| Item | Reason |
| --- | --- |
| Fable `EHR_Prototype` worktree | Hard ban; never used as source |
| Dirty root checkout bulk untracked | Unrelated litter; merge done only in worktree |
| Main dirty `src/auth/apiClient.ts` (larger) / tests | Not reception-approved set |
| Connect repo (`...\connect`) | Separate Sites source; Journey toggle stays there |
| Employee Journey repo | Clean reference target only |
| Secrets (`.env`, service-account JSON, keys) | Never staged/committed |

## DefenCIble / Google Drive (investigation)

Working Drive behavior is **runtime/env**, not a missing code merge from dirty root.

**Canonical working Drive surface is only port 5188** (with local env + API **8790**).  
**Ports 5187 and 5173 are not working Drive URLs** — do not treat them as the verified Drive stack.

| Surface | URL | Drive status |
| --- | --- | --- |
| **Working Drive (only)** | `http://127.0.0.1:5188/evidence` (+ `/evidence/defensible-2`) | Verified when main checkout has local `.env` and API on **8790**: `ok: true`, `drive.reachable: true` via `/api/calendar/evidence/health` |
| qapi preview | `http://127.0.0.1:5187/compliance` | UI may load; **NOT working Drive** (health 503 without env; not the verified Drive URL) |
| Older baseline | `http://localhost:5173/evidence/defensible-2` | **NOT working Drive** |

Code already present on base: `server/googleDrive.ts`, `server/googleDriveAuth.ts`, `server/routes/calendar.ts` (`GET /api/calendar/evidence/health`).  
**Do not commit credentials.** Drive fails safely without local credentials.

## Local app URLs (reference)

| Surface | URL | Notes |
| --- | --- | --- |
| DefenCIble + Drive | `http://127.0.0.1:5188/evidence` | Main + API 8790; env-backed |
| DefenCIble direct | `http://127.0.0.1:5188/evidence/defensible-2` | |
| Reception (preview) | `http://127.0.0.1:5179/reception` | reception_area worktree |
| EHR static mirror | `http://127.0.0.1:5191/` | `apps/ehr-prototype-static` |
| Connect | `http://127.0.0.1:5192/` | Separate repo |
| Journey | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` | Separate repo |
| qapi preview | `http://127.0.0.1:5187/compliance` | **Not** working Drive |

## Connect / Journey (external, not in this branch)

- Connect: branch `connect` @ `305ae2e`; local change `app/community-app.tsx` → Journey on 5193. Keep in Connect repo only.
- Journey: branch `main` @ `0ab6155`; clean; no merge needed.

## Confirmation

- **Fable’s `EHR_Prototype` worktree was not included** and was not used as a source.
- Merge performed only in the dedicated merge worktree; dirty root checkout was not staged.

## Wave-1 inventory verification (2026-08-03, W1-A15)

Additive check against merge worktree HEAD after feature commits (pre-refresh tip `60f17bb5`):

| Claim | Status | Evidence |
| --- | --- | --- |
| Inclusions: reception launcher paths | **OK** | `src/v6/screens/pageviews/ReceptionScreen.tsx` (EHR → `http://127.0.0.1:5191`), route/shell/auth files from `79f25bd4` present |
| Inclusions: qapi EHR docs | **OK** | `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md` |
| Inclusions: static EHR path | **OK** | Destination **`apps/ehr-prototype-static/`**; title *Care Indeed Home Health EHR Prototype*; serve on **5191**; source Temp mirror (not Fable) |
| Exclusion: Fable `EHR_Prototype` | **OK** | Hard ban in exclusions + README; not in `7b0b6ae6..HEAD` file list |
| Exclusion: Connect / Journey | **OK** | External-only section; not in merge diff |
| Working Drive URL | **OK** | **Only** `http://127.0.0.1:5188/evidence` (+ defensible-2) with API 8790 / env |
| 5187 is not working Drive | **OK** | Inventory labels qapi preview **Not** / **NOT working Drive** |
| 5173 is not working Drive | **OK** | Inventory labels older baseline **Not** / **NOT working Drive** |
| Drive code already on base | **OK** | `server/googleDrive*.ts`, calendar `evidence/health` route present; no Drive merge required |
