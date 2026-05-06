# Quick Wins

Low-risk, high-impact improvements that do not require major architecture changes.

1. Evidence mode clarity
   - Add persistent mode badge (`Demo Local` vs `Backend Live`) in evidence pages.
2. Evidence download clarity
   - Replace toast-only download in event panel with explicit metadata-only message or actionable link.
3. Filter UX consistency
   - align evidence/event/form/policy filter labels and placeholders across pages.
4. Broken-link route checks
   - add smoke tests for key routes in `App.tsx`, including redirects.
5. Generated-file warning banner
   - add developer-facing warnings when viewing/editing generated files directly.
6. Forms build drift check
   - CI warning when `.cache/forms-build` output differs from runtime dataset.
7. Audit panel labels
   - standardize action wording across evidence, workflow, and audit pages.
8. Empty-state guidance
   - ensure every key module has a clear next-step action in empty state.
9. Responsive layout polish
   - verify evidence/workflow side panels under narrow breakpoints.
10. PM defaults
    - ensure current sprint defaults and task source labels are explicit and consistent.
11. Validation messages
    - add user-readable reasons when task/evidence upload is blocked.
12. Help panel improvements
    - link right-side help text to specific Help Center articles per module.
