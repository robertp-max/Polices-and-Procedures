// Owner / deadline / effectiveness / return register for open CAPs, PIPs,
// and Board-directed actions. Renders read-only for historical/context
// items and editable for the current matter's open items, and flags a bare
// (unscoped) owner id the same way MotionBuilder does, since this is the
// other surface where the cross-quarter identity-collision defect
// (DQ-2026-001) can silently resurface.

import { AlertTriangle, CircleCheck, CircleHelp, CircleX } from 'lucide-react';

export type ActionRegisterStatus = 'open' | 'closed' | 'overdue';

export interface ActionRegisterItem {
  id: string;
  title: string;
  ownerId: string;
  dueDate: string;
  status: ActionRegisterStatus;
  /** null = not yet assessed. */
  effectivenessDemonstrated: boolean | null;
  returnDate: string | null;
  resources: string;
  formIds: string[];
  sourceExhibitIds: string[];
}

export interface ActionRegisterProps {
  items: ActionRegisterItem[];
  onUpdate?: (id: string, patch: Partial<ActionRegisterItem>) => void;
  readOnly?: boolean;
  onInspectEvidence?: (exhibitId: string) => void;
}

function isBareCrossQuarterId(id: string): boolean {
  const trimmed = id.trim();
  if (trimmed.length === 0) return false;
  return !trimmed.includes(':') && /MOCK-CLIN|CLIN-\d/i.test(trimmed);
}

export default function ActionRegister(props: ActionRegisterProps) {
  const { items, onUpdate, readOnly = false, onInspectEvidence } = props;

  return (
    <div className="bs-vote-matrix">
      <table>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">Owner</th>
            <th scope="col">Due</th>
            <th scope="col">Status</th>
            <th scope="col">Effectiveness</th>
            <th scope="col">Return date</th>
            <th scope="col">Resources</th>
            <th scope="col">Forms</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const bareOwner = isBareCrossQuarterId(item.ownerId);
            const canEdit = !readOnly && onUpdate;
            return (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  {item.sourceExhibitIds.length > 0 && (
                    <div style={{ marginTop: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {item.sourceExhibitIds.map((exId) => (
                        onInspectEvidence ? (
                          <button
                            key={exId}
                            type="button"
                            onClick={() => onInspectEvidence(exId)}
                            style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontSize: 9, color: 'var(--bs-bronze)', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            {exId}
                          </button>
                        ) : (
                          <span key={exId} style={{ fontSize: 9, color: 'var(--bs-muted)' }}>{exId}</span>
                        )
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  {canEdit ? (
                    <input
                      type="text"
                      value={item.ownerId}
                      onChange={(e) => onUpdate?.(item.id, { ownerId: e.target.value })}
                      style={{ width: 140, padding: '5px 7px', fontSize: 10.5, border: '1px solid var(--bs-line)', borderRadius: 5 }}
                    />
                  ) : (
                    item.ownerId
                  )}
                  {bareOwner && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, color: '#8a4020', fontSize: 8.5 }}>
                      <AlertTriangle size={10} aria-hidden="true" /> unscoped id
                    </div>
                  )}
                </td>
                <td>
                  {canEdit ? (
                    <input
                      type="date"
                      value={item.dueDate}
                      onChange={(e) => onUpdate?.(item.id, { dueDate: e.target.value })}
                      style={{ padding: '5px 7px', fontSize: 10.5, border: '1px solid var(--bs-line)', borderRadius: 5 }}
                    />
                  ) : (
                    item.dueDate
                  )}
                </td>
                <td>
                  <span className={`bs-badge val-${item.status === 'overdue' ? 'conflicting' : item.status === 'open' ? 'provisional' : 'validated'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <span title={item.effectivenessDemonstrated === null ? 'Not yet assessed' : item.effectivenessDemonstrated ? 'Demonstrated' : 'Not demonstrated'}>
                    {item.effectivenessDemonstrated === null ? (
                      <CircleHelp size={16} color="var(--bs-muted)" aria-hidden="true" />
                    ) : item.effectivenessDemonstrated ? (
                      <CircleCheck size={16} color="var(--bs-success)" aria-hidden="true" />
                    ) : (
                      <CircleX size={16} color="var(--bs-danger)" aria-hidden="true" />
                    )}
                  </span>
                </td>
                <td>
                  {canEdit ? (
                    <input
                      type="date"
                      value={item.returnDate ?? ''}
                      onChange={(e) => onUpdate?.(item.id, { returnDate: e.target.value || null })}
                      style={{ padding: '5px 7px', fontSize: 10.5, border: '1px solid var(--bs-line)', borderRadius: 5 }}
                    />
                  ) : (
                    item.returnDate ?? '—'
                  )}
                </td>
                <td style={{ maxWidth: 200, whiteSpace: 'normal' }}>{item.resources || '—'}</td>
                <td>{item.formIds.join(', ') || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
