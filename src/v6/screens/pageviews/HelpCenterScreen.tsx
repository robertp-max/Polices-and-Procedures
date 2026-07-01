import { Search, HelpCircle, FileText, ArrowLeft, MessagesSquare, Sparkles, Users, Compass, Plus, Home, Bot, Map, Calendar, FolderOpen, PenTool, BookOpen, BarChart3, UserPlus, GraduationCap, Lightbulb, Bell, Wrench, Settings, ClipboardCheck, type LucideIcon } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Badge, Button } from '../../primitives';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';
import { VISUAL_HELP_ARTICLES } from '@/policy/data/visualHelpArticles';
import VisualHelpArticleTemplate from '../../help/templates/VisualHelpArticleTemplate';
import { ThreadsHelpView, ThreadPanel } from '@/policy/help-center/threads';
import type { GuidedDomain } from '../../guided/types';
import { getTourBuilder } from '../../guided/tourRegistry';
import { useGuidedTourStore } from '../../guided/guidedTourStore';

const accentColors = ['teal', 'blue', 'green', 'yellow', 'orange'] as const;
type AccentColor = typeof accentColors[number];

interface CategoryDef {
  id: string;
  label: string;
  count: string;
  desc: string;
  icon: LucideIcon;
  accent: AccentColor;
}

const categories: CategoryDef[] = [
  { id: 'getting-started', label: 'Getting Started', count: 'Basics', desc: 'Login, navigation, Brad intro, how to get help.', icon: Home, accent: 'teal' },
  { id: 'brad-ai', label: 'Brad AI Assistant', count: 'Core', desc: 'How Brad works, citations, guided tours, limitations.', icon: Bot, accent: 'blue' },
  { id: 'guided-tours', label: 'Guided Tours', count: 'Interactive', desc: 'Step-by-step assistance for packets, evidence, signatures.', icon: Map, accent: 'green' },
  { id: 'ces-events', label: 'CES & Events', count: 'Compliance', desc: 'Calendar, boards, packets, gates.', icon: Calendar, accent: 'orange' },
  { id: 'evidence-center', label: 'Evidence Center', count: 'Studio', desc: 'Upload, validate, packet studio.', icon: FolderOpen, accent: 'teal' },
  { id: 'ecign-signatures', label: 'eCIgn & Signatures', count: 'Forms', desc: 'Send, track, evidence for signatures.', icon: PenTool, accent: 'blue' },
  { id: 'forms', label: 'Forms', count: 'Library', desc: 'Find, fill, print, reference forms.', icon: FileText, accent: 'green' },
  { id: 'policies', label: 'Policies', count: 'Library', desc: 'Search, cite, print policies.', icon: BookOpen, accent: 'yellow' },
  { id: 'qapi-reports', label: 'QAPI & Reports', count: 'Quality', desc: 'Packets, dashboards, exports.', icon: BarChart3, accent: 'orange' },
  { id: 'audit-survey', label: 'Audit & Survey', count: 'Readiness', desc: 'Audit mode, packet export.', icon: ClipboardCheck, accent: 'teal' },
  { id: 'admission-packets', label: 'Admission Packets', count: 'Patient', desc: 'Agreements, payer selector, NPP.', icon: UserPlus, accent: 'blue' },
  { id: 'onboarding-journey', label: 'Onboarding / Journey', count: 'Training', desc: 'Learner paths, Appendix F, drills.', icon: GraduationCap, accent: 'green' },
  { id: 'community', label: 'Community', count: 'Social', desc: 'Profiles, feed, threads (no PHI).', icon: Users, accent: 'yellow' },
  { id: 'feature-requests', label: 'Feature Requests', count: 'Roadmap', desc: 'Submit, upvote, track.', icon: Lightbulb, accent: 'orange' },
  { id: 'threads-discussions', label: 'Threads & Discussions', count: 'Collaboration', desc: 'Start and follow conversations.', icon: MessagesSquare, accent: 'teal' },
  { id: 'notifications-personal', label: 'Notifications & Personal', count: 'Panel', desc: 'Personal ops, alerts, focus.', icon: Bell, accent: 'blue' },
  { id: 'troubleshooting', label: 'Troubleshooting', count: 'Help', desc: 'Common issues and fixes.', icon: Wrench, accent: 'green' },
  { id: 'admin-settings', label: 'Admin & Settings', count: 'Governance', desc: 'Roles, demo data, moderation.', icon: Settings, accent: 'orange' },
];

const accentStyle: Record<AccentColor, { bg: string; text: string }> = {
  teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
  blue: { bg: 'bg-sky-100', text: 'text-sky-700' },
  green: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  yellow: { bg: 'bg-amber-100', text: 'text-amber-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
};

const latestUpdates = [
  'Visual Help Center launched with reusable template.',
  'P0 articles: Brad, Evidence Packet, Upload Evidence.',
  'All admin PageHeader descriptions removed to save space.',
] as const;

const guidedTourCards: Array<{
  domain: GuidedDomain;
  title: string;
  body: string;
  label: string;
  tone: 'teal' | 'orange';
}> = [
  {
    domain: 'event_packet',
    title: 'Evidence packet walkthrough',
    body: 'Brad opens Evidence Studio and walks the user through selecting an event packet template.',
    label: 'Guide packet build',
    tone: 'teal',
  },
  {
    domain: 'help_thread',
    title: 'Help thread walkthrough',
    body: 'Brad opens the thread surface, then points to the Start Thread, title, and post controls.',
    label: 'Guide help thread',
    tone: 'orange',
  },
  {
    domain: 'community',
    title: 'Community discussion walkthrough',
    body: 'Brad uses the no-PHI community thread surface for a team discussion or shared question.',
    label: 'Guide community',
    tone: 'teal',
  },
];

function GuidedTourCard({
  domain,
  title,
  body,
  label,
  tone,
  onLaunch,
}: {
  domain: GuidedDomain;
  title: string;
  body: string;
  label: string;
  tone: 'teal' | 'orange';
  onLaunch: (domain: GuidedDomain) => void;
}) {
  const accent = tone === 'orange' ? 'text-brand-orange' : 'text-brand-teal';
  return (
    <article className="rounded-lg bg-surface-glass p-lg shadow-rest backdrop-blur-md shadow-glass-inset">
      <div className="mb-md flex items-center gap-sm">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-surface-hover">
          <Sparkles aria-hidden="true" className={`h-icon-sm w-icon-sm ${accent}`} />
        </span>
        <div>
          <h3 className="text-base font-medium text-ink">{title}</h3>
          <p className="text-[11px] uppercase tracking-wide text-muted">{domain.replace('_', ' ')}</p>
        </div>
      </div>
      <p className="mb-md text-sm leading-relaxed text-secondary">{body}</p>
      <Button size="sm" onClick={() => onLaunch(domain)}>{label}</Button>
    </article>
  );
}

export function HelpCenterScreen() {
  const params = useParams<{ '*': string }>();
  const navigate = useNavigate();
  const launchTour = useGuidedTourStore((s) => s.launchTour);
  const splat = (params['*'] || '').trim();

  // Threads sub-surface lives under /help/* (no new top-level route).
  const isThreadsMode = splat === 'threads' || splat.startsWith('threads/') || splat === 'category/threads-discussions';
  const isCommunityMode = splat === 'category/community';
  const isGuidedToursMode = splat === 'category/guided-tours';
  const threadsSplat = splat.startsWith('threads') ? splat : 'threads';

  const articleSlug = splat && splat !== 'index' ? splat : '';
  const currentVisual = articleSlug && VISUAL_HELP_ARTICLES[articleSlug] ? VISUAL_HELP_ARTICLES[articleSlug] : null;
  const currentLegacyId = articleSlug && HELP_ARTICLES[articleSlug.toUpperCase()] ? articleSlug.toUpperCase() : '';
  const currentArticle = currentLegacyId ? HELP_ARTICLES[currentLegacyId] : null;

  const specialCategoryIds = new Set(['community', 'guided-tours', 'threads-discussions']);
  const selectedCategory = (() => {
    const m = splat.match(/^category\/([^/]+)$/);
    if (!m) return null;
    const id = m[1];
    if (specialCategoryIds.has(id)) return null;
    return categories.find((c) => c.id === id) ?? null;
  })();
  const categoryArticles = selectedCategory
    ? Object.values(VISUAL_HELP_ARTICLES).filter((a) => a.category === selectedCategory.id)
    : [];

  const routeBase = '/help';
  const openThread = (id: string) => navigate(`/help/threads/${id}`);
  const startGuidedTour = (domain: GuidedDomain) => {
    const entry = getTourBuilder(domain);
    if (!entry) return;
    const slotValues =
      domain === 'event_packet'
        ? { event: 'Q2 QAPI Review', packet_type: 'qapi' }
        : {};
    const tour = entry.build(slotValues, new Date().toISOString());
    launchTour(tour);
  };

  if (isCommunityMode) {
    return (
      <section className="grid gap-xl" data-group="System" data-hash-id="help-community" data-route="/help/category/community" data-template="docs">
        <div className="flex items-center justify-between">
          <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-teal-700 hover:underline">
            <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Help Center
          </Link>
          <Button iconLeft={<Plus className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/help/threads/new')}>
            Start community thread
          </Button>
        </div>
        <section className="rounded-lg bg-surface-glass p-xl shadow-rest backdrop-blur-md shadow-glass-inset">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="mb-xs text-xs font-medium uppercase tracking-wide text-brand-orange">Community</p>
              <h2 className="text-h2 font-medium text-ink">No-PHI team discussions</h2>
              <p className="mt-sm max-w-3xl text-sm leading-relaxed text-secondary">
                Ask operational questions, share workflow improvements, and turn repeated support topics into Help Center articles.
              </p>
            </div>
            <Button variant="secondary" iconLeft={<Compass className="h-icon-sm w-icon-sm" />} onClick={() => startGuidedTour('community')}>
              Brad guide
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => navigate('/community')}>Open full Community hub</Button>
          </div>
          <ThreadsHelpView splat="threads" />
        </section>
      </section>
    );
  }

  if (isGuidedToursMode) {
    return (
      <section className="grid gap-xl" data-group="System" data-hash-id="help-guided-tours" data-route="/help/category/guided-tours" data-template="docs">
        <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
          <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Help Center
        </Link>
        <section className="rounded-lg bg-surface-glass p-xl shadow-rest backdrop-blur-md shadow-glass-inset">
          <p className="mb-xs text-xs font-medium uppercase tracking-wide text-brand-orange">Brad guided assistance</p>
          <h2 className="text-h2 font-medium text-ink">Interactive walkthroughs</h2>
          <p className="mt-sm max-w-3xl text-sm leading-relaxed text-secondary">
            These launch the actual guided overlay. Brad navigates where possible, highlights the next action, and leaves human review steps under user control.
          </p>
          <div className="mt-xl grid gap-md desktop:grid-cols-3">
            {guidedTourCards.map((card) => (
              <GuidedTourCard key={card.domain} {...card} onLaunch={startGuidedTour} />
            ))}
          </div>
        </section>
      </section>
    );
  }

  if (selectedCategory) {
    const Icon = selectedCategory.icon;
    const ac = accentStyle[selectedCategory.accent];
    return (
      <section className="grid gap-xl" data-group="System" data-hash-id={`help-${selectedCategory.id}`} data-route={`/help/category/${selectedCategory.id}`} data-template="docs">
        <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
          <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Help Center
        </Link>

        <div className="flex items-center gap-4">
          <div className={`h-11 w-11 rounded-2xl ${ac.bg} flex items-center justify-center ring-1 ring-inset ring-white/70`}>
            <Icon className={`h-6 w-6 ${ac.text}`} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[1.5px] text-muted font-medium">{selectedCategory.count}</div>
            <h1 className="text-h2 font-semibold text-ink tracking-tight">{selectedCategory.label}</h1>
            <p className="text-sm text-secondary mt-0.5 max-w-xl">{selectedCategory.desc}</p>
          </div>
        </div>

        {categoryArticles.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {categoryArticles.map((art) => (
              <Link
                key={art.slug}
                to={`${routeBase}/${art.slug}`}
                className="rounded-2xl bg-white/80 p-5 hover:bg-white hover:shadow-sm transition-all group flex flex-col min-h-[120px]"
              >
                <div className="font-semibold text-ink text-[15px] tracking-tight group-hover:underline">{art.title}</div>
                <p className="mt-2 text-sm text-secondary line-clamp-3 leading-relaxed">{art.summary}</p>
                <div className="mt-auto pt-4 text-xs text-muted">Open knowledge article →</div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/70 p-8 text-center">
            <div className="text-sm text-secondary mb-1">No articles published yet for this category.</div>
            <div className="text-xs text-muted">Ask Brad or browse other categories for available guides.</div>
          </div>
        )}
      </section>
    );
  }

  if (isThreadsMode) {
    return (
      <section className="grid gap-xl" data-group="System" data-hash-id="help-center" data-route="/help/*" data-template="docs">
        <div className="flex items-center justify-between">
          <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-teal-700 hover:underline">
            <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Help Center
          </Link>
        </div>
        <ThreadsHelpView splat={threadsSplat} />
      </section>
    );
  }

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
          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-lg">Help Center Categories</h3>
            <div className="grid gap-md tablet-l:grid-cols-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const ac = accentStyle[category.accent];
                return (
                  <Link
                    key={category.id}
                    to={`${routeBase}/category/${category.id}`}
                    className="rounded-2xl bg-white/70 backdrop-blur-sm p-5 flex flex-col gap-2 hover:bg-white hover:shadow-sm transition-all duration-fast group min-h-[140px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-9 w-9 rounded-xl ${ac.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-5 w-5 ${ac.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink group-hover:text-current">{category.label}</span>
                          <Badge size="sm" className="text-[10px]">{category.count}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-secondary leading-snug">{category.desc}</p>
                      </div>
                    </div>
                    <span className="mt-1 text-xs text-muted inline-flex items-center">Browse articles →</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            {currentVisual ? (
              <div className="grid gap-lg">
                <VisualHelpArticleTemplate
                  article={currentVisual}
                  onLaunchTour={(id) => startGuidedTour(id as GuidedDomain)}
                  onStartThread={() => navigate('/help/threads/new')}
                />
                <ThreadPanel
                  source={{ kind: 'help_article', articleId: articleSlug, title: currentVisual.title }}
                  heading="Threads about this article"
                  onOpenThread={openThread}
                />
              </div>
            ) : currentArticle ? (
              <div>
                <div className="mb-lg flex items-center justify-between">
                  <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-teal-700 hover:underline">
                    <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Back
                  </Link>
                  <Badge>{currentArticle.id}</Badge>
                </div>
                <h2 className="text-h2 font-medium text-ink">{currentArticle.title}</h2>
                {currentArticle.subtitle && <p className="mt-xs text-base text-muted">{currentArticle.subtitle}</p>}
                {currentArticle.overview && <p className="mt-md text-sm text-secondary">{currentArticle.overview}</p>}
                {currentArticle.steps && currentArticle.steps.length > 0 && (
                  <div className="mt-md">
                    <div className="text-sm font-medium text-ink mb-xs">Steps</div>
                    <ul className="list-decimal pl-5 text-sm text-secondary">
                      {currentArticle.steps.map((s, i) => <li key={i}>{s.label}: {s.detail}</li>)}
                    </ul>
                  </div>
                )}
                {currentArticle.commonMistakes && currentArticle.commonMistakes.length > 0 && (
                  <div className="mt-md">
                    <div className="text-sm font-medium text-ink mb-xs">Common Mistakes</div>
                    <ul className="list-disc pl-5 text-sm text-secondary">
                      {currentArticle.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                )}
                {currentArticle.auditTips && currentArticle.auditTips.length > 0 && (
                  <div className="mt-md">
                    <div className="text-sm font-medium text-ink mb-xs">Audit Tips</div>
                    <ul className="list-disc pl-5 text-sm text-secondary">
                      {currentArticle.auditTips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}
                <div className="mt-lg text-sm text-secondary">Legacy article view. Browse by category for updated visual guides.</div>
                <div className="mt-lg">
                  <ThreadPanel
                    source={{ kind: 'help_article', articleId: currentLegacyId, title: currentArticle.title }}
                    heading="Threads about this article"
                    onOpenThread={openThread}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-secondary">
                Select a category above to browse its knowledge articles. Clean cards will appear for available guides.
              </div>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Help search">
          <label className="flex h-control items-center gap-sm rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset px-md text-muted shadow-rest">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search help topics</span>
            <input className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none" placeholder="Search help..." type="search" />
          </label>

          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <HelpCircle aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Direct Support
            </h3>
            <p className="text-sm text-secondary">Cannot find the right guideline? Use Brad or submit a feature request.</p>
          </section>

          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <Sparkles aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-orange" />
              Brad Guided Tours
            </h3>
            <div className="grid gap-sm">
              {guidedTourCards.map((card) => (
                <button
                  key={card.domain}
                  type="button"
                  onClick={() => startGuidedTour(card.domain)}
                  className="rounded-lg bg-surface-glass p-md text-left shadow-glass-inset transition duration-fast hover:bg-surface-hover"
                >
                  <span className="block text-sm font-medium text-ink">{card.title}</span>
                  <span className="mt-1 block text-xs text-muted">{card.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <MessagesSquare aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Threads
            </h3>
            <p className="mb-md text-sm text-secondary">Open the Help Center thread surface or start a no-PHI community discussion.</p>
            <div className="flex flex-wrap gap-sm">
              <Button size="sm" variant="secondary" iconLeft={<Users className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/help/category/community')}>
                Community
              </Button>
              <Button size="sm" iconLeft={<Plus className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/help/threads/new')}>
                New thread
              </Button>
            </div>
          </section>

          <section className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <FileText aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Baseline Notes
            </h3>
            <ul className="text-sm text-secondary grid gap-sm list-disc pl-md">
              {latestUpdates.map((update) => <li key={update}>{update}</li>)}
            </ul>
          </section>
        </aside>
      </section>
    </section>
  );
}

export default HelpCenterScreen;
