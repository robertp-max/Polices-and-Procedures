// Center "Board Table" workspace — the one current matter: editorial title +
// situation narrative, KPI stat tiles (with sparkline + below-threshold red),
// contradiction highlights, the Evidence Inspector, and (for option-based
// decision kinds) the full-text decision prompt. Structured/motion-style
// kinds are answered in the Decision & Record rail instead — this panel only
// carries a short pointer to it for those nodes.
//
// NOTE: VotePanel and ExecutiveSessionWorkspace (also built under group U3)
// are shaped around the facilitated-group model (Participant[], VoteMatrixEntry,
// per-matter MatterClassification) rather than a single learner answering one
// DecisionNode's flat options — reusing them here would require fabricating
// a fake single-participant roster with no real benefit, so this workspace
// renders every option-based DecisionNode (including session_classification /
// proceed_decision / disposition / board_vs_management) through the same
// generic option list below. The facilitated GroupSession screens are the
// real consumers of VotePanel/ExecutiveSessionWorkspace.
//
// Ground-up build for tabletop2026/ — does not reuse ../tabletop/* markup.

import { useMemo, useState } from 'react';
import { AlertTriangle, Eye } from 'lucide-react';
import type { CasePack, DecisionNode, Exhibit, NodeSelection } from './engine/caseTypes';
import EvidenceInspector from './EvidenceInspector';

interface KpiSeries {
  exhibitId: string;
  label: string;
  values: number[];
  status: 'within' | 'below' | 'critical';
}

/** Data-driven KPI derivation: pulls percentage series out of an exhibit's own
 *  summary text (no per-case special-casing) so this works for any CasePack. */
function deriveKpis(exhibits: Exhibit[]): KpiSeries[] {
  const series: KpiSeries[] = [];
  for (const exhibit of exhibits) {
    const matches = [...exhibit.summary.matchAll(/(-?\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
    if (matches.length < 2) continue;
    let status: KpiSeries['status'] = 'within';
    const text = exhibit.summary.toLowerCase();
    if (text.includes('critical')) status = 'critical';
    else if (text.includes('below') || text.includes('worsening') || text.includes('deteriorat')) status = 'below';
    else if (exhibit.validationState === 'conflicting') status = 'critical';
    series.push({ exhibitId: exhibit.id, label: exhibit.title, values: matches.slice(-6), status });
  }
  return series.slice(0, 4);
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 60 + 2;
      const y = 22 - ((v - min) / span) * 20;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg className="bs-kpi-spark" viewBox="0 0 64 24" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

export interface BoardTableWorkspaceProps {
  casePack: CasePack;
  node: DecisionNode;
  roundLabel: string;
  selection: NodeSelection | undefined;
  activeExhibitId: string | null;
  onSelectExhibit: (exhibitId: string) => void;
  onToggleOption: (optionId: string) => void;
  onCiteEvidence: (exhibitId: string) => void;
  onRemoveCitedEvidence: (exhibitId: string) => void;
  locked: boolean;
}

export default function BoardTableWorkspace({
  casePack,
  node,
  roundLabel,
  selection,
  activeExhibitId,
  onSelectExhibit,
  onToggleOption,
  onCiteEvidence,
  onRemoveCitedEvidence,
  locked,
}: BoardTableWorkspaceProps) {
  const [comparisonExhibitId, setComparisonExhibitId] = useState<string | null>(null);
  const [annotationsByExhibitId, setAnnotationsByExhibitId] = useState<Record<string, string>>({});

  const exhibitById = useMemo(() => new Map(casePack.exhibits.map((e) => [e.id, e])), [casePack.exhibits]);

  const requiredExhibits = useMemo(
    () => node.requiredEvidenceIds.map((id) => exhibitById.get(id)).filter((e): e is Exhibit => Boolean(e)),
    [node.requiredEvidenceIds, exhibitById],
  );

  const kpis = useMemo(() => deriveKpis(requiredExhibits), [requiredExhibits]);
  const contradictions = useMemo(() => requiredExhibits.filter((e) => e.relevance === 'conflicting'), [requiredExhibits]);
  const citedExhibitIds = selection?.evidenceCited ?? [];
  const selectedOptionIds = selection?.selectedOptionIds ?? [];

  function toggleCite(exhibitId: string) {
    if (citedExhibitIds.includes(exhibitId)) onRemoveCitedEvidence(exhibitId);
    else onCiteEvidence(exhibitId);
  }

  return (
    <section className="bs-boardtable" aria-label="Board Table">
      <header className="bs-matter-head">
        <span className="bs-kicker">
          {casePack.title} · {roundLabel}
        </span>
        <h2 className="bs-editorial">{node.title}</h2>
      </header>

      <div className="bs-matter-narrative">
        <p>{node.prompt}</p>
      </div>

      {kpis.length > 0 ? (
        <div className="bs-kpi-row">
          {kpis.map((kpi) => (
            <div key={kpi.exhibitId} className={`bs-kpi ${kpi.status}`}>
              <header>
                <span>{kpi.label}</span>
              </header>
              <div className="bs-kpi-main">
                <strong>{kpi.values[kpi.values.length - 1]}%</strong>
                <Sparkline values={kpi.values} />
              </div>
              <footer className={kpi.status}>{kpi.status === 'within' ? 'Within target' : kpi.status === 'below' ? 'Below target' : 'Critical'}</footer>
            </div>
          ))}
        </div>
      ) : null}

      {contradictions.map((exhibit) => (
        <div key={exhibit.id} className="bs-contradiction">
          <AlertTriangle size={16} />
          <div>
            <strong>{exhibit.title}</strong>
            <p>{exhibit.summary}</p>
            <button
              type="button"
              className="bs-rail-action secondary"
              style={{ marginTop: 8, width: 'auto', padding: '6px 12px' }}
              onClick={() => onSelectExhibit(exhibit.id)}
            >
              <Eye size={12} style={{ marginRight: 6 }} /> View
            </button>
          </div>
        </div>
      ))}

      <EvidenceInspector
        exhibits={casePack.exhibits}
        caseQuarter={casePack.quarter}
        selectedExhibitId={activeExhibitId}
        onSelectExhibit={onSelectExhibit}
        citedExhibitIds={citedExhibitIds}
        onToggleCite={toggleCite}
        comparisonExhibitId={comparisonExhibitId}
        onSetComparisonExhibitId={setComparisonExhibitId}
        annotationsByExhibitId={annotationsByExhibitId}
        onAnnotate={(id, note) => setAnnotationsByExhibitId((prev) => ({ ...prev, [id]: note }))}
        requiredEvidenceIds={node.requiredEvidenceIds}
      />

      {node.options && node.options.length > 0 ? (
        <div className="bs-decision-prompt">
          <header>
            <h3>Board Determination</h3>
          </header>
          <p className="bs-prompt-text">Select every option the record supports.</p>
          <div className="bs-option-list">
            {node.options.map((opt) => {
              const isSelected = selectedOptionIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`bs-option${isSelected ? ' selected' : ''}`}
                  onClick={() => onToggleOption(opt.id)}
                  disabled={locked}
                  aria-pressed={isSelected}
                >
                  <span className="bs-option-mark" aria-hidden="true">{isSelected ? '✓' : ''}</span>
                  <span className="bs-option-text">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bs-decision-prompt">
          <p className="bs-prompt-text">
            Record this decision using the Motion Builder in the Decision &amp; Record rail, citing the exhibits above.
          </p>
        </div>
      )}
    </section>
  );
}
