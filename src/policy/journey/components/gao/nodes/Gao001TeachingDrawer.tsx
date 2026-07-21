import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, FileCheck, X } from "lucide-react";

import type { Hotspot } from "../../GAO001SharedOverlay";
import SceneNarrationPlayer from "../../SceneNarrationPlayer";
import "./GaoNodeStage.css";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

interface Gao001TeachingDrawerProps {
  hotspot: Hotspot;
  trigger: HTMLButtonElement | null;
  onClose: () => void;
  onComplete: () => void;
}

export function Gao001TeachingDrawer({
  hotspot,
  trigger,
  onClose,
  onComplete,
}: Gao001TeachingDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const selectedChoice = hotspot.question?.choices.find(
    (choice) => choice.id === selectedChoiceId,
  );
  const canComplete = !hotspot.question || selectedChoice?.isCorrect === true;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLButtonElement>(".gao-node-close")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [onClose, trigger]);

  return (
    <div
      className="gao-node-drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="gao-node-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="gao-node-drawer-header">
          <div className="gao-node-drawer-heading">
            <span className="gao-node-drawer-icon" aria-hidden="true">
              <FileCheck size={21} />
            </span>
            <div>
              <h2 id={titleId}>{hotspot.label}</h2>
              <p>Teaching point</p>
            </div>
          </div>
          <button
            type="button"
            className="gao-node-close"
            aria-label="Close teaching point"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>

        <div className="gao-node-drawer-body">
          <p id={descriptionId} className="gao-node-sr-only">
            Teaching point with observation, meaning, and the safest action.
          </p>

          <section className="gao-teaching-block">
            <h3>What you observed</h3>
            <p>{hotspot.fieldNotes.title}</p>
          </section>

          <section className="gao-teaching-block">
            <h3>Why it matters</h3>
            <div className="text-[15.5px] leading-[1.55] text-[#2D3748]">
              {hotspot.fieldNotes.content}
            </div>
          </section>

          {hotspot.narration ? (
            <SceneNarrationPlayer
              key={hotspot.id}
              src={hotspot.narration.src}
              transcript={hotspot.narration.transcript}
              pauseRequested={Boolean(selectedChoiceId)}
            />
          ) : null}

          {hotspot.question ? (
            <fieldset className="gao-node-micro-check">
              <legend>What you should do</legend>
              <p className="mb-3 text-[15.5px] leading-relaxed text-[#2D3748]">
                {hotspot.question.prompt}
              </p>
              <div className="flex flex-col gap-2">
                {hotspot.question.choices.map((choice) => (
                  <label key={choice.id} className="gao-node-option">
                    <input
                      type="radio"
                      name={`gao001-${hotspot.id}`}
                      value={choice.id}
                      checked={selectedChoiceId === choice.id}
                      onChange={() => setSelectedChoiceId(choice.id)}
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
              {selectedChoice ? (
                <p
                  className={`gao-node-feedback ${
                    selectedChoice.isCorrect
                      ? "gao-node-feedback-safe"
                      : "gao-node-feedback-retry"
                  }`}
                  role="status"
                >
                  {selectedChoice.feedback}
                </p>
              ) : null}
            </fieldset>
          ) : (
            <section className="gao-teaching-block gao-teaching-block-accent">
              <h3>What you should do</h3>
              <p>Review the field note in the context of this scene, then mark it observed.</p>
            </section>
          )}

          <button
            type="button"
            className="gao-node-complete-button"
            disabled={!canComplete}
            onClick={onComplete}
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={18} />
              {hotspot.question ? "Complete teaching point" : "Mark observed"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
