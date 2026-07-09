import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  GraduationCap,
  Home,
  ImageOff,
  LifeBuoy,
  Plus,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { HelpBadgeId, HelpCenterCategory } from '@/policy/helpCenter/types';
import { HELP_CATEGORIES, getCategory } from '@/policy/helpCenter/data/helpCategories';
import { HELP_CENTER_ARTICLES, getArticleBySlug } from '@/policy/helpCenter/data/helpArticles';
import { HELP_TOURS } from '@/policy/helpCenter/data/helpTours';
import { OFFICE_STAFF_SYLLABUS } from '@/policy/helpCenter/data/officeStaffSyllabus';
import { RETIRED_ARTICLES, findRetirementByOldId } from '@/policy/helpCenter/data/retiredArticles';
import { articlesForCategory, filterHelpArticles } from '@/policy/helpCenter/utils/filters';
import { ThreadsHelpView, ThreadPanel } from '@/policy/help-center/threads';
import { VISUAL_HELP_ARTICLES } from '@/policy/data/visualHelpArticles';
import type { GuidedDomain } from '../../guided/types';
import { getTourBuilder } from '../../guided/tourRegistry';
import { useGuidedTourStore } from '../../guided/guidedTourStore';
import { cx } from '../../utils/classNames';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';
import {
  HelpArticleCard,
  HelpArticleDetail,
  HelpBadgeFilterBar,
  HelpCategoryCard,
  HelpCommandRail,
  HelpGuidedTourCard,
  HelpHero,
  HelpSyllabusLanding,
  categoryIcon,
} from './helpcenter';

type HelpWorkspaceTabId = 'home' | 'manuals' | 'guided-tours' | 'office-training' | 'troubleshooting' | 'support';

const HELP_WORKSPACE_TABS: Array<{
  id: HelpWorkspaceTabId;
  label: string;
  to: string;
}> = [
  { id: 'home', label: 'Home', to: '/help' },
  { id: 'manuals', label: 'Manuals', to: '/help/manuals' },
  { id: 'guided-tours', label: 'Guided Tours', to: '/help/category/guided-tours' },
  { id: 'office-training', label: 'Office Training', to: '/help/syllabus' },
  { id: 'troubleshooting', label: 'Troubleshooting', to: '/help/category/troubleshooting' },
  { id: 'support', label: 'Support', to: '/help/threads' },
];

function activeHelpWorkspaceTab(splat: string, hash: string): HelpWorkspaceTabId {
  const clean = splat.replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'index') {
    if (hash === '#manuals') return 'manuals';
    if (hash === '#direct-support') return 'support';
    return 'home';
  }

  if (clean === 'manuals') return 'manuals';
  if (clean === 'syllabus' || clean.startsWith('syllabus/')) return 'office-training';
  if (clean === 'threads' || clean.startsWith('threads/') || clean === 'support') return 'support';

  const categoryMatch = clean.match(/^category\/([^/]+)$/);
  if (categoryMatch) {
    if (categoryMatch[1] === 'guided-tours') return 'guided-tours';
    if (categoryMatch[1] === 'troubleshooting') return 'troubleshooting';
    return 'manuals';
  }

  const article = getArticleBySlug(clean);
  if (article?.category === 'guided-tours' || article?.launchTourDomain) return 'guided-tours';
  if (article?.category === 'troubleshooting') return 'troubleshooting';
  if (article?.category === 'threads-discussions' || article?.category === 'community' || article?.category === 'feature-requests') return 'support';
  return 'manuals';
}

function HelpWorkspaceTabs({ activeTab }: { activeTab: HelpWorkspaceTabId }) {
  return (
    <nav aria-label="Help Center workspace sections" className={workspaceTabNavClass}>
      {HELP_WORKSPACE_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className={cx(
              workspaceCompactTabClass,
              'whitespace-nowrap focus-visible:shadow-focus',
              isActive ? workspaceTabActiveClass : workspaceTabInactiveClass,
            )}
          >
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Help Center Command Center — standalone /help workspace.
 * Homepage: ci-page-hero band, KPI tiles, category command grid, office-staff
 * training entry, article previews, and a right-side command rail.
 * Sub-surfaces: /help/syllabus, /help/category/:id, /help/threads*, /help/:slug.
 */
export function HelpCenterScreen() {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const launchTourStore = useGuidedTourStore((s) => s.launchTour);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const splat = (params['*'] || '').trim();
  const activeTab = activeHelpWorkspaceTab(splat, hash);

  useEffect(() => {
    if (!hash) return;
    const targetId = decodeURIComponent(hash.slice(1));
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }, [hash, splat]);

  const startGuidedTour = (domain: string) => {
    const entry = getTourBuilder(domain as GuidedDomain);
    if (!entry) return;
    const slotValues = domain === 'event_packet' ? { event: 'Q2 QAPI Review', packet_type: 'qapi' } : {};
    const tour = entry.build(slotValues, new Date().toISOString());
    launchTourStore(tour);
  };

  const isThreadsMode = splat === 'threads' || splat.startsWith('threads/');
  const isManualsMode = splat === 'manuals';
  const isSyllabusMode = splat === 'syllabus';
  const categoryMatch = splat.match(/^category\/([^/]+)$/);
  const articleSlug = !isThreadsMode && !isManualsMode && !isSyllabusMode && !categoryMatch && splat && splat !== 'index' ? splat : '';

  const shell = (hashId: string, template: string, children: React.ReactNode) => (
    <section
      className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12"
      data-group="System"
      data-hash-id={hashId}
      data-route="/help/*"
      data-template={template}
    >
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="pb-12">
          <div className="relative z-20 flex justify-start">
            <HelpWorkspaceTabs activeTab={activeTab} />
          </div>
          <div className="space-y-8">{children}</div>
        </div>
      </main>
    </section>
  );

  // ---- /help/syllabus -------------------------------------------------------
  if (isSyllabusMode) {
    return shell('help-center', 'docs', <HelpSyllabusLanding />);
  }

  // ---- /help/manuals --------------------------------------------------------
  if (isManualsMode) {
    return shell('help-manuals', 'docs', <HelpManualsPage />);
  }

  // ---- /help/threads* -------------------------------------------------------
  if (isThreadsMode) {
    return shell(
      'help-center',
      'docs',
      <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm md:p-8">
        <ThreadsHelpView splat={splat} />
      </section>,
    );
  }

  // ---- /help/category/:id ---------------------------------------------------
  if (categoryMatch) {
    const category = getCategory(categoryMatch[1]);
    if (category) {
      return shell(`help-${category.categoryId}`, 'docs', <CategoryDetail category={category} onLaunchTour={startGuidedTour} />);
    }
  }

  // ---- /help/:slug (article, retired id, or legacy slug) ---------------------
  if (articleSlug) {
    const article = getArticleBySlug(articleSlug);
    if (article && article.status === 'active') {
      return shell('help-center', 'docs', (
        <>
          <HelpArticleDetail article={article} onLaunchTour={startGuidedTour} />
          <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm md:p-8">
            <ThreadPanel
              source={{ kind: 'help_article', articleId: article.articleId, title: article.title }}
              heading="Threads about this article"
              onOpenThread={(id) => navigate(`/help/threads/${id}`)}
            />
          </section>
        </>
      ));
    }
    return shell('help-center', 'docs', <RetiredOrMissingArticle slugOrId={articleSlug} />);
  }

  // ---- /help homepage ---------------------------------------------------------
  return shell('help-center', 'dashboard', <HelpHomePage searchRef={searchRef} onLaunchTour={startGuidedTour} />);
}

// ---------------------------------------------------------------------------

function HelpHomePage({
  searchRef,
  onLaunchTour,
}: {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onLaunchTour: (domain: string) => void;
}) {
  const navigate = useNavigate();
  const active = useMemo(() => HELP_CENTER_ARTICLES.filter((a) => a.status === 'active'), []);
  const lessonCount = OFFICE_STAFF_SYLLABUS.reduce((n, m) => n + m.lessons.length, 0);
  const troubleshootingCount = active.filter((a) => a.category === 'troubleshooting').length;
  const interactiveCount = active.filter((a) =>
    a.launchTourDomain || a.blocks.some((b) => b.type === 'checklist' || b.type === 'decisionTree' || b.type === 'troubleshootingFlow' || b.type === 'faq'),
  ).length;
  const noPhiCount = active.filter((a) => a.badges.includes('no-phi')).length;

  const stats = [
    { icon: BookOpen, value: String(active.length), label: 'Manuals' },
    { icon: Compass, value: String(HELP_TOURS.length), label: 'Guided Tours' },
    { icon: GraduationCap, value: String(lessonCount), label: 'Office Staff Lessons' },
    { icon: Wrench, value: String(troubleshootingCount), label: 'Troubleshooting Guides' },
    { icon: Sparkles, value: String(interactiveCount), label: 'Interactive Articles' },
    { icon: ShieldCheck, value: String(noPhiCount), label: 'No-PHI Examples' },
  ];

  const featured = useMemo(() => {
    const picks = ['HC-GS-OVERVIEW', 'HC-BRAD-ASK', 'HC-EVID-UPLOAD', 'HC-FORMS-PRINT'];
    return picks.map((id) => active.find((a) => a.articleId === id)).filter((a): a is NonNullable<typeof a> => Boolean(a));
  }, [active]);

  return (
    <>
      <HelpHero onSearchFocus={() => { searchRef.current?.focus(); searchRef.current?.scrollIntoView({ block: 'center' }); }} />

      {/* KPI tiles */}
      <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="ci-stagger-card group flex min-h-[164px] flex-col items-center justify-center rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-center shadow-sm transition-colors hover:border-[#007970]"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <stat.icon className="mb-4 h-6 w-6 text-[#007970]" aria-hidden />
            <span className="mb-3 font-montserrat text-3xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-110 md:text-4xl">
              {stat.value}
            </span>
            <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-8">
          {/* Category command grid */}
          <section id="manuals" className="scroll-mt-8 rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 max-w-3xl">
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Browse by Workspace</h2>
              <p className="mt-3 text-base leading-relaxed text-[#747470]">
                Every workspace has its own manual set — overviews, task guides, and troubleshooting, each tagged by audience and task type.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {HELP_CATEGORIES.map((category, i) => (
                <HelpCategoryCard
                  key={category.categoryId}
                  category={category}
                  articleCount={articlesForCategory(HELP_CENTER_ARTICLES, category.categoryId).length}
                  index={i}
                />
              ))}
            </div>
          </section>

          {/* Office staff training entry card */}
          <section className="rounded-[24px] border border-[#C4F4F5] bg-[#E5FEFF] p-8 shadow-sm md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">Training Path</h2>
                <p className="mt-3 font-montserrat text-2xl font-bold text-[#007970]">Office Staff End User Training Syllabus</p>
                <p className="mt-3 text-base leading-relaxed text-[#005C55]">
                  {OFFICE_STAFF_SYLLABUS.length} modules, {OFFICE_STAFF_SYLLABUS.reduce((n, m) => n + m.lessons.length, 0)} hands-on lessons.
                  Practice every non-admin workspace with demo data, knowledge checks, and success criteria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/help/syllabus')}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)]"
              >
                <GraduationCap className="h-4 w-4" aria-hidden /> Start syllabus
              </button>
            </div>
          </section>

          {/* Featured article previews */}
          <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Start With These</h2>
                <p className="mt-3 text-base leading-relaxed text-[#747470]">Popular quick starts across the app.</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {featured.map((article) => (
                <HelpArticleCard key={article.articleId} article={article} showImage />
              ))}
            </div>
          </section>

          {/* Closing CTA band */}
          <section className="rounded-[24px] border border-[#C4F4F5] bg-[#F7FEFF] p-10 text-center shadow-sm">
            <h2 className="font-montserrat text-3xl font-bold text-[#007970]">Still stuck?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#005C55]">
              Ask Brad, start a thread, or launch a guided walkthrough — no question is too small.
            </p>
            <button
              type="button"
              onClick={() => navigate('/iadministrator')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.32)]"
            >
              Ask Brad <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </section>
        </div>

        <div className="xl:col-span-4">
          <HelpCommandRail searchRef={searchRef} onLaunchTour={onLaunchTour} />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

function HelpManualsPage() {
  const active = useMemo(() => HELP_CENTER_ARTICLES.filter((a) => a.status === 'active'), []);
  const manualArticles = useMemo(
    () => active.filter((a) => a.template.endsWith('manual') || a.template === 'office-staff-lesson'),
    [active],
  );
  const recentlyUpdated = useMemo(
    () => [...manualArticles].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 12),
    [manualArticles],
  );
  const categoriesWithManuals = HELP_CATEGORIES.filter((category) =>
    articlesForCategory(HELP_CENTER_ARTICLES, category.categoryId).some((article) => article.status === 'active'),
  );
  const noPhiCount = manualArticles.filter((a) => a.badges.includes('no-phi')).length;
  const routeCoverageCount = new Set(manualArticles.flatMap((a) => a.routes)).size;

  const stats = [
    { icon: BookOpen, value: String(manualArticles.length), label: 'Manuals' },
    { icon: Home, value: String(categoriesWithManuals.length), label: 'Workspaces' },
    { icon: Compass, value: String(routeCoverageCount), label: 'Routes Covered' },
    { icon: ShieldCheck, value: String(noPhiCount), label: 'No-PHI Guides' },
  ];

  return (
    <>
      <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-12">
        <div className="flex flex-wrap items-center gap-6">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#E5FEFF] text-[#007970]">
            <BookOpen className="h-8 w-8" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">Help Center Manuals</p>
            <h1 className="mt-2 font-montserrat text-3xl font-bold tracking-tight text-[#007970] md:text-5xl">Manuals</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[#52404B]">
              Browse every workspace manual from one dedicated page: quick starts, page guides, workflow manuals, troubleshooting references, and route/component coverage.
            </p>
          </div>
        </div>
      </section>

      <div className="grid w-full grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="ci-stagger-card flex min-h-[148px] flex-col items-center justify-center rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-center shadow-sm"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <stat.icon className="mb-3 h-6 w-6 text-[#007970]" aria-hidden />
            <span className="mb-2 font-montserrat text-3xl font-bold text-[#F06923] md:text-4xl">{stat.value}</span>
            <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{stat.label}</span>
          </div>
        ))}
      </div>

      <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Browse Manuals by Workspace</h2>
          <p className="mt-3 text-base leading-relaxed text-[#52404B]">
            Start from a workspace when you know where the task lives. Each card opens the matching manual category.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categoriesWithManuals.map((category, i) => (
            <HelpCategoryCard
              key={category.categoryId}
              category={category}
              articleCount={articlesForCategory(HELP_CENTER_ARTICLES, category.categoryId).length}
              index={i}
            />
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Recently Updated Manuals</h2>
          <p className="mt-3 text-base leading-relaxed text-[#52404B]">
            These guides show time, audience, and route/component coverage so office staff can pick the right manual quickly.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recentlyUpdated.map((article) => (
            <HelpArticleCard key={article.articleId} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------

function CategoryDetail({ category, onLaunchTour }: { category: HelpCenterCategory; onLaunchTour: (domain: string) => void }) {
  const navigate = useNavigate();
  const [badgeFilter, setBadgeFilter] = useState<HelpBadgeId[]>([]);
  const [badgeFiltersOpen, setBadgeFiltersOpen] = useState(false);
  const Icon = categoryIcon(category.icon);
  const articles = useMemo(
    () => filterHelpArticles(HELP_CENTER_ARTICLES, { category: category.categoryId, badges: badgeFilter.length ? badgeFilter : undefined }),
    [category.categoryId, badgeFilter],
  );
  const tours = HELP_TOURS.filter((t) => category.guidedTours.includes(t.tourId));
  const isThreadCategory = category.categoryId === 'threads-discussions' || category.categoryId === 'community';

  return (
    <>
      <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-12">
        <div className="flex flex-wrap items-center gap-6">
          <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#E5FEFF] text-[#007970]">
            <Icon className="h-8 w-8" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">Workspace manuals</p>
            <h1 className="mt-2 font-montserrat text-3xl font-bold tracking-tight text-[#007970] md:text-4xl">{category.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#747470]">{category.shortDescription}</p>
          </div>
          {category.quickActions.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {category.quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="inline-flex items-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] transition-colors hover:bg-[#F7FEFF]"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {category.categoryId === 'guided-tours' ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {HELP_TOURS.map((tour) => (
            <HelpGuidedTourCard key={tour.tourId} tour={tour} onLaunch={onLaunchTour} />
          ))}
        </section>
      ) : tours.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-2">
          {tours.map((tour) => (
            <HelpGuidedTourCard key={tour.tourId} tour={tour} onLaunch={onLaunchTour} />
          ))}
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-12">
        <section className="xl:col-span-8">
          {articles.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {articles.map((article) => (
                <HelpArticleCard key={article.articleId} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-10 text-center shadow-sm">
              <p className="text-sm text-[#747470]">No articles match the current filters.</p>
              <button
                type="button"
                onClick={() => setBadgeFilter([])}
                className="mt-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#F06923] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {isThreadCategory ? (
            <div className="mt-8 rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#F06923]">
                    {category.categoryId === 'community' ? 'No-PHI team discussions' : 'Live threads'}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#747470]">
                    Ask operational questions and turn repeated topics into Help Center articles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/help/threads/new')}
                  className="inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden /> Start thread
                </button>
              </div>
              <ThreadsHelpView splat="threads" />
            </div>
          ) : null}
        </section>

        <aside className="xl:col-span-4">
          <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => setBadgeFiltersOpen((v) => !v)}
              aria-expanded={badgeFiltersOpen}
              className="flex w-full items-center justify-between gap-3 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-colors hover:text-[#F06923] focus-visible:outline-none focus-visible:shadow-focus xl:pointer-events-none"
            >
              <span>Filter by badge{badgeFilter.length ? ` (${badgeFilter.length})` : ''}</span>
              <ChevronDown className={cx('h-4 w-4 transition-transform xl:hidden', badgeFiltersOpen && 'rotate-180')} aria-hidden />
            </button>
            <div className={cx('mt-4', badgeFiltersOpen ? 'block' : 'hidden xl:block')}>
              <HelpBadgeFilterBar
                selected={badgeFilter}
                onToggle={(b) => setBadgeFilter((cur) => (cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b]))}
                onClear={() => setBadgeFilter([])}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------

/** Retired-article handling: map legacy ids/slugs to their replacement. */
function RetiredOrMissingArticle({ slugOrId }: { slugOrId: string }) {
  const navigate = useNavigate();
  // Legacy visual articles were keyed by slug; legacy KB articles by uppercase id.
  const visualId = Object.values(VISUAL_HELP_ARTICLES).find((a) => a.slug === slugOrId)?.id;
  const retirement = findRetirementByOldId(slugOrId) ?? (visualId ? findRetirementByOldId(visualId) : undefined);
  const replacement = retirement?.replacedByArticleId
    ? HELP_CENTER_ARTICLES.find((a) => a.articleId === retirement.replacedByArticleId)
    : undefined;

  return (
    <section className="mx-auto max-w-2xl rounded-[24px] border border-[#E5E4E3] bg-white p-10 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-[16px] bg-[#F1F1EF] text-[#63635E]">
        {retirement ? <LifeBuoy className="h-7 w-7" aria-hidden /> : <ImageOff className="h-7 w-7" aria-hidden />}
      </span>
      <h1 className="mt-6 font-montserrat text-2xl font-bold text-[#007970]">
        {retirement ? 'This article was retired' : 'Article not found'}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#747470]">
        {retirement
          ? retirement.reasonRetired + (replacement ? ' A newer manual covers this topic.' : ' No direct replacement exists yet — browse the categories or ask Brad.')
          : `No help article matches “${slugOrId}”. It may have moved — try search or browse by workspace.`}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {replacement ? (
          <button
            type="button"
            onClick={() => navigate(`/help/${replacement.slug}`)}
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-6 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5"
          >
            Open replacement <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => navigate('/help')}
          className="inline-flex items-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-6 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] transition-colors hover:bg-[#F7FEFF]"
        >
          Open Help Home
        </button>
      </div>
      {retirement ? (
        <p className="mt-6 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
          Retired register: {RETIRED_ARTICLES.length} legacy articles tracked with replacements
        </p>
      ) : null}
    </section>
  );
}

export default HelpCenterScreen;
