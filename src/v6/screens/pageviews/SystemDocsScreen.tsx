import { Search, Info } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components';


interface DocSectionRow extends Record<string, string> {
  sectionId: string;
  title: string;
  scope: string;
  lastUpdated: string;
  status: string;
}

const columns: readonly DataTableColumn<DocSectionRow>[] = [
  { key: 'sectionId', label: 'Section ID' },
  { key: 'title', label: 'Documentation Topic' },
  { key: 'scope', label: 'Stewardship Group' },
  { key: 'lastUpdated', label: 'Last Sync' },
  { key: 'status', label: 'State', status: true },
];

const rows: readonly DocSectionRow[] = [
  { sectionId: 'SEC-001', title: 'CES Integration Architecture', scope: 'Compliance Systems', lastUpdated: '2026-06-01', status: 'validated' },
  { sectionId: 'SEC-002', title: 'Cognito Authentication Bootstrap', scope: 'IT Security', lastUpdated: '2026-06-05', status: 'validated' },
  { sectionId: 'SEC-003', title: 'Dynamic Swimlane Routing Flow', scope: 'Clinical Ops', lastUpdated: '2026-06-12', status: 'active' },
  { sectionId: 'SEC-004', title: 'Dual-Signature Override Policy', scope: 'Administration', lastUpdated: '2026-06-18', status: 'review-required' },
];

export function SystemDocsScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="system-docs"
      data-route="/system-documentation/:sectionId"
      data-template="docs"
    >
      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Documentation Chapters</h3>
                <p className="mt-xs text-sm text-muted">Chapters mapping to the V6 platform and compliance engines.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Chapters table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Documentation search">
          <label className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface px-md text-muted shadow-rest">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search manual chapters</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none"
              placeholder="Search chapters..."
              type="search"
            />
          </label>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <Info aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Documentation Guide
            </h3>
            <p className="text-sm text-secondary">
              Use the chapter links under the V6 shell to review operational guidance, evidence paths, and support notes.
            </p>
          </section>
        </aside>
      </section>
    </section>
  );
}
