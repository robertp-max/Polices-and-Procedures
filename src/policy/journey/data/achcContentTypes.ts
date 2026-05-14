// Shared types for ACHC Annual Training content
// Used by both OnboardingV1JourneyPage.tsx and the ACHC data files

export type TopicStatus = 'AVAILABLE' | 'LOCKED';
export type TopicCategory = 'onboarding' | 'annual';
export type CardType = 'summary' | 'content' | 'challenge' | 'splash';

export type McqOption = {
  id: string;        // 'A' | 'B' | 'C' | 'D'
  label: string;     // option text
  isCorrect: boolean;
  rationale: string; // brief inline feedback shown after submission
};

export type LessonCard = {
  card_id: string;
  type: CardType;
  title: string;
  content: string;
  narration_script: string;
  audio_path: string;
  image_url: string;
  estimated_duration: string;
  completion_required: boolean;
  options?: McqOption[]; // present only on MCQ challenge cards
};

export type Lesson = {
  lesson_id: string;
  topic_id: string;
  title: string;
  order: number;
  cards: LessonCard[];
};

export type TestQuestion = {
  question_id: string;
  prompt: string;
  choices: string[];
  correct_answer: number;
  rationale: string;
};

export type TopicTest = {
  test_id: string;
  topic_id: string;
  passing_score: number;
  questions: TestQuestion[];
};
