import { useState } from 'react';
import { AlertTriangle, ClipboardCheck, FileCheck2, KeyRound, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import { DataTable, SurfaceCard, type DataTableColumn, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { cx } from '../../utils/classNames';

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

interface PermissionGovernanceCard extends SurfaceCardData {
  meta: readonly [string, string][];
}

const permissionTabs = [
  { id: 'matrix', label: 'Permission Matrix' },
  { id: 'roles', label: 'Roles Using It' },
  { id: 'governance', label: 'Governance' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'control-path', label: 'Control Path' },
] as const;

type PermissionTabId = (typeof permissionTabs)[number]['id'];

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
  const [activeTab, setActiveTab] = useState<PermissionTabId>('matrix');

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-permissions"
      data-route="/admin/permissions"
      data-template="matrix"
    >
      <section className="grid gap-xl rounded-lg border border-card bg-surface/90 p-xl shadow-rest backdrop-blur-xl">
        <nav aria-label="Permission detail tabs" className="flex gap-lg overflow-x-auto border-b border-hairline pb-xs">
          {permissionTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={cx(
                'shrink-0 border-b-2 px-xs pb-md text-sm font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                activeTab === tab.id
                  ? 'border-brand-teal text-brand-teal'
                  : 'border-transparent text-secondary hover:border-tone-teal-border hover:text-brand-teal',
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'matrix' && (
          <section className="grid gap-lg" aria-label="Admin permissions catalog matrix" role="tabpanel">
            <DataTable columns={permissionColumns} label="Admin permissions catalog matrix" rows={permissionRows} />
          </section>
        )}

        {activeTab === 'roles' && (
          <section className="grid gap-lg" aria-labelledby="roles-using-permissions-title" role="tabpanel">
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
        )}

        {activeTab === 'governance' && (
          <section className="grid gap-lg desktop:grid-cols-3" aria-label="Permission governance cards" role="tabpanel">
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
          </section>
        )}

        {activeTab === 'evidence' && (
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="permission-audit-trail-title" role="tabpanel">
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
        )}

        {activeTab === 'control-path' && (
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" aria-labelledby="permission-control-path-title" role="tabpanel">
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
        )}
      </section>
    </section>
  );
}

export default AdminPermissionsScreen;
