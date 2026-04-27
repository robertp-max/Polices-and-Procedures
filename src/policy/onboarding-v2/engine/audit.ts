import type {
  AuditEventType, OnboardingAuditEvent, OnboardingSnapshot,
} from '../types';
import { fauxHash, nextUlid } from './hash';

/** Append a hash-chained audit event to the snapshot. Mutates `snap.audit` in place. */
export function appendAudit(
  snap: OnboardingSnapshot,
  ev: Omit<OnboardingAuditEvent, 'id' | 'sequence' | 'prevHash' | 'eventHash' | 'createdAt'>,
  now: string = new Date().toISOString(),
): OnboardingAuditEvent {
  const stream = snap.audit.filter(a => a.subjectId === ev.subjectId);
  const prev = stream[stream.length - 1];
  const sequence = (prev?.sequence ?? 0) + 1;
  const prevHash = prev?.eventHash ?? 'sha256:00000000genesis';
  const id = nextUlid('AUD');
  const canonical = JSON.stringify({
    id, sequence, prevHash, type: ev.eventType,
    subjectId: ev.subjectId, batchId: ev.batchId, unitId: ev.unitId,
    payload: ev.payload, createdAt: now,
  });
  const eventHash = fauxHash(canonical);
  const event: OnboardingAuditEvent = {
    ...ev, id, sequence, prevHash, eventHash, createdAt: now,
  };
  snap.audit.push(event);
  return event;
}

/** Verify the integrity of a subject's audit stream. */
export function verifyChain(snap: OnboardingSnapshot, subjectId: string): { ok: boolean; brokenAt?: number } {
  const stream = snap.audit.filter(a => a.subjectId === subjectId).sort((a, b) => a.sequence - b.sequence);
  let prev = 'sha256:00000000genesis';
  for (const ev of stream) {
    if (ev.prevHash !== prev) return { ok: false, brokenAt: ev.sequence };
    const canonical = JSON.stringify({
      id: ev.id, sequence: ev.sequence, prevHash: ev.prevHash, type: ev.eventType,
      subjectId: ev.subjectId, batchId: ev.batchId, unitId: ev.unitId,
      payload: ev.payload, createdAt: ev.createdAt,
    });
    if (fauxHash(canonical) !== ev.eventHash) return { ok: false, brokenAt: ev.sequence };
    prev = ev.eventHash;
  }
  return { ok: true };
}

export const AUDIT_LABEL: Record<AuditEventType, string> = {
  TRIGGER_RECEIVED: 'Trigger received',
  PROFILE_RESOLVED: 'Profile resolved',
  TEMPLATE_SELECTED: 'Template selected',
  REQUIREMENT_RECONCILED: 'Requirement verified by reconciliation',
  REQUIREMENT_EMITTED: 'Requirement emitted',
  UNIT_STATE_CHANGED: 'Unit state changed',
  EVIDENCE_CAPTURED: 'Evidence captured',
  EVIDENCE_REJECTED: 'Evidence rejected',
  SIGNATURE_REQUESTED: 'Signature requested',
  SIGNATURE_COMPLETED: 'Signature completed',
  SIGNATURE_DECLINED: 'Signature declined',
  GATE_EVALUATED: 'Gate evaluated',
  OVERRIDE_GRANTED: 'Override granted (dual eCIgn)',
  OVERRIDE_EXPIRED: 'Override expired',
  BATCH_CREATED: 'Batch created',
  BATCH_COMPLETED: 'Batch completed',
  BATCH_WITHDRAWN: 'Batch withdrawn',
};
