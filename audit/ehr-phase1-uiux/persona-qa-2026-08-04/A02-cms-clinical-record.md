# A02 — CMS Surveyor — Clinical record integrity (orders, clinical desk, chart)

- Routes: `/clinical` · `/orders` · `/patients/pt-elena` · `/medications` (also chart tabs: timeline, plan-of-care, orders, medications, documents, assessments)
- Base: http://127.0.0.1:5194/# (HashRouter; Vite log shows port 5194 ready at `audit/ehr-phase1-uiux/phase0/vite-5194.log`)
- Worktree: `ehr_phase1` · App: `apps/ehr-prototype`
- Method: Full TSX/data review (`ClinicalScreen`, `OrdersScreen`, `PatientChartScreen`, `MedicationsScreen`; `clinical.ts`, `patients.ts`, `ROUTE_RELATED`, `App.tsx`). Browser fetch to `127.0.0.1` blocked from agent sandbox; route registration and live server confirmed via log + source. Prototype QA only — not production CoP certification.
- Verdict: **CONDITIONAL**
- Summary: For a CMS surveyor sampling Elena Martinez’s episode, the prototype generally **surfaces integrity risk instead of hiding it**: pending physician signatures are first-class on Orders and the chart POC, the metoprolol 25 vs 50 mg discrepancy appears on Clinical, Medications, chart meds, integrity checklist, and timeline, and Clinical note sign does not mutate state (footnote: nothing files without clinician signature). Brad assist on the clinical note drawer is review-gated (“Pre-filled… review required”), though the worklist chip only says “Draft ready.” CONDITIONAL because the chart medications tab footer asserts **“Medication list reconciled at SOC”** while metoprolol remains `needs-review` — false completeness on the clinical record surface — and chart “Mark reconciled” / several Orders CTAs lack the visual-only honesty chrome used on Medications.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Routes load / registered | OK | `App.tsx`: `/clinical`, `/orders`, `/medications`, `/patients/:patientId`, `/patients/:patientId/:tab`. Nav Care delivery lists Clinical / Orders / Medications; chart deep-links work via patient id `pt-elena`. |
| RelatedNav present | OK | `/clinical` → Orders, Medications, OASIS, Documents. `/orders` → Signatures, Medications, Order packages. `/medications` → Orders, Clinical, Patients. Chart uses `RelatedNav route="/patients"` → Intake, Schedule, Episodes + Continue-in from episode related. |
| StatCards / filters / inspector | OK | Orders: 4 StatCards + status tabs + table + Drawer timeline/contact. Medications: 4 StatCards + status/risk filters + list + inspector. Clinical: attention/drafts/completed tabs + note Drawer (SOAP). Chart: integrity ring, multi-tab registry, no separate global StatCards (episode-local). |
| **Unique author / date / time cues?** | OK / partial | Timeline full tab: `when` + `actor` per event (e.g. “Taylor Brooks, RN”, “Brad · reviewed by T. Brooks”). Orders table: ordered by + date; drawer timeline labels + when. Signed SN note: “Taylor Brooks, RN · Today · 11:38 AM”. Visits: clinician + date + time. Gaps: many order timestamps are day-only; chart **overview** “Recent activity” shows title/detail/`when` but **omits actor**; SOAP pre-fill has clinician on drawer sub, not per-section authored timestamp. |
| **Pending signatures visible?** | OK | Orders StatCard “Pending signature” + tab + warn chips (CMS-485 due “In 4 hours”, Harold O2 “Before SOC”). Chart POC callout “Pending physician signature · Sent to Dr. Susan Cho · Jul 29”. Documents: Plan of care · CMS-485 `pending-signature`. Integrity chk-6 **blocked**: “CMS-485 awaiting Dr. Cho signature”. Notification sample: viewed not signed. Unsigned ≠ signed visually. |
| **Med discrepancy not hidden?** | OK (with chart footer conflict — see P0) | Clinical needs-attention: “High-risk · unresolved” + discharge 25 mg vs bottle 50 mg; CTA to patient meds. Medications: default selection path prioritizes needs-review; inspector **Clinical note / discrepancy** callout; high-risk chips; StatCard “Needs review”. Chart meds: dedicated alert with full note + Message physician. Orders: “Metoprolol… dose clarification” urgent/sent. Integrity chk-5 attention. Timeline: “Medication flag raised” (Brad clinical assist). **Conflict:** chart footer still claims list reconciled (P0). |
| **Brad framed as review-not-replace?** | COND | **Today** (adjacent) explicitly: “Review, don’t replace” + “Nothing is filed, signed, or submitted without clinician review.” **Clinical desk:** note sections chip “Pre-filled from assessment — review required”; footer “Nothing files without clinician signature.” Worklist chip only **“Draft ready”** (Sparkles) for Elena SOC follow-up — easy to misread as file-ready without opening the drawer. Timeline attributes Brad with human review where relevant. Medications: “AI-extracted data stays proposed until authorized human intent.” |
| **No silent sign?** | OK (with honesty caveats) | Clinical **Review & sign** has **no `onClick` / no state mutation**; signed state only for pre-seeded Walter note. Footnote present. Medications Reconcile/Hold: visual-only titles + footer; Reconcile disabled when no open discrepancy. Chart **Mark reconciled** and Orders **Send reminder / Edit / New order** are no-ops without disabled/title/footnote — do not file, but look live (P1). No path auto-flips unsigned POC or unsigned note to signed on click. |
| Honesty / incomplete ≠ complete | COND | Incomplete OASIS 82%, pending POC signature, and needs-review med are generally warn/bad/blocked — not green-washed. Exception: chart med footer **reconciled at SOC** while open high-risk discrepancy remains; integrity ring “11/13 passing” is honest only if surveyor expands the list. |
| Cross-links sensible | OK | Clinical ↔ meds/orders/oasis/documents/chart; Orders → signatures/legal/meds; Meds → orders/legal/chart/clinical; Chart Continue-in → schedule/clinical/orders/billing/work-queue. Patient cells deep-link chart orders. |

## Findings

### P0

1. **False completeness on chart medications footer** (`PatientChartScreen.tsx` medications tab). Footer always renders: *“Medication list reconciled at SOC · {socDate}”* whenever any meds exist, **including while** metoprolol is status `needs-review` with an explicit 25 mg vs 50 mg discrepancy alert **on the same tab**. For a surveyor, that is a record that claims reconciliation is done while a high-risk beta-blocker conflict is still open. **Fix direction:** suppress or reword footer when any med is `needs-review` / high-risk unresolved (e.g. “Reconciliation incomplete · 1 item needs review”) and keep alert + integrity chk-5 aligned.

### P1

1. **Chart “Mark reconciled” lacks visual-only honesty** (same meds alert). Primary-looking control with no `onClick`, no `title`, no footer — unlike global `/medications` which documents “no durable write.” Surveyor/staff training risk: appears to clear a safety flag without evidence of who/when.

2. **Clinical “Draft ready” chip understates Brad review requirement.** Chip + Sparkles on `bradDraft` worklist item; full “Review, don’t replace” framing lives on `/today`, not on `/clinical`. Surveyors care that AI-assisted content is not presented as clinician-authored final documentation. Prefer chip copy like “Brad draft · review required” and/or surface the same assist policy line in the note drawer header.

3. **Orders primary actions unlabeled no-ops** (`New order`, drawer `Send reminder`, `Edit order`). No visual-only title/footnote (Medications and Documents patterns exist elsewhere). Does not create silent legal signature, but overclaims operational capability during a survey walkthrough.

4. **Author attribution incomplete on chart overview activity.** Full timeline tab shows `actor`; overview “Recent activity” strips it. Surveyors tracing who did what on first glance lose the unique author cue until they open Timeline.

### P2

1. **Order and document timestamps often day-granularity only** (e.g. “Jul 30” signed). Acceptable for prototype narrative; production survey readiness wants date **and** time (and time zone) on signatures and order status changes.

2. **Clinical “Review & sign”** has a good clinical footnote but no `title="Visual only…"` / disabled state after attempt — slightly weaker than Documents/Competency patterns.

3. **Integrity checklist fully wired only for Elena** — other patients get a note that full history is Elena-only. Honest for prototype scope; survey demo should stay on `pt-elena`.

4. **Clinical screen-sub “3 notes need attention”** is static copy; tab count derives from worklist filter (fine if data stays in sync).

## What works

- **Pending signatures are not buried:** Orders control center (stats + filter + urgent + due chips), chart POC pending callout, document status chips, and blocked integrity check all tell the same story on CMS-485 / physician signature.
- **Metoprolol discrepancy is multi-surface and high-contrast:** needs-attention worklist (bad tone), medications registry/inspector, chart alert, order for dose clarification, integrity attention, Brad/timeline flags — a surveyor following one patient finds the safety issue without digging into hidden panels.
- **Record integrity panel on Elena overview** is surveyor-friendly: passed vs attention vs blocked with plain-language details (F2F, OASIS incomplete items, med recon, POC signature, fall risk, advance directive, etc.).
- **Clinical note drawer honesty for AI/prefill:** every SOAP section labeled “Pre-filled from assessment — review required”; unsigned notes show Review & sign; signed example shows author + timestamp; “Nothing files without clinician signature.”
- **Medications domain honesty is a model:** synthetic banner, reconcile disabled with reason when no discrepancy, titles and footnotes that imported/AI data stays proposed until human intent.
- **Timeline as audit narrative:** referral → SOC → consents → POC drafted (Brad + human) → med flag → PT eval → claim-readiness with **11 of 13** and POC outstanding — incomplete work is explicit.
- **Cross-nav closes the clinical loop** among desk, orders, meds, OASIS, documents, chart, and legal evidence packages.

## Route notes (persona lens)

### `/clinical` — Clinical desk
- Worklist tabs: Needs attention (Raymond note due, Elena OASIS 82%, Elena metoprolol high-risk), Drafts (Elena SN SOC follow-up + Brad draft chip), Completed (Walter signed SN).
- Drawer SOAP + vitals grid; Continue-in Medications / OASIS / Documents / Orders / Chart.
- Sign path is review-oriented and non-mutating; Brad framing stronger inside drawer than on card chrome.

### `/orders` — Orders control center
- Ten synthetic orders; pending-signature count and “overdue in 4 hours” call out Elena CMS-485.
- Row: summary, patient deep-link, category, ordered by + date, due (warn chip when urgent window), status.
- Drawer: patient MRN/payer, order meta, synthetic timeline (incl. “Viewed by Dr. Cho” without falsely showing signed), physician contact, Continue-in signature queue / legal / meds for medication category.

### `/patients/pt-elena` — Chart
- Banner + Continue SOC → assessments; integrity **11/13**; care team named; upcoming visits; recent activity + full timeline with actors.
- Plan of care: pending signature, cert period, diagnoses, frequencies, goals, safety/DME — clearly not a signed final POC.
- Assessments: OASIS in progress with section breakdown and “7 responses need clinician confirmation.”
- Orders/meds/documents tabs align with agency-level lists for this patient; **meds footer P0** undermines otherwise strong discrepancy UX.

### `/medications`
- Domain CLN framing; active/review, needs-review, high-risk, allergy StatCards.
- Elena metoprolol selected path shows discrepancy note, allergies (Penicillin/rash), chart deep-link, visual-only reconcile/hold.
- Strongest anti–silent-write pattern among the four assigned routes.

## Persona quote

> If I’m sampling Elena’s chart for survey, I can find the unsigned POC and the metoprolol conflict in under a minute — just don’t tell me the medication list was “reconciled at SOC” on the same screen where the beta-blocker dose is still open.
