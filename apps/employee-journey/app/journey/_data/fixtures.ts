/* ═══════════════════════════════════════════════════════════════
 * Fixtures + generated-data view models for the Employee Journey app.
 *
 * PERSONAS, JourneyPhase, and FocusItem below remain hand-authored
 * synthetic preview scaffolding (no canonical source models a
 * per-employee onboarding timeline or a "what should I look at today"
 * list). Everything else in this file that carries a real assignment
 * IDENTITY (training module ids, policy ids/assignment ids, course
 * ids, quiz bundles, evidence appendices) is sourced from
 * app/journey/_generated/*.generated.ts, which is baked at build time
 * from the xlsx matrix + main-app canonical sources. Dates, statuses,
 * and progress state remain synthetic (no completion-tracking backend
 * exists in this preview) and are called out as such in the UI copy.
 * ═══════════════════════════════════════════════════════════════ */

import {
  MODULE_ASSIGNMENT_MAP,
} from "../_generated/moduleAssignmentMap.generated";
import {
  MODULE_CATALOG,
  getGeneratedModule,
  type GeneratedModule,
} from "../_generated/moduleCatalog.generated";
import { getModulePlayerEntry } from "../_generated/modulePlayerMap.generated";
import {
  getPolicyAssignmentsForPathway,
  type GeneratedPolicyAssignment,
} from "../_generated/policyAssignmentMap.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import { getQuizBundle } from "../_generated/policyQuizMap.generated";
import { getAppendixForm } from "../_generated/appendixForms.generated";
import {
  asJourneyRole,
  pathwayForRoleCode,
  getAgencyAnnualPlan,
  getEmergencyDrills,
  getAchcBundle,
} from "./annualAdvancedCatalog";

/** Maps a persona's optional secondaryRole DISPLAY NAME (e.g. "Registered
 * Nurse") to the JourneyRole code used by the generated registries. Only
 * the roles actually used as a secondaryRole in PERSONAS below need an
 * entry; extend if a future persona adds another dual-role fixture. */
const ROLE_DISPLAY_TO_CODE: Record<string, string> = {
  "Registered Nurse": "RN",
  "Licensed Vocational Nurse": "LVN",
  "Home Health Aide": "HHA",
  "Physical Therapist": "PT",
  "Physical Therapist Assistant": "PTA",
  "Occupational Therapist": "OT",
  "Certified Occupational Therapy Assistant": "COTA",
  "Speech-Language Pathologist": "SLP",
  "Medical Social Worker": "MSW",
  "Director of Nursing": "DON",
  Administrator: "ADM",
};

/** Primary + secondary role codes for a persona, deduplicated. This is
 * the "strictest gate" union: a dual-role persona (e.g. avery-don, DON
 * primary / RN secondary) is assigned the UNION of both roles'
 * requirements, never just the primary role's narrower set. */
function roleCodesForPersona(persona: Persona): string[] {
  const codes = [persona.roleCode];
  if (persona.secondaryRole) {
    const mapped = ROLE_DISPLAY_TO_CODE[persona.secondaryRole];
    if (mapped && !codes.includes(mapped)) codes.push(mapped);
  }
  return codes;
}

/** Deterministic (not random) index into a status cycle, seeded by a
 * stable string so the same persona+id always renders the same
 * synthetic preview state within and across sessions. This is
 * explicitly a design-review placeholder for "what does each status
 * look like" — it is not a completion-tracking system. */
function stableIndex(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % modulo;
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Not supplied";
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export type PersonaId =
  | "taylor-rn"
  | "jordan-lvn"
  | "morgan-hha"
  | "casey-pta"
  | "avery-don"
  | "riley-administrator"
  | "jamie-office"
  | "skyler-driver"
  | "parker-returning"
  | "cameron-separating";

export type Persona = {
  id: PersonaId;
  fixtureId: string;
  name: string;
  role: string;
  secondaryRole?: string;
  stage: string;
  stageIndex: number;
  startDate: string;
  roleCode: string;
  descriptor: string;
  nextDocumentDate: string;
  scenarioTags: string[];
};

export const PERSONAS: Persona[] = [
  {
    id: "taylor-rn",
    fixtureId: "DEMO-RN-001",
    name: "Taylor Demo RN",
    role: "Registered Nurse",
    stage: "First 30 days",
    stageIndex: 4,
    startDate: "2026-07-06",
    roleCode: "RN",
    descriptor: "New hire · supervised practice",
    nextDocumentDate: "2027-04-30",
    scenarioTags: ["RN new hire", "Day 30 employee"],
  },
  {
    id: "jordan-lvn",
    fixtureId: "DEMO-LVN-001",
    name: "Jordan Demo LVN",
    role: "Licensed Vocational Nurse",
    stage: "Ongoing / recurring",
    stageIndex: 9,
    startDate: "2025-11-03",
    roleCode: "LVN",
    descriptor: "Active field worker · RN oversight",
    nextDocumentDate: "2026-11-30",
    scenarioTags: ["LVN active field worker"],
  },
  {
    id: "morgan-hha",
    fixtureId: "DEMO-HHA-001",
    name: "Morgan Demo HHA",
    role: "Home Health Aide",
    stage: "Ongoing / recurring",
    stageIndex: 9,
    startDate: "2025-09-01",
    roleCode: "HHA",
    descriptor: "Skilled-patient fixture · annual hours due",
    nextDocumentDate: "2026-08-31",
    scenarioTags: ["HHA with 14-day visit due", "HHA with annual hours due"],
  },
  {
    id: "casey-pta",
    fixtureId: "DEMO-PTA-001",
    name: "Casey Demo PTA",
    role: "Physical Therapist Assistant",
    stage: "Day 90 evaluation",
    stageIndex: 8,
    startDate: "2026-04-25",
    roleCode: "PTA",
    descriptor: "Awaiting PT supervision review",
    nextDocumentDate: "2027-01-31",
    scenarioTags: ["PTA awaiting supervision", "Day 90 employee"],
  },
  {
    id: "avery-don",
    fixtureId: "DEMO-DON-001",
    name: "Avery Demo DON",
    role: "Director of Nursing",
    secondaryRole: "Registered Nurse",
    stage: "Annual",
    stageIndex: 10,
    startDate: "2023-09-18",
    roleCode: "DON",
    descriptor: "Clinical leadership · dual-role fixture",
    nextDocumentDate: "2027-02-28",
    scenarioTags: ["DON annual review", "Multiple-role employee"],
  },
  {
    id: "riley-administrator",
    fixtureId: "DEMO-ADM-001",
    name: "Riley Demo Administrator",
    role: "Administrator",
    stage: "Policy update",
    stageIndex: 11,
    startDate: "2024-02-12",
    roleCode: "ADM",
    descriptor: "Leadership policy update",
    nextDocumentDate: "2027-02-12",
    scenarioTags: ["Administrator policy update"],
  },
  {
    id: "jamie-office",
    fixtureId: "DEMO-OFFICE-001",
    name: "Jamie Demo Office Employee",
    role: "Office Employee",
    stage: "Day 60 check-in",
    stageIndex: 7,
    startDate: "2026-05-25",
    roleCode: "GAO",
    descriptor: "Internal journey check-in",
    nextDocumentDate: "Not assigned",
    scenarioTags: ["General office employee", "Day 60 employee"],
  },
  {
    id: "skyler-driver",
    fixtureId: "DEMO-DRIVER-001",
    name: "Skyler Demo Field Driver",
    role: "Field Driver",
    stage: "Document renewal",
    stageIndex: 12,
    startDate: "2024-10-14",
    roleCode: "GAO",
    descriptor: "Driving condition · renewal due",
    nextDocumentDate: "2026-08-15",
    scenarioTags: ["Driver with expiring DL", "Employee with expiring auto insurance"],
  },
  {
    id: "parker-returning",
    fixtureId: "DEMO-RTW-001",
    name: "Parker Demo Returning From Leave",
    role: "Returning Employee",
    stage: "Leave / return to work",
    stageIndex: 14,
    startDate: "2024-08-19",
    roleCode: "GAO",
    descriptor: "Waiting for synthetic HR clearance",
    nextDocumentDate: "2026-07-29",
    scenarioTags: ["Employee on leave", "Returning employee"],
  },
  {
    id: "cameron-separating",
    fixtureId: "DEMO-SEP-001",
    name: "Cameron Demo Separating Employee",
    role: "Office Employee",
    stage: "Separation / offboarding",
    stageIndex: 15,
    startDate: "2022-03-07",
    roleCode: "GAO",
    descriptor: "Last synthetic workday July 31",
    nextDocumentDate: "Not applicable",
    scenarioTags: ["Separating employee"],
  },
];

export const DEFAULT_PERSONA_ID: PersonaId = "taylor-rn";

export function getPersona(id: string | null | undefined): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}

export type JourneyPhase = {
  id: string;
  label: string;
  date: string;
  status: "Complete" | "Current" | "Upcoming" | "Waiting" | "No action required";
  employeeActions: string;
  waitingOnHr: string;
  waitingOnSupervisor: string;
  training: string;
  policies: string;
  documents: string;
  competencies: string;
  performance: string;
  basis: string;
  nextMilestone: string;
};

type JourneyPhaseTemplate = Omit<
  JourneyPhase,
  "status" | "waitingOnHr" | "waitingOnSupervisor" | "nextMilestone"
>;

const phaseTemplates: JourneyPhaseTemplate[] = [
  {
    id: "pre-hire",
    label: "Pre-hire",
    date: "June 15–July 2, 2026",
    employeeActions: "Review synthetic clearance checklist (Appendix F).",
    training: "No employee training action.",
    policies: "HR-TA-001 through HR-TA-004",
    documents:
      "Identity/I-9, background + OIG/SAM exclusion screening (status only), license/cert primary-source verification, references, and health/TB/immunization clearance review.",
    competencies: "Not started.",
    performance: "Not started.",
    basis: "HR-TA-001 through HR-TA-004; HR-EH-101",
  },
  {
    id: "cleared",
    label: "Cleared to start",
    date: "July 2, 2026",
    employeeActions: "Confirm start details.",
    training: "Orientation assignments prepared.",
    policies: "No acknowledgment due.",
    documents: "Synthetic verification complete.",
    competencies: "Supervision plan prepared when role-applicable.",
    performance: "No review due.",
    basis: "HR-TA-004; HR-TA-005",
  },
  {
    id: "day-1",
    label: "Day 1",
    date: "July 6, 2026",
    employeeActions: "Begin GAO-001 and review assigned Code of Conduct.",
    training: "GAO-001 assigned.",
    policies: "CO-CP-004 acknowledgment assigned.",
    documents: "Employee profile review.",
    competencies: "Evaluator assignment shown for clinical roles.",
    performance: "Goals introduced.",
    basis: "HR-TA-005; CO-WF-02",
  },
  {
    id: "first-week",
    label: "First week",
    date: "July 6–10, 2026",
    employeeActions: "Complete required general orientation.",
    training: "General orientation sequence.",
    policies: "Privacy, safety, and reporting actions.",
    documents: "Resolve any clearance exceptions.",
    competencies: "Observe role-specific practice where applicable.",
    performance: "No formal evaluation.",
    basis: "HR-TA-005; HR-TR-101",
  },
  {
    id: "first-30",
    label: "First 30 days",
    date: "July 6–August 4, 2026",
    employeeActions: "Continue role training and prepare for supervised practice.",
    training: "Role-specific modules and policy quizzes.",
    policies: "Task-oriented assignments only.",
    documents: "Keep role credentials current.",
    competencies: "Supervised visits or role practice when applicable.",
    performance: "Goals and blockers tracked for the internal check-in.",
    basis: "HR-TA-005; HR-TD-003; CL-WF-25",
  },
  {
    id: "day-30",
    label: "Day 30 check-in",
    date: "August 5, 2026",
    employeeActions: "Review goals, support needs, and outstanding work.",
    training: "Review incomplete assignments.",
    policies: "Review open policy actions.",
    documents: "Review expiring or under-review items.",
    competencies: "Discuss evaluator feedback.",
    performance: "Internal journey check-in - not a formal evaluation.",
    basis: "Internal journey checkpoint",
  },
  {
    id: "days-31-60",
    label: "Days 31–60",
    date: "August 5–September 3, 2026",
    employeeActions: "Continue role development and supervised practice.",
    training: "Finish remaining onboarding assignments.",
    policies: "Complete revision-triggered actions if assigned.",
    documents: "Renew items that become due.",
    competencies: "Complete assignment-specific observation.",
    performance: "Apply Day 30 goals.",
    basis: "Internal journey phase; role policies",
  },
  {
    id: "day-60",
    label: "Day 60 check-in",
    date: "September 4, 2026",
    employeeActions: "Review progress and remaining readiness needs.",
    training: "Review remaining role development.",
    policies: "No universal action.",
    documents: "Confirm current role documents.",
    competencies: "Review follow-up needs.",
    performance: "Internal journey check-in - not a formal evaluation.",
    basis: "Internal journey checkpoint",
  },
  {
    id: "day-90",
    label: "Day 90 evaluation",
    date: "October 4, 2026",
    employeeActions: "Add employee comments; reviewer scores remain read-only.",
    training: "Training history available to reviewer.",
    policies: "Open policy actions remain separate.",
    documents: "No universal document action.",
    competencies: "Competency history available to reviewer.",
    performance: "Formal introductory evaluation.",
    basis: "HR-ER-001",
  },
  {
    id: "ongoing",
    label: "Ongoing / recurring",
    date: "Starts October 5, 2026",
    employeeActions: "Complete only assigned recurring requirements.",
    training: "Role and event-triggered work.",
    policies: "New or revised policy actions when assigned.",
    documents: "Renewal monitoring.",
    competencies: "Cadence remains role and assignment specific.",
    performance: "Coaching, goals, or follow-up when applicable.",
    basis: "HR-TR-101; applicable role policies",
  },
  {
    id: "annual",
    label: "Annual",
    date: "Training due March 1, 2027",
    employeeActions: "Complete the assigned annual plan.",
    training: "Agency annual plan - not a universal twelve-module claim.",
    policies: "Annual acknowledgments only when assigned.",
    documents: "Annual review of applicable credentials.",
    competencies: "Annual evaluation method depends on role and skills.",
    performance: "Annual evaluation window shown when scheduled.",
    basis: "HR-TD-001; HR-TR-101; HR-ER-001",
  },
  {
    id: "policy-update",
    label: "Policy update",
    date: "Not scheduled in this synthetic preview",
    employeeActions: "No action until a specific revision is assigned.",
    training: "Policy quiz only when assigned.",
    policies: "Version-specific read, acknowledge, or quiz action.",
    documents: "Not applicable.",
    competencies: "Not applicable unless the change affects practice.",
    performance: "Not applicable.",
    basis: "EN-LC-001; GV-PM-003",
  },
  {
    id: "document-renewal",
    label: "Document renewal",
    date: "Next role document: April 30, 2027",
    employeeActions: "Preview a renewal when the item becomes due.",
    training: "No universal training action.",
    policies: "Role-specific credential basis.",
    documents: "90/60/30-day synthetic reminder sequence.",
    competencies: "Clearance impact shown per document.",
    performance: "Not applicable.",
    basis: "HR-TA-004; HR-WM-007",
  },
  {
    id: "event-triggered",
    label: "Event-triggered",
    date: "Not scheduled in this synthetic preview",
    employeeActions: "No employee action required.",
    training: "Assigned after a defined event only.",
    policies: "Applicable event policy.",
    documents: "May require supporting documentation.",
    competencies: "Remediation or return demonstration only when assigned.",
    performance: "Coaching or follow-up only when assigned.",
    basis: "HR-TR-101; HR-TD-003",
  },
  {
    id: "leave-return",
    label: "Leave / return to work",
    date: "Not applicable in this synthetic preview",
    employeeActions: "No employee action required.",
    training: "No universal training action.",
    policies: "Return-to-work requirements when applicable.",
    documents: "Written clearance when required.",
    competencies: "Revalidation only when role or restrictions require it.",
    performance: "No employee approval action.",
    basis: "HR-EH-101",
  },
  {
    id: "separation",
    label: "Separation / offboarding",
    date: "Not scheduled in this synthetic preview",
    employeeActions: "No employee action required.",
    training: "Assignments close according to the offboarding workflow.",
    policies: "Continuing confidentiality reminder.",
    documents: "Return-property and final-document checklist.",
    competencies: "No new assignment.",
    performance: "Exit steps are read-only where reviewer-owned.",
    basis: "HR-ER-006",
  },
];

export function getJourneyPhases(persona: Persona): JourneyPhase[] {
  return phaseTemplates.map((template, index) => {
    let status: JourneyPhase["status"] =
      index < persona.stageIndex ? "Complete" : index === persona.stageIndex ? "Current" : "Upcoming";
    let date = template.date;
    let employeeActions = template.employeeActions;
    let waitingOnHr = "None";
    let waitingOnSupervisor = "None";

    if (index > persona.stageIndex + 2 && index >= 11) status = "No action required";
    if (persona.id === "parker-returning" && template.id === "leave-return") {
      status = "Waiting";
      date = "Planned return: July 29, 2026";
      employeeActions = "Review the synthetic return-to-work checklist.";
      waitingOnHr = "Demo HR Reviewer clearance review";
    }
    if (persona.id === "cameron-separating" && template.id === "separation") {
      status = "Current";
      date = "Synthetic last day: July 31, 2026";
      employeeActions = "Review offboarding actions and return-property checklist.";
      waitingOnHr = "Demo HR Reviewer final-document review";
    }
    if (persona.id === "skyler-driver" && template.id === "document-renewal") {
      status = "Current";
      date = "Driver's license: August 15, 2026";
      employeeActions = "Open the renewal drawer preview.";
    }
    if (persona.stageIndex <= 8 && template.id === "first-30") {
      waitingOnSupervisor = "Demo Clinical Evaluator visit review";
    }

    return {
      ...template,
      status,
      date,
      employeeActions,
      waitingOnHr,
      waitingOnSupervisor,
      nextMilestone: phaseTemplates[index + 1]?.label ?? "Journey history",
    };
  });
}

export type FocusItem = {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  label: string;
  detail: string;
  type: "blocker" | "overdue" | "due-soon" | "waiting" | "continue";
  href: string;
};

export function getFocusItems(persona: Persona): FocusItem[] {
  const shared: FocusItem[] = [
    {
      id: "continue",
      priority: 5,
      label: "Continue GAO-001",
      detail: "A New Journey · preview position preserved in this session",
      type: "continue",
      href: "/journey/training/gao-001",
    },
    {
      id: "policy",
      priority: 3,
      label: "Review Patient Rights update",
      detail: "CL-PR-001 · due July 28",
      type: "due-soon",
      href: "/journey/policies",
    },
  ];

  if (persona.id === "parker-returning") {
    shared.unshift({
      id: "rtw",
      priority: 1,
      label: "Return-to-work clearance",
      detail: "Waiting for Demo HR Reviewer · planned return July 29",
      type: "blocker",
      href: "/journey/documents",
    });
  } else if (persona.id === "skyler-driver") {
    shared.unshift({
      id: "license",
      priority: 1,
      label: "Renew driver's license",
      detail: "Expires August 15 · driving clearance impact",
      type: "blocker",
      href: "/journey/documents",
    });
  } else if (persona.id === "morgan-hha") {
    shared.unshift({
      id: "hha-visit",
      priority: 2,
      label: "RN supervisory visit due",
      detail: "Cadence shown for this synthetic skilled-patient assignment",
      type: "overdue",
      href: "/journey/competencies",
    });
  } else {
    shared.unshift({
      id: "competency",
      priority: 4,
      label: "Supervised practice review",
      detail: "Waiting for Demo Clinical Evaluator",
      type: "waiting",
      href: "/journey/competencies",
    });
  }

  shared.push({
    id: "check-in",
    priority: 3,
    label: persona.stage.includes("Day 60") ? "Day 60 internal check-in" : "Review next milestone",
    detail: `${persona.stage} · synthetic date shown in My Journey`,
    type: "due-soon",
    href: "/journey/my-journey",
  });

  return shared.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

export type TrainingAssignment = {
  id: string;
  title: string;
  whyAssigned: string;
  audience: string;
  dueDate: string;
  duration: string;
  status: "In progress" | "Required now" | "Due soon" | "Completed" | "Unavailable" | "Waiting";
  progress: string;
  prerequisite: string;
  validation: string;
  category: "Required now" | "Onboarding" | "Role-specific" | "Annual" | "Policy quiz" | "Competency" | "Workflows" | "Drill / live" | "Completed";
  action: string;
  href?: string;
  /** "local" = a route inside this journey app; "external" = a main-app
   * route that must be resolved through mainAppUrl/MainAppLink for a
   * same-tab cross-origin launch. Absent hrefs have no action link. */
  hrefKind?: "local" | "external";
  available: boolean;
  workflowDomain?: string;
  relationshipNote?: string;
};

function moduleAudienceLabel(mod: GeneratedModule): string {
  return mod.roles === "ALL" ? "All assigned employees" : mod.roles.join(", ");
}

function moduleDuration(mod: GeneratedModule): string {
  if (mod.durationMinutes == null) return "Not specified";
  if (mod.durationMinutes < 60) return `${mod.durationMinutes} minutes`;
  const hrs = mod.durationMinutes / 60;
  return Number.isInteger(hrs) ? `${hrs} hour${hrs === 1 ? "" : "s"}` : `${hrs.toFixed(1)} hours`;
}

function moduleValidation(mod: GeneratedModule): string {
  if (mod.method === "None") return "Read & acknowledge - no graded assessment on file";
  const pct = mod.passThreshold != null ? ` - ${Math.round(mod.passThreshold * 100)}% pass threshold` : "";
  return `${mod.method}${pct}`;
}

const TRAINING_STATUS_CYCLE: TrainingAssignment["status"][] = [
  "Completed",
  "In progress",
  "Required now",
  "Due soon",
];

function syntheticModuleStatus(
  mod: GeneratedModule,
  persona: Persona,
  playerAvailable: boolean,
): TrainingAssignment["status"] {
  if (!playerAvailable) return "Unavailable";
  return TRAINING_STATUS_CYCLE[stableIndex(`${persona.id}:${mod.id}`, TRAINING_STATUS_CYCLE.length)];
}

function moduleCategory(
  mod: GeneratedModule,
  status: TrainingAssignment["status"],
): TrainingAssignment["category"] {
  if (status === "Completed") return "Completed";
  if (mod.family === "GAO") return "Onboarding";
  if (mod.supervisorSignature || mod.supervisedVisitsRequired != null) return "Competency";
  return "Role-specific";
}

function buildModuleTrainingCard(
  mod: GeneratedModule,
  persona: Persona,
  roleCodes: string[],
): TrainingAssignment {
  const player = getModulePlayerEntry(mod.id);
  const playerAvailable = player?.playerAvailable ?? false;
  const status = syntheticModuleStatus(mod, persona, playerAvailable);
  const category = moduleCategory(mod, status);
  const isLocalGao001 = mod.id === "GAO-001";

  const assignedViaSecondaryOnly =
    !isLocalGao001 &&
    mod.roles !== "ALL" &&
    !(mod.roles as readonly string[]).includes(persona.roleCode) &&
    roleCodes.length > 1;

  const whyAssigned =
    mod.family === "GAO"
      ? "General agency orientation for this synthetic employee journey."
      : mod.supervisorSignature || mod.supervisedVisitsRequired != null
        ? `Supervised-practice / competency requirement from the ${mod.family} catalog family.`
        : assignedViaSecondaryOnly
          ? `Role-specific requirement assigned via the ${persona.secondaryRole ?? "secondary"} role.`
          : `Role-specific development for the ${persona.role} fixture.`;

  const dueDays = mod.family === "GAO" ? 14 : mod.supervisorSignature || mod.supervisedVisitsRequired != null ? 35 : 30;

  return {
    id: mod.id,
    title: mod.title,
    whyAssigned,
    audience: moduleAudienceLabel(mod),
    dueDate: addDaysIso(persona.startDate, dueDays),
    duration: moduleDuration(mod),
    status,
    progress:
      status === "Completed"
        ? "Practice complete"
        : status === "In progress"
          ? "Preview position preserved (synthetic session state)"
          : status === "Unavailable"
            ? "Content not yet available"
            : "Not started",
    prerequisite: mod.prerequisites.length ? mod.prerequisites.join(", ") : "None",
    validation: moduleValidation(mod),
    category,
    action: !playerAvailable
      ? "No employee action required"
      : status === "Completed"
        ? "Review preview"
        : status === "In progress"
          ? "Continue preview"
          : "Open preview",
    href: isLocalGao001 ? "/journey/training/gao-001" : (player?.launchRef ?? undefined),
    hrefKind: isLocalGao001 ? "local" : "external",
    available: playerAvailable,
  };
}

/** Module families this workspace renders directly. ANN/ACHC-ART/COMP/ADV
 * are deliberately excluded here even when MODULE_ASSIGNMENT_MAP lists them
 * under a role's "primaryModuleIds" (the raw modules.ts roles field mixes
 * them in per-role rather than marking them shared) - they are covered with
 * correct, audience-fixed logic by AnnualWorkspace/AdvancedWorkspace (see
 * annualAdvancedCatalog.ts) and are represented in this list only as
 * summary nav cards, to avoid duplicating (and potentially diverging from)
 * that audience logic. */
const TRAINING_WORKSPACE_FAMILIES = new Set(["GAO", "ADM", "DON", "RN", "LVN", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "HHA"]);

/** Real module ids assigned to this persona: GAO general-orientation
 * modules plus every role-specific module family the persona holds
 * (primary + secondary role, per MODULE_ASSIGNMENT_MAP - primary and
 * secondary lists are unioned before family-filtering since a module's
 * primary/secondary classification for a given role does not indicate
 * its family). */
function moduleIdsForPersona(persona: Persona): { ids: string[]; roleCodes: string[] } {
  const roleCodes = roleCodesForPersona(persona);
  const candidateIds = new Set<string>();
  let matchedAnyRole = false;
  for (const code of roleCodes) {
    const role = asJourneyRole(code);
    if (!role) continue;
    matchedAnyRole = true;
    const assignment = MODULE_ASSIGNMENT_MAP.find((entry) => entry.role === role);
    if (!assignment) continue;
    assignment.primaryModuleIds.forEach((id) => candidateIds.add(id));
    assignment.secondaryModuleIds.forEach((id) => candidateIds.add(id));
  }
  if (!matchedAnyRole) {
    // Office/driver/returning/separating personas (roleCode "GAO" in
    // PERSONAS) have no entry in MODULE_ASSIGNMENT_MAP (it only covers
    // the 11 clinical/leadership JourneyRole codes) — they inherit
    // only the General/GAO orientation family, matching the "General"
    // policy pathway they resolve to via pathwayForRoleCode.
    MODULE_CATALOG.filter((mod) => mod.family === "GAO").forEach((mod) => candidateIds.add(mod.id));
  }
  const ids = Array.from(candidateIds).filter((id) => {
    const mod = getGeneratedModule(id);
    return mod ? TRAINING_WORKSPACE_FAMILIES.has(mod.family) : false;
  });
  return { ids, roleCodes };
}

/** Course-level policy knowledge-check cards, one per unique
 * (pathway, courseId) with quizRequired=true in POLICY_ASSIGNMENT_MAP,
 * scoped to every pathway the persona's roles resolve to. This is the
 * real generated quiz bundle (POLICY_QUIZ_MAP) driving each card. */
function policyQuizCourseCards(persona: Persona): TrainingAssignment[] {
  const pathways = Array.from(new Set(roleCodesForPersona(persona).map((code) => pathwayForRoleCode(code))));
  const seenCourses = new Set<string>();
  const cards: TrainingAssignment[] = [];

  pathways.forEach((pathway) => {
    getPolicyAssignmentsForPathway(pathway)
      .filter((row) => row.quizRequired)
      .forEach((row) => {
        const courseKey = `${pathway}__${row.courseId}`;
        if (seenCourses.has(courseKey)) return;
        seenCourses.add(courseKey);

        const bundle = getQuizBundle(row.courseId);
        const bankStatus = bundle?.bankStatus ?? "MISSING";
        const available = bankStatus !== "MISSING";
        const policyCount = bundle?.policyIds.length ?? 1;
        const status: TrainingAssignment["status"] = row.blocked
          ? "Waiting"
          : !available
            ? "Unavailable"
            : bankStatus === "DRAFT_REVIEW_REQUIRED"
              ? "In progress"
              : "Required now";

        cards.push({
          id: courseKey,
          title: row.courseTitle,
          whyAssigned: `Policy knowledge check for the ${pathway} pathway (${policyCount} polic${policyCount === 1 ? "y" : "ies"} covered).`,
          audience: `${pathway} pathway`,
          dueDate: row.initialDue || "Not supplied",
          duration: bundle ? `${bundle.questionCount} questions - ${bundle.passScore}% pass` : "Not published",
          status,
          progress: !available
            ? "Question bank not yet published"
            : bankStatus === "DRAFT_REVIEW_REQUIRED"
              ? "Draft question bank - unofficial practice run"
              : "Not started",
          prerequisite: `Read ${row.policyId}${policyCount > 1 ? " and related policies" : ""}`,
          validation: bundle?.note ?? "No quiz bundle mapping exists yet for this course.",
          category: "Policy quiz",
          action: available ? "Open knowledge check" : "No employee action required",
          href: `/journey/policies/${row.assignmentId}/quiz`,
          hrefKind: "local",
          available,
        });
      });
  });

  return cards;
}

/** Single navigation/summary card for the Annual workspace - real
 * counts via annualAdvancedCatalog's audience-fixed logic, not a
 * duplicated per-item list (see moduleIdsForPersona comment above). */
function annualSummaryCard(persona: Persona): TrainingAssignment {
  const plan = getAgencyAnnualPlan(persona.roleCode);
  const achc = getAchcBundle(persona.roleCode);
  const achcCount = achc.assignedToRole ? achc.totalCount : 0;
  const totalCount = plan.onlineTraining.length + plan.policyLearning.length + achcCount;
  return {
    id: "ANNUAL-PLAN",
    title: "Agency annual plan",
    whyAssigned: `${totalCount} annual item${totalCount === 1 ? "" : "s"} assigned to the ${persona.role} pathway (online training, policy learning${achcCount ? ", and the ACHC field-worker bundle" : ""}).`,
    audience: persona.role,
    dueDate: "See the Annual workspace for each item's due date",
    duration: "Varies by item",
    status: totalCount > 0 ? "Required now" : "Waiting",
    progress: "Tracked in the Annual workspace",
    prerequisite: "General orientation sequence",
    validation: "Each item's method and pass threshold appears in the Annual workspace",
    category: "Annual",
    action: "Open annual plan",
    href: "/journey/training/annual",
    hrefKind: "local",
    available: totalCount > 0,
  };
}

function drillSummaryCard(persona: Persona): TrainingAssignment {
  const drills = getEmergencyDrills(persona.roleCode);
  return {
    id: "DRILL-LIVE-PLAN",
    title: "Emergency preparedness drills",
    whyAssigned: `${drills.length} drill/live activit${drills.length === 1 ? "y" : "ies"} assigned to the ${persona.role} pathway.`,
    audience: persona.role,
    dueDate: "See the Annual workspace Drills tab",
    duration: "Live participation",
    status: drills.length > 0 ? "Due soon" : "Waiting",
    progress: "Tracked in the Annual workspace",
    prerequisite: "Emergency preparedness orientation",
    validation: "Live participation verified outside this preview; evidenced by an After-Action Review form",
    category: "Drill / live",
    action: "Open annual plan",
    href: "/journey/training/annual",
    hrefKind: "local",
    available: drills.length > 0,
  };
}

const MANDATED_WORKFLOW_SOURCE = `
CL-WF-01|Intake & Referral Qualification
CL-WF-02|Homebound Status Determination
CL-WF-03|Face-to-Face Encounter Capture & Verification
CL-WF-04|Start of Care (SOC) Comprehensive Assessment
CL-WF-05|OASIS Completion, QA, Transmission & Correction
CL-WF-06|Plan of Care (POC / CMS-485) Establishment & Physician Signature
CL-WF-07|Physician Orders & Verbal Order Authentication
CL-WF-08|Coordination of Care & Multidisciplinary Communication
CL-WF-09|Skilled Visit Documentation (RN / PT / OT / SLP / MSW)
CL-WF-10|Home Health Aide Services & Supervision (Skilled-Patient Annual; Aide-Only Semiannual)
CL-WF-11|Annual Aide In-Service Training (>=12 hours)
CL-WF-12|Medication Management & Reconciliation
CL-WF-13|Wound Care & Specialty Clinical Protocols
CL-WF-14|Infection Control at Point of Care
CL-WF-15|Telehealth Service Delivery
CL-WF-16|Patient Rights, Admission Consent & Advance Directives
CL-WF-17|Patient / Family Education
CL-WF-18|Recertification / Resumption of Care (ROC)
CL-WF-19|Transfer / Discharge Planning & Execution
CL-WF-20|Missed Visit Management
CL-WF-21|Clinical Record Completion & Amendment
CL-WF-22|Abuse / Neglect / Exploitation Reporting
CL-WF-23|Patient Complaint / Grievance Handling
CL-WF-24|Pediatric / Palliative / High-Risk Specialty Pathways
CL-WF-25|Clinician Competency Validation (Incl. OASIS)
CO-WF-01|Annual Compliance Program Attestation
CO-WF-02|Code of Conduct Acknowledgment (Onboarding & Annual)
CO-WF-03|Compliance Hotline Intake & Investigation
CO-WF-04|Internal Compliance Audit Cycle
CO-WF-05|External Survey / Inspection Response & Plan of Correction
CO-WF-06|Regulatory Change Management
CO-WF-07|Anti-Kickback & Stark (AKS/Stark) Relationship Review
CO-WF-08|Fraud, Waste & Abuse (FWA) Training & Monitoring
CO-WF-09|HIPAA Workforce Training
CO-WF-10|HIPAA Breach Assessment, Investigation & Notification
CO-WF-11|Business Associate Agreement (BAA) Lifecycle
CO-WF-12|Patient Authorization & Accounting of Disclosures (HIPAA + CMIA)
CO-WF-13|Records Retention & Destruction
CO-WF-14|Documentation Alignment Audit
CO-WF-15|OIG/SAM Exclusion Screening (Monthly)
CO-WF-16|OIG Self-Disclosure Protocol
CO-WF-17|HIPAA Security Risk Analysis (Annual)
CO-WF-18|AI Tool Use Request & Governance
CO-WF-19|Medicare CoP Compliance Verification
CO-WF-20|Compliance Committee Meetings (Monthly)
CO-WF-21|California CMIA Disclosure & Sensitive Category Handling
CO-WF-22|Compliance Metrics & Quarterly Report to Governing Body
EN-WF-01|Policy Lifecycle: Draft -> Review -> Approve -> Publish -> Retire
EN-WF-02|Annual Policy Review (Full Framework)
EN-WF-03|Universal Policy Acknowledgment (All Staff)
EN-WF-04|Master Policy Index / Taxonomy Register Maintenance
EN-WF-05|Regulatory Change Management (Horizon Scanning)
EN-WF-06|Policy Version Control & Archive
EN-WF-07|Enterprise Document Control & Forms Library Governance
EN-WF-08|Records Retention & Destruction Schedule
EN-WF-09|Enterprise Mandatory Events Calendar
EN-WF-10|Enterprise KPI / Metrics Reporting
EN-WF-11|Enterprise Internal Audit & Management Review
EN-WF-12|Cross-Domain Risk Register Consolidation
EN-WF-13|Annual Compliance Attestation & Management Certification
FN-WF-01|Annual Operating Budget & Institutional Plan
FN-WF-02|Monthly Financial Close & Variance Reporting
FN-WF-03|Cost Report Preparation & Filing
FN-WF-04|HH PPS Claim Submission (RAP / Notice of Admission / Final Claim)
FN-WF-05|Claim Denial & Appeal Management
FN-WF-06|Additional Documentation Request (ADR) Response
FN-WF-07|Credit Balance Reporting (CMS-838)
FN-WF-08|60-Day Overpayment Identification & Return
FN-WF-09|Accounts Receivable & Bad Debt
FN-WF-10|Patient Billing, Financial Counseling & Charity Care
FN-WF-11|Accounts Payable & Vendor Payment
FN-WF-12|Payroll Processing
FN-WF-13|External Financial Audit
FN-WF-14|Chargemaster / Rate Review
FN-WF-15|RCM Self-Audit & Revenue Integrity
GV-WF-01|Governing Body Quarterly Meeting & Minutes
GV-WF-02|Annual Governing Body Self-Assessment
GV-WF-03|Administrator Appointment / Replacement / Delegation
GV-WF-04|Clinical Manager Appointment / Replacement
GV-WF-05|Annual Institutional Plan & Budget Approval
GV-WF-06|Annual Acceptance-to-Service Policy Review
GV-WF-07|Annual Public Service Information Review
GV-WF-08|Conflict of Interest Disclosure (Onboarding & Annual)
GV-WF-09|Agency Licensure & Certification Renewal Management
GV-WF-10|Change of Ownership / Agency Closure
GV-WF-11|Interagency / Third-Party Contract Review
GV-WF-12|Stakeholder / External Communication & Media Requests
GV-WF-13|Governing Body Training & Orientation
GV-WF-14|Executive Session Management
HR-WF-01|Job Requisition & Recruitment
HR-WF-02|Pre-Hire Screening (Background / OIG-SAM / License Verification)
HR-WF-03|Offer, Onboarding & New-Hire Orientation
HR-WF-04|Primary Source Verification & License Tracking
HR-WF-05|Home Health Aide Training & Competency (42 CFR section 484.80)
HR-WF-06|Skilled Professional Competency & Supervision
HR-WF-07|Annual Mandatory / Compliance Training
HR-WF-08|Performance Evaluation (Annual & Probationary)
HR-WF-09|Corrective Action / Progressive Discipline
HR-WF-10|Leave of Absence (FMLA / CFRA / ADA / PDL)
HR-WF-11|Accommodation Request (ADA / FEHA)
HR-WF-12|Discrimination / Harassment Complaint Investigation
HR-WF-13|Workplace Injury / Workers' Comp (OSHA Reporting)
HR-WF-14|Separation (Voluntary / Involuntary) & Exit
HR-WF-15|Monthly OIG/SAM Re-Screening
HR-WF-16|Independent Contractor / 1099 Classification
HR-WF-17|Wage & Hour Compliance (Timekeeping / Meal-Rest)
IT-WF-01|Annual Security Risk Analysis (SRA) & Risk Management Plan
IT-WF-02|User Access Provisioning (New Hire / Role Change)
IT-WF-03|User Access Termination (Separation)
IT-WF-04|Quarterly Access Review / Least-Privilege
IT-WF-05|Password / MFA Management
IT-WF-06|System Activity Audit Logging & Monitoring (164.312(b))
IT-WF-07|Backup, Data Restoration & Tabletop Test
IT-WF-08|Disaster Recovery & Business Continuity Exercise
IT-WF-09|IT Security Incident Response (Detection -> Contain -> Eradicate -> Recover)
IT-WF-10|Device & Endpoint Management (Encryption, MDM, Loss)
IT-WF-11|Mobile Device / BYOD Management
IT-WF-12|Removable Media / USB Restrictions
IT-WF-13|Patch & Vulnerability Management
IT-WF-14|Change Management
IT-WF-15|Vendor / Cloud SaaS Security Review & BAA
IT-WF-16|Email Security (Phishing, Encryption, DLP)
IT-WF-17|Data Backup Media Disposal / Sanitization
IT-WF-18|Remote Access / VPN
IT-WF-19|Facility Physical Access Controls (164.310)
IT-WF-20|Data Subject Rights (CMIA / CCPA Access, Delete, Correct)
OP-WF-01|Branch Registration & Quarterly Operations Review
OP-WF-02|Facility/Branch Inspection (Quarterly)
OP-WF-03|Vendor Lifecycle Management (Request -> Onboard -> Monitor -> Offboard)
OP-WF-04|Approved Vendor List Maintenance
OP-WF-05|Emergency Procurement
OP-WF-06|Incoming / Outgoing Mail & Fax Management
OP-WF-07|Patient Intake Administration
OP-WF-08|Non-Admit / Referral Rejection Management
OP-WF-09|Vehicle Management (Fleet / Personal Vehicle Use)
OP-WF-10|Patient Property Handling
OP-WF-11|Language Access / Interpreter Services
OP-WF-12|Scheduling & Conflict Resolution
OP-WF-13|After-Hours On-Call Operations
QA-WF-01|QAPI Program Charter & Annual Review
QA-WF-02|Monthly Quality Indicator Dashboard Production
QA-WF-03|Quarterly QAPI Committee Review
QA-WF-04|Annual Performance Improvement Project (PIP) Lifecycle
QA-WF-05|Adverse Event Reporting, RCA & Corrective Action
QA-WF-06|Infection Control Surveillance (QAPI-Integrated)
QA-WF-07|LUPA Prevention & Visit Utilization Monitoring
QA-WF-08|HHCAHPS Monitoring & Response
QA-WF-09|Star Rating & Public Report Monitoring
QA-WF-10|QAPI Self-Assessment (Annual)
QA-WF-11|Policy Effectiveness Monitoring
QA-WF-12|Patient Safety Event Communication
RM-WF-01|Enterprise Risk Register & Quarterly Risk Review
RM-WF-02|Annual Hazard Vulnerability Analysis (HVA)
RM-WF-03|Biennial Emergency Preparedness Program Review/Update
RM-WF-04|Biennial Emergency Preparedness Staff Training
RM-WF-05|Annual Emergency Exercise (Full-Scale or Tabletop)
RM-WF-06|Pandemic / Infectious-Disease Surge Readiness
RM-WF-07|Patient Priority Classification & Emergency Activation
RM-WF-08|Cal/OSHA IIPP Management (Injury & Illness Prevention Program)
RM-WF-09|Workplace Violence Prevention (SB 553)
RM-WF-10|Workplace Injury & OSHA Recordkeeping
RM-WF-11|Hazardous Materials & Spill Management
RM-WF-12|Equipment Recall & Safety Notification
RM-WF-13|High-Risk Medication Double-Check
RM-WF-14|Litigation & Claims Management
RM-WF-15|Annual Enterprise Risk Reassessment
`.trim();

const WORKFLOW_DOMAINS: Record<string, string> = {
  CL: "Clinical",
  CO: "Compliance",
  EN: "Enterprise",
  FN: "Finance",
  GV: "Governance",
  HR: "Human Resources",
  IT: "IT / Security",
  OP: "Operations",
  QA: "QAPI",
  RM: "Risk Management",
};

function getMandatedWorkflowAssignments(): TrainingAssignment[] {
  return MANDATED_WORKFLOW_SOURCE.split("\n").map((line) => {
    const [id, title] = line.split("|");
    const prefix = id.slice(0, 2);
    const domain = WORKFLOW_DOMAINS[prefix] ?? "Workflow";

    return {
      id,
      title,
      whyAssigned: "Mandated workflow library item from the approved all-workflows source set.",
      audience: "Assigned employees and leaders with workflow responsibility",
      dueDate: "Required workflow library",
      duration: "Reference / practice",
      status: "Required now",
      progress: id === "CL-WF-26" ? "0 of 6 stages complete" : "Not started",
      prerequisite: "Role assignment and applicable workflow ownership",
      validation:
        id === "CL-WF-26"
          ? "Complete the six-stage training simulation; no operational workflow state is changed"
          : "Review workflow controls, required evidence, owner, cadence, and escalation path",
      category: "Workflows",
      action: id === "CL-WF-26" ? "Start simulation" : "View workflow requirement",
      href: id === "CL-WF-26" ? "/journey/training/cl-wf-26" : undefined,
      available: true,
      workflowDomain: domain,
      relationshipNote:
        id === "CL-WF-26"
          ? "Monthly feeder audit -> Quarterly QA-WF-03 review"
          : `${domain} mandated workflow`,
    };
  });
}

export function getTrainingAssignments(persona: Persona): TrainingAssignment[] {
  const { ids, roleCodes } = moduleIdsForPersona(persona);
  const moduleCards = ids
    .map((id) => getGeneratedModule(id))
    .filter((mod): mod is GeneratedModule => Boolean(mod))
    .map((mod) => buildModuleTrainingCard(mod, persona, roleCodes))
    .sort((a, b) => a.id.localeCompare(b.id));

  return [...moduleCards, ...policyQuizCourseCards(persona), ...getMandatedWorkflowAssignments(), annualSummaryCard(persona), drillSummaryCard(persona)];
}

export type PolicyAssignment = {
  id: string;
  assignmentId: string;
  title: string;
  version: string;
  effectiveDate: string;
  whatChanged: string;
  changedSections: string;
  whyAssigned: string;
  readingTime: string;
  dueDate: string;
  actionType: "Read" | "Read + acknowledge" | "Read + quiz" | "Awareness only" | "No employee action";
  status: "Read now" | "In progress" | "Due soon" | "Complete" | "Waiting for publication" | "No action required";
  tier: string;
  courseId: string;
  courseTitle: string;
  quizRequired: boolean;
  pathway: string;
  inherited: boolean;
};

const POLICY_STATUS_CYCLE: PolicyAssignment["status"][] = ["Read now", "In progress", "Due soon", "Complete"];

function policyActionType(row: GeneratedPolicyAssignment): PolicyAssignment["actionType"] {
  if (row.awarenessReferenceOnly) return "Awareness only";
  if (!row.required) return "No employee action";
  if (row.quizRequired) return "Read + quiz";
  if (row.attestationRequired) return "Read + acknowledge";
  return "Read";
}

function policyStatus(row: GeneratedPolicyAssignment, persona: Persona): PolicyAssignment["status"] {
  if (row.blocked) return "Waiting for publication";
  if (row.awarenessReferenceOnly || !row.required) return "No action required";
  return POLICY_STATUS_CYCLE[stableIndex(`${persona.id}:${row.assignmentId}`, POLICY_STATUS_CYCLE.length)];
}

/** Full assigned policy set for this persona - sourced from
 * POLICY_ASSIGNMENT_MAP (generated from Policy_Assignments.aoa.json +
 * Role_Policy_Matrix.aoa.json), scoped to every pathway the persona's
 * roles resolve to (primary + secondary, deduplicated by assignmentId).
 * Kept as a function (not a plain const) because the assignment set
 * genuinely differs per persona/pathway - it can no longer be a single
 * shared 5-row array. Dates/statuses beyond the real `initialDue` field
 * remain synthetic (no acknowledgment-tracking backend exists here). */
export function POLICY_ASSIGNMENTS(persona: Persona): PolicyAssignment[] {
  const pathways = Array.from(new Set(roleCodesForPersona(persona).map((code) => pathwayForRoleCode(code))));
  const seen = new Set<string>();
  const rows: PolicyAssignment[] = [];

  pathways.forEach((pathway) => {
    getPolicyAssignmentsForPathway(pathway).forEach((row) => {
      if (seen.has(row.assignmentId)) return;
      seen.add(row.assignmentId);
      const policy = getGeneratedPolicy(row.policyId);
      rows.push({
        id: row.policyId,
        assignmentId: row.assignmentId,
        title: row.policyTitle,
        version: policy?.versionDate ?? "Not supplied",
        effectiveDate: policy?.versionDate ?? "Not supplied",
        whatChanged: "Change summary not supplied in the current source data.",
        changedSections: "Changed-section metadata was not supplied.",
        whyAssigned: row.scopeRationale || "Not supplied",
        readingTime: policy?.sectionCount ? `${policy.sectionCount} section(s) to read` : "Not available",
        dueDate: row.initialDue || "Not supplied",
        actionType: policyActionType(row),
        status: policyStatus(row, persona),
        tier: row.tier || "UNSPECIFIED",
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        quizRequired: row.quizRequired,
        pathway,
        inherited: row.inherited,
      });
    });
  });

  return rows.sort(
    (a, b) => a.courseTitle.localeCompare(b.courseTitle) || a.title.localeCompare(b.title),
  );
}

export type DocumentFixture = {
  id: string;
  name: string;
  maskedIdentifier: string;
  issuedDate: string;
  expirationDate: string;
  daysRemaining: string;
  verificationStatus: "Action needed" | "Expiring" | "Under review" | "Current" | "Not assigned";
  lastVerified: string;
  reviewer: string;
  policyBasis: string;
  acceptedFormats: string;
  primaryAction: string;
  applicableTo: string;
  /** Present only when a real baked controlled form (APPENDIX_FORMS)
   * covers this exact document type; "local" = a route in this app. */
  href?: string;
  hrefKind?: "local";
};

const DOCUMENTS: DocumentFixture[] = [
  {
    id: "drivers-license",
    name: "Driver's license",
    maskedIdentifier: "DL ••••73",
    issuedDate: "August 15, 2022",
    expirationDate: "August 15, 2026",
    daysRemaining: "23 days",
    verificationStatus: "Expiring",
    lastVerified: "August 15, 2025",
    reviewer: "Demo HR Reviewer",
    policyBasis: "OP-SL-003; RM-SS-003",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "Preview renewal",
    applicableTo: "Driving condition",
  },
  {
    id: "auto-insurance",
    name: "Auto insurance",
    maskedIdentifier: "POL ••••2819",
    issuedDate: "February 28, 2026",
    expirationDate: "August 30, 2026",
    daysRemaining: "38 days",
    verificationStatus: "Expiring",
    lastVerified: "March 2, 2026",
    reviewer: "Demo HR Reviewer",
    policyBasis: "OP-SL-003; RM-SS-003",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "Preview renewal",
    applicableTo: "Driving condition",
  },
  {
    id: "professional-license",
    name: "Professional license",
    maskedIdentifier: "RN ••••8421",
    issuedDate: "May 1, 2025",
    expirationDate: "April 30, 2027",
    daysRemaining: "281 days",
    verificationStatus: "Current",
    lastVerified: "July 2, 2026",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-TA-004; HR-WM-007",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View details",
    applicableTo: "Licensed roles",
  },
  {
    id: "hha-certificate",
    name: "HHA certificate",
    maskedIdentifier: "HHA ••••4132",
    issuedDate: "September 1, 2024",
    expirationDate: "August 31, 2026",
    daysRemaining: "39 days",
    verificationStatus: "Expiring",
    lastVerified: "September 3, 2025",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-TA-004; CL-SD-007",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "Preview renewal",
    applicableTo: "HHA role",
  },
  {
    id: "cpr-bls",
    name: "CPR/BLS",
    maskedIdentifier: "BLS ••••1190",
    issuedDate: "January 8, 2026",
    expirationDate: "January 8, 2028",
    daysRemaining: "534 days",
    verificationStatus: "Current",
    lastVerified: "July 2, 2026",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-WM-007 when role-required",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View details",
    applicableTo: "Role/assignment based",
  },
  {
    id: "health-clearance",
    name: "Health clearance",
    maskedIdentifier: "CLEARANCE ••••07",
    issuedDate: "July 1, 2026",
    expirationDate: "July 1, 2027",
    daysRemaining: "343 days",
    verificationStatus: "Current",
    lastVerified: "July 2, 2026",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-EH-101",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View details",
    applicableTo: "Role/assignment based",
  },
  {
    id: "tb",
    name: "Annual TB risk review",
    maskedIdentifier: "TB-RISK ••••26",
    issuedDate: "July 1, 2026",
    expirationDate: "July 1, 2027",
    daysRemaining: "343 days",
    verificationStatus: "Current",
    lastVerified: "July 2, 2026",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-EH-101",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View details",
    applicableTo: "Annual risk assessment; testing as indicated",
  },
  {
    id: "immunization",
    name: "Immunization record",
    maskedIdentifier: "IMM ••••06",
    issuedDate: "July 1, 2026",
    expirationDate: "Not universal",
    daysRemaining: "Assignment based",
    verificationStatus: "Under review",
    lastVerified: "Not yet verified",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-WM-003; HR-EH-101",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View review status",
    applicableTo: "Patient-contact/exposure based",
  },
  {
    id: "fit-test",
    name: "Respirator fit test",
    maskedIdentifier: "FIT ••••NA",
    issuedDate: "Not assigned",
    expirationDate: "Not assigned",
    daysRemaining: "Not applicable",
    verificationStatus: "Not assigned",
    lastVerified: "Not applicable",
    reviewer: "Not assigned in preview",
    policyBasis: "Assigned only when respirator use applies",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "No employee action required",
    applicableTo: "Respirator/task based",
  },
  {
    id: "external-ceu",
    name: "External CEU",
    maskedIdentifier: "CEU ••••24",
    issuedDate: "June 12, 2026",
    expirationDate: "Not applicable",
    daysRemaining: "Not applicable",
    verificationStatus: "Under review",
    lastVerified: "Not yet verified",
    reviewer: "Demo HR Reviewer",
    policyBasis: "HR-TD-002",
    acceptedFormats: "PDF, JPG, or PNG",
    primaryAction: "View review status",
    applicableTo: "Licensed role and board requirements",
  },
  {
    id: "annual-certificate",
    name: "Annual certificate",
    maskedIdentifier: "CERT ••••PREVIEW",
    issuedDate: "Appears after synthetic completion",
    expirationDate: "Not applicable",
    daysRemaining: "Not applicable",
    verificationStatus: "Not assigned",
    lastVerified: "Not applicable",
    reviewer: "Not assigned in preview",
    policyBasis: "HR-TD-001; HR-TR-101",
    acceptedFormats: "System-generated preview - no upload required",
    primaryAction: "No employee action required",
    applicableTo: "Assigned annual plan",
  },
];

/** Real form id genuinely on file for license/credential primary-source
 * verification (HR-FM-006 "License & Cert Primary Source Verification"
 * in APPENDIX_FORMS). No canonical source models personal HR documents
 * (driver's license, insurance, etc) as a distinct identity table - the
 * DOCUMENTS array below remains hand-authored synthetic preview data -
 * but where a document IS the same real-world artifact a baked
 * controlled form covers, the action links to that real form instead
 * of a synthetic-only preview drawer. */
const LICENSE_VERIFICATION_FORM_ID = "HR-FM-006";

export function getDocuments(persona: Persona): DocumentFixture[] {
  const licenseForm = getAppendixForm(LICENSE_VERIFICATION_FORM_ID);
  return DOCUMENTS.map((document) => {
    const driving = persona.id === "skyler-driver";
    const hha = persona.id === "morgan-hha";
    const licensed = roleCodesForPersona(persona).some((code) =>
      ["RN", "LVN", "HHA", "PTA", "DON"].includes(code),
    );

    if (document.id === "drivers-license" || document.id === "auto-insurance") {
      return driving
        ? document
        : {
            ...document,
            maskedIdentifier: "Not assigned",
            verificationStatus: "Not assigned" as const,
            primaryAction: "No employee action required",
          };
    }
    if (document.id === "hha-certificate") {
      if (!hha) {
        return {
          ...document,
          maskedIdentifier: "Not assigned",
          verificationStatus: "Not assigned" as const,
          primaryAction: "No employee action required",
        };
      }
      return licenseForm
        ? { ...document, href: `/journey/forms/${licenseForm.id}`, hrefKind: "local" as const }
        : document;
    }
    if (document.id === "professional-license") {
      if (!licensed) {
        return {
          ...document,
          maskedIdentifier: "Not assigned",
          verificationStatus: "Not assigned" as const,
          primaryAction: "No employee action required",
        };
      }
      return licenseForm
        ? { ...document, href: `/journey/forms/${licenseForm.id}`, hrefKind: "local" as const }
        : document;
    }
    if (persona.id === "parker-returning" && document.id === "health-clearance") {
      return {
        ...document,
        expirationDate: "Return planned July 29, 2026",
        daysRemaining: "Waiting for review",
        verificationStatus: "Action needed" as const,
        lastVerified: "Not yet verified",
        primaryAction: "Open clearance preview",
      };
    }
    return document;
  });
}

export type CompetencyFixture = {
  id: string;
  roles: string[];
  requirement: string;
  cadence: string;
  dueDate: string;
  evaluator: string;
  preparation: string;
  status: "Upcoming" | "Scheduled" | "Waiting on evaluator" | "Completed" | "Needs follow-up" | "Remediation";
  nextAction: string;
  clearanceImpact: string;
  basis: string;
  /** Present only on entries built directly from a real generated
   * module (id, policyRefs, supervisedVisitsRequired) rather than the
   * hand-authored synthetic rows below. "external" = main-app route,
   * resolved via mainAppUrl/MainAppLink. */
  href?: string;
  hrefKind?: "external";
};

const COMPETENCIES: CompetencyFixture[] = [
  {
    id: "hha-14",
    roles: ["HHA"],
    requirement: "HHA RN supervisory visit",
    cadence: "Cadence shown for this synthetic skilled-patient assignment.",
    dueDate: "July 26, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Review the current aide plan and observations.",
    status: "Upcoming",
    nextAction: "View preparation",
    clearanceImpact: "Assignment-specific; do not infer a universal HHA cadence.",
    basis: "CL-WF-10; CL-SD-006",
  },
  {
    id: "hha-60",
    roles: ["HHA"],
    requirement: "HHA direct observation",
    cadence: "Assignment classification determines the interval.",
    dueDate: "Not scheduled in this fixture",
    evaluator: "Not assigned in preview",
    preparation: "No employee action required.",
    status: "Waiting on evaluator",
    nextAction: "View requirement",
    clearanceImpact: "Shown only when the evaluator schedules the observation.",
    basis: "CL-WF-10; HR-TD-003",
  },
  {
    id: "lvn-review",
    roles: ["LVN"],
    requirement: "LVN RN oversight review",
    cadence: "Every 14 days for this synthetic assignment.",
    dueDate: "July 28, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Prepare visit notes and escalated findings.",
    status: "Scheduled",
    nextAction: "View preparation",
    clearanceImpact: "RN oversight remains required for this assignment.",
    basis: "CL-SD-001; CL-SD-008",
  },
  {
    id: "pta-review",
    roles: ["PTA"],
    requirement: "PT supervisory review",
    cadence: "Due at 30 days or the 6th PTA visit, whichever comes first.",
    dueDate: "July 24, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Review plan adherence, progress, and visit count.",
    status: "Waiting on evaluator",
    nextAction: "View preparation",
    clearanceImpact: "PT reviewer decision remains read-only.",
    basis: "CL-SD-002; CL-SD-008",
  },
  {
    id: "cota-review",
    roles: ["COTA"],
    requirement: "OT supervisory review",
    cadence: "Due at 30 days or the 6th COTA visit, whichever comes first.",
    dueDate: "Not assigned for this synthetic role",
    evaluator: "Not assigned in preview",
    preparation: "No employee action required.",
    status: "Completed",
    nextAction: "View history",
    clearanceImpact: "Not applicable to this persona.",
    basis: "CL-SD-003; CL-SD-008",
  },
  {
    id: "rn-annual",
    roles: ["RN", "DON"],
    requirement: "RN annual competency",
    cadence: "Annual; evaluation method depends on assigned skills.",
    dueDate: "September 30, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Review skill list, record-review sample, and return demonstrations.",
    status: "Scheduled",
    nextAction: "View preparation",
    clearanceImpact: "Independent practice decisions occur outside this preview.",
    basis: "HR-TD-003; CL-WF-25",
  },
  {
    id: "return-demo",
    roles: ["RN", "LVN", "HHA", "PTA", "DON"],
    requirement: "Return demonstration",
    cadence: "Assigned skill and event based - not a universal recurrence.",
    dueDate: "August 5, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Review the assigned skill checklist.",
    status: "Upcoming",
    nextAction: "Open checklist preview",
    clearanceImpact: "Evaluator completion is not recorded by this UI.",
    basis: "HR-TD-003",
  },
  {
    id: "record-review",
    roles: ["RN", "LVN", "PTA", "DON"],
    requirement: "Clinical record review",
    cadence: "Evaluation method selected for the assigned competency.",
    dueDate: "August 7, 2026",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Bring the synthetic documentation sample listed in the fixture.",
    status: "Upcoming",
    nextAction: "View preparation",
    clearanceImpact: "Reviewer determination remains read-only.",
    basis: "HR-TD-003; CL-WF-25",
  },
  {
    id: "emergency-drill",
    roles: ["RN", "LVN", "HHA", "PTA", "DON", "ADM", "GAO"],
    requirement: "Emergency drill",
    cadence: "Agency schedule for this synthetic assignment.",
    dueDate: "September 17, 2026",
    evaluator: "Demo Drill Facilitator",
    preparation: "Review the participant briefing.",
    status: "Scheduled",
    nextAction: "View schedule",
    clearanceImpact: "Participation is verified outside this preview.",
    basis: "HR-TD-005",
  },
];

const SUP_MODULE_ROLES = ["RN", "LVN", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "HHA"] as const;

/** Real "<ROLE>-SUP" supervised-visit module for this role code, if the
 * canonical catalog has one (genuine module id/title/policyRefs/
 * evidenceAppendix/supervisedVisitsRequired - nothing invented). Not a
 * reinterpretation of the synthetic hha-14/lvn-review/etc rows below;
 * those stay as hand-authored preview scaffolding since there is no
 * verified 1:1 correspondence between their ids and a generated
 * module id. This is an additional, clearly real, sourced entry. */
function supModuleCompetency(roleCode: string): CompetencyFixture | null {
  if (!(SUP_MODULE_ROLES as readonly string[]).includes(roleCode)) return null;
  const mod = getGeneratedModule(`${roleCode}-SUP`);
  if (!mod) return null;
  const player = getModulePlayerEntry(mod.id);
  return {
    id: mod.id,
    roles: [roleCode],
    requirement: mod.title,
    cadence:
      mod.supervisedVisitsRequired != null
        ? `${mod.supervisedVisitsRequired} supervised visit${mod.supervisedVisitsRequired === 1 ? "" : "s"} required, per the ${mod.family} catalog entry.`
        : "See the module for cadence.",
    dueDate: "See the module for timing",
    evaluator: "Demo Clinical Evaluator",
    preparation: "Open the module for the full supervised-visit checklist.",
    status: player?.playerAvailable ? "Scheduled" : "Waiting on evaluator",
    nextAction: "Open module",
    clearanceImpact: "Sourced directly from the canonical module catalog, not a synthetic estimate.",
    basis: mod.policyRefs.length ? mod.policyRefs.join("; ") : "Not supplied",
    href: player?.launchRef ?? undefined,
    hrefKind: player?.launchRef ? "external" : undefined,
  };
}

export function getCompetencies(persona: Persona): CompetencyFixture[] {
  const matches = COMPETENCIES.filter((item) => item.roles.includes(persona.roleCode));
  const base = matches.length ? matches : COMPETENCIES.filter((item) => item.id === "emergency-drill");

  const seen = new Set(base.map((item) => item.id));
  const merged = [...base];
  for (const code of roleCodesForPersona(persona)) {
    const real = supModuleCompetency(code);
    if (real && !seen.has(real.id)) {
      seen.add(real.id);
      merged.push(real);
    }
  }
  return merged;
}

export type PerformanceFixture = {
  id: string;
  type: string;
  date: string;
  reviewer: string;
  status: "Upcoming" | "Scheduled" | "Waiting" | "Complete" | "No action required";
  topics: string;
  employeeActions: string;
  acknowledgment: string;
  nextReview: string;
};

export function getPerformanceFixtures(persona: Persona): PerformanceFixture[] {
  return [
    {
      id: "30-day",
      type: "30-day check-in",
      date: "August 5, 2026",
      reviewer: "Demo Supervisor",
      status: persona.stageIndex === 5 ? "Scheduled" : persona.stageIndex < 5 ? "Upcoming" : "Complete",
      topics: "Role clarity, support needs, training blockers",
      employeeActions: "Add discussion topics.",
      acknowledgment: "Internal journey check-in; no formal score.",
      nextReview: "60-day check-in",
    },
    {
      id: "60-day",
      type: "60-day check-in",
      date: "September 4, 2026",
      reviewer: "Demo Supervisor",
      status: persona.stageIndex === 7 ? "Scheduled" : persona.stageIndex < 7 ? "Upcoming" : "Complete",
      topics: "Progress, workload, competency follow-up",
      employeeActions: "Review goals and add comments.",
      acknowledgment: "Internal journey check-in; no formal score.",
      nextReview: "90-day evaluation",
    },
    {
      id: "90-day",
      type: "90-day evaluation",
      date: "October 4, 2026",
      reviewer: "Demo Supervisor",
      status: persona.stageIndex === 8 ? "Scheduled" : persona.stageIndex < 8 ? "Upcoming" : "Complete",
      topics: "Introductory performance, goals, readiness",
      employeeActions: "Employee comments only; scores remain read-only.",
      acknowledgment: "Receipt and discussion; acknowledgment does not indicate agreement.",
      nextReview: "Annual evaluation",
    },
    {
      id: "annual",
      type: "Annual evaluation",
      date: persona.id === "avery-don" ? "September 30, 2026" : "July 6–August 5, 2027",
      reviewer: persona.id === "avery-don" ? "Demo Governing Body Reviewer" : "Demo Supervisor",
      status: persona.id === "avery-don" ? "Scheduled" : "Upcoming",
      topics: "Annual performance and role goals",
      employeeActions: "Review and add comments; no employee approval control.",
      acknowledgment: "Reviewer decisions and scores are read-only.",
      nextReview: "Next annual cycle",
    },
    {
      id: "idp",
      type: "IDP / goals",
      date: "October 10, 2026",
      reviewer: "Demo Supervisor",
      status: "Upcoming",
      topics: "Role development and measurable goals",
      employeeActions: "Draft goal discussion points.",
      acknowledgment: "Plan approval occurs outside this preview.",
      nextReview: "Goal follow-up",
    },
    {
      id: "coaching",
      type: "Coaching",
      date: "Not scheduled",
      reviewer: "Not assigned in preview",
      status: "No action required",
      topics: "No synthetic coaching event is assigned.",
      employeeActions: "No employee action required.",
      acknowledgment: "Not applicable.",
      nextReview: "Not scheduled",
    },
    {
      id: "improvement",
      type: "Improvement plan",
      date: "Not scheduled",
      reviewer: "Not assigned in preview",
      status: "No action required",
      topics: "No synthetic improvement plan is assigned.",
      employeeActions: "No employee action required.",
      acknowledgment: "Not applicable.",
      nextReview: "Not scheduled",
    },
    {
      id: "follow-up",
      type: "Follow-up",
      date: "Not scheduled",
      reviewer: "Not assigned in preview",
      status: "No action required",
      topics: "Created only when a review produces a follow-up action.",
      employeeActions: "No employee action required.",
      acknowledgment: "Not applicable.",
      nextReview: "Not scheduled",
    },
  ];
}

export const HISTORY_ITEMS = [
  {
    id: "transcript-1",
    group: "Transcript",
    title: "General orientation preview transcript",
    date: "July 10, 2026",
    detail: "Practice activity only - no official LMS record is connected.",
  },
  {
    id: "certificate-1",
    group: "Certificates",
    title: "Emergency preparedness practice certificate",
    date: "June 18, 2026",
    detail: "Synthetic certificate preview.",
  },
  {
    id: "policy-1",
    group: "Policy acknowledgments",
    title: "CO-CP-004 Code of Conduct & Ethics",
    date: "July 6, 2026",
    detail: "Acknowledgment preview; no official acknowledgment was recorded.",
  },
  {
    id: "competency-1",
    group: "Competency history",
    title: "Medication reconciliation practice",
    date: "July 17, 2026",
    detail: "Practice observation; evaluator sign-off is not connected.",
  },
  {
    id: "milestone-1",
    group: "Journey milestones",
    title: "First week completed",
    date: "July 10, 2026",
    detail: "Synthetic journey milestone.",
  },
] as const;
