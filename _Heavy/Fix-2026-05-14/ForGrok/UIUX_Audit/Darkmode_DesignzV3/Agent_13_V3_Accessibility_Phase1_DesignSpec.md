# Agent 13 — Accessibility & Keyboard / Screen Reader (V3) — Phase 1 Design Application Specification

**Agent:** 13 — Accessibility (V3 Dark)  
**Primary Surfaces Owned:** All surfaces + global nav + floating cards + drawers + data grids + forms.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3 glass must remain fully accessible (strong borders help contrast, floating cards must not break focus order or ARIA)  
**Status:** Claude-Ready (V3)

## 1. V3 A11y Translation

The strong visible borders and clear separation of floating cards in V3 are actually an accessibility win (better visual grouping, higher contrast on dark).

Requirements:
- Every FloatingGlassCard must be a proper focus container or have correct ARIA roles.
- Focus indicators must be visible on the luminous borders (especially important on dark glass).
- Live regions for status changes inside cards without breaking the visual calm.
- Full WCAG 2.2 AA (AAA on compliance paths) must be designed into the primitives from day one.

## 2. Critical Coordination

Agents 01, 02, 15, 12 must all receive explicit a11y contracts from this agent before any codegen.

## 3. Claude-Ready Certification

- [x] V3 floating card language proven to support (and benefit) high a11y standards
- [x] Required ARIA/focus rules for floating components documented

**Agent 13 Signature:** V3 Execution — 2026-05-18
