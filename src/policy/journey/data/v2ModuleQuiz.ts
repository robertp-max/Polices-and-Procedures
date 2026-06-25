export type V2QuizItem = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
};

export { MODULE_QUIZ_PASS_PCT, moduleQuizItems, scoreModuleQuiz } from "./contentV2Adapter";
