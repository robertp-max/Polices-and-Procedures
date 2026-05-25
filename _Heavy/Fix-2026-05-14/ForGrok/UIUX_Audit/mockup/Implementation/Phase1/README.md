# Phase 1 — Foundation Lock & Enforcement: Constraint Specifications

**Status:** Phase 1 Governing Constraints
**Authority:** Derived from [`docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`](../../../../../../docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md), §3 (Layer Model) and §4 (Constrained Page View Contract).
**Scope:** **Rules only.** These documents define the rules of the game for Phase 2+ implementation. They do not modify any page content, surface layout, or information architecture.
**Visual contract source of truth:** approved mockups under `_Heavy/Fix-2026-05-14/ForGrok/UIUX_Audit/mockup/Top Picks/`, `mockup/Desktop/v2/`, and `mockup/Mobile/v2/`.

## Documents in this folder

| # | File | Topic |
|---|------|-------|
| 1 | [SHELL_AND_FRAME_CONSTRAINTS.md](SHELL_AND_FRAME_CONSTRAINTS.md) | 4-sided breathing-room contract, `ShellContentFrame` vs `ConstrainedPageContent` usage, responsive inset behavior, exception modes. |
| 2 | [GLASS_LAYERING_CONSTRAINTS.md](GLASS_LAYERING_CONSTRAINTS.md) | Strict 3-layer model, what may live inside Layer 1 vs Layer 2, prohibition on decorative inner blur, edge/focus/state treatment. |
| 3 | [TOKEN_AND_PRIMITIVE_CONSTRAINTS.md](TOKEN_AND_PRIMITIVE_CONSTRAINTS.md) | Mandatory tokens and primitives in Phase 1, color/spacing/typography/elevation rules, anti-patterns. |
| 4 | [MOTION_AND_A11Y_CONSTRAINTS.md](MOTION_AND_A11Y_CONSTRAINTS.md) | `TravelightBG` and animated-background rules, focus over blur, contrast over glass, reduced-motion contract. |
| 5 | [ANTI_DRIFT_RULES.md](ANTI_DRIFT_RULES.md) | Prohibitions against new dialects, sub-brand canvases, competing rails. How sanctioned exceptions must still obey the contract. |
| 6 | [ENFORCEMENT_DESIGN_REVIEW.md](ENFORCEMENT_DESIGN_REVIEW.md) | Design-side enforcement: review checklists, visual regression requirements vs. Top Picks mocks, rules to be promoted to lint/PR gates. |

## Reading order

Read 1 → 2 → 5 first. These define the perceptual contract and the prohibitions that protect it. Read 3, 4, 6 next to understand the supporting rules and enforcement model.

## Authority Stack (precedence on conflict)

1. `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md` (immutable in Phase 1).
2. These Phase 1 constraint documents.
3. The approved mockups (visual contract).
4. Phase 0 [`EXCEPTION_REGISTRY.md`](../Phase0/EXCEPTION_REGISTRY.md) (sanctioned deviations only).

Any conflict is resolved in favor of the higher-precedence source.

## Out of Scope (Phase 1)

The following are explicitly **not** in scope for Phase 1 and must not be modified by this constraint work:

- Page content, copy, or information architecture.
- Surface-level layout reorganizations (Dashboard zone shuffles, Evidence table → grid migrations, etc.).
- New feature design.
- Engine/business-logic changes.

Items requiring content or layout work are flagged `[OUT-OF-SCOPE-P1 → Phase 2]` inline where relevant.
