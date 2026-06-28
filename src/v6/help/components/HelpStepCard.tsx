

export function HelpStepCard({ number, title, body, image, warning }: {
  number: number;
  title: string;
  body: string;
  image?: { src: string; alt: string };
  warning?: string;
}) {
  return (
    <div className="flex gap-4 p-4 rounded border bg-surface-glass">
      <div className="w-6 h-6 rounded-full bg-brand-teal text-on-brand text-xs flex items-center justify-center shrink-0">{number}</div>
      <div>
        <div className="font-medium">{title}</div>
        <p className="text-sm text-secondary mt-1">{body}</p>
        {image && <img src={image.src} alt={image.alt} className="mt-2 rounded max-h-40 object-contain" />}
        {warning && <div className="text-xs mt-1 text-brand-orange">{warning}</div>}
      </div>
    </div>
  );
}
