# Canonical Logo Replacement Report

## Canonical asset

| Field | Value |
|---|---|
| Path | `/assets/logo-careindeed-orange.png` |
| Dimensions | 768x768 PNG |
| SHA-256 | `d3286ff3d440da235566f66fed2a43a9f355fff7ca29a859a4044b9970549569` |
| Uniqueness | Confirmed the only logo file present |

## Per-screen convergence

| Screen | Prior treatment | New treatment | Status |
|---|---|---|---|
| Sidebar | Direct usage of canonical asset | `CareIndeedBrand` component | Converged |
| Mobile header | Direct usage of canonical asset | `CareIndeedBrand` component | Converged |
| Handbook home / control card | Direct usage of canonical asset | `CareIndeedBrand` component | Converged |

## Important note on prior state

Existing logo usages across these screens were **already referencing the correct canonical
asset** (`/assets/logo-careindeed-orange.png`) before this pass — there was no stale or
incorrect logo file being displayed anywhere in scope. The change made here was to route all
three surfaces through a single shared `CareIndeedBrand` component rather than each surface
independently referencing the asset path, so future logo updates only need to change one
component rather than being hunted down per-screen.

## Guard added

A repo-wide asset scanner was run to confirm no divergent logo files exist anywhere in scope:

| Check | Result |
|---|---|
| Files scanned | 103 |
| Findings (non-canonical logo assets) | 0 |
| Result | PASS |

This scanner result, combined with the SHA-256 verification of the canonical asset against the
manifest, confirms there is exactly one logo asset in play and every converged surface now
renders it through the same component.
