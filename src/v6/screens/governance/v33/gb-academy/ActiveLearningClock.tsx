import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Clock3, Pause, ShieldCheck } from 'lucide-react';

export const MINIMUM_ACTIVE_SECONDS = 20 * 60;
export const CAPSTONE_MINIMUM_ACTIVE_SECONDS = 30 * 60;
// Instruction must remain longer than the complete scored exercise.
// Standard: brief 1m · guided learning 12m · exercise 7m total.
// Capstone: brief 1.5m · guided learning 18m · exercise 10.5m total.
export const ACTIVE_STAGE_MINIMUM_SECONDS = [60, 720, 150, 90, 60, 120] as const;
export const CAPSTONE_STAGE_MINIMUM_SECONDS = [90, 1080, 180, 150, 120, 180] as const;
export const IDLE_AFTER_SECONDS = 75;

type StoredClock = {
  version: 1;
  stageSeconds: number[];
};

export type ActiveLearningClock = {
  active: boolean;
  hydrated: boolean;
  minimumSeconds: number;
  stageBudgets: readonly number[];
  stageSeconds: number[];
  stageRemaining: (stage: number) => number;
  stageComplete: (stage: number) => boolean;
  totalSeconds: number;
  totalRemaining: number;
  minimumMet: boolean;
  reset: () => void;
};

function normalizeSeconds(value: unknown, budgets: readonly number[]) {
  if (!Array.isArray(value)) return budgets.map(() => 0);
  return budgets.map((budget, index) => {
    const seconds = Number(value[index]);
    return Number.isFinite(seconds) ? Math.min(budget, Math.max(0, Math.floor(seconds))) : 0;
  });
}

export function formatActiveTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function useActiveLearningClock({ storageKey, chapter, capstone = false }: { storageKey: string; chapter: number; capstone?: boolean }): ActiveLearningClock {
  const stageBudgets = capstone ? CAPSTONE_STAGE_MINIMUM_SECONDS : ACTIVE_STAGE_MINIMUM_SECONDS;
  const minimumSeconds = capstone ? CAPSTONE_MINIMUM_ACTIVE_SECONDS : MINIMUM_ACTIVE_SECONDS;
  const [stageSeconds, setStageSeconds] = useState<number[]>(() => stageBudgets.map(() => 0));
  const [hydrated, setHydrated] = useState(false);
  const [active, setActive] = useState(false);
  const lastActivityRef = useRef(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? JSON.parse(raw) as Partial<StoredClock> : null;
        if (parsed?.version === 1) setStageSeconds(normalizeSeconds(parsed.stageSeconds, stageBudgets));
      } catch { /* Start a clean clock when storage is unavailable or malformed. */ }
      lastActivityRef.current = Date.now();
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [storageKey, stageBudgets]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, stageSeconds } satisfies StoredClock));
    } catch { /* The in-memory clock remains authoritative for this session. */ }
  }, [hydrated, stageSeconds, storageKey]);

  useEffect(() => {
    const recordActivity = () => { lastActivityRef.current = Date.now(); };
    const recalculate = () => {
      const engaged = document.visibilityState === 'visible'
        && document.hasFocus()
        && Date.now() - lastActivityRef.current < IDLE_AFTER_SECONDS * 1000;
      setActive(engaged);
      return engaged;
    };
    const onFocus = () => { recordActivity(); recalculate(); };
    const onBlur = () => setActive(false);
    const onVisibility = () => { if (document.visibilityState === 'visible') recordActivity(); recalculate(); };

    window.addEventListener('pointerdown', recordActivity, { passive: true });
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('scroll', recordActivity, { passive: true });
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    recalculate();

    const timer = window.setInterval(() => {
      if (!hydrated || !recalculate()) return;
      setStageSeconds((current) => current.map((seconds, index) => index === chapter ? Math.min(stageBudgets[index], seconds + 1) : seconds));
    }, 1000);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [chapter, hydrated, stageBudgets]);

  const stageRemaining = useCallback((stage: number) => Math.max(0, (stageBudgets[stage] ?? 0) - (stageSeconds[stage] ?? 0)), [stageBudgets, stageSeconds]);
  const stageComplete = useCallback((stage: number) => stageRemaining(stage) === 0, [stageRemaining]);
  const totalSeconds = useMemo(() => stageSeconds.reduce((total, seconds) => total + seconds, 0), [stageSeconds]);
  const totalRemaining = Math.max(0, minimumSeconds - totalSeconds);
  const reset = useCallback(() => {
    setStageSeconds(stageBudgets.map(() => 0));
    lastActivityRef.current = Date.now();
    try { localStorage.removeItem(storageKey); } catch { /* Ignore storage cleanup failures. */ }
  }, [stageBudgets, storageKey]);

  return {
    active,
    hydrated,
    minimumSeconds,
    stageBudgets,
    stageSeconds,
    stageRemaining,
    stageComplete,
    totalSeconds,
    totalRemaining,
    minimumMet: totalRemaining === 0,
    reset,
  };
}

export function ActiveTimeCard({ clock, chapter }: { clock: ActiveLearningClock; chapter: number }) {
  const remaining = clock.stageRemaining(chapter);
  const stageDone = remaining === 0;
  const degree = Math.min(360, Math.round((clock.totalSeconds / clock.minimumSeconds) * 360));
  return (
    <section className="active-time-card" aria-label="Active mastery time">
      <div className="active-time-ring" style={{ '--active-degree': `${degree}deg` } as React.CSSProperties}>
        <span>{clock.minimumMet ? <ShieldCheck size={18} /> : stageDone ? <Check size={18} /> : clock.active ? <Clock3 size={18} /> : <Pause size={17} />}</span>
      </div>
      <div>
        <span>ACTIVE MASTERY TIME</span>
        <strong>{formatActiveTime(clock.totalSeconds)} <small>/ {formatActiveTime(clock.minimumSeconds)}</small></strong>
        <p>{clock.minimumMet ? 'Completion time satisfied' : `${formatActiveTime(clock.totalRemaining)} remains before completion`}</p>
        <em>{clock.active ? 'Focused time is counting' : 'Paused · interact to resume'}</em>
      </div>
    </section>
  );
}
