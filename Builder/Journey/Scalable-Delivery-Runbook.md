# Scalable Delivery Runbook (Modules 2-40)

## Purpose

This runbook defines the exact process to scale from the Module 1 reference implementation to the next 39 modules with consistent quality, speed, and audit defensibility.

Current constraint:
- Modules 2-40 remain in Pending state until lesson grouping is finalized.

## Scale Strategy

- Reuse one module template for all modules.
- Reuse one QA checklist and one release gate pattern.
- Reuse one evidence schema and one enforcement rule structure.
- Build in waves after lesson grouping is approved.

## Operating Sequence (Per Module)

1. Intake and grouping lock
- Confirm module ID, track, and grouped lessons.
- Record policy references and owner.
- Mark status as Grouped in tracker.

2. Blueprint drafting
- Clone module blueprint template.
- Fill overview, objectives, section architecture, assessment, enforcement, evidence.
- Mark status as Drafted.

3. Content QA
- Validate no lesson duplication and no out-of-scope expansion.
- Validate role relevance and plain-language requirements.
- Mark status as ContentQA.

4. Technical build
- Configure LMS screens and navigation.
- Configure quiz, pass threshold, retries, completion logic.
- Configure gate checks and event emissions.
- Mark status as Built.

5. Validation
- Run functional, enforcement, and evidence tests.
- Capture defects and retest.
- Mark status as Validated.

6. Compliance sign-off
- Compliance and owner approval.
- Mark status as Approved.

7. Publish
- Release to assigned audiences.
- Mark status as Published.

## Standard Status Values

Use only these lifecycle values in tracker:
- PendingGrouping
- Grouped
- Drafted
- ContentQA
- Built
- Validated
- Approved
- Published
- Blocked

## SLA Targets (Per Module)

- Grouping and intake: 1-2 business days
- Draft and QA: 2-3 business days
- LMS build and validation: 2-3 business days
- Approval and publish: 1 business day

Target cycle time per module: 6-9 business days after grouping lock.

## Parallelization Rules

- Grouping can run in parallel by track.
- Content drafting can run in parallel up to 3 modules at a time.
- LMS build can run in parallel up to 2 modules at a time.
- Validation can run in parallel only if environments and test data are isolated.

## Naming and File Conventions

- Blueprint file: Builder/Journey/Module-MXX-Blueprint.md
- JSON file: Builder/Journey/Module-MXX-LMS.json
- QA evidence: Builder/Journey/QA/Module-MXX-QA-Log.md
- Approval record: Builder/Journey/Approvals/Module-MXX-Approval.md

Where MXX is zero-padded module number, for example M02, M03.

## Reusable Build Inputs

- Use Module 1 JSON blueprint structure as base schema.
- Use template placeholders from module template.
- Use consolidated tracks for role defaults.

## Release Gates (Must Pass)

1. Content gate
- Lesson map complete and non-duplicative
- Policy references confirmed

2. Build gate
- Navigation, scoring, and completion state verified
- Enforcement checks configured

3. Evidence gate
- Required evidence fields persisted
- Reporting extract verified

4. Approval gate
- Compliance approval recorded
- Owner approval recorded

## Minimal Test Pack (Per Module)

- Test 1: all sections complete path
- Test 2: fail then retry pass path
- Test 3: incomplete module gate block
- Test 4: pass state gate allow
- Test 5: evidence payload completeness

## Metrics for Scale Health

- Modules published per wave
- Mean cycle time by module
- Defect density per module
- First-pass validation rate
- Evidence write success rate

## Blocker Handling

If module is Blocked:
- Record blocker reason and owner.
- Record unblock action and ETA.
- Replan wave capacity within 24 hours.

## Immediate Use Guidance

- Keep Module 1 as immutable reference baseline.
- Do not start Modules 2-40 build until grouping status is Grouped.
- Once grouped, execute this runbook sequence without changing core schema.
