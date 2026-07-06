# TEAM 1 — CMS-485 COMPLIANCE_TRACEABILITY.md

**Module**: GAO-01 / cms-485 CMS-485 Plan of Care and Compliance Integration  
**Primary regulations**: 42 CFR §484.60 (Plan of Care), §484.65 (QAPI cross), 484.50, 484.105, physician certification/recert, F2F encounter, OASIS linkage.

## policyRefs (Current + Recommended)

Current (host):
- "CL-CP-001" (Plan of Care)

Recommended additions (from repo content + clinical mapping):
- CL-CP-001 (core POC)
- 42 CFR §484.60 (Conditions of Participation — Plan of Care)
- CMS-485 form fields (Box 14-23 orders, goals, interventions, disciplines, frequency, physician signature)
- F2F encounter documentation
- OASIS to POC consistency (skilled need, homebound)
- Documentation defensibility for ADR / post-payment review
- Signature / certification requirements (physician + agency)

## workflow_id recommendations

- "wf-cms485-poc-intake" — SOC Plan of Care creation
- "wf-cms485-poc-maintain" — ongoing updates / recert
- "wf-cms485-audit-sim" — advanced training simulator completion

## event_id recommendations

- "evt-cms485-completion" — module complete + simulator pass
- "evt-cms485-evidence-captured" — case rationales + form trace review recorded
- "evt-cms485-signature" — clinician/supervisor sign-off

## Evidence Objects (required completion artifacts)

From repo + host cases:
- 3 final case reviews with selected fields + rationales (mandatory review step)
- Traceability checklist (Assessment → Orders → Goals → Visit Frequency → Disciplines → Signature)
- Audit note / defensibility flag per field
- Score + domain breakdown (per scoring engine)
- Completion timestamp + employeeId (Journey store)

JourneyEvidence shape integration: record per attempt with appendix or custom payload for "poc-sim-evidence".

## Supervisor / DON / HR Implications

- Reports to: Clinical Manager / DON (per ADV track)
- Signature gate: yes (Journey supervisor signature for advanced clinical)
- Clearance impact: POC mastery required for independent practice in clinical roles (RN, PT etc.)
- Audit readiness: evidence must survive surveyor/ADR review — simulator forces rationale for every selection.

## Audit-Readiness Notes

- One coherent story requirement emphasized in every lesson (narrations).
- ADR root cause prevention.
- Exact match between POC orders, visit notes, OASIS, claim.
- No templated vague language.
- All 3 cases include realistic traps (wound grade mismatch, homebound, med reconciliation, missing DME, firearm, power issues).

**42 CFR linkage evidence**: repo training content + cases explicitly call out POC, certification period, disciplines, frequency, goals, interventions, physician orders.

**Remediation**: rationale review + retake maps to Journey remediationPlans.

## Recommended Extension in types

Extend JourneyModule or AdvancedTrainingModule with:
- simulatorCases: string[]
- pocTraceabilityFields: string[]
- passThreshold: 80 (align repo)

**No PHI**: Demo patients (Henderson, Alvarez, Okafor) — synthetic.
