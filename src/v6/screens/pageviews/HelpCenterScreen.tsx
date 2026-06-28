import { Search, HelpCircle, FileText, ArrowLeft, MessagesSquare, Sparkles, Users, Compass, Plus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Badge, Button } from '../../primitives';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';
import { VISUAL_HELP_ARTICLES } from '@/policy/data/visualHelpArticles';
import VisualHelpArticleTemplate from '../../help/templates/VisualHelpArticleTemplate';
import { ThreadsHelpView, ThreadPanel } from '@/policy/help-center/threads';
import type { GuidedDomain } from '../../guided/types';
import { getTourBuilder } from '../../guided/tourRegistry';
import { useGuidedTourStore } from '../../guided/guidedTourStore';

const categories = [
  { id: 'getting-started', label: 'Getting Started', count: 'Basics', desc: 'Login, navigation, Brad intro, how to get help.' },
  { id: 'brad-ai', label: 'Brad AI Assistant', count: 'Core', desc: 'How Brad works, citations, guided tours, limitations.' },
  { id: 'guided-tours', label: 'Guided Tours', count: 'Interactive', desc: 'Step-by-step assistance for packets, evidence, signatures.' },
  { id: 'ces-events', label: 'CES & Events', count: 'Compliance', desc: 'Calendar, boards, packets, gates.' },
  { id: 'evidence-center', label: 'Evidence Center', count: 'Studio', desc: 'Upload, validate, packet studio.' },
  { id: 'ecign-signatures', label: 'eCIgn & Signatures', count: 'Forms', desc: 'Send, track, evidence for signatures.' },
  { id: 'forms', label: 'Forms', count: 'Library', desc: 'Find, fill, print, reference forms.' },
  { id: 'policies', label: 'Policies', count: 'Library', desc: 'Search, cite, print policies.' },
  { id: 'qapi-reports', label: 'QAPI & Reports', count: 'Quality', desc: 'Packets, dashboards, exports.' },
  { id: 'audit-survey', label: 'Audit & Survey', count: 'Readiness', desc: 'Audit mode, packet export.' },
  { id: 'admission-packets', label: 'Admission Packets', count: 'Patient', desc: 'Agreements, payer selector, NPP.' },
  { id: 'onboarding-journey', label: 'Onboarding / Journey', count: 'Training', desc: 'Learner paths, Appendix F, drills.' },
  { id: 'community', label: 'Community', count: 'Social', desc: 'Profiles, feed, threads (no PHI).' },
  { id: 'feature-requests', label: 'Feature Requests', count: 'Roadmap', desc: 'Submit, upvote, track.' },
  { id: 'threads-discussions', label: 'Threads & Discussions', count: 'Collaboration', desc: 'Start and follow conversations.' },
  { id: 'notifications-personal', label: 'Notifications & Personal', count: 'Panel', desc: 'Personal ops, alerts, focus.' },
  { id: 'troubleshooting', label: 'Troubleshooting', count: 'Help', desc: 'Common issues and fixes.' },
  { id: 'admin-settings', label: 'Admin & Settings', count: 'Governance', desc: 'Roles, demo data, moderation.' },
] as const;

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
    <article className="rounded-lg border border-card bg-surface-glass p-lg shadow-rest backdrop-blur-md shadow-glass-inset">
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
          <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
            <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Help Center
          </Link>
          <Button iconLeft={<Plus className="h-icon-sm w-icon-sm" />} onClick={() => navigate('/help/threads/new')}>
            Start community thread
          </Button>
        </div>
        <section className="rounded-lg border border-card bg-surface-glass p-xl shadow-rest backdrop-blur-md shadow-glass-inset">
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
        <section className="rounded-lg border border-card bg-surface-glass p-xl shadow-rest backdrop-blur-md shadow-glass-inset">
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

  if (isThreadsMode) {
    return (
      <section className="grid gap-xl" data-group="System" data-hash-id="help-center" data-route="/help/*" data-template="docs">
        <div className="flex items-center justify-between">
          <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
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
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-lg">Help Center Categories</h3>
            <div className="grid gap-md tablet-l:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`${routeBase}/category/${category.id}`}
                  className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg flex flex-col gap-xs hover:bg-surface-hover transition duration-fast"
                >
                  <div className="flex items-center justify-between mb-sm">
                    <span className="font-medium text-ink">{category.label}</span>
                    <Badge>{category.count}</Badge>
                  </div>
                  <p className="text-sm text-muted">{category.desc}</p>
                  <span className="text-xs text-brand-teal mt-auto">Browse →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
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
                  <Link to={routeBase} className="inline-flex items-center gap-sm text-sm font-medium text-brand-teal hover:underline">
                    <ArrowLeft aria-hidden="true" className="h-icon-sm w-icon-sm" /> Back
                  </Link>
                  <Badge>{currentArticle.id}</Badge>
                </div>
                <h2 className="text-h2 font-medium text-ink">{currentArticle.title}</h2>
                {currentArticle.subtitle && <p className="mt-xs text-base text-muted">{currentArticle.subtitle}</p>}
                {currentArticle.overview && <p className="mt-md text-sm text-secondary">{currentArticle.overview}</p>}
                <div className="mt-lg text-sm text-secondary">Legacy article view. See visual versions in categories above.</div>
                <div className="mt-lg">
                  <ThreadPanel
                    source={{ kind: 'help_article', articleId: currentLegacyId, title: currentArticle.title }}
                    heading="Threads about this article"
                    onOpenThread={openThread}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-h3 font-medium text-ink mb-lg">Visual Articles (P0 Priority)</h3>
                <div className="grid gap-sm">
                  {Object.keys(VISUAL_HELP_ARTICLES).map((slug) => {
                    const art = VISUAL_HELP_ARTICLES[slug];
                    return (
                      <Link key={slug} to={`${routeBase}/${slug}`} className="block rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg hover:bg-surface-hover transition duration-fast overflow-hidden">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-ink">{art.title}</div>
                            <div className="text-xs text-muted mt-0.5 line-clamp-1">{art.summary}</div>
                          </div>
                          <Badge>{art.priority}</Badge>
                        </div>
                        <div className="mt-2 text-[10px] text-brand-teal">Visual • {art.category}</div>
                      </Link>
                    );
                  })}
                </div>

                <h3 className="text-h3 font-medium text-ink mt-lg mb-lg">Legacy Articles</h3>
                <div className="grid gap-sm">
                  {Object.keys(HELP_ARTICLES).map((id) => {
                    const art = HELP_ARTICLES[id];
                    return (
                      <Link key={id} to={`${routeBase}/${id}`} className="block rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg hover:bg-surface-hover transition duration-fast">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-ink">{art.title}</div>
                            {art.subtitle && <div className="text-xs text-muted mt-0.5">{art.subtitle}</div>}
                          </div>
                          <Badge>{id}</Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Help search">
          <label className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset px-md text-muted shadow-rest">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search help topics</span>
            <input className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none" placeholder="Search help..." type="search" />
          </label>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <HelpCircle aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Direct Support
            </h3>
            <p className="text-sm text-secondary">Cannot find the right guideline? Use Brad or submit a feature request.</p>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
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
                  className="rounded-lg border border-hairline bg-surface-glass p-md text-left shadow-glass-inset transition duration-fast hover:bg-surface-hover"
                >
                  <span className="block text-sm font-medium text-ink">{card.title}</span>
                  <span className="mt-1 block text-xs text-muted">{card.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
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

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest overflow-hidden">
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
