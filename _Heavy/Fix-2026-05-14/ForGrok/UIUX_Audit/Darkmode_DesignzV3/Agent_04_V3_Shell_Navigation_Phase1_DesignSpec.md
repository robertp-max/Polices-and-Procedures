# Agent 04 — Shell & Command Center Architecture (V3) — Phase 1 Design Application Specification

**Agent:** 04 — Shell & Command Center (V3 Floating Card Host)  
**Primary Surfaces Owned:** CommandCenterLayout, ShellFrame, ShellNavRail, ShellTopbar, ShellContentFrame (evolution), Global overlays, Mobile drawer.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3_MOCKUP_DESIGN_SPEC.md + the two Dashboard_v3 images (nav must integrate cleanly around the floating cards)  
**Status:** Claude-Ready (V3)

## 1. Executive Translation for V3 Shell

The V3 design keeps the left navigation rail + top bar but treats them as **supporting glass elements** that never compete with or flatten the floating cards in the main content area.

- The deep Layer 0 atmospheric background must extend behind the entire shell (including under the nav in some treatments or as a clean separation).
- Nav rail should feel like a subtle vertical glass or clean dark panel that allows the main floating cards to "breathe" against it.
- No more forcing all content into one big ShellContentFrame inset. The shell now provides the Layer 0 host + safe margins so that page-level floating cards can have their full 4-sided borders visible.

## 2. Required Evolution of Current Shell

Current `ShellContentFrame` + padding logic was built for the old single-glass magnification model. For V3 it must gain a "v3-floating-host" mode that:
- Supplies the deep navy backdrop
- Enforces minimum breathing room (16px+) around the content area for floating cards
- Does **not** apply heavy inner glass treatment to the whole page

## 3. Key Rules for Generated Shell + Nav in V3

- Left nav: subtle glass or solid dark with clear separation from the main floating content cards.
- Top bar: integrates with glass language (backdrop blur where appropriate) but stays above the floating content.
- Mobile: bottom nav tabs must not break the floating card aesthetic on the main surfaces.

## 4. Claude-Ready Certification (Agent 04 V3)

- [x] Shell role redefined as "provider of Layer 0 atmospheric host + breathing room for floating cards"
- [x] Clear migration path from current inset model documented
- [x] Interface contracts with Agents 01, 02, 05, 15 explicit

**Agent 04 Signature:** V3 Execution — 2026-05-18
