# Migration & Phased Rollout Strategy — CareIndeed v2 Design System

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

This document outlines a realistic, low-risk strategy for migrating the existing fragmented UI to the new v2 Care Indeed design system without a big-bang rewrite.

---

## 2. Overall Approach

**Do not attempt a full rewrite.**  
Instead, use a **strangler fig pattern** — gradually replace old components and surfaces with v2 versions while keeping the application stable.

---

## 3. Recommended Phases

### Phase 0: Foundations (Current)
- Freeze new component creation outside the `ui/` folder
- Establish token system (`DESIGN_TOKENS_IMPLEMENTATION_GUIDE.md`)
- Build core primitives (`Button`, `Card`, `Input`, `Badge`, `EmptyState`, `Loading`, `Tabs`, `BottomSheet`)
- Create this documentation set

**Goal:** Have a usable primitive library before touching production screens.

### Phase 1: High-Impact Shared Components (1–2 months)
Replace the most duplicated components across the app:

- Buttons and form fields
- Cards and status badges
- Empty states and loading indicators
- Tabs and navigation primitives

**Target surfaces:** Any screen that uses these heavily (Policy Library, CES Board, Evidence Center, etc.)

### Phase 2: Core Operational Workflows (2–4 months)
Apply full v2 treatment to the highest-value production surfaces:

1. **CES Board + My Tasks** (highest daily usage)
2. **eCign Signing Experience** (legal risk + visual regression history)
3. **Evidence Capture & Evidence Center**
4. **Onboarding V2** (critical for business)
5. **Calendar** (unified view)

These surfaces should receive the full treatment (proper glass layering, mobile patterns, tokens, accessibility, content).

### Phase 3: Secondary Production Surfaces
- Policy Detail & Library
- Audit Readiness
- Reports & Dashboards
- Clinician & Patient profiles
- Staffing Calendar (read-only)

### Phase 4: Cleanup & Deprecation
- Remove old local components
- Delete legacy styling
- Enforce ESLint rules against raw values and old component usage
- Update Storybook / documentation

---

## 4. Risk Mitigation

| Risk                        | Mitigation |
|-----------------------------|----------|
| Visual inconsistency during migration | Use feature flags or route-based theming where possible |
| Breaking existing functionality | Never replace a component until it has full test coverage |
| Team resistance to new system | Provide the **Building a v2 Screen Playbook** and good examples |
| Scope creep                   | Strictly follow the **Production Surface Filter** (no Demo, iAdmin, Hubstaff, etc.) |

---

## 5. Governance During Migration

- Any new feature or major update on a production surface **must** use v2 components.
- Old surfaces can continue using legacy components temporarily, but no new legacy components should be created.
- Design Systems team reviews any PR that introduces new UI on production routes.

---

## 6. Success Metrics

- % of production screens using only v2 primitives
- Reduction in custom CSS / inline styles
- Improved accessibility scores on key surfaces
- Faster design-to-production time for new features
- Reduced visual bugs reported by QA and users

---

## 7. Recommended Tooling

- ESLint rules to ban raw color/spacing values
- Visual regression testing on key screens (especially eCign packets)
- Storybook for the `ui/` component library
- Feature flags for gradual rollout of new surfaces

---

*This phased approach allows the team to deliver value early while steadily moving toward a clean, consistent v2 system.*

---

**Related Documents:**
- `BUILDING_V2_SCREEN_PLAYBOOK.md`
- `ENGINEERING_HANDOFF_GUIDE.md`
- `PRODUCTION_SURFACE_FILTER.md` (from strategy folder)