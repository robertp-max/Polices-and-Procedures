export type SourcePosture = 'verified' | 'provisional' | 'gated';

export type AcademyModuleSummary = {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  domain: string;
  duration: string;
  difficulty: 'Advanced' | 'Expert' | 'Capstone';
  posture: SourcePosture;
  postureLabel: string;
  available: boolean;
  lede: string;
  sources: string[];
  achc: string[];
};

export type CaseEvidence = {
  id: string;
  code: string;
  title: string;
  kind: string;
  status: 'clean' | 'attention' | 'restricted';
  summary: string;
  details: string[];
  source: string;
  essential?: boolean;
  relevant?: boolean;
};

export type CaseFinding = {
  id: string;
  type: 'authority' | 'risk';
  statement: string;
  correct: boolean;
  critical?: boolean;
};

export type CaseDecision = {
  id: string;
  label: string;
  title: string;
  body: string;
  correct?: boolean;
  critical?: boolean;
};

export type RecordClause = {
  id: string;
  text: string;
  correct: boolean;
  critical?: boolean;
};

export type DefenseQuestion = {
  id: string;
  prompt: string;
  answers: string[];
  correct: number;
};

export type TransferQuestion = {
  prompt: string;
  answers: string[];
  correct: number;
  rationale: string;
};

export type ExecutiveCaseModule = AcademyModuleSummary & {
  caseTitle: string;
  caseDate: string;
  caseContext: string;
  decisiveDuty: string;
  doctrine: Array<{ number: string; title: string; body: string }>;
  evidence: CaseEvidence[];
  findings: CaseFinding[];
  decisions: CaseDecision[];
  recordPrompt: string;
  clauses: RecordClause[];
  defense: DefenseQuestion[];
  remediation: {
    duty: string;
    trap: string;
    repair: string;
    transferRule: string;
  };
  transfer: TransferQuestion;
};
