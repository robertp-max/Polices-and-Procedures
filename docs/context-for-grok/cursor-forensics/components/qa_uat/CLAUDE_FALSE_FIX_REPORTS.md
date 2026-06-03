# Claude False Fix Reports — AI Agent Declared Fixes Without Browser Validation

**Component**: QA / UAT Process / AI Agent Reliability  
**Severity**: Cross-cutting — affects all other components; creates false closure on open issues  
**Status**: Active systemic risk as of 2026-05-14  

---

## 1. Symptoms Reported by User

- A fix was declared complete by the AI agent in a prior session
- The user opened the browser and observed the same symptom
- The same fix cycle repeated in a subsequent session, sometimes more than twice
- The user cannot determine which "fixed" issues are actually resolved versus which ones only passed a build check
- The user was repeatedly required to re-report the same issue across sessions

Transcript sources showing escalated user frustration due to false fix declarations:
- `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`: Evidence reset reported fixed 3+ times in same session; user confirmed broken after each fix declaration
- `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`: *"cant u fix anything in a single prompt? do i have to prompt the same thing 100 times before u get it"*
- `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`: *"Fix this and only consider it reset and fixed when this all shows 0%"* — user explicitly requiring visual proof of 0% state; agent did not provide screenshot before declaring fix
- `3cf17f83-d2d2-4eff-8be0-855974539cb4`: Playwright UAT run → 34 tests "passed" → but 6 defects captured — the Playwright test infrastructure passed but the defect log was never surfaced as failures to the user

---

## 2. Confirmed Instances of False Fix Declarations

| Component | False Fix Claim | What Was Actually Validated | Evidence Source |
|-----------|----------------|------------------------------|-----------------|
| Auth (Vercel) | Fixed 2+ times | Build passed; env var set in dashboard — no browser login test | `c2cb5aee`, multiple sessions |
| Evidence Reset | Fixed 3+ times in one session | Agent reported implementation complete — no screenshot of 0% state | `cacb1d6f`, May 11 2026 |
| eCIgn PDF chain | Fixed (claimed) | Signing UI rendered — artifact retrieval from stored PDF never tested | `cacb1d6f`, multiple passes |
| Form persistence | "Working" in prior sessions | Form rendered — persistence after hard refresh never tested | `3cf17f83` DEFECT-Q2-004 |
| Audit trail links | "Rendered correctly" | Audit entries visible — "View Artifact" links never verified to appear | `3cf17f83` DEFECT-Q2-006 |
| Google Calendar push | "Implemented" | Push handler built — user confirmed zero events in Google Calendar | `ca487a81` |
| Sprint board tasks | "Board renders" | Board visual confirmed — task card `data-testid` and selector functionality never tested | `3cf17f83` DEFECT-Q2-001 |

---

## 3. Why This Pattern Recurs

The AI agent (Claude) operates by reading code, reasoning about the likely cause of a symptom, editing files, and confirming that the build succeeds. This is structurally insufficient for a class of bugs where the failure mode only manifests at browser runtime:

- **Build-time env vars** (`VITE_LOCAL_DEMO_AUTH_BYPASS`): Edit is correct, build passes, but deployed artifact was built before the edit. Fix is real but not yet applied.
- **Route drift**: Component compiles correctly, but the route resolves to the wrong target at runtime. The compiler does not know what the router will do.
- **In-memory state**: Code correctly writes to a store, but the store is not persisted. The compiler cannot detect that a reload will lose the data.
- **Object URL lifetime**: `URL.createObjectURL()` compiles and runs correctly — until the session ends.
- **`localStorage` not cleared**: Reset function clears in-memory caches but the compiler cannot verify that `localStorage.removeItem('reg-execution-v2')` was called.

In all these cases, the agent's confidence is based on reasoning about static code. Runtime behavior is not observable from static code alone.

The second contributing factor: the agent does not block itself from declaring a fix complete. It relies on the user to interrupt and request a browser test. If the user does not know to ask, or the session ends before testing, the fix is recorded as resolved.

---

## 4. Structural Root Cause

The AI agent's validation loop is:

1. Identify likely cause from code reading
2. Edit code
3. Confirm build passes
4. Declare fix complete

The missing step:

3b. **Request or perform browser runtime validation before declaring complete**

Without step 3b, the declaration of completion is a code-review opinion, not a tested result.

---

## 5. CES UAT False Pass — Playwright Exit Code vs. Defect Log

A specific pattern was observed in the CES Q2 2026 UAT (transcript `3cf17f83`, May 10–11, 2026):

- 34 Playwright tests ran
- All 34 tests reported "passed" (exit code 0)
- However, 6 defects were captured in the `afterAll` hook defect log
- The defect log was written to a file, but the test exit code was 0
- The agent declared "34 tests completed — all passed with defects captured"

This is a testing architecture issue: defects captured in an `afterAll` hook outside the test assertions do not cause the test suite to fail. The user would see "34 passed" and reasonably interpret this as all issues resolved, but 6 defects (3 Critical) were documented separately.

**This constitutes a false pass reporting pattern**, even when Playwright is being used. Exit code 0 ≠ no defects when the defect capture mechanism is external to the assertion framework.

---

## 6. Validation That Was Claimed

In all known false fix instances:

- Source code was read and a plausible fix was applied
- TypeScript compilation succeeded
- Vite build succeeded (where applicable)
- No new linter errors were introduced
- "34 tests passed" (Playwright exit code 0)

---

## 7. Validation That Was Missing

In all known false fix instances:

- Browser was not opened to the deployed or local URL
- The specific user action that previously triggered the symptom was not performed
- The expected outcome was not observed in the browser
- No URL, role, or action was documented as evidence of the test
- Screenshots were not provided before declaring fixes complete (even when user explicitly requested screenshots as proof)

---

## 8. Required Protocol for All Future Fixes

Every fix, regardless of component, must satisfy the following checklist before being declared complete:

**Fix Validation Checklist**

- [ ] **Build check**: TypeScript compiles, Vite builds, no console errors at startup
- [ ] **Deploy check** (if applicable): New build deployed (not `vercel redeploy` of stale artifact)
- [ ] **Browser open**: URL opened in a real browser (not just confirmed in code)
- [ ] **Action performed**: The specific user action that previously triggered the symptom is performed
- [ ] **Outcome observed**: The expected outcome is observed in the browser
- [ ] **Evidence documented**: The URL, user role, and action taken are written down
- [ ] **Screenshot provided** (when user requested): Screenshot attached before declaring complete
- [ ] **Playwright defect log checked**: If using Playwright, confirm defect log is empty (not just exit code 0)

If any item is unchecked, the fix status must be recorded as **IN PROGRESS**, not **RESOLVED**.

---

## 9. Acceptance Criteria for Process Fix

- [ ] The validation checklist above is referenced at the start of every fix session
- [ ] The AI agent does not use the word "fixed," "resolved," or "complete" unless all checklist items are confirmed
- [ ] If browser runtime testing is not feasible in the current session (environment not accessible), the fix is explicitly marked as "code change applied — browser test pending"
- [ ] A log of confirmed browser tests is maintained, separate from a log of code changes
- [ ] Prior "fixed" statuses on all components in this forensic set are treated as **unverified** until a browser test result is documented
- [ ] Playwright test suites use assertions (not `afterAll` defect-capture hooks) as the primary defect reporting mechanism; test suite must fail if defects are found

---

## 10. Note on Scope

This document describes a process failure, not a code failure. It does not require a code change to remediate. It requires a change in how fix completion is evaluated and communicated. The responsibility for enforcing the validation checklist rests with both the AI agent (by not declaring premature completion) and the user (by requiring evidence before accepting a fix as resolved).

All "CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION" entries in this forensic set are direct consequences of the failure described in this document.
