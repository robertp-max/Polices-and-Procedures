/**
 * GAO-001 v1.1 Shared Foundations
 *
 * Shared learner-module primitives for GAO-001 "A New Journey".
 * Visual/interaction benchmark: CoreValuesInteractiveViewer + GAO001Scene01WelcomeDesk quality.
 * Self-contained (no external deps beyond React/lucide).
 *
 * All completion language is safe training wording only.
 * This is a training record — separate from your assigned policy workflow.
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Volume2, VolumeX, Check
} from 'lucide-react';

// =============================================================================
// BRAND COLORS — premium calm, high contrast (teal/navy/orange/cream)
// =============================================================================
export const GAO001_COLORS = {
  teal: '#0F5B54',
  deepNavy: '#1E3A3A',
  warmTeal: '#007970',
  tealMuted: '#2B7A71',
  orange: '#C74601',
  orangeHover: '#A63A01',
  cream: '#FDF8F3',
  warmCream: '#F8F1E9',
  lightTeal: '#EEF4F3',
  softTeal: '#E8F5F3',
  success: '#006B3A',
  successLight: '#E6F4E9',
  error: '#8B2C2C',
  errorLight: '#F8E8E8',
  warning: '#8A5C00',
  textDark: '#1E3A3A',
  textMuted: '#475569',
  white: '#FFFFFF',
  border: '#E5E4E3',
  gold: '#B8860B',
} as const;

export type GAO001ColorKey = keyof typeof GAO001_COLORS;

// =============================================================================
// EXACT MANDATORY REPORTING SENTENCE (character-for-character per spec)
// =============================================================================
export const MANDATORY_REPORTING_SENTENCE =
  'Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed.';

// =============================================================================
// SELF-CONTAINED AUDIO SYNTH (low volume, warm tones, reduced-motion safe)
// =============================================================================
export type SoundType =
  | 'click' | 'open' | 'chime' | 'unlock' | 'correct' | 'error' | 'complete' | 'advance';

export class SoftAudio {
  private ctx: AudioContext | null = null;
  private _muted = false;

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this._muted = m; }
  get muted() { return this._muted; }

  play(type: SoundType) {
    if (this._muted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (type === 'click') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1180;
      g.gain.value = 0.018;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.07);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.08);
    }

    if (type === 'open') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 640;
      g.gain.value = 0.022;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.32);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.35);
    }

    if (type === 'chime' || type === 'unlock') {
      const notes = [523, 659, 784];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.014;
        g.gain.linearRampToValueAtTime(0.0001, now + 0.55 + i * 0.04);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.04); o.stop(now + 0.65 + i * 0.04);
      });
    }

    if (type === 'correct') {
      const notes = [659, 784, 988];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.018;
        g.gain.linearRampToValueAtTime(0.0001, now + 0.7 + i * 0.05);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.05); o.stop(now + 0.85 + i * 0.05);
      });
    }

    if (type === 'error') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.value = 210;
      g.gain.value = 0.035;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.22);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.24);
    }

    if (type === 'complete') {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.016;
        g.gain.linearRampToValueAtTime(0.0001, now + 0.95 + i * 0.07);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.07); o.stop(now + 1.1 + i * 0.07);
      });
    }

    if (type === 'advance') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 920;
      g.gain.value = 0.012;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.18);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.2);
    }
  }
}

export const audio = new SoftAudio();

// =============================================================================
// TYPES
// =============================================================================
export interface SceneNodeState {
  id: string;
  resolved: boolean;
  attempts: number;
}

export interface SceneProgress {
  [nodeId: string]: SceneNodeState;
}

export type SceneId = 's01' | 's02' | 's03' | 's04' | 's05' | 's06' | 's07' | 's08' | 's09';

export interface SceneProps {
  onComplete: () => void;
  isCompleted?: boolean;
  initialProgress?: any;
  onProgressChange?: (progress: any) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

// =============================================================================
// COMMON UI PRIMITIVES (accessible, reduced-motion safe)
// =============================================================================
export function ProgressRail({ current, total, label }: { current: number; total: number; label?: string }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={label || `${current} of ${total} complete`}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${i < current ? 'bg-[#0F5B54]' : 'bg-[#E5E4E3]'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-[#475569] tabular-nums">{current}/{total}</span>
    </div>
  );
}

export function CompletionBanner({ label, onNext }: { label: string; onNext?: () => void }) {
  return (
    <div className="rounded-xl border border-[#006B3A] bg-[#E6F4E9] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#006B3A] font-semibold">
        <CheckCircle2 className="w-5 h-5" />
        <span>{label}</span>
      </div>
      {onNext && (
        <button
          onClick={onNext}
          className="text-sm px-3 py-1 rounded-md bg-[#0F5B54] text-white hover:bg-[#007970] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
        >
          Continue
        </button>
      )}
    </div>
  );
}

export function SafeTrainingNote() {
  return (
    <div className="text-[10px] text-[#64748B] mt-2 italic">
      This is a training record — separate from your assigned policy workflow.
    </div>
  );
}

export function MuteToggle({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded border border-[#E5E4E3] hover:bg-[#F8F1E9] focus-visible:ring-2 focus-visible:ring-[#0F5B54]"
    >
      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      <span>{isMuted ? 'Unmute' : 'Mute'}</span>
    </button>
  );
}

export function FieldNoteCard({ title, text, reference }: { title: string; text: string; reference?: string }) {
  return (
    <div className="rounded-lg border border-[#E5E4E3] bg-white p-3 text-sm">
      <div className="font-semibold text-[#1E3A3A] mb-1">{title}</div>
      <div className="text-[#1E3A3A] leading-snug">{text}</div>
      {reference && <div className="mt-2 text-[11px] text-[#475569] border-t pt-1.5">{reference}</div>}
    </div>
  );
}

export function ReferenceRibbon({ citation, text }: { citation: string; text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#0F5B54]/30 bg-[#E8F5F3] px-3 py-1 text-xs font-semibold text-[#0F5B54]">
      <span>{citation}</span>
      {text && <span className="font-normal text-[#475569]">{text}</span>}
    </div>
  );
}

export function Hotspot({ 
  label, 
  onClick, 
  resolved, 
  ariaLabel,
  style 
}: { 
  label: string; 
  onClick: () => void; 
  resolved?: boolean; 
  ariaLabel: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`desk-clickable group inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54] ${
        resolved 
          ? 'bg-[#E6F4E9] border-[#006B3A] text-[#006B3A]' 
          : 'bg-white/90 border-[#0F5B54] text-[#0F5B54] hover:bg-[#E8F5F3]'
      }`}
      style={style}
    >
      {resolved && <Check className="w-3 h-3" />}
      {label}
    </button>
  );
}

// Reduced motion helper hook
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(m.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// Keyboard friendly wrapper for SVGs hotspots
export function SvgButton({ children, onActivate, ariaLabel, className }: { 
  children: React.ReactNode; 
  onActivate: () => void; 
  ariaLabel: string; 
  className?: string;
}) {
  return (
    <g 
      role="button" 
      tabIndex={0} 
      aria-label={ariaLabel}
      className={className || 'cursor-pointer'}
      onClick={onActivate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
    >
      {children}
    </g>
  );
}

export const SCENE_LABELS: Record<SceneId, string> = {
  s01: 'Welcome Desk',
  s02: 'Mission Briefing',
  s03: 'Vision Pillars',
  s04: 'Core Values Field Practice',
  s05: 'Home Health Differences',
  s06: 'Reporting & Escalation',
  s07: 'Patient Refusal',
  s08: 'Escalation Practice',
  s09: 'Readiness Map',
};

export const SCENE_TITLES: Record<SceneId, string> = {
  s01: 'Scene 1 — Welcome Desk',
  s02: 'Scene 2 — Mission Briefing',
  s03: 'Scene 3 — Vision Pillars',
  s04: 'Scene 4 — Core Values Field Practice',
  s05: 'Scene 5 — Home Health Differences',
  s06: 'Scene 6 — Reporting & Escalation',
  s07: 'Scene 7 — Patient Refusal',
  s08: 'Scene 8 — Escalation Practice',
  s09: 'Scene 9 — Friday Debrief / Readiness',
};
