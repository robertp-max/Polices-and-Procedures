import { useMemo } from 'react';
import { AlertTriangle, CalendarClock, FileCheck2, Gavel, Landmark, Link2, Scale, ShieldCheck } from 'lucide-react';
import type { PolicyJourneyRequirement } from '../generated/policyJourney.types';
import type { PolicyContentSection } from '../types';
import { cleanTitle, extractSentences, tableRows } from './policyTextUtils';
import { getRelatedFormsForPolicy } from './policyFormProjection';

const RETAINED_RE = /\b(governing body|board)\b[^.]{0,40}\b(shall retain|shall maintain|shall not delegate|retains?)\b|\bultimate (authority|accountability|responsibility)\b/i;
const DELEGABLE_RE = /\b(administrator|clinical manager|director of nursing|designee|management)\b[^.]{0,60}\bshall\b/i;
const DECISION_RE = /\bshall (approve|appoint|adopt|ratify)\b/i;
const ESCALATION_RE = /\bwithin\s+\d+\s+(calendar|business)?\s*(day|days|hour|hours)\b|\bescalat\w*\b/i;

function LensBlock({ icon, kicker, sentences, emptyLabel }: {
  icon: React.ReactNode;
  kicker: string;
  sentences: { sectionId: string; sectionTitle: string; text: string }[];
  emptyLabel: string;
}) {
  return (
    <section className="pv3-lens-block">
      <header>{icon}<span>{kicker}</span></header>
      {sentences.length === 0 ? (
        <p className="pv3-lens-empty">{emptyLabel}</p>
      ) : (
        <ul>
          {sentences.map((s, i) => (
            <li key={`${s.sectionId}-${i}`}>
              <p>{s.text}</p>
              <small>Source: {s.sectionTitle}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Real cross-references, pulled from the policy's own "References" table — a stand-in for linked workflow data. */
function useLinkedPolicyRows(sections: readonly PolicyContentSection[]) {
  return useMemo(() => {
    const refSection = sections.find((s) => /reference/i.test(s.title));
    if (!refSection) return [];
    const rows = tableRows(refSection.body);
    if (!rows || rows.length < 2) return [];
    const header = rows[0].map((h) => h.toLowerCase());
    const idCol = header.findIndex((h) => h.includes('policy id'));
    const titleCol = header.findIndex((h) => h.includes('title'));
    const relCol = header.findIndex((h) => h.includes('relation'));
    if (idCol === -1) return [];
    return rows.slice(1)
      .filter((row) => /^[A-Z]{2,3}-[A-Z]{2}-\d{3}/.test(row[idCol] ?? ''))
      .slice(0, 5)
      .map((row) => ({ id: row[idCol], title: titleCol >= 0 ? row[titleCol] : '', relationship: relCol >= 0 ? row[relCol] : '' }));
  }, [sections]);
}

export default function PolicyBoardLens({ requirement, sections, onJumpToForms }: {
  requirement: PolicyJourneyRequirement;
  sections: readonly PolicyContentSection[];
  onJumpToForms: () => void;
}) {
  const retained = useMemo(() => extractSentences(sections, RETAINED_RE, 3), [sections]);
  const delegable = useMemo(() => extractSentences(sections, DELEGABLE_RE, 3), [sections]);
  const decisions = useMemo(() => extractSentences(sections, DECISION_RE, 3), [sections]);
  const escalation = useMemo(() => extractSentences(sections, ESCALATION_RE, 3), [sections]);
  const linkedForms = useMemo(() => getRelatedFormsForPolicy(requirement.policyId), [requirement.policyId]);
  const linkedPolicies = useLinkedPolicyRows(sections);

  const ev = requirement.evidenceRequirements;
  const hasReleaseIssue = requirement.release.state !== 'ready';
  const hasSourceNote = Boolean(requirement.source.sourceNotesRaw);

  return (
    <aside className="pv3-lens" aria-label="Board lens">
      <div className="pv3-lens-head">
        <span>BOARD LENS</span>
        <h2>Read for the decision.</h2>
        <p>Every item below is pulled from this policy's own controlled text or its assignment record — nothing here is invented.</p>
      </div>

      <LensBlock icon={<Landmark size={14} />} kicker="RETAINED BY THE BOARD" sentences={retained} emptyLabel="This policy's controlled text does not use explicit retained-authority language." />
      <LensBlock icon={<Scale size={14} />} kicker="DELEGABLE TO MANAGEMENT" sentences={delegable} emptyLabel="No management-delegation language found in this policy's controlled text." />
      <LensBlock icon={<Gavel size={14} />} kicker="DECISIONS THE BOARD MUST MAKE" sentences={decisions} emptyLabel="No explicit Board approval/appointment clause found in this policy's controlled text." />
      <LensBlock icon={<CalendarClock size={14} />} kicker="DEADLINES & ESCALATION TRIGGERS" sentences={escalation} emptyLabel="No numbered deadline or escalation clause found in this policy's controlled text." />

      <section className="pv3-lens-block">
        <header><FileCheck2 size={14} /><span>REQUIRED EVIDENCE</span></header>
        <ul className="pv3-evidence-list">
          <li>Full controlled-text read, section by section</li>
          <li>Director attestation of reading</li>
          <li>{ev.quizContentStatus === 'not_provided' ? 'Course assessment (reviewed bank pending)' : `Course assessment · pass ≥ ${ev.passScorePercent}%`}</li>
          {ev.separateValidationGate && <li>Separate validation: {ev.validationRaw || ev.validationModalities.join(', ')}</li>}
        </ul>
        <p className="pv3-lens-note">Recurrence: {requirement.schedule.recurrenceRaw || 'not specified in the source workbook'}. Target: read/attest/quiz by day {requirement.schedule.readAttestQuizTargetDay}, validation by day {requirement.schedule.validationTargetDay}.</p>
      </section>

      <section className="pv3-lens-block">
        <header><Link2 size={14} /><span>LINKED FORMS</span></header>
        {linkedForms.length === 0 ? (
          <p className="pv3-lens-empty">No canonical form is linked to this policy in the current Forms Library.</p>
        ) : (
          <>
            <ul>
              {linkedForms.slice(0, 3).map((f) => <li key={f.record.id}><strong>{f.record.id}</strong> {f.record.name}</li>)}
            </ul>
            <button className="pv3-lens-link" onClick={onJumpToForms}>View all {linkedForms.length} in Related forms &amp; records →</button>
          </>
        )}
      </section>

      <section className="pv3-lens-block">
        <header><Link2 size={14} /><span>LINKED POLICIES &amp; WORKFLOW CROSS-REFERENCES</span></header>
        {linkedPolicies.length === 0 ? (
          <p className="pv3-lens-empty">This policy's controlled text does not carry a cross-reference table.</p>
        ) : (
          <ul>
            {linkedPolicies.map((row) => (
              <li key={row.id}><strong>{row.id}</strong> {cleanTitle(row.title || '')}{row.relationship ? <em> — {row.relationship}</em> : null}</li>
            ))}
          </ul>
        )}
      </section>

      <section className={`pv3-lens-block ${hasReleaseIssue || hasSourceNote ? 'pv3-lens-flag' : ''}`}>
        <header>{hasReleaseIssue || hasSourceNote ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}<span>UNRESOLVED SOURCE / REVIEW ISSUES</span></header>
        {!hasReleaseIssue && !hasSourceNote ? (
          <p className="pv3-lens-empty">No open source or review issues recorded for this assignment.</p>
        ) : (
          <ul>
            {hasReleaseIssue && <li>Release status: {requirement.release.raw}{requirement.release.blockerIds.length ? ` (blockers: ${requirement.release.blockerIds.join(', ')})` : ''}</li>}
            {hasSourceNote && <li>{requirement.source.sourceNotesRaw}</li>}
          </ul>
        )}
      </section>
    </aside>
  );
}
