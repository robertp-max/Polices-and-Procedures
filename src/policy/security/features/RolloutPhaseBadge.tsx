import { useFeatureAccess } from './useFeatureAccess';
import { FEATURE_BY_ID } from './catalog';
import type { FeatureId, RolloutPhase } from './types';

interface RolloutPhaseBadgeProps {
  featureId: FeatureId;
  /** Hide the badge when the rollout phase is 'full' (the default state). */
  hideWhenFull?: boolean;
}

const PHASE_STYLES: Record<RolloutPhase, { label: string; bg: string; fg: string }> = {
  internal:  { label: 'Internal',  bg: '#fee2e2', fg: '#7f1d1d' },
  pilot:     { label: 'Pilot',     bg: '#fef3c7', fg: '#78350f' },
  trainer:   { label: 'Trainer',   bg: '#e0e7ff', fg: '#3730a3' },
  office:    { label: 'Office',    bg: '#dbeafe', fg: '#1e3a8a' },
  clinical:  { label: 'Clinical',  bg: '#dcfce7', fg: '#14532d' },
  demo:      { label: 'Demo',      bg: '#f3e8ff', fg: '#581c87' },
  full:      { label: 'GA',        bg: '#e2e8f0', fg: '#0f172a' },
};

/**
 * Renders a small phase chip (Internal / Pilot / GA) — only visible
 * to admins. Use next to nav items, page headers, or admin
 * diagnostics so privileged users can see what's still gated.
 */
export function RolloutPhaseBadge({ featureId, hideWhenFull = true }: RolloutPhaseBadgeProps) {
  const { isAdmin } = useFeatureAccess();
  if (!isAdmin) return null;

  const feature = FEATURE_BY_ID[featureId];
  if (!feature) return null;
  const phase = feature.rolloutPhase ?? 'full';
  if (hideWhenFull && phase === 'full') return null;

  const style = PHASE_STYLES[phase];
  return (
    <span
      className="inline-flex items-center px-1.5 py-[1px] rounded text-[9.5px] font-semibold uppercase tracking-[0.08em] ml-2"
      style={{ background: style.bg, color: style.fg }}
      title={`Rollout phase for "${feature.label}"`}
    >
      {style.label}
    </span>
  );
}
