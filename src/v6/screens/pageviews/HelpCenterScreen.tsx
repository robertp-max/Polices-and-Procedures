import { Search, HelpCircle, FileText } from 'lucide-react';
;
import { Badge } from '../../primitives';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';

const categories = [
  { label: 'Policy Library', count: `${POLICY_CORPUS.length} policies`, desc: 'Canonical V2 corpus with real policy sections, metadata, and detail pages.' },
  { label: 'Forms Library', count: `${FORMS_DATASET.length} forms`, desc: 'Real form records with read/fill workspace data and signer context.' },
  { label: 'Operator Articles', count: `${Object.keys(HELP_ARTICLES).length} articles`, desc: 'Help articles available from current V2 event and calendar contexts.' },
  { label: 'Signing Guidance', count: 'Reference only', desc: 'Use source-grounded eCIgn Path A; Path B remains controlled by the eCIgn lane.' },
] as const;

const latestUpdates = [
  `Policy Library and Policy Detail now use the ${POLICY_CORPUS.length}-policy corpus.`,
  `Forms Library and Form Workspace now use the ${FORMS_DATASET.length}-form dataset.`,
  'Signed artifacts must remain the actual Care Indeed PDF, not markdown, HTML, or generic text.',
] as const;

export function HelpCenterScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="help-center"
      data-route="/help/*"
      data-template="docs"
    >
      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-lg">Help Manual Categories</h3>
            <div className="grid gap-md tablet-l:grid-cols-2">
              {categories.map((category) => (
                <div className="rounded-lg border border-hairline bg-tone-slate-bg p-lg flex flex-col gap-xs hover:bg-surface-hover transition duration-fast" key={category.label}>
                  <div className="flex items-center justify-between mb-sm">
                    <span className="font-medium text-ink">{category.label}</span>
                    <Badge>{category.count}</Badge>
                  </div>
                  <p className="text-sm text-muted">{category.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Help search">
          <label className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface px-md text-muted shadow-rest">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search help topics</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none"
              placeholder="Search help..."
              type="search"
            />
          </label>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <HelpCircle aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Direct Support
            </h3>
            <p className="text-sm text-secondary">
              Cannot find the right guideline? Submit a request to the platform administration group. Do not authorize new signing or evidence behavior from help copy alone.
            </p>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Baseline Notes
            </h3>
            <ul className="text-sm text-secondary grid gap-sm list-disc pl-md">
              {latestUpdates.map((update) => (
                <li key={update}>{update}</li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </section>
  );
}
