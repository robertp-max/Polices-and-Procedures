# Current Handbook & Logo Inventory

## Handbook footprint (before this work)

The Employee Journey app is **greenfield** for the employee handbook: there was no prior
handbook reader, no prior handbook content routes, and no prior handbook projection data in
the app before the 2026 counsel-review package was ingested. There is nothing to migrate away
from inside the app itself — the only pre-existing handbook artifact anywhere in the repo is
the retired legacy PDF, which was moved into an explicit archive location rather than being
part of any live surface.

| Item | Status |
|---|---|
| Prior handbook reader routes in Employee Journey app | None (greenfield) |
| Prior handbook content/projection data | None (greenfield) |
| Legacy 2022 handbook PDF | Present, archived at `apps/employee-journey/content/handbook/legacy-2022/`, accompanied by `RETIREMENT_METADATA.json` |
| Legacy 2022 PDF integrity | SHA-256 `fc84d206ab66c71cd7f6487676fbbea0f0aa25eb7fa694ac7d453ccd7e879a8c` — verified, matches manifest |

## Logo footprint

| Item | Value |
|---|---|
| Canonical logo asset | `/assets/logo-careindeed-orange.png` |
| Dimensions | 768x768 PNG |
| SHA-256 | `d3286ff3d440da235566f66fed2a43a9f355fff7ca29a859a4044b9970549569` |
| Number of distinct logo files found in scope | 1 (this is the only logo file) |
| Repo-wide asset scanner result | PASS — 103 files scanned, 0 findings |

### Usage state

Pre-existing logo usages in the app were already pointing at this single canonical asset — there
was no divergent or stale logo file to reconcile. The work in this pass converged all
handbook-related surfaces (sidebar, mobile header, handbook home/control card) onto the shared
`CareIndeedBrand` component so that every usage renders from the same canonical asset path
through one component, rather than each surface referencing the asset independently. See
`CANONICAL_LOGO_REPLACEMENT_REPORT.md` for the per-screen breakdown.
