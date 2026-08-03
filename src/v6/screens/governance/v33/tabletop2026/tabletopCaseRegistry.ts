import type { CasePack } from './engine/caseTypes';
import { Q1_CASE_PACK } from './data/q1Case';
import { Q2_2026_CASE } from './data/q2Case';
import { Q3_2026_CASE } from './data/q3Case';
import { Q4_CASE_PACK } from './data/q4Case';
import { ANNUAL_2026_CASE } from './data/annualCase';

export const TABLETOP_CASE_PACKS: readonly CasePack[] = [
  Q1_CASE_PACK,
  Q2_2026_CASE,
  Q3_2026_CASE,
  Q4_CASE_PACK,
  ANNUAL_2026_CASE,
];

const CASE_REGISTRY: Record<string, CasePack> = {
  q1: Q1_CASE_PACK,
  q2: Q2_2026_CASE,
  q3: Q3_2026_CASE,
  q4: Q4_CASE_PACK,
  annual: ANNUAL_2026_CASE,
  fy2026: ANNUAL_2026_CASE,
  [Q1_CASE_PACK.id]: Q1_CASE_PACK,
  [Q2_2026_CASE.id]: Q2_2026_CASE,
  [Q3_2026_CASE.id]: Q3_2026_CASE,
  [Q4_CASE_PACK.id]: Q4_CASE_PACK,
  [ANNUAL_2026_CASE.id]: ANNUAL_2026_CASE,
};

export function resolveTabletopCasePack(caseId: string): CasePack | null {
  return CASE_REGISTRY[caseId] ?? CASE_REGISTRY[caseId.toLowerCase()] ?? null;
}
