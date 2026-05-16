# Stabilization vs Unified MVP – Boundary Document

**Version:** 1.0  
**Date:** May 2026  
**Purpose:** Clearly define the separation between the Stabilization Precursor Phase and the main UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN to prevent overlap and scope creep.

---

## 1. Core Principle

**Stabilization is a Precursor Phase Only.**

- It prepares the application for a successful rollout of the Unified MVP.
- It runs **in parallel** with the main implementation and during the initial UAT/training period.
- It must **never overlap** with the core implementation waves defined in the Unified MVP plan.
- Any work that is already described in the Unified MVP plan’s “PART II — Actionable Implementation Hardening” section belongs to the **main implementation**, not Stabilization.

---

## 2. Definition of Each Phase

### Stabilization Precursor Phase (This Folder)
**Goal:** Reduce the highest operational and runtime risks so the Unified MVP has a realistic path to 90–100% success.

**Scope (Stabilization-Unique Only):**
- Items that are **not** already covered in the Unified MVP plan’s hardening section.
- Focused on real-world failure modes under non-ideal conditions (interruptions, weak network, refreshes, multi-tab, mobile field use, etc.).
- Includes governance, validation infrastructure, and rollback readiness that are specific to the transition period.

**Duration:** 3 weeks (deliberate, not rushed). Can continue during training/UAT.

**Key Deliverables:**
- Navigation history stabilization (removal of global swipe/arrows + browser back/forward reliability)
- Runtime survivability basics (refresh + interruption recovery on core forms)
- Mobile core flow validation under realistic conditions
- Protected Subsystems definition + rollback capability
- Design system guardrails (lint rules, enforcement mechanisms)
- Go/No-Go criteria and validation matrix for the rollout

---

### Unified MVP Implementation Phase (Main Plan)
**Goal:** Deliver the full unified MVP (v2 design system + all planned functional and structural changes) to production-grade quality.

**Scope:** Everything in the `UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md`, including:
- Full design system rollout and enforcement across all surfaces
- Component unification and deprecation of parallel patterns
- All functional improvements (task projection, dataflow, etc.)
- Most of the “Actionable Implementation Hardening” items already listed in PART II of the main plan

**Duration:** As defined in the main plan (accelerated for Monday training readiness).

---

## 3. Clear Boundary Rules

| Type of Work                          | Belongs To                  | Example |
|---------------------------------------|-----------------------------|--------|
| Removing global swipe + arrow key navigation | Stabilization (P0)         | High user pain, not in main plan |
| Form draft persistence on refresh     | Stabilization (P0)         | Real-world failure mode |
| Evidence upload offline queue         | Stabilization (P0)         | Field survivability |
| Defining Protected Subsystems         | Stabilization (P0)         | Transition governance |
| Rollback Trigger Matrix & drills      | Stabilization (P0)         | Rollout safety net |
| Applying new design system to shell + multiple surfaces | Main MVP Plan | Already in PART II hardening |
| Component normalization (deprecate CesCard, etc.) | Main MVP Plan | Already scoped in design system section |
| Full visual regression strategy       | Main MVP Plan | Part of ongoing design system work |
| eCign form persistence (after Protected Subsystem is defined) | Main MVP Plan | Already in PART II |
| Multi-tab conflict resolution         | Main MVP Plan | Already covered in hardening |
| Deep-link restoration (advanced)      | Main MVP Plan | Already in PART II |

**Rule:** If a task is already described in the Unified MVP plan’s PART II (lines ~753–887), it belongs to the main implementation — not Stabilization.

---

## 4. Overlap Resolution Summary (from Analysis)

After cross-referencing the original Stabilization task list with the Unified MVP plan:

- **28 tasks** → Already owned by the main MVP plan (do not duplicate in Stabilization)
- **5 tasks** → Partial overlap (split responsibility clearly)
- **13 tasks** → Truly Stabilization-unique (these form the core of this phase)

Only these 13 (minus any internal redundancy) remain in the Stabilization scope.

---

## 5. How the Two Phases Work Together

- **Week 1 (Stabilization):** Focus on navigation cleanup, basic runtime recovery, Protected Subsystems definition, and initial design system guardrails.
- **Main MVP Implementation:** Begins in parallel, using the guardrails and protections established in Stabilization.
- **During Training/UAT:** Stabilization continues with deeper items (mobile UAT, rollback drills, advanced enforcement) while the MVP is being used and tested.
- **Post-UAT:** Remaining Stabilization items are completed as part of the ongoing hardening effort.

This model allows the MVP to move fast for Monday while Stabilization provides the necessary safety net and long-term stability.

---

## 6. Communication Rule

Any work item that appears in both the Stabilization plan and the main Unified MVP plan must be clearly labeled with:
- Which plan owns the delivery
- Which plan owns the validation
- Which plan owns the rollback risk

This prevents double work and confusion during execution.

---

**Document Status:** Living. Update whenever scope changes or new overlap is identified.

---

*This boundary document ensures the Stabilization phase stays focused, non-overlapping, and genuinely supportive of the 90–100% success goal for the Unified MVP.*