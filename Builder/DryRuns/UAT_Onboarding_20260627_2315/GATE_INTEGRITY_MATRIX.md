# GATE_INTEGRITY_MATRIX

| Gate | Can Bypass? | Required Evidence | Signer Required | Persistence | Audit Trail | Result | Notes |
|------|-------------|-------------------|-----------------|-------------|-------------|--------|-------|
| Appendix F (pre-employment 15 items) | **Yes (P0)** | 15 items PASS/NA in APPENDIX_F_TEMPLATE | HRDirector role only (store check) | journeyStore localStorage | None (just array + signatures array) | **FAIL** | Real checklist not shown on /journey/appendix-f. signAppendixF logic good on paper but unreachable from main learner path. |
| GAO complete before ROLE modules | **Yes (P0)** | All 27 + GAO-EXAM per modules.ts | Via isModulePassed on attempts | journeyStore attempts | Weak (completedAt) | **FAIL** | canStartModule implements it. Player never calls it. LearnerState has separate "requiredTheoryComplete". |
| Lesson viewed + knowledge check + active time | Partial (P1) | viewed + checkPassed (if knowledgeCheck) + >=20s (or activeTimeMet flag) | N/A | learnerState localStorage | None | Weak | activeTime.ts has real heartbeat + idle. But state.activeTimeMet override + withLessonCompleted force it. Multiple tabs race. |
| Module quiz pass (80%) | **Yes (P0)** | score >= threshold or lessonStatus | N/A | moduleQuizPassed / attempts scoreRaw | Client only | **FAIL** | Client-side correct answers. No server. Easy mutate. |
| Supervised visits (RN 2 / LVN 3 / etc) | **Yes (P0)** | rating==='SATISFACTORY' count >= required | DON/Supervisor on clear | journeyStore.supervisedVisits | Signatures array | **FAIL** | No UI on /journey/supervisor to create the records. canClear logic exists but not wired. |
| Final exam | Yes (P1) | finalExamPassed | N/A | learnerState | None | Weak | Marked simulated in gates. |
| DON / Supervisor clearance (clearForIndependentWork) | Partial | Signature with role DON/Supervisor + evidence created | Yes (in function) | journeyStore + evidence[] | One evidence record created | Partial | Logic ok (`if role !== DON && !== Supervisor`). But no discoverable UI to reach it with the required visit evidence attached. |
| Role-based module assignment | Yes (P1) | modulesForRole + roles[] on module | N/A | Static in data/modules.ts | N/A | **FAIL in execution** | Catalog correct. Execution (player + complete) does not filter by current journey employee.role. |
| Evidence attachment | Partial | addEvidence call | N/A | local only | Timestamp | Weak | No file type validation visible, no hash, no backend. |
| SignatureRecord | Yes | Just object with name/role/date? | Checked only on append | local | None | Weak | No cryptographic signature, no eCIgn integration here. |

**Overall Gate Integrity: Catastrophic for production compliance use.**

The functions that look correct (`signAppendixF`, `clearForIndependentWork`, `canStartModule`, `isModulePassed`) are not the ones driving the learner experience surfaces. The surfaces drive a different state machine.
