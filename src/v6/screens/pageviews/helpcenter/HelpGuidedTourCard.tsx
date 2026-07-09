import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HelpGuidedTour } from '@/policy/helpCenter/types';
import { getArticleById } from '@/policy/helpCenter/data/helpArticles';
import { HelpBadgeRow } from './HelpBadge';

export function HelpGuidedTourCard({
  tour,
  onLaunch,
}: {
  tour: HelpGuidedTour;
  onLaunch: (domain: string) => void;
}) {
  const article = tour.articleId ? getArticleById(tour.articleId) : undefined;
  return (
    <article className="flex flex-col rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-[#007970] hover:shadow-md">
      <span className="mb-5 flex items-center justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#FFF2EB] text-[#F06923]">
          <Sparkles className="h-6 w-6" aria-hidden />
        </span>
        <span className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">{tour.estimatedTime}</span>
      </span>
      <h3 className="font-montserrat text-lg font-bold text-[#007970]">{tour.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#747470]">{tour.description}</p>
      <span className="mt-4 block"><HelpBadgeRow badges={tour.badges} size="sm" /></span>
      <span className="mt-auto flex flex-wrap items-center gap-4 pt-6">
        <button
          type="button"
          onClick={() => onLaunch(tour.domain)}
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-5 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_20px_4px_rgba(240,105,35,0.24)] focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden /> Launch tour
        </button>
        {article ? (
          <Link
            to={`/help/${article.slug}`}
            className="inline-flex items-center gap-1.5 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-5 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] transition-colors hover:bg-[#F7FEFF] hover:text-[#004142] focus-visible:outline-none focus-visible:shadow-focus"
          >
            Read the manual <ArrowRight className="h-3.5 w-3.5 text-[#F06923]" aria-hidden />
          </Link>
        ) : null}
      </span>
    </article>
  );
}
