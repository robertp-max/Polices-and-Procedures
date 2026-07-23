import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileSearch,
  Files,
  Gavel,
  Landmark,
  LockKeyhole,
  Menu,
  NotebookPen,
  PanelLeftClose,
  RotateCcw,
  Scale,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  X,
  XCircle,
} from 'lucide-react';
import { challengeOrder } from './challengeOrder';
import { ActiveTimeCard, formatActiveTime, useActiveLearningClock } from './ActiveLearningClock';
import LearningChapter, { LEARNING_PANEL_IDS } from './LearningChapter';

// QA bypasses are available only to a Vite test build. A production build can
// never enable them through a public environment variable or browser state.
const QA_MODE = import.meta.env.MODE === 'test';

const MODULE = {
  id: 'GB-003',
  title: 'Meetings That Prove Governance',
  track: 'Governing Body Academy',
  pass: 92,
};

const CHAPTERS = [
  { id: 0, eyebrow: 'Brief', title: 'The record is the proof', icon: Landmark },
  { id: 1, eyebrow: 'Learn', title: 'Authority + control model', icon: Scale },
  { id: 2, eyebrow: 'Packet', title: 'Interrogate the evidence', icon: Files },
  { id: 3, eyebrow: 'Decide', title: 'Classify and direct', icon: Gavel },
  { id: 4, eyebrow: 'Record', title: 'Draft defensible minutes', icon: FileCheck2 },
  { id: 5, eyebrow: 'Defend', title: 'Face the surveyor', icon: ShieldAlert },
];

const MEETING_DOCTRINE = [
  { number: '01', title: 'Authority', body: 'The matter belongs to the Governing Body—or the record explains the retained oversight duty and the boundary of delegated execution.' },
  { number: '02', title: 'Participation', body: 'Notice, quorum, remote presence, and conflicts are resolved at the moment of action, not repaired by a later summary.' },
  { number: '03', title: 'Evidence', body: 'The packet contains the minimum reliable information needed to decide, including material contrary facts and known limitations.' },
  { number: '04', title: 'Decision', body: 'The motion, vote, directive, owner, deadline, escalation trigger, and return condition are precise enough to execute and audit.' },
  { number: '05', title: 'Effect', body: 'The Board returns to verify implementation and effectiveness; closure is demonstrated against a predeclared standard rather than assumed.' },
];

const MEETING_REMEDIATION = {
  duty: 'A valid Board action must be reconstructable from authority, participation, evidence, decision, and follow-through at the time the action occurred.',
  trap: 'A polished packet and concise draft minutes make administrative neatness look like proof that the underlying action was valid.',
  repair: 'Reconcile the agenda, bylaws, time-specific attendance, conflict trail, decision evidence, and draft record before approving or correcting the official minutes.',
  transferRule: 'A cure for one defect does not cure another: valid participation does not repair notice, and a clean vote does not prove an unsupported quality conclusion.',
};

type EvidenceItem = {
  id: string;
  code: string;
  title: string;
  kind: string;
  status: 'clean' | 'attention' | 'restricted';
  essential?: boolean;
  relevant?: boolean;
  summary: string;
  details: string[];
  source: string;
};

const EVIDENCE: EvidenceItem[] = [
  {
    id: 'agenda', code: 'A-01', title: 'Final meeting agenda', kind: 'Agenda', status: 'attention', essential: true, relevant: true,
    summary: 'The vendor transition appears under “informational items”; Q2 QAPI is listed for action.',
    details: [
      'Distributed to all members 72 hours before the meeting.',
      'Item 5: CareSignal vendor transition — informational briefing; no vote shown.',
      'Item 7: Q2 QAPI report — action requested: accept report and close hospitalization PIP.',
      'No amended agenda or unanimous-consent entry is attached.',
    ],
    source: 'Synthetic case record · GV-GB-002 validation required',
  },
  {
    id: 'roster', code: 'A-02', title: 'Controlled board roster', kind: 'Governance', status: 'clean', relevant: true,
    summary: 'Five voting seats are filled; three members establish general quorum under the supplied bylaws.',
    details: [
      'Voting members: I. Chen (Chair), R. Patel, J. Vega, T. Mason, A. Lewis.',
      'All appointment terms are current on the meeting date.',
      'The Secretary is non-voting.',
      'The opening attendance record lists Chen, Patel, Vega, and Mason.',
    ],
    source: 'Synthetic case record · ACHC HH1-2A / HH1-2A.03 context',
  },
  {
    id: 'bylaws', code: 'A-03', title: 'Bylaws decision rules', kind: 'Authority', status: 'restricted', essential: true, relevant: true,
    summary: 'Quorum, remote presence, conflicts, and adding an action item are governed by four different clauses.',
    details: [
      'Quorum: a majority of seated voting members. A properly recused member still counts toward general meeting quorum.',
      'Remote attendance counts only while two-way, real-time audio is continuously available.',
      'A conflicted member may not receive nonpublic vendor materials, deliberate, or vote on the affected item and must leave the session for that item.',
      'A matter not noticed as an action item may be acted upon only with unanimous consent of every member then present, documented before deliberation.',
    ],
    source: 'Synthetic bylaw excerpt for training · not a statement of universal law',
  },
  {
    id: 'attendance', code: 'A-04', title: 'Platform attendance log', kind: 'System log', status: 'attention', essential: true, relevant: true,
    summary: 'The remote member’s connection state changes during the vendor discussion and vote.',
    details: [
      'T. Mason joined with audio at 13:58.',
      'Audio connection lost at 14:32; video-only connection remained.',
      'Vendor motion made at 14:38 and announced passed at 14:42.',
      'Two-way audio restored at 14:49. QAPI vote occurred at 15:18.',
    ],
    source: 'Synthetic system evidence · compare with minutes',
  },
  {
    id: 'conflict', code: 'A-05', title: 'Conflict disclosure trail', kind: 'Restricted', status: 'restricted', essential: true, relevant: true,
    summary: 'A family relationship was mentioned during the meeting; the signed disclosure was filed the next day.',
    details: [
      'J. Vega is the sibling of CareSignal’s chief financial officer.',
      'At 14:37 Vega wrote in meeting chat: “I know the team well. I’ll abstain if needed.”',
      'The transcript shows Vega answered two questions about the vendor before abstaining.',
      'The annual disclosure on file before the meeting lists no vendor relationship. An event-specific disclosure is dated the following day.',
    ],
    source: 'Synthetic case record · ACHC HH1-4A.01 · GV-GB-003',
  },
  {
    id: 'vendor', code: 'A-06', title: 'Vendor decision memorandum', kind: 'Executive memo', status: 'attention', relevant: true,
    summary: 'The contract is below a dollar threshold, but the arrangement touches care coordination, PHI, and referrals.',
    details: [
      'Annual value: $24,600; recommended start date: August 1.',
      'Vendor would receive a daily census feed containing PHI.',
      'The vendor also operates a preferred specialist directory used by intake staff.',
      'The memo calls the decision “operational” because it is below $25,000; no BAA or referral-risk review is attached.',
    ],
    source: 'Synthetic case record · contract and referral policies require validation',
  },
  {
    id: 'qapi', code: 'A-07', title: 'Q2 QAPI executive report', kind: 'Quality report', status: 'attention', essential: true, relevant: true,
    summary: 'The aggregate hospitalization rate improved, while a high-risk subgroup worsened beyond the approved threshold.',
    details: [
      'Agency-wide hospitalization: 11.8% → 9.9%.',
      'Heart-failure high-risk subgroup: 14.1% → 18.4%.',
      'The report recommends closing the hospitalization PIP after two favorable aggregate months.',
      'The report says “no material complaints,” but the complaint appendix is absent.',
    ],
    source: 'Synthetic case record · 42 CFR 484.65(b)-(e) · ACHC HH6-1C / HH6-5A',
  },
  {
    id: 'threshold', code: 'A-08', title: 'Approved PIP charter', kind: 'Prior decision', status: 'clean', essential: true, relevant: true,
    summary: 'Closure requires three sustained months and no high-risk subgroup above 15%.',
    details: [
      'Primary target: agency-wide hospitalization below 11% for three consecutive months.',
      'Equity/safety guardrail: no defined high-risk subgroup may exceed 15%.',
      'Closure requires documented effectiveness review and Governing Body acceptance.',
      'If a guardrail fails, the PIP remains open and the QAPI Committee must return a segmented analysis and revised intervention plan.',
    ],
    source: 'Synthetic approved charter · 42 CFR 484.65(e)(2)',
  },
  {
    id: 'complaints', code: 'A-09', title: 'Restricted complaint extract', kind: 'Quality input', status: 'restricted', essential: true, relevant: true,
    summary: 'Two heart-failure hospitalizations are linked to delayed escalation concerns and were omitted from the board packet.',
    details: [
      'Complaint 26-041: caregiver reports three calls before medication concern was escalated.',
      'Complaint 26-047: same-day weight-gain alert was documented after the emergency department transfer.',
      'Both cases are in the high-risk subgroup used in the QAPI report.',
      'Investigation status: open. Neither appears in the QAPI narrative or attached action tracker.',
    ],
    source: 'Synthetic de-identified evidence · ACHC HH2-4A / HH6-4A.06',
  },
  {
    id: 'minutes', code: 'A-10', title: 'Draft meeting minutes', kind: 'Official record', status: 'attention', essential: true, relevant: true,
    summary: 'The draft describes unanimous actions, uninterrupted attendance, and timely conflict disclosure.',
    details: [
      '“All four attending members remained present throughout.”',
      '“After full disclosure and recusal by Member Vega, the Board unanimously approved CareSignal.”',
      '“The Board accepted Q2 QAPI results and approved successful PIP closure.”',
      'No questions, dissent, connection loss, missing appendices, owners, deadlines, or return-report requirements are recorded.',
    ],
    source: 'Synthetic draft · ACHC HH1-2A · CMS Appendix B evidence principle',
  },
  {
    id: 'email', code: 'A-11', title: 'Post-meeting email', kind: 'Correspondence', status: 'attention', relevant: false,
    summary: 'An executive asks the Secretary to keep the minutes concise and avoid “unnecessary technical details.”',
    details: [
      'Sent after the draft minutes were circulated.',
      'The sender was not present for the entire vendor discussion.',
      'No source artifact, correction request, or proposed replacement language is attached.',
      'The Secretary replies that the draft will remain unchanged pending Chair review.',
    ],
    source: 'Synthetic correspondence record',
  },
];

const DEFECTS = [
  { id: 'agenda', label: 'The vendor vote was not noticed as an action item and no unanimous-consent step was documented.', type: 'authority', correct: true },
  { id: 'remote', label: 'The remote member did not qualify as present during the vendor action because two-way audio was unavailable.', type: 'authority', correct: true },
  { id: 'conflict', label: 'Abstention did not cure the conflict because the member received information and participated in deliberation.', type: 'authority', correct: true },
  { id: 'qapi', label: 'PIP closure evidence failed both the duration target and the high-risk subgroup guardrail.', type: 'risk', correct: true },
  { id: 'complaints', label: 'The Board packet omitted material complaint evidence connected to the deteriorating subgroup.', type: 'risk', correct: true },
  { id: 'minutes', label: 'The proposed official record states events and decisions that the underlying evidence does not support.', type: 'risk', correct: true },
  { id: 'opening', label: 'The later remote-participation failure invalidated the opening quorum and every earlier action.', type: 'authority', correct: false },
  { id: 'price', label: 'Because the vendor amount was below $25,000, the informational agenda label supplied adequate notice for a same-session vote.', type: 'authority', correct: false },
  { id: 'allvoid', label: 'Because the vendor action and PIP closure share one minutes record, either defect requires repeating every meeting action.', type: 'risk', correct: false },
];

const DECISIONS = [
  {
    id: 'accept', title: 'Accept with post-meeting corrections', risk: 'Critical',
    text: 'Approve the minutes and both decisions, then require the Secretary, Compliance Officer, and QAPI Coordinator to cure the participation and subgroup documentation before the next meeting.',
  },
  {
    id: 'amend', title: 'Amend the record, preserve both decisions', risk: 'Critical',
    text: 'Correct the attendance and conflict narrative, obtain the missing complaint appendix, and leave the vendor approval and PIP closure effective because the recorded vote margins do not change.',
  },
  {
    id: 'targeted', title: 'Separate, cure, and return', risk: 'Defensible',
    text: 'Reject the inaccurate draft; treat the vendor action as not validly completed; defer PIP closure; direct specified evidence repair; and reconvene the vendor matter with proper notice and conflict controls.',
  },
  {
    id: 'voidall', title: 'Repeat every meeting action', risk: 'Overbroad',
    text: 'Treat the unreliable minutes as contaminating the full session, suspend all actions taken that day, and reconvene every item under corrected participation, notice, and conflict controls.',
  },
];

const MINUTE_CLAUSES = [
  { id: 'presence', correct: true, text: 'Record Mason as remotely present until 14:32, absent for participation purposes during the vendor item, and present again at 14:49.' },
  { id: 'coi', correct: true, text: 'Record Vega’s relationship, timing of disclosure, participation before recusal, abstention, and direction to preserve the event-specific disclosure.' },
  { id: 'vendor', correct: true, text: 'Record that no valid vendor action was completed and the matter will return on a properly noticed agenda with required reviews.' },
  { id: 'qapi', correct: true, text: 'Record that PIP closure was not approved because the subgroup guardrail and sustainment period were unmet.' },
  { id: 'directive', correct: true, text: 'Direct the QAPI Coordinator to return within 21 days with segmented analysis, the complaint linkage, revised interventions, and an effectiveness-monitoring plan.' },
  { id: 'unanimous', correct: false, text: 'State that the vendor action passed unanimously because the conflicted member abstained and the remote member appeared on video.' },
  { id: 'attachment', correct: false, text: 'State only that “the QAPI packet is incorporated by reference,” without recording the Board’s questions, decision, owner, or deadline.' },
  { id: 'sanitize', correct: false, text: 'Omit the connection failure and late conflict disclosure to protect the confidentiality of executive deliberations.' },
];

const DEFENSE = [
  {
    id: 'd1', stem: '“Show me how the Governing Body knew the hospitalization improvement was effective.”',
    answers: [
      'The Board compared the aggregate result with the external benchmark, confirmed two favorable months, and retained quarterly subgroup surveillance after closure.',
      'The Board compared aggregate and subgroup results to the preapproved closure criteria, identified the failed guardrail, declined closure, and required a return report with defined measures.',
      'The QAPI Committee accepted the report, the Coordinator certified the source data, and the Board found the remaining subgroup variance immaterial to the agency-wide objective.',
    ], correct: 1,
  },
  {
    id: 'd2', stem: '“Why was the vendor approval not treated as final?”',
    answers: [
      'The low dollar value did not eliminate Board review, but the missing privacy and referral analyses were the only reasons the action remained provisional.',
      'The vote remained procedurally sufficient, but management identified new implementation risks that justified reopening the business decision before contract execution.',
      'The action record could not prove compliance with the supplied notice, remote-presence, and conflict controls, so the matter was returned for a clean, properly documented action.',
    ], correct: 2,
  },
  {
    id: 'd3', stem: '“How did you correct the inaccurate minutes without rewriting history?”',
    answers: [
      'The Board preserved the original draft, reconciled it to independent evidence, approved a corrected record that states what actually occurred, and documented the resulting remedial actions.',
      'The Secretary retained the original draft in working files, replaced it with a corrected final version, and documented that the changes were administrative rather than substantive.',
      'The Board incorporated the source packet and system logs by reference, approved an addendum identifying the corrections, and kept the original vote descriptions unchanged.',
    ], correct: 0,
  },
];

type Progress = {
  chapter: number;
  learningPanels: string[];
  inspected: string[];
  selectedEvidence: string[];
  selectedDefects: string[];
  decision: string;
  clauses: string[];
  defense: Record<string, number>;
  submitted: boolean;
  transfer: number | null;
};

const EMPTY: Progress = {
  chapter: 0,
  learningPanels: [],
  inspected: [],
  selectedEvidence: [],
  selectedDefects: [],
  decision: '',
  clauses: [],
  defense: {},
  submitted: false,
  transfer: null,
};

const STORAGE_KEY = 'care-indeed:gb-003:academy:v3';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function App({ onExit }: { onExit?: () => void }) {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [gateNotice, setGateNotice] = useState('');
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const clock = useActiveLearningClock({ storageKey: `${STORAGE_KEY}:active-time`, chapter: progress.chapter });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });
        setNotes(localStorage.getItem(`${STORAGE_KEY}:notes`) || '');
      } catch { /* Keep a clean local attempt if storage is unavailable. */ }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(`${STORAGE_KEY}:notes`, notes);
  }, [hydrated, notes]);

  useEffect(() => {
    if (!activeEvidence && !notesOpen && !railOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const container = document.querySelector<HTMLElement>(activeEvidence || notesOpen ? '.modal-layer [role="dialog"]' : '.chapter-rail.is-open');
        const focusable = container ? Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) : [];
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        return;
      }
      if (event.key !== 'Escape') return;
      if (activeEvidence) setActiveEvidence(null);
      else if (notesOpen) setNotesOpen(false);
      else setRailOpen(false);
      window.setTimeout(() => returnFocusRef.current?.focus(), 0);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeEvidence, notesOpen, railOpen]);

  const scores = useMemo(() => {
    const essential = EVIDENCE.filter((item) => item.essential).map((item) => item.id);
    const essentialHit = essential.filter((id) => progress.selectedEvidence.includes(id)).length;
    const irrelevantSelected = progress.selectedEvidence.filter((id) => EVIDENCE.find((item) => item.id === id)?.relevant === false).length;
    const evidence = Math.max(0, Math.round((essentialHit / essential.length) * 20) - irrelevantSelected * 2);

    const authorityItems = DEFECTS.filter((item) => item.type === 'authority');
    const riskItems = DEFECTS.filter((item) => item.type === 'risk');
    const scoreGroup = (items: typeof DEFECTS, max: number) => {
      const correctHits = items.filter((item) => item.correct && progress.selectedDefects.includes(item.id)).length;
      const wrongHits = items.filter((item) => !item.correct && progress.selectedDefects.includes(item.id)).length;
      const correctTotal = items.filter((item) => item.correct).length;
      return Math.max(0, Math.round((correctHits / correctTotal) * max) - wrongHits * 4);
    };

    const authority = scoreGroup(authorityItems, 20);
    const risk = scoreGroup(riskItems, 15);
    const decision = progress.decision === 'targeted' ? 20 : progress.decision === 'voidall' ? 8 : 0;
    const correctClauses = MINUTE_CLAUSES.filter((item) => item.correct && progress.clauses.includes(item.id)).length;
    const wrongClauses = MINUTE_CLAUSES.filter((item) => !item.correct && progress.clauses.includes(item.id)).length;
    const documentation = Math.max(0, Math.round((correctClauses / 5) * 15) - wrongClauses * 5);
    const correctDefense = DEFENSE.filter((item) => progress.defense[item.id] === item.correct).length;
    const defense = Math.round((correctDefense / DEFENSE.length) * 10);
    const total = evidence + authority + risk + decision + documentation + defense;
    const criticalErrors: string[] = [];
    const diagnostics: Diagnostic[] = [];
    EVIDENCE
      .filter((item) => item.essential && !progress.selectedEvidence.includes(item.id))
      .forEach((item) => {
        criticalErrors.push(`Omitted indispensable evidence: ${item.title}.`);
        diagnostics.push({ stage: 'Evidence', issue: `The decision chain omitted “${item.title}.”`, repair: 'Reopen the artifact and identify the time-specific fact it supplies before reconstructing the affected action.' });
      });
    EVIDENCE
      .filter((item) => item.relevant === false && progress.selectedEvidence.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Evidence precision', issue: `“${item.title}” was elevated from context to decision evidence.`, repair: 'State the exact inference this correspondence can support. Remove it if the core authority or QAPI conclusion does not depend on it.' }));
    DEFECTS
      .filter((item) => item.correct && !progress.selectedDefects.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: item.type === 'authority' ? 'Authority' : 'Risk', issue: `A supported finding was missed: ${item.label}`, repair: 'Trace the conclusion to the agenda, bylaws, time-specific participation, conflict trail, QAPI criteria, complaints, or draft record that establishes it.' }));
    DEFECTS
      .filter((item) => !item.correct && progress.selectedDefects.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Classification precision', issue: `A plausible but unsupported conclusion was selected: ${item.label}`, repair: 'Identify which fact the statement overextends, then limit the finding to the affected item, time, or decision.' }));
    if (progress.decision === 'accept' || progress.decision === 'amend') criticalErrors.push('Preserved an action that the evidence could not establish as valid.');
    if (progress.clauses.includes('unanimous') || progress.clauses.includes('sanitize')) criticalErrors.push('Selected language that would make the official record materially inaccurate.');
    if (progress.decision === 'accept') criticalErrors.push('Closed a patient-safety PIP without meeting the approved effectiveness criteria.');
    if (progress.decision !== 'targeted') {
      const selected = DECISIONS.find((item) => item.id === progress.decision);
      diagnostics.push({ stage: 'Disposition', issue: `The selected direction—“${selected?.title || 'unresolved'}”—did not cure each established failure without overreaching.`, repair: 'Separate the vendor action, QAPI closure, and inaccurate record; preserve only actions the supplied evidence can support and assign each repair prospectively.' });
    }
    MINUTE_CLAUSES
      .filter((item) => item.correct && !progress.clauses.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Official record', issue: `The corrected record omitted: ${item.text}`, repair: 'Add the missing fact, action, owner, or return condition without changing what historically occurred.' }));
    MINUTE_CLAUSES
      .filter((item) => !item.correct && progress.clauses.includes(item.id))
      .forEach((item) => diagnostics.push({ stage: 'Record integrity', issue: `The proposed minutes included: ${item.text}`, repair: 'Remove the unsupported or sanitizing language and replace it with a precise account tied to the source record.' }));
    DEFENSE
      .filter((item) => progress.defense[item.id] !== item.correct)
      .forEach((item) => diagnostics.push({ stage: 'Surveyor defense', issue: `The response did not survive: ${item.stem}`, repair: 'Answer from the controlling rule and the cross-source evidence chain; explicitly name any limitation rather than filling it with confidence.' }));
    return { evidence, authority, risk, decision, documentation, defense, total, criticalErrors, diagnostics };
  }, [progress]);

  const scoreEligible = progress.submitted && clock.minimumMet && scores.total >= MODULE.pass && scores.criticalErrors.length === 0;
  const passed = scoreEligible && progress.transfer === 1;

  const update = (next: Partial<Progress>) => setProgress((current) => ({ ...current, ...next }));
  const taskBlocker = (stage: number) => {
    if (stage === 1 && !LEARNING_PANEL_IDS.every((id) => progress.learningPanels.includes(id))) return `review all ${LEARNING_PANEL_IDS.length} guided learning sections`;
    if (stage === 2 && progress.inspected.length !== EVIDENCE.length) return `inspect all ${EVIDENCE.length} evidence artifacts`;
    if (stage === 2 && progress.selectedEvidence.length === 0) return 'select the minimum sufficient evidence set';
    if (stage === 3 && progress.selectedDefects.length === 0) return 'classify at least one supported defect';
    if (stage === 3 && !progress.decision) return 'choose one governing disposition';
    if (stage === 4 && progress.clauses.length !== 5) return 'select exactly five clauses for the official record';
    if (stage === 5 && Object.keys(progress.defense).length !== DEFENSE.length) return `answer all ${DEFENSE.length} surveyor defenses`;
    return '';
  };
  // Required interactions unlock navigation. Active time is enforced only at
  // final completion so learners are never stranded after finishing a stage.
  const stageBlocker = (stage: number) => QA_MODE ? '' : taskBlocker(stage);
  const chapterAccessible = (chapter: number) => QA_MODE
    || chapter <= progress.chapter
    || (chapter === progress.chapter + 1 && !taskBlocker(progress.chapter));
  const showGate = (message: string) => {
    setGateNotice(message);
    setRailOpen(false);
  };
  const go = (chapter: number) => {
    if (!chapterAccessible(chapter)) {
      const blocker = taskBlocker(progress.chapter);
      showGate(blocker ? `Complete the current chapter first: ${blocker}.` : 'Complete the current chapter before continuing.');
      return;
    }
    update({ chapter });
    setGateNotice('');
    setRailOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.setTimeout(() => mainRef.current?.focus(), 0);
  };
  const rememberFocus = () => { returnFocusRef.current = document.activeElement as HTMLElement | null; };
  const openRail = () => { rememberFocus(); setRailOpen(true); };
  const closeRail = () => { setRailOpen(false); window.setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const openNotes = () => { rememberFocus(); setNotesOpen(true); };
  const closeNotes = () => { setNotesOpen(false); window.setTimeout(() => returnFocusRef.current?.focus(), 0); };
  const toggle = (key: 'selectedEvidence' | 'selectedDefects' | 'clauses', id: string) => {
    setProgress((current) => {
      if (!QA_MODE && current.submitted) return current;
      const list = current[key] as string[];
      return { ...current, [key]: list.includes(id) ? list.filter((item) => item !== id) : [...list, id] };
    });
  };
  const inspect = (item: EvidenceItem) => {
    rememberFocus();
    setActiveEvidence(item);
    if (!progress.inspected.includes(item.id)) update({ inspected: [...progress.inspected, item.id] });
  };
  const reset = () => {
    if (!window.confirm('Reset this training attempt and remove saved progress?')) return;
    setProgress(EMPTY);
    setNotes('');
    setGateNotice('');
    clock.reset();
  };
  const submitAttempt = () => {
    if (QA_MODE) { update({ submitted: true }); return; }
    const blocker = stageBlocker(5);
    if (blocker) { showGate(`Defense is not ready to lock: ${blocker}.`); return; }
    if (!clock.minimumMet) { showGate(`${formatActiveTime(clock.totalRemaining)} of required active mastery time remains.`); return; }
    update({ submitted: true });
  };

  return (
    <div className="app-shell" data-role-theme="gb">
      <header className="command-bar">
        <div className="brand-lockup">
          <button className="icon-button mobile-only" onClick={openRail} aria-label="Open chapter navigation"><Menu size={19} /></button>
          {onExit && <button className="icon-button academy-back" onClick={onExit} aria-label="Return to academy"><ArrowLeft size={17} /></button>}
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <div className="brand-name">CARE INDEED</div>
            <div className="brand-product">Governing Body Academy</div>
          </div>
        </div>
        <div className="module-lockup">
          <span>{MODULE.id}</span>
          <strong>{MODULE.title}</strong>
        </div>
        <div className="command-actions">
          <div className="save-state"><CheckCircle2 size={15} /> Required Governing Body compliance · official evidence on pass</div>
          <button className="quiet-button" onClick={openNotes}><NotebookPen size={16} /> Notebook</button>
          <button className="icon-button mobile-notebook" onClick={openNotes} aria-label="Open board notebook"><NotebookPen size={17} /></button>
          <button className="icon-button" onClick={reset} aria-label="Reset attempt"><RotateCcw size={17} /></button>
        </div>
      </header>

      <div className="workspace">
        <aside className={cx('chapter-rail', railOpen && 'is-open')} aria-label="Module chapters">
          <div className="rail-mobile-head">
            <span>Module chapters</span>
            <button className="icon-button" onClick={closeRail} aria-label="Close navigation" autoFocus={railOpen}><PanelLeftClose size={18} /></button>
          </div>
          <div className="rail-progress">
            <span>EXECUTIVE LAB</span>
            <strong>{progress.chapter + 1}<small>/ {CHAPTERS.length}</small></strong>
            <div className="progress-track" role="progressbar" aria-label="Module progress" aria-valuemin={1} aria-valuemax={CHAPTERS.length} aria-valuenow={progress.chapter + 1}><i style={{ width: `${((progress.chapter + 1) / CHAPTERS.length) * 100}%` }} /></div>
          </div>
          <nav>
            {CHAPTERS.map((chapter) => {
              const Icon = chapter.icon;
              const active = progress.chapter === chapter.id;
              const complete = clock.stageComplete(chapter.id) && !taskBlocker(chapter.id);
              const accessible = chapterAccessible(chapter.id);
              return (
                <button key={chapter.id} className={cx('rail-link', active && 'active', !accessible && 'locked')} onClick={() => go(chapter.id)} aria-current={active ? 'step' : undefined} aria-label={`${chapter.eyebrow}: ${chapter.title}${accessible ? '' : ' · locked'}`}>
                  <span className="rail-icon">{complete ? <Check size={15} /> : !accessible ? <LockKeyhole size={14} /> : <Icon size={16} />}</span>
                  <span><small>{chapter.eyebrow}</small>{chapter.title}</span>
                  {active && <ChevronRight size={15} />}
                </button>
              );
            })}
          </nav>
          <ActiveTimeCard clock={clock} chapter={progress.chapter} />
          <div className="rail-source-lock">
            <LockKeyhole size={17} />
            <div><strong>Source locked</strong><span>Federal + ACHC + controlled policy</span></div>
          </div>
        </aside>
        {railOpen && <button className="scrim" onClick={closeRail} aria-label="Close navigation" />}

        <main className="main-canvas" ref={mainRef} tabIndex={-1} aria-live="polite">
          {progress.chapter === 0 && <Brief onBegin={() => go(1)} />}
          {progress.chapter === 1 && <Authority visited={progress.learningPanels} onVisit={(id) => setProgress((current) => current.learningPanels.includes(id) ? current : { ...current, learningPanels: [...current.learningPanels, id] })} onContinue={() => go(2)} />}
          {progress.chapter === 2 && (
            <Packet
              inspected={progress.inspected}
              selected={progress.selectedEvidence}
              locked={!QA_MODE && progress.submitted}
              onInspect={inspect}
              onToggle={(id) => toggle('selectedEvidence', id)}
              onContinue={() => go(3)}
            />
          )}
          {progress.chapter === 3 && (
            <Decide
              selected={progress.selectedDefects}
              decision={progress.decision}
              locked={!QA_MODE && progress.submitted}
              onToggle={(id) => toggle('selectedDefects', id)}
              onDecision={(decision) => { if (QA_MODE || !progress.submitted) update({ decision }); }}
              onContinue={() => go(4)}
            />
          )}
          {progress.chapter === 4 && (
            <Record
              selected={progress.clauses}
              locked={!QA_MODE && progress.submitted}
              onToggle={(id) => toggle('clauses', id)}
              onContinue={() => go(5)}
            />
          )}
          {progress.chapter === 5 && (
            <Defend
              defense={progress.defense}
              submitted={progress.submitted}
              scores={scores}
              scoreEligible={scoreEligible}
              passed={passed}
              transfer={progress.transfer}
              onAnswer={(id, value) => { if (QA_MODE || !progress.submitted) update({ defense: { ...progress.defense, [id]: value } }); }}
              onSubmit={submitAttempt}
              onTransfer={(value) => setProgress((current) => QA_MODE || current.transfer === null ? { ...current, transfer: value } : current)}
              onReturn={() => go(2)}
              onReset={reset}
            />
          )}
        </main>
      </div>

      {gateNotice && <section className="mastery-gate-notice" role="status"><LockKeyhole size={18} /><div><strong>Mastery gate</strong><p>{gateNotice}</p><small>Time counts only while this tab is visible, focused, and active.</small></div><button onClick={() => setGateNotice('')} aria-label="Dismiss mastery gate"><X size={16} /></button></section>}

      {activeEvidence && (
        <EvidenceDrawer item={activeEvidence} selected={progress.selectedEvidence.includes(activeEvidence.id)} locked={!QA_MODE && progress.submitted} onClose={() => { setActiveEvidence(null); window.setTimeout(() => returnFocusRef.current?.focus(), 0); }} onToggle={() => toggle('selectedEvidence', activeEvidence.id)} />
      )}
      {notesOpen && (
        <div className="modal-layer" role="presentation">
          <button className="modal-scrim" onClick={closeNotes} aria-label="Close notebook" />
          <section className="notebook" role="dialog" aria-modal="true" aria-labelledby="notebook-title">
            <div className="drawer-head"><div><span>PRIVATE WORKSPACE</span><h2 id="notebook-title">Board notebook</h2></div><button className="icon-button" onClick={closeNotes} aria-label="Close notebook"><X size={19} /></button></div>
            <p>Your notes stay in this browser prototype and are not part of the official record.</p>
            <textarea aria-label="Private board notebook notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Capture unresolved questions, evidence gaps, and the rationale you need to defend..." autoFocus />
            <div className="notebook-foot"><span>{notes.length} characters</span><button className="primary-button" onClick={closeNotes}>Save notebook</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

function Brief({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="page page-brief">
      <div className="page-kicker"><Sparkles size={15} /> Executive decision laboratory</div>
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="chapter-code">GB—003 / MEETING EVIDENCE</span>
          <h1>Minutes do not summarize governance.<br /><em>They prove it.</em></h1>
          <p className="hero-lede">A polished board packet can still conceal an invalid action, a contaminated deliberation, or a quality decision made on incomplete evidence. Your job is to find the break before it becomes the official record.</p>
          <div className="hero-actions"><button className="primary-button large" onClick={onBegin}>Enter the briefing <ArrowRight size={18} /></button><span>35–50 min · 20 min active minimum · autosaves</span></div>
        </div>
        <div className="briefing-cover" aria-label="Confidential board packet preview">
          <div className="cover-top"><div className="cover-seal"><Landmark size={24} /></div><span>CONFIDENTIAL</span></div>
          <div className="cover-main"><small>GOVERNING BODY</small><strong>Quarterly<br />Decision Record</strong><p>July 16, 2026 · Executive session</p></div>
          <div className="cover-bottom"><span>11 artifacts</span><span>2 decisions</span><span>1 official record</span></div>
        </div>
      </section>
      <section className="brief-stats">
        <article><Target size={20} /><div><strong>92%</strong><span>Pass threshold</span></div><p>No critical error may survive.</p></article>
        <article><FileSearch size={20} /><div><strong>11</strong><span>Evidence artifacts</span></div><p>Some matter. Some distract.</p></article>
        <article><ShieldAlert size={20} /><div><strong>3</strong><span>Surveyor defenses</span></div><p>Every answer needs an evidence chain.</p></article>
      </section>
      <section className="source-banner"><div><LockKeyhole size={18} /><strong>Training source posture</strong></div><p>Federal anchors are verified. ACHC identifiers follow the 2026 annual checklist. Agency-policy questions remain provisional where the source registry is unresolved. Synthetic bylaws are clearly labeled inside the case.</p></section>
    </div>
  );
}

function Authority({ visited, onVisit, onContinue }: { visited: string[]; onVisit: (id: string) => void; onContinue: () => void }) {
  return <LearningChapter moduleId="GB-003" domain="Meeting evidence" title="Meetings That Prove Governance" caseContext="A polished board packet can conceal invalid action, contaminated deliberation, or a quality decision made on incomplete evidence. Learn how to reconstruct authority and truth before the minutes become the official record." decisiveDuty="The Governing Body must be able to prove that each action was authorized, informed, uncontaminated, accurately recorded, assigned, and returned for effectiveness verification." doctrine={MEETING_DOCTRINE} remediation={MEETING_REMEDIATION} sources={['42 CFR 484.105(a)', '42 CFR 484.65(e)', 'CMS SOM Appendix B', 'ACHC HH1-2A', 'ACHC HH1-4A.01']} visited={visited} onVisit={onVisit} onContinue={onContinue} />;
}

function Packet({ inspected, selected, locked, onInspect, onToggle, onContinue }: { inspected: string[]; selected: string[]; locked: boolean; onInspect: (item: EvidenceItem) => void; onToggle: (id: string) => void; onContinue: () => void }) {
  const orderedEvidence = challengeOrder(EVIDENCE, `${MODULE.id}:evidence`, (item) => item.id);
  return (
    <div className="page">
      <PageHead eyebrow="INTERROGATE / 02" title="The clean packet" lede="A vendor approval and a QAPI closure appear routine. Build the minimum sufficient evidence set before you classify either action." />
      <section className="case-banner">
        <div><span>CASE 07.16.26</span><h2>Quarterly Governing Body Meeting</h2><p>Two actions · conflicting records · one draft awaiting approval</p></div>
        <div className="case-meter"><strong>{inspected.length}<small>/ {EVIDENCE.length}</small></strong><span>inspected</span></div>
      </section>
      <div className="evidence-toolbar">
        <div><Search size={17} /><span>Inspect artifacts, then mark only those needed for a defensible decision.</span></div>
        <div className="selected-count">{selected.length} selected</div>
      </div>
      <section className="evidence-grid">
        {orderedEvidence.map(({ value: item }) => {
          const isInspected = inspected.includes(item.id);
          const isSelected = selected.includes(item.id);
          return (
            <article className={cx('evidence-card', isSelected && 'selected')} key={item.id}>
              <div className="evidence-card-top"><span className={cx('evidence-status', item.status)}>{item.code}</span>{isInspected && <span className="inspected"><Check size={13} /> inspected</span>}</div>
              <div className="evidence-icon"><FileSearch size={20} /></div>
              <small>{item.kind}</small><h3>{item.title}</h3><p>{item.summary}</p>
              <div className="evidence-actions"><button onClick={() => onInspect(item)}>Inspect <ChevronRight size={15} /></button><label className="select-control"><input type="checkbox" checked={isSelected} disabled={locked} onChange={() => onToggle(item.id)} /><span><Check size={13} /></span>Needed</label></div>
            </article>
          );
        })}
      </section>
      <div className="coach-note"><CircleHelp size={18} /><p><strong>Efficiency matters.</strong> Selecting every artifact signals weak prioritization. You will not lose points for inspecting broadly, but selecting irrelevant evidence reduces the evidence score.</p></div>
      <PageFooter previous="Guided learning" next="Classify and decide" onNext={onContinue} disabled={inspected.length !== EVIDENCE.length || selected.length === 0} hint={inspected.length !== EVIDENCE.length ? `Inspect all ${EVIDENCE.length} artifacts before classifying` : selected.length === 0 ? 'Select at least one artifact' : undefined} />
    </div>
  );
}

function Decide({ selected, decision, locked, onToggle, onDecision, onContinue }: { selected: string[]; decision: string; locked: boolean; onToggle: (id: string) => void; onDecision: (id: string) => void; onContinue: () => void }) {
  const orderedDefects = challengeOrder(DEFECTS, `${MODULE.id}:findings`, (item) => item.id);
  const orderedDecisions = challengeOrder(DECISIONS, `${MODULE.id}:decisions`, (item) => item.id);
  return (
    <div className="page">
      <PageHead eyebrow="CLASSIFY + DECIDE / 03" title="Separate defects from discomfort" lede="Not every irregularity defeats action. Select only conclusions established by the packet, then issue one Governing Body disposition." />
      <section className="decision-section">
        <div className="section-label"><span>01</span><div><h2>Classify the record</h2><p>Select every supported defect. Unsupported concerns count against the score.</p></div></div>
        <div className="defect-list">
          {orderedDefects.map(({ value: item }) => <label key={item.id} className={cx('defect-row', selected.includes(item.id) && 'selected')}><input type="checkbox" checked={selected.includes(item.id)} disabled={locked} onChange={() => onToggle(item.id)} /><span className="box"><Check size={14} /></span><span className="defect-type">{item.type}</span><p>{item.label}</p></label>)}
        </div>
      </section>
      <section className="decision-section">
        <div className="section-label"><span>02</span><div><h2>Issue the disposition</h2><p>Choose the narrowest action that cures the established failures and protects the official record.</p></div></div>
        <div className="decision-grid">
          {orderedDecisions.map(({ value: item }, index) => <button key={item.id} className={cx('decision-card', decision === item.id && 'selected')} onClick={() => onDecision(item.id)} aria-pressed={decision === item.id} disabled={locked}><span className="risk-pill">Disposition {String.fromCharCode(65 + index)}</span><h3>{item.title}</h3><p>{item.text}</p><span className="radio">{decision === item.id && <i />}</span></button>)}
        </div>
      </section>
      <SourceStrip items={['Synthetic bylaws A-03', 'ACHC HH1-4A.01', '42 CFR 484.65(e)', 'GV-GB-002 / 003 provisional']} />
      <PageFooter previous="Packet" next="Draft the record" onNext={onContinue} disabled={!decision || selected.length === 0} hint={!decision ? 'Select a disposition to continue' : undefined} />
    </div>
  );
}

function Record({ selected, locked, onToggle, onContinue }: { selected: string[]; locked: boolean; onToggle: (id: string) => void; onContinue: () => void }) {
  const orderedClauses = challengeOrder(MINUTE_CLAUSES, `${MODULE.id}:clauses`, (item) => item.id);
  return (
    <div className="page">
      <PageHead eyebrow="DOCUMENT / 04" title="Construct the record a surveyor can replay" lede="Select the five clauses that belong in the corrected minutes. Accuracy outranks elegance; attachments do not replace the Board’s decision trail." />
      <div className="minutes-workbench">
        <div className="paper-sheet">
          <div className="paper-head"><div><span>CARE INDEED HOME HEALTH CARE, INC.</span><h2>Corrected Governing Body Minutes</h2></div><div><small>DRAFT FOR APPROVAL</small><strong>07.16.26</strong></div></div>
          <div className="paper-rule" />
          <p className="minutes-prompt">Choose exactly five provisions for the corrective record.</p>
          <div className="clause-list">
            {orderedClauses.map(({ value: clause }, index) => <label key={clause.id} className={cx('clause', selected.includes(clause.id) && 'selected')}><input type="checkbox" checked={selected.includes(clause.id)} disabled={locked} onChange={() => onToggle(clause.id)} /><span>{String(index + 1).padStart(2, '0')}</span><p>{clause.text}</p><i>{selected.includes(clause.id) && <Check size={14} />}</i></label>)}
          </div>
          <div className="paper-signoff"><span>Record custodian review</span><span>Governing Body approval pending</span></div>
        </div>
        <aside className="minutes-aside"><FileCheck2 size={22} /><span>RECORD STANDARD</span><h3>Document the break and the cure</h3><ul><li>Who was present—at the moment of action</li><li>What conflict was disclosed and when</li><li>What evidence was missing or contradicted</li><li>What the Board actually decided</li><li>Who owns the remedy and when it returns</li></ul><div className={cx('selection-meter', selected.length === 5 && 'ready')}><strong>{selected.length}</strong><span>of 5 selected</span></div></aside>
      </div>
      <PageFooter previous="Decision" next="Face the surveyor" onNext={onContinue} disabled={selected.length !== 5} hint={selected.length !== 5 ? 'Select exactly five clauses' : undefined} />
    </div>
  );
}

type Diagnostic = { stage: string; issue: string; repair: string };
type ScoreSet = { evidence: number; authority: number; risk: number; decision: number; documentation: number; defense: number; total: number; criticalErrors: string[]; diagnostics: Diagnostic[] };

function Defend({ defense, submitted, scores, scoreEligible, passed, transfer, onAnswer, onSubmit, onTransfer, onReturn, onReset }: { defense: Record<string, number>; submitted: boolean; scores: ScoreSet; scoreEligible: boolean; passed: boolean; transfer: number | null; onAnswer: (id: string, value: number) => void; onSubmit: () => void; onTransfer: (value: number) => void; onReturn: () => void; onReset: () => void }) {
  if (submitted) return <Results scores={scores} scoreEligible={scoreEligible} passed={passed} transfer={transfer} onTransfer={onTransfer} onReturn={onReturn} onReset={onReset} />;
  const orderedQuestions = challengeOrder(DEFENSE, `${MODULE.id}:defense-questions`, (item) => item.id);
  return (
    <div className="page">
      <PageHead eyebrow="DEFEND / 05" title="The surveyor does not want your conclusion" lede="They want the evidence chain that made the conclusion defensible. Answer all three follow-up questions before locking the attempt." />
      <div className="surveyor-layout">
        <aside className="surveyor-card"><div className="surveyor-avatar"><Search size={25} /></div><span>SIMULATED INTERVIEW</span><h2>CMS surveyor</h2><p>“I’m going to compare your explanation with the packet, the minutes, and your follow-through.”</p><div><Clock3 size={15} /> Untimed · one submission</div></aside>
        <section className="defense-questions">
          {orderedQuestions.map(({ value: question }, qIndex) => { const orderedAnswers = challengeOrder(question.answers, `${MODULE.id}:${question.id}:answers`, (answer) => answer); return <article key={question.id} className="defense-question"><span>QUESTION {qIndex + 1} OF {DEFENSE.length}</span><h3>{question.stem}</h3><div>{orderedAnswers.map(({ value: answer, originalIndex }, displayIndex) => <label key={answer} className={cx('answer-row', defense[question.id] === originalIndex && 'selected')}><input type="radio" name={question.id} checked={defense[question.id] === originalIndex} onChange={() => onAnswer(question.id, originalIndex)} /><i>{String.fromCharCode(65 + displayIndex)}</i><p>{answer}</p></label>)}</div></article>; })}
        </section>
      </div>
      <div className="lock-attempt"><div><LockKeyhole size={18} /><p><strong>Lock this attempt?</strong><span>Your selections will be scored across six governance dimensions.</span></p></div><button className="primary-button large" disabled={!QA_MODE && Object.keys(defense).length !== DEFENSE.length} onClick={onSubmit}>Lock and score <ArrowRight size={17} /></button></div>
    </div>
  );
}

function Results({ scores, scoreEligible, passed, transfer, onTransfer, onReturn, onReset }: { scores: ScoreSet; scoreEligible: boolean; passed: boolean; transfer: number | null; onTransfer: (value: number) => void; onReturn: () => void; onReset: () => void }) {
  const dimensions = [
    ['Authority', scores.authority, 20], ['Risk', scores.risk, 15], ['Evidence', scores.evidence, 20],
    ['Decision', scores.decision, 20], ['Record', scores.documentation, 15], ['Defense', scores.defense, 10],
  ] as const;
  const transferAnswers = [
    'After the Chair announces the added action item and no member objects, because the participation and conflict defects have been cured.',
    'Only after unanimous consent of every member then present is documented before deliberation.',
    'Only at a later meeting after ordinary notice, because unanimous consent may adjust discussion order but cannot authorize action on an unlisted matter.',
  ];
  const orderedTransfer = challengeOrder(transferAnswers, `${MODULE.id}:transfer`, (answer) => answer);
  return (
    <div className="page results-page">
      <section className={cx('result-hero', passed ? 'pass' : scoreEligible && transfer === null ? 'pending' : 'remediate')} aria-live="polite">
        <div className="result-icon">{passed ? <CheckCircle2 size={32} /> : scoreEligible && transfer === null ? <Target size={32} /> : <AlertTriangle size={32} />}</div>
        <div><span>{passed ? 'MASTERY STANDARD MET' : scoreEligible && transfer === null ? 'TRANSFER CHECK REQUIRED' : 'TARGETED REMEDIATION REQUIRED'}</span><h1>{scores.total}<small>/100</small></h1><p>{passed ? 'You protected the decision trail and proved the rule on changed facts.' : scoreEligible && transfer === null ? 'Your scored work is eligible. Mastery remains locked until you solve the changed-facts case below.' : 'This attempt is not certificate-eligible. Repair the reasoning below, then take a new isomorphic case.'}</p></div>
        <div className="threshold"><span>PASS</span><strong>{MODULE.pass}%</strong><small>+ zero critical errors + one-shot transfer</small></div>
      </section>
      <section className="score-grid">
        {dimensions.map(([label, value, max]) => <article key={label}><div><span>{label}</span><strong>{value}<small>/{max}</small></strong></div><div className="score-track" role="progressbar" aria-label={`${label} score`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><i style={{ width: `${(value / max) * 100}%` }} /></div></article>)}
      </section>
      {!scoreEligible && (
        <section className="remediation-panel">
          <div className="remediation-head"><div><span>REASONING RECONSTRUCTION</span><h2>Repair the evidence chain</h2></div><Target size={24} /></div>
          {scores.criticalErrors.length > 0 && <div className="critical-box"><XCircle size={19} /><div><strong>Critical errors</strong>{scores.criticalErrors.map((error) => <p key={error}>{error}</p>)}</div></div>}
          <div className="diagnostic-list">{scores.diagnostics.map((item, index) => <article key={`${item.stage}-${item.issue}`}><span>{String(index + 1).padStart(2, '0')} · {item.stage}</span><h3>{item.issue}</h3><p>{item.repair}</p></article>)}</div>
          <div className="remediation-grid">
            <article><span>01 · DECISIVE DUTY</span><h3>Accuracy before ratification</h3><p>The official record cannot preserve an action that the supplied participation, notice, conflict, and evidence rules do not support.</p></article>
            <article><span>02 · WHY THE TRAP WORKED</span><h3>Each weak option solved one visible problem</h3><p>Abstention addressed only the vote—not prior participation. Aggregate improvement addressed only one metric—not the approved subgroup guardrail.</p></article>
            <article><span>03 · EVIDENCE REPAIR</span><h3>Cross-source verification</h3><p>Reconcile agenda, bylaws, time-specific attendance, conflict trail, QAPI criteria, complaints, and draft minutes before directing a cure.</p></article>
            <article><span>04 · TRANSFER RULE</span><h3>Change one fact at a time</h3><p>A clean conflict process does not cure a notice defect. Continuous remote audio does not cure an unmet QAPI effectiveness criterion.</p></article>
          </div>
        </section>
      )}
      {scoreEligible && transfer !== null && !passed && <section className="remediation-panel transfer-remediation"><div className="remediation-head"><span>NOVEL-FACT FAILURE</span><h2>The original record was mastered; the rule did not transfer.</h2></div><div className="critical-box"><XCircle size={19} /><div><strong>One-shot transfer missed</strong><p>The remaining defect is notice. The synthetic bylaw excerpt supplies a narrow unanimous-consent path, and the record must show that consent before deliberation.</p><p>Start a new attempt. The locked answer prevents feedback from being brute-forced into mastery.</p></div></div></section>}
      <div className="transfer-check"><span>{scoreEligible ? 'FINAL TRANSFER GATE · ONE SHOT' : 'COUNTERFACTUAL CHECK · ONE SHOT'}</span><h3>The remote member had continuous audio, and the conflicted member disclosed and left before discussion. The vendor item still was not noticed for action. Under the supplied bylaws, when could the Board act?</h3>{orderedTransfer.map(({ value: answer, originalIndex }, displayIndex) => <label key={answer} className={cx('answer-row', transfer === originalIndex && 'selected', transfer !== null && originalIndex === 1 && 'answer-correct', transfer !== null && transfer === originalIndex && originalIndex !== 1 && 'answer-wrong')}><input type="radio" name="transfer" checked={transfer === originalIndex} disabled={transfer !== null} onChange={() => onTransfer(originalIndex)} /><i>{String.fromCharCode(65 + displayIndex)}</i><p>{answer}</p>{transfer !== null && originalIndex === 1 && <CheckCircle2 size={18} />}</label>)}{transfer !== null && <p className="transfer-rationale">The remaining defect is notice. The synthetic bylaw excerpt supplies a narrow unanimous-consent path, and the record must show that consent before deliberation.</p>}</div>
      <div className="results-actions"><button className="secondary-button" onClick={onReturn}><ArrowLeft size={17} /> Review evidence</button><button className="primary-button" onClick={onReset}>{passed ? 'Start fresh demonstration' : 'Start new attempt'} <RotateCcw size={16} /></button></div>
    </div>
  );
}

function EvidenceDrawer({ item, selected, locked, onClose, onToggle }: { item: EvidenceItem; selected: boolean; locked: boolean; onClose: () => void; onToggle: () => void }) {
  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-scrim" onClick={onClose} aria-label="Close evidence" />
      <section className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
        <div className="drawer-head"><div><span>{item.code} · {item.kind.toUpperCase()}</span><h2 id="evidence-title">{item.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close evidence" autoFocus><X size={19} /></button></div>
        <div className="drawer-summary"><FileSearch size={21} /><p>{item.summary}</p></div>
        <div className="artifact-paper"><div className="artifact-watermark">TRAINING</div>{item.details.map((detail, index) => <div className="artifact-line" key={detail}><span>{String(index + 1).padStart(2, '0')}</span><p>{detail}</p></div>)}</div>
        <div className="drawer-source"><LockKeyhole size={15} /><span>{item.source}</span></div>
        <div className="drawer-actions"><button className="secondary-button" onClick={onClose}>Close</button><button className={cx('primary-button', selected && 'selected-button')} onClick={onToggle} disabled={locked}>{selected ? <><Check size={16} /> Added to evidence set</> : <>Add to evidence set <ArrowRight size={16} /></>}</button></div>
      </section>
    </div>
  );
}

function PageHead({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return <header className="page-head"><span>{eyebrow}</span><h1>{title}</h1><p>{lede}</p></header>;
}

function SourceStrip({ items }: { items: string[] }) {
  return <div className="source-strip"><LockKeyhole size={15} /><span>SOURCE SET</span>{items.map((item) => <i key={item}>{item}</i>)}</div>;
}

function PageFooter({ previous, next, onNext, disabled, hint }: { previous: string; next: string; onNext: () => void; disabled?: boolean; hint?: string }) {
  return <footer className="page-footer"><span><ArrowLeft size={15} /> {previous}</span><div>{!QA_MODE && hint && <small>{hint}</small>}<button className="primary-button" onClick={onNext} disabled={QA_MODE ? false : disabled}>{next} <ArrowRight size={16} /></button></div></footer>;
}

export default App;
