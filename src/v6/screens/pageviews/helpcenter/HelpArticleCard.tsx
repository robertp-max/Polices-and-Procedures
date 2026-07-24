import { ArrowRight, Clock, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { HelpCenterArticle } from '@/policy/helpCenter/types';
import { getCategory } from '@/policy/helpCenter/data/helpCategories';
import { HELP_BADGES } from '@/policy/helpCenter/data/helpBadges';
import { HelpBadgeRow } from './HelpBadge';
import { HelpScreenshotFrame } from './HelpScreenshotFrame';

function heroImage(article: HelpCenterArticle) {
  const hero = article.blocks.find((b) => b.type === 'hero');
  return hero && hero.type === 'hero' ? hero.image : null;
}

/**
 * Article preview card: optional screenshot/placeholder, badges,
 * audience + estimated time, and quick-start hint.
 */
export function HelpArticleCard({ article, showImage = false }: { article: HelpCenterArticle; showImage?: boolean }) {
  const image = showImage ? heroImage(article) : null;
  const audienceLabels = article.audience.map((a) => HELP_BADGES[a]?.label ?? a).join(' · ');
  const coverage = [article.routes[0], article.components[0]].filter(Boolean).join(' · ');
  return (
    <Link
      to={`/help/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-[24px] border border-[#E5E4E3] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
    >
      {image ? (
        <div className="border-b border-[#E5E4E3]">
          <HelpScreenshotFrame image={image} compact />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <span className="mb-3 block"><HelpBadgeRow badges={article.badges} size="sm" max={4} /></span>
        <span className="font-montserrat text-base font-bold text-[#007970] transition-colors group-hover:text-[#C2410C]">
          {article.title}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-[#3D3D3A]">{article.purpose}</span>
        {article.quickStart.length > 0 ? (
          <span className="mt-3 block truncate text-xs text-[#474742]">Quick start: {article.quickStart[0]}</span>
        ) : null}
        {coverage ? (
          <span className="mt-3 flex items-center gap-1.5 truncate font-mono text-xs text-[#3D3D3A]">
            <Route className="h-3.5 w-3.5 shrink-0 text-[#007970]" aria-hidden /> {coverage}
          </span>
        ) : null}
        <span className="mt-auto flex items-center justify-between pt-4">
          <span className="flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {article.estimatedTime} · {audienceLabels}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#C2410C] transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
        <span className="sr-only">{getCategory(article.category)?.title}</span>
      </div>
    </Link>
  );
}
