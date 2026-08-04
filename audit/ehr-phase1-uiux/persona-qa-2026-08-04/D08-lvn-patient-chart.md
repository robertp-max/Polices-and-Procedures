# D08 — LVN — Patient chart end-to-end (Elena Martinez)

- **Routes:** `#/patients` · `#/patients/pt-elena` · `#/patients/pt-elena/medications` · `#/patients/pt-elena/assessments` · (also exercised via code: `overview`, `timeline`, `plan-of-care`, `visits`, `orders`, `documents`)
- **Base:** `http://127.0.0.1:5194/#` (HashRouter)
- **Worktree:** `ehr_phase1` · App: `apps/ehr-prototype`
- **Method:** Full TSX/data walk of `PatientsScreen`, `PatientChartScreen`, `PatientBanner`, `RelatedNav`, `patients.ts`, `clinical.ts`, `workspace.ts` (`EPISODES`, `ROUTE_RELATED`), `App.tsx`, `ui/index.tsx`. Live server confirmed via `audit/ehr-phase1-uiux/phase0/vite-5194.log` (Vite ready on **5194**). Direct `open_page` / fetch to `127.0.0.1` blocked in this agent environment (SSRF / tool policy); route registration + source truth used as load evidence per rubric. Design-prototype QA only — not production clinical validation.
- **Verdict:** **CONDITIONAL**
- **Summary:** For an LVN opening Elena Martinez before a home visit, the chart is **easy to find, identity-rich, and tab-navigable** to meds, assessments, and timeline. Record integrity **does not greenwash the episode as complete** once the checklist is expanded (attention/blocked chips for OASIS, metoprolol, unsigned CMS-485). CONDITIONAL because the medications tab footer still asserts **“Medication list reconciled at SOC”** while a high-risk metoprolol `needs-review` alert sits on the same screen (false completeness — patient-safety narrative), integrity headline **11/13** does not match **10** `passed` checklist rows, and chart action buttons (Mark reconciled, Message physician, Resume assessment, Send reminder, Open doc) look live without the visual-only honesty chrome used elsewhere.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| `#/patients` loads / roster usable | **OK** | Route registered; roster table clickable (`aria-label="Open chart for Elena Martinez"` → `/patients/pt-elena`). Search (name/MRN/dx), filters All / High risk / SOC pending / Recert, RelatedNav Intake · Schedule · Episodes. Elena row: MRN CI-104289, Z47.1, high risk, integrity 11/13 warn styling, next visit Today · 2:30 PM SN. |
| `#/patients/pt-elena` loads | **OK** | `PatientChartScreen` for `pt-elena`; h1 name + screen-sub MRN · payer · city; default tab overview when no `:tab` or unknown tab. |
| **Banner identity clear?** | **OK** | `PatientBanner`: large avatar, full name, Active episode, Fall risk + Lives alone chips, age/pronouns/MRN/payer/city, primary dx Z47.1, allergy Penicillin · rash (shield), SOC date + Day n of cert. CTA **Continue SOC** → assessments. Sufficient for bedside/doorstep identity check. |
| **Integrity checks honest?** | **COND** | Overview panel shows ring + “N / M checks passing” and per-check StatusChips (passed / attention / blocked) with plain-language detail — **incomplete work is visible**, not hidden. **But** `patients.ts` claims `passed: 11` while `integrityChecks` enumerates **10** `passed` + 2 attention + 1 blocked; timeline claim-readiness text also says “11 of 13.” Headline count is slightly inflated vs checklist. Ring stroke always `--green-300` even when incomplete (text still honest). Full checklist **Elena-only** (other patients get honest scope note). |
| Reach **medications** tab | **OK** | Tab key `medications` + deep link `/patients/pt-elena/medications`. Alert for Metoprolol 25 mg needs-review with 25 vs 50 mg note; remaining meds table with high-risk chips (Apixaban, Oxycodone). |
| Reach **assessments** tab | **OK** | Tab + deep link + banner **Continue SOC**. OASIS-E2 82% in-progress with section breakdown + “7 responses need clinician confirmation”; MAHC-10/PHQ-2/PT complete; nutrition due-soon 0%. |
| Reach **timeline** | **OK** | Tab + overview “Full timeline” button. 10 Elena events with when/title/detail/**actor** (actors omitted only on overview “Recent activity” preview). |
| Other chart tabs | **OK** | plan-of-care (pending signature, dx, freq, goals, DME), visits table, orders list, documents table — all wired for `pt-elena` sample density. |
| Related / Continue-in links | **OK** | Chart `RelatedNav route="/patients"` → Intake, Schedule, Episodes. Overview **Continue in · episode Jul 29 – Sep 26**: Chart, OASIS SOC, Orders, Claims, SOC package (legal-evidence), Work queue — sensible LVN/ops destinations. Roster also has Episodes/Intake actions. |
| Honesty (no false complete / silent legal action) | **FAIL (P0 footer)** | Incomplete OASIS, pending POC, needs-review med are generally warn/blocked — good. **Exception:** meds footer always “reconciled at SOC” when meds.length > 0. Chart CTAs are no-ops with **no** disabled/title/footnote (unlike global `/medications` / work-queue patterns). They do not mutate state, but look operational. |
| LVN persona fit | **CONDITIONAL** | Chart is discipline-agnostic and useful for SN LVN field review (meds, allergies, POC, visits). Shell identity remains **Taylor Brooks, RN · Case manager**; care team has no LVN; OASIS/Resume paths are RN-shaped. No LVN-scoped permissions story (acceptable for prototype if role switcher exists later). |

## Findings

### P0

1. **False completeness: chart medications footer vs open high-risk discrepancy**  
   - **Where:** `PatientChartScreen.tsx` medications tab — footer always renders when `patientMeds.length > 0`: *“Medication list reconciled at SOC · {socDate}”*.  
   - **Conflict:** Same tab elevates Metoprolol as `needs-review` / high-risk with note *“Discharge list shows 25 mg; medication bottle labeled 50 mg. Confirm with Dr. Cho before next dose.”* Integrity chk-5 remains **attention**; order `ord-2` still open for dose clarification.  
   - **LVN impact:** Field nurse can misread the list as fully reconciled and dose-safe before a 2:30 PM SN visit. Survey/safety story fails on the exact surface LVNs use at the med box.  
   - **Fix direction:** If any med is `needs-review` (or integrity med recon ≠ passed), footer must read incomplete (e.g. “Reconciliation incomplete · 1 item needs review”) or be suppressed until clear.

### P1

1. **Integrity headline count does not match checklist statuses**  
   - `patients.ts` Elena: `integrity: { passed: 11, total: 13 }`.  
   - `clinical.ts` `integrityChecks`: **10** `passed`, **2** `attention` (OASIS, med recon), **1** `blocked` (POC signature).  
   - Timeline `tl-10` also says “11 of 13 … POC signature outstanding.”  
   - LVN/surveyor expanding the list sees three non-passing chips but headline implies only two failures. Align `passed` to count of `status === 'passed'` (10) or reclassify one check.

2. **Chart clinical CTAs look live without honesty chrome**  
   - **Mark reconciled** / **Message physician** (meds alert), **Resume assessment**, **Send reminder** (POC), document **Open** — buttons with no `onClick`, no `title="Visual only"`, no footer (contrast `/medications` and work-queue).  
   - Does not silently file, but teaches staff that “Mark reconciled” clears a beta-blocker conflict without audit. Prefer disabled + reason or shared “prototype · no durable write” footnote on chart actions.

3. **Overview “Recent activity” drops actor**  
   - Full timeline includes `actor`; overview preview does not. LVN scanning “who raised the med flag” must open Timeline tab. Minor for navigation, material for handoff trust — keep actor on preview rows.

### P2

1. **Integrity ProgressRing always green** (`color="var(--green-300)"`) even at 11/13 or true 10/13. Prefer warn color when any attention/blocked, matching roster integrity bar (`is-warn` / yellow when incomplete).  
2. **Episode day copy:** Elena `episode.day: 1` with SOC Jul 29 while timeline/claim-readiness run through Aug 3 — “Day 1 of 60” understates time-on-service for a field nurse reading the banner.  
3. **RelatedNav on chart is roster-level only** (Intake / Schedule / Episodes). LVN might also want Clinical, Field visits, or Medications domain on the chart strip; Continue-in partially compensates.  
4. **RN-default demo identity** (shell + care team) — LVN pack would benefit from sample LVN on team or role switcher; does not block chart readability.  
5. **Patients “Export list” / “Add patient”** visual-only on roster — out of chart scope; same honesty pattern gap as chart CTAs.

## Route-by-route (LVN lens)

### `#/patients` — Roster
- **Load/chrome:** h1 Patients; counts on service / high risk / SOC pending / recert; RelatedNav; search; filter chips with counts.  
- **Elena findability:** High-risk filter includes her; search “Elena”, “Martinez”, “CI-104289”, “Z47.1” all match haystack.  
- **Open chart:** Whole row keyboard-activatable (`Enter`/`Space` when focus on row).  
- **Integrity teaser:** 11/13 with warn triangle when incomplete — primes LVN before opening chart.

### `#/patients/pt-elena` (overview)
- **Banner identity:** Clear name, MRN, allergies, fall risk, lives alone, Medicare, Campbell CA, primary aftercare hip — doorstep-ready.  
- **Continue SOC** primary CTA → assessments (matches incomplete OASIS story).  
- **Care team:** Taylor Brooks RN CM, Marcus Webb PT, Priya Natarajan HHA, Dr. Susan Cho — no LVN listed.  
- **Record integrity:** Ring + list of 13 checks; open risks called out (OASIS confirmation, metoprolol, POC signature).  
- **Upcoming visits / recent activity:** SN SOC follow-up Today 2:30 PM; activity teaser + Full timeline.  
- **Continue in:** Episode-scoped OASIS / Orders / Claims / Legal SOC package / Work queue.

### `#/patients/pt-elena/medications`
- **Safety-first layout:** Needs-review alert above table; note instructs confirm with physician before next dose — **excellent LVN cue**.  
- High-risk chips on anticoagulants/opioids/beta-blocker class meds.  
- Footer **P0** undermines alert (see Findings).  
- Actions Message physician / Mark reconciled = unlabeled no-ops (**P1**).

### `#/patients/pt-elena/assessments`
- OASIS-E2 Start of care: 82%, in-progress chip, expandable section breakdown, callout “7 responses need clinician confirmation”, Resume assessment button (no handler).  
- Completed screens (MAHC-10, PHQ-2, PT eval) vs due-soon nutrition 0% — progress is honest, not 100%-washed.  
- LVN may not complete OASIS but can see status before visit; Resume is RN workflow chrome.

### `#/patients/pt-elena/timeline` (supporting)
- Chronological referral → intake → SOC → consents → POC → med flag → PT → HHA → claim-readiness.  
- Med flag and claim-readiness reinforce open integrity items.  
- Actor lines support handoff (“Brad clinical assist”, “Taylor Brooks, RN”).

### Deep-link / tab model
- `App.tsx`: `/patients/:patientId` and `/patients/:patientId/:tab` both render `PatientChartScreen`.  
- `TAB_KEYS`: overview · timeline · plan-of-care · assessments · visits · orders · medications · documents.  
- Invalid tab falls back to overview (safe, silent).  
- Tab counts derived from filtered sample arrays — Elena has dense data; good demo patient for E2E.

## What works

- **End-to-end path is coherent:** Patients roster → Elena chart → tabbed meds / assessments / timeline without dead routes.  
- **Patient banner is survey- and field-ready** for identity, allergy, episode, and risk flags.  
- **Integrity UX intent is right:** per-check chips with attention/blocked language; incomplete OASIS and unsigned POC and med conflict are multi-surface (chart, orders, timeline, global meds/clinical per A02).  
- **Medications alert pattern** (elevate needs-review above the list with clinical note) is the correct LVN safety pattern — only the footer breaks it.  
- **Assessments honesty:** 82% + section progress + confirmation callout; complete items show 100% with good chips.  
- **Related / Continue-in** connect chart to schedule ops, OASIS, orders, billing holds, legal evidence, and work queue.  
- **Plan of care** for Elena is explicitly “Pending physician signature,” not presented as signed final.  
- **StatusChip always pairs icon + label** (never color alone) — good a11y for field tablets.

## Data & code anchors (absolute paths)

| Asset | Path |
|-------|------|
| Chart screen | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\PatientChartScreen.tsx` |
| Patients roster | `...\src\screens\PatientsScreen.tsx` |
| Banner | `...\src\components\PatientBanner.tsx` |
| RelatedNav | `...\src\components\RelatedNav.tsx` |
| Patient sample | `...\src\data\patients.ts` (`pt-elena`) |
| Clinical sample | `...\src\data\clinical.ts` (`integrityChecks`, `medications`, `assessments`, `elenaTimeline`, visits/orders/docs) |
| Episode related | `...\src\data\workspace.ts` (`EPISODES` ep-elena, `ROUTE_RELATED['/patients']`) |
| Routes | `...\src\App.tsx` |
| Dev server log | `...\audit\ehr-phase1-uiux\phase0\vite-5194.log` |

## Persona quote

> “I can open Elena, see who she is, her penicillin allergy, fall risk, and the metoprolol fight in seconds — just don’t tell me the med list was ‘reconciled at SOC’ on the same screen where I’m still supposed to confirm 25 versus 50 before the afternoon visit.”
