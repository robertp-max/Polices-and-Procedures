/**
 * V3_CES_SeedData.ts — First Draft (Hardened V2)
 *
 * Location recommendation (when approved):
 *   src/policy/ces/data/V3_CES_SeedData.ts
 *   or
 *   src/policy/data/v3Seeds/ces.ts
 *
 * Purpose:
 *   High-fidelity, production-shaped seed data for V3 Veil Glass implementation.
 *   Supports both:
 *     - UI-Staging V3 harness (for IMPLEMENTATION_PLAN fixes)
 *     - Real production Veil drawers / right panels / surveyor views
 *
 * Generated from: 16-Agent V2 Hardened Seeding Plan (2026-05-20)
 */

import type { SprintWindow } from '@/policy/pm/sprintWindows';

/* ========================================================================== */
/* 1. SPRINT CONTEXT + SELECTION (Agent 07 — Critical)                        */
/* ========================================================================== */

export interface V3SprintContext {
  availableSprints: SprintWindow[];
  activeSprint: SprintWindow;
  previousSprint: SprintWindow;
  nextSprint: SprintWindow;
}

export const V3_SprintContextSeed: V3SprintContext = {
  availableSprints: [
    {
      id: '2026-09',
      number: 9,
      startDate: '2026-04-26',
      endDate: '2026-05-09',
      year: 2026,
    },
    {
      id: '2026-10',
      number: 10,
      startDate: '2026-05-10',
      endDate: '2026-05-23',
      year: 2026,
    },
    {
      id: '2026-11',
      number: 11,
      startDate: '2026-05-24',
      endDate: '2026-06-06',
      year: 2026,
    },
  ],
  activeSprint: {
    id: '2026-10',
    number: 10,
    startDate: '2026-05-10',
    endDate: '2026-05-23',
    year: 2026,
  },
  previousSprint: {
    id: '2026-09',
    number: 9,
    startDate: '2026-04-26',
    endDate: '2026-05-09',
    year: 2026,
  },
  nextSprint: {
    id: '2026-11',
    number: 11,
    startDate: '2026-05-24',
    endDate: '2026-06-06',
    year: 2026,
  },
};

/** Convenience for components that just need the current active sprint */
export const V3_ActiveSprintSeed = V3_SprintContextSeed.activeSprint;

/* ========================================================================== */
/* 2. ACHC SURVEYOR ALIGNMENT (Agent 08 — Critical)                           */
/* ========================================================================== */

export interface AchcStandardSeed {
  id: string;                    // e.g. "HH-1-A-001"
  title: string;
  domain: string;
  alignment: 'MET' | 'PARTIAL' | 'GAP' | 'NOT_STARTED';
  evidenceCount: number;
  lastReviewed: string;
  surveyorNotes?: string;
}

export interface V3AchcSurveyorAlignment {
  standards: AchcStandardSeed[];
  overallReadiness: number;      // 0-100
  lastSurveyorVisit: string;
  openGaps: number;
}

export const V3_AchcSurveyorAlignmentSeed: V3AchcSurveyorAlignment = {
  standards: [
    {
      id: 'HH-1-A-001',
      title: 'Governing Body — Composition & Oversight',
      domain: 'Governance',
      alignment: 'PARTIAL',
      evidenceCount: 3,
      lastReviewed: '2026-05-12',
      surveyorNotes: 'Minutes from Q1 meeting missing evidence of fiscal review action.',
    },
    {
      id: 'HH-2-B-015',
      title: 'QAPI Program — Data Collection & Analysis',
      domain: 'QAPI',
      alignment: 'MET',
      evidenceCount: 7,
      lastReviewed: '2026-05-18',
    },
    {
      id: 'HH-3-C-022',
      title: 'Infection Control — TB Screening & Documentation',
      domain: 'Clinical',
      alignment: 'GAP',
      evidenceCount: 1,
      lastReviewed: '2026-05-08',
      surveyorNotes: 'Missing annual TB risk assessment for 4 field staff.',
    },
    {
      id: 'HH-4-D-007',
      title: 'Emergency Preparedness — Evacuation Drills',
      domain: 'Safety',
      alignment: 'MET',
      evidenceCount: 4,
      lastReviewed: '2026-05-20',
    },
    {
      id: 'HH-5-E-031',
      title: 'Personnel Qualifications — Background Checks',
      domain: 'HR',
      alignment: 'PARTIAL',
      evidenceCount: 5,
      lastReviewed: '2026-05-15',
    },
  ],
  overallReadiness: 72,
  lastSurveyorVisit: '2026-03-12',
  openGaps: 3,
};

/* ========================================================================== */
/* 3. ROLE / VIEW MODE VARIANTS (Agent 06 + 12)                               */
/* ========================================================================== */

export type V3ViewMode = 'internal' | 'surveyor' | 'executive' | 'don';

export interface V3RoleViewContext {
  mode: V3ViewMode;
  label: string;
  description: string;
}

export const V3_RoleViewSeeds: Record<V3ViewMode, V3RoleViewContext> = {
  internal: {
    mode: 'internal',
    label: 'Internal Clinical View',
    description: 'Full operational view for DON, clinicians, and compliance staff.',
  },
  surveyor: {
    mode: 'surveyor',
    label: 'ACHC Surveyor View',
    description: 'Evidence-focused view with alignment status and crosswalk matrix.',
  },
  executive: {
    mode: 'executive',
    label: 'Executive Dashboard View',
    description: 'Aggregate KPIs, readiness scores, and multi-sprint rollups.',
  },
  don: {
    mode: 'don',
    label: 'Director of Nursing View',
    description: 'Clinical operations + task ownership focus.',
  },
};

/* ========================================================================== */
/* 4. CONVENIENCE HOOK (Recommended Pattern)                                  */
/* ========================================================================== */

export interface V3SeededContext {
  sprint: typeof V3_ActiveSprintSeed;
  achcSurveyor: typeof V3_AchcSurveyorAlignmentSeed;
  roleView: V3ViewMode;
  roleContext: V3RoleViewContext;
}

export function useV3SeededContext(
  roleView: V3ViewMode = 'internal'
): V3SeededContext {
  return {
    sprint: V3_ActiveSprintSeed,
    achcSurveyor: V3_AchcSurveyorAlignmentSeed,
    roleView,
    roleContext: V3_RoleViewSeeds[roleView],
  };
}

/* ========================================================================== */
/* 5. USAGE EXAMPLES (for UI-Staging and Veil components)                     */
/* ========================================================================== */

/*
Example in a V3 drawer or page:

const { sprint, achcSurveyor, roleContext } = useV3SeededContext('surveyor');

<SprintScopeToolbar
  availableSprints={V3_SprintContextSeed.availableSprints}
  activeSprint={sprint}
  onSprintChange={...}
/>

<AchcAlignmentMatrix data={achcSurveyor.standards} />

*/

export const V3_SEED_VERSION = '2026-05-21-v2-hardened-draft-03';

/* ========================================================================== */
/* 4. EVIDENCE FOLDER HIERARCHY (Agent 01)                                    */
/* ========================================================================== */

export interface EvidenceItem {
  id: string;
  name: string;
  type: 'signed_form' | 'supporting_doc' | 'photo' | 'auto_generated';
  status: 'verified' | 'pending' | 'missing';
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  linkedStandardIds?: string[];
}

export interface EvidenceFolder {
  id: string;
  name: string;
  type: 'year' | 'quarter' | 'month' | 'event' | 'task';
  sprintId?: string;
  completionPct: number;
  children?: EvidenceFolder[];
  items?: EvidenceItem[];
}

export const V3_EvidenceFolderTree: EvidenceFolder[] = [
  {
    id: 'Y-2026',
    name: '2026',
    type: 'year',
    completionPct: 71,
    children: [
      {
        id: 'Q2-2026',
        name: 'Q2 2026 (Apr–Jun)',
        type: 'quarter',
        completionPct: 68,
        sprintId: '2026-10',
        children: [
          {
            id: 'M-2026-05',
            name: 'May 2026',
            type: 'month',
            completionPct: 65,
            children: [
              {
                id: 'EVT-QAPI-2026-05',
                name: 'QAPI Quarterly Meeting – May 2026',
                type: 'event',
                sprintId: '2026-10',
                completionPct: 78,
                items: [
                  {
                    id: 'EV-001',
                    name: 'QAPI Meeting Minutes (signed)',
                    type: 'signed_form',
                    status: 'verified',
                    uploadedBy: 'J. Ramirez, RN',
                    uploadedAt: '2026-05-18',
                    size: '2.4 MB',
                    linkedStandardIds: ['HH-2-B-015'],
                  },
                  {
                    id: 'EV-002',
                    name: 'Quality Trend Analysis Q1-Q2',
                    type: 'supporting_doc',
                    status: 'verified',
                    uploadedBy: 'M. Torres',
                    uploadedAt: '2026-05-17',
                    size: '1.8 MB',
                  },
                ],
              },
              {
                id: 'EVT-TB-2026-05',
                name: 'TB Screening Compliance Review',
                type: 'event',
                sprintId: '2026-10',
                completionPct: 42,
                items: [
                  {
                    id: 'EV-003',
                    name: 'TB Risk Assessment – Field Staff',
                    type: 'signed_form',
                    status: 'missing',
                    uploadedBy: '—',
                    uploadedAt: '—',
                    size: '—',
                    linkedStandardIds: ['HH-3-C-022'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

/* ========================================================================== */
/* 5. TASK DETAIL SEEDS (Agent 02)                                            */
/* ========================================================================== */

export interface TaskTimelineEvent {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  notes?: string;
}

export interface V3TaskDetail {
  id: string;
  title: string;
  sprintId: string;
  assignedTo: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  completionPct: number;
  linkedEvidenceFolderId?: string;
  linkedStandardIds?: string[];
  timeline: TaskTimelineEvent[];
}

export const V3_TaskDetailSeeds: Record<string, V3TaskDetail> = {
  'TASK-QAPI-042': {
    id: 'TASK-QAPI-042',
    title: 'Complete QAPI Q2 data review and action plan',
    sprintId: '2026-10',
    assignedTo: 'J. Ramirez, RN',
    dueDate: '2026-05-22',
    status: 'In Progress',
    completionPct: 65,
    linkedEvidenceFolderId: 'EVT-QAPI-2026-05',
    linkedStandardIds: ['HH-2-B-015'],
    timeline: [
      { id: 't1', date: '2026-05-10', action: 'Task assigned', performedBy: 'System' },
      { id: 't2', date: '2026-05-14', action: 'Initial data pull completed', performedBy: 'J. Ramirez, RN' },
      { id: 't3', date: '2026-05-17', action: 'Trend analysis uploaded', performedBy: 'M. Torres' },
      { id: 't4', date: '2026-05-18', action: 'Meeting minutes signed and attached', performedBy: 'J. Ramirez, RN' },
    ],
  },
  'TASK-TB-019': {
    id: 'TASK-TB-019',
    title: 'Update annual TB screening documentation',
    sprintId: '2026-10',
    assignedTo: 'L. Chen, LVN',
    dueDate: '2026-05-25',
    status: 'Overdue',
    completionPct: 20,
    linkedStandardIds: ['HH-3-C-022'],
    timeline: [
      { id: 't1', date: '2026-05-08', action: 'Task created from gap report', performedBy: 'System' },
    ],
  },
};

/* ========================================================================== */
/* 6. WORKFLOW UNIT SEEDS (Agent 03)                                          */
/* ========================================================================== */

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  completedAt?: string;
}

export interface V3WorkflowUnit {
  id: string;
  name: string;
  sprintId: string;
  overallStatus: 'Not Started' | 'In Progress' | 'Completed';
  steps: WorkflowStep[];
  linkedEvidenceFolderId?: string;
}

export const V3_WorkflowUnitSeeds: V3WorkflowUnit[] = [
  {
    id: 'WF-QAPI-2026-05',
    name: 'QAPI Q2 Data Collection & Review Workflow',
    sprintId: '2026-10',
    overallStatus: 'In Progress',
    steps: [
      { id: 's1', label: 'Pull Q1-Q2 quality data', status: 'completed', assignedTo: 'M. Torres', completedAt: '2026-05-14' },
      { id: 's2', label: 'Complete trend analysis', status: 'completed', assignedTo: 'M. Torres', completedAt: '2026-05-17' },
      { id: 's3', label: 'Conduct QAPI meeting', status: 'completed', assignedTo: 'J. Ramirez, RN', completedAt: '2026-05-18' },
      { id: 's4', label: 'Document action items & attach evidence', status: 'in_progress', assignedTo: 'J. Ramirez, RN' },
      { id: 's5', label: 'Upload final signed minutes', status: 'pending' },
    ],
    linkedEvidenceFolderId: 'EVT-QAPI-2026-05',
  },
  {
    id: 'WF-TB-SCREEN-2026',
    name: 'Annual TB Screening Compliance Workflow',
    sprintId: '2026-10',
    overallStatus: 'In Progress',
    steps: [
      { id: 's1', label: 'Identify staff due for screening', status: 'completed', assignedTo: 'L. Chen, LVN' },
      { id: 's2', label: 'Schedule appointments', status: 'in_progress', assignedTo: 'L. Chen, LVN' },
      { id: 's3', label: 'Collect and upload results', status: 'pending' },
      { id: 's4', label: 'Update risk assessment', status: 'pending' },
    ],
  },
];

/* ========================================================================== */
/* 7. SIGNATURE ROSTER SEEDS (Agent 04)                                       */
/* ========================================================================== */

export interface SignatureEntry {
  signerName: string;
  role: string;
  status: 'pending' | 'signed';
  signedAt?: string;
  credentialStatus: 'Verified' | 'Pending' | 'Expired';
}

export interface V3SignatureRoster {
  workflowId: string;
  taskId?: string;
  requiredSigners: number;
  entries: SignatureEntry[];
}

export const V3_SignatureRosterSeeds: V3SignatureRoster[] = [
  {
    workflowId: 'WF-QAPI-2026-05',
    taskId: 'TASK-QAPI-042',
    requiredSigners: 3,
    entries: [
      { signerName: 'J. Ramirez, RN', role: 'DON', status: 'signed', signedAt: '2026-05-18', credentialStatus: 'Verified' },
      { signerName: 'M. Sterling', role: 'Compliance Officer', status: 'signed', signedAt: '2026-05-19', credentialStatus: 'Verified' },
      { signerName: 'A. Patel, MD', role: 'Medical Director', status: 'pending', credentialStatus: 'Verified' },
    ],
  },
  {
    workflowId: 'WF-TB-SCREEN-2026',
    requiredSigners: 2,
    entries: [
      { signerName: 'L. Chen, LVN', role: 'Infection Control', status: 'signed', signedAt: '2026-05-15', credentialStatus: 'Verified' },
      { signerName: 'J. Ramirez, RN', role: 'DON', status: 'pending', credentialStatus: 'Verified' },
    ],
  },
];

/* ========================================================================== */
/* 8. EXECUTIVE KPI / AGGREGATE SEEDS (Agent 09)                              */
/* ========================================================================== */

export interface ExecutiveKpi {
  label: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'flat';
  target?: number;
  sprintId: string;
}

export const V3_ExecutiveKpiSeeds: ExecutiveKpi[] = [
  { label: 'Overall Audit Readiness', value: 78, unit: '%', trend: 'up', target: 85, sprintId: '2026-10' },
  { label: 'Open Obligations', value: 47, trend: 'down', sprintId: '2026-10' },
  { label: 'Evidence Link Rate', value: '91', unit: '%', trend: 'up', target: 95, sprintId: '2026-10' },
  { label: 'QAPI Action Items Closed', value: 12, trend: 'up', sprintId: '2026-10' },
  { label: 'Critical Gaps (ACHC)', value: 3, trend: 'flat', sprintId: '2026-10' },
  { label: 'TB Screening Compliance', value: 68, unit: '%', trend: 'down', target: 100, sprintId: '2026-10' },
];

/* ========================================================================== */
/* TODO — Remaining Domains (from 30-Agent Plan)                              */
/* ========================================================================== */

// TODO (Agents 05, 10, 11, 14, etc.):
// - V3_ToolbarScopeSeeds
// - Full UAT scenario seeds
// - Forms / eCIgn Artifact seeds
// - Performance edge case data
// - Cross-surface consistency seeds

console.log(`V3 Seed Data Draft v${V3_SEED_VERSION} loaded — Sprint + Surveyor + Evidence + Tasks + Workflows + Signatures + Executive KPIs seeded.`);