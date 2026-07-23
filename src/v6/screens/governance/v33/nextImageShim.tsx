/* Minimal next/image replacement for the ported v33 premium office (Vite has no next/image). */
import type { CSSProperties } from 'react';
interface ShimProps { src: string | { src: string }; alt?: string; fill?: boolean; priority?: boolean; sizes?: string; unoptimized?: boolean; width?: number; height?: number; className?: string; style?: CSSProperties; }
export default function Image({ src, alt = '', fill, style, className, width, height }: ShimProps) {
  const resolved = typeof src === 'string' ? src : src?.src;
  const fillStyle: CSSProperties = fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } : {};
  return <img src={resolved} alt={alt} className={className} width={width} height={height} style={{ ...fillStyle, ...style }} />;
}
