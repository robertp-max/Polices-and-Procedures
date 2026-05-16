# Visual Regression & Quality Assurance Strategy — CareIndeed v2

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document defines how to protect the visual integrity of the v2 design system through automated and manual visual regression testing, especially during the migration and ongoing development.

---

## 2. Why This Matters

The v2 system relies heavily on subtle glass effects, elevation, typography, and spacing. Small regressions (wrong padding, broken glass layers, incorrect focus states) can quickly destroy the premium feel.

---

## 3. Recommended Testing Layers

### Layer 1: Component-Level Visual Regression (Storybook + Chromatic / Percy)
- Test all `ui/` components in all variants and states (default, hover, focus, active, disabled, loading, error).
- Test in both Dark and Light mode.
- Test at multiple breakpoints (mobile, tablet, desktop).

### Layer 2: Key Screen Snapshots (Critical Production Surfaces)
Prioritize these surfaces for full-page visual regression:
- CES Board (most used)
- eCign Signing flow (legal + high risk)
- Evidence Center
- Onboarding V2 Batch & Unit views
- Master Calendar
- Policy Detail (SharedPolicyDetailView)

### Layer 3: Cross-Browser & Device Testing
- Chrome, Edge, Safari (iOS)
- Real iPhone + Android devices for gesture and touch interactions

---

## 4. Tooling Recommendations

| Tool                  | Use Case                              | Priority |
|-----------------------|---------------------------------------|----------|
| **Chromatic** or **Percy** | Storybook component regression       | High     |
| **Playwright**        | Full page + interaction screenshots  | High     |
| **Storybook**         | Component development + docs         | High     |
| Manual QA             | Final human review before release    | Required |

---

## 5. Testing Cadence

- **On every PR** that touches `ui/` components or key production screens → Run visual regression.
- **Before merging** any design system change → Require visual approval.
- **Monthly** full regression on the top 8 production surfaces.

---

## 6. Process

1. Developer makes a change.
2. Visual regression tests run automatically.
3. Reviewer compares snapshots (new vs baseline).
4. If approved, change can be merged.
5. Baselines are updated only after human review.

---

## 7. Success Criteria

- Zero unapproved visual drift in production.
- New components are added with visual tests from day one.
- Design reviews can focus on intent instead of catching pixel bugs.

---

*Visual regression testing is one of the best investments for maintaining a premium design system at scale.*

---

**Related Documents:**
- `DESIGN_SYSTEM_GOVERNANCE.md`
- `BUILDING_V2_SCREEN_PLAYBOOK.md`
- `COMPONENT_ANATOMY_AND_CODE_EXAMPLES.md`