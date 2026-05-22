/* ═══════════════════════════════════════════════════════════════
   ONBOARDING EXECUTION ENGINE
   --------------------------------------------------------------
   Single source of truth for compliance EXECUTION UNITS.

   Replaces the prior CES mock seed. Every CES calendar, board
   tile, audit-readiness count, blocker, and signature workflow is
   derived from this engine.

   Inputs (read from useJourneyStore):
     • employees, attempts, supervised visits, evidence
     • appendix-F clearance + signatures
     • escalations + remediation plans

   Outputs:
     • OnboardingExecutionUnit[]    — operational compliance items
     • OnboardingExecutionBatch[]   — per-employee groupings
     • GateEvaluation[]             — hard-gate clearances
       (field_clearance, billing_clearance, system_access_clearance,
        appendix_f, gao_complete, license_valid, prerequisite_chain)

   Pure functions accept a snapshot. The React hook
   `useOnboardingEngine()` wires the journey store into the engine.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import { ALL_MODULES, modulesForRole } from '@/policy/journey/data/modules';
import {
  canStartModule, canClearForIndependentWork, latestAttempt, isModulePassed,
} from '@/policy/journey/utils/gating';
import type {
  JourneyEmployee, JourneyModule, ModuleAttempt, SupervisedVisit,
  AppendixFItem, JourneyEscalation, RemediationPlan,
} from '@/policy/journey/types/journey';
import type {
  ExecutionUnit, ComplianceDomain, ComplianceState, WorkflowPhase,
  AuditReadiness, RequiredSigner, BlockedReason, EvidenceStatus, Owner,
} from '@/policy/ces/types';
import {
  useOnboardingEventStore, getOnboardingEventLog, projectUnit,
  type OnboardingEvent, type UnitProjection, type SignatureArtifact,
} from './onboardingEvents';

/* ═══════════════════════════════════════════════════════════════
   PUBLIC TYPES
   ═══════════════════════════════════════════════════════════════ */

/** Why this execution unit exists. */
export type OnboardingUnitKind =
  | 'appendix_f'        // Pre-Day-1 screening clearance signature
  | 'module'            // SCORM / quiz / case-study module attempt
  | 'supervised_visit'  // Supervised visit per HR-TA-005 Appendix E
  | 'clearance'         // Final independent-practice clearance
  | 'annual'            // Annual mandatory training cycle
  | 'remediation'       // Open remediation plan
  | 'license_renewal'   // License expiration window (≤120 days)
  | 'drill';            // EP drill participation

/** Hard-gate identifiers. */
export type GateKind =
  | 'appendix_f'
  | 'gao_complete'
  | 'license_valid'
  | 'prerequisite_chain'
  | 'field_clearance'
  | 'billing_clearance'
  | 'system_access_clearance';

/** Result of evaluating a gate against a subject (employee). */
export interface GateEvaluation {
  gate:             GateKind;
  subjectId:        string;          // employee id
  subjectName:      string;
  /** Date the gate was evaluated against (ISO). */
  evaluatedAt:      string;
  passed:           boolean;
  /** Plain-English surveyor-grade reason. */
  reason:           string;
  /** Missing artifacts / blockers when failed. */
  missingEvidence:  string[];
  /** Policy / regulatory references. */
  policyRefs:       string[];
  /** Execution unit ids blocked by this gate failure. */
  blockedUnitIds:   string[];
}

/** Execution unit produced by the onboarding engine.  Extends CES `ExecutionUnit`. */
export interface OnboardingExecutionUnit extends ExecutionUnit {
  kind:               OnboardingUnitKind;
  subjectEmployeeId:  string;
  subjectName:        string;
  subjectRole:        string;
  /** Source artifact id (moduleId, appendix item id, license id…). */
  sourceId:           string;
  /** Gates that affect this unit (resolved). */
  gateResults:        readonly GateEvaluation[];
  /** Internal CI policy refs surfaced from the underlying module. */
  policyRefs:         readonly string[];
}

/** Per-employee batch. */
export interface OnboardingExecutionBatch {
  batchId:        string;     // 'batch-EMP-1001'
  subjectEmployeeId: string;
  subjectName:    string;
  subjectRole:    string;
  hireDate:       string;
  startDate:      string | null;
  /** All units that belong to this employee's onboarding lifecycle. */
  units:          readonly OnboardingExecutionUnit[];
  /** Aggregate gate state for the employee. */
  gates:          readonly GateEvaluation[];
  /** Synthetic event id used by calendar/sprint to group units. */
  eventId:        string;     // 'evt-onboarding-EMP-1001'
  /** Earliest open due date in this batch (ISO). Null when none. */
  nextDueDate:    string | null;
  /** Counts. */
  totals: {
    open:               number;
    blocked:            number;
    awaitingSignature:  number;
    completed:          number;
  };
}

/* ═══════════════════════════════════════════════════════════════
   ENGINE SNAPSHOT (pure input shape — no React)
   ═══════════════════════════════════════════════════════════════ */

export interface OnboardingEngineSnapshot {
  today:               Date;
  employees:           readonly JourneyEmployee[];
  attempts:            readonly ModuleAttempt[];
  supervisedVisits:    readonly SupervisedVisit[];
  escalations:         readonly JourneyEscalation[];
  remediationPlans:    readonly RemediationPlan[];
  appendixF:           Readonly<Record<string, AppendixFItem[]>>;
  appendixFSignatures: Readonly<Record<string, ReadonlyArray<{ role: string; signedAt?: string; name?: string }>>>;
}

/* ═══════════════════════════════════════════════════════════════
   OWNER MAPPING
   --------------------------------------------------------------
   All execution units own a CES `Owner`.  Owner is derived from
   journey supervisor / role.  HR Director, DON and Compliance
   Officer act as approvers/signature owners by gate.
   ═══════════════════════════════════════════════════════════════ */

const HR_DIRECTOR: Owner = { userId: 'u-hr-director',  name: 'HR Director',         initials: 'HR', role: 'HR Director' };
const COMPLIANCE:  Owner = { userId: 'u-compliance',   name: 'Compliance Officer',  initials: 'CO', role: 'Compliance Officer' };
const DON_OWNER:   Owner = { userId: 'u-don',          name: 'Director of Nursing', initials: 'DN', role: 'Director of Nursing' };

function employeeOwner(emp: JourneyEmployee): Owner {
  const initials = emp.name.split(/\s+/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'EE';
  return { userId: `u-${emp.id}`, name: emp.name, initials, role: emp.role };
}

function approverFor(emp: JourneyEmployee): Owner {
  // Clinical roles → DON.  Admin → Compliance.  Else HR Director.
  if (['DON','RN','LVN','PT','PTA','OT','COTA','SLP','MSW','HHA'].includes(emp.role)) return DON_OWNER;
  if (emp.role === 'ADM') return COMPLIANCE;
  return HR_DIRECTOR;
}

function domainForRole(role: string): ComplianceDomain {
  if (['DON','RN','LVN','PT','PTA','OT','COTA','SLP','MSW','HHA'].includes(role)) return 'clinical';
  if (role === 'ADM') return 'governance';
  return 'hr';
}

/* ═══════════════════════════════════════════════════════════════
   GATE EVALUATORS
   --------------------------------------------------------------
   Each gate accepts the snapshot + a subject (employee) and
   returns a deterministic GateEvaluation.  Failed gates produce
   surveyor-grade reasons and missing-evidence lists.
   ═══════════════════════════════════════════════════════════════ */

function isLicenseValid(emp: JourneyEmployee, today: Date): boolean {
  if (!emp.licenseExpiry) return true;
  return new Date(emp.licenseExpiry).getTime() > today.getTime();
}

export function evaluateAppendixFGate(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee,
): GateEvaluation {
  const items   = snap.appendixF[emp.id] ?? [];
  const sigs    = snap.appendixFSignatures[emp.id] ?? [];
  const incomplete = items.filter(i => i.status !== 'PASS' && i.status !== 'NA');
  const hasHrSig   = sigs.some(s => s.role === 'HRDirector');
  const passed = emp.appendixFCleared && hasHrSig && incomplete.length === 0;
  return {
    gate: 'appendix_f',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: snap.today.toISOString(),
    passed,
    reason: passed
      ? 'Appendix F (Pre-Employment Screening) complete and signed by HR Director.'
      : `BLOCKED — ${incomplete.length || 'all'} screening item(s) outstanding or HR Director signature missing. HR-TA-001 §6.4.4.`,
    missingEvidence: passed ? [] : [
      ...incomplete.map(i => `Appendix F item ${i.id}: ${i.label} (${i.status})`),
      ...(hasHrSig ? [] : ['HR Director signature on Appendix F']),
    ],
    policyRefs: ['HR-TA-001 §6.4', 'HR-TA-001 §6.7'],
    blockedUnitIds: [],
  };
}

export function evaluateGaoGate(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee,
): GateEvaluation {
  const mods = modulesForRole(emp.role).filter(m => m.group === 'GAO');
  const pending = mods.filter(m => !isModulePassed(m, latestAttempt([...snap.attempts], emp.id, m.id)));
  const passed = pending.length === 0;
  return {
    gate: 'gao_complete',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: snap.today.toISOString(),
    passed,
    reason: passed
      ? 'General Agency Orientation complete (all GAO modules + GAO-EXAM at ≥80%).'
      : `BLOCKED — ${pending.length} GAO module(s) not yet passed. HR-TA-005 §8.2 prohibits clinical assignment until GAO is complete.`,
    missingEvidence: pending.map(m => `${m.id} — ${m.title}`),
    policyRefs: ['HR-TA-005 §8.2', 'HR-TA-005 Appendix D'],
    blockedUnitIds: [],
  };
}

export function evaluateLicenseGate(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee,
): GateEvaluation {
  const valid  = isLicenseValid(emp, snap.today);
  const passed = valid;
  return {
    gate: 'license_valid',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: snap.today.toISOString(),
    passed,
    reason: !emp.licenseExpiry
      ? 'No clinical license required for this role.'
      : passed
        ? `License ${emp.licenseNumber ?? '(on file)'} valid through ${emp.licenseExpiry}.`
        : `BLOCKED — License ${emp.licenseNumber ?? ''} expired ${emp.licenseExpiry}. HR-TA-004 §6.2.5 requires immediate removal from clinical duties.`,
    missingEvidence: passed ? [] : [`Renewed license (current expiry: ${emp.licenseExpiry})`],
    policyRefs: ['HR-TA-004 §6.2'],
    blockedUnitIds: [],
  };
}

/** field_clearance — may this subject perform field/clinical work today? */
export function evaluateFieldClearance(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, _date: Date = snap.today,
): GateEvaluation {
  const apxF    = evaluateAppendixFGate(snap, emp);
  const license = evaluateLicenseGate(snap, emp);
  const cleared = emp.clearedForIndependentWork;
  const passed  = apxF.passed && license.passed && cleared;
  const missing: string[] = [];
  if (!apxF.passed)    missing.push('Appendix F clearance');
  if (!license.passed) missing.push('Valid clinical license');
  if (!cleared)        missing.push('DON/Supervisor signed Independent-Practice clearance');
  return {
    gate: 'field_clearance',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: _date.toISOString(),
    passed,
    reason: passed
      ? `Field-cleared as of ${_date.toISOString().slice(0,10)}.`
      : `BLOCKED — Subject is NOT field-cleared. ${missing.join('; ')}.`,
    missingEvidence: missing,
    policyRefs: ['HR-TA-001 §6.7', 'HR-TA-004 §6.2', 'HR-TA-005 §10'],
    blockedUnitIds: [],
  };
}

/** billing_clearance — may this subject's visits be billed under the agency NPI? */
export function evaluateBillingClearance(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee,
): GateEvaluation {
  const apxF    = evaluateAppendixFGate(snap, emp);
  const license = evaluateLicenseGate(snap, emp);
  const cleared = emp.clearedForIndependentWork;
  const oigOk   = apxF.passed; // Appendix F includes OIG/SAM check (HR-TA-003 Appendix A)
  const passed  = apxF.passed && license.passed && cleared && oigOk;
  const missing: string[] = [];
  if (!oigOk)          missing.push('OIG/SAM exclusion screening (Appendix F item)');
  if (!license.passed) missing.push('Active clinical license');
  if (!cleared)        missing.push('Independent-Practice clearance signed by DON');
  return {
    gate: 'billing_clearance',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: snap.today.toISOString(),
    passed,
    reason: passed
      ? 'Billing-cleared. OIG/SAM passed; license active; cleared for independent practice.'
      : `BLOCKED — Subject is NOT billing-cleared. ${missing.join('; ')}. Visits performed under this subject MUST NOT be billed (FCA exposure).`,
    missingEvidence: missing,
    policyRefs: ['HR-TA-003 §6.3', 'HR-TA-004 §6.2', 'CO-CP-001'],
    blockedUnitIds: [],
  };
}

/** system_access_clearance — may IT issue / retain EHR + portal access? */
export function evaluateSystemAccessClearance(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee,
): GateEvaluation {
  const apxF      = evaluateAppendixFGate(snap, emp);
  // GAO HIPAA modules:
  const hipaaMods = ['GAO-007','GAO-008','GAO-009','GAO-024'];
  const hipaaPass = hipaaMods.every(id => {
    const mod = ALL_MODULES.find(m => m.id === id);
    if (!mod) return true;
    return isModulePassed(mod, latestAttempt([...snap.attempts], emp.id, id));
  });
  const passed = apxF.passed && hipaaPass && !emp.terminated;
  const missing: string[] = [];
  if (!apxF.passed)  missing.push('Appendix F clearance');
  if (!hipaaPass)    missing.push('HIPAA / Security Awareness GAO modules (GAO-007/008/009/024)');
  if (emp.terminated) missing.push('Active employment status');
  return {
    gate: 'system_access_clearance',
    subjectId: emp.id,
    subjectName: emp.name,
    evaluatedAt: snap.today.toISOString(),
    passed,
    reason: passed
      ? 'System-access cleared. HIPAA + security awareness complete; employment active.'
      : `BLOCKED — System access must be revoked / withheld. ${missing.join('; ')}.`,
    missingEvidence: missing,
    policyRefs: ['CO-HP-001', 'CO-HP-002', 'IT-UP-004'],
    blockedUnitIds: [],
  };
}

/* ═══════════════════════════════════════════════════════════════
   UNIT FACTORY
   ═══════════════════════════════════════════════════════════════ */

const DAY_MS = 1000 * 60 * 60 * 24;

function dueDateFor(emp: JourneyEmployee, mod: JourneyModule): string {
  const start = emp.startDate ? new Date(emp.startDate) : new Date(emp.hireDate);
  const offsetDays =
    mod.group === 'GAO'      ? 5  :
    mod.group === 'ROLE'     ? (mod.week ?? 1) * 7 :
    mod.group === 'ANN'      ? 365 :
    mod.group === 'COMP'     ? 365 :
    mod.group === 'DRILL'    ? 180 : 30;
  return new Date(start.getTime() + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

function diffHoursToDueDate(dueIso: string, today: Date): number {
  return Math.round((new Date(dueIso).getTime() - today.getTime()) / (1000 * 60 * 60));
}

/* ───────────────────────────────────────────────────────────────
   Operational baseline + projection overlay
   --------------------------------------------------------------
   Factories MUST NOT compute `completed` from journey-store
   derivations. They produce a *baseline* operational state; the
   event-log projection then overlays final state. UNIT_COMPLETED
   is the ONLY event that can mark a unit completed.
   ─────────────────────────────────────────────────────────────── */

import type { OperationalState as _OperationalState } from './onboardingEvents';

interface BaselineInputs {
  due:        string;
  today:      Date;
  /** Hard gate failure that should baseline the unit as Blocked. */
  gateFailureReason?: string;
  /** Required signers exist for this unit. */
  hasSigners: boolean;
  /** Required evidence forms exist for this unit. */
  hasEvidence: boolean;
}

function baselineState(inp: BaselineInputs): _OperationalState {
  if (inp.gateFailureReason) return 'Blocked';
  if (inp.hasEvidence)       return 'AwaitingEvidence';
  if (inp.hasSigners)        return 'AwaitingSignature';
  // No evidence/signature requirements => InProgress until UNIT_COMPLETED arrives.
  const dueT = new Date(inp.due).getTime();
  if (dueT < inp.today.getTime()) return 'Blocked';
  return 'NotStarted';
}

/** Map operational state -> CES UI tags (state/phase/readiness). */
function operationalToCes(
  op: _OperationalState, due: string, today: Date,
): { state: ComplianceState; phase: WorkflowPhase; readiness: AuditReadiness } {
  switch (op) {
    case 'Completed':
      return { state: 'completed',          phase: 'audit',         readiness: 'ready' };
    case 'Blocked':
      return { state: 'blocked',            phase: 'documentation', readiness: 'not_ready' };
    case 'AwaitingSignature':
      return { state: 'awaiting_signature', phase: 'signature',     readiness: 'partial' };
    case 'AwaitingEvidence':
      return { state: 'in_progress',        phase: 'documentation', readiness: 'not_ready' };
    case 'InProgress':
      return { state: 'in_progress',        phase: 'documentation', readiness: 'partial' };
    case 'NotStarted':
    default: {
      const dueT = new Date(due).getTime(); const now = today.getTime();
      if (dueT <= now + 7  * DAY_MS) return { state: 'in_progress', phase: 'documentation', readiness: 'partial' };
      if (dueT <= now + 14 * DAY_MS) return { state: 'ready',       phase: 'preparation',   readiness: 'not_ready' };
      return { state: 'upcoming', phase: 'preparation', readiness: 'not_ready' };
    }
  }
}

/**
 * Combine baseline + projected operational state.
 * UNIT_COMPLETED in the projection is authoritative; otherwise the
 * projection's state wins when it represents a more advanced lifecycle
 * stage than the baseline.
 */
function resolveOperational(baseline: _OperationalState, proj: UnitProjection): _OperationalState {
  if (proj.state === 'Completed') return 'Completed';
  // A blocking event overrides everything else short of Completed.
  if (proj.state === 'Blocked')   return 'Blocked';
  // Otherwise prefer the projection if it has progressed past baseline.
  const order: _OperationalState[] = [
    'NotStarted', 'InProgress', 'AwaitingEvidence', 'AwaitingSignature', 'Blocked', 'Completed',
  ];
  const a = order.indexOf(baseline);
  const b = order.indexOf(proj.state);
  return b > a ? proj.state : baseline;
}

function buildModuleUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, mod: JourneyModule, eventId: string,
  fieldClearance: GateEvaluation, proj: UnitProjection,
): OnboardingExecutionUnit {
  const attempt    = latestAttempt([...snap.attempts], emp.id, mod.id);
  // EVENT-DRIVEN: completion ONLY from event log projection.
  const completed  = proj.state === 'Completed';
  const startGate  = canStartModule(emp, mod, [...snap.attempts]);
  const blockedByGate = !startGate.unlocked;
  const failed     = attempt?.status === 'failed';
  const due        = dueDateFor(emp, mod);
  const supSigReq  = !!mod.supervisorSignature;
  const hasEvidenceReq = !!(mod.evidenceAppendix && mod.evidenceAppendix !== 'NONE');
  const gateFailureReason = blockedByGate ? startGate.reason
    : failed ? `Module attempt failed (score ${attempt?.scoreRaw ?? 0}). Remediation required per HR-TD-003 §6.3.`
    : (mod.group === 'ROLE' && !fieldClearance.passed) ? fieldClearance.reason : undefined;

  const baseline = baselineState({
    due, today: snap.today, gateFailureReason,
    hasSigners: true, hasEvidence: hasEvidenceReq && proj.evidence.length === 0,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);

  const owner    = employeeOwner(emp);
  const approver = approverFor(emp);
  const sigOwner = supSigReq ? approver : owner;

  const signedRoles = new Set(proj.signatures.map(s => s.signerRole));
  const requiredSigners: RequiredSigner[] = [
    { userId: owner.userId,    name: owner.name,    initials: owner.initials,    role: owner.role,    status: signedRoles.has(owner.role) || completed ? 'signed' : 'pending' },
    ...(supSigReq ? [{ userId: approver.userId, name: approver.name, initials: approver.initials, role: approver.role, status: (signedRoles.has(approver.role) || completed) ? 'signed' as const : 'pending' as const }] : []),
  ];

  const blockedReason: BlockedReason | undefined = gateFailureReason
    ? blockedByGate ? { kind: 'dependency_incomplete', label: startGate.reason, resourceId: startGate.blockedBy?.[0] }
      : failed       ? { kind: 'awaiting_external_input', label: gateFailureReason }
      :                { kind: 'dependency_incomplete', label: gateFailureReason }
    : (operational === 'Blocked' && proj.blockedReason)
      ? { kind: 'dependency_incomplete', label: proj.blockedReason }
      : undefined;

  const evidenceStatus: EvidenceStatus = {
    requiredFormsTotal:    hasEvidenceReq ? 1 : 0,
    requiredFormsComplete: hasEvidenceReq ? Math.min(1, proj.evidence.length) : 0,
    missingFormIds:        hasEvidenceReq && proj.evidence.length === 0 ? [`Appendix:${mod.evidenceAppendix}`] : [],
    signaturesRequired:    requiredSigners.length,
    signaturesComplete:    requiredSigners.filter(s => s.status === 'signed').length,
    auditIndexCreated:     completed,
  };

  return {
    id: `eu-${emp.id}-${mod.id}`,
    title: `${mod.id} — ${mod.title} (${emp.name})`,
    parentEventId: eventId,
    workflowId: `wf-${mod.group.toLowerCase()}-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner, approver, signatureOwner: sigOwner,
    requiredSigners,
    blockedReason,
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus,
    domain: domainForRole(emp.role),
    // engine extensions:
    kind: mod.group === 'ANN' ? 'annual' : mod.group === 'DRILL' ? 'drill' : 'module',
    subjectEmployeeId: emp.id,
    subjectName: emp.name,
    subjectRole: emp.role,
    sourceId: mod.id,
    gateResults: [],
    policyRefs: mod.policyRefs,
  };
}

function buildAppendixFUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, eventId: string, gate: GateEvaluation,
  proj: UnitProjection,
): OnboardingExecutionUnit {
  const due = (emp.startDate ?? emp.hireDate);
  const completed = proj.state === 'Completed';
  const baseline = baselineState({
    due, today: snap.today,
    gateFailureReason: gate.passed ? undefined : gate.reason,
    hasSigners: true, hasEvidence: false,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);
  const owner = employeeOwner(emp);
  const signedRoles = new Set(proj.signatures.map(s => s.signerRole));

  return {
    id: `eu-${emp.id}-APXF`,
    title: `Pre-Employment Screening (Appendix F) — ${emp.name}`,
    parentEventId: eventId,
    workflowId: `wf-screening-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner, approver: HR_DIRECTOR, signatureOwner: HR_DIRECTOR,
    requiredSigners: [
      { userId: HR_DIRECTOR.userId, name: HR_DIRECTOR.name, initials: HR_DIRECTOR.initials, role: HR_DIRECTOR.role, status: (signedRoles.has(HR_DIRECTOR.role) || completed) ? 'signed' : 'pending' },
    ],
    blockedReason: completed ? undefined : { kind: 'missing_signature', label: gate.reason },
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus: {
      requiredFormsTotal: 1, requiredFormsComplete: completed ? 1 : 0,
      missingFormIds: completed ? [] : ['HR-TA-001 Appendix F'],
      signaturesRequired: 1, signaturesComplete: completed ? 1 : 0,
      auditIndexCreated: completed,
    },
    domain: 'hr',
    kind: 'appendix_f',
    subjectEmployeeId: emp.id, subjectName: emp.name, subjectRole: emp.role,
    sourceId: 'APPENDIX-F',
    gateResults: [gate],
    policyRefs: ['HR-TA-001 §6.4', 'HR-TA-001 §6.7'],
  };
}

function buildClearanceUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, eventId: string,
  gates: { field: GateEvaluation; gao: GateEvaluation }, proj: UnitProjection,
): OnboardingExecutionUnit {
  const cleared = canClearForIndependentWork(emp, [...snap.attempts], [...snap.supervisedVisits]);
  const completed = proj.state === 'Completed';
  const due       = emp.startDate
    ? new Date(new Date(emp.startDate).getTime() + 30 * DAY_MS).toISOString().slice(0,10)
    : new Date(snap.today.getTime() + 30 * DAY_MS).toISOString().slice(0,10);
  const baseline = baselineState({
    due, today: snap.today,
    gateFailureReason: cleared.ok ? undefined : (cleared.gaps[0] ?? gates.gao.reason),
    hasSigners: true, hasEvidence: false,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);
  const signedRoles = new Set(proj.signatures.map(s => s.signerRole));

  return {
    id: `eu-${emp.id}-CLEAR`,
    title: `Independent-Practice Clearance — ${emp.name} (${emp.role})`,
    parentEventId: eventId,
    workflowId: `wf-clearance-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner: employeeOwner(emp), approver: DON_OWNER, signatureOwner: DON_OWNER,
    requiredSigners: [
      { userId: DON_OWNER.userId, name: DON_OWNER.name, initials: DON_OWNER.initials, role: DON_OWNER.role, status: (signedRoles.has(DON_OWNER.role) || completed) ? 'signed' : 'pending' },
    ],
    blockedReason: operational === 'Blocked'
      ? { kind: 'dependency_incomplete', label: cleared.gaps[0] ?? gates.gao.reason }
      : undefined,
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus: {
      requiredFormsTotal: 1, requiredFormsComplete: completed ? 1 : 0,
      missingFormIds: completed ? [] : ['HR-TA-005 Appendix B'],
      signaturesRequired: 1, signaturesComplete: completed ? 1 : 0,
      auditIndexCreated: completed,
    },
    domain: domainForRole(emp.role),
    kind: 'clearance',
    subjectEmployeeId: emp.id, subjectName: emp.name, subjectRole: emp.role,
    sourceId: 'CLEARANCE',
    gateResults: [gates.field, gates.gao],
    policyRefs: ['HR-TA-005 §10', 'HR-TD-003 §6'],
  };
}

function buildLicenseUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, eventId: string, gate: GateEvaluation,
  proj: UnitProjection,
): OnboardingExecutionUnit | null {
  if (!emp.licenseExpiry) return null;
  const expiry = new Date(emp.licenseExpiry);
  const daysLeft = (expiry.getTime() - snap.today.getTime()) / DAY_MS;
  if (daysLeft > 120) return null;
  const completed = proj.state === 'Completed';
  const due       = emp.licenseExpiry;
  const baseline = baselineState({
    due, today: snap.today,
    gateFailureReason: daysLeft <= 0 ? gate.reason : undefined,
    hasSigners: true, hasEvidence: true,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);
  const signedRoles = new Set(proj.signatures.map(s => s.signerRole));
  return {
    id: `eu-${emp.id}-LIC`,
    title: `License Renewal — ${emp.name} (${emp.licenseType ?? 'License'})`,
    parentEventId: eventId,
    workflowId: `wf-license-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner: employeeOwner(emp), approver: HR_DIRECTOR, signatureOwner: HR_DIRECTOR,
    requiredSigners: [
      { userId: HR_DIRECTOR.userId, name: HR_DIRECTOR.name, initials: HR_DIRECTOR.initials, role: HR_DIRECTOR.role, status: (signedRoles.has(HR_DIRECTOR.role) || completed) ? 'signed' : 'pending' },
    ],
    blockedReason: operational === 'Blocked' ? { kind: 'missing_form', label: gate.reason } : undefined,
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus: {
      requiredFormsTotal: 1, requiredFormsComplete: proj.evidence.length > 0 ? 1 : 0,
      missingFormIds: proj.evidence.length > 0 ? [] : ['HR-TA-004 Appendix B'],
      signaturesRequired: 1, signaturesComplete: completed ? 1 : 0, auditIndexCreated: completed,
    },
    domain: 'hr',
    kind: 'license_renewal',
    subjectEmployeeId: emp.id, subjectName: emp.name, subjectRole: emp.role,
    sourceId: emp.licenseNumber ?? 'LIC',
    gateResults: [gate],
    policyRefs: ['HR-TA-004 §6.2'],
  };
}

function buildSupervisedVisitUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, mod: JourneyModule, eventId: string,
  proj: UnitProjection,
): OnboardingExecutionUnit | null {
  const required = mod.supervisedVisitsRequired ?? 0;
  if (required === 0) return null;
  const completedVisits = snap.supervisedVisits.filter(v => v.employeeId === emp.id && v.rating === 'SATISFACTORY').length;
  const completed = proj.state === 'Completed';
  const due       = dueDateFor(emp, mod);
  const baseline = baselineState({
    due, today: snap.today,
    gateFailureReason: undefined,
    hasSigners: true,
    hasEvidence: completedVisits < required,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);
  return {
    id: `eu-${emp.id}-SUP-${mod.id}`,
    title: `Supervised Visits — ${emp.name} (${completedVisits}/${required})`,
    parentEventId: eventId,
    workflowId: `wf-supervised-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner: employeeOwner(emp), approver: DON_OWNER, signatureOwner: DON_OWNER,
    requiredSigners: [
      { userId: DON_OWNER.userId, name: DON_OWNER.name, initials: DON_OWNER.initials, role: DON_OWNER.role, status: completed ? 'signed' : 'pending' },
    ],
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus: {
      requiredFormsTotal: required,
      requiredFormsComplete: Math.min(completedVisits, required),
      missingFormIds: completedVisits >= required ? [] : ['HR-TA-005 Appendix E'],
      signaturesRequired: required,
      signaturesComplete: Math.min(completedVisits, required),
      auditIndexCreated: completed,
    },
    domain: domainForRole(emp.role),
    kind: 'supervised_visit',
    subjectEmployeeId: emp.id, subjectName: emp.name, subjectRole: emp.role,
    sourceId: mod.id,
    gateResults: [],
    policyRefs: ['HR-TA-005 §6.1.2'],
  };
}

function buildRemediationUnit(
  snap: OnboardingEngineSnapshot, emp: JourneyEmployee, plan: RemediationPlan, eventId: string,
  proj: UnitProjection,
): OnboardingExecutionUnit {
  const completed = proj.state === 'Completed';
  const failed    = plan.status === 'Failed';
  const due       = plan.dueBy;
  const baseline = baselineState({
    due, today: snap.today,
    gateFailureReason: failed ? 'Remediation plan FAILED. HR-TD-003 §6.3 escalation required.' : undefined,
    hasSigners: true, hasEvidence: false,
  });
  const operational = resolveOperational(baseline, proj);
  const phase = operationalToCes(operational, due, snap.today);
  return {
    id: `eu-${emp.id}-REM-${plan.id}`,
    title: `Remediation: ${plan.moduleId} — ${emp.name}`,
    parentEventId: eventId,
    workflowId: `wf-remediation-${emp.role}`,
    workflowPhase: phase.phase,
    complianceState: phase.state,
    auditReadiness: phase.readiness,
    owner: employeeOwner(emp), approver: DON_OWNER, signatureOwner: DON_OWNER,
    requiredSigners: [
      { userId: DON_OWNER.userId, name: DON_OWNER.name, initials: DON_OWNER.initials, role: DON_OWNER.role, status: completed ? 'signed' : 'pending' },
    ],
    blockedReason: operational === 'Blocked'
      ? { kind: 'dependency_incomplete', label: failed ? 'Remediation plan FAILED. HR-TD-003 §6.3 escalation required.' : (proj.blockedReason ?? 'Remediation blocked.') }
      : undefined,
    dueDate: due,
    escalationTimer: diffHoursToDueDate(due, snap.today),
    evidenceStatus: {
      requiredFormsTotal: 1, requiredFormsComplete: completed ? 1 : 0,
      missingFormIds: completed ? [] : ['HR-TD-003 Appendix C'],
      signaturesRequired: 1, signaturesComplete: completed ? 1 : 0,
      auditIndexCreated: completed,
    },
    domain: domainForRole(emp.role),
    kind: 'remediation',
    subjectEmployeeId: emp.id, subjectName: emp.name, subjectRole: emp.role,
    sourceId: plan.id,
    gateResults: [],
    policyRefs: ['HR-TD-003 §6.3'],
  };
}

/* ═══════════════════════════════════════════════════════════════
   ENGINE — pure builder over a snapshot
   ═══════════════════════════════════════════════════════════════ */

export function buildBatches(
  snap: OnboardingEngineSnapshot,
  log: readonly OnboardingEvent[] = [],
): OnboardingExecutionBatch[] {
  const batches: OnboardingExecutionBatch[] = [];

  /* Build per-unit projection cache once. */
  const projectionFor = (unitId: string): UnitProjection => projectUnit(unitId, log);

  for (const emp of snap.employees) {
    if (emp.terminated) continue;
    const eventId = `evt-onboarding-${emp.id}`;

    const gateAppF   = evaluateAppendixFGate(snap, emp);
    const gateGao    = evaluateGaoGate(snap, emp);
    const gateLic    = evaluateLicenseGate(snap, emp);
    const gateField  = evaluateFieldClearance(snap, emp);
    const gateBill   = evaluateBillingClearance(snap, emp);
    const gateSys    = evaluateSystemAccessClearance(snap, emp);

    const units: OnboardingExecutionUnit[] = [];

    // Appendix F unit (always present until UNIT_COMPLETED event)
    {
      const id = `eu-${emp.id}-APXF`;
      const proj = projectionFor(id);
      if (proj.state !== 'Completed') units.push(buildAppendixFUnit(snap, emp, eventId, gateAppF, proj));
    }

    // Active modules for the role
    const mods = modulesForRole(emp.role);
    for (const mod of mods) {
      const id = mod.phase === 'SUPERVISED'
        ? `eu-${emp.id}-SUP-${mod.id}` : `eu-${emp.id}-${mod.id}`;
      const proj = projectionFor(id);
      if (mod.phase === 'SUPERVISED') {
        const u = buildSupervisedVisitUnit(snap, emp, mod, eventId, proj);
        if (u && proj.state !== 'Completed') units.push(u);
        continue;
      }
      // Hide completed non-recurring modules; recurring kinds (ANN/COMP/DRILL) always surface.
      if (proj.state === 'Completed' && mod.group !== 'ANN' && mod.group !== 'COMP' && mod.group !== 'DRILL') continue;
      units.push(buildModuleUnit(snap, emp, mod, eventId, gateField, proj));
    }

    // License renewal (only when within 120-day window or expired)
    {
      const id = `eu-${emp.id}-LIC`;
      const proj = projectionFor(id);
      const licUnit = buildLicenseUnit(snap, emp, eventId, gateLic, proj);
      if (licUnit && proj.state !== 'Completed') units.push(licUnit);
    }

    // Independent-practice clearance unit
    {
      const id = `eu-${emp.id}-CLEAR`;
      const proj = projectionFor(id);
      units.push(buildClearanceUnit(snap, emp, eventId, { field: gateField, gao: gateGao }, proj));
    }

    // Open remediation plans
    for (const plan of snap.remediationPlans) {
      if (plan.employeeId !== emp.id) continue;
      if (plan.status !== 'Open') continue;
      const id = `eu-${emp.id}-REM-${plan.id}`;
      const proj = projectionFor(id);
      units.push(buildRemediationUnit(snap, emp, plan, eventId, proj));
    }

    /* ── Wire blocked-unit-id list back into gate results ── */
    const blockedIds = units.filter(u => u.complianceState === 'blocked').map(u => u.id);
    const wireBlocked = (g: GateEvaluation): GateEvaluation =>
      g.passed ? g : { ...g, blockedUnitIds: blockedIds };
    const gates: GateEvaluation[] = [
      wireBlocked(gateAppF), wireBlocked(gateGao), wireBlocked(gateLic),
      wireBlocked(gateField), wireBlocked(gateBill), wireBlocked(gateSys),
    ];

    const open              = units.filter(u => u.complianceState !== 'completed').length;
    const blocked           = units.filter(u => u.complianceState === 'blocked').length;
    const awaitingSignature = units.filter(u => u.complianceState === 'awaiting_signature').length;
    const completed         = units.filter(u => u.complianceState === 'completed').length;
    const nextDue = units
      .filter(u => u.complianceState !== 'completed')
      .map(u => u.dueDate)
      .sort()[0] ?? null;

    batches.push({
      batchId: `batch-${emp.id}`,
      subjectEmployeeId: emp.id,
      subjectName: emp.name,
      subjectRole: emp.role,
      hireDate: emp.hireDate,
      startDate: emp.startDate,
      units,
      gates,
      eventId,
      nextDueDate: nextDue,
      totals: { open, blocked, awaitingSignature, completed },
    });
  }

  return batches;
}

/* ═══════════════════════════════════════════════════════════════
   GATE ENFORCEMENT API (callable by external systems)
   --------------------------------------------------------------
   Each function accepts the snapshot + subject employee id and
   returns a GateEvaluation. Blocked unit ids are populated so
   external systems (billing, IT provisioning, scheduling) can
   refuse the action and cite the precise execution units that
   must be cleared first.
   ═══════════════════════════════════════════════════════════════ */

function findEmp(snap: OnboardingEngineSnapshot, subjectId: string): JourneyEmployee | undefined {
  return snap.employees.find(e => e.id === subjectId);
}

function gateWithBlocked(
  snap: OnboardingEngineSnapshot, gate: GateEvaluation, subjectId: string,
): GateEvaluation {
  if (gate.passed) return gate;
  const log     = getOnboardingEventLog();
  const batches = buildBatches(snap, log);
  const batch   = batches.find(b => b.subjectEmployeeId === subjectId);
  const blocked = batch ? batch.units.filter(u => u.complianceState === 'blocked').map(u => u.id) : [];
  return { ...gate, blockedUnitIds: blocked };
}

export function getFieldClearance(
  snap: OnboardingEngineSnapshot, subjectId: string, date?: Date,
): GateEvaluation {
  const emp = findEmp(snap, subjectId);
  if (!emp) {
    return {
      gate: 'field_clearance', subjectId, subjectName: subjectId,
      evaluatedAt: (date ?? snap.today).toISOString(),
      passed: false, reason: 'Subject not found.', missingEvidence: ['Employee record'],
      policyRefs: [], blockedUnitIds: [],
    };
  }
  return gateWithBlocked(snap, evaluateFieldClearance(snap, emp, date), subjectId);
}

export function getBillingClearance(
  snap: OnboardingEngineSnapshot, subjectId: string,
): GateEvaluation {
  const emp = findEmp(snap, subjectId);
  if (!emp) {
    return {
      gate: 'billing_clearance', subjectId, subjectName: subjectId,
      evaluatedAt: snap.today.toISOString(), passed: false,
      reason: 'Subject not found.', missingEvidence: ['Employee record'],
      policyRefs: [], blockedUnitIds: [],
    };
  }
  return gateWithBlocked(snap, evaluateBillingClearance(snap, emp), subjectId);
}

export function getSystemAccessClearance(
  snap: OnboardingEngineSnapshot, subjectId: string,
): GateEvaluation {
  const emp = findEmp(snap, subjectId);
  if (!emp) {
    return {
      gate: 'system_access_clearance', subjectId, subjectName: subjectId,
      evaluatedAt: snap.today.toISOString(), passed: false,
      reason: 'Subject not found.', missingEvidence: ['Employee record'],
      policyRefs: [], blockedUnitIds: [],
    };
  }
  return gateWithBlocked(snap, evaluateSystemAccessClearance(snap, emp), subjectId);
}

/* ═══════════════════════════════════════════════════════════════
   eCIgn ENFORCEMENT — only path to UNIT_COMPLETED
   ═══════════════════════════════════════════════════════════════ */

export interface SignatureCompletedInput {
  unitId:    string;
  signature: SignatureArtifact;
}

export interface SignatureCompletedResult {
  accepted:   boolean;
  reason?:    string;
  emitted:    OnboardingEvent[];
}

/**
 * Authoritative signature handler. ALL completion flows go through
 * this function. Validates signer + evidence presence, appends a
 * SIGNATURE_COMPLETED event, and (if all required signers + evidence
 * are present) emits UNIT_COMPLETED.
 */
export function handleSignatureCompleted(
  snap: OnboardingEngineSnapshot, input: SignatureCompletedInput,
): SignatureCompletedResult {
  const log     = getOnboardingEventLog();
  const batches = buildBatches(snap, log);
  const unit    = batches.flatMap(b => b.units).find(u => u.id === input.unitId);
  if (!unit) {
    return { accepted: false, reason: `Unit ${input.unitId} not found.`, emitted: [] };
  }

  // Validate signer is required for this unit.
  const signerOk = unit.requiredSigners.some(rs =>
    rs.userId === input.signature.signerUserId || rs.role === input.signature.signerRole,
  );
  if (!signerOk) {
    return { accepted: false,
      reason: `Signer role ${input.signature.signerRole} is not a required signer for unit ${input.unitId}.`,
      emitted: [] };
  }

  // Validate signature artefact has the minimum fields.
  if (!input.signature.signatureId || !input.signature.signedAt) {
    return { accepted: false,
      reason: 'Invalid signature artefact: missing eCIgn signatureId or signedAt.',
      emitted: [] };
  }

  // Validate evidence presence.
  const proj = projectUnit(input.unitId, log);
  if (unit.evidenceStatus.requiredFormsTotal > 0 && proj.evidence.length === 0) {
    // Move to AwaitingEvidence and refuse signature until evidence captured.
    const blockedEv = useOnboardingEventStore.getState().append({
      kind: 'EVIDENCE_REJECTED', unitId: input.unitId,
      subjectEmployeeId: unit.subjectEmployeeId,
      payload: { reason: 'Signature attempted without evidence; reverting to AwaitingEvidence.' },
    });
    return { accepted: false,
      reason: 'Required evidence missing — capture evidence before signing.',
      emitted: [blockedEv] };
  }

  /* Accept: append signature, then check completion. */
  const sigEv = useOnboardingEventStore.getState().append({
    kind: 'SIGNATURE_COMPLETED', unitId: input.unitId,
    subjectEmployeeId: unit.subjectEmployeeId,
    payload: { signature: input.signature },
  });

  // Recompute projection with this new event applied.
  const projAfter = projectUnit(input.unitId, [...log, sigEv]);
  const requiredRoles = new Set(unit.requiredSigners.map(rs => rs.role));
  const signedRoles   = new Set(projAfter.signatures.map(s => s.signerRole));
  const allSigned     = Array.from(requiredRoles).every(r => signedRoles.has(r));

  const emitted: OnboardingEvent[] = [sigEv];
  if (allSigned) {
    const completeEv = useOnboardingEventStore.getState().append({
      kind: 'UNIT_COMPLETED', unitId: input.unitId,
      subjectEmployeeId: unit.subjectEmployeeId,
      payload: { signatureId: input.signature.signatureId },
    });
    emitted.push(completeEv);
  }
  return { accepted: true, emitted };
}

/* ═══════════════════════════════════════════════════════════════
   BATCH FINALIZATION (strict)
   --------------------------------------------------------------
   May ONLY succeed when:
     • every unit in the batch has UNIT_COMPLETED
     • every gate (Appendix F, GAO, License, Field, Billing, SysAccess)
       passes
     • every required signature is verified in the event log
   No auto-completion; the function emits a single BATCH_COMPLETED
   event when all preconditions are met.
   ═══════════════════════════════════════════════════════════════ */

export interface FinalizeBatchResult {
  finalized:        boolean;
  reason?:          string;
  unmetUnitIds:     readonly string[];
  failedGateKinds:  readonly GateKind[];
  emitted:          OnboardingEvent[];
}

export function finalizeBatch(
  snap: OnboardingEngineSnapshot, batchId: string,
): FinalizeBatchResult {
  const log     = getOnboardingEventLog();
  const batches = buildBatches(snap, log);
  const batch   = batches.find(b => b.batchId === batchId);
  if (!batch) {
    return { finalized: false, reason: `Batch ${batchId} not found.`,
      unmetUnitIds: [], failedGateKinds: [], emitted: [] };
  }

  const unmet = batch.units
    .filter(u => projectUnit(u.id, log).state !== 'Completed')
    .map(u => u.id);

  const failedGates = batch.gates.filter(g => !g.passed).map(g => g.gate);

  if (unmet.length > 0 || failedGates.length > 0) {
    return {
      finalized: false,
      reason: unmet.length > 0
        ? `Batch cannot finalize: ${unmet.length} unit(s) lack UNIT_COMPLETED.`
        : `Batch cannot finalize: ${failedGates.length} gate(s) failed.`,
      unmetUnitIds: unmet,
      failedGateKinds: failedGates,
      emitted: [],
    };
  }

  const ev = useOnboardingEventStore.getState().append({
    kind: 'BATCH_COMPLETED', batchId,
    subjectEmployeeId: batch.subjectEmployeeId,
    payload: { unitIds: batch.units.map(u => u.id) },
  });
  return { finalized: true, unmetUnitIds: [], failedGateKinds: [], emitted: [ev] };
}

/* ═══════════════════════════════════════════════════════════════
   PUBLIC ENGINE API
   ═══════════════════════════════════════════════════════════════ */

export interface OnboardingEngine {
  /** Flat list of every onboarding execution unit. */
  getExecutionUnits: () => readonly OnboardingExecutionUnit[];
  /** Per-employee batches. */
  getBatches:        () => readonly OnboardingExecutionBatch[];
  /** Flat list of every gate evaluation across all employees. */
  getGateEvaluations: () => readonly GateEvaluation[];
  /** Snapshot the engine ran against (for diagnostics). */
  snapshot:          OnboardingEngineSnapshot;
  /** Synthetic onboarding events used to group units on the calendar. */
  events:            readonly { id: string; title: string; anchorDate: string; subjectEmployeeId: string; domain: ComplianceDomain }[];
  /** External gate API. */
  getFieldClearance:        (subjectId: string, date?: Date) => GateEvaluation;
  getBillingClearance:      (subjectId: string) => GateEvaluation;
  getSystemAccessClearance: (subjectId: string) => GateEvaluation;
  /** eCIgn signature handler — only path to UNIT_COMPLETED. */
  handleSignatureCompleted: (input: SignatureCompletedInput) => SignatureCompletedResult;
  /** Strict batch finalization. */
  finalizeBatch:            (batchId: string) => FinalizeBatchResult;
}

/** React hook — wires the journey store + event log into a memoised engine. */
export function useOnboardingEngine(): OnboardingEngine {
  const employees        = useJourneyStore(s => s.employees);
  const attempts         = useJourneyStore(s => s.attempts);
  const supervisedVisits = useJourneyStore(s => s.supervisedVisits);
  const escalations      = useJourneyStore(s => s.escalations);
  const remediationPlans = useJourneyStore(s => s.remediationPlans);
  const appendixF        = useJourneyStore(s => s.appendixF);
  const appendixFSig     = useJourneyStore(s => s.appendixFSignatures);
  const log              = useOnboardingEventStore(s => s.log);

  return useMemo(() => {
    const snap: OnboardingEngineSnapshot = {
      today: TODAY_ANCHOR,
      employees, attempts, supervisedVisits, escalations, remediationPlans,
      appendixF,
      appendixFSignatures: appendixFSig as unknown as Readonly<Record<string, ReadonlyArray<{ role: string; signedAt?: string; name?: string }>>>,
    };
    const batches = buildBatches(snap, log);
    const units   = batches.flatMap(b => b.units);
    const gates   = batches.flatMap(b => b.gates);
    const events  = batches.map(b => ({
      id:          b.eventId,
      title:       `Onboarding — ${b.subjectName} (${b.subjectRole})`,
      anchorDate:  b.nextDueDate ?? (b.startDate ?? b.hireDate),
      subjectEmployeeId: b.subjectEmployeeId,
      domain:      domainForRole(b.subjectRole),
    }));

    return {
      getExecutionUnits:  () => units,
      getBatches:         () => batches,
      getGateEvaluations: () => gates,
      snapshot:           snap,
      events,
      getFieldClearance:        (id, date) => getFieldClearance(snap, id, date),
      getBillingClearance:      (id)       => getBillingClearance(snap, id),
      getSystemAccessClearance: (id)       => getSystemAccessClearance(snap, id),
      handleSignatureCompleted: (input)    => handleSignatureCompleted(snap, input),
      finalizeBatch:            (batchId)  => finalizeBatch(snap, batchId),
    };
  }, [employees, attempts, supervisedVisits, escalations, remediationPlans, appendixF, appendixFSig, log]);
}
