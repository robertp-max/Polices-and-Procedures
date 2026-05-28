# Agent 10 Visual/UX UAT Findings

Scope: assigned testers DON-01, ADM-01, CM-06, HCP-03, ADM-07. Perspectives covered: new-user first impression and power-user speed/confidence for CES calendar/task drawer, Evidence Center, Audit Mode, Policy Library, Forms, ACHC survey alignment, demo route, light/dark, and mobile responsive behavior.

Execution mode: UAT only. No source files changed.

## Executive Verdict

FAIL for production-demo polish and survey-defensible visual UX.

Core routes loaded without console errors in the sampled pass, but the experience is not demo-ready. A user-facing Brad onboarding panel auto-opened over every major route, mobile views were largely blocked by that panel, Evidence Center opened with 0% audit-ready/locked evidence and metadata-only empty states, and several surfaces still show internal/demo/training overlays or crowded legacy-style cards that conflict with the V3 rules.

## Score List

Scores are 1-5 in this order: first impression, professional polish, layout balance, readability, speed of task completion, confidence completed, survey/audit defensibility, trust in artifact/evidence, navigation clarity, demo readiness.

| Surface | Scores |
|---|---|
| Dashboard / executive work queue | 3, 3, 2, 3, 2, 2, 2, 2, 3, 2 |
| CES Calendar | 3, 3, 3, 2, 2, 2, 2, 2, 3, 2 |
| CES Event / Task drawer | 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 |
| Evidence Center folder tree | 2, 2, 2, 3, 2, 1, 1, 1, 3, 1 |
| Evidence Center file ledger | 2, 2, 2, 3, 1, 1, 1, 1, 2, 1 |
| Audit Mode / survey readiness | 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 |
| Policy Library | 3, 3, 3, 3, 3, 3, 3, 3, 3, 3 |
| Policy Detail | 3, 2, 2, 2, 2, 2, 2, 2, 2, 2 |
| Forms Library | 3, 2, 2, 3, 2, 2, 2, 2, 2, 2 |
| Form Viewer | 3, 2, 3, 3, 2, 2, 2, 2, 2, 2 |
| ACHC Survey Alignment | 2, 2, 2, 2, 2, 2, 2, 2, 2, 2 |
| Mobile responsive pass | 2, 1, 2, 2, 1, 1, 1, 1, 2, 1 |

## Severity-Ranked Visual Defects

### P1 - Brad onboarding blocks core workflows across all major routes

The Brad panel auto-opened on Dashboard, Calendar, Evidence, Audit, Library, Forms, ACHC, Demo, and mobile. On desktop it covers right-side details and action areas; on mobile it consumes most of the viewport and blocks tabs, filters, calendar cells, and evidence content. This prevents a clean new-user or sales-demo pass and hides critical actions for power users.

Screenshots:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-desktop-dark-calendar.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-mobile-dark-calendar.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-mobile-dark-evidence.png`

### P1 - Evidence Center does not create trust in artifacts or survey proof

Evidence Center opens with 244 events, 5114 tasks, 10716 requirements, 0% completion, 0% audit-ready, and 0 locked evidence. The file ledger default event shows "No evidence uploaded" and upload blocked until a CES task context is selected. For a production demo and surveyor persona, this reads as metadata-only and not artifact-defensible.

Screenshots:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-desktop-dark-dismissed--evidence.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--evidence-file-ledger.png`

### P2 - Internal/test overlays and training labels leak into demo-critical screens

The visible Guided UAT checklist remains on top of Calendar, Audit, Evidence, Policy Detail, and Forms. Event drawer details show "SANDBOX / TRAINING PLAYGROUND", "RESET SANDBOX", and "RESET ALL Q1/Q2" in the same surface as compliance status and audit readiness. These labels may be useful for QA, but they undermine production-demo credibility for ADM-07 and survey readiness confidence for ADM-01.

Screenshots:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--calendar-monthly-oig-sam-exclusion-check.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--audit-annual-governance-packet-review.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--library-gv-ea-001.png`

### P2 - Audit Mode is visually dense and weak for survey defensibility

Audit Mode exposes many chips, badges, counters, validation panels, and instance rows in one view. The selected audit details are partially competed with by overlays, red validation panels, and repeated status containers. The captured text also includes mojibake characters such as `Â·` and `â†’`, which is unacceptable in survey-facing content.

Screenshots:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-desktop-dark-audit.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--audit-annual-governance-packet-review.png`

### P2 - ACHC Survey Alignment is cramped and visually mixed

The ACHC surface uses dense rows, pale cyan row bands, many pills, dashed separators, and a persistent overlay that covers right-side checklist content. Filters are low-contrast in dark mode. This feels like a data-debug grid rather than a polished surveyor evidence explorer.

Screenshot:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-desktop-dark-dismissed--framework-achc-survey.png`

### P2 - Forms and Policy Detail retain mixed old/new visual language

Forms Library uses many small boxed chips/cards and dense artifact tiles. Form Viewer shifts into a bright paper/print surface inside a dark app shell, with top controls and guided overlay competing with the document. Policy Detail has a very dark content area, left table of contents, floating guided checklist, and metadata clusters that reduce readability and confidence for new users.

Screenshots:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-desktop-dark-forms.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--forms-universal-policy-acknowledgment-form.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail--library-gv-ea-001.png`

### P3 - V3 design rule violations remain detectable

Automated style heuristics detected transform matrices on the persistent top-right user/avatar control across main shell routes. The dashboard and forms surfaces also show hundreds of card-like containers, which conflicts with the V3 goal of whitespace/typography as hierarchy and avoiding redundant boxes.

Evidence:
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-browser-sweep-results.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-dismissed-overlay-results.json`

## Positive Findings

- Sampled primary routes returned HTTP 200.
- No console errors or page errors were captured in the browser sweep.
- No horizontal overflow was detected on sampled desktop or mobile routes.
- Calendar, Sprint Board, Kanban, Gantt, Evidence, Audit, Library, Forms, ACHC, and Demo were reachable in the sampled local run.

## Screenshots / Artifacts

- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-browser-sweep-results.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-dismissed-overlay-results.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-detail-interaction-results.json`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-*.png`
- `Builder/_system/UAT_AGENT_FINDINGS/agent10-visual-ux-defects.csv`

## Recommended Next Fix Phase

Run a V3 production-demo polish hardening phase: suppress or gate onboarding/test overlays for demo mode, seed at least one complete evidence/audit/signed-artifact story, simplify Audit/Evidence visual hierarchy, remove sandbox labels from production-demo surfaces, and finish dark/mobile polish before broader functional UAT signoff.
