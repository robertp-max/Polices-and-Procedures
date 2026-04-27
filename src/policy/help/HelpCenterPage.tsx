import { useState, useMemo } from 'react';
import { Link, useParams, useNavigate, Routes, Route } from 'react-router-dom';
import { Search, BookOpen, ShieldCheck, FileText, Workflow, Code2, Sparkles, ChevronRight, UserCheck } from 'lucide-react';
import { ARTICLES, CATEGORIES, articlesByCategory, findArticle, searchArticles, type HelpArticle } from './articles';

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  'getting-started':   Sparkles,
  'signing-documents': FileText,
  'compliance-audit':  ShieldCheck,
  'workflows-events':  Workflow,
  'forms-templates':   BookOpen,
  'developer':         Code2,
  'onboarding-v2':     UserCheck,
};

/* ── Sidebar ───────────────────────────────────────────────────────── */
function Sidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <aside className="w-72 shrink-0 border-r border-[#E5E4E3] bg-white overflow-y-auto">
      <nav className="p-4">
        {CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat.id] ?? BookOpen;
          const items = articlesByCategory(cat.id);
          return (
            <div key={cat.id} className="mb-5">
              <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#1A3778]">
                <Icon size={14} strokeWidth={2} />
                <span>{cat.label}</span>
              </div>
              <ul className="space-y-0.5">
                {items.map(a => (
                  <li key={a.slug}>
                    <Link
                      to={`/help/${a.slug}`}
                      className={`block px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                        activeSlug === a.slug
                          ? 'bg-[#EEF1FA] text-[#122555] font-medium'
                          : 'text-[#1F1C1B] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      {a.title}
                      {a.subcategory && (
                        <span className="ml-1 text-[10px] uppercase tracking-wider text-[#F04B22]">
                          · {a.subcategory}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── Article view ──────────────────────────────────────────────────── */
function ArticleView({ article }: { article: HelpArticle }) {
  return (
    <article className="max-w-3xl mx-auto px-8 py-10">
      <div className="text-[10px] uppercase tracking-wider text-[#F04B22] font-semibold mb-2">
        {CATEGORIES.find(c => c.id === article.category)?.label}
        {article.subcategory && ` · ${article.subcategory}`}
      </div>
      <h1 className="text-3xl font-bold text-[#1A3778] mb-4">{article.title}</h1>

      <Section title="Purpose">{article.purpose}</Section>
      <Section title="When to use it">{article.whenToUse}</Section>

      {article.steps && article.steps.length > 0 && (
        <Section title="Step-by-step">
          <ol className="list-decimal pl-5 space-y-1.5 text-[14px] text-[#1F1C1B]">
            {article.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </Section>
      )}

      <Section title="System behavior">
        <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-[#1F1C1B] bg-[#FAFBF8] border border-[#E5E4E3] rounded-md p-4">
          {article.systemBehavior}
        </pre>
      </Section>

      <Section title="Compliance impact">{article.complianceImpact}</Section>
      <Section title="Evidence generated">{article.evidence}</Section>

      {hasRelated(article) && (
        <Section title="Related">
          {article.related.policies && article.related.policies.length > 0 && (
            <RelatedRow label="Policies">
              {article.related.policies.map(p => (
                <Link key={p} to={`/library/${p}`} className="ecign-chip">{p}</Link>
              ))}
            </RelatedRow>
          )}
          {article.related.workflows && article.related.workflows.length > 0 && (
            <RelatedRow label="Workflows">
              {article.related.workflows.map(w => <span key={w} className="ecign-chip">{w}</span>)}
            </RelatedRow>
          )}
          {article.related.endpoints && article.related.endpoints.length > 0 && (
            <RelatedRow label="Endpoints">
              {article.related.endpoints.map(e => (
                <code key={e} className="ecign-chip font-mono text-[11px]">{e}</code>
              ))}
            </RelatedRow>
          )}
          {article.related.components && article.related.components.length > 0 && (
            <RelatedRow label="Components">
              {article.related.components.map(c => (
                <code key={c} className="ecign-chip font-mono text-[11px]">{c}</code>
              ))}
            </RelatedRow>
          )}
        </Section>
      )}

      <style>{`
        .ecign-chip {
          display: inline-flex; align-items: center;
          padding: 2px 8px; margin: 2px 4px 2px 0;
          background: #EEF1FA; color: #122555;
          border: 1px solid #DDE3F2; border-radius: 4px;
          font-size: 12px; text-decoration: none;
        }
        .ecign-chip:hover { background: #DDE3F2; }
      `}</style>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-[11px] uppercase tracking-wider font-semibold text-[#1A3778] mb-2">{title}</h2>
      <div className="text-[14px] leading-relaxed text-[#1F1C1B]">{children}</div>
    </section>
  );
}

function RelatedRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <span className="text-[11px] text-[#747470] mr-2">{label}:</span>
      {children}
    </div>
  );
}

function hasRelated(a: HelpArticle): boolean {
  const r = a.related;
  return !!(r.policies?.length || r.workflows?.length || r.endpoints?.length || r.components?.length);
}

/* ── Search panel ──────────────────────────────────────────────────── */
function SearchPanel({ query, onSelect }: { query: string; onSelect: (s: string) => void }) {
  const results = useMemo(() => searchArticles(query), [query]);
  if (!query.trim()) return null;
  if (results.length === 0) {
    return <div className="px-8 py-6 text-[13px] text-[#747470]">No articles match "{query}".</div>;
  }
  return (
    <div className="px-8 py-6 max-w-3xl mx-auto">
      <div className="text-[11px] uppercase tracking-wider text-[#1A3778] font-semibold mb-3">
        {results.length} result{results.length === 1 ? '' : 's'}
      </div>
      <ul className="space-y-1">
        {results.map(a => (
          <li key={a.slug}>
            <button
              onClick={() => onSelect(a.slug)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[#F7F8FA] flex items-center justify-between group"
            >
              <div>
                <div className="font-medium text-[#1F1C1B]">{a.title}</div>
                <div className="text-[12px] text-[#747470] line-clamp-1">{a.purpose}</div>
              </div>
              <ChevronRight size={16} className="text-[#747470] group-hover:text-[#F04B22]" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Page shell ────────────────────────────────────────────────────── */
function HelpShell({ children, activeSlug, query, setQuery }: {
  children: React.ReactNode; activeSlug?: string;
  query: string; setQuery: (q: string) => void;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#FAFBF8]">
      <Sidebar activeSlug={activeSlug} />
      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-[#E5E4E3] bg-white px-8 py-4 flex items-center gap-3">
          <Search size={18} className="text-[#747470]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Help Center…"
            className="flex-1 outline-none text-[14px] text-[#1F1C1B] placeholder:text-[#A8A8A6]"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-[12px] text-[#747470] hover:text-[#F04B22]">
              clear
            </button>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}

/* ── Routes ────────────────────────────────────────────────────────── */
function HelpHome({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const navigate = useNavigate();
  if (query.trim()) {
    return (
      <HelpShell query={query} setQuery={setQuery}>
        <SearchPanel query={query} onSelect={s => { setQuery(''); navigate(`/help/${s}`); }} />
      </HelpShell>
    );
  }
  return (
    <HelpShell query={query} setQuery={setQuery}>
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="text-[10px] uppercase tracking-wider text-[#F04B22] font-semibold mb-2">Help Center</div>
        <h1 className="text-3xl font-bold text-[#1A3778] mb-4">CI-App Help Center</h1>
        <p className="text-[14px] text-[#1F1C1B] leading-relaxed mb-6">
          System-aware, compliance-driven knowledge for the entire CI-App platform — onboarding,
          signing, audits, workflows, and forms. Each article references the real implementation
          and the regulation it supports. Developer & subsystem detail (including the eCIgn
          electronic-signature engine) lives under <strong>Developer</strong>.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map(cat => {
            const Icon = CATEGORY_ICONS[cat.id] ?? BookOpen;
            const count = articlesByCategory(cat.id).length;
            return (
              <Link
                key={cat.id} to={`/help/${articlesByCategory(cat.id)[0]?.slug ?? ''}`}
                className="block border border-[#E5E4E3] bg-white rounded-lg p-4 hover:border-[#1A3778] transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className="text-[#1A3778]" />
                  <span className="font-semibold text-[#1F1C1B]">{cat.label}</span>
                </div>
                <div className="text-[12px] text-[#747470]">{count} article{count === 1 ? '' : 's'}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </HelpShell>
  );
}

function HelpArticleRoute({ query, setQuery }: { query: string; setQuery: (q: string) => void }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? findArticle(slug) : undefined;
  if (!article) {
    return (
      <HelpShell query={query} setQuery={setQuery}>
        <div className="px-8 py-10 text-[14px] text-[#747470]">Article not found.</div>
      </HelpShell>
    );
  }
  if (query.trim()) {
    return (
      <HelpShell activeSlug={slug} query={query} setQuery={setQuery}>
        <SearchPanel query={query} onSelect={s => { setQuery(''); navigate(`/help/${s}`); }} />
      </HelpShell>
    );
  }
  return (
    <HelpShell activeSlug={slug} query={query} setQuery={setQuery}>
      <ArticleView article={article} />
    </HelpShell>
  );
}

export function HelpCenterPage() {
  const [query, setQuery] = useState('');
  return (
    <Routes>
      <Route path="/" element={<HelpHome query={query} setQuery={setQuery} />} />
      <Route path="/:slug" element={<HelpArticleRoute query={query} setQuery={setQuery} />} />
    </Routes>
  );
}

// Expose registry for other consumers (contextual links).
export { ARTICLES };
