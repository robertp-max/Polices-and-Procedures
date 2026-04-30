# Module M01 Blueprint

## Module Overview
- Module ID: M1
- Module Name: Organizational Orientation (Compressed)
- Track: A (Core Compliance Foundation)
- Version: 1.0.0
- Status: Build Complete
- Estimated Duration: 24-28 minutes (max 30)
- Training Type: Awareness-level onboarding
- Target Roles: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR, IT
- Source Basis: Policy and Procedure (PP) content

## Lessons Covered (Fixed Scope)
1. Agency mission, vision, values
2. Organizational structure and reporting lines
3. Scope of services
4. Code of conduct and ethics
5. Corporate compliance program
6. Compliance hotline and reporting
7. Non-retaliation and whistleblower protection
8. Employee grievance process
9. Disciplinary process overview
10. Timekeeping, attendance, and visit verification
11. IT acceptable use, email, mobile device, and social media
12. Security awareness: passwords, phishing, device protection
13. Policy acknowledgment and training compliance expectations

## Learning Objectives
- Explain mission, structure, and scope of services.
- Identify ethics and compliance reporting pathways.
- Apply workforce expectations for timekeeping and acknowledgment.
- Demonstrate baseline IT acceptable use and security awareness.
- Satisfy onboarding gate requirements for access and assignment.

## Section Architecture
- Intro (2 min): onboarding purpose and patient safety/compliance value
- Section A (5 min, lessons 1-3): organization fundamentals
- Section B (8 min, lessons 4-9): ethics and compliance awareness
- Section C (4 min, lessons 10 and 13): workforce rules and expectations
- Section D (4 min, lessons 11-12): IT and security basics
- Summary (2 min): key takeaways and accountability
- Assessment (3 min): 6 questions, pass threshold 80%

## Assessment Rules
- Total questions: 6
- Pass threshold: 80% (5/6)
- Max attempts: 3 total (initial + 2 retries)
- Question types: MCQ and scenario MCQ
- On fail: show objective-based remediation pointers

## Enforcement Logic
If module status is not CompletedPass, then:
- Block onboarding completion
- Block system access enablement
- Block scheduling and patient assignment

Checkpoints:
- Identity provisioning
- Onboarding finalization
- Scheduler assignment action

## Evidence Model
Required fields:
- training_module_id
- module_version
- user_id
- completion_status
- score
- completion_timestamp
- policy_acknowledgment
- evidence_type=TRAINING_COMPLETION

Optional fields:
- attempt_count
- role_at_completion
- manager_id

## Handoff Package
- LMS payload: Builder/Journey/Module-M01-LMS.json
- QA log: Builder/Journey/QA/Module-M01-QA-Log.md
- Approval artifact: Builder/Journey/Approvals/Module-M01-Approval.md
