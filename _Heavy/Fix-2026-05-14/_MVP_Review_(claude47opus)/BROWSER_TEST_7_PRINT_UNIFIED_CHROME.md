# Browser Test 7 — Unified Print Chrome (Wave 5A — MVP-P1-PRINT-001)

> Status: **DOCUMENTED MANUAL CHECKLIST** (Wave 5A explicitly scopes this as a
> human-driven smoke + visual-diff check; automated Playwright visual regression
> is deferred to a follow-on ticket alongside the FROZEN/PROTECTED print path
> migrations in Wave 5b.)

## What this test validates

Wave 5A landed the canonical print primitives (`PrintFrame`, `printStyles`,
`usePrintTheme`) under `src/policy/components/ui/print/`, migrated the
single FROZEN-file consumer `FormPrintView.tsx` to them, and removed the
`lightColorRemap.ts` band-aid (U-14). PrintFrame is gated by the
`print_unified_chrome` feature flag (default ON) and falls back to a
transparent passthrough when OFF — preserving prior visual chrome on the
migrated page.

This test verifies four invariants:

1. **Migrated path (`/forms/:formId/print`) renders the unified header**
   when the flag is ON (Care Indeed brand stripe + logo + title + meta
   strip + standard footer).
2. **Migrated path falls back cleanly** when the flag is OFF (no unified
   header/footer; FormBody content prints as before; iframe-driven
   `printForm()` call continues to work).
3. **Non-migrated FROZEN paths are unchanged** — `/print/:policyId`
   (PrintPage), `/print/GV-GB-001` (GVGBPrintDocument), and the eCign
   signed-packet preview path render exactly as they did before Wave 5A
   (deferred to Wave 5b, with eCign sign-off).
4. **`lightColorRemap.ts` removal** did not visually regress LibraryPage,
   FormsPage, or MasterControlInventory in Care Indeed light theme
   (canonical `var(--ci-*)` token substitution produces the same accents
   as the deleted band-aid).

## Prerequisites

- Dev server running: `npm run dev`
- Chrome (or Edge — same Chromium engine) — Firefox `body:has()` support
  is also acceptable but PrintFrame uses standard selectors only
- A test user with access to the Forms library (any role above Trainer)
- DevTools open for the screenshot-capture steps

## Section A — `/forms/:formId/print` (the migrated path)

### A.1 — Flag ON (default) — unified chrome appears

1. Confirm `print_unified_chrome` is ON. In DevTools console:
   ```js
   // featureFlags.ts default is ON; verify there is no localStorage override
   localStorage.getItem('pm_feature_flag.print_unified_chrome');
   // should be null OR '"true"'
   ```
2. Navigate to `/forms/CL-FM-001/print` (or any form id from
   `FORMS_DATASET`).
3. **Expected (screen view, before auto-print fires):**
   - The fixed top toolbar (Close + Save to PDF) remains visible
     (`.no-print` class). _Unchanged from prior behavior._
   - Below the toolbar, inside the white paper-card (`.form-frame`), a
     **new Care Indeed brand stripe** (10px teal `#007970`) renders
     across the top.
   - Below the stripe: the gray Care Indeed logo (left, ~40px tall) and
     the form's title rendered as `<h1>` with a teal `FORM` chip next
     to it.
   - Below the title: a meta strip with `ID`, `VERSION`, `DATE` rows
     (from `content.id`, `content.version`, `content.effectiveDate`).
   - The form body (`<FormBody>`) renders below the header.
   - A subtle gray footer ("Care Indeed · Confidential") appears at the
     bottom of the paper-card.
4. **Expected (auto-print):**
   - After ~700 ms, the browser's print dialog opens automatically (same
     delay as before; PrintFrame's `autoPrint={true}` matches the
     prior `useEffect` timer behavior).
   - Cancel the print dialog to inspect on-screen rendering.
5. **Expected (print preview / save-to-PDF):**
   - The toolbar is hidden (`.no-print { display: none !important; }`
     from canonical CSS).
   - The brand stripe, logo, title, meta strip render at the top of
     page 1.
   - Tables wrap correctly with `table-layout: fixed` (Wave 5A retained
     FormPrintView's specialized table rules — column widths do not
     overflow the right margin).
   - Page break behavior on long forms remains correct (no orphaned
     headers, no mid-row breaks where avoidable).
   - The footer renders at the end of the document.
6. **Capture** (screenshot the print preview window): save to
   `Builder/_system/screenshots/wave-5a/form-print-flag-on.png`.

### A.2 — Flag OFF — clean passthrough (rollback handle)

1. Disable the flag via console:
   ```js
   localStorage.setItem('pm_feature_flag.print_unified_chrome', 'false');
   location.reload();
   ```
   _If the project's `getFlag()` reads a different storage mechanism, set
   the flag via that mechanism (e.g. `useFeatureFlagStore.setState({...})`)
   — the goal is just to disable the flag at runtime._
2. Navigate to the same `/forms/CL-FM-001/print`.
3. **Expected:**
   - PrintFrame returns ONLY `{children}` (the `<FormBody>`). The brand
     stripe, logo, title chip, meta strip, and footer are all GONE.
   - The form-frame paper-card chrome (border, padding, shadow) is still
     present (provided by FormPrintView itself, not PrintFrame).
   - Print preview shows the same byte-equivalent layout as the
     pre-Wave-5A version of FormPrintView (modulo the canonical CSS
     additions that arrive even via FormPrintView's own retained
     `<style>` block).
4. **Capture**: save to
   `Builder/_system/screenshots/wave-5a/form-print-flag-off.png`.
5. **Compare**: A.1 vs A.2 should differ ONLY in the presence/absence of
   the unified header + footer. The FormBody content itself should be
   pixel-identical (allowing for minor antialiasing differences).
6. **Reset**: `localStorage.removeItem('pm_feature_flag.print_unified_chrome'); location.reload();`

### A.3 — Iframe-suppression guard preserved

1. Open the Forms library at `/forms` and click any form's Print button
   from a list row. The expected behavior is that `printForm()` (from
   `src/policy/utils/printForm.ts`) creates a hidden iframe pointing to
   `/forms/:id/print` and drives the print dialog from the parent.
2. **Expected:**
   - The print dialog opens ONCE (not twice). PrintFrame's `autoPrint`
     branch checks `window.top !== window.self` and skips the embedded
     timer; the parent frame's `printForm()` triggers the actual print.
   - If the print dialog opens TWICE → REGRESSION. The iframe guard in
     `PrintFrame.tsx` (`useEffect` lines 108-134) is broken.

## Section B — Non-migrated FROZEN paths (must be UNCHANGED)

These print routes were deliberately NOT migrated in Wave 5A. They live
under FROZEN files awaiting Wave 5b. Confirm zero regression.

### B.1 — `/print/:policyId` (PrintPage.tsx — FROZEN)

1. Navigate to `/print/GV-GB-002` (any policy id).
2. **Expected:** Renders exactly as it did pre-Wave-5A. Cover block with
   Care Indeed gray logo, "Corporate Policy Document" title, badges,
   policy title, meta grid, section panels.
3. **Capture**: save to
   `Builder/_system/screenshots/wave-5a/print-policy-after.png` and
   compare to a pre-Wave-5A baseline (if available; otherwise just
   visually confirm no header/footer additions).

### B.2 — `/print/GV-GB-001` (GVGBPrintDocument.tsx — FROZEN)

1. Navigate to `/print/GV-GB-001`.
2. **Expected:** Renders the bespoke GV-GB-001 monograph with its full
   Cover, sections 1-11, page breaks, appendix `AppPrintHeader` strips,
   etc. — exactly as before.
3. **Capture**: save to
   `Builder/_system/screenshots/wave-5a/print-gvgb-after.png`.

### B.3 — eCign signed-packet preview (PROTECTED `buildPrintablePacketHtml`)

1. Sign a form in `FormSigningWorkspace` (any test form that supports
   eCign), wait for the signed-package preview to render in the right
   pane or the packet popup.
2. **Expected:** The packet HTML matches the byte-stable output from
   `buildPrintablePacketHtml` exactly. Care Indeed brand strip at top,
   eCIgn navy/orange certificate, signer/timestamp/cert-id footer.
3. **Critical invariant (Wave 3 ECIGN-002 byte-stability):** If a SHA-256
   hash of the rendered packet HTML differs from a pre-Wave-5A baseline,
   that is a REGRESSION even if visual output looks identical. Wave 5A
   did NOT touch `FormSigningWorkspace.tsx`, `getPrintableFormHtml` in
   `FormViewer.tsx`, or any `ecign/*` file — so the byte stream MUST be
   unchanged. Use the existing artifact-hash comparison harness if you
   have one; otherwise compute a hash of the rendered HTML manually and
   spot-check.

## Section C — U-14 `lightColorRemap.ts` removal — visual smoke

The deleted band-aid was responsible for remapping a small set of hex
literals (`#FFC107`, `#facc15`, `#f59e0b`, `#10b981`, `#06b6d4`,
`#ffffff`) to Care Indeed light-theme accents when `theme ===
'care-indeed-light'`. Wave 5A replaces those calls with canonical
`var(--ci-*)` token substitution.

### C.1 — Care Indeed light theme — Library page accent fidelity

1. Toggle the app to Care Indeed light theme (via the theme switcher; if
   none is exposed, set `<html data-theme="care-indeed-light">` directly
   in DevTools).
2. Navigate to `/library`.
3. **Expected:**
   - Regulatory pill borders/text for `title22`, `42cfr`, `osha` render
     in the Care Indeed CTA orange (`#C74601`) when ACTIVE — same as
     pre-Wave-5A behavior. (Previously delivered by `LIGHT_COLOR_MAP`;
     now delivered by `var(--ci-primary-500)` in light theme.)
   - The `GV` domain button (yellow → orange remap) renders orange when
     active.
   - The `QA` domain button (cyan → teal remap) renders teal
     (`#007970`) when active.
   - The `FN` domain button (emerald → success-green remap) renders
     Care Indeed success green when active.
4. **Capture**: save to
   `Builder/_system/screenshots/wave-5a/library-light-after.png`.

### C.2 — Care Indeed light theme — Forms page accent fidelity

1. While still in Care Indeed light theme, navigate to `/forms`.
2. **Expected:**
   - Domain filter pills + classification filters render the same
     accents as pre-Wave-5A. (Subagent refactored `DOMAINS` /
     `CLASSIFICATION_FILTERS` constants to carry an `accentToken` field
     containing the `var(--ci-*)` string directly.)
3. **Capture**: `Builder/_system/screenshots/wave-5a/forms-light-after.png`.

### C.3 — CI-ION dark theme — accent preservation

1. Toggle back to CI-ION dark theme.
2. Navigate to `/library` and `/forms`.
3. **Expected:** Original hex literals render unchanged (dark theme
   path: `mapColor()` returns the input hex unchanged when `!isLight`).
4. **Capture (optional)**:
   `Builder/_system/screenshots/wave-5a/library-dark-after.png`,
   `Builder/_system/screenshots/wave-5a/forms-dark-after.png`.

## Section D — MasterControlInventory accent regression check

`MasterControlInventory` is OUT OF MVP scope but was a `lightColorRemap`
consumer. Verify zero regression in Care Indeed light theme:

1. Navigate to `/iadministrator` → Master Control Inventory (or whatever
   route surfaces it; the page may be hidden behind a feature toggle).
2. **Expected:**
   - Risk tone chips (HIGH=red, MATERIAL=orange, LOW=teal) render with
     correct Care Indeed light-theme colors.
   - Status tone chips render correctly.
   - Stat cards render with correct accent colors.
3. **Capture (optional)**:
   `Builder/_system/screenshots/wave-5a/mci-light-after.png`.

## Pass/fail rubric

| Section | Pass criterion | Fail action |
|--|--|--|
| A.1 | Unified header/footer renders in print preview | Investigate PrintFrame render path; check `getFlag('print_unified_chrome')` returns `true` |
| A.2 | Flag-off path matches pre-Wave-5A layout | Investigate PrintFrame early-return at line 136-138; ensure transparent passthrough |
| A.3 | Print dialog opens ONCE | Investigate `window.top !== window.self` guard in PrintFrame `useEffect` |
| B.1, B.2 | Non-migrated routes UNCHANGED | If changed → did Wave 5A accidentally touch FROZEN files? `git diff src/policy/pages/PrintPage.tsx src/policy/pages/GVGBPrintDocument.tsx` should be empty |
| B.3 | eCign packet byte-stable | If hash changed → did Wave 5A accidentally touch PROTECTED files? `git diff src/policy/components/FormSigningWorkspace.tsx src/policy/components/FormViewer.tsx` should be empty (modulo unrelated Wave 4 ECIGN-003/004 edits already merged) |
| C.1–C.3 | Library/Forms accents preserved in both themes | Investigate `LIGHT_TOKEN_FOR_LEGACY_HEX` map in LibraryPage / FormsPage `accentToken` definitions |
| D | MCI accents preserved | Investigate MCI's `riskTone`/`statusTone` helper token substitution |

## Deferred to Wave 5b (do NOT exercise in Wave 5A test)

- Migrating `PrintPage.tsx` to `<PrintFrame>` (FROZEN — needs separate
  ticket + orchestrator burn-in)
- Migrating `GVGBPrintDocument.tsx` to `<PrintFrame>` (FROZEN — same)
- Migrating `buildPrintablePacketHtml` in `FormSigningWorkspace.tsx` to
  use `buildCanonicalPrintCss` for its baseline (PROTECTED — needs
  eCign sign-off and a byte-stability re-validation since the change
  affects hashed artifacts)
- Automated Playwright visual regression suite for print routes

## Rollback procedure (instant)

If Wave 5A introduces a print regression in production:

```js
// In any browser console with the deployed app loaded:
localStorage.setItem('pm_feature_flag.print_unified_chrome', 'false');
// All future page loads will render with PrintFrame as a transparent passthrough.
// Migrated pages fall back to their prior visual behavior.
```

For a code-level revert: `git revert <wave-5a-commit-sha>` reverts all
Wave 5A changes including the `lightColorRemap.ts` deletion in one
atomic step. No data, schema, or routing changes were made.
