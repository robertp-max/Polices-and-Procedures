# Stabilization Validation & Testing Matrix

**Purpose:** This document defines the validation and testing requirements for each workstream and task in the 3-week Stabilization phase. It ensures that every item is properly verified before being considered complete.

**Relationship:** This is a supporting document for the Stabilization Precursor Phase. It is separate from the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md.

---

## 1. Validation Principles

- Every task must have at least one clear validation method.
- Validation should cover **Runtime**, **Mobile**, and **Browser** where applicable.
- Protected systems (eCign, Evidence, CES identity) require stricter validation.
- Validation can be done by agents, but final sign-off should involve a human lead where possible.
- “Build green” is never sufficient — runtime and real-device testing are required for P0 items.

---

## 2. Validation Matrix by Workstream

### Workstream 1: Navigation & History Stability

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| N-01 | Remove global swipe navigation | Confirm no swipe handlers remain in CommandCenterLayout | Test on iOS + Android | N/A | Verify no residual gesture code |
| N-02 | Remove global arrow key navigation | Confirm no ArrowLeft/ArrowRight handlers | N/A | Confirm arrow keys no longer hijack | - |
| N-03 + N-04 | Clean aggressive `replace: true` | Test navigation flows after changes | Test mobile navigation | Full browser Back/Forward test on 8+ flows | Document any remaining `replace` cases |
| N-06 | Standardize modal/drawer escape | Test Esc key on all major modals | Test swipe-down + back on mobile | Test browser back from modal | - |
| N-07 | Deep-link restoration | Test deep links on core flows | Test on mobile | Test across Chrome, Edge, Safari | - |

---

### Workstream 2: Runtime & Session Resilience

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| R-01 | FormStateManager utility | Unit tests + integration tests | N/A | N/A | Core utility must be solid |
| R-02 | eCign form draft persistence | Refresh at 30/60/90% completion | Mobile refresh test | All major browsers | Protected subsystem |
| R-03 | Onboarding V2 form persistence | Refresh + interruption test | Mobile test | - | - |
| R-04 | visibilitychange + interruption recovery | Simulate app background/foreground | Real device test | Tab switch test | - |
| R-05 | State staleness detection | Test with delayed server responses | - | - | - |
| R-06 | Long-idle session recovery | Leave form open 12+ hours, then return | - | - | - |
| R-07 | Modal re-entry behavior | Test browser back + re-open modal | Mobile test | - | - |
| R-08 | Partial-save on multi-step forms | Test save at each logical step | - | - | Onboarding V2 focus |

---

### Workstream 3: Mobile & Field Survivability

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| M-01 | Real-device UAT on core flows | N/A | iOS + Android, normal + throttled | N/A | Minimum 80% pass rate |
| M-02 | One-handed usability + 48px targets | N/A | Thumb-zone testing | N/A | - |
| M-03 | Evidence upload under weak signal | N/A | Throttled + intermittent | N/A | Test offline queue + retry |
| M-04 | eCign signing under interruption | N/A | Call + background + return | N/A | Draft must survive |
| M-05–M-07 | CES, Onboarding V2, rotation tests | N/A | Real device + rotation | N/A | - |
| M-08 | Document mobile issues | N/A | Compile findings | N/A | Create follow-up list |

---

### Workstream 4: Protected Systems & Rollback Readiness

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| P-01 | Define Protected Subsystems | N/A | N/A | N/A | Document + communicate |
| P-02 | Rollback Trigger Matrix | Review with stakeholders | N/A | N/A | Must be clear and actionable |
| P-03 | Assign rollback owners | Confirm owners understand responsibilities | N/A | N/A | - |
| P-04 | Rollback Execution Checklist | N/A | N/A | N/A | Step-by-step |
| P-05 | Execute rollback drill | Run drill on non-critical surface | N/A | N/A | Document results + time taken |
| P-06–P-08 | Isolation boundaries, post-rollback validation, communication plan | Review + approval | N/A | N/A | - |

---

### Workstream 5: Design System Guardrails

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| D-01 | ESLint rules (block raw values, enforce --ci-*) | Run on sample PRs | N/A | N/A | Must fail on violations |
| D-02 | Visual regression PR requirement | Test on 2–3 PRs | N/A | N/A | - |
| D-03 | Glass layer enforcement (max 2) | Code review + lint if possible | N/A | N/A | - |
| D-04–D-06 | Deprecation plan + audits + guidelines | Review with Design Systems team | N/A | N/A | - |

---

### Workstream 6: Validation & Governance Infrastructure

| Task ID | Task | Runtime Validation | Mobile Validation | Browser Validation | Notes |
|---------|------|--------------------|-------------------|--------------------|-------|
| V-01 | Define Go/No-Go gates | Review with all leads | Include mobile gates | Include browser gates | Must be binary where possible |
| V-02 | Runtime Validation Matrix | Populate per workstream | - | - | - |
| V-03 | Mobile Field UAT test cases | - | Create detailed cases | - | Include weak signal + interruption |
| V-04–V-08 | Rollback owners, post-rollback checklist, UAT feedback process, success metrics, final Go/No-Go review | Review + approval | - | - | - |

---

## 3. Cross-Cutting Validation Requirements

- **Protected Systems (eCign, Evidence, CES identity):** Any change touching these must pass both the workstream-specific validation **and** a dedicated integrity check.
- **Design System Changes:** Must pass visual regression + lint before merge.
- **Navigation Changes:** Must pass browser back/forward test suite before merge.
- **Mobile Changes:** Must pass real-device testing (minimum iOS + Android).

---

## 4. Recommended Validation Cadence

- **End of Week 1:** Full validation of all Week 1 tasks + initial Go/No-Go review.
- **End of Week 2:** Mid-phase validation + rollback drill results.
- **End of Week 3:** Final validation + Go/No-Go decision before wider UAT exposure.

---

**Document Status:** Living. Will be updated as tasks are completed and new validation needs are discovered.

---

*This matrix ensures that every Stabilization task has clear, measurable validation — not just “it builds green.”*