import { Link } from 'react-router-dom';
import { USER_GROUPS } from './userGroups';
import { PageHeader, SurfaceCard, DataGrid, Tabs } from '@/policy/components/ui';

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
          eyebrow="ADMIN / IDENTITY"
          title="User Groups"
          description="Deterministic Identity and Access seeds for non-HIPAA preview mode. Preview permissions by selecting catalog and assignment pages."
          actions={
            <div className="text-[11px] text-[var(--v3-text-tertiary)] font-mono">Phase A seeds</div>
          }
        />

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
                        <span
                          key={`${group.id}-${permission}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono tracking-[0.5px]"
                          style={{
                            borderColor: 'var(--v3-border-subtle)',
                            background: 'rgba(0,121,112,0.06)',
                            color: 'var(--v3-text-primary)',
                          }}
                        >
                          {permission}
                        </span>
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
