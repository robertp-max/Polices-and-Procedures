import { PageHeader, SurfaceCard, DataGrid } from '@/policy/components/ui';
import { PERMISSION_CATALOG } from './permissionCatalog';

const ADMIN_TABS = [
  { id: 'user-groups', label: 'User Groups' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'users', label: 'User Assignments' },
] as const;

export function PermissionCatalogPage() {
  return (
    <div className="h-full w-full overflow-y-auto p-6" style={{ background: 'transparent' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          eyebrow="ADMIN / IDENTITY"
          title="Permission Catalog"
          description="Catalog is constrained to Phase A foundation permissions and is intentionally separate from HIPAA-only controls."
        />

        <div className="flex flex-wrap gap-2">
          {ADMIN_TABS.map(t => {
            const active = t.id === 'permissions';
            return (
              <a
                key={t.id}
                href={`/admin/${t.id === 'user-groups' ? 'user-groups' : t.id}`}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition ${active ? 'bg-[var(--brand-primary,#00797D)] text-white border-[var(--brand-primary,#00797D)]' : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)] hover:bg-[var(--v3-surface-elevated)]'}`}
              >
                {t.label}
              </a>
            );
          })}
        </div>

        <SurfaceCard padding="lg">
          <DataGrid>
            <DataGrid.Head>
              <DataGrid.HeaderRow>
                <DataGrid.HeaderCell>Permission</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Resource</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Action</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>PHI</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Description</DataGrid.HeaderCell>
              </DataGrid.HeaderRow>
            </DataGrid.Head>
            <DataGrid.Body>
              {PERMISSION_CATALOG.map(permission => (
                <DataGrid.Row key={permission.id}>
                  <DataGrid.Cell>
                    <span className="font-mono text-xs tracking-[0.5px]">{permission.id}</span>
                  </DataGrid.Cell>
                  <DataGrid.Cell>{permission.resource}</DataGrid.Cell>
                  <DataGrid.Cell>{permission.action}</DataGrid.Cell>
                  <DataGrid.Cell>
                    <span className={`inline-block rounded-full px-1.5 py-px text-[10px] ${permission.phi ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {permission.phi ? 'yes' : 'no'}
                    </span>
                  </DataGrid.Cell>
                  <DataGrid.Cell>
                    <span className="text-[var(--v3-text-secondary)] text-sm">{permission.description}</span>
                  </DataGrid.Cell>
                </DataGrid.Row>
              ))}
            </DataGrid.Body>
          </DataGrid>
        </SurfaceCard>
      </div>
    </div>
  );
}

export default PermissionCatalogPage;
