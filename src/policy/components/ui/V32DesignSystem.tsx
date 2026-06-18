import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { Search } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

type Tone = 'neutral' | 'teal' | 'orange' | 'muted' | 'success' | 'warning' | 'danger';

const toneText: Record<Tone, string> = {
  neutral: 'text-text-secondary',
  teal: 'text-brand-teal',
  orange: 'text-brand-orange',
  muted: 'text-text-muted',
  success: 'text-brand-teal',
  warning: 'text-brand-orange',
  danger: 'text-brand-orange',
};

const spotlightByTone: Record<Tone, string> = {
  neutral: 'rgba(226, 232, 240, 0.10)',
  teal: 'rgba(0, 121, 112, 0.22)',
  orange: 'rgba(199, 70, 0, 0.22)',
  muted: 'rgba(138, 148, 166, 0.12)',
  success: 'rgba(0, 121, 112, 0.22)',
  warning: 'rgba(199, 70, 0, 0.20)',
  danger: 'rgba(199, 70, 0, 0.24)',
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
  const classes = `rounded-2xl border border-border bg-surface-elevated/88 text-text-primary backdrop-blur-xl ${className ?? ''}`;

  if (spotlight) {
    return (
      <SpotlightCard {...rest} spotlightColor={spotlightColor} className={classes}>
        {children}
      </SpotlightCard>
    );
  }

  return (
    <div {...rest} className={classes}>
      {children}
    </div>
  );
}

export interface V32MetricTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  label: ReactNode;
  value: ReactNode;
  trend?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
}

export function V32MetricTile({
  label,
  value,
  trend,
  tone = 'neutral',
  icon,
  className,
  ...rest
}: V32MetricTileProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="font-montserrat text-[10px] font-bold uppercase tracking-[0.22em] text-text-disabled">
          {label}
        </span>
        {icon ? <span className={toneText[tone]}>{icon}</span> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-montserrat text-3xl font-semibold leading-none tracking-[-0.03em] ${toneText[tone]}`}>
          {value}
        </span>
      </div>
      {trend ? <div className="mt-2 text-[11px] font-medium text-text-muted">{trend}</div> : null}
    </>
  );

  return (
    <SpotlightCard
      spotlightColor={spotlightByTone[tone]}
      className={`min-h-[132px] p-4 text-left ${className ?? ''}`}
    >
      <button
        {...rest}
        type={rest.type ?? 'button'}
        className="absolute inset-0 z-20 rounded-[inherit] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={typeof label === 'string' ? label : undefined}
      />
      <div className="pointer-events-none relative z-30">{content}</div>
    </SpotlightCard>
  );
}

export interface StatusPillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  children: ReactNode;
}

export function StatusPill({ tone = 'neutral', className, children, ...rest }: StatusPillProps) {
  const toneClass = {
    neutral: 'border-border text-text-secondary',
    teal: 'border-brand-teal/35 text-brand-teal',
    orange: 'border-brand-orange/45 text-brand-orange',
    muted: 'border-border text-text-muted',
    success: 'border-brand-teal/35 text-brand-teal',
    warning: 'border-brand-orange/45 text-brand-orange',
    danger: 'border-brand-orange/45 text-brand-orange',
  }[tone];

  return (
    <span
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-[0.16em] ${toneClass} ${className ?? ''}`}
    >
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
    <section {...rest} className={`flex flex-wrap items-end justify-between gap-5 ${className ?? ''}`}>
      <div className="min-w-0 max-w-4xl">
        {eyebrow ? (
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.28em] text-brand-teal">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="font-montserrat text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--v3-heading-primary)] md:text-4xl">
          {title}
        </h1>
        {description ? <p className="mt-3 max-w-3xl font-roboto text-sm leading-6 text-text-muted">{description}</p> : null}
      </div>
      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
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
          <div className="mb-1 font-montserrat text-[10px] font-bold uppercase tracking-[0.22em] text-text-disabled">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="font-montserrat text-xl font-semibold tracking-[-0.03em] text-[var(--v3-heading-primary)]">{title}</h2>
        {description ? <p className="mt-1 font-roboto text-xs text-text-muted">{description}</p> : null}
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
    primary: 'border-brand-teal bg-brand-teal text-white hover:border-[#00988e] hover:bg-[#00988e]',
    secondary: 'border-border bg-surface-elevated text-text-secondary hover:border-border-hover hover:text-text-primary',
    ghost: 'border-transparent bg-transparent text-text-muted hover:text-text-primary',
    danger: 'border-brand-orange bg-brand-orange text-white hover:border-[#A33900] hover:bg-[#A33900]',
  }[variant];

  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 font-montserrat text-xs font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/70 disabled:cursor-not-allowed disabled:opacity-60 ${variantClass} ${className ?? ''}`}
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
      <div className="font-montserrat text-base font-semibold text-[var(--v3-heading-primary)]">{title}</div>
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
