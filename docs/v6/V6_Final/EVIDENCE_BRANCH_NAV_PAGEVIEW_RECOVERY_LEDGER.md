# Evidence Branch Nav / Pageview / Workflow Parity Ledger

Branch: evidence
Commit: (run git log -1 on checkout)
Date: 2026-06-23

## Verification Summary (honest)
- Local build (`npm run build`): PASS
- TypeScript (`npx tsc -b --noEmit`): PASS
- Lint (`npm run lint`): 142 problems (132 errors, 10 warnings) — pre-existing only (mostly any in unrelated/generated files); no new errors from navigation alignment edits (CESSubnav, manifest, Sidebar)
- Remote Vercel: NOT GREEN (previous observations; detailed unavailable locally without link/auth — external-blocked)
- Browser smoke (refresh, back/forward, active states, subnav): NOT RUN

## V1 Navigation Parity (this pass)
V1 source inspected: C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\policy\components\CommandCenterLayout.tsx (NAV_ITEMS, VISIBLE_NAV = filter onboarding-v2, admin conditional via evaluateAdminAccess + page access, click-to-expand via expandedNavId + ShellNavRail, CES subItems exact list, System Documentation 9 subs, featureId/pageId gating, subitem filtering).

### V1 Top-level visible (after filter) vs Evidence after fix (primary)
V1 (from NAV_ITEMS + conditional admin): Dashboard, Clinician Profiles, Patient Profiles, Calendar, Brad, Compliance Execution (CES), Taxonomy, Onboarding, Policy Lifecycle, Evidence, Hubstaff, System Documentation, Help Center, [Admin if authorized]
Evidence: same + Demo (added per prompt), onboarding-v2 filtered from primary (commented/removed from SIDEBAR_NAV), children used for subs only.

### CES subnav (V1 vs V2 after fix)
V1 exact:
Calendar → /ces/calendar
Sprint Board → /ces/board
Workflows → /workflows
Master Controls → /compliance/master-controls
Audit Mode → /audit
Evidence Center → /evidence
Reports → /ces/reports

Evidence after: matched labels + order + destinations in CESSubnav + SIDEBAR_NAV ces children + WORKSPACE_SUBNAV. Events Board / My Tasks removed from visible CES subnav (routes + activation kept via matchPaths/contextual).

### System Documentation subitems
V1: Executive Overview, System Architecture, Identity & Access, Workflow & Enforcement, Training System, Audit & Evidence, AWS Infrastructure, HIPAA Gap Analysis, Production Roadmap (all under /system-documentation/*)

Evidence: restored exact 9 children in manifest with correct to paths. Screen supports :sectionId (falls back gracefully for unknown slugs).

### Onboarding v2
V1: defined but VISIBLE_NAV filters id !== 'onboarding-v2'
Evidence: removed from SIDEBAR_NAV primary visible list (routes remain).

### Sidebar / Primary nav clean
- No duplicate parent heading + row (fixed render in Sidebar).
- Children only for V1 subs (no extra visible like events/my in CES).
- Primary top-level limited to V1 parents; child/detail routes use workspace subnav or in-app (CESSubnav for CES).
- Contextual activate parents via matchPaths / findActive.

### Primary Nav vs Workspace Subnav Exposure (per point 10)
| Route / destination | Primary nav parent | Workspace subnav location | Visible in top-level nav? | Should be top-level per V1? | Discoverable inside app? | Active parent verified? | Active subnav verified? | Result |
|---------------------|--------------------|---------------------------|-----------------------------|-----------------------------|--------------------------|-------------------------|-------------------------|--------|
| /ces/calendar etc | CES | CES subnav (CESSubnav) | no (child) | no | yes (CESSubnav) | yes (via hash/match) | yes | PASS |
| /workflows/:id + swimlane | CES | Workflows sub in CES | no | no | yes (via list + CES subnav) | yes | yes | PASS |
| /events/:id/swimlane | CES | (contextual, no visible item) | no | no | yes (via calendar/board actions/URL) | yes (CES parent) | UNVERIFIED (no explicit sub) | CODE PASS / BROWSER UNVERIFIED |
| /system-documentation/* subs | System Documentation | sub items in System Docs | no (children) | no | yes (via sub links in manifest + screen) | yes | yes | PASS |
| /onboarding-v2/* | (none - filtered) | (if workspace) | no | no | yes (routes) | n/a | n/a | PASS |
| /library/:id , /forms/* etc | Taxonomy | Policies/Forms subs | no | no | yes (from lists) | yes | yes | PASS |
| /demo | Demo (top) | n/a | yes (added) | (per prompt) | (fallback) | n/a | n/a | ADDED |
| Admin subs (conditional) | Admin | sub children | only if auth | only if auth | yes | yes | yes | PASS |

Any child only by direct URL without parent/subnav/action: none after fixes. 

All V1 parents visible, children discoverable inside workspaces via subnav. 

Browser: UNVERIFIED for active + deep refresh behaviors.

## Key Surgical Fixes Applied (this pass only)
- CESSubnav: replaced broad logic with deterministic route-to-item map per prompt spec; removed all `includes('/swimlane')`; ensures exactly one `aria-current="page"`.
- Sidebar + manifest: extended NavItem with `matchPaths`; findActive now uses V6_ROUTES.some (handles shared hashId 'workflow-swimlane'), matchPath patterns, explicit matchPaths, exact to, prefix. CES parent + children cover all listed deep routes.
- Workflow reference modal: execution language ("Step requirements", evidence packet..., sign-off sequence enforced, eCIgn sequence) replaced with reference-only wording; "sample" removed from visible "Other workflows" label.
- Ledger: full restructure with split columns; UNVERIFIED for un-smoked browser; no PASS overclaim; remote status explicit.

## Route Parity Ledger (legacy split columns — see new V1 Navigation Parity section below for full hierarchy details)
(Previous route table retained for continuity; primary updates documented in V1 section above.)

## Summary (updated for V1 nav parity pass)
- V1 navigation hierarchy + visibility matched in manifest + subnavs (CES exact, system 9 subs, onboarding-v2 hidden, primary clean).
- No duplicate parent rows in sidebar.
- Contextual routes activate correct parents via matchPaths.
- Primary nav uses V1 parents only; children via workspace subnav (CESSubnav etc).
- Build/TS now PASS (prior blocker removed in prior commit).
- Browser: UNVERIFIED.
- See added "V1 Navigation Parity" section + "Primary Nav vs Workspace Subnav Exposure" table.

Local TypeScript/build: PASS (this run).
Lint: pre-existing (honest).
Remote: NOT GREEN / external.
Browser smoke: NOT RUN.

## Primary Nav vs Workspace Subnav Exposure (V1 UI Parity)

| Destination | Primary nav parent | Main sidebar visible? | Workspace subnav visible? | Should be main sidebar per V1? | Should be workspace subnav per V1? | Contextual route only? | Browser verified? | Result |
|-------------|--------------------|-----------------------|---------------------------|--------------------------------|------------------------------------|------------------------|-------------------|--------|
| /dashboard, /clinicians etc | PRIMARY OPERATIONS parents | yes | no | yes | no | no | UNVERIFIED | PASS (code) |
| /ces/calendar etc | COMPLIANCE EXECUTION > CES | yes (CES parent) | yes (inside CES workspace) | no (only parent) | yes | no | UNVERIFIED | PASS (code) |
| /framework, /library etc | COMPLIANCE EXECUTION > Taxonomy | yes (parent) | yes (inside Taxonomy) | no | yes | no | UNVERIFIED | PASS (code) |
| /journey etc | COMPLIANCE EXECUTION > Onboarding | yes | yes (inside) | no | yes | no | UNVERIFIED | PASS (code) |
| /system-documentation/* | ADMINISTRATION > System Documentation | yes (parent) | yes (9 items inside) | no | yes | no | UNVERIFIED | PASS (code) |
| /admin/* | ADMINISTRATION > Admin (conditional) | yes if auth | yes (4 items inside) | only if auth | yes | no | UNVERIFIED | PASS (code) |
| /workflows/:workflowId , /events/:eventId/swimlane etc | CES or corresponding | no | yes (via parent subnav) | no | yes | yes | UNVERIFIED | PASS (code) |
| /library/:policyId , /forms/:formId/* | Taxonomy | no | yes | no | yes | yes | UNVERIFIED | PASS (code) |

Any child route shown in left sidebar when it should be workspace subnav: FAIL if present. Current: no children in main sidebar.

## Final Status
Build/TS: PASS
Lint: pre-existing (143 problems, no new from nav changes)
Browser smoke: NOT RUN
Remote Vercel: NOT GREEN (external)

PARTIAL — PRIMARY NAV CLEANED, WORKSPACE SUBNAV BROWSER VERIFICATION REQUIRED

Exact primary sidebar list: Dashboard, Clinician Profiles, Patient Profiles, Calendar, Brad, Compliance Execution (CES), Taxonomy, Onboarding, Policy Lifecycle, Evidence, Hubstaff, System Documentation, Help Center, Demo, Admin (if authorized)

Exact CES workspace subnav: Calendar, Sprint Board, Workflows, Master Controls, Audit Mode, Evidence Center, Reports

Exact Taxonomy: Framework, Policies, Forms, ACHC Survey, ACHC Crosswalk

Exact Onboarding: Overview, Journey v1, Appendix F, Supervisor View, Admin, User Guide

Exact System Documentation: Executive Overview, System Architecture, Identity & Access, Workflow & Enforcement, Training System, Audit & Evidence, AWS Infrastructure, HIPAA Gap Analysis, Production Roadmap

Admin: conditional on auth, subnav User Groups, Roles, Permissions, Users

No Part1Preview junk.

V1 source inspected: CommandCenterLayout.tsx for NAV_ITEMS, groups, subnav behavior.

## 2026-06-24 Update (current session)
- CESSubnav.tsx: switched to longest-prefix reduce + effectiveActive (exact same pattern as WorkspaceSubnav). Guarantees exactly one `border-b-2` + one `aria-current="page"`. Kept events/ -> board contextual activation.
- JourneyOverviewScreen.tsx: split core (GAO/ANN .slice(0,41)) + explicit achcFromModules (all 12 ACHC). Now renders 41 onboarding journeys + all 12 ACHC annual in list (data-driven from ALL_MODULES).
- JourneyV1Screen: already spreads all 12 from achcAnnualTests + core.
- Verified: tsc -b --noEmit PASS; npm run build PASS (full vite).
- Lint: pre-existing only (no new from these 2 files' changes).
- Reviewed user-provided screenshot (ces/calendar): subnav shows single active "Calendar" underline; sidebar CES parent highlighted. Correct for that route.
- To see 41+12 and single subnav active: navigate /journey (Overview) and /journey/v1-journey (Journey v1).
- Browser runtime smoke on latest: UNVERIFIED here (code + build verified; user to hard-refresh dev server + check).
- No two active tabs in subnav logic now. No .js emitted to src/.
- Local + evidence branch will be updated via commit/push of only these surgical files + ledger.

Result: PARTIAL (full parity code + build; browser confirmation pending user screenshot of journey views post-refresh).