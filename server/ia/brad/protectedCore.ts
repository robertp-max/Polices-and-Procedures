import {
  ALLOWED_EVENT_METADATA_FIELDS,
  type AllowedEventMetadataField,
  type EventMetadataPatch,
  type EventMetadataUpdateResult,
} from './types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Protected-core object guard.
   ----------------------------------------------------------------------------
   Brad must NEVER directly modify protected core objects. He may only:
     • create new append-only BradGenerated* objects,
     • append the explicitly-allowed event metadata fields,
     • propose core changes via a BradGeneratedChangeSet (Super Admin approval).
   If ownership/type is unknown, the object is treated as protected core
   (fail-closed).
   ═══════════════════════════════════════════════════════════════════════════ */

export type CoreObjectType =
  | 'policy'
  | 'form'
  | 'workflow'
  | 'event-template'
  | 'event'
  | 'evidence'
  | 'signed-packet'
  | 'signed-minutes'
  | 'user-record'
  | 'role-record'
  | 'gcp-resource'
  | 'brad-generated'
  | 'unknown';

export interface CoreObjectRef {
  id: string;
  type: CoreObjectType;
}

/** Types Brad's generated-object layer owns (created by Brad). Everything else
    — including unknown — is protected core. */
const BRAD_OWNED_TYPES: ReadonlySet<CoreObjectType> = new Set(['brad-generated']);

/** Classify by id convention when the caller did not supply a type:
    Brad objects use the `brad-` id prefix; anything else is protected core. */
export function classifyById(id: string): CoreObjectType {
  return id.startsWith('brad-') ? 'brad-generated' : 'unknown';
}

export function isProtectedCore(ref: CoreObjectRef): boolean {
  // Unknown / un-Brad-owned → protected (fail-closed).
  return !BRAD_OWNED_TYPES.has(ref.type);
}

export interface MutationGuardResult {
  allowed: boolean;
  reason: string;
  /** When blocked, the only legitimate path is a Super Admin-approved changeset. */
  requiresChangeSet: boolean;
}

/** Brad attempting a DIRECT mutation of any non-Brad object is always blocked. */
export function guardDirectMutation(ref: CoreObjectRef): MutationGuardResult {
  if (isProtectedCore(ref)) {
    return {
      allowed: false,
      reason: `Direct mutation of protected core object '${ref.id}' (type=${ref.type}) is not permitted. Propose a BradGeneratedChangeSet for Super Admin approval.`,
      requiresChangeSet: true,
    };
  }
  // Even Brad-owned objects are append-only/immutable — no in-place mutation.
  return {
    allowed: false,
    reason: `Brad-generated objects are append-only; '${ref.id}' cannot be mutated in place.`,
    requiresChangeSet: false,
  };
}

const ALLOWED_SET: ReadonlySet<string> = new Set(ALLOWED_EVENT_METADATA_FIELDS);

/** Apply ONLY allowlisted append-only metadata to an event. Any other field is
    rejected and flagged as requiring a Super Admin-approved changeset. The
    canonical event object is not represented here — Brad only ever produces the
    append-only patch; the caller persists it alongside the event. */
export function applyEventMetadata(
  eventId: string,
  patch: EventMetadataPatch & Record<string, unknown>,
): { result: EventMetadataUpdateResult; appliedPatch: EventMetadataPatch } {
  const appliedFields: AllowedEventMetadataField[] = [];
  const rejectedFields: string[] = [];
  const appliedPatch: EventMetadataPatch = {};

  for (const key of Object.keys(patch)) {
    if (ALLOWED_SET.has(key)) {
      const k = key as AllowedEventMetadataField;
      (appliedPatch as Record<string, unknown>)[k] = patch[key];
      appliedFields.push(k);
    } else {
      rejectedFields.push(key);
    }
  }

  const requiresChangeSet = rejectedFields.length > 0;
  return {
    appliedPatch,
    result: {
      ok: rejectedFields.length === 0,
      eventId,
      appliedFields,
      rejectedFields,
      requiresChangeSet,
      reason: requiresChangeSet
        ? `Fields outside the append-only allowlist require a Super Admin-approved changeset: ${rejectedFields.join(', ')}`
        : undefined,
    },
  };
}
