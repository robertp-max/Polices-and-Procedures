import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface GaoLegacyNodeProgressValue {
  appLocation: string;
  completedNodeIds: readonly string[];
  onProgressChange: (completedNodeIds: string[]) => void;
  onReset: () => void;
  onNodeOpen?: () => void;
}

const GaoLegacyNodeProgressContext = createContext<GaoLegacyNodeProgressValue | null>(null);

export function GaoLegacyNodeProgressProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: GaoLegacyNodeProgressValue;
}) {
  return (
    <GaoLegacyNodeProgressContext.Provider value={value}>
      {children}
    </GaoLegacyNodeProgressContext.Provider>
  );
}

export function useGaoLegacyNodeProgress(): GaoLegacyNodeProgressValue | null {
  return useContext(GaoLegacyNodeProgressContext);
}
