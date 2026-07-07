/**
 * GAO-002 Shared Systems & Narration Foundations
 *
 * Reusable premium foundations for all GAO-002 interactive scenes.
 * Built to the exact visual/interaction benchmark of CoreValuesInteractiveViewer + GAO-001 Scene 4.
 * Expensive, restrained, accessible, self-contained (no external audio assets).
 *
 * Import pattern for scenes:
 *   import { GAO002_COLORS, PremiumSoftAudio, audio, useNarrationTiers, useUnlockState, ... } from './gao002-shared';
 *
 * All volumes low, tones warm/musical. .resume() safe. Mute propagates.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// 6. COLOR TOKENS — matching GAO-001 Scene 4 / CoreValues benchmark exactly
// =============================================================================
export const GAO002_COLORS = {
  // Core palette (locked benchmark)
  teal: '#0F5B54',
  deepNavy: '#1E3A3A',
  warmTeal: '#007970',
  tealMuted: '#2B7A71',
  orange: '#C74601',
  orangeHover: '#A63A01',

  // Surfaces (warm, high contrast, no pale wash)
  cream: '#FDF8F3',
  warmCream: '#F8F1E9',
  lightTeal: '#EEF4F3',
  softTeal: '#E8F5F3',

  // States (professional, tasteful)
  success: '#006B3A',
  successLight: '#E6F4E9',
  error: '#8B2C2C',
  errorLight: '#F8E8E8',
  warning: '#8A5C00',

  // Text
  textDark: '#1E3A3A',
  textMuted: '#475569',

  // Accents
  white: '#FFFFFF',
  border: '#E5E4E3',
} as const;

export type GAO002ColorKey = keyof typeof GAO002_COLORS;

// =============================================================================
// 1. PREMIUM SOFT AUDIO — enhanced from GAO001 SoftAudio + CoreValuesInteractiveAudioSynth
// =============================================================================
export type SoundType =
  | 'unlock'          // soft unlock arpeggio
  | 'correct'         // correct gentle major chord chime
  | 'error'           // soft error low sine
  | 'advance'         // advance whoosh (subtle)
  | 'complete'        // complete resonant bell
  | 'click'           // minimal soft click (legacy safe)
  | 'hotspot';        // subtle marker ping

export class PremiumSoftAudio {
  private ctx: AudioContext | null = null;
  private _muted = false;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      // Safe resume — never throw
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  get muted() { return this._muted; }

  setMuted(m: boolean) {
    this._muted = m;
  }

  toggleMute() {
    this.setMuted(!this._muted);
    return this._muted;
  }

  /** Play one of the premium tasteful tones. All low volume, warm musical. */
  play(type: SoundType) {
    if (this._muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'unlock': {
        // Soft unlock arpeggio — gentle ascending major 3rd + 5th (warm, low)
        const notes = [392.0, 493.88, 587.33]; // G4, B4, D5
        notes.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const fNode = ctx.createBiquadFilter();
          fNode.type = 'lowpass';
          fNode.frequency.value = 1800;

          o.type = 'sine';
          o.frequency.value = f;

          g.gain.value = 0.018;
          g.gain.linearRampToValueAtTime(0.0008, now + 0.55 + i * 0.06);

          o.connect(fNode);
          fNode.connect(g);
          g.connect(ctx.destination);

          o.start(now + i * 0.065);
          o.stop(now + 0.85 + i * 0.06);
        });
        break;
      }

      case 'correct': {
        // Correct gentle major chord chime — C major triad, soft decay
        const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
        notes.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const fNode = ctx.createBiquadFilter();
          fNode.type = 'lowshelf';
          fNode.frequency.value = 800;
          fNode.gain.value = -2;

          o.type = 'sine';
          o.frequency.value = f;

          g.gain.value = 0.022;
          g.gain.linearRampToValueAtTime(0.0006, now + 0.72 + i * 0.03);

          o.connect(fNode);
          fNode.connect(g);
          g.connect(ctx.destination);

          o.start(now + i * 0.035);
          o.stop(now + 0.95 + i * 0.03);
        });
        break;
      }

      case 'error': {
        // Soft error low sine — low, warm, non-jarring
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const fNode = ctx.createBiquadFilter();
        fNode.type = 'lowpass';
        fNode.frequency.value = 650;

        o.type = 'sine';
        o.frequency.value = 196.0; // G3 low

        g.gain.value = 0.028;
        g.gain.linearRampToValueAtTime(0.0008, now + 0.38);

        o.connect(fNode);
        fNode.connect(g);
        g.connect(ctx.destination);

        o.start(now);
        o.stop(now + 0.42);
        break;
      }

      case 'advance': {
        // Advance whoosh — subtle filtered noise sweep (tasteful, not harsh)
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.45, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;

        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.value = 620;
        f.Q.value = 1.8;

        g.gain.value = 0.012;
        g.gain.linearRampToValueAtTime(0.0004, now + 0.42);

        const master = ctx.createGain();
        master.gain.value = 0.65;

        noise.connect(f);
        f.connect(g);
        g.connect(master);
        master.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.46);
        break;
      }

      case 'complete': {
        // Complete resonant bell — warm C major + octave, longer tail
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
        notes.forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          const fNode = ctx.createBiquadFilter();
          fNode.type = 'lowpass';
          fNode.frequency.value = 2400;

          o.type = 'sine';
          o.frequency.value = f;

          g.gain.value = 0.016;
          g.gain.linearRampToValueAtTime(0.0003, now + 1.15 + i * 0.07);

          o.connect(fNode);
          fNode.connect(g);
          g.connect(ctx.destination);

          o.start(now + i * 0.055);
          o.stop(now + 1.35 + i * 0.07);
        });
        break;
      }

      case 'click': {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 920;
        g.gain.value = 0.015;
        g.gain.linearRampToValueAtTime(0.0004, now + 0.07);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.09);
        break;
      }

      case 'hotspot': {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 740;
        g.gain.value = 0.012;
        g.gain.linearRampToValueAtTime(0.0003, now + 0.18);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.2);
        break;
      }
    }
  }
}

// Singleton instance — scenes import { audio } and call audio.play('unlock')
export const audio = new PremiumSoftAudio();

// =============================================================================
// 2. NARRATION TIER ENGINE — exactly 4 tiers per 00-OVERVIEW.md
// Tiers populated from exact narration + challenge text in trainingContent.gao.001-007.ts
// =============================================================================
export type NarrationTier = 'scene_start' | 'node_unlock' | 'feedback' | 'scene_complete';

export interface TierNarration {
  tier: NarrationTier;
  text: string;
  citation?: string;
}

const TIER_REGISTRY: Record<string, Partial<Record<NarrationTier, string>>> = {
  // Scene-level
  'scene-start': {
    scene_start:
      "Heidi's first week. Dana hands her the interactive reporting map. 'This is who we are on paper — and why it matters when you're alone with a patient.'",
  },
  'scene-complete': {
    scene_complete:
      "Reporting Lines Practice Complete. You now know the governance roles, dual reporting line, and escalation paths. Ready for coverage and on-call.",
  },

  // Scene 1 nodes — derived verbatim from trainingContent.gao.001-007.ts cards L1-C1..C5 + CH
  'gao002-s1-gb': {
    node_unlock:
      "The Governing Body holds final legal authority for agency operations under 42 CFR 484.105(a). It approves the budget, the scope of services, the QAPI program, and the Compliance Officer appointment. It must meet at least quarterly and review compliance and quality reports at every meeting.",
  },
  'gao002-s1-admin': {
    node_unlock:
      "The Administrator is responsible for day-to-day agency operations under 42 CFR 484.105(b). The Director of Nursing supervises all clinical practice under 42 CFR 484.105(c). Both must be available during operating hours, and both must designate a qualified alternate when they are absent. Surveyors will verify that the alternate is documented.",
  },
  'gao002-s1-don': {
    node_unlock:
      "The Director of Nursing supervises all clinical practice. The DON must be available during operating hours and must designate a qualified alternate during absences. Surveyors verify alternate designation.",
  },
  'gao002-s1-co': {
    node_unlock:
      "The Compliance Officer reports to BOTH the Administrator AND the Governing Body. This dual line is required by OIG guidance so that compliance issues cannot be suppressed by operations leadership. You may report concerns to the Compliance Officer directly without going through your supervisor.",
  },
  'gao002-s1-ch': {
    node_unlock:
      "Scenario. You suspect billing for visits that did not occur, and your direct supervisor appears to be involved. Choose the correct escalation path.",
    feedback:
      "Correct: Report directly to the Compliance Officer using the hotline. Dual reporting protects you from retaliation and bypasses the implicated leader. Compliance Officer escalation through the hotline is the correct path. Dual reporting and whistleblower protection apply. Any path that goes through, around, or delays past the implicated supervisor risks ongoing fraud and removes whistleblower protection. Suspected false claims must be reported under CO-CP-005; failure to report is itself a compliance violation. False claims expose the agency to treble damages under the False Claims Act.",
  },

  // Scene 2 nodes — from L2-C1..C4 + CH
  'gao002-s2-oncall': {
    node_unlock:
      "The on-call hierarchy is: primary on-call clinician, on-call DON, on-call Administrator. The roster is posted weekly in the electronic medical record and is texted to every field staff member. An outdated roster is a survey finding.",
  },
  'gao002-s2-alternate': {
    node_unlock:
      "When the Administrator or DON is absent more than one business day, a qualified alternate is designated in writing and the workforce is notified. Alternates must meet the qualification standards specified in their job descriptions.",
  },
  'gao002-s2-field': {
    node_unlock:
      "Field example. You are the LVN on call. Ten PM call: patient unresponsive. You tell the HHA to call nine-one-one and stay, you reach the DON. Per GV-OG-001 you log every step in the EMR. Next morning the Administrator gets the summary. The structure prevents dropped balls.",
  },
  'gao002-s2-roster': {
    node_unlock:
      "Practical tip. Friday afternoon, screenshot the on-call roster to your phone. If cell service drops in the field you still have the names and numbers. This habit prevents the common 'could not reach anyone' citation.",
  },
  'gao002-s2-ch': {
    node_unlock:
      "Scenario. It is Saturday evening at twenty-one hundred. You need clinical guidance on a possible adverse drug event. Who do you call first?",
    feedback:
      "Correct: The on-call clinician per the posted roster. Clinical questions go to the on-call clinician first. On-call clinician is the first call for clinical guidance; the DON and Administrator escalate from there. Skipping the clinical on-call breaks the chain of supervision required by 42 CFR 484.105. Inability to identify the on-call structure is a workforce-knowledge survey finding.",
  },
};

export function useNarrationTiers(initialNode?: string) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialNode || 'scene-start');
  const [currentTier, setCurrentTier] = useState<NarrationTier>('scene_start');

  const setTier = useCallback((tier: NarrationTier, nodeId?: string) => {
    if (nodeId) setCurrentNodeId(nodeId);
    setCurrentTier(tier);
    // Optional: soft audio cue on tier change (advance or unlock feel)
    if (tier === 'node_unlock') audio.play('unlock');
    if (tier === 'feedback') audio.play('correct');
    if (tier === 'scene_complete') audio.play('complete');
  }, []);

  const getTierTextFor = useCallback((nodeId: string, tier: NarrationTier): string => {
    const entry = TIER_REGISTRY[nodeId] || TIER_REGISTRY['scene-start'];
    if (tier === 'scene_start') return entry?.scene_start || TIER_REGISTRY['scene-start']!.scene_start!;
    if (tier === 'scene_complete') return entry?.scene_complete || TIER_REGISTRY['scene-complete']!.scene_complete!;
    if (tier === 'node_unlock') return entry?.node_unlock || '';
    if (tier === 'feedback') return entry?.feedback || '';
    return '';
  }, []);

  const currentNarration = getTierTextFor(currentNodeId, currentTier);

  const setNode = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
    setCurrentTier('node_unlock'); // default to full instructional on node focus
  }, []);

  return {
    currentNarration,
    currentTier,
    currentNodeId,
    setTier,
    setNode,
    getTierTextFor,
  };
}

// =============================================================================
// 4. UNLOCK STATE MANAGER — simple, self-contained hook
// =============================================================================
export function useUnlockState(initial?: string[]) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set(initial || []));

  const markUnlocked = useCallback((id: string) => {
    setUnlocked(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const isUnlocked = useCallback((id: string) => unlocked.has(id), [unlocked]);

  const progress = unlocked.size; // caller knows total
  const progressPct = (total: number) => total > 0 ? Math.round((unlocked.size / total) * 100) : 0;

  const reset = useCallback(() => setUnlocked(new Set()), []);

  return { unlocked, markUnlocked, isUnlocked, progress, progressPct, reset };
}

// =============================================================================
// 5. ACCESSIBILITY HELPERS
// =============================================================================
export interface KeyboardHotspotOptions {
  onActivate: () => void;
  label: string;
  disabled?: boolean;
}

export function useKeyboardHotspot({ onActivate, label, disabled }: KeyboardHotspotOptions) {
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  }, [onActivate, disabled]);

  return {
    role: 'button' as const,
    tabIndex: disabled ? -1 : 0,
    'aria-label': label,
    onKeyDown,
    onClick: disabled ? undefined : onActivate,
  };
}

export function ariaLiveRegionProps(polite = true) {
  return {
    role: 'status' as const,
    'aria-live': (polite ? 'polite' : 'assertive') as 'polite' | 'assertive',
    'aria-atomic': true as const,
  };
}

// =============================================================================
// 3. COMMON PREMIUM UI PRIMITIVES (restrained, benchmark-matched)
// =============================================================================

// ElegantProgressChip / bar
export const ElegantProgressChip: React.FC<{
  current: number;
  total: number;
  label?: string;
  className?: string;
}> = ({ current, total, label = 'Unlocked', className = '' }) => {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.5px] bg-white ${className}`}
      style={{ border: `1px solid ${GAO002_COLORS.border}`, color: GAO002_COLORS.textDark }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GAO002_COLORS.teal }} />
        <span>{current} / {total} {label}</span>
      </div>
      <div className="text-[10px] font-mono opacity-70">{pct}%</div>
    </div>
  );
};

// HotspotPill — navy bg, white text, orange dot accent (exact benchmark)
export const HotspotPill: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  completed?: boolean;
  className?: string;
}> = ({ children, onClick, active, completed, className = '' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.6px] uppercase transition-all select-none
      ${completed ? 'bg-[#007970] text-white' : 'bg-[#1E3A3A] text-white hover:brightness-110'}
      ${active ? 'ring-2 ring-offset-2 ring-[#C74601]' : ''}
      ${className}`}
    style={{ backgroundColor: completed ? GAO002_COLORS.warmTeal : GAO002_COLORS.deepNavy }}
    aria-pressed={active}
  >
    <span
      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
      style={{ backgroundColor: GAO002_COLORS.orange }}
    />
    {children}
  </button>
);

// PhasedContentCard — tabs or sequential Next for tiers
export const PhasedContentCard: React.FC<{
  nodeId: string;
  tiers: NarrationTier[];
  currentTier: NarrationTier;
  onTierChange: (t: NarrationTier) => void;
  getText: (n: string, t: NarrationTier) => string;
  title?: string;
  children?: React.ReactNode; // optional extra (Field Notes etc)
}> = ({ nodeId, tiers, currentTier, onTierChange, getText, title, children }) => {
  const text = getText(nodeId, currentTier);
  const idx = tiers.indexOf(currentTier);

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm" style={{ borderColor: GAO002_COLORS.border }}>
      {title && <div className="font-bold text-sm mb-3" style={{ color: GAO002_COLORS.teal }}>{title}</div>}

      <div className="flex gap-1 mb-4 border-b pb-2" style={{ borderColor: GAO002_COLORS.lightTeal }}>
        {tiers.map((t, i) => (
          <button
            key={t}
            onClick={() => onTierChange(t)}
            className={`px-3 py-1 text-xs font-bold tracking-widest rounded transition ${currentTier === t ? 'text-white' : 'text-[#475569] hover:bg-[#EEF4F3]'}`}
            style={currentTier === t ? { backgroundColor: GAO002_COLORS.teal } : {}}
          >
            {t.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="prose prose-sm max-w-none text-[#1E3A3A] leading-relaxed text-[13px]">
        {text || <em className="opacity-60">No narration for this tier yet.</em>}
      </div>

      {children}

      {idx < tiers.length - 1 && (
        <button
          onClick={() => onTierChange(tiers[idx + 1])}
          className="mt-4 text-xs uppercase tracking-[1px] font-bold px-4 py-1.5 rounded bg-[#0F5B54] text-white hover:bg-[#0A4741]"
        >
          Next Tier →
        </button>
      )}
    </div>
  );
};

// DecisionOption — beautiful cards, hover / selected / correct/incorrect
export const DecisionOption: React.FC<{
  id: string;
  label: string;
  selected?: boolean;
  correct?: boolean | null; // null = not evaluated, true = correct, false = incorrect
  onSelect: (id: string) => void;
  disabled?: boolean;
}> = ({ id, label, selected, correct, onSelect, disabled }) => {
  let bg = GAO002_COLORS.white;
  let border = GAO002_COLORS.border;
  let text = GAO002_COLORS.textDark;

  if (correct === true) {
    bg = GAO002_COLORS.successLight;
    border = GAO002_COLORS.success;
    text = GAO002_COLORS.success;
  } else if (correct === false) {
    bg = GAO002_COLORS.errorLight;
    border = GAO002_COLORS.error;
    text = GAO002_COLORS.error;
  } else if (selected) {
    bg = GAO002_COLORS.lightTeal;
    border = GAO002_COLORS.teal;
  }

  return (
    <button
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className="w-full text-left p-4 rounded-xl border transition-all text-[13px] font-medium hover:shadow-sm focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: bg,
        borderColor: border,
        color: text,
        opacity: disabled && correct === null ? 0.6 : 1,
      }}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{
            borderColor: correct === true ? GAO002_COLORS.success : correct === false ? GAO002_COLORS.error : GAO002_COLORS.deepNavy,
            backgroundColor: correct === true ? GAO002_COLORS.success : correct === false ? GAO002_COLORS.error : 'transparent',
            color: correct !== null ? 'white' : GAO002_COLORS.deepNavy,
          }}
        >
          {correct === true ? '✓' : correct === false ? '✕' : ''}
        </div>
        <span>{label}</span>
      </div>
    </button>
  );
};

// FeedbackToast / panel (tasteful green/red, professional)
export const FeedbackPanel: React.FC<{
  kind: 'correct' | 'incorrect';
  message: string;
  regulatory?: string;
  onDismiss?: () => void;
}> = ({ kind, message, regulatory, onDismiss }) => {
  const isCorrect = kind === 'correct';
  const accent = isCorrect ? GAO002_COLORS.success : GAO002_COLORS.error;
  const bg = isCorrect ? GAO002_COLORS.successLight : GAO002_COLORS.errorLight;

  return (
    <div className="rounded-xl p-4 border" style={{ backgroundColor: bg, borderColor: accent }}>
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="uppercase tracking-[1px] text-[10px] font-bold mb-1" style={{ color: accent }}>
            {isCorrect ? 'CORRECT' : 'NEEDS CORRECTION'}
          </div>
          <div className="text-[13px] leading-snug text-[#1E3A3A]">{message}</div>
          {regulatory && <div className="mt-2 text-[11px] opacity-80">{regulatory}</div>}
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-xs opacity-50 hover:opacity-100">×</button>
        )}
      </div>
    </div>
  );
};

// MuteToggle button (tied to shared audio singleton)
export const MuteToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [muted, setMuted] = useState(audio.muted);

  const toggle = () => {
    const next = audio.toggleMute();
    setMuted(next);
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-widest rounded border transition hover:bg-[#F8F1E9] ${className}`}
      style={{ borderColor: GAO002_COLORS.border, color: GAO002_COLORS.tealMuted }}
      aria-label={muted ? 'Unmute premium audio' : 'Mute premium audio'}
    >
      {muted ? '🔇 Muted' : '🔊 Sound'}
    </button>
  );
};

// Transcript viewer (simple, premium)
export const TranscriptViewer: React.FC<{
  text: string;
  title?: string;
  className?: string;
}> = ({ text, title = 'Narration Transcript', className = '' }) => (
  <div className={`rounded-lg border bg-[#FAFBF8] p-4 text-[12px] leading-relaxed max-h-48 overflow-auto ${className}`} style={{ borderColor: GAO002_COLORS.border, color: GAO002_COLORS.textMuted }}>
    <div className="uppercase tracking-[1px] font-bold text-[9px] mb-1.5" style={{ color: GAO002_COLORS.teal }}>{title}</div>
    <div>{text || '—'}</div>
  </div>
);

// =============================================================================
// AMBIENT KEYFRAMES (inject once in consuming scene; examples for org/roster)
// =============================================================================
export const GAO002_AMBIENT_STYLES = `
  @keyframes org-line-pulse {
    0%, 100% { stroke-opacity: 0.55; }
    50% { stroke-opacity: 0.95; }
  }
  .org-line-pulse {
    animation: org-line-pulse 3.2s ease-in-out infinite;
  }

  @keyframes roster-highlight {
    0%, 100% { background-color: #EEF4F3; }
    50% { background-color: #E8F5F3; }
  }
  .roster-highlight {
    animation: roster-highlight 2.8s ease-in-out infinite;
  }

  @keyframes premium-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .premium-fade-in {
    animation: premium-fade-in 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

// Helper to inject styles safely (call once per scene root)
export function injectGAO002AmbientStyles() {
  if (typeof document === 'undefined') return;
  const id = 'gao002-ambient-keyframes';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = GAO002_AMBIENT_STYLES;
  document.head.appendChild(style);
}

// Default export for convenience
export default {
  GAO002_COLORS,
  PremiumSoftAudio,
  audio,
  useNarrationTiers,
  useUnlockState,
  useKeyboardHotspot,
  ElegantProgressChip,
  HotspotPill,
  PhasedContentCard,
  DecisionOption,
  FeedbackPanel,
  MuteToggle,
  TranscriptViewer,
  injectGAO002AmbientStyles,
};
