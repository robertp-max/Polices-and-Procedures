// UNIFIED GATE MODEL — single source of truth for Dashboard, Certificate Status,
// Gate Center, and Audit. Optional Clinical Support is NEVER a gate.

import { hasLegalName, type LearnerState } from "./learnerState";
import {
  isModule0Complete,
  requiredTheoryComplete,
  requiredInteractionComplete,
  activeTimeMet,
  totalRequiredActiveSeconds,
} from "./moduleProgress";
import { ACTIVE_TIME } from "./activeTime";

export type GateStatus = "complete" | "pending" | "blocked" | "needs-review" | "not-started";

export type Gate = {
  key: string;
  label: string;
  description: string; // plain English — never raw booleans
  status: GateStatus;
  /** Whether this gate contributes to certificate readiness. */
  affectsCertificate: boolean;
  blocker?: string;
  simulated?: boolean; // Phase 1 placeholder (active-time, final exam, affidavit)
};

export function computeGates(state: LearnerState): Gate[] {
  const m0 = isModule0Complete(state);
  const theory = requiredTheoryComplete(state);
  const interaction = requiredInteractionComplete(state);
  const timeMet = activeTimeMet(state);
  const accruedSeconds = totalRequiredActiveSeconds(state);

  const gate = (
    key: string,
    label: string,
    description: string,
    pass: boolean,
    opts: { affectsCertificate?: boolean; simulated?: boolean; pendingNotStarted?: boolean; blocker?: string } = {},
  ): Gate => ({
    key,
    label,
    description,
    status: pass ? "complete" : opts.pendingNotStarted ? "not-started" : "pending",
    affectsCertificate: opts.affectsCertificate ?? true,
    simulated: opts.simulated,
    blocker: pass ? undefined : opts.blocker,
  });

  return [
    {
      key: "approvalMetadata",
      label: "Provider approval metadata (NAC#)",
      description: "Provider approval number and certificate wording must be on file before any production certificate can be issued.",
      status: state.approvalMetadataPresent ? "complete" : "needs-review",
      affectsCertificate: false, // does not block the mock preview; blocks production issuance
      blocker: state.approvalMetadataPresent ? undefined : "Approval metadata is pending. Certificate remains a mock preview only.",
    },
    gate("legalName", "Legal name present", "Your legal first and last name are recorded for the certificate.", hasLegalName(state), {
      blocker: "Add your legal first and last name in Module 0.",
    }),
    gate("cnaNumber", "CNA certificate number present", "Your CNA certificate number is recorded.", Boolean(state.cnaNumber.trim()), {
      blocker: "Add your CNA certificate number in Module 0.",
    }),
    gate("onlineCap", "Online cap acknowledgement", "You acknowledged the 24-hour online CE cap and partial-credit boundary.", state.onlineCapAck, {
      blocker: "Acknowledge the online CE cap in Module 0.",
    }),
    gate("noPhi", "No-PHI acknowledgement", "You acknowledged the no-PHI policy for all course activities.", state.phiAck, {
      blocker: "Acknowledge the no-PHI policy in Module 0.",
    }),
    gate("theory", "Required theory complete", "All required theory modules (0–6) are complete.", theory, {
      pendingNotStarted: !m0,
      blocker: "Finish all required theory modules.",
    }),
    gate("interaction", "Required interaction/feedback complete", "You completed the required lesson interactions and knowledge checks.", interaction, {
      blocker: "Complete the required knowledge checks in the modules.",
    }),
    {
      key: "activeTime",
      label: "Active-time threshold (MVP engine — not CDPH-validated)",
      description: `Active-time is measured by a real MVP engine at a demo threshold (${accruedSeconds}s of ${ACTIVE_TIME.CERT_GATE_SECONDS}s accrued across required lessons). It is not yet CDPH-validated.`,
      status: timeMet ? "complete" : "pending",
      affectsCertificate: true,
      simulated: true,
      blocker: timeMet ? undefined : `Active-time threshold not yet met (${accruedSeconds}s / ${ACTIVE_TIME.CERT_GATE_SECONDS}s, demo scale).`,
    },
    {
      key: "finalExam",
      label: "Final exam/test passed (simulated)",
      description: "The final exam must be passed at the required threshold. Simulated/locked in this preview.",
      status: state.finalExamPassed ? "complete" : state.finalExamAttempted ? "blocked" : "not-started",
      affectsCertificate: true,
      simulated: true,
      blocker: state.finalExamPassed ? undefined : "Final exam not yet passed (simulated/locked in this preview).",
    },
    {
      key: "affidavit",
      label: "Final statement/affidavit complete (simulated)",
      description: "A signed final statement is required before release. Draft only; e-signature method is unresolved.",
      status: state.affidavitComplete ? "complete" : "not-started",
      affectsCertificate: true,
      simulated: true,
      blocker: state.affidavitComplete ? undefined : "Final statement/affidavit not yet complete (draft only).",
    },
    gate("certificateFields", "Certificate fields populated", "Required certificate output fields are present.", state.certificateFieldsPopulated, {
      blocker: "Certificate field map incomplete.",
    }),
    gate("adminHold", "Admin hold clear", "No manual compliance hold is active on this record.", state.adminHoldClear, {
      blocker: "An administrative hold is active.",
    }),
  ];
}

export type GateSummary = {
  gates: Gate[];
  certificateGates: Gate[];
  passingCount: number;
  totalCount: number;
  blockers: Gate[];
  /** Mock-preview readiness: all certificate-affecting gates pass. */
  certificatePreviewReady: boolean;
  /** Production issuance also requires approval metadata — always false in Phase 1. */
  productionIssuable: boolean;
};

export function summarizeGates(state: LearnerState): GateSummary {
  const gates = computeGates(state);
  const certificateGates = gates.filter((g) => g.affectsCertificate);
  const passingCount = certificateGates.filter((g) => g.status === "complete").length;
  const blockers = certificateGates.filter((g) => g.status !== "complete");
  const certificatePreviewReady = blockers.length === 0;
  const approval = gates.find((g) => g.key === "approvalMetadata");
  return {
    gates,
    certificateGates,
    passingCount,
    totalCount: certificateGates.length,
    blockers,
    certificatePreviewReady,
    productionIssuable: certificatePreviewReady && approval?.status === "complete",
  };
}
