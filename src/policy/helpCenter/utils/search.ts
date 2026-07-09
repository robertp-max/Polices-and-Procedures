import type { HelpBadgeId, HelpCenterArticle } from '../types';
import { HELP_BADGES } from '../data/helpBadges';

export interface HelpSearchHit {
  article: HelpCenterArticle;
  score: number;
  /** Which fields matched, for result annotation. */
  matchedOn: Array<'title' | 'content' | 'badge' | 'route' | 'component' | 'category'>;
}

function blockText(article: HelpCenterArticle): string {
  const parts: string[] = [article.purpose, ...article.whenToUse, ...article.quickStart];
  for (const block of article.blocks) {
    switch (block.type) {
      case 'summary':
        parts.push(block.body);
        break;
      case 'stepList':
        block.steps.forEach((s) => parts.push(s.title, s.body));
        break;
      case 'callout':
      case 'warning':
        parts.push(block.title, block.body);
        break;
      case 'checklist':
        block.items.forEach((i) => parts.push(i.label, i.detail ?? ''));
        break;
      case 'troubleshootingFlow':
        block.cases.forEach((c) => parts.push(c.symptom, c.cause, c.fix));
        break;
      case 'faq':
        block.items.forEach((f) => parts.push(f.question, f.answer));
        break;
      case 'glossary':
        block.terms.forEach((t) => parts.push(t.term, t.definition));
        break;
      case 'roleNote':
        parts.push(block.body);
        break;
      default:
        break;
    }
  }
  return parts.join(' ').toLowerCase();
}

/**
 * Search active articles by title, body content, badge label, component, or route.
 * Query is tokenized; every token must match at least one field (AND semantics).
 */
export function searchHelpArticles(articles: HelpCenterArticle[], query: string): HelpSearchHit[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const hits: HelpSearchHit[] = [];
  for (const article of articles) {
    if (article.status !== 'active') continue;
    const title = article.title.toLowerCase();
    const subtitle = (article.subtitle ?? '').toLowerCase();
    const content = blockText(article);
    const badgeLabels = article.badges.map((b) => HELP_BADGES[b as HelpBadgeId]?.label.toLowerCase() ?? b);
    const routes = article.routes.map((r) => r.toLowerCase());
    const components = article.components.map((c) => c.toLowerCase());

    let score = 0;
    const matchedOn = new Set<HelpSearchHit['matchedOn'][number]>();
    let allTokensMatch = true;

    for (const token of tokens) {
      let tokenMatched = false;
      if (title.includes(token) || subtitle.includes(token)) {
        score += title.startsWith(token) ? 12 : 8;
        matchedOn.add('title');
        tokenMatched = true;
      }
      if (badgeLabels.some((b) => b.includes(token)) || article.badges.some((b) => b.includes(token))) {
        score += 5;
        matchedOn.add('badge');
        tokenMatched = true;
      }
      if (routes.some((r) => r.includes(token))) {
        score += 5;
        matchedOn.add('route');
        tokenMatched = true;
      }
      if (components.some((c) => c.includes(token))) {
        score += 5;
        matchedOn.add('component');
        tokenMatched = true;
      }
      if (article.category.includes(token)) {
        score += 3;
        matchedOn.add('category');
        tokenMatched = true;
      }
      if (content.includes(token)) {
        score += 2;
        matchedOn.add('content');
        tokenMatched = true;
      }
      if (!tokenMatched) {
        allTokensMatch = false;
        break;
      }
    }

    if (allTokensMatch && score > 0) {
      hits.push({ article, score, matchedOn: [...matchedOn] });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}
