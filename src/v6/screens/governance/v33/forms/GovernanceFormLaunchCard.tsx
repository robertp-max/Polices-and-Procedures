// Premium launch card for a single canonical GB form. Presentational only —
// it never renders form fields/content itself; it routes to the canonical
// /forms/:id surfaces (view, e-sign, print) owned by the Forms Library.

import { useNavigate } from 'react-router-dom';
import { ArrowRight, PenLine, Eye, RefreshCcw, Users } from 'lucide-react';
import type { GovernanceFormEntry } from './governanceFormProjection';
import type { UserFacingStatus } from '../compliance/complianceTypes';

/** Minimal, honest summary of a related GB compliance requirement (never fabricated). */
export interface RelatedRequirementSummary {
  title: string;
  userFacingStatus: UserFacingStatus;
  statusLabel: string;
}

export interface GovernanceFormLaunchCardProps {
  entry: GovernanceFormEntry;
  /** The related "policy reading" GB compliance requirement, if one exists for a linked GV-GB policy. */
  relatedRequirement?: RelatedRequirementSummary | null;
  /** Override navigation (used in tests); defaults to react-router's navigate(). */
  onNavigate?: (path: string) => void;
}

const STATUS_TONE: Record<UserFacingStatus, string> = {
  required_not_started: 'attention',
  in_progress: 'attention',
  due_soon: 'attention',
  overdue: 'critical',
  additional_validation_pending: 'hold',
  blocked: 'hold',
  remediation_required: 'critical',
  completed: 'positive',
};

export default function GovernanceFormLaunchCard({ entry, relatedRequirement, onNavigate }: GovernanceFormLaunchCardProps) {
  const navigate = useNavigate();
  const go = (path: string) => (onNavigate ? onNavigate(path) : navigate(path));

  const isAttestation = entry.type === 'Attestation';
  const inProgress = relatedRequirement?.userFacingStatus === 'in_progress';
  const primaryLabel = inProgress ? 'Continue' : isAttestation ? 'Sign' : 'Open form';
  const primaryPath = isAttestation ? `/forms/${encodeURIComponent(entry.id)}/esign` : `/forms/${encodeURIComponent(entry.id)}`;
  const reviewPath = `/forms/${encodeURIComponent(entry.id)}/print`;

  const titleId = `gb-form-title-${entry.id}`;

  return (
    <article className="gbform-card" aria-labelledby={titleId}>
      <header className="gbform-card-head">
        <span className="gbform-card-id">{entry.id}</span>
        <h3 id={titleId} className="gbform-card-title">{entry.title}</h3>
        <div className="gbform-card-tags">
          <span className="gbform-tag">{entry.type}</span>
          {entry.frequency ? (
            <span className="gbform-tag gbform-tag-recurrence">
              <RefreshCcw size={12} aria-hidden="true" /> {entry.frequency}
            </span>
          ) : null}
          {entry.usage === 'Required' ? <span className="gbform-tag gbform-tag-required">Required</span> : null}
        </div>
      </header>

      {entry.whyRequired ? (
        <p className="gbform-card-why">
          <span className="gbform-card-label">Why required</span>
          {entry.whyRequired}
        </p>
      ) : null}

      {entry.whoSigns.length > 0 ? (
        <p className="gbform-card-signers">
          <Users size={14} aria-hidden="true" />
          <span className="gbform-card-label">Who signs</span>
          {entry.whoSigns.join(', ')}
        </p>
      ) : null}

      {entry.linkedPolicies.length > 0 ? (
        <ul className="gbform-card-policies" aria-label="Linked policies">
          {entry.linkedPolicies.map((p) => (
            <li key={p.id}>{p.isCorpusPolicy ? `${p.id} — ${p.title}` : p.title}</li>
          ))}
        </ul>
      ) : null}

      {relatedRequirement ? (
        <p className={`gbform-related-status gbform-related-status-${STATUS_TONE[relatedRequirement.userFacingStatus]}`}>
          Related GB requirement — {relatedRequirement.title}:{' '}
          <strong>{relatedRequirement.statusLabel}</strong>
        </p>
      ) : null}

      {!entry.mappingComplete ? (
        <p className="gbform-mapping-gap" role="status">
          Canonical content mapping incomplete for this form — showing catalog metadata only.
        </p>
      ) : null}

      <div className="gbform-card-actions">
        <button type="button" className="gbform-action-primary" onClick={() => go(primaryPath)}>
          {isAttestation ? <PenLine size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
          {primaryLabel}
        </button>
        <button type="button" className="gbform-action-secondary" onClick={() => go(reviewPath)}>
          <Eye size={15} aria-hidden="true" />
          Review
        </button>
      </div>
    </article>
  );
}
