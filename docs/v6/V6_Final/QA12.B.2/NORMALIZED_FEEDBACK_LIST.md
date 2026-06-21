# V6 UI Design QA - Normalized Feedback and Suggestions

## Global / Shell Issues
- Main content padding in V6Shell uses hardcoded `pt-[88px]` that does not match topbar height or design tokens, causing inconsistent top spacing across screens.
- PageHeader component is defined but not used in most screens, leading to missing consistent hierarchy, titles, and breathing room from the shell.
- Sidebar padding and gaps do not align with main content padding (`px-lg py-lg` vs `px-3xl`).
- Scrollbars are globally hidden via CSS (`scrollbar-width: none`), making overflow hard to detect on long content.
- MetricGrid (with fixed min-height tiles) is added at the top of nearly every screen, adding hundreds of pixels of vertical height before main content and contributing to scrolling.

## Spacing and Padding
- Excessive and inconsistent use of large gaps (primarily `gap-xl`) and paddings (`p-xl`, `p-lg`) at top levels and between sections, mixed with smaller gaps inside components.
- Hardcoded pixel values mixed with tokens (e.g., `px-3`, `py-2`, `text-[10px]`, `h-[76px]`) break the spacing rhythm defined in tokens.
- Cards and sections use varying internal paddings and margins (`mb-lg`, `mt-xs`, `mt-md`, `mt-lg`) without a unified system.
- Flex wraps and justify-between patterns are overused, causing wrapping imbalance on narrower viewports or with long text.
- Shell-to-content padding transition is inconsistent (shell `px-3xl` vs inner `p-xl` / `p-lg`).

## Contrast and Typography
- Low contrast on muted/secondary/tag text (e.g., `text-muted`, `text-secondary`, `text-tag`) over light backgrounds, glass surfaces, and tone-slate.
- Small text sizes (`text-xs`, `text-tag` at 11px, hardcoded 8-10px) are hard to read, especially on washed-out glass or tinted surfaces.
- Badge and tone elements have insufficient contrast on certain backgrounds (orange, amber, teal).
- Progress meters use tiny (h-2) bars with low visibility.
- Mixed font weights (light vs medium) and arbitrary sizes break visual hierarchy; tracking only on tags.
- Glass and backdrop effects further wash out text.

## Balance and Layout
- Uneven column balances: left sides often overloaded with tables/lists (using arbitrary `minmax(0, 3fr)` + fixed px like 320-340px), right rails vary wildly in height.
- Arbitrary grid column specs (`minmax`, `fr` units, fixed px) vary per screen and cause imbalance.
- Content-start alignment on asides causes misalignment between left and right content.
- Justify-end on lone elements (tags, buttons) wastes space and looks unbalanced.
- Metric grids are fixed (usually 4 tiles) even when content below does not require it.
- Varying column widths and fr units across screens break visual consistency.
- Flat design (`shadow-rest: none`) with repetitive rounded-lg and hairline borders makes UI look cheap and undifferentiated.
- High visual density with borders, tags, and elements everywhere; lack of breathing room/white space rhythm.

## Scrolling and Organization
- Most screens stack metrics + multiple tall sections (tables, card grids, rails, lists) at full height with no max-h, overflow control, or pagination, forcing long vertical (and sometimes horizontal) scrolling on normal viewports.
- Board views use wide fixed grids that trigger horizontal scroll.
- Data tables and long lists lack internal scroll, max-h, virtualization, or pagination.
- Suggestion: Use tab systems to organize content and reduce scrolling. Examples:
  - Dashboard: Tabs for Queue vs Signals vs other views.
  - Journey Admin: Tabs for Syllabus vs Review Queues vs Governance.
  - Supervisor: Tabs for Roster vs Queues vs Details/Coaching.
  - Events Board: Tabs for Board vs Evidence vs Signals (build on existing segmented control).
  - Onboarding v2 Batch: Tabs for Gates vs Roster vs Evidence/Timeline.
  - Workflows: Tabs for Library vs Details vs Swimlane.
  - Admin area: Consolidate into one tabbed view (Groups / Roles / Permissions / Users) instead of 4 separate routes.
  - Forms / Policy / Evidence: Tabs for Matrix vs Details / Preview panels.
- Many screens have top button bars or filters that could be better organized as tabs.

## Design System and Consistency
- Inconsistent application of tokens vs hardcoded values (spacing, sizes, heights, widths, text).
- Badge and progress bar styles/colors vary widely and do not consistently follow tone system (teal/orange/green/amber/slate).
- Card layouts and internal structures are inconsistent even within the same screen/column (e.g., Lock Ready cards in Events Board have different badge/progress placements and content density).
- Components (SurfaceCard, MetricTile, DataTable, ProgressMeter, ToneTag, BoardLane) applied inconsistently across screens.
- Overuse of tone-slate / glass surfaces creates visual repetition with little hierarchy or depth.
- From Events Board screenshot: Inconsistent badges (colors, placement, text), random progress bar colors (orange/brown/teal/green), varying card structures within columns, cramped/uneven spacing, poor hierarchy, looks like different people designed each card, imbalance with different column heights/card counts.

## Specific Screen Feedback
- **Events Board**: Inconsistent badge designs/colors, random progress bar colors, chaotic card layouts in same column (progress at bottom vs stacked badges vs "CERTIFIED" + "HASH CHAIN"), cramped/uneven spacing, poor visual hierarchy/alignment, imbalance. Use tabs for status views to reduce scrolling and imbalance.
- **Journey screens** (Overview, V1, Admin, Supervisor, Module Player, Appendix F): Stacked phases/modules/details/readiness without tabs; inconsistent padding; cramped pickers/drawers; arbitrary grid min/max and fr splits; long vertical scroll from all content visible at once. Tabs for phases, syllabus vs queues, steps vs checkoff, etc., recommended.
- **Onboarding v2 screens**: Gate tiles + expanded sections cause tall stacks; sub-tabs use raw/non-primitive controls with inconsistent spacing; raw forms in modals (e.g., px-3 py-2). Tabs for gates/roster/evidence/timeline recommended.
- **Admin screens** (Groups, Roles, Permissions, Users): Copy-paste inconsistencies (text classes, paddings, font weights); raw non-styled tables/radios in permission override; 9-column table causes horizontal scroll; justify-end tags waste space. Consolidate into tabbed single view.
- **Taxonomy / Libraries** (Framework, ACHC, Policy Library, Forms Library, eCIgn): Long stacked sections with no tabs between modes/views (e.g., taxonomy vs mapping, templates vs signers); arbitrary grids; low contrast; cramped multi-column (e.g., eCIgn).
- **CES screens** (Events Board, Workflows, My Tasks, Master Controls): Similar stacking without tabs; inconsistent column specs; hidden scrollbars; raw elements.
- **Shell / Global**: Padding mismatch; no PageHeader usage; hidden scrollbars; MetricGrid always adds fixed top height.
- **Components / Primitives**: Inconsistent token usage; DataTable forces horizontal scroll; varying internal gaps; low-contrast tags.

## General Suggestions for Improvement
- Enforce strict use of design tokens for all spacing, sizing, and colors; eliminate hardcoded px values.
- Introduce a shared tab/segmented component (build on existing patterns in Calendar, Framework, Appendix F) and apply consistently to reduce vertical stacking.
- Add max-height + internal scrolling or virtualization to tables, lists, and rails where content is long.
- Unify admin into a single tabbed view instead of separate routes.
- Add consistent PageHeader usage across all screens for proper hierarchy.
- Standardize card structures, badge designs, and progress bar styling to match the tone system.
- Improve contrast by auditing muted/secondary text and glass surfaces; consider stronger hierarchy with font weights.
- Review grid column specs for better content-driven balance and responsiveness (avoid arbitrary fr/minmax across screens).
- Add proper labels/associations for form elements (e.g., radios in overrides) and remove console.log/alert from UI code.
- Consider shared admin/data table wrapper or layout primitive to reduce copy-paste inconsistencies.
- Test on various breakpoints for balance and scrolling behavior.
- Add visual distinction (e.g., shadows, varied surfaces) for better hierarchy and depth.

This list consolidates the core technical feedback across all reviewed areas (shell, journey, onboarding v2, admin, taxonomy, CES, events board, components, global patterns) while removing persona/rant elements. Focus areas for quick wins: tab organization to cut scrolling, token enforcement for spacing/contrast, and standardizing the Events Board card/badge patterns.