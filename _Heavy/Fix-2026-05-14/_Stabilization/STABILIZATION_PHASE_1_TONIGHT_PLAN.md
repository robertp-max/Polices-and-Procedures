# Stabilization Phase 1 – Tonight’s Realistic Execution Plan

**Version:** 2.0 (Post-Deduplication & Realistic Timeline)  
**Date:** May 2026  
**Goal:** Make the app visibly and functionally closer to the new v2 design system in one focused 90-minute window using 32 agents (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower).

**Important:** This plan is based on honest single-agent speed estimates + realistic parallelization with 32 agents. It does **not** assume superhuman parallel speed.

---

## Phase 1 Scope – What We Will Actually Attempt Tonight

After reviewing realistic timelines and removing overlap with the main Unified MVP plan, the following tasks are the **most critical and achievable** in a 90-minute window:

### Track A – Navigation Cleanup (Highest User Pain)

1. Remove global swipe navigation + left/right arrow key handlers from `CommandCenterLayout.tsx`
2. Audit and clean the most aggressive `replace: true` usages on core routes (CES, Evidence, eCign, Onboarding V2, Calendar) — create a clear “deferred” list for the rest

### Track B – Design System Guardrails (High Visual Impact)

3. Implement basic ESLint rules to block raw hex/rgb values and enforce `--ci-*` tokens in new/modified code
4. Apply new Care Indeed design system (teal/orange + glass layers) on `CommandCenterLayout.tsx` + main shell (Dashboard as primary visible surface)

### Track C – Protected Systems & Governance (High Risk Mitigation)

5. Formally define Protected Subsystems (eCign, Evidence Center, CES identity) + assign owners
6. Create initial Rollback Trigger Matrix + named rollback owners
7. Define Go/No-Go gates for the first MVP wave

### Track D – Quick Runtime Wins (If Time Allows)

8. Add basic form draft persistence + refresh recovery on eCign signing flow **only after** Protected Subsystems are defined (sequencing critical)
9. Add basic `visibilitychange` interruption recovery hooks on major forms

---

## Realistic Agent Allocation for 90 Minutes

With 32 agents available, here is a practical split:

- **Track A (Navigation):** 6–8 agents (very parallelizable)
- **Track B (Design System Guardrails):** 6–8 agents
- **Track C (Protected Systems + Governance):** 4–6 agents
- **Track D (Runtime – conditional):** 4–6 agents (only if Track C finishes early)
- **Coordination / Merge / Review Buffer:** 6–8 agents (critical for avoiding chaos)

**Total productively assigned:** ~21–24 agents  
**Buffer / Coordination / Standby:** 8–11 agents

**Important Reality Check:**  
Even with 32 agents, you will not finish 12 complex tasks in 90 minutes. The above scope (7–9 tasks) is already ambitious but achievable with good coordination.

---

## Sequencing Rules for Tonight (Very Important)

- **Protected Subsystems definition (Task 5) must come before** any work on eCign form persistence (Task 8).
- Navigation cleanup (Track A) should be completed before heavy visual changes if possible (to avoid testing on broken navigation).
- Any changes to `CommandCenterLayout.tsx` should be done by a small, coordinated group to avoid merge conflicts.

---

## Validation After Phase 1 (Quick but Real)

- Global swipe + arrow key navigation is gone (confirmed in code + quick test)
- Browser back button works on at least 5 core flows without jumping
- New Care Indeed colors are visible on the main shell + Dashboard
- Protected Subsystems and Rollback Matrix are documented and communicated
- ESLint token rules are active and failing on violations

---

## What Happens After Tonight

- Remaining Stabilization items (the rest of the deduplicated ~12–13 unique tasks) continue over the full 3-week period in parallel with the main Unified MVP implementation.
- Phase 1 is only the “make it look and feel like the new system by Monday” minimum.

---

**Document Status:** Ready for execution.

---

*This Phase 1 plan is deliberately scoped for real-world agent + human speed in a 90-minute window.*