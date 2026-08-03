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
| *(inventory commit follows)* | docs: record local app surfaces merge inventory 2026-08-03 |

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

Working Drive behavior is **runtime/env**, not a missing code merge from dirty root:

| Surface | URL | Drive health |
| --- | --- | --- |
| **Working Drive** | `http://127.0.0.1:5188/evidence` (+ `/evidence/defensible-2`) | Verified when main checkout has local `.env` and API on **8790**: `ok: true`, `drive.reachable: true` |
| qapi preview | `http://127.0.0.1:5187/compliance` | UI loads; **not** the working Drive URL (health 503 without env) |
| Older baseline | `http://localhost:5173/evidence/defensible-2` | **Not** the working Drive URL |

Code already present on base: `server/googleDrive*.ts`, `server/routes/calendar.ts` (`/api/calendar/evidence/health`).  
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
