// Accessible modal shown from AttemptResults after a failed attempt —
// "This attempt did not meet the Governing Body standard." Offers three
// paths: try another full Board case, take guided True/False remediation,
// or review the controlling evidence first (a lightweight link-out, not a
// gate). Ground-up build for tabletop2026/ — reuses tabletop2026.css
// classes only (.bs-decision-prompt / .bs-option / .bs-rail-action); the
// overlay itself is inline-styled since no modal-overlay class exists yet
// in the shared stylesheet.

import { useEffect, useRef } from 'react';
import { BookOpenCheck, RefreshCcw, Search, X } from 'lucide-react';

export interface RemediationChoiceDialogProps {
  open: boolean;
  onClose: () => void;
  onTryAnotherCase: () => void;
  onGuidedRemediation: () => void;
  onReviewEvidence: () => void;
  attemptNumber?: number;
  scoreTotal?: number;
}

const TITLE_ID = 'bs-remediation-choice-title';
const DESC_ID = 'bs-remediation-choice-desc';

export default function RemediationChoiceDialog({
  open,
  onClose,
  onTryAnotherCase,
  onGuidedRemediation,
  onReviewEvidence,
  attemptNumber,
  scoreTotal,
}: RemediationChoiceDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus the first actionable choice as soon as the dialog mounts.
      const id = window.setTimeout(() => firstActionRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [open]);

  if (!open) return null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === 'Tab') {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(18, 39, 31, .58)',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        aria-describedby={DESC_ID}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="bs-decision-prompt"
        style={{ maxWidth: 560, width: '100%', boxShadow: 'var(--bs-shadow-lg)' }}
      >
        <header style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex' }}>
          <div>
            <span className="bs-kicker">Governing Body Standard Not Met</span>
            <h3 id={TITLE_ID}>This attempt did not meet the Governing Body standard.</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 0, color: 'var(--bs-muted)', padding: 4 }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <p id={DESC_ID} className="bs-prompt-text">
          {typeof scoreTotal === 'number' ? `Attempt scored ${scoreTotal} / 1000. ` : ''}
          {typeof attemptNumber === 'number' ? `Attempt ${attemptNumber}. ` : ''}
          Choose how to proceed before your next attempt on this matter.
        </p>

        <div className="bs-option-list" role="group" aria-label="Remediation path">
          <button ref={firstActionRef} type="button" className="bs-option" onClick={onTryAnotherCase}>
            <span className="bs-option-mark" aria-hidden="true">
              <RefreshCcw size={13} />
            </span>
            <span className="bs-option-text">
              <strong style={{ fontFamily: 'var(--font-editorial)', fontSize: 13.5, color: 'var(--bs-forest)', display: 'block' }}>
                Try another full Board case
              </strong>
              Attempt a new variant of this quarter&rsquo;s matter from the start.
            </span>
          </button>

          <button type="button" className="bs-option" onClick={onGuidedRemediation}>
            <span className="bs-option-mark" aria-hidden="true">
              <BookOpenCheck size={13} />
            </span>
            <span className="bs-option-text">
              <strong style={{ fontFamily: 'var(--font-editorial)', fontSize: 13.5, color: 'var(--bs-forest)', display: 'block' }}>
                Take guided True/False remediation
              </strong>
              Work through the specific statements tied to what you missed, one at a time, with immediate feedback.
            </span>
          </button>

          <button type="button" className="bs-option" onClick={onReviewEvidence}>
            <span className="bs-option-mark" aria-hidden="true">
              <Search size={13} />
            </span>
            <span className="bs-option-text">
              <strong style={{ fontFamily: 'var(--font-editorial)', fontSize: 13.5, color: 'var(--bs-forest)', display: 'block' }}>
                Review controlling evidence first
              </strong>
              Return to the Board Book and re-read the exhibits this matter required, without starting a new attempt yet.
            </span>
          </button>
        </div>

        <button type="button" className="bs-rail-action secondary" onClick={onClose}>
          Close without choosing
        </button>
      </div>
    </div>
  );
}
