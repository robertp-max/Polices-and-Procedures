const DOCUMENTATION_MATTERS_AUDIO_IDS = new Set([
  'l1-01',
  'l1-02',
  'l1-03',
  'l2-01',
  'l2-02',
  'l2-03',
  'l2-04',
  'l3-01',
  'l3-02',
  'l3-03',
  'l3-04',
  'l4-01',
  'l4-02',
  'l4-03',
  'l4-04',
  'l4-05',
  'l5-01',
  'l5-02',
  'l5-03',
  'l6-01',
  'l6-02',
  'l6-03',
  'l7-01',
  'l7-02',
  'l7-03',
  'l7-04',
  'l8-01',
  'l8-02',
  'l8-03',
  'l8-04',
]);

export function documentationMattersAudioKey(lessonId: string): string {
  return lessonId.trim().toLowerCase();
}

export function documentationMattersAudioPath(lessonId: string): string {
  return `/assets/narration/documentation-matters.lesson.${documentationMattersAudioKey(lessonId)}.delivery.wav`;
}

export function hasDocumentationMattersAudio(lessonId: string): boolean {
  return DOCUMENTATION_MATTERS_AUDIO_IDS.has(documentationMattersAudioKey(lessonId));
}

export const documentationMattersAudioIds = DOCUMENTATION_MATTERS_AUDIO_IDS;
