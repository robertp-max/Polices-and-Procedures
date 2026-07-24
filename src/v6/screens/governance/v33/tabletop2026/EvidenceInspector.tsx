// Board Book exhibit inspector: shows one exhibit's full face (badges,
// summary, details, source-posture note), lets the learner cite it toward
// the current decision, annotate it, and open a side-by-side comparator
// against a second exhibit — the primary tool for catching the packet's
// data-quality traps (census discontinuity, identity collision, the
// unverified cover memo) rather than accepting the packet's surface claims.

import { useMemo, useState } from 'react';
import type { Exhibit, Quarter } from './engine/caseTypes';
import { isWithinCutoff } from './engine/sourceCutoff';
import {
  AlertTriangle,
  BookMarked,
  Check,
  GitCompare,
  Info,
  NotebookPen,
  X,
} from 'lucide-react';

export interface EvidenceInspectorProps {
  /** Full exhibit pool, so the inspector can resolve the selected + comparison ids. */
  exhibits: Exhibit[];
  /** The quarter this matter is scoped to — exhibits dated after it are flagged as cutoff violations. */
  caseQuarter: Quarter;
  selectedExhibitId: string | null;
  onSelectExhibit?: (id: string) => void;
  /** Exhibit ids already cited toward the active decision node. */
  citedExhibitIds?: string[];
  onToggleCite?: (id: string) => void;
  comparisonExhibitId?: string | null;
  onSetComparisonExhibitId?: (id: string | null) => void;
  annotationsByExhibitId?: Record<string, string>;
  onAnnotate?: (id: string, note: string) => void;
  /** Ids the current decision requires — rendered as a "still needed" reminder when not yet cited. */
  requiredEvidenceIds?: string[];
}

function badge(kind: string, value: string, label: string) {
  return (
    <span className={`bs-badge ${kind}-${value}`}>{label}</span>
  );
}

function exhibitBadges(ex: Exhibit) {
  return (
    <div className="bs-inspector-badges">
      {badge('posture', ex.posture, ex.posture.replace('_', ' '))}
      {badge('conf', ex.confidentiality, ex.confidentiality.replace('_', ' '))}
      {badge('val', ex.validationState, ex.validationState)}
      {badge('rel', ex.relevance, ex.relevance.replace('_', ' '))}
    </div>
  );
}

function ExhibitPane(props: {
  exhibit: Exhibit;
  caseQuarter: Quarter;
  cited: boolean;
  onToggleCite?: () => void;
  annotation?: string;
  onAnnotate?: (note: string) => void;
  compact?: boolean;
}) {
  const { exhibit, caseQuarter, cited, onToggleCite, annotation, onAnnotate, compact } = props;
  const cutoffViolation = !isWithinCutoff(exhibit.quarter, caseQuarter);

  return (
    <div className="bs-inspector">
      <header>
        <div>
          <p className="bs-kicker">{exhibit.section}</p>
          <strong>{exhibit.title}</strong>
        </div>
        {exhibitBadges(exhibit)}
      </header>
      <div className="bs-inspector-body">
        {exhibit.sourceLabel && (
          <p className="bs-supplemental-flag" role="note">
            <Info size={14} aria-hidden="true" /> {exhibit.sourceLabel}
          </p>
        )}
        {cutoffViolation && (
          <div className="bs-contradiction" role="alert">
            <AlertTriangle size={16} aria-hidden="true" />
            <div>
              <strong>Dated after this matter's source cutoff</strong>
              <p>
                This exhibit is dated {exhibit.asOfDate} in {exhibit.quarter}, after the cutoff for this
                matter ({caseQuarter}). It must not be cited to support a decision this quarter.
              </p>
            </div>
          </div>
        )}
        <p>{exhibit.summary}</p>
        {!compact && exhibit.details.length > 0 && (
          <ul>
            {exhibit.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
        <div className="bs-inspector-source-note">
          <span>Source: {exhibit.sourceId}</span>
          <span aria-hidden="true">·</span>
          <span>As of {exhibit.asOfDate}</span>
        </div>
        {(onToggleCite || onAnnotate) && (
          <div className="bs-motion-builder">
            {onToggleCite && (
              <button
                type="button"
                className={`bs-chip${cited ? ' selected' : ''}`}
                aria-pressed={cited}
                onClick={onToggleCite}
              >
                {cited ? <Check size={12} aria-hidden="true" /> : <BookMarked size={12} aria-hidden="true" />}
                {' '}
                {cited ? 'Cited toward this decision' : 'Cite this exhibit'}
              </button>
            )}
            {onAnnotate && (
              <div className="bs-motion-field">
                <label htmlFor={`bs-annotate-${exhibit.id}`}>
                  <NotebookPen size={11} aria-hidden="true" /> Reviewer annotation
                </label>
                <textarea
                  id={`bs-annotate-${exhibit.id}`}
                  value={annotation ?? ''}
                  onChange={(e) => onAnnotate(e.target.value)}
                  placeholder="Note what this exhibit does or does not establish…"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvidenceInspector(props: EvidenceInspectorProps) {
  const {
    exhibits,
    caseQuarter,
    selectedExhibitId,
    citedExhibitIds = [],
    onToggleCite,
    comparisonExhibitId = null,
    onSetComparisonExhibitId,
    annotationsByExhibitId = {},
    onAnnotate,
    requiredEvidenceIds = [],
  } = props;

  const [pendingCompareId, setPendingCompareId] = useState('');

  const byId = useMemo(() => new Map<string, Exhibit>(exhibits.map((e) => [e.id, e])), [exhibits]);
  const selected = selectedExhibitId ? byId.get(selectedExhibitId) : undefined;
  const comparison = comparisonExhibitId ? byId.get(comparisonExhibitId) : undefined;

  const stillNeeded = requiredEvidenceIds.filter((id) => !citedExhibitIds.includes(id));

  if (!selected) {
    return (
      <div className="bs-inspector">
        <div className="bs-inspector-body">
          <p>Select an exhibit from the Board Book to inspect it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bs-boardtable" style={{ gap: 12 }}>
      {stillNeeded.length > 0 && (
        <div className="bs-inspector-source-note" role="status">
          <Info size={13} aria-hidden="true" />
          <span>
            Still needed for this decision: {stillNeeded.join(', ')}
          </span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: comparison ? '1fr 1fr' : '1fr',
          gap: 12,
          alignItems: 'start',
        }}
      >
        <ExhibitPane
          exhibit={selected}
          caseQuarter={caseQuarter}
          cited={citedExhibitIds.includes(selected.id)}
          onToggleCite={onToggleCite ? () => onToggleCite(selected.id) : undefined}
          annotation={annotationsByExhibitId[selected.id]}
          onAnnotate={onAnnotate ? (note) => onAnnotate(selected.id, note) : undefined}
        />
        {comparison && (
          <ExhibitPane
            exhibit={comparison}
            caseQuarter={caseQuarter}
            cited={citedExhibitIds.includes(comparison.id)}
            onToggleCite={onToggleCite ? () => onToggleCite(comparison.id) : undefined}
            annotation={annotationsByExhibitId[comparison.id]}
            onAnnotate={onAnnotate ? (note) => onAnnotate(comparison.id, note) : undefined}
            compact
          />
        )}
      </div>

      {onSetComparisonExhibitId && (
        <div className="bs-rail-card">
          <header>
            <strong>
              <GitCompare size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Comparator
            </strong>
            {comparison && (
              <button
                type="button"
                className="bs-rail-action secondary"
                style={{ width: 'auto', padding: '6px 10px' }}
                onClick={() => onSetComparisonExhibitId(null)}
              >
                <X size={12} aria-hidden="true" /> Clear
              </button>
            )}
          </header>
          <div className="bs-motion-field">
            <label htmlFor="bs-compare-select">Compare exhibit {selected.id} against</label>
            <select
              id="bs-compare-select"
              value={pendingCompareId}
              onChange={(e) => {
                setPendingCompareId(e.target.value);
                if (e.target.value) onSetComparisonExhibitId(e.target.value);
              }}
            >
              <option value="">Select an exhibit to compare…</option>
              {exhibits
                .filter((e) => e.id !== selected.id)
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} — {e.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
