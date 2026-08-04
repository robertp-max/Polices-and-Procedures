# Executive summary — 32-agent multi-persona QA

**Product:** Care Indeed Home Health EHR design prototype  
**Branch / tip:** `ehr_phase1` · `7e82f6fc`  
**Date:** 2026-08-04  
**Base URL:** http://127.0.0.1:5194  

## Scope

32 independent agents reviewed the redesigned nav (no external rails) as:

| # | Persona | Lens |
|---|---------|------|
| 8 | **CMS Surveyor** | CoP readiness, clinical record, OASIS, QAPI, EMP, legal evidence, personnel, end-to-end survey trail |
| 8 | **Administrator** | Org master, IAM, BAA, security, revenue, reports/exports, migration, AI/interop |
| 8 | **DON** | Work queue, clinical, orders, OASIS/episodes, aide supervision, competency, QAPI, field/schedule |
| 8 | **LVN** | Today, schedule, field visits, meds, messages, documents, work queue, patient chart |

Each agent produced a structured report under `audit/ehr-phase1-uiux/persona-qa-2026-08-04/`.

## Headline

> The full-nav redesign is a **credible design prototype** for domain depth, RelatedNav, and write-honesty on Legal Evidence / Medications / AI / migration gates.  
> It is **not yet surveyor- or bedside-trustworthy** until chart-level false completeness and cross-surface data story breaks are fixed.

**Overall: CONDITIONAL GO for design review · NO-GO for “survey-ready / field-ready” demo claims.**

## What all four personas praised

1. **Legal evidence** — holds, hash attention, seal gates, dual export readiness (A06 **PASS**).
2. **AI never autonomous** — kill switch, promote blocked in shadow, clinical “nothing files without signature” (B08 **PASS**).
3. **OASIS lock honesty** — incomplete % visible; lock disabled with blockers (A03, C04).
4. **Claim holds for Elena** — POC + OASIS blockers consistent across episodes / billing / legal draft package (A08).
5. **RelatedNav + Continue-in** — rails removed; messages/documents/forms/vendors are first-class (all personas).
6. **High-risk med story** multi-surface (metoprolol 25 vs 50) when not undercut by chart footer.

## Critical failures (P0)

| ID | Issue | Who cares |
|----|--------|-----------|
| **P0-01** | Chart meds footer always **“Medication list reconciled at SOC”** while recon open | Surveyor sampling chart, DON clinical risk, LVN at visit |
| **P0-02** | EMP coverage incomplete undercount; missing patients not incomplete | CMS emergency CoP |

## Top systemic P1 themes

1. **Data narrative inconsistency** — missed visit escalated in queue/messages but absent from visit registry.
2. **Badge/count inflation** — shell badges do not match sample list lengths.
3. **Live-looking no-ops** — Orders/Billing/chart buttons without visual-only chrome.
4. **Wrong-patient related links** in drawers (Walter/Margaret contamination on Elena work).
5. **“My” surfaces are agency boards** — no owner/caseload filter; shell is RN not LVN.
6. **Admin dual-control / BAA hard gates** are narrative, not interactive maker-checker.

## Persona quotes (representative)

- **CMS:** “I can find the unsigned POC and the metoprolol conflict in under a minute — just don’t tell me the med list was reconciled on the same screen.”
- **Admin:** “Cutover stays blocked and AI never owns the legal record — good. Dual-control and BAA still read as posters, not workflows.”
- **DON:** “I can escalate a missed visit from the queue — until a red Missed row exists on Field visits, I won’t trust morning census.”
- **LVN:** “Taylor’s tasks and Elena’s allergy are clear — if unread never moves and Connect is still the top bar, this isn’t my inbox.”

## Recommended remediation order (next 48h)

1. Fix **P0-01** chart meds footer (gate on integrity/recon status).  
2. Align **missed visit** data (`clinical.ts` + wq-5 + msg-3) **or** demote queue language.  
3. Correct **integrity 11/13** math and badge counts.  
4. Add visual-only honesty to Orders/Billing/chart CTAs.  
5. Patient-scope Related/Continue-in in drawers (no wq-2 bleed).  
6. Owner/mine filter on work-queue; optional LVN demo persona.  
7. EMP incomplete set includes all patients without profiles.  

Full ledger: `99-DEFECT-LEDGER.md` · Decision: `99-GO-NO-GO.md`
