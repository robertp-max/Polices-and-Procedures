# Wave 14 Visual Debt Report

## Debt Targets

- Mixed spacing rhythm in command strips and toolbar wraps.
- Inconsistent tertiary label styling across surfaces.
- Over-assertive shell atmosphere after Wave 13.
- Minor card/panel cadence mismatch on operational pages.

## Debt Resolved

- Added reusable maturity classes:
  - `ci-maturity-toolbar`
  - `ci-maturity-eyebrow`
  - `ci-maturity-caption`
  - `ci-maturity-section`
- Applied maturity framing to:
  - Dashboard action strip and storyline rail
  - Evidence command strip + filter bar rhythm
  - Audit storyline rail + health strip framing
  - My Tasks header and hero command section
  - Calendar timeline header and caption rhythm
- Tuned shell atmosphere in `CommandCenterLayout` and `index.css`:
  - reduced overlay opacity
  - reduced topbar shadow intensity
  - tightened nav cadence without losing hierarchy

## Before/After Capture Pairs

- Dashboard:
  - Before: `Builder/_system/screenshots/wave-13-executive-wow/wow-desktop-care-indeed-light-light-_dashboard.png`
  - After: `Builder/_system/screenshots/wave-14-product-maturity/maturity-desktop-care-indeed-light-light-_dashboard.png`
- Evidence:
  - Before: `Builder/_system/screenshots/wave-13-executive-wow/wow-desktop-care-indeed-light-light-_evidence.png`
  - After: `Builder/_system/screenshots/wave-14-product-maturity/maturity-desktop-care-indeed-light-light-_evidence.png`
- Audit:
  - Before: `Builder/_system/screenshots/wave-13-executive-wow/wow-desktop-care-indeed-light-light-_audit.png`
  - After: `Builder/_system/screenshots/wave-14-product-maturity/maturity-desktop-care-indeed-light-light-_audit.png`

## Remaining Polish Debt

- Account-menu micro-spacing parity between themes can be tightened one more pass.
- Very wide desktop shell subnav typography can be slightly normalized.
- Evidence long-row visual scanning can be improved with optional row density variants (future pass).
