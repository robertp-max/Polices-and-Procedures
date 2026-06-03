# Swimlane Router Context Crash Fix Report

## Root Cause

Confirmed. `GlobalModalShell` was mounted in `src/main.tsx` as a sibling of `<App />`, while the application `BrowserRouter` is created inside `src/App.tsx`. Swimlane modal content is passed through `GlobalModalBridge` into `GlobalModalShell`; that content includes React Router `<Link>` elements from `SwimlaneExecutionMap`. Because the shell was outside router context, those links could render with a null router context and trigger the `LinkWithRef` / `basename` crash.

## Files Inspected

- `src/main.tsx`
- `src/App.tsx`
- `src/components/global/GlobalModalShell.tsx`
- `src/contexts/ModalContext.tsx`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/workflows/swimlanes/SwimlaneWorkspaceOverlay.tsx`
- `src/policy/components/regulatory/ModalShell.tsx`
- `src/policy/components/ui/VeilModal.tsx`
- `package.json`

## Files Changed

- `src/main.tsx`
- `src/App.tsx`
- `Builder/_system/SWIMLANE_ROUTER_CONTEXT_CRASH_FIX_REPORT.md`

## Exact Fix Applied

- Removed `GlobalModalShell` from `src/main.tsx`.
- Imported and rendered `GlobalModalShell` in `src/App.tsx` inside the existing `BrowserRouter`.
- Preserved `AuthProvider`, `ModalProvider`, and the stale-chunk recovery listeners in `main.tsx`.
- Did not create or wrap with a second router.
- Did not change sign-in/login, print/PDF routes, AWS/CDK, eCIgn, Google Drive, regulatory stores, or the QA-WF-03 custom page.

## Routes Tested

Headless browser checks ran against `http://127.0.0.1:5173` with local demo auth enabled:

- `/workflows/CL-WF-30-swimlane`
- `/workflows/QA-WF-03-swimlane`
- `/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15`
- `/events/qapi_meeting-20260507-08/swimlane`
- `/calendar`
- `/evidence`

Additional route checks:

- `/workflows/CL-WF-30-swimlane` rendered non-blank.
- `Back to Workflow` navigated to `/workflows/CL-WF-30`.
- A generated swimlane card opened a global modal; detected modal count: `1`.

## Console Result

No console errors and no page errors were captured during the route checks. No `LinkWithRef`, `basename`, or router-context error appeared.

## Build Result

- `npm run build`: passed.
- `npm run verify:task-identity`: passed.
- `npm run validate:event-dataflow`: passed.
- `npm run check:ecign-routes`: passed.

Build emitted only existing Vite chunk-size/plugin timing warnings.

## QA-WF-03 Diff Result

`git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` remained empty before and after the fix.

## Remaining Risks

- Validation used local demo auth bypass to render protected routes in the local browser session.
- Existing unrelated working-tree changes were present before this fix and were not modified.
