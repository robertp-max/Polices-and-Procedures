import { describe, it, expect } from "vitest";
import {
  computeAdmissionSigners,
  buildAdmissionSignerTasks,
  ADMISSION_TEMPLATE_ID,
  type AdmissionSignerInput,
  type SignerTaskContext,
} from "./admissionSignerModel";

const ctx: SignerTaskContext = {
  packetId: "CI-HH-ADM-001-1730000000000",
  formInstanceId: "form-instance-1",
  artifactId: "artifact-1",
  packetHash: "fnv1a-deadbeef",
  paymentRoute: "PRIVATE_PAY",
  renderedSectionIds: ["route-private-pay", "patient-rights"],
  suppressedSectionIds: ["medicare-coverage-rights"],
  generatedAt: "2026-07-01T12:00:00.000Z",
};

/** Fully resolve a model's required + included roles with placeholder names so
 *  canGenerate flips true — lets a scenario assert task shape end-to-end. */
function fullyAssign(input: AdmissionSignerInput): AdmissionSignerInput {
  const base = computeAdmissionSigners(input);
  const assignments: NonNullable<AdmissionSignerInput["assignments"]> = {};
  for (const r of base.required) assignments[r.id] = { assigneeName: `Signer ${r.id}` };
  for (const r of base.conditional) {
    if (r.required || r.decision === "included") assignments[r.id] = { assigneeName: `Signer ${r.id}`, decision: "included" };
    else if (!r.decisionLocked) assignments[r.id] = { decision: "excluded" };
  }
  return { ...input, assignments };
}

describe("computeAdmissionSigners — required defaults", () => {
  it("always requires Patient/Representative + Admitting Clinician", () => {
    const m = computeAdmissionSigners({ paymentRoute: "PENDING_VERIFICATION" });
    expect(m.required.map((r) => r.id)).toEqual(["PATIENT_OR_REPRESENTATIVE", "ADMITTING_CLINICIAN"]);
    expect(m.required.every((r) => r.required)).toBe(true);
  });

  it("uses the admission template id by default and contains no demo names", () => {
    const m = computeAdmissionSigners({});
    expect(m.templateId).toBe(ADMISSION_TEMPLATE_ID);
    const blob = JSON.stringify(m);
    expect(blob).not.toMatch(/Riley RN|Eleanor|Dakota Director/);
  });
});

describe("Scenario A — Original Medicare FFS, patient signs", () => {
  const input: AdmissionSignerInput = { paymentRoute: "ORIGINAL_MEDICARE_FFS", signerType: "PATIENT" };
  it("triggers CMS official forms as a separate workflow, no private pay signer", () => {
    const m = computeAdmissionSigners(input);
    const cms = m.conditional.find((r) => r.id === "CMS_OFFICIAL_FORMS")!;
    const pp = m.conditional.find((r) => r.id === "PRIVATE_PAY_RESPONSIBLE_PARTY")!;
    expect(cms.required).toBe(true);
    expect(cms.separateWorkflow).toBe(true);
    expect(pp.required).toBe(false);
  });
  it("CMS forms become a separate-workflow task once resolved", () => {
    const m = computeAdmissionSigners(fullyAssign(input));
    expect(m.canGenerate).toBe(true);
    const tasks = buildAdmissionSignerTasks(m, { ...ctx, paymentRoute: "ORIGINAL_MEDICARE_FFS" });
    expect(tasks.find((t) => t.roleId === "CMS_OFFICIAL_FORMS")?.separateWorkflow).toBe(true);
  });
});

describe("Scenario B — Private Pay, patient signs", () => {
  const input: AdmissionSignerInput = { paymentRoute: "PRIVATE_PAY", signerType: "PATIENT" };
  it("requires a Private Pay responsible party (§8)", () => {
    const m = computeAdmissionSigners(input);
    const pp = m.conditional.find((r) => r.id === "PRIVATE_PAY_RESPONSIBLE_PARTY")!;
    expect(pp.required).toBe(true);
    expect(pp.formRef).toBe("§8");
  });
  it("blocks generation until the responsible party is named", () => {
    const m = computeAdmissionSigners(input);
    expect(m.canGenerate).toBe(false);
    expect(m.unresolved.join(" ")).toMatch(/responsible party|Private Pay/i);
  });
});

describe("Scenario C — Representative (POA) signs", () => {
  it("requires documented authority and forces a witness", () => {
    const m = computeAdmissionSigners({
      paymentRoute: "PENDING_VERIFICATION",
      signerType: "REPRESENTATIVE",
      representativeAuthority: "POWER_OF_ATTORNEY",
      representativeDocumentOnFile: true,
    });
    const witness = m.conditional.find((r) => r.id === "WITNESS")!;
    expect(witness.required).toBe(true);
    expect(witness.decisionLocked).toBe(true);
  });
  it("blocks when representative authority is missing", () => {
    const m = computeAdmissionSigners({
      paymentRoute: "PENDING_VERIFICATION",
      signerType: "REPRESENTATIVE",
      representativeAuthority: "NONE",
      representativeDocumentOnFile: false,
    });
    expect(m.canGenerate).toBe(false);
    expect(m.unresolved.join(" ")).toMatch(/documented authority/i);
  });
});

describe("Scenario D — Interpreter used", () => {
  it("adds the Interpreter signer when used", () => {
    const m = computeAdmissionSigners({ paymentRoute: "PENDING_VERIFICATION", interpreterUsed: true });
    expect(m.conditional.find((r) => r.id === "INTERPRETER")?.required).toBe(true);
  });
  it("leaves Interpreter undecided (blocking) when not specified", () => {
    const m = computeAdmissionSigners({ paymentRoute: "PENDING_VERIFICATION" });
    const interp = m.conditional.find((r) => r.id === "INTERPRETER")!;
    expect(interp.decision).toBe("undecided");
    expect(m.canGenerate).toBe(false);
  });
});

describe("Scenario E — HIPAA ROI requested (§5)", () => {
  it("adds a separate HIPAA ROI authorization signer, not bundled", () => {
    const m = computeAdmissionSigners({ paymentRoute: "PENDING_VERIFICATION", hipaaRoiRequested: true });
    const roi = m.conditional.find((r) => r.id === "HIPAA_ROI")!;
    expect(roi.required).toBe(true);
    expect(roi.formRef).toBe("§5");
    expect(roi.reason).toMatch(/separate authorization/i);
  });
});

describe("Scenario F — Telehealth / RPM enrolled (§19)", () => {
  it("adds the Telehealth/RPM consent signer", () => {
    const m = computeAdmissionSigners({ paymentRoute: "PENDING_VERIFICATION", telehealthRpmEnrolled: true });
    expect(m.conditional.find((r) => r.id === "TELEHEALTH_RPM")?.required).toBe(true);
  });
});

describe("Scenario G — Medi-Cal / Medicaid", () => {
  it("never triggers a Private Pay signer and never triggers CMS official forms", () => {
    const m = computeAdmissionSigners({ paymentRoute: "MEDI_CAL_OR_MEDICAID", signerType: "PATIENT" });
    expect(m.conditional.find((r) => r.id === "PRIVATE_PAY_RESPONSIBLE_PARTY")?.required).toBe(false);
    expect(m.conditional.find((r) => r.id === "CMS_OFFICIAL_FORMS")?.required).toBe(false);
  });
});

describe("buildAdmissionSignerTasks — single canonical artifact + audit", () => {
  const input: AdmissionSignerInput = { paymentRoute: "PRIVATE_PAY", signerType: "PATIENT", privatePayResponsiblePartyName: "Responsible Party" };
  it("binds every task to the same packetId / artifact and carries audit", () => {
    const m = computeAdmissionSigners(fullyAssign(input));
    expect(m.canGenerate).toBe(true);
    const tasks = buildAdmissionSignerTasks(m, ctx);
    expect(tasks.length).toBeGreaterThanOrEqual(3); // patient + clinician + private pay
    expect(new Set(tasks.map((t) => t.packetId)).size).toBe(1);
    expect(new Set(tasks.map((t) => t.artifactId)).size).toBe(1);
    expect(new Set(tasks.map((t) => t.taskId)).size).toBe(tasks.length); // no duplicates
    for (const t of tasks) {
      expect(t.audit.packetHash).toBe(ctx.packetHash);
      expect(t.audit.renderedSectionIds).toEqual(ctx.renderedSectionIds);
      expect(t.audit.suppressedSectionIds).toEqual(ctx.suppressedSectionIds);
    }
  });
  it("throws if the model is not ready", () => {
    const m = computeAdmissionSigners(input); // unresolved conditionals
    expect(() => buildAdmissionSignerTasks(m, ctx)).toThrow(/unresolved/i);
  });
});
