# Handbook — Visual QA

_Handbook plan §10 (logo + visual). Status: **verified against the app design
language + logo scanner**._

## Design language

The handbook workspace uses the Employee Journey tokens (ivory canvas, white
surfaces, deep teal structure `#007970`, dark-orange draft accents `#d1571a`,
Montserrat headings / Roboto body, rounded premium cards, neumorphic shadows) —
consistent with Training / Policies / Annual. Callout variants map to the token
palette (warning/danger → orange/oxblood, info → teal, success → green-teal).

## Logo

- One approved asset everywhere: `/assets/logo-careindeed-orange.png` (SHA-256
  `d3286ff3…`, 768×768), rendered only through `<CareIndeedBrand/>`.
- Aspect ratio preserved (height fixed, width auto, object-fit contain) — no
  stretching, no baked shadow/border, no remote dependency, no inline substitute mark.
- Scanner `handbook:verify:logo`: **PASS, 103 files, 0 findings** — guards against
  future drift (unapproved path or inline brand-mark SVG fails the scan).

## Draft treatment

The counsel-review draft watermark is visually distinct (orange, left-accent bar) on
every handbook surface, plus a print watermark and screen-reader text — visually
unmistakable that the document is not effective.

## Pending

Pixel-diff visual regression against `PREVIEW_desktop.png` / `PREVIEW_mobile.png`
(the package's rendered previews) is not automated here.
