import { useMemo, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ShieldCheck,
    PenTool,
  Settings2,
  FileText,
  Code2,
  Users,
  Activity,
  HelpCircle,
  ArrowRight,
  Mail,
  Book,
  FileCheck,
} from 'lucide-react';
import { CATEGORIES, articlesByCategory, findArticle, searchArticles, type HelpArticle } from './articles';

type IconType = typeof BookOpen;

interface CategoryModel {
  id: string;
  title: string;
  count: number;
  icon: IconType;
  articles: HelpArticle[];
}

const CATEGORY_ICONS: Record<string, IconType> = {
  'getting-started': BookOpen,
  'policy-lifecycle': Activity,
  'signing-documents': FileCheck,
  'compliance-audit': ShieldCheck,
  'workflows-events': Settings2,
  'forms-templates': FileText,
  developer: Code2,
  'onboarding-v2': Users,
};

function useCategoryModels(): CategoryModel[] {
  return useMemo(
    () =>
      CATEGORIES.map(category => {
        const items = articlesByCategory(category.id);
        return {
          id: category.id,
          title: category.label,
          count: items.length,
          icon: CATEGORY_ICONS[category.id] ?? PenTool,
          articles: items,
        };
      }),
    [],
  );
}

function TopNav({ onHomeClick }: {
  onHomeClick: () => void;
}) {
  return (
    <header className="bg-white border-b border-[#E5E4E3] px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 text-[#C74601] font-montserrat font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <Activity className="w-6 h-6" />
          <span>CareIndeed</span>
        </button>
        <div className="h-6 w-px bg-[#E5E4E3] mx-2" />
        <button
          onClick={onHomeClick}
          className="text-[#52404B] font-roboto font-medium text-sm hover:text-[#1F1C1B] transition-colors"
        >
          Help Center
        </button>
      </div>

      <div className="flex items-center gap-4 font-roboto" />
    </header>
  );
}

function SearchHero({ query, setQuery }: { query: string; setQuery: (query: string) => void }) {
  return (
    <div className="bg-[#FAFBF8] border-b border-[#E5E4E3] py-16 px-6">
      <div className="max-w-3xl text-left">
        <div className="flex items-center gap-2 text-[#C74601] font-roboto font-bold text-xs uppercase tracking-widest mb-4">
          <HelpCircle className="w-4 h-4" />
          Help Center
        </div>
        <h1 className="text-3xl md:text-4xl font-montserrat font-bold text-[#1F1C1B] mb-4 tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-[#52404B] font-roboto mb-8 max-w-2xl text-sm md:text-base leading-relaxed">
          System-aware, compliance-driven knowledge for the entire CI-App platform - onboarding, signing, audits, workflows, and forms.
        </p>

        <div className="relative max-w-2xl group">
          <Search className="w-5 h-5 text-[#52404B] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#C74601] transition-colors" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for articles, guides, or policies..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#E5E4E3] rounded-[8px] text-base text-[#1F1C1B] font-roboto focus:bg-white focus:border-[#C74601] focus:ring-1 focus:ring-[#C74601] outline-none transition-all placeholder:text-[#52404B]/70"
          />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  onSelectArticle,
  onSelectCategory,
}: {
  category: CategoryModel;
  onSelectArticle: (slug: string) => void;
  onSelectCategory: (id: string) => void;
}) {
  const Icon = category.icon;
  const isEmpty = category.articles.length === 0;

  return (
    <div className="group bg-white border border-[#E5E4E3] rounded-[12px] p-6 hover:border-[#C74601] transition-colors flex flex-col h-full shadow-none">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-[#FAFBF8] border border-[#E5E4E3] rounded-[8px] text-[#007970] group-hover:bg-[#FFD5BF]/30 group-hover:text-[#C74601] group-hover:border-[#FFD5BF] transition-colors">
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <button className="flex-1 text-left" onClick={() => onSelectCategory(category.id)}>
          <h2 className="text-lg font-montserrat font-semibold text-[#1F1C1B] group-hover:text-[#C74601] transition-colors">
            {category.title}
          </h2>
          <span className="text-xs font-roboto font-medium text-[#52404B]/70 mt-1 block">
            {category.count} ARTICLES
          </span>
        </button>
      </div>

      <div className="mt-2 flex-1">
        {isEmpty ? (
          <div className="text-sm font-roboto text-[#52404B]/60 italic py-4 border-t border-dashed border-[#E5E4E3]">
            Content coming soon.
          </div>
        ) : (
          <ul className="space-y-3">
            {category.articles.slice(0, 4).map(article => (
              <li key={article.slug}>
                <button
                  onClick={() => onSelectArticle(article.slug)}
                  className="text-left w-full text-sm font-roboto text-[#52404B] hover:text-[#C74601] transition-colors flex items-start gap-2"
                >
                  <Book className="w-4 h-4 text-[#E5E4E3] shrink-0 mt-0.5 group-hover:text-[#FFD5BF] transition-colors" />
                  <span className="leading-tight">{article.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isEmpty && (
        <div className="mt-6 pt-4 border-t border-[#FAFBF8]">
          <button
            onClick={() => onSelectCategory(category.id)}
            className="text-sm font-roboto font-medium text-[#C74601] hover:text-[#421700] flex items-center gap-1 transition-colors"
          >
            View all {category.count} articles <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryView({
  category,
  onSelectArticle,
  onHomeClick,
}: {
  category: CategoryModel;
  onSelectArticle: (slug: string) => void;
  onHomeClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-10 md:p-16">
      <div className="flex items-center gap-2 text-sm font-roboto mb-8">
        <button className="text-[#52404B] hover:text-[#C74601] transition-colors" onClick={onHomeClick}>Help Center</button>
        <span className="text-[#E5E4E3]">/</span>
        <span className="text-[#1F1C1B] font-medium">{category.title}</span>
      </div>

      <div className="flex items-center gap-4 mb-10 pb-10 border-b border-[#E5E4E3]">
        <div className="p-4 bg-[#FAFBF8] border border-[#E5E4E3] rounded-[8px] text-[#007970]">
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl md:text-[32px] font-montserrat font-bold text-[#1F1C1B] mb-2">{category.title}</h1>
          <p className="text-[#52404B] font-roboto text-[15px]">{category.count} Articles available in this category.</p>
        </div>
      </div>

      <div className="space-y-4">
        {category.articles.length > 0 ? (
          category.articles.map(article => (
            <button
              key={article.slug}
              onClick={() => onSelectArticle(article.slug)}
              className="w-full text-left p-6 bg-white border border-[#E5E4E3] rounded-[12px] hover:border-[#C74601] transition-colors group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <Book className="w-5 h-5 text-[#E5E4E3] group-hover:text-[#FFD5BF] transition-colors shrink-0" />
                <span className="text-[17px] font-roboto font-medium text-[#1F1C1B] group-hover:text-[#C74601] transition-colors">{article.title}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-[#E5E4E3] group-hover:text-[#C74601] transition-colors shrink-0 ml-4" />
            </button>
          ))
        ) : (
          <div className="p-6 bg-[#FAFBF8] border border-dashed border-[#E5E4E3] rounded-[12px] text-center text-[#52404B] font-roboto italic">
            Content coming soon.
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleViewer({
  article,
  category,
  onHomeClick,
  onCategoryClick,
}: {
  article: HelpArticle;
  category: CategoryModel;
  onHomeClick: () => void;
  onCategoryClick: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-10 md:p-16">
      <div className="flex items-center gap-2 text-sm font-roboto mb-8 flex-wrap">
        <button className="text-[#52404B] hover:text-[#C74601] transition-colors" onClick={onHomeClick}>Help Center</button>
        <span className="text-[#E5E4E3]">/</span>
        <button className="text-[#52404B] hover:text-[#C74601] transition-colors" onClick={() => onCategoryClick(category.id)}>{category.title}</button>
        <span className="text-[#E5E4E3]">/</span>
          <span className="text-[#1F1C1B] font-medium truncate max-w-[250px] md:max-w-md">{article.title}</span>
      </div>

      <div className="mb-10">
        <span className="text-[#C74601] font-montserrat font-semibold text-[10px] tracking-widest uppercase mb-3 block">
          {category.title}
        </span>
        <h1 className="text-3xl md:text-[32px] leading-tight font-montserrat font-bold text-[#1F1C1B]">
          {article.title}
        </h1>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Purpose</h3>
          <p className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed">{article.purpose}</p>
        </section>

        <section>
          <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">When To Use It</h3>
          <p className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed">{article.whenToUse}</p>
        </section>

        {!!article.steps?.length && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Step By Step</h3>
            <ol className="list-decimal list-outside ml-4 space-y-2 text-[#1F1C1B] font-roboto text-[15px] leading-relaxed marker:text-[#52404B]">
              {article.steps.map((step, i) => (
                <li key={i} className="pl-2">{step}</li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">System Behavior</h3>
          <div className="bg-[#FAFBF8] border border-[#E5E4E3] rounded-[8px] p-6 text-[14px] font-mono text-[#52404B] leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {article.systemBehavior}
          </div>
        </section>

        <section>
          <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Compliance Impact</h3>
          <p className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed">{article.complianceImpact}</p>
        </section>

        <section>
          <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Evidence Generated</h3>
          <p className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed break-words">{article.evidence}</p>
        </section>

        {!!article.complianceRequirement && (
          <section className="border-t-2 border-[#FFD5BF] pt-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#C74601]" />
              <h3 className="text-[#C74601] font-montserrat font-semibold text-xs tracking-widest uppercase">Compliance Requirement</h3>
            </div>
            <p className="text-[#1F1C1B] font-roboto text-[15px] leading-relaxed">{article.complianceRequirement}</p>
          </section>
        )}

        {!!article.enforcementRules?.length && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Enforcement Rules</h3>
            <ul className="space-y-2">
              {article.enforcementRules.map((rule: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-[15px] font-roboto text-[#1F1C1B] leading-relaxed">
                  <span className="text-[#C74601] font-bold shrink-0 mt-0.5">&rsaquo;</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!article.requiredActions?.length && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Required Actions</h3>
            <ul className="space-y-2">
              {article.requiredActions.map((action: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-[15px] font-roboto text-[#1F1C1B] leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#007970] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!article.auditLogging && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Audit Logging</h3>
            <div className="bg-[#FAFBF8] border border-[#E5E4E3] rounded-[8px] p-6 text-[14px] font-mono text-[#52404B] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {article.auditLogging}
            </div>
          </section>
        )}

        {!!article.failureImpact && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Failure Impact</h3>
            <div className="bg-[#FFF5F0] border border-[#FFD5BF] rounded-[8px] p-4 text-[15px] font-roboto text-[#1F1C1B] leading-relaxed">
              {article.failureImpact}
            </div>
          </section>
        )}

        {!!article.traceability && (
          <section>
            <h3 className="text-[#52404B] font-montserrat font-semibold text-xs tracking-widest uppercase mb-3">Traceability</h3>
            <div className="bg-[#FAFBF8] border border-[#E5E4E3] rounded-[8px] p-4 font-mono text-[13px] space-y-1">
              {Object.entries(article.traceability).map(([key, value]) => (
                <div key={key} className="flex gap-3">
                  <span className="text-[#007970] w-32 shrink-0">{key}:</span>
                  <span className="text-[#52404B] break-all">{String(value ?? 'GAP')}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SearchResults({ query, onSelectArticle }: { query: string; onSelectArticle: (slug: string) => void }) {
  const results = useMemo(() => searchArticles(query), [query]);

  return (
    <div className="max-w-7xl mx-auto w-full px-6 py-8">
      <div className="text-xs tracking-widest uppercase text-[#52404B] font-semibold mb-4">
        {results.length} result{results.length === 1 ? '' : 's'}
      </div>
      <div className="space-y-3">
        {results.map(article => (
          <button
            key={article.slug}
            onClick={() => onSelectArticle(article.slug)}
            className="w-full text-left bg-white border border-[#E5E4E3] rounded-[10px] p-4 hover:border-[#C74601] transition-colors"
          >
            <div className="font-semibold text-[#1F1C1B] mb-1">{article.title}</div>
            <p className="text-sm text-[#52404B] line-clamp-2">{article.purpose}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function HelpHome({
  categories,
  query,
  setQuery,
  onSelectArticle,
  onSelectCategory,
}: {
  categories: CategoryModel[];
  query: string;
  setQuery: (query: string) => void;
  onSelectArticle: (slug: string) => void;
  onSelectCategory: (id: string) => void;
}) {
  return (
    <main className="flex-1 flex flex-col w-full bg-white">
      <SearchHero query={query} setQuery={setQuery} />

      {query.trim() ? (
        <SearchResults query={query} onSelectArticle={onSelectArticle} />
      ) : (
        <>
          <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onSelectArticle={onSelectArticle}
                  onSelectCategory={onSelectCategory}
                />
              ))}
            </div>

            <div className="mt-16 bg-[#FAFBF8] border border-[#E5E4E3] rounded-[12px] p-8 text-left max-w-3xl">
              <div className="w-12 h-12 bg-white border border-[#E5E4E3] rounded-[8px] flex items-center justify-center mb-4 text-[#007970]">
                <Mail className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-montserrat font-semibold text-[#1F1C1B] mb-2">Can't find what you're looking for?</h3>
              <p className="text-[#52404B] font-roboto mb-6 text-sm">Our support team is available to help you with any specific questions.</p>
              <button className="bg-[#C74601] text-white hover:bg-[#421700] px-6 py-2.5 rounded-[8px] text-sm font-roboto font-medium transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function HelpCategoryRoute({
  categories,
  onSelectArticle,
  onHomeClick,
}: {
  categories: CategoryModel[];
  onSelectArticle: (slug: string) => void;
  onHomeClick: () => void;
}) {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return <main className="p-8 text-[#52404B]">Category not found.</main>;
  }

  return (
    <main className="flex-1 w-full bg-white border-t border-[#E5E4E3]">
      <CategoryView category={category} onSelectArticle={onSelectArticle} onHomeClick={onHomeClick} />
    </main>
  );
}

function HelpArticleRoute({
  categories,
  onHomeClick,
  onCategoryClick,
}: {
  categories: CategoryModel[];
  onHomeClick: () => void;
  onCategoryClick: (id: string) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? findArticle(slug) : undefined;

  if (!article) {
    return <main className="p-8 text-[#52404B]">Article not found.</main>;
  }

  const category = categories.find(c => c.id === article.category);
  if (!category) {
    return <main className="p-8 text-[#52404B]">Category not found.</main>;
  }

  return (
    <main className="flex-1 w-full bg-white border-t border-[#E5E4E3]">
      <ArticleViewer article={article} category={category} onHomeClick={onHomeClick} onCategoryClick={onCategoryClick} />
    </main>
  );
}

export function HelpCenterPage() {
  const categories = useCategoryModels();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSelectArticle = (slug: string) => {
    setQuery('');
    navigate(`/help/${slug}`);
    window.scrollTo(0, 0);
  };

  const handleSelectCategory = (categoryId: string) => {
    setQuery('');
    navigate(`/help/category/${categoryId}`);
    window.scrollTo(0, 0);
  };

  const handleHomeClick = () => {
    setQuery('');
    navigate('/help');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <TopNav onHomeClick={handleHomeClick} />
      <Routes>
        <Route
          path="/"
          element={
            <HelpHome
              categories={categories}
              query={query}
              setQuery={setQuery}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
            />
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <HelpCategoryRoute
              categories={categories}
              onSelectArticle={handleSelectArticle}
              onHomeClick={handleHomeClick}
            />
          }
        />
        <Route
          path="/:slug"
          element={
            <HelpArticleRoute
              categories={categories}
              onHomeClick={handleHomeClick}
              onCategoryClick={handleSelectCategory}
            />
          }
        />
      </Routes>
    </div>
  );
}