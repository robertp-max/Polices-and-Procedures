import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Stethoscope, 
  Shield, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  X, 
  Award 
} from 'lucide-react';

// Premium self-contained Web Audio synth (adapted from CoreValuesInteractiveViewer patterns)
class PremiumAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.04, ramp = 0.08) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = type;
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    gain.gain.value = vol;
    gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + duration + ramp);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + ramp + 0.02);
  }

  playClick() { this.tone(1180, 0.07, 'sine', 0.035, 0.06); }

  playUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Soft bloom: low-mid warm tones with gentle rise
    [520, 660, 780].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.value = 0.018 + i * 0.006;
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.72 + i * 0.04);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.035);
      osc.stop(now + 0.85 + i * 0.04);
    });
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523, 659, 784, 932];
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.value = 0.022;
      gain.gain.linearRampToValueAtTime(0.0008, now + 0.9 + i * 0.03);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + 1.05 + i * 0.03);
    });
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Warm positive resolution
    [440, 554, 698, 880].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      gain.gain.value = 0.025;
      gain.gain.linearRampToValueAtTime(0.0001, now + 1.1 + i * 0.02);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.055);
      osc.stop(now + 1.25 + i * 0.02);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 210;
    gain.gain.value = 0.028;
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.32);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playComplete() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.value = 0.018;
      gain.gain.linearRampToValueAtTime(0.0001, now + 1.35 + i * 0.035);
      osc.connect(gain); gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + 1.55 + i * 0.035);
    });
  }

  playLinePulse() {
    if (this.muted) return;
    this.tone(780, 0.22, 'sine', 0.012, 0.18);
  }
}

const synth = new PremiumAudioSynth();

// Exact source-derived data for L1 (from trainingContent.gao.001-007.ts)
const ROLE_NODES = [
  {
    id: 'gb',
    label: 'Governing Body',
    short: 'Final Authority',
    icon: Award,
    body: 'The Governing Body holds final authority for agency operations under 42 CFR 484.105(a). It approves the budget, the scope of services, the QAPI program, and the Compliance Officer appointment. It meets at least quarterly and reviews compliance and quality reports.',
    citation: '42 CFR §484.105(a)',
    surveyTieIn: 'Surveyors may ask: "Who holds final authority for the agency? What does the Governing Body approve?" You must answer from memory.',
    unlockNarration: 'The Governing Body holds final legal authority. It approves budget, scope, QAPI, and the Compliance Officer. Quarterly meetings review compliance and quality.'
  },
  {
    id: 'admin',
    label: 'Administrator',
    short: 'Day-to-Day Operations',
    icon: Users,
    body: 'The Administrator is responsible for day-to-day agency operations under 42 CFR 484.105(b). The Administrator must be available during operating hours and must designate a qualified alternate during absences of more than one business day.',
    citation: '42 CFR §484.105(b)',
    surveyTieIn: 'Surveyors may ask: "Who is your Administrator? Who is the alternate when the Administrator is away?"',
    unlockNarration: 'Administrator handles day-to-day operations and must be available or have a documented qualified alternate.'
  },
  {
    id: 'don',
    label: 'Director of Nursing',
    short: 'Clinical Supervision',
    icon: Stethoscope,
    body: 'The Director of Nursing supervises all clinical practice under 42 CFR 484.105(c). The DON must be available during operating hours and designate a qualified alternate when absent. This role oversees every RN, LPN, and therapy discipline in the field.',
    citation: '42 CFR §484.105(c)',
    surveyTieIn: 'Surveyors may ask: "Who supervises clinical practice? Who is the clinical alternate?"',
    unlockNarration: 'The DON supervises all clinical services and must ensure qualified coverage at all times.'
  },
  {
    id: 'co',
    label: 'Compliance Officer',
    short: 'Dual Reporting',
    icon: Shield,
    body: 'The Compliance Officer reports to BOTH the Administrator AND the Governing Body. This dual line is required by OIG guidance so that compliance issues cannot be suppressed by operations leadership. You may report concerns to the Compliance Officer directly via the hotline.',
    citation: 'OIG Compliance Program Guidance + 42 CFR §484.105',
    surveyTieIn: 'Surveyors may ask: "Who is the Compliance Officer? How do you report if your supervisor is involved?" Answer: use the posted hotline directly.',
    unlockNarration: 'Compliance Officer has a protected dual reporting line to Administrator and Governing Body. Direct reports are allowed and protected.'
  }
];

const CHALLENGE_NODE = {
  id: 'challenge',
  label: 'Escalation Challenge',
  short: 'Decision Point',
  prompt: 'You suspect billing for visits that did not occur. Your supervisor seems involved.',
  options: [
    { id: 'a', label: 'Confront the supervisor.', isCorrect: false, feedback: 'Confrontation can compromise the investigation and put you at risk.' },
    { id: 'b', label: 'Report directly to the Compliance Officer using the hotline.', isCorrect: true, feedback: 'Correct. Dual reporting protects you from retaliation and bypasses the implicated leader.' },
    { id: 'c', label: 'Wait until the next quarterly Governing Body meeting.', isCorrect: false, feedback: 'Delay risks ongoing fraud and Medicare overpayment. Reporting must be prompt.' },
    { id: 'd', label: 'Discuss it with co-workers first.', isCorrect: false, feedback: 'Spreading the concern compromises confidentiality and the investigation.' }
  ],
  feedbackCorrect: 'Compliance Officer escalation through the hotline is the correct path. Dual reporting and whistleblower protection apply.',
  feedbackIncorrect: 'Any path that goes through, around, or delays past the implicated supervisor risks ongoing fraud and removes whistleblower protection.',
  policyRef: 'GV-OG-001'
};

const COMPLETION_LABEL = 'Reporting Lines Practice Complete';

const brandStyles = `
  @keyframes bloom {
    0% { transform: scale(0.92); opacity: 0.6; filter: brightness(1) drop-shadow(0 0 0 rgba(15,91,84,0)); }
    40% { transform: scale(1.04); opacity: 1; filter: brightness(1.15) drop-shadow(0 0 18px rgba(199,70,1,0.35)); }
    100% { transform: scale(1); opacity: 1; filter: brightness(1) drop-shadow(0 0 4px rgba(15,91,84,0.2)); }
  }
  .node-bloom { animation: bloom 620ms cubic-bezier(0.2, 0.9, 0.3, 1) forwards; }
  
  @keyframes linePulse {
    0%, 100% { stroke-opacity: 0.65; }
    50% { stroke-opacity: 0.95; }
  }
  .pulse-line { animation: linePulse 2.8s ease-in-out infinite; }
  .reduced-motion .pulse-line { animation: none; }

  @keyframes gentleBreathe {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.022) translateY(-0.6px); }
  }
  .heidi-breathe { animation: gentleBreathe 4.2s ease-in-out infinite; transform-origin: 50% 58%; }
  .reduced-motion .heidi-breathe { animation: none; }

  @keyframes plantSway {
    0%, 100% { transform: rotate(-1deg); }
    50% { transform: rotate(1.6deg); }
  }
  .plant-sway { animation: plantSway 7.5s ease-in-out infinite; transform-origin: bottom center; }
  .reduced-motion .plant-sway { animation: none; }

  @keyframes nodeUnlockGlow {
    0% { filter: brightness(1) saturate(1); }
    50% { filter: brightness(1.2) saturate(1.3); }
    100% { filter: brightness(1) saturate(1); }
  }
  .unlocked-node { filter: drop-shadow(0 3px 8px rgba(15,91,84,0.25)); }

  .navy-pill {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.4px;
    fill: #FDF8F3;
  }
  .org-text {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-weight: 600;
    fill: #1E3A5F;
  }
  .role-label {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 700;
    fill: #FDF8F3;
  }

  .hotspot-marker {
    transition: all 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
  }
  .hotspot-group {
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
  }
  .hotspot-group:hover { transform: translateY(-1px); }
  .hotspot-group:focus-visible {
    outline: 3px solid #C74601;
    outline-offset: 4px;
  }
  .reduced-motion .hotspot-group:hover { transform: none; }

  .phase-dot {
    width: 7px; height: 7px; border-radius: 999px;
    background: #0F5B54;
  }
  .phase-dot.active { background: #C74601; }
  .phase-dot.complete { background: #0F5B54; }

  .premium-panel {
    box-shadow: 0 25px 60px -15px rgba(15, 27, 26, 0.35), 0 10px 20px -5px rgba(15, 27, 26, 0.2);
    border: 1px solid #E5E4E3;
  }
`;

interface GAO002Scene01GovernanceOrgChartProps {
  onComplete?: () => void;
  currentObjective?: number;
  onCompleteObjective?: () => void;
  onFocusArtifact?: (id: string, objId: number) => void;
  focusedArtifact?: string | null;
  isMuted?: boolean;
  // Shared coordinator support (optional)
  unlockedNodes?: string[];
  onNodeUnlocked?: (nodeId: string) => void;
  onNarration?: (tier: 'scene_start' | 'node_unlock' | 'feedback' | 'scene_complete', payload: any) => void;
  playSound?: (type: 'click' | 'unlock' | 'chime' | 'correct' | 'error' | 'complete') => void;
}

export default function GAO002Scene01GovernanceOrgChart({ 
  onComplete, 
  unlockedNodes: externalUnlocked, 
  onNodeUnlocked, 
  onNarration, 
  playSound 
}: GAO002Scene01GovernanceOrgChartProps) {
  const SCENE1_KEY = 'gao002-scene1-progress';

  const [styleInjected, setStyleInjected] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SCENE1_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return p.unlocked ?? [];
      }
    } catch {}
    return [];
  });
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [interactionPhase, setInteractionPhase] = useState(0); // 0=closed, 1=story, 2=content, 3=survey, 4=ack
  const [challengeSelection, setChallengeSelection] = useState<string | null>(null);
  const [challengeComplete, setChallengeComplete] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SCENE1_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return p.challengeComplete ?? false;
      }
    } catch {}
    return false;
  });
  const [challengeFeedback, setChallengeFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [bloomingId, setBloomingId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [narrationLog, setNarrationLog] = useState<string>(''); // live region for a11y + narration tier

  // Persist scene 1 progress
  useEffect(() => {
    try {
      localStorage.setItem(SCENE1_KEY, JSON.stringify({ unlocked, challengeComplete }));
    } catch {}
  }, [unlocked, challengeComplete]);

  const svgRef = useRef<SVGSVGElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  // Sync external unlocked if coordinator provided
  useEffect(() => {
    if (externalUnlocked && externalUnlocked.length > 0) {
      setUnlocked(prev => {
        const merged = Array.from(new Set([...prev, ...externalUnlocked]));
        return merged;
      });
    }
  }, [externalUnlocked]);

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Inject premium styles once
  useEffect(() => {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.innerHTML = brandStyles;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  // Sync mute to synth
  useEffect(() => {
    synth.muted = isMuted;
  }, [isMuted]);

  const isUnlocked = useCallback((id: string) => unlocked.includes(id), [unlocked]);
  const totalUnlocks = 5; // 4 roles + challenge
  const currentProgress = unlocked.length + (challengeComplete && !unlocked.includes('challenge') ? 1 : 0);
  const progressLabel = `${Math.min(currentProgress, totalUnlocks)} / ${totalUnlocks} Roles & Pathways Unlocked`;
  const isFullyComplete = unlocked.length >= 4 && challengeComplete;

  // Emit narration tier (supports coordinator + internal log + live region)
  const emitNarration = useCallback((tier: 'scene_start' | 'node_unlock' | 'feedback' | 'scene_complete', payload: any) => {
    const text = typeof payload === 'string' ? payload : payload?.text || '';
    if (text) {
      setNarrationLog(text);
      // Update live region for screen readers
      if (liveRef.current) {
        liveRef.current.textContent = text;
      }
    }
    onNarration?.(tier, payload);
    // Internal sound cue for tier (premium subtle)
    if (!isMuted) {
      if (tier === 'node_unlock') synth.playUnlock();
      else if (tier === 'feedback') synth.playChime();
      else if (tier === 'scene_complete') synth.playComplete();
    }
  }, [onNarration, isMuted]);

  // Scene start narration on mount
  useEffect(() => {
    const startText = "Heidi's first week. Dana hands over the reporting map. This is who we are on paper — and why it matters when you're alone with a patient. Explore the four governance pillars and the escalation pathway.";
    emitNarration('scene_start', { text: startText, tier: 'scene_start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Completion signal
  useEffect(() => {
    if (isFullyComplete) {
      const completePayload = { text: COMPLETION_LABEL, tier: 'scene_complete' };
      emitNarration('scene_complete', completePayload);
      synth.playComplete();
      if (onComplete) {
        // Slight delay for premium feel + animation settle
        setTimeout(() => onComplete(), 420);
      }
    }
  }, [isFullyComplete, onComplete, emitNarration]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    synth.muted = next;
    playSound?.(next ? 'click' : 'click');
  };

  const resetAll = () => {
    synth.playClick();
    setUnlocked([]);
    setActiveNodeId(null);
    setInteractionPhase(0);
    setChallengeSelection(null);
    setChallengeComplete(false);
    setChallengeFeedback(null);
    setBloomingId(null);
    setNarrationLog('');
    onNodeUnlocked?.('reset');
  };

  const markUnlocked = (id: string) => {
    if (unlocked.includes(id)) return;
    const next = [...unlocked, id];
    setUnlocked(next);
    onNodeUnlocked?.(id);
  };

  // Core unlock handler (full SVG node click)
  const handleNodeClick = (id: string) => {
    if (id === 'challenge') {
      if (challengeComplete) return;
      synth.playClick();
      setActiveNodeId('challenge');
      setInteractionPhase(1);
      setChallengeSelection(null);
      setChallengeFeedback(null);
      return;
    }

    if (isUnlocked(id)) return;

    // Premium unlock sequence
    setBloomingId(id);
    synth.playUnlock();
    playSound?.('unlock');

    // Visual bloom pulse
    setTimeout(() => {
      markUnlocked(id);
      setActiveNodeId(id);
      setInteractionPhase(1); // start phased panel

      const node = ROLE_NODES.find(n => n.id === id);
      if (node) {
        emitNarration('node_unlock', { 
          text: node.unlockNarration, 
          nodeId: id, 
          fullInstructional: node.body,
          citation: node.citation 
        });
      }

      setBloomingId(null);
    }, 180);
  };

  // Keyboard support for SVG groups
  const handleNodeKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleNodeClick(id);
    }
    if (e.key === 'Escape' && activeNodeId) {
      closePanel();
    }
  };

  const closePanel = () => {
    synth.playClick();
    setActiveNodeId(null);
    setInteractionPhase(0);
    setChallengeSelection(null);
    setChallengeFeedback(null);
  };

  // Phase navigation inside elegant panel
  const advancePhase = () => {
    const maxPhase = activeNodeId === 'challenge' ? 2 : 4;
    const next = Math.min(interactionPhase + 1, maxPhase);
    setInteractionPhase(next);
    synth.playClick();
    if (next === 4 && activeNodeId && activeNodeId !== 'challenge') {
      // Acknowledge completes unlock visually if not already
      if (!isUnlocked(activeNodeId)) {
        markUnlocked(activeNodeId);
      }
    }
  };

  // Challenge selection (verbatim source feedback)
  const handleChallengeSelect = (opt: { id: string; label: string; isCorrect: boolean; feedback: string }) => {
    if (challengeComplete || challengeSelection) return;

    setChallengeSelection(opt.id);
    const isCorrect = opt.isCorrect;
    const fbText = isCorrect ? CHALLENGE_NODE.feedbackCorrect : opt.feedback;

    setChallengeFeedback({ correct: isCorrect, text: fbText });

    if (isCorrect) {
      synth.playCorrect();
      playSound?.('correct');
      setTimeout(() => {
        setChallengeComplete(true);
        markUnlocked('challenge');
        emitNarration('feedback', { 
          text: fbText, 
          correct: true, 
          nodeId: 'challenge',
          verbatim: CHALLENGE_NODE.feedbackCorrect 
        });
        // Advance to complete state
        setInteractionPhase(2);
      }, 520);
    } else {
      synth.playError();
      playSound?.('error');
      emitNarration('feedback', { text: fbText, correct: false, nodeId: 'challenge' });
      // Allow retry after brief display
      setTimeout(() => {
        setChallengeSelection(null);
        setChallengeFeedback(null);
      }, 1350);
    }
  };

  const currentRole = ROLE_NODES.find(n => n.id === activeNodeId);
  const activeIsChallenge = activeNodeId === 'challenge';
  const showPanel = !!activeNodeId;

  // Progress classes for reduced motion
  const motionClass = reducedMotion ? 'reduced-motion' : '';

  return (
    <div className={`h-full w-full flex flex-col bg-white overflow-hidden rounded-2xl border border-[#E5E4E3] font-sans ${motionClass}`} style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Premium calm header */}
      <div className="px-6 py-3.5 border-b border-[#E5E4E3] bg-white flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F5B54] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#FDF8F3]" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-[-0.1px] text-[#0F5B54]">Heidi&apos;s Reporting Map</div>
            <div className="text-[10px] text-[#5F5A57] tracking-[0.4px] uppercase">Governing Body &amp; Executive Roles — L1</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Progress */}
          <div className="flex items-center gap-2 rounded-xl bg-[#F4F1EA] border border-[#E5E4E3] px-3.5 py-1 text-xs font-bold text-[#0F5B54]">
            <div className="w-2 h-2 rounded-full bg-[#0F5B54]" />
            {progressLabel}
          </div>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-xl border transition-all ${isMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white hover:bg-[#F8F5F0] border-[#D8D4CC] text-[#0F5B54]'}`}
            aria-label={isMuted ? 'Unmute premium audio cues' : 'Mute premium audio cues'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={resetAll}
            className="p-2 rounded-xl border border-[#D8D4CC] bg-white hover:bg-[#F8F5F0] text-[#0F5B54]"
            aria-label="Reset scene progress"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full SVG Workspace — 1100×620 elegant office + wall org chart */}
      <div className="flex-1 relative bg-[#F8F4ED] overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 1100 620"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          aria-label="Interactive office scene with wall org chart for governing body and executive roles"
        >
          <defs>
            {/* Premium gradients and filters */}
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5F0E6" />
              <stop offset="100%" stopColor="#EDE6D9" />
            </linearGradient>
            <linearGradient id="frameGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3A2F24" />
              <stop offset="100%" stopColor="#2A221B" />
            </linearGradient>
            <linearGradient id="nodeGB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E3A5F" />
              <stop offset="100%" stopColor="#142A47" />
            </linearGradient>
            <linearGradient id="nodeAdmin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F5B54" />
              <stop offset="100%" stopColor="#0A423D" />
            </linearGradient>
            <linearGradient id="nodeDON" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D6359" />
              <stop offset="100%" stopColor="#08433C" />
            </linearGradient>
            <linearGradient id="nodeCO" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C74601" />
              <stop offset="100%" stopColor="#9F3A03" />
            </linearGradient>
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#1E2A2A" floodOpacity="0.18" />
            </filter>
            <filter id="bloomGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="subtleInner" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            </filter>
          </defs>

          {/* Elegant warm cream office wall */}
          <rect width="1100" height="620" fill="url(#wallGrad)" />
          
          {/* Subtle wall paneling detail */}
          <g opacity="0.06" stroke="#2C2520" strokeWidth="2">
            <line x1="80" y1="40" x2="80" y2="420" />
            <line x1="1020" y1="40" x2="1020" y2="420" />
            <line x1="220" y1="40" x2="220" y2="420" />
            <line x1="880" y1="40" x2="880" y2="420" />
          </g>

          {/* Rich wood floor */}
          <rect y="420" width="1100" height="200" fill="#C8B49A" />
          <g stroke="#A88F6E" strokeWidth="1.25" opacity="0.55">
            <line x1="0" y1="460" x2="1100" y2="460" />
            <line x1="0" y1="510" x2="1100" y2="510" />
            <line x1="0" y1="565" x2="1100" y2="565" />
            <line x1="140" y1="420" x2="95" y2="620" />
            <line x1="380" y1="420" x2="320" y2="620" />
            <line x1="620" y1="420" x2="560" y2="620" />
            <line x1="860" y1="420" x2="800" y2="620" />
          </g>

          {/* Persian-style rug */}
          <ellipse cx="540" cy="530" rx="310" ry="68" fill="#3A5F5B" opacity="0.75" />
          <ellipse cx="540" cy="530" rx="275" ry="48" fill="#2F4E4A" opacity="0.45" />

          {/* Large elegant window left */}
          <g transform="translate(55, 55)">
            <rect width="210" height="265" rx="6" fill="#EDE6D9" stroke="#3A2F24" strokeWidth="8" />
            <rect x="12" y="12" width="186" height="241" rx="3" fill="#F4E9C8" />
            {/* Light panes */}
            <line x1="105" y1="12" x2="105" y2="253" stroke="#C9B38A" strokeWidth="3" />
            <line x1="12" y1="132" x2="198" y2="132" stroke="#C9B38A" strokeWidth="3" />
            {/* Curtains */}
            <path d="M -8 8 Q 22 120 4 270" fill="none" stroke="#8B5E3C" strokeWidth="38" opacity="0.9" />
            <path d="M 218 8 Q 188 120 206 270" fill="none" stroke="#8B5E3C" strokeWidth="38" opacity="0.9" />
          </g>

          {/* PROMINENT WALL ORG CHART — Framed */}
          <g transform="translate(295, 38)">
            {/* Frame */}
            <rect x="-12" y="-12" width="534" height="332" rx="10" fill="url(#frameGrad)" filter="url(#softShadow)" />
            <rect x="-6" y="-6" width="522" height="320" rx="6" fill="#F5F0E6" stroke="#D4C8B4" strokeWidth="2" />

            {/* Inner title plaque */}
            <rect x="118" y="8" width="280" height="26" rx="4" fill="#1E3A5F" />
            <text x="258" y="25" textAnchor="middle" className="role-label" fontSize="12" fill="#FDF8F3">CARE INDEED — ORGANIZATIONAL AUTHORITY</text>

            {/* === GOVERNING BODY (top center) === */}
            <g 
              className={`hotspot-group ${bloomingId === 'gb' ? 'node-bloom' : ''} ${isUnlocked('gb') ? 'unlocked-node' : ''}`}
              onClick={() => handleNodeClick('gb')}
              onKeyDown={(e) => handleNodeKeyDown(e, 'gb')}
              role="button"
              tabIndex={0}
              aria-label="Governing Body — Final authority. Click to unlock."
            >
              <rect x="168" y="48" width="176" height="68" rx="9" fill="url(#nodeGB)" stroke="#142A47" strokeWidth="2.5" filter="url(#softShadow)" />
              <text x="256" y="76" textAnchor="middle" className="role-label" fontSize="15">GOVERNING BODY</text>
              <text x="256" y="93" textAnchor="middle" fill="#C9B38A" fontSize="9" fontFamily="Inter, system-ui">42 CFR §484.105(a) • Final Authority</text>
              {/* Orange marker pill */}
              {!isUnlocked('gb') && <circle cx="328" cy="82" r="6.5" fill="#C74601" />}
              {isUnlocked('gb') && <circle cx="328" cy="82" r="6" fill="#0F5B54" />}
            </g>

            {/* Branch lines from GB down to Admin and DON tops - exact centers */}
            <line x1="256" y1="116" x2="149" y2="148" stroke="#1E3A5F" strokeWidth="2.5" />
            <line x1="256" y1="116" x2="363" y2="148" stroke="#1E3A5F" strokeWidth="2.5" />

            {/* Lines from Admin and DON bottoms directly to CO top - exact connection */}
            <line x1="149" y1="210" x2="149" y2="292" stroke="#1E3A5F" strokeWidth="2.5" />
            <line x1="363" y1="210" x2="363" y2="292" stroke="#1E3A5F" strokeWidth="2.5" />

            {/* COMPLIANCE OFFICER — DUAL REPORTING (coral dashed lines from CO up to Admin and GB) */}
            <g 
              className={`hotspot-group ${bloomingId === 'co' ? 'node-bloom' : ''} ${isUnlocked('co') ? 'unlocked-node' : ''}`}
              onClick={() => handleNodeClick('co')}
              onKeyDown={(e) => handleNodeKeyDown(e, 'co')}
              role="button"
              tabIndex={0}
              aria-label="Compliance Officer — Dual reporting to Administrator and Governing Body. Click to unlock."
            >
              {/* Dual coral dashed lines - start exactly at CO top center (256,292) and connect up */}
              {/* To Admin bottom center */}
              <path d="M 256 292 Q 200 250 149 210" fill="none" stroke="#C74601" strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round" className="pulse-line" />
              {/* To GB bottom center */}
              <path d="M 256 292 Q 256 200 256 116" fill="none" stroke="#C74601" strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round" className="pulse-line" />
              {/* To DON bottom center */}
              <path d="M 256 292 Q 310 250 363 210" fill="none" stroke="#C74601" strokeWidth="3" strokeDasharray="8 5" strokeLinecap="round" className="pulse-line" />

              <rect x="158" y="292" width="196" height="58" rx="9" fill="url(#nodeCO)" stroke="#9F3A03" strokeWidth="2.5" filter="url(#softShadow)" />
              <text x="256" y="316" textAnchor="middle" className="role-label" fontSize="13">COMPLIANCE OFFICER</text>
              <text x="256" y="332" textAnchor="middle" fill="#FAD9C5" fontSize="9" fontFamily="Inter">Dual Report • Admin + Governing Body (OIG)</text>
              {!isUnlocked('co') && <circle cx="338" cy="322" r="6" fill="#C74601" />}
              {isUnlocked('co') && <circle cx="338" cy="322" r="5.5" fill="#0F5B54" />}
            </g>
          </g>

          {/* Additional premium office artifacts for objectives (tied to real learning) */}
          {/* Briefing folder - Objective 1 */}
          <g 
            className="artifact-hotspot" 
            onClick={() => handleNodeClick('briefing')} 
            role="button" 
            tabIndex={0}
            aria-label="Heidi's Welcome Briefing folder - Click for Objective 1"
          >
            <rect x="80" y="400" width="40" height="25" rx="2" fill="#8B5E3C" stroke="#5C4033" strokeWidth="1" />
            <text x="100" y="417" textAnchor="middle" fontSize="6" fill="#FDF8F3">BRIEFING</text>
          </g>

          {/* Policy binder GV-OG-001 - for compliance learning */}
          <g 
            className="artifact-hotspot" 
            onClick={() => handleNodeClick('policy')} 
            role="button" 
            tabIndex={0}
            aria-label="Policy binder GV-OG-001"
          >
            <rect x="130" y="410" width="30" height="20" rx="1" fill="#1E3A5F" stroke="#142A47" strokeWidth="1" />
            <text x="145" y="424" textAnchor="middle" fontSize="5" fill="#FDF8F3">GV-OG-001</text>
          </g>

          {/* === DESK + HEIDI FIGURE (professional scrubs, breathe) === */}
          <g transform="translate(115, 385)">
            {/* Desk top — rich warm wood */}
            <rect x="0" y="78" width="295" height="18" rx="3" fill="#6B523F" filter="url(#softShadow)" />
            <rect x="4" y="78" width="287" height="5" fill="#8C6F55" />

            {/* Desk legs */}
            <rect x="18" y="96" width="11" height="92" rx="2" fill="#463424" />
            <rect x="266" y="96" width="11" height="92" rx="2" fill="#463424" />

            {/* Heidi — professional home health clinician in teal scrubs */}
            <g transform="translate(165, 12)">
              {/* Legs / skirt */}
              <rect x="22" y="118" width="13" height="58" rx="3" fill="#0F5B54" />
              <rect x="39" y="118" width="13" height="58" rx="3" fill="#0F5B54" />
              <ellipse cx="28" cy="178" rx="9" ry="4.5" fill="#2A2A2A" />
              <ellipse cx="46" cy="178" rx="9" ry="4.5" fill="#2A2A2A" />

              {/* Torso + breathe */}
              <g className="heidi-breathe">
                <rect x="17" y="58" width="50" height="65" rx="7" fill="#0F5B54" />
                {/* Subtle seam detail */}
                <path d="M 24 65 L 60 65" fill="none" stroke="#0A423D" strokeWidth="1.5" />
                <rect x="33" y="72" width="18" height="11" fill="#C9B38A" rx="2" opacity="0.6" />
                {/* Arms */}
                <path d="M 18 72 Q 2 110 12 135" fill="none" stroke="#0A423D" strokeWidth="11" strokeLinecap="round" />
                <path d="M 66 72 Q 82 110 71 135" fill="none" stroke="#0A423D" strokeWidth="11" strokeLinecap="round" />
                {/* Hands */}
                <circle cx="12" cy="137" r="7" fill="#E8C8A8" />
                <circle cx="71" cy="137" r="7" fill="#E8C8A8" />
              </g>

              {/* Head + subtle nod/breathe */}
              <g className="heidi-breathe" style={{ animationDelay: '820ms' }}>
                <circle cx="42" cy="42" r="17" fill="#E8C8A8" />
                {/* Hair professional */}
                <path d="M 26 32 Q 42 15 58 32 Q 57 46 42 48 Q 27 46 26 32" fill="#2C2520" />
                {/* Scrub collar highlight */}
                <circle cx="42" cy="55" r="6" fill="#C9B38A" opacity="0.3" />
                {/* Eyes */}
                <circle cx="35" cy="41" r="2.6" fill="#2C2520" />
                <circle cx="49" cy="41" r="2.6" fill="#2C2520" />
                {/* Professional calm smile */}
                <path d="M 36 49 Q 42 52.5 48 49" fill="none" stroke="#B36B4D" strokeWidth="1.6" strokeLinecap="round" />
              </g>

              {/* ID badge on scrubs */}
              <rect x="55" y="85" width="12" height="15" rx="1.5" fill="#FDF8F3" stroke="#0A423D" strokeWidth="0.8" />
              <rect x="57" y="87" width="8" height="3.5" fill="#0F5B54" />
            </g>

            {/* Potted plant on desk — sway */}
            <g transform="translate(22, 18)" className="plant-sway">
              <rect x="14" y="55" width="38" height="10" fill="#5C4033" rx="2" />
              <path d="M 18 54 Q 10 22 30 14" fill="none" stroke="#2E7D32" strokeWidth="13" strokeLinecap="round" />
              <path d="M 48 54 Q 55 26 35 16" fill="none" stroke="#1B5E20" strokeWidth="12" strokeLinecap="round" />
              <circle cx="33" cy="18" r="4" fill="#388E3C" />
            </g>

            {/* Phone (hotline visual cue, part of challenge area) */}
            <g transform="translate(228, 42)" onClick={() => handleNodeClick('challenge')} style={{ cursor: 'pointer' }}>
              <rect x="0" y="0" width="46" height="28" rx="5" fill="#2C2520" filter="url(#softShadow)" />
              <rect x="6" y="5" width="34" height="8" rx="2" fill="#C9B38A" />
              <circle cx="13" cy="20" r="3" fill="#C74601" />
              <circle cx="33" cy="20" r="3" fill="#C74601" />
            </g>
          </g>

          {/* Notebook / field notes cue (5th ambient hotspot) */}
          <g 
            transform="translate(78, 462)" 
            className="hotspot-group"
            onClick={() => {
              // Bonus unlock if survey knowledge node
              if (!isUnlocked('gb')) handleNodeClick('gb');
              else if (!isUnlocked('co')) handleNodeClick('co');
              else handleNodeClick('challenge');
            }}
            role="button"
            tabIndex={0}
            aria-label="Field notebook — survey questions and escalation notes"
          >
            <rect width="58" height="44" rx="3" fill="#F5F0E6" stroke="#3A2F24" strokeWidth="2" />
            <line x1="9" y1="11" x2="49" y2="11" stroke="#1E3A5F" strokeWidth="1.5" />
            <line x1="9" y1="19" x2="49" y2="19" stroke="#1E3A5F" strokeWidth="1.5" />
            <line x1="9" y1="27" x2="41" y2="27" stroke="#1E3A5F" strokeWidth="1.5" />
            <circle cx="50" cy="35" r="3.5" fill="#C74601" />
          </g>

          {/* Subtle ambient wall lamp light */}
          <g transform="translate(870, 72)">
            <ellipse cx="22" cy="28" rx="44" ry="19" fill="#F4E9C8" opacity="0.12" />
            <rect x="12" y="8" width="20" height="34" rx="3" fill="#3A2F24" />
          </g>
        </svg>

        {/* 5+ Tasteful SVG-native Hotspot Overlays (navy pill + orange marker aesthetic) */}
        {/* These are positioned to align with SVG nodes for premium feel while keeping pure interaction inside SVG groups above. Additional visual cues. */}
        {/* (The actual click targets are the SVG groups with full ARIA for accessibility.) */}

        {/* Elegant docked / overlay PHASE PANEL */}
        {showPanel && (
          <div className="absolute inset-0 z-30 bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4 md:p-8" onClick={closePanel}>
            <div 
              className="premium-panel bg-white rounded-2xl w-full max-w-[520px] overflow-hidden border border-[#E5E4E3]"
              onClick={e => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="px-6 pt-5 pb-3 bg-[#0F5B54] text-white flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {activeIsChallenge ? (
                    <PhoneCall className="w-5 h-5 mt-0.5" />
                  ) : currentRole ? (
                    <currentRole.icon className="w-5 h-5 mt-0.5" />
                  ) : null}
                  <div>
                    <div className="font-semibold text-[15px] tracking-[-0.1px]">
                      {activeIsChallenge ? CHALLENGE_NODE.label : currentRole?.label}
                    </div>
                    <div className="text-[10px] opacity-75 tracking-[0.5px] uppercase">
                      {activeIsChallenge ? 'Escalation Decision' : 'Role &amp; Authority'}
                    </div>
                  </div>
                </div>
                <button onClick={closePanel} className="p-1.5 -mr-1 text-white/70 hover:text-white" aria-label="Close panel">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Phase Indicator */}
              <div className="px-6 pt-4 flex items-center gap-2">
                {[1,2,3,4].map(p => (
                  <div key={p} className={`phase-dot ${interactionPhase >= p ? (interactionPhase > p ? 'complete' : 'active') : ''}`} />
                ))}
                <div className="ml-2 text-[10px] font-bold tracking-widest text-[#5F5A57] uppercase">
                  {interactionPhase === 1 && 'STORY BEAT'}
                  {interactionPhase === 2 && 'FULL CONTENT'}
                  {interactionPhase === 3 && 'SURVEY TIE-IN'}
                  {interactionPhase === 4 && 'ACKNOWLEDGE'}
                  {activeIsChallenge && interactionPhase >= 2 && 'DECISION COMPLETE'}
                </div>
              </div>

              {/* Content by Phase */}
              <div className="p-6 pt-4 text-[13.5px] leading-relaxed text-[#2D2A28]">
                {!activeIsChallenge && currentRole && (
                  <>
                    {interactionPhase === 1 && (
                      <div>
                        <p className="text-[#524C4B] mb-3">Heidi studies the wall chart. This role is one of the four pillars that keeps patients safe when clinicians are alone in the home.</p>
                        <div className="text-xs uppercase tracking-widest text-[#0F5B54] font-bold mt-2">Click NEXT to continue</div>
                      </div>
                    )}
                    {interactionPhase >= 2 && (
                      <div className="bg-[#F8F5F0] border border-[#E5E4E3] rounded-xl p-4 mb-3">
                        <p>{currentRole.body}</p>
                        <div className="mt-3 text-[11px] font-semibold text-[#0F5B54] tracking-wide">{currentRole.citation}</div>
                      </div>
                    )}
                    {interactionPhase >= 3 && (
                      <div className="border-l-4 border-[#C74601] pl-4 text-[13px] text-[#3F3B38]">
                        <div className="uppercase text-[10px] tracking-[1px] font-bold text-[#C74601] mb-1">SURVEY READINESS</div>
                        {currentRole.surveyTieIn}
                      </div>
                    )}
                  </>
                )}

                {/* CHALLENGE — 4 beautiful options, verbatim feedback */}
                {activeIsChallenge && (
                  <div>
                    <div className="bg-[#FDF6F0] border border-[#E8C7B3] rounded-xl p-4 mb-4">
                      <div className="uppercase tracking-[1px] text-xs font-bold text-[#C74601] mb-1.5">FIELD SCENARIO</div>
                      <p className="font-medium text-[#2D2A28]">{CHALLENGE_NODE.prompt}</p>
                    </div>

                    <div className="space-y-2">
                      {CHALLENGE_NODE.options.map((opt, _idx) => {
                        const selected = challengeSelection === opt.id;
                        const shown = challengeFeedback && selected;
                        const isGood = shown && challengeFeedback.correct;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleChallengeSelect(opt)}
                            disabled={!!challengeSelection && !shown}
                            className={`w-full text-left rounded-xl border-2 p-3.5 transition-all flex gap-3 items-start
                              ${selected && isGood ? 'border-[#0F5B54] bg-[#E8F5F3] ring-1 ring-[#0F5B54]' : ''}
                              ${selected && !isGood ? 'border-[#B45309] bg-[#FEF4EB]' : ''}
                              ${!selected && challengeSelection ? 'opacity-60' : 'border-[#E5E4E3] hover:border-[#C74601]/60 bg-white'}
                            `}
                          >
                            <div className="mt-0.5 shrink-0 text-[#0F5B54]">
                              {shown && isGood && <CheckCircle2 className="w-5 h-5 text-[#0F5B54]" />}
                              {shown && !isGood && <XCircle className="w-5 h-5 text-[#B45309]" />}
                              {!shown && <div className="w-5 h-5 rounded-full border-2 border-current opacity-35" />}
                            </div>
                            <div className="text-[13.2px] leading-snug text-[#2D2A28]">{opt.label}</div>
                          </button>
                        );
                      })}
                    </div>

                    {challengeFeedback && (
                      <div className={`mt-4 rounded-xl p-4 text-sm border ${challengeFeedback.correct ? 'bg-[#E8F5F3] border-[#0F5B54] text-[#0F5B54]' : 'bg-[#FEF4EB] border-[#B45309] text-[#7B4B1F]'}`}>
                        <div className="font-bold uppercase tracking-widest text-xs mb-1">{challengeFeedback.correct ? 'CORRECT PATH' : 'NOT THE BEST PATH'}</div>
                        {challengeFeedback.text}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Panel Footer Actions */}
              <div className="px-6 pb-6 pt-1 flex gap-2 justify-end bg-white border-t border-[#E5E4E3]">
                {activeIsChallenge ? (
                  <>
                    <button onClick={closePanel} className="px-5 py-2 text-sm font-semibold rounded-xl border border-[#D8D4CC] hover:bg-[#F8F5F0]">CLOSE</button>
                    {challengeComplete && (
                      <button onClick={closePanel} className="px-6 py-2 bg-[#0F5B54] hover:bg-[#0A423D] text-white text-sm font-bold tracking-wider rounded-xl">RETURN TO MAP</button>
                    )}
                  </>
                ) : (
                  <>
                    {interactionPhase < 4 && (
                      <button 
                        onClick={advancePhase}
                        className="px-6 py-2.5 rounded-xl bg-[#0F5B54] text-white text-sm font-bold tracking-widest active:bg-[#083D38] transition"
                      >
                        {interactionPhase === 3 ? 'ACKNOWLEDGE &amp; CONTINUE' : 'NEXT'}
                      </button>
                    )}
                    {interactionPhase === 4 && (
                      <button onClick={closePanel} className="px-6 py-2.5 rounded-xl bg-[#0F5B54] text-white text-sm font-bold tracking-widest">RETURN TO OFFICE</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Completion Overlay — Premium tasteful */}
        {isFullyComplete && !showPanel && (
          <div className="absolute inset-0 z-40 bg-[#0F5B54]/90 backdrop-blur-md flex items-center justify-center p-6 animate-pop-in" style={{ animation: 'popIn 420ms cubic-bezier(0.16,1,0.3,1) forwards' }}>
            <div className="bg-white rounded-2xl px-9 py-8 max-w-md text-center border-4 border-[#E5FEFF] shadow-2xl">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#E8F5F3] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9 text-[#0F5B54]" />
              </div>
              <div className="text-xl font-semibold text-[#0F5B54] tracking-[-0.2px] mb-2">{COMPLETION_LABEL}</div>
              <p className="text-[#524C4B] text-[13px] leading-relaxed mb-5">
                You have unlocked the four governance roles and mastered the correct escalation pathway. You can now answer surveyor questions from memory and protect patients through proper reporting lines.
              </p>
              <div className="inline-block text-xs tracking-[1.5px] font-bold text-[#C74601] bg-[#FDF6F0] px-4 py-1.5 rounded-lg border border-[#E8C7B3]">
                READY FOR COVERAGE &amp; CONTINUITY
              </div>
              <button onClick={resetAll} className="block mx-auto mt-6 text-xs text-[#0F5B54] underline underline-offset-2">Replay scene</button>
            </div>
          </div>
        )}

        {/* Live region for narration tiers + a11y announcements */}
        <div 
          ref={liveRef} 
          aria-live="polite" 
          className="sr-only"
          role="status"
        >
          {narrationLog}
        </div>
      </div>

      {/* Subtle footer bar matching premium aesthetic */}
      <div className="h-8 bg-[#F4F1EA] border-t border-[#E5E4E3] text-[10px] text-[#5F5A57] flex items-center px-6 tracking-[0.5px]">
        <span>Click roles or the phone to unlock. Dual coral lines on Compliance Officer highlight protected reporting. Keyboard accessible.</span>
        {isFullyComplete && <span className="ml-auto font-semibold text-[#0F5B54]">SCENE READY FOR NEXT</span>}
      </div>
    </div>
  );
}
