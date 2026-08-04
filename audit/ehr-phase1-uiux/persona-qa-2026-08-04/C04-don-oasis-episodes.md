# C04 — DON — OASIS & episode management

- Routes: `/oasis` · `/episodes` · `/cms-quality` · `/schedule`
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Full TSX/data review (OasisAssessmentsScreen, EpisodesScreen, CmsQualityScreen, ScheduleScreen; `OASIS_RECORDS` / `EPISODES` / clinical visits / `ROUTE_RELATED` / nav). Browser fetch to 127.0.0.1 blocked from agent sandbox; server process confirmed via `audit/ehr-phase1-uiux/phase0/vite-5194.log`.
- Verdict: **CONDITIONAL**
- Summary: For a Director of Nursing, the EPI/OASIS surfaces make **recert risk**, **lock gates**, and **episode claim status** legible without pretending CMS writes land. Incomplete packages show completeness meters and blockers, and Lock is correctly disabled until 100% and zero blockers. CONDITIONAL because **DON prioritization of incomplete OASIS is thin**—there is no urgency sort, re-order, or owner/priority board, and **Continue assessment** always lands on the first `in-progress` row (Elena) rather than the more urgent `due-soon` Recert at 0% (Dorothy). Schedule shows a recert visit count but is clinician-week scoped and does not RelatedNav back to OASIS/Episodes.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx` mounts `/schedule`, `/episodes`, `/oasis`, `/cms-quality` under shell. Nav: Care delivery → Episodes & OASIS (badge 7); Quality → CMS quality reporting; Schedule under Day-to-day. Command palette lists Episodes + OASIS. |
| RelatedNav present | OK / partial | `/oasis` → Episodes, CMS quality, Claims, Clinical. `/episodes` → OASIS, Orders, Billing. `/cms-quality` present (via RelatedNav + header OASIS workspace). `/schedule` → Field visits, Work queue, Patients only — **no OASIS / Episodes** (DON recert triangulation weaker). |
| StatCards / filters / inspector | OK | OASIS: In progress / Due soon / With blockers / Locked·exported + status + time-point filters + list meters + inspector. Episodes: Active / Recert due / Pending SOC / Open orders + status filters + inspector. CMS quality: completeness % / rejected / on-track / OASIS open + work registry + drawer tabs. Schedule: week total / SOC / Recertification / Notes due rail. |
| **Recert due visible?** | OK | Episodes: status `recert-due`, StatCard **Recert due**, filter, Dorothy `ep-dorothy` (cert 2, claim “Final holds · recert POC”, Continue-in Recert POC / Recert OASIS). OASIS: type **Recert**, `oas-dorothy-recert` status **Due soon**, window “Due Aug 6”, completion **0%**, blockers “Visit not started”, “Prior period export check”. Schedule: week stat **Recertification** counts `type` containing “recert”; visit `v-9` Dorothy **Recertification assessment** Aug 6 (Iris Duan, RN). Patient flag “Recert window”. |
| **Lock gates?** | OK | `lockDisabledReason`: already locked/exported; **completion must be 100%**; **blocking items must clear**. Primary **Lock package** `disabled={!!lockBlock}` with title + footnote (“Lock disabled · …”). Incomplete packages never present as lockable. Synthetic banner: lock/export do not write durable state. Exported sample (`oas-june-soc` 100%, no blockers) shows sealed path without re-lock affordance. |
| **Episode claim status?** | OK | Every episode row shows `claimStatus` in meta; inspector grid **Claim status** with revenue sample label. Samples: `Holds · POC + OASIS`, `NOA submitted`, `Not started`, `Final holds · recert POC`. Continue-in → OASIS, Orders, Billing. Cross-check with billing holds (Elena POC+OASIS; Dorothy Recert POC draft). |
| **DON can prioritize incomplete OASIS?** | FAIL / partial | **Visible risk signals:** Due soon + With blockers StatCards; status/type filters; row completeness meters; blocker counts; “Continue assessment” selects first `in-progress` \|\| `due-soon`. **Missing DON ops:** no sort by window urgency, completion, or blocker count; list order is static registry order; no priority field, reassignment, or “my incomplete queue” mode; Continue prefers Elena (`in-progress` 82%) over Dorothy (`due-soon` 0% Recert) because `find` walks array order — wrong default for DON triage. |
| Honesty / incomplete ≠ complete | OK | OASIS + Episodes + CMS quality flask banners; lock/cert/submit footnoted or disabled; incomplete OASIS shows warn meters and blocker callouts, not green locked. CMS **Submit to CMS** disabled for closed/rejected/HHCAHPS with reasons. |
| Cross-links OASIS ↔ episode ↔ quality ↔ schedule | OK / partial | Strong OASIS↔Episodes↔CMS quality↔Billing loop. Dorothy OASIS related → Schedule “Recert visit”. Episodes Dorothy → Recert OASIS. Schedule does not reverse-link to OASIS/Episodes; schedule is single-clinician week (Taylor Brooks framing) not agency DON board. |

## Findings

### P0

_None._ Lock cannot seal incomplete packages. Cert/submit paths are visual-only or disabled with reasons. Incomplete work does not render as locked/exported.

### P1

1. **DON cannot truly prioritize incomplete OASIS** (`OasisAssessmentsScreen.tsx` + `OASIS_RECORDS`). Filters and stats surface incompleteness, but there is no urgency sort (due window → blockers → % complete), no drag/reorder or priority, and **Continue assessment** uses `find(in-progress || due-soon)` so Elena SOC 82% always wins over Dorothy Recert due-soon 0%. A DON running morning triage cannot pin “who finishes first.” Add default sort: `due-soon` + low completion first; optional “Priority board” filter; Continue should pick highest urgency, not first match.

2. **Schedule is not a DON recert cockpit**. Week-of rail counts Recertification visits correctly for the sample (`Recertification assessment`), but RelatedNav omits OASIS/Episodes; screen subtitle is clinician-scoped (“Taylor Brooks, RN”); no deep-link from the Dorothy recert visit card into `oas-dorothy-recert` / `ep-dorothy`. DON scheduling oversight requires agency-level view + reverse links into EPI.

3. **Small OASIS sample vs nav badge** — nav badge **7** on OASIS assessments while `OASIS_RECORDS` has **3** rows. Prototype honesty risk: badge implies a fuller incomplete queue than the registry demonstrates (false volume for DON capacity planning). Align badge to real incomplete count or label as illustrative.

### P2

1. **OASIS list does not surface claim status** on the assessment row (only via Continue-in Claims / Episodes). DON often asks “is this blocking RAP/final?” — a one-line claim-hold chip on incomplete packages would close the loop without leaving OASIS.

2. **Episodes “Open cert period”** disables only for `pending-soc`; recert-due still enables primary with visual-only title. Acceptable for prototype honesty, but a DON might prefer an explicit “Recert path” CTA labeled separately from opening a new cert period.

3. **CMS quality “Run completeness”** opens a synthetic drawer (good), while OASIS open count merges `in-progress` + `due-soon` without listing owners — fine for HQR glance, less useful for DON staffing of incomplete assessments.

4. **Schedule RelatedNav** could add OASIS + Episodes for the same reason Clinical/Billing already triangulate.

## What works

- **Recert risk is multi-surface:** Episodes StatCard + status, OASIS Recert type + due-soon package, Schedule recert visit, patient Recert window flag, claim holds on Dorothy final.
- **Lock gates are survey-credible for a UX prototype:** completeness + blockers required; disabled primary + footnote; sealed export sample separate from open work.
- **Episode claim status is first-class:** row + inspector + Billing Continue-in; holds language ties POC/OASIS/recert without silent claim write.
- **Cross-nav density on EPI/HQR:** OASIS header → Episodes + CMS quality; CMS quality → OASIS workspace + cohort tab listing all OASIS records with status chips; validation report routes to CMS quality.
- **Honesty chrome:** synthetic banners and visual-only lock/cert/submit language match DON expectation that this is design review, not production OASIS submission.
- **Blocking items named** (GG0170, med items, visit not started, prior period export) give DON coaching talking points for field staff.

## Route notes (persona lens)

### `/oasis` — OASIS assessments
- Domain EPI kicker; registry + inspector pattern.
- Sample: Elena SOC 82% in-progress (3 blockers); Dorothy Recert 0% due-soon (2 blockers); June SOC 100% exported.
- Lock package gated; Validation report → `/cms-quality`.
- Continue assessment = incomplete shortcut (but not urgency-aware — P1).

### `/episodes` — Episodes & certification
- Payment period / cert period registry; Recert due StatCard; claim path labels.
- Open cert period disabled when pending SOC; Request cert signature titled visual-only; footnote denies CMS-485/claim submit.
- OASIS workspace header shortcut for DON handoff.

### `/cms-quality` — CMS quality reporting
- HHQRP completeness row 96.2%; rejected repair queue; StatCard **OASIS open** from shared `OASIS_RECORDS`.
- Cohort/OASIS tab lists all assessments; Submit to CMS gated; synthetic no-submit banner.
- Useful DON/quality liaison view for “what is still incomplete before threshold.”

### `/schedule`
- Week Aug 3–9; Dorothy Recertification assessment Wed; Harold SOC·OASIS-E2 tomorrow.
- Recertification week stat works via type string match.
- Clinician-centric; weak reverse path to OASIS/episode inspectors for DON prioritization.

## Persona quote

> I can see who is recert-due and I cannot lock garbage—but I still cannot run a real incomplete-OASIS board that puts Dorothy’s zero-percent recert ahead of Elena’s mid-stream SOC with one click.
