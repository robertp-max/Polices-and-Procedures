import { cms485AudioLocations } from "./cms485AudioLocations";

// Narration asset manifest (TTS readiness).
//
// `availableNarrationAudio` lists app.locations that have a real file on disk.
// Until a location is registered here, the shell falls back to labeled
// browser SpeechSynthesis preview.

export const NARRATION_ASSET_BASE = "/assets/narration";

/**
 * app.locations with authorized/generated audio on disk.
 * Keys must match card `app.location` exactly (see contentV2Adapter).
 */
export const availableNarrationAudio: ReadonlySet<string> = new Set<string>([
  // GAO-001 main delivery narration (shell footer play) — all 9 lessons
  "GAO-001.lesson.l1.delivery",
  "GAO-001.lesson.l2.delivery",
  "GAO-001.lesson.l3.delivery",
  "GAO-001.lesson.l4.delivery",
  "GAO-001.lesson.l5.delivery",
  "GAO-001.lesson.l6.delivery",
  "GAO-001.lesson.l7.delivery",
  "GAO-001.lesson.l8.delivery",
  "GAO-001.lesson.l9.delivery",
]);

/** Locations that use .wav (default for non-cms is .mp3). */
const WAV_NARRATION_LOCATIONS: ReadonlySet<string> = new Set<string>([
  "GAO-001.lesson.l1.delivery",
  "GAO-001.lesson.l2.delivery",
  "GAO-001.lesson.l3.delivery",
  "GAO-001.lesson.l4.delivery",
  "GAO-001.lesson.l5.delivery",
  "GAO-001.lesson.l6.delivery",
  "GAO-001.lesson.l7.delivery",
  "GAO-001.lesson.l8.delivery",
  "GAO-001.lesson.l9.delivery",
]);

/**
 * Optional override when the on-disk name differs from the sanitized app.location.
 * Values are absolute site-root paths (Vite public/).
 *
 * Organized pack:
 *   public/training/gao-001/audio/main/l0N-delivery.wav
 */
const NARRATION_PATH_OVERRIDES: Readonly<Record<string, string>> = {
  "GAO-001.lesson.l1.delivery": "/training/gao-001/audio/main/l01-delivery.wav",
  "GAO-001.lesson.l2.delivery": "/training/gao-001/audio/main/l02-delivery.wav",
  "GAO-001.lesson.l3.delivery": "/training/gao-001/audio/main/l03-delivery.wav",
  "GAO-001.lesson.l4.delivery": "/training/gao-001/audio/main/l04-delivery.wav",
  "GAO-001.lesson.l5.delivery": "/training/gao-001/audio/main/l05-delivery.wav",
  "GAO-001.lesson.l6.delivery": "/training/gao-001/audio/main/l06-delivery.wav",
  "GAO-001.lesson.l7.delivery": "/training/gao-001/audio/main/l07-delivery.wav",
  "GAO-001.lesson.l8.delivery": "/training/gao-001/audio/main/l08-delivery.wav",
  "GAO-001.lesson.l9.delivery": "/training/gao-001/audio/main/l09-delivery.wav",
};

/**
 * Stable, PHI-free audio path for an app.location.
 */
export function narrationAssetPath(appLocation: string): string {
  if (NARRATION_PATH_OVERRIDES[appLocation]) {
    return NARRATION_PATH_OVERRIDES[appLocation];
  }
  const safe = appLocation.trim().replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  const ext =
    appLocation.startsWith("cms-485") || WAV_NARRATION_LOCATIONS.has(appLocation)
      ? "wav"
      : "mp3";
  return `${NARRATION_ASSET_BASE}/${safe}.${ext}`;
}

export function hasNarrationAudio(appLocation: string): boolean {
  if (appLocation.startsWith("cms-485")) {
    return cms485AudioLocations.has(appLocation);
  }
  return availableNarrationAudio.has(appLocation);
}

export const narrationProductionStatus =
  "GAO-001 main delivery narration (L1–L9) is registered under public/training/gao-001/audio/main/. Other modules use transcript + browser preview until authorized audio is added.";
