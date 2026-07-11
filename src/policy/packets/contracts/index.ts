/**
 * Universal Mandated-Event Packet Platform — shared contracts barrel.
 * WP-0.1: pure types + pure functions only.
 */

export type {
  PacketArchetypeId,
  PacketModuleId,
  PacketAttachmentRule,
  PacketArchetypeDefinition,
} from './archetype';
export {
  UNIVERSAL_BACKBONE_MODULE_IDS,
  QAPI_PART_I_MODULE_IDS,
  QAPI_PART_II_MODULE_IDS,
} from './archetype';

export type {
  ConditionalFormRule,
  DualCapacityRule,
  PacketCompletionGate,
  PacketConfidentialityRule,
  MandatedEventPacketDefinition,
} from './eventPacketDefinition';

export type {
  PacketLifecycleStatus,
  AppendixDPacketStatus,
  PacketModuleInstanceStatus,
  PacketModuleInstance,
  PacketAttachmentInstanceStatus,
  PacketAttachmentInstance,
  PacketInstance,
} from './packetInstance';
export {
  APPENDIX_D_PACKET_STATUS_VOCABULARY,
  PACKET_LIFECYCLE_TO_APPENDIX_D,
} from './packetInstance';

export type {
  PacketClassification,
  PacketModelIdentity,
  PacketModelModuleInstance,
  PacketModel,
  RenderingChromeAccentRail,
  RenderingChromeLogo,
  RenderingChromeFooter,
  RenderingChromeWatermark,
  RenderingChromeClassificationNotice,
  PacketRenderingChrome,
  PacketRenderingProfile,
  RenderedPacketPage,
  PacketPageContentBlock,
} from './packetModel';

export type {
  WorkflowDecisionState,
  Fr015DeterminationOption,
  PipEvaluationFactors,
  PacketFinding,
  TriggerLifecycleStatus,
  TriggerType,
  TriggerValidationStatus,
  ThresholdOperator,
  WorkflowTriggerEvaluation,
} from './triggers';
export {
  WORKFLOW_DECISION_STATES,
  WORKFLOW_UNRESOLVED_BANNER,
  FR015_DETERMINATION_OPTIONS,
} from './triggers';

export type {
  SupplementalClassification,
  SupplementalDestination,
  SupplementalLifecycleStatus,
  SupplementalItemLifecycleStatus,
  SupplementalValidationStatus,
  SupplementalInformationItem,
} from './supplemental';
export {
  SUPPLEMENTAL_CLASSIFICATION_OPTIONS,
  SUPPLEMENTAL_DESTINATION_OPTIONS,
  SUPPLEMENTAL_LIFECYCLE_TO_ITEM,
} from './supplemental';

export type {
  ComparabilityState,
  AppendixDTrendStatus,
  AppendixDDataValidationStatus,
  TrendOutputDimension,
  TrendDirection,
  QapiMetricSnapshot,
  QapiFindingSnapshot,
  QapiWorkflowSnapshot,
  QapiPipSnapshot,
  QapiActionSnapshot,
  QapiTrendSnapshot,
  TrendComparisonOutput,
  SidecarArtifactKind,
  SidecarPayloadHeader,
  AnalysisSidecarPayload,
  KpisSidecarPayload,
  WorkflowsSidecarPayload,
  ManifestSidecarEntry,
  ManifestSidecarPayload,
  AuditSidecarEventRow,
  AuditSidecarPayload,
  PacketSidecarPayload,
} from './trends';
export {
  COMPARABILITY_STATES,
  APPENDIX_D_TREND_STATUS_VOCABULARY,
  APPENDIX_D_DATA_VALIDATION_STATUS_VOCABULARY,
  PRIOR_PERIOD_PACKET_NOT_FOUND_BANNER,
  TREND_OUTPUT_DIMENSIONS,
} from './trends';

export type {
  DriveArtifactPointer,
  PriorPacketQuery,
  PriorPacketExclusionReason,
  PriorPacketExclusion,
  PriorPacketLookupResult,
  DriveDestinationRequest,
  DriveDestination,
  PublishArtifactsRequest,
  PublishArtifactsResult,
  ReadSidecarRequest,
  VerifyArtifactHashRequest,
  VerifyArtifactHashResult,
  PacketDriveConnector,
} from './drive';

export type {
  SignatureLifecycleStatus,
  PacketSignerTask,
  PacketEnvelope,
} from './envelope';

export type {
  ValidationSeverity,
  MaterialEditClassification,
  EditImpactDimensions,
  EditImpactSummary,
  PacketValidationFinding,
  ValidationSeverityCounts,
  PacketValidationResult,
} from './validation';
export { VALIDATION_SEVERITIES, EDIT_IMPACT_DIMENSION_KEYS } from './validation';

export type {
  PacketIdentityKeyParts,
  WorkflowActivationKeyParts,
  OptimisticConcurrencyStamp,
  PacketVersionHashFields,
} from './identity';
export {
  buildPacketIdentityKey,
  buildWorkflowActivationKey,
  readPacketVersion,
  readContentHash,
  buildOptimisticConcurrencyStamp,
  PACKET_KEY_SEPARATOR,
} from './identity';

export type {
  PacketAuditEventType,
  PacketAuditActor,
  PacketAuditResourceRef,
  PacketAuditEvent,
} from './audit';
export { PACKET_AUDIT_EVENT_TYPES } from './audit';

export type { PacketPlatformMachine } from './stateMachines';
export {
  PACKET_LIFECYCLE_TRANSITIONS,
  isAllowedPacketTransition,
  assertPacketTransition,
  isTerminalPacketStatus,
  TRIGGER_LIFECYCLE_TRANSITIONS,
  isAllowedTriggerTransition,
  assertTriggerTransition,
  isTerminalTriggerStatus,
  SUPPLEMENTAL_LIFECYCLE_TRANSITIONS,
  isAllowedSupplementalTransition,
  assertSupplementalTransition,
  isTerminalSupplementalStatus,
  SIGNATURE_LIFECYCLE_TRANSITIONS,
  isAllowedSignatureTransition,
  assertSignatureTransition,
  isTerminalSignatureStatus,
  isAllowedTransition,
  assertTransition,
  ALLOWED_TRANSITIONS,
} from './stateMachines';
