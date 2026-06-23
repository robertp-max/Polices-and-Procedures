import { PageHeader, SurfaceCard, DataGrid, MetricTile, ToneBadge } from '@/policy/components/ui';
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
          eyebrow="ADMIN"
          title="Permission Catalog"
          description="Catalog is constrained to Phase A foundation permissions and is intentionally separate from HIPAA-only controls."
        />

        {/* Direct MetricTile (no BorderGlow wrapper) for exact ref 04-admin-permissions.png match: direct tone pastel bg #F7FEFF etc, 10px uppercase tracking-[0.18em], 3xl, xs note, rounded-2xl p-4/5 shadow-soft min-h-[92px]. Live data/UX preserved. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricTile label="Permissions" value={PERMISSION_CATALOG.length} note="Catalog" tone="teal" />
          <MetricTile label="PHI" value={PERMISSION_CATALOG.filter(p => p.phi).length} note="HIPAA scoped" tone="danger" />
          <MetricTile label="Resources" value={new Set(PERMISSION_CATALOG.map(p => p.resource)).size} note="Distinct" tone="orange" />
          <MetricTile label="Actions" value={new Set(PERMISSION_CATALOG.map(p => p.action)).size} note="Ops" tone="success" />
        </div>

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

        {/* Direct SurfaceCard (restrained, no outer BorderGlow on content card) per #F7FEFF base + white cards, radii 8-32, hover-lift */}
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
                      <ToneBadge tone={permission.phi ? 'danger' : 'success'} className="text-[10px] px-1.5">
                        {permission.phi ? 'yes' : 'no'}
                      </ToneBadge>
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
