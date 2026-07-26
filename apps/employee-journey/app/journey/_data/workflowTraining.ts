/**
 * Workflow-training contract (§8) — a small, reusable definition the future shared
 * Workflow Training component can consume without remapping assignments. The temporary
 * CL-WF-26 renderer implements THIS contract; swapping in the shared component later is a
 * renderer change, not a data change.
 *
 * All data is synthetic, no-PHI, and never mutates any production/operational state.
 */

export type WorkflowFieldKind = "multiselect" | "radiogroup" | "select" | "checkbox" | "text" | "date";

export interface WorkflowField {
  id: string;
  label: string;
  kind: WorkflowFieldKind;
  /** For multiselect/radiogroup/select. */
  options?: { value: string; label: string }[];
  required: boolean;
  help?: string;
}

export interface WorkflowStageDef {
  id: string;
  label: string;
  title: string;
  task: string;
  fields: WorkflowField[];
  /** Human description of what must be true for the stage to be VALID. */
  gate: string;
}

export interface WorkflowTrainingDefinition {
  id: string;
  title: string;
  teaches: string;
  fixture: string;
  stages: WorkflowStageDef[];
}

export type WorkflowStageStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "VALID"
  | "NEEDS_CORRECTION"
  | "COMPLETE";

export type WorkflowFieldValue = string | string[] | boolean;

export interface WorkflowValidationResult {
  status: WorkflowStageStatus;
  missing: string[];
}

/** A stage is VALID only when every REQUIRED field is satisfied (multiselect: ≥1;
 * checkbox: true; text/date/select/radio: non-empty). This is the gate that prevents
 * "open the last stage → 100%". */
export function validateStage(
  stage: WorkflowStageDef,
  values: Record<string, WorkflowFieldValue | undefined>,
): WorkflowValidationResult {
  const missing: string[] = [];
  for (const f of stage.fields) {
    if (!f.required) continue;
    const v = values[f.id];
    const ok =
      f.kind === "multiselect"
        ? Array.isArray(v) && v.length > 0
        : f.kind === "checkbox"
          ? v === true
          : typeof v === "string" && v.trim().length > 0;
    if (!ok) missing.push(f.id);
  }
  const anyTouched = stage.fields.some((f) => values[f.id] !== undefined);
  if (missing.length === 0) return { status: "VALID", missing };
  return { status: anyTouched ? "IN_PROGRESS" : "NOT_STARTED", missing };
}

export interface WorkflowCompletionPreview {
  totalStages: number;
  validStages: number;
  percent: number;
  allValid: boolean;
}

export function completionPreview(
  def: WorkflowTrainingDefinition,
  statuses: Record<string, WorkflowStageStatus>,
): WorkflowCompletionPreview {
  const valid = def.stages.filter((s) => statuses[s.id] === "VALID" || statuses[s.id] === "COMPLETE").length;
  return {
    totalStages: def.stages.length,
    validStages: valid,
    percent: Math.round((valid / def.stages.length) * 100),
    allValid: valid === def.stages.length,
  };
}

// ── CL-WF-26 (training simulation of the monthly clinical feeder audit) ───────
export const CL_WF_26_DEFINITION: WorkflowTrainingDefinition = {
  id: "TRAIN-CL-WF-26",
  title: "Plan of Care Audit Simulation",
  teaches: "Monthly clinical feeder audit that feeds the quarterly QA-WF-03 QAPI review.",
  fixture: "TRAIN-CL-WF-26-2026-05 · no PHI · no production mutation",
  stages: [
    {
      id: "sample",
      label: "Sample",
      title: "Select the monthly Plan of Care audit sample",
      task: "Choose a defensible active-episode sample from the no-PHI fixture and record why.",
      gate: "At least one episode selected AND a sample rationale entered.",
      fields: [
        {
          id: "episodes",
          label: "Select episodes for the audit sample",
          kind: "multiselect",
          required: true,
          options: [
            { value: "EP-1041", label: "EP-1041 · active · SOC 05-02" },
            { value: "EP-1067", label: "EP-1067 · active · recert due" },
            { value: "EP-1090", label: "EP-1090 · active · new orders" },
            { value: "EP-1120", label: "EP-1120 · discharged 04-28 (out of scope)" },
          ],
        },
        { id: "rationale", label: "Sample rationale", kind: "text", required: true, help: "Why this sample is defensible for the audit month." },
      ],
    },
    {
      id: "score",
      label: "Score",
      title: "Score required Plan of Care audit points",
      task: "Score each required review point for the sampled charts.",
      gate: "Every required criterion scored.",
      fields: [
        { id: "poc-present", label: "Plan of Care present & signed", kind: "radiogroup", required: true, options: [{ value: "met", label: "Met" }, { value: "not-met", label: "Not met" }, { value: "na", label: "N/A" }] },
        { id: "freq", label: "Visit frequency aligns to physician order", kind: "radiogroup", required: true, options: [{ value: "met", label: "Met" }, { value: "not-met", label: "Not met" }, { value: "na", label: "N/A" }] },
        { id: "notes-support", label: "Visit notes support ordered care", kind: "radiogroup", required: true, options: [{ value: "met", label: "Met" }, { value: "not-met", label: "Not met" }, { value: "na", label: "N/A" }] },
        { id: "finding-note", label: "Finding note", kind: "text", required: true },
      ],
    },
    {
      id: "verify",
      label: "Verify",
      title: "Verify evidence before findings are trusted",
      task: "Classify each finding's evidence so only supported findings advance.",
      gate: "Every finding classified as verified / insufficient / follow-up.",
      fields: [
        { id: "ev-poc", label: "Evidence for the Plan-of-Care finding", kind: "select", required: true, options: [{ value: "verified", label: "Verified" }, { value: "insufficient", label: "Insufficient" }, { value: "follow-up", label: "Needs follow-up" }] },
        { id: "ev-freq", label: "Evidence for the frequency finding", kind: "select", required: true, options: [{ value: "verified", label: "Verified" }, { value: "insufficient", label: "Insufficient" }, { value: "follow-up", label: "Needs follow-up" }] },
      ],
    },
    {
      id: "analyze",
      label: "Analyze",
      title: "Identify trend, severity, and QAPI impact",
      task: "Read the simulated trend and decide whether this audit must feed QAPI.",
      gate: "Trend, severity, and the QA-WF-03 feed decision all chosen.",
      fields: [
        { id: "trend", label: "Trend vs prior month", kind: "select", required: true, options: [{ value: "improving", label: "Improving" }, { value: "flat", label: "Flat" }, { value: "worsening", label: "Worsening" }] },
        { id: "severity", label: "Severity", kind: "select", required: true, options: [{ value: "low", label: "Low" }, { value: "moderate", label: "Moderate" }, { value: "high", label: "High" }] },
        { id: "qapi-feed", label: "Does this require a QA-WF-03 QAPI feed?", kind: "radiogroup", required: true, options: [{ value: "yes", label: "Yes — feed QAPI" }, { value: "no", label: "No" }] },
      ],
    },
    {
      id: "correct",
      label: "Correct",
      title: "Draft corrective action (training-only)",
      task: "Draft a corrective action. No production record is changed.",
      gate: "Owner, due date, and effectiveness check all selected.",
      fields: [
        { id: "owner", label: "Corrective-action owner", kind: "select", required: true, options: [{ value: "don", label: "Director of Nursing" }, { value: "clin-mgr", label: "Clinical Manager" }, { value: "qapi", label: "QAPI Coordinator" }] },
        { id: "due", label: "Due date", kind: "date", required: true },
        { id: "effectiveness", label: "Effectiveness check", kind: "select", required: true, options: [{ value: "re-audit", label: "30-day re-audit" }, { value: "spot-check", label: "Weekly spot-check" }, { value: "inservice", label: "Targeted in-service" }] },
      ],
    },
    {
      id: "sign-feed",
      label: "Sign & Feed",
      title: "Signature readiness & QAPI feed",
      task: "Confirm the packet is ready to sign and hand off downstream — in training state only.",
      gate: "Signer sequence confirmed AND QA-WF-03 downstream feed acknowledged.",
      fields: [
        { id: "signer-seq", label: "Signer sequence is correct (auditor → clinical manager → DON)", kind: "checkbox", required: true },
        { id: "qa-handoff", label: "I understand this feeds the quarterly QA-WF-03 review (downstream only)", kind: "checkbox", required: true },
        { id: "training-ack", label: "I understand this preview records no official completion", kind: "checkbox", required: true },
      ],
    },
  ],
};
