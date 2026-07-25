/**
 * Handbook view helpers over the controlled generated projection.
 *
 * The 2026 handbook is a COUNSEL-REVIEW DRAFT — not effective. These helpers
 * expose the baked projection (content/handbook/2026-review/generated) to the
 * native reader. They never mark it effective or enable acknowledgment; that is
 * gated by HANDBOOK_META.acknowledgmentEnabled (false until an approved build).
 */

import {
  HANDBOOK_SECTIONS,
  getHandbookSection,
  type HandbookSection,
} from "../../../content/handbook/2026-review/generated/handbookSections.generated";
import { HANDBOOK_META } from "../../../content/handbook/2026-review/generated/handbookMeta.generated";
import { resolveMainAppHref } from "./mainAppUrl";

export { HANDBOOK_SECTIONS, getHandbookSection, HANDBOOK_META };
export type { HandbookSection };

export function handbookSectionsInOrder(): HandbookSection[] {
  return [...HANDBOOK_SECTIONS].sort((a, b) => a.order - b.order);
}

export function adjacentSections(id: string): {
  prev: HandbookSection | null;
  next: HandbookSection | null;
} {
  const ordered = handbookSectionsInOrder();
  const i = ordered.findIndex((s) => s.id === id);
  if (i === -1) return { prev: null, next: null };
  return { prev: ordered[i - 1] ?? null, next: ordered[i + 1] ?? null };
}

/** Same-tab main-app link for a policy id, or null when unresolved (prod-unconfigured). */
export function policyHref(policyId: string): string | null {
  const r = resolveMainAppHref(`/library/${policyId}`);
  return r.ok ? r.href : null;
}

/** Same-tab main-app link for a form id, or null when unresolved. */
export function formHref(formId: string): string | null {
  const r = resolveMainAppHref(`/forms/${formId}`);
  return r.ok ? r.href : null;
}

export interface HandbookRefIndexEntry {
  id: string;
  sections: { id: string; title: string }[];
}

/** Unique policy ids across the handbook, each with the sections that cite it. */
export function policyReferenceIndex(): HandbookRefIndexEntry[] {
  return buildIndex((s) => s.policyIds);
}

/** Unique form/record ids across the handbook, each with the citing sections. */
export function formReferenceIndex(): HandbookRefIndexEntry[] {
  return buildIndex((s) => s.formIds);
}

/** Unique external authorities across the handbook. */
export function externalAuthorityIndex(): HandbookRefIndexEntry[] {
  return buildIndex((s) => s.externalAuthorities);
}

function buildIndex(pick: (s: HandbookSection) => string[]): HandbookRefIndexEntry[] {
  const map = new Map<string, { id: string; title: string }[]>();
  for (const s of handbookSectionsInOrder()) {
    for (const ref of pick(s)) {
      if (!map.has(ref)) map.set(ref, []);
      map.get(ref)!.push({ id: s.id, title: s.title });
    }
  }
  return Array.from(map.entries())
    .map(([id, sections]) => ({ id, sections }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ── Employee-journey lifecycle map (§4) ───────────────────────────────────────
// Curated: which handbook sections are most relevant at each lifecycle phase.
// Uses only real section ids from the projection.
export interface LifecyclePhase {
  key: string;
  label: string;
  blurb: string;
  sectionIds: string[];
}

const SECTION_IDS = new Set(HANDBOOK_SECTIONS.map((s) => s.id));
function keep(ids: string[]): string[] {
  return ids.filter((id) => SECTION_IDS.has(id));
}

export function handbookLifecycle(): LifecyclePhase[] {
  return [
    { key: "pre-hire", label: "Pre-hire", blurb: "Screening, eligibility, and credentials before day one.",
      sectionIds: keep(["recruitment", "i9", "screening-credentials", "eeo", "at-will"]) },
    { key: "day-1", label: "Day 1", blurb: "Acknowledgment, conduct, privacy, and safety basics.",
      sectionIds: keep(["control", "welcome", "how-to-use", "conduct", "privacy", "safety", "contacts"]) },
    { key: "first-week", label: "First week", blurb: "Pay, timekeeping, breaks, and attendance.",
      sectionIds: keep(["classification", "pay", "timekeeping", "overtime", "breaks", "attendance", "expenses"]) },
    { key: "first-30-90", label: "First 30–90 days", blurb: "Performance, competency, and introductory review.",
      sectionIds: keep(["performance", "discipline", "complaints"]) },
    { key: "ongoing", label: "Ongoing", blurb: "Standards, technology, substance policy, and privacy.",
      sectionIds: keep(["technology", "employee-privacy", "substance", "harassment", "protected-rights", "notices"]) },
    { key: "annual", label: "Annual / recurring", blurb: "Benefits, sick leave, and recurring obligations.",
      sectionIds: keep(["benefits", "sick-leave", "leave-overview"]) },
    { key: "leave-return", label: "Leave / return", blurb: "Family/medical, disability, and other leaves.",
      sectionIds: keep(["family-medical", "di-pfl", "other-leaves"]) },
    { key: "safety-exposure", label: "Safety & exposure", blurb: "Injury, exposure, and workplace-violence response.",
      sectionIds: keep(["safety", "exposure"]) },
  ].filter((p) => p.sectionIds.length > 0);
}
