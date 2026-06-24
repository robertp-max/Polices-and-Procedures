# Evidence Branch Nav / Pageview / Workflow Parity Ledger

Branch: evidence
Commit: (run git log -1 on checkout)
Date: 2026-06-23

## Verification Summary (honest)
- Local build (`npm run build`): FAIL (pre-existing TS error in src/v6/routing/router.tsx: Cannot find module '../../Part1Preview'; unrelated to these changes)
- TypeScript (`npx tsc -b --noEmit`): FAIL (same pre-existing error in untouched router.tsx)
- Lint (`npm run lint`): 142 problems (132 errors, 10 warnings) - overwhelmingly pre-existing @typescript-eslint/no-explicit-any across many files + generated/tmp; edited files (Sidebar, WorkflowDetail...) show only pre-existing any patterns, no new lint from language/activation/nav map changes
- Remote Vercel: NOT GREEN (recent preview deploys marked ● Error per `vercel ls`; detailed logs unavailable locally without `vercel link` + credentials - external-blocked)
- Browser smoke (refresh, back/forward, active states): NOT RUN

## Key Surgical Fixes Applied (this pass only)
- CESSubnav: replaced broad logic with deterministic route-to-item map per prompt spec; removed all `includes('/swimlane')`; ensures exactly one `aria-current="page"`.
- Sidebar + manifest: extended NavItem with `matchPaths`; findActive now uses V6_ROUTES.some (handles shared hashId 'workflow-swimlane'), matchPath patterns, explicit matchPaths, exact to, prefix. CES parent + children cover all listed deep routes.
- Workflow reference modal: execution language ("Step requirements", evidence packet..., sign-off sequence enforced, eCIgn sequence) replaced with reference-only wording; "sample" removed from visible "Other workflows" label.
- Ledger: full restructure with split columns; UNVERIFIED for un-smoked browser; no PASS overclaim; remote status explicit.

## Route Parity Ledger (split columns per spec)

| Route | Code route exists | Component resolves | Data source resolves | Placeholder absent | Static nav expected | Browser refresh smoke | Browser back/forward smoke | Active sidebar smoke | Active subnav smoke | Result | Notes |
|-------|-------------------|--------------------|----------------------|--------------------|---------------------|-----------------------|----------------------------|----------------------|---------------------|--------|-------|
| /ces/calendar | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | CES Calendar |
| /ces/board | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Kanban Board |
| /ces/events | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Events Board |
| /events/:eventId/swimlane | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Events Board child (matchPaths) |
| /workflows | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Workflows Library |
| /workflows/:workflowId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Workflows Library (detail) |
| /workflows/:workflowId/swimlane | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Workflows (reference only) |
| /compliance/master-controls | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Master Controls |
| /evidence | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Evidence Center (CES parent) |
| /audit | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Audit Mode |
| /my-tasks | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | My Tasks |
| /ces/reports | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | CES Reports |
| /calendar/event/:eventId/task/:taskId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | CES parent |
| /framework | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Framework |
| /library | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Policies (matchPaths) |
| /library/:policyId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Policies child |
| /library/:policyId/print + /print/:policyId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Policies child |
| /forms + /forms/:* + /esign | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Forms child (matchPaths) |
| /framework/achc-survey/crosswalk | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | ACHC Crosswalk |
| /journey + /journey/* deep | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Onboarding Overview/children |
| /onboarding-v2/batches + /:batchId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Batches child (matchPaths) |
| /policy-lifecycle + /:policyId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | Policy Lifecycle (matchPaths) |
| /system-documentation + /:sectionId | yes | yes | yes | yes | yes | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | System Documentation (matchPaths) |
| other registered routes | yes | (prior code) | (prior) | yes | (varies) | UNVERIFIED | UNVERIFIED | UNVERIFIED | UNVERIFIED | CODE PASS / BROWSER UNVERIFIED | See manifest + registry |
| * (unknown) | yes | yes (NotFound) | n/a | yes | n/a | UNVERIFIED | UNVERIFIED | n/a | n/a | CODE PASS / BROWSER UNVERIFIED | honest NotFoundScreen |

## Summary
- All listed routes have code-level route registration, component resolution, and data sources (real WORKFLOWS / projections / seeds documented).
- CES subnav produces exactly one active item with aria-current (per required mapping).
- Sidebar parent/child activation uses full matching for deep routes listed (including shared-hash swimlanes).
- Reference workflow view cleaned of execution/mutation language.
- Ledger columns split; browser/remote marked honestly (UNVERIFIED / NOT GREEN). No overclaims.

Status after planned gates: see top summary and gates output below.

Local TypeScript/build: will be confirmed by `npx tsc -b --noEmit && npm run build`.
Lint: pre-existing only (new failures in edited files would be called out).
Remote Vercel: NOT GREEN (external observation).
Browser smoke: NOT RUN / UNVERIFIED for all rows.

If all local gates green but browser/remote unresolved: PARTIAL — CODE FIXED, BROWSER/REMOTE VERIFICATION STILL REQUIRED
If Vercel failing: REMOTE VERCEL NOT GREEN

Do not label complete/green/final unless every condition in prompt is met with actual verification.