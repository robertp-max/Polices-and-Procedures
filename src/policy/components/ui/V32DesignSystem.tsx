import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Search } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

type Tone = 'neutral' | 'teal' | 'orange' | 'muted' | 'success' | 'warning' | 'danger' | 'green' | 'amber' | 'slate' | 'red';

const spotlightByTone: Record<Tone, string> = {
  neutral: 'var(--spotlight-neutral, rgba(226, 232, 240, 0.10))',
  teal: 'var(--spotlight-teal, rgba(0, 121, 125, 0.22))',
  orange: 'var(--spotlight-orange, rgba(199, 70, 1, 0.22))',
  muted: 'var(--spotlight-muted, rgba(138, 148, 166, 0.12))',
  success: 'var(--spotlight-teal, rgba(0, 121, 125, 0.22))',
  warning: 'var(--spotlight-orange, rgba(199, 70, 1, 0.20))',
  danger: 'var(--spotlight-orange, rgba(199, 70, 1, 0.24))',
  green: 'var(--spotlight-teal, rgba(0, 121, 125, 0.22))',
  amber: 'var(--spotlight-orange, rgba(199, 70, 1, 0.20))',
  slate: 'var(--spotlight-muted, rgba(138, 148, 166, 0.12))',
  red: 'var(--spotlight-orange, rgba(199, 70, 1, 0.24))',
};

export interface GlassPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  children: ReactNode;
  spotlight?: boolean;
  spotlightColor?: string;
}

export function GlassPanel({
  children,
  className,
  spotlight = false,
  spotlightColor,
  ...rest
}: GlassPanelProps) {
  // MATCH TO REF DASHBOARDS (16-dashboard.png, 40-onboarding-v2-dashboard.png):
  // Clean white #FFFFFF cards, pale #F7FEFF base. Restrained glass ONLY on shells/overlays (not content cards).
  // Exact radii 8-32 via --radius or rounded-2xl (16px default card), shadow-soft, no dark bleed.
  // Always clean opaque in prod light (care-indeed-light). Glass/88/blur killed for cards.
  const base = `surface-card hover-lift shadow-soft rounded-2xl border border-[var(--border-card,#E9E5E3)] bg-[#FFFFFF] text-text-primary ${className ?? ''}`;

  if (spotlight) {
    return (
      <SpotlightCard {...rest} spotlightColor={spotlightColor} className={base}>
        {children}
      </SpotlightCard>
    );
  }

  return (
    <div {...rest} className={base}>
      {children}
    </div>
  );
}

export interface V32MetricTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  label: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  note?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  /** When true, wraps in SpotlightCard (preserves legacy V32 spotlight behavior). Default false for direct tone tile per redesign prototype. (no wrapper) */
  spotlight?: boolean;
}

const toneTileClass: Record<Tone, string> = {
  neutral: 'border-[var(--tone-slate-bdr)] bg-[var(--tone-slate-bg)] text-[var(--tone-slate-fg)]',
  teal: 'border-[var(--tone-teal-bdr)] bg-[var(--tone-teal-bg)] text-[var(--tone-teal-fg)]',
  orange: 'border-[var(--tone-orange-bdr)] bg-[var(--tone-orange-bg)] text-[var(--tone-orange-fg)]',
  muted: 'border-[var(--tone-slate-bdr)] bg-[var(--tone-slate-bg)] text-[var(--tone-slate-fg)]',
  success: 'border-[var(--tone-green-bdr)] bg-[var(--tone-green-bg)] text-[var(--tone-green-fg)]',
  warning: 'border-[var(--tone-amber-bdr)] bg-[var(--tone-amber-bg)] text-[var(--tone-amber-fg)]',
  danger: 'border-[var(--tone-orange-bdr)] bg-[var(--tone-orange-bg)] text-[var(--tone-orange-fg)]',
  green: 'border-[var(--tone-green-bdr)] bg-[var(--tone-green-bg)] text-[var(--tone-green-fg)]',
  amber: 'border-[var(--tone-amber-bdr)] bg-[var(--tone-amber-bg)] text-[var(--tone-amber-fg)]',
  slate: 'border-[var(--tone-slate-bdr)] bg-[var(--tone-slate-bg)] text-[var(--tone-slate-fg)]',
  red: 'border-[var(--tone-orange-bdr)] bg-[var(--tone-orange-bg)] text-[var(--tone-orange-fg)]',
};

export function V32MetricTile({
  label,
  value,
  trend,
  note,
  tone = 'neutral',
  icon,
  className,
  spotlight = false,
  ...rest
}: V32MetricTileProps) {
  const noteContent = note ?? trend;
  const commonTile = 'metric-tile hover-lift rounded-2xl border p-4 md:p-5 shadow-soft min-h-[92px] touch-manipulation w-full font-roboto'; /* EXACT per task: 10px uppercase tracking-[0.18em] label (Light), 3xl value (Medium), xs note (Light), direct tone pastel bg #F7FEFF etc (via toneCls + .tone-* in css), rounded-2xl p-4/5 shadow-soft min-h-[92px], radii 8-32, hover-lift, #F7FEFF base + white cards, restrained glass */
  const toneCls = toneTileClass[tone];
  // Attach .tone-xxx (normalized to prototype tones teal,orange,amber,slate,green) so that index.css .tone-* exact pastels (with !important) + vars inject directly onto KPI/MetricTile for ref match (16-dashboard.png, 11-ces-board.png)
  const toneKey = normalizeTone(String(tone));
  const mergedClasses = `${commonTile} ${toneCls} tone-${toneKey} ${className ?? ''}`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        {/* EXACT per task + ref: 10px uppercase tracking-[0.18em] label using Roboto Light, not medium */}
        <span className="text-[10px] font-roboto font-light uppercase tracking-[0.18em] opacity-70">
          {typeof label === 'string' ? label.toUpperCase() : label}
        </span>
        {icon ? <span className="shrink-0 opacity-80">{icon}</span> : null}
      </div>
      {/* 3xl value (Roboto Medium), mt-3 per spec; tone pastels #F7FEFF applied via .tone-* + css; rounded-2xl shadow-soft in commonTile */}
      <div className="mt-3 text-3xl font-roboto font-medium tracking-tight leading-none">
        {value}
      </div>
      {noteContent ? <div className="mt-1 text-xs font-roboto font-light opacity-70">{noteContent}</div> : null}
    </>
  );

  if (spotlight) {
    return (
      <SpotlightCard
        spotlightColor={spotlightByTone[tone]}
        className={`p-0 text-left ${className ?? ''}`}
      >
        <button
          {...(rest as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
          type={rest.type ?? 'button'}
          className={`${commonTile} ${toneCls} tone-${toneKey} text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70 disabled:cursor-not-allowed disabled:opacity-60`}
          aria-label={typeof label === 'string' ? label : undefined}
        >
          {content}
        </button>
      </SpotlightCard>
    );
  }

  // Direct button root (exact match to ref MetricTile: direct children for label/value/note, 10px uppercase tracking-[0.18em], 3xl, xs, tone pastels, rounded-2xl etc; no internal absolute/z wrappers).
  // Button ensures semantics + handlers.
  return (
    <button
      {...(rest as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      type={rest.type ?? 'button'}
      className={`${mergedClasses} text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70 disabled:cursor-not-allowed disabled:opacity-60`}
      aria-label={typeof label === 'string' ? label : undefined}
    >
      {content}
    </button>
  );
}

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

function normalizeTone(tone: string | undefined): string {
  const t = String(tone || 'teal').toLowerCase();
  const allowed = ['teal', 'orange', 'green', 'amber', 'slate', 'red', 'violet', 'blue', 'muted', 'neutral', 'success', 'warning', 'danger'];
  let key = allowed.includes(t) ? t : 'teal';
  if (key === 'success') key = 'green';
  if (key === 'warning') key = 'amber';
  if (key === 'danger' || key === 'red') key = 'orange';
  if (key === 'muted' || key === 'neutral' || key === 'violet' || key === 'blue') key = 'slate';
  return key;
}

// Exact badge styles from prototype tones.badge + dot (small uppercase, dots, colors from tones).
// Uses arbitrary values for exact visual match to ref cards (16-dashboard.png) independent of .tone-* (which target tile/icon shells).
const protoBadgeStyles: Record<string, { badge: string; dot: string }> = {
  teal:   { badge: 'bg-[#F7FEFF] text-[#00797D] border-[#E5F0EF]',   dot: '#00797D' },
  orange: { badge: 'bg-[#FFFAF7] text-[#C74601] border-[#FFEEE5]',   dot: '#C74601' },
  amber:  { badge: 'bg-[#fff8e6] text-[#8a5c00] border-[#f0d9a3]',   dot: '#E56E2E' },
  green:  { badge: 'bg-[#e6f4ed] text-[#006B3A] border-[#a3d9b8]',   dot: '#008540' },
  slate:  { badge: 'bg-[#FAF8F8] text-[#524D4B] border-[#E9E5E3]',   dot: '#524D4B' },
  red:    { badge: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',   dot: '#D70101' },
};

export function StatusPill({ tone = 'neutral', className, children, ...rest }: StatusPillProps) {
  // Exact to prototype ToneBadge (small [10px] uppercase, dot, colors from tones)
  const toneKey = normalizeTone(tone);
  const styles = protoBadgeStyles[toneKey] || protoBadgeStyles.teal;
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-roboto font-light uppercase tracking-wider ${styles.badge} ${className ?? ''}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: styles.dot }}></span>
      {children}
    </span>
  );
}

export interface ToneBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: string;
  children: ReactNode;
}

/** Exact ToneBadge from prototype: dot + uppercase pill. Small uppercase, dots, colors from tones. */
export function ToneBadge({ tone = 'teal', className, children, ...rest }: ToneBadgeProps) {
  const toneKey = normalizeTone(tone);
  const styles = protoBadgeStyles[toneKey] || protoBadgeStyles.teal;
  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-roboto font-light uppercase tracking-wider ${styles.badge} ${className ?? ''}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: styles.dot }}></span>
      {children}
    </span>
  );
}

export interface SearchCommandBarProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
}

export function SearchCommandBar({ leadingIcon, className, ...rest }: SearchCommandBarProps) {
  return (
    <label
      className={`group inline-flex h-10 min-w-[240px] items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 text-text-muted transition-colors focus-within:border-brand-teal focus-within:text-brand-teal ${className ?? ''}`}
    >
      {leadingIcon ?? <Search size={16} aria-hidden="true" />}
      <input
        {...rest}
        type={rest.type ?? 'search'}
        className="w-full border-0 bg-transparent font-roboto text-sm text-text-primary outline-none placeholder:text-text-disabled"
      />
    </label>
  );
}

export interface V32PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function V32PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
  ...rest
}: V32PageHeaderProps) {
  return (
    <section {...rest} className={`flex flex-wrap items-start justify-between gap-4 ${className ?? ''}`}>
      <div className="min-w-0 max-w-4xl">
        {eyebrow ? (
          <ToneBadge tone="teal" className="mb-1">{eyebrow}</ToneBadge>
        ) : null}
        <h1 className="font-roboto text-2xl font-medium tracking-tight text-[var(--v3-heading-primary)] md:text-3xl">
          {title}
        </h1>
        {description ? <p className="mt-1.5 max-w-3xl font-roboto text-sm font-light leading-6 text-text-muted">{description}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        {meta}
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export interface V32SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function V32SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...rest
}: V32SectionHeaderProps) {
  return (
    <div {...rest} className={`flex flex-wrap items-end justify-between gap-3 ${className ?? ''}`}>
      <div>
        {eyebrow ? (
          <div className="mb-1 font-roboto text-[10px] font-medium uppercase tracking-[0.22em] text-text-disabled">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-roboto text-xl font-medium tracking-[-0.03em] text-[var(--v3-heading-primary)]">{title}</h2>
        {description ? <p className="mt-1 font-roboto text-xs font-light text-text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export interface V32ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export function V32ActionButton({
  variant = 'secondary',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: V32ActionButtonProps) {
  const variantClass = {
    primary: 'border-brand-teal bg-brand-teal text-white hover:border-[color:var(--teal-primary,#00988e)] hover:bg-[color:var(--teal-primary,#00988e)]',
    secondary: 'border-border bg-surface-elevated text-text-secondary hover:border-border-hover hover:text-text-primary',
    ghost: 'border-transparent bg-transparent text-text-muted hover:text-text-primary',
    danger: 'border-brand-orange bg-brand-orange text-white hover:border-[color:var(--orange-primary,#A33900)] hover:bg-[color:var(--orange-primary,#A33900)]',
  }[variant];

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 font-roboto text-xs font-light uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className ?? ''}`}
    >
      {leftIcon ? <span className="inline-flex shrink-0">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
    </button>
  );
}

export interface V32EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function V32EmptyState({ icon, title, description, action, className, ...rest }: V32EmptyStateProps) {
  return (
    <GlassPanel {...rest} className={`flex min-h-[220px] flex-col items-center justify-center p-8 text-center ${className ?? ''}`}>
      {icon ? <div className="mb-4 text-brand-teal">{icon}</div> : null}
      <div className="font-roboto text-base font-light text-[var(--v3-heading-primary)]">{title}</div>
      {description ? <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </GlassPanel>
  );
}

export function DrawerSurface({ children, className, ...rest }: GlassPanelProps) {
  return (
    <GlassPanel {...rest} className={`h-full overflow-hidden rounded-l-3xl p-0 ${className ?? ''}`}>
      {children}
    </GlassPanel>
  );
}

export const RightPanel = DrawerSurface;
export const V32AppShell = ({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div {...rest} className={`v32-command-center-app min-h-screen bg-background text-text-primary ${className ?? ''}`}>
    {children}
  </div>
);
export const V32SidebarNav = ({ children, className, ...rest }: HTMLAttributes<HTMLElement>) => (
  <nav {...rest} className={`bg-surface text-text-secondary ${className ?? ''}`}>
    {children}
  </nav>
);
export const V32SidebarNavGroup = V32SectionHeader;
export const V32SidebarNavItem = V32ActionButton;
export const SectionHeader = V32SectionHeader;
export const ActionButton = V32ActionButton;
export const EmptyState = V32EmptyState;
