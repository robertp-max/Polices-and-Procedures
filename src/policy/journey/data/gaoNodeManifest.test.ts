import { describe, expect, it } from "vitest";

import { courseModules, getModuleQuizItems } from "./contentV2Adapter";
import { gao001NodeSceneRegistrations } from "./gaoNodes/GAO-001";
import { gaoNodeScenes } from "./gaoNodes";
import { hasMedia, mediaAssetPath } from "./mediaManifest";

function moduleNumber(moduleId: string): number | null {
  const match = /^GAO-(\d{3})$/.exec(moduleId);
  return match ? Number(match[1]) : null;
}

function normalizedPrompt(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

const expectedStaticLocations = courseModules
  .filter((module) => {
    const number = moduleNumber(module.id);
    return number !== null && number >= 2 && number <= 27;
  })
  .flatMap((module) =>
    module.lessons.map((lesson) => {
      const delivery = lesson.cards?.find((card) => card.card_type === "delivery");
      if (!delivery) throw new Error(`Missing delivery card: ${module.id}/${lesson.id}`);
      return delivery.app.location;
    }),
  )
  .sort();

describe("GAO node manifest", () => {
  it("registers every static and bespoke GAO lesson exactly once", () => {
    expect(expectedStaticLocations).toHaveLength(120);
    expect(gaoNodeScenes.map((scene) => scene.appLocation).sort()).toEqual(expectedStaticLocations);
    expect(gao001NodeSceneRegistrations).toHaveLength(9);

    const allLocations = [
      ...gaoNodeScenes.map((scene) => scene.appLocation),
      ...gao001NodeSceneRegistrations.map((scene) => scene.appLocation),
    ];
    expect(new Set(allLocations).size).toBe(129);

    for (const registration of gao001NodeSceneRegistrations) {
      expect(registration.requiredNodeIds.length, registration.appLocation).toBeGreaterThanOrEqual(3);
      expect(new Set(registration.requiredNodeIds).size, registration.appLocation).toBe(
        registration.requiredNodeIds.length,
      );
    }
  });

  it("enforces the static node, note, micro-check, and protected-region contracts", () => {
    const locations = new Set<string>();
    const protectedRegionViolations: string[] = [];

    for (const scene of gaoNodeScenes) {
      expect(locations.has(scene.appLocation), scene.appLocation).toBe(false);
      locations.add(scene.appLocation);
      expect(hasMedia(scene.appLocation), scene.appLocation).toBe(true);

      const requiredNodes = scene.nodes.filter((node) => node.required);
      if (scene.requiredNodeMinimumExemption) {
        expect(requiredNodes.length, scene.appLocation).toBeGreaterThan(0);
      } else {
        expect(requiredNodes.length, scene.appLocation).toBeGreaterThanOrEqual(3);
      }

      const maximumNodes = scene.appLocation === "GAO-004.lesson.l2.delivery" ? 7 : 6;
      expect(scene.nodes.length, scene.appLocation).toBeLessThanOrEqual(maximumNodes);

      const nodeIds = new Set<string>();
      const processNoteIds = new Set<string>();
      for (const note of scene.processNotes ?? []) {
        expect(processNoteIds.has(note.id), `${scene.appLocation}:${note.id}`).toBe(false);
        processNoteIds.add(note.id);
        expect(note.title.trim(), note.id).not.toBe("");
        expect(note.body.trim(), note.id).not.toBe("");
        if (note.placement.type === "point") {
          expect(note.placement.x, note.id).toBeGreaterThanOrEqual(0);
          expect(note.placement.x, note.id).toBeLessThanOrEqual(100);
          expect(note.placement.y, note.id).toBeGreaterThanOrEqual(0);
          expect(note.placement.y, note.id).toBeLessThanOrEqual(100);
        }
      }

      const finalAssessmentPrompts = new Set(
        getModuleQuizItems(scene.appLocation.split(".")[0]).map((item) => normalizedPrompt(item.prompt)),
      );

      for (const node of scene.nodes) {
        expect(nodeIds.has(node.id), `${scene.appLocation}:${node.id}`).toBe(false);
        nodeIds.add(node.id);
        expect(node.x, node.id).toBeGreaterThanOrEqual(4);
        expect(node.x, node.id).toBeLessThanOrEqual(96);
        expect(node.y, node.id).toBeGreaterThanOrEqual(4);
        expect(node.y, node.id).toBeLessThanOrEqual(96);
        expect(node.shortLabel.trim(), node.id).not.toBe("");
        expect(node.whatYouObserved.trim(), node.id).not.toBe("");
        expect(node.whyItMatters.trim(), node.id).not.toBe("");
        expect(node.whatYouShouldDo.trim(), node.id).not.toBe("");
        expect(node.policyRefs.length, node.id).toBeGreaterThan(0);
        if (node.processNoteId) {
          expect(processNoteIds.has(node.processNoteId), node.id).toBe(true);
        }
        if (node.microCheck) {
          expect(node.microCheck.options.length, node.id).toBeGreaterThanOrEqual(2);
          expect(node.microCheck.options.length, node.id).toBeLessThanOrEqual(4);
          expect(node.microCheck.options.filter((option) => option.isSafest), node.id).toHaveLength(1);
          expect(
            finalAssessmentPrompts.has(normalizedPrompt(node.microCheck.prompt)),
            `${scene.appLocation}:${node.id}`,
          ).toBe(false);
        }

        for (const region of scene.protectedRegions ?? []) {
          const centerInsideRegion =
            node.x >= region.x &&
            node.x <= region.x + region.width &&
            node.y >= region.y &&
            node.y <= region.y + region.height;
          if (centerInsideRegion) {
            protectedRegionViolations.push(`${scene.appLocation}:${node.id} inside ${region.id}`);
          }
        }
      }

      for (const region of scene.protectedRegions ?? []) {
        expect(region.x, region.id).toBeGreaterThanOrEqual(0);
        expect(region.y, region.id).toBeGreaterThanOrEqual(0);
        expect(region.width, region.id).toBeGreaterThan(0);
        expect(region.height, region.id).toBeGreaterThan(0);
        expect(region.x + region.width, region.id).toBeLessThanOrEqual(100);
        expect(region.y + region.height, region.id).toBeLessThanOrEqual(100);
      }
    }

    expect(protectedRegionViolations).toEqual([]);
  });

  it("preserves the dedicated GAO-009 ergonomics mapping", () => {
    expect(mediaAssetPath("GAO-009.lesson.l4.delivery")).toBe(
      "/assets/media/gao/gao-009-l04-ergonomics-in-the-home.png",
    );
  });
});
