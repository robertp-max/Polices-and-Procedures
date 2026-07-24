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

## Not yet executed

The full matrix (320 / 375 / 768 / 1024 / 1440 / 1600 px + 200% zoom) has not been swept for
every route. Recommended before sign-off.
