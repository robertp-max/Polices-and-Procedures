

export function HelpStepCard({ title, body, image, warning }: {
  title: string;
  body: string;
  image?: { src: string; alt: string };
  warning?: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded border border-slate-200 bg-white/70">
      <div className="flex-1">
        <div className="font-medium text-ink">{title}</div>
        <p className="text-sm text-secondary mt-1">{body}</p>
        {image && <img src={image.src} alt={image.alt} className="mt-2 rounded max-h-40 object-contain" />}
        {warning && <div className="text-xs mt-1 text-orange-700">{warning}</div>}
      </div>
    </div>
  );
}
