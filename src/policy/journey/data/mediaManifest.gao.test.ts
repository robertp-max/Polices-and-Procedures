import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { courseModules } from "./contentV2Adapter";
import { hasMedia, mediaAssetPath } from "./mediaManifest";

const expectedLessonCounts: Readonly<Record<string, number>> = {
  "GAO-006": 8,
  "GAO-007": 8,
  "GAO-008": 7,
  "GAO-009": 6,
  "GAO-010": 8,
  "GAO-011": 7,
  "GAO-012": 7,
  "GAO-013": 7,
  "GAO-014": 6,
  "GAO-015": 4,
  "GAO-016": 4,
  "GAO-017": 3,
  "GAO-018": 2,
  "GAO-019": 3,
  "GAO-020": 2,
  "GAO-021": 2,
  "GAO-022": 2,
  "GAO-023": 2,
  "GAO-024": 2,
  "GAO-025": 2,
  "GAO-026": 2,
  "GAO-027": 2,
};

describe("GAO-006 through GAO-027 media manifest", () => {
  it("maps all 96 runtime lesson locations to distinct 1408x1144 PNG files", () => {
    const paths = new Set<string>();
    let lessonCount = 0;

    for (const [moduleId, expectedCount] of Object.entries(expectedLessonCounts)) {
      const module = courseModules.find((candidate) => candidate.id === moduleId);
      expect(module, moduleId).toBeDefined();
      expect(module?.lessons, moduleId).toHaveLength(expectedCount);

      module?.lessons.forEach((lesson, index) => {
        const deliveryCard = lesson.cards?.find((card) => card.card_type === "delivery");
        const expectedLocation = `${moduleId}.lesson.l${index + 1}.delivery`;

        expect(deliveryCard?.app?.location, `${moduleId} ${lesson.id}`).toBe(expectedLocation);
        expect(hasMedia(expectedLocation), expectedLocation).toBe(true);

        const assetPath = mediaAssetPath(expectedLocation);
        expect(assetPath, expectedLocation).toMatch(/^\/assets\/media\/gao\/gao-\d{3}-l\d{2}-.+\.png$/);
        expect(paths.has(assetPath), assetPath).toBe(false);
        paths.add(assetPath);

        const filePath = resolve(process.cwd(), "public", assetPath.slice(1));
        const png = readFileSync(filePath);
        expect(png.subarray(0, 8).toString("hex"), filePath).toBe("89504e470d0a1a0a");
        expect(png.readUInt32BE(16), filePath).toBe(1408);
        expect(png.readUInt32BE(20), filePath).toBe(1144);
        lessonCount += 1;
      });
    }

    expect(lessonCount).toBe(96);
    expect(paths.size).toBe(96);
    expect(mediaAssetPath("GAO-009.lesson.l4.delivery")).toBe(
      "/assets/media/gao/gao-009-l04-ergonomics-in-the-home.png",
    );
  });
});
