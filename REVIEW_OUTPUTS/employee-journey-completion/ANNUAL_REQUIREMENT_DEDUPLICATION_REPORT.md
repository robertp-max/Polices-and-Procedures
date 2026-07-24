# Annual Requirement Deduplication Report

_Master Correction Prompt §5. Source of truth: `apps/employee-journey/app/journey/_data/annualRequirements.ts` (hand-written projection over the generated registries). Status: **IMPLEMENTED**._

## Rule

One requirement per learning objective. When an ACHC clinical module and an `ANN-*`
module cover the **same** approved objective, the employee receives **one** assignment — the
ACHC module (which has a canonical main-app player) — and the superseded `ANN` id is recorded
as an **"Also satisfies"** provenance chip, not a second card. A requirement is kept separate
only when it carries a distinct obligation (different legal duration, different audience, a
live/drill activity, a skills checkoff, a role-specific assessment, an HHA hour requirement,
or a biennial rather than annual cadence).

## Deduplicated objectives (ANN → canonical ACHC)

| Objective | Canonical (player-backed) | Superseded ANN | Basis |
|---|---|---|---|
| HIPAA Privacy & Security | ACHC-ART-M04 | ANN-003 | Same HIPAA objective; both policy bases retained on the ACHC card. |
| Infection Prevention & Control | ACHC-ART-M05 | ANN-006 | Infection Control; return-demo checkoff stays on the competency track. |
| Bloodborne Pathogens / TB | ACHC-ART-M11 | ANN-007 | TB & BBP; at-least-annual cadence preserved on one card. |
| Patient Rights & Responsibilities | ACHC-ART-M08 | ANN-004 | Patient Rights read-and-acknowledge. |
| Workplace & Patient Safety (OSHA) | ACHC-ART-M07 | ANN-009 | Workplace safety / OSHA. |
| Corporate Compliance / Code of Conduct / FWA | ACHC-ART-M09 | ANN-001, ANN-002 | Single compliance objective covering Code of Conduct + Fraud/Waste/Abuse. |

7 `ANN` modules collapse into 6 canonical ACHC assignments. Verified live: each listed ACHC
card renders an "Also satisfies" chip for its absorbed ANN id(s).

## Distinct requirements KEPT separate (not deduped)

| ANN id | Reason kept separate |
|---|---|
| ANN-005 | Abuse / neglect mandated reporting — distinct legal duty, not Patient Rights awareness. |
| ANN-010 | California anti-harassment — statutory 2-hour supervisory / **biennial** cadence. |
| ANN-011 | Pain assessment — role-specific clinical case study. |
| ANN-012 | Fall-risk prevention — role-specific clinical case study. |
| ANN-013 | Medication safety — role-specific graded module. |
| ANN-014 | OASIS updates — role-specific coding exercise (assessing disciplines). |
| ANN-015 | IT security awareness — phishing simulation, distinct delivery. |
| ANN-017 | Documentation standards — role-specific read & acknowledge. |
| ANN-018 | Advance directives — distinct clinical read & acknowledge. |

Emergency-preparedness training (ACHC-ART-M02) and the emergency **drills** (`DRILL`-group
modules) are kept separate by design: training vs. live plan-testing are different obligation
types (§5.2). HHA in-service hours are tracked as a separate 12h/12-month clock (§13.1).

## IA outcome (§17)

The rebuilt page is **"Annual & Recurring Requirements"**. The former "Agency Annual Plan"
and "Annual Competency" tabs are removed. Competency stays in the Competencies workspace
(linked, not a tab). One summary strip replaces the four rolled-up count cards; the
"(+N unspecified)" duration text is gone (per-item "Not specified" only where the source omits
duration). Sections: ACHC Bundle · Advanced · Role-Specific · HHA In-Service (HHA only) ·
Drills · Policy Updates · Credentials (→ Documents) · Performance (→ Performance).
