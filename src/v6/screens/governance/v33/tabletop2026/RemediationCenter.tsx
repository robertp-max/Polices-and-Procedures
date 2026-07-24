// Remediation Center — progressive depth per failure count (spec §11.2).
//
// ASSUMPTION (spec §11.2 text was not available to this build pass; the
// tiering below is a deliberate, documented interpretation the orchestrator
// should confirm against the authored spec and adjust if it differs):
//   Tier 1 (1st failure)  — "Quick Review": the controlling exhibits the
//     learner missed/misused are listed for re-reading; guided True/False is
//     OFFERED but optional; retrying the full case is available immediately.
//   Tier 2 (2nd failure)  — "Guided Remediation Required": guided True/False
//     on the missed competencies is mandatory (must reach 100%) before the
//     retry action unlocks; the evidence list is shown alongside as
//     reference, not gated.
//   Tier 3+ (3rd+ failure) — "Full Remediation": the learner must first
//     acknowledge every missed/misused controlling exhibit (checklist),
//     THEN complete guided True/False remediation to 100%, before retry
//     unlocks. Messaging notes the repeated-miss pattern and suggests
//     facilitator support.
//
// Composes GuidedTrueFalseRemediation (sibling import, as directed — this
// is the composition point the spec calls for). Ground-up build for
// tabletop2026/ — reuses tabletop2026.css classes only.

import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BookOpenCheck } from 'lucide-react';
import type { CasePack } from './engine/caseTypes';
import { buildTargetedRemediation } from './data/remediationBank';
import GuidedTrueFalseRemediation from './GuidedTrueFalseRemediation';

export interface RemediationCenterProps {
  casePack: CasePack;
  /** Total failed attempts on this matter so far, including the one that just triggered remediation. Always >= 1. */
  failureCount: number;
  /** Competency ids missed on the most recent attempt (from TabletopDiagnostic.competencyIds where result !== 'correct'). */
  missedCompetencyIds: string[];
  /** Exhibit ids missed or misused on the most recent attempt, for the controlling-evidence checklist. */
  missedExhibitIds?: string[];
  onExit: () => void;
  onRetryFullCase: () => void;
  /** Fires once guided remediation reaches 100% — the caller should unlock/serve a new attemptVariants.variant(...) form. */
  onAlternateFormUnlocked?: () => void;
}

type Stage = 'review' | 'guided' | 'complete';

export default function RemediationCenter({
  casePack,
  failureCount,
  missedCompetencyIds,
  missedExhibitIds = [],
  onExit,
  onRetryFullCase,
  onAlternateFormUnlocked,
}: RemediationCenterProps) {
  const tier = failureCount <= 1 ? 1 : failureCount === 2 ? 2 : 3;
  const guidedRequired = tier >= 2;
  const evidenceGateRequired = tier >= 3;

  const remediation = useMemo(() => buildTargetedRemediation(missedCompetencyIds), [missedCompetencyIds]);
  const [stage, setStage] = useState<Stage>(guidedRequired ? 'guided' : 'review');
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const allAcknowledged = missedExhibitIds.length === 0 || missedExhibitIds.every((id) => acknowledged.has(id));

  function toggleAck(id: string) {
    setAcknowledged((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleGuidedComplete() {
    setStage('complete');
    onAlternateFormUnlocked?.();
  }

  const tierLabel = tier === 1 ? 'Quick Review' : tier === 2 ? 'Guided Remediation Required' : 'Full Remediation';

  return (
    <div className="bs-group" aria-label="Remediation Center">
      <div className="bs-group-head">
        <div>
          <span className="bs-kicker">Remediation · Attempt {failureCount} · {tierLabel}</span>
          <strong>{casePack.title}</strong>
        </div>
        <button type="button" className="bs-rail-action secondary" style={{ width: 'auto', padding: '9px 16px' }} onClick={onExit}>
          Exit to Results
        </button>
      </div>

      {tier === 1 && (
        <p style={{ fontSize: 12, color: 'var(--bs-muted)', lineHeight: 1.6 }}>
          First miss on this matter. Review the controlling evidence below, or take the optional guided
          True/False remediation, then retry whenever you are ready.
        </p>
      )}
      {tier === 2 && (
        <p style={{ fontSize: 12, color: 'var(--bs-muted)', lineHeight: 1.6 }}>
          Second miss on this matter — guided True/False remediation on what you missed is required before
          your next attempt unlocks.
        </p>
      )}
      {tier >= 3 && (
        <div className="bs-contradiction">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Repeated misses on this matter</strong>
            <p>
              Acknowledge every controlling exhibit below, then complete guided True/False remediation to
              100%, before retrying. If this pattern continues, consider requesting facilitator support.
            </p>
          </div>
        </div>
      )}

      {(tier === 1 || tier >= 3) && missedExhibitIds.length > 0 && (
        <div className="bs-rail-card">
          <header>
            <strong>Controlling Evidence To Review</strong>
          </header>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0 }}>
            {missedExhibitIds.map((id) => (
              <li key={id}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11.5, color: 'var(--bs-ink)' }}>
                  {evidenceGateRequired && (
                    <input type="checkbox" checked={acknowledged.has(id)} onChange={() => toggleAck(id)} />
                  )}
                  <span>{id}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stage === 'review' && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tier === 1 && (
            <button type="button" className="bs-rail-action secondary" style={{ width: 'auto', padding: '11px 18px' }} onClick={() => setStage('guided')}>
              <BookOpenCheck size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Take Optional Guided Remediation
            </button>
          )}
          {tier >= 3 && (
            <button
              type="button"
              className="bs-rail-action"
              style={{ width: 'auto', padding: '11px 18px' }}
              disabled={!allAcknowledged}
              onClick={() => setStage('guided')}
            >
              Begin Guided Remediation
            </button>
          )}
          <button
            type="button"
            className="bs-rail-action"
            style={{ width: 'auto', padding: '11px 18px' }}
            disabled={guidedRequired}
            onClick={onRetryFullCase}
          >
            Retry Full Board Case
          </button>
        </div>
      )}

      {stage === 'guided' && (
        <GuidedTrueFalseRemediation
          items={remediation.items}
          onComplete={handleGuidedComplete}
          onExit={tier === 1 ? () => setStage('review') : undefined}
        />
      )}

      {stage === 'complete' && (
        <div className="bs-next-step">
          <h3>Guided Remediation Complete</h3>
          <ol>
            <li>Every missed statement was corrected to 100%.</li>
            <li>This does not itself pass the case — a new alternate form has been unlocked for your next attempt.</li>
          </ol>
          <button type="button" onClick={onRetryFullCase}>
            Retry Full Board Case <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
          </button>
        </div>
      )}
    </div>
  );
}
