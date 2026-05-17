# Token Pipeline — Canonical Contract

**Owner:** Phase 1 Reconstruction  
**Status:** Phase 1 Locked (v0.2.0) — Ready for migration PRs

---

## Goal

Establish a single, governed design token system that feeds:
- CSS custom properties (`--ci-*`)
- Tailwind theme extensions
- TypeScript token types (for IntelliSense + compile-time safety)
- Future Figma → Code export

---

## Current State (Phase 1 Token Contract Locked)

- `tokens.json` is the single source of truth (version 0.2.0-phase1) — contains full typography scales, elevation shadows, overlays, surface dimensions, radius, expanded color primitives/semantic + glass/motion/spacing
- Generator stubs updated with mapping contract; reference output committed to `generated/tokens.css`
- All 5 gap categories identified in `PHASE_1_DASHBOARD_RAW_VALUE_INVENTORY.md` Section 6 are now present
- Production wiring (`src/styles/tokens.css`, Tailwind theme, TS types) tracked as next integration work
- Current artifacts in `Implementation/tokens/` serve as the live contract during Dashboard reconstruction
- Legacy raw values and wave classes tracked in Drift Register (no new raws allowed on target surfaces)

---

## Current Deliverables (Phase 1 Locked)

1. `tokens.json` v0.2.0-phase1 — complete contract (color + typography scales + shadow + overlay + dimension + radius + spacing + motion + glass)
2. Reference generated CSS: `generated/tokens.css` (all --ci-* vars, ready for import)
3. Updated generator stubs documenting the key → --ci-var mapping
4. Cross-referenced in `PHASE_1_DASHBOARD_RAW_VALUE_INVENTORY.md` (Section 8 migration candidates now map 1:1)
5. Next: wire into src/ + primitives + add lint guard (tracked outside this folder)

See generator files for mapping notes.

---

## Token Categories (Phase 1 Locked Structure)

```json
{
  "color": { "primitive": { ... }, "semantic": { ... }, "glass": { ... } },
  "spacing": { "xs"..."4xl" },
  "typography": { "fontFamily": {}, "fontSize": { "display-hero", "kpi-value", "eyebrow", ... }, "letterSpacing": { ... } },
  "radius": { "sm"..."2xl" },
  "glass": { "layer1-inset-desktop", "layer1-border-radius-desktop" },
  "shadow": { "elevation": { "sm-light", "md", "interactive", "card-light", "modal" } },
  "overlay": { "surface": { "faint", "soft", "medium" } },
  "dimension": { "surface": { "kpi-card-min-height", "touch-target-min", ... } },
  "motion": { "ease-standard", "duration-fast", "duration-base" }
}
```

All CSS output uses `--ci-` prefix per `UI_TOKEN_CONTRACT_SPEC.md`. See `design-references/` for human-readable scales and elevation rules.

---

## Next Actions (Post Phase 1 Lock)

- [x] Define/lock v1 token taxonomy + 5 gap categories in `tokens.json` (complete)
- [x] Align generated reference with Dashboard raw-value inventory proposals (complete)
- [ ] Wire `generated/tokens.css` (or build step) into `src/index.css` + Tailwind `theme.extend`
- [ ] Promote key primitives (`SurfaceCard`, `KpiCard` candidate) to consume tokens only
- [ ] Add ESLint / stylelint rule + CI check for raw values on target surfaces
- [ ] First Dashboard migration PR (50+ replacements) using this contract

This folder is the home for the token contract and all generation artifacts during reconstruction.
