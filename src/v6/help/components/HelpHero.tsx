

export function HelpHero({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border shadow-sm">
      <img src={src} alt={alt} className="w-full" />
      {caption && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">{caption}</div>}
    </div>
  );
}
