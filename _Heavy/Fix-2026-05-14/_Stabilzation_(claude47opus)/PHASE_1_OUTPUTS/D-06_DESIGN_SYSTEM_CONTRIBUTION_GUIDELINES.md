# Design System Contribution Guidelines

**Task ID:** D-06 (Stabilization-unique)
**Audience:** All engineers contributing UI changes to the Care Indeed app.
**Authority:** This document codifies the rules already binding via:
- `UNIFIED_MVP_QA_UIUX_IMPLEMENTATION_PLAN.md` Lead 13 (design tokens) and Lead 16 (binding arbitration §C1–C5)
- `scripts/verifyUiDesignSystem.ts` (machine-checked invariants)
- `.github/PULL_REQUEST_TEMPLATE.md` Design System Compliance section

This document does not invent new rules. It is the single human-readable
reference so contributors know **what** to do and **where** the binding source
lives.

**Status:** Ready for Phase 1 close-out
**Date:** 2026-05-16

---

## 1. Two Operational Brands, Strict Separation

| Brand | Where it applies | Primary tokens |
|---|---|---|
| **Care Indeed (light) / CI-ION (dark)** — the canonical app | Everywhere except the eCign signing surface | Teal `#007970` primary, orange `#C74601` CTA, `--ci-*` tokens |
| **eCign** (signing product) | `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `src/policy/ecign/*` | Navy `#1A3778`, orange `#F04B22` — eCign brand only |

**Rule:** eCign navy/orange MUST NOT appear outside the eCign surfaces above.
Care Indeed teal/orange MUST NOT bleed into the eCign signing canvas.
Reference: MVP §C3 (binding arbitration).

---

## 2. Color Tokens — The Only Source of Truth

| Token | Use | Notes |
|---|---|---|
| `var(--ci-bg)` | Page background | Never `#000`, never `bg-black` |
| `var(--ci-surface)` | Card / panel surface | Never raw `#FFFFFF` outside print/PDF builders |
| `var(--ci-text-primary)` | Body text | |
| `var(--ci-link)` | Inline link color | Owned by `EntityLink.tsx`; do not override |
| `var(--ci-cta)` | Primary CTAs | Renders to `#C74601` per MVP §C2 |
| `var(--ci-glass-bg)` | Glass-surface background | Use through `GlassPanel`, do not assemble manually |
| `var(--radius-*)`, `var(--space-*)` | Sizing | Replace `rounded-[14px]`, ad-hoc spacing |

### Forbidden in `className` / inline `style`

- Hex literals (`#ffffff`, `#1F1C1B`, etc.) — `verify:ui` rule `tokens.hex-literal` flags these
- `rgb()` / `rgba()` literals — `verify:ui` rule `tokens.rgb-literal` flags these
- `text-black` + `bg-black` together
- `bg-slate-{900,800,400}` in PM right-panel surfaces — use `<GlassPanel>`
- `text-cyan-300` / `text-cyan-700` outside `EntityLink.tsx`

**Promotion path:** the hex/rgb scan is currently WARN. It promotes to FAIL after the MVP Wave 0 design-token cleanup pass lands and the warning count is zero.

### Permitted exceptions

| Surface | Why exempt |
|---|---|
| `FormSigningWorkspace.tsx`, `FormSignatureContext.tsx`, `FormViewer.tsx`, `src/policy/ecign/*` | eCign brand owns its own navy/orange palette |
| `src/policy/pages/.*Print.*\.tsx`, `FormPrintView.tsx`, `PrintPage.tsx`, `src/policy/print/*` | Print/PDF vector output requires exact colour values |
| `src/policy/data/*.generated.*`, `src/policy/autogen/*` | Generated content; modify the generator instead |
| `scripts/*`, `server/*` | Not user-facing UI |

These exemptions are encoded in `scripts/verifyUiDesignSystem.ts` constant `HEX_SCAN_EXEMPT`. Do not extend the list without Architecture review.

---

## 3. Glass Layers — Max 3, Layer 3 Portal-Only

**Binding rule (MVP §C1):** A maximum of three glass layers may exist at any one time. Layer 3 is reserved exclusively for elevated portal modals. No glass-on-glass-on-glass on operational pages.

How layers are counted:

| Layer | Where |
|---|---|
| Layer 0 | Page background (`TravelightBG`) — not glass |
| Layer 1 | Shell card (`CommandCenterLayout` outer canvas) |
| Layer 2 | One inner glass panel (e.g. `<GlassPanel>` wrapping a section) |
| Layer 3 | **Portal-only** — elevated modal / dialog rendered through React portal |

`verify:ui` rule `glass.stack-budget` warns when a single file accumulates more than 3 inline `backdropFilter` declarations + Tailwind `backdrop-blur-*` class hits combined. If you hit this, audit nested glass surfaces — collapse to a single inner layer.

**Anti-patterns:**

- Stacking `backdrop-blur` on a card that already lives inside `<GlassPanel>`
- Wrapping a `<GlassPanel>` inside another `<GlassPanel>`
- Adding a third inline `backdropFilter` on a non-modal surface

---

## 4. Component Primitives — Use, Don't Re-create

Canonical primitives live in `src/policy/components/ui/`. Use them. Do not create parallel families.

| Use | Don't use |
|---|---|
| `<GlassPanel>` | Local divs with hand-assembled `backdrop-filter` + border + shadow |
| `<SurfaceCard>` | Local "Card" wrappers with bespoke padding + radius |
| `<Tabs>` | Local `TabButton` components |
| `<ActionButton>` | Local `<button>` with hand-styled CTA orange |
| `<CiStatusBadge>` | Local pill badges with hardcoded hex |
| `<DataGrid>` | Local table layouts |
| `<EmptyState>` | Local "no data" placeholders |
| `<EntityLink>` (link colour owned by primitive) | `text-cyan-*` overrides |
| `<ThemeModeToggle>` | Custom theme switchers |

Deprecation in progress (MVP §4 L813 + Stabilization D-04): `CesCard`, local `TabButton`, local `SectionTitle` patterns in GVGB / CES / eCign surfaces. Do not introduce new ones.

---

## 5. Mobile Constraints (Reference Only — Owned by MVP Lead 16)

These are MVP plan §C4 + Lead 16 binding rules and are listed here so you remember to honour them; they are not Stabilization scope.

| Rule | Source |
|---|---|
| <1024 px viewport: drawers MUST be bottom-sheet (drag handle, snap, swipe-down dismiss, persist on interrupt) | MVP §C4 |
| ≥1024 px: `RightDrawer` 480–520 px permitted | MVP §C4 |
| `SignaturePad` minimum 320 px canvas height | MVP §C5 |
| Form fields: 16 px font (iOS zoom guard), 48 px input height | MVP L122 |
| Touch targets: ≥48 px primary CTA, ≥44 px floor | MVP L1042 |

---

## 6. Auto-save / Persistence (Reference Only — Owned by MVP §1)

If you add a new form, use `useFormDraft` (`src/policy/utils/useFormDraft.ts`, Stabilization R-01). It bundles localStorage persistence, debounced writes, and `visibilitychange` / `pagehide` / `beforeunload` flush.

Out of scope for `useFormDraft`: blob persistence (Evidence Center IndexedDB), eCign signing flow (Protected Subsystem; do not touch without Architecture approval).

---

## 7. PR Checklist Before Submitting

Use `.github/PULL_REQUEST_TEMPLATE.md`. The Design System Compliance section enforces:

1. No new raw hex / `rgb()` literals
2. No new glass surfaces beyond §C1
3. No new parallel component families
4. CTA orange = canonical `#C74601` only
5. Touch targets meet floor
6. `verify:ui` passes (or new warnings explained)

If you change a `ui/` primitive, attach a visual regression artifact (Playwright baseline diff or side-by-side screenshot).

---

## 8. When to Escalate Instead of Decide

| Situation | Escalate to |
|---|---|
| You think the rule above is wrong for your case | Design Systems Lead — propose amendment with rationale; do not silently exempt |
| You need to touch `FormSigningWorkspace` / `FormViewer` / eCign | **Architecture + Compliance** (Protected Subsystem per MVP §C6) |
| You need to touch Evidence Center capture / storage / retrieval | **Architecture + Compliance** (Protected Subsystem) |
| You need to touch CES identity / `form_instance_id` routing | **Architecture** (Protected Subsystem) |
| You want to add a new `ui/` primitive | Design Systems Lead — RFC first, code second |
| You want to extend `HEX_SCAN_EXEMPT` in `verifyUiDesignSystem.ts` | Architecture review |

Defaulting to "I'll just add an inline style real quick" is the historical cause of the 2,313+ inline-style sprawl documented in MVP plan L63–64. Don't restart that loop.

---

## 9. Where The Binding Sources Live

| Concern | Authoritative source |
|---|---|
| Token list + values | `src/index.css` |
| Glass-layer cap | MVP plan §C1 (Lead 16 binding) |
| Hex/rgb prohibition | `scripts/verifyUiDesignSystem.ts` rules `tokens.hex-literal` + `tokens.rgb-literal` |
| Protected Subsystem rules | MVP plan §C6 + §3 |
| Brand separation (eCign vs Care Indeed) | MVP plan §C3 |
| CTA orange canonical hex | MVP plan §C2 |
| PR review gates | `.github/PULL_REQUEST_TEMPLATE.md` |
| This document | Stabilization D-06 (you are here) |

---

**End of D-06.**
