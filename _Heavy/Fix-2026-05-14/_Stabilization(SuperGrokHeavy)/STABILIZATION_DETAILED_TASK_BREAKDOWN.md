# Stabilization Detailed Task Breakdown (3-Week Plan)

**Purpose:** This document breaks down the full Stabilization phase into granular, assignable tasks with dependencies. It is designed to be split across the 32 available agents (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower) over a 3-week period while running in parallel with the main Unified MVP implementation.

**Important Notes:**
- Stabilization is a **precursor** phase only. It must **not overlap** with the core implementation waves of the UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.
- All 16 operational realism items are treated with balanced importance.
- The MVP implementation is being rushed for next week, but Stabilization follows a deliberate 3-week timeline.
- Tasks are grouped by Workstream for easier agent assignment.

---

## Workstream 1: Navigation & History Stability

**Goal:** Eliminate global gesture hijacking and restore predictable browser navigation behavior.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| N-01 | Remove global touch swipe handlers from `CommandCenterLayout.tsx` | None | P0 | Low | Week 1 | N-02, N-03 | Highest user pain item |
| N-02 | Remove global `ArrowLeft` / `ArrowRight` keyboard handlers from `CommandCenterLayout.tsx` | None | P0 | Low | Week 1 | N-01, N-03 | Highest user pain item |
| N-03 | Audit all `Navigate` components using `replace: true` in `App.tsx` | None | P0 | Medium | Week 1 | N-01, N-02 | Identify which are safe to remove |
| N-04 | Remove `replace: true` from normal internal navigation routes (CES, Evidence, eCign, Onboarding V2, Calendar) | N-03 | P0 | Medium | Week 1 | N-05 | Keep only for true legacy aliases |
| N-05 | Create follow-up list of ambiguous `replace: true` cases for later cleanup | N-03 | P1 | Low | Week 1 | - | Defer non-critical ones |
| N-06 | Standardize modal + drawer escape behavior (Esc key + browser back) | N-01, N-02 | P1 | Medium | Week 2 | N-07 | Affects many surfaces |
| N-07 | Audit and fix deep-link restoration on core flows (CES, Evidence, eCign) | N-04 | P1 | Medium | Week 2 | - | Ensure context is preserved |
| N-08 | Document new navigation behavior and update any internal guides | N-01, N-02, N-04 | P2 | Low | Week 3 | - | For team reference |

---

## Workstream 2: Runtime & Session Resilience

**Goal:** Ensure forms and critical workflows survive refresh, interruption, and session loss.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| R-01 | Design and implement `FormStateManager` utility (localStorage + optional server draft) | None | P0 | Medium | Week 1 | R-02, R-03 | Core utility for multiple forms |
| R-02 | Integrate form draft persistence into eCign forms (`FormSigningWorkspace.tsx`) | R-01 | P0 | Medium | Week 1 | R-04 | Protected subsystem – coordinate with E-01 |
| R-03 | Integrate form draft persistence into Onboarding V2 gate forms | R-01 | P0 | Medium | Week 1 | R-05 | - |
| R-04 | Add `visibilitychange` + `beforeunload` listeners for interruption recovery on major forms | R-02 | P0 | Medium | Week 1 | R-03 | - |
| R-05 | Add basic state staleness detection on CES and Evidence data fetches | None | P1 | Medium | Week 2 | - | - |
| R-06 | Implement long-idle session recovery (draft available after overnight) | R-01 | P1 | Medium | Week 2 | - | - |
| R-07 | Standardize modal/drawer re-entry behavior after browser back or escape | N-06 | P1 | Medium | Week 2 | - | - |
| R-08 | Add partial-save at logical step boundaries for complex multi-step forms (Onboarding V2) | R-01, R-03 | P2 | Medium-High | Week 3 | - | - |

---

## Workstream 3: Mobile & Field Survivability

**Goal:** Ensure core operational flows are usable on mobile under real-world conditions.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| M-01 | Execute dedicated real-device UAT on iOS Safari and Android Chrome for core flows | None | P0 | Medium | Week 1 | M-02 | Include weak signal testing |
| M-02 | Validate one-handed usability and 48px+ touch targets on Evidence, eCign, CES, Onboarding V2 | M-01 | P0 | Low | Week 1 | - | - |
| M-03 | Test Evidence capture + upload under throttled and intermittent network | M-01 | P0 | Medium | Week 1 | - | - |
| M-04 | Test eCign signing flow under interruption (call, background, low battery) | M-01 | P0 | Medium | Week 1 | - | - |
| M-05 | Test CES task completion flow on mobile only (one-handed) | M-01 | P0 | Medium | Week 1 | - | - |
| M-06 | Test Onboarding V2 gate progression on mobile under realistic conditions | M-01 | P1 | Medium | Week 2 | - | - |
| M-07 | Validate mobile rotation survivability on forms and signature pads | M-02 | P1 | Low | Week 2 | - | - |
| M-08 | Document mobile-specific issues found during UAT and create follow-up list | M-01–M-07 | P2 | Low | Week 3 | - | - |

---

## Workstream 4: Protected Systems & Rollback Readiness

**Goal:** Protect critical systems and ensure rollback capability exists.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| P-01 | Formally define Protected Subsystems (eCign, Evidence Center, CES identity) | None | P0 | Low | Week 1 | P-02 | Document + communicate |
| P-02 | Create Rollback Trigger Matrix with clear conditions | P-01 | P0 | Low | Week 1 | - | - |
| P-03 | Assign named rollback owners for each Protected Subsystem | P-01 | P0 | Low | Week 1 | - | - |
| P-04 | Create Rollback Execution Checklist | P-02, P-03 | P0 | Low | Week 1 | - | - |
| P-05 | Execute at least one rollback drill on a non-critical surface | P-04 | P0 | Medium | Week 2 | - | Document results |
| P-06 | Define and document subsystem isolation boundaries | P-01 | P1 | Medium | Week 2 | - | - |
| P-07 | Add post-rollback validation checklist for protected systems | P-05 | P1 | Low | Week 2 | - | - |
| P-08 | Create communication plan for rollback events | P-03 | P2 | Low | Week 3 | - | - |

---

## Workstream 5: Design System Enforcement

**Goal:** Begin enforcing the v2 design system technically and culturally.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| D-01 | Implement ESLint rules to block raw hex/rgb values and non-`--ci-*` tokens | None | P0 | Low | Week 1 | D-02 | High value, low effort |
| D-02 | Add visual regression requirement to PR checklist for `ui/` components | None | P0 | Low | Week 1 | D-01 | - |
| D-03 | Enforce max-2 glass layers rule via lint or review checklist | D-01 | P1 | Low | Week 2 | - | - |
| D-04 | Begin deprecation plan for parallel component families (CesCard, local TabButton, etc.) | D-01, D-02 | P1 | Medium | Week 2 | - | - |
| D-05 | Audit remaining parallel styling in high-traffic surfaces | D-01 | P1 | Medium | Week 2 | - | - |
| D-06 | Update internal design system contribution guidelines | D-02 | P2 | Low | Week 3 | - | - |

---

## Workstream 6: Validation, UAT & Governance Infrastructure

**Goal:** Build the validation and decision-making framework for the rollout.

| Task ID | Task Description | Dependencies | Priority | Complexity | Suggested Week | Parallelizable With | Notes |
|---------|------------------|--------------|----------|------------|----------------|---------------------|-------|
| V-01 | Define explicit Go/No-Go gates (P0 runtime, mobile, integrity, navigation) | None | P0 | Low | Week 1 | V-02 | - |
| V-02 | Create Runtime Validation Matrix (per workstream) | V-01 | P0 | Medium | Week 1 | - | - |
| V-03 | Create Mobile Field UAT test cases (real devices + degraded network) | None | P0 | Medium | Week 1 | V-02 | - |
| V-04 | Define rollback authority owners and escalation path | P-03 | P0 | Low | Week 1 | - | - |
| V-05 | Build post-rollback validation checklist | V-04 | P1 | Low | Week 2 | - | - |
| V-06 | Create UAT feedback collection process for the 100 users | None | P1 | Low | Week 2 | - | - |
| V-07 | Define success metrics for Stabilization phase (tied to 90% MVP goal) | V-01 | P1 | Low | Week 2 | - | - |
| V-08 | Schedule and run final Go/No-Go review before wider UAT exposure | V-01, V-07 | P0 | Low | Week 3 | - | - |

---

## Summary: Total Tasks

- **Workstream 1 (Navigation):** 8 tasks
- **Workstream 2 (Runtime):** 8 tasks
- **Workstream 3 (Mobile):** 8 tasks
- **Workstream 4 (Protected Systems):** 8 tasks
- **Workstream 5 (Design System):** 6 tasks
- **Workstream 6 (Validation & Governance):** 8 tasks

**Total:** 46 granular tasks

---

## Recommended Agent Allocation (32 Agents)

- **Week 1:** Heavy focus on Navigation, Runtime, and Governance (≈18–20 agents)
- **Week 2:** Heavy focus on Mobile and Protected Systems (≈18–20 agents)
- **Week 3:** Focus on remaining items, validation, and handoff (≈12–16 agents)

Agents can be reassigned between workstreams as tasks complete. Use a mix of Grok and Claude on complex or high-risk items for cross-validation.

---

**Document Status:** Living. Will be updated as tasks are completed or new dependencies are discovered.

---

*This breakdown is designed to be divided among the 32 available agents while maintaining the integrity of the 3-week Stabilization timeline.*