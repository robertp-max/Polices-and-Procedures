export const TONES = ['teal', 'orange', 'green', 'amber', 'slate', 'blue', 'violet', 'red'] as const;
export type Tone = (typeof TONES)[number];

export type CssVarRef<Name extends string = string> = `var(--${Name})`;

const cssVar = <Name extends string>(name: Name): CssVarRef<Name> =>
  `var(--${name})` as CssVarRef<Name>;

export interface ToneTokens {
  bg: CssVarRef<`tone-${Tone}-bg`>;
  border: CssVarRef<`tone-${Tone}-border`>;
  text: CssVarRef<`tone-${Tone}-text`>;
  dot: CssVarRef<`tone-${Tone}-text`>;
  bar: CssVarRef<`tone-${Tone}-text`>;
}

export const TONE_TOKENS = {
  teal: {
    bg: cssVar('tone-teal-bg'),
    border: cssVar('tone-teal-border'),
    text: cssVar('tone-teal-text'),
    dot: cssVar('tone-teal-text'),
    bar: cssVar('tone-teal-text'),
  },
  orange: {
    bg: cssVar('tone-orange-bg'),
    border: cssVar('tone-orange-border'),
    text: cssVar('tone-orange-text'),
    dot: cssVar('tone-orange-text'),
    bar: cssVar('tone-orange-text'),
  },
  green: {
    bg: cssVar('tone-green-bg'),
    border: cssVar('tone-green-border'),
    text: cssVar('tone-green-text'),
    dot: cssVar('tone-green-text'),
    bar: cssVar('tone-green-text'),
  },
  amber: {
    bg: cssVar('tone-amber-bg'),
    border: cssVar('tone-amber-border'),
    text: cssVar('tone-amber-text'),
    dot: cssVar('tone-amber-text'),
    bar: cssVar('tone-amber-text'),
  },
  slate: {
    bg: cssVar('tone-slate-bg'),
    border: cssVar('tone-slate-border'),
    text: cssVar('tone-slate-text'),
    dot: cssVar('tone-slate-text'),
    bar: cssVar('tone-slate-text'),
  },
  blue: {
    bg: cssVar('tone-blue-bg'),
    border: cssVar('tone-blue-border'),
    text: cssVar('tone-blue-text'),
    dot: cssVar('tone-blue-text'),
    bar: cssVar('tone-blue-text'),
  },
  violet: {
    bg: cssVar('tone-violet-bg'),
    border: cssVar('tone-violet-border'),
    text: cssVar('tone-violet-text'),
    dot: cssVar('tone-violet-text'),
    bar: cssVar('tone-violet-text'),
  },
  red: {
    bg: cssVar('tone-red-bg'),
    border: cssVar('tone-red-border'),
    text: cssVar('tone-red-text'),
    dot: cssVar('tone-red-text'),
    bar: cssVar('tone-red-text'),
  },
} satisfies Record<Tone, ToneTokens>;

export const MOTION = {
  fast: cssVar('motion-fast'),
  base: cssVar('motion-base'),
  slow: cssVar('motion-slow'),
  easeStandard: cssVar('ease-standard'),
  easeExit: cssVar('ease-exit'),
  toast: cssVar('duration-toast'),
  pressScale: cssVar('press-scale'),
} as const;

export const RADIUS = {
  sm: cssVar('radius-sm'),
  md: cssVar('radius-md'),
  lg: cssVar('radius-lg'),
  xl: cssVar('radius-xl'),
  '2xl': cssVar('radius-2xl'),
} as const;

export const SPACE = {
  xs: cssVar('space-xs'),
  sm: cssVar('space-sm'),
  md: cssVar('space-md'),
  lg: cssVar('space-lg'),
  xl: cssVar('space-xl'),
  '2xl': cssVar('space-2xl'),
  '3xl': cssVar('space-3xl'),
} as const;

export const SHELL = {
  sidebar: cssVar('sidebar-w'),
  sidebarCollapsed: cssVar('sidebar-collapsed'),
  topbar: cssVar('topbar-h'),
  drawer: cssVar('drawer-w'),
  contentMax: cssVar('content-max'),
} as const;

export const ICON = {
  xs: cssVar('icon-xs'),
  sm: cssVar('icon-sm'),
  md: cssVar('icon-md'),
  lg: cssVar('icon-lg'),
  xl: cssVar('icon-xl'),
} as const;
