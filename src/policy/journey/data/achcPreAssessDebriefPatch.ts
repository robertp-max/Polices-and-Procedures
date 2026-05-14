import type { Lesson, LessonCard } from './achcContentTypes';

/**
 * Inserts a debrief card immediately after every prehook MCQ challenge card
 * in a Module Introduction (L0) lesson.
 *
 * The debrief is auto-generated from the MCQ's options array, so it always
 * stays in sync with the question content without manual duplication.
 *
 * Debrief card pattern: challenge → debrief (content) → next challenge…
 */
export function patchL0WithDebriefs(lesson: Lesson): Lesson {
  if (lesson.order !== 0) return lesson;

  const patched: LessonCard[] = [];

  for (const card of lesson.cards) {
    patched.push(card);

    const isPrehookMcq =
      card.card_id.includes('_prehook_q') &&
      !card.card_id.includes('_debrief') &&
      card.type === 'challenge' &&
      Array.isArray(card.options) &&
      card.options.length > 0;

    if (isPrehookMcq) {
      const correct = card.options!.find(o => o.isCorrect);
      if (!correct) continue;

      // Derive question number from card_id (e.g. achc_m01_prehook_q2 → 2)
      const qNumMatch = card.card_id.match(/_q(\d+)$/);
      const qNum = qNumMatch ? qNumMatch[1] : '?';

      const content =
        `Correct Answer: ${correct.id} — ${correct.label}\n\n` +
        `${correct.rationale}\n\n` +
        `Keep this in mind as you work through the three lessons ahead.`;

      const narration =
        `Pre-assessment debrief for question ${qNum}. ` +
        `The correct answer is option ${correct.id}: ${correct.label}. ` +
        `${correct.rationale} ` +
        `Keep this in mind as you work through the lessons that follow.`;

      patched.push({
        card_id: `${card.card_id}_debrief`,
        type: 'content',
        title: `Pre-Assessment — Q${qNum} Debrief`,
        content,
        narration_script: narration,
        audio_path: card.audio_path.replace('.wav', '_debrief.wav'),
        image_url: card.image_url,
        estimated_duration: '0:35',
        completion_required: true,
      });
    }
  }

  return { ...lesson, cards: patched };
}
