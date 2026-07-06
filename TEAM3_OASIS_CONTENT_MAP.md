# TEAM 3 — OASIS-E2 SOC CONTENT_MAP.md

**Proposed**: GAO-03 OASIS-E2 Start of Care Assessment  
**uiVariant**: oasis_lab  
**assessmentType**: case_lab

**Content**:
- SOC timepoint items: B0200 (hearing), B1000 (vision), B1300, C (BIMS), D (PHQ), GG (mobility/self-care), I (diagnoses), J (pain), K (nutrition), M (wound M0300+), N (meds), O (special).
- Narration per item + rationale audio.
- Clinical evidence anchors (chart artifacts: hospital notes, SOC observation, caregiver interview etc).
- Error-risk, guidance.
- Simulator: select response + rationale + evidence link (from Demo narrations + R2).

**Sources**:
- `src/content/narration/OASIS_R2/*.wav` + OASIS_Rationale/
- `src/data/itemRationales.json`
- Simulator components: ItemCard, EvidencePanel, workflow stepper.
- Design: CaseContent/HH-.../*.md (SOC simulation specs)

**Pass**: case coding accuracy + rationale quality.
**Remediation**: evidence review + re-code.

**Narration**: preserve per manifest.
