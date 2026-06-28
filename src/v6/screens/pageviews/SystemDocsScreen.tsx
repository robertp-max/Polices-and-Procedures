import { Search, Info, ArrowLeft, BookMarked } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
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

// Real content for param-driven sections (V2 surfaces). Supports /system-documentation/SEC-001 etc + bare route.
const SECTION_CONTENTS: Record<string, { title: string; body: string; references: string[] }> = {
  'SEC-001': {
    title: 'Policy Library and Detail',
    body: 'The Policy Library renders the live POLICY_CORPUS (279 records). PolicyDetailScreen resolves via getCorpusPolicy + getPolicyContent, exposing sections, appendices, tier, steward, and regulatory cross-refs. Print and surveyor views reuse the same resolver. All policies are REQUIRED tier in current seed.',
    references: ['/library', '/library/:policyId', 'policyCorpus.ts', 'allPoliciesContent.generated.ts'],
  },
  'SEC-002': {
    title: 'Forms Library and Workspace',
    body: 'FORMS_DATASET (410+ forms) drives FormsLibraryScreen and FormWorkspaceScreen. Includes sectioned fields, signer requirements, and alias resolution. Print route protected via same data. eCIgn workspaces attach to specific formIds.',
    references: ['/forms', '/forms/:formId', '/forms/:formId/esign', 'formsLibraryDataset.ts'],
  },
  'SEC-003': {
    title: 'eCIgn Path A — Source-Grounded Signing',
    body: 'Path A uses live ecign/ signing stack: ecignSigning, ecignCertificateBuilder, ecignConsentStore, signaturePathResolver. Artifacts remain canonical Care Indeed PDFs. Hash + retention in ecign/pathB and evidence storage.',
    references: ['/forms/:formId/esign', 'ecign/', 'ecign/pathB/'],
  },
  'SEC-004': {
    title: 'eCIgn Path B — Controlled Implementation',
    body: 'Path B is restricted. Implementation notes live in ecign/pathB (contracts, replicas, validators, retentionLifecycle). Not exposed for general use from System Docs or Help surfaces. Use only via authorized execution lanes.',
    references: ['ecign/pathB/', 'server/ia (internal)'],
  },
  'SEC-005': {
    title: 'Signed-PDF Artifact Rule',
    body: 'Signed artifacts must be the authentic PDF bytes from eCIgn, never markdown/HTML/text. Stored via evidence storage adapters (local/AWS). Snapshot + hash captured at sign time. Enforced in captureSignedFormSnapshot and resolveCanonicalSignedPackage.',
    references: ['ecign/captureSignedFormSnapshot.ts', 'evidence/storage/'],
  },
};

const sectionRows = rows; // reuse for table

export function SystemDocsScreen() {
  const params = useParams<{ sectionId?: string }>();
  const sectionId = (params.sectionId || '').toUpperCase().trim() || '';
  const selected = sectionId ? SECTION_CONTENTS[sectionId] || null : null;
  const basePath = '/system-documentation';

  // Fallback: if sectionId provided but unknown, show index + note
  const effectiveSectionId = sectionId || '';

  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="system-docs"
      data-route="/system-documentation/:sectionId?"
      data-template="docs"
    >
      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          {/* Chapters nav + table */}
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Documentation Chapters</h3>
                <p className="mt-xs text-sm text-muted">Chapters mapped to the current V2 baseline and honest implementation status. Click a chapter to load detail.</p>
              </div>
            </div>

            {/* Nav list using real links for navigation (fixes static V1 surface) */}
            <div className="mb-md grid gap-xs">
              {sectionRows.map((r) => {
                const isSel = effectiveSectionId === r.sectionId;
                return (
                  <Link
                    key={r.sectionId}
                    to={`${basePath}/${r.sectionId}`}
                    className={`flex items-center justify-between rounded border px-md py-sm text-sm transition ${isSel ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep' : 'border-hairline hover:bg-surface-hover'}`}
                  >
                    <span><span className="font-mono text-xs mr-sm">{r.sectionId}</span>{r.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted">{r.scope}</span>
                  </Link>
                );
              })}
            </div>

            <DataTable columns={columns} label="Chapters table" rows={sectionRows} />
          </section>

          {/* Param-driven detail content (real V2 descriptions + refs). Shows when :sectionId present. */}
          {selected && (
            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
              <div className="mb-md flex items-center gap-sm">
                <Link to={basePath} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
                  <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> All chapters
                </Link>
                <span className="ml-auto font-mono text-xs text-muted">{sectionId}</span>
              </div>

              <h2 className="text-h2 font-medium text-ink flex items-center gap-sm">
                <BookMarked aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                {selected.title}
              </h2>

              <p className="mt-md text-sm leading-relaxed text-secondary">{selected.body}</p>

              <div className="mt-lg">
                <h4 className="text-sm font-semibold mb-sm">Key V2 References</h4>
                <ul className="text-sm grid gap-xs list-disc pl-md text-secondary">
                  {selected.references.map((ref, i) => <li key={i}><code className="text-xs">{ref}</code></li>)}
                </ul>
              </div>
            </section>
          )}

          {!selected && (
            <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest text-sm text-secondary">
              Select a chapter from the navigation above (or visit <code>/system-documentation/SEC-001</code>) for detailed architecture notes. Bare route <code>/system-documentation</code> shows the index.
            </section>
          )}
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Documentation search">
          <label className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset px-md text-muted shadow-rest">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search manual chapters</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none"
              placeholder="Search chapters..."
              type="search"
            />
          </label>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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

          {/* Quick nav for V1 audit parity */}
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-sm font-semibold text-ink mb-sm">Chapter Quick Links</h3>
            <div className="flex flex-wrap gap-xs text-xs">
              {sectionRows.map((r) => (
                <Link key={r.sectionId} to={`${basePath}/${r.sectionId}`} className="rounded border px-2 py-0.5 hover:bg-surface-hover">{r.sectionId}</Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
