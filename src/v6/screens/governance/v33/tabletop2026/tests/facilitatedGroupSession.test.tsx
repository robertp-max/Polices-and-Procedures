import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FacilitatedGroupSession from '../FacilitatedGroupSession';
import { Q1_CASE_PACK } from '../data/q1Case';

vi.mock('../tabletopPacketArtifacts', () => ({
  fetchTabletopPacketArtifacts: vi.fn(async () => ({
    connected: true,
    classification: 'SYNTHETIC MOCK DATA - NO REAL PHI - NOT FOR PRODUCTION',
    artifacts: [{
      packetId: 'CI-GB-TT-Q1-2026-V1-0-3',
      caseId: 'tabletop2026-q1',
      period: 'Q1',
      version: '1.0.3',
      status: 'review_required',
      sourceCutoff: '2026-04-09',
      sourceHash: 'source-hash',
      generatedAt: '2026-07-28T06:52:08.069Z',
      generatedBy: 'Fable',
      pdfHash: 'pdf-hash',
      pageCount: 43,
      protectedOpenUrl: '/api/governance/tabletop-packets/CI-GB-TT-Q1-2026-V1-0-3/pdf',
      reviewFindings: ['Human visual and evidentiary review pending.'],
    }],
  })),
  formatPacketGeneratedAt: vi.fn(() => 'Jul 27, 2026, 11:52 PM PDT'),
  openProtectedPacket: vi.fn(),
}));

describe('FacilitatedGroupSession', () => {
  it('hands the validated roster and controlled packet from the lobby to the live facilitator console', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(
      <FacilitatedGroupSession
        caseId={Q1_CASE_PACK.id}
        accessMode="uat_reviewer"
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByText('UAT Reviewer Access')).toBeTruthy();
    expect(screen.getByText(/do not create individual official completion evidence/i)).toBeTruthy();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Review Packet' })).toBeTruthy());
    expect(screen.getByRole('button', { name: 'Open Packet in New Tab' })).toBeTruthy();
    expect(screen.getByText(/v1.0.3 · review required/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Open Facilitator Console' }));

    expect(screen.getByText('Facilitator Console · GB-2026')).toBeTruthy();
    const voteTable = screen.getByRole('table', { name: /live vote matrix/i });
    expect(within(voteTable).getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText(/5 of 5/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Participant Workspace' }));
    expect((screen.getByRole('combobox', { name: 'Participant' }) as HTMLSelectElement).value).toMatch(/^p-/);
    expect(screen.getByText('Individual Critical-Competency Capture')).toBeTruthy();
  });
});
