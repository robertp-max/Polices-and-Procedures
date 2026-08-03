export type OrderedChallengeItem<T> = {
  value: T;
  originalIndex: number;
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Produces a stable, ID-preserving display permutation. Scoring continues to use
 * the source item/index, while answer positions vary across modules and prompts.
 */
export function challengeOrder<T>(
  items: readonly T[],
  seed: string,
  identity: (item: T, index: number) => string = (_item, index) => String(index),
): OrderedChallengeItem<T>[] {
  return items
    .map((value, originalIndex) => ({
      value,
      originalIndex,
      rank: stableHash(`${seed}:${identity(value, originalIndex)}:${originalIndex}`),
    }))
    .sort((left, right) => left.rank - right.rank || left.originalIndex - right.originalIndex)
    .map(({ value, originalIndex }) => ({ value, originalIndex }));
}
