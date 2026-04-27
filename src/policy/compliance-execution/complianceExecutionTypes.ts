/* ═══════════════════════════════════════════════════════════════
   compliance-execution / TYPES
   --------------------------------------------------------------
   Canonical type surface for the merged Command Center × CES
   platform. Everything that crosses module boundaries must use
   these types. CES types are re-exported as the canonical
   execution shape; Command Center types stay in their own files.
   ═══════════════════════════════════════════════════════════════ */

export type {
  WorkflowPhase,
  ComplianceState,
  AuditReadiness,
  ComplianceDomain,
  DomainRiskLevel,
  DomainRisk,
  SignerStatus,
  RequiredSigner,
  BlockedReasonKind,
  BlockedReason,
  EvidenceStatus,
  Owner,
  EventCategory,
  ComplianceEvent,
  Workflow,
  ExecutionUnit,
  Sprint,
  OwnerAssignment,
  SprintMetrics,
  SprintTrendPoint,
} from '@/policy/ces/types';

export {
  WORKFLOW_PHASE_ORDER,
  WORKFLOW_PHASE_LABEL,
  COMPLIANCE_STATE_ORDER,
  COMPLIANCE_STATE_LABEL,
  AUDIT_READINESS_LABEL,
  COMPLIANCE_DOMAIN_LABEL,
} from '@/policy/ces/types';

import type {
  ComplianceEvent, ExecutionUnit,
} from '@/policy/ces/types';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/** Provenance: where a merged record originated. */
export type ExecutionSource = 'regulatory' | 'ces-seed' | 'autogen' | 'triggered';

/** A `ComplianceEvent` with provenance + back-reference to the source RegulatoryEvent (when applicable). */
export interface MergedComplianceEvent extends ComplianceEvent {
  source:        ExecutionSource;
  regulatoryRef?: RegulatoryEvent;
}

/** An `ExecutionUnit` with provenance + the source RegulatoryEvent (when derived). */
export interface MergedExecutionUnit extends ExecutionUnit {
  source:        ExecutionSource;
  regulatoryRef?: RegulatoryEvent;
}

/** Cross-system audit-readiness rollup, computed once per render. */
export interface AuditReadinessRollup {
  notReady:    number;
  partial:     number;
  ready:       number;
  certified:   number;
  totalOpen:   number;
}
