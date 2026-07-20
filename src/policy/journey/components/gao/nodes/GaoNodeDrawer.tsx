import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import type { GaoNode } from "../../../data/gaoNodes";

interface GaoNodeDrawerProps {
  node: GaoNode;
  trigger: HTMLButtonElement | null;
  onClose: () => void;
  onComplete: () => void;
}

function TeachingBlock({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <section className={`gao-teaching-block ${accent ? "gao-teaching-block-accent" : ""}`}>
      <h3>{label}</h3>
      <p>{body}</p>
    </section>
  );
}

export function GaoNodeDrawer({ node, trigger, onClose, onComplete }: GaoNodeDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const selectedOption = node.microCheck?.options.find((option) => option.id === selectedOptionId);
  const maxAttempts = node.microCheck?.maxAttempts && node.microCheck.maxAttempts > 0
    ? node.microCheck.maxAttempts
    : null;
  const remediationRequired = maxAttempts !== null && incorrectAttempts >= maxAttempts;
  const canComplete = !node.microCheck || selectedOption?.isSafest === true;

  const close = useCallback(() => {
    onClose();
    window.requestAnimationFrame(() => trigger?.focus());
  }, [onClose, trigger]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 20);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [node.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
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

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <div className="gao-node-drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="gao-node-drawer"
      >
        <header className="gao-node-drawer-header">
          <div className="gao-node-drawer-heading">
            <span className="gao-node-drawer-icon" aria-hidden="true">
              {node.tone === "stop" || node.tone === "caution" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            </span>
            <div>
              <h2 id={titleId}>{node.label}</h2>
              <p>{node.kind}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" aria-label="Close teaching point" onClick={close} className="gao-node-close">
            <X size={19} />
          </button>
        </header>

        <p id={descriptionId} className="gao-node-sr-only">
          Structured teaching point with observation, meaning, action, and supporting references.
        </p>

        <div className="gao-node-drawer-body">
          <TeachingBlock label="What you observed" body={node.whatYouObserved} />
          <TeachingBlock label="Why it matters" body={node.whyItMatters} />
          <TeachingBlock label="What you should do" body={node.whatYouShouldDo} accent />
          {node.whoToNotify ? (
            <TeachingBlock label="Who to notify" body={node.whoToNotify} />
          ) : null}
          {node.whatToDocument ? (
            <TeachingBlock label="What to document" body={node.whatToDocument} />
          ) : null}

          {node.microCheck ? (
            <fieldset className="gao-node-micro-check">
              <legend>{node.microCheck.prompt}</legend>
              <div className="space-y-2">
                {node.microCheck.options.map((option) => (
                  <label key={option.id} className="gao-node-option">
                    <input
                      type="radio"
                      name={`gao-node-${node.id}`}
                      value={option.id}
                      checked={selectedOptionId === option.id}
                      onChange={() => {
                        setSelectedOptionId(option.id);
                        if (!option.isSafest) {
                          setIncorrectAttempts((current) => current + 1);
                        }
                      }}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              {selectedOption ? (
                <p className={`gao-node-feedback ${selectedOption.isSafest ? "gao-node-feedback-safe" : "gao-node-feedback-retry"}`}>
                  {selectedOption.feedback}
                </p>
              ) : null}
              {remediationRequired && !selectedOption?.isSafest ? (
                <p role="alert" className="gao-node-feedback gao-node-feedback-retry">
                  Attempt limit reached. Review the teaching point and select the safest response before completion.
                </p>
              ) : null}
            </fieldset>
          ) : null}

          {node.policyRefs.length ? (
            <section className="gao-node-references">
              <h3>Policy or regulatory references</h3>
              <div>
                {node.policyRefs.map((reference) => (
                  <span key={reference}>{reference}</span>
                ))}
              </div>
            </section>
          ) : null}

          <button
            type="button"
            disabled={!canComplete}
            onClick={() => {
              onComplete();
              window.requestAnimationFrame(() => trigger?.focus());
            }}
            className="gao-node-complete-button"
          >
            {node.microCheck ? "Complete teaching point" : "Mark observed"}
          </button>
          {!canComplete && selectedOption ? (
            <p className="text-center text-xs font-semibold text-[#9A3412]">Review the feedback and choose the safest response.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
