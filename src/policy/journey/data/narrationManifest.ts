// Narration asset manifest (TTS readiness).
//
// No approved/authorized narration audio is bundled in the MVP. Audio production
// requires authorized voice approval and transcript pairing. Until then, the app
// pairs every app.location with a stable future audio path and a transcript
// fallback. `availableNarrationAudio` lists locations that have a real file on
// disk; it stays empty until authorized audio is produced and dropped into
// `public/assets/narration/`.

export const NARRATION_ASSET_BASE = "/assets/narration";

/**
 * Stable, PHI-free, lowercase audio filename for an app.location.
 * e.g. "module.m01.lesson.l01.card.c01_overview" ->
 *      "/assets/narration/module.m01.lesson.l01.card.c01_overview.mp3"
 */
export function narrationAssetPath(appLocation: string): string {
  const safe = appLocation.trim().replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  return `${NARRATION_ASSET_BASE}/${safe}.mp3`;
}

/** app.locations that have an authorized audio file present on disk. */
export const availableNarrationAudio: ReadonlySet<string> = new Set<string>();

export function hasNarrationAudio(appLocation: string): boolean {
  return availableNarrationAudio.has(appLocation);
}

export const narrationProductionStatus =
  "Transcripts are production-ready. Narration audio is not yet authorized; play controls show a labeled placeholder and an optional browser preview until approved audio is added.";
