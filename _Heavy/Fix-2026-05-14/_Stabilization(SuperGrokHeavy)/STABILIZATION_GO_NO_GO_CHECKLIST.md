# Stabilization Go/No-Go Checklist

**Purpose:** This checklist defines the concrete, measurable criteria that must be met before proceeding with the next Stabilization wave or before allowing wider UAT exposure during the training period.

**Usage:** This is a living document. It should be reviewed at the end of each week (or after each major wave) by the Stabilization Lead + relevant owners.

**Success Target:** Support the UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN reaching 90–100% success.

---

## Go/No-Go Decision Framework

| Decision Point | When to Use This Checklist | Decision Maker(s) |
|----------------|-----------------------------|-------------------|
| End of Week 1 | Before starting Week 2 work | Stabilization Lead + Engineering Lead |
| End of Week 2 | Before starting Week 3 work | Stabilization Lead + relevant subsystem owners |
| Before First UAT Wave | Before exposing the app to the ~100 internal users | Stabilization Lead + Project Lead + Compliance (if protected systems involved) |
| After Any Rollback | After executing a rollback | Stabilization Lead + affected owners |

**Rule:** If any **P0 gate** is marked **No**, the rollout or next wave is automatically **held** until resolved.

---

## P0 Go/No-Go Gates (Must Pass)

### 1. Navigation & History Stability

- [ ] Global swipe navigation completely removed from production code
- [ ] Global left/right arrow key navigation completely removed from production code
- [ ] Browser Back/Forward works reliably on at least 8 core flows (CES Board, Evidence Center, eCign, Onboarding V2, Calendar, My Tasks, Library, Dashboard)
- [ ] No widespread reports of “random jumping” or broken navigation during testing

**Owner:** Frontend Engineering Lead  
**Validation Method:** Manual testing + agent smoke tests

---

### 2. Runtime Survivability

- [ ] Form draft persistence + refresh recovery working on eCign signing flow
- [ ] Form draft persistence + refresh recovery working on Onboarding V2 gates
- [ ] Basic interruption recovery (app background/return) working on major forms
- [ ] No data loss reported in refresh or interruption tests

**Owner:** Frontend Engineering Lead  
**Validation Method:** Refresh + interruption test cases executed

---

### 3. eCign Defensibility (Protected Subsystem)

- [ ] eCign formally designated as Protected Subsystem
- [ ] Post-sign integrity verification implemented and passing
- [ ] Signed artifact retrieval working correctly (including PDF/print)
- [ ] No breakage in multi-signer flow after changes

**Owner:** Architecture Lead + Compliance  
**Validation Method:** Integrity tests + manual signing flow test

---

### 4. Evidence Center Integrity (Protected Subsystem)

- [ ] Evidence Center formally designated as Protected Subsystem
- [ ] Evidence upload + retrieval working after refresh and under throttled network
- [ ] Offline queue + retry logic implemented and tested
- [ ] Audit events contain correct top-level `targetKind` + `targetId`

**Owner:** Architecture Lead + Compliance  
**Validation Method:** Evidence retrieval + audit event verification

---

### 5. CES Task Identity & Continuity

- [ ] CES task identity and form_instance routing confirmed stable after changes
- [ ] Task state consistent across CES Board, Calendar, My Tasks after refresh or action
- [ ] No duplicate or lost tasks in testing

**Owner:** Architecture Lead + CES Team  
**Validation Method:** Cross-surface consistency tests

---

### 6. Mobile Operational Readiness (Minimum for UAT)

- [ ] Core flows (Evidence capture, eCign signing, CES task completion) tested on real iOS and Android devices
- [ ] At least 80% pass rate on core mobile flows under normal conditions
- [ ] One-handed usability confirmed on main actions
- [ ] Touch targets ≥48px on primary CTAs

**Owner:** QA Lead  
**Validation Method:** Real-device UAT (minimum 10–15 test sessions)

---

### 7. Design System Guardrails (Minimum)

- [ ] ESLint rules active to block raw hex/rgb values and enforce `--ci-*` tokens
- [ ] Visual regression requirement added to PR checklist for `ui/` components
- [ ] No obvious branding or visual drift on main surfaces after Phase 1 changes

**Owner:** Design Systems + Engineering  
**Validation Method:** Lint passing + visual spot checks

---

### 8. Rollback Readiness

- [ ] Rollback Trigger Matrix documented and approved
- [ ] Named rollback owners assigned for all Protected Subsystems
- [ ] At least one rollback drill completed and documented (on non-critical surface)
- [ ] Post-rollback validation checklist exists and has been reviewed

**Owner:** DevOps + Stabilization Lead  
**Validation Method:** Completed and timed rollback drill + checklist review

---

### 9. Go/No-Go Governance

- [ ] All P0 gates above have clear pass/fail criteria
- [ ] Deployment hold process defined (what happens if a P0 gate fails)
- [ ] Go/No-Go decision makers identified and available
- [ ] Communication plan for rollback or hold exists

**Owner:** Stabilization Lead + Project Lead  
**Validation Method:** Signed-off Go/No-Go document

---

## 10. Overall Go/No-Go Decision

**Before allowing wider UAT exposure or moving to the next major wave, the following must be true:**

- All P0 gates in sections 1–9 are marked **Pass**
- No open critical (P0) issues in Navigation, eCign, Evidence, or CES identity
- Rollback capability has been demonstrated
- The app visibly uses the new v2 design system on main surfaces
- Team agrees the system is stable enough for internal training/UAT

**Decision:**  
**Go** / **No-Go** / **Go with Conditions**

**Date:** ________________  
**Approved by:** ________________ (Stabilization Lead)  
**Approved by:** ________________ (Engineering Lead)  
**Approved by:** ________________ (Compliance – if Protected Subsystems involved)

---

**Document Status:** Living. Update after every wave and before each Go/No-Go decision.

---

*This checklist is the final gate before moving forward. It is intentionally strict on P0 items to protect the 90–100% success target.*