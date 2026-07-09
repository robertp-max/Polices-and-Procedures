import type {
  HelpAudienceBadgeId,
  HelpBadgeId,
  HelpCenterArticle,
  HelpCenterCategoryId,
  HelpArticleStatus,
} from '../types';

export interface HelpArticleFilter {
  badges?: HelpBadgeId[];
  category?: HelpCenterCategoryId;
  audience?: HelpAudienceBadgeId;
  status?: HelpArticleStatus;
}

/** Articles matching every provided facet. Badge facet uses OR within the facet, AND across facets. */
export function filterHelpArticles(articles: HelpCenterArticle[], filter: HelpArticleFilter): HelpCenterArticle[] {
  return articles.filter((article) => {
    if (filter.status && article.status !== filter.status) return false;
    if (!filter.status && article.status !== 'active') return false;
    if (filter.category && article.category !== filter.category) return false;
    if (filter.audience && !article.audience.includes(filter.audience)) return false;
    if (filter.badges && filter.badges.length > 0) {
      const set = new Set(article.badges);
      if (!filter.badges.some((b) => set.has(b))) return false;
    }
    return true;
  });
}

export function activeArticles(articles: HelpCenterArticle[]): HelpCenterArticle[] {
  return articles.filter((a) => a.status === 'active');
}

export function articlesForCategory(articles: HelpCenterArticle[], category: HelpCenterCategoryId): HelpCenterArticle[] {
  return activeArticles(articles).filter((a) => a.category === category);
}

export function recentlyUpdated(articles: HelpCenterArticle[], limit = 5): HelpCenterArticle[] {
  return [...activeArticles(articles)]
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}
