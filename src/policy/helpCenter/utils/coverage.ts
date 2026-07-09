import type { HelpCenterArticle, HelpCenterCategory, SyllabusModule } from '../types';

export interface CategoryCoverage {
  categoryId: string;
  articleCount: number;
  hasOverview: boolean;
  syllabusLessonCount: number;
}

export interface CoverageIssue {
  kind:
    | 'category-without-articles'
    | 'article-without-badges'
    | 'article-without-category'
    | 'admin-in-office-syllabus'
    | 'non-admin-category-without-syllabus'
    | 'duplicate-slug'
    | 'broken-related-article';
  subject: string;
  detail: string;
}

/**
 * Static coverage validation used by the coverage report and vitest suite.
 * Every rule mirrors a Phase 12 acceptance check.
 */
export function computeCoverage(
  categories: HelpCenterCategory[],
  articles: HelpCenterArticle[],
  syllabus: SyllabusModule[],
): { perCategory: CategoryCoverage[]; issues: CoverageIssue[] } {
  const issues: CoverageIssue[] = [];
  const active = articles.filter((a) => a.status === 'active');
  const categoryIds = new Set(categories.map((c) => c.categoryId));
  const articleIds = new Set(articles.map((a) => a.articleId));

  const slugSeen = new Map<string, string>();
  for (const article of active) {
    if (!categoryIds.has(article.category)) {
      issues.push({ kind: 'article-without-category', subject: article.articleId, detail: `Unknown category ${article.category}` });
    }
    if (article.badges.length < 2) {
      issues.push({ kind: 'article-without-badges', subject: article.articleId, detail: `Only ${article.badges.length} badge(s); minimum is 2` });
    }
    const prev = slugSeen.get(article.slug);
    if (prev) {
      issues.push({ kind: 'duplicate-slug', subject: article.slug, detail: `Used by ${prev} and ${article.articleId}` });
    }
    slugSeen.set(article.slug, article.articleId);
    for (const rel of article.relatedArticles ?? []) {
      if (!articleIds.has(rel)) {
        issues.push({ kind: 'broken-related-article', subject: article.articleId, detail: `relatedArticles references missing ${rel}` });
      }
    }
  }

  const lessons = syllabus.flatMap((m) => m.lessons);
  const lessonArticleRefs = new Set(lessons.flatMap((l) => l.relatedArticleIds));

  const perCategory: CategoryCoverage[] = categories.map((category) => {
    const catArticles = active.filter((a) => a.category === category.categoryId);
    const syllabusLessonCount = lessons.filter((l) =>
      l.relatedArticleIds.some((id) => catArticles.some((a) => a.articleId === id)),
    ).length;
    if (catArticles.length === 0) {
      issues.push({ kind: 'category-without-articles', subject: category.categoryId, detail: 'No active articles' });
    }
    if (!category.adminOnly && syllabusLessonCount === 0) {
      issues.push({
        kind: 'non-admin-category-without-syllabus',
        subject: category.categoryId,
        detail: 'Non-admin category has no office-staff syllabus lesson referencing its articles',
      });
    }
    return {
      categoryId: category.categoryId,
      articleCount: catArticles.length,
      hasOverview: catArticles.some((a) => a.articleId.endsWith('-OVERVIEW')),
      syllabusLessonCount,
    };
  });

  // Admin-only material must not enter the office-staff path.
  for (const lesson of lessons) {
    if (lesson.adminExcluded) continue;
    for (const articleId of lesson.relatedArticleIds) {
      const article = articles.find((a) => a.articleId === articleId);
      if (article && article.audience.length === 1 && article.audience[0] === 'admin') {
        issues.push({
          kind: 'admin-in-office-syllabus',
          subject: lesson.lessonId,
          detail: `Lesson references admin-only article ${articleId}`,
        });
      }
    }
  }

  void lessonArticleRefs;
  return { perCategory, issues };
}
