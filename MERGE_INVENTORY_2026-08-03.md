# Merge Inventory - 2026-08-03

## Merge branch result

| Field | Value |
| --- | --- |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Base | `onboarding_specialized` @ `7b0b6ae6` |
| Safety branch | `safety/onboarding_specialized-2026-08-03` @ `7b0b6ae6` |
| Merge worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Method | Approved file copies plus additive cherry-picks from committed remote branches; dirty roots and Fable's worktree were not used |

### Commits on merge branch

| Commit | Message |
| --- | --- |
| `79f25bd4` | feat(reception): add post-login reception launcher and EHR handoff |
| `2aca52cf` | docs(ehr): add development inventory and UI/UX discovery plan |
| `e0c678ed` | chore(apps): vendor static EHR prototype mirror for local 5191 handoff |
| `5af4f6fd` | docs: record local app surfaces merge inventory 2026-08-03 |
| `60f17bb5` | docs: add build/QA results to merge inventory |
| `f05cca59` | fix: close merge quality gates |
| `25f2ff25` | feat(ehr-prototype): CI-branded Home Health EHR design prototype |
| `09483a5c` | style(ehr-prototype): white card containers, cool neutrals, edge side nav |
| `e2b1e4c8` | docs(ehr-prototype): bring UAT report current, park remaining checks |

### Build / QA snapshot (merge worktree)

| Check | Result |
| --- | --- |
| `npm run build` (`tsc -b && vite build`) | **PASS** |
| `npm run lint` | **PASS** — 0 errors; 712 warnings (legacy debt plus 4 EHR hook warnings) |
| `npm test` | **PASS** — 72 files, 792 tests |
| `apps/ehr-prototype`: `npm run build` | **PASS** — Vite 6.4.3, 1,633 modules |
| Journey: direct ESLint / `vinext build` / route tests | **PASS** — 0 lint errors, production build, 7/7 tests |
| Browser: Journey → Connect | **PASS** — desktop/mobile no switch overlap; opens `http://127.0.0.1:5192/` |
| Browser: Reception → EHR | **PASS** — launcher present; EHR dashboard renders on `http://127.0.0.1:5194/` with no console errors |
| Sibling `src/**/*.js` shadows | None |
| Secrets in `apps/ehr-prototype-static` | None found |
| Fable `EHR_Prototype` in diff | **Not included** |
| Connect / Journey sources in diff | **Not included** |
| Drive health `http://127.0.0.1:5188/api/calendar/evidence/health` | HTTP 200, `ok: true`, `drive.reachable: true` (env on main) |
| EHR source app `http://127.0.0.1:5194/` | Production build passed; Reception launcher target |
| EHR static fallback `http://127.0.0.1:5191/` | HTTP 200, title Care Indeed Home Health EHR Prototype |
| Reception preview `http://127.0.0.1:5179/reception` | HTTP 200 |
| Full EHR source import tip (before final integration fixes) | `e2b1e4c8` |

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
- Find A Home Care separate from EHR Prototype
- EHR launcher → `http://127.0.0.1:5194/`
- Every Reception destination opens in a new browser tab, including command-palette launches
- Find A Home Care launcher → `https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login`
- Journey launcher → `http://127.0.0.1:5193/journey/training?persona=taylor-rn` (the separate Journey app with the Journey/Connect toggle)
- Connect launcher → `http://127.0.0.1:5192/` (separate Connect app; no source merge)
- Governing Body launcher → `https://fahc-provider-portal-rti5nksmma-uc.a.run.app/provider/login`

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

### Full EHR prototype source (from committed remote branch)

- Source: `origin/EHR_Prototype`, commits `6f0f8b7c`, `49c54ebe`, and `828e37c6`
- Merge-branch cherry-picks: `25f2ff25`, `09483a5c`, and `e2b1e4c8`
- Destination: `apps/ehr-prototype/`
- Standalone Vite app with no policy-runtime auth, API, or shared-state wiring
- Dev URL: `http://127.0.0.1:5194/`
- Reception workspace card and `/ehr-prototype` CTA both launch port 5194
- Production build verified; UAT handoff is `apps/ehr-prototype/docs/UAT-REPORT.md`

## Intentionally excluded

| Item | Reason |
| --- | --- |
| Fable `EHR_Prototype` worktree | Hard ban; never inspected or used as source. Only the separately committed `origin/EHR_Prototype` commits approved by the user were cherry-picked. |
| Dirty root checkout bulk untracked | Unrelated litter; merge done only in worktree |
| Main dirty `src/auth/apiClient.ts` (larger) / tests | Not reception-approved set |
| Connect repo (`...\connect`) | Separate Sites source; Journey toggle stays there |
| Employee Journey repo | Separate repo; reciprocal Journey/Connect toggle is maintained and verified there, not merged into this policy branch |
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
| EHR source app | `http://127.0.0.1:5194/` | `apps/ehr-prototype`; Reception launcher target |
| EHR static mirror | `http://127.0.0.1:5191/` | `apps/ehr-prototype-static`; preserved fallback |
| Connect | `http://127.0.0.1:5192/` | Separate repo |
| Journey | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` | Separate repo |
| qapi preview | `http://127.0.0.1:5187/compliance` | **Not** working Drive |

## Connect / Journey (external, not in this branch)

- Connect: branch `connect` @ `305ae2e`; local change `app/community-app.tsx` → Journey on 5193. Keep in Connect repo only.
- Journey: branch `codex/journey-connect-toggle-2026-08-03` @ `1909dc5`; reciprocal toolbar toggle targets local Connect on 5192 and the verified Sites deployment as its hosted fallback. Changes remain in the Journey repo only.

## Confirmation

- **Fable’s `EHR_Prototype` worktree was not included** and was not used as a source.
- Merge performed only in the dedicated merge worktree; dirty root checkout was not staged.

## Wave-1 inventory verification (2026-08-03, W1-A15)

Additive check against merge worktree HEAD after feature commits (pre-refresh tip `60f17bb5`):

| Claim | Status | Evidence |
| --- | --- | --- |
| Inclusions: reception launcher paths | **OK** | `src/v6/screens/pageviews/ReceptionScreen.tsx` (EHR → `http://127.0.0.1:5194`), route/shell/auth files from `79f25bd4` present |
| Inclusions: qapi EHR docs | **OK** | `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md` |
| Inclusions: static EHR path | **OK** | Destination **`apps/ehr-prototype-static/`**; title *Care Indeed Home Health EHR Prototype*; serve on **5191**; source Temp mirror (not Fable) |
| Exclusion: Fable `EHR_Prototype` worktree | **OK** | Worktree was never inspected or copied; full source came from the user-approved committed remote branch |
| Exclusion: Connect / Journey | **OK** | External-only section; not in merge diff |
| Working Drive URL | **OK** | **Only** `http://127.0.0.1:5188/evidence` (+ defensible-2) with API 8790 / env |
| 5187 is not working Drive | **OK** | Inventory labels qapi preview **Not** / **NOT working Drive** |
| 5173 is not working Drive | **OK** | Inventory labels older baseline **Not** / **NOT working Drive** |
| Drive code already on base | **OK** | `server/googleDrive*.ts`, calendar `evidence/health` route present; no Drive merge required |
