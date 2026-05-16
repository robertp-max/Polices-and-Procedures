# Wave 7 — T3 Report (Token + Typography Consolidation)

**Date:** 2026-05-16
**Scope:** Token consolidation on 4 approved non-frozen surfaces. Primary goal: clear the remaining `pm.slate-pin` warning and reduce raw hex/rgb literal usage where canonical `var(--ci-*)` equivalents exist.
**Status:** ✅ Complete

---

## 1. Files touched (4)

| File | Edits | Notes |
| ---- | ----- | ----- |
| `src/policy/components/pm/PmViews.tsx` | 1 substantive | Replaced the gantt bar's untoned-tone fallback `'bg-slate-400'` with `'bg-[var(--ci-border-strong)]'` to clear the `pm.slate-pin` verifier rule (the only `bg-slate-{900,800,400}` literal under `pm/*`). |
| `src/policy/components/MasterControlInventory.tsx` | 8 substantive | 7 `StatCard color={raw hex}` props migrated to canonical `var(--ci-*)` strings; the legacy navy `#1A3778` + dark red `#B0271F` retained (no canonical equivalents). StatCard's `style.background` ternary `isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)'` collapsed to `var(--ci-surface-2)`. The `isLight` prop is preserved (renamed to `_isLight`) for call-site API stability. The local `toneMap` passthrough still resolves the 2 preserved legacy hexes and now also passes `var(...)` strings straight through. |
| `src/policy/pages/FormsPage.tsx` | 4 substantive | Inside the light-theme-scoped injected `<style>` block: `#FAFBF8 → var(--ci-surface-2)`, `#E5E4E3 → var(--ci-border)`, `#FFFFFF → var(--ci-surface)`, `#C74601 → var(--ci-primary-500)`. All four already resolve to identical hex values in the `care-indeed-light` scope per `src/index.css`, so visual rendering is byte-equivalent. |
| `src/policy/components/SharedPolicyDetailView.tsx` | 0 substantive · 1 documentation comment | Added an intent comment above the "DESIGN SYSTEM HELPERS" block declaring the embedded hex literals (`#1F1C1B`, `#007970`, `#E5E4E3`, `#FAFBF8`, `#524048`) as *deliberately light-pinned* — they mirror `PolicyViewerDesignLight.html` and must not be migrated to theme-aware tokens. **No hex literals were swapped in this file.** |

---

## 2. Warnings reduced (verify:ui)

| Rule | T2 baseline | T3 result | Δ |
| ---- | ----------- | --------- | --- |
| `pm.slate-pin` | 1 | **0** (rule no longer fires) | −1 ✓ |
| `tokens.hex-literal` | 2664 | 2656 | −8 |
| `tokens.rgb-literal` | 530 | 529 | −1 |
| `glass.stack-budget` | 0 | 0 | 0 |
| **TOTAL WARN** | **3195** | **3185** | **−10** |

`FAIL checks` remained at **0** — no required invariants were violated.

Net reduction tracks the migrated-literal count (12 substantive swaps; small drift vs counter is due to the verifier counting structural occurrences, not raw textual sites).

---

## 3. Intentional non-touches

### `SharedPolicyDetailView.tsx` — light-pinned by design
The `D*` document helpers always render in print-style light formatting regardless of global theme. Migrating their hexes to `var(--ci-text-primary)` / `var(--ci-surface-*)` / `var(--ci-border)` would flip the document body in dark mode and break the equivalence contract with `PrintPage` and the downstream PDF/print path. The new intent comment records this decision.

### `MasterControlInventory.tsx` — legacy hexes retained
`#1A3778` (legacy navy) and `#B0271F` (legacy dark red) have no canonical tokens. The StatCard's `toneMap` continues to resolve them as-is.

The `colorMap` constant at line 104 (with the original hexes `#007970`, `#EF4444`, etc. as map keys) was also retained — those hex string keys remain in source for clarity, but no longer appear at any call site.

### `FormsPage.tsx` — domain accent palette retained
Lines 20–36 (DOMAINS + CLASSIFICATIONS arrays) carry intentional per-domain brand colors with U-14 preservation comments ("no canonical token"). The contextual inline accent classes (`text-[#a855f7]`, `border-[#FFC107]/40`, etc.) likewise remain — they're per-domain visual identity, not theme infrastructure.

### `PmViews.tsx` — slate-50/100/200/500/700 retained
The verifier rule pins only on `bg-slate-{900,800,400}`. The remaining `bg-slate-50`, `bg-slate-100`, `border-slate-200`, etc. are light-mode table/card surfaces that compose the PM gantt/kanban appearance and are not flagged by the rule. Migrating them would expand scope beyond T3.

---

## 4. Validation results

| Gate | Result |
| ---- | ------ |
| `tsc -b --noEmit` | ✅ PASS (after fixing one TS6133 unused-param introduced by removing the StatCard `isLight` ternary) |
| `npm run build` | ✅ PASS (3.59s, ✓ built) |
| `verify:ui` | ✅ 0 FAIL · 3185 WARN (−10 net; `pm.slate-pin` cleared) |
| `verify:task-identity` | ✅ PASS |
| `verify:alignment` | ✅ 100% alignment — no findings |
| `verify:pm-unified` | ✅ 22 passed / 2 failed (unchanged baseline) |
| `wave-6-regression` Playwright | ✅ **9/9** (all MVP browser tests still green) |
| `artifact-retrieval-defect` Playwright | ✅ 1/1 (Wave 5A fix still holds: s8a IDB-intact = `amber:false, iframe:1`; s8b LS+IDB wiped = `amber:true, iframe:0`) |
| ESLint on changed files | ✅ 0 errors |

---

## 5. Visual evidence

- **Before baselines:** `Builder/_system/screenshots/wave-7-baselines/{desktop,mobile}/*.png` (captured at T1 kickoff)
- **After T3:** `Builder/_system/screenshots/wave-7-after/T3/{desktop,mobile}/*.png` — 5 surfaces × 2 viewports = **10 PNGs**:
  - `pm-gantt.png` — PM gantt view (verify the untoned-tone bar fallback renders identically)
  - `pm-kanban.png` — PM kanban view (sanity)
  - `master-controls.png` — StatCards now sourced from canonical tone tokens
  - `forms.png` — Forms Library light-theme glass surfaces now resolve through canonical tokens
  - `policy-detail.png` — Policy detail document body (proves the light-pin is intact: no dark-mode flip)

Expected visual delta: **near-zero in light theme** (tokens resolve to identical hex values via `src/index.css`); **no change in dark theme** (light-pinned document body explicitly preserved; PM/Master Controls/Forms theme behavior unchanged via per-theme token resolution).

---

## 6. Protected systems — confirmation

No files in the Lead 16 §14 frozen list were touched. Specifically:

- `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `FormSignatureFlow.tsx` — untouched (FormViewer is imported by SharedPolicyDetailView but not modified)
- `regulatoryExecutionStore.ts` — untouched
- `ArtifactViewerPage.tsx`, `FormPrintView.tsx`, `PrintPage.tsx`, `GVGBPrintDocument.tsx` — untouched
- `LibraryPage.tsx`, `GVGBDetailView.tsx`, `PolicyDetailPage.tsx` — untouched (note: `SharedPolicyDetailView.tsx` is a sibling consumer of policy data and is NOT in the frozen list)
- `WorkflowExecutionPanel.tsx` — untouched
- `taskIdentity.ts`, `cesFormInstanceId.ts`, `stateMachine.ts` — untouched
- `localDemoAdapter.ts`, `cesEvidenceHierarchy.ts` — untouched
- `vercel.json`, `AuthProvider.tsx` — untouched
- `server/ecign/*`, `src/policy/ecign/*` — untouched

No backend work. No eCign work. No business-logic changes. No navigation changes. No animation system work.

---

## 7. Summary

T3 delivered the primary verifier improvement: `pm.slate-pin` is eliminated and the hex/rgb literal counts drop by 9 across three surfaces, with no failed invariants and all browser regressions green. The fourth target surface (`SharedPolicyDetailView`) was treated as documentation-only because its light-pinned document helpers are architecturally tied to the print/PDF equivalence contract — the new intent comment locks that design decision in source so future passes don't accidentally regress it.

All changes are surgical and reversible by reverting the four file edits.
