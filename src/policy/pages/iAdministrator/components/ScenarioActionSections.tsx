import { AlertTriangle, ClipboardCheck, FileText, FolderPlus, Quote, Workflow } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ScenarioClassification } from '../lib/classifyScenario';
import type {
  ActionPriority,
  ResolvedComplianceActionDefinition,
  ScenarioArtifactLink,
} from '../lib/complianceActionMap';
import { ReferenceLink } from './ReferenceLink';

export interface ScenarioActionSectionsProps {
  classification: ScenarioClassification;
  definition: ResolvedComplianceActionDefinition;
  isLight: boolean;
  onOpenReference: (id: string) => void;
}

export function ScenarioActionSections({ classification, definition, isLight, onOpenReference }: ScenarioActionSectionsProps) {
  const themeClasses = isLight
    ? {
        panel: 'bg-white border border-[#E5E4E3]',
        text: 'text-[#1F1C1B]',
        muted: 'text-[#6B6B6B]',
        card: 'bg-[#FAF9F7] border border-[#E5E4E3]',
        emptyCard: 'bg-[#FCFBFA] border border-dashed border-[#E5E4E3]',
        pill: 'bg-[#F8F7F5] border border-[#E5E4E3] text-[#1F1C1B]',
      }
    : {
        panel: 'bg-white/[0.025] border border-white/[0.09]',
        text: 'text-[#E0E0E0]',
        muted: 'text-white/[0.55]',
        card: 'bg-white/[0.03] border border-white/[0.09]',
        emptyCard: 'bg-white/[0.02] border border-dashed border-white/[0.09]',
        pill: 'bg-white/[0.04] border border-white/[0.09] text-[#E0E0E0]',
      };
  const accentClasses =
    definition.escalationLevel === 'immediate'
      ? {
          text: 'text-[#DC2626]',
          badge: 'text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/20',
        }
      : definition.escalationLevel === 'urgent'
        ? {
            text: 'text-[#D97706]',
            badge: 'text-[#D97706] bg-[#D97706]/10 border border-[#D97706]/20',
          }
        : isLight
          ? {
              text: 'text-[#C74601]',
              badge: 'text-[#C74601] bg-[#C74601]/10 border border-[#C74601]/20',
            }
          : {
              text: 'text-[#FFC107]',
              badge: 'text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/20',
            };

  return (
    <section className={`rounded-2xl p-5 md:p-6 flex flex-col gap-5 ${themeClasses.panel}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] font-mono ${accentClasses.text}`}>
              Scenario Action Layer
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full font-mono ${accentClasses.badge}`}>
              {classification.scenarioId}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] font-mono ${themeClasses.muted}`}>
              conf · {classification.confidence}
            </span>
          </div>
          <h2 className={`text-[16px] md:text-[17px] font-semibold ${themeClasses.text}`}>
            {definition.label}
          </h2>
          <p className={`text-[12px] mt-1 ${themeClasses.muted}`}>
            Matched keywords: {classification.matchedKeywords.join(', ')}
          </p>
          {classification.emergencyTriggerExplanation && (
            <p className={`text-[12px] mt-1 font-semibold ${accentClasses.text}`}>
              {classification.emergencyTriggerExplanation}
            </p>
          )}
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-[0.22em] px-3 py-1.5 rounded-lg font-mono ${accentClasses.badge}`}>
          Escalation · {definition.escalationLevel}
        </div>
      </div>

      <Section title="Required Actions" icon={AlertTriangle} mutedClass={themeClasses.muted} accentClass={accentClasses.text}>
        <ol className="space-y-2.5">
          {definition.requiredActions.map((action, index) => (
            <li key={`${action.text}-${String(index)}`} className={`flex items-start gap-3 rounded-xl p-3 ${action.priority === 'critical' ? 'border border-[#DC2626]/30 bg-[#DC2626]/8' : ''}`}>
              <span className={`text-[10px] font-bold mt-[4px] min-w-[18px] font-mono ${accentClasses.text}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <PriorityPill priority={action.priority} />
                  <MetaPill value={action.actionType} mutedClass={themeClasses.muted} />
                  <MetaPill value={action.roleScope} mutedClass={themeClasses.muted} />
                  <MetaPill value={action.required ? 'required' : 'optional'} mutedClass={themeClasses.muted} />
                </div>
                <span className={`text-[13px] leading-relaxed ${themeClasses.text}`}>{action.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Related Policies" icon={FileText} mutedClass={themeClasses.muted} accentClass={accentClasses.text}>
        <ArtifactGrid items={definition.relatedPolicies} themeClasses={themeClasses} accentClass={accentClasses.text} onOpenReference={onOpenReference} />
      </Section>

      <Section title="Forms to Complete" icon={ClipboardCheck} mutedClass={themeClasses.muted} accentClass={accentClasses.text}>
        <ArtifactGrid items={[...definition.relatedForms, ...definition.needsMapping.filter(item => item.type === 'form')]} themeClasses={themeClasses} accentClass={accentClasses.text} onOpenReference={onOpenReference} emptyLabel="No mapped forms for this scenario." />
      </Section>

      <Section title="Workflows / Next Steps" icon={Workflow} mutedClass={themeClasses.muted} accentClass={accentClasses.text}>
        <div className="flex flex-col gap-3">
          <ArtifactGrid items={[...definition.relatedWorkflows, ...definition.needsMapping.filter(item => item.type === 'workflow')]} themeClasses={themeClasses} accentClass={accentClasses.text} onOpenReference={onOpenReference} emptyLabel="No mapped workflows for this scenario." />
          {definition.recommendedTasks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {definition.recommendedTasks.map((task) => (
                <span key={task} className={`text-[11px] px-3 py-1.5 rounded-full ${themeClasses.pill}`}>
                  {task}
                </span>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Evidence to Capture" icon={FolderPlus} mutedClass={themeClasses.muted} accentClass={accentClasses.text}>
        <ul className="space-y-2">
          {definition.evidenceToCapture.map((item) => (
            <li key={item} className={`text-[13px] leading-relaxed ${themeClasses.text}`}>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <div className={`flex items-center gap-2 text-[11px] ${themeClasses.muted}`}>
        <Quote size={13} strokeWidth={1.8} className={accentClasses.text} />
        Reference Material remains below this action layer so enforcement guidance is primary.
      </div>
    </section>
  );
}

function PriorityPill({ priority }: { priority: ActionPriority }) {
  const classes =
    priority === 'critical'
      ? 'text-[#DC2626] bg-[#DC2626]/12 border border-[#DC2626]/35'
      : priority === 'high'
        ? 'text-[#D97706] bg-[#D97706]/12 border border-[#D97706]/35'
        : priority === 'medium'
          ? 'text-[#0EA5E9] bg-[#0EA5E9]/12 border border-[#0EA5E9]/35'
          : 'text-[#6B7280] bg-[#6B7280]/10 border border-[#6B7280]/25';

  return (
    <span className={`text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-md font-mono ${classes}`}>
      {priority}
    </span>
  );
}

function MetaPill({ value, mutedClass }: { value: string; mutedClass: string }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md border border-white/10 bg-white/5 font-mono ${mutedClass}`}>
      {value}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  mutedClass,
  accentClass,
  children,
}: {
  title: string;
  icon: typeof AlertTriangle;
  mutedClass: string;
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon size={14} strokeWidth={1.75} className={accentClass} />
        <span className={`text-[10px] font-bold uppercase tracking-[0.3em] font-mono ${accentClass}`}>
          {title}
        </span>
        <span className={`text-[10px] uppercase tracking-[0.18em] font-mono ${mutedClass}`}>
          scenario-driven
        </span>
      </div>
      {children}
    </div>
  );
}

function ArtifactGrid({
  items,
  themeClasses,
  accentClass,
  onOpenReference: _onOpenReference,
  emptyLabel,
}: {
  items: ScenarioArtifactLink[];
  themeClasses: {
    text: string;
    muted: string;
    card: string;
    emptyCard: string;
  };
  accentClass: string;
  onOpenReference: (id: string) => void;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <div className={`text-[12px] ${themeClasses.muted}`}>{emptyLabel ?? 'No items available.'}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
      {items.map((item) => (
        item.status === 'verified' ? (
          <div
            key={`${item.type}:${item.id}`}
            className={`text-left rounded-xl px-3.5 py-3 transition-colors ${themeClasses.text} ${themeClasses.card}`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-[0.22em] mb-1 font-mono ${accentClass}`}>
              {item.type}
              {' '}
              ·
              {' '}
              <ReferenceLink id={item.id}>
                {item.id}
              </ReferenceLink>
            </div>
            <div className="text-[12.5px] leading-snug">{item.title}</div>
          </div>
        ) : (
          <div
            key={`${item.type}:${item.id}`}
            className={`rounded-xl px-3.5 py-3 ${themeClasses.muted} ${themeClasses.emptyCard}`}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1 font-mono">
              {item.type} · needs_mapping
            </div>
            <div className="text-[12.5px] leading-snug">{item.title}</div>
          </div>
        )
      ))}
    </div>
  );
}