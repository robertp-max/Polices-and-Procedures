// Media asset manifest (visual readiness).
//
// No final media assets are generated for the MVP. Every card still gets a safe,
// polished 16:9 placeholder ("Training Visual Placeholder" / "Visual Aid
// Pending") with alt text — never an empty black box and never a broken-image
// icon. `availableMedia` lists app.locations that have an approved image file on
// disk; it stays empty until approved, PHI-free media is produced.

export const MEDIA_ASSET_BASE = "/assets/media";

export function mediaAssetPath(appLocation: string): string {
  const safe = appLocation.trim().replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  return `${MEDIA_ASSET_BASE}/${safe}.png`;
}

/** app.locations that have an approved image file present on disk. */
export const availableMedia: ReadonlySet<string> = new Set<string>();

export function hasMedia(appLocation: string): boolean {
  return availableMedia.has(appLocation);
}

export type MediaStatus = "asset-ready" | "placeholder-pending";

export function mediaStatus(appLocation: string): MediaStatus {
  return hasMedia(appLocation) ? "asset-ready" : "placeholder-pending";
}

/** Safe alt text from the scene title, with a PHI-free fallback. */
export function mediaAltText(sceneTitle: string | undefined): string {
  const t = (sceneTitle || "").trim();
  return t
    ? `Training visual: ${t}. De-identified illustration; no PHI.`
    : "Training visual placeholder; de-identified illustration; no PHI.";
}
