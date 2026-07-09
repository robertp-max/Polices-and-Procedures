# Phase 2C exec summary — Journey integration

**Date:** 2026-07-09  
**Branch:** (working tree at commit)  
**Scope:** Wire Phase 2A setup assignments into journey learner/supervisor surfaces. Demo/local only. No `gating.ts` logic changes. Nolan out of scope.

## Files changed

| Path | Change |
|------|--------|
| `src/v6/utils/journeyProfileAdapter.ts` | Extended `DEMO_JOURNEY_EMPLOYEE_MAP` with Phase 2A identity ids; reverse map; `resolveJourneyEmployeeId`, `resolveIdentityUserIdFromEmployee`, `getAssignedModuleIdsForEmployee`, `isModuleAssignedToEmployee` |
| `src/policy/journey/components/DemoImpersonationBar.tsx` | **New** — demo learner/employee switcher calling `journeyStore.setCurrentEmployee`; label **Demo impersonation — not a real session** |
| `src/v6/screens/pageviews/SupervisorScreen.tsx` | Impersonation bar; employee dropdown filtered to direct reports of acting supervisor; visit `supervisorId` = acting EMP (not `SUP-001`) |
| `src/v6/screens/pageviews/JourneyAcademyScreen.tsx` | Impersonation bar; modules from setup `onboarding.moduleIds` else `modulesForRole`; attempts/evidence filtered by `currentEmployeeId` |
| `src/v6/screens/pageviews/ModulePlayerScreen.tsx` | Assignment awareness banner; completions continue to use `currentEmployeeId` (no full catalog rewrite) |

## Behavior

### 1. Demo impersonation (until 2F)

- Shared control: `DemoImpersonationBar`
- Mounted on **SupervisorScreen** and **JourneyAcademyScreen**
- Options = journey `employees` roster + Phase 2A seed refs (`usr-rn`→`EMP-1001`, etc.)
- Selection → `setCurrentEmployee(EMP-*)`
- Always shows: **Demo impersonation — not a real session**

### 2. SupervisorScreen filter

- Acting supervisor = `journey.currentEmployeeId` (demo-impersonated EMP)
- Report list = journey employees with `supervisorId === actingSupervisorEmpId`  
  ∪ setup direct reports via `getDirectReportUserIds` → `journeyEmployeeSeedRef`
- DON seed path: impersonate **EMP-2001 / usr-director** → reports **EMP-1001, EMP-1002, EMP-1003**
- Visit records write `supervisorId: actingSupervisorEmpId` (replaces hard-coded `SUP-001`)

### 3. JourneyAcademyScreen

- `learnerAttempts` / `learnerEvidence` filtered by `currentEmployeeId` (completion stats not global)
- Module cards prefer `getAssignedModuleIdsForEmployee` (setup onboarding track); fallback `modulesForRole(role)`
- Role onboarding paths built from assigned `group === 'ROLE'` modules + GAO entry
- ACHC / GAO / ADV lists derived from assignment when present; catalog fallback so tabs are not empty

### 4. ModulePlayerScreen (partial by design)

- Completions still `recordLearnerCompletion(j.currentEmployeeId, …)` — already correct
- **New:** soft assignment banner (in-track vs not-on-track); player remains open (no hard block)
- **Not done:** full assignment-driven route/catalog rewrite; **not** re-enabling `canStartModule` / `gating.ts` UI

### 5. Identity ↔ EMP map (adapter)

| Identity / auth id | EMP |
|--------------------|-----|
| `usr-rn` | EMP-1001 |
| `usr-chha` | EMP-1002 |
| `usr-lvn` | EMP-1003 |
| `usr-director` | EMP-2001 |
| `demo-user-careindeed` | EMP-3001 |
| legacy `demo-user`, `u-don-01`, … | retained |

Also reads `setup.journeyEmployeeSeedRef` when resolving ids.

## Explicit non-goals / scope cuts

- **No** changes to `gating.ts` engine or re-enabling player start gates
- **No** escalations UI for `journeyStore.escalations` (recon 2C item deferred)
- **No** ModulePlayer full syllabus filter / rewrite (banner + Academy path only)
- **No** AuthProvider real session binding (2F)
- **No** Nolan tutor consumption changes
- **No** SEED_EMPLOYEES deletion or fourth person model

## Verification

- `npx tsc -p tsconfig.app.json --noEmit` — **no new errors** in files touched  
  (pre-existing: `helpArticles.ts` nullability; identity barrel missing `AccessDeniedPage` / guard modules)
- Manual check path: Academy → switch to EMP-1001 vs EMP-1002 → completion counts diverge; Supervisor → switch to EMP-2001 → dropdown shows three clinical reports

## Commit

`feat(user-setup): Phase 2C journey integration (impersonation + supervisor filter)`
