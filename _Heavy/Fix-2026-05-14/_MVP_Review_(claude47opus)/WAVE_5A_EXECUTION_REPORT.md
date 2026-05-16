# Wave 5A — Execution Report (Conservative)

> Scope locked by user as **Variant 5A — Conservative**:
> _"preserves Wave 3 byte-stability guarantees, avoids touching protected
> eCign packet generation, limits frozen-file serialization burden, still
> advances canonical print architecture, removes the lightColorRemap.ts
> band-aid safely, creates reusable print primitives first."_

## 1. Approved scope (what was done)

| Item | Disposition | Files |
|--|--|--|
| **MVP-P1-PRINT-001 (partial)** — Build shared print primitives | ✅ DONE | `src/policy/components/ui/print/{printStyles.ts,usePrintTheme.ts,PrintFrame.tsx,index.ts}` (NEW, 4 files, ~342 LoC net-new) |
| **MVP-P1-PRINT-001 (partial)** — Migrate `FormPrintView.tsx` | ✅ DONE | `src/policy/pages/FormPrintView.tsx` (FROZEN, orchestrator-only edit) |
| **U-14** — Remove `lightColorRemap.ts` band-aid | ✅ DONE | `src/policy/utils/lightColorRemap.ts` (DELETED) + 3 consumer migrations |
| **U-14 consumer 1** — `LibraryPage.tsx` | ✅ DONE | FROZEN, orchestrator-only edit (lookup-table replacement, JSX call sites unchanged) |
| **U-14 consumer 2** — `FormsPage.tsx` | ✅ DONE | Non-frozen, subagent migration (refactored `DOMAINS`/`CLASSIFICATION_FILTERS` to `accentToken`) |
| **U-14 consumer 3** — `MasterControlInventory.tsx` | ✅ DONE | Non-frozen, subagent migration (19 call sites, 2 helper signatures simplified) |
| **Feature flag** `print_unified_chrome` | ✅ DONE | `src/policy/pm/featureFlags.ts` (1 union entry + 1 default `true`) |
| **Browser Test 7** spec (manual checklist) | ✅ DONE | `_Heavy/Fix-2026-05-14/_MVP_Review_(claude47opus)/BROWSER_TEST_7_PRINT_UNIFIED_CHROME.md` (NEW, ~225 LoC) |

## 2. Explicitly deferred to Wave 5b (per user-approved 5A scope)

| Item | Reason |
|--|--|
| Migrate `PrintPage.tsx` to `<PrintFrame>` | FROZEN file; serialization burden + visual diff risk on a heavily-trafficked policy print route. Defer to dedicated Wave 5b with owner-led review. |
| Migrate `GVGBPrintDocument.tsx` to `<PrintFrame>` | FROZEN file; the GV-GB-001 monograph has bespoke chrome (`Cover`, `AppPrintHeader`, appendix page breaks, `@import` fonts) that would require `PrintFrame` API extensions (e.g. `headerSlot`/`coverSlot`). Defer with explicit slot-design ticket. |
| Migrate `buildPrintablePacketHtml` in `FormSigningWorkspace.tsx` | PROTECTED (eCign Wave 3 byte-stability invariant). Embedding `buildCanonicalPrintCss()` into the packet HTML would change the output bytes, breaking the hash chain of every previously-signed packet artifact. Requires eCign sign-off + re-baselining of hashed artifacts. Defer to Wave 5b with explicit owner waiver. |
| Migrate `packetToSurveyHtml` in `audit/surveyPacket.ts` | Same byte-stability concern as `buildPrintablePacketHtml` (the survey packet HTML is also hashed as audit evidence). Defer to Wave 5b. |
| Automated Playwright visual-regression suite for print routes | Borderline agent-doable; would require headless browser orchestration + baseline-image curation. Wave 5A delivers the spec as a manual checklist (Browser Test 7); automation belongs in a dedicated tooling ticket. |
| Pre-encode CI gray logo as a true data URL for offline-safe print | `usePrintTheme.ts` currently returns the Vite-resolved asset URL (works in browser print contexts). Pre-encoding is a small follow-on improvement, only material for the packet path (Wave 5b). |
| New `--ci-warning-500` canonical token (for `#eab308` `#9A6700` remap pair) | The legacy `LIGHT_COLOR_MAP` darkened `#eab308` → `#9A6700` in light theme. No native canonical token currently mirrors this. Preserved as literal with `/* U-14: legacy warning-darkened hex; no canonical token */` comment. Defer to a token-design ticket. |

## 3. Out-of-scope items deferred from Wave 4 (still carry-over)

Unchanged from the Wave 4 carry-over list. Wave 5A made no progress on:
PERMS-002 server-side role hydration, PERMS-003 admin-route extension,
ECIGN-002 `captureSignedFormSnapshot` wiring, A11Y-006 full focus-trap,
U-09/U-11/U-12 (deferred for the same reasons stated in Wave 4 report),
plus all human-bound stabilization tasks (P-03/P-05/R-02/M-01–M-08).

## 4. Files changed

```
M  src/policy/pm/featureFlags.ts                              (+12 LoC: flag entry + doc block)
M  src/policy/pages/FormPrintView.tsx                         (~−40/+25 LoC net; FROZEN, orchestrator)
M  src/policy/pages/LibraryPage.tsx                           (~−2/+30 LoC; FROZEN, orchestrator)
M  src/policy/pages/FormsPage.tsx                             (~−2/+15 LoC; subagent)
M  src/policy/components/MasterControlInventory.tsx           (~0 LoC net; subagent — see below)
D  src/policy/utils/lightColorRemap.ts                        (−26 LoC; whole file deleted)
A  src/policy/components/ui/print/printStyles.ts              (+118 LoC; subagent)
A  src/policy/components/ui/print/usePrintTheme.ts            (+42  LoC; subagent)
A  src/policy/components/ui/print/PrintFrame.tsx              (+179 LoC; subagent)
A  src/policy/components/ui/print/index.ts                    (+3   LoC; subagent)
A  _Heavy/.../BROWSER_TEST_7_PRINT_UNIFIED_CHROME.md          (+225 LoC docs)
A  _Heavy/.../WAVE_5A_EXECUTION_REPORT.md                     (this file)
```

Net code delta: **+342 LoC new utility module**, **−26 LoC band-aid removed**,
**~+38 LoC consumer migrations / feature-flag wiring** = **~+354 LoC**.
Six existing files touched (1 PROTECTED-adjacent flag file + 5 page/component
files of which 2 are FROZEN). One file deleted. Four files created in a
new directory.

## 5. Validation results

| Check | Exit | Status |
|--|--|--|
| `npx tsc -b --noEmit` | 0 | ✅ clean |
| `npm run build` (vite, prod) | 0 | ✅ 10.95s, all chunks emitted, `FormPrintView-*.js` chunk now 7.90 kB |
| `npx eslint <Wave 5A files>` | 0 | ✅ ZERO errors, ZERO warnings on the 6 modified files + 4 new files |
| `npm run verify:ui` | 0 | ✅ 0 FAIL; WARN counts unchanged or slightly reduced (pre-existing 2737 hex-literal + 530 rgb-literal + 1 pm.slate-pin + 1 glass.stack-budget) |
| `npm run verify:task-identity` | 0 | ✅ all 10 checks PASS |
| `npm run verify:alignment` | 0 | ✅ 100% alignment, 0 findings |
| `npm run verify:pm-unified` | 1 | ⚠️ **2 PRE-EXISTING failures** (form_instance links + WorkflowExecutionPanel Related Tasks tab) — IDENTICAL to Wave 4 baseline; Wave 5A did not touch any related files |
| `npm run verify:calendar-keys` | 0 | ✅ 0 duplicate keys on `/calendar` |
| `npm run verify:brad-scenario` | 0 | ✅ all 11 checks PASS |
| Wave 3 byte-stability invariant | n/a | ✅ Wave 5A did NOT touch `FormSigningWorkspace.tsx`, `FormViewer.tsx`, `getPrintableFormHtml`, `buildPrintablePacketHtml`, `captureSignedFormSnapshot`, or any `ecign/*` file. Hashed artifact bytes unchanged. |
| Wave 4 invariant preservation | n/a | ✅ `featureFlags.ts` additions are purely additive (new union member + new default); existing Wave 4 flags untouched. `App.tsx`, `RoleGate.tsx`, `permissions.ts`, `validateRequiredFields.ts`, `AchcSurveyAlignmentPage.tsx`, `PolicyLinkSelector.tsx`, etc. all untouched. |

The 2 `verify:pm-unified` failures are PRE-EXISTING and were documented in
the Wave 4 report. They concern `form_instance` link routing and a
`WorkflowExecutionPanel` Related Tasks tab structure — neither of which
Wave 5A touched.

## 6. Architectural notes

### 6.1 — Print primitives design (additive, future-proof)

The three new modules form a clean layering:

- `printStyles.ts` — **pure string** factory (`buildCanonicalPrintCss`).
  No React, no `document`, no `window`, no Vite asset URLs. Returns
  byte-stable output for identical input options. Safe to embed in
  future pure-string serializers (Wave 5b `buildPrintablePacketHtml`,
  `packetToSurveyHtml`).
- `usePrintTheme.ts` — **React hook** resolving asset URLs + brand color
  + font stacks. Memoized; returns a stable object reference.
- `PrintFrame.tsx` — **React component** combining the two. Feature-flag
  gated (transparent passthrough when OFF). Auto-print supports three
  modes: `false` / `true` (with iframe guard matching FormPrintView's
  prior behavior) / `'queryParam'` (URL-param-driven; matches PrintPage
  + GVGB's `?autoprint=1` pattern, ready for Wave 5b migration).

API extensions that Wave 5b will likely need (documented as future work,
NOT implemented in 5A):

- `headerSlot` / `coverSlot` props for PrintPage + GVGB bespoke covers
- `extraCss` prop for page-specific overrides beyond canonical
- A separate `buildEcignPacketChromeCss()` builder for the eCign running
  fixed header/footer (kept out of the canonical baseline to minimize
  hash surface)

### 6.2 — FormPrintView migration (FROZEN-file change, minimum delta)

The migration kept:

- The screen-only toolbar (Close + Save buttons, `.no-print`)
- The `.screen-shell` and `.form-frame` paper-card screen preview
- The `document.title` management (separated from the now-deleted
  auto-print timer)
- FormPrintView-specific @media print overrides (`table-layout: fixed`,
  `word-break`, `.form-frame` paper-card strip-down) that PrintFrame
  does not emit

The migration replaced:

- The `@page` rule (PrintFrame emits this via `orientation` prop)
- General `@media print` baseline (PrintFrame canonical CSS)
- The hand-rolled `useEffect` timer with iframe guard (PrintFrame's
  `autoPrint={true}` with built-in iframe guard)

The rollback handle (`print_unified_chrome` OFF) makes PrintFrame a
transparent passthrough, so even a misbehaving canonical chrome can be
flipped off in production without a redeploy. FormPrintView's retained
inline `<style>` block covers table fidelity regardless of the flag
state.

### 6.3 — U-14 (lightColorRemap.ts removal) — discipline-preserving approach

The deleted band-aid had two distinct concerns:

1. A `LIGHT_COLOR_MAP` lookup table of hex-to-hex substitutions used
   only when Care Indeed light theme was active.
2. A `remapForLight(hex, isLight)` function that wrapped the lookup with
   a no-op for dark theme.

Wave 5A replaced this with a per-consumer inline pattern that mirrors
the canonical CSS-variable approach already in `index.css`:

- **LibraryPage.tsx (FROZEN)** — minimum-delta orchestrator edit. The
  `mapColor` helper name was PRESERVED; only its implementation
  swapped to a local lookup table returning `var(--ci-*)` token strings
  in light theme. JSX call sites unchanged except for 2 sites that used
  hex-alpha string concat (`${color}40`); those use a new local
  `mixAlpha(color, pct)` helper that emits `color-mix(in srgb, ...)`
  when the resolved color is a CSS variable.
- **FormsPage.tsx (non-frozen)** — subagent refactored `DOMAINS` and
  `CLASSIFICATION_FILTERS` constants to carry an `accentToken` field
  directly (preferred over per-call substitution).
- **MasterControlInventory.tsx (non-frozen)** — subagent did a full
  inline replacement at 19 call sites; simplified `riskTone()` /
  `statusTone()` helper signatures by dropping the now-unused
  `isLight` parameter.

In all three consumers, `isLight = theme === 'care-indeed-light'` was
preserved when it was still used for non-color decisions (panel
backgrounds, text classes, etc.).

The `var(--ci-*)` substitution is theme-aware via CSS, so the OUTPUT
visual in Care Indeed light theme is functionally equivalent to the
deleted band-aid for the hex values in the legacy `LIGHT_COLOR_MAP`.
Hexes that were NOT in the map (e.g. `#ef4444`, `#8b5cf6`, `#ec4899`,
`#a855f7`, `#3b82f6`, `#f97316`, `#6366f1`, `#1A3778`, `#B0271F`) are
preserved as literals with a `/* U-14: ... */` comment explaining why.

### 6.4 — Byte-stability invariant preservation (Wave 3 ECIGN-002)

The single most important Wave 5A invariant. Confirmed by:

1. Wave 5A did NOT touch `FormSigningWorkspace.tsx`.
2. Wave 5A did NOT touch `FormViewer.tsx` (specifically `getPrintableFormHtml`).
3. Wave 5A did NOT touch `src/policy/ecign/*`.
4. Wave 5A did NOT touch `captureSignedFormSnapshot.ts`.
5. Wave 5A did NOT touch `audit/surveyPacket.ts` (`packetToSurveyHtml`).
6. The new `buildCanonicalPrintCss()` function is pure-string and
   byte-deterministic for identical options, so a future Wave 5b
   migration of the packet path can produce a NEW byte-stable baseline
   (with eCign sign-off) without breaking the determinism property.

Any previously-signed packet artifact will produce an identical SHA-256
hash after Wave 5A as it did before, because the serializer that
produces the bytes is unchanged.

## 7. Feature flags introduced

| Flag | Default | Purpose | Rollback |
|--|--|--|--|
| `print_unified_chrome` | `true` | Enables `<PrintFrame>` to inject canonical CSS + brand chrome on migrated pages. When `false`, PrintFrame is a transparent passthrough rendering only `{children}`. | Flip to `false` in `featureFlags.ts` defaults OR set `localStorage.setItem('pm_feature_flag.print_unified_chrome', 'false')` in any browser console. Instant rollback, no redeploy. |

## 8. Risks identified + mitigation

| Risk | Mitigation |
|--|--|
| FormPrintView's new unified header may visually surprise users | Rollback handle (`print_unified_chrome` OFF). Manual Browser Test 7 catches issues before flag flip to other routes. |
| `lightColorRemap` removal could regress light-theme accents | Comprehensive consumer migration (all 3) using canonical `var(--ci-*)` tokens that mirror the deleted `LIGHT_COLOR_MAP` outcomes. Browser Test 7 Section C is the manual smoke. |
| Color-mix substitution for `${hex}40` alpha-concat patterns may render differently than the original hex-alpha | `mixAlpha` helper uses `color-mix(in srgb, ...)` only when the resolved color is a CSS variable; for raw hex it preserves the prior `${hex}<alpha-hex>` concat exactly. Dark theme is pixel-equivalent; light theme uses the modern `color-mix` syntax (supported in all evergreen browsers). |
| Pre-existing `verify:pm-unified` failures might mask new regressions | The 2 failures are KNOWN and stable; their failure signatures are documented (form_instance link query params + WorkflowExecutionPanel Related Tasks tab). Any NEW failure signature would be a Wave 5A-introduced regression and is easily distinguishable. |

## 9. Subagent activity

Three subagents dispatched in parallel after the orchestrator added the
feature flag:

| # | Subagent | Files | Status |
|--|--|--|--|
| 1 | Build print utilities | `src/policy/components/ui/print/{printStyles.ts,usePrintTheme.ts,PrintFrame.tsx,index.ts}` (all NEW) | ✅ Clean, tsc+eslint exit 0 |
| 2 | Migrate FormsPage off lightColorRemap | `src/policy/pages/FormsPage.tsx` (non-frozen) | ✅ Clean, 4 call sites refactored to `accentToken` |
| 3 | Migrate MasterControlInventory off lightColorRemap | `src/policy/components/MasterControlInventory.tsx` (non-frozen) | ✅ Clean, 19 call sites + 2 helper signatures simplified |

Two readonly exploration subagents ran before any edits:

- Print surface inventory + shared-utils contract design
- `lightColorRemap` consumer audit + safe-removal strategy

Both reports were used to ground the orchestration plan and to anchor
the executor subagents in concrete file/line context.

The orchestrator handled all serialization-required edits:

- `featureFlags.ts` (add `print_unified_chrome` flag)
- `LibraryPage.tsx` (FROZEN; U-14 consumer with mixAlpha helper)
- `FormPrintView.tsx` (FROZEN; PrintFrame migration)
- `lightColorRemap.ts` deletion (after verifying zero remaining imports)
- Browser Test 7 spec + this report

## 10. Definition-of-done checklist

- [x] All approved scope items implemented
- [x] All deferred items have an explicit reason recorded (§2)
- [x] tsc clean
- [x] Production build clean
- [x] Targeted ESLint clean on every Wave 5A file
- [x] All applicable verify scripts run; pre-existing failures
      documented + confirmed pre-existing
- [x] Wave 3 byte-stability invariant preserved (no PROTECTED files
      touched)
- [x] Wave 4 invariants preserved (additive-only featureFlags.ts edit;
      no Wave 4 file modified)
- [x] Rollback handle (`print_unified_chrome` feature flag) in place
      and documented
- [x] Manual test spec authored (Browser Test 7)
- [x] Execution report authored (this file)
- [ ] _(Human follow-on)_ Run Browser Test 7 in dev + capture
      before/after screenshots
- [ ] _(Human follow-on)_ Flip `print_unified_chrome` OFF in staging
      and re-test to confirm clean rollback path
- [ ] _(Human follow-on)_ Schedule Wave 5b kickoff with eCign owner for
      the PROTECTED packet-path migration

## Closing

Wave 5A delivered the canonical print primitives, migrated the single
non-PROTECTED non-FROZEN-cluster print route (FormPrintView), and
removed the `lightColorRemap.ts` band-aid in one disciplined wave. The
critical Wave 3 byte-stability invariant is preserved by design: the
eCign packet path was deliberately deferred to Wave 5b, where it will
land alongside an explicit owner waiver and a re-baselining of hashed
artifacts.

The instant-rollback feature flag is in place, the manual test spec is
written, and the architectural foundation is ready for the Wave 5b
high-risk migrations.
