import { describe, expect, it } from "vitest";

import type { GaoNodeScene } from "../data/gaoNodes";
import {
  createGaoNodeProgressRecord,
  isGaoNodeSceneComplete,
  sanitizeGaoNodeIds,
} from "./gaoNodeProgress";

const scene: GaoNodeScene = {
  appLocation: "GAO-999.lesson.l1.delivery",
  sceneLabel: "Test scene",
  nodes: [
    {
      id: "required-a",
      label: "Required A",
      shortLabel: "A",
      x: 25,
      y: 25,
      tone: "guidance",
      kind: "observe",
      required: true,
      whatYouObserved: "A",
      whyItMatters: "A",
      whatYouShouldDo: "A",
      policyRefs: [],
    },
    {
      id: "required-b",
      label: "Required B",
      shortLabel: "B",
      x: 50,
      y: 50,
      tone: "safe",
      kind: "observe",
      required: true,
      whatYouObserved: "B",
      whyItMatters: "B",
      whatYouShouldDo: "B",
      policyRefs: [],
    },
    {
      id: "optional",
      label: "Optional",
      shortLabel: "Optional",
      x: 75,
      y: 75,
      tone: "guidance",
      kind: "recap",
      required: false,
      whatYouObserved: "C",
      whyItMatters: "C",
      whatYouShouldDo: "C",
      policyRefs: [],
    },
  ],
};

describe("GAO node progress", () => {
  it("removes stale and duplicate node ids", () => {
    expect(sanitizeGaoNodeIds(scene, ["required-a", "stale", "required-a"])).toEqual(["required-a"]);
  });

  it("gates only on required nodes", () => {
    expect(isGaoNodeSceneComplete(scene, ["required-a", "optional"])).toBe(false);
    expect(isGaoNodeSceneComplete(scene, ["required-a", "required-b"])).toBe(true);
  });

  it("does not treat a scene with no required nodes as complete", () => {
    const optionalOnlyScene: GaoNodeScene = {
      ...scene,
      appLocation: "GAO-999.lesson.l2.delivery",
      nodes: scene.nodes.map((node) => ({ ...node, required: false })),
    };

    expect(isGaoNodeSceneComplete(optionalOnlyScene, ["optional"])).toBe(false);
  });

  it("creates a versioned, sanitized persistence record", () => {
    expect(createGaoNodeProgressRecord(scene, ["required-a", "stale"], "2026-07-19T00:00:00.000Z")).toEqual({
      completedNodeIds: ["required-a"],
      updatedAt: "2026-07-19T00:00:00.000Z",
      version: 1,
    });
  });
});
