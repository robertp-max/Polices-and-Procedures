export const COLORS = {
  // Page canvas & structural backgrounds
  appBackground: 'var(--background, #F8FAFC)',
  surfaceBackground: 'var(--surface-base, #FFFFFF)',
  elevatedSurface: 'var(--surface-base, #FFFFFF)',

  // Brand / Typography
  deepTealText: 'var(--text-primary, #0A4D44)',
  mutedTealText: 'var(--text-muted, #2B7A71)',
  secondaryText: 'var(--text-secondary, #374151)',

  // Special surfaces
  paleTealSurface: 'var(--surface-glass, #EEF5F4)',
  tealBorder: 'var(--border-strong, #E5E7EB)',

  // CTAs
  orangePrimaryCTA: 'var(--primary, #F26E36)',
  orangeHover: '#E05C15',
  orangeOutlineBorder: '#F26E36',

  // States
  disabledState: 'var(--text-disabled, #A0BDBA)',
  success: 'var(--tone-green-text, #006B3A)',
  warning: 'var(--tone-amber-text, #8A5C00)',
  error: 'var(--tone-red-text, #B3261E)',
} as const;

export const TYPOGRAPHY = {
  heroTitle: 'text-3xl md:text-4xl font-bold tracking-tight text-brand-teal-deep font-montserrat',
  pageTitle: 'text-2xl font-semibold text-brand-teal-deep font-montserrat',
  sectionHeading: 'text-lg font-semibold text-brand-teal-deep font-montserrat',
  cardTitle: 'text-sm font-semibold text-brand-teal-deep font-montserrat',
  bodyText: 'text-sm font-light leading-relaxed text-secondary font-sans',
  metadataLabel: 'text-[11px] font-bold uppercase tracking-widest text-brand-teal font-montserrat',
  buttonText: 'text-sm font-bold uppercase tracking-wider font-montserrat',
} as const;

export const SPACING = {
  pagePadding: 'px-6 md:px-12 lg:px-16 py-8',
  sectionSpacing: 'space-y-8',
  cardPadding: 'p-6 md:p-8',
  gridGap: 'gap-6',
  tabSpacing: 'space-x-8',
} as const;

export const RADIUS = {
  card: 'rounded-2xl',
  button: 'rounded-full',
  pill: 'rounded-full',
  panel: 'rounded-2xl',
} as const;

export const SHADOWS = {
  softCard: 'shadow-sm border border-gray-100/50',
  elevatedPanel: 'shadow-[0_18px_45px_rgba(13,122,117,0.04)]',
  orangeCTA: 'shadow-[0_8px_20px_rgba(242,110,54,0.25)]',
} as const;

export const BORDERS = {
  neutral: 'border border-gray-100',
  activeTeal: 'border border-[#B2D8D6] bg-[#EEF5F4]',
  orangeAction: 'border border-[#F26E36]',
} as const;

export const MOTION = {
  transition: 'transition duration-base ease-standard',
  hoverLift: 'hover:-translate-y-hover-lift hover:shadow-hover',
} as const;
