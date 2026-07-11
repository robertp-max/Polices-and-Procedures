/**
 * Supplemental information contracts — §16.5, §17.3, FR-019.
 * Pure types only. Zero runtime side effects.
 */

/**
 * FR-019 classification options — 15 options, EXACT PRD strings.
 */
export const SUPPLEMENTAL_CLASSIFICATION_OPTIONS = [
  'Source evidence',
  'Corrected source data',
  'Supplemental evidence',
  'Meeting discussion',
  'Management explanation',
  'Reviewer note',
  'Packet narrative',
  'KPI input',
  'Finding response',
  'Corrective-action update',
  'Workflow update',
  'Signature/approval information',
  'Attachment',
  'Confidential personnel information',
  'Legal/privileged information',
] as const;

export type SupplementalClassification =
  (typeof SUPPLEMENTAL_CLASSIFICATION_OPTIONS)[number];

/**
 * FR-019 destination options — 12 options, EXACT PRD strings.
 */
export const SUPPLEMENTAL_DESTINATION_OPTIONS = [
  'Executive analysis',
  'Specific finding',
  'KPI',
  'Triggered workflow',
  'Action item',
  'Specific form',
  'New attachment',
  'Evidence index',
  'Confidential addendum',
  'Replace/correct value',
  'Reviewer note only',
  'Exclude from final packet',
] as const;

export type SupplementalDestination =
  (typeof SUPPLEMENTAL_DESTINATION_OPTIONS)[number];

/**
 * §17.3 Supplemental-information lifecycle states (machine identity, uppercase).
 * §16.5 stores lowercase lifecycleStatus on the item — both vocabularies are
 * exported; machine guards use the uppercase form.
 */
export type SupplementalLifecycleStatus =
  | 'RECEIVED'
  | 'CLASSIFIED'
  | 'MAPPED'
  | 'VALIDATED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'APPLIED';

/** §16.5 lowercase lifecycleStatus values. */
export type SupplementalItemLifecycleStatus =
  | 'received'
  | 'classified'
  | 'mapped'
  | 'validated'
  | 'accepted'
  | 'rejected'
  | 'applied';

export const SUPPLEMENTAL_LIFECYCLE_TO_ITEM: Readonly<
  Record<SupplementalLifecycleStatus, SupplementalItemLifecycleStatus>
> = {
  RECEIVED: 'received',
  CLASSIFIED: 'classified',
  MAPPED: 'mapped',
  VALIDATED: 'validated',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  APPLIED: 'applied',
};

/** Validation status for a supplemental item (not coerced to defaults). */
export type SupplementalValidationStatus =
  | 'pending'
  | 'validated'
  | 'validated-with-limitation'
  | 'provisional'
  | 'conflicted'
  | 'unknown'
  | 'excluded';

/** §16.5 Supplemental information item — implement EXACTLY as specified. */
export interface SupplementalInformationItem {
  intakeId: string;
  packetInstanceId: string;
  originalContent: string | null;
  originalFilename: string | null;
  submittedBy: string;
  submittedAt: string;
  classification: SupplementalClassification | string;
  destination: SupplementalDestination | string;
  validationStatus: string;
  reviewerId: string | null;
  appliedChangeIds: string[];
  relatedFindingIds: string[];
  relatedWorkflowIds: string[];
  relatedFormIds: string[];
  evidenceHash: string | null;
  confidentialityLevel: string;
  lifecycleStatus: SupplementalItemLifecycleStatus;
}
