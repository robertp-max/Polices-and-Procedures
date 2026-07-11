/**
 * Mandated-event packet definition contracts — §16.2.
 * Pure types only. Zero runtime side effects.
 */

import type { PacketArchetypeId, PacketModuleId } from './archetype';

/**
 * Conditional form generation rule (FR-016).
 * Conditional forms generate only when their trigger is validated.
 */
export interface ConditionalFormRule {
  ruleId: string;
  /** Canonical form ID from the forms library. */
  formId: string;
  /** Trigger rule that must evaluate true and be validated. */
  triggerRuleId: string;
  /** Human-readable condition description. */
  conditionDescription: string;
  /** When true, unvalidated triggers must not inject the form. */
  requiresValidatedTrigger: boolean;
  /** Optional finding categories that also gate generation. */
  findingCategories: string[];
}

/**
 * Dual-capacity signature rule (FR-026).
 * One signer may satisfy two capacities only when an explicit rule permits it.
 */
export interface DualCapacityRule {
  ruleId: string;
  primaryCapacity: string;
  secondaryCapacity: string;
  /** Free-text authorization condition preserved for audit. */
  allowedWhen: string;
  requiresExplicitAttestation: boolean;
  /** Roles that may authorize the dual-capacity pairing. */
  authorizingRoles: string[];
}

/**
 * Completion gate that must pass before a packet advances past a lifecycle stage.
 */
export interface PacketCompletionGate {
  gateId: string;
  description: string;
  /** Lifecycle status this gate protects (e.g. READY_FOR_APPROVAL). */
  appliesAtStatus: string;
  requiredModuleIds: PacketModuleId[];
  requiredFormIds: string[];
  requiredEvidenceTypes: string[];
  requiresZeroBlockers: boolean;
  requiresApprovals: boolean;
  requiresSignatures: boolean;
  requiresDrivePublication: boolean;
}

/**
 * Confidentiality handling rule for restricted packet content (FR-019 / §13.4).
 */
export interface PacketConfidentialityRule {
  ruleId: string;
  classification: string;
  /** Roles permitted to view/edit content under this rule. */
  restrictedToRoles: string[];
  watermarkText: string | null;
  /** When true, content lives in a restricted addendum, not the general packet. */
  separateAddendum: boolean;
  redactFromGeneralPacket: boolean;
  /** When true, general packet may only show aggregated counts. */
  aggregateOnlyInGeneralPacket: boolean;
}

/** §16.2 Mandated-event packet definition — implement EXACTLY as specified. */
export interface MandatedEventPacketDefinition {
  eventFamilyId: string;
  eventTitle: string;
  archetypeId: PacketArchetypeId;
  subtype: string | null;
  canonicalWorkflowId: string;
  policyRefs: string[];
  requiredAnalysisIds: string[];
  requiredFormIds: string[];
  conditionalFormRules: ConditionalFormRule[];
  requiredEvidenceTypes: string[];
  requiredApprovalRoles: string[];
  requiredSignerRoles: string[];
  allowedDualCapacitySignatures: DualCapacityRule[];
  completionGates: PacketCompletionGate[];
  confidentialityRules: PacketConfidentialityRule[];
  retentionRule: string;
  driveDestinationTemplate: string;
  status: 'resolved' | 'needs-review' | 'gap';
  gapReason?: string;
}
