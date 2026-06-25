// Phase 2 active-time engine (MVP).
// Real measurement: heartbeat tick, idle detection + pause, single-tab ownership
// (no cross-tab double counting), per-lesson accrual persisted to learner state.
//
// TRUTH LABEL: this is a real engine running at MVP/demo thresholds. It is NOT
// CDPH-validated. Surfaces that show active time must say "simulated / MVP preview".

import { useEffect, useRef, useState } from "react";
import { useLearner } from "./learnerState";

export const ACTIVE_TIME = {
  /** Per-lesson minimum active seconds to satisfy the lesson's time component (demo scale). */
  LESSON_MIN_SECONDS: 20,
  /** Total accrued seconds across required lessons to satisfy the certificate active-time gate (demo scale). */
  CERT_GATE_SECONDS: 120,
  /** Idle threshold (ms) after which accrual pauses. */
  IDLE_LIMIT_MS: 60_000,
  /** Show the idle warning modal at this idle duration (ms). */
  IDLE_WARN_MS: 45_000,
  /** Persist accrued buffer to state every N ticks. */
  COMMIT_EVERY: 5,
  LABEL: "Active-time engine is a real MVP measurement at demo thresholds — not CDPH-validated.",
};

const OWNER_KEY = "ci-cna-at-owner";
const OWNER_STALE_MS = 3_000;

function readOwner(): { tabId: string; ts: number } | null {
  try {
    const raw = window.localStorage.getItem(OWNER_KEY);
    return raw ? (JSON.parse(raw) as { tabId: string; ts: number }) : null;
  } catch {
    return null;
  }
}

function writeOwner(tabId: string) {
  try {
    window.localStorage.setItem(OWNER_KEY, JSON.stringify({ tabId, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function useActiveTime(moduleId: string, lessonId: string) {
  const { state, addActiveSeconds } = useLearner();
  const committed = state.lessonActiveSeconds[`${moduleId}:${lessonId}`] || 0;

  const [bufferSeconds, setBufferSeconds] = useState(0);
  const [idleWarning, setIdleWarning] = useState(false);
  const lastActivity = useRef<number>(Date.now());
  const tabId = useRef<string>(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const bufferRef = useRef(0);
  const tickRef = useRef(0);

  // Reset buffer when switching lessons.
  useEffect(() => {
    setBufferSeconds(0);
    bufferRef.current = 0;
    tickRef.current = 0;
    lastActivity.current = Date.now();
  }, [moduleId, lessonId]);

  useEffect(() => {
    const markActivity = () => {
      lastActivity.current = Date.now();
      if (idleWarning) setIdleWarning(false);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastActivity.current = Date.now();
        writeOwner(tabId.current); // claim ownership when this tab becomes visible
      }
    };
    const events: Array<keyof DocumentEventMap> = ["pointerdown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach((e) => document.addEventListener(e, markActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "visible") writeOwner(tabId.current);

    const commit = () => {
      if (bufferRef.current > 0) {
        addActiveSeconds(moduleId, lessonId, bufferRef.current);
        bufferRef.current = 0;
      }
    };

    const interval = window.setInterval(() => {
      const now = Date.now();
      const idleMs = now - lastActivity.current;
      const visible = document.visibilityState === "visible";

      // Single-tab ownership: claim if no owner or stale; only owner accrues.
      const owner = readOwner();
      const isOwner = !owner || owner.tabId === tabId.current || now - owner.ts > OWNER_STALE_MS;
      if (visible && isOwner) writeOwner(tabId.current);

      if (idleMs >= ACTIVE_TIME.IDLE_WARN_MS) setIdleWarning(true);

      const accruing = visible && isOwner && idleMs < ACTIVE_TIME.IDLE_LIMIT_MS;
      if (accruing) {
        bufferRef.current += 1;
        setBufferSeconds((s) => s + 1);
        tickRef.current += 1;
        if (tickRef.current >= ACTIVE_TIME.COMMIT_EVERY) {
          tickRef.current = 0;
          commit();
        }
      }
    }, 1000);

    return () => {
      events.forEach((e) => document.removeEventListener(e, markActivity));
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
      commit(); // flush remaining buffer on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, lessonId, addActiveSeconds]);

  const lessonSeconds = committed + bufferSeconds;
  return {
    lessonSeconds,
    idleWarning,
    resume: () => {
      lastActivity.current = Date.now();
      setIdleWarning(false);
    },
    meetsLessonMinimum: lessonSeconds >= ACTIVE_TIME.LESSON_MIN_SECONDS,
  };
}
