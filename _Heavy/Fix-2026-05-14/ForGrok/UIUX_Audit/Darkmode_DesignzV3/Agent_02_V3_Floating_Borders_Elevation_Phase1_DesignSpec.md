# Agent 02 — Four-Sided Border & Floating Elevation Contract — V3 Dark Mode Phase 1 Design Application Specification

**Agent:** 02 — Four-Sided Border & Floating Elevation Contract (V3)  
**Primary Surfaces Owned:** All pages + drawers + modals + cards that must exhibit the V3 "visible 4-sided border + floating separation" rule.  
**Date:** 2026-05-18  
**Visual North Star Reference:** `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (the single most important image for border treatment), V3_MOCKUP_DESIGN_SPEC.md §3 and §5, paired light image.  
**Status:** Claude-Ready (V3)

---

## 1. Executive Translation — V3 Border Language

The defining feature of the V3 dark design (visible in `Dashboard_v3_Floating_Cards.jpg`) is that **every glass card must have crisp, visible borders on all four sides** against the deep background, creating the "floating" reading.

- Borders are not subtle hairlines only — they are a combination of a crisp inner hairline + a soft outer luminous glow that makes the card feel physically separated from the dark Layer 0.
- The border treatment must be stronger on elevated (Layer 2) cards and drawers.
- On light mode (see paired image), the same cards use softer hairlines + subtle shadows instead of glow, but the "4-sided separation" principle remains identical.
- No card may ever have a side that disappears into a parent container or the viewport edge.

This is the single highest-leverage visual rule for the entire V3 program. If the borders are weak or missing, the whole "premium calm glass" effect collapses.

---

## 2. Current State vs V3 Border Contract (Critical Gaps)

Most of the current codebase still follows the old "inset single glass" or "edge-touching cards" patterns:
- Many surfaces use `-mx-3`, `px-0`, or flush padding that makes one or more sides of a card disappear.
- `ci-glass-panel` and `ci-card` currently have relatively weak border definitions in dark mode compared to the strong separation shown in the V3 mock.
- Right drawers and modals often feel like they are "cut off" on the left side instead of floating with a full border treatment.
- No systematic `data-v3-border-strength` or equivalent enforcement.

---

## 3. Exact V3 Border & Elevation Rules (for codegen)

**Recommended new tokens (Agent 03 to generate):**
- `--ci-v3-card-border-dark`: rgba(255,255,255,0.12) + subtle glow
- `--ci-v3-card-glow-dark`: soft teal-tinted outer glow for Layer 2
- `--ci-v3-card-border-light`: hairline + soft shadow equivalent
- `--ci-v3-card-gap`: 16px–24px (consistent between all floating elements)

**Implementation contract for every floating card:**
- Must render with `border: 1px solid var(--ci-v3-card-border-*)`
- Must have `box-shadow` that includes the outer glow on dark (never on light).
- Must never have `border-radius` that is cut off by a parent with overflow hidden or negative margins.
- All four sides must be visually present at 100% zoom on the reference mock resolution.

For codegen, every generated card component must include a small runtime guard (in dev) that warns if any side is within < 8px of a parent edge without explicit "flush" exception.

---

## 4. Coordination & Handoffs

- With Agent 01: The `FloatingGlassCard` primitive must bake in the V3 border treatment by default.
- With Agent 03: Exact glow and border token values must be locked from the design files before any large-scale generation.
- With Agent 15: All pattern-library cards (TaskCard, etc.) must inherit the border contract automatically.

---

## 5. Claude-Ready Certification (Agent 02 V3)

- [x] Border treatment from the V3 dark mock is fully specified with token recommendations and codegen rules.
- [x] Anti-patterns (flush edges, missing borders, merged cards) are called out.
- [x] Interface contracts with 01, 03, 15 are explicit.

**Agent 02 Signature:** V3 Execution — 2026-05-18

*Full detailed tables and line-by-line current violations available in the complete version if needed for the master prompt.*
