import { forwardRef, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HELP_CENTER_ARTICLES } from '@/policy/helpCenter/data/helpArticles';
import { searchHelpArticles } from '@/policy/helpCenter/utils/search';
import { getCategory } from '@/policy/helpCenter/data/helpCategories';
import { HelpBadgeRow } from './HelpBadge';

/**
 * Live article search: matches title, body content, badges, routes, and
 * components. Results render inline under the input.
 */
export const HelpSearch = forwardRef<HTMLInputElement, { onNavigate?: () => void }>(function HelpSearch({ onNavigate }, ref) {
  const [query, setQuery] = useState('');
  const hits = useMemo(() => (query.trim().length >= 2 ? searchHelpArticles(HELP_CENTER_ARTICLES, query).slice(0, 8) : []), [query]);

  return (
    <div>
      <label className="flex items-center gap-3 rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 transition-colors focus-within:border-[#007970]">
        <Search className="h-4 w-4 shrink-0 text-[#F06923]" aria-hidden />
        <span className="sr-only">Search help articles by title, badge, route, or component</span>
        <input
          ref={ref}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles…"
          className="min-w-0 flex-1 bg-transparent font-roboto text-sm text-[#52404B] placeholder:text-[#A0A0A0] focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery('')}
            className="rounded-[8px] text-[#A0A0A0] hover:text-[#52404B] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </label>

      {query.trim().length >= 2 ? (
        <div className="mt-3 space-y-2" role="listbox" aria-label="Search results">
          {hits.length === 0 ? (
            <p className="rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-3 text-sm text-[#747470]">
              No articles match “{query}”. Try a badge name, route, or ask Brad.
            </p>
          ) : (
            hits.map((hit) => (
              <Link
                key={hit.article.articleId}
                to={`/help/${hit.article.slug}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-3 rounded-[12px] border border-[#E5E4E3] bg-white px-4 py-3 transition-colors hover:border-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#52404B] group-hover:text-[#007970]">{hit.article.title}</span>
                  <span className="mt-0.5 block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    {getCategory(hit.article.category)?.title ?? hit.article.category} · matched {hit.matchedOn.join(', ')}
                  </span>
                  <span className="mt-1.5 block"><HelpBadgeRow badges={hit.article.badges} size="sm" max={4} /></span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#F06923] transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
});
