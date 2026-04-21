import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════
   KPI Tile — premium, dense, action-oriented metric surface
   Used across Dashboard + Calendar as the hero strip.
   ═══════════════════════════════════════════════════════════════ */

export interface KpiTileProps {
  label: string;
  value: ReactNode;
  caption?: string;
  trend?: string;
  trendTone?: 'neutral' | 'up' | 'down' | 'warn' | 'ok';
  icon: ReactNode;
  accent: string;
  onClick?: () => void;
  urgent?: boolean;
}

export function KpiTile({
  label, value, caption, trend, trendTone = 'neutral', icon, accent, onClick, urgent,
}: KpiTileProps) {
  // Callers historically pass the gold brand hex for "primary" tiles.
  // In light mode that same tile needs to render in brand teal.
  // We route the default gold through the theme-aware CSS variable so
  // downstream call sites never need to know about theme.
  const isDefaultAccent = /^#?FFC107$/i.test(accent.replace('#', '#'));
  const themedAccent = isDefaultAccent ? 'var(--ci-gold)' : accent;
  const themedAccentSoft = isDefaultAccent
    ? 'color-mix(in srgb, var(--ci-gold) 33%, transparent)'
    : `${accent}55`;

  // Trend color uses theme-aware fallback so the neutral case stays legible
  // in both light and dark themes (was `rgba(255,255,255,0.55)` → white in
  // light mode, which made the trend text invisible).
  const trendColor =
    trendTone === 'warn' ? '#C74601' :
    trendTone === 'up'   ? '#C74601' :
    trendTone === 'down' ? '#007970' :
    trendTone === 'ok'   ? '#007970' : 'var(--ci-text-muted, rgba(255,255,255,0.55))';

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left overflow-hidden px-5 py-4 transition-all duration-500 ${
        urgent ? 'animate-pulse-soft' : ''
      }`}
      style={{
        background: 'transparent',
        border: 'none',
        borderLeft: `2px solid ${urgent ? themedAccent : themedAccentSoft}`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderLeftColor = themedAccent)}
      onMouseLeave={e => (e.currentTarget.style.borderLeftColor = urgent ? themedAccent : themedAccentSoft)}
    >
      {/* Soft accent halo — purely ambient, feels like the glass is glowing */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 w-40 h-40 rounded-full opacity-[0.10] blur-3xl transition-opacity group-hover:opacity-25"
        style={{ background: themedAccent }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span
            className="inline-flex items-center gap-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.2em]"
            style={{ color: themedAccent }}
          >
            <span style={{ color: themedAccent }}>{icon}</span>
            {label}
          </span>
          <span
            className="font-outfit font-light leading-none"
            style={{ fontSize: 42, letterSpacing: '-0.015em', color: 'var(--ci-text, #FFFFFF)' }}
          >
            {value}
          </span>
          {(caption || trend) && (
            <span className="flex items-center gap-2 text-[11px] font-roboto">
              {caption && (
                <span style={{ color: 'var(--ci-text-muted, rgba(255,255,255,0.55))' }}>{caption}</span>
              )}
              {trend && (
                <span className="font-montserrat font-bold uppercase tracking-wider" style={{ color: trendColor, fontSize: 10 }}>
                  {trend}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
