# D02 — LVN — Schedule day view

- Routes: `/schedule` · `/field-visits` · `/patients` (chart deep-link `/patients/:patientId`)
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Live route wiring + full TSX/data/CSS review (`ScheduleScreen`, `FieldVisitsScreen`, `PatientsScreen`, `PatientChartScreen`; `weekVisits` / `todayVisits` / `patients` / `ROUTE_RELATED`). Browser fetch to 127.0.0.1 blocked from agent sandbox; server process confirmed via `audit/ehr-phase1-uiux/phase0/vite-5194.log`.
- Verdict: **CONDITIONAL**
- Summary: As an LVN starting the day, I can see timed visits in a Mon–Fri week grid, jump to “Today,” open a patient chart from a visit name, and hand off into Field visits / Work queue. Times and statuses are legible enough for a synthetic prototype. CONDITIONAL because there is **no true day-only mode**, **no “my visits” filter**, and **visit cards omit the assigned clinician**—so multi-discipline team load and LVN caseload planning are weak—and schedule vs field status wording does not match (`Note due` vs `Documentation due`). The shell is still RN-framed (`Taylor Brooks, RN`), not LVN.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx`: `/schedule` → `ScheduleScreen`; `/field-visits` → `FieldVisitsScreen`; `/patients` + `/patients/:patientId` (+ tab). Nav **Care delivery**: Schedule (SCH), Field visits & EVV (FLD), Patients (PAT). Command palette: Schedule, Field visits, Patients. |
| RelatedNav present | OK | `/schedule` → Field visits, Work queue, Patients. `/field-visits` → Schedule, Aide supervision, Work queue. `/patients` → Intake, Schedule, Episodes. |
| StatCards / filters / inspector | PARTIAL | Schedule: left-rail week stats (total / SOC / recert / notes due) + coverage list; **no** list filters or visit inspector. Field visits: 4 StatCards, scope (Today/Week), status filters, search, inspector. Patients: search + risk/SOC/recert chips + roster table. |
| **Visit times clear?** | OK | Each schedule card leads with tabular-num time (`sched-visit-time`); day columns sort by `timeToMinutes`; day foot shows visit count. Field list: `{date} · {time} · {durationMin} min`. Sample today: 9:00 AM PT (note due), 11:00 AM SN completed, 2:30 PM SN scheduled, 4:15 PM SN scheduled. |
| **Patient open from visit?** | OK | Schedule: patient name button → `navigate(/patients/${patientId})`. Field inspector: patient row + “Patient chart” Continue-in. Patients roster row opens chart. Chart mounts with banner + tabs including Visits. |
| **Status language?** | COND | Shared status set: completed / scheduled / in-progress / documentation-due / missed with good tones. Schedule + Today label `documentation-due` as **“Note due”**; Field visits uses **“Documentation due”**. Scheduled tone differs (schedule: progress; field: neutral). Sample has **zero missed** visits—Missed path is coded but not demoed on schedule grid. |
| **Can plan day?** | PARTIAL | Week-of-Aug-3 grid with Today chip + scroll-to-today; drive footer `~N×12+8 min`; Field “Today” scope for day-of list. Gaps: no Day vs Week toggle on Schedule; no “mine only”; clinician not on visit cards; no address/city on cards for route order; subtitle fixed to RN; Add visit always assigns Taylor Brooks, RN. |
| Honesty / incomplete ≠ complete | OK | Schedule Add visit drawer: “synthetic prototype, nothing is filed.” Field banner + Complete/Outbox titles/footnotes block durable write; Complete disabled for completed/missed with reason. |
| Cross-links sensible | OK | Schedule ↔ Field ↔ Work queue ↔ Patients; Field → Aide supervision; chart Continue-in includes Schedule when episode related set absent. Missed-visit task CTA uses WORK_QUEUE `wq-5` href. |

## Findings

### P0

_None._ No control silently completes a field visit, files EVV, or submits a durable schedule change. Completing/syncing is visual-only with disabled paths and footnotes on Field visits; Add visit is local prototype state with explicit synthetic copy.

### P1

1. **No LVN caseload / “my day” lens on Schedule** (`ScheduleScreen.tsx`). Subtitle is “Taylor Brooks, RN”; visit cards show time, patient, type, discipline, duration, status—but **not clinician**. Coverage rail lists the team, yet an LVN cannot filter “only my visits” or see assignment per card. Multi-clinician sample (Taylor, Iris, Marcus, Dana, Amaia) therefore looks like one shared board without ownership.

2. **Schedule is week columns, not a day view** (topic: day view). There is a Today highlight and scroll button, but no Day/Week toggle and no expanded single-day agenda (address, map order, prep checklist). Field visits has Today scope; Schedule does not. Day planning forces horizontal scanning of a 5-day strip.

3. **Route / prep data missing for field planning.** Drive estimate is `visitCount * 12 + 8` minutes (not sequence-aware). Visit cards have no city/address (patients have `city` only). LVN cannot reorder stops or see travel between homes from Schedule alone.

### P2

1. **Status copy inconsistency:** Schedule/Today → “Note due”; Field visits → “Documentation due” for the same `documentation-due` status. Align labels and chip tones across surfaces.

2. **Missed-visit story under-demoed:** Status + Missed task CTA exist; `weekVisits` has no `missed` row, so Missed StatCard is 0 and the exception path is not visible in the day grid.

3. **Persona framing:** Prototype default is RN (Today “Good afternoon, Taylor”, schedule owner RN). LVN persona QA must imagine into RN sample data—no LVN clinician in visit set or Add-visit assignee options.

4. **Command palette hint** says Schedule is “Week view” (accurate) while assignment topic says day view—product/IA naming drift only.

5. **Patients roster** shows next visit date/time/type but not a one-click “open today’s visits” from a patient row; planning loop is Schedule/Field first (acceptable, minor).

## What works

- **Time-first visit cards** with sorted day columns and a clear **Today** column treatment (teal border/head + chip).
- **One-click chart open** from schedule patient name and from field inspector—core LVN need before/after a stop.
- **Discipline + duration + home/telehealth icon** give enough type context for skilled vs therapy vs telehealth without opening the chart.
- **Week rail stats** (total, SOC, recert, notes due) answer “what kind of week is this?” at a glance.
- **Field visits as day-of companion:** Today scope, status filters, search, EVV honesty banner, Complete disabled with reasons, Continue-in Schedule/Work queue/Patient chart.
- **Patients roster** next-visit column and risk/SOC filters support pre-visit triage when charting from the list.
- **RelatedNav + header actions** close the loop Schedule ↔ Field visits ↔ Work queue ↔ Patients.

## Route notes (persona lens)

### `/schedule` — Schedule (week grid)

- Title/sub: “Schedule · Week of Aug 3 – Aug 9 · Taylor Brooks, RN”.
- Actions: Field visits, Work queue, Today (scroll), Add visit (drawer; local state only).
- Body: left rail (This week stats, Coverage / Continue-in) + horizontal day sections Mon–Fri.
- Visit card anatomy: time → patient (link) → type → discipline chip + duration/location → StatusChip.
- Day foot: visit count + synthetic drive estimate.
- Empty day: “No visits scheduled”.
- LVN takeaway: good at-a-glance week; weak for “what is *my* path today and in what order.”

### `/field-visits` — Field visits & EVV

- Domain FLD framing; synthetic banner on durable writes.
- Stats: Today’s visits, Documentation due, Missed, Telehealth.
- Registry + inspector: When / Clinician / Location / Sync·EVV (visual labels).
- Complete visit disabled when already completed or missed; footnote always denies durable sync/bill.
- Better **day execution** surface than Schedule; weaker **week layout** visualization.

### `/patients` (+ chart)

- Roster with next visit timing—supports “who am I seeing next?” when not on Schedule.
- Chart Visits tab uses same week sample filtered by patient; status labels match Schedule (“Note due”).
- Opening from schedule lands on chart overview, not visit packet (Open visit packet lives on Field visits and is visual-only)—acceptable for prototype honesty.

## Evidence map (source)

| Topic | Source |
| --- | --- |
| Routes | `apps/ehr-prototype/src/App.tsx` |
| Schedule UI | `apps/ehr-prototype/src/screens/ScheduleScreen.tsx`, `sched.css` |
| Field visits UI | `apps/ehr-prototype/src/screens/FieldVisitsScreen.tsx`, `fld.css` |
| Patients / chart | `PatientsScreen.tsx`, `PatientChartScreen.tsx` |
| Visit sample | `apps/ehr-prototype/src/data/clinical.ts` (`todayVisits`, `weekVisits`) |
| Related nav | `apps/ehr-prototype/src/data/workspace.ts` (`/schedule`, `/field-visits`, `/patients`) |
| Nav built status | `apps/ehr-prototype/src/data/navigation.ts` (Schedule, Field visits, Patients) |
| Live port | `audit/ehr-phase1-uiux/phase0/vite-5194.log` → http://127.0.0.1:5194/ |

## Persona quote

> As an LVN I can see when each visit is and open the chart from the schedule—but until I get a real day view of *my* stops with clinician ownership and something better than a fake drive-time formula, I’m still planning my route on paper next to this screen.
