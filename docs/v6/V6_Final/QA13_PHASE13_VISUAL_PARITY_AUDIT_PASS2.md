# QA13 Phase 13 Visual Parity Audit Pass 2

Date: 2026-06-21

## STATUS

**PARTIAL**

All 54 registered V6 routes render and were captured in the current runtime. The route registry count is correct. Remaining parity drift is not a routing failure; it is mostly shared shell/component alignment plus route-specific differences between the current approved headerless/dock direction and the older `V6_Final` screenshot references.

No UI code was edited during this audit pass.

## BASELINE

| Check | Result |
|---|---|
| Branch | `v2/designless-baseline` |
| Baseline commit | `5dab02dc653fd5897f86bc16a3dff9d1d803917e` |
| Current HEAD at audit start | `5dab02d` |
| Backup tag | `backup/phase13-visual-parity-20260621-184920` |
| Baseline descendant check | YES, current HEAD is the baseline commit |
| Working tree at audit start | `M .vscode/extensions.json`, `?? scratch/` |
| Expected clean except scratch | NO, `.vscode/extensions.json` was already modified before this report |
| `scratch/` untracked | YES |
| UI source edited in this audit | NO |

## ROUTE INVENTORY

`src/v6/routing/routeRegistry.ts` was inspected directly. `V6_ROUTES.length` and `V6_REAL_ROUTE_COUNT` both resolve to **54**. `/login` is counted as a real route. `/` redirect is router plumbing and is not counted. Overlay/personal operations states are non-route coverage.

Runtime screenshots were captured to:

`scratch/phase13-audit-pass2/`

Those screenshots are local QA evidence only and must not be committed.

| # | Route path | Route label | Matching V6 Final reference | Current status | Screenshot checked | Primary drift category |
|---:|---|---|---|---|---|---|
| 1 | `/dashboard` | Dashboard | `16-dashboard.png` | PASS | YES | no obvious drift |
| 2 | `/clinicians` | Clinicians | `15-clinicians.png` | PARTIAL | YES | table density |
| 3 | `/clinicians/:clinicianId` | Clinician Detail | `14-clinician-detail.png` | PASS | YES | card/glass depth |
| 4 | `/patients` | Patients | `43-patients.png` | PARTIAL | YES | table density |
| 5 | `/patients/:patientId` | Patient Detail | `42-patient-detail.png` | PASS | YES | card/glass depth |
| 6 | `/calendar` | Master Calendar | `30-master-calendar.png` | NEEDS REVIEW | YES | tabs/scroll reduction |
| 7 | `/staffing-calendar` | Staffing Calendar | `48-staffing-calendar.png` | PARTIAL | YES | spacing/rhythm |
| 8 | `/iadministrator` | iAdministrator | `10-brad.png` | PASS | YES | no obvious drift |
| 9 | `/ces/calendar` | CES Calendar | `12-ces-calendar.png` | NEEDS REVIEW | YES | page hierarchy/header |
| 10 | `/ces/board` | CES Board | `11-ces-board.png` | PARTIAL | YES | BoardLane/card density |
| 11 | `/ces/events` | Events Board | `INFERRED_FROM_V6_SYSTEM`; use `ces-board` + dashboard baseline | NEEDS REVIEW | YES | route/nav metadata |
| 12 | `/workflows` | Workflows | `54-workflows.png` | PARTIAL | YES | table density |
| 13 | `/workflows/:workflowId/swimlane` | Workflow Swimlane | `53-workflow-swimlane.png` | PARTIAL | YES | BoardLane/card density |
| 14 | `/compliance/master-controls` | Master Controls | `31-master-controls.png` | PASS | YES | no obvious drift |
| 15 | `/audit` | Audit Mode | `09-audit-mode.png` | PARTIAL | YES | table density |
| 16 | `/evidence` | Evidence Center | `19-evidence-center.png` | PARTIAL | YES | table density |
| 17 | `/ces/reports` | CES Reports | `13-ces-reports.png` | PARTIAL | YES | contrast/typography |
| 18 | `/calendar/event/:eventId/task/:taskId` | Mobile Incident | `32-mobile-incident.png` | PARTIAL | YES | page hierarchy/header |
| 19 | `/my-tasks` | My Tasks | `35-my-tasks.png` | PASS | YES | no obvious drift |
| 20 | `/framework` | Framework | `22-framework.png` | PARTIAL | YES | card/glass depth |
| 21 | `/framework/achc-survey` | ACHC Survey | `02-achc-survey.png` | PARTIAL | YES | table density |
| 22 | `/framework/achc-survey/crosswalk` | ACHC Crosswalk | `01-achc-crosswalk.png` | PARTIAL | YES | table density |
| 23 | `/library` | Policy Library | `45-policy-library.png` | PARTIAL | YES | table density |
| 24 | `/library/:policyId` | Policy Detail | `44-policy-detail.png` | NEEDS REVIEW | YES | tabs/scroll reduction |
| 25 | `/forms` | Forms Library | `21-forms-library.png` | PARTIAL | YES | table density |
| 26 | `/forms/:formId` | Form Workspace | `20-form-viewer.png` | PARTIAL | YES | spacing/rhythm |
| 27 | `/forms/:formId/esign` | eCIgn Signing Workspace | `18-ecign-workspace.png` | NEEDS REVIEW | YES | eCIgn spelling/copy |
| 28 | `/artifacts/:artifactId` | Artifact Viewer | `08-artifact-viewer.png` | PARTIAL | YES | card/glass depth |
| 29 | `/viewer/:referenceId` | Reference Viewer | `23-generic-reference.png` | PARTIAL | YES | spacing/rhythm |
| 30 | `/journey` | Journey Overview | `28-journey-overview.png` | PARTIAL | YES | spacing/rhythm |
| 31 | `/journey/v1-journey` | Journey v1 | `29-journey-v1.png` | PARTIAL | YES | table density |
| 32 | `/journey/module/:moduleId` | Module Player | `34-module-player.png` | PARTIAL | YES | page hierarchy/header |
| 33 | `/journey/appendix-f` | Appendix F | `07-appendix-f.png` | PARTIAL | YES | table density |
| 34 | `/journey/supervisor` | Supervisor | `49-supervisor.png` | PARTIAL | YES | table density |
| 35 | `/journey/admin` | Journey Admin | `27-journey-admin.png` | PARTIAL | YES | contrast/typography |
| 36 | `/journey/guide` | User Guide | `52-user-guide.png` | PARTIAL | YES | spacing/rhythm |
| 37 | `/onboarding-v2/dashboard` | Onboarding v2 Dashboard | `40-onboarding-v2-dashboard.png` | PARTIAL | YES | table density |
| 38 | `/onboarding-v2/activate` | Onboarding Activation | `36-onboarding-v2-activate.png` | PARTIAL | YES | spacing/rhythm |
| 39 | `/onboarding-v2/batches` | Onboarding Batches | `39-onboarding-v2-batches.png` | PARTIAL | YES | table density |
| 40 | `/onboarding-v2/batches/:batchId` | Onboarding Batch | `38-onboarding-v2-batch.png` | PARTIAL | YES | overlay/drawer/modal |
| 41 | `/onboarding-v2/audit` | Onboarding Audit | `37-onboarding-v2-audit.png` | PARTIAL | YES | table density |
| 42 | `/onboarding-v2/governance` | Onboarding Overrides | `41-onboarding-v2-governance.png` | PARTIAL | YES | overlay/drawer/modal |
| 43 | `/policy-lifecycle` | Policy Lifecycle | `46-policy-lifecycle.png` | PARTIAL | YES | card/glass depth |
| 44 | `/hubstaff` | Hubstaff | `26-hubstaff.png` | PARTIAL | YES | table density |
| 45 | `/system-documentation/:sectionId` | System Documentation | `51-system-docs.png` | PARTIAL | YES | table density |
| 46 | `/help/*` | Help Center | `25-help-center.png` | PARTIAL | YES | spacing/rhythm |
| 47 | `/governance` | Governance | `24-governance.png` | PARTIAL | YES | contrast/typography |
| 48 | `/admin/user-groups` | User Groups | `03-admin-groups.png` | PARTIAL | YES | table density |
| 49 | `/admin/roles` | Roles | `05-admin-roles.png` | PARTIAL | YES | table density |
| 50 | `/admin/permissions` | Permissions | `04-admin-permissions.png` | NEEDS REVIEW | YES | tabs/scroll reduction |
| 51 | `/admin/users` | Users | `06-admin-users.png` | PARTIAL | YES | table density |
| 52 | `/surveyor/policy/:policyId` | Surveyor Viewer | `50-surveyor-viewer.png` | PARTIAL | YES | spacing/rhythm |
| 53 | `/policy-lifecycle/:policyId` | Policy Lifecycle Detail | `46-policy-lifecycle.png` shared reference | NEEDS REVIEW | YES | route/nav metadata |
| 54 | `/login` | Sign In | `INFERRED_FROM_V6_SYSTEM`; no PNG | NEEDS REVIEW | YES | logo/assets |

### Route Status Totals

| Status | Count |
|---|---:|
| PASS | 6 |
| PARTIAL | 40 |
| FAIL | 0 |
| NEEDS REVIEW | 8 |

## DRIFT CATEGORIES OBSERVED

- `shell/topbar/sidebar`: current shell follows newer headerless/personal-dock direction and no longer matches older V6_Final topbar references. This is a reference conflict, not necessarily a defect.
- `page hierarchy/header`: many V6_Final references include page titles/top-right controls that were intentionally removed. Do not re-add them without re-approval.
- `card/glass depth`: surfaces are closer after the prior patch, but table containers, metric cards, and right-rail cards still vary in opacity/depth across route families.
- `spacing/rhythm`: current runtime often uses denser vertical spacing and different right-rail widths than the references.
- `table density`: many table routes are readable but not yet reference-matched in column rhythm, row height, and side-card proportion.
- `tabs/scroll reduction`: current policy/admin/calendar revisions use newer compact tabs/sticky controls that conflict with older references.
- `contrast/typography`: headings and chart/card labels are sometimes lighter or differently sized than V6_Final.
- `route/nav metadata`: 54-route count is correct; inferred/shared-reference routes need explicit acceptance.
- `raw labels/copy`: visible admin labels are mostly human-readable now; raw keys remain only as internal data or tiny metadata candidates.
- `eCIgn spelling`: visible route label is corrected to `eCIgn`; route path `/esign` remains canonical per app map.
- `logo/assets`: login route has no PNG and needs inferred acceptance.
- `responsive concern`: not fully assessed in this pass; 1440x900 was used for parity capture.
- `overlay/drawer/modal`: route screenshots alone do not prove every overlay state; parent-context overlay checks should be a separate capture batch.
- `no obvious drift`: dashboard, key detail pages, iAdministrator, my tasks, and master controls are closest.

## GLOBAL ROOT CAUSES

| Root cause | Repeated effect | Recommended handling |
|---|---|---|
| `V6Shell` | Current shell follows newer headerless direction; older references still show page headers and top-right utility icons. | Confirm current headerless shell is authoritative, then re-baseline reference notes or patch only spacing/masks. |
| `Topbar` | Personal dock is present as a floating control; V6_Final references show three static utility icons. | Treat as accepted newer interaction; verify hover/retract/panel state separately. |
| `Sidebar` | Current active item and scroll fade differ from reference full-catalog captures. | Keep wheel/fade behavior; tune only if item teleport/fade regression appears. |
| `MetricTile` | Top metric cards vary by route and are sometimes removed or re-ordered vs reference. | Normalize card dimensions, row gaps, and accepted routes that intentionally omit metrics. |
| `SurfaceCard` | Glass depth is better but not fully uniform between right rail, nested panels, and table shells. | One shared surface recipe for primary card, nested card, and right-rail card. |
| `DataTable` | Tables are semantic and stable but still differ in row density, column width, and table/card containment. | Add density variants and consistent matrix container width rules. |
| `BoardLane` | Board/card layouts diverge for CES board, events board, workflow swimlane, and my tasks. | Normalize lane widths, card min heights, and justified card rhythm. |
| `ProgressMeter` | Bar thickness, label placement, and muted tracks differ across cards/tables. | Centralize progress label/track presentation. |
| `ToneTag` | Tags generally work, but tag count and wrapping create local rhythm drift. | Add compact chip-row behavior and max visible tag guidance. |
| `ToneBadge` | Status labels are readable; some badge columns still drive table width. | Keep human labels; add table badge sizing guardrails. |
| `VeilDrawer` | Drawer screenshots were not comprehensively re-captured in parent contexts. | Capture workflow drawer, conflict drawer, and permission drawer states in overlay pass. |
| `VeilModal` | Modal system not route-counted; signature and override modals need parent-context checks. | Capture eCIgn signature, onboarding override, and swimlane card modal states. |
| `index.css` | Current source still needs explicit scan/cleanup for raw `rgba`/arbitrary shadow classes if the strict rule is enforced. | Tokenize any remaining arbitrary shadow/color classes in a shared-token pass. |
| route metadata / nav registry | Count is correct; inferred/shared-reference rows need acceptance. | Add a route fixture later, but do not add routes during Phase 13. |

## PRIORITIZED PATCH PLAN

Do not implement until approved.

### Batch 1 — Shared Shell/Layout/Tokens

- Files likely touched: `src/index.css`, `src/v6/shell/V6Shell.tsx`, `src/v6/shell/Topbar.tsx`, `src/v6/shell/Sidebar.tsx`, possibly `tailwind.config.js`.
- Routes improved: all 54 routes plus `personal-ops`.
- Expected risk: medium, because shell changes affect every page.
- Validation needed: `npm run verify:designless`, `npm run build`, 54-route screenshot smoke, bad CSS token scans, dock/personal-panel manual check.
- Stop condition: headerless shell remains intact; no page header reintroduced; `scratch/` remains untracked; no raw hex/rgb/hsl/rgba or arbitrary shadow classes in `src/v6`.

### Batch 2 — Shared Components

- Files likely touched: `MetricTile`, `SurfaceCard`, `DataTable`, `BoardLane`, `ProgressMeter`, `ToneTag`, `ToneBadge`, form primitives.
- Routes improved: dashboard, profiles, all matrix pages, all board pages, evidence/report pages, onboarding/admin pages.
- Expected risk: medium-high because component changes are broad.
- Validation needed: component route sweep at 1440x900; table overflow check; no clipped badges; no card-on-card over-nesting.
- Stop condition: dashboard, master controls, policy library, admin permissions, CES board, workflow swimlane, and my tasks all remain readable and unclipped.

### Batch 3 — Worst Route Groups

- Files likely touched: calendar screens, CES board/events/workflow swimlane screens, admin permissions/users/roles/groups, taxonomy matrix screens.
- Routes improved: `/calendar`, `/ces/calendar`, `/ces/board`, `/ces/events`, `/workflows`, `/workflows/:workflowId/swimlane`, `/admin/*`, `/framework/*`, `/library`, `/forms`.
- Expected risk: medium.
- Validation needed: route screenshots for the affected group, event chip overflow checks, table density checks, raw-key label scan.
- Stop condition: no new route paths; no backend/data reconnection; no standalone design-board artifacts.

### Batch 4 — Page-Specific Cleanup

- Files likely touched: `PolicyDetailScreen`, `EcignWorkspaceScreen`, `MobileIncidentScreen`, `Journey*`, `OnboardingV2*`, `PolicyLifecycle*`, `GovernanceScreen`.
- Routes improved: policy detail, eCIgn, mobile incident, journey/onboarding/system pages.
- Expected risk: medium.
- Validation needed: targeted screenshots, sticky tab/scroll mask checks, eCIgn spelling scan, no raw permission-key primary labels.
- Stop condition: accepted newer layouts remain; no return to old page-header/CTA pattern.

### Batch 5 — Overlays/Subviews

- Files likely touched: `VeilDrawer`, `VeilModal`, personal operations shell/state, workflow drawer triggers, eCIgn signature modal, onboarding override modal.
- Routes improved: parent-context overlay states for workflows, onboarding, eCIgn, admin users, staffing/calendar, personal operations.
- Expected risk: medium.
- Validation needed: overlay screenshots in real parent contexts, focus/escape/manual open-close checks, no standalone overlay routes.
- Stop condition: all overlay states are checked in parent pages, not as new parent routes.

## TOP 10 HIGHEST-IMPACT DRIFT ISSUES

1. V6_Final references still show page headers/top-right utility controls while current runtime follows the newer headerless floating-dock direction.
2. Calendar routes diverge structurally from references after the accepted larger calendar/agenda revisions.
3. BoardLane rhythm is inconsistent across CES board, events board, workflow swimlane, and my tasks.
4. Matrix/table routes still need shared density and width rules to match reference proportion.
5. Policy detail is now a sticky tab/header layout; this is visually strong but mismatches `44-policy-detail.png`.
6. Admin permissions was intentionally compacted into tabs; older reference still shows metric/redundant card structure.
7. SurfaceCard glass depth is closer but not yet uniform between table shells, right rail, and nested cards.
8. Overlay states were not fully captured in this route-only audit; they need parent-context screenshots.
9. Inferred routes (`events-board`, `login-page`) and shared-reference route (`policy-lifecycle-detail`) need explicit acceptance rules.
10. Strict token scan may still flag pre-existing raw `rgba`/arbitrary shadow usage in `src/v6`; this should be handled in a token cleanup batch.

## AUDIT ARTIFACTS

- Runtime route captures: `scratch/phase13-audit-pass2/*.png`
- Runtime capture manifest: `scratch/phase13-audit-pass2/route-capture-manifest.json`
- Side-by-side contact sheets: `scratch/phase13-audit-pass2/contact-sheets/*.jpg`

These artifacts are intentionally untracked and must not be committed.

## VALIDATION RESULTS

| Check | Result | Notes |
|---|---|---|
| `npm run verify:designless` | PASS | Build + designless gate passed; no stale `.js` emitted. |
| `npm run build` | PASS | Vite chunk-size warning only; build completed. |
| `git diff --check` | PASS | No whitespace errors. |
| `rg --files src \| rg '\.jsx?$'` | PASS | No `src/**/*.js` or `src/**/*.jsx` files found. |
| Bad eCIgn spelling scan | NEEDS REVIEW | Visible `E-SIGN Act` copy remains in `EcignWorkspaceScreen.tsx`; internal `Ecign*` identifiers and `/esign` path are code/route identifiers. |
| Raw permission-key scan | PASS WITH REVIEW | Permission keys remain as data/tiny metadata; no primary-label violation observed in the current admin matrix. |
| Raw hex/rgb/hsl/rgba scan in `src/v6` | NEEDS REVIEW | Existing raw `rgba(...)` appears inside arbitrary `shadow-[...]` classes in shell/shared components; no raw hex matches found. |
| Git status after audit | PARTIAL | `.vscode/extensions.json` was already modified; report and `scratch/` are untracked. |
