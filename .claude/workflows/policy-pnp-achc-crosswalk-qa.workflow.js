export const meta = {
  name: 'policy-pnp-achc-crosswalk-qa',
  description: 'Read-only, evidence-based QA audit of the V2 Home Health P&P system against the ACHC HH survey-readiness baseline PDF (coverage checklist only), the ACHC HH crosswalk, and CMS/California regulatory requirements. Writes a timestamped report folder under UAT_Reports/; never modifies policy or application source.',
  whenToUse: 'When the user invokes /policy-pnp-achc-qa or explicitly asks for the full Care Indeed P&P ACHC crosswalk QA audit. Args: { timestamp: "YYYY-MM-DD_HHmmss" (required — Date is unavailable in workflow scripts), corridorPath?, baselinePdf? }.',
  phases: [
    { title: 'Preflight', detail: 'git snapshot + source existence/readability gates + SOURCE_INDEX', model: 'haiku' },
    { title: 'Inventory', detail: 'bounded fan-out policy/forms/app inventory → CURRENT_POLICY_INVENTORY.csv', model: 'haiku' },
    { title: 'Baseline', detail: 'baseline PDF heading-checklist extraction (no narrative copying) + coverage comparison', model: 'sonnet' },
    { title: 'Crosswalk', detail: 'ACHC HH crosswalk QA matrix + HH tag confidence audit', model: 'sonnet' },
    { title: 'Regulatory', detail: 'CMS CoPs / Title 22 / HIPAA-CMIA-HITECH / Cal-OSHA-SB553 / OIG-FWA-FCA-AKS-Stark / EP freshness', model: 'sonnet' },
    { title: 'Defensibility', detail: 'defensibility gap ledger, forms/workflows/evidence linkage, app rendering & data-source QA', model: 'sonnet' },
    { title: 'Adversarial', detail: 'citation-integrity, non-copying, and overclaim refuter passes + report-only fixes + fix re-verification', model: 'sonnet' },
    { title: 'Synthesis', detail: 'deterministic verdict gates + source-integrity check → exec summary, action plan, expansion opportunities, attestation', model: 'sonnet' },
  ],
}

// ── Parameters & constants ──────────────────────────────────────────────────
const timestamp = args?.timestamp
if (!timestamp || !/^\d{4}-\d{2}-\d{2}_\d{6}$/.test(timestamp)) {
  return { error: 'args.timestamp is required in YYYY-MM-DD_HHmmss format (Date.now is unavailable inside workflow scripts). Example: { "timestamp": "2026-07-08_143000" }' }
}
if (args?.corridorPath !== undefined && typeof args.corridorPath !== 'string') return { error: 'args.corridorPath must be a string path' }
if (args?.baselinePdf !== undefined && typeof args.baselinePdf !== 'string') return { error: 'args.baselinePdf must be a string path' }
const ROOT = 'C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2'
const BASELINE_PDF = args?.baselinePdf || (ROOT + '/CA ACHC HH PP 12-2025.docx (1).pdf')
const CORRIDOR = args?.corridorPath || 'C:/AI/Git/training/HomeHealth/Policies_and_Procedures/Corridor-Alignment-Strategy'
const REPORT = 'UAT_Reports/POLICY_PNP_QA_ACHC_CROSSWALK_' + timestamp
const WORK = REPORT + '/_work'

const DELIVERABLES = [
  'SOURCE_INDEX.md',
  'POLICY_QA_EXECUTIVE_SUMMARY.md',
  'CURRENT_POLICY_INVENTORY.csv',
  'BASELINE_MINIMUM_SURVEY_READINESS_COMPARISON.md',
  'ACHC_HH_CROSSWALK_QA_MATRIX.csv',
  'POLICY_HH_TAG_CONFIDENCE_AUDIT.csv',
  'CMS_CA_REGULATORY_FRESHNESS_CHECK.md',
  'DEFENSIBILITY_GAP_LEDGER.md',
  'FORMS_WORKFLOWS_EVIDENCE_LINKAGE_AUDIT.md',
  'APP_POLICY_RENDERING_AND_DATA_SOURCE_AUDIT.md',
  'POST_SURVEY_POLICY_EXPANSION_OPPORTUNITIES.md',
  'ACTION_PLAN.md',
  'NON_COPYING_ATTESTATION.md',
]

// Guardrail block injected into EVERY agent prompt. Violations are hard failures.
const GUARDRAILS = `
=== BINDING GUARDRAILS (violations are hard failures) ===
1. READ-ONLY AUDIT. You may ONLY create/edit files under ${REPORT}/ (inside the repo at ${ROOT}). Never modify, create, or delete any policy file, application source file, form, template, or doc anywhere else. Never write into ${CORRIDOR} or any path outside the V2 repo.
2. NO GIT MUTATIONS. git status / log / diff / show are allowed. Never run git add, commit, stash, checkout, restore, reset, merge, rebase, or push.
3. NO COPYING PROPRIETARY TEXT. The baseline PDF ("${BASELINE_PDF}") and the Corridor reference ("${CORRIDOR}") are proprietary. Treat the baseline strictly as a MINIMUM INTERNAL COVERAGE CHECKLIST: you may record section/policy TITLES, numbering, standard/tag identifiers, and short identifying phrases (<= 12 words, only when needed to identify an item). Never reproduce narrative, procedural, or policy body language from either source into any deliverable.
4. NO INVENTED CITATIONS. Cite a regulation, statute, ACHC standard, or HH tag only if you verified it in a repo/reference file you actually read, or it is a well-established primary citation you are certain of (e.g. 42 CFR Part 484). Anything you cannot verify gets confidence REVIEW_REQUIRED — never silently upgrade it. Never fabricate ACHC tag numbers.
5. NO UNSUPPORTED "SURVEY READY" CLAIMS. Never state or imply the organization is survey-ready. Findings state evidence, gap, and risk only.
6. CONFIDENCE LABELS (mandatory on every finding/row): HIGH = verified directly in >= 2 independent artifacts or unambiguous direct file evidence; MEDIUM = single direct file evidence; LOW = reasonable inference, not directly evidenced; REVIEW_REQUIRED = could not verify — needs human review.
7. SEVERITY LABELS (mandatory on every finding): P0 = survey-blocking / condition-level / legal-exposure gap; P1 = significant standard-level compliance gap; P2 = quality/consistency defect; P3 = enhancement opportunity.
8. EVIDENCE FORMAT: every finding cites concrete evidence as file path (+ line or section) or explicitly says "NO EVIDENCE FOUND". No vague references.
9. Your final message is data for an orchestrator — return ONLY the requested structured output, no prose preamble.
=== END GUARDRAILS ===`

const SEV = {
  type: 'object', required: ['p0', 'p1', 'p2', 'p3'],
  properties: { p0: { type: 'number' }, p1: { type: 'number' }, p2: { type: 'number' }, p3: { type: 'number' } },
}
const DOC_SCHEMA = {
  type: 'object', required: ['path', 'written', 'summary', 'severityCounts'],
  properties: {
    path: { type: 'string' },
    written: { type: 'boolean' },
    summary: { type: 'string', description: '3-6 sentence summary of key findings' },
    severityCounts: SEV,
    reviewRequiredCount: { type: 'number', description: 'findings labeled REVIEW_REQUIRED' },
    flags: { type: 'array', items: { type: 'string' }, description: 'anything needing orchestrator/human attention' },
  },
}
const sumSev = (list) => list.filter(Boolean).reduce(
  (a, r) => ({ p0: a.p0 + (r.severityCounts?.p0 || 0), p1: a.p1 + (r.severityCounts?.p1 || 0), p2: a.p2 + (r.severityCounts?.p2 || 0), p3: a.p3 + (r.severityCounts?.p3 || 0) }),
  { p0: 0, p1: 0, p2: 0, p3: 0 })

// ── Phase 1: Preflight ──────────────────────────────────────────────────────
phase('Preflight')
const preflight = await agent(`${GUARDRAILS}
You are the preflight gate for a read-only P&P QA audit in the repo at ${ROOT} (your working directory).
Do ALL of the following and report honestly — a false "readable" here poisons the whole audit:
1. Git snapshot (read-only): current branch, HEAD short sha + subject, count of modified/untracked files. Create ${WORK}/ first, then save the full "git status --porcelain" output VERBATIM to ${WORK}/git-preflight.txt — this is the integrity baseline used at the end of the run to detect any accidental source mutation. Do NOT change any git state.
2. Baseline PDF: verify "${BASELINE_PDF}" exists and is readable — Read pages 1-3 with the Read tool and confirm real text is extracted (not blank/garbled). Determine total page count if you can (e.g. python pypdf via Bash, or from Read tool errors); use -1 if undeterminable.
3. Corridor reference: check whether the directory "${CORRIDOR}" exists and list its top-level contents if so (read-only).
4. App source presence: confirm these exist in the repo: src/policy/, public/templates/, docs/, src/v6/routing/navigationManifest.ts.
5. Create the report folder ${REPORT}/ and ${WORK}/ and write ${REPORT}/SOURCE_INDEX.md: a table of every source consulted by this audit (repo root, baseline PDF, corridor path, key app/policy directories) with columns Source | Path | Role | Exists | Readable | Access (READ-ONLY) | Notes. Mark the corridor row MISSING if absent. Include the audit timestamp ${timestamp} and the git snapshot.
List any source that exists but could not be read in unreadableSources.`,
  { label: 'preflight:gates', phase: 'Preflight', model: 'haiku', effort: 'low', schema: {
    type: 'object',
    required: ['gitBranch', 'gitDirtyCount', 'baselinePdfReadable', 'baselinePdfPages', 'corridorAvailable', 'appSourcePresent', 'sourceIndexWritten', 'unreadableSources'],
    properties: {
      gitBranch: { type: 'string' }, gitHead: { type: 'string' }, gitDirtyCount: { type: 'number' },
      baselinePdfReadable: { type: 'boolean' }, baselinePdfPages: { type: 'number', description: '-1 if unknown' },
      corridorAvailable: { type: 'boolean' }, corridorContents: { type: 'array', items: { type: 'string' } },
      appSourcePresent: { type: 'boolean' }, sourceIndexWritten: { type: 'boolean' },
      unreadableSources: { type: 'array', items: { type: 'string' } },
      notes: { type: 'array', items: { type: 'string' } },
    } } })

if (!preflight) return { verdict: 'NO-GO', error: 'preflight agent failed; audit cannot start' }
if (!preflight.baselinePdfReadable || !preflight.appSourcePresent) {
  await agent(`${GUARDRAILS}
Preflight failed for the P&P QA audit: baselinePdfReadable=${preflight.baselinePdfReadable}, appSourcePresent=${preflight.appSourcePresent}, unreadableSources=${JSON.stringify(preflight.unreadableSources)}.
Write ${REPORT}/POLICY_QA_EXECUTIVE_SUMMARY.md declaring VERDICT: NO-GO with the exact preflight failures, what a human must fix, and a note that no other audit phases ran. Do not speculate about policy quality.`,
    { label: 'preflight:no-go-report', phase: 'Preflight', model: 'haiku', effort: 'low' })
  return { verdict: 'NO-GO', reportDir: REPORT, gateFailures: ['sources-unreadable'], preflight }
}
if (!preflight.corridorAvailable) log(`Corridor reference missing at ${CORRIDOR} — crosswalk QA will run from repo-internal crosswalk data only; verdict is capped at CONDITIONAL PASS.`)
log(`Preflight OK: branch ${preflight.gitBranch}, baseline PDF readable (${preflight.baselinePdfPages} pages), corridor ${preflight.corridorAvailable ? 'available' : 'MISSING'}.`)

// ── Phase 2: Inventory (haiku, bounded fan-out) ─────────────────────────────
phase('Inventory')
const scout = await agent(`${GUARDRAILS}
Scout the V2 repo (${ROOT}) for everything that constitutes the current P&P system: policy documents/content (docs/, src/policy/ data files, journey/training content), forms and templates (public/templates/, admission packets), workflows, eCign/e-signature surfaces, evidence/packet-studio artifacts, and app policy rendering data sources (navigation manifest, policy registries). Use Glob/Grep/ls only — read nothing large.
Partition the findings into AT MOST 8 non-overlapping work partitions for inventory agents. Each partition: short name, list of directories/globs, approximate file count. Exclude node_modules, dist, build outputs, .git, UAT_Reports, output/ mock data.`,
  { label: 'inventory:scout', phase: 'Inventory', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['partitions'],
    properties: { partitions: { type: 'array', items: { type: 'object', required: ['name', 'paths'], properties: {
      name: { type: 'string' }, paths: { type: 'array', items: { type: 'string' } }, approxFiles: { type: 'number' } } } } } } })
if (!scout?.partitions?.length) return { verdict: 'NO-GO', error: 'inventory scout returned no partitions', reportDir: REPORT }
const partitions = scout.partitions.slice(0, 8)
if (scout.partitions.length > 8) log(`Scout proposed ${scout.partitions.length} partitions; capped at 8 (deliberate bound — no uncontrolled swarms).`)

const invParts = await pipeline(partitions, (p, _item, i) => agent(`${GUARDRAILS}
Inventory partition "${p.name}" of the P&P system. Paths: ${p.paths.join(', ')}.
For every policy/form/workflow/training artifact found, produce one CSV row with EXACTLY these columns:
policy_id,title,artifact_type,file_path,app_rendered,hh_tags_claimed,regulatory_refs_claimed,forms_referenced,last_modified_evidence,confidence,notes
- artifact_type: POLICY | FORM | TEMPLATE | WORKFLOW | TRAINING | DATA_SOURCE | OTHER
- app_rendered: YES/NO/UNKNOWN (is it wired into the app UI?)
- hh_tags_claimed / regulatory_refs_claimed: semicolon-separated identifiers exactly as they appear in the artifact ("" if none). Copy identifiers only, never body text.
- confidence: HIGH/MEDIUM/LOW/REVIEW_REQUIRED per the guardrail definitions.
Quote any field containing commas. Write your rows (header included) to ${WORK}/inventory.part${i + 1}.csv.`,
  { label: `inventory:${p.name}`, phase: 'Inventory', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['rowCount', 'path'],
    properties: { rowCount: { type: 'number' }, path: { type: 'string' }, policyIdsSample: { type: 'array', items: { type: 'string' } }, flags: { type: 'array', items: { type: 'string' } } } } }))
const invOk = invParts.filter(Boolean)
if (!invOk.length) return { verdict: 'NO-GO', error: 'all inventory partition agents failed', reportDir: REPORT }

const inventory = await agent(`${GUARDRAILS}
Merge the partial inventory CSVs in ${WORK}/ (inventory.part*.csv) into ${REPORT}/CURRENT_POLICY_INVENTORY.csv with a single header row. Preserve all columns. Detect duplicates (same policy_id or same file_path appearing in multiple partitions): keep one row, note the duplication in its notes field, and list duplicate ids in your output. Report the final row count and counts by artifact_type. Also append an "Inventory sources" section to ${REPORT}/SOURCE_INDEX.md listing the partitions inventoried.`,
  { label: 'inventory:merge-csv', phase: 'Inventory', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['rowCount', 'duplicateIds'],
    properties: { rowCount: { type: 'number' }, duplicateIds: { type: 'array', items: { type: 'string' } },
      countsByType: { type: 'object', additionalProperties: { type: 'number' } }, flags: { type: 'array', items: { type: 'string' } } } } })
log(`Inventory: ${inventory?.rowCount ?? 0} artifacts, ${inventory?.duplicateIds?.length ?? 0} duplicates flagged.`)

// ── Phase 3: Baseline checklist extraction + comparison ─────────────────────
phase('Baseline')
const pages = preflight.baselinePdfPages > 0 ? preflight.baselinePdfPages : 0
const CHUNK = 20, MAX_CHUNKS = 30
let chunks = []
if (pages > 0) {
  const n = Math.ceil(pages / CHUNK)
  for (let i = 0; i < Math.min(n, MAX_CHUNKS); i++) chunks.push({ from: i * CHUNK + 1, to: Math.min((i + 1) * CHUNK, pages) })
  if (n > MAX_CHUNKS) log(`Baseline PDF has ${pages} pages; extracting only the first ${MAX_CHUNKS * CHUNK} (cap). Coverage checklist may be incomplete — this will be recorded and blocks PASS.`)
} else {
  chunks = [{ from: 1, to: -1 }]
  log('Baseline PDF page count unknown — single extraction agent will iterate page ranges until exhausted.')
}
const baselineTruncated = pages > 0 && Math.ceil(pages / CHUNK) > MAX_CHUNKS

const extractParts = await pipeline(chunks, (c, _item, i) => agent(`${GUARDRAILS}
Extract the STRUCTURE ONLY of the proprietary baseline reference PDF "${BASELINE_PDF}", ${c.to === -1 ? 'iterating with the Read tool in 20-page ranges from page 1 until the tool reports no more pages' : `pages ${c.from}-${c.to} (Read tool, pages parameter)`}.
Record ONLY: section/chapter numbers, policy titles/headings, ACHC standard or HH tag identifiers, and form names. Guardrail 3 applies with zero tolerance: no sentences, no procedural steps, no narrative fragments. Each checklist item: "- [<section/tag id>] <title> (baseline p.<page>)".
Write the items to ${WORK}/baseline-checklist.part${i + 1}.md. Report the last page you ACTUALLY read and set reachedEnd honestly — a false reachedEnd corrupts the coverage gate.`,
  { label: `baseline:extract-p${c.from}`, phase: 'Baseline', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['itemCount', 'lastPageRead', 'reachedEnd'],
    properties: { itemCount: { type: 'number' }, lastPageRead: { type: 'number' },
      reachedEnd: { type: 'boolean', description: 'true only if you read through the end of your assigned range (or of the document, when the range is open-ended)' },
      flags: { type: 'array', items: { type: 'string' } } } } }))
const extractOk = extractParts.filter(Boolean)
const maxPageRead = extractOk.reduce((m, e) => Math.max(m, e.lastPageRead || 0), 0)
const totalChecklistItems = extractOk.reduce((n, e) => n + (e.itemCount || 0), 0)
const extractionCoveredPdf = pages > 0
  ? (extractOk.length === chunks.length && maxPageRead >= pages)
  : (extractOk.length === chunks.length && extractOk.every(e => e.reachedEnd))
const baselineExtractionComplete = extractionCoveredPdf && !baselineTruncated && totalChecklistItems > 0
if (!baselineExtractionComplete) log(`Baseline extraction INCOMPLETE (covered=${extractionCoveredPdf}, truncated=${baselineTruncated}, items=${totalChecklistItems}, lastPage=${maxPageRead}/${pages || '?'}) — PASS is blocked.`)

const baselineCmp = await agent(`${GUARDRAILS}
You are performing the BASELINE MINIMUM SURVEY-READINESS COMPARISON for the P&P QA audit.
1. Merge ${WORK}/baseline-checklist.part*.md into ${WORK}/BASELINE_CHECKLIST.md (deduplicated, ordered). This checklist is a MINIMUM INTERNAL COVERAGE CHECKLIST only.
2. Read ${REPORT}/CURRENT_POLICY_INVENTORY.csv.
3. For EVERY baseline checklist item, classify V2 coverage: COVERED (V2 artifact substantively addresses the topic — name it), PARTIAL (topic touched but materially thinner — say what is missing at topic level), MISSING (no V2 artifact found), or REVIEW_REQUIRED. Verify by opening the claimed V2 artifact — do not trust inventory titles alone for COVERED. Assign confidence and severity per guardrails (a MISSING core CoP-level topic is typically P0/P1).
4. Write ${REPORT}/BASELINE_MINIMUM_SURVEY_READINESS_COMPARISON.md: methodology (explicitly: baseline used as coverage checklist only, no text reuse), the full item-by-item table, totals, and a "Comparison completeness" section stating whether every baseline item was classified (extractionComplete=${baselineExtractionComplete}).
comparisonComplete=true ONLY if extraction was complete AND you classified every item.`,
  { label: 'baseline:comparison', phase: 'Baseline', model: 'sonnet', schema: {
    ...DOC_SCHEMA,
    required: [...DOC_SCHEMA.required, 'comparisonComplete', 'totals'],
    properties: { ...DOC_SCHEMA.properties,
      comparisonComplete: { type: 'boolean' },
      totals: { type: 'object', required: ['baselineItems', 'covered', 'partial', 'missing', 'reviewRequired'], properties: {
        baselineItems: { type: 'number' }, covered: { type: 'number' }, partial: { type: 'number' }, missing: { type: 'number' }, reviewRequired: { type: 'number' } } } } } })
log(`Baseline comparison: ${baselineCmp?.totals?.covered ?? '?'}/${baselineCmp?.totals?.baselineItems ?? '?'} covered, ${baselineCmp?.totals?.missing ?? '?'} missing (complete=${!!baselineCmp?.comparisonComplete}).`)

// ── Phases 4-6: Crosswalk / Regulatory / Defensibility (controlled parallel) ─
const corridorNote = preflight.corridorAvailable
  ? `The Corridor crosswalk reference at "${CORRIDOR}" is available READ-ONLY — use it to validate mappings, never copy its narrative.`
  : `The Corridor crosswalk reference is UNAVAILABLE — work only from repo-internal crosswalk data and label externally-dependent judgments REVIEW_REQUIRED.`

const REG_DOMAINS_A = 'CMS Medicare Home Health Conditions of Participation (42 CFR Part 484), OASIS, plan of care, clinical records, patient rights, QAPI, personnel qualifications, training/competency'
const REG_DOMAINS_B = 'California Title 22 and state licensing law, HIPAA / CMIA / HITECH, Cal/OSHA IIPP and SB 553 workplace violence prevention, OIG compliance program / FWA / False Claims Act / Anti-Kickback Statute / Stark, emergency preparedness (42 CFR 484.102)'

const [xwalkMatrix, tagAudit, regA, regB, defensibility, linkage, appAudit] = await parallel([
  () => agent(`${GUARDRAILS}
ACHC HH CROSSWALK QA MATRIX. ${corridorNote}
Build ${REPORT}/ACHC_HH_CROSSWALK_QA_MATRIX.csv with columns:
achc_standard_or_hh_tag,requirement_topic,v2_policy_id,v2_artifact_path,mapping_status,evidence,confidence,severity,notes
- Source the standard/tag list from: repo-internal crosswalk data (grep the repo for HH tag / ACHC standard references), the baseline checklist at ${WORK}/BASELINE_CHECKLIST.md (identifiers only), and the Corridor reference if available.
- mapping_status: MAPPED_VERIFIED (you opened the V2 artifact and it addresses the standard), MAPPED_UNVERIFIED, UNMAPPED, or TAG_UNVERIFIABLE (identifier could not be confirmed as a real ACHC/HH identifier — guardrail 4; these are automatically REVIEW_REQUIRED).
- requirement_topic: your own words, <= 10, never baseline sentences.`,
    { label: 'crosswalk:matrix', phase: 'Crosswalk', model: 'sonnet', schema: {
      ...DOC_SCHEMA, required: [...DOC_SCHEMA.required, 'rows', 'unverifiableTags'],
      properties: { ...DOC_SCHEMA.properties, rows: { type: 'number' }, unverifiableTags: { type: 'number' } } } }),
  () => agent(`${GUARDRAILS}
HH TAG CONFIDENCE AUDIT. Audit every HH tag / ACHC standard claim made INSIDE V2 artifacts (see hh_tags_claimed in ${REPORT}/CURRENT_POLICY_INVENTORY.csv, plus grep for tag patterns in src/policy and docs).
For each claim, open the artifact and judge whether the claimed mapping is actually supported by the artifact's content. Write ${REPORT}/POLICY_HH_TAG_CONFIDENCE_AUDIT.csv:
v2_artifact_path,claimed_tag,claim_context,supported,assigned_confidence,inflation_flag,severity,evidence,notes
- inflation_flag=YES when the artifact claims/implies a stronger mapping or higher confidence than its content supports, or the tag is unverifiable. Count inflationHigh = inflated claims that a surveyor would rely on (P0/P1 relevance).
Be adversarial: your job is to catch inflated confidence, not confirm it.`,
    { label: 'crosswalk:tag-confidence', phase: 'Crosswalk', model: 'sonnet', schema: {
      ...DOC_SCHEMA, required: [...DOC_SCHEMA.required, 'totalClaims', 'inflatedHigh'],
      properties: { ...DOC_SCHEMA.properties, totalClaims: { type: 'number' }, inflatedHigh: { type: 'number', description: 'inflated claims with P0/P1 survey relevance' } } } }),
  () => agent(`${GUARDRAILS}
REGULATORY FRESHNESS QA — domain group A: ${REG_DOMAINS_A}.
For each domain: identify the V2 artifacts covering it (inventory CSV + your own grep), assess whether the content reflects current requirements (correct citations, no superseded requirements, no stale effective dates), and record findings with evidence, confidence, severity. You may use WebSearch to confirm current-ness; if you cannot confirm, label REVIEW_REQUIRED — never guess effective dates or citation numbers (guardrail 4).
Write ${WORK}/reg-freshness.partA.md with a per-domain findings table.`,
    { label: 'regulatory:cms-clinical', phase: 'Regulatory', model: 'sonnet', schema: DOC_SCHEMA }),
  () => agent(`${GUARDRAILS}
REGULATORY FRESHNESS QA — domain group B: ${REG_DOMAINS_B}.
Same method: locate covering V2 artifacts, assess freshness/correctness of citations and requirements, evidence + confidence + severity per finding. WebSearch allowed for confirmation; unconfirmable = REVIEW_REQUIRED. Never invent citations.
Write ${WORK}/reg-freshness.partB.md with a per-domain findings table.`,
    { label: 'regulatory:ca-privacy-safety-fwa', phase: 'Regulatory', model: 'sonnet', schema: DOC_SCHEMA }),
  () => agent(`${GUARDRAILS}
DEFENSIBILITY GAP LEDGER. Audit audit-trail defensibility of the V2 P&P system: version history / effective-review-revision dates on policies, approval attribution, eCign/e-signature integrity surfaces, evidence-packet generation (src/policy/evidence/), immutability/tamper-evidence of records, retention, and whether a surveyor could reconstruct who approved what and when.
Write ${REPORT}/DEFENSIBILITY_GAP_LEDGER.md as a ledger: one entry per gap with id (DEF-001…), description, artifact evidence, surveyor impact, confidence, severity, suggested remediation owner-type (do NOT rewrite any policy).`,
    { label: 'defensibility:ledger', phase: 'Defensibility', model: 'sonnet', schema: DOC_SCHEMA }),
  () => agent(`${GUARDRAILS}
FORMS / WORKFLOWS / EVIDENCE LINKAGE AUDIT. Using ${REPORT}/CURRENT_POLICY_INVENTORY.csv plus your own inspection: for each core operational control (admission/intake, consent, plan of care, OASIS, medication, infection control, incident/complaint/grievance, abuse-neglect reporting, emergency preparedness, QAPI, HR/competency, eCign), verify the chain POLICY → FORM(S) → WORKFLOW → EVIDENCE CAPTURE exists and is linked (policy references the form, the form exists, the workflow/app surface uses it, evidence lands somewhere auditable).
Write ${REPORT}/FORMS_WORKFLOWS_EVIDENCE_LINKAGE_AUDIT.md with a per-control chain table (each link: PRESENT/BROKEN/MISSING + evidence + confidence + severity). coreControlsMissing = count of core controls where a required form, workflow, or evidence link is MISSING.`,
    { label: 'defensibility:linkage', phase: 'Defensibility', model: 'sonnet', schema: {
      ...DOC_SCHEMA, required: [...DOC_SCHEMA.required, 'coreControlsMissing'],
      properties: { ...DOC_SCHEMA.properties, coreControlsMissing: { type: 'number' } } } }),
  () => agent(`${GUARDRAILS}
APP POLICY RENDERING & DATA-SOURCE AUDIT. Audit how policies are rendered in the application: navigation manifest (src/v6/routing/navigationManifest.ts), policy registries/data sources under src/policy/, journey/training content, templates under public/templates/. Static analysis ONLY — do not start dev servers.
Determine: which policies are wired into the app vs orphaned; whether app-rendered policy content is sourced from the canonical artifact or a diverging copy; broken data-source references; critical policies (patient rights, complaint/grievance, abuse reporting, emergency preparedness, infection control, admission/consent) that are NOT app-rendered.
Write ${REPORT}/APP_POLICY_RENDERING_AND_DATA_SOURCE_AUDIT.md. criticalRenderingGaps = count of critical policies missing or broken in app rendering.`,
    { label: 'defensibility:app-rendering', phase: 'Defensibility', model: 'sonnet', schema: {
      ...DOC_SCHEMA, required: [...DOC_SCHEMA.required, 'criticalRenderingGaps'],
      properties: { ...DOC_SCHEMA.properties, criticalRenderingGaps: { type: 'number' } } } }),
])

const regMerge = await agent(`${GUARDRAILS}
Merge ${WORK}/reg-freshness.partA.md and ${WORK}/reg-freshness.partB.md into ${REPORT}/CMS_CA_REGULATORY_FRESHNESS_CHECK.md: one document, per-domain sections in this order (CMS CoPs, OASIS, plan of care, clinical records, patient rights, QAPI, personnel, training/competency, Title 22/state, HIPAA/CMIA/HITECH, Cal-OSHA/IIPP/SB 553, OIG/FWA/FCA/AKS/Stark, emergency preparedness), a roll-up table of findings by severity, and a REVIEW_REQUIRED register. Preserve every finding verbatim from the parts — merge only, no re-judging.`,
  { label: 'regulatory:merge', phase: 'Regulatory', model: 'haiku', effort: 'low', schema: DOC_SCHEMA })

// ── Phase 7: Adversarial refuter passes (report files only) ─────────────────
phase('Adversarial')
const REFUTER_SCHEMA = {
  type: 'object', required: ['violations', 'blocking'],
  properties: {
    violations: { type: 'array', items: { type: 'object', required: ['file', 'detail'], properties: {
      file: { type: 'string' }, detail: { type: 'string' }, mustFix: { type: 'boolean' } } } },
    blocking: { type: 'boolean', description: 'true if any violation must block PASS/attestation' },
    checkedSamples: { type: 'number' },
  },
}
const refuters = await parallel([
  () => agent(`${GUARDRAILS}
ADVERSARIAL PASS — CITATION & TAG INTEGRITY. Assume the deliverables in ${REPORT}/ contain invented citations and fake ACHC/HH tags until proven otherwise. Sample aggressively (>= 30 citations/tags across the CSVs and MDs): trace each to the claimed source file/section or authoritative citation. Any citation/tag that does not trace = violation (mustFix=true). Also flag confidence labels of HIGH/MEDIUM that lack cited evidence.`,
    { label: 'adversarial:citation-integrity', phase: 'Adversarial', model: 'sonnet', schema: REFUTER_SCHEMA }),
  () => agent(`${GUARDRAILS}
ADVERSARIAL PASS — NON-COPYING. Assume the deliverables in ${REPORT}/ (and ${WORK}/BASELINE_CHECKLIST.md) copied proprietary baseline/Corridor narrative until proven otherwise. Sample suspicious passages (long fluent policy-sounding prose, procedural steps) and compare against the corresponding baseline PDF sections ("${BASELINE_PDF}") by reading those pages. Any reproduced narrative/procedural language beyond titles, identifiers, and <= 12-word identifying phrases = violation (mustFix=true). Report the sampling you did — the NON_COPYING_ATTESTATION will cite your pass.`,
    { label: 'adversarial:non-copying', phase: 'Adversarial', model: 'sonnet', schema: REFUTER_SCHEMA }),
  () => agent(`${GUARDRAILS}
ADVERSARIAL PASS — OVERCLAIM & INFLATION. Hunt the deliverables in ${REPORT}/ for: any "survey ready" (or equivalent) claim; conclusions stronger than their cited evidence; COVERED/MAPPED_VERIFIED statuses whose evidence is thin; severity downgrades without rationale; REVIEW_REQUIRED items silently treated as resolved. Each = violation (mustFix=true if it could mislead a compliance decision).`,
    { label: 'adversarial:overclaim', phase: 'Adversarial', model: 'sonnet', schema: REFUTER_SCHEMA }),
])
const refOk = refuters.filter(Boolean)
const mustFix = refOk.flatMap(r => (r.violations || []).filter(v => v.mustFix !== false))
const blockingFlagged = refOk.some(r => r.blocking)
let adversarialUnresolved = mustFix.length
if (mustFix.length) {
  log(`Adversarial passes found ${mustFix.length} must-fix violation(s) — applying report-only fixes.`)
  await agent(`${GUARDRAILS}
Fix these violations by editing ONLY files under ${REPORT}/ (downgrade confidence, remove/replace unverifiable citations with REVIEW_REQUIRED, delete copied text and re-summarize in original words, soften overclaims). Never touch anything outside the report folder. Violations:
${mustFix.map((v, i) => `${i + 1}. [${v.file}] ${v.detail}`).join('\n')}
Return a summary of each edit made.`,
    { label: 'adversarial:apply-fixes', phase: 'Adversarial', model: 'sonnet' })
  const reverify = await agent(`${GUARDRAILS}
RE-VERIFY ADVERSARIAL FIXES. A fixer just edited files under ${REPORT}/ to resolve the violations below. For EACH one, open the current file and confirm it is genuinely resolved — not merely reworded, moved, or hedged. List every violation still present in stillOpen (quote the offending text). Be skeptical: an unresolved violation that slips through here reaches the final report.
${mustFix.map((v, i) => `${i + 1}. [${v.file}] ${v.detail}`).join('\n')}`,
    { label: 'adversarial:reverify-fixes', phase: 'Adversarial', model: 'sonnet', schema: {
      type: 'object', required: ['stillOpen'],
      properties: { stillOpen: { type: 'array', items: { type: 'string' } } } } })
  adversarialUnresolved = reverify ? reverify.stillOpen.length : mustFix.length // reverify failure = assume nothing was fixed
  if (adversarialUnresolved) log(`${adversarialUnresolved} adversarial violation(s) remain unresolved after the fix pass — verdict will be capped.`)
}
// Blocking stands if itemized violations remain unresolved, or a refuter flagged
// blocking without itemizing fixable violations (nothing to fix ⇒ nothing cleared it).
const adversarialBlocking = adversarialUnresolved > 0 || (blockingFlagged && mustFix.length === 0)

// ── Phase 8: Deterministic verdict gates + synthesis ────────────────────────
phase('Synthesis')
const totalSev = sumSev([baselineCmp, xwalkMatrix, tagAudit, regA, regB, defensibility, linkage, appAudit])
// Hard gates — unknown/failed producers count as FAILURES, never as passes.
const gateFailures = []
if (!baselineCmp?.comparisonComplete) gateFailures.push('baseline-comparison-incomplete')
if (preflight.unreadableSources?.length) gateFailures.push('sources-unreadable')
if (!tagAudit || tagAudit.inflatedHigh > 0) gateFailures.push('hh-tag-confidence-inflated')
if (!appAudit || appAudit.criticalRenderingGaps > 0) gateFailures.push('critical-app-rendered-policies-missing')
if (!linkage || linkage.coreControlsMissing > 0) gateFailures.push('core-forms-workflows-evidence-missing')
if (!xwalkMatrix || !regA || !regB || !defensibility || !regMerge?.written) gateFailures.push('required-audit-section-failed')
if (refOk.length < 3) gateFailures.push('adversarial-passes-incomplete') // an unattested report can never PASS
const softFailures = []
if (!preflight.corridorAvailable) softFailures.push('corridor-crosswalk-reference-unavailable')
if (preflight.gitDirtyCount > 0) softFailures.push('working-tree-dirty-at-audit-time')

const RANK = { 'NO-GO': 0, 'NEEDS REMEDIATION': 1, 'CONDITIONAL PASS': 2, 'PASS': 3 }
let ceiling
if (gateFailures.includes('sources-unreadable')) ceiling = 'NO-GO'
else if (gateFailures.length > 0 || totalSev.p0 > 0 || adversarialBlocking) ceiling = 'NEEDS REMEDIATION'
else if (softFailures.length > 0 || totalSev.p1 > 0) ceiling = 'CONDITIONAL PASS'
else ceiling = 'PASS'
log(`Verdict ceiling (deterministic): ${ceiling}. Gate failures: ${gateFailures.join(', ') || 'none'}. Soft: ${softFailures.join(', ') || 'none'}. Severity totals: P0=${totalSev.p0} P1=${totalSev.p1} P2=${totalSev.p2} P3=${totalSev.p3}.`)
const allowedVerdicts = Object.keys(RANK).filter(v => RANK[v] <= RANK[ceiling])

const synthesis = await agent(`${GUARDRAILS}
FINAL SYNTHESIS for the P&P QA audit. Read every deliverable in ${REPORT}/ first. Orchestrator-computed facts (binding — you may go LOWER than the ceiling with justification, never higher):
- Allowed verdicts: ${allowedVerdicts.join(' | ')} (ceiling: ${ceiling})
- Hard gate failures: ${JSON.stringify(gateFailures)}
- Soft failures: ${JSON.stringify(softFailures)}
- Severity totals: ${JSON.stringify(totalSev)}
- Baseline coverage totals: ${JSON.stringify(baselineCmp?.totals || null)}
- HH tag claims audited: ${tagAudit?.totalClaims ?? 'unknown'}, inflated (P0/P1): ${tagAudit?.inflatedHigh ?? 'unknown'}
- Adversarial passes: ${refOk.length}/3 completed, ${mustFix.length} must-fix violations found, ${adversarialUnresolved} unresolved after report-only fixes + re-verification, blocking=${adversarialBlocking}
Write these four files:
1. ${REPORT}/POLICY_QA_EXECUTIVE_SUMMARY.md — VERDICT (one of the allowed verdicts) with the gate table, severity roll-up, top P0/P1 findings with evidence pointers, REVIEW_REQUIRED register size, methodology-and-limits section (including the read-only/non-copying constraints and any coverage caps). Never claim survey readiness — even a PASS is worded as "no blocking gaps found within audit scope".
2. ${REPORT}/POST_SURVEY_POLICY_EXPANSION_OPPORTUNITIES.md — P2/P3 improvement opportunities beyond minimum survey readiness (do NOT draft policy text).
3. ${REPORT}/ACTION_PLAN.md — prioritized remediation actions (P0 first): action, owner-type, deliverables affected, acceptance evidence. Recommendations only — no policy rewrites.
4. ${REPORT}/NON_COPYING_ATTESTATION.md — attest the methodology: baseline/Corridor used as coverage checklist and mapping reference only; what the adversarial non-copying pass sampled and found; any violations found and how they were remediated; signed "Automated audit pipeline policy-pnp-achc-crosswalk-qa, run ${timestamp}". If the non-copying refuter did not complete, say so and mark the attestation REVIEW_REQUIRED.`,
  { label: 'synthesis:final', phase: 'Synthesis', model: 'sonnet', schema: {
    type: 'object', required: ['verdict', 'filesWritten', 'topFindings'],
    properties: {
      verdict: { enum: ['PASS', 'CONDITIONAL PASS', 'NEEDS REMEDIATION', 'NO-GO'] },
      filesWritten: { type: 'array', items: { type: 'string' } },
      topFindings: { type: 'array', items: { type: 'string' }, description: 'top P0/P1 findings, one line each' },
      residualRisks: { type: 'array', items: { type: 'string' } },
    } } })

let verdict = synthesis?.verdict || 'NEEDS REMEDIATION'
if (RANK[verdict] > RANK[ceiling]) { log(`Synthesis proposed ${verdict} above the deterministic ceiling ${ceiling} — clamped.`); verdict = ceiling }

const completeness = await agent(`${GUARDRAILS}
Verify the report folder ${REPORT}/ contains ALL of these files, each non-empty and readable: ${DELIVERABLES.join(', ')}. Also verify the executive summary's stated verdict is exactly "${verdict}" — if it differs, edit ONLY the verdict line in ${REPORT}/POLICY_QA_EXECUTIVE_SUMMARY.md to match (the orchestrator's clamped verdict is authoritative). Report missing/empty files.`,
  { label: 'synthesis:completeness', phase: 'Synthesis', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['missing', 'empty'],
    properties: { missing: { type: 'array', items: { type: 'string' } }, empty: { type: 'array', items: { type: 'string' } }, verdictLineFixed: { type: 'boolean' } } } })
if ((completeness?.missing?.length || completeness?.empty?.length) && RANK[verdict] > RANK['NEEDS REMEDIATION']) {
  log(`Deliverables incomplete (${[...(completeness.missing || []), ...(completeness.empty || [])].join(', ')}) — verdict downgraded to NEEDS REMEDIATION.`)
  verdict = 'NEEDS REMEDIATION'
}

const integrity = await agent(`${GUARDRAILS}
POST-RUN SOURCE-INTEGRITY CHECK. Run "git status --porcelain" fresh and save the output VERBATIM to ${WORK}/git-postrun.txt. Compare it line-by-line against the preflight baseline ${WORK}/git-preflight.txt. Return every path whose status is new or different relative to the baseline, EXCLUDING everything under ${REPORT}. Report honestly — an empty list is the claim that this audit touched nothing outside its own report folder. Do not revert, clean, or otherwise "fix" anything you find.`,
  { label: 'synthesis:source-integrity', phase: 'Synthesis', model: 'haiku', effort: 'low', schema: {
    type: 'object', required: ['changedOutsideReport'],
    properties: { changedOutsideReport: { type: 'array', items: { type: 'string' } }, notes: { type: 'array', items: { type: 'string' } } } } })
const changedOutside = integrity ? (integrity.changedOutsideReport || []) : ['integrity-check-agent-failed']
const sourceMutationDetected = changedOutside.length > 0
if (sourceMutationDetected) {
  log(`SOURCE INTEGRITY VIOLATION: paths outside the report folder changed during the audit (${changedOutside.join(', ')}). Verdict forced to NO-GO — findings against a source tree that moved mid-audit are not trustworthy. Nothing was auto-reverted; a human must inspect these paths.`)
  verdict = 'NO-GO'
  gateFailures.push('source-mutation-during-audit')
}

return {
  verdict,
  ceiling,
  reportDir: REPORT,
  gateFailures,
  softFailures,
  severityTotals: totalSev,
  baselineTotals: baselineCmp?.totals || null,
  hhTagAudit: { totalClaims: tagAudit?.totalClaims ?? null, inflatedHigh: tagAudit?.inflatedHigh ?? null },
  adversarial: { passesCompleted: refOk.length, mustFixViolations: mustFix.length, unresolvedAfterFixes: adversarialUnresolved, blocking: adversarialBlocking },
  integrity: { sourceMutationDetected, changedOutsideReport: changedOutside },
  deliverables: { expected: DELIVERABLES.length, missing: completeness?.missing || ['unknown'], empty: completeness?.empty || [] },
  topFindings: synthesis?.topFindings || [],
  residualRisks: synthesis?.residualRisks || [],
  housekeepingForMainSession: [
    'Do NOT commit anything — the audit is report-only; the report folder is git-ignored under UAT_Reports/ or should be reviewed before any commit decision by the user.',
    'If integrity.sourceMutationDetected is true, tell the user which paths changed and determine (with them) whether a human or another process made the change before trusting any finding. Never revert those paths yourself.',
    'Surface every REVIEW_REQUIRED item and the gate table to the user.',
    'If verdict is NO-GO or NEEDS REMEDIATION, walk the user through ACTION_PLAN.md P0 items first.',
  ],
}
