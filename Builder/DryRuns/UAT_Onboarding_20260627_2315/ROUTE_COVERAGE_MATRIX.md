# ROUTE_COVERAGE_MATRIX

| Route | Direct Load | Refresh | Back/Forward | Mobile (code) | Role Gate | Data Persistence | Result | Notes |
|-------|-------------|---------|--------------|---------------|-----------|------------------|--------|-------|
| /journey | Yes | Yes | Yes | Shell ok | No (shows overview) | learner + journeyStore (separate) | Loads CareIndeedOnboardingLMS | Entry point. Shows "My Learning". No current employee visible in header. |
| /journey/new-hire | Yes | Yes | Yes | ok | No | learnerState | Static gate list | NewHireScreen shows 4 gates, some "In Progress" hardcoded. |
| /journey/module/m0 (orientation) | Yes | Yes | Yes | dense cards | No | learnerState | Player loads | Module 0 = orientation acks + legal name. |
| /journey/module/:moduleId (GAO-XXX, RN-XXX etc) | Yes (any id) | Yes | Yes (partial) | Possible cramped | **No** (P0) | learnerState (primary); attempts not written | Loads even if blocked | getModuleDef may return undef for unknown. No appendixFCleared check. |
| /journey/module/:moduleId/lesson/:lessonId | Yes | Yes | Yes | Scrolling inside player | No | learner + activeTime | Lesson renders | Active time heartbeat runs. |
| /journey/module/:moduleId/assessment | Yes | Yes | Yes | ok | No | learner | Quiz splash | |
| /journey/module/:moduleId/assessment/quiz | Yes | Yes | Yes | ok | No | moduleQuizPassed in learner | Client quiz | Answer keys visible in source. |
| /journey/final + /quiz + /result | Yes | Yes | Yes | ok | No | learner finalExam* | Final path | Simulated per gates. |
| /journey/appendix-f | Yes | Yes | Yes | Print ok | No | learnerState | Certificate UI | **Not** the 15-item checklist. Static image sig. |
| /journey/supervisor | Yes | Yes | Yes | ok | No | learner (optionalClinical) | Clinical Hub optional | **No** supervised visit logger. Huge mismatch vs RN-SUP etc requirements. |
| /journey/admin | Yes | Yes | Yes | ok | Assumes ADM role | journeyStore (but static UI) | Syllabus + fake KPIs | No live blocked list. |
| /journey/guide | Yes | Yes | Yes | ok | No | N/A | User guide | |
| /onboarding-v2/dashboard | Yes | Yes | Yes | ok | No | Separate seed snapshot | Metrics + queue from seed | Third system. |
| /onboarding-v2/activate | Yes | Yes | Yes | ok | No | seed | Activation panel | |
| /onboarding-v2/batches + /:batchId | Yes | Yes | Yes | ok | No | seed | Batch roster + detail | Static-ish from buildSeedSnapshot. |
| /onboarding-v2/audit | Yes | Yes | Yes | ok | No | seed | Audit surface | |
| /onboarding-v2/governance | Yes | Yes | Yes | ok | No | seed | Overrides | |

**Summary:** Every route is directly mountable. No router guards. Gating is advisory at best inside some utils. Mobile support is "glassmorphism + tailwind" but player content not proven phone-first. Persistence split across three stores = inconsistent after any navigation/refresh/employee switch.
