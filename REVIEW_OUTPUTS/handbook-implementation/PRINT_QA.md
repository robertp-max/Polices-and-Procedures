# Handbook — Print QA

_Handbook plan §10. Status: **print CSS with persistent draft watermark implemented;
rendered-PDF proof pending**._

## Implemented (`@media print` in handbook.css)

- A persistent fixed **"COUNSEL-REVIEW DRAFT · NOT EFFECTIVE"** watermark is painted
  via `body::before` (rotated, low-opacity, `pointer-events:none`) so it appears on
  every printed page — the draft status cannot be printed away.
- Navigation chrome is hidden in print (`.hb-rail`, crumb, section nav, Nolan button)
  so the printed output is the content + watermark.

## Not yet verified

A rendered print preview / exported PDF has not been captured (the preview pane
does not expose print rendering). Confirming the watermark position, page breaks
inside long tables, and that no interactive-only affordance prints is the remaining
step. The approved build (post-approval) additionally generates accessible HTML +
print/PDF output with the watermark **removed** only in that approved build.
