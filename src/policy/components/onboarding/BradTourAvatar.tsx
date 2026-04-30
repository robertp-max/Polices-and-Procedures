import { memo, useEffect } from 'react';
import bradImage from '@/assets/brad-tour.png';
import bradHeroImage from '@/assets/brad-tour-hero.png';

function useMountLog(label: string) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`[${label}] MOUNT`);
    return () => {
      // eslint-disable-next-line no-console
      console.log(`[${label}] UNMOUNT`);
    };
  }, [label]);
}

/**
 * Memoized Brad portrait. Stable identity prevents re-render / re-decode
 * when the parent overlay advances cards.
 *
 * Two variants:
 *   - "circle" (default): round avatar used inline next to copy on
 *     standard tour cards.
 *   - "hero": larger, rectangular, head-to-hips framing using the
 *     BRAD (2) source image. Used for the welcome / introductory cards
 *     and the final hand-off card.
 */
function BradTourAvatarBase({
  size = 168,
  variant = 'circle',
}: {
  size?: number;
  variant?: 'circle' | 'hero';
}) {
  useMountLog(`BradTourAvatar(${variant})`);
  if (variant === 'hero') {
    return (
      <div
        style={{
          width: size,
          height: 'auto',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          flexShrink: 0,
          filter: 'drop-shadow(0 18px 36px rgba(0,0,0,0.45))',
        }}
        aria-hidden="true"
      >
        <img
          src={bradHeroImage}
          alt=""
          decoding="async"
          loading="eager"
          draggable={false}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            background: 'transparent',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.30))',
      }}
      aria-hidden="true"
    >
      <img
        src={bradImage}
        alt=""
        width={size}
        height={size}
        decoding="async"
        loading="eager"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}

export const BradTourAvatar = memo(BradTourAvatarBase);

/** Pre-warm the image cache so the first card never flickers. */
export function preloadBradAvatar(): void {
  try {
    const img1 = new Image();
    img1.decoding = 'async';
    img1.src = bradImage;
    const img2 = new Image();
    img2.decoding = 'async';
    img2.src = bradHeroImage;
  } catch {
    /* noop */
  }
}
