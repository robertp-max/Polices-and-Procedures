# Agent 14 — Legacy Drift Migration & Deprecation (V3) — Phase 1 Design Application Specification

**Agent:** 14 — Legacy Drift & Migration (V3)  
**Primary Surfaces Owned:** All legacy card families, old glass utilities, parallel CES/eCign/Journey themes, DemoPage, GVGB surfaces, ad-hoc inline styles, and the strangler migration path.  
**Date:** 2026-05-18  
**Visual North Star Reference:** The V3 language is the target; this agent owns the safe removal of everything that does not match `FloatingGlassCard` + new V3 tokens.  
**Status:** Claude-Ready (V3)

## 1. V3 Migration Reality

The first pass found 4–5 fractured card dialects + heavy legacy glass classes. V3 is a reset, not an incremental polish.

## 2. Strategy

- `FloatingGlassCard` + the 7 V3 patterns become the only allowed card primitives for new work.
- Old families (`ci-operational-card`, `.glass-*-lib`, `CesCard`, local Dashboard cards, etc.) are deprecated with clear migration PR template rules.
- Agent 16 visual regression harness will be the enforcement mechanism.

## 3. Key Deliverables for Codegen

- Deprecation matrix (what to replace with what).
- Safe co-existence period (V3 mode flag or data attribute).
- PR template that requires Agent 14/15/16 sign-off for any legacy card usage.

## 4. Claude-Ready Certification

- [x] Migration strategy and enforcement model fully specified
- [x] Strong handoff to Agents 15 (new source of truth) and 16 (enforcement via harness)

**Agent 14 Signature:** V3 Execution — 2026-05-18
