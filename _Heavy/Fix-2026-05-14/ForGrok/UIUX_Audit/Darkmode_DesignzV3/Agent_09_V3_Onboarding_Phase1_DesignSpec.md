# Agent 09 — Onboarding & Competency Journey (V1 + V2 Convergence) (V3) — Phase 1 Design Application Specification

**Agent:** 09 — Onboarding Journey (V3)  
**Primary Surfaces Owned:** JourneyHomePage, OnboardingV1 (entire internal states), OnboardingV2Layout + all 6 sub-pages, ModulePlayer, Supervisor views.  
**Date:** 2026-05-18  
**Visual North Star Reference:** V3 floating card language must work for both the more “guided/light-professional” Onboarding V2 and any remaining V1 surfaces during convergence.  
**Status:** Claude-Ready (V3)

## 1. V3 Translation for Onboarding

Onboarding has two parallel systems that must converge on the same visual language:
- V2 (preferred) should feel slightly more “light-professional” while still using the exact same `FloatingGlassCard` chrome, borders, and spacing as the operational dark-first surfaces.
- Cards, lesson modules, progress indicators, and forms must all be floating glass cards.
- The “calm authority” tone must still feel supportive rather than cold.

## 2. Critical Issue

Two visual dialects currently exist. V3 forces unification under the single `FloatingGlassCard` + pattern library, with a documented “light-professional” variant of the tokens (still using the same wrapper).

## 3. Codegen Requirements

- All onboarding surfaces must use the V3 pattern library.
- Any light-professional treatment must be achieved purely through the paired light tokens (Agent 03), not by inventing new card styles.

## 4. Claude-Ready Certification

- [x] Convergence strategy + V3 pattern adoption fully specified
- [x] Coordination with Agent 15 (patterns) and Agent 12 (mobile journey flows) explicit

**Agent 09 Signature:** V3 Execution — 2026-05-18
