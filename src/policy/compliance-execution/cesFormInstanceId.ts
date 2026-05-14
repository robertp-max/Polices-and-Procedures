/**
 * Canonical CES form instance identifiers.
 * Must stay aligned with `regulatoryExecutionStore.getOrCreateFormInstance`.
 */

import type { EventFormInstance } from './types';

export function formatCesFormInstanceId(eventId: string, formId: string, sequence: number): string {
  if (sequence < 1) throw new Error(`formatCesFormInstanceId: sequence must be >= 1 (got ${sequence})`);
  return `${eventId}-${formId}-${String(sequence).padStart(3, '0')}`;
}

/** Legacy projector shape: `${eventId}--${formId}` (double dash). */
export function parseLegacyDoubleDashFormInstanceId(id: string): { eventId: string; formId: string } | null {
  const idx = id.indexOf('--');
  if (idx <= 0 || idx >= id.length - 2) return null;
  const eventId = id.slice(0, idx);
  const formId = id.slice(idx + 2);
  if (!eventId || !formId) return null;
  return { eventId, formId };
}

/** Resolve artifact / URL primary id to a stored form instance row (latest sequence wins for legacy). */
export function resolveFormInstanceFromArtifactCandidates(
  primaryId: string,
  instances: EventFormInstance[],
): EventFormInstance | undefined {
  const direct = instances.find(i => i.id === primaryId);
  if (direct) return direct;
  const legacy = parseLegacyDoubleDashFormInstanceId(primaryId);
  if (!legacy) return undefined;
  const matches = instances
    .filter(i => i.eventId === legacy.eventId && i.formId === legacy.formId)
    .sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0) || (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt));
  return matches[0];
}

export function formInstanceLinkAliases(inst: EventFormInstance): string[] {
  const dash = `${inst.eventId}--${inst.formId}`;
  if (dash === inst.id) return [inst.id];
  return [inst.id, dash];
}
