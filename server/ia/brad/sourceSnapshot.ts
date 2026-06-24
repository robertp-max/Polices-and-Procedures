import { sha256Hex } from './generatedObjects.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad source snapshot — the read-only view of source-of-truth data Brad uses
   to GENERATE objects. Brad reads this; he never writes back to it. The caller
   (route/service) assembles it from CES/event/policy data; tests supply a
   fixture. Every generated object records `source_snapshot_hash` over it.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface SnapshotTask {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'complete';
  assignedRole?: string;
}

export interface SnapshotSignature {
  role: string;
  signed: boolean;
  signerName?: string;
}

export interface SnapshotMetric {
  name: string;
  value?: string | number;
  target?: string | number;
}

export interface SnapshotPip {
  id: string;
  title: string;
  status: 'open' | 'monitoring' | 'closed';
}

export interface SnapshotIncident {
  id: string;
  type: string;
  severity: 'low' | 'moderate' | 'high';
  summary: string;
}

export interface BradSourceSnapshot {
  eventId: string;
  eventTitle: string;
  eventType: 'general' | 'qapi' | 'other';
  workflowId?: string;
  meetingDateTime?: string;
  attendees: string[];
  requiredRoles: string[];
  agenda: string[];
  requiredFormIds: string[];
  policyIds: string[];
  tasks: SnapshotTask[];
  evidenceItemIds: string[];
  signatures: SnapshotSignature[];
  followUps: string[];
  // QAPI-specific (optional)
  metrics?: SnapshotMetric[];
  pips?: SnapshotPip[];
  incidents?: SnapshotIncident[];
  infectionSafetyTrends?: string[];
  priorMinutesCarryover?: string[];
  nextMeetingDate?: string;
  /** When this snapshot was read from source-of-truth. */
  capturedAt: string;
}

export function snapshotHash(s: BradSourceSnapshot): string {
  return sha256Hex(JSON.stringify(s));
}
