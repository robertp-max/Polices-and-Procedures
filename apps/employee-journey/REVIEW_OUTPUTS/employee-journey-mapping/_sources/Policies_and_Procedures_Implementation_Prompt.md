# Implementation Prompt — Policies and Procedures LMS Pathways

Create a new Git branch named `Policies_and_Procedures` from `packet-platform` and implement only the Policies & Procedures learner/admin experience described below. Do not change unrelated packet-platform workflows.

## Source of truth

Use `Policies_and_Procedures_LMS_Assignment_Matrix.xlsx` as the authoritative implementation map:

- `Pathway Summary` defines course counts and General inheritance.
- `Course Catalog` defines course IDs, timing, pass scores, recurrence, competency add-ons, and release status.
- `Policy Assignments` defines the exact policy IDs in each course and whether each item is Core, Conditional, or Hold.
- `Role Policy Matrix` is the cross-check for role applicability.
- `Release Blockers` defines content that must not be published yet.
- `All Policy Review` records the disposition of every reviewed policy.

Do not use `corridorAlignment.generated.ts` confidence values as accreditation or legal validation. In particular, do not infer required training from an automated `HIGH` label.

## In-scope pathways

Implement exactly one General pathway and these 12 role pathways:

1. General / All Employees — 8 courses
2. LVN — 13 total courses: 8 General + 5 LVN
3. RN — 16 total: 8 General + 8 RN
4. HHA — 13 total: 8 General + 5 HHA
5. PT — 11 total: 8 General + 3 PT
6. PTA — 11 total: 8 General + 3 PTA
7. OT — 11 total: 8 General + 3 OT
8. COTA — 11 total: 8 General + 3 COTA
9. SLP — 9 total: 8 General + 1 SLP
10. MSW — 9 total: 8 General + 1 MSW
11. Administrator — 15 total: 8 General + 7 ADM
12. Director of Nursing / Clinical Manager — 16 total: 8 General + 8 DON
13. Governing Body Member — 13 standalone courses; do not inherit employee-only General content

Use inheritance in the data model; do not duplicate the eight General course definitions into each employee pathway.

## Learner requirements

For every policy row assigned to a learner:

- Require the learner to open and read the full controlled policy.
- Record policy ID, version, effective date, learner, assignment date, completion date, and attestation.
- Require completion of the course-level scored quiz. One quiz may assess several related policies in the same course.
- Default passing score: 80%.
- OASIS passing score: 85%.
- Prevent completion when any required policy read, attestation, or quiz is incomplete.
- Failed initial-orientation work must be remediated before independent duty; use the approved timing rule below.
- Preserve an audit trail for assignment, policy version, answers, score, attempts, remediation, and completion.

A quiz is not sufficient where `Additional validation` requires a return demonstration, observed skill, simulation, drill, coding exercise, interactive Q&A, case review, or supervised practice. Store that evidence as a separate completion gate.

## Assignment and timing logic

- General orientation is due by day 5.
- All initial read/quiz assignments are due by day 14.
- Role competency is due by day 30 and always before independent duty.
- Exposure-, device-, driving-, EHR-, AI-, specialty-, and patient-population modules must be assigned before the triggering work begins.
- Apply the recurrence in the Course Catalog; do not reduce a stricter documented agency standard to a regulatory minimum.
- HHA in-service records must total at least 12 hours in each 12-month period; observation-required skills cannot be passed by quiz alone.
- California workplace-violence training must support interactive questions and answers and initial plus annual tracking.
- California harassment training must distinguish nonsupervisory and supervisory duration/cadence after the policy correction described below.

## Admin experience

Provide an administrator preview for each pathway without creating learner completion records. Show:

- inherited General courses;
- role-specific courses;
- Core, Conditional, and Hold status;
- policy count per course;
- due/recurrence rule;
- pass score and non-quiz validation;
- source/release status;
- blockers and owner approval.

Admin assignment controls must support role, employment/supervisory status, OASIS authorization, patient population, service line, exposure, field-driving, device/EHR/AI use, and specialty competency triggers.

## Release gates — do not silently work around these

Do not publish held components until owners resolve them:

1. Restore/approve missing full policy bodies for HR-JD-005, HR-JD-006, HR-JD-008, HR-JD-009, and HR-JD-010.
2. Add dedicated, approved PTA and COTA job-description policies.
3. Resolve the job-description ID conflict, including MSW/SLP references, and regenerate all maps from one approved index.
4. Correct OASIS/comprehensive-assessment authority. Current 42 CFR 484.55 permits PT, SLP, and OT to complete specified therapy-only assessments; do not ship RN-only prohibitions.
5. Select one canonical OASIS source between CL-OA-001–019 and CL-OA-101, then retire/supersede duplicates.
6. Correct HR-ER-004 / related training text. California requires at least 1 hour for nonsupervisory employees and 2 hours for supervisory employees, within six months and every two years; interactive content is required. Annual training may remain only if clearly labeled as a stricter agency standard.
7. Restore GV-GB-001 to the generated policy library.
8. Select one controlled IIPP master between RM-OS-001 and RM-OS-101 and repair cross-references.
9. Reconcile the policy inventory count/version drift (253 stated versus 272 generated records).

Held content must render as unavailable with a clear owner-facing reason. It must never disappear from reporting or be treated as completed.

## Data and engineering requirements

- Use stable course IDs and policy IDs from the workbook.
- Store General inheritance explicitly.
- Store Conditional triggers as structured data, not free-text-only rules.
- Store Hold state and blocker reference separately from learner completion state.
- Snapshot the policy version presented to the learner so later revisions do not rewrite historical evidence.
- On material policy revision, create a new assignment when the owner marks re-acknowledgment/retraining required.
- Keep admin preview events separate from production learner attempts/completions.
- Preserve existing packet-platform behavior outside this feature.

## Acceptance criteria

- The pathway totals exactly equal the counts above.
- Every `Policy Assignments` row is reachable from its course.
- Every employee pathway inherits all eight General courses once, with no duplicates.
- Governing Body has 13 standalone courses and no automatic employee-only inheritance.
- Core items assign automatically; Conditional items assign only when their trigger is true; Hold items cannot be published.
- A learner cannot complete a course without all required reads, attestations, quiz pass, and required competency evidence.
- OASIS courses use an 85% threshold; other scored courses use 80% unless the workbook says otherwise.
- HHA 12-hour in-service and observed-competency requirements are reportable.
- Harassment duration/cadence varies correctly by supervisor status after the source policy is fixed.
- Previewing a role creates no completion record.
- Audit exports show learner, role, inherited/source course, policy/version, trigger, assignment/due dates, score/attempts, validation evidence, attestation, and completion.
- Automated tests cover inheritance, conditional triggers, hold gating, version snapshots, failed-quiz remediation, competency gates, and exact pathway totals.

Before merging, provide a concise implementation report that lists changed files, automated tests, migration/seed behavior, unresolved held content, and screenshots for learner and admin preview states.
