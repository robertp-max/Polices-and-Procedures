import type { GaoNode, GaoNodeScene } from "../data/gaoNodes";

export interface GaoNodePosition {
  x: number;
  y: number;
  tagPlacement?: "above" | "below";
}

interface PixelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface CandidateFootprint {
  orb: PixelRect;
  tag: PixelRect;
}

const MOBILE_STAGE_MAX = 640;
const ORB_RADIUS = 24;
const TAG_HEIGHT = 25;
const TAG_GAP = 5;

function overlaps(a: PixelRect, b: PixelRect, gap = 0): boolean {
  return (
    a.left < b.right + gap &&
    a.right > b.left - gap &&
    a.top < b.bottom + gap &&
    a.bottom > b.top - gap
  );
}

function tagWidth(node: GaoNode): number {
  return Math.min(108, Math.max(48, node.shortLabel.length * 7 + 20));
}

function footprint(
  node: GaoNode,
  x: number,
  y: number,
  tagPlacement: "above" | "below" = "below",
): CandidateFootprint {
  const width = tagWidth(node);
  const tagTop =
    tagPlacement === "above"
      ? y - ORB_RADIUS - TAG_GAP - TAG_HEIGHT
      : y + ORB_RADIUS + TAG_GAP;
  return {
    orb: {
      left: x - ORB_RADIUS,
      top: y - ORB_RADIUS,
      right: x + ORB_RADIUS,
      bottom: y + ORB_RADIUS,
    },
    tag: {
      left: x - width / 2,
      top: tagTop,
      right: x + width / 2,
      bottom: tagTop + TAG_HEIGHT,
    },
  };
}

function footprintCollides(
  candidate: CandidateFootprint,
  blocked: readonly PixelRect[],
  placed: readonly CandidateFootprint[],
): boolean {
  if (blocked.some((rect) => overlaps(candidate.orb, rect) || overlaps(candidate.tag, rect))) {
    return true;
  }
  return placed.some(
    (other) =>
      overlaps(candidate.orb, other.orb, 4) ||
      overlaps(candidate.orb, other.tag, 4) ||
      overlaps(candidate.tag, other.orb, 4) ||
      overlaps(candidate.tag, other.tag, 4),
  );
}

function penalty(
  candidate: CandidateFootprint,
  blocked: readonly PixelRect[],
  placed: readonly CandidateFootprint[],
): number {
  let value = 0;
  for (const rect of blocked) {
    if (overlaps(candidate.orb, rect)) value += 10_000;
    if (overlaps(candidate.tag, rect)) value += 7_500;
  }
  for (const other of placed) {
    if (overlaps(candidate.orb, other.orb, 4)) value += 10_000;
    if (overlaps(candidate.orb, other.tag, 4)) value += 8_000;
    if (overlaps(candidate.tag, other.orb, 4)) value += 8_000;
    if (overlaps(candidate.tag, other.tag, 4)) value += 6_000;
  }
  return value;
}

export function resolveResponsiveGaoNodePositions(
  scene: GaoNodeScene,
  stageWidth: number,
  stageHeight: number,
): Record<string, GaoNodePosition> {
  if (stageWidth <= 0 || stageHeight <= 0 || stageWidth > MOBILE_STAGE_MAX) {
    return Object.fromEntries(scene.nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
  }

  const protectedRects: PixelRect[] = (scene.protectedRegions ?? []).map((region) => ({
    left: (region.x / 100) * stageWidth,
    top: (region.y / 100) * stageHeight,
    right: ((region.x + region.width) / 100) * stageWidth,
    bottom: ((region.y + region.height) / 100) * stageHeight,
  }));
  const controls: PixelRect[] = [
    { left: stageWidth - 122, top: 6, right: stageWidth - 6, bottom: 36 },
    { left: stageWidth - 50, top: stageHeight - 50, right: stageWidth - 6, bottom: stageHeight - 6 },
  ];
  const blocked = [...protectedRects, ...controls];
  const placed: CandidateFootprint[] = [];
  const positions: Record<string, GaoNodePosition> = {};

  for (const node of scene.nodes) {
    const halfTag = tagWidth(node) / 2;
    const minX = Math.max(ORB_RADIUS, halfTag) + 2;
    const maxX = stageWidth - minX;
    const minY = ORB_RADIUS + 2;
    const maxY = stageHeight - (ORB_RADIUS + TAG_GAP + TAG_HEIGHT + 2);
    const preferredX = Math.min(maxX, Math.max(minX, (node.x / 100) * stageWidth));
    const preferredY = Math.min(maxY, Math.max(minY, (node.y / 100) * stageHeight));
    const aboveMinY = ORB_RADIUS + TAG_GAP + TAG_HEIGHT + 2;
    const candidates: Array<{
      x: number;
      y: number;
      tagPlacement: "above" | "below";
      distance: number;
    }> = [
      { x: preferredX, y: preferredY, tagPlacement: "below", distance: 0 },
    ];
    if (preferredY >= aboveMinY) {
      candidates.push({
        x: preferredX,
        y: preferredY,
        tagPlacement: "above",
        distance: 250,
      });
    }

    for (let y = minY; y <= maxY; y += 6) {
      for (let x = minX; x <= maxX; x += 6) {
        const distance = (x - preferredX) ** 2 + (y - preferredY) ** 2;
        candidates.push({ x, y, tagPlacement: "below", distance });
        if (y >= aboveMinY) {
          candidates.push({ x, y, tagPlacement: "above", distance: distance + 250 });
        }
      }
    }
    candidates.sort((a, b) => a.distance - b.distance);

    let selected = candidates.find((candidate) =>
      !footprintCollides(
        footprint(node, candidate.x, candidate.y, candidate.tagPlacement),
        blocked,
        placed,
      ),
    );
    if (!selected) {
      selected = candidates.reduce((best, candidate) => {
        const candidateFootprint = footprint(
          node,
          candidate.x,
          candidate.y,
          candidate.tagPlacement,
        );
        const candidateScore =
          penalty(candidateFootprint, blocked, placed) + candidate.distance;
        const bestScore =
          penalty(footprint(node, best.x, best.y, best.tagPlacement), blocked, placed) +
          best.distance;
        return candidateScore < bestScore ? candidate : best;
      }, candidates[0]);
    }

    const selectedFootprint = footprint(
      node,
      selected.x,
      selected.y,
      selected.tagPlacement,
    );
    placed.push(selectedFootprint);
    positions[node.id] = {
      x: (selected.x / stageWidth) * 100,
      y: (selected.y / stageHeight) * 100,
      tagPlacement: selected.tagPlacement,
    };
  }

  return positions;
}
