import { Search, HelpCircle, FileText, ArrowLeft, BookOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../primitives';
import { POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { HELP_ARTICLES, type HelpArticle } from '@/policy/data/helpArticles';

const categories = [
  { label: 'Policy Library', count: `${POLICY_CORPUS.length} policies`, desc: 'Canonical V2 corpus with real policy sections, metadata, and detail pages.' },
  { label: 'Forms Library', count: `${FORMS_DATASET.length} forms`, desc: 'Real form records with read/fill workspace data and signer context.' },
  { label: 'Operator Articles', count: `${Object.keys(HELP_ARTICLES).length} articles`, desc: 'Help articles available from current V2 event and calendar contexts.' },
  { label: 'Signing Guidance', count: 'Reference only', desc: 'Use source-grounded eCIgn Path A; Path B remains controlled by the eCIgn lane.' },
] as const;

const latestUpdates = [
  'Policy Library and Policy Detail now use the 279-policy corpus.',
  'Forms Library and Form Workspace now use the 410-form dataset.',
  'Signed artifacts must remain the actual Care Indeed PDF, not markdown, HTML, or generic text.',
] as const;

export function HelpCenterScreen() {
  const params = useParams<{ '*': string }>();
  const splat = (params['*'] || '').trim();
  const articleId = splat && splat !== 'index' ? splat.toUpperCase() : '';
  const currentArticle: HelpArticle | null = articleId && HELP_ARTICLES[articleId] ? HELP_ARTICLES[articleId] : null;

  const articleIds = Object.keys(HELP_ARTICLES);
  const routeBase = '/help';

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
          {/* Categories always visible for overview */}
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

          {/* Article index or detail based on route param (real content from HELP_ARTICLES) */}
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            {currentArticle ? (
              <div>
                <div className="mb-lg flex items-center justify-between">
                  <Link
                    to={routeBase}
                    className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" />
                    Back to Help Center
                  </Link>
                  <Badge>{currentArticle.id}</Badge>
                </div>

                <h2 className="text-h2 font-medium text-ink">{currentArticle.title}</h2>
                {currentArticle.subtitle && (
                  <p className="mt-xs text-base text-muted">{currentArticle.subtitle}</p>
                )}

                {currentArticle.overview && (
                  <p className="mt-md text-sm leading-relaxed text-secondary">{currentArticle.overview}</p>
                )}

                <div className="mt-lg grid gap-lg">
                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-sm flex items-center gap-sm">
                      <BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm" /> Purpose
                    </h4>
                    <p className="text-sm text-secondary">{currentArticle.purpose}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-sm">When Required</h4>
                    <p className="text-sm text-secondary">{currentArticle.whenRequired}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-sm">Responsible</h4>
                    <p className="text-sm text-secondary">{currentArticle.responsible}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-sm">Steps</h4>
                    <ol className="list-decimal pl-md text-sm text-secondary grid gap-xs">
                      {currentArticle.steps.map((step, idx) => (
                        <li key={idx}>
                          <span className="font-medium text-ink">{step.label}:</span> {step.detail}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {currentArticle.formsRequired.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-sm">Required Forms</h4>
                      <ul className="text-sm text-secondary grid gap-xs list-disc pl-md">
                        {currentArticle.formsRequired.map((f, idx) => (
                          <li key={idx}>
                            <span className="font-medium text-ink">{f.formId} — {f.label}</span>
                            {f.note ? ` (${f.note})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid gap-sm desktop:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-sm">Outputs</h4>
                      <ul className="text-sm text-secondary grid gap-xs list-disc pl-md">
                        {currentArticle.outputs.map((o, i) => <li key={i}>{o}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-sm">Common Mistakes</h4>
                      <ul className="text-sm text-secondary grid gap-xs list-disc pl-md">
                        {currentArticle.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-ink mb-sm">Audit Tips</h4>
                    <ul className="text-sm text-secondary grid gap-xs list-disc pl-md">
                      {currentArticle.auditTips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>

                  {currentArticle.relatedPolicies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-sm">Related Policies</h4>
                      <div className="flex flex-wrap gap-sm">
                        {currentArticle.relatedPolicies.map((p, i) => (
                          <span key={i} className="rounded border border-hairline px-sm py-xs text-xs text-muted">{p.id}: {p.label}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted pt-sm border-t border-hairline">
                    Est. {currentArticle.estimatedMinutes} min • Updated {currentArticle.updatedAt}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-h3 font-medium text-ink mb-lg">Operator Articles ({articleIds.length})</h3>
                <p className="mb-md text-sm text-muted">Click any article for full operational guide, steps, forms, and audit references. Articles are sourced from live V2 help data.</p>

                <div className="grid gap-sm">
                  {articleIds.map((id) => {
                    const art = HELP_ARTICLES[id];
                    return (
                      <Link
                        key={id}
                        to={`${routeBase}/${id}`}
                        className="block rounded-lg border border-hairline bg-tone-slate-bg p-lg hover:bg-surface-hover transition duration-fast focus-visible:outline-none focus-visible:shadow-focus"
                      >
                        <div className="flex items-start justify-between gap-md">
                          <div>
                            <div className="font-medium text-ink">{art.title}</div>
                            {art.subtitle && <div className="text-xs text-muted mt-0.5">{art.subtitle}</div>}
                          </div>
                          <Badge>{id}</Badge>
                        </div>
                        {art.overview && (
                          <p className="mt-sm text-sm text-secondary line-clamp-2">{art.overview}</p>
                        )}
                        <div className="mt-sm text-[10px] text-muted">{art.responsible.split('. ')[0]} • {art.estimatedMinutes} min</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
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

          {/* Quick nav to sample articles for V1/V2 parity */}
          {!currentArticle && articleIds.length > 0 && (
            <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
              <h3 className="text-h3 font-medium text-ink mb-md">Quick Links</h3>
              <ul className="text-sm grid gap-xs">
                {articleIds.slice(0, 5).map((id) => (
                  <li key={id}>
                    <Link to={`${routeBase}/${id}`} className="text-brand-teal hover:underline">{id}</Link>
                  </li>
                ))}
                {articleIds.length > 5 && <li className="text-muted text-xs">... see full list above</li>}
              </ul>
            </section>
          )}
        </aside>
      </section>
    </section>
  );
}
