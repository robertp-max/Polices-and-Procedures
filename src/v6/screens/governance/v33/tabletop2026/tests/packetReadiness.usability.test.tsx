import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PacketReadinessGate, {
  type PacketSaveStatus,
  type PacketReadinessValue,
  type ReadinessCheck,
} from '../PacketReadinessGate';
import { Q1_CASE_PACK } from '../data/q1Case';
import {
  createPacketReadinessState,
  derivePacketMatters,
  type Round0Stage,
} from '../packetReadiness';

const checks: ReadinessCheck[] = [
  {
    id: 'cutoff',
    label: 'Evidence is within the allowed date range',
    status: 'met',
    detail: 'Every record is within the source cutoff.',
    evidenceIds: [],
  },
  {
    id: 'source',
    label: 'Every record has an identifiable source',
    status: 'met',
    detail: 'Every record identifies its source.',
    evidenceIds: [],
  },
  {
    id: 'conflicts',
    label: 'Conflicting values have been identified',
    status: 'unknown',
    detail: 'Four evidence problems need a Board reliance determination.',
    evidenceIds: [],
  },
];

function completedConflicts(): PacketReadinessValue {
  const state = createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups);
  return {
    ...state,
    conflictDeterminations: Object.fromEntries(
      Q1_CASE_PACK.packetConflictGroups.map((group) => [
        group.id,
        {
          classification: 'limited_unresolved',
          reliance: 'both_with_limitation',
          note: `The Board preserved a limitation for ${group.id}.`,
          completedAt: '2026-04-09T18:00:00.000Z',
        },
      ]),
    ),
  };
}

function completeFullState(): PacketReadinessValue {
  return {
    ...completedConflicts(),
    conflictDeterminations: Object.fromEntries(
      Q1_CASE_PACK.packetConflictGroups.map((group) => [
        group.id,
        {
          classification: 'reconciled',
          reliance: 'record_a',
          note: `The Board reconciled ${group.id}.`,
          completedAt: '2026-04-09T18:00:00.000Z',
        },
      ]),
    ),
    disposition: 'full',
    mattersProceeding: derivePacketMatters(Q1_CASE_PACK).map((matter) => matter.id),
    boardRationale:
      'The paired records support the Board decision, and the saved limitations are preserved in the Board record.',
  };
}

function Harness({
  initialStage = 'check',
  initialValue = createPacketReadinessState(Q1_CASE_PACK.packetConflictGroups),
  saveStatus = 'saved',
  onRetrySave = vi.fn(),
}: {
  initialStage?: Round0Stage;
  initialValue?: PacketReadinessValue;
  saveStatus?: PacketSaveStatus;
  onRetrySave?: () => void;
}) {
  const [stage, setStage] = useState(initialStage);
  const [value, setValue] = useState(initialValue);
  return (
    <PacketReadinessGate
      casePack={Q1_CASE_PACK}
      checks={checks}
      value={value}
      stage={stage}
      onStageChange={setStage}
      onChange={setValue}
      onSubmit={vi.fn()}
      saveStatus={saveStatus}
      lastSavedAt={new Date().toISOString()}
      onRetrySave={onRetrySave}
    />
  );
}

describe('Round 0 first-time-user path', () => {
  it('shows only the packet check and one clear first action', () => {
    render(<Harness />);

    expect(screen.getByRole('heading', { name: 'Packet Check' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Review 4 evidence problems' }),
    ).toBeTruthy();
    expect(screen.queryByText('Select the Board disposition')).toBeNull();
    expect(screen.queryByLabelText('Board rationale')).toBeNull();
    expect(screen.queryByText('Board record preview')).toBeNull();
  });

  it('uses explicit autosave and retry language', () => {
    const onRetrySave = vi.fn();
    const { rerender } = render(
      <Harness saveStatus="saving" onRetrySave={onRetrySave} />,
    );

    expect(screen.getAllByText('Saving…').length).toBeGreaterThan(0);
    rerender(<Harness saveStatus="error" onRetrySave={onRetrySave} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Draft not saved — Retry' }),
    );
    expect(onRetrySave).toHaveBeenCalledOnce();
  });

  it('reviews one paired evidence problem at a time and preserves saved work', () => {
    render(<Harness />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Review 4 evidence problems' }),
    );

    expect(screen.getByText('Evidence Problem 1 of 4')).toBeTruthy();
    expect(screen.getAllByText('Record A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Record B').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Source status')).toHaveLength(2);
    expect(screen.getByText('After packet cutoff (2026-04-09)')).toBeTruthy();
    expect(
      screen.queryByRole('heading', { name: 'Board Reliance Decision' }),
    ).toBeNull();

    fireEvent.click(
      screen.getByLabelText(
        'The issue remains unresolved but affects only named matters.',
      ),
    );
    fireEvent.click(screen.getByLabelText('Record A'));
    fireEvent.change(screen.getByLabelText(/^Why\?/), {
      target: { value: 'The first source supports only the named matter.' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Save and review next problem' }),
    );

    expect(screen.getByText('Evidence Problem 2 of 4')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Evidence problem 1, saved' }),
    );
    expect(screen.getByLabelText(/^Why\?/)).toHaveProperty(
      'value',
      'The first source supports only the named matter.',
    );
  });

  it('shows neutral dispositions, searchable matter scope, and conditional follow-up', () => {
    render(<Harness initialStage="decision" initialValue={completedConflicts()} />);

    expect(
      screen.getByRole('heading', { name: 'Board Reliance Decision' }),
    ).toBeTruthy();
    expect(screen.queryByText(/recommended|best option|system recommendation/i)).toBeNull();

    fireEvent.click(
      screen.getByLabelText(
        /Proceed only on unaffected matters — Partial reliance/i,
      ),
    );
    const proceeding = screen.getByRole('group', {
      name: 'Matters allowed to proceed',
    });
    const held = screen.getByRole('group', { name: 'Matters held or limited' });
    const matters = derivePacketMatters(Q1_CASE_PACK);
    fireEvent.click(within(proceeding).getByLabelText(matters[0].label));
    matters.slice(1).forEach((matter) => {
      fireEvent.click(within(held).getByLabelText(matter.label));
    });

    expect(screen.getByLabelText('Search matters')).toBeTruthy();
    expect(screen.getByLabelText('Action')).toBeTruthy();
    expect(screen.getByLabelText('Owner')).toBeTruthy();
    expect(screen.getByLabelText('Due date')).toBeTruthy();
    expect(screen.getByLabelText('Return-to-Board date')).toBeTruthy();
    expect(screen.getByLabelText(/Board rationale/i)).toBeTruthy();
  });

  it('explains invalid calendar dates inline', () => {
    render(<Harness initialStage="decision" initialValue={completedConflicts()} />);

    fireEvent.click(
      screen.getByLabelText(
        /Proceed only on unaffected matters — Partial reliance/i,
      ),
    );
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-02-30' },
    });

    expect(screen.getByLabelText('Due date').getAttribute('aria-invalid')).toBe('true');
    expect(
      screen.getByText('Enter a real calendar date as YYYY-MM-DD.'),
    ).toBeTruthy();
  });

  it('shows exactly one next action when review is incomplete', () => {
    const matters = derivePacketMatters(Q1_CASE_PACK).map((matter) => matter.id);
    const partial: PacketReadinessValue = {
      ...completedConflicts(),
      disposition: 'partial',
      mattersProceeding: matters.slice(0, 1),
      mattersHeld: matters.slice(1),
      followUp: {
        action: 'Validate the conflicting source.',
        owner: 'Board Secretary',
        dueDate: '2026-04-15',
        returnDate: null,
      },
      boardRationale: 'Only the named unaffected matter may proceed.',
    };
    render(<Harness initialStage="review" initialValue={partial} />);

    expect(
      screen.getByText('One item remains: add a return-to-board date.'),
    ).toBeTruthy();
    expect(
      screen.getAllByRole('button', { name: 'Add a return-to-Board date' }),
    ).toHaveLength(1);
    expect(screen.queryByText(/blockers/i)).toBeNull();
  });

  it('requires confirmation and restores focus after dialog dismissal', async () => {
    render(<Harness initialStage="review" initialValue={completeFullState()} />);

    const lockButton = screen.getByRole('button', {
      name: 'Lock Round 0 and continue',
    });
    lockButton.focus();
    fireEvent.click(lockButton);

    expect(
      screen.getByRole('dialog', { name: 'Lock the Board record?' }),
    ).toBeTruthy();
    expect(
      screen.getByText(/continue to the next round/i),
    ).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Cancel' }),
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(lockButton));
  });
});
