# Token & Primitive Constraint Catalog (Phase 1 Scope)

**Phase 1 deliverable — constraint only.**
**Derived from:** Canonical UI System Spec §6 (Typography), §7 (Spacing), §8 (Color/Mode/Glass), §10 (Primitives).
**Supporting design doc:** [`../Phase0/TOKENS_PIPELINE_DESIGN.md`](../Phase0/TOKENS_PIPELINE_DESIGN.md).

> Phase 1 does **not** introduce new tokens or primitives. It locks usage rules around the existing canonical set so that Phase 2 surface work cannot drift.

---

## 1. Mandatory Token Categories (Phase 1)

The following token categories are **required** to be sourced from the canonical pipeline. Raw values in their place are prohibited under `src/policy/**`.

| Category | Canonical source | Examples (illustrative) | Raw-value prohibition |
|----------|------------------|--------------------------|-----------------------|
| **Color — brand** | `color.brand.*` | Clinical Teal, Primary Orange, Care Indeed Navy | No hex literals (`#RRGGBB`) in `.ts/.tsx/.css` under `src/policy/**`. |
| **Color — surface** | `color.surface.{0,1,2,3}` | Layer backdrops + glass tints | No `bg-white` / `bg-black` / arbitrary `bg-[#...]`. |
| **Color — text** | `color.text.{primary,secondary,muted,inverse}` | — | No raw `text-[#...]`. |
| **Color — state** | `color.state.{success,warning,danger,info}` | — | No locally redefined status hues. |
| **Spacing** | `spacing.{1..12}` (4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 …) | — | No arbitrary Tailwind values (`p-[13px]`, `gap-[7px]`). |
| **Radius** | `radius.{sm,md,lg,xl,2xl}` | — | No `rounded-[5px]`. |
| **Blur** | `blur.{glass-1,glass-2}` | — | No `backdrop-blur-[7px]`. |
| **Shadow** | `shadow.{glass-edge,glass-inner,glass-elevated,focus-ring}` | — | No inline `boxShadow`. |
| **Motion** | `motion.{reduced,default}` durations + easings | — | No raw `transition-duration` / `cubic-bezier(...)`. |
| **Typography** | Type scale tokens (`text-title`, `text-body`, `text-label`, …) | Montserrat / Inter / JetBrains Mono | No ad-hoc `text-[17px]` or per-route font sizes. |

> **Rule TP-1.** Every value in the categories above **MUST** be referenced by token (CSS variable or Tailwind theme key). Phase 1 turns this on as ESLint **warn** to seed the allow-list, and Phase 2 promotes to **error**.

> **Rule TP-2.** Token consumers **MUST NOT** read from `tokens.json` at runtime. The pipeline emits CSS variables + Tailwind theme + a TypeScript const map; consumers use those.

---

## 2. Mandatory Primitives (Phase 1)

The following primitives are the **only sanctioned path** to their respective surfaces. Building local equivalents is prohibited.

| Surface type | Required primitive | Location | Layer |
|--------------|--------------------|----------|-------|
| Page shell frame | `ShellFrame` | `src/policy/components/ui/` | — |
| Page inset frame | `ShellContentFrame` | `src/policy/components/ui/` | host of Layer 1 |
| Page internal frame | `ConstrainedPageContent` (new in Phase 1) | `src/policy/components/ui/` | host of Layer 1 |
| Primary glass canvas | `GlassPanel` | `src/policy/components/ui/` | Layer 1 |
| Card / panel / drawer / sheet content frame | `SurfaceCard` | `src/policy/components/ui/` | Layer 2 |
| Section / group header | `SectionHeader` | `src/policy/components/ui/` | content of L1/L2 |
| Primary / secondary / tertiary action | `ActionButton` | `src/policy/components/ui/` | content of L1/L2 |
| Empty state | `EmptyState` | `src/policy/components/ui/` | content of L1/L2 |
| Loading state | `LoadingState` (skeleton) | `src/policy/components/ui/` | content of L1/L2 |
| Tabular data | `DataGrid` | `src/policy/components/ui/` | content of L1 |
| Status indicator | canonical `Badge` | `src/policy/components/ui/` | content |

> **Rule TP-3.** New imports of legacy equivalents (`CesCard`, `SCard`, `GenericSectionPanel`, `PmTaskCard`, legacy `StatusBadge`, `iAdministrator/*`) are **prohibited** in any file outside their own folder. Existing usages are seeded into a lint allow-list to make every *new* addition explicit (see [`../Phase0/ENFORCEMENT_DESIGN.md`](../Phase0/ENFORCEMENT_DESIGN.md)).

> **Rule TP-4.** Local one-off components in page folders are prohibited for the surface types above. If a missing primitive is discovered, the response is to propose a new primitive — never to invent a local equivalent.

> **Rule TP-5.** Primitives **MUST NOT** be reached via deep imports (`from 'src/policy/components/ui/internal/...'`). Only barrel re-exports from `components/ui/index.ts` are sanctioned.

---

## 3. Color Constraints

> **Rule TP-6.** Semantic role drives color selection. The mapping is fixed:

| Intent | Token role | Example contexts |
|--------|------------|------------------|
| Brand action / primary success | `color.brand.teal` | Primary buttons, positive trend, completed |
| Critical / call-out / urgent | `color.brand.orange` | Urgent flags, attention badges |
| Background depth | `color.surface.0` | Layer 0 backdrop |
| Primary glass tint | `color.surface.1` | Layer 1 |
| Elevated card tint | `color.surface.2` | Layer 2 |
| Body text | `color.text.primary` | All running text |
| Supporting text | `color.text.secondary` | Captions, metadata |
| Disabled / muted | `color.text.muted` | Disabled controls, helper text |

> **Rule TP-7.** Status colors (`success`, `warning`, `danger`, `info`) **MUST NOT** be repurposed for branding. Orange-as-brand and orange-as-warning use the same hue family but distinct tokens; consumers select by intent.

> **Rule TP-8.** All (foreground, background) pairs used by canonical primitives **MUST** clear WCAG 2.2 AA (≥ 4.5:1 for body text, ≥ 3:1 for large text and non-text UI). The contrast-pair generator in the tokens pipeline fails the build on violations; no per-surface waivers.

---

## 4. Spacing & Density Constraints

> **Rule TP-9.** Spacing on all canonical primitives **MUST** come from the canonical scale: `4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64` (and the responsive multipliers in `spacing.*`). Arbitrary Tailwind values (`p-[13px]`) and inline `padding`/`margin` styles are prohibited.

> **Rule TP-10.** Density profile is selected by **surface type**, not by feel:

| Surface type | Profile | Notes |
|--------------|---------|-------|
| Command / dashboard | Comfortable (24–32 px paddings, 16–24 px gaps) | See `01_Dashboard_Desktop_v2.jpg`. |
| List / table / board | Compact (12–16 px paddings, 8–12 px gaps) | See `04_CESBoard_Desktop_v2.jpg`. |
| Detail / form | Balanced (24 px paddings, 16 px stack gaps, 44 px tap targets) | See `03_PolicyDetail_Desktop_v2.jpg`. |
| Mobile any | Min 44 px hit targets; 16 px page x-inset | See `01_Dashboard_Mobile_v2.jpg`. |

> **Rule TP-11.** Legacy density classes (`ci-premium-*`, `ci-executive-*`, `wave-*`) are retired and **MUST NOT** be used.

---

## 5. Typography Constraints

> **Rule TP-12.** Font families are locked: Montserrat (display/title), Inter (body/UI/label), JetBrains Mono (technical/code). No additional families may be loaded into `src/policy/**`.

> **Rule TP-13.** Type scale is locked. Pages **MUST** consume scale tokens (`text-display`, `text-title`, `text-subtitle`, `text-body`, `text-label`, `text-caption`, `text-mono`). Inline `text-[17px]`, `text-xl`, per-page font-size ladders are prohibited.

> **Rule TP-14.** Line-height, letter-spacing, and weight are part of each scale token and **MUST NOT** be locally overridden.

> **Rule TP-15.** Micro-text below 12 px is prohibited inside any Layer 1 or Layer 2 glass surface — blur softens edges and below 12 px the result fails the "calm authority" contract and frequently fails AA. Use `text-caption` (≥ 12 px) or `text-label` (≥ 13 px) instead.

---

## 6. Elevation Constraints

> **Rule TP-16.** Elevation is **layer-driven**, not surface-driven. A `SurfaceCard` does not "pick" its shadow; it inherits the Layer-2 shadow token. Custom shadow overrides are prohibited (see GL-5).

> **Rule TP-17.** Apparent elevation **MUST** be achieved by token combination (blur + edge + shadow), never by translateZ, parallax, or scale on default state.

---

## 7. Anti-Pattern Catalog (Tokens & Primitives)

| ID | Anti-pattern | Replacement |
|----|--------------|-------------|
| TP-A1 | Hex literal in className or CSS | Brand/surface/state/text token. |
| TP-A2 | `bg-white` on a page container | `GlassPanel` (Layer 1) via primitive. |
| TP-A3 | `text-[17px]` / `text-xl` | Scale token (`text-title`, `text-body`, …). |
| TP-A4 | Custom card component in a page folder | `SurfaceCard`. |
| TP-A5 | Importing `CesCard`, `SCard`, `PmTaskCard` in a non-owning folder | `SurfaceCard`. |
| TP-A6 | `backdrop-blur-[7px]` | `blur.glass-{1,2}` token via primitive. |
| TP-A7 | Inline `style={{ boxShadow: '...' }}` | Layer shadow token (no override). |
| TP-A8 | `ci-premium-*`, `glass-interactive-lib`, `glass-panel-lib` | Canonical primitive + tokens. |
| TP-A9 | Loading spinner replacing the surface | `LoadingState` skeleton inside the surface. |
| TP-A10 | Local "tiny" badge (`<span className="bg-orange-500 text-[10px]">`) | Canonical `Badge` with `text-caption` minimum. |

---

## 8. Verification Checklist (Design Review)

- [ ] No raw color, spacing, radius, blur, shadow, or motion values in modified files (lint clean).
- [ ] All surfaces use canonical primitives; no local card/panel/badge components introduced.
- [ ] No deep imports into `components/ui/internal/*`.
- [ ] Density profile matches surface type per §4.
- [ ] Typography uses scale tokens only; no micro-text under 12 px on glass.
- [ ] WCAG AA pair check passes (build does not fail).
- [ ] Legacy class strings (`ci-premium-*`, `glass-*-lib`) absent from modified files.

---

## 9. Out of Scope for Phase 1

- Introducing new primitives. `[OUT-OF-SCOPE-P1 → propose via Canonical Spec amendment]`
- Rewriting existing pages to consume tokens (that is Phase 2 surface work). Phase 1 only ratchets the rules. `[OUT-OF-SCOPE-P1 → Phase 2]`
- Codemod execution on the 7,749 raw-value baseline; codemod is a Phase 1 tool deliverable but **runs** in Phase 2. `[OUT-OF-SCOPE-P1 → Phase 2]`
