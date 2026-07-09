# Phase 2A exec summary — Types + local user setup store

**Date:** 2026-07-09  
**Branch:** `gemini-light-orange-theme`  
**Scope:** Extend `src/policy/security/identity/` only. No fourth person model. Demo/local-only.

## Files changed

| Path | Change |
|------|--------|
| `src/policy/security/identity/userSetupAssignments.ts` | **New** — `UserSetupAssignment` / `OnboardingTrackAssignment`, seed map from `DEMO_USERS`, helpers |
| `src/policy/security/identity/userAssignmentsStore.ts` | **Extended** — `setupAssignments` state, get/set actions, v1→v2 persist migration, optional `setup` on add/edit |
| `src/policy/security/identity/index.ts` | Re-export setup types + store |
| `src/policy/security/identity/userAssignmentsStore.test.ts` | **New** — 10 unit tests (CRUD, setup get/set, persistence, JourneyEmployee structural parity) |

## Key decisions

1. **Canonical person remains `User`** (`types.ts` + existing CRUD). Setup is a **side map** keyed by `userId`, not a parallel User/UserProfile type.
2. **Field-shape parity** with `JourneyEmployee` / `JourneyRole` (role, supervisorId, hireDate, firstDay↔startDate, licenses, appendix flags) without duplicating identity fields (name/email/status stay on `User`).
3. **Persist key kept** as `ci.identityRegistry.v1` (same localStorage key). Internal payload `version` bumped **1 → 2** with `setupAssignments`. v1 blobs without the map migrate on load (seed defaults, then overlay any persisted map).
4. **No new fictional cast.** Seed setup rows are built for all 18 `DEMO_USERS`. A clinical/admin subset maps to `SEED_EMPLOYEES` *concepts* via optional `journeyEmployeeSeedRef` (`EMP-1001`…`EMP-3001`) for demo richness; `SEED_EMPLOYEES` is untouched.
5. **Onboarding modules** come from existing `modulesForRole(role)` — not a hand-copied module list.
6. **Deactivate** continues to soft-suspend (`deleteUser` → status `suspended`) and now also sets `setupAssignments[userId].active = false`.
7. **Consumers unchanged:** featureAccess, signerIdentity, personalOpsModel, authorize, pageAccess only read `users`/`assignments` (and related helpers); new state is additive.

## Seed mapping (DEMO_USERS → journey fields)

| userId | Journey role | Supervisor (identity id) | firstDay | journeyEmployeeSeedRef |
|--------|--------------|--------------------------|----------|------------------------|
| `demo-user-careindeed` | ADM | null | 2022-06-01 | EMP-3001 |
| `usr-marites` | ADM | demo-user-careindeed | 2023-03-06 | — |
| `usr-admin` | ADM | demo-user-careindeed | 2024-01-15 | — |
| `usr-deeb-admin` | ADM | demo-user-careindeed | 2024-02-05 | — |
| `usr-rn` | RN | usr-director | 2026-04-20 | EMP-1001 |
| `usr-lvn` | LVN | usr-director | 2026-04-06 | EMP-1003 |
| `usr-chha` | HHA | usr-director | 2026-04-20 | EMP-1002 |
| `usr-director` | DON | usr-executive | 2023-01-15 | EMP-2001 |
| `usr-executive` | ADM | null | 2021-01-01 | — |
| `usr-compliance` | ADM | usr-executive | 2023-05-08 | — |
| others (`usr-dagny`, `usr-janine`, `usr-reden`, `usr-monserat`, `usr-auditor`, `usr-onboarding`, `usr-billing`) | role null | various DEMO supervisors | set | — |
| `usr-suspended` | RN | usr-director | 2025-01-15 | active: false |

Where `withOnboarding` + role is set, default track = `role-{ROLE}` with `modulesForRole` module ids and dueDate = firstDay + 60 days.

## Persist key / version

- **localStorage key:** `ci.identityRegistry.v1` (unchanged — avoids a second registry key)
- **Payload version:** `2` (`IDENTITY_REGISTRY_VERSION`)
- **Shape:** `{ version, updatedAt, users, assignments, setupAssignments }`
- **Migration:** missing `setupAssignments` → seed from `buildSeedSetupAssignments()`, then merge any present map; every known user guaranteed a setup row

## API for Phase 2B / 2C

### Types (`userSetupAssignments` / identity barrel)

- `UserSetupAssignment` (alias `UserAssignment`)
- `OnboardingTrackAssignment`
- `UserSetupFieldsPayload`
- `OnboardingTrackStatus`

### Store (`useUserAssignmentsStore` / helpers)

| API | Use |
|-----|-----|
| `setupAssignments` | Full map `Record<userId, UserSetupAssignment>` |
| `getSetupAssignment(userId)` | Single row |
| `getAllSetupAssignments()` | Array of all rows |
| `setSetupAssignment(userId, patch)` | Partial update (role/supervisor/firstDay/onboarding/…) |
| `addUser({ …, setup? })` | Create user + optional journey fields |
| `editUser(id, actor, { …, setup? })` | Edit identity + optional setup |
| `deleteUser(id, actor)` | Soft-deactivate user + `setup.active = false` |
| `getLiveSetupAssignment` / `getLiveAllSetupAssignments` / `setLiveSetupAssignment` | Non-hook accessors |
| `buildOnboardingTrackForRole(role, opts?)` | Catalog-backed track builder |
| `toJourneyEmployeeOverlap(user, setup)` | Adapter bridge for journey screens |
| `getDirectReportUserIds(map, supervisorUserId)` | Supervisor filter helper (2C) |
| `IDENTITY_REGISTRY_STORAGE_KEY` / `IDENTITY_REGISTRY_VERSION` | Persist constants |

### Recommended consumption

- **2B AdminUsersScreen:** roster from `users` + join `getSetupAssignment`; forms write `addUser`/`editUser`/`deleteUser`/`setSetupAssignment`; label UI as demo/localStorage-only.
- **2C Journey:** resolve current learner via identity user id → `getSetupAssignment` → `onboarding.moduleIds`; SupervisorScreen filter via `supervisorId` / `getDirectReportUserIds`; optional `toJourneyEmployeeOverlap` or `journeyEmployeeSeedRef` when bridging existing journey seed flows without inventing IDs.

## Verification

- `npx vitest run src/policy/security/identity/userAssignmentsStore.test.ts` — **10/10 passed**
- `npx tsc -p tsconfig.app.json --noEmit` — **no new errors** in identity files (pre-existing helpCenter nullability errors unrelated)

## Explicit non-goals (this phase)

- No AdminUsersScreen wiring (2B)
- No journey screen wiring (2C)
- No backend / real IdP (2F)
- No deletion of `SEED_EMPLOYEES` or `WorkforceMember` seeds
