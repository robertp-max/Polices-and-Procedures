import { Link } from 'react-router-dom';
import { USER_GROUPS } from './userGroups';
import { PageHeader, SurfaceCard, DataGrid, Tabs, MetricTile, ToneBadge } from '@/policy/components/ui';

type AdminTab = 'user-groups' | 'roles' | 'permissions' | 'users';

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: 'user-groups', label: 'User Groups' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'users', label: 'User Assignments' },
];

export function UserGroupsPage() {
  const activeTab: AdminTab = 'user-groups';

  return (
    <div className="h-full w-full overflow-y-auto p-6" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          eyebrow="ADMIN"
          title="Admin User Groups"
          description="Admin User Groups prototype for the active app route /admin/user-groups."
          actions={
            <div className="text-[11px] text-[var(--v3-text-tertiary)] font-mono">Phase A seeds</div>
          }
        />

        {/* Direct MetricTile (no BorderGlow wrapper) per ref 03-admin-groups.png: uniform direct tone pastel bg #F7FEFF etc, 10px uppercase tracking-[0.18em] label, 3xl value, xs note, rounded-2xl p-4/5 shadow-soft min-h-[92px]. Preserve all live seeded values/UX. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricTile label="Groups" value={USER_GROUPS.length} note="Seeded" tone="teal" />
          <MetricTile label="Total Users" value={USER_GROUPS.reduce((s, g) => s + (g.users ?? 8), 0)} note="Assigned" tone="success" />
          <MetricTile label="Total Perms" value={USER_GROUPS.reduce((s, g) => s + g.permissions.length, 0)} note="Across groups" tone="orange" />
          <MetricTile label="Avg Perms" value={Math.round(USER_GROUPS.reduce((s, g) => s + g.permissions.length, 0) / USER_GROUPS.length)} note="Per group" tone="muted" />
        </div>

        {/* Premium admin sub-nav using Tabs (corporate pill-like) */}
        <Tabs
          items={ADMIN_TABS.map(t => ({
            id: t.id,
            label: t.label,
          }))}
          value={activeTab}
          onChange={(id) => {
            const map: Record<AdminTab, string> = {
              'user-groups': '/admin/user-groups',
              roles: '/admin/roles',
              permissions: '/admin/permissions',
              users: '/admin/users',
            };
            window.location.href = map[id as AdminTab]; // preserve simple nav for admin
          }}
          variant="segmented"
        />

        {/* Direct SurfaceCard (no BorderGlow wrapper) for clean white card + restrained per ref: #F7FEFF base, white cards, radii 16px, hover-lift, no extra glow on content surface. */}
        <SurfaceCard padding="lg">
          <DataGrid>
            <DataGrid.Head>
              <DataGrid.HeaderRow>
                <DataGrid.HeaderCell>Group</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Description</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Permissions</DataGrid.HeaderCell>
              </DataGrid.HeaderRow>
            </DataGrid.Head>
            <DataGrid.Body>
              {USER_GROUPS.map(group => (
                <DataGrid.Row key={group.id}>
                  <DataGrid.Cell>
                    <span className="font-semibold tracking-tight">{group.name}</span>
                  </DataGrid.Cell>
                  <DataGrid.Cell>
                    <span className="text-[var(--v3-text-secondary)]">{group.description}</span>
                  </DataGrid.Cell>
                  <DataGrid.Cell>
                    <div className="flex flex-wrap gap-1.5">
                      {group.permissions.map(permission => (
                        <ToneBadge key={`${group.id}-${permission}`} tone="teal" className="text-[10px] px-1.5">
                          {permission}
                        </ToneBadge>
                      ))}
                    </div>
                  </DataGrid.Cell>
                </DataGrid.Row>
              ))}
            </DataGrid.Body>
          </DataGrid>
        </SurfaceCard>

        <div className="text-[11px] text-[var(--v3-text-tertiary)]">
          Need quick action preview? Go to <Link to="/admin/users" className="underline underline-offset-2">User Assignments</Link>.
        </div>
      </div>
    </div>
  );
}

export default UserGroupsPage;
