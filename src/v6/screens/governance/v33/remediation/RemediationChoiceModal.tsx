// First-failure remediation choice modal (§6).
//
// Shown once, right after a learner does not meet the standard on their FIRST
// attempt at a module challenge, course assessment, or tabletop. Deliberately
// calm: no shame language, no failure animation, no dead end — three clear,
// equally legitimate paths forward. Shared across every engine that has a
// first-failure moment; the host screen owns what each callback actually does.

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './remediation.css';

export interface RemediationChoiceModalProps {
  open: boolean;
  /** Plain-language labels of the concepts missed (e.g. CONCEPT_LABELS values). */
  missedConcepts: string[];
  onTryAgain: () => void;
  onGuided: () => void;
  onReview: () => void;
  onClose: () => void;
}

export default function RemediationChoiceModal({
  open,
  missedConcepts,
  onTryAgain,
  onGuided,
  onReview,
  onClose,
}: RemediationChoiceModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Capture the opener and move focus into the dialog heading.
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  // Return focus to whatever opened the modal, once it closes.
  useEffect(() => {
    if (open) return;
    const opener = openerRef.current;
    if (!opener) return;
    const id = window.setTimeout(() => opener.focus(), 0);
    openerRef.current = null;
    return () => window.clearTimeout(id);
  }, [open]);

  // Focus trap + ESC-to-close, scoped to this dialog only.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const uniqueConcepts = [...new Set(missedConcepts)];

  return (
    <div
      className="remediation-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remediation-choice-heading"
        aria-describedby="remediation-choice-desc"
        className="remediation-modal"
      >
        <button type="button" className="remediation-close" onClick={onClose} aria-label="Close and stay on this screen">
          <X size={18} />
        </button>

        <h2 id="remediation-choice-heading" ref={headingRef} tabIndex={-1}>
          You did not meet the standard yet.
        </h2>
        <p id="remediation-choice-desc" className="remediation-sub">
          Choose the path that works best. Your progress is saved, and neither option changes the compliance standard.
        </p>

        {uniqueConcepts.length > 0 && (
          <div className="remediation-missed" role="status">
            <span>Concepts to revisit</span>
            <ul>
              {uniqueConcepts.map((concept) => (
                <li key={concept}>{concept}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="remediation-choices">
          <button type="button" className="remediation-choice remediation-choice-primary" onClick={onTryAgain}>
            <strong>Try the exercise again</strong>
            <span>Starts a new version. Your learning progress is preserved.</span>
          </button>

          <button type="button" className="remediation-choice remediation-choice-secondary" onClick={onGuided}>
            <strong>Take guided True/False remediation</strong>
            <span>A short, plain-language review of the concepts you missed.</span>
          </button>
        </div>

        <button type="button" className="remediation-review-link" onClick={onReview}>
          Review the controlling sections first
        </button>
      </div>
    </div>
  );
}
