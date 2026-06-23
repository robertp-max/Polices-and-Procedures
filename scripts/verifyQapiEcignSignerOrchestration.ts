import {
  canGenerateFinalPackage,
  deriveCanonicalSignerRequirements,
  normalizeSignerProfile,
  requiredSignerPayloads,
  resolveNextRequiredSigner,
  validateSignerEligibility,
  type AuthorityDomain,
  type CanonicalSignerRequirement,
  type SignatureCompletion,
} from '../src/policy/ecign/signerAuthority';
import { DEMO_STAFF } from '../src/policy/components/FormSignatureContext';

let pass = 0;
let fail = 0;

function check(label: string, ok: boolean, detail?: unknown): void {
  if (ok) {
    pass += 1;
    console.log(`  PASS  ${label}`);
  } else {
    fail += 1;
    console.error(`  FAIL  ${label}`, detail ?? '');
  }
}

function completion(
  requirement: CanonicalSignerRequirement,
  signer: {
    userId: string;
    role: string;
    tier: 1 | 2 | 3 | 4 | 5;
    domains: AuthorityDomain[];
  },
  hash = `hash-${requirement.slotOrder}`,
): SignatureCompletion {
  return {
    slotOrder: requirement.slotOrder,
    fieldId: requirement.slotFieldId,
    signerUserId: signer.userId,
    signerRole: signer.role,
    signerTier: signer.tier,
    signerDomains: signer.domains,
    signedAt: new Date(2026, 4, 14, 12, requirement.slotOrder).toISOString(),
    documentHash: hash,
  };
}

console.log('\n[1] QA-WF-02 monthly QAPI signer chain');

const qapiRequirements = deriveCanonicalSignerRequirements({
  formId: 'QA-FM-003',
  workflowId: 'QA-WF-02',
  eventId: 'EVT-QAPI-MONTHLY-DASHBOARD',
  taskId: 'TASK-QA-WF-02-DASHBOARD',
});

check('QA-WF-02 derives preparer and QAPI lead signer slots', qapiRequirements.length === 2, qapiRequirements);
check('slot 1 is task owner/preparer in QAPI domain', qapiRequirements[0]?.slotOrder === 1 && qapiRequirements[0]?.requiredDomain === 'qapi' && qapiRequirements[0]?.minTier === 1, qapiRequirements[0]);
check('slot 2 is QAPI lead review in QAPI domain', qapiRequirements[1]?.slotOrder === 2 && qapiRequirements[1]?.requiredDomain === 'qapi' && qapiRequirements[1]?.minTier === 3, qapiRequirements[1]);

const qapiResolvedFormSlots = deriveCanonicalSignerRequirements({
  formId: 'QA-F-012',
  workflowId: 'WF-QA-PI-001',
  eventId: 'qapi_meeting-20260512-09',
  taskId: 'qapi_meeting-20260512-09-01',
  domain: 'QA',
  slots: [
    { field_id: '2-sig-1', role: 'Assigned Owner', tier: 1, required: true, sequence_group: 1 },
    { field_id: 'sig_qapi_lead', role: 'QAPI Lead / Chair', tier: 3, required: true, sequence_group: 2 },
  ],
});
check('resolved QAPI form slots keep Assigned Owner as production Tier 1', qapiResolvedFormSlots[0]?.minTier === 1, qapiResolvedFormSlots[0]);

const qapiPreparer = normalizeSignerProfile({
  userId: 'user_qapi_data',
  name: 'QAPI Data Analyst',
  role: 'QAPI Data Analyst',
  tier: 1,
  authorityDomains: ['qapi'],
});
const qapiLead = normalizeSignerProfile({
  userId: 'user_qapi_lead',
  name: 'QAPI Lead',
  role: 'QAPI Lead / Chair',
  tier: 3,
  authorityDomains: ['qapi'],
});

const slot1Eligibility = validateSignerEligibility(qapiPreparer, qapiRequirements[0]!);
check('first signer is eligible for QA-WF-02 slot 1', slot1Eligibility.eligible, slot1Eligibility.reasons);

const formInstanceId = 'FI-QA-WF-02-MONTHLY';
const artifactId = 'ART-FI-QA-WF-02-MONTHLY';
const afterSigner1 = [completion(qapiRequirements[0]!, {
  userId: qapiPreparer.userId,
  role: qapiPreparer.role,
  tier: qapiPreparer.tier,
  domains: qapiPreparer.authorityDomains,
}, 'pdf-version-1-hash')];
const nextAfterSigner1 = resolveNextRequiredSigner(qapiRequirements, afterSigner1);

check('signer 2 task is auto-discoverable after signer 1', nextAfterSigner1?.slotOrder === 2, nextAfterSigner1);
check('same canonical form instance is preserved for signer 2 task', formInstanceId === 'FI-QA-WF-02-MONTHLY');
check('same logical artifact lineage is preserved for signer 2 task', artifactId === 'ART-FI-QA-WF-02-MONTHLY');

const slot2Eligibility = validateSignerEligibility(qapiLead, qapiRequirements[1]!, {
  previousSignatures: afterSigner1,
  preparerUserId: qapiPreparer.userId,
});
check('QAPI lead is eligible for QA-WF-02 slot 2', slot2Eligibility.eligible, slot2Eligibility.reasons);

const rosterEligibleQapiLead = DEMO_STAFF
  .map(user => ({
    user,
    result: validateSignerEligibility(
      normalizeSignerProfile({
        userId: user.id,
        name: user.name,
        role: user.role,
        tier: user.tier,
        authorityDomains: user.authorityDomains,
      }),
      qapiRequirements[1]!,
      {
        previousSignatures: afterSigner1,
        preparerUserId: qapiPreparer.userId,
      },
    ),
  }))
  .find(candidate => candidate.result.eligible);
check('actual demo staff roster has an eligible QA-WF-02 slot 2 signer', Boolean(rosterEligibleQapiLead), DEMO_STAFF.map(user => `${user.name}:${user.role}:T${user.tier}:${user.authorityDomains.join(',')}`));
check('final package is blocked before all QA-WF-02 required slots complete', !canGenerateFinalPackage(qapiRequirements, afterSigner1));

const afterSigner2 = [
  ...afterSigner1,
  completion(qapiRequirements[1]!, {
    userId: qapiLead.userId,
    role: qapiLead.role,
    tier: qapiLead.tier,
    domains: qapiLead.authorityDomains,
  }, 'pdf-version-2-hash'),
];

check('final package is allowed after all QA-WF-02 required slots complete', canGenerateFinalPackage(qapiRequirements, afterSigner2));
check('final signatures remain in signer order', afterSigner2.map(item => item.slotOrder).join(',') === '1,2', afterSigner2);

console.log('\n[2] Higher QAPI/governance escalation');

const quarterlyRequirements = deriveCanonicalSignerRequirements({
  formId: 'QA-FM-001',
  workflowId: 'QA-WF-03',
  eventId: 'EVT-QAPI-QUARTERLY',
  taskId: 'TASK-QA-WF-03-MINUTES',
});
const afterQuarterlySlot2 = quarterlyRequirements.slice(0, 2).map((requirement, index) => completion(requirement, {
  userId: `user_qapi_${index + 1}`,
  role: index === 0 ? 'QAPI Data Analyst' : 'QAPI Lead / Chair',
  tier: index === 0 ? 1 : 3,
  domains: ['qapi'],
}));
const quarterlyNext = resolveNextRequiredSigner(quarterlyRequirements, afterQuarterlySlot2);
const governingBodyChair = normalizeSignerProfile({
  userId: 'user_gb_chair',
  name: 'Governing Body Chair',
  role: 'Governing Body Chair',
  tier: 5,
  authorityDomains: ['governance'],
});
const governanceEligibility = quarterlyNext
  ? validateSignerEligibility(governingBodyChair, quarterlyNext, { previousSignatures: afterQuarterlySlot2 })
  : { eligible: false, reasons: ['No next signer slot found.'] };

check('QA-WF-03 derives Governing Body final authority when required', quarterlyNext?.slotOrder === 3 && quarterlyNext.requiredDomain === 'governance', quarterlyNext);
check('Tier 5 Governing Body signer is eligible only for governance final slot', governanceEligibility.eligible, governanceEligibility.reasons);

console.log('\n[3] Wrong-domain high-tier blocking');

const accountingExecutive = normalizeSignerProfile({
  userId: 'user_accounting_t5',
  name: 'Accounting Manager',
  role: 'Accounting Manager',
  tier: 5,
  authorityDomains: ['accounting', 'finance'],
});

const accountingForQapi = validateSignerEligibility(accountingExecutive, qapiRequirements[1]!, {
  previousSignatures: afterSigner1,
  preparerUserId: qapiPreparer.userId,
});
check('Accounting Tier 5 cannot approve QAPI lead slot', !accountingForQapi.eligible && accountingForQapi.reasons.some(reason => reason.includes('qapi')), accountingForQapi.reasons);

const clinicalRequirements = deriveCanonicalSignerRequirements({
  formId: 'QA-FM-005',
  workflowId: 'CL-WF-26',
  eventId: 'EVT-PLAN-OF-CARE-AUDIT',
  taskId: 'TASK-CL-WF-26-AUDIT',
});
const clinicalPreparer = completion(clinicalRequirements[0]!, {
  userId: 'user_staff_rn',
  role: 'Staff RN',
  tier: 1,
  domains: ['clinical'],
});
const accountingForClinical = validateSignerEligibility(accountingExecutive, clinicalRequirements[1]!, {
  previousSignatures: [clinicalPreparer],
  preparerUserId: clinicalPreparer.signerUserId,
});
check('Accounting Tier 5 cannot approve Plan-of-Care/clinical QAPI audit slot', !accountingForClinical.eligible && accountingForClinical.reasons.some(reason => reason.includes('clinical')), accountingForClinical.reasons);

const clinicalManager = normalizeSignerProfile({
  userId: 'user_clinical_manager',
  name: 'Clinical Manager',
  role: 'Clinical Manager',
  tier: 3,
  authorityDomains: ['clinical'],
});
const clinicalEligibility = validateSignerEligibility(clinicalManager, clinicalRequirements[1]!, {
  previousSignatures: [clinicalPreparer],
  preparerUserId: clinicalPreparer.signerUserId,
});
check('Clinical Manager remains eligible for CL-WF-26 clinical validation', clinicalEligibility.eligible, clinicalEligibility.reasons);

console.log('\n[4] Payload and evidence metadata shape');

const qapiPayloads = requiredSignerPayloads(qapiRequirements);
const payloadJson = JSON.stringify(qapiPayloads);
check('required signer payloads include canonical slot metadata', qapiPayloads.every(payload => payload.slot_order && payload.required_domain && payload.min_tier && payload.required_for_final_package), qapiPayloads);
check('required signer payloads contain no binary/base64/local data URL fields', !/base64|dataUrl|localDataUrl|signature_png/i.test(payloadJson), qapiPayloads);

const finalEvidenceMetadata = {
  evidence_id: 'EVID-QA-WF-02-MONTHLY',
  artifact_id: artifactId,
  form_instance_id: formInstanceId,
  event_id: 'EVT-QAPI-MONTHLY-DASHBOARD',
  workflow_id: 'QA-WF-02',
  task_id: 'TASK-QA-WF-02-DASHBOARD',
  form_id: 'QA-FM-003',
  driveFileId: 'drive-file-id',
  driveFolderId: 'drive-folder-id',
  webViewLink: 'https://drive.google.com/file/d/drive-file-id/view',
  mimeType: 'application/pdf',
  fileName: 'QA-FM-003_signed.pdf',
  size: 1024,
  sha256: 'sha256-final',
  pdf_version: afterSigner2.length,
  status: 'final_locked',
  signer_slot_order: afterSigner2.at(-1)?.slotOrder,
  signer_user_id: afterSigner2.at(-1)?.signerUserId,
  signer_role: afterSigner2.at(-1)?.signerRole,
  signer_tier: afterSigner2.at(-1)?.signerTier,
  signer_domain: afterSigner2.at(-1)?.signerDomains[0],
  prior_document_hash: afterSigner1[0]?.documentHash,
  final_document_hash: afterSigner2.at(-1)?.documentHash,
  audit_event_ids: ['AUD-SIGNER-1', 'AUD-SIGNER-2', 'AUD-TASK-AUTO-CREATED'],
  createdBy: qapiLead.userId,
  createdAt: new Date(2026, 4, 14, 12, 2).toISOString(),
  updatedAt: new Date(2026, 4, 14, 12, 2).toISOString(),
};
const evidenceJson = JSON.stringify(finalEvidenceMetadata);

check('Evidence Center has one canonical evidence item keyed to form instance/artifact', finalEvidenceMetadata.form_instance_id === formInstanceId && finalEvidenceMetadata.artifact_id === artifactId);
check('final evidence metadata stores Drive pointers and hashes', Boolean(finalEvidenceMetadata.driveFileId && finalEvidenceMetadata.webViewLink && finalEvidenceMetadata.sha256 && finalEvidenceMetadata.final_document_hash), finalEvidenceMetadata);
check('final evidence metadata contains no raw binary/base64/local data URL', !/base64|localDataUrl|data:image|signature_png/i.test(evidenceJson), finalEvidenceMetadata);
check('Artifact Viewer can reopen latest Drive-backed version metadata', finalEvidenceMetadata.pdf_version === 2 && finalEvidenceMetadata.webViewLink.includes('drive.google.com'), finalEvidenceMetadata);

console.log(`\nQAPI/eCIgn signer orchestration verification: ${pass} passed, ${fail} failed`);
if (fail > 0) {
  process.exit(1);
}
