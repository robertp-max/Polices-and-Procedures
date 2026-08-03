// Single source of truth for rendering a pass standard.
//
// Two scoring units coexist in this portal and must never be mixed on screen:
//   - 'percentage_100' — training modules, policy/course assessments (0–100%)
//   - 'points_1000'    — 2026 tabletop packs (0–1000 points)
// Rendering a 1000-point standard with a '%' suffix produces the nonsense
// "950%" that this module exists to make impossible.

import type { EvidenceScoreScale } from './complianceTypes';

/**
 * Display standard for training modules and policy/course assessments.
 * DISPLAY ONLY — this is the standard the current spec states learners are
 * held to. It is deliberately NOT wired into any gate; the enforced thresholds
 * still live in their own constants (see the report note on the mismatch).
 */
export const TRAINING_POLICY_PASS_STANDARD_DISPLAY = 100;

/** Maximum attainable score per scale. */
export const SCORE_SCALE_MAXIMUM: Record<EvidenceScoreScale, number> = {
  percentage_100: 100,
  points_1000: 1000,
};

/**
 * Format a pass standard in its own unit.
 *   formatPassStandard(100, 'percentage_100') -> '100%'
 *   formatPassStandard(950, 'points_1000')    -> '950 / 1000 (95%)'
 *   formatPassStandard(970, 'points_1000')    -> '970 / 1000 (97%)'
 */
export function formatPassStandard(value: number, scale: EvidenceScoreScale): string {
  if (scale === 'points_1000') {
    const max = SCORE_SCALE_MAXIMUM.points_1000;
    const percent = (value / max) * 100;
    const percentLabel = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
    return `${value} / ${max} (${percentLabel}%)`;
  }
  return `${value}%`;
}

/** The full on-screen label, e.g. 'Pass standard 950 / 1000 (95%)'. */
export function formatPassStandardLabel(value: number, scale: EvidenceScoreScale): string {
  return `Pass standard ${formatPassStandard(value, scale)}`;
}

/**
 * Scale for an assignment/evidence pair when the record itself doesn't carry
 * one. Tabletops score in points-of-1000; everything else is a percentage.
 */
export function scaleForAssignmentType(type: string): EvidenceScoreScale {
  return type === 'tabletop' ? 'points_1000' : 'percentage_100';
}
