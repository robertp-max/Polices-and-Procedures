# D04 — LVN — Medications safety at visit

- **Routes:** `#/medications`, `#/orders`, `#/patients/pt-elena` (overview + medications tab), `#/clinical`
- **Persona:** LVN · daily field workflow · visit-time med safety
- **Base:** http://127.0.0.1:5194 (HashRouter) · worktree `ehr_phase1` · app `apps/ehr-prototype`
- **Method:** Live route UAT already **PASS** for `#/medications` (`audit/ehr-phase1-uiux/new-pageviews-route-uat.md`); deep safety checks via source + synthetic data (`MedicationsScreen.tsx`, `PatientChartScreen.tsx`, `OrdersScreen.tsx`, `ClinicalScreen.tsx`, `PatientBanner.tsx`, `data/clinical.ts`, `data/patients.ts`). Browser SPA content not re-crawled this run; code paths are authoritative for honesty/safety behavior.
- **Verdict:** **CONDITIONAL**
- **Summary:** High-risk flags, allergy visibility, and the metoprolol 25-vs-50 mg story are present across meds, chart, clinical queue, and orders. The dedicated Medications workspace is honest about prototype no-writes and does not silently reconcile. The patient chart medications tab undercuts that honesty: a static “Medication list reconciled at SOC” footer coexists with an open high-risk discrepancy, and **Mark reconciled** lacks the visual-only guardrails used on `/medications`. Fix those two chart issues and this persona path is near-ready as a design prototype.

## Checks

| Check | Result | Notes |
|-------|--------|-------|
| Route load `/medications` | **OK** | Prior UAT PASS · h1 “Medications & allergies” · 0 page/console errors · RelatedNav present · StatCards · filters · inspector |
| Route load `/orders` | **OK** | Orders table + drawer · Elena med order “Metoprolol tartrate — dose clarification 25 vs 50 mg BID” · Urgent chip · due “Today” · category Medication → Continue in Medications |
| Route load `/patients/pt-elena` | **OK** | PatientBanner · integrity checklist includes med recon attention · medications tab route `/patients/pt-elena/medications` |
| Route load `/clinical` | **OK** | Needs-attention work item “Metoprolol tartrate — dose reconciliation” · status “High-risk · unresolved” · CTA → chart medications |
| High-risk flags? | **OK** | StatCard “High-risk flags” (bad accent when >0) · row/inspector chips · risk filter · chart `chip-bad` High-risk · clinical bad tone · data: Metoprolol, Apixaban, Oxycodone highRisk for Elena |
| Dose discrepancy loud enough? | **CONDITIONAL** | Needs-review (bad) + ShieldAlert review icon + clinical note callout + urgent order + clinical desk item all surface 25 vs 50 mg. **Not** a dual-source comparison grid; list row shows only chart dose “25 mg”. Loud enough after selection / on chart alert; easy to miss on a quick scan of the agency-wide list alone. |
| Allergy visible? | **OK** | Banner always shows Penicillin · rash (`pb-allergy`, status-bad color + ShieldAlert). Meds inspector shows “Allergies on chart” callout (status-bad bg) when patient has allergies. |
| Cannot silently reconcile? | **CONDITIONAL** | **`/medications` OK:** banner “never auto-filed”; Reconcile/Hold/Start reconciliation titled visual-only; Reconcile disabled when no open discrepancy; footnote states no durable write. **Chart FAIL honesty:** “Mark reconciled” has no `title`/disabled/footnote and looks like a real one-click close-out (click is currently a no-op — no state write — but teaches the wrong affordance). Footer claims list reconciled at SOC while `needs-review` med remains open. |
| Cross-links sensible? | **OK** | Meds → Orders / Clinical / patient chart; Orders med category → Medications; Clinical → `/patients/pt-elena/medications` and Medications; banner allergies always in context on chart |
| Incomplete work never looks complete? | **FAIL** | Chart meds footer “Medication list reconciled at SOC · Jul 29” while integrity `chk-5` = attention “Metoprolol dose discrepancy unresolved” and med-1 status = needs-review |
| RelatedNav / inspector / filters | **OK** | Status + risk filters, search, sticky inspector on meds; clinical tabs; chart tab count for medications |

## Findings

### P0

1. **False completeness on chart medications tab** — `PatientChartScreen.tsx` always renders  
   `Medication list reconciled at SOC · {socDate}` whenever any meds exist, including while `needsReviewMed` (Metoprolol, high-risk, explicit 25 vs 50 mg note) is open and Record integrity marks “Medication reconciliation” as **attention**.  
   **Why P0:** Rubric — *false completeness*. An LVN at visit can leave thinking recon is done; surveyor/prototype reviewers will score this as unsafe honesty failure.  
   **Fix direction:** Gate footer on no open `needs-review` / unresolved discrepancy, or replace with “Reconciliation incomplete · N items need review”.

### P1

2. **Chart “Mark reconciled” lacks visual-only honesty** — Primary-looking teal actions “Message physician” / “Mark reconciled” have no `title="Visual only…"`, no disabled state, no footnote (contrast with `/medications` Reconcile/Hold). Click does not mutate data today, so this is not a silent legal write — but it *looks* like silent one-click recon, violating the persona check “Cannot silently reconcile?” in UX terms.  
   **Fix:** Mirror MedicationsScreen: `title`, footnote, optional confirm/reason, or disable with “prototype · no legal write”.

3. **Dose discrepancy is note-driven, not source-loud in the list** — Registry row for med-1 shows dose `25 mg` only; the bottle-vs-discharge conflict lives in `note` (inspector + chart alert + order summary + clinical meta). LVN scanning the med list before opening inspector may under-weight severity. Discovery plan called for dual-source discrepancy states; prototype is partial.  
   **Fix:** List-level dual dose line or “Source conflict · 25 mg vs 50 mg” chip on needs-review rows.

4. **Agency-wide meds registry is not visit-scoped by default** — `/medications` mixes Elena with Walter/Margaret/Samuel. Field LVN for Elena’s 2:30 PM visit is better served by chart meds tab or a patient filter default. Clinical CTA correctly deep-links to patient meds; primary nav “Medications” does not.  
   **Fix:** Patient context filter or “Today’s patients” default when opened from field paths.

### P2

5. **High-risk chip tone inconsistency** — MedicationsScreen uses `StatusChip tone="warn"` for High-risk; chart uses `chip-bad`. Prefer one severity language for anticoagulants/opioids/beta-blocker dose conflicts.

6. **Hold always offered as enabled secondary** on meds inspector (visual-only title present — acceptable for prototype polish).

7. **No MAR / five-rights / administer-at-visit surface** — Expected gap for design prototype CLN-004 med recon focus; note for later field-visit work, not a defect against current page charter.

## What works

- **Coherent Elena safety story** across four surfaces: high-risk metoprolol needs-review, apixaban/oxycodone high-risk flags, penicillin allergy, urgent dose-clarification order, clinical “High-risk · unresolved”, integrity attention, timeline “Medication flag raised”.
- **Medications workspace honesty model is strong:** synthetic banner, “never auto-filed without clinician intent”, reconcile gating via `reconcileDisabledReason`, footnotes, Start reconciliation only selects high-risk/review item (no write).
- **Allergies are hard to miss** on chart entry (PatientBanner) and again in med inspector before reconcile.
- **High-risk StatCard + risk filter** give LVN a one-click path to safety-critical meds.
- **Cross-nav:** Orders ↔ Medications ↔ Clinical ↔ Chart; medication-category order drawer links to Medications.
- **Clinical note preview** keeps metoprolol discrepancy in Assessment/Plan for the SOC follow-up visit — correct field behavior modeling.

## Evidence (code / data anchors)

| Surface | Path | Signal |
|---------|------|--------|
| Meds list data | `apps/ehr-prototype/src/data/clinical.ts` med-1 | `needs-review`, `highRisk: true`, note 25 vs 50 mg |
| Orders | same · ord-2 | dose clarification, `urgent: true`, due Today |
| Clinical work | `ClinicalScreen.tsx` elena-metoprolol | High-risk · unresolved → `/patients/pt-elena/medications` |
| Chart banner | `patients.ts` + `PatientBanner.tsx` | Penicillin · rash |
| Chart recon UX | `PatientChartScreen.tsx` ~575–626 | alert + Mark reconciled + **reconciled at SOC footer** |
| Meds honesty | `MedicationsScreen.tsx` ~45–51, 133–138, 430–452 | disabled reconcile + visual-only titles |
| Prior load UAT | `audit/ehr-phase1-uiux/new-pageviews-route-uat.md` | `#/medications` PASS |

## Persona quote

> “I can see the high-risk flags and Elena’s penicillin allergy, and I won’t dose that metoprolol until the 25-vs-50 is settled — but don’t tell me the list was reconciled at SOC while that red needs-review is still open, and don’t give me a one-click Mark reconciled that looks real on the chart.”
