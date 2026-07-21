// Media asset manifest (visual readiness).
//
// Approved, PHI-free lesson media is registered here by app.location. Lessons
// without an approved asset continue to receive the standard visual placeholder
// rather than an empty or broken media panel.

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

  "GAO-006.lesson.l1.delivery": "gao/gao-006-l01-understanding-abuse-neglect-exploitation.png",
  "GAO-006.lesson.l2.delivery": "gao/gao-006-l02-recognizing-the-signs.png",
  "GAO-006.lesson.l3.delivery": "gao/gao-006-l03-california-mandatory-reporting.png",
  "GAO-006.lesson.l4.delivery": "gao/gao-006-l04-federal-regulatory-framework.png",
  "GAO-006.lesson.l5.delivery": "gao/gao-006-l05-internal-reporting-protocol.png",
  "GAO-006.lesson.l6.delivery": "gao/gao-006-l06-preventing-abuse-in-practice.png",
  "GAO-006.lesson.l7.delivery": "gao/gao-006-l07-scenarios-and-application-mrs-chen.png",
  "GAO-006.lesson.l8.delivery": "gao/gao-006-l08-summary-key-takeaways.png",

  "GAO-007.lesson.l1.delivery": "gao/gao-007-l01-infection-control-in-home-health.png",
  "GAO-007.lesson.l2.delivery": "gao/gao-007-l02-chain-of-infection.png",
  "GAO-007.lesson.l3.delivery": "gao/gao-007-l03-hand-hygiene.png",
  "GAO-007.lesson.l4.delivery": "gao/gao-007-l04-personal-protective-equipment.png",
  "GAO-007.lesson.l5.delivery": "gao/gao-007-l05-standard-transmission-based-precautions.png",
  "GAO-007.lesson.l6.delivery": "gao/gao-007-l06-environmental-safety-in-home.png",
  "GAO-007.lesson.l7.delivery": "gao/gao-007-l07-bloodborne-pathogen-exposure-protocol.png",
  "GAO-007.lesson.l8.delivery": "gao/gao-007-l08-module-summary.png",

  "GAO-008.lesson.l1.delivery": "gao/gao-008-l01-introduction-to-emergency-preparedness.png",
  "GAO-008.lesson.l2.delivery": "gao/gao-008-l02-patient-medical-emergencies.png",
  "GAO-008.lesson.l3.delivery": "gao/gao-008-l03-earthquake.png",
  "GAO-008.lesson.l4.delivery": "gao/gao-008-l04-fire-and-power-outage.png",
  "GAO-008.lesson.l5.delivery": "gao/gao-008-l05-operational-emergencies-and-personal-safety.png",
  "GAO-008.lesson.l6.delivery": "gao/gao-008-l06-communication-during-emergencies.png",
  "GAO-008.lesson.l7.delivery": "gao/gao-008-l07-module-summary.png",

  "GAO-009.lesson.l1.delivery": "gao/gao-009-l01-why-body-mechanics-matter.png",
  "GAO-009.lesson.l2.delivery": "gao/gao-009-l02-principles-of-proper-body-mechanics.png",
  "GAO-009.lesson.l3.delivery": "gao/gao-009-l03-safe-patient-handling-techniques.png",
  "GAO-009.lesson.l4.delivery": "gao/gao-009-l04-ergonomics-in-the-home.png",
  "GAO-009.lesson.l5.delivery": "gao/gao-009-l05-injury-prevention-program.png",
  "GAO-009.lesson.l6.delivery": "gao/gao-009-l06-module-summary.png",

  "GAO-010.lesson.l1.delivery": "gao/gao-010-l01-vital-signs-in-home-health.png",
  "GAO-010.lesson.l2.delivery": "gao/gao-010-l02-blood-pressure.png",
  "GAO-010.lesson.l3.delivery": "gao/gao-010-l03-heart-rate-and-respiratory-rate.png",
  "GAO-010.lesson.l4.delivery": "gao/gao-010-l04-temperature-and-oxygen-saturation.png",
  "GAO-010.lesson.l5.delivery": "gao/gao-010-l05-pain-assessment.png",
  "GAO-010.lesson.l6.delivery": "gao/gao-010-l06-critical-value-reporting.png",
  "GAO-010.lesson.l7.delivery": "gao/gao-010-l07-common-errors-and-documentation.png",
  "GAO-010.lesson.l8.delivery": "gao/gao-010-l08-module-summary.png",

  "GAO-011.lesson.l1.delivery": "gao/gao-011-l01-why-communication-matters.png",
  "GAO-011.lesson.l2.delivery": "gao/gao-011-l02-active-listening.png",
  "GAO-011.lesson.l3.delivery": "gao/gao-011-l03-sbar-communication-framework.png",
  "GAO-011.lesson.l4.delivery": "gao/gao-011-l04-communicating-with-cognitive-impairment.png",
  "GAO-011.lesson.l5.delivery": "gao/gao-011-l05-family-and-caregiver-communication.png",
  "GAO-011.lesson.l6.delivery": "gao/gao-011-l06-documentation-as-communication.png",
  "GAO-011.lesson.l7.delivery": "gao/gao-011-l07-module-summary-inclusive-communication.png",

  "GAO-012.lesson.l1.delivery": "gao/gao-012-l01-cultural-competency-in-home-health.png",
  "GAO-012.lesson.l2.delivery": "gao/gao-012-l02-health-beliefs-and-practices.png",
  "GAO-012.lesson.l3.delivery": "gao/gao-012-l03-language-access-and-interpreter-services.png",
  "GAO-012.lesson.l4.delivery": "gao/gao-012-l04-religious-and-spiritual-care.png",
  "GAO-012.lesson.l5.delivery": "gao/gao-012-l05-lgbtq-inclusive-care.png",
  "GAO-012.lesson.l6.delivery": "gao/gao-012-l06-implicit-bias.png",
  "GAO-012.lesson.l7.delivery": "gao/gao-012-l07-module-summary.png",

  "GAO-013.lesson.l1.delivery": "gao/gao-013-l01-why-documentation-matters.png",
  "GAO-013.lesson.l2.delivery": "gao/gao-013-l02-documentation-standards.png",
  "GAO-013.lesson.l3.delivery": "gao/gao-013-l03-soap-and-dar-formats.png",
  "GAO-013.lesson.l4.delivery": "gao/gao-013-l04-incident-reporting.png",
  "GAO-013.lesson.l5.delivery": "gao/gao-013-l05-ehr-best-practices.png",
  "GAO-013.lesson.l6.delivery": "gao/gao-013-l06-survey-defensible-documentation.png",
  "GAO-013.lesson.l7.delivery": "gao/gao-013-l07-module-summary.png",

  "GAO-014.lesson.l1.delivery": "gao/gao-014-l01-time-management-in-home-health.png",
  "GAO-014.lesson.l2.delivery": "gao/gao-014-l02-professional-boundaries-defined.png",
  "GAO-014.lesson.l3.delivery": "gao/gao-014-l03-common-boundary-challenges.png",
  "GAO-014.lesson.l4.delivery": "gao/gao-014-l04-boundary-violations-warning-signs.png",
  "GAO-014.lesson.l5.delivery": "gao/gao-014-l05-consequences-of-boundary-violations.png",
  "GAO-014.lesson.l6.delivery": "gao/gao-014-l06-module-summary.png",

  "GAO-015.lesson.l1.delivery": "gao/gao-015-l01-agency-emergency-preparedness-plan.png",
  "GAO-015.lesson.l2.delivery": "gao/gao-015-l02-your-role-during-an-emergency.png",
  "GAO-015.lesson.l3.delivery": "gao/gao-015-l03-communication-protocols-during-emergencies.png",
  "GAO-015.lesson.l4.delivery": "gao/gao-015-l04-training-testing-and-post-event-review.png",

  "GAO-016.lesson.l1.delivery": "gao/gao-016-l01-pre-visit-safety-planning.png",
  "GAO-016.lesson.l2.delivery": "gao/gao-016-l02-situational-awareness-during-visits.png",
  "GAO-016.lesson.l3.delivery": "gao/gao-016-l03-high-risk-visit-and-vehicle-safety.png",
  "GAO-016.lesson.l4.delivery": "gao/gao-016-l04-incident-reporting-and-self-care.png",

  "GAO-017.lesson.l1.delivery": "gao/gao-017-l01-understanding-workplace-violence.png",
  "GAO-017.lesson.l2.delivery": "gao/gao-017-l02-prevention-recognition-and-response.png",
  "GAO-017.lesson.l3.delivery": "gao/gao-017-l03-reporting-zero-tolerance-and-support.png",

  "GAO-018.lesson.l1.delivery": "gao/gao-018-l01-injury-types-and-reporting.png",
  "GAO-018.lesson.l2.delivery": "gao/gao-018-l02-treatment-return-to-work-and-rights.png",

  "GAO-019.lesson.l1.delivery": "gao/gao-019-l01-legal-framework-and-protected-classes.png",
  "GAO-019.lesson.l2.delivery": "gao/gao-019-l02-recognizing-reporting-and-investigation.png",
  "GAO-019.lesson.l3.delivery": "gao/gao-019-l03-retaliation-bystanders-and-california.png",

  "GAO-020.lesson.l1.delivery": "gao/gao-020-l01-drug-free-workplace-requirements.png",
  "GAO-020.lesson.l2.delivery": "gao/gao-020-l02-eap-support-consequences-and-concerns.png",
  "GAO-021.lesson.l1.delivery": "gao/gao-021-l01-progressive-discipline-framework.png",
  "GAO-021.lesson.l2.delivery": "gao/gao-021-l02-employee-rights-appeals-and-culture.png",
  "GAO-022.lesson.l1.delivery": "gao/gao-022-l01-understanding-the-grievance-process.png",
  "GAO-022.lesson.l2.delivery": "gao/gao-022-l02-rights-anti-retaliation-and-remedies.png",
  "GAO-023.lesson.l1.delivery": "gao/gao-023-l01-acceptable-use-of-it-resources.png",
  "GAO-023.lesson.l2.delivery": "gao/gao-023-l02-social-media-and-patient-privacy.png",
  "GAO-024.lesson.l1.delivery": "gao/gao-024-l01-phishing-social-engineering-and-threats.png",
  "GAO-024.lesson.l2.delivery": "gao/gao-024-l02-password-mfa-and-incident-response.png",
  "GAO-025.lesson.l1.delivery": "gao/gao-025-l01-documentation-as-the-legal-record.png",
  "GAO-025.lesson.l2.delivery": "gao/gao-025-l02-orders-corrections-ehr-and-integrity.png",
  "GAO-026.lesson.l1.delivery": "gao/gao-026-l01-timekeeping-requirements-and-procedures.png",
  "GAO-026.lesson.l2.delivery": "gao/gao-026-l02-scheduling-absences-pto-and-expectations.png",
  "GAO-027.lesson.l1.delivery": "gao/gao-027-l01-health-insurance-enrollment-and-events.png",
  "GAO-027.lesson.l2.delivery": "gao/gao-027-l02-pto-leave-retirement-and-development.png",
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
