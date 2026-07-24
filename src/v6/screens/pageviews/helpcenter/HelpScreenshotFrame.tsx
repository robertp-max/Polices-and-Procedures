import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import type { HelpImageRef } from '@/policy/helpCenter/types';
import { getHelpImage } from '@/policy/helpCenter/data/helpImages';

/**
 * Renders a registered help screenshot, or a designed placeholder when the
 * asset is not yet captured (status 'placeholder') or fails to load.
 * Articles must never show broken images.
 */
export function HelpScreenshotFrame({ image, compact = false }: { image: HelpImageRef; compact?: boolean }) {
  const asset = getHelpImage(image.imageId);
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !asset || asset.status === 'placeholder' || failed;

  return (
    <figure className="overflow-hidden rounded-[16px] border border-[#E5E4E3] bg-white">
      {showPlaceholder ? (
        <div
          role="img"
          aria-label={image.alt}
          className={`flex w-full flex-col items-center justify-center gap-3 bg-[#F7FEFF] ${compact ? 'min-h-[120px] p-6' : 'min-h-[220px] p-10'}`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#E5FEFF] text-[#007970]">
            <ImageIcon className="h-6 w-6" aria-hidden />
          </span>
          <span className="max-w-md text-center font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">
            Screenshot coming soon
          </span>
          <span className="max-w-md text-center text-xs leading-relaxed text-[#3D3D3A]">{image.alt}</span>
          {asset ? (
            <span className="font-mono text-[10px] text-[#474742]">{asset.captureRoute}</span>
          ) : null}
        </div>
      ) : (
        <img src={asset.src} alt={image.alt} loading="lazy" className="w-full" onError={() => setFailed(true)} />
      )}
      {image.caption ? (
        <figcaption className="border-t border-[#E5E4E3] bg-white px-4 py-2 text-xs text-[#3D3D3A]">{image.caption}</figcaption>
      ) : null}
    </figure>
  );
}
