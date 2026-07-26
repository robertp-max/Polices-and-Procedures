import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearDraft, readDraft, writeDraft } from '../../compliance/complianceStore';
import { Q1_CASE_PACK } from '../data/q1Case';
import TabletopHub from '../TabletopHub';

const assignmentId = `gb:tabletop2026:${Q1_CASE_PACK.id}`;

afterEach(() => {
  clearDraft(assignmentId);
});

describe('Tabletop Hub draft recovery', () => {
  it('labels saved work as Resume and requires confirmation before starting over', () => {
    writeDraft({
      assignmentId,
      resume: {
        casePackId: Q1_CASE_PACK.id,
        phase: 'readiness',
        readinessStage: 'decision',
      },
      attemptNumber: 1,
      progressPercent: 0,
      submittedLocally: false,
      updatedAt: '2026-04-09T18:00:00.000Z',
    });
    const onLaunch = vi.fn();

    render(<TabletopHub onExit={vi.fn()} onLaunch={onLaunch} />);

    expect(
      screen.getByRole('button', { name: `Resume ${Q1_CASE_PACK.title} solo draft` }),
    ).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: 'Start over' })[0]);

    const confirmation = screen.getByRole('group', {
      name: `Start ${Q1_CASE_PACK.title} over`,
    });
    expect(within(confirmation).getByText('Discard this saved draft?')).toBeTruthy();
    expect(document.activeElement).toBe(
      within(confirmation).getByRole('button', { name: 'Cancel' }),
    );

    fireEvent.click(
      within(confirmation).getByRole('button', { name: 'Start over' }),
    );

    expect(readDraft(assignmentId)).toBeNull();
    expect(onLaunch).toHaveBeenCalledWith(Q1_CASE_PACK.id, 'solo');
  });
});
