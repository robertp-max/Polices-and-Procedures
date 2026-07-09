import type { HelpImageAsset } from '../types';

// Screenshot registry. Assets live under public/assets/help/. Entries start as
// 'placeholder' and flip to 'captured' when the capture plan lands a real
// screenshot at `src`. HelpScreenshotFrame renders a designed placeholder for
// any image whose asset is missing or still 'placeholder', so articles never
// show broken images. All captures use demo/mock data only — no PHI.
export const HELP_IMAGES: Record<string, HelpImageAsset> = {
  'img-help-home': { imageId: 'img-help-home', src: '/assets/help/help-home.png', alt: 'Help Center Command Center homepage with hero, quick tiles, and category grid', captureRoute: '/help', viewport: 'desktop', status: 'captured' },
  'img-office-syllabus': { imageId: 'img-office-syllabus', src: '/assets/help/office-syllabus.png', alt: 'Office Staff Training syllabus landing with module cards', captureRoute: '/help/syllabus', viewport: 'desktop', status: 'captured' },
  'img-brad-workspace': { imageId: 'img-brad-workspace', src: '/assets/help/brad-workspace.png', alt: 'Brad workspace with question composer and quick actions', captureRoute: '/iadministrator', viewport: 'desktop', status: 'captured' },
  'img-nolan-tutor': { imageId: 'img-nolan-tutor', src: '/assets/help/nolan-tutor.png', alt: 'Nolan tutor panel open on the Training Academy', captureRoute: '/journey', viewport: 'desktop', status: 'captured' },
  'img-ces-board': { imageId: 'img-ces-board', src: '/assets/help/ces-board.png', alt: 'CES board with kanban columns and filter chips', captureRoute: '/ces/board', viewport: 'desktop', status: 'captured' },
  'img-ces-calendar': { imageId: 'img-ces-calendar', src: '/assets/help/ces-calendar.png', alt: 'CES calendar with month view and event chips', captureRoute: '/ces/calendar', viewport: 'desktop', status: 'captured' },
  'img-events-board': { imageId: 'img-events-board', src: '/assets/help/events-board.png', alt: 'Events risk board with risk buckets', captureRoute: '/ces/events', viewport: 'desktop', status: 'captured' },
  'img-my-tasks': { imageId: 'img-my-tasks', src: '/assets/help/my-tasks.png', alt: 'My Tasks personal board with task lanes', captureRoute: '/my-tasks', viewport: 'desktop', status: 'captured' },
  'img-evidence-intake': { imageId: 'img-evidence-intake', src: '/assets/help/evidence-intake.png', alt: 'Evidence intake with drag-and-drop upload zone and parsed records', captureRoute: '/evidence/intake', viewport: 'desktop', status: 'captured' },
  'img-evidence-packet-studio': { imageId: 'img-evidence-packet-studio', src: '/assets/help/evidence-packet-studio.png', alt: 'Evidence Packet Studio with template gallery', captureRoute: '/evidence/packet-studio', viewport: 'desktop', status: 'captured' },
  'img-ecign-status': { imageId: 'img-ecign-status', src: '/assets/help/ecign-status.png', alt: 'eCign signing workspace with lifecycle stages', captureRoute: '/reports/ecign-signatures', viewport: 'desktop', status: 'captured' },
  'img-forms-library': { imageId: 'img-forms-library', src: '/assets/help/forms-library.png', alt: 'Forms library matrix with classification filters', captureRoute: '/forms', viewport: 'desktop', status: 'captured' },
  'img-form-viewer': { imageId: 'img-form-viewer', src: '/assets/help/form-viewer.png', alt: 'Form workspace with fillable fields and print button', captureRoute: '/forms', viewport: 'desktop', status: 'captured' },
  'img-policy-library': { imageId: 'img-policy-library', src: '/assets/help/policy-library.png', alt: 'Policy library matrix with search and filters', captureRoute: '/library/policies', viewport: 'desktop', status: 'captured' },
  'img-policy-detail': { imageId: 'img-policy-detail', src: '/assets/help/policy-detail.png', alt: 'Policy detail with section tabs', captureRoute: '/library', viewport: 'desktop', status: 'captured' },
  'img-qapi-reports': { imageId: 'img-qapi-reports', src: '/assets/help/qapi-reports.png', alt: 'CES reports with readiness trend chart', captureRoute: '/ces/reports', viewport: 'desktop', status: 'captured' },
  'img-audit-mode': { imageId: 'img-audit-mode', src: '/assets/help/audit-mode.png', alt: 'Audit mode with evidence rows and status tiles', captureRoute: '/audit', viewport: 'desktop', status: 'captured' },
  'img-achc-views': { imageId: 'img-achc-views', src: '/assets/help/achc-views.png', alt: 'ACHC survey alignment view', captureRoute: '/framework/achc-survey', viewport: 'desktop', status: 'captured' },
  'img-artifact-viewer': { imageId: 'img-artifact-viewer', src: '/assets/help/artifact-viewer.png', alt: 'Artifact viewer with lineage and download', captureRoute: '/audit', viewport: 'desktop', status: 'captured' },
  'img-admission-packet': { imageId: 'img-admission-packet', src: '/assets/help/admission-packet.png', alt: 'Patient admission packet preview pages', captureRoute: '/evidence/admission-packet-preview', viewport: 'desktop', status: 'captured' },
  'img-journey-academy': { imageId: 'img-journey-academy', src: '/assets/help/journey-academy.png', alt: 'Training Academy home with module cards', captureRoute: '/journey', viewport: 'desktop', status: 'captured' },
  'img-community-threads': { imageId: 'img-community-threads', src: '/assets/help/community-threads.png', alt: 'Community threads list', captureRoute: '/community', viewport: 'desktop', status: 'captured' },
  'img-personal-ops': { imageId: 'img-personal-ops', src: '/assets/help/personal-ops.png', alt: 'Personal Ops panel with focus items', captureRoute: '/dashboard', viewport: 'desktop', status: 'captured' },
  'img-troubleshooting': { imageId: 'img-troubleshooting', src: '/assets/help/troubleshooting.png', alt: 'Troubleshooting category with fix guides', captureRoute: '/help/category/troubleshooting', viewport: 'desktop', status: 'captured' },
  'img-admin-groups': { imageId: 'img-admin-groups', src: '/assets/help/admin-groups.png', alt: 'Admin user groups management table', captureRoute: '/admin/user-groups', viewport: 'desktop', status: 'captured' },
};

export function getHelpImage(imageId: string): HelpImageAsset | undefined {
  return HELP_IMAGES[imageId];
}
