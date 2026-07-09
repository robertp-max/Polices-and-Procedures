# Phase 2B exec summary — Wire AdminUsersScreen to identity store

**Date:** 2026-07-09  
**Branch:** `gemini-light-orange-theme`  
**Scope:** `src/v6/screens/pageviews/AdminUsersScreen.tsx` only (UI wiring). No backend, no JourneyAdminScreen, no permissions overhaul (2E).

## Files changed

| Path | Change |
|------|--------|
| `src/v6/screens/pageviews/AdminUsersScreen.tsx` | **Rewired** — roster/metrics/CRUD from `useUserAssignmentsStore` + setup join; removed fictional Brad/Tina/Maria roster and fake 96/94% metrics |
| `UAT_Reports/.../exec-summary-2B.md` | This summary |

## What landed

1. **Roster from store**  
   Rows derived from `users` + active `assignments` (group label via `USER_GROUP_BY_ID`) + `setupAssignments` (role/discipline, supervisor name, firstDay, onboarding track). Sorted by name. No hardcoded `Brad Administrator` / `Tina Patel` cast.

2. **Create / edit / deactivate**  
   - **Add user** → `addUser({ name, email, groupId, status, setup })`  
   - **Save changes** → `editUser(id, DEMO_ACTOR_USER_ID, { …, setup })`  
   - **Deactivate** → `deleteUser(id, DEMO_ACTOR_USER_ID)` (soft-suspend + `setup.active = false`)  
   All paths use the existing store, which persists to `ci.identityRegistry.v1` (payload version 2).

3. **Setup fields in forms**  
   Journey role, discipline, supervisor (identity user id), firstDay, hireDate, onboarding track (`none` vs role track via `buildOnboardingTrackForRole`). Group + status remain identity fields.

4. **Metrics from real counts**  
   Active / suspended / privileged group members / supervised (+ onboarding helper). Side panel cards, assignment lanes, and directory readiness list also use live store counts — not the old 96 / 94% / 11 theater numbers.

5. **Demo label**  
   Visible banner: **“Demo / localStorage only — not a production directory.”** Documents storage key and actor id.

6. **Visual language**  
   Kept `MetricGrid`, `DataTable`, `SurfaceCard`, tab chrome (`security` / `assignments` / `audit`). Replaced pure-theater **Permission Override Matrix** (save no-op) with a real **User setup** editor panel on row select.

## Actor choice

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DEMO_ACTOR_USER_ID` | `demo-user-careindeed` | Protected Super Admin seed; same actor used in Phase 2A unit tests for `editUser` / `deleteUser`. Demo/local only — not a real session principal (2F). |

Protected user `demo-user-careindeed` cannot be edited/deactivated in the UI (matches store `PROTECTED_USER_IDS`).

## Imports note

Imports go through **direct modules** (`userAssignmentsStore`, `userGroups`, `userSetupAssignments`, `types`) rather than `@/policy/security/identity` barrel, because the barrel still re-exports missing 2E guard modules (`AccessDeniedPage`, `AdminRouteGuard`, …).

## Verification

- `npx tsc -p tsconfig.app.json --noEmit` — **no new errors** in `AdminUsersScreen.tsx` (pre-existing: helpCenter nullability, missing 2E guard modules, JourneyAcademy ACHC noise)
- `npx vitest run src/policy/security/identity/userAssignmentsStore.test.ts` — **10/10 passed** (store contract unchanged)

## Explicit non-goals (this phase)

- No backend / Cognito directory (2F)
- No JourneyAdminScreen / journey learner wiring (2C)
- No route guards / pageAccess matrix (2E)
- No deletion of `SEED_EMPLOYEES` or parallel person models
