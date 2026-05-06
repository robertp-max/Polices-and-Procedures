# ADR-ACHC-SURVEY-READINESS

## CONTEXT
- Current ACHC overlay is print-row authoritative for direct mappings and includes an attachment evidence layer.
- Survey readiness gaps exist where standards in ACHC required-items are present but lack direct policy/form/workflow traceability.
- Gap profile (current state): 81 standards reviewed, 27 no-gap, 8 partial, 46 gap, 46 high-risk.
- Core issue: print-only mappings are accurate for source fidelity, but on-site survey readiness requires explicit operational artifacts and retrieval paths.

## PROBLEM
- A surveyor may not be able to retrieve required evidence rapidly for standards with empty or ambiguous traceability.
- High-risk concentration exists in standards not directly represented in print-row mappings (notably HH2 compliance specifics, HH6 QAPI operational records, HH7-3 emergency preparedness artifacts).
- Current view can show policy projection but does not guarantee complete survey-evidence retrieval paths.

## DECISION
1. Policy-level corrections
- Map missing operational standards to explicit IBM policy IDs where governance/compliance/clinical ownership is clear.
- Strengthen weak policy-procedure trace links for compliance, QAPI, and emergency preparedness standards.

2. Crosswalk corrections
- Keep print rows authoritative.
- Add a controlled operational readiness overlay for ACHC attachment standards with explicit policy/form/workflow traceability.
- Correct section precision for HH2 (Patient Rights/Compliance), HH6 (QAPI), and HH7-3 (Emergency Preparedness).

3. Evidence corrections
- Add missing evidence artifacts required for survey retrieval (e.g., BAA register, grievance log, on-call calendar evidence form).
- Attach explicit workflow paths for compliance program, QAPI operations, and emergency preparedness execution.

4. System corrections
- Introduce `achcSurveyTags` as a policy-level survey projection index for deterministic section grouping.
- Preserve print-source truth while layering attachment operational readiness links.

5. UI corrections
- Use primary ACHC tag routing for clean section grouping.
- Surface explicit readiness indicators and unresolved gaps.
- Ensure policy detail links route correctly to policy detail pages.

## OPTIONS CONSIDERED
- Print-only strict mapping: high source fidelity, poor operational completeness.
- Full inferred mapping: high completeness, high over-tagging risk.
- Hybrid (chosen): print rows authoritative + controlled operational readiness overlay.

## FINAL DECISION
- Adopt Hybrid Model:
  - Print rows remain authoritative source truth.
  - Attachment + operational artifacts become readiness layer.
  - Survey tags provide deterministic UI grouping without mutating IBM framework taxonomy.

## CONSEQUENCES
- Benefits: stronger survey retrieval readiness, clearer HH2/HH6/HH7 operational traceability.
- Risks: curated overlays require governance to avoid drift from policy reality.
- Tradeoff: slight maintenance overhead in exchange for auditable survey-readiness paths.
