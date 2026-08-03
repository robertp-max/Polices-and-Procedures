import { describe, expect, it } from 'vitest';

import {
  currentGovernancePacketArtifacts,
  type GovernancePacketArtifact,
  type GovernancePacketManifest,
} from './governanceTabletopPackets';

function artifact(
  packetId: string,
  caseId: string,
  period: GovernancePacketArtifact['period'],
  status: GovernancePacketArtifact['status'],
): GovernancePacketArtifact {
  return {
    packetId,
    caseId,
    period,
    version: '1.0.0',
    status,
    sourceCutoff: '2026-03-31',
    sourceHash: 'source-hash',
    generatedAt: '2026-07-27T00:00:00.000Z',
    generatedBy: 'Fable',
    pdfHash: 'pdf-hash',
    pageCount: 12,
    protectedOpenUrl: `/api/governance/tabletop-packets/${packetId}/pdf`,
    reviewFindings: ['Human review pending.'],
    filename: `${packetId}.pdf`,
  };
}

describe('governance tabletop packet manifest boundary', () => {
  it('exposes only current artifacts in period order', () => {
    const manifest: GovernancePacketManifest = {
      schemaVersion: 1,
      generatedBy: 'Fable',
      classification: 'SYNTHETIC MOCK DATA - NO REAL PHI - NOT FOR PRODUCTION',
      artifacts: [
        artifact('annual-current', 'annual', 'Annual', 'review_required'),
        artifact('q1-old', 'q1', 'Q1', 'superseded'),
        artifact('q1-current', 'q1', 'Q1', 'review_required'),
      ],
    };

    expect(currentGovernancePacketArtifacts(manifest).map((item) => item.packetId)).toEqual([
      'annual-current',
      'q1-current',
    ]);
  });

  it('uses server-owned protected URLs instead of client-computed filenames', () => {
    const current = currentGovernancePacketArtifacts({
      schemaVersion: 1,
      generatedBy: 'Fable',
      classification: 'SYNTHETIC MOCK DATA - NO REAL PHI - NOT FOR PRODUCTION',
      artifacts: [artifact('q2-current', 'q2', 'Q2', 'review_required')],
    })[0];

    expect(current?.protectedOpenUrl).toBe(
      '/api/governance/tabletop-packets/q2-current/pdf',
    );
  });
});
