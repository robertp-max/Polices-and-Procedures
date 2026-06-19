import { useMemo, useState } from 'react';
import { PageHeader, SurfaceCard, DataGrid, SearchField } from '@/policy/components/ui';
import { USER_GROUPS } from './userGroups';

const ADMIN_TABS = [
  { id: 'user-groups', label: 'User Groups' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'users', label: 'User Assignments' },
] as const;

export function AdminRolesPage() {
  const [roleFilter, setRoleFilter] = useState('');

  const filteredRoles = useMemo(() => {
    const q = roleFilter.trim().toLowerCase();
    if (!q) return USER_GROUPS;
    return USER_GROUPS.filter(group => group.name.toLowerCase().includes(q) || group.description.toLowerCase().includes(q));
  }, [roleFilter]);

  return (
    <div className="h-full w-full overflow-y-auto p-6" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          eyebrow="ADMIN / IDENTITY"
          title="Roles"
          description="Browse seeded role definitions and permission cardinality. Filter to locate groups for assignments."
        />

        {/* Corporate sub nav pills (Tabs variant) */}
        <div className="flex flex-wrap gap-2">
          {ADMIN_TABS.map(t => {
            const active = t.id === 'roles';
            return (
              <a
                key={t.id}
                href={`/admin/${t.id === 'user-groups' ? 'user-groups' : t.id}`}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition ${active ? 'bg-[var(--brand-primary,#00797D)] text-white border-[var(--brand-primary,#00797D)]' : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)] hover:bg-[var(--v3-surface-elevated, rgba(255,255,255,0.03))]'}`}
              >
                {t.label}
              </a>
            );
          })}
        </div>

        <SurfaceCard padding="md">
          <SearchField
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Filter roles by name or description…"
            className="w-full max-w-sm"
          />
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <DataGrid>
            <DataGrid.Head>
              <DataGrid.HeaderRow>
                <DataGrid.HeaderCell>Role</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Description</DataGrid.HeaderCell>
                <DataGrid.HeaderCell align="right">Permission Count</DataGrid.HeaderCell>
              </DataGrid.HeaderRow>
            </DataGrid.Head>
            <DataGrid.Body>
              {filteredRoles.map(group => (
                <DataGrid.Row key={group.id}>
                  <DataGrid.Cell>
                    <span className="font-semibold tracking-tight">{group.name}</span>
                  </DataGrid.Cell>
                  <DataGrid.Cell>
                    <span className="text-[var(--v3-text-secondary)]">{group.description}</span>
                  </DataGrid.Cell>
                  <DataGrid.Cell align="right">
                    <span className="inline-block min-w-[2em] rounded bg-[var(--v3-teal-light, #00D1C1)]/10 px-2 py-px text-xs font-mono text-[var(--v3-text-primary)]">
                      {group.permissions.length}
                    </span>
                  </DataGrid.Cell>
                </DataGrid.Row>
              ))}
              {filteredRoles.length === 0 && (
                <DataGrid.Row>
                  <DataGrid.Cell colSpan={3}>
                    <span className="text-[var(--v3-text-tertiary)]">No roles match your filter.</span>
                  </DataGrid.Cell>
                </DataGrid.Row>
              )}
            </DataGrid.Body>
          </DataGrid>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default AdminRolesPage;
