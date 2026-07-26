# Responsive QA — Advanced Training + Workflow References

## What was checked
A scripted desktop-viewport spot-check was run against the running dev instance (journey app on port 5190, this worktree's runtime), confirming:
- Advanced Training renders exactly 4 cards for RN and is absent (no section, no empty-state placeholder) for LVN, at desktop width.
- The Workflows Reference Library renders its typed reference tags, duty-overlay panel, and the "Prototype simulation preview · no official completion" banner correctly at desktop width.

Both components (`AdvancedWorkspace.tsx`, `WorkflowsWorkspace.tsx`) are built on the same layout primitives (flex/grid list rows, `role="tablist"` filter chips, a `<details>` disclosure panel for duty overlays) used elsewhere in the already-responsive journey app shell, so there is no component-specific fixed-width or fixed-pixel layout that would be expected to break at narrower widths. That expectation was **not verified by an automated sweep** — see below.

## Honest gap — NOT RUN
The full automated responsive matrix specified for this workstream (320 / 375 / 768 / 1024 / 1440 px widths, plus 200% browser zoom) was **not executed** for these two surfaces in this pass. Only a desktop-width scripted spot-check was performed (see `TEST_RESULTS.md`). Specifically not run:
- 320px / 375px mobile-width rendering of the Advanced Training cards and the Workflows Reference Library (list density, filter-chip wrapping, duty `<details>` panel behavior, pagination control layout).
- 768px / 1024px tablet-width rendering.
- 1440px wide-desktop rendering.
- 200% browser-zoom rendering.

## Recommendation
Before this is called responsive-complete, run the standard breakpoint sweep against `/journey/training/advanced`, `/journey/training/annual`, `/journey/workflows`, and `/journey/workflows/CL-WF-26` for at least one persona per Advanced role (RN) and one non-Advanced persona (LVN), across the five widths above plus 200% zoom.

## Executed browser sweep (in-app Browser pane) — UPDATE

A real multi-viewport sweep was run via the in-app Browser pane (viewport width honored;
`matchMedia` confirmed media queries evaluate against it):

- **320px:** Workflow Library, Annual, Competencies (HHA), Home — no page-level horizontal
  overflow. Annual section-nav scrolls within its own `overflow-x:auto` strip (by design).
- **1440px:** Policy reader renders the 3-column grid (260 / 485 / 300).

**Bug found + fixed during the sweep:** `app/styles/policy-player.css` was never imported in
`globals.css`, so the policy reader's 3-column grid, numbered-clause styling, and the ≤980px
responsive rules (hide desktop tab strip / show mobile bar) never loaded — causing a 320px
horizontal overflow. Fixed by adding the `@import` (commit 60357ac7). Re-verified: 320px no
longer overflows, desktop tabs hide, mobile bar shows, clauses render styled.

Still NOT a full automated matrix: 375/768/1024 and 200%-zoom + screen-reader across every
persona were not exhaustively enumerated; the committed Playwright suite needs a clean
`npm ci` (currently blocked by a pre-existing lockfile mismatch on this branch).
