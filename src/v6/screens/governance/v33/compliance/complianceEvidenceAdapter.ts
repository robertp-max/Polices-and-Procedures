// Official compliance evidence service adapter.
//
// The AUTHORITATIVE compliance record is produced only here. In a development
// build the real identity/evidence service (production LMS + immutable record
// store) is not connected, so the default adapter is honestly DISCONNECTED:
// it cannot mint official evidence, and callers must surface a "Preview only"
// state rather than showing Completed or incrementing compliance progress.

import type { ComplianceEvidenceRecord } from './complianceTypes';

export type EvidenceSaveInput = Omit<ComplianceEvidenceRecord, 'evidenceId' | 'integrityHash'>;

export type EvidenceSaveResult =
  | { ok: true; record: ComplianceEvidenceRecord }
  | { ok: false; reason: 'not_connected' | 'rejected' | 'error'; message: string };

export interface ComplianceEvidenceService {
  /** Whether official completion can be recorded at all in this build. */
  readonly connected: boolean;
  /** Human-readable reason shown when not connected. */
  readonly disconnectedNotice: string;
  /**
   * Persist an official, immutable evidence record.
   *
   * SERVER-SIDE IDENTITY OBLIGATION: a connected implementation MUST verify,
   * from its own authenticated session/token (never from the payload), that
   * `input.learnerId` is the authenticated subject (or a facilitated-group
   * participant namespaced under it as `${subject}:${participantId}`) and
   * reject otherwise. The client-side check in complianceStore.commitEvidence
   * is plumbing discipline, not access control.
   */
  save(input: EvidenceSaveInput): Promise<EvidenceSaveResult>;
  /** All official records for a learner. Empty when disconnected. */
  list(learnerId: string): Promise<ComplianceEvidenceRecord[]>;
}

const DISCONNECTED_NOTICE =
  'Preview only — official completion is unavailable because the compliance evidence service is not connected.';

/**
 * Default development adapter. It NEVER fabricates an official record.
 * Completion is impossible while this adapter is active — by design.
 */
class DisconnectedEvidenceService implements ComplianceEvidenceService {
  readonly connected = false;
  readonly disconnectedNotice = DISCONNECTED_NOTICE;

  async save(): Promise<EvidenceSaveResult> {
    return { ok: false, reason: 'not_connected', message: DISCONNECTED_NOTICE };
  }

  async list(): Promise<ComplianceEvidenceRecord[]> {
    return [];
  }
}

let activeService: ComplianceEvidenceService = new DisconnectedEvidenceService();

/** Inject the real, connected evidence service (production wiring). */
export function setComplianceEvidenceService(service: ComplianceEvidenceService): void {
  activeService = service;
}

export function getComplianceEvidenceService(): ComplianceEvidenceService {
  return activeService;
}

export function isEvidenceServiceConnected(): boolean {
  return activeService.connected;
}

export function getDisconnectedNotice(): string {
  return activeService.disconnectedNotice;
}
