import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Eye, HelpCircle, RotateCcw } from "lucide-react";

import { Gao001TeachingDrawer } from "./gao/nodes/Gao001TeachingDrawer";
import { GaoNodeCompletion } from "./gao/nodes/GaoNodeCompletion";
import { useGaoLegacyNodeProgress } from "./gao/nodes/GaoLegacyNodeProgressContext";
import "./gao/nodes/GaoNodeStage.css";

export interface HotspotQuestionChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface HotspotQuestion {
  prompt: string;
  choices: HotspotQuestionChoice[];
}

export interface HotspotNarration {
  src: string;
  transcript: string;
}

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  fieldNotes: {
    title: string;
    content: React.ReactNode;
  };
  narration?: HotspotNarration;
  question?: HotspotQuestion;
  tooltipPos?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface SceneNarrationConfig {
  src: string;
  transcript: string;
  labels?: {
    listen?: string;
    pause?: string;
    replay?: string;
    transcript?: string;
    mute?: string;
    unmute?: string;
    audioUnavailable?: string;
  };
}

interface GAO001SharedOverlayProps {
  imageSrc: string;
  altText: string;
  objective: string;
  hotspots: Hotspot[];
  narration?: SceneNarrationConfig;
  onComplete?: () => void;
  linear?: boolean;
  fillPanel?: boolean;
  renderCustomModal?: (args: {
    hotspot: Hotspot;
    close: () => void;
    complete: () => void;
  }) => React.ReactNode | null;
}

const SHARED_STYLES = `
  .font-montserrat { font-family: Montserrat, Arial, sans-serif; }
  .font-roboto { font-family: Roboto, Arial, sans-serif; }

  @keyframes gao001SceneReveal {
    from { opacity: 0; transform: translateY(12px) scale(0.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes gao001GuidedPulse {
    0% { box-shadow: 0 0 0 0 rgba(240, 105, 35, 0.68); }
    75%, 100% { box-shadow: 0 0 0 15px rgba(240, 105, 35, 0); }
  }

  .gao001-scene-reveal {
    animation: gao001SceneReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  .gao001-guided-pulse {
    animation: gao001GuidedPulse 1.2s cubic-bezier(0.66, 0, 0, 1) 2;
  }

  @media (prefers-reduced-motion: reduce) {
    .gao001-scene-reveal,
    .gao001-guided-pulse {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export default function GAO001SharedOverlay({
  imageSrc,
  altText,
  objective,
  hotspots,
  onComplete,
  linear = false,
  fillPanel = false,
  renderCustomModal,
}: GAO001SharedOverlayProps) {
  const persistedProgress = useGaoLegacyNodeProgress();
  const [localCompletedNodeIds, setLocalCompletedNodeIds] = useState<Set<string>>(new Set());
  const [activeModalNodeId, setActiveModalNodeId] = useState<string | null>(null);
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<HTMLButtonElement | null>(null);
  const completionNotifiedRef = useRef(false);

  const validNodeIds = useMemo(
    () => new Set(hotspots.map((hotspot) => hotspot.id)),
    [hotspots],
  );
  const completedNodeIds = useMemo(() => {
    const source = persistedProgress
      ? persistedProgress.completedNodeIds
      : Array.from(localCompletedNodeIds);
    return new Set(source.filter((nodeId) => validNodeIds.has(nodeId)));
  }, [localCompletedNodeIds, persistedProgress, validNodeIds]);
  const completedCount = completedNodeIds.size;
  const allComplete = hotspots.length > 0 && completedCount === hotspots.length;
  const nextIncompleteNodeId = hotspots.find(
    (hotspot) => !completedNodeIds.has(hotspot.id),
  )?.id;
  const activeHotspot = activeModalNodeId
    ? hotspots.find((hotspot) => hotspot.id === activeModalNodeId) ?? null
    : null;

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById("gao001-shared-styles")) {
      const style = document.createElement("style");
      style.id = "gao001-shared-styles";
      style.textContent = SHARED_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (allComplete && !completionNotifiedRef.current) {
      completionNotifiedRef.current = true;
      onComplete?.();
    } else if (!allComplete) {
      completionNotifiedRef.current = false;
    }
  }, [allComplete, onComplete]);

  const writeCompletedNodeIds = useCallback(
    (next: Set<string>) => {
      const orderedIds = hotspots
        .map((hotspot) => hotspot.id)
        .filter((nodeId) => next.has(nodeId));
      if (persistedProgress) {
        persistedProgress.onProgressChange(orderedIds);
      } else {
        setLocalCompletedNodeIds(new Set(orderedIds));
      }
    },
    [hotspots, persistedProgress],
  );

  const closeDrawer = useCallback(() => {
    setActiveModalNodeId(null);
    setActiveTrigger(null);
    window.requestAnimationFrame(() => activeTrigger?.focus());
  }, [activeTrigger]);

  const completeActiveHotspot = useCallback(() => {
    if (activeModalNodeId) {
      const next = new Set(completedNodeIds);
      next.add(activeModalNodeId);
      writeCompletedNodeIds(next);
    }
    setCompletionDismissed(false);
    setActiveModalNodeId(null);
    setActiveTrigger(null);
    window.requestAnimationFrame(() => activeTrigger?.focus());
  }, [activeModalNodeId, activeTrigger, completedNodeIds, writeCompletedNodeIds]);

  const openHotspot = (hotspot: Hotspot, index: number, trigger: HTMLButtonElement) => {
    if (linear) {
      const expectedIndex = hotspots.findIndex(
        (candidate) => !completedNodeIds.has(candidate.id),
      );
      if (expectedIndex >= 0 && index > expectedIndex) {
        setErrorMsg("Start with the highlighted item first.");
        window.setTimeout(() => setErrorMsg(null), 3000);
        return;
      }
    }

    setActiveTrigger(trigger);
    persistedProgress?.onNodeOpen?.();
    setActiveModalNodeId(hotspot.id);
  };

  const resetCurrentScene = () => {
    if (persistedProgress) {
      persistedProgress.onReset();
    } else {
      setLocalCompletedNodeIds(new Set());
    }
    setCompletionDismissed(false);
    setActiveModalNodeId(null);
    setActiveTrigger(null);
  };

  const defaultDrawer = activeHotspot ? (
    <Gao001TeachingDrawer
      hotspot={activeHotspot}
      trigger={activeTrigger}
      onClose={closeDrawer}
      onComplete={completeActiveHotspot}
    />
  ) : null;
  const activeModal = activeHotspot
    ? renderCustomModal?.({
        hotspot: activeHotspot,
        close: closeDrawer,
        complete: completeActiveHotspot,
      }) ?? defaultDrawer
    : null;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white font-sans">
      <div
        className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden ${
          mounted ? "gao001-scene-reveal" : "opacity-0"
        }`}
        style={{ containerType: "size" }}
      >
        <div
          className="relative overflow-hidden"
          role="region"
          aria-label={`${altText} interactive scene`}
          style={
            fillPanel
              ? { width: "100%", height: "100%" }
              : {
                  width: "min(100cqw, calc(100cqh * 16 / 13))",
                  height: "min(100cqh, calc(100cqw * 13 / 16))",
                  aspectRatio: "16 / 13",
                }
          }
        >
          <img
            src={imageSrc}
            alt={altText}
            className={`pointer-events-none absolute inset-0 z-0 block h-full w-full object-center ${
              fillPanel ? "object-cover" : "object-contain"
            }`}
            draggable={false}
          />

          <div className="absolute inset-0 z-10">
            <div className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
              <div className="flex flex-col items-center rounded-full border border-white/50 bg-white/95 px-8 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md">
                <span className="font-montserrat mb-1 text-[10px] font-bold uppercase tracking-widest text-[#F06923]">
                  Current Objective
                </span>
                <span className="font-roboto text-sm font-bold text-[#007970]">{objective}</span>
              </div>
            </div>

            {errorMsg ? (
              <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-md border border-red-200 bg-red-100 px-4 py-2 text-sm font-medium text-red-800 shadow-sm" role="status">
                {errorMsg}
              </div>
            ) : null}

            {hotspots.map((spot, index) => {
              const isComplete = completedNodeIds.has(spot.id);
              const expectedLinearIndex = hotspots.findIndex(
                (candidate) => !completedNodeIds.has(candidate.id),
              );
              const isPendingLinear =
                linear && expectedLinearIndex >= 0 && index > expectedLinearIndex;
              const isGuided =
                !activeModalNodeId && !isComplete && spot.id === nextIncompleteNodeId;
              const colorClass = isComplete
                ? "bg-[#007970]"
                : isPendingLinear
                  ? "bg-[#A0A0A0]"
                  : "bg-[#F06923]";

              return (
                <div
                  key={spot.id}
                  className="absolute z-30"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                >
                  <button
                    type="button"
                    onClick={(event) => openHotspot(spot, index, event.currentTarget)}
                    aria-label={isComplete ? `${spot.label} — observed` : `Review ${spot.label}`}
                    className={`relative z-40 -ml-6 -mt-6 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white text-white shadow-lg transition-transform duration-300 hover:scale-110 ${colorClass} ${
                      isGuided ? "gao001-guided-pulse" : ""
                    }`}
                  >
                    {isComplete ? (
                      <Check size={24} strokeWidth={3} />
                    ) : (
                      <HelpCircle size={24} strokeWidth={2.5} />
                    )}
                  </button>
                  <span className="gao-node-tag pointer-events-none absolute left-0 top-[30px] -translate-x-1/2">
                    {spot.label}
                  </span>
                </div>
              );
            })}

            <div className="gao-node-progress" aria-hidden="true">
              <Eye size={15} />
              {completedCount} / {hotspots.length} observed
            </div>
            <div className="gao-node-live" aria-live="polite" aria-atomic="true">
              {completedCount} of {hotspots.length} scene nodes observed
            </div>
            <button
              type="button"
              className="gao-node-reset"
              aria-label="Reset current lesson node progress"
              onClick={resetCurrentScene}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        {activeModal}

        {allComplete && !activeModalNodeId && !completionDismissed ? (
          <GaoNodeCompletion
            label="Lesson Practice Complete"
            onReview={() => setCompletionDismissed(true)}
          />
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1.5 w-full bg-[#E5E4E3]/70">
        <div
          className="h-full bg-[#007970] transition-all duration-500"
          style={{ width: `${hotspots.length ? (completedCount / hotspots.length) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
