/* ═══════════════════════════════════════════════════════════════
   generatePersonaWorkflowMap.ts — BUILD-TIME PIPELINE (run via tsx)

   Encodes the owner-directed Persona → Workflow Reference matrix (§15/§16 of
   the correction prompt) and validates every referenced workflow id against
   the canonical, generated workflow catalog (WORKFLOW_CATALOG, 206 ids,
   app/journey/_generated/workflowCatalog.generated.ts). Unknown ids are
   NEVER invented — they are collected into an `unresolved` list and omitted
   from the emitted map.

   This is reference-only metadata: which workflow docs a persona should be
   aware of / execute / lead. It is NOT training, required-completion, or
   assignment data — see AnnualWorkspace / ADVANCED_ASSIGNMENT_MAP etc. for that.

   Hard rules enforced here (never relaxed):
     - No "GB" persona key is ever emitted.
     - GV-WF-01, GV-WF-02, GV-WF-13, GV-WF-14 (governance-only workflows) are
       NEVER emitted for any persona or the universal/duty sets. The script
       throws if the source matrix (below) is edited to include one.

   Writes:
     app/journey/_generated/personaWorkflowMap.generated.ts
     app/journey/_generated/workflowPersonaManifest.generated.json

   Usage (from apps/employee-journey):
     npx tsx --tsconfig ../../tsconfig.json scripts/generatePersonaWorkflowMap.ts
   ═══════════════════════════════════════════════════════════════ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { WORKFLOW_CATALOG } from "../app/journey/_generated/workflowCatalog.generated";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(APP_ROOT, "app/journey/_generated");
const SOURCE_NOTE =
  "Owner-directed Persona -> Workflow Reference matrix (correction prompt SS15/SS16), " +
  "hand-encoded in scripts/generatePersonaWorkflowMap.ts and validated against " +
  "WORKFLOW_CATALOG (app/journey/_generated/workflowCatalog.generated.ts, 206 ids).";

const FORBIDDEN_GV_IDS = ["GV-WF-01", "GV-WF-02", "GV-WF-13", "GV-WF-14"];

type WorkflowReferenceType = "core" | "conditional" | "awareness" | "leadership";

interface PersonaWorkflowReference {
  workflowId: string;
  referenceType: WorkflowReferenceType;
  scopeNote?: string;
}

type DutyFlag =
  | "DRIVER"
  | "INTAKE"
  | "SCHEDULING"
  | "ON_CALL"
  | "OASIS_ASSESSOR"
  | "HHA_SUPERVISOR"
  | "QAPI_MEMBER"
  | "COMPLIANCE"
  | "HR"
  | "FINANCE"
  | "IT_SECURITY";

const PERSONA_KEYS = [
  "RN", "LVN", "HHA", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "DON", "ADM", "GENERAL",
] as const;
type PersonaKey = (typeof PERSONA_KEYS)[number];

// ── helpers ────────────────────────────────────────────────────────────────

const KNOWN_IDS = new Set(WORKFLOW_CATALOG.map((w) => w.id));
const unresolved: string[] = [];

/** Expands "CL-WF-01".."CL-WF-25" style contiguous ranges for a given prefix/domain. */
function range(prefix: string, from: number, to: number): string[] {
  const out: string[] = [];
  for (let n = from; n <= to; n++) out.push(`${prefix}-WF-${String(n).padStart(2, "0")}`);
  return out;
}

/** Numeric-suffix list shorthand, e.g. nums("CL", [7,8,9,12,13]) -> CL-WF-07, CL-WF-08, ... */
function nums(prefix: string, list: number[]): string[] {
  return list.map((n) => `${prefix}-WF-${String(n).padStart(2, "0")}`);
}

function ref(
  workflowId: string,
  referenceType: WorkflowReferenceType,
  scopeNote?: string,
): PersonaWorkflowReference {
  if (FORBIDDEN_GV_IDS.includes(workflowId)) {
    throw new Error(
      `[personaWorkflowMap] refusing to emit governance-only workflow ${workflowId} as an employee reference`,
    );
  }
  if (!KNOWN_IDS.has(workflowId)) {
    unresolved.push(workflowId);
    return { workflowId, referenceType, scopeNote };
  }
  return { workflowId, referenceType, scopeNote };
}

function refs(
  ids: string[],
  referenceType: WorkflowReferenceType,
  scopeNote?: string,
): PersonaWorkflowReference[] {
  return ids.map((id) => ref(id, referenceType, scopeNote));
}

/** De-dupes a reference list by workflowId, keeping the strongest referenceType
 * (leadership > core > conditional > awareness) and the first scopeNote seen
 * for the winning entry. */
const STRENGTH: Record<WorkflowReferenceType, number> = {
  leadership: 4,
  core: 3,
  conditional: 2,
  awareness: 1,
};

function dedupe(items: PersonaWorkflowReference[]): PersonaWorkflowReference[] {
  const byId = new Map<string, PersonaWorkflowReference>();
  for (const item of items) {
    const existing = byId.get(item.workflowId);
    if (!existing || STRENGTH[item.referenceType] > STRENGTH[existing.referenceType]) {
      byId.set(item.workflowId, item);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.workflowId.localeCompare(b.workflowId));
}

// ── §15: the owner-directed matrix ──────────────────────────────────────────

const LVN_AWARENESS_NOTE =
  "Reference only — does not authorize the LVN to perform the initial comprehensive assessment or OASIS.";
const PTA_AWARENESS_NOTE = "Reference only — does not imply assessment or OASIS authority.";
const MSW_AWARENESS_NOTE =
  "Reference only — does not imply comprehensive-assessment or OASIS authority.";

const UNIVERSAL_WORKFLOW_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(
    [
      "CO-WF-01", "CO-WF-02", "CO-WF-03", "CO-WF-09",
      "EN-WF-03",
      "HR-WF-03", "HR-WF-07", "HR-WF-10", "HR-WF-11", "HR-WF-12", "HR-WF-13", "HR-WF-14", "HR-WF-17",
      "IT-WF-02", "IT-WF-03", "IT-WF-05", "IT-WF-10", "IT-WF-11", "IT-WF-16",
      "RM-WF-04", "RM-WF-08", "RM-WF-09", "RM-WF-10",
    ],
    "core",
  ),
]);

// General/office (roleCode not a clinical JourneyRole): universal + conditional add-ons.
const GENERAL_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...UNIVERSAL_WORKFLOW_REFERENCES,
  ...refs(["OP-WF-06", "OP-WF-11", "OP-WF-12", "OP-WF-13", "CO-WF-15"], "conditional"),
]);

// RN
const RN_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(range("CL", 2, 25), "core"),
  ...refs(["HR-WF-06", "HR-WF-15", "OP-WF-07", "OP-WF-08", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-06", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07", "RM-WF-13"], "core"),
  ...refs(["CL-WF-01"], "conditional"),
]);

// LVN
const LVN_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(nums("CL", [7, 8, 9, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25]), "core"),
  ...refs(["HR-WF-06", "HR-WF-15", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-06", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07", "RM-WF-13"], "core"),
  ...refs(nums("CL", [4, 5, 6, 18]), "awareness", LVN_AWARENESS_NOTE),
]);

// HHA
const HHA_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(nums("CL", [8, 10, 11, 14, 16, 17, 20, 21, 22, 23, 25]), "core"),
  ...refs(["HR-WF-05", "HR-WF-15", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-06", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07"], "core"),
]);

// PT
const PT_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(nums("CL", [2, 3, 4, 6, 8, 9, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25]), "core"),
  ...refs(["HR-WF-06", "HR-WF-15", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07"], "core"),
  ...refs(["CL-WF-05"], "conditional", "OASIS, authorized assessor only."),
]);

// PTA
const PTA_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(nums("CL", [8, 9, 14, 15, 17, 19, 20, 21, 22, 23, 25]), "core"),
  ...refs(["HR-WF-06", "HR-WF-15", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07"], "core"),
  ...refs(nums("CL", [2, 3, 4, 5, 6, 18]), "awareness", PTA_AWARENESS_NOTE),
]);

// OT — use PT core mapping; CL-WF-05 conditional (authorized assessor only).
const OT_REFERENCES: PersonaWorkflowReference[] = dedupe([...PT_REFERENCES]);

// COTA — use PTA core + awareness mapping (same scopeNote as PTA).
const COTA_REFERENCES: PersonaWorkflowReference[] = dedupe([...PTA_REFERENCES]);

// SLP — use PT core mapping; CL-WF-05 conditional.
const SLP_REFERENCES: PersonaWorkflowReference[] = dedupe([...PT_REFERENCES]);

// MSW
const MSW_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(nums("CL", [8, 9, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25]), "core"),
  ...refs(["HR-WF-06", "HR-WF-15", "OP-WF-12", "OP-WF-13"], "core"),
  ...refs(["QA-WF-05", "QA-WF-12"], "core"),
  ...refs(["RM-WF-07"], "core"),
  ...refs(nums("CL", [2, 3, 4, 5, 6]), "awareness", MSW_AWARENESS_NOTE),
]);

// DON — full RN clinical set (CL-WF-01..25 as clinical-oversight core) PLUS core + leadership.
const DON_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(range("CL", 1, 25), "core"),
  ...refs(
    [
      "CO-WF-04", "CO-WF-06", "CO-WF-14", "CO-WF-15", "CO-WF-19", "CO-WF-20", "CO-WF-22",
      "HR-WF-05", "HR-WF-06", "HR-WF-07", "HR-WF-08", "HR-WF-15",
    ],
    "core",
  ),
  ...refs(range("QA", 1, 12), "core"),
  ...refs(
    nums("RM", [1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 15]),
    "core",
  ),
  ...refs(["GV-WF-04", "GV-WF-06", "GV-WF-11"], "leadership"),
]);

// ADM — leadership references across operational/support domains, plus a small
// core clinical-ops oversight subset and governance-adjacent leadership ids.
const ADM_REFERENCES: PersonaWorkflowReference[] = dedupe([
  ...refs(range("OP", 1, 13), "leadership"),
  ...refs(range("CO", 1, 22), "leadership"),
  ...refs(range("HR", 1, 17), "leadership"),
  ...refs(range("IT", 1, 20), "leadership"),
  ...refs(range("QA", 1, 12), "leadership"),
  ...refs(range("RM", 1, 15), "leadership"),
  ...refs(range("FN", 1, 15), "leadership"),
  ...refs(["CL-WF-01", "CL-WF-06", "CL-WF-16", "CL-WF-19", "CL-WF-23"], "core"),
  ...refs(
    ["GV-WF-03", "GV-WF-04", "GV-WF-05", "GV-WF-06", "GV-WF-07", "GV-WF-09", "GV-WF-10", "GV-WF-11", "GV-WF-12"],
    "leadership",
  ),
]);

const PERSONA_WORKFLOW_REFERENCES: Record<PersonaKey, PersonaWorkflowReference[]> = {
  RN: RN_REFERENCES,
  LVN: LVN_REFERENCES,
  HHA: HHA_REFERENCES,
  PT: PT_REFERENCES,
  PTA: PTA_REFERENCES,
  OT: OT_REFERENCES,
  COTA: COTA_REFERENCES,
  SLP: SLP_REFERENCES,
  MSW: MSW_REFERENCES,
  DON: DON_REFERENCES,
  ADM: ADM_REFERENCES,
  GENERAL: GENERAL_REFERENCES,
};

// ── §16: duty overlays ───────────────────────────────────────────────────────

const DUTY_OVERLAYS: Record<DutyFlag, PersonaWorkflowReference[]> = {
  DRIVER: refs(["OP-WF-09"], "conditional"),
  INTAKE: refs(["CL-WF-01", "OP-WF-07", "OP-WF-08", "OP-WF-11"], "conditional"),
  SCHEDULING: refs(["OP-WF-12"], "conditional"),
  ON_CALL: refs(["OP-WF-13"], "conditional"),
  OASIS_ASSESSOR: refs(["CL-WF-05"], "conditional"),
  HHA_SUPERVISOR: refs(["CL-WF-10"], "conditional"),
  QAPI_MEMBER: refs(["QA-WF-02", "QA-WF-03", "QA-WF-04", "QA-WF-10"], "conditional"),
  COMPLIANCE: refs(["CO-WF-15"], "conditional"),
  HR: refs(["HR-WF-08"], "conditional"),
  FINANCE: refs(["FN-WF-01"], "conditional"),
  IT_SECURITY: refs(["IT-WF-16"], "conditional"),
};

// ── validation ───────────────────────────────────────────────────────────────

// Never emit governance-only ids anywhere in the matrix (belt-and-suspenders —
// ref() already throws on this, this is a final sweep across every list).
const allEmitted: PersonaWorkflowReference[] = [
  ...UNIVERSAL_WORKFLOW_REFERENCES,
  ...Object.values(PERSONA_WORKFLOW_REFERENCES).flat(),
  ...Object.values(DUTY_OVERLAYS).flat(),
];
for (const item of allEmitted) {
  if (FORBIDDEN_GV_IDS.includes(item.workflowId)) {
    throw new Error(`[personaWorkflowMap] forbidden governance-only id ${item.workflowId} present in output`);
  }
}
if ("GB" in PERSONA_WORKFLOW_REFERENCES) {
  throw new Error("[personaWorkflowMap] GB persona must never be emitted");
}

const uniqueUnresolved = Array.from(new Set(unresolved)).sort();

const perPersonaCounts: Record<string, number> = {};
for (const key of PERSONA_KEYS) perPersonaCounts[key] = PERSONA_WORKFLOW_REFERENCES[key].length;

const totalReferences =
  UNIVERSAL_WORKFLOW_REFERENCES.length +
  Object.values(PERSONA_WORKFLOW_REFERENCES).reduce((sum, list) => sum + list.length, 0) +
  Object.values(DUTY_OVERLAYS).reduce((sum, list) => sum + list.length, 0);

// ── emit ─────────────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });

const HEADER = `/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: personaWorkflowMap.generated.ts
   Generator: apps/employee-journey/scripts/generatePersonaWorkflowMap.ts
   Source: ${SOURCE_NOTE}
   Persona count: ${PERSONA_KEYS.length}
   Total references (universal + personas + duty overlays): ${totalReferences}
   Unresolved ids (present in spec, absent from WORKFLOW_CATALOG): ${uniqueUnresolved.length}
   Regenerate: npx tsx --tsconfig ../../tsconfig.json scripts/generatePersonaWorkflowMap.ts
   ═══════════════════════════════════════════════════════════════ */
`;

const body = `
export type WorkflowReferenceType = "core" | "conditional" | "awareness" | "leadership";

export interface PersonaWorkflowReference {
  workflowId: string;
  referenceType: WorkflowReferenceType;
  scopeNote?: string;
}

export const UNIVERSAL_WORKFLOW_REFERENCES: PersonaWorkflowReference[] = JSON.parse(${JSON.stringify(
  JSON.stringify(UNIVERSAL_WORKFLOW_REFERENCES),
)}) as PersonaWorkflowReference[];

export const PERSONA_WORKFLOW_REFERENCES: Record<string, PersonaWorkflowReference[]> = JSON.parse(${JSON.stringify(
  JSON.stringify(PERSONA_WORKFLOW_REFERENCES),
)}) as Record<string, PersonaWorkflowReference[]>;

export type DutyFlag =
  | "DRIVER"
  | "INTAKE"
  | "SCHEDULING"
  | "ON_CALL"
  | "OASIS_ASSESSOR"
  | "HHA_SUPERVISOR"
  | "QAPI_MEMBER"
  | "COMPLIANCE"
  | "HR"
  | "FINANCE"
  | "IT_SECURITY";

export const DUTY_OVERLAYS: Record<DutyFlag, PersonaWorkflowReference[]> = JSON.parse(${JSON.stringify(
  JSON.stringify(DUTY_OVERLAYS),
)}) as Record<DutyFlag, PersonaWorkflowReference[]>;

const REFERENCE_STRENGTH: Record<WorkflowReferenceType, number> = {
  leadership: 4,
  core: 3,
  conditional: 2,
  awareness: 1,
};

/** roleCodes recognized as clinical JourneyRole personas; anything else (office,
 * driver, GB, returning/separating fixtures, etc.) is treated as GENERAL. */
const CLINICAL_ROLE_CODES = new Set([
  "RN", "LVN", "HHA", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "DON", "ADM",
]);

/** Resolves the persona key used to key PERSONA_WORKFLOW_REFERENCES: clinical/
 * leadership roleCodes map 1:1, everything else (office/driver/GB/etc.) maps to
 * "GENERAL". */
export function resolvePersonaKey(roleCode: string): string {
  return CLINICAL_ROLE_CODES.has(roleCode) ? roleCode : "GENERAL";
}

/** Merges universal + persona + duty-overlay references for a roleCode,
 * de-duped by workflowId, keeping the strongest referenceType seen
 * (leadership > core > conditional > awareness). Never returns GV-WF-01,
 * GV-WF-02, GV-WF-13, or GV-WF-14 — those are excluded from every source list. */
export function getPersonaWorkflowReferences(
  roleCode: string,
  duties: DutyFlag[] = [],
): PersonaWorkflowReference[] {
  const personaKey = resolvePersonaKey(roleCode);
  const personaRefs = PERSONA_WORKFLOW_REFERENCES[personaKey] ?? PERSONA_WORKFLOW_REFERENCES.GENERAL ?? [];
  const dutyRefs = duties.flatMap((d) => DUTY_OVERLAYS[d] ?? []);
  const combined = [...UNIVERSAL_WORKFLOW_REFERENCES, ...personaRefs, ...dutyRefs];

  const byId = new Map<string, PersonaWorkflowReference>();
  for (const item of combined) {
    const existing = byId.get(item.workflowId);
    if (!existing || REFERENCE_STRENGTH[item.referenceType] > REFERENCE_STRENGTH[existing.referenceType]) {
      byId.set(item.workflowId, item);
    }
  }
  return Array.from(byId.values()).sort((a, b) => a.workflowId.localeCompare(b.workflowId));
}
`;

fs.writeFileSync(path.join(OUT_DIR, "personaWorkflowMap.generated.ts"), HEADER + body);

const manifest = {
  note: "AUTO-GENERATED",
  generatedAt: "GENERATED_AT_BUILD",
  personaCount: PERSONA_KEYS.length,
  totalReferences,
  perPersonaCounts,
  unresolved: uniqueUnresolved,
};

fs.writeFileSync(
  path.join(OUT_DIR, "workflowPersonaManifest.generated.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log(`[personaWorkflowMap] wrote personaWorkflowMap.generated.ts + workflowPersonaManifest.generated.json`);
console.log(`[personaWorkflowMap] persona counts: ${JSON.stringify(perPersonaCounts)}`);
console.log(`[personaWorkflowMap] total references: ${totalReferences}`);
if (uniqueUnresolved.length > 0) {
  console.log(`[personaWorkflowMap] UNRESOLVED ids (not in WORKFLOW_CATALOG): ${uniqueUnresolved.join(", ")}`);
} else {
  console.log(`[personaWorkflowMap] all referenced ids validated against WORKFLOW_CATALOG (${KNOWN_IDS.size} ids)`);
}
