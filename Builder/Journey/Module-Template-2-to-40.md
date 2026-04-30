# Module Blueprint Template (Use for Modules 2-40)

## 1. Module Overview

- Module ID: M{{XX}}
- Module Name: {{Module Name}}
- Track: {{A-F}}
- Version: {{v1.0}}
- Status: Draft | In Review | Approved | Published
- Estimated Duration (minutes): {{min-max}}
- Training Type: Awareness | Applied | Role-Specific
- Target Roles: {{roles}}
- Module Owner: {{owner}}
- Policy Source(s): {{policy IDs/titles}}

### Detailed Overview
{{2-4 concise paragraphs max}}

### Detailed Description
{{what learner does, why it matters, expected completion behavior}}

## 2. Learning Objectives

- {{Objective 1}}
- {{Objective 2}}
- {{Objective 3}}
- {{Objective 4}}

## 3. Section Architecture

### Intro Screen (1-2 minutes)
- Purpose statement
- Why module matters for safety/compliance/operations

### Section A - {{Name}} ({{time}} min)
- Lessons covered: {{lesson IDs/names}}
- Plain language content:
  - {{point}}
  - {{point}}
- Home health examples:
  - {{example}}
  - {{example}}
- Role awareness cues:
  - {{role cue}}

### Section B - {{Name}} ({{time}} min)
- Lessons covered: {{lesson IDs/names}}
- Plain language content:
  - {{point}}
  - {{point}}
- Home health examples:
  - {{example}}
  - {{example}}
- Role awareness cues:
  - {{role cue}}

### Section C - {{Name}} ({{time}} min)
- Lessons covered: {{lesson IDs/names}}
- Plain language content:
  - {{point}}
  - {{point}}
- Home health examples:
  - {{example}}
  - {{example}}
- Role awareness cues:
  - {{role cue}}

### Section D - {{Name}} (optional) ({{time}} min)
- Lessons covered: {{lesson IDs/names}}
- Plain language content:
  - {{point}}
  - {{point}}
- Home health examples:
  - {{example}}
  - {{example}}
- Role awareness cues:
  - {{role cue}}

### Summary Screen (1-2 minutes)
- Key takeaways
- Accountability reminder

## 4. Assessment

- Total questions: {{5-10 per module profile}}
- Pass threshold: {{80% default unless policy requires otherwise}}
- Retry policy: {{e.g., 2 retries then manager follow-up}}

### Question Bank
1. Question: {{text}}
- Options: {{A/B/C/D}}
- Correct answer: {{X}}
- Rationale: {{brief}}

2. Question: {{text}}
- Options: {{A/B/C/D}}
- Correct answer: {{X}}
- Rationale: {{brief}}

3. Question: {{text}}
- Options: {{A/B/C/D}}
- Correct answer: {{X}}
- Rationale: {{brief}}

4. Question: {{text}}
- Options: {{A/B/C/D}}
- Correct answer: {{X}}
- Rationale: {{brief}}

5. Question: {{text}}
- Options: {{A/B/C/D}}
- Correct answer: {{X}}
- Rationale: {{brief}}

## 5. Enforcement Logic

If module status != Completed-Pass, then:
- {{Gate action 1}}
- {{Gate action 2}}
- {{Gate action 3}}

Trigger points:
- {{workflow/event trigger}}
- {{workflow/event trigger}}

## 6. Evidence Model

Required fields:
- training_module_id
- module_version
- user_id
- completion_status
- score
- completion_timestamp
- policy_id
- workflow_id
- event_id
- evidence_type=TRAINING_COMPLETION

Optional fields:
- attempt_count
- role_at_completion
- manager_id

Audit value statement:
{{how this module evidence supports audit readiness and compliance verification}}

## 7. UX and Delivery Specs

- UI style: clean, concise, section-based
- Navigation: next/back + section jump
- Progress indicator: required
- Completion state: clear pass/fail and next action
- Accessibility baseline: keyboard navigation, readable contrast, plain language

## 8. Build Checklist (Do Not Publish Without Passing)

- Content complete and PP-aligned
- Role coverage validated
- Duration validated
- Assessment validated
- Enforcement tested
- Evidence write tested
- Compliance sign-off
- Final approval logged

## 9. Change Log

- Date:
- Version:
- Author:
- Change summary:
- Approval reference:

## 10. Scalability Handoff Fields (Required)

- Tracker status (must match runbook lifecycle):
- Grouping sign-off reference:
- Content QA reference:
- LMS build reference:
- Evidence test reference:
- Final approval reference:

## 11. File Package Standard (Required)

- Blueprint file: Builder/Journey/Module-MXX-Blueprint.md
- LMS JSON file: Builder/Journey/Module-MXX-LMS.json
- QA log file: Builder/Journey/QA/Module-MXX-QA-Log.md
- Approval file: Builder/Journey/Approvals/Module-MXX-Approval.md

## 12. Scale Compliance Checks (Before Publish)

- Module status in tracker is Approved.
- Grouping status is confirmed and not pending.
- Required owners are assigned in tracker.
- Evidence schema fields are complete and validated.
