/* ═══════════════════════════════════════════════════════════════
   compliance-execution / SEEDED MODE
   --------------------------------------------------------------
   Dev-only context that allows the UI-Staging harness (and future
   preview environments) to inject a pre-built ComplianceExecution
   Snapshot into the hook layer — bypassing real stores entirely.

   When the SeededModeProvider wraps a subtree and `snapshot` is
   non-null, useComplianceExecution returns the seeded snapshot
   instead of computing from live data. This is the single injection
   point for V3 seed data into production components.

   This module is tree-shaken from production builds because the
   provider is only mounted inside /ui-staging routes.

   V3_SYNTHETIC_FALLBACK: seeded mode is a preview injection path only and
   must not be reported as production-shaped completion.
   ═══════════════════════════════════════════════════════════════ */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ComplianceExecutionSnapshot } from './complianceExecutionStore';

export interface SeededModeState {
  /** Whether seeded mode is currently active. */
  isSeeded: boolean;
  /** The pre-built snapshot to return from useComplianceExecution. */
  snapshot: ComplianceExecutionSnapshot | null;
  /** Toggle seeded mode on/off. */
  setSeeded: (active: boolean) => void;
}

const SeededModeContext = createContext<SeededModeState>({
  isSeeded: false,
  snapshot: null,
  setSeeded: () => {},
});

export interface SeededModeProviderProps {
  children: ReactNode;
  /** Factory that builds the snapshot from seed data. Only called when active. */
  buildSnapshot: () => ComplianceExecutionSnapshot;
  /** Initial state. Defaults to false. */
  initiallyActive?: boolean;
}

export function SeededModeProvider({
  children,
  buildSnapshot,
  initiallyActive = false,
}: SeededModeProviderProps) {
  const [isSeeded, setIsSeeded] = useState(initiallyActive);

  const setSeeded = useCallback((active: boolean) => {
    setIsSeeded(active);
  }, []);

  const snapshot = isSeeded ? buildSnapshot() : null;

  return (
    <SeededModeContext.Provider value={{ isSeeded, snapshot, setSeeded }}>
      {children}
    </SeededModeContext.Provider>
  );
}

/**
 * Hook for components that want to read/control seeded mode state.
 * Returns { isSeeded: false, snapshot: null } when no provider is mounted.
 */
export function useSeededMode(): SeededModeState {
  return useContext(SeededModeContext);
}

/**
 * Internal hook used by useComplianceExecution to check for seeded data.
 * Returns the snapshot or null.
 */
export function useSeededSnapshot(): ComplianceExecutionSnapshot | null {
  const { snapshot } = useContext(SeededModeContext);
  return snapshot;
}
