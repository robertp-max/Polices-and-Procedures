# Normalized V6 UI QA Feedback and Suggestions

## Global / Shell Issues
- The main content area in V6Shell uses a hardcoded `pt-[88px]` that does not match the topbar height or token system, causing inconsistent top spacing across screens.
- No PageHeader component is used in most screens (RepresentativeScreens, pageviews, etc.), resulting in missing consistent eyebrow/title/description hierarchy and abrupt content starts after the shell.
- Sidebar padding (`px-lg py-lg`) and nav gaps do not align with main content padding (`px-3xl`), creating visual mismatches at the edges.
- Scrollbars are globally hidden via CSS (`scrollbar-width: none`), making overflow hard to detect on long content.
- MetricGrid (with fixed min-height tiles) is added at the top of nearly every screen, adding hundreds of pixels of vertical height before main content and contributing to scrolling.

## Spacing Issues
- Excessive and inconsistent use of large gaps (primarily `gap-xl` / 20px) at the top level and between major sections, combined with mixed inner gaps (`gap-lg`, `gap-md`, `gap-sm`, `gap-xs`) and paddings (`p-xl`, `p-lg`, `p-md`, `p-xs`).
- Hardcoded pixel values mixed with tokens (e.g., `px-3`, `py-2`, `text-[10px]`, `h-[76px]`) break the spacing rhythm defined in tokens (xs=4, sm=8, md=12, lg=16, xl=20, 2xl=24, 3xl=32).
- Cards and sections use varying internal paddings and margins (`mb-lg`, `mt-xs`, `mt-md`, `mt-lg`) without a unified system, leading to cramped areas next to overly spacious ones.
- Flex wraps and justify-between patterns are overused, causing wrapping imbalance on narrower viewports or with long text.
- Shell-to-content padding transition is inconsistent (shell px-3xl vs inner p-xl / p-lg).

## Contrast Issues
- Low contrast on muted/secondary/tag text (e.g., text-muted, text-secondary, text-tag) over light backgrounds, glass surfaces, tone-slate, and backdrop-blur effects.
- Small text sizes (text-xs, text-tag at 11px, hardcoded 8-10px) are hard to read, especially on washed-out glass or tinted surfaces.
- Badge/tone elements blend on certain backgrounds (orange, amber, teal) with insufficient contrast.
- Progress meters use tiny (h-2) bars with low visibility.

## Balance and Layout Issues
- Uneven column balances: left sides often overloaded with tables/lists (using arbitrary `minmax(0, 3fr)` + fixed px like 320-340px), right rails vary wildly in height.
- Grid column specs are arbitrary and inconsistent across screens (e.g., 3fr/2fr, 1fr/340px, 12-col spans, 5-col, 3-col) without accounting for actual content.
- Content-start alignment on asides/sections causes misalignment between left and right content.
- Metric grids are fixed (usually 4 tiles) even when content below does not require it.
- Justify-end on lone elements (tags, buttons) wastes space and looks unbalanced.
- Varying column widths and fr units across screens break visual consistency.

## Unnecessary Scrolling and Organization
- Most screens stack metrics + multiple tall sections (tables, card grids, rails, lists) at full height with no max-h, overflow control, or pagination, forcing long vertical (and sometimes horizontal) scrolling on normal viewports.
- Board views (Events Board, My Tasks, etc.) use wide fixed grids that trigger horizontal scroll.
- Recommendation: Introduce tab systems to organize content instead of dumping everything into one view. Examples:
  - Dashboard: Tabs for Queue vs Signals vs Census.
  - Journey Admin: Tabs for Syllabus vs Review Queues vs Governance.
  - Supervisor: Tabs for Roster vs Queues vs Details/Coaching.
  - Events Board: Tabs for Board vs Evidence vs Signals (build on existing segmented control).
  - Onboarding v2 Batch: Tabs for Gates vs Roster vs Evidence/Timeline.
  - Workflows: Tabs for Library vs Details vs Swimlane.
  - Admin area: Consolidate into one tabbed view (Groups / Roles / Permissions / Users) instead of 4 separate routes.
  - Forms / Policy / Evidence: Tabs for Matrix vs Details / Preview panels.
- Data tables and long lists lack internal scroll areas or virtualization, exacerbating the problem.

## Design System and Consistency Issues
- Inconsistent application of tokens vs hardcoded values (spacing, font sizes, heights, widths).
- Badge and progress bar styles/colors vary widely and do not consistently follow the tone system (teal/orange/green/amber/slate). Examples from Events Board: random progress bar colors (orange/brown/teal/green), mixed badge backgrounds (orange, teal, yellow) with clashing text.
- Card layouts and internal structures are inconsistent even within the same screen/column (e.g., Lock Ready column cards have different badge/progress placements and content density).
- Font weights and sizes mix arbitrarily (font-light on headings, varying h2/h3 sizes, text-xs vs text-tag vs hardcoded 30px/10px).
- Components (SurfaceCard, MetricTile, DataTable, ProgressMeter, ToneTag, BoardLane) are applied inconsistently across screens.
- Flat design (shadow-rest none) with repetitive rounded-lg and hairline borders makes elements look cheap and undifferentiated.
- Overuse of tone-slate / glass surfaces creates visual repetition with little hierarchy or depth.

## Specific Screen / Area Feedback
- **Events Board**: Inconsistent badge designs and colors; random progress bar colors; varying card structures within the same column (progress bar vs stacked badges vs "CERTIFIED" + "HASH CHAIN"); cramped/uneven spacing; poor visual hierarchy and alignment; overall looks like different people designed each card. Use tabs for status views to reduce scrolling and imbalance.
- **Journey Screens** (Overview, V1, Admin, Supervisor, Module Player, Appendix F): Stacked phases/modules/details/readiness without tabs; inconsistent padding (p-xl vs p-lg vs p-md); cramped pickers/drawers with nested scrolling; arbitrary grid min/max and fr splits; low contrast on muted text over slate/glass; long vertical scroll from all content visible at once. Tabs for phases, syllabus vs queues, steps vs checkoff, etc., would help.
- **Onboarding v2 Screens**: Gate tiles + expanded sections cause tall stacks; sub-tabs and modals use raw/non-primitive controls with inconsistent spacing; raw forms in modals (px-3 py-2); lack of consistent headers. Tabs for gates/roster/evidence/timeline recommended.
- **Admin Screens** (Groups, Roles, Permissions, Users): Copy-paste inconsistencies between screens (different text classes, paddings, font weights); raw non-styled tables/radios in permission override; 9-column table causes horizontal scroll; justify-end tags waste space. Consolidate into tabbed single view.
- **Taxonomy / Libraries** (Framework, ACHC, Policy Library, Forms Library, eCIgn): Long stacked sections with no tabs between modes/views (e.g., taxonomy vs mapping, templates vs signers); arbitrary grids; low contrast; eCIgn has cramped multi-column with small canvas. Tabs would reduce duplication and scrolling.
- **CES Screens** (Events Board, Workflows, My Tasks, Master Controls): Similar stacking without tabs; inconsistent column specs; hidden scrollbars; raw elements.
- **Shell / Global**: Padding mismatch; no PageHeader usage; hidden scrollbars; MetricGrid always adds fixed top height.
- **Components / Primitives**: Inconsistent token usage; DataTable forces horizontal scroll; varying internal gaps; low-contrast tags.

## General Suggestions for Improvement
- Enforce strict use of design tokens for all spacing, sizing, and colors; eliminate hardcoded px values.
- Introduce a shared tab/segmented component (build on existing patterns in Calendar, Framework, Appendix F) and apply it consistently to reduce vertical stacking.
- Add max-height + internal scrolling or virtualization to tables, lists, and rails where content is long.
- Unify admin into a single tabbed view instead of separate routes.
- Add consistent PageHeader usage across all screens for proper hierarchy.
- Standardize card structures, badge designs, and progress bar styling to match the tone system.
- Improve contrast by auditing muted/secondary text and glass surfaces; consider stronger hierarchy with font weights.
- Review grid column specs for better content-driven balance and responsiveness (avoid arbitrary fr/minmax across screens).
- Add proper labels/associations for form elements (e.g., radios in overrides) and remove console.log/alert from UI code.
- Consider a shared admin/data table wrapper or layout primitive to reduce copy-paste inconsistencies.
- Test on various breakpoints for balance and scrolling behavior.

This list consolidates the core technical feedback across all reviewed areas (shell, journey, onboarding v2, admin, taxonomy, CES, events board, components, global patterns) while removing persona/rant elements. Focus areas for quick wins: tab organization to cut scrolling, token enforcement for spacing/contrast, and standardizing the Events Board card/badge patterns.