# A01 — CMS Surveyor — Patient rights, consents, documents & forms

- Routes: `/documents`, `/forms`, `/patients`, `/patients/pt-elena`, `/legal-evidence`
- Verdict: **CONDITIONAL**
- Method: Source/code review of worktree screens + synthetic data (live `http://127.0.0.1:5194` not reachable from this agent host; HashRouter SPA). Files reviewed under `apps/ehr-prototype/src/screens/{Documents,FormsLibrary,Patients,PatientChart,LegalEvidence}Screen.tsx`, `src/data/{workspace,clinical,patients,navigation}.ts`.
- Summary: Documents, Forms, and Legal Evidence present an honest survey-facing story: signed vs pending is filterable and chip-coded; form catalog shows semantic IDs and versions; seal/export/signature actions are disabled or footnoted as visual-only when incomplete. Gaps for a CoP survey walk-through are (1) chart Documents tab is a second, thinner model with dead “Open” and no cross-links to `/documents` or evidence packages, (2) patient rights is only explicit inside legal package PKG-8688 / timeline prose—not a first-class chart artifact with CL-FM linkage, and (3) sample narrative inconsistency on Harold discharge (sealed package vs draft controlled doc vs pending-SOC episode).

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| `/documents` loads with title, RelatedNav, StatCards, filters, inspector | OK | Title “Documents & signatures”; RelatedNav → Forms / Orders / Legal evidence; stats for total / pending / signed / draft; search + status filters; inspector with patient jump, Continue-in links, Capture signature. |
| `/forms` loads with semantic IDs & versions | OK | Catalog rows show `semanticId` (e.g. CL-FM-001), `version` chip, status; inspector repeats Semantic ID / Version / Owner / Use. Banner: sample of 349, not full index. |
| `/patients` roster usable for survey start | OK | Roster with MRN, integrity fraction, episode/SOC-pending filters. RelatedNav only Intake/Schedule/Episodes—no Documents/Forms/Rights shortcut. |
| `/patients/pt-elena` chart — consents & rights path | CONDITIONAL | Documents tab: “Service agreement & consents” **Final**, POLST **Final**, CMS-485 **Pending signature**, OASIS **Draft**. Integrity chk-7 “Consents and privacy notices” **passed**. Timeline “Consents signed… patient rights”. No discrete Patient Rights form row; no link to legal evidence or documents workspace. |
| `/legal-evidence` packages, holds, incomplete honesty | OK | Registry + inspector (overview / artifacts / custody / exports); seal disabled with reason when hold, hash fail, pending sig, completeness &lt; 100%; export blocked when readiness blocked; flask banner: nothing sealed/held/WORM. |
| Locate signed consents vs pending | OK | Controlled docs: cdoc-2 signed consent vs cdoc-1 pending CMS-485; filters Pending signature / Signed / Draft. Chart uses Final / Pending signature / Draft (different vocabulary—see P1). |
| Forms have semantic IDs/versions | OK | CL-FM-001 v4.2, CL-FM-029 v8.0, CL-FM-112 v2.1, BN-FM-003 v1.4, QA-FM-014 v3.0; draft/retired filters present (sample currently all “current”). |
| Rights/consent path honest | CONDITIONAL | Signed consent not overstated as claim-ready: POC still pending, OASIS incomplete, integrity 11/13 with blocked POC signature. Rights acknowledgment appears as evidence artifact in PKG-8688, not as chart doc with form ID. |
| Incomplete not shown complete | OK (docs/forms/legal) · FAIL (spot data) | Capture signature disabled when signed/void; Seal package disabled with explanatory footnote; exports readiness chips; forms “Start form instance” title says visual only. **Harold** narrative: pending-SOC patient with sealed discharge package (PKG-8755) while controlled discharge teaching remains draft—confusing for survey completeness judgment. |
| Cross-links to legal evidence | CONDITIONAL | `/documents` and `/forms` RelatedNav + per-row Continue-in include Legal evidence. Chart documents tab has **no** related/evidence links. Patients RelatedNav omits Records domain. |
| Prototype honesty banners / visual-only actions | OK | Flask banners on documents, forms, legal evidence. Signature/seal/hold/export titled or footnoted visual-only. Patients “Add patient” / “Export list” lack visual-only titles (P2). Chart doc “Open” and POC “Send reminder” lack visual-only affordance (P1/P2). |

## Findings

### P0

_None for prototype survey-readiness of UX honesty on primary DOC/FRM paths._ Incomplete clinical work (POC signature, OASIS draft) is not painted as complete on Elena’s chart or claim-adjacent integrity strip.

### P1

1. **Chart Documents tab is an isolated second registry**  
   - Clinical `documents` (status: final | pending-signature | draft) vs workspace `CONTROLLED_DOCUMENTS` (signed | pending-signature | draft | void).  
   - Surveyor opening Elena’s chart Documents sees “Final” consents with a non-functional **Open** control and no Continue-in to `/documents`, `/forms` (CL-FM-001), or `/legal-evidence` (PKG-8821 / PKG-8688).  
   - Risk: survey walk-through from chart fails to reach signature queue or evidence package that actually shows rights pin + custody.

2. **Patient rights not first-class on the clinical record path**  
   - CoP rights/consent expectation: discrete acknowledgment, form identity, signature state.  
   - What exists: timeline prose “Service agreement, privacy notices, patient rights”; integrity “Consents and privacy notices · Signed at SOC”; form CL-FM-001 “Service agreement & consents”; evidence item “Patient rights acknowledgment” only inside mock survey package PKG-8688.  
   - Missing: chart row for patient rights with semantic ID, signed-at, and link to evidence.

3. **Sample data conflict — Harold discharge**  
   - `pt-harold`: episode `pending-soc`, integrity 4/13.  
   - PKG-8755: “Discharge instruction package” **sealed**, completeness 100%, patient/rep signed.  
   - cdoc-4: “Discharge teaching sheet” **draft**, same patient.  
   - Risk: surveyor training on sealed-vs-draft honesty gets a contradictory example (false completeness on wrong episode stage).

4. **Status vocabulary split (signed vs final)**  
   - Documents workspace: **Signed**. Chart: **Final** for same consent packet.  
   - Survey language usually asks “signed and dated.” “Final” can be misread as locked complete without clear signature intent.

### P2

1. Documents status filter toolbar omits **Void** though `void` is a modeled status and STATUS_META includes it.  
2. Forms catalog sample is 5/349 (honest via StatCard “Not 349/349 yet”) but zero draft/retired rows—filters look empty when exercised.  
3. Patient chart RelatedNav uses `route="/patients"` → Intake / Schedule / Episodes only; Records group not surfaced from chart.  
4. Patients primary actions “Add patient” / “Export list” lack `title`/footnote that they are visual-only (unlike Documents/Forms primary CTAs).  
5. Controlled document rows show internal ids (`cdoc-1`) not form semantic IDs; only some Continue-in labels mention CL-FM-029.  
6. PKG-8688 (survey package) has hash attention and blocked export—good honesty—but is the only place “Patient rights acknowledgment” is labeled; easy to miss if surveyor only searches chart.

## What works

- **Signed vs pending is operable on `/documents`**: StatusChip tones (good/warn/neutral/bad), filters, pending StatCard “Blocks claim / seal paths,” Capture signature disabled when already signed/void, explicit footnote that no certificate/intent is written.
- **Forms library is survey-legible**: Semantic IDs + versions on every row and in inspector; draft labeled “Not authorized for use”; links to Documents, Legal evidence, Beneficiary notices, FRM register (`/requirements`).
- **Legal evidence is the strongest CoP-adjacent surface**: Purpose kinds (SOC, incident, discharge, order, disclosure, **survey**), completeness meters, pinned vs incomplete artifacts, signature chain pending/signed, legal hold callout, hash mismatch attention, dual export readiness, sealDisabledReason gating, assemble wizard with version-pin checklist.
- **Elena integrity + timeline support an honest SOC story**: Consents passed; POC signature blocked; OASIS attention; claim holds elsewhere align with incomplete work.
- **Nav honesty**: Records group has built routes for Documents, Forms, Legal evidence (not external eCign/Policy Suite rails as destinations).
- **Cross-links among Records screens** are present via RelatedNav and per-item Continue-in buttons.

## Persona quote

> I can tell signed consents from pending orders on the Documents and Legal Evidence workspaces, but if I start in the patient chart—the place I actually open in survey—I don’t get a clear patient-rights artifact with form ID, and “Open” doesn’t take me to the evidence package that would defend CoP rights documentation.

## Route-by-route notes (quick)

### `/documents` — Documents & signatures
- Domain kicker DOC; synthetic banner; RelatedNav Forms · Orders · Legal evidence.
- Sample set: CMS-485 pending (Elena), Service agreement signed (Elena), Verbal order pending (Walter), Discharge teaching draft (Harold).
- Inspector: patient open-chart, signer, pages, related destinations, Capture signature gated.

### `/forms` — Forms library
- Domain FRM; semantic IDs CL-FM-*, BN-FM-*, QA-FM-*; versions pinned; status current/draft/retired model.
- CL-FM-001 admission packet links Documents / Intake / Evidence—closest rights/consent form definition.

### `/patients` & `/patients/pt-elena`
- Roster integrity column (Elena 11/13) correctly warns incomplete.
- Chart tabs include Documents; consents final, POC pending, OASIS draft—aligned with integrity checks.
- Gap: no Documents-domain RelatedNav; Open dead; rights not discrete.

### `/legal-evidence` — Legal evidence packages
- PKG-8821 Elena SOC draft 62% incomplete pins; PKG-8688 survey set with Rights artifact + hash attention; seals/exports gated honestly.
- Cross-nav to Documents, QAPI, Orders, DOC-005 requirements.

## Recommendation (product, not in-scope fix)

For survey-ready UX prototype: unify chart Documents with controlled documents vocabulary; add patient-rights row (semantic ID + signed-at) on Elena; wire Open/Continue-in to `/documents` and relevant PKG-*; fix Harold sealed-discharge vs pending-SOC sample; add RelatedNav Records chips on patient chart.

---

*Report only · A01 CMS Surveyor · 2026-08-04 · no app source changes · no commit*
