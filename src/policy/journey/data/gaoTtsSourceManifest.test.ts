import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { courseModules } from "./contentV2Adapter";
import { narrationAssetPath } from "./narrationManifest";

type FrozenRecord = {
  appLocation: string;
  moduleId: string;
  lessonId: string;
  title: string;
  transcriptText: string;
  transcriptSha256: string;
  wordCount: number;
  expectedDurationSeconds: number;
  outputPath: string;
  voiceId: string;
  model: string;
  speakingRate: number;
  sourceCommit: string;
  policySensitive: boolean;
  approvalStatus: string;
  ttsGenerationAllowed: boolean;
  pronunciationNotes: string[];
};

type FrozenManifest = {
  generationStatus: string;
  policyApprovalStatus: string;
  sourceCommit: string;
  moduleCount: number;
  recordCount: number;
  records: FrozenRecord[];
};

const manifest = JSON.parse(
  readFileSync(
    resolve("src/policy/journey/data/gaoTtsSourceManifest.generated.json"),
    "utf8",
  ),
) as FrozenManifest;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function runtimeDeliveryCards(): Map<string, { title: string; transcriptText: string; duration: number }> {
  const cards = new Map<string, { title: string; transcriptText: string; duration: number }>();

  for (const module of courseModules) {
    const moduleNumber = Number(module.id.match(/^GAO-(\d{3})$/)?.[1] ?? 0);
    if (moduleNumber < 2 || moduleNumber > 27) continue;

    for (const lesson of module.lessons) {
      const delivery = lesson.cards?.filter((card) => card.card_type === "delivery") ?? [];
      expect(delivery, `${module.id}.${lesson.id}`).toHaveLength(1);
      const card = delivery[0];
      cards.set(card.app.location, {
        title: card.display_title,
        transcriptText: card.transcript_text.trim(),
        duration: card.estimated_narration_seconds,
      });
    }
  }

  return cards;
}

describe("GAO TTS source freeze", () => {
  it("freezes exactly the 120 GAO-002 through GAO-027 runtime delivery transcripts", () => {
    const runtimeCards = runtimeDeliveryCards();
    expect(manifest.moduleCount).toBe(26);
    expect(manifest.recordCount).toBe(120);
    expect(manifest.records).toHaveLength(120);
    expect(runtimeCards.size).toBe(120);
    expect(new Set(manifest.records.map((record) => record.appLocation)).size).toBe(120);
    expect(manifest.records.some((record) => record.moduleId === "GAO-001")).toBe(false);

    for (const record of manifest.records) {
      const runtime = runtimeCards.get(record.appLocation);
      expect(runtime, record.appLocation).toBeDefined();
      expect(record.title, record.appLocation).toBe(runtime?.title);
      expect(record.transcriptText, record.appLocation).toBe(runtime?.transcriptText);
      expect(record.expectedDurationSeconds, record.appLocation).toBe(runtime?.duration);
      expect(record.transcriptSha256, record.appLocation).toBe(sha256(record.transcriptText));
      expect(record.wordCount, record.appLocation).toBe(record.transcriptText.split(/\s+/).length);
      expect(record.outputPath, record.appLocation).toBe(narrationAssetPath(record.appLocation));
    }
  });

  it("keeps generation blocked until voice and policy approvals are assigned", () => {
    expect(manifest.generationStatus).toBe("hold");
    expect(manifest.policyApprovalStatus).toBe("pending");

    for (const record of manifest.records) {
      expect(record.ttsGenerationAllowed, record.appLocation).toBe(false);
      expect(record.voiceId, record.appLocation).toBe("PENDING_OWNER_SELECTION");
      expect(record.model, record.appLocation).toBe("PENDING_OWNER_SELECTION");
      expect(record.speakingRate, record.appLocation).toBe(0.95);
      expect(record.approvalStatus, record.appLocation).toMatch(/^pending-/);
    }
  });

  it("records the GAO-004 pronunciation correction without changing the image", () => {
    const complianceLesson = manifest.records.find(
      (record) => record.appLocation === "GAO-004.lesson.l2.delivery",
    );
    expect(complianceLesson).toBeDefined();
    expect(complianceLesson?.transcriptText).not.toMatch(/CORDORATE/i);
    expect(complianceLesson?.pronunciationNotes.join(" ")).toMatch(/Corporate Compliance Program/i);
  });
});
