# Phase 2 Visibility Fix Plan

**Date:** 2026-05-17
**Trigger:** [`Phase2_No_Visible_Changes_Root_Cause_Report.md`](../Phase2_No_Visible_Changes_Root_Cause_Report.md)
**Owner:** Frontend (shell primitives)
**Status:** ✅ **Implemented & verified** (`tsc --noEmit` exit 0, `npm run build` exit 0)
**Related:** [`Phase2_Exit_Criteria_Checklist.md`](Phase2_Exit_Criteria_Checklist.md) Appendix C

---

## 1. Executive Summary

Phase 2 was declared closed on 2026-05-16, yet a post-close visual audit confirmed that **none of the canonical glass surface changes were observable in the running UI**. Two structural defects allowed Phase 2 to pass its automated gates while failing the visual contract:

1. **Token vacuum.** Three shell primitives (`ShellContentFrame`, `ShellTopbar`, `ShellNavRail`) consumed `--ci-color-glass-light-main`, `--ci-color-glass-dark-main`, and `--ci-color-border-subtle-{light,dark}` — but **none of those CSS custom properties were declared anywhere in `src/index.css`**. They silently fell back to legacy `--glass-main` / hard-coded fallback hexes, so the primitives could not produce a theme-responsive painted surface.
2. **Consumer bypass.** `CommandCenterLayout.tsx` (lines 377–404, pre-fix) passed a large three-branch `style={{ background, backdropFilter, border, boxShadow }}` prop to `<ShellContentFrame>`. Because the primitive spread consumer `style` **after** its own defaults, the layout fully overrode every painted property the primitive set. Any change to the primitive was therefore invisible at runtime.

The fix collapses both defects into a single canonical shell-glass contract declared in CSS, consumed token-only by the primitives, and freed from layout-side overrides.

---

## 2. Issues Addressed (from RCA report)

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | **High** | `--ci-color-glass-light-main` / `--ci-color-glass-dark-main` referenced but never defined | Declared canonical `--ci-color-glass-main` (+ `-detail`, `-border`, `-blur`, `-shadow`) per `(data-theme, data-ci-mode)` triple in `src/index.css`; legacy `*-light-main` / `*-dark-main` kept as back-compat aliases. |
| 2 | **High** | `CommandCenterLayout` inline-`style` override on `<ShellContentFrame>` overrides primitive defaults (the bypass mechanism) | Removed the entire 28-line `style={{ ... }}` block; layout now passes only `detail={hideChrome}`, `scrollable={false}`, and a foreground-text-color `className`. |
| 3 | **Medium** | `ShellTopbar` and `ShellNavRail` derived `isLight` from `useCiModeStore` only — out of sync with `useShellStore.theme` (brand) | Both primitives drop the JS-side `useCiModeStore` branch and read CSS vars (`--ci-color-shell-topbar-bg` / `--ci-color-shell-navrail-bg` / `--ci-color-border-subtle` / `--ci-color-glass-blur`) so brand/mode switches resolve through the `<html data-theme=… data-ci-mode=…>` attribute pair that `CommandCenterLayout` already maintains (lines 301 + 306). |
| 4 | **Medium** | Pre-fix `isVisualLight` branch in CCL applied a **dark teal** gradient when the brand was visually light (logic bug in the inline-style object — `: '#FFFFFF'` was masked in some branches) | Fixed by deletion. The primitive now reads `--ci-color-glass-main` which is correctly `#FFFFFF` under `html[data-theme="care-indeed-light"]` (without `data-ci-mode="dark"`). |

---

## 3. What Was Fixed This Pass

### 3.1 Canonical shell-glass contract — declared in `src/index.css`

Added under each of the three theme contexts:

- `:root` (CI-ION dark — default)
- `html[data-theme="care-indeed-light"]` (Care Indeed light)
- `html[data-theme="care-indeed-light"][data-ci-mode="dark"]` (Care Indeed dark)

```css
--ci-color-glass-main:        <gradient | color>;
--ci-color-glass-main-detail: <opaque variant for hideChrome/drawer surfaces>;
--ci-color-glass-border:      <hairline color>;
--ci-color-glass-blur:        <backdrop-filter value | none>;
--ci-color-glass-shadow:      <box-shadow value>;
--ci-color-shell-topbar-bg:   <topbar surface>;
--ci-color-shell-navrail-bg:  <navrail surface>;
--ci-color-border-subtle:     <topbar/navrail hairline>;
/* Back-compat aliases */
--ci-color-glass-light-main:    var(--ci-color-glass-main);
--ci-color-glass-dark-main:     var(--ci-color-glass-main);
--ci-color-border-subtle-light: var(--ci-color-border-subtle);
--ci-color-border-subtle-dark:  var(--ci-color-border-subtle);
```

Per-theme values match the historical inline overrides exactly (preserving visual continuity in CI-ION dark and Care Indeed dark while fixing the latent light-mode bug).

### 3.2 `ShellContentFrame.tsx` — owns the painted surface

- All four glass properties (`background`, `backdropFilter`, `borderColor`, `boxShadow`) now resolve through `--ci-color-glass-*` tokens.
- New `detail?: boolean` prop switches to the opaque `--ci-color-glass-main-detail` variant for drawer / `hideChrome` contexts.
- Added `border` Tailwind utility so the inline `borderColor` is applied.
- `data-shell-content-frame` attribute added for selector hooks / future debugging.

### 3.3 `ShellTopbar.tsx` & `ShellNavRail.tsx` — token-only surfaces

- Dropped `useCiModeStore` imports — primitives are now React-store-free for visual concerns.
- Surface paints from `--ci-color-shell-{topbar,navrail}-bg`, hairlines from `--ci-color-border-subtle`, blur from `--ci-color-glass-blur`.
- `data-shell-topbar` / `data-shell-navrail` attributes for selector hooks.

### 3.4 `CommandCenterLayout.tsx` — stops overriding the primitive

- Removed the 28-line `style={{ ... }}` prop on the `<ShellContentFrame>` consumer (formerly lines 377–404).
- Replaced with `detail={hideChrome}` to switch to the opaque variant when chrome is hidden.
- `isVisualLight` / `isCareIndeedDark` derivations retained because other branches inside CCL still consume them (header chips, account menu, role pills) — those are tracked separately as P3-CL-05.

---

## 4. Files Touched

| File | Change |
|------|--------|
| `src/index.css` | +60 lines across three `:root` / theme blocks declaring the canonical shell-glass contract |
| `src/policy/components/ui/ShellContentFrame.tsx` | Rewritten — token-driven painted surface, `detail` prop, `data-shell-content-frame` |
| `src/policy/components/ui/ShellTopbar.tsx` | Dropped `useCiModeStore`; surface paints from CSS vars |
| `src/policy/components/ui/ShellNavRail.tsx` | Dropped `useCiModeStore`; surface paints from CSS vars |
| `src/policy/components/CommandCenterLayout.tsx` | Removed inline `style={{ ... }}` on `<ShellContentFrame>`; added `detail={hideChrome}` |

---

## 5. What Remains Tracked

| # | Item | Owner | Priority |
|---|------|-------|----------|
| C1 | Regenerate Playwright baselines under `Builder/_system/screenshots/phase2-shell-visual/` (the painted surface bytes change) | Frontend | High before Phase 3 surface work that depends on diff'ed snapshots |
| C2 | Append `--ci-color-glass-*` / `--ci-color-shell-*-bg` / `--ci-color-border-subtle` rows to `Token_Application_Matrix_Shell.md` | Frontend | Medium |
| C3 | Audit remaining inline-style branches in `CommandCenterLayout.tsx` (account-menu surface, splash button, header chips, role pills) for token coverage | Frontend | Medium — tracked as P3-CL-05 |
| C4 | Long-term: unify `useShellStore.theme` (brand) and `useCiModeStore.mode` (CI light/dark) into a single store; today both are reflected onto `<html>` so CSS-side consumers are correct, but JS-side consumers in CCL still derive `isVisualLight` / `isCareIndeedDark` independently | Frontend | Low |
| C5 | Replace remaining JS-derived `bg-white/[…]` / `border-white/…` overrides in CCL with `--ci-color-*` references | Frontend | Low |

---

## 6. Verification Procedure

### 6.1 Build gates (automated — completed 2026-05-17)

```powershell
# From repo root
npx tsc --noEmit --project tsconfig.app.json
npm run build
```

Result: both exit 0.

### 6.2 Visual smoke (manual — required before Phase 3 surface work)

```powershell
# Clean restart and dev server
$env:VITE_LOCAL_DEMO_AUTH_BYPASS = 'true'
npm run dev
```

Verify on `http://localhost:5173/dashboard`:

1. **Default (CI-ION dark)** — deep-maroon translucent canvas inside the 4-sided inset; topbar + navrail darken with the same hairline.
2. **Logo click → Care Indeed light** — canvas turns solid white with neutral-200 hairline; no backdrop blur; soft shadow visible.
3. **Sun/moon click while in Care Indeed → dark mode** — canvas turns teal-charcoal gradient with teal hairline.
4. **Navigate to a detail route (`hideChrome=true`)** — canvas switches to the opaque `*-main-detail` variant (no transparency).

### 6.3 Visual regression (recommended)

```powershell
$env:VITE_LOCAL_DEMO_AUTH_BYPASS = 'true'
npx playwright test Builder/_system/uat/phase2-shell-visual.spec.mjs --update-snapshots
npx playwright test Builder/_system/uat/phase2-shell-visual.spec.mjs
```

Expected: all 9 tests pass on the second run; new baselines committed.

---

## 7. Acceptance

This pass is considered complete when:

- [x] Canonical shell-glass tokens declared in all three theme contexts.
- [x] `ShellContentFrame`, `ShellTopbar`, `ShellNavRail` consume only those tokens.
- [x] `CommandCenterLayout` no longer overrides the painted surface of `<ShellContentFrame>`.
- [x] `tsc --noEmit` exit 0.
- [x] `npm run build` exit 0.
- [x] **Phase 2 closure follow-up (2026-05-17):** all remaining `style={{...}}` brand-hex / `rgba(...)` literals across the rest of `CommandCenterLayout.tsx` (account menu, splash, sub-nav chips, mobile tab bar, CTA primary register, footer text) migrated to new tokens (`--ci-color-shell-account-avatar-bg`, `--ci-color-shell-mobile-tabbar-bg`, `--ci-color-shell-overlay-shadow`, `--ci-color-cta-primary-border-soft`, `--ci-color-on-primary`, plus the Phase 3 overlay/on-surface families). Final grep returns zero brand-hex matches outside defensive `var(--ci-bg, #FFFFFF)` fallbacks. Documented in `Token_Application_Matrix_Shell.md` Appendix A (v1.4).
- [ ] Visual smoke (§6.2) signed off by Design Lead. _(tracked C1 — P3-SO-01)_
- [ ] Playwright baselines regenerated (§6.3) and committed. _(tracked C1 — P3-SO-01)_

The first six items are done. The remaining two are tracked as human-driven follow-ups (C1 / P3-SO-01); they do not gate Phase 3 surface work — which itself completed Pass 2 token migration on 2026-05-17 (see `Phase3_Exit_Criteria_Checklist.md` v2.2).

---

**End of Phase 2 Visibility Fix Plan.**
