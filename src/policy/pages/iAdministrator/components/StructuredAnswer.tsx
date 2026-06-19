import { AlertTriangle, BookOpen, FileText, Search, ShieldAlert, TrendingDown } from 'lucide-react';
import type { Citation, LinkedReference, StructuredResponse } from '../lib/responseTypes';
import { ConfidencePill, RiskBadge } from './RiskBadge';
import { ReferenceLink } from './ReferenceLink';
import { ReferenceText } from './ReferenceText';
import { resolveIaReference, warnUnresolvedIaReference } from '../lib/referenceResolver';

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

  const isLifeSafety = !!response.scenario?.lifeSafetyFlag || response.riskLevel === 'critical' && (response.directAnswer || '').startsWith('EMERGENCY');
  const isHumanStaffSupport = isLifeSafety ||
    /i'm sorry that happened|that is serious|step away from the client|notify your supervisor.*immediately|do you feel safe right now|are you safe and out/i.test(response.directAnswer || '') ||
    (response.meta as any)?.humanFirstOverride === true ||
    (response.meta as any)?.bradHumanLayer === 'active';

  // FINAL DEFENSIVE GUARD in render: if bad app-data phrase somehow survived for a human case, force clean human text
  const blockedAppDataDumpPhrase = [
    'App data matches were found in live tasks',
    'events',
    'and workflows.',
  ].join(', ');
  let displayDirectAnswer = response.directAnswer;
  if ((response.directAnswer || '').includes(blockedAppDataDumpPhrase) && isHumanStaffSupport) {
    displayDirectAnswer = "I hear you — this sounds like a high-stress field situation. Are you safe right now? Step back if needed and contact your supervisor immediately. Once you're clear, we can document the facts objectively. Are you in a safe place?";
  }
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
            {!isHumanStaffSupport && <ConfidencePill level={response.confidence} isLight={isLight} />}
            {/* System confidence score pill — hidden or demoted for human staff safety responses in preview */}
            {!isHumanStaffSupport && (
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
            )}
            {isHumanStaffSupport && (
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded" style={{ color: '#DC2626', border: '1px solid #DC2626', fontFamily: "'JetBrains Mono', monospace" }}>
                PREVIEW GUIDANCE — VERIFY WITH SUPERVISOR
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {response.enforcementLevel && response.enforcementLevel !== 'none' && !isLifeSafety && !isHumanStaffSupport && (
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
            {isHumanStaffSupport && (
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded" style={{ color: '#DC2626', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
                {isLifeSafety ? 'ACTIVE SAFETY CASE • CRITICAL' : 'STAFF SAFETY • HUMAN FIRST'}
              </span>
            )}
            {isLifeSafety && (
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded"
                style={{
                  color: '#DC2626',
                  background: 'rgba(220,38,38,0.12)',
                  border: `1px solid rgba(220,38,38,0.35)`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                EMERGENCY / LIFE SAFETY — CRITICAL
              </span>
            )}
            {response.governingPolicyId && !isLifeSafety && (
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
            {!isLifeSafety && <RiskBadge level={response.riskLevel} isLight={isLight} />}
            {isLifeSafety && <span className="text-[9px] font-bold" style={{ color: '#DC2626' }}>CRITICAL — Safety first</span>}
          </div>
        </div>

        <p
          className="text-base md:text-[17px] leading-relaxed"
          style={{
            color: textStrong,
            fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          }}
          data-brad-human-layer={isHumanStaffSupport ? 'active' : undefined}
        >
          {displayDirectAnswer
            ? <ReferenceText text={displayDirectAnswer} isLight={isLight} />
            : <em style={{ color: textMuted }}>No direct answer generated.</em>}
          {/* Dev-only visible proof marker for Plan B hard override - remove or hide in prod */}
          {isHumanStaffSupport && (import.meta as any).env?.DEV && (
            <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: '8px' }}>(HF override active)</span>
          )}
        </p>

        {categorizedReferences.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${border}` }}>
            <details open={!isLifeSafety && !isHumanStaffSupport}>
              <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.24em] flex items-center gap-2 mb-2" style={{ color: textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                <FileText size={14} strokeWidth={1.75} style={{ color: textMuted }} />
                {(isLifeSafety || isHumanStaffSupport) ? 'Documentation follow-up (only after safety is confirmed — click to expand)' : 'Related References'}
              </summary>
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
            </details>
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
    const resolved = resolveIaReference({ id: entry.id, title: entry.title, source: 'StructuredAnswer.relatedReferences' });
    if (!resolved.resolved) {
      warnUnresolvedIaReference(resolved);
      continue;
    }
    const item = { id: resolved.id, title: entry.title || resolved.title };
    if (resolved.resolvedType === 'policy') policies.push(item);
    if (resolved.resolvedType === 'workflow') workflows.push(item);
    if (resolved.resolvedType === 'form') forms.push(item);
    if (resolved.resolvedType === 'event') events.push(item);
  }

  const sections: Array<{ label: 'Policies' | 'Workflows' | 'Forms' | 'Events' | 'Tasks'; items: Array<{ id: string; title: string }> }> = [];
  if (policies.length > 0) sections.push({ label: 'Policies', items: policies });
  if (workflows.length > 0) sections.push({ label: 'Workflows', items: workflows });
  if (forms.length > 0) sections.push({ label: 'Forms', items: forms });
  if (events.length > 0) sections.push({ label: 'Events', items: events });
  if (tasks.length > 0) sections.push({ label: 'Tasks', items: tasks });
  return sections;
}
