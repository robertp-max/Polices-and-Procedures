import type { GaoNodeProgressRecord, GaoNodeScene } from "../data/gaoNodes/gaoNodeTypes";

export function sanitizeGaoNodeIds(scene: GaoNodeScene, completedNodeIds: readonly string[] | undefined): string[] {
  if (!completedNodeIds?.length) return [];
  const validIds = new Set(scene.nodes.map((node) => node.id));
  return Array.from(new Set(completedNodeIds.filter((id) => validIds.has(id))));
}

export function requiredGaoNodeIds(scene: GaoNodeScene): string[] {
  return scene.nodes.filter((node) => node.required).map((node) => node.id);
}

export function isGaoNodeSceneComplete(scene: GaoNodeScene, completedNodeIds: readonly string[] | undefined): boolean {
  const requiredIds = requiredGaoNodeIds(scene);
  if (requiredIds.length === 0) return false;
  const completed = new Set(sanitizeGaoNodeIds(scene, completedNodeIds));
  return requiredIds.every((id) => completed.has(id));
}

export function createGaoNodeProgressRecord(
  scene: GaoNodeScene,
  completedNodeIds: readonly string[],
  updatedAt = new Date().toISOString(),
): GaoNodeProgressRecord {
  return {
    completedNodeIds: sanitizeGaoNodeIds(scene, completedNodeIds),
    updatedAt,
    version: 1,
  };
}
