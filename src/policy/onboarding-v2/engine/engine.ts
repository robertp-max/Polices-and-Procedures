/* ═══════════════════════════════════════════════════════════════
   Onboarding V2 Engine — Trigger → Profile → Template → Batch → Unit
   ═══════════════════════════════════════════════════════════════ */
import type {
  BatchStatus, OnboardingExecutionBatch, OnboardingExecutionUnit, OnboardingProfile,
  OnboardingSnapshot, RoleId, TriggerPayload, UnitStatus, WorkforceMember, Vendor,
} from '../types';
import { ROLES } from '../catalog/roles';
import { getRequirement } from '../catalog/requirements';
import { selectTemplate } from '../catalog/templates';
import { appendAudit } from './audit';
import { nextUlid } from './hash';
import { reconcile } from './reconciler';

/** Effective owner for emitted units — Compliance Officer by default. */
function defaultOwner(_snap: OnboardingSnapshot): { id: string; name: string } {
  return { id: 'USR-CO', name: 'Compliance Officer' };
}

function domainsForRoles(roleIds: RoleId[]) {
  return Array.from(new Set(roleIds.map(r => ROLES.find(x => x.id === r)?.domain).filter(Boolean) as string[])) as ('EN' | 'CL' | 'OP' | 'FN' | 'RM' | 'CO' | 'IT' | 'QA' | 'HR')[];
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function rolesFromTrigger(t: TriggerPayload): RoleId[] {
  switch (t.type) {
    case 'NEW_HIRE':              return t.roleIds;
    case 'ROLE_CHANGE':           return t.newRoleIds;
    case 'REACTIVATION':          return [];
    case 'ANNUAL_REVALIDATION':   return [];
    case 'CREDENTIAL_EXPIRY_WINDOW': return [];
    case 'POLICY_VERSION_CHANGE': return [];
    case 'SCOPE_EXPANSION':       return [];
    case 'VENDOR_ONBOARD':        return ['VENDOR'];
    case 'GOVERNANCE_APPOINTMENT': return [t.roleId];
  }
}

function effectiveDateOf(t: TriggerPayload, now: string): string {
  switch (t.type) {
    case 'NEW_HIRE':
    case 'ROLE_CHANGE':
    case 'REACTIVATION':
    case 'VENDOR_ONBOARD':
    case 'GOVERNANCE_APPOINTMENT':
      return t.effectiveDate;
    default: return now;
  }
}

export interface IngestResult {
  batches: OnboardingExecutionBatch[];
  units: OnboardingExecutionUnit[];
  suppressedRequirementIds: string[];
}

/** The single entrypoint: ingest a trigger, mutate snapshot in place, return what was emitted. */
export function ingestTrigger(
  snap: OnboardingSnapshot,
  trigger: TriggerPayload,
  opts: { branchId?: string; now?: string } = {},
): IngestResult {
  const now = opts.now ?? new Date().toISOString();
  const subjectId = ('subjectId' in trigger) ? trigger.subjectId : 'AGENCY';
  const subjectType = trigger.type === 'VENDOR_ONBOARD' ? 'Vendor' : 'Workforce';

  appendAudit(snap, {
    eventType: 'TRIGGER_RECEIVED', subjectId,
    payload: { trigger },
  }, now);

  const roleIds = rolesFromTrigger(trigger);
  if (roleIds.length === 0) {
    return { batches: [], units: [], suppressedRequirementIds: [] };
  }

  const branchId = opts.branchId ?? (snap.workforce.find(w => w.id === subjectId)?.branchId ?? 'BR-MAIN');
  const effectiveDate = effectiveDateOf(trigger, now);

  const profile: OnboardingProfile = {
    id: nextUlid('PROF'),
    subjectId,
    subjectType,
    roleIds,
    domains: domainsForRoles(roleIds),
    serviceLines: [],
    patientPopulations: [],
    branchId,
    effectiveDate,
    createdAt: now,
  };
  snap.profiles.push(profile);
  appendAudit(snap, {
    eventType: 'PROFILE_RESOLVED', subjectId,
    payload: { profileId: profile.id, roleIds, effectiveDate },
  }, now);

  const owner = defaultOwner(snap);
  const emittedBatches: OnboardingExecutionBatch[] = [];
  const emittedUnits: OnboardingExecutionUnit[] = [];
  const suppressed: string[] = [];

  for (const roleId of roleIds) {
    const tpl = selectTemplate(roleId, trigger.type);
    if (!tpl) continue;

    appendAudit(snap, {
      eventType: 'TEMPLATE_SELECTED', subjectId,
      payload: { templateId: tpl.id, version: tpl.version, requirementCount: tpl.requirementIds.length },
    }, now);

    const batchId = nextUlid('BATCH');
    const dueAt = addDays(effectiveDate, 30);
    const batch: OnboardingExecutionBatch = {
      id: batchId,
      subjectId,
      subjectType,
      profileId: profile.id,
      templateId: tpl.id,
      templateVersion: tpl.version,
      triggerType: trigger.type,
      triggerPayload: trigger as unknown as Record<string, unknown>,
      ownerId: owner.id,
      ownerName: owner.name,
      createdAt: now,
      dueAt,
      status: 'PendingActivation',
      readinessContribution: 0,
      cesSprintIds: [],
    };
    snap.batches.push(batch);
    emittedBatches.push(batch);
    appendAudit(snap, {
      eventType: 'BATCH_CREATED', subjectId, batchId,
      payload: { templateId: tpl.id, role: roleId, dueAt },
    }, now);

    for (const reqId of tpl.requirementIds) {
      const req = getRequirement(reqId);
      if (!req) continue;

      const recon = reconcile(snap, subjectId, req, now);
      const unitId = nextUlid('UN');
      const unit: OnboardingExecutionUnit = {
        id: unitId,
        batchId,
        requirementId: req.id,
        workflowId: req.workflowId,
        workflowVersion: req.version,
        assigneeId: owner.id,
        assigneeName: owner.name,
        dueAt: addDays(effectiveDate, req.slaDays),
        priority: req.gateContributions.some(g => g.weight === 'Required') ? 'Critical' : 'Normal',
        dependencies: (req.preConditions ?? []).map(_ => ''),  // resolved post-emission
        evidenceRequired: req.evidenceSchema,
        signatureRequired: req.signatureSpecs,
        status: recon.suppress ? 'Suppressed' : 'NotStarted',
        attempts: [],
        evidenceObjectIds: recon.evidenceId ? [recon.evidenceId] : [],
        signatureRecordIds: [],
        phase: req.phase,
        policyRefs: req.policyRefs,
      };
      snap.units.push(unit);
      emittedUnits.push(unit);

      if (recon.suppress) {
        suppressed.push(req.id);
        appendAudit(snap, {
          eventType: 'REQUIREMENT_RECONCILED', subjectId, batchId, unitId,
          payload: { requirementId: req.id, reason: recon.reason, evidenceId: recon.evidenceId },
        }, now);
      } else {
        appendAudit(snap, {
          eventType: 'REQUIREMENT_EMITTED', subjectId, batchId, unitId,
          payload: { requirementId: req.id, dueAt: unit.dueAt, priority: unit.priority },
        }, now);
      }
    }

    // Resolve unit dependencies post-emission (preconditions → unit IDs in the same batch)
    const batchUnits = snap.units.filter(u => u.batchId === batchId);
    for (const unit of batchUnits) {
      const req = getRequirement(unit.requirementId);
      if (!req?.preConditions) continue;
      unit.dependencies = req.preConditions
        .map(precondReqId => batchUnits.find(u => u.requirementId === precondReqId)?.id)
        .filter((x): x is string => Boolean(x));
    }

    batch.status = computeBatchStatus(emittedUnits.filter(u => u.batchId === batchId));
  }

  return { batches: emittedBatches, units: emittedUnits, suppressedRequirementIds: suppressed };
}

/** Compute aggregate batch status from its units. */
export function computeBatchStatus(units: OnboardingExecutionUnit[]): BatchStatus {
  const active = units.filter(u => u.status !== 'Suppressed');
  if (active.length === 0) return 'Completed';
  if (active.every(u => u.status === 'Completed')) return 'Completed';
  if (active.some(u => u.status === 'Blocked')) return 'Blocked';
  if (active.some(u => u.status === 'AwaitingSignature')) return 'AwaitingSignature';
  if (active.some(u => u.status === 'AwaitingEvidence')) return 'AwaitingEvidence';
  if (active.some(u => u.status === 'AtRisk')) return 'AtRisk';
  if (active.every(u => u.status === 'NotStarted')) return 'PendingActivation';
  return 'InProgress';
}

/** Mutate a unit's status with audit emission. */
export function changeUnitStatus(
  snap: OnboardingSnapshot,
  unitId: string,
  next: UnitStatus,
  actor: { id: string; name: string },
  payload: Record<string, unknown> = {},
  now: string = new Date().toISOString(),
): void {
  const unit = snap.units.find(u => u.id === unitId);
  if (!unit) return;
  const batch = snap.batches.find(b => b.id === unit.batchId);
  const prev = unit.status;
  unit.status = next;
  if (next === 'InProgress' && !unit.startedAt) unit.startedAt = now;
  if (next === 'Completed') unit.completedAt = now;
  appendAudit(snap, {
    eventType: 'UNIT_STATE_CHANGED',
    subjectId: batch?.subjectId,
    batchId: unit.batchId,
    unitId: unit.id,
    actorId: actor.id, actorName: actor.name,
    payload: { from: prev, to: next, ...payload },
  }, now);
  if (batch) {
    const batchUnits = snap.units.filter(u => u.batchId === batch.id);
    batch.status = computeBatchStatus(batchUnits);
    if (batch.status === 'Completed' && !batch.sealedAt) {
      batch.sealedAt = now;
      batch.readinessContribution = 1;
      appendAudit(snap, {
        eventType: 'BATCH_COMPLETED', subjectId: batch.subjectId, batchId: batch.id,
        payload: { sealedAt: now },
      }, now);
    }
  }
}

/** Subject helper. */
export function getSubject(snap: OnboardingSnapshot, subjectId: string): WorkforceMember | Vendor | undefined {
  return snap.workforce.find(w => w.id === subjectId) ?? snap.vendors.find(v => v.id === subjectId);
}
