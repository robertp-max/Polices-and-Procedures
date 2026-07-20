import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import type { GaoNode, GaoNodeScene } from "../../../data/gaoNodes";
import { resolveResponsiveGaoNodePositions } from "../../../lib/gaoNodeLayout";
import { isGaoNodeSceneComplete, sanitizeGaoNodeIds } from "../../../lib/gaoNodeProgress";
import { GaoNodeButton } from "./GaoNodeButton";
import { GaoNodeCompletion } from "./GaoNodeCompletion";
import { GaoNodeDrawer } from "./GaoNodeDrawer";
import { GaoNodeProgress } from "./GaoNodeProgress";
import { GaoProcessNoteView } from "./GaoProcessNote";
import "./GaoNodeStage.css";

interface GaoNodeStageProps {
  scene: GaoNodeScene;
  imageSrc: string;
  imageAlt: string;
  completedNodeIds: readonly string[];
  onProgressChange: (completedNodeIds: string[]) => void;
  onPauseNarration?: () => void;
  debug?: boolean;
}

export function GaoNodeStage({
  scene,
  imageSrc,
  imageAlt,
  completedNodeIds,
  onProgressChange,
  onPauseNarration,
  debug = false,
}: GaoNodeStageProps) {
  const completed = useMemo(() => sanitizeGaoNodeIds(scene, completedNodeIds), [scene, completedNodeIds]);
  const completedSet = useMemo(() => new Set(completed), [completed]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeTrigger, setActiveTrigger] = useState<HTMLButtonElement | null>(null);
  const [completionDismissed, setCompletionDismissed] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const activeNode = scene.nodes.find((node) => node.id === activeNodeId) ?? null;
  const nextRequired = scene.nodes.find((node) => node.required && !completedSet.has(node.id));
  const requiredComplete = isGaoNodeSceneComplete(scene, completed);
  const responsivePositions = useMemo(
    () => resolveResponsiveGaoNodePositions(scene, stageSize.width, stageSize.height),
    [scene, stageSize.height, stageSize.width],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () => {
      const bounds = stage.getBoundingClientRect();
      setStageSize((current) =>
        current.width === bounds.width && current.height === bounds.height
          ? current
          : { width: bounds.width, height: bounds.height },
      );
    };
    updateSize();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveNodeId(null);
    setActiveTrigger(null);
    setCompletionDismissed(false);
  }, [scene.appLocation]);

  useEffect(() => {
    if (!requiredComplete) setCompletionDismissed(false);
  }, [requiredComplete]);

  const openNode = (node: GaoNode, trigger: HTMLButtonElement) => {
    setActiveTrigger(trigger);
    onPauseNarration?.();
    setActiveNodeId(node.id);
  };

  const completeNode = (node: GaoNode) => {
    const next = completedSet.has(node.id) ? completed : [...completed, node.id];
    onProgressChange(next);
    setActiveNodeId(null);
    setActiveTrigger(null);
  };

  return (
    <div className="gao-node-stage-wrap">
      <div ref={stageRef} className="gao-node-stage" role="region" aria-label={`${scene.sceneLabel} interactive scene`} data-app-location={scene.appLocation}>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="gao-node-scene-image"
          style={{ objectFit: scene.imageFit ?? "contain", objectPosition: "center" }}
          draggable={false}
        />

        {scene.processNotes?.map((note) => <GaoProcessNoteView key={note.id} note={note} />)}

        {scene.nodes.map((node) => (
          <GaoNodeButton
            key={node.id}
            node={node}
            position={responsivePositions[node.id]}
            completed={completedSet.has(node.id)}
            guided={nextRequired?.id === node.id}
            onOpen={(trigger) => openNode(node, trigger)}
          />
        ))}

        <GaoNodeProgress completed={completed.length} total={scene.nodes.length} />

        <button
          type="button"
          className="gao-node-reset"
          aria-label="Reset current lesson node progress"
          title="Reset current lesson node progress"
          onClick={() => {
            setActiveNodeId(null);
            setCompletionDismissed(false);
            onProgressChange([]);
          }}
        >
          <RotateCcw size={14} /> Reset
        </button>

        {debug
          ? scene.protectedRegions?.map((region) => (
              <div
                key={region.id}
                className="gao-node-debug-region"
                style={{ left: `${region.x}%`, top: `${region.y}%`, width: `${region.width}%`, height: `${region.height}%` }}
              >
                <span className="gao-node-debug-label">{region.id}: {region.reason}</span>
              </div>
            ))
          : null}

        {requiredComplete && !activeNode && !completionDismissed ? (
          <GaoNodeCompletion
            label={scene.completionLabel ?? "Lesson Practice Complete"}
            onReview={() => setCompletionDismissed(true)}
          />
        ) : null}

        {activeNode ? (
          <GaoNodeDrawer
            node={activeNode}
            trigger={activeTrigger}
            onClose={() => {
              setActiveNodeId(null);
              setActiveTrigger(null);
            }}
            onComplete={() => completeNode(activeNode)}
          />
        ) : null}
      </div>
    </div>
  );
}
