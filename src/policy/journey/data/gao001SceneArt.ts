/**
 * GAO-001 scene art map.
 *
 * Scene 1:
 * - cover: two images shown before the interactive desk (user-provided)
 * - desk: interactive Welcome Desk background
 */
const CACHE_BUST = 'v=20260715-0118';

export const gao001SceneArt = {
  "scene-01": {
    /** Interactive Welcome Desk background */
    src: `/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-desk.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Alex begins the first day at a Care Indeed orientation desk.",
    /**
     * Cover page (before actual Scene 1 desk):
     * ChatGPT Image Jul 9, 2026, 11_57_02 AM (1).png + (2).png
     */
    cover: [
      `/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-cover-a.png?${CACHE_BUST}`,
      `/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-cover-b.png?${CACHE_BUST}`,
    ] as const,
    desk: `/training/gao-001/scene-art/v2/scene-01/gao-001-scene-01-desk.png?${CACHE_BUST}`,
  },
  "scene-02": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-02.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Alex reviews the agency mission and vision statements.",
  },
  "scene-03": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-03.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Visual representation of the core values in action.",
  },
  "scene-04": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-04.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Scene illustrating what makes home health different from facility care.",
  },
  "scene-05": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-05.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "A view of the reporting protocol steps.",
  },
  "scene-06": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-06.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Illustration of patient rights and respectful refusal.",
  },
  "scene-07": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-07.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Practice scenario for the escalation pathway.",
  },
  "scene-08": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-08.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Survey readiness checklist and expectations.",
  },
  "scene-09": {
    src: `/training/gao-001/scene-art/v2/gao-001-scene-09.png?${CACHE_BUST}`,
    legacySrc: "",
    alt: "Alex's first-week learning map overview.",
  },
};

/** Resolve the active image src for a scene art entry. */
export function resolveGao001SceneArtSrc(
  art: { src: string; desk?: string; variants?: readonly string[]; activeVariantIndex?: number },
): string {
  if (art.desk) return art.desk;
  if (art.variants?.length) {
    const idx = Math.min(
      Math.max(art.activeVariantIndex ?? 0, 0),
      art.variants.length - 1,
    );
    return art.variants[idx] ?? art.src;
  }
  return art.src;
}

/** Scene 1 cover pair (before desk). */
export function resolveGao001Scene01Cover(): readonly [string, string] {
  const s01 = gao001SceneArt["scene-01"];
  return [s01.cover[0], s01.cover[1]];
}

export function resolveGao001Scene01Desk(): string {
  return gao001SceneArt["scene-01"].desk;
}
