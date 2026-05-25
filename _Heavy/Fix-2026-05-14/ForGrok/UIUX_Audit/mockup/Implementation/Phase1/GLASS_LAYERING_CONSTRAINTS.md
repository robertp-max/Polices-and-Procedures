# Glass Layering & Elevation Constraint Rules

**Phase 1 deliverable — constraint only.**
**Derived from:** Canonical UI System Spec §3 (Canonical Layer Model).
**Visual source of truth:** `01_Dashboard_Desktop_v2.jpg`, `03_PolicyDetail_Desktop_v2.jpg`, `02_EvidenceCenter_Desktop_v2.jpg`, `01_Dashboard_Mobile_v2.jpg`.

---

## 1. The Strict 3-Layer Model

> **Rule GL-1.** Every visible surface element **MUST** be assignable to exactly one of Layers 0, 1, 2, or (by exception) 3. Surfaces that cannot be classified are prohibited.

| Layer | Role | Visual treatment | DOM marker |
|-------|------|------------------|------------|
| **0 — Atmospheric Backdrop** | Deepest context. Provides the visible band that frames glass. | `TravelightBG` (dark) or paper gutter (light). No interactive content. | implicit (the shell's background) |
| **1 — Main Glass Surface** | The primary working canvas of a page or section group. | Single translucent glass with backdrop blur, luminous 1-px edge, soft inner shadow. | `data-glass-layer="1"` |
| **2 — Elevated Actionable Surface** | Cards, panels, drawers, sheets, modal content frames. | Stronger opacity, defined shadow, brighter edge. | `data-glass-layer="2"` |
| **3 — Exception** | Critical functional necessity only (e.g., focused modal scrim host). | Maximum elevation; requires logged exception. | `data-glass-layer="3"` |

> **Rule GL-2.** Layers **MUST NOT** be skipped. A Layer 2 surface may not be placed directly on Layer 0; it must be the child of a Layer 1 surface (see §3).

> **Rule GL-3.** A surface's layer is declared by the primitive it uses, not by ad-hoc class names. `GlassPanel` → Layer 1. `SurfaceCard` → Layer 2. There is no other path to a glass surface.

---

## 2. What May Live Inside Layer 1

Layer 1 (`GlassPanel`) **MAY** contain:

- One or more Layer 2 surfaces (`SurfaceCard`, `DataGrid` rows, focused sub-panels).
- Typography, icons, tokens-styled charts, form fields.
- A single section header per logical group (`SectionHeader` primitive).

Layer 1 **MUST NOT** contain:

| ID | Prohibition | Rationale |
|----|-------------|-----------|
| GL-A1 | Another Layer 1 surface | Nested Layer 1 destroys the single-glass illusion. |
| GL-A2 | A decorative `backdrop-blur-*` element that is not a sanctioned Layer 2 primitive | Inner blur over already-blurred glass creates a muddy fog and kills depth. |
| GL-A3 | An opaque container (`bg-*` solid) covering > 60% of the Layer 1 area | Eclipses the glass; visually equivalent to a flat slab. |
| GL-A4 | Independent shadow tokens (custom `shadow-*`) on direct children | Children inherit elevation by being Layer 2; competing shadows fight the system. |
| GL-A5 | A `ci-premium-*` decorative wrapper | Legacy dialect; explicitly retired. |

---

## 3. What May Live Inside Layer 2

Layer 2 (`SurfaceCard` and equivalents) **MAY** contain:

- Atomic content: text, icons, badges, inputs, buttons, charts.
- Tightly nested Layer 2 fragments only if they are *non-glass* (e.g., a plain divided list inside a card). They **MUST NOT** add another blur stack.
- One primary action and at most two secondary actions per card.

Layer 2 **MUST NOT** contain:

| ID | Prohibition |
|----|-------------|
| GL-A6 | A nested `GlassPanel` (Layer 1 inside Layer 2 — inversion). |
| GL-A7 | A nested `SurfaceCard` with its own blur (Layer 2 inside Layer 2 stacking blur). One blur level per stack. |
| GL-A8 | A bottom-sheet, drawer, or modal mount point. Those mount at the shell root, not inside a card. |

---

## 4. Edge, Shadow, and Corner Rules

> **Rule GL-4.** Glass edge highlights are part of the perceptual contract. Removing or recolouring them per-surface is prohibited.

| Property | Layer 1 | Layer 2 |
|----------|---------|---------|
| Border (inner edge highlight) | `1px` luminous, token `--glass-edge-1` | `1px` defined, token `--glass-edge-2` |
| Corner radius | `--radius-xl` (`1rem`) desktop, `--radius-lg` (`0.75rem`) mobile | `--radius-lg` desktop, `--radius-md` mobile |
| Outer shadow | `--shadow-glass-edge` (soft, low spread) | `--shadow-glass-elevated` |
| Inner shadow | `--shadow-glass-inner` (subtle top-edge sheen) | none |
| Backdrop blur | `--blur-glass-1` | `--blur-glass-2` (or `none` if nested in already-blurred Layer 1, per GL-A7) |

> **Rule GL-5.** Blur, edge, and shadow tokens are non-overridable. PRs that introduce inline `backdropFilter`, `boxShadow`, or `border` styles on canonical primitives are rejected.

---

## 5. Interaction States on Glass

> **Rule GL-6.** Every interactive glass element **MUST** define all six states using tokens: `default | hover | focus-visible | active | disabled | loading`. Missing states are a Phase 1 reject.

| State | Required treatment |
|-------|-------------------|
| `default` | As Section §4 above. |
| `hover` | Token `--glass-hover-tint` overlay (≤ 6 % luminance shift). No new shadow on hover. |
| `focus-visible` | **`--focus-ring`** = `2px solid var(--color-focus)` with `2px` offset. Ring **MUST** sit *outside* the blur stack so it remains crisp. |
| `active` | Token `--glass-active-tint` (slightly darker than hover). Translate Y `0` (no movement; movement is reserved for motion-on layouts only). |
| `disabled` | Opacity `0.6`, blur unchanged, all events blocked. |
| `loading` | Skeleton lives **inside** the existing glass surface; never replaces it with a different one. |

> **Rule GL-7.** Focus rings on glass **MUST** be rendered with sufficient contrast against both the Layer 0 backdrop and the glass surface itself (≥ 3:1 against each). The shared token `--color-focus` is calibrated for this; replacement values are prohibited.

> **Rule GL-8.** Hover affordances **MUST NOT** rely solely on translucency change. A visible state cue (icon, label, edge brightening) is required so the state is detectable on hover-incapable devices.

---

## 6. Light vs Dark Mode (Layer behaviour)

> **Rule GL-9.** Per the Canonical Spec §8, Light mode = paper aesthetic, Dark mode = full glass aesthetic. The **layer model is identical**; only the token values differ.

- Light mode Layer 1: solid surface with subtle shadow + hairline edge. No heavy blur.
- Dark mode Layer 1: full translucent glass with backdrop blur as defined in §4.
- Pages **MUST NOT** branch behaviour per mode beyond swapping tokens. Conditional rendering of different DOM trees per mode is prohibited.

Reference mocks for light-mode behavior are present in the Top Picks set (light-paper iPhone shots) and **MUST** be matched by visual regression in both modes.

---

## 7. Sanctioned Layer 3 Use (Closed List)

| Use case | Rationale |
|----------|-----------|
| Active modal/dialog content frame | Required for focus capture and z-index isolation. |
| Active bottom-sheet content frame on mobile | Same as above. |
| Toast/snackbar surface | Transient; must auto-dismiss. |
| Tooltip / popover | Transient; must dismiss on outside click and `Escape`. |

> **Rule GL-10.** Any other Layer 3 claim **MUST** be logged in the Exception Registry with sunset date. There are no permanent Layer 3 surfaces outside this list.

---

## 8. Verification Checklist (Design Review)

A page passes the Layering review if all of the following are true:

- [ ] Every visible surface carries a `data-glass-layer` value (1, 2, or 3); none are unclassified.
- [ ] No Layer 1 appears inside a Layer 1 or Layer 2.
- [ ] No Layer 2 stacks its own blur on top of an already-blurred Layer 1.
- [ ] No inline `backdropFilter`, `boxShadow`, or `border` on canonical primitives.
- [ ] All six interaction states defined and visually verified on every interactive glass element.
- [ ] Focus ring is crisp against both Layer 0 and Layer 1 (visual + axe check).
- [ ] No `ci-premium-*`, `glass-*-lib`, or other legacy decorative wrappers under the page root.
- [ ] Light-mode and dark-mode pass the same layer assertions; no per-mode DOM branching.

---

## 9. Out of Scope for Phase 1

- New primitives beyond the canonical set named in §10 of the Canonical Spec. `[OUT-OF-SCOPE-P1]`
- Adjusting the visual density of any specific surface to match a mock. `[OUT-OF-SCOPE-P1 → Phase 2]`
