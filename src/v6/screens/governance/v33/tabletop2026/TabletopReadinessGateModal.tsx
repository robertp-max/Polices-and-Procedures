// Blocking readiness modal for the Governing Body Tabletop Hub.
//
// Rendered when a BLOCKED user attempts to start / resume / restore a tabletop.
// The user stays on the Hub — the scenario cards are never dimmed, hidden, or
// locked; only the launch action is gated.
//
// HARD RULE: opening this modal is a read-only event. It must never create an
// attempt, a timer, a draft, a score, or an evidence record. This component
// therefore performs NO writes of any kind (see tabletopLaunchGate.test.tsx,
// which asserts that nothing is persisted when the modal opens).

import React, { useCallback, useEffect, useId, useRef } from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

import type { TabletopLaunchBlocker, TabletopLaunchGate } from './tabletopLaunchGate';

/** Contractual copy — asserted verbatim in tests. Do not reword. */
export const READINESS_GATE_HEADING = 'Complete your Governing Body readiness requirements first';
export const READINESS_GATE_BODY =
  'Tabletop exercises are the final Governing Body competency validation. Complete all 13 required training modules, all assigned policies and procedures, and earn 100% on every prerequisite assessment before starting or resuming an official tabletop exercise.';

const BLOCKER_GROUP_LABEL: Record<TabletopLaunchBlocker['type'], string> = {
  evidence: 'Official evidence',
  training: 'Training modules',
  training_assessment: 'Training assessments',
  policy: 'Policies & procedures',
  acknowledgment: 'Acknowledgments',
  attestation: 'Attestations',
  policy_assessment: 'Policy assessments',
};

/** Only actionable blockers are shown — never a wall of every requirement. */
const MAX_VISIBLE_BLOCKERS = 8;

export interface TabletopReadinessGateModalProps {
  /** The scenario the user tried to launch. */
  caseId: string;
  caseTitle: string;
  mode: 'solo' | 'group';
  gate: TabletopLaunchGate;
  /** Primary action — navigate to My Compliance. */
  onGoToCompliance: () => void;
  /** Secondary action / dismiss — return to the Hub with the card still selected. */
  onClose: () => void;
  /** Optional deep-link handler for an individual blocker's destination. */
  onNavigate?: (destination: string) => void;
}

export default function TabletopReadinessGateModal({
  caseId,
  caseTitle,
  mode,
  gate,
  onGoToCompliance,
  onClose,
  onNavigate,
}: TabletopReadinessGateModalProps): React.ReactElement {
  const headingId = useId();
  const bodyId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // This is a long dialog on mobile, so focus the dialog itself without
  // scrolling to a bottom action. The heading and reason must remain the
  // first visible content. Focus return is owned by the Hub.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.scrollTop = 0;
    dialog.focus({ preventScroll: true });
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const visible = gate.blockers.slice(0, MAX_VISIBLE_BLOCKERS);
  const overflow = gate.blockers.length - visible.length;

  return (
    <div className="bs-gate-scrim" data-testid="tabletop-readiness-gate">
      <style>{GATE_STYLE}</style>
      <div
        ref={dialogRef}
        className="bs-gate-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        tabIndex={-1}
        data-case-id={caseId}
        data-launch-mode={mode}
        onKeyDown={onKeyDown}
      >
        <header className="bs-gate-head">
          <span className="bs-gate-crest" aria-hidden="true">
            <ShieldAlert size={18} />
          </span>
          <div>
            <p className="bs-gate-eyebrow">
              Readiness gate · {caseTitle} · {mode === 'group' ? 'Facilitated group' : 'Solo'}
            </p>
            <h2 id={headingId} className="bs-gate-heading">
              {READINESS_GATE_HEADING}
            </h2>
          </div>
        </header>

        <p id={bodyId} className="bs-gate-body">
          {READINESS_GATE_BODY}
        </p>

        <ul className="bs-gate-progress" aria-label="Your official Governing Body progress">
          <li>
            <b>
              {gate.completedTrainingCount}/{gate.requiredTrainingCount}
            </b>
            <span>Training modules complete</span>
          </li>
          <li>
            <b>
              {gate.completedPolicyCount}/{gate.requiredPolicyCount}
            </b>
            <span>Policies &amp; procedures complete</span>
          </li>
          <li>
            <b>
              {gate.perfectAssessmentCount}/{gate.requiredAssessmentCount}
            </b>
            <span>Assessments at 100%</span>
          </li>
          <li>
            <b>{gate.evidenceVerified ? 'Verified' : 'Not verified'}</b>
            <span>Official evidence</span>
          </li>
        </ul>

        <section className="bs-gate-blockers" aria-label="What is still required">
          <h3>What is still required</h3>
          {visible.length === 0 ? (
            <p className="bs-gate-empty">
              No outstanding requirement was returned. Refresh My Compliance and try again.
            </p>
          ) : (
            <ul>
              {visible.map((blocker) => (
                <li key={blocker.id}>
                  <span className="bs-gate-blocker-kind">{BLOCKER_GROUP_LABEL[blocker.type]}</span>
                  <span className="bs-gate-blocker-title">{blocker.title}</span>
                  <span className="bs-gate-blocker-status">
                    {blocker.currentStatus} → required: {blocker.requiredStatus}
                  </span>
                  {onNavigate && (
                    <button type="button" className="bs-gate-blocker-link" onClick={() => onNavigate(blocker.destination)}>
                      Open <ArrowRight size={11} aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {overflow > 0 && (
            <p className="bs-gate-overflow">
              <AlertTriangle size={12} aria-hidden="true" /> {overflow} more requirement
              {overflow === 1 ? '' : 's'} are listed in My Compliance.
            </p>
          )}
        </section>

        <p className="bs-gate-note">
          Nothing has been started. No attempt, timer, draft, score, or evidence record was created.
          When your prerequisites are complete you will need to start this exercise again explicitly.
        </p>

        <footer className="bs-gate-actions">
          <button type="button" className="bs-gate-primary" onClick={onGoToCompliance}>
            Go to My Compliance <ArrowRight size={13} aria-hidden="true" />
          </button>
          <button type="button" className="bs-gate-secondary" onClick={onClose}>
            Return to Tabletop Hub
          </button>
        </footer>
      </div>
    </div>
  );
}

const GATE_STYLE = `
.bs-gate-scrim {
  position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; padding: 24px;
  background: rgba(14, 25, 20, .62); backdrop-filter: blur(3px);
}
.bs-gate-dialog {
  width: min(680px, 100%); max-height: min(86vh, 860px); overflow: auto;
  display: flex; flex-direction: column; gap: 16px; padding: 26px 28px;
  background: #fbfaf7; border: 1px solid var(--bs-line, #d9d5cb); border-top: 3px solid var(--bs-gold, #c8a951);
  border-radius: 12px; box-shadow: 0 30px 80px rgba(10, 20, 16, .38);
}
.bs-gate-head { display: flex; gap: 13px; align-items: flex-start; }
.bs-gate-crest {
  width: 36px; height: 36px; flex: none; display: grid; place-items: center; border-radius: 50%;
  color: #8a6a1f; background: #f5ecd7; border: 1px solid #e6d5ad;
}
.bs-gate-eyebrow { margin: 0 0 4px; color: var(--bs-muted, #6c6a63); font-size: 9px; letter-spacing: .07em; text-transform: uppercase; }
.bs-gate-heading { margin: 0; font-family: var(--font-editorial, Georgia, serif); font-size: 20px; font-weight: 400; line-height: 1.3; color: var(--bs-forest-dark, #1d3229); }
.bs-gate-body { margin: 0; color: var(--bs-ink, #2b2a26); font-size: 12.5px; line-height: 1.65; }

.bs-gate-progress { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); gap: 10px; }
.bs-gate-progress li {
  display: flex; flex-direction: column; gap: 3px; padding: 11px 13px;
  background: #fff; border: 1px solid var(--bs-line, #e2ded4); border-radius: 8px;
}
.bs-gate-progress b { font-size: 17px; font-weight: 600; color: var(--bs-forest, #244033); }
.bs-gate-progress span { font-size: 9px; letter-spacing: .03em; text-transform: uppercase; color: var(--bs-muted, #6c6a63); }

.bs-gate-blockers h3 { margin: 0 0 9px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: var(--bs-muted, #6c6a63); }
.bs-gate-blockers ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
.bs-gate-blockers li {
  display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: center;
  padding: 10px 0; border-top: 1px solid var(--bs-line, #e6e2d9);
}
.bs-gate-blockers li:first-child { border-top: 0; }
.bs-gate-blocker-kind { grid-column: 1; font-size: 8.5px; letter-spacing: .06em; text-transform: uppercase; color: #8a6a1f; }
.bs-gate-blocker-title { grid-column: 1; font-size: 12px; font-weight: 600; color: var(--bs-forest-dark, #1d3229); }
.bs-gate-blocker-status { grid-column: 1; font-size: 10px; color: var(--bs-muted, #6c6a63); }
.bs-gate-blocker-link {
  grid-column: 2; grid-row: 1 / span 3; display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 11px; border: 1px solid var(--bs-forest, #244033); border-radius: 999px;
  background: transparent; color: var(--bs-forest, #244033); font-size: 10px; font-weight: 600;
}
.bs-gate-blocker-link:hover { background: #eef2ef; }
.bs-gate-empty, .bs-gate-overflow { margin: 0; color: var(--bs-muted, #6c6a63); font-size: 10.5px; line-height: 1.55; }
.bs-gate-overflow { display: flex; align-items: center; gap: 6px; margin-top: 9px; }

.bs-gate-note {
  margin: 0; padding: 10px 12px; border-radius: 7px; font-size: 10.5px; line-height: 1.55;
  color: #4d5b53; background: #eef2ef; border: 1px solid #dbe3dd;
}

.bs-gate-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.bs-gate-actions button { display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 9px 17px; border-radius: 8px; font-size: 11.5px; font-weight: 600; }
.bs-gate-primary { color: #fff; background: var(--bs-forest, #244033); border: 1px solid var(--bs-forest, #244033); }
.bs-gate-primary:hover { background: var(--bs-forest-dark, #1d3229); }
.bs-gate-secondary { color: var(--bs-forest, #244033); background: transparent; border: 1px solid var(--bs-line, #cfcabd); }
.bs-gate-secondary:hover { background: #f1efe9; }

@media (max-width: 560px) {
  .bs-gate-dialog { padding: 20px 18px; }
  .bs-gate-actions { justify-content: stretch; }
  .bs-gate-actions button { flex: 1; justify-content: center; }
}
`;
