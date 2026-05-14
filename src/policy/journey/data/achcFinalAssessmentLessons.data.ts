import type { Lesson, LessonCard } from './achcContentTypes';
import { achcAnnualTests } from './achcAnnualTests.data';

const LETTER = ['A', 'B', 'C', 'D', 'E'];

/**
 * Converts every module's 10-question final test into a Lesson (order: 5).
 * Each question produces TWO cards:
 *   1. MCQ challenge card  — question + options A-D + immediate inline remediation
 *   2. Debrief content card — confirms correct answer + full rationale (narrated)
 *
 * Pattern: Q1 MCQ → Q1 Debrief → Q2 MCQ → Q2 Debrief … Q10 MCQ → Q10 Debrief
 * Total: 20 cards per module (10 questions × 2).
 */
export const achcFinalAssessmentLessons: Lesson[] = achcAnnualTests.map(test => {
  const cards: LessonCard[] = [];

  test.questions.forEach((q, idx) => {
    const n = idx + 1;
    const correctLetter = LETTER[q.correct_answer];
    const correctLabel = q.choices[q.correct_answer];

    // ── MCQ challenge card ────────────────────────────────────────────────
    cards.push({
      card_id: `${test.topic_id}_final_q${n}`,
      type: 'challenge',
      title: `Final Assessment — Question ${n} of ${test.questions.length}`,
      content: q.prompt,
      narration_script:
        `Final assessment. Question ${n} of ${test.questions.length}. ` +
        `${q.prompt} ` +
        q.choices.map((c, i) => `Option ${LETTER[i]}: ${c}`).join('. ') + '.',
      audio_path: `/training-audio/${test.topic_id}/final/q${n}.wav`,
      image_url: '',
      estimated_duration: '0:35',
      completion_required: true,
      options: q.choices.map((choice, cIdx) => ({
        id: LETTER[cIdx],
        label: choice,
        isCorrect: cIdx === q.correct_answer,
        rationale: q.rationale,
      })),
    });

    // ── Debrief card ──────────────────────────────────────────────────────
    cards.push({
      card_id: `${test.topic_id}_final_q${n}_debrief`,
      type: 'content',
      title: `Question ${n} — Debrief`,
      content:
        `Correct Answer: ${correctLetter} — ${correctLabel}\n\n` +
        `${q.rationale}`,
      narration_script:
        `Debrief for question ${n}. ` +
        `The correct answer is option ${correctLetter}: ${correctLabel}. ` +
        `${q.rationale}`,
      audio_path: `/training-audio/${test.topic_id}/final/q${n}_debrief.wav`,
      image_url: '',
      estimated_duration: '0:30',
      completion_required: true,
    });
  });

  return {
    lesson_id: `${test.topic_id}_l5_final`,
    topic_id: test.topic_id,
    title: 'Final Competency Assessment',
    order: 5,
    cards,
  };
});
