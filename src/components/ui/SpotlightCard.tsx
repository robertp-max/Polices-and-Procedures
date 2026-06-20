import { type HTMLAttributes, type ReactNode, useRef } from 'react';

// Direct import of BorderGlow (Primitives Lead / Spotlight + BorderGlow); barrel re-export from policy/components/ui can be added later per plan. No overlap with token composers.
import BorderGlow from '../../policy/components/ui/BorderGlow';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  spotlightColor?: string;
  /** Variant: 'simple-radial' keeps the legacy center-following radial glow (default). 'border-glow' delegates full-edge conic/angle/edge-proximity to BorderGlow (from Agent 10 work, addresses visual gaps vs simple radial in drift reports). */
  variant?: 'border-glow' | 'simple-radial';
  // Pass-through props for BorderGlow variant (ignored for simple-radial; full support for edge glow config)
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  fillOpacity?: number;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(0, 121, 112, 0.15)',
  variant = 'simple-radial',
  // BorderGlow pass-throughs (PHASE 0; keep existing simple radial default)
  edgeSensitivity,
  glowColor,
  backgroundColor,
  borderRadius,
  glowRadius,
  glowIntensity,
  coneSpread,
  animated,
  colors,
  fillOpacity,
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // border-glow variant: full edge (not simple radial) per ownership map + reports on visual gaps / drifts (Agent 14/15/1-8)
  if (variant === 'border-glow') {
    return (
      <BorderGlow
        className={className}
        backgroundColor={backgroundColor ?? '#F7FEFF'}
        glowColor={glowColor ?? '181 72 58'}
        glowIntensity={glowIntensity ?? 0.85}
        edgeSensitivity={edgeSensitivity}
        borderRadius={borderRadius}
        glowRadius={glowRadius}
        coneSpread={coneSpread}
        animated={animated}
        colors={colors}
        fillOpacity={fillOpacity}
        {...rest}
      >
        <div className="relative z-20 flex h-full w-full flex-col">
          {children}
        </div>
      </BorderGlow>
    );
  }

  const applySpotlightColor = () => {
    ref.current?.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      {...rest}
      ref={ref}
      className={`card-spotlight ${className ?? ''}`}
      onMouseEnter={(event) => {
        applySpotlightColor();
        rest.onMouseEnter?.(event);
      }}
      onMouseMove={(event) => {
        const node = ref.current;
        if (!node) return;
        applySpotlightColor();
        const rect = node.getBoundingClientRect();
        node.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        node.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        rest.onMouseMove?.(event);
      }}
    >
      <div className="spotlight-outer-glow" aria-hidden="true" />
      <div className="spotlight-glow-wrapper" aria-hidden="true">
        <div className="spotlight-inner-glow" />
      </div>
      <div className="relative z-20 flex h-full w-full flex-col">
        {children}
      </div>
    </div>
  );
}
