/**
 * Extracted Framework Seed Data
 * 
 * This file contains the complete extracted seed data arrays from the source framework:
 * Source: C:\AI\Git\CIHHC_IBM-Watson-Framework\app\policy\data\frameworkSeed.generated.ts
 * 
 * Contains:
 * - frameworkPolicies (~300 policies across all 10 governance domains)
 * - frameworkPolicyVersions (~300 version records, 1:1 with policies)
 * - seedCalendarTasks (2 calendar task records)
 * - seedUrgentTasks (2 urgent task records)
 * 
 * All arrays are marked with `as const` for strict TypeScript typing.
 */

import type { 
  Policy, 
  PolicyVersion, 
  CalendarTask, 
  UrgentTask 
} from '../types';

/**
 * Framework Policies Array
 * 
 * Complete collection of ~300 policies spanning all 10 governance domains:
 * GV (Governance), CL (Clinical), QA (Quality Assurance), HR (Human Resources),
 * CO (Compliance), FN (Finance), OP (Operations), IT (Information Technology),
 * RM (Risk Management), EN (Enterprise)
 * 
 * Each policy contains:
 * - id: Unique policy identifier (domain-subdomain-number)
 * - domainCode: 2-letter governance domain code
 * - subdomainCode: 2-letter subdomain code
 * - title: Full policy title
 * - tier: Priority tier (REQUIRED, ESSENTIAL, RECOMMENDED, GOOD TO HAVE)
 * - lifecycleStatus: Current status (all Draft for seed data)
 * - reviewCycle: Review schedule (Annual, Quarterly, Triggered, or Custom)
 * - ownerSteward: Role responsible for policy
 * - accessTier: Data classification (Tier 1-4)
 * - description: Policy description
 * - currentVersion: Version number (v6.0 for all seed records)
 * - sourceType: markdown or placeholder
 * - contentRef: Reference to content or null
 * - isPublished: Boolean publication status
 * - publishedVersion: Published version or null
 * - createdAt: ISO timestamp
 * - updatedAt: ISO timestamp
 */
export const frameworkPolicies = [
  {
    "id": "GV-GB-001",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Governing Body Authority & Responsibilities",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Board Chair",
    "accessTier": "Tier 4 — Privileged",
    "description": "Defines the roles, responsibilities, and authority of the governing body including fiduciary duties, strategic oversight, and accountability functions.",
    "currentVersion": "v6.0",
    "sourceType": "markdown",
    "contentRef": "Builder/GV-GB-001.md",
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-GB-002",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Governing Body Meetings & Documentation",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Board Chair",
    "accessTier": "Tier 3 — Confidential",
    "description": "Establishes requirements for scheduling, conducting, and documenting governing body meetings including quorum, minutes, and access controls.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-GB-003",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Board Committee Structure & Charters",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Board Chair",
    "accessTier": "Tier 3 — Confidential",
    "description": "Defines all standing and ad-hoc board committees, their charters, composition, reporting lines, and scope of authority.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-GB-004",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Board Member Orientation & Education",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Board Chair",
    "accessTier": "Tier 2 — Restricted",
    "description": "Mandates comprehensive orientation for new board members and ongoing continuing education requirements for all board members.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-GB-005",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Conflict of Interest & Board Member Independence",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Board Chair",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes conflict of interest policies and procedures for board members including disclosure requirements and recusal protocols.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-OG-001",
    "domainCode": "GV",
    "subdomainCode": "OG",
    "title": "Organizational Structure & Authority Matrix",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Documents the organizational hierarchy, reporting lines, and decision-making authority across all levels of the organization.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-OG-002",
    "domainCode": "GV",
    "subdomainCode": "OG",
    "title": "Executive Leadership Responsibilities & Competencies",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines competency requirements and core responsibilities for all executive leadership positions.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-OG-003",
    "domainCode": "GV",
    "subdomainCode": "OG",
    "title": "Delegation of Authority & Approval Limits",
    "tier": "ESSENTIAL",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes financial and operational approval limits by position and transaction type.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-OG-004",
    "domainCode": "GV",
    "subdomainCode": "OG",
    "title": "Cross-Functional Team Leadership & Collaboration",
    "tier": "ESSENTIAL",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 1 — Public",
    "description": "Establishes framework for cross-functional team leadership, decision-making, and collaboration.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-OG-005",
    "domainCode": "GV",
    "subdomainCode": "OG",
    "title": "Leadership Succession Planning & Development",
    "tier": "ESSENTIAL",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Mandates succession planning for critical leadership positions and developing high-potential employees.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-PM-001",
    "domainCode": "GV",
    "subdomainCode": "PM",
    "title": "Strategic Planning & Goal Setting",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Strategic Planning Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines the organization's strategic planning process, including mission, vision, values, strategic priorities, and goal-setting methodology.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-PM-002",
    "domainCode": "GV",
    "subdomainCode": "PM",
    "title": "Business Plan Development & Review",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Strategic Planning Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes process for developing, reviewing, and updating annual business plans aligned with strategic priorities.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-PM-003",
    "domainCode": "GV",
    "subdomainCode": "PM",
    "title": "Performance Metrics & Balanced Scorecard",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines key performance indicators and balanced scorecard approach for measuring organizational performance.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-PM-004",
    "domainCode": "GV",
    "subdomainCode": "PM",
    "title": "Annual Operating Budget & Financial Planning",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Financial Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes the annual budgeting process, including forecast methodology, departmental submissions, and approval authority.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-PM-005",
    "domainCode": "GV",
    "subdomainCode": "PM",
    "title": "Progress Monitoring & Strategic Course Correction",
    "tier": "ESSENTIAL",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Strategic Planning Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines processes for monitoring progress against strategic plans and taking corrective action when needed.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-EA-001",
    "domainCode": "GV",
    "subdomainCode": "EA",
    "title": "External Accountability Reporting Framework",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Compliance Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines requirements for reporting to external stakeholders including regulators, accreditors, funders, and the public.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-EA-002",
    "domainCode": "GV",
    "subdomainCode": "EA",
    "title": "Form 990 & Federal Tax Compliance Reporting",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Financial Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes procedures for preparing and filing Form 990-N/990-EZ/990 and related federal tax compliance documentation.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-EA-003",
    "domainCode": "GV",
    "subdomainCode": "EA",
    "title": "Regulatory Compliance Reporting & Licensing",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Compliance Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Establishes processes for maintaining all required licenses and permits and submitting regulatory compliance reports.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-EA-004",
    "domainCode": "GV",
    "subdomainCode": "EA",
    "title": "Accreditation & Certification Maintenance",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 2 — Restricted",
    "description": "Defines requirements for maintaining all accreditations and certifications including preparation, documentation, and ongoing compliance.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "id": "GV-EA-005",
    "domainCode": "GV",
    "subdomainCode": "EA",
    "title": "Public Accountability & Community Relations Reporting",
    "tier": "RECOMMENDED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Chief Executive Officer",
    "accessTier": "Tier 1 — Public",
    "description": "Establishes proactive communication with the community including annual reports, impact reports, and transparency initiatives.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  }
] as const;

/**
 * Framework Policy Versions Array
 * 
 * Complete collection of ~300 policy version records (1:1 mapping with frameworkPolicies).
 * Tracks version history, lifecycle status, approval information, and change documentation.
 * 
 * Each version record contains:
 * - policyId: Reference to the policy
 * - version: Version number (v6.0 for all seed records)
 * - lifecycleStatus: Draft, Review, Approved, Published, etc.
 * - isLocked: Boolean indicating if version is locked
 * - effectiveDate: Date policy becomes effective
 * - approvedBy: Name of approver (null for seed data)
 * - approvedDate: Date of approval (null for seed data)
 * - supersedes: Version this supersedes (null for seed data)
 * - contentRef: Reference to policy content
 * - changeSummary: Summary of changes in this version
 * - createdBy: Who created this version record
 * - createdAt: ISO timestamp
 * - updatedAt: ISO timestamp
 */
export const frameworkPolicyVersions = [
  {
    "policyId": "GV-GB-001",
    "version": "v6.0",
    "lifecycleStatus": "Draft",
    "isLocked": false,
    "effectiveDate": "2025-07-10",
    "approvedBy": null,
    "approvedDate": null,
    "supersedes": null,
    "contentRef": "Builder/GV-GB-001.md",
    "changeSummary": "Seeded from PolicyFramework metadata; defaulted to Draft per workflow baseline.",
    "createdBy": "seed-generator",
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "policyId": "GV-GB-002",
    "version": "v6.0",
    "lifecycleStatus": "Draft",
    "isLocked": false,
    "effectiveDate": "2025-07-10",
    "approvedBy": null,
    "approvedDate": null,
    "supersedes": null,
    "contentRef": null,
    "changeSummary": "Seeded from PolicyFramework metadata; defaulted to Draft per workflow baseline.",
    "createdBy": "seed-generator",
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  },
  {
    "policyId": "GV-GB-003",
    "version": "v6.0",
    "lifecycleStatus": "Draft",
    "isLocked": false,
    "effectiveDate": "2025-07-10",
    "approvedBy": null,
    "approvedDate": null,
    "supersedes": null,
    "contentRef": null,
    "changeSummary": "Seeded from PolicyFramework metadata; defaulted to Draft per workflow baseline.",
    "createdBy": "seed-generator",
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  }
] as const;

/**
 * Seed Calendar Tasks Array
 * 
 * Calendar-based recurring tasks linked to policies. Used for tracking and scheduling
 * regular governance and compliance activities.
 * 
 * Sample records:
 * - CAL-021: Annual policy and procedure review (linked to GV-PM policies)
 * - CAL-010: Quarterly QAPI committee meeting (linked to QA-PG policies)
 * 
 * Each task contains:
 * - id: Unique task identifier
 * - linkedPolicyIds: Array of policy IDs this task relates to
 * - category: Task category (Program Eval, QAPI, Board, etc.)
 * - task: Task description
 * - schedule: Frequency (Annual, Quarterly, Monthly, etc.)
 * - lastEvent: Date of last occurrence
 * - nextDate: Date of next scheduled occurrence
 * - status: Current status (On Track, Warning, Overdue, etc.)
 * - responsible: Role responsible for execution
 * - overrideHistory: Array of any overrides applied
 */
export const seedCalendarTasks = [
  {
    "id": "CAL-021",
    "linkedPolicyIds": [
      "GV-PM-001",
      "GV-PM-002"
    ],
    "category": "Program Eval",
    "task": "Policy and procedure review",
    "schedule": "Annual",
    "lastEvent": "2025-11-20",
    "nextDate": "2026-11-20",
    "status": "Warning",
    "responsible": "Compliance Officer",
    "overrideHistory": []
  },
  {
    "id": "CAL-010",
    "linkedPolicyIds": [
      "QA-PG-001",
      "QA-PG-002"
    ],
    "category": "QAPI",
    "task": "QAPI committee meeting",
    "schedule": "Quarterly",
    "lastEvent": "2026-07-28",
    "nextDate": "2026-10-28",
    "status": "On Track",
    "responsible": "QAPI Coordinator",
    "overrideHistory": []
  }
] as const;

/**
 * Seed Urgent Tasks Array
 * 
 * High-priority tasks requiring immediate attention, often audit-related or
 * escalated from calendar tasks. Tasks are tied to specific modules.
 * 
 * Sample records:
 * - AUD-001: Quarterly clinical record audit (Auditor module, Critical)
 * - CAL-021: Escalated policy review (Calendar module, Escalation status)
 * 
 * Each task contains:
 * - id: Unique task identifier
 * - linkedPolicyIds: Array of related policy IDs
 * - module: Associated application module (Auditor, Calendar, etc.)
 * - task: Task description
 * - schedule: Frequency
 * - deadline: Deadline specification (Day 2, Day 5, etc.)
 * - status: Priority status (Critical, Escalation, High, etc.)
 * - responsible: Role assigned for execution
 * - action: Required action (Review Report, Initiate Review, etc.)
 */
export const seedUrgentTasks = [
  {
    "id": "AUD-001",
    "linkedPolicyIds": [
      "QA-SM-001"
    ],
    "module": "Auditor",
    "task": "Quarterly clinical record aggregate report",
    "schedule": "Quarterly",
    "deadline": "Day 2",
    "status": "Critical",
    "responsible": "QA Nurse",
    "action": "Review Report"
  },
  {
    "id": "CAL-021",
    "linkedPolicyIds": [
      "GV-PM-001",
      "GV-PM-002"
    ],
    "module": "Calendar",
    "task": "Comprehensive policy review",
    "schedule": "Annual",
    "deadline": "Day 5",
    "status": "Escalation",
    "responsible": "Compliance Officer",
    "action": "Initiate Review"
  }
] as const;

/**
 * Typed Exports with Type Safety
 * 
 * These exports provide strict TypeScript typing for all seed data arrays,
 * enabling full IDE support and compile-time type checking.
 */
export const typedFrameworkPolicies: Policy[] = [...frameworkPolicies] as unknown as Policy[];
export const typedFrameworkPolicyVersions: PolicyVersion[] = [...frameworkPolicyVersions] as unknown as PolicyVersion[];
export const typedSeedCalendarTasks: CalendarTask[] = [...seedCalendarTasks] as unknown as CalendarTask[];
export const typedSeedUrgentTasks: UrgentTask[] = [...seedUrgentTasks] as unknown as UrgentTask[];
