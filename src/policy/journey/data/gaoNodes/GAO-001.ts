import { GAO001_REQUIRED_NODE_IDS } from "./gao001HotspotContract";

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
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l1.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l2.delivery",
    cardId: "GAO-001_L2_DELIVERY",
    sceneLabel: "Mission Briefing",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l2.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l3.delivery",
    cardId: "GAO-001_L3_DELIVERY",
    sceneLabel: "Vision Pillars",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l3.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l4.delivery",
    cardId: "GAO-001_L4_DELIVERY",
    sceneLabel: "Core Values",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l4.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l5.delivery",
    cardId: "GAO-001_L5_DELIVERY",
    sceneLabel: "Home Health Difference",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l5.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l6.delivery",
    cardId: "GAO-001_L6_DELIVERY",
    sceneLabel: "Reporting and Escalation",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l6.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l7.delivery",
    cardId: "GAO-001_L7_DELIVERY",
    sceneLabel: "Patient Refusal",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l7.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l8.delivery",
    cardId: "GAO-001_L8_DELIVERY",
    sceneLabel: "Escalation Practice",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l8.delivery"],
  },
  {
    appLocation: "GAO-001.lesson.l9.delivery",
    cardId: "GAO-001_L9_DELIVERY",
    sceneLabel: "Readiness Map",
    requiredNodeIds: GAO001_REQUIRED_NODE_IDS["GAO-001.lesson.l9.delivery"],
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
