export type GaoNodeTone = "guidance" | "safe" | "caution" | "stop";

export type GaoNodeKind =
  | "observe"
  | "decision"
  | "sequence"
  | "compare"
  | "route"
  | "evidence"
  | "rights"
  | "risk"
  | "recap";

export interface GaoNodeOption {
  id: string;
  label: string;
  isSafest: boolean;
  feedback: string;
}

export interface GaoNodeMicroCheck {
  prompt: string;
  options: GaoNodeOption[];
  maxAttempts?: number;
}

export interface GaoNode {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  tone: GaoNodeTone;
  kind: GaoNodeKind;
  required: boolean;
  whatYouObserved: string;
  whyItMatters: string;
  whatYouShouldDo: string;
  whoToNotify?: string;
  whatToDocument?: string;
  policyRefs: string[];
  processNoteId?: string;
  microCheck?: GaoNodeMicroCheck;
}

export interface GaoProcessNote {
  id: string;
  title: string;
  body: string;
  placement:
    | { type: "point"; x: number; y: number }
    | { type: "left-rail" }
    | { type: "right-rail" }
    | { type: "bottom-strip" }
    | { type: "bottom-cards" };
}

export interface GaoProtectedRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  reason:
    | "embedded-text"
    | "face"
    | "hands"
    | "clinical-site"
    | "device-screen"
    | "navigation-clearance";
}

export interface GaoNodeScene {
  appLocation: string;
  sceneLabel: string;
  nodes: GaoNode[];
  processNotes?: GaoProcessNote[];
  protectedRegions?: GaoProtectedRegion[];
  completionLabel?: string;
  imageFit?: "contain" | "cover";
  requiredNodeMinimumExemption?: string;
}

export interface GaoNodeProgressRecord {
  completedNodeIds: string[];
  updatedAt: string;
  version: 1;
}
