// Governing Body reference documents — served ONLY inside the authenticated
// Governing Body portal (review blocker 6).
//
// These counsel-review / template documents previously lived under
// /public/governance-references/, which made them world-readable at a stable
// static URL regardless of login. They are now bundled application content
// rendered exclusively by GbReferenceViewer behind the authenticated
// /governance route. Decisions keep a reference DESCRIPTOR (docId), never a
// public URL. If a shareable artifact is ever needed, it must go through CES
// or role-controlled Drive with a short-lived signed URL — not static hosting.

import handbook2026Html from './handbook-2026-counsel-review-draft.html?raw';
import admissionPacketHtml from './patient-admission-packet-letter-form.html?raw';

export type GbReferenceDocId = 'handbook-2026-counsel-review-draft' | 'patient-admission-packet-letter-form';

export interface GbReferenceDoc {
  id: GbReferenceDocId;
  title: string;
  /** Controlled-document banner shown above the rendered content. */
  controlNotice: string;
  html: string;
}

export const GB_REFERENCE_DOCS: Record<GbReferenceDocId, GbReferenceDoc> = {
  'handbook-2026-counsel-review-draft': {
    id: 'handbook-2026-counsel-review-draft',
    title: 'Employee & Field Workforce Handbook 2026 — counsel-review draft',
    controlNotice:
      'COUNSEL-REVIEW DRAFT · BOARD APPROVAL REFERENCE — not effective, not for distribution, no acknowledgments. Viewable only inside the authenticated Governing Body portal.',
    html: handbook2026Html,
  },
  'patient-admission-packet-letter-form': {
    id: 'patient-admission-packet-letter-form',
    title: 'Patient Admission Packet — letter form template',
    controlNotice:
      'TEMPLATE SOURCE · BOARD APPROVAL REFERENCE — production use requires the packet controls decision to pass. Viewable only inside the authenticated Governing Body portal.',
    html: admissionPacketHtml,
  },
};

export function getGbReferenceDoc(id: GbReferenceDocId): GbReferenceDoc {
  return GB_REFERENCE_DOCS[id];
}
