/* ═══════════════════════════════════════════════════════════════
  CES — Brand tokens (mode-aware)
  ═══════════════════════════════════════════════════════════════ */

import { useCiModeStore } from '@/policy/stores/ciModeStore';
import { useShellStore } from '@/policy/stores/uiStore';

const CES_TOKENS_LIGHT = {
  navy:        '#1F4A8A',
  navyDeep:    '#143366',
  navySoft:    '#EAF1FF',
  orange:      '#C74601',
  orangeSoft:  '#FFF1EA',
  ink:         '#1E293B',
  muted:       '#64748B',
  border:      '#E2E8F0',
  borderSoft:  '#EEF2F7',
  paper:       '#FFFFFF',
  canvas:      '#F8FAFC',
  white:       '#FFFFFF',
  // Semantic / status (muted, professional)
  green:       '#0F766E',
  greenSoft:   '#E6F7F4',
  amber:       '#B45309',
  amberSoft:   '#FFF5E8',
  red:         '#B91C1C',
  redSoft:     '#FEECEC',
} as const;

const CES_TOKENS_DARK: CesTokens = {
  navy:        '#7ADEDF',
  navyDeep:    '#C4F4F5',
  navySoft:    'rgba(122,222,223,0.14)',
  orange:      '#FFC107',
  orangeSoft:  'rgba(255,193,7,0.16)',
  ink:         '#F1F5F4',
  muted:       '#B7C7C5',
  border:      'rgba(122,222,223,0.24)',
  borderSoft:  'rgba(122,222,223,0.14)',
  paper:       '#15282A',
  canvas:      '#11242A',
  white:       '#15282A',
  green:       '#7AE2A8',
  greenSoft:   'rgba(122,226,168,0.16)',
  amber:       '#FFD64D',
  amberSoft:   'rgba(255,214,77,0.16)',
  red:         '#FF7A7A',
  redSoft:     'rgba(255,122,122,0.16)',
};

export const CES_TOKENS = CES_TOKENS_LIGHT;

export type CesToken = keyof typeof CES_TOKENS_LIGHT;
export type CesTokens = {
  readonly navy: string;
  readonly navyDeep: string;
  readonly navySoft: string;
  readonly orange: string;
  readonly orangeSoft: string;
  readonly ink: string;
  readonly muted: string;
  readonly border: string;
  readonly borderSoft: string;
  readonly paper: string;
  readonly canvas: string;
  readonly white: string;
  readonly green: string;
  readonly greenSoft: string;
  readonly amber: string;
  readonly amberSoft: string;
  readonly red: string;
  readonly redSoft: string;
};

export function useCesTokens(): CesTokens {
  const theme = useShellStore(s => s.theme);
  const mode = useCiModeStore(s => s.mode);
  const isCareIndeedDark = theme === 'care-indeed-light' && mode === 'dark';
  return isCareIndeedDark ? CES_TOKENS_DARK : CES_TOKENS_LIGHT;
}
