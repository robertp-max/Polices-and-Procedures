# Stabilization Action Items (Deduplicated & Realistic)

**Version:** 2.0 (Post-Overlap Analysis)  
**Date:** May 2026  
**Source:** 16-Agent Convergence Review + Claude Analysis  
**Purpose:** Convert the 16-agent feedback into a clean, balanced, and realistic set of actionable items for the Stabilization Precursor Phase.

**Important Rules (Locked):**
- This is a **precursor phase only**. It must **not overlap** with the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md.
- Only Stabilization-unique tasks are included here. Tasks already covered in the main plan’s PART II (Actionable Implementation Hardening) are excluded.
- All remaining items are treated with **balanced importance** — no single item is over-prioritized.
- Timelines are realistic single-agent estimates (not inflated for parallel agents).
- The overall goal is to support the Unified MVP reaching **90–100%** success.
- Stabilization is **not rushed** (3-week window), even though the MVP is being accelerated for next week.

---

## Stabilizaton-Unique Tasks (After Deduplication)

After cross-referencing with the Unified MVP plan, the following ~12–13 tasks are the **true Stabilization scope**. All others are already owned by the main implementation plan.

### 1. Navigation History Sanity (Highest Immediate User Pain)

**Task:** Remove global swipe navigation and left/right arrow key handlers from `CommandCenterLayout.tsx`. Audit and clean aggressive `replace: true` usage on normal internal routes.

**Realistic Timeline (1 agent):** 25–40 minutes  
**Dependencies:** None  
**Risk if Delayed:** Very High — users will experience broken navigation during training.  
**UAT Priority:** P0  
**Suggested Week:** Week 1 (Immediate)

---

### 2. Browser Refresh Recovery

**Task:** Implement form draft persistence with automatic rehydration on browser refresh for core forms (eCign, Onboarding V2 gates, CES tasks).

**Realistic Timeline (1 agent):** 60–90 minutes  
**Dependencies:** Protected Subsystems definition (see task below) before touching eCign.  
**Risk if Delayed:** High — users will lose work on refresh.  
**UAT Priority:** P0  
**Suggested Week:** Week 1

---

### 3. Interruption Recovery (visibilitychange)

**Task:** Add `visibilitychange` + `beforeunload` listeners to preserve in-progress work when the app is backgrounded or the tab is switched.

**Realistic Timeline (1 agent):** 30–50 minutes  
**Dependencies:** Form draft persistence utility.  
**Risk if Delayed:** High — common real-world failure during training.  
**UAT Priority:** P0  
**Suggested Week:** Week 1

---

### 4. Evidence Upload Recovery

**Task:** Implement offline queue + retry logic for evidence uploads under weak or intermittent network conditions.

**Realistic Timeline (1 agent):** 45–70 minutes  
**Dependencies:** None for basic queue; coordinate with Protected Subsystems definition.  
**Risk if Delayed:** High — data loss during evidence capture in field conditions.  
**UAT Priority:** P0  
**Suggested Week:** Week 1–2

---

### 5. eCign Signing Continuity

**Task:** Add persistence and recovery for mid-signing interruptions (signature image + form state).

**Realistic Timeline (1 agent):** 60–90 minutes  
**Dependencies:** Must come **after** Protected Subsystems are formally defined.  
**Risk if Delayed:** Very High — legal and audit defensibility risk.  
**UAT Priority:** P0  
**Suggested Week:** Week 1–2 (after Protected Subsystems definition)

---

### 6. CES Task Continuity

**Task:** Ensure task state and form_instance linkage survives refresh, navigation, and interruption on the CES Board and related surfaces.

**Realistic Timeline (1 agent):** 50–80 minutes  
**Dependencies:** Coordination with CES identity work in the main MVP plan.  
**Risk if Delayed:** High — lost progress on tasks.  
**UAT Priority:** P0  
**Suggested Week:** Week 1–2

---

### 7. Modal & Drawer Escape / Re-entry Behavior

**Task:** Standardize Esc key and browser back button behavior in modals and drawers to prevent users from getting stuck or losing context.

**Realistic Timeline (1 agent):** 30–50 minutes  
**Dependencies:** Navigation history work (N-01, N-02).  
**Risk if Delayed:** Medium — users get trapped in flows.  
**UAT Priority:** P1  
**Suggested Week:** Week 2

---

### 8. Deep-Link Restoration

**Task:** Ensure deep links restore the correct context and state on core flows.

**Realistic Timeline (1 agent):** 40–60 minutes  
**Dependencies:** Navigation history stabilization.  
**Risk if Delayed:** Medium — users land in broken states from shared links.  
**UAT Priority:** P1  
**Suggested Week:** Week 2

---

### 9. Multi-Tab Handling (Basic)

**Task:** Add basic detection and warnings when the same workflow (e.g., same CES task or eCign packet) is open in multiple tabs.

**Realistic Timeline (1 agent):** 30–45 minutes  
**Dependencies:** None critical.  
**Risk if Delayed:** Medium — conflicting updates possible.  
**UAT Priority:** P1  
**Suggested Week:** Week 2–3

---

### 10. Protected Subsystems Definition + Rollback Triggers

**Task:** Formally define eCign, Evidence Center, and CES identity as Protected Subsystems. Create Rollback Trigger Matrix and assign named owners.

**Realistic Timeline (1 agent):** 20–35 minutes  
**Dependencies:** None.  
**Risk if Delayed:** Very High — changes to critical systems without protection.  
**UAT Priority:** P0  
**Suggested Week:** Week 1 (must come before tasks that touch these systems)

---

### 11. Rollback Execution Capability

**Task:** Create Rollback Execution Checklist and conduct at least one rollback drill on a non-critical surface.

**Realistic Timeline (1 agent + human coordination):** 60–90 minutes (including drill)  
**Dependencies:** Protected Subsystems + Rollback Trigger Matrix (Task 10).  
**Risk if Delayed:** High — no safe way to recover from bad changes.  
**UAT Priority:** P0  
**Suggested Week:** Week 2

---

### 12. Basic Design System Guardrails

**Task:** Implement ESLint rules to block raw hex/rgb values and enforce `--ci-*` tokens in new or modified code. Add visual regression requirement to PR checklist for `ui/` components.

**Realistic Timeline (1 agent):** 20–30 minutes  
**Dependencies:** None.  
**Risk if Delayed:** Medium — visual drift will happen quickly once more developers start building.  
**UAT Priority:** P0  
**Suggested Week:** Week 1

---

## Summary of Scope

- **Total Stabilization-unique tasks:** ~12 (after deduplication with the main Unified MVP plan).
- All other items from the original 16-agent list are already covered in the main plan’s PART II and will be executed as part of the MVP implementation.
- No new tasks have been added.

---

**Document Status:** Living. Will be updated as tasks are completed or new dependencies are identified.

---

*This document contains only the Stabilization-precursor work. It is separate from and does not duplicate the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.*