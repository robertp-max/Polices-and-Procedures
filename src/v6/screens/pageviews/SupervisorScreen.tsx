import { useState } from "react";
import { Stethoscope, AlertTriangle, StopCircle } from "lucide-react";
import { useLearner } from "@/policy/journey/lib/learnerState";
import { appCopy, contentV2 } from "@/policy/journey/data/contentV2Adapter";
import { JourneyLearningShell } from "./JourneyLearningShell";
import { ReviewerToolsPanel } from "@/policy/journey/components/ReviewerToolsPanel";

export function PhiWarningBlock() {
  return (
    <div
      className="bg-tone-red-bg border border-tone-red-border rounded-lg p-4 flex items-start sm:items-center gap-3"
      role="note"
      aria-label="No protected health information warning"
    >
      <StopCircle size={20} className="text-tone-red-text shrink-0" aria-hidden="true" />
      <p className="text-sm font-bold text-tone-red-text">
        STOP:{" "}
        <span className="font-normal text-tone-red-text">
          Do not enter Protected Health Information (PHI), real patient names, or facility data.
          Use simulated case data only.
        </span>
      </p>
    </div>
  );
}

export function SupervisorScreen() {
  const { state, setOptionalClinical } = useLearner();
  const [inputText, setInputText] = useState("");

  const o = state.optionalClinical;
  const interactions = [o.hub, o.skills, o.confidence, o.documentation, o.help].filter(Boolean).length;

  return (
    <JourneyLearningShell
      title="Clinical Hub"
      subtitle="Access supplementary nursing guides, return demonstrations, and de-identified charting practices. This section is entirely optional and does not affect required course hours."
    >
      <div className="space-y-6">
        {/* Reviewer Tools */}
        <ReviewerToolsPanel />

        <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-orange font-mono flex items-center gap-1.5">
                <Stethoscope size={12} /> {appCopy.clinicalHub.eyebrow}
              </span>
              <h1 className="text-2xl font-bold text-brand-teal-deep mt-1">{appCopy.clinicalHub.title}</h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-tone-orange-bg text-brand-orange border border-tone-orange-border font-mono shrink-0">
              {appCopy.clinicalHub.badge}
            </span>
          </div>

          <div className="bg-tone-orange-bg/15 border border-tone-orange-border/30 rounded-lg p-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-brand-orange shrink-0 mt-0.5" />
              <p className="text-[11px] text-brand-orange/90 leading-relaxed font-mono font-semibold">
                <strong>Regulatory Warning:</strong> {appCopy.clinicalHub.warning}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appCopy.clinicalHub.scenarios.map((scenario, index) => (
              <div key={scenario.title} className="p-5 rounded-lg bg-white border border-hairline hover:border-brand-teal/20 transition-all shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal-deep mb-2 font-mono">{scenario.title}</h3>
                <p className="text-xs text-secondary leading-relaxed mb-4">{scenario.body}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] text-muted font-mono">
                    {index === 0 ? `${contentV2.clinical_support.units.length} Units` : `${contentV2.clinical_support.confidence_checks.length} Checks`}
                  </span>
                  <button
                    onClick={() => setOptionalClinical(index === 0 ? "skills" : "confidence", true)}
                    className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-colors shadow-pill-action"
                  >
                    {scenario.action}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {interactions > 0 && (
            <div className="p-4 rounded-lg border border-tone-teal-border/30 bg-tone-teal-bg/10 text-brand-teal-deep text-xs font-mono flex justify-between items-center shadow-sm">
              <span>Optional practice engaged (does not affect certificate progress):</span>
              <strong className="text-brand-orange">{interactions} session{interactions === 1 ? "" : "s"}</strong>
            </div>
          )}

          {/* Documentation support (practice) */}
          <div className="bg-white/80 border border-hairline rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-brand-teal-deep mb-6">{appCopy.clinicalHub.documentation_title}</h2>

            <div className="mb-6 space-y-3">
              <PhiWarningBlock />
              <p className="text-[11px] text-muted font-mono">{appCopy.clinicalHub.documentation_warning}</p>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-brand-teal-deep">Practice note — fictional / de-identified details only</label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-white border border-hairline rounded-lg p-4 text-xs text-secondary focus:outline-none focus:border-brand-teal shadow-sm resize-none"
                placeholder="Do not type patient or resident identifiers. Use fictional practice notes only."
              />
            </div>

            <button disabled className="px-6 py-3 rounded-lg bg-tone-slate-bg border border-hairline text-muted font-semibold text-xs uppercase tracking-wider cursor-not-allowed">
              Mock upload disabled
            </button>
          </div>
        </div>
      </div>
    </JourneyLearningShell>
  );
}

export default SupervisorScreen;
