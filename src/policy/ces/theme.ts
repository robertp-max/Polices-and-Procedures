/* ═══════════════════════════════════════════════════════════════
   CES — Brand tokens (navy / orange enterprise palette)
   ═══════════════════════════════════════════════════════════════ */

export const CES_TOKENS = {
  navy:        '#1A3778',
  navyDeep:    '#122555',
  navySoft:    '#EEF1FA',
  orange:      '#F04B22',
  orangeSoft:  '#FFF0EB',
  ink:         '#1F1C1B',
  muted:       '#747470',
  border:      '#E5E4E3',
  borderSoft:  '#F0F0EE',
  paper:       '#FAFBF8',
  canvas:      '#F7F8FB',
  white:       '#FFFFFF',
  // Semantic / status (muted, professional)
  green:       '#1F7A4F',
  greenSoft:   '#E7F4EE',
  amber:       '#B5790F',
  amberSoft:   '#FBF1DD',
  red:         '#B0271F',
  redSoft:     '#FBE7E5',
} as const;

export type CesToken = keyof typeof CES_TOKENS;
