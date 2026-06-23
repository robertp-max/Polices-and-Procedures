import { useState } from 'react';
import { ClipboardCheck, FileCheck2, LockKeyhole, ShieldCheck, UserCog } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, ToneTag, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import { USER_GROUPS } from '@/policy/security/identity/userGroups';
import { PERMISSION_CATALOG, PERMISSION_BY_ID } from '@/policy/security/identity/permissionCatalog';
import { ROLE_ASSIGNMENTS } from '@/policy/security/identity/roleAssignments';
import type { PermissionId } from '@/policy/security/identity/types';

// --- Real seed derivations (USER_GROUPS + PERMISSION_CATALOG + ROLE_ASSIGNMENTS) ---

// Member count per group derived from active (non-revoked) role assignments.
const MEMBER_COUNT_BY_GROUP = ROLE_ASSIGNMENTS.reduce<Record<string, number>>((acc, assignment) => {
  if (assignment.revokedAt) return acc;
  acc[assignment.groupId] = (acc[assignment.groupId] ?? 0) + 1;
  return acc;
}, {});

// Privileged permissions = admin-capable or PHI-write scopes from the real catalog.
const PRIVILEGED_PERMISSIONS = new Set<PermissionId>([
  'user.provision',
  'user.suspend',
  'policy.approve',
  'policy.publish',
  'ceu.override',
  'audit.export',
  'phi.write',
  'system.replay',
]);

const isPrivilegedGroup = (permissions: PermissionId[]): boolean =>
  permissions.some((permission) => PRIVILEGED_PERMISSIONS.has(permission));

// Permission posture derived honestly from the group's granted scope, not invented.
const derivePosture = (permissions: PermissionId[]): string => {
  if (permissions.length === 0) return 'review-required';
  if (permissions.includes('user.provision') && permissions.includes('system.replay')) return 'locked';
  if (isPrivilegedGroup(permissions)) return 'validated';
  return 'ready';
};

const formatScope = (permissions: PermissionId[]): string =>
  permissions.length === 0
    ? '—'
    : permissions
        .map((permission) => PERMISSION_BY_ID[permission]?.description ?? permission)
        .join(' ');

const roleRecords = USER_GROUPS.map((group) => ({
  group,
  posture: derivePosture(group.permissions),
  members: MEMBER_COUNT_BY_GROUP[group.id] ?? 0,
}));

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
  { label: 'Roles', value: String(USER_GROUPS.length), helper: 'Active platform roles', tone: 'teal' },
  {
    label: 'Privileged',
    value: String(USER_GROUPS.filter((group) => isPrivilegedGroup(group.permissions)).length),
    helper: 'Admin-capable scopes',
    tone: 'orange',
  },
  {
    label: 'Group links',
    value: String(ROLE_ASSIGNMENTS.filter((assignment) => !assignment.revokedAt).length),
    helper: 'Mapped user-group bindings',
    tone: 'green',
  },
  {
    label: 'Review exceptions',
    value: String(USER_GROUPS.filter((group) => group.permissions.length === 0).length),
    helper: 'Need owner attestation',
    tone: 'amber',
  },
] satisfies readonly MetricTileData[];

const roleRows: readonly AdminRoleRow[] = roleRecords.map(({ group, posture, members }) => ({
  permissionPosture: posture,
  privilegeScope: formatScope(group.permissions),
  reviewCadence: `${group.permissions.length} permission${group.permissions.length === 1 ? '' : 's'} granted`,
  roleId: group.id,
  roleName: group.name,
  userGroupLinks: members === 0 ? '—' : `${members} assigned member${members === 1 ? '' : 's'}`,
}));

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

const permissionPosture: readonly PermissionPosture[] = PERMISSION_CATALOG.map((permission) => {
  const holders = USER_GROUPS.filter((group) => group.permissions.includes(permission.id));
  return {
    permission: permission.description,
    posture: PRIVILEGED_PERMISSIONS.has(permission.id) ? 'validated' : 'ready',
    roles: holders.length === 0 ? '—' : holders.map((group) => group.name).join(', '),
  };
});

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
      <MetricGrid metrics={roleMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid content-start gap-lg" aria-label="Admin roles permission matrix">
          <DataTable columns={roleColumns} label="Admin roles permission matrix" rows={roleRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Privilege scope summary">
            {scopeReviews.map((scope) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={scope.label}>
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
          <nav aria-label="Role review tabs" className="flex gap-xs overflow-x-auto rounded-lg border border-card bg-surface/90 p-xs shadow-rest backdrop-blur-xl">
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
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" role="tabpanel">
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
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" role="tabpanel">
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
