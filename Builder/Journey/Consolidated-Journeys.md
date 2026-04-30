# Consolidated Journeys and Categorized Training Map

## Current Build Directive (April 29, 2026)
- Active development scope: Module 1 only.
- Modules 2-40: not in development until lesson grouping is finalized.
- This file remains a planning map for tracks and role assignments, but only Module 1 is execution-ready.

## Development Readiness Status
| Module Range | Status | Reason |
|---|---|---|
| 1 | Ready for development and implementation | Lesson grouping complete for Module 1 |
| 2-40 | Pending | Lessons are not yet grouped at module level |

## Module 1 Working Definition (Execution Baseline)
- Module ID: 1
- Module Name: Organizational Orientation (Compressed)
- Duration target: 20-30 minutes
- Audience: RN, LVN, CNA, HHA, Admin, DON, Compliance, HR, IT
- Lesson scope (fixed):
	- 1 Agency mission, vision, values
	- 2 Organizational structure and reporting lines
	- 3 Scope of services
	- 4 Code of conduct and ethics
	- 5 Corporate compliance program
	- 6 Compliance hotline and reporting
	- 7 Non-retaliation and whistleblower protection
	- 8 Employee grievance process
	- 9 Disciplinary process overview
	- 10 Timekeeping, attendance, and visit verification
	- 11 IT acceptable use, email, mobile device, and social media
	- 12 Security awareness: passwords, phishing, device protection
	- 13 Policy acknowledgment and training compliance expectations

Module 1 implementation artifacts are maintained in Builder/Journey/Module Name_Organizational-Orientation.md and JourneyV1 architecture documents.

## Purpose
This document consolidates journey training into a regulator-defensible structure with reduced overlap and clear category ownership. The target is 40 core modules grouped into 6 learning tracks.

## Normalized Role Groups
- ALL: every workforce member
- CLINICAL: RN, LVN, PT, PTA, OT, COTA, SLP, HHA, MSW
- ADMIN: intake, scheduler, coordinator, office operations
- SUPERVISOR: DON, Clinical Manager, preceptor leads
- COMPLIANCE: compliance officer, QA, audit owners
- HR: HR and workforce administration
- IT: systems and security administration
- LEADERSHIP: administrator and governing body

## Consolidated Learning Tracks (40 Modules)

### A. Core Compliance Foundation (10)
| # | Module | Assigned Roles |
|---|---|---|
| 1 | Compliance Program and Code of Conduct | ALL |
| 2 | Fraud, Waste and Abuse (FWA) | ALL |
| 3 | Non-Retaliation and Ethics Reporting | ALL |
| 4 | HIPAA Privacy and Patient Rights | ALL |
| 5 | HIPAA Security and Data Protection | ALL |
| 6 | Sensitive Data (CMIA, HIV, SUD, Minors) | ALL |
| 7 | Data Governance and Minimum Necessary | ALL |
| 8 | Incident Reporting and Breach Response | ALL |
| 9 | Business Associates and Vendor Compliance | SUPERVISOR, COMPLIANCE, ADMIN |
| 10 | AI and Technology Use Governance | ALL |

### B. Clinical Documentation and Patient Care (8)
| # | Module | Assigned Roles |
|---|---|---|
| 11 | CMS CoP Overview (42 CFR Part 484) | ALL |
| 12 | Patient Rights (Clinical Application) | CLINICAL, SUPERVISOR |
| 13 | OASIS Documentation and Accuracy | CLINICAL |
| 14 | Plan of Care and Physician Orders (CMS-485) | CLINICAL, SUPERVISOR |
| 15 | Clinical Documentation Standards and Legal Risk | CLINICAL |
| 16 | Skilled Services and Medical Necessity | CLINICAL, SUPERVISOR |
| 17 | Care Coordination and Communication | CLINICAL, ADMIN |
| 18 | Infection Control (Clinical Practice) | CLINICAL |

### C. QAPI and Performance Improvement (5)
| # | Module | Assigned Roles |
|---|---|---|
| 19 | QAPI Program Fundamentals | ALL |
| 20 | Incident Review and Root Cause Analysis | SUPERVISOR, COMPLIANCE |
| 21 | Performance Improvement Plans (PIP) | SUPERVISOR, COMPLIANCE |
| 22 | Audit Readiness and Survey Preparation | SUPERVISOR, COMPLIANCE, LEADERSHIP |
| 23 | Data Tracking, Metrics and Reporting | COMPLIANCE, SUPERVISOR |

### D. Safety and OSHA (8)
| # | Module | Assigned Roles |
|---|---|---|
| 24 | Workplace Safety Program (IIPP Overview) | ALL |
| 25 | Workplace Violence Prevention (SB 553) | ALL |
| 26 | Bloodborne Pathogens | ALL |
| 27 | Aerosol Transmissible Diseases (ATD) | CLINICAL |
| 28 | PPE and Standard Precautions | ALL |
| 29 | Hazard Communication (HazCom and SDS) | ALL |
| 30 | Ergonomics and Safe Patient Handling | CLINICAL |
| 31 | Heat Illness and Field Safety | ALL |

### E. Employee Health and Workforce Requirements (4)
| # | Module | Assigned Roles |
|---|---|---|
| 32 | TB Screening and Occupational Health | CLINICAL |
| 33 | Exposure Response and Post-Exposure Protocol | ALL |
| 34 | Vaccination and Clearance Requirements | CLINICAL |
| 35 | Fitness for Duty and Return-to-Work | ALL |

### F. Operations and Workflow Execution (5)
| # | Module | Assigned Roles |
|---|---|---|
| 36 | Workflow System and Task Execution | ALL |
| 37 | Evidence Collection and Documentation Standards | ALL |
| 38 | Audit Trail, Logging and Compliance Proof | SUPERVISOR, COMPLIANCE |
| 39 | Policy Acknowledgment and LMS Requirements | ALL |
| 40 | Event-Based Compliance (QAPI, Audit, Scheduling) | SUPERVISOR, COMPLIANCE |

## Consolidation Rules Used
- Merge overlapping HIPAA/privacy/security content into modules 4-8.
- Merge OSHA/IIPP spread into modules 24-31.
- Merge fragmented documentation standards into modules 13-16 and 37.
- Keep clinical competency flow intact by separating foundational compliance from role-critical practice modules.
- Preserve audit traceability through module-level mapping to policy, workflow, event, and evidence.

## Enforcement Gate Rules
- Access gate: block core system access until modules 1-8 are complete.
- Clinical charting gate: block documentation workflows until modules 13-15 are complete.
- OASIS gate: block OASIS submission until module 13 is complete.
- Field assignment gate: block field assignments until modules 24-28 are complete.
- Patient handling gate: block handling tasks until module 30 is complete.
- Evidence upload gate: block evidence submission until module 37 is complete.
- Audit closure gate: block audit/event closure until modules 38 and 40 are complete.

## Data Model Mapping (Required Per Module)
Every module completion should write evidence with:
- training_module_id
- user_id
- completion_timestamp
- score
- policy_id
- workflow_id
- event_id
- evidence_type = TRAINING_COMPLETION

## Implementation Notes
- Use these six tracks as assignment containers in LMS.
- Keep renewal cadences separate from onboarding completion logic.
- Use incident-triggered retraining for modules 4, 5, 8, and 24-31 based on event type.
- Keep this file as the source for consolidation categories and role assignment defaults.
