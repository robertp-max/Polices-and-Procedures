// Media asset manifest (visual readiness).
//
// No final media assets are generated for the MVP. Every card still gets a safe,
// polished 16:9 placeholder ("Training Visual Placeholder" / "Visual Aid
// Pending") with alt text — never an empty black box and never a broken-image
// icon. `availableMedia` lists app.locations that have an approved image file on
// disk; it stays empty until approved, PHI-free media is produced.

export const MEDIA_ASSET_BASE = "/assets/media";

const MEDIA_PATH_OVERRIDES: Readonly<Record<string, string>> = {
  "GAO-002.lesson.l1.delivery": "gao/gao-002-l01-why-structure-matters.png",
  "GAO-002.lesson.l2.delivery": "gao/gao-002-l02-governing-body.png",
  "GAO-002.lesson.l3.delivery": "gao/gao-002-l03-administrator-role.png",
  "GAO-002.lesson.l4.delivery": "gao/gao-002-l04-clinical-manager-don.png",
  "GAO-002.lesson.l5.delivery": "gao/gao-002-l05-clinical-staff-structure.png",
  "GAO-002.lesson.l6.delivery": "gao/gao-002-l06-reporting-chain.png",
  "GAO-002.lesson.l7.delivery": "gao/gao-002-l07-communication-pathways.png",
  "GAO-002.lesson.l8.delivery": "gao/gao-002-l08-module-summary.png",

  "GAO-003.lesson.l1.delivery": "gao/gao-003-l01-what-home-health-care-is.png",
  "GAO-003.lesson.l2.delivery": "gao/gao-003-l02-services-we-provide.png",
  "GAO-003.lesson.l3.delivery": "gao/gao-003-l03-scope-boundaries.png",
  "GAO-003.lesson.l4.delivery": "gao/gao-003-l04-interdisciplinary-team.png",
  "GAO-003.lesson.l5.delivery": "gao/gao-003-l05-module-summary.png",

  "GAO-004.lesson.l1.delivery": "gao/gao-004-l01-why-compliance-matters.png",
  "GAO-004.lesson.l2.delivery": "gao/gao-004-l02-seven-elements-of-compliance.png",
  "GAO-004.lesson.l3.delivery": "gao/gao-004-l03-compliance-obligations.png",
  "GAO-004.lesson.l4.delivery": "gao/gao-004-l04-fraud-waste-abuse.png",
  "GAO-004.lesson.l5.delivery": "gao/gao-004-l05-reporting-protections.png",
  "GAO-004.lesson.l6.delivery": "gao/gao-004-l06-corporate-compliance-summary.png",

  "GAO-005.lesson.l1.delivery": "gao/gao-005-l01-compliance-hotline.png",
  "GAO-005.lesson.l2.delivery": "gao/gao-005-l02-what-to-report-and-how.png",
  "GAO-005.lesson.l3.delivery": "gao/gao-005-l03-after-you-report.png",
  "GAO-005.lesson.l4.delivery": "gao/gao-005-l04-whistleblower-protections.png",
  "GAO-005.lesson.l5.delivery": "gao/gao-005-l05-module-summary.png",

  "GAO-007.lesson.l1.delivery": "gao/gao-007-l01-workplace-safety-infection-control.png",
  "GAO-007.lesson.l2.delivery": "gao/gao-007-extra-workplace-safety-option-a.png",
  "GAO-007.lesson.l3.delivery": "gao/gao-007-l03-infection-control.png",
  "GAO-007.lesson.l4.delivery": "gao/gao-007-extra-workplace-safety-option-b.png",
  "GAO-007.lesson.l5.delivery": "gao/gao-007-extra-workplace-safety-option-c.png",
  "GAO-007.lesson.l6.delivery": "gao/gao-007-l06-facility-environment-safety.png",
  "GAO-007.lesson.l8.delivery": "gao/gao-007-l08-putting-it-all-together.png",

  "GAO-008.lesson.l1.delivery": "gao/gao-008-l01-emergency-readiness.png",

  "GAO-009.lesson.l3.delivery": "gao/gao-009-l03-equipment-safety.png",
  "GAO-009.lesson.l4.delivery": "gao/gao-009-l04-home-safety-hazards.png",
  "GAO-009.lesson.l5.delivery": "gao/gao-009-l05-fall-prevention.png",

  "GAO-015.lesson.l1.delivery": "gao/gao-015-l01-agency-emergency-preparedness-plan.png",
  "GAO-015.lesson.l2.delivery": "gao/gao-015-l02-role-during-emergency.png",
  "GAO-015.lesson.l3.delivery": "gao/gao-015-l03-communication-reporting-emergency.png",
  "GAO-015.lesson.l4.delivery": "gao/gao-015-l04-training-testing-plan-updates.png",
};

export function mediaAssetPath(appLocation: string): string {
  const loc = appLocation.trim();

  if (MEDIA_PATH_OVERRIDES[loc]) {
    return `${MEDIA_ASSET_BASE}/${MEDIA_PATH_OVERRIDES[loc]}`;
  }

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
  ...Object.keys(MEDIA_PATH_OVERRIDES),
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
