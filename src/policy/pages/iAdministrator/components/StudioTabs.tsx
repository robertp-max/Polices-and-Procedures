import { ClipboardCheck, ListChecks, Landmark, Gauge, GraduationCap, MessageSquare } from 'lucide-react';
import type { IntentKind, StudioOutputType } from '../lib/responseTypes';

export type StudioTabId =
  | 'answer'
  | 'audit'
  | 'action'
  | 'brief'
  | 'qapi'
  | 'knowledge';

interface TabConfig {
  id: StudioTabId;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  intent: IntentKind;
  studioOutput: StudioOutputType | null;
}

export const STUDIO_TABS: TabConfig[] = [
  { id: 'answer',    label: 'Answer',             icon: MessageSquare,  intent: 'question',             studioOutput: 'summary' },
  { id: 'audit',     label: 'Pre-Survey Audit',   icon: ClipboardCheck, intent: 'pre_survey_audit',     studioOutput: 'audit_checklist' },
  { id: 'action',    label: 'Action Plan',        icon: ListChecks,     intent: 'action_plan',          studioOutput: 'action_plan' },
  { id: 'brief',     label: 'Governing Body',     icon: Landmark,       intent: 'governing_body_brief', studioOutput: 'governing_body_brief' },
  { id: 'qapi',      label: 'QAPI Digest',        icon: Gauge,          intent: 'qapi_digest',          studioOutput: 'qapi_digest' },
  { id: 'knowledge', label: 'Knowledge Article',  icon: GraduationCap,  intent: 'knowledge_article',    studioOutput: 'knowledge_article' },
];

export interface StudioTabsProps {
  active: StudioTabId;
  onChange: (tab: StudioTabId) => void;
  isLight: boolean;
  disabled?: boolean;
}

export function StudioTabs({ active, onChange, isLight, disabled }: StudioTabsProps) {
  const accent = isLight ? '#C74601' : '#FFC107';
  const muted = isLight ? '#52404B' : 'rgba(255,255,255,0.55)';
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';

  return (
    <div
      role="tablist"
      aria-label="Studio output type"
      className="flex flex-wrap items-center gap-1 p-1 rounded-xl"
      style={{
        background: isLight ? '#F7F6F5' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${border}`,
      }}
    >
      {STUDIO_TABS.map(tab => {
        const selected = tab.id === active;
        const color = selected ? (isLight ? '#FFFFFF' : '#0A0202') : muted;
        const bg = selected
          ? (isLight ? '#C74601' : 'linear-gradient(to bottom,#FFC107,#D9A406)')
          : 'transparent';

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onChange(tab.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors"
            style={{
              color,
              background: bg,
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            onMouseEnter={e => {
              if (!selected && !disabled) e.currentTarget.style.color = accent;
            }}
            onMouseLeave={e => {
              if (!selected && !disabled) e.currentTarget.style.color = muted;
            }}
          >
            <tab.icon size={13} strokeWidth={2} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
