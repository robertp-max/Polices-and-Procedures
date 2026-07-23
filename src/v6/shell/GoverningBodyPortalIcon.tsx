import React from 'react';

export interface GoverningBodyPortalIconProps extends React.SVGProps<SVGSVGElement> {
  /** Stroke width, matching the LucideIcon call convention used in NAV_ICONS. */
  strokeWidth?: number | string;
}

/**
 * Governing Body Portal glyph — a classical courthouse mark.
 *
 * Brand spec (governance nav icon):
 *  - transparent background; no surrounding square/circle/badge outline; no drop shadow.
 *  - the glyph itself is rendered in governance green `#273D38` (not `currentColor`), so the
 *    icon color is stable in active and inactive dock states and remains borderless throughout.
 *  - drawn on a 24×24 viewBox so it composes with the dock's `h-[22px] w-[22px]` sizing while
 *    keeping the visual glyph in the ~25–28px range at the shell's rendered scale.
 *
 * Accepts `className`, `strokeWidth`, `aria-hidden`, and any other SVG props (spread through),
 * so it is drop-in compatible with the existing `<Icon className=… strokeWidth=… aria-hidden />`
 * usage in `NAV_ICONS`.
 */
export function GoverningBodyPortalIcon({
  className,
  strokeWidth = 1.5,
  ...props
}: GoverningBodyPortalIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#273D38"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Pediment (roof) — filled governance green */}
      <path d="M12 3 21 8 3 8 Z" fill="#273D38" stroke="#273D38" />
      {/* Architrave beam */}
      <line x1="3.5" y1="10.25" x2="20.5" y2="10.25" />
      {/* Four columns */}
      <line x1="6" y1="10.5" x2="6" y2="17" />
      <line x1="10" y1="10.5" x2="10" y2="17" />
      <line x1="14" y1="10.5" x2="14" y2="17" />
      <line x1="18" y1="10.5" x2="18" y2="17" />
      {/* Plinth + base steps */}
      <line x1="4.5" y1="17.5" x2="19.5" y2="17.5" />
      <line x1="3" y1="20.75" x2="21" y2="20.75" />
    </svg>
  );
}

export default GoverningBodyPortalIcon;
