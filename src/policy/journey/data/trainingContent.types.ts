/* Training content schema for the Journey card-deck training player.
   Every GAO/role module conforms to ModuleTraining: a splash, an inline
   navigation card, one or more lessons (each a sequence of cards: summary,
   content, challenge), and a final test. Cards carry narration text used by
   the audio player and the master CSV. */

export type ChallengeFormat =
  | 'scenario_decision'   // multi-option scenario with one or more correct answers
  | 'sequencing'          // place steps in order
  | 'matching'            // match left items to right items
  | 'error_id'            // identify the errors / violations in a list
  | 'field_completion'    // complete required fields (acceptable answers list)
  | 'structured_input'    // typed answer with acceptable variants
  | 'true_false';         // true/false (also used in final tests)

export type CardType = 'summary' | 'content' | 'challenge';

export interface ChallengeOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface SequencingStep { id: string; label: string }
export interface MatchingPair { left: string; right: string }
export interface ErrorTarget { id: string; description: string }
export interface FieldDef { id: string; label: string; acceptableAnswers: string[]; hint?: string }

export interface ChallengeContent {
  id: string;
  format: ChallengeFormat;
  prompt: string;
  narration: string;
  /* Format-specific payloads */
  options?: ChallengeOption[];
  steps?: SequencingStep[];
  correctOrder?: string[];
  matches?: MatchingPair[];
  errorTargets?: ErrorTarget[];
  fields?: FieldDef[];
  /* Feedback envelope */
  policyRef?: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  complianceImpact: string;
  realWorldConsequence: string;
  correctBehaviorGuidance: string;
}

export interface BaseCard {
  id: string;
  type: CardType;
  title: string;
  /* Body is short on-screen text; narration is the spoken script. */
  body: string;
  narration: string;
  estDurationSec: number;
}

export interface SummaryCard extends BaseCard { type: 'summary'; imageUrl?: string }
export interface ContentCard extends BaseCard { type: 'content' }
export interface ChallengeCard extends BaseCard {
  type: 'challenge';
  challenge: ChallengeContent;
}

export type LessonCard = SummaryCard | ContentCard | ChallengeCard;

export interface Lesson {
  id: string;
  order: number;
  title: string;
  objectives: string[];
  cards: LessonCard[];
}

export interface SplashCard {
  title: string;
  subtitle: string;
  whyItMatters: string;
  narration: string;
  imageUrl?: string;
}

export interface NavigationCard {
  title: string;
  body: string;
  bullets: string[];
  narration: string;
}

export interface FinalTestQuestion {
  id: string;
  format: ChallengeFormat;
  prompt: string;
  narration: string;
  options?: ChallengeOption[];
  steps?: SequencingStep[];
  correctOrder?: string[];
  matches?: MatchingPair[];
  errorTargets?: ErrorTarget[];
  fields?: FieldDef[];
  rationale: string;
  policyRef?: string;
}

export interface FinalTest {
  id: string;
  passingScorePct: number;            // 0-1
  instructionsNarration: string;
  failAction: 'remediation' | 'retake' | 'escalate';
  questions: FinalTestQuestion[];
}

export type DurationSource = 'CMS' | 'PP' | 'DEFAULT';

export interface ModuleTraining {
  moduleId: string;
  policyRefs: string[];
  cmsRefs: string[];
  estimatedDurationMin: number;
  durationSource: DurationSource;
  splash: SplashCard;
  navigation: NavigationCard;
  lessons: Lesson[];
  finalTest: FinalTest;
  // v2.3+ QA metadata for narration-only duration and expansion tracking
  durationMethod?: string; // "narration-only"
  narrationWordsPerMinute?: number; // 130
  narrationWordCount?: number;
  estimatedNarrationMinutes?: number;
  contentReadingTimeCounted?: boolean;
  scenarioTimeCounted?: boolean;
  knowledgeCheckTimeCounted?: boolean;
  quizTimeCounted?: boolean;
  narrationOnlyPass?: boolean;
  readyForSmeReview?: boolean;
}
