# C08 — DON — Field visits, EVV cues, schedule coverage

- Routes: `/field-visits` · `/schedule` · `/work-queue` · `/aide-supervision`
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Full TSX/data review (FieldVisitsScreen, ScheduleScreen, WorkQueueScreen, AideSupervisionScreen; `clinical.ts` visits; `workspace.ts` WORK_QUEUE / ROUTE_RELATED / MESSAGE_THREADS) + prior live route UAT (`new-pageviews-route-uat.md`). Browser fetch to 127.0.0.1 blocked from agent sandbox; routes previously **PASS** live with zero console errors.
- Verdict: **CONDITIONAL**
- Summary: For a DON, the four surfaces form a usable operations loop—missed-visit work is escalated in the queue and messages, schedule deep-links to patient charts, aide supervision clocks surface overdue oversight, and write paths (complete visit / claim / schedule supervision) are footnoted or disabled so incomplete work does not look filed. CONDITIONAL because **no visit row is actually `missed`** while queue/message narrative claims a missed SN visit (status honesty gap), **EVV is title-only** (no exception/punch UI), and **coverage gaps are not first-class**—Schedule’s “Coverage” lists who is working, not who is uncovered.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx` mounts all four under `AppShell`. Nav: Schedule under Workspace; Field visits & EVV + Aide supervision under Care delivery; Work queue under Workspace (`status: 'built'`). Prior UAT: field-visits, aide-supervision, work-queue **PASS** (h1 present, 0 pageerrors). |
| RelatedNav present | OK | `/field-visits` → Schedule, Aide supervision, Work queue. `/schedule` → Field visits, Work queue, Patients. `/work-queue` → Today, Orders, … `/aide-supervision` → Field visits, Competency, Schedule. Header shortcuts + inspector “Continue in” reinforce the loop. |
| StatCards / filters / inspector | OK | Field: scope Today/Week + status filters + list + inspector. Schedule: week grid + rail stats + Add visit drawer. Work queue: status/priority filters + list + inspector. Aide: status/clock-type filters + list + inspector with overdue callout. |
| **Missed visits escalated?** | COND | **Yes in queue/messages; no in visit registry.** `wq-5` Missed-visit follow-up is `critical` + `escalated` + Overdue, owner Taylor Brooks, domain FLD, primary href `/field-visits`, related Messages / Reschedule / Missed-visit PIP (QAPI). `msg-3` “Missed visit · Raymond” unread with escalate language. Schedule rail has **Missed-visit task** → `wq-5` href. **But** `clinical.ts` has **zero** visits with `status: 'missed'` (grep empty); Field Visits Missed StatCard = **0** and filter “Missed” → empty list. Escalation exists as ops narrative without a corresponding missed visit object. |
| **EVV / status honesty?** | COND / OK on writes | Complete disabled for completed/missed with explicit reason; synthetic flask banner; footer “Complete / EVV / note file controls are visual only.” Sync/EVV inspector field: “Sample · not production EVV” / “Exception path” / “Synced · note due” + “Visual labels only.” **Gap:** page title and domain claim “EVV” without punch times, device/offline provenance, aggregator queue, or exception review—EVV cues are copy, not a review surface. Outbox status is titled visual-only (no false complete). |
| **Schedule → patient chart?** | OK | Each schedule visit patient name is a button → `navigate(/patients/${patientId})`. Field visits + work queue + aide inspectors all open chart via patient strip. Continue-in includes Patient chart from field inspector. |
| **Coverage gaps visible?** | FAIL / partial | Schedule **Coverage** = unique clinicians already on the week grid (who is scheduled), not gap analysis (orders frequency vs visits, unfilled slots, discipline shortages). Empty day cells say “No visits scheduled” without census/order risk. Aide supervision **does** surface coverage-of-supervision: overdue non-skilled clock (hha-3, −4d) with escalate callout + StatCard Overdue. No agency-wide board of uncovered ordered HHA/SN visits. Schedule subtitled **Taylor Brooks, RN** (personal week), weak for DON agency coverage. |
| Honesty / incomplete ≠ complete | OK (with caveat) | Field, Work queue, Aide: flask banners + disabled primary actions + footnotes. Schedule Add visit: drawer sub “nothing is filed or submitted.” Caveat: narrative missed visit without missed status (see P1); work-queue nav badge **18** vs sample list length **6**. |
| Cross-links sensible for DON ops | OK | Field ↔ Schedule ↔ Work queue ↔ Aide ↔ Chart ↔ QAPI (missed-visit PIP) ↔ Competency. Missed-visit task shortcut on Schedule. Supervision clocks link Field, Schedule, QAPI, Competency. |

## Findings

### P0

_None._ No control silently completes a visit, files EVV, claims work, or schedules supervision as durable clinical state. Destructive/legal writes are disabled or footnoted visual-only.

### P1

1. **Missed-visit story is escalated without a missed visit record**  
   Work queue `wq-5` and message `msg-3` describe Raymond’s missed SN visit as critical/escalated, but `todayVisits` / `weekVisits` contain no `status: 'missed'` row (Raymond’s sample visits are PT `documentation-due` and scheduled). Field Visits Missed card reads **0** with good accent—DON glance says “no misses” while the queue screams escalated miss. **Fix for prototype honesty:** add a synthetic missed visit (e.g. prior SN for Raymond) aligned to `wq-5`, or demote/reword queue item until registry supports it.

2. **EVV is branding, not a DON exception board**  
   Domain FLD title “Field visits & EVV”, subtitle promises offline outbox and applicability-driven EVV, but inspector only shows a free-text Sync/EVV label. No start/end, GPS/telehealth exception, CalEVV/Alternate EVV applicability chip, or failed-export queue. For survey-facing prototype UX this under-delivers the title; either add a thin EVV exception strip (visual-only punches) or retitle to “Field visits” with EVV as future domain note.

3. **Coverage gaps not visible as gaps**  
   Schedule “Coverage / Care team this week” lists assigned clinicians only. No view of ordered frequency without a scheduled visit, open aide hours, or unfilled SOC. DON cannot answer “who is uncovered today?” from these four routes alone. Aide overdue clocks partially cover **supervision** coverage, not visit coverage.

### P2

1. **Schedule is clinician-scoped (Taylor Brooks)** while DON needs multi-clinician/agency filter—subtitle and Add visit always assign Taylor; coverage list is derived from that same sample, not a team switcher.

2. **Work queue nav badge `18` vs six synthetic items**—overstates open work (same class of badge honesty issue as elsewhere).

3. **Field Visits “Outbox status”** secondary action has title but no feedback click target (no drawer)—fine for visual-only if consistent; weaker than disabled+reason pattern on Complete.

4. **Missed filter empty state** does not explain “0 misses in sample; see work queue for escalated narrative” when `wq-5` exists—missed opportunity for cross-surface honesty.

5. **Schedule “Today” day key** maps `match: 'Today'` with label Mon Aug 3 while week also has “Tomorrow” etc.—works with data keys but calendar copy can confuse if real dates drift.

## What works

- **Closed ops loop:** Field visits ↔ Schedule ↔ Work queue ↔ Aide supervision ↔ Patient chart, with RelatedNav + Continue-in + header buttons consistently wired.
- **Escalation affordances when data supports them:** Work queue escalated/critical chips, siren icons, overdue due styling; Schedule **Missed-visit task** deep-link; Messages thread for Raymond miss; QAPI “Missed-visit PIP” related link for quality follow-through.
- **Status model ready for honesty:** Visit statuses include `missed`, `documentation-due`, `completed`, `in-progress`, `scheduled` with bad/warn/good tones; Complete blocked for completed and missed (“exception path, not complete”).
- **Aide supervision clocks** as DON supervision instrument: skilled 14-day / non-skilled 60-day, overdue callout, schedule-supervision disabled when recently observed, links to competency and field visits.
- **Schedule → chart** one-click from visit patient name; Add visit drawer explicitly non-filing.
- **Write-path discipline:** Claim/Complete/Schedule supervision titled or disabled with footnotes; synthetic banners on Field, Work queue, Aide.

## Route notes (persona lens)

### `/field-visits` — Field visits & EVV
- Domain kicker FLD; registry + inspector pattern matches other built domains.
- Stats: Today’s visits, Documentation due, Missed (**0** in sample), Telehealth.
- Filters: Today/Week scope; status including Missed (empty until data fixed).
- Inspector: patient → chart; Sync/EVV visual labels; Continue-in Schedule / Work queue / Aide supervision / Chart.
- Primary “Open visit packet” only selects next scheduled/doc-due today—no false file.
- Complete disabled when completed or missed; footnote denies durable write.

### `/schedule` — Schedule
- Week grid Mon–Fri with status chips (Completed, Scheduled, Note due, etc.).
- Patient name navigates to chart (**Schedule → patient chart: OK**).
- Rail: week totals (visits, SOC, recert, notes due) + care-team list + Continue-in Work queue / Field visits / Missed-visit task.
- Add visit drawer: synthetic only; always assigns Taylor Brooks.
- **Not** an agency coverage heat map; empty days ≠ ordered-care gap.

### `/work-queue` — My work queue
- `wq-5` is the DON missed-visit escalation artifact: critical, escalated, overdue, FLD → `/field-visits`.
- `wq-4` Aide supervision clock open → `/aide-supervision` (14-day window).
- Escalate + Claim are visual-only; claim disabled for done/waiting.
- Deep links and patient strip support triage into chart and primary surface.

### `/aide-supervision` — Aide supervision
- Five synthetic clocks; hha-3 overdue non-skilled with escalate coverage callout.
- StatCards: active, due ≤7d, overdue, recently observed.
- Schedule supervision primary can focus overdue/due-soon; inspector CTA disabled when recent observation block applies.
- Links Field visits / Schedule / Competency / QAPI / Chart—good DON supervision path.

## Evidence map (source)

| Topic | Source |
| --- | --- |
| Routes | `apps/ehr-prototype/src/App.tsx` |
| Visits (no `missed`) | `apps/ehr-prototype/src/data/clinical.ts` (`todayVisits`, `weekVisits`) |
| Work queue / messages / ROUTE_RELATED | `apps/ehr-prototype/src/data/workspace.ts` (`wq-5`, `msg-3`, `/field-visits`, `/schedule`, `/aide-supervision`) |
| Field visits UX | `apps/ehr-prototype/src/screens/FieldVisitsScreen.tsx` |
| Schedule UX + chart nav | `apps/ehr-prototype/src/screens/ScheduleScreen.tsx` |
| Work queue UX | `apps/ehr-prototype/src/screens/WorkQueueScreen.tsx` |
| Aide clocks | `apps/ehr-prototype/src/screens/AideSupervisionScreen.tsx` |
| Nav built status | `apps/ehr-prototype/src/data/navigation.ts` |
| Live route UAT | `audit/ehr-phase1-uiux/new-pageviews-route-uat.md` |
| Live port | `audit/ehr-phase1-uiux/phase0/vite-5194.log` → http://127.0.0.1:5194/ |

## Persona quote

> As DON I can escalate a missed visit from the queue and open the chart from the schedule in one click—but until a red Missed visit actually sits in Field visits next to that escalated task, and until Coverage means *uncovered ordered care* instead of a staff roster, I will not trust this board for morning census or survey demo of visit integrity.
