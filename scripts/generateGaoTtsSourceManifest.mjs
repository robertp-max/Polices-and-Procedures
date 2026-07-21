import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = resolve(repoRoot, "config/gao-tts-source-freeze.json");
const lexiconPath = resolve(repoRoot, "config/gao-tts-pronunciation-lexicon.json");
const manifestPath = resolve(
  repoRoot,
  "src/policy/journey/data/gaoTtsSourceManifest.generated.json",
);
const reportPath = resolve(repoRoot, "REVIEW_OUTPUTS/gao-tts-preflight/GAO_TTS_SOURCE_FREEZE_REPORT.md");
const checklistPath = resolve(repoRoot, "REVIEW_OUTPUTS/gao-tts-preflight/GAO_TTS_POLICY_APPROVAL_CHECKLIST.md");

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
  /CORDORATE/i,
  /(?:^|\n)\s*#{1,6}\s+/,
  /(?:^|\n)\s*---\s*(?:\n|$)/,
  /PP SEPARATION NOTICE|Training Module Complete/i,
  /\{\{[^}]+\}\}|\[[A-Z_]+_PLACEHOLDER\]/i
];

const reviewFocusByModule = {
  "GAO-002": "42 CFR 484.105 governance and reporting-chain claims; remove the [REGULATORY FIX APPLIED] editorial marker",
  "GAO-003": "Medicare eligibility, homebound, skilled, intermittent, face-to-face, and 42 CFR 484.55 claims; review embedded Knowledge Check labels",
  "GAO-004": "False Claims Act, Anti-Kickback, Stark, OIG elements, whistleblower protections, and current penalty wording; review embedded Knowledge Check labels",
  "GAO-005": "hotline anonymity, investigation timelines, whistleblower protections, retaliation, and external reporting; review embedded Knowledge Check labels",
  "GAO-006": "California mandatory reporting; APS and law-enforcement reporting; reasonable suspicion; internal versus external reporting",
  "GAO-007": "infection-control requirements; hand-hygiene exceptions; PPE and exposure response",
  "GAO-008": "emergency actions, communication, and patient-priority procedures",
  "GAO-009": "safe handling and injury prevention",
  "GAO-010": "vital-sign technique, critical-value thresholds, and symptom-based escalation",
  "GAO-011": "clinical communication and SBAR claims",
  "GAO-012": "language access, protected-class, and inclusive-care claims",
  "GAO-013": "legal-record language; incident reports versus clinical records; corrections, addenda, and audit trails",
  "GAO-014": "professional boundaries and disciplinary consequences",
  "GAO-015": "CMS emergency-preparedness training and exercise cadence",
  "GAO-016": "staff safety, visit screening, weapons, domestic violence, and incident escalation",
  "GAO-017": "California workplace-violence scope and Cal/OSHA requirements",
  "GAO-018": "workers' compensation timelines, MPN rules, and return-to-work rights",
  "GAO-019": "harassment, discrimination, protected classes, retaliation, and reporting remedies",
  "GAO-020": "drug-free workplace, cannabis protections, testing, and fitness for duty",
  "GAO-021": "progressive discipline, grievance rights, retaliation, and union representation",
  "GAO-022": "grievance steps, deadlines, appeals, retaliation, and external remedies",
  "GAO-023": "acceptable use, BYOD, privacy, PHI, and social-media restrictions",
  "GAO-024": "privacy, phishing, MFA, security incidents, and legal reporting claims",
  "GAO-025": "legal-record language; incident reports versus clinical records; corrections and audit trails",
  "GAO-026": "timekeeping, travel time, missed punches, scheduling, absence reporting, and PTO",
  "GAO-027": "enrollment, qualifying events, deductions, eligibility, leave, EAP, retirement, development benefits, COBRA, and beneficiaries"
};

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
  if (number >= 2 && number <= 10) return "Clinical and compliance policy owner";
  if (number >= 19 && number <= 22) return "HR and employee-relations policy owner";
  if (number >= 23 && number <= 25) return "Privacy, security, and documentation policy owner";
  if (number >= 26 && number <= 27) return "HR, payroll, and benefits policy owner";
  return isPolicySensitive ? "Applicable policy owner" : "Training content owner";
}

function pronunciationKeysFor(transcriptText, lexicon) {
  return Object.keys(lexicon).filter((key) => (
    transcriptText.toLocaleLowerCase().includes(key.toLocaleLowerCase())
  ));
}

function duplicateTranscriptGroups(records) {
  const byHash = new Map();
  for (const record of records) {
    const locations = byHash.get(record.transcriptSha256) ?? [];
    locations.push(record.appLocation);
    byHash.set(record.transcriptSha256, locations);
  }
  return [...byHash.values()].filter((locations) => locations.length > 1);
}

function wavDurationSeconds(buffer) {
  if (buffer.length < 44 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    return 0;
  }
  const byteRate = buffer.readUInt32LE(28);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    if (chunkId === "data" && byteRate > 0) return chunkSize / byteRate;
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  return 0;
}

async function auditGao001Audio(courseModules) {
  const segments = JSON.parse(await readFile(
    resolve(repoRoot, "public/training/gao-001/audio/main/segments.json"),
    "utf8",
  ));
  const segmentTextByLocation = new Map(segments.map((segment) => [segment.id, String(segment.text ?? "").trim()]));
  const module = courseModules.find((candidate) => candidate.id === "GAO-001");
  const deliveryByLesson = new Map((module?.lessons ?? []).map((lesson) => [
    lesson.id,
    (lesson.cards ?? []).find((card) => card.card_type === "delivery"),
  ]));
  return Promise.all(Array.from({ length: 9 }, async (_, index) => {
    const lessonId = `l${index + 1}`;
    const appLocation = `GAO-001.lesson.${lessonId}.delivery`;
    const audioPath = `/training/gao-001/audio/main/l${String(index + 1).padStart(2, "0")}-delivery.wav`;
    const transcriptText = String(deliveryByLesson.get(lessonId)?.transcript_text ?? "").trim();
    const segmentText = segmentTextByLocation.get(appLocation) ?? "";
    const currentHash = transcriptText ? sha256(transcriptText) : null;
    const segmentHash = segmentText ? sha256(segmentText) : null;
    try {
      const buffer = await readFile(resolve(repoRoot, "public", audioPath.slice(1)));
      const durationSeconds = wavDurationSeconds(buffer);
      return {
        appLocation,
        audioPath,
        transcriptSha256: currentHash,
        segmentTranscriptSha256: segmentHash,
        segmentTranscriptMatch: currentHash !== null && currentHash === segmentHash,
        byteLength: buffer.length,
        durationSeconds: Number(durationSeconds.toFixed(3)),
        readable: true,
        status: durationSeconds <= 0
          ? "MISSING OR INVALID"
          : currentHash !== segmentHash
            ? "REVIEW REQUIRED — TRANSCRIPT DRIFT"
            : "SOURCE HASH NOT PREVIOUSLY RECORDED — MANUAL APPROVAL REQUIRED",
      };
    } catch {
      return {
        appLocation,
        audioPath,
        transcriptSha256: currentHash,
        segmentTranscriptSha256: segmentHash,
        segmentTranscriptMatch: currentHash !== null && currentHash === segmentHash,
        byteLength: 0,
        durationSeconds: 0,
        readable: false,
        status: "MISSING OR INVALID",
      };
    }
  }));
}

function buildFreezeReport(manifest) {
  const records = manifest.records;
  const totalWords = records.reduce((sum, record) => sum + record.wordCount, 0);
  const totalSeconds = records.reduce((sum, record) => sum + record.estimatedDurationSeconds, 0);
  const duplicates = duplicateTranscriptGroups(records);
  const pronunciationRecords = records.filter((record) => record.pronunciationKeys.length > 0);
  const correctionRecords = records.filter((record) => record.approvalStatus === "CORRECTION REQUIRED");
  const pendingRecords = records.filter((record) => record.approvalStatus === "PENDING");
  const lines = [
    "# GAO TTS Source Freeze Report",
    "",
    "> Generation status: **HOLD**. This task generated no audio and registered no future audio paths.",
    "",
    "## Summary",
    "",
    `- Modules: ${manifest.moduleCount}`,
    `- Lessons: ${manifest.recordCount}`,
    `- Total words: ${totalWords}`,
    `- Estimated duration at ${manifest.durationWordsPerMinute} WPM: ${totalSeconds} seconds (${(totalSeconds / 60).toFixed(1)} minutes)`,
    `- Policy-sensitive records: ${records.filter((record) => record.policySensitive).length}`,
    `- Pending approval: ${pendingRecords.length}`,
    `- Correction required: ${correctionRecords.length}`,
    `- Duplicate transcript groups: ${duplicates.length}`,
    "- Malformed transcript findings after runtime sanitation: 0",
    "",
    "## Blocked Records",
    "",
    ...records.filter((record) => record.approvalStatus !== "NOT POLICY SENSITIVE").map(
      (record) => `- \`${record.appLocation}\` — ${record.approvalStatus}; ${record.approvalOwner}`,
    ),
    "",
    "## Duplicate Content",
    "",
    ...(duplicates.length ? duplicates.map((locations) => `- ${locations.join(", ")}`) : ["- None detected."]),
    "",
    "## Pronunciation Exceptions",
    "",
    ...pronunciationRecords.map((record) => `- \`${record.appLocation}\`: ${record.pronunciationKeys.join(", ")}`),
    "",
    "## GAO-001 Existing Audio Verification",
    "",
    "The nine registered GAO-001 WAV paths remain unchanged. Files were inspected without regeneration. Historical source hashes are unavailable, so valid files still require manual approval.",
    "",
    ...manifest.gao001ExistingAudioVerification.map((record) => (
      `- \`${record.appLocation}\` — \`${record.audioPath}\`; readable=${record.readable}; bytes=${record.byteLength}; duration=${record.durationSeconds}s; segment transcript match=${record.segmentTranscriptMatch}; current transcript SHA-256=${record.transcriptSha256 ?? "missing"}; **${record.status}**`
    )),
    "",
    "## Output Path Summary",
    "",
    `- Pattern: \`/assets/narration/gao-NNN.lesson.lN.delivery.mp3\``,
    `- Unique expected paths: ${new Set(records.map((record) => record.outputPath)).size}`,
    "- Files generated: 0",
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function buildPolicyChecklist(manifest) {
  const lines = [
    "# GAO TTS Policy Approval Checklist",
    "",
    "> No item is approved automatically. Audio generation remains on HOLD until every PENDING or CORRECTION REQUIRED item is resolved.",
    "",
  ];
  for (const record of manifest.records) {
    lines.push(
      `## ${record.moduleId} ${record.lessonId} — ${record.lessonTitle}`,
      "",
      `- App location: \`${record.appLocation}\``,
      `- Claim requiring review: ${reviewFocusByModule[record.moduleId] ?? "No mandatory policy-sensitive claim identified by this preflight."}`,
      `- Policy or regulatory source: ${record.policySensitive ? "Policy owner must identify and validate the controlling current source." : "Not required by this preflight."}`,
      `- Designated reviewer: ${record.approvalOwner}`,
      `- Approval status: **${record.approvalStatus}**`,
      "- Approval date: _Not recorded_",
      `- Notes: ${record.approvalStatus === "CORRECTION REQUIRED" ? "Correct the identified source claim, then regenerate and re-review this hash." : "Record reviewer evidence before TTS generation."}`,
      `- Transcript SHA-256: \`${record.transcriptSha256}\``,
      "",
    );
  }
  return `${lines.join("\n")}\n`;
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
    if (!record.lessonTitle.trim()) errors.push(`Missing lesson title: ${record.appLocation}.`);
    if (record.estimatedDurationSeconds <= 0) errors.push(`Invalid duration: ${record.appLocation}.`);
    if (!/^\/assets\/narration\/gao-\d{3}\.lesson\.l\d+\.delivery\.mp3$/.test(record.outputPath)) {
      errors.push(`Invalid output path: ${record.appLocation}.`);
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
  const lexicon = JSON.parse(await readFile(lexiconPath, "utf8"));
  const sensitiveModules = new Set(config.policySensitiveModules);
  const correctionModules = new Set(config.contentCorrectionModules);
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
      const count = wordCount(transcriptText);

      return {
        appLocation,
        moduleId: module.id,
        lessonId: lesson.id,
        lessonTitle: String(card.display_title ?? lesson.title),
        transcriptText,
        transcriptSha256: sha256(transcriptText),
        wordCount: count,
        estimatedDurationSeconds: Math.max(1, Math.ceil(count * 60 / config.durationWordsPerMinute)),
        outputPath: outputPathFor(appLocation),
        audioFormat: "mp3",
        voiceId: config.voiceId,
        model: config.model,
        speakingRate: config.speakingRate,
        sourceCommit: config.sourceCommit,
        sourceType: "runtime-transcript-text",
        policySensitive,
        approvalStatus: correctionModules.has(module.id)
          ? "CORRECTION REQUIRED"
          : policySensitive ? "PENDING" : "NOT POLICY SENSITIVE",
        approvalOwner: approvalOwner(module.id, policySensitive),
        ttsGenerationAllowed: false,
        pronunciationKeys: pronunciationKeysFor(transcriptText, lexicon),
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
  const gao001ExistingAudioVerification = await auditGao001Audio(courseModules);

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
    durationWordsPerMinute: config.durationWordsPerMinute,
    gao001ExistingAudioVerification,
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
const report = buildFreezeReport(manifest);
const checklist = buildPolicyChecklist(manifest);

if (writeMode) {
  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, serialized, "utf8");
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");
  await writeFile(checklistPath, checklist, "utf8");
  console.log(`Wrote ${manifest.recordCount} frozen GAO TTS records to ${manifestPath}.`);
} else {
  const [existingManifest, existingReport, existingChecklist] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(reportPath, "utf8"),
    readFile(checklistPath, "utf8"),
  ]);
  if (existingManifest !== serialized || existingReport !== report || existingChecklist !== checklist) {
    console.error("GAO TTS freeze artifacts are stale. Run: npm run gao:tts:freeze");
    process.exit(1);
  }
  console.log(`Verified ${manifest.recordCount} frozen GAO TTS records with no source drift.`);
}
