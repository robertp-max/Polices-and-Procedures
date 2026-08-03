// Canonical content for the Business Plan pageview.
// Source: "Owned EHR Business Plan · Care Indeed Home Health Care, Inc."
// Board business plan · Version 2.2 · July 29, 2026.
// Transcribed faithfully from the board document extract. Financial figures
// that the source leaves as board-editable placeholders are represented as
// such here — no invented precision.

export interface TocItem { id: string; label: string }

export const TOC_ITEMS: TocItem[] = [
  { id: 'bp-decision', label: 'Board decision' },
  { id: 'bp-contents', label: 'Contents' },
  { id: 'bp-exec-summary', label: '01 · Executive summary' },
  { id: 'bp-company', label: '02 · Company description' },
  { id: 'bp-market', label: '03 · Market & industry' },
  { id: 'bp-competitive', label: '04 · Competitive landscape' },
  { id: 'bp-swot', label: '05 · SWOT analysis' },
  { id: 'bp-strategic-case', label: '06 · Strategic case for control' },
  { id: 'bp-build-buy', label: '07 · Build / integrate / buy' },
  { id: 'bp-systems-scope', label: '08 · Systems & service scope' },
  { id: 'bp-architecture', label: '09 · Architecture principles' },
  { id: 'bp-regulatory', label: '10 · Regulatory & compliance' },
  { id: 'bp-baa', label: '11 · BAA reality' },
  { id: 'bp-ai', label: '12 · Governed AI strategy' },
  { id: 'bp-alternatives', label: '13 · Transition options' },
  { id: 'bp-benefits', label: '14 · Benefits realization' },
  { id: 'bp-adoption', label: '15 · Adoption & stakeholders' },
  { id: 'bp-funding', label: '16 · Funding request' },
  { id: 'bp-financials', label: '17 · Financial projections' },
  { id: 'bp-roadmap', label: '18 · Roadmap & gates' },
  { id: 'bp-organization', label: '19 · Organization & governance' },
  { id: 'bp-kpis', label: '20 · Performance & KPIs' },
  { id: 'bp-stop-rules', label: '21 · Risk & stop rules' },
  { id: 'bp-appendix', label: '22 · Appendix' },
]

/* ---------- Meta / title block ---------- */

export const META_ROWS = [
  { label: 'Document', value: 'Board business plan · Version 2.2 · July 29, 2026' },
  { label: 'Prepared for', value: 'Governing Body & Executive Leadership' },
  { label: 'Decision status', value: 'Phase 0 authorization requested' },
  { label: 'Classification', value: 'Confidential strategic planning' },
]

/* ---------- Board decision requested ---------- */

export const DECISION_ASK =
  'Authorize discovery and the secure foundation — not an irreversible replacement. Approve a capped 90-day diligence phase, establish the owned control plane, and require a return to the Board with verified economics. WellSky remains the clinical and billing system of record until each migration gate is independently passed.'

export const POSTURE_FACTS = [
  { label: 'Base strategy', value: 'selective insourcing' },
  { label: 'Transition', value: 'coexist, prove, migrate' },
  { label: 'Commercialization', value: 'not assumed' },
  { label: 'AI posture', value: 'assistive, human-signed' },
]

export const DECISION_TERMS = {
  authorize: [
    '90-day contract, workflow, data, architecture, security, and financial diligence.',
  ],
  permit: [
    'Synthetic/no-PHI prototyping and enterprise landing-zone design.',
  ],
  notYet: [
    'Unrestricted PHI, clinical cutover, OASIS or claim submission, or WellSky retirement.',
  ],
  require: [
    'Clinical safety, privacy, security, Finance, billing, OASIS, and governing-body sign-off at defined gates.',
  ],
}

/* ---------- Entity distinction warning ---------- */

export const ENTITY_WARNING =
  'This plan is only for Care Indeed Home Health Care, Inc. The licensed skilled home health corporation is distinct from Care Indeed, Inc., the private-duty non-medical home care agency. Brand statistics, licenses, workflows, and economics must not be combined without internal verification.'

export const ENTITY_DETAIL =
  'California HCAI lists the entity as an open home health agency at 890 Santa Cruz Avenue, Menlo Park. Confirm current licenses, certifications, branches, service areas, payer enrollments, and executive roles during Phase 0.'

/* ---------- Contents grid (12 chapters, source order) ---------- */

export interface ContentsChapter { num: string; title: string; sub: string; id: string }

export const CONTENTS_CHAPTERS: ContentsChapter[] = [
  { num: '01', title: 'Executive summary', sub: 'Decision, thesis, value, risk', id: 'bp-exec-summary' },
  { num: '02', title: 'Company description', sub: 'Entity, mission, problem, users', id: 'bp-company' },
  { num: '03', title: 'Market analysis', sub: 'Demand, economics, saturation', id: 'bp-market' },
  { num: '04', title: 'Organization & management', sub: 'Governance and accountability', id: 'bp-organization' },
  { num: '05', title: 'Systems & service scope', sub: 'Complete EHR capability scope', id: 'bp-systems-scope' },
  { num: '06', title: 'Marketing & adoption', sub: 'Internal customers and rollout', id: 'bp-adoption' },
  { num: '07', title: 'Funding request', sub: 'Stage, uses, gates, stop rules', id: 'bp-funding' },
  { num: '08', title: 'Financial projections', sub: 'Five-year scenario model', id: 'bp-financials' },
  { num: '09', title: 'Appendix', sub: 'Research, assumptions, evidence', id: 'bp-appendix' },
  { num: '10', title: 'Architecture addendum', sub: 'Target, trust, data, migration', id: 'bp-architecture' },
  { num: '11', title: 'Risks & readiness', sub: 'Stop rules, mitigation, board decision', id: 'bp-stop-rules' },
  { num: '12', title: 'Complete EHR requirements', sub: '170 statements · 27 domains · 104 pageviews · 9 gates', id: 'bp-appendix' },
]

export const PLANNING_STANDARD =
  'Adapted from the SBA’s traditional business-plan framework; healthcare-specific chapters are added because compliance and clinical safety are core operating requirements.'

/* ---------- 01 Executive summary ---------- */

export const EXEC_THESIS =
  'The opportunity is not to build a bargain copy of Kinnser. It is to own the workflows, evidence, data contracts, integration velocity, and governed AI that distinguish how Care Indeed delivers skilled home health. Care Indeed already owns unusually rich home-health workflow and compliance intellectual property. The investment is to turn that IP into a secure clinical system of record — not to pretend the current compliance prototype already is one.'

export const EXEC_BASE_CASE =
  'The recommended base case is a governed hybrid: retain WellSky as the legal clinical and billing record while Care Indeed builds an owned identity, data, workflow, evidence, QAPI, and AI control plane. Then migrate bounded cohorts and modules only after clinical, regulatory, security, revenue, continuity, and adoption evidence crosses predetermined thresholds.'

export const EXEC_ELEMENTS = [
  { kicker: 'Problem', body: 'Recurring vendor dependency, limited release and integration control, workflow workarounds, and contract-dependent exit readiness.' },
  { kicker: 'Solution', body: 'An owned modular home-health EHR core with replaceable specialized rails and a human-accountable AI gateway.' },
  { kicker: 'Value', body: 'Cost control, faster change, lower rework, stronger claim and compliance evidence, better clinician experience, and strategic data ownership.' },
  { kicker: 'Proof model', body: 'Capped phases, explicit system-of-record boundaries, parallel reconciliation, independent validation, and Board-controlled stop/go gates.' },
]

export const EXEC_REQUEST =
  'Management returns at Gate A with the actual investment amount, downside/base/upside five-year cases, verified WellSky exposure, staffing plan, source-of-truth matrix, and export proof.'

export const EXEC_RECOMMENDATION = 'Recommendation: proceed, conditionally and in stages.'

/* ---------- 02 Company description ---------- */

export const COMPANY_INTRO =
  'This plan is prepared exclusively for Care Indeed Home Health Care, Inc. Public CareIndeed.com material spans multiple care lines and is used for brand context only; entity-specific scale, awards, workforce, licenses, and economics require internal verification.'

export const COMPANY_ROWS = [
  { kicker: 'Purpose', body: 'Build the operating system around the care model. The initiative exists to make clinical workflows, compliance controls, evidence, integrations, and learning loops configurable company assets rather than vendor-dependent workarounds.' },
  { kicker: 'Problem solved', body: 'Control is fragmented and expensive. The incumbent is mature, but Care Indeed does not own its code, roadmap, interface design, release timing, data model, enhancement economics, or termination process.' },
  { kicker: 'Primary customers', body: 'Care teams and operations — not software buyers. Field clinicians, intake, scheduling, authorization, QA/OASIS, clinical leadership, billing, QAPI, privacy, security, patients/proxies, physicians, and referral partners are the base-case users.' },
  { kicker: 'Strategic objective', body: 'Own differentiation; buy network scale. Own patient/episode workflow, records, evidence, APIs, analytics, and AI governance. Continue buying clearinghouse, identity, communications, eRx/EPCS, HIE, monitoring, and other specialized rails.' },
]

export const COMPANY_FACTS = [
  { label: 'Legal boundary', value: 'Separate from the non-medical Care Indeed entity.' },
  { label: 'Planning geography', value: 'Four Bay Area counties identified in project context; validate against licenses and referrals.' },
  { label: 'Base business model', value: 'Internal operating platform and strategic asset.' },
  { label: 'Future option', value: 'External commercialization requires a separate business case and approval.' },
]

/* ---------- 03 Market & industry research ---------- */

export const MARKET_INTRO =
  'The strongest market case is not a generic global “EHR CAGR.” It is the intersection of aging demand, intense HHA competition, payment and workforce pressure, interoperability gaps, and Care Indeed’s own auditable vendor and workflow value pool.'

export const MARKET_STATS = [
  { value: '2.7M', label: 'Medicare FFS home-health users', sub: 'Approximately 2.7 million beneficiaries received FFS home health in 2024.', source: 'MedPAC 2026' },
  { value: '$16B', label: '2024 FFS spending', sub: 'National scale proves home health is material; it does not establish Care Indeed’s own addressable savings.', source: 'MedPAC 2026' },
  { value: '97%+', label: 'Served by at least two HHAs', sub: 'Eighty-six percent lived in a ZIP served by five or more agencies — evidence of a highly competitive provider market.', source: 'MedPAC access data' },
  { value: '61.2M', label: 'Americans age 65+', sub: 'The 65+ population grew 3.1% from 2023 to 2024, reinforcing long-run demand for care at home.', source: 'U.S. Census' },
]

export const MARKET_FORCES = [
  'Payment pressure: CMS estimated aggregate 2026 HHA payments down 1.3%, or $220 million, from 2025.',
  'All-payer reality: MedPAC reported a 5.0% all-payer margin for freestanding HHAs in 2024, materially below the 21.2% FFS Medicare margin.',
  'Workforce pressure: the broader home-health and personal-care aide occupation is projected to grow 17% from 2024–2034.',
  'Regulatory velocity: OASIS-E2, all-payer collection, HHVBP, payment rules, accessibility, privacy, AI, and claims-attachment standards require effective-dated change.',
  'Interoperability gap: hospital-to-LTPAC electronic exchange remains incomplete, making usable referral and transition data a competitive capability.',
]

export const MARKET_RESEARCH_NEEDED = [
  'Demand: referrals by source, county, ZIP, service line, diagnosis, capacity, acceptance, and lost-reason.',
  'Economics: payer mix, census, revenue, contribution, denials, DSO, LUPA, utilization, overtime, and manual work.',
  'Incumbent exposure: 36 months of invoices, modules, interfaces, support, services, escalators, and renewal/termination terms.',
  'User burden: time-and-motion study, after-hours charting, duplicate entry, note return reasons, support history, and change backlog.',
  'Local competition: current CMS/HCAI agency supply, quality, star ratings, referral relationships, and service availability in validated counties.',
]

export const MARKET_POLICY_WATCH =
  'CMS’s July 2026 CY 2027 proposed rule estimates aggregate HHA payments would rise 2.4% versus 2026 if finalized. Treat it as a proposal, not guaranteed economics; the architecture must version payment and quality rules by effective date.'

/* ---------- 04 Competitive landscape ---------- */

export const COMPETITIVE_INTRO =
  'Public vendor pages show that mobile documentation, scheduling, billing, compliance, analytics, and interoperability already exist in the category. Claims below describe public positioning, not independently validated performance, price, fit, or market share.'

export interface CompetitiveVendor { name: string; tag: string; body: string; refLabel: string }

export const COMPETITIVE_VENDORS: CompetitiveVendor[] = [
  { name: 'WellSky Home Health', tag: 'INCUMBENT', body: 'Formerly Kinnser; publicly positions quality, financial performance, and operational control for home health.', refLabel: 'Official system page' },
  { name: 'Homecare Homebase', tag: 'HOME-BASED', body: 'Positions an integrated home-based care EHR across documentation, scheduling, billing, analytics, and AI extensions.', refLabel: 'Official system page' },
  { name: 'Axxess Home Health', tag: 'ECOSYSTEM', body: 'Positions an all-in-one platform with mobile/offline OASIS, quality management, billing, analytics, and connected services.', refLabel: 'Official system page' },
  { name: 'MatrixCare', tag: 'INTEROPERABILITY', body: 'Positions clinician-designed workflows, offline support, revenue cycle, analytics, and network connectivity.', refLabel: 'Official system page' },
  { name: 'Netsmart myUnity', tag: 'POST-ACUTE', body: 'Positions a unified patient record and integrated clinical/financial workflows across post-acute settings.', refLabel: 'Official system page' },
  { name: 'AlayaCare', tag: 'HOME-BASED AI', body: 'Positions end-to-end home-based care operations, mobile delivery, analytics, integrations, and AI automation.', refLabel: 'Official system page' },
]

export const COMPETITIVE_POSITION_NOTE =
  'Defensible Care Indeed position: agency-specific workflow fit, policy-to-record traceability, faster integration and rule change, controlled data portability, survey-ready evidence, field usability, and governed AI. Procurement must still compare the hybrid plan against optimizing WellSky and migrating to another packaged HHA EHR using the same scripted demonstrations, data-export tests, contract scorecard, implementation risk, and five-year TCO.'

/* ---------- 05 SWOT ---------- */

export interface SwotQuadrant { kicker: string; title: string; tone: 'good' | 'warn' | 'bad' | 'neutral'; items: string[] }

export const SWOT_QUADRANTS: SwotQuadrant[] = [
  {
    kicker: 'Strengths · internal', title: 'What Care Indeed can build from', tone: 'good',
    items: [
      'Rich policy, form, workflow, QAPI, evidence, and training requirements corpus.',
      'Direct clinical and operational knowledge of skilled home health.',
      'Existing traceability concepts across policy, form, event, evidence, and governance.',
      'Ability to co-design with the clinicians and operational teams who will use the system.',
      'Established brand commitment to innovation and care at home.',
    ],
  },
  {
    kicker: 'Weaknesses · internal', title: 'What is not production-ready', tone: 'bad',
    items: [
      'No authoritative patient, episode, order, OASIS, encounter, EVV, claim, or offline clinical kernel in the supplied runtime.',
      'Browser-local state, demo signatures, browser printing, and incomplete live integrations.',
      'No verified WellSky TCO, burden baseline, financial forecast, or named permanent systems organization yet.',
      'Ownership adds 24/7 reliability, cybersecurity, clinical-safety, release, and regulatory-maintenance obligations.',
      'Parallel running creates temporary cost and change fatigue.',
    ],
  },
  {
    kicker: 'Opportunities · external', title: 'Where ownership can compound', tone: 'neutral',
    items: [
      'AI lowers the cost of extraction, drafting, reconciliation, support, and quality detection when tightly governed.',
      'Growing older population and home-based care demand increase the value of scalable field operations.',
      'Interoperability and referral-transition gaps create room for a better partner experience.',
      'Rule and payer change can become tested, effective-dated system releases instead of manual workarounds.',
      'A proven internal platform may become commercializable IP later — but only under a separate case.',
    ],
  },
  {
    kicker: 'Threats · external', title: 'What can destroy the case', tone: 'warn',
    items: [
      'Mature incumbents already carry broad clinical, billing, mobile, integration, and regulatory capability.',
      'A clinical, OASIS, claims, security, or migration defect can harm patients, revenue, compliance, and trust.',
      'Vendor export/interface restrictions or poor data quality can delay coexistence and cutover.',
      'Specialized engineering, clinical informatics, security, OASIS, and revenue-cycle talent may be difficult to retain.',
      'Regulatory, payer, cyber, model, and technology changes can raise permanent operating cost.',
    ],
  },
]

/* ---------- 05 Strategic case for control ---------- */

export const STRATEGIC_INTRO =
  'AI changes the cost of building software. It does not remove the cost of clinical safety, regulatory maintenance, cybersecurity, change management, or 24/7 operations.'

export const STRATEGIC_POINTS = [
  { num: '01', title: 'Recurring dependency compounds', body: 'Subscription, module, interface, services, and workaround costs recur while Care Indeed does not own the code, release timing, or roadmap.' },
  { num: '02', title: 'Agency knowledge is the moat', body: 'Policies, workflow gates, QAPI logic, evidence rules, and clinician know-how can become executable system behavior.' },
  { num: '03', title: 'AI makes specificity affordable', body: 'Assistive AI can reduce extraction, drafting, reconciliation, and QA burden behind deterministic rules and human sign-off.' },
  { num: '04', title: 'Change speed has financial value', body: 'OASIS-E2 took effect in April 2026 and manual iQIES entry ended for those target dates. Rule change must become a governed release.' },
]

export const STRATEGIC_STATS = [
  { value: '−1.3%', label: 'estimated aggregate CY 2026 Medicare home-health payment change', source: 'CMS final rule' },
  { value: 'OASIS-E2', label: 'current instrument, effective April 1, 2026', source: 'CMS manual' },
  { value: '17%', label: '2024–34 projected growth for the broader aide occupation', source: 'BLS outlook' },
]

/* ---------- 06 Build / integrate / buy ---------- */

export const BUILD_BUY_TAGLINE = '“Own the workflow. Own the evidence. Keep clinical judgment human.”'

export const BUILD_BUY_INTRO =
  'This is not a proposal to reproduce Kinnser merely to avoid a subscription. It is a proposal to make Care Indeed’s clinical model, policies, evidence, integrations, and governed AI into an owned operating asset.'

export const BUILD_BUY_COLUMNS = [
  { title: 'BUILD / OWN', tone: 'good', items: ['patient + episode kernel', 'home-health workflow engine', 'clinical documentation UX', 'OASIS lifecycle orchestration', 'policy, evidence + QAPI links', 'AI gateway + provenance'] },
  { title: 'INTEGRATE', tone: 'neutral', items: ['WellSky during transition', 'referral + hospital exchange', 'labs, pharmacy + HIE', 'accounting + payroll', 'EVV aggregator', 'enterprise directory'] },
  { title: 'BUY AS RAILS', tone: 'warn', items: ['HIPAA-eligible cloud services', 'clearinghouse + payer network', 'eligibility + remittance', 'EPCS, if in scope', 'message delivery', 'security + monitoring tools'] },
] as const

/* ---------- 08 Systems & service scope (18-domain sourcing table) ---------- */

export const SYSTEMS_SCOPE_INTRO =
  'The complete home-health EHR capability map. Every domain needs an accountable owner, canonical data authority, effective-dated rules, immutable evidence, downtime behavior, and measurable acceptance criteria.'

export interface SystemsScopeRow { domain: string; capability: string; sourcing: string }

export const SYSTEMS_SCOPE_ROWS: SystemsScopeRow[] = [
  { domain: 'Organization + master data', capability: 'Legal entity, locations, NPI/CCN, disciplines, providers, users, payers, codes, effective dates, merge controls.', sourcing: 'OWN' },
  { domain: 'Patient identity / MPI', capability: 'Demographics, language, contacts, consent, proxy, identifier matching, merge/unmerge, history and deceased status.', sourcing: 'OWN' },
  { domain: 'Referral + intake', capability: 'Referral ingestion, documents, payer/capacity fit, accept/decline rationale, eligibility tasks and source communication.', sourcing: 'OWN INTEGRATE' },
  { domain: 'Eligibility + authorization', capability: '270/271, coverage evidence, payer rules, units, decrementing, expirations, visit holds, and 278 where applicable.', sourcing: 'BUY RAIL' },
  { domain: 'Episode + certification', capability: 'SOC, 30-day payment periods, 60-day certification, recertification, ROC, transfer, discharge, and effective-dated state.', sourcing: 'OWN' },
  { domain: 'OASIS-E2', capability: 'Current item set, skip and consistency edits, QA, lock/correction history, CMS-conformant vendor XML, submission acknowledgments, rejection correction, and resubmission. Do not recreate the discontinued manual-entry interface.', sourcing: 'OWN UX VALIDATE' },
  { domain: 'Plan of care + orders', capability: 'Goals, interventions, frequencies, verbal/read-back controls, signatures, secure delivery, renewal and unresolved-order work queues.', sourcing: 'OWN DELIVERY' },
  { domain: 'Clinical documentation', capability: 'Discipline templates, wounds, assessments, aide notes, co-sign, immutable versions, addenda, late entries and concurrent-edit control.', sourcing: 'OWN' },
  { domain: 'Medication management', capability: 'History/reconciliation, allergies/interactions, high-risk flags, issue escalation, pharmacy data, and MAR if actually in scope.', sourcing: 'OWN FLOW BUY DATA' },
  { domain: 'Scheduling + field ops', capability: 'Credentials, discipline, geography, frequency, authorization, continuity, conflicts, missed visits, dispatch and on-call.', sourcing: 'OWN' },
  { domain: 'Mobile + offline', capability: 'Encrypted offline drafts, deterministic sync/conflicts, device posture, remote wipe, safe downtime and recovery.', sourcing: 'OWN BUY MDM' },
  { domain: 'EVV', capability: 'Service, recipient, date, location, worker, start/end, device/offline provenance, exception review and aggregator export.', sourcing: 'INTEGRATE' },
  { domain: 'Revenue cycle', capability: 'PDGM/HIPPS, LUPA, NOA, coding, prebill, 837I, 835, 276/277, remittance, denial, ADR and overpayment.', sourcing: 'OWN FLOW BUY NETWORK' },
  { domain: 'Interoperability', capability: 'FHIR R4/US Core, C-CDA/Direct, single and bulk export, labs/pharmacy/HIE, provenance and consent-aware exchange.', sourcing: 'OWN API INTEGRATE' },
  { domain: 'Portals + communication', capability: 'Patient/proxy record access, consent, secure messaging, accessible multilingual UI and provider/referral status.', sourcing: 'OWN UX BUY DELIVERY' },
  { domain: 'QAPI + analytics', capability: 'Governed metrics, lineage, data-quality tests, OASIS/claims/HHCAHPS sources, events, PIPs and sustained-improvement evidence.', sourcing: 'OWN' },
  { domain: 'Privacy, security + continuity', capability: 'SSO/MFA, RBAC/ABAC, minimum necessary, break-glass, WORM audit, legal hold, retention, backup, restore and RTO/RPO.', sourcing: 'OWN CONTROL BUY TOOLS' },
  { domain: 'AI governance', capability: 'Approved use cases, source grounding, prompt/model registry, evaluation, provenance, human attestation, kill switch and no autonomous submission.', sourcing: 'OWN GATEWAY' },
]

/* ---------- 09 Architecture principles (ADR addendum) ---------- */

export const ARCH_INTRO =
  'One longitudinal record. Many replaceable services. The recommended starting point is a modular clinical core with clear domain boundaries — not a fragile browser prototype and not dozens of premature microservices. Care Indeed owns authority, orchestration, evidence, exports, and AI governance; specialized networks remain replaceable rails.'

export const ARCH_PRINCIPLES = [
  { adr: 'ADR 01 · SHAPE', title: 'Modular monolith first', body: 'Keep the transactional clinical core cohesive while enforcing domain APIs, separate ownership, and an outbox. Split services only when scale, isolation, or team boundaries prove the need.' },
  { adr: 'ADR 02 · AUTHORITY', title: 'Facts live in domains', body: 'The workflow engine governs tasks and gates; it never becomes the hidden authority for patient, episode, order, assessment, visit, or claim facts.' },
  { adr: 'ADR 03 · EVENTS', title: 'Reliable, replayable change', body: 'Versioned workflow definitions, idempotent commands, optimistic concurrency, transactional outbox, dead-letter handling, replay, and reconciliation prevent silent drift.' },
  { adr: 'ADR 04 · EVIDENCE', title: 'Deterministic legal record', body: 'Generate signed documents server-side, quarantine uploads, hash every artifact, preserve amendments, and prohibit destructive overwrite of authenticated records.' },
  { adr: 'ADR 05 · AI', title: 'Assistive and default-deny', body: 'Patient-scoped retrieval, approved models and tools, source links, typed proposals, human review, complete lineage, evaluation, drift monitoring, and an immediate kill switch.' },
  { adr: 'ADR 06 · PORTABILITY', title: 'Exit tested continuously', body: 'Maintain readable and computable patient, document, attachment, audit, configuration, and population exports — plus restore and migration rehearsals.' },
]

export const ARCH_AUTHORITY_NOTE =
  'Authority changes by gate — not by optimism. A domain authority register prevents two systems from silently becoming the legal source of truth. Every pilot cohort has one approved authority, explicit reconciliation, provenance, and rollback.'

export interface AuthorityRow { domain: string; shadow: string; pilot: string; target: string }

export const AUTHORITY_TABLE: AuthorityRow[] = [
  { domain: 'Patient + episode', shadow: 'WellSky authority; owned read model validates exports.', pilot: 'One approved authority per cohort; bidirectional identity reconciliation.', target: 'Care Indeed kernel; tested export and archive access.' },
  { domain: 'Clinical record + OASIS', shadow: 'WellSky signed record; owned system does not submit.', pilot: 'Care Indeed authority only for approved pilot scope after clinical-safety and CMS-submission gates.', target: 'Care Indeed record; immutable history and an accepted, reconciled CMS submission loop.' },
  { domain: 'Orders + visits', shadow: 'WellSky authority; discrepancies measured.', pilot: 'Cohort-specific authority with missed-order/visit reconciliation.', target: 'Care Indeed workflow; external delivery and EVV adapters.' },
  { domain: 'NOA + claims', shadow: 'WellSky/clearinghouse submit; owned engine compares only.', pilot: 'Parallel non-submitting claim and remittance reconciliation.', target: 'Care Indeed orchestration through contracted clearinghouse.' },
  { domain: 'Policy + QAPI evidence', shadow: 'Care Indeed corpus remains governing source; references linked.', pilot: 'Owned control plane captures provenance and approvals.', target: 'Owned effective-dated policy, evidence, and analytics authority.' },
]

export const MIGRATION_PATTERN =
  'WellSky authority → contracted export/adapter → validated shadow read model → field, count, hash, clinical and financial reconciliation → limited cohort with rollback → module authority transfer → decommission only after retention, audit, downtime, payer, and governing-body gates. Preserve the incumbent archive even after operational cutover.'

/* ---------- 08 Regulatory, certification & assurance ---------- */

export type RegTier = 'MANDATORY' | 'CONDITIONAL' | 'ROADMAP'

export interface RegRow {
  tier: RegTier
  category: string
  title: string
  body: string
  evidence: string
  refLabel: string
}

export const REGULATORY_ROWS: RegRow[] = [
  { tier: 'MANDATORY', category: 'Federal', title: 'CMS Home Health Conditions of Participation', body: 'Support patient rights, comprehensive assessment, care planning/coordination, QAPI, infection control, skilled services, emergency preparedness, governance, and complete authenticated records.', evidence: 'Timed workflows; unique author/date/time; record by next visit or ≤4 business days; governing-body evidence.', refLabel: '42 CFR Part 484' },
  { tier: 'MANDATORY', category: 'Assessment', title: 'OASIS-E2 assessment & CMS submission', body: 'Use effective-dated item sets; enforce skip/consistency edits, submission timing, lock, correction, and reconciliation; generate CMS-conformant vendor XML; manage acknowledgment, rejection, correction, resubmission. Do not recreate the discontinued manual iQIES entry interface.', evidence: 'CMS-conformant vendor file; accepted response; rejection/correction test; reconciliation; QRP 90% threshold monitoring.', refLabel: 'CMS OASIS-E2' },
  { tier: 'MANDATORY', category: 'Billing', title: 'HIPAA transactions + Medicare HH claims', body: 'Support applicable 837I, 835, 270/271, 276/277, TA1/999/277CA and payer guides. Manage NOA so the MAC accepts it within five calendar days after admission/SOC; reconcile final claims to orders, visits, OASIS, coding, and remittance.', evidence: 'Clearinghouse/MAC enrollment and testing; acknowledgments; NOA clock; parallel clean claims and cash.', refLabel: 'CMS Claims Manual Ch. 10' },
  { tier: 'MANDATORY', category: 'Privacy', title: 'HIPAA Privacy, Security + Breach', body: 'Risk analysis, safeguards, minimum necessary, patient rights, workforce/vendor controls, incident assessment, breach notification, contingency plans, audit/integrity/authentication, transmission security, six-year retention.', evidence: 'SRA; MFA; RBAC/ABAC; immutable audit; incident and restore exercises; approved BA register.', refLabel: 'HHS Security Rule' },
  { tier: 'MANDATORY', category: 'California', title: 'CMIA + exact EHR change history', body: 'Civil Code §56.101 requires the EHR/EMR to automatically record and preserve each change or deletion, the actor, access date/time, and exact change. Implement authorization, purpose, disclosure, and break-glass controls.', evidence: 'Append-only clinical history; access/disclosure ledger; purpose/authority; reportable audit.', refLabel: 'California §56.101' },
  { tier: 'MANDATORY', category: 'Records', title: 'Signature, access, retention + legal hold', body: 'Use verified signer identity, role, intent, version/hash, time zone, tamper evidence, amendments — never a pasted image alone. Federal HHA records ≥5 years, California HHA adult records ≥7, Medi-Cal generally 10, HIPAA compliance documents 6.', evidence: 'Exportable signature report; hold override; disposition approval; patient copy workflows.', refLabel: 'CMS §484.110' },
  { tier: 'MANDATORY', category: 'Incident', title: 'Parallel breach-notification clocks', body: 'Do not rely on HIPAA’s outer 60-day clock alone. Orchestrate federal, California HHA-specific CDPH/patient notice, general California consumer/Attorney General, contract, insurer, and law-enforcement delay requirements.', evidence: 'Detection timestamp; risk assessment; jurisdiction clocks; approvals; notice and delivery evidence.', refLabel: 'California HSC §1280.15' },
  { tier: 'MANDATORY', category: 'Exchange', title: 'Cures Act information blocking + EHI access', body: 'Provider-actor duties can apply even without ONC-certified technology. Fulfill full designated-record-set EHI access/exchange/use, preserve provenance, document exceptions, avoid improper technical or contractual barriers.', evidence: 'Request SLA; authority; fee/format rules; computable and readable export; exception record.', refLabel: 'ASTP/ONC guidance' },
  { tier: 'MANDATORY', category: 'Accessibility', title: 'Accessible digital care + nondiscrimination', body: 'Meet WCAG 2.1 AA for covered public/patient web and mobile content; maintain effective communication, auxiliary aids, language/accommodation flags, accessible PDFs, and bias mitigation for patient-care decision support.', evidence: 'Keyboard, screen-reader, contrast, reflow, captions, PDFs, independent audit.', refLabel: 'HHS 2026 deadline update' },
  { tier: 'CONDITIONAL', category: 'Medi-Cal', title: 'California Electronic Visit Verification', body: 'For impacted Medicaid-funded in-home PCS/HHCS, capture service, recipient, date, location, worker, and start/end time. Use CalEVV or complete Alternate EVV testing/onboarding; apply official exclusions instead of forcing EVV onto every Medicare visit.', evidence: 'Trigger: payer, provider/service code, setting, in-home status, applicable exclusion.', refLabel: 'DHCS EVV' },
  { tier: 'CONDITIONAL', category: 'Sensitive data', title: '42 CFR Part 2', body: 'If Care Indeed is a Part 2 program or receives protected Part 2 records, support consent and revocation, segmentation, disclosure accounting/restrictions, legal-proceeding blocks, redisclosure controls, NPP language, and breach workflows.', evidence: 'Trigger: program status, record provenance, consent, requested purpose, legal context.', refLabel: 'HHS Part 2' },
  { tier: 'CONDITIONAL', category: 'Prescribing', title: 'eRx / EPCS', body: 'If authorized prescribers prescribe in this EHR, California eRx and federal standards apply. EPCS adds identity proofing, access control, two-factor signing, tamper-protected audit, crypto, and qualified third-party audit/certification. Integrate a compliant rail rather than self-build.', evidence: 'Trigger: prescriber function and controlled-substance scope.', refLabel: '21 CFR Part 1311' },
  { tier: 'CONDITIONAL', category: 'Clinical AI', title: 'FDA CDS / medical-device analysis', body: 'Classify each intended function. Administrative drafting differs from software intended to diagnose, treat, or drive care; some transparent HCP-only CDS may be non-device, while patient-facing, opaque, or time-critical functions can remain device software.', evidence: 'Trigger: intended use, user, independent-review basis, patient risk, reliance and time criticality.', refLabel: 'FDA 2026 CDS guidance' },
  { tier: 'CONDITIONAL', category: 'California AI', title: 'AI patient communication', body: 'AB 3030 can require a prominent GenAI disclosure and human-contact instructions for specified licensed settings, with a licensed-human-review exception. Have counsel confirm scope and adopt disclosure/review as a design baseline.', evidence: 'Trigger: entity definition, channel, patient clinical communication, licensed review.', refLabel: 'California HSC §1339.75' },
  { tier: 'ROADMAP', category: '2028 roadmap', title: 'Electronic claims attachments', body: 'A 2026 final rule adopted X12 275/277, HL7 C-CDA, LOINC, and verifiable electronic-signature standards with a May 26, 2028 compliance date. Not a 2026 launch blocker; design documents, signatures, and APIs for it now.', evidence: 'Attachment schema, provenance, verifiable signature, transaction adapter and future conformance tests.', refLabel: 'CMS final rule' },
]

export const ASSURANCE_TIERS = [
  { tier: 'FOUNDATIONAL · REQUIRED', title: 'Compliance evidence', items: ['HIPAA/CMIA risk analysis', 'control implementation evidence', 'clinical and billing validation', 'penetration/accessibility testing', 'restore and downtime exercises'], note: 'There is no HHS “HIPAA-certified EHR” seal.' },
  { tier: 'STRATEGIC · RECOMMENDED', title: 'ONC-grade design', items: ['FHIR R4 + US Core', 'USCDI-aligned canonical model', 'single-patient + population export', 'information-blocking workflows', 'conformance + contract tests'], note: 'Design for it now; certify only for a concrete value case.' },
  { tier: 'OPTIONAL · MARKET-DRIVEN', title: 'Independent assurance', items: ['SOC 2 Type I, then Type II', 'HITRUST e1/i1/r2', 'ISO 27001 / 27701', 'ONC modular/full certification', 'NIST CSF / SP 800-66 mapping'], note: 'Use assurance to meet a risk, partner, insurer, or market objective — not for a badge.' },
]

export const ACHC_NOTE =
  'ACHC accredits the agency, not the EHR system. The platform should make survey evidence easy to produce, but software does not inherit Care Indeed’s Medicare certification or ACHC accreditation. Scope-specific validations can still be mandatory: CMS OASIS file acceptance, payer testing, Alternate EVV, EPCS, or FDA authorization where applicable.'

export const REQUIREMENTS_AUTHORITY_NOTE =
  'This investment chapter is summarized for board reading. The business plan’s requirements page owns the full Epic-informed operating model, Medplum/FHIR-native architecture, 170 planning-level statements across 27 domains, 104 target pageviews, 192 named components and elements, the 349-form reconciliation gate, workflow traceability, and nine evidence-based authorization gates.'

/* ---------- 09 BAA & shared-responsibility ---------- */

export const BAA_INTRO =
  'A BAA creates real vendor duties. It is not cyber insurance, universal indemnity, “HIPAA certification,” or a transfer of Care Indeed’s own obligations. A BAA can require safeguards, restricted PHI use, subcontractor flow-down, breach reporting, and help with patient rights. Financial protection after an incident still depends on the executed BAA, MSA, indemnities, liability caps, insurance, causation, and law.'

export const BAA_COLUMNS = [
  { title: 'Business associate duties', items: ['permitted-use boundaries', 'required safeguards', 'subcontractor assurances', 'incident/breach reporting', 'return or destruction where feasible', 'direct liability for specified violations'] },
  { title: 'Care Indeed duties remain', items: ['enterprise risk analysis', 'workforce access + minimum necessary', 'patient rights + notices', 'incident decisions + notification', 'vendor governance + cure/termination', 'training, devices + operations'] },
  { title: 'Ownership adds responsibility', items: ['secure software lifecycle', 'patch, vulnerability + release operations', 'clinical safety + regulatory monitoring', '24/7 reliability + downtime', 'backup, restore + disaster recovery', 'AI evaluation + kill switch'] },
] as const

export const BAA_CHANGE_NOTE =
  'What ownership changes: Care Indeed gains application-level control and reduces one EHR dependency. Cloud, model, transcription, clearinghouse, messaging, backup, support, and integration providers handling ePHI may still require BAAs.'

export const BAA_LEGAL_NOTE =
  'What legal review must establish: review the executed WellSky MSA, BAA, order forms, amendments, insurance, indemnities, liability caps, incident duties, data/AI rights, interface terms, and termination export. Public WellSky templates illustrate common vendor terms; they are not proof of Care Indeed’s current terms — the executed Care Indeed agreements control.'

/* ---------- 10 Governed AI strategy ---------- */

export const AI_INTRO =
  'AI drafts. Rules validate. Clinicians decide. WellSky also markets AI. The durable differentiator is agency-specific governance against Care Indeed’s own data, policies, workflows, and measured outcomes.'

export const AI_PIPELINE = [
  { num: '01', title: 'Source-grounded context', body: 'record, order, policy, authorized data' },
  { num: '02', title: 'Assistive generation', body: 'extract, reconcile, draft, summarize' },
  { num: '03', title: 'Deterministic validation', body: 'required fields, edits, conflicts' },
  { num: '04', title: 'Human review + signature', body: 'correct, attest, accept responsibility' },
]

export const AI_COLUMNS = [
  { title: 'Good first uses', tone: 'good', items: ['referral extraction with source links', 'medication-list comparison', 'draft narrative from captured facts', 'missing evidence/conflict detection', 'policy retrieval with citations', 'QAPI signal summarization'] },
  { title: 'Never autonomous', tone: 'bad', items: ['fabricate observations', 'select OASIS answers without confirmation', 'sign notes, orders, or plans', 'submit OASIS, claims, or disclosures', 'make unsupervised care decisions', 'silently change the legal record'] },
  { title: 'Measure before scale', tone: 'neutral', items: ['correction and omission rates', 'acceptance and override patterns', 'time saved by workflow', 'subgroup safety/performance', 'downstream OASIS/claim effect', 'model, prompt, source and reviewer lineage'] },
] as const

/* ---------- 11 Strategic alternatives ---------- */

export const ALTERNATIVES_INTRO =
  'WellSky Home Health — formerly Kinnser — is mature. The case for ownership is structural control and workflow fit, not a claim that WellSky has no capabilities, integrations, or AI.'

export const ALTERNATIVES = [
  { tag: 'A · STATUS QUO', title: 'Renew + optimize WellSky', tone: 'neutral', body: 'Fastest and lowest transition risk; continued roadmap, interface, contract, and recurring-cost dependency.', items: ['mature production operations', 'vendor manages system-rule updates', 'limited code/release control', 'exit readiness stays contract-dependent'] },
  { tag: 'B · RECOMMENDED', title: 'Governed hybrid transition', tone: 'good', body: 'Build an owned data, evidence, workflow, and AI plane while WellSky remains the legal/claims record until gates pass.', items: ['progressive control + learning', 'clinical shadow validation', 'explicit rollback path', 'temporary duplicate operating cost'] },
  { tag: 'C · NOT RECOMMENDED', title: 'Big-bang replacement', tone: 'bad', body: 'Maximum theoretical control; unacceptable near-term concentration of clinical, billing, migration, and continuity risk.', items: ['largest up-front scope', 'slowest safe time to value', 'highest revenue interruption risk', 'no production fallback'] },
] as const

export const ALTERNATIVES_NOTE =
  'Care Indeed does not control WellSky’s source code, system roadmap, release timing, interface design, or commercial terms for requested enhancements and integrations. No reliable public Home Health price schedule was found; use Care Indeed’s invoices and contracts, not third-party “starting prices.”'

/* ---------- 12 Business model & value realization ---------- */

export const BENEFITS_INTRO =
  'The base case treats the EHR as an internal operating platform. It creates value only when a proven workflow changes a measurable cost, capacity, cash, quality, risk, or experience outcome and the old cost is actually retired.'

export const VALUE_POOLS = [
  { num: '01', title: 'Avoided and retired cost', body: 'Vendor subscriptions and modules, interface fees, duplicate tools, manual reconciliation, preventable support effort, paper and storage, and external services — counted only when contracts or work truly end.' },
  { num: '02', title: 'Operating and revenue lift', body: 'Faster referral decisions, greater accepted capacity, less after-hours charting, fewer returned notes, cleaner claims, lower avoidable denials, shorter DSO, and better authorization utilization — measured against a baseline.' },
  { num: '03', title: 'Strategic option value', body: 'Faster agency-specific change, controlled data and exports, stronger integration leverage, reusable evidence, and governed AI. External licensing is excluded until a separate market, support, liability, and certification case is approved.' },
]

export const VALUE_FORMULA = 'Verified status-quo cost + Measured workflow value − Build, transition, run and risk cost'

export const BENEFITS_RULE =
  'Benefits realization rule: every claimed benefit needs a named owner, baseline, formula, data source, target, observation window, attribution rule, Finance approval, and proof that it is not counted elsewhere.'

/* ---------- 13 Marketing, sales & adoption ---------- */

export const ADOPTION_INTRO =
  'For this internal platform, the traditional marketing-and-sales chapter becomes stakeholder discovery, system positioning, training, adoption, support, and evidence-based expansion. Compliance alone does not create use.'

export const STAKEHOLDER_PROMISES = [
  { group: 'Field clinicians', promise: 'Less duplicate entry, reliable offline work, visible sources, fewer avoidable returns, and safer handoffs.' },
  { group: 'Intake · QA · billing', promise: 'Shared queues, explicit exceptions, fewer reconciliations, traceable changes, and faster resolution.' },
  { group: 'Leadership · QAPI · compliance', promise: 'Versioned rules, trustworthy measures, survey-ready evidence, and accountable release decisions.' },
  { group: 'Patients · physicians · partners', promise: 'Accessible communication, clear status, timely orders, usable records, and consent-aware exchange.' },
]

export const ADOPTION_STEPS = [
  { num: '01', title: 'Co-design the real workflow', body: 'Shadow users, map failure demand, prototype with synthetic data, test field connectivity and accessibility, and publish what will not change.' },
  { num: '02', title: 'Train by role and scenario', body: 'Use sandbox cases, competency checks, downtime drills, job aids, office hours, and super users — not a single launch webinar.' },
  { num: '03', title: 'Pilot a bounded cohort', body: 'Choose explicit patients, disciplines, locations, payers, authority boundaries, support coverage, safety monitors, and rollback criteria.' },
  { num: '04', title: 'Earn expansion', body: 'Scale only when task success, documentation burden, error, safety, claims, support, trust, and adoption thresholds remain stable.' },
]

export const COMMERCIALIZATION_NOTE =
  'Commercialization is an option — not a forecast. Selling the platform to other agencies would create a different company: customer acquisition, implementation, support, uptime commitments, certifications, system liability, multitenancy, release compatibility, and capital needs require a separate plan.'

/* ---------- 14 Funding request & use of funds ---------- */

export const FUNDING_INTRO =
  'The immediate request is a capped 90-day diligence and secure-foundation design envelope. A full program amount cannot be responsibly stated until actual WellSky economics, data-export quality, staffing, security scope, vendor bids, migration complexity, contingency, and downside exposure are verified.'

export const FUNDING_AUTHORIZATION =
  'Phase 0 only: contracts and data rights, financial baseline, workflow measurement, architecture, security and privacy analysis, export proof, clinical-safety governance, implementation plan, and fixed decision gates. Amount: management-prepared cap, approved by the Board after Finance review.'

export const USE_OF_FUNDS = [
  { pct: 45, title: 'Systems + engineering', body: 'Target architecture, clinical core, mobile/offline, system design, quality engineering, platform operations, and delivery.' },
  { pct: 15, title: 'Clinical + compliance', body: 'Workflow observation, OASIS, coding, clinical-safety hazards, policy traceability, validation, and survey readiness.' },
  { pct: 12, title: 'Data + integration', body: 'Exports, canonical model, identity matching, adapters, clearinghouse/CMS/EVV proof, migration, and reconciliation.' },
  { pct: 10, title: 'Security + assurance', body: 'Risk analysis, threat model, identity, logging, incident/recovery design, penetration testing, and independent review.' },
  { pct: 8, title: 'Change + support', body: 'Co-design, training, competency, super users, pilot coverage, documentation, accessibility, and support readiness.' },
  { pct: 10, title: 'Contingency', body: 'Board-controlled reserve for validated uncertainty; not available to conceal scope growth or missed acceptance criteria.' },
]

export const FUNDING_GATES = [
  { tag: 'GATE A · 90 DAYS', body: 'Authorize secure foundation only if export, economics, staffing and risk evidence remain credible.' },
  { tag: 'GATE B · FOUNDATION', body: 'Authorize workflow pilots only after architecture, access, audit, restore and independent-review evidence.' },
  { tag: 'GATES C–E · PILOT TO CUTOVER', body: 'Release capital by cohort/module only after safety, adoption, OASIS, revenue, security and continuity acceptance.' },
]

export const FUNDING_SOURCE_NOTE =
  'The base plan assumes internally authorized investment from Care Indeed Home Health Care, Inc. No debt, outside equity, grant, tax credit, or vendor-financing assumption is included. Finance should evaluate those options only after the entity-level forecast and restrictions are known.'

/* ---------- 15 Financial plan & five-year projections ---------- */

export const FINANCIALS_INTRO =
  'No actual WellSky spend, census, payer mix, burden, denial, DSO, implementation bid, or owned-team cost was supplied. The calculator is intentionally empty so the Board sees evidence — not invented savings.'

export const SCENARIO_INPUTS = [
  'Annual vendor ecosystem — core + modules + interfaces + services ($)',
  'Annual workaround burden — rekeying + manual QA + disconnected tools ($)',
  'One-time build + transition — discovery through validated migration ($)',
  'Annual owned run cost — team + cloud + vendors + assurance ($)',
  'Measured annual added benefit — claim yield + capacity + consolidation ($)',
  'Vendor escalation from contract / renewals (%)',
  'Parallel-run years — incumbent remains active',
  'Analysis horizon — board-selected years',
  'Discount rate — Finance assumption (%)',
]

export const SCENARIO_LOGIC =
  'Logic: status quo = vendor + workaround with escalation. Owned path = one-time program + permanent run cost + incumbent/workaround during parallel years. Added benefit begins in year 2. Taxes, depreciation, financing, contingency, risk losses, working capital, terminal value, and resale revenue are excluded.'

export const FIVE_YEAR_BRIDGE = [
  { period: 'Year 0 · investment' },
  { period: 'Year 1' },
  { period: 'Year 2' },
  { period: 'Year 3' },
  { period: 'Year 4' },
  { period: 'Year 5' },
]

export const YEAR_PLAN = [
  { period: 'Phase 0 / Year 0', profile: 'Diligence, architecture, export proof, risk analysis, baseline measurement, staffing and Board gates.', benefits: 'None. Do not treat discovery activity as a realized saving.', evidence: 'Executed contracts, invoices, export sample, measured burden, scoped estimates and downside/base/upside model.' },
  { period: 'Year 1', profile: 'Secure foundation, canonical identity/data, audit/evidence plane, adjacent workflows and WellSky coexistence.', benefits: 'Only measured adjacent-workflow gains; no incumbent retirement.', evidence: 'Access, audit, restore, reconciliation, usability, security and support evidence.' },
  { period: 'Year 2', profile: 'Clinical/mobile/OASIS pilot, duplicated support and continued incumbent fees.', benefits: 'Pilot-cohort benefits after Finance-approved observation; still no blanket vendor-cost retirement.', evidence: 'Clinical-safety review, CMS OASIS submission loop, field performance, adoption and rollback proof.' },
  { period: 'Year 3', profile: 'Controlled production cohorts, revenue-cycle parallel run, migration and independent validation.', benefits: 'Verified cohort value and only those vendor/module costs contractually removed.', evidence: 'Clean claims, cash reconciliation, migration completeness, DR, pen test and governing-body authorization.' },
  { period: 'Year 4', profile: 'Module retirement, archive/retention controls, operating-team stabilization and optimization.', benefits: 'Steady-state value where attribution, capacity, cost removal and quality remain demonstrable.', evidence: 'Benefit-owner attestations, Finance validation, service levels, regulatory currency and residual-risk acceptance.' },
  { period: 'Year 5', profile: 'Permanent system run rate, lifecycle renewal and post-investment review.', benefits: 'Audited realized benefit only; external commercialization remains excluded.', evidence: 'Post-implementation review, five-year TCO variance, benefit sustainability and next-generation roadmap.' },
]

export const MODEL_INTEGRITY_RULES =
  'Collect 36 months of invoices and renewal notices. Measure after-hours charting, rekeying, returns, clean claims, denials, DSO, downtime, support and change backlog. Fund permanent system ownership. Never count one clinician hour as both payroll savings and new revenue; retire vendor cost only when a module is decommissioned; do not book “reduced liability” as cash.'

export const INVESTMENT_APPROVAL_STANDARD =
  'Finance should issue separate downside, base, and upside cases; quantify uncertainty and contingency; document estimate sources; reconcile actuals to the baseline; and run an independent estimate review before material capital release.'

/* ---------- 16 Implementation roadmap & decision gates ---------- */

export const ROADMAP_INTRO =
  'Planning range: roughly 18–24 months to a controlled production cohort, subject to discovery. Full migration may take longer. This is a gate framework — not a promise.'

export const ROADMAP_PHASES = [
  { num: '0', window: '0–90 days', title: 'Diligence + decision', items: ['contracts, invoices, data rights', 'workflow + metric baseline', 'system boundary + risk analysis', 'architecture + staffing'], gate: 'GATE A · verified economics + export proof' },
  { num: '1', window: 'Months 3–6', title: 'Secure foundation', items: ['enterprise cloud + BAA', 'SSO/MFA, RBAC/ABAC, audit', 'canonical patient/episode IDs', 'integration + evidence plane'], gate: 'GATE B · architecture + restore proof' },
  { num: '2', window: 'Months 6–12', title: 'Adjacent flows + shadow', items: ['intake, auth, orders tracking', 'QAPI/evidence integration', 'mobile/offline pilot', 'AI in synthetic/shadow mode'], gate: 'GATE C · safety + reconciliation' },
  { num: '3', window: 'Months 12–18', title: 'Clinical + OASIS pilot', items: ['record, POC, visits, E2', 'CMS OASIS submission test loop', 'limited clinician/patient cohort', 'incumbent legal fallback'], gate: 'GATE D · independent clinical/compliance review' },
  { num: '4', window: 'Months 18–24+', title: 'Revenue + cutover', items: ['parallel claims/remittance', 'migration reconciliation', 'downtime + rollback rehearsal', 'module-by-module retirement'], gate: 'GATE E · revenue, security, DR + Board approval' },
]

export const FIRST_90_DAYS = [
  { window: 'Days 0–30', title: 'Prove the baseline', items: ['Collect 36 months of WellSky spend and executed contracts.', 'Demand complete patient/episode/document/audit export and interface matrix.', 'Baseline clinician burden, rework, claims, denials, DSO and downtime.', 'Confirm entity, payer scope, accreditation and data-controller roles.'] },
  { window: 'Days 31–60', title: 'Define the safe systems', items: ['Name executive, systems, clinical safety, privacy, security, billing and regulatory owners.', 'Approve canonical data and system-of-record boundaries.', 'Select two adjacent workflows and acceptance metrics.', 'Complete target architecture, threat model, AI register and build/buy choices.'] },
  { window: 'Days 61–90', title: 'Return for a gate', items: ['Present downside/base/upside NPV with verified inputs.', 'Demonstrate a no-PHI evidence-plane prototype with immutable audit.', 'Approve staffing, capped Phase 1, contingency, stop criteria and validators.', 'Negotiate WellSky renewal/exit terms preserving runway and data rights.'] },
]

export const PROPOSED_RESOLUTION =
  'Authorize Phase 0 diligence and a capped secure-foundation phase. Management will return for each gate with verified economics, safety evidence, regulatory validation, operating readiness, and rollback. No WellSky module will be retired merely because replacement code exists.'

/* ---------- 17 Organization, management & governance ---------- */

export const ORGANIZATION_INTRO =
  'Discovery should refine an indicative peak of 11–15 blended FTE plus specialists. Named clinical, security, privacy, billing, regulatory, and systems owners matter more than the estimate.'

export const GOVERNANCE_BODIES = [
  { title: 'Governing body', sub: 'Risk and capital authority', body: 'Approves phase funding, system-of-record changes, residual clinical/compliance/cyber risk, major vendor exits, and final production authorization.' },
  { title: 'Executive steering', sub: 'Value and operating decisions', body: 'CEO-sponsored forum with clinical, operations, finance, compliance, privacy, security, billing, systems, and technology accountability.' },
  { title: 'Clinical safety + compliance', sub: 'Independent release veto', body: 'Owns the hazard log, OASIS/policy currency, clinical acceptance, privacy questions, survey evidence, and stop-work recommendations.' },
  { title: 'Systems + technology', sub: 'Permanent delivery ownership', body: 'Runs discovery, architecture, engineering, SRE, data, AI governance, quality, change control, releases, support, and lifecycle cost.' },
]

export const ORG_ROLES = [
  { title: 'Executive', sub: 'Sponsor + systems leader', body: 'Investment, prioritization, value, transition, Board reporting.' },
  { title: 'Clinical', sub: 'Clinical informatics RN + DON SMEs', body: 'Safety, workflow, documentation, adoption, acceptance.' },
  { title: 'Quality', sub: 'OASIS, coding + QAPI experts', body: 'Current rules, payment, validation, survey evidence.' },
  { title: 'Engineering', sub: 'Lead + 3–5 engineers', body: 'Core services, mobile/offline, integrations, tests.' },
  { title: 'Data / AI', sub: 'Data + AI engineering', body: 'Canonical data, metrics, lineage, model evaluation.' },
  { title: 'Trust', sub: 'Privacy, security + SRE', body: 'Risk, access, monitoring, incident, release, recovery.' },
  { title: 'Experience', sub: 'UX, accessibility + training', body: 'Field usability, patient access, WCAG, change support.' },
  { title: 'Independent', sub: 'External validators', body: 'Pen test, legal, accessibility, clinical safety, survey readiness.' },
]

export const GOVERNANCE_CADENCE = [
  { cadence: 'Daily', body: 'Safety, availability, interface, security and support exceptions.' },
  { cadence: 'Weekly', body: 'Systems outcomes, defects, reconciliation, delivery and adoption.' },
  { cadence: 'Monthly', body: 'Finance, risk register, benefits, compliance and vendor performance.' },
  { cadence: 'Quarterly', body: 'QAPI, Board gate, portfolio value, assurance and roadmap review.' },
  { cadence: 'Annually', body: 'Risk analysis, DR exercise, policy/rule review and investment reset.' },
]

/* ---------- 18 Performance plan & KPIs ---------- */

export const KPI_INTRO =
  'Targets must be set only after a verified baseline. Every metric requires a named owner, precise numerator and denominator, source system, reporting cadence, threshold, drill-down, and response when performance deteriorates.'

export const KPI_GROUPS = [
  { title: 'Clinical + quality', sub: 'Safer, more complete care', items: ['documentation completeness by next visit / policy clock', 'OASIS correction, rejection and late-submission rates', 'medication and order discrepancy closure time', 'hospitalization, falls, infection and other QAPI outcomes', 'clinical hazard and near-miss rate by severity'] },
  { title: 'Financial + operating', sub: 'Reliable cash and capacity', items: ['referral decision and start-of-care cycle time', 'clean-claim rate, denials, DSO and unbilled aging', 'authorization and visit utilization variance', 'after-hours charting, rekeying and returned-note burden', 'retired vendor/tool cost versus owned run rate'] },
  { title: 'Experience + adoption', sub: 'Usable in the field', items: ['critical-task completion and error rate', 'offline sync success and time to recovery', 'role competency and active-use rate', 'support demand, resolution time and repeat issues', 'patient, clinician and partner experience signals'] },
  { title: 'Trust + delivery', sub: 'Controlled change', items: ['availability, latency, interface success and RTO/RPO', 'privileged access review and audit completeness', 'vulnerability, incident and restore-test closure', 'release success, escaped defects and rollback rate', 'AI correction, omission, drift and disable readiness'] },
]

export const BALANCED_SCORECARD_RULE =
  'No phase may be declared successful on cost alone. A financial gain that worsens clinical safety, record integrity, claim accuracy, privacy, field usability, access, or continuity is a failed release.'

/* ---------- 19 Risk analysis & acceptance ---------- */

export const RISK_INTRO =
  'The program succeeds by stopping when evidence is weak. Each risk needs an owner, leading indicator, tested mitigation, residual-risk decision, and stop-work threshold.'

export interface RiskRow2 { risk: string; level: 'CRITICAL' | 'HIGH'; evidence: string }

export const RISK_TABLE: RiskRow2[] = [
  { risk: 'Clinical safety', level: 'CRITICAL', evidence: 'Hazard log, clinician tests, source display, no autonomous action, rollback and Clinical Safety Officer sign-off.' },
  { risk: 'OASIS / payment', level: 'CRITICAL', evidence: 'Effective-dated E2 engine, CMS validation, accepted submission response, correction history, and parallel reconciliation.' },
  { risk: 'Revenue interruption', level: 'CRITICAL', evidence: 'Parallel NOA/claim/ERA, payer acknowledgments, cash reconciliation and active incumbent rollback.' },
  { risk: 'Security / privacy', level: 'CRITICAL', evidence: 'SRA, threat model, default deny, MFA, WORM logs, external pen test, incident exercise, BA register.' },
  { risk: 'Availability / field', level: 'HIGH', evidence: 'Offline tests, RTO/RPO, restore evidence, downtime kits, 24/7 escalation and failback rehearsal.' },
  { risk: 'Data migration', level: 'HIGH', evidence: 'Dry runs, record/document counts, hashes, sampling, merge controls, clinical/finance reconciliation.' },
  { risk: 'Regulatory drift', level: 'HIGH', evidence: 'Named owner, primary-source register, effective-dated release calendar and traceable tests.' },
  { risk: 'Scope / cost', level: 'HIGH', evidence: 'Capped phases, build/buy principles, value scorecard, kill criteria and approved contingency.' },
  { risk: 'Adoption / talent', level: 'HIGH', evidence: 'Clinician co-design, usability benchmark, super users, documentation, rotation and support readiness.' },
  { risk: 'AI error / drift', level: 'HIGH', evidence: 'Use-case approval, representative evaluation, correction/omission monitoring, provenance and instant disable.' },
]

export const STOP_RULE_CONDITIONS = [
  'enterprise account + signed BAAs',
  'HIPAA/CMIA risk analysis approved',
  'minimum necessary tested',
  'immutable audit verified',
  'restore independently witnessed',
  'external pen test closed',
  'accessibility assessment passed',
  'OASIS file accepted',
  'claims run reconciled',
  'downtime/rollback rehearsed',
  'clinical safety sign-off',
  'governing body authorizes scope',
]

export const STOP_RULE_HEADLINE = 'No unrestricted live PHI or production cutover until:'

/* ---------- 20 Appendix ---------- */

export const APPENDIX_INTRO =
  'Current as of July 29, 2026. Regulations, CMS specifications, payer rules, market conditions, and vendor terms change. Counsel, clinical leadership, accreditation experts, security professionals, and Finance must validate the operating design.'

export const APPENDIX_SECTIONS = [
  { title: '01 · Business planning, market & economics', items: ['U.S. SBA nine common traditional business-plan sections', 'U.S. SBA market research and competitive analysis', 'SCORE traditional business-plan and operating-plan prompts', 'SCORE SWOT analysis framework', 'MedPAC March 2026 home-health access, use, spending and margin analysis', 'CMS CY 2026 Home Health final rule financial impact', 'CMS CY 2027 proposed Home Health rule; not final economics', 'U.S. Census 2024 older-adult population growth', 'U.S. BLS home-health and personal-care aide employment outlook', 'ASTP/ONC electronic exchange among LTPAC providers', 'U.S. GAO Cost Estimating and Assessment Guide'] },
  { title: '02 · Care Indeed entity + incumbent', items: ['California HCAI Care Indeed Home Health Care, Inc. facility record', 'Care Indeed public home-health services; brand context only', 'WellSky Home Health system overview', 'WellSky public 2022 MSA; not executed Care Indeed terms', 'WellSky public 2025 BAA; not executed Care Indeed terms', 'WellSky public SkySense AI materials'] },
  { title: '03 · Competitive category research', items: ['WellSky Home Health official system positioning', 'Homecare Homebase official system positioning', 'Axxess Home Health official system positioning', 'MatrixCare official system positioning', 'Netsmart myUnity official system positioning', 'AlayaCare official system positioning'] },
  { title: '04 · CMS home health + OASIS', items: ['eCFR 42 CFR Part 484 Home Health Services', 'eCFR §484.55 comprehensive assessment', 'eCFR §484.60 care planning and coordination', 'eCFR §484.65 QAPI', 'eCFR §484.110 clinical records', 'CMS OASIS-E2 manuals', 'CMS OASIS data specifications', 'CMS / QTSO iQIES manual-entry discontinuation', 'CMS 837I institutional claim guide', 'CMS home-health coding and billing'] },
  { title: '05 · Privacy, California + assurance', items: ['HHS OCR HIPAA Security Rule', 'HHS OCR sample BAA provisions', 'HHS OCR misleading HIPAA certification claims', 'California Confidentiality of Medical Information Act', 'California DOJ breach reporting', 'California DHCS Electronic Visit Verification', 'HHS OCR 42 CFR Part 2', 'NIST SP 800-66 Rev. 2', 'AICPA SOC assurance overview', 'HITRUST assessment and certification options'] },
  { title: '06 · Interoperability, AI + accessibility', items: ['ASTP/ONC voluntary certification program', 'ASTP/ONC information blocking', 'ASTP/ONC standardized API test method', 'ASTP/ONC EHI export test method', 'FDA 2026 CDS guidance', 'eCFR / DEA electronic controlled prescriptions', 'HHS OCR 2026 accessibility deadline extension', 'California GenAI patient communication'] },
  { title: '07 · Architecture, cloud & control patterns', items: ['AWS HIPAA-eligible services and BAA scope', 'AWS S3 Object Lock retention and legal-hold controls', 'AWS Prescriptive Guidance transactional outbox pattern', 'NIST SP 800-53 Rev. 5 security and privacy controls', 'NIST contingency planning and recovery guidance', 'HL7 FHIR interoperability standard'] },
]

export const APPENDIX_SUPPLIED_ARTIFACTS =
  'Supplied internal artifacts reviewed — Architecture: README; Integration Map; Workflow and Events; Print Architecture; Data Model; AWS Phase 1 plan; Master System Documentation. Clinical/compliance: All Workflows; All Policies; California ACHC policy/procedure source; generated policy content; Corridor alignment; policy/HH mapping and hardening reports. QAPI: the Q2 2026 quarterly packet, reviewed as synthetic UAT design — not performance evidence. Not supplied for validation: underlying application repository/runtime, production environment, executed contracts, invoices, live metrics, accreditation report, pen test, or operational patient/claim data.'

export const APPENDIX_STILL_REQUIRED = [
  'Corporate and leadership: verified officers, governing-body roster, organization chart, licenses/certifications, service counties, branches, payer enrollments, accreditation scope, insurance, and related-entity allocations.',
  'Commercial baseline: executed WellSky MSA, BAA, SLA, order forms, amendments, interfaces, support history, termination/data-return terms, 36 months of invoices, renewal notices, and the same evidence for adjacent tools.',
  'Operating baseline: census, admissions, payer mix, visits, referrals, acceptance, capacity, clinician time-and-motion, returned notes, authorizations, denials, clean claims, DSO, LUPA, downtime, quality and QAPI measures.',
  'Financial exhibits: Phase 0 cap, staffing rates, vendor bids, cloud forecast, implementation timing, contingency, risk-adjusted downside/base/upside income, cash-flow and balance-sheet effects, benefit formulas, owners, sources, sensitivity, and post-investment-review method.',
  'Technical and assurance exhibits: export sample/profiling, interface matrix, data dictionary, authority register, architecture decision records, threat model, HIPAA/CMIA risk analysis, clinical hazard log, AI use-case register, accessibility plan, test strategy, RTO/RPO, migration/rollback plan, independent validation scope, and signed acceptance matrix.',
  'Decision record: option scorecard for optimize WellSky, alternate packaged EHR, governed hybrid, and full ownership; meeting minutes; conflicts; approvals; conditions; release gates; stop criteria; and residual-risk acceptances.',
]

export const DOCUMENT_FOOTER =
  'Owned EHR Business Plan · Executive and governing-body evaluation · July 28, 2026. Strategic planning material — not legal advice, a compliance determination, a certification, or a production authorization.'
