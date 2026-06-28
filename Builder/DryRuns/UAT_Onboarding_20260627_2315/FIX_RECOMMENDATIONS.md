# FIX_RECOMMENDATIONS

**Rule followed:** Only smallest safe fixes for P0 release blockers after full report. No redesign. No fake claims.

## P0 Release Blockers (must address before any real user)

1. **Dual state (P0-001)** — Critical. Smallest safe: on every significant learner complete in ModulePlayer / CareIndeedOnboardingLMS (withLessonCompleted, withModuleAssessment, final), also call into journeyStore to create/update a matching ModuleAttempt for currentEmployee. Wire `startAttempt` / `finalizeAttempt` (or lightweight version) from the player surfaces. At minimum write `lessonStatus: 'completed'` + score when quiz passes.

2. **No hard gate on routes/player (P0-002)** — Add a thin `JourneyGate` wrapper used by ModulePlayerScreen, assessment routes, etc. It reads `useJourneyStore` current employee + `canStartModule` (or simplified) + learner gates. If blocked, show clear message + button to Appendix F or overview. Do not prevent mount entirely if it breaks other things — block content + prominent banner.

3. **LocalStorage production risk (P0-003)** — Do **not** claim production. Add prominent persistent banner on all /journey/* and onboarding-v2 surfaces: "DEMO MODE — training records are browser-local only and not suitable for personnel files or survey evidence." (Already some language in shell footer — promote it.) Do not "fix" by pretending.

4. **Appendix F surface mismatch (P0-004)** — Smallest: make /journey/appendix-f (when used in journey context) render or link to the real APPENDIX_F_TEMPLATE for the current journey employee, with ability to update items and call signAppendixF (require HRDirector role selection + validation). If time, add simple form for the 15 items. Keep the certificate view as secondary.

5. **Supervisor visit logging absent (P0-005)** — Add a minimal "Record Supervised Visit" section to SupervisorScreen (or a sub-tab). Form: select employee, module (only those with supervisedVisitsRequired), rating (SATISFACTORY/UNSAT), notes, date, your signature (name + role + timestamp). On submit call addSupervisedVisit and optionally auto-recompute. This makes the RN-SUP etc gates real.

6. **Client quiz integrity (P0-006)** — For this release: at minimum do not expose `correctIndex` in the rendered UI. Move scoring into a function that still lives client but at least requires the interaction to have happened (disable "pass" until all questions answered). Document that true enforcement needs backend. Do not rewrite the entire quiz engine.

7. **Weak None completion (P0-007)** — In isModulePassed / gating, for method==='None' still require a positive learner action (e.g. orientationFinalAck style or a required "attest" checkbox per module). Small change in the pass predicate.

8. **Invalid module / error states (P0-008)** — Add guard in ModulePlayerScreen: if (!def) return <div>Unknown module. <Link to="/journey">Return to overview.</Link></div>. Same for bad employee.

## P1 High-Risk (localized, do after P0s if low risk)

- Bind JourneyAdmin KPIs and blocked lists to real journeyStore + gating calculations instead of literals.
- Add role enforcement in player start/complete using current journey employee.
- Surface live escalations in admin.
- Add "Export Training Record" (simple printable summary) for one employee.

## P2 Usability

- Improve mobile lesson navigation + sticky progress/complete bar.
- Consistent "this is demo / not validated" labeling everywhere.
- Better empty states and employee context display in player shell.

## Quick Wins

- Promote the existing "No PHI. Demo..." footer to a top banner on journey surfaces.
- Make currentEmployee visible + switchable from top of JourneyOverview / player.
- Label all "simulated" gates with the exact flag that bypasses them.

## Do-Not-Fix / Acceptable Limitations (for this cycle)

- Full backend persistence (architectural — document honestly instead of faking).
- Cryptographic signatures / eCIgn integration for journey (separate system exists).
- Complete rewrite of quiz or unification of the three state systems (too big; smallest bridge only).
- Onboarding-v2 full merge (it's a parallel experiment; scope it or kill it later).
- ACHC annual fully integrated into employee journey (separate for now).

**Never** add language claiming "ACHC-ready", "CMS survey ready", "defensible personnel record" while the above P0s exist.
