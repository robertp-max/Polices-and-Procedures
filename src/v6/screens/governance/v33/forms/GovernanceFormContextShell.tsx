// Optional GB-branded wrapper around a single canonical form. It supplies
// premium context (why required, who signs, recurrence, related compliance
// requirement, return-to-My-Compliance) and then EMBEDS the canonical form
// via /forms/:id?embed=1 — it never re-implements fields, validation, or
// signatures itself.

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, PenLine, RefreshCcw, Users } from 'lucide-react';
import { buildGovernanceFormList } from './governanceFormProjection';
import { resolveCanonicalFormId, resolveFormTitle } from '@/policy/data/formIdAliases';
import { useCompliance } from '../compliance/useCompliance';
import type { UserFacingStatus } from '../compliance/complianceTypes';

export interface GovernanceFormContextShellProps {
  /** Any known/legacy or canonical form id — resolved via resolveCanonicalFormId. */
  formId: string;
  onReturnToCompliance?: () => void;
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

export default function GovernanceFormContextShell({ formId, onReturnToCompliance }: GovernanceFormContextShellProps) {
  const navigate = useNavigate();
  const canonicalId = resolveCanonicalFormId(formId) ?? formId;

  const entry = useMemo(() => buildGovernanceFormList().find((e) => e.id === canonicalId) ?? null, [canonicalId]);
  const { views } = useCompliance();

  const related = useMemo(() => {
    if (!entry) return null;
    for (const policyId of entry.matchedViaGbPolicies) {
      const view = views.find((v) => v.assignment.type === 'policy_reading' && v.assignment.sourceId === policyId);
      if (view) return view;
    }
    return null;
  }, [entry, views]);

  const title = entry?.title ?? resolveFormTitle(canonicalId);
  const isAttestation = entry?.type === 'Attestation';
  const fullPath = `/forms/${encodeURIComponent(canonicalId)}`;
  const embedSrc = `${fullPath}?embed=1`;
  const esignPath = `${fullPath}/esign`;

  return (
    <div className="gbform-shell">
      <header className="gbform-shell-head">
        <div className="gbform-shell-topline">
          {onReturnToCompliance ? (
            <button type="button" className="gbform-back" onClick={onReturnToCompliance}>
              <ArrowLeft size={17} aria-hidden="true" />
              Return to My Compliance
            </button>
          ) : null}
          <span className="gbform-kicker">Governing Body Form · {canonicalId}</span>
        </div>
        <h1>{title}</h1>

        <div className="gbform-shell-meta">
          {entry?.frequency ? (
            <span>
              <RefreshCcw size={13} aria-hidden="true" /> Recurrence: {entry.frequency}
            </span>
          ) : null}
          {entry && entry.whoSigns.length > 0 ? (
            <span>
              <Users size={13} aria-hidden="true" /> Signs: {entry.whoSigns.join(', ')}
            </span>
          ) : null}
        </div>

        {entry?.whyRequired ? <p className="gbform-shell-why">{entry.whyRequired}</p> : null}

        {related ? (
          <p className={`gbform-related-status gbform-related-status-${STATUS_TONE[related.userFacingStatus]}`}>
            Related GB requirement — {related.assignment.title}: <strong>{related.statusLabel}</strong>
          </p>
        ) : null}

        {entry && !entry.mappingComplete ? (
          <p className="gbform-mapping-gap" role="status">
            Canonical content mapping incomplete for this form — context shown is limited to catalog metadata.
          </p>
        ) : null}

        <div className="gbform-shell-actions">
          {isAttestation ? (
            <button type="button" className="gbform-action-primary" onClick={() => navigate(esignPath)}>
              <PenLine size={15} aria-hidden="true" />
              Sign
            </button>
          ) : null}
          <button type="button" className="gbform-action-secondary" onClick={() => navigate(fullPath)}>
            <ExternalLink size={15} aria-hidden="true" />
            Open full form
          </button>
        </div>
      </header>

      <div className="gbform-shell-embed">
        <iframe src={embedSrc} title={`${title} — canonical form`} loading="lazy" />
      </div>
      <p className="gbform-shell-embed-fallback">
        If the form does not display above,{' '}
        <button type="button" className="gbform-inline-link" onClick={() => navigate(fullPath)}>
          open it directly
        </button>
        .
      </p>
    </div>
  );
}
