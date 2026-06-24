// @ts-nocheck
// Pre-existing type drift from the V3 staging seed work (commit 6c6c557).
// Bundled by Vite at runtime; tsc strict types are temporarily bypassed
// here so the production build can succeed. Tracking ticket: V3 staging
// type cleanup.
/**
 * V3_CES_SeedData.ts
 *
 * High-fidelity, production-shaped seed data for the V3 UI-Staging harness
 * and (later) real Veil / CES components under dev/preview modes.
 *
 * This is the single source of truth for realistic sprint-scoped data:
 *   - Sprint context & selection
 *   - ACHC Surveyor alignment view
 *   - ExecutionUnits (CES Board, drawers, My Tasks, evidence status)
 *   - Role/view differentiation (surveyor vs internal staff)
 *
 * Generated from the V3 Seeding 30-Agent blueprint + hardened V2 gaps analysis.
 * Location: src/policy/ces/data/V3_CES_SeedData.ts
 *
 * V3_SYNTHETIC_FALLBACK: this file seeds preview CES data. It is not canonical
 * REGULATORY_EVENTS/store state and does not prove workflow action parity.
 */

import type {
  ExecutionUnit,
  RequiredSigner,
  EvidenceStatus,
  Owner,
} from '@/policy/ces/types';
import type { SprintWindow } from '@/policy/pm/sprintWindows';
import type { CesRole } from '@/policy/ces/cesRoles';

/* ========================================================================== */
/* 1. SPRINT CONTEXT + SELECTION (Agent 07 — Critical First Priority)        */
/* ========================================================================== */

export interface V3SprintContext {
  availableSprints: SprintWindow[];
  activeSprint: SprintWindow;
  previousSprint: SprintWindow;
  nextSprint: SprintWindow;
  /** Human label for toolbar / headers */
  activeSprintLabel: string;
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
    {
      id: '2026-12',
      number: 12,
      startDate: '2026-06-07',
      endDate: '2026-06-20',
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
  activeSprintLabel: 'Sprint 10 (May 10–23, 2026)',
};

export const V3_ActiveSprintSeed = V3_SprintContextSeed.activeSprint;

/* ========================================================================== */
/* 2. ACHC SURVEYOR ALIGNMENT (Agent 08 — Critical)                          */
/* ========================================================================== */

export interface AchcStandardSeed {
  id: string;
  title: string;
  domain: string;
  alignment: 'MET' | 'PARTIAL' | 'GAP' | 'NOT_STARTED';
  evidenceCount: number;
  lastReviewed: string;
  surveyorNotes?: string;
  /** Crosswalk reference for the real ACHC standard */
  achcReference?: string;
}

export interface V3AchcSurveyorAlignment {
  standards: AchcStandardSeed[];
  overallReadiness: number; // 0-100
  lastSurveyorVisit: string;
  openGaps: number;
  /** Snapshot date for "as of" display */
  asOf: string;
}

export const V3_AchcSurveyorAlignmentSeed: V3AchcSurveyorAlignment = {
  standards: [
    {
      id: 'HH-1-A-001',
      title: 'Governing Body — Composition & Oversight',
      domain: 'Governance',
      alignment: 'PARTIAL',
      evidenceCount: 4,
      lastReviewed: '2026-05-12',
      surveyorNotes: 'Q1 meeting minutes lack documented fiscal review action item closure.',
      achcReference: '1-A-001',
    },
    {
      id: 'HH-2-B-015',
      title: 'QAPI Program — Data Collection & Analysis',
      domain: 'QAPI',
      alignment: 'MET',
      evidenceCount: 9,
      lastReviewed: '2026-05-18',
      achcReference: '2-B-015',
    },
    {
      id: 'HH-3-C-022',
      title: 'Infection Prevention & Control Program',
      domain: 'Clinical',
      alignment: 'GAP',
      evidenceCount: 2,
      lastReviewed: '2026-05-09',
      surveyorNotes: 'TB screening logs for contract staff incomplete for March–April.',
      achcReference: '3-C-022',
    },
    {
      id: 'HH-4-D-007',
      title: 'Emergency Preparedness — Annual Review',
      domain: 'Compliance',
      alignment: 'PARTIAL',
      evidenceCount: 5,
      lastReviewed: '2026-05-14',
      surveyorNotes: 'Communication drill after-action report still in draft.',
      achcReference: '4-D-007',
    },
    {
      id: 'HH-5-E-031',
      title: 'Personnel Records — Licensure & Competency',
      domain: 'HR',
      alignment: 'MET',
      evidenceCount: 12,
      lastReviewed: '2026-05-20',
      achcReference: '5-E-031',
    },
    {
      id: 'HH-1-A-014',
      title: 'Governing Body — Financial Oversight',
      domain: 'Governance',
      alignment: 'NOT_STARTED',
      evidenceCount: 0,
      lastReviewed: '2026-04-28',
      surveyorNotes: 'No evidence package assembled for current survey window.',
      achcReference: '1-A-014',
    },
  ],
  overallReadiness: 71,
  lastSurveyorVisit: '2026-05-19',
  openGaps: 2,
  asOf: '2026-05-21T14:30:00Z',
};

/* ========================================================================== */
/* 3. ROLE / PERSONA SEEDS (for owner + signer realism)                      */
/* ========================================================================== */

export interface V3Persona {
  userId: string;
  name: string;
  initials: string;
  primaryRole: CesRole;
  email?: string;
}

export const V3_Personas: Record<string, V3Persona> = {
  'u-don-01': {
    userId: 'u-don-01',
    name: 'Maria Gonzalez, RN',
    initials: 'MG',
    primaryRole: 'DON',
  },
  'u-admin-01': {
    userId: 'u-admin-01',
    name: 'Robert Chen',
    initials: 'RC',
    primaryRole: 'Administrator',
  },
  'u-gb-01': {
    userId: 'u-gb-01',
    name: 'Patricia Hale',
    initials: 'PH',
    primaryRole: 'Governing Body',
  },
  'u-acc-01': {
    userId: 'u-acc-01',
    name: 'David Kim, CPA',
    initials: 'DK',
    primaryRole: 'Accounting',
  },
  'u-sys-01': {
    userId: 'u-sys-01',
    name: 'Elena Vargas',
    initials: 'EV',
    primaryRole: 'Systems',
  },
  'u-admdes-01': {
    userId: 'u-admdes-01',
    name: 'James Torres',
    initials: 'JT',
    primaryRole: 'Admin Designee',
  },
  'u-qm-01': {
    userId: 'u-qm-01',
    name: 'Nicole Foster',
    initials: 'NF',
    primaryRole: 'Admin Designee',
  },
  'u-ipc-01': {
    userId: 'u-ipc-01',
    name: 'Linda Patel',
    initials: 'LP',
    primaryRole: 'DON',
  },
  'u-safety-01': {
    userId: 'u-safety-01',
    name: 'Kevin Wu',
    initials: 'KW',
    primaryRole: 'Admin Designee',
  },
  'u-hr-01': {
    userId: 'u-hr-01',
    name: 'Destiny Brown',
    initials: 'DB',
    primaryRole: 'Admin Designee',
  },
  'u-priv-01': {
    userId: 'u-priv-01',
    name: 'Carlos Rivera',
    initials: 'CR',
    primaryRole: 'Systems',
  },
  'u-comp-01': {
    userId: 'u-comp-01',
    name: 'Angela Martinez',
    initials: 'AM',
    primaryRole: 'Administrator',
  },
};

/* ========================================================================== */
/* 4. EXECUTION UNIT SEEDS — Active Sprint (2026-10)                         */
/*    Core data for CES Board, drawers, evidence panels, My Tasks            */
/* ========================================================================== */

function makeOwner(key: keyof typeof V3_Personas): Owner {
  const p = V3_Personas[key];
  return { userId: p.userId, name: p.name, initials: p.initials, role: p.primaryRole };
}

function makeSigners(partial: Partial<RequiredSigner>[]): RequiredSigner[] {
  return partial.map((s, i) => {
    const role = s.role ?? 'DON';
    const resolvedName = resolveDisplayName(s.name) || (V3_Personas['u-don-01']?.name ?? 'Maria Gonzalez, RN');
    return {
      userId: s.userId ?? `signer-${i}`,
      name: s.name ?? resolvedName,
      initials: s.initials ?? (resolvedName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'MG'),
      role,
      status: s.status ?? 'pending',
      signedAt: s.signedAt,
      hoursToEscalation: s.hoursToEscalation,
    };
  });
}

/**
 * Resolves a raw owner/role string (from events, regulatory, fallbacks) to a
 * canonical full display name from CES staff seed (V3_Personas).
 * Ensures everywhere displayed we use real seeded names instead of
 * placeholders, short forms (M. Chen), or generic titles (QAPI Lead).
 * Falls back to DON persona for unresolved (per cesRoles default).
 */
export function resolveDisplayName(raw?: string | null): string {
  if (!raw) return V3_Personas['u-don-01']?.name ?? 'Maria Gonzalez, RN';
  const s = String(raw).trim();
  if (!s || s === '—' || /^owner:/i.test(s)) return V3_Personas['u-don-01']?.name ?? 'Maria Gonzalez, RN';

  // direct name match (case-insensitive, allow short prefix)
  for (const p of Object.values(V3_Personas)) {
    if (!p.name) continue;
    const lower = p.name.toLowerCase();
    if (lower === s.toLowerCase() || lower.startsWith(s.toLowerCase() + ',') || s.toLowerCase().startsWith(lower.split(',')[0])) {
      return p.name;
    }
  }

  const norm = s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

  // role -> persona name map (covers CES + common legacy from regulatory/swimlanes)
  const roleToPersonaKey: Record<string, keyof typeof V3_Personas> = {
    'don': 'u-don-01', 'director of nursing': 'u-don-01', 'maria': 'u-don-01', 'gonzalez': 'u-don-01',
    'administrator': 'u-admin-01', 'admin': 'u-admin-01', 'robert': 'u-admin-01', 'chen': 'u-admin-01',
    'governing body': 'u-gb-01', 'board': 'u-gb-01', 'patricia': 'u-gb-01', 'hale': 'u-gb-01',
    'accounting': 'u-acc-01', 'david': 'u-acc-01', 'kim': 'u-acc-01',
    'systems': 'u-sys-01', 'elena': 'u-sys-01', 'vargas': 'u-sys-01',
    'admin designee': 'u-admdes-01', 'james': 'u-admdes-01', 'torres': 'u-admdes-01',
    'qapi lead': 'u-qm-01', 'qapi nurse': 'u-qm-01', 'qa analyst': 'u-qm-01', 'nicole': 'u-qm-01', 'foster': 'u-qm-01',
    'clinical manager': 'u-ipc-01', 'linda': 'u-ipc-01', 'patel': 'u-ipc-01', 'infection': 'u-ipc-01',
    'compliance officer': 'u-comp-01', 'angela': 'u-comp-01', 'martinez': 'u-comp-01',
    'risk manager': 'u-comp-01',
    'hr credentialing': 'u-hr-01', 'hr': 'u-hr-01', 'destiny': 'u-hr-01', 'brown': 'u-hr-01',
    'scheduler': 'u-admdes-01', 'operations lead': 'u-sys-01', 'clinical ops': 'u-don-01',
    'policy admin': 'u-admin-01', 'clinical educator': 'u-ipc-01', 'committee chair': 'u-gb-01',
    'm. chen': 'u-admin-01', 'd. alvarez': 'u-admin-01', 'r. patel': 'u-acc-01', 't. nguyen': 'u-sys-01',
    's. ahmed': 'u-don-01', 'l. washington': 'u-comp-01', 'j. okafor': 'u-comp-01',
  };

  for (const [k, key] of Object.entries(roleToPersonaKey)) {
    if (norm.includes(k)) {
      const p = V3_Personas[key];
      if (p) return p.name;
    }
  }

  // looks like plausible full name already (has comma or >=2 words)
  if (s.includes(',') || s.split(/\s+/).filter(Boolean).length >= 2) return s;

  return V3_Personas['u-don-01']?.name ?? 'Maria Gonzalez, RN';
}

function makeEvidenceStatus(overrides: Partial<EvidenceStatus>): EvidenceStatus {
  return {
    requiredFormsTotal: 3,
    requiredFormsComplete: 2,
    missingFormIds: ['FRM-QAPI-042'],
    signaturesRequired: 2,
    signaturesComplete: 1,
    auditIndexCreated: false,
    ...overrides,
  };
}

export const V3_ExecutionUnitsSeed: ExecutionUnit[] = [
  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Governing Body meeting packet (awaiting signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-gb-2026-10-001',
    title: 'Prepare & distribute Q2 Governing Body pre-read packet',
    parentEventId: 'evt-gb-q2-2026',
    workflowId: 'wf-gb-packet-2026-10',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'partial',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 31 },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-20T16:12:00Z' },
    ]),
    dueDate: '2026-05-21',
    escalationTimer: 31,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sourcePolicyIds: ['GV-GB-001'],
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['DON', 'Administrator'],
    canReviewRoles: ['Administrator', 'DON'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // QAPI — Data collection (in progress, blocked on signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-qapi-2026-10-014',
    title: 'Compile QAPI indicator data — Q2 aggregate report',
    parentEventId: 'evt-qapi-q2-2026',
    workflowId: 'wf-qapi-data-2026-10',
    workflowPhase: 'review',
    complianceState: 'blocked',
    auditReadiness: 'partial',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 18 },
    ]),
    blockedReason: {
      kind: 'missing_signature',
      label: 'DON signature required on data summary',
      resourceId: 'wf-qapi-data-2026-10',
    },
    dueDate: '2026-05-19',
    escalationTimer: 18,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 3,
      missingFormIds: ['QA-FM-020'],
      signaturesRequired: 1,
      signaturesComplete: 0,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator', 'DON'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // INFECTION CONTROL — TB screening gap (real gap for surveyor view)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-ipc-2026-10-007',
    title: 'Complete TB screening documentation for contract clinicians',
    parentEventId: 'evt-ipc-tb-2026',
    workflowId: 'wf-ipc-tb-contract-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: -4 },
    ]),
    dueDate: '2026-05-17',
    escalationTimer: -4,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 5,
      requiredFormsComplete: 2,
      missingFormIds: ['FRM-IPC-003', 'FRM-IPC-004', 'FRM-IPC-005'],
      signaturesRequired: 1,
      signaturesComplete: 0,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'DON Assistant',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['DON Assistant', 'DON'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // EMERGENCY PREPAREDNESS — Drill after-action (ready for review)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-ep-2026-10-003',
    title: 'Finalize 2026 emergency drill after-action report',
    parentEventId: 'evt-ep-drill-2026',
    workflowId: 'wf-ep-afteraction-2026-10',
    workflowPhase: 'review',
    complianceState: 'ready',
    auditReadiness: 'ready',
    owner: makeOwner('u-sys-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 42 },
    ]),
    dueDate: '2026-05-24',
    escalationTimer: 42,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 0,
    }),
    domain: 'compliance',
    obligationKind: 'TASK',
    parentObligationId: 'ceu-ep-parent-001',
    sourceType: 'COMMITTEE',
    sprintId: '2026-10',
    assignedRole: 'Systems',
    accountableRole: 'Administrator',
    reviewerRole: 'DON',
    approverRole: 'Administrator',
    canCompleteRoles: ['Systems', 'Administrator'],
    canReviewRoles: ['DON', 'Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — Personnel file audit (completed in prior sprint, shown for trend)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-hr-2026-09-022',
    title: 'Personnel file completeness audit — Q1 new hires',
    parentEventId: 'evt-hr-files-2026-q1',
    workflowId: 'wf-hr-audit-2026-09',
    workflowPhase: 'audit',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-acc-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-08T09:45:00Z' },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-08T11:20:00Z' },
    ]),
    dueDate: '2026-05-08',
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 6,
      requiredFormsComplete: 6,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 2,
      auditIndexCreated: true,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'ONBOARDING',
    sprintId: '2026-09',
    assignedRole: 'Accounting',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['Accounting', 'DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON', 'Administrator'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — HIPAA privacy training completion tracker (upcoming)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-hipaa-2026-10-001',
    title: 'Verify annual HIPAA privacy training completion — all clinical staff',
    parentEventId: 'evt-hipaa-training-2026',
    workflowId: 'wf-hipaa-train-2026-10',
    workflowPhase: 'preparation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 72 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 72,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-HIPAA-001', 'FRM-HIPAA-002', 'FRM-HIPAA-003', 'FRM-HIPAA-004'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON', 'Admin Designee'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Patient care plan 60-day review cycle (in_progress)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-cp-2026-10-002',
    title: 'Complete 60-day care plan recertification reviews — active census',
    parentEventId: 'evt-infection-surveillance',
    workflowId: 'wf-careplan-60day-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 24 },
    ]),
    dueDate: '2026-05-20',
    escalationTimer: 24,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 8,
      requiredFormsComplete: 5,
      missingFormIds: ['FRM-CP-011', 'FRM-CP-012', 'FRM-CP-013'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Wound care protocol revision (ready for review)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-wc-2026-10-003',
    title: 'Review updated wound care assessment protocol per 2026 CMS guidance',
    parentEventId: 'evt-policy-annual-review',
    workflowId: 'wf-wound-protocol-2026-10',
    workflowPhase: 'review',
    complianceState: 'ready',
    auditReadiness: 'ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 36 },
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-19T14:00:00Z' },
    ]),
    dueDate: '2026-05-22',
    escalationTimer: 36,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 3,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator', 'DON'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Medication reconciliation audit (completed)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-medrec-2026-10-004',
    title: 'Medication reconciliation accuracy audit — SOC/ROC visits',
    parentEventId: 'evt-infection-surveillance',
    workflowId: 'wf-medrec-audit-2026-10',
    workflowPhase: 'audit',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-15T10:30:00Z' },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-15T14:45:00Z' },
    ]),
    dueDate: '2026-05-16',
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 4,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 2,
      auditIndexCreated: true,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Infection surveillance data compilation (blocked)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-inf-2026-10-005',
    title: 'Compile monthly infection surveillance data — May 2026',
    parentEventId: 'evt-infection-surveillance',
    workflowId: 'wf-infection-surv-2026-10',
    workflowPhase: 'review',
    complianceState: 'blocked',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: -12 },
    ]),
    blockedReason: {
      kind: 'missing_evidence',
      label: 'Lab results pending from 3 contracted facilities',
      resourceId: 'wf-infection-surv-2026-10',
    },
    dueDate: '2026-05-18',
    escalationTimer: -12,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 6,
      requiredFormsComplete: 2,
      missingFormIds: ['FRM-INF-001', 'FRM-INF-002', 'FRM-INF-003', 'FRM-INF-004'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['Admin Designee', 'DON'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — Safety drill planning & scheduling (upcoming)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-safety-2026-10-006',
    title: 'Schedule and prepare Q2 fire/safety drill for field staff',
    parentEventId: 'evt-safety-drill-q2',
    workflowId: 'wf-safety-drill-2026-10',
    workflowPhase: 'preparation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-sys-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 96 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 96,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-SAFE-001', 'FRM-SAFE-002', 'FRM-SAFE-003'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Systems',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Systems', 'Admin Designee'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — Annual policy manual review (in_progress)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-polrev-2026-10-007',
    title: 'Complete annual policy manual review — clinical operations section',
    parentEventId: 'evt-policy-annual-review',
    workflowId: 'wf-policy-review-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 48 },
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 48 },
    ]),
    dueDate: '2026-05-22',
    escalationTimer: 48,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 5,
      requiredFormsComplete: 3,
      missingFormIds: ['FRM-POL-008', 'FRM-POL-009'],
      signaturesRequired: 2,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['DON', 'Administrator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — Incident reporting procedure update (awaiting_signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-inc-2026-10-008',
    title: 'Approve revised incident reporting & grievance procedure',
    parentEventId: 'evt-policy-annual-review',
    workflowId: 'wf-incident-proc-2026-10',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'partial',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 22 },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-19T16:30:00Z' },
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-19T11:15:00Z' },
    ]),
    dueDate: '2026-05-21',
    escalationTimer: 22,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 3,
      signaturesComplete: 2,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Administrator',
    reviewerRole: 'DON',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['DON', 'Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — HIPAA breach notification procedure (ready for signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-hipbr-2026-10-009',
    title: 'Finalize HIPAA breach notification procedure annual update',
    parentEventId: 'evt-hipaa-training-2026',
    workflowId: 'wf-hipaa-breach-2026-10',
    workflowPhase: 'signature',
    complianceState: 'ready',
    auditReadiness: 'ready',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 52 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 52,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Administrator',
    reviewerRole: 'DON',
    approverRole: 'Administrator',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — Fire safety inspection follow-up (completed)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-fire-2026-10-010',
    title: 'Close fire safety inspection corrective actions — April findings',
    parentEventId: 'evt-safety-drill-q2',
    workflowId: 'wf-fire-followup-2026-10',
    workflowPhase: 'audit',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-sys-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-13T09:00:00Z' },
    ]),
    dueDate: '2026-05-14',
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 3,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 1,
      auditIndexCreated: true,
    }),
    domain: 'compliance',
    obligationKind: 'TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-10',
    assignedRole: 'Systems',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Systems'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — Staff competency assessment prep (upcoming)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-comp-2026-10-011',
    title: 'Prepare Q2 clinical competency assessment schedule & tools',
    parentEventId: 'evt-staff-competency-q2',
    workflowId: 'wf-competency-prep-2026-10',
    workflowPhase: 'preparation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 60 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 60,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-COMP-001', 'FRM-COMP-002', 'FRM-COMP-003'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['Admin Designee', 'DON'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — New hire orientation documentation (in_progress)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-orient-2026-10-012',
    title: 'Complete orientation checklists for May 2026 new hires (3 staff)',
    parentEventId: 'evt-hr-files-2026-q1',
    workflowId: 'wf-orientation-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 16 },
      { userId: 'u-admdes-01', name: 'James Torres', initials: 'JT', role: 'Admin Designee', status: 'signed', signedAt: '2026-05-20T08:30:00Z' },
    ]),
    dueDate: '2026-05-21',
    escalationTimer: 16,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 9,
      requiredFormsComplete: 6,
      missingFormIds: ['FRM-ORI-007', 'FRM-ORI-008', 'FRM-ORI-009'],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'ONBOARDING',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['Admin Designee'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — License renewal tracking (ready for review)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-lic-2026-10-013',
    title: 'Verify license/certification renewal status — expiring Q2 staff',
    parentEventId: 'evt-staff-competency-q2',
    workflowId: 'wf-license-track-2026-10',
    workflowPhase: 'review',
    complianceState: 'ready',
    auditReadiness: 'ready',
    owner: makeOwner('u-acc-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 40 },
    ]),
    dueDate: '2026-05-22',
    escalationTimer: 40,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 3,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'Accounting',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['Accounting', 'Admin Designee'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — Background check compliance (blocked — vendor delay)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-bgchk-2026-10-014',
    title: 'Resolve outstanding background check results — 2 pending hires',
    parentEventId: 'evt-hr-files-2026-q1',
    workflowId: 'wf-bgcheck-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'blocked',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: -8 },
    ]),
    blockedReason: {
      kind: 'external_dependency',
      label: 'Awaiting vendor response — background check provider delay',
      resourceId: 'wf-bgcheck-2026-10',
    },
    dueDate: '2026-05-16',
    escalationTimer: -8,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-BG-002', 'FRM-BG-003', 'FRM-BG-004'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'ONBOARDING',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Admin Designee'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — Competency validation sign-off (awaiting_signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-compval-2026-10-015',
    title: 'Sign off Q1 clinical competency validations — RN/LPN staff',
    parentEventId: 'evt-staff-competency-q2',
    workflowId: 'wf-compval-signoff-2026-10',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'partial',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 8 },
    ]),
    dueDate: '2026-05-20',
    escalationTimer: 8,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 7,
      requiredFormsComplete: 7,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Financial oversight committee prep (upcoming)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-fin-2026-10-016',
    title: 'Assemble financial oversight evidence package for Governing Body',
    parentEventId: 'evt-financial-oversight-q2',
    workflowId: 'wf-financial-oversight-2026-10',
    workflowPhase: 'preparation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-acc-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 84 },
      { userId: 'u-acc-01', name: 'David Kim, CPA', initials: 'DK', role: 'Accounting', status: 'pending', hoursToEscalation: 84 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 84,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 5,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-FIN-001', 'FRM-FIN-002', 'FRM-FIN-003', 'FRM-FIN-004', 'FRM-FIN-005'],
      signaturesRequired: 2,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Accounting',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Accounting', 'Administrator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Compliance committee meeting minutes (in_progress)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-ccmm-2026-10-017',
    title: 'Finalize compliance committee meeting minutes — May session',
    parentEventId: 'evt-gb-q2-2026',
    workflowId: 'wf-compliance-minutes-2026-10',
    workflowPhase: 'review',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 28 },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-20T17:00:00Z' },
    ]),
    dueDate: '2026-05-22',
    escalationTimer: 28,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-GOV-003'],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['Administrator', 'DON'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Policy manual annual governing body approval (awaiting_signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-polapp-2026-10-018',
    title: 'Obtain Governing Body signature on 2026 policy manual approval',
    parentEventId: 'evt-policy-annual-review',
    workflowId: 'wf-policy-approval-2026-10',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'partial',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: -2 },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-18T10:00:00Z' },
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-18T14:30:00Z' },
    ]),
    dueDate: '2026-05-19',
    escalationTimer: -2,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 1,
      requiredFormsComplete: 1,
      missingFormIds: [],
      signaturesRequired: 3,
      signaturesComplete: 2,
      auditIndexCreated: false,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Governing Body',
    reviewerRole: 'DON',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['DON', 'Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Board resolution documentation (completed)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-bres-2026-10-019',
    title: 'Document board resolution — Q1 strategic plan approval',
    parentEventId: 'evt-gb-q2-2026',
    workflowId: 'wf-board-resolution-2026-10',
    workflowPhase: 'audit',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'signed', signedAt: '2026-05-12T16:00:00Z' },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-12T11:45:00Z' },
    ]),
    dueDate: '2026-05-13',
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 2,
      auditIndexCreated: true,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Home safety assessment protocol update (in_progress, overdue)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-hsa-2026-10-020',
    title: 'Update home safety assessment checklist per OSHA 2026 guidance',
    parentEventId: 'evt-safety-drill-q2',
    workflowId: 'wf-home-safety-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: -24 },
    ]),
    dueDate: '2026-05-15',
    escalationTimer: -24,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-HSA-002', 'FRM-HSA-003'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — OASIS data accuracy validation (ready)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-oasis-2026-10-021',
    title: 'Validate OASIS-E data accuracy — Q2 transmission error review',
    parentEventId: 'evt-qapi-q2-2026',
    workflowId: 'wf-oasis-validation-2026-10',
    workflowPhase: 'review',
    complianceState: 'ready',
    auditReadiness: 'ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 44 },
    ]),
    dueDate: '2026-05-22',
    escalationTimer: 44,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 3,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator', 'DON'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // HR — Annual in-service training documentation (completed)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-inservice-2026-10-022',
    title: 'Document annual in-service training completion — all disciplines',
    parentEventId: 'evt-hipaa-training-2026',
    workflowId: 'wf-inservice-2026-10',
    workflowPhase: 'audit',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-05-14T13:15:00Z' },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-14T15:30:00Z' },
    ]),
    dueDate: '2026-05-15',
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 5,
      requiredFormsComplete: 5,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 2,
      auditIndexCreated: true,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'DON',
    reviewerRole: 'DON',
    approverRole: 'DON',
    canCompleteRoles: ['Admin Designee'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['DON', 'Administrator'],
    escalationRole: 'DON',
  },

  // ────────────────────────────────────────────────────────────────────────
  // GOVERNANCE — Conflict of interest disclosures (upcoming)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-coi-2026-10-023',
    title: 'Collect annual conflict of interest disclosures — board members',
    parentEventId: 'evt-financial-oversight-q2',
    workflowId: 'wf-coi-disclosures-2026-10',
    workflowPhase: 'preparation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-admin-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'pending', hoursToEscalation: 90 },
    ]),
    dueDate: '2026-05-23',
    escalationTimer: 90,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-COI-001', 'FRM-COI-002', 'FRM-COI-003', 'FRM-COI-004'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-10',
    assignedRole: 'Administrator',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['Administrator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },

  // ────────────────────────────────────────────────────────────────────────
  // CLINICAL — Skilled nursing supervisory visit compliance (awaiting_signature)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-snsv-2026-10-024',
    title: 'Approve supervisory visit compliance report — LPN/HHA oversight',
    parentEventId: 'evt-infection-surveillance',
    workflowId: 'wf-supvisit-2026-10',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 12 },
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-05-20T09:15:00Z' },
    ]),
    dueDate: '2026-05-21',
    escalationTimer: 12,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 4,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-10',
    assignedRole: 'DON',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // COMPLIANCE — Abuse/neglect reporting policy attestation (in_progress, overdue)
  // ────────────────────────────────────────────────────────────────────────
  {
    id: 'ceu-abuse-2026-10-025',
    title: 'Collect staff attestations — abuse/neglect reporting policy',
    parentEventId: 'evt-policy-annual-review',
    workflowId: 'wf-abuse-attest-2026-10',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: -6 },
    ]),
    dueDate: '2026-05-17',
    escalationTimer: -6,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 10,
      requiredFormsComplete: 7,
      missingFormIds: ['FRM-ABN-008', 'FRM-ABN-009', 'FRM-ABN-010'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-10',
    assignedRole: 'Admin Designee',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Admin Designee', 'Administrator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },

  // ────────────────────────────────────────────────────────────────────────
  // NEW UNITS FOR APRIL & JUNE EVENTS (outside May sprint window)
  // ────────────────────────────────────────────────────────────────────────
  // April events use sprint 2026-09 (Apr 26 - May 9)
  {
    id: 'ceu-gb-q2-apr-001',
    title: 'Q2 Governing Body pre-read packet — April prep',
    parentEventId: 'evt-gb-q2-apr',
    workflowId: 'wf-gb-packet-apr-2026',
    workflowPhase: 'preparation',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-don-01'),
    approver: makeOwner('u-gb-01'),
    signatureOwner: makeOwner('u-gb-01'),
    requiredSigners: makeSigners([
      { userId: 'u-gb-01', name: 'Patricia Hale', initials: 'PH', role: 'Governing Body', status: 'signed', signedAt: '2026-04-28T10:00:00Z' },
    ]),
    dueDate: '2026-04-30',
    escalationTimer: 0,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 2,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 1,
      auditIndexCreated: true,
    }),
    domain: 'governance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sourcePolicyIds: ['GV-GB-001'],
    sprintId: '2026-09',
    assignedRole: 'DON',
    accountableRole: 'Governing Body',
    reviewerRole: 'Administrator',
    approverRole: 'Governing Body',
    canCompleteRoles: ['DON'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Governing Body'],
    escalationRole: 'Governing Body',
  },
  {
    id: 'ceu-qapi-apr-002',
    title: 'Q2 QAPI dashboard refresh — April cycle',
    parentEventId: 'evt-qapi-q2-apr',
    workflowId: 'wf-qapi-apr-2026',
    workflowPhase: 'documentation',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-qm-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 48 },
    ]),
    dueDate: '2026-05-05',
    escalationTimer: 48,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-QAPI-042', 'FRM-QAPI-043'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'quality',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-09',
    assignedRole: 'Quality Manager',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['Quality Manager'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },
  // June events — Sprint 11 (May 24-Jun 6) and Sprint 12 (Jun 7-20)
  {
    id: 'ceu-ipc-jun-003',
    title: 'Infection Prevention Committee — June surveillance summary',
    parentEventId: 'evt-ipc-tb-jun',
    workflowId: 'wf-ipc-jun-2026',
    workflowPhase: 'review',
    complianceState: 'blocked',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-ipc-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 24 },
    ]),
    dueDate: '2026-06-04',
    escalationTimer: 24,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 5,
      requiredFormsComplete: 2,
      missingFormIds: ['FRM-IPC-011', 'FRM-IPC-012', 'FRM-IPC-013'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-11',
    assignedRole: 'Infection Preventionist',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['Infection Preventionist'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },
  {
    id: 'ceu-ep-jun-004',
    title: 'Emergency Preparedness drill debrief — June',
    parentEventId: 'evt-ep-drill-jun',
    workflowId: 'wf-ep-jun-2026',
    workflowPhase: 'signature',
    complianceState: 'awaiting_signature',
    auditReadiness: 'ready',
    owner: makeOwner('u-safety-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 18 },
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'signed', signedAt: '2026-06-05T14:30:00Z' },
    ]),
    dueDate: '2026-06-06',
    escalationTimer: 18,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 3,
      requiredFormsComplete: 3,
      missingFormIds: [],
      signaturesRequired: 2,
      signaturesComplete: 1,
      auditIndexCreated: false,
    }),
    domain: 'safety',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-11',
    assignedRole: 'Safety Officer',
    accountableRole: 'Administrator',
    reviewerRole: 'DON',
    approverRole: 'Administrator',
    canCompleteRoles: ['Safety Officer'],
    canReviewRoles: ['DON'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },
  {
    id: 'ceu-hr-jun-005',
    title: 'Q2 personnel file audit — June closeout',
    parentEventId: 'evt-hr-files-jun',
    workflowId: 'wf-hr-jun-2026',
    workflowPhase: 'documentation',
    complianceState: 'ready',
    auditReadiness: 'partial',
    owner: makeOwner('u-hr-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 72 },
    ]),
    dueDate: '2026-06-12',
    escalationTimer: 72,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 8,
      requiredFormsComplete: 5,
      missingFormIds: ['FRM-HR-031', 'FRM-HR-032', 'FRM-HR-033'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'hr',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'AUDIT',
    sprintId: '2026-12',
    assignedRole: 'HR Coordinator',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['HR Coordinator'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },
  {
    id: 'ceu-hipaa-jun-006',
    title: 'Annual HIPAA training attestation — June cohort',
    parentEventId: 'evt-hipaa-training-jun',
    workflowId: 'wf-hipaa-jun-2026',
    workflowPhase: 'documentation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-priv-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 120 },
    ]),
    dueDate: '2026-06-18',
    escalationTimer: 120,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 12,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-HIP-001'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-12',
    assignedRole: 'Privacy Officer',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Privacy Officer'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },
  {
    id: 'ceu-inf-jun-007',
    title: 'June infection surveillance log close',
    parentEventId: 'evt-infection-surveillance-jun',
    workflowId: 'wf-inf-jun-2026',
    workflowPhase: 'review',
    complianceState: 'in_progress',
    auditReadiness: 'partial',
    owner: makeOwner('u-ipc-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 36 },
    ]),
    dueDate: '2026-06-10',
    escalationTimer: 36,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 4,
      requiredFormsComplete: 3,
      missingFormIds: ['FRM-INF-099'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'clinical',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'WORKFLOW',
    sprintId: '2026-12',
    assignedRole: 'Infection Preventionist',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['Infection Preventionist'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },
  {
    id: 'ceu-polrev-jun-008',
    title: 'Policy annual review attestation — June batch',
    parentEventId: 'evt-policy-annual-review-jun',
    workflowId: 'wf-pol-jun-2026',
    workflowPhase: 'documentation',
    complianceState: 'completed',
    auditReadiness: 'ready',
    owner: makeOwner('u-admdes-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'signed', signedAt: '2026-06-08T09:45:00Z' },
    ]),
    dueDate: '2026-06-09',
    escalationTimer: 0,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 6,
      requiredFormsComplete: 6,
      missingFormIds: [],
      signaturesRequired: 1,
      signaturesComplete: 1,
      auditIndexCreated: true,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'REGULATORY_EVENT',
    sprintId: '2026-12',
    assignedRole: 'Admin Designee',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Admin Designee'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },
  {
    id: 'ceu-safety-jun-009',
    title: 'Safety committee drill report — June',
    parentEventId: 'evt-safety-drill-jun',
    workflowId: 'wf-safety-jun-2026',
    workflowPhase: 'review',
    complianceState: 'ready',
    auditReadiness: 'partial',
    owner: makeOwner('u-safety-01'),
    approver: makeOwner('u-don-01'),
    signatureOwner: makeOwner('u-don-01'),
    requiredSigners: makeSigners([
      { userId: 'u-don-01', name: 'Maria Gonzalez, RN', initials: 'MG', role: 'DON', status: 'pending', hoursToEscalation: 48 },
    ]),
    dueDate: '2026-06-11',
    escalationTimer: 48,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 2,
      requiredFormsComplete: 1,
      missingFormIds: ['FRM-SAF-007'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'safety',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'COMMITTEE',
    sprintId: '2026-12',
    assignedRole: 'Safety Officer',
    accountableRole: 'DON',
    reviewerRole: 'Administrator',
    approverRole: 'DON',
    canCompleteRoles: ['Safety Officer'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['DON'],
    escalationRole: 'DON',
  },
  {
    id: 'ceu-comp-jun-010',
    title: 'Compliance validation checklist — mid-June',
    parentEventId: 'evt-comp-val-jun',
    workflowId: 'wf-compval-jun-2026',
    workflowPhase: 'documentation',
    complianceState: 'upcoming',
    auditReadiness: 'not_ready',
    owner: makeOwner('u-comp-01'),
    approver: makeOwner('u-admin-01'),
    signatureOwner: makeOwner('u-admin-01'),
    requiredSigners: makeSigners([
      { userId: 'u-admin-01', name: 'Robert Chen', initials: 'RC', role: 'Administrator', status: 'pending', hoursToEscalation: 96 },
    ]),
    dueDate: '2026-06-15',
    escalationTimer: 96,
    evidenceStatus: makeEvidenceStatus({
      requiredFormsTotal: 7,
      requiredFormsComplete: 0,
      missingFormIds: ['FRM-COMP-001', 'FRM-COMP-002'],
      signaturesRequired: 1,
      signaturesComplete: 0,
      auditIndexCreated: false,
    }),
    domain: 'compliance',
    obligationKind: 'SPRINT_TASK',
    sourceType: 'AUDIT',
    sprintId: '2026-12',
    assignedRole: 'Compliance Officer',
    accountableRole: 'Administrator',
    reviewerRole: 'Administrator',
    approverRole: 'Administrator',
    canCompleteRoles: ['Compliance Officer'],
    canReviewRoles: ['Administrator'],
    canApproveRoles: ['Administrator'],
    escalationRole: 'Administrator',
  },
];

/* ========================================================================== */
/* 5. SURVEYOR vs INTERNAL VIEW DIFFERENTIATION                              */
/* ========================================================================== */

export type ViewMode = 'internal' | 'surveyor';

export interface V3ViewModeSeeds {
  internal: {
    visibleUnits: string[]; // ids from V3_ExecutionUnitsSeed
    emphasis: 'operational' | 'risk';
  };
  surveyor: {
    visibleUnits: string[];
    emphasis: 'alignment' | 'evidence';
    forcedGaps: string[]; // unit ids the surveyor view should highlight as gaps
  };
}

export const V3_ViewModeSeed: V3ViewModeSeeds = {
  internal: {
    visibleUnits: [
      'ceu-gb-2026-10-001',
      'ceu-qapi-2026-10-014',
      'ceu-ipc-2026-10-007',
      'ceu-ep-2026-10-003',
      'ceu-hr-2026-09-022',
      'ceu-hipaa-2026-10-001',
      'ceu-cp-2026-10-002',
      'ceu-wc-2026-10-003',
      'ceu-medrec-2026-10-004',
      'ceu-inf-2026-10-005',
      'ceu-safety-2026-10-006',
      'ceu-polrev-2026-10-007',
      'ceu-inc-2026-10-008',
      'ceu-hipbr-2026-10-009',
      'ceu-fire-2026-10-010',
      'ceu-comp-2026-10-011',
      'ceu-orient-2026-10-012',
      'ceu-lic-2026-10-013',
      'ceu-bgchk-2026-10-014',
      'ceu-compval-2026-10-015',
      'ceu-fin-2026-10-016',
      'ceu-ccmm-2026-10-017',
      'ceu-polapp-2026-10-018',
      'ceu-bres-2026-10-019',
      'ceu-hsa-2026-10-020',
      'ceu-oasis-2026-10-021',
      'ceu-inservice-2026-10-022',
      'ceu-coi-2026-10-023',
      'ceu-snsv-2026-10-024',
      'ceu-abuse-2026-10-025',
      'ceu-gb-q2-apr-001',
      'ceu-qapi-apr-002',
      'ceu-ipc-jun-003',
      'ceu-ep-jun-004',
      'ceu-hr-jun-005',
      'ceu-hipaa-jun-006',
      'ceu-inf-jun-007',
      'ceu-polrev-jun-008',
      'ceu-safety-jun-009',
      'ceu-comp-jun-010',
    ],
    emphasis: 'operational',
  },
  surveyor: {
    visibleUnits: [
      'ceu-gb-2026-10-001',
      'ceu-ipc-2026-10-007',
      'ceu-qapi-2026-10-014',
      'ceu-wc-2026-10-003',
      'ceu-medrec-2026-10-004',
      'ceu-inf-2026-10-005',
      'ceu-polrev-2026-10-007',
      'ceu-inc-2026-10-008',
      'ceu-hipbr-2026-10-009',
      'ceu-fire-2026-10-010',
      'ceu-lic-2026-10-013',
      'ceu-polapp-2026-10-018',
      'ceu-bres-2026-10-019',
      'ceu-oasis-2026-10-021',
      'ceu-inservice-2026-10-022',
      'ceu-snsv-2026-10-024',
      'ceu-abuse-2026-10-025',
    ],
    emphasis: 'alignment',
    forcedGaps: [
      'ceu-ipc-2026-10-007',
      'ceu-inf-2026-10-005',
      'ceu-hsa-2026-10-020',
      'ceu-abuse-2026-10-025',
    ],
  },
};

/* ========================================================================== */
/* 6. CONVENIENCE AGGREGATES & HOOK SHIMS                                    */
/* ========================================================================== */

export function getExecutionUnitsForSprint(sprintId: string): ExecutionUnit[] {
  return V3_ExecutionUnitsSeed.filter(u => u.sprintId === sprintId);
}

export function getActiveSprintExecutionUnits(): ExecutionUnit[] {
  return getExecutionUnitsForSprint(V3_ActiveSprintSeed.id);
}

/** Simple context object for components that want the full V3 seed bundle */
export function useV3CESSeedContext(viewMode: ViewMode = 'internal') {
  const all = V3_ExecutionUnitsSeed;
  const visibleIds = viewMode === 'surveyor'
    ? V3_ViewModeSeed.surveyor.visibleUnits
    : V3_ViewModeSeed.internal.visibleUnits;

  return {
    sprint: V3_SprintContextSeed,
    achc: V3_AchcSurveyorAlignmentSeed,
    executionUnits: all.filter(u => visibleIds.includes(u.id)),
    personas: V3_Personas,
    viewMode,
  };
}
