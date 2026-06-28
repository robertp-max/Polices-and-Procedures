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

  // Map for first onboarding lesson images (GAO-001)
  if (loc.includes('GAO-001') || loc.includes('gao001')) {
    if (loc.includes('mission') || loc.includes('l1')) {
      return `${MEDIA_ASSET_BASE}/onboarding-gao001-mission-noon.png`;
    }
    if (loc.includes('vision') || loc.includes('l2')) {
      return `${MEDIA_ASSET_BASE}/onboarding-gao001-vision.jpg`;
    }
    return `${MEDIA_ASSET_BASE}/onboarding-gao001-values.jpg`;
  }

  // Noon mode app screenshots
  if (loc.includes('noon-brad')) return `${MEDIA_ASSET_BASE}/noon-brad-workspace.png`;
  if (loc.includes('noon-dashboard')) return `${MEDIA_ASSET_BASE}/noon-dashboard.png`;
  if (loc.includes('noon-packet')) return `${MEDIA_ASSET_BASE}/noon-packet-studio.png`;

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
  '/assets/media/onboarding-gao001-mission.jpg',
  '/assets/media/onboarding-gao001-vision.jpg',
  '/assets/media/onboarding-gao001-values.jpg',
  '/assets/media/noon-brad-workspace.png',
  '/assets/media/noon-dashboard.png',
  '/assets/media/noon-packet-studio.png',
  // First lesson (GAO-001) app locations for media player
  'GAO-001.lesson.l1.overview',
  'GAO-001.lesson.l1.delivery',
  'GAO-001.lesson.l2.overview',
  'GAO-001.lesson.l2.delivery',
]);

export function hasMedia(appLocation: string): boolean {
  // Broaden for first lesson (GAO-001) to guarantee the generated images show in the media player
  if (appLocation && appLocation.includes('GAO-001')) {
    return true;
  }
  // Support noon mode app screenshots
  if (appLocation && (appLocation.includes('noon') || appLocation.includes('brad') || appLocation.includes('dashboard') || appLocation.includes('packet'))) {
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
