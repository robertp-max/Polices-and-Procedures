/**
 * Meeting-agenda generation (Section 15).
 *
 * Agendas are built from actual reviewed findings — never a list of uploaded
 * filenames. Sections are prioritized by compliance materiality. Approved
 * findings present as reviewed; draft findings are explicitly labeled draft and
 * may be marked review_during_meeting. Low-confidence items are never presented
 * as established fact. The agenda links the source review run and evidence.
 */

import type { BradReviewFinding, BradReviewRun, FindingSeverity } from './bradReview';

export type AgendaItemDisposition = 'reviewed' | 'draft_pending_review' | 'review_during_meeting';

export interface AgendaItem {
  itemId: string;
  title: string;
  findingType: string;
  severity: FindingSeverity;
  disposition: AgendaItemDisposition;
  sourceEvidenceId: string;
  sourcePointer: string;
  reference?: string;
  requiresDecision: boolean;
  requiresGoverningBodyEscalation: boolean;
  requiresLicensedClinicianReview: boolean;
  note: string;
}

export interface AgendaSection {
  sectionId: string;
  title: string;
  items: AgendaItem[];
}

export interface MeetingAgenda {
  agendaId: string;
  reviewRunId: string;
  eventId?: string;
  generatedBy: 'brad';
  generatedAt: string;
  /** True until human approval. */
  draft: boolean;
  sections: AgendaSection[];
  /** Items the user flagged for live review/approval. */
  reviewDuringMeetingCount: number;
  /** Source review run is partial — agenda cannot claim full coverage. */
  basedOnPartialReview: boolean;
  summary: string;
}

/** Priority-ordered agenda section taxonomy (Section 15). */
const SECTION_ORDER: { sectionId: string; title: string; match: (f: BradReviewFinding) => boolean }[] = [
  { sectionId: 'kpi', title: 'Material KPI changes', match: (f) => /metric|kpi|threshold|trend|rate/i.test(f.findingType) },
  { sectionId: 'complaints', title: 'Complaints & grievances', match: (f) => /complaint|grievance|investigation/i.test(f.findingType) },
  { sectionId: 'incidents', title: 'Incidents & adverse events', match: (f) => /incident|adverse|rca/i.test(f.findingType) },
  { sectionId: 'abuse', title: 'Abuse / neglect / exploitation', match: (f) => /abuse|neglect|exploitation/i.test(f.findingType) },
  { sectionId: 'infection', title: 'Infection surveillance', match: (f) => /infection|surveillance/i.test(f.findingType) },
  { sectionId: 'oasis', title: 'OASIS findings', match: (f) => /oasis/i.test(f.findingType) },
  { sectionId: 'poc', title: 'Plan of Care findings', match: (f) => /poc|plan_of_care|order/i.test(f.findingType) },
  { sectionId: 'medrec', title: 'Medication reconciliation', match: (f) => /med|medication/i.test(f.findingType) },
  { sectionId: 'chart', title: 'Chart audit findings', match: (f) => /chart|record_review/i.test(f.findingType) },
  { sectionId: 'pip', title: 'Active PIPs & corrective action status', match: (f) => /pip|corrective|capa/i.test(f.findingType) },
  { sectionId: 'gaps', title: 'Unresolved evidence gaps', match: (f) => /unresolved|missing|incomplete|unverified|unclear/i.test(f.findingType) },
  { sectionId: 'escalation', title: 'Items requiring Governing Body escalation', match: (f) => /governing_body|escalation/i.test(f.findingType) },
];

const SEVERITY_RANK: Record<FindingSeverity, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };

export interface AgendaOptions {
  agendaId: string;
  generatedAt: string;
  eventId?: string;
  /** Findings the user wants reviewed live during the meeting. */
  reviewDuringMeetingFindingIds?: string[];
  /** Findings already human-approved (present as reviewed, not draft). */
  approvedFindingIds?: string[];
}

export function generateMeetingAgenda(run: BradReviewRun, opts: AgendaOptions): MeetingAgenda {
  const reviewLive = new Set(opts.reviewDuringMeetingFindingIds ?? []);
  const approved = new Set(opts.approvedFindingIds ?? []);

  const toItem = (f: BradReviewFinding): AgendaItem => {
    let disposition: AgendaItemDisposition = 'draft_pending_review';
    if (reviewLive.has(f.findingId)) disposition = 'review_during_meeting';
    else if (approved.has(f.findingId)) disposition = 'reviewed';
    const lowConfidence = f.confidence < 0.6;
    return {
      itemId: `AGI-${f.findingId}`,
      title: humanizeFindingType(f.findingType),
      findingType: f.findingType,
      severity: f.severity,
      disposition,
      sourceEvidenceId: f.sourceEvidenceId,
      sourcePointer: f.sourcePointer,
      reference: f.reference,
      requiresDecision: f.severity === 'high' || f.severity === 'critical',
      requiresGoverningBodyEscalation: /governing_body|escalation/i.test(f.findingType) || f.severity === 'critical',
      requiresLicensedClinicianReview: f.requiresLicensedClinicianReview,
      note: lowConfidence
        ? `${f.factualBasis} (Low confidence — not presented as established fact.)`
        : f.factualBasis,
    };
  };

  const sections: AgendaSection[] = [];
  const claimed = new Set<string>();
  for (const def of SECTION_ORDER) {
    const items = run.findings
      .filter((f) => def.match(f) && !claimed.has(f.findingId))
      .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
      .map((f) => { claimed.add(f.findingId); return toItem(f); });
    if (items.length > 0) sections.push({ sectionId: def.sectionId, title: def.title, items });
  }
  // Any remaining findings → "Other reviewed items".
  const remaining = run.findings.filter((f) => !claimed.has(f.findingId)).map(toItem);
  if (remaining.length) sections.push({ sectionId: 'other', title: 'Other reviewed items', items: remaining });

  const reviewDuringMeetingCount = sections.reduce(
    (n, s) => n + s.items.filter((i) => i.disposition === 'review_during_meeting').length, 0,
  );

  const summary = run.status === 'partial'
    ? `Agenda drafted from a PARTIAL review (${run.reviewedRecords}/${run.totalRecords} records). Outstanding gaps are listed; coverage is not complete.`
    : `Agenda drafted from a full-population review of ${run.reviewedRecords} records. ${sections.length} prioritized section(s).`;

  return {
    agendaId: opts.agendaId,
    reviewRunId: run.reviewRunId,
    eventId: opts.eventId ?? run.eventId,
    generatedBy: 'brad',
    generatedAt: opts.generatedAt,
    draft: true,
    sections,
    reviewDuringMeetingCount,
    basedOnPartialReview: run.status === 'partial',
    summary,
  };
}

function humanizeFindingType(t: string): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
