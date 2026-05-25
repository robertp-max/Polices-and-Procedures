# Agent 11 — Typography, Spacing & Hierarchy System (V3) — Phase 1 Design Application Specification

**Agent:** 11 — Typography & Hierarchy (V3)  
**Primary Surfaces Owned:** Typography, spacing, and visual hierarchy across all 70+ views (ci-text-* scale, heading treatments, body, labels, urgency text, etc.).  
**Date:** 2026-05-18  
**Visual North Star Reference:** Typography visible in the two V3 images — clear hierarchy, comfortable reading on glass, restrained accents, excellent contrast on both dark and light floating cards.  
**Status:** Claude-Ready (V3)

## 1. V3 Typography Translation

The V3 dark glass aesthetic demands excellent typography because text sits on translucent surfaces:

- Strong, calm hierarchy using the locked scale (Montserrat or equivalent for headings, clean sans for body).
- Higher contrast requirements on dark frosted glass than on solid surfaces.
- Urgency communicated primarily through the 5-level left-border + StatusBadgeV3 system, with typography supporting (not competing).
- Generous line-height and comfortable sizes for long regulatory/policy content.

## 2. Current Gaps

Inconsistent use of `ci-text-*` tokens, ad-hoc sizes, poor contrast on some glass overlays, and legacy small labels that fight readability on the new dark glass.

## 3. Requirements for Codegen

- All text must come from the approved V3 typography token set (Agent 03 + 11).
- No `text-[13px]`, `text-xs`, arbitrary tracking, etc.
- Status/urgency text always uses the semantic system, never raw colors.

## 4. Coordination

Must countersign with Agents 01/02/15/16 on contrast, glow interference with text, and mobile scaling.

## 5. Claude-Ready Certification

- [x] V3 typography rules mapped to floating glass readability
- [x] Strong cross-cutting dependency on the new token set and pattern library

**Agent 11 Signature:** V3 Execution — 2026-05-18
