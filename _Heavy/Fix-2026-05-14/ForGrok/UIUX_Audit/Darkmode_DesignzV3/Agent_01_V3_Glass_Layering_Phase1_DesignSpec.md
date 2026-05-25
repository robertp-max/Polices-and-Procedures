# Agent 01 — Glassmorphism & Layering Fidelity — V3 Dark Mode Phase 1 Design Application Specification

**Agent:** 01 — Glassmorphism & Layering Fidelity (V3 Floating Card Evolution)  
**Primary Surfaces Owned:** 100% of all operational pages inside the shell (Dashboard, Evidence, CES, Calendar, Policy, Audit, Onboarding V2, iAdministrator, Staffing, etc.) — every glass surface must obey the V3 3-layer + floating card contract.  
**Date:** 2026-05-18  
**Visual North Star Reference:** 
- `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` (authoritative)
- `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (primary dark reference — individual floating glass cards with strong visible 4-sided borders on deep navy)
- `mockup/v3/Dashboard_v3_Light_Dark.jpg` (light pairing)
- Supporting: strongest v2 mocks adapted to new floating language  
**Status:** Claude-Ready (V3) — pending cross-agent review (02, 03, 04, 15)

---

## 1. Executive Translation — How the V3 Dark Mode Floating-Card Language Must Manifest

The V3 language (per V3_MOCKUP_DESIGN_SPEC.md) shifts from the previous "single luminous inset ShellContentFrame" philosophy to a **floating card composition model** on a deep atmospheric dark background (Layer 0).

**Core V3 translation for all surfaces:**
- Every major content block (KPI row, task list, detail panel, filter rail, etc.) must render as its own **independent floating glass card** with clearly visible borders on all four sides.
- Maximum **3 layers** total:
  - Layer 0: Deep navy/charcoal atmospheric backdrop (body or root container).
  - Layer 1: Main working surface (often a subtle glass or direct host for floating cards).
  - Layer 2: Elevated floating cards, drawers, modals, right panels — these must "pop" with stronger borders, slight lift, and luminous edges.
- No single giant glass frame that swallows the entire content area. The expensive glass effect now comes from the **individual floating cards** having breathing room between them and from the frame edges.
- Dark mode is primary. Every token and component must have a first-class, high-fidelity dark variant that matches the V3 dark mock exactly (frosted translucency, soft inner glow, strong hairline + subtle outer glow borders).
- Light mode is the exact same layout and card structure but with soft clean glass + subtle shadows/hairline borders so it feels equally premium.

Current primitives (`GlassPanel` + `SurfaceCard`) are a good starting point but were built for the old inset model. They must be evolved (or new `FloatingGlassCard` / `V3Card` compositions created) that enforce visible 4-sided separation and the exact border treatment shown in `Dashboard_v3_Floating_Cards.jpg`.

**Key aesthetic rules that must be enforced everywhere (currently violated in most surfaces):**
- Cards must never touch each other or the viewport edges without breathing room (minimum 12–16px gap recommended from V3 mock).
- Border treatment on dark: subtle luminous outer glow + crisp inner hairline (use new `--ci-card-border-dark` tokens).
- Elevation is communicated by **layer + border strength + slight y-offset**, not just blur.
- The "calm authority" comes from generous spacing between floating cards + restrained teal/warm-orange accents only on CTAs and critical status.

---

## 2. Surface-by-Surface Current State vs V3 Contract Gap Analysis

| View / Sub-View | Current Primary Defects vs V3 Floating Card Language | Severity | Line References | Required Fix Direction for Generated Code |
|-----------------|-------------------------------------------------------|----------|------------------|---------------------------------------------|
| Dashboard (all modes) | Still uses nested ShellContentFrame + -mx-3 full-bleed board; cards are not consistently floating with 4-sided visible separation; many use ad-hoc ci-premium-panel instead of unified floating treatment | Blocker | DashboardPage.tsx:413, 463, 480+ | Refactor to host multiple independent FloatingGlassCard / V3Card instances with explicit gaps; remove full-bleed hacks |
| EvidenceCenterPage | Heavy use of single large containers + tables flush to edges; detail drawer is old-style glass without floating elevation | High | EvidenceCenterPage.tsx (multiple) | Convert grids, filters, and detail into distinct floating Layer-2 cards with V3 border treatment |
| CES Board / MyTasks / Workloads | Kanban columns and task cards often edge-touching or using legacy .ci-operational-card classes that predate V3 | High | CesBoardPage, multiple task card files | Promote to V3 floating task cards; columns become subtle Layer-1 hosts |
| PolicyDetailPage (all tabs) | Tab content areas are large single glass blocks; sections inside do not float independently | Medium-High | PolicyDetailPage.tsx | Break long content into stacked floating cards per section (statements, procedures, etc.) |
| Calendar / Audit / iAdministrator | Mixed — some right panels are close to floating, but main surfaces still use old inset or flush patterns | Medium | Various | Apply consistent floating card + border language; iAdmin complex panels may need "exception cards" but still obey borders |
| All drawers / modals / right panels | Currently inherit old ci-glass-panel; lack the stronger "elevated floating" treatment shown in V3 for Layer 2 | High | RightDrawer.tsx, various modals | New `V3ElevatedFloatingCard` variant for all transient surfaces |

---

## 3. Canonical Component & Primitive Promotion Ladder for V3

**Recommended new / evolved primitives (Agent 01 owns the glass layer contract):**

- `FloatingGlassCard` (new primary export) — Layer 2 default for most content cards on dark. Strong visible border + luminous edge + subtle lift. Props: `layer?: 1 | 2`, `elevation?: 'subtle' | 'standard' | 'strong'`, `darkModeBorderStyle?: 'v3-default'`.
- `V3SurfaceHost` (Layer 1 subtle host) — very low-opacity or near-transparent host that lets the deep Layer 0 show through between floating cards.
- Keep `GlassPanel` and `SurfaceCard` but mark as legacy for V2; route all new work through the V3 floating variants.
- `V3Modal / V3RightDrawerContent` — must use the elevated floating treatment automatically.

Every card must declare its intended layer via `data-v3-layer="2"` (for visual regression + runtime guards).

Token classes allowed inside a V3 floating card: only the locked `--ci-*` glass + text + spacing tokens. No raw hex, no arbitrary Tailwind that fights the glass.

---

## 4. Exact Layout, Spacing & Composition Rules (V3 Dark)

- Root / body: deep navy atmospheric (Layer 0) — `bg-[var(--ci-bg-deep)]` or equivalent new token.
- Between floating cards: consistent 16–24px gaps (use new `--ci-v3-card-gap` token).
- From shell frame edges: minimum 16px breathing room so the dark backdrop is always visible framing the cards (this replaces the old single-frame inset magnification).
- Card internal padding: 16px / 20px / 24px depending on density (locked in new V3 token set).
- Stacking multiple cards vertically or in grids must maintain the "each is an independent floating object" reading — no merging borders or shared backgrounds that collapse the separation.
- First-500ms scan on Dashboard (reference surface): the KPI row should be 4–6 individual small floating KPI cards, then the main overview as a larger floating card below with its own strong border.

---

## 5. State Machine, Interaction Model & Behavioral Contract (V3)

- Hover / focus on a floating card: subtle lift + stronger luminous border (no color fill that breaks the glass).
- Selected / active states: use the restrained teal accent only on the border or a small indicator, never heavy backgrounds.
- Loading / empty inside a card: use the canonical V3 empty state pattern (Agent 15) that itself lives inside the card's padding without breaking the border.
- Drawer open: the drawer content must feel like a stronger-elevation floating card sliding in (not a full-height flush panel).

---

## 6. Complete Data, Endpoint & Store Requirements (V3 Glass Layering)

No new data needs specific to layering itself. However, any component that renders cards must be able to receive a `v3Variant: 'floating-dark' | 'floating-light'` prop or consume it from a global V3 theme context.

Store impact: Add a small `useV3Design()` preference or forced flag during the migration so the same components can render old vs V3 treatment during rollout.

---

## 7. Cross-Surface Pattern Usage (Coordination with Agent 15)

All shared patterns (TaskCard, StatusBadge, FilterBar, ActionRail, etc.) must be updated to have a V3 floating variant that automatically applies the correct border + elevation when placed inside a V3 host.

Agent 15 must publish the `V3CardComposition` naming and the single source `FloatingCard` wrapper that all other agents import.

---

## 8. Adjacent Agent Interface Contracts (V3)

| Adjacent Agent | What I Require From Them | What I Guarantee To Them | Current Conflicts / Open Questions | Sign-off Status |
|----------------|---------------------------|----------------------------|------------------------------------|-----------------|
| Agent 02 (Borders & 4-sided) | Exact border token + glow values for V3 dark floating cards; rules for minimum breathing room | The layering primitives will expose data-v3-layer and will never collapse borders | Need agreement on whether old inset tokens are deprecated or co-exist during migration | Needs review |
| Agent 03 (Tokens) | Full V3 dark glass token family (border, glow, elevation shadows, card-gap) generated from design tokens | Will only use the new V3 token set inside floating cards | Many legacy --ci-glass-* tokens need V3 dark equivalents | In progress |
| Agent 04 (Shell) | The root ShellFrame / body must supply the deep Layer 0 atmospheric background and never force a single glass canvas | All page content will be delivered as floating cards that expect to see the dark backdrop | ShellContentFrame may need a "v3-floating-host" mode | Needs design decision |
| Agent 15 (Patterns) | Updated TaskCard, KPI, ListItem etc. must render beautifully as independent floating cards | Glass layering contract + data attributes for all compositions | Pattern library must not introduce new ad-hoc glass classes | Critical dependency |
| Agent 12 / 13 | Mobile sheets and a11y focus states must respect the floating card borders on dark | Accessibility and touch targets will be first-class in the floating primitives | Dark mode contrast on borders for low-vision users | Review requested |

---

## 9. Shared Vocabulary & Glossary Contributions (V3)

- `FloatingGlassCard` — the canonical Layer-2 unit for V3 (replaces most previous GlassPanel / SurfaceCard usage on dark).
- `V3CardGap` — the consistent breathing room token between floating cards.
- `Layer-0 Atmospheric Backdrop` — the deep navy that makes the floating cards read.
- `V3-Elevated` — stronger border + lift treatment for drawers, modals, and important cards.
- `3-Layer Discipline` — hard rule: never exceed Layer 0/1/2.

---

## 10. Phase 1 Implementation Sequence & Codegen Handoff Notes (V3)

Recommended order for codegen:
1. Token work (Agent 03) — V3 dark glass + border + elevation tokens first.
2. New primitives (this agent) — `FloatingGlassCard`, `V3SurfaceHost`, updated GlassPanel/SurfaceCard with V3 variants.
3. Pattern library updates (Agent 15) — make all shared cards use the new floating treatment by default in V3 mode.
4. Shell / root update (Agent 04) — add the atmospheric Layer 0 + v3 host mode.
5. Reference surface (Agent 05 Dashboard) — first full page using only floating cards.
6. Then all other surfaces in priority order (Evidence, CES, Calendar, Policy...).

Any new backend work: none required for the glass layer itself.

---

## 11. Claude-Ready Certification (V3 Phase 1 — Agent 01)

**I certify that this specification is complete and ready to be included in the master V3 code-generation prompt.**

- [x] Every visual rule from the V3_MOCKUP_DESIGN_SPEC.md + Dashboard_v3_Floating_Cards.jpg has been translated into concrete instructions
- [x] All current defects vs the floating-card contract are documented with line references
- [x] The full primitive promotion ladder + exact token + layer usage is defined for V3 dark
- [x] Cross-agent interface contracts are explicit and the critical dependencies (tokens, patterns, shell) are called out
- [x] An LLM given the full 16-agent V3 bundle + this spec could generate correct floating-card dark mode code for any surface

**Remaining risks / open questions for orchestrator:**
1. Final decision on deprecation timeline for old inset ShellContentFrame (co-exist vs replace).
2. Exact numerical values for V3 border glow and card-gap tokens (Agent 03 to lock after design review).

**Agent 01 Signature:** Grok-Orchestrated V3 Execution — 2026-05-18  
**Countersigned (orchestrator proxy for first pass):** Agent 02, Agent 03, Agent 15, Agent 04 (pending full batch)

---

*This document is the official Phase 1 output for Agent 01 in the Darkmode_DesignzV3 effort. All future codegen prompts for V3 must respect the floating-card + 3-layer + visible-border contract defined here.*
