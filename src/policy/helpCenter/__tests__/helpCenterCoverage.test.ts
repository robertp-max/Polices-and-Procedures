import { describe, expect, it } from 'vitest';
import { HELP_CATEGORIES } from '../data/helpCategories';
import { HELP_CENTER_ARTICLES } from '../data/helpArticles';
import { HELP_BADGES } from '../data/helpBadges';
import { HELP_TOURS } from '../data/helpTours';
import { HELP_IMAGES } from '../data/helpImages';
import { OFFICE_STAFF_SYLLABUS } from '../data/officeStaffSyllabus';
import { RETIRED_ARTICLES } from '../data/retiredArticles';
import { computeCoverage } from '../utils/coverage';
import { filterHelpArticles } from '../utils/filters';
import { searchHelpArticles } from '../utils/search';

const active = HELP_CENTER_ARTICLES.filter((a) => a.status === 'active');

describe('Help Center coverage', () => {
  it('has 19 categories including Nolan', () => {
    expect(HELP_CATEGORIES).toHaveLength(19);
    expect(HELP_CATEGORIES.some((c) => c.categoryId === 'nolan-learner')).toBe(true);
  });

  it('every category has at least one active article', () => {
    for (const category of HELP_CATEGORIES) {
      const count = active.filter((a) => a.category === category.categoryId).length;
      expect(count, `category ${category.categoryId}`).toBeGreaterThan(0);
    }
  });

  it('every category has an overview article', () => {
    for (const category of HELP_CATEGORIES) {
      const hasOverview = active.some((a) => a.category === category.categoryId && a.articleId.endsWith('-OVERVIEW'));
      expect(hasOverview, `category ${category.categoryId}`).toBe(true);
    }
  });

  it('every active article has a known category, >=2 badges, and a valid unique slug', () => {
    const slugs = new Set<string>();
    const categoryIds = new Set(HELP_CATEGORIES.map((c) => c.categoryId));
    for (const article of active) {
      expect(categoryIds.has(article.category), `${article.articleId} category`).toBe(true);
      expect(article.badges.length, `${article.articleId} badges`).toBeGreaterThanOrEqual(2);
      for (const badge of article.badges) {
        expect(HELP_BADGES[badge], `${article.articleId} badge ${badge}`).toBeDefined();
      }
      expect(article.slug, `${article.articleId} slug`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(slugs.has(article.slug), `${article.articleId} duplicate slug`).toBe(false);
      slugs.add(article.slug);
    }
  });

  it('computeCoverage reports no issues', () => {
    const { issues } = computeCoverage(HELP_CATEGORIES, HELP_CENTER_ARTICLES, OFFICE_STAFF_SYLLABUS);
    expect(issues).toEqual([]);
  });

  it('retired articles never appear in the active dataset', () => {
    const retiredIds = new Set(RETIRED_ARTICLES.map((r) => r.oldArticleId));
    for (const article of active) {
      expect(retiredIds.has(article.articleId), article.articleId).toBe(false);
    }
  });
});

describe('Office staff syllabus', () => {
  const lessons = OFFICE_STAFF_SYLLABUS.flatMap((m) => m.lessons);
  const articleById = new Map(HELP_CENTER_ARTICLES.map((a) => [a.articleId, a]));

  it('has exactly 20 modules in order', () => {
    expect(OFFICE_STAFF_SYLLABUS).toHaveLength(20);
    expect(OFFICE_STAFF_SYLLABUS.map((m) => m.order)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('every lesson has badges, a knowledge check, and valid article refs', () => {
    for (const lesson of lessons) {
      expect(lesson.badges.length, lesson.lessonId).toBeGreaterThanOrEqual(2);
      expect(lesson.knowledgeCheck.question.length, lesson.lessonId).toBeGreaterThan(0);
      expect(lesson.knowledgeCheck.answer.length, lesson.lessonId).toBeGreaterThan(0);
      for (const id of lesson.relatedArticleIds) {
        expect(articleById.has(id), `${lesson.lessonId} -> ${id}`).toBe(true);
      }
      for (const target of lesson.screenshotTargets) {
        expect(HELP_IMAGES[target], `${lesson.lessonId} -> ${target}`).toBeDefined();
      }
    }
  });

  it('never references admin-only articles or admin routes', () => {
    for (const lesson of lessons) {
      expect(lesson.route ?? '', lesson.lessonId).not.toMatch(/^\/(admin|brad\/builder|onboarding-v2|governance|policy-lifecycle|policy-approvals|surveyor)/);
      for (const id of lesson.relatedArticleIds) {
        const article = articleById.get(id)!;
        const adminOnly = article.audience.length === 1 && article.audience[0] === 'admin';
        expect(adminOnly, `${lesson.lessonId} references admin-only ${id}`).toBe(false);
      }
    }
  });
});

describe('Search and filters', () => {
  it('finds articles by title', () => {
    const hits = searchHelpArticles(HELP_CENTER_ARTICLES, 'upload evidence');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].article.articleId).toBe('HC-EVID-UPLOAD');
  });

  it('finds articles by badge', () => {
    const hits = searchHelpArticles(HELP_CENTER_ARTICLES, 'troubleshooting');
    expect(hits.some((h) => h.matchedOn.includes('badge'))).toBe(true);
  });

  it('finds articles by route and component', () => {
    const byRoute = searchHelpArticles(HELP_CENTER_ARTICLES, '/ces/board');
    expect(byRoute.some((h) => h.article.articleId === 'HC-CES-BOARD')).toBe(true);
    const byComponent = searchHelpArticles(HELP_CENTER_ARTICLES, 'BradWorkspace');
    expect(byComponent.some((h) => h.article.category === 'brad-ai')).toBe(true);
  });

  it('badge filters work with AND-across-facets, OR-within', () => {
    const filtered = filterHelpArticles(HELP_CENTER_ARTICLES, { badges: ['print'], category: 'forms' });
    expect(filtered.some((a) => a.articleId === 'HC-FORMS-PRINT')).toBe(true);
    expect(filtered.every((a) => a.category === 'forms')).toBe(true);
  });
});

describe('Safety and content rules', () => {
  const corpus = JSON.stringify({ HELP_CENTER_ARTICLES, OFFICE_STAFF_SYLLABUS });

  function windowsAround(pattern: RegExp): string[] {
    const out: string[] = [];
    for (const m of corpus.matchAll(pattern)) {
      out.push(corpus.slice(Math.max(0, m.index! - 140), m.index! + m[0].length + 180));
    }
    return out;
  }

  it('never claims survey-readiness positively', () => {
    // "survey-ready" may appear ONLY inside guidance telling users never to claim it.
    for (const w of windowsAround(/survey[- ]ready/gi)) {
      // Acceptable contexts: explicit negation, or a commonMistakes warning entry.
      expect(/never|not a|is not|don't|do not|does not|avoid|no direct|"mistake":/i.test(w), `positive survey-ready claim near: ${w}`).toBe(true);
    }
  });

  it('contains no real-looking PHI sample data', () => {
    expect(corpus).not.toMatch(/\bDOB[: ]\d/i);
    expect(corpus).not.toMatch(/\b\d{3}-\d{2}-\d{4}\b/); // SSN-like
    // MRN mentions must be clearly demo values or no-PHI guidance
    for (const w of windowsAround(/MRN/g)) {
      expect(/demo|000|sample|never|no patient|not include|don't|do not|no phi|no-phi/i.test(w), `suspicious MRN mention: ${w}`).toBe(true);
    }
  });

  it('every tour maps to a registered domain and article', () => {
    for (const tour of HELP_TOURS) {
      expect(['event_packet', 'help_thread', 'community']).toContain(tour.domain);
      if (tour.articleId) {
        expect(HELP_CENTER_ARTICLES.some((a) => a.articleId === tour.articleId), tour.tourId).toBe(true);
      }
    }
  });

  it('every image has alt text and a capture route', () => {
    for (const image of Object.values(HELP_IMAGES)) {
      expect(image.alt.length, image.imageId).toBeGreaterThan(10);
      expect(image.captureRoute.startsWith('/'), image.imageId).toBe(true);
    }
  });
});
