# Responsive QA

_Master Correction Prompt §18.9. Status: **PARTIAL** — new UI built responsive-first; full breakpoint sweep not yet executed._

## Built responsive-first this pass

- Annual summary strip / section-nav chips wrap (`flex-wrap`); `.policy-update-row` collapses
  to a single column ≤700px (pre-existing rule retained).
- `.inservice-clock` and `.annual-link-card` use flex; requirement grid reuses the existing
  responsive `.requirement-grid`.
- Nolan panel uses `max-w-[calc(100vw-2rem)]` so it never overflows small viewports.
- Policy tables scroll inside `.policy-table-wrap` (`overflow-x: auto`) — no page-level
  horizontal scroll.

## Media queries in place (standard breakpoints)

- Policy player: 1180px (narrow the 3-col grid), 980px (single column, hide TOC, hide the
  desktop tab strip, show the sticky mobile bar + section drawer, 2-col meta, sticky action
  bar), and the tab strip itself lives in `.workspace-tabs-wrap { overflow-x: auto }`.
- Annual page: summary strip + section nav use `flex-wrap`; oversight/link grids use
  `auto-fill/auto-fit minmax(...)`; `.policy-update-row` collapses at 700px.
- Appendix F packet: grouped cards use the responsive requirement/card styles.

## Preview-pane limitation

The in-app Browser pane renders the journey app at a fixed desktop layout viewport — resizing
scales the visual viewport but media queries still evaluate against the desktop width, so a
true 320–768px layout cannot be emulated here. Verified at desktop: no page-level horizontal
overflow; wide content (tables, tab strips) scrolls inside its own `overflow-x:auto` container.
The mobile breakpoints above are standard `max-width` rules and will apply in a real device
browser; a real-device / headless-emulation pass across 320 / 375 / 768 / 1024 / 1440 / 1600 px
+ 200% zoom is the remaining sign-off step.
