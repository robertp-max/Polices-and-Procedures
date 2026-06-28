# UAT_RAW_NOTES — Messy observations, console (none), near-misses, not-yet-defects

## Pre-UAT Commands Executed
- git status --short → many M (including journey data, stores, v6 components), some ?? untracked. Working tree NOT clean at start of UAT.
- git branch: claude
- HEAD: 2e23d72ab0a805bbf218b37ff34fc9882c41d23c
- package scripts: build=tsc-b && vite, lint, vitest, many verify:*, no dedicated typecheck alias but tsc used in build.

## Architecture Shock (repeated)
Two (actually three) completely separate persistence and completion models living under the same /journey/* routes. This was the single biggest reproducible defect class.

journeyStore (ci-journey-v1) comment at top:
"Persisted to localStorage so a surveyor-ready audit trail survives reload. A production build should swap the persistence adapter for a secure API layer"

achcTrainingCalculations.ts contains strings like:
"persistence_note": "Journey training state currently uses the localStorage-backed journey store; ACHC completion is marked UAT-only until backend..."

This is honest code, but the UI does not scream it loudly enough.

## Appendix F Confusion (major source of P0-004)
- APPENDIX_F_TEMPLATE + signAppendixF + ensureAppendixF in journeyStore → real pre-hire.
- /journey/appendix-f → renders using useLearner() + gates for certificate + a static signature image.
- CareIndeedOnboardingLMS copy says "Appendix F already done before you got here".

Result: a surveyor asking "show me the signed Appendix F for Maria" would be shown either a certificate or a devtools JSON object, not a single attributable signed form.

## Supervisor Route
SupervisorScreen is 100% optional clinical hub. The actual "Supervisor" needs (logging RN/LVN supervised visits for clearance) are implemented only as data types + gating math + calls in onboardingExecutionEngine. No form.

## Player vs Store
ModulePlayerScreen + CareIndeedOnboardingLMS use:
- useLearner()
- withLessonCompleted, withModuleAssessment, isModuleComplete (moduleProgress)
- active time hook

They never import useJourneyStore or call startAttempt/finalizeAttempt/recordManualAssessment.

Journey admin/supervisor/execution engine do the opposite.

## Quiz Exposure
In the big LMS file there are inline ExamQuestion[] with correctIndex. Also appendices has GAO_EXAM_ITEMS. Bundle inspection would reveal answers instantly.

## Onboarding-v2
Separate policy/onboarding-v2 dir + seed. The v2 dashboard/batch screens use buildSeedSnapshot and show nice gates, but they are not wired to either of the other two. Another source of "complete" that doesn't mean anything for the main journey.

## Content Notes
- Lots of real policy refs in modules.ts (good).
- cms485 advanced training has its own verification script in the attached user file (compare_content.ts) — indicates manual porting was needed and is still being validated.
- Many "Visual Aid Pending" + long text.
- No obvious broken images in the manifests, but media is static.

## Persistence Keys
- ci-journey-v1 (zustand)
- ci-cna-learner-v1 (learnerState)
- OWNER_KEY for active time tab ownership
- Separate onboarding-v2 seed (in-memory per load mostly)

## Dirty Tree Impact
At the moment of this UAT the tree has dozens of modified files in journey/data and v6. Any "current behavior" could differ from committed. Bad for reproducibility of training records.

## Edge Cases Hit in Code
- merge logic in journeyStore persist tries to recover currentEmployee and seed appendixF bags.
- If SEED_EMPLOYEES change, old persisted data may have stale employees.
- No handling for "employee deleted".
- Invalid moduleId → silent fail or empty content.
- Refresh mid-quiz: learner state may keep partial page but quiz attempt state is simple object.

## No Real Errors Observed
No console errors from static analysis. The bugs are logical / integrity, not crashes.

## Mobile / A11y Code Smells (not full test)
- Heavy use of glassmorphism / backdrop-blur — contrast may suffer on some devices.
- Player uses lots of small icons + text.
- No obvious `aria` labels on lesson complete buttons in the inspected fragments.
- Keyboard: standard React router + buttons, but no explicit focus management in player.

## Things That Are Actually Good (rare in this UAT)
- Catalog in modules.ts has real CMS/ policy cross-refs and role separation.
- Some defensive rehydration in persist.
- Explicit "No PHI" warnings in multiple places.
- Supervisor screen correctly labels optional as not affecting certificate.
- Active time has idle detection + tab ownership attempt.

## Remaining Open Questions (not defects yet)
- Is there any server route that actually persists journey state? (from grep, onboardingExecutionEngine reads store but no write API visible).
- How does a real DON "select" an employee to supervise? (currentEmployeeId is global in store).
- Where is the real signature pad / e-sign for journey (separate from ecign workspace)?
- Are OnboardingV2 and Journey intended to converge or is v2 the future?

## Console / Runtime
None captured (no browser automation in this pass). All findings are from code paths, data shapes, and mount logic that would be exercised on direct navigation / refresh / state mutation.

End of raw notes.
