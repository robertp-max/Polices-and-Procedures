// Official compliance evidence service adapter.
//
// The AUTHORITATIVE compliance record is produced only here. The default local
// app adapter talks to the same authenticated Governance API boundary as the
// LMS-backed Governance Academy, so completion can be recorded in the local
// workspace without presenting the whole portal as preview-only.

import { apiRoot, bearerAuthHeader } from '@/auth/apiClient';
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
  'LMS completion evidence is temporarily unavailable for this session.';

interface EvidenceListEnvelope {
  connected: boolean;
  records: ComplianceEvidenceRecord[];
  notice?: string;
}

interface EvidenceSaveEnvelope {
  record: ComplianceEvidenceRecord;
}

class ApiComplianceEvidenceService implements ComplianceEvidenceService {
  readonly connected = true;
  readonly disconnectedNotice = DISCONNECTED_NOTICE;

  async save(input: EvidenceSaveInput): Promise<EvidenceSaveResult> {
    try {
      const response = await fetch(`${apiRoot()}/governance/compliance-evidence/${encodeURIComponent(input.assignmentId)}`, {
        method: 'POST',
        headers: {
          ...bearerAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      const payload = await response.json().catch(() => null) as EvidenceSaveEnvelope | { error?: { message?: string } } | null;
      if (!response.ok) {
        return {
          ok: false,
          reason: response.status === 401 || response.status === 403 ? 'rejected' : 'error',
          message: payload && 'error' in payload && payload.error?.message ? payload.error.message : DISCONNECTED_NOTICE,
        };
      }
      if (!payload || !('record' in payload)) {
        return { ok: false, reason: 'error', message: 'LMS evidence service returned an invalid response.' };
      }
      return { ok: true, record: payload.record };
    } catch (error) {
      return {
        ok: false,
        reason: 'error',
        message: error instanceof Error ? error.message : DISCONNECTED_NOTICE,
      };
    }
  }

  async list(learnerId: string): Promise<ComplianceEvidenceRecord[]> {
    try {
      const response = await fetch(`${apiRoot()}/governance/compliance-evidence?learnerId=${encodeURIComponent(learnerId)}`, {
        headers: bearerAuthHeader(),
      });
      const payload = await response.json().catch(() => null) as EvidenceListEnvelope | null;
      if (!response.ok || !payload?.connected) return [];
      return Array.isArray(payload.records) ? payload.records : [];
    } catch {
      return [];
    }
  }
}

let activeService: ComplianceEvidenceService = new ApiComplianceEvidenceService();

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
