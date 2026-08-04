# 32-Agent Persona QA — EHR Prototype

**App:** http://127.0.0.1:5194 (HashRouter)  
**Branch:** ehr_phase1 @ 7e82f6fc  
**Date:** 2026-08-04  
**Mode:** Design-prototype QA (synthetic data only) — not production clinical validation  

## Personas (8 agents each = 32)

| Wave | Persona | Focus |
|------|---------|--------|
| A01–A08 | **CMS Surveyor** | CoP readiness, clinical record integrity, QAPI, OASIS, emergency, rights/evidence |
| B01–B08 | **Administrator** | Governance, BAAs, security, access, revenue oversight, migration, reporting |
| C01–C08 | **DON** | Clinical operations, supervision, orders, competency, QAPI effectiveness |
| D01–D08 | **LVN** | Daily field workflow: Today, visits, meds, messages, documents, queue |

## Severity
- **P0** — Blocks survey / patient safety / false completeness / silent legal action
- **P1** — Major workflow gap, broken cross-link, confusing status, missing persona affordance
- **P2** — Polish, copy, density, minor a11y
- **OK** — Meets prototype expectations for this persona

## Report file naming
`audit/ehr-phase1-uiux/persona-qa-2026-08-04/{ID}-{persona-slug}-{topic}.md`

## Orchestrator outputs
- `99-DEFECT-LEDGER.md`
- `99-EXECUTIVE-SUMMARY.md`
- `99-GO-NO-GO.md`
