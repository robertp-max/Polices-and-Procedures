# Normalized V6 UI Feedback and Suggestions

## Global / Shell Issues
- Main content padding in V6Shell (pt-[88px]) does not match topbar height or design tokens, causing inconsistent top spacing.
- PageHeader component is defined but not used in most screens, leading to missing consistent hierarchy, titles, and breathing room from the shell.
- Sidebar padding and gaps do not align with main content padding.
- Scrollbars are globally hidden, making overflow hard to detect on long content.
- MetricGrid adds fixed vertical height (min-h tiles) at the top of nearly every screen before main content.

## Spacing and Layout
- Excessive and inconsistent use of large gaps (gap-xl) and paddings (p-xl, p-lg) at top levels, mixed with smaller gaps inside components, leading to wasted space or cramped areas.
- Arbitrary grid column specs (minmax, fr units, fixed px like 320-340px) vary per screen and cause imbalance.
- Cards and sections use mixed internal paddings and margins without a unified system.
- Flex wraps and justify-between patterns are overused, causing wrapping issues on narrower viewports.
- Shell-to-inner content padding transition is inconsistent.

## Contrast and Typography
- Low contrast on muted/secondary/tag text over light backgrounds, glass surfaces, and tone-slate.
- Small text sizes (text-xs, text-tag, hardcoded 8-10px) are hard to read, especially on washed-out glass.
- Badge and tone elements have insufficient contrast on certain backgrounds.
- Progress meters use tiny bars with low visibility.
- Mixed font weights (light vs medium) and sizes break visual hierarchy; tracking only on tags.
- Glass and backdrop effects wash out text further.

## Balance and Visual Hierarchy
- Uneven column balances: left sides overloaded with tables/lists, right rails vary in height.
- Content-start alignment on asides causes misalignment.
- Justify-end on single elements (tags, buttons) wastes space and looks unbalanced.
- Metric grids are fixed (usually 4 tiles) regardless of content below.
- Varying column widths and fr units across screens break consistency.
- Flat design (shadow-rest none) with repetitive elements makes UI look cheap and undifferentiated.
- High visual density with borders, tags, and elements everywhere; lack of breathing room.

## Scrolling and Organization
- Most screens stack metrics + multiple tall sections (tables, card grids, rails, lists) at full height, forcing long vertical (and sometimes horizontal) scrolling on normal viewports.
- Board views use wide fixed grids that trigger horizontal scroll.
- Data tables and long lists lack internal scroll, max-h, virtualization, or pagination.
- Suggestion: Use tab systems extensively to organize content and reduce scrolling. Examples:
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
- Badge and progress bar styles/colors vary and do not consistently follow tone system (teal/orange/green/amber/slate).
- Card layouts and internal structures are inconsistent even within the same screen/column (e.g., Lock Ready cards in Events Board).
- Components (SurfaceCard, MetricTile, DataTable, ProgressMeter, ToneTag) applied inconsistently.
- Overuse of tone-slate/glass surfaces creates repetition.
- In Events Board screenshot: Inconsistent badges (colors, placement, text), random progress bar colors (orange/brown/teal/green), varying card structures within columns, cramped/uneven spacing, poor hierarchy.

## Specific Screen Feedback
- **Events Board**: Inconsistent badge designs/colors, random progress colors, chaotic card layouts in same column, cramped spacing, imbalance, looks like different people designed parts. Use tabs for statuses.
- **Journey screens** (Overview, V1, Admin, Supervisor, Module Player, Appendix F): Stacked phases/modules/details without tabs; inconsistent padding; cramped pickers/drawers; arbitrary grids; long vertical scroll. Tabs for phases/syllabus/queues/steps recommended.
- **Onboarding v2**: Gate tiles + expanded sections cause tall stacks; sub-tabs use raw/non-primitive controls; raw forms in modals with inconsistent spacing.
- **Admin screens** (Groups, Roles, Permissions, Users): Copy-paste inconsistencies (text classes, paddings, weights); raw non-styled tables/radios in override; wide tables cause horizontal scroll. Consolidate to tabs.
- **Taxonomy** (Framework, ACHC, Policy, Forms, eCIgn): Long stacked sections with no tabs between modes/views; arbitrary grids; low contrast; cramped multi-column (e.g., eCIgn).
- **CES** (Workflows, My Tasks, Master Controls, Events Board): Similar stacking without tabs; inconsistent columns; hidden scrollbars.
- **Shell/Global**: Padding mismatch; no PageHeader usage; hidden scrollbars; MetricGrid always adds fixed top height.
- **Components**: Inconsistent token usage; DataTable forces horizontal scroll; varying internal gaps.

## General Suggestions
- Enforce strict use of design tokens for all spacing, sizing, and colors; eliminate hardcoded px.
- Introduce a shared tab/segmented component and apply consistently to reduce vertical stacking.
- Add max-height + internal scrolling or virtualization to tables, lists, and rails.
- Unify admin into a single tabbed view.
- Add consistent PageHeader usage across screens.
- Standardize card structures, badge designs, and progress styling to match tone system.
- Improve contrast (audit muted text, glass surfaces).
- Review grid specs for better content-driven balance and responsiveness.
- Add proper labels for form elements (e.g., radios); remove debug console/alert from UI.
- Consider shared wrappers for admin/data tables to reduce inconsistencies.
- Test responsiveness for balance and scrolling on various breakpoints.
- Add visual distinction (e.g., shadows, varied surfaces) for better hierarchy and depth.

This list consolidates feedback across all reviewed areas (shell, journey, onboarding v2, admin, taxonomy, CES, events board, components, global patterns) in a normalized, actionable format.