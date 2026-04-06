/* Extracted from source repository frameworkSeed.generated.ts */
import type {
  Policy,
  PolicyVersion,
  CalendarTask,
  UrgentTask,
} from '../types';

/**
 * frameworkPolicies - Complete array of ~300 policy definitions
 * Covers all 10 domains (GV, CL, QA, HR, CO, FN, OP, IT, RM, EN)
 * Status: All policies set to Draft with v6.0 version
 */
export const frameworkPolicies: Policy[] = [
  {
    "id": "GV-GB-001",
    "domainCode": "GV",
    "subdomainCode": "GB",
    "title": "Governing Body Authority & Responsibilities",
    "tier": "REQUIRED",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Governing Body",
    "accessTier": "Tier 4 — Privileged",
    "description": "Defines the authority, composition, and oversight responsibilities of the agency's governing body in compliance with 42 CFR 484.105.",
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
    "title": "Board Meeting & Minutes Requirements",
    "tier": "ESSENTIAL",
    "lifecycleStatus": "Draft",
    "reviewCycle": "Annual",
    "ownerSteward": "Governing Body",
    "accessTier": "Tier 4 — Privileged",
    "description": "Establishes frequency, quorum, documentation, and retention requirements for governing body meetings.",
    "currentVersion": "v6.0",
    "sourceType": "placeholder",
    "contentRef": null,
    "isPublished": false,
    "publishedVersion": null,
    "createdAt": "2026-03-25T00:00:00.000Z",
    "updatedAt": "2026-03-25T00:00:00.000Z"
  }
];

/**
 * frameworkPolicyVersions - Complete array of ~300 policy version records
 * All versions are v6.0, Draft status, dated 2026-03-25
 * Corresponds 1:1 with frameworkPolicies array
 */
export const frameworkPolicyVersions: PolicyVersion[] = [
  {
    "policyId": "GV-GB-001",
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
  }
];

/**
 * seedCalendarTasks - Complete array of 2 calendar task records
 * Tasks include: Policy review scheduling and QAPI committee meetings
 * Status: Mix of On Track and Warning statuses
 */
export const seedCalendarTasks: CalendarTask[] = [
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
];

/**
 * seedUrgentTasks - Complete array of 2 urgent task records
 * Tasks include: Clinical audits and policy review escalations
 * Status: Mix of Critical and Escalation statuses
 */
export const seedUrgentTasks: UrgentTask[] = [
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
];

/**
 * Typed array exports for strict TypeScript compatibility
 */
export const typedFrameworkPolicies: Policy[] = frameworkPolicies as unknown as Policy[];
export const typedFrameworkPolicyVersions: PolicyVersion[] = frameworkPolicyVersions as unknown as PolicyVersion[];
export const typedSeedCalendarTasks: CalendarTask[] = seedCalendarTasks as unknown as CalendarTask[];
export const typedSeedUrgentTasks: UrgentTask[] = seedUrgentTasks as unknown as UrgentTask[];
