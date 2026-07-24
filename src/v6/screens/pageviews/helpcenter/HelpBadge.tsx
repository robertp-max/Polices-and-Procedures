import type { HelpBadgeId, HelpBadgeTone } from '@/policy/helpCenter/types';
import { HELP_BADGES, HELP_BADGE_GROUPS, HELP_BADGE_GROUP_LABELS, badgesByGroup } from '@/policy/helpCenter/data/helpBadges';
import { cx } from '../../../utils/classNames';

// Soft tint pills matching the ci-page-hero badge language
// (rounded-full, montserrat, bold uppercase micro-type).
const TONE_CLASSES: Record<HelpBadgeTone, string> = {
  teal: 'bg-[#E5FEFF] text-[#007970]',
  orange: 'bg-[#FFF2EB] text-[#C2410C]',
  sky: 'bg-[#EEF5FF] text-[#4E8FE8]',
  emerald: 'bg-[#E5F4EE] text-[#008540]',
  amber: 'bg-[#FEF3DC] text-[#9A6700]',
  slate: 'bg-[#F1F1EF] text-[#63635E]',
  rose: 'bg-[#FCEBEA] text-[#B3261E]',
};

export function HelpBadge({ badgeId, size = 'md' }: { badgeId: HelpBadgeId; size?: 'sm' | 'md' }) {
  const def = HELP_BADGES[badgeId];
  if (!def) return null;
  return (
    <span
      title={def.description}
      aria-label={`${HELP_BADGE_GROUP_LABELS[def.group]}: ${def.label}. ${def.description}`}
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full font-montserrat font-bold uppercase tracking-wider',
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]',
        TONE_CLASSES[def.tone],
      )}
    >
      {def.label}
    </span>
  );
}

export function HelpBadgeRow({ badges, size = 'md', max }: { badges: HelpBadgeId[]; size?: 'sm' | 'md'; max?: number }) {
  const shown = max ? badges.slice(0, max) : badges;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map((b) => (
        <HelpBadge key={b} badgeId={b} size={size} />
      ))}
      {max && badges.length > max ? (
        <span className="font-montserrat text-[9px] font-bold uppercase tracking-wider text-[#474742]">+{badges.length - max}</span>
      ) : null}
    </span>
  );
}

export function HelpBadgeFilterBar({
  selected,
  onToggle,
  onClear,
}: {
  selected: HelpBadgeId[];
  onToggle: (badge: HelpBadgeId) => void;
  onClear: () => void;
}) {
  return (
    <div aria-label="Filter articles by badge" role="group" className="space-y-4">
      {HELP_BADGE_GROUPS.map((group) => (
        <div key={group}>
          <div className="mb-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#474742]">
            {HELP_BADGE_GROUP_LABELS[group]}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {badgesByGroup(group).map((def) => {
              const isOn = selected.includes(def.id);
              return (
                <button
                  key={def.id}
                  type="button"
                  aria-pressed={isOn}
                  title={def.description}
                  onClick={() => onToggle(def.id)}
                  className={cx(
                    'rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:shadow-focus',
                    isOn
                      ? 'bg-[#007970] text-white'
                      : cx(TONE_CLASSES[def.tone], 'opacity-80 hover:opacity-100'),
                  )}
                >
                  {def.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {selected.length > 0 ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-[8px] font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#C2410C] hover:underline focus-visible:outline-none focus-visible:shadow-focus"
        >
          Clear filters ({selected.length})
        </button>
      ) : null}
    </div>
  );
}
