/**
 * Care Indeed light-mode inline-color remap.
 *
 * Domain and regulatory tag colors are sourced from hard-coded hex
 * literals (inline style), so the global CSS cascade cannot recolor
 * them. In light mode we translate the handful of low-WCAG hues
 * (pure yellows, pale greens, cyans, pure white) to brand-aligned
 * tones that satisfy WCAG AA (≥4.5:1) on #FFFFFF / #FAFBF8.
 * Dark mode returns the source color unchanged.
 */
export const LIGHT_COLOR_MAP: Record<string, string> = {
  '#FFC107': '#C74601', // yellow-gold → brand primary orange
  '#ffc107': '#C74601',
  '#facc15': '#C74601', // yellow-300 → brand primary orange
  '#eab308': '#9A6700', // yellow-500 → darkened warning
  '#f59e0b': '#C74601', // amber-500 → brand primary orange
  '#10b981': '#008540', // emerald-500 → brand success
  '#06b6d4': '#007970', // cyan-500 → brand secondary teal
  '#ffffff': '#1F1C1B', // pure white → neutral-600
};

export function remapForLight(hex: string, isLight: boolean): string {
  if (!isLight) return hex;
  return LIGHT_COLOR_MAP[hex] ?? LIGHT_COLOR_MAP[hex.toLowerCase()] ?? hex;
}
