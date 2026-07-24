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
    employeeActions: "Review synthetic clearance checklist.",
    training: "No employee training action.",
    policies: "HR-TA-001 through HR-TA-004",
    documents: "Identity, screening, license, and health-clearance review.",
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
  category: "Required now" | "Onboarding" | "Role-specific" | "Annual" | "Policy quiz" | "Competency" | "Drill / live" | "Completed";
  action: string;
  href?: string;
  available: boolean;
};

export function getTrainingAssignments(persona: Persona): TrainingAssignment[] {
  return [
    {
      id: "GAO-001",
      title: "A New Journey - Agency Mission, Vision & Values",
      whyAssigned: "General agency orientation for this synthetic employee journey.",
      audience: "All assigned employees",
      dueDate: "July 24, 2026",
      duration: "30 minutes",
      status: "In progress",
      progress: "Scene 1 of approved preview content",
      prerequisite: "None",
      validation: "Practice interactions and knowledge checks",
      category: "Onboarding",
      action: "Continue preview",
      href: "/journey/training/gao-001",
      available: true,
    },
    {
      id: `${persona.roleCode}-006`,
      title:
        persona.roleCode === "RN"
          ? "Medication Management & Reconciliation"
          : `${persona.role} role practice`,
      whyAssigned: `Role-specific development for the ${persona.role} fixture.`,
      audience: persona.role,
      dueDate: "August 4, 2026",
      duration: "35 minutes",
      status: "Required now",
      progress: "Not started",
      prerequisite: "General orientation sequence",
      validation: "Practice case; official validation is not connected",
      category: "Role-specific",
      action: "Open preview",
      available: true,
    },
    {
      id: "POL-CL-PR-001",
      title: "Patient Rights policy quiz",
      whyAssigned: "Version-specific policy action in this synthetic fixture.",
      audience: "Assigned patient-facing roles",
      dueDate: "July 28, 2026",
      duration: "12 minutes",
      status: "Due soon",
      progress: "Reading not started",
      prerequisite: "Read CL-PR-001",
      validation: "Practice quiz; no official score is recorded",
      category: "Policy quiz",
      action: "Review assignment",
      available: true,
    },
    {
      id: "HR-TD-003-PRACTICE",
      title: "Clinical competency preparation",
      whyAssigned: "Prepares the synthetic role for evaluator-led validation.",
      audience: persona.role,
      dueDate: "August 5, 2026",
      duration: "20 minutes",
      status: "Waiting",
      progress: "Waiting for evaluator schedule",
      prerequisite: "Applicable role training",
      validation: "Evaluator observation outside this UI preview",
      category: "Competency",
      action: "View preparation",
      available: true,
    },
    {
      id: "HR-TD-005-DRILL",
      title: "Emergency preparedness live drill",
      whyAssigned: "Agency drill assignment for this synthetic schedule.",
      audience: "Assigned employees",
      dueDate: "September 17, 2026",
      duration: "Live · 45 minutes",
      status: "Due soon",
      progress: "Scheduled",
      prerequisite: "Emergency preparedness orientation",
      validation: "Live participation verified outside this preview",
      category: "Drill / live",
      action: "View schedule",
      available: true,
    },
    {
      id: "GAO-012",
      title: "Abuse, Neglect & Exploitation Reporting",
      whyAssigned: "Catalog assignment awaiting approved learner content.",
      audience: "Assigned employees",
      dueDate: "No employee due date",
      duration: "Not published",
      status: "Unavailable",
      progress: "Content not yet available",
      prerequisite: "No employee action required",
      validation: "Unavailable",
      category: "Required now",
      action: "No employee action required",
      available: false,
    },
    {
      id: "GAO-004",
      title: "Corporate Compliance Program",
      whyAssigned: "Completed synthetic orientation example.",
      audience: "All employees",
      dueDate: "July 10, 2026",
      duration: "28 minutes",
      status: "Completed",
      progress: "Practice complete",
      prerequisite: "GAO-001",
      validation: "Practice quiz completed; no official score was recorded",
      category: "Completed",
      action: "Review preview",
      available: true,
    },
  ];
}

export type PolicyAssignment = {
  id: string;
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
};

export const POLICY_ASSIGNMENTS: PolicyAssignment[] = [
  {
    id: "CL-PR-001",
    title: "Patient Rights & Responsibilities",
    version: "6.0",
    effectiveDate: "July 10, 2025",
    whatChanged: "A synthetic assignment was created; no prior-version diff was supplied.",
    changedSections: "Changed-section details were not provided in the supplied metadata.",
    whyAssigned: "Patient-facing responsibility in this synthetic role.",
    readingTime: "14 minutes",
    dueDate: "July 28, 2026",
    actionType: "Read + quiz",
    status: "Due soon",
  },
  {
    id: "CO-HP-001",
    title: "HIPAA Privacy Program",
    version: "1.0",
    effectiveDate: "July 10, 2025",
    whatChanged: "Change summary is not available in this preview.",
    changedSections: "No changed-section metadata was supplied.",
    whyAssigned: "Initial and recurring privacy responsibilities.",
    readingTime: "18 minutes",
    dueDate: "July 31, 2026",
    actionType: "Read + acknowledge",
    status: "Read now",
  },
  {
    id: "CO-CP-004",
    title: "Code of Conduct & Ethics",
    version: "1.0",
    effectiveDate: "July 10, 2025",
    whatChanged: "Change summary is not available in this preview.",
    changedSections: "No changed-section metadata was supplied.",
    whyAssigned: "Day 1 code acknowledgment.",
    readingTime: "12 minutes",
    dueDate: "July 24, 2026",
    actionType: "Read + acknowledge",
    status: "In progress",
  },
  {
    id: "OP-SL-003",
    title: "Vehicle & Transportation Safety",
    version: "6.0",
    effectiveDate: "July 10, 2025",
    whatChanged: "No current revision action is assigned.",
    changedSections: "No changed-section metadata was supplied.",
    whyAssigned: "Applies only when driving is part of the synthetic role.",
    readingTime: "10 minutes",
    dueDate: "No action due",
    actionType: "Awareness only",
    status: "No action required",
  },
  {
    id: "EN-LC-001",
    title: "Policy Lifecycle Control & Version Management",
    version: "1.0",
    effectiveDate: "April 1, 2026",
    whatChanged: "Waiting for a learner-facing publication summary.",
    changedSections: "Changed-section details were not provided.",
    whyAssigned: "Administrator policy-update fixture only.",
    readingTime: "Not available",
    dueDate: "Not scheduled",
    actionType: "No employee action",
    status: "Waiting for publication",
  },
];

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

export function getDocuments(persona: Persona): DocumentFixture[] {
  return DOCUMENTS.map((document) => {
    const driving = persona.id === "skyler-driver";
    const hha = persona.id === "morgan-hha";
    const licensed = ["RN", "LVN", "HHA", "PTA", "DON"].includes(persona.roleCode);

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
    if (document.id === "hha-certificate" && !hha) {
      return {
        ...document,
        maskedIdentifier: "Not assigned",
        verificationStatus: "Not assigned" as const,
        primaryAction: "No employee action required",
      };
    }
    if (document.id === "professional-license" && !licensed) {
      return {
        ...document,
        maskedIdentifier: "Not assigned",
        verificationStatus: "Not assigned" as const,
        primaryAction: "No employee action required",
      };
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

export function getCompetencies(persona: Persona): CompetencyFixture[] {
  const matches = COMPETENCIES.filter((item) => item.roles.includes(persona.roleCode));
  return matches.length ? matches : COMPETENCIES.filter((item) => item.id === "emergency-drill");
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
