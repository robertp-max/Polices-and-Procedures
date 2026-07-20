import { Check, CircleHelp } from "lucide-react";
import type { CSSProperties } from "react";

import type { GaoNode } from "../../../data/gaoNodes";

const toneClasses: Record<GaoNode["tone"], string> = {
  guidance: "bg-[#64748B]",
  safe: "bg-[#0F766E]",
  caution: "bg-[#F26D33]",
  stop: "bg-[#DC2626]",
};

interface GaoNodeButtonProps {
  node: GaoNode;
  position?: { x: number; y: number; tagPlacement?: "above" | "below" };
  completed: boolean;
  guided: boolean;
  onOpen: (trigger: HTMLButtonElement) => void;
}

export function GaoNodeButton({ node, position, completed, guided, onOpen }: GaoNodeButtonProps) {
  const describedBy = node.processNoteId ? `gao-process-note-${node.processNoteId}` : undefined;
  const renderedPosition: { x: number; y: number; tagPlacement?: "above" | "below" } =
    position ?? node;

  return (
    <button
      type="button"
      className={`gao-node-button ${
        renderedPosition.tagPlacement === "above" ? "gao-node-button-tag-above" : ""
      }`}
      style={
        {
          "--gao-node-x": `${renderedPosition.x}%`,
          "--gao-node-y": `${renderedPosition.y}%`,
        } as CSSProperties
      }
      aria-label={completed ? `${node.label} — observed` : `Review ${node.label}`}
      aria-describedby={describedBy}
      data-node-id={node.id}
      onClick={(event) => onOpen(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(event.currentTarget);
        }
      }}
    >
      <span
        className={`gao-node-orb ${completed ? "bg-[#0F766E]" : toneClasses[node.tone]} ${guided ? "gao-node-orb-guided" : ""}`}
        aria-hidden="true"
      >
        {completed ? <Check size={20} strokeWidth={3} /> : <CircleHelp size={20} strokeWidth={2.5} />}
      </span>
      <span className="gao-node-tag">{node.shortLabel}</span>
    </button>
  );
}
