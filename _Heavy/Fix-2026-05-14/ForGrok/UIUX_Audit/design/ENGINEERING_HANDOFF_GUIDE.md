# Engineering Handoff Guide — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026  
**Audience:** Design Systems + Frontend Engineering

---

## 1. Purpose

This guide defines the exact process for handing off designs from the v2 design system to engineering. The goal is zero ambiguity, zero drift, and fast, high-quality implementation.

---

## 2. Handoff Package Requirements

Every handoff (new feature or major update) must include:

1. **Figma Link** to the specific screens + variants
2. **Design Token Reference** (link to latest `COLOR_TOKENS.md`, `TYPOGRAPHY_SCALE.md`, etc.)
3. **Component Audit** — Which `ui/` primitives are used vs. new components needed
4. **Interaction Spec** (states, gestures, loading, empty, error)
5. **Responsive Matrix** (mobile first, tablet, desktop)
6. **Accessibility Notes** (from the Accessibility Component Checklist)
7. **Print/PDF Requirements** (if applicable)

---

## 3. Token & Primitive Rules (Strict)

- **All new code** must use design tokens via CSS custom properties (`--ci-*`) or the JS token object.
- **No raw hex, rgb, or arbitrary values** in new components (ESLint rule planned).
- Prefer existing `ui/` primitives (Button, Card, GlassPanel, Tabs, EmptyState, etc.).
- New primitives must be approved by Design Systems before implementation.

**Canonical owners** (from the strategy documents):
- Layout shell → `CommandCenterLayout` + `ui/*`
- eCign packets → `FormViewer` + `FormSigningWorkspace`
- General policy detail → `SharedPolicyDetailView`
- Onboarding V2 → OnboardingV2 engine components
- Calendar → MasterCalendar

---

## 4. Handoff Meeting / Review Process

1. Designer creates a **Handoff Note** in the Figma file (or Notion page).
2. 15–30 min review with engineering (focus on edge cases, mobile behavior, accessibility).
3. Engineering creates a tracking ticket with:
   - Link to Figma
   - Link to relevant docs in `/design/`
   - List of tokens and primitives to use
4. Implementation happens against the `ui/` primitive library when possible.
5. Design reviews the PR visually (especially glass layers, typography, and mobile).

---

## 5. What Engineering Must Deliver Back

- Token usage audit (no drift)
- Component usage report (how many places still use old local components)
- Mobile-first implementation proof (tested on real devices)
- Accessibility audit results (using the checklist)
- Print/PDF fidelity check (for any eCign or report work)

---

## 6. Common Anti-Patterns to Avoid

- Creating a new "Card" component instead of using `ui/Card` or `GlassPanel`
- Hardcoding colors for status instead of using semantic tokens
- Different tab implementations across CES, Policy, and Onboarding
- Ignoring `prefers-reduced-motion`
- Building custom drawers on mobile instead of using bottom sheets

---

## 7. Tooling & Automation (Future)

- Token sync via Style Dictionary or Tokens Studio
- Visual regression tests for key screens (especially signed eCign packets)
- Automated accessibility checks in CI

---

*Good handoff = fast implementation + zero visual debt.*

---

**Related Documents:**
- `FIGMA_KIT_SPEC.md`
- `DESIGN_TOKEN_EXPORT_GUIDE.md`
- `COMPONENT_GUIDELINES.md`
- `V2_DESIGN_DIRECTION_SUMMARY.md`