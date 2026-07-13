# P0 / P1 / P2 Packet Backlog (PRD §29 #15)

This release ships the universal framework + Quarterly & Monthly QAPI (analytical-report archetype).
All other mandated-event families are **mapped in the registry** (`eventPacketMap.ts`) as archetype
entries with `status: needs-review | gap` and are surfaced in `COVERAGE_REPORT.md` (70 families mapped,
0 unmapped, 14 gap). Building each below = configuration + a subtype module, not a new renderer.

## P0 (next)
1. Governing Body Meeting Packet (`meeting` archetype, Governing Body subtype)
2. Annual QAPI Evaluation & Plan (`analytical-report`, annual cadence)
3. PIP/CAPA Packet (`pip-capa`)
4. Incident / Adverse Event / RCA Packet (`incident-investigation`)
5. Survey / Deficiency / Plan-of-Correction Packet (`survey-response`)
6. Employee Onboarding & Competency Packet (`employee-competency`)

## P1
Policy Lifecycle; Privacy/Security Incident/Breach; Emergency Preparedness; Infection Prevention &
Surveillance; Personnel & Credentialing Audit; Compliance Committee; Risk & Safety Committee;
Billing/Claims/Overpayment Audit.

## P2
Vendor/BAA oversight; Licensure/accreditation renewal; Contract review/renewal; Change of ownership/
closure/branch; Records destruction & legal hold; Annual enterprise compliance-program evaluation;
Audit-readiness / mock survey; Training-program annual evaluation.

Each entry: define its `MandatedEventPacketDefinition` (forms, approvals, signers, gates, retention,
confidentiality, Drive destination), add any unique analytical computation or subtype module, and
confirm it conforms to the universal packet contracts + architecture tests.
