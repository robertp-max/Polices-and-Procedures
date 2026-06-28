import type { HelpScreenshot } from '../types/helpArticle';

export function AnnotatedScreenshot({ screenshot }: { screenshot: HelpScreenshot }) {
  return (
    <figure className="border rounded overflow-hidden">
      <div className="relative">
        <img src={screenshot.src} alt={screenshot.alt} className="w-full" />
        {screenshot.annotations?.map((ann, i) => (
          <div key={i} className="absolute text-xs bg-brand-orange text-on-brand px-1 rounded" style={{ left: `${ann.x}%`, top: `${ann.y}%` }}>{ann.label}</div>
        ))}
      </div>
      <figcaption className="text-xs p-2 text-muted">{screenshot.caption}</figcaption>
    </figure>
  );
}
