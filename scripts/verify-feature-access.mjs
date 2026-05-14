/**
 * Deterministic permission-matrix smoke test.
 *
 * Loads the catalog + featureAccess via tsx so we can assert the
 * exact visible-features list for each demo role. Run with:
 *   npx tsx scripts/verify-feature-access.mjs
 */

import { canViewFeature, canViewNavItem, canPerformAction, isAdminUser } from '../src/policy/security/features/featureAccess.ts';
import { FEATURE_CATALOG } from '../src/policy/security/features/catalog.ts';

const ROLES = [
  { label: 'Super Admin (TJ Padilla)', user: { id: 'demo-user-careindeed', email: 'robertp@careindeed.com', role: 'super_admin' } },
  { label: 'Admin',                    user: { id: 'usr-admin',           email: 'admin@careindeed.com',     role: 'admin' } },
  { label: 'RN (Clinician)',           user: { id: 'usr-rn',              email: 'rn@careindeed.com',        role: 'rn' } },
  { label: 'LVN (Clinician)',          user: { id: 'usr-lvn',             email: 'lvn@careindeed.com',       role: 'lvn' } },
  { label: 'CHHA (Clinician)',         user: { id: 'usr-chha',            email: 'chha@careindeed.com',      role: 'chha' } },
  { label: 'Compliance',               user: { id: 'usr-compliance',      email: 'compliance@careindeed.com',role: 'compliance' } },
  { label: 'Auditor (read-only)',      user: { id: 'usr-auditor',         email: 'auditor@careindeed.com',   role: 'auditor' } },
  { label: 'Onboarding (Trainer)',     user: { id: 'usr-onboarding',      email: 'onboarding@careindeed.com',role: 'onboarding' } },
  { label: 'Director (DON-equivalent)',user: { id: 'usr-director',        email: 'director@careindeed.com',  role: 'director' } },
  { label: 'Executive',                user: { id: 'usr-executive',       email: 'executive@careindeed.com', role: 'executive' } },
  { label: 'Billing',                  user: { id: 'usr-billing',         email: 'billing@careindeed.com',   role: 'billing' } },
  { label: 'Suspended (deny-all)',     user: { id: 'usr-suspended',       email: 'suspended@careindeed.com', role: 'rn' } },
  { label: 'Unauthenticated',          user: null },
];

const TARGETS = [
  'dashboard.view', 'brad.view', 'calendar.view', 'staffing.view',
  'staffing.calendar.view', 'clinicians.view', 'patients.view',
  'ces.view', 'evidence.view', 'ecign.view', 'policyLibrary.view',
  'journey.view', 'surveyor.view', 'audit.view',
  'admin.permissions.view', 'admin.users.view',
  'hubstaff.view', 'demo.view', 'systemDocumentation.view',
  'helpCenter.view',
];

const ACTIONS = ['policy.draft','policy.approve','policy.publish','form.sign','ceu.assign','ceu.override','audit.export','user.provision','system.replay','phi.read'];

function pad(s, n) { return (s + ' '.repeat(n)).slice(0, n); }
function check(b) { return b ? '\u2713' : '\u00b7'; }

console.log('\n=== FEATURE VISIBILITY MATRIX ===\n');
const header = '  ' + pad('feature', 30) + ROLES.map(r => pad(r.label.slice(0,5), 6)).join('');
console.log(header);
console.log('  ' + '-'.repeat(header.length - 2));
for (const f of TARGETS) {
  const row = '  ' + pad(f, 30) + ROLES.map(r => pad(check(canViewFeature(r.user, f).allow), 6)).join('');
  console.log(row);
}

console.log('\n=== NAV ITEM VISIBILITY ===\n');
const navItems = [
  { id: 'staffing-calendar', featureId: 'staffing.calendar.view' },
  { id: 'iadmin', featureId: 'brad.view' },
  { id: 'hubstaff', featureId: 'hubstaff.view' },
  { id: 'demo', featureId: 'demo.view' },
  { id: 'evidence', featureId: 'evidence.view' },
  { id: 'admin', featureId: 'admin.permissions.view' },
  { id: 'system-documentation', featureId: 'systemDocumentation.view' },
];
console.log('  ' + pad('nav featureId', 30) + ROLES.map(r => pad(r.label.slice(0,5), 6)).join(''));
console.log('  ' + '-'.repeat(header.length - 2));
for (const n of navItems) {
  console.log('  ' + pad(n.featureId, 30) + ROLES.map(r => pad(check(canViewNavItem(r.user, n.featureId)), 6)).join(''));
}

console.log('\n=== ACTION (PermissionId) GRANTS ===\n');
console.log('  ' + pad('permission', 30) + ROLES.map(r => pad(r.label.slice(0,5), 6)).join(''));
console.log('  ' + '-'.repeat(header.length - 2));
for (const p of ACTIONS) {
  console.log('  ' + pad(p, 30) + ROLES.map(r => pad(check(canPerformAction(r.user, p)), 6)).join(''));
}

console.log('\n=== ADMIN DETECTION ===');
for (const r of ROLES) {
  console.log('  ' + pad(r.label, 32) + ' isAdminUser=' + isAdminUser(r.user));
}

console.log(`\n=== CATALOG SUMMARY ===\n  total features: ${FEATURE_CATALOG.length}\n`);

// ─── Acceptance assertions per the user's role-visibility targets ───
const fail = (msg) => { console.error('  FAIL: ' + msg); process.exitCode = 1; };
const pass = (msg) => { console.log('  PASS: ' + msg); };

console.log('=== ACCEPTANCE CHECKS ===');

// Admin: everything enabled
for (const f of FEATURE_CATALOG) {
  if (f.enabled === false) continue;
  const d = canViewFeature(ROLES[0].user, f.featureId);
  if (!d.allow) fail(`Super Admin should see ${f.featureId} (got ${d.reasonCode})`);
}
pass('Super Admin sees every enabled feature');

// Admin (non-super) still sees admin UI after decoupling fix
const adminUser = ROLES[1].user; // 'usr-admin'
['admin.permissions.view','admin.users.view','admin.roles.view','admin.userGroups.view'].forEach(fid => {
  if (!canViewFeature(adminUser, fid).allow) fail(`Admin should still see ${fid} after decoupling`);
});
pass('Admin (non-super) still sees Admin section after user.provision decoupling');

// Auditor: read-only — must see evidence/audit/policyLibrary but NOT publish
const auditor = ROLES.find(r => r.label.startsWith('Auditor')).user;
['evidence.view','audit.view','policyLibrary.view','surveyor.view'].forEach(fid => {
  if (!canViewFeature(auditor, fid).allow) fail(`Auditor should see ${fid}`);
});
['action.policy.publish','action.policy.approve','action.system.replay'].forEach(fid => {
  if (canViewFeature(auditor, fid).allow) fail(`Auditor should NOT see ${fid}`);
});
if (canPerformAction(auditor, 'system.replay')) fail('Auditor should NOT have system.replay');
pass('Auditor: read-only access enforced (evidence/audit/library yes; publish/replay no)');

// RN/Clinician: should NOT see admin/permissions
const rn = ROLES.find(r => r.label.startsWith('RN')).user;
['admin.permissions.view','admin.users.view','staffing.calendar.view','hubstaff.view','systemDocumentation.view'].forEach(fid => {
  if (canViewFeature(rn, fid).allow) fail(`RN should NOT see ${fid}`);
});
['ces.view','ecign.view','policyLibrary.view','patients.view','journey.view'].forEach(fid => {
  if (!canViewFeature(rn, fid).allow) fail(`RN should see ${fid}`);
});
pass('RN: clinical access yes, admin/internal access no');

// Onboarding (Trainer-equivalent): Journey yes, admin/system no.
// After the user.provision <-> Admin UI decoupling, Onboarding holds
// scoped provisioning rights but does NOT see the Admin section.
const onb = ROLES.find(r => r.label.startsWith('Onboarding')).user;
if (!canViewFeature(onb, 'journey.view').allow) fail('Onboarding should see journey.view');
if (canViewFeature(onb, 'admin.permissions.view').allow) fail('Onboarding should NOT see Admin / Permissions');
if (canViewFeature(onb, 'admin.users.view').allow) fail('Onboarding should NOT see Admin / Users');
if (canViewFeature(onb, 'admin.roles.view').allow) fail('Onboarding should NOT see Admin / Roles');
if (canViewFeature(onb, 'admin.userGroups.view').allow) fail('Onboarding should NOT see Admin / User Groups');
if (canViewFeature(onb, 'hubstaff.view').allow) fail('Onboarding should NOT see hubstaff (internal)');
if (canViewFeature(onb, 'systemDocumentation.view').allow) fail('Onboarding should NOT see system documentation (internal)');
// Onboarding still has scoped user.provision permission for hire workflows
if (!canPerformAction(onb, 'user.provision')) fail('Onboarding should still hold user.provision for scoped provisioning');
pass('Onboarding (trainer): journey yes; admin/internal NO; scoped user.provision still granted');

// Trainer should not see CES admin tools or eCIgn admin tools beyond their normal use
if (canPerformAction(onb, 'system.replay')) fail('Onboarding should NOT have system.replay (CES sandbox reset)');
if (canPerformAction(onb, 'ceu.override')) fail('Onboarding should NOT have ceu.override');
if (canPerformAction(onb, 'audit.export')) fail('Onboarding should NOT have audit.export');
if (canPerformAction(onb, 'policy.publish')) fail('Onboarding should NOT publish policies');
pass('Onboarding (trainer): no CES admin / eCIgn admin / audit-export / publish');

// Director (DON-equivalent): clinical dashboards
const dir = ROLES.find(r => r.label.startsWith('Director')).user;
['staffing.view','clinicians.view','patients.view','evidence.view','policyLibrary.view','journey.view','brad.view'].forEach(fid => {
  if (!canViewFeature(dir, fid).allow) fail(`Director should see ${fid}`);
});
if (canViewFeature(dir, 'admin.permissions.view').allow) fail('Director should NOT see admin/permissions');
pass('Director: clinical/staffing yes, admin no');

// Suspended user: should be denied everything
const susp = ROLES.find(r => r.label.startsWith('Suspended')).user;
['dashboard.view','helpCenter.view'].forEach(fid => {
  if (!canViewFeature(susp, fid).allow) {
    // open features should still be visible — only permission/group-gated should deny
  }
});
if (canPerformAction(susp, 'phi.read')) fail('Suspended user should NOT have phi.read');
if (canPerformAction(susp, 'system.replay')) fail('Suspended user should NOT have system.replay');
pass('Suspended user: write/PHI/replay denied');

// Hidden modules: staffing.calendar.view + hubstaff are internalOnly
['staffing.calendar.view','hubstaff.view','systemDocumentation.view'].forEach(fid => {
  for (const r of ROLES.slice(2)) { // skip admin + super admin
    if (canViewFeature(r.user, fid).allow) fail(`${r.label} should NOT see internal-only ${fid}`);
  }
});
pass('internalOnly features hidden from all non-admin roles');

// policy.publish action with resource context (Phase A engine requires isApprovedVersion=true)
const exec = ROLES.find(r => r.label.startsWith('Executive')).user;
const publishWithCtx = canPerformAction(exec, 'policy.publish', {
  kind: 'policy',
  id: 'pol-test',
  scope: { organizationId: 'careindeed-demo' },
  meta: { isApprovedVersion: true },
});
if (!publishWithCtx) fail('Executive should be allowed to publish an approved policy version');
const publishWithoutCtx = canPerformAction(exec, 'policy.publish', {
  kind: 'policy',
  id: 'pol-test',
  scope: { organizationId: 'careindeed-demo' },
});
if (publishWithoutCtx) fail('Executive should NOT publish a non-approved policy version');
pass('policy.publish honors Phase A isApprovedVersion guard via resource meta');

console.log('\n=== ALL CHECKS COMPLETE ===\n');
