import { AlertTriangle, Clock, Route, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HelpCenterArticle } from '@/policy/helpCenter/types';
import { getArticleById } from '@/policy/helpCenter/data/helpArticles';
import { getCategory } from '@/policy/helpCenter/data/helpCategories';
import { HelpBadgeRow } from './HelpBadge';
import { HelpContentBlockRenderer } from './HelpContentBlockRenderer';

/**
 * Full interactive article view: command-center header, quick-start strip,
 * ordered content blocks, mistakes, safety notes, related articles, and an
 * optional guided-tour launcher.
 */
export function HelpArticleDetail({
  article,
  onLaunchTour,
}: {
  article: HelpCenterArticle;
  onLaunchTour: (domain: string) => void;
}) {
  const navigate = useNavigate();
  const related = (article.relatedArticles ?? [])
    .map((id) => getArticleById(id))
    .filter((a): a is HelpCenterArticle => Boolean(a && a.status === 'active'));

  return (
    <article className="space-y-8">
      {/* Header band */}
      <header className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-12">
        <p className="mb-4 font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#C2410C]">
          {article.template.replace(/-/g, ' ')}
        </p>
        <h1 className="mb-3 font-montserrat text-3xl font-bold leading-tight tracking-tight text-[#007970] md:text-4xl">
          {article.title}
        </h1>
        {article.subtitle ? (
          <p className="mb-5 max-w-3xl font-roboto text-base font-light leading-relaxed text-[#52404B] md:text-lg">{article.subtitle}</p>
        ) : null}
        <div className="mb-5"><HelpBadgeRow badges={article.badges} /></div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" aria-hidden /> {article.estimatedTime}</span>
          <span>Difficulty: {article.difficulty}</span>
          <span>Updated {article.lastUpdated}</span>
          {article.routes.length > 0 ? (
            <span className="inline-flex items-center gap-1.5"><Route className="h-3.5 w-3.5" aria-hidden /> {article.routes.join(' · ')}</span>
          ) : null}
        </div>
        {article.launchTourDomain ? (
          <button
            type="button"
            onClick={() => onLaunchTour(article.launchTourDomain!)}
            className="mt-6 inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-6 py-3 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Sparkles className="h-4 w-4" aria-hidden /> Launch this guided tour
          </button>
        ) : null}
      </header>

      {/* Purpose / when to use */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">Purpose</h2>
          <p className="text-sm leading-relaxed text-[#52404B]">{article.purpose}</p>
          {article.prerequisites && article.prerequisites.length > 0 ? (
            <>
              <h2 className="mb-2 mt-5 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">Before you start</h2>
              <ul className="grid list-disc gap-1.5 pl-4 text-sm leading-relaxed text-[#52404B]">
                {article.prerequisites.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </>
          ) : null}
        </div>
        <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">When to use this</h2>
          <ul className="grid list-disc gap-1.5 pl-4 text-sm leading-relaxed text-[#52404B]">
            {article.whenToUse.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      </section>

      {/* Quick start strip */}
      {article.quickStart.length > 0 ? (
        <section className="rounded-[24px] border border-[#C4F4F5] bg-[#F7FEFF] p-6 shadow-sm md:p-8">
          <h2 className="mb-4 flex items-center gap-2 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">
            <Zap className="h-4 w-4 text-[#C2410C]" aria-hidden /> Quick start
          </h2>
          <ol className="grid gap-2 md:grid-cols-2">
            {article.quickStart.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[#52404B]">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#007970] font-montserrat text-[11px] font-bold text-white">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Body blocks */}
      <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm md:p-10">
        <HelpContentBlockRenderer blocks={article.blocks} />
      </section>

      {/* Mistakes + safety */}
      {(article.commonMistakes?.length || article.safetyNotes?.length) ? (
        <section className="grid gap-6 md:grid-cols-2">
          {article.commonMistakes && article.commonMistakes.length > 0 ? (
            <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#9A6700]">
                <AlertTriangle className="h-4 w-4" aria-hidden /> Common mistakes
              </h2>
              <ul className="space-y-3">
                {article.commonMistakes.map((m, i) => (
                  <li key={i} className="rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] p-4 text-sm leading-relaxed">
                    <p className="font-medium text-[#52404B]">{m.mistake}</p>
                    <p className="mt-1 text-[#008540]">Fix: {m.fix}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {article.safetyNotes && article.safetyNotes.length > 0 ? (
            <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">
                <ShieldCheck className="h-4 w-4" aria-hidden /> Safety & compliance notes
              </h2>
              <ul className="grid list-disc gap-2 pl-4 text-sm leading-relaxed text-[#52404B]">
                {article.safetyNotes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Related articles */}
      {related.length > 0 ? (
        <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-4 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">Related articles</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {related.map((rel) => (
              <button
                key={rel.articleId}
                type="button"
                onClick={() => navigate(`/help/${rel.slug}`)}
                className="rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-3 text-left text-sm font-medium text-[#52404B] transition-colors hover:border-[#007970] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
              >
                {rel.title}
                <span className="mt-0.5 block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
                  {getCategory(rel.category)?.title} · {rel.estimatedTime}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
