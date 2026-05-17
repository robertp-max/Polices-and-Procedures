# Phase 2 Exit Criteria Checklist — Core Shell and Command Center Rebuild

**Phase 2 — Core Shell and Command Center Rebuild**  
**Version:** 1.0  
**Date:** 2026-05-17  
**Traceability:** `MASTER_UIUX_IMPLEMENTATION.md` (Phase 2 Exit Criteria) + `UIUX_RECONSTRUCTION_MASTER_PLAN.md` (PHASE 2 section) + `CANONICAL_UI_SYSTEM_SPEC.md`

---

## Purpose

This is the **non-negotiable gate** before any Phase 3 work may begin. No operational surface (Dashboard, Evidence, Audit, Calendar, My Tasks) may be touched until every item below is green with attached evidence.

---

## 1. Constrained Page View Contract (Non-Negotiable)

- [ ] `ShellFrame` + `ShellContentFrame` enforce `--ci-glass-layer1-inset-desktop` (clamp 16px–28px) on all four sides at ≥1024px on every tested route.
- [ ] Visible 4-sided backdrop framing is present around the primary glass content in both single-card and multi-card compositions.
- [ ] Backdrop (Layer 0) remains visible and glassmorphism effect (blur, edge definition, depth) is measurably improved vs. pre-Phase 2 baseline.
- [ ] No route-specific overrides of the inset exist in shell or page code.
- [ ] Evidence: Side-by-side screenshots at 1200px, 1440px, and 1600px attached to the Phase 2 completion PR, compared against approved Top Picks reference captures.

---

## 2. Canonical Primitive Adoption (Shell Only)

- [ ] All shell elements are built exclusively from primitives exported in `src/policy/components/ui/index.ts`.
- [ ] New primitives created: `ShellFrame`, `ShellTopbar`, `ShellNavRail`, `ShellContentFrame`, `ShellCommandGroup`, `ShellMobileDrawer`.
- [ ] `CommandCenterLayout.tsx` has been reduced to a thin orchestrator or deleted.
- [ ] No local one-off components remain inside the shell folder or `CommandCenterLayout`.
- [ ] All new shell primitives are documented in `primitives/CATALOG.md` with "Core — Shell" status.
- [ ] Evidence: `Canonical_Primitive_Usage_Map.md` is 100% reflected in the final code.

---

## 3. Token Discipline (Zero Raw Values)

- [ ] Zero raw hex/rgb values, arbitrary Tailwind bracket values, or magic numbers in any shell file.
- [ ] All visual properties resolve to entries in `tokens/tokens.json` v0.2.0-phase1 or later.
- [ ] `Token_Application_Matrix_Shell.md` accurately reflects production code.
- [ ] Evidence: `grep` / lint scan of shell files shows no violations + PR diff review.

---

## 4. Command Hierarchy & Navigation Normalization

- [ ] Navigation is reorganized into three clear `ShellCommandGroup`s:
  - Primary Operations
  - Compliance Execution (CES)
  - Administration / Knowledge
- [ ] `ShellNavRail` is the single source of desktop/laptop navigation.
- [ ] Mobile navigation uses `ShellMobileDrawer` (wrapping `BottomSheetDrawer`).
- [ ] No route-specific nav variants or hacks remain.
- [ ] Evidence: Visual review + `Canonical_Primitive_Usage_Map.md` sign-off.

---

## 5. Responsive Behavior (Shell Frame)

- [ ] Shell passes all criteria in `Responsive_Accessibility_Validation_Plan_Shell.md` at Mobile, Tablet, Laptop, and Desktop breakpoints.
- [ ] No horizontal scroll on any tested route at any breakpoint.
- [ ] All interactive elements in `ShellTopbar` and navigation meet 44px minimum touch target below 1024px.
- [ ] Navigation correctly transforms (rail → bottom sheet) without layout breakage.
- [ ] Evidence: Playwright test results + manual verification matrix attached.

---

## 6. Accessibility (Shell Frame)

- [ ] Automated axe-core scan passes with no critical or serious violations on shell at all breakpoints.
- [ ] Manual accessibility audit (landmarks, keyboard navigation, focus management, reduced motion, screen reader) passes per `Responsive_Accessibility_Validation_Plan_Shell.md`.
- [ ] `prefers-reduced-motion` is respected at the `ShellFrame` level.
- [ ] Focus management in `ShellMobileDrawer` is correct (trap + return).
- [ ] Evidence: axe report + screen reader test notes + reduced-motion video/screenshots.

---

## 7. Visual Regression & Glassmorphism Quality

- [ ] Before/after Playwright visual regression baseline created for the shell.
- [ ] Design Lead has reviewed and approved side-by-side comparisons against Top Picks mocks (desktop + mobile).
- [ ] Glassmorphism magnification (backdrop framing, translucency, edge definition) is qualitatively confirmed as improved.
- [ ] Evidence: Approved reference captures linked in the Phase 2 completion PR.

---

## 8. Code & Governance Hygiene

- [ ] `src/policy/components/ui/index.ts` exports all new shell primitives.
- [ ] `primitives/CATALOG.md` updated with new shell primitives and ownership.
- [ ] Legacy CI-ION branding and dual-brand logic removed from shell (Care Indeed is now the only production brand).
- [ ] All shell files pass the "no raw values" rule via manual review + future lint.
- [ ] Drift Register updated with relevant shell-related items (if any).

---

## 9. Final Sign-off

| Role                  | Name                  | Decision     | Date       | Evidence Link |
|-----------------------|-----------------------|--------------|------------|---------------|
| Design Lead           |                       | Approved / Blocked |            |               |
| Engineering Lead      |                       | Approved / Blocked |            |               |
| Accessibility Lead    |                       | Approved / Blocked |            |               |
| Product Owner         |                       | Approved / Blocked |            |               |

**All items above must be green with attached evidence before this checklist can be marked complete.**

---

## 10. Phase 2 Completion Declaration

Once every checkbox above is green:

- The core shell is now canonical infrastructure.
- The 4-sided constrained page view contract is enforced at the frame level.
- All future surfaces (Phase 3) must compose inside this shell without violating the contract.
- Phase 3 work on Dashboard and other operational surfaces is now authorized to begin.

---

**End of Phase 2 Exit Criteria Checklist**

**All Phase 2 deliverables have now been produced.**

Auto-pilot execution for Phase 2 is complete. The following files now exist in the Implementation folder:

- `Phase2_Implementation_Spec.md`
- `Shell_Architecture_Reconstruction_Plan.md`
- `Canonical_Primitive_Usage_Map.md`
- `Token_Application_Matrix_Shell.md`
- `Responsive_Accessibility_Validation_Plan_Shell.md`
- `Phase2_Exit_Criteria_Checklist.md`