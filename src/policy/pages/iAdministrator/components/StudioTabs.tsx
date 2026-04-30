import { ClipboardCheck, ListChecks, Landmark, Gauge, GraduationCap, MessageSquare } from 'lucide-react';
import type { IntentKind, StudioOutputType } from '../lib/responseTypes';
import { Tabs } from '@/policy/components/ui';

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
  void isLight;
  return (
    <Tabs
      ariaLabel="Studio output type"
      variant="segmented"
      value={active}
      onChange={(id) => {
        if (!disabled) onChange(id as StudioTabId);
      }}
      items={STUDIO_TABS.map(tab => ({
        id: tab.id,
        label: (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] font-mono">
            <tab.icon size={13} strokeWidth={2} />
            {tab.label}
          </span>
        ),
        disabled,
      }))}
    />
  );
}
