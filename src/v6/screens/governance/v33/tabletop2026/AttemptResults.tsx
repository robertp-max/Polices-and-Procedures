// Attempt results screen (mockup 3, left column) — Governing Body Boardroom
// Simulation. Renders the score donut, pass/fail verdict, dimension
// breakdown, failed-competency roster, critical-error explanation (with
// where-it-occurred), and the full per-node diagnostic debrief — on a PASS
// as well as a fail, per spec. On a failed attempt it surfaces the
// "Choose your next step" panel and owns the RemediationChoiceDialog that
// hands off to guided remediation / another attempt / evidence review.
//
// Ground-up build for tabletop2026/ — does NOT reuse ../tabletop/* UI.

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  XCircle,
} from 'lucide-react';
import type {
  AttemptScore,
  CasePack,
  DecisionRound,
  ScoreDimensionKey,
  TabletopDiagnostic,
} from './engine/caseTypes';
import { SCORE_DIMENSION_WEIGHTS, TOTAL_POSSIBLE_SCORE } from './engine/caseTypes';
import RemediationChoiceDialog from './RemediationChoiceDialog';

const DIMENSION_LABELS: Record<ScoreDimensionKey, string> = {
  evidence_integrity: 'Evidence Integrity',
  meeting_legality: 'Meeting Legality',
  qapi_judgment: 'QAPI Judgment',
  workflow_authority: 'Workflow Authority',
  decision_proportionality: 'Decision Proportionality',
  records_forms: 'Records & Forms',
  surveyor_transfer: 'Surveyor & Transfer',
};

const RESULT_LABELS: Record<TabletopDiagnostic['result'], string> = {
  correct: 'Correct',
  partial: 'Partial Credit',
  incorrect: 'Incorrect',
  critical_failure: 'Critical Failure',
};

const RESULT_ICONS: Record<TabletopDiagnostic['result'], typeof CheckCircle2> = {
  correct: CheckCircle2,
  partial: ClipboardList,
  incorrect: XCircle,
  critical_failure: AlertTriangle,
};

function formatCompetencyId(id: string): string {
  return id
    .split('-')
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(' ');
}

function formatRound(round: DecisionRound): string {
  return round === 0 ? 'Pre-Meeting Intake' : `Round ${round}`;
}

function ScoreDonut({ total, passed }: { total: number; passed: boolean }) {
  const pct = Math.max(0, Math.min(100, Math.round((total / TOTAL_POSSIBLE_SCORE) * 100)));
  const r = 74;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: 168, height: 168, flex: 'none' }}>
      <svg className={`bs-score-donut${passed ? '' : ' failed'}`} viewBox="0 0 168 168" role="img" aria-label={`Score ${pct} percent, ${total} of ${TOTAL_POSSIBLE_SCORE} points`}>
        <circle className="track" cx={84} cy={84} r={r} />
        <circle
          className="value"
          cx={84}
          cy={84}
          r={r}
          style={{ strokeDasharray: c, strokeDashoffset: offset }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div className="bs-score-donut-label">
          <div style={{ fontSize: 34, lineHeight: 1 }}>{pct}%</div>
          <div style={{ fontSize: 10, opacity: 0.72, marginTop: 4, letterSpacing: '.06em' }}>
            {total} / {TOTAL_POSSIBLE_SCORE}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface AttemptResultsProps {
  casePack: CasePack;
  score: AttemptScore;
  diagnostics: TabletopDiagnostic[];
  /** 1-indexed attempt count for this case pack (used in messaging only). */
  attemptNumber: number;
  /** Total failed attempts on this matter so far, including this one if it failed — feeds the choice dialog's messaging and RemediationCenter's tier. */
  failureCount: number;
  onRetryFullCase: () => void;
  onStartGuidedRemediation: () => void;
  onReviewEvidence: (exhibitId?: string) => void;
  /** Passed-attempt continuation (e.g. return to hub / advance to next quarter). Optional — only rendered when supplied. */
  onContinue?: () => void;
}

export default function AttemptResults({
  casePack,
  score,
  diagnostics,
  attemptNumber,
  failureCount,
  onRetryFullCase,
  onStartGuidedRemediation,
  onReviewEvidence,
  onContinue,
}: AttemptResultsProps) {
  const [choiceOpen, setChoiceOpen] = useState(false);

  const nodesById = useMemo(() => new Map(casePack.decisionNodes.map((n) => [n.id, n])), [casePack.decisionNodes]);

  const failedCompetencyIds = useMemo(() => {
    const set = new Set<string>();
    diagnostics.forEach((d) => {
      if (d.result !== 'correct') d.competencyIds.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [diagnostics]);

  const criticalDiagnostics = useMemo(
    () => diagnostics.filter((d) => d.result === 'critical_failure'),
    [diagnostics],
  );

  const dimensionKeys = Object.keys(SCORE_DIMENSION_WEIGHTS) as ScoreDimensionKey[];

  return (
    <div className="bs-results" aria-label="Attempt results">
      <section className="bs-results-hero">
        <ScoreDonut total={score.total} passed={score.passed} />
        <div className="bs-results-hero-copy">
          <span>{casePack.title} · Attempt {attemptNumber}</span>
          <h2>{score.passed ? 'Passed' : 'Not Passed'}</h2>
          <p>
            {score.passed
              ? `This attempt met the Governing Body standard (${casePack.passScore}+ of ${TOTAL_POSSIBLE_SCORE}, zero critical failures). ${casePack.passStandardNote}`
              : `This attempt did not meet the Governing Body standard (${casePack.passScore}+ of ${TOTAL_POSSIBLE_SCORE}, zero critical failures). ${casePack.passStandardNote}`}
          </p>
          <div className="bs-results-dims">
            {dimensionKeys.map((k) => (
              <div key={k} className="bs-results-dim">
                <span>{DIMENSION_LABELS[k]}</span>
                <strong>{Math.round(score.byDimension[k])} / {SCORE_DIMENSION_WEIGHTS[k]}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {criticalDiagnostics.length > 0 && (
        <div className="bs-critical-banner" role="alert">
          <AlertTriangle size={22} aria-hidden="true" />
          <div>
            <strong>Critical governance failure{criticalDiagnostics.length > 1 ? 's' : ''} recorded</strong>
            <ul>
              {criticalDiagnostics.map((d) => {
                const node = nodesById.get(d.nodeId);
                return (
                  <li key={d.nodeId}>
                    <strong>{formatRound(node?.round ?? 0)} — {node?.title ?? d.nodeId}:</strong>{' '}
                    {d.whyUserActionSucceededOrFailed}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="bs-rail-card">
        <header>
          <strong>Competencies Needing Attention</strong>
        </header>
        {failedCompetencyIds.length === 0 ? (
          <p style={{ fontSize: 11.5, color: 'var(--bs-muted)' }}>
            Every competency exercised this attempt met the standard.
          </p>
        ) : (
          <div className="bs-disposition-chips">
            {failedCompetencyIds.map((c) => (
              <span key={c} className="bs-chip selected warn">
                {formatCompetencyId(c)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bs-results-grid">
        <div className="bs-diagnostic-list" aria-label="Attempt diagnostics, full debrief">
          {diagnostics.map((d) => {
            const node = nodesById.get(d.nodeId);
            const ResultIcon = RESULT_ICONS[d.result];
            return (
              <article key={d.nodeId} className={`bs-diagnostic ${d.result}`}>
                <header>
                  <strong>{formatRound(node?.round ?? 0)} — {node?.title ?? d.nodeId}</strong>
                  <span className={`bs-diagnostic-result ${d.result}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <ResultIcon size={12} aria-hidden="true" />
                    {RESULT_LABELS[d.result]}
                  </span>
                </header>
                <p>{d.whyUserActionSucceededOrFailed}</p>
                <dl>
                  <dt>Points</dt>
                  <dd>{d.pointsEarned} / {d.pointsAvailable}</dd>
                  <dt>Evidence Required</dt>
                  <dd>{d.evidenceRequired.length ? d.evidenceRequired.join(', ') : '—'}</dd>
                  {d.evidenceMissed.length > 0 && (
                    <>
                      <dt>Evidence Missed</dt>
                      <dd>{d.evidenceMissed.join(', ')}</dd>
                    </>
                  )}
                  {d.evidenceMisused.length > 0 && (
                    <>
                      <dt>Evidence Misused</dt>
                      <dd>{d.evidenceMisused.join(', ')} (decoy exhibit cited as support)</dd>
                    </>
                  )}
                  <dt>Workflow</dt>
                  <dd>{d.workflowExplanation}</dd>
                  <dt>Forms Required</dt>
                  <dd>{d.formsRequired.length ? d.formsRequired.join(', ') : '—'}</dd>
                  <dt>Deadline</dt>
                  <dd>{d.deadlineExplanation}</dd>
                  {d.result !== 'correct' && d.whyAlternativesFail.length > 0 && (
                    <>
                      <dt>Why Alternatives Fail</dt>
                      <dd>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {d.whyAlternativesFail.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </dd>
                    </>
                  )}
                  <dt>Next Step</dt>
                  <dd>{d.remediation.immediate}</dd>
                </dl>
              </article>
            );
          })}
        </div>

        {score.passed ? (
          <div className="bs-next-step">
            <h3>Debrief Complete</h3>
            <ol>
              <li>Review the full debrief at left even on a pass — it is the record of why each decision held up.</li>
              <li>Note any partial-credit nodes above; they did not cost the pass but are worth tightening before the next quarter.</li>
              {onContinue && <li>Continue when ready.</li>}
            </ol>
            {onContinue && (
              <button type="button" onClick={onContinue}>
                Continue <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
              </button>
            )}
          </div>
        ) : (
          <div className="bs-next-step">
            <h3>Choose Your Next Step</h3>
            <ol>
              <li>Review the debrief at left — every missed or misused exhibit is named.</li>
              <li>Decide whether to retry the full case, take guided remediation on what you missed, or review the controlling evidence first.</li>
              <li>{failureCount > 1 ? `This is failed attempt ${failureCount} on this matter — remediation depth increases with repeated misses.` : 'This is your first miss on this matter.'}</li>
            </ol>
            <button type="button" onClick={() => setChoiceOpen(true)}>
              Choose Your Next Step <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
            </button>
          </div>
        )}
      </div>

      <RemediationChoiceDialog
        open={choiceOpen}
        attemptNumber={attemptNumber}
        scoreTotal={score.total}
        onClose={() => setChoiceOpen(false)}
        onTryAnotherCase={() => {
          setChoiceOpen(false);
          onRetryFullCase();
        }}
        onGuidedRemediation={() => {
          setChoiceOpen(false);
          onStartGuidedRemediation();
        }}
        onReviewEvidence={() => {
          setChoiceOpen(false);
          onReviewEvidence();
        }}
      />
    </div>
  );
}
