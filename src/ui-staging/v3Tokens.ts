// V3 Veil Glass — canonical TypeScript token mirror of the CSS :root in ui-staging.css.
// Source of truth precedence:
//   1. ui-staging.css :root (--v3-*)  ← runtime CSS source
//   2. docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md (section 2)
//   3. This file (must stay in lock-step with the two above; no deviations).
//
// All preview components should consume from here OR from var(--v3-*) directly.
// Do not introduce local `const V3 = {...}` objects in new previews.

export const v3Tokens = {
  // Background
  baseBg: '#05060A',
  bgGradient: 'radial-gradient(circle at 50% 0%, #121724 0%, #05060A 100%)',

  // Glass surfaces
  glass1: 'transparent',
  glass2: 'rgba(255, 255, 255, 0.04)',
  glass3: 'rgba(255, 255, 255, 0.015)',
  glassCard:
    'linear-gradient(135deg, rgba(32, 41, 56, 0.88) 0%, rgba(16, 20, 28, 0.45) 60%, rgba(8, 10, 13, 0.98) 100%)',
  glassBlur: 'blur(32px) saturate(140%)',
  glassShadow: '30px 10px 80px rgba(0, 0, 0, 0.9)',

  // 77.7% card contract
  cardWidth: '77.7%',
  cardMinWidth: '980px',
  cardHeight: '92vh',
  cardRadius: '24px',

  // Borders (0.33 sacred rule)
  border: 'rgba(255, 255, 255, 0.33)',
  borderHover: 'rgba(255, 255, 255, 0.45)',
  borderSubtle: 'rgba(255, 255, 255, 0.12)',

  // Accents
  teal: '#007970',
  tealLight: '#00D1C1',
  orange: '#E07B2C',
  orangeLight: '#FFA059',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',

  // Motion
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  duration: '0.7s',
  durationFast: '0.4s',
  durationSub: '0.55s',

  // Watermark
  watermarkOpacity: 0.33,
} as const;

export type V3Tokens = typeof v3Tokens;
