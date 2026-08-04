# D01 — LVN — Today board / shift start
- Routes: `/today`, `/work-queue`, `/schedule`, `/patients/pt-elena`
- Verdict: **CONDITIONAL**
- Summary: As a field clinician opening shift, the prototype does surface **today’s visits**, **next best actions**, and **one-click chart open** with coherent RelatedNav and “Continue in” deep links. Work queue honesty (synthetic / claim visual-only) is strong. Conditionally held because the logged-in persona is hard-coded **Taylor Brooks, RN case manager** (not LVN), Today’s “4 visits” mixes other clinicians’ caseload without a “My visits” filter, and the global shell + product-demo chrome (vertical slice, mode switch, admin nav) adds clutter that a pure field LVN would not want at 7 a.m.

**Method:** Rubric-allowed screen/source review of `apps/ehr-prototype` (HashRouter on `http://127.0.0.1:5194`). Live browser automation from this agent environment could not hit `127.0.0.1` (tool SSRF block). Routes, affordances, and cross-links verified in TSX/data/CSS. Helper script left at `_d01-playwright.mjs` for human/orchestrator re-run.

## Checks
| Check | Result | Notes |
| --- | --- | --- |
| `/today` loads with shift-start framing | OK | Title “Good afternoon, Taylor”; sub “Monday, August 3 · 4 visits today · 1 SOC episode needs attention” (`TodayScreen.tsx`) |
| See today’s visits | OK | “Field schedule / Today’s visits” strip; 4 synthetic visits sorted by time; status chips (Completed / Scheduled / Note due); location icons home vs telehealth |
| Visits filterable to “my” caseload | FAIL | Subtitle claims 4 visits, but only **v-1 Walter** and **v-2 Elena** are clinician `Taylor Brooks, RN`; **v-3 Margaret** is Iris Duan; **v-4 Raymond** is Marcus Webb (`clinical.ts`) — no “Mine / Team” toggle |
| Next best actions visible & actionable | OK | 3 NBA rows (SOC items, POC signature, metoprolol discrepancy) with due + blocking flags; go-button navigates OASIS / Orders / Medications / work-queue |
| Open chart quickly from Today | OK | Visit cards → `/patients/:id`; Elena banner CTA “Continue SOC” → `/patients/pt-elena/assessments`; primary teal CTA “Start visit documentation” → `/clinical` |
| RelatedNav on Today useful | OK | Work queue · Schedule · Clinical · Messages — field-sensible; duplicates “Continue in” chips (Work queue / Messages / Schedule / SOC OASIS) |
| `/work-queue` triage for field work | OK | Filters (status + priority), search, inspector with patient → chart, primary href + related chips; claim/escalate disabled or footnoted as visual-only |
| Work queue count honesty | FAIL | Nav badge hard-coded **18**; sample queue has **6** items (`navigation.ts` vs `WORK_QUEUE`) |
| `/schedule` week view + chart open | OK | Mon–Fri grid, Today column chip, patient name buttons → chart; RelatedNav Field visits · Work queue · Patients; Add visit drawer labeled synthetic |
| `/patients/pt-elena` chart for visit prep | OK | Banner, tabs (Overview…Documents), care team, integrity, upcoming visits, Continue in; deep data for Elena (timeline/POC/meds) |
| RelatedNav on chart context-aware | FAIL | Chart uses `RelatedNav route="/patients"` → Intake · Schedule · Episodes (list-level), not Elena-specific related from episode |
| Honesty: incomplete ≠ complete | OK | Brad: “Nothing is filed… without clinician review”; WQ banner + claim footnotes; schedule add drawer synthetic; shell ribbon “not approved for clinical use” |
| LVN persona representation | FAIL | Shell user is **Taylor Brooks, RN · Case manager**; schedule sub “Taylor Brooks, RN”; no LVN role, discipline filter, or scope-limited nav |
| Overwhelm / clutter | CONDITIONAL | Today: useful core buried under product vertical-slice strip, always-on Elena banner, 4 StatCards, Brad column, RelatedNav + Continue in + head actions (triple path redundancy). Global left nav exposes admin/revenue/compliance at same weight as field tools |
| Cross-links sensible | OK | Today ↔ WQ ↔ Schedule ↔ chart ↔ OASIS/orders/meds/field-visits wired; no dead “built” destinations in ROUTE_RELATED for these routes |

## Findings
### P0
- None for **design-prototype survey readiness**. Incomplete clinical work is not painted as signed/locked; claim/complete controls on work queue are explicitly non-durable.

### P1
1. **Persona / role mismatch for LVN QA** — Account chrome and schedule are RN case-manager. An LVN evaluating “my shift start” cannot trust role-scoped visits, orders, or OASIS ownership. Fix direction: role switcher or LVN sample user with filtered queue + visits.
2. **Today visit count is not “my board”** — “4 visits today” includes teammates’ visits with no clinician filter or attribution on the visit card (type/status only; clinician not shown on card). Field trust issue; misstates workload.
3. **Work-queue nav badge (18) ≠ sample items (6)** — Overstates urgency; undermines “My work queue” honesty next to an otherwise careful synthetic banner.
4. **Chart RelatedNav not patient-scoped** — On `/patients/pt-elena`, Related chips go to Intake / Schedule / Episodes rather than Chart-adjacent OASIS, Orders, Medications, Field visits (those exist only under overview “Continue in” from `EPISODES.related`). LVN prep path is longer than it needs to be.

### P2
1. **Today density / product tour chrome** — “Live vertical slice” Referral→…→QAPI is stakeholder storytelling on a field shift board; competes with NBA + visits for attention.
2. **Redundant navigation strips** — Screen-head actions + RelatedNav + “Continue in” + full sidebar repeat Work queue / Schedule; fine for discovery, noisy for daily use.
3. **NBA checkboxes look durable** — Local `done` state with no “visual only” footnote (unlike WQ claim footer). Easy to misread as queue completion.
4. **Mode switch (Business Plan / Requirements / MVP Policy)** in topbar is irrelevant to LVN shift start; increases cognitive load of prototype chrome.
5. **Sidebar breadth** — Admin, migration, AI governance, etc. sit peer to Today/Schedule; no “Field mode” collapse for clinician persona.
6. **Schedule “Today” button** only scrolls Monday column (hard-coded `dayRefs.mon`), not a true “jump to now / my next visit” for field use.

## What works
- **Shift-start information architecture on `/today`**: greeting + volume cue, pinned high-attention patient (Elena SOC), NBA with blocking language (“Blocks claim readiness”, “High-risk medication”), visits strip, Brad assist with sources and review-not-replace copy.
- **Fast chart access**: visit card, banner CTA, WQ inspector patient row, schedule patient name — all route into `PatientChartScreen` with tabs for visit prep (meds discrepancy, POC pending signature, assessments % complete).
- **Work queue as closed-loop prototype**: priority/status chips, overdue styling, deep links, claim disabled when waiting/done with explicit reason — model of honest incomplete work.
- **Schedule week grid** with drive estimate, coverage rail, discipline chips, and synthetic Add visit drawer (clear non-file language).
- **RelatedNav** pattern is consistently present on all four routes; Today’s destinations are the right field hubs.
- **Integrity storytelling** (11/13, SOC 82%) teaches claim-readiness without pretending signatures are done.

## Persona quote
> “I can see visits and what to do next, and I can open Elena’s chart fast — but the board pretends four other people’s visits are mine, I’m still signed in as an RN case manager, and there’s a lot of product/admin chrome between me and my 2:30 med check.”
