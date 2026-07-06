import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { qapiQuizzes } from '../../data/advancedTraining/qapi.data';
import { QapiTrainingPanel } from './QapiTrainingPanel';

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function clickEnabledButton(name: string | RegExp) {
  const button = screen.getByRole('button', { name });
  expect((button as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(button);
  return button as HTMLButtonElement;
}

function clickNearestButton(label: string) {
  const button = screen.getByText(label).closest('button') as HTMLButtonElement | null;
  expect(button).toBeTruthy();
  expect(button?.disabled).toBe(false);
  fireEvent.click(button!);
  return button!;
}

describe('QapiTrainingPanel narration gate', () => {
  it('unlocks the lesson challenge only after narration ends and guided content is opened', async () => {
    const onComplete = vi.fn();
    const onEvidence = vi.fn();

    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: vi.fn(),
    });

    render(<QapiTrainingPanel moduleId="qapi" onComplete={onComplete} onEvidence={onEvidence} />);

    const audio = document.querySelector('audio');
    expect(audio?.getAttribute('src')).toBe('/advanced-training/qapi/audio/01-what-qapi-is-and-why-it-matters.wav');
    expect((screen.getByRole('button', { name: 'Assessment' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Challenge Locked' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Core frame' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.ended(audio as HTMLAudioElement);

    await screen.findByText('Narration complete');
    expect((screen.getByRole('button', { name: 'Assessment' }) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole('button', { name: 'Core frame' }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText('Next: Click Core frame.')).toBeTruthy();

    clickEnabledButton('Core frame');
    expect(screen.getByText('Next: Open Survey lens.')).toBeTruthy();
    clickEnabledButton('Survey lens');
    clickEnabledButton('Field application');
    clickEnabledButton('Terminology');
    clickNearestButton('Measure');
    clickNearestButton('Analyze');
    clickNearestButton('Improve');
    clickNearestButton('Prove');
    clickEnabledButton('Review Scenario');
    clickNearestButton('Supplemental Notes');
    clickNearestButton('Defensibility Trap');
    clickNearestButton('Key Terms');

    const openChallenge = await screen.findByRole('button', { name: /Open Challenge/ });
    expect((openChallenge as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(openChallenge);

    await screen.findByText('Lesson Challenge');
    clickEnabledButton(/QAPI must be an active, data-driven operational program/);
    expect(await screen.findByText('Correct')).toBeTruthy();
    clickEnabledButton('Mark Complete');
    expect(await screen.findByText('Completed')).toBeTruthy();

    clickEnabledButton('Assessment');
    await screen.findByText('QAPI Final Check');

    for (const question of qapiQuizzes) {
      const correct = question.options.find((option) => option.id === question.correctAnswerId);
      expect(correct).toBeTruthy();
      const label = screen.getByText(correct!.label);
      const button = label.closest('button') as HTMLButtonElement | null;
      expect(button).toBeTruthy();
      expect(button?.disabled).toBe(false);
      fireEvent.click(button!);
    }

    clickEnabledButton('Submit Evidence');

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(
        100,
        true,
        expect.objectContaining({
          artifactType: 'qapi-course-evidence',
          moduleId: 'qapi',
          policyId: 'QA-PG-001',
        }),
      );
    });
    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({
        artifactType: 'qapi-course-evidence',
        score: 100,
      }),
    );
    expect(await screen.findByText('QAPI Training Record')).toBeTruthy();
  });
});
