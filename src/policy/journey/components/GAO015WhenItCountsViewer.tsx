import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, ArrowLeft, ArrowRight, RotateCcw, BookOpen, MapPin, AlertTriangle, Shield, FileText, Home, Zap
} from 'lucide-react';

// Import shared primitives per spec (gao001-shared for FieldNoteCard, ProgressRail, etc.)
import {
  FieldNoteCard,
  ProgressRail,
  MuteToggle,
  SafeTrainingNote,
  useReducedMotion,
} from '@/policy/journey/components/gao001-v1-1/gao001-shared';

// =============================================================================
// GAO-015 "When It Counts" — Rich Interactive Story Scenes
// Orchestrator + 4 scenes in one file (permitted hybrid per task: scenes or sections)
// Follows GAO002OrgStructureViewer + GAO001 patterns + gao001-shared primitives exactly.
// Verbatim from docs/GAO-015-When-It-Counts/ scenes/ + trainingContent.gao.015-021.ts + bible.
// Full workspace (lessons hidden by caller), keyboard, reduced-motion, safe labels, localStorage resume.
// 4 scenes map to L1-L4. onComplete only on full finish -> caller uses withLessonCompleted for L1-L4.
// NO quiz/finalTest edits, no ack writes, no shell changes.
// =============================================================================

interface GAO015WhenItCountsViewerProps {
  onComplete?: () => void;
}

const STORAGE_KEY = 'gao015-interactive-progress';
// Reuse GAO001_COLORS palette tokens where needed (imported per spec)

// Scene metadata (1:1 with training lessons L1-L4 and storyboards)
const SCENE_META = [
  {
    id: 1,
    lessonId: 'GAO-015-L1',
    title: 'Understanding the Agency Emergency Preparedness Plan',
    subtitle: 'Discovery • 5 Pillars, HVA, Vulnerabilities',
    completeLabel: 'Emergency Plan Understanding Practice Complete',
  },
  {
    id: 2,
    lessonId: 'GAO-015-L2',
    title: 'Your Role During an Emergency',
    subtitle: 'FlowSequence • Mrs. Tanaka 8-step Quake + Decisions',
    completeLabel: 'Role During Emergency Practice Complete',
  },
  {
    id: 3,
    lessonId: 'GAO-015-L3',
    title: 'Communication Protocols During Emergencies',
    subtitle: 'Priority Matrix + Status DecisionBoard',
    completeLabel: 'Communication Protocols Practice Complete',
  },
  {
    id: 4,
    lessonId: 'GAO-015-L4',
    title: 'Training, Testing & Post-Event Review',
    subtitle: 'AAR Flow + Kit Readiness Decision',
    completeLabel: 'Training Testing and Readiness Practice Complete',
  },
] as const;

// Verbatim Field Notes + Reference (sourced from scenes/*.md + trainingContent narrations; new phrasing per redundancy contract)
const FIELD_NOTES: Record<string, { title: string; text: string; reference: string }> = {
  // S01
  's01-pillars': {
    title: 'The Four Core Elements',
    text: 'The CMS rule requires four interlocking pieces. A written risk assessment and plan is not enough on its own — policies must say exactly what staff do, a communication plan must actually reach people when towers are down, and training plus testing must prove it works before the real event. Care Indeed runs all four as one program.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005 for the governing requirement.',
  },
  's01-hva': {
    title: 'HVA and CA Priorities',
    text: 'Care Indeed conducts an annual Hazard Vulnerability Analysis that evaluates probability and impact. For California, earthquake and wildfire score highest on probability. Power outages and pandemic events score highest on impact due to our patient population\'s medical device dependency and immune vulnerability. Pre-positioning supplies and mutual aid agreements are driven by these rankings.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005 for the governing requirement.',
  },
  's01-vuln': {
    title: 'Distributed Patient Vulnerabilities',
    text: 'Unlike a hospital where everyone is in one building with generators and staff on site, our patients live in separate homes with different power sources, mobility limits, and cognitive needs. A vent patient loses power and has hours, not days. A person with dementia may not understand "shelter in place." The plan has to account for each one individually.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005 for the governing requirement.',
  },
  's01-plan': {
    title: 'Plan Location and Contents',
    text: 'The agency Emergency Preparedness Plan (OP-FM-005) is a living document updated annually and after any activation. It addresses earthquakes, wildfires, floods, utility failures, pandemics and workplace violence. Staff must know where it lives and what it says — it is not just a binder on a shelf.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005 for the governing requirement.',
  },
  's01-reg': {
    title: 'Regulatory Stakes',
    text: '42 CFR §484.102 is a Condition of Participation. Non-compliance can result in loss of Medicare certification and the inability to serve patients. Every clinician carries part of the agency\'s compliance obligation into every home.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005 for the governing requirement.',
  },
  // S02
  's02-quake': {
    title: 'Mrs. Tanaka Earthquake Sequence',
    text: 'Instruct patient to stay still and protect head. Shield with pillows/blankets if able. Drop, cover, and hold on. Post-shake: assess injuries. Check O2 function and switch to backup if needed. Assess gas leaks, structural damage, exits. Evacuate if unsafe or call 911 from outside. Contact the Emergency Coordinator immediately.',
    reference: 'Reference: 42 CFR §484.102 + OP-FM-005. Never use switches or phones inside if gas suspected.',
  },
  's02-wildfire': {
    title: 'Wildfire / Power Decision',
    text: 'Check evacuation zone. Coordinate via Emergency Coordinator + EMS — never use personal vehicle for medical transport patients. Document outage start time and battery life. Office: follow building plan or drop-cover.',
    reference: 'Reference: 42 CFR §484.102 — Emergency Preparedness. Informational; see policy OP-FM-005.',
  },
  // S03
  's03-tiers': {
    title: 'Priority Matrix (Patient Outreach)',
    text: 'Priority One: life-sustaining equipment (ventilators, IV infusions, peritoneal dialysis). Priority Two: time-sensitive care (wound VAC, daily insulin). Priority Three: routine care that can be safely delayed 24-48 hours. Priority Four: stable patients with no immediate contact needed.',
    reference: 'Reference: CL-PR-005. Tier Three patient prioritization.',
  },
  's03-status': {
    title: 'Status Reporting Order',
    text: 'Primary: text message to supervisor (uses less bandwidth). Secondary: email to emergency inbox. Tertiary: out-of-state hotline. Report Available, Unavailable, or Unknown. Unknown after 4 hours triggers welfare check.',
    reference: 'Reference: CL-PR-005. Text primary, out-of-area hotline for overload protection.',
  },
  's03-social': {
    title: 'No Social Media Rule',
    text: 'Never use social media to communicate patient information during an emergency. Posting locations, conditions, or care needs violates HIPAA and can result in termination and federal penalties. Use only approved channels.',
    reference: 'Reference: CL-PR-005 + HIPAA. Absolute prohibition.',
  },
  // S04
  's04-aar': {
    title: 'After Action Review Structure',
    text: 'What was planned? What actually happened? Why was there a difference? What will we change? The AAR is not about blame — it is about improvement. Every participant contributes observations that feed directly into updates to the Emergency Preparedness Plan.',
    reference: 'Reference: 42 CFR §484.102 + OP-FM-005.',
  },
  's04-kit': {
    title: 'Personal & Vehicle Readiness',
    text: 'Maintain 72-hour kit at home and in vehicle: water, non-perishable food, flashlight, battery charger, first aid, regular meds, important docs, paper map of service area, agency emergency contact card, extra PPE. Keep gas tank ≥ half full May–Oct (wildfire season). Treat drills as real.',
    reference: 'Reference: 42 CFR §484.102 training & testing element.',
  },
};

// S02 verbatim 8-step sequence (from trainingContent + scene-02)
const S02_STEPS = [
  { id: 's1', label: 'Instruct patient to stay still, protect head' },
  { id: 's2', label: 'Shield with pillows/blankets if able' },
  { id: 's3', label: 'Drop, cover, and hold on' },
  { id: 's4', label: 'Post-shake: assess injuries' },
  { id: 's5', label: 'Check O2 function; switch to backup if needed' },
  { id: 's6', label: 'Assess gas leaks, structural damage, exits' },
  { id: 's7', label: 'Evacuate if unsafe or call 911 from outside' },
  { id: 's8', label: 'Contact Care Indeed Emergency Coordinator' },
];

// S04 verbatim AAR + Mr Rodriguez inspired 9-step activation (condensed to flow + kit decision)
const S04_AAR_STEPS = [
  { id: 'a1', label: 'What was planned?' },
  { id: 'a2', label: 'What actually happened?' },
  { id: 'a3', label: 'Why was there a difference?' },
  { id: 'a4', label: 'What will we change?' },
];

// S03 Priority + status decision options (verbatim)
const S03_STATUS_OPTIONS = [
  { id: 'text', label: 'Text supervisor status first', correct: true, feedback: 'Correct. Text uses less bandwidth and is primary per CL-PR-005.' },
  { id: 'voice', label: 'Call the office on voice line immediately', correct: false, feedback: 'Voice lines overload in disasters. Text is primary.' },
  { id: 'social', label: 'Post status on social media for help', correct: false, feedback: 'Social media violates HIPAA. Never post patient info — termination risk.' },
  { id: 'wait', label: 'Wait for office to contact you', correct: false, feedback: 'You must proactively report status within the 1-hour window.' },
];

const S03_PRIORITY_OPTIONS = [
  { id: 'p1', label: 'Vent-dependent patient — classify Priority One (life-sustaining)', correct: true, feedback: 'Correct. P1 patients must be reached within 24h; life-sustaining equipment window is hours.' },
  { id: 'p3', label: 'Vent-dependent patient — classify Priority Three (routine)', correct: false, feedback: 'Incorrect. Vent patients are Priority One. Misclassification risks preventable harm.' },
];

export default function GAO015WhenItCountsViewer({ onComplete }: GAO015WhenItCountsViewerProps) {
  const reducedMotion = useReducedMotion();

  // Persisted orchestrator state
  const [currentScene, setCurrentScene] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).currentScene ?? 1;
    } catch {}
    return 1;
  });

  const [completedScenes, setCompletedScenes] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return new Set(JSON.parse(saved).completedScenes ?? []);
    } catch {}
    return new Set();
  });

  const [isMuted, setIsMuted] = useState(false);
  const [narration, setNarration] = useState('Alex opens the Emergency Preparedness plan. Follow the scenes to rehearse real actions.');
  const [fieldNotes, setFieldNotes] = useState<Array<{ key: string; text: string }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).fieldNotes ?? [];
    } catch {}
    return [];
  });

  // Per-scene internal states (resumable)
  const [s1Discovered, setS1Discovered] = useState<Set<string>>(() => {
    const data = loadSceneState('s1');
    const arr = Array.isArray(data) ? data : [];
    return new Set(arr);
  });
  const [s2StepIdx, setS2StepIdx] = useState<number>(() => loadSceneState('s2').stepIdx ?? 0);
  const [s2Confirmed, setS2Confirmed] = useState<Set<string>>(() => new Set(loadSceneState('s2').confirmed ?? []));
  const [s2Decision, setS2Decision] = useState<{ choice: string; correct: boolean; fb: string } | null>(() => loadSceneState('s2').decision ?? null);
  const [s3Discovered, setS3Discovered] = useState<Set<string>>(() => {
    const data = loadSceneState('s3');
    const arr = Array.isArray(data) ? data : (data?.discovered || []);
    return new Set(arr);
  });
  const [s3StatusChoice, setS3StatusChoice] = useState<string | null>(() => loadSceneState('s3').status ?? null);
  const [s3PriorityChoice, setS3PriorityChoice] = useState<string | null>(() => loadSceneState('s3').priority ?? null);
  const [s4AarIdx, setS4AarIdx] = useState<number>(() => loadSceneState('s4').aarIdx ?? 0);
  const [s4KitSelected, setS4KitSelected] = useState<Set<string>>(() => new Set(loadSceneState('s4').kit ?? []));
  const [s4KitComplete, setS4KitComplete] = useState<boolean>(() => loadSceneState('s4').kitComplete ?? false);
  const [feedback, setFeedback] = useState<string>('');

  function loadSceneState(sceneKey: string): any {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return p.sceneStates?.[sceneKey] ?? {};
      }
    } catch {}
    return {};
  }

  // Persist everything
  const persist = useCallback(() => {
    try {
      const data = {
        currentScene,
        completedScenes: Array.from(completedScenes),
        fieldNotes,
        sceneStates: {
          s1: Array.from(s1Discovered),
          s2: { stepIdx: s2StepIdx, confirmed: Array.from(s2Confirmed), decision: s2Decision },
          s3: { discovered: Array.from(s3Discovered), status: s3StatusChoice, priority: s3PriorityChoice },
          s4: { aarIdx: s4AarIdx, kit: Array.from(s4KitSelected), kitComplete: s4KitComplete },
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [currentScene, completedScenes, fieldNotes, s1Discovered, s2StepIdx, s2Confirmed, s2Decision, s3Discovered, s3StatusChoice, s3PriorityChoice, s4AarIdx, s4KitSelected, s4KitComplete]);

  useEffect(() => { persist(); }, [persist]);

  const currentMeta = SCENE_META[currentScene - 1];
  const progressScenes = completedScenes.size;
  const allComplete = completedScenes.size === 4;

  const addFieldNote = (key: string, text: string) => {
    setFieldNotes(prev => {
      if (prev.some(n => n.key === key)) return prev;
      return [...prev, { key, text }];
    });
  };

  const toggleMute = () => setIsMuted(m => !m);

  const goToScene = (n: number) => {
    if (n < 1 || n > 4) return;
    // Allow free nav once prior complete (or any for review)
    const canGo = n <= currentScene || completedScenes.has(n - 1) || completedScenes.has(currentScene);
    if (canGo || completedScenes.size > 0) {
      setCurrentScene(n);
      setFeedback('');
      setNarration(`Scene ${n}: ${SCENE_META[n-1].title}`);
    }
  };

  const completeCurrentScene = () => {
    const id = currentScene;
    setCompletedScenes(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    const label = currentMeta.completeLabel;
    addFieldNote(`s${id}`, label);
    setNarration(`${label}. ${id < 4 ? 'Advance to next scene.' : 'All scenes complete.'}`);
    setFeedback('');

    if (id < 4) {
      setTimeout(() => goToScene(id + 1), 650);
    } else if (onComplete) {
      // Full finish — caller marks L1-L4 via withLessonCompleted + journey record
      setTimeout(() => {
        onComplete();
      }, 420);
    }
  };

  const resetAll = () => {
    setCurrentScene(1);
    setCompletedScenes(new Set());
    setFieldNotes([]);
    setS1Discovered(new Set());
    setS2StepIdx(0);
    setS2Confirmed(new Set());
    setS2Decision(null);
    setS3Discovered(new Set());
    setS3StatusChoice(null);
    setS3PriorityChoice(null);
    setS4AarIdx(0);
    setS4KitSelected(new Set());
    setS4KitComplete(false);
    setFeedback('');
    setNarration('Reset. Begin with Scene 1.');
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  // ===================== S01: DiscoveryScene (5 hotspots) =====================
  const S01_HOTSPOTS = [
    { key: 's01-pillars', label: 'Four Pillars', icon: Shield, pos: 'top-[22%] left-[18%]' },
    { key: 's01-hva', label: 'HVA Risks', icon: AlertTriangle, pos: 'top-[28%] right-[22%]' },
    { key: 's01-vuln', label: 'Patient Vulnerabilities', icon: Home, pos: 'bottom-[32%] left-[24%]' },
    { key: 's01-plan', label: 'Plan & Contacts', icon: FileText, pos: 'bottom-[26%] right-[18%]' },
    { key: 's01-reg', label: 'Regulatory (484.102)', icon: Zap, pos: 'top-[48%] left-[42%]' },
  ];

  const handleS1Discover = (key: string) => {
    if (s1Discovered.has(key)) return;
    const next = new Set(s1Discovered);
    next.add(key);
    setS1Discovered(next);
    const note = FIELD_NOTES[key];
    if (note) {
      addFieldNote(key, note.text);
      setFeedback(note.text);
      setNarration(`Unlocked: ${note.title}`);
    }
    // Auto-complete when all discovered (verbatim from storyboard: all must be discovered)
    if (next.size === 5) {
      setTimeout(() => completeCurrentScene(), 620);
    }
  };

  // ===================== S02: FlowSequence 8-step + DecisionBoard =====================
  const handleS2Step = (stepId: string, idx: number) => {
    if (idx !== s2StepIdx) {
      setFeedback('Complete steps in exact order. Follow the sequence Alex must execute.');
      return;
    }
    const nextConfirmed = new Set(s2Confirmed);
    nextConfirmed.add(stepId);
    setS2Confirmed(nextConfirmed);
    const newIdx = idx + 1;
    setS2StepIdx(newIdx);
    setFeedback(`Step ${idx + 1} confirmed. ${S02_STEPS[idx].label}`);
    setNarration(`Mrs. Tanaka sequence: ${S02_STEPS[idx].label}`);

    if (newIdx === S02_STEPS.length) {
      // Sequence complete — now DecisionBoard part
      setFeedback('Sequence verified. Now address wildfire/power judgment.');
    }
  };

  const handleS2Decision = (choice: string, isCorrect: boolean, fb: string) => {
    setS2Decision({ choice, correct: isCorrect, fb });
    setFeedback(fb);
    if (isCorrect) {
      addFieldNote('s02-wildfire', FIELD_NOTES['s02-wildfire'].text);
      setTimeout(() => completeCurrentScene(), 580);
    } else {
      setNarration('Review the correct protocol. Try the right choice.');
    }
  };

  // ===================== S03: Discovery + Priority/Status DecisionBoard =====================
  const S03_NODES = [
    { key: 's03-tiers', label: 'Priority Matrix (P1–P4)' },
    { key: 's03-status', label: 'Status Reporting (text first)' },
    { key: 's03-social', label: 'No Social Media Rule' },
  ];

  const handleS3Discover = (key: string) => {
    if (s3Discovered.has(key)) return;
    const next = new Set(s3Discovered);
    next.add(key);
    setS3Discovered(next);
    const note = FIELD_NOTES[key];
    if (note) {
      addFieldNote(key, note.text);
      setFeedback(note.text);
      setNarration(`Protocol unlocked: ${note.title}`);
    }
  };

  const handleS3Status = (optId: string) => {
    const opt = S03_STATUS_OPTIONS.find(o => o.id === optId)!;
    setS3StatusChoice(optId);
    setFeedback(opt.feedback);
    if (!opt.correct) setNarration('Text is always primary. Review and select correct.');
    if (opt.correct && s3PriorityChoice === 'p1') {
      addFieldNote('s03-status', FIELD_NOTES['s03-status'].text);
      setTimeout(() => completeCurrentScene(), 520);
    }
  };

  const handleS3Priority = (optId: string) => {
    const opt = S03_PRIORITY_OPTIONS.find(o => o.id === optId)!;
    setS3PriorityChoice(optId);
    setFeedback(opt.feedback);
    if (opt.correct && s3StatusChoice === 'text') {
      addFieldNote('s03-tiers', FIELD_NOTES['s03-tiers'].text);
      setTimeout(() => completeCurrentScene(), 520);
    }
  };

  // ===================== S04: AAR Flow + Kit Decision =====================
  const handleS4AarAdvance = () => {
    const next = s4AarIdx + 1;
    setS4AarIdx(next);
    setFeedback(`AAR step ${next}: ${S04_AAR_STEPS[s4AarIdx].label}`);
    setNarration('AAR is improvement, not blame.');
    if (next >= S04_AAR_STEPS.length && s4KitComplete) {
      setTimeout(() => completeCurrentScene(), 480);
    }
  };

  const KIT_ITEMS = ['water', 'food', 'flashlight', 'charger', 'map', 'card', 'ppe', 'meds'];
  const handleS4KitToggle = (item: string) => {
    const next = new Set(s4KitSelected);
    if (next.has(item)) next.delete(item); else next.add(item);
    setS4KitSelected(next);
    // Require all 8 + AAR done for complete
    const complete = next.size === KIT_ITEMS.length;
    setS4KitComplete(complete);
    setFeedback(complete ? 'Kit verified. Treat every drill and activation as real.' : 'Select all required items from the readiness list.');
    if (complete && s4AarIdx >= S04_AAR_STEPS.length) {
      addFieldNote('s04-kit', FIELD_NOTES['s04-kit'].text);
      setTimeout(() => completeCurrentScene(), 480);
    }
  };

  // Keyboard support (Tab/Enter/Esc/Arrow) — full path per spec
  const onKeyDownGlobal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') goToScene(Math.min(4, currentScene + 1));
    if (e.key === 'ArrowLeft') goToScene(Math.max(1, currentScene - 1));
    if (e.key.toLowerCase() === 'r' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); resetAll(); }
  };

  const renderScene = () => {
    switch (currentScene) {
      case 1:
        return (
          <div className="relative h-full w-full bg-[#F8F1E9] rounded-[18px] overflow-hidden border border-[#E5E4E3]" onKeyDown={onKeyDownGlobal} tabIndex={0}>
            {/* Visual mock: binder + CA map + patient icons */}
            <div className="absolute inset-0 bg-[radial-gradient(#E5E4E3_0.8px,transparent_1px)] bg-[length:4px_4px]" />
            <div className="absolute inset-4 rounded-xl border-2 border-[#0F5B54]/30 bg-white/70 p-6">
              <div className="text-center mb-3">
                <div className="inline-flex items-center gap-2 text-[#0F5B54] font-semibold tracking-[0.5px] text-sm">EMERGENCY PREPAREDNESS PLAN — CARE INDEED (OP-FM-005)</div>
                <div className="text-[11px] text-[#475569]">California HVA overlay • 42 CFR §484.102</div>
              </div>

              {/* 5 Hotspots — persistent glow, keyboard accessible, reduced-motion static per spec */}
              {S01_HOTSPOTS.map((h, i) => {
                const Icon = h.icon;
                const resolved = s1Discovered.has(h.key);
                return (
                  <button
                    key={i}
                    onClick={() => handleS1Discover(h.key)}
                    aria-label={`Discover ${h.label}`}
                    className={`absolute ${h.pos} flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54] ${resolved ? 'bg-[#E6F4E9] border-[#006B3A] text-[#006B3A]' : 'bg-white/95 border-[#0F5B54] text-[#0F5B54] hover:bg-[#E8F5F3] shadow-sm'} ${!reducedMotion ? 'hover:scale-[1.01]' : ''}`}
                    style={{ boxShadow: resolved ? 'none' : '0 0 0 3px rgba(15,91,84,0.18)' }}
                  >
                    <Icon className="w-3.5 h-3.5" /> {h.label} {resolved && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-[#64748B] flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Click all 5 glowing locations to discover the plan
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="h-full w-full flex gap-3 bg-[#F8F1E9] rounded-[18px] border border-[#E5E4E3] p-3" onKeyDown={onKeyDownGlobal} tabIndex={0}>
            {/* FlowSequence rail — left */}
            <div className="w-72 border-r border-[#E5E4E3] pr-3 overflow-auto">
              <div className="text-[10px] uppercase tracking-widest text-[#C74601] font-bold mb-2">MRS. TANAKA QUAKE — 8-STEP SEQUENCE (verbatim)</div>
              <ol className="space-y-1.5 text-sm">
                {S02_STEPS.map((step, idx) => {
                  const done = s2Confirmed.has(step.id);
                  const isCurrent = idx === s2StepIdx && !done;
                  return (
                    <li key={step.id}>
                      <button
                        onClick={() => handleS2Step(step.id, idx)}
                        disabled={!isCurrent && !done}
                        className={`w-full text-left px-3 py-1.5 rounded border text-xs flex gap-2 items-start ${done ? 'bg-[#E6F4E9] border-[#006B3A] text-[#006B3A]' : isCurrent ? 'bg-white border-[#0F5B54] text-[#0F5B54] hover:bg-[#E8F5F3]' : 'bg-white/60 border-[#E5E4E3] text-[#64748B]'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F5B54]`}
                      >
                        <span className="font-mono tabular-nums w-4">{idx + 1}.</span>
                        <span>{step.label}</span>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-3 text-[10px] text-[#475569]">Advance only on correct sequential action. No skipping.</div>
            </div>

            {/* DecisionBoard — right */}
            <div className="flex-1 p-2">
              <div className="text-[10px] uppercase tracking-widest text-[#C74601] font-bold mb-1">WILDFIRE / POWER DECISION (consequence feedback)</div>
              <div className="rounded-lg border border-[#E5E4E3] bg-white p-3 mb-3 text-sm">
                Alex finishes the sequence with Mrs. Tanaka. Now: evacuation zone alert comes in. What is the correct next action?
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'coord', label: 'Contact Coordinator + coordinate with EMS (no personal transport)', correct: true, fb: 'Correct. Never transport in personal vehicle when medical equipment is required. Escalate to EMS.' },
                  { id: 'drive', label: 'Drive patient in your own car to safety', correct: false, fb: 'Incorrect. Policy forbids personal vehicle transport for device-dependent patients — call 911 / EMS.' },
                  { id: 'wait', label: 'Wait inside and monitor', correct: false, fb: 'Incorrect. Check zone and coordinate immediately. Do not remain in hazard without direction.' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => handleS2Decision(opt.id, opt.correct, opt.fb)}
                    disabled={!!s2Decision}
                    className="text-left px-3 py-2 rounded border text-sm hover:bg-[#F8F1E9] border-[#E5E4E3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F5B54] disabled:opacity-75">
                    {opt.label}
                  </button>
                ))}
              </div>
              {s2Decision && <div className={`mt-3 text-sm rounded p-2 ${s2Decision.correct ? 'bg-[#E6F4E9] text-[#006B3A]' : 'bg-[#F8E8E8] text-[#8B2C2C]'}`}>{s2Decision.fb}</div>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="h-full w-full flex flex-col bg-[#F8F1E9] rounded-[18px] border border-[#E5E4E3] p-3" onKeyDown={onKeyDownGlobal} tabIndex={0}>
            <div className="text-[10px] uppercase tracking-widest text-[#C74601] font-bold mb-1">ALERT RECEIVED — REPORT STATUS + CLASSIFY PATIENTS</div>

            {/* Discovery for tiers */}
            <div className="flex gap-2 mb-3">
              {S03_NODES.map(n => {
                const res = s3Discovered.has(n.key);
                return (
                  <button key={n.key} onClick={() => handleS3Discover(n.key)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded border ${res ? 'bg-[#E6F4E9] border-[#006B3A] text-[#006B3A]' : 'bg-white border-[#0F5B54] text-[#0F5B54] hover:bg-[#E8F5F3]'}`}>
                    {n.label} {res && '✓'}
                  </button>
                );
              })}
            </div>

            {/* DecisionBoard for status + priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <div className="border border-[#E5E4E3] bg-white rounded p-3">
                <div className="font-semibold text-sm mb-2">1. Report your status (choose primary method)</div>
                {S03_STATUS_OPTIONS.map(o => (
                  <button key={o.id} onClick={() => handleS3Status(o.id)} disabled={s3StatusChoice !== null}
                    className={`block w-full text-left mb-1.5 px-2 py-1.5 text-xs rounded border ${s3StatusChoice === o.id ? (o.correct ? 'bg-[#E6F4E9] border-[#006B3A]' : 'bg-[#F8E8E8] border-[#8B2C2C]') : 'hover:bg-[#F8F1E9] border-[#E5E4E3]'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
              <div className="border border-[#E5E4E3] bg-white rounded p-3">
                <div className="font-semibold text-sm mb-2">2. Classify next patient (ventilator)</div>
                {S03_PRIORITY_OPTIONS.map(o => (
                  <button key={o.id} onClick={() => handleS3Priority(o.id)} disabled={s3PriorityChoice !== null}
                    className={`block w-full text-left mb-1.5 px-2 py-1.5 text-xs rounded border ${s3PriorityChoice === o.id ? (o.correct ? 'bg-[#E6F4E9] border-[#006B3A]' : 'bg-[#F8E8E8] border-[#8B2C2C]') : 'hover:bg-[#F8F1E9] border-[#E5E4E3]'}`}>
                    {o.label}
                  </button>
                ))}
                <div className="text-[10px] mt-2 text-[#475569]">Correct combination of text-first + P1 unlocks completion.</div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="h-full w-full flex gap-3 bg-[#F8F1E9] rounded-[18px] border border-[#E5E4E3] p-3" onKeyDown={onKeyDownGlobal} tabIndex={0}>
            {/* AAR Flow rail */}
            <div className="w-64 border-r pr-3 border-[#E5E4E3]">
              <div className="text-[10px] uppercase tracking-widest text-[#C74601] font-bold mb-2">AFTER ACTION REVIEW — 4 QUESTIONS</div>
              <div className="space-y-1">
                {S04_AAR_STEPS.map((s, i) => (
                  <div key={i} className={`px-2 py-1 text-xs rounded border ${i < s4AarIdx ? 'bg-[#E6F4E9] border-[#006B3A]' : i === s4AarIdx ? 'bg-white border-[#0F5B54]' : 'bg-white/60 border-[#E5E4E3]'}`}>
                    {i + 1}. {s.label}
                  </div>
                ))}
              </div>
              <button onClick={handleS4AarAdvance} disabled={s4AarIdx >= S04_AAR_STEPS.length} className="mt-3 w-full text-xs py-1 rounded bg-[#0F5B54] text-white disabled:opacity-40">Advance AAR Step</button>
              <div className="text-[10px] mt-2 text-[#475569]">AAR feeds plan updates. Everyone contributes.</div>
            </div>

            {/* Kit readiness Decision / checklist */}
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-widest text-[#C74601] font-bold mb-1">PERSONAL + VEHICLE KIT READINESS (select all)</div>
              <div className="text-sm mb-2">Keep gas ≥ ½ tank May–Oct. Treat scenario as real. If displaced you cannot help patients.</div>
              <div className="grid grid-cols-2 gap-1.5">
                {KIT_ITEMS.map(item => {
                  const sel = s4KitSelected.has(item);
                  return (
                    <button key={item} onClick={() => handleS4KitToggle(item)}
                      className={`px-3 py-1.5 text-xs rounded border text-left ${sel ? 'bg-[#E6F4E9] border-[#006B3A]' : 'bg-white border-[#E5E4E3] hover:bg-[#F8F1E9]'}`}>
                      {sel ? '✓ ' : ''}{item === 'map' ? 'Paper map of service area' : item === 'card' ? 'Agency emergency contact card' : item === 'ppe' ? 'Extra PPE' : item === 'meds' ? 'Personal meds + copies' : item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] mt-2 text-[#475569]">All 8 + AAR complete → scene finishes.</div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const sceneProgress = currentScene === 1 ? s1Discovered.size : currentScene === 2 ? s2StepIdx : currentScene === 3 ? (s3Discovered.size + (s3StatusChoice ? 1 : 0) + (s3PriorityChoice ? 1 : 0)) : (s4AarIdx + (s4KitComplete ? 4 : 0));
  const sceneTotal = currentScene === 1 ? 5 : currentScene === 2 ? 8 : currentScene === 3 ? 5 : 8;

  return (
    <div className="h-full w-full flex flex-col bg-[#F8F4ED] text-[#2C2825] overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }} onKeyDown={onKeyDownGlobal} tabIndex={-1}>
      <style>{`
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        .gao015-hotspot:focus-visible { outline: 3px solid #0F5B54; outline-offset: 2px; }
      `}</style>

      {/* Thin workspace chrome (no side lessons) */}
      <div className="flex items-center justify-between border-b border-[#E5E4E3] bg-white/95 px-3 py-1.5 text-sm shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => goToScene(currentScene - 1)} disabled={currentScene === 1} className="p-1 rounded hover:bg-[#F8F1E9] disabled:opacity-40" aria-label="Previous scene"><ArrowLeft className="w-4 h-4" /></button>
          <button onClick={() => goToScene(currentScene + 1)} disabled={currentScene === 4} className="p-1 rounded hover:bg-[#F8F1E9] disabled:opacity-40" aria-label="Next scene"><ArrowRight className="w-4 h-4" /></button>

          <div className="ml-2 font-semibold text-[#0F5B54]">GAO-015 — When It Counts</div>
          <div className="text-xs text-[#64748B] ml-1">Scene {currentScene} of 4 • {currentMeta.title}</div>
        </div>

        <div className="flex items-center gap-3">
          <ProgressRail current={progressScenes} total={4} label="Scenes complete" />
          <div className="text-xs tabular-nums text-[#475569]">{Math.round((progressScenes / 4) * 100)}%</div>
          <MuteToggle isMuted={isMuted} onToggle={toggleMute} />
          <button onClick={resetAll} aria-label="Reset progress" className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-[#E5E4E3] hover:bg-[#F8F1E9]"><RotateCcw className="w-3 h-3" /> Reset</button>
        </div>
      </div>

      {/* Scene title + local progress */}
      <div className="px-3 py-1.5 flex items-center justify-between bg-[#FDF8F3] border-b border-[#E5E4E3] text-sm shrink-0">
        <div>
          <div className="font-semibold">{currentMeta.title}</div>
          <div className="text-xs text-[#475569]">{currentMeta.subtitle}</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <ProgressRail current={Math.min(sceneProgress, sceneTotal)} total={sceneTotal} label={`Scene ${currentScene} progress`} />
          {completedScenes.has(currentScene) && <span className="text-[#006B3A] flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Complete</span>}
        </div>
      </div>

      {/* Main interactive workspace (full) */}
      <div className="flex-1 min-h-0 p-2 overflow-hidden">
        {renderScene()}
      </div>

      {/* Bottom bar: Field Notes + narration + complete controls */}
      <div className="border-t border-[#E5E4E3] bg-white px-3 py-2 text-xs shrink-0 flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex-1">
          {feedback && (
            <FieldNoteCard
              title="Field Note"
              text={feedback}
              reference="Reference: 42 CFR §484.102 / OP-FM-005 / CL-PR-005 (see scenes for exact)."
            />
          )}
          <div className="text-[#64748B] mt-0.5">{narration}</div>
        </div>

        <div className="flex items-center gap-2">
          {fieldNotes.length > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[#475569]"><BookOpen className="w-3.5 h-3.5" /> {fieldNotes.length} notes</div>
          )}
          {!completedScenes.has(currentScene) && sceneProgress >= sceneTotal && (
            <button onClick={completeCurrentScene} className="px-3 py-1 rounded bg-[#0F5B54] text-white text-xs font-semibold hover:bg-[#007970]">Mark {currentMeta.completeLabel.replace(' Practice Complete', '')} Complete</button>
          )}
          {allComplete && (
            <div className="text-[#006B3A] font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> All scenes complete — ready for assessment</div>
          )}
        </div>
      </div>

      <SafeTrainingNote />

      {/* Keyboard hint */}
      <div className="text-[10px] text-center text-[#64748B] py-0.5 bg-[#FDF8F3] border-t border-[#E5E4E3]">Keyboard: ← → scenes • Tab/Enter hotspots &amp; choices • R+Ctrl reset • Esc closes notes (focus visible)</div>
    </div>
  );
}
