# Phase 2 — V3 Veil Glass Foundation Implementation Plan

**Phase:** 2 — Foundation Realization  
**Status:** Ready to Execute  
**Date:** 2026-05-18  
**Pre-requisites:** Phase 1 + Phase 1.1 complete and locked

---

## 1. Phase 2 Goal

Turn all the design, behavior, and visual contracts from Phase 1 / 1.1 into **production-grade, reusable React primitives** that become the *only* way to build V3 surfaces going forward.

By the end of Phase 2, the following must exist and be battle-tested:

- Complete V3 token system (dark + light)
- `VeilDrawer` primitive with full two-layer non-stacking support
- `TaskRowMinimal` as the universal list row
- `VeilSection` internal content block
- Global single-bordered shell primitives
- Evidence folder row primitive with % completion
- Supporting low-level pieces (status pills, hover cards, search preview)

Once these exist, Phase 3 (surface generation) can move extremely fast with high visual fidelity.

---

## 2. Updated Core Deliverables for Phase 2 (Veil Era)

### 2.1 Token System (Agent 03 + Design)

**Deliverables**
- `tokens/v3-tokens.json` (or extension of existing theme system)
- CSS custom properties + Tailwind config update
- Dark + Light pairing fully defined
- All values from `V3_Veil_Glass_Theme_Tokens_Spec.md` implemented

**Success Criteria**
- Token regeneration is automated
- No hard-coded colors or blur values anywhere in new components

### 2.2 Veil Drawer System (Highest Priority)

**Primary Primitive**
- `VeilDrawer` component
  - Props: `open`, `onClose`, `title`, `eyebrow`, `widthTier`, `layer` (1 or 2), `children`
  - Handles non-stacking transition internally (or via a `useVeil` store)
  - Exit-right → Enter-left animation when moving from Layer 1 to Layer 2
  - Backdrop scrim, ESC, click-outside, focus management

**Supporting**
- `VeilSection` — collapsible glass content islands inside the Veil
- `useVeil()` hook or Zustand/Redux store for global open/close + context state
- Animation tokens and easing curve locked

### 2.3 Minimal Core Components

| Component                | Purpose                                      | Owner     |
|--------------------------|----------------------------------------------|-----------|
| `TaskRowMinimal`         | Universal ultra-clean row for all lists      | Agent 06  |
| `EvidenceFolderRow`      | Google Drive/Windows style + % on folder     | Agent 07  |
| `StatusPillV3`           | Compact, high-contrast status                | Agent 15  |
| `MinimalHoverCard`       | Quick facts on hover (never duplicates Veil) | Agent 04  |
| `SearchWithPreview`      | Logo + search + live dropdown                | Agent 04  |

### 2.4 Global Shell & Layout Primitives

- `MainBorderedCard` / `AppShell` — enforces the single-card rule
- Collapsible left nav with bottom icons (notification + profile)
- Header strip with compliance metadata row (STEP / SLA / RISK / AUDIT READINESS)
- Hamburger + search placement contract

### 2.5 Reference Implementation Surface

Recommended first full surface to implement after primitives:
- **CES Task List + Calendar view** (highest volume + best test of the two-layer Veil)

This surface will serve as the golden master for Phase 3.

---

## 3. Implementation Order (Strictly Recommended)

1. **Tokens** (foundation for everything else)
2. **VeilDrawer + VeilSection + useVeil** (the hero component)
3. **TaskRowMinimal**
4. **Global Shell / MainBorderedCard**
5. **EvidenceFolderRow + % badge**
6. **Supporting atoms** (pills, hover cards, search preview)
7. **Pilot surface** (CES Calendar or My Tasks)
8. **Fidelity gate** (Agent 16 review against locked references)

---

## 4. Phase 2 Exit Gate (Strict)

Before moving to Phase 3, the following must be true:

- [ ] All core primitives exist and are the *only* way to build new UI
- [ ] Veil two-layer non-stacking behavior works perfectly (including transition)
- [ ] Default view on the pilot surface achieves ≥70% clutter reduction (measured)
- [ ] Both dark and light modes pass visual fidelity review against the four approved references:
  - `Approved_Drawer_Style_04.jpg`
  - `Approved_Evidence_Icon_View_07.jpg`
  - `Approved_Policy_Viewer_08.jpg`
  - `Approved_Global_Shell_13.jpg`
- [ ] Token system is documented and regeneration is automated
- [ ] `V3_Veil_Drawer_Behavior_Spec.md` is fully respected in code
- [ ] Agent 16 + Design Lead sign-off on "Foundation Complete"

---

## 5. Documentation & Governance

All new code must include:

```tsx
// V3 Fidelity Notes (Phase 2)
// Uses: VeilDrawer, TaskRowMinimal, v3-veil-* tokens
// References: V3_Veil_Glass_Theme_Tokens_Spec.md + V3_Veil_Drawer_Behavior_Spec.md
```

Any deviation from the behavior or theme specs requires explicit review by Agent 14 (Consistency) + Agent 16 (Fidelity).

---

## 6. Risk Mitigation

| Risk                              | Mitigation |
|-----------------------------------|----------|
| Veil feels too heavy on performance | Strong blur control + optional reduced-motion path |
| Developers want to add "just one more thing" to default view | Ruthless component API — make it hard to do the wrong thing |
| Light mode drifts from dark | Build both modes in parallel from day one |
| Animation feels inconsistent | Lock easing + duration in tokens early |

---

## 7. Deliverables Checklist

- [ ] `V3_Veil_Glass_Theme_Tokens_Spec.md` (done)
- [ ] `V3_Veil_Drawer_Behavior_Spec.md` (done)
- [ ] Token implementation + generators
- [ ] `VeilDrawer` + `VeilSection` components
- [ ] `TaskRowMinimal` component
- [ ] Global shell primitives
- [ ] Evidence folder primitives
- [ ] Pilot surface implementation
- [ ] Phase 2 Fidelity Gate report (Agent 16)

---

**Phase 2 is the bridge between "beautiful specification" and "beautiful production code".**

When these primitives exist and pass the gate, the rest of the app can be generated at high speed in Phase 3 with almost zero visual drift.