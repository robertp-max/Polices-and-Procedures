import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(repoRoot, "config/gao-tts-source-freeze.json");
const manifestPath = resolve(
  repoRoot,
  "src/policy/journey/data/gaoTtsSourceManifest.generated.json",
);

const expectedLessonCounts = {
  "GAO-002": 8,
  "GAO-003": 5,
  "GAO-004": 6,
  "GAO-005": 5,
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
  "GAO-027": 2
};

const sourceArtifactPaths = [
  "src/policy/journey/data/gao-content.md",
  "src/policy/journey/data/gaoContentAdapter.ts",
  "src/policy/journey/data/contentV2Adapter.ts"
];

const forbiddenTranscriptPatterns = [
  /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:\{|\*)/i,
  /QA VALIDATION SUMMARY|QA STATUS|FINAL MODULE-LEVEL QA|FINAL PAGE-LEVEL WORD COUNTS/i,
  /policyRefStatus|readyForSmeReview|needs_review/i,
  /(?:^|\n)\s*(?:COMPETENCY ASSESSMENT|EXAM)\b/i,
  /Narration Script\s*\(|Page\s+\d+\s+word count|Narration word count\s*[:|]/i,
  /CORDORATE/i
];

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function wordCount(value) {
  const normalized = value.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

function outputPathFor(appLocation) {
  const safe = appLocation.trim().replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  return `/assets/narration/${safe}.mp3`;
}

function moduleNumber(moduleId) {
  return Number(moduleId.slice(4));
}

function lessonNumber(lessonId) {
  return Number(lessonId.slice(1));
}

function approvalOwner(moduleId, isPolicySensitive) {
  const number = moduleNumber(moduleId);
  if (number >= 6 && number <= 10) return "Clinical and compliance policy owner";
  if (number >= 19 && number <= 22) return "HR and employee-relations policy owner";
  if (number >= 23 && number <= 25) return "Privacy, security, and documentation policy owner";
  if (number >= 26 && number <= 27) return "HR, payroll, and benefits policy owner";
  return isPolicySensitive ? "Applicable policy owner" : "Training content owner";
}

function assertManifest(records) {
  const errors = [];
  const counts = Object.fromEntries(Object.keys(expectedLessonCounts).map((id) => [id, 0]));
  const seenLocations = new Set();
  const seenOutputs = new Set();

  if (records.length !== 120) {
    errors.push(`Expected 120 records, received ${records.length}.`);
  }

  for (const record of records) {
    if (!(record.moduleId in counts)) errors.push(`Unexpected module: ${record.moduleId}.`);
    else counts[record.moduleId] += 1;

    if (seenLocations.has(record.appLocation)) {
      errors.push(`Duplicate appLocation: ${record.appLocation}.`);
    }
    seenLocations.add(record.appLocation);

    if (seenOutputs.has(record.outputPath)) {
      errors.push(`Duplicate outputPath: ${record.outputPath}.`);
    }
    seenOutputs.add(record.outputPath);

    if (record.transcriptText.length < 200) {
      errors.push(`Transcript is unexpectedly short: ${record.appLocation}.`);
    }

    for (const pattern of forbiddenTranscriptPatterns) {
      if (pattern.test(record.transcriptText)) {
        errors.push(`Forbidden transcript content in ${record.appLocation}: ${pattern}.`);
      }
    }
  }

  for (const [moduleId, expected] of Object.entries(expectedLessonCounts)) {
    if (counts[moduleId] !== expected) {
      errors.push(`${moduleId}: expected ${expected} lessons, received ${counts[moduleId]}.`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`GAO TTS manifest validation failed:\n- ${errors.join("\n- ")}`);
  }
}

async function buildManifest() {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const sensitiveModules = new Set(config.policySensitiveModules);
  const server = await createServer({
    root: repoRoot,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true }
  });

  let courseModules;
  try {
    ({ courseModules } = await server.ssrLoadModule(
      "/src/policy/journey/data/contentV2Adapter.ts",
    ));
  } finally {
    await server.close();
  }

  const records = courseModules
    .filter((module) => /^GAO-\d{3}$/.test(module.id))
    .filter((module) => {
      const number = moduleNumber(module.id);
      return number >= 2 && number <= 27;
    })
    .flatMap((module) => module.lessons.map((lesson) => {
      const deliveryCards = (lesson.cards ?? []).filter((card) => card.card_type === "delivery");
      if (deliveryCards.length !== 1) {
        throw new Error(
          `${module.id}.${lesson.id} must expose exactly one delivery card; received ${deliveryCards.length}.`,
        );
      }

      const card = deliveryCards[0];
      const transcriptText = String(card.transcript_text ?? "").trim();
      const appLocation = String(card.app?.location ?? "").trim();
      const policySensitive = sensitiveModules.has(module.id);

      return {
        appLocation,
        moduleId: module.id,
        lessonId: lesson.id,
        title: String(card.display_title ?? lesson.title),
        transcriptText,
        transcriptSha256: sha256(transcriptText),
        wordCount: wordCount(transcriptText),
        expectedDurationSeconds: Number(card.estimated_narration_seconds ?? 0),
        outputPath: outputPathFor(appLocation),
        voiceId: config.voiceId,
        model: config.model,
        speakingRate: config.speakingRate,
        sourceCommit: config.sourceCommit,
        policySensitive,
        approvalStatus: policySensitive
          ? "pending-policy-owner"
          : "pending-training-owner",
        approvalOwner: approvalOwner(module.id, policySensitive),
        ttsGenerationAllowed: false,
        pronunciationNotes: appLocation === "GAO-004.lesson.l2.delivery"
          ? ["Pronounce 'Corporate Compliance Program'; do not repeat the baked image typo 'CORDORATE'."]
          : []
      };
    }))
    .sort((a, b) => (
      moduleNumber(a.moduleId) - moduleNumber(b.moduleId)
      || lessonNumber(a.lessonId) - lessonNumber(b.lessonId)
    ));

  assertManifest(records);

  const sourceArtifacts = [];
  for (const path of sourceArtifactPaths) {
    const content = await readFile(resolve(repoRoot, path), "utf8");
    sourceArtifacts.push({ path, sha256: sha256(content) });
  }

  return {
    schemaVersion: config.schemaVersion,
    generationStatus: config.generationStatus,
    policyApprovalStatus: config.policyApprovalStatus,
    transcriptSource: "Runtime delivery-card transcript_text from contentV2Adapter courseModules",
    sourceCommit: config.sourceCommit,
    sourceArtifacts,
    moduleRange: "GAO-002 through GAO-027",
    moduleCount: 26,
    recordCount: records.length,
    excludedScopes: [
      "GAO-001 existing main narration",
      "Static node-specific narration"
    ],
    defaultTtsSettings: {
      voiceId: config.voiceId,
      model: config.model,
      speakingRate: config.speakingRate
    },
    records
  };
}

const writeMode = process.argv.includes("--write");
const checkMode = process.argv.includes("--check");
if (writeMode === checkMode) {
  console.error("Use exactly one mode: --write or --check.");
  process.exit(1);
}

const manifest = await buildManifest();
const serialized = `${JSON.stringify(manifest, null, 2)}\n`;

if (writeMode) {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, serialized, "utf8");
  console.log(`Wrote ${manifest.recordCount} frozen GAO TTS records to ${manifestPath}.`);
} else {
  const existing = await readFile(manifestPath, "utf8");
  if (existing !== serialized) {
    console.error("GAO TTS source manifest is stale. Run: npm run gao:tts:freeze");
    process.exit(1);
  }
  console.log(`Verified ${manifest.recordCount} frozen GAO TTS records with no source drift.`);
}
