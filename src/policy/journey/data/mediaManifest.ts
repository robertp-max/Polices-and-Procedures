// Media asset manifest (visual readiness).
//
// No final media assets are generated for the MVP. Every card still gets a safe,
// polished 16:9 placeholder ("Training Visual Placeholder" / "Visual Aid
// Pending") with alt text — never an empty black box and never a broken-image
// icon. `availableMedia` lists app.locations that have an approved image file on
// disk; it stays empty until approved, PHI-free media is produced.

export const MEDIA_ASSET_BASE = "/assets/media";

export function mediaAssetPath(appLocation: string): string {
  const loc = appLocation.trim();

  // Noon mode app screenshots
  if (loc.includes('noon-brad')) return `${MEDIA_ASSET_BASE}/noon-brad-workspace.png`;
  if (loc.includes('noon-dashboard')) return `${MEDIA_ASSET_BASE}/noon-dashboard.png`;
  if (loc.includes('noon-packet')) return `${MEDIA_ASSET_BASE}/noon-packet-studio.png`;

  // CMS-485 advanced training lesson images (lesson 1 foundation uses dedicated cohesive visual)
  if (loc.includes('cms-485') || loc.includes('cms485')) {
    if (loc.includes('l1') || loc.includes('.l1.')) {
      return `${MEDIA_ASSET_BASE}/cms485-foundation.jpg`;
    }
    // Future: add l2+ when images produced. Fall through to placeholder for now.
  }

  // GAO-001 attached images (from manifest recommendations)
  if (loc.includes('gao-001') || loc.includes('core-values') || loc.includes('scene-04')) {
    // Recommended visual anchor per GAO-001_manifest: scene-04-values/v2.png
    return '/GAO-001/scene-04-values/v2.png';
  }

  const safe = loc.replace(/[^a-z0-9._-]/gi, "-").toLowerCase();
  return `${MEDIA_ASSET_BASE}/${safe}.jpg`;
}

/** app.locations that have an approved image file present on disk. */
export const availableMedia: ReadonlySet<string> = new Set<string>([
  '/assets/media/gao-mission-values.jpg',
  '/assets/media/hipaa-privacy.jpg',
  '/assets/media/infection-ppe.jpg',
  '/assets/media/emergency-prep.jpg',
  '/assets/media/abuse-reporting.jpg',
  '/assets/media/patient-rights.jpg',
  '/assets/media/documentation.jpg',
  '/assets/media/compliance-hotline.jpg',
  '/assets/media/safety-home-visit.jpg',
  '/assets/media/noon-brad-workspace.png',
  '/assets/media/noon-dashboard.png',
  '/assets/media/noon-packet-studio.png',
  '/assets/media/cms485-foundation.jpg',
  // CMS-485 Lesson 1 (Foundation) app locations
  'cms-485.lesson.l1.s1.overview',
  'cms-485.lesson.l1.s1.delivery',
  'cms-485.lesson.l1.s1.challenge',
  'cms-485.lesson.l1.s1.debrief',
  // GAO-001 generated visuals (attached from manifest)
  'gao-001.core-values',
  'gao-001.scene-04',
]);

export function hasMedia(appLocation: string): boolean {
  // Support noon mode app screenshots
  if (appLocation && (appLocation.includes('noon') || appLocation.includes('brad') || appLocation.includes('dashboard') || appLocation.includes('packet'))) {
    return true;
  }
  // CMS-485 lesson 1 (foundation) - new cohesive image added for lesson1
  if (appLocation && (appLocation.includes('cms-485') || appLocation.includes('cms485')) && (appLocation.includes('l1') || appLocation.includes('.l1.'))) {
    return true;
  }
  // GAO-001 Core Values interactive scene visuals (page 4)
  if (appLocation && (appLocation.includes('gao-001') || appLocation.includes('core-values') || appLocation.includes('scene-04'))) {
    return true;
  }
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
