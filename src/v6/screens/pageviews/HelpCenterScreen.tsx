import { Search, HelpCircle, FileText } from 'lucide-react';
;
import { Badge } from '../../primitives';

const categories = [
  { label: 'Overview & Commands', count: '12 articles', desc: 'Primary commands, dashboard widgets, and user settings.' },
  { label: 'CES Kanban & Sprints', count: '8 articles', desc: 'Sprint schedules, task moves, and blocker mitigations.' },
  { label: 'Regulatory Taxonomy', count: '15 articles', desc: 'ACHC alignments, CMS crosswalks, and policy draft lifecycle.' },
  { label: 'Onboarding GAO Tracks', count: '9 articles', desc: 'Pre-Day-1 checklists, modules play, and supervisor clearances.' },
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
              Cannot find the right guideline? Submit a request to the platform administration group or compliance officer.
            </p>
          </section>

          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Latest Article Updates
            </h3>
            <ul className="text-sm text-secondary grid gap-sm list-disc pl-md">
              <li>MFA Recovery instructions</li>
              <li>Dual signature overrides</li>
              <li>OASIS return demo checks</li>
            </ul>
          </section>
        </aside>
      </section>
    </section>
  );
}
