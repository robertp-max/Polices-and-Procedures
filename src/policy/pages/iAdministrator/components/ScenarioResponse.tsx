import {
  AlertOctagon,
  AlertTriangle,
  BookMarked,
  ChevronRight,
  CircleHelp,
  Flag,
  ShieldAlert,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import type { ScenarioMapping } from '../lib/responseTypes';

/* ═══════════════════════════════════════════════════════════════
   ScenarioResponse
   ----------------------------------------------------------------
   The card Brad renders when input maps to a compliance scenario.
   It replaces the "No Answer Found" failure for high-stakes inputs
   and augments the standard answer for general queries.

   Contract: never claim the corpus supports something it doesn't.
   The card makes it clear that the scenario is DERIVED from the
   taxonomy — it is compliance intelligence, not a retrieval hit.
   ═══════════════════════════════════════════════════════════════ */

export interface ScenarioResponseProps {
  scenario: ScenarioMapping;
  /** True when retrieval returned no corpus hits (show the mapping banner). */
  isFallback?: boolean;
  isLight: boolean;
}

const SEVERITY_PALETTE: Record<
  ScenarioMapping['severity'],
  { bg: string; bgLight: string; accent: string; label: string; Icon: typeof AlertOctagon }
> = {
  critical: { bg: 'rgba(239,68,68,0.12)', bgLight: '#FEF2F2', accent: '#DC2626', label: 'CRITICAL',  Icon: AlertOctagon },
  high:     { bg: 'rgba(245,158,11,0.14)', bgLight: '#FFF7ED', accent: '#D97706', label: 'HIGH',      Icon: AlertTriangle },
  moderate: { bg: 'rgba(56,189,248,0.12)',  bgLight: '#EFF6FF', accent: '#2563EB', label: 'MODERATE',  Icon: Flag },
  low:      { bg: 'rgba(148,163,184,0.14)', bgLight: '#F8FAFC', accent: '#475569', label: 'LOW',       Icon: Flag },
};

export function ScenarioResponse({ scenario, isFallback, isLight }: ScenarioResponseProps) {
  const palette = SEVERITY_PALETTE[scenario.severity];
  const border = isLight ? '#E5E4E3' : 'rgba(255,255,255,0.09)';
  const surface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
  const text = isLight ? '#1F1C1B' : '#E6E6E6';
  const muted = isLight ? '#6B6B6B' : 'rgba(255,255,255,0.55)';
  const bannerBg = isLight ? palette.bgLight : palette.bg;

  return (
    <section
      className="rounded-2xl overflow-hidden"
      style={{
        background: surface,
        border: `1px solid ${border}`,
        boxShadow: scenario.severity === 'critical'
          ? `0 0 0 1px ${palette.accent}33, 0 12px 28px -12px ${palette.accent}55`
          : undefined,
      }}
    >
      {/* Header strip ─ category + severity */}
      <div
        className="flex items-start gap-3 px-5 py-4"
        style={{
          background: bannerBg,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 36, height: 36, background: `${palette.accent}22`, color: palette.accent }}
        >
          <palette.Icon size={18} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.28em] mb-1"
            style={{ color: palette.accent, fontFamily: "'JetBrains Mono', monospace" }}
          >
            Scenario · {palette.label} · {scenario.label}
          </div>
          <div className="text-[14px] font-semibold leading-snug" style={{ color: text }}>
            {scenario.headline || scenario.summary}
          </div>
          {scenario.summary && scenario.headline && (
            <div className="text-[12px] mt-1.5 leading-relaxed" style={{ color: muted }}>
              {scenario.summary}
            </div>
          )}
          {(isFallback || scenario.matchNote) && (
            <div
              className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {scenario.matchNote ??
                'No exact policy match — applying closest regulatory scenario mapping.'}
            </div>
          )}
        </div>

        <div
          className="text-[9.5px] font-bold uppercase tracking-[0.28em] px-2 py-1 rounded-md whitespace-nowrap"
          style={{
            color: palette.accent,
            background: `${palette.accent}14`,
            border: `1px solid ${palette.accent}33`,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          title={`Classifier confidence: ${scenario.confidence}`}
        >
          conf · {scenario.confidence}
        </div>
      </div>

      {/* Body ─ three columns collapsed on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr]">
        {/* Immediate actions */}
        {scenario.immediateActions.length > 0 && (
          <ColumnSection
            title="Immediate Actions"
            accent={palette.accent}
            isLight={isLight}
            separator="right"
          >
            <ol className="space-y-2">
              {scenario.immediateActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold shrink-0 mt-[3px]"
                    style={{
                      color: palette.accent,
                      fontFamily: "'JetBrains Mono', monospace",
                      minWidth: 18,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[12.5px] leading-relaxed" style={{ color: text }}>
                    {action}
                  </span>
                </li>
              ))}
            </ol>
          </ColumnSection>
        )}

        {/* Required workflows */}
        {scenario.requiredWorkflows.length > 0 && (
          <ColumnSection
            title="Required Workflows"
            accent={palette.accent}
            isLight={isLight}
            separator="right"
          >
            <ul className="space-y-2">
              {scenario.requiredWorkflows.map((wf, i) => (
                <li key={i}>
                  <div className="flex items-start gap-2">
                    <WorkflowIcon
                      size={12}
                      strokeWidth={2}
                      className="shrink-0 mt-[3px]"
                      style={{ color: palette.accent }}
                    />
                    <div className="min-w-0">
                      <div className="text-[12.5px] font-medium leading-snug" style={{ color: text }}>
                        {wf.label}
                      </div>
                      <div
                        className="text-[10.5px] mt-0.5"
                        style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {wf.id}
                      </div>
                      {wf.regulatoryDriver && (
                        <div className="text-[10.5px] mt-0.5 italic" style={{ color: muted }}>
                          {wf.regulatoryDriver}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ColumnSection>
        )}

        {/* Compliance notes + domains */}
        <ColumnSection
          title="Compliance Notes"
          accent={palette.accent}
          isLight={isLight}
        >
          {scenario.complianceNotes.length > 0 ? (
            <ul className="space-y-1.5 mb-3">
              {scenario.complianceNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldAlert
                    size={11}
                    strokeWidth={2}
                    className="shrink-0 mt-[3px]"
                    style={{ color: palette.accent }}
                  />
                  <span className="text-[12px] leading-relaxed" style={{ color: text }}>
                    {note}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[12px] mb-3" style={{ color: muted }}>
              No additional compliance notes for this scenario.
            </div>
          )}

          {scenario.domains.length > 0 && (
            <div>
              <div
                className="text-[9.5px] font-bold uppercase tracking-[0.24em] mb-1.5"
                style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Domains
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scenario.domains.map(d => (
                  <span
                    key={d}
                    className="text-[10px] font-semibold uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
                    style={{
                      color: palette.accent,
                      background: `${palette.accent}14`,
                      border: `1px solid ${palette.accent}2A`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {scenario.relatedCategories.length > 0 && (
            <div className="mt-3">
              <div
                className="text-[9.5px] font-bold uppercase tracking-[0.24em] mb-1.5"
                style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
              >
                Also Matches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scenario.relatedCategories.map(c => (
                  <span
                    key={c}
                    className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded-md"
                    style={{
                      color: muted,
                      border: `1px solid ${border}`,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {c.replace(/_/g, ' ').toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ColumnSection>
      </div>

      {/* Related Policies / Controls + Missing Information row */}
      {(scenario.relatedPolicies.length > 0 || scenario.missingInformation.length > 0) && (
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ borderTop: `1px solid ${border}` }}
        >
          {scenario.relatedPolicies.length > 0 && (
            <ColumnSection
              title="Related Policies / Controls"
              accent={palette.accent}
              isLight={isLight}
              separator="right"
            >
              <ul className="space-y-2">
                {scenario.relatedPolicies.map(p => (
                  <li key={p.id} className="flex items-start gap-2">
                    <BookMarked
                      size={12}
                      strokeWidth={2}
                      className="shrink-0 mt-[3px]"
                      style={{ color: palette.accent }}
                    />
                    <div className="min-w-0">
                      <div className="text-[12.5px] leading-snug" style={{ color: text }}>
                        <span
                          className="font-semibold"
                          style={{ fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {p.id}
                        </span>
                        <span className="mx-1.5" style={{ color: muted }}>—</span>
                        <span>{p.name}</span>
                      </div>
                      <div
                        className="text-[10.5px] mt-0.5 flex items-center gap-1.5"
                        style={{ color: muted, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {p.domain && <span>{p.domain}</span>}
                        {p.isDomainFallback && (
                          <span
                            className="px-1.5 py-[1px] rounded uppercase tracking-[0.16em]"
                            style={{
                              color: muted,
                              border: `1px solid ${border}`,
                              background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                            }}
                          >
                            domain fallback
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ColumnSection>
          )}

          {scenario.missingInformation.length > 0 && (
            <ColumnSection
              title="Missing Information"
              accent={palette.accent}
              isLight={isLight}
            >
              <ul className="space-y-2">
                {scenario.missingInformation.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CircleHelp
                      size={12}
                      strokeWidth={2}
                      className="shrink-0 mt-[3px]"
                      style={{ color: palette.accent }}
                    />
                    <span className="text-[12.5px] leading-relaxed" style={{ color: text }}>
                      {q}
                    </span>
                  </li>
                ))}
              </ul>
            </ColumnSection>
          )}
        </div>
      )}

      {/* Footer ─ matched triggers */}
      {scenario.matchedTriggers.length > 0 && (
        <div
          className="px-5 py-2.5 text-[10.5px] flex items-center gap-2 flex-wrap"
          style={{
            borderTop: `1px solid ${border}`,
            color: muted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <ChevronRight size={11} strokeWidth={2} />
          <span className="uppercase tracking-[0.2em] font-semibold">Triggers</span>
          {scenario.matchedTriggers.map((t, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded"
              style={{ background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */

function ColumnSection({
  title,
  children,
  accent,
  isLight,
  separator,
}: {
  title: string;
  children: React.ReactNode;
  accent: string;
  isLight: boolean;
  separator?: 'right';
}) {
  const border = isLight ? '#EEECEA' : 'rgba(255,255,255,0.07)';
  return (
    <div
      className="p-5"
      style={{
        borderRight: separator === 'right' ? `1px solid ${border}` : undefined,
      }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3"
        style={{ color: accent, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export default ScenarioResponse;
