import React, { useRef, useCallback, useEffect, type ReactNode, type HTMLAttributes, type CSSProperties } from 'react';
import './BorderGlow.css';

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 40, s: 80, l: 80 };
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
}

function buildGlowVars(glowColor: string, intensity: number) {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10'];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i += 1) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]) {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i += 1) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInCubic(x: number) {
  return x * x * x;
}

interface AnimateOptions {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateOptions) {
  const t0 = performance.now() + delay;
  function tick() {
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) requestAnimationFrame(tick);
    else if (onEnd) onEnd();
  }
  setTimeout(() => requestAnimationFrame(tick), delay);
}

export interface BorderGlowProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
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
  style?: CSSProperties;
  /** Full port support for overlay/drawer/modal variants from prototype; adds border-glow-overlay class for restrained glass per V6 specs. */
  variant?: 'default' | 'modal' | 'drawer' | 'overlay';
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  children,
  className = '',
  edgeSensitivity = 22,
  glowColor = '181 72 58', // #00797D default for light per plan
  backgroundColor, // undefined (transparent) default for restrained glass; only overlay variants or explicit set #F7FEFF shell; inners use direct Metric #F7FEFF pastels + Surface white cards per spec. 
  borderRadius = 16, // radii 8-32 contract; 16px=2xl for cards/tiles per ref (V6); hover-lift + chips/badges + header/metrics/board density; restrained glass ONLY on variants, #F7FEFF base + white cards for content.
  glowRadius = 40,
  glowIntensity = 0.35, // restrained default per spec for BorderGlow (only overlays/drawers higher); Metric/Surface use direct #F7FEFF pastels + white cards + no blur; radii 8-32, hover-lift, chips/badges match ref for brad + headers/metrics/board density
  coneSpread = 22,
  animated = false,
  colors = ['#00797D', '#1FC7C9', '#7AF5ED'],
  fillOpacity = 0,
  style = {},
  variant = 'default',
  onPointerMove: userOnPointerMove,
  ...rest
}) => {
  // BorderGlow variant support (full port from prototype __components__/BorderGlow.jsx for overlays/drawers/modals)
  const isOverlayVariant = variant === 'modal' || variant === 'drawer' || variant === 'overlay';
  const variantClass = isOverlayVariant ? 'border-glow-overlay' : '';
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenterOfElement = useCallback((el: HTMLDivElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2];
  }, []);

  const getEdgeProximity = useCallback((el: HTMLDivElement, x: number, y: number) => {
    // True edge-proximity (distance to nearest perimeter) for exact interactive conic/rim glow match to ref images.
    // Produces stronger ramp near any border (sides + corners) vs center-follow radial.
    const rect = el.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const minDistX = Math.min(x, Math.max(0, w - x));
    const minDistY = Math.min(y, Math.max(0, h - y));
    const minDist = Math.min(minDistX, minDistY);
    const maxSafe = Math.min(w / 2, h / 2);
    let prox = maxSafe > 0 ? 1 - (minDist / maxSafe) : 0;
    // Subtle ease to keep intensity high closer to edge for "conic feel" on premium interactive (critical/banners)
    prox = Math.pow(Math.min(Math.max(prox, 0), 1), 0.82);
    return Math.min(Math.max(prox, 0), 1);
  }, []);

  const getCursorAngle = useCallback((el: HTMLDivElement, x: number, y: number) => {
    const [cx, cy] = getCenterOfElement(el);
    const dx = x - cx;
    const dy = y - cy;
    if (dx === 0 && dy === 0) return 0;
    const radians = Math.atan2(dy, dx);
    let degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }, [getCenterOfElement]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const edge = getEdgeProximity(card, x, y);
    const angle = getCursorAngle(card, x, y);

    card.style.setProperty('--edge-proximity', `${(edge * 100).toFixed(3)}`);
    card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    // 7-stack interactive opacity (full fidelity: edge proximity drives radial stack reveal along with conic/angle)
    // Higher stack reveal ramp for more visible luminous interior conic-proximity glow near edges (ref match)
    const stackOp = Math.max(0, (edge * 100 - 12) / 88 * 0.35);
    card.style.setProperty('--stack-opacity', stackOp.toFixed(3));

    // Compose user-provided onPointerMove (full port robustness; prevent rest override drift from prototype)
    if (userOnPointerMove) {
      userOnPointerMove(e);
    }
  }, [getEdgeProximity, getCursorAngle, userOnPointerMove]);

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add('sweep-active');
    card.style.setProperty('--cursor-angle', `${angleStart}deg`);

    animateValue({ duration: 500, onUpdate: v => {
      card.style.setProperty('--edge-proximity', String(v));
      const s = Math.max(0, (v - 12) / 88 * 0.35);
      card.style.setProperty('--stack-opacity', s.toFixed(3));
    } });
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      },
    });
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: v => {
        card.style.setProperty('--cursor-angle', `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`);
      },
    });
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: v => {
        card.style.setProperty('--edge-proximity', String(v));
        const s = Math.max(0, (v - 12) / 88 * 0.35);
        card.style.setProperty('--stack-opacity', s.toFixed(3));
      },
      onEnd: () => card.classList.remove('sweep-active'),
    });
  }, [animated]);

  const glowVars = buildGlowVars(glowColor, glowIntensity);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${variantClass} ${className}`.trim()}
      {...rest}
      style={{
        '--card-bg': backgroundColor || 'transparent',
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        '--stack-opacity': '0',
        ...glowVars,
        ...buildGradientVars(colors),
        ...(style || {}),
      } as React.CSSProperties}
    >
      <span className="edge-light" />
      {/* 7-stack layer for full fidelity interactive prototype glow (edge-proximity + cursor-angle + conic + stacked radials) */}
      <span className="glow-stack" aria-hidden="true" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
