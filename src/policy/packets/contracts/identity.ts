/**
 * Deterministic pure key builders and concurrency helpers —
 * FR-004, FR-014, §18.9. Zero side effects. Never invent defaults.
 */

/** Input parts for FR-004 existing-packet detection key. */
export interface PacketIdentityKeyParts {
  agency_id: string;
  event_instance_id: string;
  workflow_instance_id: string;
  packet_template_id: string;
}

/** Input parts for FR-014 workflow activation idempotency key. */
export interface WorkflowActivationKeyParts {
  agency_id: string;
  reporting_period: string;
  finding_id: string;
  trigger_rule_id: string;
  canonical_workflow_id: string;
}

/**
 * Optimistic concurrency stamp (§18.9).
 * Reject stale-version writes against this stamp.
 */
export interface OptimisticConcurrencyStamp {
  packetInstanceId: string;
  /** Expected packet version for the write. */
  expectedVersion: number;
  /** Expected content hash when known; null means hash not yet established. */
  expectedContentHash: string | null;
  /** ISO timestamp of the version the client last observed. */
  observedUpdatedAt: string;
}

/** Packet version / content-hash field pair helpers operate on this shape. */
export interface PacketVersionHashFields {
  packetVersion: number;
  contentHash: string | null;
}

const KEY_SEPARATOR = '\u001f';

/**
 * Assert a required identity component is a non-empty string.
 * Never converts missing/unknown to zero or defaults.
 */
function requireKeyPart(name: string, value: string | null | undefined): string {
  if (value === null || value === undefined) {
    throw new Error(`Packet identity key part "${name}" is missing`);
  }
  if (typeof value !== 'string') {
    throw new Error(`Packet identity key part "${name}" must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`Packet identity key part "${name}" is empty`);
  }
  return trimmed;
}

/**
 * FR-004 existing-packet detection key:
 * agency_id + event_instance_id + workflow_instance_id + packet_template_id
 *
 * Deterministic and order-insensitive w.r.t. object property enumeration:
 * parts are always read by fixed field names, never by Object.keys order.
 */
export function buildPacketIdentityKey(parts: PacketIdentityKeyParts): string {
  const agencyId = requireKeyPart('agency_id', parts.agency_id);
  const eventInstanceId = requireKeyPart('event_instance_id', parts.event_instance_id);
  const workflowInstanceId = requireKeyPart(
    'workflow_instance_id',
    parts.workflow_instance_id,
  );
  const packetTemplateId = requireKeyPart('packet_template_id', parts.packet_template_id);
  return [agencyId, eventInstanceId, workflowInstanceId, packetTemplateId].join(
    KEY_SEPARATOR,
  );
}

/**
 * FR-014 workflow activation idempotency key:
 * agency_id + reporting_period + finding_id + trigger_rule_id + canonical_workflow_id
 *
 * Deterministic and order-insensitive w.r.t. object property enumeration.
 */
export function buildWorkflowActivationKey(parts: WorkflowActivationKeyParts): string {
  const agencyId = requireKeyPart('agency_id', parts.agency_id);
  const reportingPeriod = requireKeyPart('reporting_period', parts.reporting_period);
  const findingId = requireKeyPart('finding_id', parts.finding_id);
  const triggerRuleId = requireKeyPart('trigger_rule_id', parts.trigger_rule_id);
  const canonicalWorkflowId = requireKeyPart(
    'canonical_workflow_id',
    parts.canonical_workflow_id,
  );
  return [
    agencyId,
    reportingPeriod,
    findingId,
    triggerRuleId,
    canonicalWorkflowId,
  ].join(KEY_SEPARATOR);
}

/**
 * Read packet version from a version/hash field pair.
 * Throws when version is missing or not a finite number — never defaults to 0.
 */
export function readPacketVersion(fields: PacketVersionHashFields): number {
  if (
    fields === null ||
    fields === undefined ||
    typeof fields.packetVersion !== 'number' ||
    !Number.isFinite(fields.packetVersion)
  ) {
    throw new Error('packetVersion is missing or not a finite number');
  }
  return fields.packetVersion;
}

/**
 * Read content hash from a version/hash field pair.
 * Returns null when explicitly null; throws when the field is absent/undefined
 * on a non-object — never invents a hash.
 */
export function readContentHash(fields: PacketVersionHashFields): string | null {
  if (fields === null || fields === undefined) {
    throw new Error('Packet version/hash fields are missing');
  }
  if (!('contentHash' in fields)) {
    throw new Error('contentHash field is missing');
  }
  const hash = fields.contentHash;
  if (hash === null) return null;
  if (typeof hash !== 'string') {
    throw new Error('contentHash must be a string or null');
  }
  if (hash.trim().length === 0) {
    throw new Error('contentHash is empty');
  }
  return hash;
}

/**
 * Build an optimistic concurrency stamp from observed packet fields.
 * Does not invent version or hash values.
 */
export function buildOptimisticConcurrencyStamp(input: {
  packetInstanceId: string;
  packetVersion: number;
  contentHash: string | null;
  observedUpdatedAt: string;
}): OptimisticConcurrencyStamp {
  const packetInstanceId = requireKeyPart('packetInstanceId', input.packetInstanceId);
  if (typeof input.packetVersion !== 'number' || !Number.isFinite(input.packetVersion)) {
    throw new Error('packetVersion is missing or not a finite number');
  }
  if (!('contentHash' in input)) {
    throw new Error('contentHash field is missing');
  }
  if (input.contentHash !== null) {
    if (typeof input.contentHash !== 'string' || input.contentHash.trim().length === 0) {
      throw new Error('contentHash must be a non-empty string or null');
    }
  }
  const observedUpdatedAt = requireKeyPart('observedUpdatedAt', input.observedUpdatedAt);
  return {
    packetInstanceId,
    expectedVersion: input.packetVersion,
    expectedContentHash: input.contentHash,
    observedUpdatedAt,
  };
}

/** Separator used in key builders (unit-testable constant). */
export const PACKET_KEY_SEPARATOR = KEY_SEPARATOR;
