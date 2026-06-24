/* Verifies Builder Beta security logic: permission validation, mass-add safety,
   role-grant guards, OTP (one-time, value-never-logged), and the Google Cloud
   allowlist / dry-run / guardrails. Run with an isolated object store:
   BRAD_OBJECT_STORE_DIR=<temp> tsx scripts/verifyBradBuilder.ts */
import {
  validatePermissionKey, isDuplicatePermissionKey, classifyMassAddRows,
  builderMassAddCommit, builderCreateRole, builderGenerateOtp, builderCreatePermission,
} from '../server/ia/brad/builder.js';
import { planCloudChangeSet } from '../server/ia/brad/cloudChangeSets.js';
import { generateOtp, verifyOtp } from '../server/ia/brad/otp.js';
import { superAdminAudit } from '../server/ia/brad/superadminAudit.js';
import type { CloudChangeOp } from '../server/ia/brad/types.js';

let passed = 0;
const failures: string[] = [];
function check(name: string, cond: boolean) {
  if (cond) { passed += 1; console.log(`PASS  ${name}`); }
  else { failures.push(name); console.error(`FAIL  ${name}`); }
}
function throws(fn: () => unknown): boolean { try { fn(); return false; } catch { return true; } }

const SA = 'demo-user-careindeed';

// ── Permission key validation + duplicates (#29) ─────────────────────────────
check('permission: valid namespaced key accepted', validatePermissionKey('reports.export').ok === true);
check('permission: bad key rejected', validatePermissionKey('Bad Key!').ok === false);
check('permission: core key is duplicate', isDuplicatePermissionKey('brad.ask') === true);
check('permission: novel key not duplicate', isDuplicatePermissionKey('reports.export.weekly') === false);
check('permission: create requires confirmation', throws(() => builderCreatePermission({ key: 'reports.export.weekly', displayName: 'X' }, SA)));
const permOk = builderCreatePermission({ key: 'reports.export.weekly', displayName: 'Weekly export', confirm: true }, SA);
check('permission: create returns draft object', permOk.object.metadata.object_type === 'BradGeneratedPermissionDraft');
check('permission: duplicate create rejected', throws(() => builderCreatePermission({ key: 'reports.export.weekly', displayName: 'dup', confirm: true }, SA)));

// ── Mass add classification (#30) ────────────────────────────────────────────
const rows = [
  { firstName: 'Jane', lastName: 'Rivera', email: 'jrivera@careindeed.com', role: 'clinician' },
  { firstName: 'Jane', lastName: 'Rivera', email: 'jrivera@careindeed.com', role: 'clinician' }, // duplicate
  { firstName: 'Bad', lastName: 'Role', email: 'bad@careindeed.com', role: 'wizard' },            // invalid role
  { firstName: 'No', lastName: 'Email', email: 'not-an-email', role: 'clinician' },               // invalid email
  { firstName: 'Eve', lastName: 'Elevated', email: 'eve@careindeed.com', role: 'super-admin' },   // risky
];
const summary = classifyMassAddRows(rows);
check('mass-add: detects duplicate email', summary.duplicates >= 1);
check('mass-add: detects invalid role', summary.invalid >= 1);
check('mass-add: detects invalid email', summary.rows.some((r) => r.issues.some((i) => i.includes('invalid email'))));
check('mass-add: flags risky super-admin row', summary.risky >= 1);

// ── Mass add cannot assign Super Admin (#31) ─────────────────────────────────
check('mass-add: commit rejects elevated role even with confirm', throws(() => builderMassAddCommit(rows, true, SA)));
const cleanRows = [{ firstName: 'Ana', lastName: 'Cruz', email: 'acruz@careindeed.com', role: 'clinician' }];
check('mass-add: commit requires confirmation', throws(() => builderMassAddCommit(cleanRows, false, SA)));
const importDraft = builderMassAddCommit(cleanRows, true, SA);
check('mass-add: clean commit creates draft object', importDraft.object.metadata.object_type === 'BradGeneratedUserImportDraft');
check('mass-add: commit reports backend blocker', /not wired/i.test(importDraft.blocker));

// ── Role guards ──────────────────────────────────────────────────────────────
check('role: cannot grant Super Admin via name', throws(() => builderCreateRole({ name: 'Super Admin', confirm: true }, SA)));
check('role: cannot include approve.* permission', throws(() => builderCreateRole({ name: 'Auditor', permissions: ['approve.cloud_change.deploy'], confirm: true }, SA)));
const roleOk = builderCreateRole({ name: 'Read Only Reviewer', permissions: ['policy.read', 'evidence.read'], confirm: true }, SA);
check('role: valid role draft created', roleOk.object.metadata.object_type === 'BradGeneratedRoleDraft' && roleOk.permissionDiff.added.length === 2);

// ── OTP: one-time, scoped, never logged (#27, #28) ───────────────────────────
const o = generateOtp({ targetUserId: 'usr-x', purpose: 'reset', createdByUserId: SA });
check('otp: value is non-trivial', typeof o.otp === 'string' && o.otp.length >= 8);
check('otp: verifies once', verifyOtp(o.otpId, o.otp).ok === true);
check('otp: cannot be reused (one-time)', verifyOtp(o.otpId, o.otp).ok === false);
const o2 = generateOtp({ targetUserId: 'usr-y', purpose: 'reset', createdByUserId: SA });
check('otp: wrong value rejected', verifyOtp(o2.otpId, 'WRONGWRONG').ok === false);
check('otp: scoped to user', verifyOtp(o2.otpId, o2.otp, 'usr-z').ok === false);
const issued = builderGenerateOtp({ targetUserId: 'usr-audit', purpose: 'reset', confirm: true }, SA);
const auditText = JSON.stringify(superAdminAudit.list());
check('otp: requires confirmation', throws(() => builderGenerateOtp({ targetUserId: 'usr-q', purpose: 'reset' }, SA)));
check('otp: value NEVER appears in audit log', !auditText.includes(issued.otp));

// ── Google Cloud allowlist + dry-run + guardrails (#36, #37, #38) ────────────
const lowRisk: CloudChangeOp[] = [{ type: 'cloudrun.scaling.update', resource: 'feature-brad-builder-beta', description: 'set min instances 0 / max 2', params: { min: 0, max: 2 } }];
const planLow = planCloudChangeSet(lowRisk);
check('cloud: low-risk scaling op is allowlist-valid', planLow.allowlistValid === true && planLow.riskLevel === 'low');
check('cloud: dry-run produces summary (no mutation)', planLow.dryRunSummary.length === 1 && /DRY-RUN/.test(planLow.dryRunSummary[0]));

const deleteOp: CloudChangeOp[] = [{ type: 'cloudrun.scaling.update', resource: 'prod', description: 'delete project care-indeed' }];
check('cloud: delete-project intent rejected', planCloudChangeSet(deleteOp).allowlistValid === false);
const ownerOp: CloudChangeOp[] = [{ type: 'cloudrun.service_account.update', resource: 'sa', description: 'grant roles/owner to service account' }];
check('cloud: Owner/Editor grant rejected', planCloudChangeSet(ownerOp).allowlistValid === false);
const gkeOp: CloudChangeOp[] = [{ type: 'gcp.api.enable', resource: 'container', description: 'create a GKE cluster with GPU nodes' }];
check('cloud: GKE/GPU infra rejected', planCloudChangeSet(gkeOp).allowlistValid === false);

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.error('FAILURES:', failures.join('; ')); process.exit(1); }
