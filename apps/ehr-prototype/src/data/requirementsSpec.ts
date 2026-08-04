// Canonical content for the Requirements pageview.
//
// TWO SOURCES, and it matters which is which:
//
// (A) Requirement statements, domains, gates, ADRs, architecture, traceability
//     and sources come from Care_Indeed_Home_Health_EHR_Complete_Requirements.html
//     — "Business plan · Requirements addendum · Version 1.1 · July 29, 2026"
//     (extracted to requirements.txt, read in full before authoring this file).
//
// (B) The programme INVENTORY COUNTS (planning tasks, planning buckets, target
//     elements, workflow-step backlog, blocker total) and the BL-0x blocker
//     write-ups come from the requirements *workspace* of the same source app —
//     `app/requirements/requirements-program-data.ts`, `requirements-data.ts`,
//     `requirements-audit-data.ts`, `requirements-pm-model.ts` — and are rendered
//     on its live /requirements page. Several are DERIVED at runtime there
//     (e.g. the 5,350 task total is `planningTasks.length`), so they exist on the
//     rendered page and in the program data but appear as no literal in the
//     addendum HTML. Do not "correct" them by deleting them: they are sourced,
//     just not from source (A). Cite (B) for them, never (A).
//
// This module is presentational-agnostic: plain typed data only. All visual
// design lives in RequirementsScreen.tsx / req.css using the existing
// Care Indeed design system (tokens.css, base.css, src/ui). Nothing here
// reproduces the source document's own visual layout — content only.
//
// The master register in the source names 170 detailed requirement
// statements across 27 domains. Reproducing all 170 verbatim would make
// this file (and the page) unreadable, so REQUIREMENT_REGISTER below is an
// HONEST, LABELED SAMPLE — one or more real, unedited "shall" statements
// per domain, drawn verbatim from the source, with true IDs, domain names,
// and priority. The screen must always state "showing N of 170" and never
// imply the sample is the complete register.

export type ReqPriority = 'MUST' | 'SHOULD' | 'CONDITIONAL'

export interface RegisterDomain {
  num: string
  id: string
  name: string
  description: string
}

export const REGISTER_DOMAINS: RegisterDomain[] = [
  { num: '01', id: 'GOV', name: 'Enterprise governance & master data', description: 'Legal boundary, configuration authority, effective dates, and controlled change.' },
  { num: '02', id: 'IAM', name: 'Identity, access & workforce lifecycle', description: 'Named users, service identities, least privilege, purpose, and rapid revocation.' },
  { num: '03', id: 'PAT', name: 'Patient identity, consent & preferences', description: 'One person, preserved history, lawful representatives, and communication needs.' },
  { num: '04', id: 'REF', name: 'Referral, intake & admission decision', description: 'Source-backed intake, timely decision, eligibility, capacity, and safe handoff to SOC.' },
  { num: '05', id: 'EPI', name: 'Episode, certification & OASIS', description: 'Home-health state, time points, assessment rules, CMS files, and transitions.' },
  { num: '06', id: 'CLN', name: 'Care plan, orders & clinical documentation', description: 'Authorized care, discipline practice, medication safety, and defensible notes.' },
  { num: '07', id: 'SCH', name: 'Workforce eligibility, scheduling & on-call', description: 'Right discipline, credential, frequency, authorization, geography, and continuity.' },
  { num: '08', id: 'FLD', name: 'Field visit, mobile/offline & EVV', description: 'Safe point-of-care work under intermittent connectivity with provable synchronization.' },
  { num: '09', id: 'COR', name: 'Work queues, care coordination & portals', description: 'Closed-loop tasks, secure communication, partner action, and patient/proxy access.' },
  { num: '10', id: 'RCM', name: 'Revenue cycle & payer operations', description: 'Coverage through cash with home-health institutional transactions and clinical separation.' },
  { num: '11', id: 'QAP', name: 'QAPI, compliance & workforce competency', description: 'Signals, investigation, corrective action, effectiveness, policy, and survey evidence.' },
  { num: '12', id: 'DOC', name: 'Forms, documents, signatures & legal evidence', description: 'Deterministic artifacts, verified intent, immutable packages, retention, and disclosure.' },
  { num: '13', id: 'DAT', name: 'Data, analytics, reporting & export', description: 'Separate transactional authority, governed metrics, data quality, portability, and reproducibility.' },
  { num: '14', id: 'FHR', name: 'FHIR platform, terminology & integration', description: 'Medplum-like clinical foundation, controlled extensions, reliable events, and replaceable rails.' },
  { num: '15', id: 'AIG', name: 'Governed artificial intelligence', description: 'Approved intended use, source-grounded proposals, human control, lineage, evaluation, and disable.' },
  { num: '16', id: 'SEC', name: 'Security, reliability & secure delivery', description: 'Dedicated cloud boundary, cryptographic control, observable operations, recovery, and quality gates.' },
  { num: '17', id: 'MIG', name: 'Migration, adoption, support & decommission', description: 'Verified exports, coexistence, training, rollback, archive, and measurable stabilization.' },
  { num: '18', id: 'CON', name: 'Conditional, future & commercialization scope', description: 'Capabilities that become mandatory only when a payer, service, user, contract, or market trigger applies.' },
  { num: '19', id: 'BEN', name: 'Patient rights, beneficiary notices & appeals', description: 'Effective forms, correct trigger and timing, accessible delivery, acknowledgment, refusal, and expedited review.' },
  { num: '20', id: 'EMP', name: 'Emergency preparedness, continuity & field safety', description: 'Patient-specific preparedness, agency command, communications, continuity, exercises, and after-action evidence.' },
  { num: '21', id: 'HQR', name: 'CMS quality reporting & value-based purchasing', description: 'Mandatory HHQRP and expanded HHVBP controls, conditional HHCAHPS details, public reporting, and reproducible reconciliation.' },
  { num: '22', id: 'TPR', name: 'Third-party, BAA & service-provider lifecycle', description: 'Qualification before PHI, contract accountability, subcontractor visibility, monitoring, incident response, and provable exit.' },
  { num: '23', id: 'HHA', name: 'Home-health aide and assistant supervision', description: 'Plan-authorized services, effective-dated supervision clocks, direct observation, in-service education, remediation, and assignment gates.' },
  { num: '24', id: 'UXP', name: 'Experience architecture & prototyping', description: 'Post-story task flows, low- and high-fidelity prototypes, human-factors validation, and design authority before development.' },
  { num: '25', id: 'UIX', name: 'Pageviews, components, elements & states', description: 'Complete route contracts, reusable interface registry, universal states, responsive behavior, accessibility, and role-aware interactions.' },
  { num: '26', id: 'FRM', name: 'Forms, fields, signatures, print & export', description: 'Authoritative field schemas, dynamic behavior, legal signatures, controlled outputs, accessibility, retention, and workflow bindings.' },
  { num: '27', id: 'TRC', name: 'Semantic traceability, source integrity & design verification', description: 'Canonical IDs, step-level workflow coverage, evidence-backed QAPI, executable tests, impact analysis, and development authorization.' },
]

export interface RegisterRow {
  id: string
  domainId: string
  title: string
  text: string
  acceptance: string
  priority: ReqPriority
}

// A genuine, verbatim-drawn sample of the 170 master-register requirements —
// at least one per domain — labeled honestly below as "showing N of 170".
export const REQUIREMENT_REGISTER: RegisterRow[] = [
  { id: 'GOV-001', domainId: 'GOV', title: 'Isolate the licensed legal entity', text: 'The system shall keep Care Indeed Home Health Care, Inc. separate from Care Indeed, Inc. and any future entity in patient, workforce, contract, payer, configuration, access, financial, audit, and analytics contexts.', acceptance: 'Cross-entity negative-access tests; entity-qualified exports; no blended KPI without approved aggregation.', priority: 'MUST' },
  { id: 'GOV-006', domainId: 'GOV', title: 'Reconcile the requirements corpus', text: 'The 166 workflows, policy records, form references, mappings, and licensed policy content shall be inventoried, deduplicated, clinically reviewed, source-controlled, and linked to this register without treating automated "HIGH" mappings as approval.', acceptance: 'Reconciled counts, licensing disposition, canonical source, SME approval, and unresolved-gap register.', priority: 'MUST' },
  { id: 'IAM-001', domainId: 'IAM', title: 'Federate human and machine identity', text: 'Use OIDC/OAuth 2.0 for workforce, patient/proxy, partner, SMART app, service, integration, and automation identities; prohibit shared clinical accounts and unmanaged long-lived credentials.', acceptance: 'Unique subject for every event; token rotation/revocation tests; service-account owner and scope.', priority: 'MUST' },
  { id: 'IAM-005', domainId: 'IAM', title: 'Provide controlled break-glass', text: 'Emergency access shall require a reason, patient and duration scope, visible warning, step-up authentication, automatic expiration, notification, and independent after-the-fact review.', acceptance: 'Tabletop proves grant, use, expiry, alert, review, and inappropriate-access escalation.', priority: 'MUST' },
  { id: 'PAT-001', domainId: 'PAT', title: 'Create a longitudinal patient identity', text: 'Maintain demographics, names, addresses, contacts, identifiers, prior names, sex and gender data as approved, language, race/ethnicity, communication needs, emergency contacts, and status history. Every patient-specific screen, modal, printout, attachment, message, order, and signing action shall persistently show approved confirming identifiers.', acceptance: 'Provenance and effective period on imported or corrected identity data; complete summary export; wrong-patient scenarios fail safely.', priority: 'MUST' },
  { id: 'PAT-002', domainId: 'PAT', title: 'Prevent and safely resolve duplicates', text: 'The MPI shall require sufficient identifying search data and explicit human confirmation for candidate matches; support probabilistic and deterministic matching, duplicate prevention, merge/unmerge, survivor rules, identifier history, and downstream reference repair without data loss.', acceptance: 'Merge/unmerge drill preserves all episodes, documents, audit, claims, and external identifiers; cross-patient charting, ordering, messaging, and attachment tests are blocked.', priority: 'MUST' },
  { id: 'REF-001', domainId: 'REF', title: 'Ingest referrals through governed channels', text: 'Accept portal, API/FHIR, Direct, secure fax, scanned, and authorized manual referrals into one queue with sender, received time, source files, patient match, urgency, service request, and chain of custody.', acceptance: 'Every channel creates the same traceable intake object and preserves the original artifact.', priority: 'MUST' },
  { id: 'REF-004', domainId: 'REF', title: 'Evaluate clinical, payer, geographic, and capacity fit', text: 'Decision support shall assess homebound/skilled need as applicable, ordered disciplines, acuity, safety, service area, staffing/credential capacity, payer eligibility, benefit, authorization, network, and financial exception.', acceptance: 'Acceptance rationale cites current facts; rules flag but do not fabricate clinical judgment.', priority: 'MUST' },
  { id: 'EPI-004', domainId: 'EPI', title: 'Run versioned OASIS-E2 assessment packages', text: 'Select the correct assessment time point and effective package; enforce item applicability, skip logic, data types, consistency edits, required clinical review, completion, lock, correction, inactivation, and attestation history.', acceptance: 'CMS conformance cases, historical package replay, field-level corrections, and no-backdating tests pass.', priority: 'MUST' },
  { id: 'EPI-005', domainId: 'EPI', title: 'Generate and reconcile CMS OASIS submissions', text: 'Generate a software-produced OASIS submission file conforming to current CMS specifications, validate before transmission, submit through the supported CMS pathway, ingest acceptance/rejection reports, correct and resubmit, and reconcile every assessment. Do not recreate the legacy iQIES front-end data-entry software discontinued April 1, 2026.', acceptance: 'Accepted test file, rejection repair, response linkage, transmission clock, and completeness reconciliation.', priority: 'MUST' },
  { id: 'CLN-002', domainId: 'CLN', title: 'Control the complete order lifecycle', text: 'Support written, electronic, and verbal/read-back orders; duplicate warnings; responsible clinician attribution; routing, delivery, signature, countersignature, reminder, escalation, renewal, change, cancellation, receipt confirmation, result linkage, effective time, and claim hold.', acceptance: 'Unresolved, expired, superseded, duplicate, unmatched-result, and late-signed orders are visible and cannot be mistaken for current authority.', priority: 'MUST' },
  { id: 'CLN-004', domainId: 'CLN', title: 'Reconcile medications and allergies', text: 'Maintain sourced medication/allergy history, active list, discrepancy type, high-risk flags, interaction/duplicate checks, prescriber contact, resolution, order linkage, plan update, adverse reaction, and patient education. Display drug, dose, route, frequency, unit, status, and source unambiguously; use governed normalization and TALLman lettering where applicable.', acceptance: 'Imported or AI-extracted medication data remains proposed until authorized human reconciliation; look-alike/sound-alike, unit, duplicate, and dose-selection tests pass.', priority: 'MUST' },
  { id: 'SCH-004', domainId: 'SCH', title: 'Protect authorization and utilization limits', text: 'Reserve and decrement authorized units by payer/service/time window; warn before exhaustion/expiry; place configurable holds; and separate clinical necessity from payment authorization decisions.', acceptance: 'Authorization ledger matches scheduled, completed, canceled, billed, and adjusted services.', priority: 'MUST' },
  { id: 'SCH-006', domainId: 'SCH', title: 'Optimize routes without overriding safety', text: 'Provide day/route view, travel estimates, patient windows, continuity, workload, on-call coverage, emergency reassignment, and field-safety context; optimization may recommend but not bypass qualification or care constraints.', acceptance: 'Dispatcher can explain and override optimization; changes notify affected patients and staff.', priority: 'SHOULD' },
  { id: 'FLD-003', domainId: 'FLD', title: 'Support durable offline capture and replay', text: 'Permit offline note, assessment, medication, wound/photo, signature, supply, communication, and EVV capture through an encrypted outbox with dependency order, retries, idempotency, attachment integrity, and visible unsynced state.', acceptance: 'Airplane-mode and partial-sync tests recover without duplicate, loss, silent completion, or premature downstream action.', priority: 'MUST' },
  { id: 'FLD-005', domainId: 'FLD', title: 'Provide an applicability-driven EVV capability', text: 'The platform shall provide configurable EVV capture and adapter capability. Only services triggered by payer, program, service code, setting, and official inclusion rules shall require patient, worker, service, date, arrival/departure, location or approved method, provenance, attestation, edits, approval, aggregator response, exception, and billing linkage.', acceptance: 'Applicable cohorts pass CalEVV/Alternate EVV onboarding, offline replay, rejection repair, and visit-to-claim reconciliation; non-applicable cohorts are not forced into EVV.', priority: 'MUST' },
  { id: 'COR-001', domainId: 'COR', title: 'Use a universal actionable work-item contract', text: 'Every queue item shall carry patient/episode, source, priority, due time, SLA, owner/backup, permitted action, dependencies, state, escalation, completion evidence, reopen reason, and history.', acceptance: 'Users can act, delegate, escalate, complete, reopen, and audit without navigating a separate report.', priority: 'MUST' },
  { id: 'RCM-003', domainId: 'RCM', title: 'Separate clinical completion from billing release', text: 'Generate charges from signed service facts while a configurable claim-readiness engine evaluates authorization, coverage, OASIS, plan/order signatures, visit documentation, coding, certification, EVV, and payer edits.', acceptance: 'Release/hold reason is explainable, versioned, approved, and cannot alter the underlying clinical record.', priority: 'MUST' },
  { id: 'RCM-004', domainId: 'RCM', title: 'Support home-health grouping, NOA, and institutional claims', text: 'Implement current PDGM/HIPPS and payer logic, admission/payment periods, LUPA and outlier considerations, NOA, revenue lines, occurrence/value/condition codes, institutional 837I, corrections, cancels, and timely-filing clocks.', acceptance: 'Certified test cases and parallel claim comparison match approved grouper/payer outcomes.', priority: 'MUST' },
  { id: 'QAP-004', domainId: 'QAP', title: 'Manage PIP, RCA, CAP, and effectiveness', text: 'Create problem statement, baseline, root cause, countermeasure, owner, deadline, evidence, outcome/guardrail measures, review cadence, extension, closure approval, and sustained-effectiveness check.', acceptance: 'No corrective action closes on task completion alone; a dated effectiveness decision and evidence are required.', priority: 'MUST' },
  { id: 'DOC-005', domainId: 'DOC', title: 'Create retention-locked evidence packages', text: 'Package exact FHIR and document versions, signatures, policy/template/rule versions, workflow decisions, communications, external acknowledgments, and hashes into signed manifests stored under WORM retention and legal hold.', acceptance: 'Package has human-readable and machine-readable export, independent hash verification, hold protection, and controlled disposition.', priority: 'MUST' },
  { id: 'DAT-001', domainId: 'DAT', title: 'Separate clinical authority from analytical copies', text: 'FHIR/domain services shall remain transactional authority; warehouse/lakehouse, search indexes, caches, dashboards, and AI retrieval are permissioned derived views with lineage, visible source and last-updated time, reconciliation, and no direct clinical write-back.', acceptance: 'Stale, offline, or failed derived data is visibly labeled and cannot silently become the legal record.', priority: 'MUST' },
  { id: 'FHR-001', domainId: 'FHR', title: 'Publish a Care Indeed FHIR R4 implementation guide', text: 'Define profiles, required fields, identifiers, invariants, extensions, slicing, terminology bindings, search parameters, operations, examples, versioning, backward compatibility, and conformance tests for every canonical clinical resource.', acceptance: 'Server rejects invalid production writes and reports profile/version-specific issues.', priority: 'MUST' },
  { id: 'FHR-006', domainId: 'FHR', title: 'Operate versioned interoperability adapters', text: 'Support applicable FHIR R4/US Core, SMART, CDS Hooks, C-CDA/Direct, HL7 v2, X12, NCPDP, fax, HIE/QHIN, hospital, lab, pharmacy, DME, EVV, accounting, and WellSky interfaces with mapping, contract tests, monitoring, and reconciliation.', acceptance: 'Every adapter record declares owner, dataset/source authority, direction, trigger, batch/event/on-demand method, consumer, latency/volume, transport/security, schema/US Core/USCDI version and effective date, PHI boundary, SLA, replay, exception queue, test endpoint, and exit plan.', priority: 'MUST' },
  { id: 'AIG-003', domainId: 'AIG', title: 'Keep AI as an explicit proposal', text: 'AI may extract, compare, draft, summarize, flag, or queue; an authorized human must review, edit, accept, and sign. AI shall not independently change the chart, choose OASIS answers, place/sign orders, certify, submit, release claims, or close compliance evidence.', acceptance: 'Technical permissions deny prohibited actions even when prompt or model output requests them.', priority: 'MUST' },
  { id: 'AIG-006', domainId: 'AIG', title: 'Evaluate continuously and fail safely', text: 'Measure correctness, omission, unsupported claims, acceptance/override, subgroup performance, downstream clinical/claim effect, drift, latency, and incidents against go/no-go thresholds; support feature flag, model rollback, and immediate kill switch.', acceptance: 'Prelaunch benchmark, shadow evaluation, live monitoring, disable drill, incident route, and post-change revalidation.', priority: 'MUST' },
  { id: 'SEC-006', domainId: 'SEC', title: 'Meet measurable quality and incident targets', text: 'Set and validate availability, p95 latency, error, sync, accessibility, load, concurrency, recovery, audit completeness, vulnerability, and support targets; run incident, breach, patient-safety, and vendor-failure playbooks with parallel legal clocks.', acceptance: 'Proposed baseline includes 99.9% core availability, ≤15-minute RPO, ≤4-hour RTO, WCAG 2.2 AA, and load at twice verified peak, subject to formal risk approval.', priority: 'MUST' },
  { id: 'MIG-001', domainId: 'MIG', title: 'Prove the WellSky export and contract exit', text: 'Inventory patients, episodes, assessments, visits, notes, orders, plans, medications, documents, claims, remittances, audit, users, configuration, identifiers, attachment formats, APIs, fees, timing, assistance, retention, and deletion obligations.', acceptance: 'Executed contract analysis and representative export open independently with counts and limitations documented.', priority: 'MUST' },
  { id: 'MIG-004', domainId: 'MIG', title: 'Pilot by named cohort with rehearsed rollback', text: 'Specify patients, disciplines, branch, payer, functions, dates, support hours, safety monitors, data authority, issue severity, stop criteria, rollback trigger, communication, and record reconciliation.', acceptance: 'Rollback drill restores operational control without lost note, order, visit, submission, claim, or evidence.', priority: 'MUST' },
  { id: 'CON-001', domainId: 'CON', title: 'Apply EVV only to triggered services', text: 'Activate California or payer EVV rules by program, payer, provider/service code, setting, in-home status, and official exclusion; support CalEVV or approved Alternate EVV onboarding/testing.', acceptance: 'Documented applicability matrix and accepted aggregator test; non-applicable Medicare visits are not falsely forced into EVV.', priority: 'CONDITIONAL' },
  { id: 'CON-002', domainId: 'CON', title: 'Integrate e-prescribing and EPCS if prescribing is enabled', text: 'Use a compliant contracted rail for prescriber identity, formulary/history, routing, cancel/change, controlled-substance identity proofing, two-factor signing, tamper-protected audit, and required third-party certification/audit.', acceptance: 'Approved prescriber scope, California/federal analysis, network certification, EPCS audit, and end-to-end pharmacy tests.', priority: 'CONDITIONAL' },
  { id: 'BEN-004', domainId: 'BEN', title: 'Manage NOMNC, DENC, and expedited review', text: 'Calculate applicable NOMNC delivery deadlines, preserve service-end and appeal-right information, identify the beneficiary or representative, route BFCC-QIO requests, create DENC and record packets, track payer/QIO communications, continue or end services as directed, and retain final determinations.', acceptance: 'Expedited-appeal tabletop meets delivery, record-production, communication, service, and decision clocks without relying on memory.', priority: 'MUST' },
  { id: 'EMP-002', domainId: 'EMP', title: 'Maintain a patient-specific emergency profile', text: 'The comprehensive assessment and plan shall capture emergency priority, functional and clinical dependency, electricity/device/oxygen needs, medications and supplies, mobility/evacuation barriers, caregiver capacity, language/accessibility needs, location, shelter/transport plan, alternate contacts, and patient education.', acceptance: 'Every active patient has a reviewed profile and current emergency instructions; changes propagate to authorized continuity lists and handoff packets.', priority: 'MUST' },
  { id: 'HQR-002', domainId: 'HQR', title: 'Monitor HHQRP data completeness and acceptance', text: 'Reconcile eligible episodes and assessments to CMS submission responses; calculate the applicable quality-assessment completeness threshold; surface missing, late, rejected, corrected, excluded, and unresolved records by deadline and owner.', acceptance: 'Retained numerator/denominator snapshot, CMS responses, exception queue, and final reconciliation agree at patient and aggregate levels.', priority: 'MUST' },
  { id: 'HQR-004', domainId: 'HQR', title: 'Operate HHCAHPS according to current applicability', text: 'When volume and program rules apply, support approved vendor relationship, sampling eligibility/exclusions, patient contact data, language/privacy controls, monthly files, submission, response linkage, suppression, correction, vendor reconciliation, and exemption documentation.', acceptance: 'Current eligibility/exemption determination, approved vendor/testing evidence, and source-to-submission reconciliation.', priority: 'CONDITIONAL' },
  { id: 'TPR-002', domainId: 'TPR', title: 'Block PHI until agreements and eligibility are approved', text: 'No third party may receive or access PHI until the applicable BAA, privacy/security terms, service eligibility, purpose, minimum-necessary data, retention, incident notice, audit, subcontractor, return/destruction, and termination provisions are approved and effective.', acceptance: 'Technical connection and production credential issuance are gated by contract records; expired or missing approval revokes access.', priority: 'MUST' },
  { id: 'HHA-002', domainId: 'HHA', title: 'Schedule supervision for patients receiving skilled care', text: 'For aide services provided while skilled services continue, calculate the current regulation/policy supervisory interval, including required registered-nurse oversight and applicable direct observation, from actual service and supervision facts; create advance work, escalation, and coverage.', acceptance: 'Effective-dated test cases include the skilled-patient 14-day supervision pattern, weekends, hospitalization, missed visits, transfer, supervisor leave, and service restart.', priority: 'MUST' },
  { id: 'HHA-003', domainId: 'HHA', title: 'Schedule supervision when no skilled service is active', text: 'For patients receiving aide services without qualifying skilled visits, calculate current on-site supervisory and direct-observation requirements, including the applicable 60-day and semiannual patterns, responsible RN, patient availability, aide presence condition, and documented exception/escalation.', acceptance: 'Rule-version tests distinguish aide-present and aide-absent visits and prevent clock resets from canceled, incomplete, or wrong-type encounters.', priority: 'MUST' },
  { id: 'UXP-004', domainId: 'UXP', title: 'Prototype the approved experience at high fidelity', text: 'Build interactive high-fidelity prototypes using the canonical Care Indeed EHR design system, realistic synthetic data, complete content, role variants, desktop/tablet/phone/print layouts, keyboard paths, and clinically meaningful alerts.', acceptance: 'Named users complete representative end-to-end work at each required viewport without dead controls, placeholder copy, invented clinical facts, or inaccessible interaction.', priority: 'MUST' },
  { id: 'UIX-001', domainId: 'UIX', title: 'Specify every target pageview', text: 'Maintain the 104-page target inventory as individual contracts covering purpose, personas, stories, route, layout, components, forms, data, actions, role variants, states, responsive behavior, accessibility, analytics, and tests.', acceptance: 'Every page ID is unique, owned, source-linked, prototyped, tested, and traceable; no target route renders an unspecified screen.', priority: 'MUST' },
  { id: 'UIX-004', domainId: 'UIX', title: 'Disposition every universal state', text: 'Specify applicable default, loading, skeleton, empty, partial, success, warning, error, retry, offline, queued, syncing, conflict, stale, unsaved, read-only, denied, locked, blocked, expired, voided, superseded, interrupted, degraded, and recovered behavior.', acceptance: 'State coverage reports show no happy-path-only page, component, form, action, request, or integration.', priority: 'MUST' },
  { id: 'FRM-001', domainId: 'FRM', title: 'Import and reconcile all 349 form sources', text: 'Load the authoritative current form files and register unique semantic ID, title, owner, purpose, status, version, effective dates, source path, policy/workflow use, replacement, and retention classification.', acceptance: '349/349 sources reconcile to the approved index with zero duplicate meaning, orphan reference, missing source, or invented form.', priority: 'MUST' },
  { id: 'FRM-002', domainId: 'FRM', title: 'Specify every section and field', text: 'Give each field an immutable ID, label, type, cardinality, required rule, default, option set, help, error copy, validation, conditional display, calculation, source/data binding, role permission, output mapping, effective version, and test.', acceptance: 'Automated schema validation and field coverage report pass for every production form and version.', priority: 'MUST' },
  { id: 'TRC-001', domainId: 'TRC', title: 'Establish canonical source and identifier authority', text: 'Register source, semantic definition, namespace, owner, version, effective dates, status, supersession, and collision disposition for every policy, workflow, step, form, field, event, route, page, component, role, interface, requirement, test, and evidence type.', acceptance: 'Registration or import rejects an ID already assigned to a different meaning; authority reports show zero unresolved duplicate or orphan required item.', priority: 'MUST' },
  { id: 'TRC-003', domainId: 'TRC', title: 'Decompose all workflows semantically', text: 'Convert each verified workflow into triggers, preconditions, actors, states, transitions, decisions, steps, forms, events, timers, dependencies, escalations, compensations, exceptions, outputs, evidence, and completion rules.', acceptance: '166/166 historical IDs receive current/changed/retired/out-of-scope disposition and every approved step has a requirement, UI/non-UI decision, and executable test.', priority: 'MUST' },
  { id: 'TRC-008', domainId: 'TRC', title: 'Enforce evidence-based development authorization', text: 'A requirement shall not enter development without source pinpoint, accountable owner, applicability and scope, approved user story/task flow, approved prototype or explicit non-UI rationale, atomic shall statement, measurable acceptance, dependencies, verification method, evidence definition, release, and change-control path.', acceptance: 'Backlog transition is blocked when any mandatory authority field is missing; approval and later change preserve immutable history.', priority: 'MUST' },
]

export const REGISTER_TOTAL = 170
export const REGISTER_SHOWN = REQUIREMENT_REGISTER.length

// ---------- Inventory counts (Gate status: Planning baseline · not build authorized) ----------

export interface InventoryStat {
  key: string
  label: string
  value: string
  sub: string
  tone: 'neutral' | 'good' | 'warn' | 'bad'
}

export const INVENTORY_STATS: InventoryStat[] = [
  { key: 'epics', label: 'Epics', value: '27', sub: 'System and experience epics', tone: 'neutral' },
  { key: 'stories', label: 'User stories', value: '108', sub: 'Delivery containers, four per epic', tone: 'neutral' },
  { key: 'tasks', label: 'Planning tasks', value: '5,350', sub: 'Across 15 planning buckets', tone: 'neutral' },
  { key: 'buckets', label: 'Planning buckets', value: '15', sub: '14 increments + unscheduled backlog', tone: 'neutral' },
  { key: 'requirements', label: 'Detailed requirements', value: '170', sub: 'Across 27 domains — the master register', tone: 'neutral' },
  { key: 'pageviews', label: 'Target pageviews', value: '104', sub: 'Required route/page contracts', tone: 'neutral' },
  { key: 'elements', label: 'Target elements', value: '192', sub: 'Reusable components and interface elements', tone: 'neutral' },
  { key: 'workflows', label: 'Workflow IDs inventoried', value: '166 / 166', sub: '1,108 steps still need semantic approval', tone: 'warn' },
  { key: 'forms', label: 'Form field schemas supplied', value: '0 / 349', sub: 'Critical source gate — 0% field-level import', tone: 'bad' },
  { key: 'blockers', label: 'Authorization blockers flagged', value: '30', sub: '5 named blocker groups below', tone: 'bad' },
]

// ---------- The 7-step required development sequence ----------

export interface SequenceStep {
  n: number
  title: string
  detail: string
}

export const DEVELOPMENT_SEQUENCE: SequenceStep[] = [
  { n: 1, title: 'Scope & source authority', detail: 'Define entity, users, boundaries, measurable value, and exclusions; establish canonical source and identifier authority.' },
  { n: 2, title: 'Epics & user stories', detail: 'Roles, triggers, task flows, risks, and cross-domain outcomes decomposed into actor / need / benefit / acceptance / source / owner stories.' },
  { n: 3, title: 'UI/UX prototype & design validation', detail: 'Low- then high-fidelity prototypes, realistic data, role variants, and human-factors/usability validation with named-user sign-off.' },
  { n: 4, title: 'Page / component / form / state contracts', detail: 'Every pageview, component, element, form/field, and universal state specified as a build-ready annotated handoff.' },
  { n: 5, title: 'Atomic requirements & acceptance tests', detail: 'The 170 planning statements decomposed into source-linked atomic child requirements with owners, applicability, tests, and evidence.' },
  { n: 6, title: 'Tasks, estimates, dependencies & sprint authorization', detail: 'Delivery backlog scheduled into planning buckets/increments — dates, capacity, estimates, and assignees intentionally uncommitted until authorized.' },
  { n: 7, title: 'Implementation, verification & retained evidence', detail: 'Development against approved frames and atomic requirements only, verified, and retired into retention-locked evidence.' },
]

// ---------- Authorization blockers (BL-01..BL-05) ----------

export interface Blocker {
  id: string
  title: string
  detail: string
  tone: 'bad' | 'warn'
}

export const BLOCKERS: Blocker[] = [
  {
    id: 'BL-01',
    title: 'Legacy authority conflict — historical archive is a discovery source, not UI/UX authority',
    detail: 'The April master file that seeded much of this inventory explicitly excluded clinical charting, claims, and clinician scheduling. It cannot stand in for an approved prototype, page contract, or current design authority.',
    tone: 'bad',
  },
  {
    id: 'BL-02',
    title: '77 unresolved workflow policy references + CL-PA / FN-BL / IT-AC taxonomy collisions',
    detail: 'Multiple form and policy IDs carry conflicting meanings across the corpus. Seventy-seven workflow-to-policy references remain unresolved, and the CL-PA, FN-BL, and IT-AC taxonomies have not been reconciled — existence of an ID does not prove it points to the correct clinical or business artifact.',
    tone: 'bad',
  },
  {
    id: 'BL-03',
    title: '201 of 269 Corridor alignment records awaiting SME review',
    detail: 'Automated "HIGH" mapping confidence in the Corridor alignment set is not clinical or compliance approval. 201 of 269 alignment records still require accountable subject-matter-expert review before they can be treated as authoritative.',
    tone: 'warn',
  },
  {
    id: 'BL-04',
    title: 'Registry / map drift — 11 missing alignments, 8 orphan alignments, 6 HH-map policy IDs absent',
    detail: 'The policy registry and the HH-map disagree: 11 alignments referenced by workflow are missing from the registry, 8 registry alignments are orphaned with no workflow reference, and 6 policy IDs named in the HH-map do not exist in the current policy set.',
    tone: 'bad',
  },
  {
    id: 'BL-05',
    title: 'Prototype persistence only — no production concurrency, authoritative identity, immutable evidence, or unified audit',
    detail: 'This build’s state is browser-local and file-backed for demonstration only. It has no production-grade concurrency control, no authoritative identity/access layer, no immutable legal-evidence packaging, and no unified audit trail — none of which may be assumed present until built and gate-approved.',
    tone: 'bad',
  },
]

// ---------- Architecture position (three-layer model) ----------

export interface ArchitectureLayer {
  n: string
  title: string
  detail: string
  points: string[]
}

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    n: '01',
    title: 'Epic-informed experience',
    detail: 'Longitudinal chart, role queues, guided documentation, patient access, and integrated revenue workflow.',
    points: [
      'One patient story across settings and episodes',
      'Role-specific queues, inboxes, and escalation',
      'Guided, specialty-specific documentation',
      'Integrated orders, results, medications, care plan',
      'Patient/proxy and partner access',
      'Integrated quality and revenue workflows',
    ],
  },
  {
    n: '02',
    title: 'Medplum-like FHIR R4 platform',
    detail: 'FHIR R4 datastore, identity, policy, history, terminology, subscriptions, SDK, and self-hosted runtime.',
    points: [
      'FHIR R4 datastore, search, history, validation',
      'Projects, memberships, AccessPolicy, OAuth/SMART',
      'Terminology, Questionnaire, Binary, DocumentReference',
      'Subscriptions, Bots, SDKs, bulk export',
      'PostgreSQL, object storage, Redis/queues, AWS deployment',
      'Replaceable application experience above the API',
    ],
  },
  {
    n: '03',
    title: 'Care Indeed home-health kernel',
    detail: 'OASIS, field/offline, EVV, claims, QAPI, legal evidence, and governed AI.',
    points: [
      'OASIS-E2 packages and CMS submission pipeline',
      'Durable SOC, order, certification, visit, and claim workflow',
      'Offline field sync and payer-scoped EVV',
      'NOA, institutional 837I, 835, denial and ADR',
      'Policy, QAPI, competency, immutable evidence',
      'Assistive AI with human signature and kill switch',
    ],
  },
]

export const ARCHITECTURE_CAVEAT =
  'This is a capability architecture — not a claim to reproduce Epic’s proprietary implementation, and not an assumption that installing Medplum completes a home-health EHR.'

export const WELLSKY_NOTE =
  'All production authority transfers remain gated. WellSky continues as system of record until each domain passes clinical, compliance, financial, security, recovery, and governing-body acceptance.'

// ---------- Releases & planning ----------

export interface Release {
  id: string
  name: string
}

export const RELEASES: Release[] = [
  { id: 'R0', name: 'Scope baseline' },
  { id: 'R1', name: 'Secure synthetic foundation' },
  { id: 'R2', name: 'Limited-PHI authorization' },
  { id: 'R3', name: 'Read-only shadow workflow' },
  { id: 'R4', name: 'Clinical record pilot' },
  { id: 'R5', name: 'Revenue-cycle pilot' },
  { id: 'R6', name: 'Domain cutover & stabilization' },
]

export const PLANNING_NOTE =
  '7 releases (R0–R6) span 14 planning increments plus one unscheduled backlog bucket — 15 planning buckets in total, holding 5,350 planning tasks. 11 program gates (G0–G10) run alongside the 9 domain design/production authorization gates (D0, 0–7) documented below; dates, capacity, estimates, and assignees are intentionally uncommitted at this planning baseline.'

// ---------- Epics (27) — name + owner context, no fabricated story text ----------

export interface Epic {
  id: string
  name: string
}

export const EPICS: Epic[] = [
  { id: 'E-01', name: 'Enterprise governance & master data' },
  { id: 'E-02', name: 'Identity, access & workforce lifecycle' },
  { id: 'E-03', name: 'Patient identity, consent & preferences' },
  { id: 'E-04', name: 'Referral, intake & admission decision' },
  { id: 'E-05', name: 'Episode, certification & OASIS' },
  { id: 'E-06', name: 'Care plan, orders & clinical documentation' },
  { id: 'E-07', name: 'Workforce eligibility, scheduling & on-call' },
  { id: 'E-08', name: 'Field visit, mobile/offline & EVV' },
  { id: 'E-09', name: 'Work queues, care coordination & portals' },
  { id: 'E-10', name: 'Revenue cycle & payer operations' },
  { id: 'E-11', name: 'QAPI, compliance & workforce competency' },
  { id: 'E-12', name: 'Forms, documents, signatures & legal evidence' },
  { id: 'E-13', name: 'Data, analytics, reporting & export' },
  { id: 'E-14', name: 'FHIR platform, terminology & integration' },
  { id: 'E-15', name: 'Governed artificial intelligence' },
  { id: 'E-16', name: 'Security, reliability & secure delivery' },
  { id: 'E-17', name: 'Migration, adoption, support & decommission' },
  { id: 'E-18', name: 'Conditional, future & commercialization scope' },
  { id: 'E-19', name: 'Patient rights, beneficiary notices & appeals' },
  { id: 'E-20', name: 'Emergency preparedness, continuity & field safety' },
  { id: 'E-21', name: 'CMS quality reporting & value-based purchasing' },
  { id: 'E-22', name: 'Third-party, BAA & service-provider lifecycle' },
  { id: 'E-23', name: 'Home-health aide and assistant supervision' },
  { id: 'E-24', name: 'Experience architecture & prototyping' },
  { id: 'E-25', name: 'Pageviews, components, elements & states' },
  { id: 'E-26', name: 'Forms, fields, signatures, print & export' },
  { id: 'E-27', name: 'Semantic traceability, source integrity & design verification' },
]

export const EPIC_STORY_NOTE =
  'Every epic owns four testable delivery stories (27 × 4 = 108). The two layers are complementary: epic/story coverage never deletes, replaces, summarizes away, or downgrades any of the 170 detailed requirements above. Crosswalk status: 0 of 170 detailed requirements are decorated with a direct epic/story alignment or an explicit cross-cutting backlog-gap reason as of this baseline — the mapping is analytical and non-authoritative until Gate 0 review.'

// ---------- UI/UX inventory ----------

export const PAGEVIEW_NOTE =
  '104 target pageviews and routes are inventoried. Every row is a mandatory specification package: purpose, personas, stories, workflow steps, layout regions, components, forms, data/API bindings, commands, role variants, all states, responsive behavior, accessibility, analytics, and acceptance tests.'

export const ELEMENT_REGISTRY_NOTE =
  '192 target elements are organized into 16 governed component/element families. Every named item requires anatomy, props/data, variants, events, validation, focus/keyboard/touch behavior, responsive rules, ARIA semantics, role and PHI visibility, reuse locations, and unit/integration/visual tests. One-off interaction patterns require explicit approval.'

export const FORM_GATE_NOTE = {
  headline: 'The supplied corpus declares the forms library and workflow links but does not contain the complete current Builder/Forms/* field schemas. That missing source is a visible authorization blocker — not an assumption.',
  rows: [
    { label: 'Declared library forms', value: '349', detail: 'Every source file must be imported, versioned, titled, owned, and classified.' },
    { label: 'Unique workflow-linked form IDs', value: '342', detail: 'Each link must resolve to the correct semantic form — not merely an existing ID.' },
    { label: 'Library-only forms unresolved from the supplied workflow inventory', value: '7', detail: 'Reconcile against the authoritative forms export index; do not invent IDs or titles.' },
    { label: 'Field schemas supplied in this review packet', value: '0 / 349', detail: 'Import every section, field, rule, branch, permission, data binding, signature, output, retention rule, and test.' },
  ],
}

export interface StateClass {
  group: string
  states: string
  detail: string
}

export const STATE_MATRIX: StateClass[] = [
  { group: 'ENTRY', states: 'Default · loading · skeleton', detail: 'Initial values, data dependencies, progressive disclosure, timeout, cancel, and focus placement.' },
  { group: 'DATA', states: 'Empty · partial · stale', detail: 'Why data is absent, freshness, refresh, source, missing-field impact, and safe continuation.' },
  { group: 'OUTCOME', states: 'Success · warning · error', detail: 'Confirmation, evidence, next action, severity, recovery, undo, retry, and escalation.' },
  { group: 'FIELD', states: 'Offline · queued · syncing', detail: 'Local authority, encryption, pending changes, background recovery, and no-loss evidence.' },
  { group: 'CONCURRENCY', states: 'Conflict · superseded · unsaved', detail: 'Version comparison, responsible merge, discard guard, amendment, and preserved provenance.' },
  { group: 'AUTHORITY', states: 'Read-only · denied · locked', detail: 'Reason, scope, reveal rules, remediation, break-glass, signatures, legal lock, and audit.' },
  { group: 'WORKFLOW', states: 'Blocked · expired · voided', detail: 'Dependency, due clock, owner, escalation, substitute, correction, and downstream impact.' },
  { group: 'RESILIENCE', states: 'Degraded · interrupted · recovered', detail: 'Safe mode, downtime procedure, status communication, replay, reconciliation, and proof.' },
]

export const STATE_MATRIX_NOTE =
  '20 required state classes across these 8 groups. "Happy path only" is not an acceptable prototype or implementation for any pageview, component, form, action, data request, or integration.'

// ---------- Workflows ----------

export const WORKFLOW_NOTE =
  '166 of 166 historical workflow IDs are inventoried — coverage only. Each of the resulting 1,108 steps still requires semantic disposition: trigger, precondition, actor, state, transition, decision, form, event, timer, dependency, escalation, compensation, exception, output, evidence, and completion rule.'

// ---------- Executable business traces ----------

export interface BusinessTrace {
  id: string
  title: string
  steps: string[]
  proof: string
}

export const BUSINESS_TRACES: BusinessTrace[] = [
  {
    id: 'TRACE 01 · CORE EPISODE',
    title: 'Referral to QAPI',
    steps: [
      'Ingest and source the referral',
      'Resolve identity, payer, F2F, capacity',
      'Accept and schedule SOC',
      'Complete OASIS and establish POC',
      'Obtain orders and deliver visits',
      'Validate CMS file and acknowledgments',
      'Release NOA/claim only when ready',
      'Post remittance and feed QAPI',
    ],
    proof: 'One trace ID connects request, episode, assessment, order, visit, claim, remittance, metric, and evidence package.',
  },
  {
    id: 'TRACE 02 · MEDICATION CHANGE',
    title: 'Discrepancy to updated plan',
    steps: [
      'Clinician records source and discrepancy',
      'Safety rules create prioritized review',
      'Clinician reconciles and contacts prescriber',
      'New/changed order enters signature queue',
      'POC and medication profile update by version',
      'Patient education is documented',
      'Next clinician sees acknowledged change',
      'Unresolved risk escalates to manager',
    ],
    proof: 'No AI suggestion or imported list silently changes the legal medication or plan-of-care record.',
  },
  {
    id: 'TRACE 03 · HOSPITALIZATION',
    title: 'Transfer to ROC or discharge',
    steps: [
      'Event creates transfer and notification tasks',
      'Assessment and active orders are frozen by version',
      'Care team, physician, payer, and schedule update',
      'Hospital information is reconciled on return',
      'ROC assessment and POC/order changes are completed',
      'Visits and authorization are recalculated',
      'Claim and OASIS states reconcile',
      'QAPI hospitalization review closes the loop',
    ],
    proof: 'No scheduled visit, order, payer event, or quality signal is orphaned by the transition.',
  },
]

// ---------- Nonfunctional requirements ----------

export const NFR_CATEGORIES: string[] = [
  'Availability', 'Performance', 'Offline integrity', 'Recovery', 'Security', 'Accessibility',
  'Interoperability', 'Capacity', 'Observability', 'Privacy', 'Change safety', 'Print fidelity',
  'Usability', 'AI safety', 'Continuity', 'Portability',
]

export const NFR_NOTE =
  '18 measurable nonfunctional requirements govern quality as a release obligation, not a final polish pass — measured against explicit targets across the categories above (16 named; two additional cross-cutting measures apply agency-wide).'

// ---------- Design & production authorization gates ----------

export interface Gate {
  id: string
  title: string
  detail: string
  criteria: string[]
  decision: string
}

export const GATES: Gate[] = [
  {
    id: 'GATE D0',
    title: 'Experience design authority',
    detail: 'Approve information architecture, task flows, representative low/high-fidelity prototypes, 104 pageview contracts, component/element registry, 349-form reconciliation plan, universal states, accessibility, and human-factors results before UI development.',
    criteria: [
      'Every UI-bearing story links to approved prototype frame/version',
      'All roles, devices, states, errors, offline, permissions and legal-record paths dispositioned',
      'Zero unresolved critical safety/accessibility finding',
      'Zero orphan story, frame, page, component, form, workflow step or test',
    ],
    decision: 'Authorize implementation of approved frames only',
  },
  {
    id: 'GATE 0',
    title: 'Requirements authority',
    detail: 'Approve scope and decompose the 170 planning statements into source-linked atomic child requirements with owners, applicability, implementation disposition, tests, evidence, and release gate.',
    criteria: [
      '166 workflows decomposed by step and semantics — not IDs alone',
      '349 forms and field schemas imported; semantic collisions resolved',
      'Policy/mapping/version discrepancies and legacy terms resolved',
      'Clinical, legal, data, submission and build/integrate/buy authorities approved',
    ],
    decision: 'Authorize synthetic-data foundation only',
  },
  {
    id: 'GATE 1',
    title: 'Secure synthetic foundation',
    detail: 'Establish separated environments, FHIR profiles, identity, combined authorization, history, audit, encryption, monitoring, backup, restore, secure delivery, and traceable requirements using synthetic or approved de-identified data only.',
    criteria: [
      'Threat model, SRA, and privacy design accepted',
      '100% audited privileged and legal-record actions',
      'Restore/failover meet approved RTO/RPO',
      'Zero unresolved Severity 1 or critical vulnerability',
    ],
    decision: 'Permit non-PHI integration and safety work',
  },
  {
    id: 'GATE 2',
    title: 'Limited-PHI authorization',
    detail: 'Authorize a named, minimum-necessary cohort only after the environment, people, contracts, vendors, controls, incident readiness, and data lifecycle are independently ready for PHI.',
    criteria: [
      'BAAs/service eligibility and subcontractors approved',
      'Independent penetration test; no open critical/high blocker',
      'Access-policy negative tests and termination revocation pass',
      'Retention, masking, incident, breach, and deletion plans approved',
    ],
    decision: 'Permit read-only PHI shadow for named scope',
  },
  {
    id: 'GATE 3',
    title: 'Read-only shadow workflow',
    detail: 'Import and reconcile the authorized cohort while WellSky remains sole clinical and billing authority. Shadow output cannot alter care, billing, external submissions, or the legal record.',
    criteria: [
      '100% in-scope record count and identifier reconciliation',
      'Zero silent task, attachment, or interface loss/duplication',
      'Workflow timers, data freshness, disposal, and rollback proven',
      'Clinical UAT and WCAG 2.2 AA acceptance met',
    ],
    decision: 'Authorize bounded clinical-record pilot',
  },
  {
    id: 'GATE 4',
    title: 'Clinical record pilot',
    detail: 'Authorize Care Indeed record authority only for named patients, disciplines, locations, payers, and functions after independent clinical, compliance, privacy, and safety approval.',
    criteria: [
      'OASIS/CMS test files and reconciliation accepted',
      'Orders, POC, results, visits, notices, signatures reconcile',
      'Offline loss/duplicate rate is zero in acceptance tests',
      'EVV exceptions closed if applicable to pilot cohort',
    ],
    decision: 'Retain, stop, or expand named clinical scope',
  },
  {
    id: 'GATE 5',
    title: 'Revenue-cycle pilot',
    detail: 'Run non-submitting and tightly controlled parallel revenue workflows before Care Indeed originates live transactions for specifically approved payers and transaction types.',
    criteria: [
      'Enrollment/trading-partner and companion-guide approval',
      'NOA, 837I, 999, 277CA, 835 and status tests accepted',
      '100% transaction final-state and ledger reconciliation',
      'Zero unexplained claim/payment variance; Finance sign-off',
    ],
    decision: 'Authorize named payer pathways only',
  },
  {
    id: 'GATE 6',
    title: 'Domain cutover',
    detail: 'Transfer each system-of-record domain only after production-scale evidence, archive access, migration reconciliation, support readiness, security/recovery proof, rehearsed rollback, and Governing Body approval.',
    criteria: [
      '100% in-scope migration/count/hash reconciliation',
      'Zero unresolved Severity 1, patient-safety hazard, or critical control gap',
      'SLO, recovery, downtime, support, and rollback thresholds met',
      'Incumbent fallback remains available during stabilization',
    ],
    decision: 'Cut over domain — do not decommission yet',
  },
  {
    id: 'GATE 7',
    title: 'Stabilize and decommission',
    detail: 'Retire an incumbent module only after observed 30/60/90-day stability — not merely a plan — and after Care Indeed can retrieve, defend, reconcile, and operate every retained obligation without it.',
    criteria: [
      'Actual clinical, OASIS, claim, payment, quality, and SLO results accepted',
      'No unresolved severe defect or material reconciliation gap',
      'Archive, legal hold, disclosure, and survey retrieval proven',
      'Data return/deletion certificate and realized benefits approved',
    ],
    decision: 'Retire incumbent module — not evidence',
  },
]

export const GATE_STATUS_LABEL = 'Planning baseline · not build authorized'

export const GATE_STATUS_DETAIL =
  'This is the comprehensive planning baseline and the authority target for the owned EHR program — not yet a build-ready specification. Design Gate D0 and Requirements Gate 0 remain blocked until every statement is decomposed, every pageview and interaction is prototyped and approved, all 349 form sources and fields are imported, source collisions are resolved, and each atomic requirement has an owner, test, evidence, and release disposition. New laws, payer rules, clinical services, or business lines enter through formal change control.'

// ---------- Requirements governance (traceability chain) ----------

export const TRACEABILITY_CHAIN =
  'epic → story → task flow → prototype frame/version → pageview → component/element → form/field → workflow/step → policy/regulation → role/permission → data/API/event → acceptance criterion → test → retained evidence'

export interface GovernanceRecord {
  n: string
  title: string
  detail: string
}

export const GOVERNANCE_RECORDS: GovernanceRecord[] = [
  { n: '01', title: 'SOURCE', detail: 'Law · payer · policy · workflow · user need' },
  { n: '02', title: 'OWNER', detail: 'Business · clinical · compliance · technology' },
  { n: '03', title: 'DESIGN', detail: 'Domain · FHIR profile · UX · control · integration' },
  { n: '04', title: 'TEST', detail: 'Unit · contract · scenario · safety · accessibility' },
  { n: '05', title: 'EVIDENCE', detail: 'Result · screenshot · file · audit · approval · hash' },
  { n: '06', title: 'RELEASE', detail: 'Gate · cohort · authority · rollback · monitoring' },
]

export const CHANGE_CONTROL_NOTE =
  'A regulatory, payer, policy, assessment, terminology, workflow, integration, model, or infrastructure change creates an impact assessment. The release record identifies affected requirements, patient cohorts, templates, rules, tests, training, migrations, evidence packages, and rollback criteria.'

// ---------- Sources & changes ----------

export const SOURCE_CATEGORIES: { group: string; items: string[] }[] = [
  {
    group: 'Epic public materials (independently observed patterns only)',
    items: [
      'Epic Care in the Home / Dorothy public capabilities',
      'Epic public specialty and guided-workflow principles',
      'Epic public patient and proxy experience patterns',
      'Epic public population-health capabilities',
      'Epic public operational analytics capabilities',
      'Epic access, authorization, scheduling, and revenue cycle',
      'Epic interoperability and standards-based connections',
      'open.epic public design overview',
      'open.epic public data-sharing playbooks',
      'open.epic FHIR, HL7, X12, NCPDP, and interface specifications',
      'open.epic EHI public OASIS lifecycle concepts — not a Care Indeed schema',
      'open.epic EHI public home-health plan-of-care concepts — not architecture',
    ],
  },
  {
    group: 'Medplum reference documentation',
    items: [
      'Medplum FHIR datastore and operations',
      'Medplum AccessPolicy and compartment controls',
      'Medplum FHIR resource history',
      'Medplum subscriptions and event-driven notifications',
      'Medplum self-hosted AWS architecture',
      'Medplum disaster-recovery principles',
    ],
  },
  {
    group: 'Standards and regulatory sources',
    items: [
      'HL7 FHIR Release 4 specification',
      'HL7 FHIR Provenance',
      'eCFR Medicare Home Health Conditions of Participation',
      'eCFR Home health aide services and supervision',
      'eCFR Home-health emergency preparedness',
      'CMS OASIS-E2 data sets and specifications',
      'CMS/QTSO manual — iQIES data-entry software discontinuation',
      'CMS Medicare Claims Processing Manual, Chapter 10',
      'CMS Home-health beneficiary notices and HHCCN',
      'CMS Home Health Quality Reporting Program',
      'CMS Expanded HHVBP model',
      'HHS HIPAA Security Rule',
      'HHS Business associate agreement provisions',
      'California CMIA EHR change-history requirement',
    ],
  },
  {
    group: 'Internal corpus reviewed',
    items: [
      'README; Integration Map; Workflow and Events System; Print System Architecture',
      'Data Model and Files; All Workflows; All Policies',
      'AWS Phase 1 Foundation Plan; Master System Documentation',
      'California ACHC policy source; generated policy/corridor artifacts; policy/HH map',
      'Defensibility hardening reports',
      'Synthetic Q2 2026 QAPI UAT packet',
    ],
  },
]

export const SOURCE_EVIDENCE_BOUNDARY =
  'Epic public pages and EHI export dictionaries are used only to show that an enterprise pattern or record concept exists. They are not Epic architecture, a canonical Care Indeed schema, affiliation, endorsement, or permission to copy Epic data structures. Home-health billing, OASIS, notice, supervision, emergency, EVV, and quality requirements derive from applicable CMS, payer, law, contract, and Care Indeed sources — not from Epic. Epic has not reviewed, approved, endorsed, or participated in this plan.'

export const INTERNAL_CORPUS_NOTE =
  'Those internal assets supply Care Indeed workflow and control requirements; they are not external certification or production-readiness proof.'

// ---------- Document control block ----------

export const DOCUMENT_CONTROL = {
  documentId: 'CI-EHR-SRS-PM-001',
  version: 'Version 1.1 · July 29, 2026',
  subtitle: 'Second-pass unified baseline',
  owner: 'Care Indeed EHR system owner',
  approvers: 'Executive, clinical, compliance, privacy, security, revenue, and architecture authorities',
  status: 'Draft for controlled approval',
  deliveryStatus: 'Planning only — dates, capacity, estimates, and assignees intentionally uncommitted',
  changeRule: 'No requirement, story, workflow, form, page, element, test, or evidence obligation may be silently removed.',
}

export const FOOTER_SUMMARY =
  '27 epics · 108 stories · 5,350 tasks · 170 detailed requirements · 104 pageviews · 192 elements · 166 workflows · 349 forms'

// ---------- Section nav ----------

export interface SpecSection {
  id: string
  label: string
}

export const SPEC_SECTIONS: SpecSection[] = [
  { id: 'sec-overview', label: 'Document overview' },
  { id: 'sec-charter', label: 'Charter & scope' },
  { id: 'sec-architecture', label: 'Architecture' },
  { id: 'sec-releases', label: 'Releases & planning' },
  { id: 'sec-epics', label: 'Epics (27)' },
  { id: 'sec-stories', label: 'User stories (108)' },
  { id: 'sec-uiux', label: 'UI/UX inventory' },
  { id: 'sec-tasks', label: 'Tasks & backlog' },
  { id: 'sec-register', label: 'Requirements register' },
  { id: 'sec-forms', label: 'Forms & fields' },
  { id: 'sec-workflows', label: 'Workflows' },
  { id: 'sec-traceability', label: 'Traceability' },
  { id: 'sec-testing', label: 'Testing & evidence' },
  { id: 'sec-risks', label: 'Risks & issues' },
  { id: 'sec-decisions', label: 'Decisions / ADRs' },
  { id: 'sec-gates', label: 'Gates & approvals' },
  { id: 'sec-sources', label: 'Sources & changes' },
]

// ---------- Canonical ADRs ----------

export interface Adr {
  id: string
  title: string
  detail: string
}

export const ADRS: Adr[] = [
  { id: 'ADR 01 · CANONICAL MODEL', title: 'FHIR R4 clinical authority', detail: 'All authoritative clinical writes pass through validated FHIR APIs; no application, integration, report, or AI tool creates a second hidden clinical truth.' },
  { id: 'ADR 02 · WORKFLOW', title: 'Durable orchestration beside FHIR', detail: 'Tasks appear in FHIR; multi-day timers, retries, escalation, compensation, and idempotency live in a purpose-built workflow service.' },
  { id: 'ADR 03 · LEGAL RECORD', title: 'Evidence beyond resource history', detail: 'Signed manifestations use exact versions, server-rendered artifacts, hashes, WORM retention, legal hold, and a readable audit packet.' },
  { id: 'ADR 04 · MODULARITY', title: 'Modular monolith before microservices', detail: 'Keep transactions cohesive while enforcing domain boundaries, service contracts, outbox events, ownership, and independent testability.' },
  { id: 'ADR 05 · OFFLINE', title: 'Server-authoritative synchronization', detail: 'Encrypted least-necessary caches, durable outbox, dependency order, version checks, conflict review, and visible unsynced work prevent silent loss.' },
  { id: 'ADR 06 · INTEGRATION', title: 'Every rail reconciles', detail: 'Signed webhooks, idempotency, retry, dead-letter, acknowledgment, exception queue, and scheduled source-to-target reconciliation are mandatory.' },
  { id: 'ADR 07 · AI', title: 'Proposal, not authority', detail: 'AI output is source-grounded, typed, reviewable, versioned, measurable, and immediately disableable; humans own every legal or clinical action.' },
  { id: 'ADR 08 · PORTABILITY', title: 'Exit is continuously tested', detail: 'Patient, population, document, audit, configuration, workflow, and evidence exports — and restore/migration rehearsals — are system features.' },
]

// ---------- Charter / scope ----------

// ---------- PM-tool workspace navigation (left rail) ----------

export type WorkspaceKey =
  | 'overview' | 'charter' | 'architecture'
  | 'releases' | 'epics' | 'stories' | 'uiux' | 'tasks' | 'sprint'
  | 'register' | 'forms' | 'workflows' | 'traceability' | 'testing'
  | 'risks' | 'decisions' | 'gates' | 'sources'

export interface NavItem {
  key: WorkspaceKey
  label: string
  sublabel: string
  count?: number
}

export interface NavGroup {
  group: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    group: 'System specification',
    items: [
      { key: 'overview', label: 'Document overview', sublabel: 'Control, status, coverage and blockers' },
      { key: 'charter', label: 'Charter & scope', sublabel: 'Purpose, boundaries and authority' },
      { key: 'architecture', label: 'Architecture', sublabel: 'Epic-informed and FHIR-native reference model' },
    ],
  },
  {
    group: 'Project delivery',
    items: [
      { key: 'releases', label: 'Releases & planning', sublabel: 'R0–R6, 14 increments and governed backlog', count: 7 },
      { key: 'epics', label: 'Epics', sublabel: '27 delivery outcomes', count: 27 },
      { key: 'stories', label: 'User stories', sublabel: '108 features and acceptance contracts', count: 108 },
      { key: 'uiux', label: 'UI/UX inventory', sublabel: 'Prototype stage, pages, elements and states', count: 104 },
      { key: 'tasks', label: 'Tasks & backlog', sublabel: '5,350 traceable planning tasks', count: 5350 },
      { key: 'sprint', label: 'Sprint board', sublabel: 'Planning workflow and blockers' },
    ],
  },
  {
    group: 'Build specification',
    items: [
      { key: 'register', label: 'Requirements register', sublabel: '170 detailed shall statements', count: 170 },
      { key: 'forms', label: 'Forms & fields', sublabel: '349-form authority gate', count: 349 },
      { key: 'workflows', label: 'Workflows', sublabel: '166 operational workflow IDs', count: 166 },
      { key: 'traceability', label: 'Traceability', sublabel: 'Source-to-release chain' },
      { key: 'testing', label: 'Testing & evidence', sublabel: 'Acceptance, quality and proof' },
    ],
  },
  {
    group: 'Governance',
    items: [
      { key: 'risks', label: 'Risks & issues', sublabel: 'Blockers and cross-cutting gaps', count: 30 },
      { key: 'decisions', label: 'Decisions / ADRs', sublabel: 'Architecture authority and conflicts', count: 8 },
      { key: 'gates', label: 'Gates & approvals', sublabel: 'Authority and program gates', count: 9 },
      { key: 'sources', label: 'Sources & changes', sublabel: 'Internal corpus and public references' },
    ],
  },
]

// ---------- Epics as PM cards (real names; planning-only progress) ----------
// Epic order mirrors REGISTER_DOMAINS 1:1 (both are the 27-domain baseline).
// Planning progress is intentionally 0 for every epic: the source's own
// crosswalk status states "0 of 170 detailed requirements are decorated
// with a direct epic/story alignment" as of this baseline — no epic has a
// real, source-backed completion percentage yet. Showing 0% with an
// explanatory sub-label is the honest choice; inventing per-epic progress
// would misrepresent the planning baseline as build progress.
export interface EpicCard {
  id: string
  name: string
  domainId: string
  storyCount: number
  planningPct: number
  status: 'neutral' | 'warn'
}

export const EPIC_CARDS: EpicCard[] = EPICS.map((e, i) => ({
  id: e.id,
  name: e.name,
  domainId: REGISTER_DOMAINS[i]?.id ?? '',
  storyCount: 4,
  planningPct: 0,
  status: 'neutral',
}))

export const EPIC_PROGRESS_NOTE =
  'Every epic is shown at 0% planning progress. The source crosswalk states 0 of 170 detailed requirements carry a decorated epic/story alignment at this baseline — no epic has real, source-backed completion data yet. This is a planning inventory, not a build-progress board.'

// ---------- User stories (structural slots — no fabricated story text) ----------
// The source names 27 epics × 4 stories = 108 but does not publish individual
// story titles, actor/need/benefit text, or acceptance criteria per story in
// the reviewed corpus. Rather than invent story text, each row below is an
// honestly labeled STRUCTURAL SLOT (epic + slot number) with an "Unauthored"
// status — the 108 count is real, the row content is a placeholder, and the
// screen must say so.
export interface StorySlot {
  id: string
  epicId: string
  epicName: string
  slot: number
  priority: ReqPriority | 'UNSET'
  status: 'neutral'
}

export const STORY_SLOTS: StorySlot[] = EPIC_CARDS.flatMap(e =>
  Array.from({ length: e.storyCount }, (_, i) => ({
    id: `${e.id}-S${i + 1}`,
    epicId: e.id,
    epicName: e.name,
    slot: i + 1,
    priority: 'UNSET' as const,
    status: 'neutral' as const,
  }))
)

export const STORY_SLOT_NOTE =
  'The source confirms 27 epics × 4 stories = 108 but does not publish individual story titles, actor/need/benefit text, or acceptance criteria in the reviewed corpus. Rows below are structural slots, not authored stories — the 108 count is real; the row content is an honestly labeled placeholder pending Gate 0 story authorship.'

// ---------- Tasks & backlog (buckets are real; task rows are not enumerable) ----------

export interface PlanningBucket {
  id: string
  name: string
  kind: 'increment' | 'backlog'
}

export const PLANNING_BUCKETS: PlanningBucket[] = [
  ...Array.from({ length: 14 }, (_, i) => ({ id: `INC-${String(i + 1).padStart(2, '0')}`, name: `Increment ${i + 1}`, kind: 'increment' as const })),
  { id: 'BKLG-00', name: 'Unscheduled backlog', kind: 'backlog' as const },
]

export const TASKS_TOTAL = 5350

export const TASKS_NOTE =
  'The live requirements workspace computes a planning-task corpus of 5,350 items across 15 planning buckets (14 increments plus one unscheduled-backlog bucket). That total is a runtime inventory figure from the requirements program data — not a single static sentence in the Requirements addendum HTML extract. No task-level rows are fabricated here: the 15 buckets below are real; per-bucket counts and task text are not yet decomposed at this planning baseline.'

// ---------- Sprint board (planning-sequence columns; blockers, not "done") ----------

export interface SprintColumn {
  step: number
  title: string
  detail: string
  epicsQueued?: number
  blockerIds: string[]
}

export const SPRINT_COLUMNS: SprintColumn[] = [
  { step: 1, title: 'Scope & source authority', detail: 'Define scope and canonical source/identifier authority.', epicsQueued: 27, blockerIds: ['BL-01', 'BL-04'] },
  { step: 2, title: 'Epics & user stories', detail: 'Roles, triggers, task flows, and story decomposition.', blockerIds: [] },
  { step: 3, title: 'UI/UX prototype & design validation', detail: 'Low/high-fidelity prototypes and human-factors validation.', blockerIds: [] },
  { step: 4, title: 'Page/component/form/state contracts', detail: 'Build-ready annotated handoff per page, component, form, state.', blockerIds: [] },
  { step: 5, title: 'Atomic requirements & acceptance tests', detail: 'Decompose the 170 statements into atomic, testable requirements.', blockerIds: ['BL-02', 'BL-03'] },
  { step: 6, title: 'Tasks, estimates, dependencies & sprint authorization', detail: 'Schedule backlog into planning buckets — uncommitted until authorized.', blockerIds: [] },
  { step: 7, title: 'Implementation, verification & retained evidence', detail: 'Development against approved frames and atomic requirements only.', blockerIds: ['BL-05'] },
]

export const SPRINT_BOARD_NOTE =
  'All 27 epics currently sit at step 1 — nothing in this baseline has passed Design Gate D0 or Requirements Gate 0, so no column represents "in progress" or "shipped" work. Blocker chips show this prototype\'s planning-visualization placement of BL-01…BL-05 against the step each most directly blocks; the source names the blockers but does not itself assign them to a sequence step.'

export const CHARTER = {
  lead: 'The full systems, platform, clinical, compliance, revenue, field, data, security, migration, and operating scope required to turn the investment thesis into a production home-health EHR — written as traceable requirements with acceptance evidence.',
  scopeStatement: 'The baseline covers Care Indeed Home Health Care, Inc. as a California skilled home-health agency. It intentionally separates production necessities from conditional modules and from unrelated lines of business.',
  inScope: 'Referral through retained legal record. Clinical, operational, financial, compliance, security, and data capabilities for Medicare-certified home health, with controlled extensions for applicable other payers: patient/proxy/provider identity; referral, eligibility & intake; episode, certification & OASIS; orders, POC, medication & results; schedule, visits, offline & EVV; claims, remittance, denial & ADR; QAPI, policy, evidence & audit; portal, exchange, analytics & AI.',
  users: 'Field and office work on one record: patient homes; Care Indeed offices; approved remote work; patient/proxy access; referring and ordering providers; contracted integration partners. Roles: RN · LVN · DON · PT · PTA · OT · OTA · SLP · MSW · HHA · intake · scheduler · QA/OASIS · billing · authorization · compliance · QAPI · physician/allowed practitioner · patient · caregiver · proxy.',
  separateEntity: 'Care Indeed, Inc. private-duty non-medical home care is not silently combined with this legal entity, workforce, patient record, payer, or economics.',
  conditionalModules: 'Hospice, hospital-at-home, e-prescribing/EPCS, home infusion, remote monitoring, Part 2, and commercialization require explicit scope activation and validation.',
  buyAsRails: 'Clearinghouse, payer networks, messaging delivery, identity proofing, eRx/EPCS, MDM, monitoring, and selected security services remain replaceable contracted services.',
}
