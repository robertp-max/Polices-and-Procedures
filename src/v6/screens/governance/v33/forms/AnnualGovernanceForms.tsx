// Annual Governance Forms workspace (§7). Lists every canonical form the
// Governing Body is accountable for, grouped sensibly by domain, using only
// canonical FORMS_DATASET + policy-link data — no invented forms or content.

import { useMemo } from 'react';
import { ArrowLeft, FileStack } from 'lucide-react';
import { buildGovernanceFormList, groupGovernanceForms } from './governanceFormProjection';
import GovernanceFormLaunchCard, { type RelatedRequirementSummary } from './GovernanceFormLaunchCard';
import { useCompliance } from '../compliance/useCompliance';

export interface AnnualGovernanceFormsProps {
  onExit?: () => void;
}

export default function AnnualGovernanceForms({ onExit }: AnnualGovernanceFormsProps) {
  const { views } = useCompliance();

  const groups = useMemo(() => groupGovernanceForms(buildGovernanceFormList()), []);

  const relatedByPolicyId = useMemo(() => {
    const map = new Map<string, RelatedRequirementSummary>();
    for (const view of views) {
      if (view.assignment.type !== 'policy_reading') continue;
      map.set(view.assignment.sourceId, {
        title: view.assignment.title,
        userFacingStatus: view.userFacingStatus,
        statusLabel: view.statusLabel,
      });
    }
    return map;
  }, [views]);

  const totalCount = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <div className="gbform-workspace">
      <header className="gbform-workspace-head">
        {onExit ? (
          <button type="button" className="gbform-back" onClick={onExit} aria-label="Return to Governing Body Office">
            <ArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
        ) : null}
        <div className="gbform-workspace-titles">
          <span className="gbform-kicker">
            <FileStack size={14} aria-hidden="true" />
            Annual Governance Forms
          </span>
          <h1>The Governing Body&rsquo;s form of record</h1>
          <p>
            Every attestation, log, and self-assessment the Governing Body signs or oversees, drawn directly from the
            canonical Forms Library — {totalCount} form{totalCount === 1 ? '' : 's'} across {groups.length} area
            {groups.length === 1 ? '' : 's'}.
          </p>
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="gbform-empty">No canonical GB forms resolved. Check the Forms Library dataset.</p>
      ) : (
        groups.map((group) => (
          <section key={group.domainCode} className="gbform-group" aria-labelledby={`gbform-group-${group.domainCode}`}>
            <h2 id={`gbform-group-${group.domainCode}`}>{group.label}</h2>
            <div className="gbform-grid">
              {group.entries.map((entry) => {
                const related = entry.matchedViaGbPolicies
                  .map((policyId) => relatedByPolicyId.get(policyId))
                  .find((r): r is RelatedRequirementSummary => !!r);
                return <GovernanceFormLaunchCard key={entry.id} entry={entry} relatedRequirement={related ?? null} />;
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
