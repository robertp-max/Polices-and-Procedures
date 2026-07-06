import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { log } from './logger.js';
import { extractPdf } from './pdfText.js';
import { extractFieldsFromSource, type FieldSpec, type SourceExtractionResult } from './sourceExtraction.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Source pipeline — verification-first, read-only ingest for packet generation.

   classify -> extract text/fields -> read source 3x (Brad, no invention) ->
   reconcile -> persist source + extraction sidecar (with source metadata).

   Outputs (local, repo `output/`):
     output/sources/<sourceId>/<original file>        the raw source (the "source folder")
     output/mock_assessments/<sourceId>.extraction.json  field map + metadata + validation

   Drive upload of the source (Drive ID/URL) is layered on in the Drive phase;
   01_CES stays locked, sources go to a dedicated "Sources" area, never invented.
   ═══════════════════════════════════════════════════════════════════════════ */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_ROOT = path.join(REPO_ROOT, 'output');
const SOURCES_DIR = path.join(OUTPUT_ROOT, 'sources');
const EXTRACTIONS_DIR = path.join(OUTPUT_ROOT, 'mock_assessments');

export type PacketTemplateKind = 'admission' | 'qapi' | 'event' | 'generic';

/** Required packet fields per template (drives the extraction targets). */
export const TEMPLATE_FIELD_SPECS: Record<PacketTemplateKind, FieldSpec[]> = {
  admission: [
    // Patient
    { key: 'patient_name', label: 'Patient full legal name', group: 'Patient' },
    { key: 'date_of_birth', label: 'Patient date of birth', group: 'Patient' },
    { key: 'medical_record', label: 'Medical record number (MRN)', group: 'Patient' },
    { key: 'address', label: 'Patient address / address of service', group: 'Patient' },
    { key: 'phone', label: 'Patient phone', group: 'Patient' },
    { key: 'county', label: 'County of residence', group: 'Patient' },
    // Admission / Physician
    { key: 'start_of_care', label: 'Start of care date', group: 'Admission / Physician' },
    { key: 'primary_physician', label: 'Primary / ordering physician', group: 'Admission / Physician' },
    { key: 'physician_phone', label: 'Physician phone', group: 'Admission / Physician' },
    { key: 'physician_fax', label: 'Physician fax', group: 'Admission / Physician' },
    { key: 'admitting_clinician', label: 'Admitting clinician', group: 'Admission / Physician' },
    { key: 'f2f_date', label: 'Face-to-face encounter date', group: 'Admission / Physician' },
    // Diagnosis / Clinical
    { key: 'diagnosis', label: 'Primary diagnosis', group: 'Diagnosis / Clinical' },
    // Services Ordered
    { key: 'services_ordered', label: 'Services ordered (disciplines and frequency)', group: 'Services Ordered' },
    // Payer / Billing Route
    { key: 'payer', label: 'Payer / insurance', hint: 'e.g. Medicare, Medi-Cal, Private Pay', group: 'Payer / Billing Route' },
    { key: 'payer_id', label: 'Policy / member / plan ID number', group: 'Payer / Billing Route' },
    // Representative / Legal Authority
    { key: 'representative_name', label: 'Authorized representative / conservator name', group: 'Representative / Legal Authority' },
    { key: 'representative_relationship', label: 'Relationship to patient', group: 'Representative / Legal Authority' },
    { key: 'legal_authority', label: 'Legal authority (POA, conservator, court order)', group: 'Representative / Legal Authority' },
    // Emergency Preparedness
    { key: 'emergency_contact_name', label: 'Primary emergency contact name', group: 'Emergency Preparedness' },
    { key: 'emergency_contact_phone', label: 'Primary emergency contact phone', group: 'Emergency Preparedness' },
    // Interpreter / Language
    { key: 'primary_language', label: 'Primary language', group: 'Interpreter / Language' },
    { key: 'interpreter_needed', label: 'Interpreter needed (yes/no + language)', group: 'Interpreter / Language' },
    // Advance Directives
    { key: 'advance_directive_status', label: 'Advance directive status (AHCD / POLST / DNR)', group: 'Advance Directives' },
  ],
  // Grouped per the Brad mandated-event QAPI intake sections (Meeting Details /
  // Census / High-Risk Rollup / Adverse Events / PIP / Chart Audit / Infection
  // Control / Medication Safety — see src/policy/brad/intake/adapters/
  // qapiIntakeAdapter.ts). This widens what Brad's 3x-read looks for beyond the
  // 5 original stub fields; the adapter's deterministic ClinicalDump/heuristic
  // paths still run independently and do not depend on these exact keys.
  qapi: [
    { key: 'event_title', label: 'QAPI event / meeting title', group: 'Meeting Details' },
    { key: 'event_date', label: 'Meeting date', group: 'Meeting Details' },
    { key: 'meeting_location', label: 'Meeting location', group: 'Meeting Details' },
    { key: 'chair', label: 'Committee chair', group: 'Meeting Details' },
    { key: 'attendees', label: 'Committee attendees / roster', group: 'Meeting Details' },
    { key: 'quorum_status', label: 'Quorum status', group: 'Meeting Details' },
    { key: 'active_census', label: 'Active census count', group: 'Census / Population' },
    { key: 'discharged_count', label: 'Discharged count this period', group: 'Census / Population' },
    { key: 'admissions_count', label: 'Admissions during period', group: 'Census / Population' },
    { key: 'recert_count', label: 'Recertification count', group: 'Census / Population' },
    { key: 'high_acuity_count', label: 'High-acuity patient count', group: 'Census / Population' },
    { key: 'high_risk_flags', label: 'High-risk flags (fall/infection/wound/anticoagulant/oxygen/catheter/cognitive/polypharmacy)', group: 'High-Risk Rollup' },
    { key: 'overloaded_clinician_count', label: 'Overloaded clinician assignment count', group: 'High-Risk Rollup' },
    { key: 'clinician_pip_or_license_flags', label: 'Clinician PIP / expired license / pending termination flags', group: 'High-Risk Rollup' },
    { key: 'hospitalizations', label: 'Hospitalizations total', group: 'Adverse Events' },
    { key: 'falls_total', label: 'Falls total / falls with injury / unreported falls', group: 'Adverse Events' },
    { key: 'infections_total', label: 'Infections total (wound / CAUTI / UTI)', group: 'Adverse Events' },
    { key: 'medication_events', label: 'Medication events total / unreported', group: 'Adverse Events' },
    { key: 'critical_lab_events', label: 'Critical lab events / physician-notification failures', group: 'Adverse Events' },
    { key: 'kpis', label: 'KPIs / quality indicators reviewed', group: 'QAPI Dashboard' },
    { key: 'pips', label: 'Performance improvement projects (PIPs) — trigger, status, remeasurement', group: 'PIP / Corrective Action' },
    { key: 'corrective_actions', label: 'Corrective actions required / owner / due date', group: 'PIP / Corrective Action' },
    { key: 'late_documentation', label: 'Late documentation / missing recert / unsigned orders', group: 'Chart Audit' },
    { key: 'oasis_concerns', label: 'OASIS concerns / med reconciliation missing / POC not updated', group: 'Chart Audit' },
    { key: 'hha_supervision_gap', label: 'HHA supervision gap', group: 'Chart Audit' },
    { key: 'infection_line_list', label: 'Infection line list / culture obtained / reported / escalation status', group: 'Infection Control' },
    { key: 'medication_safety_gaps', label: 'Medication safety gaps (critical INR/lab, insulin error, physician notified)', group: 'Medication Safety' },
    { key: 'complaints', label: 'Patient complaints summary', group: 'Complaints' },
  ],
  event: [
    { key: 'event_title', label: 'Event title' },
    { key: 'event_date', label: 'Event date' },
    { key: 'event_id', label: 'Event ID' },
  ],
  generic: [
    { key: 'title', label: 'Document title' },
    { key: 'date', label: 'Document date' },
  ],
};

export interface SourceMetadata {
  sourceId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  contentHash: string;          // sha256 of bytes
  format: 'pdf' | 'text' | 'unknown';
  pageCount?: number;
  charCount?: number;
  hasText?: boolean;
  localPath: string;            // saved raw source path
  extractionPath: string;       // saved sidecar path
  driveFileId: string | null;   // populated when uploaded to Drive (Drive phase)
  driveUrl: string | null;
  createdAtNote: string;        // caller-supplied timestamp (Date.now() unavailable here)
}

export interface SourcePipelineResult {
  template: PacketTemplateKind;
  metadata: SourceMetadata;
  extraction: SourceExtractionResult;
}

function ensureDirs() {
  for (const d of [SOURCES_DIR, EXTRACTIONS_DIR]) fs.mkdirSync(d, { recursive: true });
}
const sanitize = (n: string) => (n || 'source').replace(/[^\w.\-]+/g, '_').slice(0, 120);

/**
 * Ingest one uploaded source: extract its content, read it 3x via Brad to map
 * the selected template's fields (no invention), and persist the raw source plus
 * an extraction sidecar carrying full source→field mapping + metadata.
 */
export async function ingestSource(input: {
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  template: PacketTemplateKind;
  nowISO: string;            // caller stamps the time (no clock in pure layers)
}): Promise<SourcePipelineResult> {
  ensureDirs();
  const contentHash = createHash('sha256').update(input.bytes).digest('hex');
  const sourceId = contentHash.slice(0, 16);
  const safe = sanitize(input.fileName);
  const isPdf = input.mimeType === 'application/pdf' || /\.pdf$/i.test(input.fileName) || (input.bytes[0] === 0x25 && input.bytes[1] === 0x50);

  let text = '', formFields: Record<string, string> = {}, format: SourceMetadata['format'] = 'unknown';
  let pageCount: number | undefined, charCount: number | undefined, hasText: boolean | undefined;
  if (isPdf) {
    const pdf = await extractPdf(input.bytes);
    text = pdf.text; formFields = pdf.formFields; format = 'pdf';
    pageCount = pdf.pageCount; charCount = pdf.charCount; hasText = pdf.hasText;
  } else {
    text = input.bytes.toString('utf8'); format = 'text';
    charCount = text.length; hasText = text.trim().length > 0;
  }

  const specs = TEMPLATE_FIELD_SPECS[input.template] ?? TEMPLATE_FIELD_SPECS.generic;
  const extraction = await extractFieldsFromSource(specs, text, formFields);

  // Persist the raw source into the sources folder.
  const sourceDir = path.join(SOURCES_DIR, sourceId);
  fs.mkdirSync(sourceDir, { recursive: true });
  const localPath = path.join(sourceDir, safe);
  fs.writeFileSync(localPath, input.bytes);

  const extractionPath = path.join(EXTRACTIONS_DIR, `${sourceId}.extraction.json`);
  const metadata: SourceMetadata = {
    sourceId, fileName: input.fileName, mimeType: input.mimeType, byteSize: input.bytes.length,
    contentHash, format, pageCount, charCount, hasText,
    localPath, extractionPath, driveFileId: null, driveUrl: null, createdAtNote: input.nowISO,
  };
  fs.writeFileSync(extractionPath, JSON.stringify({ template: input.template, metadata, extraction }, null, 2), 'utf8');
  log.info('source.ingest.ok', { sourceId, template: input.template, format, engine: extraction.engine, filled: extraction.fields.filter((f) => f.value && !f.needsReview).length, needsReview: extraction.missing.length });

  return { template: input.template, metadata, extraction };
}
