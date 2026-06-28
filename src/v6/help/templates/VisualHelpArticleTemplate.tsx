
import { Link } from 'react-router-dom';
import type { VisualHelpArticle } from '../types/helpArticle';

interface VisualHelpArticleTemplateProps {
  article: VisualHelpArticle;
  onLaunchTour?: (tourId: string) => void;
  onStartThread?: (slug: string) => void;
  onCreateFeatureRequest?: (category: string) => void;
}

export function VisualHelpArticleTemplate({
  article,
  onLaunchTour,
  onStartThread,
  onCreateFeatureRequest,
}: VisualHelpArticleTemplateProps) {
  return (
    <article className="max-w-4xl mx-auto p-6 space-y-8 bg-surface-glass backdrop-blur-md rounded-xl border border-card shadow-rest" data-article-id={article.id}>
      {/* Hero */}
      <div className="relative rounded-lg overflow-hidden border border-hairline shadow-sm">
        <img
          src={article.hero.src}
          alt={article.hero.alt}
          className="w-full aspect-video object-cover"
        />
        {article.hero.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-ink/70 text-on-brand text-xs p-2 text-center">
            {article.hero.caption}
          </div>
        )}
        {article.hero.annotation && (
          <div className="absolute top-3 right-3 bg-brand-orange text-on-brand text-[10px] px-2 py-1 rounded font-mono">
            {article.hero.annotation}
          </div>
        )}
      </div>

      {/* One-sentence summary */}
      <p className="text-lg font-medium text-ink">{article.summary}</p>

      {/* Use When */}
      {article.useWhen.length > 0 && (
        <div className="rounded-lg border border-hairline bg-surface p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-teal mb-2">Use this when</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-secondary">
            {article.useWhen.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Before you start */}
      {article.beforeYouStart && article.beforeYouStart.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-teal mb-2">Before you start</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-secondary">
            {article.beforeYouStart.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {/* Visual Steps */}
      {article.steps.length > 0 && (
        <div>
          <h3 className="text-h3 font-medium mb-4">Steps</h3>
          <div className="space-y-4">
            {article.steps.map((step, idx) => (
              <div key={step.id} className="flex gap-4 rounded-lg border border-hairline bg-surface-glass p-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-brand-teal text-on-brand flex items-center justify-center text-sm font-mono">
                  {step.number ?? idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-ink">{step.title}</h4>
                  <p className="text-sm text-secondary mt-1">{step.body}</p>
                  {step.image && (
                    <div className="mt-3">
                      <img src={step.image.src} alt={step.image.alt} className="rounded border max-w-full" />
                      {step.image.caption && <p className="text-xs text-muted mt-1">{step.image.caption}</p>}
                    </div>
                  )}
                  {step.actionHref && step.actionLabel && (
                    <a href={step.actionHref} className="inline-block mt-2 text-sm text-brand-teal hover:underline">{step.actionLabel} →</a>
                  )}
                  {step.warning && (
                    <div className="mt-2 text-xs bg-tone-orange-bg/30 border-l-2 border-brand-orange pl-2 text-secondary">{step.warning}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {article.commonMistakes && article.commonMistakes.length > 0 && (
        <div className="rounded-lg border border-tone-orange-border bg-tone-orange-bg/10 p-4">
          <h4 className="text-sm font-semibold text-brand-orange mb-2">Common mistakes to avoid</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-secondary">
            {article.commonMistakes.map((m, i) => <li key={i}>{m.mistake} — {m.fix}</li>)}
          </ul>
        </div>
      )}

      {/* Screenshots / Illustrations */}
      {article.screenshots.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-3">Annotated visuals</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {article.screenshots.map((ss, i) => (
              <figure key={i} className="border rounded-lg overflow-hidden bg-surface-glass">
                <img src={ss.src} alt={ss.alt} className="w-full" />
                <figcaption className="p-2 text-xs text-muted border-t">{ss.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Non-PHI reminder */}
      {article.nonPhiReminder && (
        <div className="text-xs bg-surface-glass p-3 rounded border border-hairline text-muted">
          No PHI. All examples use synthetic/demo data only.
        </div>
      )}

      {/* Related + Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {article.relatedArticles?.map(slug => (
          <Link key={slug} to={`/help/${slug}`} className="text-xs px-3 py-1 rounded border hover:bg-surface">Related: {slug}</Link>
        ))}
        {article.launchTourId && onLaunchTour && (
          <button onClick={() => onLaunchTour(article.launchTourId!)} className="text-xs px-3 py-1 rounded bg-brand-teal text-on-brand">Launch guided tour</button>
        )}
        {article.relatedFeatureRequests && onCreateFeatureRequest && (
          <button onClick={() => onCreateFeatureRequest(article.relatedFeatureRequests![0])} className="text-xs px-3 py-1 rounded border">Suggest improvement</button>
        )}
        {onStartThread && (
          <button onClick={() => onStartThread(article.slug)} className="text-xs px-3 py-1 rounded border">Start discussion thread</button>
        )}
      </div>

      <div className="text-[10px] text-muted text-right">
        Updated {article.lastUpdated} • {article.status.toUpperCase()} • P{article.priority}
      </div>
    </article>
  );
}

export default VisualHelpArticleTemplate;