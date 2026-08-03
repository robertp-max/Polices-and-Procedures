// Composes public + confidential executive-session minutes from a checklist
// of required items (each tagged confidential/public by the case author) so
// the record can never silently blend the two: an item tagged confidential
// only ever renders into the executive-session document, and the public
// document only ever shows that a session occurred plus its authorized
// public outcome.

import { useMemo } from 'react';
import { Check } from 'lucide-react';

export interface MinutesRequirementItem {
  id: string;
  text: string;
  required: boolean;
  /** true = executive-session-only content; false = belongs in the public minutes. */
  confidential: boolean;
}

export interface MinutesComposerProps {
  matterTitle: string;
  meetingDate: string;
  items: MinutesRequirementItem[];
  checkedIds: string[];
  onToggle: (id: string) => void;
  publicFreeText: string;
  onPublicFreeTextChange: (v: string) => void;
  confidentialFreeText: string;
  onConfidentialFreeTextChange: (v: string) => void;
  onCommit: () => void;
  committed?: boolean;
}

function ChecklistItem(props: { item: MinutesRequirementItem; checked: boolean; onToggle: () => void; disabled: boolean }) {
  const { item, checked, onToggle, disabled } = props;
  return (
    <button
      type="button"
      className={`bs-option${checked ? ' selected' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={checked}
    >
      <span className="bs-option-mark">{checked && <Check size={12} aria-hidden="true" />}</span>
      <span className="bs-option-text">
        {item.text}
        {item.required && <em style={{ color: 'var(--bs-bronze)', fontStyle: 'normal' }}> (required)</em>}
      </span>
    </button>
  );
}

export default function MinutesComposer(props: MinutesComposerProps) {
  const {
    matterTitle,
    meetingDate,
    items,
    checkedIds,
    onToggle,
    publicFreeText,
    onPublicFreeTextChange,
    confidentialFreeText,
    onConfidentialFreeTextChange,
    onCommit,
    committed = false,
  } = props;

  const publicItems = items.filter((i) => !i.confidential);
  const confidentialItems = items.filter((i) => i.confidential);
  const missingRequired = items.filter((i) => i.required && !checkedIds.includes(i.id));

  const publicPreview = useMemo(() => {
    const lines = publicItems.filter((i) => checkedIds.includes(i.id)).map((i) => `• ${i.text}`);
    if (publicFreeText.trim()) lines.push(`• ${publicFreeText.trim()}`);
    return lines;
  }, [publicItems, checkedIds, publicFreeText]);

  const confidentialPreview = useMemo(() => {
    const lines = confidentialItems.filter((i) => checkedIds.includes(i.id)).map((i) => `• ${i.text}`);
    if (confidentialFreeText.trim()) lines.push(`• ${confidentialFreeText.trim()}`);
    return lines;
  }, [confidentialItems, checkedIds, confidentialFreeText]);

  return (
    <div className="bs-boardtable" style={{ gap: 14 }}>
      <header>
        <p className="bs-kicker">Minutes Composer</p>
        <h3>{matterTitle}</h3>
        <p className="bs-prompt-text">Meeting date {meetingDate}. Select what belongs in each record — confidential content never appears in the public document.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <div className="bs-decision-prompt">
          <header><h3>Public Minutes</h3></header>
          <div className="bs-option-list">
            {publicItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                checked={checkedIds.includes(item.id)}
                onToggle={() => onToggle(item.id)}
                disabled={committed}
              />
            ))}
          </div>
          <div className="bs-motion-field">
            <label htmlFor="mc-public-text">Additional public-record text</label>
            <textarea
              id="mc-public-text"
              value={publicFreeText}
              onChange={(e) => onPublicFreeTextChange(e.target.value)}
              disabled={committed}
            />
          </div>
          <div className="bs-motion-summary">
            {publicPreview.length > 0 ? publicPreview.map((l, i) => <div key={i}>{l}</div>) : 'No public-minutes content selected yet.'}
          </div>
        </div>

        <div className="bs-decision-prompt">
          <header><h3>Confidential Executive-Session Minutes</h3></header>
          <div className="bs-option-list">
            {confidentialItems.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                checked={checkedIds.includes(item.id)}
                onToggle={() => onToggle(item.id)}
                disabled={committed}
              />
            ))}
          </div>
          <div className="bs-motion-field">
            <label htmlFor="mc-confidential-text">Additional confidential-record text</label>
            <textarea
              id="mc-confidential-text"
              value={confidentialFreeText}
              onChange={(e) => onConfidentialFreeTextChange(e.target.value)}
              disabled={committed}
            />
          </div>
          <div className="bs-motion-summary">
            {confidentialPreview.length > 0 ? confidentialPreview.map((l, i) => <div key={i}>{l}</div>) : 'No confidential-minutes content selected yet.'}
          </div>
        </div>
      </div>

      {missingRequired.length > 0 && (
        <div className="bs-contradiction" role="alert">
          <div>
            <strong>Required items not yet included</strong>
            <p>{missingRequired.map((i) => i.text).join('; ')}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="bs-rail-action"
        onClick={onCommit}
        disabled={committed || missingRequired.length > 0}
      >
        {committed ? 'Minutes Recorded' : 'Record Minutes'}
      </button>
    </div>
  );
}
