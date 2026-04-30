# Care Indeed — UI Design System & Architecture

> **Authority:** `Builder/CareIndeed-Design/CI Design System.pdf` (brand kit: colour, radius, padding, typography, icons, primitives).
> **Scope:** Care Indeed brand only. CI-ION dark brand is preserved unchanged.
> **Pass:** Architecture + tokens + primitives + a separate Care Indeed Light/Dark mode toggle.
> **Non-goals:** Backend wiring, removing existing functionality, touching Journey/training surfaces, or altering the logo-click brand toggle.

---

## 0. Two orthogonal axes (read this first)

The app today conflates **Brand** and **Mode**. The new architecture separates them:

| Axis | Attribute on `<html>` | Values | Source of truth | Where it appears |
| --- | --- | --- | --- | --- |
| **Brand** (existing) | `data-theme` | `ci-ion-dark` &#124; `care-indeed-light` | `useShellStore.theme` | Logo click in shell / splash |
| **Mode** (NEW) | `data-ci-mode` | `light` &#124; `dark` | `useCiModeStore.mode` | Sun/Moon button in shell header (only when brand = Care Indeed) |

CSS resolves the four combinations as:

```
data-theme="ci-ion-dark"                         → CI-ION premium dark (untouched)
data-theme="care-indeed-light" data-ci-mode="light" → Care Indeed Light
data-theme="care-indeed-light" data-ci-mode="dark"  → Care Indeed Dark   (NEW)
```

`data-ci-mode` has **no effect** when brand = CI-ION. The logo click never touches `data-ci-mode`.

---

## 1. Design principles

1. **Flat & enterprise-grade.** No 3D, no skeuomorphism, no neon glow, no glass-on-glass.
2. **Subtle glass only on dark surfaces.** Light mode is solid white surfaces, no blur.
3. **Tokens, not hardcodes.** No component should ship raw `#000000` or `text-black`.
4. **Two colours do the work.** Orange (`#C74601`) = CTA / critical. Teal (`#007970`) = navigation, links, selection, focus.
5. **One radius family.** `4 / 8 / 12 / 16 / 24 / 999`. No bespoke radii per component.
6. **One spacing scale.** `4 / 8 / 12 / 16 / 24 / 32 / 48`.
7. **Typography:** Montserrat for headings, Roboto for body, JetBrains Mono for technical labels.
8. **Outline icons only** (lucide), 1.5 stroke, 16/18/20 sizes.
9. **Status by colour + label**, never colour alone (a11y).
10. **Right panels & drawers** share a single primitive — no per-page drawer styling.

---

## 2. Colour tokens

### 2.1 Brand palette (kit)

| Token | Hex | Usage |
| --- | --- | --- |
| `--ci-primary-500` | `#C74601` | CTA buttons, critical actions |
| `--ci-primary-600` | `#421700` | CTA hover / pressed |
| `--ci-primary-400` | `#E56E2E` | CTA hover-light |
| `--ci-primary-300` | `#FFD5BF` | CTA tint surface |
| `--ci-primary-200` | `#FFEEE5` | CTA washed bg |
| `--ci-primary-100` | `#FFFAF7` | Soft tint |
| `--ci-secondary-500` | `#007970` | Links, active tabs, selection, focus |
| `--ci-secondary-600` | `#004142` | Link hover, deep accent |
| `--ci-secondary-400` | `#7ADEDF` | Active chip / tag |
| `--ci-secondary-300` | `#C4F4F5` | Selected row tint |
| `--ci-secondary-200` | `#E5FEFF` | Soft accent wash |
| `--ci-secondary-100` | `#F7FEFF` | Subtle tint |

### 2.2 Neutrals (kit)

| Token | Hex | Light role | Dark role |
| --- | --- | --- | --- |
| `--ci-neutral-100` | `#FAFBF8` | App bg | — |
| `--ci-neutral-200` | `#E5E4E3` | Hairline | — |
| `--ci-neutral-300` | `#D1D1D1` | Divider | — |
| `--ci-neutral-400` | `#747474` | Placeholder | Tertiary text |
| `--ci-neutral-500` | `#52404B` | Body secondary | — |
| `--ci-neutral-600` | `#1F1C1B` | Headings / body | — |

### 2.3 Sentiment

| Role | Light bg / fg / border | Dark bg / fg / border |
| --- | --- | --- |
| Success | `#E5F4EE` / `#008540` / `#85D4B2` | `rgba(0,133,64,0.18)` / `#7AE2A8` / `rgba(0,133,64,0.45)` |
| Warning | `#FFF0E5` / `#8C6B0A` / `#FFC700` | `rgba(255,199,0,0.18)` / `#FFD64D` / `rgba(255,199,0,0.45)` |
| Danger  | `#FBE6E6` / `#D70101` / `#F49E9E` | `rgba(215,1,1,0.20)` / `#FF7A7A` / `rgba(215,1,1,0.50)` |
| Info    | `#E5FEFF` / `#007970` / `#7ADEDF` | `rgba(0,121,112,0.20)` / `#7ADEDF` / `rgba(0,121,112,0.50)` |

### 2.4 Semantic tokens (the only tokens components should reference)

These resolve per (brand × mode) so components stay theme-agnostic:

```
--ci-bg            page background
--ci-surface       primary card / panel surface
--ci-surface-2     nested / secondary surface (sparingly)
--ci-surface-muted KPI / dimmer block
--ci-text          primary text
--ci-text-muted    secondary text
--ci-text-subtle   tertiary / placeholder
--ci-border        hairline border
--ci-border-strong divider / control border
--ci-link          link / active tab text
--ci-link-hover    link hover
--ci-accent        brand accent fill (teal in CI light/dark; gold in CI-ION)
--ci-cta           CTA fill (orange)
--ci-cta-text      CTA foreground
--ci-focus-ring    focus ring colour
--ci-glass-bg      translucent panel background (dark modes only)
--ci-glass-border  translucent panel border
--ci-shadow-sm
--ci-shadow-md
--ci-shadow-lg
```

---

## 3. Mode tokens

### 3.1 Care Indeed Light

| Semantic | Value |
| --- | --- |
| `--ci-bg` | `#FAFBF8` |
| `--ci-surface` | `#FFFFFF` |
| `--ci-surface-2` | `#FAFBF8` |
| `--ci-surface-muted` | `#F4F4F2` |
| `--ci-text` | `#1F1C1B` |
| `--ci-text-muted` | `#52404B` |
| `--ci-text-subtle` | `#747474` |
| `--ci-border` | `#E5E4E3` |
| `--ci-border-strong` | `#D1D1D1` |
| `--ci-link` | `#007970` |
| `--ci-link-hover` | `#004142` |
| `--ci-accent` | `#007970` |
| `--ci-cta` | `#C74601` |
| `--ci-cta-text` | `#FFFFFF` |
| `--ci-focus-ring` | `rgba(199,70,1,0.30)` |
| `--ci-glass-bg` | `#FFFFFF` (no blur) |
| `--ci-shadow-sm` | `0 1px 2px rgba(31,28,27,0.06)` |
| `--ci-shadow-md` | `0 4px 12px rgba(31,28,27,0.08)` |
| `--ci-shadow-lg` | `0 12px 32px rgba(31,28,27,0.10)` |

### 3.2 Care Indeed Dark (NEW)

Designed for Care Indeed, **not** CI-ION. **Not black-on-black.** Deep teal-charcoal foundation; near-white text; orange used sparingly for CTA only.

| Semantic | Value | Notes |
| --- | --- | --- |
| `--ci-bg` | `#0E1B1C` | deep charcoal-teal |
| `--ci-surface` | `#15282A` | primary card |
| `--ci-surface-2` | `#1B3133` | nested surface |
| `--ci-surface-muted` | `#11242A` | dim KPI tile |
| `--ci-text` | `#F1F5F4` | near-white (≥ 13:1 on `--ci-bg`) |
| `--ci-text-muted` | `#B7C7C5` | secondary (≥ 7:1) |
| `--ci-text-subtle` | `#7FA09D` | tertiary (≥ 4.6:1) |
| `--ci-border` | `rgba(122,222,223,0.16)` | teal-tinted hairline |
| `--ci-border-strong` | `rgba(122,222,223,0.28)` | divider |
| `--ci-link` | `#7ADEDF` | secondary-400 |
| `--ci-link-hover` | `#C4F4F5` | secondary-300 |
| `--ci-accent` | `#7ADEDF` | teal accent |
| `--ci-cta` | `#E56E2E` | primary-400 (more readable on dark) |
| `--ci-cta-text` | `#1F1C1B` | dark text on orange for AAA |
| `--ci-focus-ring` | `rgba(122,222,223,0.45)` |
| `--ci-glass-bg` | `linear-gradient(160deg,rgba(27,49,51,0.78),rgba(14,27,28,0.78))` |
| `--ci-glass-border` | `rgba(122,222,223,0.18)` |
| `--ci-shadow-sm` | `0 1px 2px rgba(0,0,0,0.45)` |
| `--ci-shadow-md` | `0 8px 22px rgba(0,0,0,0.45)` |
| `--ci-shadow-lg` | `0 22px 48px -16px rgba(0,0,0,0.65)` |

Sentiment & status badges in CI Dark use the dark-mode rows in §2.3.

---

## 4. Glassmorphism rules

* **Light mode (Care Indeed):** flat solid surfaces. **No** `backdrop-filter`. Borders use `--ci-border`, shadows use `--ci-shadow-sm/md`.
* **Dark mode (Care Indeed):** at most **one** glass surface per region:
  * `background: var(--ci-glass-bg)`
  * `backdrop-filter: blur(14px) saturate(120%)`
  * `border: 1px solid var(--ci-glass-border)`
  * `box-shadow: var(--ci-shadow-lg)`
* **CI-ION:** unchanged (existing one-glass canvas).
* **Forbidden:** glass over glass, frosted modals over frosted panels, glow rings, neon pulses on chrome.

---

## 5. Spacing scale

`--space-1: 4px · --space-2: 8px · --space-3: 12px · --space-4: 16px · --space-6: 24px · --space-8: 32px · --space-12: 48px`

Desktop padding rules (per kit):
* **Page gutter:** 24–32px (use `px-6 md:px-8`)
* **Card padding:** 24px (use `p-6`)
* **Section padding:** 16–24px (`p-4 md:p-6`)
* **Drawer padding:** 24px header / 16–24px body
* **Form field gap:** 16px between fields, 8px label→input

---

## 6. Radius scale

`--radius-sm: 4px · --radius-md: 8px · --radius-lg: 12px · --radius-xl: 16px · --radius-2xl: 24px · --radius-pill: 999px`

Component → radius:
| Element | Radius |
| --- | --- |
| Buttons (default) | `--radius-md` (8) |
| Inputs / Selects | `--radius-md` (8) |
| Cards / Panels | `--radius-xl` (16) |
| Drawers | `--radius-xl` top-left / bottom-left only when slide-in |
| Pills / Badges | `--radius-pill` |
| Tabs (segmented) | `--radius-md` for the group, `--radius-sm` per item |

---

## 7. Typography scale

| Role | Family | Size / Line | Weight |
| --- | --- | --- | --- |
| Display | Montserrat | 32 / 40 | 700 |
| H1 | Montserrat | 24 / 32 | 700 |
| H2 | Montserrat | 20 / 28 | 600 |
| H3 | Montserrat | 16 / 24 | 600 |
| Eyebrow | JetBrains Mono | 11 / 16, tracking .22em | 700 uppercase |
| Body | Roboto | 14 / 22 | 400 |
| Body-strong | Roboto | 14 / 22 | 600 |
| Small | Roboto | 12 / 18 | 400 |
| Mono | JetBrains Mono | 12 / 18 | 500 |

---

## 8. Component rules

### 8.1 Buttons

| Variant | Light | Dark |
| --- | --- | --- |
| **CTA / Primary** | bg `--ci-cta`, text white, hover `--ci-primary-600` | bg `--ci-cta` (`#E56E2E`), text `#1F1C1B`, hover `#C74601` |
| **Secondary (teal)** | border `--ci-secondary-500`, text `--ci-secondary-500`, hover bg `--ci-secondary-200` | border `--ci-secondary-400`, text `--ci-secondary-400`, hover bg `rgba(122,222,223,0.10)` |
| **Ghost / Utility** | text `--ci-text-muted`, hover bg `--ci-neutral-100` | text `--ci-text-muted`, hover bg `rgba(255,255,255,0.06)` |
| **Danger** | bg `--ci-error-300`, text white | bg `rgba(215,1,1,0.85)`, text white |

Sizes: `sm` 28h / 12px-text · `md` 36h / 14px-text · `lg` 44h / 14–15px-text. Radius `--radius-md`. Min horizontal padding 16. Disabled = 40% opacity, no hover.

### 8.2 Fields

Height 36 (default). Border 1px `--ci-border-strong`. Focus border `--ci-accent`, ring `var(--ci-focus-ring)`. Placeholder `--ci-text-subtle`. Background `--ci-surface` (light) / `var(--ci-surface-2)` (dark). Radius `--radius-md`.

### 8.3 Tables / DataGrid

Header row: bg `--ci-surface-muted`, text uppercase 10px tracking .15em, color `--ci-text-muted`. Body row hover: bg `rgba(0,121,112,0.05)` (light) / `rgba(122,222,223,0.06)` (dark). Cell padding `12px 16px`. Hairline `--ci-border` between rows. No vertical cell borders. Selected row left-border 2px `--ci-accent`, bg `--ci-secondary-200` (light) / `rgba(122,222,223,0.08)` (dark).

### 8.4 Cards / Panels

`SurfaceCard` = bg `--ci-surface`, border `1px var(--ci-border)`, radius `--radius-xl`, shadow `--ci-shadow-sm`, padding `24px`. `GlassPanel` = same but uses `--ci-glass-bg` + `--ci-glass-border` + dark-mode blur (no-op in light).

### 8.5 Tabs

Segmented group: bg `--ci-surface-muted`, radius `--radius-md`, padding 4. Active tab: bg `--ci-surface`, text `--ci-text`, shadow `--ci-shadow-sm`. Inactive: text `--ci-text-muted`, hover text `--ci-text`.

Underline tabs (page-level): inactive text `--ci-text-muted`, active text `--ci-link`, 2px underline `--ci-accent`, transition 120ms.

### 8.6 Status badges

Pill, 22h, padding `2px 10px`, font 11px / weight 600 uppercase, tracking .08em. Use sentiment tokens from §2.3. Always include label text — never colour-only.

### 8.7 Icons

Lucide outline, stroke 1.5, sizes 14 / 16 / 18 / 20 / 24. Default colour `currentColor` so icons inherit text colour.

### 8.8 Right drawer / detail panel

Width: 420 (sm), 520 (md), 640 (lg). Position: fixed right, full-height. Surface: `GlassPanel` with `--radius-xl` on the left edge only. Header: 64h with eyebrow + title + close. Body: scrollable, 24px padding. Footer (optional): 16px padding, top border `--ci-border`.

Used by: Event Detail, Workflow Execution Panel, Task Detail (PM), Form Detail, Policy quick-view.

### 8.9 Calendar / PM Kanban / Gantt

* All three share `PageHeader` + `PmFilterBar` + the same drawer.
* Day cell: bg `--ci-surface`, border `--ci-border`, today ring 2px `--ci-accent`. Out-of-month: bg `--ci-bg`, text `--ci-text-subtle`.
* Kanban column header: bg `--ci-surface-muted`, count chip uses `StatusBadge`.
* Kanban card: `SurfaceCard` shrunk to padding 12, radius `--radius-lg`. Status dot 8px on top-left.
* Gantt bar: fill `--ci-accent` for normal, `--ci-cta` for blocked / overdue, `rgba(122,222,223,.4)` for dependency lines (dark).
* Today line: 1px `--ci-cta`.

---

## 9. Shared primitives (`src/policy/components/ui/`)

| Primitive | File | Purpose |
| --- | --- | --- |
| `PageHeader` | `PageHeader.tsx` | Eyebrow + title + actions. Standard page top-strip. |
| `SurfaceCard` | `SurfaceCard.tsx` | Flat card on `--ci-surface`. |
| `GlassPanel` | `GlassPanel.tsx` | Translucent panel (dark) / flat (light). |
| `ActionButton` | `ActionButton.tsx` | CTA / Secondary / Ghost / Danger × sm/md/lg. |
| `UtilityButton` | `UtilityButton.tsx` | Square 36 icon button used in headers / drawers. |
| `StatusBadge` | `StatusBadge.tsx` (existing — extend) | Pill with sentiment variants. |
| `EntityLink` | `pm/EntityLink.tsx` (existing — extend) | Theme-safe link colour via `--ci-link`. |
| `SearchField` | `SearchField.tsx` | Search input with leading icon, optional clear. |
| `Tabs` | `Tabs.tsx` | Segmented + underline tab styles. |
| `RightDrawer` | `RightDrawer.tsx` | Right-side detail drawer shell. |
| `DataGrid` | `DataGrid.tsx` | Token-driven table primitives (Header/Row/Cell). |
| `EmptyState` | `EmptyState.tsx` | Icon + title + description + optional CTA. |
| `SectionHeader` | `SectionHeader.tsx` | Tiny eyebrow header used inside cards. |
| `ThemeModeToggle` | `ThemeModeToggle.tsx` | Care Indeed Sun/Moon toggle (renders only when brand = Care Indeed). |

All primitives consume `--ci-*` semantic tokens — never hex literals.

---

## 10. Theming runtime

* **Brand** → `useShellStore` → writes `data-theme` (existing, unchanged).
* **Mode** → `useCiModeStore` (NEW) → writes `data-ci-mode`. Persisted in `localStorage` under key `ci-care-indeed-mode` (default `light`). Toggle button visible in shell header only when brand = Care Indeed.

CSS resolution:

```css
:root                                                   /* CI-ION dark tokens */
html[data-theme="care-indeed-light"]                    /* Care Indeed light tokens */
html[data-theme="care-indeed-light"][data-ci-mode="dark"] /* Care Indeed dark tokens */
```

The mode attribute is **ignored under CI-ION**, so the brand toggle's behaviour is untouched.

---

## 11. Verification

Script: `scripts/verifyUiDesignSystem.ts` — scans `src/**/*.{ts,tsx,css}` and fails on:

1. Missing `useCiModeStore` / `data-ci-mode` wiring.
2. CommandCenterLayout still owning `toggleTheme` on the logo (must remain — confirms brand toggle preserved).
3. Hardcoded `text-black` on `bg-black`-style class pairs.
4. Inline `color: '#000'` or `background: '#000'` patterns.
5. EntityLink hardcoding `text-cyan-300`/`text-cyan-700` instead of token (warns).
6. PM right panel pinning `slate-` palette directly (warns; should migrate to `GlassPanel` + tokens).

Run: `npm run verify:ui`.

---

## 12. Application checklist (rolling)

These surfaces must use the new tokens / primitives. Tick as migrated:

- [x] Tokens in `src/index.css`
- [x] `useCiModeStore` + `data-ci-mode` wiring
- [x] `ThemeModeToggle` placed in `CommandCenterLayout` header (Care Indeed only)
- [x] Shared primitives created in `src/policy/components/ui/`
- [x] `EntityLink` link colour → `--ci-link`
- [x] `StatusBadge` (existing) extended with sentiment tokens
- [ ] Dashboard
- [ ] Calendar / regulatory events
- [ ] Event detail panel
- [ ] Workflow execution panel
- [ ] PM Kanban
- [ ] PM Gantt
- [ ] Task detail panel — `RightDrawer` + tokens
- [ ] Related Tasks tab
- [ ] Policy library + Policy detail
- [ ] Forms library + Form viewer
- [ ] Workflows
- [ ] iAdministrator shell

The unchecked rows are the next sprint of incremental adoption — components above remove the per-page Tailwind hex classes and switch to the new primitives without changing layout or behaviour.
