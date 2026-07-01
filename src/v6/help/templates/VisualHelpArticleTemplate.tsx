
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
    <article className="max-w-4xl mx-auto p-6 space-y-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm" data-article-id={article.id}>
      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <img
          src={article.hero.src}
          alt={article.hero.alt}
          className="w-full aspect-video object-cover"
        />
        {article.hero.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
            {article.hero.caption}
          </div>
        )}
        {article.hero.annotation && (
          <div className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] px-2 py-1 rounded font-mono">
            {article.hero.annotation}
          </div>
        )}
      </div>

      {/* One-sentence summary */}
      <p className="text-lg font-medium text-ink">{article.summary}</p>

      {/* Use When */}
      {article.useWhen.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white/60 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-700 mb-2">Use this when</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-secondary">
            {article.useWhen.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Before you start */}
      {article.beforeYouStart && article.beforeYouStart.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-teal-700 mb-2">Before you start</h4>
          <ul className="text-sm space-y-1 list-disc pl-4 text-secondary">
            {article.beforeYouStart.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      {/* Visual Steps */}
      {article.steps.length > 0 && (
        <div>
          <h3 className="text-h3 font-medium mb-4">Steps</h3>
          <div className="space-y-3">
            {article.steps.map((step) => (
              <div key={step.id} className="flex gap-4 rounded-xl border border-slate-200 bg-white/70 p-4">
                <div className="flex-1">
                  <h4 className="font-medium text-ink">{step.title}</h4>
                  <p className="text-sm text-secondary mt-1">{step.body}</p>
                  {step.image && (
                    <div className="mt-3">
                      <img src={step.image.src} alt={step.image.alt} className="rounded border border-slate-200 max-w-full" />
                      {step.image.caption && <p className="text-xs text-muted mt-1">{step.image.caption}</p>}
                    </div>
                  )}
                  {step.actionHref && step.actionLabel && (
                    <a href={step.actionHref} className="inline-block mt-2 text-sm text-teal-700 hover:underline">{step.actionLabel} →</a>
                  )}
                  {step.warning && (
                    <div className="mt-2 text-xs text-orange-700">{step.warning}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {article.commonMistakes && article.commonMistakes.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-amber-50/40 p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-2">Common mistakes to avoid</h4>
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
              <figure key={i} className="border border-slate-200 rounded-xl overflow-hidden bg-white/60">
                <img src={ss.src} alt={ss.alt} className="w-full" />
                <figcaption className="p-2 text-xs text-muted border-t border-slate-200">{ss.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Non-PHI reminder */}
      {article.nonPhiReminder && (
        <div className="text-xs bg-white/60 p-3 rounded-xl border border-slate-200 text-muted">
          No PHI. All examples use synthetic/demo data only.
        </div>
      )}

      {/* Related + Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200">
        {article.relatedArticles?.map(slug => (
          <Link key={slug} to={`/help/${slug}`} className="text-xs px-3 py-1 rounded border border-slate-200 hover:bg-white/80">Related: {slug}</Link>
        ))}
        {article.launchTourId && onLaunchTour && (
          <button onClick={() => onLaunchTour(article.launchTourId!)} className="text-xs px-3 py-1 rounded bg-teal-600 text-white">Launch guided tour</button>
        )}
        {article.relatedFeatureRequests && onCreateFeatureRequest && (
          <button onClick={() => onCreateFeatureRequest(article.relatedFeatureRequests![0])} className="text-xs px-3 py-1 rounded border border-slate-200">Suggest improvement</button>
        )}
        {onStartThread && (
          <button onClick={() => onStartThread(article.slug)} className="text-xs px-3 py-1 rounded border border-slate-200">Start discussion thread</button>
        )}
      </div>

      <div className="text-[10px] text-muted text-right">
        Updated {article.lastUpdated} • {article.status.toUpperCase()} • P{article.priority}
      </div>
    </article>
  );
}

export default VisualHelpArticleTemplate;