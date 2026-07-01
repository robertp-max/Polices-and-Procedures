import type { HelpScreenshot } from '../types/helpArticle';

export function AnnotatedScreenshot({ screenshot }: { screenshot: HelpScreenshot }) {
  return (
    <figure className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="relative">
        <img src={screenshot.src} alt={screenshot.alt} className="w-full" />
        {screenshot.annotations?.map((ann, i) => (
          <div key={i} className="absolute text-xs bg-orange-600 text-white px-1 rounded" style={{ left: `${ann.x}%`, top: `${ann.y}%` }}>{ann.label}</div>
        ))}
      </div>
      <figcaption className="text-xs p-2 text-muted border-t border-slate-200">{screenshot.caption}</figcaption>
    </figure>
  );
}
