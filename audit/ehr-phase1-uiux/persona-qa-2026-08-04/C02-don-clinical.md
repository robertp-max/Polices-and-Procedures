# C02 — DON — Clinical desk operations

- **Routes:** `#/clinical`, `#/patients`, `#/medications`, `#/orders` (plus chart drill-ins `#/patients/:id` and `#/patients/:id/medications` as cross-link targets)
- **Persona:** Director of Nursing (DON) — clinical operations risk, open med discrepancy, incomplete SOC, status honesty
- **Base:** http://127.0.0.1:5194/#
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1` · app `apps/ehr-prototype`
- **Method:** Static/source QA of screen TSX + synthetic data (`clinical.ts`, `patients.ts`, `workspace.ts` ROUTE_RELATED) + prior Playwright load evidence (`new-pageviews-route-uat.md`: `#/medications` PASS). Live `web_fetch` to 127.0.0.1 blocked by tool SSRF policy; Vite log shows port **5194** previously healthy.
- **Verdict:** **CONDITIONAL**
- **Summary:** As DON, I can see the two headline clinical risks on the clinical desk and medications workspace: Elena’s metoprolol dose discrepancy (high-risk, needs-review) and incomplete OASIS-E2 SOC (82%, resume path). RelatedNav and “Continue in” cross-links between clinical ↔ meds ↔ orders ↔ OASIS ↔ chart are present and mostly sensible. Status honesty is strong on Medications (banner, disabled reconcile, footnotes) but **broken on the patient chart medications tab footer**, which still asserts “Medication list reconciled at SOC” while an open high-risk discrepancy is shown above it. Orders/clinical open counts also disagree with live data in places.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Load / route existence (`/clinical`) | OK | `ClinicalScreen` routed; title “Clinical”; worklist tabs Needs attention / Drafts / Completed / All |
| Load / route existence (`/patients`) | OK | Roster with risk, SOC pending, recert filters; integrity column |
| Load / route existence (`/medications`) | OK | Prior UAT PASS h1 “Medications & allergies”; StatCards + registry + inspector |
| Load / route existence (`/orders`) | OK | Orders control center, status tabs, drawer with timeline |
| RelatedNav present | OK | `/clinical` → Orders, Medications, OASIS, Documents; `/medications` → Orders, Clinical, Patients; `/orders` → Signatures, Medications, Order packages; `/patients` → Intake, Schedule, Episodes |
| Open clinical risk — med discrepancy | OK | Clinical work item “Metoprolol tartrate — dose reconciliation” (High-risk · unresolved); med-1 status `needs-review` + note; Orders ord-2 dose clarification urgent/sent; integrity chk-5 attention |
| Open clinical risk — incomplete SOC | OK | Clinical “OASIS-E2 · Start of care” 82% + Resume → assessments; chart CTA “Continue SOC”; Harold `pending-soc` on Patients filter; OASIS blocking items in data |
| Cross-links clinical → chart/meds/orders | OK | WorkCard CTAs; note drawer Continue in; meds inspector → chart/orders/clinical/legal; orders drawer → meds when medication category |
| Status honesty — incomplete never looks complete | **FAIL** | Chart meds footer always “Medication list reconciled at SOC · {date}” even when `needs-review` present; integrity ProgressRing always green |
| Status honesty — sign/reconcile not silent legal write | **CONDITIONAL** | Meds: excellent (banner, disabled Reconcile, titles, footnotes). Clinical note: “Nothing files without clinician signature” footnote but primary **Review & sign** has no `title`/disabled. Chart **Mark reconciled** has no visual-only cue. Orders **New order / Send reminder / Edit order** lack prototype footnotes |
| DON risk scan from Patients roster alone | **CONDITIONAL** | High risk + integrity 11/13 warn for Elena; **SOC pending** filter only catches Harold (`pending-soc`), not unfinished Elena SOC (episode `active`, `socCompletion` 82 not shown on roster) |
| Nav badge honesty | **CONDITIONAL** | Clinical badge **3** matches needs-attention count. Orders badge/subtitle **4 open** ≠ data-derived open set (pending-signature=3, sent=3, draft=1) |
| Filters / inspector / StatCards | OK | Meds status+risk filters, reconcile gate; Orders tabs+stats; Patients chips with counts |
| Prototype disclaimer | OK | Meds domain banner explicit synthetic / no legal write; Clinical note pre-fill chips “review required” |

## Findings

### P0

1. **False completeness on chart medications tab** — `PatientChartScreen.tsx` always renders footer copy `Medication list reconciled at SOC · {socDate}` whenever any meds exist, including Elena with open `needs-review` metoprolol (high-risk dose discrepancy) in an alert above the list. Surveyor/DON reading the footer can believe reconciliation is closed while the same screen shows an unresolved discrepancy. **Fix:** gate footer on absence of `needs-review` / open discrepancy (e.g. only when reconciled, or show “Reconciliation incomplete · 1 item needs review”).

### P1

2. **Chart “Mark reconciled” lacks honesty affordance** — Primary-looking action next to open high-risk med with no `disabled`, no `title="Visual only…"`, and no footnote (unlike Medications workspace Reconcile). Risk: prototype demo implies durable clinical resolution.

3. **Orders open-count honesty** — Screen subtitle hardcodes “4 open · 1 signature overdue soon” and nav badge is `4`, while `orders` data yields 3 pending-signature + 3 sent + 1 draft (and StatCards compute true counts). DON triage from badge/subtitle is misleading.

4. **Patients “SOC pending” does not surface incomplete post-SOC OASIS** — Filter is only `episode.status === 'pending-soc'` (Harold). Elena’s unfinished SOC assessment (82%, integrity attention on OASIS/meds/POC) stays on **Clinical** / chart / OASIS, not on the roster filter DONs often use for incomplete admission work. `socCompletion` exists on patient model but is unused on the roster.

5. **Record integrity ring always green** — Chart overview `ProgressRing` uses `color="var(--green-300)"` even at 11/13; Patients list correctly uses warn yellow for incomplete. Visual tone understates open integrity risk on the chart.

### P2

6. **Clinical subtitle copy** — “3 notes need attention” while needs-attention includes assessment + medication reconciliation (not only notes). Prefer “3 items need attention” or derive from kinds.

7. **Clinical / Orders destructive-looking chrome without titles** — `Review & sign`, `New order`, `Send reminder`, `Edit order`, Patients `Add patient` / `Export list` would match Medications pattern better with visual-only titles/footnotes.

8. **Patients RelatedNav omits Clinical / Medications** — Related is Intake, Schedule, Episodes only; DON jumping from roster to clinical risk desk needs extra nav steps (mitigated by Care delivery nav + chart Continue in).

9. **Integrity checklist detail only for Elena** — Other patients show “Full checklist history is wired for Elena…” — acceptable prototype scope, but DON multi-patient integrity review is thin.

## What works

- **Clinical desk as DON risk radar:** Metoprolol discrepancy (tone bad, High-risk · unresolved) and incomplete SOC OASIS (82% progress, Resume assessment → `/patients/pt-elena/assessments`) appear first under Needs attention; PT documentation-due and signed SN note keep status vocabulary honest (warn vs good Signed).
- **Medications workspace is the honesty gold standard for this persona:** synthetic banner; StatCards for Needs review / High-risk; status chips; discrepancy note callout; allergy callout; Reconcile disabled when no open discrepancy with clear reason; Hold/Reconcile titles state no durable write.
- **Orders surfaces signature and med-order risk:** CMS-485 pending signature urgent “In 4 hours”; metoprolol clarification order urgent/sent/due Today; oxygen “Before SOC” for Harold; category chips; patient deep-link to chart orders tab.
- **Patients roster supports triage:** high-risk filter, SOC pending (for true pre-SOC), recert window, integrity X/Y with warn icon when incomplete, click-through to chart.
- **Cross-links are real routes:** `/patients/:id/:tab` supports medications/orders/assessments; RelatedNav and Continue-in blocks connect CLN surfaces; Clinical → Medications header button; Meds → Clinical desk / Orders.
- **Synthetic data story is coherent across screens:** same Elena metoprolol narrative on clinical worklist, meds registry, orders list, integrity checks, next-best actions, and Brad suggestion — DON can follow one risk without narrative contradiction (except chart footer).

## Route notes (DON lens)

### `#/clinical`
- Title/sub: Clinical · “3 notes need attention” (count OK, wording soft).
- RelatedNav: Orders, Medications, OASIS, Documents.
- Needs attention (3): Raymond PT note due; Elena OASIS 82%; Elena metoprolol high-risk unresolved → `/patients/pt-elena/medications`.
- Note drawer: SOAP pre-fill chips “review required”; signed state only on completed Walter note; footer “Nothing files without clinician signature.”
- Header jumps: Medications, OASIS, Start visit documentation.

### `#/patients`
- Sub: counts high risk / SOC pending / recert from data.
- Filters include **SOC pending** (Harold only) and **High risk** (includes Elena).
- Integrity column is the best roster signal for open record risk (Elena 11/13, Harold 4/13).
- RelatedNav weak for pure clinical desk hop (no Clinical/Medications chips).

### `#/medications`
- Domain kicker CLN; banner states no legal med list write.
- Open risk countable: `needs-review` = 1 (metoprolol); high-risk flags multiple (anticoagulant, opioid, insulin, loop, warfarin).
- Inspector exposes discrepancy note + chart link + Continue in Orders / Legal evidence / Chart / Clinical.
- Reconcile gating via `reconcileDisabledReason` is status-honest.

### `#/orders`
- RelatedNav: Signatures, Medications, Order packages.
- Stats from live counts; urgency chips for Due In 4 hours / Today / Before SOC.
- Medication-category drawer adds Medications continue button — good DON handoff from order clarification to med list.
- Subtitle/badge open count not data-driven (see P1).

## Persona quote

> I can find the open metoprolol discrepancy and unfinished SOC from the clinical desk and meds board, but stop telling me the medication list was “reconciled at SOC” on the same chart where the high-risk dose is still unresolved — that kind of false green light is exactly what fails a survey walkthrough.
