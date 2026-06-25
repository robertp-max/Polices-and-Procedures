// Required Online CE progress and Optional Clinical Support progress.
// Always computed separately; never merged.

import type { LearnerState } from "./learnerState";
import { activeTimeMet, isModuleComplete, pct } from "./moduleProgress";
import { getModuleDef, requiredTheoryModuleIds } from "../data/courseModules";

export function requiredProgressPct(state: LearnerState): number {
  const milestones = [
    ...requiredTheoryModuleIds.map((id) => isModuleComplete(state, id)),
    activeTimeMet(state),
    state.finalExamPassed,
    state.affidavitComplete,
  ];
  return pct(milestones);
}

export function optionalProgressPct(state: LearnerState): number {
  const o = state.optionalClinical;
  return pct([o.hub, o.skills, o.confidence, o.documentation, o.help]);
}

export type NextStep = { label: string; note: string; cta: string; to: string };

export function getNextStep(state: LearnerState): NextStep {
  // Walk required theory modules in order.
  for (const id of requiredTheoryModuleIds) {
    if (!isModuleComplete(state, id)) {
      const def = getModuleDef(id);
      const isM0 = id === "m0";
      return {
        label: isM0 ? "Complete Module 0: Orientation" : `Continue ${def?.shortTitle ?? id}`,
        note: isM0
          ? "Confirm your identity and complete the online-cap and no-PHI acknowledgements."
          : "Work through the micro-lessons and knowledge checks to complete this module.",
        cta: `Open ${def?.code ?? "Module"}`,
        to: `/journey/module/${id}`,
      };
    }
  }
  if (!activeTimeMet(state)) {
    return {
      label: "Meet the active-time threshold",
      note: "Active-time is measured by a real MVP engine at a demo threshold (not CDPH-validated). Keep engaging with lessons.",
      cta: "Open Modules",
      to: "/journey",
    };
  }
  if (!state.finalExamPassed) {
    return {
      label: "Pass the final exam/test",
      note: "Take the preview final exam (25 of 50, 80% to pass).",
      cta: "Open Final Review",
      to: "/journey/final",
    };
  }
  if (!state.affidavitComplete) {
    return {
      label: "Complete the final statement/affidavit",
      note: "Draft only — e-signature method is unresolved.",
      cta: "Open Final Review",
      to: "/journey/final",
    };
  }
  return {
    label: "Review your certificate readiness",
    note: "All required gates pass. The certificate remains a mock preview only.",
    cta: "Open Certificate Status",
    to: "/journey/appendix-f",
  };
}
