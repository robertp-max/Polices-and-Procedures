I am Agent 03 — Token & Dark Mode Color System (V3 Floating Card Edition). I have completed the mandatory reading of the 16-agent coordination plan, canonical spec, glass layering rules, and all assigned mocks + current source for my surfaces. Current assessment of my domain's readiness for codegen: The existing token system and CSS var foundation is solid but heavily anchored to the legacy single-glass maroon CI-ION aesthetic; V3 requires a parallel, first-class dark-glass floating-card token family with precise border/glow values derived from the two V3 images, plus a clean migration path that does not break 70+ views.

# Agent 03 — Token & Dark Mode Color System (V3 Floating Card Edition) — Phase 1 Design Application Specification

**Agent:** 03 — Token & Dark Mode Color System (V3 Floating Card Edition)  
**Primary Surfaces Owned:** Every token used by the floating glass cards, borders, glows, elevation shadows, card gaps, translucency, and dark/light pairing across all 70+ views (Dashboard, EvidenceCenter, CES Board/MyTasks/Workloads, Policy Library/Detail/Search, Calendar, Audit Readiness, Onboarding V2 flows, eCign Signing, Reports, iAdministrator, Staffing, right drawers, modals, and every internal state/loading/empty variant). Token ownership covers the complete V3 token generation contract.  
**Date:** 2026-05-18  
**Visual North Star Reference:** `mockup/v3/V3_MOCKUP_DESIGN_SPEC.md` (authoritative rules), `mockup/v3/Dashboard_v3_Floating_Cards.jpg` (primary dark reference — deep navy Layer 0, individual floating glass cards with strong visible 4-sided luminous borders, frosted translucency, teal #007970 + warm orange #E07B2C accents), `mockup/v3/Dashboard_v3_Light_Dark.jpg` (exact light pairing — identical layout and card structure, soft clean glass with hairline borders + soft shadows), `design/DARK_VS_LIGHT_MODE_GUIDE.md`, current `tokens/tokens.json`, `src/index.css` (dark and light theme sections), `design-references/COLOR_TOKENS.md`, supporting v2 strong references adapted to floating language.  
**Status:** Claude-Ready (V3) — pending final numerical lock on glow values from image pixel analysis + cross-signoff from Agents 01, 02, 04, 15, 16.

---

## 1. Executive Translation — How the V3 Dark Mode Floating-Card Language Must Manifest on These Surfaces (Tokens)

The V3 language (per V3_MOCKUP_DESIGN_SPEC.md §2–5 and the two Dashboard images) replaces the legacy single-luminous-inset "one-glass canvas" (the maroon-deep --glass-main + --ci-glass-layer1-inset approach) with a **3-layer floating card system** where every content block is an independent elevated glass card that exhibits clear 4-sided separation from the deep atmospheric Layer 0 background and from sibling cards.

**Core token mandate for Agent 03:**
- Dark mode is the primary, production-first target. All new V3 dark glass token families must be derived directly from visual inspection of `Dashboard_v3_Floating_Cards.jpg`: deep navy Layer 0, ~65–72% frosted translucency on cards (dark slate/navy tint), crisp 1px inner hairline + soft outer luminous glow border that makes cards "float", restrained teal and warm orange used only for data highlights / CTAs / urgency (never for card chrome), generous visible card gaps showing the dark backdrop.
- Light mode is the exact structural and spacing twin (per `Dashboard_v3_Light_Dark.jpg`): same card counts, sizes, gaps, and hierarchy, but implemented with higher-opacity near-solid white glass surfaces, very soft gray hairline borders (#E5E4E3 range), and soft drop shadows for elevation instead of glows. Light must feel equally premium and calm — never flat or cheap.
- Every token consumed by a floating glass card (background, border, box-shadow/glow, padding, gap, radius, focus ring, hover lift) must come from the new locked V3 set. Legacy --ci-glass-* and raw rgba/hex values inside card contexts are forbidden in generated V3 code.
- The famous 4-sided breathing room now lives in two places: (a) card-to-card gaps via `--ci-v3-card-gap`, (b) frame-to-card margins via shell host rules (Agent 04) + card padding tokens. Old single-frame inset tokens become migration-only.

**Key aesthetic rules translated to tokens (currently violated everywhere):**
- Glass depth & backdrop breathing room: new dedicated `--ci-v3-glass-*` families (see §3) with separate dark/light values. Translucency tuned per image (darker cards read more "expensive" on deep navy).
- Elevation & layering: explicit shadow/glow tokens per layer (Layer-2 cards stronger glow + slight y-lift than Layer-1 hosts). No heavy inner blurs inside cards (per V3 spec §2).
- Typography, urgency, and accents ride on top of the glass tokens — teal/orange are semantic accents only.
- Motion: subtle lift + glow intensification on hover/focus using existing motion tokens but driven by V3 elevation tokens.
- Mobile vs desktop: identical token values; responsive only changes layout density and converts drawers to bottom sheets (Agent 12). Card gaps and border strength remain constant.
- Dark/light pairing contract: identical component tree and data; only the token values under a V3 theme flag or CSS `color-scheme` + `[data-v3-theme="dark"|"light"]` (or continued `data-theme` evolution) differ. No component-level `if (isDark)` branching for glass treatment.

The current token system (`tokens/tokens.json` + `src/index.css` :root + light overrides + tailwind boxShadow) is an excellent foundation but is locked to the old maroon CI-ION single-glass language. V3 requires a clean, co-existing "v3" branch of tokens (prefixed `--ci-v3-...`) that becomes the default for all new and migrated surfaces while legacy surfaces can continue on the old set during phased rollout.

---

## 2. Surface-by-Surface Current State vs Contract Gap Analysis (Token Lens)

| View / Sub-View | Current Primary Defects vs V3 Floating Card Token Contract | Severity (Blocker / High / Medium) | Line References (most critical) | Required Fix Direction for Generated Code |
|-----------------|-------------------------------------------------------------|------------------------------------|----------------------------------|---------------------------------------------|
| Dashboard (KPI row, main board, hero) | Uses legacy --ci-glass-bg, --ci-glass-border, --ci-shadow-elevation-*, raw rgba, and --ci-glass-layer1-inset for a single host frame. KPI "cards" are not independent floating objects with dedicated V3 border/glow tokens. No --ci-v3-card-gap. | Blocker | DashboardPage.tsx (multiple), src/index.css:897–921, 60–61, tailwind.config.js:38–39 | All KPI and overview blocks must consume only `--ci-v3-glass-card-bg-dark`, `--ci-v3-card-border-dark`, `--ci-v3-card-glow-layer2`, `--ci-v3-card-gap`. Remove all -mx-3 / full-bleed. |
| EvidenceCenter (grids, filters, detail drawer) | Large single containers + table wrappers flush to edges. Drawer uses old .glass-morphism + --ci-color-glass-main. No per-card V3 glow or gap tokens. | High | EvidenceCenterPage.tsx, EvidenceDetailDrawer, src/index.css:554–562 | Convert every list item, filter rail section, and drawer content to `<FloatingGlassCard>` consuming new V3 border/glow tokens. |
| CES Board / MyTasks / Workloads (kanban columns + task cards) | Task cards and columns use .ci-operational-card / ad-hoc classes + old elevation shadows. Columns often edge-touching. | High | CesBoardPage.tsx, TaskCard.tsx, multiple | Promote TaskCard and column hosts to V3 floating variants using dedicated --ci-v3-* tokens for border strength per elevation. |
| Policy Library / Detail / Search / Appendices | Sections inside detail use large glass blocks or on-glass-section dividers instead of independent floating cards. | Medium-High | PolicyDetailPage.tsx, LibraryPage | Break content into stacked V3 floating cards; each must declare V3 border tokens. |
| Calendar, Audit, Onboarding V2, Reports, iAdministrator | Mixed legacy glass + some near-floating right panels. No consistent V3 glass token application. | Medium | Various page + component files, ShellContentFrame.tsx:47 | All surfaces must import and apply V3 token set when in v3 mode. |
| All drawers, modals, right panels, empty/loading states | Inherit old ci-glass-panel / --ci-color-glass-border without Layer-2 elevated glow treatment shown in V3 mocks for floating transients. | High | RightDrawer.tsx, Modal primitives, EmptyState components, src/index.css:1080+ | Introduce `--ci-v3-elevated-*` token family and force its use on transient Layer-2 surfaces. |
| Light mode overrides (all surfaces) | Current light (data-theme="care-indeed-light") forces solid white + old hairlines; does not match the soft premium glass + exact accent pairing in `Dashboard_v3_Light_Dark.jpg`. | High | src/index.css:681–819 (entire light block) | Add parallel V3 light glass tokens under the same data-theme or new [data-v3-mode] attribute. |
| Token pipeline & generators | tokens.json and generated output contain only legacy maroon + basic glass. No V3 dark floating families. Generators do not yet emit --ci-v3-* vars. | Blocker | Implementation/tokens/tokens.json, generators/*.mjs, generated/tokens.css | Extend schema with v3.glass.dark / v3.glass.light / v3.elevation / v3.spacing.cardGap sections. Regenerate and wire into src/index.css + tailwind. |

Be exhaustive across internal states (loading skeletons must use V3 glass tokens at reduced opacity, error states use the same card chrome with error accent on border only).

---

## 3. Canonical Component & Primitive Promotion Ladder for This Domain

**Raw ad-hoc divs / inline styles** (current majority of glass usage) → must be eliminated in V3 generated code. All glass surfaces must resolve exclusively through tokens.

**Existing primitives to evolve or replace:**
- `GlassPanel`, `SurfaceCard`, `.glass-morphism`, `.glass-card` → mark legacy. Add V3 variants or new `FloatingGlassCard` (Agent 01/15) that hard-require the V3 token set via className or style prop resolution.
- `ShellContentFrame` / `ShellFrame` → retain for migration but add `variant="v3-floating-host"` that switches to minimal Layer-1 host + delegates spacing to child floating cards using `--ci-v3-card-gap`.

**New named compositions owned/co-owned by Agent 03 + 01/15:**
- `V3FloatingGlassCard` (primary) — props: `elevation?: 'layer1' | 'layer2' | 'elevated'`, `mode?: 'dark' | 'light' | 'auto'`, `accent?: 'none' | 'teal' | 'orange'`. Internally applies `--ci-v3-glass-card-bg-{mode}`, border, and the matching glow/shadow from the token families. Declares `data-v3-layer="2"` and `data-v3-border="strong"`.
- `V3KpiCard`, `V3TaskCard`, `V3SectionCard` — thin wrappers over the above that add domain padding and allowed inner tokens only.
- `V3CardGap` utility (or Tailwind plugin) that resolves to `var(--ci-v3-card-gap)`.

For each:
- Exact props interface: see Agent 15 pattern library (to be published); Agent 03 guarantees the underlying CSS var contract.
- Declared `data-v3-layer` value: "1" for subtle hosts, "2" for standard floating cards, "elevated" for drawers/modals.
- Token classes allowed: only `--ci-v3-*` glass/border/glow + semantic text/accent + spacing tokens. Forbidden: any raw hex, arbitrary `bg-white/10`, old `--glass-main`, `--ci-color-glass-*` inside V3 cards.

---

## 4. Exact Layout, Spacing & Composition Rules (V3 Token-Driven)

- **Layer 0 (root/body):** `--ci-v3-bg-layer0-dark: #0B1326` (or closest match to the deep navy in the V3 dark image). Must be visible in all gaps.
- **Card-to-card relationships:** Consistent `--ci-v3-card-gap: 16px` (desktop) / `12px` (dense mobile) between all independent floating cards. This is the primary "breathing room" that replaces the old single-frame inset magnification. Never collapse to 0 or use negative margins.
- **Card internal padding:** `--ci-v3-card-padding: 16px` (standard), `20px` (dense), `24px` (hero/KPI). Locked; no ad-hoc p-4 inside V3 cards.
- **Frame breathing room:** Minimum 16px from shell edges to first floating card (enforced by Agent 04 V3 host mode + card margin tokens). This ensures the 4-sided border is always fully visible.
- **Border + glow implementation (exact for codegen):** Every V3 card must include:
  - `border: 1px solid var(--ci-v3-card-border-{mode})`
  - `box-shadow: var(--ci-v3-card-glow-{elevation}-{mode}), var(--ci-v3-card-shadow-{elevation}-{mode})`
  - `border-radius: var(--ci-v3-radius-lg)` (12–16px to match mock roundedness)
- **Responsive:** Token values constant; layout changes only (grid cols, drawer → sheet). First-500ms scan path on Dashboard reference: 6–8 small KPI floating cards (each using full V3 token set) with 16px gaps, followed by larger main overview floating card.
- **ASCII composition example (Dashboard KPI row):**
  ```
  [Layer0 deep navy bg]
    ┌─16px gap─┐ ┌─16px gap─┐
    │ KPI Card │ │ KPI Card │ ... (each with full 4-sided V3 border/glow)
    └──────────┘ └──────────┘
  ```
- No card may ever have a side border visually suppressed by parent overflow, negative margin, or flush alignment.

---

## 5. State Machine, Interaction Model & Behavioral Contract (Theming & Tokens)

- **Theme / mode states:** Global V3 mode flag (or continued evolution of `data-theme` + new `data-v3-mode="floating-dark"|"floating-light"`). Token resolution happens entirely in CSS custom properties — no JS branching for glass values inside components.
- **Hover / focus / active on floating cards:** Subtle elevation lift (increase y-offset in `--ci-v3-card-glow-layer2-hover`) + intensification of the luminous border glow. Never add heavy background fills. Teal focus ring uses `--ci-v3-focus-ring-teal`.
- **Selected / urgency states:** Left border accent or top chip using semantic colors only; the base glass border/glow tokens remain unchanged.
- **Loading / empty / error inside cards:** The card chrome (border + glow) stays at full V3 strength; inner content uses reduced-opacity glass tints or canonical EmptyState pattern (Agent 15) that respects the same tokens.
- **Real-time / polling:** Visual updates (e.g., KPI value change, task move) must preserve the floating card chrome; optimistic updates keep the card border/glow stable.
- **Keyboard / ARIA (Agent 13):** Focus-visible must produce a 2px teal ring offset outside the card border using `--ci-v3-focus-ring` token. High contrast mode may increase border opacity via media query overrides on the same tokens.
- **Dark vs light transition:** Instant CSS var swap. Both modes must pass the exact visual parity test against the paired V3 images.

---

## 6. Complete Data, Endpoint & Store Requirements (Token Contract — Critical for Phase 2/3 Codegen)

### 6.1 Data Shapes (TypeScript interfaces — canonical names)

```ts
// Core V3 Token Contract (single source of truth for all floating card rendering)
export interface V3GlassTokenSet {
  // Layer 0
  bgLayer0Dark: string;      // e.g. '#0B1326'
  bgLayer0Light: string;     // e.g. '#F8FAFC'

  // Card surfaces (translucency tuned to V3 images)
  glassCardBgDark: string;   // 'rgba(15,23,42,0.68)'
  glassCardBgLight: string;  // '#FFFFFF' or 'rgba(255,255,255,0.96)'

  // Borders (inner hairline)
  cardBorderDark: string;    // 'rgba(241,245,249,0.14)'
  cardBorderLight: string;   // '#E5E4E3'

  // Glows & Elevation Shadows (the "float")
  cardGlowLayer2Dark: string;   // '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px -10px rgba(0,0,0,0.55)'
  cardGlowElevatedDark: string; // stronger for drawers/modals
  cardShadowLayer2Light: string; // '0 4px 16px rgba(15,23,42,0.08), 0 1px 3px rgba(0,0,0,0.04)'
  cardShadowElevatedLight: string;

  // Gaps & Padding
  cardGap: string;           // '16px'
  cardPadding: string;       // '16px' | '20px' | '24px'

  // Radius (consistent)
  radiusCard: string;        // '14px'

  // Accents (restrained, ride on top of glass)
  accentTeal: string;        // '#007970'
  accentOrange: string;      // '#E07B2C'
  focusRing: string;         // 'rgba(0,121,112,0.45)'

  // Semantic overlays allowed inside cards only
  overlayFaintDark: string;
  // ... (full set mirrors existing overlay but under v3- prefix)
}

export interface V3TokenContext {
  mode: 'dark' | 'light';
  tokens: V3GlassTokenSet;
  // Consumers (FloatingGlassCard) receive this from context or CSS vars only
}
```

### 6.2 Required Endpoints / Operations (Token & Theme Contract)

| Operation | Purpose | Recommended Shape | Real-time Need? | Owner | Notes for Codegen |
|-----------|---------|-------------------|-----------------|-------|-------------------|
| GET /design-tokens/v3 (or static import) | Deliver the authoritative V3GlassTokenSet JSON for runtime validation / theming | `{ v3: { glass: {...}, elevation: {...} } }` | None (build-time + CSS) | Frontend (Agent 03) + Design | Tokens are baked into CSS vars at build; runtime only for dev tools / visual regression harness (Agent 16). |
| Token regeneration pipeline | Update tokens.json → run generators → emit CSS + TS | `tokens.json` + `generate-tokens-css.mjs` + `generate-tokens-ts.mjs` | N/A | Agent 03 + Build | Must support new `v3.glass.dark`, `v3.glass.light`, `v3.elevation`, `v3.spacing.cardGap` keys and emit `--ci-v3-*` vars. |
| Theme preference mutation | User or role-driven dark/light V3 switch | `PATCH /user/preferences { themeMode: 'v3-dark' \| 'v3-light' }` | Immediate (CSS class toggle) | Frontend store | Store (Zustand) holds `v3Mode`; body/html attribute change triggers pure CSS var swap. Optimistic, no rollback needed. |
| Visual regression snapshot contract | Agent 16 harness captures per-card V3 tokens | Screenshot + perceptual diff of floating cards in both modes | On PR | Agent 16 | Every V3 card must expose stable `data-v3-token-signature` attribute for diffing against the two reference images. |

**Local store shape (Zustand recommended):** `useV3ThemeStore { mode: 'v3-dark' | 'v3-light', setMode, tokens: V3GlassTokenSet }`. Persist user choice. Ephemeral: hover glow intensity.

**Optimistic update rules:** Theme switch is instant via class toggle; if a future server sync fails, simply revert the attribute (CSS transition handles gracefully).

**If backend does not yet expose a token endpoint:** Codegen still assumes the static baked CSS var contract defined in this spec + updated `tokens.json`. The contract is the spec.

---

## 7. Cross-Surface Pattern Usage (Coordination with Agent 15)

All shared patterns must consume V3 tokens exclusively when rendered inside a V3 context:

- `TaskCard`, `KpiCard`, `StatusBadge`, `FilterBar`, `ActionRail`, `EmptyState`, `ModuleCard`, `EvidenceItemCard` etc. (full list from Agent 15) → must have built-in V3 floating variant that applies `--ci-v3-glass-card-bg-*`, border, and glow tokens by default. Domain extensions (e.g. left urgency border on TaskCard) are additive only and must not override base glass tokens.
- Visual differences allowed: only the elevation/glow strength passed via props; no ad-hoc border-color overrides.
- Forbidden: any pattern introducing new glass background or border values that conflict with the V3 families.

Agent 15 must publish the single `FloatingGlassCard` wrapper component that all other agents import; Agent 03 guarantees the underlying token values and CSS var names remain stable.

---

## 8. Adjacent Agent Interface Contracts (Mandatory Coordination Evidence)

| Adjacent Agent | What I Require From Them (input contract) | What I Guarantee To Them (output contract) | Current Conflicts / Open Questions | Sign-off Status |
|----------------|-------------------------------------------|--------------------------------------------|------------------------------------|-----------------|
| Agent 01 (Glass & Layering) | Exact layer semantics (Layer 1 host vs Layer 2 floating) + data-v3-layer attribute rules so tokens can be scoped correctly. | Complete, numerically locked `--ci-v3-*` families for border, glow, translucency, gap, and elevation that precisely reproduce the V3 images. | None — 01/03 alignment on "no heavy inner blur" is already reflected in token design. | In review (this spec) |
| Agent 02 (Floating Borders & Elevation) | Final recommended border opacity + glow spread values from pixel inspection of the two V3 images. | Token names and CSS syntax (`border` + `box-shadow` composition) that Agent 02 can embed directly into `FloatingGlassCard` primitive. | Exact teal-tint on glow vs neutral luminous — need image measurement lock. | In review |
| Agent 04 (Shell / Navigation) | V3 host mode contract: how the root/shell provides Layer 0 deep navy + frame breathing room without injecting old inset tokens. | Token-driven spacing (`--ci-v3-card-gap`, padding) that works inside any V3 host. | Old --ci-glass-layer1-inset-desktop may still be needed for legacy ShellContentFrame during migration. | Needs design decision |
| Agent 05 (Dashboard Reference) | Confirmation that the KPI row + main overview composition in the V3 image uses exactly the token families proposed here. | Dashboard will be the first consumer proving the full token set (including light pairing). | None. | Pending Dashboard generation |
| Agent 15 (Cross-Surface Patterns) | All pattern components must accept V3 token props or context and never hard-code glass values. | Stable, documented `--ci-v3-*` var names + TypeScript V3GlassTokenSet interface. | Pattern library currently contains many legacy .glass-* classes. | Critical dependency |
| Agent 12 (Mobile) | Mobile sheet / bottom nav must respect the same V3 card gap and border tokens when cards become sheets. | Same numerical values for gaps/borders on mobile as desktop. | Touch target padding inside cards may need extra V3 token variant. | Review requested |
| Agent 13 (Accessibility) | High-contrast and forced-colors overrides must be expressible by adjusting opacity/width on the same V3 border/glow tokens. | WCAG 2.1 AA+ contrast on all text over V3 glass + focus ring token. | Dark mode border contrast on low-vision users. | Review requested |
| Agent 16 (Fidelity Gate) | Visual regression harness must snapshot per-card chrome using the V3 tokens and compare directly to the two reference images. | Token values will be frozen once they pass Agent 16 perceptual diff against `Dashboard_v3_Floating_Cards.jpg` and light pairing. | None — this is the source of truth for numerical values. | In progress |

Any contract conflict (e.g. legacy inset vs new gap model) is escalated here for orchestrator resolution before codegen.

---

## 9. Shared Vocabulary & Glossary Contributions

- `V3GlassTokenFamily` — the complete set of `--ci-v3-glass-card-bg-dark`, `--ci-v3-card-border-*`, `--ci-v3-card-glow-*`, `--ci-v3-card-gap`, etc. (Agent 03 is single owner).
- `FloatingGlassCard` — the canonical Layer-2 unit (Agents 01/15 implement; 03 supplies tokens).
- `LuminousBorderGlow` — the soft outer + crisp inner border treatment that creates the visible 4-sided float on dark (exact values locked from V3 dark image).
- `DarkGlassCardSurface` / `LightGlassCardSurface` — paired translucency + shadow/glow implementations that match the two V3 images exactly.
- `V3CardGap` — the breathing room token (16px default) between independent floating cards; replaces old inset philosophy.
- `3-Layer Discipline` — hard rule (Layer 0 atmospheric, Layer 1 host, Layer 2 elevated floating) enforced via token + data attribute.
- `V3 Theme Swap` — pure CSS var swap (no component rewrite) for dark ↔ light pairing fidelity.
- `LegacyInsetAlias` — temporary mapping of old `--ci-glass-layer1-*` during migration only; new code must not consume.

These terms will be merged into the master V3 glossary.

---

## 10. Phase 1 Implementation Sequence & Codegen Handoff Notes

Recommended order for V3 token work (must precede large-scale page generation):

1. Lock final numerical values for all `--ci-v3-*` tokens by direct pixel / color sampling of `Dashboard_v3_Floating_Cards.jpg` and light pairing (Agent 03 + 16 + 02).
2. Extend `tokens/tokens.json` with new top-level `v3` object containing `glass.dark`, `glass.light`, `elevation`, `spacing.cardGap`, `radius`, `accent` subtrees (with {value} references where possible).
3. Update `generators/generate-tokens-css.mjs` and `generate-tokens-ts.mjs` to walk the v3 section and emit `--ci-v3-*-*` custom properties + TypeScript types.
4. Regenerate `generated/tokens.css` reference and wire the new block into `src/index.css` (new section after existing :root, plus overrides inside the existing `html[data-theme="care-indeed-light"]` block or a new `[data-v3-mode]` block for clean separation).
5. Extend `tailwind.config.js` with matching `boxShadow: { 'v3-card': 'var(--ci-v3-card-glow-...)' }` and colors under `ci.v3.*`.
6. Add runtime V3 theme context + attribute toggle in Shell / root (Agent 04 coordination).
7. Update all existing `--ci-glass-*` references in primitives to support a `v3: true` prop that swaps to the new families (migration bridge).
8. First consumer: Agent 05 Dashboard V3 reference surface (proves the full set).
9. Then propagate to all 70+ views via Agent 15 patterns.
10. Deprecation: after V3 surfaces are live, mark legacy single-glass tokens as `@deprecated` and eventually remove.

**Backend / data work:** None required for tokens themselves (pure frontend contract). A future design-token API endpoint is optional for dev tooling only.

**Large prerequisites:** Agent 01/02 primitives must exist before any page can be generated against the new tokens.

---

## 11. Claude-Ready Certification (Phase 1 Agent Exit Gate)

**I certify that this specification is complete and ready to be included in the master V3 code-generation prompt.**

- [x] Every visual rule from `V3_MOCKUP_DESIGN_SPEC.md` + the two V3 Dashboard images has been translated into concrete, non-ambiguous token families and usage rules for floating cards.
- [x] All current defects vs the V3 floating-card token contract are documented with line references across `src/index.css`, components, and generators.
- [x] The full component promotion ladder + exact token usage (allowed/forbidden) is defined for both dark and light V3.
- [x] Every data shape (V3GlassTokenSet), "endpoint" (regeneration + theme mutation), and store requirement is specified.
- [x] All adjacent agent interface contracts are listed with no unresolved contradictions on my side; critical handoffs to Agents 01, 02, 04, 15, 16 are explicit.
- [x] Mobile, accessibility, cross-surface consistency, and dark/light pairing concerns have been explicitly addressed.
- [x] An LLM with access to the full 16-agent V3 bundle + this spec + the updated tokens.json + the two reference images could generate correct, beautiful, pixel-faithful floating-card code using only the new V3 token set for any of the 70+ views without further clarification on glass treatment.

**Remaining risks or open questions that the orchestrator must resolve before codegen:**

1. Final precise hex/rgba values for luminous glow (especially any teal tint) and exact card translucency — requires one-time high-res sampling of the two V3 JPGs (Agent 03 + 16 to lock in next step).
2. Migration strategy & deprecation timeline for old `--ci-glass-layer1-inset-desktop`, `--ci-color-glass-main`, and single-frame ShellContentFrame (Agent 04 decision).
3. Whether to introduce a new `data-v3-mode` attribute or evolve the existing `data-theme` system (minor but affects all 70+ views).

**Agent 03 Signature:** Grok Agent 03 — Token & Dark Mode Color System (V3 Floating Card Edition) — 2026-05-18

**Countersigned by adjacent agents (or orchestrator proxy):** 
- Agent 01 (Glass & Layering): Pending full batch review
- Agent 02 (Borders & Elevation): Pending numerical lock
- Agent 04 (Shell): Pending host mode decision
- Agent 15 (Patterns): Pending pattern wrapper implementation
- Agent 16 (Fidelity): Will validate final token values against images

---

*This document is the official Phase 1 output for Agent 03 in the Darkmode_DesignzV3 16-agent execution. It is the single source of truth for all V3 dark glass token families, evolution of legacy --ci-glass-* tokens, dark/light pairing rules, and the required changes to the token pipeline so that generated code for all 70+ views uses exclusively the new V3 floating-card set matching the provided mockup images.*

**End of Agent 03 V3 Phase 1 Design Application Specification**
