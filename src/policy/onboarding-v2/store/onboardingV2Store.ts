import { create } from 'zustand';
import type {
  EvidenceObject, OnboardingExecutionBatch, OnboardingExecutionUnit,
  OnboardingSnapshot, SignatureRecord, TriggerPayload, UnitStatus,
} from '../types';
import { buildSeedSnapshot } from './seed';
import { ingestTrigger, changeUnitStatus, computeBatchStatus } from '../engine/engine';
import { evaluateGate, type GateResult } from '../engine/gates';
import { appendAudit } from '../engine/audit';
import { fauxHash, nextUlid } from '../engine/hash';

interface OnboardingV2Store {
  snap: OnboardingSnapshot;

  // selectors
  getBatch: (id: string) => OnboardingExecutionBatch | undefined;
  getUnit:  (id: string) => OnboardingExecutionUnit | undefined;
  unitsForBatch: (batchId: string) => OnboardingExecutionUnit[];
  evidenceForUnit: (unitId: string) => EvidenceObject[];
  signaturesForUnit: (unitId: string) => SignatureRecord[];
  evaluateAllGates: (subjectId: string) => GateResult[];

  // actions
  ingest: (trigger: TriggerPayload, opts?: { branchId?: string }) => void;
  setUnitStatus: (unitId: string, next: UnitStatus, payload?: Record<string, unknown>) => void;
  captureEvidence: (
    unitId: string,
    objectType: EvidenceObject['objectType'],
    filename: string,
    source: EvidenceObject['source'],
  ) => EvidenceObject;
  rejectEvidence: (evidenceId: string, reason: string) => void;
  signSignature: (signatureId: string) => void;
  declineSignature: (signatureId: string, reason: string) => void;
  requestOverride: (subjectId: string, gateId: string, reason: string, validDays: number) => void;
}

export const useOnboardingV2Store = create<OnboardingV2Store>()((set, get) => ({
  snap: buildSeedSnapshot(),

  getBatch: (id) => get().snap.batches.find(b => b.id === id),
  getUnit:  (id) => get().snap.units.find(u => u.id === id),
  unitsForBatch: (batchId) => get().snap.units.filter(u => u.batchId === batchId),
  evidenceForUnit: (unitId) => get().snap.evidence.filter(e => e.unitId === unitId),
  signaturesForUnit: (unitId) => get().snap.signatures.filter(s => s.unitId === unitId),

  evaluateAllGates: (subjectId) => {
    const snap = get().snap;
    const ids = ['FieldClearance','BillingClearance','SystemAccessClearance','VendorEngagement','GovernanceActive'] as const;
    return ids.map(g => evaluateGate(snap, subjectId, g, 'ui'));
  },

  ingest: (trigger, opts) => {
    const snap = clone(get().snap);
    ingestTrigger(snap, trigger, opts);
    set({ snap });
  },

  setUnitStatus: (unitId, next, payload) => {
    const snap = clone(get().snap);
    changeUnitStatus(snap, unitId, next, { id: 'USR-CO', name: 'Compliance Officer' }, payload ?? {});
    set({ snap });
  },

  captureEvidence: (unitId, objectType, filename, source) => {
    const snap = clone(get().snap);
    const unit = snap.units.find(u => u.id === unitId);
    if (!unit) throw new Error(`Unit not found: ${unitId}`);
    const ev: EvidenceObject = {
      id: nextUlid('EV'),
      unitId, batchId: unit.batchId,
      subjectId: snap.batches.find(b => b.id === unit.batchId)!.subjectId,
      objectType, source,
      storageUri: `/evidence/${unit.id}/${filename}`,
      contentHash: fauxHash(`${unit.id}:${filename}:${Date.now()}`),
      schemaValidation: { ok: true },
      contentValidation: { ok: true },
      createdBy: 'USR-CO',
      createdAt: new Date().toISOString(),
      status: 'Valid',
      filename,
      policyVersionRef: unit.policyRefs[0],
    };
    snap.evidence.push(ev);
    unit.evidenceObjectIds.push(ev.id);
    appendAudit(snap, {
      eventType: 'EVIDENCE_CAPTURED', subjectId: ev.subjectId, batchId: unit.batchId, unitId,
      payload: { evidenceId: ev.id, objectType, filename, contentHash: ev.contentHash },
    });
    // Auto state transition on full evidence + signature satisfaction
    refreshUnit(snap, unitId);
    set({ snap });
    return ev;
  },

  rejectEvidence: (evidenceId, reason) => {
    const snap = clone(get().snap);
    const ev = snap.evidence.find(e => e.id === evidenceId);
    if (!ev) return;
    ev.status = 'Rejected';
    ev.rejectionReason = reason;
    appendAudit(snap, {
      eventType: 'EVIDENCE_REJECTED', subjectId: ev.subjectId, batchId: ev.batchId, unitId: ev.unitId,
      payload: { evidenceId, reason },
    });
    refreshUnit(snap, ev.unitId);
    set({ snap });
  },

  signSignature: (signatureId) => {
    const snap = clone(get().snap);
    const sig = snap.signatures.find(s => s.id === signatureId);
    if (!sig) return;
    sig.status = 'Signed';
    sig.signedArtifactUri = `/ecign/signed/${sig.id}.pdf`;
    sig.signedArtifactHash = fauxHash(`${sig.id}:signed`);
    sig.timestamp = new Date().toISOString();
    sig.authMethod = 'Identity-Verified eCIgn';
    appendAudit(snap, {
      eventType: 'SIGNATURE_COMPLETED', subjectId: sig.subjectId, batchId: sig.batchId, unitId: sig.unitId,
      payload: { signatureId, hash: sig.signedArtifactHash, signerRole: sig.signerRole },
    });
    refreshUnit(snap, sig.unitId);
    set({ snap });
  },

  declineSignature: (signatureId, reason) => {
    const snap = clone(get().snap);
    const sig = snap.signatures.find(s => s.id === signatureId);
    if (!sig) return;
    sig.status = 'Declined';
    appendAudit(snap, {
      eventType: 'SIGNATURE_DECLINED', subjectId: sig.subjectId, batchId: sig.batchId, unitId: sig.unitId,
      payload: { signatureId, reason },
    });
    refreshUnit(snap, sig.unitId);
    set({ snap });
  },

  requestOverride: (subjectId, gateId, reason, validDays) => {
    const snap = clone(get().snap);
    const now = Date.now();
    const validTo = new Date(now + validDays * 86400_000).toISOString();
    snap.overrides.push({
      id: nextUlid('OV'),
      gateOrRuleId: gateId,
      subjectId,
      reason,
      signerIds: ['USR-CO','USR-ADMIN'],
      validFrom: new Date(now).toISOString(),
      validTo,
      status: 'Active',
    });
    appendAudit(snap, {
      eventType: 'OVERRIDE_GRANTED', subjectId,
      payload: { gateId, reason, validTo, dualSig: ['ComplianceOfficer','Administrator'] },
    });
    set({ snap });
  },
}));

/* ── helpers ─────────────────────────────────────────────────── */

function clone(snap: OnboardingSnapshot): OnboardingSnapshot {
  // Shallow per-array clone (objects within remain shared; mutations always go through this clone).
  return {
    workforce: [...snap.workforce],
    vendors: [...snap.vendors],
    roles: [...snap.roles],
    requirements: [...snap.requirements],
    templates: [...snap.templates],
    profiles: [...snap.profiles],
    batches: snap.batches.map(b => ({ ...b })),
    units: snap.units.map(u => ({ ...u, attempts: [...u.attempts], evidenceObjectIds: [...u.evidenceObjectIds], signatureRecordIds: [...u.signatureRecordIds] })),
    evidence: snap.evidence.map(e => ({ ...e })),
    signatures: snap.signatures.map(s => ({ ...s })),
    audit: [...snap.audit],
    gateEvaluations: [...snap.gateEvaluations],
    overrides: snap.overrides.map(o => ({ ...o })),
  };
}

function refreshUnit(snap: OnboardingSnapshot, unitId: string) {
  const unit = snap.units.find(u => u.id === unitId);
  if (!unit) return;
  const evidence = snap.evidence.filter(e => e.unitId === unitId && e.status === 'Valid');
  const sigsRequired = unit.signatureRequired;
  const sigs = snap.signatures.filter(s => s.unitId === unitId);
  const evidenceComplete = unit.evidenceRequired.length === 0
    || unit.evidenceRequired.every(req => evidence.some(e => e.objectType === req.objectType));
  const sigsComplete = sigsRequired.length === 0 ||
    (sigs.length >= sigsRequired.reduce((n, s) => n + s.count, 0)
     && sigs.every(s => s.status === 'Signed'));

  const next: UnitStatus =
      sigs.some(s => s.status === 'Declined')                   ? 'Blocked'
    : evidenceComplete && sigsComplete                          ? 'Completed'
    : !evidenceComplete && sigsRequired.length === 0            ? 'AwaitingEvidence'
    : evidenceComplete && !sigsComplete                         ? 'AwaitingSignature'
    : !evidenceComplete                                          ? 'AwaitingEvidence'
    : 'InProgress';

  if (unit.status !== next) {
    const prev = unit.status;
    unit.status = next;
    if (next === 'Completed') unit.completedAt = new Date().toISOString();
    appendAudit(snap, {
      eventType: 'UNIT_STATE_CHANGED',
      subjectId: snap.batches.find(b => b.id === unit.batchId)?.subjectId,
      batchId: unit.batchId, unitId,
      payload: { from: prev, to: next, reason: 'evidence/signature reconciliation' },
    });
  }
  // Re-roll batch
  const batch = snap.batches.find(b => b.id === unit.batchId);
  if (batch) {
    batch.status = computeBatchStatus(snap.units.filter(u => u.batchId === batch.id));
  }
}
