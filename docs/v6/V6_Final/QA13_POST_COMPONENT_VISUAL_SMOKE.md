# QA13 Post-Component Visual Smoke

## STATUS

PARTIAL

## BASELINE

- Branch: `v2/designless-baseline`
- Commit: `8567a85 feat(v6): normalize shared component rhythm`
- Backup tag: `backup/phase13-shared-components-20260621-212751`
- Working tree status before review: clean except ignored local `scratch/`
- Runtime: `http://localhost:5173`
- Review mode: audit/review only; no UI code edited, staged, committed, or pushed

## SCREENS REVIEWED

| Screen | Route | Screenshot | Status | Observations | Regression risk | Recommended next action |
|---|---|---|---|---|---|---|
| Dashboard | `/dashboard` | `scratch/phase13-post-component-smoke/dashboard.png` | PARTIAL | Page renders cleanly with improved queue/card rhythm, flat progress bars, readable badges, and aligned sidebar. Floating personal icon sits very close to the top metric-card zone at 1440px. | Medium | Fold dock placement into shell cleanup during next route pass if it blocks top-right metric content. |
| CES Calendar | `/ces/calendar` | `scratch/phase13-post-component-smoke/ces-calendar.png` | PASS | Calendar is larger and calmer after prior cleanup. Event pills stay within cells, side event rail is removed, and spacing is readable. | Low | Continue with event density refinements only if route cleanup touches CES. |
| CES Board | `/ces/board` | `scratch/phase13-post-component-smoke/ces-board.png` | PARTIAL | Metric cards and filters render well, but board lanes still create horizontal pressure; rightmost lane is clipped at the reviewed viewport. | High | Prioritize board density and horizontal overflow behavior. |
| Events Board | `/ces/events` | `scratch/phase13-post-component-smoke/events-board.png` | PARTIAL | Cards are more readable and progress bars are slimmer. The main board plus right insight rail still feels tight and could regress at smaller desktop widths. | Medium | Include with CES board density pass. |
| Workflows | `/workflows` | `scratch/phase13-post-component-smoke/workflows.png` | PASS | Table is readable and no longer feels like stacked cards. Right rail cards are calmer; shell remains aligned. | Low | No immediate action beyond route-group polish. |
| My Tasks | `/my-tasks` | `scratch/phase13-post-component-smoke/my-tasks.png` | PASS | Board lanes fit at the reviewed viewport, card rhythm is improved, tags remain readable, and progress bars are appropriately flat. | Low | Recheck during board-density pass. |
| Master Controls | `/compliance/master-controls` | `scratch/phase13-post-component-smoke/master-controls.png` | PASS | Matrix is readable, compact, and table-like. Right cards no longer dominate the page. | Low | No immediate action. |
| Admin Permissions | `/admin/permissions` | `scratch/phase13-post-component-smoke/admin-permissions.png` | PASS | Tabs compact the permission surfaces well. Permission labels are human-readable; no raw permission keys are visible as primary labels. | Low | Admin matrix/tab rhythm can be second batch, not first. |
| Policy Detail | `/library/policy-sample` | `scratch/phase13-post-component-smoke/policy-detail.png` | PASS | Policy tabs and metadata header are readable; no top truncation at first paint. Content cards have better depth without heavy nesting. | Low | Recheck sticky/fade behavior after route cleanup. |
| eCIgn Workspace | `/forms/form-sample/esign` | `scratch/phase13-post-component-smoke/ecign-workspace.png` | PARTIAL | eCIgn spelling is correct and legal `E-SIGN Act` copy is acceptable. Three-column content remains dense but not broken. | Medium | Revisit during tall-scroll cleanup after CES/admin. |
| Mobile Incident | `/calendar/event/event-sample/task/task-sample` | `scratch/phase13-post-component-smoke/mobile-incident.png` | PASS | Detail form, upload panel, and right preview render cleanly with no obvious overlap. Tags and progress bars remain readable. | Low | No immediate action. |
| Personal Ops overlay state | `/dashboard` | `scratch/phase13-post-component-smoke/personal-ops-open.png` | PARTIAL | Panel opens without console errors and remains full-height. Main content compresses but remains readable; floating toggle placement remains the main shell risk. | Medium | Include dock placement/overlay spacing in shell follow-up if it blocks content during route passes. |

## GLOBAL FINDINGS

- shell/topbar/sidebar: Sidebar alignment and nav fade remain intact. The main shell regression risk is the floating personal icon/dock sitting inside the top metric-card visual zone at 1440px.
- card rhythm: Shared card rhythm improved. Cards are less bulky than the earlier pass and still retain enough glass depth.
- table density: Tables read as tables again; Master Controls, Workflows, and Admin Permissions are notably better.
- board rhythm: Board cards are easier to scan, but CES Board still has horizontal overflow/clipping pressure.
- progress/tags/badges: Progress bars are flat/slim; tags and badges remain readable. No chunky/glowy progress regression observed.
- overlays: Personal Ops opens without console/page errors. Modal/drawer shared component changes were not fully exercised by a route-specific modal in this smoke pass.
- typography/contrast: Roboto-weight rhythm appears consistent. No obvious low-contrast regression in reviewed screens.
- route-specific risks: CES Board and Events Board remain the highest-risk route group because board width, side rails, and lane density still compete for space.

## NEXT RECOMMENDED BATCH

1. CES/calendar/workflow board density

- Files likely touched: CES calendar/event board/swimlane route screens plus shared board layout only if route-local tuning is insufficient.
- Routes improved: `/ces/calendar`, `/ces/board`, `/ces/events`, `/workflows/:workflowId/swimlane`, and secondary board consumers such as `/my-tasks`.
- Expected risk: Medium, because board density changes can affect multiple board-style routes.
- Validation needed: screenshots at 1440px and one narrower desktop width; confirm no horizontal clipping, event pills stay contained, and personal dock does not obscure top-right content.
- Stop condition: board routes fit without clipping while preserving the accepted headerless/floating-dock direction.

## VALIDATION NOTES

- Runtime screenshot capture completed into `scratch/phase13-post-component-smoke/`.
- Every reviewed route returned HTTP 200.
- Console errors captured during route load: 0.
- Page errors captured during route load: 0.
- Bad eCIgn spelling scan in rendered route text: no bad visible spelling found; legal `E-SIGN Act` copy allowed.
- Raw permission keys visible as primary labels: none found in reviewed route text.
