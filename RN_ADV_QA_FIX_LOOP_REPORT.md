# RN_ADV_QA_FIX_LOOP_REPORT.md

## Setup Note
This file is the main loop report for the RN Advanced Training QA-Fix Loop.

The trigger for this prompt is: after each QA run, review the latest QA output, defect ledger, browser/runtime evidence, console logs, build/lint/test logs, and module reports.

**Loop Rules (embedded prompt):**
1. Read the latest QA result.
2. If any issue (P0/P1/P2/P3, console error, failed route, missing metadata, etc.):
   - Update defect ledger
   - Fix the issue (code, data, config)
   - Rerun relevant validation (git, build, lint, test, runtime checks)
   - Rerun full QA
   - Record in this report and per-pass file
   - Continue loop

3. Only stop when ALL are zero:
   - P0 = 0, P1 = 0, P2 = 0, P3 = 0
   - Console errors = 0
   - Route failures = 0
   - Build/lint/test issues from touched files = 0
   - PHI = 0
   - Missing evidence metadata = 0
   - Missing required module data = 0
   - Missing runtime screenshot evidence = 0

**Each loop must run:**
- git status --short
- git diff --name-status
- git diff --stat
- git diff --check
- npm run build > rnadv-loop-build.log ; echo exit code ; tail log
- npm run lint > ... same
- npm test > ... same
- Dev server checks for the routes, capture "screenshots" (describe or note paths), console, titles.

**Priority:** P0 first, then P1, etc.

**Evidence Contract:** Completion artifacts must have full fields including policy_id, workflow_id, event_id, etc. (snake and camel if needed).

**Searches:** Run the Select-String for GAO/representative/..., policy_id etc, PHI patterns each loop.

**Output after each pass:** 
- ZERO ISSUES — STOP CONDITION MET
- or ISSUES REMAIN — FIX LOOP CONTINUES

Initial setup done on 2026-07-01. Baseline git captured.

Current status: Awaiting first QA run to trigger loop.
