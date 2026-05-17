# Phase 1 Baseline Audit - Dashboard Reference Surface

**Date:** 2026-05-16 (baseline)  
**Token Lock:** 2026-05-16
**Scope:** Week 1 baseline audit for raw-value and arbitrary-style density prior to Dashboard reconstruction. Phase 1 token contract now locked.

---

## 1) Audit Scope

Primary target files for initial baseline:
- `src/policy/pages/DashboardPage.tsx`
- `src/index.css` (global style debt context affecting Dashboard composition)

---

## 2) Baseline Metrics (Initial Pass)

### Dashboard page
- Raw hex/rgb occurrences in `DashboardPage.tsx`: **6**
- Arbitrary Tailwind value occurrences in `DashboardPage.tsx`: **35**

### Global stylesheet context
- Raw hex/rgb occurrences in `src/index.css`: **500**
- Arbitrary bracket-value occurrences in `src/index.css`: **1**

---

## 3) Interpretation

1. Dashboard has a moderate concentration of arbitrary sizing/typography values that should be migrated to canonical tokens or primitives during Phase 1.
2. Global stylesheet debt is high and should be treated as controlled background scope; only Dashboard-relevant selectors should be touched in this phase.
3. Raw-value reduction targets should prioritize Dashboard-owned classes/components first, then shared primitives directly used by Dashboard.

---

## 4) Phase 1 Baseline Actions Opened

- [x] Baseline metrics captured
- [x] Dashboard file-level raw-value inventory (line-item list) - see `PHASE_1_DASHBOARD_RAW_VALUE_INVENTORY.md`
- [x] Token mapping proposal for first 50 replacements - see inventory Section 8 (now 1:1 with locked v0.2 tokens)
- [x] Primitive substitution map (`SurfaceCard`, `GlassPanel`, `ActionButton`, `UtilityButton`) - see inventory Section 7
- [ ] Before/after reference captures attached per protocol (collected at first PR)
- [x] Token contract gaps closed (5 categories merged + generated reference updated)

---

## 5) Exit Use

This baseline is the "before" state reference for Phase 1 progress reporting and must be updated after each Dashboard reconstruction PR. Token contract v0.2.0 is now the authoritative target for all replacements (no further changes to taxonomy before PR #1).
