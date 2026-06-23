import { Search, Info } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../components';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';


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
  { sectionId: 'SEC-001', title: `Policy Library and Detail (${POLICY_CORPUS.length} real policies)`, scope: 'Taxonomy', lastUpdated: '2026-06-22', status: 'validated' },
  { sectionId: 'SEC-002', title: `Forms Library and Workspace (${FORMS_DATASET.length} real forms)`, scope: 'Taxonomy', lastUpdated: '2026-06-22', status: 'validated' },
  { sectionId: 'SEC-003', title: 'eCIgn Path A source-grounded signing reference', scope: 'Signing', lastUpdated: '2026-06-22', status: 'validated' },
  { sectionId: 'SEC-004', title: 'eCIgn Path B controlled implementation notes', scope: 'Signing', lastUpdated: '2026-06-22', status: 'planned' },
  { sectionId: 'SEC-005', title: 'Signed-PDF artifact rule', scope: 'Signing', lastUpdated: '2026-06-22', status: 'active' },
];

const documentationNotes = [
  'Policy and form counts are derived from the current V2 datasets.',
  'Policy Detail exposes real corpus sections rather than placeholder summaries.',
  'Form Workspace reads real form sections, fields, and signer context.',
  'Path B signing behavior is not generally authorized from this documentation surface.',
] as const;

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
                <p className="mt-xs text-sm text-muted">Chapters mapped to the current V2 baseline and honest implementation status.</p>
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
            <ul className="text-sm text-secondary grid gap-sm list-disc pl-md">
              {documentationNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </section>
  );
}
