/* ═══════════════════════════════════════════════════════════════════
   eCIgn consent / signature-profile / permission / certificate audit.

   Exercises the canonical one-time consent + reusable signature profile +
   one-click signing + certificate pipeline headlessly (Node), and statically
   verifies the enrollment UI contract + QA-WF-03 immutability.
   ═══════════════════════════════════════════════════════════════════ */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRegisteredSwimlane } from '@/policy/workflows/swimlanes/swimlaneRegistry';
import { ECIGN_PERMISSION_ROLES, inferRequiredPermissionRole, permissionSatisfies, resolveUserPermissionRoles } from '@/policy/ecign/permissionRoles';
import { ECIGN_AGREEMENT_VERSION } from '@/policy/ecign/ecignAgreement';
import { useEcignConsentStore } from '@/policy/ecign/ecignConsentStore';
import { useEcignSignatureProfileStore } from '@/policy/ecign/ecignSignatureProfileStore';
import { useEcignSignatureRecordStore } from '@/policy/ecign/ecignSignatureRecordStore';
import { applyOneClickSignature, evaluateSignReadiness, type SigningContext } from '@/policy/ecign/ecignSigning';
import type { ECIgnConsentProfile, ECIgnPermissionRole } from '@/policy/ecign/types';

const failures: string[] = [];
const notes: string[] = [];
function assert(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

const PERMISSION_SET = new Set<string>(ECIGN_PERMISSION_ROLES);

/* ── 1. Required files exist ─────────────────────────────────────── */
const requiredFiles = [
  'src/policy/ecign/types.ts',
  'src/policy/ecign/permissionRoles.ts',
  'src/policy/ecign/ecignAgreement.ts',
  'src/policy/ecign/ecignConsentStore.ts',
  'src/policy/ecign/ecignSignatureProfileStore.ts',
  'src/policy/ecign/ecignSignatureRecordStore.ts',
  'src/policy/ecign/ecignCertificateBuilder.ts',
  'src/policy/ecign/ecignSigning.ts',
  'src/policy/ecign/ECIgnSetupModal.tsx',
  'src/policy/ecign/ECIgnSignatureField.tsx',
];
requiredFiles.forEach(f => assert(existsSync(resolve(process.cwd(), f)), `Missing required file: ${f}`));

/* ── 2. Every generated signature requirement/task carries a permission role ── */
const ROUTES: Array<{ workflowId?: string; eventId?: string; taskId?: string }> = [
  { eventId: 'oig_sam_exclusion_check-20260505-01', workflowId: 'CO-WF-15' },
  { eventId: 'qapi_meeting-20260507-08' },
  { eventId: 'cost_report_filing-20260531-01' },
  { workflowId: 'CL-WF-26', eventId: 'plan_of_care_audit-20260507-01', taskId: 'CL-WF-26-STEP-01' },
  { eventId: 'bbp_training-20260527-01' },
];
let requirementCount = 0;
for (const input of ROUTES) {
  const model = buildRegisteredSwimlane(input);
  if (!model) { assert(false, `Route did not build: ${JSON.stringify(input)}`); continue; }
  model.nodes.forEach(node => {
    (node.signatureRequirements ?? []).forEach(req => {
      requirementCount += 1;
      assert(PERMISSION_SET.has(req.requiredPermissionRole), `Requirement ${req.signatureRequirementId} missing/invalid requiredPermissionRole.`);
      assert(Boolean(req.signerRole), `Requirement ${req.signatureRequirementId} missing signerRole.`);
    });
    (node.signatureTasks ?? []).forEach(task => {
      assert(PERMISSION_SET.has(task.requiredPermissionRole), `Signer task ${task.taskId} missing/invalid requiredPermissionRole.`);
    });
  });
}
notes.push(`Inspected ${requirementCount} generated signature requirements across ${ROUTES.length} routes.`);

/* ── 3. Permission hierarchy gate behaves correctly ──────────────── */
assert(permissionSatisfies(['eCIgner'], 'eCIgner'), 'eCIgner should satisfy eCIgner.');
assert(!permissionSatisfies(['eCIgner'], 'eCIgn Reviewer'), 'eCIgner must NOT satisfy reviewer requirement.');
assert(permissionSatisfies(['eCIgn Reviewer'], 'eCIgner'), 'Reviewer should satisfy signer (lower) requirement.');
assert(permissionSatisfies(['eCIgn Final Approver'], 'eCIgn Reviewer'), 'Final approver should satisfy reviewer requirement.');
assert(permissionSatisfies(['eCIgn Administrator'], 'eCIgn Final Approver'), 'Administrator should satisfy final-approver requirement.');
assert(!permissionSatisfies(['eCIgner', 'eCIgn Final Approver'], 'eCIgn System'), 'eCIgn System is non-human and must never be satisfied.');
// eCIgn System is never treated as a human signer
assert(resolveUserPermissionRoles('Evidence / eCIgn System').join() === 'eCIgn System', 'eCIgn System role must resolve to eCIgn System only.');
assert(inferRequiredPermissionRole({ signerRole: 'Evidence / eCIgn System' }) === 'eCIgn System', 'System signer role must require eCIgn System (non-human).');
// canonical examples
assert(inferRequiredPermissionRole({ signerRole: 'Clinical Manager', signatureSlot: 'primary-signature' }) === 'eCIgner', 'Clinical Manager signing → eCIgner.');
assert(inferRequiredPermissionRole({ signerRole: 'QAPI Lead / Chair', signatureSlot: 'minutes-signoff-1' }) === 'eCIgn Final Approver', 'QAPI chair minutes → Final Approver.');
assert(inferRequiredPermissionRole({ signerRole: 'Governing Body' }) === 'eCIgn Final Approver', 'Governing Body → Final Approver.');
assert(inferRequiredPermissionRole({ signerRole: 'Compliance Officer', isReviewer: true }) === 'eCIgn Reviewer', 'Compliance Officer review → Reviewer.');

/* ── 4. End-to-end consent + signature-profile + one-click signing ─ */
const consentStore = useEcignConsentStore.getState();
const profileStore = useEcignSignatureProfileStore.getState();
const recordStore = useEcignSignatureRecordStore.getState();

const userId = 'audit-user-1';
const baseCtx: SigningContext = {
  authenticated: true,
  signer: { userId, displayName: 'Audit Signer', permissionRoles: ['eCIgner'] },
  hasSignerTask: true,
  signerRole: 'Clinical Manager',
  requiredPermissionRole: 'eCIgner',
  taskId: 'TASK-AUDIT-1',
  formId: 'CL-FM-001',
  formInstanceId: 'FI-AUDIT-1',
  eventId: 'plan_of_care_audit-20260507-01',
  workflowId: 'CL-WF-26',
  signatureSlot: 'primary-signature',
  mode: 'event_execution',
};

// 4a. No consent → needs setup, cannot sign (no auto-consent).
let r = evaluateSignReadiness(baseCtx);
assert(!r.canSign && r.needsSetup && r.blockReason === 'no_consent_profile', 'Without consent, signing must be blocked and require setup.');

// 4b. Record consent (explicit) → still needs signature profile.
const consent = consentStore.recordConsent({ userId, signerDisplayName: 'Audit Signer', requiredPermissionRoles: ['eCIgner'] });
r = evaluateSignReadiness(baseCtx);
assert(!r.canSign && r.blockReason === 'no_signature_profile', 'With consent but no signature profile, signing must be blocked.');

// 4c. Save signature profile → ready.
const profileA = profileStore.saveSignatureProfile({ userId, signerDisplayName: 'Audit Signer', signatureMethod: 'typed', typedSignatureText: 'Audit Signer', consentProfileId: consent.consentProfileId, consentVersion: consent.consentVersion });
r = evaluateSignReadiness(baseCtx);
assert(r.canSign, `Signing should be ready after consent + signature profile. Got: ${r.message}`);

// 4d. Template mode is never signable.
assert(evaluateSignReadiness({ ...baseCtx, mode: 'template' }).blockReason === 'template_mode', 'Template mode must block signing.');

// 4e. Missing form instance must block (no form instance created from click).
assert(evaluateSignReadiness({ ...baseCtx, formInstanceId: undefined }).blockReason === 'missing_form_instance', 'Missing form instance must block signing.');

// 4f. Apply one-click signature → record + certificate.
const recordsBefore = useEcignSignatureRecordStore.getState().records.length;
const result = applyOneClickSignature({ ...baseCtx, intentMethod: 'clicked_signature_field' });
assert(result.ok && Boolean(result.signatureId) && Boolean(result.certificateId), 'One-click signature should succeed and produce record + certificate.');
const recordsAfter = useEcignSignatureRecordStore.getState().records.length;
assert(recordsAfter === recordsBefore + 1, 'Exactly one signature record should be created from the click.');

const record = useEcignSignatureRecordStore.getState().getRecordById(result.signatureId!);
assert(Boolean(record), 'Signature record must be retrievable.');
assert(record!.consentProfileId === consent.consentProfileId, 'Record must link the active consent profile.');
assert(Boolean(record!.consentVersion), 'Record must carry consentVersion.');
assert(Boolean(record!.consentTextHash), 'Record must carry consentTextHash.');
assert(record!.signatureProfileId === profileA.signatureProfileId, 'Record must reference the active signature profile.');
assert(Boolean(record!.signatureProfileHash), 'Record must carry signatureProfileHash.');
assert(record!.formInstanceId === baseCtx.formInstanceId, 'Record must reference the EXISTING form instance (no new instance created).');
assert(record!.signatureIntentMethod === 'clicked_signature_field', 'Record must capture the click intent.');

const cert = useEcignSignatureRecordStore.getState().getCertificateById(result.certificateId!);
assert(Boolean(cert), 'Certificate must be retrievable.');
assert(cert!.consentProfileId === consent.consentProfileId, 'Certificate must reference consent profile.');
assert(cert!.signatureProfileId === profileA.signatureProfileId, 'Certificate must reference signature profile.');
assert(/clicking the/.test(cert!.statement), 'Certificate statement must include the click-to-sign action.');
assert(cert!.statement.includes(consent.consentVersion) && cert!.statement.includes(baseCtx.formInstanceId!), 'Certificate statement must reference consent version + form instance.');

// 4g. Re-signing the same slot is idempotent (deterministic id, no duplicate record).
applyOneClickSignature({ ...baseCtx, intentMethod: 'clicked_signature_field' });
assert(useEcignSignatureRecordStore.getState().records.filter(x => x.signatureId === result.signatureId).length === 1, 'Re-signing must not create a duplicate record.');

/* ── 5. Updating signature creates new profile; historical record preserved ── */
const profileB = profileStore.saveSignatureProfile({ userId, signerDisplayName: 'Audit Signer', signatureMethod: 'typed', typedSignatureText: 'Audit Signer v2', consentProfileId: consent.consentProfileId, consentVersion: consent.consentVersion });
assert(profileB.signatureProfileId !== profileA.signatureProfileId, 'Updating signature must create a new signatureProfileId.');
const profileAAfter = useEcignSignatureProfileStore.getState().getProfileById(profileA.signatureProfileId);
assert(profileAAfter?.status === 'superseded', 'Prior profile must be superseded, not mutated/deleted.');
const recordStill = useEcignSignatureRecordStore.getState().getRecordById(result.signatureId!);
assert(recordStill!.signatureProfileId === profileA.signatureProfileId, 'Historical signed record must still reference the original signature profile.');

/* ── 6. Missing permission blocks signing ────────────────────────── */
assert(evaluateSignReadiness({ ...baseCtx, requiredPermissionRole: 'eCIgn Final Approver' }).blockReason === 'missing_permission', 'Insufficient permission must block signing.');

/* ── 7. Revoked consent / signature profile blocks signing ───────── */
const revokeUser = 'audit-user-2';
const ctx2: SigningContext = { ...baseCtx, signer: { userId: revokeUser, displayName: 'Revoke Test', permissionRoles: ['eCIgner'] }, taskId: 'TASK-AUDIT-2', formInstanceId: 'FI-AUDIT-2' };
const c2 = useEcignConsentStore.getState().recordConsent({ userId: revokeUser, signerDisplayName: 'Revoke Test', requiredPermissionRoles: ['eCIgner'] });
const p2 = useEcignSignatureProfileStore.getState().saveSignatureProfile({ userId: revokeUser, signerDisplayName: 'Revoke Test', signatureMethod: 'typed', typedSignatureText: 'Revoke Test', consentProfileId: c2.consentProfileId, consentVersion: c2.consentVersion });
assert(evaluateSignReadiness(ctx2).canSign, 'Setup should make user-2 ready.');
useEcignSignatureProfileStore.getState().revokeSignatureProfile(p2.signatureProfileId);
assert(evaluateSignReadiness(ctx2).blockReason === 'no_signature_profile', 'Revoked signature profile must block signing.');
useEcignConsentStore.getState().revokeConsent(c2.consentProfileId);
assert(evaluateSignReadiness(ctx2).blockReason === 'no_consent_profile', 'Revoked consent must block signing.');

/* ── 8. Stale agreement version forces re-acceptance ─────────────── */
const staleUser = 'audit-user-3';
const staleProfile: ECIgnConsentProfile = {
  consentProfileId: 'STALE-1', userId: staleUser, signerDisplayName: 'Stale', requiredPermissionRoles: ['eCIgner'],
  consentVersion: 'OLD-VERSION', consentTextHash: 'x', consentAcceptedAt: new Date().toISOString(),
  consentStatus: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
useEcignConsentStore.setState({ profiles: [...useEcignConsentStore.getState().profiles, staleProfile] });
useEcignSignatureProfileStore.getState().saveSignatureProfile({ userId: staleUser, signerDisplayName: 'Stale', signatureMethod: 'typed', typedSignatureText: 'Stale', consentProfileId: 'STALE-1', consentVersion: 'OLD-VERSION' });
const staleCtx: SigningContext = { ...baseCtx, signer: { userId: staleUser, displayName: 'Stale', permissionRoles: ['eCIgner'] }, formInstanceId: 'FI-AUDIT-3', taskId: 'TASK-AUDIT-3' };
assert(evaluateSignReadiness(staleCtx).blockReason === 'consent_version_changed', 'Stale agreement version must require re-acceptance.');
assert(ECIGN_AGREEMENT_VERSION !== 'OLD-VERSION', 'Sanity: current agreement version differs from stale.');

/* ── 9. Active consent/profile does NOT re-prompt agreement UI ───── */
assert(evaluateSignReadiness(baseCtx).needsSetup === false, 'Active consent + signature profile must NOT trigger repeated setup.');

/* ── 10. UI contract: enrollment checkbox not auto-checked; accept gated ── */
const modalSrc = readFileSync(resolve(process.cwd(), 'src/policy/ecign/ECIgnSetupModal.tsx'), 'utf8');
assert(/useState\(false\)/.test(modalSrc) && /setAgreed\(false\)/.test(modalSrc), 'Enrollment checkbox must default unchecked and reset to false on open.');
assert(/const canAccept = agreed && signatureCaptured && identityPresent/.test(modalSrc), 'Accept must require checkbox + signature + identity.');
assert(/disabled=\{!canAccept\}/.test(modalSrc), 'Accept button must be disabled until requirements are satisfied.');
assert(/View Full Agreement Text/.test(modalSrc), 'Setup modal must offer full agreement text.');

const fieldSrc = readFileSync(resolve(process.cwd(), 'src/policy/ecign/ECIgnSignatureField.tsx'), 'utf8');
assert(/Complete eCIgn Setup/.test(fieldSrc), 'Field must offer "Complete eCIgn Setup" when unenrolled.');
assert(/Create Signature Profile/.test(fieldSrc), 'Field must offer "Create Signature Profile" when profile missing.');
assert(/Missing .* permission role|missing_permission/.test(fieldSrc), 'Field must surface a missing-permission message.');

/* ── 11. QA-WF-03 custom page diff must remain empty ──────────────── */
let qaDiff = '';
try {
  qaDiff = execSync('git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx', { encoding: 'utf8' }).trim();
} catch (error) {
  failures.push(`Unable to inspect QA-WF-03 diff: ${String(error)}`);
}
assert(qaDiff === '', 'QA-WF-03 custom page has a non-empty diff.');

/* ── Report ──────────────────────────────────────────────────────── */
console.log('eCIgn Consent / Signature Profile / Permission / Certificate Audit');
notes.forEach(n => console.log(`- ${n}`));
const _permissionRoleUse: ECIgnPermissionRole = 'eCIgner';
void _permissionRoleUse;
if (failures.length > 0) {
  console.error('\nFailures:');
  failures.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}
console.log('\nAll eCIgn consent / signature profile / permission / certificate validations passed.');
