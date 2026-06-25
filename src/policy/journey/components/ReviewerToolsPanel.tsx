import { Settings, Shield } from "lucide-react";
import { useLearner } from "../lib/learnerState";
import { useUiState, formatHoursAndMins } from "../lib/uiState";
import {
  module0Complete,
  lessonCompleted,
  moduleAssessmentPassed,
  withLessonCompleted,
  withLessonReset,
  withModuleAssessment,
  withEverythingUnlocked,
} from "../lib/v2state";
import { DEFAULT_PROFILE } from "../lib/learnerState";

// Reviewer-only prototype controls. These never appear in the normal learner
// flow — they live in a collapsible panel above the app chrome and write into
// the canonical LearnerState. They do NOT issue any certificate.
export function ReviewerToolsPanel() {
  const { state, setState, update, resetDemo } = useLearner();
  const { reviewerOpen, setReviewerOpen, demoSeconds } = useUiState();

  const m0 = module0Complete(state);
  const lesson = lessonCompleted(state);
  const m1Exam = moduleAssessmentPassed(state);

  const toggleBtn = (active: boolean, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-xs font-semibold w-full border transition-colors ${
        active
          ? "bg-brand-teal text-white border-brand-teal-deep shadow-pill-action"
          : "bg-white text-secondary border-hairline hover:bg-surface-hover hover:text-brand-teal-deep"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative z-50 no-print">
      <div className="bg-tone-teal-bg/95 border-b border-tone-teal-border text-xs py-1.5 px-4 flex items-center justify-between text-secondary">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          <span className="font-mono tracking-wide text-brand-teal-deep font-semibold">Reviewer Tools — Prototype Controls Only</span>
        </div>
        <button
          onClick={() => setReviewerOpen((o) => !o)}
          aria-expanded={reviewerOpen}
          className="flex items-center gap-1.5 text-brand-teal hover:text-brand-teal-deep font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-tone-teal-border hover:bg-surface-hover transition-all shadow-pill-action"
        >
          <Settings size={12} className="animate-spin-slow" />
          {reviewerOpen ? "Close Reviewer Panel" : "Open Reviewer Panel"}
        </button>
      </div>

      {reviewerOpen && (
        <div className="bg-white border-b border-tone-teal-border p-4 text-sm shadow-sticky-tabs">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-3 border-b border-hairline pb-2">
              <span className="font-semibold text-brand-teal-deep uppercase tracking-widest text-[11px] flex items-center gap-2">
                <Shield size={14} className="text-brand-orange" /> Prototype State Override Panel
              </span>
              <span className="text-xs text-muted italic">Simulates user progress &amp; compliance actions</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-muted text-[10px] uppercase font-bold mb-1">Module 0 Status</label>
                <div className="flex gap-2">
                  {toggleBtn(m0, m0 ? "Complete" : "Complete", () =>
                    setState((s) => ({
                      ...s,
                      legalFirstName: s.legalFirstName || DEFAULT_PROFILE.legalFirstName,
                      legalLastName: s.legalLastName || DEFAULT_PROFILE.legalLastName,
                      cnaNumber: s.cnaNumber || DEFAULT_PROFILE.cnaNumber,
                      orientationFinalAck: true,
                      phiAck: true,
                      onlineCapAck: true,
                    })),
                  )}
                  <button
                    onClick={() => setState((s) => ({ ...s, orientationFinalAck: false, phiAck: false, onlineCapAck: false }))}
                    className="px-2 py-1.5 rounded text-xs bg-white border border-hairline text-muted hover:bg-surface-hover hover:text-brand-teal-deep"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-muted text-[10px] uppercase font-bold mb-1">Lesson Completed</label>
                {toggleBtn(lesson, lesson ? "Completed" : "Not Started", () =>
                  setState((s) => (lessonCompleted(s) ? withLessonReset(s) : withLessonCompleted(s))),
                )}
              </div>

              <div>
                <label className="block text-muted text-[10px] uppercase font-bold mb-1">Module 10 Exam</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setState((s) => withModuleAssessment(s, true, "m10"))}
                    className={`px-2 py-1.5 rounded text-xs font-semibold flex-1 border ${
                      m1Exam ? "bg-brand-teal text-white border-brand-teal-deep" : "bg-white text-secondary border-hairline hover:bg-surface-hover"
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => setState((s) => withModuleAssessment(s, false, "m10"))}
                    className="px-2 py-1.5 rounded text-xs bg-white border border-hairline text-tone-red-text font-semibold hover:bg-tone-red-bg"
                  >
                    Fail
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-muted text-[10px] uppercase font-bold mb-1">Final Exam</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setState((s) => ({ ...s, finalExamPassed: true, finalExamAttempted: true }))}
                    className={`px-2 py-1.5 rounded text-xs font-semibold flex-1 border ${
                      state.finalExamPassed ? "bg-brand-teal text-white border-brand-teal-deep" : "bg-white text-secondary border-hairline hover:bg-surface-hover"
                    }`}
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => setState((s) => ({ ...s, finalExamPassed: false, finalExamAttempted: true }))}
                    className="px-2 py-1.5 rounded text-xs bg-white border border-hairline text-tone-red-text font-semibold hover:bg-tone-red-bg"
                  >
                    Fail
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-muted text-[10px] uppercase font-bold mb-1">Affidavit</label>
                {toggleBtn(state.affidavitComplete, state.affidavitComplete ? "Signed" : "Unsigned", () =>
                  update("affidavitComplete", !state.affidavitComplete),
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-3 border-t border-hairline">
              <div className="md:col-span-2 flex items-end gap-2">
                <button
                  onClick={() => setState((s) => withEverythingUnlocked(s))}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-bold py-2 px-2 rounded transition-colors uppercase tracking-wider shadow-dock-action"
                >
                  Unlock All
                </button>
                <button
                  onClick={() => resetDemo()}
                  className="flex-1 bg-white border border-hairline hover:bg-surface-hover text-secondary text-xs font-bold py-2 px-2 rounded transition-colors uppercase tracking-wider"
                >
                  Reset All
                </button>
              </div>
              <div className="md:col-span-3 flex items-end">
                <div className="text-[11px] text-muted flex flex-wrap gap-x-4 gap-y-1">
                  <span>
                    <strong className="text-brand-teal-deep">Active study time:</strong> {formatHoursAndMins(demoSeconds)}{" "}
                    <span className="text-brand-orange font-semibold">(demo / MVP — not CDPH-validated)</span>
                  </span>
                  <span>
                    <strong className="text-brand-teal-deep">Affidavit:</strong> {state.affidavitComplete ? "Signed" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
