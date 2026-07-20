export interface Gao001NodeSceneRegistration {
  appLocation: string;
  cardId: string;
  sceneLabel: string;
  requiredNodeIds: readonly string[];
}

export const gao001NodeSceneRegistrations: readonly Gao001NodeSceneRegistration[] = [
  {
    appLocation: "GAO-001.lesson.l1.delivery",
    cardId: "GAO-001_L1_DELIVERY",
    sceneLabel: "Welcome Desk",
    requiredNodeIds: ["email", "checklist", "packet", "badge", "notebook"],
  },
  {
    appLocation: "GAO-001.lesson.l2.delivery",
    cardId: "GAO-001_L2_DELIVERY",
    sceneLabel: "Mission Briefing",
    requiredNodeIds: ["mission", "vision", "icons", "notes"],
  },
  {
    appLocation: "GAO-001.lesson.l3.delivery",
    cardId: "GAO-001_L3_DELIVERY",
    sceneLabel: "Vision Pillars",
    requiredNodeIds: ["compassion", "integrity", "excellence", "teamwork"],
  },
  {
    appLocation: "GAO-001.lesson.l4.delivery",
    cardId: "GAO-001_L4_DELIVERY",
    sceneLabel: "Core Values",
    requiredNodeIds: ["observe", "routines", "safety", "person"],
  },
  {
    appLocation: "GAO-001.lesson.l5.delivery",
    cardId: "GAO-001_L5_DELIVERY",
    sceneLabel: "Home Health Difference",
    requiredNodeIds: ["observe", "document", "report", "escalate", "facts"],
  },
  {
    appLocation: "GAO-001.lesson.l6.delivery",
    cardId: "GAO-001_L6_DELIVERY",
    sceneLabel: "Reporting and Escalation",
    requiredNodeIds: ["rights", "refusal", "document", "responsibilities"],
  },
  {
    appLocation: "GAO-001.lesson.l7.delivery",
    cardId: "GAO-001_L7_DELIVERY",
    sceneLabel: "Patient Refusal",
    requiredNodeIds: ["assess", "supervisor", "manager", "after-hours"],
  },
  {
    appLocation: "GAO-001.lesson.l8.delivery",
    cardId: "GAO-001_L8_DELIVERY",
    sceneLabel: "Escalation Practice",
    requiredNodeIds: ["professionalism", "documentation", "dignity", "reporting", "checklist"],
  },
  {
    appLocation: "GAO-001.lesson.l9.delivery",
    cardId: "GAO-001_L9_DELIVERY",
    sceneLabel: "Readiness Map",
    requiredNodeIds: ["mission", "vision", "core-values", "home-health-diff", "reporting", "rights", "escalation", "survey"],
  },
];

const registrationsByAppLocation = new Map(
  gao001NodeSceneRegistrations.map((scene) => [scene.appLocation, scene]),
);

export function getGao001NodeSceneRegistration(
  appLocation: string,
): Gao001NodeSceneRegistration | undefined {
  return registrationsByAppLocation.get(appLocation);
}
