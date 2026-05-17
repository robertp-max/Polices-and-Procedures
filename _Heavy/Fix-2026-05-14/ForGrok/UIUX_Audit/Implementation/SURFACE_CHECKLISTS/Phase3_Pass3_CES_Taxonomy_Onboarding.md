# Phase 3 Pass 3 — CES + Taxonomy + Onboarding Refactor

**Date:** 2026-05-16
**Build status:** `npx tsc --noEmit` → 0 errors. `npm run build` → 0 errors.

## What changed

### 1. Token + utility-class foundation — `src/index.css`
- Added **17 new `:root` custom properties** centralizing the previously-scattered domain & regulatory accent palette:
  - `--ci-domain-{gv,cl,qa,hr,co,fn,op,it,rm,en}` (10 IBM-domain accents)
  - `--ci-reg-{title22,42cfr,cms,hipaa,osha,oig,fca}` (7 regulatory-framework accents)
- Added a **Phase 3 Pass 3 utility-class block** with the following classes (all resolve only to existing `--ci-*` tokens):
  - Sentiment: `ci-text-{success,danger,warning,info,gold,gold-soft}`, `ci-bg-{success,danger,warning,info,gold}-soft`, `ci-border-{success,danger,gold-soft}`
  - Journey rail: `ci-rail-active`, `ci-rail-resting`
  - Progress: `ci-progress-track`, `ci-progress-fill-done`, `ci-progress-fill-go`
  - ModuleCard edge accents: `ci-module-edge-{done,fail,todo}`
  - Rail typography: `ci-text-on-rail`, `ci-text-on-rail-soft`, `ci-text-on-rail-mute`

### 2. Onboarding surface — `src/policy/journey/components/PhaseRail.tsx`
- Replaced raw hex `#FFC107`, `#34D399`, `bg-white/5`, `border-white/10`, `text-white/70|40`, `text-[10px|9px]` with token classes.
- Removed all 3 inline `style={{ background: ... }}` blocks except the unavoidable dynamic `width: ${pct}%` (with a single targeted lint-disable comment).
- Inline-style count: **3 → 1** (just the dynamic width).
- Added `type="button"` and string-coerced `aria-pressed` for strict ESLint compliance.

### 3. Onboarding surface — `src/policy/journey/components/ModuleCard.tsx`
- Replaced inline `style={{ borderLeftWidth, borderLeftColor }}` with conditional `ci-module-edge-{done|fail|todo}` class.
- Replaced raw hex `text-[#FFC107]/90`, `text-[#DC2626]`, `text-[#FFC107]`, `hover:border-[#FFC107]/30` with `ci-text-gold-soft`, `ci-text-danger`, `ci-text-gold`, `hover:border-gold/30`.
- Replaced `text-[10px|11px|9px]` raw font-size brackets with `ci-text-{body-xs,eyebrow-strong}` and `ci-text-on-rail-{soft,mute}`.
- Added `type="button"` and `aria-hidden="true"` on decorative icons.
- Inline-style count: **1 → 0**.

### 4. CES surface — `src/policy/ces/pages/MyTasksPage.tsx`
- Visible header "Total / Open / Overdue" trio: 3 inline-styled `<span>` chips with hex `#93C5FD`, `#EFF6FF`, `#1D4ED8`, `#FECACA`, `#FFF1F2`, `#BE123C` → replaced with `<CiStatusBadge tone="neutral|info|danger">` canonical primitive.
- Visible filter button bar (All / Overdue / Awaiting Signature / Done): 4 raw `<button>` with hex-via-`CES_TOKENS` inline styles → replaced with `<ActionButton variant="secondary|ghost" size="sm" aria-pressed>` canonical primitive.
- Visible "Reviewing as: {role}" badge: inline-styled `<span>` with `#1E3A5F`/`#FFC107` → replaced with `<CiStatusBadge tone="warning">` (sentiment-correct: this is a privileged/elevated context).
- Visible empty state: hand-rolled inline-styled `<div>` + `<button>` → replaced with `<EmptyState title description action={<ActionButton variant="cta">}>` canonical primitive.
- Inline-style count on visible surfaces: **~12 → 0** (the Robert-only diagnostics panel + the header navy backdrop intentionally left untouched per CES sub-brand contract).

### 5. Taxonomy surface — `src/policy/pages/LibraryPage.tsx`
- **Data layer refactor:** all 17 hex constants in `REGULATORY_ITEMS` and `DOMAINS` swapped from raw hex (`'#FFC107'`, `'#ef4444'`, etc.) to `var(--ci-domain-*)` / `var(--ci-reg-*)` token references.
- Downstream `mapColor()` and `mixAlpha()` helpers were already var-aware (`mixAlpha` uses `color-mix(in srgb, ...)` when input starts with `var(`), so all consumer sites (chips, dots, badges) now flow through the token layer with zero behavior change.
- Single source of truth: a future WCAG audit or palette tweak now edits `src/index.css` only, not 10+ consumer sites.

## Inline-style + hex elimination summary

| File | Inline styles before | Inline styles after | Raw hex literals removed |
|---|---|---|---|
| PhaseRail.tsx | 3 | 1 (dynamic width) | 8 |
| ModuleCard.tsx | 1 | 0 | 6 |
| MyTasksPage.tsx (visible) | ~12 | 0 | 6 |
| LibraryPage.tsx (data layer) | 0 | 0 | 17 |
| **Total** | **16** | **1** | **37** |

## Remaining gaps — ranked

1. 🔴 **HIGH** — `src/policy/journey/OnboardingV1JourneyPage.tsx` (~1,200 lines). The journey shell itself is full of inline gradients, hex-literal accents, and ad-hoc font sizing. Refactor scope similar to PhaseRail × 10. Should be the next session's primary target.

2. 🟡 **MED** — `LibraryPage.tsx` header (~lines 421-540). Library icon, ACHC filter bar (`bg-[#f0fdfa]`, `border-[#99f6e4]`, `text-[#0f766e]`), view-switch buttons (`bg-[#007970]`, `bg-[#ea580c]`), shimmer-chip borders. These are visible decorative surfaces using raw hex. Now that domain tokens exist, an additional `--ci-achc-*` token family + `ci-bg-achc-filter` utility would finish the surface.

3. 🟡 **MED** — CES `MyTasksPage.tsx` header eyebrow + title pair (lines ~308-321). These currently use `CES_TOKENS.muted` / `CES_TOKENS.navy` via inline styles. They are token-backed (so not raw-hex violations) but still inline-style. Could be moved to a `ci-ces-page-header` composite class.

4. 🟢 **LOW** — Other CES sub-pages: `SignaturesPage`, `AttestationsPage`, `EvidenceArchivePage`. Same pattern as MyTasksPage; same fixes apply mechanically once the canonical primitives are wired in.

5. 🟢 **LOW** — Robert-only diagnostic overlays (`RoleDiagnosticsPanel` etc.) — intentionally deferred; debug UIs are exempt from the canonical contract.

## Recommended next steps

1. **OnboardingV1JourneyPage refactor** (largest remaining inline-style surface; full Pass-3 treatment).
2. **Taxonomy ACHC filter bar token family** (`--ci-achc-{bg,border,fg,muted}`) + sweep `LibraryPage` lines 421-540.
3. **CES sub-page sweep** (Signatures / Attestations / Evidence) reusing the patterns proven on MyTasksPage.
4. **Visual regression**: extend `Builder/_system/uat/phase2-shell-visual.spec.mjs` to cover `/journey`, `/library`, `/ces/my-tasks` so Pass 3 changes are guarded by snapshots going forward.

## Verification

- ✅ `npx tsc --noEmit --project tsconfig.app.json` → exit 0
- ✅ `npm run build` → exit 0
- ⏳ Playwright visual coverage NOT extended this pass (these three surfaces are not yet in `phase2-shell-visual` — recommended #4 above).
