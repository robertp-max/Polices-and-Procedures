# Token Application Matrix — Phase 2 Shell

**Phase 2 — Core Shell and Command Center Rebuild**  
**Version:** 1.0  
**Date:** 2026-05-17  
**Source of Truth:** `tokens/tokens.json` (v0.2.0-phase1, locked 2026-05-16)

**Rule:** Every visual decision in the shell must resolve to a value in `tokens/tokens.json`. No raw values permitted.

---

## 1. Token Families Used by the Shell

| Family          | Tokens Available (v0.2.0)                          | Shell Usage Priority |
|-----------------|----------------------------------------------------|----------------------|
| `color`         | primitive.*, semantic.*, glass.*                   | Highest              |
| `glass`         | layer1-inset-desktop, layer1-border-radius-desktop | Critical             |
| `spacing`       | xs → 4xl                                           | High                 |
| `typography`    | fontFamily.*, fontSize.*, letterSpacing.*          | High                 |
| `shadow`        | elevation.*                                        | High (especially light mode) |
| `radius`        | sm → full                                          | Medium               |
| `dimension`     | surface.* (min widths/heights, touch-target)       | High for layout      |
| `overlay`       | surface.* (faint, soft, medium)                    | Medium (gradients)   |
| `motion`        | ease-standard, duration-fast/base                  | Medium               |

---

## 2. Shell Component → Token Matrix

### 2.1 ShellFrame

| Visual Decision                    | Token(s) Used                                      | CSS / Class Pattern                  | Notes |
|------------------------------------|----------------------------------------------------|--------------------------------------|-------|
| Desktop 4-sided inset              | `--ci-glass-layer1-inset-desktop`                  | `padding: var(--ci-glass-layer1-inset-desktop)` | Non-negotiable |
| Backdrop (dark)                    | `--ci-color-glass-dark-main`                       | Background on Layer 0                | — |
| Backdrop (light)                   | Light gutter + subtle texture                      | Defined in `TravelightBG` component  | Must respect tokens |
| Root border radius (if any)        | `--ci-radius-2xl`                                  | —                                    | Rare |

### 2.2 ShellTopbar

| Visual Decision                    | Token(s) Used                                      | Notes |
|------------------------------------|----------------------------------------------------|-------|
| Topbar height                      | `--ci-spacing-xl` (or `--ci-dimension-surface-touch-target-min` for mobile) | Fixed height recommended |
| Background                         | `--ci-color-glass-light-main` or `--ci-color-glass-dark-main` | Via `GlassPanel` |
| Text (primary)                     | `--ci-color-text-primary-light` / `--ci-color-text-primary-dark` | — |
| Text (secondary)                   | `--ci-color-text-secondary-light` / `--ci-color-text-muted` | — |
| Border / Divider                   | `--ci-color-border-subtle-light` / `--ci-color-border-subtle-dark` | Very subtle |
| Action buttons                     | `UtilityButton` (consumes tokens internally)       | — |
| Focus ring                         | `--ci-color-accent-teal`                           | — |

### 2.3 ShellNavRail

| Visual Decision                    | Token(s) Used                                      | Notes |
|------------------------------------|----------------------------------------------------|-------|
| Rail width                         | `--ci-spacing-3xl` or `--ci-dimension-surface-...` (to be confirmed) | Consistent across breakpoints |
| Nav item height                    | `--ci-dimension-surface-touch-target-min` (44px)   | Mobile + desktop |
| Active item background             | `--ci-color-glass-light-main` / semantic glass     | Low opacity |
| Active item text                   | `--ci-color-accent-orange` or teal (mode dependent) | Strategic use only |
| Group headings                     | `--ci-font-size-eyebrow` + `--ci-letter-spacing-eyebrow-strong` | Uppercase, tight tracking |
| Item text                          | `--ci-font-size-body-sm` + `--ci-font-family-body` | — |
| Hover / Focus                      | Token-driven transitions using `--ci-motion-duration-fast` | — |
| Icon size                          | `--ci-spacing-lg`                                  | Consistent |

### 2.4 ShellContentFrame

| Visual Decision                    | Token(s) Used                                      | Notes |
|------------------------------------|----------------------------------------------------|-------|
| Inner padding (4-sided breathing)  | `--ci-glass-layer1-inset-desktop`                  | Must never be overridden by pages |
| Max-width constraint (optional)    | To be defined in future (Phase 2.1)                | Currently derived from frame inset |
| Scroll behavior                    | Native + `--ci-motion-ease-standard`               | — |

### 2.5 Glass & Elevation (All Shell Layers)

| Layer | Background Token                          | Border Token                          | Shadow Token                          | Usage |
|-------|-------------------------------------------|---------------------------------------|---------------------------------------|-------|
| 0     | `--ci-color-background-page-dark` / light | None                                  | None                                  | Atmospheric backdrop |
| 1     | `--ci-color-glass-light-main` / dark-main | `--ci-color-border-subtle-*`          | `--ci-shadow-elevation-card-light` or `sm-light` | Main shell surface (`GlassPanel`) |
| 2     | `--ci-color-glass-light-main` (tinted)    | `--ci-color-border-subtle-light`      | `--ci-shadow-elevation-md` or `interactive` | `SurfaceCard` inside shell |

**Critical:** All shadows on desktop must come from the `shadow.elevation` scale. No inline `shadow-[0_14px_28px_...]` allowed.

### 2.6 Typography in Shell

| Element Type              | Token(s)                                      | Example Usage |
|---------------------------|-----------------------------------------------|---------------|
| Topbar primary labels     | `--ci-font-size-body-md` + `--ci-font-family-body` | — |
| Nav group headings        | `--ci-font-size-eyebrow` + `--ci-letter-spacing-eyebrow-strong` | Uppercase |
| Nav item labels           | `--ci-font-size-body-sm`                      | — |
| Topbar secondary text     | `--ci-font-size-caption` + `--ci-letter-spacing-uppercase-sm` | — |

### 2.7 Spacing & Dimensions

| Decision                      | Token                                      | Recommended Value |
|-------------------------------|--------------------------------------------|-------------------|
| Topbar internal padding       | `--ci-spacing-md` / `--ci-spacing-lg`      | — |
| Nav item vertical spacing     | `--ci-spacing-sm`                          | — |
| Gap between command groups    | `--ci-spacing-xl`                          | — |
| Minimum touch target          | `--ci-dimension-surface-touch-target-min`  | 44px (enforced) |
| Rail collapse threshold       | `--ci-dimension-surface-hero-stats-min-width` (reference) | — |

### 2.8 Motion & Reduced Motion

| Decision                      | Token                           | Rule |
|-------------------------------|---------------------------------|------|
| All shell transitions         | `--ci-motion-duration-fast` + `--ci-motion-ease-standard` | Default |
| Reduced motion                | `prefers-reduced-motion`        | Disable all non-essential transitions in `ShellFrame` |

---

## 3. Token Enforcement Rules for Phase 2

1. **No new tokens** may be added during Phase 2 shell work without updating `tokens/tokens.json` and this matrix.
2. All new shell primitives must document their token consumption in their JSDoc.
3. Any shell file containing a raw hex, rgb, or arbitrary Tailwind value (`[... ]`) is considered incomplete.
4. The `ShellFrame` is the **single source of truth** for the `--ci-glass-layer1-inset-desktop` application.

---

## 4. Open Token Gaps for Shell (to be resolved in implementation)

- Dedicated nav item height token (currently using general spacing + dimension)
- Semantic "nav-active" and "nav-hover" color tokens (currently borrowing from accent)
- Shell-specific focus ring strength

These will be proposed as minor additions to `tokens/tokens.json` if needed during implementation.

---

**End of original Token Application Matrix (Shell) — v1.0**

---

## Appendix A — Phase 2 Closure & Visibility Fix Token Additions (v1.4 — 2026-05-17)

This appendix supersedes the placeholders in §2.5 and adds the canonical token rows declared in `src/index.css` across all three theme blocks (`:root` = CI-ION dark, `html[data-theme="care-indeed-light"]` = CI light, `html[data-theme="care-indeed-light"][data-ci-mode="dark"]` = CI dark). Closes Appendix C item C2 of `Phase2_Exit_Criteria_Checklist.md` v1.4.

### A.1 Canonical Glass Contract (Visibility Fix — 2026-05-17)

| Token                            | Purpose                                                | Primary Consumer(s)                                       |
|----------------------------------|--------------------------------------------------------|-----------------------------------------------------------|
| `--ci-color-glass-main`          | Painted glass background of Layer 1 surfaces           | `ShellContentFrame`, `ShellTopbar`, `ShellNavRail`        |
| `--ci-color-glass-main-detail`   | Detail-mode glass background (drawer / panel variant)  | `ShellContentFrame` (when `detail` prop is set)           |
| `--ci-color-glass-border`        | Edge definition for Layer 1 glass surfaces             | All Shell primitives                                      |
| `--ci-color-glass-blur`          | `backdrop-filter` blur radius for Layer 1              | All Shell primitives                                      |
| `--ci-color-glass-shadow`        | Drop-shadow / elevation for Layer 1                    | All Shell primitives                                      |
| `--ci-color-shell-topbar-bg`     | Topbar painted background (resolves to glass-main)     | `ShellTopbar`                                             |
| `--ci-color-shell-navrail-bg`    | Nav rail painted background                            | `ShellNavRail`                                            |
| `--ci-color-border-subtle`       | Subtle divider/border (replaces `border-subtle-*-dark/light` antipattern) | All Shell primitives                  |

### A.2 Account Menu (CCL closure — 2026-05-17)

| Token                                       | Purpose                                                    | Per-Theme Value |
|---------------------------------------------|------------------------------------------------------------|-----------------|
| `--ci-color-shell-account-avatar-bg`        | Account avatar background gradient/fill                    | CI-ION dark: `linear-gradient(135deg, rgba(93,14,14,0.9), rgba(49,7,7,0.9))` · Care Indeed light: `var(--ci-secondary-500)` · Care Indeed dark: `var(--ci-shell-account-avatar-bg-ci-light-dark, #1B4549)` |
| `--ci-color-shell-overlay-shadow`           | Drop shadow for account menu / floating overlays           | CI-ION dark + Care Indeed dark: `0 16px 36px rgba(0,0,0,0.45)` · Care Indeed light: `0 12px 28px rgba(0,0,0,0.12)` |
| `--ci-shell-account-menu-bg-light` / `-dark`| Account menu surface background (pre-existing v1.3)        | Light: `#FFFFFF` mix · Dark: `rgba(31,28,27,0.95)` |
| `--ci-overlay-border-strong`                | Account menu separator + outer border                      | (Phase 3 overlay family — themed) |

### A.3 Mobile Tab Bar (CCL closure — 2026-05-17)

| Token                                  | Purpose                                              | Per-Theme Value |
|----------------------------------------|------------------------------------------------------|-----------------|
| `--ci-color-shell-mobile-tabbar-bg`    | Bottom mobile tab bar painted background             | CI-ION dark + Care Indeed dark: `rgba(10,2,2,0.92)` · Care Indeed light: `rgba(255,255,255,0.95)` |
| `--ci-overlay-border-strong`           | Top border of mobile tab bar                         | (Phase 3 overlay family — themed) |
| `--ci-text-on-surface-soft`            | Inactive mobile tab label color                      | (Phase 3 on-surface family — themed) |

### A.4 CTA Primary Register (CCL closure — 2026-05-17)

| Token                                  | Purpose                                              | Per-Theme Value |
|----------------------------------------|------------------------------------------------------|-----------------|
| `--ci-color-cta-primary-border-soft`   | Soft border ring on primary CTAs (register/topbar)   | CI-ION dark + Care Indeed light: `rgba(199,70,1,0.45)` · Care Indeed dark: `rgba(122,222,223,0.45)` |
| `--ci-color-on-primary`                | Foreground text/icon color on primary CTA fills      | CI-ION dark + Care Indeed light: `#FFFFFF` · Care Indeed dark: `#0A0202` |

### A.5 Sub-nav Chips & Footer (CCL closure — 2026-05-17)

| Token                          | Purpose                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `--ci-overlay-faint`           | Sub-nav chip background (collapsed from light/dark ternary)          |
| `--ci-text-on-surface-muted`   | Sub-nav chip text + footer muted text                                |

### A.6 Enforcement & Verification

- All tokens above are declared in **all three** theme blocks of `src/index.css` and resolve via cascade, eliminating JS-side `useCiModeStore` branching for these decisions.
- `CommandCenterLayout.tsx`: post-closure grep for raw brand hex / `rgba(255,255,255,…)` / `rgba(0,0,0,0.X)` / `rgba(31,28,27,…)` / `rgba(199,70,1,…)` / `rgba(93,14,14,…)` / `rgba(49,7,7,…)` / `rgba(10,2,2,…)` returns **zero** matches outside three defensive `var(--ci-bg, #FFFFFF)` fallbacks.
- `tsc --noEmit --project tsconfig.app.json` exit 0; `npm run build` exit 0 (2026-05-17).

---

**End of Token Application Matrix (Shell) — v1.4**
