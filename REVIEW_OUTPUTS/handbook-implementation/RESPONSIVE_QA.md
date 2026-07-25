# Handbook — Responsive QA

_Handbook plan §10. Status: **responsive-first; desktop no-overflow verified; true
device sweep pending**._

## Built responsive-first

- Reader grid `250px / 1fr / 280px` collapses at **1180px** (right rail moves below,
  becomes an auto-fit grid) and at **860px** (single column; left rail static; TOC
  single column).
- Section-body **tables** are `display:block; overflow-x:auto` — they scroll inside
  their own container; the page body never scrolls horizontally.
- Home grids (quicklinks, lifecycle, contents), references index, gate list, and
  approval grid all use `auto-fit/auto-fill minmax(...)`; references row collapses to
  one column ≤640px.
- Nolan panel uses `max-w-[calc(100vw-2rem)]`.

## Verified (desktop viewport)

No page-level horizontal overflow on `/handbook`, `/section/*`, `/references`, or
`/release-status` (measured `scrollWidth <= clientWidth`).

## Preview-pane limitation

The in-app Browser pane renders at a fixed desktop layout viewport, so the mobile
`max-width` breakpoints above cannot be truly emulated here. A real-device / headless
sweep across 320 / 375 / 768 / 1024 / 1440 / 1600 px + 200% zoom is the remaining
sign-off step.
