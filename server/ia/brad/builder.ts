import { getGeneratedObjectStore, sha256Hex } from './generatedObjects.js';
import { readHarnessConfig } from '../harness/config.js';
import { superAdminAudit } from './superadminAudit.js';
import { generateOtp } from './otp.js';
import type { BradGeneratedObject, BradObjectType, WriteStatus } from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Builder Beta logic (Super Admin only).
   ----------------------------------------------------------------------------
   Builder produces append-only Brad-generated DRAFT objects + audited OTPs. It
   never mutates canonical/core objects or production code directly. Risky writes
   require explicit active-Super-Admin confirmation (confirm:true). All actions
   are audited. Secrets/OTP values are never logged.
   ═══════════════════════════════════════════════════════════════════════════ */

class ConfirmationRequiredError extends Error {
  constructor(msg = 'Active Super Admin confirmation required.') { super(msg); this.name = 'ConfirmationRequiredError'; }
}
export class BuilderValidationError extends Error {
  constructor(msg: string) { super(msg); this.name = 'BuilderValidationError'; }
}

/** Commit an append-only Builder object with full provenance + audit. */
function commitBuilderObject(objectType: BradObjectType, content: unknown, requestedByUserId: string, initialWriteStatus: WriteStatus = 'committed'): BradGeneratedObject {
  const cfg = readHarnessConfig();
  const store = getGeneratedObjectStore();
  const object = store.create({
    objectType,
    requestedByUserId,
    content,
    runtimeMode: cfg.brad.runtimeMode,
    modelProvider: cfg.brad.provider,
    modelId: cfg.brad.modelId,
    promptVersion: cfg.brad.promptVersion,
    sourceSnapshotHash: sha256Hex(`brad-builder:${objectType}`),
    initialWriteStatus,
  });
  superAdminAudit.record({
    type: 'object.created',
    actorId: requestedByUserId,
    objectId: object.metadata.object_id,
    objectType,
    outcome: 'recorded',
    reason: `builder ${objectType} write_status=${initialWriteStatus}`,
  });
  return object;
}

/* ─── Generate OTP ───────────────────────────────────────────────────────────*/

export interface GenerateOtpRequest {
  targetUserId: string;
  purpose: string;
  ttlMinutes?: number;
  deliveryMethod?: string;
  confirm?: boolean;
}

export function builderGenerateOtp(req: GenerateOtpRequest, actorId: string) {
  if (!req.confirm) throw new ConfirmationRequiredError();
  const otp = generateOtp({
    targetUserId: req.targetUserId,
    purpose: req.purpose,
    ttlMs: req.ttlMinutes ? req.ttlMinutes * 60_000 : undefined,
    createdByUserId: actorId,
  });
  // Audit WITHOUT the value (the audit log also scrubs, but we never pass it).
  superAdminAudit.record({
    type: 'action.allowed',
    actorId,
    objectId: otp.otpId,
    objectType: 'BradGeneratedOtpRecord',
    outcome: 'granted',
    reason: `OTP issued for user=${otp.targetUserId} purpose=${otp.purpose} (value redacted)`,
  });
  // Record a non-sensitive marker object (no value/hash) for the review queue.
  commitBuilderObject('BradGeneratedOtpRecord', {
    otpId: otp.otpId, targetUserId: otp.targetUserId, purpose: otp.purpose,
    expiresAt: otp.expiresAt, deliveryMethod: req.deliveryMethod ?? 'manual-copy', valueStored: false,
  }, actorId);
  return {
    otpId: otp.otpId,
    otp: otp.otp,        // shown once to the caller; never logged/stored
    expiresAt: otp.expiresAt,
    targetUserId: otp.targetUserId,
    purpose: otp.purpose,
    notice: 'OTP generated. Value shown once. It will not be logged or recoverable.',
  };
}

/* ─── Create Permission ──────────────────────────────────────────────────────*/

// Seeded core permission keys (cannot be silently overwritten).
const CORE_PERMISSION_KEYS = new Set<string>([
  'brad.ask', 'brad.report.run', 'brad.event_packet.generate', 'brad.qapi_minutes.draft',
  'admin.users.read', 'admin.users.write', 'admin.roles.read', 'admin.roles.write',
  'admin.permissions.read', 'admin.permissions.write', 'evidence.read', 'policy.read',
]);
const createdPermissionKeys = new Set<string>();

export const PERMISSION_KEY_RE = /^[a-z][a-z0-9]*(?:[._:][a-z0-9]+)+$/;

export function validatePermissionKey(key: string): { ok: boolean; reason?: string } {
  if (!key || !key.trim()) return { ok: false, reason: 'permission key is required' };
  if (!PERMISSION_KEY_RE.test(key)) return { ok: false, reason: 'permission key must be lowercase, namespaced (e.g. "domain.action")' };
  return { ok: true };
}

export function isDuplicatePermissionKey(key: string): boolean {
  return CORE_PERMISSION_KEYS.has(key) || createdPermissionKeys.has(key);
}

export interface CreatePermissionRequest {
  key: string;
  displayName: string;
  description?: string;
  scope?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  allowedRoles?: string[];
  active?: boolean;
  confirm?: boolean;
}

export function builderCreatePermission(req: CreatePermissionRequest, actorId: string) {
  const v = validatePermissionKey(req.key);
  if (!v.ok) throw new BuilderValidationError(v.reason!);
  if (isDuplicatePermissionKey(req.key)) {
    superAdminAudit.record({ type: 'action.blocked', actorId, outcome: 'blocked', reason: `duplicate permission key: ${req.key}` });
    throw new BuilderValidationError(`Permission key already exists: ${req.key}`);
  }
  if (!req.confirm) throw new ConfirmationRequiredError();
  createdPermissionKeys.add(req.key);
  const object = commitBuilderObject('BradGeneratedPermissionDraft', {
    key: req.key,
    displayName: req.displayName,
    description: req.description ?? '',
    scope: req.scope ?? 'agency',
    riskLevel: req.riskLevel ?? 'low',
    allowedRoles: req.allowedRoles ?? [],
    active: req.active ?? false,
    note: 'Draft permission object. Application to the live RBAC model requires the existing admin workflow.',
  }, actorId);
  return { object };
}

/* ─── Create Role / Permission Group ─────────────────────────────────────────*/

const FORBIDDEN_ROLE_GRANT_RE = /(super[\s._-]?admin|owner|editor)/i;

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions?: string[];
  defaultRoute?: string;
  accessTier?: string;
  effectiveDate?: string;
  confirm?: boolean;
  currentUserId?: string;
}

export function builderCreateRole(req: CreateRoleRequest, actorId: string) {
  const name = String(req.name ?? '').trim();
  if (!name) throw new BuilderValidationError('role/group name is required');
  if (FORBIDDEN_ROLE_GRANT_RE.test(name) || FORBIDDEN_ROLE_GRANT_RE.test(req.accessTier ?? '')) {
    superAdminAudit.record({ type: 'action.blocked', actorId, outcome: 'blocked', reason: `role grant blocked (super admin / owner / editor): ${name}` });
    throw new BuilderValidationError('Roles cannot grant Super Admin / Owner / Editor.');
  }
  const perms = (req.permissions ?? []).filter(Boolean);
  const forbidden = perms.filter((p) => FORBIDDEN_ROLE_GRANT_RE.test(p) || /approve\./.test(p));
  if (forbidden.length) {
    superAdminAudit.record({ type: 'action.blocked', actorId, outcome: 'blocked', reason: `role permission grant blocked: ${forbidden.join(', ')}` });
    throw new BuilderValidationError(`Role cannot include elevated permissions: ${forbidden.join(', ')}`);
  }
  if (!req.confirm) throw new ConfirmationRequiredError();
  const object = commitBuilderObject('BradGeneratedRoleDraft', {
    name,
    description: req.description ?? '',
    permissionDiff: { added: perms, removed: [] },
    defaultRoute: req.defaultRoute ?? '/iadministrator',
    accessTier: req.accessTier ?? 'standard',
    effectiveDate: req.effectiveDate ?? null,
    note: 'Draft role object. Cannot grant Super Admin / Owner / Editor. Application requires the existing admin workflow.',
  }, actorId);
  return { object, permissionDiff: { added: perms, removed: [] } };
}

/* ─── Mass Add Users ─────────────────────────────────────────────────────────*/

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = new Set(['clinician', 'supervisor', 'admin', 'qa', 'viewer', 'scheduler']);
// Emails already in the system (synthetic) — used for duplicate detection.
const EXISTING_USER_EMAILS = new Set<string>(['robertp@careindeed.com', 'jtorres@careindeed.com']);

export interface MassAddRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  department?: string;
  startDate?: string;
  supervisor?: string;
}

export interface MassAddAnnotatedRow extends MassAddRow {
  index: number;
  issues: string[];
  risky: boolean;
  duplicate: boolean;
  invalid: boolean;
}

export interface MassAddSummary {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
  risky: number;
  rows: MassAddAnnotatedRow[];
}

export function classifyMassAddRows(rows: MassAddRow[]): MassAddSummary {
  const seen = new Set<string>();
  const annotated: MassAddAnnotatedRow[] = rows.map((r, index) => {
    const issues: string[] = [];
    const email = (r.email ?? '').trim().toLowerCase();
    const role = (r.role ?? '').trim().toLowerCase();
    if (!r.firstName?.trim()) issues.push('missing first name');
    if (!r.lastName?.trim()) issues.push('missing last name');
    if (!EMAIL_RE.test(email)) issues.push('invalid email');
    if (!VALID_ROLES.has(role)) issues.push(`invalid role: ${r.role ?? '(none)'}`);

    // Risky: any attempt to grant elevated access via mass add is rejected outright.
    const risky = FORBIDDEN_ROLE_GRANT_RE.test(role) || EXISTING_USER_EMAILS.has(email)
      ? FORBIDDEN_ROLE_GRANT_RE.test(role)
      : false;
    if (FORBIDDEN_ROLE_GRANT_RE.test(role)) issues.push('Super Admin / elevated roles cannot be assigned via mass add');

    const duplicate = (!!email && (EXISTING_USER_EMAILS.has(email) || seen.has(email)));
    if (duplicate) issues.push('duplicate email');
    if (email) seen.add(email);

    const invalid = issues.some((i) => i.startsWith('missing') || i.startsWith('invalid'));
    return { ...r, index, issues, risky, duplicate, invalid };
  });

  return {
    total: annotated.length,
    valid: annotated.filter((r) => r.issues.length === 0).length,
    duplicates: annotated.filter((r) => r.duplicate).length,
    invalid: annotated.filter((r) => r.invalid).length,
    risky: annotated.filter((r) => r.risky).length,
    rows: annotated,
  };
}

export function builderMassAddDryRun(rows: MassAddRow[]) {
  return classifyMassAddRows(rows);
}

export function builderMassAddCommit(rows: MassAddRow[], confirm: boolean | undefined, actorId: string) {
  const summary = classifyMassAddRows(rows);
  if (summary.risky > 0) {
    superAdminAudit.record({ type: 'action.blocked', actorId, outcome: 'blocked', reason: 'mass add blocked — elevated/Super Admin role assignment attempted' });
    throw new BuilderValidationError('Mass add rejected: Super Admin / elevated roles cannot be created via mass add.');
  }
  if (!confirm) throw new ConfirmationRequiredError();
  const object = commitBuilderObject('BradGeneratedUserImportDraft', {
    summary,
    note: 'Draft user import only. Real user-creation backend is NOT wired — this object records the validated intent for review/export. No accounts were created.',
  }, actorId);
  return { object, summary, blocker: 'Real user-creation backend not wired — draft object only; no accounts created.' };
}

/* ─── Build Reusable Reports ─────────────────────────────────────────────────*/

export const REUSABLE_REPORT_TYPES = [
  'Event Readiness Report', 'QAPI Meeting Packet Report', 'Cross-Walk Defensibility Report',
  'Staff Training Gap Report', 'Evidence Readiness Report', 'Policy Update Review Report',
  'Generated Object Activity Report', 'Cloud Change Activity Report',
] as const;

export interface CreateReportTemplateRequest {
  name: string;
  reportType: string;
  description?: string;
  sourceDomains?: string[];
  filters?: Record<string, unknown>;
  requiredSourceObjects?: string[];
  outputFormat?: string;
  schedule?: string;
  owner?: string;
  accessRoles?: string[];
  reviewRequirements?: string;
  exportOptions?: string[];
  status?: 'draft' | 'active' | 'retired';
  confirm?: boolean;
}

export function builderCreateReportTemplate(req: CreateReportTemplateRequest, actorId: string) {
  const name = String(req.name ?? '').trim();
  if (!name) throw new BuilderValidationError('report name is required');
  if (!req.reportType) throw new BuilderValidationError('report type is required');
  if (!req.confirm) throw new ConfirmationRequiredError();
  // Version = count of existing templates with the same name + 1 (versioned, never overwrite canonical).
  const store = getGeneratedObjectStore();
  const existing = store.list({ objectType: 'BradGeneratedReportTemplate' })
    .filter((o) => (o.content as { name?: string })?.name === name);
  const version = existing.length + 1;
  const object = commitBuilderObject('BradGeneratedReportTemplate', {
    name,
    reportType: req.reportType,
    description: req.description ?? '',
    sourceDomains: req.sourceDomains ?? [],
    filters: req.filters ?? {},
    requiredSourceObjects: req.requiredSourceObjects ?? [],
    outputFormat: req.outputFormat ?? 'pdf',
    schedule: req.schedule ?? null,
    owner: req.owner ?? actorId,
    accessRoles: req.accessRoles ?? [],
    reviewRequirements: req.reviewRequirements ?? 'human-review-required',
    exportOptions: req.exportOptions ?? ['pdf'],
    status: req.status ?? 'draft',
    version,
    traceability: { kind: 'reusable-report-template', sourceTruth: 'Brad source snapshot at run time' },
  }, actorId);
  return { object, version };
}

export function builderListReportTemplates() {
  return getGeneratedObjectStore().list({ objectType: 'BradGeneratedReportTemplate' });
}

/* ─── Build New Component (spec only — never modifies code) ───────────────────*/

export interface CreateComponentSpecRequest {
  componentName: string;
  targetArea?: string;
  purpose?: string;
  dataSources?: string[];
  permissionsNeeded?: string[];
  actionsAllowed?: string[];
  uiNotes?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  acceptanceCriteria?: string[];
  confirm?: boolean;
}

export function builderCreateComponentSpec(req: CreateComponentSpecRequest, actorId: string) {
  const name = String(req.componentName ?? '').trim();
  if (!name) throw new BuilderValidationError('component name is required');
  if (!req.confirm) throw new ConfirmationRequiredError();
  const object = commitBuilderObject('BradGeneratedComponentSpec', {
    componentName: name,
    targetArea: req.targetArea ?? '',
    purpose: req.purpose ?? '',
    dataSources: req.dataSources ?? [],
    permissionsNeeded: req.permissionsNeeded ?? [],
    actionsAllowed: req.actionsAllowed ?? [],
    uiNotes: req.uiNotes ?? '',
    riskLevel: req.riskLevel ?? 'low',
    acceptanceCriteria: req.acceptanceCriteria ?? [],
    note: 'Component REQUEST spec only. Brad does not modify core UI files, auto-commit, deploy, or create production routes from Builder.',
  }, actorId);
  return { object };
}

/* ─── Review Pending Builder Changes ─────────────────────────────────────────*/

const BUILDER_OBJECT_TYPES: BradObjectType[] = [
  'BradGeneratedPermissionDraft', 'BradGeneratedRoleDraft', 'BradGeneratedUserImportDraft',
  'BradGeneratedReportTemplate', 'BradGeneratedComponentSpec', 'BradGeneratedOtpRecord',
  'BradGeneratedChangeSet', 'BradGeneratedCloudChangeSet',
];

export function builderListPending() {
  const store = getGeneratedObjectStore();
  const objects = BUILDER_OBJECT_TYPES.flatMap((t) => store.list({ objectType: t }));
  // newest first
  objects.sort((a, b) => (a.metadata.generated_at < b.metadata.generated_at ? 1 : -1));
  return objects;
}

/** Test-only reset of in-memory registries. */
export function __resetBuilderRegistries(): void {
  createdPermissionKeys.clear();
}
