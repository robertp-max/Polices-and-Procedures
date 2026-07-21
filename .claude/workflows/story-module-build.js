export const meta = {
  name: 'story-module-build',
  description: 'Build a story-module architecture package into working code, run browser UAT, and apply fixes (build gate → build → static verify → UAT → fix loop → report)',
  whenToUse: 'After story-module-architecture has produced docs/<ID>-*/. Args: { moduleId, packageDir?, buildPlatform?, maxFixRounds? }. Stops at the build gate if the scene-engine platform is not landed and buildPlatform is not true.',
  phases: [
    { title: 'Gate', detail: 'package + platform + stakeholder-decision preflight', model: 'sonnet' },
    { title: 'Platform', detail: 'engine/templates/primitives (only if gated in, serialized)', model: 'sonnet' },
    { title: 'Build', detail: 'per-scene configs + narration data (parallel), then integration (serial)', model: 'sonnet' },
    { title: 'StaticVerify', detail: 'tsc, vitest, scoped eslint, narration coverage', model: 'sonnet' },
    { title: 'UAT', detail: 'browser UAT per scene + module-level, serialized (parallel with Audio)', model: 'sonnet' },
    { title: 'Audio', detail: 'Qwen3-TTS voice-clone narration generation + manifest mapping + verification', model: 'sonnet' },
    { title: 'Fix', detail: 'fix loop over BLOCKER/MAJOR findings (UAT + audio), re-verify + re-UAT', model: 'sonnet' },
    { title: 'Report', detail: 'UAT report + overview status update', model: 'sonnet' },
  ],
}

// ── Parameters ──────────────────────────────────────────────────────────────
const moduleId = args?.moduleId
if (!moduleId || !/^[A-Z]{2,4}-\d{3}$/.test(moduleId)) {
  return { error: 'args.moduleId required, e.g. { "moduleId": "GAO-002" }' }
}
const maxFixRounds = args?.maxFixRounds ?? 3
// Narration audio: STANDARD voice = the OASIS-E2 training narrator, defined in
// scripts/narrationTts/voiceRef.default.json (single source of truth). Pass
// args.voiceRef = { audio, text?, language? } only to override the standard.
const voiceRef = args?.voiceRef ?? null
const skipAudio = args?.skipAudio === true
const VOICE_REF_INSTRUCTION = voiceRef?.audio
  ? `Voice reference (OVERRIDE of the standard voice): audio "${voiceRef.audio}"${voiceRef.text ? `, transcript "${voiceRef.text.replace(/"/g, '\\"')}"` : ''}${voiceRef.language ? `, language ${voiceRef.language}` : ''}.`
  : 'Voice reference: the STANDARD narration voice — read scripts/narrationTts/voiceRef.default.json and use its audio/text/language values.'
const TPL = 'docs/Workflows/STORY-MODULE-TEMPLATE'
const PLAYBOOK = `${TPL}/05-BUILD-UAT.md`
const INV = `${TPL}/02-UNIVERSAL-INVARIANTS.md`
const pkgHint = args?.packageDir ? `The package directory is ${args.packageDir}.` : `Locate the package directory by globbing docs/${moduleId}-*/00-OVERVIEW.md.`

const DO_NOT_TOUCH = `DO-NOT-TOUCH (binding): quiz/assessment content; LMS shell behavior (Save & Exit, pills, routing, handleNext semantics); Brad (anything under server/ia or src/policy/brad — if a shared file looks Brad-adjacent, stop and flag); CES/Evidence/eCign/sign-in/onboarding systems; learner acknowledgment/attestation state (scenes call onComplete only).`

// ── Phase: Gate ─────────────────────────────────────────────────────────────
phase('Gate')
const gate = await agent(`Preflight for building module ${moduleId} from its story architecture package.
${pkgHint}
Read ${PLAYBOOK} (Phase 8), ${INV}, then the package's 00-OVERVIEW.md and audits/feasibility-audit.md.
Then VERIFY IN CODE (not from recon docs) whether the platform is landed: scene engine (useSceneEngine/SceneConfig), the layout template shells this module's design/02 assigns, shared primitives, SceneRegistry discriminator, sceneProgress persistence, narration manifest support, the narration coverage CI script.
Also list: the scene files in the package's scenes/ dir (number + slug + path); open items / flip-able decisions from 00-OVERVIEW that affect implementation, each with the overview's recommended default; any unresolved CRITICAL audit findings.`,
  { label: 'gate:preflight', phase: 'Gate', model: 'sonnet', schema: {
    type: 'object',
    required: ['packageDir', 'packageOk', 'platformReady', 'scenes'],
    properties: {
      packageDir: { type: 'string' },
      packageOk: { type: 'boolean' },
      packageProblems: { type: 'array', items: { type: 'string' } },
      platformReady: { type: 'boolean' },
      missingPlatform: { type: 'array', items: { type: 'string' } },
      scenes: { type: 'array', items: { type: 'object', required: ['num', 'slug', 'path'], properties: { num: { type: 'number' }, slug: { type: 'string' }, path: { type: 'string' } } } },
      assumedDefaults: { type: 'array', items: { type: 'string' }, description: 'open decisions being built on recommended defaults' },
      launchConfigName: { type: 'string', description: 'the .claude/launch.json config name for the web dev server' },
    } } })
if (!gate || !gate.packageOk) {
  return { stopped: 'PACKAGE_NOT_READY', problems: gate?.packageProblems ?? ['preflight agent failed'] }
}
if (!gate.platformReady && args?.buildPlatform !== true) {
  return { stopped: 'PLATFORM_NOT_LANDED', missingPlatform: gate.missingPlatform, message: 'Scene-engine platform work is not landed. Re-run with args.buildPlatform=true to build it inside this pipeline, or land it separately first (it is architecture-level work with its own review unit).' }
}
const PKG = gate.packageDir
const scenes = gate.scenes
log(`Gate passed: ${scenes.length} scenes; platform ${gate.platformReady ? 'ready' : 'to be built'}; ${gate.assumedDefaults?.length ?? 0} decision defaults assumed.`)

// ── Phase: Platform (optional, serialized — shared files) ───────────────────
if (!gate.platformReady) {
  phase('Platform')
  const steps = [
    'Scene engine core: useSceneEngine hook, SceneConfig/SceneNode/NarrationRef types, node state machine (locked→discovered→resolved), onComplete-once via derived-boolean effect. Per the exemplar spec in docs/GAO-001-A-New-Journey/design/02-ux-architecture.md §3.',
    `Layout template shells required by ${'{PKG}'}/design/02-ux-architecture.md, as generic config-driven components, plus shared primitives (SceneModal, ChoiceButton, ProgressChip, useSceneAudio, usePhaseGate, useUnlockTracking, MuteToggle, focus-trap/reduced-motion framework).`,
    'sceneProgress persistence (namespaced snapshot via the existing learner path, read as initialState) and the SceneRegistry discriminator (stable card id based, additive shell touch only).',
    'Narration data-module schema support + narration manifest extension + the build-time coverage/forbidden-string/verbatim-sentence CI check script.',
  ]
  for (let i = 0; i < steps.length; i++) {
    const r = await agent(`Platform build step ${i + 1}/${steps.length} for the story-module engine.
Read ${PLAYBOOK} (Phase 9.1), ${INV} (§3, §8, §9), and docs/GAO-001-A-New-Journey/design/02-ux-architecture.md + 03-narration-system.md.
${DO_NOT_TOUCH}
Task: ${steps[i].replace('{PKG}', PKG)}
Match the codebase's existing style. After implementing, run: npx tsc -p tsconfig.app.json --noEmit — and fix until clean (remember: src/policy code is only checked once imported from src/v6; add the import wiring needed for typecheck to see your code). Return files created/changed and the typecheck result.`,
      { label: `platform:${i + 1}`, phase: 'Platform', model: 'sonnet', schema: {
        type: 'object', required: ['ok', 'summary'], properties: { ok: { type: 'boolean' }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } } } })
    if (!r?.ok) return { stopped: 'PLATFORM_BUILD_FAILED', step: i + 1, detail: r?.summary }
  }
}

// ── Phase: Build (scenes parallel — new files only; then serial integration) ─
phase('Build')
const built = await parallel(scenes.map(s => () =>
  agent(`Implement scene ${s.num} of module ${moduleId} from its storyboard.
Read, in order: ${INV}; ${PLAYBOOK} (Phase 9.2); ${PKG}/design/02-ux-architecture.md and 03-narration-system.md; your storyboard ${s.path}.
${DO_NOT_TOUCH}
Create NEW FILES ONLY — do not edit any existing/shared file (integration is a later serialized step; name the wiring you need in your return value):
1. The scene's SceneConfig data module (nodes, choices, feedback text, safeCompletionLabel) — every string from the storyboard's per-node specs and Field/Reference Notes, verbatim.
2. The narration data module (all four tiers, conceptIds, transcriptFlag) per storyboard §9. Verbatim compliance sentences must be COPY-PASTED from the canonical source string named in ${PKG}/design/03-narration-system.md — never retyped.
3. A component only if the assigned template genuinely needs bespoke code beyond the generic shell.
4. A vitest unit test asserting: safe completion label, forbidden-string word test over all scene strings, verbatim sentence character-match (if this scene carries one), and node/concept counts vs the storyboard.
Match existing code style. Do NOT run global typecheck (your files aren't wired yet); self-review imports/types instead.`,
    { label: `build:s${String(s.num).padStart(2, '0')}`, phase: 'Build', model: 'sonnet', schema: {
      type: 'object', required: ['files', 'wiringNeeded'], properties: {
        files: { type: 'array', items: { type: 'string' } },
        wiringNeeded: { type: 'array', items: { type: 'string' }, description: 'registry entries, manifest keys, exports the integrator must add' },
        notes: { type: 'string' } } } })
    .then(r => r && { ...r, num: s.num })))
const okBuilt = built.filter(Boolean)
if (okBuilt.length < scenes.length) log(`WARNING: ${scenes.length - okBuilt.length} scene build agent(s) failed — integrator will flag gaps.`)

await agent(`Integration step for module ${moduleId}: wire the newly built scene files into the app (serialized — you are the only agent touching shared files).
Read ${PLAYBOOK} (Phase 9.3), ${INV} §3, and the wiring requests below. ${DO_NOT_TOUCH}
Wiring requested per scene:
${okBuilt.map(b => `Scene ${b.num}: files ${b.files.join(', ')} — needs: ${b.wiringNeeded.join('; ')}`).join('\n')}
Do: scene registration (stable card-id based), narration manifest keys, exports, and the src/v6 import path that makes all new code visible to tsc. Shell touches must be additive only.
Then run until clean: npx tsc -p tsconfig.app.json --noEmit, and npm run test. Return results.`,
  { label: 'build:integrate', phase: 'Build', model: 'sonnet', schema: {
    type: 'object', required: ['ok', 'summary'], properties: { ok: { type: 'boolean' }, summary: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } } } })

// ── Phase: StaticVerify ─────────────────────────────────────────────────────
phase('StaticVerify')
const STATIC_SCHEMA = { type: 'object', required: ['pass', 'failures'], properties: {
  pass: { type: 'boolean' }, failures: { type: 'array', items: { type: 'string' } }, outputs: { type: 'string', description: 'condensed command outputs' } } }
const staticPrompt = `Run the full static gate for module ${moduleId} per ${PLAYBOOK} Phase 10:
1. npx tsc -p tsconfig.app.json --noEmit
2. npm run test
3. npx eslint <only the files created/changed for this module — find via git status>
4. The narration coverage CI check (≥90%/scene, verbatim matches, forbidden strings) — if the script doesn't exist, do a manual grep pass over the new narration/scene data files for the forbidden word test (attest/acknowledg-/sign(ed,off)/certif- in completion strings) and verbatim sentences, and flag that the CI script is missing.
5. git diff --stat sanity: confirm no files outside the allowed surface (new module files + sanctioned integration points) were modified. ${DO_NOT_TOUCH}
Report pass/fail with each failure quoted.`
let staticResult = await agent(staticPrompt, { label: 'static:gate', phase: 'StaticVerify', model: 'sonnet', schema: STATIC_SCHEMA })
let round = 0
while (staticResult && !staticResult.pass && round < maxFixRounds) {
  round++
  await agent(`Fix these static-gate failures for module ${moduleId} (root cause in source; never weaken tests/checks; ${DO_NOT_TOUCH}):\n${staticResult.failures.map((f, i) => `${i + 1}. ${f}`).join('\n')}\nRead ${INV} first if any failure is compliance-flavored.`,
    { label: `static:fix${round}`, phase: 'StaticVerify', model: 'sonnet' })
  staticResult = await agent(staticPrompt, { label: `static:regate${round}`, phase: 'StaticVerify', model: 'sonnet', schema: STATIC_SCHEMA })
}
if (!staticResult?.pass) return { stopped: 'STATIC_GATE_RED', failures: staticResult?.failures ?? ['gate agent failed'], fixRoundsUsed: round }

// ── Phase: UAT ∥ Audio (browser and GPU share nothing — run simultaneously) ─
phase('UAT')
const FINDINGS_SCHEMA = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object', required: ['severity', 'checklistItem', 'evidence'], properties: {
    severity: { enum: ['BLOCKER', 'MAJOR', 'MINOR'] },
    checklistItem: { type: 'string' },
    evidence: { type: 'string', description: 'observed snapshot text / console line / behavior' },
    scene: { type: 'number' } } } },
  blocked: { type: 'string', description: 'set ONLY if UAT could not run at all (e.g. auth) — reason' } } }
const uatScenePrompt = (s) => `Browser UAT for module ${moduleId}, scene ${s.num} (${s.slug}).
Read ${PLAYBOOK} Phase 11 Track A (your per-scene checklist, severity classes) and the storyboard ${s.path} (expected copy/behavior).
Use the preview_* tools ONLY (preview_start with the web config${gate.launchConfigName ? ` "${gate.launchConfigName}"` : ' from .claude/launch.json'} — reuse the running server), navigate to the module player for ${moduleId}, reach scene ${s.num}. If sign-in blocks you, use the app's dev/demo login; if still blocked, return blocked with the reason — never stub auth.
Execute EVERY checklist line. Assert copy via preview_snapshot/preview_inspect (text, not screenshots). Report every failure as a finding with severity + evidence; empty findings = scene passed.`

// Track A: serialized browser UAT (one browser).
const uatTrack = async () => {
  const findings = []
  for (const s of scenes) {
    const r = await agent(uatScenePrompt(s), { label: `uat:s${String(s.num).padStart(2, '0')}`, phase: 'UAT', model: 'sonnet', schema: FINDINGS_SCHEMA })
    if (r?.blocked) return { findings, blocked: r.blocked }
    if (r) findings.push(...r.findings.map(f => ({ ...f, scene: f.scene ?? s.num })))
    log(`UAT scene ${s.num}: ${r ? r.findings.length + ' finding(s)' : 'agent failed'}`)
  }
  const mod = await agent(`Module-level browser UAT for ${moduleId} per ${PLAYBOOK} Phase 11 Track A module checklist (full run-through, quiz untouched vs ${PKG}/recon/content-inventory.md, shell intact, both completion stores consistent, no acknowledgment-state writes). Same preview_* rules as scene UAT.`,
    { label: 'uat:module', phase: 'UAT', model: 'sonnet', schema: FINDINGS_SCHEMA })
  if (mod?.blocked) return { findings, blocked: mod.blocked }
  if (mod) findings.push(...mod.findings.map(f => ({ ...f, scene: f.scene ?? 0 })))
  return { findings, blocked: null }
}

// Track B: Qwen3-TTS voice-clone narration generation (GPU; no app/manifest writes yet).
const audioTrack = async () => {
  if (skipAudio) return { skipped: true }
  return agent(`Generate the narration audio for module ${moduleId} via Qwen3-TTS voice cloning, per ${PLAYBOOK} Phase 11 Track B (steps 1–2 ONLY — no manifest mapping yet; that is a later serialized step).
${VOICE_REF_INSTRUCTION}
1. Read ${PKG}/design/03-narration-system.md (segment ids) and the narration data modules built for this module; export ALL segments (all four tiers) to a segments JSON [{id, text, language?}] in your scratchpad.
2. Determine the correct narration asset output dir from ${PKG}/recon/narration-infrastructure.md.
3. Run (Bash): "C:/AI/qwen3-tts-env/Scripts/python.exe" scripts/narrationTts/generate_narration_audio.py --manifest <segments.json> --ref-audio "<voice ref audio>" --ref-text "<voice ref text>" --out-dir <asset dir> [--language "<voice ref language>"]
   Long-running (one model load + sequential GPU generation) — use a generous timeout and run it once; do NOT parallelize or re-invoke per segment.
4. Read the generation-results.json it writes. Return outDir, resultsPath, voiceRefUsed (the audio path actually used), segment counts, and every failed/suspicious segment (error, or duration under ~1s per 5 words = likely truncation).`,
    { label: 'audio:generate', phase: 'Audio', model: 'sonnet', schema: {
      type: 'object', required: ['ok', 'outDir', 'resultsPath', 'generated', 'failedSegments'], properties: {
        ok: { type: 'boolean' }, outDir: { type: 'string' }, resultsPath: { type: 'string' },
        voiceRefUsed: { type: 'string' },
        generated: { type: 'number' }, totalSegments: { type: 'number' },
        failedSegments: { type: 'array', items: { type: 'string' } }, notes: { type: 'string' } } } })
}

const [uatOutcome, audioOutcome] = await parallel([uatTrack, audioTrack])
let allFindings = uatOutcome?.findings ?? []
const uatBlocked = uatOutcome?.blocked ?? (uatOutcome ? null : 'UAT track agent failed')
if (uatBlocked) return { stopped: 'UAT_BLOCKED', reason: uatBlocked, staticGate: 'green', findingsSoFar: allFindings, audio: audioOutcome }

// Audio mapping + verification (serialized, after both tracks — manifest writes
// must not hot-reload the app mid-UAT).
if (!skipAudio && audioOutcome) {
  phase('Audio')
  await agent(`Map the generated narration audio for ${moduleId} into the app per ${PLAYBOOK} Phase 11 Track B step 3. Audio files: ${audioOutcome.outDir}. Wire every generated file into the narration manifest so hasNarrationAudio/narrationAssetPath resolve each audioLocation key (patterns per ${PKG}/recon/narration-infrastructure.md). Missing/failed segments (${JSON.stringify(audioOutcome.failedSegments)}) must degrade to TTS-preview + transcript, never block progress. ${DO_NOT_TOUCH} Then run npx tsc -p tsconfig.app.json --noEmit until clean.`,
    { label: 'audio:map', phase: 'Audio', model: 'sonnet' })
  const audioVerify = await agent(`Audio verification for ${moduleId} per ${PLAYBOOK} Phase 11 Track B step 4. Check: every narrationId in the module's narration data modules has a mapped file with nonzero/plausible duration (results: ${audioOutcome.resultsPath}; flag < ~1s per 5 words); the manifest resolves every key; TOTAL narration duration summed across all segments is >= 30 minutes (invariants §9.5 — under-floor = MAJOR, scene 0); stale-audio check — each segment's current text still matches its generation record's word count (text edited after generation = MAJOR); then ONE browser spot check (preview_* tools) that a scene plays the cloned audio and the transcript panel matches. Report failures as findings (BLOCKER if a scene's audio path 404s or playback blocks progress; MAJOR for truncated/failed/stale segments or under-floor total; MINOR for polish), scene 0 for module-wide.`,
    { label: 'audio:verify', phase: 'Audio', model: 'sonnet', schema: FINDINGS_SCHEMA })
  if (audioVerify?.findings) allFindings.push(...audioVerify.findings.map(f => ({ ...f, scene: f.scene ?? 0, audio: true })))
  log(`Audio: ${audioOutcome.generated}/${audioOutcome.totalSegments ?? '?'} segments generated; ${audioOutcome.failedSegments.length} failed; ${audioVerify?.findings?.length ?? 0} verification finding(s).`)
}

// ── Phase: Fix loop ─────────────────────────────────────────────────────────
phase('Fix')
let fixRound = 0
let open = allFindings.filter(f => f.severity !== 'MINOR')
const resolved = []
while (open.length && fixRound < maxFixRounds) {
  fixRound++
  log(`Fix round ${fixRound}: ${open.length} BLOCKER/MAJOR finding(s).`)
  await agent(`Fix these UAT/audio findings for module ${moduleId} at root cause in source (never edit checklists/tests to pass; ${DO_NOT_TOUCH}). Read ${INV} and the relevant storyboards in ${PKG}/scenes/ for intended behavior. For failed/truncated AUDIO segments: ${VOICE_REF_INSTRUCTION} Regenerate via (Bash): "C:/AI/qwen3-tts-env/Scripts/python.exe" scripts/narrationTts/generate_narration_audio.py --manifest <segments json> --ref-audio "<voice ref audio>" --ref-text "<voice ref text>" --out-dir <same asset dir> --only <failed ids> — then confirm the manifest still resolves.\n${open.map((f, i) => `${i + 1}. [${f.severity}]${f.audio ? ' [AUDIO]' : ''} scene ${f.scene}: ${f.checklistItem} — ${f.evidence}`).join('\n')}\nThen run the static gate (tsc + npm run test) until clean.`,
    { label: `fix:round${fixRound}`, phase: 'Fix', model: 'sonnet' })
  const failedScenes = [...new Set(open.map(f => f.scene))]
  const recheck = []
  for (const num of failedScenes) {
    const s = scenes.find(x => x.num === num)
    const r = s
      ? await agent(uatScenePrompt(s), { label: `reuat:s${num}r${fixRound}`, phase: 'Fix', model: 'sonnet', schema: FINDINGS_SCHEMA })
      : await agent(`Re-run the module-level checks for ${moduleId} per ${PLAYBOOK} Phase 11: the Track A module checklist, AND (if audio findings were among those just fixed) the Track B step 4 audio verification (mapped files, durations, one browser playback spot check).`, { label: `reuat:module-r${fixRound}`, phase: 'Fix', model: 'sonnet', schema: FINDINGS_SCHEMA })
    if (r?.blocked) return { stopped: 'UAT_BLOCKED', reason: r.blocked, fixRoundsUsed: fixRound }
    if (r) recheck.push(...r.findings.map(f => ({ ...f, scene: f.scene ?? num })))
  }
  resolved.push(...open.filter(o => !recheck.some(n => n.scene === o.scene && n.checklistItem === o.checklistItem)))
  open = recheck.filter(f => f.severity !== 'MINOR')
}

// ── Phase: Report ───────────────────────────────────────────────────────────
phase('Report')
const minor = allFindings.filter(f => f.severity === 'MINOR')
const report = await agent(`Write ${PKG}/uat/UAT-REPORT.md per ${PLAYBOOK} Phase 12: environment, per-scene checklist outcomes, findings table (fixed: ${JSON.stringify(resolved)}; escalated/open: ${JSON.stringify(open)}; minor (not auto-fixed): ${JSON.stringify(minor)}), audio generation stats (${skipAudio ? 'audio DESCOPED by user (skipAudio)' : `${audioOutcome?.generated ?? 0} segments generated to ${audioOutcome?.outDir ?? '?'}, voice ref ${audioOutcome?.voiceRefUsed ?? voiceRef?.audio ?? 'standard (scripts/narrationTts/voiceRef.default.json)'}, failures ${JSON.stringify(audioOutcome?.failedSegments ?? [])}`}), static-gate status (green after ${round} fix round(s)), assumed decision defaults: ${JSON.stringify(gate.assumedDefaults ?? [])}.
Then update the Status line of ${PKG}/00-OVERVIEW.md to ${open.length ? `"Built — UAT ran, ${open.length} escalation(s) open"` : '"Built & UAT-passed"'} (edit that line only).
Finally run: git diff --stat — and include the changed-file surface in the report for human review.`,
  { label: 'report', phase: 'Report', model: 'sonnet', schema: { type: 'object', required: ['path', 'summary'], properties: { path: { type: 'string' }, summary: { type: 'string' } } } })

return {
  moduleId,
  packageDir: PKG,
  scenesBuilt: okBuilt.length,
  staticGate: 'green',
  uat: { totalFindings: allFindings.length, fixed: resolved.length, escalatedOpen: open, minorOpen: minor.length },
  audio: skipAudio ? { skipped: true } : { generated: audioOutcome?.generated ?? 0, totalSegments: audioOutcome?.totalSegments, outDir: audioOutcome?.outDir, voiceRef: audioOutcome?.voiceRefUsed ?? voiceRef?.audio ?? 'standard (scripts/narrationTts/voiceRef.default.json)', failedSegments: audioOutcome?.failedSegments ?? [] },
  fixRoundsUsed: fixRound,
  assumedDefaults: gate.assumedDefaults ?? [],
  uatReport: report?.path ?? `${PKG}/uat/UAT-REPORT.md`,
  housekeepingForMainSession: [
    'Review git diff surface vs do-not-touch list before committing (do not commit unless the user asked)',
    open.length ? 'Escalated UAT findings need human decisions' : null,
    'Update project memory with build/UAT status',
  ].filter(Boolean),
}
