export const GAO001_REQUIRED_NODE_IDS = {
  "GAO-001.lesson.l1.delivery": ["email", "checklist", "packet", "badge", "notebook"],
  "GAO-001.lesson.l2.delivery": ["mission", "vision", "icons", "notes"],
  "GAO-001.lesson.l3.delivery": ["compassion", "integrity", "excellence", "teamwork"],
  "GAO-001.lesson.l4.delivery": [
    "integrity",
    "compassion",
    "excellence",
    "teamwork",
    "accountability",
    "compliance",
  ],
  "GAO-001.lesson.l5.delivery": ["observe", "document", "report", "escalate", "facts"],
  "GAO-001.lesson.l6.delivery": ["rights", "refusal", "document", "responsibilities"],
  "GAO-001.lesson.l7.delivery": ["assess", "supervisor", "manager", "after-hours"],
  "GAO-001.lesson.l8.delivery": ["professionalism", "documentation", "dignity", "reporting", "checklist"],
  "GAO-001.lesson.l9.delivery": [
    "mission",
    "vision",
    "core-values",
    "home-health-diff",
    "reporting",
    "rights",
    "escalation",
    "survey",
  ],
} as const;

export type Gao001AppLocation = keyof typeof GAO001_REQUIRED_NODE_IDS;

export function defineGao001Hotspots<T extends { id: string }>(
  appLocation: Gao001AppLocation,
  hotspots: readonly T[],
): T[] {
  const expected = GAO001_REQUIRED_NODE_IDS[appLocation];
  const actual = hotspots.map((hotspot) => hotspot.id);
  const unique = new Set(actual);
  const matches = actual.length === expected.length
    && actual.every((id, index) => id === expected[index]);

  if (unique.size !== actual.length || !matches) {
    throw new Error(
      `${appLocation} hotspot IDs do not match the GAO-001 node contract. Expected ${expected.join(", ")}; received ${actual.join(", ")}.`,
    );
  }

  return [...hotspots];
}
