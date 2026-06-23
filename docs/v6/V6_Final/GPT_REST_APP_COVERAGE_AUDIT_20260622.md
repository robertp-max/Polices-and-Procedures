STATUS: PASS

# GPT Rest-App V6 Coverage Audit - Login and Prototype Surfaces

Date: 2026-06-22
Worktree: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_GPT_REST`
Branch: `phase18/app-v6-coverage-audit-login`
Baseline: `v2/designless-baseline @ 55c5402c84880e54e1708039f642a1f7ce58800c`

## Summary

- Login Page is not missing from the audited V2 GPT worktree: `/login` is registered, routed outside the V6 shell, and renders `LoginScreen`.
- Login Page is still not a full visual/interaction match to `docs/v6/V6_DESIGN.html`: the prototype has the "Welcome Back" card, password reveal, loading state, toast behavior, CloudFront logo fallback, and FontAwesome icons in the design source. The live V2 component is a simplified V6-native light card with lucide icons and no auth behavior.
- The reported dark login screen was not reproduced from this audited branch. In this branch, `src/v6/screens/pageviews/LoginScreen.tsx` uses `bg-canvas`, `bg-surface-glass`, and `/ci-logo-gray.png`. If a dark login appears in preview, the likely cause is a different checkout/branch, stale preview server, or old preview target rather than this worktree.
- Login was previously treated as auth-last and `INFERRED_FROM_V6_SYSTEM` rather than a numbered PNG-backed surface. That explains why it is less complete than the main pageview set.
- Safe GPT fix next: visual-only parity pass on `LoginScreen.tsx`, preserving `/login` route behavior and avoiding auth/Cognito/server changes.
- Other high-signal coverage gaps: overlay prototypes are not separately routed; `modal-system` and `popover-system` are registry-only IDs, while `drawer-system` can be reached only through `?v6-overlay=drawer-system` and displays a combined overlay demo. User Guide is implemented inside monolithic `RepresentativeScreens.tsx`, which also contains reserved eCIgn/CES/ACHC rendering, so any User Guide changes need extra lane caution.

## Login Page Finding

1. Login Page is present in `V6_DESIGN.html`.
   - Prototype registration: `view('login-page', 'Prototypes & Overlays', 'Login Page', 'prototype://login', 'lock', 'login-template', ...)`.
   - Prototype renderer: `LoginPageFull`.
2. Login Page is listed in route/pageview inventory.
   - `V6_PAGEVIEW_INVENTORY.md` lists `login-page` as row 53, route `/login`, template `login`, inferred from V6 system.
   - `V6_APP_MAP.md` lists `/login` as hash `login-page`, the only auth-entry screen.
3. `/login` exists in the actual V2 app.
   - `src/v6/routing/routeRegistry.ts` registers `{ path: '/login', hashId: 'login-page', template: 'login', group: 'Auth' }`.
   - `src/v6/routing/router.tsx` routes it outside `V6Shell`.
4. Current component:
   - `RepresentativeScreen` maps `login-page` to `LoginScreen`.
   - File: `src/v6/screens/pageviews/LoginScreen.tsx`.
5. Why dark vs light?
   - In this audited worktree, the login component is light. It does not explain a dark screen by itself.
   - A dark login observation likely comes from a different checkout/branch, stale browser/server preview, or an older auth implementation.
6. Was login intentionally excluded or missed?
   - It was not excluded entirely. It was classified as `INFERRED_FROM_V6_SYSTEM`, auth-last, no PNG, and wired after the main shell surfaces.
   - The full prototype behavior appears partially missed/deferred rather than forbidden.
7. Is implementing the V6 Login Page in GPT lane safe?
   - Yes, if visual-only and limited to `src/v6/screens/pageviews/LoginScreen.tsx`.
   - Do not touch `src/auth/**`, Cognito/server routes, package files, or runtime stores.
8. Files needed for a safe visual-only fix:
   - `src/v6/screens/pageviews/LoginScreen.tsx`
   - Optionally no other files. Use existing primitives, lucide icons, and `/ci-logo-gray.png`.
9. Does it require auth/Cognito logic changes?
   - No. The safe next pass can preserve the current demo/static form behavior.
10. Can it be visual-only while preserving preview login behavior?
   - Yes. Add visual parity states such as password reveal, loading affordance, remembered-device copy, and local toast without wiring real auth.

## Coverage Table

| prototype_id | prototype_label | expected_route | actual_route | actual_component | exists_in_app_yes_no | visual_variant_matches_yes_no | data_source_status | lane_owner | risk_level | classification | recommended_action |
|---|---|---:|---:|---|---|---|---|---|---|---|---|
| `login-page` | Login Page | `/login` | `/login` | `LoginScreen` | YES | PARTIAL | Static/demo auth form | GPT/Auth visual only | Medium | `IMPLEMENTED_WRONG_VARIANT` | Visual-only parity pass in `LoginScreen.tsx`; no auth logic changes. |
| `modal-system` | Modal System | overlay primitive | none | `OverlaySystemScreen` via combined demo only | PARTIAL | PARTIAL | Static/demo overlay content | Shared/GPT with caution | Medium | `PROTOTYPE_ONLY_NOT_ROUTED` | Decide whether overlay demo routes/query params are needed; avoid reserved workflow/audit copy. |
| `drawer-system` | Drawer System | overlay primitive | `?v6-overlay=drawer-system` | `OverlaySystemScreen` | PARTIAL | PARTIAL | Static/demo overlay content | Shared/GPT with caution | Medium | `IMPLEMENTED_WRONG_VARIANT` | Split/label drawer-specific demo or document query-param access. |
| `popover-system` | Popover and Menu System | overlay primitive | none | Combined demo section inside `OverlaySystemScreen` | PARTIAL | PARTIAL | Static/demo overlay content | Shared/GPT with caution | Medium | `PROTOTYPE_ONLY_NOT_ROUTED` | Add dedicated non-route state/demo only after owner decision. |
| `personal-ops` | Personal Ops Drawer State | state primitive | topbar toggle | `PersonalOpsPanel` | YES | PARTIAL | Store-backed UI state | Shared/GPT with caution | Low | `IMPLEMENTED_MATCHES` | No immediate action; keep as state, not route. |
| `admin-groups` | Admin User Groups | `/admin/user-groups` | `/admin/user-groups` | `AdminGroupsScreen` | YES | PARTIAL | Static/demo admin data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future Stage-B/honest-data pass. |
| `admin-roles` | Admin Roles | `/admin/roles` | `/admin/roles` | `AdminRolesScreen` | YES | PARTIAL | Static/demo admin data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future Stage-B/honest-data pass. |
| `admin-permissions` | Permission Catalog | `/admin/permissions` | `/admin/permissions` | `AdminPermissionsScreen` | YES | PARTIAL | Static/demo permission data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future Stage-B/honest-data pass. |
| `admin-users` | User Assignments | `/admin/users` | `/admin/users` | `AdminUsersScreen` | YES | PARTIAL | Static/demo user data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future Stage-B/honest-data pass. |
| `system-docs` | System Documentation | `/system-documentation/:sectionId` | `/system-documentation/:sectionId` | `SystemDocsScreen` | YES | PARTIAL | Static rows with Batch 1 baseline facts | GPT | Low | `IMPLEMENTED_MATCHES` | Already aligned in Batch 1; future param-specific detail optional. |
| `help-center` | Help Center | `/help/*` | `/help/*` | `HelpCenterScreen` | YES | PARTIAL | Uses policy/form/help counts | GPT | Low | `IMPLEMENTED_MATCHES` | Already aligned in Batch 1; future article detail optional. |
| `governance` | Governance | `/governance` | `/governance` | `GovernanceScreen` | YES | PARTIAL | Static/demo governance data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future copy/data honesty pass. |
| `hubstaff` | Hubstaff | `/hubstaff` | `/hubstaff` | `HubstaffScreen` | YES | PARTIAL | Static/demo sync rows | GPT | Low | `IMPLEMENTED_MATCHES` | Recommended next Stage-B batch. |
| `user-guide` | User Guide | `/journey/guide` | `/journey/guide` | `DocsScreen` inside `RepresentativeScreens.tsx` | YES | PARTIAL | Static guide entries | GPT with monolith caution | Medium | `IMPLEMENTED_MATCHES` | Defer or extract before edits; file contains reserved route renderers. |
| `framework` | Framework root | `/framework` | `/framework` | `FrameworkScreen` | YES | PARTIAL | Static count appears stale (`269`) | GPT, root only | Medium | `IMPLEMENTED_WRONG_VARIANT` | Safe only for root screen; avoid ACHC/survey routes. |
| `dashboard` | Dashboard | `/dashboard` | `/dashboard` | local `DashboardScreen` in `RepresentativeScreens.tsx` | YES | PARTIAL | Static/demo ops data | GPT with monolith caution | Medium | `IMPLEMENTED_MATCHES` | Future pass should avoid CES sections in same file. |
| `clinicians` | Clinicians | `/clinicians` | `/clinicians` | local `ProfileListScreen` | YES | PARTIAL | Static/demo profile data | GPT with monolith caution | Medium | `IMPLEMENTED_MATCHES` | Future isolated extraction or cautious edit only. |
| `patients` | Patients | `/patients` | `/patients` | local `ProfileListScreen` | YES | PARTIAL | Static/demo profile data | GPT with monolith caution | Medium | `IMPLEMENTED_MATCHES` | Future isolated extraction or cautious edit only. |
| `staffing-calendar` | Staffing Calendar | `/staffing-calendar` | `/staffing-calendar` | local `CalendarScreen` | YES | PARTIAL | Static/demo staffing events | GPT with monolith caution | Medium | `IMPLEMENTED_MATCHES` | Future isolated extraction or cautious edit only. |
| `journey-overview` | Journey Overview | `/journey` | `/journey` | `JourneyOverviewScreen` | YES | PARTIAL | Onboarding data/static mix | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future audit. |
| `journey-v1` | Journey v1 | `/journey/v1-journey` | `/journey/v1-journey` | `JourneyV1Screen` | YES | PARTIAL | Onboarding data/static mix | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future audit. |
| `journey-admin` | Journey Admin | `/journey/admin` | `/journey/admin` | `JourneyAdminScreen` | YES | PARTIAL | Static/admin curriculum data | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future audit. |
| `onboarding-v2-dashboard` | Onboarding v2 Dashboard | `/onboarding-v2/dashboard` | `/onboarding-v2/dashboard` | `OnboardingV2DashboardScreen` | YES | PARTIAL | Onboarding v2 store/catalog mix | GPT | Low | `IMPLEMENTED_MATCHES` | Safe future audit. |
| `ecign-workspace` | eCIgn Signing Workspace | `/forms/:formId/esign` | `/forms/:formId/esign` | `EcignWorkspaceScreen` | YES | not audited | eCIgn owned | Claude | High | `RESERVED_CLAUDE_LANE` | Do not touch. |
| `ces-calendar`, `ces-board`, `events-board`, `workflows`, `workflow-swimlane`, `master-controls`, `audit-mode`, `evidence-center`, `ces-reports`, `my-tasks`, `mobile-incident` | CES/QAPI/workflow/evidence/audit surfaces | multiple | multiple | multiple | YES | not audited | CES owned | Claude | High | `RESERVED_CLAUDE_LANE` | Do not touch. |
| `achc-survey`, `achc-crosswalk`, `surveyor-viewer`, `artifact-viewer` | ACHC/surveyor/artifact surfaces | multiple | multiple | multiple | YES | not audited | Survey/evidence adjacent | Claude/reserved | High | `RESERVED_CLAUDE_LANE` | Do not touch without owner decision. |

## Safe GPT Next Batch

Recommended next implementation batch: **Login Page visual-only parity**.

Exact files:

- `src/v6/screens/pageviews/LoginScreen.tsx`

Expected changes:

- Keep `/login` outside `V6Shell`.
- Preserve demo/static submit behavior; no Cognito or server wiring.
- Match the light V6 login prototype more closely using current tokens and primitives.
- Replace prototype-only FontAwesome concepts with lucide icons.
- Add password reveal and local loading/toast states only if kept self-contained.
- Continue using `/ci-logo-gray.png`; do not use CloudFront or external fallback assets.

Validation plan:

- `npm run verify:designless`
- `npm run build`
- `npx tsc -p tsconfig.app.json --noEmit`
- `npx eslint src/v6/screens/pageviews/LoginScreen.tsx`
- `git diff --check`
- `rg --files src | rg "\.js$"`
- Smoke `/login`, `/dashboard`, `/help/index`, `/system-documentation/section-sample`, `/forms`, `/forms/form-sample/esign`, `/ces/calendar`.

## Do-Not-Touch List

- eCIgn: `src/policy/ecign/**`, `src/policy/ecign/pathB/**`, `src/v6/screens/pageviews/EcignWorkspaceScreen.tsx`, `/forms/:formId/esign`.
- CES/QAPI/workflow/evidence/audit: CES calendar/board/events/workflows/swimlane/master-controls/audit/evidence/reports/my-tasks/mobile incident and related stores/modules.
- Server/API/store wiring: `server/**`, auth/Cognito runtime, Google Drive/Evidence integrations, package/lock files.
- Original checkout: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2`.

