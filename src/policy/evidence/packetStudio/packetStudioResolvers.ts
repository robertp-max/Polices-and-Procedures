import { REGULATORY_EVENTS, type EventEvidenceItem, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import type { EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { EVIDENCE_PACKET_TYPES, EVIDENCE_PACKET_TYPES_BY_ID, type EvidencePacketSection, type EvidencePacketType } from './evidencePacketTypes';

export type EvidencePacketSource =
  | { sourceId: string; label: string; sourceType: EvidencePacketSection['sourceType']; status: 'available' | 'missing' | 'manual'; ref?: string }
  | { sourceId: string; label: string; sourceType: 'uploaded_file'; status: 'manual'; ref?: string };

export type EvidencePacketDraft = {
  packetId: string;
  packetTypeId: string;
  eventId?: string;
  workflowId?: string;
  policyIds: string[];
  formIds: string[];
  evidenceIds: string[];
  generatedBy: 'brad' | string;
  reviewedBy?: string;
  createdAt: string;
  exportStatus: 'not_exported' | 'ready' | 'exported';
  signatureStatus: 'not_required' | 'pending' | 'complete';
  packetStatus: 'draft' | 'needs_review' | 'ready_to_export' | 'exported' | 'locked';
  sources: EvidencePacketSource[];
  missingSources: EvidencePacketSource[];
  sections: EvidencePacketSection[];
  bradSummary: string;
};

function haystackForEvent(event: Partial<RegulatoryEvent> | undefined): string {
  if (!event) return '';
  return [
    event.id,
    event.title,
    event.domain,
    event.summary,
    event.ownerRole,
    event.workflowId,
    ...(event.policyRefs ?? []),
    ...(event.requiredForms ?? []).map((item: EventEvidenceItem) => `${item.label ?? ''} ${item.formId ?? ''}`),
  ].join(' ').toLowerCase();
}

export function resolvePacketTypesForEvent(event?: Partial<RegulatoryEvent> | null): EvidencePacketType[] {
  if (!event) return EVIDENCE_PACKET_TYPES;
  const haystack = haystackForEvent(event);
  const workflowId = event.workflowId;
  const matches = EVIDENCE_PACKET_TYPES.filter((packet) => {
    if (workflowId && packet.workflowIds.includes(workflowId)) return true;
    return packet.eventTypeIds.some((token) => haystack.includes(token.toLowerCase()));
  });
  return matches.length > 0 ? matches : EVIDENCE_PACKET_TYPES.filter((packet) => packet.packetTypeId === 'custom-event-packet');
}

export function findPacketEvent(eventId?: string): RegulatoryEvent | undefined {
  if (!eventId) return undefined;
  const lookup = eventId.toLowerCase();
  return REGULATORY_EVENTS.find((event) =>
    [event.id, event.title, event.workflowId].filter(Boolean).some((value) => String(value).toLowerCase() === lookup)
  );
}

export function resolvePacketSourcesForEvent(
  eventId: string | undefined,
  packetTypeId: string,
  evidenceByEvent: Record<string, EvidenceDoc[]> = {},
): EvidencePacketSource[] {
  const packet = EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId) ?? EVIDENCE_PACKET_TYPES[0];
  const event = findPacketEvent(eventId);
  const evidence = eventId ? evidenceByEvent[eventId] ?? [] : [];
  const workflow = event?.workflowId ? WORKFLOWS[event.workflowId] : undefined;
  const eventEvidence = event?.requiredForms ?? [];

  return packet.packetSections.map((section) => {
    if (section.sourceType === 'event_metadata') {
      return {
        sourceId: section.sectionId,
        label: event ? `${event.title} (${event.id})` : 'Event metadata not selected',
        sourceType: section.sourceType,
        status: event ? 'available' : section.required ? 'missing' : 'manual',
        ref: event?.id,
      };
    }
    if (section.sourceType === 'workflow_step') {
      return {
        sourceId: section.sectionId,
        label: workflow ? `${workflow.title ?? event?.workflowId} workflow data` : 'Workflow data not mapped',
        sourceType: section.sourceType,
        status: workflow ? 'available' : section.required ? 'missing' : 'manual',
        ref: event?.workflowId,
      };
    }
    if (section.sourceType === 'form' && section.formId) {
      const eventForm = eventEvidence.find((item: EventEvidenceItem) => item.formId === section.formId);
      const formId = section.formId;
      const evidenceDoc = evidence.find((doc) => doc.formIds.includes(formId) || doc.linkedFormId === formId);
      return {
        sourceId: section.sectionId,
        label: `${section.formId}${eventForm?.label ? ` - ${eventForm.label}` : ''}`,
        sourceType: section.sourceType,
        status: eventForm || evidenceDoc ? 'available' : 'missing',
        ref: evidenceDoc?.id ?? section.formId,
      };
    }
    if (section.sourceType === 'signed_package') {
      const signed = evidence.find((doc) => doc.artifactType === 'signed_package' || doc.kind === 'signed_package');
      return {
        sourceId: section.sectionId,
        label: signed ? signed.name : 'Signed package pending',
        sourceType: section.sourceType,
        status: signed ? 'available' : 'missing',
        ref: signed?.id,
      };
    }
    if (section.sourceType === 'evidence') {
      const match = evidence.find((doc) => {
        const text = `${doc.name} ${doc.kind} ${doc.note ?? ''}`.toLowerCase();
        return section.evidenceType ? text.includes(section.evidenceType.replace(/-/g, ' ').toLowerCase()) : true;
      });
      return {
        sourceId: section.sectionId,
        label: match ? match.name : section.title,
        sourceType: section.sourceType,
        status: match ? 'available' : section.required ? 'missing' : 'manual',
        ref: match?.id ?? section.evidenceType,
      };
    }
    return {
      sourceId: section.sectionId,
      label: section.title,
      sourceType: section.sourceType,
      status: section.required && section.sourceType !== 'manual_upload' ? 'missing' : 'manual',
      ref: section.formId ?? section.policyId ?? section.evidenceType,
    };
  });
}

export function buildEvidencePacketDraft(
  eventId: string | undefined,
  packetTypeId: string,
  evidenceByEvent: Record<string, EvidenceDoc[]> = {},
  generatedBy: 'brad' | string = 'brad',
): EvidencePacketDraft {
  const packet = EVIDENCE_PACKET_TYPES_BY_ID.get(packetTypeId) ?? EVIDENCE_PACKET_TYPES[0];
  const event = findPacketEvent(eventId);
  const sources = resolvePacketSourcesForEvent(eventId, packet.packetTypeId, evidenceByEvent);
  const missingSources = sources.filter((source) => source.status === 'missing');
  const eventEvidence = eventId ? evidenceByEvent[eventId] ?? [] : [];
  const now = new Date().toISOString();

  return {
    packetId: `EPS-${packet.packetTypeId}-${Date.now()}`,
    packetTypeId: packet.packetTypeId,
    eventId: event?.id ?? eventId,
    workflowId: event?.workflowId,
    policyIds: packet.requiredPolicyIds,
    formIds: packet.requiredFormIds,
    evidenceIds: eventEvidence.map((doc) => doc.id),
    generatedBy,
    createdAt: now,
    exportStatus: missingSources.length === 0 ? 'ready' : 'not_exported',
    signatureStatus: packet.requiredSignerRoles.length > 0 ? 'pending' : 'not_required',
    packetStatus: missingSources.length === 0 && packet.mappingStatus !== 'needs_mapping' ? 'ready_to_export' : 'needs_review',
    sources,
    missingSources,
    sections: packet.packetSections,
    bradSummary: event
      ? `Brad assembled a ${packet.label} draft from ${event.title}. ${sources.length - missingSources.length} sources are available and ${missingSources.length} require human follow-up before lock.`
      : `Brad prepared a manual ${packet.label} draft. Select an event or add source files before final review.`,
  };
}
