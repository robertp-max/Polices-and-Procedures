// Structured motion clause builder: turns owner/due-date/effectiveness
// criteria/return-date/resources/forms clauses into one committed motion
// object (the shape graded by 'motion_builder' DecisionNodes — see
// data/q2Case.ts q2-n13) plus a plain-English summary for the Live Meeting
// Record. Deliberately does not free-text the whole motion — every clause
// is its own field so the record stays structured and comparable to the
// case's modelAction.

import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface MotionDraft {
  matter: string;
  ownerId: string;
  dueDate: string;
  effectivenessCriteria: string;
  returnDate: string;
  budgetAuthorized: boolean;
  resources: string;
  formIds: string[];
}

export function emptyMotionDraft(matter: string): MotionDraft {
  return {
    matter,
    ownerId: '',
    dueDate: '',
    effectivenessCriteria: '',
    returnDate: '',
    budgetAuthorized: false,
    resources: '',
    formIds: [],
  };
}

export interface MotionBuilderOwnerOption {
  id: string;
  label: string;
}

export interface MotionBuilderProps {
  matterTitle: string;
  availableForms: { id: string; label: string }[];
  ownerOptions?: MotionBuilderOwnerOption[];
  value: MotionDraft;
  onChange: (next: MotionDraft) => void;
  onCommit: (motion: MotionDraft) => void;
  committed?: boolean;
}

/** Flags a bare, unscoped clinician/owner id (e.g. "MOCK-CLIN-0027") that risks the
 *  cross-quarter identity-collision defect this case pack tests (DQ-2026-001). */
function isBareCrossQuarterId(id: string): boolean {
  const trimmed = id.trim();
  if (trimmed.length === 0) return false;
  return !trimmed.includes(':') && /MOCK-CLIN|CLIN-\d/i.test(trimmed);
}

export default function MotionBuilder(props: MotionBuilderProps) {
  const { matterTitle, availableForms, ownerOptions, value, onChange, onCommit, committed = false } = props;

  const bareOwnerWarning = isBareCrossQuarterId(value.ownerId);

  const summary = useMemo(() => {
    const parts: string[] = [`Motion: ${value.matter || matterTitle}.`];
    if (value.ownerId) parts.push(`Owner: ${value.ownerId}.`);
    if (value.dueDate) parts.push(`Due: ${value.dueDate}.`);
    if (value.effectivenessCriteria) parts.push(`Effectiveness criterion: ${value.effectivenessCriteria}`);
    if (value.returnDate) parts.push(`Return date: ${value.returnDate}.`);
    parts.push(value.budgetAuthorized ? `Resources authorized: ${value.resources || 'as requested'}.` : 'No budget/resource authorization included.');
    if (value.formIds.length > 0) parts.push(`Forms: ${value.formIds.join(', ')}.`);
    return parts.join(' ');
  }, [value, matterTitle]);

  function toggleForm(id: string) {
    const next = value.formIds.includes(id) ? value.formIds.filter((f) => f !== id) : [...value.formIds, id];
    onChange({ ...value, formIds: next });
  }

  return (
    <div className="bs-rail-card">
      <header>
        <strong>Motion Builder</strong>
      </header>
      <div className="bs-motion-builder">
        <div className="bs-motion-field">
          <label htmlFor="mb-matter">Matter</label>
          <input
            id="mb-matter"
            type="text"
            value={value.matter}
            onChange={(e) => onChange({ ...value, matter: e.target.value })}
            placeholder={matterTitle}
            disabled={committed}
          />
        </div>

        <div className="bs-motion-field">
          <label htmlFor="mb-owner">Owner</label>
          {ownerOptions && ownerOptions.length > 0 ? (
            <select
              id="mb-owner"
              value={value.ownerId}
              onChange={(e) => onChange({ ...value, ownerId: e.target.value })}
              disabled={committed}
            >
              <option value="">Select the accountable owner…</option>
              {ownerOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              id="mb-owner"
              type="text"
              value={value.ownerId}
              onChange={(e) => onChange({ ...value, ownerId: e.target.value })}
              placeholder="e.g. Q2:MOCK-CLIN-0026 (quarter-scoped id)"
              disabled={committed}
            />
          )}
          {bareOwnerWarning && (
            <p className="bs-supplemental-flag" role="alert" style={{ marginTop: 4 }}>
              <AlertTriangle size={12} aria-hidden="true" /> This id has no quarter scope — cross-quarter
              MOCK-CLIN ids are reused for different people. Reference the owner as e.g. "Q2:MOCK-CLIN-0026".
            </p>
          )}
        </div>

        <div className="bs-motion-field">
          <label htmlFor="mb-due">Due date</label>
          <input
            id="mb-due"
            type="date"
            value={value.dueDate}
            onChange={(e) => onChange({ ...value, dueDate: e.target.value })}
            disabled={committed}
          />
        </div>

        <div className="bs-motion-field">
          <label htmlFor="mb-effectiveness">Effectiveness criteria</label>
          <textarea
            id="mb-effectiveness"
            value={value.effectivenessCriteria}
            onChange={(e) => onChange({ ...value, effectivenessCriteria: e.target.value })}
            placeholder="State the measurable, sustained standard that must be met…"
            disabled={committed}
          />
        </div>

        <div className="bs-motion-field">
          <label htmlFor="mb-return">Return date</label>
          <input
            id="mb-return"
            type="date"
            value={value.returnDate}
            onChange={(e) => onChange({ ...value, returnDate: e.target.value })}
            disabled={committed}
          />
        </div>

        <div className="bs-motion-field">
          <label htmlFor="mb-budget">Budget / resource authorization</label>
          <div className="bs-disposition-chips">
            <button
              type="button"
              className={`bs-chip${value.budgetAuthorized ? ' selected' : ''}`}
              aria-pressed={value.budgetAuthorized}
              onClick={() => onChange({ ...value, budgetAuthorized: !value.budgetAuthorized })}
              disabled={committed}
            >
              {value.budgetAuthorized ? 'Resources authorized' : 'No resource authorization'}
            </button>
          </div>
        </div>

        {value.budgetAuthorized && (
          <div className="bs-motion-field">
            <label htmlFor="mb-resources">Requested resources</label>
            <textarea
              id="mb-resources"
              value={value.resources}
              onChange={(e) => onChange({ ...value, resources: e.target.value })}
              placeholder="e.g. 0.5 FTE quality-review staffing plus a documentation-audit tool license"
              disabled={committed}
            />
          </div>
        )}

        {availableForms.length > 0 && (
          <div className="bs-motion-field">
            <label id="mb-forms-label">Forms required</label>
            <div className="bs-motion-forms" role="group" aria-labelledby="mb-forms-label">
              {availableForms.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`bs-chip${value.formIds.includes(f.id) ? ' selected' : ''}`}
                  aria-pressed={value.formIds.includes(f.id)}
                  onClick={() => toggleForm(f.id)}
                  disabled={committed}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bs-motion-summary">{summary}</div>

        <button
          type="button"
          className="bs-rail-action"
          onClick={() => onCommit(value)}
          disabled={committed || !value.ownerId || !value.dueDate}
        >
          {committed ? 'Motion Recorded' : 'Record Motion'}
        </button>
      </div>
    </div>
  );
}
