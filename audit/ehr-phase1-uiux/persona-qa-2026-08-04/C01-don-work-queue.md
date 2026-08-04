# C01 — DON — Work queue clinical SLAs & ownership
- Routes: `#/work-queue`, `#/today`, `#/messages`
- Base: `http://127.0.0.1:5194` (HashRouter)
- Worktree: `apps/ehr-prototype` @ ehr_phase1
- Method: Source + synthetic data review (`WorkQueueScreen.tsx`, `TodayScreen.tsx`, `MessagesScreen.tsx`, `data/workspace.ts`, `data/clinical.ts`); prior route UAT (`new-pageviews-route-uat.md`) confirms `#/work-queue` and `#/today` load clean. Live browser fetch to 127.0.0.1 blocked from this agent host; no app source changed.
- Verdict: **CONDITIONAL**
- Summary: The work queue prototype clearly surfaces critical/overdue work, priority and status filters, owners, SLA due labels, and deep links into OASIS, orders, and legal evidence — with honest “visual only / no durable write” messaging on claim and escalate. As a **DON** operations desk it still reads primarily as a personal “My work queue” rather than a team/agency SLA roll-up (no owner or role filter, no supervision cohort). Today’s next-best-actions also deep-link one POC-signature task to the wrong patient work item, which weakens closed-loop trust for clinical leadership.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `#/work-queue` loads | OK | h1 “My work queue”; prior UAT PASS, 0 page/console errors; Domain COR kicker + synthetic flask banner |
| `#/today` loads | OK | h1 “Good afternoon, Taylor”; prior UAT PASS; RelatedNav + Work queue CTA |
| `#/messages` loads | OK | Screen + data present; RelatedNav to work queue; synthetic banner; channel filters |
| RelatedNav present | OK | WQ → Today / Orders / OASIS / Legal evidence; Today → WQ / Schedule / Clinical / Messages; Messages → WQ / Orders / Vendors |
| StatCards | OK | WQ: Open, Due today, Overdue/escalated (bad accent when >0), High+critical; Today: SOC %, next visit, open orders, record integrity; Messages: threads/unread/patient-linked/compliance |
| Filters | OK | WQ status + priority toolbars (`aria-pressed`); search by task/patient/owner/domain; Messages channel filters |
| Inspector | OK | WQ inspector: owner, due/SLA, primary surface, domain, Continue-in deep links, claim/escalate foot |
| Critical / overdue visible | OK | Sample `wq-5` Critical + Escalated + “Overdue” with siren icon + `wq-due-bad`; StatCards for overdue/escalated and high+critical; escalated status filter |
| Deep links OASIS / orders / legal | OK | Primary `href`s: `/oasis` (wq-1), `/orders` (wq-2), `/legal-evidence` (wq-6); related chips include legal packages, claim holds, charts; routes exist in `App.tsx` |
| Claim / escalate honest | OK | Banner + titles + footnotes: claim/complete/escalate do not persist; Claim disabled for done/waiting with reason; “Claim next item” only selects next open/escalated row |
| Priority filters | OK | All / Critical / High / Medium / Low |
| Ownership visible | OK | Per-row owner + inspector “Assignment is sample-only”; owners span RN, physician, billing, clinical manager, compliance |
| DON team / agency queue | FAIL | Title and mental model are “My work queue”; no filter by owner, role, discipline, or caseload; DON cannot supervise staff SLAs as a cohort |
| Today ↔ queue closed loop | FAIL | `act-2` (Elena POC signature) maps to `wq-2` (Walter order countersignature @ `/orders`) — patient/task mismatch |
| Messages escalate honesty | OK / P2 | Footnote says reply/escalate are visual only; Compose is visual-only title; no actual Reply/Escalate controls rendered (copy overclaims UI) |
| Incomplete never looks complete | OK (WQ/Msg) / WARN (Today) | WQ/Messages banner honesty strong; Today NBA checkboxes toggle local `done` without prototype footnote that marks are session-only |

## Findings

### P0
- None for design-prototype scope. Claim/escalate do not write durable or legal state; incomplete clinical work is not presented as locked/submitted.

### P1
1. **DON cannot run a supervision work queue** — Screen is framed as personal (“My work queue”). Owners appear as text only; there is no owner/role/discipline filter, no “my staff,” and no roll-up of overdue critical work by clinician. For Director of Nursing clinical operations this is the primary missing affordance on the assigned topic (SLAs & ownership).
2. **Today NBA deep-link patient mismatch** — `TodayScreen.actionHref('act-2')` resolves to `WORK_QUEUE` `wq-2` (`/orders`, patient `pt-walter`, “Order countersignature”), while `nextBestActions` `act-2` describes Elena’s CMS-485 signature due in 4 hours (`patientId: 'pt-elena'`). Closed-loop “continue work” from the desk is wrong for DON triage trust.
3. **Today checklist lacks prototype honesty chrome** — Checking next-best-actions updates local React state only, with no flask/status banner that completion is non-durable (unlike work-queue and messages). A rushed review could read session checkmarks as durable task completion.

### P2
1. **Escalate is an enabled no-op** — Inspector “Escalate” has no `onClick`; honesty relies on `title` + footnote. Prefer disabled + explicit “visual only” label or a non-committing toast pattern consistent with Claim’s disabled reasons.
2. **No sort by SLA / priority** — List order is static array order; overdue critical (`wq-5`) is not auto-pinned to top when filters are “all.”
3. **“High + critical” StatCard blends bands** — Useful triage count, but label can overstate “critical” volume; consider separate critical vs high cards for DON dashboards.
4. **Messages footnote references missing controls** — “Reply / escalate controls are visual only” while only Compose (header) and Continue-in links exist; either add stub controls or tighten copy.
5. **SLA semantics are label-only** — Due strings (“Today 4:00 PM”, “Overdue”, “Wed”) are synthetic free text; no countdown, breach clock, or policy-linked SLA definition (acceptable for prototype; note for production COR).

## What works
- **Critical/overdue visibility is survey-ready as UX prototype:** priority chips, escalated status, siren treatment, red due styling, and StatCards make breach risk glanceable.
- **Deep-link graph is real and useful:** OASIS review → `/oasis` + chart/episode/billing/legal; orders → `/orders` + signature queue/legal; legal hold → `/legal-evidence` + QAPI/documents/security; RelatedNav anchors the COR domain to clinical and legal surfaces.
- **Claim/escalate honesty is above average for this prototype set:** synthetic banner, disabled claim with reasons, titles on primary claim actions, and explicit non-persistence footnotes.
- **Priority + status filters are complete and accessible** (`role="toolbar"`, `aria-pressed`, empty state).
- **Ownership is named on every item** with sample multi-role owners (RN, MD, clinical manager, billing, compliance) — good raw material for a future team queue.
- **Messages close the ops loop** for missed-visit escalation language and link back to work queue / field visits / QAPI PIP without pretending Connect is live.
- **Today bridges field day → full queue** (“Full queue (N)”, Continue-in Work queue / Messages / first OASIS task) with Brad assist clearly labeled as non-filing draft.

## Persona quote
> “I can see who owns the overdue critical work and jump into OASIS, orders, and legal holds — but until this is a team SLA board with honest staff filters, it’s a clinician desk, not my DON operations queue.”

## Evidence references (absolute paths)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\WorkQueueScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\TodayScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\MessagesScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\workspace.ts` (`WORK_QUEUE`, `MESSAGE_THREADS`, `ROUTE_RELATED`)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\clinical.ts` (`nextBestActions`)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\audit\ehr-phase1-uiux\new-pageviews-route-uat.md` (`#/work-queue`, `#/today` load PASS)
