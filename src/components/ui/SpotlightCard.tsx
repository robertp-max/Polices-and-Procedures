import { type HTMLAttributes, type ReactNode, useRef } from 'react';

export interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(0, 121, 112, 0.15)',
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

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
