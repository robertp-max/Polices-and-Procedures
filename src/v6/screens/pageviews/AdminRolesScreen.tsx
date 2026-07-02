import { useState } from 'react';
import { ClipboardCheck, FileCheck2, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

interface AdminRoleRow extends Record<string, string> {
  permissionPosture: string;
  privilegeScope: string;
  reviewCadence: string;
  roleId: string;
  roleName: string;
  userGroupLinks: string;
}

interface ScopeReview {
  detail: string;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface PermissionPosture {
  permission: string;
  posture: string;
  roles: string;
}

const roleMetrics = [
  { label: 'Roles', value: '8', helper: 'Active platform roles', tone: 'teal' },
  { label: 'Privileged', value: '3', helper: 'Admin-capable scopes', tone: 'orange' },
  { label: 'Group links', value: '12', helper: 'Mapped user-group bindings', tone: 'green' },
  { label: 'Review exceptions', value: '2', helper: 'Need owner attestation', tone: 'amber' },
] satisfies readonly MetricTileData[];

const roleRows: readonly AdminRoleRow[] = [
  {
    permissionPosture: 'locked',
    privilegeScope: 'Full platform administration, provisioning, audit export',
    reviewCadence: 'Dual control on every change',
    roleId: 'role-platform-owner',
    roleName: 'Platform Owner',
    userGroupLinks: 'Super Admin',
  },
  {
    permissionPosture: 'active',
    privilegeScope: 'Policy lifecycle, CES execution, evidence packet release',
    reviewCadence: 'Monthly compliance sign-off',
    roleId: 'role-compliance-officer',
    roleName: 'Compliance Officer',
    userGroupLinks: 'Compliance Council',
  },
  {
    permissionPosture: 'validated',
    privilegeScope: 'QAPI reports, corrective actions, governing-body exports',
    reviewCadence: 'Quarterly packet review',
    roleId: 'role-qapi-lead',
    roleName: 'QAPI Lead',
    userGroupLinks: 'Compliance Council, QAPI Review',
  },
  {
    permissionPosture: 'ready',
    privilegeScope: 'Clinical tasks, patient roster visibility, visit evidence',
    reviewCadence: 'Credential-cycle review',
    roleId: 'role-clinical-manager',
    roleName: 'Clinical Manager',
    userGroupLinks: 'Clinical RN, Field Supervisors',
  },
  {
    permissionPosture: 'review-required',
    privilegeScope: 'Journey catalog, activation batches, clearance overrides',
    reviewCadence: 'Owner attestation pending',
    roleId: 'role-onboarding-admin',
    roleName: 'Onboarding Admin',
    userGroupLinks: 'Onboarding Operations',
  },
  {
    permissionPosture: 'pending',
    privilegeScope: 'Appendix F checks, personnel documents, credential gates',
    reviewCadence: 'Awaiting HR review',
    roleId: 'role-hr-credentialing',
    roleName: 'HR Credentialing',
    userGroupLinks: 'Onboarding Operations',
  },
  {
    permissionPosture: 'approved',
    privilegeScope: 'Read-only policy viewer, audit packet, deficiency notes',
    reviewCadence: 'Expires with survey packet',
    roleId: 'role-external-surveyor',
    roleName: 'External Surveyor',
    userGroupLinks: 'Surveyor Read-only',
  },
  {
    permissionPosture: 'attention',
    privilegeScope: 'Hubstaff review, billing exports, visit-log reconciliation',
    reviewCadence: 'Scope reduction in progress',
    roleId: 'role-business-office',
    roleName: 'Business Office Reviewer',
    userGroupLinks: 'Business Office',
  },
];

const roleColumns: readonly DataTableColumn<AdminRoleRow>[] = [
  { key: 'roleName', label: 'Role' },
  { key: 'privilegeScope', label: 'Privilege scope' },
  { key: 'userGroupLinks', label: 'User-group links' },
  { key: 'reviewCadence', label: 'Review cadence' },
  { key: 'permissionPosture', label: 'Permission posture', status: true },
];

const reviewCards = [
  {
    body: 'Privileged roles remain constrained to named groups with dual-control records for provisioning, export, and lifecycle changes.',
    icon: LockKeyhole,
    progress: 88,
    status: 'locked',
    title: 'Privilege boundary',
    tone: 'slate',
  },
  {
    body: 'Onboarding Admin and Business Office Reviewer need owner confirmation before the next administrative access packet closes.',
    icon: ClipboardCheck,
    progress: 64,
    status: 'review-required',
    title: 'Owner attestation',
    tone: 'orange',
  },
  {
    body: 'Compliance, QAPI, and clinical manager roles are mapped to group links that preserve least-privilege access by workstream.',
    icon: ShieldCheck,
    progress: 82,
    status: 'validated',
    title: 'Role-to-group linkage',
    tone: 'teal',
  },
] satisfies readonly SurfaceCardData[];

const scopeReviews: readonly ScopeReview[] = [
  {
    detail: 'Provisioning, lifecycle transitions, and audit export remain limited to Super Admin owners.',
    label: 'Admin control',
    status: 'locked',
    tone: 'slate',
    value: '1 role',
  },
  {
    detail: 'Policy, CES, evidence, QAPI, and governance scopes stay paired with compliance council groups.',
    label: 'Compliance access',
    status: 'validated',
    tone: 'teal',
    value: '3 roles',
  },
  {
    detail: 'Clinical and onboarding roles can act on assigned work without inheriting platform administration.',
    label: 'Operations scopes',
    status: 'ready',
    tone: 'green',
    value: '3 roles',
  },
  {
    detail: 'External surveyor and business-office roles remain read-mostly with explicit export restrictions.',
    label: 'Restricted lanes',
    status: 'attention',
    tone: 'orange',
    value: '2 roles',
  },
];

const permissionPosture: readonly PermissionPosture[] = [
  { permission: 'User administration', posture: 'locked', roles: 'Platform Owner' },
  { permission: 'Audit packet export', posture: 'validated', roles: 'Platform Owner, Compliance Officer, QAPI Lead' },
  { permission: 'Journey administration', posture: 'review-required', roles: 'Onboarding Admin' },
  { permission: 'Assigned patient access', posture: 'ready', roles: 'Clinical Manager' },
  { permission: 'Surveyor viewer access', posture: 'approved', roles: 'External Surveyor' },
];

const reviewQueue = [
  ['Last attestation', 'Jun 18, 2026', 'validated'],
  ['Next review', 'Jul 1, 2026', 'upcoming'],
  ['Open exceptions', '2 role scopes', 'review-required'],
  ['Evidence packet', 'Ready for admin review', 'ready'],
] as const;

const rolePanelTabs = [
  { id: 'review', label: 'Review' },
  { id: 'posture', label: 'Posture' },
  { id: 'trail', label: 'Trail' },
] as const;

type RolePanelTabId = (typeof rolePanelTabs)[number]['id'];

export function AdminRolesScreen() {
  const [activePanel, setActivePanel] = useState<RolePanelTabId>('review');

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-roles"
      data-route="/admin/roles"
      data-template="matrix"
    >
      <div className="sr-only"><h1>Roles</h1></div>
      <MetricGrid metrics={roleMetrics} />

      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="grid content-start gap-lg" aria-label="Admin roles permission matrix">
          <DataTable columns={roleColumns} label="Admin roles permission matrix" rows={roleRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Privilege scope summary">
            {scopeReviews.map((scope) => (
              <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest" key={scope.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{scope.label}</p>
                    <div className="mt-xs">
                      <ToneTag tone={scope.tone}>{scope.value}</ToneTag>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={scope.status} />
                </div>
                <p className="text-sm text-secondary">{scope.detail}</p>
              </article>
            ))}
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Admin role review panels">
          <nav aria-label="Role review tabs" className="flex gap-xs overflow-x-auto rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset/90 p-xs shadow-rest backdrop-blur-xl">
            {rolePanelTabs.map((tab) => (
              <button
                aria-selected={activePanel === tab.id}
                className={cx(
                  'min-h-tap shrink-0 rounded-md px-md text-sm font-medium transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                  activePanel === tab.id
                    ? 'bg-brand-teal text-on-brand shadow-rest'
                    : 'text-secondary hover:bg-surface-hover hover:text-brand-teal',
                )}
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activePanel === 'review' && (
            <section className="grid gap-md" aria-label="Role review summary" role="tabpanel">
              {reviewCards.map((card) => (
                <SurfaceCard card={card} key={card.title} />
              ))}
            </section>
          )}

          {activePanel === 'posture' && (
            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest" role="tabpanel">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div className="grid gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCog aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink">Permission posture preview</h2>
                  <p className="mt-xs text-sm text-muted">
                    Sensitive access areas stay visible next to the roles allowed to hold them.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="ready" />
            </div>

            <div className="divide-y divide-hairline">
              {permissionPosture.map((item) => (
                <div className="grid gap-sm py-md first:pt-0 last:pb-0" key={item.permission}>
                  <div className="flex flex-wrap items-center justify-between gap-sm">
                    <span className="text-xs font-medium text-brand-teal">{item.permission}</span>
                    <ToneBadge size="sm" status={item.posture} />
                  </div>
                  <p className="text-sm text-secondary">{item.roles}</p>
                </div>
              ))}
            </div>
            </section>
          )}

          {activePanel === 'trail' && (
            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest" role="tabpanel">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink">Review trail</h2>
                <p className="mt-xs text-sm text-muted">
                  Role changes retain owner reason, reviewer initials, timestamp, and route trace for the admin packet.
                </p>
              </div>
            </div>
            <div className="divide-y divide-hairline">
              {reviewQueue.map(([label, value, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md py-md first:pt-0 last:pb-0" key={label}>
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{label}</p>
                    <p className="mt-xs text-sm text-ink">{value}</p>
                  </div>
                  <ToneBadge size="sm" status={status} />
                </div>
              ))}
            </div>
            </section>
          )}
        </aside>
      </section>
    </section>
  );
}

export default AdminRolesScreen;
