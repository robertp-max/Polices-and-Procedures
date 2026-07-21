export const meta = {
  name: 'story-module-architecture',
  description: 'Convert a catalog training module into a GAO-001-style story-driven architecture package (recon → design → storyboards+verify → audits → fix → synthesis)',
  whenToUse: 'When the user asks to produce the story architecture package for a module from src/policy/journey/data/modules.ts (e.g. GAO-002…GAO-027, ADM/DON/RN tracks). Args: { moduleId, subtitle?, sourceHints?[] }.',
  phases: [
    { title: 'Recon', detail: '4 read-only inventory agents', model: 'sonnet' },
    { title: 'Design', detail: '5 design-system agents + consistency gate', model: 'sonnet' },
    { title: 'Storyboard', detail: 'one architect per scene, adversarially verified, ≤2 revisions', model: 'sonnet' },
    { title: 'Audit', detail: 'coverage, continuity, feasibility', model: 'sonnet' },
    { title: 'Fix', detail: 'apply findings + mechanical invariant re-verify', model: 'sonnet' },
    { title: 'Synthesize', detail: '00-OVERVIEW master synthesis', model: 'sonnet' },
  ],
}

// ── Parameters ──────────────────────────────────────────────────────────────
const moduleId = args?.moduleId
if (!moduleId || !/^[A-Z]{2,4}-\d{3}$/.test(moduleId)) {
  return { error: 'args.moduleId required, e.g. { "moduleId": "GAO-012" }' }
}
const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const PKG = args?.subtitle
  ? `docs/${moduleId}-${args.subtitle.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join('-')}`
  : `docs/${moduleId}-story-architecture`
const TPL = 'docs/Workflows/STORY-MODULE-TEMPLATE'
const EXEMPLAR = 'docs/GAO-001-A-New-Journey'
const sourceHints = Array.isArray(args?.sourceHints) && args.sourceHints.length
  ? `Likely source content locations (verify, do not trust blindly): ${args.sourceHints.join(', ')}.`
  : ''

const COMMON = (skeleton, exemplar) => `
You are producing one document of the story-module architecture package for module ${moduleId}.
MANDATORY first reads, in order:
1. ${TPL}/02-UNIVERSAL-INVARIANTS.md (binding rules — violations are hard failures)
2. ${TPL}/skeletons/${skeleton} (your document's required sections and done-criteria)
3. ${exemplar} (the GAO-001 worked exemplar of your document type — match its depth and rigor, not its module-specific content)
4. The catalog row for ${moduleId} in src/policy/journey/data/modules.ts
${sourceHints}
Write your finished document with the Write tool. Your final message is data for an orchestrator: return ONLY the requested structured summary, no prose preamble.`

const DOC_SCHEMA = {
  type: 'object',
  required: ['path', 'summary'],
  properties: {
    path: { type: 'string', description: 'repo-relative path of the document written' },
    summary: { type: 'string', description: '3-5 sentence summary of key findings/decisions' },
    flags: { type: 'array', items: { type: 'string' }, description: 'anything needing orchestrator or stakeholder attention' },
  },
}

// ── Phase 1: Recon ──────────────────────────────────────────────────────────
phase('Recon')
const [content, shell, engine, narrInfra] = await parallel([
  () => agent(`${COMMON('recon/content-inventory.skeleton.md', `${EXEMPLAR}/recon/content-inventory.md`)}
Write ${PKG}/recon/content-inventory.md. Enumerate and number every concept with file:line refs; capture the assessment verbatim; document current-delivery defects; end with the richness verdict.`,
    { label: 'recon:content', phase: 'Recon', model: 'sonnet', schema: {
      ...DOC_SCHEMA,
      required: ['path', 'summary', 'richness', 'sceneCount', 'conceptCount'],
      properties: { ...DOC_SCHEMA.properties,
        richness: { enum: ['rich', 'partial', 'thin'] },
        sceneCount: { type: 'number', description: 'source page/scene count (1:1 mapping)' },
        sceneTitles: { type: 'array', items: { type: 'string' }, description: 'one short slug per scene, in order' },
        conceptCount: { type: 'number' },
        liveDefects: { type: 'array', items: { type: 'string' }, description: 'shipping-code defects found, with file:line' },
      } } }),
  () => agent(`${COMMON('recon/shell-integration.skeleton.md', `${EXEMPLAR}/recon/shell-integration.md`)}
Write ${PKG}/recon/shell-integration.md. Include the platform-ticket landed/not-landed status (card-id discriminator, sceneProgress persistence, engine, primitives, CI checks).`,
    { label: 'recon:shell', phase: 'Recon', model: 'sonnet', schema: DOC_SCHEMA }),
  () => agent(`${COMMON('recon/engine-patterns.skeleton.md', `${EXEMPLAR}/recon/prototype-patterns.md`)}
Write ${PKG}/recon/engine-patterns.md.`,
    { label: 'recon:engine', phase: 'Recon', model: 'sonnet', schema: DOC_SCHEMA }),
  () => agent(`${COMMON('recon/narration-infrastructure.skeleton.md', `${EXEMPLAR}/recon/narration-infrastructure.md`)}
Write ${PKG}/recon/narration-infrastructure.md.`,
    { label: 'recon:narration', phase: 'Recon', model: 'sonnet', schema: DOC_SCHEMA }),
])
if (!content) return { error: 'content-inventory recon failed; cannot proceed' }
if (content.richness === 'thin') {
  return { stopped: 'CONTENT_TOO_THIN', message: `Recon found no substantive source content for ${moduleId}. The pipeline converts content; it does not invent curriculum. Stakeholder input needed.`, recon: { content, shell, engine, narrInfra } }
}
const sceneCount = content.sceneCount
const sceneTitles = content.sceneTitles ?? Array.from({ length: sceneCount }, (_, i) => `scene-${i + 1}`)
log(`Recon complete: ${content.conceptCount} concepts across ${sceneCount} scenes (${content.richness}).`)

const RECON_REFS = `Recon ground truth (READ ALL FOUR): ${PKG}/recon/content-inventory.md, ${PKG}/recon/shell-integration.md, ${PKG}/recon/engine-patterns.md, ${PKG}/recon/narration-infrastructure.md.`

// ── Phase 2: Design ─────────────────────────────────────────────────────────
phase('Design')
const designDefs = [
  { n: '01-story-bible', extra: `ALSO read ${TPL}/03-STORY-UNIVERSE.md — established canon is binding; reuse before inventing; list any new canon in your summary's newCanon field.` },
  { n: '02-ux-architecture', extra: 'Assign one layout template per scene from the invariants §7 catalog, with content-shape rationale.' },
  { n: '03-narration-system', extra: 'Build the full concept checklist from the content inventory numbering — one conceptId per fact. Budget per-scene narration word targets summing to >= ~4,800 words (the 30-minute narration floor, invariants §9.5); if the source cannot sustain it, name policy-grounded expansions (invariants §1) with their policyRefs.' },
  { n: '04-compliance-framework', extra: 'Produce the per-scene citation map from the catalog refs + content, and the A–G audit checklist verifiers will run.' },
  { n: '05-learning-framework', extra: `Assessment alignment must match the module's catalog method. Pacing budget sums to the module's duration intent.` },
]
const design = await parallel(designDefs.map(d => () =>
  agent(`${COMMON(`design/${d.n}.skeleton.md`, `${EXEMPLAR}/design/${d.n}.md`)}
${RECON_REFS}
${d.extra}
Write ${PKG}/design/${d.n}.md.`,
    { label: `design:${d.n}`, phase: 'Design', model: 'sonnet', schema: {
      ...DOC_SCHEMA,
      properties: { ...DOC_SCHEMA.properties, newCanon: { type: 'array', items: { type: 'string' }, description: 'new story-universe canon introduced (story bible only)' } },
    } })))
if (design.filter(Boolean).length < 5) return { error: 'one or more design agents failed', design }

const gate = await agent(`Cross-read the five design documents in ${PKG}/design/ for mutual contradictions ONLY (scene counts, template assignments, cast names, citation assignments, pacing vs. node counts). Do not review quality. Return the list of contradictions, each naming both files and the conflicting claims. Empty list if consistent.`,
  { label: 'design:consistency-gate', phase: 'Design', model: 'sonnet', schema: {
    type: 'object', required: ['contradictions'],
    properties: { contradictions: { type: 'array', items: { type: 'string' } } } } })
if (gate?.contradictions?.length) {
  log(`Design consistency gate found ${gate.contradictions.length} contradiction(s) — reconciling.`)
  await agent(`Reconcile these contradictions between the design documents in ${PKG}/design/ by editing the WRONG document(s) (the content inventory in ${PKG}/recon/ is the ground truth; the concept checklist in 03 outranks prose claims). Contradictions:\n${gate.contradictions.map((c, i) => `${i + 1}. ${c}`).join('\n')}\nRead ${TPL}/02-UNIVERSAL-INVARIANTS.md first. Edit files in place; return a summary of edits.`,
    { label: 'design:reconcile', phase: 'Design', model: 'sonnet' })
}

// ── Phase 3: Storyboards (pipeline: author → verify → revise ≤2) ────────────
phase('Storyboard')
const DESIGN_REFS = `Design system (READ ALL FIVE): ${PKG}/design/01-story-bible.md, 02-ux-architecture.md, 03-narration-system.md, 04-compliance-framework.md, 05-learning-framework.md. ${RECON_REFS}`
const VERDICT = { type: 'object', required: ['pass', 'failures'], properties: {
  pass: { type: 'boolean' },
  failures: { type: 'array', items: { type: 'string' }, description: 'each failure names the checklist item (A–G) and the exact offending text/section' } } }

const scenes = await pipeline(
  sceneTitles.map((t, i) => ({ num: i + 1, slug: kebab(t) })),
  (s) => {
    const nn = String(s.num).padStart(2, '0')
    const path = `${PKG}/scenes/scene-${nn}-${s.slug}.md`
    return agent(`${COMMON('scene.skeleton.md', `${EXEMPLAR}/scenes/scene-04-values.md`)}
${DESIGN_REFS}
You are the architect for scene ${s.num} of ${sceneCount} ("${s.slug}"). Write ${path} with all 12 sections and REAL draft copy — complete narration scripts for all four tiers, actual Field/Reference Notes text, full feedback text for every choice option. Cover exactly the concept-checklist entries design/03 assigns to this scene, and meet this scene's narration word budget from design/03 (module floor: 30 minutes / ~4,800 words, invariants §9.5). Any content beyond the source inventory MUST follow the policy-grounded expansion rule (invariants §1): read the actual policy text for this module's policyRefs and cite it — never invent compliance content.`,
      { label: `scene:${nn}`, phase: 'Storyboard', model: 'sonnet', schema: { ...DOC_SCHEMA, required: ['path', 'summary'] } })
      .then(r => ({ ...r, path, num: s.num }))
  },
  async (sc) => {
    if (!sc) return null
    let rounds = 0
    while (rounds < 3) {
      const v = await agent(`You are a hostile compliance/quality reviewer. Read ${TPL}/02-UNIVERSAL-INVARIANTS.md, then the module audit checklist in ${PKG}/design/04-compliance-framework.md (section 5), then the storyboard ${sc.path}. Also spot-check its concept coverage against ${PKG}/design/03-narration-system.md's checklist for this scene. Try to FAIL it: forbidden/near-miss wording, state-write violations, citation mislabels or unauthorized citations, missing/altered verbatim sentences, scenario-realism breaches, redundancy violations, quality-bar gaps, placeholder copy. Any A–D failure means pass=false.`,
        { label: `verify:s${sc.num}r${rounds + 1}`, phase: 'Storyboard', model: 'sonnet', schema: VERDICT })
      if (!v || v.pass) return { ...sc, verified: !!v, failures: [] }
      rounds++
      if (rounds >= 3) return { ...sc, verified: false, failures: v.failures }
      await agent(`Revise the storyboard ${sc.path} IN PLACE to resolve every failure below, without weakening coverage or inventing content beyond ${PKG}/recon/content-inventory.md. Read ${TPL}/02-UNIVERSAL-INVARIANTS.md and ${PKG}/design/04-compliance-framework.md first.\nFailures:\n${v.failures.map((f, i) => `${i + 1}. ${f}`).join('\n')}`,
        { label: `revise:s${sc.num}r${rounds}`, phase: 'Storyboard', model: 'sonnet' })
    }
  },
)
const failedScenes = scenes.filter(Boolean).filter(s => s.failures?.length)
log(`Storyboards: ${scenes.filter(Boolean).length}/${sceneCount} written; ${failedScenes.length} with unresolved verification failures.`)

// ── Phase 4: Global audits (true barrier — needs all scenes) ────────────────
phase('Audit')
const AUDIT_SCHEMA = { ...DOC_SCHEMA, required: ['path', 'summary', 'findings'], properties: { ...DOC_SCHEMA.properties,
  findings: { type: 'array', items: { type: 'object', required: ['severity', 'finding', 'fixLocation'], properties: {
    severity: { enum: ['CRITICAL', 'HIGH', 'MEDIUM'] }, finding: { type: 'string' }, fixLocation: { type: 'string' } } } } } }
const audits = await parallel([
  () => agent(`${COMMON('audits/coverage-audit.skeleton.md', `${EXEMPLAR}/audits/coverage-audit.md`)}
Join the FULL concept checklist in ${PKG}/design/03-narration-system.md against every storyboard in ${PKG}/scenes/ — no sampling. Include the assessment-coverage table per ${PKG}/design/05-learning-framework.md, the verbatim character-match check, the forbidden-string scan, the narration volume check (total drafted narration word count vs the ~4,800-word / 30-minute floor, invariants §9.5), and expansion traceability (every expansion beyond the source inventory cites a policyRef — untraceable = CRITICAL). Write ${PKG}/audits/coverage-audit.md.`,
    { label: 'audit:coverage', phase: 'Audit', model: 'sonnet', schema: AUDIT_SCHEMA }),
  () => agent(`${COMMON('audits/continuity-audit.skeleton.md', `${EXEMPLAR}/audits/continuity-audit.md`)}
Check every scene in ${PKG}/scenes/ against ${PKG}/design/01-story-bible.md AND ${TPL}/03-STORY-UNIVERSE.md. Write ${PKG}/audits/continuity-audit.md.`,
    { label: 'audit:continuity', phase: 'Audit', model: 'sonnet', schema: AUDIT_SCHEMA }),
  () => agent(`${COMMON('audits/feasibility-audit.skeleton.md', `${EXEMPLAR}/audits/feasibility-audit.md`)}
Price every storyboard in ${PKG}/scenes/ against the real shell/engine state per ${PKG}/recon/shell-integration.md and ${PKG}/recon/engine-patterns.md. Findings here are implementation constraints for the ticket list, NOT storyboard edits. Write ${PKG}/audits/feasibility-audit.md.`,
    { label: 'audit:feasibility', phase: 'Audit', model: 'sonnet', schema: AUDIT_SCHEMA }),
])
const [covAudit, contAudit, feasAudit] = audits

// ── Phase 5: Fix pass ───────────────────────────────────────────────────────
phase('Fix')
const fixable = [...(covAudit?.findings ?? []), ...(contAudit?.findings ?? [])]
if (fixable.length) {
  await agent(`Apply every coverage and continuity audit finding below to the scene files in ${PKG}/scenes/ (and design docs only where the audit says the design doc is wrong). Read ${TPL}/02-UNIVERSAL-INVARIANTS.md, ${PKG}/design/04-compliance-framework.md, ${PKG}/audits/coverage-audit.md and ${PKG}/audits/continuity-audit.md first. Never weaken coverage, never touch feasibility findings, never edit the module's actual source code.\n${fixable.map((f, i) => `${i + 1}. [${f.severity}] ${f.finding} → fix at: ${f.fixLocation}`).join('\n')}`,
    { label: 'fix:apply', phase: 'Fix', model: 'sonnet' })
}
const reverify = await agent(`Mechanical invariant scan over every file in ${PKG}/scenes/ and ${PKG}/design/: (1) forbidden/near-miss completion wording per ${TPL}/02-UNIVERSAL-INVARIANTS.md §2 (word test: attest/acknowledg-/sign(ed,off)/certif-); (2) every verbatim sentence declared in ${PKG}/design/03-narration-system.md section 2 appears character-for-character at its mandated placements; (3) citation labels match invariants §4 (especially §484.50 vs §484.110). Report violations with file + quoted text; empty list if clean.`,
  { label: 'fix:reverify', phase: 'Fix', model: 'haiku', schema: { type: 'object', required: ['violations'], properties: { violations: { type: 'array', items: { type: 'string' } } } } })
if (reverify?.violations?.length) {
  await agent(`Fix these mechanical invariant violations in place (files under ${PKG}/). Rules: ${TPL}/02-UNIVERSAL-INVARIANTS.md §§2,4,5.\n${reverify.violations.map((v, i) => `${i + 1}. ${v}`).join('\n')}`,
    { label: 'fix:round2', phase: 'Fix', model: 'sonnet' })
}

// ── Phase 6: Synthesis ──────────────────────────────────────────────────────
phase('Synthesize')
const overview = await agent(`${COMMON('00-OVERVIEW.skeleton.md', `${EXEMPLAR}/00-OVERVIEW.md`)}
Read the ENTIRE package under ${PKG}/ (recon, design, scenes, audits). Write ${PKG}/00-OVERVIEW.md per the skeleton. Feasibility findings become the ticket list. Every judgment call made without stakeholder input goes in the flip-able decisions section; unresolved items (including these unresolved scene verifications, if any: ${JSON.stringify(failedScenes.map(s => ({ scene: s.num, failures: s.failures })))}) go in open items.`,
  { label: 'synthesize:overview', phase: 'Synthesize', model: 'sonnet', schema: { ...DOC_SCHEMA, properties: { ...DOC_SCHEMA.properties,
    openItems: { type: 'array', items: { type: 'string' } }, flipableDecisions: { type: 'array', items: { type: 'string' } } } } })

return {
  packageDir: PKG,
  sceneCount,
  conceptCount: content.conceptCount,
  richness: content.richness,
  liveDefectsFound: content.liveDefects ?? [],
  newStoryCanon: design[0]?.newCanon ?? [],
  unresolvedSceneVerifications: failedScenes.map(s => ({ scene: s.num, failures: s.failures })),
  openItems: overview?.openItems ?? [],
  flipableDecisions: overview?.flipableDecisions ?? [],
  housekeepingForMainSession: [
    `Append newStoryCanon + timeline row to ${TPL}/03-STORY-UNIVERSE.md`,
    'Spawn separate background tasks for liveDefectsFound',
    'Save/refresh project memory pointer for the new package',
    args?.subtitle ? null : `Rename ${PKG} once the story bible's subtitle is chosen`,
  ].filter(Boolean),
}
