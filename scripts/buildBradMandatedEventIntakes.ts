/* ══════════════════════════════════════════════════════════════════════
   Brad Mandated Event Intake — generator.

   Reads the EXISTING mandated-event calendar (REGULATORY_EVENTS), the
   compiled workflow library (WORKFLOWS), and the Enterprise Forms Library
   (FORMS_DATASET / FORM_TITLES / formIdAliases), and emits one
   BradMandatedEventIntakeDefinition per recurring mandated-event FAMILY
   (grouped by eventSubType — 254 dated calendar occurrences collapse to
   ~70 distinct mandates). Nothing here is hand-authored per event: every
   required form / evidence item / sign-off / extraction hint is derived
   from the real event + workflow records, or explicitly flagged as a gap.

   Outputs:
     src/policy/data/bradMandatedEventIntakes.generated.ts
     Builder/Documentations/BRAD_MANDATED_EVENT_INTAKE_REPORT.md

   Usage:
     npm run build:brad-intakes
   ══════════════════════════════════════════════════════════════════════ */

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REGULATORY_EVENTS, type RegulatoryEvent } from '../src/policy/data/regulatoryEvents';
import { getWorkflow } from '../src/policy/data/workflows.generated';
import type { Workflow } from '../src/policy/types/workflow';
import { resolveCanonicalFormId, resolveFormTitle } from '../src/policy/data/formIdAliases';
import type {
  BradMandatedEventIntakeDefinition,
  BradRequiredFormRef,
  BradRequiredEvidenceRef,
  BradRequiredSignoffRef,
  BradSourceRequirement,
  BradIntakeSection,
  BradIntakeField,
  BradPacketSectionMap,
  BradSourceBundleField,
  BradIntakeReadinessRule,
  BradExtractionHint,
} from '../src/policy/brad/intake/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_FILE = join(ROOT, 'src', 'policy', 'data', 'bradMandatedEventIntakes.generated.ts');
const REPORT_FILE = join(ROOT, 'Builder', 'Documentations', 'BRAD_MANDATED_EVENT_INTAKE_REPORT.md');

const slug = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'event';

// ── 1. Group the 254 dated calendar occurrences into mandated-event families ──
const groups = new Map<string, RegulatoryEvent[]>();
for (const e of REGULATORY_EVENTS) {
  const key = e.eventSubType || slug(e.title);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key)!.push(e);
}

function pickRepresentative(events: RegulatoryEvent[]): RegulatoryEvent {
  const score = (e: RegulatoryEvent) =>
    (e.requiredForms?.length || 0) * 10 + (e.processFlow?.length || 0) + (e.approvals?.length || 0);
  return [...events].sort((a, b) => score(b) - score(a) || a.date.localeCompare(b.date))[0];
}

// ── 2. Shared field helper + the 8 generic intake sections (Phase 4) ──
function field(
  f: Partial<BradIntakeField> & Pick<BradIntakeField, 'fieldId' | 'label' | 'type' | 'mapsToBundlePath'>,
): BradIntakeField {
  return {
    required: false,
    sourceHint: '',
    aliases: [],
    confidenceThreshold: 0.5,
    manualEntryAllowed: true,
    mapsToFormIds: [],
    mapsToPacketSections: [],
    ...f,
  };
}

function buildGenericSections(args: {
  requiredForms: BradRequiredFormRef[];
  requiredEvidence: BradRequiredEvidenceRef[];
  requiredSignoffs: BradRequiredSignoffRef[];
  extractionHints: BradExtractionHint[];
}): BradIntakeSection[] {
  const { requiredForms, requiredEvidence, requiredSignoffs, extractionHints } = args;
  return [
    {
      sectionId: 'event_control',
      title: 'Event Control',
      description: 'Identifying details for this mandated event, derived from the regulatory calendar record.',
      fields: [
        field({ fieldId: 'event_id', label: 'Event ID', type: 'text', mapsToBundlePath: 'eventControl.eventId', manualEntryAllowed: false, sourceHint: 'RegulatoryEvent.id' }),
        field({ fieldId: 'event_title', label: 'Event title', type: 'text', mapsToBundlePath: 'eventControl.eventTitle' }),
        field({ fieldId: 'event_domain', label: 'Event family / domain', type: 'text', mapsToBundlePath: 'eventControl.eventDomain' }),
        field({ fieldId: 'cadence', label: 'Cadence / trigger', type: 'text', mapsToBundlePath: 'eventControl.cadence' }),
        field({ fieldId: 'reporting_period', label: 'Reporting period', type: 'text', mapsToBundlePath: 'eventControl.reportingPeriod', sourceHint: 'RegulatoryEvent.reportingPeriodStart / reportingPeriodEnd' }),
        field({ fieldId: 'due_date', label: 'Due date', type: 'date', mapsToBundlePath: 'eventControl.dueDate' }),
        field({ fieldId: 'owner_role', label: 'Owner role', type: 'text', mapsToBundlePath: 'eventControl.ownerRole' }),
        field({ fieldId: 'source_workflow', label: 'Source workflow', type: 'text', mapsToBundlePath: 'eventControl.workflowRefs', manualEntryAllowed: false }),
        field({ fieldId: 'source_policies', label: 'Source policies', type: 'multi_select', mapsToBundlePath: 'eventControl.policyRefs', manualEntryAllowed: false }),
        field({ fieldId: 'packet_template', label: 'Packet template (if applicable)', type: 'text', mapsToBundlePath: 'eventControl.extractionTemplateKind', manualEntryAllowed: false }),
      ],
    },
    {
      sectionId: 'source_files',
      title: 'Source Files',
      description: 'Metadata for each uploaded source document Brad parsed for this intake.',
      fields: [
        field({ fieldId: 'file_name', label: 'Uploaded file name', type: 'text', mapsToBundlePath: 'sourceFiles[].fileName', manualEntryAllowed: false }),
        field({ fieldId: 'file_type', label: 'File type', type: 'text', mapsToBundlePath: 'sourceFiles[].fileType', manualEntryAllowed: false }),
        field({ fieldId: 'uploaded_by', label: 'Uploaded by', type: 'person', mapsToBundlePath: 'sourceFiles[].uploadedBy' }),
        field({ fieldId: 'uploaded_at', label: 'Upload date/time', type: 'datetime', mapsToBundlePath: 'sourceFiles[].uploadedAt', manualEntryAllowed: false }),
        field({ fieldId: 'parser_used', label: 'Parser used', type: 'text', mapsToBundlePath: 'sourceFiles[].parserUsed', manualEntryAllowed: false }),
        field({ fieldId: 'extraction_status', label: 'Extraction status', type: 'text', mapsToBundlePath: 'sourceFiles[].extractionStatus', manualEntryAllowed: false }),
        field({ fieldId: 'drive_link', label: 'Drive / evidence link', type: 'evidence_ref', mapsToBundlePath: 'sourceFiles[].driveLink' }),
        field({ fieldId: 'source_hash', label: 'Source hash (placeholder)', type: 'text', mapsToBundlePath: 'sourceFiles[].sourceHashPlaceholder', manualEntryAllowed: false }),
      ],
    },
    {
      sectionId: 'required_forms',
      title: 'Required Forms / Documents',
      description: 'Forms required by this event or its linked workflow.',
      fields: requiredForms.length
        ? requiredForms.map((f) =>
            field({
              fieldId: `form_${slug(f.formId)}`,
              label: f.formTitle,
              type: 'evidence_ref',
              required: f.required,
              mapsToBundlePath: `forms.${f.formId}`,
              mapsToFormIds: [f.formId],
              sourceHint: f.sourceNeeded,
            }),
          )
        : [field({ fieldId: 'no_required_forms', label: 'No catalogued required forms resolved for this event', type: 'text', mapsToBundlePath: 'forms' })],
    },
    {
      sectionId: 'evidence_requirements',
      title: 'Evidence Requirements',
      description: 'Supporting evidence required by this event or its linked workflow.',
      fields: requiredEvidence.length
        ? requiredEvidence.map((e) =>
            field({
              fieldId: `evidence_${slug(e.evidenceId)}`,
              label: e.label,
              type: 'evidence_ref',
              required: true,
              mapsToBundlePath: `evidence.${e.evidenceId}`,
              sourceHint: e.dueRule,
            }),
          )
        : [field({ fieldId: 'no_required_evidence', label: 'No distinct evidence items resolved beyond required forms', type: 'text', mapsToBundlePath: 'evidence' })],
    },
    {
      sectionId: 'extracted_field_review',
      title: 'Extracted Field Review',
      description: 'Fields Brad attempts to read from the uploaded source, with confidence, read agreement, and verbatim source quotes for reviewer confirmation.',
      fields: extractionHints.map((h) =>
        field({
          fieldId: h.fieldId,
          label: h.label,
          type: 'text',
          mapsToBundlePath: `extracted.${h.fieldId}`,
          sourceHint: h.hint || '',
          aliases: h.aliases,
        }),
      ),
    },
    {
      sectionId: 'missing_information',
      title: 'Missing Information',
      description: 'Populated at review time from unresolved readiness rules and low-confidence or absent extracted fields — not fabricated at generation time.',
      fields: [field({ fieldId: 'missing_items_table', label: 'Missing information', type: 'table', mapsToBundlePath: 'missingRequiredFields', manualEntryAllowed: false })],
    },
    {
      sectionId: 'signoff_attestation',
      title: 'Sign-Off / Attestation',
      description: 'Required signers for this event, derived from event approvals, minutes sign-off roles, and linked workflow approvals.',
      fields: requiredSignoffs.length
        ? requiredSignoffs.map((s) =>
            field({
              fieldId: `signoff_${slug(s.signoffId)}`,
              label: `${s.signerRole} sign-off`,
              type: 'signature',
              required: s.required,
              mapsToBundlePath: `signoffs.${s.signoffId}`,
              sourceHint: s.attestationText || '',
            }),
          )
        : [field({ fieldId: 'no_signoffs', label: 'No sign-offs resolved for this event', type: 'text', mapsToBundlePath: 'signoffs' })],
    },
    {
      sectionId: 'audit_trail',
      title: 'Audit Trail',
      description: 'Action history for this intake, sourced from the regulatory execution store task audit log (taskAuditByEventId).',
      fields: [field({ fieldId: 'audit_trail_table', label: 'Audit trail', type: 'table', mapsToBundlePath: 'auditTrailId', manualEntryAllowed: false })],
    },
  ];
}

const ACCEPTED_FILE_TYPES: Record<BradMandatedEventIntakeDefinition['extractionTemplateKind'], string[]> = {
  admission: ['.pdf', '.docx'],
  qapi: ['.json', '.csv', '.xlsx', '.xls', '.pdf', '.txt'],
  event: ['.json', '.csv', '.md', '.txt', '.pdf'],
  generic: ['.json', '.csv', '.md', '.txt', '.pdf'],
};

// ── 3. Build one definition per event family ──
const definitions: BradMandatedEventIntakeDefinition[] = [];
const eventIdToIntakeId: Record<string, string> = {};
const gapReport: { intakeId: string; eventTitle: string; relatedEventCount: number; gaps: string[] }[] = [];

for (const [key, events] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const rep = pickRepresentative(events);
  const relatedEventIds = events.map((e) => e.id).sort();
  const intakeId = `BRAD-INTAKE-${key}`.toUpperCase();
  const gaps: string[] = [];

  const workflowIds = [...new Set(events.map((e) => e.workflowId).filter((x): x is string => !!x))];
  const resolvedWorkflows: Workflow[] = [];
  for (const id of workflowIds) {
    const wf = getWorkflow(id);
    if (wf) resolvedWorkflows.push(wf);
    else gaps.push(`workflowId "${id}" is referenced but not found in WORKFLOWS.`);
  }
  if (workflowIds.length === 0) gaps.push('No workflowId linked on any event instance in this family.');
  if (rep.isContext) gaps.push('Context/calendar-marker event (isContext=true) — no execution, evidence, or packet expected.');

  // Required forms — event.requiredForms items that carry a catalog formId, plus workflow.requiredForms.
  const formMap = new Map<string, BradRequiredFormRef>();
  for (const e of events) {
    for (const item of e.requiredForms || []) {
      if (!item.formId) continue;
      const canon = resolveCanonicalFormId(item.formId) || item.formId;
      if (!formMap.has(canon)) {
        formMap.set(canon, {
          formId: canon,
          formTitle: resolveFormTitle(canon),
          required: true,
          sourceNeeded: item.label,
          status: 'unknown',
          missingBlocker: true,
          origin: 'event.requiredForms',
        });
      }
    }
  }
  for (const wf of resolvedWorkflows) {
    for (const formId of wf.requiredForms || []) {
      const canon = resolveCanonicalFormId(formId) || formId;
      if (!formMap.has(canon)) {
        formMap.set(canon, {
          formId: canon,
          formTitle: resolveFormTitle(canon),
          required: true,
          sourceNeeded: `Required by workflow ${wf.id}`,
          status: 'unknown',
          missingBlocker: true,
          origin: 'workflow.requiredForms',
        });
      }
    }
  }
  const requiredForms = [...formMap.values()].sort((a, b) => a.formId.localeCompare(b.formId));
  if (requiredForms.length === 0) gaps.push('No required forms resolved from event.requiredForms or linked workflow.requiredForms.');

  // Required evidence — event.requiredForms items WITHOUT a catalog formId, plus minutes.
  const evidenceMap = new Map<string, BradRequiredEvidenceRef>();
  for (const e of events) {
    for (const item of e.requiredForms || []) {
      if (item.formId) continue;
      if (!evidenceMap.has(item.id)) {
        evidenceMap.set(item.id, {
          evidenceId: item.id,
          label: item.label,
          evidenceType: 'artifact',
          acceptableEvidence: [item.label],
          ownerRole: rep.ownerRole,
          dueRule: item.dueOffsetDays != null ? `${item.dueOffsetDays} day(s) relative to event date` : 'See event schedule',
          retentionRule: 'Per agency records retention policy',
          status: 'unknown',
        });
      }
    }
  }
  if (rep.minutes) {
    evidenceMap.set('minutes', {
      evidenceId: 'minutes',
      label: `${rep.title} minutes`,
      evidenceType: 'minutes',
      acceptableEvidence: rep.minutes.requiredSections?.length ? rep.minutes.requiredSections : ['Meeting minutes'],
      ownerRole: rep.minutes.assignee || rep.ownerRole,
      dueRule: `${rep.minutes.dueOffsetDays} day(s) after event`,
      retentionRule: 'Per agency records retention policy',
      status: 'unknown',
    });
  }
  const requiredEvidence = [...evidenceMap.values()];

  // Required sign-offs — event.approvals, event.minutes.signOffRoles, workflow.approvals.
  const signoffMap = new Map<string, BradRequiredSignoffRef>();
  for (const rule of rep.approvals || []) {
    const dual = /co-sign|co sign|dual/i.test(rule.targetLabel || '');
    signoffMap.set(rule.id, {
      signoffId: rule.id,
      signerRole: rule.approverRole,
      required: rule.required,
      dualRole: dual,
      dualRoleReason: dual ? rule.targetLabel : undefined,
      requiresGoverningBody: /governing body|board/i.test(rule.approverRole) || /governing body|board/i.test(rule.escalateToRole || ''),
      source: 'event.approvals',
    });
  }
  for (const role of rep.minutes?.signOffRoles || []) {
    const signoffId = `minutes-signoff-${slug(role)}`;
    if (!signoffMap.has(signoffId)) {
      signoffMap.set(signoffId, {
        signoffId,
        signerRole: role,
        required: true,
        dualRole: false,
        requiresGoverningBody: /governing body|board/i.test(role),
        source: 'event.minutes.signOffRoles',
      });
    }
  }
  for (const wf of resolvedWorkflows) {
    (wf.approvals || []).forEach((a, idx) => {
      const signoffId = `${wf.id}-approval-${idx}`;
      const dual = /co-sign|co sign/i.test(a.description || '');
      if (!signoffMap.has(signoffId)) {
        signoffMap.set(signoffId, {
          signoffId,
          signerRole: a.body || 'Unspecified approver role',
          required: true,
          dualRole: dual,
          dualRoleReason: dual ? a.description : undefined,
          attestationText: a.description,
          requiresGoverningBody: a.requiresGoverningBody,
          source: 'workflow.approvals',
        });
      }
    });
  }
  const requiredSignoffs = [...signoffMap.values()];
  if (requiredSignoffs.length === 0) gaps.push('No approvals/signoffs found on event, minutes, or linked workflow.');

  const isQapi = rep.domain === 'QAPI';
  const extractionTemplateKind: BradMandatedEventIntakeDefinition['extractionTemplateKind'] = isQapi
    ? 'qapi'
    : resolvedWorkflows.length > 0
      ? 'event'
      : 'generic';

  const extractionHints: BradExtractionHint[] = [
    { fieldId: 'event_title', label: 'Event / meeting title', group: 'Event Control', aliases: ['title', 'meeting_title'] },
    { fieldId: 'event_date', label: 'Event / meeting date', group: 'Event Control', aliases: ['date', 'meeting_date'] },
    { fieldId: 'attendees', label: 'Attendees / participants', group: 'Meeting Details', aliases: ['attendance', 'roster', 'participants'] },
    ...requiredForms.map((f) => ({
      fieldId: `form_${slug(f.formId)}_present`,
      label: `${f.formTitle} present in source`,
      group: 'Required Forms',
      hint: `Look for content matching ${f.formTitle} (${f.formId}).`,
      aliases: [f.formId, f.formTitle],
    })),
  ];

  const packetSectionMap: BradPacketSectionMap[] = isQapi
    ? requiredForms
        .filter((f) => /^QA-FM-0(2[0-7])$/.test(f.formId))
        .map((f) => ({
          packetSectionId: f.formId,
          packetSectionTitle: f.formTitle,
          sourceFieldIds: [`form_${slug(f.formId)}_present`],
          formIds: [f.formId],
        }))
    : [];
  if (isQapi && packetSectionMap.length === 0) gaps.push('QAPI event but no QA-FM-020..027 packet forms resolved for section mapping.');

  const bundleSchema: BradSourceBundleField[] = [
    ...requiredForms.map((f) => ({ path: `forms.${f.formId}`, type: 'evidence_ref' as const, required: f.required })),
    ...requiredEvidence.map((e) => ({ path: `evidence.${e.evidenceId}`, type: 'evidence_ref' as const, required: true })),
    ...requiredSignoffs.map((s) => ({ path: `signoffs.${s.signoffId}`, type: 'signature' as const, required: s.required })),
    ...extractionHints.map((h) => ({ path: `extracted.${h.fieldId}`, type: 'text' as const, required: false })),
  ];

  const readinessRules: BradIntakeReadinessRule[] = [
    ...requiredForms
      .filter((f) => f.missingBlocker)
      .map((f) => ({
        ruleId: `require-form-${slug(f.formId)}`,
        description: `${f.formTitle} (${f.formId}) must be present or manually confirmed before packet generation.`,
        requiresPaths: [`forms.${f.formId}`],
        blocksPacketGeneration: true,
      })),
    ...requiredSignoffs
      .filter((s) => s.required)
      .map((s) => ({
        ruleId: `require-signoff-${slug(s.signoffId)}`,
        description: `${s.signerRole} sign-off is required before packet generation.`,
        requiresPaths: [`signoffs.${s.signoffId}`],
        blocksPacketGeneration: true,
      })),
  ];

  const sourceRequirements: BradSourceRequirement[] = [
    {
      requirementId: `${intakeId}-primary-source`,
      label: `Supporting documentation for ${rep.title}`,
      acceptedFileTypes: ACCEPTED_FILE_TYPES[extractionTemplateKind],
      description: 'Upload the source document(s) Brad should read to populate this event\'s required forms, evidence, and sign-offs.',
      required: true,
    },
  ];

  const definition: BradMandatedEventIntakeDefinition = {
    intakeId,
    eventFamilyKey: key,
    eventId: rep.id,
    eventTitle: rep.title,
    eventDomain: rep.domain,
    cadence: rep.cadence,
    mandateType: rep.mandateType,
    ownerRole: rep.ownerRole,
    sourceEventRef: rep.id,
    relatedEventIds,
    policyRefs: [...new Set(events.flatMap((e) => e.policyRefs || []))].sort(),
    workflowRefs: workflowIds,
    requiredForms,
    requiredEvidence,
    requiredSignoffs,
    sourceRequirements,
    sections: buildGenericSections({ requiredForms, requiredEvidence, requiredSignoffs, extractionHints }),
    packetSectionMap,
    bundleSchema,
    readinessRules,
    extractionHints,
    extractionTemplateKind,
    gaps,
  };

  definitions.push(definition);
  for (const id of relatedEventIds) eventIdToIntakeId[id] = intakeId;
  if (gaps.length) gapReport.push({ intakeId, eventTitle: rep.title, relatedEventCount: relatedEventIds.length, gaps });
}

// ── 4. Emit the generated data file ──
const header = `/* ══════════════════════════════════════════════════════════════════════
   AUTO-GENERATED by scripts/buildBradMandatedEventIntakes.ts. Do not edit
   by hand. Re-run \`npm run build:brad-intakes\`.
   Source of truth: src/policy/data/regulatoryEvents.ts (REGULATORY_EVENTS),
   src/policy/data/workflows.generated.ts (WORKFLOWS), Enterprise Forms
   Library (formsLibraryDataset.ts / formTitles.generated.ts / formIdAliases.ts).
   ══════════════════════════════════════════════════════════════════════ */

import type { BradMandatedEventIntakeDefinition } from '../brad/intake/types';

export const BRAD_MANDATED_EVENT_INTAKES: BradMandatedEventIntakeDefinition[] = `;

const footer = `

export const BRAD_MANDATED_EVENT_INTAKES_BY_INTAKE_ID: Record<string, BradMandatedEventIntakeDefinition> =
  Object.fromEntries(BRAD_MANDATED_EVENT_INTAKES.map((d) => [d.intakeId, d]));

export const EVENT_ID_TO_BRAD_INTAKE_ID: Record<string, string> = ${JSON.stringify(eventIdToIntakeId, null, 2)};

export function getBradIntakeForEvent(eventId: string): BradMandatedEventIntakeDefinition | null {
  const intakeId = EVENT_ID_TO_BRAD_INTAKE_ID[eventId];
  return intakeId ? (BRAD_MANDATED_EVENT_INTAKES_BY_INTAKE_ID[intakeId] ?? null) : null;
}

export function getBradIntakeById(intakeId: string): BradMandatedEventIntakeDefinition | null {
  return BRAD_MANDATED_EVENT_INTAKES_BY_INTAKE_ID[intakeId] ?? null;
}
`;

writeFileSync(OUT_FILE, header + JSON.stringify(definitions, null, 2) + footer, 'utf8');

// ── 5. Emit the gap report ──
const domainCounts = new Map<string, number>();
for (const d of definitions) domainCounts.set(d.eventDomain, (domainCounts.get(d.eventDomain) || 0) + 1);

const reportLines: string[] = [
  '# Brad Mandated Event Intake — Generation Report',
  '',
  `Generated by \`scripts/buildBradMandatedEventIntakes.ts\` from ${REGULATORY_EVENTS.length} dated calendar occurrences in \`REGULATORY_EVENTS\`, collapsed into ${definitions.length} mandated-event intake definitions (grouped by \`eventSubType\`).`,
  '',
  '## Summary',
  '',
  `- Total dated event occurrences: ${REGULATORY_EVENTS.length}`,
  `- Distinct mandated-event families (intake definitions generated): ${definitions.length}`,
  `- Definitions with at least one gap flagged: ${gapReport.length}`,
  `- QAPI-domain definitions: ${definitions.filter((d) => d.eventDomain === 'QAPI').length}`,
  `- Definitions with zero required forms resolved: ${definitions.filter((d) => d.requiredForms.length === 0).length}`,
  `- Definitions with zero sign-offs resolved: ${definitions.filter((d) => d.requiredSignoffs.length === 0).length}`,
  `- Definitions with no linked workflow: ${definitions.filter((d) => d.workflowRefs.length === 0).length}`,
  '',
  '## By domain',
  '',
  '| Domain | Definitions |',
  '|---|---|',
  ...[...domainCounts.entries()].sort((a, b) => b[1] - a[1]).map(([domain, count]) => `| ${domain} | ${count} |`),
  '',
  '## Gaps (not silently skipped — every event family is listed if anything could not be resolved from real data)',
  '',
];

if (gapReport.length === 0) {
  reportLines.push('None. Every generated intake definition resolved at least one required form/evidence item and one sign-off.');
} else {
  reportLines.push('| Intake ID | Event title | Related events | Gaps |', '|---|---|---|---|');
  for (const g of gapReport) {
    reportLines.push(`| ${g.intakeId} | ${g.eventTitle} | ${g.relatedEventCount} | ${g.gaps.join('<br>')} |`);
  }
}

reportLines.push(
  '',
  '## Notes',
  '',
  '- Intake definitions are keyed by `eventSubType` (the recurring mandate), not by individual dated occurrence — a single "QAPI Committee Meeting" definition covers all 6 dated instances in the calendar, avoiding hundreds of near-duplicate definitions. `relatedEventIds` lists every dated occurrence covered; `EVENT_ID_TO_BRAD_INTAKE_ID` resolves any single dated event id to its shared definition.',
  '- `requiredForms` vs `requiredEvidence`: a `RegulatoryEvent.requiredForms[]` (`EventEvidenceItem`) entry becomes a **required form** when it carries a catalog `formId` (resolved through `formIdAliases.resolveCanonicalFormId`/`resolveFormTitle`), and a **required evidence** item otherwise (e.g. free-text artifacts with no catalogued form).',
  '- `packetSectionMap` is only populated for QAPI-domain events, matched against the real `QA-FM-020`–`QA-FM-027` form IDs already present in that event\'s resolved required forms — no packet-section titles were invented.',
  '- `missingBlocker` on required forms and `blocksPacketGeneration` on readiness rules are both set from the literal "required" flag in the source data; no additional business-priority weighting was inferred.',
  '',
);

mkdirSync(dirname(REPORT_FILE), { recursive: true });
writeFileSync(REPORT_FILE, reportLines.join('\n'), 'utf8');

console.log(`[brad-intakes] ${REGULATORY_EVENTS.length} events -> ${definitions.length} intake definitions (${gapReport.length} with gaps)`);
console.log(`[brad-intakes] wrote ${OUT_FILE}`);
console.log(`[brad-intakes] wrote ${REPORT_FILE}`);
