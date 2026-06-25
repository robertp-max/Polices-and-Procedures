// App-level UI state shared across the V2 surface.
// - Reviewer panel open/closed (collapsible, never part of the learner flow).
// - A DISPLAY-ONLY demo clock used for the audit/active-time figures. It is
//   purely cosmetic and is always truth-labeled as demo/MVP in the UI. The
//   real certificate active-time gate is computed from LearnerState via
//   `activeTimeMet()` — this clock never gates anything.

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type UiContextValue = {
  reviewerOpen: boolean;
  setReviewerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  demoSeconds: number;
};

const UiContext = createContext<UiContextValue | null>(null);

// Starts just above 12h so audit figures read realistically in the demo.
const DEMO_START_SECONDS = 43285;

export function UiStateProvider({ children }: { children: React.ReactNode }) {
  const [reviewerOpen, setReviewerOpen] = useState(false);
  const [demoSeconds, setDemoSeconds] = useState(DEMO_START_SECONDS);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    tick.current = window.setInterval(() => setDemoSeconds((s) => s + 1), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({ reviewerOpen, setReviewerOpen, demoSeconds }),
    [reviewerOpen, demoSeconds],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUiState(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUiState must be used within UiStateProvider");
  return ctx;
}

export function formatHoursAndMins(totalSecs: number): string {
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${hrs}h ${mins}m ${secs}s`;
}
