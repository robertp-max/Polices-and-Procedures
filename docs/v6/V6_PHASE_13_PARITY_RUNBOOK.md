# V6 Phase 13 Parity Runbook

Phase 13 is the screenshot parity sweep defined by `V6_IMPLEMENTATION_PLAN.md`.
It is a visual QA and focused patch phase only.

## Authority

- Primary plan: `docs/v6/V6_IMPLEMENTATION_PLAN.md`
- Route/hash authority: `src/v6/routing/routeRegistry.ts`
- Visual references: `docs/v6/V6_Final/*.png`
- Caption references: `docs/v6/V6_Final/DETAILED_CAPTIONS_PER_SCREENSHOT.md`
- Current runtime target: Vite app at `http://localhost:5173`

## Hard Boundaries

- Do not seed data.
- Do not reconnect backend or preserved logic.
- Do not bulk-include `src/policy/**`.
- Do not change route literals unless fixing documented route-map drift.
- Do not introduce new app chrome.
- Do not create new `V6_Final` official screenshots during the parity pass.
- Do not use standalone mockups as implementation targets.

Phase 13 may patch:

- V6 shell/layout alignment.
- V6 component cohesion.
- Static mock view fidelity.
- Typography, spacing, glass surfaces, shadows, hairlines, tables, cards, drawers, modals, and calendar/board layout.
- Documentation that clarifies Phase 13 acceptance.

## Count Invariant

- Registered route paths: 54, including `/login`.
- Root `/` redirect to `/dashboard`: router plumbing, not a coverage row.
- Overlay/state registry: `modal-system`, `drawer-system`, `popover-system`, `personal-ops`.
- Overlay/state registry entries are not routes and must be checked only inside their real parent context.

## Current Automation

Required before and after Phase 13 patches:

```powershell
npm run build
npm run verify:designless
rg --files src | rg '\.jsx?$'
```

Optional baseline:

```powershell
npm run lint
```

Manual/helper screenshot capture:

```powershell
npm run dev:web
$env:BASE_URL='http://localhost:5173'
node scripts/captureUiVerifyScreens.mjs
```

Automation not yet first-class:

- Full 54-route screenshot diff.
- Axe serious/critical route sweep.
- Responsive 360/768/1024/1280/1536 route sweep.
- Route count fixture.
- Positive fixture for V6-native route reuse.

## Reference Exceptions

| Hash id | Route | Phase 13 reference rule |
|---|---|---|
| `events-board` | `/ces/events` | `INFERRED_FROM_V6_SYSTEM`; use `ces-board`, dashboard queue language, and current Events Board runtime as baseline. |
| `login-page` | `/login` | `INFERRED_FROM_V6_SYSTEM`; use shell logo/glass language, but login renders outside app shell. |
| `policy-lifecycle-detail` | `/policy-lifecycle/:policyId` | Reuse `46-policy-lifecycle.png`; validate detail route does not create a bare `/:policyId`. |
| `modal-system` | non-route | Use `33-modal-system.png`; verify modal primitive only in parent context. |
| `drawer-system` | non-route | Use `17-drawer-system.png`; verify drawer primitive only in parent context. |
| `popover-system` | non-route | Use `47-popover-system.png`; verify popover/dock behavior only in parent context. |
| `personal-ops` | non-route | No PNG; verify top-right dock / personal operations panel state from runtime. |

## Agent Work Packets

### Agent 1 - Route And Shell Parity

Scope:

- `src/v6/routing/**`
- `src/v6/shell/**`
- `src/index.css`

Checks:

- 54 `V6_ROUTES` entries, including `/login`.
- No registered route renders `V6RoutePlaceholder`.
- Root redirect is not counted as a view.
- Sidebar/dock/personal panel match V6 light shell.
- No page header truncation under scroll masks.
- No new chrome.

### Agent 2 - Overview And CES

Scope:

- Dashboard, clinicians, patients, master calendar, staffing calendar.
- CES calendar, CES board, Events Board, workflows, workflow swimlane, master controls, audit, evidence, reports, mobile incident, my tasks.

Priority checks:

- Calendar and CES event swimlane remain embedded in real parent contexts.
- CES Calendar is full-width and not using the removed top metrics/right rail pattern.
- Board lane cards are justified, glass surfaces are consistent, and event chips do not overflow.
- Workflows drawer and swimlane modal states remain V6-native.

### Agent 3 - Taxonomy, Forms, eCIgn, Viewers

Scope:

- Framework, ACHC Survey, ACHC Crosswalk.
- Policy Library, Policy Detail, Lifecycle, Lifecycle Detail.
- Forms Library, Form Viewer, eCIgn Workspace.
- Artifact Viewer, Reference Viewer, Surveyor Viewer.

Priority checks:

- Crosswalk route is `/framework/achc-survey/crosswalk`, not a query string.
- eCIgn route is `/forms/:formId/esign`, not a mode flag on `/forms/:formId`.
- eCIgn spelling is exact.
- Policy detail sticky tab/header behavior masks content cleanly.
- No raw permission keys or code-style labels as primary UI.

### Agent 4 - Onboarding, Admin, System

Scope:

- Journey overview, Journey v1, Module Player, Appendix F, Supervisor, Journey Admin, User Guide.
- Onboarding v2 dashboard, activation, batches, batch detail, audit, governance.
- Admin groups, roles, permissions, users.
- Hubstaff, system docs, help, governance.

Priority checks:

- Phase 12.2.a embedded states still sit inside parent pages.
- Admin permissions uses compact tabs, not redundant card stacks.
- Journey and onboarding modals/drawers use normal V6 modal/drawer styling.
- Human labels replace raw keys where labels are primary.

### Agent 5 - Stage-C Gate Gap Owner

Scope:

- `package.json`
- `scripts/check-designless.mjs`
- future `scripts/verifyV6*.ts` tasks

Priority checks:

- Document missing gates.
- Propose route manifest format.
- Do not block Phase 13 manual parity on missing automation.

## Per-Route Review Rubric

Each route gets one status:

- `PASS`: visually close enough for Phase 14 responsive/a11y.
- `PATCH`: visible drift that can be fixed without backend, seed, or route changes.
- `DEFER`: requires Stage B logic, real data, auth/backend, or a new accepted design.

For every `PATCH`, record:

- Hash id.
- Parent route/path.
- Reference PNG or inferred source.
- Defect category: layout, typography, card/table, modal/drawer, calendar/board, shell, copy, spelling, overflow, responsive.
- File(s) likely touched.
- Whether the patch is safe for Phase 13.

## Phase 13 Exit Criteria

- `npm run build` passes.
- `npm run verify:designless` passes.
- No stray emitted `.js` under `src`.
- 54 route rows reviewed.
- Overlay/state registry reviewed in parent context.
- `events-board`, `login-page`, and `policy-lifecycle-detail` reference exceptions explicitly marked.
- All Phase 13-safe visual patches either completed or listed as remaining `PATCH`.
- All Stage B/backend/data items listed as `DEFER`.
