import type { PaymentRoute, RepresentativeAuthority } from "./patientAdmissionPacket";

/* ════════════════════════════════════════════════════════════════════════════
   Admission eCIgn — COMPUTED signer requirement model.

   Replaces the previously hardcoded signer rosters (a demo "Patient + Riley RN"
   pair in the studio, and a fixed 7-person governance roster in the Signature
   Tracker). The required and conditional signers for a Patient Admission Packet
   are DERIVED from the packet template plus the selected options (payment route,
   signer type / representative authority, interpreter use, HIPAA ROI request,
   telehealth/RPM enrollment, witness requirement, private-pay responsible party).

   Design rules (mirrors the legal intent of the packet):
   - Required by default on EVERY admission: Patient / Authorized Representative,
     and Admitting Clinician. These sign the single Master Signature ceremony.
   - Conditional signers appear ONLY when their trigger is present:
       • Witness            — when a representative signs, or operationally required
       • Interpreter        — when an interpreter was used at admission
       • HIPAA ROI (§5)     — separate authorization; never bundled into the
                              general admission signature
       • Private Pay (§8)   — ONLY for the Private Pay route; never for
                              Medicare / Medi-Cal / Medicaid / insurance routes
       • Telehealth / RPM (§19) — when the patient enrolls in telehealth / RPM
       • CMS official forms — ABN / HHCCN / NOMNC / DENC are SEPARATE eCIgn
                              workflows (Original Medicare FFS), not part of the
                              admission signature page
   - "Generate & schedule signature tasks" stays blocked until every required
     signer is assigned, every conditional decision is resolved, and the
     dependent fields (representative authority, payment route, private-pay
     responsible party) are complete.
   ════════════════════════════════════════════════════════════════════════════ */

export const ADMISSION_TEMPLATE_ID = "CI-HH-ADM-001";

export type SignerRoleId =
  | "PATIENT_OR_REPRESENTATIVE"
  | "ADMITTING_CLINICIAN"
  | "WITNESS"
  | "INTERPRETER"
  | "HIPAA_ROI"
  | "PRIVATE_PAY_RESPONSIBLE_PARTY"
  | "TELEHEALTH_RPM"
  | "CMS_OFFICIAL_FORMS";

export type SignerTier = "required" | "conditional";

/** A conditional signer is either auto-resolved from deterministic packet inputs
 *  (payment route) or awaits an explicit human decision in the Signature Tracker. */
export type ConditionalDecision = "undecided" | "included" | "excluded";

/** A tri-state operational input: known true/false, or not yet decided. */
export type TriState = boolean | "undecided";

export interface SignerRequirement {
  id: SignerRoleId;
  /** Human-facing signer role label (no person names baked in). */
  role: string;
  tier: SignerTier;
  /** Whether this signer is required/triggered given the current inputs. */
  required: boolean;
  /** Why this signer is (or is not) required — shown verbatim in the UI. */
  reason: string;
  /** Section / form reference (e.g. "§5", "§8", "§19"), when applicable. */
  formRef?: string;
  /** CMS official notices are a SEPARATE eCIgn workflow, not the admission sig. */
  separateWorkflow?: boolean;
  /** Whether a conditional row still needs a human decision in the Tracker. */
  decision?: ConditionalDecision;
  /** Whether the decision is fixed by the packet (route) and cannot be toggled. */
  decisionLocked?: boolean;
  /** Assigned signer name, filled in the Signature Tracker (never hardcoded). */
  assigneeName?: string;
}

export interface AdmissionSignerInput {
  templateId?: string;
  paymentRoute?: PaymentRoute;
  signerType?: "PATIENT" | "REPRESENTATIVE";
  representativeAuthority?: RepresentativeAuthority;
  representativeDocumentOnFile?: boolean;
  /** Interpreter used during admission (conditional Interpreter signer). */
  interpreterUsed?: TriState;
  /** HIPAA Release of Information requested at §5 (separate authorization). */
  hipaaRoiRequested?: TriState;
  /** Telehealth / Remote Patient Monitoring enrollment at §19. */
  telehealthRpmEnrolled?: TriState;
  /** Witness explicitly required (independent of representative signing). */
  witnessRequired?: TriState;
  /** Private-pay responsible party name (§8) when the Private Pay route is used. */
  privatePayResponsiblePartyName?: string;
  /** Per-role assigned names + resolved decisions, merged over the computed base. */
  assignments?: Partial<Record<SignerRoleId, { assigneeName?: string; decision?: ConditionalDecision }>>;
}

export interface AdmissionSignerModel {
  templateId: string;
  required: SignerRequirement[];
  conditional: SignerRequirement[];
  /** Human-readable list of everything still blocking task generation. */
  unresolved: string[];
  /** True only when all required signers are assigned and all conditionals resolved. */
  canGenerate: boolean;
}

const REAL_REPRESENTATIVE_AUTHORITIES: RepresentativeAuthority[] = [
  "LEGAL_GUARDIAN",
  "POWER_OF_ATTORNEY",
  "HEALTH_CARE_SURROGATE",
  "AUTHORIZED_REPRESENTATIVE",
];

function asTri(value: TriState | undefined): TriState {
  return value === undefined ? "undecided" : value;
}

function hasName(name: string | undefined): boolean {
  return !!name && name.trim().length > 0;
}

/**
 * Compute the full Required + Conditional signer requirement model for an
 * admission packet from the template + selected options. Pure & deterministic.
 */
export function computeAdmissionSigners(input: AdmissionSignerInput): AdmissionSignerModel {
  const templateId = input.templateId ?? ADMISSION_TEMPLATE_ID;
  const signerType = input.signerType ?? "PATIENT";
  const repAuthority = input.representativeAuthority ?? (signerType === "PATIENT" ? "PATIENT_SELF" : "NONE");
  const assignments = input.assignments ?? {};

  const apply = (req: SignerRequirement): SignerRequirement => {
    const override = assignments[req.id];
    return {
      ...req,
      assigneeName: override?.assigneeName ?? req.assigneeName,
      decision: override?.decision ?? req.decision,
    };
  };

  // ── Required signers (every admission) ──────────────────────────────────────
  const required: SignerRequirement[] = [
    apply({
      id: "PATIENT_OR_REPRESENTATIVE",
      role: signerType === "REPRESENTATIVE" ? "Authorized Representative" : "Patient / Authorized Representative",
      tier: "required",
      required: true,
      reason:
        signerType === "REPRESENTATIVE"
          ? "An authorized representative is signing on the patient's behalf; documented signing authority is required."
          : "Every admission requires the patient's or authorized representative's signature on the Master Signature ceremony.",
      formRef: "§20",
    }),
    apply({
      id: "ADMITTING_CLINICIAN",
      role: "Admitting Clinician",
      tier: "required",
      required: true,
      reason: "The admitting clinician attests to the admission, the reviewed agreement, and the plan of care.",
      formRef: "§20",
    }),
  ];

  // ── Conditional signers (only when triggered) ──────────────────────────────
  const interpreterUsed = asTri(input.interpreterUsed);
  const hipaaRoi = asTri(input.hipaaRoiRequested);
  const telehealth = asTri(input.telehealthRpmEnrolled);
  const witnessFlag = asTri(input.witnessRequired);

  const representativeSigning = signerType === "REPRESENTATIVE";
  const isPrivatePay = input.paymentRoute === "PRIVATE_PAY";
  const isOriginalMedicare = input.paymentRoute === "ORIGINAL_MEDICARE_FFS";

  const conditional: SignerRequirement[] = [];

  // Witness — forced when a representative signs; otherwise an operational decision.
  {
    const forced = representativeSigning || witnessFlag === true;
    const decisionLocked = representativeSigning;
    conditional.push(
      apply({
        id: "WITNESS",
        role: "Witness",
        tier: "conditional",
        required: forced,
        reason: representativeSigning
          ? "A witness is required because an authorized representative is signing for the patient."
          : forced
            ? "A witness has been marked required for this admission."
            : "Add a witness only if agency policy or the signing circumstances require one.",
        decisionLocked,
        decision: decisionLocked ? "included" : witnessFlag === "undecided" ? "undecided" : forced ? "included" : "excluded",
      }),
    );
  }

  // Interpreter — when an interpreter was used at admission.
  conditional.push(
    apply({
      id: "INTERPRETER",
      role: "Interpreter",
      tier: "conditional",
      required: interpreterUsed === true,
      reason:
        interpreterUsed === true
          ? "An interpreter assisted the patient at admission and attests to faithful interpretation."
          : "Required only when an interpreter assisted the patient during admission.",
      decision: interpreterUsed === "undecided" ? "undecided" : interpreterUsed ? "included" : "excluded",
    }),
  );

  // HIPAA Release of Information (§5) — a SEPARATE authorization signature.
  conditional.push(
    apply({
      id: "HIPAA_ROI",
      role: "HIPAA Release of Information Signer",
      tier: "conditional",
      required: hipaaRoi === true,
      reason:
        hipaaRoi === true
          ? "A HIPAA Release of Information was requested; it is signed as a separate authorization, not bundled into the general admission signature."
          : "Required only when a HIPAA Release of Information is requested (signed as a separate authorization).",
      formRef: "§5",
      decision: hipaaRoi === "undecided" ? "undecided" : hipaaRoi ? "included" : "excluded",
    }),
  );

  // Private Pay responsible party (§8) — ONLY for the Private Pay route.
  conditional.push(
    apply({
      id: "PRIVATE_PAY_RESPONSIBLE_PARTY",
      role: "Private Pay Responsible Party",
      tier: "conditional",
      required: isPrivatePay,
      reason: isPrivatePay
        ? "The Private Pay route requires the financially responsible party to sign the payment terms (§8)."
        : "Applies only to the Private Pay route; it does not apply to Medicare, Medi-Cal/Medicaid, or insurance routes.",
      formRef: "§8",
      // Deterministic from the route — locked, no human toggle needed.
      decision: isPrivatePay ? "included" : "excluded",
      decisionLocked: true,
    }),
  );

  // Telehealth / RPM consent (§19) — when the patient enrolls.
  conditional.push(
    apply({
      id: "TELEHEALTH_RPM",
      role: "Telehealth / RPM Consent Signer",
      tier: "conditional",
      required: telehealth === true,
      reason:
        telehealth === true
          ? "The patient is enrolling in telehealth / remote patient monitoring and signs the dedicated consent (§19)."
          : "Required only when the patient enrolls in telehealth / remote patient monitoring (§19).",
      formRef: "§19",
      decision: telehealth === "undecided" ? "undecided" : telehealth ? "included" : "excluded",
    }),
  );

  // CMS official forms — separate eCIgn workflows for Original Medicare FFS.
  conditional.push(
    apply({
      id: "CMS_OFFICIAL_FORMS",
      role: "CMS Official Forms (ABN / HHCCN / NOMNC / DENC)",
      tier: "conditional",
      required: isOriginalMedicare,
      reason: isOriginalMedicare
        ? "Original Medicare Fee-for-Service triggers official CMS notices (ABN, HHCCN, NOMNC, DENC) handled as separate signature workflows."
        : "Triggered only by the Original Medicare Fee-for-Service route; handled as separate official-form workflows.",
      separateWorkflow: true,
      decision: isOriginalMedicare ? "included" : "excluded",
      decisionLocked: true,
    }),
  );

  // ── Gating ─────────────────────────────────────────────────────────────────
  const unresolved: string[] = [];

  if (!input.paymentRoute) {
    unresolved.push("Select a payment route for the packet.");
  }

  for (const req of required) {
    if (!hasName(req.assigneeName)) {
      unresolved.push(`Assign a signer for the required role: ${req.role}.`);
    }
  }

  if (representativeSigning) {
    const authorityOk = REAL_REPRESENTATIVE_AUTHORITIES.includes(repAuthority) && input.representativeDocumentOnFile === true;
    if (!authorityOk) {
      unresolved.push("Representative signing requires a documented authority (guardian, POA, surrogate, or authorized representative) on file.");
    }
  }

  for (const req of conditional) {
    // Non-locked rows need an explicit include/exclude decision first.
    if (!req.decisionLocked && (!req.decision || req.decision === "undecided")) {
      unresolved.push(`Resolve whether a ${req.role} is required for this admission.`);
      continue;
    }
    const active = req.decision === "included" || (req.decisionLocked && req.required);
    // Active signers need a named assignee — except separate-workflow CMS notices,
    // which are handled as their own official-form signature workflows.
    if (active && !req.separateWorkflow && !hasName(req.assigneeName)) {
      unresolved.push(`Assign a signer for: ${req.role}.`);
    }
  }

  return {
    templateId,
    required,
    conditional,
    unresolved,
    canGenerate: unresolved.length === 0,
  };
}

/* ── Task generation ────────────────────────────────────────────────────────
   Build eCIgn signature tasks from a RESOLVED model. Every task is bound to the
   same packetId / form instance / canonical artifact — no duplicate artifacts
   per signer — and carries the audit trail (rendered + suppressed sections,
   signer role/type, packet hash, timestamp). CMS official forms are emitted as
   separate-workflow tasks, not part of the admission signature ceremony. */

export interface SignerTaskContext {
  packetId: string;
  formInstanceId: string;
  artifactId: string;
  packetHash: string;
  paymentRoute?: PaymentRoute;
  renderedSectionIds: string[];
  suppressedSectionIds: string[];
  generatedAt: string;
}

export interface AdmissionSignerTask {
  taskId: string;
  packetId: string;
  formInstanceId: string;
  artifactId: string;
  roleId: SignerRoleId;
  role: string;
  assigneeName: string;
  tier: SignerTier;
  separateWorkflow: boolean;
  status: "scheduled";
  audit: {
    packetHash: string;
    paymentRoute?: PaymentRoute;
    renderedSectionIds: string[];
    suppressedSectionIds: string[];
    scheduledAt: string;
    reason: string;
  };
}

/**
 * Produce the scheduled signer tasks for the resolved model. Only required
 * signers and conditional signers whose decision is "included" become tasks.
 * Throws if the model is not ready (defensive — the UI should gate first).
 */
export function buildAdmissionSignerTasks(
  model: AdmissionSignerModel,
  ctx: SignerTaskContext,
): AdmissionSignerTask[] {
  if (!model.canGenerate) {
    throw new Error(`Cannot generate signer tasks — unresolved: ${model.unresolved.join("; ")}`);
  }
  const active = [
    ...model.required,
    ...model.conditional.filter((r) => r.decision === "included" || (r.decisionLocked && r.required)),
  ];

  return active.map((req) => ({
    taskId: `${ctx.packetId}::${req.id}`,
    packetId: ctx.packetId,
    formInstanceId: ctx.formInstanceId,
    artifactId: ctx.artifactId,
    roleId: req.id,
    role: req.role,
    assigneeName: req.assigneeName?.trim() ?? "",
    tier: req.tier,
    separateWorkflow: !!req.separateWorkflow,
    status: "scheduled",
    audit: {
      packetHash: ctx.packetHash,
      paymentRoute: ctx.paymentRoute,
      renderedSectionIds: ctx.renderedSectionIds,
      suppressedSectionIds: ctx.suppressedSectionIds,
      scheduledAt: ctx.generatedAt,
      reason: req.reason,
    },
  }));
}
