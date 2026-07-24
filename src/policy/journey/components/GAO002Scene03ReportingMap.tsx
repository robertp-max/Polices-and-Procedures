import { useState, useEffect } from 'react';
import {
  CheckCircle2, RotateCcw, Volume2, VolumeX,
  Check, Award, MapPin
} from 'lucide-react';

// Self-contained premium audio synthesizer (exact pattern from CoreValuesInteractiveViewer + GAO001Scene01)
class ReportingMapAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  private tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.04) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  playClick() { this.init(); this.tone(920, 0.06, 'sine', 0.035); }
  playSoftClick() { this.init(); this.tone(680, 0.05, 'sine', 0.025); }
  playChime() {
    if (this.muted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.045, now + i * 0.08 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, now + i * 0.08 + 0.85);
      osc.connect(g); g.connect(this.ctx!.destination);
      osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.9);
    });
  }
  playWarmChime() {
    if (this.muted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    [415.3, 523.25, 622.25, 830.61].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.038, now + i * 0.11 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0006, now + i * 0.11 + 1.1);
      osc.connect(g); g.connect(this.ctx!.destination);
      osc.start(now + i * 0.11); osc.stop(now + i * 0.11 + 1.2);
    });
  }
  playError() { this.init(); this.tone(185, 0.22, 'sawtooth', 0.045); }
  playLineHighlight() { this.init(); this.tone(1240, 0.11, 'sine', 0.03); }
}

const audio = new ReportingMapAudio();

// Exact benchmark brand palette + animations from CoreValuesInteractiveViewer + GAO001 scenes
const brandStyles = `
  @keyframes mapNodePulse {
    0%, 100% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.015); filter: brightness(1.03); }
  }
  .map-node-glow {
    animation: mapNodePulse 3.2s ease-in-out infinite;
  }
  .map-node-glow:hover {
    filter: brightness(1.08) drop-shadow(0 0 8px rgba(199, 70, 1, 0.35));
  }

  @keyframes lineAssemble {
    0% { stroke-dashoffset: 120; opacity: 0.35; }
    100% { stroke-dashoffset: 0; opacity: 1; }
  }
  .assemble-line {
    stroke-dasharray: 120;
    transition: stroke 280ms cubic-bezier(0.16,1,0.3,1), opacity 220ms ease;
  }
  .assemble-line.active {
    animation: lineAssemble 620ms cubic-bezier(0.16,1,0.3,1) forwards;
    stroke: #C74601;
    stroke-width: 3.5;
  }

  @keyframes softPop {
    0% { transform: scale(0.92); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .soft-pop { animation: softPop 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  @keyframes gentleRise {
    0% { transform: translateY(6px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .gentle-rise { animation: gentleRise 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  @keyframes practiceCheck {
    0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
    60% { transform: scale(1.08) rotate(3deg); }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
  .practice-check { animation: practiceCheck 420ms cubic-bezier(0.2, 0, 0.1, 1) forwards; }

  .practice-board {
    transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  .practice-board.complete {
    border-color: #007970;
    background: #F0FDFA;
  }

  .tf-card {
    transition: transform 180ms cubic-bezier(0.16,1,0.3,1), box-shadow 180ms ease, border-color 180ms ease;
  }
  .tf-card:hover:not(.selected):not(.locked) { transform: translateY(-1px); box-shadow: 0 10px 18px -6px rgba(15,91,84,0.12); }
  .tf-card.selected { transform: scale(1.01); }
  .tf-card.correct { border-color: #007970; background: #E5FEFF; }
  .tf-card.incorrect { border-color: #C74601; background: #FEF2F2; }

  .seq-step {
    transition: all 160ms cubic-bezier(0.16,1,0.3,1);
    user-select: none;
  }
  .seq-step.locked { opacity: 0.92; }
  .seq-step:hover:not(.locked) { background: #F8FAFC; border-color: #007970; }
`;

// Data pulled from GAO-002 finalTest + L1/L2
const ROLES = [
  {
    id: 'gb',
    label: 'Governing Body',
    short: 'GB',
    responsibility: 'Approve scope of services and Compliance Officer appointment',
    color: '#0F5B54'
  },
  {
    id: 'admin',
    label: 'Administrator',
    short: 'Admin',
    responsibility: 'Day-to-day operations under 42 CFR 484.105(b)',
    color: '#1E3A5F'
  },
  {
    id: 'don',
    label: 'Director of Nursing',
    short: 'DON',
    responsibility: 'Supervise all clinical practice',
    color: '#2D4A3E'
  },
  {
    id: 'co',
    label: 'Compliance Officer',
    short: 'CO',
    responsibility: 'Receive and investigate compliance reports; reports to Administrator AND Governing Body',
    color: '#C74601'
  }
];

const TF_STATEMENT = "The Compliance Officer reports only to the Administrator.";
const TF_CORRECT = false; // False — dual reporting

const SEQUENCE_STEPS = [
  { id: 's1', label: 'Stabilize the patient and ensure immediate safety' },
  { id: 's2', label: 'Contact the on-call DON or designated alternate' },
  { id: 's3', label: 'Document the action and notification objectively' },
  { id: 's4', label: 'Brief the regular supervisor on return' },
];
const CORRECT_SEQUENCE = ['s1', 's2', 's3', 's4'];

const AVAILABILITY_ANSWERS = ['administrator', 'admin', 'director of nursing', 'don', 'administrator and director of nursing', 'both'];

// Objective mapping for Scene 3
// 7 = Communication Pathways / map assembly
// 8 = Ready for Post-Test / all 4 practices
const practiceToObjective: Record<string, number> = {
  'map': 7,
  'match': 8,
  'tf': 8,
  'seq': 8,
  'input': 8,
  'connection': 7,
};

interface Props {
  onComplete?: () => void;
  priorScenesComplete?: boolean; // carry forward unlocked state from previous scenes
  currentObjective?: number;
  completedObjectives?: number[];
  onCompleteObjective?: () => void;
  onFocusArtifact?: (id: string, objId: number) => void;
  focusedArtifact?: string | null;
  isMuted?: boolean;
  onAddNote?: (obj: number, text: string) => void;
  onReset?: () => void;
  onToggleMute?: () => void;
  nextActionText?: string;
  progressPct?: number;
  narrationText?: string;
}

interface MatchState { [roleId: string]: string | null; }

export default function GAO002Scene03ReportingMap({
  onComplete,
  priorScenesComplete = true,
  currentObjective = 7,
  completedObjectives = [],
  onCompleteObjective,
  onFocusArtifact,
  onAddNote,
  onReset,
  onToggleMute,
  nextActionText = '',
  progressPct = 0
}: Props) {
  const SCENE3_KEY = 'gao002-scene3-progress';

  const [styleInjected, setStyleInjected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Map Assembly State (all nodes start glowing/unlocked — "completed reporting map")
  const [assembledConnections, setAssembledConnections] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).assembledConnections ?? ['gb-admin', 'admin-don', 'co-admin', 'co-gb'];
    } catch {}
    return ['gb-admin', 'admin-don', 'co-admin', 'co-gb'];
  });
  const CONNECTIONS = ['gb-admin', 'admin-don', 'co-admin', 'co-gb', 'flow-escalation'];

  // Practice 1: Click-to-Match (matching roles)
  const [matches, setMatches] = useState<MatchState>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).matches ?? {};
    } catch {}
    return {};
  });
  const [matchSelectedRole, setMatchSelectedRole] = useState<string | null>(null);
  const [matchComplete, setMatchComplete] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).matchComplete ?? false;
    } catch {}
    return false;
  });

  // Practice 2: TF Cards (true/false dual reporting)
  const [tfChoice, setTfChoice] = useState<boolean | null>(null);
  const [tfComplete, setTfComplete] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).tfComplete ?? false;
    } catch {}
    return false;
  });

  // Practice 3: Click-to-Sequence (drag-or-click sequence)
  const [seqOrder, setSeqOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).seqOrder ?? [];
    } catch {}
    return [];
  });
  const [seqComplete, setSeqComplete] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).seqComplete ?? false;
    } catch {}
    return false;
  });

  // Practice 4: Input (availability roles)
  const [inputValue, setInputValue] = useState('');
  const [inputComplete, setInputComplete] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE3_KEY);
      if (saved) return JSON.parse(saved).inputComplete ?? false;
    } catch {}
    return false;
  });
  const [inputFeedback, setInputFeedback] = useState<string | null>(null);

  // Narration tier (4-tier)
  const [activeNarrationTier, setActiveNarrationTier] = useState<number>(0);

  // Completion
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  // Derived

  const isPracticeAllowed = (key: string): boolean => {
    const target = practiceToObjective[key] || 7;
    return target === currentObjective || completedObjectives.includes(target);
  };

  const guardPractice = (key: string): boolean => {
    if (isPracticeAllowed(key)) return true;
    onFocusArtifact?.(key, practiceToObjective[key] || 7);
    return false;
  };
  const allConnectionsAssembled = CONNECTIONS.every(c => assembledConnections.includes(c));
  const allPracticesPassed = matchComplete && tfComplete && seqComplete && inputComplete;
  const canComplete = allPracticesPassed && (priorScenesComplete || assembledConnections.length >= 3);

  // Inject styles once
  useEffect(() => {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.innerHTML = brandStyles;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  // Persist scene 3 progress
  useEffect(() => {
    try {
      localStorage.setItem(SCENE3_KEY, JSON.stringify({
        assembledConnections,
        matches,
        matchComplete,
        tfComplete,
        seqOrder,
        seqComplete,
        inputComplete
      }));
    } catch {}
  }, [assembledConnections, matches, matchComplete, tfComplete, seqOrder, seqComplete, inputComplete]);

  // Audio helpers
  const toggleMute = () => {
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
  };

  const playTier = (tier: number) => {
    audio.playSoftClick();
    setActiveNarrationTier(tier);
    if (tier === 3) audio.playWarmChime();
    else if (tier === 1) audio.playLineHighlight();
    else audio.playClick();
  };

  // === ASSEMBLE THE MAP (click to light final connections) ===
  const toggleConnection = (conn: string) => {
    if (!guardPractice('map')) return;
    if (assembledConnections.includes(conn)) {
      // allow re-click to reinforce
      audio.playSoftClick();
      return;
    }
    audio.playLineHighlight();
    const next = [...assembledConnections, conn];
    setAssembledConnections(next);

    // If all assembled, advance narration tier
    if (CONNECTIONS.every(c => next.includes(c)) && activeNarrationTier < 1) {
      setTimeout(() => setActiveNarrationTier(1), 420);
    }
  };

  const resetMap = () => {
    audio.playClick();
    // Keep synthesis "completed" base state — do not fully reset to zero
    setAssembledConnections(['gb-admin', 'admin-don', 'co-admin', 'co-gb']);
  };

  // === PRACTICE 1: Click-to-Match ===
  const handleMatchRoleClick = (roleId: string) => {
    if (!guardPractice('match')) return;
    if (matchComplete) return;
    audio.playSoftClick();
    setMatchSelectedRole(roleId === matchSelectedRole ? null : roleId);
  };

  const handleMatchRespClick = (resp: string) => {
    if (!guardPractice('match')) return;
    if (matchComplete || !matchSelectedRole) return;
    audio.playClick();

    const newMatches = { ...matches, [matchSelectedRole]: resp };
    setMatches(newMatches);
    setMatchSelectedRole(null);

    // Check if fully correct
    const correct = ROLES.every(r => newMatches[r.id] === r.responsibility);
    if (correct && Object.keys(newMatches).length === ROLES.length) {
      setMatchComplete(true);
      audio.playChime();
      if (activeNarrationTier < 2) setActiveNarrationTier(2);
    }
  };

  const resetMatch = () => {
    audio.playClick();
    setMatches({});
    setMatchSelectedRole(null);
    setMatchComplete(false);
  };

  // === PRACTICE 2: TF Cards ===
  const handleTfSelect = (isTrue: boolean) => {
    if (tfComplete) return;
    audio.playSoftClick();
    setTfChoice(isTrue);

    const isCorrect = isTrue === TF_CORRECT;
    if (isCorrect) {
      setTimeout(() => {
        setTfComplete(true);
        audio.playChime();
      }, 320);
    } else {
      audio.playError();
      setTimeout(() => setTfChoice(null), 680);
    }
  };

  const resetTf = () => {
    audio.playClick();
    setTfChoice(null);
    setTfComplete(false);
  };

  // === PRACTICE 3: Click-to-Sequence (click order or reorder) ===
  const handleSeqClick = (stepId: string) => {
    if (seqComplete) return;

    if (seqOrder.includes(stepId)) {
      // remove to re-order
      const next = seqOrder.filter(id => id !== stepId);
      setSeqOrder(next);
      audio.playSoftClick();
      return;
    }

    const next = [...seqOrder, stepId];
    setSeqOrder(next);
    audio.playClick();

    if (next.length === SEQUENCE_STEPS.length) {
      const isCorrect = next.every((id, idx) => id === CORRECT_SEQUENCE[idx]);
      if (isCorrect) {
        setTimeout(() => {
          setSeqComplete(true);
          audio.playWarmChime();
        }, 260);
      } else {
        audio.playError();
        setTimeout(() => setSeqOrder([]), 720);
      }
    }
  };

  const resetSequence = () => {
    audio.playClick();
    setSeqOrder([]);
    setSeqComplete(false);
  };

  // === PRACTICE 4: Input (availability roles) ===
  const checkInput = () => {
    const val = inputValue.trim().toLowerCase();
    const isCorrect = AVAILABILITY_ANSWERS.some(a => val.includes(a) || val === a);

    if (isCorrect) {
      setInputComplete(true);
      setInputFeedback(null);
      audio.playChime();
      if (activeNarrationTier < 2) setActiveNarrationTier(2);
    } else {
      audio.playError();
      setInputFeedback("Try: Administrator, DON, or both (per 42 CFR 484.105).");
      setTimeout(() => setInputFeedback(null), 2400);
    }
  };

  const resetInput = () => {
    audio.playClick();
    setInputValue('');
    setInputComplete(false);
    setInputFeedback(null);
  };

  // Elegant completion gate
  useEffect(() => {
    if (canComplete && !showCompleteOverlay) {
      // soft delay for celebration feel
      const t = setTimeout(() => {
        setShowCompleteOverlay(true);
        audio.playWarmChime();
        onAddNote?.(8, 'All reporting lines and practices mastered. Ready for post-test.');
        if (onCompleteObjective) onCompleteObjective();
        if (onComplete) {
          // defer to allow overlay render + tasteful moment
          setTimeout(() => onComplete(), 780);
        }
      }, 520);
      return () => clearTimeout(t);
    }
  }, [canComplete, showCompleteOverlay, onComplete, onCompleteObjective, onAddNote]);

  const handleResetAll = () => {
    audio.playChime();
    setAssembledConnections(['gb-admin', 'admin-don', 'co-admin', 'co-gb']);
    setMatches({}); setMatchSelectedRole(null); setMatchComplete(false);
    setTfChoice(null); setTfComplete(false);
    setSeqOrder([]); setSeqComplete(false);
    setInputValue(''); setInputComplete(false); setInputFeedback(null);
    setActiveNarrationTier(0);
    setShowCompleteOverlay(false);
  };

  const tierLabels = [
    'Scene Start — Map from prior scenes',
    'Assemble Connections — Full reporting lines',
    'Practice Feedback — Mirror finalTest judgment',
    'Synthesis Complete — Reporting Lines Practice Complete'
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative rounded-2xl border border-[#E5E4E3] font-sans">
      {/* Premium Header (CoreValues pattern) */}
      <div className="px-5 py-3.5 border-b border-[#E5E4E3] bg-white flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#C74601]" />
              <h2 className="text-lg font-semibold text-[#007970]">Reporting Lines — Readiness &amp; Synthesis</h2>
            </div>
            <p className="text-xs text-[#3D3D3A] mt-0.5">GAO-002 Scene 3 • Assemble the completed map + practice the four final test types</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-[#E5FEFF] border-[#C4F4F5] text-[#007970] font-bold">
            <Award className="w-3.5 h-3.5" />
            {allPracticesPassed ? '4/4' : `${[matchComplete, tfComplete, seqComplete, inputComplete].filter(Boolean).length}/4`} Practices
          </div>

          {priorScenesComplete && (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[10px] tracking-widest">PRIOR SCENES ✓</div>
          )}

          <button onClick={toggleMute} className={`p-1.5 rounded-lg border transition ${isMuted ? 'bg-rose-100 border-rose-200' : 'bg-white hover:bg-[#E5FEFF] border-[#C4F4F5]'}`} title="Toggle sound">
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleResetAll} className="p-1.5 rounded-lg border border-[#C4F4F5] bg-white hover:bg-[#E5FEFF] text-[#007970]" title="Reset practice">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4-Tier Narration Bar */}
      <div className="px-5 py-2 bg-[#FAFBF8] border-b border-[#E5E4E3] flex items-center gap-2 text-[10px] font-semibold tracking-[0.5px] text-[#524C4B] shrink-0">
        <span className="uppercase mr-1 text-[#3D3D3A]">4-TIER NARRATION</span>
        {[0,1,2,3].map(t => (
          <button
            key={t}
            onClick={() => playTier(t)}
            className={`px-2.5 py-0.5 rounded-full border transition ${activeNarrationTier === t ? 'bg-[#007970] text-white border-[#007970]' : 'hover:bg-white border-[#C4F4F5]'}`}
          >
            {t + 1}. {['START','ASSEMBLE','FEEDBACK','COMPLETE'][t]}
          </button>
        ))}
        <span className="ml-auto text-[#94A3B8] font-normal normal-case tracking-normal">{tierLabels[activeNarrationTier]}</span>
      </div>

      {/* FULL-SVG COMPLETED REPORTING MAP — "Assemble the Map" */}
      <div className="relative bg-[#FDF8F3] p-5 border-b border-[#E5E4E3]">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[1px] text-[#C74601]">COMPLETED REPORTING MAP</div>
            <div className="text-sm text-[#2D3748] font-semibold">All nodes glowing • Click lines to light final connections</div>
          </div>
          <div className="text-xs font-mono px-2 py-0.5 rounded bg-white border text-[#007970]">
            {assembledConnections.length}/{CONNECTIONS.length} CONNECTED
          </div>
        </div>

        {/* Premium Full SVG Map — modeled exactly on scene-04-values + CoreValues polish */}
        <svg
          viewBox="0 0 1000 420"
          className="w-full h-auto max-h-[268px] rounded-xl bg-white border border-[#E5E4E3] shadow-inner"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="mapBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8F1E9" />
              <stop offset="100%" stopColor="#F1E9DE" />
            </linearGradient>
            <linearGradient id="nodeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F8FAFC" />
            </linearGradient>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F5B54" floodOpacity="0.18" />
            </filter>
            <filter id="coralGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="4" floodColor="#C74601" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Warm office background plane */}
          <rect width="1000" height="420" fill="url(#mapBg)" rx="12" />
          <rect x="40" y="38" width="920" height="344" fill="#F8F1E9" rx="8" opacity="0.6" />

          {/* Subtle desk / credenza base */}
          <rect x="120" y="340" width="760" height="38" rx="6" fill="#A57153" opacity="0.65" />
          <rect x="120" y="338" width="760" height="8" rx="3" fill="#C49A76" opacity="0.7" />

          {/* === NODES (all glowing/unlocked from start) === */}
          {/* Governing Body — top center */}
          <g transform="translate(500, 92)">
            <rect x="-92" y="-32" width="184" height="64" rx="12" fill="url(#nodeGrad)" stroke="#0F5B54" strokeWidth="2.5" filter="url(#nodeGlow)" className="map-node-glow" />
            <circle cx="-68" cy="0" r="15" fill="#0F5B54" />
            <text x="-68" y="4" fontSize="13" fill="#fff" textAnchor="middle" fontWeight="700">GB</text>
            <text x="8" y="-4" fontSize="14" fill="#0F5B54" fontWeight="700">GOVERNING BODY</text>
            <text x="8" y="16" fontSize="9.5" fill="#524C4B">Final authority • 484.105(a)</text>
          </g>

          {/* Administrator */}
          <g transform="translate(320, 218)">
            <rect x="-86" y="-28" width="172" height="56" rx="11" fill="url(#nodeGrad)" stroke="#1E3A5F" strokeWidth="2.5" filter="url(#nodeGlow)" className="map-node-glow" />
            <circle cx="-62" cy="0" r="14" fill="#1E3A5F" />
            <text x="-62" y="4" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">A</text>
            <text x="6" y="-3" fontSize="13" fill="#1E3A5F" fontWeight="700">ADMINISTRATOR</text>
            <text x="6" y="15" fontSize="9" fill="#524C4B">Day-to-day ops • 484.105(b)</text>
          </g>

          {/* Director of Nursing */}
          <g transform="translate(680, 218)">
            <rect x="-86" y="-28" width="172" height="56" rx="11" fill="url(#nodeGrad)" stroke="#2D4A3E" strokeWidth="2.5" filter="url(#nodeGlow)" className="map-node-glow" />
            <circle cx="-62" cy="0" r="14" fill="#2D4A3E" />
            <text x="-62" y="4" fontSize="11" fill="#fff" textAnchor="middle" fontWeight="700">DON</text>
            <text x="6" y="-3" fontSize="13" fill="#2D4A3E" fontWeight="700">DIRECTOR OF NURSING</text>
            <text x="6" y="15" fontSize="9" fill="#524C4B">Supervise clinical • 484.105(c)</text>
          </g>

          {/* Compliance Officer — dual reporting emphasis, coral accent */}
          <g transform="translate(500, 310)">
            <rect x="-98" y="-30" width="196" height="60" rx="12" fill="#FEF4EF" stroke="#C74601" strokeWidth="3" filter="url(#coralGlow)" className="map-node-glow" />
            <circle cx="-72" cy="0" r="15" fill="#C74601" />
            <text x="-72" y="4" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">CO</text>
            <text x="8" y="-5" fontSize="13" fill="#C74601" fontWeight="700">COMPLIANCE OFFICER</text>
            <text x="8" y="14" fontSize="9" fill="#7F3F1F">Dual line • Admin + Governing Body</text>
          </g>

          {/* === CONNECTION LINES (click to assemble / light up) === */}
          {/* GB → Admin */}
          <g onClick={() => toggleConnection('gb-admin')} style={{cursor:'pointer'}}>
            <path d="M 420 128 Q 380 168 340 195" fill="none" stroke={assembledConnections.includes('gb-admin') ? '#C74601' : '#94A3B8'} strokeWidth={assembledConnections.includes('gb-admin') ? 3.5 : 2} strokeDasharray={assembledConnections.includes('gb-admin') ? '0' : '6 4'} className={assembledConnections.includes('gb-admin') ? 'assemble-line active' : 'assemble-line'} />
            <circle cx="370" cy="150" r="7" fill={assembledConnections.includes('gb-admin') ? '#C74601' : '#CBD5E1'} stroke="#fff" strokeWidth="1.5" />
          </g>

          {/* Admin → DON */}
          <g onClick={() => toggleConnection('admin-don')} style={{cursor:'pointer'}}>
            <path d="M 410 230 Q 530 232 600 230" fill="none" stroke={assembledConnections.includes('admin-don') ? '#C74601' : '#94A3B8'} strokeWidth={assembledConnections.includes('admin-don') ? 3.5 : 2} strokeDasharray={assembledConnections.includes('admin-don') ? '0' : '6 4'} className={assembledConnections.includes('admin-don') ? 'assemble-line active' : 'assemble-line'} />
            <circle cx="510" cy="230" r="7" fill={assembledConnections.includes('admin-don') ? '#C74601' : '#CBD5E1'} stroke="#fff" strokeWidth="1.5" />
          </g>

          {/* CO → Admin (dual) */}
          <g onClick={() => toggleConnection('co-admin')} style={{cursor:'pointer'}}>
            <path d="M 420 292 Q 360 258 330 240" fill="none" stroke={assembledConnections.includes('co-admin') ? '#C74601' : '#94A3B8'} strokeWidth={assembledConnections.includes('co-admin') ? 3.5 : 2.5} strokeDasharray="3 3" className={assembledConnections.includes('co-admin') ? 'assemble-line active' : 'assemble-line'} />
            <circle cx="370" cy="265" r="6" fill={assembledConnections.includes('co-admin') ? '#C74601' : '#CBD5E1'} />
          </g>

          {/* CO → GB (dual) */}
          <g onClick={() => toggleConnection('co-gb')} style={{cursor:'pointer'}}>
            <path d="M 500 280 Q 500 175 500 130" fill="none" stroke={assembledConnections.includes('co-gb') ? '#C74601' : '#94A3B8'} strokeWidth={assembledConnections.includes('co-gb') ? 3.5 : 2.5} strokeDasharray="3 3" className={assembledConnections.includes('co-gb') ? 'assemble-line active' : 'assemble-line'} />
            <circle cx="500" cy="205" r="6" fill={assembledConnections.includes('co-gb') ? '#C74601' : '#CBD5E1'} />
          </g>

          {/* Flow / Escalation line hint */}
          <g onClick={() => toggleConnection('flow-escalation')} style={{cursor:'pointer'}}>
            <path d="M 590 295 Q 710 265 760 240" fill="none" stroke={assembledConnections.includes('flow-escalation') ? '#0F5B54' : '#94A3B8'} strokeWidth={assembledConnections.includes('flow-escalation') ? 2.5 : 1.5} strokeDasharray="4 3" className={assembledConnections.includes('flow-escalation') ? 'assemble-line active' : 'assemble-line'} />
            <text x="695" y="258" fontSize="8" fill="#0F5B54" fontWeight="600">ESCALATION FLOW</text>
          </g>

          {/* Legend / labels */}
          <g>
            <rect x="48" y="52" width="148" height="28" rx="5" fill="#fff" stroke="#E5E4E3" />
            <text x="62" y="70" fontSize="9" fill="#524C4B">Dual reporting = coral dashed</text>
          </g>
          <text x="820" y="62" fontSize="9" fill="#64748B" fontWeight="500">Click any line to assemble</text>

          {/* === EMBEDDED UI inside the image - big obvious guidance === */}
          <g transform="translate(25, 20)">
            <rect x="0" y="0" width="400" height="82" rx="8" fill="#0F5B54" stroke="#C74601" strokeWidth="3" />
            <text x="14" y="20" fontSize="10" fill="#C9B38A" fontFamily="Inter, system-ui" fontWeight="700">OBJECTIVE {currentObjective}/8 — YOUR TASK:</text>
            <text x="14" y="40" fontSize="15" fill="#FDF8F3" fontFamily="Inter, system-ui" fontWeight="700">{nextActionText}</text>
            <text x="14" y="60" fontSize="11" fill="#FAD9C5" fontFamily="Inter, system-ui">Only interact with the items for this objective</text>
            <text x="14" y="76" fontSize="9" fill="#A8D5D3" fontFamily="Inter, system-ui">{progressPct}% complete</text>
          </g>

          <g transform="translate(920, 380)">
            <g onClick={() => onToggleMute && onToggleMute()} style={{cursor:'pointer'}}>
              <rect x="0" y="0" width="48" height="22" rx="3" fill="#2C2520" />
              <text x="6" y="15" fontSize="7" fill="#C9B38A">SOUND</text>
            </g>
            <g onClick={() => onReset && onReset()} style={{cursor:'pointer'}} transform="translate(55,0)">
              <rect x="0" y="0" width="48" height="22" rx="3" fill="#2C2520" />
              <text x="6" y="15" fontSize="7" fill="#C9B38A">RESET</text>
            </g>
          </g>
        </svg>

        <div className="mt-2 flex gap-2 text-[10px] text-[#64748B]">
          <button onClick={resetMap} className="underline hover:text-[#007970]">Reset highlights (keep nodes unlocked)</button>
          <span>• All prior L1/L2 nodes carried forward as glowing</span>
        </div>
      </div>

      {/* INTERACTIVE PRACTICE BOARDS — 4 finalTest types, beautiful visual form */}
      <div className="flex-1 overflow-auto p-5 bg-white space-y-6">
        <div>
          <div className="uppercase tracking-[1.5px] text-[10px] font-bold text-[#C74601] mb-1">FINAL PRACTICE ROUNDS</div>
          <div className="text-sm text-[#2D3748]">Mirror the four question types from the final test — engaging, low-stakes visual practice.</div>
        </div>

        {/* 1. Click-to-Match */}
        <div className={`practice-board rounded-2xl border-2 p-5 ${matchComplete ? 'complete border-[#007970]' : 'border-[#E5E4E3]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#0F5B54] flex items-center gap-2">
              1. CLICK-TO-MATCH <span className="text-xs font-normal text-[#64748B]">— Role ↔ Responsibility (from finalTest-Q1)</span>
            </div>
            {matchComplete && <CheckCircle2 className="w-5 h-5 text-[#007970] practice-check" />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Roles */}
            <div>
              <div className="text-xs uppercase tracking-widest text-[#3D3D3A] mb-1.5">ROLES</div>
              <div className="space-y-1.5">
                {ROLES.map(r => {
                  const isSel = matchSelectedRole === r.id;
                  const isDone = !!matches[r.id];
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleMatchRoleClick(r.id)}
                      disabled={matchComplete || isDone}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition ${isSel ? 'border-[#C74601] bg-[#FEF4EF]' : isDone ? 'border-[#007970] bg-[#E5FEFF] opacity-80' : 'border-[#E2E8F0] hover:border-[#007970]/40'}`}
                    >
                      <div className="text-xs font-bold w-8 text-[#C74601]">{r.short}</div>
                      <div className="text-sm font-medium text-[#2D3748]">{r.label}</div>
                      {isDone && <Check className="ml-auto w-4 h-4 text-[#007970]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Responsibilities (click to match) */}
            <div>
              <div className="text-xs uppercase tracking-widest text-[#3D3D3A] mb-1.5">RESPONSIBILITIES — click to pair</div>
              <div className="space-y-1.5">
                {ROLES.map(r => {
                  const matchedBy = Object.entries(matches).find(([, resp]) => resp === r.responsibility)?.[0];
                  const isMatched = !!matchedBy;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleMatchRespClick(r.responsibility)}
                      disabled={matchComplete || !matchSelectedRole || isMatched}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm transition ${matchSelectedRole ? 'hover:bg-[#E5FEFF] border-[#C4F4F5]' : 'border-[#E2E8F0]'} ${isMatched ? 'border-[#007970] bg-[#E5FEFF]' : ''}`}
                    >
                      {r.responsibility}
                      {isMatched && <span className="ml-2 text-[10px] text-[#007970]">({ROLES.find(ro => ro.id === matchedBy)?.short})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {matchComplete && <div className="mt-3 text-xs text-emerald-700 font-medium">Matched correctly. Surveyors expect you to recall these from memory.</div>}
          {!matchComplete && Object.keys(matches).length > 0 && (
            <button onClick={resetMatch} className="mt-2 text-xs underline text-[#64748B]">Clear matches</button>
          )}
        </div>

        {/* 2. TF Cards */}
        <div className={`practice-board rounded-2xl border-2 p-5 ${tfComplete ? 'complete border-[#007970]' : 'border-[#E5E4E3]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#0F5B54] flex items-center gap-2">
              2. TRUE / FALSE CARDS <span className="text-xs font-normal text-[#64748B]">— Dual Reporting (finalTest-Q2)</span>
            </div>
            {tfComplete && <CheckCircle2 className="w-5 h-5 text-[#007970] practice-check" />}
          </div>

          <div className="text-sm mb-4 text-[#2D3748] font-medium">“{TF_STATEMENT}”</div>

          <div className="grid grid-cols-2 gap-4">
            {[{val: true, label: 'TRUE'}, {val: false, label: 'FALSE'}].map(({val, label}) => {
              const selected = tfChoice === val;
              const isCorrectChoice = val === TF_CORRECT;
              let cls = 'tf-card border-2 border-[#E2E8F0] bg-white p-5 rounded-2xl text-center font-semibold text-lg';
              if (selected && tfComplete && isCorrectChoice) cls += ' correct';
              if (selected && tfComplete && !isCorrectChoice) cls += ' incorrect';
              if (selected && !tfComplete) cls += ' selected border-[#C74601]';
              return (
                <button key={label} disabled={tfComplete} onClick={() => handleTfSelect(val)}
                  className={cls}>
                  {label}
                  {selected && tfComplete && (
                    <div className="mt-2 text-xs font-normal tracking-normal text-[#007970]">
                      {isCorrectChoice ? 'Correct — dual reporting to Admin + Governing Body protects compliance.' : 'Incorrect. The CO reports to both.'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {tfComplete && <div className="text-xs mt-2 text-[#007970]">Dual reporting is OIG-mandated so issues cannot be suppressed.</div>}
          {!tfComplete && tfChoice !== null && <button onClick={resetTf} className="text-xs underline mt-2 text-[#64748B]">Try again</button>}
        </div>

        {/* 3. Drag-or-Click Sequence */}
        <div className={`practice-board rounded-2xl border-2 p-5 ${seqComplete ? 'complete border-[#007970]' : 'border-[#E5E4E3]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#0F5B54] flex items-center gap-2">
              3. CLICK-TO-SEQUENCE <span className="text-xs font-normal text-[#64748B]">— Escalation when supervisor unavailable (finalTest-Q3)</span>
            </div>
            {seqComplete && <CheckCircle2 className="w-5 h-5 text-[#007970] practice-check" />}
          </div>

          <div className="text-xs text-[#64748B] mb-2">Click steps in the correct order (or tap to remove). Patient safety always leads.</div>

          <div className="flex flex-wrap gap-2 mb-3">
            {SEQUENCE_STEPS.map((step) => {
              const pos = seqOrder.indexOf(step.id);
              const locked = pos !== -1;
              return (
                <button
                  key={step.id}
                  onClick={() => handleSeqClick(step.id)}
                  className={`seq-step px-4 py-2.5 rounded-xl border text-sm text-left flex-1 min-w-[220px] ${locked ? 'locked bg-[#F0FDFA] border-[#007970]' : 'border-[#E2E8F0] hover:border-[#C74601]'}`}
                >
                  <span className="font-mono text-xs mr-2 text-[#C74601]">{locked ? (pos + 1) : '•'}</span>
                  {step.label}
                </button>
              );
            })}
          </div>

          {seqOrder.length > 0 && !seqComplete && (
            <div className="text-xs">Current order: {seqOrder.map((id) => SEQUENCE_STEPS.find(s => s.id === id)!.label.slice(0,22)+'…').join(' → ')}</div>
          )}
          {seqComplete && <div className="text-xs text-emerald-700 font-medium mt-1">Correct order. Safety → DON/alternate → document → brief supervisor.</div>}
          {!seqComplete && seqOrder.length > 0 && <button onClick={resetSequence} className="mt-1 text-xs underline text-[#64748B]">Clear sequence</button>}
        </div>

        {/* 4. Structured Input */}
        <div className={`practice-board rounded-2xl border-2 p-5 ${inputComplete ? 'complete border-[#007970]' : 'border-[#E5E4E3]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[#0F5B54] flex items-center gap-2">
              4. AVAILABILITY INPUT <span className="text-xs font-normal text-[#64748B]">— Who must always be available + designate alternate (finalTest-Q4 + L1/L2)</span>
            </div>
            {inputComplete && <CheckCircle2 className="w-5 h-5 text-[#007970] practice-check" />}
          </div>

          <div className="text-sm mb-2">Name the role(s) required to be available during all operating hours and to designate a qualified alternate when absent.</div>

          <div className="flex gap-2">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={inputComplete}
              placeholder="Administrator or Director of Nursing (DON)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:border-[#007970] text-sm outline-none"
              onKeyDown={e => { if (e.key === 'Enter' && !inputComplete) checkInput(); }}
            />
            {!inputComplete ? (
              <button onClick={checkInput} className="px-6 rounded-xl bg-[#007970] text-white font-semibold text-sm">CHECK</button>
            ) : (
              <div className="px-5 flex items-center text-emerald-700 font-bold text-sm">CORRECT</div>
            )}
          </div>
          {inputFeedback && <div className="text-xs text-rose-600 mt-1.5">{inputFeedback}</div>}
          {inputComplete && <div className="text-xs text-[#007970] mt-1">Both Administrator and DON per 42 CFR 484.105(b)(c). Screenshot the roster every Friday.</div>}
          {inputValue && !inputComplete && <button onClick={resetInput} className="text-xs underline mt-2 text-[#64748B]">Clear</button>}
        </div>

        {/* Status footer */}
        <div className="pt-2 text-xs flex items-center gap-3 text-[#64748B]">
          <div>Map assembled: <span className={allConnectionsAssembled ? 'text-emerald-600 font-semibold' : ''}>{allConnectionsAssembled ? '✓' : 'in progress'}</span></div>
          <div>Practices: {allPracticesPassed ? '✓ PASSED' : 'complete all four'}</div>
          <div>Prior scenes: {priorScenesComplete ? '✓' : 'pending'}</div>
          <button onClick={handleResetAll} className="ml-auto underline">Reset entire scene</button>
        </div>
      </div>

      {/* Elegant Completion Overlay — "Reporting Lines Practice Complete" */}
      {showCompleteOverlay && (
        <div className="absolute inset-0 bg-[#007970]/90 backdrop-blur-md z-40 flex items-center justify-center p-6 animate-pop-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-[#E5FEFF] text-center max-w-md soft-pop">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-[#E5FEFF] flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-[#007970]" />
            </div>
            <h3 className="text-2xl font-semibold text-[#007970] tracking-tight mb-2">Reporting Lines Practice Complete</h3>
            <p className="text-sm text-[#524C4B] leading-relaxed mb-5">
              You have assembled the full map and practiced matching roles, dual reporting, escalation sequencing, and availability requirements.
              Ready for the final test.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[1.5px] bg-[#007970] text-white px-6 py-2 rounded-lg mb-4">
              REPORTING LINES PRACTICE COMPLETE
            </div>

            <div className="text-[11px] text-[#64748B]">Prior scenes carried forward • All nodes unlocked • All lines connected</div>

            <button onClick={handleResetAll} className="block mx-auto mt-6 text-xs text-[#007970] underline">Restart practice</button>
          </div>
        </div>
      )}
    </div>
  );
}
