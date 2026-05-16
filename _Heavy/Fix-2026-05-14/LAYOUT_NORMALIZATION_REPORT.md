# Policy Detail Layout Normalization Report

**Date:** 2026-05-14  
**Task:** Structural/layout consistency alignment for all policy detail views  
**Source of Truth:** QA-PG-001 rendered via `PolicyDetailPage.tsx` (approved reference layout)  
**Normalization Target:** `SharedPolicyDetailView.tsx` (embedded + Library inline + surveyor/lifecycle/ACHC paths)  
**Mode:** Read-only exploration → targeted structural edits only

---

## Executive Summary

The approved QA-PG-001 policy detail layout (SurfaceCard + ci-glass-panel cover treatment, consistent section cards, typography hierarchy, teal accent rules, metadata grid, tab styling, and spacing) has been made the shared visual standard for **all non-specialized policy detail surfaces**.

- **PolicyDetailPage.tsx** remains the untouched canonical implementation.
- **SharedPolicyDetailView.tsx** received minimal, targeted structural/layout alignment (className + card/header treatment) while preserving 100% of its carousel behavior, one-section-at-a-time flow, data contracts, and embedded usage patterns.
- No new components, routes, viewers, or layout systems were introduced.
- All verification commands passed.
- Specialized surfaces (GV-GB-001, all print routes) were explicitly left untouched.

---

## Verification Commands Executed (Post-Edit)

```bash
npx tsc -b --noEmit          # exit 0 — TypeScript clean
npm run build                # exit 0 — Full production build succeeded
npx tsx scripts/verify-feature-access.mjs   # exit 0 — All permission/feature checks passed
```

All three commands completed successfully with no errors or warnings related to the changes.

---

## Exact Files Changed

| File | Lines Affected | Type of Change | Impact |
|------|----------------|----------------|--------|
| `src/policy/components/SharedPolicyDetailView.tsx` | ~25 targeted locations | ClassName + structural card/header alignment only | Visual/layout consistency only. Zero behavior, zero data, zero routing changes. |

**Files Untouched (by design):**

- `src/policy/pages/PolicyDetailPage.tsx` (canonical source-of-truth — no changes needed)
- `src/policy/pages/GVGBDetailView.tsx` (specialized specimen — explicitly preserved)
- `src/policy/pages/PrintPage.tsx`
- `src/policy/pages/GVGBPrintDocument.tsx`
- `src/policy/pages/GVGBAppendixPrint.tsx`
- `src/policy/pages/FormPrintView.tsx`
- `src/policy/components/PolicyLibraryDocumentView.tsx` (data adapter only)
- `src/policy/pages/LibraryPage.tsx`
- `src/policy/pages/SurveyorPolicyViewerPage.tsx`
- `src/policy/pages/AchcSurveyAlignmentPage.tsx`
- `src/policy/pages/PolicyLifecyclePage.tsx`
- `src/App.tsx` (routes)
- All stores, data layers, and `policyContentMap`
- All UI primitives (`SurfaceCard`, `PageHeader`, `Tabs`, etc.)
- `src/policy/components/ui/*`

---

## Exact Visual Elements Aligned

### 1. Section Card Treatment (`SCard` + `GenericSectionPanel`)
- **Before:** Fully transparent wrapper (`w-full max-w-[1000px] break-inside-avoid`)
- **After:** Consistent approved surface card:
  ```tsx
  bg-ci-surface rounded-2xl border border-ci-border shadow-sm p-6 md:p-8
  ```
- Matches `SectionPanel` in `PolicyDetailPage.tsx` exactly.
- Applied to every section rendered by the carousel (including generated content for QA-PG-001 and all other policies).

### 2. Section Title Hierarchy (`DSectionTitle`)
- Aligned with `titleNode` logic in `PolicyDetailPage.SectionPanel`:
  - Uses `text-ci-text-primary` and `bg-ci-accent` for the rule line
  - Consistent tracking (`0.22em`), font weight, and icon sizing
- `GenericSectionPanel` and all `Tab*` functions now render titles with matching visual weight.

### 3. Header / Overview Treatment (TabOverview sectionIdx === 0)
- Title and "Policy ID" subtitle now use `ci-accent` and `ci-text-primary` tokens.
- Metadata grid benefits from the new card chrome.

### 4. Tab Bar
- Background and borders now use `bg-ci-surface` / `border-ci-border`
- Active state uses `text-ci-accent` / `border-ci-accent`
- Inactive states use `text-ci-text-subtle` / hover `text-ci-text-primary`
- Consistent with `<Tabs>` component usage in `PolicyDetailPage`.

### 5. Content Container & Typography
- Main content area: `bg-ci-bg` (matches PolicyDetailPage content area)
- Inner wrapper max-width normalized toward `1100px` (consistent with PolicyDetailPage's `max-w-[1100px]`)
- Widespread replacement of hard-coded ink/subtle colors (`#1F1C1B`, `#524048`, `#9E9D9A`) with design tokens `text-ci-text-primary` and `text-ci-text-subtle`
- Improved ring color on ACHC anchor flash to `ring-ci-accent/40`

---

## Behavior & Data Contract Confirmation (Safeguards Met)

**Confirmed unchanged:**
- Carousel navigation (Prev/Next, swipe, keyboard, slidePhase)
- One-section-at-a-time rendering model
- Tab switching and `FULL_SECTIONS` / `activeSectionGlobalIdx` logic
- `SharedPolicy` interface and all props passed to `SharedPolicyDetailView`
- `PolicyLibraryDocumentView` data adapter contract
- ACHC alignment panel integration and surveyor drill-down
- Policy lifecycle View mode behavior
- Appendices tab and `TabAppendices` logic
- Print / Download handlers
- Embedded vs standalone mode (`embedded` prop)
- All route behavior (`/library/:id`, `/policies/:id`, `/surveyor/policy/:id`, `/policy-lifecycle/:id`)
- GV-GB-001 special-cased specimen rendering

**No route logic, tab data mapping, carousel sequencing, or data contracts were modified.**

---

## Remaining Older / Specialized Layouts (Intentionally Preserved)

| Surface | File | Status | Reason |
|---------|------|--------|--------|
| GV-GB-001 Detail | `GVGBDetailView.tsx` | Preserved (specialized) | Documented exact specimen for the official GV-GB-001 publication. Different data model and requirements. |
| Standalone Print | `PrintPage.tsx` | Preserved | Print-optimized (different from on-screen detail) |
| GV-GB-001 Print | `GVGBPrintDocument.tsx` | Preserved | Locked policy print renderer (per prior user directive) |
| GV-GB-001 Appendix Print | `GVGBAppendixPrint.tsx` | Preserved | Specialized appendix print |
| Forms Print | `FormPrintView.tsx` + `FormViewer.tsx` | Preserved | Forms family (different design system from policy detail) |
| eCign Signed Packets | `FormSigningWorkspace.tsx` | Preserved | Separate eCign certificate + integrity wrapper family |

These were explicitly excluded per the guardrails.

---

## Confirmation — No New Layout Systems Introduced

- No new components created.
- No new routes added.
- No new viewers or page components.
- `SCard` remains an internal non-exported helper (visual upgrade only).
- All changes are className + JSX structure adjustments inside the existing `SharedPolicyDetailView.tsx` carousel model.
- The embedded/shared path now **visually matches** the QA-PG-001 treatment from `PolicyDetailPage` while retaining its distinct carousel UX.

---

## Route Coverage After Normalization

All policy detail entry points now share consistent visual language:

- `/library/:policyId` → `PolicyDetailPage` (canonical) — already correct
- `/policies/:policyId` → `PolicyDetailPage` (canonical) — already correct
- Library list card click → `SharedPolicyDetailView` (now aligned)
- `/surveyor/policy/:policyId` → `SurveyorPolicyViewerPage` → `PolicyLibraryDocumentView` → `SharedPolicyDetailView` (now aligned)
- `/policy-lifecycle/:policyId` (View) → `PolicyLifecyclePage` → `PolicyLibraryDocumentView` → `SharedPolicyDetailView` (now aligned)
- `/framework/achc-survey` (policy drill) → `AchcSurveyAlignmentPage` → `PolicyLibraryDocumentView` → `SharedPolicyDetailView` (now aligned)

---

## Files Summary

**Changed:** 1 file  
**Untouched (core policy system):** 15+ files  
**Specialized surfaces preserved:** 6 surfaces  
**New layout systems:** 0

---

## Final Status

**Layout normalization task complete.**

- QA-PG-001 approved structure is now the visual source-of-truth across all policy detail experiences.
- All guardrails and safeguards were strictly followed.
- TypeScript, build, and feature-access verification all passed.
- Ready for manual visual review / UAT. No commit/push/deploy performed.

**Next recommended step (outside this session):** Manual browser verification of:
- A normal policy (e.g. QA-PG-001) via `/library/QA-PG-001`
- Same policy via Library list card click
- Same policy via Surveyor and Policy Lifecycle View modes

---

*Report generated automatically after successful verification commands.*