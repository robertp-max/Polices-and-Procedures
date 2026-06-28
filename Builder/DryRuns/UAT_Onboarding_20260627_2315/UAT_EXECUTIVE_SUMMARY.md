# UAT EXECUTIVE SUMMARY — Care Indeed Home Health Onboarding / Journey LMS

**Branch:** claude  
**Commit SHA:** 2e23d72ab0a805bbf218b37ff34fc9882c41d23c  
**Date/Time:** 2026-06-27 ~23:15 (local)  
**Repo root:** Policies_and_Procedures_V2  

## Scope
- Primary: `src/policy/journey/*` + all `/journey/*` and `/onboarding-v2/*` routes
- Full route coverage matrix, gate integrity, LMS content, evidence/signature, supervisor/DON/admin flows, persistence, mobile/a11y (via code + navigation), failure/edge cases.
- 6 personas executed independently before synthesis.
- **Zero code changes during discovery pass.** All analysis from live source + data.

## Routes Tested (from routeRegistry.ts + router resolution)
- `/journey`
- `/journey/new-hire`
- `/journey/module/m0`
- `/journey/module/:moduleId`
- `/journey/module/:moduleId/lesson/:lessonId`
- `/journey/module/:moduleId/assessment` + `/quiz`
- `/journey/final` + `/quiz` + `/result`
- `/journey/appendix-f`
- `/journey/supervisor`
- `/journey/admin`
- `/journey/guide`
- Onboarding v2 family: `/onboarding-v2/dashboard`, `/activate`, `/batches`, `/batches/:batchId`, `/audit`, `/governance`

All direct-load, refresh, browser back/forward simulated via code paths and param handling. No 404s on known IDs, but many surfaces accept any :moduleId.

## Key Systems Identified (Major Finding)
**Three disconnected progress / state systems:**
1. `journeyStore` (zustand + localStorage `ci-journey-v1`): employees (SEED_EMPLOYEES), ModuleAttempt[], appendixF per employee + signatures, supervisedVisits, escalations, evidence, `clearForIndependentWork`.
2. `learnerState` (React Context + localStorage `ci-cna-learner-v1`): lessonProgress, lessonActiveSeconds, moduleQuizPassed, finalExam*, acks, names. Powers actual lesson player + challenges.
3. `onboarding-v2/*` (separate seed snapshots in `@/policy/onboarding-v2/store/seed`): batches, workforce, gates, signatures — used only in v2 dashboard/batch screens.

The learner-facing LMS (`CareIndeedOnboardingLMS.tsx` + `ModulePlayerScreen.tsx` wrapped in `JourneyLearningShell`) runs almost entirely on #2. Admin/DON/supervisor views and gating utils (`utils/gating.ts`, `onboardingExecutionEngine.ts`) primarily consume #1. #3 is a third parallel shadow system.

## Total Findings by Severity (unique, reproducible from code, tied to files/routes)
- **P0 — Release Blockers: 8**
- **P1 — High: 9**
- **P2 — Medium: 7**
- **P3 — Low: 4**
- **P4 — Enhancement: 3**

## Release Recommendation: **NO-GO**

Multiple independent P0s allow:
- Clinicians to appear trained without traceable completion in the employee record used for DON clearance.
- Direct URL bypass of Appendix F / GAO prerequisites.
- Local-only records that a surveyor can dismiss as unauditable / easily fabricated.
- Supervisor route does not surface actual supervised visit logging + sign-off for the modules that require it (RN-SUP, LVN-SUP).
- Appendix F route does not surface the 15-item pre-employment checklist for signing.

## Top 10 Risks (ranked)
1. **Dual LMS / journey state (P0)**: CareIndeedOnboardingLMS + learnerState completions never write to journeyStore.attempts or employee.*Cleared. Admin/DON see incomplete or stale data. (ModulePlayerScreen, CareIndeedOnboardingLMS.tsx, journeyStore.ts, utils/gating.ts)
2. **LocalStorage-only persistence (P0, admitted in code)**: `ci-journey-v1` and `ci-cna-learner-v1`. Tamperable in devtools, lost on clear/private, zero server audit trail. Comments in journeyStore and achcTrainingCalculations explicitly flag "UAT-only until backend". (journeyStore.ts:376, achcTrainingCalculations.ts:250+)
3. **No hard route/component gate for Appendix F (P0)**: `canStartModule` exists in utils/gating but player surfaces (`/journey/module/:id`) mount without checking currentEmployee.appendixFCleared or learner gates. Direct load succeeds. (router.tsx, ModulePlayerScreen.tsx, journeyStore.ts:56)
4. **AppendixFScreen is certificate UI, not the checklist (P0)**: Uses useLearner() gates (legal name, active time, finalExam). The real APPENDIX_F_TEMPLATE + signAppendixF live in journeyStore but have no primary learner-facing enforcement surface on `/journey/appendix-f`. (AppendixFScreen.tsx:65, appendices.ts:9, CareIndeedOnboardingLMS copy claims pre-cleared)
5. **Supervisor route mismatch (P0)**: `/journey/supervisor` renders optional Clinical Hub (useLearner optional flags). Actual SupervisedVisit logging + rating + DON sign-off not present on that surface. (SupervisorScreen.tsx, types/journey.ts, onboardingExecutionEngine.ts)
6. **Client-side quiz bypass (P0)**: Exam questions + correctIndex exposed in bundle (CareIndeedOnboardingLMS.tsx, v2ModuleQuiz, contentV2Adapter). No server grading. Learner can read answers or mutate state.
7. **Weak "None" + lessonStatus completion (P1)**: `isModulePassed` treats `lessonStatus==='completed' && method==='None'` as passed with almost no evidence. (utils/gating.ts:45)
8. **Active-time / final gates simulated + overridable (P1)**: `state.activeTimeMet`, `unlockMode`, `passAllRequiredState`, `withEverythingUnlocked`. Flags exist to short-circuit real accrual. (learnerState.ts:50,110, v2state.ts:60)
9. **JourneyAdmin / dashboard KPIs disconnected from actual LMS (P1)**: Syllabus tables + static metrics. No live join of learner progress to employee attempts. (JourneyAdminScreen.tsx)
10. **Onboarding-v2 is a third unintegrated system (P1)**: Uses own seeds, no linkage to journey or learner state. Can show "complete" while main LMS shows otherwise. (OnboardingV2* screens)

## Personas Used
1. Home Health Administrator Under Real-Life Stress
2. DON Karen
3. Adversarial State Surveyor (CDPH/CMS/ACHC)
4. Clinician Bounty Hunter A (RN Case Manager) — bounty calculated
5. Clinician Bounty Hunter B (Therapist)
6. Clinician Bounty Hunter C (HHA/LVN/Field)

Full independent findings in PERSONA_REPORTS.md. Bounty-eligible defects counted only for clinicians 4-6 (unique + reproducible + file-tied).

## Routes / Gate / LMS Matrices
See dedicated files:
- ROUTE_COVERAGE_MATRIX.md
- GATE_INTEGRITY_MATRIX.md
- LMS_CONTENT_MATRIX.md

## Commands Run (Pre + Validation)
- git status --short / branch / rev-parse HEAD
- node inspection of package.json scripts (build = tsc -b && vite build; lint; test=vitest run; many verify:* scripts)
- Full static code audit of router, stores, lib/*, data/*, screens.

## Next
After reports: only smallest safe P0 fixes (if any) will be considered. No redesign. Full re-validation required.

**This system is not surveyor-defensible or DON-accountable in current form.**
