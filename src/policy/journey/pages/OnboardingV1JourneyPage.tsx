import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  ChevronLeft, ChevronRight, Play, Pause, Mic, Volume2,
  CheckCircle, Plus, Edit2, Loader2, FileText, CheckSquare,
  AlertCircle, BookOpen, FileCheck, Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { ALL_MODULES, ACHC_ART } from '@/policy/journey/data/modules';
import type { JourneyRole, JourneyModule } from '@/policy/journey/types/journey';
import { achcLessons_M01_M04 } from '@/policy/journey/data/achcLessons_M01_M04.data';
import { achcLessons_M05_M08 } from '@/policy/journey/data/achcLessons_M05_M08.data';
import { achcLessons_M09_M12 } from '@/policy/journey/data/achcLessons_M09_M12.data';
import { achcAnnualTests } from '@/policy/journey/data/achcAnnualTests.data';
import { achcModuleIntroPatch } from '@/policy/journey/data/achcModuleIntroPatch.data';
import { achcFinalAssessmentLessons } from '@/policy/journey/data/achcFinalAssessmentLessons.data';
import { patchL0WithDebriefs } from '@/policy/journey/data/achcPreAssessDebriefPatch';

type CsvNarrationRow = {
  project: string;
  title: string;
  appLocation: string;
  narration: string;
};

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(value: string): string {
  return value.replace(/\s+/g, '').replace(/_/g, '').replace(/\./g, '').toLowerCase();
}

function parseNarrationCsv(text: string): { rows: CsvNarrationRow[]; error?: string } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { rows: [], error: 'CSV is empty.' };
  }

  const parsed = lines.map(parseCsvLine);
  const first = parsed[0];
  const normalized = first.map(normalizeHeader);
  const hasHeader = (
    normalized[0] === 'project'
    && normalized[1] === 'title'
    && normalized[2] === 'applocation'
    && normalized[3] === 'narration'
  );

  const dataRows = hasHeader ? parsed.slice(1) : parsed;
  const rows: CsvNarrationRow[] = [];

  for (let idx = 0; idx < dataRows.length; idx += 1) {
    const row = dataRows[idx];
    const lineNo = hasHeader ? idx + 2 : idx + 1;
    if (row.length < 4) {
      return { rows: [], error: `Row ${lineNo} has ${row.length} column(s). Expected 4 columns: Project, Title, app.location, Narration.` };
    }

    const [project, title, appLocation, narration] = row;
    if (!project || !title || !appLocation || !narration) {
      return { rows: [], error: `Row ${lineNo} contains blank required values. Fill Project, Title, app.location, and Narration.` };
    }

    rows.push({ project, title, appLocation, narration });
  }

  if (rows.length === 0) {
    return { rows: [], error: 'No data rows found. Include at least one narration record.' };
  }

  return { rows };
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&family=Roboto:wght@300;400;500&display=swap');

  :root {
    --primary: #C74601;
    --primary-dark: #a63a01;
    --secondary: #007970;
    --secondary-dark: #005f58;
    --secondary-darker: #005a53;
    --secondary-soft: #F0FAFA;
    --secondary-tint: #E5FEFF;
    --text-main: #1F1C1B;
    --text-muted: #52404B;
    --bg-light: #FAFBF8;
    --border-light: #E5E4E3;
    --success: #008540;
    --success-dark: #006b34;
    --success-soft: #E5F4EE;
    --success-tint: #f0faf4;
    --danger: #D70101;
    --danger-dark: #b80000;
    --danger-soft: #FBE6E6;
    --danger-tint: #fff5f5;
    --primary-tint: #FFF7F3;
    --secondary-hover: #d1f6f7;
    --cert-ink: #1B2A47;
    --cert-ink-hover: #142033;
  }

  .font-heading { font-family: 'Montserrat', sans-serif; }
  .font-body { font-family: 'Roboto', sans-serif; }

  body {
    background-color: #ffffff;
    color: var(--text-main);
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #E5E4E3; border-radius: 4px; }

  @keyframes soundwave {
    0% { height: 4px; }
    50% { height: 16px; }
    100% { height: 4px; }
  }
  .playing-wave span {
    display: block; width: 3px; background-color: var(--primary);
    border-radius: 2px; animation: soundwave 1.2s infinite ease-in-out;
  }
  .playing-wave span:nth-child(2) { animation-delay: 0.2s; }
  .playing-wave span:nth-child(3) { animation-delay: 0.4s; }
  .playing-wave span:nth-child(4) { animation-delay: 0.6s; }
`;

type TopicStatus = 'AVAILABLE' | 'LOCKED';
type TopicCategory = 'onboarding' | 'annual';

type Topic = {
  topic_id: string;
  title: string;
  description: string;
  policy_ids: string[];
  workflow_ids: string[];
  event_ids: string[];
  required_roles: string[];
  image_url: string;
  status: TopicStatus;
  category?: TopicCategory;
};

type CardType = 'summary' | 'content' | 'challenge' | 'splash';

type McqOption = {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale: string;
};

type LessonCard = {
  card_id: string;
  type: CardType;
  title: string;
  content: string;
  narration_script: string;
  audio_path: string;
  image_url: string;
  estimated_duration: string;
  completion_required: boolean;
  options?: McqOption[];
};

type Lesson = {
  lesson_id: string;
  topic_id: string;
  title: string;
  order: number;
  cards: LessonCard[];
};

type TestQuestion = {
  question_id: string;
  prompt: string;
  choices: string[];
  correct_answer: number;
  rationale: string;
};

type TopicTest = {
  test_id: string;
  topic_id: string;
  passing_score: number;
  questions: TestQuestion[];
};

type DemoDB = {
  topics: Topic[];
  lessons: Lesson[];
  tests: TopicTest[];
};

type CosmeticReward = {
  id: string;
  badgeLabel: string;
  cosmeticName: string;
  unlockAtCompletions: number;
  flavorText: string;
};

type RewardProgress = CosmeticReward & {
  unlocked: boolean;
};

const JOURNEY_ROLES: JourneyRole[] = ['ADM', 'DON', 'RN', 'LVN', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'HHA'];

const COSMETIC_REWARDS: CosmeticReward[] = [
  {
    id: 'rw_1',
    badgeLabel: 'Orientation Spark',
    cosmeticName: 'Copper Accent Theme',
    unlockAtCompletions: 1,
    flavorText: 'Unlocks a warm copper visual accent package.',
  },
  {
    id: 'rw_2',
    badgeLabel: 'Consistency Core',
    cosmeticName: 'Teal Pulse Theme',
    unlockAtCompletions: 5,
    flavorText: 'Unlocks a teal pulse UI treatment for progress cards.',
  },
  {
    id: 'rw_3',
    badgeLabel: 'Compliance Climber',
    cosmeticName: 'Graphite Minimal Theme',
    unlockAtCompletions: 10,
    flavorText: 'Unlocks a minimalist graphite visual skin.',
  },
  {
    id: 'rw_4',
    badgeLabel: 'Policy Pathfinder',
    cosmeticName: 'Emerald Audit Theme',
    unlockAtCompletions: 20,
    flavorText: 'Unlocks an emerald high-contrast compliance style.',
  },
  {
    id: 'rw_5',
    badgeLabel: 'Mastery Architect',
    cosmeticName: 'Obsidian Prestige Theme',
    unlockAtCompletions: 35,
    flavorText: 'Unlocks a prestige-level obsidian cosmetic pack.',
  },
  {
    id: 'rw_custom',
    badgeLabel: 'Custom Reward Slot',
    cosmeticName: 'TBD by Team',
    unlockAtCompletions: 50,
    flavorText: 'Reserved slot for your custom reward definition.',
  },
];

function buildRewardProgress(completedCount: number): RewardProgress[] {
  return COSMETIC_REWARDS.map(reward => ({
    ...reward,
    unlocked: completedCount >= reward.unlockAtCompletions,
  }));
}

function displayRoles(requiredRoles: string[]): string[] {
  return requiredRoles.includes('ALL') ? ['ALL'] : requiredRoles;
}

const defaultTopicImages = [
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
];

const CONSOLIDATED_DASHBOARD_MODULE_IDS: string[] = [
  'ANN-001', 'ANN-002', 'GAO-006', 'GAO-007', 'GAO-008', 'ANN-003', 'GAO-009', 'ANN-005', 'ADM-004', 'ANN-015',
  'GAO-010', 'ANN-004', 'ANN-014', 'DON-004', 'ANN-017', 'DON-011', 'DON-013', 'GAO-013',
  'ADM-005', 'DON-012', 'DON-007', 'ADM-013', 'DON-009',
  'ANN-009', 'GAO-017', 'ANN-007', 'ANN-006', 'GAO-014', 'HHA-005', 'GAO-016', 'ANN-012',
  'HHA-003', 'GAO-018', 'ANN-010', 'GAO-020',
  'ADM-010', 'GAO-023', 'GAO-024', 'ADM-012', 'ADM-015',
];

const consolidatedModules: JourneyModule[] = Array.from(new Set(CONSOLIDATED_DASHBOARD_MODULE_IDS))
  .map(id => ALL_MODULES.find(module => module.id === id))
  .filter((module): module is JourneyModule => Boolean(module));

function toTopicPlaceholder(module: JourneyModule, index: number): Topic {
  const requiredRoles = module.roles === 'ALL' ? ['ALL'] : module.roles;
  const methodText = module.method === 'None' ? 'Orientation review' : `Method: ${module.method}`;
  const policyText = module.policyRefs.length > 0 ? `Policy: ${module.policyRefs.join(', ')}` : 'Policy refs pending';
  const cmsText = module.cmsRefs.length > 0 ? `CMS: ${module.cmsRefs.join(', ')}` : 'CMS ref N/A';

  return {
    topic_id: module.id,
    title: module.title,
    description: `${methodText}. ${policyText}. ${cmsText}.`,
    policy_ids: module.policyRefs,
    workflow_ids: [],
    event_ids: [],
    required_roles: requiredRoles,
    image_url: defaultTopicImages[index % defaultTopicImages.length],
    status: module.prerequisites && module.prerequisites.length > 0 ? 'LOCKED' : 'AVAILABLE',
  };
}

const seedTopics: Topic[] = [
  {
    topic_id: 'GAO-013',
    title: 'Infection prevention - PPE, hand hygiene',
    description: 'Return demonstration and knowledge check on standard precautions, personal protective equipment, and the 5 moments of hand hygiene. (42 CFR 484.70)',
    policy_ids: ['CL-SD-016'],
    workflow_ids: ['CL-WF-32'],
    event_ids: ['EVT-AUDIT-04'],
    required_roles: ['ALL'],
    image_url: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
  {
    topic_id: 'GAO-007',
    title: 'HIPAA privacy - PHI handling, minimum necessary',
    description: 'Core principles of Protected Health Information (PHI), minimum necessary rules, and handling standards per 45 CFR 164.',
    policy_ids: ['CO-HP-001', 'CO-HP-004'],
    workflow_ids: [],
    event_ids: [],
    required_roles: ['ALL'],
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
  {
    topic_id: 'GAO-010',
    title: 'Patient rights & responsibilities',
    description: 'Overview of the patient bill of rights, acknowledgment procedures, and staff responsibilities per 42 CFR 484.50.',
    policy_ids: ['CL-PR-001'],
    workflow_ids: [],
    event_ids: [],
    required_roles: ['ALL'],
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
  {
    topic_id: 'ANN-002',
    title: 'Fraud / Waste / Abuse',
    description: 'Annual training on identifying, preventing, and reporting healthcare fraud, waste, and abuse.',
    policy_ids: ['CO-CP-001'],
    workflow_ids: [],
    event_ids: [],
    required_roles: ['ALL'],
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
    status: 'AVAILABLE',
  },
  {
    topic_id: 'DON-005',
    title: 'OASIS oversight & accuracy',
    description: 'Advanced coding exercises and oversight strategies for ensuring OASIS assessment accuracy. BLOCKED - General Agency Orientation (GAO) not complete.',
    policy_ids: ['CL-OA-006'],
    workflow_ids: ['CL-WF-27'],
    event_ids: [],
    required_roles: ['DON'],
    image_url: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
    status: 'LOCKED',
  },
];

const canonicalTopicMap = new Map<string, Topic>();
consolidatedModules.forEach((module, index) => {
  canonicalTopicMap.set(module.id, toTopicPlaceholder(module, index));
});

seedTopics.forEach(topic => {
  const existing = canonicalTopicMap.get(topic.topic_id);
  if (!existing) {
    canonicalTopicMap.set(topic.topic_id, topic);
    return;
  }

  canonicalTopicMap.set(topic.topic_id, {
    ...existing,
    ...topic,
  });
});

const canonicalTopics: Topic[] = Array.from(canonicalTopicMap.values())
  .sort((a, b) => a.topic_id.localeCompare(b.topic_id));

const moduleByTopicId = new Map(consolidatedModules.map(module => [module.id, module]));

const seedLessons: Lesson[] = [
  {
    lesson_id: 'les_1',
    topic_id: 'GAO-013',
    title: 'Lesson 1: The 5 Moments for Hand Hygiene',
    order: 1,
    cards: [
      {
        card_id: 'c_1', type: 'summary', title: 'Introduction to the 5 Moments',
        content: 'Hand hygiene is the most effective way to prevent the spread of infections. The World Health Organization defines "5 Moments" when healthcare workers must perform hand hygiene to protect both the patient and themselves.',
        narration_script: 'Welcome to Lesson 1. Hand hygiene is the most effective way to prevent the spread of infections. The World Health Organization defines five specific moments when healthcare workers must perform hand hygiene to protect both the patient and themselves.',
        audio_path: '/training-audio/GAO-013/les_1/c_1.wav',
        image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1200&auto=format&fit=crop',
        estimated_duration: '0:45', completion_required: true,
      },
      {
        card_id: 'c_2', type: 'content', title: 'Applying the 5 Moments',
        content: 'The 5 moments are:\n1. Before touching a patient\n2. Before clean/aseptic procedures\n3. After body fluid exposure/risk\n4. After touching a patient\n5. After touching patient surroundings\n\nExample: Even if you only adjust the patient\'s IV pump (surroundings), you must wash your hands before moving to another task.',
        narration_script: 'The five moments are: One, before touching a patient. Two, before clean or aseptic procedures. Three, after body fluid exposure risk. Four, after touching a patient. And Five, after touching patient surroundings. For example, even if you only adjust the IV pump, you must wash your hands before moving to another task.',
        audio_path: '/training-audio/GAO-013/les_1/c_2.wav',
        image_url: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=1200&auto=format&fit=crop',
        estimated_duration: '1:15', completion_required: true,
      },
      {
        card_id: 'c_2_1', type: 'content', title: 'Personal Protective Equipment (PPE)',
        content: 'PPE provides a physical barrier against infectious materials. Always don PPE before contact with the patient, generally before entering the room. Doff and discard carefully, either at the doorway or immediately outside the patient room.',
        narration_script: 'PPE provides a physical barrier against infectious materials. Always don PPE before contact with the patient, generally before entering the room. Doff and discard carefully, either at the doorway or immediately outside the patient room.',
        audio_path: '/training-audio/GAO-013/les_1/c_2_1.wav',
        image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop',
        estimated_duration: '0:55', completion_required: true,
      },
      {
        card_id: 'c_3', type: 'challenge', title: 'Knowledge Application',
        content: 'You enter a patient\'s room to deliver meal trays. You move the overbed table, place the tray down, and realize the patient needs help sitting up. \n\nBased on the 5 Moments, what must you do before physically assisting the patient?',
        narration_script: 'Time for a scenario. You enter a patient\'s room to deliver meal trays. You move the overbed table, place the tray down, and realize the patient needs help sitting up. Based on the 5 Moments, what must you do before physically assisting the patient? Type your response below.',
        audio_path: '/training-audio/GAO-013/les_1/c_3.wav',
        image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop',
        estimated_duration: '0:30', completion_required: true,
      },
    ],
  },
];

const seedTests: TopicTest[] = [
  {
    test_id: 'tst_1', topic_id: 'GAO-013', passing_score: 100,
    questions: [
      {
        question_id: 'q_1',
        prompt: 'Which of the following activities requires hand hygiene immediately afterward?',
        choices: [
          'Typing on the nursing station computer.',
          'Emptying a urinary catheter bag.',
          'Walking down the hallway.',
          'Reading a patient chart.',
        ],
        correct_answer: 1,
        rationale: 'Emptying a catheter bag represents a body fluid exposure risk (Moment 3), which mandatorily requires hand hygiene immediately afterward.',
      },
    ],
  },
];

function buildGeneratedLesson(topic: Topic): Lesson {
  const module = moduleByTopicId.get(topic.topic_id);
  const methodLabel = module?.method && module.method !== 'None' ? module.method : 'OrientationReview';
  const methodText = module?.method && module.method !== 'None' ? `Competency method: ${module.method}.` : 'Competency method: Orientation review.';
  const prereqText = module?.prerequisites && module.prerequisites.length > 0
    ? `Prerequisites: ${module.prerequisites.join(', ')}.`
    : 'No prerequisite modules are required.';
  const policyText = topic.policy_ids.length > 0 ? topic.policy_ids.join(', ') : 'N/A';
  const cmsText = module?.cmsRefs && module.cmsRefs.length > 0 ? module.cmsRefs.join(', ') : 'N/A';
  const duration = module?.durationMinutes && module.durationMinutes > 0
    ? `${module.durationMinutes} minutes`
    : '30 minutes';
  const cardPrefix = topic.topic_id.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  return {
    lesson_id: `les_${cardPrefix}`,
    topic_id: topic.topic_id,
    title: `${topic.topic_id}: ${topic.title}`,
    order: 1,
    cards: [
      {
        card_id: `${cardPrefix}_summary`,
        type: 'summary',
        title: 'Training Brief',
        content: `${topic.title}\n\n${topic.description}`,
        narration_script: `${topic.title}. ${topic.description}`,
        audio_path: `/training-audio/${topic.topic_id}/lesson/summary.wav`,
        image_url: topic.image_url,
        estimated_duration: '0:45',
        completion_required: true,
      },
      {
        card_id: `${cardPrefix}_content`,
        type: 'content',
        title: 'Policy and Compliance Context',
        content: `Policy references: ${policyText}.\nCMS references: ${cmsText}.\n${methodText}\n${prereqText}\nEstimated duration: ${duration}.`,
        narration_script: `Review policy and compliance requirements for ${topic.topic_id}. ${methodText} ${prereqText}`,
        audio_path: `/training-audio/${topic.topic_id}/lesson/context.wav`,
        image_url: topic.image_url,
        estimated_duration: '1:10',
        completion_required: true,
      },
      {
        card_id: `${cardPrefix}_challenge`,
        type: 'challenge',
        title: `${methodLabel} Validation`,
        content: `Describe how you will complete ${topic.topic_id} by applying ${methodLabel}. Include at least one action tied to policy and one action tied to documentation.`,
        narration_script: `Complete the ${methodLabel} validation for ${topic.topic_id} and provide your action plan.`,
        audio_path: `/training-audio/${topic.topic_id}/lesson/challenge.wav`,
        image_url: topic.image_url,
        estimated_duration: '0:40',
        completion_required: true,
      },
    ],
  };
}

const generatedLessons: Lesson[] = canonicalTopics
  .filter(topic => !seedLessons.some(lesson => lesson.topic_id === topic.topic_id))
  .map(topic => buildGeneratedLesson(topic));

const syncedLessons: Lesson[] = [...seedLessons, ...generatedLessons];

function buildGeneratedTest(topic: Topic): TopicTest {
  const module = moduleByTopicId.get(topic.topic_id);
  const methodText = module?.method && module.method !== 'None' ? module.method : 'OrientationReview';

  return {
    test_id: `tst_${topic.topic_id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    topic_id: topic.topic_id,
    passing_score: 100,
    questions: [
      {
        question_id: `q_${topic.topic_id.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
        prompt: `What best confirms completion readiness for ${topic.topic_id}?`,
        choices: [
          `Complete ${methodText} requirements and align to listed policy references.`,
          'Skip policy references if practical experience exists.',
          'Mark complete before evidence is documented.',
          'Wait for annual review instead of completing this training.',
        ],
        correct_answer: 0,
        rationale: `Completion for ${topic.topic_id} requires documented competency evidence mapped to required method and policy references.`,
      },
    ],
  };
}

const generatedTests: TopicTest[] = canonicalTopics
  .filter(topic => !seedTests.some(test => test.topic_id === topic.topic_id))
  .map(topic => buildGeneratedTest(topic));

const syncedTests: TopicTest[] = [...seedTests, ...generatedTests];

// ─── ACHC Annual Training — Module images ────────────────────────────────────
const ACHC_IMG: Record<string, string> = {
  'ACHC-ART-M01': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M02': 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M03': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M04': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M05': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M06': 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M07': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M08': 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M09': 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M10': 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M11': 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600&auto=format&fit=crop',
  'ACHC-ART-M12': 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=600&auto=format&fit=crop',
};

// ─── ACHC Annual Training — Topics ───────────────────────────────────────────
const achcSeedTopics: Topic[] = ACHC_ART.map(m => ({
  topic_id: m.id,
  title: m.title,
  description: `ACHC-required annual training. ${m.policyRefs.length ? `Policy: ${m.policyRefs.join(', ')}.` : ''} ${m.cmsRefs.length ? `Reg: ${m.cmsRefs.join(', ')}.` : ''} Passing score: 80%. Estimated duration: ${m.durationMinutes ?? 45} min. Includes pre-assessment hook, 3 scenario-based lessons with challenges, and final competency exam.`,
  policy_ids: m.policyRefs,
  workflow_ids: [],
  event_ids: [],
  required_roles: m.roles === 'ALL' ? ['ALL'] : m.roles,
  image_url: ACHC_IMG[m.id] ?? defaultTopicImages[0],
  status: 'AVAILABLE' as TopicStatus,
  category: 'annual' as TopicCategory,
}));

// ─── ACHC Annual Training — Lessons ──────────────────────────────────────────
// Build base set from data files, then:
//   • Replace every L0 with the new patched version (splash + 3 pre-assessment MCQs)
//   • Append L5 final assessment lessons (10 individual MCQ cards per module)
const _achcBase = [
  ...achcLessons_M01_M04,
  ...achcLessons_M05_M08,
  ...achcLessons_M09_M12,] as Lesson[];

const achcSeedLessons: Lesson[] = [
  // Replace L0s with patched intro lessons (with debrief cards after each pre-assess MCQ)
  ..._achcBase.filter(l => l.order !== 0),
  ...(achcModuleIntroPatch.map(patchL0WithDebriefs) as unknown as Lesson[]),
  // Append L5 final-assessment lessons (MCQ + debrief card pairs)
  ...(achcFinalAssessmentLessons as unknown as Lesson[]),
];

// Legacy inline lessons kept for M01–M12 fallback rendering (replaced by imports above)
// The following array is intentionally empty — content lives in data files.
const _legacyInlineLessons: Lesson[] = [

  /* ══════════════════════════ M01 Cultural Awareness ══════════════════════════ */
  {
    lesson_id: 'achc_m01_l1', topic_id: 'ACHC-ART-M01', title: 'Lesson 1: Cultural Competence & CLAS Standards', order: 1,
    cards: [
      { card_id: 'achc_m01_l1_s', type: 'summary', title: 'What Is Cultural Competence?',
        content: 'Cultural competence is the ability to deliver effective care to patients from diverse cultural backgrounds. The 15 CLAS Standards set the federal benchmark for culturally and linguistically appropriate services. Non-compliance creates survey risk and patient safety exposure.',
        narration_script: 'Cultural competence is the ability to deliver effective care to patients with different cultural backgrounds, values, and communication styles. The CLAS Standards — fifteen federal benchmarks — define what equitable care looks like in home health. This is not a soft skill. It is a survey-ready, patient-safety requirement.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m01_l1_c1', type: 'content', title: 'The 15 CLAS Standards',
        content: 'CLAS Standards require: (1) Governance, leadership, and workforce diversity. (2) Communication and language assistance for LEP patients at no cost. (3) Engagement, continuous improvement, and accountability. In home health, this means offering interpreter services, adapting care delivery to cultural preferences, and documenting cultural accommodations.',
        narration_script: 'The CLAS Standards have three domains. First: governance and workforce — your agency must build cultural competence into hiring, training, and leadership. Second: language assistance — patients with limited English proficiency must receive qualified interpreter services at no cost, not a family member translation. Third: accountability — cultural accommodations must be documented in the clinical record.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m01_l1_ch', type: 'challenge', title: 'Scenario: Religious and Cultural Care Refusal',
        content: 'You arrive at a patient\'s home for wound care. The patient\'s daughter tells you her mother does not allow male caregivers to provide personal care — it is against their religious beliefs. The wound needs dressing. The patient nods in agreement with her daughter.\n\nWhat are your next steps? Consider: patient rights, CLAS Standards, and care continuity.',
        narration_script: 'Time for a scenario. You arrive for wound care. The patient\'s daughter says her mother will not allow a male caregiver to provide personal care due to religious beliefs. The patient agrees. The wound needs attention. What are your next steps? Think about patient rights, CLAS Standards, and what you document.',
        audio_path: '/training-audio/ACHC-ART-M01/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m01_l2', topic_id: 'ACHC-ART-M01', title: 'Lesson 2: Communication Across Cultures', order: 2,
    cards: [
      { card_id: 'achc_m01_l2_s', type: 'summary', title: 'Culture Shapes Every Interaction',
        content: 'Eye contact, silence, physical touch, gender roles, and decision-making authority vary dramatically across cultures. Misreading these signals leads to communication failures, care refusals, and patient harm.',
        narration_script: 'Culture shapes how your patients communicate with you — or whether they communicate at all. Eye contact that signals respect in one culture signals aggression in another. Silence may mean agreement, or shame, or confusion. In some cultures, health decisions are made by the family, not the patient. Recognizing these patterns is the first step to effective care.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m01_l2_c1', type: 'content', title: 'Practical Cultural Communication Strategies',
        content: 'Use: open body language, neutral tone, teach-back in plain language. Never assume: a nod = understanding, silence = consent, eye avoidance = disrespect. For LEP patients, use agency-approved interpreter services — family members should not interpret clinical content (risk of filtering or mistranslation that harms care).',
        narration_script: 'Three rules for cross-cultural communication. First: use open body language and a neutral tone — avoid assumptions about what signals mean. Second: verify comprehension with teach-back — ask the patient to explain back or demonstrate, never accept a nod as understanding. Third: for patients with limited English, use your agency-approved interpreter service. Family members must not interpret clinical content.',
        audio_path: '/training-audio/ACHC-ART-M01/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m01_l2_ch', type: 'challenge', title: 'Scenario: Medication Education With Language Barrier',
        content: 'You are teaching a newly diagnosed diabetic patient how to use an insulin pen. The patient nods throughout your explanation and says "yes, yes" to all your questions. He speaks limited English. When you ask him to demonstrate, he picks up the pen incorrectly.\n\nWhat do you do now, and what do you document?',
        narration_script: 'Here is your scenario. You are teaching insulin pen technique. The patient nods and says yes throughout. He speaks limited English. When you ask him to demonstrate, he holds the pen incorrectly. What do you do, and what do you document?',
        audio_path: '/training-audio/ACHC-ART-M01/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m01_l3', topic_id: 'ACHC-ART-M01', title: 'Lesson 3: Bias, Discrimination and Professional Conduct', order: 3,
    cards: [
      { card_id: 'achc_m01_l3_s', type: 'summary', title: 'Cultural Bias vs Workplace Discrimination',
        content: 'Cultural bias = an unconscious preference that affects how you respond to a patient. Workplace discrimination = adverse action based on a protected characteristic. Both affect care quality. Both are your professional responsibility.',
        narration_script: 'Cultural bias is unconscious. It affects who you spend more time with, who you assume understands less, who you assume is non-compliant. Workplace discrimination is when bias drives an action — assigning a patient away, refusing to enter a home, treating one family differently than another. Both are your professional responsibility to recognize and address.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m01_l3_c1', type: 'content', title: 'EEOC Protections and Reporting Obligations',
        content: 'EEOC prohibits employment discrimination based on race, color, national origin, sex, religion, age, and disability. As a healthcare worker, you are also protected against patient-directed discrimination. Obligation: document discriminatory incidents objectively and report to your supervisor and HR. Retaliation for reporting is separately prohibited.',
        narration_script: 'The EEOC prohibits discrimination in employment based on race, national origin, religion, sex, age, and disability. If a patient or family directs discriminatory language or behavior toward you or a colleague, you are obligated to document it objectively and report to your supervisor and HR. Retaliation for making a good-faith report is separately prohibited under federal law.',
        audio_path: '/training-audio/ACHC-ART-M01/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '1:00', completion_required: true },
      { card_id: 'achc_m01_l3_ch', type: 'challenge', title: 'Scenario: Witness to a Discriminatory Remark',
        content: 'During a team visit, your coworker mutters to you: "These people never follow instructions — it\'s their culture." The patient is in the next room. You are the only witness.\n\nWhat is your professional obligation? What do you do next?',
        narration_script: 'Scenario. Your coworker mutters to you about a patient — "these people never follow instructions, it\'s their culture." The patient is in the next room. You are the only witness. What is your professional obligation? What do you do next?',
        audio_path: '/training-audio/ACHC-ART-M01/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M01'], estimated_duration: '0:30', completion_required: true },
    ],
  },

  /* ══════════════════════ M02 Emergency & Disaster Preparedness ══════════════ */
  {
    lesson_id: 'achc_m02_l1', topic_id: 'ACHC-ART-M02', title: 'Lesson 1: Your Role in the Emergency Plan', order: 1,
    cards: [
      { card_id: 'achc_m02_l1_s', type: 'summary', title: 'The EPRP — Your Field Responsibility',
        content: 'The Agency Emergency Preparedness and Response Plan (EPRP) assigns every field worker a specific role during emergencies. You are not expected to improvise — you are expected to execute the plan.',
        narration_script: 'The Agency Emergency Preparedness and Response Plan exists so that when a disaster strikes, every employee knows their role. You are not expected to figure it out in the moment. Your job is to know the plan before the emergency arrives, and execute it when it does. This lesson covers your specific role as a field worker.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m02_l1_c1', type: 'content', title: 'Activation, Communication Chain, and Patient Notification',
        content: 'When an emergency is declared: (1) Stop non-urgent visits. (2) Contact your supervisor immediately. (3) Attempt to contact all patients on your schedule — document each attempt. (4) Follow the agency communication tree. Patients must be notified within the timeframe specified in the plan. Never assume another staff member has made contact.',
        narration_script: 'When an emergency is declared, your first four steps are: stop non-urgent visits, contact your supervisor immediately, attempt to contact every patient on your schedule and document every attempt, and follow the agency communication tree. Do not assume someone else made contact with your patients. Document every call with the time and outcome.',
        audio_path: '/training-audio/ACHC-ART-M02/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '1:00', completion_required: true },
      { card_id: 'achc_m02_l1_ch', type: 'challenge', title: 'Scenario: Shelter-in-Place Order',
        content: 'At 6:15 AM you receive a shelter-in-place notification for your service area. You have 4 patients scheduled for today. You cannot reach your supervisor on the first attempt.\n\nList your actions in order. What do you document? How long do you wait before escalating?',
        narration_script: 'Scenario. You receive a shelter-in-place order at 6:15 AM. Four patients are scheduled. Your supervisor does not answer on the first call. List your actions in order. What do you document? When do you escalate and to whom?',
        audio_path: '/training-audio/ACHC-ART-M02/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m02_l2', topic_id: 'ACHC-ART-M02', title: 'Lesson 2: Patient Triage and Evacuation Priorities', order: 2,
    cards: [
      { card_id: 'achc_m02_l2_s', type: 'summary', title: 'Class I–IV Triage System',
        content: 'Home health uses a 4-class triage system to prioritize patient contact and evacuation during emergencies. Class I patients have the highest risk. Your caseload should be stratified in advance.',
        narration_script: 'Home health agencies use a four-class triage system for emergencies. Class One patients are life-sustaining technology dependent — ventilators, infusion pumps, oxygen. They are contacted first. Class Two patients have significant medical needs. Class Three have moderate needs. Class Four can manage independently. You should know your patients\' triage class before an emergency happens.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m02_l2_c1', type: 'content', title: 'Class Definitions and Evacuation Protocols',
        content: 'Class I: Technology-dependent (vent, IV, O2 > 4L). Contact within 30 minutes of emergency activation.\nClass II: Significant medical needs — wounds, unstable conditions. Contact within 1 hour.\nClass III: Moderate needs — stable conditions. Contact within 4 hours.\nClass IV: Independent, no medical equipment. Monitor per plan.\nEvacuation: facilitate, do not transport patients yourself. Coordinate with emergency services.',
        narration_script: 'Class One: technology-dependent patients must be contacted within thirty minutes of emergency activation. These patients cannot survive without power, supplies, or clinical support. Class Two: significant medical needs, contact within one hour. Class Three: stable patients, contact within four hours. Class Four: independent. For evacuation, your role is to facilitate and coordinate with emergency services. You do not transport patients yourself.',
        audio_path: '/training-audio/ACHC-ART-M02/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m02_l2_ch', type: 'challenge', title: 'Scenario: Wildfire Evacuation',
        content: 'A wildfire evacuation order is issued for your service area. You have five patients: (A) on home ventilator, (B) ambulatory, stable wound care, (C) dementia, lives alone, (D) refused to evacuate, (E) daughter present and will assist.\n\nIn what order do you contact them, and what special actions apply to each?',
        narration_script: 'Wildfire evacuation order. Five patients: A is on a home ventilator. B is ambulatory with stable wound care. C has dementia and lives alone. D has already refused to evacuate. E has her daughter present and available. In what order do you contact them, and what special action applies to each?',
        audio_path: '/training-audio/ACHC-ART-M02/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m02_l3', topic_id: 'ACHC-ART-M02', title: 'Lesson 3: Documentation During Emergencies', order: 3,
    cards: [
      { card_id: 'achc_m02_l3_s', type: 'summary', title: 'Documentation Obligations When Systems Fail',
        content: 'During an emergency, documentation requirements do not stop — they shift to paper backup. Your documentation becomes the legal and clinical record of what happened to every patient under your care.',
        narration_script: 'During an emergency, you are still legally required to document. Systems may be down. Your EMR may be unavailable. But the documentation obligation does not disappear — it shifts to paper. What you write during an emergency becomes the legal and clinical record of what happened to every patient under your care.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m02_l3_c1', type: 'content', title: 'What to Document and How',
        content: 'Document: time of contact/attempt, patient status, care provided or deferred and reason, patient location if moved, instructions given to patient/family, all communication to supervisors with timestamps. Paper backup: use the agency paper form. Attestation: all paper records must be signed and dated. Transfer to EHR within 24 hours of system restoration.',
        narration_script: 'Document every contact attempt with timestamps. Document patient status at the time of contact. Document care provided or deferred and why. If a patient was moved, document their new location. Document all instructions given to the patient or family. Use the agency paper backup form. Sign and date every page. Transfer everything to the EHR within twenty-four hours of system restoration.',
        audio_path: '/training-audio/ACHC-ART-M02/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m02_l3_ch', type: 'challenge', title: 'Scenario: EHR Down During Emergency Visit',
        content: 'Your EHR is down due to the emergency. You just completed a wound care visit on a Class II patient. The wound showed new signs of infection. You also attempted to reach two other patients with no answer.\n\nUsing paper backup: what are the specific fields you must document for each event? What happens to this documentation when the EHR comes back online?',
        narration_script: 'The EHR is down. You completed wound care on a Class Two patient — new infection signs. You attempted two other patients with no answer. Using paper backup, what fields do you document for each event? What happens to this documentation when the system comes back online?',
        audio_path: '/training-audio/ACHC-ART-M02/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M02'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════════ M03 Complaints & Grievances ═════════════════════ */
  {
    lesson_id: 'achc_m03_l1', topic_id: 'ACHC-ART-M03', title: 'Lesson 1: Complaint vs Grievance vs Allegation', order: 1,
    cards: [
      { card_id: 'achc_m03_l1_s', type: 'summary', title: 'Three Different Events, Three Different Responses',
        content: 'A complaint, grievance, and allegation each require a different response pathway. Misclassifying one can result in a regulatory deficiency. As a field worker, your job is to receive, document, and submit — not to investigate.',
        narration_script: 'A complaint, a grievance, and an allegation are three different types of events, each requiring a different response. Your job as a field worker is not to investigate. It is to receive the concern, document it accurately, and submit it to the right person without delay.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m03_l1_c1', type: 'content', title: 'Definitions and Distinctions',
        content: 'Complaint: informal concern about service quality (e.g., "the nurse was late"). Response: address on the spot if possible, document, submit to supervisor.\nGrievance: formal allegation that patient rights were violated (written or verbal). Requires: documentation, admin submission, written response within 10 working days.\nAllegation: suspected abuse, neglect, or exploitation. Requires: immediate mandatory report per state law regardless of proof.',
        narration_script: 'A complaint is an informal concern about service quality — the nurse was late, the visit was too short. You address what you can, document it, and submit it to your supervisor. A grievance is a formal allegation that patient rights were violated. It requires a documented intake, administrative review, and a written response within ten working days. An allegation is suspected abuse, neglect, or exploitation. It requires immediate mandatory reporting under state law. Suspicion is sufficient. You do not need proof.',
        audio_path: '/training-audio/ACHC-ART-M03/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m03_l1_ch', type: 'challenge', title: 'Scenario: Classify the Event',
        content: 'During a visit, the patient\'s son approaches you and says in an angry tone: "Last week someone left bruises on my father\'s arms during his bath. I want this reported officially. I\'m calling the state."\n\nIs this a complaint, grievance, or allegation? What are your immediate next steps, and what do you never say?',
        narration_script: 'Scenario. The patient\'s son says: Last week someone left bruises on my father\'s arms during his bath. I want this reported officially. I\'m calling the state. Is this a complaint, grievance, or allegation? What are your immediate steps, and what should you never say in this moment?',
        audio_path: '/training-audio/ACHC-ART-M03/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m03_l2', topic_id: 'ACHC-ART-M03', title: 'Lesson 2: The Grievance Process', order: 2,
    cards: [
      { card_id: 'achc_m03_l2_s', type: 'summary', title: 'What Happens After You Receive a Grievance',
        content: 'A formal grievance activates a documented process with regulatory timelines. The 10-working-day response deadline is not a guideline — it is a CMS requirement. Your role is intake and immediate escalation.',
        narration_script: 'When a patient or family files a formal grievance, a documented process begins. The agency has ten working days to respond in writing. That deadline is a CMS Conditions of Participation requirement — not a guideline. Your role as the field worker is intake and immediate escalation to your administrator or supervisor.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m03_l2_c1', type: 'content', title: 'Grievance Process Step by Step',
        content: 'Step 1: Receive the grievance (any staff member can receive it).\nStep 2: Acknowledge and document — date, time, patient name, nature of concern, who reported it.\nStep 3: Submit to Administrator immediately.\nStep 4: Administrator investigates and prepares written response.\nStep 5: Written response to patient within 10 working days including findings and actions taken.\nStep 6: Log in grievance register.',
        narration_script: 'The grievance process has six steps. One: receive the grievance — any staff member can receive it. Two: acknowledge and document everything — date, time, patient name, nature of concern. Three: submit to the administrator immediately — do not wait until the end of your shift. Four: the administrator investigates. Five: the patient receives a written response within ten working days. Six: the event is logged in the agency grievance register.',
        audio_path: '/training-audio/ACHC-ART-M03/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m03_l2_ch', type: 'challenge', title: 'Scenario: Patient Calls You Directly to Grieve',
        content: 'A patient calls your personal cell phone at 7 PM and says: "I want to file a formal complaint about what happened today. The other nurse was rude and I want it documented."\n\nYou are not the administrator. What are your exact next steps? What do you document, and by when?',
        narration_script: 'Scenario. A patient calls your personal cell at seven PM. She says: I want to file a formal complaint about what happened today. The nurse was rude and I want it documented. You are not the administrator. What are your exact next steps? What do you document, and by when?',
        audio_path: '/training-audio/ACHC-ART-M03/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m03_l3', topic_id: 'ACHC-ART-M03', title: 'Lesson 3: De-escalation and Professional Communication', order: 3,
    cards: [
      { card_id: 'achc_m03_l3_s', type: 'summary', title: 'How You Respond in the First 60 Seconds Matters',
        content: 'A patient or family in distress needs to feel heard before they can hear you. De-escalation is not about ending the conversation — it is about creating the conditions for a professional one.',
        narration_script: 'When a patient or family is upset, the first sixty seconds of your response determine whether the situation stays manageable or escalates. Your goal is not to end the conversation. Your goal is to create the conditions for a professional one. That starts with listening and validating — not defending.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:35', completion_required: true },
      { card_id: 'achc_m03_l3_c1', type: 'content', title: 'What To Say and What Never To Say',
        content: 'DO: "I hear your concern and I want to make sure this is documented accurately. I am going to connect you with the right person right away."\nNEVER: "I didn\'t do anything wrong." "That\'s not what happened." "You would have to take that up with my supervisor." "That\'s just the policy."\nUse CUS: I\'m Concerned, I\'m Uncomfortable, this is a Safety issue. Validate without admitting liability.',
        narration_script: 'When a patient or family is upset, say: I hear your concern, and I want to make sure it is documented accurately. I am going to connect you with the right person right away. Then stop talking. Do not say: I didn\'t do anything wrong. Do not say: that\'s not what happened. Do not redirect them to your supervisor without first acknowledging their concern. Validate without admitting liability.',
        audio_path: '/training-audio/ACHC-ART-M03/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m03_l3_ch', type: 'challenge', title: 'Scenario: Accusatory Family Member',
        content: 'You arrive for a visit. The patient\'s daughter immediately blocks the doorway and says loudly: "You hurt my mother last week. I don\'t want you in this house. I\'m going to have your license revoked."\n\nUsing the de-escalation principles from this lesson: what do you say? What do you not say? What do you do next?',
        narration_script: 'Scenario. You arrive for a visit. The daughter blocks the door and says loudly: You hurt my mother last week. I don\'t want you in this house. I am going to have your license revoked. Using the principles from this lesson: what do you say, what do you not say, and what do you do next?',
        audio_path: '/training-audio/ACHC-ART-M03/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M03'], estimated_duration: '0:30', completion_required: true },
    ],
  },

  /* ══════════════════════════ M04 HIPAA Privacy & Security ════════════════════ */
  {
    lesson_id: 'achc_m04_l1', topic_id: 'ACHC-ART-M04', title: 'Lesson 1: PHI, the Privacy Rule, and the Minimum Necessary Standard', order: 1,
    cards: [
      { card_id: 'achc_m04_l1_s', type: 'summary', title: 'What Is Protected Health Information?',
        content: 'PHI includes any information that can identify a patient AND relates to their health condition, care, or payment. There are 18 categories. Violation does not require intent — a visible chart on your car seat is a violation.',
        narration_script: 'Protected Health Information is any information that can identify a patient and relates to their health status, care, or payment. There are eighteen categories of PHI — name, address, date of birth, phone number, photos, and twelve others. A HIPAA violation does not require intent. Leaving a chart visible on your car seat is a violation. Discussing a patient by name in a public place is a violation.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:50', completion_required: true },
      { card_id: 'achc_m04_l1_c1', type: 'content', title: 'The Minimum Necessary Standard and When You Can Share',
        content: 'Minimum necessary: use or share only the PHI needed for the specific purpose — no more. You may share PHI for: treatment (with the care team), payment (billing), and healthcare operations (quality review). You may NOT share without authorization: with employers, family without patient consent, law enforcement without a court order, or anyone not involved in care.',
        narration_script: 'The minimum necessary standard means you use or disclose only the PHI needed to accomplish the specific task — nothing more. You are permitted to share PHI for three purposes without patient authorization: treatment with the direct care team, payment and billing, and healthcare operations such as quality review. You may not share PHI with an employer, with a family member who does not have authorization, or with anyone not directly involved in the patient\'s care.',
        audio_path: '/training-audio/ACHC-ART-M04/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m04_l1_ch', type: 'challenge', title: 'Scenario: Neighbor Asks About Patient',
        content: 'You are loading supplies into your car outside a patient\'s apartment. A neighbor approaches: "I noticed you\'ve been visiting Mrs. Johnson. Is she okay? We haven\'t seen her walking in weeks."\n\nThe patient has signed no authorization for this neighbor. What do you say?',
        narration_script: 'Scenario. You are at your car outside a patient\'s building. A neighbor approaches and says: I\'ve noticed you visiting Mrs. Johnson. Is she okay? We haven\'t seen her walking in weeks. The patient has signed no authorization for this person. What do you say?',
        audio_path: '/training-audio/ACHC-ART-M04/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m04_l2', topic_id: 'ACHC-ART-M04', title: 'Lesson 2: HIPAA Security in the Field', order: 2,
    cards: [
      { card_id: 'achc_m04_l2_s', type: 'summary', title: 'Your Device Is a HIPAA Asset',
        content: 'Every device you use for work — phone, tablet, laptop, car — is subject to HIPAA security rules. The field environment creates unique risks that the Security Rule requires you to actively manage.',
        narration_script: 'Every device you use for work is a HIPAA security asset. Your phone, your tablet, your work laptop, even the paperwork on your front seat. The field environment creates security risks that a clinical facility doesn\'t have — you work in patient homes, in your car, in public spaces. The Security Rule requires you to actively manage those risks every day.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m04_l2_c1', type: 'content', title: 'Field Security Rules',
        content: 'Required: password/biometric lock on all work devices, encrypted messaging only for PHI, EHR access only via agency-approved apps, lock car when documents are inside, never photograph patients without consent.\nProhibited: texting PHI over personal SMS, posting anything patient-related on social media, accessing patient records from unsecured public Wi-Fi, leaving printed records visible in car.',
        narration_script: 'Required: password or biometric lock on all work devices. Encrypted messaging only when sharing PHI. Use only agency-approved apps to access the EHR. Lock your car whenever patient documents are inside. Never photograph a patient without documented consent. Prohibited: texting PHI over personal SMS. Posting anything patient-related on social media, even without the patient\'s name. Accessing patient records over unsecured public Wi-Fi. Leaving printed records visible in a parked car.',
        audio_path: '/training-audio/ACHC-ART-M04/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m04_l2_ch', type: 'challenge', title: 'Scenario: Forgot Document in Patient Home',
        content: 'You are already at your third visit when you realize you left a printed medication list on a patient\'s kitchen table at your second visit. The medication list includes the patient\'s name, date of birth, and full medication regimen.\n\nWhat are your obligations? What do you do right now?',
        narration_script: 'Scenario. You are at your third visit when you realize you left a printed medication list at your second patient\'s home. The list includes name, date of birth, and full medication regimen. What are your obligations? What do you do right now?',
        audio_path: '/training-audio/ACHC-ART-M04/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m04_l3', topic_id: 'ACHC-ART-M04', title: 'Lesson 3: Patient Rights and Breach Response', order: 3,
    cards: [
      { card_id: 'achc_m04_l3_s', type: 'summary', title: 'Patients Have Legal Rights Over Their Own PHI',
        content: 'HIPAA gives patients four primary rights over their PHI. When a breach may have occurred, you must report immediately — the breach notification clock starts at discovery, not confirmation.',
        narration_script: 'HIPAA gives patients four rights over their own information. The right to access their records. The right to amend inaccurate information. The right to an accounting of disclosures. And the right to request restrictions on use. When a breach may have occurred, your report to your Privacy Officer starts the breach notification process. The clock begins at discovery — not confirmation.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m04_l3_c1', type: 'content', title: 'Breach Identification and Your Reporting Obligation',
        content: 'A breach = unauthorized access, use, or disclosure of unsecured PHI that compromises security or privacy. You must report to the Privacy Officer immediately upon discovery — do not wait for confirmation. The Agency has 60 days to notify affected individuals and HHS. Your immediate report is the trigger. Document: what happened, when, what PHI was involved, who may have received it.',
        narration_script: 'A breach is any unauthorized access, use, or disclosure of unsecured PHI that compromises its security or privacy. When you discover or suspect a breach, report to your Privacy Officer immediately — do not wait until your shift ends, do not wait for confirmation that harm occurred. The agency has sixty days to notify affected patients and Health and Human Services. Your immediate report is what starts that process. Document: what happened, when, what PHI was involved, who may have received it.',
        audio_path: '/training-audio/ACHC-ART-M04/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m04_l3_ch', type: 'challenge', title: 'Scenario: Text Sent to Wrong Number',
        content: 'You sent a text message to what you thought was your coworker. The message included: patient first and last name, diagnosis, current medication, and visit notes. You realize the number was wrong — you sent it to an unknown phone number.\n\nIs this a reportable breach? What are your next actions within the next 30 minutes?',
        narration_script: 'Scenario. You sent a text with a patient\'s full name, diagnosis, medications, and visit notes. You realize you sent it to the wrong number. Is this a reportable breach? What are your next actions within the next thirty minutes?',
        audio_path: '/training-audio/ACHC-ART-M04/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M04'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════════ M05 Infection Control ═══════════════════════════ */
  {
    lesson_id: 'achc_m05_l1', topic_id: 'ACHC-ART-M05', title: 'Lesson 1: Standard Precautions — Every Patient, Every Visit', order: 1,
    cards: [
      { card_id: 'achc_m05_l1_s', type: 'summary', title: 'You Cannot Tell Who Is Infectious by Looking',
        content: 'Standard precautions apply to every patient — regardless of diagnosis, known infection status, or the patient\'s own statements. The reason: many infectious patients are asymptomatic.',
        narration_script: 'Standard precautions exist for one reason: you cannot tell who is infectious by looking at them. Many patients with bloodborne infections have no symptoms. A patient who looks and feels healthy can transmit HBV, HCV, or HIV through a single exposure. Standard precautions are not applied to high-risk patients — they are applied to all patients, all the time.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m05_l1_c1', type: 'content', title: 'What Standard Precautions Cover',
        content: 'Treat as infectious: blood, all body fluids (except sweat), non-intact skin, mucous membranes. Hand hygiene: 5 moments — before patient contact, before aseptic procedure, after fluid exposure risk, after patient contact, after touching patient surroundings. Soap and water: 15–20 seconds. ABHR: 20–30 seconds. ABHR is NOT effective against C. diff or norovirus.',
        narration_script: 'Standard precautions apply to blood, all body fluids except sweat, non-intact skin, and mucous membranes. The five moments of hand hygiene are: before touching the patient, before any aseptic procedure, after body fluid exposure risk, after touching the patient, and after touching patient surroundings. Soap and water for fifteen to twenty seconds. Alcohol-based hand rub for twenty to thirty seconds. Important: alcohol-based hand rub does not kill C. diff or norovirus. Use soap and water for those.',
        audio_path: '/training-audio/ACHC-ART-M05/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m05_l1_ch', type: 'challenge', title: 'Scenario: No Running Water',
        content: 'You arrive for wound care. The patient tells you the pipes froze last night — there is no running water anywhere in the home. The wound dressing is saturated and the wound needs attention.\n\nCan you proceed? What is your decision process? What do you document?',
        narration_script: 'Scenario. You arrive for wound care. No running water — the pipes froze. The wound dressing is saturated. Can you proceed? What is your decision process? What do you document?',
        audio_path: '/training-audio/ACHC-ART-M05/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m05_l2', topic_id: 'ACHC-ART-M05', title: 'Lesson 2: PPE Selection and Bag Technique', order: 2,
    cards: [
      { card_id: 'achc_m05_l2_s', type: 'summary', title: 'Match PPE to the Procedure Risk',
        content: 'PPE protects you. Bag technique protects the patient. Selecting the wrong PPE for a procedure creates exposure risk. Using bag technique incorrectly cross-contaminates between patients.',
        narration_script: 'PPE selection must match the procedure\'s exposure risk. Wearing gloves for a blood draw is not enough if splatter is possible — you also need eye protection. Bag technique is your infection barrier between patients. If your bag touches a contaminated surface and then opens at your next patient\'s home, you have transferred that contamination.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m05_l2_c1', type: 'content', title: 'PPE Decision Matrix and Bag Rules',
        content: 'Gloves: always for body fluid contact. Gown: when body fluid splash or contact with patient environment is likely. Mask (surgical): droplet precautions, respiratory symptoms. N95: airborne precautions (TB, COVID isolation). Eye protection: splash risk during procedures.\nBag technique rules: always place bag on a disposable barrier (never on the floor), clean hands before and after accessing bag, keep bag closed at all times except when actively retrieving supplies.',
        narration_script: 'PPE matrix: gloves for any body fluid contact. Gown when fluid splash or environmental contamination is likely. Surgical mask for droplet precautions. N95 for airborne precautions. Eye protection for any splash risk during a procedure. Bag technique: place your bag on a disposable barrier — never on the floor, never on the kitchen counter without a barrier. Clean your hands before and after accessing the bag. Keep it closed when you are not actively retrieving supplies.',
        audio_path: '/training-audio/ACHC-ART-M05/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m05_l2_ch', type: 'challenge', title: 'Scenario: Respiratory Symptoms in the Household',
        content: 'You enter a patient\'s home for a wound dressing change. You notice the patient\'s spouse and two children are visibly sick — coughing, sneezing, and one child has a fever of 103°F. Your patient is not symptomatic.\n\nWhat PPE do you select and why? Do you proceed with the visit? What do you document?',
        narration_script: 'Scenario. You enter the home for wound care. The patient\'s spouse and two children are visibly sick — coughing, sneezing, one child with a 103-degree fever. The patient is not symptomatic. What PPE do you select and why? Do you proceed? What do you document?',
        audio_path: '/training-audio/ACHC-ART-M05/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m05_l3', topic_id: 'ACHC-ART-M05', title: 'Lesson 3: Post-Exposure Response and Sharps Safety', order: 3,
    cards: [
      { card_id: 'achc_m05_l3_s', type: 'summary', title: 'Time Is Critical After Every Exposure',
        content: 'Post-exposure prophylaxis (PEP) for HIV is most effective within 2 hours and loses effectiveness after 72 hours. Every minute between exposure and evaluation costs therapeutic window. The response sequence is not optional.',
        narration_script: 'Post-exposure prophylaxis for HIV is most effective when started within two hours of exposure. After seventy-two hours it loses its effectiveness entirely. Every minute between exposure and medical evaluation is part of the therapeutic window. The post-exposure response protocol is not a suggestion — it is a timed medical response.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m05_l3_c1', type: 'content', title: 'Post-Exposure Protocol and Sharps Rules',
        content: 'Needlestick/cut: (1) Remove glove, wash site 30 seconds soap/water. (2) Call supervisor immediately. (3) Medical evaluation within 2 hours. (4) Document source patient info. (5) Complete exposure report.\nEye/mucous membrane: flush with water for 15 minutes. Same reporting chain.\nSharps rules: never recap needles with two hands, dispose immediately into sharps container, never overfill (fill to 2/3 line).',
        narration_script: 'After a needlestick: one, remove your glove and wash the site with soap and water for thirty seconds. Two, call your supervisor immediately. Three, seek medical evaluation within two hours — not tomorrow, within two hours. Four, document source patient information to facilitate bloodborne pathogen testing if consented. Five, complete the exposure incident report. For eye or mucous membrane contact: flush with water for fifteen minutes. Same reporting chain applies. Sharps rule: never recap a needle with both hands. Dispose immediately. Never fill a sharps container past the two-thirds line.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '1:15', completion_required: true },
      { card_id: 'achc_m05_l3_ch', type: 'challenge', title: 'Scenario: Needlestick During Injection',
        content: 'While giving a subcutaneous injection, the needle slips and punctures your finger through your glove. The patient is known to have Hepatitis C.\n\nList your first 4 actions in the correct order. Include: what you do with the patient, what you say, and your reporting timeline.',
        narration_script: 'Scenario. You are giving a subcutaneous injection. The needle slips and punctures your finger through your glove. The patient is known to have Hepatitis C. List your first four actions in the correct order. Include what you do with the patient, what you say, and your reporting timeline.',
        audio_path: '/training-audio/ACHC-ART-M05/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M05'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════════ M06 Communication Barriers ══════════════════════ */
  {
    lesson_id: 'achc_m06_l1', topic_id: 'ACHC-ART-M06', title: 'Lesson 1: Understanding the 7 Communication Barriers', order: 1,
    cards: [
      { card_id: 'achc_m06_l1_s', type: 'summary', title: 'Barriers Exist in Every Patient Encounter',
        content: 'Communication barriers are not exceptions — they are the rule in home health. The average home health patient has at least two active barriers in every visit. Recognition is the first clinical skill.',
        narration_script: 'Communication barriers are not exceptions in home health. They are the rule. The average home health patient is elderly, managing multiple conditions, receiving complex medication instructions, and may have language, hearing, cognitive, or emotional barriers that affect every visit. Recognition is your first clinical skill.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m06_l1_c1', type: 'content', title: 'The 7 Categories',
        content: '1. Language: speaks a different primary language or has limited English proficiency.\n2. Physical: hearing loss, vision impairment, speech difficulties.\n3. Gender: care preferences or communication taboos related to gender roles.\n4. Cultural: differing beliefs about illness, authority, disclosure.\n5. Emotional: fear, grief, denial, anxiety blocking reception.\n6. Perceptual: patient and clinician interpret the same event differently.\n7. Interpersonal: distrust, past negative experiences, power dynamics.',
        narration_script: 'The seven categories are: Language — limited English proficiency or a different primary language. Physical — hearing loss, vision impairment, speech difficulties. Gender — care preferences or communication taboos related to gender. Cultural — different beliefs about illness, authority, or disclosure. Emotional — fear, grief, denial, or anxiety blocking the patient\'s ability to receive information. Perceptual — you and the patient interpret the same event differently. Interpersonal — distrust, past negative healthcare experiences, or power dynamics.',
        audio_path: '/training-audio/ACHC-ART-M06/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m06_l1_ch', type: 'challenge', title: 'Scenario: Family Member Offers to Interpret',
        content: 'Your patient is a 74-year-old Tagalog speaker with limited English. You need to explain a new insulin regimen with a complex titration schedule. The patient\'s adult son offers to translate for you.\n\nIs this acceptable? What are the clinical risks? What is the correct action?',
        narration_script: 'Scenario. Your patient speaks Tagalog with limited English. You need to explain a complex new insulin regimen. The patient\'s son offers to translate. Is this acceptable? What are the clinical risks of using a family member as an interpreter for clinical content? What is the correct action?',
        audio_path: '/training-audio/ACHC-ART-M06/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m06_l2', topic_id: 'ACHC-ART-M06', title: 'Lesson 2: The Teach-Back Method', order: 2,
    cards: [
      { card_id: 'achc_m06_l2_s', type: 'summary', title: 'A Nod Is Not Comprehension',
        content: 'Teach-back is the only method that verifies understanding rather than information delivery. Studies show patients forget 40–80% of what clinicians tell them immediately after the visit.',
        narration_script: 'A patient nodding does not mean a patient understood. Studies show patients forget forty to eighty percent of what clinicians tell them immediately after the encounter. The teach-back method is the only evidence-based technique that verifies actual comprehension — not just that information was delivered.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m06_l2_c1', type: 'content', title: 'How to Use Teach-Back Correctly',
        content: 'Step 1: Teach in small chunks — one concept at a time.\nStep 2: Ask the patient to explain or demonstrate, not just confirm. Say: "Can you show me how you will do this?" not "Do you understand?"\nStep 3: If they can\'t: simplify, use visuals, re-explain. Do not blame the patient.\nStep 4: Repeat until demonstrated correctly.\nStep 5: Document: "Patient demonstrated correct technique via teach-back" or "Patient unable to demonstrate — written instructions provided, RN notified."',
        narration_script: 'Teach-back in five steps. One: teach in small chunks — one concept at a time. Two: ask the patient to show you, not just confirm. Say: Can you show me how you will do this? Never ask: Do you understand? Three: if they can\'t demonstrate correctly, simplify, use visuals, and re-explain. Do not blame the patient for not understanding. Four: repeat until the patient demonstrates correctly. Five: document the outcome — either patient demonstrated correct technique, or patient was unable to demonstrate and what you did in response.',
        audio_path: '/training-audio/ACHC-ART-M06/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m06_l2_ch', type: 'challenge', title: 'Scenario: Insulin Pen Education Fails Teach-Back',
        content: 'You taught a patient how to use a new insulin pen. He said "I got it" after the explanation. During teach-back, he picks up the pen incorrectly, and when asked to dial the units, sets it to 50 instead of 5. He becomes embarrassed and says "I\'m tired. Can we do this another time?"\n\nWhat do you do now? What do you document? What is your safety concern?',
        narration_script: 'Scenario. You taught insulin pen technique. During teach-back the patient dials 50 units instead of 5, then becomes embarrassed and says he\'s tired and wants to stop. What do you do now? What do you document? What is the specific safety concern if this patient self-administers tonight?',
        audio_path: '/training-audio/ACHC-ART-M06/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m06_l3', topic_id: 'ACHC-ART-M06', title: 'Lesson 3: Health Literacy and Interpreter Services', order: 3,
    cards: [
      { card_id: 'achc_m06_l3_s', type: 'summary', title: 'Low Health Literacy Is the Norm, Not the Exception',
        content: '36% of US adults have basic or below-basic health literacy. For home health patients — elderly, non-English speaking, low education — the rate is higher. Your clinical instructions compete with fear, pain, fatigue, and confusion.',
        narration_script: 'Thirty-six percent of US adults have basic or below-basic health literacy. For your typical home health patient — elderly, managing multiple conditions, potentially speaking English as a second language — that rate is significantly higher. Your clinical instructions are competing with fear, pain, fatigue, and confusion. Plain language is not a courtesy. It is a clinical obligation.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m06_l3_c1', type: 'content', title: 'Plain Language Standards and Interpreter Protocol',
        content: 'Plain language rules: 5th–6th grade reading level, one instruction at a time, use "you" and "do" language, avoid medical jargon, use visuals and demonstrations.\nInterpreter services: patients with limited English proficiency have a legal right to qualified interpreter services at no cost (Title VI). Family members may interpret for general conversation but NOT for: informed consent, medication instructions, diagnoses, or clinical education. Agency-approved telephone or video interpreters must be used.',
        narration_script: 'Plain language: write and speak at a fifth or sixth grade reading level. Give one instruction at a time. Use active language — say you should take this pill instead of the pill should be taken. Avoid medical jargon. Use visuals and demonstrations. For interpreter services: patients with limited English proficiency have a federal right under Title VI to a qualified interpreter at no cost. Family members may NOT interpret for informed consent, medication instructions, diagnosis, or clinical education. Use your agency-approved telephone or video interpreter service.',
        audio_path: '/training-audio/ACHC-ART-M06/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m06_l3_ch', type: 'challenge', title: 'Scenario: Instruction Sheet Held Upside Down',
        content: 'A patient asks you to review her care plan. She nods throughout your explanation. You notice she is holding the printed instruction sheet upside down and appears to be reading backwards. She has not asked a single question.\n\nWhat does this observation tell you? What do you do next? What do you document?',
        narration_script: 'Scenario. A patient asks you to review her care plan. She nods throughout. You notice she is holding the instruction sheet upside down, and she has not asked a single question. What does this observation tell you? What do you do next? What do you document?',
        audio_path: '/training-audio/ACHC-ART-M06/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M06'], estimated_duration: '0:30', completion_required: true },
    ],
  },

  /* ═══════════════════ M07 Workplace & Patient Safety (OSHA) ══════════════════ */
  {
    lesson_id: 'achc_m07_l1', topic_id: 'ACHC-ART-M07', title: 'Lesson 1: Your OSHA Rights and Responsibilities', order: 1,
    cards: [
      { card_id: 'achc_m07_l1_s', type: 'summary', title: 'OSHA Protections Follow You Into Every Patient Home',
        content: 'The OSH Act covers you regardless of where you work — including patient homes. Your employer must assess hazards in the home environment, provide PPE, and cannot retaliate against you for raising safety concerns.',
        narration_script: 'The Occupational Safety and Health Act covers you regardless of where you work. A patient\'s home is your workplace when you are in it. Your employer is required to assess workplace hazards including home environments, provide you with the PPE necessary to work safely, and cannot retaliate against you for raising a safety concern or refusing work that poses an imminent danger.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m07_l1_c1', type: 'content', title: 'Your Four OSHA Rights',
        content: '1. Right to a safe workplace — your employer must identify and control hazards you encounter in the field.\n2. Right to information — you can request Safety Data Sheets for any chemical you are exposed to.\n3. Right to refuse imminently dangerous work — you may refuse work that poses a serious and immediate threat without fear of retaliation.\n4. Right to file a complaint — you can file a confidential complaint with OSHA (1-800-321-OSHA) if rights are violated.',
        narration_script: 'Your four OSHA rights are: the right to a safe workplace — your employer must identify and control hazards you encounter in the field. The right to information — you can request a Safety Data Sheet for any chemical you are exposed to. The right to refuse imminently dangerous work — a serious and immediate threat entitles you to refuse without fear of retaliation. And the right to file a confidential complaint with OSHA at 1-800-321-OSHA.',
        audio_path: '/training-audio/ACHC-ART-M07/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m07_l1_ch', type: 'challenge', title: 'Scenario: Chemical Hazard at Patient Home',
        content: 'You arrive at a patient\'s home and notice a strong chemical smell. The family tells you they mixed bleach and ammonia to clean the bathroom this morning. Your eyes are burning. The patient is in the bedroom 10 feet away.\n\nWhat hazard is present? What is the immediate risk to you and the patient? What are your first actions?',
        narration_script: 'Scenario. You arrive and smell a strong chemical odor. The family says they mixed bleach and ammonia to clean. Your eyes are burning. The patient is in the bedroom. What hazard is present? What is the immediate risk to you and the patient? What are your first actions?',
        audio_path: '/training-audio/ACHC-ART-M07/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m07_l2', topic_id: 'ACHC-ART-M07', title: 'Lesson 2: Hazard Communication and Safety Data Sheets', order: 2,
    cards: [
      { card_id: 'achc_m07_l2_s', type: 'summary', title: 'Every Chemical Has a Label and an SDS',
        content: 'The GHS (Globally Harmonized System) standardizes chemical hazard communication worldwide. Nine pictograms. Sixteen SDS sections. Section 8 tells you exactly what PPE you need.',
        narration_script: 'The Globally Harmonized System standardizes how chemical hazards are communicated on labels and Safety Data Sheets. Nine hazard pictograms identify the type of hazard at a glance — flammable, corrosive, toxic. A Safety Data Sheet has sixteen sections. Section eight is the one you use most — it tells you exactly what PPE is required and what the exposure limits are.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m07_l2_c1', type: 'content', title: 'Reading a GHS Label and Using an SDS in the Field',
        content: 'GHS label elements: product identifier, signal word (Danger or Warning), hazard statements, precautionary statements, pictograms, supplier info.\nSDS Section 8 — Exposure Controls/PPE: specifies required respiratory protection, skin protection (glove type), eye protection, and engineering controls. In a patient home: if you find an unlabeled container or unfamiliar chemical, do not use it. Request the SDS or contact poison control.',
        narration_script: 'A GHS label has six required elements: product identifier, signal word — danger or warning, hazard statements, precautionary statements, pictograms, and supplier information. In the field, Section 8 of the SDS is your practical reference — it tells you the glove type, respiratory protection level, and eye protection required. If you find an unlabeled container or an unfamiliar chemical in a patient\'s home, do not use it. Request an SDS or contact poison control at 1-800-222-1222.',
        audio_path: '/training-audio/ACHC-ART-M07/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m07_l2_ch', type: 'challenge', title: 'Scenario: Unlabeled Solution',
        content: 'A patient hands you an unlabeled spray bottle and says, "Use this to clean around the wound — the doctor used it last time." The bottle has a faint chemical smell. You don\'t recognize it.\n\nWhat do you do? What risks are you protecting against? What do you tell the patient?',
        narration_script: 'Scenario. A patient hands you an unlabeled spray bottle. She says the doctor used it to clean around the wound last time. The bottle has a faint chemical smell. You don\'t recognize it. What do you do? What risks are you protecting against? What do you tell the patient?',
        audio_path: '/training-audio/ACHC-ART-M07/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m07_l3', topic_id: 'ACHC-ART-M07', title: 'Lesson 3: Incident Reporting and Medical Device Safety', order: 3,
    cards: [
      { card_id: 'achc_m07_l3_s', type: 'summary', title: 'Report Every Incident — Including Near Misses',
        content: 'Incident reporting is not punitive — it is a safety system. Near-miss reports are as important as injury reports because they identify systemic hazards before they cause harm.',
        narration_script: 'Incident reporting is not a punitive process. It is the safety system. A near-miss report — something that almost caused harm but didn\'t — is equally as important as an injury report, because near misses reveal systemic hazards before they injure someone. Your report protects the next employee who faces the same situation.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m07_l3_c1', type: 'content', title: 'Workplace Injury Reporting and MDR Basics',
        content: 'Workplace injury: notify supervisor immediately regardless of severity, complete incident report within 24 hours, seek medical evaluation if injury requires treatment. OSHA 300 log: employer records work-related injuries and illnesses — your report is the trigger.\nMedical Device Reporting (MDR): if a device malfunction causes or could cause patient death or serious injury, report to supervisor immediately. Administrator has 10 working days to submit FDA Form 3500A. Do not return or repair the device until cleared.',
        narration_script: 'Workplace injury: notify your supervisor immediately — do not wait until the end of your shift. Complete the incident report within twenty-four hours. Seek medical evaluation if the injury requires treatment. Your report triggers the OSHA three-hundred log entry. For medical device reporting: if a device malfunction causes or could cause patient death or serious injury, report to your supervisor immediately. The administrator has ten working days to submit FDA Form 3500A. Do not return or repair the device until risk management clears it.',
        audio_path: '/training-audio/ACHC-ART-M07/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m07_l3_ch', type: 'challenge', title: 'Scenario: Hospital Bed Rail Failure and Patient Fall',
        content: 'During a transfer assist, the hospital bed rail collapses. The patient falls and lands on the floor. She has a bruise on her hip but refuses to go to the hospital. She says, "I\'m fine — don\'t make a fuss."\n\nList your first 3 immediate actions. What do you document about the device? Is this an MDR-reportable event?',
        narration_script: 'Scenario. During a transfer assist, the hospital bed rail collapses. The patient falls and has a hip bruise. She refuses to go to the hospital. List your first three immediate actions. What do you document about the device? Is this an MDR-reportable event and why?',
        audio_path: '/training-audio/ACHC-ART-M07/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M07'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════ M08 Patient Rights & Responsibilities ═══════════════ */
  {
    lesson_id: 'achc_m08_l1', topic_id: 'ACHC-ART-M08', title: 'Lesson 1: The Patient Bill of Rights', order: 1,
    cards: [
      { card_id: 'achc_m08_l1_s', type: 'summary', title: 'Rights Are Legally Enforceable — Not Guidelines',
        content: 'The Patient Bill of Rights under 42 CFR 484.50 is not a courtesy standard. These rights are legally enforceable CMS Conditions of Participation. Every patient receives them at admission. You are responsible for upholding them at every visit.',
        narration_script: 'The Patient Bill of Rights is not a mission statement. It is a legally enforceable set of protections under the CMS Conditions of Participation at 42 CFR 484.50. Every patient receives these rights at admission and must be reminded of them on request. You are personally responsible for upholding them at every visit.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m08_l1_c1', type: 'content', title: 'Core Patient Rights in Home Health',
        content: '1. Right to be informed — in their language, about their care, diagnosis, and rights.\n2. Right to participate in care planning — including setting goals and refusing treatment.\n3. Right to privacy and confidentiality — over their health information and in their own home.\n4. Right to dignity and respect — regardless of condition, behavior, or circumstances.\n5. Right to receive care without discrimination — race, color, religion, sex, national origin.\n6. Right to voice grievances — without fear of retaliation.\n7. Right to be informed of charges before care begins.',
        narration_script: 'Seven core rights in home health. The right to be informed — in their language about their care and diagnosis. The right to participate in care planning, including the right to refuse treatment. The right to privacy and confidentiality. The right to dignity and respect regardless of their condition or behavior. The right to receive care without discrimination. The right to voice grievances without retaliation. And the right to be informed of charges before care begins. Every visit is an opportunity to either uphold or violate these rights.',
        audio_path: '/training-audio/ACHC-ART-M08/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m08_l1_ch', type: 'challenge', title: 'Scenario: Refusal of Care',
        content: 'A patient says: "I don\'t want wound care today. I\'m tired and I have visitors coming this afternoon." The wound showed early signs of infection at your last visit three days ago.\n\nWhat patient right is at stake? What are your clinical and documentation obligations? Can you force the care?',
        narration_script: 'Scenario. The patient says she doesn\'t want wound care today — she\'s tired and has visitors coming. At your last visit three days ago, the wound showed early signs of infection. What patient right is at stake? What are your clinical and documentation obligations? Can you proceed without consent?',
        audio_path: '/training-audio/ACHC-ART-M08/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m08_l2', topic_id: 'ACHC-ART-M08', title: 'Lesson 2: Informed Consent and Advance Directives', order: 2,
    cards: [
      { card_id: 'achc_m08_l2_s', type: 'summary', title: 'The Document Controls — Not the Family',
        content: 'Advance directives — DNR, POLST, Living Will, Healthcare POA — represent the patient\'s voice when they can no longer speak. A family member\'s verbal override does not supersede a valid signed directive.',
        narration_script: 'Advance directives are the patient\'s legal voice when they can no longer speak for themselves. A Do Not Resuscitate order, a POLST, a Living Will, or a Healthcare Power of Attorney — these documents represent decisions the patient made while they had capacity. A family member\'s verbal override does not supersede a valid, signed directive.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m08_l2_c1', type: 'content', title: 'Types of Advance Directives and Your Obligations',
        content: 'DNR (Do Not Resuscitate): do not attempt CPR if heart stops. Must be physician-signed and on file.\nPOLST (Physician Orders for Life-Sustaining Treatment): more comprehensive — covers intubation, hospitalization, artificial nutrition.\nLiving Will: patient instructions for end-of-life care.\nHealthcare POA: designates a person to make decisions if the patient loses capacity.\nYour obligations: know whether a directive exists, document its location in every visit note, and never attempt resuscitation if a valid DNR is on file.',
        narration_script: 'Know your advance directive types. A DNR means do not attempt CPR — it must be physician-signed and on file. A POLST is more comprehensive and covers intubation, hospitalization, and artificial nutrition decisions. A Living Will contains the patient\'s specific instructions for end-of-life care. A Healthcare Power of Attorney designates who makes decisions if the patient loses capacity. Your obligations are clear: know whether a directive exists, document its location in every visit note, and never attempt resuscitation if a valid DNR is on file.',
        audio_path: '/training-audio/ACHC-ART-M08/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m08_l2_ch', type: 'challenge', title: 'Scenario: Family Overrides DNR',
        content: 'You arrive for a visit. The patient — who has a valid physician-signed DNR on the refrigerator — is unresponsive, with agonal breathing. Her adult son grabs your arm and says: "Ignore that paper. Save her. She changed her mind — she told me last week."\n\nWhat is the legally and clinically correct response? What do you do? What do you document?',
        narration_script: 'Scenario. The patient is unresponsive with agonal breathing. A valid physician-signed DNR is on the refrigerator. Her son grabs your arm and says: ignore that paper, save her, she changed her mind. What is the legally and clinically correct response? What do you do and document?',
        audio_path: '/training-audio/ACHC-ART-M08/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m08_l3', topic_id: 'ACHC-ART-M08', title: 'Lesson 3: Recognizing and Reporting Abuse and Neglect', order: 3,
    cards: [
      { card_id: 'achc_m08_l3_s', type: 'summary', title: 'Suspicion Is Sufficient — You Do Not Need Proof',
        content: 'As a home health worker, you are a mandatory reporter. You are legally required to report suspected abuse, neglect, or exploitation. The threshold is suspicion — not proof. Failure to report is a misdemeanor in California.',
        narration_script: 'As a home health worker, you are a mandatory reporter under California law. You are legally required to report suspected abuse, neglect, or exploitation of elderly or dependent adults. The threshold is reasonable suspicion — not proof. You do not investigate. You report. Failure to report when you had reasonable suspicion is a misdemeanor.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m08_l3_c1', type: 'content', title: 'Types of Abuse and Indicators',
        content: 'Physical: unexplained bruising (especially bilateral, in stages), fractures, burns, grip marks.\nEmotional: fearfulness, withdrawal, anxiety when caregiver present, sudden behavioral changes.\nSexual: bruising or injury to genital areas, patient disclosure.\nFinancial: sudden changes in assets, unpaid bills when resources existed, caregiver controlling access to money.\nNeglect: dehydration, malnutrition, untreated wounds, unsanitary living conditions beyond patient ability.\nSelf-neglect: patient refusing all care, not managing medications, unsafe living conditions.',
        narration_script: 'Physical abuse indicators: unexplained bruising, especially bilateral bruising at the same stage of healing, fractures, burns, and grip marks. Emotional abuse: fearfulness, withdrawal, or visible anxiety when the caregiver is present. Sexual abuse: bruising or injury to genital areas, or patient disclosure. Financial abuse: sudden changes in assets, unpaid bills when resources should be available, a caregiver controlling access to money. Neglect: dehydration, malnutrition, untreated wounds, unsanitary conditions beyond the patient\'s ability to control. Document what you observe — objectively, factually, and immediately.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m08_l3_ch', type: 'challenge', title: 'Scenario: Unexplained Bruising and Fearfulness',
        content: 'During a visit, you notice the patient has multiple bruises at different stages of healing on both forearms. When you ask about them, the patient says "I bump into things." The patient\'s adult grandson, who is her primary caregiver, is in the room. The patient looks at the floor and does not make eye contact when the grandson speaks.\n\nList your observations, your suspicion level, and your exact reporting obligations and timeline.',
        narration_script: 'Scenario. The patient has bilateral bruises at different stages of healing. She says she bumps into things. Her adult grandson, the primary caregiver, is in the room. She looks at the floor when he speaks and avoids eye contact. List your observations, your suspicion level, and your exact reporting obligations and timeline.',
        audio_path: '/training-audio/ACHC-ART-M08/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M08'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════════ M09 Corporate Compliance ═══════════════════════ */
  {
    lesson_id: 'achc_m09_l1', topic_id: 'ACHC-ART-M09', title: 'Lesson 1: The 7-Element Compliance Program', order: 1,
    cards: [
      { card_id: 'achc_m09_l1_s', type: 'summary', title: 'Why a Compliance Program Exists',
        content: 'A corporate compliance program exists to prevent, detect, and correct violations before they become regulatory events, lawsuits, or exclusions from federal healthcare programs. Every employee is part of the program.',
        narration_script: 'A corporate compliance program exists to prevent, detect, and correct violations before they become legal events. Without a compliance program, a single billing error can become a False Claims Act case. A single undisclosed payment can become an Anti-Kickback violation. Every employee is part of the program — including you.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m09_l1_c1', type: 'content', title: 'The 7 OIG Elements',
        content: '1. Written policies and standards of conduct.\n2. A designated Compliance Officer.\n3. Effective training and education — required for all employees.\n4. Open lines of communication — including anonymous reporting.\n5. Internal monitoring and auditing.\n6. Consistent enforcement and discipline.\n7. Prompt corrective action.\nYour role: complete required training, report concerns through authorized channels, never falsify documentation.',
        narration_script: 'The seven OIG elements are: written policies and standards of conduct, a designated Compliance Officer, effective training and education for all employees, open lines of communication including anonymous reporting, internal monitoring and auditing, consistent enforcement and discipline, and prompt corrective action. Your personal role in this program is simple: complete required training, report concerns promptly through authorized channels, and never falsify documentation.',
        audio_path: '/training-audio/ACHC-ART-M09/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m09_l1_ch', type: 'challenge', title: 'Scenario: Supervisor Asks You to Sign a Chart',
        content: 'Your supervisor tells you: "Just sign the visit note for last Thursday — we know you were there, the EVV system just didn\'t record it properly. I need it submitted today for billing."\n\nYou were at the visit. What is the compliance issue here? What do you do?',
        narration_script: 'Scenario. Your supervisor says: just sign the visit note for last Thursday. We know you were there. The EVV system didn\'t record it. I need it submitted today for billing. You were at the visit. What is the compliance issue? What do you do?',
        audio_path: '/training-audio/ACHC-ART-M09/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m09_l2', topic_id: 'ACHC-ART-M09', title: 'Lesson 2: Fraud, Waste, and Abuse', order: 2,
    cards: [
      { card_id: 'achc_m09_l2_s', type: 'summary', title: 'Your Documentation Is a Federal Claim',
        content: 'Every visit note you submit goes into a Medicare or Medicaid claim. Every claim is a federal attestation of medical necessity. Inaccurate documentation is not an administrative issue — it is a potential False Claims Act violation.',
        narration_script: 'Every visit note you complete feeds into a Medicare or Medicaid claim. Every claim is a federal attestation that the care was medically necessary and properly delivered. Rounding up your visit time. Documenting a service you didn\'t provide. Signing a note without reviewing it. These are not administrative errors — they are potential False Claims Act violations.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:50', completion_required: true },
      { card_id: 'achc_m09_l2_c1', type: 'content', title: 'FCA, AKS, and the 60-Day Rule',
        content: 'False Claims Act: submitting a false or fraudulent claim to a federal program. Civil penalties: $13,000–$26,000 per claim + treble damages. Criminal: 5-year prison term.\nAnti-Kickback Statute: paying or receiving anything of value to induce referrals. Applies to gift cards, meals, favors.\nFraud vs Waste vs Abuse: Fraud = intentional. Waste = overuse/inefficiency (no intent). Abuse = practices inconsistent with sound medical/business practice.\n60-day rule: if you identify an overpayment, it must be returned within 60 days.',
        narration_script: 'The False Claims Act imposes civil penalties of thirteen thousand to twenty-six thousand dollars per false claim, plus treble damages. Criminal penalties include up to five years in prison. The Anti-Kickback Statute prohibits anything of value given to induce referrals — this includes gift cards, meals, and favors between employees and vendors. Remember the 60-day rule: if the agency identifies an overpayment from Medicare or Medicaid, it must be returned within sixty days of identification. Keeping an identified overpayment is itself a false claim.',
        audio_path: '/training-audio/ACHC-ART-M09/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m09_l2_ch', type: 'challenge', title: 'Scenario: Coworker Rounds Up Visit Time',
        content: 'A coworker tells you: "I always add 5–7 minutes to my EVV entries. The drives take time too — the company bills more anyway. Everyone does it."\n\nIs this fraud, waste, or abuse? What is your obligation? What is the risk to the agency and to the coworker personally?',
        narration_script: 'Scenario. Your coworker says she always adds five to seven minutes to her EVV entries. She says the company bills more and everyone does it. Is this fraud, waste, or abuse? What is your obligation? What is the personal risk to your coworker and the risk to the agency?',
        audio_path: '/training-audio/ACHC-ART-M09/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m09_l3', topic_id: 'ACHC-ART-M09', title: 'Lesson 3: Whistleblower Protections and Reporting Channels', order: 3,
    cards: [
      { card_id: 'achc_m09_l3_s', type: 'summary', title: 'Federal Law Protects Good-Faith Reporters',
        content: 'The False Claims Act, HIPAA, and OSHA all contain anti-retaliation provisions. You cannot be fired, disciplined, or harassed for reporting a compliance concern in good faith. The anonymous hotline exists specifically for this.',
        narration_script: 'Multiple federal laws protect employees who report compliance concerns in good faith. The False Claims Act, HIPAA, and OSHA all contain anti-retaliation provisions. You cannot be terminated, demoted, harassed, or have your hours reduced because you made a report. The compliance hotline exists specifically for this purpose.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m09_l3_c1', type: 'content', title: 'Three Reporting Channels',
        content: 'Internal channels: (1) Direct supervisor. (2) Compliance Officer (for compliance-specific concerns). (3) Anonymous hotline — calls are confidential, no caller ID required.\nExternal channel: OIG Hotline (1-800-HHS-TIPS) — for fraud, waste, and abuse involving federal programs.\nQui tam provision: under the False Claims Act, individuals who report fraud against the federal government and bring a lawsuit may receive 15–30% of the government\'s recovery. This is your financial protection for valid whistleblower reports.',
        narration_script: 'Three internal reporting channels: your direct supervisor for general concerns, the Compliance Officer for compliance-specific issues, and the anonymous hotline for any concern where you want confidentiality. External channel: the OIG Hotline at 1-800-HHS-TIPS for fraud involving federal programs. The False Claims Act also contains a qui tam provision — if you bring a lawsuit about fraud against the federal government and it is validated, you may receive fifteen to thirty percent of the government\'s recovery.',
        audio_path: '/training-audio/ACHC-ART-M09/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m09_l3_ch', type: 'challenge', title: 'Scenario: Retaliation After Report',
        content: 'Three weeks ago, you reported a billing concern through the anonymous hotline. This week your supervisor cut your hours by 30% and you received your first-ever negative performance review. No other changes in your work have occurred.\n\nDo you have a retaliation claim? What is your evidence? What are your options?',
        narration_script: 'Scenario. Three weeks ago you reported a billing concern through the anonymous hotline. This week your hours were cut thirty percent and you received your first negative performance review in two years. Nothing else changed. Do you have a retaliation claim? What is your evidence? What are your options?',
        audio_path: '/training-audio/ACHC-ART-M09/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M09'], estimated_duration: '0:30', completion_required: true },
    ],
  },

  /* ══════════════════════════ M10 Ethics in Healthcare ════════════════════════ */
  {
    lesson_id: 'achc_m10_l1', topic_id: 'ACHC-ART-M10', title: 'Lesson 1: Ethical Frameworks in Home Health', order: 1,
    cards: [
      { card_id: 'achc_m10_l1_s', type: 'summary', title: 'Ethics Governs Decisions That Policy Cannot',
        content: 'Ethics applies where law and policy are silent, ambiguous, or in conflict. The four bioethical principles provide a decision-making framework for the hardest moments in home health care.',
        narration_script: 'Healthcare ethics governs decisions where law and policy are silent, ambiguous, or in conflict with each other. The four bioethical principles — autonomy, beneficence, non-maleficence, and justice — provide a framework for the hardest decisions you will face in the field. Learning to apply them before you encounter the situation is what makes the difference.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m10_l1_c1', type: 'content', title: 'The Four Bioethical Principles',
        content: '1. Autonomy: the patient\'s right to make decisions about their own care — even ones you disagree with. Informed consent is its legal expression.\n2. Beneficence: your duty to act in the patient\'s best interest.\n3. Non-maleficence: your duty to avoid causing harm — including harm from inaction.\n4. Justice: fair, equitable access to care — regardless of race, religion, ability to pay, or social status.\nWhen principles conflict: non-maleficence and autonomy are most commonly in tension. Escalate to the Ethics Committee.',
        narration_script: 'The four principles are: Autonomy — the patient\'s right to make decisions about their own care, even ones you disagree with. Beneficence — your duty to act in the patient\'s best interest. Non-maleficence — your duty to avoid causing harm, including harm from inaction. And Justice — fair, equitable access to care regardless of race, religion, ability to pay, or social status. When principles conflict — most commonly when patient autonomy and non-maleficence are in tension — the Ethics Committee is available for consultation.',
        audio_path: '/training-audio/ACHC-ART-M10/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m10_l1_ch', type: 'challenge', title: 'Scenario: Patient Refuses Prescribed Medication',
        content: 'Your patient, who has full decision-making capacity, refuses to take a prescribed blood thinner. She says she read about the side effects online and is afraid. Her husband insists you "make sure she takes it — the doctor ordered it." Her last INR was therapeutic.\n\nWhat ethical principle is at stake? What is your obligation to the patient? To the husband? To the physician?',
        narration_script: 'Scenario. A patient with full capacity refuses her prescribed blood thinner. She says she\'s afraid of the side effects after reading about them online. Her husband insists you make sure she takes it. Her last INR was therapeutic. What ethical principle is at stake? What is your obligation to the patient, to the husband, and to the physician?',
        audio_path: '/training-audio/ACHC-ART-M10/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m10_l2', topic_id: 'ACHC-ART-M10', title: 'Lesson 2: Advance Directives and Ethical Conflicts', order: 2,
    cards: [
      { card_id: 'achc_m10_l2_s', type: 'summary', title: 'The Directive Is the Patient\'s Voice',
        content: 'Advance directives are the patient\'s legally recognized voice for a time when they cannot speak. Honoring them — even under family pressure — is an ethical obligation and a legal requirement.',
        narration_script: 'An advance directive is the patient\'s legally recognized voice for a time when they can no longer speak for themselves. Honoring it — even when a family member is pressuring you not to — is both an ethical obligation and a legal requirement. The patient made this decision when they had capacity. Your role is to honor it.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m10_l2_c1', type: 'content', title: 'When Families Conflict With Directives',
        content: 'Common conflict: patient has a DNR/POLST, family demands aggressive intervention. Resolution framework: (1) Honor the directive. (2) Call your supervisor and the on-call physician. (3) Document the family\'s statement verbatim. (4) Request Ethics Committee consultation if needed. Do NOT abandon care — continue comfort measures and de-escalate family distress. Do NOT remove or hide the directive.',
        narration_script: 'The most common ethical conflict in home health is a family demanding aggressive intervention when the patient has a valid DNR or POLST. Your resolution framework has four steps. First: honor the directive. Second: call your supervisor and the on-call physician. Third: document the family\'s statement verbatim — exact words, time, who was present. Fourth: request Ethics Committee consultation if the conflict cannot be resolved immediately. Do not abandon care. Continue comfort measures and attempt to de-escalate the family\'s distress.',
        audio_path: '/training-audio/ACHC-ART-M10/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m10_l2_ch', type: 'challenge', title: 'Scenario: DNR Conflict at Deterioration',
        content: 'You arrive for a visit. The patient — who has a valid, physician-signed DNR on file — is deteriorating rapidly: altered mental status, labored breathing, mottled extremities. Two of her adult children are present. One says "follow the DNR." The other says "call 911 and do everything — she would have wanted to live."\n\nWhat do you do? What does the law require? What does ethics require?',
        narration_script: 'Scenario. The patient is deteriorating — altered mental status, labored breathing, mottled extremities. A valid physician-signed DNR is on file. One child says follow the DNR. The other says call 911 and do everything. What do you do? What does the law require? What does ethics require?',
        audio_path: '/training-audio/ACHC-ART-M10/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m10_l3', topic_id: 'ACHC-ART-M10', title: 'Lesson 3: Professional Boundaries and Ethics Committee', order: 3,
    cards: [
      { card_id: 'achc_m10_l3_s', type: 'summary', title: 'Boundaries Protect Patients and Workers',
        content: 'Professional boundary violations damage the therapeutic relationship, expose patients to exploitation risk, and create personal liability for the worker. The boundary between professional and personal must be actively maintained.',
        narration_script: 'Professional boundary violations are not always dramatic. They start small — accepting a gift, a personal phone call, a social media connection — and escalate. Boundaries protect patients from exploitation and workers from liability. The therapeutic relationship depends on a clear professional boundary. Once crossed, it is very difficult to restore.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m10_l3_c1', type: 'content', title: 'Boundary Violations and Ethics Committee Access',
        content: 'Violations include: accepting money or significant gifts, personal social media connections with patients, providing care for friends or family without agency oversight, financial transactions, sexual contact of any kind.\nThe Ethics Committee: any employee, family member, or patient may refer a case. Request through supervisor or compliance officer. Committee reviews the situation, provides guidance, and documents the outcome. Your consultation is confidential.',
        narration_script: 'Boundary violations include accepting money, accepting gifts beyond the agency\'s policy threshold, connecting with patients on personal social media, providing care for friends or family outside the agency, entering into financial transactions with patients, and any form of sexual contact. The Ethics Committee is available to any employee, patient, or family member who faces an ethical dilemma they cannot resolve independently. Request a consultation through your supervisor or the Compliance Officer. Your consultation is confidential.',
        audio_path: '/training-audio/ACHC-ART-M10/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m10_l3_ch', type: 'challenge', title: 'Scenario: Patient Offers Cash as a Thank-You',
        content: 'At the end of a visit, a long-term patient whom you genuinely like hands you $100 in cash and says: "This is just a thank-you. You\'ve been so kind to me for two years. No one has to know."\n\nWhat is the ethical issue? What do you say? What do you document? What happens if you accept?',
        narration_script: 'Scenario. A long-term patient you genuinely like and respect hands you one hundred dollars in cash at the end of a visit. She says: this is just a thank-you, you\'ve been so kind for two years, no one has to know. What is the ethical issue? What do you say? What do you document? What happens if you accept?',
        audio_path: '/training-audio/ACHC-ART-M10/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M10'], estimated_duration: '0:30', completion_required: true },
    ],
  },

  /* ═════════════════════════ M11 TB & Blood Borne Pathogens ══════════════════ */
  {
    lesson_id: 'achc_m11_l1', topic_id: 'ACHC-ART-M11', title: 'Lesson 1: Bloodborne Pathogen Transmission and Prevention', order: 1,
    cards: [
      { card_id: 'achc_m11_l1_s', type: 'summary', title: 'Three Pathogens, One Standard of Prevention',
        content: 'HBV, HCV, and HIV are the three primary bloodborne pathogens in healthcare. They are transmitted through direct contact with infected blood or body fluids. Standard precautions prevent all three.',
        narration_script: 'Three pathogens drive bloodborne exposure risk in home health: hepatitis B, hepatitis C, and HIV. All three are transmitted through direct contact with infected blood or certain body fluids via a mucous membrane, a needlestick, or non-intact skin. HBV is the most transmissible — a needlestick from an HBV-positive patient carries a thirty percent infection risk without vaccination. Standard precautions prevent exposure to all three.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:50', completion_required: true },
      { card_id: 'achc_m11_l1_c1', type: 'content', title: 'Transmission Routes and Risk by Exposure Type',
        content: 'HBV: 30% risk/needlestick (unvaccinated). Vaccine available — 3-dose series, required for healthcare workers.\nHCV: 1.8% risk/needlestick. No vaccine available. Early treatment is highly effective.\nHIV: 0.3% risk/needlestick. No cure, but effective antiretroviral therapy. PEP (post-exposure prophylaxis) must start within 72 hours.\nNOT transmitted by: saliva alone, tears, sweat, urine (intact skin contact). The exposure pathway requires direct contact with infectious material and a portal of entry.',
        narration_script: 'Transmission by needlestick risk: HBV carries a thirty percent risk per needlestick in an unvaccinated person. HCV carries a 1.8 percent risk. HIV carries 0.3 percent. HBV vaccination is required for healthcare workers — three-dose series. For HCV, there is no vaccine, but early treatment is highly effective. For HIV, there is no cure, but post-exposure prophylaxis started within seventy-two hours is highly effective. These pathogens are not transmitted by saliva alone, tears, sweat, or urine on intact skin. The exposure requires a portal of entry.',
        audio_path: '/training-audio/ACHC-ART-M11/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m11_l1_ch', type: 'challenge', title: 'Scenario: Blood Splash to Eyes',
        content: 'During a blood draw, the vacutainer tube disengages and blood splashes directly into your eyes. You are not wearing eye protection. The patient\'s bloodborne pathogen status is unknown.\n\nList your immediate response steps in order. What information about the source patient do you need, and why?',
        narration_script: 'Scenario. During a blood draw, the vacutainer disengages and blood splashes into your eyes. You are not wearing eye protection. The patient\'s bloodborne pathogen status is unknown. List your immediate response steps in order. What information about the source patient do you need, and why?',
        audio_path: '/training-audio/ACHC-ART-M11/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m11_l2', topic_id: 'ACHC-ART-M11', title: 'Lesson 2: Post-Exposure Response Protocol', order: 2,
    cards: [
      { card_id: 'achc_m11_l2_s', type: 'summary', title: 'The Response Sequence Is Timed — Not Optional',
        content: 'Every step in the post-exposure protocol has a time requirement. Deviation from the sequence reduces treatment effectiveness and creates documentation gaps that affect workers\' compensation and liability.',
        narration_script: 'The post-exposure protocol is a timed medical response. Each step has a specific time requirement, and deviation from the sequence reduces treatment effectiveness and creates documentation gaps that can affect workers\' compensation claims and legal liability. Know the sequence before you need it.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m11_l2_c1', type: 'content', title: 'The 5-Step Post-Exposure Protocol',
        content: 'Step 1: Immediate first aid. Needlestick/cut → remove glove, wash with soap and water 30+ seconds, do not squeeze or suck the wound. Eye/mouth splash → flush with water for 15 minutes.\nStep 2: Call supervisor immediately. Do not wait until end of shift.\nStep 3: Seek medical evaluation within 2 hours at the designated facility. PEP decision is made here.\nStep 4: Provide source patient information (with consent) to facilitate bloodborne pathogen testing.\nStep 5: Complete the exposure incident report before end of shift.',
        narration_script: 'The five steps. One: immediate first aid. For a needlestick, remove your glove, wash with soap and water for at least thirty seconds. Do not squeeze or try to suck out the wound. For a splash: flush with water for fifteen minutes. Two: call your supervisor immediately — not at the end of the shift. Three: seek medical evaluation at the designated facility within two hours. This is where the PEP decision is made. Four: provide source patient information to facilitate bloodborne pathogen testing if the patient consents. Five: complete the exposure incident report before you leave for the day.',
        audio_path: '/training-audio/ACHC-ART-M11/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '1:15', completion_required: true },
      { card_id: 'achc_m11_l2_ch', type: 'challenge', title: 'Scenario: Found Needle on Floor',
        content: 'During a home visit, you step over a used needle on the floor that you didn\'t notice until it punctures through your shoe and nicks your ankle. The patient is on dialysis and you don\'t know her bloodborne pathogen status. It is 4:45 PM on a Friday.\n\nList your first 4 actions in sequence. What is the time-sensitive factor in this scenario?',
        narration_script: 'Scenario. You step over a used needle on the floor and it punctures through your shoe and nicks your ankle. The patient is on dialysis. You don\'t know her bloodborne pathogen status. It is 4:45 PM on a Friday. List your first four actions in sequence. What is the time-sensitive factor in this scenario?',
        audio_path: '/training-audio/ACHC-ART-M11/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m11_l3', topic_id: 'ACHC-ART-M11', title: 'Lesson 3: TB Recognition and Respiratory Protection', order: 3,
    cards: [
      { card_id: 'achc_m11_l3_s', type: 'summary', title: 'A Surgical Mask Will Not Protect You From TB',
        content: 'Pulmonary tuberculosis is airborne — transmitted by inhaled droplet nuclei that remain suspended in air for hours. A surgical mask does not filter airborne particles. An N95 respirator does. This distinction is the difference between protection and exposure.',
        narration_script: 'Pulmonary tuberculosis is transmitted by airborne droplet nuclei — tiny particles that remain suspended in the air for hours after an infectious person coughs. A surgical mask filters large droplets. It does not filter airborne particles. An N95 respirator filters at least ninety-five percent of airborne particles when properly fitted. This distinction is the difference between protection and exposure.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m11_l3_c1', type: 'content', title: 'TB Clinical Indicators and N95 Protocol',
        content: 'Active TB symptom cluster: productive cough >3 weeks, night sweats, unexplained weight loss, hemoptysis (blood-tinged sputum), low-grade fever. Risk factors: recent immigration from endemic areas, HIV, diabetes, homeless shelter exposure.\nN95 protocol: fit-test required annually, seal-check before every use, not to be shared. If patient has suspected TB and no isolation order: (1) Don N95, (2) open windows, (3) notify supervisor and physician immediately, (4) do not complete non-urgent procedures until isolation order is in place.\nAgency PPD protocol: annual test, positive requires chest X-ray, document annually.',
        narration_script: 'The active TB symptom cluster: productive cough lasting more than three weeks, night sweats, unexplained weight loss, hemoptysis — blood-tinged sputum — and low-grade fever. High-risk indicators: recent immigration from endemic areas, HIV, diabetes, or shelter exposure. N95 protocol: you must be fit-tested annually. Before every use, perform a seal check — block the valve and breathe in to confirm the mask seals. If you suspect active pulmonary TB and there is no isolation order: don your N95, open windows to increase ventilation, notify your supervisor and the physician immediately, and defer non-urgent procedures until an isolation order is in place.',
        audio_path: '/training-audio/ACHC-ART-M11/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '1:15', completion_required: true },
      { card_id: 'achc_m11_l3_ch', type: 'challenge', title: 'Scenario: Suspected Active TB, No Isolation Order',
        content: 'Your patient has been coughing for 6 weeks. During today\'s visit, she coughs blood-tinged sputum in your direction while you\'re taking vitals. She reports night sweats and has lost 12 pounds in the last month. No TB orders are in her chart. You have a surgical mask, not an N95.\n\nWhat do you do right now? What is the risk? Who do you notify and when?',
        narration_script: 'Scenario. Your patient has been coughing for six weeks. Today she coughs blood-tinged sputum in your direction during vital signs. She reports night sweats and has lost twelve pounds. No TB orders are in her chart. You have a surgical mask — not an N95. What do you do right now? What is the risk? Who do you notify and when?',
        audio_path: '/training-audio/ACHC-ART-M11/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M11'], estimated_duration: '0:35', completion_required: true },
    ],
  },

  /* ══════════════════════════ M12 Medical Device Act ══════════════════════════ */
  {
    lesson_id: 'achc_m12_l1', topic_id: 'ACHC-ART-M12', title: 'Lesson 1: What Is a Reportable Medical Device Event?', order: 1,
    cards: [
      { card_id: 'achc_m12_l1_s', type: 'summary', title: 'Your Report Protects the Next Patient',
        content: 'The FDA\'s Medical Device Reporting system exists because device malfunctions are often not isolated — the same device or batch can harm patients across the country. Your individual report triggers a recall, a safety notice, or a design correction.',
        narration_script: 'The FDA\'s Medical Device Reporting system exists because a device failure is rarely isolated. The same oxygen concentrator model that failed in your patient\'s home may be deployed in hundreds of other homes. Your MDR report triggers an FDA investigation that can lead to a recall, a safety communication, or a design correction that protects patients across the country.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/summary.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m12_l1_c1', type: 'content', title: 'What Triggers an MDR',
        content: 'A device event is MDR-reportable when a medical device: (1) contributed to or caused a patient death, OR (2) contributed to or caused a serious injury, OR (3) malfunctioned in a way that COULD cause death or serious injury if it recurs.\nDevices include: oxygen concentrators, infusion pumps, hospital beds, patient lifts, glucometers, IV catheters, wound VAC systems.\nKey: malfunction potential is reportable — actual harm is not required.\nNot reportable: device that failed but could not have caused harm, equipment damage only without patient risk.',
        narration_script: 'Three triggers for an MDR. First: the device contributed to or caused a patient death. Second: the device contributed to or caused a serious injury — fractures, burns, significant hemorrhage, hospitalization. Third: the device malfunctioned in a way that could cause death or serious injury if it recurs — even if no harm occurred this time. Devices covered include oxygen concentrators, infusion pumps, hospital beds, patient lifts, glucometers, IV catheters, and wound VAC systems. Malfunction potential alone is a reportable trigger.',
        audio_path: '/training-audio/ACHC-ART-M12/l1/content1.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m12_l1_ch', type: 'challenge', title: 'Scenario: Oxygen Concentrator Failure',
        content: 'A patient\'s oxygen concentrator has been alarming intermittently for two days. The family kept silencing the alarm. Today the patient has an SpO2 of 78% and is acutely confused and lethargic. The concentrator appears to have failed to deliver adequate oxygen.\n\nIs this a reportable event? List your first 3 actions. What information about the device do you capture immediately?',
        narration_script: 'Scenario. An oxygen concentrator has been alarming for two days. The family silenced it each time. Today the patient has an SpO2 of 78% and is acutely confused. The concentrator appears to have failed. Is this an MDR-reportable event? List your first three actions. What device information do you capture immediately?',
        audio_path: '/training-audio/ACHC-ART-M12/l1/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m12_l2', topic_id: 'ACHC-ART-M12', title: 'Lesson 2: The 10-Day Reporting Timeline', order: 2,
    cards: [
      { card_id: 'achc_m12_l2_s', type: 'summary', title: 'The Clock Starts at Identification',
        content: 'The 10-working-day clock for FDA Form 3500A submission begins when the device event is identified — not when the investigation is complete, not when the patient is discharged, not when a supervisor approves the report.',
        narration_script: 'The ten working day deadline for FDA Form 3500A begins when the reportable event is identified. Not when the investigation is complete. Not when the patient is discharged. Not when your supervisor reviews the incident. The identification date is Day Zero — Day Ten is the deadline.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/summary.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:40', completion_required: true },
      { card_id: 'achc_m12_l2_c1', type: 'content', title: 'The MDR Reporting Chain',
        content: 'Step 1: You identify a device event — immediately notify your supervisor and document.\nStep 2: Supervisor escalates to Administrator/Risk Manager.\nStep 3: Risk Manager/QAPI review — confirms reportability.\nStep 4: Administrator submits FDA Form 3500A to FDA and notifies the device manufacturer within 10 working days of identification.\nStep 5: Preserve the device — do not return, repair, or discard until released by risk management.\nVoluntary reports: near-misses can be submitted via MedWatch (3500 form, not 3500A).',
        narration_script: 'The MDR reporting chain has five steps. One: you identify a device event — notify your supervisor immediately and document. Two: supervisor escalates to the Administrator or Risk Manager. Three: Risk Manager confirms reportability through QAPI review. Four: the Administrator submits FDA Form 3500A to the FDA and notifies the manufacturer within ten working days of the identification date. Five: preserve the device — do not return it, repair it, or discard it until risk management releases it. Near-misses can be reported voluntarily using MedWatch Form 3500.',
        audio_path: '/training-audio/ACHC-ART-M12/l2/content1.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '1:05', completion_required: true },
      { card_id: 'achc_m12_l2_ch', type: 'challenge', title: 'Scenario: Day 8, No MDR Initiated',
        content: 'On Day 1, you documented a patient fall linked to a hospital bed rail failure. On Day 8, you learn from a QA review that no MDR was initiated despite the event being clearly reportable. The deadline is Day 10.\n\nWho should have acted by now? What must happen in the next 2 working days? What is the consequence of missing Day 10?',
        narration_script: 'Scenario. On Day One you documented a patient fall linked to a bed rail failure. On Day Eight you learn in a QA review that no MDR was initiated. The deadline is Day Ten. Who should have acted by now? What must happen in the next two working days? What is the consequence of missing the deadline?',
        audio_path: '/training-audio/ACHC-ART-M12/l2/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:35', completion_required: true },
    ],
  },
  {
    lesson_id: 'achc_m12_l3', topic_id: 'ACHC-ART-M12', title: 'Lesson 3: Documentation and Device Preservation', order: 3,
    cards: [
      { card_id: 'achc_m12_l3_s', type: 'summary', title: 'What You Write Immediately Is the Legal Record',
        content: 'Your contemporaneous documentation of a device event is the primary evidentiary record for the MDR, the QAPI investigation, the manufacturer, and any litigation. Document immediately — memory degrades rapidly after an adverse event.',
        narration_script: 'Your contemporaneous documentation of a device failure event is the primary evidentiary record. It informs the MDR submission, the QAPI investigation, the manufacturer\'s root cause analysis, and any civil litigation. Document immediately after the event — before you leave the home, before you speak to anyone else. Memory degrades rapidly in the aftermath of an adverse event.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/summary.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:45', completion_required: true },
      { card_id: 'achc_m12_l3_c1', type: 'content', title: 'Required Documentation Elements',
        content: 'Document: (1) Device name, manufacturer, model, serial number, lot number. (2) Date, time, and exact location of the event. (3) Description of the malfunction — exactly what happened in sequence. (4) Patient status before, during, and after the event. (5) Any symptoms or complaints in preceding visits that may relate to the failure. (6) What you did immediately following the event. (7) Who you notified and at what time. Preserve: photograph the device if possible before removal. Never re-use a device involved in an adverse event.',
        narration_script: 'Required documentation elements for a device event. One: device name, manufacturer, model, serial number, and lot number. Two: date, time, and exact location of the event. Three: the exact sequence of the malfunction — what happened in what order. Four: patient status before, during, and after the event. Five: any relevant symptoms from preceding visits. Six: what you did immediately following the event. Seven: who you notified and at what time. If possible, photograph the device before removal. Never re-use a device that was involved in an adverse patient event.',
        audio_path: '/training-audio/ACHC-ART-M12/l3/content1.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '1:10', completion_required: true },
      { card_id: 'achc_m12_l3_ch', type: 'challenge', title: 'Scenario: Patient Lift Failure and Prior Warning Signs',
        content: 'A patient lift strap breaks during a transfer and the patient falls and fractures her wrist. In your last three visit notes, you documented that the lift was "making a clicking noise." The family confirms they reported it to the DME company but received no response.\n\nWhat specific information must your documentation include today? How does the prior documentation affect the MDR? What do you do with the device?',
        narration_script: 'Scenario. A patient lift strap breaks during a transfer. The patient fractures her wrist. In your last three visit notes, you documented that the lift was making a clicking noise. The family reported it to the DME company with no response. What specific information must your documentation include today? How does your prior documentation affect the MDR? What do you do with the device?',
        audio_path: '/training-audio/ACHC-ART-M12/l3/challenge.wav', image_url: ACHC_IMG['ACHC-ART-M12'], estimated_duration: '0:35', completion_required: true },
    ],
  },
];
void _legacyInlineLessons; // retained for reference only

// ─── ACHC Annual Training — Tests (10 questions per module, imported) ────────
const achcSeedTests = achcAnnualTests as TopicTest[];

// Legacy tests placeholder (replaced by imports)
const _legacyInlineTests: TopicTest[] = [
  {
    test_id: 'tst_achc_m01', topic_id: 'ACHC-ART-M01', passing_score: 80,
    questions: [
      { question_id: 'achc_m01_q1', prompt: 'What is the primary purpose of the CLAS Standards in home health?', choices: ['Ensure documentation is submitted in English only', 'Ensure equitable, culturally and linguistically appropriate services for all patients', 'Require all clinicians to speak a second language', 'Limit care delivery to patients with shared cultural backgrounds'], correct_answer: 1, rationale: 'CLAS Standards ensure equitable, culturally and linguistically appropriate services for all patients, regardless of race, ethnicity, or language.' },
      { question_id: 'achc_m01_q2', prompt: 'A patient\'s daughter refuses to allow a male nurse to provide personal care due to religious beliefs. What is the FIRST step?', choices: ['Leave the home and document a refusal of care', 'Respect the request, notify your supervisor, document, and attempt to accommodate', 'Explain that the agency cannot honor religious-based requests', 'Proceed with care because it is medically necessary'], correct_answer: 1, rationale: 'Patient preferences including religious and cultural accommodations must be respected. Notify supervisor to arrange an appropriate alternative.' },
      { question_id: 'achc_m01_q3', prompt: 'The teach-back method is used to:', choices: ['Test the clinician\'s ability to explain medical content', 'Verify that a patient can accurately recall and apply instructions', 'Reduce the time spent on patient education', 'Confirm the patient signed the consent form'], correct_answer: 1, rationale: 'Teach-back verifies actual patient comprehension by asking them to explain or demonstrate back — not just asking "do you understand?"' },
      { question_id: 'achc_m01_q4', prompt: 'A colleague makes a culturally insensitive remark about a patient within earshot of the patient\'s family. Your professional obligation is to:', choices: ['Ignore it to avoid creating conflict during the visit', 'Document the incident and report it to your supervisor', 'Confront the colleague publicly in the patient\'s home', 'Notify the patient\'s family and apologize on the agency\'s behalf'], correct_answer: 1, rationale: 'Document the incident objectively and report to your supervisor. Do not ignore it, and do not investigate or address it personally during a patient visit.' },
      { question_id: 'achc_m01_q5', prompt: 'Family members should NOT be used as interpreters for:', choices: ['Scheduling future appointments', 'General conversational greetings', 'Informed consent, medication instructions, and clinical education', 'Confirming the patient\'s name and address'], correct_answer: 2, rationale: 'Family members may not interpret clinical content due to risk of filtering, mistranslation, and HIPAA concerns. Agency-approved interpreter services must be used.' },
    ],
  },
  {
    test_id: 'tst_achc_m02', topic_id: 'ACHC-ART-M02', passing_score: 80,
    questions: [
      { question_id: 'achc_m02_q1', prompt: 'Under the Agency triage system, a Class I patient requires priority contact because:', choices: ['They are the furthest from the agency office', 'They are life-sustaining technology dependent', 'They have the highest copay obligations', 'They are most likely to file a grievance'], correct_answer: 1, rationale: 'Class I patients depend on life-sustaining technology (ventilators, oxygen, infusion pumps) and face immediate danger without power or clinical support.' },
      { question_id: 'achc_m02_q2', prompt: 'During an emergency, you cannot reach your patient after 3 attempts. You must document:', choices: ['A general note saying the patient was unreachable', 'The specific times of each attempt, method used, and escalation steps taken', 'Only the final outcome', 'Nothing until the emergency is over'], correct_answer: 1, rationale: 'Each contact attempt must be documented with the time, method, and result. This is the audit trail demonstrating your due diligence.' },
      { question_id: 'achc_m02_q3', prompt: 'True or False: During a declared emergency, your HIPAA and documentation obligations are suspended.', choices: ['True — emergency conditions override normal requirements', 'False — documentation requirements continue, shifting to paper backup if needed', 'True — only for the first 24 hours', 'False — but penalties are waived'], correct_answer: 1, rationale: 'Documentation obligations do not disappear during emergencies. They shift to paper backup with transfer to EHR within 24 hours of system restoration.' },
      { question_id: 'achc_m02_q4', prompt: 'A patient refuses to evacuate during a wildfire emergency. Your documentation must include:', choices: ['Nothing — refusal ends your liability', 'The patient\'s verbal refusal, your explanation of risks, all notifications made, and the time of each', 'Only the supervisor notification', 'The patient\'s insurance information for risk transfer'], correct_answer: 1, rationale: 'Patient refusal of evacuation must be fully documented including the refusal, risk counseling provided, and all notifications to supervisors and emergency services.' },
      { question_id: 'achc_m02_q5', prompt: 'Which of the following best describes your role during patient evacuation?', choices: ['Transport the patient in your personal vehicle to the nearest shelter', 'Facilitate and coordinate with emergency services — do not transport patients yourself', 'Call 911 only for Class I patients', 'Evacuate the patient only if their family is unavailable'], correct_answer: 1, rationale: 'Your role is to facilitate and coordinate evacuation with emergency services. Personal vehicle transport of patients creates liability and may not meet safety requirements.' },
    ],
  },
  {
    test_id: 'tst_achc_m03', topic_id: 'ACHC-ART-M03', passing_score: 80,
    questions: [
      { question_id: 'achc_m03_q1', prompt: 'The agency must respond in writing to a formal patient grievance within:', choices: ['5 business days', '10 working days', '30 calendar days', '60 days'], correct_answer: 1, rationale: '42 CFR 484.50(c) requires that the agency provide a written grievance resolution within 10 working days.' },
      { question_id: 'achc_m03_q2', prompt: 'Which staff member is responsible for initially receiving a patient complaint?', choices: ['Only the Administrator or Compliance Officer', 'Only the employee directly involved in the complaint', 'Any staff member who receives it', 'Only the Director of Nursing'], correct_answer: 2, rationale: 'Any employee who receives a patient complaint is responsible for receiving it, documenting it, and submitting it to the administrator — regardless of role.' },
      { question_id: 'achc_m03_q3', prompt: 'A patient\'s son tells you he saw bruises on his father\'s arm after a recent bath visit. This most closely describes:', choices: ['A general complaint about the visit', 'A scheduling inconvenience', 'A potential allegation requiring mandatory reporting', 'An informal quality concern'], correct_answer: 2, rationale: 'Reported physical marks after a care visit are a potential abuse allegation and require mandatory reporting, not just grievance processing.' },
      { question_id: 'achc_m03_q4', prompt: 'When responding to an upset family member, the phrase you should NEVER say is:', choices: ['"I hear your concern and I want to make sure this is documented."', '"I am going to connect you with the right person right away."', '"That\'s not what happened — I was there."', '"Can you tell me more about what occurred?"'], correct_answer: 2, rationale: 'Never argue with or contradict a patient or family during a complaint interaction. This escalates the situation and can constitute an admission.' },
      { question_id: 'achc_m03_q5', prompt: 'True or False: A patient complaint must be documented even if it seems minor or you believe it is unfounded.', choices: ['True — all complaints must be documented regardless of perceived severity', 'False — only formal grievances require documentation', 'True — but only if it involves clinical care', 'False — informal complaints can be addressed verbally without documentation'], correct_answer: 0, rationale: 'All complaints must be documented, regardless of perceived severity or merit. Documentation is the protection for both the patient and the agency.' },
    ],
  },
  {
    test_id: 'tst_achc_m04', topic_id: 'ACHC-ART-M04', passing_score: 80,
    questions: [
      { question_id: 'achc_m04_q1', prompt: 'The minimum necessary standard requires you to:', choices: ['Share all available PHI with the entire care team at each visit', 'Use or share only the PHI needed to accomplish the specific purpose', 'Withhold all PHI unless the patient is present', 'Request authorization before sharing any PHI with any provider'], correct_answer: 1, rationale: 'The minimum necessary standard limits PHI use and disclosure to only what is needed for the specific task — nothing more.' },
      { question_id: 'achc_m04_q2', prompt: 'Which of the following situations is a HIPAA violation?', choices: ['Discussing a patient\'s care plan with the treating physician', 'Sending an encrypted clinical summary to the referring physician', 'Texting a patient\'s diagnosis and name to a coworker over personal SMS', 'Submitting a claim to Medicare with the required PHI fields'], correct_answer: 2, rationale: 'Texting PHI over unsecured personal SMS is a HIPAA Security Rule violation, regardless of intent.' },
      { question_id: 'achc_m04_q3', prompt: 'A neighbor asks you if Mrs. Johnson is your patient and whether she is doing well. You should:', choices: ['Confirm she is a patient but avoid sharing clinical details', 'Neither confirm nor deny that you are providing services', 'Ask the neighbor to call the agency for that information', 'Share a brief positive update to maintain community goodwill'], correct_answer: 1, rationale: 'Even confirming that someone is a patient is a HIPAA disclosure. The correct response is to neither confirm nor deny the relationship.' },
      { question_id: 'achc_m04_q4', prompt: 'If you suspect a HIPAA breach has occurred, you must:', choices: ['Wait until you can confirm the breach before reporting', 'Investigate the breach yourself and notify the patient directly', 'Report to your Privacy Officer immediately upon discovery', 'Document the incident at your next scheduled shift'], correct_answer: 2, rationale: 'Report to the Privacy Officer immediately upon discovery or suspicion. The breach notification clock begins at discovery, not confirmation.' },
      { question_id: 'achc_m04_q5', prompt: 'True or False: You can discuss a patient\'s condition in a public location as long as you do not use the patient\'s last name.', choices: ['True — first name only does not identify a patient', 'False — identifiable context is sufficient to constitute a HIPAA violation', 'True — if no one in the area knows the patient', 'False — only written disclosures are regulated by HIPAA'], correct_answer: 1, rationale: 'Even without using a last name, combination of identifiable information (condition, location, first name, description) can constitute a HIPAA disclosure.' },
    ],
  },
  {
    test_id: 'tst_achc_m05', topic_id: 'ACHC-ART-M05', passing_score: 80,
    questions: [
      { question_id: 'achc_m05_q1', prompt: 'Standard precautions apply to:', choices: ['Only patients with a known bloodborne infection', 'All patients with visible signs of infection', 'All patients, regardless of known diagnosis or infection status', 'Patients who request additional precautions'], correct_answer: 2, rationale: 'Standard precautions apply to all patients at all times — you cannot determine infectivity by appearance.' },
      { question_id: 'achc_m05_q2', prompt: 'Correct bag technique requires:', choices: ['Leaving the bag open on the floor for easy access during a procedure', 'Placing the bag on a disposable barrier, keeping it closed except when retrieving supplies', 'Disinfecting the bag with alcohol spray between each patient', 'Storing gloves and other PPE in the bag\'s outer pocket for quick access'], correct_answer: 1, rationale: 'Bag technique: place on a disposable barrier, keep closed when not actively in use, clean hands before and after accessing.' },
      { question_id: 'achc_m05_q3', prompt: 'After a needlestick injury, your FIRST action is:', choices: ['Call your supervisor', 'Complete the exposure incident report', 'Wash the site with soap and water for at least 30 seconds', 'Apply antiseptic and a bandage'], correct_answer: 2, rationale: 'The very first action is immediate first aid: wash the site with soap and water for at least 30 seconds. Then call your supervisor.' },
      { question_id: 'achc_m05_q4', prompt: 'Alcohol-based hand rub (ABHR) is NOT effective against which organisms?', choices: ['MRSA and VRE', 'HBV and HCV', 'C. difficile and norovirus', 'Influenza and RSV'], correct_answer: 2, rationale: 'ABHR does not effectively kill C. diff spores or norovirus. Soap and water must be used for these organisms.' },
      { question_id: 'achc_m05_q5', prompt: 'Post-exposure prophylaxis (PEP) for HIV is most effective when started within:', choices: ['24 hours', '2 hours', '72 hours', '7 days'], correct_answer: 1, rationale: 'PEP should ideally begin within 2 hours of exposure and loses effectiveness after 72 hours. Medical evaluation must be sought within 2 hours.' },
    ],
  },
  {
    test_id: 'tst_achc_m06', topic_id: 'ACHC-ART-M06', passing_score: 80,
    questions: [
      { question_id: 'achc_m06_q1', prompt: 'The teach-back method is most useful for:', choices: ['Documenting that education was provided', 'Verifying that a patient can accurately recall and apply instructions', 'Reducing the time required for patient education', 'Obtaining the patient\'s signature on educational materials'], correct_answer: 1, rationale: 'Teach-back verifies comprehension — the patient must explain or demonstrate, not just say yes or nod.' },
      { question_id: 'achc_m06_q2', prompt: 'When a patient speaks limited English, the best interpreter is:', choices: ['The patient\'s adult child who is present', 'A bilingual coworker who happens to speak the language', 'An agency-approved telephone or in-person interpreter service', 'The patient\'s spouse, as they know the patient best'], correct_answer: 2, rationale: 'Agency-approved qualified interpreter services are required for clinical content. Family members and untrained bilingual staff must not interpret for clinical purposes.' },
      { question_id: 'achc_m06_q3', prompt: 'A patient with low health literacy is most likely to:', choices: ['Ask detailed questions about their diagnosis', 'Decline all interpreter services', 'Nod and appear to understand without actual comprehension', 'Request written materials in English'], correct_answer: 2, rationale: 'Low health literacy often manifests as apparent agreement and lack of questions due to shame or confusion — not genuine understanding.' },
      { question_id: 'achc_m06_q4', prompt: 'Approximately what percentage of US adults have basic or below-basic health literacy?', choices: ['10%', '20%', '36%', '65%'], correct_answer: 2, rationale: 'The National Assessment of Adult Literacy found approximately 36% of US adults have basic or below-basic health literacy.' },
      { question_id: 'achc_m06_q5', prompt: 'Which question should you use during teach-back instead of "Do you understand?"', choices: ['"Are you clear on everything I explained?"', '"Can you show me how you will do this at home?"', '"Did you have any questions about what I said?"', '"Is there anything you want me to repeat?"'], correct_answer: 1, rationale: 'Asking the patient to show or explain back — not just confirm — is the validated teach-back technique.' },
    ],
  },
  {
    test_id: 'tst_achc_m07', topic_id: 'ACHC-ART-M07', passing_score: 80,
    questions: [
      { question_id: 'achc_m07_q1', prompt: 'Under OSHA, home health workers have the right to:', choices: ['Refuse any visit they consider personally inconvenient', 'Refuse work that poses an imminent danger without fear of retaliation', 'Report OSHA violations only through the agency, not directly to OSHA', 'Request hazard pay for high-acuity patient visits'], correct_answer: 1, rationale: 'OSHA grants workers the right to refuse work posing an imminent serious danger, without fear of retaliation, and to file complaints directly with OSHA.' },
      { question_id: 'achc_m07_q2', prompt: 'SDS Section 8 contains information about:', choices: ['Physical and chemical properties of the substance', 'Emergency response contact numbers', 'Required PPE and occupational exposure limits', 'Transport and shipping classifications'], correct_answer: 2, rationale: 'SDS Section 8 — Exposure Controls/Personal Protection — specifies required PPE types and occupational exposure limits.' },
      { question_id: 'achc_m07_q3', prompt: 'A workplace injury must be reported to your supervisor:', choices: ['Within 72 hours', 'At your next scheduled shift', 'Immediately, regardless of severity', 'Only if it requires medical treatment'], correct_answer: 2, rationale: 'All workplace injuries — regardless of severity — must be reported to the supervisor immediately. This triggers the incident report, workers\' comp process, and OSHA log.' },
      { question_id: 'achc_m07_q4', prompt: 'True or False: A medical device malfunction that did not cause immediate patient harm never requires FDA reporting.', choices: ['True — only actual harm triggers an MDR', 'False — malfunction that COULD cause harm if it recurs is reportable', 'True — near-misses are optional voluntary reports only', 'False — all device malfunctions must be reported within 24 hours'], correct_answer: 1, rationale: 'Under 21 CFR 803, device malfunction that could cause death or serious injury if it recurs is MDR-reportable, even without actual patient harm.' },
      { question_id: 'achc_m07_q5', prompt: 'Mixing bleach and ammonia in a patient\'s home creates:', choices: ['A stronger cleaning solution', 'Chloramine gas, which is toxic and can cause respiratory and eye damage', 'A mild chemical reaction with no health consequences', 'A hospital-grade disinfectant suitable for wound cleaning'], correct_answer: 1, rationale: 'Bleach (sodium hypochlorite) and ammonia produce chloramine gases when mixed. These are toxic and can cause respiratory damage, eye irritation, and at high concentrations, lung injury.' },
    ],
  },
  {
    test_id: 'tst_achc_m08', topic_id: 'ACHC-ART-M08', passing_score: 80,
    questions: [
      { question_id: 'achc_m08_q1', prompt: 'A patient\'s right to refuse treatment means:', choices: ['The patient can refuse care, but you may proceed if the refusal is medically inadvisable', 'The patient can decline care and you must document the refusal and notify the clinician', 'The patient must provide a written statement before a refusal is valid', 'The right to refuse applies only to non-essential procedures'], correct_answer: 1, rationale: 'A patient with capacity has an absolute right to refuse any treatment. Document the refusal, counseling provided, and notification to the supervising clinician.' },
      { question_id: 'achc_m08_q2', prompt: 'A valid DNR order must be:', choices: ['Verbally stated by the patient to any staff member', 'On file, signed by a physician, and known to all treating staff at every visit', 'Re-confirmed by the patient at each visit', 'Approved by the patient\'s family before it is honored'], correct_answer: 1, rationale: 'A valid DNR must be a written, physician-signed order accessible at the point of care. Verbal DNR statements are not sufficient.' },
      { question_id: 'achc_m08_q3', prompt: 'As a home health worker in California, you are a mandatory reporter for suspected:', choices: ['Only physical abuse by a caregiver', 'Only neglect that results in hospitalization', 'Abuse, neglect, or exploitation of elderly or dependent adults', 'Financial exploitation only if the amount exceeds $500'], correct_answer: 2, rationale: 'California CANRA and EADACPA mandate healthcare workers to report suspected physical, emotional, sexual, financial abuse, or neglect of elderly and dependent adults.' },
      { question_id: 'achc_m08_q4', prompt: 'You observe bilateral forearm bruising at different stages of healing on a patient. The caregiver says she "bumps into things." Your obligation is to:', choices: ['Accept the explanation and document it as reported', 'Conduct your own investigation before reporting', 'Document objective observations and report the concern to your supervisor under mandatory reporting', 'Monitor for two more visits before escalating'], correct_answer: 2, rationale: 'Mandatory reporters do not investigate — they report. Document what you observe objectively and report immediately.' },
      { question_id: 'achc_m08_q5', prompt: 'A family member verbally overrides a patient\'s valid advance directive at the time of a clinical emergency. You should:', choices: ['Follow the family\'s verbal instruction to honor the patient\'s relationship', 'Honor the advance directive, notify your supervisor and the on-call physician immediately, and document', 'Call 911 and let emergency services make the determination', 'Defer to the family if the patient is unresponsive'], correct_answer: 1, rationale: 'A valid, signed advance directive supersedes verbal family instructions. Honor the directive, escalate immediately, and document the family\'s statement verbatim.' },
    ],
  },
  {
    test_id: 'tst_achc_m09', topic_id: 'ACHC-ART-M09', passing_score: 80,
    questions: [
      { question_id: 'achc_m09_q1', prompt: 'The False Claims Act applies to:', choices: ['Only fraudulent billing by physicians', 'Any false or fraudulent claim submitted to a federal healthcare program', 'Only claims that exceed $10,000', 'Claims submitted by the Administrator only, not by field staff'], correct_answer: 1, rationale: 'The False Claims Act applies to any claim submitted to Medicare or Medicaid that is false or fraudulent, regardless of who generates the underlying documentation.' },
      { question_id: 'achc_m09_q2', prompt: 'An identified Medicare overpayment must be returned within:', choices: ['30 days', '60 days', '90 days', '1 year'], correct_answer: 1, rationale: 'Under the ACA 60-day rule, any identified overpayment from a federal program must be returned within 60 days. Retaining it becomes a false claim.' },
      { question_id: 'achc_m09_q3', prompt: 'Your coworker rounds up visit time by 5–7 minutes on EVV entries. This is best classified as:', choices: ['Waste — an inefficiency without intent', 'Abuse — inconsistent with sound practice', 'Fraud — intentional false representation in a federal claim', 'A documentation error with no compliance implications'], correct_answer: 2, rationale: 'Intentionally adding time to EVV entries that flow into Medicare claims is fraud under the False Claims Act.' },
      { question_id: 'achc_m09_q4', prompt: 'Whistleblower protection under federal law means:', choices: ['You receive a financial reward for every compliance report', 'You cannot be retaliated against for reporting concerns in good faith', 'Anonymous reports are not protected because identity cannot be confirmed', 'Protection applies only to reports made to external agencies, not internally'], correct_answer: 1, rationale: 'Federal anti-retaliation provisions protect employees who report compliance concerns in good faith, whether internally or externally.' },
      { question_id: 'achc_m09_q5', prompt: 'Under the Anti-Kickback Statute, accepting a gift card from a medical equipment vendor:', choices: ['Is acceptable if the value is under $50', 'Requires only disclosure to your supervisor', 'May constitute an illegal inducement for referrals', 'Is permitted if the vendor is approved by the agency'], correct_answer: 2, rationale: 'The Anti-Kickback Statute broadly prohibits anything of value exchanged to induce or reward referrals to federal healthcare programs.' },
    ],
  },
  {
    test_id: 'tst_achc_m10', topic_id: 'ACHC-ART-M10', passing_score: 80,
    questions: [
      { question_id: 'achc_m10_q1', prompt: 'Patient autonomy in healthcare means:', choices: ['Patients must follow their physician\'s orders at all times', 'The patient\'s right to make decisions about their own care, even decisions you disagree with', 'Autonomy applies only to patients over age 65', 'Clinical staff can override patient decisions if medically warranted'], correct_answer: 1, rationale: 'Autonomy is the patient\'s absolute right to make decisions about their own care, grounded in informed consent and upheld by HIPAA and CMS CoP.' },
      { question_id: 'achc_m10_q2', prompt: 'If a family member contradicts a patient\'s valid advance directive, you should:', choices: ['Follow the family member\'s instruction to honor the patient relationship', 'Follow the advance directive and escalate to your supervisor and Ethics Committee immediately', 'Call the patient\'s physician to make the final determination', 'Ask the patient at the next visit which they prefer'], correct_answer: 1, rationale: 'A valid advance directive supersedes family verbal override. Honor it, notify the supervisor and on-call physician, and document the family statement verbatim.' },
      { question_id: 'achc_m10_q3', prompt: 'True or False: Accepting a gift under $20 from a patient is always acceptable under agency policy.', choices: ['True — small gifts are a recognized expression of patient gratitude', 'False — most agencies prohibit any gift-giving regardless of value', 'True — only cash gifts are prohibited', 'False — only if the gift is given while providing direct care'], correct_answer: 1, rationale: 'Most home health agencies prohibit staff from accepting any gifts from patients regardless of monetary value. Check your agency policy — the default is prohibition.' },
      { question_id: 'achc_m10_q4', prompt: 'Non-maleficence means:', choices: ['Your duty to do good and act in the patient\'s best interest', 'Your duty to avoid causing harm to patients, including harm from inaction', 'Fair and equal access to care for all patients', 'The patient\'s right to refuse treatment'], correct_answer: 1, rationale: 'Non-maleficence is the ethical duty to avoid causing harm — including harm that results from failing to act when action was required.' },
      { question_id: 'achc_m10_q5', prompt: 'The Ethics Committee is accessible to:', choices: ['Administrators and DONs only', 'Clinical staff only, not field workers', 'Any employee, patient, or family member facing an ethical dilemma', 'Only cases involving end-of-life decisions'], correct_answer: 2, rationale: 'The Ethics Committee is available to any employee, patient, or family member with an ethical concern. Access is through a supervisor or Compliance Officer.' },
    ],
  },
  {
    test_id: 'tst_achc_m11', topic_id: 'ACHC-ART-M11', passing_score: 80,
    questions: [
      { question_id: 'achc_m11_q1', prompt: 'Hepatitis B virus (HBV) risk per needlestick in an unvaccinated healthcare worker is approximately:', choices: ['0.3%', '1.8%', '30%', '50%'], correct_answer: 2, rationale: 'HBV is the most transmissible bloodborne pathogen — approximately 30% risk per needlestick in an unvaccinated worker.' },
      { question_id: 'achc_m11_q2', prompt: 'After a needlestick, the required medical evaluation must occur within:', choices: ['24 hours', '2 hours', '72 hours', '7 days'], correct_answer: 1, rationale: 'Post-exposure medical evaluation must occur within 2 hours to ensure optimal PEP decision-making and treatment effectiveness.' },
      { question_id: 'achc_m11_q3', prompt: 'True or False: A surgical mask provides adequate respiratory protection from active pulmonary tuberculosis.', choices: ['True — a surgical mask filters airborne particles', 'False — only an N95 respirator provides airborne protection', 'True — for exposures shorter than 15 minutes', 'False — only a PAPR provides sufficient protection'], correct_answer: 1, rationale: 'A surgical mask filters large droplets. TB is transmitted via airborne droplet nuclei that pass through a surgical mask. An N95 (at minimum) is required.' },
      { question_id: 'achc_m11_q4', prompt: 'TB screening for home health workers requires:', choices: ['A one-time test at hire only', 'Annual PPD or IGRA testing and chest X-ray if positive', 'Testing only if the worker has a known TB exposure', 'Monthly symptom checks as a substitute for PPD'], correct_answer: 1, rationale: 'Annual TB screening via PPD or IGRA is required for healthcare workers, with chest X-ray for any positive result.' },
      { question_id: 'achc_m11_q5', prompt: 'The recommended N95 use protocol requires:', choices: ['Sharing the N95 between staff to reduce cost', 'Fit-testing annually and a seal-check before every use', 'Using the N95 only when a patient has a confirmed TB diagnosis', 'Discarding the N95 after each contact with a known infectious patient'], correct_answer: 1, rationale: 'N95 respirators require annual fit-testing and a seal-check performed by the wearer before every use to ensure proper protection.' },
    ],
  },
  {
    test_id: 'tst_achc_m12', topic_id: 'ACHC-ART-M12', passing_score: 80,
    questions: [
      { question_id: 'achc_m12_q1', prompt: 'A Medical Device Report (MDR) is required when a device:', choices: ['Has a cosmetic defect or displays a warning light', 'Requires scheduled maintenance', 'Caused or contributed to patient death, serious injury, or malfunctioned in a way that could cause either', 'Is more than 5 years old and hasn\'t been serviced'], correct_answer: 2, rationale: 'MDR triggers under 21 CFR 803: device-related death, serious injury, or malfunction that could cause death or serious injury if it recurs.' },
      { question_id: 'achc_m12_q2', prompt: 'The reporting deadline for a device-related death or serious injury is:', choices: ['5 calendar days', '10 working days from identification', '30 calendar days', '60 days after the patient is discharged'], correct_answer: 1, rationale: 'Under 21 CFR 803, the facility must submit FDA Form 3500A within 10 working days of becoming aware of a reportable device event.' },
      { question_id: 'achc_m12_q3', prompt: 'True or False: After a device failure, you should return it to the manufacturer immediately for inspection.', choices: ['True — the manufacturer is responsible for investigation', 'False — preserve the device and do not return, repair, or discard until risk management clears it', 'True — after photographing it', 'False — discard it to prevent further use'], correct_answer: 1, rationale: 'The device must be preserved as physical evidence for the MDR investigation. Do not return, repair, or discard it until released by risk management.' },
      { question_id: 'achc_m12_q4', prompt: 'Which form is used for mandatory FDA medical device reporting by a healthcare facility?', choices: ['CMS Form 855', 'FDA Form 3500 (MedWatch)', 'FDA Form 3500A', 'OSHA Form 300'], correct_answer: 2, rationale: 'FDA Form 3500A is the mandatory reporting form for facilities. Form 3500 (MedWatch) is for voluntary reporting by individuals.' },
      { question_id: 'achc_m12_q5', prompt: 'Prior documentation noting a device defect (e.g., unusual noises) before a failure event:', choices: ['Eliminates the need for an MDR', 'Strengthens the MDR by demonstrating the failure pattern was known', 'Is irrelevant to the MDR submission', 'Creates personal liability for the clinician who documented it'], correct_answer: 1, rationale: 'Prior documentation of warning signs is included in the MDR and strengthens the agency\'s due diligence record. It demonstrates pattern recognition, not negligence.' },
    ],
  },
];
void _legacyInlineTests;

// ─── Merge ACHC data into DB ──────────────────────────────────────────────────
const initialDB: DemoDB = {
  topics: [
    ...canonicalTopics.map(t => ({ ...t, category: 'onboarding' as TopicCategory })),
    ...achcSeedTopics,
  ],
  lessons: [...syncedLessons, ...achcSeedLessons],
  tests: [...syncedTests, ...achcSeedTests],
};

type RouteView = 'dashboard' | 'module-overview' | 'lesson' | 'test' | 'complete' | 'results' | 'certificate';

type RouteParams = {
  topicId?: string;
  lessonIndex?: number;
  cardIndex?: number;
  passed?: boolean;
  rationale?: string;
  finalCorrect?: number;
  finalTotal?: number;
};

type RouteState = {
  view: RouteView;
  params?: RouteParams;
};

type NavigateFn = (view: RouteView, params?: RouteParams) => void;

function NativeAudioPlayer({ isPlaying, onPlayPause, duration }: { isPlaying: boolean; onPlayPause: () => void; duration: string }) {
  return (
    <div className="my-8 flex items-center space-x-4 border-l-2 border-[var(--primary)] py-2 pl-4">
      <button
        type="button"
        onClick={onPlayPause}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] text-[var(--secondary)] transition-colors hover:bg-[var(--bg-light)]"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-1 h-4 w-4 fill-current" />}
      </button>
      <div className="flex w-32 items-center space-x-3">
        {isPlaying ? (
          <div className="playing-wave flex h-4 items-end space-x-1">
            <span /><span /><span /><span />
          </div>
        ) : (
          <div className="h-[2px] w-full bg-[var(--border-light)]" />
        )}
      </div>
      <span className="w-10 text-xs font-medium text-[var(--text-muted)]">{duration}</span>
      <Volume2 className="h-4 w-4 text-gray-400" />
    </div>
  );
}

function LearnerDashboard({
  db,
  navigate,
  rewards,
  completedCount,
}: {
  db: DemoDB;
  navigate: NavigateFn;
  rewards: RewardProgress[];
  completedCount: number;
}) {
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('onboarding');
  const unlockedCount = rewards.filter(reward => reward.unlocked).length;

  const onboardingTopics = db.topics.filter(t => (t.category ?? 'onboarding') === 'onboarding');
  const annualTopics = db.topics.filter(t => t.category === 'annual');
  const visibleTopics = activeCategory === 'onboarding' ? onboardingTopics : annualTopics;

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-2 font-heading text-3xl font-medium text-[var(--text-main)]">My Learning</h1>
      <p className="mb-8 text-[var(--text-muted)]">Required compliance and clinical training.</p>

      {/* ── Category Tabs ── */}
      <div className="mb-10 flex border-b border-[var(--border-light)]">
        <button
          type="button"
          onClick={() => setActiveCategory('onboarding')}
          className={`mr-8 pb-3 text-sm font-semibold uppercase tracking-widest transition-colors ${activeCategory === 'onboarding' ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          Onboarding <span className="ml-1 rounded bg-[var(--bg-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{onboardingTopics.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('annual')}
          className={`pb-3 text-sm font-semibold uppercase tracking-widest transition-colors ${activeCategory === 'annual' ? 'border-b-2 border-[var(--secondary)] text-[var(--secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          Annual Training — ACHC <span className="ml-1 rounded bg-[var(--bg-light)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">{annualTopics.length}</span>
        </button>
      </div>

      {/* ── Annual Training context strip ── */}
      {activeCategory === 'annual' && (
        <div className="mb-8 border-l-2 border-[var(--secondary)] bg-[var(--secondary-soft)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--secondary)]">ACHC Required — Field Worker Edition</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            12 modules · On hire + annually · 80% passing threshold · All modules include TTS narration and scenario-based challenges.
          </p>
        </div>
      )}

      {/* ── Badge Rewards (onboarding only) ── */}
      {activeCategory === 'onboarding' && (
        <div className="mb-10 p-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-medium text-[var(--text-main)]">Badge Rewards</h2>
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {unlockedCount}/{rewards.length} unlocked
            </div>
          </div>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            Completed trainings: <span className="font-semibold text-[var(--text-main)]">{completedCount}</span>.
            Cosmetic rewards unlock automatically as you complete modules.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rewards.map(reward => (
              <div
                key={reward.id}
                className={`border p-4 transition-colors ${reward.unlocked ? 'border-[var(--success)] bg-[var(--success-soft)]' : 'border-[var(--border-light)] bg-[var(--bg-light)]'}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${reward.unlocked ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                    {reward.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">{reward.unlockAtCompletions} complete</span>
                </div>
                <h3 className="mb-1 font-heading text-base font-medium text-[var(--text-main)]">{reward.badgeLabel}</h3>
                <p className="mb-2 text-xs font-semibold text-[var(--secondary)]">{reward.cosmeticName}</p>
                <p className="text-xs text-[var(--text-muted)]">{reward.flavorText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Module List ── */}
      <div className="flex flex-col">
        {visibleTopics.map(topic => {
          const isAnnual = topic.category === 'annual';
          return (
            <div
              key={topic.topic_id}
              onClick={() => topic.status !== 'LOCKED' && navigate('module-overview', { topicId: topic.topic_id })}
              className={`-mx-6 flex cursor-pointer flex-col border-b border-[var(--border-light)] px-6 py-8 transition-colors ${topic.status === 'LOCKED' ? 'cursor-not-allowed opacity-50' : isAnnual ? 'hover:bg-[var(--secondary-soft)]' : 'hover:bg-[var(--bg-light)]'}`}
            >
              <div className="flex flex-col items-start gap-8 md:flex-row">
                <div className="flex-1">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${topic.status === 'LOCKED' ? 'text-[var(--text-muted)]' : isAnnual ? 'text-[var(--secondary)]' : 'text-[var(--secondary)]'}`}>
                        {topic.status}
                      </span>
                      {isAnnual && (
                        <span className="flex items-center gap-1 rounded border border-[var(--secondary)] bg-[var(--secondary-tint)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--secondary)]">
                          <Mic className="h-2.5 w-2.5" /> TTS
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-medium text-[var(--text-muted)]">{topic.topic_id}</span>
                  </div>
                  <h3 className="mb-3 font-heading text-2xl font-medium text-[var(--text-main)] transition-colors">{topic.title}</h3>
                  <p className="mb-5 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">{topic.description}</p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {displayRoles(topic.required_roles).map(role => (
                      <span key={`${topic.topic_id}-${role}`} className="rounded border border-[var(--border-light)] bg-white px-2 py-1 text-[10px] font-semibold tracking-widest text-[var(--text-muted)]">
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-6 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                    <span className="flex items-center"><FileText className="mr-2 h-3.5 w-3.5" /> {db.lessons.filter(l => l.topic_id === topic.topic_id).length} Lesson(s)</span>
                    <span className="flex items-center"><CheckSquare className="mr-2 h-3.5 w-3.5" /> Final Test</span>
                    {isAnnual && <span className="flex items-center text-[var(--secondary)]"><Volume2 className="mr-2 h-3.5 w-3.5" /> Narration</span>}
                  </div>
                </div>
                {topic.image_url && (
                  <div className={`hidden h-36 w-56 shrink-0 overflow-hidden rounded-2xl border md:block ${isAnnual ? 'border-[var(--secondary)]/20' : 'border-[var(--border-light)]'} ${topic.status === 'LOCKED' ? 'grayscale' : ''}`}>
                    <img src={topic.image_url} alt={topic.title} className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LearnerModuleOverview({ db, params, navigate }: { db: DemoDB; params: RouteParams; navigate: NavigateFn }) {
  const topic = db.topics.find(t => t.topic_id === params.topicId);
  if (!topic) return null;
  const topicLessons = db.lessons.filter(l => l.topic_id === params.topicId).sort((a, b) => a.order - b.order);

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl">
      <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
        <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO DASHBOARD
      </button>

      {topic.image_url && (
        <div className="mb-10 h-80 w-full overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-light)]">
          <img src={topic.image_url} alt={topic.title} className="h-full w-full object-cover object-center" />
        </div>
      )}

      <div className="mb-12">
        <div className="mb-4 flex items-center space-x-3">
          <span className="rounded-sm bg-[var(--secondary-tint)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--secondary)]">MODULE OVERVIEW</span>
          <span className="font-mono text-xs font-medium text-[var(--text-muted)]">{topic.topic_id}</span>
        </div>
        <h1 className="mb-4 font-heading text-4xl font-medium text-[var(--text-main)]">{topic.title}</h1>
        <p className="mb-6 text-lg leading-relaxed text-[var(--text-muted)]">{topic.description}</p>

        <div className="inline-flex space-x-6 border border-[var(--border-light)] bg-[var(--bg-light)] p-4 font-mono text-xs text-[var(--text-muted)]">
          <span>Policy: {topic.policy_ids.join(', ') || 'N/A'}</span>
          <span>Workflow: {topic.workflow_ids.join(', ') || 'N/A'}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {displayRoles(topic.required_roles).map(role => (
            <span key={`${topic.topic_id}-overview-${role}`} className="rounded border border-[var(--border-light)] bg-white px-2 py-1 text-[10px] font-semibold tracking-widest text-[var(--text-muted)]">
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-12 border-t border-[var(--border-light)] pt-10">
        <h2 className="mb-6 font-heading text-2xl font-medium text-[var(--text-main)]">Curriculum Outline</h2>

        <div className="space-y-4">
          {topicLessons.map((lesson, idx) => (
            <div key={lesson.lesson_id} className="flex items-center border border-[var(--border-light)] bg-[var(--bg-light)] p-6 transition-colors hover:border-[var(--secondary)]">
              <div className="mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-white font-heading font-medium text-[var(--secondary)]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-heading text-lg font-medium text-[var(--text-main)]">{lesson.title}</h3>
                <p className="flex items-center text-sm text-[var(--text-muted)]">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  Includes Summary, {lesson.cards.length - 2} Content Part(s), and Challenge
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center border border-[var(--border-light)] bg-white p-6 opacity-80">
            <div className="mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-light)] text-[var(--primary)]">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-heading text-lg font-medium text-[var(--text-main)]">Final Evaluation</h3>
              <p className="text-sm text-[var(--text-muted)]">Multiple-choice knowledge check</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('lesson', { topicId: topic.topic_id, lessonIndex: 0, cardIndex: 0 })}
        className="flex w-full items-center justify-center bg-[var(--primary)] px-10 py-4 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--primary-dark)] md:w-auto"
      >
        START MODULE <ChevronRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
}

function LearnerLesson({ db, params, navigate }: { db: DemoDB; params: RouteParams; navigate: NavigateFn }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [challengeResponse, setChallengeResponse] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const topicLessons = db.lessons.filter(l => l.topic_id === params.topicId).sort((a, b) => a.order - b.order);
  if (!topicLessons || topicLessons.length === 0) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
        </button>
        <div className="border border-[var(--border-light)] bg-[var(--bg-light)] p-8 text-center">
          <p className="text-[var(--text-muted)]">This topic does not have any lesson content loaded in the current demo database.</p>
        </div>
      </div>
    );
  }

  const lessonIndex = params.lessonIndex ?? 0;
  const cardIndex = params.cardIndex ?? 0;
  const lesson = topicLessons[lessonIndex];
  if (!lesson) return null;
  const card = lesson.cards[cardIndex] as LessonCard;
  if (!card) return null;
  const progressPercent = Math.round(((cardIndex + 1) / lesson.cards.length) * 100);
  const isMcq = card.type === 'challenge' && Array.isArray(card.options) && card.options.length > 0;
  const selectedOpt = isMcq ? card.options!.find(o => o.id === selectedOption) : undefined;

  const isAchcModule = params.topicId?.startsWith('ACHC-ART-') ?? false;
  const isLastCard = cardIndex === lesson.cards.length - 1;
  const isLastLesson = lessonIndex === topicLessons.length - 1;
  const isL5Final = lesson.order === 5;

  const handleNext = () => {
    setIsPlaying(false);
    setSelectedOption(null);
    setShowFeedback(false);

    // Accumulate score for L5 final-assessment MCQ cards
    let fc = params.finalCorrect ?? 0;
    let ft = params.finalTotal ?? 0;
    if (isL5Final && isMcq && showFeedback && selectedOption) {
      const isCorrect = card.options?.find(o => o.id === selectedOption)?.isCorrect ?? false;
      fc = fc + (isCorrect ? 1 : 0);
      ft = ft + 1;
    }
    const scoreCarry = isL5Final ? { finalCorrect: fc, finalTotal: ft } : {};

    if (!isLastCard) {
      navigate('lesson', { ...params, ...scoreCarry, cardIndex: cardIndex + 1 });
    } else if (!isLastLesson) {
      setChallengeResponse('');
      navigate('lesson', { ...params, ...scoreCarry, lessonIndex: lessonIndex + 1, cardIndex: 0 });
    } else if (isAchcModule) {
      // ACHC: final lesson is L5 (embedded final assessment) — go to results screen
      const totalMcq = ft;
      const score = totalMcq > 0 ? Math.round((fc / totalMcq) * 100) : 100;
      navigate('results', { topicId: params.topicId, passed: score >= 80, finalCorrect: fc, finalTotal: totalMcq });
    } else {
      navigate('test', { topicId: params.topicId });
    }
  };

  const handleSubmitMcq = () => {
    setShowFeedback(true);
  };

  const isSplash = card.type === 'splash';

  const canProceed = isSplash
    ? true
    : isMcq
      ? showFeedback
      : card.type === 'challenge'
        ? challengeResponse.trim().length >= 10
        : true;

  const nextLabel = isLastCard && isLastLesson
    ? (isAchcModule ? 'COMPLETE MODULE' : 'PROCEED TO TEST')
    : isLastCard
      ? 'NEXT LESSON'
      : 'CONTINUE';

  // ── Splash screen (no narration, just a module launch card) ─────────────────
  if (isSplash) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
        </button>
        {card.image_url && (
          <div className="mb-10 w-full overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-light)]">
            <img src={card.image_url} alt={card.title} className="h-80 w-full object-cover object-center" />
          </div>
        )}
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--secondary)]">Annual Training</p>
        <h1 className="mb-6 font-heading text-5xl font-medium leading-tight text-[var(--text-main)]">{card.title}</h1>
        <p className="mb-12 whitespace-pre-wrap text-lg leading-relaxed text-[var(--text-muted)]">{card.content}</p>
        <button
          type="button"
          onClick={handleNext}
          className="flex items-center bg-[var(--primary)] px-10 py-4 text-base font-medium tracking-wider text-white transition-colors hover:bg-[var(--primary-dark)]"
        >
          BEGIN MODULE <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl">
      <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
        <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
      </button>

      <div className="mb-4 h-1 w-full bg-[var(--border-light)]">
        <div className="h-full bg-[var(--secondary)] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mb-16 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        <span>{lesson.title}</span>
        <span>Part {cardIndex + 1} of {lesson.cards.length}</span>
      </div>

      <div className="mb-12">
        {card.image_url && (
          <div className="mb-10 w-full overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-light)]">
            <img src={card.image_url} alt={card.title} className="h-72 w-full object-cover object-center" />
          </div>
        )}

        <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-[var(--secondary)]">
          {card.type === 'challenge' ? (isMcq ? 'CHALLENGE — MCQ' : 'CHALLENGE') : card.type}
        </span>
        <h2 className="mb-4 font-heading text-4xl font-medium text-[var(--text-main)]">{card.title}</h2>

        <NativeAudioPlayer isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} duration={card.estimated_duration} />

        <div className="whitespace-pre-wrap text-lg leading-relaxed text-[var(--text-main)]">{card.content}</div>

        {isMcq && (
          <div className="mt-10 border-t border-dashed border-[var(--border-light)] pt-8">
            <p className="mb-5 text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">Select the best answer:</p>
            <div className="flex flex-col gap-3">
              {card.options!.map(opt => {
                const isSelected = selectedOption === opt.id;
                const isAnswered = showFeedback;
                let borderColor = 'border-[var(--border-light)]';
                let bg = 'bg-white';
                if (isAnswered && isSelected && opt.isCorrect) { borderColor = 'border-[var(--success)]'; bg = 'bg-[var(--success-tint)]'; }
                else if (isAnswered && isSelected && !opt.isCorrect) { borderColor = 'border-[var(--danger)]'; bg = 'bg-[var(--danger-tint)]'; }
                else if (isAnswered && opt.isCorrect) { borderColor = 'border-[var(--success)]'; bg = 'bg-[var(--success-tint)]'; }
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`flex items-start gap-4 border ${borderColor} ${bg} p-4 text-left transition-all hover:border-[var(--secondary)] disabled:cursor-default`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${isSelected ? 'border-[var(--primary)] bg-[var(--primary)] text-white' : 'border-[var(--border-light)] text-[var(--text-muted)]'}`}>
                      {opt.id}
                    </span>
                    <span className="text-base text-[var(--text-main)]">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {!showFeedback && selectedOption && (
              <button
                type="button"
                onClick={handleSubmitMcq}
                className="mt-6 bg-[var(--secondary)] px-7 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--secondary-dark)]"
              >
                SUBMIT ANSWER
              </button>
            )}

            {showFeedback && selectedOpt && (
              <div className={`mt-6 border-l-4 p-5 ${selectedOpt.isCorrect ? 'border-[var(--success)] bg-[var(--success-tint)]' : 'border-[var(--danger)] bg-[var(--danger-tint)]'}`}>
                <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${selectedOpt.isCorrect ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {selectedOpt.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-main)]">{selectedOpt.rationale}</p>
                {!selectedOpt.isCorrect && (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    <strong>Correct answer:</strong> {card.options!.find(o => o.isCorrect)?.id} — {card.options!.find(o => o.isCorrect)?.label}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!isMcq && card.type === 'challenge' && (
          <div className="mt-12 border-t border-dashed border-[var(--border-light)] pt-10">
            <label className="mb-4 block text-sm font-medium uppercase tracking-wider text-[var(--text-main)]">Your Response (Required)</label>
            <textarea
              rows={5}
              value={challengeResponse}
              onChange={(e) => setChallengeResponse(e.target.value)}
              className="w-full border border-[var(--border-light)] bg-[var(--bg-light)] p-5 text-base outline-none transition-colors focus:border-[var(--primary)]"
              placeholder="Analyze the scenario and type your action steps here..."
            />
          </div>
        )}
      </div>

      <div className="mt-20 flex items-center justify-between border-t border-[var(--border-light)] pt-8">
        <button
          type="button"
          disabled={cardIndex === 0}
          onClick={() => { setSelectedOption(null); setShowFeedback(false); navigate('lesson', { ...params, cardIndex: cardIndex - 1 }); }}
          className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          PREVIOUS
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="flex items-center bg-[var(--primary)] px-8 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {nextLabel} <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LearnerTest({ db, params, navigate }: { db: DemoDB; params: RouteParams; navigate: NavigateFn }) {
  const test = db.tests.find(t => t.topic_id === params.topicId);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!test) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
        </button>
        <div className="border border-[var(--border-light)] bg-[var(--bg-light)] p-8 text-center">
          <p className="text-[var(--text-muted)]">This topic does not have a test loaded in the current demo database.</p>
        </div>
      </div>
    );
  }

  const allAnswered = test.questions.every(q => answers[q.question_id] !== undefined);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    const correct = test.questions.filter(q => answers[q.question_id] === q.correct_answer).length;
    const score = Math.round((correct / test.questions.length) * 100);
    const passed = score >= test.passing_score;
    const firstWrong = test.questions.find(q => answers[q.question_id] !== q.correct_answer);
    navigate('complete', { topicId: params.topicId, passed, rationale: firstWrong?.rationale });
    return null;
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl">
      <div className="mb-10 border-b border-[var(--border-light)] pb-8">
        <h2 className="mb-2 font-heading text-3xl font-medium text-[var(--text-main)]">Final Knowledge Check</h2>
        <p className="text-[var(--text-muted)]">Answer all {test.questions.length} questions. Passing score: {test.passing_score}%.</p>
      </div>

      <div className="flex flex-col gap-12 mb-16">
        {test.questions.map((q, qIdx) => (
          <div key={q.question_id} className="border border-[var(--border-light)] bg-[var(--bg-light)] p-6">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Question {qIdx + 1} of {test.questions.length}</p>
            <p className="mb-6 font-heading text-lg font-medium leading-relaxed text-[var(--text-main)]">{q.prompt}</p>
            <div className="flex flex-col gap-3">
              {q.choices.map((choice, idx) => (
                <label
                  key={`${q.question_id}_${idx}`}
                  className={`flex cursor-pointer items-start border p-4 transition-colors ${answers[q.question_id] === idx ? 'border-[var(--secondary)] bg-[var(--secondary-tint)]' : 'border-[var(--border-light)] bg-white hover:border-[var(--secondary)]'}`}
                >
                  <input
                    type="radio"
                    name={q.question_id}
                    value={idx}
                    checked={answers[q.question_id] === idx}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.question_id]: idx }))}
                    className="mt-1 h-4 w-4 shrink-0 text-[var(--secondary)]"
                  />
                  <span className="ml-4 text-base text-[var(--text-main)]">{choice}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-[var(--border-light)] pt-8">
        <p className="text-sm text-[var(--text-muted)]">{Object.keys(answers).length} of {test.questions.length} answered</p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="bg-[var(--secondary)] px-10 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--secondary-darker)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          SUBMIT ANSWERS
        </button>
      </div>
    </div>
  );
}

function LearnerComplete({
  params,
  navigate,
  rewards,
  onTopicCompleted,
}: {
  params: RouteParams;
  navigate: NavigateFn;
  rewards: RewardProgress[];
  onTopicCompleted: (topicId: string) => void;
}) {
  useEffect(() => {
    if (params.passed && params.topicId) {
      onTopicCompleted(params.topicId);
    }
  }, [params.passed, params.topicId, onTopicCompleted]);

  const unlockedRewards = rewards.filter(reward => reward.unlocked);
  const nextReward = rewards.find(reward => !reward.unlocked);

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl py-12">
      <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full ${params.passed ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}`}>
        {params.passed ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
      </div>

      <h1 className="mb-4 font-heading text-4xl font-medium text-[var(--text-main)]">
        {params.passed ? 'Topic Completed' : 'Review Required'}
      </h1>

      <p className="mb-10 text-lg leading-relaxed text-[var(--text-muted)]">
        {params.passed
          ? 'You achieved a passing score. Your completion status has been recorded to your compliance file and the audit log has been updated.'
          : 'You did not meet the required passing score. Please review the rationale below and retake the assessment.'}
      </p>

      {!params.passed && (
        <div className="mb-12 border-l-4 border-[var(--danger)] py-2 pl-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[var(--text-main)]">Rationale</h3>
          <p className="text-base text-[var(--text-muted)]">{params.rationale}</p>
        </div>
      )}

      {params.passed && (
        <div className="mb-10 border border-[var(--border-light)] bg-[var(--bg-light)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-lg font-medium text-[var(--text-main)]">Badge Progress</h3>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              {unlockedRewards.length}/{rewards.length} unlocked
            </span>
          </div>

          {nextReward ? (
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Next unlock: <span className="font-semibold text-[var(--text-main)]">{nextReward.badgeLabel}</span> at {nextReward.unlockAtCompletions} completed trainings.
            </p>
          ) : (
            <p className="mb-4 text-sm text-[var(--success)]">All configured cosmetic rewards are unlocked.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {rewards.slice(0, 6).map(reward => (
              <span
                key={reward.id}
                className={`border px-3 py-1 text-[11px] font-semibold tracking-wide ${reward.unlocked ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success-dark)]' : 'border-[var(--border-light)] bg-white text-[var(--text-muted)]'}`}
              >
                {reward.badgeLabel}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-6 border-t border-[var(--border-light)] pt-10">
        <button type="button" onClick={() => navigate('dashboard')} className="border border-[var(--border-light)] px-8 py-3 text-sm font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-light)]">
          RETURN TO DASHBOARD
        </button>
        {!params.passed && (
          <button type="button" onClick={() => navigate('test', { topicId: params.topicId })} className="bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-dark)]">
            RETAKE TEST
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Results screen (ACHC modules only) ───────────────────────────────────────
function LearnerResults({
  db,
  params,
  navigate,
  onTopicCompleted,
}: {
  db: DemoDB;
  params: RouteParams;
  navigate: NavigateFn;
  onTopicCompleted: (topicId: string) => void;
}) {
  const topic = db.topics.find(t => t.topic_id === params.topicId);
  const totalMcq = params.finalTotal ?? 10;
  const correct = params.finalCorrect ?? 0;
  const score = totalMcq > 0 ? Math.round((correct / totalMcq) * 100) : 0;
  const passed = params.passed ?? score >= 80;

  // Find L5 lesson index so we can send the learner back to it for a retake
  const topicLessons = db.lessons
    .filter(l => l.topic_id === params.topicId)
    .sort((a, b) => a.order - b.order);
  const l5Index = topicLessons.findIndex(l => l.order === 5);

  useEffect(() => {
    if (passed && params.topicId) onTopicCompleted(params.topicId);
  }, [passed, params.topicId, onTopicCompleted]);

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl py-12">
      {/* Score badge */}
      <div className={`mb-8 inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-bold tracking-widest uppercase ${passed ? 'bg-[var(--success-soft)] text-[var(--success-dark)]' : 'bg-[var(--danger-soft)] text-[var(--danger-dark)]'}`}>
        {passed ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        {passed ? 'Assessment Passed' : 'Assessment Not Yet Passed'}
      </div>

      <h1 className="mb-3 font-heading text-5xl font-medium text-[var(--text-main)]">
        {score}%
      </h1>
      <p className="mb-1 text-xl text-[var(--text-muted)]">
        {correct} of {totalMcq} questions correct
      </p>
      <p className="mb-10 text-sm text-[var(--text-muted)]">
        Passing score: <span className="font-semibold text-[var(--text-main)]">80%</span>
        {topic && <> &nbsp;·&nbsp; {topic.title}</>}
      </p>

      <div className={`mb-10 border-l-4 p-6 ${passed ? 'border-[var(--success)] bg-[var(--success-tint)]' : 'border-[var(--primary)] bg-[var(--primary-tint)]'}`}>
        {passed ? (
          <>
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-[var(--success-dark)]">Well done!</p>
            <p className="text-base text-[var(--text-main)]">
              You have demonstrated competency in this module. Your completion has been recorded to your compliance file.
              Proceed to download your Certificate of Completion.
            </p>
          </>
        ) : (
          <>
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-[var(--danger-dark)]">Review Required</p>
            <p className="text-base text-[var(--text-main)]">
              You did not reach the 80% passing threshold. Review the lesson content and the debrief explanations, then retake the final assessment. There is no limit on retake attempts.
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-4 border-t border-[var(--border-light)] pt-10">
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="border border-[var(--border-light)] px-8 py-3 text-sm font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-light)]"
        >
          RETURN TO DASHBOARD
        </button>
        {!passed && l5Index >= 0 && (
          <button
            type="button"
            onClick={() => navigate('lesson', { topicId: params.topicId, lessonIndex: l5Index, cardIndex: 0, finalCorrect: 0, finalTotal: 0 })}
            className="bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-dark)]"
          >
            RETAKE FINAL ASSESSMENT
          </button>
        )}
        {passed && (
          <button
            type="button"
            onClick={() => navigate('certificate', { topicId: params.topicId, passed: true, finalCorrect: correct, finalTotal: totalMcq })}
            className="bg-[var(--secondary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--secondary-darker)]"
          >
            GET MY CERTIFICATE
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Certificate of Completion ─────────────────────────────────────────────────
function LearnerCertificate({
  db,
  params,
  navigate,
  learnerName,
  setLearnerName,
}: {
  db: DemoDB;
  params: RouteParams;
  navigate: NavigateFn;
  learnerName: string;
  setLearnerName: (n: string) => void;
}) {
  const [nameInput, setNameInput] = useState(learnerName);
  const [confirmed, setConfirmed] = useState(learnerName.trim().length > 0);

  const topic = db.topics.find(t => t.topic_id === params.topicId);
  const correct = params.finalCorrect ?? 0;
  const total = params.finalTotal ?? 10;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleConfirmName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) return;
    setLearnerName(trimmed);
    setConfirmed(true);
  };

  if (!confirmed) {
    return (
      <div className="animate-in fade-in duration-300 max-w-lg py-16">
        <button type="button" onClick={() => navigate('results', params)} className="mb-10 flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO RESULTS
        </button>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--secondary)]">Certificate of Completion</p>
        <h2 className="mb-8 font-heading text-4xl font-medium text-[var(--text-main)]">Enter Your Full Name</h2>
        <p className="mb-8 text-base text-[var(--text-muted)]">
          Your name will appear on the certificate exactly as you enter it below.
        </p>
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirmName(); }}
          placeholder="e.g. Maria Santos, RN"
          className="mb-6 w-full border border-[var(--border-light)] bg-white p-4 text-lg text-[var(--text-main)] outline-none transition-colors focus:border-[var(--secondary)]"
        />
        <button
          type="button"
          onClick={handleConfirmName}
          disabled={nameInput.trim().length < 2}
          className="bg-[var(--secondary)] px-10 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--secondary-darker)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          GENERATE CERTIFICATE
        </button>
      </div>
    );
  }

  const displayName = learnerName.trim() || nameInput.trim();

  return (
    <div className="animate-in fade-in duration-300 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4 print:hidden">
        <button type="button" onClick={() => navigate('dashboard')} className="flex items-center text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)]">
          <ChevronLeft className="mr-1 h-4 w-4" /> DASHBOARD
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 bg-[var(--cert-ink)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--cert-ink-hover)]"
        >
          <FileCheck className="h-4 w-4" /> PRINT / SAVE PDF
        </button>
      </div>

      {/* ── Certificate ──────────────────────────────────────────────────── */}
      <div
        id="certificate"
        className="relative mx-auto max-w-3xl border-[6px] border-[var(--cert-ink)] bg-white px-16 py-14 shadow-2xl print:shadow-none print:border-[3px]"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {/* Inner decorative border */}
        <div className="pointer-events-none absolute inset-3 border border-[var(--primary)] opacity-60" />

        {/* Corner ornaments */}
        {['top-5 left-5', 'top-5 right-5', 'bottom-5 left-5', 'bottom-5 right-5'].map(pos => (
          <div key={pos} className={`absolute ${pos} h-6 w-6 text-[var(--primary)] opacity-50 text-2xl leading-none select-none`}>✦</div>
        ))}

        {/* Agency header */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]" style={{ fontFamily: 'Calibri, sans-serif' }}>
            CareIndeed Home Health Services
          </p>
          <div className="mx-auto mt-3 h-px w-24 bg-[var(--primary)]" />
        </div>

        {/* Main title */}
        <div className="mb-8 text-center">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--secondary)]" style={{ fontFamily: 'Calibri, sans-serif' }}>
            Certificate
          </p>
          <h1 className="font-heading text-5xl font-light tracking-wide text-[var(--cert-ink)]">
            of Completion
          </h1>
        </div>

        {/* Awarding line */}
        <p className="mb-6 text-center text-base italic text-[var(--text-muted)]">This is to certify that</p>

        {/* Learner name */}
        <div className="mb-2 text-center">
          <span
            className="inline-block border-b-2 border-[var(--cert-ink)] pb-1 text-4xl font-medium text-[var(--cert-ink)]"
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}
          >
            {displayName}
          </span>
        </div>

        <p className="mb-8 text-center text-base italic text-[var(--text-muted)]">has successfully completed the required annual training module</p>

        {/* Module name */}
        <div className="mb-2 text-center">
          <span className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: 'Calibri, sans-serif' }}>
            {topic?.title ?? params.topicId}
          </span>
        </div>
        <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]" style={{ fontFamily: 'Calibri, sans-serif' }}>
          ACHC Annual Required Training
        </p>

        {/* Score & date row */}
        <div className="mb-12 flex items-center justify-center gap-12 text-center text-sm text-[var(--text-muted)]" style={{ fontFamily: 'Calibri, sans-serif' }}>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest">Final Score</p>
            <p className="mt-1 text-2xl font-bold text-[var(--secondary)]">{score}%</p>
          </div>
          <div className="h-10 w-px bg-[var(--border-light)]" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest">Date Completed</p>
            <p className="mt-1 text-base font-medium text-[var(--cert-ink)]">{today}</p>
          </div>
          <div className="h-10 w-px bg-[var(--border-light)]" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest">Accreditation</p>
            <p className="mt-1 text-base font-medium text-[var(--cert-ink)]">ACHC Compliant</p>
          </div>
        </div>

        {/* Signature lines */}
        <div className="flex items-end justify-around text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
          <div>
            <div className="mb-1 h-px w-40 bg-[var(--cert-ink)]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Administrator</p>
            <p className="text-[9px] text-[var(--text-muted)]">CareIndeed Home Health Services</p>
          </div>
          <div>
            <div className="mb-1 h-px w-40 bg-[var(--cert-ink)]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Director of Education</p>
            <p className="text-[9px] text-[var(--text-muted)]">Training & Compliance</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <div className="mx-auto mb-3 h-px w-24 bg-[var(--primary)]" />
          <p className="text-[8px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            This certificate confirms satisfactory completion of ACHC-required annual staff training. &nbsp;|&nbsp; Record ID: {params.topicId}-{Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ db }: { db: DemoDB }) {
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<'ALL' | JourneyRole>('ALL');
  const [uploadRows, setUploadRows] = useState<CsvNarrationRow[]>([]);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const roleFilteredTopics = useMemo(() => {
    return db.topics
      .filter(topic => {
        if (roleFilter === 'ALL') {
          return true;
        }
        return topic.required_roles.includes('ALL') || topic.required_roles.includes(roleFilter);
      })
      .sort((a, b) => a.topic_id.localeCompare(b.topic_id));
  }, [db.topics, roleFilter]);

  const allRoleOptions: Array<'ALL' | JourneyRole> = ['ALL', ...JOURNEY_ROLES];

  const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadRows([]);
      setUploadFileName(file.name);
      setUploadError('Only .csv files are accepted for mass upload conversion.');
      setLogs(prev => [...prev, `Upload rejected: ${file.name} (file extension must be .csv).`]);
      return;
    }

    const text = await file.text();
    const parsed = parseNarrationCsv(text);

    if (parsed.error) {
      setUploadRows([]);
      setUploadFileName(file.name);
      setUploadError(parsed.error);
      setLogs(prev => [...prev, `Upload failed: ${parsed.error}`]);
      return;
    }

    setUploadRows(parsed.rows);
    setUploadFileName(file.name);
    setUploadError('');
    setLogs(prev => [
      ...prev,
      `CSV loaded: ${file.name} (${parsed.rows.length} row(s)).`,
      `Queued ${parsed.rows.length} narration conversion item(s) for Qwen TTS sync.`,
    ]);
  };

  const runQwenTTSPipeline = () => {
    setIsGeneratingTTS(true);
    setLogs(['Initiating QwenTTSDemo connection...']);

    setTimeout(() => setLogs(l => [...l, 'Extracting narration_script from Lesson 1, Card 1...']), 600);
    setTimeout(() => setLogs(l => [...l, 'Synthesizing: "Welcome to Lesson 1..." -> /training-audio/GAO-013/les_1/c_1.wav']), 1500);
    setTimeout(() => setLogs(l => [...l, 'Synthesizing: "The five moments are..." -> /training-audio/GAO-013/les_1/c_2.wav']), 2400);
    setTimeout(() => setLogs(l => [...l, 'Synthesizing: "Time for a scenario..." -> /training-audio/GAO-013/les_1/c_3.wav']), 3200);
    setTimeout(() => {
      setLogs(l => [...l, 'Pipeline complete. Audio paths securely linked to DB.']);
      setIsGeneratingTTS(false);
    }, 4000);
  };

  const topic = db.topics[0];
  const lessons = db.lessons.filter(l => l.topic_id === topic.topic_id);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-12 flex items-end justify-between border-b border-[var(--border-light)] pb-6">
        <div>
          <h1 className="mb-2 font-heading text-3xl font-medium text-[var(--text-main)]">Training Engine Engine Admin</h1>
          <p className="text-[var(--text-muted)]">Manage curriculum structure and automated narration.</p>
        </div>
        <button type="button" className="flex items-center bg-[var(--secondary)] px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[var(--secondary-darker)]">
          <Plus className="mr-2 h-4 w-4" /> NEW TOPIC
        </button>
      </div>

      <div className="mb-12">
        <div className="mb-8 border border-[var(--border-light)] bg-[var(--bg-light)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading text-lg font-medium text-[var(--text-main)]">Required Training Coverage (Placeholders)</h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              {roleFilteredTopics.length} Training Item(s)
            </span>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {allRoleOptions.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => setRoleFilter(role)}
                className={`rounded border px-3 py-1.5 text-[11px] font-semibold tracking-wider transition-colors ${
                  roleFilter === role
                    ? 'border-[var(--secondary)] bg-[var(--secondary-tint)] text-[var(--secondary-darker)]'
                    : 'border-[var(--border-light)] bg-white text-[var(--text-muted)] hover:border-[var(--secondary)]'
                }`}
              >
                {role === 'ALL' ? 'ALL ROLES' : role}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto border border-[var(--border-light)] bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-[var(--bg-light)] text-[var(--text-muted)]">
                <tr>
                  <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Training ID</th>
                  <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Title</th>
                  <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Required Roles</th>
                </tr>
              </thead>
              <tbody>
                {roleFilteredTopics.map(topic => (
                  <tr key={topic.topic_id}>
                    <td className="border-b border-[var(--border-light)] px-3 py-2 font-mono text-[var(--text-main)]">{topic.topic_id}</td>
                    <td className="border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-main)]">{topic.title}</td>
                    <td className="border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-muted)]">
                      <div className="flex flex-wrap gap-1.5">
                        {displayRoles(topic.required_roles).map(role => (
                          <span key={`${topic.topic_id}-admin-${role}`} className="rounded border border-[var(--border-light)] bg-[var(--bg-light)] px-2 py-0.5 text-[10px] font-semibold tracking-widest text-[var(--text-muted)]">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center space-x-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--success)]">PUBLISHED</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">ID: {topic.topic_id}</span>
            </div>
            <h2 className="mb-2 font-heading text-2xl font-medium text-[var(--text-main)]">{topic.title}</h2>
            <div className="mt-4 flex space-x-6 font-mono text-xs text-[var(--text-muted)]">
              <span className="border border-[var(--border-light)] bg-[var(--bg-light)] px-2 py-1">Policy: {topic.policy_ids[0]}</span>
              <span className="border border-[var(--border-light)] bg-[var(--bg-light)] px-2 py-1">Workflow: {topic.workflow_ids[0]}</span>
            </div>
          </div>
          <button type="button" className="border border-[var(--border-light)] p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 border border-[var(--border-light)] bg-[var(--bg-light)] p-6">
          <div className="mb-8 border border-[var(--border-light)] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-heading text-base font-medium text-[var(--text-main)]">Mass Upload Conversion</h4>
                <p className="text-xs text-[var(--text-muted)]">Accepted CSV columns: A Project, B Title, C app.location, D Narration.</p>
              </div>
              <label className="flex cursor-pointer items-center border border-[var(--secondary)] bg-[var(--secondary-tint)] px-4 py-2 text-xs font-semibold tracking-wide text-[var(--secondary-darker)] transition-colors hover:bg-[var(--secondary-hover)]">
                <Upload className="mr-2 h-4 w-4" /> UPLOAD CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
              </label>
            </div>

            <div className="rounded border border-dashed border-[var(--border-light)] bg-[var(--bg-light)] p-4 font-mono text-[11px] text-[var(--text-muted)]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]">Template</p>
              <p>Project,Title,app.location,Narration</p>
              <p>GAO-013,Hand Hygiene Intro,/training-audio/GAO-013/les_1/c_1.wav,"Welcome to Lesson 1..."</p>
            </div>

            {uploadFileName && (
              <p className="mt-3 text-xs text-[var(--text-muted)]">Selected file: <span className="font-semibold text-[var(--text-main)]">{uploadFileName}</span></p>
            )}

            {uploadError && (
              <div className="mt-3 border-l-4 border-[var(--danger)] bg-[var(--danger-soft)] p-3 text-xs text-[var(--text-main)]">
                {uploadError}
              </div>
            )}

            {uploadRows.length > 0 && (
              <div className="mt-4 overflow-x-auto border border-[var(--border-light)]">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                  <thead className="bg-[var(--bg-light)] text-[var(--text-muted)]">
                    <tr>
                      <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Project</th>
                      <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Title</th>
                      <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">app.location</th>
                      <th className="border-b border-[var(--border-light)] px-3 py-2 font-semibold">Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadRows.slice(0, 5).map((row, idx) => (
                      <tr key={`${row.project}-${row.title}-${String(idx)}`}>
                        <td className="border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-main)]">{row.project}</td>
                        <td className="border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-main)]">{row.title}</td>
                        <td className="max-w-[240px] truncate border-b border-[var(--border-light)] px-3 py-2 font-mono text-[var(--text-muted)]">{row.appLocation}</td>
                        <td className="max-w-[360px] truncate border-b border-[var(--border-light)] px-3 py-2 text-[var(--text-muted)]">{row.narration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadRows.length > 5 && (
                  <div className="bg-[var(--bg-light)] px-3 py-2 text-[11px] text-[var(--text-muted)]">
                    Showing 5 of {uploadRows.length} rows.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-heading text-lg font-medium text-[var(--text-main)]">Narration Pipeline</h3>
            <button
              type="button"
              onClick={runQwenTTSPipeline}
              disabled={isGeneratingTTS}
              className="flex items-center border border-[var(--text-main)] bg-white px-5 py-2 text-sm font-medium tracking-wide text-[var(--text-main)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
            >
              {isGeneratingTTS ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
              {isGeneratingTTS ? 'GENERATING QWENTTS...' : 'SYNC AUDIO (QWEN TTS)'}
            </button>
          </div>

          {logs.length > 0 && (
            <div className="h-40 space-y-2 overflow-y-auto bg-[var(--text-main)] p-4 font-mono text-xs text-[var(--secondary-tint)]">
              {logs.map((log, i) => (
                <div key={String(i)} className="opacity-80">{'>'} {log}</div>
              ))}
              {isGeneratingTTS && <div className="animate-pulse">{'>'} _</div>}
            </div>
          )}
        </div>
      </div>

      <h3 className="mb-6 font-heading text-xl font-medium text-[var(--text-main)]">Topic Structure</h3>
      <div className="border-t border-[var(--border-light)]">
        {lessons[0].cards.map((card, idx) => {
          const isRequired = card.type === 'summary' || card.type === 'challenge';
          return (
            <div key={card.card_id} className="flex items-start justify-between border-b border-[var(--border-light)] py-8">
              <div className="w-3/4 pr-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--secondary)]">CARD {idx + 1} • {card.type}</span>
                  {isRequired ? (
                    <span className="rounded-sm border border-[var(--border-light)] bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Required (Cannot Delete)</span>
                  ) : (
                    <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-[var(--danger)] hover:underline">REMOVE CONTENT</button>
                  )}
                </div>
                <h4 className="mb-2 font-heading text-lg font-medium text-[var(--text-main)]">{card.title}</h4>
                <p className="mb-4 line-clamp-2 text-sm text-[var(--text-muted)]">{card.content}</p>

                <div className="border border-[var(--border-light)] border-l-2 border-l-[var(--primary)] bg-[var(--bg-light)] p-4">
                  <p className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]"><FileCheck className="mr-1 h-3 w-3" /> Narration Script</p>
                  <p className="text-xs italic text-[var(--text-main)]">"{card.narration_script}"</p>
                </div>
              </div>

              <div className="flex w-1/4 flex-col items-end space-y-4 text-right">
                <div>
                  <div className="flex items-center justify-end text-xs font-medium tracking-wide text-[var(--success)]">
                    <Volume2 className="mr-2 h-4 w-4" /> AUDIO LINKED
                  </div>
                  <div className="mt-2 max-w-full truncate border border-[var(--border-light)] bg-[var(--bg-light)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]">
                    {card.audio_path}
                  </div>
                </div>

                {card.image_url && (
                  <div>
                    <div className="flex items-center justify-end text-xs font-medium tracking-wide text-[var(--secondary)]">
                      <ImageIcon className="mr-2 h-4 w-4" /> IMAGE ATTACHED
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-center border-b border-[var(--border-light)] py-6">
          <button type="button" className="flex items-center border border-transparent bg-[var(--secondary-tint)] px-6 py-2 text-sm font-medium text-[var(--secondary)] transition-colors hover:border-[var(--secondary)] hover:text-[var(--secondary-darker)]">
            <Plus className="mr-2 h-4 w-4" /> ADD CONTENT CARD
          </button>
        </div>

        <div className="flex items-start justify-between border-b border-[var(--border-light)] py-8">
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[var(--danger)]">FINAL EVALUATION</span>
            <h4 className="font-heading text-lg font-medium text-[var(--text-main)]">Final Knowledge Check</h4>
          </div>
          <div className="flex items-center text-xs font-medium tracking-wide text-[var(--text-muted)]">
            <BookOpen className="mr-2 h-4 w-4" /> 1 QUESTION
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingV1JourneyPage() {
  const [mode, setMode] = useState<'learner' | 'admin'>('learner');
  const [route, setRoute] = useState<RouteState>({ view: 'dashboard' });
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [learnerName, setLearnerName] = useState('');

  const rewardProgress = useMemo(() => buildRewardProgress(completedTopicIds.length), [completedTopicIds]);

  const handleTopicCompleted = (topicId: string) => {
    setCompletedTopicIds(prev => (prev.includes(topicId) ? prev : [...prev, topicId]));
  };

  const navigate: NavigateFn = (view, params = {}) => {
    window.scrollTo(0, 0);
    setRoute({ view, params });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-white selection:bg-[var(--secondary-tint)] selection:text-[var(--secondary)]">
        <main className="w-full p-8 pb-32 md:p-12 lg:p-16">
          {route.view === 'dashboard' && (
            <div className="mb-12 flex justify-end">
              <div className="flex rounded border border-[var(--border-light)] bg-[var(--bg-light)] p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setMode('learner'); navigate('dashboard'); }}
                  className={`rounded-sm px-4 py-1.5 transition-colors ${mode === 'learner' ? 'border border-[var(--border-light)] bg-white text-[var(--secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Learner Mode
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('admin'); navigate('dashboard'); }}
                  className={`rounded-sm px-4 py-1.5 transition-colors ${mode === 'admin' ? 'border border-[var(--border-light)] bg-white text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                >
                  Admin Mode
                </button>
              </div>
            </div>
          )}

          <div className="w-full">
            {mode === 'learner' && (
              <>
                {route.view === 'dashboard' && (
                  <LearnerDashboard
                    db={initialDB}
                    navigate={navigate}
                    rewards={rewardProgress}
                    completedCount={completedTopicIds.length}
                  />
                )}
                {route.view === 'module-overview' && <LearnerModuleOverview db={initialDB} params={route.params ?? {}} navigate={navigate} />}
                {route.view === 'lesson' && <LearnerLesson db={initialDB} params={route.params ?? {}} navigate={navigate} />}
                {route.view === 'test' && <LearnerTest db={initialDB} params={route.params ?? {}} navigate={navigate} />}
                {route.view === 'complete' && (
                  <LearnerComplete
                    params={route.params ?? {}}
                    navigate={navigate}
                    rewards={rewardProgress}
                    onTopicCompleted={handleTopicCompleted}
                  />
                )}
                {route.view === 'results' && (
                  <LearnerResults
                    db={initialDB}
                    params={route.params ?? {}}
                    navigate={navigate}
                    onTopicCompleted={handleTopicCompleted}
                  />
                )}
                {route.view === 'certificate' && (
                  <LearnerCertificate
                    db={initialDB}
                    params={route.params ?? {}}
                    navigate={navigate}
                    learnerName={learnerName}
                    setLearnerName={setLearnerName}
                  />
                )}
              </>
            )}

            {mode === 'admin' && route.view === 'dashboard' && <AdminDashboard db={initialDB} />}
          </div>
        </main>
      </div>
    </>
  );
}
