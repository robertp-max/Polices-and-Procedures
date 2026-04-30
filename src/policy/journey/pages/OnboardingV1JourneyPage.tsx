import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  ChevronLeft, ChevronRight, Play, Pause, Mic, Volume2,
  CheckCircle, Plus, Edit2, Loader2, FileText, CheckSquare,
  AlertCircle, BookOpen, FileCheck, Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { ALL_MODULES } from '@/policy/journey/data/modules';
import type { JourneyRole, JourneyModule } from '@/policy/journey/types/journey';

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
    --secondary: #007970;
    --text-main: #1F1C1B;
    --text-muted: #52404B;
    --bg-light: #FAFBF8;
    --border-light: #E5E4E3;
    --success: #008540;
    --danger: #D70101;
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
};

type CardType = 'summary' | 'content' | 'challenge';

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

const initialDB: DemoDB = {
  topics: canonicalTopics,
  lessons: syncedLessons,
  tests: syncedTests,
};

type RouteView = 'dashboard' | 'module-overview' | 'lesson' | 'test' | 'complete';

type RouteParams = {
  topicId?: string;
  lessonIndex?: number;
  cardIndex?: number;
  passed?: boolean;
  rationale?: string;
};

type RouteState = {
  view: RouteView;
  params?: RouteParams;
};

type NavigateFn = (view: RouteView, params?: RouteParams) => void;

function NativeAudioPlayer({ isPlaying, onPlayPause, duration }: { isPlaying: boolean; onPlayPause: () => void; duration: string }) {
  return (
    <div className="my-8 flex items-center space-x-4 border-l-2 border-[#C74601] py-2 pl-4">
      <button
        type="button"
        onClick={onPlayPause}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E4E3] text-[#007970] transition-colors hover:bg-[#FAFBF8]"
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-1 h-4 w-4 fill-current" />}
      </button>
      <div className="flex w-32 items-center space-x-3">
        {isPlaying ? (
          <div className="playing-wave flex h-4 items-end space-x-1">
            <span /><span /><span /><span />
          </div>
        ) : (
          <div className="h-[2px] w-full bg-[#E5E4E3]" />
        )}
      </div>
      <span className="w-10 text-xs font-medium text-[#52404B]">{duration}</span>
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
  const unlockedCount = rewards.filter(reward => reward.unlocked).length;

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="mb-2 font-heading text-3xl font-medium text-[#1F1C1B]">My Learning</h1>
      <p className="mb-12 border-b border-[#E5E4E3] pb-6 text-[#52404B]">Required compliance and clinical training.</p>

      <div className="mb-10 p-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-medium text-[#1F1C1B]">Badge Rewards</h2>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#52404B]">
            {unlockedCount}/{rewards.length} unlocked
          </div>
        </div>

        <p className="mb-4 text-sm text-[#52404B]">
          Completed trainings: <span className="font-semibold text-[#1F1C1B]">{completedCount}</span>.
          Cosmetic rewards unlock automatically as you complete modules.
        </p>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rewards.map(reward => (
            <div
              key={reward.id}
              className={`border p-4 transition-colors ${reward.unlocked ? 'border-[#008540] bg-[#E5F4EE]' : 'border-[#E5E4E3] bg-[#FAFBF8]'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${reward.unlocked ? 'text-[#008540]' : 'text-[#52404B]'}`}>
                  {reward.unlocked ? 'Unlocked' : 'Locked'}
                </span>
                <span className="font-mono text-[10px] text-[#52404B]">{reward.unlockAtCompletions} complete</span>
              </div>
              <h3 className="mb-1 font-heading text-base font-medium text-[#1F1C1B]">{reward.badgeLabel}</h3>
              <p className="mb-2 text-xs font-semibold text-[#007970]">{reward.cosmeticName}</p>
              <p className="text-xs text-[#52404B]">{reward.flavorText}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {db.topics.map(topic => (
          <div
            key={topic.topic_id}
            onClick={() => topic.status !== 'LOCKED' && navigate('module-overview', { topicId: topic.topic_id })}
            className={`-mx-6 flex cursor-pointer flex-col border-b border-[#E5E4E3] px-6 py-8 transition-colors ${topic.status === 'LOCKED' ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#FAFBF8]'}`}
          >
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="flex-1">
                <div className="mb-3 flex items-start justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${topic.status === 'LOCKED' ? 'text-[#52404B]' : 'text-[#007970]'}`}>{topic.status}</span>
                  <span className="font-mono text-xs font-medium text-[#52404B]">{topic.topic_id}</span>
                </div>
                <h3 className="mb-3 font-heading text-2xl font-medium text-[#1F1C1B] transition-colors">{topic.title}</h3>
                <p className="mb-5 max-w-3xl text-sm leading-relaxed text-[#52404B]">{topic.description}</p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {displayRoles(topic.required_roles).map(role => (
                    <span key={`${topic.topic_id}-${role}`} className="rounded border border-[#E5E4E3] bg-white px-2 py-1 text-[10px] font-semibold tracking-widest text-[#52404B]">
                      {role}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-6 text-xs font-medium uppercase tracking-wide text-[#52404B]">
                  <span className="flex items-center"><FileText className="mr-2 h-3.5 w-3.5" /> {db.lessons.filter(l => l.topic_id === topic.topic_id).length} Lesson(s)</span>
                  <span className="flex items-center"><CheckSquare className="mr-2 h-3.5 w-3.5" /> Final Test</span>
                </div>
              </div>
              {topic.image_url && (
                <div className={`hidden h-36 w-56 shrink-0 overflow-hidden rounded-2xl border border-[#E5E4E3] md:block ${topic.status === 'LOCKED' ? 'grayscale' : ''}`}>
                  <img src={topic.image_url} alt={topic.title} className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105" />
                </div>
              )}
            </div>
          </div>
        ))}
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
      <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[#52404B] transition-colors hover:text-[#1F1C1B]">
        <ChevronLeft className="mr-1 h-4 w-4" /> BACK TO DASHBOARD
      </button>

      {topic.image_url && (
        <div className="mb-10 h-80 w-full overflow-hidden rounded-2xl border border-[#E5E4E3] bg-[#FAFBF8]">
          <img src={topic.image_url} alt={topic.title} className="h-full w-full object-cover object-center" />
        </div>
      )}

      <div className="mb-12">
        <div className="mb-4 flex items-center space-x-3">
          <span className="rounded-sm bg-[#E5FEFF] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#007970]">MODULE OVERVIEW</span>
          <span className="font-mono text-xs font-medium text-[#52404B]">{topic.topic_id}</span>
        </div>
        <h1 className="mb-4 font-heading text-4xl font-medium text-[#1F1C1B]">{topic.title}</h1>
        <p className="mb-6 text-lg leading-relaxed text-[#52404B]">{topic.description}</p>

        <div className="inline-flex space-x-6 border border-[#E5E4E3] bg-[#FAFBF8] p-4 font-mono text-xs text-[#52404B]">
          <span>Policy: {topic.policy_ids.join(', ') || 'N/A'}</span>
          <span>Workflow: {topic.workflow_ids.join(', ') || 'N/A'}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {displayRoles(topic.required_roles).map(role => (
            <span key={`${topic.topic_id}-overview-${role}`} className="rounded border border-[#E5E4E3] bg-white px-2 py-1 text-[10px] font-semibold tracking-widest text-[#52404B]">
              {role}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-12 border-t border-[#E5E4E3] pt-10">
        <h2 className="mb-6 font-heading text-2xl font-medium text-[#1F1C1B]">Curriculum Outline</h2>

        <div className="space-y-4">
          {topicLessons.map((lesson, idx) => (
            <div key={lesson.lesson_id} className="flex items-center border border-[#E5E4E3] bg-[#FAFBF8] p-6 transition-colors hover:border-[#007970]">
              <div className="mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E4E3] bg-white font-heading font-medium text-[#007970]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-heading text-lg font-medium text-[#1F1C1B]">{lesson.title}</h3>
                <p className="flex items-center text-sm text-[#52404B]">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  Includes Summary, {lesson.cards.length - 2} Content Part(s), and Challenge
                </p>
              </div>
            </div>
          ))}

          <div className="flex items-center border border-[#E5E4E3] bg-white p-6 opacity-80">
            <div className="mr-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E4E3] bg-[#FAFBF8] text-[#C74601]">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-heading text-lg font-medium text-[#1F1C1B]">Final Evaluation</h3>
              <p className="text-sm text-[#52404B]">Multiple-choice knowledge check</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('lesson', { topicId: topic.topic_id, lessonIndex: 0, cardIndex: 0 })}
        className="flex w-full items-center justify-center bg-[#C74601] px-10 py-4 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#a63a01] md:w-auto"
      >
        START MODULE <ChevronRight className="ml-2 h-5 w-5" />
      </button>
    </div>
  );
}

function LearnerLesson({ db, params, navigate }: { db: DemoDB; params: RouteParams; navigate: NavigateFn }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [challengeResponse, setChallengeResponse] = useState('');

  const topicLessons = db.lessons.filter(l => l.topic_id === params.topicId).sort((a, b) => a.order - b.order);
  if (!topicLessons || topicLessons.length === 0) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[#52404B] transition-colors hover:text-[#1F1C1B]">
          <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
        </button>
        <div className="border border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
          <p className="text-[#52404B]">This topic does not have any lesson content loaded in the current demo database.</p>
        </div>
      </div>
    );
  }

  const lessonIndex = params.lessonIndex ?? 0;
  const cardIndex = params.cardIndex ?? 0;
  const lesson = topicLessons[lessonIndex];
  if (!lesson) return null;
  const card = lesson.cards[cardIndex];
  if (!card) return null;
  const progressPercent = Math.round(((cardIndex + 1) / lesson.cards.length) * 100);

  const handleNext = () => {
    setIsPlaying(false);
    if (cardIndex < lesson.cards.length - 1) {
      navigate('lesson', { ...params, cardIndex: cardIndex + 1 });
    } else if (lessonIndex < topicLessons.length - 1) {
      navigate('lesson', { ...params, lessonIndex: lessonIndex + 1, cardIndex: 0 });
      setChallengeResponse('');
    } else {
      navigate('test', { topicId: params.topicId });
    }
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl">
      <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[#52404B] transition-colors hover:text-[#1F1C1B]">
        <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
      </button>

      <div className="mb-4 h-1 w-full bg-[#E5E4E3]">
        <div className="h-full bg-[#007970] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="mb-16 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#52404B]">
        <span>{lesson.title}</span>
        <span>Part {cardIndex + 1} of {lesson.cards.length}</span>
      </div>

      <div className="mb-12">
        {card.image_url && (
          <div className="mb-10 w-full overflow-hidden rounded-2xl border border-[#E5E4E3] bg-[#FAFBF8]">
            <img src={card.image_url} alt={card.title} className="h-72 w-full object-cover object-center" />
          </div>
        )}

        <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-[#007970]">{card.type}</span>
        <h2 className="mb-4 font-heading text-4xl font-medium text-[#1F1C1B]">{card.title}</h2>

        <NativeAudioPlayer isPlaying={isPlaying} onPlayPause={() => setIsPlaying(!isPlaying)} duration={card.estimated_duration} />

        <div className="whitespace-pre-wrap text-lg leading-relaxed text-[#1F1C1B]">{card.content}</div>

        {card.type === 'challenge' && (
          <div className="mt-12 border-t border-dashed border-[#E5E4E3] pt-10">
            <label className="mb-4 block text-sm font-medium uppercase tracking-wider text-[#1F1C1B]">Your Response (Required)</label>
            <textarea
              rows={5}
              value={challengeResponse}
              onChange={(e) => setChallengeResponse(e.target.value)}
              className="w-full border border-[#E5E4E3] bg-[#FAFBF8] p-5 text-base outline-none transition-colors focus:border-[#C74601]"
              placeholder="Analyze the scenario and type your action steps here..."
            />
          </div>
        )}
      </div>

      <div className="mt-20 flex items-center justify-between border-t border-[#E5E4E3] pt-8">
        <button
          type="button"
          disabled={cardIndex === 0}
          onClick={() => navigate('lesson', { ...params, cardIndex: cardIndex - 1 })}
          className="text-sm font-medium text-[#52404B] hover:text-[#1F1C1B] disabled:cursor-not-allowed disabled:opacity-30"
        >
          PREVIOUS
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={card.type === 'challenge' && challengeResponse.trim().length < 10}
          className="flex items-center bg-[#C74601] px-8 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#a63a01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cardIndex === lesson.cards.length - 1 ? 'PROCEED TO TEST' : 'CONTINUE'} <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LearnerTest({ db, params, navigate }: { db: DemoDB; params: RouteParams; navigate: NavigateFn }) {
  const [testSelection, setTestSelection] = useState<number | null>(null);
  const test = db.tests.find(t => t.topic_id === params.topicId);

  if (!test) {
    return (
      <div className="animate-in fade-in duration-300 max-w-3xl">
        <button type="button" onClick={() => navigate('dashboard')} className="mb-8 flex items-center text-sm font-medium text-[#52404B] transition-colors hover:text-[#1F1C1B]">
          <ChevronLeft className="mr-1 h-4 w-4" /> EXIT
        </button>
        <div className="border border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
          <p className="text-[#52404B]">This topic does not have a test loaded in the current demo database.</p>
        </div>
      </div>
    );
  }

  const q = test.questions[0];

  const handleSubmit = () => {
    const passed = testSelection === q.correct_answer;
    navigate('complete', { topicId: params.topicId, passed, rationale: q.rationale });
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl">
      <div className="mb-16 border-b border-[#E5E4E3] pb-8">
        <h2 className="mb-2 font-heading text-3xl font-medium text-[#1F1C1B]">Final Knowledge Check</h2>
        <p className="text-[#52404B]">Select the most accurate response. Passing score: {test.passing_score}%</p>
      </div>

      <div className="mb-16">
        <p className="mb-8 font-heading text-xl font-medium leading-relaxed text-[#1F1C1B]">{q.prompt}</p>
        <div className="space-y-4">
          {q.choices.map((choice, idx) => (
            <label key={choice} className={`flex cursor-pointer items-start border p-6 transition-colors ${testSelection === idx ? 'border-[#007970] bg-[#E5FEFF]' : 'border-[#E5E4E3] hover:border-[#007970]'}`}>
              <input
                type="radio"
                name="test_q"
                value={idx}
                checked={testSelection === idx}
                onChange={() => setTestSelection(idx)}
                className="mt-1 h-4 w-4 text-[#007970]"
              />
              <span className="ml-4 text-lg text-[#1F1C1B]">{choice}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={testSelection === null}
        className="bg-[#007970] px-10 py-3.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#005a53] disabled:opacity-50"
      >
        SUBMIT ANSWERS
      </button>
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
      <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-full ${params.passed ? 'bg-[#E5F4EE] text-[#008540]' : 'bg-[#FBE6E6] text-[#D70101]'}`}>
        {params.passed ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
      </div>

      <h1 className="mb-4 font-heading text-4xl font-medium text-[#1F1C1B]">
        {params.passed ? 'Topic Completed' : 'Review Required'}
      </h1>

      <p className="mb-10 text-lg leading-relaxed text-[#52404B]">
        {params.passed
          ? 'You achieved a passing score. Your completion status has been recorded to your compliance file and the audit log has been updated.'
          : 'You did not meet the required passing score. Please review the rationale below and retake the assessment.'}
      </p>

      {!params.passed && (
        <div className="mb-12 border-l-4 border-[#D70101] py-2 pl-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1F1C1B]">Rationale</h3>
          <p className="text-base text-[#52404B]">{params.rationale}</p>
        </div>
      )}

      {params.passed && (
        <div className="mb-10 border border-[#E5E4E3] bg-[#FAFBF8] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-lg font-medium text-[#1F1C1B]">Badge Progress</h3>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#52404B]">
              {unlockedRewards.length}/{rewards.length} unlocked
            </span>
          </div>

          {nextReward ? (
            <p className="mb-4 text-sm text-[#52404B]">
              Next unlock: <span className="font-semibold text-[#1F1C1B]">{nextReward.badgeLabel}</span> at {nextReward.unlockAtCompletions} completed trainings.
            </p>
          ) : (
            <p className="mb-4 text-sm text-[#008540]">All configured cosmetic rewards are unlocked.</p>
          )}

          <div className="flex flex-wrap gap-2">
            {rewards.slice(0, 6).map(reward => (
              <span
                key={reward.id}
                className={`border px-3 py-1 text-[11px] font-semibold tracking-wide ${reward.unlocked ? 'border-[#008540] bg-[#E5F4EE] text-[#006b34]' : 'border-[#E5E4E3] bg-white text-[#52404B]'}`}
              >
                {reward.badgeLabel}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-6 border-t border-[#E5E4E3] pt-10">
        <button type="button" onClick={() => navigate('dashboard')} className="border border-[#E5E4E3] px-8 py-3 text-sm font-medium text-[#1F1C1B] transition-colors hover:bg-[#FAFBF8]">
          RETURN TO DASHBOARD
        </button>
        {!params.passed && (
          <button type="button" onClick={() => navigate('test', { topicId: params.topicId })} className="bg-[#C74601] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#a63a01]">
            RETAKE TEST
          </button>
        )}
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
      <div className="mb-12 flex items-end justify-between border-b border-[#E5E4E3] pb-6">
        <div>
          <h1 className="mb-2 font-heading text-3xl font-medium text-[#1F1C1B]">Training Engine Engine Admin</h1>
          <p className="text-[#52404B]">Manage curriculum structure and automated narration.</p>
        </div>
        <button type="button" className="flex items-center bg-[#007970] px-6 py-2.5 text-sm font-medium tracking-wide text-white transition-colors hover:bg-[#005a53]">
          <Plus className="mr-2 h-4 w-4" /> NEW TOPIC
        </button>
      </div>

      <div className="mb-12">
        <div className="mb-8 border border-[#E5E4E3] bg-[#FAFBF8] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading text-lg font-medium text-[#1F1C1B]">Required Training Coverage (Placeholders)</h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#52404B]">
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
                    ? 'border-[#007970] bg-[#E5FEFF] text-[#005a53]'
                    : 'border-[#E5E4E3] bg-white text-[#52404B] hover:border-[#007970]'
                }`}
              >
                {role === 'ALL' ? 'ALL ROLES' : role}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto border border-[#E5E4E3] bg-white">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="sticky top-0 bg-[#FAFBF8] text-[#52404B]">
                <tr>
                  <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Training ID</th>
                  <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Title</th>
                  <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Required Roles</th>
                </tr>
              </thead>
              <tbody>
                {roleFilteredTopics.map(topic => (
                  <tr key={topic.topic_id}>
                    <td className="border-b border-[#E5E4E3] px-3 py-2 font-mono text-[#1F1C1B]">{topic.topic_id}</td>
                    <td className="border-b border-[#E5E4E3] px-3 py-2 text-[#1F1C1B]">{topic.title}</td>
                    <td className="border-b border-[#E5E4E3] px-3 py-2 text-[#52404B]">
                      <div className="flex flex-wrap gap-1.5">
                        {displayRoles(topic.required_roles).map(role => (
                          <span key={`${topic.topic_id}-admin-${role}`} className="rounded border border-[#E5E4E3] bg-[#FAFBF8] px-2 py-0.5 text-[10px] font-semibold tracking-widest text-[#52404B]">
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#008540]">PUBLISHED</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#52404B]">ID: {topic.topic_id}</span>
            </div>
            <h2 className="mb-2 font-heading text-2xl font-medium text-[#1F1C1B]">{topic.title}</h2>
            <div className="mt-4 flex space-x-6 font-mono text-xs text-[#52404B]">
              <span className="border border-[#E5E4E3] bg-[#FAFBF8] px-2 py-1">Policy: {topic.policy_ids[0]}</span>
              <span className="border border-[#E5E4E3] bg-[#FAFBF8] px-2 py-1">Workflow: {topic.workflow_ids[0]}</span>
            </div>
          </div>
          <button type="button" className="border border-[#E5E4E3] p-2 text-[#52404B] transition-colors hover:text-[#C74601]">
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 border border-[#E5E4E3] bg-[#FAFBF8] p-6">
          <div className="mb-8 border border-[#E5E4E3] bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h4 className="font-heading text-base font-medium text-[#1F1C1B]">Mass Upload Conversion</h4>
                <p className="text-xs text-[#52404B]">Accepted CSV columns: A Project, B Title, C app.location, D Narration.</p>
              </div>
              <label className="flex cursor-pointer items-center border border-[#007970] bg-[#E5FEFF] px-4 py-2 text-xs font-semibold tracking-wide text-[#005a53] transition-colors hover:bg-[#d1f6f7]">
                <Upload className="mr-2 h-4 w-4" /> UPLOAD CSV
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvUpload} />
              </label>
            </div>

            <div className="rounded border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-4 font-mono text-[11px] text-[#52404B]">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#1F1C1B]">Template</p>
              <p>Project,Title,app.location,Narration</p>
              <p>GAO-013,Hand Hygiene Intro,/training-audio/GAO-013/les_1/c_1.wav,"Welcome to Lesson 1..."</p>
            </div>

            {uploadFileName && (
              <p className="mt-3 text-xs text-[#52404B]">Selected file: <span className="font-semibold text-[#1F1C1B]">{uploadFileName}</span></p>
            )}

            {uploadError && (
              <div className="mt-3 border-l-4 border-[#D70101] bg-[#FBE6E6] p-3 text-xs text-[#1F1C1B]">
                {uploadError}
              </div>
            )}

            {uploadRows.length > 0 && (
              <div className="mt-4 overflow-x-auto border border-[#E5E4E3]">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                  <thead className="bg-[#FAFBF8] text-[#52404B]">
                    <tr>
                      <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Project</th>
                      <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Title</th>
                      <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">app.location</th>
                      <th className="border-b border-[#E5E4E3] px-3 py-2 font-semibold">Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadRows.slice(0, 5).map((row, idx) => (
                      <tr key={`${row.project}-${row.title}-${String(idx)}`}>
                        <td className="border-b border-[#E5E4E3] px-3 py-2 text-[#1F1C1B]">{row.project}</td>
                        <td className="border-b border-[#E5E4E3] px-3 py-2 text-[#1F1C1B]">{row.title}</td>
                        <td className="max-w-[240px] truncate border-b border-[#E5E4E3] px-3 py-2 font-mono text-[#52404B]">{row.appLocation}</td>
                        <td className="max-w-[360px] truncate border-b border-[#E5E4E3] px-3 py-2 text-[#52404B]">{row.narration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uploadRows.length > 5 && (
                  <div className="bg-[#FAFBF8] px-3 py-2 text-[11px] text-[#52404B]">
                    Showing 5 of {uploadRows.length} rows.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-heading text-lg font-medium text-[#1F1C1B]">Narration Pipeline</h3>
            <button
              type="button"
              onClick={runQwenTTSPipeline}
              disabled={isGeneratingTTS}
              className="flex items-center border border-[#1F1C1B] bg-white px-5 py-2 text-sm font-medium tracking-wide text-[#1F1C1B] transition-colors hover:border-[#C74601] hover:text-[#C74601] disabled:opacity-50"
            >
              {isGeneratingTTS ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
              {isGeneratingTTS ? 'GENERATING QWENTTS...' : 'SYNC AUDIO (QWEN TTS)'}
            </button>
          </div>

          {logs.length > 0 && (
            <div className="h-40 space-y-2 overflow-y-auto bg-[#1F1C1B] p-4 font-mono text-xs text-[#E5FEFF]">
              {logs.map((log, i) => (
                <div key={String(i)} className="opacity-80">{'>'} {log}</div>
              ))}
              {isGeneratingTTS && <div className="animate-pulse">{'>'} _</div>}
            </div>
          )}
        </div>
      </div>

      <h3 className="mb-6 font-heading text-xl font-medium text-[#1F1C1B]">Topic Structure</h3>
      <div className="border-t border-[#E5E4E3]">
        {lessons[0].cards.map((card, idx) => {
          const isRequired = card.type === 'summary' || card.type === 'challenge';
          return (
            <div key={card.card_id} className="flex items-start justify-between border-b border-[#E5E4E3] py-8">
              <div className="w-3/4 pr-8">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#007970]">CARD {idx + 1} • {card.type}</span>
                  {isRequired ? (
                    <span className="rounded-sm border border-[#E5E4E3] bg-gray-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-400">Required (Cannot Delete)</span>
                  ) : (
                    <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-[#D70101] hover:underline">REMOVE CONTENT</button>
                  )}
                </div>
                <h4 className="mb-2 font-heading text-lg font-medium text-[#1F1C1B]">{card.title}</h4>
                <p className="mb-4 line-clamp-2 text-sm text-[#52404B]">{card.content}</p>

                <div className="border border-[#E5E4E3] border-l-2 border-l-[#C74601] bg-[#FAFBF8] p-4">
                  <p className="mb-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-[#52404B]"><FileCheck className="mr-1 h-3 w-3" /> Narration Script</p>
                  <p className="text-xs italic text-[#1F1C1B]">"{card.narration_script}"</p>
                </div>
              </div>

              <div className="flex w-1/4 flex-col items-end space-y-4 text-right">
                <div>
                  <div className="flex items-center justify-end text-xs font-medium tracking-wide text-[#008540]">
                    <Volume2 className="mr-2 h-4 w-4" /> AUDIO LINKED
                  </div>
                  <div className="mt-2 max-w-full truncate border border-[#E5E4E3] bg-[#FAFBF8] px-2 py-1 font-mono text-[10px] text-[#52404B]">
                    {card.audio_path}
                  </div>
                </div>

                {card.image_url && (
                  <div>
                    <div className="flex items-center justify-end text-xs font-medium tracking-wide text-[#007970]">
                      <ImageIcon className="mr-2 h-4 w-4" /> IMAGE ATTACHED
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="flex justify-center border-b border-[#E5E4E3] py-6">
          <button type="button" className="flex items-center border border-transparent bg-[#E5FEFF] px-6 py-2 text-sm font-medium text-[#007970] transition-colors hover:border-[#007970] hover:text-[#005a53]">
            <Plus className="mr-2 h-4 w-4" /> ADD CONTENT CARD
          </button>
        </div>

        <div className="flex items-start justify-between border-b border-[#E5E4E3] py-8">
          <div>
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#D70101]">FINAL EVALUATION</span>
            <h4 className="font-heading text-lg font-medium text-[#1F1C1B]">Final Knowledge Check</h4>
          </div>
          <div className="flex items-center text-xs font-medium tracking-wide text-[#52404B]">
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
      <div className="min-h-screen bg-white selection:bg-[#E5FEFF] selection:text-[#007970]">
        <main className="w-full p-8 pb-32 md:p-12 lg:p-16">
          {route.view === 'dashboard' && (
            <div className="mb-12 flex justify-end">
              <div className="flex rounded border border-[#E5E4E3] bg-[#FAFBF8] p-1 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => { setMode('learner'); navigate('dashboard'); }}
                  className={`rounded-sm px-4 py-1.5 transition-colors ${mode === 'learner' ? 'border border-[#E5E4E3] bg-white text-[#007970]' : 'text-[#52404B] hover:text-[#1F1C1B]'}`}
                >
                  Learner Mode
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('admin'); navigate('dashboard'); }}
                  className={`rounded-sm px-4 py-1.5 transition-colors ${mode === 'admin' ? 'border border-[#E5E4E3] bg-white text-[#C74601]' : 'text-[#52404B] hover:text-[#1F1C1B]'}`}
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
              </>
            )}

            {mode === 'admin' && route.view === 'dashboard' && <AdminDashboard db={initialDB} />}
          </div>
        </main>
      </div>
    </>
  );
}
