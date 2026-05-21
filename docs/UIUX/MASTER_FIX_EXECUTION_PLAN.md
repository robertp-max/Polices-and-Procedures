# MASTER FIX EXECUTION PLAN
**Care Indeed Home Health – UI/UX Reconstruction Reset**

**Version:** 1.0  
**Date:** 2026-05-18  
**Purpose:** Correct the failures from previous execution. Treat this as a full remediation program with strict sequencing.

---

## 1. Guiding Principles (Non-Negotiable)

- Phase 1 remediation comes **first**. Nothing else proceeds until the Brand/Mode foundation is fixed.
- We do **not** repeat the previous mistake of updating checklists and declaring victory before the code actually works.
- Every deliverable must be validated against the Top Picks mocks (not just "looks better").
- Documentation is supporting material only. The goal is working, beautiful, canonical code.

---

## 2. Strict Execution Order

### Phase 0 – Preparation (1–2 days max)
- Review all existing plans and the new remediation documents.
- Identify the current state of every major surface vs the canonical contract.
- Create a living "Current Reality vs Target" tracker (one document or Notion page).

### Phase 1 Remediation – Brand & Dark Mode Foundation (Highest Priority)
**Document:** `BRAND_AND_DARK_MODE_REMEDIATION_PLAN.md`

**Must be 100% complete and verified before moving forward.**

Key outcomes:
- Single brand in production: Care Indeed only.
- Clean Navy Dark glassmorphic experience that matches the Top Picks mocks.
- Backdrop logic fixed in `ShellFrame.tsx`.
- Old CI-ION dark toggle removed from production Care Indeed flows.
- All major surfaces render correctly in the new Navy Dark.

**Exit Gate:** Visual regression sign-off against the Top Picks dark mocks + no regressions in Light mode.

---

### Phase 2 – Legacy Cleanup & Primitive Adoption
- Purge `ci-premium-*`, `ci-maturity-*`, `ci-executive-*`, and other wave classes (see `LEGACY_DEPRECATION_MATRIX.md` + Review 12 findings).
- Systematically replace hand-crafted sections with canonical primitives (`GlassPanel`, `SurfaceCard`, `PageHeader`, `SectionHeader`, etc.).
- Enforce the single glass canvas + constrained 4-sided contract everywhere.

**Priority surfaces (in order):**
1. Dashboard (must become the true reference)
2. Evidence Center
3. Audit Mode
4. Calendar + My Tasks
5. Onboarding V2

---

### Phase 3 – Typography, Spacing, Motion & Responsive Hardening
- Enforce `TYPOGRAPHY_SCALE.md` across all surfaces (no more `text-[9.5px]`, `ci-text-*` inventions, etc.).
- Enforce locked spacing scale.
- Wire motion tokens properly.
- Fix responsive behavior to actually match the `RESPONSIVE_BEHAVIOR_MATRIX.md` (bottom sheets, safe areas, consistent breakpoints, no RightDrawer leaks on mobile).

---

### Phase 4 – Parallel Systems Cleanup
- Resolve CES parallel navy system (either bring it into canonical or create a properly governed, minimal exception with clear conditions).
- Fix print/legal evidence fidelity (converge renderers, close critical drift items D09/D23/D24).
- Any remaining Onboarding/Journey fragmentation.

---

### Phase 5 – Final Validation & Governance Reset
- Full visual regression against all Top Picks mocks (desktop + mobile).
- Update `CANONICAL_UI_SYSTEM_SPEC.md`, checklists, and DRIFT_REGISTER to reflect reality (no more false "complete" claims).
- Rebuild the living anti-drift process so this doesn't happen again.

---

## 3. Rules for This Execution (Learn from Previous Failures)

- Never update a checklist to "complete" until the code passes visual regression against the mocks.
- Never claim "100% canonical primitives" until a proper grep + component inventory proves it.
- The Navy Dark must be the **primary** dark experience for Care Indeed. The old CI-ION dark is no longer acceptable in production flows.
- Every surface must be validated in both Light and the new Navy Dark before moving on.

---

## 4. Success Criteria

The project is successful only when:

- A designer or executive opening the app in Care Indeed Navy Dark immediately thinks "this matches the mocks."
- There is no longer any easy way for users to see the old CI-ION maroon/gold aesthetic in production.
- Legacy wave classes are gone from all target surfaces.
- Primitives + tokens + typography + spacing are consistently applied.
- The product no longer feels like multiple competing design systems glued together.

---

**This is the new source of truth for execution order.**  
Do not start Phase 2 work until Phase 1 Remediation (Brand & Dark Mode) has passed the exit criteria in `BRAND_AND_DARK_MODE_REMEDIATION_PLAN.md`.