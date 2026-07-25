# Legacy 2022 Field Employee Handbook — Retirement Report

**Date:** 2026-07-25
**Prepared for:** Controlled-document retirement of the 2022 Care Indeed Home Health Field Employee Handbook, ahead of the CI-HR-HB-2026 counsel-review draft.

## 1. Decision: Retire and preserve, not repair

The 2022 handbook is being **retired**, not patched. It is kept as an immutable historical record and is explicitly barred from new distribution or acknowledgment. It is **superseded**, not deleted or edited.

Key defect classes identified in `apps/employee-journey/content/handbook/2026-review/source/2022_TO_2026_REPLACEMENT_MAP.md` that drove this decision:

- **No document control** — no version, approval, review date, or revision history; a leftover internal editing note ("vacation or sick leave (remove)") survived into employee-facing text.
- **Wage-and-hour risk** — sub-minimum/capped paid sick leave, a rigid 24-hour sick-call rule with discipline threat, a blanket doctor-note requirement, an overnight-shift example that manipulates the workday/workweek to defeat overtime, and meal/rest-period guidance left to field-employee "judgment" rather than wage-order rules.
- **Missing or outdated leave and benefits provisions** — no expense reimbursement policy; outdated PFL benefit percentages and an unlawful mandatory-PTO-before-PFL requirement; incorrect "Paid Disability Leave (PDL)" terminology; incomplete CFRA/PDL/bereavement/reproductive-loss/expanded violence-related leave coverage; benefit/holiday commitments that may not match current plans.
- **Safety and compliance gaps** — medical marijuana treated as unprotected; no modern workplace-violence-prevention program; the required 2026 Workplace Know Your Rights notice absent; the federal 12-hour in-service rule misapplied to all employees instead of HHAs only; missing HHA 14-day/60-day supervision and direct-observation requirements; a bloodborne-pathogen policy limited mainly to vaccine language.
- **Privacy, conduct, and offboarding gaps** — vague abuse-reporting instructions; an incident definition limited mainly to injury-producing accidents; confidentiality and monitoring language insufficient for mobile home health and modern privacy norms; final-pay/property language that risks unlawful withholding.

Each item above maps one-to-one to a named corrective section in the 2026 draft per the replacement map; no new defects were invented for this report — all are drawn from that source document.

## 2. Why replacement, not patch-in-place

- **Document-integrity argument:** The 2022 PDF has no controlled-document metadata (version/approval/revision history) and no source manifest, so any in-place edit would be unauditable and could not be distinguished from the original by a future reader. Patching a document that cannot prove its own provenance compounds the underlying defect rather than fixing it.
- Many defects are structural (workday/workweek design, leave-program architecture, HHA-specific training requirements) and cannot be corrected with edits to the existing document without effectively rewriting it — which is what the 2026 counsel-review draft (`CI-HR-HB-2026`) already does, with full policy/form crosswalk references and a mandatory release checklist.
- Retiring the original preserves it as an unaltered evidentiary record of what employees were actually told historically, which matters for legal-hold and prior-acknowledgment purposes; editing it in place would destroy that evidentiary value.

## 3. Archive location and verified integrity

- **Archive path:** `apps/employee-journey/content/handbook/legacy-2022/Care_Indeed_Home_Health_Field_Employee_Handbook_2022.pdf` (already archived prior to this task; not moved, copied, or edited by this task).
- **SHA-256 (recomputed from the file on disk during this task):** `fc84d206ab66c71cd7f6487676fbbea0f0aa25eb7fa694ac7d453ccd7e879a8c`
- This matches the `source_legacy_handbook.sha256` value recorded in `apps/employee-journey/content/handbook/2026-review/manifest/HANDBOOK_SOURCE_MANIFEST.json`, confirming the archived file is the same file the 2026 package's replacement map was built against.

## 4. Retirement metadata summary

Recorded in `apps/employee-journey/content/handbook/legacy-2022/RETIREMENT_METADATA.json`:

| Field | Value |
|---|---|
| documentTitle | Care Indeed Home Health Field Employee Handbook |
| legacyVersion | 2022 |
| status | RETIRED |
| retirementApproval | Owner directive 2026-07-25 — retirement-first implementation plan; final governance sign-off pending |
| retirementDate | 2026-07-25 |
| supersededBy | CI-HR-HB-2026 (pending approval) |
| retentionClass | historical employment record / legal-hold eligible |
| legalHoldStatus | preserved — do not destroy |
| historicalSourceHash | sha256:fc84d206ab66c71cd7f6487676fbbea0f0aa25eb7fa694ac7d453ccd7e879a8c |
| distributionStatus | DO_NOT_DISTRIBUTE |
| acknowledgmentStatus | NO_NEW_ACKNOWLEDGMENT_PERMITTED — prior acknowledgments preserved as evidence |

The `retirementReason` field in that file summarizes the defect classes above; it does not introduce any defect not already present in the replacement map.

## 5. Surfaces requiring a distribution/acknowledgment block — and current truthful state

The legacy handbook must be blocked from appearing in, or being assignable through, any of the following surfaces once they exist or are wired up:

- New-hire onboarding/assignment flows
- Policy search / policy library results
- "Today" / dashboard action items
- Annual assignment or renewal lists
- Certificate or completion gates
- Download menus
- The general document library

**Truthful current state (verified by read-only grep of `apps/employee-journey/app/journey` for "handbook", case-insensitive):** there is **no existing handbook distribution surface** in the journey application today. The only match found was a single incidental occurrence of the word "handbook" inside auto-generated policy-content data (`apps/employee-journey/app/journey/_generated/policyCatalog.generated.ts`), which is not a route, component, assignment list, or download menu — it is not a distribution mechanism.

This means:

- This retirement action is **not** removing any live handbook link, assignment, or download — none exist yet.
- What this task establishes is the **controlled baseline**: an immutable, correctly labeled retirement record (`RETIREMENT_METADATA.json`) and this report, functioning as a restricted tombstone that the main developer must consult and wire enforcement against (e.g., an explicit exclusion/guard) when any of the surfaces listed above are built or when the CI-HR-HB-2026 draft is eventually integrated.
- If prior employee acknowledgment records for the 2022 handbook exist elsewhere (e.g., in an HR system, signed forms, or a different repo/table not examined here), they must be preserved as-is and **must not** be carried forward as acknowledgment of the 2026 draft. This report does not assert whether such records exist outside this repository — that was out of scope for this read-only check.

## 6. Explicit confirmations

- The archived 2022 PDF (`Care_Indeed_Home_Health_Field_Employee_Handbook_2022.pdf`) was **not edited, moved, copied, or renamed**. Its filename was **not reused** for the 2026 document.
- **Nothing was deleted.** Only two new files were created:
  1. `apps/employee-journey/content/handbook/legacy-2022/RETIREMENT_METADATA.json`
  2. `REVIEW_OUTPUTS/handbook-implementation/LEGACY_2022_RETIREMENT_REPORT.md` (this file)
- No application code, routes, or components were added or modified.
- No git commands were run as part of this task.
