/* ═══════════════════════════════════════════════════════════════════════════
   Brad Mandated Event Intake — data model.

   One BradMandatedEventIntakeDefinition describes HOW to collect and verify
   the source evidence for a family of mandated events (e.g. "QAPI Committee
   Meeting", recurring monthly) — derived from the event/workflow/form data
   already in the repo (see scripts/buildBradMandatedEventIntakes.ts), never
   hand-authored per event.

   A BradConfirmedSourceBundle is the reviewed, user-confirmed output of one
   intake pass against one or more uploaded source files for one dated event
   instance. Packet generation consumes the confirmed bundle — never a raw
   upload directly. This mirrors the existing Patient Admission Packet
   extraction/review pattern (server/sourceExtraction.ts + sourcePipeline.ts +
   Defensible2StudioLanding.tsx review step), generalized to every mandated
   event via a data-driven definition instead of hand-authored per-template UI.
   ═══════════════════════════════════════════════════════════════════════════ */

export type BradIntakeFieldType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multi_select'
  | 'table'
  | 'person'
  | 'signature'
  | 'evidence_ref'
  | 'derived_metric';

export interface BradRequiredFormRef {
  formId: string;
  formTitle: string;
  required: boolean;
  sourceNeeded: string;
  status: 'unknown' | 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
  missingBlocker: boolean;
  /** Where this form reference came from — for the gap report, not display. */
  origin: 'event.requiredForms' | 'workflow.requiredForms' | 'workflow.step';
}

export interface BradRequiredEvidenceRef {
  evidenceId: string;
  label: string;
  evidenceType: string;
  acceptableEvidence: string[];
  ownerRole: string;
  dueRule: string;
  retentionRule: string;
  status: 'unknown' | 'missing' | 'pending' | 'in-progress' | 'complete';
}

export interface BradRequiredSignoffRef {
  signoffId: string;
  signerRole: string;
  required: boolean;
  dualRole: boolean;
  dualRoleReason?: string;
  attestationText?: string;
  requiresGoverningBody: boolean;
  source: 'event.approvals' | 'event.minutes.signOffRoles' | 'workflow.approvals';
}

export interface BradSourceRequirement {
  requirementId: string;
  label: string;
  acceptedFileTypes: string[];
  description: string;
  required: boolean;
}

export interface BradIntakeField {
  fieldId: string;
  label: string;
  type: BradIntakeFieldType;
  required: boolean;
  sourceHint: string;
  aliases: string[];
  confidenceThreshold: number;
  manualEntryAllowed: boolean;
  mapsToBundlePath: string;
  mapsToFormIds: string[];
  mapsToPacketSections: string[];
  validation?: string;
}

export interface BradIntakeSection {
  sectionId:
    | 'event_control'
    | 'source_files'
    | 'required_forms'
    | 'evidence_requirements'
    | 'extracted_field_review'
    | 'missing_information'
    | 'signoff_attestation'
    | 'audit_trail'
    | string;
  title: string;
  description: string;
  fields: BradIntakeField[];
}

export interface BradPacketSectionMap {
  packetSectionId: string;
  packetSectionTitle: string;
  sourceFieldIds: string[];
  formIds: string[];
}

export interface BradSourceBundleField {
  path: string;
  type: BradIntakeFieldType;
  required: boolean;
}

export interface BradIntakeReadinessRule {
  ruleId: string;
  description: string;
  /** Bundle field paths (BradSourceBundleField.path) that must be present/confirmed for this rule to pass. */
  requiresPaths: string[];
  blocksPacketGeneration: boolean;
}

export interface BradExtractionHint {
  fieldId: string;
  label: string;
  hint?: string;
  group?: string;
  aliases: string[];
}

export interface BradMandatedEventIntakeDefinition {
  intakeId: string;
  /** Stable "event family" key events are grouped by (RegulatoryEvent.eventSubType, or a normalized fallback). */
  eventFamilyKey: string;
  eventId: string;
  eventTitle: string;
  eventDomain: string;
  cadence?: string;
  mandateType?: string;
  ownerRole?: string;
  sourceEventRef: string;
  /** All dated RegulatoryEvent ids that share this intake definition's event family. */
  relatedEventIds: string[];
  policyRefs: string[];
  workflowRefs: string[];
  requiredForms: BradRequiredFormRef[];
  requiredEvidence: BradRequiredEvidenceRef[];
  requiredSignoffs: BradRequiredSignoffRef[];
  sourceRequirements: BradSourceRequirement[];
  sections: BradIntakeSection[];
  packetSectionMap: BradPacketSectionMap[];
  bundleSchema: BradSourceBundleField[];
  readinessRules: BradIntakeReadinessRule[];
  extractionHints: BradExtractionHint[];
  /** Template key used against server TEMPLATE_FIELD_SPECS / SourceTemplateKind. */
  extractionTemplateKind: 'admission' | 'qapi' | 'event' | 'generic';
  /** True when the source event had no workflowId, or is a pure calendar/context marker (e.g. Holiday). */
  gaps: string[];
}

export interface BradSourceFileRef {
  fileId: string;
  fileName: string;
  fileType: string;
  uploadedBy?: string;
  uploadedAt?: string;
  parserUsed: 'brad-claude-3x' | 'text-fallback' | 'json' | 'csv' | 'tsv' | 'markdown' | 'pdf' | 'unknown';
  extractionStatus: 'pending' | 'parsed' | 'partial' | 'failed';
  driveLink?: string;
  sourceHashPlaceholder?: string;
}

export interface BradExtractionReviewValue {
  fieldId: string;
  extractedValue: unknown;
  confidence: number;
  readAgreement?: string;
  sourceQuotes: string[];
  sourceLocations: string[];
  conflictingReads: unknown[];
  reviewerValue?: unknown;
  reviewerStatus: 'accepted' | 'corrected' | 'manual_entry' | 'missing' | 'not_applicable';
  reviewerNotes?: string;
}

export interface BradConfirmedSourceBundle {
  bundleId: string;
  eventId: string;
  packetId?: string;
  intakeId: string;
  sourceFiles: BradSourceFileRef[];
  extractedValues: BradExtractionReviewValue[];
  confirmedValues: Record<string, unknown>;
  missingRequiredFields: string[];
  conflicts: string[];
  manualOverrides: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'draft' | 'needs_review' | 'confirmed' | 'blocked';
  auditTrailId?: string;
}

/** True only when every readiness rule that blocks generation is satisfied by confirmedValues. */
export function isBundleReadyForPacket(
  bundle: BradConfirmedSourceBundle,
  definition: BradMandatedEventIntakeDefinition,
): { ready: boolean; blockingMissing: string[] } {
  const blockingMissing = new Set<string>();
  for (const rule of definition.readinessRules) {
    if (!rule.blocksPacketGeneration) continue;
    for (const path of rule.requiresPaths) {
      const has = Object.prototype.hasOwnProperty.call(bundle.confirmedValues, path)
        && bundle.confirmedValues[path] !== null
        && bundle.confirmedValues[path] !== undefined
        && bundle.confirmedValues[path] !== '';
      const overridden = bundle.manualOverrides.includes(path);
      if (!has && !overridden) blockingMissing.add(path);
    }
  }
  return { ready: blockingMissing.size === 0, blockingMissing: [...blockingMissing] };
}
