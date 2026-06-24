/* ═══════════════════════════════════════════════════════════════
   Onboarding V2 — seed snapshot
   Demonstrative subjects, batches, units, evidence and signatures.
   ═══════════════════════════════════════════════════════════════ */
import type {
  OnboardingSnapshot, WorkforceMember, Vendor, EvidenceObject, SignatureRecord,
} from '../types';
import { ROLES } from '../catalog/roles';
import { REQUIREMENTS } from '../catalog/requirements';
import { TEMPLATES } from '../catalog/templates';
import { fauxHash } from '../engine/hash';
import { ingestTrigger, changeUnitStatus } from '../engine/engine';

function iso(daysFromNow: number): string {
  const d = new Date('2026-04-27T08:00:00Z');
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
}

const WORKFORCE: WorkforceMember[] = [
  { id: 'WM-001', legalName: 'Maria Hernandez', preferredName: 'Maria',
    email: 'maria.hernandez@careindeed.example', hireDate: iso(-3), status: 'Active',
    primaryRoleId: 'RN', roleIds: ['RN'], branchId: 'BR-MAIN', supervisorId: 'WM-010' },
  { id: 'WM-002', legalName: 'Daniel Park', email: 'daniel.park@careindeed.example',
    hireDate: iso(0), status: 'Prospect', primaryRoleId: 'HHA', roleIds: ['HHA'], branchId: 'BR-MAIN', supervisorId: 'WM-001' },
  { id: 'WM-003', legalName: 'Aiyana Whitefeather', email: 'aiyana.w@careindeed.example',
    hireDate: iso(-12), status: 'Active', primaryRoleId: 'BILLING', roleIds: ['BILLING'], branchId: 'BR-MAIN', supervisorId: 'WM-020' },
  { id: 'WM-004', legalName: 'Jordan Reeves', email: 'jordan.reeves@careindeed.example',
    hireDate: iso(-30), status: 'Active', primaryRoleId: 'CLINICAL_MANAGER', roleIds: ['CLINICAL_MANAGER','RN'], branchId: 'BR-MAIN' },
  { id: 'WM-005', legalName: 'Priya Iyer', email: 'priya.iyer@careindeed.example',
    hireDate: iso(-2), status: 'Prospect', primaryRoleId: 'INTAKE', roleIds: ['INTAKE'], branchId: 'BR-MAIN' },
  { id: 'WM-010', legalName: 'Carla Vega', email: 'carla.vega@careindeed.example',
    hireDate: iso(-400), status: 'Active', primaryRoleId: 'CLINICAL_MANAGER', roleIds: ['CLINICAL_MANAGER'], branchId: 'BR-MAIN' },
  { id: 'WM-020', legalName: 'Felicia Brown', email: 'felicia.brown@careindeed.example',
    hireDate: iso(-700), status: 'Active', primaryRoleId: 'COMPLIANCE_OFFICER', roleIds: ['COMPLIANCE_OFFICER'], branchId: 'BR-MAIN' },
];

const VENDORS: Vendor[] = [
  { id: 'V-001', legalName: 'NorthStar Medical Transcription, LLC', vendorType: 'BA',
    status: 'Pending', primaryContactName: 'Lin Chen', primaryContactEmail: 'lin@northstartx.example' },
];

/** Pre-existing evidence so the reconciliation flow has something to suppress. */
function seedExistingEvidence(snap: OnboardingSnapshot) {
  const ev: EvidenceObject = {
    id: 'EV-EXISTING-HIPAA-WM004',
    unitId: '', batchId: '', subjectId: 'WM-004',
    objectType: 'TrainingRecord', source: 'ExternalAPI',
    storageUri: '/evidence/wm-004/hipaa-2026.pdf',
    contentHash: fauxHash('hipaa-WM-004'),
    schemaValidation: { ok: true }, contentValidation: { ok: true },
    createdBy: 'system', createdAt: iso(-180),
    status: 'Valid', filename: 'HIPAA-2026-Annual.pdf',
  };
  snap.evidence.push(ev);
}

export function buildSeedSnapshot(): OnboardingSnapshot {
  const snap: OnboardingSnapshot = {
    workforce: [...WORKFORCE],
    vendors: [...VENDORS],
    roles: [...ROLES],
    requirements: [...REQUIREMENTS],
    templates: [...TEMPLATES],
    profiles: [],
    batches: [],
    units: [],
    evidence: [],
    signatures: [],
    audit: [],
    gateEvaluations: [],
    overrides: [],
  };

  seedExistingEvidence(snap);

  // Seed batches via the engine — exercises every code path.
  ingestTrigger(snap, {
    type: 'NEW_HIRE', subjectId: 'WM-001', roleIds: ['RN'],
    branchId: 'BR-MAIN', effectiveDate: iso(-3),
  }, { now: iso(-3) });

  ingestTrigger(snap, {
    type: 'NEW_HIRE', subjectId: 'WM-002', roleIds: ['HHA'],
    branchId: 'BR-MAIN', effectiveDate: iso(0),
  }, { now: iso(0) });

  ingestTrigger(snap, {
    type: 'NEW_HIRE', subjectId: 'WM-003', roleIds: ['BILLING'],
    branchId: 'BR-MAIN', effectiveDate: iso(-12),
  }, { now: iso(-12) });

  ingestTrigger(snap, {
    type: 'ROLE_CHANGE', subjectId: 'WM-004',
    priorRoleIds: ['RN'], newRoleIds: ['CLINICAL_MANAGER','RN'],
    effectiveDate: iso(-30),
  }, { now: iso(-30) });

  ingestTrigger(snap, {
    type: 'NEW_HIRE', subjectId: 'WM-005', roleIds: ['INTAKE'],
    branchId: 'BR-MAIN', effectiveDate: iso(-2),
  }, { now: iso(-2) });

  ingestTrigger(snap, {
    type: 'VENDOR_ONBOARD', subjectId: 'V-001', vendorType: 'BA',
    effectiveDate: iso(-1),
  }, { now: iso(-1) });

  // Demonstrative state progression on Maria (WM-001):
  // Move HIPAA + COC + AUP to AwaitingSignature; mark BG check Completed; license PSV InProgress.
  const mariaUnits = snap.units.filter(u => snap.batches.find(b => b.id === u.batchId)?.subjectId === 'WM-001');
  function setStatus(reqId: string, next: typeof mariaUnits[number]['status']) {
    const u = mariaUnits.find(x => x.requirementId === reqId);
    if (u) changeUnitStatus(snap, u.id, next, { id: 'USR-CO', name: 'Angela Martinez' }, {}, iso(-1));
  }
  setStatus('REQ-CL-LICENSE-PSV', 'InProgress');
  setStatus('REQ-UNIV-HIPAA',     'AwaitingSignature');
  setStatus('REQ-UNIV-COC',       'AwaitingSignature');
  setStatus('REQ-UNIV-AUP',       'AwaitingSignature');
  setStatus('REQ-UNIV-BG',        'Completed');
  setStatus('REQ-CL-TB',          'AwaitingEvidence');

  // Daniel (WM-002, HHA): Blocked on competency, missing 12-subject artifact.
  const danielUnits = snap.units.filter(u => snap.batches.find(b => b.id === u.batchId)?.subjectId === 'WM-002');
  const compUnit = danielUnits.find(u => u.requirementId === 'REQ-HHA-COMP-12');
  if (compUnit) changeUnitStatus(snap, compUnit.id, 'Blocked', { id: 'USR-CO', name: 'Angela Martinez' },
    { reason: 'Awaiting RN observer assignment' }, iso(-1));

  // Demonstrative signature record for Maria HIPAA (Requested)
  const hipaaUnit = mariaUnits.find(u => u.requirementId === 'REQ-UNIV-HIPAA');
  if (hipaaUnit) {
    const sig: SignatureRecord = {
      id: 'SIG-WM001-HIPAA',
      unitId: hipaaUnit.id, batchId: hipaaUnit.batchId, subjectId: 'WM-001',
      signerRole: 'Subject', signerName: 'Maria Hernandez',
      bindsToType: 'PolicyVersion', bindsToRef: 'IT-HIPAA-PRIVACY@2026.01',
      envelopeId: 'env-WM001-hipaa', status: 'Sent',
    };
    snap.signatures.push(sig);
    hipaaUnit.signatureRecordIds.push(sig.id);
  }

  return snap;
}
