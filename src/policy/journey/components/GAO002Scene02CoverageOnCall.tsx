import { useState, useEffect } from 'react';

// Soft self-contained audio synthesizer (tasteful, low-volume ambient)
// Benchmarks: InteractiveAudioSynth + SoftAudio in GAO-001 scenes
class SoftAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getCtx(): AudioContext | null {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this.muted = m; }

  play(type: 'click' | 'chime' | 'error' | 'ring' | 'tick' | 'unlock' | 'success') {
    if (this.muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.type = 'sine';
      o.frequency.value = 880;
      f.type = 'lowpass';
      f.frequency.value = 1400;
      g.gain.value = 0.035;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.09);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.12);
    }

    if (type === 'chime') {
      const notes = [659.25, 783.99, 987.77];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.0;
        g.gain.linearRampToValueAtTime(0.045, now + 0.02 + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.0005, now + 0.9 + i * 0.06);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.06);
        o.stop(now + 1.1 + i * 0.06);
      });
    }

    if (type === 'error') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 210;
      g.gain.value = 0.04;
      g.gain.exponentialRampToValueAtTime(0.0005, now + 0.28);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.32);
    }

    if (type === 'ring') {
      // Subtle phone ring pulse (tasteful, not harsh)
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const f = ctx.createBiquadFilter();
      o.type = 'sine';
      o.frequency.value = 1240;
      f.type = 'bandpass';
      f.frequency.value = 1240;
      f.Q.value = 4.5;
      g.gain.value = 0.028;
      g.gain.exponentialRampToValueAtTime(0.0008, now + 0.65);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.72);
    }

    if (type === 'tick') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1180;
      g.gain.value = 0.018;
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.06);
    }

    if (type === 'unlock') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 520;
      g.gain.value = 0.03;
      g.gain.linearRampToValueAtTime(0.06, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.72);
    }

    if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.0;
        g.gain.linearRampToValueAtTime(0.055, now + i * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 1.1 + i * 0.09);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.09);
        o.stop(now + 1.35 + i * 0.09);
      });
    }
  }
}

const audio = new SoftAudio();

const brandStyles = `
  @keyframes rosterPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .roster-pulse { animation: rosterPulse 2.2s ease-in-out infinite; }

  @keyframes phoneRing {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    15%, 45% { transform: scale(1.08); opacity: 1; }
    30% { transform: scale(1.03); }
  }
  .phone-ring { animation: phoneRing 1.65s ease-in-out infinite; }

  @keyframes clockTick {
    to { transform: rotate(360deg); }
  }
  .clock-hand { animation: clockTick 4s linear infinite; transform-origin: 50% 50%; }

  @keyframes elegantArrow {
    0% { stroke-dashoffset: 18; }
    100% { stroke-dashoffset: 0; }
  }
  .elegant-flow { stroke-dasharray: 6 4; animation: elegantArrow 1.8s linear infinite; }

  @keyframes softGlow {
    0%, 100% { filter: drop-shadow(0 0 3px rgba(199, 70, 1, 0.35)); }
    50% { filter: drop-shadow(0 0 8px rgba(199, 70, 1, 0.55)); }
  }
  .hotspot-glow { animation: softGlow 2s ease-in-out infinite; }

  @keyframes vignetteNight {
    0%, 100% { opacity: 0.92; }
    50% { opacity: 1; }
  }

  .coverage-hotspot {
    cursor: pointer;
    transition: all 0.12s cubic-bezier(0.2, 0, 0, 1);
  }
  .coverage-hotspot:hover {
    filter: brightness(1.12) drop-shadow(0 1px 4px rgba(15, 59, 84, 0.35));
  }
  .coverage-hotspot:focus-visible {
    outline: 3px solid #C74601;
    outline-offset: 2px;
  }

  .navy-pill {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.6px;
  }

  .roster-line {
    transition: all 0.1s ease;
  }
  .roster-line:hover {
    fill: #0F3A4A;
  }

  .decision-card {
    transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  }
  .decision-card:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(15, 59, 84, 0.12);
  }

  .feedback-panel {
    animation: 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards popInFeedback;
  }
  @keyframes popInFeedback {
    from { opacity: 0; transform: translateY(8px) scale(0.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .tier-btn {
    transition: all 0.1s ease;
  }
  .tier-btn.active {
    background: #0F5B54;
    color: #FDF8F3;
    border-color: #0F5B54;
  }
`;

// Exact data fidelity from trainingContent.gao... L2
const HIERARCHY = [
  { id: 'clinician', label: 'Primary On-Call Clinician', sub: 'First call for clinical guidance', role: 'LVN / RN (field)' },
  { id: 'don', label: 'On-Call DON', sub: 'Clinical escalation & oversight', role: 'Director of Nursing (or designated alternate)' },
  { id: 'admin', label: 'On-Call Administrator', sub: 'Next-morning summary & compliance log', role: 'Administrator (or designated alternate)' },
];

const ROSTER_ENTRIES = [
  { id: 'clinician-roster', role: 'Primary On-Call Clinician', name: 'Taylor Kim, LVN', phone: '(555) 0142', note: 'Week of July 6 • Primary field contact' },
  { id: 'don-roster', role: 'On-Call DON', name: 'Elena Vargas, RN', phone: '(555) 0199', note: 'Designated alternate: Morgan Ellis, RN' },
  { id: 'admin-roster', role: 'On-Call Administrator', name: 'Jordan Hale', phone: '(555) 0101', note: 'Receives compliance summary next morning' },
];

const FIELD_VIGNETTE_TIERS = [
  '22:00 — HHA calls: "Patient unresponsive at home visit."',
  'You (on-call LVN): "Call 911 immediately. Stay on scene. Do not move the patient."',
  'You contact on-call DON per roster. Document every attempt + decision in EMR in real time.',
  'Next morning: On-call Administrator receives summary via compliance log. Chain complete.',
];

const CHALLENGE_OPTIONS = [
  { id: 'a', label: 'The Administrator at home.', isCorrect: false, feedback: 'The Administrator is not the clinical first call.' },
  { id: 'b', label: 'The on-call clinician per the posted roster.', isCorrect: true, feedback: 'Correct. Clinical questions go to the on-call clinician first.' },
  { id: 'c', label: 'Wait until Monday.', isCorrect: false, feedback: 'Delay on a possible adverse event is unacceptable.' },
  { id: 'd', label: 'Call 911 regardless of severity.', isCorrect: false, feedback: 'Escalate clinically first; 911 is for emergencies that exceed home health response.' },
];

const FEEDBACK_CORRECT = 'On-call clinician is the first call for clinical guidance; the DON and Administrator escalate from there.';
const FEEDBACK_INCORRECT = 'Skipping the clinical on-call breaks the chain of supervision required by 42 CFR 484.105.';
const COMPLIANCE_IMPACT = 'Inability to identify the on-call structure is a workforce-knowledge survey finding.';
const REAL_WORLD = 'Delayed escalation of adverse drug events has caused preventable hospitalizations and complaint surveys.';
const CORRECT_GUIDANCE = 'Carry the weekly on-call roster on your phone. Escalate in order. Document every call.';

const NARRATION_TIERS = [
  {
    tier: 1,
    title: 'Coverage Hierarchy',
    text: 'On-call hierarchy: primary on-call clinician, on-call DON, on-call Administrator. The roster is posted weekly in the EMR and texted to all field staff. Outdated rosters trigger a survey finding.',
  },
  {
    tier: 2,
    title: 'Designated Alternates',
    text: 'When the Administrator or DON is absent more than one business day, a qualified alternate is designated in writing and the workforce is notified. Alternates must meet the qualification standards in HR-JD-001 and HR-JD-002.',
  },
  {
    tier: 3,
    title: 'Field Example: 10 PM Escalation',
    text: 'You are the on-call LVN and receive a call at 10 PM from an HHA who finds a patient unresponsive. You direct the HHA to call 911 and stay on scene, then you reach the on-call DON. Per GV-OG-001 you document every call attempt and decision in real time in the EMR while coordinating.',
  },
  {
    tier: 4,
    title: 'Practical Tip + Challenge',
    text: 'Before leaving Friday, screenshot the roster to your phone. Saturday 21:00 adverse event? Call the on-call clinician first per the posted roster. The DON and Administrator are next in the documented chain.',
  },
];

// Objective mapping for Scene 2 (5 = structure/roster/hierarchy, 6 = vignette + decision)
const actionToObjective: Record<string, number> = {
  'roster': 5,
  'hierarchy': 5,
  'screenshot': 5,
  'vignette': 6,
  'decision': 6,
};

interface Props {
  onComplete?: () => void;
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

export default function GAO002Scene02CoverageOnCall({
  onComplete,
  currentObjective = 5,
  completedObjectives = [],
  onCompleteObjective,
  onFocusArtifact,
  onAddNote,
  onReset,
  onToggleMute,
  nextActionText = '',
  progressPct = 0
}: Props) {
  const SCENE2_KEY = 'gao002-scene2-progress';

  const [styleInjected, setStyleInjected] = useState(false);
  const [explored, setExplored] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SCENE2_KEY);
      if (saved) return JSON.parse(saved).explored ?? [];
    } catch {}
    return [];
  });
  const [activeRosterId, setActiveRosterId] = useState<string | null>(null);
  const [vignettePhase, setVignettePhase] = useState(0);
  const [screenshotSaved, setScreenshotSaved] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE2_KEY);
      if (saved) return JSON.parse(saved).screenshotSaved ?? false;
    } catch {}
    return false;
  });
  const [hierarchyHighlight, setHierarchyHighlight] = useState<string | null>(null);

  // Decision / Challenge state
  const [decisionUnlocked, setDecisionUnlocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE2_KEY);
      if (saved) return JSON.parse(saved).decisionUnlocked ?? false;
    } catch {}
    return false;
  });
  const [decisionChoice, setDecisionChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrectDecision, setIsCorrectDecision] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE2_KEY);
      if (saved) return JSON.parse(saved).isCorrectDecision ?? false;
    } catch {}
    return false;
  });

  // Narration tiers
  const [activeNarrationTier, setActiveNarrationTier] = useState<number>(1);
  const [revealedTiers, setRevealedTiers] = useState<number[]>([1]);

  const [isMuted, setIsMuted] = useState(false);
  const [ringing, setRinging] = useState(false);

  // Inject styles once
  useEffect(() => {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.innerHTML = brandStyles;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  // Persist scene 2 progress
  useEffect(() => {
    try {
      localStorage.setItem(SCENE2_KEY, JSON.stringify({ explored, screenshotSaved, decisionUnlocked, isCorrectDecision }));
    } catch {}
  }, [explored, screenshotSaved, decisionUnlocked, isCorrectDecision]);

  // Ambient subtle clock tick + occasional ring hint (tasteful)
  useEffect(() => {
    let tickInterval: number;
    let ringTimeout: number;

    if (!isMuted) {
      tickInterval = window.setInterval(() => {
        if (!decisionUnlocked) {
          audio.play('tick');
        }
      }, 4200);

      // Very occasional soft ring pulse when vignette not active
      ringTimeout = window.setTimeout(() => {
        if (!ringing && vignettePhase === 0 && !decisionUnlocked) {
          setRinging(true);
          audio.play('ring');
          setTimeout(() => setRinging(false), 1100);
        }
      }, 14500);
    }

    return () => {
      clearInterval(tickInterval);
      clearTimeout(ringTimeout);
    };
  }, [isMuted, ringing, vignettePhase, decisionUnlocked]);

  const totalExplorable = 6; // 3 roster + hierarchy (as group) + screenshot + vignette
  const progress = Math.min(explored.length + (screenshotSaved ? 1 : 0) + (vignettePhase > 0 ? 1 : 0), totalExplorable);
  const isFullyExplored = progress >= totalExplorable;

  // Unlock decision when sufficient exploration + at least one narration tier + vignette started
  useEffect(() => {
    const canUnlock = explored.length >= 4 && vignettePhase >= 1 && revealedTiers.length >= 2 && !decisionUnlocked;
    if (canUnlock) {
      setDecisionUnlocked(true);
      audio.play('unlock');
    }
  }, [explored.length, vignettePhase, revealedTiers.length, decisionUnlocked]);

  // Completion when correct decision + explored
  useEffect(() => {
    if (isCorrectDecision && isFullyExplored && onComplete) {
      const t = setTimeout(() => {
        console.info('[GAO-002 Scene 2] visual_scene_completed');
        onAddNote?.(6, 'On-call escalation correct. Roster screenshot habit noted.');
        if (onCompleteObjective) onCompleteObjective();
        onComplete();
      }, 850);
      return () => clearTimeout(t);
    }
  }, [isCorrectDecision, isFullyExplored, onComplete, onCompleteObjective, onAddNote]);

  const markExplored = (id: string) => {
    if (!explored.includes(id)) {
      const next = [...explored, id];
      setExplored(next);
      audio.play('click');
    }
  };

  const isActionAllowed = (actionId: string): boolean => {
    const target = actionToObjective[actionId] || 5;
    return target === currentObjective || completedObjectives.includes(target);
  };

  const guardAction = (actionId: string): boolean => {
    if (isActionAllowed(actionId)) return true;
    onFocusArtifact?.(actionId, actionToObjective[actionId] || 5);
    return false;
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
  };

  const resetAll = () => {
    audio.play('chime');
    setExplored([]);
    setActiveRosterId(null);
    setVignettePhase(0);
    setScreenshotSaved(false);
    setHierarchyHighlight(null);
    setDecisionUnlocked(false);
    setDecisionChoice(null);
    setShowFeedback(false);
    setIsCorrectDecision(false);
    setActiveNarrationTier(1);
    setRevealedTiers([1]);
    setRinging(false);
  };

  // Roster hotspot
  const handleRosterClick = (id: string) => {
    if (!guardAction('roster')) return;
    markExplored(id);
    setActiveRosterId(id === activeRosterId ? null : id);
    setHierarchyHighlight(null);
    audio.play('click');
  };

  // Hierarchy step
  const handleHierarchyClick = (id: string) => {
    if (!guardAction('hierarchy')) return;
    markExplored('hierarchy');
    setHierarchyHighlight(id);
    setActiveRosterId(null);
    // Advance vignette a bit if not started
    if (vignettePhase === 0) setVignettePhase(1);
    audio.play('click');

    // Gentle visual flow hint
    setTimeout(() => {
      if (id === 'clinician') setHierarchyHighlight('don');
      else if (id === 'don') setHierarchyHighlight('admin');
    }, 680);
  };

  // Screenshot habit
  const handleScreenshot = () => {
    if (screenshotSaved) return;
    if (!guardAction('screenshot')) return;
    setScreenshotSaved(true);
    markExplored('screenshot');
    audio.play('chime');

    // Show temporary visual confirmation
    setTimeout(() => {
      audio.play('tick');
    }, 420);
  };

  // Vignette interaction — advance escalation steps (4 tiers)
  const advanceVignette = () => {
    if (!guardAction('vignette')) return;
    const next = Math.min(vignettePhase + 1, 4);
    setVignettePhase(next);
    markExplored('vignette');
    audio.play('click');

    if (next >= 2) {
      setRinging(true);
      audio.play('ring');
      setTimeout(() => setRinging(false), 720);
    }
    if (next === 4) {
      audio.play('unlock');
    }
  };

  // Narration tier controls (4-tier integrated)
  const selectNarrationTier = (tier: number) => {
    setActiveNarrationTier(tier);
    if (!revealedTiers.includes(tier)) {
      setRevealedTiers([...revealedTiers, tier].sort());
    }
    audio.play('tick');
    // Auto mark some exploration when engaging narration
    if (!explored.includes('narration')) markExplored('narration');
  };

  // Decision board
  const handleDecision = (opt: typeof CHALLENGE_OPTIONS[0]) => {
    if (!guardAction('decision')) return;
    if (!decisionUnlocked || decisionChoice) return;

    setDecisionChoice(opt.id);
    const correct = opt.isCorrect;
    setIsCorrectDecision(correct);
    setShowFeedback(true);

    if (correct) {
      audio.play('success');
      // Reveal full escalation in vignette
      setVignettePhase(4);
      // highlight full hierarchy
      setHierarchyHighlight('admin');
    } else {
      audio.play('error');
    }
  };

  const closeFeedback = () => {
    setShowFeedback(false);
    if (isCorrectDecision) {
      // Keep the success state visible
    }
  };

  const currentRoster = ROSTER_ENTRIES.find(r => r.id === activeRosterId);
  const currentNarration = NARRATION_TIERS.find(n => n.tier === activeNarrationTier)!;

  // allHotspotsComplete gated internally via state (kept for completeness, not read in render path)

  return (
    <div className="h-full w-full overflow-hidden bg-[#FAFBF8]" role="region" aria-label="GAO-002 Coverage and Continuity interactive scene">
      {/* SVG content area - full workspace image, UI embedded inside */}
      <div className="h-full w-full relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[13px] font-bold tracking-[0.5px] text-[#0F5B54] uppercase">GAO-002 • L2</div>
            <h2 className="text-lg font-semibold text-[#1F1C1B] leading-none mt-0.5">Coverage &amp; Continuity — On-Call Roster</h2>
          </div>
          <div className="text-[10px] font-medium px-2.5 py-1 rounded bg-[#E5FEFF] text-[#0F5B54] border border-[#C4F4F5]">GV-OG-001</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress tracker */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F5B54] bg-[#FDF8F3] px-3 py-1 rounded-lg border border-[#C4F4F5]" aria-live="polite">
            <span>{progress} / {totalExplorable}</span>
            <span className="opacity-50">explored</span>
          </div>

          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg border transition-all ${isMuted ? 'bg-rose-100 border-rose-200 text-rose-700' : 'bg-white hover:bg-[#E5FEFF] border-[#C4F4F5] text-[#0F5B54]'}`}
            aria-label={isMuted ? "Unmute ambient sounds" : "Mute ambient sounds"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={resetAll}
            className="p-1.5 rounded-lg border border-[#C4F4F5] bg-white hover:bg-[#E5FEFF] text-[#0F5B54]"
            aria-label="Reset scene progress"
            title="Reset"
          >
            ⟲
          </button>
        </div>
      </div>

      {/* Main stage: elegant desk + board + vignette */}
      <div className="flex-1 relative overflow-hidden bg-[#F4EDE3]" onClick={() => { if (activeRosterId) setActiveRosterId(null); }}>
        {/* Full rich SVG — premium tasteful night/low-light office with bulletin board + vignette */}
        <svg
          viewBox="0 0 1000 580"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Soft night / warm lamp palette */}
            <linearGradient id="wallNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F2A36" />
              <stop offset="65%" stopColor="#132F3C" />
              <stop offset="100%" stopColor="#1A3A48" />
            </linearGradient>
            <linearGradient id="boardWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5C4033" />
              <stop offset="40%" stopColor="#3F2A22" />
              <stop offset="100%" stopColor="#2C211B" />
            </linearGradient>
            <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8F4EC" />
              <stop offset="100%" stopColor="#EDE5D8" />
            </linearGradient>
            <linearGradient id="lampWarm" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F4A261" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#C74601" stopOpacity="0.15" />
            </linearGradient>
            <filter id="softDrop" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1" dy="3" stdDeviation="3.5" floodColor="#0A1F28" floodOpacity="0.35" />
            </filter>
            <filter id="paperShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#1A2F38" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Low-light night wall */}
          <rect width="1000" height="580" fill="url(#wallNight)" />
          {/* Subtle vertical panel texture */}
          <g opacity="0.08" stroke="#FDF8F3" strokeWidth="18">
            <line x1="80" y1="0" x2="80" y2="420" />
            <line x1="260" y1="0" x2="260" y2="420" />
            <line x1="740" y1="0" x2="740" y2="420" />
            <line x1="920" y1="0" x2="920" y2="420" />
          </g>

          {/* Elegant Bulletin Board / Roster Frame (left-center) */}
          <g transform="translate(70, 42)">
            {/* Frame wood */}
            <rect x="-6" y="-6" width="428" height="312" rx="6" fill="url(#boardWood)" filter="url(#softDrop)" />
            <rect x="0" y="0" width="416" height="300" rx="3" fill="#3F2A22" />
            {/* Cork / board surface */}
            <rect x="14" y="14" width="388" height="272" fill="#4A3728" rx="2" />
            {/* Inner pin board texture */}
            <g opacity="0.12" stroke="#2C211B" strokeWidth="1">
              <line x1="24" y1="32" x2="392" y2="32" />
              <line x1="24" y1="68" x2="392" y2="68" />
              <line x1="24" y1="104" x2="392" y2="104" />
              <line x1="24" y1="140" x2="392" y2="140" />
              <line x1="24" y1="176" x2="392" y2="176" />
              <line x1="24" y1="212" x2="392" y2="212" />
            </g>

            {/* Weekly Roster Paper */}
            <g filter="url(#paperShadow)">
              <rect x="28" y="26" width="360" height="242" fill="url(#paper)" rx="2" stroke="#C9B79A" strokeWidth="1" />
              {/* Header */}
              <rect x="28" y="26" width="360" height="32" fill="#0F5B54" rx="2" />
              <text x="208" y="47" fontSize="13" fill="#FDF8F3" textAnchor="middle" fontWeight="700">WEEKLY ON-CALL ROSTER — JULY 6–12</text>

              {/* Roster entries — interactive groups */}
              {/* Clinician */}
              <g
                className="coverage-hotspot"
                onClick={() => handleRosterClick('clinician-roster')}
                role="button"
                aria-label="Select on-call clinician roster entry"
              >
                <rect x="42" y="68" width="332" height="46" rx="3" fill={activeRosterId === 'clinician-roster' ? '#E8F0ED' : '#FDF8F3'} />
                <text x="54" y="85" fontSize="10" fill="#0F3A4A" fontWeight="700">PRIMARY ON-CALL CLINICIAN</text>
                <text x="54" y="99" fontSize="12" fill="#1F2F38" fontWeight="600">Taylor Kim, LVN  •  (555) 0142</text>
                <text x="54" y="110" fontSize="8" fill="#5C4033">Week primary field contact • EMR + SMS broadcast</text>
              </g>

              {/* DON */}
              <g
                className="coverage-hotspot"
                onClick={() => handleRosterClick('don-roster')}
                role="button"
                aria-label="Select on-call DON roster entry"
              >
                <rect x="42" y="120" width="332" height="46" rx="3" fill={activeRosterId === 'don-roster' ? '#E8F0ED' : '#FDF8F3'} />
                <text x="54" y="137" fontSize="10" fill="#0F3A4A" fontWeight="700">ON-CALL DON</text>
                <text x="54" y="151" fontSize="12" fill="#1F2F38" fontWeight="600">Elena Vargas, RN  •  (555) 0199</text>
                <text x="54" y="162" fontSize="8" fill="#5C4033">Alt: Morgan Ellis, RN (qualified per HR-JD-002)</text>
              </g>

              {/* Admin */}
              <g
                className="coverage-hotspot"
                onClick={() => handleRosterClick('admin-roster')}
                role="button"
                aria-label="Select on-call Administrator roster entry"
              >
                <rect x="42" y="172" width="332" height="46" rx="3" fill={activeRosterId === 'admin-roster' ? '#E8F0ED' : '#FDF8F3'} />
                <text x="54" y="189" fontSize="10" fill="#0F3A4A" fontWeight="700">ON-CALL ADMINISTRATOR</text>
                <text x="54" y="203" fontSize="12" fill="#1F2F38" fontWeight="600">Jordan Hale  •  (555) 0101</text>
                <text x="54" y="214" fontSize="8" fill="#5C4033">Receives next-morning compliance log summary</text>
              </g>

              {/* Small note at bottom of paper */}
              <text x="208" y="252" fontSize="8" fill="#6B5E4F" textAnchor="middle" fontStyle="italic">Printed from EMR • Verify before Friday EOD</text>
            </g>

            {/* Screenshot habit icon — prominent warm accent */}
            <g
              transform="translate(352, 238)"
              className="coverage-hotspot"
              onClick={handleScreenshot}
              role="button"
              aria-label="Screenshot the roster to your phone (practical habit)"
            >
              <rect x="-18" y="-13" width="42" height="28" rx="4" fill="#C74601" opacity={screenshotSaved ? 0.35 : 0.95} />
              <text x="3" y="5" fontSize="8" fill="#FDF8F3" textAnchor="middle" fontWeight="700">📷</text>
              <text x="3" y="14" fontSize="5.5" fill="#FDF8F3" textAnchor="middle">FRIDAY</text>
            </g>
          </g>

          {/* Elegant Hierarchy Visualization — vertical refined flow with arrows (right of board) */}
          <g transform="translate(530, 58)">
            <rect x="-4" y="-4" width="208" height="248" rx="8" fill="#0F2A36" opacity="0.6" />
            <text x="100" y="18" fontSize="11" fill="#F4A261" textAnchor="middle" fontWeight="700" letterSpacing="0.5">ESCALATION HIERARCHY</text>

            {/* Vertical elegant lines + nodes */}
            {HIERARCHY.map((step, idx) => {
              const y = 42 + idx * 72;
              const isActive = hierarchyHighlight === step.id;
              return (
                <g key={step.id}>
                  {/* Node circle */}
                  <g
                    className="coverage-hotspot"
                    onClick={() => handleHierarchyClick(step.id)}
                    role="button"
                    aria-label={`Hierarchy step: ${step.label}`}
                  >
                    <circle
                      cx="100"
                      cy={y}
                      r="19"
                      fill={isActive ? '#C74601' : '#0F5B54'}
                      stroke="#FDF8F3"
                      strokeWidth="2.5"
                    />
                    <text x="100" y={y + 4} fontSize="10" fill="#FDF8F3" textAnchor="middle" fontWeight="700">
                      {idx + 1}
                    </text>
                  </g>

                  {/* Refined label */}
                  <g>
                    <text x="132" y={y - 2} fontSize="10" fill="#F8F4EC" fontWeight="600">{step.label}</text>
                    <text x="132" y={y + 11} fontSize="8.5" fill="#A8C5C8">{step.sub}</text>
                  </g>

                  {/* Elegant connecting arrow (curved refined path) */}
                  {idx < 2 && (
                    <path
                      d={`M 100 ${y + 21} Q 78 ${y + 38} 100 ${y + 52}`}
                      fill="none"
                      stroke={isActive ? '#C74601' : '#C4A17A'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className={isActive ? 'elegant-flow' : ''}
                      opacity={isActive ? 0.95 : 0.65}
                    />
                  )}
                </g>
              );
            })}

            <text x="100" y="238" fontSize="7.5" fill="#8BA3A8" textAnchor="middle">Clinician → DON → Administrator</text>
          </g>

          {/* Night Field Vignette — right panel, low light warm accents */}
          <g transform="translate(755, 42)">
            {/* Vignette frame */}
            <rect x="-2" y="-2" width="225" height="258" rx="7" fill="#0A1F28" stroke="#1F3F4A" strokeWidth="4" filter="url(#softDrop)" />

            {/* Night house / home silhouette */}
            <g opacity="0.85">
              <rect x="24" y="98" width="92" height="68" fill="#132F3C" rx="2" />
              {/* Roof */}
              <path d="M 18 100 L 70 62 L 122 100 Z" fill="#0F2A36" />
              {/* Lit window — warm */}
              <rect x="36" y="114" width="22" height="18" fill="#F4A261" opacity="0.9" />
              <rect x="72" y="114" width="22" height="18" fill="#F4A261" opacity="0.75" />
              {/* Door */}
              <rect x="60" y="138" width="16" height="28" fill="#1A3A48" />
            </g>

            {/* Clock — gentle ticking second hand */}
            <g transform="translate(155, 68)">
              <circle cx="26" cy="26" r="24" fill="#0F2A36" stroke="#3A5C68" strokeWidth="3" />
              <circle cx="26" cy="26" r="18" fill="#132F3C" />
              {/* Hour marks */}
              <g fill="#A8C5C8" fontSize="6">
                <text x="26" y="12" textAnchor="middle">12</text>
                <text x="43" y="29" textAnchor="middle">3</text>
                <text x="26" y="45" textAnchor="middle">6</text>
                <text x="9" y="29" textAnchor="middle">9</text>
              </g>
              {/* Minute hand fixed */}
              <line x1="26" y1="26" x2="26" y2="13" stroke="#C4A17A" strokeWidth="2.5" strokeLinecap="round" />
              {/* Animated second hand — tasteful slow tick */}
              <g className="clock-hand" style={{ animationDuration: '4s' }}>
                <line x1="26" y1="26" x2="26" y2="8" stroke="#C74601" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <circle cx="26" cy="26" r="3" fill="#C74601" />
            </g>

            {/* Phone icon — pulsing ring */}
            <g
              transform="translate(48, 178)"
              className={ringing || vignettePhase >= 2 ? 'phone-ring' : ''}
              onClick={advanceVignette}
              style={{ cursor: 'pointer' }}
            >
              <rect x="0" y="0" width="28" height="44" rx="4" fill="#0F5B54" stroke="#C4A17A" strokeWidth="2" />
              <rect x="5" y="6" width="18" height="22" rx="1" fill="#EDE5D8" />
              <circle cx="14" cy="35" r="3" fill="#F4A261" />
            </g>

            {/* Vignette status text inside SVG (refined) */}
            <g>
              <text x="112" y="185" fontSize="8" fill="#F4A261" fontWeight="600">10:00 PM • FIELD</text>
              <text x="112" y="197" fontSize="7" fill="#A8C5C8">Tap phone to advance escalation</text>
            </g>

            {/* Status dots for vignette progress */}
            {[1,2,3,4].map((n, i) => (
              <circle
                key={i}
                cx={32 + i * 18}
                cy="238"
                r="3.5"
                fill={vignettePhase >= n ? '#C74601' : '#2C4652'}
              />
            ))}
          </g>

          {/* Ambient lamp glow (warm accent, low light feel) */}
          <g transform="translate(680, 310)">
            <ellipse cx="22" cy="12" rx="68" ry="22" fill="url(#lampWarm)" opacity="0.28" />
          </g>

          {/* Bottom label strip */}
          <g>
            <rect y="530" width="1000" height="50" fill="#0F2A36" opacity="0.65" />
            <text x="500" y="554" fontSize="9" fill="#A8C5C8" textAnchor="middle" letterSpacing="1">On-call roster + weekend escalation • Correct first call = on-call clinician • Screenshot habit prevents survey findings</text>
          </g>

          {/* === EMBEDDED UI - big obvious task panel inside the image === */}
          <g transform="translate(25, 20)">
            <rect x="0" y="0" width="400" height="88" rx="8" fill="#0F5B54" stroke="#C74601" strokeWidth="3" />
            <text x="14" y="20" fontSize="10" fill="#C9B38A" fontFamily="Inter, system-ui" fontWeight="700">OBJECTIVE {currentObjective}/8 — YOUR TASK:</text>
            <text x="14" y="42" fontSize="15" fill="#FDF8F3" fontFamily="Inter, system-ui" fontWeight="700">{nextActionText}</text>
            <text x="14" y="62" fontSize="11" fill="#FAD9C5" fontFamily="Inter, system-ui">Only the highlighted items are active right now</text>
            <text x="14" y="78" fontSize="9" fill="#A8D5D3" fontFamily="Inter, system-ui">{progressPct}% complete</text>
          </g>

          {/* Strong highlight example for current objective targets */}
          {currentObjective === 5 && (
            <g>
              <rect x="320" y="95" width="160" height="55" rx="6" fill="none" stroke="#C74601" strokeWidth="5" />
              <text x="485" y="115" fontSize="11" fill="#C74601" fontWeight="700">CLICK THESE</text>
            </g>
          )}

          {/* Embedded controls in scene */}
          <g transform="translate(920, 500)">
            <g onClick={() => onToggleMute && onToggleMute()} style={{cursor:'pointer'}}>
              <rect x="0" y="0" width="48" height="24" rx="3" fill="#2C2520" />
              <text x="6" y="16" fontSize="7" fill="#C9B38A">SOUND</text>
            </g>
            <g onClick={() => onReset && onReset()} style={{cursor:'pointer'}} transform="translate(55,0)">
              <rect x="0" y="0" width="48" height="24" rx="3" fill="#2C2520" />
              <text x="6" y="16" fontSize="7" fill="#C9B38A">RESET</text>
            </g>
          </g>
        </svg>

        {/* Overlaid interactive panels (premium, tasteful) — absolute positioned like benchmarks */}

        {/* Active Roster Detail Panel */}
        {currentRoster && (
          <div className="absolute top-[92px] left-[92px] z-30 bg-white border border-[#C4A17A] shadow-xl rounded-xl p-4 w-[310px] text-sm" onClick={e => e.stopPropagation()}>
            <div className="uppercase text-[9px] tracking-[1px] text-[#C74601] font-bold mb-1">ROSTER ENTRY</div>
            <div className="font-semibold text-[#0F3A4A] text-base">{currentRoster.role}</div>
            <div className="mt-1 text-[#1F2F38]">{currentRoster.name}</div>
            <div className="text-[#5C4033] font-mono text-xs mt-0.5">{currentRoster.phone}</div>
            <div className="text-xs text-[#64748B] mt-2 leading-snug">{currentRoster.note}</div>
            <button
              onClick={() => setActiveRosterId(null)}
              className="mt-3 text-xs uppercase tracking-widest text-[#0F5B54] hover:text-[#C74601]"
            >
              CLOSE
            </button>
          </div>
        )}

        {/* Screenshot confirmation toast */}
        {screenshotSaved && (
          <div className="absolute top-[218px] left-[398px] z-30 bg-[#0F5B54] text-[#FDF8F3] text-xs px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
            ✓ Roster saved to phone — verified for field
          </div>
        )}

        {/* 4-Tier Narration integrated strip (bottom-left elegant) */}
        <div className="absolute bottom-[68px] left-6 z-20 bg-[#0F2A36]/95 text-[#F8F4EC] rounded-2xl border border-[#3A5C68] shadow p-3 w-[340px]">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="text-[9px] uppercase tracking-[1.5px] font-bold text-[#C4A17A]">4-TIER NARRATION • GV-OG-001</div>
            <div className="text-[10px] opacity-60">{revealedTiers.length}/4</div>
          </div>
          <div className="flex gap-1 mb-2">
            {NARRATION_TIERS.map(t => (
              <button
                key={t.tier}
                onClick={() => selectNarrationTier(t.tier)}
                className={`tier-btn flex-1 text-[10px] py-1 rounded border border-[#3A5C68] ${activeNarrationTier === t.tier ? 'active' : 'hover:bg-[#1A3A48]'}`}
                aria-pressed={activeNarrationTier === t.tier}
              >
                T{t.tier}
              </button>
            ))}
          </div>
          <div className="text-[11px] leading-snug px-1 text-[#EDE5D8]">
            <span className="font-semibold text-[#F4A261]">{currentNarration.title}:</span> {currentNarration.text}
          </div>
        </div>

        {/* Field Vignette overlay text panel (refined) */}
        <div className="absolute bottom-5 right-5 z-20 bg-[#0A1F28]/95 text-[#F8F4EC] text-xs rounded-xl border border-[#3A5C68] p-3 max-w-[248px] leading-snug">
          <div className="font-bold text-[#F4A261] mb-0.5 flex items-center gap-1.5">
            NIGHT FIELD ESCALATION
            {vignettePhase > 0 && <span className="text-[10px] opacity-70">STEP {vignettePhase}/4</span>}
          </div>
          <div className="text-[#C4B8A0]">
            {FIELD_VIGNETTE_TIERS.slice(0, Math.max(1, vignettePhase)).map((line, i) => (
              <div key={i} className="mb-0.5">• {line}</div>
            ))}
          </div>
          {vignettePhase < 4 && (
            <button onClick={advanceVignette} className="mt-1.5 text-[#C74601] hover:underline text-[11px] font-semibold">ADVANCE ESCALATION →</button>
          )}
        </div>

        {/* Decision / Challenge Board — elegant unlock flow */}
        <div className="absolute top-[68px] right-[18px] z-20 w-[268px]">
          {!decisionUnlocked ? (
            <div className="bg-white/95 border border-[#C4A17A] rounded-2xl p-3 shadow text-xs text-[#2D3748]">
              <div className="uppercase tracking-widest text-[#C74601] font-bold text-[9px]">CHALLENGE</div>
              <div className="font-semibold text-[#0F3A4A] mt-0.5">“Find the On-Call”</div>
              <div className="mt-1 text-[11px] leading-tight">Explore the roster, hierarchy, vignette and narration tiers to unlock the decision board.</div>
              <div className="mt-2 text-[10px] text-[#64748B]">Progress: {progress}/{totalExplorable} • Tiers {revealedTiers.length}/4</div>
            </div>
          ) : (
            <div className="bg-white border-2 border-[#0F5B54] rounded-2xl p-3.5 shadow-xl">
              <div className="text-[10px] font-bold uppercase tracking-[0.8px] text-[#C74601]">DECISION BOARD • UNLOCKED</div>
              <div className="text-sm font-semibold text-[#0F3A4A] mt-1 leading-tight">It is Saturday at 21:00. You need clinical guidance on a possible adverse event. Who do you call first?</div>

              <div className="mt-3 space-y-2">
                {CHALLENGE_OPTIONS.map(opt => {
                  const selected = decisionChoice === opt.id;
                  const isCorrectOpt = opt.isCorrect;
                  let cls = "decision-card w-full text-left border rounded-xl px-3 py-2 text-xs bg-[#FDF8F3] border-[#C4A17A] hover:border-[#0F5B54] text-[#1F2F38]";
                  if (selected) {
                    cls = isCorrectOpt
                      ? "decision-card w-full text-left border rounded-xl px-3 py-2 text-xs bg-[#E5FEFF] border-[#0F5B54] text-[#0F5B54] font-medium"
                      : "decision-card w-full text-left border rounded-xl px-3 py-2 text-xs bg-[#FEF2F2] border-[#B45309] text-[#9F1239]";
                  }
                  return (
                    <button
                      key={opt.id}
                      disabled={!!decisionChoice}
                      onClick={() => handleDecision(opt)}
                      className={cls}
                      aria-label={`Choose: ${opt.label}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="feedback-panel mt-3 border-t border-[#E2E8F0] pt-3 text-xs">
                  <div className={`font-bold mb-1 ${isCorrectDecision ? 'text-[#0F5B54]' : 'text-[#9F1239]'}`}>
                    {isCorrectDecision ? 'CORRECT — Chain Intact' : 'NOT YET — Reconsider the Hierarchy'}
                  </div>
                  <div className="leading-snug text-[#2D3748]">
                    {isCorrectDecision ? FEEDBACK_CORRECT : FEEDBACK_INCORRECT}
                  </div>
                  <div className="mt-2 text-[10px] text-[#64748B] leading-tight">
                    {COMPLIANCE_IMPACT}<br />
                    {REAL_WORLD}
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-[#0F5B54]">{CORRECT_GUIDANCE}</div>

                  <button onClick={closeFeedback} className="mt-3 w-full text-center text-[#C74601] text-xs uppercase tracking-widest py-1 hover:bg-[#F8F4EC] rounded">CONTINUE</button>
                </div>
              )}

              {isCorrectDecision && !showFeedback && (
                <div className="mt-2 text-center text-emerald-700 text-[10px] font-semibold">✓ Escalation chain documented. Scene complete.</div>
              )}
            </div>
          )}
        </div>

        {/* Completion banner */}
        {isCorrectDecision && isFullyExplored && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 bg-[#0F5B54] text-white px-5 py-1.5 rounded-full text-sm font-bold shadow tracking-wider flex items-center gap-2">
            COVERAGE &amp; CONTINUITY COMPLETE — CHAIN VERIFIED
          </div>
        )}
      </div>

      {/* Footer guidance strip (tasteful, source-aligned) */}
      <div className="border-t border-[#E5E4E3] bg-white px-4 py-2.5 text-[10px] text-[#524C4B] flex flex-wrap gap-x-5 gap-y-1 shrink-0">
        <span><strong>Hierarchy:</strong> Clinician (first) → DON → Administrator</span>
        <span><strong>Tip:</strong> Screenshot roster Friday</span>
        <span><strong>Rule:</strong> Clinical first — always use posted roster</span>
        <span className="font-mono text-[#C74601]/70">42 CFR 484.105 • GV-OG-001</span>
      </div>
    </div>
  );
}
