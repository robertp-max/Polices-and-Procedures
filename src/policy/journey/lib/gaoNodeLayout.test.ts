import { describe, expect, it } from "vitest";

import type { GaoNodeScene } from "../data/gaoNodes";
import { resolveResponsiveGaoNodePositions } from "./gaoNodeLayout";

const scene: GaoNodeScene = {
  appLocation: "GAO-999.lesson.l1.delivery",
  sceneLabel: "Responsive layout",
  nodes: [
    {
      id: "edge",
      label: "Edge node",
      shortLabel: "Edge",
      x: 96,
      y: 96,
      tone: "guidance",
      kind: "observe",
      required: true,
      whatYouObserved: "Observation",
      whyItMatters: "Meaning",
      whatYouShouldDo: "Action",
      policyRefs: ["Reference"],
    },
  ],
  protectedRegions: [
    { id: "blocked", x: 70, y: 65, width: 25, height: 25, reason: "embedded-text" },
  ],
};

describe("responsive GAO node layout", () => {
  it("preserves authored coordinates on larger stages", () => {
    expect(resolveResponsiveGaoNodePositions(scene, 900, 731).edge).toEqual({ x: 96, y: 96 });
  });

  it("moves a mobile edge node inside the stage and away from blocked content", () => {
    const position = resolveResponsiveGaoNodePositions(scene, 390, 317).edge;
    expect(position.x).toBeGreaterThan(10);
    expect(position.x).toBeLessThan(94);
    expect(position.y).toBeGreaterThan(8);
    expect(position.y).toBeLessThan(85);
    expect(position.x < 70 || position.y < 65).toBe(true);
  });
});
