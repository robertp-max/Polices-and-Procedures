/**
 * Packet signing & task identity (Section 16).
 *
 * Rules enforced here:
 *   - One QAPI event has ONE visible packet-signing task (not one per form).
 *   - If the DON and Administrator are the same authorized user, ONE signature
 *     satisfies BOTH roles via a dual-capacity attestation; the user never signs
 *     twice. requiredSignatureCount = 1, allowSingleUserToSatisfyMultipleRoles.
 *   - Task identities are deterministic so repeated packet generation does not
 *     create duplicate tasks.
 *
 * Brad may prepare these tasks but may not apply a human signature or silently
 * lock a packet.
 */

export const DUAL_ROLE_ATTESTATION =
  'I am signing this packet in my capacity as both Director of Nursing and Administrator, and I attest that I reviewed and approved the packet within both assigned responsibilities.';

export interface PacketSigner {
  userId: string;
  displayName?: string;
  /** Roles this user holds (used to detect dual-role overlap). */
  roles: string[];
}

export interface PacketSignatureRequirement {
  packetId: string;
  eventId: string;
  requiredSignerRoles: string[];
  requiredSignatureCount: number;
  allowSingleUserToSatisfyMultipleRoles: boolean;
  /** Roles a single signer satisfies in one signature (dual-capacity). */
  satisfiedRoles: string[];
  attestationText: string;
  /** The ONE deterministic signing task id for this packet/event. */
  signingTaskId: string;
  dualCapacity: boolean;
}

const DON_ALIASES = ['don', 'director of nursing', 'directorofnursing'];
const ADMIN_ALIASES = ['administrator', 'admin'];

function roleMatches(role: string, aliases: string[]): boolean {
  const norm = role.trim().toLowerCase();
  return aliases.some((a) => norm === a || norm.includes(a));
}

/** Deterministic packet signing task id (one per packet+event). */
export function buildPacketSigningTaskId(eventId: string, packetId: string): string {
  const norm = (s: string) => String(s ?? '').replace(/[^A-Za-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toUpperCase();
  return `TASK-${norm(eventId)}-${norm(packetId)}-PACKET-SIGN`;
}

/**
 * Resolve the packet signature requirement, applying the dual-role DON/Admin
 * rule. `signer` is the authorized user who will sign (when known); when both
 * DON and Administrator are required and the signer holds both, a single
 * dual-capacity signature satisfies both roles.
 */
export function resolvePacketSignatureRequirement(input: {
  packetId: string;
  eventId: string;
  requiredSignerRoles: string[];
  signer?: PacketSigner;
}): PacketSignatureRequirement {
  const roles = input.requiredSignerRoles ?? [];
  const requiresDon = roles.some((r) => roleMatches(r, DON_ALIASES));
  const requiresAdmin = roles.some((r) => roleMatches(r, ADMIN_ALIASES));

  const signerHoldsDon = !!input.signer?.roles.some((r) => roleMatches(r, DON_ALIASES));
  const signerHoldsAdmin = !!input.signer?.roles.some((r) => roleMatches(r, ADMIN_ALIASES));

  const dualCapacity = requiresDon && requiresAdmin && signerHoldsDon && signerHoldsAdmin;

  if (dualCapacity) {
    // One signature satisfies both DON and Administrator.
    const satisfiedRoles = ['Director of Nursing', 'Administrator'];
    return {
      packetId: input.packetId,
      eventId: input.eventId,
      requiredSignerRoles: ['Director of Nursing', 'Administrator'],
      requiredSignatureCount: 1,
      allowSingleUserToSatisfyMultipleRoles: true,
      satisfiedRoles,
      attestationText: DUAL_ROLE_ATTESTATION,
      signingTaskId: buildPacketSigningTaskId(input.eventId, input.packetId),
      dualCapacity: true,
    };
  }

  // Non-dual case: one packet signing task; count = distinct required roles
  // (still a single visible packet-signing task, not one-per-form).
  const distinctRoles = Array.from(new Set(roles.map((r) => r.trim()))).filter(Boolean);
  return {
    packetId: input.packetId,
    eventId: input.eventId,
    requiredSignerRoles: distinctRoles,
    requiredSignatureCount: Math.max(1, distinctRoles.length),
    allowSingleUserToSatisfyMultipleRoles: true,
    satisfiedRoles: [],
    attestationText: distinctRoles.length
      ? `I attest that I reviewed and approved this packet in my capacity as ${distinctRoles.join(' / ')}.`
      : 'I attest that I reviewed and approved this packet.',
    signingTaskId: buildPacketSigningTaskId(input.eventId, input.packetId),
    dualCapacity: false,
  };
}

/* ─── Deterministic packet review/approval task identities (Section 16) ─── */

export type PacketTaskKind =
  | 'review_brad_findings'
  | 'resolve_date_classifications'
  | 'review_draft_forms'
  | 'verify_evidence_index'
  | 'approve_meeting_agenda'
  | 'sign_packet_attestation'
  | 'finalize_packet_export';

export interface PacketTaskSpec {
  taskId: string;
  kind: PacketTaskKind;
  title: string;
  eventId: string;
  packetId: string;
  workflowId?: string;
  swimlaneId?: string;
  formInstanceId?: string;
  assignedRole?: string;
  completionRule: string;
}

const TASK_TITLES: Record<PacketTaskKind, string> = {
  review_brad_findings: 'Review Brad findings',
  resolve_date_classifications: 'Review unresolved date classifications',
  review_draft_forms: 'Review draft forms',
  verify_evidence_index: 'Verify packet evidence index',
  approve_meeting_agenda: 'Approve meeting agenda',
  sign_packet_attestation: 'Sign packet attestation',
  finalize_packet_export: 'Finalize packet export',
};

export function buildPacketTaskId(eventId: string, packetId: string, kind: PacketTaskKind): string {
  if (kind === 'sign_packet_attestation') return buildPacketSigningTaskId(eventId, packetId);
  const norm = (s: string) => String(s ?? '').replace(/[^A-Za-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toUpperCase();
  return `TASK-${norm(eventId)}-${norm(packetId)}-${norm(kind)}`;
}

export interface PacketTaskPlanInput {
  eventId: string;
  packetId: string;
  workflowId?: string;
  swimlaneId?: string;
  requiredSignerRoles: string[];
  signer?: PacketSigner;
  hasAgenda?: boolean;
  hasDraftForms?: boolean;
  hasUnresolvedDates?: boolean;
}

/**
 * Build the deterministic set of packet tasks. Re-running with the same inputs
 * yields identical task ids (no duplicate tasks). Exactly ONE signing task.
 */
export function buildPacketTaskPlan(input: PacketTaskPlanInput): PacketTaskSpec[] {
  const specs: PacketTaskSpec[] = [];
  const add = (kind: PacketTaskKind, assignedRole?: string, completionRule = 'Human review required') => {
    specs.push({
      taskId: buildPacketTaskId(input.eventId, input.packetId, kind),
      kind,
      title: TASK_TITLES[kind],
      eventId: input.eventId,
      packetId: input.packetId,
      workflowId: input.workflowId,
      swimlaneId: input.swimlaneId,
      assignedRole,
      completionRule,
    });
  };

  add('review_brad_findings', undefined, 'All Brad findings reviewed by an authorized user.');
  if (input.hasUnresolvedDates) add('resolve_date_classifications', undefined, 'No records remain in needs_date_review.');
  if (input.hasDraftForms) add('review_draft_forms', undefined, 'All draft form instances reviewed/approved.');
  add('verify_evidence_index', undefined, 'Evidence index verified against canonical evidence.');
  if (input.hasAgenda) add('approve_meeting_agenda', undefined, 'Agenda approved by committee chair.');

  // Exactly one signing task for the packet (Section 16).
  const sig = resolvePacketSignatureRequirement({
    packetId: input.packetId,
    eventId: input.eventId,
    requiredSignerRoles: input.requiredSignerRoles,
    signer: input.signer,
  });
  specs.push({
    taskId: sig.signingTaskId,
    kind: 'sign_packet_attestation',
    title: sig.dualCapacity
      ? 'Sign packet attestation (dual-capacity DON + Administrator)'
      : `Sign packet attestation (${sig.requiredSignerRoles.join(' / ') || 'authorized signer'})`,
    eventId: input.eventId,
    packetId: input.packetId,
    workflowId: input.workflowId,
    swimlaneId: input.swimlaneId,
    assignedRole: sig.requiredSignerRoles.join(' / ') || undefined,
    completionRule: `One packet-signing task. requiredSignatureCount=${sig.requiredSignatureCount}.`,
  });

  add('finalize_packet_export', undefined, 'Packet exported and uploaded to Drive after approval + signature.');
  return specs;
}
