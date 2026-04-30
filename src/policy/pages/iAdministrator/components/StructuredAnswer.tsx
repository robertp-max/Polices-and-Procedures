import { AlertTriangle, BookOpen, FileText, Search, ShieldAlert, TrendingDown } from 'lucide-react';
import type { Citation, LinkedReference, StructuredResponse } from '../lib/responseTypes';
import { ConfidencePill, RiskBadge } from './RiskBadge';
import { ReferenceLink } from './ReferenceLink';
import { ReferenceText } from './ReferenceText';
import { resolveReferenceRoute } from '../lib/referenceRouting';

/* ═══════════════════════════════════════════════════════════════
   StructuredAnswer — renders the top slab of the response contract:
     - directAnswer
     - operationalRequirement
     - complianceRisk + riskLevel + confidence
     - requiredArtifacts (by ID, clickable → reference open)

   Designed to read like a survey-ready briefing, not a chat reply.
   ═══════════════════════════════════════════════════════════════ */

export interface StructuredAnswerProps {
  response: StructuredResponse;
  isLight: boolean;
}

const ENFORCEMENT_LABELS: Record<string, { label: string; color: string }> = {
  condition_level: { label: 'Condition-Level Risk', color: '#B91C1C' },
  standard_level:  { label: 'Standard-Level Risk',  color: '#B45309' },
  none:            { label: 'No Enforcement Flag',   color: '#047857' },
};

export function StructuredAnswer({ response, isLight }: StructuredAnswerProps) {
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const textMuted = isLight ? '#52404B' : 'rgba(255,255,255,0.55)';
  const textStrong = isLight ? '#1F1C1B' : '#FFFFFF';
  const accent = isLight ? '#C74601' : '#FFC107';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.025)';

  const enfInfo = ENFORCEMENT_LABELS[response.enforcementLevel ?? 'none'] ?? ENFORCEMENT_LABELS.none;
  const scoreColor = response.systemConfidenceScore >= 75
    ? (isLight ? '#047857' : '#34D399')
    : response.systemConfidenceScore >= 45
      ? (isLight ? '#B45309' : '#FCD34D')
      : (isLight ? '#B91C1C' : '#FCA5A5');
  const categorizedReferences = buildRelatedReferenceSections(response.citations, response.linkedReferences);

  return (
    <section className="flex flex-col gap-4">
      {/* Direct answer block */}
      <div
        className="rounded-2xl p-5 md:p-6"
        style={{ background: surface, border: `1px solid ${border}` }}
      >
        {/* Header row: labels + badges */}
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em]"
              style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
            >
              Brad's Answer
            </span>
            <ConfidencePill level={response.confidence} isLight={isLight} />
            {/* System confidence score pill */}
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                color: scoreColor,
                background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${scoreColor}30`,
                fontFamily: "'JetBrains Mono', monospace",
              }}
              title="System Confidence Score (0–100): retrieval quality + citation count + governing policy"
            >
              {response.systemConfidenceScore}%
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {response.enforcementLevel && response.enforcementLevel !== 'none' && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                style={{
                  color: enfInfo.color,
                  background: `${enfInfo.color}14`,
                  border: `1px solid ${enfInfo.color}30`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {enfInfo.label}
              </span>
            )}
            {response.governingPolicyId && (
              <ReferenceLink
                id={response.governingPolicyId}
                isLight={isLight}
                className="text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                style={{
                  color: isLight ? '#C74601' : '#FFC107',
                  background: isLight ? '#FFF7ED' : 'rgba(255,193,7,0.08)',
                  border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.25)'}`,
                  fontFamily: "'JetBrains Mono', monospace",
                  textDecoration: 'none',
                }}
              >
                ⚖ {response.governingPolicyId}
              </ReferenceLink>
            )}
            <RiskBadge level={response.riskLevel} isLight={isLight} />
          </div>
        </div>

        <p
          className="text-base md:text-[17px] leading-relaxed"
          style={{
            color: textStrong,
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          }}
        >
          {response.directAnswer
            ? <ReferenceText text={response.directAnswer} isLight={isLight} />
            : <em style={{ color: textMuted }}>No direct answer generated.</em>}
        </p>

        {categorizedReferences.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} strokeWidth={1.75} style={{ color: textMuted }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Related References
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {categorizedReferences.map(section => (
                <div key={section.label}>
                  <p className="text-[12px] font-semibold" style={{ color: textStrong }}>{section.label}:</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {section.items.map(item => (
                      <li key={item.id} className="text-[12.5px]" style={{ color: textStrong }}>
                        <ReferenceLink id={item.id} isLight={isLight}>
                          {item.id}
                        </ReferenceLink>
                        {' '}
                        -
                        {' '}
                        {item.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {response.operationalRequirement && (
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} strokeWidth={1.75} style={{ color: textMuted }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.24em]"
                style={{
                  color: textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Operational Requirement
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: textStrong }}
            >
              <ReferenceText text={response.operationalRequirement} isLight={isLight} />
            </p>
          </div>
        )}

        {response.complianceRisk && (
          <div
            className="mt-4 flex items-start gap-3 rounded-xl p-3"
            style={{
              background: isLight
                ? (response.riskLevel === 'critical' || response.riskLevel === 'high' ? '#FEF2F2' : '#FFF7ED')
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${border}`,
            }}
          >
            <ShieldAlert
              size={16}
              strokeWidth={1.75}
              style={{
                color: response.riskLevel === 'critical' || response.riskLevel === 'high'
                  ? (isLight ? '#B91C1C' : '#FCA5A5')
                  : (isLight ? '#B45309' : '#FCD34D'),
                marginTop: 2,
                flexShrink: 0,
              }}
            />
            <div>
              <div
                className="text-[10px] font-bold uppercase tracking-[0.24em] mb-1"
                style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Compliance Risk
              </div>
              <p className="text-sm leading-relaxed" style={{ color: textStrong }}>
                <ReferenceText text={response.complianceRisk} isLight={isLight} />
              </p>
            </div>
          </div>
        )}


        {/* Compliance Impact */}
        {response.complianceImpact && (
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} strokeWidth={1.75} style={{ color: textMuted }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                Compliance Impact
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: textStrong }}>
              <ReferenceText text={response.complianceImpact} isLight={isLight} />
            </p>
          </div>
        )}
      </div>

      {/* Survey Focus */}
      {response.surveyFocus.length > 0 && (
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{ background: surface, border: `1px solid ${border}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Search size={14} strokeWidth={1.75} style={{ color: textMuted }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              What Surveyors Look For
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {response.surveyFocus.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: textStrong }}>
                <span className="mt-1 text-[10px] font-bold shrink-0" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ReferenceText text={item} isLight={isLight} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common Failure Points */}
      {response.commonFailurePoints.length > 0 && (
        <div
          className="rounded-2xl p-4 md:p-5"
          style={{
            background: isLight ? '#FFF7ED' : 'rgba(255,193,7,0.03)',
            border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.14)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} strokeWidth={1.75} style={{ color: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}>
              Common Failure Points
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {response.commonFailurePoints.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: textStrong }}>
                <span className="mt-1 text-[9px] font-bold shrink-0 rounded" style={{ color: isLight ? '#B91C1C' : '#FCA5A5', fontFamily: "'JetBrains Mono', monospace" }}>
                  ✕
                </span>
                <ReferenceText text={item} isLight={isLight} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.requiredArtifacts.length > 0 && (
        <div
          className="rounded-2xl p-4 md:p-5 flex flex-wrap items-center gap-2"
          style={{
            background: isLight ? '#FFFAF7' : 'rgba(255,193,7,0.045)',
            border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.18)'}`,
          }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.75}
            style={{ color: accent, marginRight: 4 }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.24em] mr-2"
            style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
          >
            Required Artifacts
          </span>
          {response.requiredArtifacts.map(id => (
            <ReferenceLink
              key={id}
              id={id}
              isLight={isLight}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
              style={{
                color: isLight ? '#C74601' : '#FFC107',
                background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLight ? '#FFD5BF' : 'rgba(255,193,7,0.28)'}`,
                fontFamily: "'JetBrains Mono', monospace",
                textDecoration: 'none',
              }}
            >
              {id}
            </ReferenceLink>
          ))}
        </div>
      )}
    </section>
  );
}

function buildRelatedReferenceSections(citations: Citation[], linkedReferences: LinkedReference[]) {
  const refs = new Map<string, { id: string; title: string }>();

  for (const citation of citations) {
    refs.set(citation.policyId, { id: citation.policyId, title: citation.title });
  }
  for (const linked of linkedReferences) {
    if (!refs.has(linked.id)) {
      refs.set(linked.id, { id: linked.id, title: linked.title });
    }
  }

  const policies: Array<{ id: string; title: string }> = [];
  const workflows: Array<{ id: string; title: string }> = [];
  const forms: Array<{ id: string; title: string }> = [];
  const events: Array<{ id: string; title: string }> = [];
  const tasks: Array<{ id: string; title: string }> = [];

  for (const entry of refs.values()) {
    const route = resolveReferenceRoute(entry.id);
    if (route.type === 'policy') policies.push(entry);
    if (route.type === 'workflow') workflows.push(entry);
    if (route.type === 'form') forms.push(entry);
    if (route.type === 'event') events.push(entry);
    if (route.type === 'task') tasks.push(entry);
  }

  const sections: Array<{ label: 'Policies' | 'Workflows' | 'Forms' | 'Events' | 'Tasks'; items: Array<{ id: string; title: string }> }> = [];
  if (policies.length > 0) sections.push({ label: 'Policies', items: policies });
  if (workflows.length > 0) sections.push({ label: 'Workflows', items: workflows });
  if (forms.length > 0) sections.push({ label: 'Forms', items: forms });
  if (events.length > 0) sections.push({ label: 'Events', items: events });
  if (tasks.length > 0) sections.push({ label: 'Tasks', items: tasks });
  return sections;
}
