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

// Access scope text derived from the group's real permission descriptions.
const formatScope = (permissions: PermissionId[]): string =>
  permissions.length === 0
    ? '—'
    : permissions
        .map((permission) => PERMISSION_BY_ID[permission]?.description ?? permission)
        .join(' ');

interface AdminGroupRow extends Record<string, string> {
  accessScope: string;
  groupId: string;
  groupName: string;
  members: string;
  permissionPosture: string;
  roleLinks: string;
}

interface ScopeTile {
  helper: string;
  label: string;
  status: string;
  tone: Tone;
  value: string;
}

interface PermissionPreview {
  groups: string;
  permission: string;
  posture: string;
}

const totalMembers = Object.values(MEMBER_COUNT_BY_GROUP).reduce((sum, count) => sum + count, 0);
const limitedGroups = USER_GROUPS.filter((group) => group.permissions.length === 0).length;
const dualControlGroups = USER_GROUPS.filter((group) => isPrivilegedGroup(group.permissions)).length;

const groupMetrics: readonly MetricTileData[] = [
  { label: 'Groups', value: String(USER_GROUPS.length), helper: 'Governed RBAC cohorts', tone: 'teal' },
  { label: 'Members', value: String(totalMembers), helper: 'Assigned active users', tone: 'green' },
  { label: 'Limited', value: String(limitedGroups), helper: 'Scopes under review', tone: 'orange' },
  { label: 'Dual control', value: String(dualControlGroups), helper: 'Privileged changes gated', tone: 'amber' },
];

const groupRows: readonly AdminGroupRow[] = USER_GROUPS.map((group) => ({
  accessScope: formatScope(group.permissions),
  groupId: group.id,
  groupName: group.name,
  members: String(MEMBER_COUNT_BY_GROUP[group.id] ?? 0),
  permissionPosture: derivePosture(group.permissions),
  roleLinks: '—',
}));

const groupColumns: readonly DataTableColumn<AdminGroupRow>[] = [
  { key: 'groupName', label: 'Group' },
  { key: 'accessScope', label: 'Access scope' },
  { key: 'roleLinks', label: 'Role links' },
  { key: 'members', label: 'Members' },
  { key: 'permissionPosture', label: 'Permission posture', status: true },
];

const groupPanelTabs = [
  { id: 'guardrails', label: 'Guardrails' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'evidence', label: 'Evidence' },
] as const;

type GroupPanelTabId = (typeof groupPanelTabs)[number]['id'];

const governanceCards: readonly SurfaceCardData[] = [
  {
    body: 'Super Admin and provisioning cohorts stay locked behind administrator plus compliance confirmation before membership changes apply.',
    icon: LockKeyhole,
    progress: 91,
    status: 'locked',
    title: 'Privileged access guardrail',
    tone: 'slate',
  },
  {
    body: 'Clinical, onboarding, and business office groups retain scoped access so PHI, HR clearance, and export permissions do not bleed across roles.',
    icon: ShieldCheck,
    progress: 84,
    status: 'validated',
    title: 'Least-privilege posture',
    tone: 'teal',
  },
  {
    body: 'Two group scopes need owner review before the next survey packet release because linked roles changed this week.',
    icon: ClipboardCheck,
    progress: 68,
    status: 'review-required',
    title: 'Quarterly access review',
    tone: 'orange',
  },
];

const scopeTiles: readonly ScopeTile[] = [
  {
    helper: 'Full administrative path, user provisioning, policy lifecycle transitions, and audit export.',
    label: 'Platform control',
    status: 'locked',
    tone: 'slate',
    value: '8 users',
  },
  {
    helper: 'Evidence, CES, QAPI, and governance access remain grouped for survey-readiness work.',
    label: 'Compliance scope',
    status: 'active',
    tone: 'teal',
    value: '18 users',
  },
  {
    helper: 'Field care and journey permissions are segmented away from administrator-only actions.',
    label: 'Clinical boundary',
    status: 'ready',
    tone: 'green',
    value: '52 users',
  },
  {
    helper: 'External surveyor and business-office groups remain read-mostly until review closes.',
    label: 'Restricted lanes',
    status: 'pending',
    tone: 'amber',
    value: '14 users',
  },
];

const permissionPreview: readonly PermissionPreview[] = PERMISSION_CATALOG.map((permission) => {
  const holdingGroups = USER_GROUPS.filter((group) => group.permissions.includes(permission.id));
  return {
    groups: holdingGroups.length === 0 ? '—' : holdingGroups.map((group) => group.name).join(', '),
    permission: permission.description,
    posture: PRIVILEGED_PERMISSIONS.has(permission.id) ? 'locked' : 'ready',
  };
});

export function AdminGroupsScreen() {
  const [activePanel, setActivePanel] = useState<GroupPanelTabId>('guardrails');

  return (
    <section
      className="grid gap-xl"
      data-group="Admin"
      data-hash-id="admin-groups"
      data-route="/admin/user-groups"
      data-template="matrix"
    >
      <MetricGrid metrics={groupMetrics} />

      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="grid content-start gap-lg" aria-label="Admin user groups permission matrix">
          <DataTable columns={groupColumns} label="Admin user groups permission matrix" rows={groupRows} />

          <section className="grid gap-md tablet-l:grid-cols-2" aria-label="Admin scope summary">
            {scopeTiles.map((tile) => (
              <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={tile.label}>
                <div className="mb-md flex flex-wrap items-start justify-between gap-md">
                  <div>
                    <p className="text-tag uppercase tracking-tag text-muted">{tile.label}</p>
                    <div className="mt-xs">
                      <ToneTag tone={tile.tone}>{tile.value}</ToneTag>
                    </div>
                  </div>
                  <ToneBadge size="sm" status={tile.status} />
                </div>
                <p className="text-sm text-secondary">{tile.helper}</p>
              </article>
            ))}
          </section>
        </section>

        <aside className="grid content-start gap-lg" aria-label="Admin group governance panels">
          <nav aria-label="Group governance tabs" className="flex gap-xs overflow-x-auto rounded-lg border border-card bg-surface/90 p-xs shadow-rest backdrop-blur-xl">
            {groupPanelTabs.map((tab) => (
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

          {activePanel === 'guardrails' && (
            <section className="grid gap-md" aria-label="Group guardrail summary" role="tabpanel">
              {governanceCards.map((card) => (
                <SurfaceCard card={card} key={card.title} />
              ))}
            </section>
          )}

          {activePanel === 'matrix' && (
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" role="tabpanel">
            <div className="mb-lg flex items-start justify-between gap-md">
              <div className="grid gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
                  <UserCog aria-hidden="true" className="h-icon-md w-icon-md" />
                </span>
                <div>
                  <h2 className="text-h2 font-medium text-ink">Permission matrix preview</h2>
                  <p className="mt-xs text-sm text-muted">
                    Representative access areas show which groups can hold sensitive permissions.
                  </p>
                </div>
              </div>
              <ToneBadge size="sm" status="ready" />
            </div>

            <div className="grid gap-sm">
              {permissionPreview.map((item) => (
                <div className="rounded-md border border-hairline bg-tone-slate-bg p-md" key={item.permission}>
                  <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                    <span className="text-xs font-medium text-brand-teal">{item.permission}</span>
                    <ToneBadge size="sm" status={item.posture} />
                  </div>
                  <p className="text-sm text-secondary">{item.groups}</p>
                </div>
              ))}
            </div>
            </section>
          )}

          {activePanel === 'evidence' && (
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest" role="tabpanel">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-green-bg text-tone-green-text">
                <FileCheck2 aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink">Governance evidence</h2>
                <p className="mt-xs text-sm text-muted">
                  Membership changes require owner reason, reviewer initials, timestamp, and audit packet trace.
                </p>
              </div>
            </div>
            <div className="grid gap-sm">
              {[
                ['Last review', 'Jun 18, 2026', 'validated'],
                ['Next review', 'Jul 1, 2026', 'upcoming'],
                ['Open exceptions', '2 limited scopes', 'review-required'],
                ['Audit export', 'Ready for packet', 'ready'],
              ].map(([label, value, status]) => (
                <div className="flex flex-wrap items-center justify-between gap-md rounded-md bg-tone-slate-bg p-md" key={label}>
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

export default AdminGroupsScreen;
