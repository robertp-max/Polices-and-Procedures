# Stabilization Phase 1 – Tonight’s Execution Plan

**Date:** May 2026  
**Goal:** Make the app visibly and functionally move toward the new v2 design system in under 60–90 minutes, so it no longer looks and feels like the current version by Monday.

**Scope:** Extremely focused. Only the highest-impact, lowest-time items that will make the biggest difference for training next week.

**Resources:** 32 agents (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower)

**Success Criteria for Phase 1:**
- Global swipe + left/right arrow key navigation is completely removed.
- The app uses the new Care Indeed teal/orange color scheme on main surfaces.
- Browser back/forward feels noticeably more predictable on core flows.
- The app no longer looks like the old version.

---

## Phase 1 Priority Tasks (Tonight)

### Task 1: Remove Global Navigation Hijacking (Highest Impact)

**What to do:**
- Remove the global touch swipe handler (left/right) from `CommandCenterLayout.tsx`.
- Remove the global keyboard `ArrowLeft` / `ArrowRight` handler from `CommandCenterLayout.tsx`.
- Clean up any related imports or references to the custom `useNavStore` for gestures.

**Why it matters:**  
This was one of the most broken experiences reported. Removing it immediately improves usability across the entire app.

**Agent Split:** 6–8 agents (mix of Grok + Claude)

**Estimated Time:** 15–20 minutes

---

### Task 2: Reduce Aggressive `replace: true` Usage

**What to do:**
- Audit key navigation routes in `App.tsx` and remove `replace` from normal internal redirects:
  - `/ces`
  - `/pm`
  - `/policies`
  - `/onboarding-v2`
  - Other common entry points

**Keep `replace` only** for true legacy alias routes (e.g. `/drafts`, `/review`, old admin paths).

**Agent Split:** 6–8 agents

**Estimated Time:** 15–25 minutes

---

### Task 3: Apply New Care Indeed Design System on Main Shell

**What to do:**
- Update `CommandCenterLayout.tsx` and top-level layout components to use the new Care Indeed teal (`#007970`) and restrained orange (`#C74601` or `#E07B2C`).
- Apply proper glass layers and constrained desktop container (max-width + side margins showing Layer 0).
- Remove any remaining maroon/gold or old CI-ION styling from the main shell.

**Agent Split:** 8–10 agents (heavier visual + token work)

**Estimated Time:** 25–35 minutes

---

### Task 4: Basic Form Draft Persistence (Quick Win)

**What to do:**
- Add simple draft saving (localStorage) + rehydration on the two highest-traffic forms:
  - `FormSigningWorkspace.tsx` (eCign)
  - Onboarding V2 gate forms

**Goal:** Basic refresh recovery so users don’t lose everything if they refresh or get interrupted.

**Agent Split:** 6–8 agents

**Estimated Time:** 20–30 minutes

---

## Agent Allocation for Phase 1 (Tonight)

**Total Agents:** 32 (16 Grok 4.3 + 16 Claude Sonnet 4.6 or lower)

**Suggested Split:**

| Task | Agents | Focus |
|------|--------|-------|
| Remove global navigation handlers | 6–8 | Fast code removal + cleanup |
| Reduce `replace: true` | 6–8 | Route audit + safe removal |
| Apply new design system on shell | 8–10 | Visual + token application |
| Basic form draft persistence | 6–8 | State management + recovery |

**Recommendation:** Run all four tasks in parallel. Use a mix of Grok and Claude on each task for cross-validation.

---

## Validation After Phase 1 (Quick Checks)

- Global swipe and arrow key navigation is gone.
- Browser back button works without jumping on main flows.
- The app visibly uses the new Care Indeed teal/orange on the main shell and at least 2–3 key pages.
- No obvious breakage on refresh for the forms touched.

---

## What Happens After Phase 1

- The remaining Stabilization items (the other 12 from the 16) continue over the full 3-week period in parallel with the main Unified MVP implementation.
- Phase 1 is only the “make it look and feel like the new system by Monday” minimum.

---

**Document Status:** Ready for execution.

---

*This Phase 1 plan is designed to be completed in under 90 minutes with 32 agents working in parallel.*