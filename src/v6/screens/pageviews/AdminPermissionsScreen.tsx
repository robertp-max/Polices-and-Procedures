import { AlertTriangle, ClipboardCheck, FileCheck2, KeyRound, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import {
  DataTable,
  MetricGrid,
  SurfaceCard,
  ToneTag,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../../components';
import { Badge, ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';

interface PermissionRow extends Record<string, string> {
  capability: string;
  permissionKey: string;
  readinessStatus: string;
  riskStatus: string;
  rolesUsing: string;
  scope: string;
}

interface RoleUsageRow extends Record<string, string> {
  governedBy: string;
  permissionSet: string;
  readinessStatus: string;
  roleName: string;
  usage: string;
}

interface ScopePanel {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface PermissionGovernanceCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const permissionMetrics = [
  { label: 'Permissions', value: '64', helper: 'Cataloged RBAC capabilities', tone: 'teal' },
  { label: 'Privileged', value: '12', helper: 'Require elevated governance', tone: 'orange' },
  { label: 'Dual control', value: '7', helper: 'Two-person approval required', tone: 'amber' },
  { label: 'Survey ready', value: '91%', helper: 'Reviewed permission evidence', tone: 'green' },
] satisfies readonly MetricTileData[];

const permissionRows: readonly PermissionRow[] = [
  {
    capability: 'Create, deactivate, and reassign platform users',
    permissionKey: 'user.provision',
    readinessStatus: 'validated',
    riskStatus: 'locked',
    rolesUsing: 'Platform Owner, Security Admin',
    scope: 'Full platform administration and audit trail',
  },
  {
    capability: 'Assign roles, groups, and emergency access windows',
    permissionKey: 'role.assign',
    readinessStatus: 'ready',
    riskStatus: 'review-required',
    rolesUsing: 'Security Admin, Administrator',
    scope: 'Admin membership and RBAC posture',
  },
  {
    capability: 'Approve, publish, and supersede agency policies',
    permissionKey: 'policy.approve',
    readinessStatus: 'approved',
    riskStatus: 'locked',
    rolesUsing: 'Administrator, Compliance Officer',
    scope: 'Policy lifecycle and governance packet',
  },
  {
    capability: 'Export evidence packets for survey or QAPI review',
    permissionKey: 'audit.export',
    readinessStatus: 'ready',
    riskStatus: 'active',
    rolesUsing: 'Compliance Officer, QAPI Lead',
    scope: 'Evidence Center, Audit Mode, CES reports',
  },
  {
    capability: 'Complete assigned eCIgn attestations and certificates',
    permissionKey: 'forms.sign',
    readinessStatus: 'validated',
    riskStatus: 'pending',
    rolesUsing: 'Field RN, Employee, Administrator',
    scope: 'Assigned forms and signature workspace',
  },
  {
    capability: 'Edit onboarding catalog, batches, and clearance gates',
    permissionKey: 'journey.admin',
    readinessStatus: 'awaiting',
    riskStatus: 'review-required',
    rolesUsing: 'Onboarding Admin, HR Credentialing',
    scope: 'Journey admin and onboarding v2 activation',
  },
  {
    capability: 'View assigned patient PHI and clinical task context',
    permissionKey: 'patients.readPhi',
    readinessStatus: 'ready',
    riskStatus: 'attention',
    rolesUsing: 'Clinical Manager, Field RN',
    scope: 'Assigned patient rosters and case detail',
  },
  {
    capability: 'Open a dual-signature override for blocked workflow gates',
    permissionKey: 'governance.override',
    readinessStatus: 'review-required',
    riskStatus: 'warning',
    rolesUsing: 'Administrator, QAPI Lead',
    scope: 'Onboarding overrides and workflow exception review',
  },
];

const permissionColumns: readonly DataTableColumn<PermissionRow>[] = [
  { key: 'permissionKey', label: 'Permission' },
  { key: 'capability', label: 'Capability' },
  { key: 'scope', label: 'Scope' },
  { key: 'rolesUsing', label: 'Roles using it' },
  { key: 'riskStatus', label: 'Risk', status: true },
  { key: 'readinessStatus', label: 'Readiness', status: true },
];

const roleUsageRows: readonly RoleUsageRow[] = [
  {
    governedBy: 'Administrator plus Compliance Officer',
    permissionSet: 'user.provision, role.assign, policy.approve',
    readinessStatus: 'locked',
    roleName: 'Platform Owner',
    usage: 'Owns privileged platform controls',
  },
  {
    governedBy: 'Compliance Council',
    permissionSet: 'audit.export, policy.approve, governance.override',
    readinessStatus: 'validated',
    roleName: 'Compliance Officer',
    usage: 'Prepares survey packets and lifecycle approvals',
  },
  {
    governedBy: 'QAPI Lead reviewer',
    permissionSet: 'audit.export, governance.override',
    readinessStatus: 'ready',
    roleName: 'QAPI Lead',
    usage: 'Reviews packets, corrective action evidence, and exceptions',
  },
  {
    governedBy: 'Director of Nursing',
    permissionSet: 'patients.readPhi, forms.sign',
    readinessStatus: 'active',
    roleName: 'Clinical Manager',
    usage: 'Reviews clinical case context and signs assigned forms',
  },
  {
    governedBy: 'HR Credentialing',
    permissionSet: 'journey.admin, forms.sign',
    readinessStatus: 'awaiting',
    roleName: 'Onboarding Admin',
    usage: 'Maintains clearance gates and catalog assignments',
  },
];

const roleUsageColumns: readonly DataTableColumn<RoleUsageRow>[] = [
  { key: 'roleName', label: 'Role' },
  { key: 'usage', label: 'Usage' },
  { key: 'permissionSet', label: 'Permission set' },
  { key: 'governedBy', label: 'Governed by' },
  { key: 'readinessStatus', label: 'Readiness', status: true },
];

const scopePanels = [
  {
    detail: 'User provisioning, role assignment, and policy approval stay locked behind owner confirmation and timestamped rationale.',
    label: 'Privileged admin scope',
    status: 'locked',
    tone: 'slate',
    value: '12 permissions',
  },
  {
    detail: 'Audit export, report access, and survey packet evidence are read-mostly for QAPI and compliance reviewers.',
    label: 'Survey packet scope',
    status: 'ready',
    tone: 'teal',
    value: '18 permissions',
  },
  {
    detail: 'Patient PHI permissions stay tied to assigned clinical roles and do not grant cross-roster administration.',
    label: 'Clinical boundary',
    status: 'attention',
    tone: 'orange',
    value: '9 permissions',
  },
  {
    detail: 'Form signing and onboarding catalog controls keep signer actions separate from catalog administration.',
    label: 'Journey and forms',
    status: 'awaiting',
    tone: 'amber',
    value: '14 permissions',
  },
] satisfies readonly ScopePanel[];

const governanceCards = [
  {
    body: 'High-risk capabilities require a named owner, reviewer, reason code, and audit timestamp before role changes apply.',
    icon: LockKeyhole,
    meta: [
      ['Dual-control permissions', 'user.provision, role.assign, governance.override'],
      ['Reviewer cadence', 'Weekly for privileged roles, monthly for active roles'],
      ['Evidence output', 'RBAC export attached to survey packet'],
    ],
    progress: 88,
    status: 'locked',
    title: 'Privileged change control',
    tone: 'slate',
  },
  {
    body: 'Permission groups preserve least-privilege boundaries across admin, compliance, clinical, journey, and surveyor surfaces.',
    icon: ShieldCheck,
    meta: [
      ['Admin-only', 'Provisioning, role assignment, lifecycle transitions'],
      ['Compliance read-mostly', 'Audit exports, evidence review, governance reports'],
      ['Clinical scoped', 'Assigned patients, tasks, and signer actions'],
    ],
    progress: 91,
    status: 'validated',
    title: 'Least-privilege coverage',
    tone: 'teal',
  },
  {
    body: 'Open reviews focus on onboarding catalog edits, patient PHI boundaries, and emergency override permissions.',
    icon: AlertTriangle,
    meta: [
      ['Needs owner review', '3 permissions'],
      ['Awaiting evidence', '2 role mappings'],
      ['Next lock checkpoint', 'Jun 28, 2026'],
    ],
    progress: 64,
    status: 'review-required',
    title: 'Risk and readiness review',
    tone: 'orange',
  },
] satisfies readonly PermissionGovernanceCard[];

const auditTrailItems = [
  ['Last permission review', 'Jun 20, 2026', 'validated'],
  ['Open exceptions', '3 owner reviews', 'review-required'],
  ['Privileged approvals', '7 dual-control gates', 'locked'],
  ['Surveyor exposure', 'Read-only policy scope', 'ready'],
] as const;

export function AdminPermissionsScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-permissions"
      data-route="/admin/permissions"
      data-template="matrix"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/admin/permissions</ToneTag>
            <ToneTag tone="slate">admin-permissions</ToneTag>
            <ToneTag tone="slate">matrix</ToneTag>
            <ToneTag tone="teal">Admin</ToneTag>
            <Badge>Reference: 04-admin-permissions.png</Badge>
            <Badge>Caption: 08-admin-roles-permissions.md</Badge>
          </div>
          <p className="max-w-content text-sm font-light text-secondary">
            Permission catalog matrix mapping capabilities to scope, roles using each permission, and typed risk and
            readiness status for RBAC governance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <ToneBadge size="sm" status="validated" />
          <Badge variant="count">64 permissions</Badge>
        </div>
      </section>

      <MetricGrid metrics={permissionMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid gap-lg" aria-labelledby="admin-permissions-matrix-title">
          <div className="flex flex-wrap items-start justify-between gap-lg">
            <div className="grid gap-xs">
              <h2 className="text-h2 font-medium text-ink" id="admin-permissions-matrix-title">
                Permissions matrix
              </h2>
              <p className="max-w-content text-sm font-light text-muted">
                Permission rows use dot-notation keys and keep risk posture separate from implementation readiness so
                administrators can review sensitive capabilities without expanding every role.
              </p>
            </div>
            <ToneTag tone="orange">3 need owner review</ToneTag>
          </div>

          <DataTable columns={permissionColumns} label="Admin permissions catalog matrix" rows={permissionRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Permission scope summary">
            {scopePanels.map((panel) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={panel.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div>
                    <p className="text-tag font-light uppercase tracking-tag text-muted">{panel.label}</p>
                    <div className="mt-xs">
                      <ToneTag tone={panel.tone}>{panel.value}</ToneTag>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={panel.status} />
                </div>
                <p className="text-sm font-light text-secondary">{panel.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-lg rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="roles-using-permissions-title">
            <div className="flex flex-wrap items-start justify-between gap-lg">
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="roles-using-permissions-title">
                  Roles using permissions
                </h2>
                <p className="max-w-content text-sm font-light text-muted">
                  Role rows show bundled permission sets, governance owner, and current readiness posture.
                </p>
              </div>
              <ToneBadge size="sm" status="active" />
            </div>
            <DataTable columns={roleUsageColumns} label="Roles using permission sets" rows={roleUsageRows} />
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Permission governance cards">
          {governanceCards.map((card) => (
            <SurfaceCard card={card} key={card.title}>
              <dl className="grid gap-sm border-t border-hairline pt-md">
                {card.meta.map(([label, value]) => (
                  <div className="grid gap-xs" key={label}>
                    <dt className="text-tag font-light uppercase tracking-tag text-brand-teal">{label}</dt>
                    <dd className="text-sm font-light text-secondary">{value}</dd>
                  </div>
                ))}
              </dl>
            </SurfaceCard>
          ))}

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="permission-audit-trail-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="permission-audit-trail-title">
                  Governance evidence
                </h2>
                <p className="text-sm font-light text-muted">
                  Review evidence captures permission owner, reviewer, role bundle, reason code, and timestamp.
                </p>
              </div>
            </div>
            <div className="grid gap-sm">
              {auditTrailItems.map(([label, value, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={label}>
                  <div>
                    <p className="text-tag font-light uppercase tracking-tag text-muted">{label}</p>
                    <p className="mt-xs text-sm font-light text-ink">{value}</p>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="permission-control-path-title">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                <KeyRound aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="grid gap-xs">
                <h2 className="text-h2 font-medium text-ink" id="permission-control-path-title">
                  Control path
                </h2>
                <p className="text-sm font-light text-muted">
                  RBAC changes flow from permission key to role set, user group, approval evidence, and audit packet.
                </p>
              </div>
            </div>
            <div className="grid gap-sm">
              {[
                { icon: UserCog, label: 'Role bundle', value: 'Permission sets assigned to named roles' },
                { icon: ClipboardCheck, label: 'Approval record', value: 'Owner reason and reviewer initials retained' },
                { icon: FileCheck2, label: 'Audit packet', value: 'Validated export ready for survey review' },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div className="flex items-start gap-md rounded-md bg-tone-slate-bg p-md" key={item.label}>
                    <Icon aria-hidden="true" className="mt-xs h-icon-sm w-icon-sm shrink-0 text-brand-teal" />
                    <div className="grid gap-xs">
                      <p className="text-tag font-light uppercase tracking-tag text-secondary">{item.label}</p>
                      <p className="text-sm font-light text-ink">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}

export default AdminPermissionsScreen;
